import { useEffect, useRef } from "react";
import { GRAY1 } from "../../utilities/consts";
import { POINT_SIZE } from "./ClusterView";

/**
 * colourVisualData: a list of string in this format: 'RGB(XXX,XXX,XXX)'
 * @param param0
 * @returns render data on canvas, the GRAY1 points will be at the bottom
 */
export function Circles({ xVisualData, yVisualData, colourVisualData, width, height }: { xVisualData: number[]; yVisualData: number[]; colourVisualData: string[]; width: number; height: number; }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {

        // create a map: colour->index[]
        const colourIndexMap = new Map<string, number[]>();
        colourVisualData.forEach((colourVisualDatum, index) => {
            const currentColourIndexArr = colourIndexMap.get(colourVisualDatum);
            if (currentColourIndexArr === undefined) {
                colourIndexMap.set(colourVisualDatum, [index]);
            } else {
                currentColourIndexArr.push(index);
            }
        });


        const canvas = canvasRef.current;
        let context: CanvasRenderingContext2D | null = null;
        if (canvas !== null) {
            let hdCanvas = createHDCanvas(canvas, width, height);
            context = hdCanvas.getContext('2d');
            if (context === null) {
                return; // do nothing
            }
            // loop through the keys, for each key, draw data based on the corresponding xdata and ydata, and key(which is colour)
            const context2 = context;
            context2.clearRect(0, 0, width, height);
            // draw circles
            // make the gray values at the bottom
            const colourIndexArrGRAY1: { fill: string; indexes: number[]; }[] = [];
            const colourIndexArrNOTGRAY1: { fill: string; indexes: number[]; }[] = [];
            colourIndexMap.forEach((indexes, fill) => {
                if (fill === GRAY1) {
                    colourIndexArrGRAY1.push({ fill, indexes });
                } else {
                    colourIndexArrNOTGRAY1.push({ fill, indexes });
                }
            });
            const colourIndexArrStartGRAY1 = [...colourIndexArrGRAY1, ...colourIndexArrNOTGRAY1];
            colourIndexArrStartGRAY1.forEach(({ indexes, fill }) => {
                // reference: https://dirask.com/posts/JavaScript-draw-point-on-canvas-element-PpOBLD
                context2.fillStyle = fill;
                indexes.forEach(index => {
                    context2.beginPath();
                    context2.arc(xVisualData[index], yVisualData[index], POINT_SIZE, 0 * Math.PI, 2 * Math.PI);
                    context2.fill();
                });
            });
        }

    }, [xVisualData, yVisualData, colourVisualData]);

    return (
        <canvas ref={canvasRef} width={width} height={height}>
        </canvas>
    );
}
function createHDCanvas(canvas: HTMLCanvasElement, w: number, h: number) {
    // reference: https://juejin.cn/post/7014765000916992036
    const ratio = window.devicePixelRatio || 1;
    canvas.width = w * ratio;
    canvas.height = h * ratio;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    const ctx = canvas.getContext('2d');
    if (ctx === null) {
        throw new Error("shold be null, check args for getContext()");

    }
    ctx.scale(ratio, ratio);
    return canvas;
}
