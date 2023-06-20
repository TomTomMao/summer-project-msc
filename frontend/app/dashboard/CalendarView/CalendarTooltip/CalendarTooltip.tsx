import { CSSProperties } from "react";
import styles from './style.module.css'
const values1: ITooltipValue[] = [{
    targetDomain: 'colour',
    sourceDomain: 'total amount of transaction',
    sourceDomainValue: 105
}]
export interface ITooltipValue {
    targetDomain: string,
    sourceDomain: string,
    sourceDomainValue: string | number | Date
}
export interface ITooltipLocation {
    x: number,
    y: number
}
export default function CalendarTooltip({ values, location }: { values: ITooltipValue[], location: ITooltipLocation | null }) {
    let style: CSSProperties | undefined;
    if (location == null) {
        style = {
            visibility: "hidden"
        }
    } else {
        style = {
            left: location.x + 'px',
            top: location.y + 'px'
        }
    }
    return (
        <div className={`${styles.calendarTooltipContainer}`} style={style}>
            <table>
                <tbody>
                    {values.map((value) => {
                        return (
                            <tr key={value.sourceDomain}>
                                <td>{value.sourceDomain}:</td>
                                <td>{String(value.sourceDomainValue)}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}