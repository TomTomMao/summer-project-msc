import { useAppSelector } from "@/app/hooks";
import { TransactionData } from "../utilities/DataObject";
import { ClusterData } from "../utilities/clusterDataObject";
import { PublicScale } from "../utilities/types";

export function usePrepareClusterViewData(transactionDataArr: TransactionData[] | null, clusterDataArr: ClusterData[], colourScale: PublicScale['colourScale'] | null): { xData: number[], yData: number[], colourData: string[] } | null {
    const xLable = useAppSelector(state => state.clusterView.x);
    const yLable = useAppSelector(state => state.clusterView.y);
    const colour = useAppSelector(state => state.clusterView.colour);
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

}