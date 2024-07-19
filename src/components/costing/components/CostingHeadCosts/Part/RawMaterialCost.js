import React, { useState, useContext, useEffect, useCallback, } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Col, Row, Table } from 'reactstrap'
import AddRM from '../../Drawers/AddRM'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import NoContentFound from '../../../../common/NoContentFound'
import { useDispatch, useSelector } from 'react-redux'
import { CRMHeads, EMPTY_DATA } from '../../../../../config/constants'
import { TextFieldHookForm, TextAreaHookForm, SearchableSelectHookForm } from '../../../../layout/HookFormInputs'
import Toaster from '../../../../common/Toaster'
import { calculateNetLandedCost, calculatePercentage, calculatePercentageValue, checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected, corrugatedBoxPermission, getConfigurationKey, isRMDivisorApplicable } from '../../../../../helper'
import OpenWeightCalculator from '../../WeightCalculatorDrawer'
import { getRawMaterialCalculationForCorrugatedBox, getRawMaterialCalculationForDieCasting, getRawMaterialCalculationForFerrous, getRawMaterialCalculationForForging, getRawMaterialCalculationForMachining, getRawMaterialCalculationForMonoCartonCorrugatedBox, getRawMaterialCalculationForPlastic, getRawMaterialCalculationForRubber, getRawMaterialCalculationForSheetMetal, } from '../../../actions/CostWorking'
import { IsNFR, ViewCostingContext } from '../../CostingDetails'
import { DISPLAY_G, DISPLAY_KG, DISPLAY_MG } from '../../../../../config/constants'
import TooltipCustom from '../../../../common/Tooltip'
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { setFerrousCalculatorReset } from '../../../actions/CostWorking'
import { gridDataAdded, isDataChange, setMasterBatchObj, setRMCCErrors, setRMCutOff } from '../../../actions/Costing'
import { getTechnology, technologyForDensity, STRINGMAXLENGTH, REMARKMAXLENGTH, WIREFORMING, ELECTRICAL_STAMPING, } from '../../../../../config/masterData'
import PopupMsgWrapper from '../../../../common/PopupMsgWrapper';
import { SHEETMETAL, RUBBER, FORGING, DIE_CASTING, PLASTIC, CORRUGATEDBOX, Ferrous_Casting, MACHINING } from '../../../../../config/masterData'
import _, { debounce } from 'lodash'
import { number, checkWhiteSpaces, hashValidation, percentageLimitValidation, decimalNumberLimit6, percentageOfNumber } from "../../../../../helper/validation";
import Button from '../../../../layout/Button'
import TourWrapper from '../../../../common/Tour/TourWrapper'
import { Steps } from '../../TourMessages'
import { useTranslation } from 'react-i18next'
import { getRMFromNFR } from '../../../../masters/nfr/actions/nfr'

let counter = 0;
let timerId = 0
function RawMaterialCost(props) {
  const { item } = props;
  const IsLocked = (item.IsLocked ? item.IsLocked : false) || (item.IsPartLocked ? item.IsPartLocked : false)
  const { register, handleSubmit, control, setValue, getValues, formState: { errors }, reset } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      MBName: item?.CostingPartDetails?.MasterBatchRMName,
      MBPrice: item?.CostingPartDetails?.MasterBatchRMPrice,
      MBPercentage: item?.CostingPartDetails?.MasterBatchPercentage,
      RMTotal: checkForDecimalAndNull(item?.CostingPartDetails?.MasterBatchTotal, getConfigurationKey().NoOfDecimalForPrice),
      MBId: item?.CostingPartDetails?.MasterBatchRMId,

    }
  })
  const { t } = useTranslation("Costing")
  const rmGridFields = 'rmGridFields';
  const costData = useContext(costingInfoContext)
  const CostingViewMode = useContext(ViewCostingContext);
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [editIndex, setEditIndex] = useState(false)
  const [isWeightDrawerOpen, setWeightDrawerOpen] = useState(false)
  const [inputDiameter, setInputDiameter] = useState('')
  const [gridLength, setGridLength] = useState(0)
  const [gridData, setGridData] = useState(props.data)
  const [IsApplyMasterBatch, setIsApplyMasterBatch] = useState(item?.CostingPartDetails?.IsApplyMasterBatch ? true : false)
  const [Ids, setIds] = useState([])
  const [editCalculation, setEditCalculation] = useState(true)
  const [confirmPopup, setConfirmPopup] = useState(false)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { CostingEffectiveDate, ErrorObjRMCC } = useSelector(state => state.costing)
  const [showPopup, setShowPopup] = useState(false)
  const [showPopupDelete, setShowPopupDelete] = useState(false)
  const [masterBatch, setMasterBatch] = useState(false)
  const [remarkError, setRemarkError] = useState(true)
  const [forgingInfoIcon, setForgingInfoIcon] = useState({})
  const [rmNameList, setRMNameList] = useState([])
  const [inputValue, setInputValue] = useState('');
  const [deleteIndex, setDeleteIndex] = useState('');
  const [calculatorTypeStore, setCalculatorTypeStore] = useState(costData.TechnologyId === CORRUGATEDBOX ? item?.CostingPartDetails?.CalculatorType : '')
  const [isMultiCalculatorData, setIsMultiCalculatorData] = useState(false);
  const [headerPinned, setHeaderPinned] = useState(true)
  const [tourState, setTourState] = useState({
    steps: []
  })
  const [machiningCalculatorLayoutType, setMachiningCalculatorLayoutType] = useState('')
  const [dataFromAPI, setDataFromAPI] = useState([
    {
      RMName: 'NFRCARM84',
      RMCode: 'NFRCARM84',
      GrossWeight: 4,
      NetWeight: 3,        // FINISH WEIGHT
    }, {
      RMName: 'RM 2',
      RMCode: 'RM 2',
      GrossWeight: 5,
      NetWeight: 4,        // FINISH WEIGHT
    }, {
      RMName: 'NFRCARM89',
      RMCode: 'NFRCARM89',
      GrossWeight: 8,
      NetWeight: 3,        // FINISH WEIGHT
    }, {
      RMName: 'RM 4',
      RMCode: 'RM 4',
      GrossWeight: 7,
      NetWeight: 2,        // FINISH WEIGHT
    },
  ])
  const [isScrapRateUOMApplied, setIsScrapRateUOMApplied] = useState(false)
  const [dataInNFRAPI, setDataInNFRAPI] = useState(false)

  const { ferrousCalculatorReset } = useSelector(state => state.costWorking)
  const RMDivisor = (item?.CostingPartDetails?.RMDivisor !== null) ? item?.CostingPartDetails?.RMDivisor : 0;
  const isScrapRecoveryPercentageApplied = item?.IsScrapRecoveryPercentageApplied
  const isNFR = useContext(IsNFR);
  const { nfrDetailsForDiscount } = useSelector(state => state.costing)

  const dispatch = useDispatch()

  useEffect(() => {

    let temp = {}
    gridData && gridData.map((item, index) => {
      if (item.RawMaterialCalculatorId === null && item.GrossWeight !== null) {
        temp[index] = true
      }
      return null
    })
    setForgingInfoIcon(temp)
    if (isNFR) {
      let obj = {
        nfrId: nfrDetailsForDiscount?.objectFordisc?.NfrMasterId,
        partId: costData?.PartId,
        vendorId: costData?.VendorId,
        plantId: costData?.DestinationPlantId,
        costingId: item.CostingId,
        effectiveDate: CostingEffectiveDate,
        technologyId: costData?.TechnologyId
      }
      dispatch(getRMFromNFR(obj, (res) => {
        if (res?.data?.Result && res?.status === 200) {
          let data = res?.data?.DataList
          if (data?.length > 0) {
            setDataInNFRAPI(true)
            let tempList = data && data?.map(item => {
              let obj = { ...item }
              let scrapWeight = item.GrossWeight - item.FinishWeight
              obj.RMRate = (obj.EntryType === 'Domestic') ? obj.NetLandedCost : obj.NetLandedCostConversion
              obj.RMName = `${obj.RawMaterial} - ${obj.RMGrade}`
              obj.NetLandedCost = calculateNetLandedCost(item.BasicRatePerUOM, item.GrossWeight, scrapWeight, item.ScrapRate)
              // obj.FinishWeight = obj.FinishWeight
              obj.ScrapWeight = scrapWeight
              obj.dataFromNFRAPI = true
              return obj
            })
            setGridData(tempList)
          } else {
            setDataInNFRAPI(false)
          }
        }
      }))
    }
    switch (costData.TechnologyId) {
      case SHEETMETAL:
        return setGridLength(0)
      case PLASTIC:
        return setGridLength(0)
      case Ferrous_Casting:
      case RUBBER:
      case CORRUGATEDBOX:
        if (props.data && props.data[0]?.RawMaterialCalculatorId) {
          setIsMultiCalculatorData(true)
          let arr = [...gridData]
          arr[0].WeightCalculationId = arr[0].RawMaterialCalculatorId
          setGridData(arr)
        } else {
          setIsMultiCalculatorData(false)
        }
        return setGridLength(3)
      case FORGING:
        return setGridLength(0)
      default:
        return setGridLength(0)
    }
  }, [])


  useEffect(() => {
    setRMNameList(_.map(dataFromAPI, 'RMName'))
  }, [dataFromAPI])

  useEffect(() => {
    setTimeout(() => {
      const Params = {
        index: props.index,
        BOMLevel: props.item.BOMLevel,
        PartNumber: props.item.PartNumber,
      }

      if (!CostingViewMode && gridData) {
        gridData && gridData.map(item => {
          if (item.ScrapRecoveryPercentage !== 0) {
            item.IsScrapRecoveryPercentageApplied = true
          }
        })
      }
      if (!CostingViewMode && !IsLocked) {

        if (gridData && (costData.TechnologyName === 'Rubber' || costData.TechnologyName === 'Ferrous Casting') && !isMultiCalculatorData) {
          item.CostingPartDetails.RawMaterialCalculatorId = 0
        }

        props.setRMCost(gridData, Params, item)
        if (JSON.stringify(gridData) !== JSON.stringify(props.data)) {
          dispatch(isDataChange(true))
        }
      }
      selectedIds(gridData)
      // BELOW CODE IS USED TO SET CUTOFFRMC IN REDUCER TO GET VALUE IN O&P TAB.
      if (gridData && gridData?.length > 0) {
        let isCutOffApplicableCount = 0
        let totalCutOff = 0
        let isScrapRateUOMApplied = false
        gridData && gridData.map(item => {
          if (item.IsCutOffApplicable) {
            isCutOffApplicableCount = isCutOffApplicableCount + 1
            totalCutOff = totalCutOff + checkForNull(item.CutOffRMC)
          }
          else {
            totalCutOff = totalCutOff + checkForNull(item.NetLandedCost)
          }
          if (item?.UOM === "Meter" && item?.IsScrapUOMApply) {
            isScrapRateUOMApplied = true
          }
          return null
        })
        if (isScrapRateUOMApplied === true) {
          setIsScrapRateUOMApplied(true)
        } else {
          setIsScrapRateUOMApplied(false)
        }
        dispatch(setRMCutOff({ IsCutOffApplicable: isCutOffApplicableCount > 0 ? true : false, CutOffRMC: totalCutOff }))
      }
    }, 500)
  }, [gridData]);

  /**
   * @method DrawerToggle
   * @description TOGGLE DRAWER
   */
  const DrawerToggle = () => {
    if (CheckIsCostingDateSelected(CostingEffectiveDate)) return false;

    if ((Object.keys(gridData).length > 0 && gridData[0].WeightCalculationId !== null && isMultiCalculatorData && (Number(costData?.TechnologyId) === Number(Ferrous_Casting) || Number(costData?.TechnologyId) === Number(RUBBER) || Number(costData?.TechnologyId) === Number(CORRUGATEDBOX)))) {
      setShowPopup(true)
      setDrawerOpen(false)
    }
    else {
      setDrawerOpen(true)
      setShowPopup(false)
    }
  }

  /**
   * @method closeDrawer
   * @description HIDE RM DRAWER
   */
  const closeDrawer = (e = '', rowData = {}) => {
    if (Object.keys(rowData).length > 0 && IsApplyMasterBatch === false) {
      let tempArray = []
      if (item?.IsMultipleRMApplied) {
        let rowArray = rowData && rowData.map(el => {
          return {
            RMName: `${el.RawMaterial} - ${el.RMGrade}`,
            RMRate: (el.EntryType === 'Domestic') ? el.NetLandedCost : el.NetLandedCostConversion,
            MaterialType: el.MaterialType,
            RMGrade: el.RMGrade,
            Density: el.Density,
            UOM: el.UOM,
            UOMId: el.UOMId,
            ScrapRate: el.ScrapRate,
            FinishWeight: '',
            GrossWeight: '',
            NetLandedCost: '',
            RawMaterialId: el.RawMaterialId,
            RawMaterialCategory: el.Category,
            CutOffPrice: el.CutOffPrice,
            IsCutOffApplicable: el.IsCutOffApplicable,
            MachiningScrapRate: el.MachiningScrapRate,
            ScrapRatePerScrapUOMConversion: el.ScrapRatePerScrapUOMConversion,
            ScrapRatePerScrapUOM: el.ScrapRatePerScrapUOM,
            IsScrapUOMApply: el.IsScrapUOMApply,
            ScrapUnitOfMeasurement: el.ScrapUnitOfMeasurement,
            Currency: el.Currency,
            UOMSymbol: el.UOMSymbol,
          }
        })

        setGridData([...gridData, ...rowArray])
        tempArray = [...gridData, ...rowArray]
        selectedIds([...gridData, ...rowArray])
      } else {
        let tempObj = {
          RMName: `${rowData.RawMaterial} - ${rowData.RMGrade}`,
          RMRate: (rowData.EntryType === 'Domestic') ? rowData.NetLandedCost : rowData.NetLandedCostConversion,
          MaterialType: rowData.MaterialType,
          RMGrade: rowData.RMGrade,
          Density: rowData.Density,
          UOM: rowData.UOM,
          UOMId: rowData.UOMId,
          ScrapRate: rowData.ScrapRate,
          FinishWeight: '',
          GrossWeight: '',
          NetLandedCost: '',
          RawMaterialId: rowData.RawMaterialId,
          RawMaterialCategory: rowData.Category,
          CutOffPrice: rowData.CutOffPrice,
          IsCutOffApplicable: rowData.IsCutOffApplicable,
          MachiningScrapRate: rowData.MachiningScrapRate,
          IsScrapUOMApply: rowData.IsScrapUOMApply,
          ScrapUnitOfMeasurement: rowData.ScrapUnitOfMeasurement,
          ScrapRatePerScrapUOM: rowData.ScrapRatePerScrapUOM,
          ScrapRatePerScrapUOMConversion: rowData.ScrapRatePerScrapUOMConversion,
          Currency: rowData.Currency,
          UOMSymbol: rowData.UOMSymbol,
          ScrapRecoveryPercentage: 100
        }
        setGridData([...gridData, tempObj])
        tempArray = [...gridData, tempObj]
      }
      dispatch(gridDataAdded(true))
      if (!confirmPopup) {
        tempArray && tempArray.map((item, index) => {
          setValue(`${rmGridFields}.${index}.GrossWeight`, checkForDecimalAndNull(item.GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput))     //COMMENT
          setValue(`${rmGridFields}.${index}.FinishWeight`, checkForDecimalAndNull(item.FinishWeight, getConfigurationKey().NoOfDecimalForInputOutput))
          setValue(`${rmGridFields}.${index}.ScrapRecoveryPercentage`, checkForDecimalAndNull(item.ScrapRecoveryPercentage, getConfigurationKey().NoOfDecimalForInputOutput))
          setValue(`${rmGridFields}.${index}.BurningLossWeight`, checkForDecimalAndNull(item.BurningValue, getConfigurationKey().NoOfDecimalForInputOutput))
          setValue(`${rmGridFields}.${index}.ScrapWeight`, checkForDecimalAndNull(item.ScrapWeight, getConfigurationKey().NoOfDecimalForInputOutput))
          return null
        })
      }
    }

    if (rowData && rowData.length > 0 && IsApplyMasterBatch) {
      let value = rowData && (rowData[0].EntryType === 'Domestic') ? rowData[0].NetLandedCost : rowData[0].NetLandedCostConversion
      setValue('MBName', rowData && rowData[0].RawMaterial !== undefined ? rowData[0].RawMaterial : '')
      setValue('MBId', rowData && rowData[0].RawMaterialId !== undefined ? rowData[0].RawMaterialId : '')
      setValue('MBPrice', value)
      let calculatedPercentage = percentageOfNumber(value, checkForNull(getValues("MBPercentage")))
      setValue('RMTotal', checkForDecimalAndNull(calculatedPercentage, initialConfiguration.NoOfDecimalForPrice))
    }
    setDrawerOpen(false)
  }
  const setCalculatorData = (res, index, calculatorType = '') => {
    let tempArr = []
    let tempData = gridData[index]
    const data = res && res.data && res.data.Data ? res.data.Data : {}
    tempData = { ...tempData, CalculatorType: Number(costData?.TechnologyId) === CORRUGATEDBOX ? calculatorType : {}, WeightCalculatorRequest: ferrousCalculatorReset === true ? {} : data }
    tempArr = Object.assign([...gridData], { [index]: tempData })
    setTimeout(() => {
      setGridData(tempArr)
      setWeightDrawerOpen(true)
    }, 100)
  }
  /**
   * @method toggleWeightCalculator
   * @description TOGGLE WEIGHT CALCULATOR DRAWER
   */
  const toggleWeightCalculator = debounce((index, calculatorType = '') => {
    setEditIndex(index)
    let tempData = gridData[index]
    if (technologyForDensity.includes(costData?.TechnologyId)) {
      if ((tempData.Density === undefined && tempData.Density === null && tempData.Density === "") || Number(tempData.Density) === 0) {
        Toaster.warning("This Material's density is not available for weight calculation. Please add density for this material in RM Master > Manage Material.")
        return false
      }
    }

    switch ((Number(costData?.TechnologyId))) {
      case SHEETMETAL:
      case WIREFORMING:
        dispatch(getRawMaterialCalculationForSheetMetal(item.CostingId, tempData.RawMaterialId, tempData.RawMaterialCalculatorId, res => {
          setCalculatorData(res, index)
        }))
        break;
      case FORGING:
        dispatch(getRawMaterialCalculationForForging(item.CostingId, tempData.RawMaterialId, tempData.RawMaterialCalculatorId, res => {
          setCalculatorData(res, index)
        }))
        break;
      case Ferrous_Casting:
        dispatch(getRawMaterialCalculationForFerrous(item.CostingId, tempData.RawMaterialId, gridData[0].WeightCalculationId ? gridData[0].WeightCalculationId : tempData.RawMaterialCalculatorId, res => {
          setCalculatorData(res, index)
        }))
        break;
      case PLASTIC:
        dispatch(getRawMaterialCalculationForPlastic(item.CostingId, tempData.RawMaterialId, tempData.RawMaterialCalculatorId, res => {
          setCalculatorData(res, index)
        }))
        break;
      case CORRUGATEDBOX:
        if (calculatorType === 'CorrugatedAndMonoCartonBox') {
          setCalculatorTypeStore(calculatorType)
          dispatch(getRawMaterialCalculationForMonoCartonCorrugatedBox(item.CostingId, tempData.RawMaterialId, tempData.RawMaterialCalculatorId, res => {
            setCalculatorData(res, index, 'CorrugatedAndMonoCartonBox')

          }))
        } else {
          dispatch(getRawMaterialCalculationForCorrugatedBox(item.CostingId, tempData.RawMaterialId, tempData.RawMaterialCalculatorId, res => {
            setCalculatorData(res, index)
          }))
        }
        break;
      case DIE_CASTING:
        dispatch(getRawMaterialCalculationForDieCasting(item.CostingId, tempData.RawMaterialId, tempData.RawMaterialCalculatorId, res => {
          setCalculatorData(res, index)
        }))
        break;
      case RUBBER:
        dispatch(getRawMaterialCalculationForRubber(item.CostingId, tempData.RawMaterialId, tempData.RawMaterialCalculatorId, res => {
          setCalculatorData(res, index)
        }))
        break;
      case MACHINING:
        let layoutType = tempData.LayoutType ? tempData.LayoutType : machiningCalculatorLayoutType ?? ''
        if (layoutType === 'Bar') {
          dispatch(getRawMaterialCalculationForSheetMetal(item.CostingId, tempData.RawMaterialId, tempData.RawMaterialCalculatorId, res => {
            setCalculatorData(res, index)
          }))
        } else {
          dispatch(getRawMaterialCalculationForMachining(item.CostingId, tempData.RawMaterialId, tempData.RawMaterialCalculatorId, res => {
            setCalculatorData(res, index)
          }))
        }
        break;
      case ELECTRICAL_STAMPING:
        dispatch(getRawMaterialCalculationForPlastic(item.CostingId, tempData.RawMaterialId, tempData.RawMaterialCalculatorId, res => {
          setCalculatorData(res, index)
        }))
        break;
      default:
        return "none";
    }
  }, 500)

  /**
   * @method closeWeightDrawer
   * @description HIDE WEIGHT CALCULATOR DRAWER
   */
  const closeWeightDrawer = (e = '', weightData = {}, originalWeight = {}) => {

    setCalculatorTypeStore(e)
    dispatch(setFerrousCalculatorReset(false))

    if (String(e) === String('rubber') || String(e) === String('ferrous') || String(e) === String('CorrugatedBox') || String(e) === String('CorrugatedAndMonoCartonBox')) {
      setIsMultiCalculatorData(true)
    }
    if (Number(costData?.TechnologyId) === MACHINING) {
      setMachiningCalculatorLayoutType(weightData?.LayoutType)
    }
    setInputDiameter(weightData?.Diameter)
    setWeight(weightData, originalWeight)

    setWeightDrawerOpen(false)
    if (Object.keys(weightData).length > 0) setForgingInfoIcon({ ...forgingInfoIcon, [editIndex]: false })

  }

  const checkCutOffNegative = (value, index) => {
    if (value < 0) {
      setTimeout(() => {
        setValue(`${rmGridFields}.${index}.GrossWeight`, '')
        setValue(`${rmGridFields}.${index}.FinishWeight`, '')
        setValue(`${rmGridFields}.${index}.ScrapRecoveryPercentage`, 100)

      }, 300);
      let tempArr = []
      let tempData = gridData[index]
      tempData = {
        ...tempData,
        GrossWeight: 0,
        FinishWeight: 0,
        NetLandedCost: 0,
        WeightCalculatorRequest: {},
        WeightCalculationId: "00000000-0000-0000-0000-000000000000",
        IsCalculatedEntry: false,
        CutOffRMC: 0,
        ScrapWeight: 0,
        ScrapRecoveryPercentage: 0
      }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setTimeout(() => {
        setGridData(tempArr)
      }, 100);
      Toaster.warning('Scrap weight is larger than Cut Off price')
      return false
    }

  }

  const removeErrorGrossFinishWeight = (grossValue, finishWeight, index) => {
    if (checkForNull(grossValue) > checkForNull(finishWeight) && errors?.rmGridFields) {
      delete errors?.rmGridFields[index]?.FinishWeight
      delete errors?.rmGridFields[index]?.GrossWeight
    }
  }

  /**
   * @method handleGrossWeightChange
   * @description HANDLE GROSS WEIGHT CHANGE
   */
  const handleGrossWeightChange = (event, index) => {
    clearTimeout(timerId);
    setForgingInfoIcon({ ...forgingInfoIcon, [index]: true })
    let tempArr = []
    let tempData = gridData[index]
    setEditCalculation(false)
    let grossValue = event

    if (checkForNull(grossValue) >= 0) {

      const GrossWeight = checkForNull(grossValue)
      const FinishWeight = tempData.FinishWeight !== undefined ? tempData.FinishWeight : 0
      let scrapWeight = checkForNull(GrossWeight - FinishWeight);

      // Recovered scrap weight calculate
      let recoveredScrapWeight;
      if (isScrapRecoveryPercentageApplied) {
        const ScrapRecoveryPercentage = checkForNull(tempData.ScrapRecoveryPercentage);
        recoveredScrapWeight = scrapWeight * calculatePercentage(ScrapRecoveryPercentage);
        scrapWeight = recoveredScrapWeight
      }

      // const ApplicableFinishWeight = (checkForNull(tempData.FinishWeight) !== 0) ? scrapWeight * tempData.ScrapRate : 0;
      const ScrapCost = (checkForNull(tempData.FinishWeight) !== 0) ? scrapWeight * tempData.ScrapRate : 0;
      const NetLandedCost = (GrossWeight * tempData.RMRate) - ScrapCost;
      const CutOffRMC = tempData.IsCutOffApplicable ? (GrossWeight * checkForNull(tempData.CutOffPrice)) - ScrapCost : 0;
      if (tempData.IsCutOffApplicable && checkCutOffNegative(CutOffRMC, index)) {
        return false
      }

      tempData = {
        ...tempData,
        GrossWeight: GrossWeight ? GrossWeight : 0,
        NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost,
        WeightCalculatorRequest: {},
        WeightCalculationId: "00000000-0000-0000-0000-000000000000",
        IsCalculatedEntry: false,
        RawMaterialCalculatorId: null,
        CutOffRMC: CutOffRMC,
        ScrapWeight: scrapWeight
      }
      tempArr = Object.assign([...gridData], { [index]: tempData })

      if (IsApplyMasterBatch) {
        const scrapWeight = checkForNull(GrossWeight - FinishWeight);
        const RMRate = calculatePercentageValue(tempData.RMRate, (100 - getValues('MBPercentage')));
        const RMRatePlusMasterBatch = (RMRate + checkForNull(getValues('RMTotal'))) * GrossWeight;
        const ScrapRate = (tempData.ScrapRate * scrapWeight)
        const NetLandedCost = isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull((RMRatePlusMasterBatch - ScrapRate) / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : (RMRatePlusMasterBatch - ScrapRate);

        tempData = {
          ...tempData,
          GrossWeight: GrossWeight ? GrossWeight : 0,
          NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost,
          WeightCalculatorRequest: {},
          WeightCalculationId: "00000000-0000-0000-0000-000000000000",
          IsCalculatedEntry: false,
          CutOffRMC: CutOffRMC,
          ScrapWeight: scrapWeight
        }
        tempArr = Object.assign([...gridData], { [index]: tempData })
      }
      dispatch(setRMCutOff({ IsCutOffApplicable: tempData.IsCutOffApplicable, CutOffRMC: CutOffRMC }))
      setGridData(tempArr)
      removeErrorGrossFinishWeight(grossValue, FinishWeight, index)
    }
    for (let i = 0; i < gridData.length; i++) {
      if (forgingInfoIcon[i] === undefined) {
        forgingInfoIcon[i] = false
      }
    }
    forgingInfoIcon[index] = true
    setForgingInfoIcon(forgingInfoIcon)
  }

  useEffect((item) => {
    if (inputValue !== '') {
      const delay = 700; // Delay of 500 milliseconds
      const timer = setTimeout(() => {
        let index = inputValue?.index
        let event = inputValue?.event
        let tempArr = []
        let tempData = gridData[index]
        setEditCalculation(false)
        setForgingInfoIcon({ ...forgingInfoIcon, [index]: true })
        let finishValue = event

        let FinishWeight = checkForNull(finishValue);
        const GrossWeight = tempData?.GrossWeight !== undefined ? checkForNull(tempData?.GrossWeight) : 0;

        if (IsFinishWeightValid(GrossWeight, FinishWeight)) {

          let scrapWeight = checkForNull(GrossWeight - FinishWeight);
          // Recovered scrap weight calculate
          let recoveredScrapWeight;
          if (isScrapRecoveryPercentageApplied && tempData?.ScrapRecoveryPercentage !== undefined && tempData?.ScrapRecoveryPercentage !== 0) {
            const ScrapRecoveryPercentage = checkForNull(tempData?.ScrapRecoveryPercentage);
            recoveredScrapWeight = scrapWeight * calculatePercentage(ScrapRecoveryPercentage);
            scrapWeight = recoveredScrapWeight
          }

          // ternary condition
          const ScrapCost = FinishWeight !== 0 ? scrapWeight * checkForNull(tempData?.ScrapRate) : 0;
          const CutOffRMC = tempData?.IsCutOffApplicable ? ((GrossWeight * checkForNull(tempData?.CutOffPrice)) - ScrapCost) : 0;
          if (tempData?.IsCutOffApplicable && checkCutOffNegative(CutOffRMC, index)) {
            return false
          }
          const NetLandedCost = (GrossWeight * tempData?.RMRate) - ScrapCost;
          tempData = {
            ...tempData,
            FinishWeight: FinishWeight ? FinishWeight : 0,
            NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost,
            WeightCalculatorRequest: {},
            WeightCalculationId: "00000000-0000-0000-0000-000000000000",
            IsCalculatedEntry: false,
            CutOffRMC: CutOffRMC,
            ScrapWeight: scrapWeight,
          }
          tempArr = Object.assign([...gridData], { [index]: tempData })

          if (IsApplyMasterBatch) {

            const RMRate = calculatePercentageValue(tempData?.RMRate, (100 - getValues('MBPercentage')));
            const RMRatePlusMasterBatch = (RMRate + checkForNull(getValues('RMTotal'))) * GrossWeight;
            const ScrapRate = (tempData?.ScrapRate * scrapWeight)
            const NetLandedCost = RMRatePlusMasterBatch - ScrapRate;

            tempData = {
              ...tempData,
              GrossWeight: GrossWeight ? GrossWeight : 0,
              NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost,
              WeightCalculatorRequest: {},
              WeightCalculationId: "00000000-0000-0000-0000-000000000000",
              IsCalculatedEntry: false,
              CutOffRMC: CutOffRMC,
              ScrapWeight: scrapWeight,
            }
            tempArr = Object.assign([...gridData], { [index]: tempData })
          }
          dispatch(setRMCutOff({ IsCutOffApplicable: tempData?.IsCutOffApplicable, CutOffRMC: CutOffRMC }))
          setGridData(tempArr)
        }
        for (let i = 0; i < gridData.length; i++) {
          if (forgingInfoIcon[i] === undefined) {
            forgingInfoIcon[i] = false
          }
        }
        forgingInfoIcon[index] = true
        setForgingInfoIcon(forgingInfoIcon)
      }, delay);
      return () => {
        clearTimeout(timer);
      };
    }
  }, [inputValue])

  const handleFinishWeightChange = (event, index) => {
    let grossWeight = gridData[index]?.GrossWeight
    removeErrorGrossFinishWeight(grossWeight, event, index)
    setInputValue({ event: event, index: index })
    let tempArr = []
    let tempData = gridData[index]
    // setEditCalculation(false)
    let finishValue = event

    if (checkForNull(finishValue) >= 0) {

      // if (IsFinishWeightValid(finishValue, tempData.FinishWeight)) {
      const GrossWeight = tempData.GrossWeight !== undefined ? tempData.GrossWeight : 0
      const FinishWeight = checkForNull(finishValue)
      let scrapWeight = checkForNull(GrossWeight - FinishWeight);

      // Recovered scrap weight calculate
      let recoveredScrapWeight;
      if (isScrapRecoveryPercentageApplied) {
        const ScrapRecoveryPercentage = checkForNull(tempData.ScrapRecoveryPercentage);
        recoveredScrapWeight = scrapWeight * calculatePercentage(ScrapRecoveryPercentage);
        scrapWeight = recoveredScrapWeight
      }

      // const ApplicableFinishWeight = (checkForNull(tempData.FinishWeight) !== 0) ? scrapWeight * tempData.ScrapRate : 0;
      const ScrapCost = (checkForNull(tempData.FinishWeight) !== 0) ? scrapWeight * tempData.ScrapRate : 0;
      const NetLandedCost = (GrossWeight * tempData.RMRate) - ScrapCost;
      const CutOffRMC = tempData.IsCutOffApplicable ? (GrossWeight * checkForNull(tempData.CutOffPrice)) - ScrapCost : 0;
      if (tempData.IsCutOffApplicable && checkCutOffNegative(CutOffRMC, index)) {
        return false
      }

      tempData = {
        ...tempData,
        GrossWeight: GrossWeight ? GrossWeight : 0,
        FinishWeight: FinishWeight ? FinishWeight : 0,
        NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost,
        WeightCalculatorRequest: {},
        WeightCalculationId: "00000000-0000-0000-0000-000000000000",
        IsCalculatedEntry: false,
        RawMaterialCalculatorId: null,
        CutOffRMC: CutOffRMC,
        ScrapWeight: scrapWeight
      }
      tempArr = Object.assign([...gridData], { [index]: tempData })

      if (IsApplyMasterBatch) {
        const scrapWeight = checkForNull(GrossWeight - FinishWeight);
        const RMRate = calculatePercentageValue(tempData.RMRate, (100 - getValues('MBPercentage')));
        const RMRatePlusMasterBatch = (RMRate + checkForNull(getValues('RMTotal'))) * GrossWeight;
        const ScrapRate = (tempData.ScrapRate * scrapWeight)
        const NetLandedCost = isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull((RMRatePlusMasterBatch - ScrapRate) / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : (RMRatePlusMasterBatch - ScrapRate);

        tempData = {
          ...tempData,
          GrossWeight: GrossWeight ? GrossWeight : 0,
          NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost,
          WeightCalculatorRequest: {},
          WeightCalculationId: "00000000-0000-0000-0000-000000000000",
          IsCalculatedEntry: false,
          CutOffRMC: CutOffRMC,
          ScrapWeight: scrapWeight
        }
        tempArr = Object.assign([...gridData], { [index]: tempData })
      }
      dispatch(setRMCutOff({ IsCutOffApplicable: tempData.IsCutOffApplicable, CutOffRMC: CutOffRMC }))
      setGridData(tempArr)
      removeErrorGrossFinishWeight(GrossWeight, FinishWeight, index)

    }
  }

  /**
   * @method handleScrapRecoveryChange
   * @description HANDLE SCRAP RECOVERY CHANGE
   */
  const handleScrapRecoveryChange = (event, index) => {
    let tempArr = []
    let tempData = gridData[index]
    setEditCalculation(false)
    setForgingInfoIcon({ ...forgingInfoIcon, [index]: true })
    if (checkForNull(event.target.value) >= 0) {
      const ScrapRecoveryPercentage = checkForNull(event.target.value);

      const FinishWeight = checkForNull(tempData.FinishWeight);
      const GrossWeight = tempData.GrossWeight !== undefined ? checkForNull(tempData.GrossWeight) : 0;

      const scrapWeight = checkForNull(GrossWeight - FinishWeight);
      const recoveredScrapWeight = scrapWeight * calculatePercentage(ScrapRecoveryPercentage);
      const ScrapCost = FinishWeight !== 0 ? recoveredScrapWeight * checkForNull(tempData.ScrapRate) : 0;
      const CutOffRMC = tempData.IsCutOffApplicable ? (GrossWeight * checkForNull(tempData.CutOffPrice)) - ScrapCost : 0;
      if (tempData.IsCutOffApplicable && checkCutOffNegative(CutOffRMC, index)) {
        return false
      }

      const NetLandedCost = (GrossWeight * tempData.RMRate) - ScrapCost;

      tempData = {
        ...tempData,
        ScrapRecoveryPercentage: ScrapRecoveryPercentage,
        IsScrapRecoveryPercentageApplied: true,
        NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost,
        ScrapWeight: recoveredScrapWeight,
        CutOffRMC: CutOffRMC,
      }

      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)
      setValue(`${rmGridFields}.${index}.ScrapRecoveryPercentage`, ScrapRecoveryPercentage)

    } else {
      const ScrapRecoveryPercentage = checkForNull(event.target.value);

      const FinishWeight = checkForNull(tempData.FinishWeight);
      const GrossWeight = tempData.GrossWeight !== undefined ? checkForNull(tempData.GrossWeight) : 0;

      const scrapWeight = checkForNull(GrossWeight - FinishWeight);
      const ScrapCost = FinishWeight !== 0 ? scrapWeight * checkForNull(tempData.ScrapRate) : 0;
      const NetLandedCost = (GrossWeight * tempData.RMRate) - ScrapCost;

      tempData = {
        ...tempData,
        ScrapRecoveryPercentage: ScrapRecoveryPercentage,
        IsScrapRecoveryPercentageApplied: true,
        NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost,
        ScrapWeight: scrapWeight
      }

      tempArr = Object.assign([...gridData], { [index]: tempData })
      setGridData(tempArr)
      setValue(`${rmGridFields}.${index}.ScrapRecoveryPercentage`, ScrapRecoveryPercentage)
    }

  }

  /**
   * @method IsFinishWeightValid
   * @description CHECK IS FINISH WEIGHT LESS THEN GROSS WEIGHT
   */
  const IsFinishWeightValid = (GrossWeight, FinishWeight) => {
    return GrossWeight >= FinishWeight ? true : false;
  }

  /**
   * @method setWeight
   * @description SET WEIGHT IN RM
   */
  const setWeight = (weightData, originalWeight) => {
    let tempArr = []
    let tempData = gridData[editIndex]
    let grossWeight
    let finishWeight
    let netLandedCost
    let ScrapWeight
    // GROSS WEIGHT WILL ALWAYS BE KG ON THIS TAB, SO CONVERTING OTHER UNIT INTO KG
    if (Object.keys(weightData).length > 0) {
      if ((costData?.TechnologyId === SHEETMETAL || costData?.TechnologyId === WIREFORMING) && weightData?.UOMForDimension === DISPLAY_G) {
        grossWeight = weightData?.GrossWeight / 1000
        finishWeight = weightData?.FinishWeight / 1000
        netLandedCost = weightData?.RawMaterialCost / 1000
        ScrapWeight = weightData?.ScrapWeight / 1000

      } else if ((costData?.TechnologyId === SHEETMETAL || costData?.TechnologyId === WIREFORMING) && weightData?.UOMForDimension === DISPLAY_KG) {
        grossWeight = weightData?.GrossWeight
        finishWeight = weightData?.FinishWeight
        netLandedCost = weightData?.RawMaterialCost
        ScrapWeight = weightData?.ScrapWeight

      } else if ((costData?.TechnologyId === SHEETMETAL || costData?.TechnologyId === WIREFORMING) && weightData?.UOMForDimension === DISPLAY_MG) {
        grossWeight = weightData?.GrossWeight / 1000000
        finishWeight = weightData?.FinishWeight / 1000000
        netLandedCost = weightData?.RawMaterialCost / 1000000
        ScrapWeight = weightData?.ScrapWeight / 1000000

      } else {
        grossWeight = weightData?.GrossWeight
        finishWeight = weightData?.FinishWeight
        netLandedCost = weightData?.RawMaterialCost
        ScrapWeight = weightData?.ScrapWeight
      }

      const FinishWeight = finishWeight
      const GrossWeight = grossWeight
      const RecoveryPercentage = weightData?.RecoveryPercentage
      const scrapWeight = weightData?.ScrapWeight ? ScrapWeight : checkForNull(GrossWeight - FinishWeight)
      const ScrapCost = FinishWeight !== 0 ? scrapWeight * checkForNull(tempData.ScrapRate) : 0;
      const CutOffRMC = tempData.IsCutOffApplicable ? (GrossWeight * checkForNull(tempData.CutOffPrice)) - ScrapCost : 0;
      tempData = {
        ...tempData,
        FinishWeight: FinishWeight ? FinishWeight : 0,
        GrossWeight: GrossWeight ? GrossWeight : 0,
        NetLandedCost: netLandedCost,
        WeightCalculatorRequest: weightData,
        WeightCalculationId: weightData?.WeightCalculationId,
        RawMaterialCalculatorId: weightData?.WeightCalculationId,
        IsCalculatedEntry: true,
        CutOffRMC: CutOffRMC,
        ScrapRecoveryPercentage: RecoveryPercentage,
        BurningLossWeight: weightData?.BurningValue,
        ScrapWeight: scrapWeight,
        IsCalculaterAvailable: true,
        CalculatorType: weightData?.CalculatorType
        // IsScrapRecoveryPercentageApplied: true
      }
      tempArr = Object.assign([...gridData], { [editIndex]: tempData })
      setTimeout(() => {

        setValue(`${rmGridFields}.${editIndex}.GrossWeight`, checkForDecimalAndNull(GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue(`${rmGridFields}.${editIndex}.FinishWeight`, checkForDecimalAndNull(FinishWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue(`${rmGridFields}.${editIndex}.ScrapRecoveryPercentage`, checkForDecimalAndNull(RecoveryPercentage, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue(`${rmGridFields}.${editIndex}.BurningLossWeight`, checkForDecimalAndNull(weightData?.BurningValue, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue(`${rmGridFields}.${editIndex}.ScrapWeight`, checkForDecimalAndNull(scrapWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        dispatch(setRMCCErrors({})) //USED FOR ERROR HANDLING
        counter = 0 //USED FOR ERROR HANDLING 
      }, 400)
      errors.rmGridFields = []
      if (tempArr) {
        tempArr[0].CalculatorType = weightData?.CalculatorType
      }
      setGridData(tempArr)

      if (Number(costData?.TechnologyId) === Number(Ferrous_Casting)) {
        if (Object.keys(weightData).length > 0) {
            const updatedGridData = weightData.CostingFerrousCalculationRawMaterials.map((calculatedRM, index) => {
                const existingRM = gridData.find(item => item.RawMaterialId === calculatedRM.RawMaterialId);
                console.log('gridData: ', gridData);
                console.log('existingRM: ', existingRM);
    
                if (existingRM) {
                    return {
                        ...existingRM,
                        FinishWeight: weightData?.FinishWeight || 0,
                        GrossWeight: weightData?.GrossWeight || 0,
                        NetLandedCost: index === 0 ? weightData.RawMaterialCost : 0,
                        WeightCalculatorRequest: weightData,
                        WeightCalculationId: weightData.WeightCalculationId,
                        RawMaterialCalculatorId: weightData.WeightCalculationId,
                        IsCalculatedEntry: true,
                        IsCalculaterAvailable: true,
                        ScrapRecoveryPercentage: weightData.RecoveryPercentage,
                        ScrapWeight: weightData?.ScrapWeight || 0,
                        Percentage:calculatedRM?.Percentage || 0,
                        CalculatorType: weightData.CalculatorType
                    };
                }
                return null;
            }).filter(Boolean); // Remove any null entries
       
            setGridData(updatedGridData);
    
            // Use Promise to ensure state is updated before setting form values
            Promise.resolve().then(() => {
                updatedGridData.forEach((item, index) => {
                    setValue(`${rmGridFields}.${index}.GrossWeight`, checkForDecimalAndNull(item.GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput));
                    setValue(`${rmGridFields}.${index}.FinishWeight`, checkForDecimalAndNull(item.FinishWeight, getConfigurationKey().NoOfDecimalForInputOutput));
                    setValue(`${rmGridFields}.${index}.ScrapRecoveryPercentage`, checkForDecimalAndNull(item.ScrapRecoveryPercentage, getConfigurationKey().NoOfDecimalForInputOutput));
                    setValue(`${rmGridFields}.${index}.ScrapWeight`, checkForDecimalAndNull(item.ScrapWeight, getConfigurationKey().NoOfDecimalForInputOutput));
                });
            });
        }
    }

      if (Number(costData?.TechnologyId) === Number(RUBBER)) {
        gridData && gridData.map((item, index) => {
          item.FinishWeight = weightData?.CostingRubberCalculationRawMaterials[index].FinishWeight ? weightData?.CostingRubberCalculationRawMaterials[index].FinishWeight : 0
          item.GrossWeight = weightData?.CostingRubberCalculationRawMaterials[index].GrossWeight ? weightData?.CostingRubberCalculationRawMaterials[index].GrossWeight : 0
          item.NetLandedCost = index === 0 ? weightData?.RawMaterialCost : 0
          item.WeightCalculatorRequest = weightData
          item.WeightCalculationId = weightData?.WeightCalculationId
          item.RawMaterialCalculatorId = weightData?.WeightCalculationId
          item.IsCalculatedEntry = true
          item.IsCalculaterAvailable = true
          item.CutOffRMC = CutOffRMC
          item.ScrapRecoveryPercentage = RecoveryPercentage
          item.ScrapWeight = weightData?.CostingRubberCalculationRawMaterials[index]?.ScrapWeight ? weightData?.CostingRubberCalculationRawMaterials[index]?.ScrapWeight : 0
          item.Percentage = weightData?.CostingRubberCalculationRawMaterials[index].Percentage
          return item
        })

        setTimeout(() => {
          setGridData(gridData)
          gridData && gridData.map((item, index) => {
            setValue(`${rmGridFields}.${index}.GrossWeight`, checkForDecimalAndNull((weightData?.CostingRubberCalculationRawMaterials[index].GrossWeight), getConfigurationKey().NoOfDecimalForInputOutput))
            setValue(`${rmGridFields}.${index}.FinishWeight`, checkForDecimalAndNull(weightData?.CostingRubberCalculationRawMaterials[index].FinishWeight, getConfigurationKey().NoOfDecimalForInputOutput))
            setValue(`${rmGridFields}.${index}.ScrapRecoveryPercentage`, checkForDecimalAndNull(RecoveryPercentage, getConfigurationKey().NoOfDecimalForInputOutput))
            // setValue(`${rmGridFields}.${index}.NetRMCost`, checkForDecimalAndNull(NetRMCost, getConfigurationKey().NoOfDecimalForInputOutput))
            setValue(`${rmGridFields}.${index}.ScrapWeight`, checkForDecimalAndNull((weightData?.CostingRubberCalculationRawMaterials[index]?.ScrapWeight), getConfigurationKey().NoOfDecimalForInputOutput))
            return null
          })
        }, 500)
      }
      if (Number(costData?.TechnologyId) === Number(CORRUGATEDBOX) && calculatorTypeStore === 'CorrugatedAndMonoCartonBox') {
        if (weightData.WeightCalculationId) {
          gridData && gridData.map((item, index) => {
            if (index !== 0) {
              item.FinishWeight = 0
              item.GrossWeight = 0
              item.NetLandedCost = 0
              item.ScrapWeight = 0
            }
            return item
          })
          setTimeout(() => {
            gridData && gridData.map((item, index) => {
              setValue(`${rmGridFields}.${index}.GrossWeight`, 0)
              setValue(`${rmGridFields}.${index}.FinishWeight`, 0)
              setValue(`${rmGridFields}.${index}.ScrapRecoveryPercentage`, 0)
              if (index !== 0) {
                item.NetLandedCost = 0
              }
              setValue(`${rmGridFields}.${index}.ScrapWeight`, 0)
              return null
            })
          }, 200);

        }
      }
      if (Number(costData?.TechnologyId) === Number(MACHINING)) {
        tempData = {
          ...tempData,
          NetLandedCost: weightData?.LayoutType === 'Bar' ? weightData?.RawMaterialCost : weightData?.NetRM,
          //MINDA
          // NetLandedCost: weightData?.RMPerPiece,
          WeightCalculatorRequest: weightData,
          WeightCalculationId: weightData?.WeightCalculationId,
          RawMaterialCalculatorId: weightData?.WeightCalculationId,
          IsCalculatedEntry: true,
        }
        tempArr = Object.assign([...gridData], { [editIndex]: tempData })
        setGridData(tempArr);
      }
    }
  }
 
  /**
  * @method selectedIds
  * @description SELECTED IDS
  */
  const selectedIds = (tempArr) => {
    let selectedId = [];
    tempArr && tempArr.map(el => {
      if(Number(costData?.TechnologyId) === Number(Ferrous_Casting)) {
        selectedId.push(el.RawMaterialId)
        setIds(selectedId)
        
      }
      if (Ids.includes(el.RawMaterialId) === false) {
        let selectedIds = Ids;
        selectedIds.push(el.RawMaterialId)
        setIds(selectedIds)
      }
      return null;
    })
  }


  const onPopupConfirmDelete = () => {

    dispatch(setFerrousCalculatorReset(true))
    setIsMultiCalculatorData(false)
    let tempList = [...gridData]
    tempList && tempList.map((item, index) => {
      item.NetLandedCost = ''
      item.ScrapWeight = ''
      item.WeightCalculationId = 0
      item.RawMaterialCalculatorId = 0
      item.FinishWeight = 0
      item.GrossWeight = 0
      item.ScrapWeight = 0
      item.Percentage = 0
      item.WeightCalculatorRequest = {}
      setValue(`${rmGridFields}.${index}.GrossWeight`, '')     //COMMENT
      setValue(`${rmGridFields}.${index}.FinishWeight`, '')
      return item
    })
    setCalculatorTypeStore('')
    setShowPopupDelete(false)
    setGridData(tempList)

    setTimeout(() => {
      setConfirmPopup(true)
      deleteItem(deleteIndex)
    }, 200);

  }

  const deleteMultiple = (index) => {

    if ((Object.keys(gridData).length > 0 && gridData[0].WeightCalculationId !== null && isMultiCalculatorData && (Number(costData?.TechnologyId) === Number(Ferrous_Casting) || Number(costData?.TechnologyId) === Number(RUBBER) || Number(costData?.TechnologyId) === Number(CORRUGATEDBOX)))) {
      setShowPopupDelete(true)
      setDeleteIndex(index)
    } else {
      setDeleteIndex('')
      setShowPopupDelete(false)
      deleteItem(index)
    }
  }

  const deleteItem = (index) => {
    setMasterBatch(false)
    let tempArr = gridData && gridData.filter((el, i) => {
      if (i === index) return false;
      return true;
    })

    delete forgingInfoIcon[index]
    let count = 0
    let obj = {}
    for (let prop in forgingInfoIcon) {
      obj[count] = forgingInfoIcon[prop]
      count++
    }
    setForgingInfoIcon(obj)

    tempArr && tempArr.map((item, index) => {
      setValue(`${rmGridFields}.${index}.GrossWeight`, checkForDecimalAndNull(item.GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput))     //COMMENT
      setValue(`${rmGridFields}.${index}.FinishWeight`, checkForDecimalAndNull(item.FinishWeight, getConfigurationKey().NoOfDecimalForInputOutput))
      setValue(`${rmGridFields}.${index}.ScrapRecoveryPercentage`, checkForDecimalAndNull(item.ScrapRecoveryPercentage, getConfigurationKey().NoOfDecimalForInputOutput))
      setValue(`${rmGridFields}.${index}.BurningLossWeight`, checkForDecimalAndNull(item.BurningValue, getConfigurationKey().NoOfDecimalForInputOutput))
      setValue(`${rmGridFields}.${index}.ScrapWeight`, checkForDecimalAndNull(item.ScrapWeight, getConfigurationKey().NoOfDecimalForInputOutput))
      return null
    })
    setGridData(tempArr)

    let selectedIds = []
    tempArr.map(el => (selectedIds.push(el.RawMaterialId)))
    setIds(selectedIds)
    setIsApplyMasterBatch(false)
  }

  const onRemarkPopUpClick = (index) => {
    if (errors.rmGridFields && errors.rmGridFields[index]?.remarkPopUp !== undefined) {
      return false
    }
    let tempArr = []
    let tempData = gridData[index]
    tempData = {
      ...tempData,
      Remark: getValues(`${rmGridFields}.${index}.remarkPopUp`)
    }
    tempArr = Object.assign([...gridData], { [index]: tempData })
    setGridData(tempArr)

    if (getValues(`${rmGridFields}.${index}.remarkPopUp`)) {
      Toaster.success('Remark saved successfully')
    }
    var button = document.getElementById(`RM_popUpTrigger${index}`)
    button.click()
  }

  const onCRMHeadChange = (e, index) => {
    let tempArr = []
    let tempData = gridData[index]
    tempData = {
      ...tempData,
      RawMaterialCRMHead: e?.label
    }
    tempArr = Object.assign([...gridData], { [index]: tempData })
    setGridData(tempArr)
  }

  const onRemarkPopUpClose = (index) => {
    var button = document.getElementById(`RM_popUpTrigger${index}`)
    setValue(`${rmGridFields}.${index}.remarkPopUp`, gridData[index].Remark)
    if (errors && errors.rmGridFields && errors.rmGridFields[index].remarkPopUp) {
      delete errors.rmGridFields[index].remarkPopUp;
      setRemarkError(false)
    }
    button.click()
  }

  /**
  * @method onPressApplyMasterBatch
  * @description ON PRESS APPLY MASTER BATCH
  */
  const onPressApplyMasterBatch = () => {
    reset({
      MBName: '',
      MBPrice: '',
      MBPercentage: '',
      RMTotal: '',
    })

    dispatch(isDataChange(true))
    setEditCalculation(false)
    setIsApplyMasterBatch(!IsApplyMasterBatch)
  }

  useEffect(() => {
    if (IsApplyMasterBatch === false && gridData && gridData.length > 0 && CostingViewMode === false && editCalculation === false && IsLocked === false) {

      let tempArr = []
      let tempData = gridData[0]
      const GrossWeight = tempData?.GrossWeight !== undefined ? tempData.GrossWeight : 0
      const FinishWeight = tempData?.FinishWeight !== undefined ? tempData.FinishWeight : 0
      const ApplicableFinishWeight = (checkForNull(tempData?.FinishWeight) !== 0) ? (GrossWeight - FinishWeight) * tempData?.ScrapRate : 0;
      const NetLandedCost = (GrossWeight * tempData?.RMRate) - ApplicableFinishWeight;
      tempData = { ...tempData, NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost, }
      tempArr = Object.assign([...gridData], { 0: tempData })
      setValue(`${rmGridFields}.${0}.GrossWeight`, GrossWeight)
      setValue(`${rmGridFields}.${0}.FinishWeight`, checkForNull(tempData?.FinishWeight))
      const MasterBatchObj = {
        "MasterBatchRMId": '',
        "IsApplyMasterBatch": IsApplyMasterBatch,
        "MasterBatchRMName": '',
        "MasterBatchRMPrice": 0,
        "MasterBatchPercentage": 0,
        "MasterBatchTotal": 0,
      }

      if (!CostingViewMode && !IsLocked) {
        dispatch(setMasterBatchObj(MasterBatchObj))
      }
      setTimeout(() => {
        reset({
          MBName: '',
          MBPrice: '',
          MBPercentage: '',
          RMTotal: '',
        })

      }, 200)
      setGridData(tempArr)
    }
  }, [IsApplyMasterBatch])

  // THIS WILL CALLED WHEN RM REMOVED FROM GRID TO RESET MASTERBATCH DATA
  useEffect(() => {
    if (gridData && gridData.length === 0) {

      reset({
        MBName: '',
        MBPrice: '',
        MBPercentage: '',
        RMTotal: '',
      })
      const MasterBatchObj = {
        "MasterBatchRMId": '',
        "IsApplyMasterBatch": IsApplyMasterBatch,
        "MasterBatchRMName": '',
        "MasterBatchRMPrice": 0,
        "MasterBatchPercentage": 0,
        "MasterBatchTotal": 0,
      }
      setCalculatorTypeStore('')
      if (!CostingViewMode && !IsLocked) {
        dispatch(setMasterBatchObj(MasterBatchObj))

      }
    }

  }, [gridData])

  /**
  * @method MasterBatchToggle
  * @description TOGGLE MASTER BATCH DRAWER
  */
  const MasterBatchToggle = () => {
    setDrawerOpen(true)
  }

  /**
  * @method handleMBPercentage
  * @description HANDLE MB PERCENTAGE
  */
  const handleMBPercentage = (value) => {
    let tempData = gridData[0]
    setEditCalculation(false)
    if (Number(value) && !isNaN(value)) {

      setValue('RMTotal', checkForDecimalAndNull(calculatePercentageValue(getValues('MBPrice'), value), getConfigurationKey().NoOfDecimalForPrice))

      const RMRate = calculatePercentageValue(tempData.RMRate, (100 - value));

      const RMRatePlusMasterBatch = (RMRate + checkForNull(getValues('RMTotal'))) * checkForNull(tempData.GrossWeight);

      const ScrapRate = (tempData.ScrapRate * (tempData.GrossWeight - tempData.FinishWeight))

      const NetLandedCost = RMRatePlusMasterBatch - ScrapRate;

      tempData = { ...tempData, NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost, }
      let tempArr = Object.assign([...gridData], { 0: tempData })

      const MasterBatchObj = {
        "MasterBatchRMId": getValues('MBId'),
        "IsApplyMasterBatch": IsApplyMasterBatch,
        "MasterBatchRMName": getValues('MBName'),
        "MasterBatchRMPrice": getValues('MBPrice'),
        "MasterBatchPercentage": checkForNull(value),
        "MasterBatchTotal": getValues('RMTotal'),
      }

      dispatch(setMasterBatchObj(MasterBatchObj))
      setGridData(tempArr)
    } else {
      const ApplicableFinishWeight = (tempData.FinishWeight !== 0) ? (tempData.GrossWeight - tempData.FinishWeight) * tempData.ScrapRate : 0;
      const NetLandedCost = (tempData.GrossWeight * tempData.RMRate) - ApplicableFinishWeight;
      tempData = { ...tempData, NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost, }
      let tempArr = Object.assign([...gridData], { 0: tempData })
      setValue('RMTotal', checkForDecimalAndNull(value, getConfigurationKey().NoOfDecimalForPrice))
      setGridData(tempArr)

    }
  }

  /**
   * @method setRMCCErrors
   * @description CALLING TO SET RAWMATERIAL COST FORM'S ERROR THAT WILL USE WHEN HITTING SAVE RMCC TAB API.
   */
  let temp = ErrorObjRMCC
  if (Object.keys(errors).length > 0 && counter < 2) {
    temp.rmGridFields = errors.rmGridFields;
    dispatch(setRMCCErrors(temp))
    counter++;
  } else if (Object.keys(errors).length === 0 && counter > 0) {
    temp.rmGridFields = {};
    dispatch(setRMCCErrors(temp))
    counter = 0
  }

  const isShowAddBtn = () => {
    let isShow = false;

    if (gridData.length <= gridLength) {
      isShow = true;
    }

    if (costData && (item?.IsMultipleRMApplied)) {
      isShow = true;
    }
    return isShow;
  }

  const onPopupConfirm = () => {
    dispatch(setFerrousCalculatorReset(true))
    setIsMultiCalculatorData(false)
    let tempList = [...gridData]
    tempList && tempList.map((item, index) => {
      item.NetLandedCost = ''
      item.ScrapWeight = ''
      item.WeightCalculationId = 0
      item.RawMaterialCalculatorId = 0
      item.FinishWeight = 0
      item.GrossWeight = 0
      item.ScrapWeight = 0
      item.WeightCalculatorRequest = {}
      setValue(`${rmGridFields}.${index}.GrossWeight`, 0)     //COMMENT
      setValue(`${rmGridFields}.${index}.FinishWeight`, 0)
      return item
    })
    setCalculatorTypeStore('')
    setShowPopup(false)
    setGridData(tempList)
    setTimeout(() => {
      setConfirmPopup(true)
      setDrawerOpen(true)
    }, 700);
  }

  const closePopUp = () => {
    setShowPopup(false)
    setShowPopupDelete(false)
  }

  /**
   * @method onSubmit
   * @description Used to Submit the form
   */
  const onSubmit = (values) => { }

  // const rmGridFields = 'rmGridFields'

  const DisableMasterBatchCheckbox = (value) => {

    if (value === true) {
      setIsApplyMasterBatch(false)
    }
    setMasterBatch(true)
  }

  const showCalculatorFunction = (item) => {
    let value = false
    if (getTechnology.includes(costData?.TechnologyId)) {
      value = true
    }
    return value
  }

  const showCalculatorFunctionHeader = () => {
    let value = false
    if (getTechnology.includes(costData?.TechnologyId)) {
      value = true
    }
    return value
  }


  const tourStart = () => {
    setTourState(prevState => ({
      ...prevState,
      steps: Steps(t).RAW_MATERIAL_COST,
    }))
  }
  const pinHandler = useCallback(() => {
    setHeaderPinned(!headerPinned)
  }, [headerPinned])

  const checkRMDevisor = () => {
    if (checkForNull(RMDivisor) === 1 || checkForNull(RMDivisor) === 0) return false
    return true
  }

  const disabledForMonoCartonCorrugated = (costData?.TechnologyId === CORRUGATEDBOX && calculatorTypeStore === 'CorrugatedAndMonoCartonBox')
  /**
   * @method render
   * @description Renders the component
   */
  return (
    <>
      <div className="user-page p-0">
        <div>
          <Row className="align-items-center">
            <Col md="6">
              <div className="left-border">{'Raw Material Cost:'}
                {gridData && gridData.length !== 0 &&
                  <TourWrapper
                    buttonSpecificProp={{ id: "Costing_RM_Cost", onClick: tourStart }}
                    stepsSpecificProp={{
                      steps: Steps(t).RAW_MATERIAL_COST
                    }} />}
              </div>
            </Col >
            <Col md={'6'} className="btn-container">
              {!CostingViewMode && !IsLocked && gridData && isShowAddBtn() &&

                <Button
                  id="Costing_addRM"
                  disabled={IsApplyMasterBatch}
                  onClick={DrawerToggle}
                  icon={"plus"}
                  buttonName={"RM"}
                />
              }
              {((costData?.TechnologyId === Ferrous_Casting || costData?.TechnologyId === RUBBER || (costData?.TechnologyId === CORRUGATEDBOX && corrugatedBoxPermission().CorrugatedAndMonoCartonBox)) && gridData?.length !== 0) && <button
                className="secondary-btn"
                type={'button'}
                onClick={() => toggleWeightCalculator(0, 'CorrugatedAndMonoCartonBox')}
                disabled={(CostingViewMode ? item?.RawMaterialCalculatorId === null ? true : false : false) || (costData?.TechnologyId === CORRUGATEDBOX && calculatorTypeStore === 'CorrugatedBox')}><div className={`CalculatorIcon cr-cl-icon ${((CostingViewMode ? item?.RawMaterialCalculatorId === null ? true : false : false) || (costData?.TechnologyId === CORRUGATEDBOX && calculatorTypeStore === 'CorrugatedBox')) ? 'disabled' : ''}`}></div>Weight Calculator</button>}


            </Col>
          </Row >
          <form noValidate className="form" onSubmit={handleSubmit(onSubmit)}>
            {false && isNFR && <Row>
              {/*RAW MATERIAL COST GRID */}

              <Col md="12">
                <Table className="table cr-brdr-main sap-rm-table" size="sm">
                  <thead>
                    <tr>
                      <th >{`RM Name`}</th>
                      <th>{`RM Code`}</th>
                      <th>{`Gross Weight`}</th>
                      <th>{`Net Weight`}</th>
                    </tr>
                  </thead>
                  <tbody className='rm-table-body'>
                    {dataFromAPI &&
                      dataFromAPI.map((item, index) => {
                        return (
                          <tr key={index} className=''>
                            <td className='text-overflow'><span title={item.RMName}>{item.RMName}</span></td>
                            <td>{item.RMCode}</td>
                            <td>{item.GrossWeight}</td>
                            <td>{item.NetWeight}</td>
                          </tr >
                        )
                      })
                    }
                    {
                      dataFromAPI && dataFromAPI.length === 0 &&
                      <tr>
                        <td colSpan={11}>
                          <NoContentFound title={EMPTY_DATA} />
                        </td>
                      </tr>
                    }
                  </tbody >
                </Table >
              </Col >
            </Row >}
            <Row>
              {/*RAW MATERIAL COST GRID */}

              <Col md="12">
                <Table className="table cr-brdr-main costing-raw-material-section" size="sm">
                  <thead className={`${headerPinned ? 'sticky-headers' : ''} rm-table-header`}>
                    <tr>
                      <th className='rm-name-head'>{`RM Name`}</th>
                      <th>{`RM Rate`}</th>
                      <th>{`Scrap Rate`}</th>
                      <th>{`UOM`}</th>
                      {showCalculatorFunctionHeader() && <th className={`text-center weight-calculator`}>{`Weight Calculator`}</th>}
                      {<th>{`Gross Weight`}</th>}
                      {<th>{`Finish Weight`}</th>}
                      {(costData?.TechnologyId === Ferrous_Casting) && <th>Percentage</th>}
                      {costData?.TechnologyId === PLASTIC && <th>{'Burning Loss Weight'}</th>}
                      {isScrapRecoveryPercentageApplied && <th className='scrap-recovery'>{`Scrap Recovery (%)`}</th>}
                      {<th className='scrap-weight'>Scrap Weight </th>}
                      {/* //Add i here for MB+ */}
                      <th className='net-rm-cost' >{`Net RM Cost ${(isRMDivisorApplicable(costData.TechnologyName) && checkRMDevisor()) ? '/(' + RMDivisor + ')' : ''}`}  </th>
                      {initialConfiguration.IsShowCRMHead && <th>{'CRM Head'}</th>}
                      <th><div className='pin-btn-container'><span>Action</span><button title={headerPinned ? 'pin' : 'unpin'} onClick={pinHandler} className='pinned'><div className={`${headerPinned ? '' : 'unpin'}`}></div></button></div></th>

                    </tr >
                  </thead >
                  <tbody className='rm-table-body'>
                    {gridData &&
                      gridData.map((item, index) => {
                        return (
                          <tr key={index} className=''>
                            <td className='text-overflow'><span title={item.RMName}>{item.RMName}</span></td>
                            <td>{checkForDecimalAndNull(item.RMRate, getConfigurationKey().NoOfDecimalForPrice)}</td>
                            <td>{checkForDecimalAndNull(item.ScrapRate, getConfigurationKey().NoOfDecimalForPrice)}</td>
                            <td>{item.UOM}</td>
                            {
                              showCalculatorFunctionHeader() && getTechnology.includes(costData?.TechnologyId) &&
                              <td className="text-center">
                                {showCalculatorFunction(item) ? <button
                                  id={`RM_calculator${index}`}
                                  className={`CalculatorIcon cr-cl-icon RM_calculator${index}`}
                                  type={'button'}
                                  onClick={() => toggleWeightCalculator(index)}
                                  disabled={(CostingViewMode ? (item?.RawMaterialCalculatorId === null ? true : disabledForMonoCartonCorrugated) : (disabledForMonoCartonCorrugated))}
                                /> : '-'}
                              </td>
                            }
                            {
                              <><td>
                                <div className='costing-error-container'>
                                  <TextFieldHookForm
                                    label=""
                                    name={`${rmGridFields}.${index}.GrossWeight`}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    rules={{
                                      required: true,
                                      validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                      min: {
                                        value: item.FinishWeight,
                                        message: 'Gross weight should not be lesser than finish weight.'
                                      },
                                    }}
                                    defaultValue={checkForDecimalAndNull(item.GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput)}
                                    className=""
                                    customClassName={`withBorder Raw_material_grossWeight${index}`}
                                    handleChange={(e) => {
                                      e.preventDefault()
                                      handleGrossWeightChange(e?.target?.value, index)
                                    }}
                                    errors={errors && errors.rmGridFields && errors.rmGridFields[index] !== undefined ? errors.rmGridFields[index].GrossWeight : ''}
                                    disabled={(CostingViewMode || IsLocked || isMultiCalculatorData || (item?.RawMaterialCalculatorId && costData?.TechnologyId === MACHINING && item?.UOM === "Meter") || item?.dataFromNFRAPI || disabledForMonoCartonCorrugated) ? true : false}
                                  />
                                </div>
                              </td>
                                <td>
                                  <div className='costing-error-container'>
                                    <TextFieldHookForm
                                      label=""
                                      name={`${rmGridFields}.${index}.FinishWeight`}
                                      Controller={Controller}
                                      control={control}
                                      register={register}
                                      mandatory={false}
                                      rules={{
                                        required: true,
                                        validate: { number, checkWhiteSpaces, decimalNumberLimit6 },
                                        max: {
                                          value: item.GrossWeight,
                                          message: 'Finish weight should not be greater than gross weight.'
                                        },
                                      }}
                                      defaultValue={checkForDecimalAndNull(item.FinishWeight, getConfigurationKey().NoOfDecimalForInputOutput)}
                                      className=""
                                      customClassName={`withBorder Raw_material_finishWeight${index}`}
                                      handleChange={(e) => {
                                        e.preventDefault()
                                        handleFinishWeightChange(e?.target?.value, index)
                                      }}
                                      errors={errors && errors.rmGridFields && errors.rmGridFields[index] !== undefined ? errors.rmGridFields[index].FinishWeight : ''}
                                      disabled={(CostingViewMode || IsLocked || isMultiCalculatorData || (!initialConfiguration?.IsCopyCostingFinishAndGrossWeightEditable && item.IsRMCopied) || (item?.RawMaterialCalculatorId && costData?.TechnologyId === MACHINING && item?.UOM === "Meter") || item?.dataFromNFRAPI || disabledForMonoCartonCorrugated) ? true : false}
                                    />
                                  </div>
                                </td></>
                            }
                            {costData?.TechnologyId === Ferrous_Casting && <td>{checkForDecimalAndNull(item.Percentage, initialConfiguration.NoOfDecimalForPrice)}</td>}
                            {
                              costData?.TechnologyId === PLASTIC && <td>{checkForDecimalAndNull(item.BurningLossWeight, initialConfiguration.NoOfDecimalForInputOutput)}</td>
                            }
                            {
                              isScrapRecoveryPercentageApplied &&
                              <td>
                                <div className='costing-error-container'>
                                  <TextFieldHookForm
                                    label=""
                                    name={`${rmGridFields}.${index}.ScrapRecoveryPercentage`}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    rules={{
                                      required: true,
                                      validate: { number, checkWhiteSpaces, percentageLimitValidation },
                                      max: {
                                        value: 100,
                                        message: 'Percentage should be less than 100.'
                                      },
                                    }}
                                    defaultValue={checkForDecimalAndNull(item.ScrapRecoveryPercentage, getConfigurationKey().NoOfDecimalForInputOutput)}
                                    className=""
                                    customClassName={'withBorder scrap-recovery'}
                                    handleChange={(e) => {
                                      e.preventDefault()
                                      handleScrapRecoveryChange(e, index)
                                    }}
                                    errors={errors && errors.rmGridFields && errors.rmGridFields[index] !== undefined ? errors.rmGridFields[index].ScrapRecoveryPercentage : ''}
                                    disabled={CostingViewMode || IsLocked || (gridData[index].FinishWeight === 0) || (gridData[index].FinishWeight === "") || (gridData[index].FinishWeight === null) || (gridData[index].FinishWeight === undefined) || gridData[index].IsCalculatedEntry || (item?.RawMaterialCalculatorId && costData?.TechnologyId === MACHINING && item?.UOM === "Meter") || disabledForMonoCartonCorrugated ? true : false}
                                  />
                                </div>
                              </td>
                            }
                            <td><div className='w-fit' id={`scrap-weight${index}`}>{checkForDecimalAndNull(item.ScrapWeight, initialConfiguration.NoOfDecimalForPrice)} <TooltipCustom disabledIcon={true} tooltipClass={isScrapRecoveryPercentageApplied && "net-rm-cost"} id={`scrap-weight${index}`} tooltipText={isScrapRecoveryPercentageApplied && item?.ScrapRecoveryPercentage ? "Scrap weight = ((Gross Weight - Finish Weight) * Recovery Percentage / 100)" : "Scrap weight = (Gross Weight - Finish Weight)"} /></div> </td>
                            <td>
                              <div className='d-flex'>
                                <div className='w-fit' id={`net-rm-cost${index}`}>{<TooltipCustom disabledIcon={true} tooltipClass="net-rm-cost" id={`net-rm-cost${index}`} tooltipText={(Number(costData?.TechnologyId) === MACHINING && item?.UOM === 'Meter') ? 'Net RM Cost = RM/Pc - ScrapCost' : 'Net RM Cost = (RM Rate * Gross Weight) - (Scrap Weight * Scrap Rate)'} />}{item?.NetLandedCost !== undefined ? checkForDecimalAndNull(item.NetLandedCost, initialConfiguration.NoOfDecimalForPrice) : 0}
                                </div>
                                {forgingInfoIcon[index] && costData?.TechnologyId === FORGING && <TooltipCustom id={`forging-tooltip${index}`} customClass={"mt-1 ml-2"} tooltipText={`RMC is calculated on the basis of Forging Scrap Rate.`} />}
                                {index === 0 && (item.RawMaterialCalculatorId !== '' && item?.RawMaterialCalculatorId > 0) && costData?.TechnologyId === Ferrous_Casting && <TooltipCustom id={`forging-tooltip${index}`} customClass={"mt-1 ml-2"} tooltipText={`This is RMC of all RM present in alloy.`} />}
                              </div>
                            </td>
                            {
                              initialConfiguration.IsShowCRMHead && <td>
                                <SearchableSelectHookForm
                                  name={`crmHeadRm${index}`}
                                  type="text"
                                  label="CRM Head"
                                  errors={`${errors.crmHeadRm}${index}`}
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  mandatory={false}
                                  rules={{
                                    required: false,
                                  }}
                                  defaultValue={item.RawMaterialCRMHead ? { label: item.RawMaterialCRMHead, value: index } : ''}
                                  placeholder={'Select'}
                                  options={CRMHeads}
                                  customClassName="costing-selectable-dropdown"
                                  required={false}
                                  handleChange={(e) => { onCRMHeadChange(e, index) }}
                                  disabled={CostingViewMode}
                                /></td>
                            }
                            <td>
                              <div className='action-btn-wrapper'>
                                {!CostingViewMode && !IsLocked && (item.IsRMCopied ? (initialConfiguration.IsCopyCostingFinishAndGrossWeightEditable ? true : false) : true) && < button
                                  className="Delete "
                                  id={`RM_delete${index}`}
                                  title='Delete'
                                  type={'button'}
                                  onClick={() => (costData?.TechnologyId === Ferrous_Casting || costData?.TechnologyId === RUBBER) || costData?.TechnologyId === CORRUGATEDBOX ? deleteMultiple(index) : deleteItem(index)}
                                />}
                                <Popup className='rm-popup' trigger={<button id={`RM_popUpTrigger${index}`} title="Remark" className="Comment-box" type={'button'} />}
                                  position="top right">
                                  <TextAreaHookForm
                                    label="Remark:"
                                    name={`${rmGridFields}.${index}.remarkPopUp`}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    rules={{
                                      maxLength: remarkError && REMARKMAXLENGTH
                                    }}
                                    handleChange={(e) => { setRemarkError(true) }}
                                    defaultValue={item.Remark ?? item.Remark}
                                    className=""
                                    customClassName={"withBorder"}
                                    errors={errors && errors.rmGridFields && errors.rmGridFields[index] !== undefined ? errors.rmGridFields[index].remarkPopUp : ''}
                                    //errors={errors && errors.remarkPopUp && errors.remarkPopUp[index] !== undefined ? errors.remarkPopUp[index] : ''}                        
                                    disabled={(CostingViewMode || IsLocked) ? true : false}
                                    hidden={false}
                                  />
                                  <Row>
                                    <Col md="12" className='remark-btn-container'>
                                      <button className='submit-button mr-2' disabled={(CostingViewMode || IsLocked) ? true : false} onClick={() => onRemarkPopUpClick(index)} > <div className='save-icon'></div> </button>
                                      <button className='reset' onClick={() => onRemarkPopUpClose(index)} > <div className='cancel-icon'></div></button>
                                    </Col>
                                  </Row>

                                </Popup>
                              </div >
                            </td >
                          </tr >
                        )
                      })
                    }
                    {
                      gridData && gridData.length === 0 &&
                      <tr>
                        <td colSpan={11}>
                          <NoContentFound title={EMPTY_DATA} />
                        </td>
                      </tr>
                    }
                  </tbody>
                </Table>
              </Col >
            </Row >

            <Row>
              {/* IF THERE IS NEED TO APPLY FOR MULTIPLE TECHNOLOGY, CAN MODIFIED BELOW CONDITION */}
              {costData?.TechnologyId === PLASTIC &&
                <Col md="2" className="py-3 pr-0 d-flex align-items-center apply-mb">
                  <label
                    className={`custom-checkbox mb-0`}
                    onChange={onPressApplyMasterBatch}
                  >
                    Apply Master Batch(MB)
                    <input
                      type="checkbox"
                      checked={IsApplyMasterBatch}
                      disabled={(CostingViewMode || IsLocked || gridData?.length !== 1 || masterBatch) ? true : false}
                    />
                    <span
                      className=" before-box"
                      checked={IsApplyMasterBatch}
                      onChange={onPressApplyMasterBatch}
                    />
                  </label>
                  <TooltipCustom id={"added-rm-indicate"} customClass="float-none ml-n2 mt-3 " tooltipText="Can only be added with 1 RM" />
                </Col >
              }

              {/* IF THERE IS NEED TO APPLY FOR MULTIPLE TECHNOLOGY, CAN MODIFIED BELOW CONDITION */}
              {
                IsApplyMasterBatch && costData?.TechnologyId === PLASTIC &&
                <>
                  <Col md="2">
                    <button onClick={MasterBatchToggle} title={'Add Master Batch'} disabled={(CostingViewMode || IsLocked || masterBatch)} type="button" class="user-btn mt30"><div class="plus"></div>Add Master Batch</button>
                  </Col>
                  {/* <Col md="2" > */}
                  <TextFieldHookForm
                    label="MB Id"
                    name={"MBId"}
                    Controller={Controller}
                    control={control}
                    register={register}
                    mandatory={false}
                    rules={{}}
                    handleChange={(e) => { }}
                    defaultValue={""}
                    className=""
                    customClassName={"withBorder"}
                    errors={errors.MBId}
                    disabled={true}
                    hidden={true}
                  />
                  {/* </Col> */}
                  <Col md="2" >
                    <TextFieldHookForm
                      label="MB Name"
                      name={"MBName"}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                        validate: { checkWhiteSpaces, hashValidation },
                        maxLength: STRINGMAXLENGTH
                      }}
                      handleChange={(e) => { }}
                      defaultValue={""}
                      className=""
                      customClassName={"withBorder"}
                      errors={errors.MBName}
                      disabled={true}
                    />
                  </Col>
                  <Col md="2">
                    <TextFieldHookForm
                      label="MB Rate"
                      name={'MBPrice'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                        validate: { number, checkWhiteSpaces, decimalNumberLimit6 }
                      }}
                      handleChange={() => { }}
                      defaultValue={""}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.MBPrice}
                      disabled={true}
                    />
                  </Col>
                  <Col md="2">
                    <TextFieldHookForm
                      label="Percentage"
                      name={`MBPercentage`}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        required: false,
                        validate: { number, checkWhiteSpaces, percentageLimitValidation },
                        max: {
                          value: 100,
                          message: 'Percentage cannot be greater than 100.'
                        },
                      }}
                      defaultValue={""}
                      className=""
                      customClassName={'withBorder mb-0'}
                      handleChange={(e) => {
                        e.preventDefault()
                        handleMBPercentage(e.target.value)
                      }}
                      errors={errors.MBPercentage}
                      disabled={(CostingViewMode || IsLocked || checkForNull(getValues('MBPrice')) === 0 || masterBatch) ? true : false}
                    />
                  </Col>
                  <Col md="2">
                    <TextFieldHookForm
                      label="Effective MB Rate"
                      name={'RMTotal'}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{}}
                      handleChange={() => { }}
                      defaultValue={""}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.RMTotal}
                      disabled={true}
                    />
                  </Col>
                </>
              }
            </Row >

            {
              showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`If you add New RM all the calculations will be reset`} />
            }
            {
              showPopupDelete && <PopupMsgWrapper isOpen={showPopupDelete} closePopUp={closePopUp} confirmPopup={onPopupConfirmDelete} message={`If you delete RM all the calculations will be reset`} />
            }
          </form >
        </div >
      </div >
      {
        isDrawerOpen && (
          <AddRM
            isOpen={isDrawerOpen}
            closeDrawer={closeDrawer}
            isEditFlag={false}
            ID={''}
            anchor={'right'}
            IsApplyMasterBatch={IsApplyMasterBatch}
            Ids={Ids}
            rmNameList={rmNameList}
            item={item}
          />
        )
      }
      {
        isWeightDrawerOpen && (
          <OpenWeightCalculator
            isOpen={isWeightDrawerOpen}
            CostingViewMode={CostingViewMode || IsLocked}
            closeDrawer={closeWeightDrawer}
            isEditFlag={(CostingViewMode || IsLocked) ? false : true}
            inputDiameter={inputDiameter}
            item={item}
            technology={costData?.TechnologyId}
            ID={''}
            anchor={'right'}
            rmRowData={gridData[editIndex]}
            rmData={gridData}
            isSummary={false}
            DisableMasterBatchCheckbox={DisableMasterBatchCheckbox}
            calculatorType={calculatorTypeStore}
          />
        )
      }
    </>
  )
}

export default RawMaterialCost
