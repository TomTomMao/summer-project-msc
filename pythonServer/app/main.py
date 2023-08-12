from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.TransactionDataset import TransactionDataset, FrequencyOption, FrequencyUniqueKey, DistanceMeasure, LinkageMethod

from typing import Union
import json
import os
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

# initialise the dataset
transactionDataset = TransactionDataset(os.getcwd()+'''/data/transaction_cleanedtest.csv''')
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
def updateUniqueKey(frequencyUniqueKey: FrequencyUniqueKey,  metric1: str, metric2: str, numberOfCluster: int, distanceMeasure: Union[DistanceMeasure, None]=None, linkageMethod: Union[LinkageMethod, None]=None, numberOfClusterForString: Union[int, None]=None):
    # update the frequencyUniqueKey, and return the transaction data
    if (frequencyUniqueKey==FrequencyUniqueKey.CLUSTERED_TRANSACTION_DESCRIPTION) and (distanceMeasure==None or linkageMethod == None or numberOfClusterForString == None):
        raise HTTPException(status_code=404, detail=f"frequencyUnique key is clusteredTransactionDescription, so distanceMeasure, linkagemethod and numberOfClusterForString must be provided")
    
    newFrequencyOption = FrequencyOption(frequencyUniqueKey, distanceMeasure, linkageMethod, numberOfClusterForString)
    transactionDataset.setFrequencyOption(newFrequencyOption)

    # check metrics and clusterByKmeans
    if transactionDataset.isValidColumnName(metric1) == False:
        # reference for error http handling: https://fastapi.tiangolo.com/tutorial/handling-errors/#:~:text=When%20a%20request%20contains%20invalid,to%20decorate%20the%20exception%20handler.
        raise HTTPException(status_code=404, detail=f"{metric1} is invalid, only support {str(transactionDataset.getColumnNames())}")
    elif transactionDataset.isValidColumnName(metric2) == False:
        raise HTTPException(status_code=404, detail=f"{metric2} is invalid, only support {str(transactionDataset.getColumnNames())}")
    else:
        # run kmean clustering algorithm
        transactionDataset.clusterByKMeans(metric1, metric2, numberOfCluster)
    # return the dataframe with cluster id
    return json.loads(transactionDataset.getDataframe().to_json(orient='records'))

# get cluster id by transactionNumber
@app.get("/transactionData/kmean")
def getClusterId(metric1: str, metric2: str, numberOfCluster: int):
    if transactionDataset.isValidColumnName(metric1) == False:
        # reference for error http handling: https://fastapi.tiangolo.com/tutorial/handling-errors/#:~:text=When%20a%20request%20contains%20invalid,to%20decorate%20the%20exception%20handler.
        raise HTTPException(status_code=404, detail=f"{metric1} is invalid, only support {str(transactionDataset.getColumnNames())}")
    elif transactionDataset.isValidColumnName(metric2) == False:
        raise HTTPException(status_code=404, detail=f"{metric2} is invalid, only support {str(transactionDataset.getColumnNames())}")
    else:
        # run kmean clustering algorithm
        transactionDataset.clusterByKMeans(metric1, metric2, numberOfCluster)
        # return the transactionNumber:clusterId pair
        return transactionDataset.getClusterIdOfTransactionNumber()

