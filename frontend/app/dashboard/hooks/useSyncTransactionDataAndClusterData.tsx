import { useAppDispatch, useAppSelector } from "@/app/hooks";
import * as clusterViewSlice from '@/app/dashboard/components/ClusterView/clusterViewSlice'
import * as interactivitySlice from "@/app/dashboard/components/Interactivity/interactivitySlice"
import * as dataAgent from "@/app/dashboard/utilities/dataAgent"
import { useEffect } from "react";

import { TransactionData } from "../utilities/DataObject";
import { ClusterData } from "../utilities/clusterDataObject";
import * as popupSlice from "../components/PopupWindow/PopupSlice";
/**
 * sycnchroise the transactionDataArr and clusterDataArr; this hook won't return any data; it just update the data in the state store
 * this 
 * based on [frequencyUniqueKey, distanceMeasure, linkageMethod, numberOfClusterForString, numberOfCluster, metric1, metric2] (from redux store), if one of those value changed, fetch data from the api server and update interactivitySlice.transactionDataArr and interactivitySlice.transactionDataArrclusterDataArr
 */
export default function useSyncTransactionDataAndClusterData() {
    const frequencyUniqueKey = useAppSelector(clusterViewSlice.selectFrequencyUniqueKey)
    const distanceMeasure = useAppSelector(clusterViewSlice.selectDistanceMeasure)
    const linkageMethod = useAppSelector(clusterViewSlice.selectLinkageMethod)
    const numberOfClusterForString = useAppSelector(clusterViewSlice.selectNumberOfClusterForString)

    const numberOfCluster = useAppSelector(clusterViewSlice.selectNumberOfCluster)
    const metric1 = useAppSelector(clusterViewSlice.selectMetric1)
    const metric2 = useAppSelector(clusterViewSlice.selectMetric2)

    const transactionDataArr = useAppSelector(interactivitySlice.selectTransactionDataArr)

    const dispatch = useAppDispatch()
    const updateTransactionDataArr = (newTransactionDataArr: TransactionData[]) => dispatch(interactivitySlice.setTransactionDataArr(newTransactionDataArr))
    const updateClusterDataArr = (newClusterDataArr: ClusterData[]) => dispatch(interactivitySlice.setClusterDataArr(newClusterDataArr))

    useEffect(() => {
        let frequencyUniqueKeyConfig: dataAgent.FrequencyUniqueKeyConfig
        if (frequencyUniqueKey === 'clusteredTransactionDescription') {
            frequencyUniqueKeyConfig = {
                frequencyUniqueKey: frequencyUniqueKey,
                per: 'month',
                stringClusterAlgorithm: "linkage",
                distanceMeasure: distanceMeasure,
                linkageMethod: linkageMethod,
                numberOfClusterForString: numberOfClusterForString,
            };
        } else {
            frequencyUniqueKeyConfig = {
                frequencyUniqueKey: frequencyUniqueKey,
                per: 'month'
            }
        }
        dispatch(popupSlice.showFetchingData())
        dataAgent.updateFrequencyInfo(frequencyUniqueKeyConfig, metric1, metric2, numberOfCluster)
            .then(newTransactionDataArr => { updateTransactionDataArr(newTransactionDataArr); dispatch(popupSlice.showFetchingDataDone()) })
            .catch(() => dispatch(popupSlice.showFetchingDataFail()))
    }, [frequencyUniqueKey, distanceMeasure, linkageMethod, numberOfClusterForString])

    useEffect(() => {
        dispatch(popupSlice.showFetchingData())
        dataAgent.getClusterData(numberOfCluster, metric1, metric2).then((fetchedClusterData: ClusterData[]) => {
            updateClusterDataArr(fetchedClusterData)
            dispatch(popupSlice.showFetchingDataDone())
            // console.log('clusterdata updated: ', fetchedClusterData, numberOfCluster, metric1, metric2)
        }
        ).catch(error => {
            console.error(error)
            updateClusterDataArr([]);
            dispatch(popupSlice.showFetchingDataFail())
        })
    }, [numberOfCluster, metric1, metric2, transactionDataArr])
}