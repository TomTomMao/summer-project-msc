'use client';
import { useMemo } from "react";
import * as d3 from 'd3';
// reference: Holtz, Y. (n.d.). How to build a scatter plot with React and D3. Retrieved 13 July 2023, from https://www.react-graph-gallery.com/scatter-plo
type AxisBottomProps =
    {
        xScale: d3.ScaleLinear<number, number>
        numberOfTicksTarget: number;
    } | {
        xScale: d3.ScaleLogarithmic<number, number>;
        numberOfTicksTarget: number;
    }
// tick length
const TICK_LENGTH = 6;

export const AxisBottom = ({ xScale, numberOfTicksTarget }: AxisBottomProps) => {
    const range = xScale.range();
    const ticks = useMemo(() => {
        if (xScale.hasOwnProperty('base')) {
            const format = d3.scaleLog<number, number>(xScale.domain(), xScale.range()).tickFormat() // reference this for solving the problem that too many ticks appear: https://d3js.org/d3-scale/log
            return xScale.ticks(numberOfTicksTarget).map((value) => ({
                value: format(value) === '' ? '' : value,
                xOffset: xScale(value),
            })).filter(ticks => ticks.value !== '');
        } else {
            return xScale.ticks(numberOfTicksTarget).map((value) => ({
                value,
                xOffset: xScale(value),
            }));
        }
    }, [xScale]);
    return (
        <>
            {/* Main horizontal line */}
            <path
                d={["M", range[0], 0, "L", range[1], 0].join(" ")}
                fill="none"
                stroke="currentColor" />

            {/* Ticks and labels */}
            {ticks.map(({ value, xOffset }) => (
                <g key={value} transform={`translate(${xOffset}, 0)`}>
                    <line y2={TICK_LENGTH} stroke="currentColor" />
                    <text
                        key={value}
                        style={{
                            fontSize: "10px",
                            textAnchor: "middle",
                            transform: "translateY(20px)",
                        }}
                    >
                        {value}
                    </text>
                </g>
            ))}
        </>
    );
};
type AxisLeftProps = {
    yScale: d3.ScaleLinear<number, number>;
    numberOfTicksTarget: number;
} | {
    yScale: d3.ScaleLogarithmic<number, number>;
    numberOfTicksTarget: number;
}

export const AxisLeft = ({ yScale, numberOfTicksTarget }: AxisLeftProps) => {
    const range = yScale.range();
    const ticks = useMemo(() => {
        if (yScale.hasOwnProperty('base')) {
            const format = d3.scaleLog<number, number>(yScale.domain(), yScale.range()).tickFormat() // reference this for solving the problem that too many ticks appear: https://d3js.org/d3-scale/log
            return (yScale as d3.ScaleLogarithmic<number, number>).ticks(numberOfTicksTarget).map((value) => ({
                value: format(value) === '' ? '' : value,
                yOffset: yScale(value),
            })).filter(ticks => ticks.value !== '');
        } else {
            return (yScale as d3.ScaleLinear<number, number>).ticks(numberOfTicksTarget).map((value) => ({
                value,
                yOffset: yScale(value),
            }));
        }
    }, [yScale]);
    console.log(ticks)
    return (
        <>
            {/* Main vertical line */}
            <path
                d={["M", 0, range[0], "L", 0, range[1]].join(" ")}
                fill="none"
                stroke="currentColor"
            />

            {/* Ticks and labels */}
            {ticks.map(({ value, yOffset }) => (
                <g key={value} transform={`translate(0, ${yOffset})`}>
                    <line x2={-TICK_LENGTH} stroke="currentColor" />
                    <text
                        key={value}
                        style={{
                            fontSize: "10px",
                            textAnchor: "middle",
                            transform: "translateX(-20px)",
                        }}
                    >
                        {value}
                    </text>
                </g>
            ))}
        </>
    );
};
