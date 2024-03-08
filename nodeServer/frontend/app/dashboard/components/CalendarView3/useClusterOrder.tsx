import { useAppSelector } from "@/app/hooks";
import * as interactivitySlice from "../Interactivity/interactivitySlice";
import { useMemo } from "react";
import { ClusterData } from "../../utilities/clusterDataObject";

export default function useClusterOrderMap() {
    const clusterOrderArr: ClusterData['clusterId'][] = useAppSelector(
        interactivitySlice.selectClusterOrderArrMemorised
    );
    const clusterOrderMap: Map<ClusterData["clusterId"], number> =
        useMemo(() => {
            const clusterOrderMap = new Map<ClusterData["clusterId"], number>();
            clusterOrderArr.forEach((clusterId, index) => {
                clusterOrderMap.set(clusterId, index);
            });
            return clusterOrderMap;
        }, [clusterOrderArr]);
    return clusterOrderMap;
}
