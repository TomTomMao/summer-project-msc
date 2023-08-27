import { ScaleLinear, ScaleLogarithmic } from "d3"
import * as d3 from 'd3'
import { useMemo } from "react"

export type StarChartDatum = {
    name: string,
    value: number,
    colour: string,
}
export type StarChartProps = {
    data: StarChartDatum[],
    radiusScale: ScaleLinear<number, number> | ScaleLogarithmic<number, number>,
    angleScale: ScaleLinear<number, number>,
}

type CartesianPoint = { x: number, y: number }
type PolarPoint = { theta: number, radius: number }
type TriangleData = [CartesianPoint, CartesianPoint, CartesianPoint]

/**data to draw area layer*/
type StarAreaData = TriangleData[]
/**data to draw line layer*/
interface StarLineDatum extends CartesianPoint { colour: string }
type StarLineData = StarLineDatum[]
/**draw a polar area chart, the chart width and height is the same as radiusScale's range*2 
 * 
*/
export default function StarChart(props: StarChartProps) {
    const { data, angleScale, radiusScale } = props
    const containerWidth = radiusScale.range()[1] * 2
    const containerHeight = radiusScale.range()[1] * 2

    const { starAreaData, starLineData } = useStarData(data,radiusScale, angleScale)

    return <button onClick={() => console.log({ starAreaData, starLineData, data, radiusScale, angleScale })}>data</button>

    // return (<svg
    //     width={containerWidth} height={containerHeight}>
    //     <g transform={`translate(${containerWidth * 0.5},${containerHeight * 0.5})`}>

    //     </g>
    // </svg>);
}

/**
 * map data's to x,y coordinate with, x,y start from left-top, (0,0) is the left-top point. angleScale is clock wise.
 * and return the data for drawing area layer and lines layer
 * @param data 
 * @param radiusScale 
 * @param angleScale 
 */
function useStarData(data: StarChartDatum[],
    radiusScale: StarChartProps['radiusScale'],
    angleScale: StarChartProps['angleScale']): { starAreaData: StarAreaData, starLineData: StarLineData } {
    const starData = useMemo(() => getStarData(data, radiusScale, angleScale), [data, radiusScale, angleScale])
    return starData
}

/**
 * map data's to x,y coordinate with, x,y start from left-top, (0,0) is the left-top point. angleScale is clock wise.
 * and return the data for drawing area layer and lines layer
 * @param data 
 * @param radiusScale 
 * @param angleScale 
 */
function getStarData(data: StarChartDatum[],
    radiusScale: StarChartProps['radiusScale'],
    angleScale: StarChartProps['angleScale']): { starAreaData: StarAreaData, starLineData: StarLineData } {
    const originPoint: CartesianPoint = { x: 0, y: 0 }
    let lastPoint: CartesianPoint | undefined = undefined
    const starAreaData: StarAreaData = []
    const starLineData: StarLineData = []

    // for each data, prepare line data and triangle data
    for (let index = 0; index < data.length; index++) {
        const datum = data[index]
        const { colour, value } = datum
        const theta = angleScale(index);
        const radius = value === 0 ? 0 : radiusScale(value)
        if (isNaN(theta) || isNaN(radius)) {
            console.log(`nan value for theta or radius, index=${index}, value=${value}, angleScale: ${angleScale}, radiusScale: ${radiusScale}`, { starAreaData, starLineData, data, radiusScale, angleScale });
            // throw new Error(`nan value for theta or radius, index=${index}, value=${value}, angleScale: ${angleScale}, radiusScale: ${radiusScale}`);
        }
        const x = radius * Math.sin(theta)
        const y = - radius * Math.cos(theta)
        const currentPoint: CartesianPoint = { x, y }
        starLineData.push({ x, y, colour: colour })
        if (lastPoint !== undefined) {
            starAreaData.push(createTriangleData(originPoint, lastPoint, currentPoint))
        } else {
            lastPoint = { x, y }
        }
    }

    return { starAreaData, starLineData }
}



function createTriangleData(cartesianPoint1: CartesianPoint, cartesianPoint2: CartesianPoint, cartesianPoint3: CartesianPoint): TriangleData {
    return [cartesianPoint1, cartesianPoint2, cartesianPoint3]
}