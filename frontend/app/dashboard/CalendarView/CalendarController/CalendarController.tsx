import { ETransactionVariable } from "../../Transaction";
import { ECalendarViewVisualVariables, IMapping } from "../CalendarView";
import MappingController from "./MappingController/MappingController";
import YearController from "./YearController/YearController";
import styles from './style.module.css';

export function CalendarController({ year, handleSetYear, mappings, transactionVariables, handleSetMappings }:
    {
        year: string, handleSetYear: (year: string) => void, mappings: IMapping[],
        transactionVariables: ETransactionVariable[],
        handleSetMappings: (newVisualVariable: ECalendarViewVisualVariables, newDataVariable: IMapping['dataVariable']) => void
    }) {
    return (
        <div className='p-1 bg-gray-400 w-48'>
            <div className='bg-blue-200 mb-1'>
                <YearController year={year} handleSetYear={handleSetYear}></YearController>
            </div>
            <div className='bg-blue-200 mb-1'>
                <MappingController mappings={mappings}
                    transactionVariables={transactionVariables} handleSetMappings={handleSetMappings}/>
            </div>
            <div className='bg-blue-200'>
                placeholder
            </div>
        </div>
    );
}
