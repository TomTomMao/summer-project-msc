import React, { Dispatch, createContext, useReducer } from "react";
import { TransactionDataAttrs } from "../utilities/DataObject";
const initConfig: Config = {
    barGlyphConfig: {
        isSharedBandWidth: false,
        sortingKey: 'transactionAmount',
        isDesc: true,
        heightAxis: 'log'
    },
    calendarViewConfig: {
        glyphType: 'pie',
        containerWidth: 20,
        containerHeight: 20
    }
}
export const ConfigContext = createContext<Config>(initConfig);
export const ConfigDispatchContext = createContext<Dispatch<Action> | null>(null);

type CalendarConfig = {
    glyphType: 'bar' | 'pie',
    containerWidth: number,
    containerHeight: number
}
type CalendarViewConfigAction = { targetChart: 'calendar view', type: 'change glyph type', glyphType: 'pie' | 'bar' }
function calendarViewConfigReducer(calendarConfig: CalendarConfig, action: CalendarViewConfigAction): CalendarConfig {
    switch (action.type) {
        case 'change glyph type':
            console.log('change glyph type')
            return { ...calendarConfig, glyphType: action.glyphType }
        default:
            throw new Error("undefined action type");
    }
}

type BarGlyphConfig = {
    isSharedBandWidth: boolean,
    sortingKey: TransactionDataAttrs,
    isDesc: boolean,
    heightAxis: 'log' | 'linear'
}
type BarGlyphConfigAction = { targetChart: 'bar glyph', type: 'set share bandwidth', isShare: boolean }
    | { targetChart: 'bar glyph', type: 'set sorting key', sortingKey: TransactionDataAttrs }
    | { targetChart: 'bar glyph', type: 'set sorting order', order: 'descending' | 'ascending' }
    | { targetChart: 'bar glyph', type: 'set height axis', axis: BarGlyphConfig['heightAxis'] }

function barGlyphConfigReducer(barGlyphConfig: BarGlyphConfig, action: BarGlyphConfigAction): BarGlyphConfig {
    switch (action.type) {
        case 'set share bandwidth':
            return { ...barGlyphConfig, isSharedBandWidth: action.isShare };
        case 'set height axis':
            return { ...barGlyphConfig, heightAxis: action.axis };
        case 'set sorting key':
            return { ...barGlyphConfig, sortingKey: action.sortingKey };
        case 'set sorting order':
            return { ...barGlyphConfig, isDesc: action.order === 'descending' }
        default:
            throw new Error("undefined action type");

    }
}

export type Config = {
    barGlyphConfig: BarGlyphConfig,
    calendarViewConfig: CalendarConfig
}

export type Action = BarGlyphConfigAction | CalendarViewConfigAction


export function ConfigProvider({ children }: { children: React.ReactNode }) {
    const [config, dispatch] = useReducer(configReducer, initConfig);
    return (
        <ConfigContext.Provider value={config}>
            <ConfigDispatchContext.Provider value={dispatch}>
                {children}
            </ConfigDispatchContext.Provider>
        </ConfigContext.Provider>
    )
}
function configReducer(config: Config, action: Action): Config {
    switch (action.targetChart) {
        case 'calendar view':
            const nextCalendarViewConfig = calendarViewConfigReducer(config.calendarViewConfig, action);
            return { ...config, calendarViewConfig: nextCalendarViewConfig }
        case 'bar glyph':
            const nextBarGlyphConfig = barGlyphConfigReducer(config.barGlyphConfig, action)
            return { ...config, barGlyphConfig: nextBarGlyphConfig };
        default:
            throw new Error("undefined targetChart");
    }
}