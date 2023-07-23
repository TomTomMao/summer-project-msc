// reference the document of redux: https://react-redux.js.org/tutorials/typescript-quick-start
import { RootState } from "@/app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PieDayViewState {
  radiusAxis: "log" | "linear" | "constant";
}

const initialState: PieDayViewState = {
  radiusAxis: "log",
};

export const pierDayViewSlice = createSlice({
  name: "pieDayView",
  initialState,
  // redux library uses immer, so this is immutable updating.
  reducers: {
    setRadiusAxis: (
      state,
      action: PayloadAction<PieDayViewState["radiusAxis"]>
    ) => {
      state.radiusAxis = action.payload;
    },
  },
});

// export the action creators
export const { setRadiusAxis } = pierDayViewSlice.actions;

// export the selectors
export const selectRadiusAxis = (state: RootState) =>
  state.pieDayView.radiusAxis;

export default pierDayViewSlice.reducer;
