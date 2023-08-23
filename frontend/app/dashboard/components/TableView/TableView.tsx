import { ChangeEvent, useEffect, useMemo, useReducer } from "react";
import { TransactionData, TransactionDataAttrs } from "../../utilities/DataObject";
import { PublicScale } from "../../utilities/types";
import { ColourDomainData } from "../ColourChannel/colourChannelSlice";
import { relative } from "path";
const DEFAULT_NUMBER_OF_ROW_PER_PAGE = 8
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
    colourDomainData: ColourDomainData[],
    children: React.ReactNode
}
/**
 * show the transactions that has the number in the transactionNumberSet
 * 
 * transactionNumberSet: transactionNumber that going to show
 * 
 * transactionDataArr: the transactionDataArr to loop thorugh
 */
export default function TableView({ transactionDataArr, transactionNumberSet, handleClearSelect, colourScale, colourDomainData, children }:
    Props) {
    // when the component mount or the filteredDescriptionAndIsCreditArr Changes, change it. the time complexity is transactionDataArr.length * filteredDescriptionAndIsCreditArr; can be improved in the future.[performance improvement]

    const [sortingConfig, dispatch] = useReducer(sortingConfigReducer, initialSortingConfig)
    const sortingKey = sortingConfig.sortingKey;
    const isDesc = sortingConfig.isDesc
    const filteredTransactionDataArr = useMemo(() => transactionDataArr.filter(transactionData => transactionNumberSet.has(transactionData.transactionNumber)), [transactionDataArr, transactionNumberSet])
    useEffect(() => dispatch({ type: 'init' }), [filteredTransactionDataArr])
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

    // focus on the table head
    useEffect(() => {
        const tableViewDiv = document.getElementById('tableView')
        tableViewDiv !== null && tableViewDiv.scrollIntoView({
            block: "start", // reference Ilario Engler's answer https://stackoverflow.com/questions/12102118/scrollintoview-animation
            behavior: "smooth"
        })
    }, [numberOfRowPerPage])

    const transactionRows = useMemo(() => {
        return (
            currentPageTransactionDataArr.map(transactionData => {
                const colour = colourForTransactionNumberMap.get(transactionData.transactionNumber);
                return (
                    <tr key={transactionData.transactionNumber} style={{ backgroundColor: colour }}>
                        <td className="help" title={transactionData.transactionNumber} style={{ width: '50%', height: '4em' }}>{transactionData.transactionNumber}</td>
                        <td className="help" title={String(transactionData.balance)} style={{ width: '70%', height: '4em' }}>{transactionData.balance}</td>
                        <td className="help" title={transactionData.category} style={{ width: '100%', height: '4em' }}>{transactionData.category}</td>
                        <td className="help" title={String(transactionData.creditAmount)} style={{ width: '70%', height: '4em' }}>{transactionData.creditAmount}</td>
                        <td className="help" title={String(transactionData.debitAmount)} style={{ width: '70%', height: '4em' }}>{transactionData.debitAmount}</td>
                        <td className="help" title={transactionData.locationCity} style={{ width: '70%', height: '4em' }}>{transactionData.locationCity}</td>
                        <td className="help" title={transactionData.locationCountry} style={{ width: '100%', height: '4em' }}>{transactionData.locationCountry}</td>
                        <td className="help" title={transactionData.transactionDescription} style={{ width: '150%', height: '4em' }}>{transactionData.transactionDescription}</td>
                        <td className="help" title={transactionData.transactionType} style={{ width: '50%', height: '4em' }}>{transactionData.transactionType}</td>
                        <td className="help" title={transactionData.date?.toDateString()} style={{ width: '100%', height: '4em' }}>{transactionData.date?.toDateString()}</td>
                        <td className="help" title={String(transactionData.frequency)} style={{ width: '100%', height: '4em' }}>{(transactionData.frequency.toFixed(2))}</td>
                        <td className="help" title={transactionData.frequencyUniqueKey} style={{ width: '100%', height: '4em' }}>{transactionData.frequencyUniqueKey}</td>
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
        dispatch({ type: 'change page', nextPage: 1 })
    }
    function handleChangePage(nextPage: number) {
        if (nextPage <= maxPageNumber) {
            dispatch({ type: 'change page', nextPage: nextPage })
        }
    }
    return (<>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginRight: '16.5px' }}>

            <div>{children}</div>
            {numberOfRow > 0 && <>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <label style={{ paddingTop: '2px', height: '22px', paddingRight: '5px' }} htmlFor=""> show </label>
                    <select name="" id="" value={numberOfRowPerPage === numberOfRow ? 'all' : numberOfRowPerPage} onChange={(event) => handleChangeNumberOfRowsPerPage(event)}>
                        <option value={DEFAULT_NUMBER_OF_ROW_PER_PAGE}>{DEFAULT_NUMBER_OF_ROW_PER_PAGE}</option>
                        <option value="17">17</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="200">200</option>
                        <option value="all">{numberOfRow}</option>
                    </select>
                    <span style={{ paddingTop: '2px', paddingRight: '8px', paddingLeft: '5px' }}>rows</span>

                    <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <label htmlFor="" style={{ paddingTop: '2px' }}>{startIndex + 1}-{endIndex + 1} of {numberOfRow} current page:</label>
                        {/* input height is mannualy set to be the same as the clear all button */}
                        <input style={{ height: '22px', position: 'relative', top: '2.7px' }} type="number" name="" id="" value={currentPageNumber} min={1} max={maxPageNumber} onChange={(e) => handleChangePage(parseInt(e.target.value))} />
                    </div>
                    <div>
                        <button onClick={handleClearSelect}>clear all</button>
                    </div>
                </div></>
            }
        </div>
        <table className="infoTable">
            <thead>
                <tr>
                    <td style={{ width: '50%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('transactionNumber')}>id {sortingKey === 'transactionNumber' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                    <td style={{ width: '70%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('balance')}>balance {sortingKey === 'balance' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                    <td style={{ width: '100%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('category')}>category {sortingKey === 'category' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                    <td style={{ width: '70%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('creditAmount')}>credit {sortingKey === 'creditAmount' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                    <td style={{ width: '70%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('debitAmount')}>debit {sortingKey === 'debitAmount' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                    <td style={{ width: '70%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('locationCity')}>City {sortingKey === 'locationCity' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                    <td style={{ width: '100%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('locationCountry')}>Country {sortingKey === 'locationCountry' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                    <td style={{ width: '150%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('transactionDescription')}>Description {sortingKey === 'transactionDescription' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                    <td style={{ width: '50%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('transactionType')}>Type {sortingKey === 'transactionType' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                    <td style={{ width: '100%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('date')}>date {sortingKey === 'date' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                    <td style={{ width: '100%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('frequency')}>frequency {sortingKey === 'frequency' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                    <td style={{ width: '100%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('frequencyUniqueKey')}>description group {sortingKey === 'frequencyUniqueKey' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                </tr>
            </thead>
            <tbody style={({ height: numberOfRowPerPage > DEFAULT_NUMBER_OF_ROW_PER_PAGE ? '87vh' : '', display: 'block', overflowY: 'scroll' })}>
                {transactionRows}
            </tbody>
        </table>
        {/* {numberOfRowPerPage > 7 && numberOfRow > 7  &&
            <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
            <div>{children}</div>
            <div style={{ display: 'flex', flexDirection: 'row'}}>
                <label style={{ paddingTop: '2px' }} htmlFor=""> show: </label>
                <select name="" id="" value={numberOfRowPerPage} onChange={(event) => handleChangeNumberOfRowsPerPage(event)}>
                    <option value={DEFAULT_NUMBER_OF_ROW_PER_PAGE}>{DEFAULT_NUMBER_OF_ROW_PER_PAGE}</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                    <option value="all">all</option>
                </select> 
                <span style={{ paddingTop: '2px' , paddingRight: '10px'}}>rows</span>
                <div style={{ paddingTop: '2px' }}> number of results: {filteredTransactionDataArr.length} </div>
                <div>
                    <button onClick={handleClearSelect}>clear all</button>
                </div>
            </div>
        </div>
        } */}
    </>
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
} | {
    type: 'change page',
    nextPage: number
} | {
    type: 'init'
}
function sortingConfigReducer(sortingConfig: SortingConfig, action: SortingConfigAction): SortingConfig {
    switch (action.type) {
        case 'change sorting key':
            return { ...sortingConfig, sortingKey: action.newSortingKey }
        case 'toggle order':
            return { ...sortingConfig, isDesc: !sortingConfig.isDesc }
        case 'change number of rows':
            return { ...sortingConfig, numberOfRowPerPage: action.numberOfRowPerPage }
        case 'change page':
            return { ...sortingConfig, currentPage: action.nextPage }
        case 'init':
            return { ...initialSortingConfig }
        default:
            const _exhaustiveCheck: never = action
            throw new Error("invalid action");
            ;
    }
}
const initialSortingConfig: SortingConfig = {
    sortingKey: 'transactionNumber',
    isDesc: false,
    numberOfRowPerPage: DEFAULT_NUMBER_OF_ROW_PER_PAGE,
    currentPage: 1
}
