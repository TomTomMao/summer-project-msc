import { useAppSelector } from "@/app/hooks";
import { TransactionData } from "../utilities/DataObject";
import { ClusterData } from "../utilities/clusterDataObject";
import { PublicScale } from "../utilities/types";
import { useMemo } from "react";
import { ClusterView2Props } from "../components/ClusterView/ClusterView2";
import * as d3 from 'd3'
export function usePrepareClusterViewData(transactionDataArr: TransactionData[] | null, clusterDataArr: ClusterData[], colourScale: PublicScale['colourScale'] | null): ClusterView2Props['data'] | null {
    const xLable = useAppSelector(state => state.clusterView.x);
    const yLable = useAppSelector(state => state.clusterView.y);
    const colour = useAppSelector(state => state.clusterView.colour);
    const clusterDataMap = useMemo(() => {
        const clusterDataMap = new Map();
        clusterDataArr.forEach(clusterData => clusterDataMap.set(clusterData.transactionNumber, clusterData.clusterId))
        return clusterDataMap
    }, [clusterDataArr])
    const { clusterViewColourScale, valueForColour }: { clusterViewColourScale: PublicScale['colourScale'] | null, valueForColour: string[] | null } = useMemo(() => {
        if (transactionDataArr === null || transactionDataArr.length === 0) {
            return { clusterViewColourScale: null, valueForColour: null }
        } else {
            let valueForColour: string[] = []
            let interpolater: (t: number) => string
            if (colour === 'cluster') {
                valueForColour = transactionDataArr.map(transactionData => clusterDataMap.get(transactionData.transactionNumber))
                interpolater = d3.interpolatePuOr
            } else if (colour === 'frequencyUniqueKey') {
                valueForColour = transactionDataArr.map(transactionData => transactionData.frequencyUniqueKey)
                interpolater = d3.interpolatePiYG
            } else if (colour === 'category') {
                valueForColour = transactionDataArr.map(transactionData => transactionData[colour])
                return { clusterViewColourScale: colourScale, valueForColour: valueForColour }
            }
            const colourDomain = Array.from(new Set(valueForColour))
            if (colourDomain[0] === undefined || colourDomain[1] === undefined) {
                throw new Error("colourDomain value undefined!");
            }
            const colourRange = d3.quantize(t => interpolater(t * 0.8 + 0.1), colourDomain.length).reverse();//https://github.com/d3/d3-scale-chromatic
            const clusterViewColourScale = d3.scaleOrdinal(colourDomain, colourRange)
            console.log(clusterViewColourScale, valueForColour)
            return { clusterViewColourScale, valueForColour }
        }
    }, [colour, transactionDataArr, clusterDataMap, colourScale])
    const data = useMemo(() => {
        if (transactionDataArr === null || clusterViewColourScale === null || valueForColour === null) {
            return null;
        }
        // let colourData: string[] = [];
        // if (colour === 'cluster') {
        //     colourData = transactionDataArr.map(transactionData => clusterDataMap.get(transactionData.transactionNumber))
        // } else if (colour === 'category') {
        //     colourData = transactionDataArr.map(transactionData => colourScale(transactionData.category))
        // } else if (colour === 'frequencyUniqueKey') {
        //     colourData = toNumerical(transactionDataArr.map(transactionData => transactionData.frequencyUniqueKey))
        // } else {
        //     throw Error('invalid colour')
        // }

        return {
            xData: transactionDataArr.map(transactionData => transactionData[xLable]),
            yData: transactionDataArr.map(transactionData => transactionData[yLable]),
            colourData: valueForColour.map(value => clusterViewColourScale(value))
        }
    }, [valueForColour, clusterViewColourScale, xLable, yLable, transactionDataArr])
    const preparedClusterViewData = useMemo(() => {
        if (data === null) {
            return null
        }
        const preparedClusterViewData = [
            {
                type: 'scattergl' as const,
                mode: 'markers' as const,
                x: data.xData,
                y: data.yData,
                marker: {
                    size: 5,
                    color: data.colourData
                }
            },
        ]
        return preparedClusterViewData
    }, [data])
    return preparedClusterViewData
}

/**
 * given an array of string, map them to number-like string
 */
function toNumerical(categoricalData: Array<string>): Array<string> {
    const map = new Map<string, number>();
    let i = 0
    categoricalData.forEach(datum => {
        if (map.has(datum) === false) {
            map.set(datum, i);
            i = i + 1
        }
    })
    return categoricalData.map(datum => String(map.get(datum)))
}