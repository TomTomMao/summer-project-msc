import { createContext } from "react"
import { DataPerTransactionDescription } from "../DataPerTransactionDescription"
import { TransactionData } from "../../DataObject"

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

/**
 * mapping data to x,y,colour
 * x: day of the year,
 * y: transaction amount
 * colour: transaction Category
 */
export const temporalValueGetter = {
    x: (transactionData: TransactionData) => transactionData.date === null ? 0 : daysIntoYear(transactionData.date),
    y: (transactionData: TransactionData) => transactionData.balance,
    colour: (transactionData: TransactionData) => transactionData.category
}
export const temporalValueGetterSwapped = {
    x: temporalValueGetter.y,
    y: temporalValueGetter.x,
    colour: (transactionData: TransactionData) => transactionData.category
}

/**
 * get the date of the year
 * reference: user2501097. (2016, December 5). Answer to ‘JavaScript calculate the day of the year (1—366)’. Stack Overflow. https://stackoverflow.com/a/40975730
 * @param date a date object
 * @returns the day of the year 1-366
 */
function daysIntoYear(date: Date): number {
    return (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
}