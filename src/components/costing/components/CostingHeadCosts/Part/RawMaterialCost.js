import React, { useState, useContext, useEffect, } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Col, Row, Table } from 'reactstrap'
import AddRM from '../../Drawers/AddRM'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import NoContentFound from '../../../../common/NoContentFound'
import { useDispatch, useSelector } from 'react-redux'
import { EMPTY_DATA } from '../../../../../config/constants'
import { NumberFieldHookForm, TextFieldHookForm, TextAreaHookForm } from '../../../../layout/HookFormInputs'
import Toaster from '../../../../common/Toaster'
import { calculatePercentage, calculatePercentageValue, checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected, getConfigurationKey, isRMDivisorApplicable } from '../../../../../helper'
import OpenWeightCalculator from '../../WeightCalculatorDrawer'
import { getRawMaterialCalculationForCorrugatedBox, getRawMaterialCalculationForDieCasting, getRawMaterialCalculationForFerrous, getRawMaterialCalculationForForging, getRawMaterialCalculationForPlastic, getRawMaterialCalculationForRubber, getRawMaterialCalculationForSheetMetal, } from '../../../actions/CostWorking'
import { ViewCostingContext } from '../../CostingDetails'
import { DISPLAY_G, DISPLAY_KG, DISPLAY_MG } from '../../../../../config/constants'
import TooltipCustom from '../../../../common/Tooltip'
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import { setFerrousCalculatorReset } from '../../../actions/CostWorking'
import { gridDataAdded, isDataChange, setMasterBatchObj, setRMCCErrors, setRMCutOff } from '../../../actions/Costing'
import { getTechnology, technologyForDensity, isMultipleRMAllow, } from '../../../../../config/masterData'
import PopupMsgWrapper from '../../../../common/PopupMsgWrapper';
import { SHEETMETAL, RUBBER, FORGING, DIE_CASTING, PLASTIC, CORRUGATEDBOX, Ferrous_Casting } from '../../../../../config/masterData'
import { debounce } from 'lodash'

let counter = 0;
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
  const { CostingEffectiveDate } = useSelector(state => state.costing)
  const [showPopup, setShowPopup] = useState(false)
  const [masterBatch, setMasterBatch] = useState(false)

  const { ferrousCalculatorReset } = useSelector(state => state.costWorking)
  const RMDivisor = (item?.CostingPartDetails?.RMDivisor !== null) ? item?.CostingPartDetails?.RMDivisor : 0;
  const isScrapRecoveryPercentageApplied = item?.IsScrapRecoveryPercentageApplied

  const dispatch = useDispatch()

  useEffect(() => {



    switch (costData.TechnologyName) {
      case 'Sheet Metal':
        return setGridLength(0)
      case 'Plastic':
        return setGridLength(0)
      case 'Rubber':
        return setGridLength(3)
      case 'Forgining':
        return setGridLength(0)
      default:
        return setGridLength(0)
    }
  }, [])

  useEffect(() => {
    setTimeout(() => {
      const Params = {
        index: props.index,
        BOMLevel: props.item.BOMLevel,
        PartNumber: props.item.PartNumber,
      }
      if (!CostingViewMode && !IsLocked) {

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
        gridData && gridData.map(item => {
          if (item.IsCutOffApplicable) {
            isCutOffApplicableCount = isCutOffApplicableCount + 1
            totalCutOff = totalCutOff + checkForNull(item.CutOffRMC)
          }
          else {
            totalCutOff = totalCutOff + checkForNull(item.NetLandedCost)
          }
          return null
        })
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

    if ((Object.keys(gridData).length > 0 && gridData[0].WeightCalculationId !== null && Number(costData?.TechnologyId) === Number(Ferrous_Casting))) {
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
      if (isMultipleRMAllow(costData?.TechnologyId)) {
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
      setValue('MBName', rowData && rowData[0].RawMaterial !== undefined ? rowData[0].RawMaterial : '')
      setValue('MBId', rowData && rowData[0].RawMaterialId !== undefined ? rowData[0].RawMaterialId : '')
      setValue('MBPrice', rowData && (rowData[0].EntryType === 'Domestic') ? rowData[0].NetLandedCost : rowData[0].NetLandedCostConversion)
    }
    setDrawerOpen(false)
  }

  const setCalculatorData = (res, index) => {
    let tempArr = []
    let tempData = gridData[index]
    const data = res && res.data && res.data.Data ? res.data.Data : {}
    tempData = { ...tempData, WeightCalculatorRequest: ferrousCalculatorReset === true ? {} : data }
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
  const toggleWeightCalculator = debounce((index) => {
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
        dispatch(getRawMaterialCalculationForFerrous(item.CostingId, tempData.RawMaterialId, item?.CostingPartDetails?.RawMaterialCalculatorId, res => {
          setCalculatorData(res, index)
        }))
        break;
      case PLASTIC:
        dispatch(getRawMaterialCalculationForPlastic(item.CostingId, tempData.RawMaterialId, tempData.RawMaterialCalculatorId, res => {
          setCalculatorData(res, index)
        }))
        break;
      case CORRUGATEDBOX:
        dispatch(getRawMaterialCalculationForCorrugatedBox(item.CostingId, tempData.RawMaterialId, tempData.RawMaterialCalculatorId, res => {
          setCalculatorData(res, index)
        }))
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
      default:
        return "none";
    }
  }, 500)

  /**
   * @method closeWeightDrawer
   * @description HIDE WEIGHT CALCULATOR DRAWER
   */
  const closeWeightDrawer = (e = '', weightData = {}, originalWeight = {}) => {

    setInputDiameter(weightData.Diameter)
    setWeight(weightData, originalWeight)
    setWeightDrawerOpen(false)
  }

  const checkCutOffNegative = (value, index) => {
    console.log('index: ', index);
    console.log('value: ', value);
    if (value < 0) {
      setTimeout(() => {
        setValue(`${rmGridFields}.${index}.GrossWeight`, '')
        setValue(`${rmGridFields}.${index}.FinishWeight`, '')
        setValue(`${rmGridFields}.${index}.ScrapRecoveryPercentage`, 0)

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
      console.log('tempArr: ', tempArr);
      setTimeout(() => {
        setGridData(tempArr)
      }, 100);
      Toaster.warning('Scrap weight is larger than Cut Off price')
      return false
    }

  }

  /**
   * @method handleGrossWeightChange
   * @description HANDLE GROSS WEIGHT CHANGE
   */
  const handleGrossWeightChange = (event, index) => {
    let tempArr = []
    let tempData = gridData[index]
    setEditCalculation(false)
    let grossValue = event

    if (checkForNull(grossValue) >= 0) {

      if (IsFinishWeightValid(grossValue, tempData.FinishWeight)) {
        const GrossWeight = checkForNull(grossValue)
        const FinishWeight = tempData.FinishWeight !== undefined ? tempData.FinishWeight : 0
        let scrapWeight = checkForNull(GrossWeight - FinishWeight);

        // Recovered scrap weight calculate
        let recoveredScrapWeight;
        if (isScrapRecoveryPercentageApplied && tempData.ScrapRecoveryPercentage !== undefined && tempData.ScrapRecoveryPercentage !== 0) {
          const ScrapRecoveryPercentage = checkForNull(tempData.ScrapRecoveryPercentage);
          recoveredScrapWeight = scrapWeight * calculatePercentage(ScrapRecoveryPercentage);
          scrapWeight = recoveredScrapWeight
        }

        // const ApplicableFinishWeight = (checkForNull(tempData.FinishWeight) !== 0) ? scrapWeight * tempData.ScrapRate : 0;
        const ScrapCost = (checkForNull(tempData.FinishWeight) !== 0) ? scrapWeight * tempData.ScrapRate : 0;
        console.log('ScrapCost: ', ScrapCost);
        const NetLandedCost = (GrossWeight * tempData.RMRate) - ScrapCost;
        console.log('NetLandedCost: ', NetLandedCost);
        const CutOffRMC = tempData.IsCutOffApplicable ? (GrossWeight * checkForNull(tempData.CutOffPrice)) - ScrapCost : 0;
        console.log('CutOffRMC: ', CutOffRMC);
        if (tempData.IsCutOffApplicable && checkCutOffNegative(CutOffRMC, index)) {
          console.log(CutOffRMC, "Inside IF");
          return false
        }

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
        setValue(`${rmGridFields}.${index}.GrossWeight`, grossValue)     //COMMENT
        setValue(`${rmGridFields}.${index}.FinishWeight`, checkForNull(tempData.FinishWeight))
      } else {
        const GrossWeight = checkForNull(grossValue)
        const FinishWeight = 0                                           //Finish weight will be zero when  Gross Weight < Finish weight
        // let scrapWeight = checkForNull(GrossWeight - FinishWeight);
        let scrapWeight = 0

        const ScrapCost = (checkForNull(tempData.FinishWeight) !== 0) ? scrapWeight * tempData.ScrapRate : 0;
        const CutOffRMC = tempData.IsCutOffApplicable ? (GrossWeight * checkForNull(tempData.CutOffPrice)) - ScrapCost : 0;
        if (tempData.IsCutOffApplicable && checkCutOffNegative(CutOffRMC, index)) {
          return false
        }
        const ApplicableFinishWeight = 0;
        const NetLandedCost = (GrossWeight * tempData.RMRate) - ApplicableFinishWeight;
        tempData = {
          ...tempData,
          GrossWeight: GrossWeight ? GrossWeight : 0,
          FinishWeight: 0,
          NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost,
          WeightCalculatorRequest: {},
          WeightCalculationId: "00000000-0000-0000-0000-000000000000",
          IsCalculatedEntry: false,
          CutOffRMC: CutOffRMC,
          ScrapWeight: scrapWeight,
          ScrapRecoveryPercentage: 0
        }
        tempArr = Object.assign([...gridData], { [index]: tempData })

        if (IsApplyMasterBatch) {

          const RMRate = calculatePercentageValue(tempData.RMRate, (100 - getValues('MBPercentage')));
          const RMRatePlusMasterBatch = (RMRate + checkForNull(getValues('RMTotal'))) * GrossWeight;
          const ScrapRate = (tempData.ScrapRate * (GrossWeight - FinishWeight))
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
            ScrapRecoveryPercentage: 0
          }
          tempArr = Object.assign([...gridData], { [index]: tempData })
        }
        dispatch(setRMCutOff({ IsCutOffApplicable: tempData.IsCutOffApplicable, CutOffRMC: CutOffRMC }))
        setGridData(tempArr)
        setValue(`${rmGridFields}.${index}.GrossWeight`, grossValue)     //COMMENT
        setValue(`${rmGridFields}.${index}.FinishWeight`, 0)
        setValue(`${rmGridFields}.${index}.ScrapRecoveryPercentage`, 0)
        Toaster.warning('Gross Weight should not be less than Finish Weight')
      }
    }
  }

  /**
   * @method handleFinishWeightChange
   * @description HANDLE FINISH WEIGHT CHANGE
   */
  const handleFinishWeightChange = (event, index) => {
    let tempArr = []
    let tempData = gridData[index]
    setEditCalculation(false)

    let finishValue = event

    if (checkForNull(finishValue) <= 0) {
      // const FinishWeight = checkForNull(finishValue);
      const FinishWeight = 0;
      const GrossWeight = tempData.GrossWeight !== undefined ? checkForNull(tempData.GrossWeight) : 0;
      // let scrapWeight = checkForNull(GrossWeight - FinishWeight);
      let scrapWeight = 0;
      // ternary condition
      const ScrapCost = FinishWeight !== 0 ? scrapWeight * checkForNull(tempData.ScrapRate) : 0;
      const CutOffRMC = tempData.IsCutOffApplicable ? (GrossWeight * checkForNull(tempData.CutOffPrice)) - ScrapCost : 0;
      if (tempData.IsCutOffApplicable && checkCutOffNegative(CutOffRMC, index)) {
        return false
      }
      const NetLandedCost = (GrossWeight * tempData.RMRate) - ScrapCost;
      tempData = {
        ...tempData,
        FinishWeight: FinishWeight ? FinishWeight : 0,
        NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost,
        WeightCalculatorRequest: {},
        WeightCalculationId: "00000000-0000-0000-0000-000000000000",
        IsCalculatedEntry: false,
        CutOffRMC: CutOffRMC,
        ScrapWeight: scrapWeight,
        ScrapRecoveryPercentage: 0,
      }
      tempArr = Object.assign([...gridData], { [index]: tempData })

      if (IsApplyMasterBatch) {

        const RMRate = calculatePercentageValue(tempData.RMRate, (100 - getValues('MBPercentage')));
        const RMRatePlusMasterBatch = (RMRate + checkForNull(getValues('RMTotal'))) * GrossWeight;
        const ScrapRate = (tempData.ScrapRate * scrapWeight)
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
          ScrapRecoveryPercentage: 0,
        }
        tempArr = Object.assign([...gridData], { [index]: tempData })
      }
      dispatch(setRMCutOff({ IsCutOffApplicable: tempData.IsCutOffApplicable, CutOffRMC: CutOffRMC }))
      setGridData(tempArr)
      setValue(`${rmGridFields}.${index}.FinishWeight`, FinishWeight)
      setValue(`${rmGridFields}.${index}.ScrapRecoveryPercentage`, 0)
      //Toaster.warning('Please enter valid weight.')

    } else {
      let FinishWeight = checkForNull(finishValue);
      const GrossWeight = tempData.GrossWeight !== undefined ? checkForNull(tempData.GrossWeight) : 0;

      if (IsFinishWeightValid(GrossWeight, FinishWeight)) {

        let scrapWeight = checkForNull(GrossWeight - FinishWeight);
        // Recovered scrap weight calculate
        let recoveredScrapWeight;
        if (isScrapRecoveryPercentageApplied && tempData.ScrapRecoveryPercentage !== undefined && tempData.ScrapRecoveryPercentage !== 0) {
          const ScrapRecoveryPercentage = checkForNull(tempData.ScrapRecoveryPercentage);
          recoveredScrapWeight = scrapWeight * calculatePercentage(ScrapRecoveryPercentage);
          scrapWeight = recoveredScrapWeight
        }

        // ternary condition
        const ScrapCost = FinishWeight !== 0 ? scrapWeight * checkForNull(tempData.ScrapRate) : 0;
        const CutOffRMC = tempData.IsCutOffApplicable ? ((GrossWeight * checkForNull(tempData.CutOffPrice)) - ScrapCost) : 0;
        if (tempData.IsCutOffApplicable && checkCutOffNegative(CutOffRMC, index)) {
          return false
        }
        const NetLandedCost = (GrossWeight * tempData.RMRate) - ScrapCost;

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

          const RMRate = calculatePercentageValue(tempData.RMRate, (100 - getValues('MBPercentage')));
          const RMRatePlusMasterBatch = (RMRate + checkForNull(getValues('RMTotal'))) * GrossWeight;
          const ScrapRate = (tempData.ScrapRate * scrapWeight)
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
        dispatch(setRMCutOff({ IsCutOffApplicable: tempData.IsCutOffApplicable, CutOffRMC: CutOffRMC }))
        setGridData(tempArr)
        setValue(`${rmGridFields}.${index}.FinishWeight`, FinishWeight)

      } else {

        FinishWeight = 0           //Finish weight will be zero when Finish weight > Gross Weight

        // let scrapWeight = checkForNull(GrossWeight - FinishWeight);

        let scrapWeight = 0;

        const ScrapCost = FinishWeight !== 0 ? scrapWeight * tempData.ScrapRate : 0;
        const CutOffRMC = tempData.IsCutOffApplicable ? (GrossWeight * checkForNull(tempData.CutOffPrice)) - ScrapCost : 0;
        if (tempData.IsCutOffApplicable && checkCutOffNegative(CutOffRMC, index)) {
          return false
        }
        const NetLandedCost = (GrossWeight * tempData.RMRate) - 0;

        tempData = {
          ...tempData,
          FinishWeight: 0,
          NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost,
          WeightCalculatorRequest: {},
          CutOffRMC: CutOffRMC,
          ScrapWeight: scrapWeight,
          ScrapRecoveryPercentage: 0,
        }
        tempArr = Object.assign([...gridData], { [index]: tempData })

        if (IsApplyMasterBatch) {

          const RMRate = calculatePercentageValue(tempData.RMRate, (100 - getValues('MBPercentage')));
          const RMRatePlusMasterBatch = (RMRate + checkForNull(getValues('RMTotal'))) * GrossWeight;
          const ScrapRate = (tempData.ScrapRate * (GrossWeight - FinishWeight))
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
            ScrapRecoveryPercentage: 0,
          }
          tempArr = Object.assign([...gridData], { [index]: tempData })
        }
        dispatch(setRMCutOff({ IsCutOffApplicable: tempData.IsCutOffApplicable, CutOffRMC: CutOffRMC }))
        setGridData(tempArr)
        Toaster.warning('Finish weight should not be greater then gross weight.')
        setTimeout(() => {
          setValue(`${rmGridFields}.${index}.FinishWeight`, 0)
          setValue(`${rmGridFields}.${index}.ScrapRecoveryPercentage`, 0)

        }, 200)

      }
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
    if (checkForNull(event.target.value) > 0) {
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

    // GROSS WEIGHT WILL ALWAYS BE KG ON THIS TAB, SO CONVERTING OTHER UNIT INTO KG
    if (Object.keys(weightData).length > 0) {
      if (costData?.TechnologyId === SHEETMETAL && weightData.UOMForDimension === DISPLAY_G) {
        grossWeight = weightData.GrossWeight / 1000
        finishWeight = weightData.FinishWeight / 1000
        netLandedCost = weightData.RawMaterialCost / 1000
      } else if (costData?.TechnologyId === SHEETMETAL && weightData.UOMForDimension === DISPLAY_KG) {
        grossWeight = weightData.GrossWeight
        finishWeight = weightData.FinishWeight
        netLandedCost = weightData.RawMaterialCost

      } else if (costData?.TechnologyId === SHEETMETAL && weightData.UOMForDimension === DISPLAY_MG) {
        grossWeight = weightData.GrossWeight / 1000000
        finishWeight = weightData.FinishWeight / 1000000
        netLandedCost = weightData.RawMaterialCost / 1000000

      } else {
        grossWeight = weightData.GrossWeight
        finishWeight = weightData.FinishWeight
        netLandedCost = weightData.RawMaterialCost
      }


      const FinishWeight = finishWeight
      const GrossWeight = grossWeight
      const RecoveryPercentage = weightData.RecoveryPercentage
      const scrapWeight = weightData.ScrapWeight ? weightData.ScrapWeight : checkForNull(GrossWeight - FinishWeight)
      const ScrapCost = FinishWeight !== 0 ? scrapWeight * checkForNull(tempData.ScrapRate) : 0;
      const CutOffRMC = tempData.IsCutOffApplicable ? (GrossWeight * checkForNull(tempData.CutOffPrice)) - ScrapCost : 0;
      tempData = {
        ...tempData,
        FinishWeight: FinishWeight ? FinishWeight : 0,
        GrossWeight: GrossWeight ? GrossWeight : 0,
        NetLandedCost: netLandedCost,
        WeightCalculatorRequest: weightData,
        WeightCalculationId: weightData.WeightCalculationId,
        RawMaterialCalculatorId: weightData.WeightCalculationId,
        IsCalculatedEntry: true,
        CutOffRMC: CutOffRMC,
        ScrapRecoveryPercentage: RecoveryPercentage,
        BurningLossWeight: weightData.BurningValue,
        ScrapWeight: scrapWeight
      }
      tempArr = Object.assign([...gridData], { [editIndex]: tempData })
      setTimeout(() => {

        setValue(`${rmGridFields}.${editIndex}.GrossWeight`, checkForDecimalAndNull(GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue(`${rmGridFields}.${editIndex}.FinishWeight`, checkForDecimalAndNull(FinishWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue(`${rmGridFields}.${editIndex}.ScrapRecoveryPercentage`, checkForDecimalAndNull(RecoveryPercentage, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue(`${rmGridFields}.${editIndex}.BurningLossWeight`, checkForDecimalAndNull(weightData.BurningValue, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue(`${rmGridFields}.${editIndex}.ScrapWeight`, checkForDecimalAndNull(scrapWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        dispatch(setRMCCErrors({})) //USED FOR ERROR HANDLING
        counter = 0 //USED FOR ERROR HANDLING 
      }, 400)
      setGridData(tempArr)

      if (Number(costData?.TechnologyId) === Number(Ferrous_Casting)) {

        gridData && gridData.map((item, index) => {
          item.FinishWeight = weightData.CostingFerrousCalculationRawMaterials[index].FinishWeight ? weightData.CostingFerrousCalculationRawMaterials[index].FinishWeight : 0
          item.GrossWeight = weightData.CostingFerrousCalculationRawMaterials[index].GrossWeight ? weightData.CostingFerrousCalculationRawMaterials[index].GrossWeight : 0
          item.NetLandedCost = weightData.RawMaterialCost
          item.WeightCalculatorRequest = weightData
          item.WeightCalculationId = weightData.WeightCalculationId
          item.RawMaterialCalculatorId = weightData.WeightCalculationId
          item.IsCalculatedEntry = true
          item.IsCalculaterAvailable = true
          item.CutOffRMC = CutOffRMC
          item.ScrapRecoveryPercentage = RecoveryPercentage
          item.ScrapWeight = weightData?.CostingFerrousCalculationRawMaterials[index]?.ScrapWeight ? weightData?.CostingFerrousCalculationRawMaterials[index]?.ScrapWeight : 0
          item.Percentage = weightData.CostingFerrousCalculationRawMaterials[index].Percentage
          return item
        })
        setTimeout(() => {
          setGridData(gridData)
          gridData && gridData.map((item, index) => {
            setValue(`${rmGridFields}.${index}.GrossWeight`, checkForDecimalAndNull((weightData.CostingFerrousCalculationRawMaterials[index].GrossWeight), getConfigurationKey().NoOfDecimalForInputOutput))
            setValue(`${rmGridFields}.${index}.FinishWeight`, checkForDecimalAndNull(weightData.CostingFerrousCalculationRawMaterials[index].FinishWeight, getConfigurationKey().NoOfDecimalForInputOutput))
            setValue(`${rmGridFields}.${index}.ScrapRecoveryPercentage`, checkForDecimalAndNull(RecoveryPercentage, getConfigurationKey().NoOfDecimalForInputOutput))
            // setValue(`${rmGridFields}.${index}.NetRMCost`, checkForDecimalAndNull(NetRMCost, getConfigurationKey().NoOfDecimalForInputOutput))
            setValue(`${rmGridFields}.${index}.ScrapWeight`, checkForDecimalAndNull((weightData?.CostingFerrousCalculationRawMaterials[index]?.ScrapWeight), getConfigurationKey().NoOfDecimalForInputOutput))

            return null
          })
        }, 500)
      }
    }
  }

  /**
  * @method selectedIds
  * @description SELECTED IDS
  */
  const selectedIds = (tempArr) => {
    tempArr && tempArr.map(el => {
      if (Ids.includes(el.RawMaterialId) === false) {
        let selectedIds = Ids;
        selectedIds.push(el.RawMaterialId)
        setIds(selectedIds)
      }
      return null;
    })
  }

  const deleteItem = (index) => {
    setMasterBatch(false)
    let tempArr = gridData && gridData.filter((el, i) => {
      if (i === index) return false;
      return true;
    })

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
    var button = document.getElementById(`popUpTrigger${index}`)
    button.click()
  }

  const onRemarkPopUpClose = (index) => {
    var button = document.getElementById(`popUpTrigger${index}`)
    setValue(`${rmGridFields}.${index}.remarkPopUp`, gridData[index].Remark)
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
  if (Object.keys(errors).length > 0 && counter < 2) {
    dispatch(setRMCCErrors(errors))
    counter++;
  } else if (Object.keys(errors).length === 0 && counter > 0) {
    dispatch(setRMCCErrors({}))
    counter = 0
  }

  const isShowAddBtn = () => {
    let isShow = false;

    if (gridData.length <= gridLength) {
      isShow = true;
    }

    if (costData && (isMultipleRMAllow(costData?.TechnologyId))) {
      isShow = true;
    }
    return isShow;
  }
  const onPopupConfirm = () => {
    dispatch(setFerrousCalculatorReset(true))
    setConfirmPopup(true)
    gridData.map((item, index) => {
      item.NetLandedCost = ''
      item.ScrapWeight = ''
      setValue(`${rmGridFields}.${index}.GrossWeight`, '')     //COMMENT
      setValue(`${rmGridFields}.${index}.FinishWeight`, '')
      return item
    })
    setGridData(gridData)
    gridData && gridData.map((index) => {
      setValue(`${rmGridFields}.${index}.FinishWeight`, '')
      setValue(`${rmGridFields}.${index}.GrossWeight`, '')     //COMMENT
      return null
    })
    // setGridData(gridData)
    setDrawerOpen(true)
    setShowPopup(false)

  }
  const closePopUp = () => {
    setShowPopup(false)
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
              <div className="left-border">{'Raw Material Cost:'}</div>
            </Col>
            <Col md={'6'} className="btn-container">
              {!CostingViewMode && !IsLocked && gridData && isShowAddBtn() &&
                <button
                  type="button"
                  className={'user-btn'}
                  onClick={DrawerToggle}
                  disabled={IsApplyMasterBatch}
                >
                  <div className={'plus'}></div>RM
                </button>
              }
              {((costData?.TechnologyId === Ferrous_Casting) && gridData.length !== 0) && <button
                className="secondary-btn"
                type={'button'}
                onClick={() => toggleWeightCalculator(0)}
                disabled={CostingViewMode ? item?.RawMaterialCalculatorId === null ? true : false : false}><div className='CalculatorIcon cr-cl-icon '></div>Weight Calculator</button>}


            </Col>
          </Row>
          <form noValidate className="form" onSubmit={handleSubmit(onSubmit)}>
            <Row>
              {/*RAW MATERIAL COST GRID */}

              <Col md="12">
                <Table className="table cr-brdr-main costing-raw-material-section" size="sm">
                  <thead className='rm-table-header'>
                    <tr>
                      <th className='rm-name-head'>{`RM Name`}</th>
                      <th>{`RM Rate`}</th>
                      <th>{`Scrap Rate`}</th>
                      <th>{`UOM`}</th>
                      {getTechnology.includes(costData?.TechnologyId) && <th className="text-center weight-calculator">{`Weight Calculator`}</th>}
                      <th>{`Gross Weight`}</th>
                      <th>{`Finish Weight`}</th>
                      {(costData?.TechnologyId === Ferrous_Casting) && <th>Percentage</th>}
                      {isScrapRecoveryPercentageApplied && <th className='scrap-recovery'>{`Scrap Recovery(%)`}</th>}
                      {costData?.TechnologyId === PLASTIC && <th>{'Burning Loss Weight'}</th>}
                      <th>{`Scrap Weight`}</th>
                      {/* //Add i here for MB+ */}
                      <th>{`Net RM Cost ${isRMDivisorApplicable(costData.TechnologyName) ? '/(' + RMDivisor + ')' : ''}`}</th>
                      <th style={{ textAlign: "right" }}>{`Action`}</th>
                    </tr>
                  </thead>
                  <tbody className='rm-table-body'>
                    {gridData &&
                      gridData.map((item, index) => {
                        return (
                          <tr key={index} className=''>
                            <td className='text-overflow'><span title={item.RMName}>{item.RMName}</span></td>
                            <td>{item.RMRate}</td>
                            <td>{item.ScrapRate}</td>
                            <td>{item.UOM}</td>
                            {
                              getTechnology.includes(costData?.TechnologyId) &&
                              <td className="text-center">
                                <button
                                  className="CalculatorIcon cr-cl-icon "
                                  type={'button'}
                                  onClick={() => toggleWeightCalculator(index)}
                                  disabled={CostingViewMode ? item?.RawMaterialCalculatorId === null ? true : false : false}
                                />
                              </td>
                            }
                            <td>
                              <NumberFieldHookForm
                                label=""
                                name={`${rmGridFields}.${index}.GrossWeight`}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                rules={{
                                  required: true,
                                  pattern: {
                                    value: /^\s*-?[0-9]{1,18}\s*$/,
                                    message: 'Maximum length for decimal is 18.',
                                  },
                                }}
                                defaultValue={item.GrossWeight}
                                className=""
                                customClassName={'withBorder'}
                                handleChange={(e) => {
                                  e.preventDefault()
                                  handleGrossWeightChange(e?.target?.value, index)
                                }}
                                errors={errors && errors.rmGridFields && errors.rmGridFields[index] !== undefined ? errors.rmGridFields[index].GrossWeight : ''}
                                disabled={(CostingViewMode || IsLocked) ? true : false}
                              />
                            </td>
                            <td>
                              <NumberFieldHookForm
                                label=""
                                name={`${rmGridFields}.${index}.FinishWeight`}
                                Controller={Controller}
                                control={control}
                                register={register}
                                mandatory={false}
                                rules={{
                                  required: true,
                                  pattern: {
                                    value: /^\s*-?[0-9]{1,18}\s*$/,
                                    message: 'Maximum length for decimal is 18.',
                                  },
                                }}
                                defaultValue={item.FinishWeight}
                                className=""
                                customClassName={'withBorder'}
                                handleChange={(e) => {
                                  e.preventDefault()
                                  handleFinishWeightChange(e?.target?.value, index)
                                }}
                                errors={errors && errors.rmGridFields && errors.rmGridFields[index] !== undefined ? errors.rmGridFields[index].FinishWeight : ''}
                                disabled={(CostingViewMode || IsLocked || (initialConfiguration?.IsCopyCostingFinishAndGrossWeightEditable && item?.IsRMCopied)) ? true : false}
                              />
                            </td>

                            {
                              costData?.TechnologyId === PLASTIC && <td>{checkForDecimalAndNull(item.BurningLossWeight, initialConfiguration.NoOfDecimalForInputOutput)}</td>
                            }
                            {
                              isScrapRecoveryPercentageApplied &&
                              <td>
                                <NumberFieldHookForm
                                  label=""
                                  name={`${rmGridFields}.${index}.ScrapRecoveryPercentage`}
                                  Controller={Controller}
                                  control={control}
                                  register={register}
                                  mandatory={false}
                                  rules={{
                                    required: true,
                                    pattern: {
                                      value: /^\d*\.?\d*$/,
                                      message: 'Invalid Number.',
                                    },
                                    max: {
                                      value: 100,
                                      message: 'Percentage should be less than 100'
                                    },
                                  }}
                                  defaultValue={item.ScrapRecoveryPercentage}
                                  className=""
                                  customClassName={'withBorder scrap-recovery'}
                                  handleChange={(e) => {
                                    e.preventDefault()
                                    handleScrapRecoveryChange(e, index)
                                  }}
                                  errors={errors && errors.rmGridFields && errors.rmGridFields[index] !== undefined ? errors.rmGridFields[index].ScrapRecoveryPercentage : ''}
                                  disabled={CostingViewMode || IsLocked || (gridData[index].FinishWeight === 0) || (gridData[index].FinishWeight === "") || (gridData[index].FinishWeight === null) || (gridData[index].FinishWeight === undefined) ? true : false}
                                />
                              </td>
                            }
                            <td>{checkForDecimalAndNull(item.ScrapWeight, initialConfiguration.NoOfDecimalForPrice)}</td>
                            {costData?.TechnologyId === 6 && <td>{checkForDecimalAndNull(item.Percentage, initialConfiguration.NoOfDecimalForPrice)}</td>}
                            <td>
                              {item?.NetLandedCost !== undefined ? checkForDecimalAndNull(item.NetLandedCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                            </td>
                            <td>

                              <div className='action-btn-wrapper'>
                                {!CostingViewMode && !IsLocked && !(initialConfiguration?.IsCopyCostingFinishAndGrossWeightEditable && item?.IsRMCopied) && < button
                                  className="Delete "
                                  type={'button'}
                                  onClick={() => deleteItem(index)}
                                />}
                                <Popup className='rm-popup' trigger={<button id={`popUpTrigger${index}`} className="Comment-box" type={'button'} />}
                                  position="top center">
                                  <TextAreaHookForm
                                    label="Remark:"
                                    name={`${rmGridFields}.${index}.remarkPopUp`}
                                    Controller={Controller}
                                    control={control}
                                    register={register}
                                    mandatory={false}
                                    rules={{
                                      maxLength: {
                                        value: 75,
                                        message: "Remark should be less than 75 word"
                                      },
                                    }}
                                    handleChange={(e) => { }}
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
                              </div>
                            </td>
                          </tr>
                        )
                      })
                    }
                    {gridData && gridData.length === 0 &&
                      <tr>
                        <td colSpan={11}>
                          <NoContentFound title={EMPTY_DATA} />
                        </td>
                      </tr>
                    }
                  </tbody>
                </Table>
              </Col>
            </Row>

            <Row>
              {/* IF THERE IS NEED TO APPLY FOR MULTIPLE TECHNOLOGY, CAN MODIFIED BELOW CONDITION */}
              {costData?.TechnologyId === PLASTIC &&
                <Col md="2" className="py-3 pr-1 mb-width">
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
                  <TooltipCustom customClass="float-none ml-n3 " tooltipText="Can only be added with 1 RM" />
                </Col>
              }

              {/* IF THERE IS NEED TO APPLY FOR MULTIPLE TECHNOLOGY, CAN MODIFIED BELOW CONDITION */}
              {IsApplyMasterBatch && costData?.TechnologyId === PLASTIC &&
                <>
                  <div>
                    <button onClick={MasterBatchToggle} title={'Add Master Batch'} disabled={(CostingViewMode || IsLocked || masterBatch)} type="button" class="user-btn mt30"><div class="plus"></div>Add Master Batch</button>
                  </div>
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
                      rules={{}}
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
                      rules={{}}
                      handleChange={() => { }}
                      defaultValue={""}
                      className=""
                      customClassName={'withBorder'}
                      errors={errors.MBPrice}
                      disabled={true}
                    />
                  </Col>
                  <Col md="2">
                    <NumberFieldHookForm
                      label="Percentage"
                      name={`MBPercentage`}
                      Controller={Controller}
                      control={control}
                      register={register}
                      mandatory={false}
                      rules={{
                        //required: true,
                        pattern: {
                          value: /^\d*\.?\d*$/,
                          message: 'Invalid Number.'
                        },
                        max: {
                          value: 100,
                          message: 'Percentage cannot be greater than 100'
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
                </>}
            </Row>

            {
              showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`If you add New RM all the calculations will be reset`} />
            }
          </form>
        </div>
      </div>
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
          />
        )
      }
    </>
  )
}

export default RawMaterialCost
