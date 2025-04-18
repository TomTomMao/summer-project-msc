// reference the document of redux: https://react-redux.js.org/tutorials/typescript-quick-start
import { RootState } from "@/app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TransactionData } from "../../utilities/DataObject";
import { ClusterData } from "../../utilities/clusterDataObject";
import * as colourChannelSlice from "../ColourChannel/colourChannelSlice";
import { createMemorisedFunction, comparingArray, comparingSet } from "../../utilities/createMemorisedFunction";
import * as clusterViewSlice from "../ClusterView/clusterViewSlice";
import * as scatterPlotSlice from "../TransactionAmountView.tsx/scatterPlotSlice";
import { cluster, flatRollup, rollup } from "d3";

// for future filters
// interface InArrFilterConfig<Element> {
//     filterType: 'inArr',
//     filterValue: Element[]
// }

// interface GreaterAndEqualFilterConfig<Datum> {
//     filterType: 'greaterAndEqual',
//     filterValue: Datum,
// }

// interface SmallerAndEqualFilterConfig<Datum> {
//     filterType: 'smallerAndEqual',
//     filterValue: Datum
// }
// interface BooleanFilterConfig {
//     filterType: 'boolean',
//     filterValue: boolean
// }
// type DateFilterConfig = InArrFilterConfig<Date>

// interface FilterConfig {
//     /**undefined means there is no filter for this column */
//     transactionNumber: { inArrFilterConfig: InArrFilterConfig<TransactionData['transactionNumber']> | undefined }, // categorical
//     category: { inArrFilterConfig: InArrFilterConfig<TransactionData['category']> | undefined }, // categorical
//     locationCity: { inArrFilterConfig: InArrFilterConfig<TransactionData['locationCity']> | undefined }, // categorical
//     locationCountry: { inArrFilterConfig: InArrFilterConfig<TransactionData['locationCountry']> | undefined }, // categorical
//     transactionDescription: { inArrFilterConfig: InArrFilterConfig<TransactionData['transactionDescription']> | undefined }, // categorical
//     transactionType: { inArrFilterConfig: InArrFilterConfig<TransactionData['transactionType']> | undefined }, // categorical
//     frequencyUniqueKey: { inArrFilterConfig: InArrFilterConfig<TransactionData['frequencyUniqueKey']> | undefined }, // categorical
//     clusterId: { inArrFilterConfig: InArrFilterConfig<ClusterData['clusterId']> | undefined }, // categorical
//     balance: { greaterAndEqualFilterConfig: GreaterAndEqualFilterConfig<Number> | undefined, smallerAndEqualFilterConfig: SmallerAndEqualFilterConfig<Number> | undefined },
//     transactionAmount: { greaterAndEqualFilterConfig: GreaterAndEqualFilterConfig<Number> | undefined, smallerAndEqualFilterConfig: SmallerAndEqualFilterConfig<Number> | undefined },
//     frequency: { greaterAndEqualFilterConfig: GreaterAndEqualFilterConfig<Number> | undefined, smallerAndEqualFilterConfig: SmallerAndEqualFilterConfig<Number> | undefined,
//     frequencyType: 'oneTime' | 'other' | 'all'},
//     isCredit: { booleanFilterConfig: BooleanFilterConfig | undefined },
//     date: { dateFilterConfig: DateFilterConfig | undefined },
//     year: {inArrFilterConfig: InArrFilterConfig<number>}
// }

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
    currentSelector: 'clusterId' | 'category' | 'frequencyUniqueKey' | 'scatterPlot' | 'clusterView' | '' | 'oneTimeTransaction' | 'transactionDescription',
    categoryOrderArr: TransactionData['category'][],
    clusterOrderArr: Array<ClusterData['clusterId']>,
    // clickedDetailTransactionNumberArr: TransactionData['transactionNumber'][] // future feature
    currentTable: 'brushedTable' | 'glyphTable',
    // <-- New property for transaction description search term -->
    transactionDescriptionSearchTerm: string
}

const initialState: InteractivityState = {
    // selectedTransactionNumber: [],
    transactionDataArr: [],
    clusterDataArr: [],
    scatterPlotSelectedTransactionNumberArr: [],
    clusterViewSelectedTransactionNumberArr: [],
    selectedClusterIdArr: [],
    selectedCategoryArr: [],
    selectedFrequencyUniqueKeyArr: [],
    currentSelector: '',
    categoryOrderArr: [],
    clusterOrderArr: [],
    // clickedDetailTransactionNumberArr: [],//future feature
    currentTable: 'brushedTable',
    // <-- Initial value for search term -->
    transactionDescriptionSearchTerm: ""
};

export const interactivitySlice = createSlice({
    name: "interactivity",
    initialState,
    reducers: {
        setTransactionDataArr(state, action: PayloadAction<TransactionData[]>) {
            state.transactionDataArr = action.payload;
            state.categoryOrderArr = Array.from(new Set(action.payload.map(d => d.category)));
        },
        setClusterDataArr(state, action: PayloadAction<ClusterData[]>) {
            state.selectedClusterIdArr = [];
            state.clusterDataArr = action.payload;
            state.clusterOrderArr = Array.from(new Set(action.payload.map(d => d.clusterId)));
        },
        setScatterPlotSelectedTransactionNumberArr(state, action: PayloadAction<TransactionData['transactionNumber'][]>) {
            state.scatterPlotSelectedTransactionNumberArr = action.payload;
            state.transactionDescriptionSearchTerm = '';
            if (action.payload.length === 0) {
                state.currentSelector = '';
            } else {
                state.currentSelector = 'scatterPlot';
                state.selectedClusterIdArr = [];
                state.selectedFrequencyUniqueKeyArr = [];
                state.selectedCategoryArr = [];
                state.clusterViewSelectedTransactionNumberArr = [];
            }
        },
        setClusterViewSelectedTransactionNumberArr(state, action: PayloadAction<TransactionData['transactionNumber'][]>) {
            state.clusterViewSelectedTransactionNumberArr = action.payload;
            state.transactionDescriptionSearchTerm = '';
            if (action.payload.length === 0) {
                state.currentSelector = '';
            } else {
                state.currentSelector = 'clusterView';
                state.selectedClusterIdArr = [];
                state.selectedFrequencyUniqueKeyArr = [];
                state.selectedCategoryArr = [];
                state.scatterPlotSelectedTransactionNumberArr = [];
            }
        },
        toggleClusterId(state, action: PayloadAction<ClusterData['clusterId']>) {
            state.currentSelector = 'clusterId';
            state.selectedCategoryArr = [];
            state.selectedFrequencyUniqueKeyArr = [];
            state.clusterViewSelectedTransactionNumberArr = [];
            state.scatterPlotSelectedTransactionNumberArr = [];
            state.transactionDescriptionSearchTerm = '';
            if (state.selectedClusterIdArr.includes(action.payload)) {
                state.selectedClusterIdArr = state.selectedClusterIdArr.filter(item => item !== action.payload);
            } else {
                if (new Set(state.clusterDataArr.map(d => d.clusterId)).size === state.selectedClusterIdArr.length + 1) {
                    state.selectedClusterIdArr = [];
                    state.currentSelector = '';
                } else {
                    state.selectedClusterIdArr.push(action.payload);
                }
            }
        },
        toggleCategory(state, action: PayloadAction<TransactionData['category']>) {
            state.currentSelector = 'category';
            state.selectedClusterIdArr = [];
            state.selectedFrequencyUniqueKeyArr = [];
            state.clusterViewSelectedTransactionNumberArr = [];
            state.scatterPlotSelectedTransactionNumberArr = [];
            state.transactionDescriptionSearchTerm = '';
            if (state.selectedCategoryArr.includes(action.payload)) {
                state.selectedCategoryArr = state.selectedCategoryArr.filter(item => item !== action.payload);
            } else {
                if (new Set(state.transactionDataArr.map(d => d.category)).size === state.selectedCategoryArr.length + 1) {
                    state.selectedCategoryArr = [];
                    state.currentSelector = '';
                } else {
                    state.selectedCategoryArr.push(action.payload);
                }
            }
        },
        toggleFrequencyUniqueKey(state, action: PayloadAction<TransactionData['frequencyUniqueKey']>) {
            state.currentSelector = 'frequencyUniqueKey';
            state.currentTable = 'brushedTable';
            state.selectedClusterIdArr = [];
            state.selectedCategoryArr = [];
            state.clusterViewSelectedTransactionNumberArr = [];
            state.scatterPlotSelectedTransactionNumberArr = [];
            state.transactionDescriptionSearchTerm = '';
            if (state.selectedFrequencyUniqueKeyArr.includes(action.payload)) {
                state.selectedFrequencyUniqueKeyArr = state.selectedFrequencyUniqueKeyArr.filter(item => item !== action.payload);
            } else {
                if (new Set(state.transactionDataArr.map(d => d.frequencyUniqueKey)).size === state.selectedFrequencyUniqueKeyArr.length + 1) {
                    state.selectedFrequencyUniqueKeyArr = [];
                    state.currentSelector = '';
                } else {
                    state.selectedFrequencyUniqueKeyArr.push(action.payload);
                }
            }
        },
        clearBrush(state) {
            state.currentSelector = '';
        },
        setCurrentSelector(state, action: PayloadAction<InteractivityState['currentSelector']>) {
            state.currentSelector = action.payload;
            state.currentTable = 'brushedTable';
            action.payload !== 'clusterId' && (state.selectedClusterIdArr = []);
            action.payload !== 'category' && (state.selectedCategoryArr = []);
            action.payload !== 'frequencyUniqueKey' && (state.selectedFrequencyUniqueKeyArr = []);
            action.payload !== 'clusterView' && (state.clusterViewSelectedTransactionNumberArr = []);
            action.payload !== 'scatterPlot' && (state.scatterPlotSelectedTransactionNumberArr = []);
        },
        toggleShowOneTimeTransaction(state) {
            state.currentSelector = state.currentSelector === 'oneTimeTransaction' ? '' : 'oneTimeTransaction';
            state.selectedClusterIdArr = [];
            state.selectedCategoryArr = [];
            state.selectedFrequencyUniqueKeyArr = [];
            state.clusterViewSelectedTransactionNumberArr = [];
            state.scatterPlotSelectedTransactionNumberArr = [];
            state.transactionDescriptionSearchTerm = '';
        },
        setCurrentTable(state, action: PayloadAction<InteractivityState['currentTable']>) {
            state.currentTable = action.payload;
        },
        setTransactionDescriptionSearchTerm(state, action: PayloadAction<string>) {
            state.transactionDescriptionSearchTerm = action.payload;
            if (action.payload.trim() === "") {
                if (state.currentSelector === 'transactionDescription') {
                    state.currentSelector = '';
                }
            } else {
                state.currentSelector = 'transactionDescription';
                state.selectedClusterIdArr = [];
                state.selectedCategoryArr = [];
                state.selectedFrequencyUniqueKeyArr = [];
                state.clusterViewSelectedTransactionNumberArr = [];
                state.scatterPlotSelectedTransactionNumberArr = [];
            }
        }
        // only for future feature maybe:
        // toggleClickedDetailTransactionByNumber(state, action: PayloadAction<TransactionData['transactionNumber']>) {
        //     state.clickedDetailTransactionNumberArr.push(action.payload)
        // }, clearClickedDetailTransactionByNumber(state) {
        //     state.clickedDetailTransactionNumberArr = []
        // }
    },
});

export const {
    setTransactionDataArr,
    setClusterDataArr,
    toggleClusterId,
    toggleCategory,
    toggleFrequencyUniqueKey,
    setScatterPlotSelectedTransactionNumberArr,
    setClusterViewSelectedTransactionNumberArr,
    clearBrush,
    setCurrentSelector,
    toggleShowOneTimeTransaction,
    setCurrentTable,
    setTransactionDescriptionSearchTerm
} = interactivitySlice.actions;

export const selectSelectedClusterIdArr = (state: RootState) => {
    if (state.interactivity.selectedClusterIdArr.length === 0) {
        return colourChannelSlice.selectClusterIdColourIdDomain(state);
    } else {
        return state.interactivity.selectedClusterIdArr;
    }
};
export const selectSelectedCategoryArr = (state: RootState) => {
    if (state.interactivity.selectedCategoryArr.length === 0) {
        return colourChannelSlice.selectCategoryColourDomain(state);
    } else {
        return state.interactivity.selectedCategoryArr;
    }
};
export const selectSelectedFrequencyUniqueKeyArr = (state: RootState) => {
    if (state.interactivity.selectedFrequencyUniqueKeyArr.length === 0) {
        return colourChannelSlice.selectFrequencyUniqueKeyColourDomain(state);
    } else {
        return state.interactivity.selectedFrequencyUniqueKeyArr;
    }
};

export const selectTransactionDataArr = (state: RootState) => {
    return state.interactivity.transactionDataArr;
};
export const selectClusterDataArr = (state: RootState) => {
    return state.interactivity.clusterDataArr;
};
const selectSelectedTransactionNumberSet = (state: RootState): Set<TransactionData['transactionNumber']> => {
    return new Set(selectSelectedTransactionNumberArr(state));
};
export const selectSelectedTransactionNumberSetMemorised = createMemorisedFunction(selectSelectedTransactionNumberSet, comparingSet);

export const selectSelectedTransactionNumberArr = (state: RootState) => {
    switch (state.interactivity.currentSelector) {
        case '':
            return [];
        case 'category':
            const selectedCategorySet = new Set(state.interactivity.selectedCategoryArr);
            return state.interactivity.transactionDataArr
                .filter(transactionData => selectedCategorySet.has(transactionData.category))
                .map(transactionData => transactionData.transactionNumber);
        case 'clusterId':
            const selectedClusterIdSet = new Set(state.interactivity.selectedClusterIdArr);
            return state.interactivity.clusterDataArr
                .filter(clusterData => selectedClusterIdSet.has(clusterData.clusterId))
                .map(clusterData => clusterData.transactionNumber);
        case 'frequencyUniqueKey':
            const selectedFrequencyUniqueKeySet = new Set(state.interactivity.selectedFrequencyUniqueKeyArr);
            return state.interactivity.transactionDataArr
                .filter(transactionData => selectedFrequencyUniqueKeySet.has(transactionData.frequencyUniqueKey))
                .map(transactionData => transactionData.transactionNumber);
        case 'clusterView':
            return state.interactivity.clusterViewSelectedTransactionNumberArr;
        case 'scatterPlot':
            return state.interactivity.scatterPlotSelectedTransactionNumberArr;
        case 'oneTimeTransaction':
            return getOneTimeTransactionNumberArr(state.interactivity.transactionDataArr);
        case 'transactionDescription':
            const searchTerm = state.interactivity.transactionDescriptionSearchTerm.toLowerCase();
            return state.interactivity.transactionDataArr
                .filter(transactionData => transactionData.transactionDescription.toLowerCase().includes(searchTerm))
                .map(transactionData => transactionData.transactionNumber);
        default:
            const _exhaustiveCheck: never = state.interactivity.currentSelector;
            throw new Error("invalid currentSelector");
    }
};

export const selectSelectedTransactionNumberArrMemorised: (state: RootState) => TransactionData['transactionNumber'][] =
    createMemorisedFunction(selectSelectedTransactionNumberArr, comparingArray);

export const selectCurrentSelector = (state: RootState) => state.interactivity.currentSelector;

export const selectCurrentSelectorColourScaleType = (state: RootState): colourChannelSlice.ValidColours => {
    const currentSelector = selectCurrentSelector(state);
    switch (currentSelector) {
        case 'category':
            return 'category';
        case "":
            return 'category';
        case "frequencyUniqueKey":
            return 'frequencyUniqueKey';
        case "clusterId":
            return 'cluster';
        case "scatterPlot":
            return scatterPlotSlice.selectColourLabel(state);
        case "clusterView":
            return clusterViewSlice.selectColourLabel(state);
        case "oneTimeTransaction":
            return 'category';
        case "transactionDescription":
            return 'category';
        default:
            const _exhaustiveCheck: never = currentSelector;
            throw new Error("check exhaustive checking");
    }
};

export const selectGlyphDataTableColourScaleType = (state: RootState): colourChannelSlice.ValidColours =>
    state.calendarView.glyphType === 'star' ? 'cluster' : 'category';

export const selectCategoryOrderArrMemorised = (state: RootState): TransactionData['category'][] => state.interactivity.categoryOrderArr;
export const selectClusterOrderArrMemorised = (state: RootState): ClusterData['clusterId'][] => state.interactivity.clusterOrderArr;

export const selectCurrentTable = (state: RootState) => state.interactivity.currentTable;

export const selectTransactionDescriptionSearchTerm = (state: RootState) =>
    state.interactivity.transactionDescriptionSearchTerm;

export default interactivitySlice.reducer;

function getOneTimeTransactionNumberArr(transactionDataArr: TransactionData[]): Array<TransactionData['transactionNumber']> {
    const frequencyUniqueKeyAndCountArr = flatRollup(
        transactionDataArr,
        transactionDataWithSingleFrequencyUniqueKeyArr => {
            return {
                numberOfTransaction: transactionDataWithSingleFrequencyUniqueKeyArr.length,
                transactionNumber: transactionDataWithSingleFrequencyUniqueKeyArr.length === 1 ? transactionDataWithSingleFrequencyUniqueKeyArr[0].transactionNumber : '-1'
            };
        },
        transactionData => transactionData.frequencyUniqueKey
    );
    const oneTimeTransactionNumberArr = frequencyUniqueKeyAndCountArr
        .filter(frequencyUniqueKeyAndCount => frequencyUniqueKeyAndCount[1].numberOfTransaction === 1)
        .map(frequencyUniqueKeyAndCount => frequencyUniqueKeyAndCount[1].transactionNumber);
    return oneTimeTransactionNumberArr;
}
