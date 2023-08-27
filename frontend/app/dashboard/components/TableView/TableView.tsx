import { ChangeEvent, useEffect, useMemo, useReducer } from "react";
import { TransactionData, TransactionDataAttrs } from "../../utilities/DataObject";
import { PublicScale } from "../../utilities/types";
import { ColourDomainData } from "../ColourChannel/colourChannelSlice";
import { relative } from "path";
import { Tooltip } from "@mui/material";
import { UPARROW, DOWNARROW } from "../../utilities/Arrows";
import { ClusterDataMap } from "../../hooks/useClusterData";
const DEFAULT_NUMBER_OF_ROW_PER_PAGE = 8
export interface DescriptionAndIsCredit {
    transactionDescription: string;
    isCredit: boolean;
}

/**
 * 
 * transactionNumberSet: transactionNumber that going to show
 * 
 * transactionDataArr: the transactionDataArr to loop thorugh
 * 
 * handleClearSelect event handler for clicking '
 * 
 * colourScale, used for back ground of a row
 * 
 * colourDomainData: used for determine what domain value to use when calling colourScale
 * 
 * 
 */
type Props = {
    transactionDataArr: TransactionData[];
    transactionNumberSet: Set<TransactionData['transactionNumber']>;
    clusterDataMap: ClusterDataMap;
    handleClearSelect: (() => void);
    colourScale: PublicScale['colourScale'];
    colourDomainData: ColourDomainData[];
    children: React.ReactNode;
}
/**
 * show the transactions that has the number in the transactionNumberSet
 * 
 * transactionNumberSet: transactionNumber that going to show
 * 
 * transactionDataArr: the transactionDataArr to loop thorugh
 * reference for fixed head: https://labotrees.com/web-technologies/how-to-set-tbody-height-with-overflow-scroll/#:~:text=To%20do%20this%2C,the%20behavior%20of%20a%20table.
 */
export default function TableView({ transactionDataArr, transactionNumberSet, clusterDataMap, handleClearSelect, colourScale, colourDomainData, children }:
    Props) {
    // when the component mount or the filteredDescriptionAndIsCreditArr Changes, change it. the time complexity is transactionDataArr.length * filteredDescriptionAndIsCreditArr; can be improved in the future.[performance improvement]

    const [sortingConfig, dispatch] = useReducer(sortingConfigReducer, initialSortingConfig)
    const sortingKey = sortingConfig.sortingKey;
    const isDesc = sortingConfig.isDesc
    const filteredTransactionDataArr = useMemo(() => transactionDataArr.filter(transactionData => transactionNumberSet.has(transactionData.transactionNumber)), [transactionDataArr, transactionNumberSet])
    useEffect(() => dispatch({ type: 'init' }), [filteredTransactionDataArr])
    const sortedFilteredTransactionDataArr = useMemo(() => {
        if (sortingKey !== 'clusterId') {
            return [...filteredTransactionDataArr].sort(TransactionData.curryCompare(sortingKey, isDesc))
        }
        const filteredTransactionDataArrWithClusterId = filteredTransactionDataArr.map(transactionData => {
            const clusterId = clusterDataMap.get(transactionData.transactionNumber)
            if (clusterId === undefined) {
                throw new Error(`clusterData does not have transactionNumber:${transactionData.transactionNumber}`);
            }
            return {
                transactionData,
                clusterId: clusterId
            }
        })
        if (isDesc) {
            return filteredTransactionDataArrWithClusterId.sort((a, b) => a.clusterId < b.clusterId ? 1 : -1).map(d => d.transactionData)
        }
        return filteredTransactionDataArrWithClusterId.sort((a, b) => a.clusterId > b.clusterId ? 1 : -1).map(d => d.transactionData)

    }, [sortingConfig, filteredTransactionDataArr])
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
                const clusterId = clusterDataMap.get(transactionData.transactionNumber)
                if (clusterId === undefined) {
                    throw new Error(`clusterData does not have transactionNumber:${transactionData.transactionNumber}`);
                }
                return (
                    <tr key={transactionData.transactionNumber} style={{ backgroundColor: colour }}>
                        <Tooltip title={transactionData.transactionNumber}><td className="help" style={{ overflowX: 'hidden', width: '50%', height: '4em' }}>{transactionData.transactionNumber}</td></Tooltip>
                        <Tooltip title={String(transactionData.balance)}><td className="help" style={{ overflowX: 'hidden', width: '70%', height: '4em' }}>{transactionData.balance}</td></Tooltip>
                        <Tooltip title={transactionData.category}><td className="help" style={{ overflowX: 'hidden', width: '100%', height: '4em' }}>{transactionData.category}</td></Tooltip>
                        <Tooltip title={String(transactionData.creditAmount)}><td className="help" style={{ overflowX: 'hidden', width: '70%', height: '4em' }}>{transactionData.creditAmount}</td></Tooltip>
                        <Tooltip title={String(transactionData.debitAmount)}><td className="help" style={{ overflowX: 'hidden', width: '70%', height: '4em' }}>{transactionData.debitAmount}</td></Tooltip>
                        <Tooltip title={transactionData.locationCity}><td className="help" style={{ overflowX: 'hidden', width: '70%', height: '4em' }}>{transactionData.locationCity}</td></Tooltip>
                        <Tooltip title={transactionData.locationCountry}><td className="help" style={{ overflowX: 'hidden', width: '100%', height: '4em' }}>{transactionData.locationCountry}</td></Tooltip>
                        <Tooltip title={transactionData.transactionDescription} ><td className="help" style={{ overflowX: 'hidden', width: '150%', height: '4em' }}>{transactionData.transactionDescription}</td></Tooltip>
                        <Tooltip title={transactionData.transactionType}><td className="help" style={{ overflowX: 'hidden', width: '50%', height: '4em' }}>{transactionData.transactionType}</td></Tooltip>
                        <Tooltip title={transactionData.date?.toDateString()}><td className="help" style={{ overflowX: 'hidden', width: '100%', height: '4em' }}>{transactionData.date?.toDateString()}</td></Tooltip>
                        <Tooltip title={String(transactionData.frequency)}><td className="help" style={{ overflowX: 'hidden', width: '100%', height: '4em' }}>{(transactionData.frequency.toFixed(2))}</td></Tooltip>
                        <Tooltip title={transactionData.frequencyUniqueKey}><td className="help" style={{ overflowX: 'hidden', width: '100%', height: '4em' }}>{transactionData.frequencyUniqueKey}</td></Tooltip>
                        <Tooltip title={clusterId}><td className="help" style={{ overflowX: 'hidden', width: '100%', height: '4em' }}>{clusterId}</td></Tooltip>
                    </tr>)
            })
        )
    }, [currentPageTransactionDataArr, colourForTransactionNumberMap])
    function handleClickColumnName(columnName: TransactionDataAttrs | 'clusterId') {
        if (columnName === sortingKey) {
            handleToggleOrder()
        } else {
            handleChangeSortingKey(columnName)
        }
    }
    function handleChangeSortingKey(newSortingKey: TransactionDataAttrs | 'clusterId') {
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
                        <label htmlFor="" style={{ paddingTop: '2px' }}>{startIndex + 1}-{endIndex + 1} of {numberOfRow} Current Page:</label>
                        {/* input height is mannualy set to be the same as the clear all button */}
                        <input style={{ height: '22px', position: 'relative', top: '2.7px' }} type="number" name="" id="" value={currentPageNumber} min={1} max={maxPageNumber} onChange={(e) => handleChangePage(parseInt(e.target.value))} />
                    </div>
                    <div>
                        <button onClick={handleClearSelect}>Clear All</button>
                    </div>
                </div></>
            }
        </div>
        <table className="infoTable">
            <thead>
                <tr>
                    <td style={{ width: '50%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('transactionNumber')}>ID {sortingKey === 'transactionNumber' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                    <td style={{ width: '70%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('balance')}>Balance {sortingKey === 'balance' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                    <td style={{ width: '100%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('category')}>Category {sortingKey === 'category' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                    <td style={{ width: '70%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('creditAmount')}>Credit {sortingKey === 'creditAmount' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                    <td style={{ width: '70%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('debitAmount')}>Debit {sortingKey === 'debitAmount' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                    <td style={{ width: '70%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('locationCity')}>City {sortingKey === 'locationCity' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                    <td style={{ width: '100%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('locationCountry')}>Country {sortingKey === 'locationCountry' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                    <td style={{ width: '150%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('transactionDescription')}>Description {sortingKey === 'transactionDescription' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                    <td style={{ width: '50%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('transactionType')}>Type {sortingKey === 'transactionType' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                    <td style={{ width: '100%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('date')}>Date {sortingKey === 'date' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                    <td style={{ width: '100%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('frequency')}>Frequency {sortingKey === 'frequency' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                    <td style={{ width: '100%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('frequencyUniqueKey')}>Description Group {sortingKey === 'frequencyUniqueKey' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                    <td style={{ width: '100%', height: '4em' }}><button style={{ width: '100%', height: '4em' }} onClick={() => handleClickColumnName('clusterId')}>Cluster Id {sortingKey === 'clusterId' ? (isDesc ? UPARROW : DOWNARROW) : ' '}</button></td>
                </tr>
            </thead>
            <tbody style={({ height: numberOfRowPerPage > DEFAULT_NUMBER_OF_ROW_PER_PAGE ? '87vh' : '', display: 'block', overflowY: 'scroll' })}>
                {transactionRows}
            </tbody>
        </table>
    </>
    )
}

type SortingConfig = {
    sortingKey: TransactionDataAttrs | 'clusterId',
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
