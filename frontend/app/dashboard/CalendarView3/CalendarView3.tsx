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
    heightScaleType: 'log' | 'linear'
};

const barGlyphValueGetter = {
    x: (d: TransactionData) => d.transactionNumber,
    height: (d: TransactionData) => d.transactionAmount,
    colour: (d: TransactionData) => d.category
}

export default function CalendarView3({ transactionDataArr, initCurrentYear, transactionNumberSelectedMap, heightScaleType }:
    CalendarViewProps) {
    const [currentYear, setCurrentYear] = useState(initCurrentYear);
    const heightScaleFunc = heightScaleType === 'log' ? d3.scaleLog : d3.scaleLinear // todo: replace with state and add radio button
    const [detailDay, setDetailDay] = useState<null | { day: number, month: number, year: number }>(null)

    function handleShowDayDetail(day: number, month: number, year: number) {
        setDetailDay({ day: day, month: month, year: year })
    }

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
    // shared bandwidth

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
                        key={i + 1} data={data} scales={barCalendarViewSharedScales} valueGetter={barGlyphValueGetter} onShowDayDetail={handleShowDayDetail} />)}
                </tbody>
            </table>
            <div>
                {detailDay !== null && <DetailView day={detailDay.day} month={detailDay.month} currentYear={detailDay.year} transactionDataMapYMD={transactionDataMapYMD} />}
            </div>
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
    valueGetter: BarCalendarViewValueGetter,
    onShowDayDetail: (day: number, month: number, year: number) => void
}

function MonthView({ month, currentYear, data, scales, valueGetter, onShowDayDetail }: BarMonthViewProps) {
    // month: 1to12 
    return (<tr>
        <td>{MONTHS[month - 1]}</td>
        {(Array.from(Array(getNumberOfDaysInMonth(currentYear, month)).keys())).map(i =>
            <DayView day={i + 1} month={month} currentYear={currentYear} data={data} scales={scales} valueGetter={valueGetter} onShowDayDetail={onShowDayDetail} />)}
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
    valueGetter: BarCalendarViewValueGetter,
    onShowDayDetail: (day: number, month: number, year: number) => void
}
/**
 * use public scale for transaction amount and public colours scale for Category
 * visualise the chart using barGlyph, each bar represents a transaction with unique transaction id, height maps transaction amount 
 * @param day the number of the day in the month between 1 to 31
 * @param month the number of the month in the year between 1 to 12
 */
function DayView({ day, month, currentYear, data, scales, valueGetter, onShowDayDetail }: BarDayViewProps) {
    const [width, height] = [DayViewSvgSize, DayViewSvgSize];
    const useShareBandWidth = false;

    function handleShowDayDetail() {
        console.log(`${currentYear}-${month}-${day}`, dayData);
        onShowDayDetail(day, month, currentYear);
    }

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
        const sortedDayData = d3.sort(dayData, (a, b) => a.transactionAmount - b.transactionAmount)
        const xDomain = Array.from(new Set(sortedDayData.map(valueGetter.x)));
        if (xDomain[0] === undefined && xDomain[1] === undefined) { return undefined }
        return d3.scaleBand().domain(xDomain).range([0, width])
    }, [dayData, valueGetter])

    // prepare the bars
    const bars = useMemo(() => {
        if (xScale === undefined) {
            return []
        } else {
            return dayData.map(d => {
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
            });
        }
    }, [dayData])

    if (dayData.length === 0) {
        // highlight the day without transaction
        return <td className={`border-2 border-indigo-600`} style={{ width: width, height: height, borderColor: rectBorderColour }}>
            <div style={{ width: width, height: height }}>{dayOfWeek}</div>
        </td>
    }
    else {
        return (
            <td className={`border-2 border-indigo-600`} style={{ width: width, height: height, borderColor: rectBorderColour }}
                onClick={handleShowDayDetail}
            >
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

type DetailViewProps = {
    day: number,
    month: number,
    currentYear: number,
    transactionDataMapYMD: TransactionDataMapYMD
}
function DetailView({ day, month, currentYear, transactionDataMapYMD }: DetailViewProps) {
    const dayData = getDataFromTransactionDataMapYMD(transactionDataMapYMD, day, month, currentYear)
    console.log('detailview dayData: ', dayData)
    return <Table data={dayData} />
}

/**
 * 
 * @param param0 data should be an array of object share the same keys
 */
function Table({ data }: { data: Array<TransactionData>, }) {
    const transactionRows = useMemo(() => {
        return (
            data.map(transactionData => {
                return (
                    <tr key={transactionData.transactionNumber}>
                        <td>{transactionData.transactionNumber}</td>
                        <td>{transactionData.balance}</td>
                        <td>{transactionData.category}</td>
                        <td>{transactionData.creditAmount}</td>
                        <td>{transactionData.debitAmount}</td>
                        <td>{transactionData.locationCity}</td>
                        <td>{transactionData.locationCountry}</td>
                        <td>{transactionData.transactionDescription}</td>
                        <td>{transactionData.transactionType}</td>
                        <td>{transactionData.date?.toDateString()}</td>
                    </tr>)
            })
        )
    }, [data])

    return (
        <div>
            <table className="infoTable">
                <thead>
                    <tr>
                        <td>transactionNumber</td>
                        <td>balance</td>
                        <td>category</td>
                        <td>creditAmount</td>
                        <td>debitAmount</td>
                        <td>locationCity</td>
                        <td>locationCountry</td>
                        <td>transactionDescription</td>
                        <td>transactionType</td>
                        <td>date</td>
                    </tr>
                </thead>
                <tbody>
                    {transactionRows}
                </tbody>
            </table>
        </div>
    )
}

/**
 * get the data in O(1)
 * @param transactionDataMapYMD 
 * @param year number of year
 * @param month 1to12
 * @param day 1to31
 * @returns an array of TransactionData object
 */
function getDataFromTransactionDataMapYMD(transactionDataMapYMD: TransactionDataMapYMD, day: number, month: number, year: number,): TransactionData[] {
    if (month < 1 || month > 12) { throw new Error(`invalid month: ${month}, should be 1<=month<=12`,); }
    if (day < 1 || day > 31) { throw new Error(`invalid day: ${day}, should be 1<=day<=31`,); }

    const currYearData = transactionDataMapYMD.get(year)
    console.log('currYearData:', currYearData)
    if (currYearData === undefined) { return [] }
    const currMonthData = currYearData.get(month);
    console.log('currMonthData:', currMonthData)
    if (currMonthData === undefined) { return [] }
    const currDayData = currMonthData.get(day);
    console.log('currDayData:', currDayData)
    return currDayData === undefined ? [] : currDayData;

}