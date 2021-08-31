import React, { Fragment, useState, useEffect, useContext } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import { checkForDecimalAndNull, getConfigurationKey, loggedInUserId } from '../../../../../helper'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import { clampingTime, feedByMin, totalMachineTime } from './CommonFormula'
import { saveProcessCostCalculationData } from '../../../actions/CostWorking'
import { toastr } from 'react-redux-toastr'

function Drilling(props) {
  const WeightCalculatorRequest = props.calculatorData.WeightCalculatorRequest
  const costData = useContext(costingInfoContext);

  const dispatch = useDispatch()

  const defaultValues = {
    clampingPercentage: WeightCalculatorRequest && WeightCalculatorRequest.ClampingPercentage !== undefined ? WeightCalculatorRequest.ClampingPercentage : '',
    clampingValue: WeightCalculatorRequest && WeightCalculatorRequest.ClampingValue !== undefined ? WeightCalculatorRequest.ClampingValue : '',
    cutLength: WeightCalculatorRequest && WeightCalculatorRequest.CutLength !== undefined ? WeightCalculatorRequest.CutLength : '',
    cutTime: WeightCalculatorRequest && WeightCalculatorRequest.TotalCutTime !== undefined ? WeightCalculatorRequest.TotalCutTime : '',
    cuttingSpeed: WeightCalculatorRequest && WeightCalculatorRequest.CuttingSpeed !== undefined ? WeightCalculatorRequest.CuttingSpeed : '',
    feedMin: WeightCalculatorRequest && WeightCalculatorRequest.FeedMin !== undefined ? WeightCalculatorRequest.FeedMin : '',
    feedRev: WeightCalculatorRequest && WeightCalculatorRequest.FeedRev !== undefined ? WeightCalculatorRequest.FeedRev : '',
    removedMaterial: WeightCalculatorRequest && WeightCalculatorRequest.RemovedMaterial !== undefined ? WeightCalculatorRequest.RemovedMaterial : '',
    rpm: WeightCalculatorRequest && WeightCalculatorRequest.Rpm !== undefined ? WeightCalculatorRequest.Rpm : '',
    turningDiameter: WeightCalculatorRequest && WeightCalculatorRequest.TurningDiameter !== undefined ? WeightCalculatorRequest.TurningDiameter : '',
    turningLength: WeightCalculatorRequest && WeightCalculatorRequest.TurningLength !== undefined ? WeightCalculatorRequest.TurningLength : '',
  }
  const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors }, } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })
  const fieldValues = useWatch({
    control,
    name: ['clampingPercentage', 'turningDiameter', 'turningLength', 'cutLength', 'removedMaterial', 'cuttingSpeed', 'feedRev',],
  })

  useEffect(() => {
    onClampingPercantageChange()
    onFeedRevChange()
    onSpeedChange()
  }, [fieldValues])

  const trim = getConfigurationKey().NoOfDecimalForInputOutput
  const { calculateMachineTime } = props
  const [totalMachiningTime, setTotalMachiningTime] = useState(WeightCalculatorRequest && WeightCalculatorRequest.TotalMachiningTime !== undefined ? WeightCalculatorRequest.TotalMachiningTime : '')
  const [dataToSend, setDataToSend] = useState({})


  const onSpeedChange = () => {
    const turningDiameter = getValues('turningDiameter')
    const cuttingSpeed = getValues('cuttingSpeed')
    const rpm = 3.8197 / (turningDiameter * cuttingSpeed)
    setDataToSend(prevState => ({ ...prevState, rpm: rpm }))
    setValue('rpm', checkForDecimalAndNull(rpm, trim))
  }

  const onFeedRevChange = () => {
    const feedRev = getValues('feedRev')
    const rpm = getValues('rpm')
    const removedMaterial = getValues('removedMaterial')
    const feedMin = feedByMin(feedRev, rpm)
    const tCut = removedMaterial / feedMin
    setValue('feedMin', checkForDecimalAndNull(feedMin, trim))
    setValue('cutTime', checkForDecimalAndNull(tCut, trim))
    setDataToSend(prevState => ({ ...prevState, feedMin: feedMin, tCut: tCut }))

  }
  const onClampingPercantageChange = () => {
    const tcut = Number(getValues('cutTime'))
    const clampingPercentage = getValues('clampingPercentage')
    const clampingValue = clampingTime(tcut, clampingPercentage)
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
    obj.ClampingPercentage = value.clampingPercentage
    obj.ClampingValue = dataToSend.clampingValue
    obj.CutLength = value.cutLength
    obj.TotalCutTime = dataToSend.tCut
    obj.CuttingSpeed = value.cuttingSpeed
    obj.FeedMin = dataToSend.feedMin
    obj.FeedRev = value.feedRev
    obj.RemovedMaterial = value.removedMaterial
    obj.Rpm = dataToSend.rpm
    obj.TurningDiameter = value.turningDiameter
    obj.TurningLength = value.turningLength
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
                        label={`Drilling Diameter(mm)`}
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
                        errors={errors.OuterDiameter}
                        disabled={false}
                      />
                    </Col>
                    <Col md="4">
                      <TextFieldHookForm
                        label={`Turning/Drilling Length(mm)`}
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
                          required: false,
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
                        errors={errors.cutLength}
                        disabled={false}
                      />
                    </Col>
                    <Col md="4">
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
                        errors={errors.PartLength}
                        disabled={false}
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
                          required: false,
                          pattern: {
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: 'Invalid Number.',
                          },
                          // maxLength: 4,
                        }}
                        handleChange={() => { }}
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
              <button onClick={onCancel} type="submit" value="CANCEL" className="reset mr15 cancel-btn" >
                <div className={'cancel-icon'}></div> CANCEL </button>
              <button type="submit" className="btn-primary save-btn" >
                <div className={'save-icon'}></div> {'SAVE'}
              </button>
            </div>
          </form>
        </Col>
      </Row>
    </Fragment>
  )
}

export default Drilling
