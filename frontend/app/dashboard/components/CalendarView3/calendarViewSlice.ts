// reference the document of redux: https://react-redux.js.org/tutorials/typescript-quick-start
import { RootState } from "@/app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Day } from "./CalendarView3";
const MAX_YEAR = 2022;
const MIN_YEAR = 2015;

export interface CalendarViewState {
  glyphType: "bar" | "pie" | "polarArea" | "star";
  containerWidth: number;
  containerHeight: number;
  expandedContainerWidth: number;
  expandedContainerHeight: number;
  isExpanded: boolean;
  detailDay: Day | null;
  currentYear: number;
  isSuperPositioned: boolean;
  tooltipContentArr: TooltipContent[];
}
type TooltipContent = { content: string; colour: string };
export const createTooltipContent = (content: string, colour: string) => {
  return { content, colour };
};

const initialState: CalendarViewState = {
  glyphType: "polarArea",
  // container width and height refer to the cell size of each day
  containerWidth: 25,
  containerHeight: 25,
  expandedContainerWidth: 45,
  expandedContainerHeight: 45,
  isExpanded: false,
  detailDay: null,
  currentYear: 2016,
  isSuperPositioned: false,
  tooltipContentArr: [
    createTooltipContent("1: 100", "blue"),
    createTooltipContent("2: 200", "green"),
  ],
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
    setDetailDay: (state, action: PayloadAction<Day>) => {
      state.detailDay = action.payload;
    },
    clearDetailDay: (state) => {
      state.detailDay = null;
    },
    increaseCurrentYear: (state) => {
      if (
        typeof state.currentYear === "number" &&
        state.currentYear < MAX_YEAR
      ) {
        state.currentYear = state.currentYear + 1;
      }
    },
    decreaseCurrentYear: (state) => {
      if (
        typeof state.currentYear === "number" &&
        state.currentYear > MIN_YEAR
      ) {
        state.currentYear = state.currentYear + 1;
      }
    },
    changeCurrentYear: (state, action: PayloadAction<number>) => {
      if (action.payload >= 2015 && action.payload <= 2022) {
        state.currentYear = action.payload;
      }
    },
    enableSuperPosition: (state) => {
      state.isSuperPositioned = true;
    },
    disableSuperPosition: (state) => {
      state.isSuperPositioned = false;
    },
    setTooltipContentArr: (state, action: PayloadAction<TooltipContent[]>) => {
      state.tooltipContentArr = action.payload;
    },
  },
});

// export the action creators
export const {
  setGlyphType,
  expand,
  fold,
  setDetailDay,
  clearDetailDay,
  increaseCurrentYear,
  decreaseCurrentYear,
  enableSuperPosition,
  disableSuperPosition,
  changeCurrentYear,
  setTooltipContentArr
} = calendarViewSlice.actions;

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
export const selectDetailDay = (state: RootState): null | Day =>
  state.calendarView.detailDay;
export const selectCurrentYear = (state: RootState): number =>
  state.calendarView.currentYear;
export const selectIsSuperPositioned = (state: RootState): boolean =>
  state.calendarView.isSuperPositioned;

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
export const selectTooltipContentArr = (state: RootState) =>
  state.calendarView.tooltipContentArr;
export default calendarViewSlice.reducer;
