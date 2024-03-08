import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { ScaleOrdinalWithTransactionNumber } from "../../hooks/useColourScales";
import * as clusterViewSlice from "./clusterViewSlice";
import * as interactivitySlice from "../Interactivity/interactivitySlice";
import InteractiveScatterPlot from "../InteractiveScatterPlot/InteractiveScatterPlot";
import { LogScaleSwitcherGroup } from "../InteractiveScatterPlot/LogScaleSwitcher";
export const BRUSH_MODE = 'end'
export const POINT_SIZE = 2

export interface ClusterViewProps {
    // for better performance
    colourScales: {
        categoryColourScale: ScaleOrdinalWithTransactionNumber,
        clusterIdColourScale: ScaleOrdinalWithTransactionNumber,
        frequencyUniqueKeyColourScale: ScaleOrdinalWithTransactionNumber
    }
}

/**
 * extract the config and data, pass them into a chart
 * @param props 
 * @returns 
 */
export function ClusterView(props: ClusterViewProps) {
    const dispatch = useAppDispatch()
    const handleSelectTransactionNumberArr = (selectedTransactionNumberArr: string[]) => dispatch(interactivitySlice.setClusterViewSelectedTransactionNumberArr(selectedTransactionNumberArr))
    const handleSetThisSelector = () => dispatch(interactivitySlice.setCurrentSelector('clusterView'))
    const handleChangeXDomain = (xMin: number, xMax: number) => {
        dispatch(clusterViewSlice.setXSlider([xMin, xMax]))
    }
    const handleChangeYDomain = (yMin: number, yMax: number) => {
        dispatch(clusterViewSlice.setYSlider([yMin, yMax]))
    }
    const handleSwap = () => {
        dispatch(clusterViewSlice.swap())
    }
    // axis lable
    const xLabel = useAppSelector(clusterViewSlice.selectXAxisLabel)
    const yLabel = useAppSelector(clusterViewSlice.selectYAxisLabel)
    const { categoryColourScale, clusterIdColourScale, frequencyUniqueKeyColourScale } = props.colourScales
    const colourLabel = useAppSelector(clusterViewSlice.selectColourLabel) // for decide wich colour scale to use
    const colourScale = colourLabel === 'category' ? categoryColourScale : colourLabel === 'cluster' ? clusterIdColourScale : frequencyUniqueKeyColourScale // can't be put in the store so use hook

    // layout
    const containerHeight = useAppSelector(clusterViewSlice.selectCurrentContainerHeight)
    const containerWidth = useAppSelector(clusterViewSlice.selectCurrentContainerWidth)
    const marginLeft = useAppSelector(clusterViewSlice.selectMarginLeft)
    const marginRight = useAppSelector(clusterViewSlice.selectMarginRight)
    const marginTop = useAppSelector(clusterViewSlice.selectMarginTop)
    const marginBottom = useAppSelector(clusterViewSlice.selectMarginBottom)
    const isExpand = useAppSelector(clusterViewSlice.selectIsExpand)

    // dataset, they should be the same length, they are filtered
    const xArr = useAppSelector(clusterViewSlice.selectXdataMemorised)
    const yArr = useAppSelector(clusterViewSlice.selectYdataMemorised)
    const colourDomainArr = useAppSelector(clusterViewSlice.selectColourDomainMemorised)
    const idArr = useAppSelector(clusterViewSlice.selectIdArrMemorised)
    const selectedIdArr = useAppSelector(interactivitySlice.selectSelectedTransactionNumberArrMemorised)

    // scales' range, domain, and isLogInfo
    const xLog = useAppSelector(clusterViewSlice.selectXlog)
    const yLog = useAppSelector(clusterViewSlice.selectYlog)
    const { filteredXDomainMin, filteredXDomainMax, filteredYDomainMin, filteredYDomainMax } = useAppSelector(clusterViewSlice.selectFilteredDomainMemorised)

    const dataset = useAppSelector(state => state.interactivity.transactionDataArr)
    const shouldShowBrusher = useAppSelector(clusterViewSlice.selectShouldShowClusterViewBrusher)

    // scale switcher data and handler: XLog, yLog, handleTurnOnXLog, handleTurnOffXLog, handleTurnOnYLog, handleTurnOffYLog
    const handleTurnOnXLog = () => dispatch(clusterViewSlice.setXLog(true))
    const handleTurnOffXLog = () => dispatch(clusterViewSlice.setXLog(false))
    const handleTurnOnYLog = () => dispatch(clusterViewSlice.setYLog(true))
    const handleTurnOffYLog = () => dispatch(clusterViewSlice.setYLog(false))
    return (
        <>
            {/* https://www.educative.io/answers/how-to-center-an-absolutely-positioned-element-inside-its-parent */}
            <div style={{
                width: 170,
                height: 12,
                position: 'absolute',
                fontSize: '14px',
                top: 5,
                zIndex: 8,
                left: marginLeft + (containerWidth - marginLeft - marginRight) / 2,
                transform: 'translate(-50%,0)',
                textAlign: 'center'
            }}>Cluster View</div>
            <div style={{ position: 'absolute', top: -7, right: -10, transform: 'scale(0.8)',zIndex:7 }}>
                <LogScaleSwitcherGroup isXLog={xLog} isYLog={yLog}
                    onTurnOnXLog={handleTurnOnXLog}
                    onTurnOnYLog={handleTurnOnYLog}
                    onTurnOffXLog={handleTurnOffXLog}
                    onTurnOffYLog={handleTurnOffYLog} />
            </div>
            <InteractiveScatterPlot
                onSelectTransactionNumberArr={handleSelectTransactionNumberArr}
                onSetThisSelector={handleSetThisSelector}
                onChangeXDomain={handleChangeXDomain}
                onChangeYDomain={handleChangeYDomain}
                onSwap={handleSwap}
                xLabel={xLabel}
                yLabel={yLabel}
                colourLabel={colourLabel}
                colourScale={colourScale}
                containerHeight={containerHeight}
                containerWidth={containerWidth}
                marginLeft={marginLeft}
                marginRight={marginRight}
                marginTop={marginTop}
                marginBottom={marginBottom}
                isExpand={isExpand}
                xArr={xArr}
                yArr={yArr}
                colourDomainArr={colourDomainArr}
                idArr={idArr}
                selectedIdArr={selectedIdArr}
                xLog={xLog}
                yLog={yLog}
                filteredXDomainMin={filteredXDomainMin}
                filteredXDomainMax={filteredXDomainMax}
                filteredYDomainMin={filteredYDomainMin}
                filteredYDomainMax={filteredYDomainMax}
                dataset={dataset}
                shouldShowBrusher={shouldShowBrusher}
                className={'clusterView'}
            ></InteractiveScatterPlot>
        </>
    )
}
