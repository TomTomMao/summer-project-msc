import { Data } from "../CalendarView3";

/**
 * day: number from 1 to 31
 * month: number from 1 to 12
 * currentYear: 4 digit number represents year
 * data: 
 */
export interface DayViewProps {
    /**1 to 31 */
    day: number;
    /**1to12 */
    month: number;
    currentYear: number;
    data: Data;
    containerSize: { containerWidth: number, containerHeight: number }
}