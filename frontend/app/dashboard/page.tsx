'use client'
import { useState, useEffect } from "react"
import { timeParse } from 'd3'
import { TransactionData, curryCleanFetchedTransactionData, curryCleanFetchedRFMData, RFMData } from "./DataObject";
import CalendarView3 from "./CalendarView3/CalendarView3";
import TableView, { DescriptionAndIsCredit } from "./TableView/TableView";
import { ValueGetterContext, initValueGetter } from "./CalendarView3/Contexts/ValueGetterContext";
import { ClusterView } from "./ClusterView";

const parseTime = timeParse('%d/%m/%Y')
const apiUrl = 'http://localhost:3030';
const ClusterViewHeight = 300;
const ClusterViewWidth = 300;


export default function Page() {
    const [transactionDataArr, setTransactionDataArr] = useState<Array<TransactionData> | null>(null)
    const [RFMDataArr, setRFMDataArr] = useState<Array<RFMData> | null>(null)
    const [valueGetter, setValueGetter] = useState(initValueGetter);
    const [selectedDescriptionAndIsCreditArr, setSelectedDescriptionAndIsCreditArr] = useState<DescriptionAndIsCredit[]>([])

    function handleSelect(transactionDescription: TransactionData['transactionDescription'], isCredit: boolean) {
        const nextSelectedDescriptionAndIsCreditArr = [{ transactionDescription: transactionDescription, isCredit: isCredit }];
        setSelectedDescriptionAndIsCreditArr(nextSelectedDescriptionAndIsCreditArr);
    }
    transactionDataArr && console.log('transactionDataArr fetched and cleaned:', transactionDataArr);
    RFMDataArr && console.log('RFMData fetched and cleaned:', RFMDataArr);
    useEffect(() => {
        // fetch the data and update the data state
        fetchData(parseTime).then(
            (data) => {
                const { transactionDataArr, RFMDataArr } = data;
                setTransactionDataArr(transactionDataArr);
                setRFMDataArr(RFMDataArr)
            }
        );
        setTransactionDataArr(transactionDataArr);
        setRFMDataArr(RFMDataArr)
    }, []);

    if (transactionDataArr === null || RFMDataArr === null) {
        return <>loading...</>
    }
    return (<div>
        hello data
        {/* <CalendarView transactions={data}></CalendarView> */}
        {/* <CalendarView2 rawData={data} startDate={new Date()}></CalendarView2> */}
        <ValueGetterContext.Provider value={valueGetter}>
            <CalendarView3 transactionDataArr={transactionDataArr} initCurrentYear={2016} RFMDataArr={RFMDataArr}></CalendarView3>
            <ClusterView transactionDataArr={transactionDataArr} RFMDataArr={RFMDataArr}
                height={ClusterViewHeight} width={ClusterViewWidth}
                onSelect={handleSelect} selectedDescriptionAndIsCreditArr={selectedDescriptionAndIsCreditArr}></ClusterView>
        </ValueGetterContext.Provider>
        <TableView transactionDataArr={transactionDataArr} RFMDataArr={RFMDataArr} filteredDescriptionAndIsCreditArr={selectedDescriptionAndIsCreditArr}></TableView>
    </div>
    )


}


/**
 * fetch transactiondata and rfm data from backend, transfer them into TransactionData[] and RFMData[] 
 * @param setTransactionDataArr used for update the transac
 * @param setRFMDataArr 
 * @param parseTime 
 */
async function fetchData(parseTime: (dateString: string) => Date | null) {
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

        return { transactionDataArr, RFMDataArr }
    } catch (error) {
        console.log(error);
        throw error;
        
    }
}

