import { createContext } from "react";

export const ScaleContext = createContext<{
    scaleX: d3.ScaleLinear<number, number, never> | undefined;
    scaleY: d3.ScaleLinear<number, number, never> | undefined;
    scaleColour: number[] & d3.ScaleLinear<number, number, never> | undefined;
    scaleSize: d3.ScaleLinear<number, number, never> | undefined;
    scaleShape: ((shapeValue: boolean) => "circle" | "rect") | undefined;
}>({ scaleX: undefined, scaleY: undefined, scaleColour: undefined, scaleSize: undefined, scaleShape: undefined }
)