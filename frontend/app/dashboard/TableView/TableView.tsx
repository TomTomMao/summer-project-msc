import { useEffect, useMemo, useState } from "react";
import { TransactionData, RFMData } from "../DataObject";

export interface DescriptionAndIsCredit {
    transactionDescription: string;
    isCredit: boolean;
}

/**
 * show the filtered transactions based on filteredDescriptionAndIsCreditArr
 */
export default function TableView({ transactionDataArr, RFMDataArr, filteredDescriptionAndIsCreditArr }:
    {
        transactionDataArr: TransactionData[], RFMDataArr: RFMData[], filteredDescriptionAndIsCreditArr: DescriptionAndIsCredit[]
    }) {
    // initially, just copy the transaction numbers into a set
    const [filteredTransactionNumbers, setFilteredTransactionNumbers] = useState<Set<TransactionData['transactionNumber']>>(new Set(transactionDataArr.map(transactionData => transactionData.transactionNumber)))
    // when the component mount or the filteredDescriptionAndIsCreditArr Changes, change it. the time complexity is transactionDataArr.length * filteredDescriptionAndIsCreditArr; can be improved in the future.[performance improvement]
    useEffect(() => {
        const nextFilteredTransactionNumbers = getFilteredTransactionNumbers(transactionDataArr, filteredDescriptionAndIsCreditArr);
        setFilteredTransactionNumbers(nextFilteredTransactionNumbers);
    }, [filteredDescriptionAndIsCreditArr])
    const filteredTransactionDataArr = transactionDataArr.filter(transactionData => filteredTransactionNumbers.has(transactionData.transactionNumber));
    const transactionRows = useMemo(() => {
        return (
            filteredTransactionDataArr.map(transactionData => {
                return (
                    <tr key={transactionData.transactionNumber}>
                        <td>{transactionData.transactionNumber}</td>
                        <td>{transactionData.balance}</td>
                        <td>{transactionData.category}</td>
                        <td>{transactionData.creditAmount}</td>
                        <td>{transactionData.debitAmount}</td>
                        <td>{transactionData.locationCity}</td>
                        <td>{transactionData.locationCountry}</td>
                        <td>{transactionData.transactionDescription}</td>
                        <td>{transactionData.transactionType}</td>
                    </tr>)
            })
        )
    }, [filteredTransactionNumbers])

    return (
        <div>
            number of results: {filteredTransactionDataArr.length}
            <table>
                <thead>
                    <tr>
                        <td>transactionNumber</td>
                        <td>balance</td>
                        <td>category</td>
                        <td>creditAmount</td>
                        <td>debitAmount</td>
                        <td>locationCity</td>
                        <td>locationCountry</td>
                        <td>transactionDescription</td>
                        <td>transactionType</td>
                    </tr>
                </thead>
                <tbody>
                    {transactionRows}
                </tbody>
            </table>
        </div>
    )
}

// help functions

/**
 * return transactionNumber of those transactionData whose transactionDescription and isCredit() in the filteredDescriptionAndIsCreditArr array 
 * @param transactionDataArr an array of transactionData
 * @param filteredDescriptionAndIsCreditArr conditions to contains
 * @return a set of transactionData.transactionNumber
 * time complexity: O(n*k) where n is transactionDataArr.length and k is filteredDescriptionAndIsCreditArr.length
 * can be improved in the future
 */
function getFilteredTransactionNumbers(transactionDataArr: TransactionData[], filteredDescriptionAndIsCreditArr: DescriptionAndIsCredit[]): Set<TransactionData['transactionNumber']> {
    const transactionNumberSet = new Set<TransactionData['transactionNumber']>();
    for (let i = 0; i < transactionDataArr.length; i++) {
        for (let j = 0; j < filteredDescriptionAndIsCreditArr.length; j++) {
            const currTransactionData = transactionDataArr[i];
            const currDescriptionAndIsCredit = filteredDescriptionAndIsCreditArr[j];
            if (currTransactionData.transactionDescription === currDescriptionAndIsCredit.transactionDescription && currTransactionData.isCredit() === currDescriptionAndIsCredit.isCredit) {
                transactionNumberSet.add(currTransactionData.transactionNumber);
            }
        }
    }
    return transactionNumberSet;
}