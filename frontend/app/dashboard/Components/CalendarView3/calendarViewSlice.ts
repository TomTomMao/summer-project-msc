// reference the document of redux: https://react-redux.js.org/tutorials/typescript-quick-start
import { RootState } from "@/app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
interface CalendarViewState {
  glyphType: "bar" | "pie";
  containerWidth: number;
  containerHeight: number;
  expandedContainerWidth: number;
  expandedContainerHeight: number;
  isExpanded: boolean;
}

const initialState: CalendarViewState = {
  glyphType: "pie",
  // container width and height refer to the cell size of each day
  containerWidth: 20,
  containerHeight: 20,
  expandedContainerWidth: 40,
  expandedContainerHeight: 40,
  isExpanded: false,
};

export const calendarViewSlice = createSlice({
  name: "calendarView",
  initialState,
  reducers: {
    setGlyphType: (
      state,
      action: PayloadAction<CalendarViewState["glyphType"]>
    ) => {
      state.glyphType = action.payload;
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
export const { setGlyphType, expand, fold } = calendarViewSlice.actions;

// export the selectors
export const selectGlyphType = (state: RootState) =>
  state.calendarView.glyphType;
export const selectIsExpand = (state: RootState) =>
  state.calendarView.isExpanded;
export const selectContainerWidth = (state: RootState) =>
  state.calendarView.containerWidth;
export const selectContainerHeight = (state: RootState) =>
  state.calendarView.containerHeight;
export const selectExpandedContainerWidth = (state: RootState) =>
  state.calendarView.expandedContainerWidth;
export const selectExpandedContainerHeight = (state: RootState) =>
  state.calendarView.expandedContainerHeight;

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

export default calendarViewSlice.reducer;
