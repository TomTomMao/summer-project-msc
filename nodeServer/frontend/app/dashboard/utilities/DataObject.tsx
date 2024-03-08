'use client';

import assert from "assert";
import { Day } from "../components/CalendarView3/CalendarView3";
import { isNumber } from "./isNumeric";



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

        for (let i = 0; i < transactionNumber.length; i++) {
            if (parseInt(transactionNumber[i]) === undefined) {
                throw new Error(`invalid transactionNumber: '${transactionNumber}', int must be string with digit`);
            }
        }
        this.transactionNumber = transactionNumber;

        this.date = date;
        this.transactionType = transactionType;
        this.transactionDescription = transactionDescription;

        if (debitAmount === 0 && creditAmount === 0) {
            throw new Error("invalid argument, either debitAmount or creditAmount should be 0");
        }
        if (debitAmount < 0) {
            throw new Error('invalid debitAmount, it must be 0 or greater than 0')
        }
        if (creditAmount < 0) {
            throw new Error('invalid creditAmount, it must be 0 or greater than 0')
        }
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
            } else if (key === 'transactionNumber') {
                return (a: TransactionData, b: TransactionData) => {
                    return parseInt(a[key]) - parseInt(b[key]);
                }
            } else if (key === 'frequencyUniqueKey') {
                return (a: TransactionData, b: TransactionData) => {
                    if (isNumber(a.frequencyUniqueKey) && isNumber(b.frequencyUniqueKey)) {
                        return parseInt(a[key]) - parseInt(b[key]);
                    } else {
                        return (a[key]) > (b[key]) ? 1 : -1;
                    }
                }
            } else {
                // string
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
            } else if (key === 'frequencyUniqueKey') {
                return (a: TransactionData, b: TransactionData) => {
                    if (isNumber(a.frequencyUniqueKey) && isNumber(b.frequencyUniqueKey)) {
                        return parseInt(b[key]) - parseInt(a[key]);
                    } else {
                        return (b[key]) > (a[key]) ? 1 : -1;
                    }
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
    /**
     * return: 1-31, day of the month
     */
    public get day() {
        return this.date.getDate()
    }

    /**
     * return: 1-12, month of year
     */
    public get month() {
        return this.date.getMonth() + 1
    }

    public get year() {
        return this.date.getFullYear()
    }

    public get calendarDay(): Day {
        return {
            day: this.day,
            month: this.month,
            year: this.year
        }
    }

    /**
     * example: jan first: 1-1; Sep 29: 9-29; no 0 digit at the beginning
     */
    public get MMDD(): string {
        return `${this.month}-${this.day}`
    }
}

export type TransactionDataNumericalAttrs = { [K in keyof TransactionData]: TransactionData[K] extends number ? K : never; }[keyof TransactionData]