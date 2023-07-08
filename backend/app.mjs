import express from "express";
import cors from "cors";
import { getRFMData } from "./getRFMData.mjs";
import { getTransactionData } from "./getTransactionData.mjs";


const app = express();
const port = 3030;
const transactionDataArrCache = await getTransactionData();
const RFMDataCache = getRFMData(transactionDataArrCache);

app.use(cors());
app.options("*", cors()); //pre-flight across-the-board

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.get("/transactionData", async (req, res) => {
  res.json(transactionDataArrCache);
});

app.get("/transactionData/rfm", async (req, res) => {
  res.json(RFMDataCache);
});
