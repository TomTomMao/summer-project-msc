'use client';

import assert from "assert";


export type TransactionDataAttrs = "dayOfYear" | "transactionAmount" | "date" | "transactionNumber" | "transactionType" | "transactionDescription" | "debitAmount" | "creditAmount" | "balance" | "category" | "locationCity" | "locationCountry" | "frequency" | "frequencyUniqueKey";
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
    readonly locationCountry: string;
    readonly frequency: number;
    readonly frequencyUniqueKey: string;
    constructor(
        transactionNumber: string,
        date: Date,
        transactionType: string,
        transactionDescription: string,
        debitAmount: number,
        creditAmount: number,
        balance: number,
        category: string,
        locationCity: string,
        locationCountry: string,
        frequency: number,
        frequencyUniqueKey: string) {

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
        this.frequency = frequency;
        this.frequencyUniqueKey = frequencyUniqueKey
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
            "transactionAmount",
            "frequency",
            "frequencyUniqueKey"]
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
            } else if (key === 'transactionNumber' || key === 'frequencyUniqueKey') {
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
            } else if (key === 'transactionNumber' || key === 'frequencyUniqueKey') {
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

}