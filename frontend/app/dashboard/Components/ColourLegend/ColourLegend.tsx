import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { PublicScale } from "../../utilities/types";

const DEFAULT_COLOUR_LEGEND_WIDTH = 5;
const DEFAULT_COLOUR_LEGEND_HEIGHT = 5;



export default function ColourLegendList({ colourScale }: { colourScale: PublicScale['colourScale'] }) {
    // const highLightedColourDomainValueSet = useAppSelector()

    const colourMappingArr = colourScale.domain().map(domain => {
        return {
            domain: domain,
            value: colourScale(domain)
        }
    })
    return (<div className="grid grid-col-1 grid-flow-row gap-0">
        {colourMappingArr.map(colourMapping => {
            return (
                <div key={colourMapping.domain} style={{ border: '1px solid black', width: 'fit-content',fontSize:'10px'}}>
                    <div style={{ backgroundColor: colourMapping.value, width:'1em', height:'1em', display:'inline-block'}}></div>
                    {colourMapping.domain}
                </div>)
        })}
    </div>)
}

