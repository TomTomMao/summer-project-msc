import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { CTransaction, ETransactionVariable } from "../Transaction";
import { CalendarSvg, ICalendarSvgData, defaultSvgDataPoint } from "./CalendarSvg/CalendarSvg";
import { getCalendarSvgTestData } from "./calenderSvgTestData"
import { CalendarController } from "./CalendarController/CalendarController";
import styles from './calendarView.module.css'
import * as d3 from "d3";
import { warn } from "console";
interface IRollupedData {
    date: Date,
    dataForColour: number
}
export interface IMapping {
    visualVariable: ECalendarViewVisualVariables,
    dataVariable: ETransactionVariable | null
}
export enum ECalendarViewVisualVariables {
    colour = 'colour',
    size = 'size',
    shape = 'shape',
    texture = 'texture'
}
const randomSvgData: ICalendarSvgData[] = getCalendarSvgTestData()
const defaultSvgConfig = {
    marginLeft: 25,
    marginRight: 5,
    marginTop: 20,
    marginBottom: 5,
    containerWidth: 900,
    containerHeight: 200
}
const defaultMapping: IMapping[] = [{
    visualVariable: ECalendarViewVisualVariables.colour,
    dataVariable: ETransactionVariable.category
}, {
    visualVariable: ECalendarViewVisualVariables.shape,
    dataVariable: ETransactionVariable.creditAmount
}, {
    visualVariable: ECalendarViewVisualVariables.size,
    dataVariable: null
}, {
    visualVariable: ECalendarViewVisualVariables.texture,
    dataVariable: null
}
]

export default function CalendarView({ transactions }: { transactions: CTransaction[] }) {
    const [year, setYear] = useState<string>('2015');
    const [mappings, setMappings] = useState<IMapping[]>(defaultMapping);
    const transactionDescriptions: Map<string, number[]> = getTransactionDescriptionsFromTransactions(transactions)
    const [selectedTransactionDescription, setSelectedTransactionDescription] = useState<string>(transactionDescriptions.keys().next().value)
    const [message, setMessage] = useState<string>('')
    const svgData: ICalendarSvgData[] = useMemo(() => {
        const tempData: number[] | undefined = transactionDescriptions.get(selectedTransactionDescription)
        console.log('tempdata:', tempData)
        if (tempData === undefined) {
            console.log('fkag1')
            setMessage(`transaction:${selectedTransactionDescription} not exist`);
            return []
        } else {
            console.log('fkag2')
            // 2 and 3 can be put together to reduce the number of loops, time complexity is still O(n), n=len()
            // 1. get the indexes of the transactions with the selected description: const transactionIndexes
            const transactionIndexes: number[] = tempData // 1
            // 2. get the data of the transaction: const transactionIndexes:
            const selectedTransactionByDescription: CTransaction[] = transactionIndexes.map(i => { return transactions[i] }) // 2
            // 3. filter the data based on filters // only has year filter now: filteredSelectedTransactionByDescription
            const filteredSelectedTransactionByDescription: CTransaction[] = selectedTransactionByDescription.
                filter((transaction) => transaction.year !== null && String(transaction.year) == year) // only filter the year
            // 4. create a datestring-data map: const dateData:{''Fri Jan 01 2021 00:00:00 GMT+0000 (Greenwich Mean Time)'':CTransaction[]}
            const dateData = new Map<string, CTransaction[]>(); // rolluped data: {'yyyymmdd':CTransaction[]}
            filteredSelectedTransactionByDescription.forEach((transaction) => {
                if (transaction.date !== null) {
                    const dataOfDay: CTransaction[] | undefined = dateData.get(String(transaction.date))
                    if (dataOfDay === undefined) {
                        dateData.set(String(transaction.date), [transaction])
                    } else {
                        dataOfDay.push(transaction)
                    }
                }
            })
            console.log('dateData:', dateData) // looks good
            // 5. rollup use sum base on the colour channel's variable: rollupedData : [{date: date, dataForColour: number}]
            const rollupedData: IRollupedData[] = []
            const dataVariableForColour = mappings.filter(mapping => mapping.visualVariable === ECalendarViewVisualVariables.colour)[0].dataVariable
            if (dataVariableForColour !== ETransactionVariable.creditAmount && dataVariableForColour !== ETransactionVariable.debitAmount) {
                setMessage(`dataVariableForColour:${dataVariableForColour} not supported`);
                return []
            } else {
                setMessage('')
            }
            dateData.forEach((transactions: CTransaction[], dateString: string) => {
                const date: Date = new Date(dateString);
                const dataForColour: number = aggregateArray(transactions, dataVariableForColour, 'sum');
                rollupedData.push({ date: date, dataForColour: dataForColour })
            })
            console.log('rollupedData', rollupedData)
            if (rollupedData.length === 0) {
                setMessage(`transaction: ${selectedTransactionDescription}, dataVariableForColour:${dataVariableForColour} has no data in ${year}`);
                return [];
            }

            // 6. map data to visual channel
            const minValue = d3.min(rollupedData, d => d.dataForColour)
            const maxValue = d3.max(rollupedData, d => d.dataForColour)
            if (minValue === undefined || maxValue === undefined) {
                throw new Error("can't access to min or max value of rollupedData: ${rollupedData}");
            }
            var myColor = d3.scaleLinear().domain([1, 10])
                .range(["white", "blue"])

            const svgDataPoints: ICalendarSvgData[] = rollupedData.map(d => {
                return {
                    ...defaultSvgDataPoint,
                    date: d.date,
                    colour: String(myColor(d.dataForColour)),
                    id: String(d.date)
                }
            })
            console.log('svgdatapoints:',svgDataPoints)
            return svgDataPoints
            return randomSvgData;
        }

    }, [transactions, selectedTransactionDescription, year, mappings])
    // const svgData = randomSvgData; // need to be calculated by filters and mappings
    const svgConfig = defaultSvgConfig;// could add interactivity in future.
    console.log(svgData)
    console.log(transactionDescriptions)
    const transactionVariables: ETransactionVariable[] = transactions[0].attributes; // for callendar controller
    
    return (
        <div className={styles.calendarViewContainer + ' p-1'}>
            <br></br>
            number of transaction record: {transactions.length}
            <h1>{message}</h1>
            <div>
                transactionDescriptions:
                <DescriptionSelector transactionDescriptions={transactionDescriptions}
                    selectedTransactionDescription={selectedTransactionDescription}
                    handleChange={(e) => setSelectedTransactionDescription(e.target.value)} />
            </div>
            <CalendarSvg calendarSvgDataArr={svgData} calendarSvgConfig={svgConfig} ></CalendarSvg>
            <CalendarController year={year} handleSetYear={setYear}
                mappings={mappings} transactionVariables={transactionVariables} handleSetMappings={handleSetMappings}></CalendarController>

        </div>
    )

    function handleSetMappings(newVisualVariable: ECalendarViewVisualVariables, newDataVariable: IMapping['dataVariable']) {
        console.time('handleSetMappings')
        setMappings(mappings.map(mapping => {
            if (mapping.visualVariable == newVisualVariable) {
                return { visualVariable: newVisualVariable, dataVariable: newDataVariable }
            } else {
                return mapping
            }
        }))
        console.timeEnd('handleSetMappings')
    }
}
function getTransactionDescriptionsFromTransactions(transactions: CTransaction[]): Map<string, number[]> {
    /**
     * @param {transactions} CTransaction[] an array of transactions
     * return a map whose keys are transaction descriptions and 
     * value is an array of the index of those entry with the transaction Description in the transactions list.
     */
    const transactionDescriptions = new Map<string, number[]>()// description->[transactionNumber]
    for (let i = 0; i < transactions.length; i++) {
        const currDescription = transactions[i].transactionDescription; // the description
        if (transactionDescriptions.has(currDescription) === false) {
            // check if the transaction has been set, if not: set it and put the index in the arr
            transactionDescriptions.set(currDescription, [i])
        } else {
            // if the transaction has been set: push the current index into it,.
            const transactionDescriptionIndexes: number[] | undefined = transactionDescriptions.get(currDescription)
            if (transactionDescriptionIndexes === undefined) {
                throw new Error(`transaction '${currDescription}' not in the map:${transactionDescriptions}`);
            } else {
                transactionDescriptionIndexes.push(i)
            }
        }
    }
    return transactionDescriptions
}

function DescriptionSelector({ transactionDescriptions, selectedTransactionDescription, handleChange }:
    {
        transactionDescriptions: Map<string, number[]>,
        selectedTransactionDescription: string | null,
        handleChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
    }) {
    const sortedDescriptions = Array.from(transactionDescriptions.keys()).sort()
    const options: React.ReactNode[] = sortedDescriptions.map(description => {
        return <option key={description}>{description}</option>
    })

    return (<select value={selectedTransactionDescription === null ? ' ' : selectedTransactionDescription} onChange={(e) => handleChange(e)}>
        {options}
    </select>)
}

function aggregateArray(transactions: CTransaction[], attr: ETransactionVariable = ETransactionVariable.debitAmount, reducer = 'sum'): number {
    if (attr === ETransactionVariable.debitAmount) {
        return transactions.reduce((a, b) => a + b.debitAmount, 0)
    }
    if (attr === ETransactionVariable.creditAmount) {
        return transactions.reduce((a, b) => a + b.creditAmount, 0)
    } else {
        throw new Error("not support attribute");
    }
}

