import { RootState } from "@/app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiUrl } from "../../utilities/consts";
import { ClusterData } from "../../utilities/clusterDataObject";
import {
  selectClusterDataArr,
  selectTransactionDataArr,
} from "../Interactivity/interactivitySlice";
import { getClusterDataMapFromArr } from "../../hooks/useClusterData";

export type ValidAxisLabels = "transactionAmount" | "dayOfYear" | "balance";
export type ValidClusterMetrics =
  | "transactionAmount"
  | "category"
  | "frequency";
export type ValidColours = "category" | "cluster" | "frequencyUniqueKey";
type ClusterMetric = "transactionAmount" | "category" | "frequency";
type ClustererConfig = {
  metric1: ClusterMetric;
  metric2: ClusterMetric;
  numberOfCluster: number;
};
export type StringClusteringAlgorithm = "linkage";
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
export type FrequencyConfig = {
  frequencyUniqueKey:
    | "transactionDescription"
    | "category"
    | "clusteredTransactionDescription";
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
  justChangedSize: boolean;

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
  containerWidth: 545.98,
  containerHeight: 350,
  expandedContainerWidth: 1500,
  expandedContainerHeight: 700,
  isExpanded: false,
  xLog: false,
  yLog: false,
  title: "",

  mainAxis: "log",

  clusterConfig: {
    numberOfCluster: 5,
    metric1: "transactionAmount",
    metric2: "category",
  },

  frequencyConfig: {
    frequencyUniqueKey: "clusteredTransactionDescription",
    stringClusterAlgorithm: "linkage",
    distanceMeasure: "levenshtein",
    linkageMethod: "ward",
    numberOfClusterForString: 250,
  },

  clusterData: [],
  colour: "cluster",
  x: "dayOfYear",
  y: "transactionAmount",

  justChangedSize: false,
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
      state.justChangedSize = true;
    },
    fold: (state) => {
      state.isExpanded = false;
      state.justChangedSize = true;
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
    removeJustChangedSize(state) {
      state.justChangedSize = false;
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
  removeJustChangedSize,
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
): DistanceMeasure {
  return state.clusterView.frequencyConfig.distanceMeasure;
};

export const selectLinkageMethod = function (state: RootState): LinkageMethod {
  return state.clusterView.frequencyConfig.linkageMethod;
};

export const selectNumberOfClusterForString = function (
  state: RootState
): number {
  return state.clusterView.frequencyConfig.numberOfClusterForString;
};
export const selectJustChangedSize = function (state: RootState) {
  return state.clusterView.justChangedSize;
};

export function selectColourDomain(state: RootState): {
  domain: string;
  transactionNumber: string;
}[] {
  const colour = state.clusterView.colour;
  const transactionDataArr = selectTransactionDataArr(state);
  const clusterDataArr = selectClusterDataArr(state);
  const clusterDataMap = getClusterDataMapFromArr(clusterDataArr);
  switch (colour) {
    case "category":
      return transactionDataArr.map((d) => ({
        domain: d.category,
        transactionNumber: d.transactionNumber,
      }));
    case "frequencyUniqueKey":
      return transactionDataArr.map((d) => ({
        domain: d.frequencyUniqueKey,
        transactionNumber: d.transactionNumber,
      }));
    case "cluster":
      return transactionDataArr.map((d) => ({
        domain: clusterDataMap.get(
          d.transactionNumber
        ) as ClusterData["clusterId"],
        transactionNumber: d.transactionNumber,
      }));
    default:
      const _exhaustiveCheck: never = colour; // incase add new key, this place will automatically highlighted.
      throw new Error("This should not happen");
  }
}

/**
 * 
 * @param state 
 * @returns the x data for rendering
 */
export function selectXdata(state:RootState):number[] {
  return selectTransactionDataArr(state).map(transactionData => transactionData[state.clusterView.x])
}
/**
 * 
 * @param state 
 * @returns the y data for rendering
 */
export function selectYdata(state:RootState):number[] {
  return selectTransactionDataArr(state).map(transactionData => transactionData[state.clusterView.y])
}

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
