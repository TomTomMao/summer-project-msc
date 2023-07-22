import { TransactionData, } from "../../utilities/DataObject"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import * as barDayViewSlice from "../CalendarView3/DayViews/barDayViewSlice"
import * as calendarViewSlice from "../CalendarView3/calendarViewSlice"
/**
 * require ConfigureContext and ConfigDispatchContext
 * render the configuration based on the ConfigContext
 * provide buttons for controlling the ConfigContext by using ConfigDispatchContext
 */
export default function ControlPannel() {

    // config for the bar view
    const barDayViewIsSharedBandWidth = useAppSelector(barDayViewSlice.selectIsSharedBandWidth)
    const barDayViewSortingKey = useAppSelector(barDayViewSlice.selectSortingKey)
    const barDayViewIsDesc = useAppSelector(barDayViewSlice.selectIsDesc)
    const barDayViewHeightAxis = useAppSelector(barDayViewSlice.selectHeightAxis)

    // config for the selected glyph type
    const calendarViewGlyphType = useAppSelector(calendarViewSlice.selectGlyphType)

    const dispatch = useAppDispatch()

    const handleSetBarGlyphShareBandWidth = (nextIsSharedBandWidth: boolean) => {
        dispatch(nextIsSharedBandWidth ? barDayViewSlice.setSharedBandwidth() : barDayViewSlice.setPrivateBandWidth())
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
                ;
        }
    }
    const handleUseBarGlyph = () => {
        dispatch(calendarViewSlice.setGlyphType('bar'))
    }
    const handleUsePieGlyph = () => {
        dispatch(calendarViewSlice.setGlyphType('pie'))
    }

    return (<>
        <div className="controlPannelSubtitle">
            calendar view setting
        </div>
        <table>
            <tr>
                <td><input type="radio" name="barGlyph" checked={calendarViewGlyphType === 'bar'} id="barGlyph"
                    onClick={handleUseBarGlyph} /><label htmlFor="barGlyph">bar glyph</label></td>
                <td><input type="radio" name="pieGlyph" checked={calendarViewGlyphType === 'pie'} id="pieGlyph"
                    onClick={handleUsePieGlyph} /><label htmlFor="pieGlyph">pie glyph</label></td>
            </tr>
            <tr><td><hr /></td><td><hr /></td></tr>
            <tr>
                <td>
                    barGlyph share bandwidth?
                </td>
                <td>
                    <select name="" id="" value={String(barDayViewIsSharedBandWidth)}
                        onChange={(e) => handleSetBarGlyphShareBandWidth(e.target.value === 'true' ? true : false)}>
                        <option value='true'>true</option>
                        <option value='false'>false</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>
                    barGlyph sorting key:
                </td>
                <td>
                    <select name="" id="" value={barDayViewSortingKey} onChange={(e) => handleSetBarGlyphSortingKey(e.target.value)}>
                        {TransactionData.getColumnNames().map(columnName => <option key={columnName} value={columnName}>{columnName}</option>)}
                    </select>
                </td>
            </tr>
            <tr>
                <td>
                    barGlyph sorting order:
                </td>
                <td>
                    <select name="" id="" value={barDayViewIsDesc ? 'descending' : 'ascending'} onChange={(e) => handleSetBarGlyphSortingOrder(e.target.value)}>
                        <option value="descending">descending</option>
                        <option value="ascending">ascending</option>
                    </select>
                </td>
            </tr>
            <tr>
                <td>
                    barGlyph heigth axis:
                </td>
                <td>
                    <select name="" id="" value={barDayViewHeightAxis} onChange={(e) => handleSetBarGlyphHeightAxis(e.target.value)}>
                        <option value="log">log</option>
                        <option value="linear">linear</option>
                    </select>
                </td>
            </tr>

        </table>
    </>)
}