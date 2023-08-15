import * as colourChannelSlice from "@/app/dashboard/components/ColourChannel/colourChannelSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import * as d3 from "d3";
import { useEffect, useMemo } from "react";

export function useClusterColourScale() {
  const scaleFunction = useAppSelector(
    colourChannelSlice.selectClusterColourScaleFunction
  );
  return scaleFunction;
}

export function useCategoryColourScale() {
  const scaleFunction = useAppSelector(
    colourChannelSlice.selectCategoryColourScaleFunction
  );
  return scaleFunction;
}

export function useFrequencyUniqueKeyColourScale() {
  const scaleFunction = useAppSelector(
    colourChannelSlice.selectFrequencyUniqueKeyColourScaleFunction
  );
  return scaleFunction;
}

/**
 * synchronise all the colour scale
 */
export function useSyncColourScales() {
  useSyncClusterColourScale();
  useSyncCategoryColourScale();
  useSyncFrequencyUniqueKeyColourScale();
}

/**
 * synchronise ClusterColourScale
 */
function useSyncClusterColourScale() {
  const dispatch = useAppDispatch();
  const colourDomain = useAppSelector(
    colourChannelSlice.selectClusterColourDomain
  );
  const colourScheme = useAppSelector(
    colourChannelSlice.selectClusterColourScheme
  );
  const colourScale = useColourScale(colourDomain, colourScheme);
  useEffect(() => {
    dispatch(colourChannelSlice.setClusterColourScale(colourScale));
  }, [colourScale]);
}
/**
 * synchronise CategoryColourScale
 */
function useSyncCategoryColourScale() {
  const dispatch = useAppDispatch();
  const colourDomain = useAppSelector(
    colourChannelSlice.selectCategoryColourDomain
  );
  const colourScheme = useAppSelector(
    colourChannelSlice.selectCategoryColourScheme
  );
  const colourScale = useColourScale(colourDomain, colourScheme);
  useEffect(() => {
    dispatch(colourChannelSlice.setCategoryColourScale(colourScale));
  }, [colourScale]);
}
/**
 * synchronise FrequencyUniqueKeyColourScale
 */
function useSyncFrequencyUniqueKeyColourScale() {
  const dispatch = useAppDispatch();
  const colourDomain = useAppSelector(
    colourChannelSlice.selectFrequencyUniqueKeyColourDomain
  );
  const colourScheme = useAppSelector(
    colourChannelSlice.selectFrequencyUniqueKeyColourScheme
  );
  const colourScale = useColourScale(colourDomain, colourScheme);
  useEffect(() => {
    dispatch(colourChannelSlice.setFrequencyUniqueKeyColourScale(colourScale));
  }, [colourScale]);
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
    var interpolateFunction: ((t: number) => string) | undefined = undefined;
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
    const colourRange = d3
      .quantize(
        (t) => d3.interpolateSpectral(t * 0.8 + 0.1),
        colourDomain.length
      )
      .reverse();
    const scale = d3.scaleOrdinal(colourDomain, colourRange);
    return scale;
  }, [colourDomain, colourScheme]);
  return colourScale;
}
