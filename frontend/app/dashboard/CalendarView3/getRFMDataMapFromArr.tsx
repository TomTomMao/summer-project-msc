import { RFMData } from "../DataObject";

/**
 *
 * @param RFMDataArr an array of RFMDataArr
 * @returns a map where the key is transactionDescription and value is the index of the RFMDataArr
 */
export function getRFMDataMapFromArr(RFMDataArr: RFMData[]): Map<string, number> {
    const RFMDataMap: Map<string, number> = new Map();
    RFMDataArr.forEach((currRFMData, index) => {
        RFMDataMap.set(currRFMData.transactionDescription, index);
    });
    return RFMDataMap;
}
