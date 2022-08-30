import React from 'react';

import { 
    differenceInMilliseconds,
    differenceInSeconds,
    differenceInMinutes,
    differenceInHours,
    differenceInDays,
    differenceInWeeks,
    differenceInMonths,
    differenceInQuarters,
    differenceInYears
} from 'date-fns'

export function diff(max: number, min: number, unit: string) {
    switch (unit) {
        case 'millisecond': return differenceInMilliseconds(max, min);
        case 'second': return differenceInSeconds(max, min);
        case 'minute': return differenceInMinutes(max, min);
        case 'hour': return differenceInHours(max, min);
        case 'day': return differenceInDays(max, min);
        case 'week': return differenceInWeeks(max, min);
        case 'month': return differenceInMonths(max, min);
        case 'quarter': return differenceInQuarters(max, min);
        case 'year': return differenceInYears(max, min);
        default: return 0;
    }
}

export function isValidTimeScale(max: number, min: number, unit: string): boolean {
    return diff(max, min, unit) <= 100000
}

export function ErrorNode(error: string) { return <div className='error-wrapper'>{error}</div> }