import { TransactionData } from "../../utilities/DataObject"
import { PublicScale } from "../../utilities/types"
import TableView from "./TableView"
import { ColourDomainData } from "../ColourChannel/colourChannelSlice"
import { useClusterDataMap } from "../../hooks/useClusterData"
import { useAppDispatch, useAppSelector } from "@/app/hooks"
import * as interactivitySlice from "../Interactivity/interactivitySlice"

interface TableViewCollectionProps {
    transactionDataArr: TransactionData[], // give it to the tables
    brushedTransactionNumberSet: Set<TransactionData['transactionNumber']>, // for brushedTable
    handleClearBrush: () => void, // for brushedTable
    selectedGlyphTransactionNumberSet: Set<TransactionData['transactionNumber']>, // for glyphTable
    handleClearGlyph: () => void,
    colourScale: PublicScale['colourScale'], // give it to the brushed data table
    colourDomainData: ColourDomainData[], // give it to the brushed data table
    glyphColourScale: PublicScale['colourScale'], // give it to the glyph data table
    glyphColourDomainData: ColourDomainData[], // give it to the glyph data table
}

export function TableViewCollection(props: TableViewCollectionProps) {
    const currentTable = useAppSelector(interactivitySlice.selectCurrentTable)
    const dispatch = useAppDispatch()
    const { transactionDataArr,
        brushedTransactionNumberSet,
        handleClearBrush,
        selectedGlyphTransactionNumberSet,
        handleClearGlyph,
        colourScale,
        colourDomainData,
        glyphColourScale,
        glyphColourDomainData } = props
    const tableOption = <TableOption
        currentTable={currentTable}
        handleChangeCurrentTable={(nextTable: 'glyphTable' | 'brushedTable') => dispatch(interactivitySlice.setCurrentTable(nextTable))}
    ></TableOption>
    const clusterDataMap = useClusterDataMap()
    return (
        <div style={{
            margin: 'auto auto'
        }} className="tableView" id='tableView'>
            {currentTable === 'brushedTable' && <TableView
                transactionDataArr={transactionDataArr}
                transactionNumberSet={brushedTransactionNumberSet}
                clusterDataMap={clusterDataMap}
                handleClearSelect={handleClearBrush}
                colourScale={colourScale}
                colourDomainData={colourDomainData}
            >{tableOption}</TableView>}
            {currentTable === 'glyphTable' && <TableView
                transactionDataArr={transactionDataArr}
                transactionNumberSet={selectedGlyphTransactionNumberSet}
                clusterDataMap={clusterDataMap}
                handleClearSelect={handleClearGlyph}
                colourScale={glyphColourScale}
                colourDomainData={glyphColourDomainData}
            >{tableOption}</TableView>}
        </div>
    )
}

function TableOption({ currentTable, handleChangeCurrentTable }: {
    currentTable: 'brushedTable' | 'glyphTable', handleChangeCurrentTable: (nextTable: 'glyphTable' | 'brushedTable') => void
}) {
    return (
        <div className="flex flex-row justify-center items-center gap-2">
            <span className="flex items-center">
                <label htmlFor="brushedTable" style={{ accentColor: 'blue', marginRight: '0.5em' }}>
                    Brushed Data
                </label>
                <input
                    type="radio"
                    name="brushedTable"
                    id="brushedTable"
                    value="brushedTable"
                    checked={currentTable === 'brushedTable'}
                    onChange={() => handleChangeCurrentTable('brushedTable')}
                    style={{ marginTop: '2px' }} // Adjusted to align with the label
                />
            </span>
            <span className="flex items-center">
                <label htmlFor="glyphTable" style={{ accentColor: 'red', marginRight: '0.5em', paddingLeft: '1em' }}>
                    Selected Glyph Data
                </label>
                <input
                    type="radio"
                    name="glyphTable"
                    id="glyphTable"
                    value="glyphTable"
                    checked={currentTable === 'glyphTable'}
                    onChange={() => handleChangeCurrentTable('glyphTable')}
                    style={{ marginTop: '2px', accentColor: 'red' }} // Adjusted to align with the label
                />
            </span>
        </div>
    );
}