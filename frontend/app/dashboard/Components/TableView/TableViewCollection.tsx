import { CSSProperties, useState } from "react"
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
    const [currentTable, setCurrentTable] = useState<'brushedTable' | 'glyphTable'>('brushedTable')
    const { transactionDataArr,
        brushedTransactionNumberSet,
        handleClearBrush,
        selectedGlyphTransactionNumberSet,
        handleClearGlyph,
        colourScale,
        colourValueGetter } = props

    const handleChangeCurrentTable = (e: { target: { value: string | ((prevState: "brushedTable" | "glyphTable") => "brushedTable" | "glyphTable") } }) => {
        setCurrentTable(e.target.value as 'brushedTable' | 'glyphTable')
    }

    return (
        <div style={style}>
            <span>
                <label htmlFor="brushedTable">brushed table
                    <input type="radio" name="brushedTable" id="" value={'brushedTable'} checked={currentTable === 'brushedTable'} onChange={handleChangeCurrentTable} />
                </label>
            </span>
            <span>
                <label htmlFor="glyphTable">glyph table
                    <input type="radio" name="glyphTable" id="" value={'glyphTable'} checked={currentTable === 'glyphTable'} onChange={handleChangeCurrentTable} />
                </label>
            </span>
            {currentTable === 'brushedTable' && <TableView
                transactionDataArr={transactionDataArr}
                transactionNumberSet={brushedTransactionNumberSet}
                handleClearSelect={handleClearBrush}
                colourScale={colourScale}
                colourValueGetter={colourValueGetter}
            ></TableView>}
            {currentTable === 'glyphTable' && <TableView
                transactionDataArr={transactionDataArr}
                transactionNumberSet={selectedGlyphTransactionNumberSet}
                handleClearSelect={handleClearGlyph}
                colourScale={colourScale}
                colourValueGetter={colourValueGetter}
            ></TableView>}
        </div>
    )
}

const style: CSSProperties = {
    position: 'absolute',
    right: '135px',
    top: '420px',
    overflowY: 'scroll',
    height:'400px',
    width: '900px'
}