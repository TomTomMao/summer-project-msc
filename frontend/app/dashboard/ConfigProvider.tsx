import React, { Dispatch, createContext, useReducer } from "react";
import { TransactionDataAttrs } from "./DataObject";
const initConfig: Config = {
    barGlyphConfig: {
        isSharedBandWidth: false,
        sortingKey: 'transactionAmount',
        isDesc: false,
        heightAxis: 'log'
    }
}
export const ConfigContext = createContext<Config | null>(null);
export const ConfigDispatchContext = createContext<Dispatch<BarGlyphConfigAction> | null>(null);

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

export type Config = {
    barGlyphConfig: BarGlyphConfig
}

export type Action = BarGlyphConfigAction


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
        case 'bar glyph':
            const nextBarGlyphConfig = barGlyphConfigReducer(config.barGlyphConfig, action)
            return { ...config, barGlyphConfig: nextBarGlyphConfig }
        default:
            throw new Error("undefined targetChart:", action.targetChart);
    }
}

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

