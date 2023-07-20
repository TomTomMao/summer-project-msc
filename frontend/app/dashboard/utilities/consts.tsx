import { timeParse } from "d3";
import { TransactionData } from "./DataObject";

export const parseTime = timeParse('%d/%m/%Y')
export const apiUrl = 'http://localhost:3030';

/**
 * value getter for getting the domain value of the public scale
 */
export const PUBLIC_VALUEGETTER = { colour: (d: TransactionData) => d.category }
