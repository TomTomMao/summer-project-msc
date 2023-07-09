import { useMemo, useState } from "react";
import { TransactionData, RFMData } from "../DataObject";

export default function TableView({ transactionDataArr, RFMDataArr }: { transactionDataArr: TransactionData[], RFMDataArr: RFMData[] }) {
    const [filteredTransactionNumbers, setFilteredTransactionNumbers] = useState<Set<string>>(new Set(transactionDataArr.map(transactionData => transactionData.transactionNumber)))
    const [descriptionQuery, setDescriptionQuery] = useState<string>('')
    function handleSearch() {
        const nextFilteredTransactionNumbers: Set<string> = new Set(
            transactionDataArr.filter(transactionData => transactionData.transactionDescription.includes(descriptionQuery)).
                map(transactionData => transactionData.transactionNumber));
        setFilteredTransactionNumbers(nextFilteredTransactionNumbers);
    }
    const filteredTransactionDataArr = useMemo(() => {
        return transactionDataArr.filter(transactionDataArr => filteredTransactionNumbers.has(transactionDataArr.transactionNumber));
    }, [filteredTransactionNumbers])
    const transactionRows = useMemo(() => {
        return (
            filteredTransactionDataArr.map(transactionData => {
                return (
                    <tr key={transactionData.transactionNumber}>
                        <td>{transactionData.transactionNumber}</td>
                        <td>{transactionData.balance}</td>
                        <td>{transactionData.category}</td>
                        <td>{transactionData.creditAmount}</td>
                        <td>{transactionData.debitAmount}</td>
                        <td>{transactionData.locationCity}</td>
                        <td>{transactionData.locationCountry}</td>
                        <td>{transactionData.transactionDescription}</td>
                        <td>{transactionData.transactionType}</td>
                    </tr>)
            })
        )
    }, [filteredTransactionNumbers])

    return (
        <div>
            <input type="text" value={descriptionQuery} onChange={(e) => setDescriptionQuery(e.target.value)} />
            <button onClick={handleSearch}>search</button>
            number of results: {filteredTransactionDataArr.length}
            <table>
                <thead>
                    <tr>
                        <td>transactionNumber</td>
                        <td>balance</td>
                        <td>category</td>
                        <td>creditAmount</td>
                        <td>debitAmount</td>
                        <td>locationCity</td>
                        <td>locationCountry</td>
                        <td>transactionDescription</td>
                        <td>transactionType</td>
                    </tr>
                </thead>
                <tbody>
                    {transactionRows}
                </tbody>
            </table>
        </div>
    )
}