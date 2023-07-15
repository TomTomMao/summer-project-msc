import { useEffect, useMemo, useReducer, useState } from "react";
import { TransactionData, RFMData, TransactionDataAttrs } from "../DataObject";

export interface DescriptionAndIsCredit {
    transactionDescription: string;
    isCredit: boolean;
}


/**
 * show the transactions that has the number in the transactionNumberSet
 */
export default function TableView({ transactionDataArr, transactionNumberSet, handleClearSelect }:
    {
        transactionDataArr: TransactionData[], transactionNumberSet: Set<TransactionData['transactionNumber']>, handleClearSelect: (() => void)
    }) {
    // when the component mount or the filteredDescriptionAndIsCreditArr Changes, change it. the time complexity is transactionDataArr.length * filteredDescriptionAndIsCreditArr; can be improved in the future.[performance improvement]
    const columnNames = TransactionData.getColumnNames()
    const [sortingConfig, dispatch] = useReducer(sortingConfigReducer, initialSortingConfig)

    const filteredTransactionDataArr = transactionDataArr.filter(transactionData => transactionNumberSet.has(transactionData.transactionNumber)).sort(TransactionData.curryCompare(sortingConfig.sortingKey, sortingConfig.isDesc))
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
                        <td>{transactionData.date?.toDateString()}</td>
                    </tr>)
            })
        )
    }, [transactionDataArr, transactionNumberSet, sortingConfig])
    function handleClickColumnName(columnName: TransactionDataAttrs) {
        if (columnName === sortingConfig.sortingKey) {
            handleToggleOrder()
        } else {
            handleChangeSortingKey(columnName)
        }
    }
    function handleChangeSortingKey(newSortingKey: TransactionDataAttrs) {
        dispatch({ type: 'change sorting key', newSortingKey: newSortingKey })
    }
    function handleToggleOrder() {
        dispatch({ type: 'toggle order' })
    }
    return (
        <div>
            <div>number of results: {filteredTransactionDataArr.length}</div>
            <div><button onClick={handleClearSelect}>clear all</button></div>
            <div>sorted by {sortingConfig.sortingKey}</div>
            <div>order: {sortingConfig.isDesc ? 'descending' : 'ascending'}</div>
            <table className="infoTable">
                <thead>
                    <tr>
                        <td><button onClick={() => handleClickColumnName('transactionNumber')}>transactionNumber</button></td>
                        <td><button onClick={() => handleClickColumnName('balance')}>balance</button></td>
                        <td><button onClick={() => handleClickColumnName('category')}>category</button></td>
                        <td><button onClick={() => handleClickColumnName('creditAmount')}>creditAmount</button></td>
                        <td><button onClick={() => handleClickColumnName('debitAmount')}>debitAmount</button></td>
                        <td><button onClick={() => handleClickColumnName('locationCity')}>locationCity</button></td>
                        <td><button onClick={() => handleClickColumnName('locationCountry')}>locationCountry</button></td>
                        <td><button onClick={() => handleClickColumnName('transactionDescription')}>transactionDescription</button></td>
                        <td><button onClick={() => handleClickColumnName('transactionType')}>transactionType</button></td>
                        <td><button onClick={() => handleClickColumnName('date')}>date</button></td>
                    </tr>
                </thead>
                <tbody>
                    {transactionRows}
                </tbody>
            </table>
        </div>
    )
}

// helper functions

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

type SortingConfig = {
    sortingKey: TransactionDataAttrs,
    isDesc: boolean
}
type SortingConfigAction = {
    type: 'change sorting key',
    newSortingKey: SortingConfig['sortingKey']
} | {
    type: 'toggle order'
}
function sortingConfigReducer(sortingConfig: SortingConfig, action: SortingConfigAction): SortingConfig {
    switch (action.type) {
        case 'change sorting key':
            return { ...sortingConfig, sortingKey: action.newSortingKey }
        case 'toggle order':
            return { ...sortingConfig, isDesc: !sortingConfig.isDesc }
        default:
            throw new Error("invalid action");
            ;
    }
}
const initialSortingConfig: SortingConfig = {
    sortingKey: 'transactionNumber',
    isDesc: false
}