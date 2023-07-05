import express from "express";
import cors from "cors";
import { parse } from "csv-parse";
import * as fs from 'fs';

const app = express();
const port = 3030;

app.use(cors());
app.options("*", cors()); //pre-flight across-the-board

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.get("/transactionData", async (req, res) => {
  let csvData = await getTransactionData();

  res.json(csvData);
});

async function getTransactionData() {
  const csvPromise = new Promise((resolve, reject) => {
    fs.readFile(
      "../data/transaction_cleaned.csv",
      (err, fileData) => {
        parse(fileData, {}, function (err, rows) {
          // console.log("rows", rows, err);
          resolve(rows);
        });
      }
    );
  });
  let csvArrays = await csvPromise;
  let csvObjects = []
  const headers = csvArrays[0]
  for (let i = 1; i < csvArrays.length; i ++) {
    let obj = {};
    for (let j = 0; j < headers.length; j++) {
      let colName = headers[j];
      let val = csvArrays[i][j];
      obj[colName] = val;
    }
    csvObjects.push(obj)
  }
  return csvObjects;
}
