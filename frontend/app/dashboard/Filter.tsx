import { CTransaction, ETransactionVariable } from "./Transaction";

class Filter {
    constructor() {
    }
    checkValue(dataPoint: number | string | null | undefined) {
        return false
    }
}

interface IQFilterData {
    attribute: ETransactionVariable, includeLeft: boolean,
    includeRight: boolean, left: number | null, right: number | null
}

class QuantatitiveFilter extends Filter {
    qFilterData: IQFilterData;
    constructor(qfilterData: IQFilterData) {
        super();
        this.qFilterData = qfilterData
    }
    checkDataPoint(transaction: CTransaction) {
        if (this.qFilterData.left === null && this.qFilterData.right === null) { return true }
        else if(this.qFilterData.left !== null && this.qFilterData.right ===null) {
            if (this.qFilterData.includeLeft && transaction[this.qFilterData.attribute] >= this.qFilterData.left) {}
        } 
    }

}