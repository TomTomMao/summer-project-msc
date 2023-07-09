import { useContext, useMemo, useRef, useState } from "react"
import { RFMData, TransactionData } from "../DataObject"
import { MONTHS, getNumberOfDaysInMonth } from "./months"
import { YearContext } from "./Contexts/YearContext";
import { AssertionError } from "assert";
import * as d3 from 'd3'
import { GroupedDataPerTransactionDescriptionContext } from "./Contexts/GroupedDataPerTransactionDescriptionContext";

interface DataPerTransactionDescription {
    transactionDescription: string
    monetaryAvgDay: number
    frequencyAvgDay: number
    amountToday: number
    timeToday: number
    isCredit: boolean
}
const calendarScatterMapping = {
    x: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.monetaryAvgDay,
    y: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.frequencyAvgDay,
    colour: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.amountToday,
    size: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.timeToday,
    shape: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.isCredit
}

export default function CalendarView3({ transactionDataArr, currentYear, RFMDataArr }: { transactionDataArr: TransactionData[], currentYear: number, RFMDataArr: RFMData[] }) {
    const [detailDay, setDetailDay] = useState<null | Date>(null);
    const RFMDataMap: Map<string, number> = useMemo(() => getRFMDataMapFromArr(RFMDataArr), [RFMDataArr])

    /**
     * A map: year->month->day->DataPerTransactionDescription[]
     */
    const groupedDataPerTransactionDescription: Map<string, Map<string, Map<string, DataPerTransactionDescription[]>>> = useMemo(() => {
        // rollup by year, month, day, reduce to transactionDescription.
        const d = d3.rollup(transactionDataArr, r => getDataPerTransactionDescription(r, RFMDataArr, RFMDataMap),
            d => `${d.date?.getFullYear()}`, d => `${d.date?.getMonth() + 1}`, d => `${d.date?.getDate()}`)
        return d
    }, [transactionDataArr, RFMDataArr])
    // calculate scales based on calendarScatterMapping and groupedDataPerTransactionDescription

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
                        <td>{currentYear}</td>
                        {(Array.from(Array(31).keys())).map(i => <td key={i + 1}>{i + 1}</td>)}
                    </tr>
                </thead>
                <tbody>
                    <YearContext.Provider value={currentYear}>
                        <GroupedDataPerTransactionDescriptionContext.Provider value={groupedDataPerTransactionDescription}>
                            {MONTHS.map((month, i) => <MonthView month={i + 1}
                                monthData={transactionDataArr.filter(d => d.date?.getMonth() === i && d.date.getFullYear() === currentYear)}
                                handleDetail={handleDetail}
                                key={i + 1} />)}
                        </GroupedDataPerTransactionDescriptionContext.Provider>
                    </YearContext.Provider>
                </tbody>
            </table>
            {detailDay ? <div>selected Day: {detailDay.toString()}</div> : <div></div>}
        </div>
    )
}

function MonthView({ month, monthData, handleDetail }: { month: number, monthData: TransactionData[], handleDetail: (arg0: number) => ((arg0: number) => void) }) {
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
    if (groupedDataPerTransactionDescription === null || currentYear === undefined) {
        return <td>loading</td>
    }

    const dayData = groupedDataPerTransactionDescription.get(String(currentYear))?.get(String(month))?.get(String(day))

    return (
        <td>
            <button onClick={() => { handleDetail(day); console.log(dayData) }}>{dayData ? dayData.length : 0}</button>
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
            return {
                transactionDescription: transactionDescription,
                monetaryAvgDay: RFMDataRecord.frequencyAvgDay,
                frequencyAvgDay: RFMDataRecord.monetaryAvgDay,
                amountToday: transactionDataArr.filter(d => d.transactionDescription === transactionDescription).reduce((a, b) => a + (b.isCredit() ? b.creditAmount : b.debitAmount), 0),
                timeToday: transactionDataArr.filter(d => d.transactionDescription === transactionDescription).length,
                isCredit: transactionDataArr.filter(d => d.transactionDescription === transactionDescription)[0].isCredit()
            }
        }
    });
    return dataPerTransactionDescriptionArr;
}