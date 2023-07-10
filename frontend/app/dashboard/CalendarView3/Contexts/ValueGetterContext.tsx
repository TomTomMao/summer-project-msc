import { createContext } from "react"
import { DataPerTransactionDescription } from "../DataPerTransactionDescription"

/**
 * this one is used for calendar view's scatter plots and the cluster views' scatter plot.
 */
export const initValueGetter = {
    x: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.monetaryAvgDay,
    y: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.frequencyAvgDay,
    colour: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.amountToday,
    size: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.timeToday,
    shape: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.isCredit
}
export const ValueGetterContext = createContext(initValueGetter)