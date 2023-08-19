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
            value: colourScale.getColour(domain),
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
    return (
        <div style={{ width: '130px', overflowX: 'scroll'}}>
            {colourMappingArr.map(colourMapping => {
                return (
                    <div key={colourMapping.domain} style={{ width: '180px', fontSize: '10px', display: "flex", height: '1.5em' }}>
                        <div style={{position: 'absolute', backgroundColor: 'white', margin: 0, padding: 0, width: '1.5em', height: '1.5em' }}>
                            <div onClick={() => toggleHighLight(colourMapping.domain)} style={{
                                backgroundColor: colourMapping.value,
                                width: '1em', height: '1em',
                                display: 'block',
                                opacity: colourMapping.highLighted ? 1 : 0.3,
                                border: (!allHighLighted) && colourMapping.highLighted ? '1px solid black' : '',
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