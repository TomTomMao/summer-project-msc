import { Alert } from "@mui/material";
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
    const { information, servertiy } = useAppSelector(popupSlice.selectPopupInformation)
    useEffect(() => {
        const nextShouldShowPopup = information !== null && servertiy !== null
        setShouldShowPopup(nextShouldShowPopup)
    }, [information, servertiy])
    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>; // I reference the Akxe answer for the type notation: https://stackoverflow.com/questions/45802988/typescript-use-correct-version-of-settimeout-node-vs-window
        if (servertiy !== null) {
            if (timeToLive !== null) {
                timeoutId = setTimeout(() => setShouldShowPopup(false), timeToLive*1000)
            }
        }
        return () => clearTimeout(timeoutId)
    }, [timeToLive, servertiy])
    return (<div
    style={{}}> 
    {/* todo: put it to center */}
        {shouldShowPopup && <Alert severity={servertiy === null ? undefined : servertiy}>{information}</Alert>}
    </div>
    )
}