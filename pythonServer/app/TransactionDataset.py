import pandas as pd
import numpy as np
import sklearn.preprocessing
from sklearn.cluster import KMeans
from typing import Literal, Union
from enum import Enum
from app.Cluster import LinkageBasedStringCluster
from app.stringPreprocessor import preprocess


VALID_KMEAN_ITERATION = [1, 2000]
VALID_KMEAN_N_INIT = [10,1000]

class FrequencyUniqueKey(Enum):
    CATEGORY = 'category'
    TRANSACTION_DESCRIPTION = 'transactionDescription'
    CLUSTERED_TRANSACTION_DESCRIPTION = 'clusteredTransactionDescription'


class DistanceMeasure(Enum):
    LEVENSHTEIN = 'levenshtein'
    DAMERAU_LEVENSHTEIN = 'damerauLevenshtein'
    HAMMING = 'hamming'
    JARO_SIMILARITY = 'jaroSimilarity'
    JARO_WINKLER_SIMILARITY = 'jaroWinklerSimilarity'
    MATCH_RATING_APPROACH = 'MatchRatingApproach'


class LinkageMethod(Enum):
    SINGLE = 'single'
    COMPLETE = 'complete'
    AVERAGE = 'average'
    WEIGHTED = 'weighted'
    CENTROID = 'centroid'
    MEDIAN = 'median'
    WARD = 'ward'


class FrequencyOption:
    '''
        a class wrap the information for the frequency option
    '''

    def __init__(self, uniqueKey: FrequencyUniqueKey, distanceMeasure: Union[DistanceMeasure, None] = None, linkageMethod: Union[LinkageMethod, None] = None, numberOfCluster: Union[int, None] = None, per: Literal['month', 'day'] = 'month'):
        '''
            initialise the frequencyOption object
            uniqueKey: category or transactionDescription or clusteredTransactionDescription

            if uniqueKey = CLUSTERED_TRANSACTION_DESCRIPTION, the following parameters need to be provided
            distanceMeasure: levenshtein or damerauLevenshtein or hamming or jaroSimilarity or jaroWinklerSimilarity or MatchRatingApproach
            linkageMethod: single or complete or average or weighted or centroid or median or ward
            numberOfCluster: greater than 1
        '''
        if uniqueKey not in FrequencyUniqueKey.__members__.values():
            raise ValueError('invalid uniqueKey')
        else:
            self.uniqueKey = uniqueKey
        if (uniqueKey == FrequencyUniqueKey.CLUSTERED_TRANSACTION_DESCRIPTION):
            if distanceMeasure not in DistanceMeasure.__members__.values():
                raise ValueError('invalid distanceMeasure')
            elif linkageMethod not in LinkageMethod.__members__.values():
                raise ValueError('invalid linkageMethod')
            elif numberOfCluster == None:
                raise ValueError('invalid numberOfCluster')
        self.distanceMeasure = distanceMeasure
        self.linkageMethod = linkageMethod
        self.numberOfCluster = numberOfCluster
        self.per: Literal['month', 'day'] = per

    # getters

    def getUniqueKey(self):
        return self.uniqueKey.value

    def getDistanceMeasure(self):
        if self.distanceMeasure != None:
            return self.distanceMeasure.value
        else:
            return None

    def getLinkageMethod(self):
        if self.linkageMethod != None:
            return self.linkageMethod.value
        else:
            return None

    def getNumberOfCluster(self):
        if self.numberOfCluster != None:
            return self.numberOfCluster
        else:
            return None

    def getPer(self) -> Literal['month', 'day']:
        return self.per


class TransactionDataset:
    '''
        a dataset with the following columns: transactionNumber (str), transactionDate (datetime), 
        transactionType (str), transactionDescription(str), balance (float), category (str), locationCity (str), locationCountry (str), 
        isCredit (boolean), transactionAmount (float), frequency(float), frequencyUniqueKey()
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
        self.frequencyOption = FrequencyOption(
            FrequencyUniqueKey.TRANSACTION_DESCRIPTION)
        self.__updateFrequency()
        # there should exist frequency and frequencyUniqueKey column

        # preload different stringClusterer for each distance metric
        self.linkageBasedStringClusterers = {}
        uniqueStringList = list(set(self.getColumn('transactionDescription')))
        for distanceMeasure in DistanceMeasure.__members__.values():
            self.linkageBasedStringClusterers[distanceMeasure.value] = LinkageBasedStringCluster(
                uniqueStringList, 10, distanceMeasure.value, 'average', preprocess)

    def getDataframe(self) -> pd.DataFrame:
        '''
            return the internal dataframe for the transaction with the following columns: transactionNumber (str), transactionDate (datetime), 
            transactionType (str), transactionDescription(str), balance (float), category (str), locationCity (str), locationCountry (str), 
            isCredit (boolean), transactionAmount (float)
        '''
        return self.dataframe

    def setFrequencyOption(self, newFrequencyOption):
        '''
        Set the frequency option, update the frequency column, frequency Unique key Column. if frequency is based on clustering, algorithm will be run
        '''
        self.frequencyOption = newFrequencyOption
        self.__updateFrequency()

    def __updateFrequency(self):
        '''
        this method will mutate self.dataframe
        based on self.frequencyOption, update the frequencyUniqueKey column, and frequency column
        '''
        # update the 'frequencyUniqueKey' unique key column for frequency
        frequencyUniqueKey = self.frequencyOption.getUniqueKey()
        if (frequencyUniqueKey == FrequencyUniqueKey.TRANSACTION_DESCRIPTION.value):
            self.dataframe['frequencyUniqueKey'] = self.dataframe[frequencyUniqueKey]
        elif (frequencyUniqueKey == FrequencyUniqueKey.CATEGORY.value):
            self.dataframe['frequencyUniqueKey'] = self.dataframe[frequencyUniqueKey]
        else:
            # set the 'ferquencyUniqueKey' as the clustered transactionDescription based on the distance metric
            # key->value = transactinDiscription -> clusterId(for the string clustering)
            stringClusterMap = self.__getStringClusterMap(self.frequencyOption)
            self.dataframe['frequencyUniqueKey'] = self.dataframe['transactionDescription'].map(
                stringClusterMap)

        # add a 'frequency' column group by the frequencyUniqueKey and transactionDate Columns
        frequency = self.dataframe.groupby(
            'frequencyUniqueKey').apply(lambda x: self.__getFrequencyOfGroup(x, self.frequencyOption.getPer()))['frequency']
        # print('frequency::::', frequency)
        self.dataframe['frequency'] = self.dataframe['frequencyUniqueKey'].map(
            frequency)

    def __getFrequencyOfGroup(self, dataGroup, per: Literal['month', 'day']) -> pd.Series:
        '''
        Helper function used for calculate frequency
        '''
        # reference Rooy, J. L. (2010, October 28). Answer to ‘Best way to find the months between two dates’. Stack Overflow. https://stackoverflow.com/a/4040338
        def getNumberOfMonth(date1, date2):
            return (date2.year - date1.year) * 12 + date2.month - date1.month + 1

        def getNumberOfDay(date1, date2):
            return (date2 - date1).days + 1

        numberOfTransaction = dataGroup.shape[0]
        firstTransactionDate = dataGroup['transactionDate'].min()
        lastTransactionDate = dataGroup['transactionDate'].max()
        length = getNumberOfMonth(firstTransactionDate, lastTransactionDate) if (
            per == 'month') else getNumberOfDay(firstTransactionDate, lastTransactionDate)
        frequency = numberOfTransaction/length
        # assert frequency != 0
        return pd.Series({'frequency': frequency})

    def __getStringClusterMap(self, frequencyOption: FrequencyOption):
        '''
        return a dictionary map string to clusterId like this: {'save the charge': 1, 'subway': 2,...}
        frequencyOption: should provide the information about how the linkage
        '''
        distanceMeasure = frequencyOption.getDistanceMeasure()
        linkageMethod = frequencyOption.getLinkageMethod()
        numberOfCluster = frequencyOption.getNumberOfCluster()
        assert (distanceMeasure != None)
        assert (linkageMethod != None)
        assert (numberOfCluster != None)

        clusterer = self.linkageBasedStringClusterers[distanceMeasure]
        # it should been preloaded when initialise the TransactionDataset Class
        assert isinstance(clusterer, LinkageBasedStringCluster)
        # get an aligned string list with unique strings an aligned clusterid, based on the linkageMethod and numberOfCluster
        # assert their length should be the same
        # assert the value in string list should be unique
        # assert the value in string list should cover the value in transactionDescription Column (not implemented)
        if clusterer.getClusterInfo()['linkageMethod'] != linkageMethod:
            # update linkage method if need
            clusterer.setLinkageMethod(linkageMethod)
        clusterStringList = clusterer.getDataList()
        clustereIdList = clusterer.getClusterIdList(numberOfCluster)
        assert len(clusterStringList) == len(clustereIdList), 'something wrong'
        assert len(clusterStringList) == len(
            set(clusterStringList)), 'something wrong'
        assert self.getColumn('transactionDescription').isin(
            set(clusterStringList)).all(), 'something wrong'

        clusterStringMap = dict(zip(clusterStringList, clustereIdList))
        return clusterStringMap

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
            if the column is categorical and toNumerical==True, return a list of number represents the category of the columnName,
            otherwise return a list of value of the columnName
        '''
        assert columnName in self.dataframe.columns, f"{columnName} doesn't exist"
        # referenced danthelion's answer for checking numericals: https://stackoverflow.com/questions/19900202/how-to-determine-whether-a-column-variable-is-numeric-or-not-in-pandas-numpy
        isColumnCategorical = pd.api.types.is_numeric_dtype(self.dataframe[columnName]) == False
        if toNumerical and isColumnCategorical:
            return self.__getNumericalDataFromCategoricalData(columnName)
        else:
            return self.dataframe[columnName]

    def clusterByKMeans(self, metric1, metric2, numberOfCluster, maxIteration: int = 300, nInit=10):
        '''
            assume metric1 and metric2 exist in the column names.
            run KMean clustering algorithm based on the two metrics
            if any metric is not int or float, they will be try to convert to float.
            set the clusterId column to be the result of clustering algorithm
            this method will mutate self.dataframe
            maxIteration should >VALID_KMEAN_ITERATION[0] and <VALID_KMEAN_ITERATION[1]
        '''
        assert metric1 in self.dataframe.columns, f"{metric1} does not exist"
        assert metric2 in self.dataframe.columns, f"{metric2} does not exist"
        if (maxIteration < VALID_KMEAN_ITERATION[0] or maxIteration > VALID_KMEAN_ITERATION[1]):
            raise ValueError(
                'maxIteration should <1 and >2000, given: ' + str(maxIteration))
        if (numberOfCluster < 1):
            raise ValueError(
                'invalid number of cluster, it must be at least 1')
        # get the numerical value of two columns
        x1 = self.getColumn(metric1, toNumerical=True).to_numpy()
        x2 = self.getColumn(metric2, toNumerical=True).to_numpy()
        
        # reference for normalise the data: https://scikit-learn.org/stable/modules/preprocessing.html#normalization
        # normalise the data so that one of the dimension won't dominant the clustering algorithm
        x1Norm = sklearn.preprocessing.normalize([x1]) 
        x2Norm = sklearn.preprocessing.normalize([x2])

        X = np.dstack((x1Norm, x2Norm))[0] # type: ignore
        # run kmean
        # reference: https://scikit-learn.org/stable/modules/generated/sklearn.cluster.KMeans.html
        kmeans = KMeans(n_clusters=numberOfCluster, random_state=0,
                        max_iter=maxIteration, n_init=nInit).fit(X)
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
