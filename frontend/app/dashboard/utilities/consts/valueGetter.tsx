import { TransactionData } from "../DataObject"

/**
 * mapping data to x,y,colour
 * x: day of the year,
 * y: transaction amount
 * colour: transaction Category
 */
export const temporalValueGetter = {
    x: (transactionData: TransactionData) => transactionData.date === null ? 0 : daysIntoYear(transactionData.date),
    y: (transactionData: TransactionData) => transactionData.transactionAmount,
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