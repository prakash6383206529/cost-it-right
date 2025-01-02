import React, { useContext, useEffect, useState } from 'react'
import { Row, Col, Container, } from 'reactstrap'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { number, checkWhiteSpaces, maxLength7, checkForNull, checkForDecimalAndNull, loggedInUserId } from '../../../../helper'
import { useDispatch, useSelector } from 'react-redux'
import Toaster from '../../../common/Toaster'
import TooltipCustom from '../../../common/Tooltip'
import Button from '../../../layout/Button'
import { TextFieldHookForm } from '../../../layout/HookFormInputs'
import { getPackagingCalculation, getSimulationPackagingCalculation, getVolumePerDayForPackagingCalculator, savePackagingCalculation } from '../../actions/CostWorking'
import { Drawer } from '@material-ui/core'
import { useTranslation } from 'react-i18next'
import { ViewCostingContext } from '../CostingDetails'
import { AWAITING_APPROVAL_ID, DRAFT, DRAFTID, PENDING_FOR_APPROVAL_ID, REJECTEDID } from '../../../../config/constants'
import { debounce } from 'lodash'
function PackagingCalculator(props) {
const {rowObjData} = props
    const [state, setState] = useState({
        volumePerDay:0,
        volumePerAnnum:0,
        packingCost: 0,
        noOfCratesRequiredPerDay:0,
        totalCostOfCrate:0,
        spacerPackingInsertRecoveryCost:0,
        totalCostOfSpacerPackingInsert:0,
        disableSubmit:false
    })
    const { costingData, CostingEffectiveDate} = useSelector(state => state.costing)
    const { NoOfDecimalForPrice, NoOfDecimalForInputOutput } = useSelector((state) => state.auth.initialConfiguration)
    const costingViewMode = useContext(ViewCostingContext);
    const CostingViewMode = costingViewMode??props?.CostingViewMode
    const dispatch = useDispatch()
    const {
        register,
        handleSubmit,
        control,
        setValue,
        getValues,
        formState: { errors },
    } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });

    const { t } = useTranslation('CostingLabels');
    const calclulationFieldValues = useWatch({
        control: control, 
        name: ['NoOfComponentsPerCrate','StockNormDays','WeightOfCover', 'CostOfCrate','CostOfCoverPerKg', 'AmortizedNoOfYears', 'NoOfPartsPerCover', 'SpacerPackingInsertCost', 'NoOfSpacerPackingInsert'],
        defaultValue: [] 
    })
    useEffect(() => {
        if (!CostingViewMode && calclulationFieldValues.some(value => value !== undefined)) {
            calculateAllValues();
        }
    }, [calclulationFieldValues,state?.spacerPackingInsertRecoveryCostPerKg]);
    useEffect(() => {
        if(!CostingViewMode){
        dispatch(getVolumePerDayForPackagingCalculator(costingData?.PartId, costingData?.PlantId, CostingEffectiveDate, costingData?.VendorId, (res) => {
            if(res?.status === 204){
                Toaster.warning("Volume data doesn't exist for the selected part. Add the volume to calculate the packaging cost.")
                return false
            }
            let data = res?.data?.Data
            setValue('VolumePerDay', checkForDecimalAndNull(data?.VolumePerDay, NoOfDecimalForInputOutput))
            setValue('VolumePerAnnum', checkForDecimalAndNull(data?.VolumePerAnnum, NoOfDecimalForInputOutput))
            setState((prevState) => ({ ...prevState, volumePerDay: data?.VolumePerDay, volumePerAnnum: data?.VolumePerAnnum }))
        }))
        }
        const tempData = rowObjData?.SimulationTempData
        // const index = props?.viewPackaingData?.findIndex(item => item.PackagingDetailId === rowObjData?.PackagingDetailId)
        // if (props.simulationMode && tempData?.map(item => item?.CostingHeading)?.includes("New Costing") && tempData?.map(item => Number(item?.SimulationStatusId)).some(id => [REJECTEDID, PENDING_FOR_APPROVAL_ID, AWAITING_APPROVAL_ID, DRAFTID].includes(id)) && props?.viewPackaingData[index]?.Applicability === 'Crate/Trolley') {
        //     const simulationId = tempData.find(item => item?.CostingHeading === "New Costing")?.SimulationId
        //     dispatch(getSimulationPackagingCalculation(simulationId, costingId, (res) => {
            //         let data = res?.data?.Data
            //         setFormValues(data)
            //      }))
            // }
            // else{
            const costingId = costingData?.CostingId??tempData.find(item => item?.CostingHeading === "Old Costing")?.costingId
            let calculatorId = rowObjData && Object.keys(rowObjData).length > 0?rowObjData?.CostingPackagingCalculationDetailsId:props?.costingPackagingCalculationDetailsId??null
            let packagingDetailId = rowObjData && Object.keys(rowObjData).length > 0?rowObjData?.PackagingDetailId:null
        dispatch(getPackagingCalculation(costingId, packagingDetailId, calculatorId, (res) => {
            let data = res?.data?.Data
            setFormValues(data)
           
        }))
    // }
    }, [])

const setFormValues=(data)=>{
    setValue('NoOfComponentsPerCrate', data?.NoOfComponentsPerCrate?checkForDecimalAndNull(data?.NoOfComponentsPerCrate, NoOfDecimalForInputOutput):'')
    setValue('NoOfCratesRequiredPerDay', data?.NoOfCratesRequiredPerDay?checkForDecimalAndNull(data?.NoOfCratesRequiredPerDay, NoOfDecimalForInputOutput):'')
    setValue('StockNormDays', data?.StockNormDays?checkForDecimalAndNull(data?.StockNormDays, NoOfDecimalForInputOutput):'')
    setValue('CostOfCrate', data?.CostOfCrate?checkForDecimalAndNull(data?.CostOfCrate, NoOfDecimalForPrice):'')
    setValue('TotalCostOfCrate', data?.TotalCostOfCrate?checkForDecimalAndNull(data?.TotalCostOfCrate, NoOfDecimalForPrice):'')
    setValue('AmortizedNoOfYears', data?.AmortizedNoOfYears?checkForDecimalAndNull(data?.AmortizedNoOfYears, NoOfDecimalForInputOutput):'')
    setValue('WeightOfCover', data?.WeightOfCoverPerKg?checkForDecimalAndNull(data?.WeightOfCoverPerKg, NoOfDecimalForInputOutput):'')
    setValue('CostOfCoverPerKg', data?.CostOfCoverPerKg?checkForDecimalAndNull(data?.CostOfCoverPerKg, NoOfDecimalForPrice):'')
    setValue('NoOfPartsPerCover', data?.NoOfPartsPerCover?checkForDecimalAndNull(data?.NoOfPartsPerCover, NoOfDecimalForInputOutput):'')
    setValue('SpacerPackingInsertCost', data?.SpacerPackingInsertCostIfAny?checkForDecimalAndNull(data?.SpacerPackingInsertCostIfAny, NoOfDecimalForPrice):'')
    setValue('NoOfSpacerPackingInsert', data?.NoOfSpacersPackingInsert?checkForDecimalAndNull(data?.NoOfSpacersPackingInsert, NoOfDecimalForInputOutput):'')
    setValue('SpacerPackingInsertRecovery', data?.SpacersPackingInsertRecoveryPercentage?checkForDecimalAndNull(data?.SpacersPackingInsertRecoveryPercentage, NoOfDecimalForInputOutput):'')
    setValue('SpacerPackingInsertRecoveryCostPerKg', data?.SpacersPackingInsertRecoveryCostPerKg?checkForDecimalAndNull(data?.SpacersPackingInsertRecoveryCostPerKg, NoOfDecimalForPrice):'')
    setValue('TotalCostOfSpacerPackingInsert', data?.CostOfSpacersPackingInsert?checkForDecimalAndNull(data?.CostOfSpacersPackingInsert, NoOfDecimalForPrice):'')
    setValue('PackingCost', data?.PackingCost?checkForDecimalAndNull(data?.PackingCost, NoOfDecimalForPrice):'')
    setState((prevState) => ({ ...prevState, 
        noOfCratesRequiredPerDay: data?.NoOfCratesRequiredPerDay,
        totalCostOfCrate: data?.TotalCostOfCrate,
        spacerPackingInsertRecoveryCostPerKg: data?.SpacersPackingInsertRecoveryCostPerKg, 
        totalCostOfSpacerPackingInsert: data?.CostOfSpacersPackingInsert, 
        packingCost: data?.PackingCost,
        volumePerDay: data?.VolumePerDay,
        volumePerAnnum: data?.VolumePerAnnum,
     }))
     if(CostingViewMode){
        setValue('VolumePerDay', checkForDecimalAndNull(data?.VolumePerDay, NoOfDecimalForInputOutput))
        setValue('VolumePerAnnum', checkForDecimalAndNull(data?.VolumePerAnnum, NoOfDecimalForInputOutput))
        setState((prevState) => ({ ...prevState, 
            volumePerDay: data?.VolumePerDay,
            volumePerAnnum: data?.VolumePerAnnum,
         }))
     }
}
    const packagingCalculatorFields = [
        { label: t('noOfComponentsPerCrate', { defaultValue: 'No. of components per crate/trolley' }), name: 'NoOfComponentsPerCrate', mandatory: true, searchable: false, disabled: CostingViewMode ? CostingViewMode : false },
        { label: t('volumePerDay', { defaultValue: 'Volume per day' }), name: 'VolumePerDay', mandatory: false, disabled: true ,tooltip: { text: `Coming from volume master`, width: '250px', customClass:"mt-4" ,disabledIcon: false} },
        { label: t('volumePerAnnum', { defaultValue: 'Volume per annum' }), name: 'VolumePerAnnum', mandatory: false, disabled: true, tooltip: { text: `${t('volumePerDay', { defaultValue: 'Volume per day' })} * 25 * 12`, width: '250px' ,disabledIcon: true} },
        { label: t('noOfCratesRequiredPerDay', { defaultValue: 'No. of crates/trolley required per day' }), name: 'NoOfCratesRequiredPerDay', mandatory: false, disabled: true, tooltip: { text: `${t('volumePerDay', { defaultValue: 'Volume per day' })} / ${t('noOfComponentsPerCrate', { defaultValue: 'No. of components per crate/trolley' })}`, width: '250px',disabledIcon: true } },
        { label: t('stockNormDays', { defaultValue: 'Stock Norm days' }), name: 'StockNormDays', mandatory: true, disabled: CostingViewMode ? CostingViewMode : false },
        { label: t('costOfCrate', { defaultValue: 'Cost of crate/trolley' }), name: 'CostOfCrate', mandatory: true, disabled: CostingViewMode ? CostingViewMode : false },
        { label: t('totalCostOfCrate', { defaultValue: 'Total cost of crate/trolley' }), name: 'TotalCostOfCrate', mandatory: false, disabled: true, tooltip: { text: `${t('noOfCratesRequiredPerDay', { defaultValue: 'No. of crates/trolley required per day' })} * ${t('stockNormDays', { defaultValue: 'Stock Norm days' })} * ${t('costOfCrate', { defaultValue: 'Cost of crate/trolley' })}`, width: '250px',disabledIcon: true } },
        { label: t('amortizedNoOfYears', { defaultValue: 'Amortized no. of years' }), name: 'AmortizedNoOfYears', mandatory: false, disabled: CostingViewMode ? CostingViewMode : false },
        { label: t('weightOfCover', { defaultValue: 'Weight of cover (kg)' }), name: 'WeightOfCover', mandatory: false, disabled: CostingViewMode ? CostingViewMode : false },
        { label: t('costOfCoverPerKg', { defaultValue: 'Cost of cover per kg' }), name: 'CostOfCoverPerKg', mandatory: false, disabled: CostingViewMode ? CostingViewMode : false },
        { label: t('noOfPartsPerCover', { defaultValue: 'No. of parts per cover' }), name: 'NoOfPartsPerCover', mandatory: false, disabled: CostingViewMode ? CostingViewMode : false },
        { label: t('spacerPackingInsertCost', { defaultValue: 'Spacer/packing/insert cost if any' }), name: 'SpacerPackingInsertCost', mandatory: true,  handleChange: (e) => { handleSpacerPackingInsertCost(e?.target?.value) }, disabled: CostingViewMode ? CostingViewMode : false },
        { label: t('noOfSpacerPackingInsert', { defaultValue: 'No. of spacer/packing/insert' }), name: 'NoOfSpacerPackingInsert', mandatory: false,  handleChange: (e) => { handleNoOfSpacerPackingInsert(e?.target?.value) }, disabled: CostingViewMode ? CostingViewMode : false },
        { label: t('spacerPackingInsertRecovery', { defaultValue: 'Spacer/packing/insert recovery %' }), name: 'SpacerPackingInsertRecovery',  handleChange: (e) => { handleSpacerPackingInsertRecovery(e?.target?.value) },mandatory: false, percentageLimit: true, disabled: CostingViewMode ? CostingViewMode : false },
        { label: t('spacerPackingInsertRecoveryCostPerKg', { defaultValue: 'Spacer/packing/insert recovery cost per kg' }), name: 'SpacerPackingInsertRecoveryCostPerKg', mandatory: false, disabled: true, tooltip: { text: `${t('spacerPackingInsertCost', { defaultValue: 'Spacer/packing/insert cost if any' })} * ${t('noOfSpacerPackingInsert', { defaultValue: 'No. of spacer/packing/insert' })} * (${t('spacerPackingInsertRecovery', { defaultValue: 'Spacer/packing/insert recovery %' })} / 100)`, width: '250px',disabledIcon: true } },
        { label: t('costOfSpacerPackingInsert', { defaultValue: 'Cost of spacer/packing/insert' }), name: 'TotalCostOfSpacerPackingInsert', mandatory: false, disabled: true, tooltip: { text: `${t('spacerPackingInsertCost', { defaultValue: 'Spacer/packing/insert cost if any' })} * ${t('noOfSpacerPackingInsert', { defaultValue: 'No. of spacer/packing/insert' })} - ${t('spacerPackingInsertRecoveryCostPerKg', { defaultValue: 'Spacer/packing/insert recovery cost per kg' })}`, width: '250px',disabledIcon: true } },
        {
            label: t('packagingCost', { defaultValue: 'Packaging Cost' }), name: 'PackingCost', mandatory: false, disabled: true, tooltip: {
                text: `(${t('totalCostOfCrate', { defaultValue: 'Total cost of crate/trolley' })} / (${t('volumePerAnnum', { defaultValue: 'Volume per annum' })} * ${t('amortizedNoOfYears', { defaultValue: 'Amortized no. of years' })})) + 
            ((${t('weightOfCover', { defaultValue: 'Weight of cover (kg)' })} * ${t('costOfCoverPerKg', { defaultValue: 'Cost of cover per kg' })}) / ${t('noOfPartsPerCover', { defaultValue: 'No. of parts per cover' })}) + 
            ${t('costOfSpacerPackingInsert', { defaultValue: 'Cost of spacer/packing/insert' })}`,
                width: '250px',disabledIcon: true
            }
        }
    ]
    const calculateAllValues = () => {
        const noOfComponentsPerCrate = checkForNull(getValues('NoOfComponentsPerCrate'))
        // Calculate all values
        const noOfCratesRequiredPerDay = state.volumePerDay / noOfComponentsPerCrate
        const stockNormDays = checkForNull(getValues('StockNormDays'))
        const costOfCrate = checkForNull(getValues('CostOfCrate'))
        const totalCostOfCrate = noOfCratesRequiredPerDay * stockNormDays * costOfCrate
        
        const spacerPackingInsertCost = checkForNull(getValues('SpacerPackingInsertCost'))
        const noOfSpacerPackingInsert = checkForNull(getValues('NoOfSpacerPackingInsert'))
        const costOfSpacerPackingInsert = (spacerPackingInsertCost * noOfSpacerPackingInsert) - state.spacerPackingInsertRecoveryCostPerKg
        
        const amortizedNoOfYears = checkForNull(getValues('AmortizedNoOfYears'))
        const weightOfCover = checkForNull(getValues('WeightOfCover'))
        const costOfCoverPerKg = checkForNull(getValues('CostOfCoverPerKg'))
        const noOfPartsPerCover = checkForNull(getValues('NoOfPartsPerCover'))
        
        const packingCost = (
            (totalCostOfCrate / (state.volumePerAnnum * amortizedNoOfYears)) + 
            ((weightOfCover * costOfCoverPerKg) / noOfPartsPerCover) + 
            costOfSpacerPackingInsert
        )
    
        // Update state
        setState(prevState => ({
            ...prevState,
            noOfCratesRequiredPerDay,
            totalCostOfCrate,
            totalCostOfSpacerPackingInsert: costOfSpacerPackingInsert,
            packingCost
        }))
    
        // Set form values
        setValue('NoOfCratesRequiredPerDay', checkForDecimalAndNull(noOfCratesRequiredPerDay, NoOfDecimalForInputOutput));
        setValue('TotalCostOfCrate', checkForDecimalAndNull(totalCostOfCrate, NoOfDecimalForPrice));
        setValue('TotalCostOfSpacerPackingInsert', checkForDecimalAndNull(costOfSpacerPackingInsert, NoOfDecimalForPrice));
        setValue('PackingCost', checkForDecimalAndNull(packingCost, NoOfDecimalForPrice));
    }
    const handleSpacerPackingInsertCost = (value) => {
        calculateSpacerPackingInsertRecoveryCost(value, getValues('NoOfSpacerPackingInsert'), getValues('SpacerPackingInsertRecovery'))
    }
    const handleNoOfSpacerPackingInsert = (value) => {
        calculateSpacerPackingInsertRecoveryCost(getValues('SpacerPackingInsertCost'), value, getValues('SpacerPackingInsertRecovery'))
    }
    const handleSpacerPackingInsertRecovery = (value) => {
        calculateSpacerPackingInsertRecoveryCost(getValues('SpacerPackingInsertCost'), getValues('NoOfSpacerPackingInsert'), value)
    }
    const calculateSpacerPackingInsertRecoveryCost = (spacerCost, noOfSpacerInsert, spacerRecovery) => {
        const recoveryCost = spacerCost * noOfSpacerInsert * (spacerRecovery / 100)
        setValue('SpacerPackingInsertRecoveryCostPerKg', checkForDecimalAndNull(recoveryCost, NoOfDecimalForPrice));
        setState((prevState) => ({ ...prevState, spacerPackingInsertRecoveryCostPerKg: recoveryCost }))
    }
    const onSubmit = debounce((value) => {
        setState((prevState) => ({ ...prevState, disableSubmit: true }))
        let formData = {
            "CostingPackagingCalculationDetailsId": rowObjData && Object.keys(rowObjData).length > 0?rowObjData?.CostingPackagingCalculationDetailsId:props?.costingPackagingCalculationDetailsId??null,
            "CostingPackagingDetailsId": rowObjData && Object.keys(rowObjData).length > 0?rowObjData?.PackagingDetailId:null,
            "BaseCostingId": costingData?.CostingId,
            "LoggedInUserId": loggedInUserId(),
            "NoOfComponentsPerCrate": value?.NoOfComponentsPerCrate,
            "VolumePerDay": state?.volumePerDay,
            "VolumePerAnnum": state?.volumePerAnnum,
            "NoOfCratesRequiredPerDay": state?.noOfCratesRequiredPerDay,
            "StockNormDays": value?.StockNormDays,
            "CostOfCrate": value?.CostOfCrate,
            "TotalCostOfCrate": state?.totalCostOfCrate,
            "AmortizedNoOfYears": value?.AmortizedNoOfYears,
            "WeightOfCoverPerKg": value?.WeightOfCover,
            "CostOfCoverPerKg": value?.CostOfCoverPerKg,
            "NoOfPartsPerCover": value?.NoOfPartsPerCover,
            "SpacerPackingInsertCostIfAny": value?.SpacerPackingInsertCost,
            "NoOfSpacersPackingInsert": value?.NoOfSpacerPackingInsert,
            "SpacersPackingInsertRecoveryPercentage": value?.SpacerPackingInsertRecovery,
            "SpacersPackingInsertRecoveryCostPerKg": state?.spacerPackingInsertRecoveryCostPerKg,
            "CostOfSpacersPackingInsert": state?.totalCostOfSpacerPackingInsert,
            "PackingCost": state?.packingCost
          }
        dispatch(savePackagingCalculation(formData, (res) => {
            if (res?.data?.Result) {
                setState((prevState) => ({ ...prevState, disableSubmit: false }))
                formData.CalculationId = res?.data?.Identity
                Toaster.success("Calculation saved successfully")
                props.closeCalculator(formData,state?.packingCost)
            }
        }))
    }, 500)
    const cancelHandler = () => {
        props.closeCalculator('',state?.packingCost)
    }
    return (
        <Drawer anchor={props.anchor} open={props.isOpen}
        // onClose={(e) => toggleDrawer(e)}
        >
            <Container>
                <div className={`drawer-wrapper layout-min-width-860px`}>
                    <Row className="drawer-heading">
                        <Col>
                            <div className={'header-wrapper left'}>
                                <h3>Packaging Calculator</h3>
                            </div>
                            <div
                                onClick={(e) => cancelHandler(e)}
                                className={'close-button right'}
                            ></div>
                        </Col>
                    </Row>
                    <Row>
                        <form onSubmit={handleSubmit(onSubmit)}>
                            <Row className="packaging-cost-calculator-warpper">
                                {packagingCalculatorFields.map(item => {
                                    const { tooltip, name, label } = item ?? {};
                                    return <Col md="3">
                                        {item.tooltip && <TooltipCustom 
                                            customClass={tooltip.customClass ?? ''}
                                            width={tooltip.width} 
                                            tooltipClass={tooltip.className ?? ''} 
                                            disabledIcon={tooltip?.disabledIcon??false} 
                                            id={item?.name} 
                                            tooltipText={!tooltip?.disabledIcon ? tooltip.text : `${item.label} = ${tooltip.text ?? ''}`} 
                                        />}
                                        <TextFieldHookForm
                                            label={label}
                                            id={tooltip?.disabledIcon ? item?.name : `nonTarget${item?.name}`}
                                            name={name}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={item.mandatory}
                                            rules={{
                                                required: item.mandatory,
                                                validate: { number, checkWhiteSpaces, maxLength7, ...(item.disabled ? {} : {}) },
                                                max: item.percentageLimit ? {
                                                    value: 100,
                                                    message: 'Percentage value should be equal to 100'
                                                } : {},
                                            }}
                                            handleChange={item.handleChange ? item.handleChange : () => { }}
                                            defaultValue={item.disabled ? 0 : ''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors[name]}
                                            disabled={item.disabled} />
                                    </Col>
                                })}
                            </Row>
                             <Row className={"sticky-footer pr-0"}>
                                <Col md="12" className={"text-right bluefooter-butn d-flex align-items-center justify-content-end"}>
                                    <Button
                                        id="packagingCalculator_cancel"
                                        className="mr-2"
                                        variant={"cancel-btn"}
                                        disabled={false}
                                        onClick={cancelHandler}
                                        icon={"cancel-icon"}
                                        buttonName={"Cancel"} />
                                    {!CostingViewMode &&<Button
                                        id="packagingCalculator_submit"
                                        type="submit"
                                        disabled={CostingViewMode || state?.disableSubmit}
                                        icon={"save-icon"}
                                        buttonName={"Save"} />}
                                </Col>
                            </Row>
                        </form>
                    </Row>

                </div>
            </Container>
        </Drawer>
    )
}
export default PackagingCalculator