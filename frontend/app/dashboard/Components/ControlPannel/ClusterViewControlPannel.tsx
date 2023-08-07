import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useState } from "react";
import * as clusterViewSlice from "../ClusterView/clusterViewSlice";

export default function ClusterViewControlPannel() {
    const dispatch = useAppDispatch()
    const initNumberOfCluster = useAppSelector(clusterViewSlice.selectNumberOfCluster);
    const initMetric1 = useAppSelector(clusterViewSlice.selectMetric1);
    const initMetric2 = useAppSelector(clusterViewSlice.selectMetric2);
    const [numberOfCluster, setNumberOfCluster] = useState(initNumberOfCluster);
    const [metric1, setMetric1] = useState(initMetric1);
    const [metric2, setMetric2] = useState(initMetric2);
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
                            <button onClick={resetTable}>reset</button>
                        </td>
                        <td>
                            <button onClick={saveTable}>save</button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}