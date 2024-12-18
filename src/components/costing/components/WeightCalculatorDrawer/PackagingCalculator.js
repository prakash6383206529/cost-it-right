import React, { Fragment, useEffect, useState } from 'react'
import { Row, Col, Table, Container, } from 'reactstrap'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { number, checkWhiteSpaces, maxLength7, checkForNull, checkForDecimalAndNull, loggedInUserId, percentageLimitValidation, maxLength200, nonZero, maxPercentageValue } from '../../../../helper'
import { useDispatch, useSelector } from 'react-redux'
import { debounce } from 'lodash'
import HeaderTitle from '../../../common/HeaderTitle'
import NoContentFound from '../../../common/NoContentFound'
import PopupMsgWrapper from '../../../common/PopupMsgWrapper'
import Toaster from '../../../common/Toaster'
import TooltipCustom from '../../../common/Tooltip'
import Button from '../../../layout/Button'
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../layout/HookFormInputs'
import { saveRawMaterialCalculationForMonoCartonCorrugatedBox } from '../../actions/CostWorking'
import { EMPTY_DATA } from '../../../../config/constants'
import { Drawer } from '@material-ui/core'
import { useLabels } from '../../../../helper/core'
import { useTranslation } from 'react-i18next'
function PackagingCalculator(props) {

    const { rmRowData, rmData, item } = props
    const [state, setState] = useState({
        tableData: [],
        totalGSM: 0,
        showPopup: false,
        RmContainer: []
    })
    const [calculationState, setCalculationState] = useState({
        SheetDeclePerInch: 0,
        SheetCutPerInch: 0,
        Area: 0,
        Wastage: 0,
        TotalArea: 0,
        Weight: 0,
        BoardCost: 0,
        TotalRMSheetCost: 0,
        RMCost: 0
    })
    const WeightCalculatorRequest = props?.rmRowData?.WeightCalculatorRequest
    const { NoOfDecimalForPrice, NoOfDecimalForInputOutput } = useSelector((state) => state.auth.initialConfiguration)
    const dispatch = useDispatch()
    const {
        register,
        handleSubmit,
        control,
        setValue,
        getValues,
        formState: { errors},
    } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    });

    const { t } = useTranslation('CostingLabels');
    const calclulationFieldValues = useWatch({
        control: control, // Pass controlCalculatorForm here
        name: ['VolumePerDay', 'WeightOfCover', 'CostOfCoverPerKg','AmortizedNoOfYears', 'NoOfPartsPerCover', 'SpacerPackingInsertCost', 'NoOfSpacerPackingInsert', 'SpacerPackingInsertRecovery'],
    });
 
    useEffect(() => {
        if (!props?.CostingViewMode) {
            calculateAllValues()
        }
    }, [calclulationFieldValues])

 
    const boxDetailsInputFields = [
        { label: t('noOfComponentsPerCrate',{defaultValue: 'No of components per crate/trolley'}), name: 'NoOfComponentsPerCrate', mandatory: true, searchable: false, disabled: props?.CostingViewMode ? props?.CostingViewMode : false },
        { label: t('volumePerDay',{defaultValue: 'Volume per day'}), name: 'VolumePerDay', mandatory: true, disabled: props?.CostingViewMode ? props?.CostingViewMode : false  },
        { label: t('volumePerAnnum',{defaultValue: 'Volume per annum'}), name: 'VolumePerAnnum', mandatory: false, disabled: true ,tooltip: { text: `${t('volumePerDay',{defaultValue: 'Volume per day'})} * 25 * 12`, width: '250px' }},
        { label: t('noOfCratesRequiredPerDay',{defaultValue: 'No of crates/trolley required per day'}), name: 'NoOfCratesRequiredPerDay', mandatory: false, disabled: true ,tooltip: { text: `${t('volumePerDay',{defaultValue: 'Volume per day'})} / ${t('noOfComponentsPerCrate',{defaultValue: 'No of components per crate/trolley'})}`, width: '250px' }},
        { label: t('stockNormDays',{defaultValue: 'Stock Norm days'}), name: 'StockNormDays', mandatory: true, disabled: props?.CostingViewMode ? props?.CostingViewMode : false },
        { label: t('costOfCrate',{defaultValue: 'Cost of crate/trolley'}), name: 'CostOfCrate', mandatory: true, disabled: props?.CostingViewMode ? props?.CostingViewMode : false },
        { label: t('totalCostOfCrate',{defaultValue: 'Total cost of crate/trolley'}), name: 'TotalCostOfCrate', mandatory: false,disabled: true ,tooltip: { text: `${t('noOfCratesRequiredPerDay',{defaultValue: 'No of crates/trolley required per day'})} * ${t('stockNormDays',{defaultValue: 'Stock Norm days'})} * ${t('costOfCrate',{defaultValue: 'Cost of crate/trolley'})}`, width: '250px' }},
        { label: t('amortizedNoOfYears',{defaultValue: 'Amortized no. of years'}), name: 'AmortizedNoOfYears', mandatory: true ,disabled: props?.CostingViewMode ? props?.CostingViewMode : false },
        { label: t('weightOfCover',{defaultValue: 'Weight of cover (kg)'}), name: 'WeightOfCover', mandatory: true,disabled: props?.CostingViewMode ? props?.CostingViewMode : false },
        { label: t('costOfCoverPerKg',{defaultValue: 'Cost of cover per kg'}), name: 'CostOfCoverPerKg', mandatory: true,disabled: props?.CostingViewMode ? props?.CostingViewMode : false},
        { label: t('noOfPartsPerCover',{defaultValue: 'No. of parts per cover'}), name: 'NoOfPartsPerCover', mandatory: true,disabled: props?.CostingViewMode ? props?.CostingViewMode : false },
        { label: t('spacerPackingInsertCost',{defaultValue: 'Spacer/packing/insert cost if any'}), name: 'SpacerPackingInsertCost', mandatory: true,disabled: props?.CostingViewMode ? props?.CostingViewMode : false },
        { label: t('noOfSpacerPackingInsert',{defaultValue: 'No. of spacer/packing/insert'}), name: 'NoOfSpacerPackingInsert', mandatory: true,disabled: props?.CostingViewMode ? props?.CostingViewMode : false },
        { label: t('spacerPackingInsertRecovery',{defaultValue: 'Spacer/packing/insert recovery %'}), name: 'SpacerPackingInsertRecovery', mandatory: true, percentageLimit: true, disabled: props?.CostingViewMode ? props?.CostingViewMode : false },
        { label: t('spacerPackingInsertRecoveryCostPerKg',{defaultValue: 'Spacer/packing/insert recovery cost per kg'}), name: 'SpacerPackingInsertRecoveryCostPerKg', mandatory: false,disabled: true,tooltip: { text: `${t('spacerPackingInsertCost',{defaultValue: 'Spacer/packing/insert cost if any'})} * ${t('noOfSpacerPackingInsert',{defaultValue: 'No. of spacer/packing/insert'})} * (${t('spacerPackingInsertRecovery',{defaultValue: 'Spacer/packing/insert recovery %'})} / 100)`, width: '250px' }},
        { label: t('costOfSpacerPackingInsert',{defaultValue: 'Cost of spacer/packing/insert'}), name: 'TotalCostOfSpacerPackingInsert', mandatory: false,disabled: true ,tooltip: { text: `${t('spacerPackingInsertCost',{defaultValue: 'Spacer/packing/insert cost if any'})} * ${t('noOfSpacerPackingInsert',{defaultValue: 'No. of spacer/packing/insert'})} - ${t('spacerPackingInsertRecoveryCostPerKg',{defaultValue: 'Spacer/packing/insert recovery cost per kg'})}`, width: '250px' }},
        { label: t('packingCost',{defaultValue: 'Packing Cost'}), name: 'PackingCost', mandatory: false,disabled: true , tooltip: { 
            text: `(${t('totalCostOfCrate',{defaultValue: 'Total cost of crate/trolley'})} / (${t('volumePerAnnum',{defaultValue: 'Volume per annum'})} * ${t('amortizedNoOfYears',{defaultValue: 'Amortized no. of years'})})) + 
            ((${t('weightOfCover',{defaultValue: 'Weight of cover (kg)'})} * ${t('costOfCoverPerKg',{defaultValue: 'Cost of cover per kg'})}) / ${t('noOfPartsPerCover',{defaultValue: 'No. of parts per cover'})}) + 
            ${t('costOfSpacerPackingInsert',{defaultValue: 'Cost of spacer/packing/insert'})}`,
            width: '250px' 
        }}
    ]
    const calculateAllValues = () => {
        const volumePerDay = checkForNull(getValues('VolumePerDay'))
        const volumePerAnnum = volumePerDay*25*12
        setValue('VolumePerAnnum', checkForDecimalAndNull(volumePerAnnum, NoOfDecimalForInputOutput))
        const noOfComponentsPerCrate = checkForNull(getValues('NoOfComponentsPerCrate'))
        const noOfCratesRequiredPerDay = volumePerDay/noOfComponentsPerCrate
        setValue('NoOfCratesRequiredPerDay', checkForDecimalAndNull(noOfCratesRequiredPerDay, NoOfDecimalForInputOutput))
        const stockNormDays = checkForNull(getValues('StockNormDays'))
        const costOfCrate = checkForNull(getValues('CostOfCrate'))
        const totalCostOfCrate = noOfCratesRequiredPerDay*stockNormDays*costOfCrate
        setValue('TotalCostOfCrate', checkForDecimalAndNull(totalCostOfCrate, NoOfDecimalForInputOutput))
        const amortizedNoOfYears = checkForNull(getValues('AmortizedNoOfYears'))
        const weightOfCover = checkForNull(getValues('WeightOfCover'))
        const costOfCoverPerKg = checkForNull(getValues('CostOfCoverPerKg'))
        const noOfPartsPerCover = checkForNull(getValues('NoOfPartsPerCover'))
        const spacerPackingInsertCost = checkForNull(getValues('SpacerPackingInsertCost'));
        const noOfSpacerPackingInsert = checkForNull(getValues('NoOfSpacerPackingInsert'));
        const spacerPackingInsertRecovery = checkForNull(getValues('SpacerPackingInsertRecovery'));
        // Avoid unnecessary programmatic re-renders
        const recoveryCost = spacerPackingInsertCost * noOfSpacerPackingInsert * (spacerPackingInsertRecovery/100);
        const roundedRecoveryCost = checkForDecimalAndNull(recoveryCost, NoOfDecimalForInputOutput);
        if (getValues('SpacerPackingInsertRecoveryCostPerKg') !== roundedRecoveryCost) {
            setValue('SpacerPackingInsertRecoveryCostPerKg',roundedRecoveryCost);
        }
        const costOfSpacerPackingInsert = ((spacerPackingInsertCost*noOfSpacerPackingInsert)-roundedRecoveryCost)
        setValue('TotalCostOfSpacerPackingInsert', checkForDecimalAndNull(costOfSpacerPackingInsert, NoOfDecimalForInputOutput))
        const packingCost = ((totalCostOfCrate/(volumePerAnnum*amortizedNoOfYears))+((weightOfCover*costOfCoverPerKg)/noOfPartsPerCover)+costOfSpacerPackingInsert)
        setValue('PackingCost', checkForDecimalAndNull(packingCost, NoOfDecimalForInputOutput))
    }
    const onSubmit = (value) => {
       
        const RMgsmAndFluteValue = [];
        state.tableData !== 0 && state.tableData.map((item, index) => {
            RMgsmAndFluteValue.push({
                "CorrugatedAndMonoCartonBoxAdditionalDetailId": 0,
                "CostingRawMaterialCorrugatedAndMonoCartonBoxCalculationDetailIdRef": 0,
                "RawMaterialIdRef": item?.value,
                "LayerNo": index + 1,
                "GSM": getValues(`GSM${item?.value}${index}`) ?? 0,
                "FlutePercentage": getValues(`flutePercentage${item?.value}${index}`) ?? 0,
                "FluteValue": getValues(`fluteValue${item?.value}${index}`) ?? 0
            })
            return null;
        })
        let formData = {
            "CorrugatedAndMonoCartonBoxWeightCalculatorId": 0,
            "BaseCostingIdRef": item?.CostingId,
            "CostingRawMaterialDetailsIdRef": rmRowData?.RawMaterialDetailId,
            "LoggedInUserId": loggedInUserId(),
            "NosOfPly": value.NosOfPly,
            "NoOfUps": value.NoOfUps,
            "TypeOfBox": value.TypeOfBox,
            "BoxLength": value.BoxLength,
            "BoxWidth": value.BoxWidth,
            "BoxHeight": value.BoxHeight,
            "SheetDecle": value.SheetDecle,
            "SheetCut": value.SheetCut,
            "SheetDeclePerInch": calculationState.SheetDeclePerInch,
            "SheetCutPerInch": calculationState.SheetCutPerInch,
            "Area": calculationState.Area,
            "WastagePercentage": value.WastagePercentage,
            "Wastage": calculationState.Wastage,
            "TotalArea": calculationState.TotalArea,
            "Weight": calculationState.Weight,
            "BoardCost": calculationState.BoardCost,
            "RMCost": calculationState.RMCost,
            "TotalRMSheetCost": calculationState.TotalRMSheetCost,
            "TotalGsmAndFluteValue": state.totalGSM,
            "CostingCorrugatedAndMonoCartonBoxAdditionalRawMaterial": RMgsmAndFluteValue
        }
        dispatch(saveRawMaterialCalculationForMonoCartonCorrugatedBox(formData, (res) => {
            if (res?.data?.Result) {
                formData.WeightCalculationId = res.data?.Identity
                formData.CalculatorType = 'CorrugatedAndMonoCartonBox'
                formData.RawMaterialCost = calculationState.RMCost
                Toaster.success("Calculation saved successfully")
                props.toggleDrawer('', formData)
            }
        }))
    }
    const cancelHandler = () => {
        props.toggleDrawer()
    }
 
    const closePopUp = () => {
        setState((prevState) => ({ ...prevState, showPopup: false }))
    }
   
    return (
        <Drawer anchor={props.anchor} open={props.isOpen}
        // onClose={(e) => toggleDrawer(e)}
        >
             <Container>
             <div className={`drawer-wrapper layout-min-width-720px`}>
            <Row className="drawer-heading">
                <Col>
                    <div className={'header-wrapper left'}>
                        <h3>Packaging Calculator</h3>
                    </div>
                </Col>
            </Row>
            <Row>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Row>
                        {boxDetailsInputFields.map(item => {
                            const { tooltip, name, label } = item ?? {};
                            return <Col md="3">
                                {item.tooltip && <TooltipCustom width={tooltip.width} tooltipClass={tooltip.className ?? ''} disabledIcon={true} id={item.name} tooltipText={`${item.label} = ${tooltip.text ?? ''}`} />}
                                <TextFieldHookForm
                                    label={label}
                                    id={name}
                                    name={name}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={item.mandatory}
                                    rules={{
                                        required: item.mandatory,
                                        validate: { number, checkWhiteSpaces, maxLength7, ...(item.disabled ? {} : {  }) },
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
                    {!props.CostingViewMode && <Row className={"sticky-footer"}>
                        <Col md="12" className={"text-right bluefooter-butn d-flex align-items-center justify-content-end"}>
                            <Button
                                id="paperCorrugatedBox_cancel"
                                className="mr-2"
                                variant={"cancel-btn"}
                                disabled={false}
                                onClick={cancelHandler}
                                icon={"cancel-icon"}
                                buttonName={"Cancel"} />
                            <Button
                                id="paperCorrugatedBox_submit"
                                type="submit"
                                disabled={props.CostingViewMode}
                                icon={"save-icon"}
                                buttonName={"Save"} />
                        </Col>
                    </Row>}
                </form>
            </Row>
          
            </div>
        </Container>
        </Drawer>
    )
}
export default PackagingCalculator