import * as colourChannelSlice from "@/app/dashboard/components/ColourChannel/colourChannelSlice";
import { useAppSelector } from "@/app/hooks";
import * as d3 from "d3";
import { useMemo } from "react";
import * as interactivitySlice from "../components/Interactivity/interactivitySlice";
import { TransactionData } from "../utilities/DataObject";
import { GRAY1 } from "../utilities/consts";

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
