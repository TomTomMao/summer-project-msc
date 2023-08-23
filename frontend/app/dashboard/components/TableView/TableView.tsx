import { ChangeEvent, useEffect, useMemo, useReducer, useState } from "react";
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

    // for the table paging feature
    const numberOfRow = sortedFilteredTransactionDataArr.length
    const numberOfRowPerPage = sortingConfig.numberOfRowPerPage === 'all' ? numberOfRow : sortingConfig.numberOfRowPerPage
    const maxPageNumber = Math.ceil(numberOfRow / numberOfRowPerPage)
    const currentPageNumber = sortingConfig.currentPage
    const startIndex = (currentPageNumber - 1) * numberOfRowPerPage
    const endIndex = startIndex + numberOfRowPerPage >= numberOfRow ? numberOfRow - 1 : startIndex + numberOfRowPerPage - 1// >= because it is index
    const currentPageTransactionDataArr = sortedFilteredTransactionDataArr.slice(startIndex, endIndex + 1) // +1 because end is exclusive 
    const transactionRows = useMemo(() => {
        return (
            currentPageTransactionDataArr.map(transactionData => {
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
    }, [currentPageTransactionDataArr, colourForTransactionNumberMap])
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
    function handleChangeNumberOfRowsPerPage(event: ChangeEvent<HTMLSelectElement>) {
        const value = event.target.value
        if (String(parseInt(value)) === value) {
            dispatch({
                type: 'change number of rows',
                numberOfRowPerPage: parseInt(value)
            })
        } else if (value === 'all') {
            dispatch({
                type: 'change number of rows',
                numberOfRowPerPage: 'all'
            })
        }
    }
    return (
        <div>

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
            <div>
                <div className="text-xs">number of results: {filteredTransactionDataArr.length}</div>
                <button onClick={handleClearSelect}>clear all</button>
                <label htmlFor=""> show: </label>
                <select name="" id="" onChange={(event) => handleChangeNumberOfRowsPerPage(event)}>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                    <option value="all">all</option>
                </select> rows
            </div>
        </div>
    )
}

type SortingConfig = {
    sortingKey: TransactionDataAttrs,
    isDesc: boolean,
    numberOfRowPerPage: number | 'all',
    currentPage: number
}
type SortingConfigAction = {
    type: 'change sorting key',
    newSortingKey: SortingConfig['sortingKey']
} | {
    type: 'toggle order'
} | {
    type: 'change number of rows',
    numberOfRowPerPage: number | 'all'
}
function sortingConfigReducer(sortingConfig: SortingConfig, action: SortingConfigAction): SortingConfig {
    switch (action.type) {
        case 'change sorting key':
            return { ...sortingConfig, sortingKey: action.newSortingKey }
        case 'toggle order':
            return { ...sortingConfig, isDesc: !sortingConfig.isDesc }
        case 'change number of rows':
            return { ...sortingConfig, numberOfRowPerPage: action.numberOfRowPerPage }
        default:
            const _exhaustiveCheck: never = action
            throw new Error("invalid action");
            ;
    }
}
const initialSortingConfig: SortingConfig = {
    sortingKey: 'transactionNumber',
    isDesc: false,
    numberOfRowPerPage: 25,
    currentPage: 1
}
