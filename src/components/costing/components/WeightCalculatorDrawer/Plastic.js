import React, { useState, useContext, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { costingInfoContext } from '../CostingDetailStepTwo'
import { useDispatch, useSelector } from 'react-redux'
import { NumberFieldHookForm, TextFieldHookForm } from '../../../layout/HookFormInputs'
import { calculatePercentageValue, calculateScrapWeight, checkForDecimalAndNull, checkForNull, findLostWeight, getConfigurationKey, loggedInUserId } from '../../../../helper'
import LossStandardTable from './LossStandardTable'
import { saveRawMaterialCalculationForPlastic } from '../../actions/CostWorking'
import Toaster from '../../../common/Toaster'
import { setPlasticArray } from '../../actions/Costing'
import { debounce } from 'lodash'
import { nonZero, number, checkWhiteSpaces, decimalAndNumberValidation, percentageLimitValidation } from '../../../../helper/validation'
import TooltipCustom from '../../../common/Tooltip'

function Plastic(props) {
  const { item, rmRowData, isSummary, CostingViewMode, DisableMasterBatchCheckbox } = props

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
    netWeight: WeightCalculatorRequest && WeightCalculatorRequest.NetWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NetWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
    runnerWeight: WeightCalculatorRequest && WeightCalculatorRequest.RunnerWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RunnerWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
    grossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
    finishedWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.FinishWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
    scrapWeight: WeightCalculatorRequest && WeightCalculatorRequest.ScrapWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ScrapWeight, getConfigurationKey().NoOfDecimalForInputOutput) : '',
    scrapRecoveryPercent: WeightCalculatorRequest && WeightCalculatorRequest?.RecoveryPercentage !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RecoveryPercentage, localStorage.NoOfDecimalForInputOutput) : '',
    rmCost: WeightCalculatorRequest && WeightCalculatorRequest.RMCost !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RMCost, getConfigurationKey().NoOfDecimalForPrice) : '',
    scrapCost: WeightCalculatorRequest && WeightCalculatorRequest.ScrapCost !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ScrapCost, getConfigurationKey().NoOfDecimalForPrice) : '',
    materialCost: WeightCalculatorRequest && WeightCalculatorRequest.RawMaterialCost !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RawMaterialCost, getConfigurationKey().NoOfDecimalForPrice) : '',
    burningAllownace: WeightCalculatorRequest && WeightCalculatorRequest.BurningValue !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.BurningValue * checkForNull(totalRM), getConfigurationKey().NoOfDecimalForInputOutput) : ''

  }

  const [tableVal, setTableVal] = useState(WeightCalculatorRequest && WeightCalculatorRequest.LossOfTypeDetails !== null ? WeightCalculatorRequest.LossOfTypeDetails : [])
  const [lostWeight, setLostWeight] = useState(WeightCalculatorRequest && WeightCalculatorRequest.NetLossWeight ? WeightCalculatorRequest.NetLossWeight : 0)
  const [dataToSend, setDataToSend] = useState({
    finishedWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== undefined ? WeightCalculatorRequest.FinishWeight : '',
    scrapWeight: WeightCalculatorRequest && WeightCalculatorRequest.ScrapWeight !== undefined ? WeightCalculatorRequest.ScrapWeight : '',
    rmCost: WeightCalculatorRequest && WeightCalculatorRequest.RMCost !== undefined ? WeightCalculatorRequest.RMCost : '',
    scrapCost: WeightCalculatorRequest && WeightCalculatorRequest.ScrapCost !== undefined ? WeightCalculatorRequest.ScrapCost : '',
    materialCost: WeightCalculatorRequest && WeightCalculatorRequest.RawMaterialCost !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RawMaterialCost, getConfigurationKey().NoOfDecimalForPrice) : '',
    burningValue: WeightCalculatorRequest && WeightCalculatorRequest.BurningValue !== undefined ? WeightCalculatorRequest.BurningValue : '',
    grossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== undefined ? WeightCalculatorRequest.GrossWeight : '',
  })
  const [isDisable, setIsDisable] = useState(false)
  const [reRender, setRerender] = useState(false)

  const { register, control, setValue, getValues, handleSubmit, formState: { errors }, } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })

  const fieldValues = useWatch({
    control,
    name: ['netWeight', 'runnerWeight', 'finishedWeight', 'scrapRecoveryPercent'],
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
    if (!CostingViewMode) {
      calculateGrossWeight()
      calculateRemainingCalculation()
    }
  }, [getPlasticData])

  useEffect(() => {
    setValue('grossWeight', WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== undefined ? WeightCalculatorRequest.GrossWeight : '')

  }, [])

  useEffect(() => {
    if (Number(getValues('finishedWeight')) < Number(dataToSend.grossWeight)) {
      delete errors.finishedWeight
      setRerender(!reRender)
    }
  }, [dataToSend.grossWeight])

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
    const scrapRecoveryPercent = Number((getValues('scrapRecoveryPercent')))

    const finishedWeight = checkForNull(getValues('finishedWeight'))
    const grossWeight = checkForNull(netWeight) + checkForNull(runnerWeight) + Number(findLostWeight(getPlasticData && getPlasticData.length > 0 ? getPlasticData : WeightCalculatorRequest.LossOfTypeDetails ? WeightCalculatorRequest.LossOfTypeDetails : [])) //THIS IS FINAL GROSS WEIGHT -> FIRST GROSS WEIGHT + RUNNER WEIGHT +NET LOSS WEIGHT

    if (finishedWeight !== 0) {
      scrapWeight = calculateScrapWeight(grossWeight, finishedWeight, scrapRecoveryPercent)
      setValue('scrapWeight', checkForDecimalAndNull(scrapWeight, getConfigurationKey().NoOfDecimalForInputOutput))
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
  const onSubmit = debounce(handleSubmit((values) => {
    DisableMasterBatchCheckbox(!item?.CostingPartDetails?.IsApplyMasterBatch ? true : false)
    setIsDisable(true)
    let obj = {}

    obj.PlasticWeightCalculatorId = WeightCalculatorRequest && WeightCalculatorRequest.PlasticWeightCalculatorId ? WeightCalculatorRequest.PlasticWeightCalculatorId : "0"
    obj.BaseCostingIdRef = item.CostingId
    obj.TechnologyId = costData.TechnologyId
    obj.RawMaterialIdRef = rmRowData.RawMaterialId
    obj.CostingRawMaterialDetailsIdRef = rmRowData.RawMaterialDetailId
    obj.RawMaterialCost = dataToSend.materialCost
    obj.NetRMCost = dataToSend.NetRMCost
    obj.NetWeight = getValues('netWeight')
    obj.RunnerWeight = getValues('runnerWeight')
    obj.GrossWeight = dataToSend.grossWeight
    obj.FinishWeight = getValues('finishedWeight')
    obj.RecoveryPercentage = getValues('scrapRecoveryPercent')
    obj.ScrapWeight = dataToSend.scrapWeight
    obj.RMCost = dataToSend.rmCost
    obj.ScrapCost = dataToSend.scrapCost
    obj.BurningValue = dataToSend.burningValue
    obj.LoggedInUserId = loggedInUserId()
    obj.LayoutType = "Plastic"
    let tempArr = []
    tableVal && tableVal.map(item => (
      tempArr.push({ LossOfType: item.LossOfType, LossPercentage: item.LossPercentage, LossWeight: item.LossWeight, CostingCalculationDetailId: "0" })
    ))
    obj.LossOfTypeDetails = tempArr
    obj.NetLossWeight = lostWeight

    dispatch(saveRawMaterialCalculationForPlastic(obj, res => {
      setIsDisable(false)
      if (res.data.Result) {
        obj.WeightCalculationId = res.data.Identity
        Toaster.success("Calculation saved successfully")
        dispatch(setPlasticArray([]))
        props.toggleDrawer('', obj)
      }
    }))
  }), 500);

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

  const handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };

  return (
    <Fragment>
      <Row>
        <form noValidate className="form"
          onKeyDown={(e) => { handleKeyDown(e, onSubmit.bind(this)); }}>
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
                    label={`Gross Weight(Kg)`}
                    name={'netWeight'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={true}
                    rules={{
                      required: true,
                      validate: { nonZero, number, decimalAndNumberValidation }
                    }}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.netWeight}
                    disabled={props.CostingViewMode ? props.CostingViewMode : (tableVal?.length > 0 ? true : false)}
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
                      validate: { number, decimalAndNumberValidation }
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
                  <TooltipCustom disabledIcon={true} tooltipClass='weight-of-sheet' id={'gross-weight-plastic'} tooltipText={'Input Weight = (Gross Weight + Runner Weight + Other Loss Weight)'} />
                  <TextFieldHookForm
                    label={`Input Weight(Kg)`}
                    name={'grossWeight'}
                    id={'gross-weight-plastic'}
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
                    mandatory={true}
                    rules={{
                      required: true,
                      validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                      max: {
                        value: getValues('grossWeight'),
                        message: 'Finish weight should not be greater than gross weight.'
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
                  <TextFieldHookForm
                    label={`Scrap Recovery (%)`}
                    name={'scrapRecoveryPercent'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    rules={{
                      required: false,
                      validate: { number, checkWhiteSpaces, percentageLimitValidation },
                      max: {
                        value: 100,
                        message: 'Percentage cannot be greater than 100'
                      },
                    }}
                    mandatory={false}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.scrapRecoveryPercent}
                    disabled={props.CostingViewMode ? true : false}
                  />
                </Col>
                <Col md="3">
                  <TooltipCustom disabledIcon={true} id={'scrap-weight-plastic'} tooltipText={'Scrap Weight = (Input Weight - Finish Weight )* Scrap Recovery (%)/100'} />
                  <TextFieldHookForm
                    label={`Scrap Weight(Kg)`}
                    name={'scrapWeight'}
                    Controller={Controller}
                    control={control}
                    id={'scrap-weight-plastic'}
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
                  <TooltipCustom disabledIcon={true} id={'burning-allowance'} tooltipText={'Burning Allowance = (RM Rate * Burning Loss Weight)'} />
                  <TextFieldHookForm
                    label={`Burning Allowance`}
                    name={'burningAllownace'}
                    Controller={Controller}
                    id={'burning-allowance'}
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
                  <TooltipCustom disabledIcon={true} id={'rm-cost-plactic'} tooltipText={'RM Cost = (Input Weight * RM Rate + Burning Allowance)'} />
                  <TextFieldHookForm
                    label={`RM Cost`}
                    name={'rmCost'}
                    Controller={Controller}
                    id={'rm-cost-plactic'}
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
                  <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'scrap-cost-plastic'} tooltipText={'Scrap Cost = (Scrap Rate * Scrap Weight)'} />
                  <TextFieldHookForm
                    label={`Scrap Cost`}
                    name={'scrapCost'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    id={'scrap-cost-plastic'}
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
                  <TooltipCustom disabledIcon={true} id={'net-rm-cost-plastic'} tooltipText={'Net RM Cost = (RM Cost - Scrap Cost)'} />
                  <TextFieldHookForm
                    // Confirm this name from tanmay sir
                    label={`Net RM Cost`}
                    name={'materialCost'}
                    Controller={Controller}
                    id={'net-rm-cost-plastic'}
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

          {!CostingViewMode && <div className="col-sm-12 text-right mt-4">
            <button
              type={'button'}
              className="reset mr15 cancel-btn"
              onClick={cancel} >
              <div className={'cancel-icon'}></div> {'Cancel'}
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={props.CostingViewMode || isDisable ? true : false}
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
