// reference the document of redux: https://react-redux.js.org/tutorials/typescript-quick-start
import { RootState } from "@/app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ScaleOrdinal } from "d3";

export type ColourScheme = "PuOr" | "Spectral" | "PiYG";

export interface ColourChannelState {
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
}

const initialState: ColourChannelState = {
  cluster: {
    scheme: "PuOr",
    scaleFunction: null,
  },
  category: {
    scheme: "Spectral",
    scaleFunction: null,
  },
  frequencyUniqueKey: {
    scheme: "PiYG",
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
export const selectClusterColourDomain = outerSelectClusterColourDomain();

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

export const selectClusterColourScheme = (state: RootState) =>
  state.colourChannel.cluster.scheme;
export const selectCategoryColourScheme = (state: RootState) =>
  state.colourChannel.category.scheme;
export const selectFrequencyUniqueKeyColourScheme = (state: RootState) =>
  state.colourChannel.frequencyUniqueKey.scheme;

export const selectClusterColourScaleFunction = (state: RootState) =>
  state.colourChannel.cluster.scaleFunction;
export const selectCategoryColourScaleFunction = (state: RootState) =>
  state.colourChannel.category.scaleFunction;
export const selectFrequencyUniqueKeyColourScaleFunction = (state: RootState) =>
  state.colourChannel.frequencyUniqueKey.scaleFunction;

export default colourChannelSlice.reducer;
