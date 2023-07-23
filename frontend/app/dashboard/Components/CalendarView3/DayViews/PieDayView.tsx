import { TransactionData } from "../../../utilities/DataObject";
import * as d3 from 'd3';
import { Data, getDataFromTransactionAmountSumByDayYMD, getDataFromTransactionDataMapYMD } from "../CalendarView3";
import { useMemo, useRef } from "react";
import { PublicScale } from "../../../utilities/types";
import { PUBLIC_VALUEGETTER } from "@/app/dashboard/utilities/consts";
import { useAppSelector } from "@/app/hooks";
import * as pieDayViewSlice from "./pieDayViewSlice"
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
    //reference: Holtz, Y. (n.d.). Pie chart with React. Retrieved 17 July 2023, from https://www.react-graph-gallery.com/pie-plot
    const { day, month, currentYear, data, scales, valueGetter, containerSize } = props;
    const { highLightedTransactionNumberSetByBrusher, highLightedColourDomainValueSetByLegend, transactionDataMapYMD, transactionAmountSumMapByDayYMD } = data
    const dayData = useMemo(() => {
        return getDataFromTransactionDataMapYMD(transactionDataMapYMD, day, month, currentYear);
    }, [day, month, currentYear, transactionDataMapYMD])

    // configs
    const { containerWidth, containerHeight } = containerSize

    // used as the domain for the radius
    const dayTotalTransactionAmount = useMemo(() => {
        return getDataFromTransactionAmountSumByDayYMD(transactionAmountSumMapByDayYMD, day, month, currentYear)
    }, [day, month, currentYear, transactionAmountSumMapByDayYMD])

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

    const ref = useRef(null)
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
    const brushingMode = highLightedTransactionNumberSetByBrusher.size > 0;
    const paths = useMemo(() => {
        const paths = arcs.map((arc, i) => {
            let opacity: number;
            let stroke: string = ''
            const transactionData = dayData[i]
            if (!brushingMode) {
                opacity = highLightedColourDomainValueSetByLegend.has(PUBLIC_VALUEGETTER.colour(transactionData)) ? 1 : 0.3
                if (opacity === 1 && highLightedColourDomainValueSetByLegend.size < colourScale.domain().length) {
                    stroke = 'black'
                }
            } else {
                opacity = highLightedTransactionNumberSetByBrusher.has(transactionData.transactionNumber) &&
                    highLightedColourDomainValueSetByLegend.has(PUBLIC_VALUEGETTER.colour(transactionData)) ? 1 : 0.3
                if (opacity === 1 && highLightedColourDomainValueSetByLegend.size < colourScale.domain().length) {
                    stroke = 'black'
                }
            }

            return <path id={transactionData.transactionNumber + 'pie'} key={i} d={arc === null ? undefined : arc} fill={colourScale(valueGetter.colour(transactionData))}
                opacity={opacity} stroke={stroke}
            />;
        })
        return paths
    }, [arcs, colourScale, valueGetter, dayData, highLightedTransactionNumberSetByBrusher, highLightedColourDomainValueSetByLegend])

    return (
        <svg width={containerWidth} height={containerHeight}>
            <g ref={ref} transform={`translate(${containerWidth * 0.5},${containerHeight * 0.5})`}>
                {paths}
            </g>
        </svg>);
}
