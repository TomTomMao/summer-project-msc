import { useAppDispatch, useAppSelector } from "@/app/hooks";
import * as clusterViewSlice from '@/app/dashboard/components/ClusterView/clusterViewSlice'
import { useEffect, useRef, useState } from "react";
import { FrequencyUniqueKeyConfig } from "@/app/dashboard/utilities/dataAgent";
import { Button } from "../../Button";
import * as popupSlice from "../../PopupWindow/PopupSlice";
import { FormControl, Grid, InputLabel, MenuItem, Select, TextField, Tooltip } from "@mui/material";
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
    if (frequencyUniqueKey === 'clusteredTransactionDescription') {
        isChanged = initFrequencyUniqueKey !== frequencyUniqueKey
            || initStringClusterAlgorithm !== stringClusterAlgorithm
            || initDistanceMeasure !== distanceMeasure
            || initLinkageMethod !== linkageMethod
            || initNumberOfClusterForString !== numberOfClusterForString
    } else {
        isChanged = initFrequencyUniqueKey !== frequencyUniqueKey
    }
    const isValidNumberOfCluster = !(numberOfClusterForString < MIN_NUMBER_DESCRIPTION || numberOfClusterForString > MAX_NUMBER_DESCRIPTION)
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
        if (!isValidNumberOfCluster) {
            dispatch(popupSlice.showInvalidInputData(`target number of transaction description group is invalid, it must between ${MIN_NUMBER_DESCRIPTION} and ${MAX_NUMBER_DESCRIPTION}`))
        } else {
            dispatch(clusterViewSlice.setFrequency(frequencyConfig))
        }
    }
    const handleChangeFrequencyUniqueKey = (frequencyUniqueKey: clusterViewSlice.FrequencyConfig['frequencyUniqueKey']): void => {
        setFrequencyUniqueKey(frequencyUniqueKey)
    }
    return (
        <Grid container spacing={2}>
            <FrequencyUniqueKeyOption frequencyUniqueKey={frequencyUniqueKey} onChangeFrequncyUniqueKey={handleChangeFrequencyUniqueKey}></FrequencyUniqueKeyOption>
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
            {/* {frequencyUniqueKey !== 'clusteredTransactionDescription' && <Grid item xs={6}/>} */}
            <Grid item xs={3}>
                <Button className="h-full w-full" variant="outlined" onClick={handleReset} available={isChanged} >reset</Button>
            </Grid>
            <Grid item xs={3}>
                <Button className="h-full w-full" variant="outlined" onClick={handleSave} available={isChanged && isValidNumberOfCluster}>update</Button>
            </Grid>
        </Grid>
    )
}

export function FrequencyUniqueKeyOption({ frequencyUniqueKey, onChangeFrequncyUniqueKey }: {
    frequencyUniqueKey: clusterViewSlice.FrequencyConfig['frequencyUniqueKey'],
    onChangeFrequncyUniqueKey: (frequencyUniqueKey: clusterViewSlice.FrequencyConfig['frequencyUniqueKey']) => void
}) {
    return (
        <Grid item xs={frequencyUniqueKey === 'clusteredTransactionDescription' ? 12 : 6}>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">transaction group</InputLabel>
                <Select
                    size="small"
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={frequencyUniqueKey}
                    label="frequencyUniqueKey"
                    onChange={e => onChangeFrequncyUniqueKey(e.target.value as clusterViewSlice.FrequencyConfig['frequencyUniqueKey'])}
                ><MenuItem value="transactionDescription">Transaction Description</MenuItem>
                    <MenuItem value="category">Category</MenuItem>
                    <MenuItem value="clusteredTransactionDescription">Clustered Transaction Description</MenuItem>
                </Select>
            </FormControl>
        </Grid>);
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
        <Grid item xs={6}>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Distance Measure</InputLabel>
                <Select
                    size="small"
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={distanceMeasure}
                    label="distanceMeasure"
                    onChange={e => onChangeDistanceMeasure(e.target.value as clusterViewSlice.DistanceMeasure)}
                >   <MenuItem value='levenshtein'>levenshtein</MenuItem>
                    <MenuItem value='damerauLevenshtein'>damerauLevenshtein</MenuItem>
                    <MenuItem value='hamming'>hamming</MenuItem>
                    <MenuItem value='jaroSimilarity'>jaroSimilarity</MenuItem>
                    <MenuItem value='jaroWinklerSimilarity'>jaroWinklerSimilarity</MenuItem>
                    <MenuItem value='MatchRatingApproach'>MatchRatingApproach</MenuItem>
                </Select>
            </FormControl>
        </Grid>
        <Grid item xs={6}>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Linkage Method</InputLabel>
                <Select
                    size="small"
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={linkageMethod}
                    label="linkageMethod"
                    onChange={e => onChangeLinkageMethod(e.target.value as clusterViewSlice.LinkageMethod)}
                >   <MenuItem value="single">single</MenuItem>
                    <MenuItem value="complete">complete</MenuItem>
                    <MenuItem value="average">average</MenuItem>
                    <MenuItem value="weighted">weighted</MenuItem>
                    <MenuItem value="centroid">centroid</MenuItem>
                    <MenuItem value="median">median</MenuItem>
                    <MenuItem value="ward">ward</MenuItem>
                </Select>
            </FormControl>
        </Grid>
        <Grid item xs={6}>
            <Tooltip title={`between ${MIN_NUMBER_DESCRIPTION} and ${MAX_NUMBER_DESCRIPTION}`}>
                <TextField
                    error={numberOfClusterForString < MIN_NUMBER_DESCRIPTION || numberOfClusterForString > MAX_NUMBER_DESCRIPTION}
                    helperText={(numberOfClusterForString < MIN_NUMBER_DESCRIPTION || numberOfClusterForString > MAX_NUMBER_DESCRIPTION) ? `must between ${MIN_NUMBER_DESCRIPTION} and ${MAX_NUMBER_DESCRIPTION}` : <></>}
                    fullWidth
                    label={'number of transaction description group'}
                    size='small'
                    variant="outlined"
                    type="number"
                    value={numberOfClusterForString}
                    onChange={e => onChangeNumberOfClusterForString(parseInt(e.target.value))} />
            </Tooltip>
        </Grid>
    </>);
}
