// reference the document of redux: https://react-redux.js.org/tutorials/typescript-quick-start
import { RootState } from "@/app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ScaleOrdinal } from "d3";
import * as interactivitySlice from "../Interactivity/interactivitySlice";
import { getClusterDataMapFromArr } from "../../hooks/useClusterData";
import { ClusterData } from "../../utilities/clusterDataObject";
import {
  createArrayComparator,
  createMemorisedFunction,
} from "../../utilities/createMemorisedFunction";

export type ColourScheme =
  | "PuOr"
  | "Spectral"
  | "PiYG"
  | "Rainbow"
  | "Sinebow"
  | "Warm"
  | "Cool"; // colour scale are from: reference: https://github.com/d3/d3-scale-chromatic

export type ColourChannelState = {
  cluster: {
    scheme: ColourScheme;
    scaleFunction: ScaleOrdinal<string, string, never> | null;
  };
  category: {
    scheme: ColourScheme;
    scaleFunction: ScaleOrdinal<string, string, never> | null;
  };
  frequencyUniqueKey: {
    scheme: ColourScheme;
    scaleFunction: ScaleOrdinal<string, string, never> | null;
  };
};
export type ColourDomainData = {
  domain: string;
  transactionNumber: string;
};
export const isColourDomainDataEqualComparator = (
  colourDomainData1: ColourDomainData,
  colourDomainData2: ColourDomainData
) =>
  colourDomainData1.domain === colourDomainData2.domain &&
  colourDomainData1.transactionNumber === colourDomainData2.transactionNumber;
export type ValidColours = "category" | "cluster" | "frequencyUniqueKey";
const initialState: ColourChannelState = {
  cluster: {
    scheme: "Warm",
    scaleFunction: null,
  },
  category: {
    scheme: "Rainbow",
    scaleFunction: null,
  },
  frequencyUniqueKey: {
    scheme: "Cool",
    scaleFunction: null,
  },
};

export const colourChannelSlice = createSlice({
  name: "colourChannel",
  initialState,
  reducers: {
    setClusterColourScale(
      state,
      action: PayloadAction<ColourChannelState["cluster"]["scaleFunction"]>
    ) {
      state.cluster.scaleFunction = action.payload;
    },
    setCategoryColourScale(
      state,
      action: PayloadAction<ColourChannelState["category"]["scaleFunction"]>
    ) {
      state.category.scaleFunction = action.payload;
    },
    setFrequencyUniqueKeyColourScale(
      state,
      action: PayloadAction<
        ColourChannelState["frequencyUniqueKey"]["scaleFunction"]
      >
    ) {
      state.frequencyUniqueKey.scaleFunction = action.payload;
    },
  },
});

// export the action creators
export const {
  setClusterColourScale,
  setCategoryColourScale,
  setFrequencyUniqueKeyColourScale,
} = colourChannelSlice.actions;

// export selectors (use closure to avoid return two different array with same elements)

function outerSelectClusterColourDomain() {
  let lastClusterColourDomain: string[] | null = null;
  return (state: RootState) => {
    const thisClusterColourDomain = Array.from(
      new Set(
        state.interactivity.clusterDataArr.map(
          (clusterData) => clusterData.clusterId
        )
      )
    );
    if (lastClusterColourDomain === null) {
      lastClusterColourDomain = thisClusterColourDomain;
      return lastClusterColourDomain;
    }
    // check if two array are the same
    if (lastClusterColourDomain.length !== thisClusterColourDomain.length) {
      // check length
      lastClusterColourDomain = thisClusterColourDomain;
      return lastClusterColourDomain;
    }
    var allSame = true;
    for (let i = 0; i < lastClusterColourDomain.length; i++) {
      if (lastClusterColourDomain[i] !== thisClusterColourDomain[i]) {
        allSame = false;
        break;
      } else {
        // donoting
      }
    }
    if (allSame === false) {
      lastClusterColourDomain = thisClusterColourDomain;
      return lastClusterColourDomain;
    }
    return lastClusterColourDomain;
  };
}
export const selectClusterIdColourIdDomain = outerSelectClusterColourDomain();

function outerSelectCategoryColourDomain() {
  let lastCategoryColourDomain: string[] | null = null;
  return (state: RootState) => {
    const thisCategoryColourDomain = Array.from(
      new Set(
        state.interactivity.transactionDataArr.map(
          (transactionData) => transactionData.category
        )
      )
    );
    if (lastCategoryColourDomain === null) {
      lastCategoryColourDomain = thisCategoryColourDomain;
      return lastCategoryColourDomain;
    }
    // check if two array are the same
    if (lastCategoryColourDomain.length !== thisCategoryColourDomain.length) {
      // check length
      lastCategoryColourDomain = thisCategoryColourDomain;
      return lastCategoryColourDomain;
    }
    var allSame = true;
    for (let i = 0; i < lastCategoryColourDomain.length; i++) {
      if (lastCategoryColourDomain[i] !== thisCategoryColourDomain[i]) {
        allSame = false;
        break;
      } else {
        // donoting
      }
    }
    if (allSame === false) {
      lastCategoryColourDomain = thisCategoryColourDomain;
      return lastCategoryColourDomain;
    }
    return lastCategoryColourDomain;
  };
}
export const selectCategoryColourDomain = outerSelectCategoryColourDomain();

/**
 *
 * @returns a memorised selector
 */
function outerSelectFrequencyUniqueKeyColourDomain() {
  let lastFrequencyUniqueKeyColourDomain: string[] | null = null;
  return (state: RootState) => {
    const thisFrequencyUniqueKeyColourDomain = Array.from(
      new Set(
        state.interactivity.transactionDataArr.map(
          (transactionData) => transactionData.frequencyUniqueKey
        )
      )
    );
    if (lastFrequencyUniqueKeyColourDomain === null) {
      lastFrequencyUniqueKeyColourDomain = thisFrequencyUniqueKeyColourDomain;
      return lastFrequencyUniqueKeyColourDomain;
    }
    // check if two array are the same
    if (
      lastFrequencyUniqueKeyColourDomain.length !==
      thisFrequencyUniqueKeyColourDomain.length
    ) {
      // check length
      lastFrequencyUniqueKeyColourDomain = thisFrequencyUniqueKeyColourDomain;
      return lastFrequencyUniqueKeyColourDomain;
    }
    var allSame = true;
    for (let i = 0; i < lastFrequencyUniqueKeyColourDomain.length; i++) {
      if (
        lastFrequencyUniqueKeyColourDomain[i] !==
        thisFrequencyUniqueKeyColourDomain[i]
      ) {
        allSame = false;
        break;
      } else {
        // donoting
      }
    }
    if (allSame === false) {
      lastFrequencyUniqueKeyColourDomain = thisFrequencyUniqueKeyColourDomain;
      return lastFrequencyUniqueKeyColourDomain;
    }
    return lastFrequencyUniqueKeyColourDomain;
  };
}
export const selectFrequencyUniqueKeyColourDomain =
  outerSelectFrequencyUniqueKeyColourDomain();

export const selectClusterIdColourScheme = (state: RootState) =>
  state.colourChannel.cluster.scheme;
export const selectCategoryColourScheme = (state: RootState) =>
  state.colourChannel.category.scheme;
export const selectFrequencyUniqueKeyColourScheme = (state: RootState) =>
  state.colourChannel.frequencyUniqueKey.scheme;

/** based on the current selector, select the colourDomain data with transactionNumber and domain value for its colour domain*/
const selectTableViewColourDomainData = (
  state: RootState
): ColourDomainData[] => {
  const colour = interactivitySlice.selectCurrentSelectorColourScaleType(state);
  const transactionDataArr = interactivitySlice.selectTransactionDataArr(state);
  const clusterDataArr = interactivitySlice.selectClusterDataArr(state);
  const clusterDataMap = getClusterDataMapFromArr(clusterDataArr);
  switch (colour) {
    case "category":
      return transactionDataArr.map((d) => ({
        domain: d.category,
        transactionNumber: d.transactionNumber,
      }));
    case "frequencyUniqueKey":
      return transactionDataArr.map((d) => ({
        domain: d.frequencyUniqueKey,
        transactionNumber: d.transactionNumber,
      }));
    case "cluster":
      return transactionDataArr.map((d) => ({
        domain: clusterDataMap.get(
          d.transactionNumber
        ) as ClusterData["clusterId"],
        transactionNumber: d.transactionNumber,
      }));
    default:
      const _exhaustiveCheck: never = colour; // incase add new key, this place will automatically highlighted.
      throw new Error("This should not happen");
  }
};
const selectGlyphTableViewColourDomainData = (
  state: RootState
): ColourDomainData[] => {
  const colour = interactivitySlice.selectGlyphDataTableColourScaleType(state);
  const transactionDataArr = interactivitySlice.selectTransactionDataArr(state);
  const clusterDataArr = interactivitySlice.selectClusterDataArr(state);
  const clusterDataMap = getClusterDataMapFromArr(clusterDataArr);
  switch (colour) {
    case "category":
      return transactionDataArr.map((d) => ({
        domain: d.category,
        transactionNumber: d.transactionNumber,
      }));
    case "frequencyUniqueKey":
      return transactionDataArr.map((d) => ({
        domain: d.frequencyUniqueKey,
        transactionNumber: d.transactionNumber,
      }));
    case "cluster":
      return transactionDataArr.map((d) => ({
        domain: clusterDataMap.get(
          d.transactionNumber
        ) as ClusterData["clusterId"],
        transactionNumber: d.transactionNumber,
      }));
    default:
      const _exhaustiveCheck: never = colour; // incase add new key, this place will automatically highlighted.
      throw new Error("This should not happen");
  }
};
const compareColourDomainData = (
  colourDomainData1: ColourDomainData,
  colourDomainData2: ColourDomainData
) => {
  return (
    colourDomainData1.domain === colourDomainData2.domain &&
    colourDomainData1.transactionNumber === colourDomainData2.transactionNumber
  );
};
const comparingColourDomainArr = createArrayComparator(compareColourDomainData);
export const selectTableViewColourDomainDataMemorised = createMemorisedFunction(
  selectTableViewColourDomainData,
  comparingColourDomainArr
);
export const selectGlyphTableViewColourDomainDataMemorised = createMemorisedFunction(
  selectGlyphTableViewColourDomainData,
  comparingColourDomainArr
);

export default colourChannelSlice.reducer;
