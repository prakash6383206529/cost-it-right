import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId } from '../../../../../helper'
import LossStandardTable from '../LossStandardTable'
import { saveRawMaterialCalculationForDieCasting } from '../../../actions/CostWorking'
import Toaster from '../../../../common/Toaster'
import { debounce } from 'lodash'
import TooltipCustom from '../../../../common/Tooltip'
import { number, percentageLimitValidation, checkWhiteSpaces, decimalAndNumberValidation } from "../../../../../helper/validation";
import { useLabels } from '../../../../../helper/core'


function NonFerrous(props) {
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest
    const dispatch = useDispatch()

    const defaultValues = {
        shotWeight: WeightCalculatorRequest && WeightCalculatorRequest.ShotWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ShotWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        cavity: WeightCalculatorRequest && WeightCalculatorRequest.NumberOfCavity !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NumberOfCavity, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        burningPercent: WeightCalculatorRequest && WeightCalculatorRequest.BurningPercentage !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.BurningPercentage, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        burningValue: WeightCalculatorRequest && WeightCalculatorRequest.BurningValue !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.BurningValue, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        castingWeight: WeightCalculatorRequest && WeightCalculatorRequest.CastingWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.CastingWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        recovery: WeightCalculatorRequest && WeightCalculatorRequest.RecoveryPercentage !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RecoveryPercentage, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        machiningScrapWeight: WeightCalculatorRequest && WeightCalculatorRequest.MachiningScrapWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.MachiningScrapWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        grossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        finishedWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.FinishWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        scrapWeight: WeightCalculatorRequest && WeightCalculatorRequest.ScrapWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ScrapWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        rmCost: WeightCalculatorRequest && WeightCalculatorRequest.RMCost !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RMCost, getConfigurationKey().NoOfDecimalForPrice) : '',
        scrapCost: WeightCalculatorRequest && WeightCalculatorRequest.ScrapCost !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ScrapCost, getConfigurationKey().NoOfDecimalForPrice) : '',
        materialCost: WeightCalculatorRequest && WeightCalculatorRequest.RawMaterialCost !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RawMaterialCost, getConfigurationKey().NoOfDecimalForPrice) : '',
    }

    const [tableVal, setTableVal] = useState(WeightCalculatorRequest && WeightCalculatorRequest.LossOfTypeDetails !== null ? WeightCalculatorRequest.LossOfTypeDetails : [])
    const [lostWeight, setLostWeight] = useState(WeightCalculatorRequest && WeightCalculatorRequest.NetLossWeight ? WeightCalculatorRequest.NetLossWeight : 0)
    const [dataToSend, setDataToSend] = useState({})
    const [nonFerrousDropDown, setNonFerrousDropDown] = useState(false)
    const [isDisable, setIsDisable] = useState(false)
    const [reRender, setRerender] = useState(false)
    const { rmRowData, activeTab, isHpdc, CostingViewMode, item } = props
    const { finishedWeightLabel, finishWeightLabel } = useLabels()
    const { register, control, setValue, getValues, handleSubmit, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defaultValues,
    })

    const fieldValues = useWatch({
        control,
        name: ['shotWeight', 'burningPercent', 'cavity', 'finishedWeight', 'recovery', 'castingWeight'],
    })

    const tableData = (value = []) => {

        setTableVal(value)
    }
    const LossDropDown = () => {
        let dropDown = []


        if (activeTab === '1' || activeTab === '2') {

            dropDown = [

                {
                    label: 'Melting Loss',
                    value: 9,
                },
                {
                    label: 'Fetling Loss',
                    value: 10,
                },
                {
                    label: 'Grinding Loss',
                    value: 11,
                },
                {
                    label: 'Rejection Allowance',
                    value: 12,
                },
            ]

        }
        else {
            dropDown = [
                {
                    label: 'Processing Allowance',
                    value: 13,
                },
                {
                    label: 'Machining Loss',
                    value: 14,
                },
                {
                    label: 'Rejection Allowance',
                    value: 12,
                },
            ]

        }
        setNonFerrousDropDown(dropDown)

    }
    useEffect(() => {
        if (!CostingViewMode) {
            burningValue()
            handlGrossWeight()
            calculateRemainingCalculation(lostWeight)
        }
    }, [fieldValues])
    useEffect(() => {
        if (Number(getValues('finishedWeight')) < Number(getValues('castingWeight'))) {
            delete errors.finishedWeight
            setRerender(!reRender)
        }
    }, [getValues('castingWeight'), lostWeight])
    const handlGrossWeight = () => {
        const grossWeight = checkForNull(Number(getValues('castingWeight'))) + checkForNull(dataToSend?.burningValue) + lostWeight
        const updatedValue = dataToSend
        updatedValue.grossWeight = grossWeight
        setDataToSend(updatedValue)
        setValue('grossWeight', checkForDecimalAndNull(grossWeight, getConfigurationKey().NoOfDecimalForInputOutput))

    }

    const calculateRemainingCalculation = (lostSum = 0) => {
        let scrapWeight = 0
        const castingWeight = Number(getValues("castingWeight"))
        const grossWeight = checkForNull(Number(getValues('castingWeight'))) + checkForNull(dataToSend?.burningValue) + lostSum
        const finishedWeight = checkForNull(Number(getValues('finishedWeight')))

        if (finishedWeight !== 0) {

            scrapWeight = checkForNull(castingWeight) - checkForNull(finishedWeight) //FINAL Casting Weight - FINISHED WEIGHT
            setValue('scrapWeight', checkForDecimalAndNull(scrapWeight, getConfigurationKey().NoOfDecimalForInputOutput))

        }

        const recovery = checkForNull(Number(getValues('recovery')) / 100)
        const rmCost = checkForNull(grossWeight) * checkForNull(rmRowData.RMRate) //FINAL GROSS WEIGHT - RMRATE
        const scrapCost = checkForNull(checkForNull(scrapWeight) * checkForNull(rmRowData.ScrapRate) * recovery)
        const materialCost = checkForNull(rmCost) - checkForNull(scrapCost)
        const updatedValue = dataToSend
        updatedValue.totalGrossWeight = grossWeight
        updatedValue.scrapWeight = scrapWeight
        updatedValue.rmCost = rmCost
        updatedValue.scrapCost = scrapCost
        updatedValue.materialCost = materialCost
        setDataToSend(updatedValue)
        setValue('grossWeight', checkForDecimalAndNull(grossWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('scrapWeight', checkForDecimalAndNull(scrapWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('rmCost', checkForDecimalAndNull(rmCost, getConfigurationKey().NoOfDecimalForPrice))
        setValue('scrapCost', checkForDecimalAndNull(scrapCost, getConfigurationKey().NoOfDecimalForPrice))
        setValue('materialCost', checkForDecimalAndNull(materialCost, getConfigurationKey().NoOfDecimalForPrice))
        setLostWeight(lostSum)
    }

    const burningValue = () => {
        const shotWeight = getValues('shotWeight')
        const burningPercent = getValues('burningPercent')
        const cavity = getValues('cavity')
        const burningValue = (checkForNull(shotWeight) / checkForNull(cavity)) * (checkForNull(burningPercent) / 100)

        const updatedValue = dataToSend
        updatedValue.burningValue = burningValue
        setDataToSend(updatedValue)
        setValue('burningValue', checkForDecimalAndNull(burningValue, getConfigurationKey().NoOfDecimalForInputOutput))
    }

    const onSubmit = debounce(handleSubmit((values) => {
        setIsDisable(true)
        let obj = {}
        obj.LayoutType = activeTab === '1' ? 'GDC' : activeTab === '2' ? 'LPDC' : 'HPDC'
        obj.DieCastingWeightCalculatorId = WeightCalculatorRequest && WeightCalculatorRequest.DieCastingWeightCalculatorId ? WeightCalculatorRequest.DieCastingWeightCalculatorId : "0"
        obj.BaseCostingIdRef = item.CostingId
        obj.RawMaterialIdRef = rmRowData.RawMaterialId
        obj.CostingRawMaterialDetailsIdRef = rmRowData.RawMaterialDetailId
        obj.ShotWeight = getValues('shotWeight')
        obj.NumberOfCavity = getValues('cavity')
        obj.BurningPercentage = getValues('burningPercent')
        obj.BurningValue = dataToSend.burningValue
        obj.MachiningScrapWeight = getValues('machiningScrapWeight')
        obj.CastingWeight = getValues('castingWeight')
        obj.RecoveryPercentage = getValues('recovery')
        obj.GrossWeight = dataToSend.totalGrossWeight
        obj.FinishWeight = getValues('finishedWeight')
        obj.ScrapWeight = dataToSend.scrapWeight
        obj.RMCost = dataToSend.rmCost
        obj.ScrapCost = dataToSend.scrapCost
        obj.RawMaterialCost = dataToSend.materialCost
        obj.LoggedInUserId = loggedInUserId()
        let tempArr = []
        tableVal && tableVal.map(item => (
            tempArr.push({ LossOfType: item.LossOfType, LossPercentage: item.LossPercentage, LossWeight: item.LossWeight, CostingCalculationDetailId: "0" })
        ))
        obj.LossOfTypeDetails = tempArr
        obj.NetLossWeight = lostWeight

        dispatch(saveRawMaterialCalculationForDieCasting(obj, res => {
            setIsDisable(false)
            if (res.data.Result) {
                obj.WeightCalculationId = res.data.Identity
                Toaster.success("Calculation saved successfully")
                props.toggleDrawer('', obj)
            }
        }))

    }), 500)


    const onCancel = () => {
        props.toggleDrawer('')
    }

    const handleKeyDown = function (e) {
        if (e.key === 'Enter' && e.shiftKey === false) {
            e.preventDefault();
        }
    };

    return (
        <Fragment>
            <Row>

                <form noValidate className="form"
                    onKeyDown={(e) => { handleKeyDown(e, onSubmit.bind(this)); }}>
                    <Col md="12">
                        <div className="costing-border px-4">
                            <Row>
                                <Col md="12" className={'mt25'}>
                                    <div className="header-title">
                                        <h5>{'Input Weight Calculator:'}</h5>
                                    </div>
                                </Col>
                            </Row>

                            <Row className={''}>
                                {isHpdc &&
                                    <>
                                        <Col md="3" >
                                            <TextFieldHookForm
                                                label={`Shot Weight(Kg)`}
                                                name={'shotWeight'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: false,
                                                    validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.shotWeight}
                                                disabled={props.isEditFlag ? false : true}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <TextFieldHookForm
                                                label={`No. of Cavity`}
                                                name={'cavity'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: false,
                                                    validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.cavity}
                                                disabled={props.isEditFlag ? false : true}
                                            />
                                        </Col>
                                        <Col md="3" >
                                            <TextFieldHookForm
                                                label={`Burning (%)`}
                                                name={'burningPercent'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: false,
                                                    validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                                    max: {
                                                        value: 100,
                                                        message: 'Percentage cannot be greater than 100'
                                                    },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.burningPercent}
                                                disabled={props.isEditFlag ? false : true}
                                            />
                                        </Col>
                                        <Col md="3">
                                            <TooltipCustom disabledIcon={true} id={'buring-nonferrous'} tooltipText={"Burning Value = (Shot Weight / No. of Cavity) * (Burning Percentage / 100)"} />
                                            <TextFieldHookForm
                                                label={`Burning Value`}
                                                name={'burningValue'}
                                                Controller={Controller}
                                                control={control}
                                                id={'buring-nonferrous'}
                                                register={register}
                                                mandatory={false}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.burningValue}
                                                disabled={true}
                                            />
                                        </Col>
                                    </>}

                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Casting Weight${activeTab === '3' ? ` (before machining)` : `(kg)`}`}
                                        name={'castingWeight'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder text-nowrap'}
                                        errors={errors.castingWeight}
                                        disabled={props.isEditFlag ? false : true}
                                    />
                                </Col>


                            </Row>

                            <LossStandardTable
                                dropDownMenu={nonFerrousDropDown}
                                CostingViewMode={props.CostingViewMode}
                                calculation={calculateRemainingCalculation}
                                weightValue={Number(getValues('castingWeight'))}
                                netWeight={WeightCalculatorRequest && WeightCalculatorRequest.NetLossWeight !== null ? WeightCalculatorRequest.NetLossWeight : ''}
                                sendTable={WeightCalculatorRequest && WeightCalculatorRequest.LossOfTypeDetails !== null ? WeightCalculatorRequest.LossOfTypeDetails : []}
                                tableValue={tableData}
                                isLossStandard={false}
                                LossDropDown={LossDropDown}
                                isPlastic={false}
                                isNonFerrous={true}
                                isFerrous={false}
                                NonFerrousErrors={errors}
                            />

                            <Row className={'mt25'}>
                                <Col md="3" >
                                    <TooltipCustom disabledIcon={true} id={'gross-weight-nonferrous'} tooltipText={`Gross Weight = (Casting Weight ${isHpdc ? '+ Burning Value' : ''} + Net Loss Weight)`} />
                                    <TextFieldHookForm
                                        label={`Gross Weight(Kg)`}
                                        name={'grossWeight'}
                                        id={'gross-weight-nonferrous'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.grossWeight}
                                        disabled={true}
                                    />
                                </Col>
                                <Col md="3" >
                                    <TextFieldHookForm
                                        label={`${finishedWeightLabel} Weight(Kg)`}
                                        name={'finishedWeight'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                                            max: {
                                                value: getValues('castingWeight'),
                                                message: `${finishWeightLabel} weight should not be greater than casting weight.`
                                            },

                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.finishedWeight}
                                        disabled={props.isEditFlag ? false : true}
                                    />
                                </Col>

                                <Col md="3">
                                    <TooltipCustom disabledIcon={true} id={'scrap-weight-nonferrous'} tooltipText={`Scrap Weight = (Casting Weight - ${finishedWeightLabel} Weight)`} />
                                    <TextFieldHookForm
                                        label={`Scrap Weight(Kg)`}
                                        name={'scrapWeight'}
                                        id={'scrap-weight-nonferrous'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={WeightCalculatorRequest &&
                                            WeightCalculatorRequest.ScrapWeight !== undefined
                                            ? WeightCalculatorRequest.ScrapWeight
                                            : ''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.scrapWeight}
                                        disabled={true}
                                    />
                                </Col>
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Scrap Recovery (%)`}
                                        name={'recovery'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                            max: {
                                                value: 100,
                                                message: 'Percentage cannot be greater than 100'
                                            },
                                        }}
                                        handleChange={() => { }}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.recovery}
                                        disabled={props.isEditFlag ? false : true}
                                    />
                                </Col>
                            </Row>

                            <Row className={''}>
                                {isHpdc &&
                                    <>
                                        <Col md="3">
                                            <TooltipCustom disabledIcon={true} id={'-rm-cost-non-ferrous'} tooltipText={'RM Cost = (Gross Weight * RM Rate)'} />
                                            <TextFieldHookForm
                                                label={`RM Cost`}
                                                name={'rmCost'}
                                                id={'-rm-cost-non-ferrous'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.rmCost}
                                                disabled={true}
                                            />
                                        </Col>
                                    </>}
                                <Col md="3">
                                    <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'scrap-cost-nonferrous'} tooltipText={'Scrap Cost = (Scrap Weight * Scrap Recovery Percentage * Scrap Rate / 100)'} />
                                    <TextFieldHookForm
                                        label={`Scrap Cost`}
                                        name={'scrapCost'}
                                        Controller={Controller}
                                        id={'scrap-cost-nonferrous'}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.scrapCost}
                                        disabled={true}
                                    />
                                </Col>

                                <Col md="3">
                                    <TooltipCustom disabledIcon={true} id={'net-rm-nonferrous'} tooltipText={'Net RM Cost = (Gross Weight * RM Rate - Scrap Cost)'} />
                                    <TextFieldHookForm
                                        // Confirm this name from tanmay sir
                                        label={`Net RM Cost`}
                                        name={'materialCost'}
                                        Controller={Controller}
                                        id={'net-rm-nonferrous'}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.materialCost}
                                        disabled={true}
                                    />
                                </Col>
                            </Row>

                        </div>
                    </Col>
                    <div className="mt25 col-md-12 text-right">
                        <button
                            onClick={onCancel} // Need to change this cancel functionality
                            type="submit"
                            value="CANCEL"
                            className="reset mr15 cancel-btn"
                        >
                            <div className={'cancel-icon'}></div>
                            CANCEL
                        </button>
                        <button
                            type="button"
                            onClick={onSubmit}
                            disabled={props.CostingViewMode || isDisable ? true : false}
                            className="submit-button save-btn"
                        >
                            <div className={'save-icon'}>
                            </div>
                            {'SAVE'}
                        </button>
                    </div>
                </form>

            </Row>
        </Fragment>
    );
}

export default NonFerrous;