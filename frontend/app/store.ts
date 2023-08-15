// reference for all the exports: https://react-redux.js.org/tutorials/quick-start#install-redux-toolkit-and-react-redux
import { configureStore } from "@reduxjs/toolkit";
import barDayViewReducer from "@/app/dashboard/components/CalendarView3/DayViews/barDayViewSlice";
import calendarViewReducer from "@/app/dashboard/components/CalendarView3/calendarViewSlice";
import clusterViewReducer from "./dashboard/components/ClusterView/clusterViewSlice";
import colourLegendReducer from "./dashboard/components/ColourLegend/colourLegendSlice";
import pieDayViewReducer from "./dashboard/components/CalendarView3/DayViews/pieDayViewSlice";
import scatterPlotReducer from "@/app/dashboard/components/ScatterPlot/scatterPlotSlice";
import interactivityReducer from "@/app/dashboard/components/Interactivity/interactivitySlice";
export const store = configureStore({
  reducer: {
    barDayView: barDayViewReducer,
    pieDayView: pieDayViewReducer,
    calendarView: calendarViewReducer,
    clusterView: clusterViewReducer,
    colourLegend: colourLegendReducer,
    scatterPlot: scatterPlotReducer,
    interactivity: interactivityReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
