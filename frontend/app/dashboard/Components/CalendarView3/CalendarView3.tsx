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
import { ColourDomainInfo } from "../ColourLegend/colourLegendSlice";
import { useCategoryColourScale } from "../../hooks/useColourScales";

type HighLightedTransactionNumberSet = Set<TransactionData['transactionNumber']>
type HighLightedColourDomainValueSetByLegend = Set<ColourDomainInfo['domainValue']>
type TransactionDataMapYMD = d3.InternMap<number, d3.InternMap<number, d3.InternMap<number, TransactionData[]>>>
type TransactionDataMapMD = d3.InternMap<number, d3.InternMap<number, TransactionData[]>>
type TransactionAmountSumMapByDayYMD = d3.InternMap<number, d3.InternMap<number, d3.InternMap<number, number>>> // used for cacheing, so when need the sum of the day, no need to search through the transactionDataArr
type TransactionAmountSumMapByDayMD = d3.InternMap<number, d3.InternMap<number, number>> // used for cacheing, so when need the sum of the day, no need to search through the transactionDataArr
export type Data = {
    transactionDataMapYMD: TransactionDataMapYMD;
    transactionDataMapMD: TransactionDataMapMD;
    highLightedTransactionNumberSetByBrusher: HighLightedTransactionNumberSet;
    highLightedColourDomainValueSetByLegend: HighLightedColourDomainValueSetByLegend;
    transactionAmountSumMapByDayYMD: TransactionAmountSumMapByDayYMD
    transactionAmountSumMapByDayMD: TransactionAmountSumMapByDayMD
}

type CalendarViewProps = {
    transactionDataArr: TransactionData[];
    highLightedTransactionNumberSetByBrusher: HighLightedTransactionNumberSet;
    highLightedColourDomainValueSetByLegend: HighLightedColourDomainValueSetByLegend;
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
    const { transactionDataArr, highLightedTransactionNumberSetByBrusher, highLightedColourDomainValueSetByLegend } = props
    const colourScale = useCategoryColourScale()
    const isSuperPositioned = useAppSelector(calendarViewSlice.selectIsSuperPositioned);

    // config
    const currentContainerHeight = useAppSelector(calendarViewSlice.selectCurrentContainerHeight)
    const currentContainerWidth = useAppSelector(calendarViewSlice.selectCurrentContainerWidth)
    const detailDay = useAppSelector(calendarViewSlice.selectDetailDay)
    const currentYear = useAppSelector(calendarViewSlice.selectCurrentYear)
    const dispatch = useAppDispatch()

    const handleChangeCurrentYear = (nextCurrentYear: number) => {
        dispatch(calendarViewSlice.changeCurrentYear(nextCurrentYear))
    }

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
            highLightedColourDomainValueSetByLegend: highLightedColourDomainValueSetByLegend,
            transactionAmountSumMapByDayYMD: transactionAmountSumMapByDayYMD,
            transactionAmountSumMapByDayMD: transactionAmountSumMapByDayMD
        }
    },
        [transactionDataMapYMD, transactionDataMapMD, highLightedTransactionNumberSetByBrusher, highLightedColourDomainValueSetByLegend, transactionAmountSumMapByDayYMD, transactionAmountSumMapByDayMD])

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
                        }} />)}
                </tbody>
            </table>
            {/* <div>
                {detailDay !== null && <FolderableContainer label={`detail of the transaction happened in ${currentYear}-${detailDay.month}-${detailDay.day}`} initIsFolded={false}><DetailView day={detailDay.day}
                    month={detailDay.month}
                    currentYear={detailDay.year}
                    transactionDataMapYMD={transactionDataMapYMD}
                    colourScale={colourScale}
                    colourValueGetter={colourValueGetter}
                    onClearDetail={() => dispatch(calendarViewSlice.clearDetailDay())}
                /></FolderableContainer>}
            </div> */}
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
} & {

}

function MonthView(props: MonthViewProps) {
    const { month, currentYear, detailDay, onShowDayDetail } = props
    const glyphType = useAppSelector(calendarViewSlice.selectGlyphType)
    const isSuperPositioned = useAppSelector(calendarViewSlice.selectIsSuperPositioned)
    function handleShowDayDetail(day: number) {
        onShowDayDetail(day, month, currentYear);
    }
    // month: 1to12 
    return (<tr>
        <td style={{ color: detailDay && detailDay.month === month && detailDay.year === currentYear ? 'red' : 'black' }}>{MONTHS[month - 1]}</td>

        {
            // 'isSuperPositioned ? 2016 : currentYear' is for use big year to show all the data
            (Array.from(Array(getNumberOfDaysInMonth(isSuperPositioned ? 2016 : currentYear, month)).keys())).map(i => {
                const isDetailDay = detailDay !== null && detailDay.day === i + 1 && detailDay.month === month && detailDay.year === currentYear;
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
                return <td onClick={() => handleShowDayDetail(i + 1)} className={isDetailDay ? `border-2 border-rose-500` : `border-2 border-black`} key={`${month}-${i + 1}`}>
                    {glyphType === 'pie' ? <PieDayView {...pieDayViewProps} /> : <BarDayView {...barDayViewProps} />}
                </td>
            })}
    </tr>)

}

type DetailViewProps = {
    day: number,
    month: number,
    currentYear: number,
    transactionDataMapYMD: TransactionDataMapYMD,
    colourScale: PublicScale['colourScale'],
    colourValueGetter: PublicValueGetter['colour'],
    onClearDetail(): void
}
function DetailView({ day, month, currentYear, transactionDataMapYMD, colourScale, colourValueGetter, onClearDetail }: DetailViewProps) {
    const dayData = getDataFromTransactionDataMapYMD(transactionDataMapYMD, day, month, currentYear)

    return <TableView transactionDataArr={dayData}
        transactionNumberSet={new Set(dayData.map(d => d.transactionNumber))}
        handleClearSelect={onClearDetail}
        colourScale={colourScale}
        colourValueGetter={colourValueGetter}
    />
}

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