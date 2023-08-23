import { CSSProperties, useState } from "react"
import { TransactionData } from "../../utilities/DataObject"
import { PublicScale, PublicValueGetter } from "../../utilities/types"
import TableView from "./TableView"
import FolderableContainer from "../Containers/FolderableContainer"
import { ColourDomainData } from "../ColourChannel/colourChannelSlice"

interface TableViewCollectionProps {
    transactionDataArr: TransactionData[], // give it to the tables
    brushedTransactionNumberSet: Set<TransactionData['transactionNumber']>, // for brushedTable
    handleClearBrush: () => void, // for brushedTable
    selectedGlyphTransactionNumberSet: Set<TransactionData['transactionNumber']>, // for glyphTable
    handleClearGlyph: () => void,
    colourScale: PublicScale['colourScale'], // give it to the tables
    colourDomainData: ColourDomainData[], // give it to the tables
}

export function TableViewCollection(props: TableViewCollectionProps) {
    const [currentTable, setCurrentTable] = useState<'brushedTable' | 'glyphTable'>('brushedTable')
    const { transactionDataArr,
        brushedTransactionNumberSet,
        handleClearBrush,
        selectedGlyphTransactionNumberSet,
        handleClearGlyph,
        colourScale,
        colourDomainData } = props

    return (
        <div style={{
            margin: 'auto auto'
        }} className="tableView" id='tableView'>
            {currentTable === 'brushedTable' && <TableView
                transactionDataArr={transactionDataArr}
                transactionNumberSet={brushedTransactionNumberSet}
                handleClearSelect={handleClearBrush}
                colourScale={colourScale}
                colourDomainData={colourDomainData}
            ><span>
                    <label htmlFor="brushedTable" onClick={() => setCurrentTable('brushedTable')}>brushed table
                        <input type="radio" name="brushedTable" id="" value={'brushedTable'} checked={true} />
                    </label>
                </span>
                <span>
                    <label htmlFor="glyphTable" onClick={() => setCurrentTable('glyphTable')} style={{accentColor: 'red'}}>glyph table
                        <input type="radio" name="glyphTable" id="" value={'glyphTable'} checked={false} />
                    </label>
                </span></TableView>}
            {currentTable === 'glyphTable' && <TableView
                transactionDataArr={transactionDataArr}
                transactionNumberSet={selectedGlyphTransactionNumberSet}
                handleClearSelect={handleClearGlyph}
                colourScale={colourScale}
                colourDomainData={colourDomainData}
            ><span>
                    <label htmlFor="brushedTable" onClick={() => setCurrentTable('brushedTable')}>brushed table
                        <input type="radio" name="brushedTable" id="" value={'brushedTable'} checked={false} />
                    </label>
                </span>
                <span>
                    <label htmlFor="glyphTable" onClick={() => setCurrentTable('glyphTable')}>glyph table
                        <input type="radio" name="glyphTable" id="" value={'glyphTable'} checked={true} style={{accentColor: 'red'}} />
                    </label>
                </span></TableView>}
        </div>
    )
}