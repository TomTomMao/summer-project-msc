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
