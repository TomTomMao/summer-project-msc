'use client'
import { useAppSelector } from "@/app/hooks";
import * as interactivitySlice from "../components/Interactivity/interactivitySlice";
import { ClusterData } from "../utilities/clusterDataObject";
import { useMemo } from "react";
import { TransactionData } from "../utilities/DataObject";

export default function useClusterData() {
    const clusterDataArr = useAppSelector(interactivitySlice.selectClusterDataArr);
    return clusterDataArr
}

export function useClusterDataMap(): Map<ClusterData['transactionNumber'], ClusterData['clusterId']> {
    const clusterDataArr = useClusterData();
    const clusterDataMap = useMemo(() => getClusterDataMapFromArr(clusterDataArr), [clusterDataArr])

    return clusterDataMap
}

export function getClusterDataMapFromArr(clusterDataArr: ClusterData[]): Map<string, string> {
    const clusterDataMap = new Map<ClusterData['transactionNumber'], ClusterData['clusterId']>();
    clusterDataArr.forEach(clusterData => clusterDataMap.set(clusterData['transactionNumber'], clusterData['clusterId']));
    return clusterDataMap;
}
