'use client'
import { useAppSelector } from "@/app/hooks";
import * as interactivitySlice from "../components/Interactivity/interactivitySlice";

/**
 * get the transaction data from the store
 */
export function useTransactionDataArr() {
    const transactionDataArr = useAppSelector(interactivitySlice.selectTransactionDataArr)
    return transactionDataArr
}