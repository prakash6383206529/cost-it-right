import React, { useState, useEffect, Fragment } from 'react'
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
  totalMachineTime,
} from './CommonFormula'
import {
  checkForDecimalAndNull,
  getConfigurationKey,
} from '../../../../../helper'

function EndMill(props) {
  const WeightCalculatorRequest = props.calculatorData.WeightCalculatorRequest

  const defaultValues = {
    removedMaterial: WeightCalculatorRequest &&
      WeightCalculatorRequest.RemovedMaterial !== undefined
      ? WeightCalculatorRequest.RemovedMaterial
      : '',
    rpm: WeightCalculatorRequest &&
      WeightCalculatorRequest.Rpm !== undefined
      ? WeightCalculatorRequest.Rpm
      : '',
    feedRev: WeightCalculatorRequest &&
      WeightCalculatorRequest.FeedRev !== undefined
      ? WeightCalculatorRequest.FeedRev
      : '',
    feedMin: WeightCalculatorRequest &&
      WeightCalculatorRequest.FeedMin !== undefined
      ? WeightCalculatorRequest.FeedMin
      : '',
    cutTime: WeightCalculatorRequest &&
      WeightCalculatorRequest.CutTime !== undefined
      ? WeightCalculatorRequest.CutTime
      : '',
    clampingPercentage: WeightCalculatorRequest &&
      WeightCalculatorRequest.ClampingPercentage !== undefined
      ? WeightCalculatorRequest.ClampingPercentage
      : '',
    clampingValue: WeightCalculatorRequest &&
      WeightCalculatorRequest.ClampingValue !== undefined
      ? WeightCalculatorRequest.ClampingValue
      : '',
    cutterDiameter: WeightCalculatorRequest &&
      WeightCalculatorRequest.CutterDiameter !== undefined
      ? WeightCalculatorRequest.CutterDiameter
      : '',
    cutLengthOfArea: WeightCalculatorRequest &&
      WeightCalculatorRequest.CutLengthOfArea !== undefined
      ? WeightCalculatorRequest.CutLengthOfArea
      : '',
    areaWidth: WeightCalculatorRequest &&
      WeightCalculatorRequest.AreaWidth !== undefined
      ? WeightCalculatorRequest.AreaWidth
      : '',
    slotNo: WeightCalculatorRequest &&
      WeightCalculatorRequest.SlotNo !== undefined
      ? WeightCalculatorRequest.SlotNo
      : '',
    cutLength: WeightCalculatorRequest &&
      WeightCalculatorRequest.CutLength !== undefined
      ? WeightCalculatorRequest.CutLength
      : '',
    cuttingSpeed: WeightCalculatorRequest &&
      WeightCalculatorRequest.CuttingSpeed !== undefined
      ? WeightCalculatorRequest.CuttingSpeed
      : '',
    toothFeed: WeightCalculatorRequest &&
      WeightCalculatorRequest.ToothFeed !== undefined
      ? WeightCalculatorRequest.ToothFeed
      : '',
    clampingPercentage: WeightCalculatorRequest &&
      WeightCalculatorRequest.ClampingPercentage !== undefined
      ? WeightCalculatorRequest.ClampingPercentage
      : '',
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
      'cutterDiameter',
      'cutLengthOfArea',
      'areaWidth',
      'slotNo',
      'cutLength',
      'cuttingSpeed',
      'toothFeed',
      'clampingPercentage',
    ],
  })

  useEffect(() => {
    onClampingPercantageChange()
    onCutChange()
    onToothFeedChange()
    onSpeedChange()
  }, [fieldValues])
  const { technology, process, calculateMachineTime } = props
  const isEditFlag = WeightCalculatorRequest ? true : false
  const [totalMachiningTime, setTotalMachiningTime] = useState('')
  const trimValue = getConfigurationKey()
  const trim = trimValue.NumberOfDecimalForWeightCalculation
  useEffect(() => {
    const toothNo = 3 // Need to make it dynamic from API
    setValue('toothNo', toothNo)
  }, [])

  const onCutChange = (e) => {
    const cutLength = getValues('cutLength')
    const slotNo = getValues('slotNo')
    const removedMaterial = checkForDecimalAndNull(cutLength * slotNo, trim)
    if (!cutLength || !slotNo || !removedMaterial) {
      return ''
    }
    setValue('removedMaterial', removedMaterial)
  }
  const onSpeedChange = (e) => {
    const cutterDiameter = getValues('cutterDiameter')
    const cuttingSpeed = getValues('cuttingSpeed')
    const rpm = findRpm(cuttingSpeed, cutterDiameter)
    setValue('rpm', rpm)
  }
  const onToothFeedChange = (e) => {
    const toothNo = getValues('toothNo')
    const rpm = getValues('rpm')
    const removedMaterial = getValues('removedMaterial')
    const slotNo = getValues('slotNo')
    const toothFeed = getValues('toothFeed')
    const feedRev = checkForDecimalAndNull(toothNo * toothFeed, trim)
    if (!feedRev) {
      return ''
    }
    setValue('feedRev', feedRev)
    const feedMin = feedByMin(feedRev, rpm)
    setValue('feedMin', feedMin)
    const tCut = checkForDecimalAndNull(
      (removedMaterial / feedMin) * slotNo,
      trim,
    )
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
  const onSubmit = (value) => {

    let obj = {}
    obj.RemovedMaterial = value.removedMaterial
    obj.Rpm = value.rpm
    obj.FeedRev = value.feedRev
    obj.FeedMin = value.feedMin
    obj.CutTime = value.cutTime
    obj.ClampingPercentage = value.clampingPercentage
    obj.ClampingValue = value.clampingValue
    obj.CutterDiameter = value.cutterDiameter
    obj.CutLengthOfArea = value.cutLengthOfArea
    obj.AreaWidth = value.areaWidth
    obj.SlotNo = value.slotNo
    obj.CutLength = value.cutLength
    obj.CuttingSpeed = value.cuttingSpeed
    obj.ToothFeed = value.toothFeed
    obj.ClampingPercentage = value.clampingPercentage
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
                        disabled={false}
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
                        disabled={false}
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
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.areaWidth}
                        disabled={false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`No. of slots/T-nut entry`}
                        name={'slotNo'}
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
                        handleChange={onCutChange}
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
                        errors={errors.removedMaterial}
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
                        disabled={false}
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

export default EndMill
