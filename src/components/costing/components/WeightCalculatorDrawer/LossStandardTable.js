import React, { Fragment, useState, useEffect } from 'react'
import { Row, Col, Table } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector, } from 'react-redux'
import { SearchableSelectHookForm, TextFieldHookForm, } from '../../../layout/HookFormInputs'
import NoContentFound from '../../../common/NoContentFound'
import { EMPTY_DATA } from '../../../../config/constants'
import { checkForDecimalAndNull, checkForNull, findLostWeight, getConfigurationKey, decimalNumberLimit3 } from '../../../../helper'
import Toaster from '../../../common/Toaster'
import { setPlasticArray } from '../../actions/Costing'
import { setForgingCalculatorMachiningStockSection } from '../../actions/Costing'
import TooltipCustom from '../../../common/Tooltip'
import { number, percentageLimitValidation, checkWhiteSpaces } from "../../../../helper/validation";
import { FORGING } from '../../../../config/masterData'
function LossStandardTable(props) {
  const { rmRowData, isLossStandard, isNonFerrous, disableAll, isFerrous } = props
  const trimValue = getConfigurationKey()
  const trim = trimValue.NoOfDecimalForInputOutput
  const [lossWeight, setLossWeight] = useState('')
  const [disableLossType, setDisableLossType] = useState(false)
  const [disableFlashType, setDisableFlashType] = useState(false)
  const [lossWeightTooltip, setLossWeightTooltip] = useState()
  const dispatch = useDispatch()
  const { register, control, setValue, getValues, reset, formState: { errors }, } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
  })
  const { ComponentItemData, costingData, CostingDataList } = useSelector(state => state.costing)

  const fieldValues = useWatch({
    control,
    name: ['LossPercentage', 'FlashLength', 'FlashThickness', 'FlashWidth', 'BarDiameter', 'BladeThickness',],
  })

  useEffect(() => {
    calculateLossWeight()
    if (Number(costingData?.TechnologyId) === FORGING) {
      calculateForgeLossWeight()
    }
    if (isNonFerrous === true) {
      props.LossDropDown()
    }
  }, [fieldValues, props.weightValue])

  const { dropDownMenu } = props
  const [tableData, setTableData] = useState([])
  const [isEdit, setIsEdit] = useState(false)
  const [editIndex, setEditIndex] = useState('')
  const [oldNetWeight, setOldNetWeight] = useState('')
  const [netWeight, setNetWeight] = useState(props.netWeight !== '' ? props.netWeight : 0)
  const [burningWeight, setBurningWeight] = useState(props.burningValue !== '' ? props.burningValue : '')
  const [barCuttingAllowanceLossType, setBarCuttingAllowanceLossType] = useState(false)
  const [flashLossType, setFlashLossType] = useState(false)
  const [useFormula, setUseformula] = useState(false)
  const [percentage, setPercentage] = useState(false)
  const [isDisable, setIsDisable] = useState(false)

  const [isBarBlade, setIsBarBlade] = useState(false)

  const [isFlashParametersDisable, setIsFlashParametersDisable] = useState(false)

  useEffect(() => {
    setTableData(props.sendTable ? props.sendTable : [])


    if (props?.sendTable?.length === 0) {
      dispatch(setForgingCalculatorMachiningStockSection(false))
    }
    else {
      dispatch(setForgingCalculatorMachiningStockSection(true))
    }
  }, [])

  const handleLossOfType = (value) => {
    setPercentage(false)
    setUseformula(false)

    if ((value.label === "Bar Cutting Allowance")) {
      setBarCuttingAllowanceLossType(true)
      setIsDisable(false)
      setFlashLossType(false)
      setLossWeightTooltip(<div>Loss Weight = (0.7857 Bar Diameter<sup>2</sup> * Blade Thickness * Density / 1000000)</div>)
    }
    else if ((value.label === "Flash Loss")) {

      setFlashLossType(true)
      setIsDisable(false)
      setBarCuttingAllowanceLossType(false)
    }
    else {
      setIsDisable(true)
      setBarCuttingAllowanceLossType(false)
      setFlashLossType(false)
      setPercentage(true)

      if (props?.isLossStandard) {
        setLossWeightTooltip(`Loss Weight = (Loss (%) * Forged Weight / 100)`)
      }
      else if (props?.isFerrous || props?.isNonFerrous) {
        setLossWeightTooltip(`Loss Weight = (Loss (%) * Casting Weight / 100)`)
      }
      else {
        setLossWeightTooltip(`Loss Weight = (Loss (%) * Gross Weight / 100)`)
      }
    }
    reset({
      LossPercentage: '',
      FlashLength: '',
      FlashThickness: '',
      FlashWidth: '',
      BarDiameter: '',
      BladeThickness: '',
      LossOfType: '',
      LossWeight: '',
      FlashLoss: '',
    })

  }

  const handleFlashloss = (value) => {

    if ((value.label === "Use Formula")) {

      setUseformula(true)
      setIsDisable(false)
      setPercentage(false)
      setLossWeightTooltip('Loss Weight = (Length * Breadth * Height * Density / 1000000)')
    }
    else {

      setIsDisable(true)
      setPercentage(true)
      setUseformula(false)
      setLossWeightTooltip('Loss Weight = (Percentage * Forged Weight / 100)')
    }
  }


  /**
   * @method calculateLossWeight
   * @description for calculating loss weight  and net loss weight
   */
  const calculateLossWeight = () => {
    const LossPercentage = checkForNull(getValues('LossPercentage'))
    const inputWeight = props.weightValue
    const LossWeight = (inputWeight * LossPercentage) / 100

    setValue('LossWeight', checkForDecimalAndNull(LossWeight, getConfigurationKey().NoOfDecimalForInputOutput))
    setLossWeight(LossWeight)
  }

  const calculateForgeLossWeight = (value) => {

    const LossPercentage = checkForNull(getValues('LossPercentage'))
    const FlashLength = checkForNull(getValues('FlashLength'))
    const FlashThickness = checkForNull(getValues('FlashThickness'))
    const FlashWidth = checkForNull(getValues('FlashWidth'))
    const BarDiameter = checkForNull(getValues('BarDiameter'))
    const BladeThickness = checkForNull(getValues('BladeThickness'))
    const LossOfType = getValues('LossOfType')
    const FlashLoss = getValues('FlashLoss')

    if ((LossOfType?.label === "Scale Loss") || (LossOfType?.label === "Bilet Heating Loss") || (LossOfType?.label === "Burning Loss")) {

      setIsDisable(true)
    }
    else if (LossOfType?.label === "Bar Cutting Allowance") {
      if ((BarDiameter !== undefined && BarDiameter !== 0) || (BladeThickness !== undefined && BladeThickness !== 0)) {

        setIsDisable(true)
        setIsBarBlade(false)

      } else {

        setIsDisable(false)
        if (getValues('LossWeight') !== undefined && getValues('LossWeight') !== 0) {

          setIsBarBlade(true)
        } else {
          setIsBarBlade(false)
        }
      }
    }
    else if (LossOfType?.label === "Flash Loss") {

      if ((FlashLength !== undefined && FlashLength !== 0) || (FlashThickness !== undefined && FlashThickness !== 0) || (FlashWidth !== undefined && FlashWidth !== 0)) {

        setIsDisable(true)
        setIsFlashParametersDisable(false)
      } else {

        setIsDisable(false)
        if (getValues('LossWeight') !== undefined && getValues('LossWeight') !== 0) {
          setIsFlashParametersDisable(true)
        } else {
          setIsFlashParametersDisable(false)
        }
      }
    }

    // props.weightValue
    const forgeWeight = props.forgeValue
    let LossWeight = 0;
    switch (LossOfType?.label) {
      case 'Scale Loss':
      case 'Burning Loss':
        LossWeight = ((forgeWeight * LossPercentage) / 100)
        break;
      case 'Bilet Heating Loss':
        LossWeight = ((forgeWeight * LossPercentage) / 100)
        break;
      case 'Flash Loss':
        switch (FlashLoss?.label) {
          case 'Use Formula':
            LossWeight = ((FlashLength * FlashThickness * FlashWidth * rmRowData.Density) / 1000000)
            break;
          case 'Percentage':
            LossWeight = ((forgeWeight * LossPercentage) / 100)
            break;
          default:

        }
        break;
      case 'Bar Cutting Allowance':
        LossWeight = (((0.7857 * (Math.pow(BarDiameter, 2)) * BladeThickness * rmRowData.Density) / 1000000))
        break;
      default:
        return "none";
    }

    setValue('LossWeight', checkForDecimalAndNull(LossWeight, getConfigurationKey().NoOfDecimalForInputOutput))
    setLossWeight(LossWeight)

  }

  const flashLossdropdown = [
    {
      label: 'Use Formula',
      value: 11,
    },
    {
      label: 'Percentage',
      value: 12,
    },

  ]
  /**
   * @method addRow
   * @description For updating and adding row
   */
  const addRow = () => {
    const LossWeight = checkForNull(lossWeight)
    const LossPercentage = checkForNull(getValues('LossPercentage'))
    const LossOfType = getValues('LossOfType').value
    const FlashLength = checkForNull(getValues('FlashLength'))
    const FlashThickness = checkForNull(getValues('FlashThickness'))
    const FlashWidth = checkForNull(getValues('FlashWidth'))
    const BarDiameter = checkForNull(getValues('BarDiameter'))
    const BladeThickness = checkForNull(getValues('BladeThickness'))


    if (LossPercentage > 100) {

      return false
    }
    if (Object.keys(errors).length > 0) {
      return false
    }

    if (LossWeight === 0 || LossOfType === '' || LossOfType === undefined) {
      Toaster.warning("Please add data first.")
      return false;
    }
    //CONDITION TO CHECK DUPLICATE ENTRY IN GRID
    if (!isEdit) {
      const isExist = tableData.findIndex(el => (String(el.LossOfType) === String(LossOfType)))
      if (isExist !== -1) {
        Toaster.warning('Already added, Please select another loss type.')
        return false;
      }
    }


    let tempArray = []
    let NetWeight
    if (isEdit) {
      const oldWeight = netWeight - checkForNull(oldNetWeight)
      NetWeight = checkForNull(oldWeight + LossWeight)
      setNetWeight(NetWeight)
    } else {

      NetWeight = checkForNull(checkForNull(netWeight) + LossWeight)

      setTimeout(() => {
        setNetWeight(NetWeight)
      }, 400);

    }

    const obj = {
      LossPercentage: LossPercentage ? LossPercentage : "-",
      FlashLength: FlashLength ? FlashLength : "-",
      FlashWidth: FlashWidth ? FlashWidth : "-",
      FlashThickness: FlashThickness ? FlashThickness : "-",
      BarDiameter: BarDiameter ? BarDiameter : "-",
      BladeThickness: BladeThickness ? BladeThickness : "-",
      LossOfType: LossOfType,
      LossWeight: LossWeight,
      FlashLoss: getValues('FlashLoss')?.label,
      FlashLossId: getValues('FlashLoss')?.value
    }
    setUseformula(false)
    setFlashLossType(false)
    setBarCuttingAllowanceLossType(false)
    setPercentage(true)
    setDisableLossType(false)
    setDisableFlashType(false)
    if (isEdit) {
      tempArray = Object.assign([...tableData], { [editIndex]: obj })
      setTableData(tempArray)
      setIsEdit(false)

    } else {
      // tempArray = [...tableData, obj]
      tempArray = tableData
      tempArray.push(obj)
      setTableData(tempArray)
    }

    if (LossOfType === 2 && props?.isPlastic) {
      setBurningWeight(LossWeight)
      props.burningLoss(LossWeight)
    }
    dispatch(setPlasticArray(tempArray))
    props.calculation(NetWeight)
    if (tempArray.length > 0) {
      dispatch(setForgingCalculatorMachiningStockSection(true))
    } else {
      dispatch(setForgingCalculatorMachiningStockSection(false))
    }
    props.tableValue(tempArray)

    reset({
      LossPercentage: '',
      FlashLength: '',
      FlashThickness: '',
      FlashWidth: '',
      BarDiameter: '',
      BladeThickness: '',
      LossOfType: '',
      LossWeight: '',
      FlashLoss: '',
    })
  }
  const rateTableReset = () => {
    cancelUpdate()
  }

  /**
   * @method editRow
   * @description for filling the row above table for editing
   */
  const editRow = (index) => {
    setIsEdit(true)
    setEditIndex(index)
    const tempObj = tableData[index]
    setOldNetWeight(tempObj.LossWeight)
    setValue('LossPercentage', tempObj.LossPercentage)
    setValue('FlashLength', tempObj.FlashLength)
    setValue('FlashThickness', tempObj.FlashThickness)
    setValue('FlashWidth', tempObj.FlashWidth)
    setValue('BarDiameter', tempObj.BarDiameter)
    setValue('BladeThickness', tempObj.BladeThickness)
    setValue('LossOfType', { label: getLossTypeName(tempObj.LossOfType), value: tempObj.LossOfType })
    setValue('LossWeight', tempObj.LossWeight)
    setValue('FlashLoss', { label: tempObj.FlashLoss, value: tempObj.FlashLossId })

    setDisableLossType(true)

    if ((tempObj.LossOfType === 7 && tempObj.FlashLoss === "Use Formula")) {
      setFlashLossType(true)
      setUseformula(true)
      setPercentage(false)
      setBarCuttingAllowanceLossType(false)
      setDisableFlashType(true)
    }
    else if ((tempObj.LossOfType === 7 && tempObj.FlashLoss === "Percentage")) {
      setIsDisable(true)
      setPercentage(true)
      setUseformula(false)
      setBarCuttingAllowanceLossType(false)
      setDisableFlashType(true)

    }
    else if (tempObj.LossOfType === 8) {
      setUseformula(false)
      setPercentage(false)
      setBarCuttingAllowanceLossType(true)
    }
    else {
      setPercentage(true)
      setFlashLossType(false)
      setUseformula(false)
      setBarCuttingAllowanceLossType(false)



    }
  }

  /**
   * @method cancelUpdate
   * @description Cancel update for edit
  */
  const cancelUpdate = () => {
    setIsEdit(false)
    setEditIndex('')
    setOldNetWeight('')
    reset({
      LossPercentage: '',
      FlashLength: '',
      FlashThickness: '',
      FlashWidth: '',
      BarDiameter: '',
      BladeThickness: '',
      LossOfType: '',
      LossWeight: '',
      FlashLoss: '',
    })
    setDisableLossType(false)
    setDisableFlashType(false)
    errors.LossPercentage = {}
    setUseformula(false)
    setFlashLossType(false)
    setBarCuttingAllowanceLossType(false)
    setPercentage(true)
  }
  /**
   * @method deleteRow
   * @description Deleting single row from table
   */
  const deleteRow = (index) => {
    const tempObj = tableData[index]
    let weight
    if (tableData.length === 1) {
      weight = 0
    } else {
      weight = netWeight - tempObj.LossWeight //FIXME Calculation going wrong need to ask Harish sir.
    }


    setNetWeight(weight)
    props.calculation(weight)
    let tempData = tableData.filter((item, i) => {
      if (i === index) {
        return false
      }
      return true
    })



    if (Number(tempObj.LossOfType) === 2 && props?.isPlastic) {
      setBurningWeight(0)
      props.burningLoss(0)
    }

    dispatch(setPlasticArray(tempData))
    if (tempData.length > 0) {
      dispatch(setForgingCalculatorMachiningStockSection(true))
    } else {
      dispatch(setForgingCalculatorMachiningStockSection(false))
    }
    props.tableValue(tempData)

    setTableData(tempData)
    cancelUpdate()
  }

  const getLossTypeName = (number) => {
    const name = dropDownMenu && dropDownMenu.find(item => item.value === Number(number))
    return name?.label
  }

  const changeinLossWeight = (value) => {

    if (value !== undefined && value !== 0 && value !== '') {
      setIsBarBlade(true)
      setLossWeight(value)
      setIsFlashParametersDisable(true)
    } else {
      setIsBarBlade(false)
      setIsFlashParametersDisable(false)
    }

  }

  return (
    <Fragment>
      <Row className={`mb-3 ${isFerrous ? 'mx-0' : ''}`}>
        <Col md="12">
          <div className="header-title">
            <h5>{'Loss:'}</h5>
          </div>
        </Col>
        <Col md="3">
          <SearchableSelectHookForm
            label={`Type of Loss`}
            name={'LossOfType'}
            placeholder={'Select'}
            Controller={Controller}
            control={control}
            register={register}
            mandatory={false}
            options={dropDownMenu}
            handleChange={handleLossOfType}
            defaultValue={''}
            className=""
            customClassName={'withBorder'}
            errors={errors.LossOfType}
            disabled={props.CostingViewMode || disableLossType || disableAll}
          />
        </Col>

        {barCuttingAllowanceLossType &&
          <>
            <Col md="2">
              <TextFieldHookForm
                label={`Bar Diameter(mm)`}
                name={'BarDiameter'}
                Controller={Controller}
                control={control}
                register={register}
                mandatory={false}
                rules={{
                  required: false,
                  validate: { number, decimalNumberLimit3 },
                }}
                handleChange={() => { }}
                defaultValue={''}
                className=""
                customClassName={'withBorder'}
                errors={errors.BarDiameter}
                disabled={props.CostingViewMode ? props.CostingViewMode : isBarBlade}
              />
            </Col>


            <Col md="2" className='px-1'>
              <TextFieldHookForm
                label={`Blade Thickness(mm)`}
                name={'BladeThickness'}
                Controller={Controller}
                control={control}
                register={register}
                mandatory={false}
                rules={{
                  required: false,
                  validate: { number, decimalNumberLimit3 },
                }}
                handleChange={() => { }}
                defaultValue={''}
                className=""
                customClassName={'withBorder'}
                errors={errors.BladeThickness}
                disabled={props.CostingViewMode ? props.CostingViewMode : isBarBlade}
              />
            </Col>
          </>}
        {flashLossType &&
          <>
            <Col className={`${!useFormula ? "col-md-2" : "col-md-3"}`}>
              <SearchableSelectHookForm
                label={`Flash loss`}
                name={'FlashLoss'}
                placeholder={'Select'}
                Controller={Controller}
                control={control}
                register={register}
                mandatory={false}
                options={flashLossdropdown}
                handleChange={handleFlashloss}
                defaultValue={''}
                className=""
                customClassName={'withBorder'}
                errors={errors.FlashLoss}
                disabled={props.CostingViewMode || disableFlashType || disableAll}
              />
            </Col>
          </>}
        {useFormula &&
          <>
            <Col md="3">
              <TextFieldHookForm
                label={`Flash Length(mm)`}
                name={'FlashLength'}
                Controller={Controller}
                control={control}
                register={register}
                mandatory={true}
                rules={{
                  required: true,
                  validate: { number, decimalNumberLimit3 },
                }}
                handleChange={() => { }}
                defaultValue={''}
                className=""
                customClassName={'withBorder'}
                errors={errors.FlashLength}
                disabled={props.CostingViewMode ? props.CostingViewMode : isFlashParametersDisable}
              />
            </Col>
            <Col md="3">
              <TextFieldHookForm
                label={`Flash Thickness(mm)`}
                name={'FlashThickness'}
                Controller={Controller}
                control={control}
                register={register}
                mandatory={true}
                rules={{
                  required: true,
                  validate: { number, decimalNumberLimit3 },
                }}
                handleChange={() => { }}
                defaultValue={''}
                className=""
                customClassName={'withBorder'}
                errors={errors.FlashThickness}
                disabled={props.CostingViewMode ? props.CostingViewMode : isFlashParametersDisable}
              />
            </Col>
            <Col md="3">
              <TextFieldHookForm
                label={`Flash Width(mm)`}
                name={'FlashWidth'}
                Controller={Controller}
                control={control}
                register={register}
                mandatory={true}
                rules={{
                  required: true,
                  validate: { number, decimalNumberLimit3 },
                }}
                handleChange={() => { }}
                defaultValue={''}
                className=""
                customClassName={'withBorder'}
                errors={errors.FlashWidth}
                disabled={props.CostingViewMode ? props.CostingViewMode : isFlashParametersDisable}
              />
            </Col>
          </>}
        {percentage &&
          <>
            <Col md="2">
              <TextFieldHookForm
                label={`Loss (%)`}
                name={'LossPercentage'}
                Controller={Controller}
                control={control}
                register={register}
                mandatory={false}
                rules={{
                  required: false,
                  validate: { number, checkWhiteSpaces, percentageLimitValidation },
                  max: {
                    value: 100,
                    message: 'Percentage cannot be greater than 100'
                  },
                }}
                handleChange={() => { }}
                defaultValue={''}
                className=""
                customClassName={'withBorder'}
                errors={errors.LossPercentage}
                disabled={props.CostingViewMode || disableAll}
              />
            </Col>
          </>}
        <Col md="2">
          {lossWeightTooltip && (props.CostingViewMode || isDisable || disableAll) && <TooltipCustom tooltipClass='weight-of-sheet' disabledIcon={true} id={'loss-weight'} tooltipText={lossWeightTooltip} />}
          <TextFieldHookForm
            label={`Loss Weight`}
            name={'LossWeight'}
            Controller={Controller}
            control={control}
            id={'loss-weight'}
            register={register}
            mandatory={false}
            handleChange={(e) => changeinLossWeight(e.target.value)}
            defaultValue={''}
            className=""
            customClassName={'withBorder'}
            errors={errors.LossWeight}
            disabled={props.CostingViewMode || isDisable || disableAll}
          />
        </Col>
        <Col md="3" className="pr-0">
          <div className='mt5'>
            {isEdit ? (
              <>
                <button
                  type="button"
                  className={'btn btn-primary mt30 pull-left mr5'}
                  onClick={() => addRow()}
                >
                  Update
                </button>

                <button
                  type="button"
                  className="mt30 cancel-btn"
                  onClick={() => cancelUpdate()}
                >
                  <div className={"cancel-icon"}></div>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  className={'user-btn mt30 pull-left'}
                  onClick={addRow}
                  disabled={props.CostingViewMode || disableAll}
                >
                  <div className={'plus'}></div>ADD
                </button>
                <button
                  type="button"
                  className={"mr15 ml-1 mt30 reset-btn"}
                  disabled={props.CostingViewMode || disableAll}
                  onClick={rateTableReset}
                >
                  Reset
                </button>
              </>
            )}
          </div>
        </Col>

        <Col md="12">
          <Table className="table mb-0 forging-cal-table" size="sm">
            <thead>
              <tr>
                <th>{`Type of Loss`}</th>
                {isLossStandard && <th>{`Flash Length`}</th>}
                {isLossStandard && <th>{`Flash Thickness`}</th>}
                {isLossStandard && <th>{`Flash Width`}</th>}
                {isLossStandard && <th>{`Bar Diameter`}</th>}
                {isLossStandard && <th>{`Blade Thickness`}</th>}
                <th>{`Loss (%)`}</th>
                <th>{`Loss Weight`}</th>
                <th>{`Actions`}</th>
              </tr>
            </thead>
            <tbody>
              {tableData &&
                tableData.map((item, index) => {
                  return (
                    <Fragment>
                      <tr key={index}>
                        <td>{item.LossOfType !== null ? getLossTypeName(item.LossOfType) : '-'} </td>
                        {isLossStandard && <td>{checkForDecimalAndNull(item.FlashLength, getConfigurationKey().NoOfDecimalForInputOutput) !== null ? checkForDecimalAndNull(item.FlashLength, getConfigurationKey().NoOfDecimalForInputOutput) : '-'}</td>}
                        {isLossStandard && <td>{checkForDecimalAndNull(item.FlashThickness, getConfigurationKey().NoOfDecimalForInputOutput) !== null ? checkForDecimalAndNull(item.FlashThickness, getConfigurationKey().NoOfDecimalForInputOutput) : '-'}</td>}
                        {isLossStandard && <td>{checkForDecimalAndNull(item.FlashWidth, getConfigurationKey().NoOfDecimalForInputOutput) !== null ? checkForDecimalAndNull(item.FlashWidth, getConfigurationKey().NoOfDecimalForInputOutput) : '-'}</td>}
                        {isLossStandard && <td>{checkForDecimalAndNull(item.BarDiameter, getConfigurationKey().NoOfDecimalForInputOutput) !== null ? checkForDecimalAndNull(item.BarDiameter, getConfigurationKey().NoOfDecimalForInputOutput) : '-'}</td>}
                        {isLossStandard && <td>{checkForDecimalAndNull(item.BladeThickness, getConfigurationKey().NoOfDecimalForInputOutput) !== null ? checkForDecimalAndNull(item.BladeThickness, getConfigurationKey().NoOfDecimalForInputOutput) : '-'}</td>}
                        <td>{checkForDecimalAndNull(item.LossPercentage, getConfigurationKey().NoOfDecimalForInputOutput) !== null ? checkForDecimalAndNull(item.LossPercentage, getConfigurationKey().NoOfDecimalForInputOutput) : '-'}</td>
                        <td>
                          {checkForDecimalAndNull(item.LossWeight, getConfigurationKey().NoOfDecimalForInputOutput)}
                        </td>
                        <td>
                          {
                            <React.Fragment>
                              <button
                                className="Edit mr-2"
                                type={'button'}
                                title='Edit'
                                disabled={props.CostingViewMode || disableAll}
                                onClick={() => editRow(index)}
                              />
                              <button
                                className="Delete"
                                title='Delete'
                                type={'button'}
                                disabled={props.CostingViewMode || disableAll}
                                onClick={() => deleteRow(index)}
                              />
                            </React.Fragment>
                          }
                        </td>
                      </tr>
                    </Fragment>
                  )
                })}
              {tableData && tableData.length === 0 && (
                <tr>
                  <td colspan="15">
                    <NoContentFound title={EMPTY_DATA} />
                  </td>
                </tr>
              )}
            </tbody>

          </Table>
          <div className="col-md-12 text-right bluefooter-butn border">
            {props.isPlastic &&
              <span className="w-50 d-inline-block text-left">
                {`${props.isStamping ? "Total" : "Burning"} Loss Weight: `}
                {checkForDecimalAndNull(burningWeight, trim)}
              </span>}
            {!props.isStamping && <span className="w-50 d-inline-block">
              {`${props.isPlastic ? 'Other' : 'Net'} Loss Weight: `}
              {checkForDecimalAndNull(findLostWeight(tableData), trim)}
            </span>}
          </div>
        </Col>
      </Row>
    </Fragment>
  )
}
LossStandardTable.defualtProps = {
  isStamping: false
}
export default React.memo(LossStandardTable)
