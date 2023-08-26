// reference the document of redux: https://react-redux.js.org/tutorials/typescript-quick-start
import { RootState } from "@/app/store";
import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { createMemorisedFunction } from "../../utilities/createMemorisedFunction";

export interface PopupState {
    /**if null then not display any window */
    information: string | null,
    servertiy: 'error' | 'success' | 'info' | null
}
/**number of second to live */
const timeToLiveError = 5
const timeToLiveSuccess = 5
const timeToLiveInfo = 5

const initialState: PopupState = {
    information: null,
    servertiy: null
};

export const popupSlice = createSlice({
    name: "popup",
    initialState,
    reducers: {
        showFetchingData(state) { state.information = 'fetching data'; state.servertiy = 'info' },
        showFetchingDataDone(state) { state.information = 'fetching data succeed'; state.servertiy = 'success' },
        showFetchingDataFail(state) { state.information = 'fetching data failed, please contact Wentao: wentao.mao@outlook.com'; state.servertiy = 'error' },
        showInvalidInputData(state, action: PayloadAction<string>) { state.information = action.payload; state.servertiy = 'error' },
        clearPopupWindow(state) { state.information = null }
    },
});

// export the action creators
export const {
    showFetchingData, showFetchingDataDone, showFetchingDataFail, clearPopupWindow, showInvalidInputData
} = popupSlice.actions;

export const selectPopupInformationMemorised = createMemorisedFunction(selectPopupInformation,
    (popupState1: PopupState, popupState2: PopupState) => popupState1.information === popupState2.information && popupState2.servertiy === popupState2.servertiy
)

function selectPopupInformation(state: RootState): PopupState {
    return { information: state.popUp.information, servertiy: state.popUp.servertiy }
}

export const selectTimeToLive = (state: RootState) => {
    switch (state.popUp.servertiy) {
        case 'error':
            return timeToLiveError
        case 'info':
            return timeToLiveInfo
        case 'success':
            return timeToLiveSuccess
        case null:
            return null
        default:
            const _exhaustiveCheck: never = state.popUp.servertiy
            throw new Error("exhaustive erroe");
    }
}

export default popupSlice.reducer;
