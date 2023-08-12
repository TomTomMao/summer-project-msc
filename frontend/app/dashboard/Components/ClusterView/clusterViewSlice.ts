import { RootState } from "@/app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiUrl } from "../../utilities/consts";
import { ClusterData } from "../../utilities/clusterDataObject";

export type ValidAxisLabels = "transactionAmount" | "dayOfYear" | "balance";
export type ValidClusterMetrics =
  | "transactionAmount"
  | "category"
  | "frequency";
export type ValidColours = "category" | "cluster" | "frequency" | "frequencyUniqueKey";
type ClusterMetric = "transactionAmount" | "category" | "frequency";
type ClustererConfig = {
  metric1: ClusterMetric;
  metric2: ClusterMetric;
  numberOfCluster: number;
};
export type StringClusteringAlgorithm = 'linkage'
export type DistanceMeasure =
  | "levenshtein"
  | "damerauLevenshtein"
  | "hamming"
  | "jaroSimilarity"
  | "jaroWinklerSimilarity"
  | "MatchRatingApproach";

  export type LinkageMethod =
  | "single"
  | "complete"
  | "average"
  | "weighted"
  | "centroid"
  | "median"
  | "ward";
export type FrequencyConfig =
  | { frequencyUniqueKey: "transactionDescription" | "category" }
  | {
      frequencyUniqueKey: "clusteredTransactionDescription";
      stringClusterAlgorithm: StringClusteringAlgorithm;
      distanceMeasure: DistanceMeasure;
      linkageMethod: LinkageMethod;
      numberOfClusterForString: number;
    };

interface ClusterViewState {
  // for usePrepareClusterViewLayout
  containerWidth: number;
  containerHeight: number;
  expandedContainerWidth: number;
  expandedContainerHeight: number;
  xLog: boolean;
  yLog: boolean;
  isExpanded: boolean;
  title: string;

  // for clusterview1, wait to be discarded
  mainAxis: "log" | "linear";

  // for useClusterData
  clusterConfig: ClustererConfig;
  frequencyConfig: FrequencyConfig;

  // for usePrepareClusterViewData
  clusterData: Array<ClusterData>;
  /**colour for choose the domain of the colour channel */
  colour: ValidColours;
  x: ValidAxisLabels;
  y: ValidAxisLabels;
}
const initialState: ClusterViewState = {
  containerWidth: 500,
  containerHeight: 400,
  expandedContainerWidth: 1500,
  expandedContainerHeight: 700,
  isExpanded: false,
  xLog: false,
  yLog: false,
  title: "cluster view",

  mainAxis: "log",

  clusterConfig: {
    numberOfCluster: 5,
    metric1: "transactionAmount",
    metric2: "category",
  },

  frequencyConfig: {
    frequencyUniqueKey: "transactionDescription",
  },

  clusterData: [],
  colour: "cluster",
  x: "dayOfYear",
  y: "transactionAmount",
};

export const clusterViewSlice = createSlice({
  name: "clusterView",
  initialState,
  // redux library uses immer, so this is immutable updating.
  reducers: {
    setMainScale: (
      state,
      action: PayloadAction<ClusterViewState["mainAxis"]>
    ) => {
      state.mainAxis = action.payload;
    },
    expand: (state) => {
      state.isExpanded = true;
    },
    fold: (state) => {
      state.isExpanded = false;
    },
    setClusterArguments: (state, action: PayloadAction<ClustererConfig>) => {
      state.clusterConfig = action.payload;
    },
    setClusterData: (state, action: PayloadAction<ClusterData[]>) => {
      state.clusterData = action.payload;
    },
    setXLable: (state, action: PayloadAction<ClusterViewState["x"]>) => {
      state.x = action.payload;
    },
    setYLable: (state, action: PayloadAction<ClusterViewState["y"]>) => {
      state.y = action.payload;
    },
    setColour: (state, action: PayloadAction<ValidColours>) => {
      state.colour = action.payload;
    },
    setXScale: (state, action: PayloadAction<boolean>) => {
      state.xLog = action.payload;
    },
    setYScale: (state, action: PayloadAction<boolean>) => {
      state.yLog = action.payload;
    },
    swap: (state) => {
      const oldx = state.x;
      state.x = state.y;
      state.y = oldx;
      const oldXLog = state.xLog;
      state.xLog = state.yLog;
      state.yLog = oldXLog;
    },
    setFrequency(state, action: PayloadAction<FrequencyConfig>) {
      state.frequencyConfig = action.payload;
    },
  },
});

// export the action creators
export const {
  setMainScale,
  expand,
  fold,
  setClusterArguments,
  setClusterData,
  setXLable,
  setYLable,
  setColour,
  setXScale,
  setYScale,
  swap,
  setFrequency,
} = clusterViewSlice.actions;

// export the selectors
export const selectMainAxis = (state: RootState) => state.clusterView.mainAxis;
export const selectIsExpand = (state: RootState) =>
  state.clusterView.isExpanded;
export const selectContainerWidth = (state: RootState) =>
  state.clusterView.containerWidth;
export const selectContainerHeight = (state: RootState) =>
  state.clusterView.containerHeight;
export const selectExpandedContainerWidth = (state: RootState) =>
  state.clusterView.expandedContainerWidth;
export const selectExpandedContainerHeight = (state: RootState) =>
  state.clusterView.expandedContainerHeight;

// select the current width and height based on isExpand
export const selectCurrentContainerHeight = function (state: RootState) {
  if (selectIsExpand(state) === true) {
    return selectExpandedContainerHeight(state);
  } else {
    return selectContainerHeight(state);
  }
};
export const selectCurrentContainerWidth = function (state: RootState) {
  if (selectIsExpand(state) === true) {
    return selectExpandedContainerWidth(state);
  } else {
    return selectContainerWidth(state);
  }
};

export const selectNumberOfCluster = function (state: RootState) {
  return state.clusterView.clusterConfig.numberOfCluster;
};

export const selectMetric1 = function (state: RootState) {
  return state.clusterView.clusterConfig.metric1;
};

export const selectMetric2 = function (state: RootState) {
  return state.clusterView.clusterConfig.metric2;
};

export const selectFrequencyUniqueKey = function (state: RootState) {
  return state.clusterView.frequencyConfig.frequencyUniqueKey;
};

export const selectStringClusterAlgorithm = function (
  state: RootState
): StringClusteringAlgorithm | null {
  if (
    state.clusterView.frequencyConfig.frequencyUniqueKey ===
    "clusteredTransactionDescription"
  ) {
    return state.clusterView.frequencyConfig.stringClusterAlgorithm;
  } else {
    return null;
  }
};

export const selectDistanceMeasure = function (
  state: RootState
): DistanceMeasure | null {
  if (
    state.clusterView.frequencyConfig.frequencyUniqueKey ===
    "clusteredTransactionDescription"
  ) {
    return state.clusterView.frequencyConfig.distanceMeasure;
  } else {
    return null;
  }
};

export const selectLinkageMethod = function (state: RootState): LinkageMethod | null {
  if (
    state.clusterView.frequencyConfig.frequencyUniqueKey ===
    "clusteredTransactionDescription"
  ) {
    return state.clusterView.frequencyConfig.linkageMethod;
  } else {
    return null;
  }
};

export const selectNumberOfClusterForString = function (
  state: RootState
): number | null {
  if (
    state.clusterView.frequencyConfig.frequencyUniqueKey ===
    "clusteredTransactionDescription"
  ) {
    return state.clusterView.frequencyConfig.numberOfClusterForString;
  } else {
    return null;
  }
};

export default clusterViewSlice.reducer;

export async function getClusterData(
  numberOfCluster: ClusterViewState["clusterConfig"]["numberOfCluster"],
  metric1: ClusterViewState["clusterConfig"]["metric1"],
  metric2: ClusterViewState["clusterConfig"]["metric2"]
) {
  const url =
    apiUrl +
    `/transactionData/kmean?numberOfCluster=${numberOfCluster}&metric1=${metric1}&metric2=${metric2}`;
  const response = await fetch(url);
  if (response.status === 200) {
    const fetchedData = await response.json();
    const transactionNumbers: string[] =
      Object.getOwnPropertyNames(fetchedData);
    const clusterData: ClusterData[] = transactionNumbers.map(
      (transactionNumber) => {
        return {
          transactionNumber: transactionNumber,
          clusterId: String(fetchedData[transactionNumber]["cluster"]),
        };
      }
    );
    return clusterData;
  } else {
    throw new Error("invalid url:" + url);
  }
}
