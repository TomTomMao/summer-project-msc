'use client'
import { useState, useEffect } from "react"
import { timeParse } from 'd3'
import { TransactionData, curryCleanFetchedTransactionData, curryCleanFetchedRFMData, RFMData } from "./DataObject";
import CalendarView from "./CalendarView2/CalendarView2";
import CalendarView2 from "./CalendarView2/CalendarView2";
import CalendarView3 from "./CalendarView3/CalendarView3";

const parseTime = timeParse('%d/%m/%Y')
const apiUrl = 'http://localhost:3030';

export default function Page() {
    const [transactionDataArr, setTransactionDataArr] = useState<Array<TransactionData> | null>(null)
    const [RFMDataArr, setRFMDataArr] = useState<Array<RFMData> | null>(null)
    transactionDataArr && console.log('transactionDataArr fetched and cleaned:', transactionDataArr);
    RFMDataArr && console.log('RFMData fetched and cleaned:', RFMDataArr);
    useEffect(() => {
        // fetch the data and update the data state
        fetchData(setTransactionDataArr, setRFMDataArr, parseTime);
    }, []);

    if (transactionDataArr === null || RFMDataArr === null) {
        return <>loading...</>
    }
    return (<>
        hello data
        {/* <CalendarView transactions={data}></CalendarView> */}
        {/* <CalendarView2 rawData={data} startDate={new Date()}></CalendarView2> */}
        <CalendarView3 transactionDataArr={transactionDataArr} currentYear={2016} RFMDataArr={RFMDataArr}></CalendarView3>
    </>
    )


}



async function fetchData(setTransactionDataArr: React.Dispatch<React.SetStateAction<TransactionData[] | null>>,
    setRFMDataArr: React.Dispatch<React.SetStateAction<RFMData[] | null>>,
    parseTime: (dateString: string) => Date | null) {
    // fetch the transaction data

    try {
        const fetchedTransactionDataResponse = await fetch(`${apiUrl}/transactionData`);
        const fetchedTransactionData = await fetchedTransactionDataResponse.json();
        if (Array.isArray(fetchedTransactionData) === false) {
            console.log(fetchedTransactionData)
            throw new Error("wrong data type, fetched data should be an array");
        }
        const transactionDataArr: TransactionData[] = fetchedTransactionData.map(curryCleanFetchedTransactionData('TransactionData', parseTime));

        // fetch the rfm data
        const fetchedRFMDataResponse = await fetch(`${apiUrl}/transactionData/rfm`);
        const fetchedRFMData = await fetchedRFMDataResponse.json();
        if (Array.isArray(fetchedTransactionData) === false) {
            console.log(fetchedTransactionData)
            throw new Error("wrong data type, fetched data should be an array");
        }
        const RFMDataArr: RFMData[] = fetchedRFMData.map(curryCleanFetchedRFMData('RFMData'));

        setTransactionDataArr(transactionDataArr);
        setRFMDataArr(RFMDataArr)
    } catch (error) {
        console.log(error);
    }
}

