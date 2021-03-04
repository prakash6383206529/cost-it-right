import React, { Fragment, useState, useEffect, useContext } from 'react';
// import React, { Fragment, useState, useEffect, } from 'react'
import { Row, Col, Container } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { costingInfoContext } from '../../CostingDetailStepTwo';
import { SearchableSelectHookForm, TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import { checkForDecimalAndNull, checkPercentageValue, loggedInUserId } from '../../../../../helper'
import { HOUR, KG, NO, SHOTS, STROKE } from '../../../../../config/constants';
import { saveProcessCostCalculationData } from '../../../actions/CostWorking';
import { toastr } from 'react-redux-toastr';
import { reactLocalStorage } from 'reactjs-localstorage';

function SheetMetalBaicDrawer(props) {

  const costData = useContext(costingInfoContext);
  const WeightCalculatorRequest = props.calculatorData.WeightCalculatorRequest
  const localStorage = reactLocalStorage.getObject('InitialConfiguration');

  const defaultValues = {
    MachineTonnage: props.calculatorData ? props.calculatorData.MachineTonnage : '',
    CycleTime: WeightCalculatorRequest &&
      WeightCalculatorRequest.CycleTime !== undefined
      ? WeightCalculatorRequest.CycleTime
      : '',
    Efficiency: WeightCalculatorRequest &&
      WeightCalculatorRequest.Efficiency !== undefined
      ? WeightCalculatorRequest.Efficiency
      : 100,
    Cavity: WeightCalculatorRequest &&
      WeightCalculatorRequest.Cavity !== undefined
      ? WeightCalculatorRequest.Cavity
      : '',
    Quantity: WeightCalculatorRequest && WeightCalculatorRequest.Quantity !== undefined ? WeightCalculatorRequest.Quantity : " ",
    ProcessCost: WeightCalculatorRequest && WeightCalculatorRequest.ProcessCost !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ProcessCost, localStorage.NoOfDecimalForPrice) : " "
  }

  const {
    register, handleSubmit, control, setValue, getValues, reset, errors, } = useForm({
      mode: 'onChange',
      reValidateMode: 'onChange',
      defaultValues: defaultValues,
    })

  const dispatch = useDispatch()
  const { technology, process, MachineTonnage, calculateMachineTime } = props
  const isEditFlag = WeightCalculatorRequest ? true : false
  const [processCost, setProcessCost] = useState(WeightCalculatorRequest && WeightCalculatorRequest.ProcessCost ? WeightCalculatorRequest.ProcessCost : '')
  const [disable, setDisabled] = useState(false)

  const tempProcessObj = WeightCalculatorRequest && WeightCalculatorRequest.ProcessCost ? WeightCalculatorRequest.ProcessCost : ''

  const fieldValues = useWatch({
    control,
    name: ['Efficiency', 'Quantity'],
  })
  useEffect(() => {
    calculateProcessCost()
  }, [fieldValues])

  const onSubmit = (value) => {
    console.log('coming')
    console.log(value, 'Handle Value in Facing')
    let obj = {}
    obj.ProcessCalculationId = WeightCalculatorRequest && WeightCalculatorRequest.ProcessCalculationId ? WeightCalculatorRequest.ProcessCalculationId : "00000000-0000-0000-0000-000000000000"
    obj.CostingProcessDetailId = WeightCalculatorRequest && WeightCalculatorRequest.CostingProcessDetailId ? WeightCalculatorRequest.CostingProcessDetailId : "00000000-0000-0000-0000-000000000000"
    obj.IsChangeApplied = tempProcessObj === value.processCost ? false : true //Need to make it dynamic
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
    const rate = props.calculatorData.MHR
    let cost
    switch (props.calculatorData.UOM) {
      case KG:
        setDisabled(true)
        cost = (1 / (efficiency * 100)) * (quantity * rate)
        setProcessCost(cost)
        setValue('ProcessCost', checkForDecimalAndNull(cost, localStorage.NoOfDecimalForPrice))
        return true
      case HOUR:
        //This need to be done later
        return;
      case STROKE:
        setDisabled(true)
        cost = (1 / (efficiency * 100)) * (rate / quantity)
        setProcessCost(cost)
        setValue('ProcessCost', checkForDecimalAndNull(cost, localStorage.NoOfDecimalForPrice))
        return true
      case NO:
        setDisabled(true)
        cost = (1 / (efficiency * 100)) * (quantity * rate)
        setProcessCost(cost)
        setValue('ProcessCost', checkForDecimalAndNull(cost, localStorage.NoOfDecimalForPrice))
        return true
      case SHOTS:
        // This need to be confirm
        setDisabled(true)
        cost = (1 / (efficiency * 100)) * (quantity * rate)
        setProcessCost(cost)
        setValue('ProcessCost', checkForDecimalAndNull(cost, localStorage.NoOfDecimalForPrice))
        return true
      default:
        break;
    }

  }

  const onCancel = () => {
    calculateMachineTime('0.00')
  }

  const checlPercentageForEfficiency = (e) => {
    checkPercentageValue(e.target.value, "Efficiency can not be more than 100%.")
    setValue('Efficiency', 100)
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
                    <Col md="2">
                      <TextFieldHookForm
                        label={`Tonnage`}
                        name={'MachineTonnage'}
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
                        defaultValue={MachineTonnage}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.MachineTonnage}
                        disabled={true}
                      />
                    </Col>
                    <Col md="2">
                      <TextFieldHookForm
                        label={`Cycle Time`}
                        name={'CycleTime'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={!disable}
                        rules={{
                          required: !disable,
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
                        errors={errors.CycleTime}
                        disabled={disable}
                      />
                    </Col>

                    <Col md="2">
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
                        errors={errors.Cavity}
                        disabled={disable}
                      />
                    </Col>
                    <Col md="2">
                      <TextFieldHookForm
                        label={`Efficiency`}
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
                    <Col md="2">
                      <TextFieldHookForm
                        label={props.calculatorData.UOM === KG ? `Finished Weight` : `Quantity`}
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
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.Quantity}
                        disabled={false}
                      />
                    </Col>
                    <Col md="2">
                      <TextFieldHookForm
                        label={`Total Process Cost`}
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
