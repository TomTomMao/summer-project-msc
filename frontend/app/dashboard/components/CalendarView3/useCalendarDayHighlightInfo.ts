import { useAppSelector } from "@/app/hooks";
import * as interactivitySlice from "../Interactivity/interactivitySlice";
import * as calendarViewSlice from "./calendarViewSlice";
import { useMemo } from "react";
/**
 * based on transactionDataArr, selectedTransactionNumberArr, isSuperpositioned and currentYear of the calendar view, return a set like this: ''mm-dd''
 * If isSuperpositioned === true, then return an set whose elements are the ''mm-dd''format of the month and day when there is one or more transaction whose transactionNumber is in the selectedTransactionNumberSet
 * Else: return a set whose elements are the ''mm-dd''format of the month and day when there is one or more transaction whose transactionNumber is in the selectedTransactionNumberSet and whose year === currentYear
 */
export function useHighLightedCalendarDayBorderMMDDSet(): Set<string> {
  const transactionDataArr = useAppSelector(
    interactivitySlice.selectTransactionDataArr
  );
  const selectedTransactionNumberSet = useAppSelector(
    interactivitySlice.selectSelectedTransactionNumberSetMemorised
  );
  const isSuperpositioned = useAppSelector(
    calendarViewSlice.selectIsSuperPositioned
  );
  const currentYear = useAppSelector(calendarViewSlice.selectCurrentYear);

  const mmddSet = useMemo(() => {
    const mmddSet = new Set<string>();
    for (let transactionData of transactionDataArr) {
      if (selectedTransactionNumberSet.has(transactionData.transactionNumber)) {
        if (isSuperpositioned || currentYear === transactionData.year) {
          mmddSet.add(transactionData.MMDD);
        }
      }
    }
    return mmddSet;
  }, [
    transactionDataArr,
    selectedTransactionNumberSet,
    isSuperpositioned,
    currentYear,
  ]);

  return mmddSet;
}
