
'use client'

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PlotSelectionEvent } from 'plotly.js';
import React, { useEffect, useState } from 'react'
import Plot, { Figure } from 'react-plotly.js';
import * as clusterViewSlice from './clusterViewSlice'

export interface ClusterView2Props {
    initData: Plotly.Data[];
    initLayout: Partial<Plotly.Layout>;
    handleSelectIndex: (selectedDataIndex: number[]) => void
}
/**
 * reference https://github.com/plotly/react-plotly.js/blob/master/README.md
 * @param param0 
 * @returns 
 */
export default function ClusterView2({ initData, initLayout, handleSelectIndex }: ClusterView2Props) {
    const [figure, setFigure] = useState<Figure>({ data: initData , layout: initLayout , frames: [] })

    if (figure === undefined) {
        throw new Error('figure')
    }
    if (figure.data === undefined) {
        console.log('figure debug', figure)
        throw new Error('figure.data is not defined, search "figure debug" in console')
    }
    const datum = figure.data[0]
    let selectedpoints: number[] | undefined;
    if ('selectedpoints' in datum) {
        selectedpoints = datum.selectedpoints as number[]
    } else {
        selectedpoints = undefined
    }
    console.log(datum, selectedpoints)
    useEffect(() => {
        if (selectedpoints !== undefined) {
            handleSelectIndex(selectedpoints)
        } else {
            handleSelectIndex([])
        }
    }, [selectedpoints])

    useEffect(() => { setFigure({ data: initData, layout: initLayout, frames: figure.frames }) }, [initData, initLayout])

    return (

        <Plot
            data={figure.data}
            layout={figure.layout}
            frames={figure.frames === null ? undefined : figure.frames}
            onInitialized={(figure) => setFigure(figure)}
            onUpdate={(nextFigure) => {
                setFigure(nextFigure)
            }}
        />
    );
}
