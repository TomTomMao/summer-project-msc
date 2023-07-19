type ColourMapping = { name: string, colour: string };
const DEFAULT_COLOUR_LEGEND_WIDTH = 5;
const DEFAULT_COLOUR_LEGEND_HEIGHT = 5;

export default function ColourLegendList({ colourMappings }: { colourMappings: ColourMapping[] }) {

    return (<div >
        {colourMappings.map(colourMapping => <ColourLegend colourMapping={colourMapping}></ColourLegend>)}
    </div>)
}


function ColourLegend({ colourMapping }: { colourMapping: ColourMapping }) {
    return (<>
        <div>
            <Rectangle colour={colourMapping.colour} width={DEFAULT_COLOUR_LEGEND_WIDTH} height={DEFAULT_COLOUR_LEGEND_HEIGHT}></Rectangle>{colourMapping.name}
        </div>
    </>)
}

function Rectangle({ colour, width, height }: { colour: string, width: number, height: number }) {
    return <div style={{ width: width, height: height, backgroundColor: colour }}></div>
}

