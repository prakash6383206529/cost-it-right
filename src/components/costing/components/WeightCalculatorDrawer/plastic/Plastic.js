import React, { useState, useContext, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import { useDispatch, useSelector } from 'react-redux'
import { NumberFieldHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs'
import { setPlasticArray } from '../../../actions/Costing'
import { CORRUGATEDBOX } from '../../../../../config/masterData'
import TooltipCustom from '../../../../common/Tooltip'
import { nonZero, number, checkWhiteSpaces, decimalAndNumberValidation, percentageLimitValidation,disableNegativeNumber } from '../../../../../helper/validation'
import { debounce } from 'lodash'
import { calculatePercentageValue, calculateScrapWeight, checkForDecimalAndNull, checkForNull, findLostWeight, getConfigurationKey, loggedInUserId } from '../../../../../helper'
import Toaster from '../../../../common/Toaster'
import { saveRawMaterialCalculationForPlastic } from '../../../actions/CostWorking'
import LossStandardTable from '../LossStandardTable'
import { useLabels } from '../../../../../helper/core'

function Plastic(props) {
    const { item, rmRowData, isSummary, CostingViewMode, DisableMasterBatchCheckbox, activeTab } = props
    const { finishedWeightLabel, finishWeightLabel } = useLabels()
    const isShowBurningAllowance = !!getConfigurationKey()?.IsShowBurningAllowanceForPlasticRMCalculatorInCosting

    let totalRM
    if (!isSummary) {
        // if (!props.fromPackaging) {
        const { IsApplyMasterBatch = false, MasterBatchTotal = 0, MasterBatchPercentage = 0 } = item?.CostingPartDetails ?? {}

        //IF MASTER BATCH IS ADDED OUTSIDE THE CALCULATOR THEN RM RATE WILL BE SUM OF RMRATE AND MASTERBATCH RATE (AFTER PERCENTAGE)
        if (!props.fromPackaging && IsApplyMasterBatch) {
            const RMRate = calculatePercentageValue(rmRowData.RMRate, (100 - MasterBatchPercentage));
            const RMRatePlusMasterBatchRate = RMRate + checkForNull(MasterBatchTotal)
            totalRM = RMRatePlusMasterBatchRate
        } else {
            totalRM = Number(rmRowData.RMRate)
        }
        // }
    } else {
        totalRM = Number(rmRowData.RMRate)
    }
    const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest
    const { IsShowFinishedWeightInPlasticTechCostingCalculator } = getConfigurationKey()
    const LocalizedGrossWeight = !IsShowFinishedWeightInPlasticTechCostingCalculator ? 'Net Weight' : 'Gross Weight'
    const localizedGrossWeightValue = !IsShowFinishedWeightInPlasticTechCostingCalculator ? WeightCalculatorRequest && WeightCalculatorRequest?.FinishWeight!== undefined ? checkForDecimalAndNull(WeightCalculatorRequest?.FinishWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '' : WeightCalculatorRequest && WeightCalculatorRequest?.NetWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest?.NetWeight, getConfigurationKey().NoOfDecimalForInputOutput) : ''
    const LocalizedInputWeight = !IsShowFinishedWeightInPlasticTechCostingCalculator ? 'Gross Weight' : 'Input Weight'
    const localizedInputWeightValue = !IsShowFinishedWeightInPlasticTechCostingCalculator ? WeightCalculatorRequest && WeightCalculatorRequest?.GrossWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest?.GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '' : WeightCalculatorRequest && WeightCalculatorRequest?.NetWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest?.NetWeight, getConfigurationKey().NoOfDecimalForInputOutput) : ''

        
    const costData = useContext(costingInfoContext)
    const dispatch = useDispatch()
    const { getPlasticData } = useSelector(state => state.costing)
    const defaultValues = {
        netWeight: localizedGrossWeightValue,
        runnerWeight: WeightCalculatorRequest && WeightCalculatorRequest?.RunnerWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest?.RunnerWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        grossWeight: localizedInputWeightValue,
        finishedWeight: WeightCalculatorRequest && WeightCalculatorRequest?.FinishWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest?.FinishWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        scrapWeight: WeightCalculatorRequest && WeightCalculatorRequest?.ScrapWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest?.ScrapWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        scrapRecoveryPercent: WeightCalculatorRequest && WeightCalculatorRequest?.RecoveryPercentage !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest?.RecoveryPercentage, localStorage.NoOfDecimalForInputOutput) : '',
        rmCost: WeightCalculatorRequest && WeightCalculatorRequest?.RMCost !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest?.RMCost, getConfigurationKey().NoOfDecimalForPrice) : '',
        scrapCost: WeightCalculatorRequest && WeightCalculatorRequest?.ScrapCost !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest?.ScrapCost, getConfigurationKey().NoOfDecimalForPrice) : '',
        materialCost: WeightCalculatorRequest && WeightCalculatorRequest?.RawMaterialCost !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest?.RawMaterialCost, getConfigurationKey().NoOfDecimalForPrice) : '',
        burningAllownace: WeightCalculatorRequest && WeightCalculatorRequest?.BurningValue !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest?.BurningValue * checkForNull(totalRM), getConfigurationKey().NoOfDecimalForInputOutput) : '',
        scrapReusePercent: WeightCalculatorRequest && WeightCalculatorRequest?.ScrapReUsePercentage !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest?.ScrapReUsePercentage, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        reUseInputWeight: WeightCalculatorRequest && WeightCalculatorRequest?.ScrapReUseInputWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest?.ScrapReUseInputWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
        inputWeightWithReuse: WeightCalculatorRequest && WeightCalculatorRequest?.NetInputWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest?.NetInputWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
    }

    const [tableVal, setTableVal] = useState(WeightCalculatorRequest && WeightCalculatorRequest?.LossOfTypeDetails !== null ? WeightCalculatorRequest?.LossOfTypeDetails : [])
    const [lostWeight, setLostWeight] = useState(WeightCalculatorRequest && WeightCalculatorRequest?.NetLossWeight ? WeightCalculatorRequest?.NetLossWeight : 0)
    const [dataToSend, setDataToSend] = useState({
        finishedWeight: WeightCalculatorRequest && WeightCalculatorRequest?.FinishWeight !== undefined ? WeightCalculatorRequest?.FinishWeight : '',
        scrapWeight: WeightCalculatorRequest && WeightCalculatorRequest?.ScrapWeight !== undefined ? WeightCalculatorRequest?.ScrapWeight : '',
        rmCost: WeightCalculatorRequest && WeightCalculatorRequest?.RMCost !== undefined ? WeightCalculatorRequest?.RMCost : '',
        scrapCost: WeightCalculatorRequest && WeightCalculatorRequest?.ScrapCost !== undefined ? WeightCalculatorRequest?.ScrapCost : '',
        materialCost: WeightCalculatorRequest && WeightCalculatorRequest?.RawMaterialCost !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest?.RawMaterialCost, getConfigurationKey().NoOfDecimalForPrice) : '',
        burningValue: WeightCalculatorRequest && WeightCalculatorRequest?.BurningValue !== undefined ? WeightCalculatorRequest?.BurningValue : '',
        grossWeight: localizedInputWeightValue,
        reUseInputWeight: WeightCalculatorRequest && WeightCalculatorRequest?.ScrapReUseInputWeight !== undefined ? WeightCalculatorRequest?.ScrapReUseInputWeight : '',
        inputWeightWithReuse: WeightCalculatorRequest && WeightCalculatorRequest?.NetInputWeight !== undefined ? WeightCalculatorRequest?.NetInputWeight : '',
    })
    const [isDisable, setIsDisable] = useState(false)
    const [reRender, setRerender] = useState(false)
    const [excludeRunnerWeight, setExcludeRunnerWeight] = useState(WeightCalculatorRequest && WeightCalculatorRequest?.IsExcludeRunnerWeight !== undefined ? WeightCalculatorRequest?.IsExcludeRunnerWeight : false)
    const [isScrapReuse, setIsScrapReuse] = useState(WeightCalculatorRequest && WeightCalculatorRequest?.IsScrapReUse !== undefined ? WeightCalculatorRequest?.IsScrapReUse : false)

    const { register, control, setValue, getValues, handleSubmit, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defaultValues,
    })

    const fieldValues = useWatch({
        control,
        name: ['netWeight', 'runnerWeight', 'finishedWeight', 'scrapRecoveryPercent', 'scrapReusePercent'],
    })

    const dropDown = [
        {
            label: 'Processing Loss',
            value: 1,
        },
        {
            label: 'Burning Loss',
            value: 2
        },
        {
            label: `Burning Loss (${LocalizedGrossWeight} + Runner Weight)`,
            value: 3
        }
    ]

    useEffect(() => {
        if (!CostingViewMode) {
            calculateGrossWeight()
            calculateRemainingCalculation(lostWeight)
        }
    }, [fieldValues, excludeRunnerWeight, isScrapReuse])

    useEffect(() => {
        if (!CostingViewMode) {
            calculateGrossWeight()
            calculateRemainingCalculation()
        }
    }, [getPlasticData])

    useEffect(() => {
        setValue('grossWeight', localizedInputWeightValue)
        setValue('scrapRecoveryPercent', WeightCalculatorRequest && WeightCalculatorRequest?.RecoveryPercentage !== undefined ? WeightCalculatorRequest?.RecoveryPercentage : '')
    }, [])
    useEffect(() => {
        if(excludeRunnerWeight){
            setValue('scrapRecoveryPercent', 0)
            setValue('scrapWeight', 0)
        }
    }, [excludeRunnerWeight])
    useEffect(() => {
        if(!IsShowFinishedWeightInPlasticTechCostingCalculator){
            if (Number(getValues('grossWeight')) < Number(localizedInputWeightValue)) {
                delete errors.finishedWeight
                setRerender(!reRender)
            }
        }
        else{
            if (Number(getValues('finishedWeight')) < Number(dataToSend.grossWeight)) {
                delete errors.finishedWeight
                setRerender(!reRender)
            }
        }
    }, [dataToSend.grossWeight, localizedInputWeightValue])

    /**
     * @method calculateGrossWeight
     * @description For Calculating gross weight
     */
    const calculateGrossWeight = () => {

        const netWeight = Number(getValues('netWeight'))
        const runnerWeight = Number(getValues('runnerWeight'))
        let grossWeight = 0

        if(!excludeRunnerWeight){
            grossWeight = checkForNull(netWeight) + checkForNull(runnerWeight) + Number(findLostWeight(getPlasticData && getPlasticData.length > 0 ? getPlasticData : WeightCalculatorRequest?.LossOfTypeDetails ? WeightCalculatorRequest?.LossOfTypeDetails : [], true))
            setValue('grossWeight', checkForDecimalAndNull(grossWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        }else{
            grossWeight = checkForNull(netWeight) + Number(findLostWeight(getPlasticData && getPlasticData.length > 0 ? getPlasticData : WeightCalculatorRequest?.LossOfTypeDetails ? WeightCalculatorRequest?.LossOfTypeDetails : [], true))
            setValue('grossWeight', checkForDecimalAndNull(grossWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        }
        let updatedValue = dataToSend
        updatedValue.grossWeight = grossWeight
        setDataToSend(updatedValue)
    }
    /**
     * @method calculateRemainingCalculation
     * @description Calculating finished weight,scrap weight,RM cost, scrap cost,material cost
     */
    const calculateRemainingCalculation = (lostSum = 0) => {
        let scrapWeight = 0
        let rmCost = 0
        const netWeight = checkForNull(getValues('netWeight')) // THIS IS FIRST GROSS WEIGHT
        const runnerWeight = checkForNull(getValues('runnerWeight'))
        const scrapRecoveryPercent = Number((getValues('scrapRecoveryPercent')))
        const scrapReusePercent = Number((getValues('scrapReusePercent')))
        let reUseInputWeight = 0
        let inputWeightWithReuse = 0
        let grossWeight = 0 

        const finishedWeight = !IsShowFinishedWeightInPlasticTechCostingCalculator ? checkForNull(getValues('netWeight')) : checkForNull(getValues('finishedWeight'))
        if(!excludeRunnerWeight){
            grossWeight = checkForNull(netWeight) + checkForNull(runnerWeight) + Number(findLostWeight(getPlasticData && getPlasticData.length > 0 ? getPlasticData : WeightCalculatorRequest?.LossOfTypeDetails ? WeightCalculatorRequest?.LossOfTypeDetails : [], true)) //THIS IS FINAL GROSS WEIGHT -> FIRST GROSS WEIGHT + RUNNER WEIGHT +NET LOSS WEIGHT
        }else{
            grossWeight = checkForNull(netWeight) + Number(findLostWeight(getPlasticData && getPlasticData.length > 0 ? getPlasticData : WeightCalculatorRequest?.LossOfTypeDetails ? WeightCalculatorRequest?.LossOfTypeDetails : [], true)) //THIS IS FINAL GROSS WEIGHT -> FIRST GROSS WEIGHT + RUNNER WEIGHT +NET LOSS WEIGHT
        }
        if (finishedWeight !== 0) {
            if (isScrapReuse) {
                scrapWeight = (runnerWeight - ((checkForNull(netWeight) + checkForNull(runnerWeight)) * scrapReusePercent / 100)) * scrapRecoveryPercent / 100
            } else {
                scrapWeight = checkForNull(grossWeight - finishedWeight - dataToSend.burningValue) * checkForNull(scrapRecoveryPercent / 100)
            }
            setValue('scrapWeight', checkForDecimalAndNull(scrapWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        }
        if (isScrapReuse) {
            reUseInputWeight = (checkForNull(netWeight) + checkForNull(runnerWeight)) * checkForNull(scrapReusePercent) / 100
            inputWeightWithReuse = checkForNull(grossWeight) + checkForNull(reUseInputWeight)
            setValue('reUseInputWeight', checkForDecimalAndNull(reUseInputWeight, getConfigurationKey().NoOfDecimalForInputOutput))
            setValue('inputWeightWithReuse', checkForDecimalAndNull(inputWeightWithReuse, getConfigurationKey().NoOfDecimalForInputOutput))
        }
            if (isScrapReuse) {
                rmCost = (checkForNull(inputWeightWithReuse) * checkForNull(totalRM)) + (isShowBurningAllowance ? getValues('burningAllownace') : 0)
            } else {
                rmCost = (checkForNull(grossWeight) * checkForNull(totalRM)) + (isShowBurningAllowance ? getValues('burningAllownace') : 0)
            }
        
        const scrapCost = checkForNull(scrapWeight) * checkForNull(rmRowData.ScrapRate)
        const materialCost = checkForNull(rmCost) - checkForNull(scrapCost)


        const updatedValue = dataToSend
        updatedValue.scrapWeight = scrapWeight
        updatedValue.totalGrossWeight = grossWeight
        updatedValue.rmCost = rmCost
        updatedValue.scrapCost = scrapCost
        updatedValue.materialCost = materialCost
        updatedValue.reUseInputWeight = reUseInputWeight
        updatedValue.inputWeightWithReuse = inputWeightWithReuse
        setDataToSend(updatedValue)
        setValue('grossWeight', checkForDecimalAndNull(grossWeight, getConfigurationKey().NoOfDecimalForInputOutput)) // SETING FINAL GROSS WEIGHT VALUE
        setValue('scrapWeight', checkForDecimalAndNull(scrapWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue('rmCost', checkForDecimalAndNull(rmCost, getConfigurationKey().NoOfDecimalForPrice))
        setValue('scrapCost', checkForDecimalAndNull(scrapCost, getConfigurationKey().NoOfDecimalForPrice))
        setValue('materialCost', checkForDecimalAndNull(materialCost, getConfigurationKey().NoOfDecimalForPrice))
        setLostWeight(lostSum)

    }
    /**
       * @method cancel
       * @description used to Reset form
       */
    const cancel = () => {
        props.toggleDrawer('')
    }
    const onSubmit = debounce(handleSubmit((values) => {
        !props?.fromPackaging && DisableMasterBatchCheckbox(!item?.CostingPartDetails?.IsApplyMasterBatch ? true : false)
        setIsDisable(true)
        let obj = {}

        obj.PlasticWeightCalculatorId = WeightCalculatorRequest && WeightCalculatorRequest?.PlasticWeightCalculatorId ? WeightCalculatorRequest?.PlasticWeightCalculatorId : "0"
        obj.BaseCostingIdRef = item.CostingId
        obj.TechnologyId = costData.TechnologyId
        obj.RawMaterialIdRef = rmRowData.RawMaterialId
        obj.CostingRawMaterialDetailsIdRef = rmRowData.RawMaterialDetailId
        obj.RawMaterialCost = dataToSend.materialCost
        obj.NetRMCost = dataToSend.NetRMCost
        obj.NetWeight = dataToSend.grossWeight
        obj.RunnerWeight = getValues('runnerWeight')
        obj.GrossWeight = values?.grossWeight
        obj.FinishWeight =!IsShowFinishedWeightInPlasticTechCostingCalculator ? getValues('netWeight') : getValues('finishedWeight')
        obj.RecoveryPercentage = getValues('scrapRecoveryPercent')
        obj.ScrapWeight = dataToSend.scrapWeight
        obj.RMCost = dataToSend.rmCost
        obj.ScrapCost = dataToSend.scrapCost
        obj.BurningValue = dataToSend.burningValue
        obj.LoggedInUserId = loggedInUserId()
        obj.LayoutType = activeTab === '1' ? 'Injection Molding' : 'Blow Molding'
        obj.CalculatorType = "Plastic"
        obj.IsExcludeRunnerWeight = excludeRunnerWeight
        obj.IsScrapReUse = isScrapReuse
        obj.ScrapReUsePercentage = getValues('scrapReusePercent')
        obj.ScrapReUseInputWeight = dataToSend.reUseInputWeight
        obj.NetInputWeight = dataToSend.inputWeightWithReuse

        let tempArr = []
        tableVal && tableVal.map(item => (
            tempArr.push({ LossOfType: item.LossOfType, LossPercentage: item.LossPercentage, LossWeight: item.LossWeight, CostingCalculationDetailId: "0" })
        ))
        obj.LossOfTypeDetails = tempArr
        obj.NetLossWeight = lostWeight

        dispatch(saveRawMaterialCalculationForPlastic(obj, res => {
            setIsDisable(false)
            if (res.data.Result) {
                obj.WeightCalculationId = res.data.Identity
                if (Number(costData.TechnologyId) === Number(CORRUGATEDBOX)) {
                    obj.CalculatorType = 'CorrugatedBox'
                }
                Toaster.success("Calculation saved successfully")
                dispatch(setPlasticArray([]))
                props.toggleDrawer('', obj)
            }
        }))
    }), 500);

    const tableData = (value = []) => {
        setTableVal(value)
    }

    const setBurningAllowance = (value) => {
        const burningAllownace = value * checkForNull(totalRM)
        setValue('burningAllownace', checkForDecimalAndNull(burningAllownace, getConfigurationKey().NoOfDecimalForInputOutput))
        const updatedValue = dataToSend
        updatedValue.burningValue = value
        setDataToSend(updatedValue)
    }

    const handleKeyDown = function (e) {
        if (e.key === 'Enter' && e.shiftKey === false) {
            e.preventDefault();
        }
    };
    const onPressExcludeRunnerWeight = () => {
        setExcludeRunnerWeight(!excludeRunnerWeight)
    }
    const onPressScrapReuse = () => {
        setIsScrapReuse(!isScrapReuse)
    }

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
                                        <h5>{`${LocalizedGrossWeight} Calculator:`}</h5>
                                    </div>
                                </Col>
                            </Row>

                            <Row className={''}>
                           
                                <Col md="3" >
                                    <NumberFieldHookForm
                                        label={`${LocalizedGrossWeight} (Kg)`}
                                        name={'netWeight'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={true}
                                        rules={{
                                            required: true,
                                            validate: { nonZero, number, decimalAndNumberValidation }
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.netWeight}
                                        disabled={props.CostingViewMode ? props.CostingViewMode : (tableVal?.length > 0 ? true : false)}
                                    />

                                </Col>
                                <Col md="3">
                                    <NumberFieldHookForm
                                        label={`Runner Weight`}
                                        name={'runnerWeight'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            validate: { number, decimalAndNumberValidation }
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.runnerWeight}
                                        disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                    />
                                </Col>

                            </Row>

                            <LossStandardTable
                                dropDownMenu={dropDown}
                                calculation={calculateRemainingCalculation}
                                weightValue={Number(getValues('netWeight'))}
                                runnerWeight={Number(getValues('runnerWeight'))}
                                sendTable={WeightCalculatorRequest && WeightCalculatorRequest?.LossOfTypeDetails !== null ? WeightCalculatorRequest?.LossOfTypeDetails : []}
                                netWeight={WeightCalculatorRequest && WeightCalculatorRequest?.NetLossWeight !== null ? WeightCalculatorRequest?.NetLossWeight : ''}
                                tableValue={tableData}
                                CostingViewMode={props.CostingViewMode ? props.CostingViewMode : false}
                                burningLoss={setBurningAllowance}
                                burningValue={WeightCalculatorRequest && WeightCalculatorRequest?.BurningValue !== null ? WeightCalculatorRequest?.BurningValue : ''}
                                isPlastic={true}
                                isLossStandard={false}
                                isNonFerrous={false}
                            />

                            <Row className={'mt25'}>
                            {String(activeTab) === '1' && <Col md="3">
                                    <div className="mt-3">
                                        <span className="d-inline-block mt15">
                                            <label
                                                className={`custom-checkbox mb-0`}
                                                onChange={onPressExcludeRunnerWeight}
                                            >
                                                Exclude Runner Weight from Gross Weight
                                                <input
                                                    type="checkbox"
                                                    checked={excludeRunnerWeight}
                                                    disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                                />
                                                <span
                                                    className=" before-box"
                                                    checked={excludeRunnerWeight}
                                                    onChange={onPressExcludeRunnerWeight}
                                                />
                                            </label>
                                        </span>
                                    </div>
                                </Col>}
                                <Col md="3" >
                                    <TooltipCustom disabledIcon={true} tooltipClass='weight-of-sheet' id={'gross-weight-plastic'} tooltipText={`${LocalizedInputWeight} = (${LocalizedGrossWeight} ${!excludeRunnerWeight ? ' + Runner Weight' : ''} +${isShowBurningAllowance ? " Other" : " Net"} Loss Weight)`} />
                                    <TextFieldHookForm
                                        label={`${LocalizedInputWeight} (Kg)`}
                                        name={'grossWeight'}
                                        id={'gross-weight-plastic'}
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
                                {(String(activeTab) === '2' && !props?.fromPackaging )&& <Col md="3">
                                    <div className="mt-3">
                                        <span className="d-inline-block mt15">
                                            <label
                                                className={`custom-checkbox mb-0`}
                                                onChange={onPressScrapReuse}
                                            >
                                                Scrap Reuse
                                                <input
                                                    type="checkbox"
                                                    checked={isScrapReuse}
                                                    disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                                />
                                                <span
                                                    className=" before-box"
                                                    checked={isScrapReuse}
                                                    onChange={onPressScrapReuse}
                                                />
                                            </label>
                                        </span>
                                    </div>
                                </Col>}
                                {isScrapReuse && <>
                                    <Col md="3">
                                        <TextFieldHookForm
                                            label={`Scrap Re-use (%)`}
                                            name={'scrapReusePercent'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            rules={{
                                                required: false,
                                                validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                                max: {
                                                    value: 100,
                                                    message: 'Percentage cannot be greater than 100'
                                                },
                                            }}
                                            mandatory={false}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.scrapReusePercent}
                                            disabled={props.CostingViewMode ? true : false}
                                        />
                                    </Col>
                                    <Col md="3" >
                                        <TooltipCustom disabledIcon={true} tooltipClass='weight-of-sheet' id={'re-use-input-weight-plastic'} tooltipText={`Re-use ${LocalizedInputWeight} = ((${LocalizedGrossWeight} + Runner Weight) * Scrap Re-use (%)/100)`} />
                                        <TextFieldHookForm
                                            label={`Re-use ${LocalizedInputWeight}`}
                                            name={'reUseInputWeight'}
                                            id={'re-use-input-weight-plastic'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.reUseInputWeight}
                                            disabled={true}
                                        />
                                    </Col>
                                    <Col md="3" >
                                        <TooltipCustom disabledIcon={true} tooltipClass='weight-of-sheet' id={'input-weight-with-reuse-plastic'} tooltipText={`${LocalizedInputWeight} (with Re-use) = (${LocalizedInputWeight} + Re-use ${LocalizedInputWeight})`} />
                                        <TextFieldHookForm
                                            label={`${LocalizedInputWeight} (with Re-use)(Kg)`}
                                            name={'inputWeightWithReuse'}
                                            id={'input-weight-with-reuse-plastic'}
                                            Controller={Controller}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.inputWeightWithReuse}
                                            disabled={true}
                                        />
                                    </Col>
                                </>}
                             {  IsShowFinishedWeightInPlasticTechCostingCalculator && <Col md="3" >
                                    <NumberFieldHookForm
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
                                                value: getValues('grossWeight'),
                                                message: `${finishWeightLabel} weight should not be greater than ${LocalizedGrossWeight}.`
                                            },
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.finishedWeight}
                                        disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                    />
                                </Col>}
                                <Col md="3">
                                    <TextFieldHookForm
                                        label={`Scrap Recovery (%)`}
                                        name={'scrapRecoveryPercent'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        rules={{
                                            required: false,
                                            validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                            max: {
                                                value: 100,
                                                message: 'Percentage cannot be greater than 100'
                                            },
                                        }}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.scrapRecoveryPercent}
                                        disabled={props.CostingViewMode || excludeRunnerWeight ? true : false}
                                    />
                                </Col>
                                <Col md="3">
                                    <TooltipCustom disabledIcon={true} id={'scrap-weight-plastic'} tooltipText={`${isScrapReuse ? `Scrap Weight = (Runner Weight - ((${LocalizedInputWeight} + Runner Weight ) * Scrap Re-use (%)/100))* Scrap Recovery (%)/100` : `Scrap Weight = (${LocalizedInputWeight} - ${LocalizedGrossWeight} - ${isShowBurningAllowance ? 'Burning Allowance' : 'Burning Loss'}) * Scrap Recovery (%)/100`}`} />
                                    <TextFieldHookForm
                                        label={`Scrap Weight(Kg)`}
                                        name={'scrapWeight'}
                                        Controller={Controller}
                                        control={control}
                                        id={'scrap-weight-plastic'}
                                        register={register}
                                        mandatory={false}
                                        handleChange={() => { }}
                                        rules={{
                                            required: false,
                                            validate: { disableNegativeNumber },
                                        }}
                                        defaultValue={WeightCalculatorRequest &&
                                            WeightCalculatorRequest?.ScrapWeight !== undefined
                                            ? WeightCalculatorRequest?.ScrapWeight
                                            : ''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.scrapWeight}
                                        disabled={true}
                                    />
                                </Col>
                                {!!getConfigurationKey()?.IsShowBurningAllowanceForPlasticRMCalculatorInCosting &&
                                    <Col md="3">
                                        <TooltipCustom disabledIcon={true} id={'burning-allowance'} tooltipText={'Burning Allowance = (RM Rate * Burning Loss Weight)'} />
                                        <TextFieldHookForm
                                            label={`Burning Allowance`}
                                            name={'burningAllownace'}
                                            Controller={Controller}
                                            id={'burning-allowance'}
                                            control={control}
                                            register={register}
                                            mandatory={false}
                                            handleChange={() => { }}
                                            defaultValue={''}
                                            className=""
                                            customClassName={'withBorder'}
                                            errors={errors.burningAllownace}
                                            disabled={true}
                                        />
                                    </Col>
                                }
                               
                                <Col md="3">
                                    <TooltipCustom disabledIcon={true} id={'rm-cost-plactic'} tooltipText={`RM Cost = (${isScrapReuse ? `I${LocalizedInputWeight} (with Re-use)` : LocalizedInputWeight} * RM Rate) ${isShowBurningAllowance ? " + Burning Allowance" : " + Burning Loss"}`} />
                                    <TextFieldHookForm
                                        label={`RM Cost`}
                                        name={'rmCost'}
                                        Controller={Controller}
                                        id={'rm-cost-plactic'}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            validate: { disableNegativeNumber },
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.rmCost}
                                        disabled={true}
                                    />
                                </Col>

                                <Col md="3">
                                    <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'scrap-cost-plastic'} tooltipText={'Scrap Cost = (Scrap Rate * Scrap Weight)'} />
                                    <TextFieldHookForm
                                        label={`Scrap Cost`}
                                        name={'scrapCost'}
                                        Controller={Controller}
                                        control={control}
                                        register={register}
                                        id={'scrap-cost-plastic'}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            validate: { disableNegativeNumber },
                                        }}
                                        handleChange={() => { }}
                                        defaultValue={''}
                                        className=""
                                        customClassName={'withBorder'}
                                        errors={errors.scrapCost}
                                        disabled={true}
                                    />
                                </Col>

                                <Col md="3">
                                    <TooltipCustom disabledIcon={true} id={'net-rm-cost-plastic'} tooltipText={'Net RM Cost = (RM Cost - Scrap Cost)'} />
                                    <TextFieldHookForm
                                        // Confirm this name from tanmay sir
                                        label={`Net RM Cost`}
                                        name={'materialCost'}
                                        Controller={Controller}
                                        id={'net-rm-cost-plastic'}
                                        control={control}
                                        register={register}
                                        mandatory={false}
                                        rules={{
                                            required: false,
                                            validate: { disableNegativeNumber },
                                        }}
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

                    {!CostingViewMode && <div className="col-sm-12 text-right mt-4">
                        <button
                            type={'button'}
                            className="reset mr15 cancel-btn"
                            onClick={cancel} >
                            <div className={'cancel-icon'}></div> {'Cancel'}
                        </button>
                        <button
                            type="button"
                            onClick={onSubmit}
                            disabled={props.CostingViewMode || isDisable ? true : false}
                            className="submit-button save-btn">
                            <div className={'save-icon'}></div>
                            {'Save'}
                        </button>
                    </div>}
                </form>

            </Row>
        </Fragment>
    )
}

export default Plastic
