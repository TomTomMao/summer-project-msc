// reference the document of redux: https://react-redux.js.org/tutorials/typescript-quick-start
import { RootState } from "@/app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TransactionData } from "../../utilities/DataObject";
import { ClusterData } from "../../utilities/clusterDataObject";
import * as colourChannelSlice from "../ColourChannel/colourChannelSlice";
import { createMemorisedFunction, comparingArray, comparingSet } from "../../utilities/createMemorisedFunction";
import * as clusterViewSlice from "../ClusterView/clusterViewSlice";
import * as scatterPlotSlice from "../TransactionAmountView.tsx/scatterPlotSlice";

/**
 * key is the domain value for the colour channel
 * */
interface InteractivityState {
    // selectedTransactionNumber: TransactionData['transactionNumber'][],
    transactionDataArr: TransactionData[],
    clusterDataArr: ClusterData[],
    scatterPlotSelectedTransactionNumberArr: TransactionData['transactionNumber'][], // array  for easy loop through
    clusterViewSelectedTransactionNumberArr: TransactionData['transactionNumber'][], // array for easy loop through
    selectedClusterIdArr: Array<ClusterData['clusterId']>,
    selectedCategoryArr: Array<TransactionData['category']>,
    selectedFrequencyUniqueKeyArr: Array<TransactionData['frequencyUniqueKey']>,
    currentSelector: 'clusterId' | 'category' | 'frequencyUniqueKey' | 'scatterPlot' | 'clusterView' | ''
}

export type ValidAxisLabels = "transactionAmount" | "dayOfYear" | "balance" | 'frequency';

const initialState: InteractivityState = {
    // selectedTransactionNumber: [],
    transactionDataArr: [],
    clusterDataArr: [],
    scatterPlotSelectedTransactionNumberArr: [],
    clusterViewSelectedTransactionNumberArr: [],
    selectedClusterIdArr: [],
    selectedCategoryArr: [],
    selectedFrequencyUniqueKeyArr: [],
    currentSelector: ''
};


export const interactivitySlice = createSlice({
    name: "interactivity",
    initialState,
    reducers: {
        setTransactionDataArr(state, action: PayloadAction<TransactionData[]>) {
            state.transactionDataArr = action.payload
        },
        setClusterDataArr(state, action: PayloadAction<ClusterData[]>) {
            state.selectedClusterIdArr = []
            state.clusterDataArr = action.payload
        },

        setScatterPlotSelectedTransactionNumberArr(state, action: PayloadAction<TransactionData['transactionNumber'][]>) {
            state.scatterPlotSelectedTransactionNumberArr = action.payload
            if (action.payload.length === 0) {
                state.currentSelector = ''
            } else {
                state.currentSelector = 'scatterPlot'
                state.selectedClusterIdArr = []
                state.selectedFrequencyUniqueKeyArr = []
                state.selectedCategoryArr = []
                state.clusterViewSelectedTransactionNumberArr = []
            }
        },
        setClusterViewSelectedTransactionNumberArr(state, action: PayloadAction<TransactionData['transactionNumber'][]>) {
            state.clusterViewSelectedTransactionNumberArr = action.payload
            if (action.payload.length === 0) {
                state.currentSelector = ''
            } else {
                state.currentSelector = 'clusterView'
                state.selectedClusterIdArr = []
                state.selectedFrequencyUniqueKeyArr = []
                state.selectedCategoryArr = []
                state.scatterPlotSelectedTransactionNumberArr = []
            }
        },

        toggleClusterId(state, action: PayloadAction<ClusterData['clusterId']>) {
            state.currentSelector = 'clusterId';
            state.selectedCategoryArr = []
            state.selectedFrequencyUniqueKeyArr = []
            state.clusterViewSelectedTransactionNumberArr = []
            state.scatterPlotSelectedTransactionNumberArr = []
            if (state.selectedClusterIdArr.includes(action.payload)) {
                state.selectedClusterIdArr = state.selectedClusterIdArr.filter(item => item !== action.payload)
            } else {
                if (new Set(state.clusterDataArr.map(d => d.clusterId)).size === state.selectedClusterIdArr.length + 1) {
                    state.selectedClusterIdArr = []
                    state.currentSelector = ''
                } else {
                    state.selectedClusterIdArr.push(action.payload)
                }
            }
        },
        toggleCategory(state, action: PayloadAction<TransactionData['category']>) {
            state.currentSelector = 'category';
            state.selectedClusterIdArr = []
            state.selectedFrequencyUniqueKeyArr = []
            state.clusterViewSelectedTransactionNumberArr = []
            state.scatterPlotSelectedTransactionNumberArr = []
            if (state.selectedCategoryArr.includes(action.payload)) {
                state.selectedCategoryArr = state.selectedCategoryArr.filter(item => item !== action.payload)
            } else {
                if (new Set(state.transactionDataArr.map(d => d.category)).size === state.selectedCategoryArr.length + 1) {
                    state.selectedCategoryArr = []
                    state.currentSelector = ''
                } else {
                    state.selectedCategoryArr.push(action.payload)
                }
            }
        },
        toggleFrequencyUniqueKey(state, action: PayloadAction<TransactionData['frequencyUniqueKey']>) {
            state.currentSelector = 'frequencyUniqueKey';
            state.selectedClusterIdArr = []
            state.selectedCategoryArr = []
            state.clusterViewSelectedTransactionNumberArr = []
            state.scatterPlotSelectedTransactionNumberArr = []
            if (state.selectedFrequencyUniqueKeyArr.includes(action.payload)) {
                state.selectedFrequencyUniqueKeyArr = state.selectedFrequencyUniqueKeyArr.filter(item => item !== action.payload)
            } else {
                if (new Set(state.transactionDataArr.map(d => d.frequencyUniqueKey)).size === state.selectedFrequencyUniqueKeyArr.length + 1) {
                    state.selectedFrequencyUniqueKeyArr = []
                    state.currentSelector = ''
                } else {
                    state.selectedFrequencyUniqueKeyArr.push(action.payload)
                }
            }
        },
        clearBrush(state) {
            state.currentSelector = ''
        },
        setCurrentSelector(state, action: PayloadAction<InteractivityState['currentSelector']>) {
            state.currentSelector = action.payload
        }
    },
});

// export the action creators
export const {
    setTransactionDataArr,
    setClusterDataArr,
    toggleClusterId,
    toggleCategory,
    toggleFrequencyUniqueKey,
    setScatterPlotSelectedTransactionNumberArr,
    setClusterViewSelectedTransactionNumberArr,
    clearBrush,
    setCurrentSelector
} = interactivitySlice.actions;

// export the selectors

// these three is for colour legends
export const selectSelectedClusterIdArr = (state: RootState) => {
    if (state.interactivity.selectedClusterIdArr.length === 0) {
        return colourChannelSlice.selectClusterIdColourIdDomain(state)
    } else {
        return state.interactivity.selectedClusterIdArr
    }
}
export const selectSelectedCategoryArr = (state: RootState) => {
    if (state.interactivity.selectedCategoryArr.length === 0) {
        return colourChannelSlice.selectCategoryColourDomain(state)
    } else {
        return state.interactivity.selectedCategoryArr
    }
}
export const selectSelectedFrequencyUniqueKeyArr = (state: RootState) => {
    if (state.interactivity.selectedFrequencyUniqueKeyArr.length === 0) {
        return colourChannelSlice.selectFrequencyUniqueKeyColourDomain(state)
    } else {
        return state.interactivity.selectedFrequencyUniqueKeyArr
    }
}

export const selectTransactionDataArr = (state: RootState) => {
    return state.interactivity.transactionDataArr
}
export const selectClusterDataArr = (state: RootState) => {
    return state.interactivity.clusterDataArr
}
const selectSelectedTransactionNumberSet = (state: RootState): Set<TransactionData['transactionNumber']> => {
    return new Set(selectSelectedTransactionNumberArr(state))
}
export const selectSelectedTransactionNumberSetMemorised = createMemorisedFunction(selectSelectedTransactionNumberSet, comparingSet)


/**
 * a selector that can select the selected/brushed transactionNumber, this selector will cause rerender even two array's elements are the same.
 */
export const selectSelectedTransactionNumberArr = (state: RootState) => {
    switch (state.interactivity.currentSelector) {
        case '':
            // return state.interactivity.transactionDataArr.map(transactionData => transactionData.transactionNumber)
            return []
        case 'category':
            const selectedCategorySet = new Set(state.interactivity.selectedCategoryArr)
            return state.interactivity.transactionDataArr.filter(transactionData => selectedCategorySet.has(transactionData.category))
                .map(transactionData => transactionData.transactionNumber)
        case 'clusterId':
            const selectedClusterIdSet = new Set(state.interactivity.selectedClusterIdArr)
            return state.interactivity.clusterDataArr.filter(clusterData => selectedClusterIdSet.has(clusterData.clusterId))
                .map(clusterData => clusterData.transactionNumber)
        case 'frequencyUniqueKey':
            const selectedFrequencyUniqueKeySet = new Set(state.interactivity.selectedFrequencyUniqueKeyArr)
            return state.interactivity.transactionDataArr.filter(transactionData => selectedFrequencyUniqueKeySet.has(transactionData.frequencyUniqueKey))
                .map(transactionData => transactionData.transactionNumber)
        case 'clusterView':
            return state.interactivity.clusterViewSelectedTransactionNumberArr
        // var transactionDataArr = state.interactivity.transactionDataArr
        // return state.interactivity.clusterViewSelectedTransactionDataIndexArr.map(index => transactionDataArr[index].transactionNumber)
        case 'scatterPlot':
            return state.interactivity.scatterPlotSelectedTransactionNumberArr
        // var transactionDataArr = state.interactivity.transactionDataArr
        // return state.interactivity.scatterPlotSelectedTransactionDataIndexArr.map(index => transactionDataArr[index].transactionNumber)
        default:
            const _exausthive: never = state.interactivity.currentSelector
            throw new Error("invalid currentSelector");
    }
}

/**
 * a memorised selector that can select the selected/brushed transactionNumber, it avoid rerendering if the arrrays are the same.
 */
export const selectSelectedTransactionNumberArrMemorised: (state: RootState) => TransactionData['transactionNumber'][]
    = createMemorisedFunction(selectSelectedTransactionNumberArr, comparingArray)

export const selectCurrentSelector = (state: RootState) => state.interactivity.currentSelector

export const selectCurrentSelectorColourScaleType = (state: RootState): colourChannelSlice.ValidColours => {
    const currentSelector = selectCurrentSelector(state)
    switch (currentSelector) {
        case 'category':
            return 'category'
        case "": return 'category'
        case "frequencyUniqueKey": return 'frequencyUniqueKey'
        case "clusterId": return 'cluster'
        case "scatterPlot": return scatterPlotSlice.selectColourLabel(state)
        case "clusterView": return clusterViewSlice.selectColourLabel(state)
        default:
            const _exausthiveChecking: never = currentSelector
            throw new Error("check exhastive checking");

    }
}

export default interactivitySlice.reducer;
