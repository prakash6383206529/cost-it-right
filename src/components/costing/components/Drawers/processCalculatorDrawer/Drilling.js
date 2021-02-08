import React, { Fragment, useState, useEffect } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  SearchableSelectHookForm,
  TextFieldHookForm,
} from '../../../../layout/HookFormInputs'
import {
  checkForDecimalAndNull,
  getConfigurationKey,
} from '../../../../../helper'
import { clampingTime, feedByMin, totalMachineTime } from './CommonFormula'

function Drilling(props) {
  const WeightCalculatorRequest = props.calculatorData.WeightCalculatorRequest
  const defaultValues = {
    clampingPercentage: WeightCalculatorRequest &&
      WeightCalculatorRequest.ClampingPercentage !== undefined
      ? WeightCalculatorRequest.ClampingPercentage
      : '',
    clampingValue: WeightCalculatorRequest &&
      WeightCalculatorRequest.ClampingValue !== undefined
      ? WeightCalculatorRequest.ClampingValue
      : '',
    cutLength: WeightCalculatorRequest &&
      WeightCalculatorRequest.CutLength !== undefined
      ? WeightCalculatorRequest.CutLength
      : '',
    cutTime: WeightCalculatorRequest &&
      WeightCalculatorRequest.CutTime !== undefined
      ? WeightCalculatorRequest.CutTime
      : '',
    cuttingSpeed: WeightCalculatorRequest &&
      WeightCalculatorRequest.CuttingSpeed !== undefined
      ? WeightCalculatorRequest.CuttingSpeed
      : '',
    feedMin: WeightCalculatorRequest &&
      WeightCalculatorRequest.FeedMin !== undefined
      ? WeightCalculatorRequest.FeedMin
      : '',
    feedRev: WeightCalculatorRequest &&
      WeightCalculatorRequest.FeedRev !== undefined
      ? WeightCalculatorRequest.FeedRev
      : '',
    removedMaterial: WeightCalculatorRequest &&
      WeightCalculatorRequest.RemovedMaterial !== undefined
      ? WeightCalculatorRequest.RemovedMaterial
      : '',
    rpm: WeightCalculatorRequest &&
      WeightCalculatorRequest.Rpm !== undefined
      ? WeightCalculatorRequest.Rpm
      : '',
    turningDiameter: WeightCalculatorRequest &&
      WeightCalculatorRequest.TurningDiameter !== undefined
      ? WeightCalculatorRequest.TurningDiameter
      : '',
    turningLength: WeightCalculatorRequest &&
      WeightCalculatorRequest.TurningLength !== undefined
      ? WeightCalculatorRequest.TurningLength
      : '',
  }
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    errors,
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })
  const fieldValues = useWatch({
    control,
    name: [
      'clampingPercentage',
      'turningDiameter',
      'turningLength',
      'cutLength',
      'removedMaterial',
      'cuttingSpeed',
      // 'rpm',
      'feedRev',
      // 'feedMin',
      // 'cutTime',
      // 'clampingPercentage',
      // 'clampingValue',
    ],
  })

  useEffect(() => {
    onClampingPercantageChange()
    // onFinishDiameterChange()
    onFeedRevChange()
    onSpeedChange()
  }, [fieldValues])

  const trimValue = getConfigurationKey()
  const trim = trimValue.NumberOfDecimalForWeightCalculation
  const isEditFlag = WeightCalculatorRequest ? true : false
  const { technology, calculateMachineTime } = props
  const [totalMachiningTime, setTotalMachiningTime] = useState('')
  const fieldForProcess = () => { }

  // const onFinishDiameterChange = () => {
  //   const turningDiameter = getValues('turningDiameter')
  //   const finishDiameter = getValues('turningLength')
  //   const cutLength = checkForDecimalAndNull(
  //     (turningDiameter - finishDiameter) / 2,
  //     trim,
  //   )
  //   setValue('cutLength', cutLength)
  // }

  const onSpeedChange = () => {
    const turningDiameter = getValues('turningDiameter')
    const cuttingSpeed = getValues('cuttingSpeed')
    const rpm = checkForDecimalAndNull(
      3.8197 / (turningDiameter * cuttingSpeed),
      trim,
    )
    setValue('rpm', rpm)
  }
  const onFeedRevChange = () => {
    const feedRev = getValues('feedRev')
    const rpm = getValues('rpm')
    const removedMaterial = getValues('removedMaterial')
    const feedMin = feedByMin(feedRev, rpm)
    const tCut = checkForDecimalAndNull(removedMaterial / feedMin, trim)
    setValue('feedMin', feedMin)
    setValue('cutTime', tCut)
  }
  const onClampingPercantageChange = () => {
    const tcut = Number(getValues('cutTime'))
    const clampingPercentage = getValues('clampingPercentage')
    const clampingValue = clampingTime(tcut, clampingPercentage)
    const totalMachiningTime = totalMachineTime(tcut, clampingValue)
    setValue('clampingValue', clampingValue)
    // setValue('totalmachineTime', totalMachiningTime)
    setTotalMachiningTime(totalMachiningTime)
  }
  const onSubmit = (value) => {
    console.log(value, 'Handle Value in Facing')
    let obj = {}
    obj.ClampingPercentage = value.clampingPercentage
    obj.ClampingValue = value.clampingValue
    obj.CutLength = value.cutLength
    obj.CutTime = value.cutTime
    obj.CuttingSpeed = value.cuttingSpeed
    obj.FeedMin = value.feedMin
    obj.FeedRev = value.feedRev
    obj.RemovedMaterial = value.removedMaterial
    obj.Rpm = value.rpm
    obj.TurningDiameter = value.turningDiameter
    obj.TurningLength = value.turningLength
    calculateMachineTime(totalMachiningTime, obj)
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
                    <Col md="3">
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
                    <Col md="3">
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
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.cuttingSpeed}
                        disabled={false}
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
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Feed/Min(mm/min)`}
                        name={'feedMin'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
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
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.clampingPercentage}
                        disabled={false}
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
                onClick={onCancel}
                type="submit"
                value="CANCEL"
                className="reset mr15 cancel-btn"
              >
                <div className={'cross-icon'}>
                  <img
                    src={require('../../../../../assests/images/times.png')}
                    alt="cancel-icon.jpg"
                  />
                </div>
                CANCEL
              </button>
              <button
                type="submit"
                // disabled={isSubmitted ? true : false}
                className="btn-primary save-btn"
              >
                <div className={'check-icon'}>
                  <i class="fa fa-check" aria-hidden="true"></i>
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

export default Drilling
