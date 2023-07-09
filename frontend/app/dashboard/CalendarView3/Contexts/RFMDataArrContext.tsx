import { createContext } from "react";
import { RFMData } from "../../DataObject";
export const RFMDataArrContext = createContext<RFMData[]|undefined>(undefined);
export const RFMDataMapContext = createContext<Map<String, number>|undefined>(undefined);