// reference the document of redux: https://react-redux.js.org/tutorials/typescript-quick-start
import { RootState } from "@/app/store";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * 'true' value for isFiltered means show the data, false means not show.
 * 'true' value for isHighLighted means highLight the data, false means not highLight
 */
export interface ColourDomainInfo {
  domainValue: string;
  isFiltered: boolean;
  isHighLighted: boolean;
  id: number;
}
/**
 * key is the domain value for the colour channel
 * */
interface ColourDomainState {
  domainInfoArr: ColourDomainInfo[];
}

const initialState: ColourDomainState = {
  domainInfoArr: [],
};

export const colourDomainSlice = createSlice({
  name: "colourLegend",
  initialState,
  reducers: {
    /**
     * set all the value in the payload as highLighted and filtered
     * @param action payload is an array of domain value for the colour scale
     */
    initColourDomainInfo(state, action: PayloadAction<string[]>) {
      state.domainInfoArr = action.payload.map((domainValue, index) => {
        return {
          domainValue: domainValue,
          isFiltered: true,
          isHighLighted: true,
          id: index,
        };
      });
    },
    /**
     * set the payload as the highLighted value, set the other value be not highlighted
     * if the payload does not exists in the domainInfo Array, throw an error
     * @param action the payload is the colour domain to highlight
     */
    highLightOneColourDomainValue(state, action: PayloadAction<string>) {
      let foundDomain = false;
      state.domainInfoArr.forEach((domainInfo) => {
        if (domainInfo.domainValue === action.payload) {
          domainInfo.isHighLighted = true;
          foundDomain = true;
        } else {
          domainInfo.isHighLighted = false;
        }
      });
      if (!foundDomain) {
        throw new Error(`domain value '${action.payload}' not found`);
      }
    },
    /**
     * set the payload as the filtered value, set the others be not filtered
     * @param action the payload is the colour domain to highlight
     */
    filterOneColourDomainValue(state, action: PayloadAction<string>) {
      let foundDomain = false;
      state.domainInfoArr.forEach((domainInfo) => {
        if (domainInfo.domainValue === action.payload) {
          domainInfo.isFiltered = true;
          foundDomain = true;
        } else {
          domainInfo.isFiltered = false;
        }
      });
      if (!foundDomain) {
        throw new Error(`domain value '${action.payload}' not found`);
      }
    },
  },
});

// export the action creators
export const {
  initColourDomainInfo,
  highLightOneColourDomainValue,
  filterOneColourDomainValue,
} = colourDomainSlice.actions;

// export the selectors

const curryCreateSelectHighLightedColourDomainValueSet = () => {
  let lastDomainArr: ColourDomainInfo[];
  let lastResult: Set<string>;
  return (state: RootState) => {
    if (state.colourLegend.domainInfoArr === lastDomainArr) {
      return lastResult;
    } else {
      lastDomainArr = state.colourLegend.domainInfoArr;
      lastResult = new Set(
        state.colourLegend.domainInfoArr
          .filter((domainInfo) => domainInfo.isHighLighted)
          .map((domainInfo) => domainInfo.domainValue)
      );
      return lastResult;
    }
  };
};
/**
 * return a set of domain value that is highlighted, the value should be unique
 */
export const selectHighLightedColourDomainValueSet =
  curryCreateSelectHighLightedColourDomainValueSet();
/**
 * return a set of domain value that is filtered
 * todo: potentially enexpected update doto creation of a new array
 */
export const selectFilteredColourDomainValueSet = (
  state: RootState
): Set<string> => {
  return new Set(
    state.colourLegend.domainInfoArr
      .filter((domainInfo) => domainInfo.isFiltered)
      .map((domainInfo) => domainInfo.domainValue)
  );
};

/**
 * make sure only when the domainInfo updated, the selector create a new mapped array
 * @returns a selector function which compare the lastDomainInfoArr
 */
const curryCreateSelectDomain = () => {
  let lastDomainInfoArr: ColourDomainInfo[];
  let lastResult: string[];
  return (state: RootState) => {
    if (state.colourLegend.domainInfoArr === lastDomainInfoArr) {
      return lastResult;
    } else {
      lastDomainInfoArr = state.colourLegend.domainInfoArr;
      lastResult = state.colourLegend.domainInfoArr.map((d) => d.domainValue);
      return lastResult;
    }
  };
};
/**
 * return an array of value for colour domain which keeps the order of id
 */
export const selectDomain = curryCreateSelectDomain();

export default colourDomainSlice.reducer;