import { RootState } from "@/app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiUrl } from "../../utilities/consts";
import { ClusterData } from "../../utilities/clusterDataObject";
import {
  selectClusterDataArr,
  selectTransactionDataArr,
  ValidAxisLabels,
} from "../Interactivity/interactivitySlice";
import { getClusterDataMapFromArr } from "../../hooks/useClusterData";
import {
  comparingArray,
  createMemorisedFunction,
} from "../../utilities/createMemorisedFunction";
import { TransactionData } from "../../utilities/DataObject";
import {
  ColourDomainData,
  ValidColours,
} from "../ColourChannel/colourChannelSlice";

export const marginExpanded = { left: 70, top: 20, right: 10, bottom: 30 };
export const marginFolded = { left: 70, top: 20, right: 10, bottom: 30 };

export type ValidClusterMetrics =
  | "transactionAmount"
  | "category"
  | "frequency";

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

export interface ClusterViewState {
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

  sliderXMin: number | "min";
  sliderXMax: number | "max";
  sliderYMin: number | "min";
  sliderYMax: number | "max";
}
const initialState: ClusterViewState = {
  containerWidth: 545.98,
  containerHeight: 350,
  expandedContainerWidth: 1400,
  expandedContainerHeight: 750,
  isExpanded: false,
  xLog: false,
  yLog: false,
  title: "",

  mainAxis: "log",

  clusterConfig: {
    numberOfCluster: 5,
    metric1: "transactionAmount",
    metric2: "frequency",
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
  y: "frequency",

  justChangedSize: false,
  sliderXMin: "min",
  sliderXMax: "max",
  sliderYMin: "min",
  sliderYMax: "max",
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
      state.sliderXMax = "max";
      state.sliderXMin = "min";
    },
    setYLable: (state, action: PayloadAction<ClusterViewState["y"]>) => {
      state.y = action.payload;
      state.sliderYMax = "max";
      state.sliderYMin = "min";
    },
    setColour: (state, action: PayloadAction<ValidColours>) => {
      state.colour = action.payload;
    },
    toggleXLog:(state) => {
      state.xLog = !state.xLog
    },
    toggleYLog:(state) => {
      state.yLog = !state.yLog
    },
    setXLog: (state, action: PayloadAction<boolean>) => {
      state.xLog = action.payload;
    },
    setYLog: (state, action: PayloadAction<boolean>) => {
      state.yLog = action.payload;
    },
    swap: (state) => {
      const oldx = state.x;
      state.x = state.y;
      state.y = oldx;
      const oldXLog = state.xLog;
      state.xLog = state.yLog;
      state.yLog = oldXLog;

      // swaping the slider info
      const sliderXMaxTemp = state.sliderXMax;
      const sliderXMinTemp = state.sliderXMin;
      state.sliderXMax = state.sliderYMax;
      state.sliderXMin = state.sliderYMin;
      state.sliderYMax = sliderXMaxTemp;
      state.sliderYMin = sliderXMinTemp;
    },
    setFrequency(state, action: PayloadAction<FrequencyConfig>) {
      state.frequencyConfig = action.payload;
    },
    removeJustChangedSize(state) {
      state.justChangedSize = false;
    },
    setXSlider(state, action: PayloadAction<[number, number]>) {
      state.sliderXMin = action.payload[0];
      state.sliderXMax = action.payload[1];
    },
    setYSlider(state, action: PayloadAction<[number, number]>) {
      state.sliderYMin = action.payload[0];
      state.sliderYMax = action.payload[1];
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
  setXLog,
  toggleXLog,
  setYLog,
  toggleYLog,
  swap,
  setFrequency,
  removeJustChangedSize,
  setXSlider,
  setYSlider,
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

export function selectColourDomain(state: RootState): ColourDomainData[] {
  const colour = state.clusterView.colour;
  const transactionDataArr = selectClusterViewFilteredTransactionDataArr(state);
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
export function selectXdata(state: RootState): number[] {
  return selectClusterViewFilteredTransactionDataArr(state).map(
    (transactionData) => transactionData[state.clusterView.x]
  );
}
/**
 *
 * @param state
 * @returns the y data for rendering
 */
export function selectYdata(state: RootState): number[] {
  return selectClusterViewFilteredTransactionDataArr(state).map(
    (transactionData) => transactionData[state.clusterView.y]
  );
}

function selectIdArr(state: RootState): TransactionData["transactionNumber"][] {
  return selectClusterViewFilteredTransactionDataArr(state).map(
    (transactionData) => transactionData["transactionNumber"]
  );
}

/**the filtered transactionDataArr for cluster view */
function selectClusterViewFilteredTransactionDataArr(state: RootState) {
  const clusterViewFilteredTransactionDataArr: TransactionData[] = [];
  const transactionDataArr = selectTransactionDataArr(state);
  const { sliderXMin, sliderXMax, sliderYMin, sliderYMax } = state.clusterView;
  const { x, y } = state.clusterView;
  transactionDataArr.forEach((transactionData) => {
    const xData = transactionData[x];
    const yData = transactionData[y];
    const xMinTrue = sliderXMin === "min" || xData >= sliderXMin;
    const xMaxTrue = sliderXMax === "max" || xData <= sliderXMax;
    const yMinTrue = sliderYMin === "min" || yData >= sliderYMin;
    const yMaxTrue = sliderYMax === "max" || yData <= sliderYMax;
    if (xMinTrue && xMaxTrue && yMinTrue && yMaxTrue) {
      clusterViewFilteredTransactionDataArr.push(transactionData);
    }
  });
  return clusterViewFilteredTransactionDataArr;
}

export const selectIdArrMemorised = createMemorisedFunction(
  selectIdArr,
  comparingArray
);

export const selectXdataMemorised = createMemorisedFunction(
  selectXdata,
  comparingArray
);

export const selectYdataMemorised = createMemorisedFunction(
  selectYdata,
  comparingArray
);

export const selectXAxisLabel = (state: RootState) => state.clusterView.x;
export const selectYAxisLabel = (state: RootState) => state.clusterView.y;
export const selectXlog = (state: RootState) => state.clusterView.xLog;
export const selectYlog = (state: RootState) => state.clusterView.yLog;
export const selectColourLabel = (state: RootState) => state.clusterView.colour;

export const selectMarginLeft = (state: RootState) =>
  state.clusterView.isExpanded ? marginExpanded.left : marginFolded.left;
export const selectMarginRight = (state: RootState) =>
  state.clusterView.isExpanded ? marginExpanded.right : marginFolded.right;
export const selectMarginTop = (state: RootState) =>
  state.clusterView.isExpanded ? marginExpanded.top : marginFolded.top;
export const selectMarginBottom = (state: RootState) =>
  state.clusterView.isExpanded ? marginExpanded.bottom : marginFolded.bottom;

export const selectShouldShowClusterViewBrusher = (state: RootState) =>
  state.interactivity.currentSelector === "clusterView";

export const selectFilteredDomain = (state: RootState) => {
  return {
    filteredXDomainMin: state.clusterView.sliderXMin,
    filteredXDomainMax: state.clusterView.sliderXMax,
    filteredYDomainMin: state.clusterView.sliderYMin,
    filteredYDomainMax: state.clusterView.sliderYMax,
  };
};

export default clusterViewSlice.reducer;