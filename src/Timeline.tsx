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

  // Mapping the query response to a more usable state 
  const raw: DataSetEntry[] = data.data.map(entry => {
    return {
      "start": new Date(entry[0].value).getTime(),
      "end": new Date(entry[1].value).getTime(),
      "value": entry[2].value,
    }
  })
  .filter(o => o.start < o.end) //Remove weird cases where start > end
  .sort((a, b) => a.start - b.start) //Ensure chronological order by sorting on start

  const mapper: DataSetMapper = context.component.settings?.isWaterfall ? new WaterfallTimelineMapper(raw, pallete) : new GroupedTimelineMapper(raw, pallete)
  const mappedSet = mapper.generate()

  const chartData = {
    labels: mappedSet.labels,
    datasets: mappedSet.dataSets
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
          unit: 'day' as const,
          displayFormats: { day: 'yyyy-MM-dd' }
        }
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any): string => {
            const start = format(new Date(ctx.parsed._custom.start), 'yyyy-MM-dd HH:mm:ss')
            const end = format(new Date(ctx.parsed._custom.end), 'yyyy-MM-dd HH:mm:ss')
            return start + " to " + end
          }
        }
      }
    },
    animation: { duration: 0 }
  }

  return <Bar data={chartData} options={chartOptions} />;
};

export default Timeline;