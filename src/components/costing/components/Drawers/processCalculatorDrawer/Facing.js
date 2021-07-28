import React, { Fragment, useState, useEffect } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  SearchableSelectHookForm,
  TextFieldHookForm,
} from '../../../../layout/HookFormInputs'
import {
  clampingTime,
  feedByMin,
  findRpm,
  passesNo,
  totalMachineTime,
} from './CommonFormula'
import {
  checkForDecimalAndNull,
  getConfigurationKey,
  trimDecimalPlace,
} from '../../../../../helper'
function Facing(props) {
  const { technology, process, calculateMachineTime } = props
  const WeightCalculatorRequest = props.calculatorData.WeightCalculatorRequest
  const defaultValues = {
    cutLength: WeightCalculatorRequest &&
      WeightCalculatorRequest.CutLength !== undefined
      ? WeightCalculatorRequest.CutLength
      : '',
    // removedMaterial: '',
    rpm: WeightCalculatorRequest &&
      WeightCalculatorRequest.Rpm !== undefined
      ? WeightCalculatorRequest.Rpm : '',
    feedMin: WeightCalculatorRequest &&
      WeightCalculatorRequest.FeedMin !== undefined
      ? WeightCalculatorRequest.FeedMin : '',
    cutTime: WeightCalculatorRequest &&
      WeightCalculatorRequest.CutTime !== undefined
      ? WeightCalculatorRequest.CutTime : '',
    numberOfPasses: WeightCalculatorRequest &&
      WeightCalculatorRequest.NumberOfPasses !== undefined
      ? WeightCalculatorRequest.NumberOfPasses : '',
    clampingPercentage: WeightCalculatorRequest &&
      WeightCalculatorRequest.ClampingPercentage !== undefined
      ? WeightCalculatorRequest.ClampingPercentage : '',
    clampingValue: WeightCalculatorRequest &&
      WeightCalculatorRequest.ClampingValue !== undefined
      ? WeightCalculatorRequest.ClampingValue : '',
    turningDiameter: WeightCalculatorRequest &&
      WeightCalculatorRequest.TurningDiameter !== undefined
      ? WeightCalculatorRequest.TurningDiameter : '',
    finishDiameter: WeightCalculatorRequest &&
      WeightCalculatorRequest.FinishDiameter !== undefined
      ? WeightCalculatorRequest.FinishDiameter : '',
    removedMaterial: WeightCalculatorRequest &&
      WeightCalculatorRequest.RemovedMaterial !== undefined
      ? WeightCalculatorRequest.RemovedMaterial : '',
    cuttingSpeed: WeightCalculatorRequest &&
      WeightCalculatorRequest.CuttingSpeed !== undefined
      ? WeightCalculatorRequest.CuttingSpeed : '',
    doc: WeightCalculatorRequest &&
      WeightCalculatorRequest.Doc !== undefined
      ? WeightCalculatorRequest.Doc : '',
    feedRev: WeightCalculatorRequest &&
      WeightCalculatorRequest.FeedRev !== undefined
      ? WeightCalculatorRequest.FeedRev : '',
    clampingPercentage: WeightCalculatorRequest &&
      WeightCalculatorRequest.ClampingPercentage !== undefined
      ? WeightCalculatorRequest.ClampingPercentage : '',
  }
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    reset,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })
  const fieldValues = useWatch({
    control,
    name: [
      'turningDiameter',
      'finishDiameter',
      // 'turningLength',
      //'cutLength',
      'removedMaterial',
      'cuttingSpeed',
      'doc',
      // 'rpm',
      'feedRev',
      'clampingPercentage',
      // 'feedMin',
      // 'cutTime',
      // 'clampingPercentage',
      // 'clampingValue',
    ],
  })

  useEffect(() => {
    // onTurningLength()
    onClampingPercantageChange()
    onFinishDiameterChange()
    onDocChange()
    onFeedRevChange()
    onSpeedChange()
  }, [fieldValues])


  const [totalMachiningTime, setTotalMachiningTime] = useState('0.00')
  const isEditFlag = WeightCalculatorRequest ? true : false
  const trimVal = getConfigurationKey()
  const trim = trimVal.NumberOfDecimalForWeightCalculation


  const fieldForProcess = () => { }

  const onFinishDiameterChange = (e) => {
    const turningDiameter = getValues('turningDiameter')
    const finishDiameter = getValues('finishDiameter')

    const cutLength = checkForDecimalAndNull(
      (turningDiameter - finishDiameter) / 2,
      trim,
    )
    if (!turningDiameter || !finishDiameter || cutLength) {
      return ''
    }
    setValue('cutLength', cutLength)
  }

  const onDocChange = (e) => {
    const removedMaterial = getValues('removedMaterial')
    const doc = getValues('doc')
    if (technology === 'Machining') {
      const numberOfPasses = passesNo(removedMaterial, doc)
      setValue('numberOfPasses', numberOfPasses)
    }
  }

  const onSpeedChange = (e) => {
    const turningDiameter = getValues('turningDiameter')
    const finishDiameter = getValues('finishDiameter')
    const cuttingSpeed = getValues('cuttingSpeed')
    const Diameter = (Number(turningDiameter) + Number(finishDiameter)) / 2
    const rpm = findRpm(cuttingSpeed, Diameter)
    setValue('rpm', rpm)
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
    const tCut = checkForDecimalAndNull((cutLength * passesNo) / feedMin, trim)
    setValue('feedMin', feedMin)
    setValue('cutTime', tCut)
  }
  const onClampingPercantageChange = (e) => {
    const tcut = Number(getValues('cutTime'))
    const clampingPercentage = getValues('clampingPercentage')
    const clampingValue = clampingTime(tcut, clampingPercentage)
    const totalMachiningTime = totalMachineTime(tcut, clampingValue)
    setValue('clampingValue', clampingValue)
    // setValue('totalmachineTime', totalMachiningTime)
    setTotalMachiningTime(totalMachiningTime)
  }
  const onSubmit = (formValue) => {


    let obj = {}
    obj.TurningDiameter = formValue.turningDiameter
    obj.FinishDiameter = formValue.finishDiameter
    obj.CutLength = formValue.cutLength
    obj.RemovedMaterial = formValue.removedMaterial
    obj.Rpm = formValue.rpm
    obj.FeedRev = formValue.feedRev
    obj.FeedMin = formValue.feedMin
    obj.CutTime = formValue.cutTime
    obj.NumberOfPasses = formValue.numberOfPasses
    obj.ClampingPercentage = formValue.clampingPercentage
    obj.ClampingValue = formValue.clampingValue
    obj.CuttingSpeed = formValue.cuttingSpeed
    obj.Doc = formValue.doc
    obj.TotalMachiningTime = totalMachiningTime

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
                            //value: /^[0-9]*$/i,
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: 'Invalid Number.',
                          },
                          // maxLength: 4,
                        }}
                        handleChange={onFinishDiameterChange}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.areaWidth}
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
                            value: /^[0-9\b]+$/i,
                            //value: /^[0-9]\d*(\.\d+)?$/i,
                            message: 'Invalid Number.',
                          },
                          // maxLength: 4,
                        }}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.slotNo}
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
                        errors={errors.cutLength}
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
                          // pattern: {
                          //   value: /^[0-9]*$/i,
                          //   message: 'Invalid Number.'
                          // },
                          // maxLength: 4,
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
                    <Col md="4">
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
