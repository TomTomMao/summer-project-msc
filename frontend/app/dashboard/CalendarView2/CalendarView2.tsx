'use client'

import { useEffect, useRef, useState } from "react";
import { TransactionData } from "../DataObject";
import * as d3 from "d3";
import styles from './styles.module.css'

const NumberWeeks = 12;
const NumberDays = 5;
Date.prototype.getWeek = function () {
    var target = new Date(this.valueOf());
    var dayNr = (this.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    var firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() != 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    return 1 + Math.ceil((firstThursday - target) / 604800000);
}


// a comonent, has the knowledge: 
export default function CalendarView2({ rawData, startDate, CALENDARVIEWCONFIG }: { rawData: TransactionData[], startDate: Date, CALENDARVIEWCONFIG: any }) {
    // transfer data from rawdata to the data like this: {weekday: 'monday', weeknumber:'w48', month:'december', }
    const [donutWidth, setDonutWidth] = useState(80)
    const [highLightName, setHighLightName] = useState('all')
    const categories = ['all', ...CATEGORIES]


    const categoryOptions = categories.map(category => {
        return (
            <option key={category}>{category}</option>
        )
    }
    )
    return (<div className="m-1 bg-red-300 p-1">
        This is the calendar view's top level div
        <Test><h1>This is the container for testing calendar view</h1>
            highLightCategory:
            <select name="" id="" value={highLightName} onChange={(e) => setHighLightName(e.target.value)}>
                {categoryOptions}
            </select>
            <table>
                <tr>
                    {/* years and months */}
                    <td className={styles.emptyYearCell}></td>
                    <td className={styles.yearMonthCell}>2020</td>
                    <td className={styles.yearMonthCell}></td>
                    <td className={styles.yearMonthCell}></td>
                    <td className={styles.yearMonthCell}></td>
                    <td className={styles.yearMonthCell}>2021</td>
                    <td className={styles.yearMonthCell}></td>
                    <td className={styles.yearMonthCell}></td>
                    <td className={styles.yearMonthCell}></td>
                    <td className={styles.yearMonthCell}></td>
                    <td className={styles.yearMonthCell}></td>
                    <td className={styles.yearMonthCell}></td>
                    <td className={styles.yearMonthCell}></td>
                </tr>
                <tr>
                    <td className={styles.emptyWeekdayCell}></td>
                    <td className={styles.weekCell}>W49</td>
                    <td className={styles.weekCell}>W50</td>
                    <td className={styles.weekCell}>W51</td>
                    <td className={styles.weekCell}>W52</td>
                    <td className={styles.weekCell}>W1</td>
                    <td className={styles.weekCell}>W2</td>
                    <td className={styles.weekCell}>W3</td>
                    <td className={styles.weekCell}>W4</td>
                    <td className={styles.weekCell}>W5</td>
                    <td className={styles.weekCell}>W6</td>
                    <td className={styles.weekCell}>W7</td>
                    <td className={styles.weekCell}>W8</td>
                </tr>
                {WEEKDAYS.map(weekday => {
                    return (
                        <tr key={weekday}>
                            <td className={styles.weekdayCell}>{weekday.slice(0, 3)}</td>
                            {DonutsData.get(weekday).map(donutData => {
                                return (
                                    <td className={styles.glyphCell}><DonutChart highLightName={highLightName} data={donutData} width={donutWidth}></DonutChart></td>
                                )
                            })}
                        </tr>
                    )
                })}
            </table></Test>
        <Test>This is the container for test dateGetWeek function<br></br><TestDateGetWeek></TestDateGetWeek></Test>
        <Test>This is the container for test donut<DonutChart data={DONUTDATA2} width={50}></DonutChart></Test>
    </div>)
}
function TestDateGetWeek() {
    const [date, setDate] = useState(new Date())
    return <>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        number of week: {' ' + new Date(date).getWeek()}
    </>
}
function Test({ children }) {
    return (<div className="m-1 bg-orange-500 p-1">
        <h1>testing</h1>
        {children}
    </div>)
}

// https://observablehq.com/@d3/donut-chart/2?intent=fork
function DonutChart({ data = DONUTDATA2, width, highLightName }: {
    data: {
        name: string;
        outerValue: number;
        innerValue: number;
        lineValue: number;
        outerDot: boolean;
        innerDot: boolean;
    }[], width: number, highLightName: string
}) {
    // https://www.pluralsight.com/guides/drawing-charts-in-react-with-d3
    const ref = useRef(null);
    useEffect(() => { draw(); return clear }, [data, width, highLightName]);
    const height = Math.min(width, 500);
    const radius = Math.min(width, height) / 2

    const arc = d3.arc()
        .innerRadius(radius * 0.8) // magic numbers to remove
        .outerRadius(radius - 1);// magic numbers to remove

    const pie = d3.pie()
        .padAngle(1 / radius)
        .sort(null)
        .value(d => 1);

    const innerArc = d3.arc()
        .innerRadius(radius * 0.6)// magic numbers to remove
        .outerRadius(radius * 0.8 - 1);// magic numbers to remove

    const innerPie = d3.pie()
        .padAngle(1 / radius)
        .sort(null)
        .value(d => 1); // constant angle

    console.log(pie(data))


    const clear = () => {
        ref.current.innerHTML = "";
    }

    const draw = () => {
        // update scale, draw elements
        const color = d3.scaleSequential()
            .domain(data.map(d => [d.innerValue, d.outerValue]).flat())
            .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse());
        const svg = d3.select(ref.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .attr("style", "max-width: 100%; height: auto;");
        if (highLightName === 'all') {

            svg.append("g")
                .selectAll()
                .data(pie(data))
                .join("path")
                .attr("fill", d => color(d.data.outerValue))
                .attr("d", arc)
            // .append("title")
            // .text(d => `${d.data.name}: ${d.data.value.toLocaleString()}`);

            svg.append("g")
                .selectAll()
                .data(innerPie(data))
                .join("path")
                .attr("fill", d => color(d.data.innerValue))
                .attr("d", innerArc)
            // .append("title")
            // .text(d => `${d.data.name}: ${d.data.value.toLocaleString()}`);
        } else {
            console.log('highLighted:', highLightName)
            svg.append("g")
                .selectAll()
                .data(pie(data))
                .join("path")
                .attr("fill", d => {
                    if (d.data.name === highLightName) {
                        return color(d.data.outerValue)
                    } else {
                        return '#CAC7C7'
                    }
                })
                .attr("d", arc)
            // .append("title")
            // .text(d => `${d.data.name}: ${d.data.value.toLocaleString()}`);

            svg.append("g")
                .selectAll()
                .data(innerPie(data))
                .join("path")
                .attr("fill", d => {
                    if (d.data.name === highLightName) {
                        return color(d.data.innerValue)
                    } else {
                        return '#CAC7C7'
                    }
                })
                .attr("d", innerArc)
            // .append("title")
            // .text(d => `${d.data.name}: ${d.data.value.toLocaleString()}`);
        }

        // append text
        // svg.append("g")
        //     .attr("font-family", "sans-serif")
        //     .attr("font-size", 12)
        //     .attr("text-anchor", "middle")
        //     .selectAll()
        //     .data(pie(data))
        //     .join("text")
        //     .attr("transform", d => `translate(${arc.centroid(d)})`)
        //     .call(text => text.append("tspan")
        //         .attr("y", "-0.4em")
        //         .attr("font-weight", "bold")
        //         .text(d => d.data.name))
        //     .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
        //         .attr("x", 0)
        //         .attr("y", "0.7em")
        //         .attr("fill-opacity", 0.7)
        //         .text(d => d.data.value.toLocaleString("en-US")));
    }
    return (
        <>
            <svg ref={ref}></svg>
        </>
    )
}

// function CalendarColumn({data})
const DONUTDATA2 = [
    {
        "name": "Savings",
        "outerValue": 4.64641220663093,
        "innerValue": 9.377249205289697,
        "lineValue": 3,
        "outerDot": true,
        "innerDot": true
    },
    {
        "name": "Groceries",
        "outerValue": 9.70843311828619,
        "innerValue": 8.787942740273259,
        "lineValue": 1,
        "outerDot": true,
        "innerDot": false
    },
    {
        "name": "Others",
        "outerValue": 1.5126033997396304,
        "innerValue": 6.758441548151016,
        "lineValue": 3,
        "outerDot": true,
        "innerDot": false
    },
    {
        "name": "",
        "outerValue": 5.345560696917829,
        "innerValue": 0.6087702477500723,
        "lineValue": 4,
        "outerDot": false,
        "innerDot": true
    },
    {
        "name": "Entertainment",
        "outerValue": 5.328446582725076,
        "innerValue": 7.881194766829611,
        "lineValue": 3,
        "outerDot": true,
        "innerDot": true
    },
    {
        "name": "Services",
        "outerValue": 14.386338657529048,
        "innerValue": 9.151398388395,
        "lineValue": 0,
        "outerDot": false,
        "innerDot": false
    },
    {
        "name": "Amazon",
        "outerValue": 8.730448021583364,
        "innerValue": 4.178919639294783,
        "lineValue": 4,
        "outerDot": true,
        "innerDot": true
    },
    {
        "name": "Investment",
        "outerValue": 8.70632082272902,
        "innerValue": 8.570736379530189,
        "lineValue": 1,
        "outerDot": false,
        "innerDot": true
    },
    {
        "name": "Supplementary Income",
        "outerValue": 12.900149406872591,
        "innerValue": 9.574475655435773,
        "lineValue": 0,
        "outerDot": true,
        "innerDot": true
    },
    {
        "name": "Dine Out",
        "outerValue": 9.713084076800268,
        "innerValue": 2.0921847393104365,
        "lineValue": 4,
        "outerDot": true,
        "innerDot": false
    },
    {
        "name": "Travel",
        "outerValue": 10.277465021650015,
        "innerValue": 0.05444484480079392,
        "lineValue": 0,
        "outerDot": true,
        "innerDot": true
    },
    {
        "name": "Bills",
        "outerValue": 12.147092852363908,
        "innerValue": 0.6481958397134013,
        "lineValue": 2,
        "outerDot": true,
        "innerDot": true
    },
    {
        "name": "Other Shopping",
        "outerValue": 11.540910254269827,
        "innerValue": 2.5370910475548403,
        "lineValue": 2,
        "outerDot": true,
        "innerDot": true
    },
    {
        "name": "Cash",
        "outerValue": 11.60544213799113,
        "innerValue": 8.624980625785405,
        "lineValue": 4,
        "outerDot": true,
        "innerDot": true
    },
    {
        "name": "Home Improvement",
        "outerValue": 11.77407459537752,
        "innerValue": 6.315965801239618,
        "lineValue": 4,
        "outerDot": true,
        "innerDot": true
    },
    {
        "name": "Hotels",
        "outerValue": 13.354442479500975,
        "innerValue": 9.769051637889127,
        "lineValue": 3,
        "outerDot": false,
        "innerDot": true
    },
    {
        "name": "Travel Reimbursement",
        "outerValue": 5.2440759095180836,
        "innerValue": 6.367083431509732,
        "lineValue": 3,
        "outerDot": true,
        "innerDot": true
    },
    {
        "name": "Safety Deposit Return",
        "outerValue": 3.7715443934089334,
        "innerValue": 2.323479962422801,
        "lineValue": 0,
        "outerDot": true,
        "innerDot": true
    },
    {
        "name": "Interest",
        "outerValue": 2.943531559995629,
        "innerValue": 4.603439833910312,
        "lineValue": 2,
        "outerDot": false,
        "innerDot": true
    },
    {
        "name": "Fitness",
        "outerValue": 8.305997563196296,
        "innerValue": 8.84468979904625,
        "lineValue": 0,
        "outerDot": true,
        "innerDot": true
    },
    {
        "name": "Paycheck",
        "outerValue": 12.92823287191569,
        "innerValue": 3.4849893986673153,
        "lineValue": 4,
        "outerDot": false,
        "innerDot": true
    },
    {
        "name": "Food Shopping",
        "outerValue": 7.349526406502484,
        "innerValue": 0.687790953166092,
        "lineValue": 4,
        "outerDot": true,
        "innerDot": false
    },
    {
        "name": "Clothes",
        "outerValue": 3.560718451060948,
        "innerValue": 6.840005803957155,
        "lineValue": 2,
        "outerDot": true,
        "innerDot": false
    },
    {
        "name": "Services/Home Improvement",
        "outerValue": 9.45048471917046,
        "innerValue": 9.522063100486566,
        "lineValue": 2,
        "outerDot": false,
        "innerDot": true
    },
    {
        "name": "Account transfer",
        "outerValue": 5.3172546468374335,
        "innerValue": 4.389745892045491,
        "lineValue": 3,
        "outerDot": true,
        "innerDot": false
    },
    {
        "name": "Mortgage",
        "outerValue": 9.564405149533625,
        "innerValue": 0.673956516338734,
        "lineValue": 3,
        "outerDot": true,
        "innerDot": true
    },
    {
        "name": "Insurance",
        "outerValue": 5.372632405617944,
        "innerValue": 7.935085680728633,
        "lineValue": 4,
        "outerDot": true,
        "innerDot": true
    },
    {
        "name": "Rent",
        "outerValue": 4.590871721138598,
        "innerValue": 9.562728512377612,
        "lineValue": 2,
        "outerDot": false,
        "innerDot": true
    },
    {
        "name": "Purchase of uk.eg.org",
        "outerValue": 5.604832851345418,
        "innerValue": 9.91638018419971,
        "lineValue": 3,
        "outerDot": true,
        "innerDot": true
    },
    {
        "name": "Groceries ",
        "outerValue": 4.785176393087872,
        "innerValue": 8.05977120782751,
        "lineValue": 3,
        "outerDot": true,
        "innerDot": false
    },
    {
        "name": "Health",
        "outerValue": 7.132979791471347,
        "innerValue": 9.14849953398221,
        "lineValue": 4,
        "outerDot": true,
        "innerDot": true
    }
]
const CATEGORIES = Array.from(DONUTDATA2.map(d => d.name))
function getRandomDonutData() {
    return DONUTDATA2.map(d => {
        return {
            ...d,
            outerValue: d.outerValue * Math.random(),
            innerValue: d.innerValue * Math.random()
        }
    })
}
const DonutsData = new Map()
const WEEKDAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
WEEKDAYS.forEach(weekday => {
    DonutsData.set(weekday, [])
    for (let i = 0; i < 12; i++) {
        DonutsData.get(weekday).push(getRandomDonutData())
    }
})
