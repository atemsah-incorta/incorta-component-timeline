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
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

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
        min: Math.min(...raw.map(e => e.start))
      }
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        filter: (item: any) => item.raw
      }
    },
    interaction: {
      mode: 'index' as const,
      axis: 'y' as const
    },
    animation: { duration: 0 }
  }

  return <Bar data={chartData} options={chartOptions} />;
};

export default Timeline;