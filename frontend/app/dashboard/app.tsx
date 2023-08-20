'use client'
import { useState, useEffect, useMemo } from "react"
import { TransactionData } from "./utilities/DataObject";
import CalendarView3 from "./components/CalendarView3/CalendarView3";

import { temporalValueGetter } from "./utilities/consts/valueGetter";
import { ScatterPlot } from "./components/ScatterPlot/ScatterPlot";

import CalendarViewControlPannel from "./components/ControlPannel/CalendarViewControlPannel";
import FolderableContainer from "./components/Containers/FolderableContainer";
import { PUBLIC_VALUEGETTER } from "./utilities/consts";
import ExpandableContainer from "./components/Containers/ExpandableContainer";
import { useAppDispatch, useAppSelector } from "../hooks";
import * as calendarViewSlice from "./components/CalendarView3/calendarViewSlice"
import * as scatterPlotSlice from "./components/ScatterPlot/scatterPlotSlice";
import * as clusterViewSlice from "./components/ClusterView/clusterViewSlice";

import dynamic from 'next/dynamic'//no ssr 
import ClusterViewControlPannel from "./components/ControlPannel/ClusterViewControlPannel";
import useClusterDataArr from "./hooks/useClusterData";
import { usePrepareClusterViewData } from "./hooks/usePrepareClusterViewData";
import { usePrepareClusterViewLayout } from "./hooks/usePrepareClusterViewLayout";

import useSyncTransactionDataAndClusterData from "./hooks/useSyncTransactionDataAndClusterData";
import { useTransactionDataArr } from "./hooks/useTransactionData";
import { useClusterIdColourScale, useCategoryColourScale, useFrequencyUniqueKeyColourScale } from "./hooks/useColourScales";

import { FrequencyControlPannel } from "./components/ControlPannel/FrequencyControlPannel";
import { TableViewCollection } from "./components/TableView/TableViewCollection";
import { CategoryColourLegend, ClusterIdColourLegend, FrequencyUniqueKeyColourLegend } from "./components/ColourLegend/ColourLegends";
import * as interactivitySlice from "./components/Interactivity/interactivitySlice";

// used for fixing the plotly scatter plot 'self not found' error
const ClusterView2 = dynamic(
    () => import("./components/ClusterView/ClusterView2"),
    { ssr: false }
)

export default function App() {
    const brushedTransactionNumberArr = useAppSelector(interactivitySlice.selectSelectedTransactionNumberArrMemorised)
    const brushedTransactionNumberSet = useMemo(() => new Set(brushedTransactionNumberArr), [brushedTransactionNumberArr])
    // useEffect(() => { console.log('brushedTransactionNumberArr updated', brushedTransactionNumberArr) }, [brushedTransactionNumberArr])

    useSyncTransactionDataAndClusterData(); // app is reponsible for checking the relative states in the redux store and update the transactionDataArr and Clus
    const categoryColourScaleWithTransactionNumber = useCategoryColourScale()
    // useEffect(() => console.log('categoryColourScale:', categoryColourScaleWithTransactionNumber.domain(), categoryColourScaleWithTransactionNumber.range()), [categoryColourScaleWithTransactionNumber])
    const clusterColourScaleWithTransactionNumber = useClusterIdColourScale()
    // useEffect(() => console.log('clusterColourScale:', clusterColourScaleWithTransactionNumber.domain(), clusterColourScaleWithTransactionNumber.range()), [clusterColourScaleWithTransactionNumber])
    const frequencyUniqueKeyColourScaleWithTransactionNumber = useFrequencyUniqueKeyColourScale()
    // useEffect(() => console.log('frequencyUniqueKeyColourScale:', frequencyUniqueKeyColourScaleWithTransactionNumber.domain(), frequencyUniqueKeyColourScaleWithTransactionNumber.range()), [frequencyUniqueKeyColourScaleWithTransactionNumber])
    const transactionDataArr = useTransactionDataArr();
    const clusterDataArr = useClusterDataArr()
    // cluster view's initial y axis's scale
    const [scatterPlotValueGetter, setScatterPlotValueGetter] = useState(temporalValueGetter);

    // set the state store
    const dispatch = useAppDispatch()
    const handleSelectIndex = (indexes: number[]) => {
        if (transactionDataArr === null) {
            throw new Error("transactionDataArr is null");
        }
        dispatch(interactivitySlice.setSelectedTransactionIndexArr(indexes))
    }

    const handleSetSelectTransactionNumberSet = (brushedTransactionNumberSet: Set<TransactionData['transactionNumber']>) => {
        const indexes: number[] = []
        transactionDataArr.forEach(({ transactionNumber }, index) => {
            if (brushedTransactionNumberSet.has(transactionNumber)) {
                indexes.push(index)
            }
        })
        dispatch(interactivitySlice.setSelectedTransactionIndexArr(indexes))
    }

    // expanding handler
    /**
     * tell the components which are wrapped inside the expandablecontainer it is expanded or folded
     * @param chartToExpand chart to expand
     */
    function handleSetExpand(nextIsExpand: boolean, chartToExpand: 'calendar view' | 'cluster view' | 'scatter plot') {
        if (chartToExpand === 'calendar view') {
            if (nextIsExpand) {
                dispatch(calendarViewSlice.expand())
            } else {
                dispatch(calendarViewSlice.fold())
            }
        } else if (chartToExpand === 'scatter plot') {
            if (nextIsExpand) {
                dispatch(scatterPlotSlice.expand())
            } else {
                dispatch(scatterPlotSlice.fold())
            }
        } else if (chartToExpand === 'cluster view') {
            if (nextIsExpand) {
                dispatch(clusterViewSlice.expand())
            } else {
                dispatch(clusterViewSlice.fold())
            }
        }
    }

    const clusterViewDataPrepared = usePrepareClusterViewData(transactionDataArr, clusterDataArr)
    const clusterViewLayoutPrepared = usePrepareClusterViewLayout();
    const detailDay = useAppSelector(calendarViewSlice.selectDetailDay)
    const isSuperPositioned = useAppSelector(calendarViewSlice.selectIsSuperPositioned)
    const selectedGlyphTransactionNumberSet = useMemo(() => {
        if (detailDay === null) { return new Set<TransactionData['transactionNumber']>() }
        const setOfTheDay = new Set<TransactionData['transactionNumber']>()
        transactionDataArr.forEach(transactionData => {
            if ((isSuperPositioned || transactionData.date.getFullYear() === detailDay.year) && transactionData.date.getMonth() + 1 === detailDay.month && transactionData.date.getDate() === detailDay.day) {
                // if superpositioned, don't check year
                setOfTheDay.add(transactionData.transactionNumber)
            }
        })
        return setOfTheDay
    }, [detailDay, transactionDataArr, isSuperPositioned])
    if (transactionDataArr === null || clusterViewDataPrepared === null || clusterViewDataPrepared === undefined) {
        return <>loading...</>
    } else if (categoryColourScaleWithTransactionNumber === null) {
        return <>initialising colour scale</>
    }
    else {
        return (
            <div>
                <div className="floatDiv" style={{ right: '6px', backgroundColor: '#EEEEEE', zIndex: 999 }}>
                    <FolderableContainer label="colour legends" initIsFolded={false}>
                        <CategoryColourLegend></CategoryColourLegend>
                    </FolderableContainer>
                </div>
                <div className="grid grid-cols-12">
                    <div className="col-span-4">
                        <ExpandableContainer onSetExpand={(nextIsExpand) => { handleSetExpand(nextIsExpand, 'scatter plot') }}
                            initStyle={getExpandableContainerStyle('initStyle')}
                            expandedStyle={getExpandableContainerStyle('expandedStyle')}
                        >
                            <ScatterPlot transactionDataArr={transactionDataArr} valueGetter={scatterPlotValueGetter}
                                brushedTransactionNumberSet={brushedTransactionNumberSet}
                                setBrushedTransactionNumberSet={handleSetSelectTransactionNumberSet}
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
                                    <div className="controlPannel"><CalendarViewControlPannel /></div>
                                </FolderableContainer>
                            </div>
                            <CalendarViewYearController></CalendarViewYearController>
                            <div className="calendarView">
                                <CalendarView3 transactionDataArr={transactionDataArr}
                                    initCurrentYear={2016}
                                    highLightedTransactionNumberSetByBrusher={brushedTransactionNumberSet}
                                    colourScale={categoryColourScaleWithTransactionNumber}
                                    colourValueGetter={PUBLIC_VALUEGETTER.colour}
                                ></CalendarView3>
                            </div>
                        </ExpandableContainer>
                    </div>
                </div>

                <div className="grid grid-cols-12">
                    <div className="col-span-4">
                        <ExpandableContainer onSetExpand={(nextIsExpand) => { handleSetExpand(nextIsExpand, 'cluster view') }}
                            initStyle={getExpandableContainerStyle('initStyle')}
                            expandedStyle={getExpandableContainerStyle('expandedStyle')}
                        >
                            <div>
                                <ClusterView2 initData={clusterViewDataPrepared}
                                    initLayout={clusterViewLayoutPrepared}
                                    handleSelectIndex={handleSelectIndex}
                                ></ClusterView2>
                            </div>
                            <div className="floatDiv" style={{ position: 'absolute', left: '40px', top: '3px', height: '21px' }}>
                                <FolderableContainer label="ControlPannel" initIsFolded={true}>
                                    <div style={{ height: '450px', backgroundColor: 'RGB(197,197,197)' }}>
                                        <div style={{ margin: '2px' }}>
                                            <ClusterViewControlPannel></ClusterViewControlPannel>
                                            <FrequencyControlPannel />
                                        </div>
                                    </div>
                                </FolderableContainer>
                            </div>
                        </ExpandableContainer>
                    </div>
                    <div className="col-span-6">
                        <TableViewCollection transactionDataArr={transactionDataArr}
                            brushedTransactionNumberSet={brushedTransactionNumberSet}
                            handleClearBrush={() => handleSetSelectTransactionNumberSet(new Set())}
                            selectedGlyphTransactionNumberSet={selectedGlyphTransactionNumberSet}
                            handleClearGlyph={() => dispatch(calendarViewSlice.clearDetailDay())}
                            colourScale={categoryColourScaleWithTransactionNumber}
                            colourValueGetter={PUBLIC_VALUEGETTER.colour}
                        ></TableViewCollection>
                    </div>
                </div>
                <CategoryColourLegend></CategoryColourLegend>
                <ClusterIdColourLegend></ClusterIdColourLegend>
                <FrequencyUniqueKeyColourLegend></FrequencyUniqueKeyColourLegend>
            </div>
        )
    }

}


function getExpandableContainerStyle(styleType: 'initStyle' | 'expandedStyle'): React.CSSProperties {
    if (styleType === 'initStyle') {
        return {
            position: 'relative',
        }
    } else {
        return {
            position: 'fixed',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 998,
            border: '1px black solid'
        }
    }
}

function CalendarViewYearController() {
    const currentYear = useAppSelector(calendarViewSlice.selectCurrentYear);
    const isSuperPositioned = useAppSelector(calendarViewSlice.selectIsSuperPositioned)
    const dispatch = useAppDispatch()
    const handleChangeCurrentYear = (nextCurrentYear: number) => {
        dispatch(calendarViewSlice.changeCurrentYear(nextCurrentYear))
    }
    const handleChangeIsSuperpositioned = () => {
        if (isSuperPositioned) {
            dispatch(calendarViewSlice.disableSuperPosition())
        } else {
            dispatch(calendarViewSlice.enableSuperPosition())
        }
    }
    return (
        <div style={{
            position: 'absolute',
            zIndex: 2,
            left: '40px',
            top: '5px',
        }}>
            <input type="checkbox" name="" id="" value='isSuperPositioned' checked={isSuperPositioned} onChange={handleChangeIsSuperpositioned} />
            <label htmlFor="isSuperPositioned" style={{ marginRight: '2px' }}>super Positioned</label>
            <input style={{ width: '60px', height: '100%', border: isSuperPositioned ? '1px gray solid' : '1px black solid', color: isSuperPositioned ? 'gray' : 'black' }}
                disabled={isSuperPositioned}
                type="number"
                name=""
                id=""
                value={currentYear}
                onChange={e => handleChangeCurrentYear(parseInt(e.target.value))} />
        </div>
    )
}