import { useEffect, useMemo, useState } from "react"
import { TransactionData } from "../../utilities/DataObject"
import { MONTHS, getNumberOfDaysInMonth } from "./months"
import * as d3 from 'd3'

import assert from "assert";
import TableView from "../TableView/TableView";
import { PieDayViewProps, pieCalendarViewValueGetter, PieDayView, PieCalendarViewSharedScales, PieCalendarViewValueGetter } from "./DayViews/PieDayView";
import { barCalendarViewValueGetter, BarCalendarViewSharedScales, BarCalendarViewValueGetter, BarDayViewProps, BarDayView } from "./DayViews/BarDayView";
import { PublicScale, PublicValueGetter } from "../../utilities/types";
import { useAppDispatch, useAppSelector } from "@/app/hooks";

import * as calendarViewSlice from './calendarViewSlice'
import * as barDayViewSlice from './DayViews/barDayViewSlice'
import { useCategoryColourScale } from "../../hooks/useColourScales";
import * as interactivitySlice from "../Interactivity/interactivitySlice";
import { useTransactionDataArr } from "../../hooks/useTransactionData";
import { useHighLightedCalendarDayBorderMMDDSet } from "./useCalendarDayHighlightInfo";

import styles from './styles.module.css'

type HighLightedTransactionNumberSet = Set<TransactionData['transactionNumber']>
type TransactionDataMapYMD = d3.InternMap<number, d3.InternMap<number, d3.InternMap<number, TransactionData[]>>>
type TransactionDataMapMD = d3.InternMap<number, d3.InternMap<number, TransactionData[]>>
type TransactionAmountSumMapByDayYMD = d3.InternMap<number, d3.InternMap<number, d3.InternMap<number, number>>> // used for cacheing, so when need the sum of the day, no need to search through the transactionDataArr
type TransactionAmountSumMapByDayMD = d3.InternMap<number, d3.InternMap<number, number>> // used for cacheing, so when need the sum of the day, no need to search through the transactionDataArr
export type Data = {
    transactionDataMapYMD: TransactionDataMapYMD;
    transactionDataMapMD: TransactionDataMapMD;
    highLightedTransactionNumberSetByBrusher: HighLightedTransactionNumberSet;
    transactionAmountSumMapByDayYMD: TransactionAmountSumMapByDayYMD
    transactionAmountSumMapByDayMD: TransactionAmountSumMapByDayMD
}

type CalendarViewProps = {
    transactionDataArr: TransactionData[];
    highLightedTransactionNumberSetByBrusher: HighLightedTransactionNumberSet;
    initCurrentYear: number;
    // heightScaleType: 'log' | 'linear',
    colourScale: PublicScale['colourScale']
    colourValueGetter: PublicValueGetter['colour']
};

export type Day = {
    day: number;
    month: number;
    year: number;
};

export default function CalendarView3(props:
    CalendarViewProps) {
    const transactionDataArr = useTransactionDataArr()
    const colourScale = useCategoryColourScale()
    const isSuperPositioned = useAppSelector(calendarViewSlice.selectIsSuperPositioned);
    const highLightedTransactionNumberSetByBrusher = useAppSelector(interactivitySlice.selectSelectedTransactionNumberSetMemorised)
    // config
    const currentContainerHeight = useAppSelector(calendarViewSlice.selectCurrentContainerHeight)
    const currentContainerWidth = useAppSelector(calendarViewSlice.selectCurrentContainerWidth)
    const detailDay = useAppSelector(calendarViewSlice.selectDetailDay)
    const currentYear = useAppSelector(calendarViewSlice.selectCurrentYear)
    const dispatch = useAppDispatch()

    // used when user click a day cell
    function handleShowDayDetail(day: number, month: number, year: number) {
        dispatch(calendarViewSlice.setDetailDay({ day: day, month: month, year: year }))
    }

    // used for cache, no need to loop through the entire transactionDataArr in O(n), we can get the data of a day in O(1)
    const transactionDataMapYMD: TransactionDataMapYMD = useMemo(() => {
        return d3.group(transactionDataArr, d => d.date.getFullYear(), d => d.date.getMonth() + 1, d => d.date.getDate())
    }, [transactionDataArr])
    const transactionAmountSumMapByDayYMD = useMemo(() => {
        return getGroupedTransactionAmountMapYMD(transactionDataArr)
    }, [transactionDataArr])
    const transactionDataMapMD: TransactionDataMapMD = useMemo(() => {
        return d3.group(transactionDataArr, d => d.date.getMonth() + 1, d => d.date.getDate())
    }, [transactionDataArr])
    const transactionAmountSumMapByDayMD = useMemo(() => {
        return getGroupedTransactionAmountMapMD(transactionDataArr)
    }, [transactionDataArr])

    // for highlight the border of glyphs, // mm-dd: '1-1' means jan first; it wont be '0x-0x'.
    // use mm-dd string because it is hashable.
    // I assert that it would be emply only if selectedTransactionNumberSet is empty. which means no there is no selection 
    const highLightedCalendarDayBorderMMDDSet = useHighLightedCalendarDayBorderMMDDSet()// usememo based on transactionDataArr, selectedTransactionNumberSet, isSuperPositioned, currentYear
    // high light the border of mm's month and dd's day 

    // used for pie glyph's radius
    const { linearRadiusScale, logRadiusScale } = useMemo(() => {
        let groupedData: [number, number, number, number][] | [number, number, number][] = [] // // [year, month, day, sumTransactionAmountOfDay] or // [month, day, sumTransactionAmountOfDayForEachYear]
        let radiusMinDomain: number | undefined // if isSuperpositioned = true, it is the sum of data for all a day of all the year; else for each year 
        let radiusMaxDomain: number | undefined // if isSuperpositioned = true, it is the sum of data for all a day of all the year; else for each year 
        if (isSuperPositioned) {
            groupedData = getFlatGroupedTransactionAmountByDaySuperpositionedYear(transactionDataArr) // [month, day, sumTransactionAmountOfDayForEachYear]
            const d = d3.extent(groupedData, d => d[2])
            radiusMinDomain = d[0]
            radiusMaxDomain = d[1]
        } else {
            groupedData = getFlatGroupedTransactionAmountByDay(transactionDataArr); // [year, month, day, sumTransactionAmountOfDay]
            const d = d3.extent(groupedData, d => d[3])
            radiusMinDomain = d[0]
            radiusMaxDomain = d[1]
        }

        if (radiusMinDomain === undefined || radiusMaxDomain === undefined) {
            return { linearRadiusScale: null, logRadiusScale: null }
        } else {
            const linearRadiusScale = d3.scaleLinear().domain([radiusMinDomain, radiusMaxDomain]).range([0, currentContainerWidth > currentContainerHeight ? currentContainerHeight : currentContainerWidth])
            const logRadiusScale = d3.scaleLog().domain([radiusMinDomain, radiusMaxDomain]).range([0, currentContainerWidth])
            return { linearRadiusScale, logRadiusScale }
        }
    }, [transactionDataArr, currentContainerWidth, currentContainerHeight, isSuperPositioned])

    if (transactionDataArr.length === 0 || linearRadiusScale === null || logRadiusScale === null) {
        return <div>loading</div>
    }
    const data: Data = useMemo(() => {
        return {
            transactionDataMapYMD: transactionDataMapYMD,
            transactionDataMapMD: transactionDataMapMD,
            highLightedTransactionNumberSetByBrusher: highLightedTransactionNumberSetByBrusher,
            transactionAmountSumMapByDayYMD: transactionAmountSumMapByDayYMD,
            transactionAmountSumMapByDayMD: transactionAmountSumMapByDayMD
        }
    },
        [transactionDataMapYMD, transactionDataMapMD, highLightedTransactionNumberSetByBrusher, transactionAmountSumMapByDayYMD, transactionAmountSumMapByDayMD])

    // create public height scale for the bar glyph, and pie glyph
    const heightDomain = d3.extent(transactionDataArr, barCalendarViewValueGetter.height); // height for bar glyph
    assert(heightDomain[0] !== undefined && heightDomain[1] !== undefined);
    const heightScaleLinear: BarCalendarViewSharedScales['heightScaleLinear'] = d3.scaleLinear(heightDomain, [0, currentContainerHeight]);
    const heightScaleLog: BarCalendarViewSharedScales['heightScaleLog'] = d3.scaleLog(heightDomain, [0, currentContainerHeight]);
    const barCalendarViewSharedScales: BarCalendarViewSharedScales = { heightScaleLinear, heightScaleLog, colourScale } // colourScale shared with other views

    // calculate maxTransactionCountOfDay and update the stores value
    const { maxTransactionCountOfDay, maxTransactionCountOfDaySuperpositioned } = useMemo(() => {
        const countTransactionArr = d3.flatRollup(transactionDataArr, d => d.length, d => d.date);
        const maxTransactionCountOfDay = d3.max(countTransactionArr, d => d[1])
        const countTransactionArrSuperpositioned = d3.flatRollup(transactionDataArr, d => d.length, d => d.date.getMonth() + 1, d => d.date.getDate())
        const maxTransactionCountOfDaySuperpositioned = d3.max(countTransactionArrSuperpositioned, d => d[2])
        if (maxTransactionCountOfDay === undefined || maxTransactionCountOfDaySuperpositioned === undefined) {
            throw new Error('invalid maxTransactionCountOfDay, it must be number, but it is undefined')
        }
        return { maxTransactionCountOfDay, maxTransactionCountOfDaySuperpositioned }
    }, [transactionDataArr, isSuperPositioned])
    useEffect(() => {
        dispatch(barDayViewSlice.setMaxTransactionCountOfDay(maxTransactionCountOfDay))
    }, [maxTransactionCountOfDay])
    useEffect(() => {
        dispatch(barDayViewSlice.setMaxTransactionCountOfDaySuperpositioned(maxTransactionCountOfDaySuperpositioned))
    }, [maxTransactionCountOfDaySuperpositioned])

    // public scales for pie :
    const pieCalendarViewSharedScales: PieCalendarViewSharedScales = { colourScale, linearRadiusScale, logRadiusScale }
    console.log('calendarview colourscale 1', colourScale.getColour('Savings'))

    return (
        <>
            <table className="smallLetterTable">
                <thead>
                    <tr>
                        <td></td>
                        {(Array.from(Array(31).keys())).map(i => <td key={i + 1} style={{ color: detailDay && detailDay.day === i + 1 && detailDay.year === currentYear ? 'red' : 'black' }}>{i + 1}</td>)}
                    </tr>
                </thead>
                <tbody>
                    {MONTHS.map((_, i) => <MonthView month={i + 1} currentYear={currentYear}
                        key={i + 1} data={data}
                        barDayViewScales={barCalendarViewSharedScales}
                        barDayViewValueGetter={barCalendarViewValueGetter}
                        pieDayViewScales={pieCalendarViewSharedScales}
                        pieDayViewValueGetter={pieCalendarViewValueGetter}
                        onShowDayDetail={handleShowDayDetail}
                        detailDay={detailDay}
                        dayViewContainerSize={{
                            containerWidth: currentContainerWidth,
                            containerHeight: currentContainerHeight
                        }}
                        highLightedCalendarDayBorderMMDDSet={highLightedCalendarDayBorderMMDDSet}
                    />)}
                </tbody>
            </table>
        </ >
    )
}


type MonthViewProps = {
    month: number,
    currentYear: number,
    /**
     * data of all the transactions and a map store the transaction number of the highlighted transaction
     */
    data: Data,
    barDayViewScales: BarCalendarViewSharedScales,
    barDayViewValueGetter: BarCalendarViewValueGetter,
    pieDayViewScales: PieCalendarViewSharedScales,
    pieDayViewValueGetter: PieCalendarViewValueGetter,
    onShowDayDetail: (day: number, month: number, year: number) => void,
    detailDay: Day | null,
    dayViewContainerSize: { containerWidth: number, containerHeight: number }
    highLightedCalendarDayBorderMMDDSet: Set<string>
} & {

}

function MonthView(props: MonthViewProps) {
    const { month, currentYear, detailDay, onShowDayDetail, highLightedCalendarDayBorderMMDDSet } = props
    const glyphType = useAppSelector(calendarViewSlice.selectGlyphType)
    const isSuperPositioned = useAppSelector(calendarViewSlice.selectIsSuperPositioned)
    function handleShowDayDetail(day: number) {
        onShowDayDetail(day, month, currentYear);
    }
    const numberOfDaysInMonth = getNumberOfDaysInMonth(isSuperPositioned ? 2016 : currentYear, month)
    // month: 1to12 
    return (<tr className={styles.monthrow}>
        <td style={{ color: detailDay && detailDay.month === month && detailDay.year === currentYear ? 'red' : 'black' }}>{MONTHS[month - 1]}</td>

        {

            // 'isSuperPositioned ? 2016 : currentYear' is for use big year to show all the data
            (Array.from(Array(31).keys())).map(i => {
                const hasDay = i < numberOfDaysInMonth;
                const isDetailDay = detailDay !== null && detailDay.day === i + 1 && detailDay.month === month && detailDay.year === currentYear;
                const isDayHasSelectedTransaction = highLightedCalendarDayBorderMMDDSet.has(`${month}-${i + 1}`)
                const barDayViewProps: BarDayViewProps = {
                    day: i + 1, ...props,
                    scales: props.barDayViewScales,
                    valueGetter: props.barDayViewValueGetter,
                    containerSize: props.dayViewContainerSize,
                }
                const pieDayViewProps: PieDayViewProps = {
                    day: i + 1, ...props,
                    scales: props.pieDayViewScales,
                    valueGetter: props.pieDayViewValueGetter,
                    containerSize: props.dayViewContainerSize,
                }
                let dayView;
                if (hasDay) {
                    dayView = glyphType === 'pie' ? <PieDayView {...pieDayViewProps} /> : <BarDayView {...barDayViewProps} />
                } else {
                    dayView = <div style={{
                        //reference: https://www.jianshu.com/p/4278f70c2721
                        background: 'repeating-linear-gradient(60deg, white, gray, white, gray, white, gray, white, gray, white, gray, white, gray, white, gray)',
                        width: props.dayViewContainerSize.containerWidth, height: props.dayViewContainerSize.containerHeight
                    }}></div>
                }
                return <td onClick={() => handleShowDayDetail(i + 1)} style={{ padding: '0px' }} >
                    <div key={`${month}-${i + 1}`}
                        style={{ zIndex: isDayHasSelectedTransaction ? 900 : 800, borderColor: isDayHasSelectedTransaction ? 'blue' : isDetailDay ? 'red' : 'RGB(200,200,200)' }}
                    >
                        {dayView}
                    </div>

                </td>
            })}
    </tr >)

}


// the following function are used for getting data of each day in constant time
// function whose name like ...MD() is for superpositioned view
// function whose name like ...YMD() is for page-based view 
/**
 * get the data in O(1)
 * @param transactionDataMapYMD 
 * @param year number of year
 * @param month 1to12
 * @param day 1to31
 * @returns an array of TransactionData object
 */
export function getDataFromTransactionDataMapYMD(transactionDataMapYMD: TransactionDataMapYMD, day: number, month: number, year: number,): TransactionData[] {
    if (month < 1 || month > 12) { throw new Error(`invalid month: ${month}, should be 1<=month<=12`,); }
    if (day < 1 || day > 31) { throw new Error(`invalid day: ${day}, should be 1<=day<=31`,); }

    const currYearData = transactionDataMapYMD.get(year)
    // console.log('currYearData:', currYearData)
    if (currYearData === undefined) { return [] }
    const currMonthData = currYearData.get(month);
    // console.log('currMonthData:', currMonthData)
    if (currMonthData === undefined) { return [] }
    const currDayData = currMonthData.get(day);
    // console.log('currDayData:', currDayData)
    return currDayData === undefined ? [] : currDayData;
}


/**
 * get the data in O(1)
 * @param transactionDataMapMD 
 * @param month 1to12
 * @param day 1to31
 * @returns an array of TransactionData object
 */
export function getDataFromTransactionDataMapMD(transactionDataMapMD: TransactionDataMapMD, day: number, month: number): TransactionData[] {
    if (month < 1 || month > 12) { throw new Error(`invalid month: ${month}, should be 1<=month<=12`,); }
    if (day < 1 || day > 31) { throw new Error(`invalid day: ${day}, should be 1<=day<=31`,); }

    const currMonthData = transactionDataMapMD.get(month);
    // console.log('currMonthData:', currMonthData)
    if (currMonthData === undefined) { return [] }
    const currDayData = currMonthData.get(day);
    // console.log('currDayData:', currDayData)
    return currDayData === undefined ? [] : currDayData;
}

/**
 * get the data in O(1)
 * @param transactionAmountSumMapByDayYMD 
 * @param year number of year
 * @param month 1to12
 * @param day 1to31
 * @returns an the data, 0 if not found
 */
export function getDataFromTransactionAmountSumByDayYMD(transactionAmountSumMapByDayYMD: TransactionAmountSumMapByDayYMD, day: number, month: number, year: number,): number {
    if (month < 1 || month > 12) { throw new Error(`invalid month: ${month}, should be 1<=month<=12`,); }
    if (day < 1 || day > 31) { throw new Error(`invalid day: ${day}, should be 1<=day<=31`,); }

    const currYearData = transactionAmountSumMapByDayYMD.get(year)
    // console.log('currYearData:', currYearData)
    if (currYearData === undefined) { return 0 }
    const currMonthData = currYearData.get(month);
    // console.log('currMonthData:', currMonthData)
    if (currMonthData === undefined) { return 0 }
    const currDayData = currMonthData.get(day);
    // console.log('currDayData:', currDayData)
    return currDayData === undefined ? 0 : currDayData;
}

/**
 * get the data in O(1)
 * @param transactionAmountSumMapByDayMD 
 * @param month 1to12
 * @param day 1to31
 * @returns an the data, 0 if not found
 */
export function getDataFromTransactionAmountSumByDayMD(transactionAmountSumMapByDayMD: TransactionAmountSumMapByDayMD, day: number, month: number): number {
    if (month < 1 || month > 12) { throw new Error(`invalid month: ${month}, should be 1<=month<=12`,); }
    if (day < 1 || day > 31) { throw new Error(`invalid day: ${day}, should be 1<=day<=31`,); }

    const currMonthData = transactionAmountSumMapByDayMD.get(month)
    // console.log('currMonthData:', currMonthData)
    if (currMonthData === undefined) { return 0 }
    const currDayData = currMonthData.get(day);
    // console.log('currDayData:', currDayData)
    return currDayData === undefined ? 0 : currDayData;
}

/**
 * rollup the data by transactionAmount's sum of each day, return a flat array for each day
 * @param transactionDataArr 
 * @return [year, month, day, sum]
 */
function getFlatGroupedTransactionAmountByDay(transactionDataArr: TransactionData[]) {
    const transactionDataSumAmountYMD = d3.flatRollup(transactionDataArr,
        (transactionDataArr) => {
            return d3.sum(transactionDataArr, (transactionData) => transactionData.transactionAmount)
        },
        d => d.date.getFullYear(),
        d => d.date.getMonth() + 1,
        d => d.date.getDate())
    return transactionDataSumAmountYMD;
}
/**
 * rollup the data by transactionAmount's sum of each day, return a flat array for each day
 * @param transactionDataArr 
 * @return year->month->day->sum
 */
function getGroupedTransactionAmountMapYMD(transactionDataArr: TransactionData[]): TransactionAmountSumMapByDayYMD {
    const transactionDataSumAmountYMD = d3.rollup(transactionDataArr,
        (transactionDataArr) => {
            return d3.sum(transactionDataArr, (transactionData) => transactionData.transactionAmount)
        },
        d => d.date.getFullYear(),
        d => d.date.getMonth() + 1,
        d => d.date.getDate())
    return transactionDataSumAmountYMD;
}
/**
 * rollup the data by transactionAmount's sum of each day, return a flat array for each day
 * @param transactionDataArr 
 * @return month->day->sum
 */
function getGroupedTransactionAmountMapMD(transactionDataArr: TransactionData[]): TransactionAmountSumMapByDayMD {
    const transactionDataSumAmountMD = d3.rollup(transactionDataArr,
        (transactionDataArr) => {
            return d3.sum(transactionDataArr, (transactionData) => transactionData.transactionAmount)
        },
        d => d.date.getMonth() + 1,
        d => d.date.getDate())
    return transactionDataSumAmountMD;
}


/**
 * rollup the data by transactionAmount's sum of each day, return a flat array for each day
 * @param transactionDataArr 
 * @return [month, day, sum]
 */
function getFlatGroupedTransactionAmountByDaySuperpositionedYear(transactionDataArr: TransactionData[]) {
    const transactionDataSumAmountMD = d3.flatRollup(transactionDataArr,
        (transactionDataArr) => {
            return d3.sum(transactionDataArr, (transactionData) => transactionData.transactionAmount)
        },
        d => d.date.getMonth() + 1,
        d => d.date.getDate())
    return transactionDataSumAmountMD;
}