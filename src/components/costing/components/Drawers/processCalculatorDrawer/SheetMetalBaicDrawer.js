import React, { Fragment, useState, useEffect, useContext } from 'react';
// import React, { Fragment, useState, useEffect, } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { costingInfoContext } from '../../CostingDetailStepTwo';
import { TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import { checkForDecimalAndNull, checkForNull, checkPercentageValue, getConfigurationKey, loggedInUserId } from '../../../../../helper'
import { DIMENSIONLESS, HOUR, KG, MASS, NO, SHOTS, STROKE, TIME, VOLUMETYPE } from '../../../../../config/constants';
import { saveProcessCostCalculationData } from '../../../actions/CostWorking';
import { toastr } from 'react-redux-toastr';
import { reactLocalStorage } from 'reactjs-localstorage';

function SheetMetalBaicDrawer(props) {

  const { rmFinishWeight } = props

  const costData = useContext(costingInfoContext);
  const WeightCalculatorRequest = props.calculatorData.WeightCalculatorRequest

  const localStorage = reactLocalStorage.getObject('InitialConfiguration');

  const defaultValues = {
    MachineTonnage: props.calculatorData ? props.calculatorData.Tonnage : '',
    CycleTime: WeightCalculatorRequest && WeightCalculatorRequest.CycleTime !== null ? WeightCalculatorRequest.CycleTime : '',
    Efficiency: WeightCalculatorRequest && WeightCalculatorRequest.Efficiency !== null ? WeightCalculatorRequest.Efficiency : 100,
    Cavity: WeightCalculatorRequest && WeightCalculatorRequest.Cavity !== null ? WeightCalculatorRequest.Cavity : 1,
    Quantity: WeightCalculatorRequest && WeightCalculatorRequest.Quantity !== null ? checkForNull(WeightCalculatorRequest.Quantity) : 1,
    ProcessCost: WeightCalculatorRequest && WeightCalculatorRequest.ProcessCost !== null ? checkForDecimalAndNull(WeightCalculatorRequest.ProcessCost, localStorage.NoOfDecimalForPrice) : " "
  }

  const {
    register, handleSubmit, control, setValue, getValues, reset, errors, } = useForm({
      mode: 'onChange',
      reValidateMode: 'onBlur',
      defaultValues: defaultValues,
    })

  const dispatch = useDispatch()
  const { technology, process, MachineTonnage, calculateMachineTime } = props
  const isEditFlag = WeightCalculatorRequest ? true : false
  const [processCost, setProcessCost] = useState(WeightCalculatorRequest && WeightCalculatorRequest.ProcessCost ? WeightCalculatorRequest.ProcessCost : '')
  const [disable, setDisabled] = useState(false)
  const [hide, setHide] = useState(false)
  const [cavity, setCavity] = useState(WeightCalculatorRequest && WeightCalculatorRequest.Cavity !== null ? WeightCalculatorRequest.Cavity : 1)
  const tempProcessObj = WeightCalculatorRequest && WeightCalculatorRequest.ProcessCost !== null ? WeightCalculatorRequest.ProcessCost : ''

  const fieldValues = useWatch({
    control,
    name: ['Efficiency', 'Cavity', 'CycleTime'],
  })
  useEffect(() => {
    handleProductionPerHour()
    calculateProcessCost()
  }, [fieldValues])

  const quantFieldValue = useWatch({
    control,
    name: ['Quantity']
  })

  useEffect(() => {
    if (props.calculatorData.UOMType !== MASS || props.calculatorData.UOMType !== HOUR) {
      calculateProcessCost()
    }
  }, [quantFieldValue])


  useEffect(() => {
    setValue('ProcessCost', checkForDecimalAndNull(WeightCalculatorRequest && WeightCalculatorRequest.ProcessCost ? WeightCalculatorRequest.ProcessCost : '', getConfigurationKey().NoOfDecimalForPrice))
    if (props.calculatorData.UOMType === MASS) {

      setValue('Quantity', rmFinishWeight ? rmFinishWeight : 1)

      // setValue('Cavity', WeightCalculatorRequest && WeightCalculatorRequest.Cavity !== null ? WeightCalculatorRequest.Cavity : 1)
    }



    if (props.calculatorData.UOMType === TIME) {
      setHide(true)
    }
    // if (props.calculatorData.UOMType === DIMENSIONLESS) {
    //   setValue('Cavity', props.WeightCalculatorRequest.Cavity ? props.WeightCalculatorRequest.Cavity : 1)
    // }

  }, [])

  const onSubmit = (value) => {


    let obj = {}
    obj.ProcessCalculationId = props.calculatorData.ProcessCalculationId ? props.calculatorData.ProcessCalculationId : "00000000-0000-0000-0000-000000000000"
    obj.CostingProcessDetailId = WeightCalculatorRequest && WeightCalculatorRequest.CostingProcessDetailId ? WeightCalculatorRequest.CostingProcessDetailId : "00000000-0000-0000-0000-000000000000"
    obj.IsChangeApplied = tempProcessObj === value.ProcessCost ? false : true
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
    obj.MachineRate = props.calculatorData.MHR
    obj.UOM = props.calculatorData.UOM
    obj.Tonnage = value.MachineTonnage
    obj.CycleTime = value.CycleTime
    obj.Efficiency = value.Efficiency
    obj.Cavity = value.Cavity
    obj.Quantity = value.Quantity
    obj.ProcessCost = processCost
    obj.LoggedInUserId = loggedInUserId()
    obj.UnitTypeId = props.calculatorData.UOMTypeId
    obj.UnitType = props.calculatorData.UOMType


    dispatch(saveProcessCostCalculationData(obj, res => {
      if (res.data.Result) {
        obj.ProcessCalculationId = res.data.Identity
        toastr.success('Calculation saved sucessfully.')
        calculateMachineTime('0.00', obj)
      }
    }))
  }
  /**
   * @method calculateProcessCost
   * @description FOR CALCULATING PROCESS COST 
  */
  const calculateProcessCost = () => {
    const efficiency = getValues('Efficiency')
    const quantity = getValues('Quantity')

    // const prodPerHrs
    // const cavity = getValues('Cavity')
    // 
    const rate = props.calculatorData.MHR


    let cost
    switch (props.calculatorData.UOMType) {
      case MASS:
        setDisabled(true)
        cost = ((100 / efficiency) * quantity * rate) / cavity
        setProcessCost(cost)
        setValue('ProcessCost', checkForDecimalAndNull(cost, localStorage.NoOfDecimalForPrice))
        return true
      case TIME:
        //This need to be done later
        cost = rate / quantity
        setProcessCost(cost)
        setValue('ProcessCost', checkForDecimalAndNull(cost, localStorage.NoOfDecimalForPrice))
        return;
      case DIMENSIONLESS:
        setDisabled(true)
        cost = ((100 / efficiency) * (rate / quantity)) / cavity
        setProcessCost(cost)
        setValue('ProcessCost', checkForDecimalAndNull(cost, localStorage.NoOfDecimalForPrice))
        return true
      case VOLUMETYPE:
        setDisabled(true)
        cost = ((100 / efficiency) * (quantity * rate)) / cavity
        setProcessCost(cost)
        setValue('ProcessCost', checkForDecimalAndNull(cost, localStorage.NoOfDecimalForPrice))
        return true
      // case SHOTS:
      //   setDisabled(true)
      //   cost = (1 / efficiency) * (rate / quantity)
      //   setProcessCost(cost)
      //   setValue('ProcessCost', checkForDecimalAndNull(cost, localStorage.NoOfDecimalForPrice))
      // return true
      default:
        break;
    }

  }

  const getCavity = (e) => {
    setCavity(e.target.value)
    calculateProcessCost()
  }
  const onCancel = () => {

    calculateMachineTime('0.00')
  }

  const handleProductionPerHour = () => {
    if (props.calculatorData.UOMType === TIME) {
      const cavity = getValues('Cavity')
      const cycleTime = getValues('CycleTime')
      const efficiency = getValues('Efficiency')
      const prodPerHrs = checkForNull((cavity * 3600 * efficiency) / (cycleTime * 100))
      setValue('Quantity', Math.floor(prodPerHrs))
    }
  }

  const checlPercentageForEfficiency = (e) => {
    if (checkPercentageValue(e.target.value, "Efficiency can not be more than 100%.")) {
      setValue('Efficiency', e.target.value)
    } else {

      setTimeout(() => {

        setValue('Efficiency', 100)
      }, 100);
    }
    // setValue('Efficiency', checkPercentageValue(e.target.value, "Efficiency can not be more than 100%.") ? e.target.value : 100)
  }

  // const quantity = (e) => {
  //   setQuantity(e.target.value)
  // }

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

                <Row className={'mt15'}>
                  <Col md="3">
                    <TextFieldHookForm
                      label={`Tonnage(T)`}
                      name={'MachineTonnage'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      handleChange={() => { }}
                      defaultValue={MachineTonnage}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.MachineTonnage}
                      disabled={true}
                    />
                  </Col>
                  {
                    hide &&
                    <Col md="3">
                      <TextFieldHookForm
                        label={`Cycle Time(sec)`}
                        name={'CycleTime'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={!disable}
                        rules={{
                          required: !disable,
                          pattern: {
                            //  value: /^[0-9\b]+$/i,
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: 'Invalid Number.',
                          },
                          // maxLength: 4,
                        }}
                        handleChange={getCavity}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.CycleTime}
                        disabled={false}
                      />
                    </Col>
                  }
                  {/* {
                      props.calculatorData.UOMType === DIMENSIONLESS && */}
                  <Col md="3">
                    <TextFieldHookForm
                      label={`Cavity`}
                      name={'Cavity'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={!disable}
                      rules={{
                        required: !disable,
                        pattern: {
                          //  value: /^[0-9\b]+$/i,
                          value: /^[0-9]\d*(\.\d+)?$/i,
                          message: 'Invalid Number.',
                        },
                        // maxLength: 4,
                      }}
                      handleChange={getCavity}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.Cavity}
                      // disabled={props.calculatorData.UOMType === DIMENSIONLESS ? false : disable}
                      disabled={false}
                    />
                  </Col>

                  <Col md="3">
                    <TextFieldHookForm
                      label={`Efficiency(%)`}
                      name={'Efficiency'}
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
                      handleChange={checlPercentageForEfficiency}
                      defaultValue={100}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.Efficiency}
                      disabled={false}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label={props.calculatorData.UOMType === MASS ? `Finished Weight` : props.calculatorData.UOMType === TIME ? `Production / Hour` : `Quantity`}
                      name={'Quantity'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        pattern: {
                          // value: /^[0-9\b]+$/i,
                          value: /^[0-9]\d*(\.\d+)?$/i,
                          message: 'Invalid Number.',
                        },
                        // maxLength: 4,
                      }}
                      handleChange={calculateProcessCost}
                      defaultValue={defaultValues.Quantity}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.Quantity}
                      disabled={(props.calculatorData.UOMType === MASS || props.calculatorData.UOMType === TIME) ? true : false}
                    />
                  </Col>
                  <Col md="3">
                    <TextFieldHookForm
                      label={`Process Cost`}
                      name={'ProcessCost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                        // pattern: {
                        //   value: /^[0-9\b]+$/i,
                        //   //value: /^[0-9]\d*(\.\d+)?$/i,
                        //   message: 'Invalid Number.',
                        // },
                        // maxLength: 4,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProcessCost}
                      disabled={true}
                    />
                  </Col>
                </Row>


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
                <div className={"check-icon"}>
                  <img
                    src={require("../../../../../assests/images/check.png")}
                    alt="check-icon.jpg"
                  />{" "}
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

export default SheetMetalBaicDrawer
