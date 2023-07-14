import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { TransactionData } from "../DataObject"
import { MONTHS, getNumberOfDaysInMonth } from "./months"
import * as d3 from 'd3'
import { GroupedDataPerTransactionDescriptionContext } from "./Contexts/GroupedDataPerTransactionDescriptionContext";
import { ScaleContext } from "./Contexts/ScaleContext";
import { DataPerTransactionDescription } from "./DataPerTransactionDescription";
import { ValueGetterContext } from "./Contexts/ValueGetterContext";
import assert from "assert";
import { BarGlyphScales } from "../Glyphs/BarGlyph/BarGlyph";

const DayViewSvgSize = 20;

type TransactionDataMapYMD = d3.InternMap<number, d3.InternMap<number, d3.InternMap<number, TransactionData[]>>>
type TransactionNumberSelectedMap = Map<TransactionData['transactionNumber'], boolean>
type Data = {
    transactionDataMapYMD: TransactionDataMapYMD;
    transactionNumberSelectedMap: TransactionNumberSelectedMap;
}
type BarCalendarViewValueGetter = {
    x: (d: TransactionData) => string;
    height: (d: TransactionData) => number;
    colour: (d: TransactionData) => string;
}
type CalendarViewProps = {
    transactionDataArr: TransactionData[];
    initCurrentYear: number;
    transactionNumberSelectedMap: TransactionNumberSelectedMap;
    scaleHeight: 'log' | 'linear'
};

const barGlyphValueGetter = {
    x: (d: TransactionData) => d.transactionNumber,
    height: (d: TransactionData) => d.transactionAmount,
    colour: (d: TransactionData) => d.category
}

export default function CalendarView3({ transactionDataArr, initCurrentYear, transactionNumberSelectedMap, scaleHeight }:
    CalendarViewProps) {
    const [currentYear, setCurrentYear] = useState(initCurrentYear);
    const heightScaleFunc = d3.scaleLog
    const transactionDataMapYMD = useMemo(() => {
        return d3.group(transactionDataArr, d => d.date?.getFullYear(), d => d.date?.getMonth() + 1, d => d.date?.getDate())
    }, [transactionDataArr])
    const glyphType: 'bar' | 'pie' = 'bar';
    if (transactionDataArr.length === 0) {
        return <div>loading</div>
    }
    const data: Data = { transactionDataMapYMD: transactionDataMapYMD, transactionNumberSelectedMap: transactionNumberSelectedMap }

    // create public scales
    const heightDomain = d3.extent(transactionDataArr, barGlyphValueGetter.height);
    assert(heightDomain[0] !== undefined && heightDomain[1] !== undefined);
    const heightScale: BarCalendarViewSharedScales['heightScale'] = heightScaleFunc(heightDomain, [0, DayViewSvgSize])
    const colourDomain = Array.from(new Set(transactionDataArr.map(barGlyphValueGetter.colour)))
    const colourRange = d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), colourDomain.length).reverse()
    const colourScale: BarCalendarViewSharedScales['colourScale'] = d3.scaleOrdinal(colourDomain, colourRange)
    const barCalendarViewSharedScales: BarCalendarViewSharedScales = { heightScale, colourScale }

    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <td><input className="w-14" type="number" value={currentYear} onChange={(e) => e.target.value != '2014' && e.target.value != '2023' && setCurrentYear(parseInt(e.target.value))} /></td>
                        {(Array.from(Array(31).keys())).map(i => <td key={i + 1}>{i + 1}</td>)}
                    </tr>
                </thead>
                <tbody>
                    {MONTHS.map((month, i) => <MonthView month={i + 1} currentYear={currentYear}
                        key={i + 1} data={data} scales={barCalendarViewSharedScales} valueGetter={barGlyphValueGetter} />)}
                </tbody>
            </table>
        </div >
    )
}


type BarMonthViewProps = {
    month: number,
    currentYear: number,
    /**
     * data of all the transactions
     */
    data: Data,
    scales: BarCalendarViewSharedScales,
    valueGetter: BarCalendarViewValueGetter
}

function MonthView({ month, currentYear, data, scales, valueGetter }: BarMonthViewProps) {
    // month: 1to12 
    return (<tr>
        <td>{MONTHS[month - 1]}</td>
        {(Array.from(Array(getNumberOfDaysInMonth(currentYear, month)).keys())).map(i =>
            <DayView day={i + 1} month={month} currentYear={currentYear} data={data} scales={scales} valueGetter={valueGetter} />)}
    </tr>)

}


const x = d3.scaleBand().domain(['a', 'b']).range([1, 2])
type BarCalendarViewSharedScales = {
    heightScale: BarGlyphScales['heightScale'];
    colourScale: BarGlyphScales['colourScale'];
}
type BarDayViewProps = {
    day: number,
    month: number,
    currentYear: number,
    data: Data,
    scales: BarCalendarViewSharedScales,
    valueGetter: BarCalendarViewValueGetter
}
/**
 * use public scale for transaction amount and public colours scale for Category
 * visualise the chart using barGlyph, each bar represents a transaction with unique transaction id, height maps transaction amount 
 * @param day the number of the day in the month between 1 to 31
 * @param month the number of the month in the year between 1 to 12
 */
function DayView({ day, month, currentYear, data, scales, valueGetter }: BarDayViewProps) {
    const ref = useRef(null)
    const [width, height] = [DayViewSvgSize, DayViewSvgSize];

    // scales for bar glyph
    const { heightScale, colourScale } = scales

    // used for determine the border colour
    let dayOfWeek = new Date(currentYear, month - 1, day).getDay();
    dayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek
    const rectBorderColour: string = getDayColour(dayOfWeek) // 0 is sunday, which needs to be set 7

    // transactionNumberSelectedMap used for checking if the transaction is selected when rendering or creating rectangles
    const transactionNumberSelectedMap: TransactionNumberSelectedMap = data.transactionNumberSelectedMap;
    const dayData: TransactionData[] = useMemo(() => {
        const currYearData = data.transactionDataMapYMD.get(currentYear)
        if (currYearData === undefined) { return [] }
        const currMonthData = currYearData.get(month);
        if (currMonthData === undefined) { return [] }
        const currDayData = currMonthData.get(day);
        return currDayData === undefined ? [] : currDayData;
    }, [day, month, currentYear, data])
    // xScale for bar glyph
    const xScale: BarGlyphScales['xScale'] | undefined = useMemo(() => {
        const xDomain = Array.from(new Set(dayData.map(valueGetter.x)));
        if (xDomain[0] === undefined, xDomain[1] === undefined) { return undefined }
        return d3.scaleBand().domain(xDomain).range([0, width])
    }, [dayData, valueGetter])

    // prepare the bars
    const bars = xScale === undefined ? [] : dayData.map(d => {
        const bandWidth = xScale.bandwidth()
        const rectHeight = heightScale(valueGetter.height(d))
        return (
            <rect
                x={xScale(valueGetter.x(d))}
                y={height - rectHeight}
                width={bandWidth}
                height={height}
                fill={colourScale(valueGetter.colour(d))}
            />
        )
    })
    // console.log(`${currentYear}-${month}-${day}`, 'bars: ', bars)

    if (dayData.length === 0) {
        // highlight the day without transaction
        return <td className={`border-2 border-indigo-600`} style={{ width: width, height: height, borderColor: rectBorderColour }}>
            <div style={{ width: width, height: height }}>{dayOfWeek}</div>
        </td>
    }
    else {
        return (
            <td className={`border-2 border-indigo-600`} style={{ width: width, height: height, borderColor: rectBorderColour }}>
                <svg width={width} height={height}>
                    <g>{bars}</g>
                </svg>
            </td>
        )
    }
}
/**
 * 
 * @param dayOfWeek day in week, 1 to 7, 1: monday, 2: tuesday, 3: wed, ...
 * @return hex colour string, e.g., #000000
 */
function getDayColour(dayOfWeek: number): string {
    switch (dayOfWeek) {
        case 1:
            return '#c4c5ff'
        case 2:
            return '#9b9dfa'
        case 3:
            return '#7a7dff'
        case 4:
            return '#5256fa'
        case 5:
            return '#262bff'
        case 6:
            return '#000000'
        case 7:
            return '#000000'
        default:
            throw new Error(`invalid day number, it must be 1 to 7, the value is: ${String(dayOfWeek)}`);
            ;
    }
}