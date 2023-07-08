import { timeParse } from 'd3';

const parseTime = timeParse('%d/%m/%Y');
const WEEK = 7;
const MONTH = 30.437; // https://www.britannica.com/science/time/Lengths-of-years-and-months
const YEAR = 365.25;

/**
 * return an array of datashowing rfm info like this format: {
        recency: d.recency,
        monetaryAvgWeek: d.monetary.avgWeek,
        monetaryAvgMonth: d.monetary.avgMonth,
        monetaryAvgYear: d.monetary.avgYear,
        frequencyAvgWeek: d.frequency.avgWeek,
        frequencyAvgMonth: d.frequency.avgMonth,
        frequencyAvgYear: d.frequency.avgYear,
        transactionDescription: d.transactionDescription,
      }
 */
export function getRFMData(transactionDataArr) {

  // convert date and number from string to int and data.
  transactionDataArr = transactionDataArr.map((d) => {
    return {
      ...d,
      Balance: parseFloat(d["Balance"]),
      "Debit Amount": d["Debit Amount"] == "" ? 0 : parseFloat(d["Debit Amount"]),
      "Credit Amount": d["Credit Amount"] == "" ? 0 : parseFloat(d["Credit Amount"]),
      date: parseTime(d["Transaction Date"]),
    };
  });

  const infoMap = getInfoMap(transactionDataArr);
  // console.log(infoMap);
  // add rfm info into the info map
  infoMap.forEach((info) => {
    let branchCount = 0;
    if (info.credit.transactionCount > 0) {
      const RFMInfo = getRFMFromInfo(info.credit);
      info.credit = {
        ...info.credit,
        ...RFMInfo,
      };
      branchCount += 1;
    }
    if (info.debit.transactionCount > 0) {
      const RFMInfo = getRFMFromInfo(info.debit);
      info.debit = {
        ...info.debit,
        ...RFMInfo,
      };
      branchCount += 1;
    }
    if (branchCount == 0) {
      console.error("something went wrong");
    }
  });
  const flattenRFMData = infoMap
    .getFlattenData()
    .filter((d) => d.totalAmount > 0)
    .map((d) => {
      return {
        recency: d.recency,
        monetaryAvgWeek: d.monetary.avgWeek,
        monetaryAvgMonth: d.monetary.avgMonth,
        monetaryAvgYear: d.monetary.avgYear,
        frequencyAvgWeek: d.frequency.avgWeek,
        frequencyAvgMonth: d.frequency.avgMonth,
        frequencyAvgYear: d.frequency.avgYear,
        transactionDescription: d.transactionDescription,
      };
    });
  return flattenRFMData;
}
function getInfoMap(transactions) {
  /**
   * return a map: {transactionDescription->{credit: {earlestDay: time, latestDay: time, transactionCount: int, totalAmount: int}
   * debit: {earlestDay: time, latestDay: time, transactionCount: int, totalAmount: int}
   * }}, total Amount refers to the amount of money
   */
  const infoMap = new Map();
  transactions.forEach((transaction) => {
    // get values
    const transactionDescription = transaction["Transaction Description"];
    const date = transaction["date"];
    const transactionType = transaction["Credit Amount"] == 0 ? "debit" : "credit";
    const transactionAmount = transactionType == "credit"
      ? transaction["Credit Amount"]
      : transaction["Debit Amount"];
    const transactionNumber = transaction["Transaction Number"];

    // add empty information into the temp Map
    if (!infoMap.has(transactionDescription)) {
      infoMap.set(transactionDescription, {
        credit: {
          earlestDay: null,
          latestDay: null,
          transactionCount: 0,
          totalAmount: 0,
          transactionNumbers: [],
          totalAmountHistory: [], // this is only for debugging
        },
        debit: {
          earlestDay: null,
          latestDay: null,
          transactionCount: 0,
          totalAmount: 0,
          transactionNumbers: [],
          totalAmountHistory: [], // this is only for debugging
        },
      });
    }
    const oldData = infoMap.get(transactionDescription);
    const objToUpdate = transactionType == "credit" ? oldData.credit : oldData.debit;
    // update the earlestDay and latest Day
    if (objToUpdate.earlestDay == null || objToUpdate.earlestDay > date) {
      objToUpdate.earlestDay = date;
    }
    if (objToUpdate.latestDay == null || objToUpdate.latestDay < date) {
      objToUpdate.latestDay = date;
    }
    // update the transactionCount and total Amount
    objToUpdate.transactionCount += 1;
    objToUpdate.totalAmountHistory.push({
      transactionNumber: transactionNumber,
      totalAmount: objToUpdate.totalAmount,
    }); // debugging only
    objToUpdate.totalAmount += transactionAmount;
    objToUpdate.transactionNumbers.push(transactionNumber); // debugging only
  });
  // function that returns flatten data
  infoMap.getFlattenData = function () {
    return Array.from(this)
      .map((arr) => [
        {
          transactionDescription: arr[0],
          transactionDirection: "credit",
          ...arr[1].credit,
        },
        {
          transactionDescription: arr[0],
          transactionDirection: "debit",
          ...arr[1].debit,
        },
      ])
      .flat();
  };
  return infoMap;
}
function getDateDiff(oldDate, newDate = new Date()) {
  //https://www.javatpoint.com/javascript-date-difference
  return Math.floor((newDate - oldDate) / (1000 * 60 * 60 * 24));
}
function countNumWeek(oldDate, newDate = new Date()) {
  return getDateDiff(oldDate, newDate) / WEEK;
}
function countNumMonth(oldDate, newDate = new Date()) {
  return getDateDiff(oldDate, newDate) / MONTH;
}
function countNumYear(oldDate, newDate = new Date()) {
  return getDateDiff(oldDate, newDate) / YEAR;
}
function getRFMFromInfo(infoChild) {
  // infoChild : {
  //     earlestDay: null,
  //     latestDay: null,
  //     transactionCount: 0,
  //     totalAmount: 0
  // },
  // return an object like this: {
  // recency: int,
  // frequency: {avgWeek: float, avgMonth: float, avgYear: float},
  // monetary: float
  // }
  const transactionCount = infoChild.transactionCount;
  const totalAmount = infoChild.totalAmount;
  return {
    recency: getDateDiff(infoChild.latestDay),
    frequency: {
      avgWeek: transactionCount / countNumWeek(infoChild.earlestDay),
      avgMonth: transactionCount / countNumMonth(infoChild.earlestDay),
      avgYear: transactionCount / countNumYear(infoChild.earlestDay),
      total: transactionCount,
    },
    monetary: {
      avgWeek: totalAmount / countNumWeek(infoChild.earlestDay),
      avgMonth: totalAmount / countNumMonth(infoChild.earlestDay),
      avgYear: totalAmount / countNumYear(infoChild.earlestDay),
      total: totalAmount,
    },
  };
}
