import { FormControlLabel, Switch } from "@mui/material" // reference: https://mui.com/material-ui

interface LogScaleSwitcherProps {
    isLog: boolean,
    label: string,
    onTurnOnLog: () => void,
    onTurnOffLog: () => void,

}
export default function LogScaleSwitcher(props: LogScaleSwitcherProps) {
    const { isLog, label, onTurnOnLog, onTurnOffLog } = props
    const handleChange = () => {
        if (isLog) {
            onTurnOffLog()
        } else {
            onTurnOnLog()
        }
    }
    return (
        <>{/**reference for the switch button with label: https://mui.com/material-ui/react-switch/#label-placement */}
            <FormControlLabel
                control={
                    <Switch checked={isLog} onChange={handleChange} />
                }
                label={label}
                labelPlacement="start"
            />
        </>
    )
}

interface LogScaleSwitcherGroupProps {
    isXLog: boolean,
    isYLog: boolean,
    onTurnOnXLog: () => void,
    onTurnOnYLog: () => void,
    onTurnOffXLog: () => void,
    onTurnOffYLog: () => void,
}
export function LogScaleSwitcherGroup(props: LogScaleSwitcherGroupProps) {
    const { isXLog, isYLog, onTurnOnXLog, onTurnOnYLog, onTurnOffXLog, onTurnOffYLog } = props
    return (<>
        <LogScaleSwitcher
            isLog={isXLog}
            label={'X Log'}
            onTurnOnLog={onTurnOnXLog}
            onTurnOffLog={onTurnOffXLog} />
        <LogScaleSwitcher
            isLog={isYLog}
            label={'Y Log'}
            onTurnOnLog={onTurnOnYLog}
            onTurnOffLog={onTurnOffYLog} />
    </>
    )
}