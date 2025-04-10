// reference the document of redux: https://react-redux.js.org/tutorials/typescript-quick-start
import { TransactionDataAttrs } from "@/app/dashboard/utilities/DataObject";
import { RootState } from "@/app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface BarDayViewState {
  isSharedBandWidth: boolean;
  sortingKey: TransactionDataAttrs;
  isDesc: boolean;
  heightAxis: "log" | "linear";
  maxTransactionCountOfDay: number;
  maxTransactionCountOfDaySuperpositioned: number;
}

const initialState: BarDayViewState = {
  isSharedBandWidth: true,
  sortingKey: "transactionNumber",
  isDesc: false,
  heightAxis: "log",
  maxTransactionCountOfDay: 0,
  maxTransactionCountOfDaySuperpositioned: 0,
};

export const barDayViewSlice = createSlice({
  name: "barDayView",
  initialState,
  // redux library uses immer, so this is immutable updating.
  reducers: {
    toggleHeightAxis: (state) => {
      state.heightAxis = state.heightAxis === "linear" ? "log" : "linear";
    },
    toggleShareBandwidth: (state) => {
      state.isSharedBandWidth = state.isSharedBandWidth === false;
    },
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
    setMaxTransactionCountOfDay: (state, action: PayloadAction<number>) => {
      state.maxTransactionCountOfDay = action.payload;
    },
    setMaxTransactionCountOfDaySuperpositioned: (
      state,
      action: PayloadAction<number>
    ) => {
      state.maxTransactionCountOfDaySuperpositioned = action.payload;
    },
  },
});

// export the action creators
export const {
  toggleHeightAxis,
  toggleShareBandwidth,
  setSharedBandwidth,
  setPrivateBandWidth,
  setSortingKey,
  setDescendingOrder,
  setAscendingOrder,
  setHeightAxis,
  setMaxTransactionCountOfDay,
  setMaxTransactionCountOfDaySuperpositioned,
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
export const selectMaxTransactionCountOfDay = (state: RootState) =>
  state.barDayView.maxTransactionCountOfDay;
export const selectMaxTransactionCountOfDaySuperpositioned = (
  state: RootState
) => state.barDayView.maxTransactionCountOfDaySuperpositioned;

export default barDayViewSlice.reducer;
