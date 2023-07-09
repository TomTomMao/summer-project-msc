import { useContext, useMemo, useRef, useState } from "react"
import { RFMData, TransactionData } from "../DataObject"
import { MONTHS, getNumberOfDaysInMonth } from "./months"
import { YearContext } from "./Contexts/YearContext";
import { RFMDataArrContext, RFMDataMapContext } from "./Contexts/RFMDataArrContext";
import { AssertionError } from "assert";

interface DataPerTransactionDescription {
    transactionDescription: string
    monetaryAvgDay: number
    frequencyAvgDay: number
    amountToday: number
    timeToday: number
    isCredit: boolean
}

export default function CalendarView3({ transactionDataArr, currentYear, RFMDataArr }: { transactionDataArr: TransactionData[], currentYear: number, RFMDataArr: RFMData[] }) {
    const [detailDay, setDetailDay] = useState<null | Date>(null);
    const RFMDataMap: Map<String, number> = useMemo(() => getRFMDataMapFromArr(RFMDataArr), [RFMDataArr])
    const calendarScatterMapping = {
        x: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.monetaryAvgDay,
        y: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.frequencyAvgDay,
        colour: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.amountToday,
        size: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.timeToday,
        shape: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.isCredit
    }
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
                        <RFMDataArrContext.Provider value={RFMDataArr}>
                            <RFMDataMapContext.Provider value={RFMDataMap}>
                                {MONTHS.map((month, i) => <MonthView month={i + 1}
                                    monthData={transactionDataArr.filter(d => d.date?.getMonth() === i && d.date.getFullYear() === currentYear)}
                                    handleDetail={handleDetail}
                                    key={i + 1} />)}
                            </RFMDataMapContext.Provider>
                        </RFMDataArrContext.Provider>
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
                <DayView day={i + 1} dayData={monthData.filter(d => d.date?.getDate() === i + 1)} handleDetail={handleDetail(month)} key={i + 1} />)}
        </tr>)
    } else {
        throw new Error("year is undefined");
    }
}

/**
 * @param day the number of the day in the month
 * @param dayData transactionData of the day
 * @param handleDetail event handler that tell the parents what has been selected
 */
function DayView({ day, dayData, handleDetail }: { day: number, dayData: TransactionData[], handleDetail: (arg0: number) => void }) {
    const RFMDataArr = useContext(RFMDataArrContext);
    const RFMDataMap = useContext(RFMDataMapContext);

    if (RFMDataArr === undefined || RFMDataMap === undefined) {
        return <td>error</td>
    }

    const transactionDescriptions = Array.from(new Set(dayData.map((transactionData: TransactionData) => transactionData.transactionDescription))); // O(N)

    // aggregate data to transaction description level; O(N^2), can be optimised
    const dataPerTransactionDescriptionArr: DataPerTransactionDescription[] = transactionDescriptions.map(transactionDescription => {
        const RFMDataRecord: RFMData | undefined = getRFMData(transactionDescription, RFMDataMap, RFMDataArr);
        if (RFMDataRecord === undefined) {
            console.log(transactionDescription, RFMDataMap, RFMDataArr)
            throw new AssertionError({ message: `RFM Data of ${transactionDescription} not found` });
        }
        else {
            return {
                transactionDescription: transactionDescription,
                monetaryAvgDay: RFMDataRecord.frequencyAvgDay,
                frequencyAvgDay: RFMDataRecord.monetaryAvgDay,
                amountToday: dayData.filter(d => d.transactionDescription === transactionDescription).reduce((a, b) => a + (b.isCredit() ? b.creditAmount : b.debitAmount), 0),
                timeToday: dayData.filter(d => d.transactionDescription === transactionDescription).length,
                isCredit: dayData.filter(d => d.transactionDescription === transactionDescription)[0].isCredit()
            }
        }
    });
    return (
        <td>
            <button onClick={() => { handleDetail(day); console.log(dayData); console.log(dataPerTransactionDescriptionArr) }}>{dayData.length}</button>
        </td>
    )
}

/**
 * 
 * @param RFMDataArr an array of RFMDataArr
 * @returns a map where the key is transactionDescription and value is the index of the RFMDataArr
 */
function getRFMDataMapFromArr(RFMDataArr: RFMData[]): Map<String, number> {
    const RFMDataMap: Map<String, number> = new Map();
    RFMDataArr.forEach((currRFMData, index) => {
        RFMDataMap.set(currRFMData.transactionDescription, index)
    })
    return RFMDataMap
}

const getRFMData = (transactionDescription: String, RFMDataMap: Map<String, number>, RFMDataArr: RFMData[]): RFMData | undefined => {
    const index: number | undefined = RFMDataMap.get(transactionDescription)
    return index !== undefined ? RFMDataArr[index] : undefined
}