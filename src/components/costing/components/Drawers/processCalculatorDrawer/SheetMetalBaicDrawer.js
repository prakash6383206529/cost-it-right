import React, { Fragment, useState, useEffect, useContext } from 'react';
// import React, { Fragment, useState, useEffect, } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { costingInfoContext } from '../../CostingDetailStepTwo';
import { NumberFieldHookForm, TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId } from '../../../../../helper'
import { AREA, DIMENSIONLESS, MASS, TIME, VOLUMETYPE } from '../../../../../config/constants';
import { saveDefaultProcessCostCalculationData } from '../../../actions/CostWorking';
import Toaster from '../../../../common/Toaster';
import { reactLocalStorage } from 'reactjs-localstorage';
import { findProcessCost } from '../../../CostingUtil';
import { debounce } from 'lodash';
import { maxLength8, nonZero } from '../../../../../helper/validation'
import TooltipCustom from '../../../../common/Tooltip';
import { number, percentageLimitValidation, checkWhiteSpaces, decimalNumberLimit } from "../../../../../helper/validation";

function SheetMetalBaicDrawer(props) {
  
  const { rmFinishWeight } = props
  const { ProcessName } = props.calculatorData
  const costData = useContext(costingInfoContext);
  const WeightCalculatorRequest = props.calculatorData.WeightCalculatorRequest
  const localStorage = reactLocalStorage.getObject('InitialConfiguration');

  const defaultValues = {
    MachineTonnage: props.calculatorData ? props.calculatorData.Tonnage : '',
    CycleTime: Object.keys(WeightCalculatorRequest).length > 0 ? WeightCalculatorRequest.CycleTime !== null ? WeightCalculatorRequest.CycleTime : 1 : 1,
    Efficiency: Object.keys(WeightCalculatorRequest).length > 0 ? WeightCalculatorRequest.Efficiency !== null ? WeightCalculatorRequest.Efficiency : 100 : 100,
    Cavity: Object.keys(WeightCalculatorRequest).length > 0 ? WeightCalculatorRequest.Cavity !== null ? WeightCalculatorRequest.Cavity : 1 : 1,
    Quantity: Object.keys(WeightCalculatorRequest).length > 0 || WeightCalculatorRequest.Quantity !== undefined ? checkForNull(WeightCalculatorRequest.Quantity) : 1,
    ProcessCost: Object.keys(WeightCalculatorRequest).length > 0 ? WeightCalculatorRequest.ProcessCost !== null ? checkForDecimalAndNull(WeightCalculatorRequest.ProcessCost, localStorage.NoOfDecimalForPrice) : " " : '',
    ExtrusionSpeed: Object.keys(WeightCalculatorRequest).length > 0 ? WeightCalculatorRequest.ExtrusionSpeed : '',
    PartLength: Object.keys(WeightCalculatorRequest).length > 0 ? WeightCalculatorRequest.PartLength : '',
  }
  
  const { register, handleSubmit, control, setValue, getValues, formState: { errors }, } = useForm({
    mode: 'onChange',
    reValidateMode: 'onBlur',
    defaultValues: defaultValues,
  })

  const dispatch = useDispatch()

  const { MachineTonnage, calculateMachineTime } = props

  const [processCost, setProcessCost] = useState(Object.keys(WeightCalculatorRequest).length > 0 ? WeightCalculatorRequest.ProcessCost ? WeightCalculatorRequest.ProcessCost : '' : '')
  
  const [disable, setDisabled] = useState(false)
  const [hide, setHide] = useState(false)
  const [prodHr, setProdHr] = useState('')
  const [quantityState, setQuantityState] = useState(Object.keys(WeightCalculatorRequest).length > 0 || WeightCalculatorRequest.Quantity !== undefined ? checkForNull(WeightCalculatorRequest.Quantity) : 1)
  const [isDisable, setIsDisable] = useState(false)
  const [processCostTooltip, setProcessCostTooltip] = useState();
  const [netProcessCostWithOutInterestAndDepreciation, setNetProcessCostWithoutInterestAndDepreciation] = useState(1)
  const tempProcessObj = Object.keys(WeightCalculatorRequest).length > 0 ? WeightCalculatorRequest.ProcessCost !== null ? WeightCalculatorRequest.ProcessCost : '' : ''
  const processMHRWithOutInterestAndDepreciation = props?.calculatorData?.MHRWithOutInterestAndDepreciation || null
  const fieldValues = useWatch({
    control,
    name: ['Efficiency', 'Cavity', 'CycleTime', 'PartLength', 'ExtrusionSpeed'],
  })

  useEffect(() => {
    handleProductionPerHour()
    calculateProcessCost()
  }, [fieldValues, quantityState])

  const quantFieldValue = useWatch({
    control,
    name: ['Quantity']
  })
  useEffect(() => {
    handleProductionPerHour()
    calculateProcessCost()
  }, [fieldValues, quantityState])

  const cycleTime = useWatch({
    control,
    name: ['PartLength', 'ExtrusionSpeed', 'Efficiency']
  })

  useEffect(() => {
    if (props.calculatorData.UOMType !== TIME) {
      calculateProcessCost()
    }
    setQuantityState(getValues('Quantity'))
  }, [quantFieldValue])

  useEffect(() => {
    if (ProcessName.toLowerCase().includes('extrusion') && props.calculatorData.UOMType === TIME) {
      calculateCycleTime()
    }
  }, [cycleTime])
  useEffect(() => {

    if (!props.CostingViewMode && props.calculatorData.UOMType === MASS) {

      let quantityValue = 1

      if ((WeightCalculatorRequest.Quantity === null || WeightCalculatorRequest.Quantity === undefined || WeightCalculatorRequest.Quantity === '')
        && (rmFinishWeight === undefined || rmFinishWeight === null || rmFinishWeight === '')) {
        quantityValue = 1
      } else if ((WeightCalculatorRequest.Quantity !== null && WeightCalculatorRequest.Quantity !== undefined
        && WeightCalculatorRequest.Quantity !== '')) {
        quantityValue = WeightCalculatorRequest.Quantity
      } else {
        quantityValue = rmFinishWeight
      }
      setQuantityState(quantityValue)
      setValue('Quantity', (checkForDecimalAndNull(quantityValue, getConfigurationKey().NoOfDecimalForInputOutput)))

    } else if (props.calculatorData.UOMType === TIME) {

      setQuantityState(Object.keys(WeightCalculatorRequest).length > 0 || WeightCalculatorRequest.PartPerHour !== undefined ? WeightCalculatorRequest.PartPerHour : 1)
      setValue('Quantity', Object.keys(WeightCalculatorRequest).length > 0 || WeightCalculatorRequest.PartPerHour !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.PartPerHour, getConfigurationKey().NoOfDecimalForInputOutput) : 1)
      setHide(true)
    } else {
      setQuantityState(Object.keys(WeightCalculatorRequest).length > 0 || WeightCalculatorRequest.Quantity !== undefined ? WeightCalculatorRequest.Quantity : 1)

      setTimeout(() => {
        setValue('Quantity', Object.keys(WeightCalculatorRequest).length > 0 || WeightCalculatorRequest.Quantity !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.Quantity, getConfigurationKey().NoOfDecimalForInputOutput) : 1)
      }, 200);

    }
    setValue('CycleTime', Object.keys(WeightCalculatorRequest).length > 0 || WeightCalculatorRequest.CycleTime !== undefined ? WeightCalculatorRequest.CycleTime : 1)
    switch (props.calculatorData.UOMType) {
      case MASS:
        setProcessCostTooltip('Process Cost = ((100 / Efficiency) * Weight * Rate) / Cavity')
        break;
      case AREA:
        setProcessCostTooltip('Process Cost = ((100 / Efficiency) * Weight * Rate) / Cavity')
        break;
      case TIME:
        setProcessCostTooltip('Process Cost = (( MHR * Cycle Time / 3600) * ( 100 / Efficiency)) / Cavity')
        break;
      case DIMENSIONLESS:
        setProcessCostTooltip('Process Cost = ((100 / Efficiency) * Quantity * Rate) / Cavity')
        break;
      case VOLUMETYPE:
        setProcessCostTooltip('Process Cost = ((100 / Efficiency) * Quantity * Rate) / Cavity')
        break;
      default:
        break;
    }

  }, [])

  useEffect(() => {

  }, [prodHr])

  const onSubmit = debounce((value) => {

    if (Number(getValues('Quantity')) === Number(0) || Number(getValues('Efficiency')) === Number(0)) {
      Toaster.warning('Mandatory fields can not be zero')
      return false
    }
    if (Object.keys(errors).length > 0) return false
    setIsDisable(true)
    let obj = {}
    obj.ProcessDefaultCalculatorId = props.calculatorData.ProcessDefaultCalculatorId ? props.calculatorData.ProcessDefaultCalculatorId : "00000000-0000-0000-0000-000000000000"
    obj.CostingProcessDetailsIdRef = WeightCalculatorRequest && WeightCalculatorRequest.CostingProcessDetailsIdRef ? WeightCalculatorRequest.CostingProcessDetailsIdRef : "00000000-0000-0000-0000-000000000000"
    obj.BaseCostingIdRef = props?.item?.CostingId
    obj.ProcessIdRef = props.calculatorData.ProcessId
    obj.IsChangeApplied = tempProcessObj === getValues('ProcessCost') ? false : true
    obj.TechnologyId = costData.TechnologyId
    obj.UnitOfMeasurementId = props.calculatorData.UnitOfMeasurementId
    obj.UOM = props.calculatorData.UOM
    obj.Tonnage = getValues('MachineTonnage') ? getValues('MachineTonnage') : ""
    obj.CycleTime = getValues('CycleTime')
    obj.Efficiency = getValues('Efficiency')
    obj.Cavity = getValues('Cavity')
    obj.Quantity = props.calculatorData.UOMType === TIME ? Number(checkForNull(processCost) / checkForNull(props.calculatorData.MHR)) : Number(quantityState)
    obj.ProcessCost = processCost
    obj.MachineRate = props?.calculatorData?.MHR
    obj.LoggedInUserId = loggedInUserId()
    obj.UnitTypeId = props.calculatorData.UOMTypeId
    obj.UnitType = props.calculatorData.UOMType
    obj.PartPerHour = props.calculatorData.UOMType === TIME ? checkForNull(quantityState) : ''
    obj.ExtrusionSpeed = getValues('ExtrusionSpeed')
    obj.PartLength = getValues('PartLength')
    obj.ProcessCostWithOutInterestAndDepreciation = netProcessCostWithOutInterestAndDepreciation
    obj.MHRWithOutInterestAndDepreciation = processMHRWithOutInterestAndDepreciation

    dispatch(saveDefaultProcessCostCalculationData(obj, res => {
      setIsDisable(false)
      if (res.data.Result) {
        obj.ProcessCalculationId = res.data.Identity
        Toaster.success('Calculation saved successfully.')
        calculateMachineTime('0.00', obj)
      }
    }))
  }, 500);
  /**
   * @method calculateProcessCost
   * @description FOR CALCULATING PROCESS COST 
  */
  const calculateProcessCost = () => {
    const efficiency = checkForNull(getValues('Efficiency'))
    const quantityValues = checkForNull(getValues('Quantity'))

    const quantity = props.calculatorData.UOMType === TIME ? Number(checkForNull(quantityState)) : Number(checkForNull(quantityValues))
    const cavity = checkForNull(getValues('Cavity'))
    let cost, netProcessCostWithOutInterestAndDepreciation

    const rate = props.calculatorData.MHR
   



    if (!props.CostingViewMode) {

      switch (props.calculatorData.UOMType) {
        case MASS:
          setDisabled(true)
          cost = ((100 / efficiency) * (quantity === 0 ? 1 : quantity) * rate) / cavity
         netProcessCostWithOutInterestAndDepreciation = ((100 / efficiency) * (quantity === 0 ? 1 : quantity) * processMHRWithOutInterestAndDepreciation) / cavity
          setNetProcessCostWithoutInterestAndDepreciation(netProcessCostWithOutInterestAndDepreciation)
          setProcessCost(cost)
          setValue('ProcessCost', checkForDecimalAndNull(cost, localStorage.NoOfDecimalForPrice))
          
          return true
        case AREA:
          setDisabled(true)
          cost = ((100 / efficiency) * (quantity === 0 ? 1 : quantity) * rate) / cavity
         netProcessCostWithOutInterestAndDepreciation = ((100 / efficiency) * (quantity === 0 ? 1 : quantity) * processMHRWithOutInterestAndDepreciation) / cavity
          setNetProcessCostWithoutInterestAndDepreciation(netProcessCostWithOutInterestAndDepreciation)
          setProcessCost(cost)
          
          setValue('ProcessCost', checkForDecimalAndNull(cost, localStorage.NoOfDecimalForPrice))
          return true
        case TIME:

          //This need to be done later
          // cost = rate / (quantity === 0 ? 1 : quantity);

          ({ processCost: cost, processCostWithoutInterestAndDepreciation: netProcessCostWithOutInterestAndDepreciation } = findProcessCost(props.calculatorData.UOM, rate, quantity === 0 ? 1 : quantity, processMHRWithOutInterestAndDepreciation))
          setNetProcessCostWithoutInterestAndDepreciation(netProcessCostWithOutInterestAndDepreciation)
          setProcessCost(cost)
          
          setValue('ProcessCost', checkForDecimalAndNull(cost, localStorage.NoOfDecimalForPrice))
          return;
        case DIMENSIONLESS:
          let updatedQuantity = quantity === 0 ? 1 : quantity
          setDisabled(true)
          cost = ((100 / efficiency) * (updatedQuantity) * (rate)) / cavity
          netProcessCostWithOutInterestAndDepreciation = ((100 / efficiency) * updatedQuantity * processMHRWithOutInterestAndDepreciation) / cavity
          setNetProcessCostWithoutInterestAndDepreciation(netProcessCostWithOutInterestAndDepreciation)
          setProcessCost(cost)
          
          setValue('ProcessCost', checkForDecimalAndNull(cost, localStorage.NoOfDecimalForPrice))
          return true
        case VOLUMETYPE:
          setDisabled(true)
          cost = ((100 / efficiency) * ((quantity === 0 ? 1 : quantity) * rate)) / cavity
         netProcessCostWithOutInterestAndDepreciation = ((100 / efficiency) * (quantity === 0 ? 1 : quantity) * processMHRWithOutInterestAndDepreciation) / cavity
          setNetProcessCostWithoutInterestAndDepreciation(netProcessCostWithOutInterestAndDepreciation)
          setProcessCost(cost)
          
          setValue('ProcessCost', checkForDecimalAndNull(cost, localStorage.NoOfDecimalForPrice))
          return true
        // case SHOTS:    MAY BE USED LATER
        //   setDisabled(true)
        //   cost = (1 / efficiency) * (rate / quantity)
        //   setProcessCost(cost)
        //   setValue('ProcessCost', checkForDecimalAndNull(cost, localStorage.NoOfDecimalForPrice))
        // return true
        default:

          break;
      }
    }
  }
  const calculateCycleTime = () => {
    const ExtrusionSpeed = checkForNull(getValues('ExtrusionSpeed'))
    const PartLength = checkForNull(getValues('PartLength'))
    const Efficiency = checkForNull(getValues('Efficiency')) / 100
    const CycleTime = (60 / ExtrusionSpeed * PartLength) / 1000 * Efficiency
    setValue('CycleTime', checkForDecimalAndNull(CycleTime, getConfigurationKey().NoOfDecimalForInputOutput))
  }

  const onCancel = () => {
    calculateMachineTime('0.00')
  }

  const handleProductionPerHour = () => {
    if (props.calculatorData.UOMType === TIME && props.CostingViewMode === false) {
      const cavity = checkForNull(getValues('Cavity'))
      const cycleTime = checkForNull(getValues('CycleTime'))
      const efficiency = checkForNull(getValues('Efficiency'))

      const prodPerHrs = (cavity * 3600 * efficiency) / (cycleTime * 100)

      setValue('Quantity', checkForDecimalAndNull(prodPerHrs, getConfigurationKey().NoOfDecimalForInputOutput))
      setQuantityState(prodPerHrs)
      setProdHr(prodPerHrs)
    }
  }



  const handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };

  return (
    <Fragment>
      <Row>
        <Col>
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="form"
            onKeyDown={(e) => { handleKeyDown(e, onSubmit.bind(this)); }}
          >
            <Col md="12" className={''}>
              <div className="border pl-3 pr-3 pt-3">

                <Row className={'mt15'}>
                  {
                    !(ProcessName.toLowerCase().includes('extrusion') && props.calculatorData.UOMType === TIME) &&
                    <Col md="4">
                      <NumberFieldHookForm
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
                  }
                  {
                    ((ProcessName.toLowerCase().includes('extrusion') && props.calculatorData.UOMType === TIME)) &&
                    <>
                      <Col md="4">
                        <TextFieldHookForm
                          label={'Extrusion Speed / Meter'}
                          name={'ExtrusionSpeed'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={true}
                          rules={{
                            required: true,
                            validate: { number, checkWhiteSpaces, decimalNumberLimit },
                          }}
                          handleChange={() => { }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.ExtrusionSpeed}
                          disabled={(props.CostingViewMode) ? true : false}
                        />
                      </Col>
                      <Col md="4">
                        <TextFieldHookForm
                          label={'Part Length (mm)'}
                          name={'PartLength'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={true}
                          rules={{
                            required: true,
                            validate: { number, checkWhiteSpaces, decimalNumberLimit },
                          }}
                          handleChange={() => { }}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.PartLength}
                          disabled={(props.CostingViewMode) ? true : false}
                        />
                      </Col>
                    </>
                  }
                  <Col md="4">
                    <TextFieldHookForm
                      label={`Efficiency (%)`}
                      name={'Efficiency'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        validate: { number, checkWhiteSpaces, percentageLimitValidation },
                        max: {
                          value: 100,
                          message: 'Percentage cannot be greater than 100'
                        },
                      }}
                      handleChange={() => { }}
                      defaultValue={100}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.Efficiency}
                      disabled={props.CostingViewMode ? true : false}
                    />
                  </Col>
                  {
                    hide &&
                    <Col md="4">
                      {(ProcessName.toLowerCase().includes('extrusion') && props.calculatorData.UOMType === TIME) && <TooltipCustom tooltipClass='cycle-time' disabledIcon={true} id={'cycle-time'} tooltipText={'(60/Extrusion Speed * Part Length (mm))/1000 * Efficiency'} />}
                      <NumberFieldHookForm
                        label={`Cycle Time(sec)`}
                        name={'CycleTime'}
                        Controller={Controller}
                        control={control}
                        register={register}
                        mandatory={!disable}
                        rules={{
                          required: !disable,
                          pattern: {
                            value: /^[0-9]\d*(\.\d+)?$/i,
                            message: 'Invalid Number.',
                          },
                        }}
                        id={'cycle-time'}
                        handleChange={() => { }}
                        defaultValue={''}
                        className=""
                        customClassName={'withBorder'}
                        errors={errors.CycleTime}
                        disabled={props.CostingViewMode || (ProcessName.toLowerCase().includes('extrusion') && props.calculatorData.UOMType === TIME) ? true : false}
                      />
                    </Col >
                  }

                  <Col md="4">
                    <NumberFieldHookForm
                      label={`Cavity`}
                      name={'Cavity'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={!disable}
                      rules={{
                        required: !disable,
                        pattern: {
                          value: /^[0-9]\d*$/i,
                          message: 'Cavity must be an integer value.',
                        },
                        validate: { nonZero, maxLength8 }
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.Cavity}
                      disabled={props.CostingViewMode ? true : false}
                    />
                  </Col>

                  <Col md="4">
                    <NumberFieldHookForm
                      label={props.calculatorData.UOMType === MASS ? `Weight` : props.calculatorData.UOMType === TIME ? `Parts/Hour` : `Quantity`}
                      name={'Quantity'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={true}
                      rules={{
                        required: true,
                        pattern: {
                          value: /^\d{0,6}(\.\d{0,4})?$/i,
                          message: 'Maximum length for integer is 6 and for decimal is 4',
                        },
                        validate: { nonZero }
                      }}
                      handleChange={calculateProcessCost}
                      defaultValue={defaultValues.Quantity}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.Quantity}
                      disabled={(props.calculatorData.UOMType === TIME || props.CostingViewMode) ? true : false}
                    />
                  </Col>
                  <Col md="4">
                    <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'process-cost'} tooltipText={processCostTooltip} />
                    <NumberFieldHookForm
                      label={`Process Cost`}
                      name={'ProcessCost'}
                      id={'process-cost'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                      }}
                      handleChange={() => { }}
                      defaultValue={''}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.ProcessCost}
                      disabled={true}
                    />
                  </Col>
                </Row >


              </div >
            </Col >
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
                type="button"
                onClick={onSubmit}
                disabled={props.CostingViewMode || isDisable ? true : false}
                className="btn-primary save-btn"
              >
                <div className={"save-icon"}></div>
                {'SAVE'}
              </button>
            </div>
          </form >
        </Col >
      </Row >
    </Fragment >
  )
}

export default SheetMetalBaicDrawer
