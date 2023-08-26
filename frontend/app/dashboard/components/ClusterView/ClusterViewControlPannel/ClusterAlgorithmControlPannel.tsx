import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { useState } from "react";
import * as clusterViewSlice from "../clusterViewSlice";
import { Button } from "../../Button";
import { FormControl, InputLabel, MenuItem, Select, TextField, Tooltip } from "@mui/material";
import Grid from '@mui/material/Grid';
import { showInvalidInputData } from "../../PopupWindow/PopupSlice";
import { MIN_NUMBER_CLUSTER, MAX_NUMBER_CLUSTER } from "./ClusterViewControlPannel";

export function ClusterAlgorithmControlPannel() {
    const dispatch = useAppDispatch();
    const initNumberOfCluster = useAppSelector(clusterViewSlice.selectNumberOfCluster);
    const initMetric1 = useAppSelector(clusterViewSlice.selectMetric1);
    const initMetric2 = useAppSelector(clusterViewSlice.selectMetric2);
    const [numberOfCluster, setNumberOfCluster] = useState(initNumberOfCluster);
    const [metric1, setMetric1] = useState(initMetric1);
    const [metric2, setMetric2] = useState(initMetric2);
    const isChanged = initNumberOfCluster !== numberOfCluster || initMetric1 !== metric1 || initMetric2 !== metric2;
    const isValidNumberOfCluster = !(numberOfCluster < MIN_NUMBER_CLUSTER || numberOfCluster > MAX_NUMBER_CLUSTER);
    const resetTable = () => {
        setNumberOfCluster(initNumberOfCluster);
        setMetric1(initMetric1);
        setMetric2(initMetric2);
    };
    const saveTable = () => {
        if (!isValidNumberOfCluster) {
            dispatch(showInvalidInputData(`target number of cluster is invalid, it must between ${MIN_NUMBER_CLUSTER} and ${MAX_NUMBER_CLUSTER}`));
        } else {
            dispatch(clusterViewSlice.setClusterArguments({ numberOfCluster, metric1, metric2 }));
        }
    };

    return (
        <Grid container spacing={1}>
            <Grid item xs={6}>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">clustering metric1</InputLabel>
                    <Select
                        size="small"
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={metric1}
                        label="clustering metric1"
                        onChange={e => setMetric1(e.target.value as "transactionAmount" | "category" | "frequency")}
                    >
                        <MenuItem value="transactionAmount">transaction amount</MenuItem>
                        <MenuItem value="frequency">frequency(per month)</MenuItem>
                        <MenuItem value="category">category</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={6}>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">clustering metric2</InputLabel>
                    <Select
                        size="small"
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={metric2}
                        label="clustering metric2"
                        onChange={e => setMetric2(e.target.value as "transactionAmount" | "category" | "frequency")}
                    >
                        <MenuItem value="transactionAmount">transaction amount</MenuItem>
                        <MenuItem value="frequency">frequency(per month)</MenuItem>
                        <MenuItem value="category">category</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={6}>
                <Tooltip title={`between ${MIN_NUMBER_CLUSTER} and ${MAX_NUMBER_CLUSTER}`}>
                    <TextField
                        error={numberOfCluster < MIN_NUMBER_CLUSTER || numberOfCluster > MAX_NUMBER_CLUSTER}
                        helperText={(numberOfCluster < MIN_NUMBER_CLUSTER || numberOfCluster > MAX_NUMBER_CLUSTER) ? `must between ${MIN_NUMBER_CLUSTER} and ${MAX_NUMBER_CLUSTER}` : <></>}
                        fullWidth
                        label={'number of cluster'}
                        size='small'
                        variant="outlined"
                        type="number"
                        value={numberOfCluster}
                        onChange={e => setNumberOfCluster(parseInt(e.target.value))} />
                </Tooltip>
            </Grid>
            <Grid item xs={3}>
                <Button size="small" className="h-full w-full" variant='outlined' onClick={resetTable} available={isChanged}>reset</Button>
            </Grid>
            <Grid item xs={3}>
                <Button size="small" className="h-full w-full" variant='outlined' onClick={saveTable} available={isChanged && isValidNumberOfCluster}>update</Button>
            </Grid>
        </Grid>
    );
}
