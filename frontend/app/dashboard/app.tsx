"use client"
import { useEffect, useMemo } from "react"
import { TransactionData } from "./utilities/DataObject";
import CalendarView3, { CalendarViewYearController } from "./components/CalendarView3/CalendarView3";
import CalendarViewControlPanel from "./components/CalendarView3/CalendarViewControlPanel";
import FolderableContainer from "./components/Containers/FolderableContainer";
import { PUBLIC_VALUEGETTER } from "./utilities/consts";
import ExpandableContainer from "./components/Containers/ExpandableContainer";
import { useAppDispatch, useAppSelector } from "../hooks";
import * as calendarViewSlice from "./components/CalendarView3/calendarViewSlice"
import * as scatterPlotSlice from "./components/TransactionAmountView.tsx/scatterPlotSlice";
import * as clusterViewSlice from "./components/ClusterView/clusterViewSlice";
import ClusterViewControlPanel from "./components/ClusterView/ClusterViewControlPanel/ClusterViewControlPanel";
import useSyncTransactionDataAndClusterData from "./hooks/useSyncTransactionDataAndClusterData";
import { useTransactionDataArr } from "./hooks/useTransactionData";
import { useHierarchicalCategoryColourScale, useClusterIdColourScale, useCategoryColourScale, useFrequencyUniqueKeyColourScale } from "./hooks/useColourScales";
import { TableViewCollection } from "./components/TableView/TableViewCollection";
import * as interactivitySlice from "./components/Interactivity/interactivitySlice";
import { ClusterView } from "./components/ClusterView/ClusterView";
import TransactionAmountView from "./components/TransactionAmountView.tsx/TransactionAmountView";
import * as colourChannelSlice from "./components/ColourChannel/colourChannelSlice";
import Popup from "./components/PopupWindow/Popup";
import Button from "@mui/material/Button" // reference: https://mui.com/material-ui
import { FormControlLabel, Switch } from "@mui/material"; // reference: https://mui.com/material-ui

// Import the new selector to read the current search term.
import { selectTransactionDescriptionSearchTerm } from "./components/Interactivity/interactivitySlice";

export default function App() {
    const brushedTransactionNumberArr = useAppSelector(interactivitySlice.selectSelectedTransactionNumberArrMemorised)
    const brushedTransactionNumberSet = useMemo(() => new Set(brushedTransactionNumberArr), [brushedTransactionNumberArr])

    useSyncTransactionDataAndClusterData(); // app is responsible for checking the relative states in the redux store and update the transactionDataArr and Clus
    // const categoryColourScale = useCategoryColourScale()
    const categoryColourScale = useHierarchicalCategoryColourScale()
    const clusterIdColourScale = useClusterIdColourScale()
    const frequencyUniqueKeyColourScale = useFrequencyUniqueKeyColourScale()
    const transactionDataArr = useTransactionDataArr();

    //**table's colour scale type */
    const colourLabelForTable = useAppSelector(interactivitySlice.selectCurrentSelectorColourScaleType)
    const tableColourScale = colourLabelForTable === 'category' ? categoryColourScale :
        (colourLabelForTable === 'cluster' ? clusterIdColourScale : frequencyUniqueKeyColourScale)
    const tableViewColourDomainDataArr = useAppSelector(colourChannelSlice.selectTableViewColourDomainDataMemorised)

    /**glyph table's colour scale type, sync with glyph's colour */
    const colourLabelForGlyphTable = useAppSelector(interactivitySlice.selectGlyphDataTableColourScaleType)
    const glyphTableColourScale = colourLabelForGlyphTable === 'category' ? categoryColourScale :
        (colourLabelForGlyphTable === 'cluster' ? clusterIdColourScale : frequencyUniqueKeyColourScale)
    const glyphTableViewColourDomainDataArr = useAppSelector(colourChannelSlice.selectGlyphTableViewColourDomainDataMemorised)
    /**type of selector */
    const currentSelector = useAppSelector(interactivitySlice.selectCurrentSelector)

    // Read the transaction description search term from redux.
    const transactionDescriptionSearchTerm = useAppSelector(selectTransactionDescriptionSearchTerm);

    // set the state store
    const dispatch = useAppDispatch()
    const handleClearBrush = () => {
        dispatch(interactivitySlice.clearBrush())
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

    if (transactionDataArr.length === 0) {
        return <>loading...</>
    } else if (categoryColourScale === null) {
        return <>initialising colour scale</>
    }
    else {
        return (
            // /* reference： https://reactgo.com/react-disable-text-selection/ */
            <div className="disableTextSelection">
                <div className="grid grid-cols-12">

                    <div className="col-span-7">
                        <ExpandableContainer onSetExpand={(nextIsExpand) => { handleSetExpand(nextIsExpand, 'calendar view') }}
                            initStyle={getExpandableContainerStyle('initStyle')}
                            expandedStyle={getExpandableContainerStyle('expandedStyle')}
                        >
                            <div className="controlPanelFolderableContainer floatDiv">
                                <FolderableContainer label="ControlPanel" initIsFolded={true}>
                                    <div className="controlPanel"><CalendarViewControlPanel /></div>
                                </FolderableContainer>
                            </div>
                            <CalendarViewYearController></CalendarViewYearController>
                            <div className="calendarView">
                                <CalendarView3 transactionDataArr={transactionDataArr}
                                    initCurrentYear={2016}
                                    highLightedTransactionNumberSetByBrusher={brushedTransactionNumberSet}
                                    colourScales={{ categoryColourScale, clusterIdColourScale, frequencyUniqueKeyColourScale }}
                                    colourValueGetter={PUBLIC_VALUEGETTER.colour}
                                ></CalendarView3>
                            </div>
                        </ExpandableContainer>
                    </div>
                    <div className="col-span-5">
                        <ExpandableContainer onSetExpand={(nextIsExpand) => { handleSetExpand(nextIsExpand, 'scatter plot') }}
                            initStyle={getExpandableContainerStyle('initStyle')}
                            expandedStyle={getExpandableContainerStyle('expandedStyle')}
                        >
                            <div className="floatDiv" style={{ position: 'absolute', left: '40px', top: '3px', height: '21px', zIndex: 4 }}>
                            </div>
                            <div style={{ height: '20px' }}></div>
                            <TransactionAmountView
                                colourScales={{ categoryColourScale, clusterIdColourScale, frequencyUniqueKeyColourScale }}
                            ></TransactionAmountView>
                        </ExpandableContainer>
                    </div>
                </div>

                <div className="grid grid-cols-12">
                    <div className="col-span-7">

                        <TableViewCollection transactionDataArr={transactionDataArr}
                            brushedTransactionNumberSet={brushedTransactionNumberSet}
                            handleClearBrush={handleClearBrush}
                            selectedGlyphTransactionNumberSet={selectedGlyphTransactionNumberSet}
                            handleClearGlyph={() => dispatch(calendarViewSlice.clearDetailDay())}
                            colourScale={tableColourScale} colourDomainData={tableViewColourDomainDataArr}
                            glyphColourScale={glyphTableColourScale} glyphColourDomainData={glyphTableViewColourDomainDataArr}
                        ></TableViewCollection>
                    </div>
                    <div className="col-span-5">
                        <ExpandableContainer onSetExpand={(nextIsExpand) => { handleSetExpand(nextIsExpand, 'cluster view') }}
                            initStyle={getExpandableContainerStyle('initStyle')}
                            expandedStyle={getExpandableContainerStyle('expandedStyle')}
                        >
                            <div className="floatDiv" style={{ position: 'absolute', left: '40px', top: '3px', height: '21px', zIndex: 9 }}>
                                <FolderableContainer label="ControlPanel" initIsFolded={true}>
                                    <div style={{ maxHeight: '380px', backgroundColor: 'white', overflowY: 'auto', width: 'fit-content', overflowX: 'hidden' }}>
                                        <div >
                                            <ClusterViewControlPanel></ClusterViewControlPanel>
                                        </div>
                                    </div>
                                </FolderableContainer>
                            </div>
                            <div style={{ height: '20px' }}></div>
                            <ClusterView
                                colourScales={{ categoryColourScale, clusterIdColourScale, frequencyUniqueKeyColourScale }}
                            ></ClusterView>
                        </ExpandableContainer>
                    </div>
                </div>
                <Popup></Popup>

                <div style={{ position: 'absolute', top: 5, left: 400 }} className="flex flex-row items-center">
                    <FormControlLabel
                        className=""
                        labelPlacement="end"
                        control={<Switch
                            checked={currentSelector === 'oneTimeTransaction'}
                            onChange={() => {
                                dispatch(interactivitySlice.toggleShowOneTimeTransaction());
                                dispatch(interactivitySlice.setCurrentTable('brushedTable'));
                            }} />} label='Focus on One Time Transaction' />
                    {/* ---------------------- Transaction Description Search Bar ---------------------- */}
                    <div>
                        <input
                            type="text"
                            placeholder="Search description"
                            value={transactionDescriptionSearchTerm}
                            onChange={(e) =>
                                dispatch(interactivitySlice.setTransactionDescriptionSearchTerm(e.target.value))
                            }
                            className="border rounded px-1 py-1 w-52 text-sm disabled:cursor-not-allowed disabled:bg-gray-200"
                        />
                    </div>
                </div>

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
            zIndex: 999,
            border: '1px black solid',
            backgroundColor: 'white'
        }
    }
}
// reference the document of redux: https://react-redux.js.org/tutorials/typescript-quick-start
