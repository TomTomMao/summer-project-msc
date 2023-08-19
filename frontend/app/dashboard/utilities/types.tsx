import { ScaleOrdinalWithTransactionNumber } from "../hooks/useColourScales";
import { TransactionData } from "./DataObject";

export type PublicScale = { colourScale: ScaleOrdinalWithTransactionNumber};
export type PublicValueGetter = { colour: (d: TransactionData) => string; }