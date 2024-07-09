import React, { useEffect, useContext } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import PartCompoment from '../CostingHeadCosts/Part'
import {
  getRMCCTabData, setRMCCData, saveComponentCostingRMCCTab, setComponentItemData,
  saveDiscountOtherCostTab, setComponentDiscountOtherItemData, CloseOpenAccordion, saveAssemblyPartRowCostingCalculation, isDataChange, savePartNumber, setMessageForAssembly, saveBOMLevel, gridDataAdded, setIsBreakupBoughtOutPartCostingFromAPI, saveCostingPaymentTermDetail
} from '../../actions/Costing';
import { costingInfoContext, NetPOPriceContext } from '../CostingDetailStepTwo';
import { checkForNull, getConfigurationKey, loggedInUserId, showBopLabel } from '../../../../helper';
import AssemblyPart from '../CostingHeadCosts/SubAssembly';
import { LEVEL0, LEVEL1, } from '../../../../config/constants';
import Toaster from '../../../common/Toaster';
import { MESSAGES } from '../../../../config/message';
import { IsPartType, SelectedCostingDetail, ViewCostingContext } from '../CostingDetails';
import DayTime from '../../../common/DayTimeWrapper'
import { createToprowObjAndSave, errorCheck, errorCheckObject, findSurfaceTreatmentData } from '../../CostingUtil';
import _, { debounce } from 'lodash'
import ScrollToTop from '../../../common/ScrollToTop';
import WarningMessage from '../../../common/WarningMessage';
import { reactLocalStorage } from 'reactjs-localstorage';
import { PART_TYPE_ASSEMBLY } from '../../../../config/masterData';
import { PreviousTabData } from '.';
function TabRMCC(props) {

  const { handleSubmit } = useForm()
  const dispatch = useDispatch()

  const { RMCCTabData, ComponentItemData, ComponentItemDiscountData, ErrorObjRMCC, ErrorObjOverheadProfit, CostingEffectiveDate, getAssemBOPCharge, SurfaceTabData,
    OverheadProfitTabData, PackageAndFreightTabData, ToolTabData, DiscountCostData, checkIsDataChange, masterBatchObj, costingData, isBreakupBoughtOutPartCostingFromAPI, CostingDataList, PaymentTermDataDiscountTab } = useSelector(state => state.costing)

  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const netPOPrice = useContext(NetPOPriceContext);
  const selectedCostingDetail = useContext(SelectedCostingDetail);
  const isPartType = useContext(IsPartType);
  const previousTab = useContext(PreviousTabData) || 0;
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
        AssemCostingId: selectedCostingDetail.AssemblyCostingId ? selectedCostingDetail.AssemblyCostingId : costData.CostingId,
        subAsmCostingId: selectedCostingDetail.SubAssemblyCostingId ? selectedCostingDetail.SubAssemblyCostingId : costData.CostingId,
        EffectiveDate: CostingEffectiveDate ? CostingEffectiveDate : null
      }
      dispatch(getRMCCTabData(data, true, (res) => {
        dispatch(setIsBreakupBoughtOutPartCostingFromAPI(res?.data?.DataList[0]?.IsBreakupBoughtOutPart))
        // dispatch(setAllCostingInArray(res.data.DataList,false))
        let tempArr = [];
        tempArr.push(res?.data?.DataList[0]);
        tempArr.push(...res?.data?.DataList[0]?.CostingChildPartDetails);
        sessionStorage.setItem('costingArray', JSON.stringify(tempArr));

      }))
    }
  }, [Object.keys(costData).length > 0])

  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    // CostingViewMode CONDITION IS USED TO AVOID CALCULATION IN VIEWMODE
    if (CostingViewMode === false) {
      let TopHeaderValues = RMCCTabData && RMCCTabData.length > 0 && RMCCTabData[0]?.CostingPartDetails !== undefined ? RMCCTabData[0]?.CostingPartDetails : null;

      let topHeaderData = {};

      if (costData.IsAssemblyPart) {
        topHeaderData = {
          NetRawMaterialsCost: TopHeaderValues?.TotalRawMaterialsCostWithQuantity ? TopHeaderValues.TotalRawMaterialsCostWithQuantity : 0,
          NetBoughtOutPartCost: TopHeaderValues?.TotalBoughtOutPartCostWithQuantity ? TopHeaderValues.TotalBoughtOutPartCostWithQuantity : 0,
          NetConversionCost: TopHeaderValues?.TotalConversionCostWithQuantity ? TopHeaderValues.TotalConversionCostWithQuantity : 0,
          TotalLabourCost: TopHeaderValues?.totalLabourCost ? TopHeaderValues.totalLabourCost : 0,
          NetToolsCost: TopHeaderValues?.TotalToolCost ? TopHeaderValues.TotalToolCost : 0,
          NetTotalRMBOPCC: TopHeaderValues?.TotalCalculatedRMBOPCCCostWithQuantity ? TopHeaderValues.TotalRawMaterialsCostWithQuantity + TopHeaderValues.TotalBoughtOutPartCostWithQuantity + TopHeaderValues.TotalConversionCostWithQuantity : 0,
          OtherOperationCost: TopHeaderValues?.CostingConversionCost?.OtherOperationCostTotal ? TopHeaderValues.CostingConversionCost.OtherOperationCostTotal : 0,
          ProcessCostTotal: TopHeaderValues?.CostingConversionCost?.ProcessCostTotal ? TopHeaderValues.CostingConversionCost.ProcessCostTotal : 0,
          OperationCostTotal: TopHeaderValues?.CostingConversionCost?.OperationCostTotal ? TopHeaderValues.CostingConversionCost.OperationCostTotal : 0,
          TotalOperationCostPerAssembly: TopHeaderValues?.TotalOperationCostPerAssembly ? TopHeaderValues.TotalOperationCostPerAssembly : 0,
          TotalOperationCostSubAssembly: TopHeaderValues?.TotalOperationCostSubAssembly ? TopHeaderValues.TotalOperationCostSubAssembly : 0,
          TotalOtherOperationCostPerAssembly: TopHeaderValues?.TotalOtherOperationCostPerAssembly ? checkForNull(TopHeaderValues.TotalOtherOperationCostPerAssembly) : 0,
          RawMaterialCostWithCutOff: TopHeaderValues?.RawMaterialCostWithCutOff ? checkForNull(TopHeaderValues?.RawMaterialCostWithCutOff) : 0,
          IsRMCutOffApplicable: TopHeaderValues?.IsRMCutOffApplicable ? TopHeaderValues?.IsRMCutOffApplicable : false

        }
      } else {
        topHeaderData = {
          NetRawMaterialsCost: TopHeaderValues?.TotalRawMaterialsCost ? TopHeaderValues.TotalRawMaterialsCost : 0,
          NetBoughtOutPartCost: TopHeaderValues?.TotalBoughtOutPartCost ? TopHeaderValues.TotalBoughtOutPartCost : 0,
          NetConversionCost: TopHeaderValues?.TotalConversionCost ? TopHeaderValues.TotalConversionCost : 0,
          ProcessCostTotal: TopHeaderValues?.CostingConversionCost?.ProcessCostTotal ? TopHeaderValues.CostingConversionCost.ProcessCostTotal : 0,
          OperationCostTotal: TopHeaderValues?.CostingConversionCost?.OperationCostTotal ? TopHeaderValues.CostingConversionCost.OperationCostTotal : 0,
          OtherOperationCost: TopHeaderValues?.CostingConversionCost?.OtherOperationCostTotal ? TopHeaderValues.CostingConversionCost.OtherOperationCostTotal : 0,
          NetToolsCost: TopHeaderValues?.TotalToolCost ? TopHeaderValues.TotalToolCost : 0,
          NetTotalRMBOPCC: TopHeaderValues?.TotalCalculatedRMBOPCCCost ? TopHeaderValues.TotalCalculatedRMBOPCCCost : 0,
          RawMaterialCostWithCutOff: TopHeaderValues?.RawMaterialCostWithCutOff ? checkForNull(TopHeaderValues?.RawMaterialCostWithCutOff) : 0,
          IsRMCutOffApplicable: TopHeaderValues?.IsRMCutOffApplicable ? TopHeaderValues?.IsRMCutOffApplicable : false
        }
      }
      props.setHeaderCost(topHeaderData)
    }
    else {
      let topHeader = {}
      topHeader = {
        // NetRawMaterialsCost: costingData?.NetRMCost ? costingData.NetRMCost : 0,
        // NetBoughtOutPartCost: costingData?.NetBOPCost ? costingData.NetBOPCost : 0,
        // NetConversionCost: costingData?.NetConversionCost ? costingData.NetConversionCost : 0,
        // ProcessCostTotal: costingData?.CostingConversionCost?.ProcessCostTotal ? costingData.CostingConversionCost.ProcessCostTotal : 0,
        // OperationCostTotal: costingData?.CostingConversionCost?.OperationCostTotal ? costingData.CostingConversionCost.OperationCostTotal : 0,
        // OtherOperationCost: costingData?.CostingConversionCost?.OtherOperationCostTotal ? costingData.CostingConversionCost.OtherOperationCostTotal : 0,
        // NetToolsCost: costingData?.TotalToolCost ? costingData.TotalToolCost : 0,
        // NetTotalRMBOPCC: costingData?.TotalCalculatedRMBOPCCCost ? costingData.TotalCalculatedRMBOPCCCost : 0,
        RawMaterialCostWithCutOff: costingData?.RawMaterialCostWithCutOff ? checkForNull(costingData?.RawMaterialCostWithCutOff) : 0,
        IsRMCutOffApplicable: costingData?.IsRMCutOffApplicable ? costingData?.IsRMCutOffApplicable : false
      }

      props.setHeaderCost(topHeader)
    }
  }, [RMCCTabData]);

  /**
  * @method getToolTotalCost
  * @description GET TOOL TOTAL COST
  */
  const getToolTotalCost = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if ((el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) || (el.IsAssemblyPart)) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el?.CostingPartDetails !== null && el?.CostingPartDetails?.CostingConversionCost && el?.CostingPartDetails?.CostingConversionCost.ToolsCostTotal !== undefined ? el?.CostingPartDetails?.CostingConversionCost.ToolsCostTotal : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method getCCTotalCostForAssembly
  * @description GET CC TOTAL COST FOR ASSEMBLY (tOTAL CHILD'S CONVERSION COST)
  */
  const getCCTotalCostForAssembly = (tempArr) => {
    // let tempArr = setArrayForCosting && setArrayForCosting.filter(item=>item.AssemblyPartNumber === PartNo && item.PartType !== 'Assembly')
    let NetCost = 0;
    NetCost = tempArr && tempArr.reduce((accummlator, el) => {
      if (el.PartType === 'Part')
        return accummlator + checkForNull(el?.CostingPartDetails?.TotalConversionCost !== null ? checkForNull(el?.CostingPartDetails?.TotalConversionCost) * el?.CostingPartDetails?.Quantity : 0);

    }, 0)
    return NetCost;
  }




  const setRMCostForAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + checkForNull(item?.CostingPartDetails?.TotalRawMaterialsCost) * checkForNull(item?.Quantity)
      } else {
        return accummlator + checkForNull(item?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity) * checkForNull(item?.Quantity)
      }
    }, 0)
    return total
  }
  const setRMCutOffCostForAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + checkForNull(item?.CostingPartDetails?.RawMaterialCostWithCutOff) * checkForNull(item.Quantity)
      } else {
        return accummlator + checkForNull(item?.CostingPartDetails?.RawMaterialCostWithCutOff) * checkForNull(item.Quantity)
      }
    }, 0)
    return total
  }

  const setRMCostForSubAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + checkForNull(item?.CostingPartDetails?.TotalRawMaterialsCost) * checkForNull(item?.CostingPartDetails?.Quantity)
      } else {

        return accummlator + checkForNull(item?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity) * checkForNull(item?.CostingPartDetails?.Quantity)
      }
    }, 0)
    return total
  }
  const setRMCCutOffSubAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + checkForNull(item?.CostingPartDetails?.RawMaterialCostWithCutOff) * checkForNull(item?.CostingPartDetails?.Quantity)
      } else {

        return accummlator + checkForNull(item?.CostingPartDetails?.RawMaterialCostWithCutOff) * checkForNull(item?.CostingPartDetails?.Quantity)
      }
    }, 0)
    return total
  }

  const setBOPCostAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part' || item.PartType === 'BOP') {
        return accummlator + checkForNull(item?.CostingPartDetails?.TotalBoughtOutPartCost) * checkForNull(item.Quantity)
      }
      else {
        return accummlator + checkForNull(item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) * checkForNull(item.Quantity)
      }
    }, 0)
    return total
  }

  const setBOPCostForSubAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {

      if (item.PartType === 'Part' || item.PartType === 'BOP') {
        return accummlator + checkForNull(item?.CostingPartDetails?.TotalBoughtOutPartCost) * checkForNull(item?.CostingPartDetails?.Quantity)
      } else {

        return accummlator + checkForNull(item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) * checkForNull(item?.CostingPartDetails?.Quantity)
      }
    }, 0)
    return total
  }

  const setConversionCostAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + checkForNull(item?.CostingPartDetails?.TotalConversionCost) * checkForNull(item.Quantity)
      } else {
        return accummlator + checkForNull(item?.CostingPartDetails?.TotalConversionCostWithQuantity) * checkForNull(item.Quantity)
      }
    }, 0)
    return total
  }

  const setConversionCostForSubAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + checkForNull(item?.CostingPartDetails?.TotalConversionCost) * checkForNull(item?.CostingPartDetails?.Quantity)
      } else {

        return accummlator + checkForNull(item?.CostingPartDetails?.TotalConversionCostWithQuantity) * checkForNull(item?.CostingPartDetails?.Quantity)
      }
    }, 0)
    return total
  }

  const setOtherOperationForSubAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + checkForNull(item?.CostingPartDetails?.TotalOtherOperationCost) * checkForNull(item?.CostingPartDetails?.Quantity)
      } else {

        return accummlator + checkForNull(item?.CostingPartDetails?.TotalOtherOperationCostPerAssembly) * checkForNull(item?.CostingPartDetails?.Quantity)
      }
    }, 0)
    return total
  }

  const setOperationCostForAssembly = (tempArr) => {
    const total = tempArr && tempArr.reduce((accummlator, item) => {
      if (item.PartType === 'Sub Assembly') {
        return checkForNull(accummlator) + (checkForNull(item?.CostingPartDetails?.TotalConversionCostWithQuantity) * checkForNull(item.Quantity))
      }
    }, 0)
    return total
  }

  /**
   * @method calculateRMCutOff
   * @description TO CALCULATE RM CUT OFF VALUE OF RM FOR PARTICULAR PART
  */

  const calculateRMCutOff = (gridData) => {
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
    return totalCutOff
  }

  /**
   * @function calculationForPart
   * @param GRIDdATA (RM/BOP/CC) ,OBJ (WHICH WE HAVE TO UPDATE),TYPE(RM/BOP/CC),checkboxFields (IF BOP HANDLING CHARGE IS THERE / MASTERBATCH OBJECT IS THERE)
   * @description PART/ COMPONENT CALCULATION FOR RM,BOP,CC BASED ON THE TYPE RECEIVED IN FUNCTION CALLING
  */
  const calculationForPart = (gridData, obj, type, checkboxFields = {}) => {
    let partObj = obj
    let GrandTotalCost = 0
    let sumForBasicRate = (checkForNull(CostingDataList[0]?.NetSurfaceTreatmentCost) + checkForNull(CostingDataList[0]?.NetOverheadAndProfitCost) + checkForNull(CostingDataList[0]?.NetPackagingAndFreight) + checkForNull(CostingDataList[0]?.ToolCost) + checkForNull(CostingDataList[0]?.NetOtherCost)) - checkForNull(CostingDataList[0]?.NetDiscountsCost)
    switch (type) {
      case 'RM':

        let isAllFalse = false
        // if (partObj?.CostingPartDetails?.IsRMCutOffApplicable !== true) {
        isAllFalse = _.map(gridData, 'IsCutOffApplicable').every(v => v === false)    // if all not false means true exist
        // }



        GrandTotalCost = checkForNull(netRMCost(gridData)) + checkForNull(partObj?.CostingPartDetails?.TotalBoughtOutPartCost) + checkForNull(partObj?.CostingPartDetails?.TotalConversionCost)
        partObj.CostingPartDetails.CostingRawMaterialsCost = gridData;
        partObj.CostingPartDetails.TotalRawMaterialsCost = netRMCost(gridData);
        partObj.CostingPartDetails.RawMaterialCostWithCutOff = calculateRMCutOff(gridData)
        partObj.CostingPartDetails.IsRMCutOffApplicable = !isAllFalse

        partObj.CostingPartDetails.MasterBatchRMId = checkboxFields?.MasterBatchRMId;
        partObj.CostingPartDetails.IsApplyMasterBatch = checkboxFields?.IsApplyMasterBatch;
        partObj.CostingPartDetails.MasterBatchRMName = checkboxFields?.MasterBatchRMName;
        partObj.CostingPartDetails.MasterBatchRMPrice = checkForNull(checkboxFields?.MasterBatchRMPrice);
        partObj.CostingPartDetails.MasterBatchPercentage = checkForNull(checkboxFields?.MasterBatchPercentage);
        partObj.CostingPartDetails.MasterBatchTotal = checkForNull(checkboxFields?.MasterBatchTotal);
        partObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
        partObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(GrandTotalCost) * checkForNull(partObj?.CostingPartDetails?.Quantity);
        partObj.CostingPartDetails.CostingRawMaterialCommonCalculationId = gridData[0]?.WeightCalculationId;
        partObj.CostingPartDetails.NetPOPrice =
          checkForNull(partObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity) +
          checkForNull(partObj?.CostingPartDetails?.TotalBoughtOutPartCost) +
          checkForNull(partObj?.CostingPartDetails?.TotalProcessCost) +
          checkForNull(partObj?.CostingPartDetails?.TotalOperationCost)
        partObj.CostingPartDetails.BasicRate = checkForNull(partObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity) +
          checkForNull(partObj?.CostingPartDetails?.TotalBoughtOutPartCost) +
          checkForNull(partObj?.CostingPartDetails?.TotalProcessCost) +
          checkForNull(partObj?.CostingPartDetails?.TotalOperationCost)


        // partObj.CostingPartDetails.NetPOPrice = gridData[0]?.WeightCalculationId;
        break;
      case 'BOP':
        partObj.CostingPartDetails.CostingBoughtOutPartCost = gridData;

        partObj.CostingPartDetails.TotalBoughtOutPartCost = checkboxFields?.IsApplyBOPHandlingCharges ? (netBOPCost(gridData) + checkForNull(checkboxFields?.BOPHandlingCharges)) : netBOPCost(gridData);
        partObj.CostingPartDetails.IsApplyBOPHandlingCharges = checkboxFields?.IsApplyBOPHandlingCharges;
        partObj.CostingPartDetails.BOPHandlingPercentage = checkboxFields?.BOPHandlingChargeType === 'Percentage' ? checkForNull(checkboxFields?.BOPHandlingPercentage) : 0;
        partObj.CostingPartDetails.BOPHandlingCharges = checkForNull(checkboxFields?.BOPHandlingCharges);
        partObj.CostingPartDetails.BOPHandlingChargeType = checkboxFields?.BOPHandlingChargeType;
        // partObj?.CostingPartDetails?.BOPHandlingFixed = (gridData?.length !== 0 && checkboxFields?.BOPHandlingChargeType === 'Fixed') ? checkForNull(checkboxFields?.BOPHandlingCharges) : 0;

        GrandTotalCost = checkForNull(partObj?.CostingPartDetails?.TotalRawMaterialsCost) + checkForNull(partObj?.CostingPartDetails?.TotalBoughtOutPartCost) + checkForNull(partObj?.CostingPartDetails?.TotalConversionCost)
        partObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
        partObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(GrandTotalCost) * checkForNull(partObj?.CostingPartDetails?.Quantity);
        partObj.CostingPartDetails.BasicRate = checkForNull(GrandTotalCost) * checkForNull(partObj?.CostingPartDetails?.Quantity)

        break;
      case 'CC':
        partObj.CostingPartDetails.TotalConversionCost = gridData.NetConversionCost
        partObj.CostingPartDetails.TotalProcessCost = gridData.ProcessCostTotal
        partObj.CostingPartDetails.TotalOperationCost = gridData.OperationCostTotal
        partObj.CostingPartDetails.TotalOtherOperationCost = gridData.OtherOperationCostTotal

        let data = gridData && gridData.CostingProcessCostResponse && gridData.CostingProcessCostResponse.map(el => {
          return el;
        })

        let operationData = gridData && gridData.CostingOperationCostResponse && gridData.CostingOperationCostResponse.map(el => {
          return el;
        })

        let otherOperationData = gridData && gridData.CostingOtherOperationCostResponse && gridData.CostingOtherOperationCostResponse.map(el => {
          return el;
        })
        partObj.CostingPartDetails.CostingConversionCost = { ...gridData, CostingProcessCostResponse: data, CostingOperationCostResponse: operationData, CostingOtherOperationCostResponse: otherOperationData };

        GrandTotalCost = checkForNull(partObj?.CostingPartDetails?.TotalRawMaterialsCost) + checkForNull(partObj?.CostingPartDetails?.TotalBoughtOutPartCost) + checkForNull(partObj?.CostingPartDetails?.TotalConversionCost)

        partObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
        partObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(GrandTotalCost) * checkForNull(partObj?.CostingPartDetails?.Quantity);

        break;
      default:
        break;
    }
    if (Number(isPartType?.value) === PART_TYPE_ASSEMBLY) {
      partObj.CostingPartDetails.BasicRate = checkForNull(partObj.CostingPartDetails.TotalCalculatedRMBOPCCCost) + checkForNull(findSurfaceTreatmentData(partObj)?.CostingPartDetails?.NetSurfaceTreatmentCost)
    } else {
      partObj.CostingPartDetails.BasicRate = checkForNull(sumForBasicRate) + checkForNull(partObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity)
    }
    return partObj
  }

  /**
   * @function calculationForSubAssembly
   * @param OBJ (WHICH WE HAVE TO UPDATE),QUANTITY (CHILD PART QUANTITY),TYPE(RM/BOP/CC),tempArrALL (THE CHILD SUBASSEMBLIES /PART )
   * @description SUBASSEMBLY CALCULATION WITH THE HELP OF ALL PART/SUBASSEMBLIES RECEIVED IN TEMPARR PARAMETER (CHILDS TO UPDATE PARENT CALCULATION)
  */
  const calculationForSubAssembly = (obj = {}, quantity, type = '', tempArr = []) => {
    let subAssemObj = { ...obj }
    switch (type) {
      case 'RM':
        subAssemObj.CostingPartDetails.TotalRawMaterialsCost = setRMCostForSubAssembly(tempArr)
        subAssemObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity = subAssemObj?.CostingPartDetails?.TotalRawMaterialsCost;
        subAssemObj.CostingPartDetails.RawMaterialCostWithCutOff = setRMCCutOffSubAssembly(tempArr)
        subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = subAssemObj?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity + checkForNull(subAssemObj?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) + checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostWithQuantity);
        subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = subAssemObj?.CostingPartDetails?.TotalCalculatedRMBOPCCCost * subAssemObj?.CostingPartDetails?.Quantity;
        break;
      case 'BOP':
        subAssemObj.CostingPartDetails.TotalBoughtOutPartCost = setBOPCostForSubAssembly(tempArr)

        subAssemObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = checkForNull(subAssemObj?.CostingPartDetails?.TotalBoughtOutPartCost) + checkForNull(subAssemObj?.CostingPartDetails?.BOPHandlingCharges);
        subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = checkForNull(subAssemObj?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity) + checkForNull(subAssemObj?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) + checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostWithQuantity);
        subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(subAssemObj?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) * subAssemObj?.CostingPartDetails?.Quantity;
        break;
      case 'CC':
        subAssemObj.CostingPartDetails.TotalConversionCost = setConversionCostForSubAssembly(tempArr)
        subAssemObj.CostingPartDetails.TotalConversionCostWithQuantity = (checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCost)) + checkForNull(subAssemObj?.CostingPartDetails?.TotalOperationCostPerAssembly)
        subAssemObj.CostingPartDetails.TotalOperationCostSubAssembly = setOperationCostForAssembly(tempArr)
        subAssemObj.CostingPartDetails.TotalOperationCostComponent = checkForNull(getCCTotalCostForAssembly(tempArr))
        subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = checkForNull(subAssemObj?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity) + checkForNull(subAssemObj?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) + checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostWithQuantity);
        subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(subAssemObj?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) * subAssemObj?.CostingPartDetails?.Quantity;
        subAssemObj.CostingPartDetails.TotalOtherOperationCostPerAssembly = setOtherOperationForSubAssembly(tempArr)
        break;
      case 'Sub Assembly':
        subAssemObj.CostingPartDetails.TotalRawMaterialsCost = setRMCostForSubAssembly(tempArr)
        subAssemObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity = checkForNull(subAssemObj?.CostingPartDetails?.TotalRawMaterialsCost)
        subAssemObj.CostingPartDetails.RawMaterialCostWithCutOff = checkForNull(subAssemObj?.CostingPartDetails?.RawMaterialCostWithCutOff) * checkForNull(quantity)
        subAssemObj.CostingPartDetails.TotalBoughtOutPartCost = setBOPCostForSubAssembly(tempArr)
        subAssemObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = (checkForNull(subAssemObj?.CostingPartDetails?.TotalBoughtOutPartCost)) + checkForNull(subAssemObj?.CostingPartDetails?.BOPHandlingCharges);
        subAssemObj.CostingPartDetails.TotalConversionCost = setConversionCostForSubAssembly(tempArr)
        subAssemObj.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCost)
        subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = checkForNull(subAssemObj?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity) + checkForNull(subAssemObj?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) + checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostWithQuantity);
        subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(subAssemObj?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) * checkForNull(subAssemObj?.CostingPartDetails?.Quantity);
        subAssemObj.CostingPartDetails.TotalOtherOperationCostPerAssembly = setOtherOperationForSubAssembly(tempArr)
        break;
      case 'Sub Assembly Operation':
        subAssemObj.CostingPartDetails.TotalOperationCostSubAssembly = setOperationCostForAssembly(tempArr)
        subAssemObj.CostingPartDetails.TotalConversionCost = checkForNull(subAssemObj?.CostingPartDetails?.TotalOperationCostComponent) + checkForNull(subAssemObj?.CostingPartDetails?.TotalOperationCostSubAssembly) + checkForNull(subAssemObj?.CostingPartDetails?.TotalOperationCostPerAssembly)
        subAssemObj.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCost)
        subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = checkForNull(subAssemObj?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity) + checkForNull(subAssemObj?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) + checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostWithQuantity);
        subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(subAssemObj?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) * checkForNull(subAssemObj?.CostingPartDetails?.Quantity);
        break;
      default:
        break;
    }

    return subAssemObj
  }

  /**
   * @method updateCostingValuesInStructure
   * @description UPDATE WHOLE COSTING VALUE IN RMCCTAB DATA REDUCER TO SHOW UPDATED VALUE ON UI
  */

  const updateCostingValuesInStructure = () => {
    //MAKING THIS MAP ARRAY COMMON
    let stCostingData = findSurfaceTreatmentData(ComponentItemData)
    const mapArray = (data) => data.map(item => {
      let newItem = item
      let updatedArr = JSON.parse(sessionStorage.getItem('costingArray'))
      let obj = updatedArr && updatedArr.find(updateditem => updateditem.PartNumber === newItem.PartNumber && updateditem.AssemblyPartNumber === newItem.AssemblyPartNumber)
      newItem.CostingPartDetails.TotalRawMaterialsCost = checkForNull(obj?.CostingPartDetails?.TotalRawMaterialsCost)
      newItem.CostingPartDetails.RawMaterialCostWithCutOff = checkForNull(obj?.CostingPartDetails?.RawMaterialCostWithCutOff)
      newItem.CostingPartDetails.IsApplyBOPHandlingCharges = obj?.CostingPartDetails?.IsApplyBOPHandlingCharges;
      newItem.CostingPartDetails.BOPHandlingChargeApplicability = obj?.CostingPartDetails?.BOPHandlingChargeApplicability;
      newItem.CostingPartDetails.BOPHandlingPercentage = obj?.CostingPartDetails?.BOPHandlingPercentage;
      newItem.CostingPartDetails.BOPHandlingCharges = obj?.CostingPartDetails?.BOPHandlingCharges;
      newItem.CostingPartDetails.TotalRawMaterialsCostWithQuantity = obj?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity
      newItem.CostingPartDetails.TotalBoughtOutPartCost = checkForNull(obj?.CostingPartDetails?.TotalBoughtOutPartCost)
      newItem.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = obj?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity
      newItem.CostingPartDetails.TotalOperationCostPerAssembly = obj?.CostingPartDetails?.TotalOperationCostPerAssembly
      newItem.CostingPartDetails.TotalOperationCostSubAssembly = obj?.CostingPartDetails?.TotalOperationCostSubAssembly
      newItem.CostingPartDetails.TotalOperationCostComponent = obj?.CostingPartDetails?.TotalOperationCostComponent
      newItem.CostingPartDetails.TotalConversionCost = checkForNull(obj?.CostingPartDetails?.TotalConversionCost)
      newItem.CostingPartDetails.TotalConversionCostWithQuantity = obj?.CostingPartDetails?.TotalConversionCostWithQuantity + checkForNull(obj?.CostingPartDetails?.IndirectLaborCost) + checkForNull(obj?.CostingPartDetails?.StaffCost) + checkForNull(obj?.CostingPartDetails?.NetLabourCost)
      newItem.CostingPartDetails.TotalCalculatedRMBOPCCCost = checkForNull(obj?.CostingPartDetails?.TotalCalculatedRMBOPCCCost)
      newItem.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = obj?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity
      newItem.CostingPartDetails.IsRMCutOffApplicable = obj?.CostingPartDetails?.IsRMCutOffApplicable
      newItem.CostingPartDetails.TotalOtherOperationCostPerAssembly = obj?.CostingPartDetails?.TotalOtherOperationCostPerAssembly

      newItem.CostingPartDetails.BOPHandlingChargeType = obj?.CostingPartDetails?.BOPHandlingChargeType;
      newItem.CostingPartDetails.CostingRawMaterialsCost = obj?.CostingPartDetails?.CostingRawMaterialsCost;
      newItem.CostingPartDetails.CostingBoughtOutPartCost = obj?.CostingPartDetails?.CostingBoughtOutPartCost;
      newItem.CostingPartDetails.CostingConversionCost = obj?.CostingPartDetails?.CostingConversionCost;
      newItem.CostingPartDetails.BasicRate = obj?.CostingPartDetails?.BasicRate
      // newItem?.CostingPartDetails?.BOPHandlingFixed = checkForNull(obj?.CostingPartDetails?.BOPHandlingFixed);


      if (item.CostingChildPartDetails.length > 0) {
        mapArray(item.CostingChildPartDetails)
      }
      return newItem
    })
    const updatedArr = mapArray(RMCCTabData)


    dispatch(setRMCCData(updatedArr, () => { }))
  }

  /**
  * @method setRMCost
  * @description SET RM COST
  */
  const setRMCost = (rmGrid, params, item) => {
    setRMCostInDataList(rmGrid, params, RMCCTabData, item)
  }

  const setRMCostInDataList = (rmGrid, params, arr1, item,) => {

    //FUNCTION TO CALCULATE THE COSITNG VALUE OF PARTS AND SUBASSEMBLIES
    const calculateValue = (useLevel, item, tempArrForCosting) => {

      let initialPartNo = ''
      let quant = ''
      for (let i = useLevel; i >= 0; i--) {
        // THIS CONDITION IS FOR CALCULATING COSTING OF PART/COMPONENT ON THE LEVEL WE ARE WORKING
        if (item.PartType === "Part" || item.PartType === "Component" || isBreakupBoughtOutPartCostingFromAPI) {
          // IF LEVEL WE ARE WORKING IS OF PART TYPE UNDER SOME SUBASSMEBLY OR ASSEMBLY
          if (i === useLevel) {
            let partIndex = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === item.PartNumber && x.AssemblyPartNumber === item.AssemblyPartNumber)
            let partObj = calculationForPart(rmGrid, item, 'RM', masterBatchObj)
            tempArrForCosting = Object.assign([...tempArrForCosting], { [partIndex]: partObj })
            let otherPart = tempArrForCosting && tempArrForCosting.filter((x) => x.PartNumber === item.PartNumber)
            let tempArrForCosting1 = tempArrForCosting
            otherPart && otherPart.map((item1) => {
              let partIndexOther = tempArrForCosting1 && tempArrForCosting1.findIndex((x) => x.PartNumber === item1.PartNumber && x.AssemblyPartNumber === item1.AssemblyPartNumber)
              let partObjOtherPart = calculationForPart(rmGrid, item1, 'RM', masterBatchObj)
              tempArrForCosting1 = Object.assign([...tempArrForCosting1], { [partIndexOther]: partObjOtherPart })
              return null
            })
            tempArrForCosting = [...tempArrForCosting1]
            initialPartNo = item.AssemblyPartNumber
            quant = item?.CostingPartDetails?.Quantity
          }
          else {
            // THIS ELSE CONDITION WILL RUN FOR ALL SUBASSEMBLY COSTING CALCULATION (WILL FIND PARENT ON THE BASIS OF PARENT NO PRESENT IN IT'S CHILD)
            let indexForUpdate = _.findIndex(tempArrForCosting, ['PartNumber', initialPartNo]);
            let objectToUpdate = tempArrForCosting[indexForUpdate]
            if (objectToUpdate.PartType === 'Sub Assembly') {
              let tempArr = _.filter(tempArrForCosting, ['AssemblyPartNumber', initialPartNo]);
              initialPartNo = objectToUpdate.AssemblyPartNumber
              let subAssemObj = calculationForSubAssembly(objectToUpdate, quant, 'RM', tempArr)
              quant = objectToUpdate?.CostingPartDetails?.Quantity
              tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })
            }
          }
        }
      }
      return tempArrForCosting
    }
    const arr = _.cloneDeep(arr1)
    let tempArr = [];
    try {
      tempArr = arr && arr.map((i) => {
        // TO FIND THE LEVEL OF PART ON WHICH COSTING IS DONE
        const level = params.BOMLevel
        const useLevel = level.split('L')[1]
        //GETTING LASTEST COSTING OF ASSEMBLY,SUBASSEMBLY AND PART FROM LOCAL STORAGE
        let tempArrForCosting = JSON.parse(sessionStorage.getItem('costingArray'))
        //CALCULATION FOR PART/COMPONENT AND SUBASSEMBLY COSTING (RM COST)
        tempArrForCosting = calculateValue(useLevel, item, tempArrForCosting)

        // THIS ARRAY IS FOR FINDING THE SUBASSEMBLIES  WHICH  HAVE SAME PART ON WHICH WE ARE DOING COSTING
        let Arr = tempArrForCosting && tempArrForCosting.filter(costing => costing.PartNumber === item.PartNumber && costing.AssemblyPartNumber !== item.AssemblyPartNumber)
        // THIS ARRAY IS FOR CALCUALTING THE COSTING OF ALL PARTS (WHICH HAVE SAME PART NUMBER ON WHICH WE ARE DOING COSTING) AND SUBASSEMBLY(CONTAINIG SAME PART NUMBER)
        Arr && Arr.map(costingItem => {
          const level = costingItem.BOMLevel
          const useLevel = level.split('L')[1]
          tempArrForCosting = calculateValue(useLevel, costingItem, tempArrForCosting)

          return null
        })

        // MAIN ASSEMBLY CALCULATION
        let subAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item => item.BOMLevel === 'L1')

        let assemblyObj = tempArrForCosting[0]

        // WILL RUN IF IT IS ASSEMBLY COSTING. WILL NOT RUN FOR COMPONENT COSTING
        if (assemblyObj?.CostingPartDetails?.PartType === 'Assembly') {

          let isAllFalse = false
          // if (assemblyObj?.CostingPartDetails?.IsRMCutOffApplicable !== true) {
          isAllFalse = _.map(rmGrid, 'IsCutOffApplicable').every(v => v === false)    // if all not false means true exist
          // }

          assemblyObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity = setRMCostForAssembly(subAssemblyArray)
          assemblyObj.CostingPartDetails.RawMaterialCostWithCutOff = setRMCutOffCostForAssembly(subAssemblyArray)
          assemblyObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalConversionCostWithQuantity)
          let arrayToCheck = tempArrForCosting && tempArrForCosting.filter(costingItem => costingItem.PartNumber !== params.PartNumber)

          let isContain = false
          arrayToCheck && arrayToCheck.filter(costingItem => {
            if (costingItem?.CostingPartDetails?.IsRMCutOffApplicable && (costingItem.PartType === "Part" || costingItem.PartType === "Component")) {
              isContain = true
            }
          })
          assemblyObj.CostingPartDetails.IsRMCutOffApplicable = (isContain === true) ? true : !isAllFalse

          tempArrForCosting = Object.assign([...tempArrForCosting], { 0: assemblyObj })
        }
        // STORING CALCULATED AND UPDATED COSTING VALUE IN LOCAL STORAGE
        sessionStorage.setItem('costingArray', JSON.stringify([]))
        sessionStorage.setItem('costingArray', JSON.stringify(tempArrForCosting))

        return i;
      });
      // CALLING THIS FUNCTION TO UPDATE THE COSTING VALUE ON UI (RMMCCTABDATA REDUCER)
      updateCostingValuesInStructure()

    } catch (error) {
    }
    return tempArr;
  }

  /**
   * @method netRMCost
   * @description GET RM COST
   */
  const netRMCost = (item) => {
    let NetRMCost = 0
    NetRMCost = item && item.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.NetLandedCost)
    }, 0)
    return NetRMCost
  }

  /**
   * @method setBOPCost
   * @description SET BOP COST WITH BOP HANDLING CHARGE 
   */
  const setBOPCost = (bopGrid, params, item, BOPHandlingFields = {}) => {
    setBOPCostInDataList(bopGrid, params, RMCCTabData, item, BOPHandlingFields)
  }

  const setBOPCostInDataList = (bopGrid, params, arr, item, BOPHandlingFields = {}) => {

    //FUNCTION TO CALCULATE THE COSITNG VALUE OF PARTS AND SUBASSEMBLIES
    const calculateValue = (useLevel, item, tempArrForCosting) => {
      let initialPartNo = ''
      let quant = ''
      for (let i = useLevel; i >= 0; i--) {
        // THIS CONDITION IS FOR CALCULATING COSTING OF PART/COMPONENT ON THE LEVEL WE ARE WORKING
        if (item.PartType === "Part" || item.PartType === "Component" || isBreakupBoughtOutPartCostingFromAPI) {
          if (i === useLevel) {
            let partIndex = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === item.PartNumber && x.AssemblyPartNumber === item.AssemblyPartNumber)
            let partObj = calculationForPart(bopGrid, item, 'BOP', BOPHandlingFields)
            tempArrForCosting = Object.assign([...tempArrForCosting], { [partIndex]: partObj })
            let otherPart = tempArrForCosting && tempArrForCosting.filter((x) => x.PartNumber === item.PartNumber)
            let tempArrForCosting1 = tempArrForCosting
            otherPart && otherPart.map((item1) => {
              let partIndexOther = tempArrForCosting1 && tempArrForCosting1.findIndex((x) => x.PartNumber === item1.PartNumber && x.AssemblyPartNumber === item1.AssemblyPartNumber)
              let partObjOtherPart = calculationForPart(bopGrid, item1, 'BOP', BOPHandlingFields)
              tempArrForCosting1 = Object.assign([...tempArrForCosting1], { [partIndexOther]: partObjOtherPart })
              return null
            })
            tempArrForCosting = [...tempArrForCosting1]
            initialPartNo = item.AssemblyPartNumber
            quant = item?.CostingPartDetails?.Quantity

          }
          else {
            // THIS ELSE CONDITION WILL RUN FOR ALL SUBASSEMBLY COSTING CALCULATION (WILL FIND PARENT ON THE BASIS OF PARENT NO PRESENT IN IT'S CHILD)
            let indexForUpdate = _.findIndex(tempArrForCosting, ['PartNumber', initialPartNo]);
            let objectToUpdate = tempArrForCosting[indexForUpdate]
            if (objectToUpdate.PartType === 'Sub Assembly') {
              let tempArr = _.filter(tempArrForCosting, ['AssemblyPartNumber', initialPartNo]);
              initialPartNo = objectToUpdate.AssemblyPartNumber
              let subAssemObj = calculationForSubAssembly(objectToUpdate, quant, 'BOP', tempArr)
              quant = objectToUpdate?.CostingPartDetails?.Quantity
              tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })
            }
          }
        }
      }
      return tempArrForCosting
    }
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {
        // TO FIND THE LEVEL OF PART ON WHICH COSTING IS DONE
        const level = params.BOMLevel
        const useLevel = level.split('L')[1]
        //GETTING LASTEST COSTING OF ASSEMBLY,SUBASSEMBLY AND PART FROM LOCAL STORAGE
        let tempArrForCosting = JSON.parse(sessionStorage.getItem('costingArray'))
        //CALCULATION FOR PART/COMPONENT AND SUBASSEMBLY COSTING (BOP COST)
        tempArrForCosting = calculateValue(useLevel, item, tempArrForCosting)

        // THIS ARRAY IS FOR FINDING THE SUBASSEMBLIES  WHICH  HAVE SAME PART ON WHICH WE ARE DOING COSTING
        let Arr = tempArrForCosting && tempArrForCosting.filter(costing => costing.PartNumber === item.PartNumber && costing.AssemblyPartNumber !== item.AssemblyPartNumber)
        // THIS ARRAY IS FOR CALCUALTING THE COSTING OF ALL PARTS (WHICH HAVE SAME PART NUMBER ON WHICH WE ARE DOING COSTING) AND SUBASSEMBLY(CONTAINIG SAME PART NUMBER)
        Arr && Arr.map(costingItem => {
          const level = costingItem.BOMLevel
          const useLevel = level.split('L')[1]
          tempArrForCosting = calculateValue(useLevel, costingItem, tempArrForCosting)
          return null
        })
        // MAIN ASSEMBLY CALCULATION
        let subAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item => item.BOMLevel === 'L1')
        let assemblyObj = tempArrForCosting[0]
        // WILL RUN IF IT IS ASSEMBLY COSTING. WILL NOT RUN FOR COMPONENT COSTING
        if (assemblyObj?.CostingPartDetails?.PartType === 'Assembly') {
          assemblyObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = setBOPCostAssembly(subAssemblyArray) + checkForNull(assemblyObj?.CostingPartDetails?.BOPHandlingCharges)
          assemblyObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalConversionCostWithQuantity)
          tempArrForCosting = Object.assign([...tempArrForCosting], { 0: assemblyObj })
        }
        // STORING CALCULATED AND UPDATED COSTING VALUE IN LOCAL STORAGE
        sessionStorage.setItem('costingArray', JSON.stringify([]))
        sessionStorage.setItem('costingArray', JSON.stringify(tempArrForCosting))
        return i;
      });
      // CALLING THIS FUNCTION TO UPDATE THE COSTING VALUE ON UI (RMMCCTABDATA REDUCER)
      updateCostingValuesInStructure()

    } catch (error) {

    }
    return tempArr;
  }



  /**
   * @method netBOPCost
   * @description GET BOP COST
   */
  const netBOPCost = (item) => {
    let NetCost = 0
    NetCost = item && item.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.NetBoughtOutPartCost)
    }, 0)
    return NetCost
  }

  /**
   * @method setProcessCost
   * @description SET PROCESS / OPERATION /OTHER OPERATION COST 
   */
  const setConversionCost = (conversionGrid, params, item) => {
    setConversionCostInDataList(conversionGrid, params, RMCCTabData, item)
  }

  const setConversionCostInDataList = (conversionGrid, params, arr, item) => {


    //FUNCTION TO CALCULATE THE COSITNG VALUE OF PARTS AND SUBASSEMBLIES
    const calculateValue = (useLevel, item, tempArrForCosting) => {
      let initialPartNo = ''
      let quant = ''

      for (let i = useLevel; i >= 0; i--) {

        // THIS CONDITION IS FOR CALCULATING COSTING OF PART/COMPONENT ON THE LEVEL WE ARE WORKING
        if (item.PartType === "Part" || item.PartType === "Component" || isBreakupBoughtOutPartCostingFromAPI) {
          // IF LEVEL WE ARE WORKING IS OF PART TYPE UNDER SOME SUBASSMEBLY OR ASSEMBLY
          if (i === useLevel) {
            let partIndex = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === item.PartNumber && x.AssemblyPartNumber === item.AssemblyPartNumber)
            let partObj = calculationForPart(conversionGrid, item, 'CC')

            tempArrForCosting = Object.assign([...tempArrForCosting], { [partIndex]: partObj })
            let otherPart = tempArrForCosting && tempArrForCosting.filter((x) => x.PartNumber === item.PartNumber && x.AssemblyPartNumber === item.AssemblyPartNumber)
            let tempArrForCosting1 = tempArrForCosting
            otherPart && otherPart.map((item1) => {
              let partIndexOther = tempArrForCosting1 && tempArrForCosting1.findIndex((x) => x.PartNumber === item1.PartNumber && x.AssemblyPartNumber === item1.AssemblyPartNumber)
              let partObjOtherPart = calculationForPart(conversionGrid, item1, 'CC')
              tempArrForCosting1 = Object.assign([...tempArrForCosting1], { [partIndexOther]: partObjOtherPart })
              return null
            })
            tempArrForCosting = [...tempArrForCosting1]
            initialPartNo = item.AssemblyPartNumber
            quant = item?.CostingPartDetails?.Quantity
          }
          else {
            // THIS ELSE CONDITION WILL RUN FOR ALL SUBASSEMBLY COSTING CALCULATION (WILL FIND PARENT ON THE BASIS OF PARENT NO PRESENT IN IT'S CHILD)
            let indexForUpdate = _.findIndex(tempArrForCosting, ['PartNumber', initialPartNo]);
            let objectToUpdate = tempArrForCosting[indexForUpdate]

            if (objectToUpdate.PartType === 'Sub Assembly') {
              let tempArr = _.filter(tempArrForCosting, ['AssemblyPartNumber', initialPartNo]);
              initialPartNo = objectToUpdate.AssemblyPartNumber

              let subAssemObj = calculationForSubAssembly(objectToUpdate, quant, 'CC', tempArr)
              quant = objectToUpdate?.CostingPartDetails?.Quantity
              tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })
            }
          }
        }
      }
      return tempArrForCosting
    }

    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {
        // TO FIND THE LEVEL OF PART ON WHICH COSTING IS DONE
        const level = params.BOMLevel
        const useLevel = level.split('L')[1]

        //GETTING LASTEST COSTING OF ASSEMBLY,SUBASSEMBLY AND PART FROM LOCAL STORAGE
        let tempArrForCosting = JSON.parse(sessionStorage.getItem('costingArray'))
        //CALCULATION FOR PART/COMPONENT AND SUBASSEMBLY COSTING (PROCESS/OPERATION,OTHEROPEARTION COST)
        tempArrForCosting = calculateValue(useLevel, item, tempArrForCosting)
        // THIS ARRAY IS FOR FINDING THE SUBASSEMBLIES  WHICH  HAVE SAME PART ON WHICH WE ARE DOING COSTING
        let Arr = tempArrForCosting && tempArrForCosting.filter(costing => costing.PartNumber === item.PartNumber && costing.AssemblyPartNumber !== item.AssemblyPartNumber)
        // THIS ARRAY IS FOR CALCUALTING THE COSTING OF ALL PARTS (WHICH HAVE SAME PART NUMBER ON WHICH WE ARE DOING COSTING) AND SUBASSEMBLY(CONTAINIG SAME PART NUMBER)
        Arr && Arr.map(costingItem => {
          const level = costingItem.BOMLevel
          const useLevel = level.split('L')[1]
          tempArrForCosting = calculateValue(useLevel, costingItem, tempArrForCosting)
          return null
        })
        // MAIN ASSEMBLY CALCULATION
        let subAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item => item.BOMLevel === 'L1' && item.PartType === 'Sub Assembly')
        let partAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item => item.BOMLevel === 'L1' && item.PartType === 'Part')
        let assemblyObj = tempArrForCosting[0]
        // WILL RUN IF IT IS ASSEMBLY COSTING. WILL NOT RUN FOR COMPONENT COSTING
        if (assemblyObj?.CostingPartDetails?.PartType === 'Assembly') {
          assemblyObj.CostingPartDetails.TotalOperationCostSubAssembly = setOperationCostForAssembly(subAssemblyArray)
          assemblyObj.CostingPartDetails.TotalOperationCostComponent = getCCTotalCostForAssembly(partAssemblyArray)
          assemblyObj.CostingPartDetails.TotalConversionCostWithQuantity = setConversionCostAssembly(subAssemblyArray) + checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostComponent)
          assemblyObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalConversionCostWithQuantity)
          assemblyObj.CostingPartDetails.TotalOtherOperationCostPerAssembly = setOtherOperationForSubAssembly([...subAssemblyArray, ...partAssemblyArray])
          tempArrForCosting = Object.assign([...tempArrForCosting], { 0: assemblyObj })
        }
        // STORING CALCULATED AND UPDATED COSTING VALUE IN LOCAL STORAGE
        sessionStorage.setItem('costingArray', JSON.stringify([]))
        sessionStorage.setItem('costingArray', JSON.stringify(tempArrForCosting))

        return i;
      });
      // CALLING THIS FUNCTION TO UPDATE THE COSTING VALUE ON UI (RMMCCTABDATA REDUCER)
      updateCostingValuesInStructure()
    } catch (error) {

    }
    return tempArr;
  }

  /**
   * @method setToolCost
   * @description SET TOOL COST
   */
  const setToolCost = (toolGrid, params) => {
    setToolCostInDataList(toolGrid, params, RMCCTabData)
  }

  const setToolCostInDataList = (toolGrid, params, arr) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {

        if (i.IsAssemblyPart === true) {

          i.CostingPartDetails.ToolsCostTotal = getToolTotalCost(i.CostingChildPartDetails, toolGrid && toolGrid.ToolsCostTotal !== undefined ? checkForNull(toolGrid.ToolsCostTotal) : 0, params);
          i.CostingPartDetails.TotalToolCost = getToolTotalCost(i.CostingChildPartDetails, toolGrid && toolGrid.ToolsCostTotal !== undefined ? checkForNull(toolGrid.ToolsCostTotal) : 0, params);
          setToolCostInDataList(toolGrid, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          i.CostingPartDetails.IsShowToolCost = true;
          i.CostingPartDetails.IsToolCostProcessWise = true;
          i.CostingPartDetails.CostingConversionCost = toolGrid;
          i.CostingPartDetails.TotalToolCost = toolGrid && toolGrid.ToolsCostTotal !== undefined ? checkForNull(toolGrid.ToolsCostTotal) : 0;

        } else {
          setToolCostInDataList(toolGrid, params, i.CostingChildPartDetails)
        }
        return i;
      });


    } catch (error) {

    }
    return tempArr;
  }

  /**
  * @method toggleAssembly
  * @description SET PART DETAILS
  */
  const toggleAssembly = (BOMLevel, PartNumber, Children = {}) => {
    let tempErrorObjRMCC = { ...ErrorObjRMCC }
    delete tempErrorObjRMCC?.bopGridFields
    if (errorCheck(ErrorObjRMCC) || errorCheckObject(tempErrorObjRMCC) || errorCheckObject(ErrorObjOverheadProfit)) return false;

    let updatedArr = JSON.parse(sessionStorage.getItem('costingArray'))
    let tempPartNumber = []
    updatedArr && updatedArr.map((item) => {
      if (item.IsCostingLocked === true) {
        tempPartNumber.push(item.PartNumber)
      }
      return null
    })
    dispatch(setMessageForAssembly(tempPartNumber.join(',')))
    setAssembly(BOMLevel, PartNumber, Children, RMCCTabData)
  }

  /**
  * @method setAssembly
  * @description SET PART DETAILS
  */
  const setAssembly = (BOMLevel, PartNumber, Children, RMCCTabData) => {
    let updatedArr = []
    try {



      RMCCTabData && RMCCTabData.map(i => {

        const params = { BOMLevel: BOMLevel, PartNumber: PartNumber };
        i.CostingChildPartDetails = BOMLevel !== LEVEL0 ? ChangeBOMLeveL(Children.CostingChildPartDetails, BOMLevel) : i.CostingChildPartDetails;
        i.CostingPartDetails = Children?.CostingPartDetails;
        i.IsAssemblyPart = true;
        i.IsOpen = !i.IsOpen;
        let tempArrForCosting = JSON.parse(sessionStorage.getItem('costingArray'))
        if (params.BOMLevel !== LEVEL0) {
          let childArray = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === params.PartNumber)
          let subbAssemblyIndex = tempArrForCosting && tempArrForCosting.findIndex(item => item.PartNumber === params.PartNumber)

          let subAssemblyToUpdate = tempArrForCosting[subbAssemblyIndex]
          let ccSubAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === subAssemblyToUpdate.PartNumber && item.BOMLevel !== LEVEL0 && item.PartType === 'Sub Assembly')
          let ccPartAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === subAssemblyToUpdate.PartNumber && item.BOMLevel !== LEVEL0 && item.PartType === 'Part')
          subAssemblyToUpdate.CostingChildPartDetails = BOMLevel !== LEVEL0 ? ChangeBOMLeveL(childArray, BOMLevel) : childArray
          subAssemblyToUpdate.CostingPartDetails.IsOpen = subAssemblyToUpdate.PartType !== "Part" ? !subAssemblyToUpdate?.CostingPartDetails?.IsOpen : false
          if (!subAssemblyToUpdate.IsLocked && !subAssemblyToUpdate.IsPartLocked && !CostingViewMode) {
            subAssemblyToUpdate.CostingPartDetails.TotalRawMaterialsCostWithQuantity = 0
            subAssemblyToUpdate.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = 0
            subAssemblyToUpdate.CostingPartDetails.TotalConversionCostWithQuantity = 0
            subAssemblyToUpdate.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = 0
            subAssemblyToUpdate.CostingPartDetails.RawMaterialCostWithCutOff = 0
            subAssemblyToUpdate.CostingPartDetails.TotalRawMaterialsCostWithQuantity = setRMCostForAssembly(childArray)
            subAssemblyToUpdate.CostingPartDetails.RawMaterialCostWithCutOff = setRMCutOffCostForAssembly(childArray)
            subAssemblyToUpdate.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = setBOPCostAssembly(childArray) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.BOPHandlingCharges)
            subAssemblyToUpdate.CostingPartDetails.TotalOperationCostPerAssembly = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalOperationCostPerAssembly)
            subAssemblyToUpdate.CostingPartDetails.TotalOperationCostSubAssembly = setOperationCostForAssembly(ccSubAssemblyArray)
            subAssemblyToUpdate.CostingPartDetails.TotalOperationCostComponent = getCCTotalCostForAssembly(ccPartAssemblyArray)
            subAssemblyToUpdate.CostingPartDetails.TotalConversionCostWithQuantity = setConversionCostAssembly(childArray) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalOperationCostPerAssembly)
            subAssemblyToUpdate.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = (checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalConversionCostWithQuantity)) * checkForNull(subAssemblyToUpdate?.Quantity)
            subAssemblyToUpdate.CostingPartDetails.TotalOtherOperationCostPerAssembly = setOtherOperationForSubAssembly(childArray)

          }
          tempArrForCosting = Object.assign([...tempArrForCosting], { [subbAssemblyIndex]: subAssemblyToUpdate })
          const level = params.BOMLevel
          const useLevel = level.split('L')[1]
          let initialPartNo = subAssemblyToUpdate.AssemblyPartNumber
          let quant = subAssemblyToUpdate?.CostingPartDetails?.Quantity
          if (useLevel > 1 && !subAssemblyToUpdate.IsLocked && !subAssemblyToUpdate.IsPartLocked && !CostingViewMode) {
            for (let i = useLevel + 1; i > 0; i--) {

              // IF LEVEL WE ARE WORKING IS OF PART TYPE UNDER SOME SUBASSMEBLY 
              let indexForUpdate = _.findIndex(tempArrForCosting, ['PartNumber', initialPartNo]);
              let objectToUpdate = tempArrForCosting[indexForUpdate]
              if (objectToUpdate.PartType === 'Sub Assembly') {
                let childTempArr = _.filter(tempArrForCosting, ['AssemblyPartNumber', initialPartNo]);
                let subAssemObj = calculationForSubAssembly(objectToUpdate, quant, 'Sub Assembly', childTempArr)
                initialPartNo = objectToUpdate.AssemblyPartNumber
                quant = objectToUpdate?.CostingPartDetails?.Quantity
                tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })

              }
            }
          }
        }
        let assemblyObj = tempArrForCosting[0]

        let subAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === assemblyObj.PartNumber && item.BOMLevel !== LEVEL0)
        let ccSubAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === assemblyObj.PartNumber && item.BOMLevel !== LEVEL0 && item.PartType === 'Sub Assembly')
        let ccPartAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === assemblyObj.PartNumber && item.BOMLevel !== LEVEL0 && item.PartType === 'Part')

        assemblyObj.CostingChildPartDetails = subAssemblyArray

        assemblyObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity = setRMCostForAssembly(subAssemblyArray)
        assemblyObj.CostingPartDetails.RawMaterialCostWithCutOff = setRMCutOffCostForAssembly(subAssemblyArray)
        assemblyObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = setBOPCostAssembly(subAssemblyArray) + checkForNull(assemblyObj?.CostingPartDetails?.BOPHandlingCharges)
        assemblyObj.CostingPartDetails.TotalOperationCostPerAssembly = checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostPerAssembly)
        assemblyObj.CostingPartDetails.TotalOperationCostSubAssembly = setOperationCostForAssembly(ccSubAssemblyArray)
        assemblyObj.CostingPartDetails.TotalOperationCostComponent = getCCTotalCostForAssembly(ccPartAssemblyArray)
        assemblyObj.CostingPartDetails.TotalConversionCostWithQuantity = setConversionCostAssembly(subAssemblyArray) + checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.IndirectLaborCost) + checkForNull(assemblyObj?.CostingPartDetails?.StaffCost) + checkForNull(assemblyObj?.CostingPartDetails?.NetLabourCost)
        assemblyObj.CostingPartDetails.IsOpen = params.BOMLevel !== LEVEL0 ? true : !assemblyObj?.CostingPartDetails?.IsOpen
        assemblyObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalConversionCostWithQuantity)

        assemblyObj.CostingPartDetails.TotalOtherOperationCostPerAssembly = setOtherOperationForSubAssembly([...ccSubAssemblyArray, ...ccPartAssemblyArray])


        tempArrForCosting = Object.assign([...tempArrForCosting], { 0: assemblyObj })
        sessionStorage.setItem('costingArray', JSON.stringify([]))
        sessionStorage.setItem('costingArray', JSON.stringify(tempArrForCosting))
        const mapArray = (data) => data.map(item => {
          let newItem = item
          let updatedArr1 = JSON.parse(sessionStorage.getItem('costingArray'))
          let obj = updatedArr1 && updatedArr1.find(updateditem => updateditem.PartNumber === newItem.PartNumber && updateditem.AssemblyPartNumber === newItem.AssemblyPartNumber)
          newItem.CostingPartDetails.Quantity = obj?.CostingPartDetails?.Quantity
          newItem.CostingPartDetails.IsOpen = obj?.CostingPartDetails?.IsOpen
          newItem.IsAssemblyPart = true
          newItem.CostingChildPartDetails = obj.CostingChildPartDetails
          newItem.CostingPartDetails.IsApplyBOPHandlingCharges = obj?.CostingPartDetails?.IsApplyBOPHandlingCharges;
          newItem.CostingPartDetails.BOPHandlingChargeApplicability = obj?.CostingPartDetails?.BOPHandlingChargeApplicability;
          newItem.CostingPartDetails.BOPHandlingPercentage = obj?.CostingPartDetails?.BOPHandlingPercentage;
          newItem.CostingPartDetails.BOPHandlingCharges = obj?.CostingPartDetails?.BOPHandlingCharges;
          newItem.CostingPartDetails.TotalRawMaterialsCost = checkForNull(obj?.CostingPartDetails?.TotalRawMaterialsCost)
          newItem.CostingPartDetails.TotalRawMaterialsCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity)
          newItem.CostingPartDetails.RawMaterialCostWithCutOff = checkForNull(obj?.CostingPartDetails?.RawMaterialCostWithCutOff)
          newItem.CostingPartDetails.TotalBoughtOutPartCost = checkForNull(obj?.CostingPartDetails?.TotalBoughtOutPartCost)
          newItem.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity)
          newItem.CostingPartDetails.TotalConversionCost = checkForNull(obj?.CostingPartDetails?.TotalConversionCost)
          newItem.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalConversionCostWithQuantity)
          newItem.CostingPartDetails.TotalOperationCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TotalOperationCostPerAssembly)
          newItem.CostingPartDetails.TotalOperationCostSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalOperationCostSubAssembly)
          newItem.CostingPartDetails.TotalOperationCostComponent = checkForNull(obj?.CostingPartDetails?.TotalOperationCostComponent)
          //Operation for subassembly key will come here 
          newItem.CostingPartDetails.TotalCalculatedRMBOPCCCost = checkForNull(obj?.CostingPartDetails?.TotalCalculatedRMBOPCCCost)
          newItem.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity)
          newItem.CostingPartDetails.IsRMCutOffApplicable = obj?.CostingPartDetails?.IsRMCutOffApplicable
          newItem.CostingPartDetails.TotalOtherOperationCostPerAssembly = obj?.CostingPartDetails?.TotalOtherOperationCostPerAssembly
          newItem.CostingPartDetails.BasicRate = obj?.CostingPartDetails?.BasicRate
          if (item.CostingChildPartDetails.length > 0) {
            mapArray(newItem.CostingChildPartDetails)
          }
          return newItem
        })
        const updatedArr1 = mapArray(RMCCTabData)

        dispatch(setRMCCData(updatedArr1, () => { }))
        return i;
      });

    } catch (error) {

    }
    return updatedArr;

  }

  /**
  * @method ChangeBOMLeveL
  * @description INCREASE BOM LEVEL BY 1 
  */
  const ChangeBOMLeveL = (item, level) => {
    let tempArr = [];
    const ChangedLevel = parseInt(level.substr(1, level.length - 1)) + 1;
    tempArr = item && item.map(i => {
      i.BOMLevel = "L" + ChangedLevel;
      return i;
    });
    return tempArr;
  }

  /**
 * @method setPartDetails
 * @description SET PART DETAILS
 */
  const setPartDetails = (BOMLevel, PartNumber, Data, item) => {
    let arr = formatData(BOMLevel, PartNumber, Data, RMCCTabData, item)

    dispatch(setRMCCData(arr, () => { }))
  }


  /**
 * @method formatData
 * @description FORMATE DATA FOR SET PART DETAILS
 */
  const formatData = (BOMLevel, PartNumber, Data, RMCCTabData, item) => {
    let tempArr = [];
    try {
      tempArr = RMCCTabData && RMCCTabData.map(i => {
        const params = { BOMLevel: BOMLevel, PartNumber: PartNumber };
        let tempArrForCosting = JSON.parse(sessionStorage.getItem('costingArray'))

        if (i.IsAssemblyPart === true) {
          i.CostingPartDetails = { ...i?.CostingPartDetails };

          if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel && i.AssemblyPartNumber === item.AssemblyPartNumber) {
            i.CostingPartDetails = Data
            let tempIsOpen = !i.IsOpen
            i.IsOpen = tempIsOpen
            let subAssemblyIndex = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === params.PartNumber && x.AssemblyPartNumber === item.AssemblyPartNumber)
            let tempArr = tempArrForCosting[subAssemblyIndex]
            tempArr.IsOpen = tempIsOpen
            tempArr.CostingPartDetails = Data
            // tempArr[0].IsOpen = tempIsOpen


            // let childTempArr = tempArrForCosting && tempArrForCosting.filter(childItem => childItem.AssemblyPartNumber === initialPartNo)
            // let subAssemObj = calculationForSubAssembly(objectToUpdate, quant, 'Sub Assembly', childTempArr)
            // initialPartNo = objectToUpdate.AssemblyPartNumber
            // quant = objectToUpdate?.CostingPartDetails?.Quantity
            tempArrForCosting = Object.assign([...tempArrForCosting], { [subAssemblyIndex]: tempArr })




            sessionStorage.setItem('costingArray', JSON.stringify([]))
            sessionStorage.setItem('costingArray', JSON.stringify(tempArrForCosting))



          } else {
            i.IsOpen = false
          }
          formatData(BOMLevel, PartNumber, Data, i.CostingChildPartDetails, item)

        } else if (i.PartNumber === PartNumber && i.BOMLevel === BOMLevel && i.AssemblyPartNumber === item.AssemblyPartNumber) {      //SINGLE COMPONENT

          i.CostingPartDetails = { ...Data, Quantity: i?.CostingPartDetails?.Quantity };


          i.IsOpen = !i.IsOpen;

        }
        else {
          i.IsOpen = false;
          formatData(BOMLevel, PartNumber, Data, i.CostingChildPartDetails, item)
        }
        return i;

      });
    } catch (error) {

    }
    return tempArr;
  }



  const setAssemblyLabourCost = (data) => {
    let tempArrForCosting = JSON.parse(sessionStorage.getItem('costingArray'))

    tempArrForCosting[0].CostingPartDetails.NetLabourCRMHead = data.NetLabourCRMHead ? data.NetLabourCRMHead : ''
    tempArrForCosting[0].CostingPartDetails.IndirectLabourCRMHead = data.IndirectLabourCRMHead ? data.IndirectLabourCRMHead : ''
    tempArrForCosting[0].CostingPartDetails.StaffCRMHead = data.StaffCRMHead ? data.StaffCRMHead : ''
    tempArrForCosting[0].CostingPartDetails.IndirectLaborCost = data.IndirectLaborCost
    tempArrForCosting[0].CostingPartDetails.IndirectLaborCostPercentage = data.IndirectLaborCostPercentage
    tempArrForCosting[0].CostingPartDetails.StaffCost = data.StaffCost
    tempArrForCosting[0].CostingPartDetails.StaffCostPercentage = data.StaffCostPercentage
    tempArrForCosting[0].CostingPartDetails.NetLabourCost = data.NetLabourCost
    tempArrForCosting[0].CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(tempArrForCosting[0]?.CostingPartDetails?.TotalOperationCostComponent) + checkForNull(tempArrForCosting[0]?.CostingPartDetails?.TotalOperationCostSubAssembly) + checkForNull(tempArrForCosting[0]?.CostingPartDetails?.TotalOperationCostPerAssembly) + checkForNull(data.IndirectLaborCost) + checkForNull(data.StaffCost) + checkForNull(data.NetLabourCost)

    // tempArrForCosting[0].CostingChildPartDetails.oldTotalLabourCost = Number(data.NetLabourCost) + Number(data.StaffCost) + Number(data.IndirectLaborCost)
    sessionStorage.setItem('costingArray', JSON.stringify([]))
    sessionStorage.setItem('costingArray', JSON.stringify(tempArrForCosting))

    const mapArray = (data) => data.map(item => {
      let newItem = item
      let updatedArr = JSON.parse(sessionStorage.getItem('costingArray'))
      let obj = updatedArr && updatedArr.find(updateditem => updateditem.PartNumber === newItem.PartNumber && updateditem.AssemblyPartNumber === newItem.AssemblyPartNumber)

      if (obj && Object.keys(obj).length > 0) {
        newItem.CostingPartDetails.IsApplyBOPHandlingCharges = obj?.CostingPartDetails?.IsApplyBOPHandlingCharges;
        newItem.CostingPartDetails.BOPHandlingChargeApplicability = obj?.CostingPartDetails?.BOPHandlingChargeApplicability;
        newItem.CostingPartDetails.BOPHandlingPercentage = obj?.CostingPartDetails?.BOPHandlingPercentage;
        newItem.CostingPartDetails.BOPHandlingCharges = obj?.CostingPartDetails?.BOPHandlingCharges;
        newItem.CostingPartDetails.TotalOperationCostSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalOperationCostSubAssembly)
        newItem.CostingPartDetails.TotalOperationCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TotalOperationCostPerAssembly)
        newItem.CostingPartDetails.CostingOperationCostResponse = obj?.CostingPartDetails?.CostingOperationCostResponse
        newItem.CostingPartDetails.TotalOperationCostComponent = checkForNull(obj?.CostingPartDetails?.TotalOperationCostComponent)
        newItem.CostingPartDetails.TotalConversionCost = checkForNull(obj?.CostingPartDetails?.TotalConversionCost)
        newItem.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalConversionCostWithQuantity)
        newItem.CostingPartDetails.TotalCalculatedRMBOPCCCost = checkForNull(obj?.CostingPartDetails?.TotalCalculatedRMBOPCCCost)
        newItem.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity)
        newItem.CostingPartDetails.IsRMCutOffApplicable = obj?.CostingPartDetails?.IsRMCutOffApplicable
        newItem.CostingPartDetails.TotalOtherOperationCostPerAssembly = obj?.CostingPartDetails?.TotalOtherOperationCostPerAssembly

        newItem.CostingPartDetails.IndirectLaborCost = obj?.CostingPartDetails?.IndirectLaborCost
        newItem.CostingPartDetails.IndirectLaborCostPercentage = obj?.CostingPartDetails?.IndirectLaborCostPercentage
        newItem.CostingPartDetails.StaffCost = obj?.CostingPartDetails?.StaffCost
        newItem.CostingPartDetails.StaffCostPercentage = obj?.CostingPartDetails?.StaffCostPercentage
        newItem.CostingPartDetails.NetLabourCost = obj?.CostingPartDetails?.NetLabourCost

        newItem.CostingPartDetails.NetLabourCRMHead = obj?.CostingPartDetails?.NetLabourCRMHead
        newItem.CostingPartDetails.IndirectLabourCRMHead = obj?.CostingPartDetails?.IndirectLabourCRMHead
        newItem.CostingPartDetails.StaffCRMHead = obj?.CostingPartDetails?.StaffCRMHead

      }
      if (item.CostingChildPartDetails.length > 0) {
        mapArray(newItem.CostingChildPartDetails)
      }
      return newItem
    })
    const updatedArr = mapArray(RMCCTabData)

    dispatch(setRMCCData(updatedArr, () => { }))


  }


  /**
  * @method setAssemblyOperationCost
  * @description SET RM COST
  */
  const setAssemblyOperationCost = (OperationGrid, params, IsGridChanged, item) => {
    setAssemblyOperationCostInDataList(OperationGrid, params, RMCCTabData, IsGridChanged, item)


  }

  const setAssemblyOperationCostInDataList = (OperationGrid, params, arr, IsGridChanged, item) => {


    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {
        if (IsGridChanged) {

          const level = params.BOMLevel
          const useLevel = level.split('L')[1]
          let initialPartNo = ''
          let quant = ''
          let tempArrForCosting = JSON.parse(sessionStorage.getItem('costingArray'))

          for (let i = useLevel; i >= 0; i--) {

            if (item.PartType === "Sub Assembly") {
              // IF LEVEL WE ARE WOKRING IS OF SUBASSEMBLY TYPE UNDER SOME SUBASSMEBLY OR ASSEMBLY
              if (i === useLevel) { // SUB ASSEMBLY LEVEL HERE
                let checkIsAssemblyOpen = tempArrForCosting && tempArrForCosting.filter((x) => x.AssemblyPartNumber === item.PartNumber)
                let subAssemblyIndex = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === params.PartNumber && x.AssemblyPartNumber === item.AssemblyPartNumber)
                let subAssembObj = tempArrForCosting[subAssemblyIndex]
                //THIS ARRAY IS FOR GETTING CHILD UNDER SUBASSEMBLY (COMPONENT CHILD)
                let tempArr = tempArrForCosting && tempArrForCosting.filter((x) => x.AssemblyPartNumber === params.PartNumber && x.PartType === 'Part')
                subAssembObj.CostingPartDetails.CostingOperationCostResponse = OperationGrid;
                subAssembObj.CostingPartDetails.TotalOperationCostPerAssembly = GetOperationCostTotal(OperationGrid);
                if (checkIsAssemblyOpen.length !== 0) {
                  subAssembObj.CostingPartDetails.TotalOperationCostComponent = getCCTotalCostForAssembly(tempArr)
                  let subAssemblyArray = tempArrForCosting && tempArrForCosting.filter(x => x.AssemblyPartNumber === params.PartNumber && x.PartType === 'Sub Assembly')
                  subAssembObj.CostingPartDetails.TotalOperationCostSubAssembly = setOperationCostForAssembly(subAssemblyArray)
                }
                subAssembObj.CostingPartDetails.TotalConversionCost =
                  checkForNull(subAssembObj?.CostingPartDetails?.TotalOperationCostComponent) +
                  checkForNull(subAssembObj?.CostingPartDetails?.TotalOperationCostSubAssembly) +
                  checkForNull(subAssembObj?.CostingPartDetails?.TotalOperationCostPerAssembly)
                subAssembObj.CostingPartDetails.TotalConversionCostWithQuantity = subAssembObj?.CostingPartDetails?.TotalConversionCost

                let GrandTotalCost = checkForNull(subAssembObj?.CostingPartDetails?.TotalRawMaterialsCost) + checkForNull(subAssembObj?.CostingPartDetails?.TotalBoughtOutPartCost) + checkForNull(subAssembObj?.CostingPartDetails?.TotalConversionCost)
                subAssembObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
                subAssembObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = subAssembObj?.CostingPartDetails?.TotalCalculatedRMBOPCCCost * subAssembObj?.CostingPartDetails?.Quantity

                tempArrForCosting = Object.assign([...tempArrForCosting], { [subAssemblyIndex]: subAssembObj })
                initialPartNo = item.AssemblyPartNumber //ASSEMBLY PART NO OF SUBASSEMBLY
                quant = item?.CostingPartDetails?.Quantity
              } else {
                let indexForUpdate = _.findIndex(tempArrForCosting, ['PartNumber', initialPartNo]); //WILL GIVE PARENT ASSEMBLY (SUBASSEMBLY /ASSEMBLY)
                let objectToUpdate = tempArrForCosting[indexForUpdate]
                if (objectToUpdate.PartType === 'Sub Assembly') {
                  let tempArr = _.filter(tempArrForCosting, ['AssemblyPartNumber', initialPartNo]);
                  initialPartNo = objectToUpdate.AssemblyPartNumber
                  let subAssemObj = calculationForSubAssembly(objectToUpdate, quant, 'Sub Assembly Operation', tempArr)


                  quant = objectToUpdate?.CostingPartDetails?.Quantity
                  tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })
                }
              }
            }
          }

          let Arr = tempArrForCosting && tempArrForCosting.filter(costing => costing.PartNumber === item.PartNumber && costing.AssemblyPartNumber !== item.AssemblyPartNumber)
          Arr && Arr.map(costingItem => {
            const level = costingItem.BOMLevel
            const useLevel = level.split('L')[1]
            let initialPartNo = ''
            let quant = ''
            for (let i = useLevel; i >= 0; i--) {
              if (costingItem.PartType === "Sub Assembly") {
                // IF LEVEL WE ARE WORKING IS OF PART TYPE UNDER SOME SUBASSMEBLY OR ASSEMBLY
                if (i === useLevel) {
                  let subAssemblyIndex = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === params.PartNumber && x.AssemblyPartNumber === item.AssemblyPartNumber)
                  let subAssembObj = tempArrForCosting[subAssemblyIndex]
                  //THIS ARRAY IS FOR GETTING CHILD UNDER SUBASSEMBLY (COMPONENT CHILD)
                  let tempArr = tempArrForCosting && tempArrForCosting.filter((x) => x.AssemblyPartNumber === params.PartNumber && x.PartType === 'Part')
                  subAssembObj.CostingPartDetails.CostingOperationCostResponse = OperationGrid;
                  subAssembObj.CostingPartDetails.TotalOperationCostComponent = getCCTotalCostForAssembly(tempArr)
                  subAssembObj.CostingPartDetails.TotalOperationCostPerAssembly = GetOperationCostTotal(OperationGrid);
                  //THIS ARRAY IS FOR GETTING CHILD UNDER SUBASSEMBLY (SUB ASSEMBLY CHILD)
                  let subAssemblyArray = tempArrForCosting && tempArrForCosting.filter(x => x.AssemblyPartNumber === params.PartNumber && x.PartType === 'Sub Assembly')
                  subAssembObj.CostingPartDetails.TotalOperationCostSubAssembly = setOperationCostForAssembly(subAssemblyArray)
                  subAssembObj.CostingPartDetails.TotalConversionCost = checkForNull(subAssembObj?.CostingPartDetails?.TotalOperationCostComponent) + checkForNull(subAssembObj?.CostingPartDetails?.TotalOperationCostSubAssembly) + checkForNull(subAssembObj?.CostingPartDetails?.TotalOperationCostPerAssembly)
                  subAssembObj.CostingPartDetails.TotalConversionCostWithQuantity = subAssembObj?.CostingPartDetails?.TotalConversionCost  //NEED TO CONFRIM THIS CALCULATION
                  let GrandTotalCost = checkForNull(subAssembObj?.CostingPartDetails?.TotalRawMaterialsCost) + checkForNull(subAssembObj?.CostingPartDetails?.TotalBoughtOutPartCost) + checkForNull(subAssembObj?.CostingPartDetails?.TotalConversionCost)
                  subAssembObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
                  subAssembObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = subAssembObj?.CostingPartDetails?.TotalCalculatedRMBOPCCCost * subAssembObj?.CostingPartDetails?.Quantity
                  tempArrForCosting = Object.assign([...tempArrForCosting], { [subAssemblyIndex]: subAssembObj })
                  initialPartNo = item.AssemblyPartNumber //ASSEMBLY PART NO OF SUBASSEMBLY
                  quant = item?.CostingPartDetails?.Quantity
                }
                else {
                  let indexForUpdate = _.findIndex(tempArrForCosting, ['PartNumber', initialPartNo]); //WILL GIVE PARENT ASSEMBLY (SUBASSEMBLY /ASSEMBLY)
                  let objectToUpdate = tempArrForCosting[indexForUpdate]
                  if (objectToUpdate.PartType === 'Sub Assembly') {
                    let tempArr = _.filter(tempArrForCosting, ['AssemblyPartNumber', initialPartNo]);
                    initialPartNo = objectToUpdate.AssemblyPartNumber
                    let subAssemObj = calculationForSubAssembly(objectToUpdate, quant, 'Sub Assembly Operation', tempArr)
                    quant = objectToUpdate?.CostingPartDetails?.Quantity
                    tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })
                  }
                }
              }
            }
            return null
          })
          let assemblyObj = tempArrForCosting[0]
          if (tempArrForCosting.length > 1) {
            let subAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item => item.BOMLevel === LEVEL1 && item.PartType === 'Sub Assembly')
            let componentArray = tempArrForCosting && tempArrForCosting.filter(item => item.BOMLevel === LEVEL1 && item.PartType === 'Part')
            assemblyObj.CostingPartDetails.TotalOperationCostSubAssembly = checkForNull(setOperationCostForAssembly(subAssemblyArray))
            assemblyObj.CostingPartDetails.TotalOperationCostComponent = checkForNull(getCCTotalCostForAssembly(componentArray))
          }
          assemblyObj.CostingPartDetails.TotalOperationCostPerAssembly = params.BOMLevel === LEVEL0 ? GetOperationCostTotal(OperationGrid) : checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostPerAssembly)
          assemblyObj.CostingPartDetails.CostingOperationCostResponse = params.BOMLevel === LEVEL0 ? OperationGrid : assemblyObj?.CostingPartDetails?.CostingOperationCostResponse.length > 0 ? assemblyObj?.CostingPartDetails?.CostingOperationCostResponse : [];
          assemblyObj.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostSubAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.IndirectLaborCost) + checkForNull(assemblyObj?.CostingPartDetails?.StaffCost) + checkForNull(assemblyObj?.CostingPartDetails?.NetLabourCost)
          assemblyObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = checkForNull(assemblyObj?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalConversionCostWithQuantity)
          assemblyObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalConversionCostWithQuantity) * assemblyObj?.CostingPartDetails?.Quantity
          tempArrForCosting = Object.assign([...tempArrForCosting], { 0: assemblyObj })
          sessionStorage.setItem('costingArray', JSON.stringify([]))
          sessionStorage.setItem('costingArray', JSON.stringify(tempArrForCosting))
          return i;
        }
        return null
      });
      const mapArray = (data) => data.map(item => {
        let newItem = item
        let updatedArr = JSON.parse(sessionStorage.getItem('costingArray'))
        let obj = updatedArr && updatedArr.find(updateditem => updateditem.PartNumber === newItem.PartNumber && updateditem.AssemblyPartNumber === newItem.AssemblyPartNumber)
        if (obj && Object.keys(obj).length > 0) {
          newItem.CostingPartDetails.IsApplyBOPHandlingCharges = obj?.CostingPartDetails?.IsApplyBOPHandlingCharges;
          newItem.CostingPartDetails.BOPHandlingChargeApplicability = obj?.CostingPartDetails?.BOPHandlingChargeApplicability;
          newItem.CostingPartDetails.BOPHandlingPercentage = obj?.CostingPartDetails?.BOPHandlingPercentage;
          newItem.CostingPartDetails.BOPHandlingCharges = obj?.CostingPartDetails?.BOPHandlingCharges;
          newItem.CostingPartDetails.TotalOperationCostSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalOperationCostSubAssembly)
          newItem.CostingPartDetails.TotalOperationCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TotalOperationCostPerAssembly)
          newItem.CostingPartDetails.CostingOperationCostResponse = obj?.CostingPartDetails?.CostingOperationCostResponse
          newItem.CostingPartDetails.TotalOperationCostComponent = checkForNull(obj?.CostingPartDetails?.TotalOperationCostComponent)
          newItem.CostingPartDetails.TotalConversionCost = checkForNull(obj?.CostingPartDetails?.TotalConversionCost)
          newItem.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalConversionCostWithQuantity)
          newItem.CostingPartDetails.TotalCalculatedRMBOPCCCost = checkForNull(obj?.CostingPartDetails?.TotalCalculatedRMBOPCCCost)
          newItem.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity)
          newItem.CostingPartDetails.IsRMCutOffApplicable = obj?.CostingPartDetails?.IsRMCutOffApplicable
          newItem.CostingPartDetails.TotalOtherOperationCostPerAssembly = obj?.CostingPartDetails?.TotalOtherOperationCostPerAssembly
        }
        if (item.CostingChildPartDetails.length > 0) {
          mapArray(newItem.CostingChildPartDetails)
        }
        return newItem
      })
      const updatedArr = mapArray(RMCCTabData)


      dispatch(setRMCCData(updatedArr, () => { }))
    } catch (error) {

    }
    return tempArr;
  }

  /**
  * @method GetOperationCostTotal
  * @description GET TOTAL OPERATION COST FOR ASSEMBLY
  */
  const GetOperationCostTotal = (item) => {
    let NetCost = 0;
    NetCost = item && item.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.OperationCost);
    }, 0)
    return NetCost;
  }

  /**
  * @method setAssemblyToolCost
  * @description SET RM COST
  */
  const setAssemblyToolCost = (ToolGrid, params) => {
    setAssemblyToolCostInDataList(ToolGrid, params, RMCCTabData)
    // dispatch(setRMCCData(arr, () => { }))
  }

  const setAssemblyToolCostInDataList = (ToolGrid, params, arr) => {
    let tempArr = [];
    try {

      tempArr = arr && arr.map(i => {
        if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = GetToolCostTotal(ToolGrid) + checkForNull(i?.CostingPartDetails?.TotalOperationCostPerAssembly);

          i.CostingPartDetails.CostingToolCostResponse = ToolGrid;
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
          i.CostingPartDetails.TotalToolCostPerAssembly = GetToolCostTotal(ToolGrid);
          i.CostingPartDetails.IsShowToolCost = true;
          i.CostingPartDetails.IsToolCostProcessWise = true;

        } else {
          setAssemblyToolCostInDataList(ToolGrid, params, i.CostingChildPartDetails)
        }
        return i;
      });

    } catch (error) {

    }
    return tempArr;
  }

  /**
  * @method GetToolCostTotal
  * @description GET TOTAL OPERATION COST FOR ASSEMBLY
  */
  const GetToolCostTotal = (item) => {
    let NetCost = 0;
    NetCost = item && item.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.TotalToolCost);
    }, 0)
    return NetCost;
  }


  /**
  * @method saveCosting
  * @description SAVE COSTING
  */
  const saveCosting = debounce(handleSubmit(() => {
    let count = 0
    for (var prop in ErrorObjRMCC) {
      if (ErrorObjRMCC && ErrorObjRMCC[prop] && Object.keys(ErrorObjRMCC[prop])?.length > 0) {
        count++
      }
    }

    if (ErrorObjRMCC && count !== 0) return false;

    if (Object.keys(ComponentItemData).length > 0 && ComponentItemData.IsOpen !== false && checkIsDataChange === true) {
      let stCostingData = findSurfaceTreatmentData(ComponentItemData)
      let requestData = {
        "NetRawMaterialsCost": ComponentItemData?.CostingPartDetails?.TotalRawMaterialsCost,
        "NetBoughtOutPartCost": ComponentItemData?.CostingPartDetails?.TotalBoughtOutPartCost,
        "NetConversionCost": ComponentItemData?.CostingPartDetails?.TotalConversionCost,
        "NetOperationCost": ComponentItemData?.CostingPartDetails?.CostingConversionCost && ComponentItemData?.CostingPartDetails?.CostingConversionCost.OperationCostTotal !== undefined ? ComponentItemData?.CostingPartDetails?.CostingConversionCost.OperationCostTotal : 0,
        "NetProcessCost": ComponentItemData?.CostingPartDetails?.CostingConversionCost && ComponentItemData?.CostingPartDetails?.CostingConversionCost.ProcessCostTotal !== undefined ? ComponentItemData?.CostingPartDetails?.CostingConversionCost.ProcessCostTotal : 0,
        "NetOtherOperationCost": ComponentItemData?.CostingPartDetails?.CostingConversionCost && ComponentItemData?.CostingPartDetails?.CostingConversionCost.OtherOperationCostTotal !== undefined ? ComponentItemData?.CostingPartDetails?.CostingConversionCost.OtherOperationCostTotal : 0,
        "NetToolCost": ComponentItemData?.CostingPartDetails?.TotalToolCost,
        "NetTotalRMBOPCC": ComponentItemData?.CostingPartDetails?.TotalCalculatedRMBOPCCCost,
        "TotalCost": costData.IsAssemblyPart ? (stCostingData && Object.keys(stCostingData).length > 0) ? (checkForNull(stCostingData?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(ComponentItemData?.CostingPartDetails?.TotalCalculatedRMBOPCCCost)) : ComponentItemData?.CostingPartDetails?.TotalCalculatedRMBOPCCCost : netPOPrice,
        "BasicRate": costData.IsAssemblyPart ? (stCostingData && Object.keys(stCostingData).length > 0) ? (checkForNull(stCostingData?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(ComponentItemData?.CostingPartDetails?.TotalCalculatedRMBOPCCCost)) : ComponentItemData?.CostingPartDetails?.TotalCalculatedRMBOPCCCost : ComponentItemData?.CostingPartDetails?.BasicRate,
        "LoggedInUserId": loggedInUserId(),
        "EffectiveDate": CostingEffectiveDate,
        "IsSubAssemblyComponentPart": costData.IsAssemblyPart,
        "CostingId": ComponentItemData.CostingId,
        "PartId": ComponentItemData.PartId,                              //ROOT ID
        "CostingNumber": costData.CostingNumber,                         //ROOT    
        "PartNumber": ComponentItemData.PartNumber,                      //ROOT

        // "AssemblyCostingId": ComponentItemData.BOMLevel === LEVEL1 ? costData.CostingId : ComponentItemData.AssemblyCostingId,                  //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
        "AssemblyCostingNumber": ComponentItemData.BOMLevel === LEVEL1 ? costData.CostingNumber : ComponentItemData.AssemblyCostingNumber,      //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
        "AssemblyPartId": ComponentItemData.BOMLevel === LEVEL1 ? ComponentItemData.PartId : ComponentItemData.AssemblyPartId,                               //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
        "AssemblyPartNumber": ComponentItemData.BOMLevel === LEVEL1 ? ComponentItemData.PartNumber : ComponentItemData.AssemblyPartNumber,                   //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
        "AssemblyCostingId": ComponentItemData.AssemblyCostingId,
        "SubAssemblyCostingId": ComponentItemData.SubAssemblyCostingId,
        "PlantId": costData.PlantId,
        "VendorId": costData.VendorId,
        "VendorCode": costData.VendorCode,
        "VendorPlantId": costData.VendorPlantId,
        "TechnologyId": ComponentItemData.TechnologyId,
        "Technology": ComponentItemData.Technology,
        "TypeOfCosting": costData.VendorType,
        "PlantCode": costData.PlantCode,
        "Version": ComponentItemData.Version,
        "ShareOfBusinessPercent": ComponentItemData.ShareOfBusinessPercent,
        "CalculatorType": ComponentItemData?.CostingPartDetails?.CostingRawMaterialsCost && ComponentItemData?.CostingPartDetails?.CostingRawMaterialsCost[0]?.CalculatorType,
        CostingPartDetails: ComponentItemData?.CostingPartDetails,
      }
      if (costData.IsAssemblyPart && !CostingViewMode) {
        const tabData = RMCCTabData[0]
        const surfaceTabData = SurfaceTabData[0]
        const overHeadAndProfitTabData = OverheadProfitTabData[0]
        const discountAndOtherTabData = DiscountCostData

        let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, netPOPrice, getAssemBOPCharge, 1, CostingEffectiveDate, '', '', isPartType, initialConfiguration?.IsAddPaymentTermInNetCost)

        dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
      }

      dispatch(saveComponentCostingRMCCTab(requestData, res => {
        if (res.data.Result) {
          Toaster.success(isBreakupBoughtOutPartCostingFromAPI ? MESSAGES.RMCC_TAB_COSTING_SAVE_SUCCESS_IS_BOP_BREAKUP : MESSAGES.RMCC_TAB_COSTING_SAVE_SUCCESS);
          dispatch(savePartNumber(''))
          dispatch(saveBOMLevel(''))
          dispatch(CloseOpenAccordion())
          dispatch(setComponentItemData({}, () => { }))
          InjectDiscountAPICall()
          dispatch(isDataChange(false))
          dispatch(gridDataAdded(true))

        }
      }))
    }
    else {
      dispatch(savePartNumber(''))
      dispatch(CloseOpenAccordion())
      dispatch(isDataChange(false))
      dispatch(saveBOMLevel(''))
    }
  }), 500)

  const InjectDiscountAPICall = () => {
    let basicRate = 0
    if (Number(isPartType?.value) === PART_TYPE_ASSEMBLY) {
      basicRate = checkForNull(RMCCTabData[0]?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) +
        checkForNull(SurfaceTabData[0]?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
    } else {
      basicRate = checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(RMCCTabData[0]?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) +
        checkForNull(SurfaceTabData[0]?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
    }

    dispatch(saveDiscountOtherCostTab({ ...ComponentItemDiscountData, BasicRate: basicRate, EffectiveDate: CostingEffectiveDate, CallingFrom: 2 }, res => {
      if (Number(previousTab) === 6) {
        dispatch(saveCostingPaymentTermDetail(PaymentTermDataDiscountTab, (res) => { }));
      }
    }))
  }


  const setBOPCostForhandling = (tempArr) => {
    const total = tempArr && tempArr.reduce((accummlator, item) => {
      if (item.PartType === 'Part' || item.PartType === 'BOP') {
        return accummlator + checkForNull(item?.CostingPartDetails?.TotalBoughtOutPartCost) * checkForNull(item?.CostingPartDetails?.Quantity)
      } else {

        return accummlator + checkForNull(item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) * checkForNull(item?.CostingPartDetails?.Quantity)
      }
    }, 0)
    return total
  }


  /**
   * @function setBOPCostWithAsssembly
   * @description FOR APPLYING BOP HANDLING CHARGE TO ASSEMBLY (ONLY FOR ASSEMBLY)
  */
  const setBOPCostWithAsssembly = (obj, item) => {
    let tempArrForCosting = JSON.parse(sessionStorage.getItem('costingArray'))
    const calculateBOPHandlingForSubAssemblies = (useLevel, item, tempArrForCosting) => {
      let initialPartNo = ''
      let quant = ''
      for (let i = useLevel; i >= 0; i--) {

        if (item.PartType === "Sub Assembly") {
          // IF LEVEL WE ARE WOKRING IS OF SUBASSEMBLY TYPE UNDER SOME SUBASSMEBLY OR ASSEMBLY
          if (i === useLevel) { // SUB ASSEMBLY LEVEL HERE
            let subAssemblyIndex = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === item.PartNumber && x.AssemblyPartNumber === item.AssemblyPartNumber)
            let subAssembObj = tempArrForCosting[subAssemblyIndex]
            let tempArr = tempArrForCosting && tempArrForCosting.filter((x) => x.AssemblyPartNumber === subAssembObj.PartNumber)
            subAssembObj.CostingPartDetails.IsApplyBOPHandlingCharges = obj.IsApplyBOPHandlingCharges;
            subAssembObj.CostingPartDetails.BOPHandlingChargeApplicability = obj.BOPHandlingChargeApplicability;
            subAssembObj.CostingPartDetails.BOPHandlingPercentage = obj.BOPHandlingPercentage;
            subAssembObj.CostingPartDetails.BOPHandlingCharges = obj.BOPHandlingCharges;
            subAssembObj.CostingPartDetails.BOPHandlingChargeType = obj.BOPHandlingChargeType;


            subAssembObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = setBOPCostForhandling(tempArr) + checkForNull(subAssembObj?.CostingPartDetails?.BOPHandlingCharges)
            subAssembObj.CostingPartDetails.TotalBoughtOutPartCost = checkForNull(subAssembObj?.CostingPartDetails?.TotalBoughtOutPartCost) + checkForNull(subAssembObj?.CostingPartDetails?.BOPHandlingCharges)
            let GrandTotalCost = checkForNull(subAssembObj?.CostingPartDetails?.TotalRawMaterialsCost) + checkForNull(subAssembObj?.CostingPartDetails?.TotalBoughtOutPartCost) + checkForNull(subAssembObj?.CostingPartDetails?.TotalConversionCost)
            subAssembObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
            subAssembObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = subAssembObj?.CostingPartDetails?.TotalCalculatedRMBOPCCCost * subAssembObj?.CostingPartDetails?.Quantity
            tempArrForCosting = Object.assign([...tempArrForCosting], { [subAssemblyIndex]: subAssembObj })
            initialPartNo = item.AssemblyPartNumber //ASSEMBLY PART NO OF SUBASSEMBLY
            quant = item?.CostingPartDetails?.Quantity
          } else {
            let indexForUpdate = _.findIndex(tempArrForCosting, ['PartNumber', initialPartNo]);  //WILL GIVE PARENT ASSEMBLY (SUBASSEMBLY /ASSEMBLY)
            let objectToUpdate = tempArrForCosting[indexForUpdate]
            if (objectToUpdate.PartType === 'Sub Assembly') {
              let tempArr = _.filter(tempArrForCosting, ['AssemblyPartNumber', initialPartNo]);
              initialPartNo = objectToUpdate.AssemblyPartNumber
              let subAssemObj = calculationForSubAssembly(objectToUpdate, quant, 'BOP', tempArr)
              quant = objectToUpdate?.CostingPartDetails?.Quantity
              tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })
            }
          }
        }
      }
      return tempArrForCosting
    }
    // FOR SUB ASSEMBLY
    const level = item.BOMLevel
    const useLevel = level.split('L')[1]
    //CALCULATION FOR  SUBASSEMBLY COSTING (BOP COST)
    tempArrForCosting = calculateBOPHandlingForSubAssemblies(useLevel, item, tempArrForCosting)
    // THIS ARRAY IS FOR FINDING THE SUBASSEMBLIES  WHICH  HAVE SAME PART ON WHICH WE ARE DOING COSTING
    let Arr = tempArrForCosting && tempArrForCosting.filter(costing => costing.PartNumber === item.PartNumber && costing.AssemblyPartNumber !== item.AssemblyPartNumber)
    // THIS ARRAY IS FOR CALCUALTING THE COSTING OF ALL  SUBASSEMBLY(CONTAINIG SAME PART NUMBER)
    Arr && Arr.map(costingItem => {
      const level = costingItem.BOMLevel
      const useLevel = level.split('L')[1]
      tempArrForCosting = calculateBOPHandlingForSubAssemblies(useLevel, costingItem, tempArrForCosting)
      return null
    })
    let subAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item => item.BOMLevel === LEVEL1)
    let assemblyObj = tempArrForCosting[0]

    assemblyObj.CostingPartDetails.IsApplyBOPHandlingCharges = item.BOMLevel === LEVEL0 ? obj?.IsApplyBOPHandlingCharges : assemblyObj?.CostingPartDetails?.IsApplyBOPHandlingCharges;
    assemblyObj.CostingPartDetails.BOPHandlingChargeApplicability = item.BOMLevel === LEVEL0 ? obj?.BOPHandlingChargeApplicability : checkForNull(assemblyObj?.CostingPartDetails?.BOPHandlingChargeApplicability);
    assemblyObj.CostingPartDetails.BOPHandlingPercentage = item.BOMLevel === LEVEL0 ? obj?.BOPHandlingPercentage : checkForNull(assemblyObj?.CostingPartDetails?.BOPHandlingPercentage);
    assemblyObj.CostingPartDetails.BOPHandlingCharges = item.BOMLevel === LEVEL0 ? obj?.BOPHandlingCharges : checkForNull(assemblyObj?.CostingPartDetails?.BOPHandlingCharges);
    assemblyObj.CostingPartDetails.BOPHandlingChargeType = item.BOMLevel === LEVEL0 ? obj?.BOPHandlingChargeType : assemblyObj?.CostingPartDetails?.BOPHandlingChargeType;
    assemblyObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = setBOPCostAssembly(subAssemblyArray) + checkForNull(assemblyObj?.CostingPartDetails?.BOPHandlingCharges)
    assemblyObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalConversionCostWithQuantity)
    tempArrForCosting = Object.assign([...tempArrForCosting], { 0: assemblyObj })
    sessionStorage.setItem('costingArray', JSON.stringify([]))
    sessionStorage.setItem('costingArray', JSON.stringify(tempArrForCosting))
    updateCostingValuesInStructure()

    const tabData = RMCCTabData[0]
    const surfaceTabData = SurfaceTabData[0]
    const overHeadAndProfitTabData = OverheadProfitTabData[0]
    const discountAndOtherTabData = DiscountCostData
    const TotalCost = ((tabData?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity +
      checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
      (checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.OverheadCost) +
        checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.ProfitCost) + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.RejectionCost) +
        checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.ICCCost) /* + checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.PaymentTermCost) */) +
      checkForNull(PackageAndFreightTabData && PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) + checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost)) -
      checkForNull(discountAndOtherTabData?.HundiOrDiscountValue)) + checkForNull(discountAndOtherTabData?.AnyOtherCost)
    if (!CostingViewMode) {

      let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, TotalCost, getAssemBOPCharge, 1, CostingEffectiveDate, '', '', isPartType, initialConfiguration?.IsAddPaymentTermInNetCost)
      dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
    }

  }

  return (
    <>
      <div className="login-container signup-form" id="rm-cc-costing-header">
        <Row>
          <Col md="12">
            <div className="shadow-lgg login-formg">
              <form
                noValidate
                className="form"
              >
                <Row id='go-top-top'>
                  <Col md="12">
                    <ScrollToTop pointProp={"go-top-top"} />
                    <Table className="table cr-brdr-main mb-0 rmcc-main-headings" size="sm">
                      <thead>
                        <tr>
                          <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{`Part Number`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '70px' }}>{`Level`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '110px' }}>{`Type`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{`RM Cost`}</th>
                          {!isBreakupBoughtOutPartCostingFromAPI && <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{`${showBopLabel()} Cost`}</th>}
                          <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`CC`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`Quantity`} {/*<button class="Edit ml-1 mb-0 align-middle" type="button" title="Edit Costing"></button>*/}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{`RMC + CC/Pc`}</th>
                          {costData.IsAssemblyPart && <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`RMC + CC/Assembly`}</th>}
                        </tr >
                      </thead >
                      <tbody>
                        {
                          RMCCTabData && RMCCTabData.map((item, index) => {
                            if (item?.CostingPartDetails && (item?.CostingPartDetails?.PartType === 'Component' || isBreakupBoughtOutPartCostingFromAPI)) {
                              return (
                                < >
                                  <PartCompoment
                                    index={index}
                                    item={item}
                                    rmData={item?.CostingPartDetails?.CostingRawMaterialsCost}
                                    bopData={item?.CostingPartDetails?.CostingBoughtOutPartCost}
                                    ccData={item?.CostingPartDetails?.CostingConversionCost}
                                    setPartDetails={setPartDetails}
                                    setRMCost={setRMCost}
                                    setBOPCost={setBOPCost}
                                    setConversionCost={setConversionCost}
                                    setToolCost={setToolCost}
                                    subAssembId={selectedCostingDetail.SubAssemblyCostingId ? selectedCostingDetail.SubAssemblyCostingId : costData.CostingId}
                                  />
                                </>
                              )
                            } else {
                              return (
                                < >
                                  <AssemblyPart
                                    index={index}
                                    item={item}
                                    children={item.CostingChildPartDetails}
                                    setPartDetails={setPartDetails}
                                    toggleAssembly={toggleAssembly}
                                    setRMCost={setRMCost}
                                    setBOPCost={setBOPCost}
                                    setConversionCost={setConversionCost}
                                    setToolCost={setToolCost}
                                    setAssemblyOperationCost={setAssemblyOperationCost}
                                    setAssemblyLabourCost={setAssemblyLabourCost}
                                    setAssemblyToolCost={setAssemblyToolCost}
                                    subAssembId={selectedCostingDetail.SubAssemblyCostingId ? selectedCostingDetail.SubAssemblyCostingId : costData.CostingId}
                                    setBOPCostWithAsssembly={setBOPCostWithAsssembly}
                                  />
                                </>
                              )
                            }
                          })
                        }
                      </tbody>
                    </Table >
                  </Col >
                </Row >

                {!CostingViewMode &&
                  <div className="col-sm-12 text-right d-flex align-items-center justify-content-end bluefooter-butn btn-sticky-container">
                    {!(Object.keys(ComponentItemData).length === 0 || (DayTime(CostingEffectiveDate).isValid() === false || !checkIsDataChange)) && <WarningMessage dClass="mr-2" textClass="d-flex" message="Please click on save button to save the data" />}
                    <button type={"button"} className="reset mr15 cancel-btn" onClick={props.backBtn}>
                      <div className={'cancel-icon'}></div>
                      {"Cancel"}
                    </button>
                    <button
                      type={'button'}
                      className="submit-button save-btn"
                      onClick={saveCosting}
                      disabled={Object.keys(ComponentItemData).length === 0 || (DayTime(CostingEffectiveDate).isValid() === false || !checkIsDataChange) ? true : false}
                    >
                      <div className={'save-icon'}></div>
                      {'Save'}
                    </button>
                  </div>
                }
              </form >
            </div >
          </Col >
        </Row >
      </div >

    </>
  );
};

export default TabRMCC;
//export default React.memo(TabRMCC);
