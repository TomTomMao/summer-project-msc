import { useAppSelector } from "@/app/hooks";
import { TransactionData } from "../utilities/DataObject";
import { ClusterData } from "../utilities/clusterDataObject";
import { PublicScale } from "../utilities/types";
import { useMemo } from "react";
import { ClusterView2Props } from "../components/ClusterView/ClusterView2";

export function usePrepareClusterViewData(transactionDataArr: TransactionData[] | null, clusterDataArr: ClusterData[], colourScale: PublicScale['colourScale'] | null): ClusterView2Props['data'] | null {
    const xLable = useAppSelector(state => state.clusterView.x);
    const yLable = useAppSelector(state => state.clusterView.y);
    const colour = useAppSelector(state => state.clusterView.colour);

    const data = useMemo(() => {
        const clusterDataMap = new Map();
        clusterDataArr.forEach(clusterData => clusterDataMap.set(clusterData.transactionNumber, clusterData.clusterId))
        if (transactionDataArr === null || colourScale === null) {
            return null;
        }
        const colourData = transactionDataArr.map(transactionData => {
            if (colour === 'cluster') {
                return clusterDataMap.get(transactionData.transactionNumber)
            } else {
                // return default: category
                return colourScale(transactionData.category)
            }
        })

        return {
            xData: transactionDataArr.map(transactionData => transactionData[xLable]),
            yData: transactionDataArr.map(transactionData => transactionData[yLable]),
            colourData: colourData
        }
    }, [transactionDataArr, clusterDataArr, colourScale, xLable, yLable, colour])
    const preparedClusterViewData = useMemo(() => {
        if (data === null) {
            return null
        }
        const preparedClusterViewData = [
            {
                type: 'scattergl' as const,
                mode: 'markers' as const,
                x: data.xData,
                y: data.yData,
                marker: {
                    size: 5,
                    color: data.colourData
                }
            },
        ]
        return preparedClusterViewData
    }, [data])
    return preparedClusterViewData
}