import { useContext, useEffect, useMemo, useState } from "react"
import { TransactionData, TransactionDataAttrs } from "../DataObject"
import { MONTHS, getNumberOfDaysInMonth } from "./months"
import * as d3 from 'd3'

import assert from "assert";
import { BarGlyphScales, BarGlyphScalesLinearHeight, BarGlyphScalesLogHeight } from "../Glyphs/BarGlyph/BarGlyph";
import TableView from "../TableView/TableView";
import { CalendarViewCellHeight, CalendarViewCellWidth, PublicScale, publicValueGetter } from "../page";
import { ConfigContext } from "../ConfigProvider";
import FolderableContainer from "../Components/FolderableContainer";



type HighLightedTransactionNumberSet = Set<TransactionData['transactionNumber']>
type TransactionDataMapYMD = d3.InternMap<number, d3.InternMap<number, d3.InternMap<number, TransactionData[]>>>
type Data = {
    transactionDataMapYMD: TransactionDataMapYMD;
    highLightedTransactionNumberSet: HighLightedTransactionNumberSet;
}
type BarCalendarViewValueGetter = {
    x: (d: TransactionData) => string;
    height: (d: TransactionData) => number;
    colour: (d: TransactionData) => string;
}
type CalendarViewProps = {
    transactionDataArr: TransactionData[];
    highLightedTransactionNumberSet: HighLightedTransactionNumberSet;
    initCurrentYear: number;
    // heightScaleType: 'log' | 'linear',
    colourScale: PublicScale['colourScale']
    colourValueGetter: publicValueGetter['colour']
};

const barGlyphValueGetter: BarCalendarViewValueGetter = {
    x: (d: TransactionData) => d.transactionNumber,
    height: (d: TransactionData) => d.transactionAmount,
    colour: (d: TransactionData) => d.category
}


type Day = {
    day: number;
    month: number;
    year: number;
};

export default function CalendarView3({ transactionDataArr, highLightedTransactionNumberSet, initCurrentYear, colourScale, colourValueGetter }:
    CalendarViewProps) {
    const [currentYear, setCurrentYear] = useState(initCurrentYear);

    const [detailDay, setDetailDay] = useState<null | Day>(null)

    // used when user click a day cell
    function handleShowDayDetail(day: number, month: number, year: number) {
        setDetailDay({ day: day, month: month, year: year })
    }

    const transactionDataMapYMD = useMemo(() => {
        return d3.group(transactionDataArr, d => d.date?.getFullYear(), d => d.date?.getMonth() + 1, d => d.date?.getDate())
    }, [transactionDataArr])
    if (transactionDataArr.length === 0) {
        return <div>loading</div>
    }
    const data: Data = useMemo(() => { return { transactionDataMapYMD: transactionDataMapYMD, highLightedTransactionNumberSet: highLightedTransactionNumberSet } }, [transactionDataMapYMD, highLightedTransactionNumberSet])

    // create public height scale for the bar glyph
    const heightDomain = d3.extent(transactionDataArr, barGlyphValueGetter.height); // height for bar glyph
    assert(heightDomain[0] !== undefined && heightDomain[1] !== undefined);
    const heightScaleLinear: BarCalendarViewSharedScales['heightScaleLinear'] = d3.scaleLinear(heightDomain, [0, CalendarViewCellWidth]);
    const heightScaleLog: BarCalendarViewSharedScales['heightScaleLog'] = d3.scaleLog(heightDomain, [0, CalendarViewCellWidth]);
    const barCalendarViewSharedScales: BarCalendarViewSharedScales = { heightScaleLinear, heightScaleLog, colourScale } // colourScale shared with other views
    // create shared number of bars, the number will be used for control the xDomain's Size
    const maxTransactionCountOfDay = useMemo(() => {
        const countTransactionArr = d3.flatRollup(transactionDataArr, d => d.length, d => d.date);
        // console.log('countTransactionArr', countTransactionArr)
        return d3.max(countTransactionArr, d => d[1])
    }, [transactionDataArr])
    // console.log('maxTransactionCountOfDay', maxTransactionCountOfDay)


    return (
        <div>
            <table className="smallLetterTable">
                <thead>
                    <tr>
                        <td><input className="w-10" type="number" value={currentYear} onChange={(e) => e.target.value != '2014' && e.target.value != '2023' && setCurrentYear(parseInt(e.target.value))} /></td>
                        {(Array.from(Array(31).keys())).map(i => <td key={i + 1} style={{ color: detailDay && detailDay.day === i + 1 && detailDay.year === currentYear ? 'red' : 'black' }}>{i + 1}</td>)}
                    </tr>
                </thead>
                <tbody>
                    {MONTHS.map((_, i) => <MonthView month={i + 1} currentYear={currentYear}
                        key={i + 1} data={data} scales={barCalendarViewSharedScales} valueGetter={barGlyphValueGetter} onShowDayDetail={handleShowDayDetail}
                        detailDay={detailDay} />)}
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
        </div >
    )
}


type BarMonthViewProps = {
    month: number,
    currentYear: number,
    /**
     * data of all the transactions and a map store the transaction number of the highlighted transaction
     */
    data: Data,
    scales: BarCalendarViewSharedScales,
    valueGetter: BarCalendarViewValueGetter,
    onShowDayDetail: (day: number, month: number, year: number) => void,
    detailDay: Day | null
}

function MonthView(props: BarMonthViewProps) {
    const { month, currentYear, detailDay } = props
    const viewType = 'pie'
    // month: 1to12 
    return (<tr>
        <td style={{ color: detailDay && detailDay.month === month && detailDay.year === currentYear ? 'red' : 'black' }}>{MONTHS[month - 1]}</td>
        {(Array.from(Array(getNumberOfDaysInMonth(currentYear, month)).keys())).map(i => {
            const barDayViewProps: BarDayViewProps = { day: i + 1, ...props }
            const pieDayViewProps: PieDayViewProps = {
                day: i + 1, month: props.month, currentYear: props.currentYear, data: props.data,
                scales: { colourScale: props.scales.colourScale }, valueGetter: pieCalendarViewValueGetter,
                onShowDayDetail: props.onShowDayDetail,
                detailDay: props.detailDay
            }
            return viewType === 'pie' ? <PieDayView {...pieDayViewProps} key={`${month}-${i + 1}`} /> : <BarDayView {...barDayViewProps} key={`${month}-${i + 1}`} />
        })}
    </tr>)

}


type BarCalendarViewSharedScales = {
    heightScaleLog: BarGlyphScalesLogHeight['heightScale'];
    heightScaleLinear: BarGlyphScalesLinearHeight['heightScale']
    colourScale: BarGlyphScales['colourScale'];
}
type BarDayViewProps = {
    /**1to31 */
    day: number,
    /**1to12 */
    month: number,
    currentYear: number,
    data: Data,
    scales: BarCalendarViewSharedScales,
    valueGetter: BarCalendarViewValueGetter,
    onShowDayDetail: (day: number, month: number, year: number) => void,
    detailDay: null | Day
}
/**
 * use public scale for transaction amount and public colours scale for Category
 * visualise the chart using barGlyph, each bar represents a transaction with unique transaction id, height maps transaction amount 
 * @param day the number of the day in the month between 1 to 31
 * @param month the number of the month in the year between 1 to 12
 */
function BarDayView(props: BarDayViewProps) {
    const { day, month, currentYear, data, scales, valueGetter, onShowDayDetail, detailDay } = props
    const [width, height] = [CalendarViewCellWidth, CalendarViewCellHeight];
    const isDetailDay = detailDay !== null && day === detailDay.day && month === detailDay.month && currentYear === detailDay.year
    const maxTransactionCountOfDay: number = 28; // todo, take it from the calendarview component
    // configs
    const config = useContext(ConfigContext)
    assert(config !== null);
    const { isSharedBandWidth, sortingKey, isDesc, heightAxis } = config.barGlyphConfig
    const comparator = useMemo(() => TransactionData.curryCompare(sortingKey, isDesc), [sortingKey, isDesc])

    // highLightedTransactionNumberSet used for checking if the transaction is selected when rendering or creating rectangles
    const { transactionDataMapYMD, highLightedTransactionNumberSet } = data;
    const highlightMode = highLightedTransactionNumberSet.size > 0; // for deciding the style of rect
    const { heightScaleLog, heightScaleLinear, colourScale } = scales // heightScale for bar glyph, colourScale for category
    const heightScale = heightAxis === 'log' ? heightScaleLog : heightScaleLinear
    function handleShowDayDetail() {
        onShowDayDetail(day, month, currentYear);
    }

    // cache the bars of all the years.
    const barsOfEachYear: { year: number, bars: JSX.Element[] }[] = useMemo(() => {
        const years = Array.from(data.transactionDataMapYMD.keys());
        const barsOfEachYear: { year: number, bars: JSX.Element[] }[] = [];
        for (let year of years) {
            const dayData = getDataFromTransactionDataMapYMD(transactionDataMapYMD, day, month, year);
            const sortedDayData = d3.sort(dayData, comparator)
            let xDomain = Array.from(new Set(sortedDayData.map(valueGetter.x)));
            if (isSharedBandWidth) {
                // fill the domain if use shared band width
                const domainLength = xDomain.length
                for (let i = 0; i < maxTransactionCountOfDay - domainLength; i++) { xDomain.push(`fill-${i}`) }
            }

            const xScale = d3.scaleBand().domain(xDomain).range([0, width])
            const bars: JSX.Element[] = dayData.map(d => {
                const bandWidth = xScale.bandwidth()
                const rectHeight = heightScale(valueGetter.height(d))
                const isThisDataHighLighted = highLightedTransactionNumberSet.has(d.transactionNumber);
                return (
                    <rect
                        key={d.transactionNumber}
                        x={xScale(valueGetter.x(d))}
                        y={height - rectHeight}
                        width={bandWidth}
                        height={height}
                        fill={colourScale(valueGetter.colour(d))}
                        opacity={highlightMode && !isThisDataHighLighted ? 0.1 : 1}
                    />
                )
            });
            barsOfEachYear.push({ year: year, bars: bars })
        }
        return barsOfEachYear
    }, [data, heightAxis, colourScale, valueGetter, isSharedBandWidth, sortingKey, isDesc])

    return (
        <td onClick={handleShowDayDetail} className={isDetailDay ? `border-2 border-rose-500` : `border-2 border-black`}>
            <svg width={width} height={height}>
                {barsOfEachYear.map(d => { return <g style={{ opacity: d.year === currentYear ? 1 : 0 }} key={d.year} >{d.bars}</g> })}
                {/* <g>{bars}</g> */}
            </svg>
        </td>
    )
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
    transactionDataMapYMD: TransactionDataMapYMD,
    colourScale: PublicScale['colourScale'],
    colourValueGetter: publicValueGetter['colour'],
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
function getDataFromTransactionDataMapYMD(transactionDataMapYMD: TransactionDataMapYMD, day: number, month: number, year: number,): TransactionData[] {
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

type PieCalendarViewSharedScales = {
    colourScale: PublicScale['colourScale']
}
type PieCalendarViewValueGetter = {
    colour: (d: TransactionData) => string;
    value: (d: TransactionData) => number;
    name: (d: TransactionData) => string;
}
type PieDayViewProps = {
    /**1to31 */
    day: number,
    /**1to12 */
    month: number,
    currentYear: number,
    data: Data,
    scales: PieCalendarViewSharedScales,
    valueGetter: PieCalendarViewValueGetter,
    onShowDayDetail: (day: number, month: number, year: number) => void,
    detailDay: null | Day
}
const pieCalendarViewValueGetter: PieCalendarViewValueGetter = {
    colour: (d: TransactionData) => d.category,
    value: (d: TransactionData) => d.transactionAmount,
    name: (d: TransactionData) => d.transactionNumber
}
export function PieDayView(props: PieDayViewProps) {
    //reference: Holtz, Y. (n.d.). Pie chart with React. Retrieved 17 July 2023, from https://www.react-graph-gallery.com/pie-plot
    const { day, month, currentYear, data, scales, valueGetter, onShowDayDetail, detailDay } = props;
    const dayData = getDataFromTransactionDataMapYMD(data.transactionDataMapYMD, day, month, currentYear);
    const { colourScale } = scales;
    const [width, height] = [CalendarViewCellWidth, CalendarViewCellHeight];
    const pieGenerator = d3.pie<TransactionData>().value(valueGetter.value)
    const arcGenerator = d3.arc()
    const pie = pieGenerator(dayData);
    const arcs = pie.map((p) =>
        arcGenerator({
            innerRadius: 0,
            outerRadius: width / 2,
            startAngle: p.startAngle,
            endAngle: p.endAngle
        })
    )
    return (<td >
        <svg width={width} height={height}>
            <g transform={`translate(${width * 0.5},${height * 0.5})`}>
                {arcs.map((arc, i) => {
                    return <path key={i} d={arc === null ? undefined : arc} fill={colourScale(valueGetter.colour(dayData[i]))} />;
                })}
            </g>
        </svg>
    </td>)
}