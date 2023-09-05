from abc import ABC, abstractmethod
from typing import Callable
from typing import Union

# for string clustering
import numpy as np
import pandas as pd
from scipy.cluster.hierarchy import linkage, fcluster
from scipy.spatial.distance import pdist
from sklearn.metrics import pairwise_distances
import jellyfish  # string distance functinos
# reference for jellyfish: https://github.com/jamesturk/jellyfish/blob/main/docs/index.md


class Cluster(ABC):
    '''
    Abstract base class representing a cluster of data points.

    Attributes:
        dataList (list): A list of data points with the same format.
        targetNumberOfCluster (int): The desired number of clusters.

    Behaviors:
        __init__: Validates the datalist and numberofcluster, construct the object from args
        _validateDataList: Validates the data, the data is valid if all the data points share the same format
        _validateNumberOfCluster: Validates the number of cluster, the number is valid if 1<=number<=len(data)
        getClusterId: Returns a list of cluster IDs corresponding to the data in the dataList.
    '''

    def __init__(self, dataList, targetNumberOfCluster):
        '''
        Initializes the Cluster instance.

        Parameters:
            dataList (list): A list of data points.
            targetNumberOfCluster (int): The desired number of clusters.

        Raises:
            ValueError: If the data list or number of clusters is not valid.
        '''
        self._validateDataList()
        self._validateNumberOfCluster()
        self.dataList = dataList
        self.targetNumberOfCluster = targetNumberOfCluster

    @abstractmethod
    def _validateDataList(self) -> bool:
        '''
        Validates the data list. The data is valid if all the data points has same format.

        Returns:
            bool: True if the data list is valid, raises an error otherwise.
        '''

    @abstractmethod
    def _validateNumberOfCluster(self) -> bool:
        '''
        Validates the number of clusters.

        Returns:
            bool: True if the number of clusters is valid, raises an error otherwise.
        '''

    @abstractmethod
    def getClusterIdList(self) -> list:
        '''
        Returns a list of cluster IDs corresponding to the data in the dataList.

        Returns:
            list: A list of cluster IDs.
        '''


class StringCluster(Cluster, ABC):
    '''
    Abstract base class representing a cluster of string

    Attributes:
        dataList (list): A list of string
        targetNumberOfCluster (int): The desired number of clusters.
        stringPreprocessor (function:str->str): a function to preprocess the string, whose input and output is string

    Behaviors:
        __init__: Validates the datalist and numberofcluster, construct the object from args
        _validateDataList: Validates the data, the data is valid if all the data points string
        _validateNumberOfCluster: Validates the number of cluster, the number is valid if 1<=number<=len(set(data))
        getClusterId: Returns a list of cluster IDs corresponding to the data in the dataList.
    '''


class LinkageBasedStringCluster(StringCluster):
    '''
    Cluster that can using LinkageBased Clustering Algorithm to cluster a list of string 
    WARNING: targetNumberOfCluster doesn't work, ignore it
    Attributes:
        dataList (list): A list of string

        targetNumberOfCluster (int): The desired number of clusters, should between 1 and the number of unique preprocessed string processed by stringPreprocessor from the dataList

        distanceMetric (str): distanceMetric for different strings, used for generating distance matrix. 
            it should be one of 'levenshtein' or 'damerauLevenshtein' or 'hamming' or 'jaroSimilarity' or 'jaroWinklerSimilarity' or 'MatchRatingApproach'

        linkageMethod (str): the linkage algorithm to use. see: https://docs.scipy.org/doc/scipy/reference/generated/scipy.cluster.hierarchy.linkage.html
            it should be one of 'average' or 'single' or 'complete' or 'weigthed' or 'centroid' or 'median' or 'ward'

        stringPreprocessor (function:str->str): a function to preprocess the string, whose input and output is string

    Behaviors:
        __init__: Validates the args, construct the object from args or raise error.
        _validateDataList(private): Validates the data
        _validateNumberOfCluster(private): Validates the number of cluster
        _validateDistanceMetric(private): Validates the distanceMetric
        _validateLinkageMethod(private): Validates linkageMethods
        _validateStringPreprocessor(private): Validates preprocessor
        setNumberOfCluster (targetNumberOfCluster): set the number of cluster if the number is valid.
        getClusterId: Returns a list of cluster IDs corresponding to the data in the dataList.

    # reference: Algorithm to Cluster Similar Strings in Python | Saturn Cloud Blog. (2023, July 18). https://saturncloud.io/blog/algorithm-to-cluster-similar-strings-in-python/

    '''
    VALID_DISTANCE_METRIC = ['levenshtein', 'damerauLevenshtein', 'hamming',
                             'jaroSimilarity', 'jaroWinklerSimilarity', 'MatchRatingApproach']
    # don't forget update the doc for class

    VALID_LINKAGE_METHOD = ['average', 'single',
                            'complete', 'weighted', 'centroid', 'median', 'ward']

    def __init__(self, dataList: list[str], targetNumberOfCluster: int, distanceMetric: str, linkageMethod: str, stringPreprocessor: Callable[[str], str], testMode=False):
        '''
        Initialise the object 
        dataList (list): A list of string

        targetNumberOfCluster (int): The desired number of clusters, should between 1 and the number of unique preprocessed string processed by stringPreprocessor from the dataList

        distanceMetric (str): distanceMetric for different strings, used for generating distance matrix. 
            it should be one of 'levenshtein' or 'damerauLevenshtein' or 'hamming' or 'jaroSimilarity' or 'jaroWinklerSimilarity' or 'MatchRatingApproach'

        linkageMethod (str): the linkage algorithm to use. see: https://docs.scipy.org/doc/scipy/reference/generated/scipy.cluster.hierarchy.linkage.html
            it should be one of 'average' or 'single' or 'complete' or 'weigthed' or 'centroid' or 'median' or 'ward'

        stringPreprocessor (function:str->str): a function to preprocess the string, whose input and output is string

        '''
        self.testMode = testMode
        self._validateDataList(dataList)
        self._validateStringPreprocessor(stringPreprocessor)
        self._validateDistanceMetric(distanceMetric)
        self._validateLinkageMethod(linkageMethod)
        self._validateNumberOfCluster(
            targetNumberOfCluster, dataList,  stringPreprocessor)

        self.dataList = dataList
        self.stringPreprocessor = stringPreprocessor
        self.distanceMetric = distanceMetric
        self.linkageMethod = linkageMethod
        self.targetNumberOfCluster = targetNumberOfCluster

        # by default, preprocessedDataArry
        self.__updatePreprocessedStringArray()
        self.__updateDistanceMatrix()
        self.__updateLinkageMatrix()

    def setDataList(self, dataList: list[str], updateChainning: bool = True):
        '''
        Validate the datalist, update the datalist, 
        UpdateChainning (bool): If True, update the preprocessedStringArray, update the distanceMatrix, update the linkageMatrix 
        '''
        self._validateDataList(dataList)
        self.dataList = dataList
        if updateChainning:
            self.__updatePreprocessedStringArray()
            self.__updateDistanceMatrix()
            self.__updateLinkageMatrix()

    def setStringPreprocessor(self, stringPreprocessor: Callable[[str], str], updateChainning: bool = True):
        '''
        Validate the StringPreprocessor, update the preprocessedStringArray
        updateChainning (bool): If True, update the distanceMatrix, update the linkageMatrix
        '''
        self._validateStringPreprocessor(stringPreprocessor)
        self.stringPreprocessor = stringPreprocessor
        self.__updatePreprocessedStringArray()
        if updateChainning:
            self.__updateDistanceMatrix()
            self.__updateLinkageMatrix()

    def setDistanceMetric(self, distanceMetric: str, updateChainning: bool = True):
        '''
        Validate the distanceMetric, update the distanceMatrix
        updateChainning (bool): If True, update the linkageMatrix
        '''
        self._validateDistanceMetric(distanceMetric)
        self.distanceMetric = distanceMetric
        self.__updateDistanceMatrix()
        if updateChainning:
            self.__updateLinkageMatrix()

    def setLinkageMethod(self, linkageMethod: str):
        '''
        Validate the linkageMethod, update the linkageMatrix
        '''
        self._validateLinkageMethod(linkageMethod)
        self.linkageMethod = linkageMethod
        self.__updateLinkageMatrix()

    # getters
    def getPreprocessedData(self):
        return self.preprocessedStringArray

    def getDistanceMatrix(self):
        return self.distanceMatrix

    def getLinkageMatrix(self):
        return self.linkageMatrix

    def getClusterIdList(self, targetNumberOfCluster: int) -> list[int]:
        '''
        Raise ValueError if targetNumberOfCluster is invalid (not implemented)
        Returns a list of cluster IDs corresponding to the data in dataList, distanceMetrics, linkageMethod and Preprocessor
        '''
        optimalThreshold = self._searchOptimalThreshold(
            self.linkageMatrix, targetNumberOfCluster)
        cluster = fcluster(self.linkageMatrix, optimalThreshold, 'distance')
        return list(cluster)

    def getDataList(self) -> list[str]:
        '''
        return a list of string which is aligned to the cluster id list
        '''
        return self.dataList

    def getClusterInfo(self):
        return {
            'dataList': self.dataList,
            'stringPreprocessor': self.stringPreprocessor.__doc__,
            'distanceMetric': self.distanceMetric,
            'linkageMethod': self.linkageMethod,
        }

    def __str__(self):
        return '/n'.join([str(string)for string in self.getClusterInfo()])

    # updater method
    def __updatePreprocessedStringArray(self):
        '''
        update self.preprocessedStringArray based on self.stringPreprocessor and self.dataList
        '''
        preprocessedStringList: list[str] = [
            self.stringPreprocessor(string) for string in self.dataList]
        preprocessedStringArray = pd.Series(
            preprocessedStringList).to_numpy().reshape(len(preprocessedStringList), 1)
        self.preprocessedStringArray = preprocessedStringArray

    def __updateDistanceMatrix(self):
        '''
        update self.distanceMatrix based on the preprocessedStringArray and distance function
        '''
        vectorisedDistanceFunction = self._getDistanceFunction(
            self.distanceMetric, True)
        distanceMatrix = pdist(self.preprocessedStringArray,
                                metric=vectorisedDistanceFunction)

        self.distanceMatrix = distanceMatrix

    def __updateLinkageMatrix(self):
        '''
        update self.linkageMatrix based on the distanceMatrix and linkageMethod
        '''
        # create linkage_matrix
        self.linkageMatrix = linkage(
            self.distanceMatrix, method=self.linkageMethod)

    def _validateDataList(self, dataList: list[str]) -> bool:
        '''
        Validates the data, the data is valid if all the data points string

        Parameters
        -------
        dataList (list): a list of string to be validated

        Returns
        -------
        bool
            True if valid

        Raises
        -------
            ValueError if not the dataList is not valid
        '''
        for data in dataList:
            if (type(data) != str):
                raise TypeError('data list should be a list of str')
        else:
            return True

    def _validateNumberOfCluster(self, targetNumberOfCluster: int, validDataList: list[str],  validStringPreprocessor: Callable[[str], str]) -> bool:
        '''
        Validates the targetNumberOfCluster, based on the validDataList and validStringPreprocessor
        Assume validDataList and validStringPreprocessor are already valid

        Parameters
        -------
        targetNumberOfCluster (int): The desired number of clusters.
        validDataList (list): A list of strings.
        validStringPreprocessor (Callable[[str], str]): A function to preprocess strings.

        Returns
        -------
        bool
            True if valid

        Raises
        -------
            ValueError if not the targetNumberOfCluster is not valid
        '''
        preprocessedString = [validStringPreprocessor(
            string) for string in validDataList]
        if 1 <= targetNumberOfCluster <= len(set(preprocessedString)):
            return True
        else:
            raise ValueError(
                'invalid targetNumberOfCluster, it should between 1 and the number of unique string in the dataset')

    def _validateDistanceMetric(self, distanceMetric: str) -> bool:
        '''
        Validates DistanceMetric, DistanceMetric is valid if it is in LinkageBasedStringCluster.VALID_DISTANCE_METRIC

        Parameters
        -------
        distanceMetric (str): distanceMetric to validate

        Returns
        -------
        bool
            True if valid

        Raises
        -------
            ValueError if not valid
        '''
        if distanceMetric in LinkageBasedStringCluster.VALID_DISTANCE_METRIC:
            return True
        else:
            raise ValueError(
                f"invalid distance metric: {distanceMetric}, must be on of {','.join(LinkageBasedStringCluster.VALID_DISTANCE_METRIC)}"
            )

    def _validateLinkageMethod(self, linkageMethod: str) -> bool:
        '''
        Validates LinkageMethod, LinkageMethod is valid if it is in LinkageBasedStringCluster.VALID_LINKAGE_METHOD

        Parameters
        -------
        linkageMethod (str): linkageMethod to validate

        Returns
        -------
        bool
            True if valid

        Raises
        -------
            ValueError if not valid
        '''
        if linkageMethod in LinkageBasedStringCluster.VALID_LINKAGE_METHOD:
            return True
        else:
            raise ValueError(
                f"invalid linkage metric: {linkageMethod}, must be on of {','.join(LinkageBasedStringCluster.VALID_LINKAGE_METHOD)}"
            )

    def _validateStringPreprocessor(self, stringPreprocessor: Callable[[str], str]) -> bool:
        '''
        Validates StringPreprocessor, StringPreprocessor is valid if it takes a str and returns a str

        Parameters
        -------
        stringPreprocessor(Callable[[str],str]): stringPreprocessor to validate

        Returns
        -------
        bool
            True if valid

        Raises
        -------
            ValueError if not valid
        '''

        x = 'some string'
        y = stringPreprocessor(x)
        if (isinstance(y, str)):
            return True
        else:
            raise ValueError(
                "stringPreprocessor should returns a string but actually return "+str(type(y)))

    def _getDistanceFunction(self, distanceMetric, vectorise=True):
        '''
            Based on the distanceMetric, Return a string distance function  that compares two string
            If vectorise is True, the returned funciton is vetorised.
        '''
        function = None
        match distanceMetric:
            case 'levenshtein':
                function = jellyfish.levenshtein_distance
            case 'damerauLevenshtein':
                function = jellyfish.damerau_levenshtein_distance
            case 'hamming':
                function = jellyfish.hamming_distance
            case 'jaroSimilarity':
                function = jellyfish.jaro_similarity
            case 'jaroWinklerSimilarity':
                function = jellyfish.jaro_winkler_similarity
            case 'MatchRatingApproach':
                def f(str1, str2):
                    if jellyfish.match_rating_comparison(str1, str2):
                        return 0.9
                    else:
                        return 0.1
                function = f
            case _:
                raise ValueError('invalid distance metric')
        if vectorise:
            return np.vectorize(function)
        else:
            return function

    def _searchOptimalThreshold(self, linkageMatrix, targetNumberOfCluster) -> float:
        '''
        Return the threshold so that the linkageMatrix can produce the closest targetNumberOfCluster, do 100 search
        '''
        linkageMatrixDistance = linkageMatrix[:, 2]
        minDistance = linkageMatrixDistance.min()
        maxDistance = linkageMatrixDistance.max()

        # binary search untill 100 search
        leftThreshold = minDistance
        rightThreshold = maxDistance
        numberOfSearch = 0
        midThreshold = (leftThreshold + rightThreshold) / 2
        optimalNumberOfCluster = None
        optimalThreshold = midThreshold
        while (leftThreshold < rightThreshold and numberOfSearch < 100):

            midThreshold = (leftThreshold + rightThreshold) / 2
            # get the number of clusters
            clusters = fcluster(linkageMatrix, midThreshold,
                                criterion='distance')
            currentNumberOfCluster = len(set(clusters))

            # update the currentOptimalThreshold and numberOfCluster if improved
            if optimalNumberOfCluster == None:
                optimalNumberOfCluster = currentNumberOfCluster
                optimalThreshold = midThreshold
            elif abs(currentNumberOfCluster-targetNumberOfCluster) < abs(optimalNumberOfCluster-targetNumberOfCluster):
                optimalNumberOfCluster = currentNumberOfCluster
                optimalThreshold = midThreshold

            # print('leftThreshold:', leftThreshold, ' ,midThreshold:', midThreshold,
            #       ' ,rightThreshold:', rightThreshold, ' ,currentNumberOfCluster:', currentNumberOfCluster)

            if currentNumberOfCluster > targetNumberOfCluster:
                leftThreshold = midThreshold
            else:
                rightThreshold = midThreshold

            numberOfSearch += 1
        # print(numberOfSearch, midThreshold, optimalNumberOfCluster)
        return optimalThreshold
