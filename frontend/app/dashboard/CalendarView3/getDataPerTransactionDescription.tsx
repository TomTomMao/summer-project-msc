import { RFMData, TransactionData } from "../DataObject";
import { AssertionError } from "assert";
import { DataPerTransactionDescription } from "./DataPerTransactionDescription";

/**
 * use the information from transctionDataArr and RFMDataArr to get an array of DataPerTransactinDescription object.
 * assume all the transaction description appears in the keys of the RFMDataMap
 * @param transactionDataArr an array of data
 * @param RFMDataArr an array of RFMData
 * @param RFMDataMap a map where the key is the transactionDescription in RFMDataArr, and the value is the index of the item, whose transactionDescription = the key, in the RFMDataArr.
 * @return return an array of DataPerTransactionDescription
 */
export function getDataPerTransactionDescription(transactionDataArr: TransactionData[], RFMDataArr: RFMData[], RFMDataMap: Map<string, number>): DataPerTransactionDescription[] {
    const transactionDescriptions = Array.from(new Set(transactionDataArr.map((transactionData: TransactionData) => transactionData.transactionDescription))); // O(N)

    // aggregate data to transaction description level; O(N^2), can be optimised
    const dataPerTransactionDescriptionArr: DataPerTransactionDescription[] = transactionDescriptions.map(transactionDescription => {
        const RFMDataRecord: RFMData | undefined = getRFMData(transactionDescription, RFMDataMap, RFMDataArr);
        if (RFMDataRecord === undefined) {
            // console.log(transactionDescription, RFMDataMap, RFMDataArr)
            throw new AssertionError({ message: `RFM Data of ${transactionDescription} not found` });
        }
        else {
            const monetaryAvgDay = RFMDataRecord.monetaryAvgDay;
            const frequencyAvgDay = RFMDataRecord.frequencyAvgDay;
            const amountToday = transactionDataArr.filter(d => d.transactionDescription === transactionDescription).reduce((a, b) => a + (b.isCredit() ? b.creditAmount : b.debitAmount), 0);
            const timeToday = transactionDataArr.filter(d => d.transactionDescription === transactionDescription).length;
            const isCredit = transactionDataArr.filter(d => d.transactionDescription === transactionDescription)[0].isCredit();
            return new DataPerTransactionDescription(transactionDescription, monetaryAvgDay, frequencyAvgDay, amountToday, timeToday, isCredit);
        }
    });
    return dataPerTransactionDescriptionArr;
}

/**
 * helper function for getDataPerTransactionDescription
 * @param transactionDescription 
 * @param RFMDataArr an array of RFMData
 * @param RFMDataMap a map where the key is the transactionDescription in RFMDataArr, and the value is the index of the item, whose transactionDescription = the key, in the RFMDataArr.
 * @returns an RFMData of the transactionDescription or undefined if not found
 */
const getRFMData = (transactionDescription: string, RFMDataMap: Map<string, number>, RFMDataArr: RFMData[]): RFMData | undefined => {
    const index: number | undefined = RFMDataMap.get(transactionDescription)
    return index !== undefined ? RFMDataArr[index] : undefined
}
