import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { CSSProperties, useState } from "react";
import * as clusterViewSlice from "../ClusterView/clusterViewSlice";
import { Button } from "../Button";
import { ValidAxisLabels } from "../Interactivity/interactivitySlice";
import { ValidColours } from "../ColourChannel/colourChannelSlice";
import { FrequencyControlPannel } from "./FrequencyControlPannel";
import { MiddlewareArray } from "@reduxjs/toolkit";
import { FolderableContainerInTable } from "../Containers/FolderableContainer";

export default function ClusterViewControlPannel() {
    return (
        <>
            <table className="clusterViewControlPannel">
                <thead></thead>
                <tbody>
                    <ClusterViewMappingControlPannel></ClusterViewMappingControlPannel>
                    <FolderableContainerInTable label={"clustering option for trasactions"} initIsFolded={false} colSpan={4}>
                        <ClusterAlgorithmControlPannel></ClusterAlgorithmControlPannel>
                    </FolderableContainerInTable>
                    <FolderableContainerInTable label={"clustering option for create group of transaction to calculate frequency"} initIsFolded={false} colSpan={4}>
                        <FrequencyControlPannel></FrequencyControlPannel>
                    </FolderableContainerInTable>
                </tbody>
            </table>
        </>
    )
}

function ClusterViewMappingControlPannel() {
    const xLable = useAppSelector(state => state.clusterView.x)
    const yLable = useAppSelector(state => state.clusterView.y)
    const colour = useAppSelector(state => state.clusterView.colour)
    const xScale = useAppSelector(state => state.clusterView.xLog ? 'log' : 'linear')
    const yScale = useAppSelector(state => state.clusterView.yLog ? 'log' : 'linear')

    const dispatch = useAppDispatch()

    const handleChangeXLable = (newLable: string) => {
        dispatch(clusterViewSlice.setXLable(newLable as ValidAxisLabels))
    }
    const handleChangeYLable = (newLable: string) => {
        dispatch(clusterViewSlice.setYLable(newLable as ValidAxisLabels))
    }
    const handleChangeColour = (newColour: string) => {
        dispatch(clusterViewSlice.setColour(newColour as ValidColours))
    }
    const handleChangeXScale = (newXScale: string) => {
        dispatch(clusterViewSlice.setXLog(newXScale === 'log'))
    }
    const handleChangeYScale = (newXScale: string) => {
        dispatch(clusterViewSlice.setYLog(newXScale === 'log'))
    }
    const handleSwap = () => {
        dispatch(clusterViewSlice.swap())
    }
    return (
        <>
            <tr>
                <td style={{ float: 'right' }} >x scale:</td>
                <td>
                    <select name="" id="" value={xScale} onChange={e => handleChangeXScale(e.target.value)}>
                        <option value="log">log</option>
                        <option value="linear">linear</option>
                    </select>
                </td>
                <td style={{ float: 'right' }}>x label:</td>
                <td>
                    <select name="" id="" value={xLable} onChange={e => handleChangeXLable(e.target.value)}>
                        <option value="transactionAmount">transaction amount</option>
                        <option value="frequency">frequency(per month)</option>
                        <option value="dayOfYear">dayOfYear</option>
                        <option value="balance">balance</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td style={{ float: 'right' }}>y scale:</td>
                <td>
                    <select name="" id="" value={yScale} onChange={e => handleChangeYScale(e.target.value)}>
                        <option value="log">log</option>
                        <option value="linear">linear</option>
                    </select>
                </td>
                <td style={{ float: 'right' }}>y label:</td>
                <td>
                    <select name="" id="" value={yLable} onChange={e => handleChangeYLable(e.target.value)}>
                        <option value="transactionAmount">transaction amount</option>
                        <option value="frequency">frequency(per month)</option>
                        <option value="dayOfYear">dayOfYear</option>
                        <option value="balance">balance</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td style={{ float: 'right' }}>colour:</td>
                <td>
                    <select name="" id="" value={colour} onChange={e => handleChangeColour(e.target.value)}>
                        <option value="cluster">cluster</option>
                        <option value="category">category</option>
                        <option value="frequencyUniqueKey">frequencyUniqueKey</option>
                    </select>
                </td>
                <td></td>
                <td style={{ float: 'right' }}>
                    {/* removed this button, and put it into the chart component because it is complex to check the swapping information in the chart component (InteractiveScatterPlot) */}
                    {/* <button onClick={handleSwap}>swap axis</button> */}
                </td>
            </tr>
            <TableHrRow colSpan={4}></TableHrRow>
        </>
    )
}

function ClusterAlgorithmControlPannel() {
    const dispatch = useAppDispatch()
    const initNumberOfCluster = useAppSelector(clusterViewSlice.selectNumberOfCluster);
    const initMetric1 = useAppSelector(clusterViewSlice.selectMetric1);
    const initMetric2 = useAppSelector(clusterViewSlice.selectMetric2);
    const [numberOfCluster, setNumberOfCluster] = useState(initNumberOfCluster);
    const [metric1, setMetric1] = useState(initMetric1);
    const [metric2, setMetric2] = useState(initMetric2);
    const isChanged = initNumberOfCluster !== numberOfCluster || initMetric1 !== metric1 || initMetric2 !== metric2
    const resetTable = () => {
        setNumberOfCluster(initNumberOfCluster);
        setMetric1(initMetric1);
        setMetric2(initMetric2)
    }
    const saveTable = () => {
        dispatch(clusterViewSlice.setClusterArguments({ numberOfCluster, metric1, metric2 }))
    }

    return (
        <>
            <tr>
                <td colSpan={2}>target number of cluster:</td>
                <td colSpan={2}><input type="number" value={numberOfCluster} onChange={e => setNumberOfCluster(parseInt(e.target.value))} /></td>

            </tr>
            <tr>
                <td colSpan={2}>clustering metric1:</td>
                <td colSpan={2}>
                    <select name="" id="" value={metric1} onChange={e => setMetric1(e.target.value as "transactionAmount" | "category" | "frequency")}>
                        <option value='transactionAmount'>transactionAmount</option>
                        <option value='frequency'>frequency(per month)</option>
                        <option value='category'>category</option>
                    </select>
                </td>

            </tr>
            <tr>
                <td colSpan={2}>clustering metric2:</td>
                <td colSpan={2}>
                    <select name="" id="" value={metric2} onChange={e => setMetric2(e.target.value as "transactionAmount" | "category" | "frequency")}>
                        <option value='transactionAmount'>transactionAmount</option>
                        <option value='frequency'>frequency(per month)</option>
                        <option value='category'>category</option>
                    </select>
                </td>

            </tr>
            <tr>
                <td colSpan={2}>
                </td>
                <td colSpan={2} style={{}}>
                    <div style={{ float: 'right' }}>
                        <Button onClick={resetTable} available={isChanged}>reset</Button>
                        <Button onClick={saveTable} available={isChanged}>update</Button>
                    </div>
                </td>
            </tr>
            <TableHrRow colSpan={4}></TableHrRow>
        </>
    )
}

function TableHrRow({ colSpan }: { colSpan: number }) {
    return <tr><td colSpan={4}><hr /></td></tr>
}
