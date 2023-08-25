import { ScaleOrdinalWithTransactionNumber } from "@/app/dashboard/hooks/useColourScales";
import { Data } from "../CalendarView3";
import { TransactionData } from "@/app/dashboard/utilities/DataObject";
import useCalendarDayGlyphTransactionDataArr from "./useDayData";
import { useAppSelector } from "@/app/hooks";
import { PolarAreaChartDatum } from "./PolarAreaChart";
import * as calendarViewSlice from "../calendarViewSlice";
import { GRAY1 } from "@/app/dashboard/utilities/consts";

export type PolarAreaViewSharedScales = {
    colourScale: ScaleOrdinalWithTransactionNumber;
    linearRadiusScale: d3.ScaleLinear<number, number>;
    logRadiusScale: d3.ScaleLogarithmic<number, number>;
    angleScale: d3.ScaleLinear<number, number>;
    categoryOrderMap: Map<TransactionData['category'], number>;
}

export type PolarAreaDayViewProps = {
    /**1 to 31 */
    day: number;
    /**1to12 */
    month: number;
    currentYear: number;
    data: Data;
    scales: PolarAreaViewSharedScales;
    containerSize: { containerWidth: number, containerHeight: number }
}
export function PolarAreaDayView(props: PolarAreaDayViewProps) {
    const isSuperPositioned = useAppSelector(calendarViewSlice.selectIsSuperPositioned)
    const { day, month, currentYear, data, scales, containerSize } = props
    const { colourScale, linearRadiusScale, logRadiusScale, angleScale, categoryOrderMap: categoryOrder } = scales
    const { transactionDataMapYMD, transactionDataMapMD, categorySetWithSelectedTransaction } = data
    const dayData: TransactionData[] = useCalendarDayGlyphTransactionDataArr(day, month, currentYear, transactionDataMapYMD, transactionDataMapMD, isSuperPositioned)

    // prepare chart data, the order should based on categoryOrderMap, if a category exists in categoryOrder, it must exist in the chart data
    // initialise the chartData, set the transactionAmount of the category 0, and set the colour based on colourScale and it's category
    const chartData: PolarAreaChartDatum[] = createInitChartData(categoryOrder, colourScale, categorySetWithSelectedTransaction)
    // sum the transactionAmount for the chartData
    dayData.forEach(transactionData => {
        const index: number | undefined = categoryOrder.get(transactionData.category)
        if (index === undefined) {
            throw new Error(`category in day data doesn't exist in the categoryOrder map`
                + ` year:${isSuperPositioned ? 'superpositioned' : currentYear}`
                + ` month:${month}`
                + ` day:${day}`
                + ` category:${transactionData.category}`
                + ` categoryOrderList:${JSON.stringify(Array.from(categoryOrder))}`
            );
        } else if (transactionData.category !== chartData[index].name) {
            throw new Error('the order of name in chartData is inconsistent with the categoryOrder')
        } else {
            chartData[index].value += transactionData.transactionAmount
        }
    })
    return (
        <div><button onClick={() => console.log(chartData)}>chartData</button></div>
    )
}

// todo for performance: create a memorised function that return the spreaded initChartData, to avoid calling getColour again and again for each day glyph
/**
 * prepare chart data, the order should based on categoryOrder, if a category exists in categoryOrder, it must exist in the chart data
 * initialise the chartData, set the transactionAmount of the category 0, and set the colour based on colourScale and it's category
 * @param categoryOrder Map<string, number>
 * @param colourScale domain must be category value
 * @returns an array of PolarAreaChartDatum, for each array element, the index will be the same of the categoryOrder.get(element.name) 
 */
const createInitChartData = (categoryOrder: PolarAreaViewSharedScales['categoryOrderMap'],
    colourScale: PolarAreaViewSharedScales['colourScale'],
    categorySetWithSelectedTransaction: Data['categorySetWithSelectedTransaction']) => {

    const chartData: PolarAreaChartDatum[] = Array(categoryOrder.size)
    categoryOrder.forEach((index, category) => {
        chartData[index] = {
            name: category,
            value: 0,
            colour: categorySetWithSelectedTransaction.has(category) || categorySetWithSelectedTransaction.size === 0 ? colourScale.getColour(category) : GRAY1
        }
    })
    return chartData
}
