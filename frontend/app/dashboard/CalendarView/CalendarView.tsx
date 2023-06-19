import { useState } from "react";
import { CTransaction, ETransactionVariable } from "../Transaction";
import { CalendarSvg, ICalendarSvgData } from "./CalendarSvg/CalendarSvg";
import { getCalendarSvgTestData } from "./calenderSvgTestData"
import { CalendarController } from "./CalendarController/CalendarController";
import styles from './calendarView.module.css'
const randomSvgData: ICalendarSvgData[] = getCalendarSvgTestData()
const defaultSvgConfig = {
    marginLeft: 25,
    marginRight: 5,
    marginTop: 20,
    marginBottom: 5,
    containerWidth: 900,
    containerHeight: 200
}
export interface IMapping {
    visualVariable: ECalendarViewVisualVariables,
    dataVariable: ETransactionVariable | null
}
enum ECalendarViewVisualVariables {
    colour = 'colour',
    size = 'size',
    shape = 'shape',
    texture = 'texture'
}
export default function CalendarView({ transactions }: { transactions: CTransaction[] | null }) {

    const [year, setYear] = useState('2015');
    const [mappings, setMappings] = useState<IMapping[]>([{
        visualVariable: ECalendarViewVisualVariables.colour,
        dataVariable: ETransactionVariable.category
    }, {
        visualVariable: ECalendarViewVisualVariables.shape,
        dataVariable: ETransactionVariable.creditAmount
    }, {
        visualVariable: ECalendarViewVisualVariables.size,
        dataVariable: null
    }, {
        visualVariable: ECalendarViewVisualVariables.texture,
        dataVariable: null
    }
    ]);
    const [filters, setFilters] = useState()
    function handleSetYear(year: string) {
        setYear(year)
    }
    function handleSetMappings(newVisualVariable: ECalendarViewVisualVariables, newDataVariable: IMapping['dataVariable']) {
        setMappings(mappings.map(mapping=>{
            if (mapping.visualVariable==newVisualVariable) {
                return {visualVariable: newVisualVariable, dataVariable: newDataVariable}
            } else {
                return mapping
            }
        }))
    }
    const svgData = randomSvgData; // need to be calculated by filters and mappings
    const svgConfig = defaultSvgConfig;// could add interactivity in future.
    const isLoading = transactions === null;

    console.log(svgData)
    if (isLoading) {
        return (<h1> Loading
        </h1>)
    } else {
        const transactionVariables: ETransactionVariable[] = transactions[0].attributes;
        return (
            <div className={styles.calendarViewContainer + ' p-1'}>
                <br></br>
                number of transaction record: {transactions.length}
                <CalendarSvg calendarSvgDataArr={svgData} calendarSvgConfig={svgConfig} ></CalendarSvg>
                <CalendarController year={year} handleSetYear={handleSetYear} mappings={mappings} transactionVariables={transactionVariables}></CalendarController>
            </div>
        )
    }
}
