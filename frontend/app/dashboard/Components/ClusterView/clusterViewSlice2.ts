import { RootState } from "@/app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ClusterViewState {
  containerWidth: number;
  containerHeight: number;
  expandedContainerWidth: number;
  expandedContainerHeight: number;
  isExpanded: boolean;
  mainAxis: "log" | "linear";
}
const initialState: ClusterViewState = {
  containerWidth: 500,
  containerHeight: 400,
  expandedContainerWidth: 1500,
  expandedContainerHeight: 700,
  isExpanded: false,
  mainAxis: "log",
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
  },
});

// export the action creators
export const { setMainScale, expand, fold } = clusterViewSlice.actions;

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

export default clusterViewSlice.reducer;
