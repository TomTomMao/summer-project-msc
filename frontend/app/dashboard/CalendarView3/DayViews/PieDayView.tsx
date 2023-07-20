import { TransactionData } from "../../utilities/DataObject";
import * as d3 from 'd3';
import { Data, Day, getDataFromTransactionDataMapYMD } from "../CalendarView3";
import { useEffect, useMemo, useRef } from "react";
import { CalendarViewCellHeight, CalendarViewCellWidth } from "../../utilities/consts";
import { PublicScale } from "../../utilities/types";

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
    onShowDayDetail: (day: number, month: number, year: number) => void;
    detailDay: null | Day;
};
export const pieCalendarViewValueGetter: PieCalendarViewValueGetter = {
    colour: (d: TransactionData) => d.category,
    value: (d: TransactionData) => d.transactionAmount,
    name: (d: TransactionData) => d.transactionNumber
};
export function PieDayView(props: PieDayViewProps) {
    //reference: Holtz, Y. (n.d.). Pie chart with React. Retrieved 17 July 2023, from https://www.react-graph-gallery.com/pie-plot
    const { day, month, currentYear, data, scales, valueGetter, onShowDayDetail, detailDay } = props;
    const dayData = useMemo(() => {
        return getDataFromTransactionDataMapYMD(data.transactionDataMapYMD, day, month, currentYear);
    }, [day, month, currentYear])
    const highLightedTransactionNumberSet = data.highLightedTransactionNumberSet
    const { colourScale } = scales;
    const [width, height] = [CalendarViewCellWidth, CalendarViewCellHeight];
    const ref=useRef(null)
    const arcs = useMemo(() => {
        console.time('getArcs')
        const pieGenerator = d3.pie<TransactionData>().value(valueGetter.value);
        const arcGenerator = d3.arc();
        const pie = pieGenerator(dayData);
        const arcs = pie.map((p) => arcGenerator({
            innerRadius: 0,
            outerRadius: width / 2,
            startAngle: p.startAngle,
            endAngle: p.endAngle
        }));
        console.timeEnd('getArcs')
        return arcs
    }, [valueGetter, dayData])
    const highlightMode = data.highLightedTransactionNumberSet.size > 0;
    const paths = useMemo(() => {
        return arcs.map((arc, i) => {
            return <path id={dayData[i].transactionNumber+'pie'} key={i} d={arc === null ? undefined : arc} fill={colourScale(valueGetter.colour(dayData[i]))}
                opacity={highlightMode && !data.highLightedTransactionNumberSet.has(dayData[i].transactionNumber) ? 0.1 : 1}
            />;
        })
    }, [arcs, colourScale, valueGetter, dayData, highLightedTransactionNumberSet])

    return (
        <svg width={width} height={height}>
            <g ref={ref} transform={`translate(${width * 0.5},${height * 0.5})`}>
                {paths}
            </g>
        </svg>);
}
