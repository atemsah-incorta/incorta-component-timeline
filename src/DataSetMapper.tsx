export interface DataSetEntry {
    start: number;
    end: number;
    value: string;
}

export interface TimelineDataSet {
    labels: string[];
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

export class GroupedTimelineMapper extends DataSetMapper {
    generate(): TimelineDataSet {
        // Getting unique labels
        const labels = this.data.map(e => e.value).filter((v, i, a) => a.indexOf(v) === i)

        const colors = {}
        for (var i = 0; i < labels.length; ++i) {
            colors[labels[i]] = this.colors[i % this.colors.length]
        }

        const dataSets = [{
            label: '',
            data: this.data.map(e => { return { x: [e.start, e.end], y: e.value } }),
            backgroundColor: this.data.map(e => colors[e.value]),
            minBarLength: 2
        }]

        return { labels: labels, dataSets: dataSets }
    }
}

export class WaterfallTimelineMapper extends DataSetMapper {
    generate(): TimelineDataSet {
        // Getting unique labels
        const labels = this.data.map(e => e.value).filter((v, i, a) => a.indexOf(v) === i)

        const colors = {}
        for (var i = 0; i < labels.length; ++i) {
            colors[labels[i]] = this.colors[i % this.colors.length]
        }

        const dataSets = [{
            label: '',
            data: this.data.map(e => [e.start, e.end]),
            backgroundColor: this.data.map(e => colors[e.value]),
            minBarLength: 2
        }]

        return { labels: this.data.map(e => e.value), dataSets: dataSets }
    }
}