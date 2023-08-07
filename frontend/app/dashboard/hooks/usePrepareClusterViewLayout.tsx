import { useAppSelector } from "@/app/hooks";
import * as clusterViewSlice from '../components/ClusterView/clusterViewSlice'
export function usePrepareClusterViewLayout() {
    const width = useAppSelector(clusterViewSlice.selectCurrentContainerWidth);
    const height = useAppSelector(clusterViewSlice.selectCurrentContainerHeight);
    const title = useAppSelector(state => state.clusterView.title);
    const xType: 'log' | 'linear' = useAppSelector(state => state.clusterView.xLog) ? 'log' : 'linear';
    const yType: 'log' | 'linear' = useAppSelector(state => state.clusterView.yLog) ? 'log' : 'linear';
    return { width, height, title, xType, yType }
}