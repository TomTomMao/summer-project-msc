'use client';
import { useState, useEffect, useRef, useMemo, Dispatch, SetStateAction, useLayoutEffect } from "react";
import { TransactionData } from "../../utilities/DataObject";
import * as d3 from 'd3';
import { AxisBottom, AxisLeft } from "../Axis";
import * as scatterPlotSlice from './scatterPlotSlice'
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { GRAY1 } from "../../utilities/consts";
import { ScaleOrdinalWithTransactionNumber, useCategoryColourScale } from "../../hooks/useColourScales";
import { useTransactionDataArr } from "../../hooks/useTransactionData";
import * as interactivitySlice from "../Interactivity/interactivitySlice";

const BRUSH_MODE = 'end'
/**
 * render a scatterplot
 *
 */
interface ScatterPlotValueGetter {
    x: (transactionData: TransactionData) => number,
    y: (transactionData: TransactionData) => number,
    colour: (transactionData: TransactionData) => string,
}

interface ScatterPlotValueGetterWithSwap extends ScatterPlotValueGetter {
    getXSwap(transactionData: TransactionData): number,
    getYSwap(transactionData: TransactionData): number
}
type ScatterPlotPrivateScale = {
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
type ScatterPlotScale = ScatterPlotPrivateScale & { colourScale: ScaleOrdinalWithTransactionNumber }
type ScatterPlotProps = {
    transactionDataArr: TransactionData[];
    valueGetter: ScatterPlotValueGetter;
    brushedTransactionNumberSet: Set<TransactionData['transactionNumber']>;
    setBrushedTransactionNumberSet: (transactionNumberSet: Set<TransactionData['transactionNumber']>) => void;
}

const DEFAULT_MARGIN = { top: 5, right: 5, bottom: 30, left: 40 };
const DEFAULT_RADIUS = 2;
/**
 * draw a scatter plot of transactionDataArr, the mapping depends of the valueGetter, support x, y, and colour, assert valueGetter can successfully get value of transactionData
 * @param props
 * @returns 
 */
export function ScatterPlot(props: ScatterPlotProps) {
    const { valueGetter, brushedTransactionNumberSet, setBrushedTransactionNumberSet } = props;
    const transactionDataArr = useTransactionDataArr()
    const [isSwap, setIsSwap] = useState(false);
    // configs
    const { currentContainerWidth, currentContainerHeight, margin, useLogScale, width, height, colourScale } = useScatterPlotConfig()
    const dispatch = useAppDispatch()

    const brush = useRef<d3.BrushBehavior<SVGGElement> | null>(null)
    const brushGRef = useRef<SVGGElement | null>(null)

    const valueGetterWithSwap = useMemo(() => {
        return { ...valueGetter, getXSwap: valueGetter.y, getYSwap: valueGetter.x };
    }, [])

    // cache the private scales (x,y, and swapped), with both linear and log; avoid recalculating
    const { linearPrivateScales, logPrivateScales } = useScatterPlotScales(transactionDataArr, valueGetterWithSwap, width, height)

    // cache the circles 
    const { circlesLinear, swapCirclesLinear, circlesLog, swapCirclesLog } = useScatterPlotCachedCircles(transactionDataArr, valueGetterWithSwap, colourScale, linearPrivateScales, logPrivateScales)
    const currentSelector = useAppSelector(interactivitySlice.selectCurrentSelector)
    const shouldShowBrusher = currentSelector !== 'clusterId' && currentSelector !== 'category' && currentSelector !== 'frequencyUniqueKey'

    // clear brush when it should be shown
    useEffect(() => {
        if (brush.current !== null && brushGRef.current !== null) {
            const brushG = d3.select<SVGGElement, SVGGElement>(brushGRef.current)
            console.log('brushGRef',brushGRef)
            console.log('brushG',brushG)
            brushGRef.current.setAttribute('opacity',shouldShowBrusher ? '1' : '0')
            // brushG.attr('opacity', shouldShowBrusher ? '1' : '0')
        }
    }, [shouldShowBrusher])

    let circlesToDisplay;
    let scaleForXAxis: d3.ScaleLinear<number, number, never> | d3.ScaleLogarithmic<number, number, never>;
    let scaleForYAxis: d3.ScaleLinear<number, number, never> | d3.ScaleLogarithmic<number, number, never>;
    if (isSwap) {
        if (useLogScale) {
            circlesToDisplay = swapCirclesLog
            scaleForXAxis = logPrivateScales.xScaleSwap
            scaleForYAxis = logPrivateScales.yScaleSwap
        } else {
            circlesToDisplay = swapCirclesLinear
            scaleForXAxis = linearPrivateScales.xScaleSwap
            scaleForYAxis = linearPrivateScales.yScaleSwap
        }
    } else {
        if (useLogScale) {
            circlesToDisplay = circlesLog
            scaleForXAxis = logPrivateScales.xScale
            scaleForYAxis = logPrivateScales.yScale
        } else {
            circlesToDisplay = circlesLinear
            scaleForXAxis = linearPrivateScales.xScale
            scaleForYAxis = linearPrivateScales.yScale
        }
    }
    const handleBrush = (event: d3.D3BrushEvent<SVGGElement>): void => {
        if (event === undefined) {
            return
        }
        console.time('handleBrush')
        if (event.selection === null) {
            setBrushedTransactionNumberSet(new Set());
            return;
        }
        let x0: number, y0: number, x1: number, y1: number;
        const selection = event.selection
        if (Array.isArray(selection) && Array.isArray(selection[0]) && Array.isArray(selection[1])) {
            [[x0, y0], [x1, y1]] = selection; // ref this line: https://observablehq.com/@d3/brushable-scatterplot
        } else {
            throw new Error("selection type is not valid");

        }
        const [[domainXMin, domainXMax], [domainYMin, domainYMax]] = [[scaleForXAxis.invert(x0), scaleForXAxis.invert(x1)], [scaleForYAxis.invert(y1), scaleForYAxis.invert(y0)]];
        const nextBrushedTransactionNumberSet = new Set(transactionDataArr.filter(transactionData => {
            const dataXValue = isSwap ? valueGetterWithSwap.getXSwap(transactionData) : valueGetterWithSwap.x(transactionData);
            const dataYValue = isSwap ? valueGetterWithSwap.getYSwap(transactionData) : valueGetterWithSwap.y(transactionData);
            return dataXValue >= domainXMin && dataXValue <= domainXMax &&
                dataYValue >= domainYMin && dataYValue <= domainYMax
        }).map(d => d.transactionNumber))
        setBrushedTransactionNumberSet(nextBrushedTransactionNumberSet)
        console.timeEnd('handleBrush')
    }

    // change the brush's scale and clear
    useEffect(() => {
        if (brush.current === null) {
            brush.current = d3.brush<SVGGElement>()
            brush.current.extent([[0, 0], [width, height]]).on(BRUSH_MODE, (handleBrush))
        }
        if (brushGRef.current !== null) {
            const brushG = d3.select<SVGGElement, SVGGElement>(brushGRef.current)
            brush.current(brushG)
            brush.current.on(BRUSH_MODE, (handleBrush))
            //move the brushes' position to the right place
        }
    }, [width, height, isSwap, useLogScale])


    return (
        <div className="clusterView">
            <div style={{
                position: 'absolute',
                left: '40px',
                top: '5px'
            }}>
                <button onClick={() => setIsSwap(!isSwap)}>swap axis</button>
                <span> main axis: </span>
                <label htmlFor="scatterPlotUseLog">log</label>
                <input type="radio" name="scatterPlotUseLog" id="" checked={useLogScale} onChange={() => dispatch(scatterPlotSlice.setMainScale('log'))} />
                <label htmlFor="scatterPlotUseLinear">linear</label>
                <input type="radio" name="scatterPlotUseLinear" id="" checked={!useLogScale} onChange={() => dispatch(scatterPlotSlice.setMainScale('linear'))} />
            </div>
            <svg width={currentContainerWidth} height={currentContainerHeight}>
                <g transform={`translate(${margin.left},${margin.top})`}>
                    <g>{circlesToDisplay}</g>
                    <g ref={brushGRef}></g>
                    <g><AxisLeft yScale={scaleForYAxis} numberOfTicksTarget={6}></AxisLeft></g>
                    <g transform={`translate(0, ${height})`}><AxisBottom xScale={scaleForXAxis} numberOfTicksTarget={6}></AxisBottom></g>
                </g>
            </svg>
        </div>
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
 * get the an array of data for circles, index represent the transactionNumber. this function is used for separating the calculation of visual mapping.
 */
function getCircleDataArray(transactionDataArr: TransactionData[],
    valueGetterWithSwap: ScatterPlotValueGetterWithSwap,
    scales: ScatterPlotScale,
    isSwap: boolean): CircleData[] {
    const circleDataArr: CircleData[] = new Array()
    if (!isSwap) {
        transactionDataArr.forEach(transactionData => {
            circleDataArr.push({
                key: transactionData.transactionNumber,
                cx: scales.xScale(valueGetterWithSwap.x(transactionData)),
                cy: scales.yScale(valueGetterWithSwap.y(transactionData)),
                r: DEFAULT_RADIUS,
                fill: scales.colourScale.getColour(valueGetterWithSwap.colour(transactionData), transactionData.transactionNumber).valueOf(),
            })
        })
    } else {
        transactionDataArr.forEach(transactionData => {
            circleDataArr.push({
                key: transactionData.transactionNumber,
                cx: scales.xScaleSwap(valueGetterWithSwap.getXSwap(transactionData)),
                cy: scales.yScaleSwap(valueGetterWithSwap.getYSwap(transactionData)),
                r: DEFAULT_RADIUS,
                fill: scales.colourScale.getColour(valueGetterWithSwap.colour(transactionData), transactionData.transactionNumber).valueOf(),
            })
        })

    }
    if (circleDataArr.some(circleData => circleData.fill === GRAY1)) {
        // return the circledata such that the gray points is at the first
        return [...circleDataArr.filter(circleData => circleData.fill === GRAY1), ...circleDataArr.filter(circleData => circleData.fill !== GRAY1)]
    } else {
        return circleDataArr
    }
}

/**
 * return a function that produce d3.scale functions for the scatterplot
 * @param transactionDataArr 
 * @param valueGetterWithSwap 
 * @param width 
 * @param height 
 * @returns
 */
function curryGetScales(transactionDataArr: TransactionData[],
    valueGetterWithSwap: ScatterPlotValueGetterWithSwap,
    width: number, height: number):
    (useLogScale: boolean) => ScatterPlotPrivateScale {
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
            xScaleSwap = scaleFuncForYandXSwap().domain([0, 366]).range([width * 0.01, width * 0.99]);
        } else {
            xScaleSwap = scaleFuncForYandXSwap().domain([xLimSwap[0], xLimSwap[1]]).range([width * 0.01, width * 0.99]);
        }
        if (yLim[0] === undefined && yLim[1] === undefined) {
            yScale = scaleFuncForYandXSwap().domain([0, 1]).range([height * 0.99, height * 0.01]);
        } else {
            yScale = scaleFuncForYandXSwap().domain([yLim[0], yLim[1]]).range([height * 0.99, height * 0.01]);
        }
        if (yLimSwap[0] === undefined && yLimSwap[1] === undefined) {
            yScaleSwap = d3.scaleLinear().domain([0, 1]).range([height, 0]);
        } else {
            yScaleSwap = d3.scaleLinear().domain([yLimSwap[0], yLimSwap[1]]).range([height * 0.99, 0]);
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

/**
 * get the scatterPlot config information and the dispatcher from the redux store; calculate the derived value includes width, height for the actual drawing area, useLogScale information for the main axis of the scatterPlot 
 * @returns an object with  currentContainerWidth, currentContainerHeight, useLogScale, margin, dispatch, width, height
 */
function useScatterPlotConfig() {
    // console.log('scatter plot view config information changed')
    const currentContainerWidth = useAppSelector(scatterPlotSlice.selectCurrentContainerWidth);
    const currentContainerHeight = useAppSelector(scatterPlotSlice.selectCurrentContainerHeight);
    const mainAxis = useAppSelector(scatterPlotSlice.selectMainAxis);

    const margin = DEFAULT_MARGIN

    const useLogScale = mainAxis === 'log' ? true : false;
    // console.log('useLogScale flage', useLogScale)
    // console.log('mainAxis flage', mainAxis)
    // config dispatcher
    const dispatch = useAppDispatch();
    const colourScale = useCategoryColourScale()
    const width = currentContainerWidth - margin.left - margin.right
    const height = currentContainerHeight - margin.top - margin.bottom;
    return { currentContainerWidth, currentContainerHeight, useLogScale, margin, dispatch, width, height, colourScale }
}

/**
 * get the scale function for x and y axis, and for the swapped x and y axis; the value are updated only when at least one of the parameters updated
 * @param transactionDataArr collection of the data to display
 * @param valueGetterWithSwap valuegetter for the scatter plot
 * @param width width of the actual drawing area
 * @param height height of the actural drawing area
 * @returns the Y scale and xScaleSwapped is log scale in the logScales value, in the linearScales, all scales are linearScale
 */
function useScatterPlotScales(transactionDataArr: TransactionData[], valueGetterWithSwap: ScatterPlotValueGetterWithSwap, width: number, height: number) {
    const { linearPrivateScales, logPrivateScales } = useMemo(() => {
        const scaleGetter = curryGetScales(transactionDataArr, valueGetterWithSwap, width, height);
        const linearPrivateScales = scaleGetter(false)
        const logPrivateScales = scaleGetter(true)
        return { linearPrivateScales, logPrivateScales }
    }, [transactionDataArr, valueGetterWithSwap, width, height])
    return { linearPrivateScales, logPrivateScales }
}

/**
 * 
 * @param transactionDataArr 
 * @param valueGetterWithSwap 
 * @param colourScale 
 * @param linearPrivateScales 
 * @param logPrivateScales 
 * @returns circles for the chart with linear and log main axis, and the circles for the chart with swapped axis
 */
function useScatterPlotCachedCircles(transactionDataArr: TransactionData[], valueGetterWithSwap: ScatterPlotValueGetterWithSwap, colourScale: ScaleOrdinalWithTransactionNumber, linearPrivateScales: ScatterPlotPrivateScale, logPrivateScales: ScatterPlotPrivateScale) {
    const { circlesLinear, swapCirclesLinear, circlesLog, swapCirclesLog } = useMemo(() => {
        console.time('re-calculating circleData')
        const circleDataArrLinear = getCircleDataArray(transactionDataArr, valueGetterWithSwap, { colourScale, ...linearPrivateScales }, false);
        const circleDataSwappedArrLinear = getCircleDataArray(transactionDataArr, valueGetterWithSwap, { colourScale, ...linearPrivateScales }, true);
        const circleDataArrLog = getCircleDataArray(transactionDataArr, valueGetterWithSwap, { colourScale, ...logPrivateScales }, false);
        const circleDataSwappedArrLog = getCircleDataArray(transactionDataArr, valueGetterWithSwap, { colourScale, ...logPrivateScales }, true);
        console.timeEnd('re-calculating circleData')
        console.time('updating <circle> element')
        const circlesLinear = circleDataArrLinear.map((d: CircleData) => <Circle id={d.key} key={d.key} cx={d.cx} cy={d.cy} r={d.r} fill={d.fill} />)
        const swapCirclesLinear = circleDataSwappedArrLinear.map((d: CircleData) => <Circle id={d.key} key={d.key} cx={d.cx} cy={d.cy} r={d.r} fill={d.fill} />)
        const circlesLog = circleDataArrLog.map((d: CircleData) => <Circle id={d.key} key={d.key} cx={d.cx} cy={d.cy} r={d.r} fill={d.fill} />)
        const swapCirclesLog = circleDataSwappedArrLog.map((d: CircleData) => <Circle id={d.key} key={d.key} cx={d.cx} cy={d.cy} r={d.r} fill={d.fill} />)
        console.timeEnd('updating <circle> element')
        return { circlesLinear, swapCirclesLinear, circlesLog, swapCirclesLog }
    }, [transactionDataArr, valueGetterWithSwap, colourScale, linearPrivateScales, logPrivateScales])
    return { circlesLinear, swapCirclesLinear, circlesLog, swapCirclesLog }
}