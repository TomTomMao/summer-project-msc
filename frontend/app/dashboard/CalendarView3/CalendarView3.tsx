import { useContext, useMemo, useRef, useState } from "react"
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
            d => `${d.date?.getFullYear()}`, d => `${d.date?.getMonth() + 1}`, d => `${d.date?.getDate()}`).map(x => x[3]);
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
        const scaleX = d3.scaleLinear().domain([xDomainMin, xDomainMax*0.01]).range([10, 30]);
        const scaleY = d3.scaleLinear().domain([yDomainMin, yDomainMax]).range([30, 10]);
        const scaleColour = d3.scaleLinear().domain([colourDomainMin, colourDomainMax]).range(["white", "blue"]);
        const scaleSize = d3.scaleLinear().domain([sizeDomainMin, sizeDomainMax]).range([30, 50]);
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
                        <td><input className="w-14" type="number" value={currentYear}  onChange={(e)=>setCurrentYear(parseInt(e.target.value))}/></td>
                        {(Array.from(Array(31).keys())).map(i => <td key={i + 1}>{i + 1}</td>)}
                    </tr>
                </thead>
                <tbody>
                    <YearContext.Provider value={currentYear}>
                        <GroupedDataPerTransactionDescriptionContext.Provider value={groupedDataPerTransactionDescription}>
                            <ScaleContext.Provider value={scales}>
                                {MONTHS.map((month, i) => <MonthView month={i + 1}
                                    handleDetail={handleDetail}
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

function MonthView({ month, handleDetail }: { month: number, handleDetail: (arg0: number) => ((arg0: number) => void) }) {
    // month: jan for 1, feb for 2, etc. 
    const year = useContext(YearContext);
    if (typeof (year) === 'number') {
        return (<tr>
            <td>{MONTHS[month - 1]}</td>
            {(Array.from(Array(getNumberOfDaysInMonth(year, month)).keys())).map(i =>
                <DayView day={i + 1} month={month} handleDetail={handleDetail(month)} key={i + 1} />)}
        </tr>)
    } else {
        throw new Error("year is undefined");
    }
}

/**
 * @param day the number of the day in the month
 * @param month the number of the month in the year
 * @param handleDetail event handler that tell the parents what has been selected
 */
function DayView({ day, month, handleDetail }: { day: number, month: number, handleDetail: (arg0: number) => void }) {
    const currentYear = useContext(YearContext);
    const groupedDataPerTransactionDescription = useContext(GroupedDataPerTransactionDescriptionContext);
    const { scaleX, scaleY, scaleColour, scaleShape, scaleSize } = useContext(ScaleContext);
    const valueGetter = calendarValueGetter;
    // console.log(scales);
    if (groupedDataPerTransactionDescription === null || currentYear === undefined
        || scaleX === undefined || scaleY === undefined || scaleColour === undefined || scaleShape === undefined || scaleSize === undefined) {
        return <td>loading</td>
    }

    const dayData = groupedDataPerTransactionDescription.get(String(currentYear))?.get(String(month))?.get(String(day))
    let visualData: { x: number; y: number; size: number; colour: number; shape: "circle" | "rect"; }[] = []
    if (dayData !== undefined) {
        visualData = dayData.map(transactionDescriptionData => {
            return {
                x: scaleX(valueGetter.x(transactionDescriptionData)),
                y: scaleY(valueGetter.y(transactionDescriptionData)),
                size: scaleSize(valueGetter.size(transactionDescriptionData)),
                colour: scaleColour(valueGetter.colour(transactionDescriptionData)),
                shape: scaleShape(valueGetter.shape(transactionDescriptionData))
            }
        })
    }
    console.log(visualData)
    const points = visualData.map((d,i) => {
        const radius = Math.sqrt(d.size / 3.1416)
        return <circle cx={d.x} cy={d.y} r={radius} key={`${dayData[i].transactionDescription}`} fill={d.colour}></circle>
        // if(d.shape==='rect') {
        //     const width = Math.sqrt(d.size);
        //     const height = width;
        //     return <rect x={d.x-width/2} y={d.y-height/2} width={width} height={height}></rect>
        // } else{
        //     const radius = Math.sqrt(d.size/3.1416)
        //     return <circle cx={d.x} cy={d.y} r={radius}></circle>
        // }
    })
    return (
        <td className="border-2 border-indigo-600">
            <svg width='40px' height='40px'>
                {points}
            </svg>
            {/* <button onClick={() => { handleDetail(day); console.log(dayData); console.log(visualData) }}>{dayData ? dayData.length : 0}</button> */}
        </td>
    )
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