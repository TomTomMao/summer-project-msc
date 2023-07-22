// reference for redux: https://react-redux.js.org/tutorials/quick-start#install-redux-toolkit-and-react-redux
import { configureStore } from "@reduxjs/toolkit";
import barDayViewReducer from "@/app/dashboard/components/CalendarView3/DayViews/barDayViewSlice";
import calendarViewReducer from "@/app/dashboard/components/CalendarView3/calendarViewSlice";
export const store = configureStore({
  reducer: {
    barDayView: barDayViewReducer,
    calendarView: calendarViewReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
