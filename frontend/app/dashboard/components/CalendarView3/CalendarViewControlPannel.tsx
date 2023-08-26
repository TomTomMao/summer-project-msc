import { TransactionData, } from "../../utilities/DataObject"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import * as barDayViewSlice from "./DayViews/barDayViewSlice"
import * as calendarViewSlice from "./calendarViewSlice"
import * as pieDayViewSlice from "./DayViews/pieDayViewSlice"
import FolderableContainer from "../Containers/FolderableContainer"
import { Typography, FormControlLabel, Switch, Button, ButtonGroup, FormControl, Grid, InputLabel, MenuItem, Select, Container, Radio, FormLabel, RadioGroup } from "@mui/material";
import { Accordion, AccordionDetails, AccordionSummary } from "@/app/dashboard/utilities/styledAccordion"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


/**
 * require ConfigureContext and ConfigDispatchContext
 * render the configuration based on the ConfigContext
 * provide buttons for controlling the ConfigContext by using ConfigDispatchContext
 */
export default function CalendarViewControlPannel() {

    // config for the pie view
    const radiusScaleType: 'linear' | 'log' | 'constant' = useAppSelector(pieDayViewSlice.selectRadiusAxis)

    // config for the selected glyph type
    const calendarViewGlyphType = useAppSelector(calendarViewSlice.selectGlyphType)

    const dispatch = useAppDispatch()



    const handleUseGlyph = (glyphType: calendarViewSlice.CalendarViewState['glyphType']): void => {
        dispatch(calendarViewSlice.setGlyphType(glyphType))
    }

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
                        <Grid item xs={3}><Button variant='contained' className="w-full" size="small" color={'info'} disabled>Star</Button></Grid>
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
                    <Typography>Bar Glyph Config</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <BarDayViewControlPannel></BarDayViewControlPannel>
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
                    <Typography>Pie Glyph Config</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <BarDayViewControlPannel></BarDayViewControlPannel>
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
                    <Typography>Polar Area Glyph Config</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <BarDayViewControlPannel></BarDayViewControlPannel>
                </AccordionDetails>
            </Accordion>
        </div>)
    // return (<>
    //     <div className="controlPannelSubtitle">
    //         calendar view setting
    //     </div>
    //     <table>
    //         <tr>
    //             <td><input type="radio" name="barGlyph" checked={calendarViewGlyphType === 'bar'} id="barGlyph"
    //                 onChange={handleUseBarGlyph} /><label htmlFor="barGlyph">bar glyph</label></td>
    //             <td><input type="radio" name="pieGlyph" checked={calendarViewGlyphType === 'pie'} id="pieGlyph"
    //                 onChange={handleUsePieGlyph} /><label htmlFor="pieGlyph">pie glyph</label></td>
    //         </tr>
    //         <tr><td><hr /></td><td><hr /></td></tr>
    //         <FolderableContainer label={"bar glyph config"} initIsFolded={false}>
    //             <tr>
    //                 <td>
    //                     barGlyph share bandwidth?
    //                 </td>
    //                 <td>
    //                     <select name="" id="" value={String(barDayViewIsSharedBandWidth)}
    //                         onChange={(e) => handleSetBarGlyphShareBandWidth(e.target.value === 'true' ? true : false)}>
    //                         <option value='true'>true</option>
    //                         <option value='false'>false</option>
    //                     </select>
    //                 </td>
    //             </tr>
    //             <tr>
    //                 <td>
    //                     barGlyph sorting key:
    //                 </td>
    //                 <td>
    //                     <select name="" id="" value={barDayViewSortingKey} onChange={(e) => handleSetBarGlyphSortingKey(e.target.value)}>
    //                         {TransactionData.getColumnNames().map(columnName => <option key={columnName} value={columnName}>{columnName}</option>)}
    //                     </select>
    //                 </td>
    //             </tr>
    //             <tr>
    //                 <td>
    //                     barGlyph sorting order:
    //                 </td>
    //                 <td>
    //                     <select name="" id="" value={barDayViewIsDesc ? 'descending' : 'ascending'} onChange={(e) => handleSetBarGlyphSortingOrder(e.target.value)}>
    //                         <option value="descending">descending</option>
    //                         <option value="ascending">ascending</option>
    //                     </select>
    //                 </td>
    //             </tr>
    //             <tr>
    //                 <td>
    //                     barGlyph height axis:
    //                 </td>
    //                 <td>
    //                     <select name="" id="" value={barDayViewHeightAxis} onChange={(e) => handleSetBarGlyphHeightAxis(e.target.value)}>
    //                         <option value="log">log</option>
    //                         <option value="linear">linear</option>
    //                     </select>
    //                 </td>
    //             </tr>
    //         </FolderableContainer>
    //         <tr><td><hr /></td><td><hr /></td></tr>
    //         <FolderableContainer label={"pie glyph config"} initIsFolded={false}>
    //             <tr>
    //                 <td>
    //                     pieGlyph radius
    //                 </td>
    //                 <td>
    //                     <select name="" id="" value={radiusScaleType} onChange={(e) => handleSetPieGlyphRadiusAxis(e.target.value)}>
    //                         <option value="log">log</option>
    //                         <option value="linear">linear</option>
    //                         <option value="constant">constant</option>
    //                     </select>
    //                 </td>
    //             </tr>
    //         </FolderableContainer>
    //     </table>
    // </>)
}
function BarDayViewControlPannel() {
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
    const handleSetBarGlyphHeightAxis = (nextAxis: string) => {
        switch (nextAxis) {
            case 'log':
                dispatch(barDayViewSlice.setHeightAxis('log'));
                break;
            case 'linear':
                dispatch(barDayViewSlice.setHeightAxis('linear'))
                break;
            default:
                throw new Error("invalid nextAxis: " + nextAxis);
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