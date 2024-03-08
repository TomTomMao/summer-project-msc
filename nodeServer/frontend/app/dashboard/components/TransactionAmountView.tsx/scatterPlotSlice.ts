import { RootState } from "@/app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { marginExpanded, marginFolded } from "../ClusterView/clusterViewSlice";
import {
  ColourDomainData,
  isColourDomainDataEqualComparator,
  ValidColours,
} from "../ColourChannel/colourChannelSlice";
import {
  selectClusterDataArr,
  selectTransactionDataArr,
  ValidAxisLabels,
} from "../Interactivity/interactivitySlice";
import { getClusterDataMapFromArr } from "../../hooks/useClusterData";
import { ClusterData } from "../../utilities/clusterDataObject";
import { TransactionData } from "../../utilities/DataObject";
import {
  comparingArray,
  createArrayComparator,
  createMemorisedFunction,
} from "../../utilities/createMemorisedFunction";

interface ScatterPlotSlice {
  containerWidth: number;
  containerHeight: number;
  expandedContainerWidth: number;
  expandedContainerHeight: number;
  isExpanded: boolean;
  xLog: boolean;
  yLog: boolean;
  sliderXMin: number | "min";
  sliderXMax: number | "max";
  sliderYMin: number | "min";
  sliderYMax: number | "max";
  colour: ValidColours;
  x: ValidAxisLabels;
  y: ValidAxisLabels;
}
const initialState: ScatterPlotSlice = {
  containerWidth: 545.98,
  containerHeight: 350,
  expandedContainerWidth: 1350,
  expandedContainerHeight: 750,
  isExpanded: false,
  xLog: false,
  yLog: true,
  sliderXMin: "min",
  sliderXMax: "max",
  sliderYMin: "min",
  sliderYMax: "max",
  colour: "category",
  x: "dayOfYear",
  y: "transactionAmount",
};

export const scatterPlotSlice = createSlice({
  name: "scatterPlot",
  initialState,
  // redux library uses immer, so this is immutable updating.
  reducers: {
    expand: (state) => {
      state.isExpanded = true;
    },
    fold: (state) => {
      state.isExpanded = false;
    },
    setXScale: (state, action: PayloadAction<boolean>) => {
      state.xLog = action.payload;
    },
    setYScale: (state, action: PayloadAction<boolean>) => {
      state.yLog = action.payload;
    },
    setXLable: (state, action: PayloadAction<ValidAxisLabels>) => {
      state.x = action.payload;
      state.sliderXMax = "max";
      state.sliderXMin = "min";
    },
    setYLable: (state, action: PayloadAction<ValidAxisLabels>) => {
      state.y = action.payload;
      state.sliderYMax = "max";
      state.sliderYMin = "min";
    },
    setColour: (state, action: PayloadAction<ValidColours>) => {
      state.colour = action.payload;
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
  expand,
  fold,
  setXScale,
  setYScale,
  setXLable,
  setYLable,
  setColour,
  setXLog,
  setYLog,
  swap,
  setXSlider,
  setYSlider,
} = scatterPlotSlice.actions;

// export the selectors
export const selectIsExpand = (state: RootState) =>
  state.scatterPlot.isExpanded;
export const selectContainerWidth = (state: RootState) =>
  state.scatterPlot.containerWidth;
export const selectContainerHeight = (state: RootState) =>
  state.scatterPlot.containerHeight;
export const selectExpandedContainerWidth = (state: RootState) =>
  state.scatterPlot.expandedContainerWidth;
export const selectExpandedContainerHeight = (state: RootState) =>
  state.scatterPlot.expandedContainerHeight;

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

export const selectXAxisLabel = (state: RootState) => state.scatterPlot.x;
export const selectYAxisLabel = (state: RootState) => state.scatterPlot.y;
export const selectXlog = (state: RootState) => state.scatterPlot.xLog;
export const selectYlog = (state: RootState) => state.scatterPlot.yLog;
export const selectColourLabel = (state: RootState) => state.scatterPlot.colour;

export const selectMarginLeft = (state: RootState) =>
  state.scatterPlot.isExpanded ? marginExpanded.left : marginFolded.left;
export const selectMarginRight = (state: RootState) =>
  state.scatterPlot.isExpanded ? marginExpanded.right : marginFolded.right;
export const selectMarginTop = (state: RootState) =>
  state.scatterPlot.isExpanded ? marginExpanded.top : marginFolded.top;
export const selectMarginBottom = (state: RootState) =>
  state.scatterPlot.isExpanded ? marginExpanded.bottom : marginFolded.bottom;

export const selectShouldShowBrusher = (state: RootState) =>
  state.interactivity.currentSelector === "scatterPlot";

export const selectFilteredDomainMemorised = createMemorisedFunction(
  selectFilteredDomain,
  (a, b) =>
    a.filteredXDomainMax === b.filteredXDomainMax &&
    a.filteredXDomainMin === b.filteredXDomainMin &&
    a.filteredYDomainMax === b.filteredYDomainMax &&
    a.filteredYDomainMin === b.filteredYDomainMin
);

function selectFilteredDomain(state: RootState) {
  return {
    filteredXDomainMin: state.scatterPlot.sliderXMin,
    filteredXDomainMax: state.scatterPlot.sliderXMax,
    filteredYDomainMin: state.scatterPlot.sliderYMin,
    filteredYDomainMax: state.scatterPlot.sliderYMax,
  };
}

export const selectColourDomainMemorised = createMemorisedFunction(
  selectColourDomain,
  createArrayComparator(isColourDomainDataEqualComparator)
);

// data array selectors
function selectColourDomain(state: RootState): ColourDomainData[] {
  const colour = state.scatterPlot.colour;
  const transactionDataArr = selectFilteredTransactionDataArr(state);
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
  return selectFilteredTransactionDataArr(state).map(
    (transactionData) => transactionData[state.scatterPlot.x]
  );
}
/**
 *
 * @param state
 * @returns the y data for rendering
 */
export function selectYdata(state: RootState): number[] {
  return selectFilteredTransactionDataArr(state).map(
    (transactionData) => transactionData[state.scatterPlot.y]
  );
}

function selectIdArr(state: RootState): TransactionData["transactionNumber"][] {
  return selectFilteredTransactionDataArr(state).map(
    (transactionData) => transactionData["transactionNumber"]
  );
}

/**the filtered transactionDataArr for scatter view */
function selectFilteredTransactionDataArr(state: RootState) {
  const clusterViewFilteredTransactionDataArr: TransactionData[] = [];
  const transactionDataArr = selectTransactionDataArr(state);
  const { sliderXMin, sliderXMax, sliderYMin, sliderYMax } = state.scatterPlot;
  const { x, y } = state.scatterPlot;
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

export default scatterPlotSlice.reducer;
