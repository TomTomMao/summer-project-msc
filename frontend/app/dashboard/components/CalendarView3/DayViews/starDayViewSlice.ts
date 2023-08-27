import { RootState } from "@/app/store";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";

export interface StarDayViewState {
  radiusAxis: "logGlobal" | "linearGlobal" | "logLocal" | "linearLocal";
}

const initialState: StarDayViewState = {
  radiusAxis: "linearLocal",
};

export const starDayViewSlice = createSlice({
  name: "starDayView",
  initialState,
  // redux library uses immer, so this is immutable updating.
  reducers: {
    setRadiusAxis: (
      state,
      action: PayloadAction<StarDayViewState["radiusAxis"]>
    ) => {
      state.radiusAxis = action.payload;
    },
  },
});
export const {setRadiusAxis} = starDayViewSlice.actions
export const selectRadiusAxis = (state: RootState) =>
  state.starDayView.radiusAxis;

export default starDayViewSlice.reducer