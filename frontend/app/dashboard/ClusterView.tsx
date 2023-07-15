'use client';
import { useState, useEffect, useRef, useContext, useMemo } from "react";
import { TransactionData } from "./DataObject";
import * as d3 from 'd3';
import { DataPerTransactionDescription } from "./CalendarView3/DataPerTransactionDescription";
import { AxisBottom, AxisLeft } from "./Axis";

/**
 * render a cluster view using scatter plot
 *
 */
interface ClusterViewValueGetter {
    x: (transactionData: TransactionData) => number,
    y: (transactionData: TransactionData) => number,
    colour: (transactionData: TransactionData) => string,
}

interface Props {
    transactionDataArr: TransactionData[],
    containerHeight: number,
    containerWidth: number,
    valueGetter: ClusterViewValueGetter
}

const DEFAULT_MARGIN = { top: 5, right: 5, bottom: 30, left: 40 };
const DEFAULT_RADIUS = 2;
const DEFAULT_FILL_OPACITY = 0.2;
const DEFAULT_OPACITY = 0.2;
const DEFAULT_STROKE_WIDTH = 1;
/**
 * draw a scatter plot of transactionDataArr, the mapping depends of the valueGetter, support x, y, and colour, assert valueGetter can successfully get value of transactionData
 * @param props
 * @returns 
 */
export function ClusterView(props: Props) {
    const { transactionDataArr, containerHeight, containerWidth, valueGetter } = props;
    const [isSwap, setIsSwap] = useState(false);
    const getColour = valueGetter.colour;
    const getX = valueGetter.x;
    const getY = valueGetter.y;
    const getXSwap = valueGetter.y;
    const getYSwap = valueGetter.x;

    const margin = DEFAULT_MARGIN;
    const width = containerWidth - margin.left - margin.right
    const height = containerHeight - margin.top - margin.bottom;
    // cache the scales
    const { xScale, yScale, colourScale, xScaleSwap, yScaleSwap } = useMemo(getScales(transactionDataArr, getX, getXSwap, getY, getYSwap, getColour, width, height), [transactionDataArr, valueGetter])
    // cache the circles
    const { circles, swapCircles } = useMemo(getCircles(transactionDataArr, xScale, getX, yScale, getY, colourScale, getColour, xScaleSwap, getXSwap, yScaleSwap, getYSwap), [transactionDataArr, valueGetter])

    // update the charts when the scale domain Lims changed
    return (<div>
        <svg width={containerWidth} height={containerHeight}>
            <g transform={`translate(${margin.left},${margin.top})`}>
                <AxisLeft yScale={isSwap ? yScaleSwap : yScale} pixelsPerTick={60}></AxisLeft>
                <g transform={`translate(0, ${height})`}>
                    <AxisBottom xScale={isSwap ? xScaleSwap : xScale} pixelsPerTick={60}></AxisBottom>
                </g>
                {isSwap ? swapCircles : circles}
            </g>
        </svg>
        <button onClick={() => setIsSwap(!isSwap)}>swap axis</button>
    </div>
    );
}

function getCircles(transactionDataArr: TransactionData[], xScale: d3.ScaleLinear<number, number, never>, getX: (transactionData: TransactionData) => number, yScale: d3.ScaleLinear<number, number, never>, getY: (transactionData: TransactionData) => number, colourScale: d3.ScaleOrdinal<string, String, never>, getColour: (transactionData: TransactionData) => string, xScaleSwap: d3.ScaleLinear<number, number, never>, getXSwap: (transactionData: TransactionData) => number, yScaleSwap: d3.ScaleLinear<number, number, never>, getYSwap: (transactionData: TransactionData) => number) {
    return () => {
        const circles = transactionDataArr.map(transactionData => {
            return (
                <circle
                    key={transactionData.transactionNumber}
                    cx={xScale(getX(transactionData))}
                    cy={yScale(getY(transactionData))}
                    r={DEFAULT_RADIUS}
                    fill={colourScale(getColour(transactionData)).valueOf()} />
            );
        });
        const swapCircles = transactionDataArr.map(transactionData => {
            return (
                <circle
                    key={transactionData.transactionNumber}
                    cx={xScaleSwap(getXSwap(transactionData))}
                    cy={yScaleSwap(getYSwap(transactionData))}
                    r={DEFAULT_RADIUS}
                    fill={colourScale(getColour(transactionData)).valueOf()} />
            );
        });
        return { circles: circles, swapCircles: swapCircles };
    };
}

function getScales(transactionDataArr: TransactionData[], getX: (transactionData: TransactionData) => number, getXSwap: (transactionData: TransactionData) => number, getY: (transactionData: TransactionData) => number, getYSwap: (transactionData: TransactionData) => number, getColour: (transactionData: TransactionData) => string, width: number, height: number): () => { xScale: d3.ScaleLinear<number, number, never>; yScale: d3.ScaleLinear<number, number, never>; xScaleSwap: d3.ScaleLinear<number, number, never>; yScaleSwap: d3.ScaleLinear<number, number, never>; colourScale: d3.ScaleOrdinal<string, String, never>; } {
    return () => {
        let xScale, yScale, colourScale, xScaleSwap, yScaleSwap;
        const xLim = d3.extent(transactionDataArr, getX);
        const xLimSwap = d3.extent(transactionDataArr, getXSwap);
        const yLim = d3.extent(transactionDataArr, getY);
        const yLimSwap = d3.extent(transactionDataArr, getYSwap);
        const colourLim = Array.from(new Set(transactionDataArr.map(getColour)));
        // set the scales based on the Lims state
        if (xLim[0] === undefined && xLim[1] === undefined) {
            xScale = d3.scaleLinear().domain([0, 366]).range([0, width]);
        } else {
            xScale = d3.scaleLinear().domain([xLim[0], xLim[1]]).range([0, width]);
        }
        if (xLimSwap[0] === undefined && xLimSwap[1] === undefined) {
            xScaleSwap = d3.scaleLinear().domain([0, 366]).range([0, width]);
        } else {
            xScaleSwap = d3.scaleLinear().domain([xLimSwap[0], xLimSwap[1]]).range([0, width]);
        }
        if (yLim[0] === undefined && yLim[1] === undefined) {
            yScale = d3.scaleLinear().domain([0, 1]).range([height, 0]);
        } else {
            yScale = d3.scaleLinear().domain([yLim[0], yLim[1]]).range([height, 0]);
        }
        if (yLimSwap[0] === undefined && yLimSwap[1] === undefined) {
            yScaleSwap = d3.scaleLinear().domain([0, 1]).range([height, 0]);
        } else {
            yScaleSwap = d3.scaleLinear().domain([yLimSwap[0], yLimSwap[1]]).range([height, 0]);
        }
        const colourRange = d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), colourLim.length).reverse(); // ref: https://observablehq.com/@d3/pie-chart/2?intent=fork
        colourScale = d3.scaleOrdinal<String>().domain(colourLim).range(colourRange);
        return { xScale, yScale, xScaleSwap, yScaleSwap, colourScale };

    };
}

/**
 * returns the min and max values of x,y,colour,size domains;
 * @param dataPerTransactionDescriptionArr this object provide an array of data
 * @param valueGetter this object provide the valueGetter functions include x, y, colour and size getter.
 * @returns min max domain values like this: { xDomainMin, xDomainMax, yDomainMin, yDomainMax, colourDomainMin, colourDomainMax, sizeDomainMin, sizeDomainMax }
 */
export function getDomainValueFromDataPerTransactionDescription(dataPerTransactionDescriptionArr: DataPerTransactionDescription[], valueGetter: {
    x: (dataPerTransactionDescription: DataPerTransactionDescription) => number;
    y: (dataPerTransactionDescription: DataPerTransactionDescription) => number;
    colour: (dataPerTransactionDescription: DataPerTransactionDescription) => number;
    size: (dataPerTransactionDescription: DataPerTransactionDescription) => number;
    shape: (dataPerTransactionDescription: DataPerTransactionDescription) => boolean;
}): { xDomainMin: number; xDomainMax: number; yDomainMin: number; yDomainMax: number; colourDomainMin: number; colourDomainMax: number; sizeDomainMin: number; sizeDomainMax: number; } {
    const xDomainMin = d3.min(dataPerTransactionDescriptionArr, valueGetter.x);
    const xDomainMax = d3.max(dataPerTransactionDescriptionArr, valueGetter.x);
    const yDomainMin = d3.min(dataPerTransactionDescriptionArr, valueGetter.y);
    const yDomainMax = d3.max(dataPerTransactionDescriptionArr, valueGetter.y);
    const colourDomainMin = d3.min(dataPerTransactionDescriptionArr, valueGetter.colour);
    const colourDomainMax = d3.max(dataPerTransactionDescriptionArr, valueGetter.colour);
    const sizeDomainMin = d3.min(dataPerTransactionDescriptionArr, valueGetter.size);
    const sizeDomainMax = d3.max(dataPerTransactionDescriptionArr, valueGetter.size);
    if (xDomainMin === undefined) {
        throw new Error("invalid xDomainMin value");
    }
    if (xDomainMax === undefined) {
        throw new Error("invalid xDomainMax value");
    }
    if (yDomainMin === undefined) {
        throw new Error("invalid yDomainMin value");
    }
    if (yDomainMax === undefined) {
        throw new Error("invalid yDomainMax value");
    }
    if (colourDomainMin === undefined) {
        throw new Error("invalid colourDomainMin value");
    }
    if (colourDomainMax === undefined) {
        throw new Error("invalid colourDomainMax value");
    }
    if (sizeDomainMin === undefined) {
        throw new Error("invalid sizeDomainMin value");
    }
    if (sizeDomainMax === undefined) {
        throw new Error("invalid sizeDomainMax value");
    }
    return { xDomainMin, xDomainMax, yDomainMin, yDomainMax, colourDomainMin, colourDomainMax, sizeDomainMin, sizeDomainMax };
}

