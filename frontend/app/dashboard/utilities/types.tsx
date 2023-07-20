import { TransactionData } from "./DataObject";

export type PublicScale = { colourScale: d3.ScaleOrdinal<string, string, never> };
export type PublicValueGetter = { colour: (d: TransactionData) => string; }