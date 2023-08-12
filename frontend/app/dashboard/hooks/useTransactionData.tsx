import { useEffect, useMemo, useState } from "react";
import { TransactionData } from "../utilities/DataObject";
import * as dataAgent from '../utilities/dataAgent'
import { useAppSelector, useAppDispatch } from "@/app/hooks";
import * as clusterViewSlice from '../components/ClusterView/clusterViewSlice'
import assert from "assert";

/**
 * dependancy: metric1, metric2, numberOfCluster, frequencyUniqueKey, distanceMeasure, linkageMethod, numberOfClusterForString
 */
export function useTransactionDataArr() {
    const [transactionDataArr, setTransactionDataArr] = useState<TransactionData[]>([])
    const frequencyUniqueKey = useAppSelector(clusterViewSlice.selectFrequencyUniqueKey)
    const distanceMeasure = useAppSelector(clusterViewSlice.selectDistanceMeasure)
    const linkageMethod = useAppSelector(clusterViewSlice.selectLinkageMethod)
    const numberOfClusterForString = useAppSelector(clusterViewSlice.selectNumberOfClusterForString)

    const metric1 = useAppSelector(clusterViewSlice.selectMetric1)
    const metric2 = useAppSelector(clusterViewSlice.selectMetric2)
    const numberOfCluster = useAppSelector(clusterViewSlice.selectNumberOfCluster)
    useEffect(() => {
        let frequencyUniqueKeyConfig: dataAgent.FrequencyUniqueKeyConfig
        if (frequencyUniqueKey === 'clusteredTransactionDescription') {
            assert(distanceMeasure !== null)
            assert(linkageMethod !== null)
            assert(numberOfClusterForString !== null)
            frequencyUniqueKeyConfig = {
                frequencyUniqueKey: frequencyUniqueKey,
                stringClusterAlgorithm: "linkage",
                distanceMeasure: distanceMeasure,
                linkageMethod: linkageMethod,
                numberOfClusterForString: numberOfClusterForString,
            };
        } else {
            frequencyUniqueKeyConfig = {
                frequencyUniqueKey: frequencyUniqueKey
            }
        }
        dataAgent.updateFrequencyInfo(frequencyUniqueKeyConfig, metric1, metric2, numberOfCluster)
            .then(newTransactionDataArr => setTransactionDataArr(newTransactionDataArr))
    }, [frequencyUniqueKey, distanceMeasure, linkageMethod, numberOfClusterForString])

    return transactionDataArr
}