'use client'
import { useEffect, useState } from "react"
import { ClusterData } from "../utilities/clusterDataObject"
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import * as clusterViewSlice from "../components/ClusterView/clusterViewSlice"
import { TransactionData } from "../utilities/DataObject";

export default function useClusterData(transactionDataArr: TransactionData[]) {
    const [clusterData, setClusterData] = useState<Array<ClusterData>>([]);
    const numberOfCluster = useAppSelector(clusterViewSlice.selectNumberOfCluster);
    const metric1 = useAppSelector(clusterViewSlice.selectMetric1);
    const metric2 = useAppSelector(clusterViewSlice.selectMetric2);
    useEffect(() => {
        clusterViewSlice.getClusterData(numberOfCluster, metric1, metric2).then((fetchedClusterData: ClusterData[]) => {
            setClusterData(fetchedClusterData)
            console.log('clusterdata updated: ', fetchedClusterData, numberOfCluster, metric1, metric2)
        }
        ).catch(error => {
            console.log(error)
            setClusterData([]);
        })
    }, [numberOfCluster, metric1, metric2, transactionDataArr])

    return clusterData
}
