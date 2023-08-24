'use client'
import * as colourChannelSlice from "../ColourChannel/colourChannelSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import * as interactivitySlice from "../Interactivity/interactivitySlice";
import { useCategoryColourScale, useClusterIdColourScale, useFrequencyUniqueKeyColourScale } from "../../hooks/useColourScales";
import { useMemo } from "react";
import { GRAY1 } from "../../utilities/consts";
import { COLOURLEGEND_WIDTH } from "../InteractiveScatterPlot/InteractiveScatterPlot";

export function CategoryColourLegend() {
    const dispatch = useAppDispatch()

    const highLightedDomainArr = useAppSelector(interactivitySlice.selectSelectedCategoryArr)
    const domainArr = useAppSelector(colourChannelSlice.selectCategoryColourDomain)
    const toggleActionCreator = interactivitySlice.toggleCategory

    const highLightedDomainSet = useMemo(() => new Set(highLightedDomainArr), [highLightedDomainArr])
    const handleToggleSelect = (domainValue: string) => dispatch(toggleActionCreator(domainValue))

    const colourScale = useCategoryColourScale()

    const colourMappingArr = domainArr.map(domainValue => {
        return {
            domain: domainValue,
            value: colourScale.getColour(domainValue),
            highLighted: highLightedDomainSet.has(domainValue)
        }
    })
    return (
        <LegendList colourMappingArr={colourMappingArr} onToggleSelect={handleToggleSelect} label={'category'}></LegendList>
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
        <LegendList colourMappingArr={colourMappingArr} onToggleSelect={handleToggleSelect} label={'transaction description group id'}></LegendList>
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

    const colourMappingArr = domainArr.map(domainValue => {
        return {
            domain: domainValue,
            value: colourScale.getColour(domainValue),
            highLighted: highLightedDomainSet.has(domainValue)
        }
    })
    return (
        <LegendList colourMappingArr={colourMappingArr} onToggleSelect={handleToggleSelect} label={'cluster id'}></LegendList>
    )
}

function LegendList({ colourMappingArr, onToggleSelect, label, children }: {
    colourMappingArr: {
        domain: string;
        value: string;
        highLighted: boolean;
    }[],
    onToggleSelect: (domain: string) => void,
    label: string,
    children?: React.ReactNode
}) {
    return (
        <>
            <div style={{ position: 'fixed', backgroundColor: 'white', zIndex: 3, width: COLOURLEGEND_WIDTH-16.5, height: '' }}>{label}</div>
            <br />
            {label.length > 10 && <br />}
            {label.length > 20 && <br />}
            {colourMappingArr.map(colourMapping => {
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
                            {colourMapping.domain === '' ? 'unknown' : colourMapping.domain}
                        </div>
                    </div>)
            })}
        </>
    )
}