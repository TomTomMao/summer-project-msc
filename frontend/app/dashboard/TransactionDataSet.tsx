import { DataPerTransactionDescription } from "./CalendarView3/DataPerTransactionDescription";
import { RFMData, TransactionData } from "./DataObject";

/**
 * a class represent a collection of transaction dataset, building, don't use this
 */
class TransactionDataSet {
    private readonly transactionDataArr: TransactionData[];
    private readonly RFMDataArr: RFMData[];
    constructor(transactionDataArr: TransactionData[], RFMDataArr: RFMData[]) {
        this.transactionDataArr = transactionDataArr;
        this.RFMDataArr = RFMDataArr;
    }

    /**
     * 
     * @param year 
     * @param month 
     * @param date 
     * @return an array of data of the day, which is aggregated: 
     */
    GetAggregatedDayDataPerTransactionDescription(year:number, month:number, date:number):DataPerTransactionDescription[] {
        
    }
    GetDayData(year, month, date):TransactionDataWithRFMInfo[]
}