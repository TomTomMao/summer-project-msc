import { RootState } from "@/app/store";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface PolarAreaDayViewState {
  radiusAxis: "logGlobal" | "linearGlobal" | "logLocal" | "linearLocal";
}

const initialState: PolarAreaDayViewState = {
  radiusAxis: "linearLocal",
};

export const polarAreaDayViewSlice = createSlice({
  name: "polarAreaDayView",
  initialState,
  // redux library uses immer, so this is immutable updating.
  reducers: {
    setRadiusAxis: (
      state,
      action: PayloadAction<PolarAreaDayViewState["radiusAxis"]>
    ) => {
      state.radiusAxis = action.payload;
    },
  },
});

export const selectRadiusAxis = (state: RootState) =>
  state.polarAreaDayView.radiusAxis;

export default polarAreaDayViewSlice.reducer