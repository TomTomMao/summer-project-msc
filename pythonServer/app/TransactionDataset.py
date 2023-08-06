import pandas as pd
import numpy as np
from sklearn.cluster import KMeans


class TransactionDataset:
    def __init__(self, csvPath: str):
        '''
            read transactions from csv file, the columns name will be convert to cammelCase
        '''
        try:
            self.dataframe: pd.DataFrame = pd.read_csv(csvPath)
            self.dataframe = self._convertColumnNameToCammelCase(inplace=False)
            assert(self.dataframe!=None, 'dataframe become none')
        except:
            print('fail to read file from: ', csvPath)

    def _convertColumnNameToCammelCase(self, inplace: bool):
        '''
            a private method
            convert column name to cammelCase
            Return None if inplace==True
            otherviseDataFrame with column names in cammelCase
        '''
        columnNameMapping = dict()
        for initColumnName in self.dataframe.columns:
            initColumnName: str
            if len(initColumnName.split(' ')) == 2:
                firstPart = initColumnName.split(' ')[0].lower()
                secondPart = initColumnName.split(' ')[1].lower().capitalize()
                columnNameMapping[initColumnName] = firstPart + secondPart
            else:
                columnNameMapping[initColumnName] = initColumnName.lower()
        newDfOrNone = self.dataframe.rename(
            columns=columnNameMapping, inplace=inplace)
        return newDfOrNone
