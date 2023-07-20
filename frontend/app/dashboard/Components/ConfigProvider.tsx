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
        // container width and height refer to the cell size of each day 
        containerWidth: 20,
        containerHeight: 20,
        expandedContainerWidth: 40,
        expandedContainerHeight: 40,
        isExpanded: false,
    },
    clusterViewConfig: {
        containerWidth: 650,
        containerHeight: 500,
        expandedContainerWidth: 1500,
        expandedContainerHeight: 700,
        isExpanded: false,
        mainScale: 'log'
    }
}
export const ConfigContext = createContext<Config>(initConfig);
export const ConfigDispatchContext = createContext<Dispatch<Action> | null>(null);

type CalendarConfig = {
    glyphType: 'bar' | 'pie',
    containerWidth: number,
    containerHeight: number,
    expandedContainerWidth: number,
    expandedContainerHeight: number,
    isExpanded: boolean
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

type ClusterViewConfig = {
    containerWidth: number,
    containerHeight: number,
    expandedContainerWidth: number,
    expandedContainerHeight: number,
    isExpanded: boolean,
    mainScale: 'log' | 'linear'
}

type ClusterViewAction = {
    targetChart: 'cluster view',
    type: 'set main scale',
    newMainScale: ClusterViewConfig['mainScale']
} | {
    targetChart: 'cluster view',
    type: 'set container width',
    newContainerWidth: number
} | {
    targetChart: 'cluster view',
    type: 'set container height',
    newContainerHeight: number
} | {
    targetChart: 'cluster view',
    type: 'set container size',
    newContainerWidth: number,
    newContainerHeight: number
}

function clusterViewConfigReducer(clusterViewConfig: ClusterViewConfig, action: ClusterViewAction): ClusterViewConfig {
    switch (action.type) {
        case 'set main scale':
            return { ...clusterViewConfig, mainScale: action.newMainScale };
        // todo add other cases
        default:
            throw new Error('undefined action type')
    }
}

export type Config = {
    barGlyphConfig: BarGlyphConfig,
    calendarViewConfig: CalendarConfig,
    clusterViewConfig: ClusterViewConfig
}

export type DashBoardAction =
    /**expand one chart */
    {
        targetChart: 'dashboard',
        type: 'expand',
        chartToExpand: 'calendar view' | 'cluster view'
    } | {
        targetChart: 'dashboard',
        type: 'fold',
        chartToExpand: 'calendar view' | 'cluster view'
    }
// todo DRY is code
function dashboardReducer(config: Config, action: DashBoardAction): Config {
    switch (action.type) {
        case 'expand':
            if (action.chartToExpand === 'calendar view') {
                const nextConfig = { ...config, calendarViewConfig: { ...config.calendarViewConfig, isExpanded: true } }
                return nextConfig;
            } else {
                const nextConfig = { ...config, clusterViewConfig: { ...config.clusterViewConfig, isExpanded: true } }
                return nextConfig
            }
        case 'fold':
            if (action.chartToExpand === 'calendar view') {
                const nextConfig = { ...config, calendarViewConfig: { ...config.calendarViewConfig, isExpanded: false } }
                return nextConfig;
            } else {
                const nextConfig = { ...config, clusterViewConfig: { ...config.clusterViewConfig, isExpanded: false } }
                return nextConfig
            }
        default:
            throw new Error("invalid action type");
    }
}
export type Action = BarGlyphConfigAction | CalendarViewConfigAction | ClusterViewAction | DashBoardAction

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
        case 'cluster view':
            const nextClusterViewConfig = clusterViewConfigReducer(config.clusterViewConfig, action);
            return { ...config, clusterViewConfig: nextClusterViewConfig };
        case 'dashboard':
            const nextConfig = dashboardReducer(config, action);
            console.log('dispatching dashboard', nextConfig)
            return nextConfig;
        default:
            throw new Error("undefined targetChart");
    }
}