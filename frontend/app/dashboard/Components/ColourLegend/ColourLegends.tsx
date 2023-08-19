'use client'
import * as colourChannelSlice from "../ColourChannel/colourChannelSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import * as interactivitySlice from "../Interactivity/interactivitySlice";
import { useCategoryColourScale, useClusterIdColourScale, useFrequencyUniqueKeyColourScale } from "../../hooks/useColourScales";
import { useMemo } from "react";
import { GRAY1 } from "../../utilities/consts";

export function CategoryColourLegend() {
    const dispatch = useAppDispatch()

    const highLightedDomainArr = useAppSelector(interactivitySlice.selectSelectedCategoryArr)
    const domainArr = useAppSelector(colourChannelSlice.selectCategoryColourDomain)
    const toggleActionCreator = interactivitySlice.toggleCategory

    const highLightedDomainSet = useMemo(() => new Set(highLightedDomainArr), [highLightedDomainArr])
    const toggleSelect = (domainValue: string) => dispatch(toggleActionCreator(domainValue))

    const colourScale = useCategoryColourScale()

    const colourMappingArr = domainArr.map(domainValue => {
        return {
            domain: domainValue,
            value: colourScale.getColour(domainValue),
            highLighted: highLightedDomainSet.has(domainValue)
        }
    })
    return (
        <div style={{ width: '130px', overflowX: 'scroll' }}>
            Category
            {colourMappingArr.map(colourMapping => {
                return (
                    <div onClick={() => toggleSelect(colourMapping.domain)} key={colourMapping.domain} style={{ width: '180px', fontSize: '10px', display: "flex", height: '1.5em' }}>
                        <div style={{ position: 'absolute', backgroundColor: 'white', margin: 0, padding: 0, width: '1.5em', height: '1.5em' }}>
                            <div style={{
                                backgroundColor: colourMapping.highLighted ? colourMapping.value : GRAY1,
                                width: '1em', height: '1em',
                                display: 'block',
                                // opacity: colourMapping.highLighted ? 1 : 0.3,
                                marginTop: '2px',
                                left: '0.4em'
                            }}></div>
                        </div>
                        <div className="ml-4">
                            {colourMapping.domain}
                        </div>
                    </div>)
            })}
        </div>
    )
}

export function FrequencyUniqueKeyColourLegend() {
    const dispatch = useAppDispatch()

    const highLightedDomainArr = useAppSelector(interactivitySlice.selectSelectedFrequencyUniqueKeyArr)
    const domainArr = useAppSelector(colourChannelSlice.selectFrequencyUniqueKeyColourDomain)
    const toggleActionCreator = interactivitySlice.toggleFrequencyUniqueKey

    const highLightedDomainSet = useMemo(() => new Set(highLightedDomainArr), [highLightedDomainArr])
    const toggleSelect = (domainValue: string) => dispatch(toggleActionCreator(domainValue))

    const colourScale = useFrequencyUniqueKeyColourScale()

    const colourMappingArr = domainArr.map(domainValue => {
        return {
            domain: domainValue,
            value: colourScale.getColour(domainValue),
            highLighted: highLightedDomainSet.has(domainValue)
        }
    })
    return (
        <div style={{ width: '130px', overflowX: 'scroll' }}>
            Frequency UniqueKey
            {colourMappingArr.map(colourMapping => {
                return (
                    <div onClick={() => toggleSelect(colourMapping.domain)} key={colourMapping.domain} style={{ width: '180px', fontSize: '10px', display: "flex", height: '1.5em' }}>
                        <div style={{ position: 'absolute', backgroundColor: 'white', margin: 0, padding: 0, width: '1.5em', height: '1.5em' }}>
                            <div style={{
                                backgroundColor: colourMapping.highLighted ? colourMapping.value : GRAY1,
                                width: '1em', height: '1em',
                                display: 'block',
                                // opacity: colourMapping.highLighted ? 1 : 0.3,
                                marginTop: '2px',
                                left: '0.4em'
                            }}></div>
                        </div>
                        <div className="ml-4">
                            {colourMapping.domain}
                        </div>
                    </div>)
            })}
        </div>
    )
}
export function ClusterIdColourLegend() {
    const dispatch = useAppDispatch()

    const highLightedDomainArr = useAppSelector(interactivitySlice.selectSelectedClusterIdArr)
    const domainArr = useAppSelector(colourChannelSlice.selectClusterIdColourIdDomain)
    const toggleActionCreator = interactivitySlice.toggleClusterId

    const highLightedDomainSet = useMemo(() => new Set(highLightedDomainArr), [highLightedDomainArr])
    const toggleSelect = (domainValue: string) => dispatch(toggleActionCreator(domainValue))

    const colourScale = useClusterIdColourScale()

    const colourMappingArr = domainArr.map(domainValue => {
        return {
            domain: domainValue,
            value: colourScale.getColour(domainValue),
            highLighted: highLightedDomainSet.has(domainValue)
        }
    })
    return (
        <div style={{ width: '130px', overflowX: 'scroll' }}>
            Cluster Id
            {colourMappingArr.map(colourMapping => {
                return (
                    <div onClick={() => toggleSelect(colourMapping.domain)} key={colourMapping.domain} style={{ width: '180px', fontSize: '10px', display: "flex", height: '1.5em' }}>
                        <div style={{ position: 'absolute', backgroundColor: 'white', margin: 0, padding: 0, width: '1.5em', height: '1.5em' }}>
                            <div style={{
                                backgroundColor: colourMapping.highLighted ? colourMapping.value : GRAY1,
                                width: '1em', height: '1em',
                                display: 'block',
                                // opacity: colourMapping.highLighted ? 1 : 0.3,
                                marginTop: '2px',
                                left: '0.4em'
                            }}></div>
                        </div>
                        <div className="ml-4">
                            {colourMapping.domain}
                        </div>
                    </div>)
            })}
        </div>
    )
}
