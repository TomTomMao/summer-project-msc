import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { RFMData, TransactionData } from "../DataObject"
import { MONTHS, getNumberOfDaysInMonth } from "./months"
import { YearContext } from "./Contexts/YearContext";
import * as d3 from 'd3'
import { GroupedDataPerTransactionDescriptionContext } from "./Contexts/GroupedDataPerTransactionDescriptionContext";
import { ScaleContext } from "./Contexts/ScaleContext";
import { DataPerTransactionDescription } from "./DataPerTransactionDescription";
import { ValueGetterContext } from "./Contexts/ValueGetterContext";
import { getDataPerTransactionDescription } from "./getDataPerTransactionDescription";
import { getRFMDataMapFromArr } from "./getRFMDataMapFromArr";


const calendarValueGetter = {
    x: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.monetaryAvgDay,
    y: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.frequencyAvgDay,
    colour: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.amountToday,
    size: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.timeToday,
    shape: (dataPerTransactionDescription: DataPerTransactionDescription) => dataPerTransactionDescription.isCredit
}
const DayViewSvgSize = 30;
const PI = 3.14159;

export default function CalendarView3({ transactionDataArr, initCurrentYear, RFMDataArr }: { transactionDataArr: TransactionData[], initCurrentYear: number, RFMDataArr: RFMData[] }) {
    const [detailDay, setDetailDay] = useState<null | Date>(null);
    const [currentYear, setCurrentYear] = useState(initCurrentYear);
    const RFMDataMap: Map<string, number> = useMemo(() => getRFMDataMapFromArr(RFMDataArr), [RFMDataArr])
    const valueGetter = useContext(ValueGetterContext);
    
    const [k, setK] = useState(1);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const zoomingInfo = { k: k, setK: setK, x: x, setX: setX, y: y, setY: setY };// pass to the DayView
    /**
     * A map: year->month->day->DataPerTransactionDescription[]
     * the getDataPerTransactionDescription function specify how the data looks like
     * used for quick access each day's data
     */
    const groupedDataPerTransactionDescription: Map<string, Map<string, Map<string, DataPerTransactionDescription[]>>> = useMemo(() => {
        // rollup by year, month, day, reduce to transactionDescription.
        const d = d3.rollup(transactionDataArr, r => getDataPerTransactionDescription(r, RFMDataArr, RFMDataMap),
            d => `${d.date?.getFullYear()}`, d => `${d.date?.getMonth() + 1}`, d => `${d.date?.getDate()}`)
        return d
    }, [transactionDataArr, RFMDataArr])

    // calculate scales based on calendarScatterMapping and groupedDataPerTransactionDescription
    // get flatten data, used for calculate the max and min value of each domain
    const groupedDataPerTransactionDescriptionFlat: DataPerTransactionDescription[] = useMemo(() => {
        const d = d3.flatRollup(transactionDataArr, r => getDataPerTransactionDescription(r, RFMDataArr, RFMDataMap),
            d => `${d.date?.getFullYear()}`,
            d => `${d.date?.getMonth() + 1}`,
            d => `${d.date?.getDate()}`).map(x => x[3]);
        return d.flat()
    }, [transactionDataArr, RFMDataArr])
    console.log(groupedDataPerTransactionDescriptionFlat)
    const scales = useMemo(() => {
        // create scales, the getter is in valueGetter.
        const xDomainMin = 0
        const xDomainMax = d3.max(groupedDataPerTransactionDescriptionFlat, valueGetter.x);
        const yDomainMin = 0;
        const yDomainMax = d3.max(groupedDataPerTransactionDescriptionFlat, valueGetter.y);
        const colourDomainMin = d3.min(groupedDataPerTransactionDescriptionFlat, valueGetter.colour);
        const colourDomainMax = d3.max(groupedDataPerTransactionDescriptionFlat, valueGetter.colour);
        const sizeDomainMin = d3.min(groupedDataPerTransactionDescriptionFlat, valueGetter.size);
        const sizeDomainMax = d3.max(groupedDataPerTransactionDescriptionFlat, valueGetter.size);
        const shapeDomain = [true, false];
        if (xDomainMax === undefined) {
            throw new Error("invalid xDomainMax value");
        }
        if (yDomainMax === undefined) {
            throw new Error("invalid yDomainMax value");
        }
        if (colourDomainMin === undefined) {
            throw new Error("invalid colourDomainMin value");
        }
        if (colourDomainMax === undefined) {
            throw new Error("invalid colourDomainMax value");
        }
        if (sizeDomainMin === undefined) {
            throw new Error("invalid sizeDomainMin value");
        }
        if (sizeDomainMax === undefined) {
            throw new Error("invalid sizeDomainMax value");
        }
        const scaleX = d3.scaleLinear().domain([xDomainMin, xDomainMax]).range([0, DayViewSvgSize]);
        const scaleY = d3.scaleLinear().domain([yDomainMin, yDomainMax]).range([DayViewSvgSize, 0]);
        const scaleColour = d3.scaleLinear().domain([colourDomainMin, colourDomainMax]).range(["blue", "red"]);
        const scaleSize = d3.scaleLinear().domain([sizeDomainMin, sizeDomainMax]).range([1, 5]);
        const scaleShape = (shapeValue: boolean) => (shapeValue ? 'circle' : 'rect');

        const scales: {
            scaleX: d3.ScaleLinear<number, number, never>;
            scaleY: d3.ScaleLinear<number, number, never>;
            scaleColour: number[] & d3.ScaleLinear<number, number, never>;
            scaleSize: d3.ScaleLinear<number, number, never>;
            scaleShape: (shapeValue: boolean) => "circle" | "rect";
        } = { scaleX: scaleX, scaleY: scaleY, scaleColour: scaleColour, scaleSize: scaleSize, scaleShape: scaleShape }
        return scales;
    }, [groupedDataPerTransactionDescriptionFlat, valueGetter])


    function handleDetail(month: number) {
        // month is the number, if Jan, then 1, if Feb then 2.etc.
        return function (day: number) {
            setDetailDay(new Date(currentYear, month - 1, day))
        }
    }
    return (
        <div>
            <table>
                <thead>
                    <tr>
                        <td><input className="w-14" type="number" value={currentYear} onChange={(e) => e.target.value != '2014' && e.target.value != '2023' && setCurrentYear(parseInt(e.target.value))} /></td>
                        {(Array.from(Array(31).keys())).map(i => <td key={i + 1}>{i + 1}</td>)}
                    </tr>
                </thead>
                <tbody>
                    <YearContext.Provider value={currentYear}>
                        <GroupedDataPerTransactionDescriptionContext.Provider value={groupedDataPerTransactionDescription}>
                            <ScaleContext.Provider value={scales}>
                                {MONTHS.map((month, i) => <MonthView month={i + 1}
                                    key={i + 1} zoomingInfo={zoomingInfo} />)}
                            </ScaleContext.Provider>
                        </GroupedDataPerTransactionDescriptionContext.Provider>
                    </YearContext.Provider>
                </tbody>
            </table>
            {detailDay ? <div>selected Day: {detailDay.toString()}</div> : <div></div>}
            <button className="rounded-sm bg-zinc-400" onClick={() => {setK(1);setX(0);setY(0)}}>reset Zooming</button>
        </div >
    )
}

function MonthView({ month, zoomingInfo }: { month: number }) {
    // month: jan for 1, feb for 2, etc. 
    const year = useContext(YearContext);
    if (typeof (year) === 'number') {
        return (<tr>
            <td>{MONTHS[month - 1]}</td>
            {(Array.from(Array(getNumberOfDaysInMonth(year, month)).keys())).map(i =>
                <DayView day={i + 1} month={month} zoomingInfo={zoomingInfo} />)}
        </tr>)
    } else {
        throw new Error("year is undefined");
    }
}

/**
 * @param day the number of the day in the month
 * @param month the number of the month in the year
 */
function DayView({ day, month, svgSize = { width: DayViewSvgSize, height: DayViewSvgSize }, zoomingInfo }: { day: number, month: number, svgSize: { width: number, height: number } }) {
    const currentYear = useContext(YearContext);
    const groupedDataPerTransactionDescription = useContext(GroupedDataPerTransactionDescriptionContext);
    const { scaleX, scaleY, scaleColour, scaleShape, scaleSize } = useContext(ScaleContext);
    const ref = useRef(null)
    const valueGetter = useContext(ValueGetterContext);
    const { width, height } = svgSize;
    const { k, setK, x, setX, y, setY } = zoomingInfo;

    // zoom effect reference: https://codepen.io/likr/pen/vYmBEPE
    // allows zoom in
    useEffect(() => {
        const zoom = d3.zoom().on("zoom", (event) => {
            const { x, y, k } = event.transform;
            setK(k);
            setX(x);
            setY(y);
        });
        d3.select(ref.current).call(zoom);
    }, [])

    if (groupedDataPerTransactionDescription === null || currentYear === undefined
        || scaleX === undefined || scaleY === undefined || scaleColour === undefined || scaleShape === undefined || scaleSize === undefined) {
        return <td>loading</td>
    }
    const dayData: DataPerTransactionDescription[] | undefined = groupedDataPerTransactionDescription.get(String(currentYear))?.get(String(month))?.get(String(day))
    const draw = () => {
        const svg = d3.select(ref.current)


        // add points
        svg.select('g').selectAll('circle').data(dayData, d => { return `${d.transactionDescription}` }).join('circle')
            .attr('cx', (d: DataPerTransactionDescription) => scaleX(valueGetter.x(d)))
            .attr('cy', (d: DataPerTransactionDescription) => scaleY(valueGetter.y(d)))
            .attr('r', (d: DataPerTransactionDescription) => scaleSize(valueGetter.size(d)))
            .style('fill', (d: DataPerTransactionDescription) => scaleColour(valueGetter.colour(d)));
    }

    useEffect(() => dayData && draw(), [day, month, currentYear])

    // highlight the day without transaction
    if (dayData === undefined) {
        return <td className={`border-2 border-indigo-600 bg-zinc-950`} style={{ width: width, height: height }}>
            <svg ref={ref} width={width} height={height}>
            </svg>
        </td>
    }
    else {
        return (
            <td className={`border-2 border-indigo-600`} style={{ width: width, height: height }}>
                <svg ref={ref} width={width} height={height}>
                    <g transform={`translate(${x},${y})scale(${k})`}></g>
                </svg>
            </td>
        )
    }
}









