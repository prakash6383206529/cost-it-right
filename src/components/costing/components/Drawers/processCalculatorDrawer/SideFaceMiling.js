import React, { useState, useEffect, Fragment, useContext } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import { clampingTime, feedByMin, findRpm, passesNo, totalMachineTime, } from './CommonFormula'
import { checkForDecimalAndNull, getConfigurationKey, loggedInUserId } from '../../../../../helper'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import { saveProcessCostCalculationData } from '../../../actions/CostWorking'
import Toaster from '../../../../common/Toaster'


function SideFaceMiling(props) {
  const WeightCalculatorRequest = props.calculatorData.WeightCalculatorRequest
  const costData = useContext(costingInfoContext);

  const dispatch = useDispatch()

  const defaultValues = {
    cutLength: WeightCalculatorRequest && WeightCalculatorRequest.CutLength !== undefined ? WeightCalculatorRequest.CutLength : '',
    rpm: WeightCalculatorRequest && WeightCalculatorRequest.Rpm !== undefined ? WeightCalculatorRequest.Rpm : '',
    feedRev: WeightCalculatorRequest && WeightCalculatorRequest.FeedRev !== undefined ? WeightCalculatorRequest.FeedRev : '',
    feedMin: WeightCalculatorRequest && WeightCalculatorRequest.FeedMin !== undefined ? WeightCalculatorRequest.FeedMin : '',
    cutTime: WeightCalculatorRequest && WeightCalculatorRequest.CutTime !== undefined ? WeightCalculatorRequest.CutTime : '',
    numberOfPasses: WeightCalculatorRequest && WeightCalculatorRequest.NumberOfPasses !== undefined ? WeightCalculatorRequest.NumberOfPasses : '',
    clampingPercentage: WeightCalculatorRequest && WeightCalculatorRequest.ClampingPercentage !== undefined ? WeightCalculatorRequest.ClampingPercentage : '',
    clampingValue: WeightCalculatorRequest && WeightCalculatorRequest.ClampingValue !== undefined ? WeightCalculatorRequest.ClampingValue : '',
    cutterDiameter: WeightCalculatorRequest && WeightCalculatorRequest.CutterDiameter !== undefined ? WeightCalculatorRequest.CutterDiameter : '',
    cutLengthOfArea: WeightCalculatorRequest && WeightCalculatorRequest.CutLengthOfArea !== undefined ? WeightCalculatorRequest.CutLengthOfArea : '',
    areaWidth: WeightCalculatorRequest && WeightCalculatorRequest.AreaWidth !== undefined ? WeightCalculatorRequest.AreaWidth : '',
    removedMaterial: WeightCalculatorRequest && WeightCalculatorRequest.RemovedMaterial !== undefined ? WeightCalculatorRequest.RemovedMaterial : '',
    doc: WeightCalculatorRequest && WeightCalculatorRequest.Doc !== undefined ? WeightCalculatorRequest.Doc : '',
    cuttingSpeed: WeightCalculatorRequest && WeightCalculatorRequest.CuttingSpeed !== undefined ? WeightCalculatorRequest.CuttingSpeed : '',
    toothFeed: WeightCalculatorRequest && WeightCalculatorRequest.ToothFeed !== undefined ? WeightCalculatorRequest.ToothFeed : '',
    clampingPercentage: WeightCalculatorRequest && WeightCalculatorRequest.ClampingPercentage !== undefined ? WeightCalculatorRequest.ClampingPercentage : ''
  }
  const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors }, } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })
  const fieldValues = useWatch({
    control,
    name: ['cutterDiameter', 'cutLengthOfArea', 'areaWidth', 'removedMaterial', 'doc', 'cuttingSpeed', 'toothFeed', 'clampingPercentage',],
  })

  useEffect(() => {
    onClampingPercantageChange()
    onDocChange()
    onWidthChange()
    onToothFeedChange()
    onSpeedChange()
  }, [fieldValues])


  const trim = getConfigurationKey().NoOfDecimalForInputOutput
  const { technology, process, calculateMachineTime } = props
  const [totalMachiningTime, setTotalMachiningTime] = useState('')
  const [dataToSend, setDataToSend] = useState({})

  useEffect(() => {
    const toothNo = 3 // Need to make it dynamic from API
    setValue('toothNo', toothNo)
  }, [])

  const onDocChange = (e) => {
    const removedMaterial = getValues('removedMaterial')
    const doc = getValues('doc')
    const numberOfPasses = passesNo(removedMaterial, doc)

    setValue('numberOfPasses', numberOfPasses)
  }


  const onSpeedChange = (e) => {
    const cutterDiameter = getValues('cutterDiameter')
    const cuttingSpeed = getValues('cuttingSpeed')
    const rpm = findRpm(cuttingSpeed, cutterDiameter)

    setDataToSend(prevState => ({ ...prevState, rpm: rpm }))
    setValue('rpm', checkForDecimalAndNull(rpm, trim))
  }

  const onToothFeedChange = (e) => {
    const toothNo = getValues('toothNo')
    const rpm = getValues('rpm')
    const cutLength = getValues('cutLength')
    const numberOfPasses = getValues('numberOfPasses')
    const toothFeed = getValues('toothFeed')
    const feedRev = toothNo * toothFeed
    if (!feedRev) {
      return ''
    }
    setValue('feedRev', checkForDecimalAndNull(feedRev, trim))
    const feedMin = feedByMin(feedRev, rpm)
    setValue('feedMin', checkForDecimalAndNull(feedMin, trim))
    const tCut = (cutLength / feedMin) * numberOfPasses
    setValue('cutTime', checkForDecimalAndNull(tCut, trim))
    setDataToSend(prevState => ({ ...prevState, feedRev: feedRev, feedMin: feedMin, tCut: tCut }))
  }

  const onWidthChange = (e) => {
    const cutLengthOfArea = Number(getValues('cutLengthOfArea'))
    const areaWidth = Number(getValues('areaWidth'))
    const cutLength = (cutLengthOfArea + areaWidth) * 2
    if (!cutLength || !cutLengthOfArea || !areaWidth) {
      return ''
    }

    setTimeout(() => {
      setValue('cutLength', checkForDecimalAndNull(cutLength, trim))
    }, 500);
    setDataToSend(prevState => ({ ...prevState, cutLength: cutLength }))
  }

  const onClampingPercantageChange = (e) => {
    const tcut = Number(getValues('cutTime'))
    const clampingPercentage = getValues('clampingPercentage')
    const clampingValue = clampingTime(tcut, clampingPercentage)
    const totalMachiningTime = totalMachineTime(tcut, clampingValue)
    setValue('clampingValue', checkForDecimalAndNull(clampingValue, trim))
    setDataToSend(prevState => ({ ...prevState, clampingValue: clampingValue }))
    setTotalMachiningTime(totalMachiningTime)
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
    obj.CutLength = dataToSend.cutLength
    obj.Rpm = dataToSend.rpm
    obj.FeedRev = dataToSend.feedRev
    obj.FeedMin = dataToSend.feedMin
    obj.CutTime = dataToSend.tCut
    obj.NumberOfPasses = value.numberOfPasses
    obj.ClampingPercentage = value.clampingPercentage
    obj.ClampingValue = dataToSend.clampingValue
    obj.CutterDiameter = value.cutterDiameter
    obj.CutLengthOfArea = value.cutLengthOfArea
    obj.AreaWidth = value.areaWidth
    obj.RemovedMaterial = value.removedMaterial
    obj.Doc = value.doc
    obj.CuttingSpeed = value.cuttingSpeed
    obj.ToothFeed = value.toothFeed
    obj.ToothNo = value.toothNo
    obj.MachineRate = props.calculatorData.MHR
    obj.ProcessCost = totalMachiningTime * props.calculatorData.MHR
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
            <Col md="12" className={'mt25'}>
              <div className="border pl-3 pr-3 pt-3">
                <Col md="12">
                  <div className="left-border">{'Distance:'}</div>
                </Col>
                <Col md="12">
                  <Row className={'mt15'}>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Cutter Diameter(mm)`}
                        name={'cutterDiameter'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                          required: true,
                          pattern: {
                            //value: /^[0-9]*$/i,
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: 'Invalid Number.',
                          },
                          // maxLength: 4,
                        }}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.cutterDiameter}
                        disabled={props.CostingViewMode ? true : false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Length of Area Cut(mm)`}
                        name={'cutLengthOfArea'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                          required: true,
                          pattern: {
                            //value: /^[0-9]*$/i,
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: 'Invalid Number.',
                          },
                          // maxLength: 4,
                        }}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.cutLengthOfArea}
                        disabled={props.CostingViewMode ? true : false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Width of area to cut(mm)`}
                        name={'areaWidth'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                          required: true,
                          pattern: {
                            //value: /^[0-9]*$/i,
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: 'Invalid Number.',
                          },
                          // maxLength: 4,
                        }}
                        handleChange={onWidthChange}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.areaWidth}
                        disabled={props.CostingViewMode ? true : false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Cut Length(mm)`}
                        name={'cutLength'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.cutLength}
                        disabled={true}
                      />
                    </Col>
                  </Row>

                  <Row>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Material To be removed`}
                        name={'removedMaterial'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                          required: true,
                          pattern: {
                            //value: /^[0-9]*$/i,
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: 'Invalid Number.',
                          },
                          // maxLength: 4,
                        }}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.removedMaterial}
                        disabled={props.CostingViewMode ? true : false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Depth of cut(mm)`}
                        name={'doc'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                          required: false,
                          pattern: {
                            //value: /^[0-9]*$/i,
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: 'Invalid Number.',
                          },
                          // maxLength: 4,
                        }}
                        handleChange={onDocChange}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.doc}
                        disabled={props.CostingViewMode ? true : false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label="No. of Passes(mm)"
                        name={'numberOfPasses'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.numberOfPasses}
                        disabled={true}
                      />
                    </Col>
                  </Row>
                </Col>

                <Col md="12 mt-25">
                  <div className="left-border">{'Speed:'}</div>
                </Col>
                <Col md="12">
                  <Row className={'mt15'}>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Cutting Speed(m/sec)`}
                        name={'cuttingSpeed'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                          required: true,
                          pattern: {
                            //value: /^[0-9]*$/i,
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: 'Invalid Number.',
                          },
                          // maxLength: 4,
                        }}
                        handleChange={onSpeedChange}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.cuttingSpeed}
                        disabled={props.CostingViewMode ? true : false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`RPM`}
                        name={'rpm'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.rpm}
                        disabled={true}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`No. of Teeth on Cutter`}
                        name={'toothNo'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.toothNo}
                        disabled={true}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Feed/ Tooth`}
                        name={'toothFeed'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                          required: false,
                          pattern: {
                            value: /^[0-9\b]+$/i,
                            message: 'Invalid Number.',
                          },
                          // maxLength: 4,
                        }}
                        handleChange={onToothFeedChange}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.toothFeed}
                        disabled={props.CostingViewMode ? true : false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Feed/Rev`}
                        name={'feedRev'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.feedRev}
                        disabled={true}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Feed/Min(mm/min)`}
                        name={'feedMin'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.feedMin}
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
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Total Cut time (min)`}
                        name={'cutTime'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.cutTime}
                        disabled={true}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Additional Time(%)`}
                        name={'clampingPercentage'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                          required: true,
                          pattern: {
                            //value: /^[0-9]*$/i,
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: 'Invalid Number.',
                          },
                          // maxLength: 4,
                        }}
                        handleChange={onClampingPercantageChange}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.clampingPercentage}
                        disabled={props.CostingViewMode ? true : false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Additional Time(min)`}
                        name={'clampingValue'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.clampingValue}
                        disabled={true}
                      />
                    </Col>
                  </Row>
                </Col>
                <div className="bluefooter-butn border row">
                  Total Machining Time{' '}
                  <span className="col-sm-12 text-right">
                    {totalMachiningTime === '0.00' ? totalMachiningTime : checkForDecimalAndNull(totalMachiningTime, trim)}{' '}  min
                  </span>
                </div>
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
                type="submit"
                // disabled={isSubmitted ? true : false}
                disabled={props.CostingViewMode ? true : false}
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

export default SideFaceMiling
