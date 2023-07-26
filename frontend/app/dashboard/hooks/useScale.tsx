import { useMemo } from "react";
import { TransactionData } from "../utilities/DataObject";
import * as d3 from 'd3'

type Datum = TransactionData
type ChannelName = 'x' | 'y' | 'colour';
type Accessor = (datum: Datum) => number | string

export function useScale<DataType, DomainType, RangeType>(data: DataType[], channelName: ChannelName, accessor: (datum: DataType) => DomainType, range: [RangeType, RangeType]) {
    const scale = useMemo(() => {


    }, [data, channelName, accessor])
}
useScale<TransactionData>
function getScales(transactionDataArr: TransactionData[],
    valueGetterWithSwap: ClusterViewValueGetterWithSwap,
    width: number, height: number):
    (useLogScale: boolean) => ClusterViewPrivateScale {
    return (useLogScale) => {
        const scaleFuncForYandXSwap = useLogScale ? d3.scaleLog : d3.scaleLinear;
        let xScale, yScale, xScaleSwap, yScaleSwap;
        const xLim = d3.extent(transactionDataArr, valueGetterWithSwap.x);
        const xLimSwap = d3.extent(transactionDataArr, valueGetterWithSwap.getXSwap);
        const yLim = d3.extent(transactionDataArr, valueGetterWithSwap.y);
        const yLimSwap = d3.extent(transactionDataArr, valueGetterWithSwap.getYSwap);
        // set the scales based on the Lims state
        if (xLim[0] === undefined && xLim[1] === undefined) {
            xScale = d3.scaleLinear().domain([0, 366]).range([0, width]);
        } else {
            xScale = d3.scaleLinear().domain([xLim[0], xLim[1]]).range([0, width]);
        }
        if (xLimSwap[0] === undefined && xLimSwap[1] === undefined) {
            xScaleSwap = scaleFuncForYandXSwap().domain([0, 366]).range([width * 0.01, width * 0.99]);
        } else {
            xScaleSwap = scaleFuncForYandXSwap().domain([xLimSwap[0], xLimSwap[1]]).range([width * 0.01, width * 0.99]);
        }
        if (yLim[0] === undefined && yLim[1] === undefined) {
            yScale = scaleFuncForYandXSwap().domain([0, 1]).range([height * 0.99, height * 0.01]);
        } else {
            yScale = scaleFuncForYandXSwap().domain([yLim[0], yLim[1]]).range([height * 0.99, height * 0.01]);
        }
        if (yLimSwap[0] === undefined && yLimSwap[1] === undefined) {
            yScaleSwap = d3.scaleLinear().domain([0, 1]).range([height, 0]);
        } else {
            yScaleSwap = d3.scaleLinear().domain([yLimSwap[0], yLimSwap[1]]).range([height * 0.99, 0]);
        }
        return { xScale, yScale, xScaleSwap, yScaleSwap };
    };
}
