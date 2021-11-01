import React, { Fragment, useState, useEffect, useContext } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import { clampingTime, feedByMin, findRpm, passesNo, totalMachineTime, } from './CommonFormula'
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId } from '../../../../../helper'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import { saveProcessCostCalculationData } from '../../../actions/CostWorking'
import { toastr } from 'react-redux-toastr'


function Turning(props) {
  const WeightCalculatorRequest = props.calculatorData.WeightCalculatorRequest
  const costData = useContext(costingInfoContext);

  const dispatch = useDispatch()

  const [dataToSend, setDataToSend] = useState({})

  const defaultValues = {
    cutLength: WeightCalculatorRequest && WeightCalculatorRequest.CutLength !== undefined ? WeightCalculatorRequest.CutLength : '',
    removedMaterial: WeightCalculatorRequest && WeightCalculatorRequest.RemovedMaterial !== undefined ? WeightCalculatorRequest.RemovedMaterial : '',
    rpm: WeightCalculatorRequest && WeightCalculatorRequest.Rpm !== undefined ? WeightCalculatorRequest.Rpm : '',
    feedMin: WeightCalculatorRequest && WeightCalculatorRequest.FeedMin !== undefined ? WeightCalculatorRequest.FeedMin : '',
    cutTime: WeightCalculatorRequest && WeightCalculatorRequest.CutTime !== undefined ? WeightCalculatorRequest.CutTime : '',
    numberOfPasses: WeightCalculatorRequest && WeightCalculatorRequest.NumberOfPasses !== undefined ? WeightCalculatorRequest.NumberOfPasses : '',
    clampingPercentage: WeightCalculatorRequest && WeightCalculatorRequest.ClampingPercentage !== undefined ? WeightCalculatorRequest.ClampingPercentage : '',
    clampingValue: WeightCalculatorRequest && WeightCalculatorRequest.ClampingValue !== undefined ? WeightCalculatorRequest.ClampingValue : '',
    turningDiameter: WeightCalculatorRequest && WeightCalculatorRequest.TurningDiameter !== undefined ? WeightCalculatorRequest.TurningDiameter : '',
    finishDiameter: WeightCalculatorRequest && WeightCalculatorRequest.FinishDiameter !== undefined ? WeightCalculatorRequest.FinishDiameter : '',
    turningLength: WeightCalculatorRequest && WeightCalculatorRequest.TurningLength !== undefined ? WeightCalculatorRequest.TurningLength : '',
    cuttingSpeed: WeightCalculatorRequest && WeightCalculatorRequest.CuttingSpeed !== undefined ? WeightCalculatorRequest.CuttingSpeed : '',
    doc: WeightCalculatorRequest && WeightCalculatorRequest.Doc !== undefined ? WeightCalculatorRequest.Doc : '',
    feedRev: WeightCalculatorRequest && WeightCalculatorRequest.FeedRev !== undefined ? WeightCalculatorRequest.FeedRev : '',
    clampingPercentage: WeightCalculatorRequest && WeightCalculatorRequest.ClampingPercentage !== undefined ? WeightCalculatorRequest.ClampingPercentage : ''
  }
  const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors }, } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })
  const fieldValues = useWatch({
    control,
    name: ['turningDiameter', 'finishDiameter', 'turningLength', 'cuttingSpeed', 'doc', 'feedRev', 'clampingPercentage',],
  })

  useEffect(() => {
    onTurningLength()
    onClampingPercantageChange()
    onFinishDiameterChange()
    onDocChange()
    onFeedRevChange()
    onSpeedChange()
  }, [fieldValues])

  const trimValue = getConfigurationKey()
  const trim = trimValue.NoOfDecimalForInputOutput

  const { technology, process, calculateMachineTime } = props
  const [totalMachiningTime, setTotalMachiningTime] = useState(WeightCalculatorRequest && WeightCalculatorRequest.TotalMachiningTime !== undefined ? WeightCalculatorRequest.TotalMachiningTime : '')


  const onTurningLength = () => {
    const cutLength = getValues('turningLength')
    setDataToSend(prevState => ({ ...prevState, cutLength: cutLength }))
    setValue('cutLength', checkForDecimalAndNull(cutLength, trim))
  }

  const onFinishDiameterChange = () => {
    const turningDiameter = getValues('turningDiameter')
    const finishDiameter = getValues('finishDiameter')
    if (!turningDiameter || !finishDiameter) {
      return false
    } else {
      const removedMaterial = (turningDiameter - finishDiameter) / 2
      setDataToSend(prevState => ({ ...prevState, removedMaterial: removedMaterial }))
      setValue('removedMaterial', checkForDecimalAndNull(removedMaterial, trim))
    }
  }
  const onDocChange = () => {
    const removedMaterial = getValues('removedMaterial')
    const doc = getValues('doc')
    const numberOfPasses = passesNo(removedMaterial, doc)
    setValue('numberOfPasses', numberOfPasses)

  }

  const onSpeedChange = () => {
    const turningDiameter = getValues('turningDiameter')
    const finishDiameter = getValues('finishDiameter')
    const cuttingSpeed = getValues('cuttingSpeed')
    const Diameter = (Number(turningDiameter) + Number(finishDiameter)) / 2
    const rpm = findRpm(cuttingSpeed, Diameter)
    if (!rpm) {
      return false
    }
    setDataToSend(prevState => ({ ...prevState, rpm: rpm }))
    setValue('rpm', checkForDecimalAndNull(rpm, trim))
  }
  const onFeedRevChange = () => {
    const feedRev = getValues('feedRev')
    const rpm = getValues('rpm')
    const cutLength = getValues('cutLength')
    const passesNo = getValues('numberOfPasses')
    const feedMin = feedByMin(feedRev, rpm)
    if (!feedMin) {
      return false
    }
    const tCut = checkForNull((cutLength * passesNo) / feedMin)
    if (!tCut) {
      return false
    }

    setDataToSend(prevState => ({ ...prevState, feedMin: feedMin, tCut: tCut }))
    setValue('feedMin', checkForDecimalAndNull(feedMin, trim))
    setValue('cutTime', checkForDecimalAndNull(tCut, trim))
  }
  const onClampingPercantageChange = () => {
    const tcut = Number(getValues('cutTime'))
    const clampingPercentage = getValues('clampingPercentage')
    const clampingValue = clampingTime(tcut, clampingPercentage)
    if (!clampingValue) {
      return false
    }
    const totalMachiningTime = totalMachineTime(tcut, clampingValue)
    setDataToSend(prevState => ({ ...prevState, clampingValue: clampingValue }))
    setValue('clampingValue', checkForDecimalAndNull(clampingValue, trim))
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
    obj.RemovedMaterial = dataToSend.removedMaterial
    obj.Rpm = dataToSend.rpm
    obj.FeedMin = dataToSend.feedMin
    obj.CutTime = value.tCut
    obj.NumberOfPasses = value.numberOfPasses
    obj.ClampingPercentage = value.clampingPercentage
    obj.ClampingValue = dataToSend.clampingValue
    obj.TurningDiameter = value.turningDiameter
    obj.FinishDiameter = value.finishDiameter
    obj.TurningLength = value.turningLength
    obj.CuttingSpeed = value.cuttingSpeed
    obj.Doc = value.doc
    obj.FeedRev = value.feedRev
    obj.MachineRate = props.calculatorData.MHR
    obj.ProcessCost = (totalMachiningTime / 60) * props.calculatorData.MHR
    obj.TotalMachiningTime = totalMachiningTime
    dispatch(saveProcessCostCalculationData(obj, res => {
      if (res.data.Result) {
        obj.ProcessCalculationId = res.data.Identity
        toastr.success('Calculation saved sucessfully.')
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
                <Col md="10">
                  <div className="left-border">{'Distance:'}</div>
                </Col>
                <Col md="12">
                  <Row className={'mt15'}>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Turning Diameter(mm)`}
                        name={'turningDiameter'}
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
                        errors={errors.turningDiameter}
                        disabled={props.CostingViewMode ? true : false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Finish Diameter(mm)`}
                        name={'finishDiameter'}
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
                        errors={errors.finishDiameter}
                        disabled={props.CostingViewMode ? true : false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Turning Length(mm)`}
                        name={'turningLength'}
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
                        errors={errors.turningLength}
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
                        handleChange={onFinishDiameterChange}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.cutLength}
                        disabled={true}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Material To be Removed`}
                        name={'removedMaterial'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.removedMaterial}
                        disabled={true}
                      />
                    </Col>

                    <Col md="3">
                      <TextFieldHookForm
                        label={`Depth of Cut(mm)`}
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
                        label={`No. of Passes`}
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

                <Col md="10 mt-25">
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
                        label={`Feed/Rev`}
                        name={'feedRev'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                          required: true,
                          pattern: {
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: 'Invalid Number.'
                          },
                          // maxLength: 4,
                        }}
                        handleChange={onFeedRevChange}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.feedRev}
                        disabled={props.CostingViewMode ? true : false}
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
                        rules={{
                          required: false,
                          // pattern: {
                          //   value: /^[0-9]*$/i,
                          //   message: 'Invalid Number.'
                          // },
                          // maxLength: 4,
                        }}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.clampingValue}
                        disabled={true}
                      />
                    </Col>
                    <Col md="3"></Col>
                  </Row>
                </Col>

                <div className="bluefooter-butn border row">
                  <div className="col-sm-8">Total Machining Time </div>
                  <span className="col-sm-4 text-right">
                    {totalMachiningTime === '0.00' ? totalMachiningTime : checkForDecimalAndNull(totalMachiningTime, trim)}{' '} min
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
              <button type="submit" className="btn-primary save-btn" disabled={props.CostingViewMode ? true : false}><div className={"save-icon"}></div>{'SAVE'}</button>
            </div>
          </form>
        </Col>
      </Row>
    </Fragment>
  )
}

export default Turning
