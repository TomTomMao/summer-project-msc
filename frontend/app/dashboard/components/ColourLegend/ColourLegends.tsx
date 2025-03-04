'use client'
import * as colourChannelSlice from "../ColourChannel/colourChannelSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import * as interactivitySlice from "../Interactivity/interactivitySlice";
import { useCategoryColourScale, useClusterIdColourScale, useFrequencyUniqueKeyColourScale, useHierarchicalCategoryColourScale } from "../../hooks/useColourScales";
import { useMemo, useState } from "react";
import { GRAY1 } from "../../utilities/consts";
import { COLOURLEGEND_WIDTH } from "../InteractiveScatterPlot/InteractiveScatterPlot";
import { isNumber } from "../../utilities/isNumeric";
import { DOWNARROW, UPARROW } from "../../utilities/Arrows";
import { useTransactionDataArr } from "../../hooks/useTransactionData";
import { ClusterData } from "../../utilities/clusterDataObject";
import { TransactionData } from "../../utilities/DataObject";

export function CategoryColourLegend() {
    const dispatch = useAppDispatch()

    const highLightedDomainArr = useAppSelector(interactivitySlice.selectSelectedCategoryArr)
    const domainArr = useAppSelector(colourChannelSlice.selectCategoryColourDomain)
    const toggleActionCreator = interactivitySlice.toggleCategory

    const highLightedDomainSet = useMemo(() => new Set(highLightedDomainArr), [highLightedDomainArr])
    const handleToggleSelect = (domainValue: string) => dispatch(toggleActionCreator(domainValue))

    // const colourScale = useCategoryColourScale()
    const colourScale = useHierarchicalCategoryColourScale()

    const colourMappingArr = domainArr.map(domainValue => {
        return {
            domain: domainValue,
            value: colourScale.getColour(domainValue),
            highLighted: highLightedDomainSet.has(domainValue)
        }
    })
    return (
        <LegendList colourMappingArr={colourMappingArr} onToggleSelect={handleToggleSelect} label={'Category'}></LegendList>
    )
}

export function FrequencyUniqueKeyColourLegend() {
    const dispatch = useAppDispatch()

    const highLightedDomainArr = useAppSelector(interactivitySlice.selectSelectedFrequencyUniqueKeyArr)
    const domainArr = useAppSelector(colourChannelSlice.selectFrequencyUniqueKeyColourDomain)
    const toggleActionCreator = interactivitySlice.toggleFrequencyUniqueKey

    const highLightedDomainSet = useMemo(() => new Set(highLightedDomainArr), [highLightedDomainArr])
    const handleToggleSelect = (domainValue: string) => dispatch(toggleActionCreator(domainValue))

    const colourScale = useFrequencyUniqueKeyColourScale()

    const colourMappingArr = domainArr.map(domainValue => {
        return {
            domain: domainValue,
            value: colourScale.getColour(domainValue),
            highLighted: highLightedDomainSet.has(domainValue)
        }
    })
    return (
        <LegendList colourMappingArr={colourMappingArr} onToggleSelect={handleToggleSelect} label={'Transaction Description Group ID'}></LegendList>
    )
}
export function ClusterIdColourLegend() {
    const dispatch = useAppDispatch()

    const highLightedDomainArr = useAppSelector(interactivitySlice.selectSelectedClusterIdArr)
    const domainArr = useAppSelector(colourChannelSlice.selectClusterIdColourIdDomain)
    const toggleActionCreator = interactivitySlice.toggleClusterId
    const highLightedDomainSet = useMemo(() => new Set(highLightedDomainArr), [highLightedDomainArr])
    const handleToggleSelect = (domainValue: string) => dispatch(toggleActionCreator(domainValue))

    const colourScale = useClusterIdColourScale()
    
    const transactionArr = useTransactionDataArr()
    const clusterDataArr = useAppSelector(interactivitySlice.selectClusterDataArr)
    const clusterFrequencyMap = getClusterFrequencyRange(clusterDataArr, transactionArr)
    
    const colourMappingArr = domainArr.map(domainValue => {
        return {
            domain: domainValue,
            value: colourScale.getColour(domainValue),
            highLighted: highLightedDomainSet.has(domainValue),
            frequencyRange: clusterFrequencyMap.get(domainValue)
        }
    })
    return (
        <LegendList colourMappingArr={colourMappingArr} onToggleSelect={handleToggleSelect} label={'Cluster ID (Frequency Range)'}></LegendList>
    )
}

type ColourMapping = {
    frequencyRange: undefined | { min: number, max: number };
    domain: string;
    value: string;
    highLighted: boolean;
};

function LegendList({ colourMappingArr, onToggleSelect, label, children }: {
    colourMappingArr: ColourMapping[],
    onToggleSelect: (domain: string) => void,
    label: string,
    children?: React.ReactNode
}) {
    const isDomainNumberLike = colourMappingArr.every(colourMapping => isNumber(colourMapping.domain))
    const comparatorAscending = isDomainNumberLike ?
        ((a: ColourMapping, b: ColourMapping) => parseFloat(a.domain) - parseFloat(b.domain)) :
        ((a: ColourMapping, b: ColourMapping) => a.domain > b.domain ? 1 : -1)
    const comparatorDescending = (a: ColourMapping, b: ColourMapping) => -comparatorAscending(a, b)
    const [sortBy, setSortBy] = useState<'domainDescending' | 'domainAscending' | 'colour' | 'frequencyRangeDescending' | 'frequencyRangeAscending'>(label === 'Cluster ID (Frequency Range)' ? 'frequencyRangeDescending' : 'domainDescending')
    let sortedColourMappingArr: ColourMapping[] = [...colourMappingArr]
    switch (sortBy) {
        case 'domainAscending':
            sortedColourMappingArr.sort(comparatorAscending)
            break;
        case 'domainDescending':
            sortedColourMappingArr.sort(comparatorDescending)
            break;
        case 'colour':
            break;
        case 'frequencyRangeAscending':
            sortedColourMappingArr.sort((a, b) => {
                if (a.frequencyRange === undefined || b.frequencyRange === undefined) {
                    throw new Error('frequencyRange is undefined')
                }
                return a.frequencyRange.min - b.frequencyRange.min
            }
            )
            break;
        case 'frequencyRangeDescending':
            sortedColourMappingArr.sort((a, b) => {
                if (a.frequencyRange === undefined || b.frequencyRange === undefined) {
                    throw new Error('frequencyRange is undefined')
                }
                return b.frequencyRange.min - a.frequencyRange.min
            }
            )
            break;
        default:
            const _exhaustiveCheck: never = sortBy
            throw new Error("exhaustive check error");
    }
    function handleToggleSortting() {
        if (label === 'Cluster ID (Frequency Range)') {
            if (sortBy === 'frequencyRangeAscending') {
                setSortBy('frequencyRangeDescending')
            } else if (sortBy === 'frequencyRangeDescending') {
                setSortBy('colour')
            } else {
                setSortBy('frequencyRangeAscending')
            }
        } else if (sortBy === 'colour') {
            setSortBy('domainAscending')
        } else if (sortBy === 'domainAscending') {
            setSortBy('domainDescending')
        } else if (sortBy === 'domainDescending') {
            setSortBy('colour')
        } else {
            const _exhaustiveCheck: never = sortBy
            throw new Error("exhaustive check error");
        }
    }
    const Arrow = (sortBy === 'colour' ? <span></span> : (sortBy === 'domainAscending' || sortBy === 'frequencyRangeAscending') ? DOWNARROW : UPARROW)
    return (
        <>
            <div style={{ cursor: 'pointer', position: 'absolute', backgroundColor: 'white', zIndex: 3, width: COLOURLEGEND_WIDTH - 16.5, lineHeight: '1em' }} onClick={handleToggleSortting}>{label}{Arrow}</div>
            <div style={{ height: `${label.length / 8}em` }} />
            {sortedColourMappingArr.map(colourMapping => {
                return (
                    <div onClick={() => onToggleSelect(colourMapping.domain)} key={colourMapping.domain} style={{ fontSize: '12px', display: "flex" }}>
                        <div style={{ position: 'relative', backgroundColor: 'white', margin: 0, padding: 0, width: '12px', height: '12px' }}>
                            <div style={{
                                backgroundColor: colourMapping.highLighted ? colourMapping.value : GRAY1,
                                width: '12px',
                                height: '12px',
                                display: 'block',
                                marginTop: '1.6px',
                                left: '0.4em'
                            }}></div>
                        </div>
                        <div style={{ marginLeft: '2px' }}>
                            {colourMapping.domain === '' ? 'unknown' : colourMapping.domain+ (colourMapping.frequencyRange ? ` (${colourMapping.frequencyRange.min.toFixed(2)} - ${colourMapping.frequencyRange.max.toFixed(2)})` : '')}
                        </div>
                    </div>)
            })}
        </>
    )
}

function getClusterFrequencyRange(clusterDataArr: ClusterData[], transactionArr: TransactionData[]): Map<string, { min: number, max: number }> {
    /**
     * @param clusterDataArr: ClusterData[] {clusterId: string, transactionNumber: string}
     * @param transactionArr: TransactionData[] {..., transactionNumber: string, frequency: number}
     * @returns {clusterId: string, frequencyRange: [number, number]}
     */

    const clusterDataMap: Map<string, string> = new Map()
    clusterDataArr.forEach(clusterData => {
        clusterDataMap.set(clusterData.transactionNumber, clusterData.clusterId)
    })

    const transactionArrWithClusterId = transactionArr.map(transactionData => {
        const clusterId = clusterDataMap.get(transactionData.transactionNumber)
        if (clusterId === undefined) {
            throw new Error('clusterId is undefined')
        }
        return { ...transactionData, clusterId }
    })

    const clusterFrequencyMap: Map<string, { min: number, max: number }> = new Map()
    transactionArrWithClusterId.forEach(transactionData => {
        const clusterId = transactionData.clusterId
        const frequency = transactionData.frequency
        const clusterFrequency = clusterFrequencyMap.get(clusterId)
        if (clusterFrequency === undefined) {
            clusterFrequencyMap.set(clusterId, { min: frequency, max: frequency })
        } else {
            clusterFrequency.min = Math.min(clusterFrequency.min, frequency)
            clusterFrequency.max = Math.max(clusterFrequency.max, frequency)
        }
    })
    
    return clusterFrequencyMap

}