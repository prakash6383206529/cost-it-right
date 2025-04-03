import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import Toaster from '../../../../common/Toaster'
import { saveRawMaterialCalculationForForging } from '../../../actions/CostWorking'
import { number, checkWhiteSpaces, decimalAndNumberValidation, percentageLimitValidation, decimalNumberLimit } from "../../../../../helper/validation"
import { TextFieldHookForm } from '../../../../layout/HookFormInputs'
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId } from '../../../../../helper'
import MachiningStockTable from '../MachiningStockTable'
import LossStandardTable from '../LossStandardTable'
import { debounce } from 'lodash'
import TooltipCustom from '../../../../common/Tooltip'
import { reactLocalStorage } from 'reactjs-localstorage'
import { sourceCurrencyFormatter } from '../../Drawers/processCalculatorDrawer/CommonFormula'

function HotForging(props) {
  const { rmRowData, CostingViewMode, item } = props
  const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest
  const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
  const defaultValues = {
    finishedWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.FinishWeight, initialConfiguration?.NoOfDecimalForInputOutput) : '',
    forgedWeight: WeightCalculatorRequest && WeightCalculatorRequest.ForgedWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ForgedWeight, initialConfiguration?.NoOfDecimalForInputOutput) : '',
    BilletDiameter: WeightCalculatorRequest && WeightCalculatorRequest.BilletDiameter !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.BilletDiameter, initialConfiguration?.NoOfDecimalForInputOutput) : '',
    BilletLength: WeightCalculatorRequest && WeightCalculatorRequest.BilletLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.BilletLength, initialConfiguration?.NoOfDecimalForInputOutput) : '',
    InputLength: WeightCalculatorRequest && WeightCalculatorRequest.InputLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.InputLength, initialConfiguration?.NoOfDecimalForInputOutput) : '',
    NoOfPartsPerLength: WeightCalculatorRequest && WeightCalculatorRequest.NoOfPartsPerLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NoOfPartsPerLength, initialConfiguration?.NoOfDecimalForInputOutput) : '',
    EndBitLength: WeightCalculatorRequest && WeightCalculatorRequest.EndBitLength !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.EndBitLength, initialConfiguration?.NoOfDecimalForInputOutput) : '',
    EndBitLoss: WeightCalculatorRequest && WeightCalculatorRequest.EndBitLoss !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.EndBitLoss, initialConfiguration?.NoOfDecimalForInputOutput) : '',
    TotalInputWeight: WeightCalculatorRequest && WeightCalculatorRequest.TotalInputWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.TotalInputWeight, initialConfiguration?.NoOfDecimalForInputOutput) : '',
    ScrapWeight: WeightCalculatorRequest && WeightCalculatorRequest.ScrapWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ScrapWeight, initialConfiguration?.NoOfDecimalForInputOutput) : '',
    ScrapCost: WeightCalculatorRequest && WeightCalculatorRequest.ScrapCost !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ScrapCost, initialConfiguration?.NoOfDecimalForPrice) : '',
    NetRMCostComponent: WeightCalculatorRequest && WeightCalculatorRequest.RawMaterialCost !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RawMaterialCost, initialConfiguration?.NoOfDecimalForPrice) : '',
    forgingScrapWeight: WeightCalculatorRequest && WeightCalculatorRequest.ForgingScrapWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ForgingScrapWeight, initialConfiguration?.NoOfDecimalForInputOutput) : '',
    machiningScrapWeight: WeightCalculatorRequest && WeightCalculatorRequest.MachiningScrapWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.MachiningScrapWeight, initialConfiguration?.NoOfDecimalForInputOutput) : '',
    forgingScrapRecoveryPercent: WeightCalculatorRequest && WeightCalculatorRequest.ForgingScrapRecoveryPercentage !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ForgingScrapRecoveryPercentage, initialConfiguration?.NoOfDecimalForInputOutput) : '',
    machiningScrapRecoveryPercent: WeightCalculatorRequest && WeightCalculatorRequest.MachiningScrapRecoveryPercentage !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.MachiningScrapRecoveryPercentage, initialConfiguration?.NoOfDecimalForInputOutput) : '',
    forgingScrapCost: WeightCalculatorRequest && WeightCalculatorRequest.ForgingScrapCost !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ForgingScrapCost, initialConfiguration?.NoOfDecimalForPrice) : '',
    machiningScrapCost: WeightCalculatorRequest && WeightCalculatorRequest.MachiningScrapCost !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.MachiningScrapCost, initialConfiguration?.NoOfDecimalForPrice) : '',
  }

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: defaultValues,
  })
  const { forgingCalculatorMachiningStockSectionValue, currencySource } = useSelector(state => state.costing)

  const fieldValues = useWatch({
    control,
    name: ['finishedWeight', 'BilletDiameter', 'BilletLength', 'ScrapRecoveryPercentage', 'forgingScrapRecoveryPercent', 'machiningScrapRecoveryPercent', 'tolerance'],

  })

  const dispatch = useDispatch()
  const [forgeWeightValue, setForgeWeightValue] = useState(WeightCalculatorRequest && WeightCalculatorRequest.ForgedWeight ? WeightCalculatorRequest.ForgedWeight : 0)
  const [lostWeight, setLostWeight] = useState(WeightCalculatorRequest && WeightCalculatorRequest.NetLossWeight ? WeightCalculatorRequest.NetLossWeight : 0)
  const [tableVal, setTableVal] = useState(WeightCalculatorRequest && WeightCalculatorRequest.LossOfTypeDetails !== null ? WeightCalculatorRequest.LossOfTypeDetails : [])
  const [tableV, setTableV] = useState(WeightCalculatorRequest && WeightCalculatorRequest.ForgingStockDetails !== null ? WeightCalculatorRequest.ForgingStockDetails : [])
  const [dataSend, setDataSend] = useState({})
  const [totalMachiningStock, setTotalMachiningStock] = useState(WeightCalculatorRequest && WeightCalculatorRequest.TotalMachiningStock ? WeightCalculatorRequest.TotalMachiningStock : 0)
  const [disableAll, setDisableAll] = useState(Object.keys(WeightCalculatorRequest).length > 0 && WeightCalculatorRequest && WeightCalculatorRequest.finishedWeight !== null ? false : true)
  const [isDisable, setIsDisable] = useState(false)

  useEffect(() => {
    if (!CostingViewMode) {
      calculateForgeWeight()
      calculateInputLength()
      calculateNoOfPartsPerLength()
      calculateEndBitLength()
      calculateEndBitLoss()
      calculateTotalInputWeight()
      calculateScrapWeight()
      calculateScrapCost()
      calculateNetRmCostComponent()
    }

  }, [fieldValues, lostWeight, forgeWeightValue])

  useEffect(() => {
    if (WeightCalculatorRequest) {
      setValue("tolerance", WeightCalculatorRequest && WeightCalculatorRequest.Tolerance !== undefined ? WeightCalculatorRequest.Tolerance : '')
    }
  }, [])

  /**
   * @method calculateForgeWeight
   * @description calculate forge weight
   */
  const calculateForgeWeight = () => {

    const finishedWeight = checkForNull(getValues('finishedWeight'))
    const forgedWeight = checkForNull(finishedWeight) + checkForNull(totalMachiningStock)
    const machiningScrapRecoveryPercent = checkForNull(getValues('machiningScrapRecoveryPercent'))
    const machiningScrapWeight = (forgedWeight - finishedWeight) * machiningScrapRecoveryPercent / 100
    let obj = dataSend
    obj.forgedWeight = forgedWeight
    obj.machiningScrapWeight = machiningScrapWeight
    setDataSend(obj)
    setValue('forgedWeight', checkForDecimalAndNull(forgedWeight, initialConfiguration?.NoOfDecimalForInputOutput))
    setValue('machiningScrapWeight', checkForDecimalAndNull(machiningScrapWeight, initialConfiguration?.NoOfDecimalForInputOutput))
    setForgeWeightValue(forgedWeight)
  }

  /**
     * @method calculateInputLength
     * @description calculate Input Length
     */

  const calculateInputLength = () => {

    const BilletDiameter = checkForNull(getValues('BilletDiameter'))
    const forgedWeight = checkForNull(forgeWeightValue)
    const InputLength = (checkForNull(forgedWeight) + checkForNull(lostWeight)) / ((Math.PI / 4) * Math.pow(BilletDiameter, 2) * rmRowData.Density / 1000000)

    let obj = dataSend
    obj.InputLength = InputLength
    setDataSend(obj)
    setValue('InputLength', checkForDecimalAndNull(InputLength, getConfigurationKey().NoOfDecimalForInputOutput))

    //setInputLengthValue(InputLength)
  }
  /**
   * @method calculateNoOfPartsPerLength
   * @description calculate No Of Parts Per Length
   */
  const calculateNoOfPartsPerLength = () => {
    const BilletLength = checkForDecimalAndNull(getValues('BilletLength'), getConfigurationKey().NoOfDecimalForInputOutput)
    const InputLength = dataSend.InputLength
    const NoOfPartsPerLength = parseInt(BilletLength / InputLength)
    let obj = dataSend
    obj.NoOfPartsPerLength = NoOfPartsPerLength
    setDataSend(obj)
    setValue('NoOfPartsPerLength', checkForDecimalAndNull(NoOfPartsPerLength, getConfigurationKey().NoOfDecimalForPrice))

  }

  /**
  * @method calculateEndBitLength
  * @description calculate EndBit Length 
  */
  const calculateEndBitLength = () => {
    const BilletLength = checkForNull(getValues('BilletLength'))
    const InputLength = dataSend.InputLength
    const NoOfPartsPerLength = dataSend.NoOfPartsPerLength
    let EndBitLength = BilletLength - (InputLength * NoOfPartsPerLength)
    let obj = dataSend
    if (EndBitLength < 0) {
      Toaster.warning('End bit length cannot be negative')
      EndBitLength = 0
    }
    obj.EndBitLength = EndBitLength
    setDataSend(obj)
    setValue('EndBitLength', checkForDecimalAndNull(EndBitLength, getConfigurationKey().NoOfDecimalForPrice))
  }

  /**
  * @method calculateEndBitLoss
  * @description calculate End BitLoss
  */
  const calculateEndBitLoss = () => {
    const BilletDiameter = checkForNull(getValues('BilletDiameter'))
    const EndBitLength = checkForNull(dataSend.EndBitLength)
    const NoOfPartsPerLength = checkForNull(dataSend.NoOfPartsPerLength)
    const EndBitLoss = ((Math.PI / 4) * checkForNull(BilletDiameter) * checkForNull(BilletDiameter) * checkForNull(EndBitLength) * (rmRowData.Density / 1000000) / checkForNull(NoOfPartsPerLength))
    let obj = dataSend
    obj.EndBitLoss = EndBitLoss
    setDataSend(obj)
    setValue('EndBitLoss', checkForDecimalAndNull(EndBitLoss, getConfigurationKey().NoOfDecimalForPrice))

  }

  /**
  * @method calculateTotalInputWeight
  * @description Calculate Total Input Weight
  */

  const calculateTotalInputWeight = () => {
    const forgedWeight = checkForNull(forgeWeightValue)
    const EndBitLoss = checkForNull(dataSend.EndBitLoss)
    const tolerance = checkForNull(getValues('tolerance'))
    const TotalInputWeight = checkForNull(forgedWeight) + checkForNull(lostWeight) + checkForNull(EndBitLoss) + tolerance
    const forgingScrapRecoveryPercent = checkForNull(getValues('forgingScrapRecoveryPercent'))
    const ForgingScrapWeight = (TotalInputWeight - forgedWeight) * forgingScrapRecoveryPercent / 100
    let obj = dataSend
    obj.TotalInputWeight = TotalInputWeight
    obj.ForgingScrapWeight = ForgingScrapWeight
    setDataSend(obj)
    setValue('TotalInputWeight', checkForDecimalAndNull(TotalInputWeight, initialConfiguration?.NoOfDecimalForInputOutput))
    setValue('forgingScrapWeight', checkForDecimalAndNull(ForgingScrapWeight, initialConfiguration?.NoOfDecimalForInputOutput))
  }

  /**
   * @method calculateScrapWeight
   * @description Calculate Scrap Weight
   *
   */
  const calculateScrapWeight = () => {
    const ForgingScrapWeight = Number((getValues('forgingScrapWeight')))
    const MachiningScrapWeight = Number(getValues('machiningScrapWeight'))

    let ScrapWeight = ForgingScrapWeight + MachiningScrapWeight
    let obj = dataSend
    obj.ScrapWeight = ScrapWeight

    setDataSend(obj)
    setValue('ScrapWeight', checkForDecimalAndNull(ScrapWeight, initialConfiguration?.NoOfDecimalForInputOutput))

  }
  /**
   * @method calculateScrapCost
   * @description Calculate Scrap Cost
   */
  const calculateScrapCost = () => {
    const forgingScrapWeight = checkForNull(getValues('forgingScrapWeight'))
    const machiningScrapWeight = checkForNull(getValues('machiningScrapWeight'))
    const forgingScrapRecoveryPercent = checkForNull(getValues('forgingScrapRecoveryPercent'))
    const machiningScrapRecoveryPercent = checkForNull(getValues('machiningScrapRecoveryPercent'))
    const forgingScrapCost = checkForNull(forgingScrapWeight) * checkForNull(rmRowData?.ScrapRate)
    const machiningScrapCost = checkForNull(machiningScrapWeight) * checkForNull(rmRowData?.MachiningScrapRate)
    const ScrapCost = forgingScrapCost + machiningScrapCost
    let obj = dataSend
    obj.ScrapCost = ScrapCost
    obj.forgingScrapCost = forgingScrapCost
    obj.machiningScrapCost = machiningScrapCost
    setDataSend(obj)
    setValue('ScrapCost', checkForDecimalAndNull(ScrapCost, getConfigurationKey().NoOfDecimalForPrice))
    setValue('forgingScrapCost', checkForDecimalAndNull(forgingScrapCost, getConfigurationKey().NoOfDecimalForPrice))
    setValue('machiningScrapCost', checkForDecimalAndNull(machiningScrapCost, getConfigurationKey().NoOfDecimalForPrice))
  }

  /**
   * @method calculateNetRmCostComponent
   * @description calculate Net Rm Cost/Component
   */

  const calculateNetRmCostComponent = () => {
    const TotalInputWeight = dataSend.TotalInputWeight
    const ScrapCost = dataSend.ScrapCost
    const NetRMCostComponent = (TotalInputWeight * rmRowData.RMRate - ScrapCost)
    let obj = dataSend
    obj.NetRMCostComponent = NetRMCostComponent
    setDataSend(obj)
    setValue('NetRMCostComponent', checkForDecimalAndNull(NetRMCostComponent, getConfigurationKey().NoOfDecimalForPrice))
  }

  /**
   * @method onSubmit
   * @description Form submission Function
   */

  const onSubmit = debounce(handleSubmit((values) => {
    setIsDisable(true)
    let obj = {}
    obj.LayoutType = 'Hot'
    obj.ForgingWeightCalculatorId = WeightCalculatorRequest && WeightCalculatorRequest.ForgingWeightCalculatorId ? WeightCalculatorRequest.ForgingWeightCalculatorId : "0"
    obj.CostingRawMaterialDetailsIdRef = rmRowData.RawMaterialDetailId
    obj.RawMaterialIdRef = rmRowData.RawMaterialId
    obj.BaseCostingIdRef = item.CostingId
    obj.LoggedInUserId = loggedInUserId()
    obj.FinishWeight = getValues('finishedWeight')
    obj.ForgedWeight = dataSend.forgedWeight
    obj.GrossWeight = dataSend.TotalInputWeight
    obj.BilletDiameter = getValues('BilletDiameter')
    obj.BilletLength = getValues('BilletLength')
    obj.InputLength = dataSend.InputLength
    obj.NoOfPartsPerLength = dataSend.NoOfPartsPerLength
    obj.EndBitLength = dataSend.EndBitLength
    obj.EndBitLoss = dataSend.EndBitLoss
    obj.TotalInputWeight = dataSend.TotalInputWeight // BIND IT WITH GROSS WEIGHT KEY
    obj.ScrapWeight = dataSend.ScrapWeight
    obj.RecoveryPercentage = getValues('ScrapRecoveryPercentage')
    obj.ScrapCost = dataSend.ScrapCost
    obj.RawMaterialCost = dataSend.NetRMCostComponent
    obj.MachiningScrapRecoveryPercentage = checkForNull(getValues('machiningScrapRecoveryPercent'))
    obj.ForgingScrapRecoveryPercentage = checkForNull(getValues('forgingScrapRecoveryPercent'))
    obj.ForgingScrapWeight = dataSend.ForgingScrapWeight
    obj.MachiningScrapWeight = dataSend.machiningScrapWeight
    obj.ForgingScrapCost = dataSend.forgingScrapCost
    obj.MachiningScrapCost = dataSend.machiningScrapCost
    obj.Tolerance = checkForNull(getValues('tolerance'))

    let tempArr = []
    tableVal && tableVal.map(item => (
      tempArr.push({ LossOfType: item.LossOfType, FlashLoss: item.FlashLoss, FlashLossId: item.FlashLossId, LossPercentage: item.LossPercentage, FlashLength: item.FlashLength, FlashThickness: item.FlashThickness, FlashWidth: item.FlashWidth, BarDiameter: item.BarDiameter, BladeThickness: item.BladeThickness, LossWeight: item.LossWeight, CostingCalculationDetailId: "0" })
    ))
    obj.LossOfTypeDetails = tempArr
    obj.NetLossWeight = lostWeight

    let tempArray = []

    tableV && tableV.map(item => (
      tempArray.push({ TypesOfMachiningStock: item.TypesOfMachiningStock, TypesOfMachiningStockId: item.TypesOfMachiningStockId, Description: item.Description, MajorDiameter: item.MajorDiameter, MinorDiameter: item.MinorDiameter, Length: item.Length, Breadth: item.Breadth, Height: item.Height, No: item.No, GrossWeight: item.GrossWeight, Volume: item.Volume, ForgingWeightCalculatorId: "00000000-0000-0000-0000-000000000000" })
    ))
    obj.ForgingStockDetails = tempArray
    obj.TotalMachiningStock = totalMachiningStock


    dispatch(saveRawMaterialCalculationForForging(obj, res => {
      setIsDisable(false)
      if (res.data.Result) {
        obj.WeightCalculationId = res.data.Identity
        Toaster.success("Calculation saved successfully")
        props.toggleDrawer('', obj)
      }
    }))
  }), 500);

  const TotalMachiningStock = (value) => {
    setTotalMachiningStock(value)
  }

  useEffect(() => {
    if (!CostingViewMode) {
      calculateForgeWeight()
    }
  }, [totalMachiningStock])

  /**
   * @method onCancel
   * @description on cancel close the drawer
   */
  const onCancel = () => {
    props.toggleDrawer('')
  }

  const tableData = (value = []) => {
    setTableVal(value)
  }

  const setLoss = (value) => {
    setLostWeight(value)
  }
  const dropDown = [
    {
      label: 'Burning Loss',
      value: 2
    },
    {
      label: 'Scale Loss',
      value: 5,
    },
    {
      label: 'Bilet Heating Loss',
      value: 6,
    },
    {
      label: 'Flash Loss',
      value: 7,
    },
    {
      label: 'Bar Cutting Allowance',
      value: 8,
    },
  ]

  const tableData1 = (value = []) => {

    setTableV(value)

  }
  const machineDropDown = [
    {
      label: 'Circular',
      value: 1,
    },
    {
      label: 'Semi Circular',
      value: 2,
    },
    {
      label: 'Quarter Circular',
      value: 3,
    },
    {
      label: 'Square',
      value: 4,
    },
    {
      label: 'Rectangular',
      value: 9,
    },
    {
      label: 'Irregular',
      value: 10,
    },
  ]
  const handleFinishWeight = (value) => {
    if (value.target.value === 0 || value.target.value === "" || value.target.value === null) {
      setDisableAll(true)
    }
    else {
      setDisableAll(false)
    }
  }

  const handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };

  const inputLengthTooltipMessage = <div>Input Length = (Forged Weight + Loss Weight / (π/4) * Billet Diameter<sup>2</sup>) * Density / 1000000</div>
  const endBitLossTooltipMessage = <div>End Bit Loss = ((π/4) * Billet Diameter<sup>2</sup> * End Bit Length * (Density / 1000000) / No. of Part per Length)</div>
  return (
    <Fragment>
      <Row>
        <Col>
          <form noValidate className="form"
            onKeyDown={(e) => { handleKeyDown(e, onSubmit.bind(this)); }}
          >
            <Col md="12" className='px-0'>
              <div className="border px-3 pt-3">
                <Row>
                  <Col md="12">
                    <Row>
                      <Col md="3">
                        <TextFieldHookForm
                          label={`Finished Weight(kg)`}
                          name={'finishedWeight'}
                          Controller={Controller}
                          control={control}
                          register={register}
                          mandatory={true}
                          rules={{
                            required: true,
                            validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                          }}
                          handleChange={handleFinishWeight}
                          defaultValue={''}
                          className=""
                          customClassName={'withBorder'}
                          errors={errors.finishedWeight}
                          disabled={props.CostingViewMode || forgingCalculatorMachiningStockSectionValue ? true : false}
                        />
                      </Col>

                    </Row>
                    <MachiningStockTable
                      dropDownMenu={machineDropDown}
                      CostingViewMode={props.CostingViewMode ? props.CostingViewMode : false}
                      netWeight={WeightCalculatorRequest && WeightCalculatorRequest.TotalMachiningStock !== null ? WeightCalculatorRequest.TotalMachiningStock : ''}
                      sendTable={WeightCalculatorRequest ? (WeightCalculatorRequest.ForgingStockDetails?.length > 0 ? WeightCalculatorRequest.ForgingStockDetails : []) : []}
                      tableValue={tableData1}
                      rmRowData={props.rmRowData}
                      calculation={TotalMachiningStock}
                      hotcoldErrors={errors}
                      disableAll={disableAll}

                    />
                  </Col>
                </Row>

                <Col md="3" className='mt10 px-0'>
                  <TooltipCustom disabledIcon={true} id={'forged-weight'} tooltipText={'Forged Weight = (Total Machining Stock + Finished Weight)'} />
                  <TextFieldHookForm
                    label={`Forged Weight(Kg)`}
                    name={'forgedWeight'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    id={'forged-weight'}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.forgedWeight}
                    disabled={true}
                  />
                </Col>
                <LossStandardTable
                  dropDownMenu={dropDown}
                  CostingViewMode={props.CostingViewMode ? props.CostingViewMode : false}
                  forgeValue={forgeWeightValue}
                  calculation={setLoss}
                  netWeight={WeightCalculatorRequest && WeightCalculatorRequest.NetLossWeight !== null ? WeightCalculatorRequest.NetLossWeight : ''}
                  sendTable={WeightCalculatorRequest ? (WeightCalculatorRequest.LossOfTypeDetails?.length > 0 ? WeightCalculatorRequest.LossOfTypeDetails : []) : []}
                  tableValue={tableData}
                  rmRowData={props.rmRowData}
                  isPlastic={false}
                  isLossStandard={true}
                  isNonFerrous={false}
                  disableAll={disableAll}


                />

              </div>
            </Col>
            <Row className='mt20'>
              <Col md="3">
                <TextFieldHookForm
                  label={`Billet Diameter(mm)`}
                  name={'BilletDiameter'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  rules={{
                    required: false,
                    validate: { number, checkWhiteSpaces, decimalNumberLimit },
                  }}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.BilletDiameter}
                  disabled={props.CostingViewMode || disableAll ? true : false}

                />
              </Col>
              <Col md="3">
                <TextFieldHookForm
                  label={`Input Bar Length(mm)`}
                  name={'BilletLength'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  rules={{
                    required: false,
                    validate: { number, checkWhiteSpaces, decimalNumberLimit },
                  }}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.BilletLength}
                  disabled={props.CostingViewMode || disableAll ? true : false}

                />
              </Col>
              <Col md="3">
                <TooltipCustom disabledIcon={true} id={'input-length'} tooltipClass={'weight-of-sheet'} tooltipText={inputLengthTooltipMessage} />
                <TextFieldHookForm
                  label={`Input Length(mm)`}
                  name={'InputLength'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  id={'input-length'}
                  mandatory={false}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.InputLength}
                  disabled={true}
                />
              </Col>
              <Col md="3">
                <TooltipCustom disabledIcon={true} id={'part-per-length'} tooltipClass={'weight-of-sheet'} tooltipText={'No. of Parts per Length(Number) = (Input Bar Length / Input Length) '} />
                <TextFieldHookForm
                  label={`No. of Parts per Length`}
                  name={'NoOfPartsPerLength'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  id={'part-per-length'}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.NoOfPartsPerLength}
                  disabled={true}
                />
              </Col>
              <Col md="3">
                <TooltipCustom disabledIcon={true} id={'end-bit-input'} tooltipClass={'weight-of-sheet'} tooltipText={'End Bit Length = (Input Bar Length - (Input Length * No. of Parts per Length))'} />
                <TextFieldHookForm
                  label={`End Bit Length(mm)`}
                  name={'EndBitLength'}
                  Controller={Controller}
                  control={control}
                  id={'end-bit-input'}
                  register={register}
                  mandatory={false}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.EndBitLength}
                  disabled={true}
                />
              </Col>

              <Col md="3">
                <TooltipCustom disabledIcon={true} id={'end-bit-loss'} tooltipClass={'weight-of-sheet'} tooltipText={endBitLossTooltipMessage} />
                <TextFieldHookForm
                  label={`End Bit Loss(Kg)`}
                  name={'EndBitLoss'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  id={'end-bit-loss'}
                  mandatory={false}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.EndBitLoss}
                  disabled={true}
                />
              </Col>
              <Col md="3">
                <TextFieldHookForm
                  label={`Tolerance(Kg)`}
                  name={'tolerance'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  rules={{
                    required: false,
                    validate: { number, checkWhiteSpaces, decimalNumberLimit },
                  }}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.tolerance}
                  disabled={props.CostingViewMode || disableAll}
                />
              </Col>
              <Col md="3">
                <TooltipCustom disabledIcon={true} id={'input-weight'} tooltipClass={'weight-of-sheet'} tooltipText={'Total Input Weight = (Net Loss + Forged Weight + End Bit Loss + Tolerance)'} />
                <TextFieldHookForm
                  label={`Total Input Weight(Kg)`}
                  name={'TotalInputWeight'}
                  Controller={Controller}
                  control={control}
                  id={'input-weight'}
                  register={register}
                  mandatory={false}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.TotalInputWeight}
                  disabled={true}
                />
              </Col>
              <Col md="3">

                <TextFieldHookForm
                  label={`Forging Scrap Recovery (%)`}
                  name={'forgingScrapRecoveryPercent'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  handleChange={() => { }}
                  rules={{
                    required: false,
                    validate: { number, checkWhiteSpaces, percentageLimitValidation },
                    max: {
                      value: 100,
                      message: 'Percentage cannot be greater than 100'
                    },
                  }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.forgingScrapRecoveryPercent}
                  disabled={props.CostingViewMode || disableAll ? true : false}
                />
              </Col>
              <Col md="3">
                <TooltipCustom disabledIcon={true} id={'forging-scrap'} tooltipClass={'weight-of-sheet'} tooltipText={' Forging Scrap Weight = (Total Input Weight - Forged weight) * Forging Scrap Recovery (%)/100'} />
                <TextFieldHookForm
                  label={`Forging Scrap Weight(Kg)`}
                  name={'forgingScrapWeight'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  id={'forging-scrap'}
                  mandatory={false}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.forgingScrapWeight}
                  disabled={true}
                />
              </Col>
              <Col md="3">
                <TooltipCustom disabledIcon={true} id={'forging-scrapCost'} tooltipClass={'weight-of-sheet'} tooltipText={' Forging Scrap Cost = Forging Scrap Weight * Forging Scrap Rate'} />
                <TextFieldHookForm
                  label={`Forging Scrap Cost (${sourceCurrencyFormatter(currencySource?.label)})`}
                  name={'forgingScrapCost'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  id={'forging-scrapCost'}
                  mandatory={false}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.forgingScrapCost}
                  disabled={true}
                />
              </Col>
              <Col md="3">
                <TextFieldHookForm
                  label={`Machining Scrap Recovery (%)`}
                  name={'machiningScrapRecoveryPercent'}
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
                  errors={errors.machiningScrapRecoveryPercent}
                  disabled={props.CostingViewMode || disableAll ? true : false}
                />
              </Col>

              <Col md="3">
                <TooltipCustom disabledIcon={true} id={'machining-scrap'} tooltipClass={'weight-of-sheet'} tooltipText={' Machining Scrap Weight = (Forged Weight - Finished Weight) * Machining Scrap Recovery (%)/100'} />
                <TextFieldHookForm
                  label={`Machining Scrap Weight(Kg)`}
                  name={'machiningScrapWeight'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  id={'machining-scrap'}
                  mandatory={false}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.machiningScrapWeight}
                  disabled={true}
                />
              </Col>

              <Col md="3">
                <TooltipCustom disabledIcon={true} id={'machining-scrapCost'} tooltipClass={'weight-of-sheet'} tooltipText={' Machining Scrap Cost = Machining Scrap Weight * Machining Scrap Rate'} />
                <TextFieldHookForm
                  label={`Machining Scrap Cost (${sourceCurrencyFormatter(currencySource?.label)})`}
                  name={'machiningScrapCost'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  id={'machining-scrapCost'}
                  mandatory={false}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.machiningScrapCost}
                  disabled={true}
                />
              </Col>

              <Col md="3">
                <TooltipCustom disabledIcon={true} id={'scrap-weight'} tooltipText={'Scrap Weight = (Forging Scrap Weight + Machining Scrap Weight)'} />
                <TextFieldHookForm
                  label={`Scrap Weight(Kg)`}
                  name={'ScrapWeight'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  id={'scrap-weight'}
                  mandatory={false}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.ScrapWeight}
                  disabled={true}
                />
              </Col>

              <Col md="3">
                <TooltipCustom disabledIcon={true} id={'scrap-cost'} tooltipClass={'weight-of-sheet'} tooltipText={'Scrap Cost = (Forging Scrap Cost + Machining Scrap Cost)'} />
                <TextFieldHookForm
                  label={`Scrap Cost (${sourceCurrencyFormatter(currencySource?.label)})`}
                  name={'ScrapCost'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  mandatory={false}
                  id={'scrap-cost'}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.ScrapCost}
                  disabled={true}
                />
              </Col >

              <Col md="3">
                <TooltipCustom disabledIcon={true} id={'rm-cost'} tooltipClass={'weight-of-sheet'} tooltipText={' Net RM Cost = (Total Input Weight * RM Rate - Scrap Cost)'} />
                <TextFieldHookForm
                  label={`Net RM Cost/Component(${sourceCurrencyFormatter(currencySource?.label)})`}
                  name={'NetRMCostComponent'}
                  Controller={Controller}
                  control={control}
                  register={register}
                  id={'rm-cost'}
                  mandatory={false}
                  handleChange={() => { }}
                  defaultValue={''}
                  className=""
                  customClassName={'withBorder'}
                  errors={errors.NetRMCostComponent}
                  disabled={true}
                />
              </Col>

            </Row >

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
                <div className={'save-icon'}>
                </div>
                {'SAVE'}
              </button>
            </div>
          </form >
        </Col >
      </Row >
    </Fragment >
  )
}

export default HotForging
