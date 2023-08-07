import { RootState } from "@/app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiUrl } from "../../utilities/consts";
import { ClusterData } from "../../utilities/clusterDataObject";

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
  numberOfCluster: number;
  metric1: "transactionAmount" | "category" | "frequency";
  metric2: "transactionAmount" | "category" | "frequency";

  // for usePrepareClusterViewData
  clusterData: Array<ClusterData>;
  colour: "category" | "cluster";
  x: "transactionAmount" | "dayOfYear";
  y: "transactionAmount" | "dayOfYear";
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

  numberOfCluster: 5,
  metric1: "transactionAmount",
  metric2: "category",

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
    setClusterArguments: (
      state,
      action: PayloadAction<{
        numberOfCluster: ClusterViewState["numberOfCluster"];
        metric1: ClusterViewState["metric1"];
        metric2: ClusterViewState["metric2"];
      }>
    ) => {
      state.numberOfCluster = action.payload.numberOfCluster;
      state.metric1 = action.payload.metric1;
      state.metric2 = action.payload.metric2;
    },
    setClusterData: (state, action: PayloadAction<ClusterData[]>) => {
      state.clusterData = action.payload;
    },
  },
});

// export the action creators
export const { setMainScale, expand, fold, setClusterArguments } =
  clusterViewSlice.actions;

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
  return state.clusterView.numberOfCluster;
};

export const selectMetric1 = function (state: RootState) {
  return state.clusterView.metric1;
};

export const selectMetric2 = function (state: RootState) {
  return state.clusterView.metric2;
};

export default clusterViewSlice.reducer;

export async function getClusterData(
  numberOfCluster: ClusterViewState["numberOfCluster"],
  metric1: ClusterViewState["metric1"],
  metric2: ClusterViewState["metric2"]
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
