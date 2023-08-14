import { RootState } from "@/app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ScatterPlotSlice {
  containerWidth: number;
  containerHeight: number;
  expandedContainerWidth: number;
  expandedContainerHeight: number;
  isExpanded: boolean;
  mainAxis: "log" | "linear";
}
const initialState: ScatterPlotSlice = {
  containerWidth: 500,
  containerHeight: 400,
  expandedContainerWidth: 1500,
  expandedContainerHeight: 700,
  isExpanded: false,
  mainAxis: "log",
};

export const scatterPlotSlice = createSlice({
  name: "scatterPlot",
  initialState,
  // redux library uses immer, so this is immutable updating.
  reducers: {
    setMainScale: (
      state,
      action: PayloadAction<ScatterPlotSlice["mainAxis"]>
    ) => {
      state.mainAxis = action.payload;
    },
    expand: (state) => {
      state.isExpanded = true;
    },
    fold: (state) => {
      state.isExpanded = false;
    },
  },
});

// export the action creators
export const { setMainScale, expand, fold } = scatterPlotSlice.actions;

// export the selectors
export const selectMainAxis = (state: RootState) => state.scatterPlot.mainAxis;
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

export default scatterPlotSlice.reducer;
