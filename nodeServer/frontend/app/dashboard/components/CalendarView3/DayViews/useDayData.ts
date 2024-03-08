import { useMemo } from "react";
import {
  Data,
  getDataFromTransactionDataMapMD,
  getDataFromTransactionDataMapYMD,
} from "../CalendarView3";

/**
 * get the data of the calendar glyph; it use useMemo
 * @param day 
 * @param month 
 * @param currentYear 
 * @param transactionDataMapYMD 
 * @param transactionDataMapMD 
 * @param isSuperPositioned 
 * @returns if isSuperPositioned=true, return the data of all the years for the given day and month; otherwise return the data of the currentYear for the given day and month
 */
export default function useCalendarDayGlyphTransactionDataArr(
  day: number,
  month: number,
  currentYear: number,
  transactionDataMapYMD: Data["transactionDataMapYMD"],
  transactionDataMapMD: Data["transactionDataMapMD"],
  isSuperPositioned: boolean
) {
  const dayData = useMemo(() => {
    if (!isSuperPositioned) {
      return getDataFromTransactionDataMapYMD(
        transactionDataMapYMD,
        day,
        month,
        currentYear
      );
    } else {
      return getDataFromTransactionDataMapMD(transactionDataMapMD, day, month);
    }
  }, [
    day,
    month,
    currentYear,
    transactionDataMapYMD,
    transactionDataMapMD,
    isSuperPositioned,
  ]);
  return dayData;
}
