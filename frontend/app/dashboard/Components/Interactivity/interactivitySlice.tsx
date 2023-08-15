// reference the document of redux: https://react-redux.js.org/tutorials/typescript-quick-start
import { RootState } from "@/app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TransactionData } from "../../utilities/DataObject";
import { ClusterData } from "../../utilities/clusterDataObject";

/**
 * key is the domain value for the colour channel
 * */
interface InteractivityState {
    // selectedTransactionNumber: TransactionData['transactionNumber'][],
    transactionDataArr: TransactionData[],
    clusterDataArr: ClusterData[],
    selectedTransactionDataIndexArr: number[], // array for easy loop through
    selectedClusterIdSet: Set<ClusterData['clusterId']>,
    selectedCategorySet: Set<TransactionData['category']>,
    selectedFrequencyUniqueKeySet: Set<TransactionData['frequencyUniqueKey']>
}

const initialState: InteractivityState = {
    // selectedTransactionNumber: [],
    transactionDataArr: [],
    clusterDataArr: [],
    selectedTransactionDataIndexArr: [],
    selectedClusterIdSet: new Set(),
    selectedCategorySet: new Set(),
    selectedFrequencyUniqueKeySet: new Set()
};

export const interactivitySlice = createSlice({
    name: "interactivity",
    initialState,
    reducers: {
        setTransactionDataArr(state, action: PayloadAction<TransactionData[]>) {
            state.transactionDataArr = action.payload
        },
        setClusterDataArr(state, action: PayloadAction<ClusterData[]>) {
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
        setSelectedClusterIdSet(state, action: PayloadAction<Set<ClusterData['clusterId']> | Array<ClusterData['clusterId']>>) {
            state.selectedClusterIdSet = new Set(action.payload)
        },
        setSelectedCategorySet(state, action: PayloadAction<Set<TransactionData['category']> | Array<TransactionData['category']>>) {
            state.selectedCategorySet = new Set(action.payload)
        },
        setSelectedFrequencyUniqueKeySet(state, action: PayloadAction<Set<TransactionData['frequencyUniqueKey']> | Array<TransactionData['frequencyUniqueKey']>>) {
            state.selectedFrequencyUniqueKeySet = new Set(action.payload)
        }
    },
});

// export the action creators
export const {
    setTransactionDataArr,
    setClusterDataArr,
    setSelectedTransactionIndexArr,
    setSelectedClusterIdSet,
    setSelectedCategorySet,
    setSelectedFrequencyUniqueKeySet
} = interactivitySlice.actions;

// export the selectors
// export const selectSelectedTransansactionNumberArr = curryInferSelectedTransactionNumber()

export const selectSelectedClusterIdArr = (state: RootState) => {

}

export const selectTransactionDataArr = (state: RootState) => {
    return state.interactivity.transactionDataArr
}
export const selectClusterDataArr = (state: RootState) => {
    return state.interactivity.clusterDataArr
}

export default interactivitySlice.reducer;

// /**
//  * If the elements of the number set doesn't change, it return the same reference the last set.
//  * @returns 
//  */
// function curryInferSelectedTransactionNumber() {
//     let lastSelectedTransactionNumberSet = new Set();
//     return (state: RootState['interactivity']): Set<TransactionData['transactionNumber']> => {
        
//     }
// }