'use client';

import * as d3 from "d3";
import { CSSProperties, MouseEvent, useEffect, useState } from "react";
import styles from './style.module.css'
import CalendarTooltip, { ITooltipLocation, ITooltipValue } from "../CalendarTooltip/CalendarTooltip";
export interface ICalendarSvgData {
    date: Date,
    colour: string,
    /**size: in pixel */
    size: number,
    shape: string,
    texture: string,
    id: string
}
export interface IcalendarSvgConfig {
    /**
     * all numbers in pixels
     */
    marginLeft: number,
    marginRight: number,
    marginTop: number,
    marginBottom: number,
    containerWidth: number,
    containerHeight: number,
}

const values1: ITooltipValue[] = [{
    targetDomain: 'x',
    sourceDomain: 'week number',
    sourceDomainValue: 1
}, {
    targetDomain: 'y',
    sourceDomain: 'day in week',
    sourceDomainValue: 2
}, {
    targetDomain: 'colour',
    sourceDomain: 'total amount of transaction',
    sourceDomainValue: 105
}]

export function CalendarSvg({ calendarSvgDataArr, calendarSvgConfig }:
    { calendarSvgDataArr: ICalendarSvgData[], calendarSvgConfig: IcalendarSvgConfig }): React.ReactNode {
    /**
     * @param {calendarSvgDataArr} ICalendarData[] assume no duplicate date
     * render a calendarSvg based on calendarData
     * this render should only be responsable for render the encoded data
     */
    // ref: https://codesandbox.io/s/github/UBC-InfoVis/2021-436V-examples/tree/master/d3-interactive-line-chart?file=/js/linechart.js
    const [tooltipLocation, setTooltipLocation] = useState<null | ITooltipLocation>(null);
    const [hoveredRectKey, setHoveredRectKey] = useState<null | ICalendarSvgData['id']>(null);
    function handleMouseEnter(id: ICalendarSvgData['id'], e: MouseEvent<SVGRectElement, globalThis.MouseEvent>) {
        setTooltipLocation({ x: e.pageX + 10, y: e.pageY + 10 })
        setHoveredRectKey(id);
    }
    let tooltipValue: ITooltipValue[] = [];



    const width = calendarSvgConfig.containerWidth - calendarSvgConfig.marginLeft - calendarSvgConfig.marginRight;
    const height = calendarSvgConfig.containerHeight - calendarSvgConfig.marginTop - calendarSvgConfig.marginBottom;
    const xBandScaleDomain: string[] = [];
    for (let i = 0; i <= 52; i++) {
        xBandScaleDomain.push(String(i))
    }
    const monthScaleDomain: string[] = [];
    for (let i = 1; i <= 12; i++) {
        monthScaleDomain.push(String(i))
    }
    const xBandScale = d3.scaleBand().domain(xBandScaleDomain).range([0, width]).paddingInner(0.1)
    const yBandScale = d3.scaleBand().domain(["1", "2", "3", "4", "5", "6", "0"]).range([0, height]).paddingInner(0.1)
    const monthScale = d3.scaleBand().domain(monthScaleDomain).range([0, width]).paddingInner(0.1)


    const dataPoints = calendarSvgDataArr.map((calendarSvgData) => {
        const week: number = getWeek(calendarSvgData.date);
        const dateOfWeek: number = calendarSvgData.date.getDay()
        return <rect
            className={styles.calendarRect}
            key={calendarSvgData.id}
            x={xBandScale(String(week))}
            y={yBandScale(String(dateOfWeek))}
            width={xBandScale.bandwidth()}
            height={yBandScale.bandwidth()}
            fill={calendarSvgData.colour}
            onMouseOver={(e) => handleMouseEnter(calendarSvgData.id, e)}></rect>
    })
    return (
        <div>
            <CalendarTooltip values={values1} location={tooltipLocation}></CalendarTooltip>
            <svg width={calendarSvgConfig.containerWidth} height={calendarSvgConfig.containerHeight}>
                <g transform={`translate(${calendarSvgConfig.marginLeft},${calendarSvgConfig.marginTop})`}>
                    {/* drawing area */}
                    {dataPoints}
                    <g>

                    </g>
                    {/* <CalendarAxisY></>
                <CalendarAxisX></> */}

                </g>
            </svg>
        </div>
    )
}

const getWeek = function (d: Date) {
    //ref: https://weeknumber.com/how-to/javascript#:~:text=To%20get%20the%20ISO%20week,getWeekYear()%20.
    var date = new Date(d.getTime());
    date.setHours(0, 0, 0, 0);
    // Thursday in current week decides the year.
    date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
    // January 4 is always in week 1.
    var week1 = new Date(date.getFullYear(), 0, 4);
    // Adjust to Thursday in week 1 and count number of weeks from date to week1.
    return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
        - 3 + (week1.getDay() + 6) % 7) / 7);
}