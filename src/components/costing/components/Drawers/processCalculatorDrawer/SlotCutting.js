import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  SearchableSelectHookForm,
  TextFieldHookForm,
} from '../../../../layout/HookFormInputs'

function SlotCutting(props) {
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
    // defaultValues: defaultValues,
  })
  const { technology, process } = props
  const [totalMachiningTime, setTotalMachiningTime] = useState('')
  useEffect(() => {
    const toothNo = 3 // Need to make it dynamic from API
    setValue('toothNo', toothNo)
  }, [])

  const onDocChange = (e) => {
    const removedMaterial = getValues('removedMaterial')
    const depth = e.target.value
    console.log(removedMaterial, 'd', depth)
    if (technology === 'Machining') {
      const passesNo = removedMaterial / depth
      setValue('numberOfPasses', passesNo)
    }
  }

  const onSpeedChange = (e) => {
    const cutterDiameter = getValues('cutterDiameter')
    const cuttingSpeed = e.target.value
    const rpm = (1000 * cuttingSpeed) / (3.14 * cutterDiameter)
    setValue('rpm', rpm)
  }
  const onToothFeedChange = (e) => {
    const toothNo = getValues('toothNo')
    const rpm = getValues('rpm')
    const cutLength = getValues('cutLength')
    const numberOfPasses = getValues('numberOfPasses')
    const toothFeed = e.target.value
    const feedRev = toothNo * toothFeed
    setValue('feedRev', feedRev)
    const feedMin = feedRev * rpm
    setValue('feedMin', feedMin)
    const tCut = (cutLength / feedMin) * numberOfPasses
    setValue('cutTime', tCut)
  }

  const onClampingPercantageChange = (e) => {
    const tcut = getValues('cutTime')
    const clampingPercentage = e.target.value
    const clampingValue = tcut * clampingPercentage
    const totalMachiningTime = tcut + clampingValue
    setValue('clampingValue', clampingValue)
    // setValue('totalmachineTime', totalMachiningTime)
    setTotalMachiningTime(totalMachiningTime)
  }
  const onSlotChange = (e) => {
    const slotNo = e.target.value
    const cutLengthOfArea = Number(getValues('cutLengthOfArea'))
    const cutterDiameter = Number(getValues('cutterDiameter'))
    const areaWidth = Number(getValues('areaWidth'))
    const cutLength = (cutLengthOfArea + cutterDiameter * 2) * slotNo // Need to confirm formula
    setValue('cutLength', cutLength)
  }
  return (
    <Fragment>
      <Row>
        <Col>
          <form noValidate className="form" onSubmit={() => {}}>
            <Col md="12" className={'mt25'}>
              <Col md="12">
                <div className="left-border">{'Distance:'}</div>
              </Col>
              <Col md="12">
                <Row className={'mt15'}>
                  <Col md="3">
                    <TextFieldHookForm
                      label={`Cutter Diameter`}
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
                      handleChange={() => {}}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.OuterDiameter}
                      disabled={false}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label={`Length of Area Cut`}
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
                      handleChange={() => {}}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.Thickness}
                      disabled={false}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label={`Width of area to cut`}
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
                      label={`No. of slots/T-nut entry`}
                      name={'slotNo'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      // rules={{
                      //   required: false,
                      //   pattern: {
                      //     //value: /^[0-9]*$/i,
                      //     value: /^[0-9]\d*(\.\d+)?$/i,
                      //     message: 'Invalid Number.',
                      //   },
                      //   // maxLength: 4,
                      // }}
                      handleChange={onSlotChange}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.cutLength}
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
                      mandatory={false}
                      // rules={{
                      //   required: false,
                      //   pattern: {
                      //     //value: /^[0-9]*$/i,
                      //     value: /^[0-9]\d*(\.\d+)?$/i,
                      //     message: 'Invalid Number.',
                      //   },
                      //   // maxLength: 4,
                      // }}
                      handleChange={() => {}}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.cutLength}
                      disabled={true}
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
                      handleChange={() => {}}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.removedMaterial}
                      disabled={false}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label={`Depth of cut`}
                      name={'doc'}
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
                      label="No. of Passes"
                      name={'numberOfPasses'}
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
                      errors={errors.numberOfPasses}
                      disabled={true}
                    />
                  </Col>
                </Row>
              </Col>
            </Col>

            <Col md="12" className={'mt25'}>
              <Col md="12">
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
                      handleChange={() => {}}
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
                      mandatory={false}
                      rules={{
                        required: false,
                        // pattern: {
                        //   value: /^[0-9]*$/i,
                        //   message: 'Invalid Number.'
                        // },
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
                      handleChange={() => {}}
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
            </Col>
            <Col md="12" className={'mt25'}>
              <Col md="12">
                <div className="left-border">{'Time'}</div>
              </Col>
              <Col md="12">
                <Row className={'mt15'}>
                  <Col md="3">
                    <TextFieldHookForm
                      label={`Total Cut time in hrs`}
                      name={'cutTime'}
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
                      errors={errors.cutTime}
                      disabled={true}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label={`Clamping,Tool Setting & Changing and Marking Time(%)`}
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
                      label={`Clamping,Tool Setting`}
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
                <Row className="sf-btn-footer no-gutters justify-content-between">
                  <div className="col-sm-12  bluefooter-butn">
                    Total Machining Time{' '}
                    <span className="col-sm-12 text-right">
                      {totalMachiningTime}
                    </span>
                    {/* <TextFieldHookForm
                                    label={`Total Machine TIme`}
                                    name={'totalmachineTime'}
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
                                    errors={errors.totalmachineTime}
                                    disabled={true}
                                  /> */}
                  </div>
                </Row>
              </Col>
            </Col>
          </form>
        </Col>
      </Row>
    </Fragment>
  )
}

export default SlotCutting
