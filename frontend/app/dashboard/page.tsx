'use client'
import { useState, useEffect, StrictMode,useContext } from "react"
import { timeParse } from 'd3'
import { CTransaction } from "./Transaction";
import CalendarView from "./CalendarView/CalendarView";

const parseTime = timeParse('%d/%m/%Y')

interface ITransactionData {
    'Transaction Number': string,
    'Transaction Date': string,
    'Transaction Type': string,
    'Transaction Description': string,
    'Debit Amount': string,
    'Credit Amount': string,
    'Balance': string,
    'Category': string,
    'Location City': string,
    'Location Country': string
}

export default function Page() {
    const [data, setData] = useState<Array<CTransaction> | null>(null)
    const [loading, setLoading] = useState<boolean>(true);

    console.log('init state: ', data, loading)

    useEffect(() => {
        // https://blog.logrocket.com/modern-api-data-fetching-methods-react/
        fetch('http://localhost:3030/transactionData')
            .then(res => res.json())
            // clean data
            .then(fetchedData => {
                let dataWithTimeFormat = fetchedData.map(cleanFetchedData);
                setData(dataWithTimeFormat)
                setLoading(false)
            })
            .catch((err) => {
                console.log(err)
            })
    }, [])

    return (<>
        hello data
        <CalendarView transactions={data}></CalendarView>
    </>
    )


}

function cleanFetchedData(d: ITransactionData) {
    /**
     * take an ITransactionData object, return a CTransaction object 
     */
    const transanctionNumber: string = d['Transaction Number'];
    const date: Date | null = parseTime(d['Transaction Date']);
    const transactionType: string = d['Transaction Type'];
    const transactionDescription: string = d['Transaction Description'];
    const debitAmount: number = (d['Debit Amount'] == '' ? 0 : parseFloat(d['Debit Amount']));
    const creditAmount: number = (d['Credit Amount'] == '' ? 0 : parseFloat(d['Credit Amount']));
    const balance: number = (d['Balance'] == '' ? 0 : parseFloat(d['Balance']));
    const category: string = d['Category'];
    const locationCity: string = d['Location City'];
    const locationCountry: string = d['Location Country'];
    const transaction: CTransaction = new CTransaction(transanctionNumber,
        date,
        transactionType,
        transactionDescription,
        debitAmount,
        creditAmount,
        balance,
        category,
        locationCity,
        locationCountry);
    return transaction;
}

