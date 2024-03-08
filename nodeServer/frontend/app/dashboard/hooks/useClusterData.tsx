'use client'
import { useAppSelector } from "@/app/hooks";
import * as interactivitySlice from "../components/Interactivity/interactivitySlice";
import { ClusterData } from "../utilities/clusterDataObject";
import { useMemo } from "react";

export default function useClusterData() {
    const clusterDataArr = useAppSelector(interactivitySlice.selectClusterDataArr);
    return clusterDataArr
}
export type ClusterDataMap = Map<ClusterData['transactionNumber'], ClusterData['clusterId']>;

/**key: transactionNumber, value: clusterId */
export function useClusterDataMap(): ClusterDataMap {
    const clusterDataArr = useClusterData();
    const clusterDataMap = useMemo(() => getClusterDataMapFromArr(clusterDataArr), [clusterDataArr])

    return clusterDataMap
}

export function getClusterDataMapFromArr(clusterDataArr: ClusterData[]): ClusterDataMap {
    const clusterDataMap: ClusterDataMap = new Map<ClusterData['transactionNumber'], ClusterData['clusterId']>();
    clusterDataArr.forEach(clusterData => clusterDataMap.set(clusterData['transactionNumber'], clusterData['clusterId']));
    return clusterDataMap;
}
