'use client';
import { useMemo } from "react";
import * as d3 from 'd3';
// reference: Holtz, Y. (n.d.). How to build a scatter plot with React and D3. Retrieved 13 July 2023, from https://www.react-graph-gallery.com/scatter-plot
type AxisBottomProps = {
    xScale: d3.ScaleLinear<number, number>;
    numberOfTicksTarget: number;
};
// tick length
const TICK_LENGTH = 6;

export const AxisBottom = ({ xScale, numberOfTicksTarget }: AxisBottomProps) => {
    const range = xScale.range();

    const ticks = useMemo(() => {
        return xScale.ticks(numberOfTicksTarget).map((value) => ({
            value,
            xOffset: xScale(value),
        }));
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
};

export const AxisLeft = ({ yScale, numberOfTicksTarget }: AxisLeftProps) => {
    const range = yScale.range();

    const ticks = useMemo(() => {

        return yScale.ticks(numberOfTicksTarget).map((value) => ({
            value,
            yOffset: yScale(value),
        }));
    }, [yScale]);

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