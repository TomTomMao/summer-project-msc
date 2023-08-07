from typing import Union
from fastapi import FastAPI, HTTPException
from app.TransactionDataset import TransactionDataset
import json
import os
# start server app
app = FastAPI()

# initialise the dataset
try:
    transactionDataset = TransactionDataset(os.getcwd()+'''/data/transaction_cleanedtest.csv''')
    print(transactionDataset.getDataframe())
except Exception as error:
    print(error)

# testing
@app.get("/")
def read_root():
    return {"Hello": "World"}

# get the transaction
@app.get("/transactionData")
def getTransactionData():
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