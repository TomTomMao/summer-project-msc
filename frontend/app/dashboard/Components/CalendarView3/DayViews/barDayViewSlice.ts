// reference the document of redux: https://react-redux.js.org/tutorials/typescript-quick-start
import { TransactionDataAttrs } from "@/app/dashboard/utilities/DataObject";
import { RootState } from "@/app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BarDayViewState {
  isSharedBandWidth: boolean;
  sortingKey: TransactionDataAttrs;
  isDesc: boolean;
  heightAxis: "log" | "linear";
}

const initialState: BarDayViewState = {
  isSharedBandWidth: false,
  sortingKey: "transactionAmount",
  isDesc: true,
  heightAxis: "log",
};

export const barDayViewSlice = createSlice({
  name: "barDayView",
  initialState,
  // redux library uses immer, so this is immutable updating.
  reducers: {
    setSharedBandwidth: (state) => {
      state.isSharedBandWidth = true;
    },
    setPrivateBandWidth: (state) => {
      state.isSharedBandWidth = false;
    },
    setSortingKey: (
      state,
      action: PayloadAction<BarDayViewState["sortingKey"]>
    ) => {
      state.sortingKey = action.payload;
    },
    setDescendingOrder: (state) => {
      state.isDesc = true;
    },
    setAscendingOrder: (state) => {
      state.isDesc = false;
    },
    setHeightAxis: (
      state,
      action: PayloadAction<BarDayViewState["heightAxis"]>
    ) => {
      state.heightAxis = action.payload;
    },
  },
});

// export the action creators
export const {
  setSharedBandwidth,
  setPrivateBandWidth,
  setSortingKey,
  setDescendingOrder,
  setAscendingOrder,
  setHeightAxis,
} = barDayViewSlice.actions;

// export the selectors
export const selectBarDayView = (state: RootState) => state.barDayView;
export const selectIsSharedBandWidth = (state: RootState) =>
  state.barDayView.isSharedBandWidth;
export const selectSortingKey = (state: RootState) =>
  state.barDayView.sortingKey;
export const selectIsDesc = (state: RootState) => state.barDayView.isDesc;
export const selectHeightAxis = (state: RootState) =>
  state.barDayView.heightAxis;

export default barDayViewSlice.reducer;
