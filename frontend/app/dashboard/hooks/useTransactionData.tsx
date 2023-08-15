'use client'
import { useAppSelector } from "@/app/hooks";
import * as interactivitySlice from "../components/Interactivity/interactivitySlice";

/**
 * dependancy: metric1, metric2, numberOfCluster, frequencyUniqueKey, distanceMeasure, linkageMethod, numberOfClusterForString
 */
export function useTransactionDataArr() {
    const transactionDataArr = useAppSelector(interactivitySlice.selectTransactionDataArr)
    return transactionDataArr
}