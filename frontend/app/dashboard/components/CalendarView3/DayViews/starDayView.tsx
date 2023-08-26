import { ScaleOrdinalWithTransactionNumber } from "@/app/dashboard/hooks/useColourScales";
import { ClusterData } from "@/app/dashboard/utilities/clusterDataObject";
import { Data } from "../CalendarView3";
import { ClusterDataMap } from "@/app/dashboard/hooks/useClusterData";
import {DayViewProps} from "./AbstractDayView"

export type StarViewSharedScales = {
    colourScale: ScaleOrdinalWithTransactionNumber;
    linearRadiusScale: d3.ScaleLinear<number, number>;
    logRadiusScale: d3.ScaleLogarithmic<number, number>;
    angleScale: d3.ScaleLinear<number, number>;
    clusterOrderMap: Map<ClusterData['clusterId'], number>;
}
interface StarViewData extends Data {
    clusterDataMap: ClusterDataMap
}

export interface StarDayViewProps extends DayViewProps {
    data: StarViewData;
    scales: StarViewSharedScales;
}

export function StarDayView(props: StarDayViewProps) { 
    return<>
    <button onClick={()=>console.log(props)}>consoledata</button></>
}