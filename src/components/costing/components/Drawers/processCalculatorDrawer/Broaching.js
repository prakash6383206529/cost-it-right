import React, { Fragment, useState, useEffect, useContext } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { NumberFieldHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs'
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId, } from '../../../../../helper'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import { saveMachiningProcessCostCalculationData } from '../../../actions/CostWorking'
import Toaster from '../../../../common/Toaster'
import { debounce } from 'lodash'
import { findProcessCost } from '../../../CostingUtil'
import TooltipCustom from '../../../../common/Tooltip'
import { number, percentageLimitValidation, checkWhiteSpaces } from "../../../../../helper/validation";

function Broaching(props) {
    
    const WeightCalculatorRequest = props?.calculatorData?.WeightCalculatorRequest
    
    const processMHRWithOutInterestAndDepreciation = props?.calculatorData?.MHRWithOutInterestAndDepreciation
    const costData = useContext(costingInfoContext);
    const dispatch = useDispatch()
    const [dataToSend, setDataToSend] = useState({ ...WeightCalculatorRequest?.TotalCycleTimeSec ?? '',
        partsPerHour: WeightCalculatorRequest?.PartPerHour ?? '',
        processCost: WeightCalculatorRequest?.NetProcessCost ?? ''
    }) 
    
       const [isDisable, setIsDisable] = useState(false)
    const [netProcessCostWithOutInterestAndDepreciation, setNetProcessCostWithoutInterestAndDepreciation] = useState(1)
    const [totalMachiningTime, setTotalMachiningTime] = useState(WeightCalculatorRequest && WeightCalculatorRequest.TotalMachiningTime !== undefined ? WeightCalculatorRequest.TotalMachiningTime : '')
    const defaultValues = {
        noOFTeeth: WeightCalculatorRequest?.NoOFTeeth ?? '',
        module: WeightCalculatorRequest?.Module ?? '',
        majorDiameter: WeightCalculatorRequest?.MajorDiameter ?? '',
        minorDiameter: WeightCalculatorRequest?.MinorDiameter ?? '',
        cuttingLength: WeightCalculatorRequest?.CuttingLength ?? '',
        cuttingResistance: WeightCalculatorRequest?.CuttingResistance ?? '',
        stepForwardThinning: WeightCalculatorRequest?.StepForwardThinning ?? '',
        broachingForceInTon: WeightCalculatorRequest?.BroachingForceInTon ?? '',
        toolLength: WeightCalculatorRequest?.ToolLength ?? '',
        cuttingSpeedForward: WeightCalculatorRequest?.CuttingSpeedForward ?? '',
        cuttingSpeedReturn: WeightCalculatorRequest?.CuttingSpeedReturn ?? '',
        cuttingTimeMins: WeightCalculatorRequest?.CuttingTimeMins ?? '',
        chipToChipTiming: WeightCalculatorRequest?.ChipToChipTiming ?? '',
        totalNonCuttingTime: WeightCalculatorRequest?.TotalNonCuttingTime ?? '',
        indexingTablePositioningTime: WeightCalculatorRequest?.IndexingTablePositioningTime ?? '',
        loadingAndUnloadingTime: WeightCalculatorRequest?.LoadingAndUnloadingTime ?? '',
        totalCycleTimeMins: WeightCalculatorRequest?.TotalCycleTimeMins ?? '',
        TotalCycleTimeSec: WeightCalculatorRequest?.TotalCycleTimeSec ?? '',
        efficiencyPercentage: WeightCalculatorRequest?.EfficiencyPercentage ?? '',
        partsPerHour: WeightCalculatorRequest?.PartPerHour ?? '',
        processCost: WeightCalculatorRequest?.NetProcessCost ?? '',
    }
    const { register, handleSubmit, control, setValue, getValues, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
        defaultValues: defaultValues,
    })
    const fieldValues = useWatch({
        control,
        name: ['noOFTeeth', 'module', 'cuttingLength', 'cuttingResistance', 'stepForwardThinning', 'toolLength', 'cuttingSpeedForward', 'cuttingSpeedReturn', 'chipToChipTiming', 'totalNonCuttingTime', 'indexingTablePositioningTime', 'loadingAndUnloadingTime', 'efficiencyPercentage', 'doc', 'cuttingSpeed', 'toothFeed', 'clampingPercentage', 'toothNo'],
    })

    useEffect(() => {
        setBroachingForce()
        setCuttingTime()
        setTotalCycleTimeMins()   //totalCycleTimeMins
    }, [fieldValues])

    useEffect(() => {
        setTotalCycleTimeMins()
    }, [dataToSend.CuttingTimeMins])

    const { calculateMachineTime } = props

    const setBroachingForce = () => {
        const cuttingResistance = Number(getValues('cuttingResistance'))
        const cuttingLength = Number(getValues('cuttingLength'))
        const module = Number(getValues('module'))
        const noOFTeeth = Number(getValues('noOFTeeth'))
        const stepForwardThinning = Number(getValues('stepForwardThinning'))
        const broachingForce = checkForNull(cuttingResistance) * (checkForNull(cuttingLength) / checkForNull(module)).toFixed(0) * (checkForNull(noOFTeeth) * checkForNull(module) * checkForNull(stepForwardThinning)) / 1000;
        setDataToSend(prevState => ({ ...prevState, broachingForce: broachingForce }))
        setValue('broachingForceInTon', checkForDecimalAndNull(broachingForce, getConfigurationKey().NoOfDecimalForInputOutput))
    }

    const setCuttingTime = () => {
        const toolLength = Number(getValues('toolLength'))
        const cuttingSpeedForward = Number(getValues('cuttingSpeedForward'))
        const cuttingSpeedReturn = Number(getValues('cuttingSpeedReturn'))
        const CuttingTimeMins = (checkForNull(toolLength) / checkForNull(cuttingSpeedForward) / 1000) + (checkForNull(toolLength) / checkForNull(cuttingSpeedReturn) / 1000);
        setDataToSend(prevState => ({ ...prevState, CuttingTimeMins: CuttingTimeMins }))
        setValue('cuttingTimeMins', checkForDecimalAndNull(CuttingTimeMins, getConfigurationKey().NoOfDecimalForInputOutput))
    }

    const setTotalCycleTimeMins = () => {
        const chipToChipTiming = Number(getValues('chipToChipTiming'))
        const totalNonCuttingTime = Number(getValues('totalNonCuttingTime'))
        const indexingTablePositioningTime = Number(getValues('indexingTablePositioningTime'))
        const loadingAndUnloadingTime = Number(getValues('loadingAndUnloadingTime'))
        const totalCycleTimeMins = (checkForNull(dataToSend.CuttingTimeMins) + checkForNull(chipToChipTiming) + checkForNull(totalNonCuttingTime) + checkForNull(indexingTablePositioningTime) + checkForNull(loadingAndUnloadingTime))
        setDataToSend(prevState => ({ ...prevState, totalCycleTimeMins: totalCycleTimeMins }))
        setValue('totalCycleTimeMins', checkForDecimalAndNull(totalCycleTimeMins, getConfigurationKey().NoOfDecimalForInputOutput))
        const TotalCycleTimeSec = (totalCycleTimeMins * 60)
        setDataToSend(prevState => ({ ...prevState, TotalCycleTimeSec: TotalCycleTimeSec }))
        setValue('TotalCycleTimeSec', checkForDecimalAndNull(TotalCycleTimeSec, getConfigurationKey().NoOfDecimalForInputOutput))

        // SETPARTSPERHOUR FUNCTION CODE WRITTEN HERE BELOW
        const efficiencyPercentage = Number(getValues('efficiencyPercentage'))
        const partsPerHour = (3600 / checkForNull(TotalCycleTimeSec)) * (checkForNull(efficiencyPercentage) / 100)
        setDataToSend(prevState => ({ ...prevState, partsPerHour: partsPerHour }))
        setValue('partsPerHour', checkForDecimalAndNull(partsPerHour, getConfigurationKey().NoOfDecimalForInputOutput))
        // const processCost = (props?.calculatorData?.MHR) / checkForNull(partsPerHour)
        const { processCost, processCostWithoutInterestAndDepreciation } = findProcessCost(props?.calculatorData?.UOM, props?.calculatorData?.MHR, partsPerHour, processMHRWithOutInterestAndDepreciation)
        setNetProcessCostWithoutInterestAndDepreciation(processCostWithoutInterestAndDepreciation)
        setDataToSend(prevState => ({ ...prevState, processCost: processCost, netProcessMHRWithOutInterestAndDepreciation: processMHRWithOutInterestAndDepreciation }))
        setValue('processCost', checkForDecimalAndNull(processCost, getConfigurationKey().NoOfDecimalForPrice))

    }

    const handleDiameterChange = debounce((e) => {

        let majorDia;
        let minorDia;

        if (e.name === 'majorDiameter') {
            minorDia = getValues('minorDiameter')
            majorDia = e.value
        } else {
            minorDia = e.value
            majorDia = getValues('majorDiameter')
        }

        if (minorDia && majorDia && Number(minorDia) > Number(majorDia)) {
            Toaster.warning('Minor diameter cannot be greater than major diameter')
            if (e.name === 'majorDiameter') {
                setTimeout(() => {
                    setValue('majorDiameter', "")
                }, 400);
            } else {
                setTimeout(() => {
                    setValue('minorDiameter', "")
                }, 400);
            }
            return false
        }
    }, 500)

    const onSubmit = debounce(handleSubmit((value) => {
        setIsDisable(true)
        let obj = {}
        obj.ProcessMachiningCalculatorId = props.calculatorData.ProcessCalculationId ? props.calculatorData.ProcessCalculationId : "00000000-0000-0000-0000-000000000000"
        obj.CostingProcessDetailId = WeightCalculatorRequest && WeightCalculatorRequest.CostingProcessDetailId ? WeightCalculatorRequest.CostingProcessDetailId : "00000000-0000-0000-0000-000000000000"
        obj.IsChangeApplied = true
        obj.TechnologyId = costData.TechnologyId
        obj.BaseCostingId = props?.item?.CostingId
        obj.TechnologyName = costData.TechnologyName
        obj.PartId = costData.PartId
        obj.UnitOfMeasurementId = props.calculatorData.UnitOfMeasurementId
        obj.MachineRateId = props.calculatorData.MachineRateId
        obj.PartNumber = costData.PartNumber
        obj.ProcessIdRef = props.calculatorData.ProcessId
        obj.ProcessName = props.calculatorData.ProcessName
        obj.ProcessDescription = props.calculatorData.ProcessDescription
        obj.MachineName = costData.MachineName
        obj.UOM = props.calculatorData.UOM
        obj.LoggedInUserId = loggedInUserId()
        obj.UnitTypeId = props.calculatorData.UOMTypeId
        obj.UnitType = props.calculatorData.UOMType
        obj.NoOFTeeth = value.noOFTeeth//
        obj.Module = value.module
        obj.MajorDiameter = value.majorDiameter
        obj.MinorDiameter = value.minorDiameter
        obj.CuttingLength = value.cuttingLength
        obj.CuttingResistance = value.cuttingResistance
        obj.StepForwardThinning = value.stepForwardThinning
        obj.BroachingForceInTon = dataToSend.broachingForce
        obj.ToolLength = value.toolLength
        obj.CuttingSpeedForward = value.cuttingSpeedForward
        obj.CuttingSpeedReturn = value.cuttingSpeedReturn
        obj.CuttingTimeMins = dataToSend.CuttingTimeMins
        obj.ChipToChipTiming = value.chipToChipTiming
        obj.TotalNonCuttingTime = value.totalNonCuttingTime
        obj.IndexingTablePositioningTime = value.indexingTablePositioningTime
        obj.LoadingAndUnloadingTime = value.loadingAndUnloadingTime
        obj.TotalCycleTimeMins = dataToSend.totalCycleTimeMins
        obj.TotalCycleTimeSec = dataToSend.TotalCycleTimeSec
        obj.CycleTime = dataToSend.TotalCycleTimeSec
        obj.EfficiencyPercentage = value.efficiencyPercentage
        obj.PartPerHour = dataToSend.partsPerHour
        obj.ProcessCost = dataToSend.processCost
        obj.MachineRate = props.calculatorData.MHR
        obj.TotalMachiningTime = totalMachiningTime
        obj.ProcessCostWithOutInterestAndDepreciation = netProcessCostWithOutInterestAndDepreciation
        obj.MHRWithOutInterestAndDepreciation = processMHRWithOutInterestAndDepreciation


        dispatch(saveMachiningProcessCostCalculationData(obj, res => {
            setIsDisable(false)
            if (res.data.Result) {
                obj.ProcessCalculationId = res.data.Identity
                Toaster.success('Calculation saved successfully.')
                calculateMachineTime('', obj)
            }
        }))
    }), 500);
    const onCancel = () => {
        calculateMachineTime('0.00')
    }

    const handleKeyDown = function (e) {
        if (e.key === 'Enter' && e.shiftKey === false) {
            e.preventDefault();
        }
    };

    return (
        <Fragment>
            <Row>
                <Col>
                    <form noValidate className="form"
                        onKeyDown={(e) => { handleKeyDown(e, onSubmit.bind(this)); }}>
                        <Col md="12" className={''}>
                            <div className="border pl-3 pr-3 pt-3">
                                <Col md="12">
                                    {/* <div className="left-border">{'Distance:'}</div> */}
                                </Col>
                                <Col md="12">
                                    <Row className={'mt15'}>
                                        <Col md="4">
                                            <NumberFieldHookForm
                                                label={`No. of Teeth`}
                                                name={'noOFTeeth'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                rules={{
                                                    required: true,
                                                    pattern: {
                                                        value: /^[0-9]*$/i,
                                                        message: 'Invalid Number.',
                                                    },
                                                    maxLength: 4,
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.noOFTeeth}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <NumberFieldHookForm
                                                label={`Module`}
                                                name={'module'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                rules={{
                                                    required: true,
                                                    pattern: {
                                                        value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                        message: 'Maximum length for integer is 4 and for decimal is 7',
                                                    },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.module}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <NumberFieldHookForm
                                                label={`Major Dia(mm)`}
                                                name={'majorDiameter'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: false,
                                                    pattern: {
                                                        value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                        message: 'Maximum length for integer is 4 and for decimal is 7',
                                                    },
                                                }}
                                                handleChange={(e) => handleDiameterChange(e.target)}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.majorDiameter}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md="4">
                                            <NumberFieldHookForm
                                                label={`Minor Dia(mm)`}
                                                name={'minorDiameter'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: false,
                                                    pattern: {
                                                        value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                        message: 'Maximum length for integer is 4 and for decimal is 7',
                                                    },
                                                }}
                                                handleChange={(e) => handleDiameterChange(e.target)}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.minorDiameter}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <NumberFieldHookForm
                                                label={`Cutting Length`}
                                                name={'cuttingLength'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                rules={{
                                                    required: true,
                                                    pattern: {
                                                        value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                        message: 'Maximum length for integer is 4 and for decimal is 7',
                                                    },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.cuttingLength}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <NumberFieldHookForm
                                                label="Cutting Resistence(Kg/mm2)"
                                                name={'cuttingResistance'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                rules={{
                                                    required: true,
                                                    pattern: {
                                                        value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                        message: 'Maximum length for integer is 4 and for decimal is 7',
                                                    },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.cuttingResistance}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>
                                    </Row>
                                </Col>

                                <Col md="12 mt-25">
                                </Col>
                                <Col md="12">
                                    <Row className={'mt15'}>

                                        <Col md="4">
                                            <NumberFieldHookForm
                                                label={`Step Forward Thinning(mm)`}
                                                name={'stepForwardThinning'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                rules={{
                                                    required: true,
                                                    pattern: {
                                                        value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                        message: 'Maximum length for integer is 4 and for decimal is 7',
                                                    },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.stepForwardThinning}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'broaching-force'} tooltipText={'Broaching Force in Ton = Cutting Resistance * (Cutting Length / Module) * (No. of Teeth * Module * Step Forward Thinning)  / 1000'} />
                                            <NumberFieldHookForm
                                                label={`Broaching Force in Ton`}
                                                name={'broachingForceInTon'}
                                                id={'broaching-force'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.broachingForceInTon}
                                                disabled={true}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <NumberFieldHookForm
                                                label={`Tool Length`}
                                                name={'toolLength'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                rules={{
                                                    required: true,
                                                    pattern: {
                                                        value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                        message: 'Maximum length for integer is 4 and for decimal is 7',
                                                    },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.toolLength}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <NumberFieldHookForm
                                                label={`Cutting Speed Forward(m/min)`}
                                                name={'cuttingSpeedForward'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                rules={{
                                                    required: true,
                                                    pattern: {
                                                        value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                        message: 'Maximum length for integer is 4 and for decimal is 7',
                                                    },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.cuttingSpeedForward}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <NumberFieldHookForm
                                                label={`Cutting Speed Return(m/min)`}
                                                name={'cuttingSpeedReturn'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                rules={{
                                                    required: true,
                                                    pattern: {
                                                        value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                        message: 'Maximum length for integer is 4 and for decimal is 7',
                                                    },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.cuttingSpeedReturn}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'broaching-cutting-time'} tooltipText={'Cutting time(Min) = (Tool Length / Cutting Speed Forward / 1000) + (Tool Length / Cutting Speed Return / 1000)'} />
                                            <NumberFieldHookForm
                                                label={`Cutting time(min)`}
                                                name={'cuttingTimeMins'}
                                                id={'broaching-cutting-time'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.cuttingTimeMins}
                                                disabled={true}
                                            />
                                        </Col>
                                    </Row>
                                </Col>

                                <Col md="10 mt-25">
                                    <div className="left-border">{'Time:'}</div>
                                </Col>
                                <Col md="12">
                                    <Row className={'mt15'}>

                                        <Col md="4">
                                            <NumberFieldHookForm
                                                label={`Chip to Chip Timing(min)`}
                                                name={'chipToChipTiming'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                handleChange={() => { }}
                                                rules={{
                                                    required: false,
                                                    pattern: {
                                                        value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                        message: 'Maximum length for integer is 4 and for decimal is 7',
                                                    },
                                                }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.chipToChipTiming}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <NumberFieldHookForm
                                                label={`Tool non cutting time(min)`}
                                                name={'totalNonCuttingTime'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: false,
                                                    pattern: {
                                                        value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                        message: 'Maximum length for integer is 4 and for decimal is 7',
                                                    },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.totalNonCuttingTime}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <NumberFieldHookForm
                                                label={`Indexing table positioning time(min)`}
                                                name={'indexingTablePositioningTime'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: false,
                                                    pattern: {
                                                        value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                        message: 'Maximum length for integer is 4 and for decimal is 7',
                                                    },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.indexingTablePositioningTime}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <NumberFieldHookForm
                                                label={`Loading & Unloading(min)`}
                                                name={'loadingAndUnloadingTime'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: false,
                                                    pattern: {
                                                        value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                        message: 'Maximum length for integer is 4 and for decimal is 7',
                                                    },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.loadingAndUnloadingTime}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>


                                        <Col md="4">
                                            <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'broaching-cyle-time-min'} tooltipText={'Total Cycle Time(Min) = (Cutting Time + Chip to Chip + Tool Non-Cutting + Indexing table + Loading & Unloading)'} />
                                            <NumberFieldHookForm
                                                label={`Total Cycle Time(min)`}
                                                name={'totalCycleTimeMins'}
                                                id={'broaching-cyle-time-min'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.totalCycleTimeMins}
                                                disabled={true}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TooltipCustom disabledIcon={true} id={'broaching-cyle-time-sec'} tooltipText={'Total Cycle Time(Sec) = (Total Cycle Time in Mins * 60)'} />
                                            <NumberFieldHookForm
                                                label={`Total Cycle Time(sec)`}
                                                name={'TotalCycleTimeSec'}
                                                id={'broaching-cyle-time-sec'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.TotalCycleTimeSec}
                                                disabled={true}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TextFieldHookForm
                                                label={`Efficiency (%)`}
                                                name={'efficiencyPercentage'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={true}
                                                handleChange={() => { }}
                                                rules={{
                                                    required: true,
                                                    validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                                    max: {
                                                        value: 100,
                                                        message: 'Percentage cannot be greater than 100'
                                                    },
                                                }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.efficiencyPercentage}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'broaching-part-hour'} tooltipText={'Part per Hour = (3600 / Cycle Time) * Efficiency / 100'} />
                                            <NumberFieldHookForm
                                                label={`Parts per hour`}
                                                name={'partsPerHour'}
                                                id={'broaching-part-hour'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.partsPerHour}
                                                disabled={true}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TooltipCustom disabledIcon={true} id={'broaching-process-cost'} tooltipText={'Process Cost = (Machine Rate / Parts per Hour)'} />
                                            <NumberFieldHookForm
                                                label={`Process Cost`}
                                                name={'processCost'}
                                                id={'broaching-process-cost'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.processCost}
                                                disabled={true}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </div>
                        </Col>
                        <div className="mt25 col-md-12 text-right">
                            <button onClick={onCancel} type="submit" value="CANCEL" className="reset mr15 cancel-btn">
                                <div className={'cancel-icon'}></div>CANCEL</button>
                            <button type="button"
                                onClick={onSubmit}
                                disabled={props.CostingViewMode || isDisable ? true : false}
                                className="btn-primary save-btn">
                                <div className={"save-icon"}></div>
                                {'SAVE'}
                            </button>
                        </div>
                    </form>
                </Col>
            </Row>
        </Fragment>
    )
}

export default Broaching







