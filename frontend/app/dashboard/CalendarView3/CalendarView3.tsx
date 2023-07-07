import { useState } from "react"
import { TransactionData } from "../Transaction"
import { MONTHS } from "./months"
export default function CalendarView3({ rawData, currentYear }: { rawData: TransactionData[], currentYear: number }) {
    const [detailDay, setDetailDay] = useState<null | Date>(null);
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
                        <td></td>
                        {(Array.from(Array(31).keys())).map(i => <td>{i + 1}</td>)}
                    </tr>
                </thead>
                <tbody>
                    {MONTHS.map((month, i) => <MonthView month={i + 1}
                        monthData={rawData.filter(d => d.date?.getMonth() === i && d.date.getFullYear() === currentYear)}
                        handleDetail={handleDetail} />)}
                </tbody>
            </table>
            {detailDay ? <div>selected Day: {detailDay.toString()}</div> : <div></div>}
        </div>
    )
}

function MonthView({ month, monthData, handleDetail }: { month: number, monthData: TransactionData[], handleDetail: (arg0: number) => ((arg0: number) => void) }) {
    // month: jan for 1, feb for 2, etc. 
    return (<tr>
        <td>{MONTHS[month-1]}</td>
        {(Array.from(Array(31).keys())).map(i =>
            <DayView day={i+1} dayData={monthData.filter(d => d.date?.getDate())} handleDetail={handleDetail(month)} key={i+1}/>)}
    </tr>)
}

function DayView({ day, dayData, handleDetail }: { day: number, dayData: TransactionData[], handleDetail: (arg0: number) => void }) {
    return (
        <td>
            <button onClick={() => handleDetail(day)}>{day}</button>
        </td>
    )
}
