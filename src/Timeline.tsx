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

import { DataSetEntry, DataSetMapper, getMapper } from './DataSetMapper'

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
    const mapped: DataSetEntry = {
      start: new Date(entry[0].value).getTime(),
      end: new Date(entry[1].value).getTime(),
      label: entry[2].value,
      tooltip: [`${entry[0].formatted} → ${entry[1].formatted}`]
    }

    const bindings = context.component.bindings || {}

    // Optional color tray
    if (bindings['tray-color']?.length > 0) { mapped.color = entry[3].value }

    //Optional tooltip tray
    if (bindings['tray-tooltip']?.length > 0) {
      mapped.tooltip?.push(...entry.slice(3 + bindings['tray-color']?.length).map(e => e.value))
    }

    return mapped;
  })
  .filter(o => o.start < o.end) //Remove weird cases where start > end
  .sort((a, b) => a.start - b.start) //Ensure chronological order by sorting on start

  const mapper: DataSetMapper = getMapper(settings?.mode, raw, pallete);
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
      legend: { 
        display: true,
        labels: {
          generateLabels() {
            return mappedSet.legends.map(l => { return { text: l.label, fillStyle: l.color , strokeStyle: l.color }})
          } 
        }
      },
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