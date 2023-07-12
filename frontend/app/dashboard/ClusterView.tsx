'use client';
import { useState, useEffect, useRef, useContext, useMemo } from "react";
import { TransactionData, RFMData } from "./DataObject";
import { DescriptionAndIsCredit } from "./TableView/TableView";
import { ValueGetterContext } from "./CalendarView3/Contexts/ValueGetterContext";
import * as d3 from 'd3';
import { DataPerTransactionDescription } from "./CalendarView3/DataPerTransactionDescription";
import { getDataPerTransactionDescription } from "./CalendarView3/getDataPerTransactionDescription";
import { getRFMDataMapFromArr } from "./CalendarView3/getRFMDataMapFromArr";
import { DomainLimits } from "./page";

/**
 * render a cluster view using scatter plot
 *
 */
export function ClusterView({ transactionDataArr, RFMDataArr, height, width, onSelect, selectedDescriptionAndIsCreditArr, domainLimitsObj, onChangeDomain }: {
    transactionDataArr: TransactionData[];
    RFMDataArr: RFMData[];
    height: number;
    width: number;
    onSelect: (transactionDescription: TransactionData['transactionDescription'], isCredit: boolean) => void;
    selectedDescriptionAndIsCreditArr: DescriptionAndIsCredit[];
    domainLimitsObj: { xLim: DomainLimits, yLim: DomainLimits, colourLim: DomainLimits, sizeLim: DomainLimits }
}) {
    const margin = { top: 10, right: 30, bottom: 30, left: 30 };
    const valueGetter = useContext(ValueGetterContext);
    const RFMDataMap: Map<string, number> = useMemo(() => getRFMDataMapFromArr(RFMDataArr), [RFMDataArr]);
    const dataPerTransactionDescriptionArr: DataPerTransactionDescription[] = useMemo(() => {
        // rollup by year, month, day, reduce to transactionDescription.
        const d = getDataPerTransactionDescription(transactionDataArr, RFMDataArr, RFMDataMap);
        return d;
    }, [transactionDataArr, RFMDataArr]);
    const { xLim, yLim, colourLim, sizeLim } = domainLimitsObj;
    // set the scales based on the Lims state
    const scaleX = d3.scaleLinear().domain([xLim.min, xLim.max]).range([0, width]);
    const scaleY = d3.scaleLinear().domain([yLim.min, yLim.max]).range([height, 0]);
    const scaleColour = d3.scaleLinear().domain([colourLim.min, colourLim.max]).range(["blue", "red"]);
    const scaleSize = d3.scaleLinear().domain([sizeLim.min, sizeLim.max]).range([5, 20]);
    const scaleShape = (shapeValue: boolean) => (shapeValue ? 'circle' : 'rect');

    const svgRef = useRef(null); //svg ref
    const xAxisRef = useRef(null); // x axis ref
    const yAxisRef = useRef(null); // x axis ref
    const pointsAreaRef = useRef(null); //points ref

    const draw = () => {
        const svg = d3.select(svgRef.current);
        const chartG = d3.select(pointsAreaRef.current);
        const xAxisG = d3.select(xAxisRef.current);
        const yAxisG = d3.select(yAxisRef.current);

        // add x axis
        const xAxis = d3.axisBottom(scaleX);
        xAxisG.call(xAxis);
        // add y axis
        const yAxis = d3.axisLeft(scaleY);
        yAxisG.call(yAxis);
        // add points
        chartG.selectAll('circle')
            .data(dataPerTransactionDescriptionArr, d => { return `${d.transactionDescription}`; })
            .join('circle')
            .attr('stroke', (d: DataPerTransactionDescription) => {
                const isSelected = selectedDescriptionAndIsCreditArr.filter((descriptionAndIsCredit) => {
                    return d.transactionDescription === descriptionAndIsCredit.transactionDescription && d.isCredit == descriptionAndIsCredit.isCredit;
                }).length >= 1;
                return (isSelected ? "black" : null);
            })
            // .transition()
            // .duration(500)
            .attr('cx', (d: DataPerTransactionDescription) => scaleX(valueGetter.x(d)))
            .attr('cy', (d: DataPerTransactionDescription) => scaleY(valueGetter.y(d)))
            .attr('r', (d: DataPerTransactionDescription) => scaleSize(valueGetter.size(d)))
            .style('fill', (d: DataPerTransactionDescription) => scaleColour(valueGetter.colour(d)));

        chartG.selectAll('circle').on('click', (event, d) => onSelect(d.transactionDescription, d.isCredit));
        // zoom effect, ref: https://observablehq.com/@d3/pan-zoom-axes
        const zoom = d3.zoom()
            .scaleExtent([1, 40])
            .translateExtent([[-100, -100], [width + 90, height + 100]])
            .filter(filter)
            .on("zoom", zoomed);
        // return Object.assign(svg.call(zoom).node(), { reset });
        svg.call(zoom)
        function zoomed({ transform }) {
            chartG.attr("transform", transform);
            // onChangeDomain({xDomain: transform.rescaleX(scaleX).domain(), yDomain: transform.rescaleY(scaleY).domain()});
            xAxisG.call(xAxis.scale(transform.rescaleX(scaleX)));
            yAxisG.call(yAxis.scale(transform.rescaleY(scaleY)));
        }

        function reset() {
            svg.transition()
                .duration(750)
                .call(zoom.transform, d3.zoomIdentity);
        }

        // prevent scrolling then apply the default filter
        function filter(event) {
            event.preventDefault();
            return (!event.ctrlKey || event.type === 'wheel') && !event.button;
        }
        // zoom effect copy over.


    };
    // update the charts when the scale domain Lims changed
    useEffect(draw, [xLim, yLim, colourLim, sizeLim, selectedDescriptionAndIsCreditArr]);
    return (<div>
        <svg ref={svgRef} width={width + margin.left + margin.right} height={height + margin.top + margin.bottom}>
            <g transform={`translate(${margin.left},${margin.top})`}>
                <g ref={pointsAreaRef}></g>
                <g ref={xAxisRef} transform={`translate(0,${height})`}></g>
                <g ref={yAxisRef}></g>
            </g>
        </svg>
        {/* <div>
            x limit min: <input type="number" value={xLim.min} onChange={e => parseFloat(e.target.value) < xLim.max && setXLim({ ...xLim, min: parseFloat(e.target.value) })} />
            x limit max: <input type="number" value={xLim.max} onChange={e => parseFloat(e.target.value) > xLim.min && setXLim({ ...xLim, max: parseFloat(e.target.value) })} />
            <button onClick={() => setXLim({ min: xDomainMin, max: xDomainMax })}>reset</button>
            <br />
            y limit min: <input type="number" value={yLim.min} onChange={e => parseFloat(e.target.value) < yLim.max && setYLim({ ...yLim, min: parseFloat(e.target.value) })} />
            y limit max: <input type="number" value={yLim.max} onChange={e => parseFloat(e.target.value) > yLim.min && setYLim({ ...yLim, max: parseFloat(e.target.value) })} />
            <button onClick={() => setYLim({ min: yDomainMin, max: yDomainMax })}>reset</button>
            <br />
            colour limit min: <input type="number" value={colourLim.min} onChange={e => setColourLim({ ...colourLim, min: parseFloat(e.target.value) })} />
            colour limit max: <input type="number" value={colourLim.max} onChange={e => setColourLim({ ...colourLim, max: parseFloat(e.target.value) })} />
            <button onClick={() => setColourLim({ min: colourDomainMin, max: colourDomainMax })}>reset</button>
            <br />
            <b>DONT USE THIS</b>
            size limit min: <input type="number" value={sizeLim.min} onChange={e => setSizeLim({ ...sizeLim, min: parseFloat(e.target.value) })} />
            size limit max: <input type="number" value={sizeLim.max} onChange={e => setSizeLim({ ...sizeLim, max: parseFloat(e.target.value) })} />
            <button onClick={() => setSizeLim({ min: sizeDomainMin, max: sizeDomainMax })}>reset</button>
            <br />
        </div> */}
    </div>
    );
}
/**
 * returns the min and max values of x,y,colour,size domains;
 * @param dataPerTransactionDescriptionArr this object provide an array of data
 * @param valueGetter this object provide the valueGetter functions include x, y, colour and size getter.
 * @returns min max domain values like this: { xDomainMin, xDomainMax, yDomainMin, yDomainMax, colourDomainMin, colourDomainMax, sizeDomainMin, sizeDomainMax }
 */
export function getDomainValueFromDataPerTransactionDescription(dataPerTransactionDescriptionArr: DataPerTransactionDescription[], valueGetter: {
    x: (dataPerTransactionDescription: DataPerTransactionDescription) => number;
    y: (dataPerTransactionDescription: DataPerTransactionDescription) => number;
    colour: (dataPerTransactionDescription: DataPerTransactionDescription) => number;
    size: (dataPerTransactionDescription: DataPerTransactionDescription) => number;
    shape: (dataPerTransactionDescription: DataPerTransactionDescription) => boolean;
}): { xDomainMin: number; xDomainMax: number; yDomainMin: number; yDomainMax: number; colourDomainMin: number; colourDomainMax: number; sizeDomainMin: number; sizeDomainMax: number; } {
    const xDomainMin = d3.min(dataPerTransactionDescriptionArr, valueGetter.x);
    const xDomainMax = d3.max(dataPerTransactionDescriptionArr, valueGetter.x);
    const yDomainMin = d3.min(dataPerTransactionDescriptionArr, valueGetter.y);
    const yDomainMax = d3.max(dataPerTransactionDescriptionArr, valueGetter.y);
    const colourDomainMin = d3.min(dataPerTransactionDescriptionArr, valueGetter.colour);
    const colourDomainMax = d3.max(dataPerTransactionDescriptionArr, valueGetter.colour);
    const sizeDomainMin = d3.min(dataPerTransactionDescriptionArr, valueGetter.size);
    const sizeDomainMax = d3.max(dataPerTransactionDescriptionArr, valueGetter.size);
    if (xDomainMin === undefined) {
        throw new Error("invalid xDomainMin value");
    }
    if (xDomainMax === undefined) {
        throw new Error("invalid xDomainMax value");
    }
    if (yDomainMin === undefined) {
        throw new Error("invalid yDomainMin value");
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
    return { xDomainMin, xDomainMax, yDomainMin, yDomainMax, colourDomainMin, colourDomainMax, sizeDomainMin, sizeDomainMax };
}
