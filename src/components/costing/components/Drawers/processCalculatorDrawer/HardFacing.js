import React, { Fragment, useState, useEffect, useContext } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId, } from '../../../../../helper'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import { saveMachiningProcessCostCalculationData } from '../../../actions/CostWorking'
import Toaster from '../../../../common/Toaster'

function HardFacing(props) {
    const WeightCalculatorRequest = props.calculatorData.WeightCalculatorRequest
    const costData = useContext(costingInfoContext);
    const dispatch = useDispatch()
    const [dataToSend, setDataToSend] = useState({ ...WeightCalculatorRequest })

    const defaultValues = {
        startDiameter: WeightCalculatorRequest && WeightCalculatorRequest.StartDiameter !== undefined ? WeightCalculatorRequest.StartDiameter : '',
        endDiameter: WeightCalculatorRequest && WeightCalculatorRequest.EndDiameter !== undefined ? WeightCalculatorRequest.EndDiameter : '',
        facingStock: WeightCalculatorRequest && WeightCalculatorRequest.FacingStock !== undefined ? WeightCalculatorRequest.FacingStock : '',
        doc: WeightCalculatorRequest && WeightCalculatorRequest.Doc !== undefined ? WeightCalculatorRequest.Doc : '',
        cuttingSpeed: WeightCalculatorRequest && WeightCalculatorRequest.CuttingSpeed !== undefined ? WeightCalculatorRequest.CuttingSpeed : '',
        spindleSpeed: WeightCalculatorRequest && WeightCalculatorRequest.SpindleSpeed !== undefined ? WeightCalculatorRequest.SpindleSpeed : '',
        feed: WeightCalculatorRequest && WeightCalculatorRequest.Feed !== undefined ? WeightCalculatorRequest.Feed : '',
        noOfPass: WeightCalculatorRequest && WeightCalculatorRequest.NoOfPass !== undefined ? WeightCalculatorRequest.NoOfPass : '',
        cuttingTime: WeightCalculatorRequest && WeightCalculatorRequest.CuttingTimeMins !== undefined ? WeightCalculatorRequest.CuttingTimeMins : '',
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
        name: ['startDiameter', 'endDiameter', 'facingStock', 'doc', 'cuttingSpeed', 'feed', 'chipToChipTiming', 'totalNonCuttingTime', 'indexingTablePositioningTime', 'loadingAndUnloadingTime', 'efficiencyPercentage', 'doc', 'cuttingSpeed', 'toothFeed', 'clampingPercentage', 'toothNo'],
    })

    useEffect(() => {
        setSpindleSpeed()
        setTotalCycleTimeMins()   //totalCycleTimeMins
        setPartsPerHour()    //partsPerHour
    }, [fieldValues])

    const trim = getConfigurationKey().NoOfDecimalForInputOutput
    const { technology, process, calculateMachineTime } = props
    const [totalMachiningTime, setTotalMachiningTime] = useState(WeightCalculatorRequest && WeightCalculatorRequest.TotalMachiningTime !== undefined ? WeightCalculatorRequest.TotalMachiningTime : '')

    const setSpindleSpeed = () => {
        const cuttingSpeed = Number(getValues('cuttingSpeed'))
        const startDiameter = Number(getValues('startDiameter'))
        const facingStock = Number(getValues('facingStock'))
        const doc = Number(getValues('doc'))
        const spindleSpeed = (1000 * checkForNull(cuttingSpeed)) / (3.14 * checkForNull(startDiameter))
        setDataToSend(prevState => ({ ...prevState, spindleSpeed: spindleSpeed }))
        setValue('spindleSpeed', checkForDecimalAndNull(spindleSpeed, getConfigurationKey().NoOfDecimalForInputOutput))
        const noOfPass = Math.ceil(checkForNull(facingStock) / checkForNull(doc))
        setDataToSend(prevState => ({ ...prevState, noOfPass: noOfPass }))
        setValue('noOfPass', checkForDecimalAndNull(noOfPass, getConfigurationKey().NoOfDecimalForInputOutput))
        setDataToSend(prevState => ({ ...prevState, cuttingTimeMins: 1 }))
        setValue('cuttingTime', checkForDecimalAndNull(1, getConfigurationKey().NoOfDecimalForInputOutput))
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
        const processCost = (props?.calculatorData?.MHR) / partsPerHour
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
        obj.StartDiameter = value.startDiameter
        obj.EndDiameter = value.endDiameter
        obj.FacingStock = value.facingStock
        obj.Doc = value.doc
        obj.CuttingSpeed = value.cuttingSpeed
        obj.SpindleSpeed = value.spindleSpeed
        obj.Feed = value.feed
        obj.NoOfPass = dataToSend.noOfPass
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
                                                label={`Start Diameter(mm)`}
                                                name={'startDiameter'}
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
                                                errors={errors.startDiameter}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TextFieldHookForm
                                                label={`End Diameter(mm)`}
                                                name={'endDiameter'}
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
                                                errors={errors.endDiameter}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TextFieldHookForm
                                                label={`Facing Stock`}
                                                name={'facingStock'}
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
                                                errors={errors.facingStock}
                                                disabled={false}
                                            />
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col md="4">
                                            <TextFieldHookForm
                                                label={`Depth Of Cut(mm)`}
                                                name={'doc'}
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
                                                errors={errors.doc}
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
                                                label="Spindle Speed"
                                                name={'spindleSpeed'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.spindleSpeed}
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
                                                label={`Feed`}
                                                name={'feed'}
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
                                                errors={errors.feed}
                                                disabled={props.CostingViewMode ? true : false}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TextFieldHookForm
                                                label={`No of Pass`}
                                                name={'noOfPass'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.noOfPass}
                                                disabled={true}
                                            />
                                        </Col>

                                        <Col md="4">
                                            <TextFieldHookForm
                                                label={`Cutting Time(min)`}
                                                name={'cuttingTime'}
                                                Controller={Controller}
                                                control={control}
                                                register={register}
                                                mandatory={false}
                                                handleChange={() => { }}
                                                defaultValue={''}
                                                className=""
                                                customClassName={'withBorder'}
                                                errors={errors.cuttingTime}
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
                                                label={`Total Cycle Time (sec)`}
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

export default HardFacing







