import { useMemo } from "react";
import { TransactionData } from "../../../utilities/DataObject";
import * as d3 from 'd3';

import { Data, getDataFromTransactionDataMapMD, getDataFromTransactionDataMapYMD } from "../CalendarView3";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import * as barDayViewSlice from "./barDayViewSlice";
import * as calendarViewSlice from "../calendarViewSlice";
import { PublicScale } from "@/app/dashboard/utilities/types";
import useCalendarDayGlyphTransactionDataArr from "./useDayData";

export type BarGlyphScalesLinearHeight = {
    xScale: d3.ScaleBand<string>, // x scale should be independent between different scales.
    heightScale: d3.ScaleLinear<number, number, never>,
    colourScale: PublicScale['colourScale']
}
export type BarGlyphScalesLogHeight = {
    xScale: d3.ScaleBand<string>, // x scale should be independent between different scales.
    heightScale: d3.ScaleLogarithmic<number, number, never>,
    colourScale: PublicScale['colourScale']
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
export const barCalendarViewValueGetter: BarCalendarViewValueGetter = {
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
    const maxTransactionCountOfDay: number = useAppSelector(barDayViewSlice.selectMaxTransactionCountOfDay); // todo, take it from the calendarview component
    const maxTransactionCountOfDaySuperpositioned: number = useAppSelector(barDayViewSlice.selectMaxTransactionCountOfDaySuperpositioned); // todo, take it from the calendarview component
    const isSuperPositioned = useAppSelector(calendarViewSlice.selectIsSuperPositioned)
    // configs
    const isSharedBandWidth = useAppSelector(barDayViewSlice.selectIsSharedBandWidth)
    const sortingKey = useAppSelector(barDayViewSlice.selectSortingKey);
    const isDesc = useAppSelector(barDayViewSlice.selectIsDesc);
    const heightAxis = useAppSelector(barDayViewSlice.selectHeightAxis);

    // configs, from the props
    const { containerWidth, containerHeight } = containerSize

    const comparator = useMemo(() => TransactionData.curryCompare(sortingKey, isDesc), [sortingKey, isDesc]);

    // highLightedTransactionNumberSetByBrusher used for checking if the transaction is selected when rendering or creating rectangles
    const { transactionDataMapYMD, transactionDataMapMD, highLightedTransactionNumberSetByBrusher } = data;
    const { heightScaleLog, heightScaleLinear, colourScale } = scales; // heightScale for bar glyph, colourScale for category
    const heightScale = heightAxis === 'log' ? heightScaleLog : heightScaleLinear;

    const dayData = useCalendarDayGlyphTransactionDataArr(day, month, currentYear, transactionDataMapYMD, transactionDataMapMD, isSuperPositioned)
    const sortedDayData = useMemo(() => d3.sort(dayData, comparator), [dayData])


    // cache the bars of all the years.
    const barsOfEachYear: { year: number; bars: JSX.Element[]; }[] = useMemo(() => {
        const years = Array.from(data.transactionDataMapYMD.keys())
        years.push(-1)
        const barsOfEachYear: { year: number; bars: JSX.Element[]; }[] = [];
        for (let year of years) {
            const dayData: TransactionData[] = year !== -1 ? getDataFromTransactionDataMapYMD(transactionDataMapYMD, day, month, year) : getDataFromTransactionDataMapMD(transactionDataMapMD, day, month);
            const sortedDayData = d3.sort(dayData, comparator);
            let xDomain = Array.from(new Set(sortedDayData.map(valueGetter.x)));
            if (isSharedBandWidth) {
                // fill the domain if use shared band width
                const domainLength = xDomain.length;
                const numberOfBars = year !== -1 ? maxTransactionCountOfDay : maxTransactionCountOfDaySuperpositioned // if -1 , then it is calculating the domain for superpositioned bar glyphs.
                for (let i = 0; i < numberOfBars - domainLength; i++) { xDomain.push(`fill-${i}`); }
            }

            const xScale = d3.scaleBand().domain(xDomain).range([0, containerHeight]);
            const bars: JSX.Element[] = dayData.map(d => {
                const bandWidth = xScale.bandwidth();
                const rectHeight = heightScale(valueGetter.height(d));
                return (
                    <rect
                        key={d.transactionNumber}
                        x={xScale(valueGetter.x(d))}
                        y={containerHeight - rectHeight}
                        width={bandWidth}
                        height={containerHeight}
                        fill={colourScale.getColour(valueGetter.colour(d), d.transactionNumber)}
                    />
                );
            });
            barsOfEachYear.push({ year: year, bars: bars });
        }
        return barsOfEachYear;
    }, [data, heightAxis, colourScale, valueGetter, isSharedBandWidth, sortingKey, isDesc, containerWidth, containerHeight]);
    const dispatch = useAppDispatch()
    const handleHover = () => {
        dispatch(calendarViewSlice.setTooltipContentArr(
            sortedDayData.map(transaction =>
                calendarViewSlice.createTooltipContent(`${transaction.transactionDescription}: ${transaction.transactionAmount.toFixed(2)}`,
                    colourScale.getColour(valueGetter.colour(transaction), transaction.transactionNumber))
            )))
    }
    return (<svg width={containerWidth} height={containerHeight} onMouseEnter={handleHover}>
        {barsOfEachYear.map(d => {
            let shouldDisplay = false;
            if (isSuperPositioned) {
                shouldDisplay = d.year === -1 // -1 is the flag for superpositioned bar glyph
            } else {
                shouldDisplay = d.year === currentYear
            }
            return <g style={{ opacity: shouldDisplay ? 1 : 0 }} key={d.year}>{d.bars}</g>;
        })}
    </svg>);
}
