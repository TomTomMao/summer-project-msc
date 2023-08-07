'use client';

import assert, { AssertionError } from "assert";

export enum ETransactionVariable {
    transactionNumber = 'transactionNumber',
    date = 'date',
    transactionType = 'transactionType',
    transactionDescription = 'transactionDescription',
    debitAmount = 'debitAmount',
    creditAmount = 'creditAmount',
    balance = 'balance',
    category = 'category',
    locationCity = 'locationCity',
    locationCountry = 'locationCountry'
}
/**
 * transaction data fetched from the server should look like this
 */
export interface ITransactionDataFromAPI {
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

export interface ITransactionDataFromPythonAPI {
    balance: number,
    category: string,
    creditAmount: null | number,
    dayOfWeek: number,
    dayOfYear: number,
    debitAmount: null | number,
    isCredit: boolean,
    locationCity: string,
    locationCountry: string,
    transactionAmount: number,
    transactionDate: number,
    transactionDescription: string,
    transactionNumber: number,
    transactionType: string,
    'unnamed:0': number,
    weekOfYear: number

}

export type TransactionDataAttrs = "dayOfYear" | "transactionAmount" | "date" | "transactionNumber" | "transactionType" | "transactionDescription" | "debitAmount" | "creditAmount" | "balance" | "category" | "locationCity" | "locationCountry";
/**
 * a class represent a record of transaction
 */
export class TransactionData {
    readonly date: Date;
    readonly transactionNumber: string;
    readonly transactionType: string;
    readonly transactionDescription: string;
    readonly debitAmount: number;
    readonly creditAmount: number;
    readonly balance: number;
    readonly category: string;
    readonly locationCity: string;
    readonly locationCountry: string; constructor(
        transactionNumber: string,
        date: Date,
        transactionType: string,
        transactionDescription: string,
        debitAmount: number,
        creditAmount: number,
        balance: number,
        category: string,
        locationCity: string,
        locationCountry: string) {

        this.transactionNumber = transactionNumber;
        this.date = date;
        this.transactionType = transactionType;
        this.transactionDescription = transactionDescription;
        this.debitAmount = debitAmount;
        this.creditAmount = creditAmount;
        this.balance = balance;
        this.category = category;
        this.locationCity = locationCity;
        this.locationCountry = locationCountry;
    }
    static getColumnNames = function (): TransactionDataAttrs[] {
        Object.getOwnPropertyNames(TransactionData)
        return ["date",
            "transactionNumber",
            "transactionType",
            "transactionDescription",
            "debitAmount",
            "creditAmount",
            "balance",
            "category",
            "locationCity",
            "locationCountry",
            "transactionAmount"]
    }

    /**
     * get a comparator function that compare the given key, if key is transactionNumber, compare them by regarding them as numbers
     * @param key data for compare
     */
    static curryCompare(key: TransactionDataAttrs, desc = false) {
        assert(TransactionData.getColumnNames().includes(key))

        if (desc === false) {
            // number value
            if (['debitAmount', 'creditAmount', 'balance', 'date'].includes(key)) {
                return (a: TransactionData, b: TransactionData) => {
                    return (a[key] as number) - (b[key] as number);
                }
                // string can be convert to number
            } else if (key === 'transactionNumber') {
                return (a: TransactionData, b: TransactionData) => {
                    return parseInt(a[key]) - parseInt(b[key]);
                }
                // string
            } else {
                return (a: TransactionData, b: TransactionData) => {
                    return (a[key]) > (b[key]) ? 1 : -1;
                }
            }
        } else {
            if (['debitAmount', 'creditAmount', 'balance', 'date'].includes(key)) {
                return (a: TransactionData, b: TransactionData) => {
                    return (b[key] as number) - (a[key] as number);
                }
            } else if (key === 'transactionNumber') {
                return (a: TransactionData, b: TransactionData) => {
                    return parseInt(b[key]) - parseInt(a[key]);
                }
            } else {
                return (a: TransactionData, b: TransactionData) => {
                    return (b[key]) > (a[key]) ? 1 : -1;
                }
            }
        }
    }

    // * reference: user2501097. (2016, December 5). Answer to ‘JavaScript calculate the day of the year (1—366)’. Stack Overflow. https://stackoverflow.com/a/40975730
    public get dayOfYear() {
        return (Date.UTC(this.date.getFullYear(), this.date.getMonth(), this.date.getDate()) - Date.UTC(this.date.getFullYear(), 0, 0)) / 24 / 60 / 60 / 1000;
    }
    public get transactionAmount() {
        return this.isCredit() ? this.creditAmount : this.debitAmount
    }
    public isCredit() {
        if (this.creditAmount === 0 && this.debitAmount >= 0) {
            return false
        } else if (this.creditAmount >= 0 && this.debitAmount === 0) {
            return true
        } else {
            throw new Error('both creditamount and debit amount is greater than 0');
        }
    }
    private getValue(key: TransactionDataAttrs) {
        if (['debitAmount', 'creditAmount', 'balance', 'date'].includes(key)) {
            return
        }
    }

}

/**
 * a class represent transactiondata plus it's rfm infomation (monetaryAvgDay, frequencyAvgDay, recency)
 */
export class TransactionDataWithRFMInfo extends TransactionData {

}
export class CTransaction {
    readonly date: Date | null;
    readonly transactionNumber: string;
    readonly transactionType: string;
    readonly transactionDescription: string;
    readonly debitAmount: number;
    readonly creditAmount: number;
    readonly balance: number;
    readonly category: string;
    readonly locationCity: string;
    readonly locationCountry: string;

    constructor(
        transactionNumber: string,
        date: Date | null,
        transactionType: string,
        transactionDescription: string,
        debitAmount: number,
        creditAmount: number,
        balance: number,
        category: string,
        locationCity: string,
        locationCountry: string) {

        this.transactionNumber = transactionNumber;
        this.date = date;
        this.transactionType = transactionType;
        this.transactionDescription = transactionDescription;
        this.debitAmount = debitAmount;
        this.creditAmount = creditAmount;
        this.balance = balance;
        this.category = category;
        this.locationCity = locationCity;
        this.locationCountry = locationCountry;
    }

    get year(): number | null {
        return this.date == null ? null : this.date.getFullYear()
    }
    get month(): number | null {
        return this.date == null ? null : this.date.getMonth()
    }
    get dayOfMonth(): number | null {
        return this.date == null ? null : this.date.getDate()
    }
    get dayOfWeek(): number | null {
        return this.date == null ? null : this.date.getDay()
    }
    get direction(): string {
        if (this.debitAmount == 0) {
            return 'credit';
        } else if (this.creditAmount == 0) {
            return 'debit';
        } else {
            throw new Error(`both credit amount and debit amount is 0, transactionNumber=${this.transactionNumber}`);
        }
    }

    get attributes(): ETransactionVariable[] {
        return [
            ETransactionVariable.transactionNumber,
            ETransactionVariable.date,
            ETransactionVariable.transactionType,
            ETransactionVariable.transactionDescription,
            ETransactionVariable.debitAmount,
            ETransactionVariable.creditAmount,
            ETransactionVariable.balance,
            ETransactionVariable.category,
            ETransactionVariable.locationCity,
            ETransactionVariable.locationCountry
        ]
    }

}

/**
 * RFM data fetched from the server should look like this
 */
export interface IRFMDataFromAPI {
    recency: number;
    monetaryAvgDay: number;
    monetaryAvgWeek: number;
    monetaryAvgMonth: number;
    monetaryAvgYear: number;
    frequencyAvgDay: number;
    frequencyAvgWeek: number;
    frequencyAvgMonth: number;
    frequencyAvgYear: number;
    transactionDescription: string;
    isCredit: boolean;
}

/**
 * a class represent RFMData
 */

export class RFMData {
    readonly recency: number;
    readonly monetary: { avgDay: number, avgWeek: number; avgMonth: number; avgYear: number; };
    readonly frequency: { avgDay: number, avgWeek: number; avgMonth: number; avgYear: number; };
    readonly transactionDescription: string;
    readonly isCredit: boolean;
    constructor(recency: number,
        monetary: { avgDay: number, avgWeek: number, avgMonth: number, avgYear: number },
        frequency: { avgDay: number, avgWeek: number, avgMonth: number, avgYear: number },
        transactionDescription: string,
        isCredit: boolean) {
        /** @readonly **/
        this.recency = recency;
        this.monetary = monetary;
        this.frequency = frequency;
        this.transactionDescription = transactionDescription;
        this.isCredit = isCredit;
    }

    /**
     * (total transaction amount) / (last date - first date + 1)
     */
    public get monetaryAvgDay(): number {
        return this.monetary.avgDay;
    }

    /** @deprecated */
    public get monetaryAvgWeek(): number {
        return this.monetary.avgWeek;
    }
    /** @deprecated */
    public get monetaryAvgMonth(): number {
        return this.monetary.avgMonth;
    }
    /** @deprecated */
    public get monetaryAvgYear(): number {
        return this.monetary.avgYear;
    }

    /**
    * (times of transaction) / (last date - first date + 1)
    */
    public get frequencyAvgDay(): number {
        return this.frequency.avgDay;
    }
    /** @deprecated */
    public get frequencyAvgWeek(): number {
        return this.frequency.avgWeek;
    }
    /** @deprecated */
    public get frequencyAvgMonth(): number {
        return this.frequency.avgMonth;
    }
    /** @deprecated */
    public get frequencyAvgYear(): number {
        return this.frequency.avgYear;
    }

}
/**
 * 
 * @param returnType CTransaction or TransactionData
 * @returns a function that can convert ITransactionData, which is the data fetched from the server, to the type defined by returnType.
 */
export function curryCleanFetchedTransactionData(returnType: string, parseTime: (arg0: string) => Date | null): ((d: ITransactionDataFromAPI) => CTransaction) | ((d: ITransactionDataFromAPI) => TransactionData) {
    switch (returnType) {
        case 'CTransaction':
            return function (d: ITransactionDataFromAPI): CTransaction {
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
            return function (d: ITransactionDataFromAPI): TransactionData {
                /**
                 * take an ITransactionData object, return a TransactionData object 
                 */
                const transanctionNumber: string = d['Transaction Number'];
                const date: Date | null = parseTime(d['Transaction Date']);
                if (date === null) {
                    throw new Error(`date can't not be parese as Date; transaction numbe: ${d["Transaction Number"]}`,);
                }
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

export function cleanFetchedITransactionDataFromPythonAPI(d: ITransactionDataFromPythonAPI): TransactionData {
    const transactionNumber: string = String(d.transactionNumber);
    const date: Date = new Date(d.transactionDate);
    const transactionType: string = d.transactionType;
    const transactionDescription: string = d.transactionDescription;
    const debitAmount: number = d.debitAmount === null ? 0 : d.debitAmount
    const creditAmount: number = d.creditAmount === null ? 0 : d.creditAmount
    const balance: number = d.balance
    const category: string = d.category
    const locationCity: string = d.locationCity
    const locationCountry: string = d.locationCountry
    const transaction: TransactionData = new TransactionData(transactionNumber,
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

/**
 * Create a curried function that accepts the fetched RFMData and returns a RFMData which convert number in string format to number
 * @param returnType - The type of object to be returned. Currently, only 'RFMData' is supported.
 * @returns A function that accepts the fetched RFMData and returns a clean RFMData object.
 * @throws Error if the returnType is invalid.
 */
export function curryCleanFetchedRFMData(returnType: string): (fetchedRFMData: IRFMDataFromAPI) => RFMData {
    switch (returnType) {
        case 'RFMData':
            return function (fetchedRFMData: IRFMDataFromAPI): RFMData {
                return new RFMData(fetchedRFMData.recency,
                    { avgDay: fetchedRFMData.monetaryAvgDay, avgWeek: fetchedRFMData.monetaryAvgWeek, avgMonth: fetchedRFMData.monetaryAvgMonth, avgYear: fetchedRFMData.monetaryAvgYear },
                    { avgDay: fetchedRFMData.frequencyAvgDay, avgWeek: fetchedRFMData.frequencyAvgWeek, avgMonth: fetchedRFMData.frequencyAvgMonth, avgYear: fetchedRFMData.frequencyAvgYear },
                    fetchedRFMData.transactionDescription, fetchedRFMData.isCredit)
            }
        default:
            throw new Error(`invalid parameter 'returnType': ${returnType}, must be 'RFMData`);

    }
}