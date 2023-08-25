import { useMemo } from "react";
import { TransactionData } from "../../utilities/DataObject";
import {
  ScaleLinear,
  flatRollup,
  max,
  rollup,
  scaleLinear,
  scaleLog,
  sum,
} from "d3";

/**
 * prepare shared radial scale for PolarAreaGlyphs, domain determined by transactionDataArr, isSuperPositioned, and currentYear, range determinde by currentContainerHeight and currentContainerWidth
 *
 * The hook don't read any data from the store, it just use the args, it use useMemo
 * @param transactionDataArr
 * @param isSuperPositioned
 * @param currentYear
 * @param currentContainerHeight
 * @param currentContainerWidth
 */
export function usePolarAreaCalendarViewSharedRadialScales(
  transactionDataArr: TransactionData[],
  isSuperPositioned: boolean,
  currentYear: number,
  currentContainerHeight: number,
  currentContainerWidth: number
):
  | {
      linearRadiusScale: d3.ScaleLinear<number, number>;
      logRadiusScale: d3.ScaleLogarithmic<number, number>;
    }
  | {
      linearRadiusScale: null;
      logRadiusScale: null;
    } {
  const PolarAreaCalendarViewSharedYScales = useMemo(() => {
    const range = [
      0,
      currentContainerWidth > currentContainerHeight
        ? currentContainerHeight / 2
        : currentContainerWidth / 2,
    ];
    // if superpositioned, should add each day's data for all the year
    // if not superpositioned, should add each day's data for all the year
    const firstKeyGetter = isSuperPositioned
      ? (d: TransactionData) => String(d.month)
      : (d: TransactionData) => String(d.year) + String(d.month);
    /**
     * superpositioned === true: transactionAmountSumArr: [month, day, category, sumTransactionAmount]
     * superpositioned === false: transactionAmountSumArr: [month, day, category, sumTransactionAmount]
     *
     */
    const transactionAmountSumArr = flatRollup(
      transactionDataArr,
      (transactiondataArrMonthDayCategory) =>
        sum(
          transactiondataArrMonthDayCategory,
          (transactionDataOfMonthDayCategory) =>
            transactionDataOfMonthDayCategory.transactionAmount
        ),
      firstKeyGetter,
      (transactionDataArr) => String(transactionDataArr.day),
      (transactionDataArr) => String(transactionDataArr.category)
    );
    const maxTransactionAmountOfCategory = max(
      transactionAmountSumArr,
      (transactionAmountSum) => transactionAmountSum[3]
    );

    if (maxTransactionAmountOfCategory === undefined) {
      return {
        linearRadiusScale: null,
        logRadiusScale: null,
      };
    } else {
      return {
        linearRadiusScale: scaleLinear()
          .domain([0, maxTransactionAmountOfCategory])
          .range(range),
        logRadiusScale: scaleLog()
          .domain([0, maxTransactionAmountOfCategory])
          .range(range),
      };
    }
  }, [
    transactionDataArr,
    isSuperPositioned,
    currentYear,
    currentContainerHeight,
    currentContainerWidth,
  ]);
  return PolarAreaCalendarViewSharedYScales;
}

/**
 * prepare shared angle scale for PolarAreaGlyphs, which maps the index of category to start angle in the glyph
 * reference: https://observablehq.com/@sophiamersmann/polar-area-chart
 */
export function usePolarAreaCalendarViewSharedAngleScales(
  categoryOrderMap: Map<TransactionData["category"], number>
): ScaleLinear<number, number> {
  return scaleLinear()
    .domain([0, categoryOrderMap.size])
    .range([0, 2 * Math.PI]);
}
