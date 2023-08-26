import { CSSProperties, Dispatch, SetStateAction, useState } from "react"
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
    const tableOption = <TableOption
        currentTable={currentTable}
        handleChangeCurrentTable={setCurrentTable}
    ></TableOption>
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
            >{tableOption}</TableView>}
            {currentTable === 'glyphTable' && <TableView
                transactionDataArr={transactionDataArr}
                transactionNumberSet={selectedGlyphTransactionNumberSet}
                handleClearSelect={handleClearGlyph}
                colourScale={colourScale}
                colourDomainData={colourDomainData}
            >{tableOption}</TableView>}
        </div>
    )
}

function TableOption({ currentTable, handleChangeCurrentTable }: {
    currentTable: 'brushedTable' | 'glyphTable', handleChangeCurrentTable: Dispatch<SetStateAction<"brushedTable" | "glyphTable">>
}) {
    return (<>
        <span>
            <label htmlFor="brushedTable" >Brushed Data
                <input type="radio" name="brushedTable" id="brushedTable" value={'brushedTable'} checked={currentTable === 'brushedTable'} onChange={() => handleChangeCurrentTable('brushedTable')} />
            </label>
        </span>
        <span>
            <label htmlFor="glyphTable" style={{ accentColor: 'red' }}>Selected Glyph Data
                <input type="radio" name="glyphTable" id="glyphTable" value={'glyphTable'} checked={currentTable === 'glyphTable'} onChange={() => handleChangeCurrentTable('glyphTable')} />
            </label>
        </span></>)
}