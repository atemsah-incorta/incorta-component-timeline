import {
  AppliedPrompts,
  Context,
  onDrillDownFunction,
  ResponseData,
  TContext
} from '@incorta-org/component-sdk';

import React from 'react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

import { format } from 'date-fns'
import 'chartjs-adapter-date-fns';

import { DataSetEntry, DataSetMapper, GroupedTimelineMapper, WaterfallTimelineMapper } from './DataSetMapper'

interface Props {
  context: Context<TContext>;
  prompts: AppliedPrompts;
  data: ResponseData;
  drillDown: onDrillDownFunction;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

const Timeline = ({ context, prompts, data, drillDown }: Props) => {
  
  const pallete = context.app.color_palette
  const settings = context.component.settings

  const isValidFormat = (f: string): boolean => {
    try { format(new Date(), settings?.format) } catch (error) { return false }
    return true
  }

  // Mapping the query response to a more usable state 
  const raw: DataSetEntry[] = data.data.map(entry => {
    return {
      start: new Date(entry[0].value).getTime(),
      end: new Date(entry[1].value).getTime(),
      label: entry[2].value,
      tooltip: entry.length > 3 ? entry.slice(3).map(e => e.value) : [`${entry[0].formatted} → ${entry[1].formatted}`]
    }
  })
  .filter(o => o.start < o.end) //Remove weird cases where start > end
  .sort((a, b) => a.start - b.start) //Ensure chronological order by sorting on start

  const mapper: DataSetMapper = settings?.isWaterfall ? new WaterfallTimelineMapper(raw, pallete) : new GroupedTimelineMapper(raw, pallete)
  const mappedSet = mapper.generate()

  const chartData = {
    labels: mappedSet.labels,
    datasets: mappedSet.dataSets
  }

  const useCustomFormat = isValidFormat(settings?.format)
  const customDisplayFormats = {
    millisecond: settings?.format,
    second: settings?.format,
    minute: settings?.format,
    hour: settings?.format,
    day: settings?.format,
    week: settings?.format,
    month: settings?.format,
    quarter: settings?.format,
    year: settings?.format
  }

  const timeAxisOptions = {
    unit: settings?.unit === "default" ? false : settings?.unit
  }

  const chartOptions = {
    indexAxis: 'y' as const,
    scales: {
      y: {
        stacked: true
      },
      x: {
        min: Math.min(...raw.map(e => e.start)),
        type: 'time' as const,
        parsing: false,
        time: {
          unit: settings?.unit === "default" ? false : context.component.settings?.unit,
          ...(useCustomFormat) && { displayFormats: customDisplayFormats }
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        displayColors: false,
        callbacks: {
          label: (ctx: any): string => { return ctx.raw.tooltip }
        }
      }
    },
    animation: { duration: 0 },
    responsive: true,
    maintainAspectRatio: false
  }

  return <Bar data={chartData} options={chartOptions} />;
};

export default Timeline;