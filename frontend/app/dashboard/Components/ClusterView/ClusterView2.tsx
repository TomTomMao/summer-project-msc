
'use client'

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { PlotSelectionEvent } from 'plotly.js';
import React, { useEffect, useState } from 'react'
import Plot, { Figure } from 'react-plotly.js';
import * as clusterViewSlice from './clusterViewSlice'
import useClusterData, { useClusterDataMap } from '../../hooks/useClusterData';
import { useTransactionDataArr } from '../../hooks/useTransactionData';
import { useCategoryColourScale, useClusterIdColourScale, useFrequencyUniqueKeyColourScale } from '../../hooks/useColourScales';
import { TransactionData } from '../../utilities/DataObject';
import { ClusterData } from '../../utilities/clusterDataObject';
import * as interactivitySlice from '../Interactivity/interactivitySlice';

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
    const clusterDataMap = useClusterDataMap() // useappselector + usememo
    const transactionDataArr = useTransactionDataArr() // more reusable, so use custum hook.
    const selectedTransactionNumberSetMemorised = useAppSelector(interactivitySlice.selectSelectedTransactionNumberSetMemorised)

    const xLable = useAppSelector(state => state.clusterView.x);
    const yLable = useAppSelector(state => state.clusterView.y);
    const colour = useAppSelector(state => state.clusterView.colour);
    const colourDataDomain = useAppSelector(clusterViewSlice.selectColourDomain)
    const categoryColourScale = useCategoryColourScale()// can't be put in the store so use hook
    const clusterIdColourScale = useClusterIdColourScale()// can't be put in the store so use hook
    const frequencyUniqueKeyColourScale = useFrequencyUniqueKeyColourScale()// can't be put in the store so use hook
    const colourScale = colour === 'category' ? categoryColourScale : colour === 'cluster' ? clusterIdColourScale : frequencyUniqueKeyColourScale // can't be put in the store so use hook
    
    const xData = useAppSelector(clusterViewSlice.selectXdata)
    const yData = useAppSelector(clusterViewSlice.selectYdata)
    const colourData = colourDataDomain.map(value => colourScale.getColour(value.domain, value.transactionNumber))
    
    
    
    const [figure, setFigure] = useState<Figure>({ data: initData, layout: initLayout, frames: [] })

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
