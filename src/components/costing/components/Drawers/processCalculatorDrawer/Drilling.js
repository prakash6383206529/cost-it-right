import React, { Fragment, useState } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  SearchableSelectHookForm,
  TextFieldHookForm,
} from '../../../../layout/HookFormInputs'

function Drilling(props) {
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
  const { technology } = props
  const [totalMachiningTime, setTotalMachiningTime] = useState('')
  const fieldForProcess = () => {}

  const onFinishDiameterChange = (e) => {
    const turningDiameter = getValues('turningDiameter')
    const finishDiameter = e.target.value
    const cutLength = (turningDiameter - finishDiameter) / 2
    setValue('cutLength', cutLength)
  }

  const onDocChange = (e) => {
    const removedMaterial = getValues('removedMaterial')
    const depth = e.target.value
    console.log(removedMaterial, 'd', depth)
    if (technology === 'Machining') {
      const passesNo = removedMaterial / depth
      setValue('doc', passesNo)
    }
  }

  const onSpeedChange = (e) => {
    console.log(e, 'Eveny')
    const turningDiameter = getValues('turningDiameter')
    const cuttingSpeed = e.target.value
    const rpm = 3.8197 / (turningDiameter * cuttingSpeed) //Need to confirm formula once again
    setValue('rpm', rpm)
  }
  const onFeedRevChange = (e) => {
    const feedRev = e.target.value
    const rpm = getValues('rpm')
    // const cutLength = getValues('cutLength')
    // const passesNo = getValues('numberOfPasses')
    const removedMaterial = getValues('removedMaterial')
    const feedMin = feedRev * rpm
    const tCut = removedMaterial / feedMin
    setValue('feedMin', feedMin)
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
  return (
    <Fragment>
      <Row>
        <Col>
          <form noValidate className="form" onSubmit={() => {}}>
            <Col md="12" className={'mt25'}>
              <Col md="10">
                <div className="left-border">{'Distance:'}</div>
              </Col>
              <Col md="10">
                <Row className={'mt15'}>
                  <Col md="3">
                    <TextFieldHookForm
                      label={`Drilling Diameter`}
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
                      handleChange={onFinishDiameterChange}
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
                      handleChange={() => {}}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.PartLength}
                      disabled={false}
                    />
                  </Col>
                </Row>
              </Col>
            </Col>

            <Col md="12" className={'mt25'}>
              <Col md="10">
                <div className="left-border">{'Speed:'}</div>
              </Col>
              <Col md="10">
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
                      handleChange={onFeedRevChange}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.InnerDiameter}
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
            </Col>
            <Col md="12" className={'mt25'}>
              <Col md="10">
                <div className="left-border">{'Time'}</div>
              </Col>
              <Col md="10">
                <Row className={'mt15'}>
                  <Col md="3">
                    <TextFieldHookForm
                      label={`Total Cut time in min`}
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
                      label={`Clamping,Tool Setting(%)`}
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

export default Drilling
