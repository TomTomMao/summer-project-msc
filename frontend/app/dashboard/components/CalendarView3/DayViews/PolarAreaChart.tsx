import { ScaleLinear, ScaleLogarithmic } from "d3"
import * as d3 from 'd3'

export type PolarAreaChartDatum = {
    name: string,
    value: number,
    colour: string,
}
type PolarAreaChartProps = {
    data: PolarAreaChartDatum[],
    radiusScale: ScaleLinear<number, number> | ScaleLogarithmic<number, number>,
    angleScale: ScaleLinear<number, number>,
}

/**draw a polar area chart, the chart width and height is the same as radiusScale's range*2 
 * 
*/
export default function PolarAreaChart(props: PolarAreaChartProps) {
    const { data, angleScale, radiusScale } = props
    const containerWidth = radiusScale.range()[1] * 2
    const containerHeight = radiusScale.range()[1] * 2
    const arcGenerator = d3.arc()
    const arcs = data.map(function (datum, index) {
        const angleScaleLocal = angleScale
        const innerRadius = 0
        const outerRadius = radiusScale(datum.value)
        const startAngle = angleScaleLocal(index)
        const endAngle = angleScaleLocal((index + 1) % (data.length + 1))
        const arc = arcGenerator({ innerRadius, outerRadius, startAngle, endAngle })
        return arc
    })
    const paths = arcs.map((arc, i) => {
        const { colour, name } = data[i]
        return <path key={name}
            d={arc === null ? undefined : arc}
            fill={colour}
        ></path>
    })
    return (<svg
        // ref={svgRef}
        width={containerWidth} height={containerHeight}>
        <g transform={`translate(${containerWidth * 0.5},${containerHeight * 0.5})`}>
            {paths}
        </g>
    </svg>);
}
