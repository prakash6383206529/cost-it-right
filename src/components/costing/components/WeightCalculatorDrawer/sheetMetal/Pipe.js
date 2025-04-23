import React, { useState, useEffect } from 'react'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { Col, Row } from 'reactstrap'
import { saveRawMaterialCalculationForSheetMetal } from '../../../actions/CostWorking'
import HeaderTitle from '../../../../common/HeaderTitle'
import { SearchableSelectHookForm, TextFieldHookForm } from '../../../../layout/HookFormInputs'
import Switch from 'react-switch'
import {
  checkForDecimalAndNull, checkForNull, getNetSurfaceArea, getNetSurfaceAreaBothSide, loggedInUserId, getWeightFromDensity, setValueAccToUOM, number, checkWhiteSpaces, decimalAndNumberValidation, calculateScrapWeight, percentageLimitValidation, calculatePercentage
} from '../../../../../helper'
import { getUOMSelectList } from '../../../../../actions/Common'
import { reactLocalStorage } from 'reactjs-localstorage'
import Toaster from '../../../../common/Toaster'
import { DISPLAY_G, DISPLAY_KG, DISPLAY_MG, G, STD, } from '../../../../../config/constants'
import { AcceptableSheetMetalUOM } from '../../../../../config/masterData'
import { debounce } from 'lodash'
import TooltipCustom from '../../../../common/Tooltip'
import { nonZero } from '../../../../../helper/validation'
import { useLabels } from '../../../../../helper/core'

function IsolateReRender(control) {
  const values = useWatch({
    control,
    name: ['OuterDiameter', 'Thickness', 'SheetLength', 'PartLength', 'endPieceAllowance', 'partLengthWithAllowance'],
  });

  return values;
}

function Pipe(props) {
  const { finishWeightLabel } = useLabels()

  const WeightCalculatorRequest = props.rmRowData.WeightCalculatorRequest;

  const convert = (FinishWeightOfSheet, dimmension) => {
    switch (dimmension) {
      case DISPLAY_G:
        setTimeout(() => {
          setFinishWeights(FinishWeightOfSheet)
        }, 200);
        break;
      case DISPLAY_KG:
        setTimeout(() => {
          setFinishWeights(FinishWeightOfSheet * 1000)
        }, 200);
        break;
      case DISPLAY_MG:
        setTimeout(() => {
          setFinishWeights(FinishWeightOfSheet / 1000)
        }, 200);
        break;
      default:
        break;
    }
  }
  const localStorage = reactLocalStorage.getObject('InitialConfiguration');
  const { rmRowData, item, CostingViewMode } = props

  const defaultValues = {

    OuterDiameter: WeightCalculatorRequest && WeightCalculatorRequest?.OuterDiameter !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.OuterDiameter, localStorage.NoOfDecimalForInputOutput) : '',
    Thickness: WeightCalculatorRequest && WeightCalculatorRequest?.Thickness !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.Thickness, localStorage.NoOfDecimalForInputOutput) : '',
    InnerDiameter: WeightCalculatorRequest && WeightCalculatorRequest?.InnerDiameter !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.InnerDiameter, localStorage.NoOfDecimalForInputOutput) : '',
    SheetLength: WeightCalculatorRequest && WeightCalculatorRequest?.LengthOfSheet !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.LengthOfSheet, localStorage.NoOfDecimalForInputOutput) : '',
    PartLength: WeightCalculatorRequest && WeightCalculatorRequest?.LengthOfPart !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.LengthOfPart, localStorage.NoOfDecimalForInputOutput) : '',
    NumberOfPartsPerSheet: WeightCalculatorRequest && WeightCalculatorRequest?.NumberOfPartsPerSheet !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NumberOfPartsPerSheet, localStorage.NoOfDecimalForInputOutput) : '',
    ScrapLength: WeightCalculatorRequest && WeightCalculatorRequest?.LengthOfScrap !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.LengthOfScrap, localStorage.NoOfDecimalForInputOutput) : '',
    WeightofSheet: WeightCalculatorRequest && WeightCalculatorRequest?.WeightOfSheetInUOM !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.WeightOfSheetInUOM, localStorage.NoOfDecimalForInputOutput) : '',
    WeightofPart: WeightCalculatorRequest && WeightCalculatorRequest?.WeightOfPartInUOM !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.WeightOfPartInUOM, localStorage.NoOfDecimalForInputOutput) : '',
    WeightofScrap: WeightCalculatorRequest && WeightCalculatorRequest?.WeightOfScrapInUOM !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.WeightOfScrapInUOM, localStorage.NoOfDecimalForInputOutput) : '',
    NetSurfaceArea: WeightCalculatorRequest && WeightCalculatorRequest?.NetSurfaceArea !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.NetSurfaceArea, localStorage.NoOfDecimalForInputOutput) : '',
    GrossWeight: WeightCalculatorRequest && WeightCalculatorRequest?.GrossWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.GrossWeight, localStorage.NoOfDecimalForInputOutput) : '',
    FinishWeightOfSheet: WeightCalculatorRequest && WeightCalculatorRequest?.FinishWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.FinishWeight, localStorage.NoOfDecimalForInputOutput) : '',
    cuttingAllowance: WeightCalculatorRequest && WeightCalculatorRequest?.CuttingAllowance !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.CuttingAllowance, localStorage.NoOfDecimalForInputOutput) : '',
    partLengthWithAllowance: WeightCalculatorRequest && WeightCalculatorRequest?.PartLengthWithAllowance !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.PartLengthWithAllowance, localStorage.NoOfDecimalForInputOutput) : '',
    endPieceAllowance: WeightCalculatorRequest && WeightCalculatorRequest?.EndPieceAllowance !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.EndPieceAllowance, localStorage.NoOfDecimalForInputOutput) : '',
    scrapWeight: WeightCalculatorRequest && WeightCalculatorRequest?.ScrapWeight !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.ScrapWeight, localStorage.NoOfDecimalForInputOutput) : '',
    scrapRecoveryPercent: WeightCalculatorRequest && WeightCalculatorRequest?.RecoveryPercentage !== undefined ? checkForDecimalAndNull(WeightCalculatorRequest.RecoveryPercentage, localStorage.NoOfDecimalForInputOutput) : '',
  }

  const {
    register, handleSubmit, control, setValue, getValues, formState: { errors }, } = useForm({
      mode: 'onChange',
      reValidateMode: 'onChange',
      defaultValues: defaultValues,
    })




  const [isOneSide, setIsOneSide] = useState(WeightCalculatorRequest && WeightCalculatorRequest.IsOneSide ? WeightCalculatorRequest.IsOneSide : false)
  const [UOMDimension, setUOMDimension] = useState(
    WeightCalculatorRequest && WeightCalculatorRequest.UOMForDimensionId !== 0
      ? {
        label: WeightCalculatorRequest.UOMForDimension,
        value: WeightCalculatorRequest.UOMForDimensionId,
      }
      : [],
  )
  const [dataToSend, setDataToSend] = useState({
    GrossWeight: WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== null ? WeightCalculatorRequest.GrossWeight : '',
    FinishWeight: WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== null ? convert(WeightCalculatorRequest.FinishWeight, WeightCalculatorRequest.UOMForDimension) : ''
  })
  const [isChangeApplies, setIsChangeApplied] = useState(true)
  const tempOldObj = WeightCalculatorRequest
  const [GrossWeight, setGrossWeights] = useState(WeightCalculatorRequest && WeightCalculatorRequest.GrossWeight !== null ? WeightCalculatorRequest.GrossWeight : '')
  const [FinishWeightOfSheet, setFinishWeights] = useState(WeightCalculatorRequest && WeightCalculatorRequest.FinishWeight !== null ? convert(WeightCalculatorRequest.FinishWeight, WeightCalculatorRequest.UOMForDimension) : '')
  const [isDisable, setIsDisable] = useState(false)
  const [scrapWeight, setScrapWeight] = useState(WeightCalculatorRequest && WeightCalculatorRequest.ScrapWeight !== null ? WeightCalculatorRequest.ScrapWeight : '')

  let fields = IsolateReRender(control)
  let fieldValues = {
    OuterDiameter: fields && fields[0],
    Thickness: fields && fields[1],
    SheetLength: fields && fields[2],
    PartLength: fields && fields[3],
    PartLengthWithAllowance: fields && fields[5],
  }

  const dispatch = useDispatch()

  const values = useWatch({
    control,
    name: ['scrapRecoveryPercent', 'cuttingAllowance', 'PartLength'],
  })

  useEffect(() => {
    if (!CostingViewMode) {
      calculateLengthOfPart()
    }
  }, [values])

  useEffect(() => {
    if (!CostingViewMode) {
      scrapWeightCalculation()
    }
  }, [values, GrossWeight, FinishWeightOfSheet])

  useEffect(() => {
    //UNIT TYPE ID OF DIMENSIONS
    dispatch(getUOMSelectList(res => {
      const Data = res.data.Data
      const kgObj = Data.find(el => el.Text === G)
      setTimeout(() => {
        setValue('UOMDimension', WeightCalculatorRequest && Object.keys(WeightCalculatorRequest).length !== 0
          ? {
            label: WeightCalculatorRequest.UOMForDimension,
            value: WeightCalculatorRequest.UOMForDimensionId,
          }
          : { label: kgObj.Display, value: kgObj.Value })
        setUOMDimension(WeightCalculatorRequest && Object.keys(WeightCalculatorRequest).length !== 0
          ? {
            label: WeightCalculatorRequest.UOMForDimension,
            value: WeightCalculatorRequest.UOMForDimensionId,
          }
          : { label: kgObj.Display, value: kgObj.Value })
      }, 100);

    }))
  }, [])

  const UOMSelectList = useSelector((state) => state.comman.UOMSelectList)

  useEffect(() => {
    if (!CostingViewMode) {
      calculateInnerDiameter()
      calculateNumberOfPartPerSheet()
      calculateLengthofScrap()
      calculateWeightOfSheet()
      calculateWeightOfPart()
      calculateWeightOfScrap()
      setGrossWeight()
    }
  }, [fieldValues])

  useEffect(() => {
    if (!CostingViewMode) {
      if (isOneSide) {
        setNetSurfaceAreaBothSide()
      } else {
        calculateNetSurfaceArea()
      }
    }
  }, [isOneSide, fieldValues])
  const setFinishWeight = (e) => {
    const FinishWeightOfSheet = e.target.value
    const grossWeight = checkForNull(getValues('GrossWeight'))
    if (e.target.value > grossWeight) {
      setTimeout(() => {
        setValue('FinishWeightOfSheet', '')
      }, 200);

      Toaster.warning(`${finishWeightLabel} weight should not be greater than gross weight`)
      return false
    }
    switch (UOMDimension.label) {
      case DISPLAY_G:
        setTimeout(() => {
          setFinishWeights(FinishWeightOfSheet)
        }, 200);
        break;
      case DISPLAY_KG:
        setTimeout(() => {
          setFinishWeights(FinishWeightOfSheet * 1000)
        }, 200);
        break;
      case DISPLAY_MG:
        setTimeout(() => {
          setFinishWeights(FinishWeightOfSheet / 1000)
        }, 200);
        break;
      default:
        break;
    }
  }

  useEffect(() => {
    if (Number(getValues('FinishWeightOfSheet')) < Number(getValues('GrossWeight'))) {
      delete errors.FinishWeightOfSheet
    }
  }, [getValues('GrossWeight'), fieldValues])

  /**
   * @method calculateInnerDiameter
   * @description CALCULATE INNER DIAMETER
   */
  const calculateInnerDiameter = () => {
    let ID = checkForNull(fieldValues.OuterDiameter) - 2 * checkForNull(fieldValues.Thickness);

    setValue('InnerDiameter', checkForDecimalAndNull(ID, localStorage.NoOfDecimalForInputOutput))
    const updatedValue = dataToSend
    updatedValue.InnerDiameter = ID
    setDataToSend(updatedValue)
  }

  /**
   * @method calculateNumberOfPartPerSheet
   * @description CALCULATE NUMBER OF PARTS PER SHEET
   */
  const calculateNumberOfPartPerSheet = () => {
    if (fieldValues.SheetLength === '') {
      setValue('NumberOfPartsPerSheet', 1)
      const updatedValue = dataToSend
      updatedValue.NumberOfPartsPerSheet = 1
      setDataToSend(updatedValue)
    } else {
      const EndPieceAllowance = Number(getValues('endPieceAllowance'))
      const PartLengthWithAllowance = Number(getValues('partLengthWithAllowance'))
      const NumberParts = checkForNull((fieldValues.SheetLength - EndPieceAllowance) / PartLengthWithAllowance)
      setValue('NumberOfPartsPerSheet', parseInt(NumberParts))
      const updatedValue = dataToSend
      updatedValue.NumberOfPartsPerSheet = parseInt(NumberParts)
      updatedValue.NumberOfPartsPerSheetWithDecimal = NumberParts
      setDataToSend(updatedValue)
    }
  }

  /**
   * @method calculateLengthofScrap
   * @description CALCULATE LENGTH OF SCRAP
   */
  const calculateLengthofScrap = () => {
    const updatedValue = dataToSend
    const remainder = updatedValue.NumberOfPartsPerSheetWithDecimal % 1
    updatedValue.ScrapLength = remainder
    setDataToSend(updatedValue)
    setValue('ScrapLength', checkForDecimalAndNull(remainder, localStorage.NoOfDecimalForInputOutput))
  }

  /**
   * @method calculateWeightOfSheet
   * @description CALCULATE WEIGHT OF SHEET
   */
  const calculateWeightOfSheet = () => {
    const data = {
      Density: props.rmRowData.Density / 1000,
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
      Density: props.rmRowData.Density / 1000,
      OuterDiameter: getValues('OuterDiameter'),
      InnerDiameter: dataToSend.InnerDiameter,
      PartLengthWithAllowance: getValues('partLengthWithAllowance'),
      ExtraVariable: '',
    }
    // const PartWeight = getWeightOfPart(data)
    const PartWeight = getWeightFromDensity(data.Density, data.InnerDiameter, data.OuterDiameter, data.PartLengthWithAllowance)
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
      Density: props.rmRowData.Density / 1000,
      OuterDiameter: getValues('OuterDiameter'),
      InnerDiameter: dataToSend.InnerDiameter,
      ScrapLength: dataToSend.ScrapLength,
      ExtraVariable: '',
    }
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
      PartLengthWithAllowance: getValues('partLengthWithAllowance'),
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
      PartLengthWithAllowance: getValues('partLengthWithAllowance'),
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
    let WeightofSheet
    let NumberOfPartsPerSheet
    let grossWeight
    const updatedValue = dataToSend
    if (rmRowData.RawMaterialCategory === STD) {
      grossWeight = checkForNull(dataToSend.WeightofPart + (dataToSend.WeightofScrap / dataToSend.NumberOfPartsPerSheet))
      setGrossWeights(grossWeight)
      updatedValue.GrossWeight = setValueAccToUOM(grossWeight, UOMDimension.label)
      updatedValue.newGrossWeight = setValueAccToUOM(grossWeight, UOMDimension.label)
      setDataToSend(updatedValue)
    } else {
      // WeightofPart = setValueAccToUOM(dataToSend.WeightofPart, UOMDimension.label)
      WeightofSheet = getValues('WeightofSheet')
      NumberOfPartsPerSheet = Number(getValues('NumberOfPartsPerSheet'))
      grossWeight = checkForNull(WeightofSheet / NumberOfPartsPerSheet)
      setGrossWeights(grossWeight)
      updatedValue.GrossWeight = setValueAccToUOM(grossWeight, UOMDimension.label)
      updatedValue.newGrossWeight = setValueAccToUOM(grossWeight, UOMDimension.label)
      setDataToSend(updatedValue)
    }
    setValue('GrossWeight', checkForDecimalAndNull(setValueAccToUOM(grossWeight, UOMDimension.label), localStorage.NoOfDecimalForInputOutput))
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
          temp.push({ label: item.Display, value: item.Value })
          return null
        })
      return temp
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
  const onSubmit = debounce(handleSubmit((values) => {
    setIsDisable(true)

    if (Number(getValues('InnerDiameter') < 0)) {
      Toaster.warning('Inner diameter cannot be negative')
      setIsDisable(false)
      return false
    }
    if (Number(getValues('NumberOfPartsPerSheet') < 0)) {
      Toaster.warning('Number of parts per sheet cannot be negative')
      setIsDisable(false)
      return false
    }
    if (WeightCalculatorRequest && WeightCalculatorRequest.WeightCalculationId !== "00000000-0000-0000-0000-000000000000") {
      if (tempOldObj.GrossWeight !== dataToSend.GrossWeight || tempOldObj.FinishWeight !== getValues('FinishWeightOfSheet') || tempOldObj.NetSurfaceArea !== dataToSend.NetSurfaceArea || tempOldObj.UOMForDimensionId !== UOMDimension.value) {
        setIsChangeApplied(true)
      } else {
        setIsChangeApplied(false)
      }
    }

    let grossWeight = (dataToSend.newGrossWeight === undefined || dataToSend.newGrossWeight === 0) ? dataToSend.GrossWeight : dataToSend.newGrossWeight

    let data = {
      LayoutType: 'Pipe',
      SheetMetalCalculationId: WeightCalculatorRequest && WeightCalculatorRequest.SheetMetalCalculationId ? WeightCalculatorRequest.SheetMetalCalculationId : "0",
      IsChangeApplied: isChangeApplies, //NEED TO MAKE IT DYNAMIC how to do,
      BaseCostingIdRef: item.CostingId,
      CostingRawMaterialDetailId: rmRowData.RawMaterialDetailId,
      RawMaterialIdRef: rmRowData.RawMaterialId,
      LoggedInUserId: loggedInUserId(),
      RawMaterialCost: grossWeight * rmRowData.RMRate - (grossWeight - getValues('FinishWeightOfSheet')) * calculatePercentage(getValues('scrapRecoveryPercent')) * rmRowData.ScrapRate,
      UOMForDimensionId: UOMDimension ? UOMDimension.value : '',
      UOMForDimension: UOMDimension ? UOMDimension.label : '',
      OuterDiameter: values.OuterDiameter,
      Thickness: values.Thickness,
      InnerDiameter: dataToSend.InnerDiameter,
      LengthOfSheet: values.SheetLength,
      LengthOfPart: values.PartLength,
      NumberOfPartsPerSheet: dataToSend.NumberOfPartsPerSheet,
      LengthOfScrap: dataToSend.ScrapLength,
      WeightOfSheetInUOM: dataToSend.WeightofSheet,
      WeightOfPartInUOM: dataToSend.WeightofPart,
      WeightOfScrapInUOM: dataToSend.WeightofScrap,
      // Side: isOneSide, why and where
      UOMId: rmRowData.UOMId,
      UOM: rmRowData.UOM,
      IsOneSide: isOneSide,
      // SurfaceAreaSide: isOneSide ? 'Both Side' : 'One  Side',
      NetSurfaceArea: dataToSend.NetSurfaceArea,
      GrossWeight: grossWeight,
      FinishWeight: getValues('FinishWeightOfSheet'),
      RecoveryPercentage: getValues('scrapRecoveryPercent'),
      ScrapWeight: getValues('scrapWeight'),
      CuttingAllowance: getValues('cuttingAllowance'),
      PartLengthWithAllowance: getValues('partLengthWithAllowance'),
      EndPieceAllowance: getValues('endPieceAllowance'),
    }

    dispatch(saveRawMaterialCalculationForSheetMetal(data, res => {
      setIsDisable(false)
      if (res.data.Result) {
        data.WeightCalculationId = res.data.Identity
        Toaster.success("Calculation saved successfully")
        props.toggleDrawer('', data)
      }
    }))
  }), 500)

  const handleUnit = (value) => {
    setValue('UOMDimension', { label: value.label, value: value.value })
    setUOMDimension(value)
    let grossWeight = GrossWeight
    let ScrapWeight = scrapWeight
    setDataToSend(prevState => ({ ...prevState, newGrossWeight: setValueAccToUOM(grossWeight, value.label), newFinishWeight: setValueAccToUOM(FinishWeightOfSheet, value.label) }))
    setValue('GrossWeight', checkForDecimalAndNull(setValueAccToUOM(grossWeight, value.label), localStorage.NoOfDecimalForInputOutput))
    setValue('FinishWeightOfSheet', checkForDecimalAndNull(setValueAccToUOM(FinishWeightOfSheet, value.label), localStorage.NoOfDecimalForInputOutput))
    setValue('scrapWeight', checkForDecimalAndNull(setValueAccToUOM(ScrapWeight, value.label), localStorage.NoOfDecimalForInputOutput))
  }

  const UnitFormat = () => {
    return <>Net Surface Area(mm<sup>2</sup>)</>
  }

  const handleKeyDown = function (e) {
    if (e.key === 'Enter' && e.shiftKey === false) {
      e.preventDefault();
    }
  };
  const scrapWeightCalculation = () => {
    const scrapRecoveryPercent = Number((getValues('scrapRecoveryPercent')))
    const grossWeight = Number(GrossWeight)
    const finishWeight = Number(FinishWeightOfSheet)
    const scrapWeight = calculateScrapWeight(grossWeight, finishWeight, scrapRecoveryPercent)
    setScrapWeight(checkForDecimalAndNull(scrapWeight, localStorage.NoOfDecimalForInputOutput))
    setValue('scrapWeight', checkForDecimalAndNull((setValueAccToUOM(scrapWeight, UOMDimension.label)), localStorage.NoOfDecimalForInputOutput))
  }
  const calculateLengthOfPart = () => {
    const LengthOfPart = Number(getValues('PartLength'))
    const CuttingAllowance = Number(getValues('cuttingAllowance'))
    const PartLengthWithAllowance = checkForNull(LengthOfPart + CuttingAllowance)
    setValue('partLengthWithAllowance', checkForDecimalAndNull(PartLengthWithAllowance, localStorage.NoOfDecimalForInputOutput))
  }
  /**
   * @method render
   * @description Renders the component
   */
  const tooltipMessageForSheetWeight = (value) => {
    return <div>Weight of {value} = (Density * (π / 4) * (Outer Diameter<sup>2</sup> - Inner Diameter<sup>2</sup>) * Length of {value} {value === 'Part' ? 'including allowance' : ''})/1000</div>
  }
  const surfaceaAreaTooltipMessage = <div>Net Surface Area =(π * Outer Diameter * Length of Part including allowance) + {isOneSide ? '(π * Inner Diameter * Length of Part including allowance) +' : ''} (π / 2 * (Outer Diameter<sup>2</sup> - Inner Diameter<sup>2</sup>))</div>
  const lengthOfScrapTooltipMessage = <div>Length of Scrap = Remainder of no. of parts/Sheet <br /> (No. of Parts/Sheet = {checkForDecimalAndNull(dataToSend.NumberOfPartsPerSheetWithDecimal, localStorage.NoOfDecimalForInputOutput)})</div>
  return (
    <>
      <div className="user-page p-0">
        <div>
          <form noValidate className="form"
            onKeyDown={(e) => { handleKeyDown(e, onSubmit.bind(this)); }}>
            <div className="costing-border border-top-0 px-4">
              <Row>
                <Col md="12" className={'mt25'}>
                  <HeaderTitle className="border-bottom"
                    title={'Sheet Specification'}
                    customClass={'underLine-title'}
                  />
                </Col>
              </Row>
              <Row className={''}>
                <Col md="3">
                  <TextFieldHookForm
                    label={`Outer Diameter(mm)`}
                    name={'OuterDiameter'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={true}
                    rules={{
                      required: true,
                      validate: { number, nonZero, checkWhiteSpaces, decimalAndNumberValidation },
                    }}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.OuterDiameter}
                    disabled={CostingViewMode ? true : false}
                  />
                </Col >
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
                      validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                    }}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.Thickness}
                    disabled={CostingViewMode ? true : false}
                  />
                </Col>
                <Col md="3">
                  <TooltipCustom disabledIcon={true} tooltipClass='inner-diameter' id={'inner-diameter'} tooltipText="Inner Diameter = Outer Diameter - (2 * Thickness)" />
                  <TextFieldHookForm
                    label={`Inner Diameter(mm)`}
                    name={'InnerDiameter'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    id={'inner-diameter'}
                    rules={{
                      required: false,
                    }}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.InnerDiameter}
                    disabled={true}
                  />
                </Col >
                <Col md="3">
                  <TextFieldHookForm
                    label={`Length of Sheet(mm)`}
                    name={'SheetLength'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    rules={{
                      required: false,
                      validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                    }}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.SheetLength}
                    disabled={CostingViewMode ? true : false}
                  />
                </Col >
                <Col md="3">
                  <TextFieldHookForm
                    label={`Length of Part(mm)`}
                    name={'PartLength'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={true}
                    rules={{
                      required: true,
                      validate: { number, nonZero, checkWhiteSpaces, decimalAndNumberValidation },
                    }}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.PartLength}
                    disabled={CostingViewMode ? true : false}
                  />
                </Col >
                <Col md="3">
                  <TextFieldHookForm
                    label={`Cutting Allowance`}
                    name={'cuttingAllowance'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    rules={{
                      required: false,
                      validate: { number, nonZero, checkWhiteSpaces, decimalAndNumberValidation },
                    }}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.cuttingAllowance}
                    disabled={CostingViewMode ? true : false}
                  />
                </Col >
                <Col md="3">
                  <TooltipCustom disabledIcon={true} tooltipClass='length-of-part' id={'length-of-part-with-allowance'} tooltipText="Length of Part including  allowance = (Length of Part + Cutting Allowance)" />
                  <TextFieldHookForm
                    label={`Length of Part including allowance(mm)`}
                    name={'partLengthWithAllowance'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    id={'length-of-part-with-allowance'}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder label-fit'}
                    errors={errors.partLengthWithAllowance}
                    disabled={true}
                  />
                </Col >
                <Col md="3">
                  <TextFieldHookForm
                    label={`End Piece Allowance (mm)`}
                    name={'endPieceAllowance'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    rules={{
                      required: false,
                      validate: { number, nonZero, checkWhiteSpaces, decimalAndNumberValidation },
                    }}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.endPieceAllowance}
                    disabled={CostingViewMode ? true : false}
                  />
                </Col >
                <Col md="3">
                  <TooltipCustom disabledIcon={true} tooltipClass='length-of-part' id={'length-of-part'} tooltipText="No. of Part/Sheet = ((Length(Sheet)-End Piece Allowance) / Length of Part including allowance)" />
                  <TextFieldHookForm
                    label="No. of Parts/Sheet"
                    name={'NumberOfPartsPerSheet'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    id={'length-of-part'}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.NumberOfPartsPerSheet}
                    disabled={true}
                  />
                </Col >
                <Col md="3">
                  <TooltipCustom disabledIcon={true} tooltipClass='length-of-scrap' id={'length-of-scrap'} tooltipText={lengthOfScrapTooltipMessage} />
                  <TextFieldHookForm
                    label={`Length of Scrap(mm)`}
                    name={'ScrapLength'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    id={'length-of-scrap'}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.ScrapLength}
                    disabled={true}
                  />
                </Col >
                <Col md="3">
                  <TooltipCustom disabledIcon={true} tooltipClass='weight-of-sheet' id={'weight-of-sheet'} tooltipText={tooltipMessageForSheetWeight('Sheet')} />
                  <TextFieldHookForm
                    label={`Weight of Sheet(g)`}
                    name={'WeightofSheet'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    id={'weight-of-sheet'}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.WeightofSheet}
                    disabled={true}
                  />
                </Col >
                <Col md="3">
                  <TooltipCustom disabledIcon={true} tooltipClass='weight-of-sheet' id={'weight-of-part'} tooltipText={tooltipMessageForSheetWeight('Part')} />
                  <TextFieldHookForm
                    label={`Weight of Part(g)`}
                    name={'WeightofPart'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    id={'weight-of-part'}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.WeightofPart}
                    disabled={true}
                  />
                </Col >
                <Col md="3">
                  <TooltipCustom disabledIcon={true} tooltipClass='weight-of-sheet' id={'weight-of-scrap'} tooltipText={tooltipMessageForSheetWeight('Scrap')} />
                  <TextFieldHookForm
                    label={`Weight of Scrap(g)`}
                    name={'WeightofScrap'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    id={'weight-of-scrap'}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.WeightofScrap}
                    disabled={true}
                  />
                </Col >
              </Row >

              <Row className={'mt-15'}>
                <Col md="12">
                  <HeaderTitle className="border-bottom"
                    title={'Surface Area'}
                    customClass={'underLine-title'}
                  />
                </Col>
              </Row>

              <Row className={''}>
                <Col md="4" className="switch">
                  <label className="switch-level">
                    <div className={'left-title'}>{'One Side'}</div>
                    <Switch
                      onChange={onSideToggle}
                      checked={isOneSide}
                      id="normal-switch"
                      disabled={CostingViewMode ? true : false}
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
                  <TooltipCustom disabledIcon={true} tooltipClass='weight-of-sheet' id={'surface-area'} tooltipText={surfaceaAreaTooltipMessage} />
                  <TextFieldHookForm
                    label={UnitFormat()}
                    name={'NetSurfaceArea'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    id={'surface-area'}
                    rules={{
                      required: false,
                    }}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.NetSurfaceArea}
                    disabled={true}
                  />
                </Col >
                <Col md="3">
                  <SearchableSelectHookForm
                    label={'Weight Unit'}
                    name={'UOMDimension'}
                    placeholder={'Select'}
                    Controller={Controller}
                    control={control}
                    rules={{ required: true }}
                    register={register}
                    defaultValue={UOMDimension.length !== 0 ? UOMDimension : ''}
                    options={renderListing('UOM')}
                    mandatory={true}
                    handleChange={handleUnit}
                    errors={errors.UOMDimension}
                    disabled={CostingViewMode ? true : false}
                  />

                </Col>
                <Col md="3">
                  <TooltipCustom disabledIcon={true} id={'gross-weight'} tooltipText={`${rmRowData?.RawMaterialCategory !== STD ? "Gross Weight = Weight of sheet / No. of Parts" : "Gross Weight = Weight of part + (Weight of scrap / No. of Parts)" }`} />
                  <TextFieldHookForm
                    label={`Gross Weight(${UOMDimension.label})`}
                    name={'GrossWeight'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    id={'gross-weight'}
                    rules={{
                      required: false,
                    }}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.GrossWeight}
                    disabled={true}
                  />
                </Col >
                <Col md="3">
                  <TextFieldHookForm
                    label={`${finishWeightLabel} Weight(${UOMDimension.label})`}
                    name={'FinishWeightOfSheet'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={true}
                    rules={{
                      required: true,
                      validate: { number, checkWhiteSpaces, decimalAndNumberValidation },
                      max: {
                        value: getValues('GrossWeight'),
                        message: `${finishWeightLabel} weight should not be greater than gross weight.`
                      },
                    }}
                    handleChange={setFinishWeight}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.FinishWeightOfSheet}
                    disabled={CostingViewMode ? true : false}
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
                  <TooltipCustom disabledIcon={true} id={'scrap-weight'} tooltipClass={'weight-of-sheet'} tooltipText={`Scrap Weight = (Gross Weight - ${finishWeightLabel} Weight )* Scrap Recovery (%)/100`} />
                  <TextFieldHookForm
                    label={`Scrap Weight(${UOMDimension.label})`}
                    name={'scrapWeight'}
                    Controller={Controller}
                    control={control}
                    register={register}
                    id={'scrap-weight'}
                    mandatory={false}
                    handleChange={() => { }}
                    defaultValue={''}
                    className=""
                    customClassName={'withBorder'}
                    errors={errors.scrapWeight}
                    disabled={true}
                  />
                </Col>
              </Row >
            </div >

            {!CostingViewMode &&
              <div className="col-sm-12 text-right px-0 mt-4">
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
              </div>
            }

          </form >
        </div >
      </div >
    </>
  )
}

export default Pipe
