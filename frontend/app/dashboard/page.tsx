'use client'
import { useState, useEffect, useMemo } from "react"
import { timeParse } from 'd3'
import { TransactionData, curryCleanFetchedTransactionData, curryCleanFetchedRFMData, RFMData } from "./DataObject";
import CalendarView3 from "./CalendarView3/CalendarView3";
import TableView, { DescriptionAndIsCredit } from "./TableView/TableView";
import { ValueGetterContext, initValueGetter } from "./CalendarView3/Contexts/ValueGetterContext";
import { ClusterView, getDomainValueFromDataPerTransactionDescription } from "./ClusterView";
import { DataPerTransactionDescription } from "./CalendarView3/DataPerTransactionDescription";
import { getDataPerTransactionDescription } from "./CalendarView3/getDataPerTransactionDescription";
import { getRFMDataMapFromArr } from "./CalendarView3/getRFMDataMapFromArr";
import assert from "assert";

const parseTime = timeParse('%d/%m/%Y')
const apiUrl = 'http://localhost:3030';
const ClusterViewHeight = 300;
const ClusterViewWidth = 300;

export interface DomainLimits {
    min: number;
    max: number;
}
export default function Page() {
    const [transactionDataArr, setTransactionDataArr] = useState<Array<TransactionData> | null>(null)
    const [RFMDataArr, setRFMDataArr] = useState<Array<RFMData> | null>(null)
    const [valueGetter, setValueGetter] = useState(initValueGetter); // used for get the domain, and used for get the data in the charts
    const [selectedDescriptionAndIsCreditArr, setSelectedDescriptionAndIsCreditArr] = useState<DescriptionAndIsCredit[]>([])

    const [xLim, setXLim] = useState<DomainLimits | null>(null);
    const [yLim, setYLim] = useState<DomainLimits | null>(null);
    const [colourLim, setColourLim] = useState<DomainLimits | null>(null);
    const [sizeLim, setSizeLim] = useState<DomainLimits | null>(null);

    const limitsInitialised = xLim !== null && yLim !== null && colourLim !== null && sizeLim !== null;

    // get the data domain of the aggregated data when the data is loaded or the data is updated
    const { xDomainMin, xDomainMax, yDomainMin, yDomainMax, colourDomainMin, colourDomainMax, sizeDomainMin, sizeDomainMax }:
        { xDomainMin: number, xDomainMax: number, yDomainMin: number, yDomainMax: number, colourDomainMin: number, colourDomainMax: number, sizeDomainMin: number, sizeDomainMax: number } |
        { xDomainMin: null, xDomainMax: null, yDomainMin: null, yDomainMax: null, colourDomainMin: null, colourDomainMax: null, sizeDomainMin: null, sizeDomainMax: null } = useMemo(() => {
            // rollup by year, month, day, reduce to transactionDescription.
            if (transactionDataArr !== null && RFMDataArr !== null) {
                const RFMDataMap: Map<string, number> = getRFMDataMapFromArr(RFMDataArr);
                const dataPerTransactionDescriptionArr = getDataPerTransactionDescription(transactionDataArr, RFMDataArr, RFMDataMap);
                const domains = getDomainValueFromDataPerTransactionDescription(dataPerTransactionDescriptionArr, valueGetter);
                return {
                    ...domains
                };
            } else { return { xDomainMin: null, xDomainMax: null, yDomainMin: null, yDomainMax: null, colourDomainMin: null, colourDomainMax: null, sizeDomainMin: null, sizeDomainMax: null } }
        }, [transactionDataArr, RFMDataArr, valueGetter]);
    // then set the limit of each domains based on the domain
    useEffect(() => {
        if (xDomainMin !== null && xDomainMax !== null && yDomainMin !== null && yDomainMax !== null && colourDomainMin !== null && colourDomainMax !== null && sizeDomainMin !== null && sizeDomainMax !== null) {
            setXLim({ min: xDomainMin, max: xDomainMax });
            setYLim({ min: yDomainMin, max: yDomainMax });
            setColourLim({ min: colourDomainMin, max: colourDomainMax });
            setSizeLim({ min: sizeDomainMin, max: sizeDomainMax });
        }
    }, [xDomainMin, xDomainMax, yDomainMin, yDomainMax, colourDomainMin, colourDomainMax, sizeDomainMin, sizeDomainMax])

    function handleSelect(transactionDescription: TransactionData['transactionDescription'], isCredit: boolean) {
        if (selectedDescriptionAndIsCreditArr.filter(d => d.transactionDescription === transactionDescription && d.isCredit === isCredit).length >= 1) {
            // transaction already exist, deep copy the list without the clicked transaction
            const nextSelectedDescriptionAndIsCreditArr: DescriptionAndIsCredit[] = []
            selectedDescriptionAndIsCreditArr.forEach(d => {
                if (d.transactionDescription !== transactionDescription || d.isCredit !== isCredit) {
                    // not the clicked one
                    nextSelectedDescriptionAndIsCreditArr.push({ ...d })
                }
            })
            setSelectedDescriptionAndIsCreditArr(nextSelectedDescriptionAndIsCreditArr)
        } else {
            // transaction not exist, deep copy the list and push the new transaction
            const nextSelectedDescriptionAndIsCreditArr = selectedDescriptionAndIsCreditArr.map(d => { return { ...d } });
            setSelectedDescriptionAndIsCreditArr([...nextSelectedDescriptionAndIsCreditArr, { transactionDescription: transactionDescription, isCredit: isCredit }])
        }
    }
    function handleChangeDomain(newDomains: { xDomain: [number, number], yDomain: [number, number] }): void {
        setXLim({ min: newDomains.xDomain[0], max: newDomains.xDomain[1] });
        setYLim({ min: newDomains.yDomain[0], max: newDomains.yDomain[1] });
    }
    // transactionDataArr && console.log('transactionDataArr fetched and cleaned:', transactionDataArr);
    // RFMDataArr && console.log('RFMData fetched and cleaned:', RFMDataArr);
    useEffect(() => {
        // fetch the data and update the data state
        fetchData(parseTime).then(
            (data) => {
                const { transactionDataArr, RFMDataArr } = data;
                setTransactionDataArr(transactionDataArr);
                setRFMDataArr(RFMDataArr)
            }
        );
        setTransactionDataArr(transactionDataArr);
        setRFMDataArr(RFMDataArr)
    }, []);

    if (transactionDataArr === null || RFMDataArr === null) {
        return <>loading...</>
    }
    if (xDomainMin === null || !limitsInitialised) {
        return <>initialising</>
    } else {
        return (
            <div>
                {/* <CalendarView transactions={data}></CalendarView> */}
                {/* <CalendarView2 rawData={data} startDate={new Date()}></CalendarView2> */}
                <ValueGetterContext.Provider value={valueGetter}>
                    <div className="grid grid-cols-8">
                        <div className="col-span-3"><ClusterView transactionDataArr={transactionDataArr}
                            RFMDataArr={RFMDataArr}
                            height={ClusterViewHeight}
                            width={ClusterViewWidth}
                            onSelect={handleSelect}
                            selectedDescriptionAndIsCreditArr={selectedDescriptionAndIsCreditArr}
                            domainLimitsObj={{ xLim, yLim, colourLim, sizeLim }}
                            handleChangeXYDomain={handleChangeDomain}></ClusterView>
                        </div>
                        <div className="col-span-5"><CalendarView3 transactionDataArr={transactionDataArr}
                            initCurrentYear={2016}
                            RFMDataArr={RFMDataArr}
                            selectedDescriptionAndIsCreditArr={selectedDescriptionAndIsCreditArr}
                            domainLimitsObj={{ xLim, yLim, colourLim, sizeLim }}></CalendarView3>
                        </div>
                    </div>
                </ValueGetterContext.Provider>
                <div className="m-auto">
                    {/* infoTable from global.css */}
                    <table className="infoTable">
                        <tbody>
                            <tr>
                                <td>x</td>
                                <td>monetaryAvgDay</td>
                                <td>min: <input type="number" value={xLim.min} onChange={e => parseFloat(e.target.value) < xLim.max && setXLim({ ...xLim, min: parseFloat(e.target.value) })} /></td>
                                <td>max: <input type="number" value={xLim.max} onChange={e => parseFloat(e.target.value) > xLim.min && setXLim({ ...xLim, max: parseFloat(e.target.value) })} /></td>
                                <td><button onClick={() => setXLim({ min: xDomainMin, max: xDomainMax })}>reset</button></td>
                            </tr>
                            <tr>
                                <td>y</td>
                                <td>frequencyAvgDay</td>
                                <td>min: <input type="number" value={yLim.min} onChange={e => parseFloat(e.target.value) < yLim.max && setYLim({ ...yLim, min: parseFloat(e.target.value) })} /></td>
                                <td>max: <input type="number" value={yLim.max} onChange={e => parseFloat(e.target.value) > yLim.min && setYLim({ ...yLim, max: parseFloat(e.target.value) })} /></td>
                                <td><button onClick={() => setYLim({ min: yDomainMin, max: yDomainMax })}>reset</button></td>
                            </tr>
                            <tr>
                                <td>colour</td>
                                <td>amount of the day or total amount</td>
                                <td>min: <input type="number" value={colourLim.min} onChange={e => setColourLim({ ...colourLim, min: parseFloat(e.target.value) })} /></td>
                                <td>max: <input type="number" value={colourLim.max} onChange={e => setColourLim({ ...colourLim, max: parseFloat(e.target.value) })} /></td>
                                <td><button onClick={() => setColourLim({ min: colourDomainMin, max: colourDomainMax })}>reset</button></td>
                            </tr>
                            <tr>
                                <td>size</td>
                                <td>times of transaction of the day or the total times of transaction</td>
                                <td>min: <input type="number" value={sizeLim.min} onChange={e => setSizeLim({ ...sizeLim, min: parseFloat(e.target.value) })} /></td>
                                <td>max: <input type="number" value={sizeLim.max} onChange={e => setSizeLim({ ...sizeLim, max: parseFloat(e.target.value) })} /></td>
                                <td><button onClick={() => setSizeLim({ min: sizeDomainMin, max: sizeDomainMax })}>reset</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <TableView transactionDataArr={transactionDataArr} RFMDataArr={RFMDataArr} filteredDescriptionAndIsCreditArr={selectedDescriptionAndIsCreditArr}></TableView>

            </div>
        )
    }

}


/**
 * fetch transactiondata and rfm data from backend, transfer them into TransactionData[] and RFMData[] 
 * @param setTransactionDataArr used for update the transac
 * @param setRFMDataArr 
 * @param parseTime 
 */
async function fetchData(parseTime: (dateString: string) => Date | null) {
    // fetch the transaction data

    try {
        const fetchedTransactionDataResponse = await fetch(`${apiUrl}/transactionData`);
        const fetchedTransactionData = await fetchedTransactionDataResponse.json();
        if (Array.isArray(fetchedTransactionData) === false) {
            console.log(fetchedTransactionData)
            throw new Error("wrong data type, fetched data should be an array");
        }
        const transactionDataArr: TransactionData[] = fetchedTransactionData.map(curryCleanFetchedTransactionData('TransactionData', parseTime));

        // fetch the rfm data
        const fetchedRFMDataResponse = await fetch(`${apiUrl}/transactionData/rfm`);
        const fetchedRFMData = await fetchedRFMDataResponse.json();
        if (Array.isArray(fetchedTransactionData) === false) {
            console.log(fetchedTransactionData)
            throw new Error("wrong data type, fetched data should be an array");
        }
        const RFMDataArr: RFMData[] = fetchedRFMData.map(curryCleanFetchedRFMData('RFMData'));

        return { transactionDataArr, RFMDataArr }
    } catch (error) {
        console.log(error);
        throw error;

    }
}

export function isTransactionDescriptionSelected(dataPerTransactionDescription: DataPerTransactionDescription, selectedDescriptionAndIsCreditArr: DescriptionAndIsCredit[]): boolean {
    const found = false;
    for (let selectedDescriptionAndIsCredit of selectedDescriptionAndIsCreditArr) {
        if (dataPerTransactionDescription.isCredit === selectedDescriptionAndIsCredit.isCredit && dataPerTransactionDescription.transactionDescription === selectedDescriptionAndIsCredit.transactionDescription) {
            return true
        }
    }
    return found
}