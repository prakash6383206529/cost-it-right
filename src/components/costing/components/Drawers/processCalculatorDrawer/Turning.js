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
} from '../../../../../helper'

function Turning(props) {
  const defaultValues = {
    cutLength: '',
    removedMaterial: '',
    rpm: '',
    feedMin: '',
    cutTime: '',
    numberOfPasses: '',
    clampingPercentage: '',
    clampingValue: '',
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
      'turningDiameter',
      'finishDiameter',
      'turningLength',
      //'cutLength',
      //'removedMaterial',
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
    onTurningLength()
    onClampingPercantageChange()
    onFinishDiameterChange()
    onDocChange()
    onFeedRevChange()
    onSpeedChange()
  }, [fieldValues])
  const trimValue = getConfigurationKey()
  const trim = trimValue.NumberOfDecimalForWeightCalculation

  const { technology, process, calculateMachineTime } = props
  const [totalMachiningTime, setTotalMachiningTime] = useState('')
  const fieldForProcess = () => {}

  const onTurningLength = () => {
    const cutLength = getValues('turningLength')
    setValue('cutLength', cutLength)
  }

  const onFinishDiameterChange = () => {
    const turningDiameter = getValues('turningDiameter')
    const finishDiameter = getValues('finishDiameter')
    if (!turningDiameter || !finishDiameter) {
      return false
    } else {
      const removedMaterial = checkForDecimalAndNull(
        (turningDiameter - finishDiameter) / 2,
        trim,
      )

      setValue('removedMaterial', removedMaterial)
    }
  }
  const onDocChange = () => {
    const removedMaterial = getValues('removedMaterial')
    const doc = getValues('doc')
    if (technology === 'Machining') {
      const numberOfPasses = passesNo(removedMaterial, doc)

      setValue('numberOfPasses', numberOfPasses)
    }
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
    setValue('rpm', rpm)
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
    const tCut = checkForDecimalAndNull((cutLength * passesNo) / feedMin, trim)
    if (!tCut) {
      return false
    }

    setValue('feedMin', feedMin)
    setValue('cutTime', tCut)
  }
  const onClampingPercantageChange = () => {
    const tcut = Number(getValues('cutTime'))
    const clampingPercentage = getValues('clampingPercentage')
    const clampingValue = clampingTime(tcut, clampingPercentage)
    if (!clampingValue) {
      return false
    }
    const totalMachiningTime = totalMachineTime(tcut, clampingValue)
    setValue('clampingValue', clampingValue)
    // setValue('totalmachineTime', totalMachiningTime)
    setTotalMachiningTime(totalMachiningTime)
  }
  const onSubmit = (value) => {
    console.log(value, 'Handle Value in Facing')
    calculateMachineTime(totalMachiningTime)
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
                        handleChange={() => {}}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.turningDiameter}
                        disabled={false}
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
                        handleChange={() => {}}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.finishDiameter}
                        disabled={false}
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
                        handleChange={() => {}}
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
                        rules={{
                          required: false,
                          pattern: {
                            value: /^[0-9\b]+$/i,
                            //value: /^[0-9]\d*(\.\d+)?$/i,
                            message: 'Invalid Number.',
                          },
                          // maxLength: 4,
                        }}
                        handleChange={() => {}}
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
                        disabled={false}
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
                        rules={{
                          required: true,
                          pattern: {
                            //value: /^[0-9]*$/i,
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: 'Invalid Number.',
                          },
                          // maxLength: 4,
                        }}
                        handleChange={() => {}}
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
                        handleChange={() => {}}
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
                        handleChange={() => {}}
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
                        handleChange={() => {}}
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
                        handleChange={() => {}}
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
                {'SAVE'}
              </button>
            </div>
          </form>
        </Col>
      </Row>
    </Fragment>
  )
}

export default Turning
