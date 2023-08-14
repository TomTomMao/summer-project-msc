
'use client'

import { PlotSelectionEvent } from 'plotly.js';
import React, { useEffect, useState } from 'react'
import Plot, { Figure } from 'react-plotly.js';

export interface ClusterView2Props {
    data: Plotly.Data[];
    layout: Partial<Plotly.Layout>;
    handleSelectIndex: (selectedDataIndex: number[]) => void
}
/**
 * reference https://github.com/plotly/react-plotly.js/blob/master/README.md
 * @param param0 
 * @returns 
 */
export default function ClusterView2({ data, layout, handleSelectIndex }: ClusterView2Props) {
    const [figure, setFigure] = useState<Figure>({ data: { ...data }, layout: { ...layout }, frames: [] })


    const handleSelected: (event: Readonly<PlotSelectionEvent>) => void = (event) => {

        let pointIndexes: number[] = [];

        if (event) {
            pointIndexes = event.points.map(point => point.pointIndex)
        }
        handleSelectIndex(pointIndexes)


    }

    useEffect(() => { setFigure({ data, layout, frames: figure.frames }) }, [data, layout])

    return (

        <Plot
            data={figure.data}
            layout={figure.layout}
            frames={figure.frames === null ? undefined : figure.frames}
            onInitialized={(figure) => setFigure(figure)}
            onUpdate={(nextFigure) => {
                setFigure(nextFigure)
            }}
            onSelected={handleSelected}
        />
    );
}
