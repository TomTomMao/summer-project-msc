// reference the document of redux: https://react-redux.js.org/tutorials/typescript-quick-start
import { RootState } from "@/app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TransactionData } from "../../utilities/DataObject";
import { ClusterData } from "../../utilities/clusterDataObject";
import * as colourChannelSlice from "../ColourChannel/colourChannelSlice";

/**
 * key is the domain value for the colour channel
 * */
interface InteractivityState {
    // selectedTransactionNumber: TransactionData['transactionNumber'][],
    transactionDataArr: TransactionData[],
    clusterDataArr: ClusterData[],
    selectedTransactionDataIndexArr: number[], // array for easy loop through
    selectedClusterIdArr: Array<ClusterData['clusterId']>,
    selectedCategoryArr: Array<TransactionData['category']>,
    selectedFrequencyUniqueKeyArr: Array<TransactionData['frequencyUniqueKey']>
}

const initialState: InteractivityState = {
    // selectedTransactionNumber: [],
    transactionDataArr: [],
    clusterDataArr: [],
    selectedTransactionDataIndexArr: [],
    selectedClusterIdArr: [],
    selectedCategoryArr: [],
    selectedFrequencyUniqueKeyArr: []
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
        /**
         * @param action payload is an array of index,  0 <= action.payload <= transactionDataArr.length - 1
         */
        setSelectedTransactionIndexArr(state, action: PayloadAction<number[]>) {
            action.payload.forEach(index => {
                if (index < 0 || index >= state.transactionDataArr.length) {
                    throw new Error("invalid index");
                }
            })
            state.selectedTransactionDataIndexArr = action.payload
        },
        toggleClusterId(state, action: PayloadAction<ClusterData['clusterId']>) {
            if (state.selectedClusterIdArr.includes(action.payload)) {
                state.selectedClusterIdArr = state.selectedClusterIdArr.filter(item => item !== action.payload)
            } else {
                state.selectedClusterIdArr.push(action.payload)
            }
        },
        toggleCategory(state, action: PayloadAction<TransactionData['category']>) {
            if (state.selectedCategoryArr.includes(action.payload)) {
                state.selectedCategoryArr = state.selectedCategoryArr.filter(item => item !== action.payload)
            } else {
                state.selectedCategoryArr.push(action.payload)
            }
        },
        toggleFrequencyUniqueKey(state, action: PayloadAction<TransactionData['frequencyUniqueKey']>) {
            if (state.selectedFrequencyUniqueKeyArr.includes(action.payload)) {
                state.selectedFrequencyUniqueKeyArr = state.selectedFrequencyUniqueKeyArr.filter(item => item !== action.payload)
            } else {
                state.selectedFrequencyUniqueKeyArr.push(action.payload)
            }
        }
    },
});

// export the action creators
export const {
    setTransactionDataArr,
    setClusterDataArr,
    setSelectedTransactionIndexArr,
    toggleClusterId,
    toggleCategory,
    toggleFrequencyUniqueKey
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

export default interactivitySlice.reducer;
