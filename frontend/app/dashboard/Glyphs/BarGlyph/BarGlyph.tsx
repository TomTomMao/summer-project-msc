import * as d3 from "d3"
type BarGlyphData = { id: string, xDomainValue: string, heightDomainValue: number, colourDomainValue: string }[]
type BarGlyphScales = {
    // xScale: ScaleBand<string>, // x scale should be independent between different scales.
    heightScale: d3.ScaleLinear<number, number, never>,
    colourScale: d3.ScaleOrdinal<string, number, never>
}

type Props = {
    data: BarGlyphData,
    onHoverBar: (id: string) => void,
    scales: BarGlyphScales
}
export default function BarGlyph(props: Props) {
    const { data, onHoverBar, scales } = props;

    const height = scales.heightScale.range()[0];
    const width = height;
    const xScale = d3.scaleBand().domain()
    return (
            <g>{rectangles}</g>
    )
}

const barGlyphData: BarGlyphData = [
    { id: '1', xDomainValue: 'saving the bill', heightDomainValue: 5, colourDomainValue: 'bill' },
    { id: '2', xDomainValue: 'buy apple', heightDomainValue: 1, colourDomainValue: 'dine out' },
    { id: '3', xDomainValue: 'buy stock', heightDomainValue: 1.2, colourDomainValue: 'investment' },
    { id: '4', xDomainValue: 'save the charge', heightDomainValue: 3.3, colourDomainValue: 'bill' },
    { id: '5', xDomainValue: 'sell the phone', heightDomainValue: 5.6, colourDomainValue: 'bill' },
    { id: '6', xDomainValue: 'amazon market place', heightDomainValue: 7.7, colourDomainValue: 'bill' },
    { id: '7', xDomainValue: 'x', heightDomainValue: 5, colourDomainValue: 'bill' },
    { id: '8', xDomainValue: 'xxx', heightDomainValue: 15, colourDomainValue: 'bill' },
    { id: '9', xDomainValue: 'asdfdsf', heightDomainValue: 25, colourDomainValue: 'bill' },
    { id: '10', xDomainValue: 'gagtqr', heightDomainValue: 15, colourDomainValue: 'bill' },
    { id: '11', xDomainValue: 'zxcv', heightDomainValue: 5.1, colourDomainValue: 'bill' },
    { id: '12', xDomainValue: 'cccc', heightDomainValue: 5.11, colourDomainValue: 'bill' },
    { id: '13', xDomainValue: 'saving the bill', heightDomainValue: 5.5, colourDomainValue: 'bill' },
    { id: '14', xDomainValue: 'saving the bill', heightDomainValue: 5, colourDomainValue: 'bill' },
]

const heightDomain = (d3.extent(barGlyphData, d => d.heightDomainValue))
const colourDomain = Array.from(new Set(barGlyphData.map(d => d.colourDomainValue)))
let heightScale, colourScale;
if (heightDomain[0] === undefined || heightDomain[1] === undefined) {
    throw new Error("height domain has undefined value");
} else {
    heightScale = d3.scaleLinear().domain(heightDomain)
}
if (colourDomain[0] === undefined || colourDomain[1] === undefined) {
    throw new Error("colour domain has undefined value");
} else {
    colourScale = d3.scaleOrdinal().domain(colourDomain).range(['blue', 'red', 'yellow', 'orange', 'purple'])
}