import { useAppDispatch, useAppSelector } from "@/app/hooks";
import * as scatterPlotSlice from "./scatterPlotSlice";
import * as interactivitySlice from "../Interactivity/interactivitySlice";
import { ScaleOrdinalWithTransactionNumber } from "../../hooks/useColourScales";
import InteractiveScatterPlot from "../InteractiveScatterPlot/InteractiveScatterPlot";
import LogScaleSwitcher, { LogScaleSwitcherGroup } from "../InteractiveScatterPlot/LogScaleSwitcher";

export interface TransactionAmountViewProps {
    // for better performance
    colourScales: {
        categoryColourScale: ScaleOrdinalWithTransactionNumber,
        clusterIdColourScale: ScaleOrdinalWithTransactionNumber,
        frequencyUniqueKeyColourScale: ScaleOrdinalWithTransactionNumber
    }
}

export default function TransactionAmountView(props: TransactionAmountViewProps) {
    const dispatch = useAppDispatch()
    const handleSelectTransactionNumberArr = (selectedTransactionNumberArr: string[]) => dispatch(interactivitySlice.setScatterPlotSelectedTransactionNumberArr(selectedTransactionNumberArr))
    const handleSetThisSelector = () => dispatch(interactivitySlice.setCurrentSelector('scatterPlot'))
    const handleChangeXDomain = (xMin: number, xMax: number) => {
        dispatch(scatterPlotSlice.setXSlider([xMin, xMax]))
    }
    const handleChangeYDomain = (yMin: number, yMax: number) => {
        dispatch(scatterPlotSlice.setYSlider([yMin, yMax]))
    }
    const handleSwap = () => {
        dispatch(scatterPlotSlice.swap())
    }
    // axis lable
    const xLabel = useAppSelector(scatterPlotSlice.selectXAxisLabel)
    const yLabel = useAppSelector(scatterPlotSlice.selectYAxisLabel)
    const { categoryColourScale, clusterIdColourScale, frequencyUniqueKeyColourScale } = props.colourScales
    const colourLabel = useAppSelector(scatterPlotSlice.selectColourLabel)
    const colourScale = categoryColourScale

    // layout
    const containerHeight = useAppSelector(scatterPlotSlice.selectCurrentContainerHeight)
    const containerWidth = useAppSelector(scatterPlotSlice.selectCurrentContainerWidth)
    const marginLeft = useAppSelector(scatterPlotSlice.selectMarginLeft)
    const marginRight = useAppSelector(scatterPlotSlice.selectMarginRight)
    const marginTop = useAppSelector(scatterPlotSlice.selectMarginTop)
    const marginBottom = useAppSelector(scatterPlotSlice.selectMarginBottom)
    // console.log('margins', marginLeft, marginRight, marginTop, marginBottom)
    const isExpand = useAppSelector(scatterPlotSlice.selectIsExpand)

    // dataset, they should be the same length, they are filtered
    const xArr = useAppSelector(scatterPlotSlice.selectXdataMemorised)
    const yArr = useAppSelector(scatterPlotSlice.selectYdataMemorised)
    const colourDomainArr = useAppSelector(scatterPlotSlice.selectColourDomainMemorised)
    const idArr = useAppSelector(scatterPlotSlice.selectIdArrMemorised)
    const selectedIdArr = useAppSelector(interactivitySlice.selectSelectedTransactionNumberArrMemorised)

    // scales' range, domain, and isLogInfo
    const xLog = useAppSelector(scatterPlotSlice.selectXlog)
    const yLog = useAppSelector(scatterPlotSlice.selectYlog)
    const { filteredXDomainMin, filteredXDomainMax, filteredYDomainMin, filteredYDomainMax } = useAppSelector(scatterPlotSlice.selectFilteredDomainMemorised)

    const dataset = useAppSelector(state => state.interactivity.transactionDataArr)
    const shouldShowBrusher = useAppSelector(scatterPlotSlice.selectShouldShowBrusher)

    // scale switcher data and handler: XLog, yLog, handleTurnOnXLog, handleTurnOffXLog, handleTurnOnYLog, handleTurnOffYLog
    const handleTurnOnXLog = () => dispatch(scatterPlotSlice.setXLog(true))
    const handleTurnOffXLog = () => dispatch(scatterPlotSlice.setXLog(false))
    const handleTurnOnYLog = () => dispatch(scatterPlotSlice.setYLog(true))
    const handleTurnOffYLog = () => dispatch(scatterPlotSlice.setYLog(false))
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
            }}>transaction amount view</div>
            <div style={{ position: 'absolute', top: -7, right: -10, transform: 'scale(0.8)', zIndex: 7 }}>
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
            ></InteractiveScatterPlot></>)
}