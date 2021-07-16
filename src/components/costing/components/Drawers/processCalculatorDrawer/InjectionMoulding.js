import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  SearchableSelectHookForm,
  TextFieldHookForm,
} from '../../../../layout/HookFormInputs'

function InjectionMoulding(props) {
  const { calculateMachineTime } = props

  const WeightCalculatorRequest = props.calculatorData.WeightCalculatorRequest
  const isEditFlag = WeightCalculatorRequest ? true : false
  const defaultValues = {
    cavity: WeightCalculatorRequest &&
      WeightCalculatorRequest.Cavity !== undefined
      ? WeightCalculatorRequest.Cavity
      : '',
    tonnage: WeightCalculatorRequest &&
      WeightCalculatorRequest.Tonnage !== undefined
      ? WeightCalculatorRequest.Tonnage
      : '',
    mhr: WeightCalculatorRequest &&
      WeightCalculatorRequest.Mhr !== undefined
      ? WeightCalculatorRequest.Mhr
      : '',
    cycleTime: WeightCalculatorRequest &&
      WeightCalculatorRequest.CycleTime !== undefined
      ? WeightCalculatorRequest.CycleTime
      : '',
    shotNumber: WeightCalculatorRequest &&
      WeightCalculatorRequest.ShotNumber !== undefined
      ? WeightCalculatorRequest.ShotNumber
      : '',
    processCost: WeightCalculatorRequest &&
      WeightCalculatorRequest.ProcessCost !== undefined
      ? WeightCalculatorRequest.ProcessCost
      : '',
    totalMfgCost: WeightCalculatorRequest &&
      WeightCalculatorRequest.TotalMfgCost !== undefined
      ? WeightCalculatorRequest.TotalMfgCost
      : '',
    withoutPaintPartCost: WeightCalculatorRequest &&
      WeightCalculatorRequest.WithoutPaintPartCost !== undefined
      ? WeightCalculatorRequest.WithoutPaintPartCost
      : '',
    paintedPartCost: WeightCalculatorRequest &&
      WeightCalculatorRequest.PaintedPartCost !== undefined
      ? WeightCalculatorRequest.PaintedPartCost
      : '',
    packingCost: WeightCalculatorRequest &&
      WeightCalculatorRequest.PackingCost !== undefined
      ? WeightCalculatorRequest.PackingCost
      : '',
    transportCost: WeightCalculatorRequest &&
      WeightCalculatorRequest.TransportCost !== undefined
      ? WeightCalculatorRequest.TransportCost
      : '',
    finalPartCost: WeightCalculatorRequest &&
      WeightCalculatorRequest.FinalPartCost !== undefined
      ? WeightCalculatorRequest.FinalPartCost
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
  const onSubmit = (values) => {
    let obj = {}
    obj.Cavity = values.cavity
    obj.Tonnage = values.tonnage
    obj.Mhr = values.mhr
    obj.CycleTime = values.cycleTime
    obj.ShotNumber = values.shotNumber
    obj.ProcessCost = values.processCost
    obj.TotalMfgCost = values.totalMfgCost
    obj.WithoutPaintPartCost = values.withoutPaintPartCost
    obj.PaintedPartCost = values.paintedPartCost
    obj.PackingCost = values.packingCost
    obj.TransportCost = values.transportCost
    obj.FinalPartCost = values.finalPartCost
    calculateMachineTime('0.00', obj)
  }
  const onCancel = () => {
    calculateMachineTime('0.00')
  }
  /**
   * @method calculateMHR
   * @description calculate mhr from tonnage
   */
  const calculateMHR = () => {
    const tonnage = getValues('tonnage')
    if (!tonnage) {
      return ''
    }
    const MHR = tonnage * 1.3
    setValue('mhr', MHR)
  }
  /**
   * @method efficiency
   * @description calculate shot number/efficiency
   */
  const calculateEfficiency = () => {
    const cycleTime = getValues('cycleTime')
    if (!cycleTime) {
      return ''
    }
    const shotNumber = (cycleTime / 3600) * (85 / 100)
    setValue('shotNumber', shotNumber)
  }

  /**
   * @method calculateProcessCost
   * @description Calculate Process Cost
   */
  const calculateProcessCost = () => {
    const mhr = getValues('mhr')
    const efficiency = getValues('shotNumber')
    const cavity = getValues('cavity')
    const processCost = mhr / efficiency / cavity
    setValue('processCost', processCost)
  }

  const totalMfgCosting = () => {
    const rmCosting = 50 //     -> how to get this value need to confirm
    const processCost = getValues('processCost')
    const mfg = rmCosting + processCost
    setValue('mfg', mfg)
  }
  return (
    <Fragment>
      <Row>
        <Col>
          <form noValidate className="form" onSubmit={handleSubmit(onSubmit)}>
            <Col md="12" className={'mt25'}>
              <div className="border pl-3 pr-3 pt-3">
                <Col md="10">
                  <div className="left-border">{'Moulding Process Cost:'}</div>
                </Col>
                <Col md="12">
                  <Row className={'mt15'}>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Cavity`}
                        name={'cavity'}
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
                        errors={errors.cavity}
                        disabled={false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`M/c Tonnage Required`}
                        name={'tonnage'}
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
                        errors={errors.tonnage}
                        disabled={false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`MHR`}
                        name={'mhr'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        // rules={{
                        //   required: true,
                        //   pattern: {
                        //     //value: /^[0-9]*$/i,
                        //     value: /^[0-9]\d*(\.\d+)?$/i,
                        //     message: 'Invalid Number.',
                        //   },
                        //   // maxLength: 4,
                        // }}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.mhr}
                        disabled={true}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Cycle Time(sec)`}
                        name={'cycleTime'}
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
                        errors={errors.cycleTime}
                        disabled={false}
                      />
                    </Col>

                    <Col md="3">
                      <TextFieldHookForm
                        label={`No. of Shots per Hour @ eff`}
                        name={'shotNumber'}
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
                        errors={errors.shotNumber}
                        disabled={true}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Process Cost(Rs/pc)`}
                        name={'processCost'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        // rules={{
                        //   required: true,
                        //   pattern: {
                        //     //value: /^[0-9]*$/i,
                        //     value: /^[0-9]\d*(\.\d+)?$/i,
                        //     message: 'Invalid Number.',
                        //   },
                        //   // maxLength: 4,
                        // }}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.processCost}
                        disabled={true}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Total Mfg Cost`}
                        name={'totalMfgCost'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        // rules={{
                        //   required: true,
                        //   pattern: {
                        //     //value: /^[0-9]*$/i,
                        //     value: /^[0-9]\d*(\.\d+)?$/i,
                        //     message: 'Invalid Number.',
                        //   },
                        //   // maxLength: 4,
                        // }}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.totalMfgCost}
                        disabled={true}
                      />
                    </Col>
                  </Row>
                </Col>

                <Col md="10 mt-25">
                  <div className="left-border">{'Non-Painted Part Cost:'}</div>
                </Col>
                <Col md="12">
                  <Row className={'mt15'}>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Part Cost w/o paint(Rs/pc)`}
                        name={'withoutPaintPartCost'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        // rules={{
                        //   required: true,
                        //   pattern: {
                        //     //value: /^[0-9]*$/i,
                        //     value: /^[0-9]\d*(\.\d+)?$/i,
                        //     message: 'Invalid Number.',
                        //   },
                        //   // maxLength: 4,
                        // }}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.withoutPaintPartCost}
                        disabled={true}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Part Cost with paint(Rs/pc)`}
                        name={'paintedPartCost'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={false}
                        // rules={{
                        //   required: true,
                        //   pattern: {
                        //     //value: /^[0-9]*$/i,
                        //     value: /^[0-9]\d*(\.\d+)?$/i,
                        //     message: 'Invalid Number.',
                        //   },
                        //   // maxLength: 4,
                        // }}
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
                        label={`Packing Cost(Rs/pc)`}
                        name={'packingCost'}
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
                        errors={errors.packingCost}
                        disabled={false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Transport Cost(Rs/pc)`}
                        name={'transportCost'}
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
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.transportCost}
                        disabled={false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Final Part Cost with pkg & frt(Rs/pc)`}
                        name={'finalPartCost'}
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
                        errors={errors.finalPartCost}
                        disabled={true}
                      />
                    </Col>
                    {/* <Col md="3">
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
                </Col> */}
                  </Row>
                </Col>

                {/* <Col md="10 mt-25">
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
            </Col> */}

                {/* <div className="bluefooter-butn border row">
              <div className="col-sm-8">Total Machining Time </div>
              <span className="col-sm-4 text-right">
                {totalMachiningTime === '0.00'
                  ? totalMachiningTime
                  : checkForDecimalAndNull(totalMachiningTime, trim)}{' '}
                min
              </span>
            </div> */}
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
                <div className={"save-icon"}></div>
                {isEditFlag ? 'UPDATE' : 'SAVE'}
              </button>
            </div>
          </form>
        </Col>
      </Row>
    </Fragment>
  )
}

export default InjectionMoulding
