import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { ScaleOrdinalWithTransactionNumber, useCategoryColourScale, useClusterIdColourScale, useFrequencyUniqueKeyColourScale } from "../../hooks/useColourScales";
import * as clusterViewSlice from "./clusterViewSlice";
import { TransactionData } from "../../utilities/DataObject";
import { ScaleLinear, ScaleLogarithmic, max, min, scaleLinear, scaleLog } from "d3";
import { CanvasHTMLAttributes, DetailedHTMLProps, LegacyRef, useEffect, useMemo, useRef, useState } from "react";
import { AxisBottom, AxisLeft } from "../Axis";
import * as interactivitySlice from "../Interactivity/interactivitySlice";
import { GRAY1 } from "../../utilities/consts";

export interface ClusterViewProps {
    onSelectTransactionNumberArr: (selectedTransactionNumberArr: TransactionData['transactionNumber'][]) => void
}
export default function ClusterView(props: ClusterViewProps) {
    const [lastBrushedValueExtent, setLastBrushedValueExtent] = useState<[[number, number], [number, number]] | null>(null) // if null, the brush should be hidden

    const categoryColourScale = useCategoryColourScale()// can't be put in the store so use hook
    const clusterIdColourScale = useClusterIdColourScale()// can't be put in the store so use hook
    const frequencyUniqueKeyColourScale = useFrequencyUniqueKeyColourScale()// can't be put in the store so use hook
    const colour = useAppSelector(state => state.clusterView.colour);
    const colourScale = colour === 'category' ? categoryColourScale : colour === 'cluster' ? clusterIdColourScale : frequencyUniqueKeyColourScale // can't be put in the store so use hook
    console.log('clusterView1', colourScale)
    console.log('clusterView1', colourScale.getColour('savings'))

    // layout
    const containerHeight = useAppSelector(clusterViewSlice.selectCurrentContainerHeight)
    const containerWidth = useAppSelector(clusterViewSlice.selectCurrentContainerWidth)
    const marginLeft = useAppSelector(clusterViewSlice.selectMarginLeft)
    const marginRight = useAppSelector(clusterViewSlice.selectMarginRight)
    const marginTop = useAppSelector(clusterViewSlice.selectMarginTop)
    const marginBottom = useAppSelector(clusterViewSlice.selectMarginBottom)
    const width = containerWidth - marginLeft - marginRight
    const height = containerHeight - marginTop - marginBottom

    // dataset, they should be the same lenght
    const x = useAppSelector(clusterViewSlice.selectXdataMemorised)
    const y = useAppSelector(clusterViewSlice.selectYdataMemorised)
    const colourDomain = useAppSelector(clusterViewSlice.selectColourDomain)
    const id = useAppSelector(clusterViewSlice.selectIdArrMemorised)
    const selectedTransactionNumberArr = useAppSelector(interactivitySlice.selectSelectedTransactionNumberArr)
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
    const xDomainMin = useMemo(() => min(x), [x])
    const xDomainMax = useMemo(() => max(x), [x])
    const yDomainMin = useMemo(() => min(y), [y])
    const yDomainMax = useMemo(() => max(y), [y])
    const xRangeMin = 0
    const xRangeMax = width
    const yRangeMin = height
    const yRangeMax = 0

    const shouldShowBrusher = useAppSelector(clusterViewSlice.selectShouldShowClusterViewBrusher)
    useEffect(() => setLastBrushedValueExtent(null), [shouldShowBrusher]) // hide the brusher

    const handleBrush = () => {
        // use handler from the prop
        const brushedValueExtent = []
        const brushedTransactionNumberArr: TransactionData['transactionNumber'][] = []
        props.onSelectTransactionNumberArr(brushedTransactionNumberArr)
    }

    if (xDomainMin === undefined || xDomainMax === undefined || yDomainMin === undefined || yDomainMax === undefined) {
        return <>waiting for data</>
    }
    // scales
    const xScale = useXYScale([xDomainMin, xDomainMax], [xRangeMin, xRangeMax], xLog)
    const yScale = useXYScale([yDomainMin, yDomainMax], [yRangeMin, yRangeMax], yLog)

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

    return (
        <div style={{ position: 'static' }}>
            <div style={{ position: 'relative' }}>
                <svg width={containerWidth} height={containerHeight} style={{ zIndex: 1, position: 'absolute' }}>
                    <g transform={`translate(${marginLeft},${marginTop})`}>
                        {/* <g>{circlesToDisplay}</g> */}
                        <g><AxisLeft yScale={yScale} numberOfTicksTarget={6}></AxisLeft></g>
                        <g transform={`translate(0, ${height})`}><AxisBottom xScale={xScale} numberOfTicksTarget={6}></AxisBottom></g>
                        {/* <g ref={brushGRef}></g> */}
                    </g>
                </svg>
                <div style={{ position: 'absolute', left: marginLeft, top: marginTop, zIndex: 2 }}>
                    <Circles xVisualData={xVisualData} yVisualData={yVisualData} colourVisualData={colourVisualData} width={width} height={height}></Circles>
                </div>
            </div>
        </div>
    )
}

const useXYScale: (domain: [number, number], range: [number, number], logScale: boolean) => ScaleLogarithmic<number, number> | ScaleLinear<number, number> =
    (domain: [number, number], range: [number, number], logScale: boolean) => {
        const [domainMin, domainMax] = domain
        const [rangeMin, rangeMax] = range
        const scale = useMemo(() => {
            const scaleFunction = logScale ? scaleLog : scaleLinear
            return scaleFunction().domain([domainMin, domainMax]).rangeRound([rangeMin, rangeMax])

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

interface ColourChannel<Datum> {
    data: Datum[],
    accessor: (datum: Datum) => string,
    scale: ScaleOrdinalWithTransactionNumber
}
function getColourVisualData<Datum>(channel: ColourChannel<Datum>): string[] {
    const data = channel.data
    const accessor = channel.accessor
    const scale = channel.scale
    const range = data.map(datum => scale.getColour(accessor(datum)))
    return range
}

/**
 * colourVisualData: a list of string in this format: 'RGB(XXX,XXX,XXX)'
 * @param param0 
 * @returns 
 */
function Circles({ xVisualData, yVisualData, colourVisualData, width, height }:
    { xVisualData: number[], yVisualData: number[], colourVisualData: string[], width: number, height: number }) {
    const canvasRef = useRef<HTMLCanvasElement>(null)


    useEffect(() => {

        // create a map: colour->index[]
        const colourIndexMap = new Map<string, number[]>()
        colourVisualData.forEach((colourVisualDatum, index) => {
            const currentColourIndexArr = colourIndexMap.get(colourVisualDatum)
            if (currentColourIndexArr === undefined) {
                colourIndexMap.set(colourVisualDatum, [index])
            } else {
                currentColourIndexArr.push(index)
            }
        })


        const canvas = canvasRef.current
        let context: CanvasRenderingContext2D | null = null;
        if (canvas !== null) {
            let hdCanvas = createHDCanvas(canvas, width, height)
            context = hdCanvas.getContext('2d')
            if (context === null) {
                return // do nothing
            }
            // loop through the keys, for each key, draw data based on the corresponding xdata and ydata, and key(which is colour)
            const context2 = context
            context2.clearRect(0, 0, width, height)
            // draw circles
            colourIndexMap.forEach((indexes, fill) => {
                // reference: https://dirask.com/posts/JavaScript-draw-point-on-canvas-element-PpOBLD
                context2.fillStyle = fill
                indexes.forEach(index => {
                    context2.beginPath();
                    context2.arc(xVisualData[index], yVisualData[index], 1.7, 0 * Math.PI, 2 * Math.PI);
                    context2.fill();
                })
            })
        }

    }, [xVisualData, yVisualData, colourVisualData])

    return (
        <canvas ref={canvasRef} width={width} height={height}>
        </canvas>
    )
}

function createHDCanvas(canvas: HTMLCanvasElement, w: number, h: number) {
    // reference: https://juejin.cn/post/7014765000916992036
    const ratio = window.devicePixelRatio || 1;
    canvas.width = w * ratio;
    canvas.height = h * ratio;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d')
    if (ctx === null) {
        throw new Error("shold be null, check args for getContext()");

    }
    ctx.scale(ratio, ratio)
    return canvas;
}
