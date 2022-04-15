import React, { useState, useContext, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { costingInfoContext } from '../CostingDetailStepTwo'
import { useDispatch, useSelector } from 'react-redux'
import { NumberFieldHookForm } from '../../../layout/HookFormInputs'
import { calculatePercentageValue, checkForDecimalAndNull, checkForNull, findLostWeight, getConfigurationKey, loggedInUserId } from '../../../../helper'
import LossStandardTable from './LossStandardTable'
import { saveRawMaterialCalculationForPlastic } from '../../actions/CostWorking'
import Toaster from '../../../common/Toaster'
import { setPlasticArray } from '../../actions/Costing'

function Plastic(props) {
  const { item, rmRowData, isSummary, CostingViewMode } = props
  let totalRM
  if (!isSummary) {
    const { CostingPartDetails } = item
    const { IsApplyMasterBatch, MasterBatchTotal, MasterBatchPercentage } = CostingPartDetails

    //IF MASTER BATCH IS ADDED OUTSIDE THE CALCULATOR THEN RM RATE WILL BE SUM OF RMRATE AND MASTERBATCH RATE (AFTER PERCENTAGE)
    if (IsApplyMasterBatch) {
      const RMRate = calculatePercentageValue(rmRowData.RMRate, (100 - MasterBatchPercentage));
      const RMRatePlusMasterBatchRate = RMRate + checkForNull(MasterBatchTotal)
      totalRM = RMRatePlusMasterBatchRate
    } else {
      totalRM = Number(rmRowData.RMRate)
    }
  } else {
    totalRM = Number(rmRowData.RMRate)
  }

  const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest
  const costData = useContext(costingInfoContext)
  const dispatch = useDispatch()
  const { getPlasticData } = useSelector(state => state.costing)

  const defaultValues = {
    netWeight: WeightCalculatorRequest && WeightCalculatorRequest.NetWeight !== undefined ? WeightCalculatorRequest.NetWeight : '',
    runnerWeight: WeightCalculatorRequest && WeightCalculatorRequest.RunnerWeight !== undefined ? WeightCalculatorRequest.RunnerWeight : '',
    grossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== undefined ? WeightCalculatorRequest.GrossWeight : '',
    finishedWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== undefined ? WeightCalculatorRequest.FinishWeight : '',
    scrapWeight: WeightCalculatorRequest && WeightCalculatorRequest.ScrapWeight !== undefined ? WeightCalculatorRequest.ScrapWeight : '',
    rmCost: WeightCalculatorRequest && WeightCalculatorRequest.RMCost !== undefined ? WeightCalculatorRequest.RMCost : '',
    scrapCost: WeightCalculatorRequest && WeightCalculatorRequest.ScrapCost !== undefined ? WeightCalculatorRequest.ScrapCost : '',
    materialCost: WeightCalculatorRequest && WeightCalculatorRequest.NetRMCost !== undefined ? WeightCalculatorRequest.NetRMCost : '',
    burningAllownace: WeightCalculatorRequest && WeightCalculatorRequest.BurningValue !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.BurningValue * checkForNull(totalRM), getConfigurationKey().NoOfDecimalForInputOutput) : ''

  }

  const [tableVal, setTableVal] = useState(WeightCalculatorRequest && WeightCalculatorRequest.LossOfTypeDetails !== null ? WeightCalculatorRequest.LossOfTypeDetails : [])
  const [lostWeight, setLostWeight] = useState(WeightCalculatorRequest && WeightCalculatorRequest.NetLossWeight ? WeightCalculatorRequest.NetLossWeight : 0)
  const [dataToSend, setDataToSend] = useState({
    finishedWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== undefined ? WeightCalculatorRequest.FinishWeight : '',
    scrapWeight: WeightCalculatorRequest && WeightCalculatorRequest.ScrapWeight !== undefined ? WeightCalculatorRequest.ScrapWeight : '',
    rmCost: WeightCalculatorRequest && WeightCalculatorRequest.RMCost !== undefined ? WeightCalculatorRequest.RMCost : '',
    scrapCost: WeightCalculatorRequest && WeightCalculatorRequest.ScrapCost !== undefined ? WeightCalculatorRequest.ScrapCost : '',
    materialCost: WeightCalculatorRequest && WeightCalculatorRequest.NetRMCost !== undefined ? WeightCalculatorRequest.NetRMCost : '',
    burningValue: WeightCalculatorRequest && WeightCalculatorRequest.BurningValue !== undefined ? WeightCalculatorRequest.BurningValue : '',
    grossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== undefined ? WeightCalculatorRequest.GrossWeight : '',
  })



  const { register, control, setValue, getValues, handleSubmit, formState: { errors }, } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })

  const fieldValues = useWatch({
    control,
    name: ['netWeight', 'runnerWeight', 'finishedWeight'],
  })

  const dropDown = [
    {
      label: 'Processing Loss',
      value: 1,
    },
    {
      label: 'Burning Loss',
      value: 2
    },
  ]

  useEffect(() => {
    if (!CostingViewMode) {
      calculateGrossWeight()
      calculateRemainingCalculation(lostWeight)
    }
  }, [fieldValues])

  useEffect(() => {
    calculateGrossWeight()
    calculateRemainingCalculation()
  }, [getPlasticData])

  useEffect(() => {
    setValue('grossWeight', WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== undefined ? WeightCalculatorRequest.GrossWeight : '')

  }, [])



  /**
   * @method calculateGrossWeight
   * @description For Calculating gross weight
   */
  const calculateGrossWeight = () => {

    const netWeight = Number(getValues('netWeight'))
    const runnerWeight = Number(getValues('runnerWeight'))

    const grossWeight = checkForNull(netWeight) + checkForNull(runnerWeight) + Number(findLostWeight(getPlasticData && getPlasticData.length > 0 ? getPlasticData : WeightCalculatorRequest.LossOfTypeDetails ? WeightCalculatorRequest.LossOfTypeDetails : []))
    setValue('grossWeight', checkForDecimalAndNull(grossWeight, getConfigurationKey().NoOfDecimalForInputOutput))

    let updatedValue = dataToSend
    updatedValue.grossWeight = grossWeight
    setDataToSend(updatedValue)
  }
  /**
   * @method calculateRemainingCalculation
   * @description Calculating finished weight,scrap weight,RM cost, scrap cost,material cost
   */
  const calculateRemainingCalculation = (lostSum = 0) => {
    let scrapWeight = 0
    const netWeight = checkForNull(getValues('netWeight')) // THIS IS FIRST GROSS WEIGHT
    const runnerWeight = checkForNull(getValues('runnerWeight'))
    const finishedWeight = checkForNull(getValues('finishedWeight'))
    const grossWeight = checkForNull(netWeight) + checkForNull(runnerWeight) + Number(findLostWeight(getPlasticData && getPlasticData.length > 0 ? getPlasticData : WeightCalculatorRequest.LossOfTypeDetails ? WeightCalculatorRequest.LossOfTypeDetails : [])) //THIS IS FINAL GROSS WEIGHT -> FIRST GROSS WEIGHT + RUNNER WEIGHT +NET LOSS WEIGHT

    if (finishedWeight > grossWeight) {
      setValue('finishedWeight', 0)
      Toaster.warning('Finish Weight should not be greater than gross weight')
      return false
    }
    if (finishedWeight !== 0) {
      scrapWeight = (checkForNull(grossWeight) - checkForNull(finishedWeight)).toFixed(9) //FINAL GROSS WEIGHT - FINISHED WEIGHT

    }
    const rmCost = (checkForNull(grossWeight) * checkForNull(totalRM)) + getValues('burningAllownace') // FINAL GROSS WEIGHT * RMRATE (HERE RM IS RMRATE +MAMSTER BATCH (IF INCLUDED)) + BURNING ALLOWANCE
    const scrapCost = checkForNull(scrapWeight) * checkForNull(rmRowData.ScrapRate)
    const materialCost = checkForNull(rmCost) - checkForNull(scrapCost)

    const updatedValue = dataToSend
    updatedValue.scrapWeight = scrapWeight
    updatedValue.totalGrossWeight = grossWeight
    updatedValue.rmCost = rmCost
    updatedValue.scrapCost = scrapCost
    updatedValue.materialCost = materialCost

    setDataToSend(updatedValue)

    setValue('grossWeight', checkForDecimalAndNull(grossWeight, getConfigurationKey().NoOfDecimalForInputOutput)) // SETING FINAL GROSS WEIGHT VALUE
    setValue('scrapWeight', checkForDecimalAndNull(scrapWeight, getConfigurationKey().NoOfDecimalForInputOutput))
    setValue('rmCost', checkForDecimalAndNull(rmCost, getConfigurationKey().NoOfDecimalForPrice))
    setValue('scrapCost', checkForDecimalAndNull(scrapCost, getConfigurationKey().NoOfDecimalForPrice))
    setValue('materialCost', checkForDecimalAndNull(materialCost, getConfigurationKey().NoOfDecimalForPrice))
    setLostWeight(lostSum)

  }
  /**
     * @method cancel
     * @description used to Reset form
     */
  const cancel = () => {
    props.toggleDrawer('')
  }
  const onSubmit = () => {
    let obj = {}
    obj.PlasticWeightCalculatorId = WeightCalculatorRequest && WeightCalculatorRequest.PlasticWeightCalculatorId ? WeightCalculatorRequest.PlasticWeightCalculatorId : "0"
    obj.BaseCostingIdRef = costData.CostingId
    obj.TechnologyId = costData.TechnologyId
    obj.RawMaterialIdRef = rmRowData.RawMaterialId
    obj.CostingRawMaterialDetailsIdRef = rmRowData.RawMaterialDetailId
    obj.RawMaterialCost = dataToSend.materialCost
    obj.NetRMCost = dataToSend.NetRMCost
    obj.NetWeight = getValues('netWeight')
    obj.RunnerWeight = getValues('runnerWeight')
    obj.GrossWeight = dataToSend.grossWeight
    obj.FinishWeight = getValues('finishedWeight')
    obj.ScrapWeight = dataToSend.scrapWeight
    obj.RMCost = dataToSend.rmCost
    obj.ScrapCost = dataToSend.scrapCost
    obj.BurningValue = dataToSend.burningValue
    obj.LoggedInUserId = loggedInUserId()
    let tempArr = []
    tableVal && tableVal.map(item => (
      tempArr.push({ LossOfType: item.LossOfType, LossPercentage: item.LossPercentage, LossWeight: item.LossWeight, CostingCalculationDetailId: "0" })
    ))
    obj.LossOfTypeDetails = tempArr
    obj.NetLossWeight = lostWeight

    dispatch(saveRawMaterialCalculationForPlastic(obj, res => {
      if (res.data.Result) {
        obj.WeightCalculationId = res.data.Identity
        Toaster.success("Calculation saved successfully")
        dispatch(setPlasticArray([]))
        props.toggleDrawer('', obj)
      }
    }))
  }

  const tableData = (value = []) => {
    setTableVal(value)
  }

  const setBurningAllowance = (value) => {
    const burningAllownace = value * checkForNull(totalRM)
    setValue('burningAllownace', checkForDecimalAndNull(burningAllownace, getConfigurationKey().NoOfDecimalForInputOutput))
    const updatedValue = dataToSend
    updatedValue.burningValue = value
    setDataToSend(updatedValue)
  }
  return (
    <Fragment>
      <Row>
        <form noValidate className="form" onSubmit={handleSubmit(onSubmit)}>
          <Col md="12">
            <div className="costing-border px-4">
              <Row>
                <Col md="12" className={'mt25'}>
                  <div className="header-title">
                    <h5>{'Input Weight Calculator:'}</h5>
                  </div>
                </Col>
              </Row>

              <Row className={''}>
                <Col md="3" >
                  <NumberFieldHookForm
                    label={`Gross Weight (Kg)`}
                    name={'netWeight'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={true}
                    rules={{
                      required: true,
                      pattern: {
                        value: /^\d{0,4}(\.\d{0,6})?$/i,
                        message: 'Maximum length for interger is 4 and for decimal is 6',
                      },
                      // maxLength: 4,
                    }}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.netWeight}
                    disabled={props.CostingViewMode ? props.CostingViewMode : false}
                  />
                </Col>
                <Col md="3">
                  <NumberFieldHookForm
                    label={`Runner Weight`}
                    name={'runnerWeight'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    rules={{
                      required: false,
                      pattern: {
                        value: /^\d{0,4}(\.\d{0,6})?$/i,
                        message: 'Maximum length for interger is 4 and for decimal is 6',
                      },
                    }}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.runnerWeight}
                    disabled={props.CostingViewMode ? props.CostingViewMode : false}
                  />
                </Col>

              </Row>

              <LossStandardTable
                dropDownMenu={dropDown}
                calculation={calculateRemainingCalculation}
                weightValue={Number(getValues('netWeight'))}
                netWeight={WeightCalculatorRequest && WeightCalculatorRequest.NetLossWeight !== null ? WeightCalculatorRequest.NetLossWeight : ''}
                sendTable={WeightCalculatorRequest && WeightCalculatorRequest.LossOfTypeDetails !== null ? WeightCalculatorRequest.LossOfTypeDetails : []}
                tableValue={tableData}
                CostingViewMode={props.CostingViewMode ? props.CostingViewMode : false}
                burningLoss={setBurningAllowance}
                burningValue={WeightCalculatorRequest && WeightCalculatorRequest.BurningValue !== null ? WeightCalculatorRequest.BurningValue : ''}
                isPlastic={true}
                isLossStandard={false}
                isNonFerrous={false}
              />

              <Row className={'mt25'}>
                <Col md="3" >
                  <NumberFieldHookForm
                    label={`Total Gross Weight (Kg)`}
                    name={'grossWeight'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.grossWeight}
                    disabled={true}
                  />
                </Col>
                <Col md="3" >
                  <NumberFieldHookForm
                    label={`Finished Weight(Kg)`}
                    name={'finishedWeight'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    rules={{
                      required: true,
                      pattern: {
                        value: /^\d{0,4}(\.\d{0,7})?$/i,
                        message: 'Maximum length for interger is 4 and for decimal is 7',
                      },

                    }}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.finishedWeight}
                    disabled={props.CostingViewMode ? props.CostingViewMode : false}
                  />
                </Col>
                <Col md="3">
                  <NumberFieldHookForm
                    label={`Scrap Weight(Kg)`}
                    name={'scrapWeight'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    handleChange={() => { }}
                    defaultValue={WeightCalculatorRequest &&
                      WeightCalculatorRequest.ScrapWeight !== undefined
                      ? WeightCalculatorRequest.ScrapWeight
                      : ''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.scrapWeight}
                    disabled={true}
                  />
                </Col>
                <Col md="3">
                  <NumberFieldHookForm
                    label={`Burning Allowance`}
                    name={'burningAllownace'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.burningAllownace}
                    disabled={true}
                  />
                </Col>
                <Col md="3">
                  <NumberFieldHookForm
                    label={`RM Cost`}
                    name={'rmCost'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.rmCost}
                    disabled={true}
                  />
                </Col>
                <Col md="3">
                  <NumberFieldHookForm
                    label={`Scrap Cost`}
                    name={'scrapCost'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.scrapCost}
                    disabled={true}
                  />
                </Col>

                <Col md="3">
                  <NumberFieldHookForm
                    // Confirm this name from tanmay sir
                    label={`Net RM Cost`}
                    name={'materialCost'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.materialCost}
                    disabled={true}
                  />
                </Col>
              </Row>

            </div>
          </Col>

          {!CostingViewMode && <div className="col-sm-12 text-right px-0 mt-4">
            <button
              type={'button'}
              className="reset mr15 cancel-btn"
              onClick={cancel} >
              <div className={'cancel-icon'}></div> {'Cancel'}
            </button>
            <button
              type={'submit'}
              className="submit-button save-btn">
              <div className={'save-icon'}></div>
              {'Save'}
            </button>
          </div>}
        </form>

      </Row>
    </Fragment>
  )
}

export default Plastic
