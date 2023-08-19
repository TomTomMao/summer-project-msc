import { useAppSelector } from "@/app/hooks";
import { TransactionData } from "../utilities/DataObject";
import { ClusterData } from "../utilities/clusterDataObject";
import { PublicScale } from "../utilities/types";
import { useMemo } from "react";
import { ClusterView2Props } from "../components/ClusterView/ClusterView2";

import { ScaleOrdinalWithTransactionNumber, useCategoryColourScale, useClusterIdColourScale, useFrequencyUniqueKeyColourScale } from "./useColourScales";
import * as interactivitySlice from "../components/Interactivity/interactivitySlice";
type ValueForColour = {
    valueForColour: string,
    transactionNumber: string
}
export function usePrepareClusterViewData(transactionDataArr: TransactionData[] | null, clusterDataArr: ClusterData[]): ClusterView2Props['initData'] | null {
    const xLable = useAppSelector(state => state.clusterView.x);
    const yLable = useAppSelector(state => state.clusterView.y);
    const colour = useAppSelector(state => state.clusterView.colour);
    const categoryColourScale = useCategoryColourScale()
    const clusterIdColourScale = useClusterIdColourScale()
    const frequencyUniqueKeyColourScale = useFrequencyUniqueKeyColourScale()

    const { clusterViewColourScale, valueForColourArr }: { clusterViewColourScale: ScaleOrdinalWithTransactionNumber | null, valueForColourArr: ValueForColour[] | null } = useMemo(() => {
        const clusterDataMap = new Map<string, string>();
        clusterDataArr.forEach(clusterData => clusterDataMap.set(clusterData.transactionNumber, clusterData.clusterId))
        if (transactionDataArr === null || transactionDataArr.length === 0) {
            return { clusterViewColourScale: null, valueForColourArr: null }
        }
        let valueForColourArr: ValueForColour[];
        let clusterViewColourScale
        if (colour === 'cluster') {
            valueForColourArr = transactionDataArr.map(transactionData => {
                const transactionNumber = transactionData.transactionNumber;
                const clusterId = clusterDataMap.get(transactionNumber)
                if (clusterId === undefined) {
                    throw new Error('inconsistant data, transactionNumber does not exists in clusterDataMap' + `; transactionNumber: ${transactionNumber}`)
                }
                return {
                    transactionNumber: transactionData.transactionNumber,
                    valueForColour: clusterId
                }

            })
            clusterViewColourScale = clusterIdColourScale
        } else if (colour === 'frequencyUniqueKey') {
            valueForColourArr = transactionDataArr.map(transactionData => {
                const transactionNumber = transactionData.transactionNumber
                const frequencyUniqueKey = transactionData.frequencyUniqueKey
                return {
                    transactionNumber: transactionNumber,
                    valueForColour: frequencyUniqueKey
                }
            })
            clusterViewColourScale = frequencyUniqueKeyColourScale
        } else if (colour === 'category') {
            valueForColourArr = transactionDataArr.map(transactionData => {
                const transactionNumber = transactionData.transactionNumber
                const category = transactionData.category
                return {
                    transactionNumber: transactionNumber,
                    valueForColour: category
                }
            })
            clusterViewColourScale = categoryColourScale
        } else {
            const _exausthiveCheck: never = colour // if this line is highlighted by the code editor, that means there is some case not checked
            throw new Error("this should never happen");
        }

        return { clusterViewColourScale, valueForColourArr }

    }, [colour, transactionDataArr, clusterDataArr,categoryColourScale, clusterIdColourScale, frequencyUniqueKeyColourScale])

    const preparedClusterViewData = useMemo(() => {
        if (transactionDataArr === null || clusterViewColourScale === null || valueForColourArr === null) {
            return null;
        }
        const xData = transactionDataArr.map(transactionData => transactionData[xLable])
        const yData = transactionDataArr.map(transactionData => transactionData[yLable])
        const colourData = valueForColourArr.map(value => clusterViewColourScale.getColour(value.valueForColour, value.transactionNumber))

        const preparedClusterViewData = [
            {
                type: 'scattergl' as const,
                mode: 'markers' as const,
                x: xData,
                y: yData,
                marker: {
                    size: 4,
                    color: colourData
                }
            },
        ]

        return preparedClusterViewData

    }, [valueForColourArr, clusterViewColourScale, xLable, yLable, transactionDataArr])

    return preparedClusterViewData
}
