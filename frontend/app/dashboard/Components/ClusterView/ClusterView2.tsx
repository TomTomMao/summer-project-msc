
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
    const [figure, setFigure] = useState<Figure>({ data: { ...initData }, layout: { ...initLayout }, frames: [] })
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
    // function handleSelected(event: Readonly<PlotSelectionEvent>) {
    //     if (Object.getOwnPropertyNames(figure.layout).includes('dragmode')) {
    //         console.log('bug1', figure.layout)
    //         let pointIndexes: number[] = [];

    //         if (event) {
    //             pointIndexes = event.points.map(point => point.pointIndex)
    //         }
    //         if (Object.getOwnPropertyNames(figure.data).includes('selectedpoints')) {
    //             handleSelectIndex(figure.data['selectedpoints'])
    //         }
    //         console.log('flag1')
    //     } else {
    //         handleSelectIndex([])
    //         console.log('flag2')
    //     }
    // }

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
