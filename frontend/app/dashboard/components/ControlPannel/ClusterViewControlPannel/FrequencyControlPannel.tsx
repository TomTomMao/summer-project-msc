import { useAppDispatch, useAppSelector } from "@/app/hooks";
import * as clusterViewSlice from '@/app/dashboard/components/ClusterView/clusterViewSlice'
import { ChangeEvent, useState } from "react";
import { FrequencyUniqueKeyConfig } from "@/app/dashboard/utilities/dataAgent";
import { Button } from "../../Button";
import * as popupSlice from "../../PopupWindow/PopupSlice";
import { Tooltip } from "@mui/material";
const MAX_NUMBER_DESCRIPTION = 400
const MIN_NUMBER_DESCRIPTION = 50

export function FrequencyControlPannel() {
    const initFrequencyUniqueKey = useAppSelector(clusterViewSlice.selectFrequencyUniqueKey)
    const [frequencyUniqueKey, setFrequencyUniqueKey] = useState<FrequencyUniqueKeyConfig['frequencyUniqueKey']>(initFrequencyUniqueKey)
    const initStringClusterAlgorithm = useAppSelector(clusterViewSlice.selectStringClusterAlgorithm)
    const [stringClusterAlgorithm, setStringClusterAlgorithm] = useState(initStringClusterAlgorithm === null ? 'linkage' : initStringClusterAlgorithm)
    const initDistanceMeasure = useAppSelector(clusterViewSlice.selectDistanceMeasure);
    const [distanceMeasure, setDistanceMeasure] = useState(initDistanceMeasure === null ? 'levenshtein' : initDistanceMeasure)
    const initLinkageMethod = useAppSelector(clusterViewSlice.selectLinkageMethod)
    const [linkageMethod, setLinkageMethod] = useState(initLinkageMethod === null ? 'average' : initLinkageMethod)
    const initNumberOfClusterForString = useAppSelector(clusterViewSlice.selectNumberOfClusterForString)
    const [numberOfClusterForString, setNumberOfClusterForString] = useState(initNumberOfClusterForString === null ? 100 : initNumberOfClusterForString)
    let isChanged: boolean
    // = initFrequencyUniqueKey !== frequencyUniqueKey
    //     || initStringClusterAlgorithm !== stringClusterAlgorithm
    //     || initDistanceMeasure !== distanceMeasure
    //     || initLinkageMethod !== linkageMethod
    //     || initNumberOfClusterForString !== numberOfClusterForString
    if (frequencyUniqueKey === 'clusteredTransactionDescription') {
        isChanged = initFrequencyUniqueKey !== frequencyUniqueKey
            || initStringClusterAlgorithm !== stringClusterAlgorithm
            || initDistanceMeasure !== distanceMeasure
            || initLinkageMethod !== linkageMethod
            || initNumberOfClusterForString !== numberOfClusterForString
    } else {
        isChanged = initFrequencyUniqueKey !== frequencyUniqueKey
    }
    const dispatch = useAppDispatch()

    const handleReset = () => {
        setFrequencyUniqueKey(initFrequencyUniqueKey);
        setDistanceMeasure(initDistanceMeasure === null ? 'levenshtein' : initDistanceMeasure);
        setLinkageMethod(initLinkageMethod === null ? 'average' : initLinkageMethod);
        setNumberOfClusterForString(initNumberOfClusterForString === null ? 100 : initNumberOfClusterForString);
    }
    const handleSave = () => {
        let frequencyConfig: clusterViewSlice.FrequencyConfig
        frequencyConfig = {
            frequencyUniqueKey: frequencyUniqueKey,
            stringClusterAlgorithm,
            distanceMeasure,
            linkageMethod,
            numberOfClusterForString
        }
        if (numberOfClusterForString < MIN_NUMBER_DESCRIPTION || numberOfClusterForString > MAX_NUMBER_DESCRIPTION) {
            dispatch(popupSlice.showInvalidInputData(`target number of transaction description group is invalid, it must between ${MIN_NUMBER_DESCRIPTION} and ${MAX_NUMBER_DESCRIPTION}`))
        } else {
            dispatch(clusterViewSlice.setFrequency(frequencyConfig))
        }
    }
    return (
        <>
            <FrequencyUniqueKeyOption frequencyUniqueKey={frequencyUniqueKey} onChangeFrequncyUniqueKey={setFrequencyUniqueKey}></FrequencyUniqueKeyOption>
            {frequencyUniqueKey === 'clusteredTransactionDescription' &&
                <LinkageClusteredTransactionDescriptionOption
                    distanceMeasure={distanceMeasure}
                    linkageMethod={linkageMethod}
                    numberOfClusterForString={numberOfClusterForString}
                    onChangeDistanceMeasure={setDistanceMeasure}
                    onChangeLinkageMethod={setLinkageMethod}
                    onChangeNumberOfClusterForString={setNumberOfClusterForString}
                />
            }
            <tr>
                <td colSpan={4}>
                    <div style={{ float: 'right' }}>
                        <Button onClick={handleReset} available={isChanged} >reset</Button>
                        <Button onClick={handleSave} available={isChanged}>update</Button>
                    </div>
                </td>
            </tr>
        </>
    )
}

export function FrequencyUniqueKeyOption({ frequencyUniqueKey, onChangeFrequncyUniqueKey }: {
    frequencyUniqueKey: clusterViewSlice.FrequencyConfig['frequencyUniqueKey'],
    onChangeFrequncyUniqueKey: (frequencyUniqueKey: clusterViewSlice.FrequencyConfig['frequencyUniqueKey']) => void
}) {
    return (<>
        <tr>
            <td colSpan={2}>frequency uniqueKey</td>
            <td colSpan={2}>
                <select name="" id="" value={frequencyUniqueKey} onChange={e => onChangeFrequncyUniqueKey(e.target.value as clusterViewSlice.FrequencyConfig['frequencyUniqueKey'])}>
                    <option value="transactionDescription">transaction description</option>
                    <option value="category">category</option>
                    <option value="clusteredTransactionDescription">clusteredTransactionDescription</option>
                </select>
            </td>
        </tr>
    </>);
}
export function LinkageClusteredTransactionDescriptionOption({
    distanceMeasure,
    linkageMethod,
    numberOfClusterForString,
    onChangeDistanceMeasure,
    onChangeLinkageMethod,
    onChangeNumberOfClusterForString }: {
        distanceMeasure: clusterViewSlice.DistanceMeasure,
        linkageMethod: clusterViewSlice.LinkageMethod,
        numberOfClusterForString: number,
        onChangeDistanceMeasure: (p: clusterViewSlice.DistanceMeasure) => void
        onChangeLinkageMethod: (p: clusterViewSlice.LinkageMethod) => void
        onChangeNumberOfClusterForString: (p: number) => void
    }) {
    const dispatch = useAppDispatch()

    return (<>
        <tr>
            <td colSpan={2}>
                distance measure
            </td>
            <td colSpan={2}>
                <select name="" id="" value={distanceMeasure} onChange={e => onChangeDistanceMeasure(e.target.value as clusterViewSlice.DistanceMeasure)}>
                    <option value='levenshtein'>levenshtein</option>
                    <option value='damerauLevenshtein'>damerauLevenshtein</option>
                    <option value='hamming'>hamming</option>
                    <option value='jaroSimilarity'>jaroSimilarity</option>
                    <option value='jaroWinklerSimilarity'>jaroWinklerSimilarity</option>
                    <option value='MatchRatingApproach'>MatchRatingApproach</option>
                </select>
            </td>
        </tr>
        <tr>
            <td colSpan={2}>
                linkage method
            </td>
            <td colSpan={2}>
                <select name="" id="" value={linkageMethod} onChange={e => onChangeLinkageMethod(e.target.value as clusterViewSlice.LinkageMethod)}>
                    <option value="single">single</option>
                    <option value="complete">complete</option>
                    <option value="average">average</option>
                    <option value="weighted">weighted</option>
                    <option value="centroid">centroid</option>
                    <option value="median">median</option>
                    <option value="ward">ward</option>
                </select>
            </td>
        </tr>
        <tr>
            <td colSpan={2}>number of cluster for<br /> transaction Description</td>
            <td colSpan={2}>
                <Tooltip title={`between ${MIN_NUMBER_DESCRIPTION} and ${MAX_NUMBER_DESCRIPTION}`}>
                    <input type="number" name="" id="" min={MIN_NUMBER_DESCRIPTION} max={MAX_NUMBER_DESCRIPTION} value={numberOfClusterForString} onChange={e => onChangeNumberOfClusterForString(parseInt(e.target.value))} />
                </Tooltip>
            </td>
        </tr>
    </>);
}
