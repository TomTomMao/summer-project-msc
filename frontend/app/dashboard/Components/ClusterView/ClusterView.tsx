import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useCategoryColourScale, useClusterIdColourScale, useFrequencyUniqueKeyColourScale } from "../../hooks/useColourScales";
import * as clusterViewSlice from "./clusterViewSlice";
import { TransactionData } from "../../utilities/DataObject";
import * as d3 from "d3";
import { useEffect, useMemo, useRef, useState } from "react";
import { AxisBottom, AxisLeft } from "../Axis";
import * as interactivitySlice from "../Interactivity/interactivitySlice";
import { GRAY1 } from "../../utilities/consts";
import { Circles } from "./CirclesGL";
import { Button, Slider } from "@mui/material";
const BRUSH_MODE = 'end'
export const POINT_SIZE = 2
export interface ClusterViewProps {
    onSelectTransactionNumberArr: (selectedTransactionNumberArr: TransactionData['transactionNumber'][]) => void,
    onSetThisSelector: () => void
}

export default function ClusterView(props: ClusterViewProps) {
    // record the mapped data for the brusher, when the chart's scale changed, 
    const dispatch = useAppDispatch()
    const [lastBrushedValueExtent, setLastBrushedValueExtent] = useState<{ xMin: number, yMin: number, xMax: number, yMax: number } | null>(null) // if null, the brush should be hidden
    const brush = useRef<d3.BrushBehavior<SVGGElement> | null>(null)
    const brushGRef = useRef<SVGGElement | null>(null)

    const categoryColourScale = useCategoryColourScale()// can't be put in the store so use hook
    const clusterIdColourScale = useClusterIdColourScale()// can't be put in the store so use hook
    const frequencyUniqueKeyColourScale = useFrequencyUniqueKeyColourScale()// can't be put in the store so use hook
    const colour = useAppSelector(state => state.clusterView.colour);
    const colourScale = colour === 'category' ? categoryColourScale : colour === 'cluster' ? clusterIdColourScale : frequencyUniqueKeyColourScale // can't be put in the store so use hook

    // layout
    const containerHeight = useAppSelector(clusterViewSlice.selectCurrentContainerHeight)
    const containerWidth = useAppSelector(clusterViewSlice.selectCurrentContainerWidth)
    const marginLeft = useAppSelector(clusterViewSlice.selectMarginLeft)
    const marginRight = useAppSelector(clusterViewSlice.selectMarginRight)
    const marginTop = useAppSelector(clusterViewSlice.selectMarginTop)
    const marginBottom = useAppSelector(clusterViewSlice.selectMarginBottom)
    const width = containerWidth - marginLeft - marginRight
    const height = containerHeight - marginTop - marginBottom

    // dataset, they should be the same lenght, they are filtered
    const x = useAppSelector(clusterViewSlice.selectXdataMemorised)
    const y = useAppSelector(clusterViewSlice.selectYdataMemorised)
    const colourDomain = useAppSelector(clusterViewSlice.selectColourDomain)
    const id = useAppSelector(clusterViewSlice.selectIdArrMemorised)
    const selectedTransactionNumberArr = useAppSelector(interactivitySlice.selectSelectedTransactionNumberArrMemorised)
    const selectedTransactionNumberSet = useMemo(() => new Set(selectedTransactionNumberArr), [selectedTransactionNumberArr])
    // length checking
    if (x.length !== y.length || x.length !== colourDomain.length || x.length !== id.length) {
        console.log('invalid length of different columns', x, y, colourDomain, id)
        throw new Error("invalid length of different columns");
    }
    // id vs colourDomain unqique key
    if (id.some((id, index) => id !== colourDomain[index]['transactionNumber'])) {
        console.log("invalid colourDomain's transactionNumber", id, colourDomain)
        throw new Error("invalid colourDomain's transactionNumber");
    }

    // axis lable
    const xLabel = useAppSelector(clusterViewSlice.selectXAxisLabel)
    const yLabel = useAppSelector(clusterViewSlice.selectYAxisLabel)
    const colourLabel = useAppSelector(clusterViewSlice.selectColourLabel) // for decide wich colour scale to use

    // scales' range, domain, and isLogInfo
    const xLog = useAppSelector(clusterViewSlice.selectXlog)
    const yLog = useAppSelector(clusterViewSlice.selectYlog)
    let xDomainMin = useMemo(() => d3.min(x), [x])
    let xDomainMax = useMemo(() => d3.max(x), [x])
    let yDomainMin = useMemo(() => d3.min(y), [y])
    let yDomainMax = useMemo(() => d3.max(y), [y])
    xDomainMin = xDomainMin === undefined ? 0 : xDomainMin
    xDomainMax = xDomainMax === undefined ? 0 : xDomainMax
    yDomainMin = yDomainMin === undefined ? 0 : yDomainMin
    yDomainMax = yDomainMax === undefined ? 0 : yDomainMax
    const { filteredXDomainMin, filteredXDomainMax, filteredYDomainMin, filteredYDomainMax } = useAppSelector(clusterViewSlice.selectFilteredDomain)
    const xRangeMin = 0
    const xRangeMax = width
    const yRangeMin = height
    const yRangeMax = 0

    // for sliders' min max value
    const dataset = useAppSelector(state => state.interactivity.transactionDataArr)
    const sliderRange: { xMin: number, xMax: number, yMin: number, yMax: number } = useMemo(() => {
        let xMin = Number.MAX_VALUE
        let xMax = Number.MIN_VALUE
        let yMin = Number.MAX_VALUE
        let yMax = Number.MIN_VALUE
        dataset.forEach(row => {
            const [x, y] = [row[xLabel], row[yLabel]]
            if (x <= xMin) { xMin = x }
            if (x >= xMax) { xMax = x }
            if (y <= yMin) { yMin = y }
            if (y >= yMax) { yMax = y }
        })
        console.log('sliderRange:', { xMin, xMax, yMin, yMax })
        return { xMin, xMax, yMin, yMax }
    }, [dataset, xLabel, yLabel])

    const shouldShowBrusher = useAppSelector(clusterViewSlice.selectShouldShowClusterViewBrusher)
    useEffect(() => {
        if (brushGRef.current !== null) {
            brushGRef.current.setAttribute('opacity', shouldShowBrusher ? '1' : '0')
        }
        setLastBrushedValueExtent(null)
    }, [shouldShowBrusher]) // hide the brusher

    const handleSetThisSelector = props.onSetThisSelector
    const handleBrush = (event: d3.D3BrushEvent<SVGGElement> | undefined): void => {
        if (event === undefined || event.sourceEvent === undefined) {
            return
        }
        const selection = event.selection
        if (selection === null) {
            setLastBrushedValueExtent(null)
            props.onSelectTransactionNumberArr([]);
            return;
        }
        let x0: number, y0: number, x1: number, y1: number;
        if (Array.isArray(selection) && Array.isArray(selection[0]) && Array.isArray(selection[1])) {
            [[x0, y0], [x1, y1]] = selection; // ref this line: https://observablehq.com/@d3/brushable-scatterplot
        } else {
            throw new Error("selection type is not valid");
        }
        const [[xMin, xMax], [yMin, yMax]] = [[xScale.invert(x0), xScale.invert(x1)], [yScale.invert(y1), yScale.invert(y0)]]; // y1 and y0 are reverted because the coordinate system starts from the top
        setLastBrushedValueExtent({ xMin, xMax, yMin, yMax })

        // derive the brushed transactionNumberArr from x array, y array and id array
        const brushedTransactionNumberArr: TransactionData['transactionNumber'][] = []
        for (let i = 0; i < x.length; i++) {
            if (x[i] >= xMin && x[i] <= xMax && y[i] >= yMin && y[i] <= yMax) {
                brushedTransactionNumberArr.push(id[i])
            }
        }
        // use handler from the prop
        props.onSelectTransactionNumberArr(brushedTransactionNumberArr)
    }


    // add and update the brusher
    useEffect(() => {
        if (brush.current === null) {
            brush.current = d3.brush<SVGGElement>()
            brush.current.on('brush', handleSetThisSelector)
            brush.current.extent([[0, 0], [width, height]]).on(BRUSH_MODE, (handleBrush))
        }
        if (brushGRef.current !== null) {
            const brushG = d3.select<SVGGElement, SVGGElement>(brushGRef.current)
            brush.current.extent([[0, 0], [width, height]]).on(BRUSH_MODE, (handleBrush))
            brush.current(brushG)
            //move the brushes' position to the right place
        }
    }, [width, height, xLog, yLog, xLabel, yLabel, x, y])

    if (xDomainMin === undefined || xDomainMax === undefined || yDomainMin === undefined || yDomainMax === undefined) {

        console.log('xDomainMin,xDomainMax,yDomainMin,yDomainMax', xDomainMin, xDomainMax, yDomainMin, yDomainMax)
        throw new Error('undefined domain value exists')
    }
    // scales
    // const xScale = useXYScale([xDomainMin, xDomainMax], [(xRangeMax - xRangeMin) * 0.005, xRangeMax * 0.99], xLog, x)
    // const yScale = useXYScale([yDomainMin, yDomainMax], [yRangeMin * 0.99, (yRangeMin - yRangeMax) * 0.005], yLog, y)
    const xScale = useXYScale([filteredXDomainMin === 'min' ? xDomainMin : filteredXDomainMin, filteredXDomainMax === 'max' ? xDomainMax : filteredXDomainMax], [(xRangeMax - xRangeMin) * 0.005, xRangeMax * 0.99], xLog, x)
    const yScale = useXYScale([filteredYDomainMin === 'min' ? yDomainMin : filteredYDomainMin, filteredYDomainMax === 'max' ? yDomainMax : filteredYDomainMax], [yRangeMin * 0.99, (yRangeMin - yRangeMax) * 0.005], yLog, y)

    console.log('cluster xScale', xScale)
    console.log('cluster yScale', yScale)
    // visualData 
    const xVisualData = useXYVisualData({ data: x, accessor: d => d, scale: xScale })
    const yVisualData = useXYVisualData({ data: y, accessor: d => d, scale: yScale })
    const colourVisualData = colourDomain.map(({ domain, transactionNumber }) => {
        if (selectedTransactionNumberSet.size === 0 || selectedTransactionNumberSet.has(transactionNumber)) {
            return colourScale.getColour(domain)
        } else {
            return GRAY1
        }
    })
    useEffect(() => {
        // move brush base on last point
        if (brush.current !== null && brushGRef.current !== null) {
            const brushG = d3.select<SVGGElement, SVGGElement>(brushGRef.current)
            if (lastBrushedValueExtent !== null) {
                const xMin = xScale(lastBrushedValueExtent.xMin)
                const xMax = xScale(lastBrushedValueExtent.xMax)
                const yMin = yScale(lastBrushedValueExtent.yMin)
                const yMax = yScale(lastBrushedValueExtent.yMax)
                const extent: [[number, number], [number, number]] = [[d3.min([xMin, xMax]) as number, d3.min([yMin, yMax]) as number], [d3.max([xMin, xMax]) as number, d3.max([yMin, yMax]) as number]]
                brush.current.move(brushG, extent, undefined)
            }
        }
    }, [containerHeight, containerWidth, xScale, yScale])
    const onChangeXDomain = (xMin: number, xMax: number) => {
        dispatch(clusterViewSlice.setXSlider([xMin, xMax]))
    }
    const onChangeYDomain = (yMin: number, yMax: number) => {
        dispatch(clusterViewSlice.setYSlider([yMin, yMax]))
    }
    console.log('yslider data', sliderRange, yDomainMin, yDomainMax)
    console.log('xslider data', sliderRange, xDomainMin, xDomainMax)
    return (
        <div style={{ position: 'relative', width: containerWidth, height: containerHeight+20 }} className="clusterView">
            <div style={{ position: 'absolute', top: marginTop, height: height, zIndex: 5 }}>
                <Slider
                    key={`yLabel${sliderRange.yMin} ${sliderRange.yMax}`}
                    aria-label="Custom marks"
                    min={sliderRange.yMin}
                    max={sliderRange.yMax}
                    step={0.0001}
                    defaultValue={[yDomainMin, yDomainMax]}
                    valueLabelDisplay="auto"
                    orientation="vertical"
                    onChangeCommitted={(event, value) => {
                        if (typeof value === 'number') {
                            throw new Error("invalid value, it should be a list of number");
                        }; onChangeYDomain(value[0],value[1])
                    }} />
            </div>
            <svg width={containerWidth} height={containerHeight} style={{ zIndex: 1 }}>
                <g transform={`translate(${marginLeft},${marginTop})`}>
                    <g><AxisLeft yScale={yScale} numberOfTicksTarget={6}></AxisLeft></g>
                    <g transform={`translate(0, ${height})`}><AxisBottom xScale={xScale} numberOfTicksTarget={6}></AxisBottom></g>
                    <g ref={brushGRef}></g>
                </g>
            </svg>
            <div style={{ position: 'absolute', left: marginLeft, top: marginTop, zIndex: 2 }}>
                <Circles xVisualData={xVisualData} yVisualData={yVisualData} colourVisualData={colourVisualData} width={width} height={height}></Circles>
            </div>
            <svg width={containerWidth} height={containerHeight} style={{ position: 'absolute', left: marginLeft, top: marginTop, zIndex: 3 }}>
                <g ref={brushGRef}></g>
            </svg>
            <div style={{ position: 'absolute', left: marginLeft, width: width, zIndex: 5, bottom: marginBottom-25 }}>
                <Slider
                    key={`xLabel${sliderRange.xMin} ${sliderRange.xMax}`}
                    aria-label="Custom marks"
                    min={sliderRange.xMin}
                    max={sliderRange.xMax}
                    step={0.0001}
                    defaultValue={[xDomainMin, xDomainMax]}
                    valueLabelDisplay="auto"
                    onChangeCommitted={(event, value) => {
                        if (typeof value === 'number') {
                            throw new Error("invalid value, it should be a list of number");
                        }; onChangeXDomain(value[0], value[1])
                    }}
                />
            </div>
            {/* <div >
                <Button variant="contained">swap</Button>
            </div> */}
        </div>

    )
}

/**
 * 
 * @param domain domain for creating the scale
 * @param range range for creating the scale
 * @param logScale if use logscale or not
 * @param domainArr this will be used if there the min value in domain is <= 0, the smallest number which is > 0 will be used for domain min value, if length === 0, the min would be 0.00001
 * @returns 
 */
const useXYScale = (domain: [number, number],
    range: [number, number],
    logScale: boolean, domainArr: number[]):
    d3.ScaleLogarithmic<number, number> | d3.ScaleLinear<number, number> => {
    const [domainMin, domainMax] = domain
    const [rangeMin, rangeMax] = range
    const scale = useMemo(() => {
        // if (domainArr.length < 1) {
        //     throw new Error("invalid domainArr lenght, must be >= 1");
        // }
        const scaleFunction = logScale ? d3.scaleLog : d3.scaleLinear
        let domainMinGreaterThan0 = domainMin;
        if (logScale && domainMin <= 0 && d3.min(domainArr) as number < 0) {
            if (domainArr.length === 0) {
                domainMinGreaterThan0 = 0.00001
            } else {
                domainMinGreaterThan0 = domainArr.reduce((a, b) => b < a && b > 0 ? b : a, Number.MAX_VALUE)
            }
        }
        return scaleFunction().domain([domainMinGreaterThan0, domainMax]).rangeRound([rangeMin, rangeMax])

    }, [domainMin, domainMax, rangeMin, rangeMax, logScale])
    return scale
}

interface XYChannel<Datum, Domain, Range> {
    data: Datum[],
    accessor: (datum: Datum) => Domain,
    scale: (domain: Domain) => Range
}
function useXYVisualData<Datum, Domain, Range>(channel: XYChannel<Datum, Domain, Range>): Range[] {
    const data = channel.data
    const accessor = channel.accessor
    const scale = channel.scale
    const range = useMemo(() => data.map(datum => scale(accessor(datum))), [data, accessor, scale])
    return range
}
