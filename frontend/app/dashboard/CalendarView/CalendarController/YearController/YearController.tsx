import { useState } from 'react';
import styles from './yearController.module.css'
import CalendarControllerRow from '../CalendarControllerRow';

export default function YearController({year, handleSetYear}:{year: string,handleSetYear: (year: string)=>void}) {
    
    return (
        <>
            <CalendarControllerRow name='Year'>
                <input type="number" className='w-full pl' value={year} onChange={(e) => handleSetYear(e.target.value)} />
            </CalendarControllerRow>
        </>
    )
}