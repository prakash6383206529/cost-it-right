import React, { Fragment, useState, useEffect, useContext } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId, } from '../../../../../helper'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import { saveMachiningProcessCostCalculationData } from '../../../actions/CostWorking'
import Toaster from '../../../../common/Toaster'

function UomTimeProcessDefaultCalculator(props) {
    const WeightCalculatorRequest = props.calculatorData.WeightCalculatorRequest
    const costData = useContext(costingInfoContext);
    const dispatch = useDispatch()
    const [dataToSend, setDataToSend] = useState({ ...WeightCalculatorRequest })

    const defaultValues = {
        cuttingDiameter: WeightCalculatorRequest && WeightCalculatorRequest.CuttingDiameter !== undefined ? WeightCalculatorRequest.CuttingDiameter : '',
        cuttingSpeed: WeightCalculatorRequest && WeightCalculatorRequest.CuttingSpeed !== undefined ? WeightCalculatorRequest.CuttingSpeed : '',
        spindleSpeed: WeightCalculatorRequest && WeightCalculatorRequest.SpindleSpeed !== undefined ? WeightCalculatorRequest.SpindleSpeed : '',
        feedPerTooth: WeightCalculatorRequest && WeightCalculatorRequest.FeedPerTooth !== undefined ? WeightCalculatorRequest.FeedPerTooth : '',
        noOfTooth: WeightCalculatorRequest && WeightCalculatorRequest.NoOFTeeth !== undefined ? WeightCalculatorRequest.NoOFTeeth : '',
        feedAutoCalculated: WeightCalculatorRequest && WeightCalculatorRequest.Feed !== undefined ? WeightCalculatorRequest.Feed : '',
        doc: WeightCalculatorRequest && WeightCalculatorRequest.Doc !== undefined ? WeightCalculatorRequest.Doc : '',
        lengthDepth: WeightCalculatorRequest && WeightCalculatorRequest.LengthDepth !== undefined ? WeightCalculatorRequest.LengthDepth : '',
        noOfPasses: WeightCalculatorRequest && WeightCalculatorRequest.NoOfPass !== undefined ? WeightCalculatorRequest.NoOfPass : '',
        totalLengthDepth: WeightCalculatorRequest && WeightCalculatorRequest.TotalLengthDepth !== undefined ? WeightCalculatorRequest.TotalLengthDepth : '',
        cuttingTimeMins: WeightCalculatorRequest && WeightCalculatorRequest.CuttingTimeMins !== undefined ? WeightCalculatorRequest.CuttingTimeMins : '',
        chipToChipTiming: WeightCalculatorRequest && WeightCalculatorRequest.ChipToChipTiming !== undefined ? WeightCalculatorRequest.ChipToChipTiming : '',
        totalNonCuttingTime: WeightCalculatorRequest && WeightCalculatorRequest.TotalNonCuttingTime !== undefined ? WeightCalculatorRequest.TotalNonCuttingTime : '',
        indexingTablePositioningTime: WeightCalculatorRequest && WeightCalculatorRequest.IndexingTablePositioningTime !== undefined ? WeightCalculatorRequest.IndexingTablePositioningTime : '',
        loadingAndUnloadingTime: WeightCalculatorRequest && WeightCalculatorRequest.LoadingAndUnloadingTime !== undefined ? WeightCalculatorRequest.LoadingAndUnloadingTime : '',
        totalCycleTimeMins: WeightCalculatorRequest && WeightCalculatorRequest.TotalCycleTimeMins !== undefined ? WeightCalculatorRequest.TotalCycleTimeMins : '',
        TotalCycleTimeSec: WeightCalculatorRequest && WeightCalculatorRequest.TotalCycleTimeSec !== undefined ? WeightCalculatorRequest.TotalCycleTimeSec : '',
        efficiencyPercentage: WeightCalculatorRequest && WeightCalculatorRequest.EfficiencyPercentage !== undefined ? WeightCalculatorRequest.EfficiencyPercentage : '',
        partsPerHour: WeightCalculatorRequest && WeightCalculatorRequest.PartsPerHour !== undefined ? WeightCalculatorRequest.PartsPerHour : '',
        processCost: WeightCalculatorRequest && WeightCalculatorRequest.NetProcessCost !== undefined ? WeightCalculatorRequest.NetProcessCost : '',
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
        const SpindleSpeed = (1000 * checkForNull(cuttingSpeed)) / (3.14 * checkForNull(cuttingDiameter))
        setDataToSend(prevState => ({ ...prevState, SpindleSpeed: SpindleSpeed }))
        setValue('spindleSpeed', checkForDecimalAndNull(SpindleSpeed, getConfigurationKey().NoOfDecimalForInputOutput))
    }

    const setFeed = () => {
        const feedPerTooth = Number(getValues('feedPerTooth'))
        const noOfTooth = Number(getValues('noOfTooth'))
        const Feed = (checkForNull(dataToSend.SpindleSpeed) * checkForNull(feedPerTooth) * checkForNull(noOfTooth))
        setDataToSend(prevState => ({ ...prevState, Feed: Feed }))
        setValue('feedAutoCalculated', checkForDecimalAndNull(Feed, getConfigurationKey().NoOfDecimalForInputOutput))
    }

    const setTotalLengthDepth = () => {
        const lengthDepth = Number(getValues('lengthDepth'))
        const noOfPasses = Number(getValues('noOfPasses'))
        const totalLengthDepth = (checkForNull(lengthDepth) * checkForNull(noOfPasses))
        setDataToSend(prevState => ({ ...prevState, totalLengthDepth: totalLengthDepth }))
        setValue('totalLengthDepth', checkForDecimalAndNull(totalLengthDepth, getConfigurationKey().NoOfDecimalForInputOutput))
        const cuttingTimeMins = totalLengthDepth / checkForNull(dataToSend.Feed);
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
        const TotalCycleTimeSec = (checkForNull(totalCycleTimeMins) * 60)
        setDataToSend(prevState => ({ ...prevState, TotalCycleTimeSec: TotalCycleTimeSec }))
        setValue('TotalCycleTimeSec', checkForDecimalAndNull(TotalCycleTimeSec, getConfigurationKey().NoOfDecimalForInputOutput))
    }


    const setPartsPerHour = () => {
        const efficiencyPercentage = Number(getValues('efficiencyPercentage'))
        const partsPerHour = (3600 / checkForNull(dataToSend.TotalCycleTimeSec)) * (checkForNull(efficiencyPercentage / 100))
        setDataToSend(prevState => ({ ...prevState, partsPerHour: partsPerHour }))
        setValue('partsPerHour', checkForDecimalAndNull(partsPerHour, getConfigurationKey().NoOfDecimalForInputOutput))
        const processCost = (props?.calculatorData?.MHR) / partsPerHour
        setDataToSend(prevState => ({ ...prevState, processCost: processCost }))
        setValue('processCost', checkForDecimalAndNull(processCost, getConfigurationKey().NoOfDecimalForInputOutput))
    }

    const onSubmit = (value) => {

        let obj = {}
        obj.ProcessMachiningCalculatorId = props.calculatorData.ProcessCalculationId ? props.calculatorData.ProcessCalculationId : "00000000-0000-0000-0000-000000000000"
        obj.CostingProcessDetailsId = WeightCalculatorRequest && WeightCalculatorRequest.CostingProcessDetailId ? WeightCalculatorRequest.CostingProcessDetailId : "00000000-0000-0000-0000-000000000000"
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
        obj.CuttingDiameter = value.cuttingDiameter//
        obj.CuttingSpeed = value.cuttingSpeed
        obj.SpindleSpeed = dataToSend.SpindleSpeed
        obj.FeedPerTooth = value.feedPerTooth
        obj.NoOFTeeth = value.noOfTooth
        obj.Feed = dataToSend.Feed
        obj.Doc = value.doc
        obj.LengthDepth = value.lengthDepth
        obj.NoOfPass = value.noOfPasses
        obj.TotalLengthDepth = dataToSend.totalLengthDepth
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







