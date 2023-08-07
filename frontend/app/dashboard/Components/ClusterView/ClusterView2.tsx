
'use client'

import { PlotSelectionEvent } from 'plotly.js';
import React, { useState } from 'react'
import Plot, { Figure } from 'react-plotly.js';

interface ClusterView2Props {
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
    const [figure, setFigure] = useState<Figure>({ data, layout, frames: [] })

    const handleSelected: (event: Readonly<PlotSelectionEvent>) => void = (event) => {
        let pointIndexes: number[] = [];
        console.log('onselected', event)
        if (event) {
            pointIndexes = event.points.map(point => point.pointIndex)
        }
        handleSelectIndex(pointIndexes)
    }



    return (
        <Plot
            data={figure.data}
            layout={figure.layout}
            frames={figure.frames === null ? undefined : figure.frames}
            onInitialized={(figure) => setFigure(figure)}
            onUpdate={(figure) => setFigure(figure)}
            onSelected={handleSelected}
        />
    );
}