import { useContext } from "react"
import { ConfigContext, ConfigDispatchContext } from "../ConfigProvider"

/**
 * require ConfigureContext and ConfigDispatchContext
 * render the configuration based on the ConfigContext
 * provide buttons for controlling the ConfigContext by using ConfigDispatchContext
 */
export default function ControlPannel() {
    const config = useContext(ConfigContext)
    const dispatch = useContext(ConfigDispatchContext)

    return (<></>)
}