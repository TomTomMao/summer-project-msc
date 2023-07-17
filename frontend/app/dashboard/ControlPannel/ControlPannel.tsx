import { useContext } from "react"
import { Action, ConfigContext, ConfigDispatchContext } from "../ConfigProvider"
import { assert } from "console"
import { TransactionData, TransactionDataAttrs } from "../DataObject"
import next from "next/types"

/**
 * require ConfigureContext and ConfigDispatchContext
 * render the configuration based on the ConfigContext
 * provide buttons for controlling the ConfigContext by using ConfigDispatchContext
 */
export default function ControlPannel() {
    const config = useContext(ConfigContext)
    const dispatch = useContext(ConfigDispatchContext)
    if (config === null || dispatch === null) {
        return (<div>loading</div>)
    }

    const handleSetBarGlyphShareBandWidth = (nextIsSharedBandWidth: boolean) => {
        dispatch({
            targetChart: 'bar glyph',
            type: 'set share bandwidth',
            isShare: nextIsSharedBandWidth
        })
    }

    const handleSetBarGlyphSortingKey = (nextSortingKey: string) => {
        for (let validSortingKey of TransactionData.getColumnNames()) {
            if (nextSortingKey === validSortingKey) {
                dispatch({ targetChart: 'bar glyph', type: 'set sorting key', sortingKey: nextSortingKey });
                return;
            }
        }
        throw new Error("invalid sorting keys:" + nextSortingKey);

    }

    const handleSetBarGlyphSortingOrder = (nextOrder: string) => {
        dispatch({
            targetChart: 'bar glyph',
            type: 'set sorting order',
            order: nextOrder === 'descending' ? 'descending' : 'ascending'
        })
    }
    const handleSetBarGlyphHeightAxis = (nextAxis: string) => {
        switch (nextAxis) {
            case 'log':
                dispatch({ targetChart: 'bar glyph', type: 'set height axis', axis: 'log' });
                break;
            case 'linear':
                dispatch({ targetChart: 'bar glyph', type: 'set height axis', axis: 'linear' });
                break;
            default:
                throw new Error("invalid nextAxis: " + nextAxis);
                ;
        }
    }
    const handleUseBarGlyph = () => {
        dispatch({ targetChart: 'calendar view', type: 'change glyph type', glyphType: 'bar' })
    }
    const handleUsePieGlyph = () => {
        dispatch({ targetChart: 'calendar view', type: 'change glyph type', glyphType: 'pie' })
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
                    <select name="" id="" value={String(config.barGlyphConfig.isSharedBandWidth)}
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
                    <select name="" id="" value={config.barGlyphConfig.sortingKey} onChange={(e) => handleSetBarGlyphSortingKey(e.target.value)}>
                        {TransactionData.getColumnNames().map(columnName => <option key={columnName} value={columnName}>{columnName}</option>)}
                    </select>
                </td>
            </tr>
            <tr>
                <td>
                    barGlyph sorting order:
                </td>
                <td>
                    <select name="" id="" value={config.barGlyphConfig.isDesc ? 'descending' : 'ascending'} onChange={(e) => handleSetBarGlyphSortingOrder(e.target.value)}>
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
                    <select name="" id="" value={config.barGlyphConfig.heightAxis} onChange={(e) => handleSetBarGlyphHeightAxis(e.target.value)}>
                        <option value="log">log</option>
                        <option value="linear">linear</option>
                    </select>
                </td>
            </tr>

        </table>
    </>)
}