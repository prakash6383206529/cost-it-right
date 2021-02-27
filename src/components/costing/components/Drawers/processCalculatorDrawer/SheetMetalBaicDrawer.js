import React, { Fragment, useState, useEffect } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  SearchableSelectHookForm,
  TextFieldHookForm,
} from '../../../../layout/HookFormInputs'

function SheetMetalBaicDrawer(props) {
  console.log("SHETETETETET");
  const WeightCalculatorRequest = props.calculatorData.WeightCalculatorRequest
  console.log(WeightCalculatorRequest, "Wight");
  const defaultValues = {
    tonnage: WeightCalculatorRequest &&
      WeightCalculatorRequest.Tonnage !== undefined
      ? WeightCalculatorRequest.Tonnage
      : '',
    cycleTime: WeightCalculatorRequest &&
      WeightCalculatorRequest.CycleTime !== undefined
      ? WeightCalculatorRequest.CycleTime
      : '',
    efficiency: WeightCalculatorRequest &&
      WeightCalculatorRequest.Efficiency !== undefined
      ? WeightCalculatorRequest.Efficiency
      : '',
    cavity: WeightCalculatorRequest &&
      WeightCalculatorRequest.Cavity !== undefined
      ? WeightCalculatorRequest.Cavity
      : ''
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
  const { technology, process, tonnage, calculateMachineTime } = props
  const isEditFlag = WeightCalculatorRequest ? true : false
  //   const [totalMachiningTime, setTotalMachiningTime] = useState('0.00')
  //   const trimVal = getConfigurationKey()
  //   const trim = trimVal.NumberOfDecimalForWeightCalculation
  //   console.log(trim, 'Trim')
  const onSubmit = (value) => {
    console.log('coming')
    console.log(value, 'Handle Value in Facing')
    let obj = {}
    obj.Tonnage = value.tonnage
    obj.CycleTime = value.cycleTime
    obj.Efficiency = value.efficiency
    obj.Cavity = value.cavity
    calculateMachineTime('0.00', obj)
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
                {/* <Col md="10">
                  <div className="left-border">{'Distance:'}</div>
                </Col> */}
                <Col md="12">
                  <Row className={'mt15'}>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Tonnage`}
                        name={'tonnage'}
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
                        defaultValue={tonnage}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.tonnage}
                        disabled={true}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Cycle Time`}
                        name={'cycleTime'}
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
                        errors={errors.cycleTime}
                        disabled={false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Efficiency`}
                        name={'efficiency'}
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
                        errors={errors.efficiency}
                        disabled={false}
                      />
                    </Col>
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Cavity`}
                        name={'cavity'}
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
                        errors={errors.cavity}
                        disabled={false}
                      />
                    </Col>
                  </Row>
                </Col>

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

export default SheetMetalBaicDrawer
