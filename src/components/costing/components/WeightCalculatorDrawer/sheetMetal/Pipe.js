import React, { useState, useContext, useEffect, useCallback } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import { useDispatch, useSelector } from 'react-redux'
import { Col, Row } from 'reactstrap'
import { saveRawMaterialCalciData } from '../../../actions/CostWorking'
import HeaderTitle from '../../../../common/HeaderTitle'
import { SearchableSelectHookForm, TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import Switch from 'react-switch'
import {
  checkForDecimalAndNull, checkForNull, getNetSurfaceArea, getNetSurfaceAreaBothSide, loggedInUserId, getWeightFromDensity, convertmmTocm, getConvertedValue, setValueAccToUOM,
} from '../../../../../helper'
import { getUOMListByUnitType, getUOMSelectList } from '../../../../../actions/Common'
import { reactLocalStorage } from 'reactjs-localstorage'
import { toastr } from 'react-redux-toastr'
import { G, KG, MG, STD, } from '../../../../../config/constants'
import { AcceptableSheetMetalUOM } from '../../../../../config/masterData'

function Pipe(props) {

  const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest;


  const { rmRowData, isEditFlag } = props

  const costData = useContext(costingInfoContext)

  const defaultValues = {

    //UOMDimension: WeightCalculatorRequest && WeightCalculatorRequest.UOMDimension !== undefined ? WeightCalculatorRequest.UOMDimension : '',
    OuterDiameter: WeightCalculatorRequest && WeightCalculatorRequest.OuterDiameter !== null ? WeightCalculatorRequest.OuterDiameter : '',
    Thickness: WeightCalculatorRequest && WeightCalculatorRequest.Thickness !== null ? WeightCalculatorRequest.Thickness : '',
    InnerDiameter: WeightCalculatorRequest && WeightCalculatorRequest.InnerDiameter !== null ? WeightCalculatorRequest.InnerDiameter : '',
    SheetLength: WeightCalculatorRequest && WeightCalculatorRequest.LengthOfSheet !== null ? WeightCalculatorRequest.LengthOfSheet : '',
    PartLength: WeightCalculatorRequest && WeightCalculatorRequest.LengthOfPart !== null ? WeightCalculatorRequest.LengthOfPart : '',
    NumberOfPartsPerSheet: WeightCalculatorRequest && WeightCalculatorRequest.NumberOfPartsPerSheet !== null ? WeightCalculatorRequest.NumberOfPartsPerSheet : '',
    ScrapLength: WeightCalculatorRequest && WeightCalculatorRequest.LengthOfScrap !== null ? WeightCalculatorRequest.LengthOfScrap : '',
    WeightofSheet: WeightCalculatorRequest && WeightCalculatorRequest.WeightOfSheetInUOM !== null ? WeightCalculatorRequest.WeightOfSheetInUOM : '',
    WeightofPart: WeightCalculatorRequest && WeightCalculatorRequest.WeightOfPartInUOM !== null ? WeightCalculatorRequest.WeightOfPartInUOM : '',
    WeightofScrap: WeightCalculatorRequest && WeightCalculatorRequest.WeightOfScrapInUOM !== null ? WeightCalculatorRequest.WeightOfScrapInUOM : '',
    NetSurfaceArea: WeightCalculatorRequest && WeightCalculatorRequest.NetSurfaceArea !== null ? WeightCalculatorRequest.NetSurfaceArea : '',
    GrossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== null ? WeightCalculatorRequest.GrossWeight : '',
    FinishWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== null ? WeightCalculatorRequest.FinishWeight : '',
  }

  const {
    register, handleSubmit, control, setValue, getValues, reset, errors, } = useForm({
      mode: 'onChange',
      reValidateMode: 'onChange',
      defaultValues: defaultValues,
    })


  const localStorage = reactLocalStorage.getObject('InitialConfiguration');

  const [isOneSide, setIsOneSide] = useState(WeightCalculatorRequest && WeightCalculatorRequest.IsOneSide ? WeightCalculatorRequest.IsOneSide : false)
  const [UOMDimension, setUOMDimension] = useState(
    WeightCalculatorRequest && WeightCalculatorRequest.UOMForDimensionId !== null
      ? {
        label: WeightCalculatorRequest.UOMForDimension,
        value: WeightCalculatorRequest.UOMForDimensionId,
      }
      : [],
  )

  let extraObj = {}
  const [dataToSend, setDataToSend] = useState({})
  const [isChangeApplies, setIsChangeApplied] = useState(true)
  const [unit, setUnit] = useState(WeightCalculatorRequest && WeightCalculatorRequest.UOMForDimensionId ? WeightCalculatorRequest.UOMForDimension !== null : G) //Need to change default value after getting it from API
  const tempOldObj = WeightCalculatorRequest
  const [GrossWeight, setGrossWeights] = useState('')
  const [FinishWeight, setFinishWeights] = useState('')



  const fieldValues = useWatch({
    control,
    name: ['OuterDiameter', 'Thickness', 'SheetLength', 'PartLength'],
  })

  const dispatch = useDispatch()

  useEffect(() => {
    //UNIT TYPE ID OF DIMENSIONS
    const UnitTypeId = '305e0874-0a2d-4eab-9781-4fe397b16fcc' // static
    dispatch(getUOMListByUnitType(UnitTypeId, (res) => { }))
    dispatch(getUOMSelectList(res => {
      const Data = res.data.Data
      const kgObj = Data.find(el => el.Text === G)
      setTimeout(() => {
        setValue('UOMDimension', WeightCalculatorRequest && WeightCalculatorRequest.UOMForDimensionId !== null
          ? {
            label: WeightCalculatorRequest.UOMForDimension,
            value: WeightCalculatorRequest.UOMForDimensionId,
          }
          : { label: kgObj.Text, value: kgObj.Value })
        setUOMDimension(WeightCalculatorRequest && WeightCalculatorRequest.UOMForDimensionId !== null
          ? {
            label: WeightCalculatorRequest.UOMForDimension,
            value: WeightCalculatorRequest.UOMForDimensionId,
          }
          : { label: kgObj.Text, value: kgObj.Value })
      }, 100);

    }))
    setFinishWeights(WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== null ? WeightCalculatorRequest.FinishWeight : 0)
  }, [])

  const UOMSelectListByUnitType = useSelector(
    (state) => state.comman.UOMSelectListByUnitType,
  )

  const UOMSelectList = useSelector((state) => state.comman.UOMSelectList)

  useEffect(() => {
    calculateInnerDiameter()
    calculateNumberOfPartPerSheet()
    calculateLengthofScrap()
    calculateWeightOfSheet()
    calculateWeightOfPart()
    calculateWeightOfScrap()
    calculateNetSurfaceArea()
    setGrossWeight()
    setFinishWeight()
  }, [fieldValues])



  useEffect(() => {
    if (isOneSide) {
      setNetSurfaceAreaBothSide()
    } else {
      calculateNetSurfaceArea()
    }
  }, [isOneSide])

  /**
   * @method calculateInnerDiameter
   * @description CALCULATE INNER DIAMETER
   */
  const calculateInnerDiameter = () => {
    const ID = checkForNull(fieldValues.OuterDiameter) - 2 * checkForNull(convertmmTocm(fieldValues.Thickness));
    setValue('InnerDiameter', checkForDecimalAndNull(ID, localStorage.NoOfDecimalForInputOutput))
    const updatedValue = dataToSend
    updatedValue.InnerDiameter = ID
    setDataToSend(updatedValue)
    // setDataToSend({ ...dataToSend, updatedValue })
  }

  /**
   * @method calculateNumberOfPartPerSheet
   * @description CALCULATE NUMBER OF PARTS PER SHEET
   */
  const calculateNumberOfPartPerSheet = () => {
    if (fieldValues.SheetLength === '') {
      // setDataToSend({ ...dataToSend, NumberOfPartsPerSheet: 1 })
      setValue('NumberOfPartsPerSheet', 1)
      const updatedValue = dataToSend
      updatedValue.NumberOfPartsPerSheet = 1
      setDataToSend(updatedValue)
    } else {
      const NumberParts = checkForNull(fieldValues.SheetLength / fieldValues.PartLength)
      // setDataToSend({ ...dataToSend, NumberOfPartsPerSheet: NumberParts })
      setValue('NumberOfPartsPerSheet', parseInt(NumberParts))
      const updatedValue = dataToSend
      updatedValue.NumberOfPartsPerSheet = parseInt(NumberParts)
      setDataToSend(updatedValue)
    }
  }

  /**
   * @method calculateLengthofScrap
   * @description CALCULATE LENGTH OF SCRAP
   */
  const calculateLengthofScrap = () => {
    const scrapLength = checkForNull(fieldValues.SheetLength % fieldValues.PartLength)
    const updatedValue = dataToSend
    updatedValue.ScrapLength = scrapLength
    setDataToSend(updatedValue)
    setValue('ScrapLength', checkForDecimalAndNull(scrapLength, localStorage.NoOfDecimalForInputOutput))
  }

  /**
   * @method calculateWeightOfSheet
   * @description CALCULATE WEIGHT OF SHEET
   */
  const calculateWeightOfSheet = () => {
    const data = {
      Density: props.rmRowData.Density,
      OuterDiameter: Number(getValues('OuterDiameter')),
      InnerDiameter: dataToSend.InnerDiameter,
      SheetLength: Number(getValues('SheetLength')),
      ExtraVariable: '',
    }

    // const SheetWeight = getWeightOfSheet(data)
    const SheetWeight = getWeightFromDensity(data.Density, data.InnerDiameter, data.OuterDiameter, data.SheetLength)

    const updatedValue = dataToSend
    updatedValue.WeightofSheet = SheetWeight
    setDataToSend(updatedValue)
    setValue('WeightofSheet', checkForDecimalAndNull(SheetWeight, localStorage.NoOfDecimalForInputOutput))
  }

  /**
   * @method calculateWeightOfPart
   * @description CALCULATE WEIGHT OF PART
   */
  const calculateWeightOfPart = () => {
    const data = {
      Density: props.rmRowData.Density,
      OuterDiameter: getValues('OuterDiameter'),
      InnerDiameter: dataToSend.InnerDiameter,
      PartLength: getValues('PartLength'),
      ExtraVariable: '',
    }
    // const PartWeight = getWeightOfPart(data)
    const PartWeight = getWeightFromDensity(data.Density, data.InnerDiameter, data.OuterDiameter, data.PartLength)
    const updatedValue = dataToSend
    updatedValue.WeightofPart = PartWeight
    setDataToSend(updatedValue)
    setValue('WeightofPart', checkForDecimalAndNull(PartWeight, localStorage.NoOfDecimalForInputOutput))
  }

  /**
   * @method calculateWeightOfScrap
   * @description CALCULATE WEIGHT OF SCRAP
   */
  const calculateWeightOfScrap = () => {
    const data = {
      Density: props.rmRowData.Density,
      OuterDiameter: getValues('OuterDiameter'),
      InnerDiameter: dataToSend.InnerDiameter,
      ScrapLength: dataToSend.ScrapLength,
      ExtraVariable: '',
    }
    // const ScrapWeight = getWeightOfScrap(data)
    const ScrapWeight = getWeightFromDensity(data.Density, data.InnerDiameter, data.OuterDiameter, data.ScrapLength)
    const updatedValue = dataToSend
    updatedValue.WeightofScrap = ScrapWeight
    setDataToSend(updatedValue)
    setValue('WeightofScrap', checkForDecimalAndNull(ScrapWeight, localStorage.NoOfDecimalForInputOutput))
  }

  /**
   * @method calculateNetSurfaceArea
   * @description CALCULATE NET SURFACE AREA
   */
  const calculateNetSurfaceArea = () => {
    const data = {
      OuterDiameter: getValues('OuterDiameter'),
      InnerDiameter: dataToSend.InnerDiameter,
      PartLength: getValues('PartLength'),
      ExtraVariable: '',
    }
    const NetSurfaceArea = getNetSurfaceArea(data)
    const updatedValue = dataToSend
    updatedValue.NetSurfaceArea = NetSurfaceArea
    setDataToSend(updatedValue)
    setValue('NetSurfaceArea', checkForDecimalAndNull(NetSurfaceArea, localStorage.NoOfDecimalForInputOutput))
  }

  /**
   * @method setNetSurfaceAreaBothSide
   * @description CALCULATE NET SURFACE AREA BOTH SIDE
   */
  const setNetSurfaceAreaBothSide = () => {
    const data = {
      OuterDiameter: getValues('OuterDiameter'),
      InnerDiameter: dataToSend.InnerDiameter,
      PartLength: getValues('PartLength'),
      ExtraVariable: '',
    }

    const NetSurfaceAreaBothSide = getNetSurfaceAreaBothSide(data)
    const updatedValue = dataToSend
    updatedValue.NetSurfaceArea = NetSurfaceAreaBothSide
    setDataToSend(updatedValue)
    setValue('NetSurfaceArea', checkForDecimalAndNull(NetSurfaceAreaBothSide, localStorage.NoOfDecimalForInputOutput))
  }

  /**
   * @method setGrossWeight
   * @description SET GROSS WEIGHT
   */
  const setGrossWeight = () => {

    let WeightofPart
    if (rmRowData.RawMaterialCategory === STD) {
      WeightofPart = setValueAccToUOM(dataToSend.WeightofPart + (dataToSend.WeightofScrap / dataToSend.NumberOfPartsPerSheet), UOMDimension.label)
      setGrossWeights(dataToSend.WeightofPart + (dataToSend.WeightofScrap / dataToSend.NumberOfPartsPerSheet), UOMDimension.label)
    } else {
      WeightofPart = setValueAccToUOM(dataToSend.WeightofPart, UOMDimension.label)
      setGrossWeights(dataToSend.WeightofPart)
    }
    const updatedValue = dataToSend
    setValue('GrossWeight', checkForDecimalAndNull(WeightofPart, localStorage.NoOfDecimalForInputOutput))
    // switch (UOMDimension.label) {
    //   case G:
    //     updatedValue.GrossWeight = WeightofPart
    //     setDataToSend(updatedValue)
    //     setValue('GrossWeight', checkForDecimalAndNull(WeightofPart, localStorage.NoOfDecimalForInputOutput))
    //     break;
    //   case KG:
    //     updatedValue.GrossWeight = WeightofPart / 1000
    //     setDataToSend(updatedValue)
    //     setValue('GrossWeight', checkForDecimalAndNull(WeightofPart / 1000, localStorage.NoOfDecimalForInputOutput))
    //     break;
    //   case MG:
    //     updatedValue.GrossWeight = WeightofPart * 1000
    //     setDataToSend(updatedValue)
    //     setValue('GrossWeight', checkForDecimalAndNull(WeightofPart * 1000, localStorage.NoOfDecimalForInputOutput))
    //     break;

    //   default:
    //     break;
    // }
  }

  /**
   * @method setFinishWeight
   * @description SET FINISH WEIGHT
   */
  const setFinishWeight = () => {
    const FinishWeight = setValueAccToUOM(dataToSend.WeightofPart - checkForNull(dataToSend.WeightofScrap / dataToSend.NumberOfPartsPerSheet), UOMDimension.label)
    const updatedValue = dataToSend
    setValue('FinishWeight', checkForDecimalAndNull(FinishWeight, localStorage.NoOfDecimalForInputOutput))
    //setFinishWeight(dataToSend.WeightofPart - checkForNull(dataToSend.WeightofScrap / dataToSend.NumberOfPartsPerSheet))
    setFinishWeights(dataToSend.WeightofPart - checkForNull(dataToSend.WeightofScrap / dataToSend.NumberOfPartsPerSheet))
    // switch (UOMDimension.label) {
    //   case G:
    //     updatedValue.FinishWeight = FinishWeight
    //     setDataToSend(updatedValue)
    //     setValue('FinishWeight', checkForDecimalAndNull(FinishWeight, localStorage.NoOfDecimalForInputOutput))
    //     break;
    //   case KG:
    //     updatedValue.FinishWeight = FinishWeight / 1000
    //     setDataToSend(updatedValue)
    //     setValue('FinishWeight', checkForDecimalAndNull(FinishWeight / 1000, localStorage.NoOfDecimalForInputOutput))
    //     break;
    //   case MG:
    //     updatedValue.FinishWeight = FinishWeight * 1000
    //     setDataToSend(updatedValue)
    //     setValue('FinishWeight', checkForDecimalAndNull(FinishWeight * 1000, localStorage.NoOfDecimalForInputOutput))
    //     break;
    //   default:
    //     break;
    // }
  }

  /**
   * @method onSideToggle
   * @description SIDE TOGGLE
   */
  const onSideToggle = () => {
    setIsOneSide(!isOneSide)
  }

  /**
   * @method renderListing
   * @description Used show listing of unit of measurement
   */
  const renderListing = (label) => {
    const temp = []

    if (label === 'UOM') {
      UOMSelectList &&
        UOMSelectList.map((item) => {
          const accept = AcceptableSheetMetalUOM.includes(item.Text)
          if (accept === false) return false
          if (item.Value === '0') return false
          temp.push({ label: item.Text, value: item.Value })
          return null
        })
      return temp
    }
  }

  /**
   * @method handleUOMChange
   * @description  USED TO HANDLE UOM CHANGE
   */
  const handleUOMChange = (newValue) => {
    if (newValue && newValue !== '') {
      setUOMDimension(newValue)
    } else {
      setUOMDimension([])
    }
  }

  /**
   * @method cancel
   * @description used to Reset form
   */
  const cancel = () => {
    props.toggleDrawer('')
  }

  /**
   * @method onSubmit
   * @description Used to Submit the form
   */
  const onSubmit = (values) => {


    if (WeightCalculatorRequest && WeightCalculatorRequest.WeightCalculationId !== "00000000-0000-0000-0000-000000000000") {
      if (tempOldObj.GrossWeight !== dataToSend.GrossWeight || tempOldObj.FinishWeight !== dataToSend.FinishWeight || tempOldObj.NetSurfaceArea !== dataToSend.NetSurfaceArea || tempOldObj.UOMForDimensionId !== UOMDimension.value) {
        setIsChangeApplied(true)
      } else {
        setIsChangeApplied(false)
      }
    }
    let data = {
      LayoutType: 'Pipe',
      WeightCalculationId: WeightCalculatorRequest && WeightCalculatorRequest.WeightCalculationId ? WeightCalculatorRequest.WeightCalculationId : "00000000-0000-0000-0000-000000000000",
      IsChangeApplied: isChangeApplies, //NEED TO MAKE IT DYNAMIC how to do,
      PartId: costData.PartId,
      RawMaterialId: rmRowData.RawMaterialId,
      CostingId: costData.CostingId,
      TechnologyId: costData.TechnologyId,
      CostingRawMaterialDetailId: rmRowData.RawMaterialDetailId,
      RawMaterialName: rmRowData.RMName,
      RawMaterialType: rmRowData.MaterialType,
      BasicRatePerUOM: rmRowData.RMRate,
      ScrapRate: rmRowData.ScrapRate,
      NetLandedCost: dataToSend.GrossWeight * rmRowData.RMRate - (dataToSend.GrossWeight - dataToSend.FinishWeight) * rmRowData.ScrapRate,
      PartNumber: costData.PartNumber,
      TechnologyName: costData.TechnologyName,
      Density: rmRowData.Density,
      UOMForDimensionId: UOMDimension ? UOMDimension.value : '',
      UOMForDimension: UOMDimension ? UOMDimension.label : '',
      // UOMDimension: values.UOMDimension,  where it is
      OuterDiameter: values.OuterDiameter,
      Thickness: values.Thickness,
      InnerDiameter: dataToSend.InnerDiameter
      ,
      LengthOfSheet: values.SheetLength,
      LengthOfPart: values.PartLength,
      NumberOfPartsPerSheet: dataToSend.NumberOfPartsPerSheet,
      LengthOfScrap: dataToSend.ScrapLength,
      WeightOfSheetInUOM: dataToSend.WeightofSheet,
      WeightOfPartInUOM: dataToSend.WeightofPart,
      WeightOfScrapInUOM: dataToSend.WeightofScrap
      ,
      // Side: isOneSide, why and where
      UOMId: rmRowData.UOMId,
      UOM: rmRowData.UOM,
      IsOneSide: isOneSide,
      SurfaceAreaSide: isOneSide ? 'Both Side' : 'One  Side',
      NetSurfaceArea: dataToSend.NetSurfaceArea,
      GrossWeight: (dataToSend.newGrossWeight === undefined || dataToSend.newGrossWeight === 0) ? dataToSend.GrossWeight : dataToSend.newGrossWeight,
      FinishWeight: (dataToSend.newFinishWeight === undefined || dataToSend.newFinishWeight === 0) ? dataToSend.FinishWeight : dataToSend.newFinishWeight,
      LoggedInUserId: loggedInUserId()
    }

    let obj = {
      originalGrossWeight: GrossWeight,
      originalFinishWeight: FinishWeight
    }

    dispatch(saveRawMaterialCalciData(data, res => {

      if (res.data.Result) {
        data.WeightCalculationId = res.data.Identity
        toastr.success("Calculation saved successfully")
        props.toggleDrawer('', data, obj)
      }
    }))
  }

  const handleUnit = (value) => {
    setValue('UOMDimension', { label: value.label, value: value.value })
    setUOMDimension(value)
    let grossWeight = GrossWeight

    let finishWeight = FinishWeight
    grossWeight = setValueAccToUOM(grossWeight, value.label)
    finishWeight = setValueAccToUOM(finishWeight, value.label)
    // setValue('GrossWeight', checkForDecimalAndNull(grossWeight, localStorage.NoOfDecimalForInputOutput))

    setUnit(value.label)

    // switch (value.label) {
    //   case KG:
    //     grossWeight = grossWeight / 1000
    //     finishWeight = finishWeight / 1000
    //     setDataToSend(prevState => ({ ...prevState, newGrossWeight: grossWeight, newFinishWeight: finishWeight }))
    setTimeout(() => {
      setValue('GrossWeight', checkForDecimalAndNull(grossWeight, localStorage.NoOfDecimalForInputOutput))
      setValue('FinishWeight', checkForDecimalAndNull(finishWeight, localStorage.NoOfDecimalForInputOutput))
    }, 100);
    //     break;
    //   case G:
    //     grossWeight = grossWeight
    //     finishWeight = finishWeight
    //     setDataToSend(prevState => ({ ...prevState, newGrossWeight: grossWeight, newFinishWeight: finishWeight }))
    //     setTimeout(() => {
    //       setValue('GrossWeight', checkForDecimalAndNull(grossWeight, localStorage.NoOfDecimalForInputOutput))
    //       setValue('FinishWeight', checkForDecimalAndNull(finishWeight, localStorage.NoOfDecimalForInputOutput))
    //     }, 100);
    //     break;
    //   case MG:
    //     grossWeight = grossWeight * 1000
    //     finishWeight = finishWeight * 1000
    //     setDataToSend(prevState => ({ ...prevState, newGrossWeight: grossWeight, newFinishWeight: finishWeight }))
    //     setTimeout(() => {
    //       setValue('GrossWeight', checkForDecimalAndNull(grossWeight, localStorage.NoOfDecimalForInputOutput))
    //       setValue('FinishWeight', checkForDecimalAndNull(finishWeight, localStorage.NoOfDecimalForInputOutput))
    //     }, 100);
    //     break;
    //   default:
    //     break;
    // }
  }

  const UnitFormat = () => {
    return <>Net Surface Area (cm<sup>2</sup>)</>
    // return (<sup>2</sup>)
  }

  const onFinishChange = (e) => {
    const weight = checkForNull(e.target.value)
    setTimeout(() => {
      setValue('FinishWeight', weight)
      setFinishWeight(weight)
    }, 200);
  }

  /**
   * @method render
   * @description Renders the component
   */
  return (
    <>
      <div className="user-page p-0">
        <div>
          <form noValidate className="form" onSubmit={handleSubmit(onSubmit)}>
            <div className="costing-border border-top-0 px-4">
              <Row>
                <Col md="12" className={'mt25'}>
                  <HeaderTitle className="border-bottom"
                    title={'Sheet Specification'}
                    customClass={'underLine-title'}
                  />
                </Col>
              </Row>
              <Row className={'mt15'}>
                {/* <Col md="3">
                  <SearchableSelectHookForm
                    label={'UOM for Dimension'}
                    name={'UOMDimension'}
                    placeholder={'-Select-'}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    defaultValue={UOMDimension.length !== 0 ? UOMDimension : ''}
                    options={renderListing('UOM')}
                    mandatory={true}
                    handleChange={handleUOMChange}
                    errors={errors.UOMDimension}
                  // disabled={!isEditFlag}
                  />
                </Col> */}
                <Col md="3">
                  <TextFieldHookForm
                    label={`Outer Diameter(cm)`}
                    name={'OuterDiameter'}
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
                    errors={errors.OuterDiameter}
                    disabled={isEditFlag ? false : true}
                  />
                </Col>
                <Col md="3">
                  <TextFieldHookForm
                    label={`Thickness(mm)`}
                    name={'Thickness'}
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
                    errors={errors.Thickness}
                    disabled={isEditFlag ? false : true}
                  />
                </Col>
                <Col md="3">
                  <TextFieldHookForm
                    label={`Inner Diameter(cm)`}
                    name={'InnerDiameter'}
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
                    errors={errors.InnerDiameter}
                    disabled={true}
                  />
                </Col>
              </Row>

              <Row>
                <Col md="3">
                  <TextFieldHookForm
                    label={`Length of Sheet(cm)`}
                    name={'SheetLength'}
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
                    errors={errors.SheetLength}
                    disabled={isEditFlag ? false : true}
                  />
                </Col>
                <Col md="3">
                  <TextFieldHookForm
                    label={`Length of Part(cm)`}
                    name={'PartLength'}
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
                    errors={errors.PartLength}
                    disabled={isEditFlag ? false : true}
                  />
                </Col>
                <Col md="3">
                  <TextFieldHookForm
                    label="No. of Parts/Sheet"
                    name={'NumberOfPartsPerSheet'}
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
                    errors={errors.NumberOfPartsPerSheet}
                    disabled={true}
                  />
                </Col>
                <Col md="3">
                  <TextFieldHookForm
                    label={`Length of Scrap(cm)`}
                    name={'ScrapLength'}
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
                    errors={errors.ScrapLength}
                    disabled={true}
                  />
                </Col>
              </Row>

              <Row className={'mt15'}>
                <Col md="3">
                  <TextFieldHookForm
                    label={`Weight of Sheet(gm)`}
                    name={'WeightofSheet'}
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
                    errors={errors.WeightofSheet}
                    disabled={true}
                  />
                </Col>
                <Col md="3">
                  <TextFieldHookForm
                    label={`Weight of Part(gm)`}
                    name={'WeightofPart'}
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
                    errors={errors.WeightofPart}
                    disabled={true}
                  />
                </Col>
                <Col md="3">
                  <TextFieldHookForm
                    label={`Weight of Scrap(gm)`}
                    name={'WeightofScrap'}
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
                    errors={errors.WeightofScrap}
                    disabled={true}
                  />
                </Col>
              </Row>

              <Row className={'mt15'}>
                <Col md="12">
                  <HeaderTitle className="border-bottom"
                    title={'Surface Area'}
                    customClass={'underLine-title'}
                  />
                </Col>
              </Row>

              <Row className={'mt-15'}>
                <Col md="4" className="switch">
                  <label className="switch-level">
                    <div className={'left-title'}>{'One Side'}</div>
                    <Switch
                      onChange={onSideToggle}
                      checked={isOneSide}
                      id="normal-switch"
                      disabled={false}
                      background="#4DC771"
                      onColor="#4DC771"
                      onHandleColor="#ffffff"
                      offColor="#4DC771"
                      uncheckedIcon={false}
                      checkedIcon={false}
                      height={20}
                      width={46}
                    />
                    <div className={'right-title'}>{'Both Side'}</div>
                  </label>
                </Col>
                <Col md="4"></Col>

              </Row>
              <hr className="mx-n4 w-auto" />
              <Row>
                <Col md="3">
                  <TextFieldHookForm
                    label={UnitFormat()}
                    name={'NetSurfaceArea'}
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
                      // maxLength: 3,
                    }}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.NetSurfaceArea}
                    disabled={true}
                  />
                </Col>
                <Col md="3">
                  <SearchableSelectHookForm
                    label={'Weight Unit'}
                    name={'UOMDimension'}
                    placeholder={'-Select-'}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    defaultValue={UOMDimension.length !== 0 ? UOMDimension : ''}
                    options={renderListing('UOM')}
                    mandatory={true}
                    handleChange={handleUnit}
                    errors={errors.UOMDimension}
                    disabled={isEditFlag ? false : true}
                  />

                </Col>
                <Col md="3">
                  <TextFieldHookForm
                    label={`Gross Weight(${UOMDimension.label})`}
                    name={'GrossWeight'}
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
                      // maxLength: 3,
                    }}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.GrossWeight}
                    disabled={true}
                  />
                </Col>
                <Col md="3">
                  <TextFieldHookForm
                    label={`Finish Weight(${UOMDimension.label})`}
                    name={'FinishWeight'}
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
                    handleChange={(e) => { onFinishChange(e) }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.FinishWeight}
                    disabled={isEditFlag ? false : true}
                  />
                </Col>
              </Row>
            </div>

            <div className="col-sm-12 text-right px-0 mt-4">
              <button
                type={'button'}
                className="reset mr15 cancel-btn"
                onClick={cancel} >
                <div className={'cross-icon'}><img src={require('../../../../../assests/images/times.png')} alt='cancel-icon.jpg' /></div> {'Cancel'}
              </button>
              <button
                type={'submit'}
                className="submit-button save-btn">
                <div className={'check-icon'}><img src={require('../../../../../assests/images/check.png')} alt='check-icon.jpg' /> </div>
                {'Save'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  )
}

export default Pipe
