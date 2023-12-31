import { ClusterViewState } from "../components/ClusterView/clusterViewSlice";
import { TransactionData } from "./DataObject";
import { ClusterData } from "./clusterDataObject";
import { apiUrl } from "./consts";

/**
 *
 * fetech transactionData
 */
export async function getTransactionData(): Promise<TransactionData[]> {
  const res = await fetch(`${apiUrl}/transactionData`);
  const data: TransactionServerData[] = await res.json();
  const transactionDataArr = data.map((datum) => {
    return new TransactionData(
      String(datum.transactionNumber),
      new Date(datum.transactionDate),
      datum.transactionType === null ? "" : datum.transactionType,
      datum.transactionDescription,
      datum.debitAmount === null ? 0 : datum.debitAmount,
      datum.creditAmount === null ? 0 : datum.creditAmount,
      datum.balance,
      datum.category === null ? "" : datum.category,
      datum.locationCity === null ? "" : datum.locationCity,
      datum.locationCountry === null ? "" : datum.locationCountry,
      datum.frequency,
      String(datum.frequencyUniqueKey)
    );
  });
  return transactionDataArr;
}

export type FrequencyUniqueKeyConfig =
  | {
      frequencyUniqueKey: "category" | "transactionDescription";
      per: 'month'|'day'
    }
  | {
      frequencyUniqueKey: "clusteredTransactionDescription";
      per: 'month'|'day'
      stringClusterAlgorithm: "linkage";
      distanceMeasure:
        "levenshtein"
        | "damerauLevenshtein"
        | "hamming"
        | "jaroSimilarity"
        | "jaroWinklerSimilarity"
        | "MatchRatingApproach";
      linkageMethod:
        "single"
        | "complete"
        | "average"
        | "weighted"
        | "centroid"
        | "median"
        | "ward";
      numberOfClusterForString: number;
    };
/**
 * update the frequency unique key, and let the server run clustering algorithm for calculating the frequency
 * @param metric1
 * @param metric2
 * @param numberOfCluster
 * @param frequencyUniqueKeyConfig
 */

export async function updateFrequencyInfo(
  frequencyUniqueKeyConfig: FrequencyUniqueKeyConfig,
  metric1:
    | "transactionAmount"
    | "frequency"
    | "category"
    | "clusteredTransactionDescription",
  metric2:
    | "transactionAmount"
    | "frequency"
    | "category"
    | "clusteredTransactionDescription",
  numberOfCluster: number
): Promise<TransactionData[]> {
    let fetchUrl = `${apiUrl}/transactionData/updateFrequencyInfo` +
      `?frequencyUniqueKey=${frequencyUniqueKeyConfig.frequencyUniqueKey}` +
      `&per=${frequencyUniqueKeyConfig.per}` +
      `&metric1=${metric1}&metric2=${metric2}`+
      `&numberOfCluster=${numberOfCluster}`
    if (frequencyUniqueKeyConfig.frequencyUniqueKey=='clusteredTransactionDescription'){
        fetchUrl+=`&distanceMeasure=${frequencyUniqueKeyConfig.distanceMeasure}`+
        `&linkageMethod=${frequencyUniqueKeyConfig.linkageMethod}` +
        `&numberOfClusterForString=${frequencyUniqueKeyConfig.numberOfClusterForString}`
    }
  const res = await fetch(fetchUrl)
  const data: TransactionServerData[] = await res.json();
  const transactionDataArr = data.map((datum) => {
    return new TransactionData(
      String(datum.transactionNumber),
      new Date(datum.transactionDate),
      datum.transactionType === null ? "" : datum.transactionType,
      datum.transactionDescription,
      datum.debitAmount === null ? 0 : datum.debitAmount,
      datum.creditAmount === null ? 0 : datum.creditAmount,
      datum.balance,
      datum.category === null ? "" : datum.category,
      datum.locationCity === null ? "" : datum.locationCity,
      datum.locationCountry === null ? "" : datum.locationCountry,
      datum.frequency,
      String(datum.frequencyUniqueKey)
    );
  });
  return transactionDataArr;
}

interface TransactionServerData {
  "unnamed:0": number;
  transactionNumber: number;
  transactionDate: number;
  transactionType: string | null;
  transactionDescription: string;
  debitAmount: number | null;
  creditAmount: number | null;
  balance: 541.43;
  category: "Savings" | null;
  locationCity: "Nottingham" | null;
  locationCountry: "Uk" | null;
  isCredit: boolean;
  transactionAmount: number;
  dayOfYear: number;
  dayOfWeek: number;
  weekOfYear: number;
  frequencyUniqueKey: number | string;
  frequency: number;
  cluster: number;
}

export async function getClusterData(
  numberOfCluster: ClusterViewState["clusterConfig"]["numberOfCluster"],
  metric1: ClusterViewState["clusterConfig"]["metric1"],
  metric2: ClusterViewState["clusterConfig"]["metric2"]
) {
  const url =
    apiUrl +
    `/transactionData/kmean?numberOfCluster=${numberOfCluster}&metric1=${metric1}&metric2=${metric2}`;
  const response = await fetch(url);
  if (response.status === 200) {
    const fetchedData = await response.json();
    const transactionNumbers: string[] =
      Object.getOwnPropertyNames(fetchedData);
    const clusterData: ClusterData[] = transactionNumbers.map(
      (transactionNumber) => {
        return {
          transactionNumber: transactionNumber,
          clusterId: String(fetchedData[transactionNumber]["cluster"]),
        };
      }
    );
    return clusterData;
  } else {
    throw new Error("invalid url:" + url);
  }
}
