import { useEffect, useMemo, useReducer, useState } from "react";
import { TransactionData, TransactionDataAttrs } from "../../utilities/DataObject";
import { PublicScale, PublicValueGetter } from "../../utilities/types";
import { ColourDomainData } from "../ColourChannel/colourChannelSlice";

export interface DescriptionAndIsCredit {
    transactionDescription: string;
    isCredit: boolean;
}
const UPARROW = <span>↑</span>;
const DOWNARROW = <span>↓</span>;
type Props = {
    transactionDataArr: TransactionData[];
    transactionNumberSet: Set<TransactionData['transactionNumber']>;
    handleClearSelect: (() => void)
    colourScale: PublicScale['colourScale']
    colourDomainData: ColourDomainData[]
}
/**
 * show the transactions that has the number in the transactionNumberSet
 * 
 * transactionNumberSet: transactionNumber that going to show
 * 
 * transactionDataArr: the transactionDataArr to loop thorugh
 */
export default function TableView({ transactionDataArr, transactionNumberSet, handleClearSelect, colourScale, colourDomainData }:
    Props) {
    // when the component mount or the filteredDescriptionAndIsCreditArr Changes, change it. the time complexity is transactionDataArr.length * filteredDescriptionAndIsCreditArr; can be improved in the future.[performance improvement]

    const [sortingConfig, dispatch] = useReducer(sortingConfigReducer, initialSortingConfig)
    const sortingKey = sortingConfig.sortingKey;
    const isDesc = sortingConfig.isDesc
    const filteredTransactionDataArr = transactionDataArr.filter(transactionData => transactionNumberSet.has(transactionData.transactionNumber))
    const sortedFilteredTransactionDataArr = useMemo(() => filteredTransactionDataArr.sort(TransactionData.curryCompare(sortingKey, isDesc)), [sortingConfig, filteredTransactionDataArr])
    const colourForTransactionNumberMap = useMemo(() => {
        // create a dictionary map the transactionNumber to colour string
        /**key: transactionNumber, value: 'RGB(XXX,XXX,XXX)' */
        const transactionNumberMappingColour = new Map<TransactionData['transactionNumber'], ReturnType<Props['colourScale']['getColour']>>()
        colourDomainData.forEach(({ domain, transactionNumber }) => {
            if (transactionNumberSet.has(transactionNumber)) {
                transactionNumberMappingColour.set(transactionNumber, colourScale.getColour(domain))
            }
        })
        return transactionNumberMappingColour
    }, [colourDomainData, transactionNumberSet, colourScale])
    const transactionRows = useMemo(() => {
        return (
            sortedFilteredTransactionDataArr.map(transactionData => {
                const colour = colourForTransactionNumberMap.get(transactionData.transactionNumber);
                return (
                    <tr key={transactionData.transactionNumber} style={{ backgroundColor: colour }}>
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
                        <td>{transactionData.frequency}</td>
                        <td>{transactionData.frequencyUniqueKey}</td>
                    </tr>)
            })
        )
    }, [sortedFilteredTransactionDataArr, colourForTransactionNumberMap])
    function handleClickColumnName(columnName: TransactionDataAttrs) {
        if (columnName === sortingKey) {
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
            <div className="text-xs">number of results: {filteredTransactionDataArr.length}</div>
            <button onClick={handleClearSelect}>clear all</button>
            <table className="infoTable">
                <thead>
                    <tr>
                        <td><button style={{ width: '100%' }} onClick={() => handleClickColumnName('transactionNumber')}>id {sortingKey === 'transactionNumber' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                        <td><button style={{ width: '100%' }} onClick={() => handleClickColumnName('balance')}>balance {sortingKey === 'balance' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                        <td><button style={{ width: '100%' }} onClick={() => handleClickColumnName('category')}>category {sortingKey === 'category' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                        <td><button style={{ width: '100%' }} onClick={() => handleClickColumnName('creditAmount')}>credit {sortingKey === 'creditAmount' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                        <td><button style={{ width: '100%' }} onClick={() => handleClickColumnName('debitAmount')}>debit {sortingKey === 'debitAmount' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                        <td><button style={{ width: '100%' }} onClick={() => handleClickColumnName('locationCity')}>City {sortingKey === 'locationCity' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                        <td><button style={{ width: '100%' }} onClick={() => handleClickColumnName('locationCountry')}>Country {sortingKey === 'locationCountry' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                        <td><button style={{ width: '100%' }} onClick={() => handleClickColumnName('transactionDescription')}>Description {sortingKey === 'transactionDescription' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                        <td><button style={{ width: '100%' }} onClick={() => handleClickColumnName('transactionType')}>Type {sortingKey === 'transactionType' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                        <td><button style={{ width: '100%' }} onClick={() => handleClickColumnName('date')}>date {sortingKey === 'date' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                        <td><button style={{ width: '100%' }} onClick={() => handleClickColumnName('frequency')}>frequency {sortingKey === 'frequency' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                        <td><button style={{ width: '100%' }} onClick={() => handleClickColumnName('frequencyUniqueKey')}>frequencyUniqueKey {sortingKey === 'frequencyUniqueKey' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
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