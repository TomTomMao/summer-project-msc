import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { PublicScale } from "../../utilities/types";
import * as colourLegendSlice from './colourLegendSlice'

export default function ColourLegendList({ colourScale }: { colourScale: PublicScale['colourScale'] }) {
    const dispatch = useAppDispatch()
    const domainArr = colourScale.domain();
    const highLightedDomainSet = useAppSelector(colourLegendSlice.selectHighLightedColourDomainValueSet);
    const allHighLighted = highLightedDomainSet.size === domainArr.length
    const colourMappingArr = domainArr.map(domain => {
        return {
            domain: domain,
            value: colourScale(domain),
            highLighted: allHighLighted || highLightedDomainSet.has(domain)
        }
    })
    const toggleHighLight = (domainToToggle: string) => {
        if (highLightedDomainSet.size === 1 && highLightedDomainSet.has(domainToToggle)) {
            dispatch(colourLegendSlice.initColourDomainInfo(domainArr))
        } else {
            dispatch(colourLegendSlice.highLightOneColourDomainValue(domainToToggle))
        }
    }
    return (<div className="grid grid-col-1 grid-flow-row gap-0">
        {colourMappingArr.map(colourMapping => {
            return (
                <div key={colourMapping.domain} style={{ border: '1px solid black', width: 'fit-content', fontSize: '10px' }}>
                    <div onClick={() => toggleHighLight(colourMapping.domain)} style={{
                        backgroundColor: colourMapping.value,
                        width: '1em', height: '1em',
                        display: 'inline-block',
                        opacity: colourMapping.highLighted ? 1 : 0.3,
                        border: (!allHighLighted) && colourMapping.highLighted ? '1px solid black' : ''
                    }}></div>
                    {colourMapping.domain}
                </div>)
        })}
    </div>)
}