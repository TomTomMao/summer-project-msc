import { ETransactionVariable } from "@/app/dashboard/DataObject"
import { ECalendarViewVisualVariables, IMapping } from "../../CalendarView"
import CalendarControllerRow from "../CalendarControllerRow"
import { useMemo } from "react"

enum EDataType {
    Quantatitive = 'Quantatitive',
    Nominal = 'Nominal',
    Ordinal = 'Ordinal',
    Time = 'Time'
}
type TAttribute = {
    name: ETransactionVariable,
    dataType: EDataType
}
export default function MappingController({ mappings, transactionVariables, handleSetMappings }:
    {
        mappings: IMapping[], transactionVariables: ETransactionVariable[],
        handleSetMappings: (newVisualVariable: ECalendarViewVisualVariables, newDataVariable: IMapping['dataVariable']) => void
    }) {
    function getVariableDataType(transactionVariable: ETransactionVariable) {
        if (transactionVariable == ETransactionVariable.balance) {
            return EDataType.Quantatitive
        }
        if (transactionVariable == ETransactionVariable.category) {
            return EDataType.Nominal
        }
        if (transactionVariable == ETransactionVariable.creditAmount) {
            return EDataType.Quantatitive
        }
        if (transactionVariable == ETransactionVariable.debitAmount) {
            return EDataType.Quantatitive
        }
        if (transactionVariable == ETransactionVariable.date) {
            return EDataType.Time
        }
        if (transactionVariable == ETransactionVariable.locationCity) {
            return EDataType.Nominal
        }
        if (transactionVariable == ETransactionVariable.locationCountry) {
            return EDataType.Nominal
        }
        if (transactionVariable == ETransactionVariable.transactionDescription) {
            return EDataType.Nominal
        }
        if (transactionVariable == ETransactionVariable.transactionNumber) {
            return EDataType.Nominal
        }
        if (transactionVariable == ETransactionVariable.transactionType) {
            return EDataType.Nominal
        } else {
            throw new Error("transactionVariable is not part of ETransactionVariable enum");

        }
    }
    const attributes: TAttribute[] = useMemo(() => {
        return transactionVariables.map(v => {
            return { name: v, dataType: getVariableDataType(v) }
        })
    }, [transactionVariables])
    return (
        <div>
            {mappings.map((mapping: IMapping) => {
                if (mapping.dataVariable == null) {
                    return (<CalendarControllerRow name={mapping.visualVariable} key={mapping.visualVariable}>
                        <AttributeSelector attributes={attributes} selectedAttribute={null}
                            handleChange={(newDataVariable: ETransactionVariable | null) => handleSetMappings(mapping.visualVariable, newDataVariable)} />
                    </CalendarControllerRow>)
                }
                return (<CalendarControllerRow name={mapping.visualVariable} key={mapping.visualVariable}>
                    <AttributeSelector attributes={attributes}
                        handleChange={(newDataVariable: ETransactionVariable | null) => handleSetMappings(mapping.visualVariable, newDataVariable)}
                        selectedAttribute={{ name: mapping.dataVariable, dataType: getVariableDataType(mapping.dataVariable) }} />
                </CalendarControllerRow>)
            })}
            {/* <CalendarControllerRow name='Colour'>
                <AttributeSelector attributes={attributes} selectedAttribute={attributes[0]}></AttributeSelector>
            </CalendarControllerRow><hr />
            <CalendarControllerRow name='Size'>
                <AttributeSelector attributes={attributes} selectedAttribute={attributes[1]}></AttributeSelector>
            </CalendarControllerRow><hr />
            <CalendarControllerRow name='Shape'>
                <AttributeSelector attributes={attributes} selectedAttribute={attributes[2]}></AttributeSelector>
            </CalendarControllerRow><hr />
            <CalendarControllerRow name='Texture'>
                <AttributeSelector attributes={attributes} selectedAttribute={attributes[2]}></AttributeSelector>
            </CalendarControllerRow> */}
        </div>
    )
}


function AttributeSelector(
    { attributes, selectedAttribute, handleChange }: {
        attributes: TAttribute[], selectedAttribute: TAttribute | null
        , handleChange: (newDataVariable: ETransactionVariable | null) => void
    }
) {

    return (
        <select className="w-full h-full"
            onChange={(e) => {
                const newDataVariable = e.target.value.slice(3)
                if (Object.values(ETransactionVariable).includes(newDataVariable as unknown as ETransactionVariable)) {
                    console.time('changeattribute')
                    handleChange(newDataVariable) // asserted by the if statement
                    console.timeEnd('changeattribute')
                } else {
                    handleChange(null)
                }
                
            }}
            value={selectedAttribute !== null ? '(' + selectedAttribute.dataType.slice(0, 1) + ')' + selectedAttribute.name : 'not defined'}>
            {attributes.map((attribute) => {
                return (<option key={attribute.name}>
                    {'(' + attribute.dataType.slice(0, 1) + ')' + attribute.name}
                </option>)
            })}
            <option>not defined</option>
        </select>
    )
}