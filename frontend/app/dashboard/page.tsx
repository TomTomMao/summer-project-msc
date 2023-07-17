'use client'
import { useState, useEffect, useMemo } from "react"
import { timeParse } from 'd3'
import { TransactionData, curryCleanFetchedTransactionData, curryCleanFetchedRFMData, RFMData } from "./DataObject";
import CalendarView3 from "./CalendarView3/CalendarView3";
import TableView, { DescriptionAndIsCredit } from "./TableView/TableView";
import { ValueGetterContext, initValueGetter, temporalValueGetter, temporalValueGetterSwapped } from "./CalendarView3/Contexts/ValueGetterContext";
import { ClusterView, getDomainValueFromDataPerTransactionDescription } from "./ClusterView";
import { DataPerTransactionDescription } from "./CalendarView3/DataPerTransactionDescription";
import { getDataPerTransactionDescription } from "./CalendarView3/getDataPerTransactionDescription";
import { getRFMDataMapFromArr } from "./CalendarView3/getRFMDataMapFromArr";
import assert from "assert";
import ColourLegendList from "./ColourLegend";
import * as d3 from 'd3';
import { ConfigProvider } from "./ConfigProvider";
import ControlPannel from "./ControlPannel/ControlPannel";
import FolderableContainer from "./Components/FolderableContainer";

const parseTime = timeParse('%d/%m/%Y')
const apiUrl = 'http://localhost:3030';
const ClusterViewHeight = 400;
const ClusterViewWidth = 500;
export const CalendarViewCellWidth = 17;
export const CalendarViewCellHeight = 17;
export interface DomainLimits {
    min: number;
    max: number;
}

export type PublicScale = { colourScale: d3.ScaleOrdinal<string, string, never> };
export type PublicValueGetter = { colour: (d: TransactionData) => string; }
const publicValueGetter = { colour: (d: TransactionData) => d.type }

export default function Page() {
    const [transactionDataArr, setTransactionDataArr] = useState<Array<TransactionData> | null>(null)
    const [RFMDataArr, setRFMDataArr] = useState<Array<RFMData> | null>(null)
    const [valueGetter, setValueGetter] = useState(initValueGetter); // used for get the domain, and used for get the data in the charts
    const [selectedDescriptionAndIsCreditArr, setSelectedDescriptionAndIsCreditArr] = useState<DescriptionAndIsCredit[]>([])
    const [clusterViewValueGetter, setClusterViewValueGetter] = useState(temporalValueGetter);
    const [brushedTransactionNumberSet, setBrushedTransactionNumberSet] = useState<Set<TransactionData['transactionNumber']>>(new Set()) // cluster view's points in the brusher

    const [xLim, setXLim] = useState<DomainLimits | null>(null);
    const [yLim, setYLim] = useState<DomainLimits | null>(null);
    const [colourLim, setColourLim] = useState<DomainLimits | null>(null);
    const [sizeLim, setSizeLim] = useState<DomainLimits | null>(null);

    // calendarGlyph axis's scale 
    const [calendarGlyphUseLog, setCalendarGlyphUseLog] = useState(false);
    // cluster view's initial y axis's scale 
    const [clusterUseLog, setClusterUseLog] = useState(false);

    // public colour scale
    const colourScale: null | PublicScale['colourScale'] = useMemo(() => {
        if (transactionDataArr === null) {
            return null
        }
        const colourDomain = Array.from(new Set(transactionDataArr.map(publicValueGetter.colour)))
        const colourRange = d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), colourDomain.length).reverse(); // ref: https://observablehq.com/@d3/pie-chart/2?intent=fork
        const colourScale: PublicScale['colourScale'] = d3.scaleOrdinal(colourDomain, colourRange)
        return colourScale
    }, [transactionDataArr])


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
    if (xDomainMin === null || !limitsInitialised || colourScale === null) {
        return <>initialising</>
    } else {
        return (
            <div>
                <ConfigProvider>

                    <ValueGetterContext.Provider value={valueGetter}>
                        <div className="grid grid-cols-12">
                            <div className="col-span-5 clusterView">
                                <ClusterView transactionDataArr={transactionDataArr}
                                    containerHeight={ClusterViewHeight}
                                    containerWidth={ClusterViewWidth} valueGetter={clusterViewValueGetter}
                                    brushedTransactionNumberSet={brushedTransactionNumberSet}
                                    setBrushedTransactionNumberSet={setBrushedTransactionNumberSet}
                                    useLogScale={clusterUseLog}
                                    colourScale={colourScale}
                                />
                                scatter plots:
                                <label htmlFor="clusterUseLog">log</label>
                                <input type="radio" name="clusterUseLog" id="" checked={clusterUseLog} onChange={() => setClusterUseLog(true)} />
                                <label htmlFor="clusterUseLinear">linear</label>
                                <input type="radio" name="clusterUseLinear" id="" checked={!clusterUseLog} onChange={() => setClusterUseLog(false)} />
                            </div>
                            <div className="col-span-7">
                                <div className="controlPannelFolderableContainer floatDiv">
                                    <FolderableContainer label="ControlPannel" initIsFolded={true}>
                                        <div className="controlPannel"><ControlPannel /></div>
                                    </FolderableContainer>
                                </div>
                                <div className="calendarView">
                                    <CalendarView3 transactionDataArr={transactionDataArr}
                                        initCurrentYear={2016}
                                        highLightedTransactionNumberSet={brushedTransactionNumberSet}
                                        colourScale={colourScale}
                                        colourValueGetter={publicValueGetter.colour}
                                    ></CalendarView3>
                                </div>
                            </div>
                        </div>
                        <FolderableContainer label="detail of brushed points" initIsFolded={true}>
                            <TableView transactionDataArr={transactionDataArr}
                                handleClearSelect={() => setBrushedTransactionNumberSet(new Set())}
                                transactionNumberSet={brushedTransactionNumberSet} colourScale={colourScale}
                                colourValueGetter={publicValueGetter.colour}></TableView></FolderableContainer>
                        <ColourLegendList colourMappings={[]}></ColourLegendList>
                    </ValueGetterContext.Provider>
                </ConfigProvider>
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