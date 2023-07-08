'use client'
import { useState, useEffect, StrictMode, useContext } from "react"
import { timeParse } from 'd3'
import { CTransaction, TransactionData } from "./Transaction";
import CalendarView from "./CalendarView2/CalendarView2";
import CalendarView2 from "./CalendarView2/CalendarView2";
import CalendarView3 from "./CalendarView3/CalendarView3";

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
    const [data, setData] = useState<Array<TransactionData> | null>(null)
    
    console.log('init state: ', data)

    useEffect(() => {
        // https://blog.logrocket.com/modern-api-data-fetching-methods-react/
        fetch('http://localhost:3030/transactionData')
            .then(res => res.json())
            // clean data
            .then(fetchedData => {
                let dataWithTimeFormat = fetchedData.map(cleanFetchedData('TransactionData'));
                setData(dataWithTimeFormat);
            })
            .catch((err) => {
                console.log(err)
            })
    }, [])
    if (data === null) {
        return <>loading...</>
    }
    return (<>
        hello data
        {/* <CalendarView transactions={data}></CalendarView> */}
        {/* <CalendarView2 rawData={data} startDate={new Date()}></CalendarView2> */}
        <CalendarView3 rawData={data} currentYear={2016} ></CalendarView3>
    </>
    )


}

function cleanFetchedData(returnType: string): ((d: ITransactionData) => CTransaction) | ((d: ITransactionData) => TransactionData) {
    switch (returnType) {
        case 'CTransaction':
            return function (d: ITransactionData): CTransaction {
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
        case 'TransactionData':
            return function (d: ITransactionData): TransactionData {
                /**
                 * take an ITransactionData object, return a TransactionData object 
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
                const transaction: TransactionData = new TransactionData(transanctionNumber,
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

        default:
            throw new Error(`returnType is wrong, should be CTransaction or TransactionData, but given ${returnType}`);

    }

}

