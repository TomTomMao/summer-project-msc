import { TransactionData, } from "../../utilities/DataObject"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import * as barDayViewSlice from "./DayViews/barDayViewSlice"
import * as calendarViewSlice from "./calendarViewSlice"
import * as pieDayViewSlice from "./DayViews/pieDayViewSlice"
import FolderableContainer from "../Containers/FolderableContainer"
import { Typography, FormControlLabel, Switch, Button, ButtonGroup, FormControl, Grid, InputLabel, MenuItem, Select, Container, Radio, FormLabel, RadioGroup } from "@mui/material";
import { Accordion, AccordionDetails, AccordionSummary } from "@/app/dashboard/utilities/styledAccordion"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import * as polarAreaDayViewSlice from "./DayViews/polarAreaDayViewSlice"
import * as starDayViewSlice  from "./DayViews/starDayViewSlice"


/**
 * require ConfigureContext and ConfigDispatchContext
 * render the configuration based on the ConfigContext
 * provide buttons for controlling the ConfigContext by using ConfigDispatchContext
 */
export default function CalendarViewControlPanel() {

    // config for the selected glyph type
    const calendarViewGlyphType = useAppSelector(calendarViewSlice.selectGlyphType)

    const dispatch = useAppDispatch()
    const handleUseGlyph = (glyphType: calendarViewSlice.CalendarViewState['glyphType']): void => {
        dispatch(calendarViewSlice.setGlyphType(glyphType))
    }

    return (
        <div style={{ width: 550, border: 'black 1px solid' }}>
            <Accordion
                defaultExpanded={true} >
                {/* reference: https://mui.com/material-ui/react-accordion/ */}
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>Glyph Type</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Grid container spacing={1}>
                        <Grid item xs={3}><Button variant='contained' className="w-full" onClick={() => handleUseGlyph('bar')} size="small" color={calendarViewGlyphType === 'bar' ? 'success' : 'info'}>Bar</Button></Grid>
                        <Grid item xs={3}><Button variant='contained' className="w-full" onClick={() => handleUseGlyph('pie')} size="small" color={calendarViewGlyphType === 'pie' ? 'success' : 'info'}>Pie</Button></Grid>
                        <Grid item xs={3}><Button variant='contained' className="w-full" onClick={() => handleUseGlyph('polarArea')} size="small" color={calendarViewGlyphType === 'polarArea' ? 'success' : 'info'}>Polar Area</Button></Grid>
                        <Grid item xs={3}><Button variant='contained' className="w-full" onClick={() => handleUseGlyph('star')} size="small" color={calendarViewGlyphType === 'star' ? 'success' : 'info'}>star</Button></Grid>
                    </Grid>
                </AccordionDetails>
            </Accordion>
            <Accordion

                defaultExpanded={calendarViewGlyphType === 'bar'}>
                {/* reference: https://mui.com/material-ui/react-accordion/ */}
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography color={calendarViewGlyphType === 'bar' ? 'success.main' : undefined}>Bar Glyph Config</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <BarDayViewControlPanel></BarDayViewControlPanel>
                </AccordionDetails>
            </Accordion>
            <Accordion
                defaultExpanded={calendarViewGlyphType === 'pie'}>
                {/* reference: https://mui.com/material-ui/react-accordion/ */}
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography color={calendarViewGlyphType === 'pie' ? 'success.main' : undefined}>Pie Glyph Config</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <PieDayViewControlPanel></PieDayViewControlPanel>
                </AccordionDetails>
            </Accordion>
            <Accordion
                defaultExpanded={calendarViewGlyphType === 'polarArea'}>
                {/* reference: https://mui.com/material-ui/react-accordion/ */}
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography color={calendarViewGlyphType === 'polarArea' ? 'success.main' : undefined}>Polar Area Glyph Config</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <PolarAreaViewControlPanel></PolarAreaViewControlPanel>
                </AccordionDetails>
            </Accordion>
            <Accordion
                defaultExpanded={calendarViewGlyphType === 'polarArea'}>
                {/* reference: https://mui.com/material-ui/react-accordion/ */}
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography color={calendarViewGlyphType === 'star' ? 'success.main' : undefined}>Star Glyph Config</Typography>
                </AccordionSummary>
                <AccordionDetails>
                <StarViewControlPanel></StarViewControlPanel>
                </AccordionDetails>
            </Accordion>
        </div>)
}
function BarDayViewControlPanel() {
    const barDayViewIsSharedBandWidth = useAppSelector(barDayViewSlice.selectIsSharedBandWidth)
    const barDayViewSortingKey = useAppSelector(barDayViewSlice.selectSortingKey)
    const barDayViewIsDesc = useAppSelector(barDayViewSlice.selectIsDesc)
    const barDayViewHeightAxis = useAppSelector(barDayViewSlice.selectHeightAxis)
    const dispatch = useAppDispatch()


    const handleToggleBarDayViewShareBandwidth = () => {
        dispatch(barDayViewSlice.toggleShareBandwidth())
    }
    const handleToggleBarDayViewHeightAxis = () => {
        dispatch(barDayViewSlice.toggleHeightAxis())
    }

    const handleSetBarGlyphSortingKey = (nextSortingKey: string) => {
        for (let validSortingKey of TransactionData.getColumnNames()) {
            if (nextSortingKey === validSortingKey) {
                dispatch(barDayViewSlice.setSortingKey(nextSortingKey));
                return;
            }
        }
        throw new Error("invalid sorting keys:" + nextSortingKey);
    }

    const handleSetBarGlyphSortingOrder = (nextOrder: string) => {
        if (nextOrder === 'descending') {
            dispatch(barDayViewSlice.setDescendingOrder())
        } else if (nextOrder === 'ascending') {
            dispatch(barDayViewSlice.setAscendingOrder())
        }
    }
    return (<>
        <Grid container spacing={1}>
            <Grid item xs={6}>
                <FormControl fullWidth>
                    <InputLabel id="demo-simple-select-label">Sorting Key</InputLabel>
                    <Select
                        size="small"
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={barDayViewSortingKey}
                        onChange={(e) => handleSetBarGlyphSortingKey(e.target.value)}
                        label="Sorting Key"
                    >
                        {TransactionData.getColumnNames().map(columnName => <MenuItem key={columnName} value={columnName}>{columnName}</MenuItem>)}
                    </Select>
                </FormControl>
            </Grid>
            <Grid item xs={6}>
                <Container>
                    <FormControlLabel
                        className=""
                        labelPlacement="end"
                        control={<Switch
                            checked={barDayViewIsSharedBandWidth}
                            onChange={handleToggleBarDayViewShareBandwidth} />} label='Share Bandwidth' />
                </Container>
            </Grid>
            <Grid item xs={6}>
                <FormControl>
                    {/*reference for radio button: https://mui.com/material-ui/react-radio-button/ */}
                    <RadioGroup
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                        onChange={e => handleSetBarGlyphSortingOrder(e.target.value)}
                        value={barDayViewIsDesc ? 'descending' : 'ascending'}
                    >
                        <FormControlLabel value="ascending" control={<Radio />} label="Ascending" />
                        <FormControlLabel value="descending" control={<Radio />} label="Descending" />
                    </RadioGroup>
                </FormControl>
            </Grid>

            <Grid item xs={6}>
                <Container>
                    <FormControlLabel
                        className=""
                        labelPlacement="end"
                        control={<Switch
                            checked={barDayViewHeightAxis === 'log'}
                            onChange={handleToggleBarDayViewHeightAxis} />} label='Use Log Height' />
                </Container>
            </Grid>
        </Grid>
    </>)
}
function PieDayViewControlPanel() {
    // config for the pie view
    const radiusScaleType: 'linear' | 'log' | 'constant' = useAppSelector(pieDayViewSlice.selectRadiusAxis)
    const dispatch = useAppDispatch()

    function handleSetPieGlyphRadiusAxis(nextAxis: string): void {
        switch (nextAxis) {
            case 'log':
                dispatch(pieDayViewSlice.setRadiusAxis('log'));
                break;
            case 'linear':
                dispatch(pieDayViewSlice.setRadiusAxis('linear'));
                break;
            case 'constant':
                dispatch(pieDayViewSlice.setRadiusAxis('constant'));
                break;
            default:
                throw new Error("invalid nextAxis: " + nextAxis)
        }
    }
    return (<>
        <Grid container spacing={1}>
            <Grid item xs={2} justifyContent={'center'} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>Radius</Grid>
            <Grid item xs={10}>
                <FormControl>
                    {/*reference for radio button: https://mui.com/material-ui/react-radio-button/ */}
                    <RadioGroup
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                        onChange={e => handleSetPieGlyphRadiusAxis(e.target.value)}
                        value={radiusScaleType}
                    >
                        <FormControlLabel value="linear" control={<Radio />} label="Linear" />
                        <FormControlLabel value="log" control={<Radio />} label="Log" />
                        <FormControlLabel value="constant" control={<Radio />} label="Local" />
                    </RadioGroup>
                </FormControl>
            </Grid>
        </Grid>
    </>)
}
function PolarAreaViewControlPanel() {
    // config for the polar area view
    const radiusScaleType: "logGlobal" | "linearGlobal" | "logLocal" | "linearLocal" = useAppSelector(polarAreaDayViewSlice.selectRadiusAxis)
    const dispatch = useAppDispatch()

    function handleSetPieGlyphRadiusAxis(nextAxis: string): void {
        switch (nextAxis) {
            case 'logLocal':
                dispatch(polarAreaDayViewSlice.setRadiusAxis(nextAxis));
                break;
            case 'linearLocal':
                dispatch(polarAreaDayViewSlice.setRadiusAxis(nextAxis));
                break;
            case 'logGlobal':
                dispatch(polarAreaDayViewSlice.setRadiusAxis(nextAxis));
                break;
            case 'linearGlobal':
                dispatch(polarAreaDayViewSlice.setRadiusAxis(nextAxis));
                break;

            default:
                throw new Error("invalid nextAxis: " + nextAxis)
        }
    }
    return (<>
        <Grid container spacing={1}>
            <Grid item xs={2} justifyContent={'center'} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>Radius</Grid>
            <Grid item xs={10}>
                <FormControl>
                    {/*reference for radio button: https://mui.com/material-ui/react-radio-button/ */}
                    <RadioGroup
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                        onChange={e => handleSetPieGlyphRadiusAxis(e.target.value)}
                        value={radiusScaleType}
                    >
                        <FormControlLabel value="linearGlobal" control={<Radio />} label="Linear" />
                        <FormControlLabel value="logGlobal" control={<Radio />} label="Log" />
                        <FormControlLabel value="linearLocal" control={<Radio />} label="Linear(local)" />
                        <FormControlLabel value="logLocal" control={<Radio />} label="Log(local)" />
                    </RadioGroup>
                </FormControl>
            </Grid>
        </Grid>
    </>)
}
function StarViewControlPanel() {
    // config for the polar area view
    const radiusScaleType: "logGlobal" | "linearGlobal" | "logLocal" | "linearLocal" = useAppSelector(starDayViewSlice.selectRadiusAxis)
    const dispatch = useAppDispatch()

    function handleSetPieGlyphRadiusAxis(nextAxis: string): void {
        switch (nextAxis) {
            case 'logLocal':
                dispatch(starDayViewSlice.setRadiusAxis(nextAxis));
                break;
            case 'linearLocal':
                dispatch(starDayViewSlice.setRadiusAxis(nextAxis));
                break;
            case 'logGlobal':
                dispatch(starDayViewSlice.setRadiusAxis(nextAxis));
                break;
            case 'linearGlobal':
                dispatch(starDayViewSlice.setRadiusAxis(nextAxis));
                break;

            default:
                throw new Error("invalid nextAxis: " + nextAxis)
        }
    }
    return (<>
        <Grid container spacing={1}>
            <Grid item xs={2} justifyContent={'center'} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>Radius</Grid>
            <Grid item xs={10}>
                <FormControl>
                    {/*reference for radio button: https://mui.com/material-ui/react-radio-button/ */}
                    <RadioGroup
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                        onChange={e => handleSetPieGlyphRadiusAxis(e.target.value)}
                        value={radiusScaleType}
                    >
                        <FormControlLabel value="linearGlobal" control={<Radio />} label="Linear" />
                        <FormControlLabel value="logGlobal" control={<Radio />} label="Log" />
                        <FormControlLabel value="linearLocal" control={<Radio />} label="Linear(local)" />
                        <FormControlLabel value="logLocal" control={<Radio />} label="Log(local)" />
                    </RadioGroup>
                </FormControl>
            </Grid>
        </Grid>
    </>)
}