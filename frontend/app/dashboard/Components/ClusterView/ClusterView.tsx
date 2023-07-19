'use client';
import { useState, useEffect, useRef, useContext, useMemo, Dispatch, SetStateAction } from "react";
import { TransactionData } from "../../utilities/DataObject";
import * as d3 from 'd3';
import { AxisBottom, AxisLeft } from "../Axis";
import { PublicScale } from "../../page";
const BRUSH_MODE = 'brush end'
/**
 * render a cluster view using scatter plot
 *
 */
interface ClusterViewValueGetter {
    x: (transactionData: TransactionData) => number,
    y: (transactionData: TransactionData) => number,
    colour: (transactionData: TransactionData) => string,
}

interface ClusterViewValueGetterWithSwap extends ClusterViewValueGetter {
    getXSwap(transactionData: TransactionData): number,
    getYSwap(transactionData: TransactionData): number
}
type ClusterViewPrivateScale = {
    xScale: d3.ScaleLinear<number, number, never>;
    yScale: d3.ScaleLinear<number, number, never>;
    xScaleSwap: d3.ScaleLinear<number, number, never>;
    yScaleSwap: d3.ScaleLinear<number, number, never>;

} | {
    xScale: d3.ScaleLinear<number, number, never>;
    yScale: d3.ScaleLogarithmic<number, number, never>;
    xScaleSwap: d3.ScaleLogarithmic<number, number, never>;
    yScaleSwap: d3.ScaleLinear<number, number, never>;
}
type ClusterViewScale = ClusterViewPrivateScale & { colourScale: PublicScale['colourScale'] }
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
    const valueGetterWithSwap = useMemo(() => {
        return { ...valueGetter, getXSwap: valueGetter.y, getYSwap: valueGetter.x };
    }, [])

    function handleBrush(selection: [[number, number], [number, number]] | null) {
        console.time('handleBrush')
        if (selection === null) {
            setBrushedTransactionNumberSet(new Set());
            return;
        }
        const [[x0, y0], [x1, y1]]: [[number, number], [number, number]] = selection; // ref this line: https://observablehq.com/@d3/brushable-scatterplot
        if (isSwap === false) {
            const [[domainXMin, domainXMax], [domainYMin, domainYMax]] = [[scales.xScale.invert(x0), scales.xScale.invert(x1)], [scales.yScale.invert(y1), scales.yScale.invert(y0)]];
            const nextBrushedTransactionNumberSet = new Set(transactionDataArr.filter(transactionData => {
                const dataXValue = valueGetterWithSwap.x(transactionData);
                const dataYValue = valueGetterWithSwap.y(transactionData);
                // console.log("dataXValue:", dataXValue, "dataXValue:", dataYValue)
                return dataXValue >= domainXMin && dataXValue <= domainXMax &&
                    dataYValue >= domainYMin && dataYValue <= domainYMax
            }).map(d => d.transactionNumber))
            setBrushedTransactionNumberSet(nextBrushedTransactionNumberSet)
        } else {
            const [[domainXMin, domainXMax], [domainYMin, domainYMax]] = [[scales.xScaleSwap.invert(x0), scales.xScaleSwap.invert(x1)], [scales.yScaleSwap.invert(y1), scales.yScaleSwap.invert(y0)]];
            const nextBrushedTransactionNumberSet = new Set(transactionDataArr.filter(transactionData => {
                const dataXValue = valueGetterWithSwap.getXSwap(transactionData);
                const dataYValue = valueGetterWithSwap.getYSwap(transactionData);
                return dataXValue >= domainXMin && dataXValue <= domainXMax &&
                    dataYValue >= domainYMin && dataYValue <= domainYMax
            }).map(d => d.transactionNumber))
            setBrushedTransactionNumberSet(nextBrushedTransactionNumberSet)
        }
        console.timeEnd('handleBrush')
    }

    const margin = DEFAULT_MARGIN;
    const width = containerWidth - margin.left - margin.right
    const height = containerHeight - margin.top - margin.bottom;
    // cache the scales
    const scales = useMemo(() => {
        console.log('recalculating scales')
        const { xScale, yScale, xScaleSwap, yScaleSwap } = getScales(transactionDataArr, valueGetterWithSwap, width, height)(useLogScale)
        return { xScale, yScale, xScaleSwap, yScaleSwap, colourScale }
    }, [transactionDataArr, valueGetter, useLogScale])


    // cache the circles 
    const { circles, swapCircles } = useMemo(() => {
        console.time('re-calculating circleDataMap and circleDattaSwappedMap')
        const circleDataMap = getCircleDataMap(transactionDataArr, valueGetterWithSwap, scales, false);
        const circleDataSwappedMap = getCircleDataMap(transactionDataArr, valueGetterWithSwap, scales, true);
        console.timeEnd('re-calculating circleDataMap and circleDattaSwappedMap')
        const circleDataArr: CircleData[] = [];
        const circleDataSwappedArr: CircleData[] = [];
        circleDataMap.forEach((circleData, key) => { circleDataArr.push(circleData) })
        circleDataSwappedMap.forEach((circleDataSwapped, key) => { circleDataSwappedArr.push(circleDataSwapped) })
        console.time('updating <circle> element')
        const circles = circleDataArr.map(d => <Circle id={d.key} key={d.key} cx={d.cx} cy={d.cy} r={d.r} fill={d.fill} />)
        const swapCircles = circleDataSwappedArr.map(d => <Circle id={d.key} key={d.key} cx={d.cx} cy={d.cy} r={d.r} fill={d.fill} />)
        console.timeEnd('updating <circle> element')
        return { circles, swapCircles }
    }, [transactionDataArr, valueGetterWithSwap, scales])

    useEffect(() => {
        console.time('updating opacity')
        // set all points to highlighted if no point get brushed
        if (brushedTransactionNumberSet.size === 0) {
            transactionDataArr.forEach(({ transactionNumber }) => {
                document.getElementById(transactionNumber).style.opacity = '1'
            })
        } else {
            const highLightInfo = transactionDataArr.map(transactionData => {
                return { id: transactionData.transactionNumber, isHighLighted: brushedTransactionNumberSet.has(transactionData.transactionNumber) }
            })
            highLightInfo.forEach(({ id, isHighLighted }) => {
                if (isHighLighted) {
                    document.getElementById(id).style.opacity = '1'
                } else {
                    document.getElementById(id).style.opacity = '0.1'
                }
            })
        }
        console.timeEnd('updating opacity')
    }, [brushedTransactionNumberSet])



    useEffect(() => {
        //https://github.com/d3/d3-brush
        const brushG = d3.select(brushGRef.current)
        const brush = d3.brush().extent([[0, 0], [width, height]]).on(BRUSH_MODE, ({ selection }) => handleBrush(selection))
        brushG.call(brush)
        return () => { brushG.on('.brush', null) }
    }, [containerWidth, containerHeight, isSwap, useLogScale])

    return (<>
        <svg width={containerWidth} height={containerHeight}>
            <g transform={`translate(${margin.left},${margin.top})`}>
                <g>{isSwap ? swapCircles : circles}</g>
                <g ref={brushGRef}></g>
                <g><AxisLeft yScale={isSwap ? scales.yScaleSwap : scales.yScale} pixelsPerTick={60}></AxisLeft></g>
                <g transform={`translate(0, ${height})`}><AxisBottom xScale={isSwap ? scales.xScaleSwap : scales.xScale} pixelsPerTick={60}></AxisBottom></g>
            </g>
        </svg>
        <button onClick={() => setIsSwap(!isSwap)}>swap axis</button>
    </>
    );
}

type CircleData = {
    key: string,
    cx: number;
    cy: number;
    r: number;
    fill: string
}

/**
 * A map object where the key are the transaction number and the value are the circle data
 */
type CircleDataMap = Map<TransactionData['transactionNumber'], CircleData>
/**
 * get the an array of data for circles, index represent the transactionNumber. this function is used for separating the calculation of visual mapping.
 */
function getCircleDataMap(transactionDataArr: TransactionData[],
    valueGetterWithSwap: ClusterViewValueGetterWithSwap,
    scales: ClusterViewScale,
    isSwap: boolean): CircleDataMap {
    const circleDataMap: CircleDataMap = new Map()
    if (!isSwap) {
        transactionDataArr.forEach(transactionData => {
            circleDataMap.set(transactionData.transactionNumber, {
                key: transactionData.transactionNumber,
                cx: scales.xScale(valueGetterWithSwap.x(transactionData)),
                cy: scales.yScale(valueGetterWithSwap.y(transactionData)),
                r: DEFAULT_RADIUS,
                fill: scales.colourScale(valueGetterWithSwap.colour(transactionData)).valueOf(),
            })
        })
    } else {
        transactionDataArr.forEach(transactionData => {
            circleDataMap.set(transactionData.transactionNumber, {
                key: transactionData.transactionNumber,
                cx: scales.xScaleSwap(valueGetterWithSwap.getXSwap(transactionData)),
                cy: scales.yScaleSwap(valueGetterWithSwap.getYSwap(transactionData)),
                r: DEFAULT_RADIUS,
                fill: scales.colourScale(valueGetterWithSwap.colour(transactionData)).valueOf(),
            })
        })

    }
    return circleDataMap
}


function getScales(transactionDataArr: TransactionData[],
    valueGetterWithSwap: ClusterViewValueGetterWithSwap,
    width: number, height: number):
    (useLogScale: boolean) => ClusterViewPrivateScale {
    return (useLogScale) => {
        const scaleFuncForYandXSwap = useLogScale ? d3.scaleLog : d3.scaleLinear;
        let xScale, yScale, xScaleSwap, yScaleSwap;
        const xLim = d3.extent(transactionDataArr, valueGetterWithSwap.x);
        const xLimSwap = d3.extent(transactionDataArr, valueGetterWithSwap.getXSwap);
        const yLim = d3.extent(transactionDataArr, valueGetterWithSwap.y);
        const yLimSwap = d3.extent(transactionDataArr, valueGetterWithSwap.getYSwap);
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
        return { xScale, yScale, xScaleSwap, yScaleSwap };
    };
}

type CircleProps = {
    id: string, // used for highlight
    cx: number,
    cy: number,
    r: number,
    fill: string,
}
function Circle(props: CircleProps) {
    return <circle id={props.id} cx={props.cx} cy={props.cy} r={props.r} fill={props.fill} />
}