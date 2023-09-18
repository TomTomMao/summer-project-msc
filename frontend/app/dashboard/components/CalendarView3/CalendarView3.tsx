import { useEffect, useMemo, useState } from "react"
import { TransactionData } from "../../utilities/DataObject"
import { MONTHS, getNumberOfDaysInMonth } from "./months"
import * as d3 from 'd3'

import assert from "assert";
import { PieDayViewProps, pieCalendarViewValueGetter, PieDayView, PieCalendarViewSharedScales, PieCalendarViewValueGetter } from "./DayViews/PieDayView";
import { barCalendarViewValueGetter, BarCalendarViewSharedScales, BarCalendarViewValueGetter, BarDayViewProps, BarDayView } from "./DayViews/BarDayView";
import { PublicValueGetter } from "../../utilities/types";
import { useAppDispatch, useAppSelector } from "@/app/hooks";

import * as calendarViewSlice from './calendarViewSlice'
import * as barDayViewSlice from './DayViews/barDayViewSlice'
import { ScaleOrdinalWithTransactionNumber, useCategoryColourScale } from "../../hooks/useColourScales";
import { useHighLightedCalendarDayBorderMMDDSet } from "./useCalendarDayHighlightInfo";

import styles from './styles.module.css'
import { usePolarAreaCalendarViewSharedRadialScales, usePolarAreaCalendarViewSharedAngleScale } from "./usePolarAreaCalendarViewSharedScales";
import useCategoryOrderMap from "./useCategoryOrder";
import { PolarAreaDayView, PolarAreaDayViewProps, PolarAreaViewSharedScales } from "./DayViews/PolarAreaDayView";
import { ClusterDataMap, useClusterDataMap } from "../../hooks/useClusterData";
import { ClusterData } from "../../utilities/clusterDataObject";
import { useStarCalendarViewSharedAngleScale, useStarCalendarViewSharedRadialScales } from "./useStarCalendarViewSharedScales";
import useClusterOrderMap from "./useClusterOrder";
import { StarDayView, StarDayViewProps, StarViewSharedScales } from "./DayViews/starDayView";
import { CategoryColourLegend, ClusterIdColourLegend } from "../ColourLegend/ColourLegends";
import { Tooltip } from "@mui/material"; // reference: https://mui.com/material-ui
import { selectTooltipContentArr } from "./calendarViewSlice";
import * as interactivitySlice from "../Interactivity/interactivitySlice";

const CALENDAR_VIEW_EXPANDED_LEGEND_WIDTH = 150
const CALENDAR_VIEW_FOLDED_LEGEND_WIDTH = 100
const MAX_TOOLTIP_ROWS = 10

type HighLightedTransactionNumberSet = Set<TransactionData['transactionNumber']>
type TransactionDataMapYMD = d3.InternMap<number, d3.InternMap<number, d3.InternMap<number, TransactionData[]>>>
type TransactionDataMapMD = d3.InternMap<number, d3.InternMap<number, TransactionData[]>>
type TransactionAmountSumMapByDayYMD = d3.InternMap<number, d3.InternMap<number, d3.InternMap<number, number>>> // used for cacheing, so when need the sum of the day, no need to search through the transactionDataArr
type TransactionAmountSumMapByDayMD = d3.InternMap<number, d3.InternMap<number, number>> // used for cacheing, so when need the sum of the day, no need to search through the transactionDataArr
export type Data = {
    transactionDataMapYMD: TransactionDataMapYMD;
    transactionDataMapMD: TransactionDataMapMD;
    /**if empty, show all the transaction */
    highLightedTransactionNumberSetByBrusher: HighLightedTransactionNumberSet;
    transactionAmountSumMapByDayYMD: TransactionAmountSumMapByDayYMD;
    transactionAmountSumMapByDayMD: TransactionAmountSumMapByDayMD;
    /**if empty, show all the category */
    categorySetWithSelectedTransaction: Set<TransactionData['category']>,
    clusterDataMap: ClusterDataMap
}

type CalendarViewProps = {
    transactionDataArr: TransactionData[];
    highLightedTransactionNumberSetByBrusher: HighLightedTransactionNumberSet;
    initCurrentYear: number;
    // heightScaleType: 'log' | 'linear',
    colourScales: {
        categoryColourScale: ScaleOrdinalWithTransactionNumber,
        clusterIdColourScale: ScaleOrdinalWithTransactionNumber,
        frequencyUniqueKeyColourScale: ScaleOrdinalWithTransactionNumber,
    }
    colourValueGetter: PublicValueGetter['colour']
};

export type Day = {
    day: number;
    month: number;
    year: number;
};

export default function CalendarView3(props:
    CalendarViewProps) {
    const transactionDataArr = props.transactionDataArr
    const clusterDataMap: ClusterDataMap = useClusterDataMap()
    const { categoryColourScale, clusterIdColourScale, frequencyUniqueKeyColourScale } = props.colourScales
    const isSuperPositioned = useAppSelector(calendarViewSlice.selectIsSuperPositioned);
    const highLightedTransactionNumberSetByBrusher = props.highLightedTransactionNumberSetByBrusher
    // config
    const currentContainerHeight = useAppSelector(calendarViewSlice.selectCurrentContainerHeight)
    const currentContainerWidth = useAppSelector(calendarViewSlice.selectCurrentContainerWidth)
    const detailDay = useAppSelector(calendarViewSlice.selectDetailDay)
    const currentYear = useAppSelector(calendarViewSlice.selectCurrentYear)
    const isExpanded = useAppSelector(calendarViewSlice.selectIsExpand)

    const glyphType = useAppSelector(calendarViewSlice.selectGlyphType)
    const dispatch = useAppDispatch()

    // used when user click a day cell, automatically set the table to be the glyph table.
    function handleShowDayDetail(day: number, month: number, year: number) {
        dispatch(calendarViewSlice.setDetailDay({ day: day, month: month, year: year }))
        dispatch(interactivitySlice.setCurrentTable('glyphTable'))
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
    const { linearRadiusScale, logRadiusScale } = useMemo(curryGetPieDayViewRadiusScales(isSuperPositioned, transactionDataArr, currentContainerWidth, currentContainerHeight),
        [transactionDataArr, currentContainerWidth, currentContainerHeight, isSuperPositioned])

    if (transactionDataArr.length === 0 || linearRadiusScale === null || logRadiusScale === null) {
        throw new Error("transactionDataArr.length === 0 || linearRadiusScale === null || logRadiusScale === null");

    }
    const categorySetWithSelectedTransaction: Data['categorySetWithSelectedTransaction'] = useMemo(() => {
        const categorySetWithSelectedTransaction = new Set<TransactionData['category']>
        transactionDataArr.forEach(transactionData => {
            if (highLightedTransactionNumberSetByBrusher.has(transactionData.transactionNumber)) {
                categorySetWithSelectedTransaction.add(transactionData.category);
            }
        })
        return categorySetWithSelectedTransaction
    }, [transactionDataArr, highLightedTransactionNumberSetByBrusher])
    const data: Data = useMemo(() => {
        return {
            transactionDataMapYMD: transactionDataMapYMD,
            transactionDataMapMD: transactionDataMapMD,
            highLightedTransactionNumberSetByBrusher: highLightedTransactionNumberSetByBrusher,
            transactionAmountSumMapByDayYMD: transactionAmountSumMapByDayYMD,
            transactionAmountSumMapByDayMD: transactionAmountSumMapByDayMD,
            categorySetWithSelectedTransaction: categorySetWithSelectedTransaction,
            clusterDataMap: clusterDataMap
        }
    },
        [transactionDataMapYMD, transactionDataMapMD, highLightedTransactionNumberSetByBrusher, transactionAmountSumMapByDayYMD, transactionAmountSumMapByDayMD])

    // create public height scale for the bar glyph, and pie glyph
    const heightDomain = d3.extent(transactionDataArr, barCalendarViewValueGetter.height); // height for bar glyph
    assert(heightDomain[0] !== undefined && heightDomain[1] !== undefined);
    const heightScaleLinear: BarCalendarViewSharedScales['heightScaleLinear'] = d3.scaleLinear(heightDomain, [0, currentContainerHeight]);
    const heightScaleLog: BarCalendarViewSharedScales['heightScaleLog'] = d3.scaleLog(heightDomain, [0, currentContainerHeight]);
    const barCalendarViewSharedScales: BarCalendarViewSharedScales = { heightScaleLinear, heightScaleLog, colourScale: categoryColourScale } // colourScale shared with other views

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
    const pieCalendarViewSharedScales: PieCalendarViewSharedScales = { colourScale: categoryColourScale, linearRadiusScale, logRadiusScale }

    // ------PolarAreaGlyph: linear and log radius scale; angle scale; colour scale; categoryOrderMap------
    // polarAreaCalendarViewSharedScale -> Month view -> PolarAreaDayView
    // prepare shared RadiusScales for PolarAreaGlyphs, domain determined by transactionDataArr, isSuperPositioned, and currentYear, range determinde by currentContainerHeight and currentContainerWidth
    // the hook don't read any data from the store, it just use the args with some useMemo
    const polarAreaCalendarViewSharedRadialScales: { linearRadiusScale: d3.ScaleLinear<number, number>, logRadiusScale: d3.ScaleLogarithmic<number, number> } | { linearRadiusScale: null, logRadiusScale: null } =
        usePolarAreaCalendarViewSharedRadialScales(transactionDataArr, isSuperPositioned, currentContainerHeight, currentContainerWidth)
    // prepare the category order for the PolarAreaGlyphs, it read an array of category from the redux store, and create a map from category to the index, index start from 0 to |category|.length - 1
    const categoryOrderMap: Map<TransactionData['category'], number> = useCategoryOrderMap() // read category order from the store
    // prepare shared angle scale for PolarAreaGlyphs, which maps the index of category to start angle in the glyph
    const polarAreaCalendarViewSharedAngleScale: d3.ScaleLinear<number, number> = usePolarAreaCalendarViewSharedAngleScale(categoryOrderMap)

    // star glyph data and scale, similar logic to polarareaglyph
    const starCalendarViewSharedRadialScales: { linearRadiusScale: d3.ScaleLinear<number, number>, logRadiusScale: d3.ScaleLogarithmic<number, number> } | { linearRadiusScale: null, logRadiusScale: null } =
        useStarCalendarViewSharedRadialScales(transactionDataArr, clusterDataMap, isSuperPositioned, currentContainerHeight, currentContainerWidth)
    const clusterOrderMap: Map<ClusterData['clusterId'], number> = useClusterOrderMap();
    const starCalenarViewSharedAngleScale: d3.ScaleLinear<number, number> = useStarCalendarViewSharedAngleScale(clusterOrderMap);

    // checking null values
    if (polarAreaCalendarViewSharedRadialScales.linearRadiusScale === null ||
        polarAreaCalendarViewSharedRadialScales.logRadiusScale === null ||
        polarAreaCalendarViewSharedAngleScale === null ||
        starCalendarViewSharedRadialScales.linearRadiusScale === null ||
        starCalendarViewSharedRadialScales.logRadiusScale === null ||
        starCalenarViewSharedAngleScale === null ||
        categoryColourScale === null ||
        categoryColourScale === undefined
    ) {
        return <>loading scales</>
    }

    const polarAreaCalendarViewSharedScales: PolarAreaViewSharedScales = {
        colourScale: categoryColourScale,
        linearRadiusScale: polarAreaCalendarViewSharedRadialScales.linearRadiusScale,
        logRadiusScale: polarAreaCalendarViewSharedRadialScales.logRadiusScale,
        angleScale: polarAreaCalendarViewSharedAngleScale,
        categoryOrderMap
    }

    const starCalendarViewSharedScales: StarViewSharedScales = {
        colourScale: clusterIdColourScale,
        linearRadiusScale: starCalendarViewSharedRadialScales.linearRadiusScale,
        logRadiusScale: starCalendarViewSharedRadialScales.logRadiusScale,
        angleScale: starCalenarViewSharedAngleScale,
        clusterOrderMap
    }
    return (
        <div style={{ paddingRight: isExpanded ? CALENDAR_VIEW_EXPANDED_LEGEND_WIDTH : CALENDAR_VIEW_FOLDED_LEGEND_WIDTH }}>
            <table className="smallLetterTable" >
                <thead>
                    <tr>
                        <td></td>
                        {(Array.from(Array(31).keys())).map(i => <td key={i + 1}
                            style={{ color: detailDay && detailDay.day === i + 1 && detailDay.year === currentYear ? 'red' : 'black' }}>
                            {i + 1}
                        </td>)}
                    </tr>
                </thead>
                <tbody>
                    {MONTHS.map((_, i) => <MonthView month={i + 1} currentYear={currentYear}
                        key={i + 1} data={data}
                        barDayViewScales={barCalendarViewSharedScales}
                        barDayViewValueGetter={barCalendarViewValueGetter}
                        pieDayViewScales={pieCalendarViewSharedScales}
                        pieDayViewValueGetter={pieCalendarViewValueGetter}
                        polarAreaDayViewScales={polarAreaCalendarViewSharedScales}
                        starCalendarViewSharedScales={starCalendarViewSharedScales}
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
            <div style={{
                position: 'absolute',
                right: 0,
                top: '2em',
                overflowY: 'scroll',
                height: 'calc(100% - 4em)',
                width: isExpanded ? CALENDAR_VIEW_EXPANDED_LEGEND_WIDTH : CALENDAR_VIEW_FOLDED_LEGEND_WIDTH,
            }}>
                <div style={glyphType === 'star' ? { height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' } : { height: '100%' }}>
                    <div>
                        {glyphType === 'star' ? <ClusterIdColourLegend /> : <CategoryColourLegend />}
                    </div>
                </div>
            </div>
        </ div >
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
    polarAreaDayViewScales: PolarAreaViewSharedScales,
    starCalendarViewSharedScales: StarViewSharedScales
    onShowDayDetail: (day: number, month: number, year: number) => void,
    detailDay: Day | null,
    dayViewContainerSize: { containerWidth: number, containerHeight: number }
    highLightedCalendarDayBorderMMDDSet: Set<string>
} & {

}

function curryGetPieDayViewRadiusScales(isSuperPositioned: boolean, transactionDataArr: TransactionData[], currentContainerWidth: number, currentContainerHeight: number):
    () => { linearRadiusScale: null; logRadiusScale: null; } | { linearRadiusScale: d3.ScaleLinear<number, number, never>; logRadiusScale: d3.ScaleLogarithmic<number, number, never>; } {
    return () => {
        let groupedData: [number, number, number, number][] | [number, number, number][] = []; // // [year, month, day, sumTransactionAmountOfDay] or // [month, day, sumTransactionAmountOfDayForEachYear]
        let radiusMinDomain: number | undefined; // if isSuperpositioned = true, it is the sum of data for all a day of all the year; else for each year 
        let radiusMaxDomain: number | undefined; // if isSuperpositioned = true, it is the sum of data for all a day of all the year; else for each year 
        if (isSuperPositioned) {
            groupedData = getFlatGroupedTransactionAmountByDaySuperpositionedYear(transactionDataArr); // [month, day, sumTransactionAmountOfDayForEachYear]
            const d = d3.extent(groupedData, d => d[2]);
            radiusMinDomain = d[0];
            radiusMaxDomain = d[1];
        } else {
            groupedData = getFlatGroupedTransactionAmountByDay(transactionDataArr); // [year, month, day, sumTransactionAmountOfDay]
            const d = d3.extent(groupedData, d => d[3]);
            radiusMinDomain = d[0];
            radiusMaxDomain = d[1];
        }

        if (radiusMinDomain === undefined || radiusMaxDomain === undefined) {
            return { linearRadiusScale: null, logRadiusScale: null };
        } else {
            const linearRadiusScale = d3.scaleLinear().domain([radiusMinDomain, radiusMaxDomain]).range([0, currentContainerWidth > currentContainerHeight ? currentContainerHeight : currentContainerWidth]);
            const logRadiusScale = d3.scaleLog().domain([radiusMinDomain, radiusMaxDomain]).range([0, currentContainerWidth]);
            return { linearRadiusScale, logRadiusScale };
        }
    };
}

function MonthView(props: MonthViewProps) {
    const { month, currentYear, detailDay, onShowDayDetail, highLightedCalendarDayBorderMMDDSet } = props
    const glyphType = useAppSelector(calendarViewSlice.selectGlyphType)
    const isSuperPositioned = useAppSelector(calendarViewSlice.selectIsSuperPositioned)
    const tooltipContentArr = useAppSelector(selectTooltipContentArr)
    let tooltipTitle = tooltipContentArr.map(({ content, colour }) => <div key={content} style={{ fontSize: '12px', display: "flex" }}>
        <div style={{ position: 'relative', backgroundColor: '', margin: 0, padding: 0, width: '12px', height: '12px' }}>
            <div style={{
                backgroundColor: colour,
                width: '12px',
                height: '12px',
                display: 'block',
                marginTop: '1.6px',
                left: '0.4em'
            }}></div>
        </div>
        <div style={{ marginLeft: '2px' }}>
            {content}
        </div>
    </div>)
    if (tooltipTitle.length >= MAX_TOOLTIP_ROWS) {
        tooltipTitle = tooltipTitle.slice(0, MAX_TOOLTIP_ROWS)
        tooltipTitle.push(<div>...click see detail in table</div>)
    } else if (tooltipContentArr.length === 0) {
        tooltipTitle.push(<div>no transaction</div>)
    }
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
                const day = i + 1
                const hasDay = i < numberOfDaysInMonth;
                const isDetailDay = detailDay !== null && detailDay.day === i + 1 && detailDay.month === month && detailDay.year === currentYear;
                const isDayHasSelectedTransaction = highLightedCalendarDayBorderMMDDSet.has(`${month}-${i + 1}`)
                let dayView;
                if (hasDay) {
                    switch (glyphType) {
                        case 'pie':
                            const pieDayViewProps: PieDayViewProps = {
                                day: i + 1,
                                month: props.month,
                                currentYear: props.currentYear,
                                data: props.data,
                                scales: props.pieDayViewScales,
                                valueGetter: props.pieDayViewValueGetter,
                                containerSize: props.dayViewContainerSize,
                            }
                            dayView = <PieDayView {...pieDayViewProps} />
                            break;
                        case 'bar':
                            const barDayViewProps: BarDayViewProps = {
                                day: i + 1,
                                month: props.month,
                                currentYear: props.currentYear,
                                data: props.data,
                                scales: props.barDayViewScales,
                                valueGetter: props.barDayViewValueGetter,
                                containerSize: props.dayViewContainerSize,
                            }
                            dayView = <BarDayView {...barDayViewProps} />
                            break;
                        case 'polarArea':
                            const polarAreaDayViewProps: PolarAreaDayViewProps = {
                                day: i + 1,
                                month: props.month,
                                currentYear: props.currentYear,
                                data: props.data,
                                scales: props.polarAreaDayViewScales,
                                containerSize: props.dayViewContainerSize
                            }
                            dayView = <PolarAreaDayView {...polarAreaDayViewProps}></PolarAreaDayView>
                            break
                        case 'star':
                            const starDayViewProps: StarDayViewProps = {
                                day: i + 1,
                                month: props.month,
                                currentYear: props.currentYear,
                                data: { ...props.data },
                                scales: props.starCalendarViewSharedScales,
                                containerSize: props.dayViewContainerSize
                            }
                            dayView = <StarDayView {...starDayViewProps}></StarDayView>
                            break;
                        default:
                            const _exhaustiveCheck: never = glyphType
                            throw new Error("exhaustive error");
                    }
                } else {
                    dayView = <div style={{
                        //reference: https://www.jianshu.com/p/4278f70c2721
                        background: 'repeating-linear-gradient(60deg, white, gray, white, gray, white, gray, white, gray, white, gray, white, gray, white, gray)',
                        width: props.dayViewContainerSize.containerWidth, height: props.dayViewContainerSize.containerHeight
                    }}></div>
                }
                const _dayViewTypeCheck: JSX.Element = dayView
                return <td key={`${month}-${i + 1}-${isSuperPositioned ? 'superpositioned' : 'notSuperPositioned'}`} onClick={() => handleShowDayDetail(i + 1)} style={{ padding: '0px' }} >
                    <Tooltip title={tooltipTitle}>
                        <div
                            style={{ zIndex: isDayHasSelectedTransaction ? 900 : 800, borderColor: isDayHasSelectedTransaction ? 'blue' : isDetailDay ? 'red' : 'RGB(200,200,200)' }}
                        >
                            {dayView}
                        </div>
                    </Tooltip>

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
 * given day,  month and year, return the sum of transactionAmount of the day from the transactionAmountSumMapByDayYMD
 * 
 * this is used for non-superpositioned view
 * 
 * O(1)
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
 * given day and month, return the sum of transactionAmount of the day from the transactionAmountSumMapByDayMD
 * 
 * this is used for superpositioned view
 * 
 * O(1)
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

export function CalendarViewYearController() {
    const currentYear = useAppSelector(calendarViewSlice.selectCurrentYear);
    const isSuperPositioned = useAppSelector(calendarViewSlice.selectIsSuperPositioned)
    const dispatch = useAppDispatch()
    const handleChangeCurrentYear = (nextCurrentYear: number) => {
        dispatch(calendarViewSlice.changeCurrentYear(nextCurrentYear))
    }
    const handleChangeIsSuperpositioned = () => {
        if (isSuperPositioned) {
            dispatch(calendarViewSlice.disableSuperPosition())
        } else {
            dispatch(calendarViewSlice.enableSuperPosition())
        }
    }
    return (
        <div style={{
            position: 'absolute',
            zIndex: 2,
            left: '40px',
            top: '5px',
        }}>
            <input type="checkbox" name="" id="isSuperPositioned" value='isSuperPositioned' checked={isSuperPositioned} onChange={handleChangeIsSuperpositioned} />
            <label htmlFor="isSuperPositioned" style={{ marginRight: '2px' }}>Super Positioned</label>
            <input style={{ width: '60px', height: '100%', border: isSuperPositioned ? '1px gray solid' : '1px black solid', color: isSuperPositioned ? 'gray' : 'black' }}
                disabled={isSuperPositioned}
                type="number"
                name=""
                id=""
                value={currentYear}
                onChange={e => handleChangeCurrentYear(parseInt(e.target.value))} />
        </div>
    )
}