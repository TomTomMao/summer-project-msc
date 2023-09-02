import { useAppDispatch, useAppSelector } from "@/app/hooks";
import * as clusterViewSlice from "../clusterViewSlice";
import { ValidAxisLabels } from "../../Interactivity/interactivitySlice";
import { ValidColours } from "../../ColourChannel/colourChannelSlice";
import { FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch } from "@mui/material";
import Grid from '@mui/material/Grid';

export function ClusterViewMappingControlPanel() {
    const xLable = useAppSelector(state => state.clusterView.x);
    const yLable = useAppSelector(state => state.clusterView.y);
    const colour = useAppSelector(state => state.clusterView.colour);
    const xScale = useAppSelector(state => state.clusterView.xLog ? 'log' : 'linear');
    const yScale = useAppSelector(state => state.clusterView.yLog ? 'log' : 'linear');

    const dispatch = useAppDispatch();

    const handleChangeXLable = (newLable: string) => {
        dispatch(clusterViewSlice.setXLable(newLable as ValidAxisLabels));
    };
    const handleChangeYLable = (newLable: string) => {
        dispatch(clusterViewSlice.setYLable(newLable as ValidAxisLabels));
    };
    const handleChangeColour = (newColour: string) => {
        dispatch(clusterViewSlice.setColour(newColour as ValidColours));
    };
    const handleChangeXScale = (newXScale: string) => {
        dispatch(clusterViewSlice.setXLog(newXScale === 'log'));
    };
    const handleChangeYScale = (newXScale: string) => {
        dispatch(clusterViewSlice.setYLog(newXScale === 'log'));
    };
    const handleToggleXScale = () => {
        dispatch(clusterViewSlice.toggleXLog());
    };
    const handleToggleYScale = () => {
        dispatch(clusterViewSlice.toggleYLog());
    };
    const handleSwap = () => {
        dispatch(clusterViewSlice.swap());
    };
    return (
        <Grid container spacing={1}>
            {/* reference: https://mui.com/material-ui/react-grid/ */}
            <Grid item xs={12}>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Colour</InputLabel>
                    <Select
                        size="small"
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={colour}
                        label="Colour"
                        onChange={e => handleChangeColour(e.target.value)}
                    >
                        <MenuItem value="cluster">Cluster</MenuItem>
                        <MenuItem value="category">Category</MenuItem>
                        <MenuItem value="frequencyUniqueKey">Transaction Description Group</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={6}>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">X Axis</InputLabel>
                    <Select
                        size="small"
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={xLable}
                        label="x axis"
                        onChange={e => handleChangeXLable(e.target.value)}
                    >
                        <MenuItem value="transactionAmount">Transaction Amount</MenuItem>
                        <MenuItem value="frequency">Frequency(per month)</MenuItem>
                        <MenuItem value="dayOfYear">Day of Year</MenuItem>
                        <MenuItem value="balance">Balance</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={6}>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Y axis</InputLabel>
                    <Select
                        size="small"
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={yLable}
                        label="Y axis"
                        onChange={e => handleChangeYLable(e.target.value)}
                    >
                        <MenuItem value="transactionAmount">Transaction Amount</MenuItem>
                        <MenuItem value="frequency">Frequency(per month)</MenuItem>
                        <MenuItem value="dayOfYear">Day of Year</MenuItem>
                        <MenuItem value="balance">Balance</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={6}>
                <FormControlLabel
                    className="h-full w-full flex flex-col items-center justify-center"
                    labelPlacement="start"
                    control={<Switch
                        checked={xScale === 'log'}
                        onChange={handleToggleXScale} />} label='Use Log Scale' />
            </Grid>
            <Grid item xs={6}>
                <FormControlLabel
                    className="h-full w-full flex flex-col items-center justify-center"
                    labelPlacement="start"
                    control={<Switch
                        checked={yScale === 'log'}
                        onChange={handleToggleYScale} />} label='Use Log Scale' />
            </Grid>
        </Grid>
    );
}
