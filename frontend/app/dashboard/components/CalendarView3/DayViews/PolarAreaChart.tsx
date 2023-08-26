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
    // const svgRef = useRef<SVGSVGElement>(null)
    // return <><button onClick={() => console.log(data)}>consolelog</button></>
    // useEffect(() => {
    //     // reference: https://observablehq.com/@sophiamersmann/polar-area-chart
    //     // select the svg, draw the polar area glyph on the svg.
    //     const svgElement = svgRef.current
    //     if (svgElement !== null) {
    //         draw(svgElement, data, angleScale, radiusScale, containerWidth, containerHeight)
    //     }
    // }, [data, angleScale, radiusScale])
    const arcGenerator = d3.arc()
    console.log('angleScale', angleScale)
    const startAngleArr = data.map((_, index) => {
    })
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

const Y_TICK_SPACING = 2
const Y_MAX_TICK = 20
function draw(svgElement: SVGSVGElement,
    data: PolarAreaChartDatum[],
    angleScale: PolarAreaChartProps['angleScale'],
    radiusScale: PolarAreaChartProps['radiusScale'],
    width: number,
    height: number): void {
    const svg = d3.select(svgElement)
        .attr("viewBox", [-width / 2, -height / 2, width, height])
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round");

    const g = svg.selectAll("g")
        .data(data)
        .join("g")
        .attr("fill", d => d.colour);

    g.selectAll("path")
        .data((d, i) => d3.range(
            Y_TICK_SPACING, d.value + 1, Y_TICK_SPACING
        ).map(value => ({ value: value, pos: i })))
        .join("path")
        .attr("fill-opacity", d => d.value / Y_MAX_TICK)
        .attr("d", d => d3.arc<{ value: number, pos: number }>()
            .innerRadius(radiusScale(d.value - Y_TICK_SPACING))
            .outerRadius(radiusScale(d.value))
            .startAngle(angleScale(d.pos))
            .endAngle(angleScale(d.pos + 1))(d));
}