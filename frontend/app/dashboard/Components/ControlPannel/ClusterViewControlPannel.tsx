import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { CSSProperties, useState } from "react";
import * as clusterViewSlice from "../ClusterView/clusterViewSlice";
import { Button } from "../Button";

export default function ClusterViewControlPannel() {
    return (
        <>
            <div><ClusterViewMappingControlPannel></ClusterViewMappingControlPannel></div>
            <div><ClusterAlgorithmControlPannel></ClusterAlgorithmControlPannel></div>
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
        dispatch(clusterViewSlice.setXLable(newLable as clusterViewSlice.ValidAxisLabels))
    }
    const handleChangeYLable = (newLable: string) => {
        dispatch(clusterViewSlice.setYLable(newLable as clusterViewSlice.ValidAxisLabels))
    }
    const handleChangeColour = (newColour: string) => {
        dispatch(clusterViewSlice.setColour(newColour as clusterViewSlice.ValidColours))
    }
    const handleChangeXScale = (newXScale: string) => {
        dispatch(clusterViewSlice.setXScale(newXScale === 'log'))
    }
    const handleChangeYScale = (newXScale: string) => {
        dispatch(clusterViewSlice.setYScale(newXScale === 'log'))
    }
    const handleSwap = () => {
        dispatch(clusterViewSlice.swap())
    }
    return (
        <>
            <table>
                <thead></thead>
                <tbody>
                    <tr>
                        <td>xLabel</td>
                        <td>
                            <select name="" id="" value={xLable} onChange={e => handleChangeXLable(e.target.value)}>
                                <option value="transactionAmount">transaction amount</option>
                                <option value="frequency">frequency</option>
                                <option value="dayOfYear">dayOfYear</option>
                                <option value="balance">balance</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>yLabel</td>
                        <td>
                            <select name="" id="" value={yLable} onChange={e => handleChangeYLable(e.target.value)}>
                                <option value="transactionAmount">transaction amount</option>
                                <option value="frequency">frequency</option>
                                <option value="dayOfYear">dayOfYear</option>
                                <option value="balance">balance</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>colour</td>
                        <td>
                            <select name="" id="" value={colour} onChange={e => handleChangeColour(e.target.value)}>
                                <option value="cluster">cluster</option>
                                <option value="category">category</option>
                                <option value="frequencyUniqueKey">frequencyUniqueKey</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>xScale</td>
                        <td>
                            <select name="" id="" value={xScale} onChange={e => handleChangeXScale(e.target.value)}>
                                <option value="log">log</option>
                                <option value="linear">linear</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>yScale</td>
                        <td>

                            <select name="" id="" value={yScale} onChange={e => handleChangeYScale(e.target.value)}>
                                <option value="log">log</option>
                                <option value="linear">linear</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td><button onClick={handleSwap}>swap</button></td>
                    </tr>
                </tbody>
            </table>
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
            <table>
                <thead>
                </thead>
                <tbody>
                    <tr>
                        <td>clustering options</td>
                    </tr>
                    <tr>
                        <td>cluster</td>
                        <td><input type="number" value={numberOfCluster} onChange={e => setNumberOfCluster(parseInt(e.target.value))} /></td>
                    </tr>
                    <tr>
                        <td>metric1</td>
                        <td>
                            <select name="" id="" value={metric1} onChange={e => setMetric1(e.target.value as "transactionAmount" | "category" | "frequency")}>
                                <option value='transactionAmount'>transactionAmount</option>
                                <option value='frequency'>frequency</option>
                                <option value='category'>category</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>metric2</td>
                        <td>
                            <select name="" id="" value={metric2} onChange={e => setMetric2(e.target.value as "transactionAmount" | "category" | "frequency")}>
                                <option value='transactionAmount'>transactionAmount</option>
                                <option value='frequency'>frequency</option>
                                <option value='category'>category</option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <Button onClick={resetTable} available={isChanged}>reset</Button>
                        </td>
                        <td>
                            <Button onClick={saveTable} available={isChanged}>update</Button>
                        </td>
                    </tr>
                </tbody>
            </table>

        </>
    )
}


