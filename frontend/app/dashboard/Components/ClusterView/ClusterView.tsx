import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { ScaleOrdinalWithTransactionNumber, useCategoryColourScale, useClusterIdColourScale, useFrequencyUniqueKeyColourScale } from "../../hooks/useColourScales";
import * as clusterViewSlice from "./clusterViewSlice";
import { TransactionData } from "../../utilities/DataObject";
import { ScaleLinear, ScaleLogarithmic, indexes, max, min, scaleLinear, scaleLog } from "d3";
import { CanvasHTMLAttributes, DetailedHTMLProps, LegacyRef, useEffect, useMemo, useState } from "react";
import { AxisBottom, AxisLeft } from "../Axis";
import * as interactivitySlice from "../Interactivity/interactivitySlice";
import { GRAY1 } from "../../utilities/consts";
import { Circles } from "./CirclesGL";

export const POINT_SIZE = 2
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
    const xScale = useXYScale([xDomainMin, xDomainMax], [(xRangeMax - xRangeMin) * 0.005, xRangeMax * 0.99], xLog, x)
    const yScale = useXYScale([yDomainMin, yDomainMax], [yRangeMin * 0.99, (yRangeMin - yRangeMax) * 0.005], yLog, y)

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
        <div style={{ position: 'relative' }}>
            <svg width={containerWidth} height={containerHeight} style={{ zIndex: 1 }}>
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
    )
}

/**
 * 
 * @param domain domain for creating the scale
 * @param range range for creating the scale
 * @param logScale if use logscale or not
 * @param domainArr this will be used if there the min value in domain is <= 0, the smallest number which is > 0 will be used for domain min value, length must >= 1
 * @returns 
 */
const useXYScale = (domain: [number, number],
    range: [number, number],
    logScale: boolean, domainArr: number[]):
    ScaleLogarithmic<number, number> | ScaleLinear<number, number> => {
    const [domainMin, domainMax] = domain
    const [rangeMin, rangeMax] = range
    const scale = useMemo(() => {
        if (domainArr.length < 1) {
            throw new Error("invalid domainArr lenght, must be >= 1");
        }
        const scaleFunction = logScale ? scaleLog : scaleLinear
        let domainMinGreaterThan0 = domainMin;
        if (logScale && domainMin <= 0 && min(domainArr) as number < 0) {
            domainMinGreaterThan0 = domainArr.reduce((a, b) => b < a && b > 0 ? b : a, Number.MAX_VALUE)
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