import { useContext } from "react"
import { Action, ConfigContext, ConfigDispatchContext } from "../ConfigProvider"
import { assert } from "console"
import { TransactionData, TransactionDataAttrs } from "../../utilities/DataObject"
import next from "next/types"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import { selectBarDayView } from "../CalendarView3/DayViews/barDayViewSlice"
import {
    setSharedBandwidth,
    setPrivateBandWidth,
    setSortingKey,
    setDescendingOrder,
    setAscendingOrder,
    setHeightAxis,
} from "../CalendarView3/DayViews/barDayViewSlice"
/**
 * require ConfigureContext and ConfigDispatchContext
 * render the configuration based on the ConfigContext
 * provide buttons for controlling the ConfigContext by using ConfigDispatchContext
 */
export default function ControlPannel() {
    const barDayViewConfig = useAppSelector(selectBarDayView);
    const dispatch = useAppDispatch()
    const config = useContext(ConfigContext)
    const dispatchOld = useContext(ConfigDispatchContext)
    if (dispatchOld===null) {return <></>}
    const handleSetBarGlyphShareBandWidth = (nextIsSharedBandWidth: boolean) => {
        dispatch(nextIsSharedBandWidth ? setSharedBandwidth() : setPrivateBandWidth())
    }

    const handleSetBarGlyphSortingKey = (nextSortingKey: string) => {
        for (let validSortingKey of TransactionData.getColumnNames()) {
            if (nextSortingKey === validSortingKey) {
                dispatch(setSortingKey(nextSortingKey));
                return;
            }
        }
        throw new Error("invalid sorting keys:" + nextSortingKey);

    }

    const handleSetBarGlyphSortingOrder = (nextOrder: string) => {
        if (nextOrder === 'descending') {
            dispatch(setDescendingOrder())
        } else if (nextOrder === 'ascending') {
            dispatch(setAscendingOrder())
        }
    }
    const handleSetBarGlyphHeightAxis = (nextAxis: string) => {
        switch (nextAxis) {
            case 'log':
                dispatch(setHeightAxis('log'));
                break;
            case 'linear':
                dispatch(setHeightAxis('linear'))
                break;
            default:
                throw new Error("invalid nextAxis: " + nextAxis);
                ;
        }
    }
    const handleUseBarGlyph = () => {
        dispatchOld({ targetChart: 'calendar view', type: 'change glyph type', glyphType: 'bar' })
    }
    const handleUsePieGlyph = () => {
        dispatchOld({ targetChart: 'calendar view', type: 'change glyph type', glyphType: 'pie' })
    }

    return (<>
        <div className="controlPannelSubtitle">
            calendar view setting
        </div>
        <table>
            <tr>
                <td><input type="radio" name="barGlyph" checked={config.calendarViewConfig.glyphType === 'bar'} id="barGlyph"
                    onClick={handleUseBarGlyph} /><label htmlFor="barGlyph">bar glyph</label></td>
                <td><input type="radio" name="pieGlyph" checked={config.calendarViewConfig.glyphType === 'pie'} id="pieGlyph"
                    onClick={handleUsePieGlyph} /><label htmlFor="pieGlyph">pie glyph</label></td>
            </tr>
            <tr><td><hr /></td><td><hr /></td></tr>
            <tr>
                <td>
                    barGlyph share bandwidth?
                </td>
                <td>
                    <select name="" id="" value={String(barDayViewConfig.isSharedBandWidth)}
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
                    <select name="" id="" value={barDayViewConfig.sortingKey} onChange={(e) => handleSetBarGlyphSortingKey(e.target.value)}>
                        {TransactionData.getColumnNames().map(columnName => <option key={columnName} value={columnName}>{columnName}</option>)}
                    </select>
                </td>
            </tr>
            <tr>
                <td>
                    barGlyph sorting order:
                </td>
                <td>
                    <select name="" id="" value={barDayViewConfig.isDesc ? 'descending' : 'ascending'} onChange={(e) => handleSetBarGlyphSortingOrder(e.target.value)}>
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
                    <select name="" id="" value={barDayViewConfig.heightAxis} onChange={(e) => handleSetBarGlyphHeightAxis(e.target.value)}>
                        <option value="log">log</option>
                        <option value="linear">linear</option>
                    </select>
                </td>
            </tr>

        </table>
    </>)
}