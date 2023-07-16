'use client';
import { useState, useEffect, useRef, useContext, useMemo, Dispatch, SetStateAction } from "react";
import { TransactionData } from "./DataObject";
import * as d3 from 'd3';
import { DataPerTransactionDescription } from "./CalendarView3/DataPerTransactionDescription";
import { AxisBottom, AxisLeft } from "./Axis";
import { PublicScale } from "./page";

/**
 * render a cluster view using scatter plot
 *
 */
interface ClusterViewValueGetter {
    x: (transactionData: TransactionData) => number,
    y: (transactionData: TransactionData) => number,
    colour: (transactionData: TransactionData) => string,
}

type Props = {
    transactionDataArr: TransactionData[];
    containerHeight: number;
    containerWidth: number;
    valueGetter: ClusterViewValueGetter;
    brushedTransactionNumberSet: Set<TransactionData['transactionNumber']>;
    setBrushedTransactionNumberSet: Dispatch<SetStateAction<Set<TransactionData['transactionNumber']>>>;
    useLogScale: boolean;
    colourScale: PublicScale['colourScale']
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
    const { transactionDataArr, containerHeight, containerWidth, valueGetter, brushedTransactionNumberSet, setBrushedTransactionNumberSet, useLogScale = true, colourScale } = props;
    const [isSwap, setIsSwap] = useState(false);
    const brushGRef = useRef(null)
    const getColour = valueGetter.colour;
    const getX = valueGetter.x;
    const getY = valueGetter.y;
    const getXSwap = valueGetter.y;
    const getYSwap = valueGetter.x;
    function handleBrush(selection: [[number, number], [number, number]] | null) {
        if (selection === null) {
            setBrushedTransactionNumberSet(new Set());
            return;
        }
        const [[x0, y0], [x1, y1]]: [[number, number], [number, number]] = selection; // ref this line: https://observablehq.com/@d3/brushable-scatterplot
        if (isSwap === false) {
            const [[domainXMin, domainXMax], [domainYMin, domainYMax]] = [[xScale.invert(x0), xScale.invert(x1)], [yScale.invert(y1), yScale.invert(y0)]];
            const nextBrushedTransactionNumberSet = new Set(transactionDataArr.filter(transactionData => {
                const dataXValue = getX(transactionData);
                const dataYValue = getY(transactionData);
                // console.log("dataXValue:", dataXValue, "dataXValue:", dataYValue)
                return dataXValue >= domainXMin && dataXValue <= domainXMax &&
                    dataYValue >= domainYMin && dataYValue <= domainYMax
            }).map(d => d.transactionNumber))
            setBrushedTransactionNumberSet(nextBrushedTransactionNumberSet)
        } else {
            const [[domainXMin, domainXMax], [domainYMin, domainYMax]] = [[xScaleSwap.invert(x0), xScaleSwap.invert(x1)], [yScaleSwap.invert(y1), yScaleSwap.invert(y0)]];
            const nextBrushedTransactionNumberSet = new Set(transactionDataArr.filter(transactionData => {
                const dataXValue = getXSwap(transactionData);
                const dataYValue = getYSwap(transactionData);
                return dataXValue >= domainXMin && dataXValue <= domainXMax &&
                    dataYValue >= domainYMin && dataYValue <= domainYMax
            }).map(d => d.transactionNumber))
            setBrushedTransactionNumberSet(nextBrushedTransactionNumberSet)
        }
    }

    const margin = DEFAULT_MARGIN;
    const width = containerWidth - margin.left - margin.right
    const height = containerHeight - margin.top - margin.bottom;
    // cache the scales
    const { xScale, yScale, xScaleSwap, yScaleSwap } = useMemo(() => getScales(transactionDataArr, getX, getXSwap, getY, getYSwap, getColour, width, height)(useLogScale), [transactionDataArr, valueGetter, useLogScale])
    // cache the circles
    const { circles, swapCircles } = useMemo(getCircles(transactionDataArr, brushedTransactionNumberSet, xScale, getX, yScale, getY, colourScale, getColour, xScaleSwap, getXSwap, yScaleSwap, getYSwap), [transactionDataArr, valueGetter, brushedTransactionNumberSet, useLogScale])
    useEffect(() => {
        //https://github.com/d3/d3-brush
        const brushG = d3.select(brushGRef.current)
        console.log('brushG', brushG)
        brushG.call(d3.brush().extent([[0, 0], [width, height]]).on("end", ({ selection }) => handleBrush(selection)))
        return function () { brushG.on('.brush', null) }
    }, [containerWidth, containerHeight, isSwap, useLogScale])

    return (<>
        <svg width={containerWidth} height={containerHeight}>
            <g transform={`translate(${margin.left},${margin.top})`}>
                <g>{isSwap ? swapCircles : circles}</g>
                <g ref={brushGRef}></g>
                <g><AxisLeft yScale={isSwap ? yScaleSwap : yScale} pixelsPerTick={60}></AxisLeft></g>
                <g transform={`translate(0, ${height})`}><AxisBottom xScale={isSwap ? xScaleSwap : xScale} pixelsPerTick={60}></AxisBottom></g>
            </g>
        </svg>
        <button onClick={() => setIsSwap(!isSwap)}>swap axis</button>
    </>
    );
}

function getCircles(transactionDataArr: TransactionData[], brushedTransactionNumberSet: Set<TransactionData['transactionNumber']>, xScale: d3.ScaleLinear<number, number, never>, getX: (transactionData: TransactionData) => number, yScale: d3.ScaleLinear<number, number, never>, getY: (transactionData: TransactionData) => number, colourScale: d3.ScaleOrdinal<string, String, never>, getColour: (transactionData: TransactionData) => string, xScaleSwap: d3.ScaleLinear<number, number, never>, getXSwap: (transactionData: TransactionData) => number, yScaleSwap: d3.ScaleLinear<number, number, never>, getYSwap: (transactionData: TransactionData) => number) {
    return () => {
        const brushed = brushedTransactionNumberSet.size;
        const circles = transactionDataArr.map(transactionData => {
            const isCircleHighlighted = brushedTransactionNumberSet.has(transactionData.transactionNumber);
            return (
                <circle
                    key={transactionData.transactionNumber}
                    cx={xScale(getX(transactionData))}
                    cy={yScale(getY(transactionData))}
                    r={DEFAULT_RADIUS}
                    fill={colourScale(getColour(transactionData)).valueOf()}
                    opacity={((!brushed) || isCircleHighlighted) ? 1 : 0.1}
                    stroke={brushed && isCircleHighlighted ? 'black' : undefined}
                />
            );
        });
        // brushed isCircleHighlighted (!brushed) || isCircleHighlighted)  opacity
        // t       t                   true                                1
        // t       f                   false                               0.1
        // f       t                   true                                1
        // f       f                   true                                1
        const swapCircles = transactionDataArr.map(transactionData => {
            const isCircleHighlighted = brushedTransactionNumberSet.has(transactionData.transactionNumber);
            return (
                <circle
                    key={transactionData.transactionNumber}
                    cx={xScaleSwap(getXSwap(transactionData))}
                    cy={yScaleSwap(getYSwap(transactionData))}
                    r={DEFAULT_RADIUS}
                    fill={colourScale(getColour(transactionData)).valueOf()}
                    opacity={((!brushed) || isCircleHighlighted) ? 1 : 0.1}
                    stroke={brushed && isCircleHighlighted ? 'black' : undefined}
                />
            );
        });
        return { circles: circles, swapCircles: swapCircles };
    };
}


function getScales(transactionDataArr: TransactionData[],
    getX: (transactionData: TransactionData) => number,
    getXSwap: (transactionData: TransactionData) => number,
    getY: (transactionData: TransactionData) => number,
    getYSwap: (transactionData: TransactionData) => number,
    getColour: (transactionData: TransactionData) => string, width: number, height: number):
    (useLogScale: boolean) => {
        xScale: d3.ScaleLinear<number, number, never>;
        yScale: d3.ScaleLinear<number, number, never>;
        xScaleSwap: d3.ScaleLinear<number, number, never>;
        yScaleSwap: d3.ScaleLinear<number, number, never>;
        colourScale: d3.ScaleOrdinal<string, String, never>;
    } | {
        xScale: d3.ScaleLinear<number, number, never>;
        yScale: d3.ScaleLogarithmic<number, number, never>;
        xScaleSwap: d3.ScaleLogarithmic<number, number, never>;
        yScaleSwap: d3.ScaleLinear<number, number, never>;
        colourScale: d3.ScaleOrdinal<string, String, never>;
    } {
    return (useLogScale) => {
        const scaleFuncForYandXSwap = useLogScale ? d3.scaleLog : d3.scaleLinear;
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
            xScaleSwap = scaleFuncForYandXSwap().domain([0, 366]).range([0, width]);
        } else {
            xScaleSwap = scaleFuncForYandXSwap().domain([xLimSwap[0], xLimSwap[1]]).range([0, width]);
        }
        if (yLim[0] === undefined && yLim[1] === undefined) {
            yScale = scaleFuncForYandXSwap().domain([0, 1]).range([height, 0]);
        } else {
            yScale = scaleFuncForYandXSwap().domain([yLim[0], yLim[1]]).range([height, 0]);
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

