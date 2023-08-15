import * as colourChannelSlice from "@/app/dashboard/components/ColourChannel/colourChannelSlice";
import { useAppSelector } from "@/app/hooks";
import assert from "assert";
import * as d3 from "d3";
import { useMemo } from "react";

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
 * @param colourDomain
 * @param colourScheme
 * @returns
 */
function useColourScale(
  colourDomain: string[],
  colourScheme: colourChannelSlice.ColourScheme
) {
  const colourScale = useMemo(() => {
    let interpolateFunction: ((t: number) => string) | undefined = undefined;
    switch (colourScheme) {
      case "PiYG":
        interpolateFunction = d3["interpolatePiYG"];
        break;
      case "PuOr":
        interpolateFunction = d3["interpolatePuOr"];
        break;
      case "Spectral":
        interpolateFunction = d3["interpolateSpectral"];
        break;
      default:
        // reference for exhaustiveCheck: https://www.typescriptlang.org/docs/handbook/2/narrowing.html#exhaustiveness-checking
        const _exhaustiveCheck: never = colourScheme;
        break;
    }
    if (interpolateFunction === undefined) {
      throw new Error("interpolateFunction is not defined!");
    }
    const func = interpolateFunction;
    const colourRange = d3
      .quantize((t) => func(t * 0.8 + 0.1), colourDomain.length)
      .reverse();
    const scale = d3.scaleOrdinal(colourDomain, colourRange);
    return scale;
  }, [colourDomain, colourScheme]);

  return colourScale;
}
