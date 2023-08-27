import * as interactivitySlice from "../components/Interactivity/interactivitySlice";
import { TransactionData } from "./DataObject";


export function getPrettierAxisLabel(axisLabel: interactivitySlice.ValidAxisLabels): string {
    switch (axisLabel) {
        case "transactionAmount":
            return 'Transaction Amount';
        case "dayOfYear":
            return 'Day of Year';
        case "balance":
            return 'Balance';
        case "frequency":
            return 'Frequency(per month)';
        default:
            const _exhaustiveCheck: never = axisLabel;
            return axisLabel;
            break;
    }
}
