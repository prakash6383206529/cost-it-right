import React, { Fragment, useState, useEffect, useContext } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { NumberFieldHookForm, TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId, } from '../../../../../helper'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import { saveMachiningProcessCostCalculationData } from '../../../actions/CostWorking'
import Toaster from '../../../../common/Toaster'
import { findProcessCost } from '../../../CostingUtil'
import { debounce } from 'lodash'
import TooltipCustom from '../../../../common/Tooltip'
import { number, percentageLimitValidation, checkWhiteSpaces } from "../../../../../helper/validation";

function UomTimeProcessDefaultCalculator(props) {
    const WeightCalculatorRequest = props.calculatorData.WeightCalculatorRequest
    const processMHRWithOutInterestAndDepreciation=props?.calculatorData?.MHRWithOutInterestAndDepreciation
    const costData = useContext(costingInfoContext);
    const dispatch = useDispatch()
    const [dataToSend, setDataToSend] = useState({ ...WeightCalculatorRequest })
    const [isDisable, setIsDisable] = useState(false)
    const [netProcessCostWithOutInterestAndDepreciation, setNetProcessCostWithoutInterestAndDepreciation] = useState(1)
    const [totalMachiningTime, setTotalMachiningTime] = useState(WeightCalculatorRequest && WeightCalculatorRequest.TotalMachiningTime !== undefined ? WeightCalculatorRequest.TotalMachiningTime : '')
    let TotalCycleTimeSecGlobal = 0

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
        partsPerHour: WeightCalculatorRequest && WeightCalculatorRequest.PartPerHour !== undefined ? WeightCalculatorRequest.PartPerHour : '',
        processCost: WeightCalculatorRequest && WeightCalculatorRequest.NetProcessCost !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NetProcessCost, getConfigurationKey().NoOfDecimalForPrice) : '',
    }
    const { register, handleSubmit, control, setValue, getValues, formState: { errors }, } = useForm({
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


    useEffect(() => {

        setFeed()
    }, [dataToSend.SpindleSpeed])


    useEffect(() => {

        setTotalLengthDepth()
    }, [dataToSend.Feed])

    useEffect(() => {

        setTotalCycleTimeMins()
        setPartsPerHour()
    }, [dataToSend.CuttingTimeMins])


    const { calculateMachineTime } = props

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
        const CuttingTimeMins = totalLengthDepth / checkForNull(dataToSend.Feed);
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
        const TotalCycleTimeSec = (checkForNull(totalCycleTimeMins) * 60)
        TotalCycleTimeSecGlobal = TotalCycleTimeSec
        setDataToSend(prevState => ({ ...prevState, TotalCycleTimeSec: TotalCycleTimeSec }))
        setValue('TotalCycleTimeSec', checkForDecimalAndNull(TotalCycleTimeSec, getConfigurationKey().NoOfDecimalForInputOutput))
    }


    const setPartsPerHour = () => {
        const efficiencyPercentage = Number(getValues('efficiencyPercentage'))
        const partsPerHour = (3600 / checkForNull(TotalCycleTimeSecGlobal)) * (checkForNull(efficiencyPercentage / 100))
        setDataToSend(prevState => ({ ...prevState, partsPerHour: partsPerHour }))
        setValue('partsPerHour', checkForDecimalAndNull(partsPerHour, getConfigurationKey().NoOfDecimalForInputOutput))
        // const processCost = (props?.calculatorData?.MHR) / partsPerHour
        const {processCost,processCostWithoutInterestAndDepreciation} = findProcessCost(props?.calculatorData?.UOM, props?.calculatorData?.MHR, partsPerHour,processMHRWithOutInterestAndDepreciation)
        setNetProcessCostWithoutInterestAndDepreciation(processCostWithoutInterestAndDepreciation)
        setDataToSend(prevState => ({ ...prevState, processCost: processCost,netProcessCostWithoutInterestAndDepreciation:processCostWithoutInterestAndDepreciation }))
        setValue('processCost', checkForDecimalAndNull(processCost, getConfigurationKey().NoOfDecimalForPrice))
    }

    const onSubmit = debounce(handleSubmit((value) => {
        setIsDisable(true)

        let obj = {}
        obj.ProcessMachiningCalculatorId = props.calculatorData.ProcessCalculationId ? props.calculatorData.ProcessCalculationId : "00000000-0000-0000-0000-000000000000"
        obj.CostingProcessDetailsId = WeightCalculatorRequest && WeightCalculatorRequest.CostingProcessDetailId ? WeightCalculatorRequest.CostingProcessDetailId : "00000000-0000-0000-0000-000000000000"
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
                calculateMachineTime(totalMachiningTime, obj)
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
                                                        message: 'Maximum length for integer is 4 and for decimal is 7',
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
                                            <NumberFieldHookForm
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
                                                        message: 'Maximum length for integer is 4 and for decimal is 7',
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
                                            <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'spindle-speed'} tooltipText={'Spindle Speed = (1000 * Cutting Speed) / (π * Cutting Diameter)'} />
                                            <NumberFieldHookForm
                                                label={`Spindle Speed(rpm)`}
                                                id={'spindle-speed'}
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
                                            <NumberFieldHookForm
                                                label={`Feed per Tooth(mm/rev)`}
                                                name={'feedPerTooth'}
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
                                                errors={errors.feedPerTooth}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <NumberFieldHookForm
                                                label={`No. of Tooth`}
                                                name={'noOfTooth'}
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
                                                errors={errors.noOfTooth}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TooltipCustom disabledIcon={true} id={'feed'} tooltipText={'Feed = (Spindle Speed * Feed * No. of Tooth)'} />
                                            <NumberFieldHookForm
                                                label="Feed(mm/min)"
                                                id={'feed'}
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

                                            <NumberFieldHookForm
                                                label={`Depth of Cut(mm)`}
                                                name={'doc'}
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
                                                errors={errors.doc}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <NumberFieldHookForm
                                                label={`Length/Depth(mm)`}
                                                name={'lengthDepth'}
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
                                                errors={errors.lengthDepth}
                                                disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                            />
                                        </Col>
                                        <Col md="4">
                                            <NumberFieldHookForm
                                                label={`No. of Passes/Holes`}
                                                name={'noOfPasses'}
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
                                                errors={errors.noOfPasses}
                                                disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'total-length-depth'} tooltipText={'Total Length/Depth = (Length / Depth) * (No. of Passes / Holes)'} />
                                            <NumberFieldHookForm
                                                label={`Total Length/Depth(mm)`}
                                                name={'totalLengthDepth'}
                                                id={'total-length-depth'}
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
                                            <TooltipCustom disabledIcon={true} id={'cutting-time'} tooltipText={'Cutting Time = (Total Length per Depth / Feed)'} />
                                            <NumberFieldHookForm
                                                label={`Cutting Time(min)`}
                                                name={'cuttingTimeMins'}
                                                id={'cutting-time'}
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
                                            <NumberFieldHookForm
                                                label={`Chip to Chip Timing(min)`}
                                                name={'chipToChipTiming'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                rules={{
                                                    required: false,
                                                    pattern: {
                                                        value: /^\d{0,4}(\.\d{0,7})?$/i,
                                                        message: 'Maximum length for integer is 4 and for decimal is 7',
                                                    },
                                                }}
                                                mandatory={false}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.chipToChipTiming}
                                                disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <NumberFieldHookForm
                                                label={`Tool non Cutting Time(min)`}
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
                                                label={`Indexing Table Positioning Time(min)`}
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
                                                disabled={props.CostingViewMode ? props.CostingViewMode : false}
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
                                                disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'total-cycle-min'} tooltipText={'Total Cycle Time(Min) = (Cutting Time + Chip to Chip + Tool non-Cutting + Indexing Table + Loading & Unloading)'} />
                                            <NumberFieldHookForm
                                                label={`Total Cycle Time(min)`}
                                                name={'totalCycleTimeMins'}
                                                id={'total-cycle-min'}
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
                                            <TooltipCustom disabledIcon={true} id={'total-cycle-sec'} tooltipText={'Total Cycle Time(Sec) = (Total Cycle Time in Mins * 60)'} />
                                            <NumberFieldHookForm
                                                label={`Total Cycle Time(sec)`}
                                                name={'TotalCycleTimeSec'}
                                                id={'total-cycle-sec'}
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
                                                rules={{
                                                    required: true,
                                                    validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                                    max: {
                                                        value: 100,
                                                        message: 'Percentage cannot be greater than 100'
                                                    },
                                                }}
                                                mandatory={true}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.efficiencyPercentage}
                                                disabled={props.CostingViewMode ? props.CostingViewMode : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TooltipCustom disabledIcon={true} id={'part-hours-pro'} tooltipText={'Parts/Hour = (3600 / Cycle Time) * Efficiency / 100'} />
                                            <NumberFieldHookForm
                                                label={`Parts/Hour`}
                                                name={'partsPerHour'}
                                                id={'part-hours-pro'}
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
                                            <TooltipCustom disabledIcon={true} id={'process-cost-machine'} tooltipText={'Process Cost = (Machine Rate / Parts per Hour)'} />
                                            <NumberFieldHookForm
                                                label={`Process Cost`}
                                                name={'processCost'}
                                                id={'process-cost-machine'}
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
                                className="btn-primary save-btn"
                            >
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







