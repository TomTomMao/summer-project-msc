import { TransactionData } from "../../utilities/DataObject"
import { PublicScale, PublicValueGetter } from "../../utilities/types"
import TableView from "./TableView"

interface TableViewCollectionProps {
    transactionDataArr: TransactionData[], // give it to the tables
    brushedTransactionNumberSet: Set<TransactionData['transactionNumber']>, // for brushedTable
    handleClearBrush: () => void, // for brushedTable
    selectedGlyphTransactionNumberSet: Set<TransactionData['transactionNumber']>, // for glyphTable
    handleClearGlyph: () => void,
    colourScale: PublicScale['colourScale'], // give it to the tables
    colourValueGetter: PublicValueGetter['colour'], // give it to the tables
}

export function TableViewCollection(props: TableViewCollectionProps) {
    let currentTable: 'brushedTable' | 'glyphTable' = 'brushedTable'
    const { transactionDataArr,
        brushedTransactionNumberSet,
        handleClearBrush,
        selectedGlyphTransactionNumberSet,
        handleClearGlyph,
        colourScale,
        colourValueGetter } = props
    if (currentTable === 'brushedTable') {
        return (
            <>
                <TableView
                    transactionDataArr={transactionDataArr}
                    transactionNumberSet={brushedTransactionNumberSet}
                    handleClearSelect={handleClearBrush}
                    colourScale={colourScale}
                    colourValueGetter={colourValueGetter}
                ></TableView>
            </>
        )
    } else if(currentTable === 'glyphTable') {
        return (
            <>
                <TableView
                    transactionDataArr={transactionDataArr}
                    transactionNumberSet={selectedGlyphTransactionNumberSet}
                    handleClearSelect={handleClearGlyph}
                    colourScale={colourScale}
                    colourValueGetter={colourValueGetter}
                ></TableView>
            </>
        )
    }
}