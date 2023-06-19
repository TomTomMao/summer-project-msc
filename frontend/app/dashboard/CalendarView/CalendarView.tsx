import { useState } from "react";
import { CTransaction } from "../Transaction";
import { CalendarSvg, ICalendarSvgData } from "./CalendarSvg/CalendarSvg";
import { getCalendarSvgTestData } from "./calenderSvgTestData"
import { CalendarController } from "./CalendarController/CalendarController";

const randomSvgData:ICalendarSvgData[] = getCalendarSvgTestData()
const defaultSvgConfig = {
    marginLeft: 25,
    marginRight: 5,
    marginTop: 20,
    marginBottom: 5,
    containerWidth: 900,
    containerHeight: 200
}
export default function CalendarView({ transactions }: { transactions: CTransaction[] | null }) {
    const [svgData, setSvgData] = useState(randomSvgData)
    const [svgConfig, setSvgConfig] = useState(defaultSvgConfig)

    console.log(svgData)
    if (transactions === null) {
        return <><br></br>loading calendarView</>
    }
    return (
        <div>
            <br></br>
            number of transaction record: {transactions.length}
            <CalendarSvg calendarSvgDataArr={svgData} calendarSvgConfig={svgConfig} ></CalendarSvg>
            <CalendarController></CalendarController>
        </div>
    )
}
