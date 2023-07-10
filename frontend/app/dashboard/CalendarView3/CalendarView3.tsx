import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { RFMData, TransactionData } from "../DataObject"
import { MONTHS, getNumberOfDaysInMonth } from "./months"
import { YearContext } from "./Contexts/YearContext";
import { AssertionError } from "assert";
import * as d3 from 'd3'
import { GroupedDataPerTransactionDescriptionContext } from "./Contexts/GroupedDataPerTransactionDescriptionContext";
import { ScaleContext } from "./Contexts/ScaleContext";


const calendarValueGetter = {
    x: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.monetaryAvgDay,
    y: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.frequencyAvgDay,
    colour: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.amountToday,
    size: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.timeToday,
    shape: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.isCredit
}
const DayViewSvgSize = 40;
const PI = 3.14159;

export default function CalendarView3({ transactionDataArr, initCurrentYear, RFMDataArr }: { transactionDataArr: TransactionData[], initCurrentYear: number, RFMDataArr: RFMData[] }) {
    const [detailDay, setDetailDay] = useState<null | Date>(null);
    const [currentYear, setCurrentYear] = useState(initCurrentYear);
    const RFMDataMap: Map<string, number> = useMemo(() => getRFMDataMapFromArr(RFMDataArr), [RFMDataArr])
    const valueGetter = { ...calendarValueGetter }
    /**
     * A map: year->month->day->DataPerTransactionDescription[]
     * the getDataPerTransactionDescription function specify how the data looks like
     */
    const groupedDataPerTransactionDescription: Map<string, Map<string, Map<string, DataPerTransactionDescription[]>>> = useMemo(() => {
        // rollup by year, month, day, reduce to transactionDescription.
        const d = d3.rollup(transactionDataArr, r => getDataPerTransactionDescription(r, RFMDataArr, RFMDataMap),
            d => `${d.date?.getFullYear()}`, d => `${d.date?.getMonth() + 1}`, d => `${d.date?.getDate()}`)
        return d
    }, [transactionDataArr, RFMDataArr])

    // calculate scales based on calendarScatterMapping and groupedDataPerTransactionDescription
    // get flatten data
    const groupedDataPerTransactionDescriptionFlat: DataPerTransactionDescription[] = useMemo(() => {
        const d = d3.flatRollup(transactionDataArr, r => getDataPerTransactionDescription(r, RFMDataArr, RFMDataMap),
            d => `${d.date?.getFullYear()}`,
            d => `${d.date?.getMonth() + 1}`,
            d => `${d.date?.getDate()}`).map(x => x[3]);
        return d.flat()
    }, [transactionDataArr, RFMDataArr])
    console.log(groupedDataPerTransactionDescriptionFlat)
    const scales = useMemo(() => {
        // create scales, the getter is in valueGetter.
        const xDomainMin = 0
        const xDomainMax = d3.max(groupedDataPerTransactionDescriptionFlat, valueGetter.x);
        const yDomainMin = 0;
        const yDomainMax = d3.max(groupedDataPerTransactionDescriptionFlat, valueGetter.y);
        const colourDomainMin = d3.min(groupedDataPerTransactionDescriptionFlat, valueGetter.colour);
        const colourDomainMax = d3.max(groupedDataPerTransactionDescriptionFlat, valueGetter.colour);
        const sizeDomainMin = d3.min(groupedDataPerTransactionDescriptionFlat, valueGetter.size);
        const sizeDomainMax = d3.max(groupedDataPerTransactionDescriptionFlat, valueGetter.size);
        const shapeDomain = [true, false];
        if (xDomainMax === undefined) {
            throw new Error("invalid xDomainMax value");
        }
        if (yDomainMax === undefined) {
            throw new Error("invalid yDomainMax value");
        }
        if (colourDomainMin === undefined) {
            throw new Error("invalid colourDomainMin value");
        }
        if (colourDomainMax === undefined) {
            throw new Error("invalid colourDomainMax value");
        }
        if (sizeDomainMin === undefined) {
            throw new Error("invalid sizeDomainMin value");
        }
        if (sizeDomainMax === undefined) {
            throw new Error("invalid sizeDomainMax value");
        }
        const scaleX = d3.scaleLinear().domain([xDomainMin, xDomainMax]).range([0, DayViewSvgSize]);
        const scaleY = d3.scaleLinear().domain([yDomainMin, yDomainMax]).range([DayViewSvgSize, 0]);
        const scaleColour = d3.scaleLinear().domain([colourDomainMin, colourDomainMax]).range(["blue", "red"]);
        const scaleSize = d3.scaleLinear().domain([sizeDomainMin, sizeDomainMax]).range([1, 5]);
        const scaleShape = (shapeValue: boolean) => (shapeValue ? 'circle' : 'rect');

        const scales: {
            scaleX: d3.ScaleLinear<number, number, never>;
            scaleY: d3.ScaleLinear<number, number, never>;
            scaleColour: number[] & d3.ScaleLinear<number, number, never>;
            scaleSize: d3.ScaleLinear<number, number, never>;
            scaleShape: (shapeValue: boolean) => "circle" | "rect";
        } = { scaleX: scaleX, scaleY: scaleY, scaleColour: scaleColour, scaleSize: scaleSize, scaleShape: scaleShape }
        return scales;
    }, [groupedDataPerTransactionDescriptionFlat, valueGetter])


    function handleDetail(month: number) {
        // month is the number, if Jan, then 1, if Feb then 2.etc.
        return function (day: number) {
            setDetailDay(new Date(currentYear, month - 1, day))
        }
    }
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
                    <YearContext.Provider value={currentYear}>
                        <GroupedDataPerTransactionDescriptionContext.Provider value={groupedDataPerTransactionDescription}>
                            <ScaleContext.Provider value={scales}>
                                {MONTHS.map((month, i) => <MonthView month={i + 1}
                                    key={i + 1} />)}
                            </ScaleContext.Provider>
                        </GroupedDataPerTransactionDescriptionContext.Provider>
                    </YearContext.Provider>
                </tbody>
            </table>
            {detailDay ? <div>selected Day: {detailDay.toString()}</div> : <div></div>}
        </div>
    )
}

function MonthView({ month, }: { month: number }) {
    // month: jan for 1, feb for 2, etc. 
    const year = useContext(YearContext);
    if (typeof (year) === 'number') {
        return (<tr>
            <td>{MONTHS[month - 1]}</td>
            {(Array.from(Array(getNumberOfDaysInMonth(year, month)).keys())).map(i =>
                <DayView day={i + 1} month={month} />)}
        </tr>)
    } else {
        throw new Error("year is undefined");
    }
}

/**
 * @param day the number of the day in the month
 * @param month the number of the month in the year
 */
function DayView({ day, month, svgSize = { width: DayViewSvgSize, height: DayViewSvgSize } }: { day: number, month: number, svgSize: { width: number, height: number } }) {
    const currentYear = useContext(YearContext);
    const groupedDataPerTransactionDescription = useContext(GroupedDataPerTransactionDescriptionContext);
    const { scaleX, scaleY, scaleColour, scaleShape, scaleSize } = useContext(ScaleContext);
    const ref = useRef(null)
    const valueGetter = calendarValueGetter;
    const { width, height } = svgSize;

    if (groupedDataPerTransactionDescription === null || currentYear === undefined
        || scaleX === undefined || scaleY === undefined || scaleColour === undefined || scaleShape === undefined || scaleSize === undefined) {
        return <td>loading</td>
    }
    const dayData: DataPerTransactionDescription[] | undefined = groupedDataPerTransactionDescription.get(String(currentYear))?.get(String(month))?.get(String(day))
    const draw = () => {
        const svg = d3.select(ref.current)

        svg.select('g').selectAll('circle').data(dayData, d => { return `${d.transactionDescription}` }).join('circle')
            .attr('cx', (d: DataPerTransactionDescription) => scaleX(valueGetter.x(d)))
            .attr('cy', (d: DataPerTransactionDescription) => scaleY(valueGetter.y(d)))
            .attr('r', (d: DataPerTransactionDescription) => scaleSize(valueGetter.size(d)))
            .style('fill', (d: DataPerTransactionDescription) => scaleColour(valueGetter.colour(d)));
    }

    useEffect(() => dayData && draw(), [day, month, currentYear])

    // highlight the day without transaction
    if (dayData === undefined) {
        return <td className={`border-2 border-indigo-600 bg-zinc-950`} style={{ width: width, height: height }}>
            <svg ref={ref} width={width} height={height}>
            </svg>
        </td>
    }
    else {
        return (
            <td className={`border-2 border-indigo-600`} style={{ width: width, height: height }}>
                <svg ref={ref} width={width} height={height}>
                    <g></g>
                </svg>
            </td>
        )
    }
}







/**
 * 
 * @param RFMDataArr an array of RFMDataArr
 * @returns a map where the key is transactionDescription and value is the index of the RFMDataArr
 */
function getRFMDataMapFromArr(RFMDataArr: RFMData[]): Map<string, number> {
    const RFMDataMap: Map<string, number> = new Map();
    RFMDataArr.forEach((currRFMData, index) => {
        RFMDataMap.set(currRFMData.transactionDescription, index)
    })
    return RFMDataMap
}
/**
 * helper function for getDataPerTransactionDescription
 * @param transactionDescription 
 * @param RFMDataArr an array of RFMData
 * @param RFMDataMap a map where the key is the transactionDescription in RFMDataArr, and the value is the index of the item, whose transactionDescription = the key, in the RFMDataArr.
 * @returns an RFMData of the transactionDescription or undefined if not found
 */
const getRFMData = (transactionDescription: string, RFMDataMap: Map<string, number>, RFMDataArr: RFMData[]): RFMData | undefined => {
    const index: number | undefined = RFMDataMap.get(transactionDescription)
    return index !== undefined ? RFMDataArr[index] : undefined
}

/**
 * aggregated the data
 * @param transactionDataArr an array of data
 * @param RFMDataArr an array of RFMData
 * @param RFMDataMap a map where the key is the transactionDescription in RFMDataArr, and the value is the index of the item, whose transactionDescription = the key, in the RFMDataArr.
 * @return return an array of DataPerTransactionDescription
 */
function getDataPerTransactionDescription(transactionDataArr: TransactionData[], RFMDataArr: RFMData[], RFMDataMap: Map<string, number>): DataPerTransactionDescription[] {
    const transactionDescriptions = Array.from(new Set(transactionDataArr.map((transactionData: TransactionData) => transactionData.transactionDescription))); // O(N)
    // aggregate data to transaction description level; O(N^2), can be optimised
    const dataPerTransactionDescriptionArr: DataPerTransactionDescription[] = transactionDescriptions.map(transactionDescription => {
        const RFMDataRecord: RFMData | undefined = getRFMData(transactionDescription, RFMDataMap, RFMDataArr);
        if (RFMDataRecord === undefined) {
            // console.log(transactionDescription, RFMDataMap, RFMDataArr)
            throw new AssertionError({ message: `RFM Data of ${transactionDescription} not found` });
        }
        else {
            const monetaryAvgDay = RFMDataRecord.monetaryAvgDay;
            const frequencyAvgDay = RFMDataRecord.frequencyAvgDay;
            const amountToday = transactionDataArr.filter(d => d.transactionDescription === transactionDescription).reduce((a, b) => a + (b.isCredit() ? b.creditAmount : b.debitAmount), 0);
            const timeToday = transactionDataArr.filter(d => d.transactionDescription === transactionDescription).length;
            const isCredit = transactionDataArr.filter(d => d.transactionDescription === transactionDescription)[0].isCredit();
            return new DataPerTransactionDescription(transactionDescription, monetaryAvgDay, frequencyAvgDay, amountToday, timeToday, isCredit)
        }
    });
    return dataPerTransactionDescriptionArr;
}

class DataPerTransactionDescription {
    readonly transactionDescription: string;
    readonly monetaryAvgDay: number;
    readonly frequencyAvgDay: number;
    readonly amountToday: number;
    readonly timeToday: number;
    readonly isCredit: boolean;

    constructor(
        transactionDescription: string,
        monetaryAvgDay: number,
        frequencyAvgDay: number,
        amountToday: number,
        timeToday: number,
        isCredit: boolean
    ) {
        if (transactionDescription === null || transactionDescription === undefined) {
            throw new Error("transactionDescription must be defined");
        }
        if (monetaryAvgDay === null || monetaryAvgDay === undefined) {
            throw new Error("monetaryAvgDay must be defined");
        }
        if (frequencyAvgDay === null || frequencyAvgDay === undefined) {
            throw new Error("frequencyAvgDay must be defined");
        }
        if (amountToday === null || amountToday === undefined) {
            throw new Error("amountToday must be defined");
        }
        if (timeToday === null || timeToday === undefined) {
            throw new Error("timeToday must be defined");
        }
        if (isCredit === null || isCredit === undefined) {
            throw new Error("isCredit must be defined");
        }
        this.transactionDescription = transactionDescription;
        this.monetaryAvgDay = monetaryAvgDay;
        this.frequencyAvgDay = frequencyAvgDay;
        this.amountToday = amountToday;
        this.timeToday = timeToday;
        this.isCredit = isCredit;
    }
}