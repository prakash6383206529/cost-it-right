import React, { Fragment, useEffect, useState } from 'react'
import { Row, Col, Table, Container, } from 'reactstrap'
import { Controller, useForm, useWatch } from 'react-hook-form'
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
import { checkForDecimalAndNull, checkForNull, loggedInUserId, number, checkWhiteSpaces, maxLength7, nonZero, maxLength200, maxPercentageValue } from '../../../../helper'
import { Drawer } from '@material-ui/core'
import TourWrapper from '../../../common/Tour/TourWrapper'
function OpenPackagingCalculator(props) {
    const { rmRowData, rmData, item } = props
    const [state, setState] = useState({
        tableData: [],
        totalGSM: 0,
        showPopup: false,
        RmContainer: []
    })
    const [calculationStates, setCalculationStates] = useState({
        VolumePerAnnum: 0,
        NoOfCratesTrolleysRequiredPerDay: 0,
        TotalCostOfCrateTrolley: 0,
        SpacerRecoveryCostPerKg: 0,
        CostOfSpacer: 0,
        PackingCost: 0,
    })
    const WeightCalculatorRequest = []
    const { NoOfDecimalForPrice, NoOfDecimalForInputOutput } = useSelector((state) => state.auth.initialConfiguration)
    const dispatch = useDispatch()

    const {
        register, handleSubmit, control, setValue, getValues, formState: { errors }, } = useForm({
            mode: 'onChange',
            reValidateMode: 'onChange',
        });

    const noOfCratesTrolleysFieldValues = useWatch({
        control: control, // Pass control here
        name: ['NoOfComponentsPerCrateTrolley', 'VolumePerDay'],
    });
    const totalCostOfCrateTrolleyFieldValues = useWatch({
        control: control, // Pass control here
        name: ['CostOfCrateTrolley', 'StockNormDays'],
    });
    const spacerRecoveryFieldValues = useWatch({
        control: control, // Pass control here
        name: ['SpacerCost', 'NoOfSpacers', 'SpacersRecoveryPercentage'],
    });
    const packingCostFieldValues = useWatch({
        control: control, // Pass control here
        name: ['TotalCostOfCrate', 'VolumePerAnnum', 'AmortizedNoOfYears', 'WeightOfCover', 'CostOfCoverPerGm', 'NoOfPartsPerCover'],
    });
    useEffect(() => {
        if (noOfCratesTrolleysFieldValues) {
            calculateVolumePerAnnum()
            calculateNoOfCrates()
        }
    }, [noOfCratesTrolleysFieldValues])

    useEffect(() => {
        if (totalCostOfCrateTrolleyFieldValues) {
            calculateTotalCostOfCrate()
        }
    }, [totalCostOfCrateTrolleyFieldValues])

    useEffect(() => {
        if (spacerRecoveryFieldValues) {
            calculateSpacerRecoveryCostPerKg()
        }
    }, [spacerRecoveryFieldValues])

    useEffect(() => {
        if (packingCostFieldValues) {
            calculatePackingCost()
        }
    }, [noOfCratesTrolleysFieldValues, packingCostFieldValues, calculationStates.CostOfSpacer,])


    // useEffect(() => {
    //     if (rmRowData && rmRowData?.WeightCalculatorRequest && rmRowData?.WeightCalculatorRequest?.CorrugatedAndMonoCartonBoxWeightCalculatorId) {
    //         const { WeightCalculatorRequest } = rmRowData
    //         boxDetailsInputFields.map((item) => {
    //             setValue(item.name, checkForDecimalAndNull(WeightCalculatorRequest[item.name], NoOfDecimalForPrice))
    //         })

    //         let tableDataTemp = []
    //         WeightCalculatorRequest?.CostingCorrugatedAndMonoCartonBoxAdditionalRawMaterial?.length !== 0 && WeightCalculatorRequest?.CostingCorrugatedAndMonoCartonBoxAdditionalRawMaterial?.map((item, index) => {
    //             setValue(`GSM${item.RawMaterialIdRef}${index}`, checkForDecimalAndNull(item.GSM, NoOfDecimalForPrice))
    //             setValue(`flutePercentage${item.RawMaterialIdRef}${index}`, checkForDecimalAndNull(item.FlutePercentage, NoOfDecimalForPrice))
    //             setValueTableForm(`fluteValue${item.RawMaterialIdRef}${index}`, checkForDecimalAndNull(item.FluteValue, NoOfDecimalForPrice))
    //             tableDataTemp.push({ label: item.RawMaterialNameAndGrade, value: item.RawMaterialIdRef, RawMaterialRate: item.RawMaterialRate })
    //         })
    //         setValue('NosOfPly', WeightCalculatorRequest.NosOfPly)
    //         setValue('TypeOfBox', WeightCalculatorRequest.TypeOfBox)
    //         setValueTableForm('RawMaterial', '')
    //         setState((prevState) => ({
    //             ...prevState, totalGSM: WeightCalculatorRequest.TotalGsmAndFluteValue, tableData: tableDataTemp, RmContainer: tableDataTemp
    //         }))
    //         setCalculationStates(prevState => ({
    //             ...prevState,
    //             SheetDeclePerInch: WeightCalculatorRequest.SheetDeclePerInch,
    //             SheetCutPerInch: WeightCalculatorRequest.SheetCutPerInch,
    //             Area: WeightCalculatorRequest.Area,
    //             Wastage: WeightCalculatorRequest.Wastage,
    //             TotalArea: WeightCalculatorRequest.TotalArea,
    //             Weight: WeightCalculatorRequest.Weight,
    //             BoardCost: WeightCalculatorRequest.BoardCost,
    //             RMCost: WeightCalculatorRequest.RMCost
    //         }));
    //     }
    //     if (!props.CostingViewMode) {
    //         setValue('NosOfPly', props?.rmData?.length)
    //     }
    // }, [])




    const boxDetailsInputFields = [
        { label: 'No. of components/crate', name: 'NoOfComponentsPerCrate', mandatory: true, disabled: props?.CostingViewMode ? props?.CostingViewMode : false },
        { label: 'Volume/day', name: 'VolumePerDay', mandatory: true, disabled: props?.CostingViewMode ? props?.CostingViewMode : false },
        { label: 'Volume/annum', name: 'VolumePerAnnum', mandatory: true, disabled: true, tooltip: { text: 'Volume/day * 25 * 12' } },
        { label: 'No. of crates required/day', name: 'NoOfCratesRequiredPerDay', mandatory: true, disabled: true, tooltip: { text: 'Volume/day / No. of components/crate' } },
        { label: 'Stock norm days', name: 'StockNormDays', mandatory: true, disabled: props?.CostingViewMode ? props?.CostingViewMode : false },
        { label: 'Cost of crate', name: 'CostOfCrate', mandatory: true, disabled: props?.CostingViewMode ? props?.CostingViewMode : false },
        { label: 'Total cost of crate', name: 'TotalCostOfCrate', disabled: true, tooltip: { text: 'Cost of crate * No. of crates required/day * Stock norm days' } },
        { label: 'Amortized no. of years', name: 'AmortizedNoOfYears', disabled: props?.CostingViewMode ? props?.CostingViewMode : false, },
        { label: 'Weight of cover (gm):', name: 'WeightOfCover', disabled: props?.CostingViewMode ? props?.CostingViewMode : false, },
        { label: 'Cost of cover/gm', name: 'CostOfCoverPerGm', mandatory: true, disabled: props?.CostingViewMode ? props?.CostingViewMode : false },
        { label: 'No. of parts/cover', name: 'NoOfPartsPerCover', disabled: props?.CostingViewMode ? props?.CostingViewMode : false, },
        { label: 'Spacer cost (if any)', name: 'SpacerCost', disabled: props?.CostingViewMode ? props?.CostingViewMode : false, },
        { label: 'No. of spacers', name: 'NoOfSpacers', disabled: props?.CostingViewMode ? props?.CostingViewMode : false, },
        { label: `Spacer recovery (%)`, name: 'SpacersRecoveryPercentage', disabled: props?.CostingViewMode ? props?.CostingViewMode : false },
        { label: 'Spacer recovery cost/kg', name: 'SpacerRecoveryCostPerKg', disabled: true, tooltip: { text: 'Spacer cost * No. of spacers * Spacers recovery percentage / 100', width: '250px' } },
        { label: 'Cost of Spacer', name: 'CostOfSpacer', disabled: true, tooltip: { text: 'Spacer cost * No. of spacers - Spacer recovery cost', width: '320px' } },
        { label: 'Packing Cost', name: 'PackingCost', disabled: true, tooltip: { text: 'Total cost of crate / (Volume/annum * Amortized no. of years) + (Weight of cover * Cost of cover/gm / No. of parts/cover) + Spacer recovery cost', width: '350px' } },
    ]
    const calculateVolumePerAnnum = () => {
        const VolumePerAnnum = (checkForNull(getValues('VolumePerDay')) * 25 * 12)
        setValue('VolumePerAnnum', checkForDecimalAndNull(VolumePerAnnum, NoOfDecimalForInputOutput))
        setCalculationStates((prevState) => ({ ...prevState, VolumePerAnnum: VolumePerAnnum }))
    }
    const calculateNoOfCrates = () => {
        const NoOfCratesRequiredPerDay = (checkForNull(getValues('VolumePerDay')) / checkForNull(getValues('NoOfComponentsPerCrate')))
        setValue('NoOfCratesRequiredPerDay', checkForDecimalAndNull(NoOfCratesRequiredPerDay, NoOfDecimalForInputOutput))
        setCalculationStates((prevState) => ({ ...prevState, NoOfCratesRequiredPerDay: NoOfCratesRequiredPerDay }))
    }
    const calculateTotalCostOfCrate = () => {
        const TotalCostOfCrate = (checkForNull(getValues('CostOfCrate')) * checkForNull(getValues('NoOfCratesRequiredPerDay')) * checkForNull(getValues('StockNormDays')))
        setValue('TotalCostOfCrate', checkForDecimalAndNull(TotalCostOfCrate, NoOfDecimalForInputOutput))
        setCalculationStates((prevState) => ({ ...prevState, TotalCostOfCrate: TotalCostOfCrate }))
    }
    const calculateSpacerRecoveryCostPerKg = () => {
        const spacerCost = checkForNull(getValues('SpacerCost'));
        const noOfSpacers = checkForNull(getValues('NoOfSpacers'));
        const spacersRecoveryPercentage = checkForNull(getValues('SpacersRecoveryPercentage'));

        const SpacerRecoveryCostPerKg = spacerCost * noOfSpacers * spacersRecoveryPercentage / 100;
        const CostOfSpacer = spacerCost * noOfSpacers - SpacerRecoveryCostPerKg;

        setValue('SpacerRecoveryCostPerKg', checkForDecimalAndNull(SpacerRecoveryCostPerKg, NoOfDecimalForPrice));
        setValue('CostOfSpacer', checkForDecimalAndNull(CostOfSpacer, NoOfDecimalForPrice));

        setCalculationStates(prevState => ({
            ...prevState,
            SpacerRecoveryCostPerKg,
            CostOfSpacer
        }));
    }

    const calculatePackingCost = () => {
        const getVal = (name) => checkForNull(getValues(name));
        const { VolumePerAnnum, CostOfSpacer } = calculationStates;

        const part1 = getVal('TotalCostOfCrate') / (VolumePerAnnum * getVal('AmortizedNoOfYears')) || 0;
        const part2 = (getVal('WeightOfCover') * getVal('CostOfCoverPerGm')) / getVal('NoOfPartsPerCover') || 0;
        const PackingCost = part1 + part2 + CostOfSpacer;

        setValue('PackingCost', checkForDecimalAndNull(PackingCost, NoOfDecimalForPrice));
        setCalculationStates((prevState) => ({ ...prevState, PackingCost }));
    }
    const onSubmit = (value) => {

        let formData = {
            "NoOfComponentsPerCrate": value.NoOfComponentsPerCrate,
            "VolumePerDay": value.VolumePerDay,
            "VolumePerAnnum": value.VolumePerAnnum,
            "NoOfCratesRequiredPerDay": value.NoOfCratesRequiredPerDay,
            "StockNormDays": value.StockNormDays,
            "CostOfCrate": value.CostOfCrate,
            "TotalCostOfCrate": value.TotalCostOfCrate,
            "AmortizedNoOfYears": value.AmortizedNoOfYears,
            "WeightOfCover": value.WeightOfCover,
            "CostOfCoverPerGm": value.CostOfCoverPerGm,
            "NoOfPartsPerCover": value.NoOfPartsPerCover,
            "SpacerCost": value.SpacerCost,
            "NoOfSpacers": value.NoOfSpacers,
            "SpacersRecoveryPercentage": value.SpacersRecoveryPercentage,
            "PackagingCost": value.PackingCost,
        }
        // dispatch(saveRawMaterialCalculationForMonoCartonCorrugatedBox(formData, (res) => {
        //     if (res?.data?.Result) {
        //         Toaster.success("Calculation saved successfully")
        props.toggleDrawer('', formData)
        //     }
        // }))
    }
    const cancelHandler = () => {
        props.toggleDrawer((rmRowData && rmRowData?.WeightCalculatorRequest && rmRowData?.WeightCalculatorRequest?.CorrugatedAndMonoCartonBoxWeightCalculatorId) ? 'CorrugatedAndMonoCartonBox' : '')
    }

    return (
        <Drawer anchor={props.anchor} open={props.isOpen}>
            <Container >
                <div className={"drawer-wrapper layout-width-800px"}>
                    <Fragment>
                        <Row className="drawer-heading">
                            <Col>
                                <div className={"header-wrapper left"}>
                                    <h3>
                                        {'Packaging Cost Calculator'}
                                    </h3>
                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col md="12">
                                <HeaderTitle
                                    title={'Packaging:'} />
                            </Col>
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
                                                    validate: { number, checkWhiteSpaces, maxLength7 },
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
                                    <Col md="12" className={"text-right d-flex align-items-center justify-content-end"}>
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

                    </Fragment >
                </div>
            </Container>
        </Drawer>
    )
}
export default OpenPackagingCalculator