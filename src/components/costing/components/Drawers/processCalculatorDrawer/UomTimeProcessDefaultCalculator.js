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

function UomTimeProcessDefaultCalculator(props) {
    const WeightCalculatorRequest = props.calculatorData.WeightCalculatorRequest
    const costData = useContext(costingInfoContext);
    const dispatch = useDispatch()
    const [dataToSend, setDataToSend] = useState({ ...WeightCalculatorRequest })

    const defaultValues = {
        cuttingDiameter: WeightCalculatorRequest && WeightCalculatorRequest.cuttingDiameter !== undefined ? WeightCalculatorRequest.cuttingDiameter : '',
        cuttingSpeed: WeightCalculatorRequest && WeightCalculatorRequest.cuttingSpeed !== undefined ? WeightCalculatorRequest.cuttingSpeed : '',
        spindleSpeed: WeightCalculatorRequest && WeightCalculatorRequest.spindleSpeed !== undefined ? WeightCalculatorRequest.spindleSpeed : '',
        feedPerTooth: WeightCalculatorRequest && WeightCalculatorRequest.feedPerTooth !== undefined ? WeightCalculatorRequest.feedPerTooth : '',
        noOfTooth: WeightCalculatorRequest && WeightCalculatorRequest.noOfTooth !== undefined ? WeightCalculatorRequest.noOfTooth : '',
        feedAutoCalculated: WeightCalculatorRequest && WeightCalculatorRequest.feed !== undefined ? WeightCalculatorRequest.feed : '',
        doc: WeightCalculatorRequest && WeightCalculatorRequest.Doc !== undefined ? WeightCalculatorRequest.Doc : '',
        lengthDepth: WeightCalculatorRequest && WeightCalculatorRequest.lengthDepth !== undefined ? WeightCalculatorRequest.lengthDepth : '',
        noOfPasses: WeightCalculatorRequest && WeightCalculatorRequest.noOfPasses !== undefined ? WeightCalculatorRequest.noOfPasses : '',
        totalLengthDepth: WeightCalculatorRequest && WeightCalculatorRequest.totalLengthDepth !== undefined ? WeightCalculatorRequest.totalLengthDepth : '',
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
        name: ['cuttingDiameter', 'cuttingSpeed', 'feedPerTooth', 'noOfTooth', 'lengthDepth', 'noOfPasses', 'chipToChipTiming', 'totalNonCuttingTime', 'indexingTablePositioningTime', 'loadingAndUnloadingTime', 'efficiencyPercentage', 'doc', 'cuttingSpeed', 'toothFeed', 'clampingPercentage', 'toothNo'],
    })

    useEffect(() => {
        setSpindleSpeed()
        setFeed()
        setTotalLengthDepth()
        setTotalCycleTimeMins()   //totalCycleTimeMins
        setPartsPerHour()    //partsPerHour
    }, [fieldValues])

    const trim = getConfigurationKey().NoOfDecimalForInputOutput
    const { technology, process, calculateMachineTime } = props
    const [totalMachiningTime, setTotalMachiningTime] = useState(WeightCalculatorRequest && WeightCalculatorRequest.TotalMachiningTime !== undefined ? WeightCalculatorRequest.TotalMachiningTime : '')

    const setSpindleSpeed = () => {
        const cuttingDiameter = Number(getValues('cuttingDiameter'))
        const cuttingSpeed = Number(getValues('cuttingSpeed'))
        const spindleSpeed = (1000 * checkForNull(cuttingSpeed)) / (3.14 * checkForNull(cuttingDiameter))
        setDataToSend(prevState => ({ ...prevState, spindleSpeed: spindleSpeed }))
        setValue('spindleSpeed', checkForDecimalAndNull(spindleSpeed, getConfigurationKey().NoOfDecimalForInputOutput))
    }

    const setFeed = () => {
        const feedPerTooth = Number(getValues('feedPerTooth'))
        const noOfTooth = Number(getValues('noOfTooth'))
        const feed = (checkForNull(dataToSend.spindleSpeed) * checkForNull(feedPerTooth) * checkForNull(noOfTooth))
        setDataToSend(prevState => ({ ...prevState, feed: feed }))
        setValue('feedAutoCalculated', checkForDecimalAndNull(feed, getConfigurationKey().NoOfDecimalForInputOutput))
    }

    const setTotalLengthDepth = () => {
        const lengthDepth = Number(getValues('lengthDepth'))
        const noOfPasses = Number(getValues('noOfPasses'))
        const totalLengthDepth = (checkForNull(lengthDepth) * checkForNull(noOfPasses))
        setDataToSend(prevState => ({ ...prevState, totalLengthDepth: totalLengthDepth }))
        setValue('totalLengthDepth', checkForDecimalAndNull(totalLengthDepth, getConfigurationKey().NoOfDecimalForInputOutput))
        const cuttingTimeMins = totalLengthDepth / checkForNull(dataToSend.feed);
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
        const totalCycleTimeSec = (checkForNull(totalCycleTimeMins) * 60)
        setDataToSend(prevState => ({ ...prevState, totalCycleTimeSec: totalCycleTimeSec }))
        setValue('totalCycleTimeSec', checkForDecimalAndNull(totalCycleTimeSec, getConfigurationKey().NoOfDecimalForInputOutput))
    }


    const setPartsPerHour = () => {
        const efficiencyPercentage = Number(getValues('efficiencyPercentage'))
        const partsPerHour = (3600 / checkForNull(dataToSend.totalCycleTimeSec)) * (checkForNull(efficiencyPercentage) / 100)
        setDataToSend(prevState => ({ ...prevState, partsPerHour: partsPerHour }))
        setValue('partsPerHour', checkForDecimalAndNull(partsPerHour, getConfigurationKey().NoOfDecimalForInputOutput))
        const processCost = (props?.calculatorData?.MHR) / partsPerHour
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
        obj.cuttingDiameter = value.cuttingDiameter//
        obj.cuttingSpeed = value.cuttingSpeed
        obj.spindleSpeed = dataToSend.spindleSpeed
        obj.feedPerTooth = value.feedPerTooth
        obj.noOfTooth = value.noOfTooth
        obj.feed = dataToSend.feed
        obj.Doc = value.doc
        obj.lengthDepth = value.lengthDepth
        obj.noOfPasses = value.noOfPasses
        obj.totalLengthDepth = dataToSend.totalLengthDepth
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
                                                label={`Cutting Diameter(mm)`}
                                                name={'cuttingDiameter'}
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
                                                errors={errors.cuttingDiameter}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TextFieldHookForm
                                                label={`Cutting Speed(m/min)`}
                                                name={'cuttingSpeed'}
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
                                                errors={errors.cuttingSpeed}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TextFieldHookForm
                                                label={`Spindle Speed`}
                                                name={'spindleSpeed'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: true,
                                                    pattern: {
                                                        //value: /^[0-9]*$/i,
                                                        value: /^[0-9]\d*(\.\d+)?$/i,
                                                        message: 'Invalid Number.',
                                                    },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.spindleSpeed}
                                                disabled={true}
                                            />
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md="4">
                                            <TextFieldHookForm
                                                label={`Feed Per tooth`}
                                                name={'feedPerTooth'}
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
                                                errors={errors.feedPerTooth}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TextFieldHookForm
                                                label={`No of Tooth`}
                                                name={'noOfTooth'}
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
                                                errors={errors.noOfTooth}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TextFieldHookForm
                                                label="Feed"
                                                name={'feedAutoCalculated'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.feedAutoCalculated}
                                                disabled={true}
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
                                                label={`Depth of Cut(mm)`}
                                                name={'doc'}
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
                                                errors={errors.doc}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TextFieldHookForm
                                                label={`Length/Depth`}
                                                name={'lengthDepth'}
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
                                                errors={errors.lengthDepth}
                                                disabled={false}
                                            />
                                        </Col>
                                        <Col md="4">
                                            <TextFieldHookForm
                                                label={`No of passes/Holes`}
                                                name={'noOfPasses'}
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
                                                errors={errors.noOfPasses}
                                                disabled={false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TextFieldHookForm
                                                label={`Total Length/Depth`}
                                                name={'totalLengthDepth'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                rules={{
                                                    required: false,
                                                    pattern: {
                                                        value: /^[0-9]\d*(\.\d+)?$/i,
                                                        message: 'Invalid Number.',
                                                    },
                                                }}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.totalLengthDepth}
                                                disabled={true}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TextFieldHookForm
                                                label={`Cutting Time(min)`}
                                                name={'cuttingTimeMins'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
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
                                                rules={{
                                                    required: true,
                                                    pattern: {
                                                        value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                        message: 'Maximum length for interger is 4 and for decimal is 7',
                                                    },
                                                }}
                                                mandatory={false}
                                                handleChange={() => { }}
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
                                                mandatory={false}
                                                handleChange={() => { }}
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

export default UomTimeProcessDefaultCalculator







