'use client'
import { useState, useEffect, useRef, useContext, useMemo } from "react"
import { timeParse } from 'd3'
import { TransactionData, curryCleanFetchedTransactionData, curryCleanFetchedRFMData, RFMData } from "./DataObject";
import CalendarView3 from "./CalendarView3/CalendarView3";
import TableView from "./TableView/TableView";
import { ValueGetterContext, initValueGetter } from "./CalendarView3/Contexts/ValueGetterContext";
import * as d3 from 'd3';
import { DataPerTransactionDescription } from "./CalendarView3/DataPerTransactionDescription";
import { getDataPerTransactionDescription } from "./CalendarView3/getDataPerTransactionDescription";
import { getRFMDataMapFromArr } from "./CalendarView3/getRFMDataMapFromArr";

const parseTime = timeParse('%d/%m/%Y')
const apiUrl = 'http://localhost:3030';
const ClusterViewHeight = 300;
const ClusterViewWidth = 300;


export default function Page() {
    const [transactionDataArr, setTransactionDataArr] = useState<Array<TransactionData> | null>(null)
    const [RFMDataArr, setRFMDataArr] = useState<Array<RFMData> | null>(null)
    const [valueGetter, setValueGetter] = useState(initValueGetter);

    transactionDataArr && console.log('transactionDataArr fetched and cleaned:', transactionDataArr);
    RFMDataArr && console.log('RFMData fetched and cleaned:', RFMDataArr);
    useEffect(() => {
        // fetch the data and update the data state
        fetchData(parseTime).then(
            (data) => {
                const { transactionDataArr, RFMDataArr } = data;
                setTransactionDataArr(transactionDataArr);
                setRFMDataArr(RFMDataArr)
            }
        );
        setTransactionDataArr(transactionDataArr);
        setRFMDataArr(RFMDataArr)
    }, []);

    if (transactionDataArr === null || RFMDataArr === null) {
        return <>loading...</>
    }
    return (<div>
        hello data
        {/* <CalendarView transactions={data}></CalendarView> */}
        {/* <CalendarView2 rawData={data} startDate={new Date()}></CalendarView2> */}
        <ValueGetterContext.Provider value={valueGetter}>
            <CalendarView3 transactionDataArr={transactionDataArr} initCurrentYear={2016} RFMDataArr={RFMDataArr}></CalendarView3>
            <ClusterView transactionDataArr={transactionDataArr} RFMDataArr={RFMDataArr} height={ClusterViewHeight} width={ClusterViewWidth}></ClusterView>
        </ValueGetterContext.Provider>
        <TableView transactionDataArr={transactionDataArr} RFMDataArr={RFMDataArr}></TableView>
    </div>
    )


}


/**
 * fetch transactiondata and rfm data from backend, transfer them into TransactionData[] and RFMData[] 
 * @param setTransactionDataArr used for update the transac
 * @param setRFMDataArr 
 * @param parseTime 
 */
async function fetchData(parseTime: (dateString: string) => Date | null) {
    // fetch the transaction data

    try {
        const fetchedTransactionDataResponse = await fetch(`${apiUrl}/transactionData`);
        const fetchedTransactionData = await fetchedTransactionDataResponse.json();
        if (Array.isArray(fetchedTransactionData) === false) {
            console.log(fetchedTransactionData)
            throw new Error("wrong data type, fetched data should be an array");
        }
        const transactionDataArr: TransactionData[] = fetchedTransactionData.map(curryCleanFetchedTransactionData('TransactionData', parseTime));

        // fetch the rfm data
        const fetchedRFMDataResponse = await fetch(`${apiUrl}/transactionData/rfm`);
        const fetchedRFMData = await fetchedRFMDataResponse.json();
        if (Array.isArray(fetchedTransactionData) === false) {
            console.log(fetchedTransactionData)
            throw new Error("wrong data type, fetched data should be an array");
        }
        const RFMDataArr: RFMData[] = fetchedRFMData.map(curryCleanFetchedRFMData('RFMData'));

        return { transactionDataArr, RFMDataArr }
    } catch (error) {
        console.log(error);
    }
}

/**
 * render a cluster view using scatter plot
 * 
 */
function ClusterView({ transactionDataArr, RFMDataArr, height, width }:
    {
        transactionDataArr: TransactionData[],
        RFMDataArr: RFMData[],
        height: number,
        width: number
    }) {
    const margin = { top: 10, right: 30, bottom: 30, left: 30 }
    const valueGetter = useContext(ValueGetterContext);
    const RFMDataMap: Map<string, number> = useMemo(() => getRFMDataMapFromArr(RFMDataArr), [RFMDataArr])
    const dataPerTransactionDescriptionArr: DataPerTransactionDescription[] = useMemo(() => {
        // rollup by year, month, day, reduce to transactionDescription.
        const d = getDataPerTransactionDescription(transactionDataArr, RFMDataArr, RFMDataMap);
        return d
    }, [transactionDataArr, RFMDataArr])

    const scales = useMemo(() => {
        // create scales, the getter is in valueGetter.
        const xDomainMin = 0
        const xDomainMax = d3.max(dataPerTransactionDescriptionArr, valueGetter.x);
        const yDomainMin = 0;
        const yDomainMax = d3.max(dataPerTransactionDescriptionArr, valueGetter.y);
        const colourDomainMin = d3.min(dataPerTransactionDescriptionArr, valueGetter.colour);
        const colourDomainMax = d3.max(dataPerTransactionDescriptionArr, valueGetter.colour);
        const sizeDomainMin = d3.min(dataPerTransactionDescriptionArr, valueGetter.size);
        const sizeDomainMax = d3.max(dataPerTransactionDescriptionArr, valueGetter.size);
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
        const scaleX = d3.scaleLinear().domain([xDomainMin, xDomainMax]).range([0, width]);
        const scaleY = d3.scaleLinear().domain([yDomainMin, yDomainMax]).range([height, 0]);
        const scaleColour = d3.scaleLinear().domain([colourDomainMin, colourDomainMax]).range(["blue", "red"]);
        const scaleSize = d3.scaleLinear().domain([sizeDomainMin, sizeDomainMax]).range([5, 20]);
        const scaleShape = (shapeValue: boolean) => (shapeValue ? 'circle' : 'rect');

        const scales: {
            scaleX: d3.ScaleLinear<number, number, never>;
            scaleY: d3.ScaleLinear<number, number, never>;
            scaleColour: number[] & d3.ScaleLinear<number, number, never>;
            scaleSize: d3.ScaleLinear<number, number, never>;
            scaleShape: (shapeValue: boolean) => "circle" | "rect";
        } = { scaleX: scaleX, scaleY: scaleY, scaleColour: scaleColour, scaleSize: scaleSize, scaleShape: scaleShape }
        return scales;
    }, [dataPerTransactionDescriptionArr, valueGetter])

    const svgRef = useRef(null);//svg ref
    const xAxisRef = useRef(null);// x axis ref
    const yAxisRef = useRef(null);// x axis ref
    const pointsAreaRef = useRef(null)//points ref

    useEffect(() => draw(), [dataPerTransactionDescriptionArr, valueGetter]);

    const [k, setK] = useState(1);
    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    // useEffect(() => {
    //     const zoom = d3.zoom().on("zoom", (event) => {
    //         const { x, y, k } = event.transform;
    //         setK(k);
    //         setX(x);
    //         setY(y);
    //     });
    //     d3.select(svgRef.current).call(zoom);
    // }, []);

    const draw = () => {
        const svg = d3.select(svgRef.current);
        const chartG = d3.select(pointsAreaRef.current);
        const xAxisG = d3.select(xAxisRef.current);
        const yAxisG = d3.select(yAxisRef.current);

        // add x axis
        const xAxis = d3.axisBottom(scales.scaleX)
        xAxisG.call(xAxis);
        // add y axis
        const yAxis = d3.axisLeft(scales.scaleY)
        yAxisG.call(yAxis);
        // add points
        chartG.selectAll('circle').data(dataPerTransactionDescriptionArr, d => { return `${d.transactionDescription}` }).join('circle')
            .attr('cx', (d: DataPerTransactionDescription) => scales.scaleX(valueGetter.x(d)))
            .attr('cy', (d: DataPerTransactionDescription) => scales.scaleY(valueGetter.y(d)))
            .attr('r', (d: DataPerTransactionDescription) => scales.scaleSize(valueGetter.size(d)))
            .style('fill', (d: DataPerTransactionDescription) => scales.scaleColour(valueGetter.colour(d)));
    }
    return (<div>
        <svg ref={svgRef} width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}>

            <g transform={`translate(${margin.left},${margin.top})`}>
                <g transform={`translate(${x},${y})scale(${k})`}>
                    <g ref={pointsAreaRef}></g>
                </g>
                <g ref={xAxisRef} transform={`translate(0,${height})`}></g>
                <g ref={yAxisRef}></g>
            </g>

        </svg>
    </div>
    )
}

