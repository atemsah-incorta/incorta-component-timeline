export interface DataSetEntry {
    start: number;
    end: number;
    label: string;
    color?: string;
    tooltip?: string[];
}

export interface TimelineDataSet {
    labels: string[];
    legends: { label: string; color: string; }[];
    dataSets: { label: string, data: any[], backgroundColor?: string[], minBarLength: number }[]
}

export abstract class DataSetMapper {
    data: DataSetEntry[]
    colors: string[]

    constructor(data: DataSetEntry[], colors: string[]) {
        this.data = data
        this.colors = colors
    }

    abstract generate(): TimelineDataSet
}

export function getMapper(mode: string, data: DataSetEntry[], colors: string[]): DataSetMapper {
    const mapper = {
        "gantt": () => { return new GanttTimelineMapper(data, colors) },
        "default": () => { return new GroupedTimelineMapper(data, colors) }
    }

    return (mapper[mode] || mapper["default"])();
}

export class GroupedTimelineMapper extends DataSetMapper {
    generate(): TimelineDataSet {
        // Getting unique labels
        const labels = this.data.map(e => e.label).filter((v, i, a) => a.indexOf(v) === i)

        const colorBy = (entry: DataSetEntry) => { return entry.color || entry.label }
        const colorDims = this.data.map(e => colorBy(e)).filter((v, i, a) => a.indexOf(v) === i)

        const colors = {}
        for (var i = 0; i < colorDims.length; ++i) {
            colors[colorDims[i]] = this.colors[i % this.colors.length]
        }

        const legends = Object.keys(colors).map(key => { return { label: key, color: colors[key] } })

        const dataSets = [{
            label: '',
            data: this.data.map(e => { return { x: [e.start, e.end], y: e.label, tooltip: e.tooltip } }),
            backgroundColor: this.data.map(e => colors[colorBy(e)]),
            minBarLength: 2
        }]

        return { labels: labels, dataSets: dataSets, legends: legends }
    }
}

export class GanttTimelineMapper extends DataSetMapper {
    generate(): TimelineDataSet {
        // Getting unique labels
        const labels = this.data.map(e => e.label).filter((v, i, a) => a.indexOf(v) === i)

        const colorBy = (entry: DataSetEntry) => { return entry.color || entry.label }
        const colorDims = this.data.map(e => colorBy(e)).filter((v, i, a) => a.indexOf(v) === i)

        const colors = {}
        for (var i = 0; i < colorDims.length; ++i) {
            colors[colorDims[i]] = this.colors[i % this.colors.length]
        }

        const legends = Object.keys(colors).map(key => { return { label: key, color: colors[key] } })

        const dataSets = [{
            label: '',
            data: this.data.map(e => { return { x: [e.start, e.end], y: e.label, tooltip: e.tooltip } }),
            backgroundColor: this.data.map(e => colors[colorBy(e)]),
            minBarLength: 2
        }]

        return { labels: this.data.map(e => e.label), dataSets: dataSets, legends: legends }
    }
}