import * as colourChannelSlice from "@/app/dashboard/components/ColourChannel/colourChannelSlice";
import { useAppSelector } from "@/app/hooks";
import * as d3 from "d3";
import { useMemo } from "react";
import * as interactivitySlice from "../components/Interactivity/interactivitySlice";
import { TransactionData } from "../utilities/DataObject";
import { GRAY1 } from "../utilities/consts";

const HIERARCHICALCATEGORYCOLOURMAPPING = [
  ["Savings", "rgb(245, 245, 115)"],
  ["Groceries", "rgb(184, 236, 184)"],
  ["Others", "rgb(133, 160, 221)"],
  ["unknown", "rgb(95, 126, 198)"],
  ["Entertainment", "rgb(140, 220, 140)"],
  ["Services", "rgb(64, 97, 173)"],
  ["Amazon", "rgb(92, 196, 92)"],
  ["Investment", "rgb(255, 198, 198)"],
  ["Supplementary Income", "rgb(255, 163, 163)"],
  ["Dine Out", "rgb(57, 169, 57)"],
  ["Travel", "rgb(31, 145, 31)"],
  ["Bills", "rgb(211, 211, 71)"],
  ["Other Shopping", "rgb(38, 74, 156)"],
  ["Cash", "rgb(181, 181, 38)"],
  ["Home Improvement", "rgb(255, 225, 164)"],
  ["Hotels", "rgb(255, 207, 112)"],
  ["Travel Reimbursement", "rgb(245, 115, 115)"],
  ["Safety Deposit Return", "rgb(211, 71, 71)"],
  ["Interest", "rgb(181, 38, 38)"],
  ["Fitness", "rgb(10, 115, 10)"],
  ["Paycheck", "rgb(143, 13, 13)"],
  ["Food Shopping", "rgb(0, 85, 0)"],
  ["Clothes", "rgb(0, 52, 0)"],
  ["Services/Home Improvement", "rgb(255, 170, 0)"],
  ["Account transfer", "rgb(143, 143, 13)"],
  ["Mortgage", "rgb(217, 145, 0)"],
  ["Insurance", "rgb(187, 128, 220)"],
  ["Rent", "rgb(167, 111, 0)"],
  ["Purchase of uk.eg.org", "rgb(106, 0, 0)"],
  ["Groceries ", "rgb(184, 236, 184)"],
  ["Health", "rgb(132, 58, 173)"],
];

/**
 * read only scale with transactionNumber, it has the knowledge of interactivitySlice.selectSelectedTransactionNumberArrMemorised selected from the redux store. it use d3.scaleOrdinal
 * given a domain value, if it is not in the selectedTransactionNumberArrMemorised, then it will return the colour using d3.scaleOrdinal, otherwise it will returns gray colour
 */
export type ScaleOrdinalWithTransactionNumber = {
  getColour: (
    valueForColour: string,
    transactionNumber?: TransactionData["transactionNumber"]
  ) => string;
  domain: () => string[];
  range: () => string[];
};

export function useClusterIdColourScale() {
  const domain = useAppSelector(
    colourChannelSlice.selectClusterIdColourIdDomain
  );
  const scheme = useAppSelector(colourChannelSlice.selectClusterIdColourScheme);
  const colourScale = useColourScale(domain, scheme);
  return colourScale;
}

export function useCategoryColourScale() {
  const domain = useAppSelector(colourChannelSlice.selectCategoryColourDomain);
  const scheme = useAppSelector(colourChannelSlice.selectCategoryColourScheme);
  const colourScale = useColourScale(domain, scheme);
  return colourScale;
}

export function useHierarchicalCategoryColourScale() {
  const selectedTransactionNumberArr = useAppSelector(
    interactivitySlice.selectSelectedTransactionNumberArrMemorised
  );

  const colourMapping = useMemo(() => {
    // Convert the mapping array to a Map for efficient lookup
    return new Map<string, string>(HIERARCHICALCATEGORYCOLOURMAPPING);
  }, []);

  const colourScaleWithTransactionNumber: ScaleOrdinalWithTransactionNumber =
    useMemo(() => {
      const selectedTransactionNumberSet = new Set(
        selectedTransactionNumberArr
      );

      const getColour = function (
        valueForColour: string,
        transactionNumber?: TransactionData["transactionNumber"]
      ): string {
        // Get the color from the mapping
        const colour = colourMapping.get(valueForColour) || GRAY1;

        // Return gray if the transaction number is not in the selected set
        if (
          selectedTransactionNumberSet.size > 0 &&
          transactionNumber !== undefined &&
          !selectedTransactionNumberSet.has(transactionNumber)
        ) {
          return GRAY1;
        }

        return colour;
      };

      return {
        getColour,
        domain: () => Array.from(colourMapping.keys()),
        range: () => Array.from(colourMapping.values()),
      };
    }, [colourMapping, selectedTransactionNumberArr]);

  return colourScaleWithTransactionNumber;
}


export function useFrequencyUniqueKeyColourScale() {
  const domain = useAppSelector(
    colourChannelSlice.selectFrequencyUniqueKeyColourDomain
  );
  const scheme = useAppSelector(
    colourChannelSlice.selectFrequencyUniqueKeyColourScheme
  );
  const colourScale = useColourScale(domain, scheme);
  return colourScale;
}

/**
 * just encapsulate the colourScale = useMemo(()=>{...},[colourDomain,colourScheme])
 * create a colourscale for the given domain and scheme
 * // reference: https://github.com/d3/d3-interpolate
 * @param colourDomain
 * @param colourScheme
 * @returns
 */
function useColourScale(
  colourDomain: string[],
  colourScheme: colourChannelSlice.ColourScheme
) {
  if (colourDomain.hasOwnProperty("length") === false) {
    throw new Error("colourDomain does not has length");
  }
  const selectedTransactionNumberArr = useAppSelector(
    interactivitySlice.selectSelectedTransactionNumberArrMemorised
  );

  const colourScale = useMemo(() => {
    let interpolateFunction: (t: number) => string;
    switch (colourScheme) {
      case "PiYG":
        interpolateFunction = d3.interpolatePiYG;
        break;
      case "PuOr":
        interpolateFunction = d3.interpolatePuOr;
        break;
      case "Spectral":
        interpolateFunction = d3.interpolateSpectral;
        break;
      case "Rainbow":
        interpolateFunction = d3.interpolateRainbow;
        break;
      case "Sinebow":
        interpolateFunction = d3.interpolateSinebow;
        break;
      case "Cool":
        interpolateFunction = d3.interpolateCool;
        break;
      case "Warm":
        interpolateFunction = d3.interpolateWarm;
        break;
      default:
        // reference for exhaustiveCheck: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
        const _exhaustiveCheck: never = colourScheme;
        throw new Error("this should never happen");
    }
    const colourRange = d3
      .quantize((t) => interpolateFunction(t), colourDomain.length)
      .reverse();
    const scale = d3.scaleOrdinal(colourDomain, colourRange);
    return scale;
  }, [colourDomain, colourScheme]);

  const colourScaleWithTransactionNumber: ScaleOrdinalWithTransactionNumber =
    useMemo(() => {
      const selectedTransactionNumberSet = new Set(
        selectedTransactionNumberArr
      );

      const getColour = function (
        valueForColour: string,
        transactionNumber?: TransactionData["transactionNumber"]
      ): string {
        if (selectedTransactionNumberSet.size === 0) {
          return colourScale(valueForColour);
        } else if (
          transactionNumber === undefined ||
          selectedTransactionNumberSet.has(transactionNumber)
        ) {
          return colourScale(valueForColour);
        } else {
          return GRAY1;
        }
      };

      const colourScaleWithTransactionNumber: ScaleOrdinalWithTransactionNumber =
        {
          getColour: getColour,
          domain: () => colourScale.domain(),
          range: () => colourScale.range(),
        };
      return colourScaleWithTransactionNumber;
    }, [colourScale, selectedTransactionNumberArr]);

  return colourScaleWithTransactionNumber;
}
