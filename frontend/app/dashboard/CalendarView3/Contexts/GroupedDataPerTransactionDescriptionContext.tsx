import { createContext } from "react";
interface DataPerTransactionDescription {
    transactionDescription: string
    monetaryAvgDay: number
    frequencyAvgDay: number
    amountToday: number
    timeToday: number
    isCredit: boolean
}

export const GroupedDataPerTransactionDescriptionContext = createContext<Map<string, Map<string, Map<string, DataPerTransactionDescription[]>>>|null>(null);