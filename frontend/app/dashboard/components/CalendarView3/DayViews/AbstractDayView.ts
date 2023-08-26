import { Data } from "../CalendarView3";

export interface DayViewProps {
    /**1 to 31 */
    day: number;
    /**1to12 */
    month: number;
    currentYear: number;
    data: Data;
    containerSize: { containerWidth: number, containerHeight: number }
}