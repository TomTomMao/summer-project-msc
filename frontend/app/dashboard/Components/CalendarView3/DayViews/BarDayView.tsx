import { useMemo } from "react";
import { TransactionData } from "../../../utilities/DataObject";
import * as d3 from 'd3';

import { Config, ConfigContext } from "../../ConfigProvider";
import { Data, getDataFromTransactionDataMapYMD } from "../CalendarView3";
import { useAppSelector } from "@/app/hooks";
import { selectHeightAxis, selectIsDesc, selectIsSharedBandWidth, selectSortingKey } from "./barDayViewSlice";
import * as calendarViewSlice from '../calendarViewSlice'

export type BarGlyphScalesLinearHeight = {
    xScale: d3.ScaleBand<string>, // x scale should be independent between different scales.
    heightScale: d3.ScaleLinear<number, number, never>,
    colourScale: d3.ScaleOrdinal<string, string, never>
}
export type BarGlyphScalesLogHeight = {
    xScale: d3.ScaleBand<string>, // x scale should be independent between different scales.
    heightScale: d3.ScaleLogarithmic<number, number, never>,
    colourScale: d3.ScaleOrdinal<string, string, never>
}
export type BarGlyphScales = BarGlyphScalesLogHeight | BarGlyphScalesLinearHeight

export type BarCalendarViewValueGetter = {
    x: (d: TransactionData) => string;
    height: (d: TransactionData) => number;
    colour: (d: TransactionData) => string;
};
export type BarCalendarViewSharedScales = {
    heightScaleLog: BarGlyphScalesLogHeight['heightScale'];
    heightScaleLinear: BarGlyphScalesLinearHeight['heightScale'];
    colourScale: BarGlyphScales['colourScale'];
};
export const barGlyphValueGetter: BarCalendarViewValueGetter = {
    x: (d: TransactionData) => d.transactionNumber,
    height: (d: TransactionData) => d.transactionAmount,
    colour: (d: TransactionData) => d.category
};
export type BarDayViewProps = {
    /**1to31 */
    day: number;
    /**1to12 */
    month: number;
    currentYear: number;
    data: Data;
    scales: BarCalendarViewSharedScales;
    valueGetter: BarCalendarViewValueGetter;
    containerSize: { containerWidth: number, containerHeight: number }
};
/**
 * use public scale for transaction amount and public colours scale for Category
 * visualise the chart using barGlyph, each bar represents a transaction with unique transaction id, height maps transaction amount
 * @param day the number of the day in the month between 1 to 31
 * @param month the number of the month in the year between 1 to 12
 */
export function BarDayView(props: BarDayViewProps) {
    const { day, month, currentYear, data, scales, valueGetter, containerSize } = props;
    const maxTransactionCountOfDay: number = 28; // todo, take it from the calendarview component

    // configs
    const isSharedBandWidth = useAppSelector(selectIsSharedBandWidth)
    const sortingKey = useAppSelector(selectSortingKey);
    const isDesc = useAppSelector(selectIsDesc);
    const heightAxis = useAppSelector(selectHeightAxis);

    // configs, from the props
    const { containerWidth, containerHeight } = containerSize

    const comparator = useMemo(() => TransactionData.curryCompare(sortingKey, isDesc), [sortingKey, isDesc]);

    // highLightedTransactionNumberSet used for checking if the transaction is selected when rendering or creating rectangles
    const { transactionDataMapYMD, highLightedTransactionNumberSet } = data;
    const highlightMode = highLightedTransactionNumberSet.size > 0; // for deciding the style of rect
    const { heightScaleLog, heightScaleLinear, colourScale } = scales; // heightScale for bar glyph, colourScale for category
    const heightScale = heightAxis === 'log' ? heightScaleLog : heightScaleLinear;

    // cache the bars of all the years.
    const barsOfEachYear: { year: number; bars: JSX.Element[]; }[] = useMemo(() => {
        const years = Array.from(data.transactionDataMapYMD.keys());
        const barsOfEachYear: { year: number; bars: JSX.Element[]; }[] = [];
        for (let year of years) {
            const dayData = getDataFromTransactionDataMapYMD(transactionDataMapYMD, day, month, year);
            const sortedDayData = d3.sort(dayData, comparator);
            let xDomain = Array.from(new Set(sortedDayData.map(valueGetter.x)));
            if (isSharedBandWidth) {
                // fill the domain if use shared band width
                const domainLength = xDomain.length;
                for (let i = 0; i < maxTransactionCountOfDay - domainLength; i++) { xDomain.push(`fill-${i}`); }
            }

            const xScale = d3.scaleBand().domain(xDomain).range([0, containerHeight]);
            const bars: JSX.Element[] = dayData.map(d => {
                const bandWidth = xScale.bandwidth();
                const rectHeight = heightScale(valueGetter.height(d));
                const isThisDataHighLighted = highLightedTransactionNumberSet.has(d.transactionNumber);
                return (
                    <rect
                        key={d.transactionNumber}
                        x={xScale(valueGetter.x(d))}
                        y={containerHeight - rectHeight}
                        width={bandWidth}
                        height={containerHeight}
                        fill={colourScale(valueGetter.colour(d))}
                        opacity={highlightMode && !isThisDataHighLighted ? 0.1 : 1} />
                );
            });
            barsOfEachYear.push({ year: year, bars: bars });
        }
        return barsOfEachYear;
    }, [data, heightAxis, colourScale, valueGetter, isSharedBandWidth, sortingKey, isDesc, containerWidth, containerHeight]);

    return (<svg width={containerWidth} height={containerHeight}>
        {barsOfEachYear.map(d => { return <g style={{ opacity: d.year === currentYear ? 1 : 0 }} key={d.year}>{d.bars}</g>; })}
    </svg>);
}
