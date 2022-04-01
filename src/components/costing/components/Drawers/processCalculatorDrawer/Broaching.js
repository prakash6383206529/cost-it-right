import React, { Fragment, useState, useEffect, useContext } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import { clampingTime, feedByMin, findRpm, passesNo, totalMachineTime, } from './CommonFormula'
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId, } from '../../../../../helper'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import { saveMachiningProcessCostCalculationData } from '../../../actions/CostWorking'
import Toaster from '../../../../common/Toaster'

function Broaching(props) {
    const WeightCalculatorRequest = props.calculatorData.WeightCalculatorRequest
    const costData = useContext(costingInfoContext);
    const dispatch = useDispatch()
    const [dataToSend, setDataToSend] = useState({ ...WeightCalculatorRequest })

    const defaultValues = {
        noOFTeeth: WeightCalculatorRequest && WeightCalculatorRequest.NoOFTeeth !== undefined ? WeightCalculatorRequest.NoOFTeeth : '',
        module: WeightCalculatorRequest && WeightCalculatorRequest.Module !== undefined ? WeightCalculatorRequest.Module : '',
        majorDiameter: WeightCalculatorRequest && WeightCalculatorRequest.MajorDiameter !== undefined ? WeightCalculatorRequest.MajorDiameter : '',
        minorDiameter: WeightCalculatorRequest && WeightCalculatorRequest.MinorDiameter !== undefined ? WeightCalculatorRequest.MinorDiameter : '',
        cuttingLength: WeightCalculatorRequest && WeightCalculatorRequest.CuttingLength !== undefined ? WeightCalculatorRequest.CuttingLength : '',
        cuttingResistance: WeightCalculatorRequest && WeightCalculatorRequest.CuttingResistance !== undefined ? WeightCalculatorRequest.CuttingResistance : '',
        stepForwardThinning: WeightCalculatorRequest && WeightCalculatorRequest.StepForwardThinning !== undefined ? WeightCalculatorRequest.StepForwardThinning : '',
        broachingForceInTon: WeightCalculatorRequest && WeightCalculatorRequest.BroachingForceInTon !== undefined ? WeightCalculatorRequest.BroachingForceInTon : '',
        toolLength: WeightCalculatorRequest && WeightCalculatorRequest.ToolLength !== undefined ? WeightCalculatorRequest.ToolLength : '',
        cuttingSpeedForward: WeightCalculatorRequest && WeightCalculatorRequest.CuttingSpeedForward !== undefined ? WeightCalculatorRequest.CuttingSpeedForward : '',
        cuttingSpeedReturn: WeightCalculatorRequest && WeightCalculatorRequest.CuttingSpeedReturn !== undefined ? WeightCalculatorRequest.CuttingSpeedReturn : '',
        cuttingTimeMins: WeightCalculatorRequest && WeightCalculatorRequest.CuttingTimeMins !== undefined ? WeightCalculatorRequest.CuttingTimeMins : '',
        chipToChipTiming: WeightCalculatorRequest && WeightCalculatorRequest.ChipToChipTiming !== undefined ? WeightCalculatorRequest.ChipToChipTiming : '',
        totalNonCuttingTime: WeightCalculatorRequest && WeightCalculatorRequest.TotalNonCuttingTime !== undefined ? WeightCalculatorRequest.TotalNonCuttingTime : '',
        indexingTablePositioningTime: WeightCalculatorRequest && WeightCalculatorRequest.IndexingTablePositioningTime !== undefined ? WeightCalculatorRequest.IndexingTablePositioningTime : '',
        loadingAndUnloadingTime: WeightCalculatorRequest && WeightCalculatorRequest.LoadingAndUnloadingTime !== undefined ? WeightCalculatorRequest.LoadingAndUnloadingTime : '',
        totalCycleTimeMins: WeightCalculatorRequest && WeightCalculatorRequest.TotalCycleTimeMins !== undefined ? WeightCalculatorRequest.TotalCycleTimeMins : '',
        TotalCycleTimeSec: WeightCalculatorRequest && WeightCalculatorRequest.TotalCycleTimeSec !== undefined ? WeightCalculatorRequest.TotalCycleTimeSec : '',
        efficiencyPercentage: WeightCalculatorRequest && WeightCalculatorRequest.EfficiencyPercentage !== undefined ? WeightCalculatorRequest.EfficiencyPercentage : '',
        partsPerHour: WeightCalculatorRequest && WeightCalculatorRequest.PartsPerHour !== undefined ? WeightCalculatorRequest.PartsPerHour : '',
        processCost: WeightCalculatorRequest && WeightCalculatorRequest.ProcessCost !== undefined ? WeightCalculatorRequest.ProcessCost : '',
    }
    const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors }, } = useForm({
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
        setPartsPerHour()    //partsPerHour
    }, [fieldValues])

    const trim = getConfigurationKey().NoOfDecimalForInputOutput
    const { technology, process, calculateMachineTime } = props
    const [totalMachiningTime, setTotalMachiningTime] = useState(WeightCalculatorRequest && WeightCalculatorRequest.TotalMachiningTime !== undefined ? WeightCalculatorRequest.TotalMachiningTime : '')

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
        const cuttingTimeMins = (checkForNull(toolLength) / checkForNull(cuttingSpeedForward) / 1000) + (checkForNull(toolLength) / checkForNull(cuttingSpeedReturn) / 1000);
        setDataToSend(prevState => ({ ...prevState, cuttingTimeMins: cuttingTimeMins }))
        setValue('cuttingTimeMins', checkForDecimalAndNull(cuttingTimeMins, getConfigurationKey().NoOfDecimalForInputOutput))
    }

    const setTotalCycleTimeMins = () => {
        const chipToChipTiming = Number(getValues('chipToChipTiming'))
        const totalNonCuttingTime = Number(getValues('totalNonCuttingTime'))
        const indexingTablePositioningTime = Number(getValues('indexingTablePositioningTime'))
        const loadingAndUnloadingTime = Number(getValues('loadingAndUnloadingTime'))
        const totalCycleTimeMins = (checkForNull(dataToSend.cuttingTimeMins) + checkForNull(chipToChipTiming) + checkForNull(totalNonCuttingTime) + checkForNull(indexingTablePositioningTime) + checkForNull(loadingAndUnloadingTime))
        setDataToSend(prevState => ({ ...prevState, totalCycleTimeMins: totalCycleTimeMins }))
        setValue('totalCycleTimeMins', checkForDecimalAndNull(totalCycleTimeMins, getConfigurationKey().NoOfDecimalForInputOutput))
        const TotalCycleTimeSec = (totalCycleTimeMins * 60)
        setDataToSend(prevState => ({ ...prevState, TotalCycleTimeSec: TotalCycleTimeSec }))
        setValue('TotalCycleTimeSec', checkForDecimalAndNull(TotalCycleTimeSec, getConfigurationKey().NoOfDecimalForInputOutput))
    }


    const setPartsPerHour = () => {
        const efficiencyPercentage = Number(getValues('efficiencyPercentage'))
        const partsPerHour = (3600 / checkForNull(dataToSend.TotalCycleTimeSec)) * (checkForNull(efficiencyPercentage) / 100)
        setDataToSend(prevState => ({ ...prevState, partsPerHour: partsPerHour }))
        setValue('partsPerHour', checkForDecimalAndNull(partsPerHour, getConfigurationKey().NoOfDecimalForInputOutput))
        const processCost = (props?.calculatorData?.MHR) / checkForNull(partsPerHour)
        setDataToSend(prevState => ({ ...prevState, processCost: processCost }))
        setValue('processCost', checkForDecimalAndNull(processCost, getConfigurationKey().NoOfDecimalForInputOutput))
    }

    const onSubmit = (value) => {
        let obj = {}
        obj.ProcessMachiningCalculatorId = props.calculatorData.ProcessCalculationId ? props.calculatorData.ProcessCalculationId : "00000000-0000-0000-0000-000000000000"
        obj.CostingProcessDetailId = WeightCalculatorRequest && WeightCalculatorRequest.CostingProcessDetailId ? WeightCalculatorRequest.CostingProcessDetailId : "00000000-0000-0000-0000-000000000000"
        obj.IsChangeApplied = true
        obj.TechnologyId = costData.TechnologyId
        obj.BaseCostingId = costData.CostingId
        obj.TechnologyName = costData.TechnologyName
        obj.PartId = costData.PartId
        obj.UnitOfMeasurementId = props.calculatorData.UnitOfMeasurementId
        obj.MachineRateId = props.calculatorData.MachineRateId
        obj.PartNumber = costData.PartNumber
        obj.ProcessId = props.calculatorData.ProcessId
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
        obj.CuttingTimeMins = dataToSend.cuttingTimeMins
        obj.ChipToChipTiming = value.chipToChipTiming
        obj.TotalNonCuttingTime = value.totalNonCuttingTime
        obj.IndexingTablePositioningTime = value.indexingTablePositioningTime
        obj.LoadingAndUnloadingTime = value.loadingAndUnloadingTime
        obj.TotalCycleTimeMins = dataToSend.totalCycleTimeMins
        obj.TotalCycleTimeSec = dataToSend.TotalCycleTimeSec
        obj.EfficiencyPercentage = value.efficiencyPercentage
        obj.PartsPerHour = dataToSend.partsPerHour
        obj.ProcessCost = dataToSend.processCost
        obj.TotalMachiningTime = totalMachiningTime
        obj.MachineRate = props.calculatorData.MHR
        dispatch(saveMachiningProcessCostCalculationData(obj, res => {
            if (res.data.Result) {
                obj.ProcessCalculationId = res.data.Identity
                Toaster.success('Calculation saved sucessfully.')
                calculateMachineTime(totalMachiningTime, obj)
            }
        }))
    }
    const onCancel = () => {
        calculateMachineTime('0.00')
    }
    return (
        <Fragment>
            <Row>
                <Col>
                    <form noValidate className="form" onSubmit={handleSubmit(onSubmit)}>
                        <Col md="12" className={''}>
                            <div className="border pl-3 pr-3 pt-3">
                                <Col md="12">
                                    {/* <div className="left-border">{'Distance:'}</div> */}
                                </Col>
                                <Col md="12">
                                    <Row className={'mt15'}>
                                        <Col md="4">
                                            <TextFieldHookForm
                                                label={`No of Teeth`}
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
                                            <TextFieldHookForm
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
                                                        message: 'Maximum length for interger is 4 and for decimal is 7',
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
                                            <TextFieldHookForm
                                                label={`Major Dia(mm)`}
                                                name={'majorDiameter'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: true,
                                                    pattern: {
                                                        value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                        message: 'Maximum length for interger is 4 and for decimal is 7',
                                                    },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.majorDiameter}
                                                disabled={false}
                                            />
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md="4">
                                            <TextFieldHookForm
                                                label={`Minor Dia(mm)`}
                                                name={'minorDiameter'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: true,
                                                    pattern: {
                                                        value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                        message: 'Maximum length for interger is 4 and for decimal is 7',
                                                    },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.minorDiameter}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TextFieldHookForm
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
                                                        message: 'Maximum length for interger is 4 and for decimal is 7',
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
                                            <TextFieldHookForm
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
                                                        message: 'Maximum length for interger is 4 and for decimal is 7',
                                                    },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.cuttingResistance}
                                                disabled={false}
                                            />
                                        </Col>
                                    </Row>
                                </Col>

                                <Col md="12 mt-25">
                                </Col>
                                <Col md="12">
                                    <Row className={'mt15'}>

                                        <Col md="4">
                                            <TextFieldHookForm
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
                                                        message: 'Maximum length for interger is 4 and for decimal is 7',
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
                                            <TextFieldHookForm
                                                label={`Broaching Force in Ton`}
                                                name={'broachingForceInTon'}
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
                                            <TextFieldHookForm
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
                                                        message: 'Maximum length for interger is 4 and for decimal is 7',
                                                    },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.toolLength}
                                                disabled={false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TextFieldHookForm
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
                                                        message: 'Maximum length for interger is 4 and for decimal is 7',
                                                    },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.cuttingSpeedForward}
                                                disabled={false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TextFieldHookForm
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
                                                        message: 'Maximum length for interger is 4 and for decimal is 7',
                                                    },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.cuttingSpeedReturn}
                                                disabled={false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TextFieldHookForm
                                                label={`Cutting time(min)`}
                                                name={'cuttingTimeMins'}
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
                                            <TextFieldHookForm
                                                label={`Chip to Chip Timing(min)`}
                                                name={'chipToChipTiming'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                handleChange={() => { }}
                                                rules={{
                                                    required: true,
                                                    pattern: {
                                                        value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                        message: 'Maximum length for interger is 4 and for decimal is 7',
                                                    },
                                                }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.chipToChipTiming}
                                                disabled={false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TextFieldHookForm
                                                label={`Tool non cutting time(min)`}
                                                name={'totalNonCuttingTime'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: true,
                                                    pattern: {
                                                        value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                        message: 'Maximum length for interger is 4 and for decimal is 7',
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
                                            <TextFieldHookForm
                                                label={`Indexing table positioning time(min)`}
                                                name={'indexingTablePositioningTime'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: true,
                                                    pattern: {
                                                        value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                        message: 'Maximum length for interger is 4 and for decimal is 7',
                                                    },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.indexingTablePositioningTime}
                                                disabled={false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TextFieldHookForm
                                                label={`Loading & Unloading(min)`}
                                                name={'loadingAndUnloadingTime'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: true,
                                                    pattern: {
                                                        value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                        message: 'Maximum length for interger is 4 and for decimal is 7',
                                                    },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.loadingAndUnloadingTime}
                                                disabled={false}
                                            />
                                        </Col>


                                        <Col md="4">
                                            <TextFieldHookForm
                                                label={`Total Cycle Time(min)`}
                                                name={'totalCycleTimeMins'}
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
                                            <TextFieldHookForm
                                                label={`Total Cycle Time(sec)`}
                                                name={'TotalCycleTimeSec'}
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
                                                label={`Efficiency(%)`}
                                                name={'efficiencyPercentage'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                handleChange={() => { }}
                                                rules={{
                                                    required: true,
                                                    pattern: {
                                                        value: /^\d*\.?\d*$/,
                                                        message: 'Invalid Number.'
                                                    },

                                                    max: {
                                                        value: 100,
                                                        message: "Should not be greater than 100"
                                                    }
                                                }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.efficiencyPercentage}
                                                disabled={false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TextFieldHookForm
                                                label={`Parts per hour`}
                                                name={'partsPerHour'}
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
                                            <TextFieldHookForm
                                                label={`Process Cost`}
                                                name={'processCost'}
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
                            <button type="submit" className="btn-primary save-btn" disabled={props.CostingViewMode ? true : false}>
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







