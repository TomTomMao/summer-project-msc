import { timeParse } from "d3";
import { TransactionData } from "./DataObject";
import serverConfig from '../../../serverConfig.json'

export const parseTime = timeParse('%d/%m/%Y')
export const apiUrl = `http://${serverConfig.hostname}`;
console.log(apiUrl)

/**
 * value getter for getting the domain value of the public scale
 */
export const PUBLIC_VALUEGETTER = { colour: (d: TransactionData) => d.category }

export const GRAY1 = 'RGB(233,233,233)'