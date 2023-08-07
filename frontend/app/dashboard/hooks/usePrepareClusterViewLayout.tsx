import { useAppSelector } from "@/app/hooks";
import * as clusterViewSlice from '../components/ClusterView/clusterViewSlice'
import { useMemo } from "react";
import { ClusterView2Props } from "../components/ClusterView/ClusterView2";
export function usePrepareClusterViewLayout(): ClusterView2Props['layout'] {
    const width = useAppSelector(clusterViewSlice.selectCurrentContainerWidth);
    const height = useAppSelector(clusterViewSlice.selectCurrentContainerHeight);
    const title = useAppSelector(state => state.clusterView.title);
    const xType: 'log' | 'linear' = useAppSelector(state => state.clusterView.xLog) ? 'log' : 'linear';
    const yType: 'log' | 'linear' = useAppSelector(state => state.clusterView.yLog) ? 'log' : 'linear';
    const data = useMemo(() => {
        return { width, height, title, xType, yType }
    }, [width, height, title, xType, yType])
    const preparedLayout = useMemo(() => {
        const clusterView2Layout = {
            width: data.width,
            height: data.height,
            title: data.title,
            xaxis: { type: data.xType, autorange: true },
            yaxis: { type: data.yType, autorange: true }
        }
        return clusterView2Layout
    }, [data])
    return preparedLayout
}