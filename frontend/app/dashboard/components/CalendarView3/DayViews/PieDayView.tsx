import { TransactionData } from "../../../utilities/DataObject";
import * as d3 from 'd3';
import { Data, getDataFromTransactionAmountSumByDayMD, getDataFromTransactionAmountSumByDayYMD, getDataFromTransactionDataMapMD, getDataFromTransactionDataMapYMD } from "../CalendarView3";
import { useMemo, useRef } from "react";
import { PublicScale } from "../../../utilities/types";
import { GRAY1, PUBLIC_VALUEGETTER } from "@/app/dashboard/utilities/consts";
import { useAppSelector } from "@/app/hooks";
import * as pieDayViewSlice from "./pieDayViewSlice"
import * as calendarViewSlice from "../calendarViewSlice"
import useCalendarDayGlyphTransactionDataArr from "./useDayData";
let sumArc = 0;
export type PieCalendarViewSharedScales = {
    colourScale: PublicScale['colourScale'],
    linearRadiusScale: d3.ScaleLinear<number, number, never>,
    logRadiusScale: d3.ScaleLogarithmic<number, number, never>
};
export type PieCalendarViewValueGetter = {
    colour: (d: TransactionData) => string;
    value: (d: TransactionData) => number;
    name: (d: TransactionData) => string;
};
export type PieDayViewProps = {
    /**1to31 */
    day: number;
    /**1to12 */
    month: number;
    currentYear: number;
    data: Data;
    scales: PieCalendarViewSharedScales;
    valueGetter: PieCalendarViewValueGetter;
    containerSize: { containerWidth: number, containerHeight: number }
};
export const pieCalendarViewValueGetter: PieCalendarViewValueGetter = {
    colour: (d: TransactionData) => d.category,
    value: (d: TransactionData) => d.transactionAmount,
    name: (d: TransactionData) => d.transactionNumber
};
export function PieDayView(props: PieDayViewProps) {
    //I modify the code from here (reference) : Holtz, Y. (n.d.). Pie chart with React. Retrieved 17 July 2023, from https://www.react-graph-gallery.com/pie-plot
    const { day, month, currentYear, data, scales, valueGetter, containerSize } = props;
    const { highLightedTransactionNumberSetByBrusher, transactionDataMapYMD, transactionAmountSumMapByDayYMD, transactionDataMapMD, transactionAmountSumMapByDayMD } = data
    const isSuperPositioned = useAppSelector(calendarViewSlice.selectIsSuperPositioned);

    /** 
     * if isSuperPositioned = true, dayData is an array of all the transactionData whose month and day are the same as props.day and props.month
     * 
     * if isSuperPositioned = false, dayData is an array of all the transactionData whose year, month and day are the same as props.day, props.month and props.currentyear
    */
    const dayData = useCalendarDayGlyphTransactionDataArr(day, month, currentYear, transactionDataMapYMD, transactionDataMapMD, isSuperPositioned)
    // console.log(`pie day view day data:  ${day}-${month}--${isSuperPositioned ? 'superpositioned' : currentYear}`, dayData)

    // configs
    const { containerWidth, containerHeight } = containerSize

    // used as the domain for the radius
    /** 
     * if isSuperPositioned = true, dayTotalTransactionAmount is the sum of the transactionAmount of all the transactionData whose month and day are the same as props.day and props.month
     * 
     * if isSuperPositioned = false, dayTotalTransactionAmount is the sum of the transactionAmount of all the transactionData whose year, month and day are the same as props.day, props.month and props.currentyear
    */
    const dayTotalTransactionAmount = useMemo(() => {
        if (isSuperPositioned) {
            return getDataFromTransactionAmountSumByDayMD(transactionAmountSumMapByDayMD, day, month)
        } else {
            return getDataFromTransactionAmountSumByDayYMD(transactionAmountSumMapByDayYMD, day, month, currentYear)
        }
    }, [day, month, currentYear, transactionAmountSumMapByDayYMD, transactionAmountSumMapByDayMD, isSuperPositioned])

    const radiusScaleType: 'linear' | 'log' | 'constant' = useAppSelector(pieDayViewSlice.selectRadiusAxis)
    const { colourScale, linearRadiusScale, logRadiusScale } = scales;
    const radius = useMemo(() => {
        switch (radiusScaleType) {
            case 'linear':
                return linearRadiusScale(dayTotalTransactionAmount)
            case 'log':
                return logRadiusScale(dayTotalTransactionAmount)
            case 'constant':
                return containerWidth
        }
    }, [dayTotalTransactionAmount, radiusScaleType, linearRadiusScale, logRadiusScale, containerWidth])

    const arcs = useMemo(() => {
        const pieGenerator = d3.pie<TransactionData>().value(valueGetter.value); // value is for angle
        const arcGenerator = d3.arc();
        const pie = pieGenerator(dayData);
        const arcs = pie.map((p) => arcGenerator({
            innerRadius: 0,
            outerRadius: radius / 2,
            startAngle: p.startAngle,
            endAngle: p.endAngle
        }));
        return arcs
    }, [valueGetter, dayData, containerWidth, radius])
    const paths = useMemo(() => {
        const paths = arcs.map((arc, i) => {
            const { category, transactionNumber } = dayData[i]
            return <path id={transactionNumber + 'pie'} key={i} d={arc === null ? undefined : arc} fill={colourScale.getColour(category, transactionNumber)}
                opacity={1}
            />;
        })
        return paths
    }, [arcs, colourScale, valueGetter, dayData])

    return (
        <svg width={containerWidth} height={containerHeight}>
            <g transform={`translate(${containerWidth * 0.5},${containerHeight * 0.5})`}>
                {paths}
            </g>
        </svg>);
}
