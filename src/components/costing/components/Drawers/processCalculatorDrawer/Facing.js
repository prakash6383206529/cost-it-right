import React, { Fragment, useState, useEffect, useContext } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import { clampingTime, feedByMin, findRpm, passesNo, totalMachineTime, } from './CommonFormula'
import { checkForDecimalAndNull, getConfigurationKey, trimDecimalPlace, loggedInUserId } from '../../../../../helper'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import { saveProcessCostCalculationData } from '../../../actions/CostWorking'
import { toastr } from 'react-redux-toastr'


function Facing(props) {
  const { calculateMachineTime } = props
  const WeightCalculatorRequest = props.calculatorData.WeightCalculatorRequest
  const costData = useContext(costingInfoContext);

  const dispatch = useDispatch()


  const defaultValues = {
    cutLength: WeightCalculatorRequest && WeightCalculatorRequest.CutLength !== undefined ? WeightCalculatorRequest.CutLength : '',
    rpm: WeightCalculatorRequest && WeightCalculatorRequest.Rpm !== undefined ? WeightCalculatorRequest.Rpm : '',
    feedMin: WeightCalculatorRequest && WeightCalculatorRequest.FeedMin !== undefined ? WeightCalculatorRequest.FeedMin : '',
    cutTime: WeightCalculatorRequest && WeightCalculatorRequest.CutTime !== undefined ? WeightCalculatorRequest.CutTime : '',
    numberOfPasses: WeightCalculatorRequest && WeightCalculatorRequest.NumberOfPasses !== undefined ? WeightCalculatorRequest.NumberOfPasses : '',
    clampingPercentage: WeightCalculatorRequest && WeightCalculatorRequest.ClampingPercentage !== undefined ? WeightCalculatorRequest.ClampingPercentage : '',
    clampingValue: WeightCalculatorRequest && WeightCalculatorRequest.ClampingValue !== undefined ? WeightCalculatorRequest.ClampingValue : '',
    turningDiameter: WeightCalculatorRequest && WeightCalculatorRequest.TurningDiameter !== undefined ? WeightCalculatorRequest.TurningDiameter : '',
    finishDiameter: WeightCalculatorRequest && WeightCalculatorRequest.FinishDiameter !== undefined ? WeightCalculatorRequest.FinishDiameter : '',
    removedMaterial: WeightCalculatorRequest && WeightCalculatorRequest.RemovedMaterial !== undefined ? WeightCalculatorRequest.RemovedMaterial : '',
    cuttingSpeed: WeightCalculatorRequest && WeightCalculatorRequest.CuttingSpeed !== undefined ? WeightCalculatorRequest.CuttingSpeed : '',
    doc: WeightCalculatorRequest && WeightCalculatorRequest.Doc !== undefined ? WeightCalculatorRequest.Doc : '',
    feedRev: WeightCalculatorRequest && WeightCalculatorRequest.FeedRev !== undefined ? WeightCalculatorRequest.FeedRev : '',
    clampingPercentage: WeightCalculatorRequest && WeightCalculatorRequest.ClampingPercentage !== undefined ? WeightCalculatorRequest.ClampingPercentage : '',
    clampingValue: WeightCalculatorRequest && WeightCalculatorRequest.ClampingValue !== undefined ? WeightCalculatorRequest.ClampingValue : '',
  }

  const { register, handleSubmit, control, setValue, getValues, formState: { errors }, } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })
  const fieldValues = useWatch({
    control,
    name: ['turningDiameter', 'finishDiameter', 'removedMaterial', 'cuttingSpeed', 'doc', 'feedRev', 'clampingPercentage',],
  })

  useEffect(() => {
    onClampingPercantageChange()
    onFinishDiameterChange()
    onDocChange()
    onFeedRevChange()
    onSpeedChange()
  }, [fieldValues])


  const [totalMachiningTime, setTotalMachiningTime] = useState(WeightCalculatorRequest && WeightCalculatorRequest.TotalMachiningTime !== undefined ? WeightCalculatorRequest.TotalMachiningTime : '')
  const isEditFlag = WeightCalculatorRequest ? true : false
  const trim = getConfigurationKey().NoOfDecimalForInputOutput
  const [dataToSend, setDataToSend] = useState({})


  const onFinishDiameterChange = (e) => {
    const turningDiameter = getValues('turningDiameter')
    const finishDiameter = getValues('finishDiameter')
    const cutLength = (turningDiameter - finishDiameter) / 2
    if (!turningDiameter || !finishDiameter || cutLength) {
      return ''
    }
    setDataToSend(prevState => ({ ...prevState, cutLength: cutLength }))
    setValue('cutLength', checkForDecimalAndNull(cutLength, trim))
  }

  const onDocChange = (e) => {
    const removedMaterial = getValues('removedMaterial')
    const doc = getValues('doc')
    const numberOfPasses = passesNo(removedMaterial, doc)
    setValue('numberOfPasses', numberOfPasses)
  }

  const onSpeedChange = (e) => {
    const turningDiameter = getValues('turningDiameter')
    const finishDiameter = getValues('finishDiameter')
    const cuttingSpeed = getValues('cuttingSpeed')
    const Diameter = (Number(turningDiameter) + Number(finishDiameter)) / 2
    const rpm = findRpm(cuttingSpeed, Diameter)
    setDataToSend(prevState => ({ ...prevState, rpm: rpm }))
    setValue('rpm', checkForDecimalAndNull(rpm, trim))
  }
  const onFeedRevChange = (e) => {
    const feedRev = getValues('feedRev')
    const rpm = getValues('rpm')
    const cutLength = getValues('cutLength')
    const passesNo = getValues('numberOfPasses')
    const feedMin = feedByMin(feedRev, rpm)
    if (!feedMin) {
      return ''
    }
    const tCut = (cutLength * passesNo) / feedMin
    setDataToSend(prevState => ({ ...prevState, feedMin: feedMin, tCut: tCut }))
    setValue('feedMin', checkForDecimalAndNull(feedMin, trim))
    setValue('cutTime', checkForDecimalAndNull(tCut, trim))
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

  const onSubmit = (formValue) => {
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
    obj.TurningDiameter = formValue.turningDiameter
    obj.FinishDiameter = formValue.finishDiameter
    obj.CutLength = formValue.cutLength
    obj.RemovedMaterial = formValue.removedMaterial
    obj.Rpm = dataToSend.rpm
    obj.FeedRev = formValue.feedRev
    obj.FeedMin = dataToSend.feedMin
    obj.CutTime = dataToSend.tcut
    obj.NumberOfPasses = formValue.numberOfPasses
    obj.ClampingPercentage = formValue.clampingPercentage
    obj.ClampingValue = dataToSend.clampingValue
    obj.CuttingSpeed = formValue.cuttingSpeed
    obj.Doc = formValue.doc
    obj.TotalMachiningTime = totalMachiningTime
    obj.MachineRate = props.calculatorData.MHR
    obj.ProcessCost = (totalMachiningTime / 60) * props.calculatorData.MHR
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
            <Col md="12" className={''}>
              <div className="border pl-3 pr-3 pt-3">
                <Col md="10">
                  <div className="left-border">{'Distance:'}</div>
                </Col>
                <Col md="12">
                  <Row className={'mt15'}>
                    <Col md="4">
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
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: 'Invalid Number.',
                          },
                        }}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.turningDiameter}
                        disabled={false}
                      />
                    </Col>
                    <Col md="4">
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
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: 'Invalid Number.',
                          },
                        }}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.finishDiameter}
                        disabled={false}
                      />
                    </Col>
                    <Col md="4">
                      <TextFieldHookForm
                        label={`Cut Length(mm)`}
                        name={'cutLength'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
                        rules={{
                          required: true,
                          pattern: {
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: 'Invalid Number.',
                          },
                        }}
                        handleChange={onFinishDiameterChange}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.cutLength}
                        disabled={false}
                      />
                    </Col>
                    <Col md="4">
                      <TextFieldHookForm
                        label={`Material To be Removed`}
                        name={'removedMaterial'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={true}
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
                        errors={errors.removedMaterial}
                        disabled={false}
                      />
                    </Col>
                  </Row>

                  <Row>
                    <Col md="4">
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
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: 'Invalid Number.',
                          },
                        }}
                        handleChange={onDocChange}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.doc}
                        disabled={false}
                      />
                    </Col>
                    <Col md="4">
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
                    <Col md="4">
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
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: 'Invalid Number.',
                          },
                        }}
                        handleChange={onSpeedChange}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.cuttingSpeed}
                        disabled={false}
                      />
                    </Col>
                    <Col md="4">
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

                    <Col md="4">
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
                        }}
                        handleChange={onFeedRevChange}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.feedRev}
                        disabled={false}
                      />
                    </Col>
                    <Col md="4">
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
                    <Col md="4">
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
                    <Col md="4">
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
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: 'Invalid Number.',
                          },
                        }}
                        handleChange={onClampingPercantageChange}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.clampingPercentage}
                        disabled={false}
                      />
                    </Col>
                    <Col md="4">
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
                    <Col md="4"></Col>
                  </Row>
                </Col>

                <div className="bluefooter-butn border row">
                  <div className="col-sm-8">Total Machining Time </div>
                  <span className="col-sm-4 text-right">
                    {totalMachiningTime === '0.00'
                      ? totalMachiningTime
                      : checkForDecimalAndNull(totalMachiningTime, trim)}{' '}
                    min
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
                className="btn-primary save-btn"
              >
                <div className={'check-icon'}>
                  <img src={require("../../../../../assests/images/check.png")} alt="check-icon.jpg" />
                </div>
                {isEditFlag ? 'UPDATE' : 'SAVE'}
              </button>
            </div>
          </form>
        </Col>
      </Row>
    </Fragment>
  )
}

export default Facing
