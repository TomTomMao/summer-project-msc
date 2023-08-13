'use client'
import { useState, useEffect, useMemo } from "react"
import { TransactionData } from "./utilities/DataObject";
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

import * as dataAgent from './utilities/dataAgent'
import { useTransactionDataArr } from "./hooks/useTransactionData";
import { FrequencyControlPannel } from "./components/ControlPannel/FrequencyControlPannel";
import { TableViewCollection } from "./components/TableView/TableViewCollection";

// used for fixing the plotly scatter plot 'self not found' error
const ClusterView2 = dynamic(
    () => import("./components/ClusterView/ClusterView2"),
    { ssr: false }
)

export default function App() {
    // const [transactionDataArr, setTransactionDataArr] = useState<Array<TransactionData> | null>(null)
    const [brushedTransactionNumberSet, setBrushedTransactionNumberSet] = useState<Set<TransactionData['transactionNumber']>>(new Set()) // cluster view's points in the brusher
    const transactionDataArr = useTransactionDataArr();
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
    const clusterDataArr = useClusterData(transactionDataArr)
    const clusterViewDataPrepared = usePrepareClusterViewData(transactionDataArr, clusterDataArr, colourScale)
    const clusterViewLayoutPrepared = usePrepareClusterViewLayout();
    const detailDay = useAppSelector(calendarViewSlice.selectDetailDay)
    const selectedGlyphTransactionNumberSet = useMemo(() => {
        if (detailDay === null) { return new Set<TransactionData['transactionNumber']>() }
        const setOfTheDay = new Set<TransactionData['transactionNumber']>()
        transactionDataArr.forEach(transactionData => {
            if (transactionData.date.getFullYear() === detailDay.year && transactionData.date.getMonth() + 1 === detailDay.month && transactionData.date.getDate() === detailDay.day) {
                setOfTheDay.add(transactionData.transactionNumber)
            }
        })
        return setOfTheDay
    }, [detailDay, transactionDataArr])
    if (transactionDataArr === null || clusterViewDataPrepared === null) {
        return <>loading...</>
    } else if (colourScale === null) {
        return <>initialising colour scale</>
    }
    else {
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
                {/* <FolderableContainer label="brushed data" initIsFolded={true}>
                    <TableView transactionDataArr={transactionDataArr}
                        handleClearSelect={() => setBrushedTransactionNumberSet(new Set())}
                        transactionNumberSet={brushedTransactionNumberSet} colourScale={colourScale}
                        colourValueGetter={PUBLIC_VALUEGETTER.colour}></TableView>
                </FolderableContainer> */}
                <ClusterView2 data={clusterViewDataPrepared}
                    layout={clusterViewLayoutPrepared}
                    handleSelectIndex={handleSelectIndex}
                ></ClusterView2>
                <ClusterViewControlPannel></ClusterViewControlPannel>
                <FrequencyControlPannel />
                <TableViewCollection transactionDataArr={transactionDataArr}
                    brushedTransactionNumberSet={brushedTransactionNumberSet}
                    handleClearBrush={() => setBrushedTransactionNumberSet(new Set())}
                    selectedGlyphTransactionNumberSet={selectedGlyphTransactionNumberSet}
                    handleClearGlyph={() => dispatch(calendarViewSlice.clearDetailDay())}
                    colourScale={colourScale}
                    colourValueGetter={PUBLIC_VALUEGETTER.colour}
                ></TableViewCollection>
            </div>
        )
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