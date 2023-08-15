'use client'
import { useAppSelector } from "@/app/hooks";
import * as interactivitySlice from "../components/Interactivity/interactivitySlice";

export default function useClusterData() {
    const clusterDataArr = useAppSelector(interactivitySlice.selectClusterDataArr);
    return clusterDataArr
}
