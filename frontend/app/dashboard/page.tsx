'use client'
import { useState, useEffect, useMemo } from "react"
import { TransactionData, curryCleanFetchedTransactionData, curryCleanFetchedRFMData, RFMData } from "./utilities/DataObject";
import CalendarView3 from "./components/CalendarView3/CalendarView3";
import TableView from "./components/TableView/TableView";
import { temporalValueGetter } from "./utilities/consts/valueGetter";
import { ClusterView } from "./components/ClusterView/ClusterView";

import ColourLegendList from "./components/ColourLegend/ColourLegend";
import * as d3 from 'd3';
import { ConfigProvider } from "./components/ConfigProvider";
import ControlPannel from "./components/ControlPannel/ControlPannel";
import FolderableContainer from "./components/Containers/FolderableContainer";
import { PublicScale } from "./utilities/types";
import { parseTime, ClusterViewHeight, ClusterViewWidth, apiUrl, PUBLIC_VALUEGETTER } from "./utilities/consts";



export default function Page() {
    const [transactionDataArr, setTransactionDataArr] = useState<Array<TransactionData> | null>(null)
    const [brushedTransactionNumberSet, setBrushedTransactionNumberSet] = useState<Set<TransactionData['transactionNumber']>>(new Set()) // cluster view's points in the brusher

    // cluster view's initial y axis's scale
    const [clusterUseLog, setClusterUseLog] = useState(false);
    const [clusterViewValueGetter, setClusterViewValueGetter] = useState(temporalValueGetter);

    // public colour scale
    const colourScale: null | PublicScale['colourScale'] = useMemo(() => {
        if (transactionDataArr === null) {
            return null
        }
        const colourDomain = Array.from(new Set(transactionDataArr.map(PUBLIC_VALUEGETTER.colour)))
        const colourRange = d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), colourDomain.length).reverse(); // ref: https://observablehq.com/@d3/pie-chart/2?intent=fork
        const colourScale: PublicScale['colourScale'] = d3.scaleOrdinal(colourDomain, colourRange)
        return colourScale
    }, [transactionDataArr])

    useEffect(() => {
        // fetch the data and update the data state
        fetchData(parseTime).then(
            (data) => {
                const { transactionDataArr } = data;
                setTransactionDataArr(transactionDataArr);
            }
        );
    }, []);

    if (transactionDataArr === null) {
        return <>loading...</>
    } else if (colourScale === null) {
        return <>initialising colour scale</>
    }
    else {
        return (
            <div>
                {/* config provider for the config of different views, and provide a reducer */}
                <ConfigProvider>
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
                                    colourValueGetter={PUBLIC_VALUEGETTER.colour}
                                ></CalendarView3>
                            </div>
                        </div>
                    </div>
                    <FolderableContainer label="detail of brushed points" initIsFolded={true}>
                        <TableView transactionDataArr={transactionDataArr}
                            handleClearSelect={() => setBrushedTransactionNumberSet(new Set())}
                            transactionNumberSet={brushedTransactionNumberSet} colourScale={colourScale}
                            colourValueGetter={PUBLIC_VALUEGETTER.colour}></TableView></FolderableContainer>
                    <ColourLegendList colourMappings={[]}></ColourLegendList>
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