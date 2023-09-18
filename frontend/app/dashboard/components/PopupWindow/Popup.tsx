import { Alert } from "@mui/material"; // reference: https://mui.com/material-ui
import * as popupSlice from "./PopupSlice";
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import { useEffect, useState } from "react";

/**
 * time to live: number of second to stop
 * @param param0 
 * @returns 
 */
export default function Popup() {
    const [shouldShowPopup, setShouldShowPopup] = useState<boolean>(false)
    const timeToLive = useAppSelector(popupSlice.selectTimeToLive)
    const { information, servertiy } = useAppSelector(popupSlice.selectPopupInformationMemorised)
    const dispatch = useAppDispatch()
    useEffect(() => {
        const nextShouldShowPopup = information !== null && servertiy !== null
        setShouldShowPopup(nextShouldShowPopup)
    }, [information, servertiy])
    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>; // I reference the Akxe answer for the type notation: https://stackoverflow.com/questions/45802988/typescript-use-correct-version-of-settimeout-node-vs-window
        if (servertiy !== null) {
            if (timeToLive !== null) {
                timeoutId = setTimeout(() => {
                    setShouldShowPopup(false);
                    dispatch(popupSlice.clearPopupWindow())
                }, timeToLive * 1000)

            }
        }
        return () => { setShouldShowPopup(false); clearTimeout(timeoutId); }
    }, [timeToLive, servertiy])
    return (<div
        style={{
            // referenced ProblemsOfSumit's answer: https://stackoverflow.com/questions/1776915/how-can-i-center-an-absolutely-positioned-element-in-a-div
            position: 'absolute',
            left: '50%',
            transform: 'translate(-50%, 0)',
            top: '5%',
            zIndex: 999
        }}>
        {shouldShowPopup && <Alert variant="filled" severity={servertiy === null ? undefined : servertiy}>{information}</Alert>}
        {/* reference for the Alert: https://mui.com/material-ui/react-alert/ */}
    </div>
    )
}