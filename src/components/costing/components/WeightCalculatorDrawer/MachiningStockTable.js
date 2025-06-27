import React, { Fragment, useState, useEffect } from 'react'
import { Row, Col, Table } from 'reactstrap'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { SearchableSelectHookForm, NumberFieldHookForm, TextFieldHookForm, } from '../../../layout/HookFormInputs'
import NoContentFound from '../../../common/NoContentFound'
import { EMPTY_DATA } from '../../../../config/constants'
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, number, checkWhiteSpaces, decimalAndNumberValidation, decimalNumberLimit3, maxLength200, percentageLimitValidation } from '../../../../helper'
import Toaster from '../../../common/Toaster'
import TooltipCustom from '../../../common/Tooltip'
function MachiningStockTable(props) {

  const { rmRowData, hotcoldErrors, disableAll } = props
  const trimValue = getConfigurationKey()
  const trim = trimValue.NoOfDecimalForInputOutput
  const [forgingVolume, setForgingVolume] = useState('')
  const [grossWeight, setGrossWeight] = useState('')
  // const [showLabel, setIsShowLabel] = useState(false)
  const [circularMachiningStock, setCircularMachiningStock] = useState(false)
  const [rectangularMachiningStock, setRectangularMachiningStock] = useState(false)
  const [squareMachiningStock, setSquareMachiningStock] = useState(false)
  const [irregularMachiningStock, setIrregularMachiningStock] = useState(false)
  const [multiplyingFactorMachiningStock, setMultiplyingFactorMachiningStock] = useState(false)
  const [disable, setDisable] = useState(true)
  const [disableMachineType, setDisableMachineType] = useState(false)
  const [tooltipClassShow, setTooltipClassShow] = useState(false)
  const [tooltipMessageForVolume, setTooltipMessageForVolume] = useState()
  const [tooltipMessageForGross, setTooltipMessageForGross] = useState()

  const { register, control, setValue, getValues, reset, formState: { errors }, } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    //defaultValues: defaultValues,
  })
  const fieldValues = useWatch({
    control,
    name: ['finishedWeight',
      'MachiningStock',
      'majorDiameter',
      'minorDiameter',
      'Length',
      'Height',
      'Breadth',
      'No',
      'MachiningMultiplyingFactorPercentage'

    ],
  })

  useEffect(() => {
    calculateforgingVolumeAndWeight()
    calculateTotalMachiningStock()

  }, [fieldValues, props?.netWeightCost])


  const handleVolumeChange = () => {
    setTimeout(() => {
      calculateforgingVolumeAndWeight()
    }, 500);

  }

  const { dropDownMenu } = props

  const [tableData, setTableData] = useState([])
  const [isEdit, setIsEdit] = useState(false)
  const [editIndex, setEditIndex] = useState('')
  const [oldNetWeight, setOldNetWeight] = useState('')
  const [netWeight, setNetWeight] = useState(props.netWeight !== '' ? props.netWeight : 0)
  

  const { forgingCalculatorMachiningStockSectionValue } = useSelector(state => state.costing)


  useEffect(() => {

  }, [forgingCalculatorMachiningStockSectionValue])


  useEffect(() => {
    setTableData(props.sendTable ? props.sendTable : [])

  }, [])


  const handleMachiningStockChange = (value) => {
    setDisable(true)
    reset({
      description: '',
      minorDiameter: '',
      majorDiameter: '',
      Length: '',
      Breadth: '',
      Height: '',
      No: '',
      MachiningStock: '',
      forgingV: ''
    })
    if ((value.label === "Circular") || (value.label === "Semi Circular") || (value.label === "Quarter Circular")) {
      setCircularMachiningStock(true)
      setSquareMachiningStock(false)
      setRectangularMachiningStock(false)
      setIrregularMachiningStock(false)
      setMultiplyingFactorMachiningStock(false)
      setTooltipClassShow(true)
      setTooltipMessageForGross('Gross Weight = (Volume * Density / 1000000)')
    }

    else if (value.label === "Square") {
      setSquareMachiningStock(true)
      setCircularMachiningStock(false)
      setRectangularMachiningStock(false)
      setIrregularMachiningStock(false)
      setMultiplyingFactorMachiningStock(false)
      setTooltipClassShow(false)
      setTooltipMessageForGross('Gross Weight = (Volume * Number  * Density / 1000000)')
    }

    else if (value.label === "Rectangular") {
      setRectangularMachiningStock(true)
      setSquareMachiningStock(false)
      setCircularMachiningStock(false)
      setIrregularMachiningStock(false)
      setMultiplyingFactorMachiningStock(false)
      setTooltipClassShow(false)
      setTooltipMessageForGross('Gross Weight = (Volume * Number * Density / 1000000)')
    }
    else if (value.label === "Irregular") {
      setSquareMachiningStock(false)
      setCircularMachiningStock(false)
      setRectangularMachiningStock(false)
      setIrregularMachiningStock(true)
      setMultiplyingFactorMachiningStock(false)
      setDisable(false)
      setTooltipClassShow(false)
      setTooltipMessageForGross('Gross Weight = (Volume * Number * Density / 1000000)')
    }
    else if (value.label === "Multiplying factor (Yield %)") {
      if (!props?.netWeightCost) {
        Toaster.warning("Please Select Net Weight First.")
      }
      setSquareMachiningStock(false)
      setCircularMachiningStock(false)
      setRectangularMachiningStock(false)
      setIrregularMachiningStock(false)
      setMultiplyingFactorMachiningStock(true)
      setDisable(false)
      setTooltipClassShow(false)
      setTooltipMessageForGross('Gross Weight = (Net Weight(kg) * Machining Multiplying Factor (%))')
    }
    else {
      setMultiplyingFactorMachiningStock(false)
      setIrregularMachiningStock(false)
      setTooltipClassShow(false)
    }
    switch (value.label) {
      case 'Circular':
        setTooltipMessageForVolume(<div>(Volume = (π/4) * (Major Diameter<sup>2</sup> - Minor Diameter <sup>2</sup>) * Length)</div>)
        break;
      case 'Semi Circular':
        setTooltipMessageForVolume(<div>(Volume = (π/4)  * (Major Diameter<sup>2</sup> - Minor Diameter <sup>2</sup>) * Length) / 2</div>)
        break;
      case 'Quarter Circular':
        setTooltipMessageForVolume(<div>(Volume = (π/4) * (Major Diameter<sup>2</sup> - Minor Diameter <sup>2</sup>) * Length) / 4</div>)
        break;
      case 'Square':
        setTooltipMessageForVolume(<div>(Length * Length * Height)</div>)
        break;
      case 'Rectangular':
        setTooltipMessageForVolume(<div>(Length * Breadth * Height)</div>)
        break;
      default:
        break;
    }
  }

  const calculateforgingVolumeAndWeight = (value) => {
    const description = getValues('description')
    const majorDiameter = checkForNull(getValues('majorDiameter'))
    const minorDiameter = checkForNull(getValues('minorDiameter'))
    const Length = checkForNull(getValues('Length'))
    const Breadth = checkForNull(getValues('Breadth'))
    const Height = checkForNull(getValues('Height'))
    const No = checkForNull(getValues('No'))
    const MachiningStock = getValues('MachiningStock')
    const forgingV = checkForNull(getValues('forgingVolume'))
    const machiningMultiplyingFactorPercentage = checkForNull(getValues('MachiningMultiplyingFactorPercentage'))
    
    let Volume = 0;
    let GrossWeight = 0;
    
    switch (MachiningStock?.label) {
      case 'Circular':
        Volume = ((Math.PI / 4) * (Math.pow(majorDiameter, 2) - Math.pow(minorDiameter, 2)) * Length)
        GrossWeight = ((Volume * rmRowData.Density) / 1000000)
        break;

      case 'Semi Circular':
        Volume = ((Math.PI / 4) * (Math.pow(majorDiameter, 2) - Math.pow(minorDiameter, 2)) * Length / 2)
        GrossWeight = (Volume * rmRowData.Density) / 1000000
        break;

      case 'Quarter Circular':
        Volume = ((Math.PI / 4) * (Math.pow(majorDiameter, 2) - Math.pow(minorDiameter, 2)) * Length / 4)
        GrossWeight = (Volume * rmRowData.Density) / 1000000
        break;
      case 'Square':
        Volume = (Length * Length * Height)
        GrossWeight = (Volume * No * rmRowData.Density) / 1000000
        break;

      case 'Rectangular':
        Volume = (Length * Breadth * Height)
        GrossWeight = (Volume * No * rmRowData.Density) / 1000000
        break;
      case 'Irregular':
        Volume = forgingV
        GrossWeight = (forgingV * No * rmRowData.Density) / 1000000
        break;
      case 'Multiplying factor (Yield %)':
        GrossWeight = (props?.netWeightCost * (machiningMultiplyingFactorPercentage / 100))
        break;
      default:
        return "none";

    }
    setValue('forgingVolume', checkForDecimalAndNull(Volume, getConfigurationKey().NoOfDecimalForInputOutput))
    setForgingVolume(Volume)
    setValue('grossWeight', checkForDecimalAndNull(GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput))
    setGrossWeight(GrossWeight)
  }

  const calculateTotalMachiningStock = (tableVal) => {
    let sum = 0;
    tableVal && tableVal.map(item => (
      sum = sum + item.GrossWeight
    ))
    // props.TotalMachiningStock(sum)
    return sum
  }


  /**
   * @method addRow
   * @description For updating and adding row
   */
  const addRow = () => {
    const GrossWeight = checkForNull(grossWeight)
    const Volume = checkForNull(forgingVolume)
    const MajorDiameter = checkForNull(getValues('majorDiameter'))
    const MinorDiameter = checkForNull(getValues('minorDiameter'))
    const Description = getValues('description')
    const Length = checkForNull(getValues('Length'))
    const Height = checkForNull(getValues('Height'))
    const Breadth = checkForNull(getValues('Breadth'))
    const No = checkForNull(getValues('No'))
    const MachiningStock = getValues('MachiningStock')
    const MachiningMultiplyingFactorPercentage = getValues('MachiningMultiplyingFactorPercentage')
    
    if (Object.keys(errors).length > 0 || 'finishedWeight' in hotcoldErrors > 0) {
      return false
    }

    if (!isEdit) {
      if (MachiningStock?.label === 'Multiplying factor (Yield %)' && !props?.netWeightCost) {
        Toaster.warning("Please Select Net Weight First.")
        return false;
      }
    }

    if (GrossWeight === 0 || (MachiningStock?.label !== 'Multiplying factor (Yield %)' && Volume === 0) || MachiningStock === '' || Description === '') {

      Toaster.warning("Please fill all the mandatory fields first.")
      return false;
    }
    //CONDITION TO CHECK DUPLICATE ENTRY IN GRID
    if (!isEdit) {
      const isExist = tableData.findIndex(el => (String(el.TypesOfMachiningStockId) === String(MachiningStock?.value)))
      if (isExist !== -1) {
        Toaster.warning('Already added, Please select another shape type.')
        return false;
      }
      const yieldPercentage = tableData.some(el => String(el?.TypesOfMachiningStockId) === '21')    
      if (yieldPercentage) {
        Toaster.warning("You have already selected Multiplying factor (Yield %). Please remove it before selecting other shape type.")
        return false
      }
    
      if (tableData.length > 0 && String(MachiningStock?.value) === '21') {
        Toaster.warning("To add Multiplying factor (Yield %), please remove other shape type first.");
        return false;
      }
    }

    let tempArray = []
    let NetWeight
    if (isEdit) {
      setDisableMachineType(false)
      const oldWeight = Number(netWeight) - Number(oldNetWeight)
      NetWeight = checkForNull(Number(oldWeight) + Number(GrossWeight))
      setNetWeight(Number(NetWeight))

    } else {
      NetWeight = checkForNull(checkForNull(netWeight) + checkForNull(GrossWeight))
      setTimeout(() => {
        setNetWeight(Number(NetWeight))
      }, 400);
    }

    const obj = {
      MajorDiameter: MajorDiameter ? MajorDiameter : "",
      MinorDiameter: MinorDiameter ? MinorDiameter : "",
      Description: Description,
      Length: Length ? Length : "",
      Height: Height ? Height : "",
      Breadth: Breadth ? Breadth : "",
      No: No ? No : "",
      TypesOfMachiningStock: MachiningStock?.label,
      TypesOfMachiningStockId: MachiningStock?.value,
      GrossWeight: GrossWeight,
      Volume: Volume,
      MachiningMultiplyingFactorPercentage:MachiningMultiplyingFactorPercentage
    }


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

    props.calculation(NetWeight)
    props.tableValue(tempArray)

    reset({

      majorDiameter: '',
      minorDiameter: '',
      description: '',
      Length: '',
      Height: '',
      Breadth: '',
      No: '',
      MachiningStock: '',
      grossWeight: '',
      forgingVolume: '',
      MachiningMultiplyingFactorPercentage: ''

    })

    setValue("")

  }
  /**
   * @method editRow
   * @description for filling the row above table for editing
   */
  const editRow = (index) => {
    setIsEdit(true)
    setEditIndex(index)
    const tempObj = tableData[index]
    
    setOldNetWeight(tempObj.GrossWeight)
    setValue('majorDiameter', tempObj.MajorDiameter)
    setValue('minorDiameter', tempObj.MinorDiameter)
    setValue('Length', tempObj.Length)
    setValue('Height', tempObj.Height)
    setValue('Breadth', tempObj.Breadth)
    setValue('No', tempObj.No)
    setValue('MachiningStock', { label: tempObj.TypesOfMachiningStock, value: tempObj.TypesOfMachiningStockId })
    setValue('grossWeight', tempObj.GrossWeight)
    setValue('forgingVolume', tempObj.Volume)
    setValue('description', tempObj.Description)
    setValue('MachiningMultiplyingFactorPercentage', tempObj?.MachiningMultiplyingFactorPercentage)

    if (tempObj.TypesOfMachiningStock === 'Circular' || tempObj.TypesOfMachiningStock === 'Semi Circular' || tempObj.TypesOfMachiningStock === 'Quarter Circular') {
      setDisableMachineType(true)
      setCircularMachiningStock(true)
      setSquareMachiningStock(false)
      setRectangularMachiningStock(false)
      setIrregularMachiningStock(false)
    }
    else if (tempObj.TypesOfMachiningStock === 'Square') {
      setDisableMachineType(true)
      setSquareMachiningStock(true)
      setCircularMachiningStock(false)
      setRectangularMachiningStock(false)
      setIrregularMachiningStock(false)
    }
    else if (tempObj.TypesOfMachiningStock === 'Rectangular') {
      setDisableMachineType(true)
      setRectangularMachiningStock(true)
      setSquareMachiningStock(false)
      setCircularMachiningStock(false)
      setIrregularMachiningStock(false)
    }
    else if (tempObj.TypesOfMachiningStock === 'Multiplying factor (Yield %)') {
      setDisableMachineType(true)
      setRectangularMachiningStock(false)
      setSquareMachiningStock(false)
      setCircularMachiningStock(false)
      setIrregularMachiningStock(false)
    }
    else {
      setDisableMachineType(true)
      setIrregularMachiningStock(true)
      setSquareMachiningStock(false)
      setCircularMachiningStock(false)
      setRectangularMachiningStock(false)
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
    setValue('majorDiameter', '')
    setValue('minorDiameter', '')
    setValue('Length', '')
    setValue('Height', '')
    setValue('Breadth', '')
    setValue('No', '')
    setValue('MachiningStock', '')
    setValue('grossWeight', '')
    setValue('forgingVolume', '')
    setValue('description', '')
    setDisableMachineType(false)
    reset()

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
      weight = netWeight - tempObj.GrossWeight
    }


    setNetWeight(weight)
    props.calculation(weight)
    let tempData = tableData.filter((item, i) => {
      if (i === index) {
        return false
      }
      return true
    })


    props.tableValue(tempData)
    setTableData(tempData)
    cancelUpdate()
  }

  const UnitFormat = () => {
    return <>Volume (mm<sup>3</sup>)</>
  }
  const handleMajordiameterChange = (e) => {
    let majorDiameter = checkForNull(Number(e?.target?.value))
    if (Number(getValues('minorDiameter')) < majorDiameter) {
      delete errors.minorDiameter
    }
  }
  const handleMinordiameterChange = (value) => {
    let minorDiameter = checkForNull(Number(value?.target?.value))
    if (Number(getValues('majorDiameter')) > minorDiameter) {
      delete errors.majorDiameter
    }
  }
  return (
    <Fragment>
      <Row className={''}>
        <Col md="12">
          <div className="header-title">
            <h5>{'Machining Stock:'}</h5>
          </div>
        </Col>

        <Col md="3">
          <SearchableSelectHookForm
            label={`Shape Type`}
            name={'MachiningStock'}
            placeholder={'Select'}
            Controller={Controller}
            control={control}
            register={register}
            mandatory={false}
            options={dropDownMenu}
            handleChange={handleMachiningStockChange}
            defaultValue={''}
            className=""
            customClassName={'withBorder'}
            errors={errors.MachiningStock}
            disabled={props.CostingViewMode || forgingCalculatorMachiningStockSectionValue || disableMachineType || disableAll ? true : false}
          />
        </Col>


        <Col md="3">
          <TextFieldHookForm
            label={`Description`}
            name={'description'}
            Controller={Controller}
            control={control}
            register={register}
            mandatory={true}
            rules={{
              required: true,
              validate: { maxLength200 }
            }}
            handleChange={() => { }}
            defaultValue={''}
            className=""
            customClassName={'withBorder'}
            errors={errors.description}
            disabled={props.CostingViewMode || forgingCalculatorMachiningStockSectionValue || disableAll ? true : false}
          />
        </Col>
        {multiplyingFactorMachiningStock &&
          <Col md="3">
            <TextFieldHookForm
              label={`Machining Multiplying Factor (%)`}
              name={'MachiningMultiplyingFactorPercentage'}
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
              errors={errors.MachiningMultiplyingFactorPercentage}
              disabled={props.CostingViewMode || forgingCalculatorMachiningStockSectionValue || disableAll ? true : false}
            />
          </Col>
        }
        {!irregularMachiningStock && !multiplyingFactorMachiningStock &&
          <>
            <Col md="2" className='forging-length-wrapper'>
              <TextFieldHookForm
                label={`Length(mm)`}
                name={'Length'}
                Controller={Controller}
                control={control}
                register={register}
                mandatory={true}
                rules={{
                  required: true,
                  validate: { number, checkWhiteSpaces, decimalNumberLimit3 },
                }}
                handleChange={() => { }}
                defaultValue={''}
                className=""
                customClassName={'withBorder'}
                errors={errors.Length}
                disabled={props.CostingViewMode || forgingCalculatorMachiningStockSectionValue || disableAll ? true : false}
              />
            </Col >
          </>}


        {
          circularMachiningStock &&
          <>
            <Col md="3">
              <TextFieldHookForm
                label={`Major Diameter(mm)`}
                name={'majorDiameter'}
                Controller={Controller}
                control={control}
                register={register}
                mandatory={true}
                rules={{
                  required: true,
                  validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                  min: {
                    value: parseFloat(getValues('minorDiameter')) + 0.00000001, // adjust the threshold here acc to decimal validation above
                    message: 'Major Diameter should be not equal to or less than the minor diameter.'
                  },
                }}
                handleChange={handleMajordiameterChange}
                defaultValue={''}
                className=""
                customClassName={'withBorder'}
                errors={errors.majorDiameter}
                disabled={props.CostingViewMode || forgingCalculatorMachiningStockSectionValue || disableAll ? true : false}
              />
            </Col >

            <Col md="3">
              <TooltipCustom id={"minor-diameter-info"} width={"230px"} tooltipText={`For circular solid bars, Minor Diameter should be '0'`} />
              <TextFieldHookForm
                label={`Minor Diameter(mm)`}
                name={'minorDiameter'}
                Controller={Controller}
                control={control}
                register={register}
                mandatory={true}
                rules={{
                  required: true,
                  validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                  max: {
                    value: getValues('majorDiameter') - 0.00000001, // adjust the threshold here acc to decimal validation above,
                    message: 'Minor Diameter should be not equal to or greater than the major diameter.'
                  },
                }}
                handleChange={handleMinordiameterChange}
                defaultValue={''}
                className=""
                customClassName={'withBorder'}
                errors={errors.minorDiameter}
                disabled={props.CostingViewMode || forgingCalculatorMachiningStockSectionValue || disableAll ? true : false}
              />
            </Col >
          </>}
        {
          squareMachiningStock &&
          <>
            <Col md="2">
              <TextFieldHookForm
                label={`Number`}
                name={'No'}
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
                errors={errors.No}
                disabled={props.CostingViewMode || forgingCalculatorMachiningStockSectionValue || disableAll ? true : false}
              />
            </Col>


            <Col md="2">
              <TextFieldHookForm
                label={`Height(mm)`}
                name={'Height'}
                Controller={Controller}
                control={control}
                register={register}
                mandatory={true}
                rules={{
                  required: true,
                  validate: { number, checkWhiteSpaces, decimalNumberLimit3 },
                }}
                handleChange={() => { }}
                defaultValue={''}
                className=""
                customClassName={'withBorder'}
                errors={errors.Height}
                disabled={props.CostingViewMode || forgingCalculatorMachiningStockSectionValue || disableAll ? true : false}
              />
            </Col >
          </>}
        {
          rectangularMachiningStock &&
          <>

            <Col md="2">
              <TextFieldHookForm
                label={`Number`}
                name={'No'}
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
                errors={errors.No}
                disabled={props.CostingViewMode || forgingCalculatorMachiningStockSectionValue || disableAll ? true : false}
              />
            </Col >

            <Col md="2">
              <TextFieldHookForm
                label={`Breadth(mm)`}
                name={'Breadth'}
                Controller={Controller}
                control={control}
                register={register}
                mandatory={true}
                rules={{
                  required: true,
                  validate: { number, checkWhiteSpaces, decimalNumberLimit3 },
                }}
                handleChange={() => { }}
                defaultValue={''}
                className=""
                customClassName={'withBorder'}
                errors={errors.Breadth}
                disabled={props.CostingViewMode || forgingCalculatorMachiningStockSectionValue || disableAll ? true : false}
              />
            </Col>
            <Col md="2">
              <TextFieldHookForm
                label={`Height(mm)`}
                name={'Height'}
                Controller={Controller}
                control={control}
                register={register}
                mandatory={true}
                rules={{
                  required: true,
                  validate: { number, checkWhiteSpaces, decimalNumberLimit3 },
                }}
                handleChange={() => { }}
                defaultValue={''}
                className=""
                customClassName={'withBorder'}
                errors={errors.Height}
                disabled={props.CostingViewMode || forgingCalculatorMachiningStockSectionValue || disableAll ? true : false}
              />
            </Col >

          </>}
        {
          irregularMachiningStock &&
          <>
            <Col md="3">
              <TextFieldHookForm
                label={`Number`}
                name={'No'}
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
                errors={errors.No}
                disabled={props.CostingViewMode || forgingCalculatorMachiningStockSectionValue || disableAll ? true : false}
              />
            </Col >
          </>}
          {!multiplyingFactorMachiningStock &&
            <Col md="3">
              {disable && tooltipMessageForVolume && <TooltipCustom disabledIcon={true} tooltipClass={`${tooltipClassShow ? 'weight-of-sheet' : ''}`} id={'forging-volume'} tooltipText={tooltipMessageForVolume} />}
              <TextFieldHookForm
                label={UnitFormat()}
                name={'forgingVolume'}
                Controller={Controller}
                control={control}
                register={register}
                mandatory={false}
                id={'forging-volume'}
                handleChange={handleVolumeChange}
                defaultValue={''}
                className=""
                customClassName={'withBorder'}
                errors={errors.forgingVolume}
                disabled={disable}
              />
            </Col >
          }
        <Col md="3">
          {tooltipMessageForGross && <TooltipCustom disabledIcon={true} id={'forging-gross-weight'} tooltipText={tooltipMessageForGross} />}
          <TextFieldHookForm
            label={`Gross Weight(kg)`}
            name={'grossWeight'}
            Controller={Controller}
            control={control}
            register={register}
            mandatory={false}
            handleChange={() => { }}
            defaultValue={''}
            className=""
            id={'forging-gross-weight'}
            customClassName={'withBorder'}
            errors={errors.grossWeight}
            disabled={true}
          />
        </Col >

        <Col md="3" className="pr-0">
          <div>
            {isEdit ? (
              <>
                <button
                  type="submit"
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
              <button
                type="button"
                className={'user-btn mt30 pull-left'}
                onClick={addRow}
                disabled={props.CostingViewMode || forgingCalculatorMachiningStockSectionValue || disableAll ? true : false}
              >
                <div className={'plus'}></div>ADD
              </button>
            )}
          </div>
        </Col>

        <Col md="12">
          <Table className="table mb-0 forging-cal-table" size="sm">
            <thead>
              <tr>
                <th>{`Description`}</th>
                <th>{`Type of Machining Stock`}</th>
                <th>{`Major Diameter (mm)`}</th>
                <th>{`Minor Diameter (mm)`}</th>
                <th>{`Length (mm)`}</th>
                <th>{`Breadth (mm)`}</th>
                <th>{`Height (mm)`}</th>
                <th>{`Number`}</th>
                <th>{`Multiplying factor (Yield %)`}</th>
                <th>{UnitFormat()}</th>
                <th>{`Gross Weight (Kg)`}</th>
                <th>{`Actions`}</th>
              </tr>
            </thead>
            <tbody>
              {tableData &&
                tableData.map((item, index) => {
                  return (
                    <Fragment>
                      <tr key={index}>
                        <td className='text-overflow'> <span title={item.Description}>{item.Description !== null ? item.Description : '-'}</span></td>
                        <td>{item.TypesOfMachiningStock !== null ? item.TypesOfMachiningStock : '-'}</td>
                        <td>{checkForDecimalAndNull(item.MajorDiameter, getConfigurationKey().NoOfDecimalForInputOutput) !== null ? checkForDecimalAndNull(item.MajorDiameter, getConfigurationKey().NoOfDecimalForInputOutput) : '-'}</td>
                        <td>{checkForDecimalAndNull(item.MinorDiameter, getConfigurationKey().NoOfDecimalForInputOutput) !== null ? checkForDecimalAndNull(item.MinorDiameter, getConfigurationKey().NoOfDecimalForInputOutput) : '-'}</td>
                        <td>{checkForDecimalAndNull(item.Length, getConfigurationKey().NoOfDecimalForInputOutput) !== null ? checkForDecimalAndNull(item.Length, getConfigurationKey().NoOfDecimalForInputOutput) : '-'}</td>
                        <td>{checkForDecimalAndNull(item.Breadth, getConfigurationKey().NoOfDecimalForInputOutput) !== null ? checkForDecimalAndNull(item.Breadth, getConfigurationKey().NoOfDecimalForInputOutput) : '-'}</td>
                        <td>{checkForDecimalAndNull(item.Height, getConfigurationKey().NoOfDecimalForInputOutput) !== null ? checkForDecimalAndNull(item.Height, getConfigurationKey().NoOfDecimalForInputOutput) : '-'}</td>
                        <td>{checkForDecimalAndNull(item.No, getConfigurationKey().NoOfDecimalForInputOutput) !== null ? checkForDecimalAndNull(item.No, getConfigurationKey().NoOfDecimalForInputOutput) : '-'}</td>
                        <td>{checkForDecimalAndNull(item?.MachiningMultiplyingFactorPercentage, getConfigurationKey().NoOfDecimalForInputOutput) !== null ? checkForDecimalAndNull(item?.MachiningMultiplyingFactorPercentage, getConfigurationKey().NoOfDecimalForInputOutput) : '-'}</td>

                        <td className='number-overflow'>
                          <span title={checkForDecimalAndNull(item.Volume, getConfigurationKey().NoOfDecimalForInputOutput)}>{checkForDecimalAndNull(item.Volume, getConfigurationKey().NoOfDecimalForInputOutput)}</span>

                        </td>
                        <td className='number-overflow'>
                          <span title={checkForDecimalAndNull(item.GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput)}>{checkForDecimalAndNull(item.GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput)}</span>
                        </td>
                        <td>
                          {
                            <React.Fragment>
                              <button
                                className="Edit mr-2"
                                type={'button'}
                                title='Edit'
                                disabled={props.CostingViewMode || forgingCalculatorMachiningStockSectionValue || disableAll ? true : false}
                                onClick={() => editRow(index)}
                              />
                              <button
                                className="Delete"
                                title='Delete'
                                type={'button'}
                                disabled={props.CostingViewMode || forgingCalculatorMachiningStockSectionValue || disableAll ? true : false}
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

            <span className="w-50 d-inline-block">
              {`Total Machining Stock: `}
              {checkForDecimalAndNull(calculateTotalMachiningStock(tableData), trim)}
            </span>
          </div>
        </Col>

      </Row >

    </Fragment >
  )
}

export default React.memo(MachiningStockTable)
