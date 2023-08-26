import { TransactionData } from "@/app/dashboard/utilities/DataObject";
import { ClusterData } from "@/app/dashboard/utilities/clusterDataObject";
import * as d3 from "d3";
import { useMemo } from "react";

/**
 * prepare shared radial scale for StarGlyphs, domain determined by transactionDataArr, isSuperPositioned, and currentYear, range determinde by currentContainerHeight and currentContainerWidth
 *
 * The hook don't read any data from the store, it just use the args, it use useMemo
 * @param transactionDataArr
 * @param isSuperPositioned
 * @param currentContainerHeight
 * @param currentContainerWidth
 */
export function useStarCalendarViewSharedRadialScales(
  transactionDataArr: TransactionData[],
  clusterDataMap: Map<
    ClusterData["transactionNumber"],
    ClusterData["clusterId"]
  >,
  isSuperPositioned: boolean,
  currentContainerHeight: number,
  currentContainerWidth: number
):
  | {
      linearRadiusScale: d3.ScaleLinear<number, number>;
      logRadiusScale: d3.ScaleLogarithmic<number, number>;
    }
  | { linearRadiusScale: null; logRadiusScale: null } {
  const { minDomain, maxDomain } = useMemo(() => {
    /**based on isSuperPositioned, if is superpositioned, only get month and day, otherwise, get year, month and day */
    const dateGetter = isSuperPositioned
      ? (transactionData: TransactionData) => `${transactionData.MMDD}`
      : (transactionData: TransactionData) =>
          `${transactionData.year}-${transactionData.MMDD}`;

    const clusterIdGetter = (transactionData: TransactionData) => {
      const clusterId = clusterDataMap.get(transactionData.transactionNumber);
      if (clusterId === undefined) {
        throw new Error(
          `transaction Number ${transactionData.transactionNumber} does not exist in clusterDataMap`
        );
      } else {
        return clusterId;
      }
    };

    let minDomain: number | undefined = undefined;
    let maxDomain: number | undefined = undefined;

    // get the max number of transactionAmount of a cluster in any day (or any superpositioned day if superpositioned)
    /**['MM-DD or YYYYMMDD', 'clusterId', Total TransactionAmount] */
    const aggregatedData = d3.flatRollup(
      transactionDataArr,
      (transactionDataArr) =>
        // get the sum of transaction amount of each group
        d3.sum(
          transactionDataArr,
          (transactionData) => transactionData.transactionAmount
        ),
      dateGetter,
      clusterIdGetter
    ); // group by (year, if not superpositioned), month, day,

    [minDomain, maxDomain] = d3.extent(
      aggregatedData,
      (aggregatedDatum) => aggregatedDatum[2]
    );
    return { minDomain, maxDomain };
  }, [transactionDataArr, clusterDataMap, isSuperPositioned]);

  const scales:
    | {
        linearRadiusScale: d3.ScaleLinear<number, number>;
        logRadiusScale: d3.ScaleLogarithmic<number, number>;
      }
    | { linearRadiusScale: null; logRadiusScale: null } = useMemo(() => {
    // calculate the log and linear domain
    if (minDomain === undefined || maxDomain === undefined) {
      return { linearRadiusScale: null, logRadiusScale: null };
    }
    const maxRange =
      Math.min(currentContainerHeight, currentContainerWidth) / 2;
    return {
      linearRadiusScale: d3.scaleLinear<number, number>(
        [minDomain, maxDomain],
        [0, maxRange]
      ),
      logRadiusScale: d3.scaleLog<number, number>(
        [0.00001, maxDomain],
        [0, maxRange]
      ),
    };
  }, [minDomain, maxDomain, currentContainerHeight, currentContainerWidth]);
  return scales;
}

/**
 * Todo: try to use scaleOrdinal
 * The reason use index is just because the resource used that
 * prepare shared angle scale for StarGlyphs, which maps the index of cluster to start angle in the glyph
 * reference: https://observablehq.com/@sophiamersmann/polar-area-chart
 */
export function useStarCalendarViewSharedAngleScale(
  clusterOrderMap: Map<ClusterData["clusterId"], number>
): d3.ScaleLinear<number, number> {
  return d3
    .scaleLinear()
    .domain([0, clusterOrderMap.size])
    .range([0, 2 * Math.PI]);
}
