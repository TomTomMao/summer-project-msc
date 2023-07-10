export class DataPerTransactionDescription {
    readonly transactionDescription: string;
    readonly monetaryAvgDay: number;
    readonly frequencyAvgDay: number;
    readonly amountToday: number;
    readonly timeToday: number;
    readonly isCredit: boolean;

    constructor(
        transactionDescription: string,
        monetaryAvgDay: number,
        frequencyAvgDay: number,
        amountToday: number,
        timeToday: number,
        isCredit: boolean
    ) {
        if (transactionDescription === null || transactionDescription === undefined) {
            throw new Error("transactionDescription must be defined");
        }
        if (monetaryAvgDay === null || monetaryAvgDay === undefined) {
            throw new Error("monetaryAvgDay must be defined");
        }
        if (frequencyAvgDay === null || frequencyAvgDay === undefined) {
            throw new Error("frequencyAvgDay must be defined");
        }
        if (amountToday === null || amountToday === undefined) {
            throw new Error("amountToday must be defined");
        }
        if (timeToday === null || timeToday === undefined) {
            throw new Error("timeToday must be defined");
        }
        if (isCredit === null || isCredit === undefined) {
            throw new Error("isCredit must be defined");
        }
        this.transactionDescription = transactionDescription;
        this.monetaryAvgDay = monetaryAvgDay;
        this.frequencyAvgDay = frequencyAvgDay;
        this.amountToday = amountToday;
        this.timeToday = timeToday;
        this.isCredit = isCredit;
    }
}
