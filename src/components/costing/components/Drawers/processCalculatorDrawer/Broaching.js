import React, { Fragment, useState, useEffect, useContext } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import { clampingTime, feedByMin, findRpm, passesNo, totalMachineTime, } from './CommonFormula'
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId, } from '../../../../../helper'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import { saveProcessCostCalculationData } from '../../../actions/CostWorking'
import Toaster from '../../../../common/Toaster'

function Broaching(props) {
    const WeightCalculatorRequest = props.calculatorData.WeightCalculatorRequest
    const costData = useContext(costingInfoContext);
    const dispatch = useDispatch()
    const [dataToSend, setDataToSend] = useState({ ...WeightCalculatorRequest })

    const defaultValues = {
        noOFTeeth: WeightCalculatorRequest && WeightCalculatorRequest.noOFTeeth !== undefined ? WeightCalculatorRequest.noOFTeeth : '',
        module: WeightCalculatorRequest && WeightCalculatorRequest.module !== undefined ? WeightCalculatorRequest.module : '',
        majorDiameter: WeightCalculatorRequest && WeightCalculatorRequest.majorDiameter !== undefined ? WeightCalculatorRequest.majorDiameter : '',
        minorDiameter: WeightCalculatorRequest && WeightCalculatorRequest.minorDiameter !== undefined ? WeightCalculatorRequest.minorDiameter : '',
        cuttingLength: WeightCalculatorRequest && WeightCalculatorRequest.cuttingLength !== undefined ? WeightCalculatorRequest.cuttingLength : '',
        cuttingResistance: WeightCalculatorRequest && WeightCalculatorRequest.cuttingResistance !== undefined ? WeightCalculatorRequest.cuttingResistance : '',
        stepForwardThinning: WeightCalculatorRequest && WeightCalculatorRequest.stepForwardThinning !== undefined ? WeightCalculatorRequest.stepForwardThinning : '',
        broachingForceInTon: WeightCalculatorRequest && WeightCalculatorRequest.broachingForceInTon !== undefined ? WeightCalculatorRequest.broachingForceInTon : '',
        toolLength: WeightCalculatorRequest && WeightCalculatorRequest.toolLength !== undefined ? WeightCalculatorRequest.toolLength : '',
        cuttingSpeedForward: WeightCalculatorRequest && WeightCalculatorRequest.cuttingSpeedForward !== undefined ? WeightCalculatorRequest.cuttingSpeedForward : '',
        cuttingSpeedReturn: WeightCalculatorRequest && WeightCalculatorRequest.cuttingSpeedReturn !== undefined ? WeightCalculatorRequest.cuttingSpeedReturn : '',
        cuttingTimeMins: WeightCalculatorRequest && WeightCalculatorRequest.cuttingTimeMins !== undefined ? WeightCalculatorRequest.cuttingTimeMins : '',
        chipToChipTiming: WeightCalculatorRequest && WeightCalculatorRequest.chipToChipTiming !== undefined ? WeightCalculatorRequest.chipToChipTiming : '',
        totalNonCuttingTime: WeightCalculatorRequest && WeightCalculatorRequest.totalNonCuttingTime !== undefined ? WeightCalculatorRequest.totalNonCuttingTime : '',
        indexingTablePositioningTime: WeightCalculatorRequest && WeightCalculatorRequest.indexingTablePositioningTime !== undefined ? WeightCalculatorRequest.indexingTablePositioningTime : '',
        loadingAndUnloadingTime: WeightCalculatorRequest && WeightCalculatorRequest.loadingAndUnloadingTime !== undefined ? WeightCalculatorRequest.loadingAndUnloadingTime : '',
        totalCycleTimeMins: WeightCalculatorRequest && WeightCalculatorRequest.totalCycleTimeMins !== undefined ? WeightCalculatorRequest.totalCycleTimeMins : '',
        totalCycleTimeSec: WeightCalculatorRequest && WeightCalculatorRequest.totalCycleTimeSec !== undefined ? WeightCalculatorRequest.totalCycleTimeSec : '',
        efficiencyPercentage: WeightCalculatorRequest && WeightCalculatorRequest.efficiencyPercentage !== undefined ? WeightCalculatorRequest.efficiencyPercentage : '',
        partsPerHour: WeightCalculatorRequest && WeightCalculatorRequest.partsPerHour !== undefined ? WeightCalculatorRequest.partsPerHour : '',
        processCost: WeightCalculatorRequest && WeightCalculatorRequest.processCost !== undefined ? WeightCalculatorRequest.processCost : '',
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
        const totalCycleTimeSec = (totalCycleTimeMins * 60)
        setDataToSend(prevState => ({ ...prevState, totalCycleTimeSec: totalCycleTimeSec }))
        setValue('totalCycleTimeSec', checkForDecimalAndNull(totalCycleTimeSec, getConfigurationKey().NoOfDecimalForInputOutput))
    }


    const setPartsPerHour = () => {
        const efficiencyPercentage = Number(getValues('efficiencyPercentage'))
        const partsPerHour = (3600 / checkForNull(dataToSend.totalCycleTimeSec)) * (checkForNull(efficiencyPercentage) / 100)
        setDataToSend(prevState => ({ ...prevState, partsPerHour: partsPerHour }))
        setValue('partsPerHour', checkForDecimalAndNull(partsPerHour, getConfigurationKey().NoOfDecimalForInputOutput))
        const processCost = (props?.calculatorData?.MHR) / checkForNull(partsPerHour)
        setDataToSend(prevState => ({ ...prevState, processCost: processCost }))
        setValue('processCost', checkForDecimalAndNull(processCost, getConfigurationKey().NoOfDecimalForInputOutput))
    }

    const onSubmit = (value) => {
        let obj = {}
        obj.ProcessCalculationId = props.calculatorData.ProcessCalculationId ? props.calculatorData.ProcessCalculationId : "00000000-0000-0000-0000-000000000000"
        obj.CostingProcessDetailId = WeightCalculatorRequest && WeightCalculatorRequest.CostingProcessDetailId ? WeightCalculatorRequest.CostingProcessDetailId : "00000000-0000-0000-0000-000000000000"
        obj.IsChangeApplied = true
        obj.TechnologyId = costData.TechnologyId
        obj.CostingId = costData.CostingId
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
        obj.noOFTeeth = value.noOFTeeth//
        obj.module = value.module
        obj.majorDiameter = value.majorDiameter
        obj.minorDiameter = value.minorDiameter
        obj.cuttingLength = value.cuttingLength
        obj.cuttingResistance = value.cuttingResistance
        obj.stepForwardThinning = value.stepForwardThinning
        obj.broachingForceInTon = dataToSend.broachingForce
        obj.toolLength = value.toolLength
        obj.cuttingSpeedForward = value.cuttingSpeedForward
        obj.cuttingSpeedReturn = value.cuttingSpeedReturn
        obj.cuttingTimeMins = dataToSend.cuttingTimeMins
        obj.chipToChipTiming = value.chipToChipTiming
        obj.totalNonCuttingTime = value.totalNonCuttingTime
        obj.indexingTablePositioningTime = value.indexingTablePositioningTime
        obj.loadingAndUnloadingTime = value.loadingAndUnloadingTime
        obj.totalCycleTimeMins = dataToSend.totalCycleTimeMins
        obj.totalCycleTimeSec = dataToSend.totalCycleTimeSec
        obj.efficiencyPercentage = value.efficiencyPercentage
        obj.partsPerHour = dataToSend.partsPerHour
        obj.processCost = dataToSend.processCost
        obj.TotalMachiningTime = totalMachiningTime
        obj.MachineRate = props.calculatorData.MHR
        dispatch(saveProcessCostCalculationData(obj, res => {
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
                                                name={'totalCycleTimeSec'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.totalCycleTimeSec}
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







