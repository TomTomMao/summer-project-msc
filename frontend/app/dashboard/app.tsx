'use client'
import { useState, useEffect, useMemo } from "react"
import { TransactionData, curryCleanFetchedTransactionData, curryCleanFetchedRFMData, RFMData, cleanFetchedITransactionDataFromPythonAPI } from "./utilities/DataObject";
import CalendarView3 from "./components/CalendarView3/CalendarView3";
import TableView from "./components/TableView/TableView";
import { temporalValueGetter } from "./utilities/consts/valueGetter";
import { ClusterView } from "./components/ClusterView/ClusterView";

import ColourLegendList from "./components/ColourLegend/ColourLegend";
import * as d3 from 'd3';
import ControlPannel from "./components/ControlPannel/ControlPannel";
import FolderableContainer from "./components/Containers/FolderableContainer";
import { PublicScale } from "./utilities/types";
import { parseTime, apiUrl, PUBLIC_VALUEGETTER } from "./utilities/consts";
import ExpandableContainer from "./components/Containers/ExpandableContainer";
import { useAppDispatch, useAppSelector } from "../hooks";
import * as calendarViewSlice from "./components/CalendarView3/calendarViewSlice"
import * as clusterViewSlice from "./components/ClusterView/clusterViewSlice"
import * as colourLegendSlice from "./components/ColourLegend/colourLegendSlice"
// import ClusterView2 from "./components/ClusterView/ClusterView2";
import dynamic from 'next/dynamic'//no ssr 
import ClusterViewControlPannel from "./components/ControlPannel/ClusterViewControlPannel";
import useClusterData from "./hooks/useClusterData";
import { usePrepareClusterViewData } from "./hooks/userPrepareClusterViewData";
import { usePrepareClusterViewLayout } from "./hooks/usePrepareClusterViewLayout";

// used for fixing the plotly scatter plot 'self not found' error
const ClusterView2 = dynamic(
    () => import("./components/ClusterView/ClusterView2"),
    { ssr: false }
)


export default function App() {
    const [transactionDataArr, setTransactionDataArr] = useState<Array<TransactionData> | null>(null)
    const [brushedTransactionNumberSet, setBrushedTransactionNumberSet] = useState<Set<TransactionData['transactionNumber']>>(new Set()) // cluster view's points in the brusher

    // cluster view's initial y axis's scale
    const [clusterViewValueGetter, setClusterViewValueGetter] = useState(temporalValueGetter);

    // set the state store
    const dispatch = useAppDispatch()
    const handleSelectIndex = (indexes: number[]) => {
        if (transactionDataArr === null) {
            throw new Error("transactionDataArr is null");

        }
        const nextBrushedTransactionNumberSet = new Set<TransactionData['transactionNumber']>;
        indexes.forEach(
            index => nextBrushedTransactionNumberSet.add(transactionDataArr[index].transactionNumber)
        )
        setBrushedTransactionNumberSet(nextBrushedTransactionNumberSet)
    }
    // highlighted colour channel
    const highLightedColourSet = useAppSelector(colourLegendSlice.selectHighLightedColourDomainValueSet)

    // initialise the colour domain
    useEffect(() => {
        if (transactionDataArr !== null) {
            const colourDomain: string[] = Array.from(new Set(transactionDataArr.map(PUBLIC_VALUEGETTER.colour)))
            dispatch(colourLegendSlice.initColourDomainInfo(colourDomain))
        }
    }, [transactionDataArr])
    const colourDomain = useAppSelector(colourLegendSlice.selectDomain)
    useEffect(() => { console.log('colourDomain at app.tsx changed', colourDomain) }, [colourDomain])
    // calculate and cache the public colour scale
    /**
     * colourScale: based on the domain from the colourLegendSlice store
    */
    const colourScale: null | PublicScale['colourScale'] = useMemo(() => {
        if (colourDomain.length === 0) {
            return null;
        }
        const colourRange = d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), colourDomain.length).reverse(); // ref: https://observablehq.com/@d3/pie-chart/2?intent=fork
        const colourScale: PublicScale['colourScale'] = d3.scaleOrdinal(colourDomain, colourRange)
        return colourScale
    }, [colourDomain])
    useEffect(() => { console.log('colourScale at app.tsx changed') }, [colourScale])

    useEffect(() => {
        // fetch the data and update the data state
        fetchData(parseTime).then(
            (data) => {
                const { transactionDataArr } = data;
                setTransactionDataArr(transactionDataArr);
            }
        );
    }, []);

    // set data for cluster

    // expanding handler
    /**
     * tell the components which are wrapped inside the expandablecontainer it is expanded or folded
     * @param chartToExpand chart to expand
     */
    function handleSetExpand(nextIsExpand: boolean, chartToExpand: 'calendar view' | 'cluster view') {
        if (chartToExpand === 'calendar view') {
            if (nextIsExpand) {
                dispatch(calendarViewSlice.expand())
            } else {
                dispatch(calendarViewSlice.fold())
            }
        } else {
            if (nextIsExpand) {
                dispatch(clusterViewSlice.expand())
            } else {
                dispatch(clusterViewSlice.fold())
            }
        }
    }
    const clusterDataArr = useClusterData()
    const clusterViewDataPrepared = usePrepareClusterViewData(transactionDataArr, clusterDataArr, colourScale)
    const clusterViewLayoutPrepared = usePrepareClusterViewLayout();
    if (transactionDataArr === null || clusterViewDataPrepared === null) {
        return <>loading...</>
    } else if (colourScale === null) {
        return <>initialising colour scale</>
    }
    else {
        const clusterView2Data = [
            {
                type: 'scattergl' as const,
                mode: 'markers' as const,
                x: clusterViewDataPrepared.xData,
                y: clusterViewDataPrepared.yData,
                marker: {
                    size: 5,
                    color: clusterViewDataPrepared.colourData
                }
            },
        ]
        console.log('clusterView2Data', clusterView2Data);
        const clusterView2Layout = {
            width: clusterViewLayoutPrepared.width,
            height: clusterViewLayoutPrepared.height,
            title: clusterViewLayoutPrepared.title,
            xaxis: { type: clusterViewLayoutPrepared.xType, autorange: true },
            yaxis: { type: clusterViewLayoutPrepared.yType, autorange: true }
        }
        return (
            <div>
                <div className="floatDiv" style={{ right: '6px', backgroundColor: '#EEEEEE', zIndex: 999 }}>
                    <FolderableContainer label="colour legends" initIsFolded={false}>
                        <ColourLegendList colourScale={colourScale}></ColourLegendList>
                    </FolderableContainer>
                </div>
                <div className="grid grid-cols-12">
                    <div className="col-span-4">
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
                    <div className="col-span-6">
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
                                    highLightedTransactionNumberSetByBrusher={brushedTransactionNumberSet}
                                    highLightedColourDomainValueSetByLegend={highLightedColourSet}
                                    colourScale={colourScale}
                                    colourValueGetter={PUBLIC_VALUEGETTER.colour}
                                ></CalendarView3>
                            </div>
                        </ExpandableContainer>
                    </div>
                </div>
                <FolderableContainer label="brushed data" initIsFolded={true}>
                    <TableView transactionDataArr={transactionDataArr}
                        handleClearSelect={() => setBrushedTransactionNumberSet(new Set())}
                        transactionNumberSet={brushedTransactionNumberSet} colourScale={colourScale}
                        colourValueGetter={PUBLIC_VALUEGETTER.colour}></TableView>
                </FolderableContainer>
                <ClusterView2 data={clusterView2Data}
                    layout={clusterView2Layout}
                    handleSelectIndex={handleSelectIndex}
                ></ClusterView2>
                <ClusterViewControlPannel></ClusterViewControlPannel>
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
        console.log(fetchedTransactionData)
        // const transactionDataArr: TransactionData[] = fetchedTransactionData.map(curryCleanFetchedTransactionData('TransactionData', parseTime));
        const transactionDataArr = fetchedTransactionData.map(cleanFetchedITransactionDataFromPythonAPI)

        return { transactionDataArr }
    } catch (error) {
        console.log(error);
        console.log(apiUrl)
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
            zIndex: 998,
            border: '1px black solid'
        }
    }
}