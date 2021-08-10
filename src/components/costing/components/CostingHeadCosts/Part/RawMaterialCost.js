import React, { useState, useContext, useEffect, } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { Col, Row, Table } from 'reactstrap'
import AddRM from '../../Drawers/AddRM'
import { costingInfoContext } from '../../CostingDetailStepTwo'
import NoContentFound from '../../../../common/NoContentFound'
import { useDispatch, useSelector } from 'react-redux'
import { CONSTANT } from '../../../../../helper/AllConastant'
import { NumberFieldHookForm, TextFieldHookForm, } from '../../../../layout/HookFormInputs'
import { toastr } from 'react-redux-toastr'
import { calculatePercentage, calculatePercentageValue, checkForDecimalAndNull, checkForNull, CheckIsCostingDateSelected, getConfigurationKey, isRMDivisorApplicable } from '../../../../../helper'
import OpenWeightCalculator from '../../WeightCalculatorDrawer'
import { getRawMaterialCalculationByTechnology, } from '../../../actions/CostWorking'
import { ViewCostingContext } from '../../CostingDetails'
import { EMPTY_GUID, G, KG, MG, PLASTIC } from '../../../../../config/constants'
import { gridDataAdded, setRMCCErrors, setRMCutOff } from '../../../actions/Costing'
import { getTechnology, technologyForDensity } from '../../../../../config/masterData'
import TooltipCustom from '../../../../common/Tooltip'

let counter = 0;
function RawMaterialCost(props) {
  const { item } = props;
  const { register, handleSubmit, control, setValue, getValues, formState: { errors }, reset, setError } = useForm({
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      MBName: item?.CostingPartDetails?.MasterBatchRMName,
      MBPrice: item?.CostingPartDetails?.MasterBatchRMPrice,
      MBPercentage: item?.CostingPartDetails?.MasterBatchPercentage,
      RMTotal: item?.CostingPartDetails?.MasterBatchTotal,
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

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { CostingEffectiveDate } = useSelector(state => state.costing)

  const RMDivisor = (item?.CostingPartDetails?.RMDivisor !== null) ? item?.CostingPartDetails?.RMDivisor : 0;

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

      if (!CostingViewMode) {
        props.setRMCost(gridData, Params)
      }
      selectedIds(gridData)

      if (Object.keys(gridData).length > 0 && gridData[0].IsCutOffApplicable) {
        dispatch(setRMCutOff({ IsCutOffApplicable: gridData[0].IsCutOffApplicable, CutOffRMC: gridData[0].CutOffRMC }))
      }

    }, 100)
  }, [gridData]);

  /**
   * @method DrawerToggle
   * @description TOGGLE DRAWER
   */
  const DrawerToggle = () => {
    if (CheckIsCostingDateSelected(CostingEffectiveDate)) return false;
    setDrawerOpen(true)
  }

  /**
   * @method closeDrawer
   * @description HIDE RM DRAWER
   */
  const closeDrawer = (e = '', rowData = {}) => {
    if (Object.keys(rowData).length > 0 && IsApplyMasterBatch === false) {

      if (costData.TechnologyName === PLASTIC) {
        let rowArray = rowData && rowData.map(el => {
          return {
            RMName: `${el.RawMaterial} - ${el.RMGrade}`,
            RMRate: el.Currency === '-' ? el.NetLandedCost : el.NetLandedCostConversion,
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
        selectedIds([...gridData, ...rowArray])
      } else {
        let tempObj = {
          RMName: `${rowData.RawMaterial} - ${rowData.RMGrade}`,
          RMRate: rowData.Currency === '-' ? rowData.NetLandedCost : rowData.NetLandedCostConversion,
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
      }
      dispatch(gridDataAdded(true))

    }

    if (rowData && rowData.length > 0 && IsApplyMasterBatch) {
      setValue('MBName', rowData && rowData[0].RawMaterial !== undefined ? rowData[0].RawMaterial : '')
      setValue('MBPrice', rowData && rowData[0].Currency === '-' ? rowData[0].NetLandedCost : rowData[0].NetLandedCostConversion)
    }
    setDrawerOpen(false)
  }

  /**
   * @method toggleWeightCalculator
   * @description TOGGLE WEIGHT CALCULATOR DRAWER
   */
  const toggleWeightCalculator = (index) => {
    setEditIndex(index)
    let tempArr = []
    let tempData = gridData[index]

    if (technologyForDensity.includes(costData.ETechnologyType)) {
      if ((tempData.Density === undefined && tempData.Density === null && tempData.Density === "") || Number(tempData.Density) === 0) {
        toastr.warning("This Material's density is not available for weight calculation. Please add density for this material in RM Master > Manage Material.")
        return false
      }
    }
    dispatch(getRawMaterialCalculationByTechnology(costData.CostingId, tempData.RawMaterialId, tempData.WeightCalculationId, costData.TechnologyId, res => {
      // if (res && res.data && res.data.Data) {
      const data = res && res.data && res.data.Data ? res.data.Data : {}
      tempData = { ...tempData, WeightCalculatorRequest: data, }
      tempArr = Object.assign([...gridData], { [index]: tempData })
      setTimeout(() => {
        setGridData(tempArr)
        setWeightDrawerOpen(true)
      }, 100)
      // }
    }))
    // setWeightDrawerOpen(true)
  }

  /**
   * @method closeWeightDrawer
   * @description HIDE WEIGHT CALCULATOR DRAWER
   */
  const closeWeightDrawer = (e = '', weightData = {}, originalWeight = {}) => {
    setInputDiameter(weightData.Diameter)
    setWeight(weightData, originalWeight)
    setWeightDrawerOpen(false)
  }

  /**
   * @method handleGrossWeightChange
   * @description HANDLE GROSS WEIGHT CHANGE
   */
  const handleGrossWeightChange = (event, index) => {
    let tempArr = []
    let tempData = gridData[index]

    if (checkForNull(event.target.value) >= 0) {

      if (IsFinishWeightValid(event.target.value, tempData.FinishWeight)) {
        const GrossWeight = checkForNull(event.target.value)
        const FinishWeight = tempData.FinishWeight !== undefined ? tempData.FinishWeight : 0

        const scrapWeight = checkForNull(GrossWeight - FinishWeight);

        // const ApplicableFinishWeight = (checkForNull(tempData.FinishWeight) !== 0) ? scrapWeight * tempData.ScrapRate : 0;
        const ScrapCost = (checkForNull(tempData.FinishWeight) !== 0) ? scrapWeight * tempData.ScrapRate : 0;
        const NetLandedCost = (GrossWeight * tempData.RMRate) - ScrapCost;
        const CutOffRMC = tempData.IsCutOffApplicable ? (GrossWeight * checkForNull(tempData.CutOffPrice)) - ScrapCost : 0;
        tempData = {
          ...tempData,
          GrossWeight: GrossWeight,
          NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost,
          WeightCalculatorRequest: {},
          WeightCalculationId: "00000000-0000-0000-0000-000000000000",
          IsCalculatedEntry: false,
          CutOffRMC: CutOffRMC,
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
            GrossWeight: GrossWeight,
            NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost,
            WeightCalculatorRequest: {},
            WeightCalculationId: "00000000-0000-0000-0000-000000000000",
            IsCalculatedEntry: false,
            CutOffRMC: CutOffRMC,
          }
          tempArr = Object.assign([...gridData], { [index]: tempData })
        }
        dispatch(setRMCutOff({ IsCutOffApplicable: tempData.IsCutOffApplicable, CutOffRMC: CutOffRMC }))
        setGridData(tempArr)
        setValue(`${rmGridFields}.${index}.GrossWeight`, event.target.value)
        setValue(`${rmGridFields}.${index}.FinishWeight`, checkForNull(tempData.FinishWeight))
      } else {
        const GrossWeight = checkForNull(event.target.value)
        const FinishWeight = tempData.FinishWeight !== undefined ? tempData.FinishWeight : 0

        const scrapWeight = checkForNull(GrossWeight - FinishWeight);
        const ScrapCost = (checkForNull(tempData.FinishWeight) !== 0) ? scrapWeight * tempData.ScrapRate : 0;
        const CutOffRMC = tempData.IsCutOffApplicable ? (GrossWeight * checkForNull(tempData.CutOffPrice)) - ScrapCost : 0;

        const ApplicableFinishWeight = 0;
        const NetLandedCost = (GrossWeight * tempData.RMRate) - ApplicableFinishWeight;
        tempData = {
          ...tempData,
          GrossWeight: GrossWeight,
          FinishWeight: 0,
          NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost,
          WeightCalculatorRequest: {},
          WeightCalculationId: "00000000-0000-0000-0000-000000000000",
          IsCalculatedEntry: false,
          CutOffRMC: CutOffRMC,
        }
        tempArr = Object.assign([...gridData], { [index]: tempData })

        if (IsApplyMasterBatch) {

          const RMRate = calculatePercentageValue(tempData.RMRate, (100 - getValues('MBPercentage')));
          const RMRatePlusMasterBatch = (RMRate + checkForNull(getValues('RMTotal'))) * GrossWeight;
          const ScrapRate = (tempData.ScrapRate * (GrossWeight - FinishWeight))
          const NetLandedCost = RMRatePlusMasterBatch - ScrapRate;

          tempData = {
            ...tempData,
            GrossWeight: GrossWeight,
            NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost,
            WeightCalculatorRequest: {},
            WeightCalculationId: "00000000-0000-0000-0000-000000000000",
            IsCalculatedEntry: false,
            CutOffRMC: CutOffRMC,
          }
          tempArr = Object.assign([...gridData], { [index]: tempData })
        }
        dispatch(setRMCutOff({ IsCutOffApplicable: tempData.IsCutOffApplicable, CutOffRMC: CutOffRMC }))
        setGridData(tempArr)
        setValue(`${rmGridFields}.${index}.GrossWeight`, event.target.value)
        setValue(`${rmGridFields}.${index}.FinishWeight`, 0)
        toastr.warning('Gross Weight should not be less than Finish Weight')
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

    if (checkForNull(event.target.value) <= 0) {

      const FinishWeight = checkForNull(event.target.value);
      const GrossWeight = tempData.GrossWeight !== undefined ? checkForNull(tempData.GrossWeight) : 0;

      const scrapWeight = checkForNull(GrossWeight - FinishWeight);
      const ScrapCost = FinishWeight !== 0 ? scrapWeight * checkForNull(tempData.ScrapRate) : 0;
      const CutOffRMC = tempData.IsCutOffApplicable ? (GrossWeight * checkForNull(tempData.CutOffPrice)) - ScrapCost : 0;

      const NetLandedCost = (GrossWeight * tempData.RMRate) - ScrapCost;
      tempData = {
        ...tempData,
        FinishWeight: FinishWeight,
        NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost,
        WeightCalculatorRequest: {},
        WeightCalculationId: "00000000-0000-0000-0000-000000000000",
        IsCalculatedEntry: false,
        CutOffRMC: CutOffRMC,
      }
      tempArr = Object.assign([...gridData], { [index]: tempData })

      if (IsApplyMasterBatch) {

        const RMRate = calculatePercentageValue(tempData.RMRate, (100 - getValues('MBPercentage')));
        const RMRatePlusMasterBatch = (RMRate + checkForNull(getValues('RMTotal'))) * GrossWeight;
        const ScrapRate = (tempData.ScrapRate * scrapWeight)
        const NetLandedCost = RMRatePlusMasterBatch - ScrapRate;

        tempData = {
          ...tempData,
          GrossWeight: GrossWeight,
          NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost,
          WeightCalculatorRequest: {},
          WeightCalculationId: "00000000-0000-0000-0000-000000000000",
          IsCalculatedEntry: false,
          CutOffRMC: CutOffRMC,
        }
        tempArr = Object.assign([...gridData], { [index]: tempData })
      }
      dispatch(setRMCutOff({ IsCutOffApplicable: tempData.IsCutOffApplicable, CutOffRMC: CutOffRMC }))
      setGridData(tempArr)
      setValue(`${rmGridFields}.${index}.FinishWeight`, FinishWeight)
      //toastr.warning('Please enter valid weight.')

    } else {
      const FinishWeight = checkForNull(event.target.value);
      const GrossWeight = tempData.GrossWeight !== undefined ? checkForNull(tempData.GrossWeight) : 0;

      if (IsFinishWeightValid(GrossWeight, FinishWeight)) {

        const scrapWeight = checkForNull(GrossWeight - FinishWeight);
        const ScrapCost = FinishWeight !== 0 ? scrapWeight * checkForNull(tempData.ScrapRate) : 0;
        const CutOffRMC = tempData.IsCutOffApplicable ? ((GrossWeight * checkForNull(tempData.CutOffPrice)) - ScrapCost) : 0;

        const NetLandedCost = (GrossWeight * tempData.RMRate) - ScrapCost;

        tempData = {
          ...tempData,
          FinishWeight: FinishWeight,
          NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost,
          WeightCalculatorRequest: {},
          WeightCalculationId: "00000000-0000-0000-0000-000000000000",
          IsCalculatedEntry: false,
          CutOffRMC: CutOffRMC,
        }
        tempArr = Object.assign([...gridData], { [index]: tempData })

        if (IsApplyMasterBatch) {

          const RMRate = calculatePercentageValue(tempData.RMRate, (100 - getValues('MBPercentage')));
          const RMRatePlusMasterBatch = (RMRate + checkForNull(getValues('RMTotal'))) * GrossWeight;
          const ScrapRate = (tempData.ScrapRate * scrapWeight)
          const NetLandedCost = RMRatePlusMasterBatch - ScrapRate;

          tempData = {
            ...tempData,
            GrossWeight: GrossWeight,
            NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost,
            WeightCalculatorRequest: {},
            WeightCalculationId: "00000000-0000-0000-0000-000000000000",
            IsCalculatedEntry: false,
            CutOffRMC: CutOffRMC,
          }
          tempArr = Object.assign([...gridData], { [index]: tempData })
        }
        dispatch(setRMCutOff({ IsCutOffApplicable: tempData.IsCutOffApplicable, CutOffRMC: CutOffRMC }))
        setGridData(tempArr)
        setValue(`${rmGridFields}.${index}.FinishWeight`, FinishWeight)

      } else {

        const scrapWeight = checkForNull(GrossWeight - FinishWeight);
        const ScrapCost = FinishWeight !== 0 ? scrapWeight * tempData.ScrapRate : 0;
        const CutOffRMC = tempData.IsCutOffApplicable ? (GrossWeight * checkForNull(tempData.CutOffPrice)) - ScrapCost : 0;
        const NetLandedCost = (GrossWeight * tempData.RMRate) - 0;

        tempData = {
          ...tempData,
          FinishWeight: 0,
          NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost,
          WeightCalculatorRequest: {},
          CutOffRMC: CutOffRMC,
        }
        tempArr = Object.assign([...gridData], { [index]: tempData })

        if (IsApplyMasterBatch) {

          const RMRate = calculatePercentageValue(tempData.RMRate, (100 - getValues('MBPercentage')));
          const RMRatePlusMasterBatch = (RMRate + checkForNull(getValues('RMTotal'))) * GrossWeight;
          const ScrapRate = (tempData.ScrapRate * (GrossWeight - FinishWeight))
          const NetLandedCost = RMRatePlusMasterBatch - ScrapRate;

          tempData = {
            ...tempData,
            GrossWeight: GrossWeight,
            NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost,
            WeightCalculatorRequest: {},
            WeightCalculationId: "00000000-0000-0000-0000-000000000000",
            IsCalculatedEntry: false,
            CutOffRMC: CutOffRMC,
          }
          tempArr = Object.assign([...gridData], { [index]: tempData })
        }
        dispatch(setRMCutOff({ IsCutOffApplicable: tempData.IsCutOffApplicable, CutOffRMC: CutOffRMC }))
        setGridData(tempArr)
        toastr.warning('Finish weight should not be greater then gross weight.')
        setTimeout(() => {
          setValue(`${rmGridFields}.${index}.FinishWeight`, 0)
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

    if (checkForNull(event.target.value) > 0) {
      const ScrapRecoveryPercentage = checkForNull(event.target.value);

      const FinishWeight = checkForNull(tempData.FinishWeight);
      const GrossWeight = tempData.GrossWeight !== undefined ? checkForNull(tempData.GrossWeight) : 0;

      const scrapWeight = checkForNull(GrossWeight - FinishWeight);
      const recoveredScrapWeight = scrapWeight * calculatePercentage(ScrapRecoveryPercentage);
      const ScrapCost = FinishWeight !== 0 ? recoveredScrapWeight * checkForNull(tempData.ScrapRate) : 0;

      const NetLandedCost = (GrossWeight * tempData.RMRate) - ScrapCost;

      tempData = {
        ...tempData,
        ScrapRecoveryPercentage: ScrapRecoveryPercentage,
        IsScrapRecoveryPercentageApplied: true,
        NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost,
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

    if (Object.keys(weightData).length > 0) {
      if (weightData.UOMForDimension === G) {
        grossWeight = weightData.GrossWeight / 1000
        finishWeight = weightData.FinishWeight / 1000
      } else if (weightData.UOMForDimension === KG) {
        grossWeight = weightData.GrossWeight
        finishWeight = weightData.FinishWeight
      } else if (weightData.UOMForDimension === MG) {
        grossWeight = weightData.GrossWeight / 1000000
        finishWeight = weightData.FinishWeight / 1000000
      }
      const FinishWeight = finishWeight
      const GrossWeight = grossWeight
      const NetLandedCost = (GrossWeight * tempData.RMRate) - ((GrossWeight - FinishWeight) * tempData.ScrapRate);

      const scrapWeight = checkForNull(GrossWeight - FinishWeight);
      const ScrapCost = FinishWeight !== 0 ? scrapWeight * checkForNull(tempData.ScrapRate) : 0;
      const CutOffRMC = tempData.IsCutOffApplicable ? (GrossWeight * checkForNull(tempData.CutOffPrice)) - ScrapCost : 0;

      tempData = {
        ...tempData,
        FinishWeight: FinishWeight,
        GrossWeight: GrossWeight,
        NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost,
        WeightCalculatorRequest: weightData,
        WeightCalculationId: weightData.WeightCalculationId,
        IsCalculatedEntry: true,
        CutOffRMC: CutOffRMC,
      }

      tempArr = Object.assign([...gridData], { [editIndex]: tempData })
      setGridData(tempArr)
      setTimeout(() => {
        setValue(`${rmGridFields}.${editIndex}.GrossWeight`, checkForDecimalAndNull(GrossWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        setValue(`${rmGridFields}.${editIndex}.FinishWeight`, checkForDecimalAndNull(FinishWeight, getConfigurationKey().NoOfDecimalForInputOutput))
        dispatch(setRMCCErrors({})) //USED FOR ERROR HANDLING
        counter = 0 //USED FOR ERROR HANDLING
      }, 500)

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
    let tempArr = gridData && gridData.filter((el, i) => {
      if (i === index) return false;
      return true;
    })
    setGridData(tempArr)

    let selectedIds = []
    tempArr.map(el => { selectedIds.push(el.RawMaterialId) })
    setIds(selectedIds)

    setIsApplyMasterBatch(false)
  }

  /**
  * @method onPressApplyMasterBatch
  * @description ON PRESS APPLY MASTER BATCH
  */
  const onPressApplyMasterBatch = () => {
    setIsApplyMasterBatch(!IsApplyMasterBatch)
  }

  useEffect(() => {
    if (IsApplyMasterBatch === false && gridData && gridData.length > 0) {
      let tempArr = []
      let tempData = gridData[0]
      const GrossWeight = tempData?.GrossWeight !== undefined ? tempData.GrossWeight : 0
      const FinishWeight = tempData?.FinishWeight !== undefined ? tempData.FinishWeight : 0

      const ApplicableFinishWeight = (checkForNull(tempData?.FinishWeight) !== 0) ? (GrossWeight - FinishWeight) * tempData?.ScrapRate : 0;
      const NetLandedCost = (GrossWeight * tempData?.RMRate) - ApplicableFinishWeight;
      tempData = { ...tempData, NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost, }
      tempArr = Object.assign([...gridData], { [0]: tempData })
      setGridData(tempArr)
      setValue(`${rmGridFields}.${0}.GrossWeight`, GrossWeight)
      setValue(`${rmGridFields}.${0}.FinishWeight`, checkForNull(tempData?.FinishWeight))

      setTimeout(() => {

        const Params = {
          BOMLevel: props.item.BOMLevel,
          PartNumber: props.item.PartNumber,
        }
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
        if (!CostingViewMode) {
          props.setRMMasterBatchCost(tempArr, MasterBatchObj, Params)
        }
      }, 200)
    }
  }, [IsApplyMasterBatch])

  // THIS WILL CALLED WHEN RM REMOVED FROM GRID TO RESET MASTERBATCH DATA
  useEffect(() => {
    let tempArr = []
    if (gridData && gridData.length === 0) {
      const Params = {
        BOMLevel: props.item.BOMLevel,
        PartNumber: props.item.PartNumber,
      }
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
      if (!CostingViewMode) {
        props.setRMMasterBatchCost(tempArr, MasterBatchObj, Params)
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
    if (Number(value) && !isNaN(value)) {

      setValue('RMTotal', calculatePercentageValue(getValues('MBPrice'), value))

      const RMRate = calculatePercentageValue(tempData.RMRate, (100 - value));

      const RMRatePlusMasterBatch = (RMRate + checkForNull(getValues('RMTotal'))) * checkForNull(tempData.GrossWeight);

      const ScrapRate = (tempData.ScrapRate * (tempData.GrossWeight - tempData.FinishWeight))

      const NetLandedCost = RMRatePlusMasterBatch - ScrapRate;

      tempData = { ...tempData, NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost, }
      let tempArr = Object.assign([...gridData], { [0]: tempData })
      setGridData(tempArr)

      setTimeout(() => {

        const Params = {
          BOMLevel: props.item.BOMLevel,
          PartNumber: props.item.PartNumber,
        }

        const MasterBatchObj = {
          "MasterBatchRMId": tempArr[0].RawMaterialId,
          "IsApplyMasterBatch": IsApplyMasterBatch,
          "MasterBatchRMName": getValues('MBName'),
          "MasterBatchRMPrice": getValues('MBPrice'),
          "MasterBatchPercentage": checkForNull(value),
          "MasterBatchTotal": getValues('RMTotal'),
        }
        props.setRMMasterBatchCost(tempArr, MasterBatchObj, Params)
      }, 200)

    } else {

      const ApplicableFinishWeight = (tempData.FinishWeight !== 0) ? (tempData.GrossWeight - tempData.FinishWeight) * tempData.ScrapRate : 0;
      const NetLandedCost = (tempData.GrossWeight * tempData.RMRate) - ApplicableFinishWeight;
      tempData = { ...tempData, NetLandedCost: isRMDivisorApplicable(costData.TechnologyName) ? checkForDecimalAndNull(NetLandedCost / RMDivisor, initialConfiguration.NoOfDecimalForPrice) : NetLandedCost, }
      let tempArr = Object.assign([...gridData], { [0]: tempData })
      setValue('RMTotal', checkForNull(value))
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

    if (costData && costData.TechnologyName === PLASTIC) {
      isShow = true;
    }

    return isShow;

  }

  /**
   * @method onSubmit
   * @description Used to Submit the form
   */
  const onSubmit = (values) => { }

  // const rmGridFields = 'rmGridFields'

  /**
   * @method render
   * @description Renders the component
   */
  return (
    <>
      <div className="user-page p-0">
        <div>
          <Row className="align-items-center">
            <Col md="10">
              <div className="left-border">{'Raw Material Cost:'}</div>
            </Col>
            <Col md={'2'}>
              {!CostingViewMode && gridData && isShowAddBtn() &&
                <button
                  type="button"
                  className={'user-btn'}
                  onClick={DrawerToggle}
                  disabled={IsApplyMasterBatch}
                >
                  <div className={'plus'}></div>ADD RM
                </button>
              }
            </Col>
          </Row>
          <form noValidate className="form" onSubmit={handleSubmit(onSubmit)}>
            <Row>
              {/*RAW MATERIAL COST GRID */}

              <Col md="12">
                <Table className="table cr-brdr-main costing-raw-material-section" size="sm">
                  <thead>
                    <tr>
                      <th>{`RM Name`}</th>
                      <th>{`RM Rate`}</th>
                      <th>{`Scrap Rate`}</th>
                      <th>{`UOM`}</th>
                      {getTechnology.includes(costData.ETechnologyType) && <th style={{ width: "195px" }} className="text-center">{`Weight Calculator`}</th>}
                      <th style={{ width: "190px" }}>{`Gross Weight`}</th>
                      <th style={{ width: "190px" }}>{`Finish Weight`}</th>
                      <th style={{ width: "190px" }}>{`Scrap Recovery %`}</th>
                      <th style={{ width: "190px" }}>{`Scrap Weight`}</th>
                      <th style={{ width: "190px" }}>{`Net RM Cost ${isRMDivisorApplicable(costData.TechnologyName) ? '/(' + RMDivisor + ')' : ''}`}</th>
                      <th style={{ width: "145px" }}>{`Action`}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {gridData &&
                      gridData.map((item, index) => {

                        return (
                          <tr key={index}>
                            <td>{item.RMName}</td>
                            <td>{item.RMRate}</td>
                            <td>{item.ScrapRate}</td>
                            <td>{item.UOM}</td>
                            {
                              getTechnology.includes(costData.ETechnologyType) &&
                              <td className="text-center">
                                <button
                                  className="CalculatorIcon cr-cl-icon "
                                  type={'button'}
                                  disabled={(CostingViewMode && item.WeightCalculationId === EMPTY_GUID) ? true : false}
                                  onClick={() => toggleWeightCalculator(index)}
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
                                    value: /^\d*\.?\d*$/,
                                    message: 'Invalid Number.',
                                  },
                                }}
                                defaultValue={item.GrossWeight}
                                className=""
                                customClassName={'withBorder'}
                                handleChange={(e) => {
                                  e.preventDefault()
                                  handleGrossWeightChange(e, index)
                                }}
                                errors={errors && errors.rmGridFields && errors.rmGridFields[index] !== undefined ? errors.rmGridFields[index].GrossWeight : ''}
                                disabled={CostingViewMode ? true : false}
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
                                    value: /^\d*\.?\d*$/,
                                    message: 'Invalid Number.',
                                  },
                                }}
                                defaultValue={item.FinishWeight}
                                className=""
                                customClassName={'withBorder'}
                                handleChange={(e) => {
                                  e.preventDefault()
                                  handleFinishWeightChange(e, index)
                                }}
                                errors={errors && errors.rmGridFields && errors.rmGridFields[index] !== undefined ? errors.rmGridFields[index].FinishWeight : ''}
                                disabled={CostingViewMode ? true : false}
                              />
                            </td>
                            <td>
                              {item.IsScrapRecoveryPercentageApplied && <NumberFieldHookForm
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
                                customClassName={'withBorder'}
                                handleChange={(e) => {
                                  e.preventDefault()
                                  handleScrapRecoveryChange(e, index)
                                }}
                                errors={errors && errors.rmGridFields && errors.rmGridFields[index] !== undefined ? errors.rmGridFields[index].ScrapRecoveryPercentage : ''}
                                disabled={CostingViewMode ? true : false}
                              />}
                            </td>
                            <td>{checkForDecimalAndNull(item.FinishWeight ? (item.GrossWeight - item.FinishWeight) : 0, initialConfiguration.NoOfDecimalForInputOutput)}</td>
                            <td>
                              {item?.NetLandedCost !== undefined ? checkForDecimalAndNull(item.NetLandedCost, initialConfiguration.NoOfDecimalForPrice) : ''}
                            </td>
                            <td>
                              {!CostingViewMode && <button
                                className="Delete "
                                type={'button'}
                                onClick={() => deleteItem(index)}
                              />}
                            </td>
                          </tr>
                        )
                      })
                    }
                    {gridData && gridData.length === 0 &&
                      <tr>
                        <td colSpan={11}>
                          <NoContentFound title={CONSTANT.EMPTY_DATA} />
                        </td>
                      </tr>
                    }
                  </tbody>
                </Table>
              </Col>
            </Row>

            <Row >
              {costData.TechnologyName === PLASTIC &&
                <Col md="2" className="py-3 ">
                  <label
                    className={`custom-checkbox mb-0 w-auto`}
                    onChange={onPressApplyMasterBatch}
                  >
                    Apply Master Batch
                    <input
                      type="checkbox"
                      checked={IsApplyMasterBatch}
                      disabled={(CostingViewMode || gridData.length !== 1) ? true : false}
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

              {IsApplyMasterBatch && costData.TechnologyName === PLASTIC &&
                <>
                  <Col md="2">
                    <button onClick={MasterBatchToggle} title={'Add Master Batch'} type="button" class="user-btn mt30"><div class="plus"></div>Add Master Batch</button>
                  </Col>
                  <Col md="2" >
                    <TextFieldHookForm
                      label="RM"
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
                      label="Price"
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
                      disabled={(CostingViewMode || checkForNull(getValues('MBPrice')) === 0) ? true : false}
                    />
                  </Col>
                  <Col md="2">
                    <TextFieldHookForm
                      label="Total"
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


          </form>
        </div>
      </div>
      {isDrawerOpen && (
        <AddRM
          isOpen={isDrawerOpen}
          closeDrawer={closeDrawer}
          isEditFlag={false}
          ID={''}
          anchor={'right'}
          IsApplyMasterBatch={IsApplyMasterBatch}
          Ids={Ids}
        />
      )}
      {isWeightDrawerOpen && (
        <OpenWeightCalculator
          isOpen={isWeightDrawerOpen}
          closeDrawer={closeWeightDrawer}
          isEditFlag={CostingViewMode ? false : true}
          inputDiameter={inputDiameter}
          item={item}
          technology={costData.ETechnologyType}
          ID={''}
          anchor={'right'}
          rmRowData={gridData[editIndex]}
          isSummary={false}
        />
      )}
    </>
  )
}

export default RawMaterialCost
