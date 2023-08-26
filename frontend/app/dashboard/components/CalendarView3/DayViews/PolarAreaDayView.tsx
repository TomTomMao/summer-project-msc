import { ScaleOrdinalWithTransactionNumber } from "@/app/dashboard/hooks/useColourScales";
import { Data } from "../CalendarView3";
import { TransactionData } from "@/app/dashboard/utilities/DataObject";
import useCalendarDayGlyphTransactionDataArr from "./useDayData";
import { useAppSelector } from "@/app/hooks";
import PolarAreaChart, { PolarAreaChartDatum } from "./PolarAreaChart";
import * as calendarViewSlice from "../calendarViewSlice";
import { GRAY1 } from "@/app/dashboard/utilities/consts";
import * as d3 from "d3";
import { useMemo } from "react";
import { selectRadiusAxis } from "./polarAreaDayViewSlice";

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
    // const radiusScaleType = useAppSelector(polarAreaDayViewSlice.selectRadiusAxis) 
    let radiusScaleType = useAppSelector(selectRadiusAxis)
    const { day, month, currentYear, data, scales, containerSize } = props
    const { containerWidth, containerHeight } = containerSize
    const { colourScale, linearRadiusScale, logRadiusScale, angleScale, categoryOrderMap: categoryOrder } = scales
    const { transactionDataMapYMD, transactionDataMapMD, highLightedTransactionNumberSetByBrusher } = data
    const dayData: TransactionData[] = useCalendarDayGlyphTransactionDataArr(day, month, currentYear, transactionDataMapYMD, transactionDataMapMD, isSuperPositioned)

    // prepare chart data, the order should based on categoryOrderMap, if a category exists in categoryOrder, it must exist in the chart data
    const chartData = useMemo(() => {
        // initialise the chartData, set the transactionAmount of the category 0, and set the colour based on colourScale and it's category
        const chartData: PolarAreaChartDatum[] = createInitChartData(categoryOrder)
        // sum the transactionAmount for the chartData and set the colour
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
                if (highLightedTransactionNumberSetByBrusher.size === 0 || highLightedTransactionNumberSetByBrusher.has(transactionData.transactionNumber)) {
                    chartData[index].colour = colourScale.getColour(transactionData.category)
                }
            }
        })
        return chartData
    }, [categoryOrder, colourScale, dayData, highLightedTransactionNumberSetByBrusher])

    const radiusScale = useMemo(() => {
        if (isNaN(logRadiusScale(logRadiusScale.domain()[0]))) {
            console.log(`something wrong with logradius scale, domain: ${logRadiusScale.domain()}, range: ${logRadiusScale.range()}`, logRadiusScale)
            throw new Error(`something wrong with logradius scale, domain: ${logRadiusScale.domain()}, range: ${logRadiusScale.range()}`);
        }
        if (isNaN(linearRadiusScale(linearRadiusScale.domain()[0]))) {
            console.log(`something wrong with linearradius scale, domain: ${linearRadiusScale.domain()}, range: ${linearRadiusScale.range()}`, linearRadiusScale)
            throw new Error(`something wrong with linearradius scale, domain: ${linearRadiusScale.domain()}, range: ${linearRadiusScale.range()}`);
        }
        switch (radiusScaleType) {
            case "logGlobal":
                return logRadiusScale
            case "linearGlobal":
                return linearRadiusScale
            case "logLocal":
                const maxLog = d3.max(chartData, (chartDatum => chartDatum.value))
                if (maxLog === undefined) { return null }
                return d3.scaleLog().domain([0.0001, maxLog]).range([0, Math.min(...[containerHeight, containerWidth]) / 2])
            case "linearLocal":
                const maxLinear = d3.max(chartData, (chartDatum => chartDatum.value))
                if (maxLinear === undefined) { return null }
                return d3.scaleLinear().domain([0, maxLinear]).range([0, Math.min(...[containerHeight, containerWidth]) / 2])
            default:
                const _exhaustiveCheck: never = radiusScaleType
                throw new Error("_exhaustiveCheck error");
        }
    }, [linearRadiusScale, logRadiusScale, radiusScaleType, chartData, containerWidth, containerHeight])
    if (radiusScale === null) {
        return <>error</>
    } else {
        return (
            <PolarAreaChart data={chartData} radiusScale={radiusScale} angleScale={angleScale}
            ></PolarAreaChart>
        )
    }
}

// todo for performance: create a memorised function that return the spreaded initChartData, to avoid calling getColour again and again for each day glyph
/**
 * prepare chart data, the order should based on categoryOrder, if a category exists in categoryOrder, it must exist in the chart data
 * initialise the chartData, set the transactionAmount of the category 0, and set the colour based on colourScale and it's category
 * @param categoryOrder Map<string, number>
 * @param colourScale domain must be category value
 * @returns an array of PolarAreaChartDatum, for each array element, the index will be the same of the categoryOrder.get(element.name) 
 */
const createInitChartData = (categoryOrder: PolarAreaViewSharedScales['categoryOrderMap']) => {

    const chartData: PolarAreaChartDatum[] = Array(categoryOrder.size)
    categoryOrder.forEach((index, category) => {
        chartData[index] = {
            name: category,
            value: 0,
            colour: GRAY1
        }
    })
    return chartData
}
