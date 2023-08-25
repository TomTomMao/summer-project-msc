import { ScaleOrdinalWithTransactionNumber, useCategoryColourScale } from "@/app/dashboard/hooks/useColourScales"
import { useAppSelector } from "@/app/hooks"
import { ScaleLinear, ScaleLogarithmic } from "d3"
import * as interactivitySlice from "../../Interactivity/interactivitySlice"
import * as d3 from 'd3'
import { Data } from "../CalendarView3"

export type PolarAreaChartDatum = {
    name: string,   
    value: number,
    colour: string,
}
type PolarAreaChartProps = {
    data: PolarAreaChartDatum[],
    colourScale: ScaleOrdinalWithTransactionNumber,
    yScale: ScaleLinear<number, number> | ScaleLogarithmic<number, number>
}

export function TestPolarAreaChart() {
    const transactionDataArr = useAppSelector(interactivitySlice.selectTransactionDataArr)
    const categoryDataMap = d3.rollup(transactionDataArr,
        transactionDataArrOfGroup => d3.sum(transactionDataArrOfGroup.map(transactionData => transactionData.transactionAmount)),
        transactionData => transactionData.category)
    let polarAreaChartData: PolarAreaChartDatum[] = []
    categoryDataMap.forEach((transactionAmountSum: number, category: string) => {
        polarAreaChartData.push({ name: category, value: transactionAmountSum })
    })

    const colourScale = useCategoryColourScale()

    

    return <>
        {polarAreaChartData.map((polarAreaChartDatum: PolarAreaChartDatum) => {
            return (<div>
                category: {polarAreaChartDatum.name}, transactionAmountSum: {polarAreaChartDatum.value}
            </div>)
        })}
    </>
}

export default function PolarAreaChart(props: PolarAreaChartProps) {

}



