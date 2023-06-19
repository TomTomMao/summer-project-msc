import { ETransactionVariable } from "@/app/dashboard/Transaction"
import { IMapping } from "../../CalendarView"
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
const attributes: TAttribute[] = [{ name: ETransactionVariable.category, dataType: EDataType.Nominal },
{ name: ETransactionVariable.transactionType, dataType: EDataType.Nominal },
{ name: ETransactionVariable.debitAmount, dataType: EDataType.Quantatitive }]
export default function MappingController({ mappings, transactionVariables }: { mappings: IMapping[], transactionVariables: ETransactionVariable[]}) {
    function getVariableDataType (transactionVariable: ETransactionVariable) {
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
    const attributes: TAttribute[] = useMemo(()=>{
        return transactionVariables.map(v=>{
            return {name:v, dataType: getVariableDataType(v)}
        })
    },[transactionVariables])
    return (
        <div>
            {mappings.map((mapping: IMapping) => {
                if (mapping.dataVariable==null) {
                    return (<CalendarControllerRow name={mapping.visualVariable}>
                        <AttributeSelector attributes={attributes} selectedAttribute={null}></AttributeSelector>
                    </CalendarControllerRow>)
                } 
                return (<CalendarControllerRow name={mapping.visualVariable}>
                    <AttributeSelector attributes={attributes} selectedAttribute={{name: mapping.dataVariable, dataType: getVariableDataType(mapping.dataVariable)}}></AttributeSelector>
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
    { attributes, selectedAttribute }: { attributes: TAttribute[], selectedAttribute: TAttribute|null }
) {
    
    return (
        <select className="w-full h-full" value={selectedAttribute!==null ? '(' + selectedAttribute.dataType.slice(0, 1) + ')' + selectedAttribute.name : 'not defined'}>
            {attributes.map((attribute) => {
                return (<option key={attribute.name}>
                    {'(' + attribute.dataType.slice(0, 1) + ')' + attribute.name}
                </option>)
            })}
            <option>not defined</option>
        </select>
    )
}