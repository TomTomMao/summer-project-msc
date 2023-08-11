import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from typing import Union
from enum import Enum


class FrequencyUniqueKey(Enum):
    CATEGORY = 'category'
    TRANSACTION_DESCRIPTION = 'transactionDescription'
    CLUSTERED_TRANSACTION_DESCRIPTION = 'clusteredTransactionDescription'
    
class FrequencyOption:
    '''
        a class wrap the information for the frequency option
    '''

    def __init__(self, uniqueKey: FrequencyUniqueKey, distanceMeasure: str = '', linkageMethod: str = '', numberOfCluster: int = 0):
        '''
            initialise the frequencyOption object
            uniqueKey: category or transactionDescription or clusteredTransactionDescription
            distanceMeasure: levenshtein or damerauLevenshtein or hamming or jaroSimilarity or JaroWinklerSimilarity or MatchRatingApproach
            linkageMethod: single or complete or average or weighted or centroid or median or ward
            numberOfCluster: greater than 1
        '''
        if (uniqueKey == FrequencyUniqueKey.CATEGORY):
            self.uniqueKey = uniqueKey
        elif (uniqueKey == FrequencyUniqueKey.TRANSACTION_DESCRIPTION):
            self.uniqueKey = uniqueKey
        elif (uniqueKey == FrequencyUniqueKey.CLUSTERED_TRANSACTION_DESCRIPTION):
            self.uniqueKey = uniqueKey
            if distanceMeasure not in ['levenshtein', 'damerauLevenshtein', 'hamming', 'jaroSimilarity', 'JaroWinklerSimilarity', 'MatchRatingApproach']:
                raise ValueError('invalid distanceMeasure')
            elif linkageMethod not in ['single', 'complete', 'average', 'weighted', 'centroid', 'median', 'ward']:
                raise ValueError('invalid linkageMethod')
            elif numberOfCluster < 1:
                raise ValueError('invalid numberOfCluster')
            else:
                self.distanceMeasure = distanceMeasure
                self.linkageMethod = linkageMethod
                self.numberOfCluster = numberOfCluster
        else:
            raise ValueError('invalid uniqueKey')

    # getters

    def getUniqueKey(self): return self.uniqueKey
    def getDistanceMeasure(self): return self.distanceMeasure
    def getLinkageMethod(self): return self.linkageMethod
    def getNumberOfCluster(self): return self.numberOfCluster


class TransactionDataset:
    '''
        a dataset with the following columns: transactionNumber (str), transactionDate (datetime), 
        transactionType (str), transactionDescription(str), balance (float), category (str), locationCity (str), locationCountry (str), 
        isCredit (boolean), transactionAmount (float), frequency(float)
    '''

    def __init__(self, csvPath: str):
        '''
            read transactions from csv file, the data will be initialised
        '''

        self.dataframe: pd.DataFrame = pd.read_csv(csvPath)
        self.__convertColumnNameToCammelCase()  # convert column name
        # derive transactionAmount and isCredit column based on creditAmount and debitAmount column
        self.__addTransactionAmountInfo()
        # add dayOfYear dayOfWeek weekOfYear columns, set transactionData tobe datetime type
        self.__cleanDateInfo()
        # this line does not actually work,
        self.dataframe.set_index('transactionNumber')

        # self.frequencyOption = FrequencyOption('transactionDescription')
        # self.__addFrequency()

    def getDataframe(self) -> pd.DataFrame:
        '''
            return the internal dataframe for the transaction with the following columns: transactionNumber (str), transactionDate (datetime), 
            transactionType (str), transactionDescription(str), balance (float), category (str), locationCity (str), locationCountry (str), 
            isCredit (boolean), transactionAmount (float)
        '''
        return self.dataframe

    def __convertColumnNameToCammelCase(self) -> bool:
        '''
            this method will mutate self.dataframe:
            convert column name of self.dataframe to cammelCase inplace
            return true if successed, false if failed
        '''
        try:
            columnNameMapping = dict()
            for initColumnName in self.dataframe.columns:
                initColumnName: str
                if len(initColumnName.split(' ')) == 2:
                    firstPart = initColumnName.split(' ')[0].lower()
                    secondPart = initColumnName.split(
                        ' ')[1].lower().capitalize()
                    columnNameMapping[initColumnName] = firstPart + secondPart
                else:
                    columnNameMapping[initColumnName] = initColumnName.lower()
            self.dataframe.rename(columns=columnNameMapping, inplace=True)
            return True
        except:
            return False

    def __addTransactionAmountInfo(self):
        '''
            this method will mutate self.dataframe:
            add the isCredit, if the creditAmount in the dataframe is na, set false, else true
            a transaction can be either be a credit transaction or a debit transaction
            add transaction Amount based on isCredit, if isCredit is true, use Credit Amount, else use Debit Amount
            return true if successed, false if failed
        '''
        try:
            # add isCredit: reference: https://stackoverflow.com/questions/71000585/create-a-new-column-in-pandas-dataframe-based-on-the-nan-values-in-another-col
            self.dataframe['isCredit'] = self.dataframe['creditAmount'].isna(
            ) == False
            # add transaction Amount based on isCredit, if isCredit is true, use Credit Amount, else use Debit Amount
            self.dataframe['transactionAmount'] = self.dataframe.apply(
                lambda row: row.creditAmount if row['isCredit'] else row.debitAmount, axis=1)
            return True
        except:
            return False

    def __cleanDateInfo(self):
        '''
            this method will mutate self.dataframe:
            set the transactionData column to be datetime object
            add day of year column 1 to 366
            add day of week: 1to7 1: monday, 2: tuesday...
            week of the year 1 to 53
            return true if successed, false if failed
        '''
        try:
            self.dataframe['transactionDate'] = pd.to_datetime(
                self.dataframe['transactionDate'], dayfirst=True)
            self.dataframe['dayOfYear'] = self.dataframe['transactionDate'].dt.dayofyear
            self.dataframe['dayOfWeek'] = self.dataframe['transactionDate'].dt.dayofweek + 1
            self.dataframe['weekOfYear'] = self.dataframe['transactionDate'].dt.isocalendar(
            ).week
            return True
        except:
            return False

    def __getNumericalDataFromCategoricalData(self, categoricalColumnName) -> pd.Series:
        '''
            assume categoricalColumnName exists
            takes a name of a column with categorical data (str, datetime, boolean), and return a series with the numerical data.
        '''
        numericalColumn: pd.Series = self.dataframe[categoricalColumnName].replace(set(
            self.dataframe[categoricalColumnName]), [i for i in range(len(set(self.dataframe[categoricalColumnName])))])
        return numericalColumn

    def getColumn(self, columnName, toNumerical=False) -> pd.Series:
        '''
            assume the columnName exist
            if the column is categorical and toNumerical==True, return a list of number represents the category of the columnName
            otherwise return a list of value of the columnName
        '''
        assert columnName in self.dataframe.columns, f"{columnName} doesn't exist"
        if toNumerical:
            return self.__getNumericalDataFromCategoricalData(columnName)
        else:
            return self.dataframe[columnName]

    def clusterByKMeans(self, metric1, metric2, numberOfCluster):
        '''
            assume metric1 and metric2 exist in the column names.
            run KMean clustering algorithm based on the two metrics
            if any metric is not int or float, they will be try to convert to float.
            set the clusterId column to be the result of clustering algorithm
            this method will mutate self.dataframe
        '''
        assert metric1 in self.dataframe.columns, f"{metric1} does not exist"
        assert metric2 in self.dataframe.columns, f"{metric2} does not exist"

        # get the numerical value of two columns
        x1 = self.getColumn(metric1, toNumerical=True).to_numpy()
        x2 = self.getColumn(metric2, toNumerical=True).to_numpy()
        X = np.dstack((x1, x2))[0]
        # run kmean
        # reference: https://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html
        kmeans = KMeans(n_clusters=numberOfCluster, random_state=0).fit(X)
        # update the clusterId column
        self.dataframe['cluster'] = kmeans.labels_
        return True

    def getClusterIdOfTransactionNumber(self) -> dict:
        '''
            if the cluster algorithm has runned return a dictionary where the key is transactionNumber and the value is the cluster.
        '''
        return self.getDataframe()[['transactionNumber', 'cluster']].set_index('transactionNumber').to_dict(orient="index")

    def isValidColumnName(self, columnNameToCheck: str) -> bool:
        '''
            columnNameToCheck: the column name to check
            return True if the columnName is valid
            return False if not
        '''
        return columnNameToCheck in self.getColumnNames()

    def getColumnNames(self) -> list:
        '''
            Return a list of valid columnNames
        '''
        return list(self.getDataframe().columns)
