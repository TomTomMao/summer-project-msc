import { ScaleOrdinalWithTransactionNumber } from "@/app/dashboard/hooks/useColourScales";
import { ClusterData } from "@/app/dashboard/utilities/clusterDataObject";
import { Data } from "../CalendarView3";
import { ClusterDataMap } from "@/app/dashboard/hooks/useClusterData";
import { DayViewProps } from "./AbstractDayView"
import { useAppSelector } from "@/app/hooks";
import * as calendarViewSlice from "../calendarViewSlice";
import useCalendarDayGlyphTransactionDataArr from "./useDayData";
import { useMemo } from "react";
import { rollup, sum } from "d3";
import { TransactionData, TransactionDataNumericalAttrs } from "@/app/dashboard/utilities/DataObject";
import { GRAY1 } from "@/app/dashboard/utilities/consts";
import StarChart from "./starChart";

export type StarViewSharedScales = {
    /**colourScale should use clusterId */
    colourScale: ScaleOrdinalWithTransactionNumber;
    linearRadiusScale: d3.ScaleLinear<number, number>;
    logRadiusScale: d3.ScaleLogarithmic<number, number>;
    angleScale: d3.ScaleLinear<number, number>;
    /** key: cluster id, value: index */
    clusterOrderMap: Map<ClusterData['clusterId'], number>;
}
interface StarViewData extends Data {
    clusterDataMap: ClusterDataMap
}

export interface StarDayViewProps extends DayViewProps {
    data: StarViewData;
    scales: StarViewSharedScales;
}

export function StarDayView(props: StarDayViewProps) {
    const { day, month, currentYear, data, scales, containerSize } = props;
    const { highLightedTransactionNumberSetByBrusher, transactionDataMapYMD, transactionDataMapMD, clusterDataMap } = data
    const { angleScale, clusterOrderMap, linearRadiusScale, logRadiusScale, colourScale } = scales
    const isSuperPositioned = useAppSelector(calendarViewSlice.selectIsSuperPositioned);

    /** 
     * if isSuperPositioned = true, dayData is an array of all the transactionData whose month and day are the same as props.day and props.month
     * 
     * if isSuperPositioned = false, dayData is an array of all the transactionData whose year, month and day are the same as props.day, props.month and props.currentyear
    */
    const dayData = useCalendarDayGlyphTransactionDataArr(day, month, currentYear, transactionDataMapYMD, transactionDataMapMD, isSuperPositioned)

    /** a map, key is clusterId, value has two property:
     * totalTransactionAmount: the sum of transactionAmount 
     * transactionNumberArr: the correspoding transaction Numbers of the clusterId*/
    const clusterIdTransactionAmountMap = useMemo(() => {
        return rollup(dayData,
            (transactionDataArr: TransactionData[]) => {
                return {
                    transactionNumberArr: transactionDataArr.map(transactionData => transactionData.transactionNumber),
                    totalTransactionAmount: sum(transactionDataArr, transactionData => transactionData['transactionAmount'])
                }
            },
            ({ transactionNumber }) => {
                const clusterId = clusterDataMap.get(transactionNumber);
                if (clusterId === undefined) {
                    console.log(`transaction with number: ${transactionNumber} does not exist in clusterDataMap`, clusterDataMap)
                    throw new Error(`transaction with number: ${transactionNumber} does not exist in clusterDataMap`);
                } else {
                    return clusterId
                }
            }
        )

    }, [dayData, clusterDataMap])

    const chartData = useMemo(() => {
        const chartDataLocal = Array(clusterOrderMap.size)
        clusterOrderMap.forEach((index, clusterId) => {
            const transactionAmountAndTransactionNumberOfClusterId = clusterIdTransactionAmountMap.get(clusterId)
            if (transactionAmountAndTransactionNumberOfClusterId === undefined) {
                // this clusterId does not exist of dayData, push {name: clusterId, value:0, colour: GRAY1}
                chartDataLocal[index] = { name: clusterId, value: 0, colour: GRAY1 }
            } else {
                const { totalTransactionAmount, transactionNumberArr } = transactionAmountAndTransactionNumberOfClusterId
                chartDataLocal[index] = {
                    name: clusterId,
                    value: totalTransactionAmount,
                    colour: transactionNumberArr.some((transactionNumber) => colourScale.getColour(clusterId, transactionNumber) !== GRAY1) ? colourScale.getColour(clusterId) : GRAY1
                }
            }
        })
        return chartDataLocal
    }, [clusterIdTransactionAmountMap, clusterOrderMap, colourScale])
    
    // return <div onClick={() => console.log({ props, dayData, chartData, colourScale, clusterIdTransactionAmountMap, clusterOrderMap, highLightedTransactionNumberSetByBrusher })}>
    //     <StarChart data={chartData} radiusScale={logRadiusScale} angleScale={angleScale}></StarChart>
    // </div>
    return <>
        <StarChart data={chartData} radiusScale={logRadiusScale} angleScale={angleScale}></StarChart>
    </>
}
