import { useMemo, useState } from "react"
import { TransactionData } from "../../utilities/DataObject"
import { MONTHS, getNumberOfDaysInMonth } from "./months"
import * as d3 from 'd3'

import assert from "assert";
import TableView from "../TableView/TableView";
import FolderableContainer from "../Containers/FolderableContainer";
import { PieDayViewProps, pieCalendarViewValueGetter, PieDayView, PieCalendarViewSharedScales, PieCalendarViewValueGetter } from "./DayViews/PieDayView";
import { barCalendarViewValueGetter, BarCalendarViewSharedScales, BarCalendarViewValueGetter, BarDayViewProps, BarDayView } from "./DayViews/BarDayView";
import { PublicScale, PublicValueGetter } from "../../utilities/types";
import { useAppSelector } from "@/app/hooks";

import * as calendarViewSlice from './calendarViewSlice'
import { ColourDomainInfo } from "../ColourLegend/colourLegendSlice";

type HighLightedTransactionNumberSet = Set<TransactionData['transactionNumber']>
type HighLightedColourDomainValueSetByLegend = Set<ColourDomainInfo['domainValue']>
type TransactionDataMapYMD = d3.InternMap<number, d3.InternMap<number, d3.InternMap<number, TransactionData[]>>>
export type Data = {
    transactionDataMapYMD: TransactionDataMapYMD;
    highLightedTransactionNumberSetByBrusher: HighLightedTransactionNumberSet;
    highLightedColourDomainValueSetByLegend: HighLightedColourDomainValueSetByLegend
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

export default function CalendarView3({ transactionDataArr, highLightedTransactionNumberSetByBrusher, highLightedColourDomainValueSetByLegend, initCurrentYear, colourScale, colourValueGetter }:
    CalendarViewProps) {
    const [currentYear, setCurrentYear] = useState(initCurrentYear);
    const [detailDay, setDetailDay] = useState<null | Day>(null)

    // config
    const currentContainerHeight = useAppSelector(calendarViewSlice.selectCurrentContainerHeight)
    const currentContainerWidth = useAppSelector(calendarViewSlice.selectCurrentContainerWidth)

    // used when user click a day cell
    function handleShowDayDetail(day: number, month: number, year: number) {
        setDetailDay({ day: day, month: month, year: year })
    }

    const transactionDataMapYMD = useMemo(() => {
        return d3.group(transactionDataArr, d => d.date.getFullYear(), d => d.date.getMonth() + 1, d => d.date.getDate())
    }, [transactionDataArr])

    // used for pie glyph's radius
    const { linearRadiusScale, logRadiusScale } = useMemo(() => {
        const groupedData = groupTransactionAmountByDay(transactionDataArr); // [year, month, day, sumTransactionAmountOfDay]
        const [radiusMinDomain, radiusMaxDomain] = d3.extent(groupedData, d => d[3])
        if (radiusMinDomain === undefined || radiusMaxDomain === undefined) {
            return { linearRadiusScale: null, logRadiusScale: null }
        } else {
            const linearRadiusScale = d3.scaleLinear().domain([radiusMinDomain, radiusMaxDomain]).range([0, currentContainerWidth > currentContainerHeight ? currentContainerHeight : currentContainerWidth])
            const logRadiusScale = d3.scaleLog().domain([radiusMinDomain, radiusMaxDomain]).range([0, currentContainerWidth])
            return { linearRadiusScale, logRadiusScale }
        }
    }, [transactionDataArr, currentContainerWidth, currentContainerHeight])

    if (transactionDataArr.length === 0 || linearRadiusScale === null || logRadiusScale === null) {
        return <div>loading</div>
    }
    const data: Data = useMemo(() => {
        return {
            transactionDataMapYMD: transactionDataMapYMD,
            highLightedTransactionNumberSetByBrusher: highLightedTransactionNumberSetByBrusher,
            highLightedColourDomainValueSetByLegend: highLightedColourDomainValueSetByLegend
        }
    },
        [transactionDataMapYMD, highLightedTransactionNumberSetByBrusher, highLightedColourDomainValueSetByLegend])

    // create public height scale for the bar glyph, and pie glyph
    const heightDomain = d3.extent(transactionDataArr, barCalendarViewValueGetter.height); // height for bar glyph
    assert(heightDomain[0] !== undefined && heightDomain[1] !== undefined);
    const heightScaleLinear: BarCalendarViewSharedScales['heightScaleLinear'] = d3.scaleLinear(heightDomain, [0, currentContainerHeight]);
    const heightScaleLog: BarCalendarViewSharedScales['heightScaleLog'] = d3.scaleLog(heightDomain, [0, currentContainerHeight]);
    const barCalendarViewSharedScales: BarCalendarViewSharedScales = { heightScaleLinear, heightScaleLog, colourScale } // colourScale shared with other views
    // create shared number of bars, the number will be used for control the xDomain's Size
    const maxTransactionCountOfDay = useMemo(() => {
        const countTransactionArr = d3.flatRollup(transactionDataArr, d => d.length, d => d.date);
        // console.log('countTransactionArr', countTransactionArr)
        return d3.max(countTransactionArr, d => d[1])
    }, [transactionDataArr])
    // console.log('maxTransactionCountOfDay', maxTransactionCountOfDay)

    // public scales for pie :
    const pieCalendarViewSharedScales: PieCalendarViewSharedScales = { colourScale, linearRadiusScale, logRadiusScale }


    return (
        <>
            <table className="smallLetterTable">
                <thead>
                    <tr>
                        <td><input className="w-10" type="number" value={currentYear} onChange={(e) => e.target.value != '2014' && e.target.value != '2023' && setCurrentYear(parseInt(e.target.value))} /></td>
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
            <div>
                {detailDay !== null && <FolderableContainer label={`detail of the transaction happened in ${currentYear}-${detailDay.month}-${detailDay.day}`} initIsFolded={false}><DetailView day={detailDay.day}
                    month={detailDay.month}
                    currentYear={detailDay.year}
                    transactionDataMapYMD={transactionDataMapYMD}
                    colourScale={colourScale}
                    colourValueGetter={colourValueGetter}
                    onClearDetail={() => setDetailDay(null)}
                /></FolderableContainer>}
            </div>
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

    function handleShowDayDetail(day: number) {
        onShowDayDetail(day, month, currentYear);
    }
    // month: 1to12 
    return (<tr>
        <td style={{ color: detailDay && detailDay.month === month && detailDay.year === currentYear ? 'red' : 'black' }}>{MONTHS[month - 1]}</td>
        {(Array.from(Array(getNumberOfDaysInMonth(currentYear, month)).keys())).map(i => {
            const isDetailDay = detailDay !== null && detailDay.day === i + 1 && detailDay.month === month && detailDay.year === currentYear;
            const barDayViewProps: BarDayViewProps = {
                day: i + 1, ...props,
                scales: props.barDayViewScales,
                valueGetter: props.barDayViewValueGetter,
                containerSize: props.dayViewContainerSize,
            }
            const pieDayViewProps: PieDayViewProps = {
                day: i + 1, month: props.month, currentYear: props.currentYear, data: props.data,
                scales: props.pieDayViewScales,
                valueGetter: props.pieDayViewValueGetter,
                containerSize: props.dayViewContainerSize,
            }
            return <td onClick={() => handleShowDayDetail(i + 1)} className={isDetailDay ? `border-2 border-rose-500` : `border-2 border-black`}>
                {glyphType === 'pie' ? <PieDayView {...pieDayViewProps} key={`${month}-${i + 1}`} /> : <BarDayView {...barDayViewProps} key={`${month}-${i + 1}`} />}
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
 * group data by day, return a flat map from Year to month to day, adding transactionAmount
 * @param transactionDataArr 
 */
function groupTransactionAmountByDay(transactionDataArr: TransactionData[]) {
    const transactionDataSumAmountYMD = d3.flatRollup(transactionDataArr,
        (transactionDataArr) => {
            return d3.sum(transactionDataArr, (transactionData) => transactionData.transactionAmount)
        },
        d => d.date.getFullYear(),
        d => d.date.getMonth() + 1,
        d => d.date.getDate())
    return transactionDataSumAmountYMD;
}
