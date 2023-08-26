import { useAppDispatch, useAppSelector } from "@/app/hooks";
import * as clusterViewSlice from "../clusterViewSlice";
import { ValidAxisLabels } from "../../Interactivity/interactivitySlice";
import { ValidColours } from "../../ColourChannel/colourChannelSlice";
import { FormControl, FormControlLabel, InputLabel, MenuItem, Select, Switch } from "@mui/material";
import Grid from '@mui/material/Grid';

export function ClusterViewMappingControlPannel() {
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
        <Grid container spacing={2}>
            {/* reference: https://mui.com/material-ui/react-grid/ */}
            <Grid item xs={12}>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">colour</InputLabel>
                    <Select
                        size="small"
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={colour}
                        label="colour"
                        onChange={e => handleChangeColour(e.target.value)}
                    >
                        <MenuItem value="cluster">cluster</MenuItem>
                        <MenuItem value="category">category</MenuItem>
                        <MenuItem value="frequencyUniqueKey">transaction description group</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={6}>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">x axis</InputLabel>
                    <Select
                        size="small"
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={xLable}
                        label="x axis"
                        onChange={e => handleChangeXLable(e.target.value)}
                    >
                        <MenuItem value="transactionAmount">transaction amount</MenuItem>
                        <MenuItem value="frequency">frequency(per month)</MenuItem>
                        <MenuItem value="dayOfYear">dayOfYear</MenuItem>
                        <MenuItem value="balance">balance</MenuItem>
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={6}>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">y axis</InputLabel>
                    <Select
                        size="small"
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={yLable}
                        label="y axis"
                        onChange={e => handleChangeYLable(e.target.value)}
                    >
                        <MenuItem value="transactionAmount">transaction amount</MenuItem>
                        <MenuItem value="frequency">frequency(per month)</MenuItem>
                        <MenuItem value="dayOfYear">dayOfYear</MenuItem>
                        <MenuItem value="balance">balance</MenuItem>
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
