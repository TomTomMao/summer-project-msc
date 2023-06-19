import {  useState } from 'react';
import styles from './yearController.module.css'

export default function YearController() {
    const [year, setYear] = useState('2019');
    function handleChange(e: string) {
        setYear(e)
    }
    return (
        <div className={styles.yearControllerContainer}>
            <div className={styles.yearLable}>Year</div>
            <div><input className={styles.yearInput} type="number" value={year} onChange={(e)=>handleChange(e.target.value)}/></div>
        </div>
    )
}