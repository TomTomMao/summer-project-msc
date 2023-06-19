import YearController from "./YearController";
import styles from './style.module.css'
export function CalendarController() {
    return (
        <div className={styles.calendarController}>
            <YearController></YearController>
            {/* <MappingController></MappingController>
            <FilterController></FilterController> */}
        </div>
    );
}
