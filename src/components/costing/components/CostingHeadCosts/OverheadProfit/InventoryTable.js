import React, { useState, useEffect, useContext } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Col, Container, Row } from 'reactstrap'
import { TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import { checkForNull, number, checkWhiteSpaces, decimalAndNumberValidation, nonZero, maxLength7 } from '../../../../../helper'

import TableRenderer from '../../../../common/TableRenderer'

function InventoryDetails(props) {
    const { register, control, setValue, getValues,  errors , isViewMode} = props

    const [state, setState] = useState({
        inventoryTypeDetails: [],
        totalIccPayable: 0,

    })
    const dispatch = useDispatch()


const fieldValues = useWatch({
    control,
    name: ['MarkupFactor',]
})
 useEffect(()=>{
    if(state?.inventoryTypeDetails?.length > 0){
    let markupFactor = checkForNull(getValues('MarkupFactor'));
    const updatedDetails = state?.inventoryTypeDetails.map(item => {
        if(item.InventoryType === "Receivables") {
            let netCost = checkForNull((item.ApplicabilityCost * item.NumberOfDays * props?.annualInterestPercent * markupFactor)/36500);
            return { ...item, NetCost: netCost };
        }
        return item;
    });
    setState(prev => ({ ...prev, inventoryTypeDetails: updatedDetails }));
    props?.setInventoryDetail(updatedDetails)
}
},[fieldValues])

useEffect(()=>{
    if(state?.inventoryTypeDetails?.length > 0){
        let totalIccPayable = state?.inventoryTypeDetails.reduce((acc, item) => acc + item.NetCost, 0);
        setState(prev => ({ ...prev, totalIccPayable: totalIccPayable }));
        props?.calculateInventoryCarryingCost(props?.totalIccReceivable,totalIccPayable)
    }
},[state?.inventoryTypeDetails])

useEffect(() => {
  setState(prev => ({
    ...prev,
    inventoryTypeDetails: props?.inventoryTypeDetails
  }))
}, [props?.inventoryTypeDetails,props?.wipCompositionMethodDetails])

useEffect(()=>{
    if(props?.wipCompositionMethodDetails?.length > 0){
        let totalWipCost = props?.wipCompositionMethodDetails?.reduce((acc, item) => acc + item.ApplicabilityCost, 0);
        let inventoryTypeDetails = [...props?.inventoryTypeDetails];
        const updatedInventoryTypeDetails = inventoryTypeDetails?.map(item => {
            if (item?.InventoryType === 'WIP') {
                return {
                    ...item,
                    ApplicabilityCost: totalWipCost,
                    NetCost: checkForNull((totalWipCost * item?.NumberOfDays * props?.annualInterestPercent)/36500)
                };
            }else {
                return {
                    ...item,
                    ApplicabilityCost: item.ApplicabilityCost,
                    NetCost: item.NetCost
                };
            }
        });
    
        setState(prev => ({
            ...prev,
            totalWipCost: totalWipCost,
            inventoryTypeDetails: updatedInventoryTypeDetails
        })); 
        props?.setInventoryDetail(updatedInventoryTypeDetails)
    }
},[props?.wipCompositionMethodDetails])

    const handleApplicabilityCostChange = (e, data) => {
        let val = checkForNull(e.target.value);
        let netCost = 0;
        let markupFactor =checkForNull(getValues('MarkupFactor'));
        const updatedDetails = state.inventoryTypeDetails.map(item => {
            if (item.InventoryType==="Finished Goods"||item.InventoryType==="Transit") {
                netCost = checkForNull((val * item?.NumberOfDays * props?.annualInterestPercent)/36500);
                return { ...item, ApplicabilityCost: val, NetCost: netCost };
            }else if(item.InventoryType==="Receivables"){
                netCost = checkForNull((val * item?.NumberOfDays * props?.annualInterestPercent * markupFactor)/36500);
                return { ...item, ApplicabilityCost: val, NetCost: netCost };
            }
            return item;
        });
        setState(prev => ({ ...prev, inventoryTypeDetails: updatedDetails }));
        props?.setInventoryDetail(updatedDetails)
    }
   
    const inventoryTypeColumns = [
        {
            columnHead: "Inventory Day Type",
            key: "InventoryType",
            identifier: "text",
        },
        {
            columnHead: "No of Days",
            key: "NumberOfDays",
            identifier: "inputOutput",
        },
        {
            columnHead: "Applicability Cost",
            key: "ApplicabilityCost",
            identifier: "cost",
            fieldKey: "ApplicabilityCostForInventory",
            valueKey: "ApplicabilityCost",
            mandatory: true,
            validate: { number, checkWhiteSpaces, maxLength7 },
            handleChangeFn: handleApplicabilityCostChange,
            type: "textField",
            disabled: (item) => !["Finished Goods"].includes(item.InventoryType)
        },
        {
            columnHead: "Net Cost",
            key: "NetCost",
            identifier: "cost",
        }
    ]
   

    return (
        <>
            <Row>
                <Col md="3">
                    <TextFieldHookForm
                        label={`Markup Factor`}
                        name={'MarkupFactor'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        rules={{
                            required: false,
                            validate: { number, nonZero, checkWhiteSpaces, decimalAndNumberValidation },
                        }}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.MarkupFactor}
                        disabled={isViewMode ? true : false}
                    />
                </Col>
            </Row>
            <Row>
                <Col md="12">
                    <TableRenderer
                        data={state.inventoryTypeDetails}
                        columns={inventoryTypeColumns}
                        register={register}
                        Controller={Controller}
                        control={control}
                        errors={errors}
                        isViewMode={isViewMode}
                        setValue={setValue}
                        isInventory={true}
                        totalIccPayable={state?.totalIccPayable}
                    />
                </Col>
            </Row>
        </>
    )
}

export default InventoryDetails
