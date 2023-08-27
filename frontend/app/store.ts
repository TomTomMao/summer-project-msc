// reference for all the exports: https://react-redux.js.org/tutorials/quick-start#install-redux-toolkit-and-react-redux
import { configureStore } from "@reduxjs/toolkit";
import barDayViewReducer from "@/app/dashboard/components/CalendarView3/DayViews/barDayViewSlice";
import calendarViewReducer from "@/app/dashboard/components/CalendarView3/calendarViewSlice";
import clusterViewReducer from "./dashboard/components/ClusterView/clusterViewSlice";
import colourLegendReducer from "./dashboard/components/ColourLegend/colourLegendSlice";
import pieDayViewReducer from "./dashboard/components/CalendarView3/DayViews/pieDayViewSlice";
import polarAreaDayViewReducer from "./dashboard/components/CalendarView3/DayViews/polarAreaDayViewSlice";
import starDayViewReducer from "./dashboard/components/CalendarView3/DayViews/starDayViewSlice";
import scatterPlotReducer from "@/app/dashboard/components/TransactionAmountView.tsx/scatterPlotSlice";
import interactivityReducer from "@/app/dashboard/components/Interactivity/interactivitySlice";
import colourChannelReducer from "@/app/dashboard/components/ColourChannel/colourChannelSlice";
import popUpReducer from "@/app/dashboard/components/PopupWindow/PopupSlice";
export const store = configureStore({
  reducer: {
    barDayView: barDayViewReducer,
    pieDayView: pieDayViewReducer,
    polarAreaDayView: polarAreaDayViewReducer,
    starDayView: starDayViewReducer,
    calendarView: calendarViewReducer,
    clusterView: clusterViewReducer,
    colourLegend: colourLegendReducer,
    interactivity: interactivityReducer,
    scatterPlot: scatterPlotReducer,
    colourChannel: colourChannelReducer,
    popUp: popUpReducer,
  },
  //referenced Juuso Ohtonen's answer:  https://stackoverflow.com/questions/65217815/redux-handling-really-large-state-object
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
