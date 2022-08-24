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
        
        // Grouping entries with the same label
        const sets = {}
        labels.forEach(label => sets[label] = [])
        this.data.forEach(e => sets[e.value].push([e.start, e.end]))
        
        //Filling entries with nulls to match most occuring label
        const maxOccurencesInSet = Math.max(...labels.map(label => sets[label].length))
        labels.forEach(label => {
            for (var i = sets[label].length; i < maxOccurencesInSet; ++i) { 
                sets[label].push(null)
            }
        })

        const colors: string[] = []
        for (var i = 0; i < labels.length; ++i) {
            colors.push(this.colors[i % this.colors.length])
        }

        const dataSets = []
        for (var i = 0; i < maxOccurencesInSet; ++i) {
            dataSets.push(
                {
                    label: '',
                    data: labels.map(label => sets[label][i]),
                    backgroundColor: colors,
                    minBarLength: 2
                }
            )
        }

        return { labels: labels, dataSets: dataSets }
    }
}

export class WaterfallTimelineMapper extends DataSetMapper {
    generate(): TimelineDataSet {
        const labels = this.data.map(e => e.value)

        const dataSets = [{
            label: '',
            data: this.data.map(e => [e.start, e.end]),
            backgroundColor: [this.colors[0]],
            minBarLength: 2
        }]

        return { labels: labels, dataSets: dataSets }
    }
}