'use client';
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
export class TransactionData {
    readonly date: Date | null;
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
export class RFMData {
    readonly recency: number;
    readonly monetary: { avgWeek: number; avgMonth: number; avgYear: number; };
    readonly frequency: { avgWeek: number; avgMonth: number; avgYear: number; };
    readonly transactionDescription: string;
    constructor(recency: number, monetary: { avgWeek: number, avgMonth: number, avgYear: number },
        frequency: { avgWeek: number, avgMonth: number, avgYear: number },
        transactionDescription: string) {
        this.recency = recency;
        this.monetary = monetary;
        this.frequency = frequency;
        this.transactionDescription = transactionDescription;
    }

    public get monetaryAvgWeek(): number {
        return this.monetary.avgWeek;
    }
    public get monetaryAvgMonth(): number {
        return this.monetary.avgMonth;
    }
    public get monetaryAvgYear(): number {
        return this.monetary.avgYear;
    }
    
    public get frequencyAvgWeek(): number {
        return this.frequency.avgWeek;
    }
    public get frequencyAvgMonth(): number {
        return this.frequency.avgMonth;
    }
    public get frequencyAvgYear(): number {
        return this.frequency.avgYear;
    }

}

/**
 * transaction data fetched from the server should look like this
 */
export interface ITransactionData {
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
/**
 * RFM data fetched from the server should look like this
 */
export interface IRFMData {
    recency: number;
    monetaryAvgWeek: number;
    monetaryAvgMonth: number;
    monetaryAvgYear: number;
    frequencyAvgWeek: number;
    frequencyAvgMonth: number;
    frequencyAvgYear: number;
    transactionDescription: string;
  }
  
/**
 * 
 * @param returnType CTransaction or TransactionData
 * @returns a function that can convert ITransactionData, which is the data fetched from the server, to the type defined by returnType.
 */
export function curryCleanFetchedTransactionData(returnType: string, parseTime: (arg0: string) => Date | null): ((d: ITransactionData) => CTransaction) | ((d: ITransactionData) => TransactionData) {
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

/**
 * Create a curried function that accepts the fetched RFMData and returns a RFMData which convert number in string format to number
 * @param returnType - The type of object to be returned. Currently, only 'RFMData' is supported.
 * @returns A function that accepts the fetched RFMData and returns a clean RFMData object.
 * @throws Error if the returnType is invalid.
 */
export function curryCleanFetchedRFMData(returnType: string): (fetchedRFMData: IRFMData) => RFMData {
    switch (returnType) {
        case 'RFMData':
            return function (fetchedRFMData: IRFMData): RFMData {
                return new RFMData(fetchedRFMData.recency,
                    { avgWeek: fetchedRFMData.monetaryAvgWeek, avgMonth: fetchedRFMData.monetaryAvgMonth, avgYear: fetchedRFMData.monetaryAvgYear },
                    { avgWeek: fetchedRFMData.frequencyAvgWeek, avgMonth: fetchedRFMData.frequencyAvgMonth, avgYear: fetchedRFMData.frequencyAvgYear },
                    fetchedRFMData.transactionDescription)
            }
        default:
            throw new Error(`invalid parameter 'returnType': ${returnType}, must be 'RFMData`);

    }
}