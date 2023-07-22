import { TransactionData } from "../../../utilities/DataObject";
import * as d3 from 'd3';
import { Data, getDataFromTransactionDataMapYMD } from "../CalendarView3";
import { useMemo, useRef } from "react";
import { PublicScale } from "../../../utilities/types";

type PieCalendarViewSharedScales = {
    colourScale: PublicScale['colourScale'];
};
type PieCalendarViewValueGetter = {
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
    const dayData = useMemo(() => {
        return getDataFromTransactionDataMapYMD(data.transactionDataMapYMD, day, month, currentYear);
    }, [day, month, currentYear])
    const highLightedTransactionNumberSet = data.highLightedTransactionNumberSet
    const { colourScale } = scales;

    // configs
    const { containerWidth, containerHeight } = containerSize

    const ref = useRef(null)
    const arcs = useMemo(() => {
        console.time('getArcs')
        const pieGenerator = d3.pie<TransactionData>().value(valueGetter.value);
        const arcGenerator = d3.arc();
        const pie = pieGenerator(dayData);
        const arcs = pie.map((p) => arcGenerator({
            innerRadius: 0,
            outerRadius: containerWidth / 2,
            startAngle: p.startAngle,
            endAngle: p.endAngle
        }));
        console.timeEnd('getArcs')
        return arcs
    }, [valueGetter, dayData, containerWidth])
    const highlightMode = data.highLightedTransactionNumberSet.size > 0;
    const paths = useMemo(() => {
        return arcs.map((arc, i) => {
            return <path id={dayData[i].transactionNumber + 'pie'} key={i} d={arc === null ? undefined : arc} fill={colourScale(valueGetter.colour(dayData[i]))}
                opacity={highlightMode && !data.highLightedTransactionNumberSet.has(dayData[i].transactionNumber) ? 0.1 : 1}
            />;
        })
    }, [arcs, colourScale, valueGetter, dayData, highLightedTransactionNumberSet])

    return (
        <svg width={containerWidth} height={containerHeight}>
            <g ref={ref} transform={`translate(${containerWidth * 0.5},${containerHeight * 0.5})`}>
                {paths}
            </g>
        </svg>);
}
