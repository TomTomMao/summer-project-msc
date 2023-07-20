'use client'
import { useState, useEffect, useMemo, useContext } from "react"
import { TransactionData, curryCleanFetchedTransactionData, curryCleanFetchedRFMData, RFMData } from "./utilities/DataObject";
import CalendarView3 from "./components/CalendarView3/CalendarView3";
import TableView from "./components/TableView/TableView";
import { temporalValueGetter } from "./utilities/consts/valueGetter";
import { ClusterView } from "./components/ClusterView/ClusterView";

import ColourLegendList from "./components/ColourLegend/ColourLegend";
import * as d3 from 'd3';
import { ConfigContext, ConfigDispatchContext, ConfigProvider, DashBoardAction } from "./components/ConfigProvider";
import ControlPannel from "./components/ControlPannel/ControlPannel";
import FolderableContainer from "./components/Containers/FolderableContainer";
import { PublicScale } from "./utilities/types";
import { parseTime, apiUrl, PUBLIC_VALUEGETTER } from "./utilities/consts";
import ExpandableContainer from "./components/Containers/ExpandableContainer";
import { assert } from "console";



export default function App() {
    const [transactionDataArr, setTransactionDataArr] = useState<Array<TransactionData> | null>(null)
    const [brushedTransactionNumberSet, setBrushedTransactionNumberSet] = useState<Set<TransactionData['transactionNumber']>>(new Set()) // cluster view's points in the brusher

    // cluster view's initial y axis's scale
    const [clusterViewValueGetter, setClusterViewValueGetter] = useState(temporalValueGetter);

    // config
    const config = useContext(ConfigContext)
    const dispatch = useContext(ConfigDispatchContext)

    // calculate and cache the public colour scale
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

    // expanding handler
    /**
     * 
     * @param chartToExpand chart to expand
     */
    function handleSetExpand(nextIsExpand: boolean, chartToExpand: DashBoardAction['chartToExpand']) {
        const action: DashBoardAction = { targetChart: 'dashboard', type: nextIsExpand ? 'expand' : 'fold', chartToExpand: chartToExpand }
        if (dispatch !== null) {
            console.log('dispachting')
            dispatch(action);
        } else {
            throw new Error("dispatch is null, which is unexpected");

        }
    }
    if (transactionDataArr === null) {
        return <>loading...</>
    } else if (colourScale === null) {
        return <>initialising colour scale</>
    }
    else {
        return (
            <div>
                <div className="grid grid-cols-12">
                    <div className="col-span-5">
                        <ExpandableContainer onSetExpand={(nextIsExpand) => { handleSetExpand(nextIsExpand, 'cluster view') }}
                            initStyle={getExpandableContainerStyle('initStyle')}
                            expandedStyle={getExpandableContainerStyle('expandedStyle')}
                        >
                            <ClusterView transactionDataArr={transactionDataArr} valueGetter={clusterViewValueGetter}
                                brushedTransactionNumberSet={brushedTransactionNumberSet}
                                setBrushedTransactionNumberSet={setBrushedTransactionNumberSet}
                                colourScale={colourScale}
                            />
                        </ExpandableContainer>
                    </div>
                    <div className="col-span-7">
                        <ExpandableContainer onSetExpand={(nextIsExpand) => { handleSetExpand(nextIsExpand, 'calendar view') }}
                            initStyle={getExpandableContainerStyle('initStyle')}
                            expandedStyle={getExpandableContainerStyle('expandedStyle')}
                        >
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
                        </ExpandableContainer>
                    </div>
                </div>
                <FolderableContainer label="detail of brushed points" initIsFolded={true}>
                    <TableView transactionDataArr={transactionDataArr}
                        handleClearSelect={() => setBrushedTransactionNumberSet(new Set())}
                        transactionNumberSet={brushedTransactionNumberSet} colourScale={colourScale}
                        colourValueGetter={PUBLIC_VALUEGETTER.colour}></TableView></FolderableContainer>
                <ColourLegendList colourMappings={[]}></ColourLegendList>
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

function getExpandableContainerStyle(styleType: 'initStyle' | 'expandedStyle'): React.CSSProperties {
    if (styleType === 'initStyle') {
        return {
            position: 'relative',
            backgroundColor: 'gray'
        }
    } else {
        return {
            position: 'fixed',
            backgroundColor: 'gray',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 999,
        }
    }
}