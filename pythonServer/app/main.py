from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.TransactionDataset import TransactionDataset, FrequencyOption, FrequencyUniqueKey, DistanceMeasure, LinkageMethod

from typing import Literal, Union
import json
import os

from app.TransactionDataset import VALID_KMEAN_ITERATION
from app.TransactionDataset import VALID_KMEAN_N_INIT

DEFAULT_KMEAN_MAX_ITERATION = 2000
DEFAULT_KMEAN_N_INIT = 100
# start server app
app = FastAPI()

# allow cors
# reference: https://fastapi.tiangolo.com/tutorial/cors/

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
print('server starting')
# initialise the dataset
transactionDataset = TransactionDataset(
    os.getcwd()+'''/data/transaction_cleanedtest.csv''')
print(transactionDataset.getDataframe())


# testing
@app.get("/")
def read_root():
    return {"Hello": "World"}

# get the transaction


@app.get("/transactionData")
def getTransactionData():
    return json.loads(transactionDataset.getDataframe().to_json(orient='records'))

# update the frequency unique key config, mean while update the cluster information, return the transaction dataset with cluster id column.


@app.get("/transactionData/updateFrequencyInfo")
def updateUniqueKey(frequencyUniqueKey: FrequencyUniqueKey,  per: Literal['month', 'day'], metric1: str, metric2: str, numberOfCluster: int, kmeanMaxIteration: int = DEFAULT_KMEAN_MAX_ITERATION, kmeanNInit: int = DEFAULT_KMEAN_N_INIT, distanceMeasure: Union[DistanceMeasure, None] = None, linkageMethod: Union[LinkageMethod, None] = None, numberOfClusterForString: Union[int, None] = None):
    '''
        maxIteration should >VALID_KMEAN_ITERATION[0] and <VALID_KMEAN_ITERATION[1]
    '''
    # update the frequencyUniqueKey, and return the transaction data
    if (frequencyUniqueKey == FrequencyUniqueKey.CLUSTERED_TRANSACTION_DESCRIPTION) and (distanceMeasure == None or linkageMethod == None or numberOfClusterForString == None):
        raise HTTPException(
            status_code=404, detail=f"frequencyUnique key is clusteredTransactionDescription, so distanceMeasure, linkagemethod and numberOfClusterForString must be provided")

    # check metrics and clusterByKmeans
    if kmeanMaxIteration < VALID_KMEAN_ITERATION[0] or kmeanMaxIteration > VALID_KMEAN_ITERATION[1]:
        raise HTTPException(
            status_code=404, detail=f"invalid kmeanMaxIteration, it should between {VALID_KMEAN_ITERATION[0]} AND {VALID_KMEAN_ITERATION[1]}, but actual: {kmeanMaxIteration}")
    if transactionDataset.isValidColumnName(metric1) == False:
        # reference for error http handling: https://fastapi.tiangolo.com/tutorial/handling-errors/#:~:text=When%20a%20request%20contains%20invalid,to%20decorate%20the%20exception%20handler.
        raise HTTPException(
            status_code=404, detail=f"{metric1} is invalid, only support {str(transactionDataset.getColumnNames())}")
    if transactionDataset.isValidColumnName(metric2) == False:
        raise HTTPException(
            status_code=404, detail=f"{metric2} is invalid, only support {str(transactionDataset.getColumnNames())}")
    if kmeanNInit < VALID_KMEAN_N_INIT[0] or kmeanNInit > VALID_KMEAN_N_INIT[1]:
        raise HTTPException(
            status_code=404, detail=f"invalid kmeanNInit, it should between {VALID_KMEAN_N_INIT[0]} AND {VALID_KMEAN_N_INIT[1]}, but actual: {kmeanNInit}")

    newFrequencyOption = FrequencyOption(
        frequencyUniqueKey, distanceMeasure, linkageMethod, numberOfClusterForString, per=per)
    # run kmean clustering algorithm
    transactionDataset.setFrequencyOption(newFrequencyOption)
    transactionDataset.clusterByKMeans(
        metric1, metric2, numberOfCluster, maxIteration=kmeanMaxIteration, nInit=kmeanNInit)
    # return the dataframe with cluster id
    return json.loads(transactionDataset.getDataframe().to_json(orient='records'))

# get cluster id by transactionNumber


@app.get("/transactionData/kmean")
def getClusterId(metric1: str, metric2: str, numberOfCluster: int, kmeanMaxIteration: int = DEFAULT_KMEAN_MAX_ITERATION, kmeanNInit: int = DEFAULT_KMEAN_N_INIT):
    '''
        maxIteration should >VALID_KMEAN_ITERATION[0] and <VALID_KMEAN_ITERATION[1]
    '''
    if kmeanMaxIteration < VALID_KMEAN_ITERATION[0] or kmeanMaxIteration > VALID_KMEAN_ITERATION[1]:
        raise HTTPException(
            status_code=404, detail=f"invalid kmeanMaxIteration, it should between {VALID_KMEAN_ITERATION[0]} AND {VALID_KMEAN_ITERATION[1]}, but actual: {kmeanMaxIteration}")
    if kmeanNInit < VALID_KMEAN_N_INIT[0] or kmeanNInit > VALID_KMEAN_N_INIT[1]:
        raise HTTPException(
            status_code=404, detail=f"invalid kmeanNInit, it should between {VALID_KMEAN_N_INIT[0]} AND {VALID_KMEAN_N_INIT[1]}, but actual: {kmeanNInit}")
    if transactionDataset.isValidColumnName(metric1) == False:
        # reference for error http handling: https://fastapi.tiangolo.com/tutorial/handling-errors/#:~:text=When%20a%20request%20contains%20invalid,to%20decorate%20the%20exception%20handler.
        raise HTTPException(
            status_code=404, detail=f"{metric1} is invalid, only support {str(transactionDataset.getColumnNames())}")
    elif transactionDataset.isValidColumnName(metric2) == False:
        raise HTTPException(
            status_code=404, detail=f"{metric2} is invalid, only support {str(transactionDataset.getColumnNames())}")
    else:
        # run kmean clustering algorithm
        transactionDataset.clusterByKMeans(metric1, metric2, numberOfCluster)
        # return the transactionNumber:clusterId pair
        return transactionDataset.getClusterIdOfTransactionNumber()
