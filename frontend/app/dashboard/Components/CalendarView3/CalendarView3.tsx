import { useContext, useMemo, useState } from "react"
import { TransactionData } from "../../utilities/DataObject"
import { MONTHS, getNumberOfDaysInMonth } from "./months"
import * as d3 from 'd3'

import assert from "assert";
import TableView from "../TableView/TableView";
import { ConfigContext } from "../ConfigProvider";
import FolderableContainer from "../Containers/FolderableContainer";
import { PieDayViewProps, pieCalendarViewValueGetter, PieDayView } from "./DayViews/PieDayView";
import { barGlyphValueGetter, BarCalendarViewSharedScales, BarCalendarViewValueGetter, BarDayViewProps, BarDayView } from "./DayViews/BarDayView";
import { PublicScale, PublicValueGetter } from "../../utilities/types";



type HighLightedTransactionNumberSet = Set<TransactionData['transactionNumber']>
type TransactionDataMapYMD = d3.InternMap<number, d3.InternMap<number, d3.InternMap<number, TransactionData[]>>>
export type Data = {
    transactionDataMapYMD: TransactionDataMapYMD;
    highLightedTransactionNumberSet: HighLightedTransactionNumberSet;
}

type CalendarViewProps = {
    transactionDataArr: TransactionData[];
    highLightedTransactionNumberSet: HighLightedTransactionNumberSet;
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

export default function CalendarView3({ transactionDataArr, highLightedTransactionNumberSet, initCurrentYear, colourScale, colourValueGetter }:
    CalendarViewProps) {
    const [currentYear, setCurrentYear] = useState(initCurrentYear);
    const [detailDay, setDetailDay] = useState<null | Day>(null)

    // config
    const config = useContext(ConfigContext)
    const { containerWidth, containerHeight } = config.calendarViewConfig
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
    const heightScaleLinear: BarCalendarViewSharedScales['heightScaleLinear'] = d3.scaleLinear(heightDomain, [0, containerHeight]);
    const heightScaleLog: BarCalendarViewSharedScales['heightScaleLog'] = d3.scaleLog(heightDomain, [0, containerHeight]);
    const barCalendarViewSharedScales: BarCalendarViewSharedScales = { heightScaleLinear, heightScaleLog, colourScale } // colourScale shared with other views
    // create shared number of bars, the number will be used for control the xDomain's Size
    const maxTransactionCountOfDay = useMemo(() => {
        const countTransactionArr = d3.flatRollup(transactionDataArr, d => d.length, d => d.date);
        // console.log('countTransactionArr', countTransactionArr)
        return d3.max(countTransactionArr, d => d[1])
    }, [transactionDataArr])
    // console.log('maxTransactionCountOfDay', maxTransactionCountOfDay)


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
        </ >
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
    const { month, currentYear, detailDay, onShowDayDetail } = props
    const config = useContext(ConfigContext);
    if (config === null) {
        throw new Error("config is loading, but the month view is already amounted");
    }
    const glyphType = config.calendarViewConfig.glyphType;
    function handleShowDayDetail(day: number) {
        onShowDayDetail(day, month, currentYear);
    }
    // month: 1to12 
    return (<tr>
        <td style={{ color: detailDay && detailDay.month === month && detailDay.year === currentYear ? 'red' : 'black' }}>{MONTHS[month - 1]}</td>
        {(Array.from(Array(getNumberOfDaysInMonth(currentYear, month)).keys())).map(i => {
            const isDetailDay = detailDay !== null && detailDay.day === i + 1 && detailDay.month === month && detailDay.year === currentYear;
            const barDayViewProps: BarDayViewProps = { day: i + 1, ...props }
            const pieDayViewProps: PieDayViewProps = {
                day: i + 1, month: props.month, currentYear: props.currentYear, data: props.data,
                scales: { colourScale: props.scales.colourScale }, valueGetter: pieCalendarViewValueGetter,
                onShowDayDetail: props.onShowDayDetail,
                detailDay: props.detailDay
            }
            return <td onClick={() => handleShowDayDetail(i + 1)} className={isDetailDay ? `border-2 border-rose-500` : `border-2 border-black`}>
                {glyphType === 'pie' ? <PieDayView {...pieDayViewProps} key={`${month}-${i + 1}`} /> : <BarDayView {...barDayViewProps} key={`${month}-${i + 1}`} />}
            </td>
        })}
    </tr>)

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