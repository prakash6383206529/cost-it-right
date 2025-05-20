import React, { useEffect, useContext, useState } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import PartCompoment from '../CostingHeadCosts/Part'
import {
  getRMCCTabData, setRMCCData, saveComponentCostingRMCCTab, setComponentItemData,
  saveDiscountOtherCostTab, setComponentDiscountOtherItemData, CloseOpenAccordion, saveAssemblyPartRowCostingCalculation, isDataChange, savePartNumber, setMessageForAssembly, saveBOMLevel, gridDataAdded, setIsBreakupBoughtOutPartCostingFromAPI, saveCostingPaymentTermDetail, getCostingCostDetails
} from '../../actions/Costing';
import { costingInfoContext, NetPOPriceContext } from '../CostingDetailStepTwo';
import { checkForNull, getConfigurationKey, getOverheadAndProfitCostTotal, loggedInUserId, showBopLabel } from '../../../../helper';
import AssemblyPart from '../CostingHeadCosts/SubAssembly';
import Toaster from '../../../common/Toaster';
import { MESSAGES } from '../../../../config/message';
import { IsPartType, SelectedCostingDetail, ViewCostingContext } from '../CostingDetails';
import DayTime from '../../../common/DayTimeWrapper'
import { checkNegativeValue, createToprowObjAndSave, errorCheck, errorCheckObject, findSurfaceTreatmentData } from '../../CostingUtil';
import _, { debounce } from 'lodash'
import ScrollToTop from '../../../common/ScrollToTop';
import WarningMessage from '../../../common/WarningMessage';
import { reactLocalStorage } from 'reactjs-localstorage';
import { PART_TYPE_ASSEMBLY } from '../../../../config/masterData';
import { createSaveComponentObject } from '../../CostingUtilSaveObjects';
import { PreviousTabData } from '.';
import { APPLICABILITY_OVERHEAD, APPLICABILITY_OVERHEAD_EXCL, APPLICABILITY_OVERHEAD_EXCL_PROFIT, APPLICABILITY_OVERHEAD_EXCL_PROFIT_EXCL, APPLICABILITY_OVERHEAD_PROFIT, APPLICABILITY_OVERHEAD_PROFIT_EXCL, APPLICABILITY_PROFIT, APPLICABILITY_PROFIT_EXCL, LEVEL0, LEVEL1, TOOLINGPART } from '../../../../config/constants';





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
  const [saveDisable, setSaveDisable] = useState(false)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
        AssemCostingId: selectedCostingDetail.AssemblyCostingId ? selectedCostingDetail.AssemblyCostingId : costData.CostingId,
        subAsmCostingId: selectedCostingDetail.SubAssemblyCostingId ? selectedCostingDetail.SubAssemblyCostingId : costData.CostingId,
        EffectiveDate: CostingEffectiveDate ? CostingEffectiveDate : null,
        isComponentCosting: costData?.PartType === "Component" ? true : false
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
          OtherOperationCost: TopHeaderValues?.CostingConversionCost?.NetOtherOperationCost ? TopHeaderValues.CostingConversionCost.NetOtherOperationCost : 0,
          NetProcessCost: TopHeaderValues?.CostingConversionCost?.NetProcessCost ? TopHeaderValues.CostingConversionCost.NetProcessCost : 0,
          NetOperationCost: TopHeaderValues?.CostingConversionCost?.NetOperationCost ? TopHeaderValues.CostingConversionCost.NetOperationCost : 0,
          TotalOperationCostPerAssembly: TopHeaderValues?.TotalOperationCostPerAssembly ? TopHeaderValues.TotalOperationCostPerAssembly : 0,
          TotalOperationCostSubAssembly: TopHeaderValues?.TotalOperationCostSubAssembly ? TopHeaderValues.TotalOperationCostSubAssembly : 0,
          TotalWeldingCostPerAssembly: TopHeaderValues?.TotalWeldingCostPerAssembly ? TopHeaderValues.TotalWeldingCostPerAssembly : 0,
          TotalWeldingCostSubAssembly: TopHeaderValues?.TotalWeldingCostSubAssembly ? TopHeaderValues.TotalWeldingCostSubAssembly : 0,
          TotalOtherOperationCostPerAssembly: TopHeaderValues?.TotalOtherOperationCostPerAssembly ? checkForNull(TopHeaderValues.TotalOtherOperationCostPerAssembly) : 0, //TODO: Rename this
          RawMaterialCostWithCutOff: TopHeaderValues?.RawMaterialCostWithCutOff ? checkForNull(TopHeaderValues?.RawMaterialCostWithCutOff) : 0,
          IsRMCutOffApplicable: TopHeaderValues?.IsRMCutOffApplicable ? TopHeaderValues?.IsRMCutOffApplicable : false,
          NetProcessCostForOverhead: TopHeaderValues ? checkForNull(TopHeaderValues?.TotalProcessCostPerAssemblyForOverhead) + checkForNull(TopHeaderValues?.TotalProcessCostSubAssemblyForOverhead) + checkForNull(TopHeaderValues?.TotalProcessCostComponentForOverhead) : 0,
          NetProcessCostForProfit: TopHeaderValues ? checkForNull(TopHeaderValues?.TotalProcessCostPerAssemblyForProfit) + checkForNull(TopHeaderValues?.TotalProcessCostSubAssemblyForProfit) + checkForNull(TopHeaderValues?.TotalProcessCostComponentForProfit) : 0,
          NetOperationCostForOverhead: TopHeaderValues ? checkForNull(TopHeaderValues?.TotalOperationCostPerAssemblyForOverhead) + checkForNull(TopHeaderValues?.TotalOperationCostSubAssemblyForOverhead) + checkForNull(TopHeaderValues?.TotalOperationCostComponentForOverhead) : 0,
          NetOperationCostForProfit: TopHeaderValues ? checkForNull(TopHeaderValues?.TotalOperationCostPerAssemblyForProfit) + checkForNull(TopHeaderValues?.TotalOperationCostSubAssemblyForProfit) + checkForNull(TopHeaderValues?.TotalOperationCostComponentForProfit) : 0,
          NetWeldingCostForOverhead: TopHeaderValues ? checkForNull(TopHeaderValues?.TotalWeldingCostPerAssemblyForOverhead) + checkForNull(TopHeaderValues?.TotalWeldingCostSubAssemblyForOverhead) + checkForNull(TopHeaderValues?.TotalWeldingCostComponentForOverhead) : 0,
          NetWeldingCostForProfit: TopHeaderValues ? checkForNull(TopHeaderValues?.TotalWeldingCostPerAssemblyForProfit) + checkForNull(TopHeaderValues?.TotalWeldingCostSubAssemblyForProfit) + checkForNull(TopHeaderValues?.TotalWeldingCostComponentForProfit) : 0,
          NetCCForOtherTechnologyCost: TopHeaderValues ? checkForNull(TopHeaderValues?.TotalCCForOtherTechnologyCostComponent) + checkForNull(TopHeaderValues?.TotalCCForOtherTechnologyCostSubAssembly) + checkForNull(TopHeaderValues?.TotalCCForOtherTechnologyCostPerAssembly): 0,
          NetCCForOtherTechnologyCostForOverhead: TopHeaderValues ? checkForNull(TopHeaderValues?.TotalCCForOtherTechnologyCostComponentForOverhead) + checkForNull(TopHeaderValues?.TotalCCForOtherTechnologyCostSubAssemblyForOverhead) + checkForNull(TopHeaderValues?.TotalCCForOtherTechnologyCostPerAssemblyForOverhead): 0,
          NetCCForOtherTechnologyCostForProfit: TopHeaderValues ? checkForNull(TopHeaderValues?.TotalCCForOtherTechnologyCostComponentForProfit) + checkForNull(TopHeaderValues?.TotalCCForOtherTechnologyCostSubAssemblyForProfit) + checkForNull(TopHeaderValues?.TotalCCForOtherTechnologyCostPerAssemblyForProfit): 0,
        }
      } else {

        topHeaderData = {
          NetRawMaterialsCost: TopHeaderValues?.NetRawMaterialsCost ? TopHeaderValues.NetRawMaterialsCost : 0,
          NetBoughtOutPartCost: TopHeaderValues?.NetBoughtOutPartCost ? TopHeaderValues.NetBoughtOutPartCost : 0,
          NetConversionCost: TopHeaderValues?.NetConversionCost ? TopHeaderValues.NetConversionCost : 0,
          NetProcessCost: TopHeaderValues?.CostingConversionCost?.NetProcessCost ? TopHeaderValues.CostingConversionCost.NetProcessCost : 0,
          NetOperationCost: TopHeaderValues?.CostingConversionCost?.NetOperationCost ? TopHeaderValues.CostingConversionCost.NetOperationCost : 0,
          OtherOperationCost: TopHeaderValues?.CostingConversionCost?.NetOtherOperationCost ? TopHeaderValues.CostingConversionCost.NetOtherOperationCost : 0,
          NetToolsCost: TopHeaderValues?.TotalToolCost ? TopHeaderValues.TotalToolCost : 0,
          NetTotalRMBOPCC: TopHeaderValues?.NetTotalRMBOPCC ? TopHeaderValues.NetTotalRMBOPCC : 0,
          RawMaterialCostWithCutOff: TopHeaderValues?.RawMaterialCostWithCutOff ? checkForNull(TopHeaderValues?.RawMaterialCostWithCutOff) : 0,
          IsRMCutOffApplicable: TopHeaderValues?.IsRMCutOffApplicable ? TopHeaderValues?.IsRMCutOffApplicable : false,
          NetProcessCostForOverhead: TopHeaderValues?.NetProcessCostForOverhead ? TopHeaderValues?.NetProcessCostForOverhead : 0,
          NetProcessCostForProfit: TopHeaderValues?.NetProcessCostForProfit ? TopHeaderValues?.NetProcessCostForProfit : 0,
          NetOperationCostForOverhead: TopHeaderValues?.NetOperationCostForOverhead ? TopHeaderValues?.NetOperationCostForOverhead : 0,
          NetOperationCostForProfit: TopHeaderValues?.NetOperationCostForProfit ? TopHeaderValues?.NetOperationCostForProfit : 0,
          NetWeldingCostForOverhead: TopHeaderValues?.NetWeldingCostForOverhead ?? 0,
          NetWeldingCostForProfit: TopHeaderValues?.NetWeldingCostForProfit ?? 0,
          NetWeldingCost: TopHeaderValues?.NetWeldingCost ?? 0,
          NetCCForOtherTechnologyCost: TopHeaderValues?.NetCCForOtherTechnologyCost ?? 0,
          NetCCForOtherTechnologyCostForOverhead: TopHeaderValues?.NetCCForOtherTechnologyCostForOverhead ?? 0,
          NetCCForOtherTechnologyCostForProfit: TopHeaderValues?.NetCCForOtherTechnologyCostForProfit ?? 0,
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
        // NetProcessCost: costingData?.CostingConversionCost?.NetProcessCost ? costingData.CostingConversionCost.NetProcessCost : 0,
        // NetOperationCost: costingData?.CostingConversionCost?.NetOperationCost ? costingData.CostingConversionCost.NetOperationCost : 0,
        // OtherOperationCost: costingData?.CostingConversionCost?.NetOtherOperationCost ? costingData.CostingConversionCost.NetOtherOperationCost : 0,
        // NetToolsCost: costingData?.TotalToolCost ? costingData.TotalToolCost : 0,
        // NetTotalRMBOPCC: costingData?.NetTotalRMBOPCC ? costingData.NetTotalRMBOPCC : 0,
        RawMaterialCostWithCutOff: costingData?.RawMaterialCostWithCutOff ? checkForNull(costingData?.RawMaterialCostWithCutOff) : 0,
        IsRMCutOffApplicable: costingData?.IsRMCutOffApplicable ? costingData?.IsRMCutOffApplicable : false
      }

      props.setHeaderCost(topHeader)
    }
  }, [RMCCTabData]);




  /**
  * @method getOperationTotalCostForAssembly
  * @description GET OPERATION TOTAL COST FOR ASSEMBLY of ALL COMPONENTS
  */
  const getOperationTotalCostForAssembly = (tempArr, ForType = "") => {
    let NetCost = 0;
    NetCost = tempArr.reduce((accumulator, el) => {
      if (el.PartType === 'Part') {
        if (el?.CostingPartDetails?.CostingConversionCost?.CostingOperationCostResponse?.length > 0) {
          const operations = el?.CostingPartDetails?.CostingConversionCost?.CostingOperationCostResponse;
          let operationCost = 0;
          if (ForType === "Welding") {
            const weldingOperations = operations.filter(op => op?.ForType === "Welding");
            operationCost = weldingOperations.reduce((opAccumulator, op) => {
              return opAccumulator + checkForNull(op?.OperationCost);
            }, 0);
          } else {
            const nonWeldingOperations = operations.filter(op => op?.ForType !== "Welding");
            operationCost = nonWeldingOperations.reduce((opAccumulator, op) => {
              return opAccumulator + checkForNull(op?.OperationCost);
            }, 0);
          }
          return accumulator + (operationCost * checkForNull(el?.CostingPartDetails?.Quantity));
        }
      }
      return accumulator;
    }, 0);

    return NetCost;
  }
  /**
  * @method getOverheadAndProfitTotalCostForAssembly
  * @description GET OVERHEAD AND PROFIT TOTAL COST FOR ASSEMBLY of ALL COMPONENTS
  */
  const getOverheadAndProfitTotalCostForAssembly = (tempArr, type, costType) => {


    // let tempArr = setArrayForCosting && setArrayForCosting.filter(item=>item.AssemblyPartNumber === PartNo && item.PartType !== 'Assembly')
    const costField = costType === 'Process' ? 'ProcessCost' : (costType === 'Welding' ? 'WeldingCost' : (costType === 'CCForOtherTechnology' ? 'CCForOtherTechnologyCost' : 'OperationCost'));

    switch (type) {
      case 'Overhead':
      case 'Profit':
        {
          let netCost = 0;
          netCost = tempArr && tempArr.reduce((accumulator, el) => {
            if (el.PartType === 'Part') {
              const costKey = `Net${costField}For${type}`;
              return accumulator + (el?.CostingPartDetails?.[costKey] ? checkForNull(el?.CostingPartDetails?.[costKey]) * checkForNull(el?.CostingPartDetails?.Quantity) : 0);
            }
            return accumulator;
          }, 0);

          return netCost;
        }

      default:
        return 0;
    }
  }

  /**
  * @method getOperationTotalCostForAssembly
  * @description GET OTHER OPERATION TOTAL COST FOR ASSEMBLY of ALL COMPONENTS
  */
  const getOtherOperationTotalCostForAssembly = (tempArr) => {
    // let tempArr = setArrayForCosting && setArrayForCosting.filter(item=>item.AssemblyPartNumber === PartNo && item.PartType !== 'Assembly')
    let NetCost = 0;
    NetCost = tempArr && tempArr.reduce((accummlator, el) => {
      if (el.PartType === 'Part') {
        return accummlator + checkForNull(el?.CostingPartDetails?.NetOtherOperationCost !== null ? checkForNull(el?.CostingPartDetails?.NetOtherOperationCost) * el?.CostingPartDetails?.Quantity : 0);
      }
      return accummlator
    }, 0)
    return NetCost;
  }

  /**
  * @method getProcessTotalCostForAssembly
  * @description GET PROCESS TOTAL COST FOR ASSEMBLY of ALL COMPONENTS
  */
  const getProcessTotalCostForAssembly = (tempArr, TechnologyId, technologyType = "") => {
    if (technologyType === "CCForOtherTechnology") {
      return tempArr.reduce((acc, el) => {
        if (el.PartType === 'Part') {
          const NetCCForOtherTechnologyCost = checkForNull(el?.CostingPartDetails?.NetCCForOtherTechnologyCost);
          const quantity = checkForNull(el?.CostingPartDetails?.Quantity);
          return acc + (NetCCForOtherTechnologyCost * quantity);
        }
        return acc;
      }, 0);
    }
    return tempArr.reduce((acc, el) => {
      if (el.PartType === 'Part') {
        const netProcessCost = checkForNull(el?.CostingPartDetails?.NetProcessCost);
        const quantity = checkForNull(el?.CostingPartDetails?.Quantity);
        return acc + (netProcessCost * quantity);
      }
      return acc;
    }, 0);
  }



  const setRMCostForAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + checkForNull(item?.CostingPartDetails?.NetRawMaterialsCost) * checkForNull(item?.Quantity)
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
        return accummlator + checkForNull(item?.CostingPartDetails?.NetRawMaterialsCost) * checkForNull(item?.CostingPartDetails?.Quantity)
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
        return accummlator + checkForNull(item?.CostingPartDetails?.NetBoughtOutPartCost) * checkForNull(item.Quantity)
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
        return accummlator + checkForNull(item?.CostingPartDetails?.NetBoughtOutPartCost) * checkForNull(item?.CostingPartDetails?.Quantity)
      } else {

        return accummlator + checkForNull(item?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) * checkForNull(item?.CostingPartDetails?.Quantity)
      }
    }, 0)
    return total
  }



  const setConversionCostForSubAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + checkForNull(item?.CostingPartDetails?.NetConversionCost) * checkForNull(item?.CostingPartDetails?.Quantity)
      } else {

        return accummlator + checkForNull(item?.CostingPartDetails?.TotalConversionCostWithQuantity) * checkForNull(item?.CostingPartDetails?.Quantity)
      }
    }, 0)
    return total
  }

  const setOtherOperationForSubAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + checkForNull(item?.CostingPartDetails?.NetOtherOperationCost) * checkForNull(item?.CostingPartDetails?.Quantity)
      } else {

        return accummlator + checkForNull(item?.CostingPartDetails?.TotalOtherOperationCostPerAssembly) * checkForNull(item?.CostingPartDetails?.Quantity)
      }
    }, 0)
    return total
  }
  /**
     * @method setOperationCostForAssembly
     * @description SET OPERATION COST FOR SUB ASSEMBLY
    */
  const setOperationCostForAssembly = (tempArr, type = "") => {
    const total = tempArr && tempArr.reduce((accummlator, item) => {
      if (item.PartType === 'Sub Assembly') {
        if (type === "Welding") {
          return checkForNull(accummlator) + (checkForNull(item?.CostingPartDetails?.TotalWeldingCostComponent) + checkForNull(item?.CostingPartDetails?.TotalWeldingCostSubAssembly) + checkForNull(item?.CostingPartDetails?.TotalWeldingCostPerAssembly)) * checkForNull(item.Quantity)
        } else {
          return checkForNull(accummlator) + (checkForNull(item?.CostingPartDetails?.TotalOperationCostComponent) + checkForNull(item?.CostingPartDetails?.TotalOperationCostSubAssembly) + checkForNull(item?.CostingPartDetails?.TotalOperationCostPerAssembly)) * checkForNull(item.Quantity)
        }
      } else {
        return checkForNull(accummlator)
      }
    }, 0)
    return total
  }
  /**
     * @method setOtherOperationCostForAssembly
     * @description SET OTHER OPERATION COST FOR SUB ASSEMBLY
    */
  const setOtherOperationCostForAssembly = (tempArr) => {
    const total = tempArr && tempArr.reduce((accummlator, item) => {
      if (item.PartType === 'Sub Assembly') {
        return checkForNull(accummlator) + (checkForNull(item?.CostingPartDetails?.TotalOtherOperationCostComponent) + checkForNull(item?.CostingPartDetails?.TotalOtherOperationCostPerSubAssembly)) * checkForNull(item.Quantity)
        // return checkForNull(accummlator) + (checkForNull(item?.CostingPartDetails?.TotalOtherOperationCostComponent) + checkForNull(item?.CostingPartDetails?.TotalOtherOperationCostPerSubAssembly ? item?.CostingPartDetails?.TotalOtherOperationCostPerSubAssembly : item?.CostingPartDetails?.TotalOtherOperationCostPerAssembly)) * checkForNull(item.Quantity)
      } else {
        return checkForNull(accummlator)
      }
    }, 0)
    return total
  }

  /**
    * @method   const setProcessCostForAssembly
    * @description SET PROCESS COST FOR SUB ASSEMBLY
   */
  const setProcessCostForAssembly = (tempArr, TechnologyId, type = "",) => {
    const total = tempArr && tempArr.reduce((accummlator, item) => {
      if (item.PartType === 'Sub Assembly') {
        if (type === "CCForOtherTechnology") {
          return checkForNull(accummlator) + (checkForNull(item?.CostingPartDetails?.TotalCCForOtherTechnologyCostComponent) + checkForNull(item?.CostingPartDetails?.TotalCCForOtherTechnologyCostSubAssembly) + checkForNull(item?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssembly)) * checkForNull(item.Quantity)
        } else {
          return checkForNull(accummlator) + (checkForNull(item?.CostingPartDetails?.TotalProcessCostComponent) + checkForNull(item?.CostingPartDetails?.TotalProcessCostSubAssembly) + checkForNull(item?.CostingPartDetails?.TotalProcessCostPerAssembly)) * checkForNull(item.Quantity)
        }
      } else {
        return checkForNull(accummlator)
      }
    }, 0)
    
    return total
  }

  /**
      * @method const setOverheadAndProfitCostForAssembly
      * @description SET OVERHEAD AND PROFIT COST FOR SUB ASSEMBLY
     */
  const setOverheadAndProfitCostForAssembly = (tempArr, type, costType) => {
    const costField = costType === 'Process' ? 'ProcessCost' : (costType === 'Welding' ? 'WeldingCost' : (costType === 'CCForOtherTechnology' ? "CCForOtherTechnologyCost" : 'OperationCost'));
    switch (type) {
      case 'Overhead':
      case 'Profit':
        {
          const total = tempArr && tempArr.reduce((accumulator, item) => {
            if (item.PartType === 'Sub Assembly') {
              return checkForNull(accumulator) + (
                checkForNull(item?.CostingPartDetails?.[`Total${costField}ComponentFor${type}`]) +
                checkForNull(item?.CostingPartDetails?.[`Total${costField}SubAssemblyFor${type}`]) +
                checkForNull(item?.CostingPartDetails?.[`Total${costField}PerAssemblyFor${type}`])
              ) * checkForNull(item.Quantity)
            }
            return checkForNull(accumulator)
          }, 0)
          return total
        }
      default:
        return 0
    }
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



        GrandTotalCost = checkForNull(netRMCost(gridData)) + checkForNull(partObj?.CostingPartDetails?.NetBoughtOutPartCost) + checkForNull(partObj?.CostingPartDetails?.NetConversionCost)
        partObj.CostingPartDetails.CostingRawMaterialsCost = gridData;
        partObj.CostingPartDetails.NetRawMaterialsCost = netRMCost(gridData);
        partObj.CostingPartDetails.RawMaterialCostWithCutOff = calculateRMCutOff(gridData)
        partObj.CostingPartDetails.IsRMCutOffApplicable = !isAllFalse

        partObj.CostingPartDetails.MasterBatchRMId = checkboxFields?.MasterBatchRMId;
        partObj.CostingPartDetails.IsApplyMasterBatch = checkboxFields?.IsApplyMasterBatch;
        partObj.CostingPartDetails.MasterBatchRMName = checkboxFields?.MasterBatchRMName;
        partObj.CostingPartDetails.MasterBatchRMPrice = checkForNull(checkboxFields?.MasterBatchRMPrice);
        partObj.CostingPartDetails.MasterBatchPercentage = checkForNull(checkboxFields?.MasterBatchPercentage);
        partObj.CostingPartDetails.MasterBatchTotal = checkForNull(checkboxFields?.MasterBatchTotal);
        partObj.CostingPartDetails.NetTotalRMBOPCC = GrandTotalCost;
        partObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(GrandTotalCost) * checkForNull(partObj?.CostingPartDetails?.Quantity);
        partObj.CostingPartDetails.CostingRawMaterialCommonCalculationId = gridData[0]?.WeightCalculationId;
        partObj.CostingPartDetails.NetPOPrice =
          checkForNull(partObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity) +
          checkForNull(partObj?.CostingPartDetails?.NetBoughtOutPartCost) +
          checkForNull(partObj?.CostingPartDetails?.NetProcessCost) +
          checkForNull(partObj?.CostingPartDetails?.NetOperationCost)
        partObj.CostingPartDetails.BasicRate = checkForNull(partObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity) +
          checkForNull(partObj?.CostingPartDetails?.NetBoughtOutPartCost) +
          checkForNull(partObj?.CostingPartDetails?.NetProcessCost) +
          checkForNull(partObj?.CostingPartDetails?.NetOperationCost)


        // partObj.CostingPartDetails.NetPOPrice = gridData[0]?.WeightCalculationId;
        break;
      case 'BOP':
        partObj.CostingPartDetails.CostingBoughtOutPartCost = gridData;

        partObj.CostingPartDetails.NetBoughtOutPartCost = checkboxFields?.IsApplyBOPHandlingCharges ? (netBOPCost(gridData) + checkForNull(checkboxFields?.BOPHandlingCharges)) : netBOPCost(gridData);
        partObj.CostingPartDetails.IsApplyBOPHandlingCharges = checkboxFields?.IsApplyBOPHandlingCharges;
        partObj.CostingPartDetails.BOPHandlingPercentage = checkboxFields?.BOPHandlingChargeType === 'Percentage' ? checkForNull(checkboxFields?.BOPHandlingPercentage) : 0;
        partObj.CostingPartDetails.BOPHandlingCharges = checkForNull(checkboxFields?.BOPHandlingCharges);
        partObj.CostingPartDetails.BOPHandlingChargeType = checkboxFields?.BOPHandlingChargeType;
        // partObj?.CostingPartDetails?.BOPHandlingFixed = (gridData?.length !== 0 && checkboxFields?.BOPHandlingChargeType === 'Fixed') ? checkForNull(checkboxFields?.BOPHandlingCharges) : 0;

        GrandTotalCost = checkForNull(partObj?.CostingPartDetails?.NetRawMaterialsCost) + checkForNull(partObj?.CostingPartDetails?.NetBoughtOutPartCost) + checkForNull(partObj?.CostingPartDetails?.NetConversionCost)
        partObj.CostingPartDetails.NetTotalRMBOPCC = GrandTotalCost;
        partObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(GrandTotalCost) * checkForNull(partObj?.CostingPartDetails?.Quantity);
        partObj.CostingPartDetails.BasicRate = checkForNull(GrandTotalCost) * checkForNull(partObj?.CostingPartDetails?.Quantity)

        break;
      case 'CC':
        partObj.CostingPartDetails.NetConversionCost = gridData?.NetConversionCost
        partObj.CostingPartDetails.NetProcessCost = gridData?.NetProcessCost
        partObj.CostingPartDetails.NetProcessCostForOverhead = getOverheadAndProfitCostTotal(gridData?.CostingProcessCostResponse, Number(isPartType?.value) !== PART_TYPE_ASSEMBLY ? obj?.TechnologyId : RMCCTabData[0]?.TechnologyId)?.overheadProcessCost;
        partObj.CostingPartDetails.NetProcessCostForProfit = getOverheadAndProfitCostTotal(gridData?.CostingProcessCostResponse, Number(isPartType?.value) !== PART_TYPE_ASSEMBLY ? obj?.TechnologyId : RMCCTabData[0]?.TechnologyId)?.profitProcessCost;
        partObj.CostingPartDetails.NetCCForOtherTechnologyCostForOverhead = getOverheadAndProfitCostTotal(gridData?.CostingProcessCostResponse, Number(isPartType?.value) !== PART_TYPE_ASSEMBLY ? obj?.TechnologyId : RMCCTabData[0]?.TechnologyId)?.ccForOtherTechnologyCostForOverhead;
        partObj.CostingPartDetails.NetCCForOtherTechnologyCostForProfit = getOverheadAndProfitCostTotal(gridData?.CostingProcessCostResponse, Number(isPartType?.value) !== PART_TYPE_ASSEMBLY ? obj?.TechnologyId : RMCCTabData[0]?.TechnologyId)?.ccForOtherTechnologyCostForProfit;
        partObj.CostingPartDetails.NetCCForOtherTechnologyCost = checkForNull(getOverheadAndProfitCostTotal(gridData?.CostingProcessCostResponse, Number(isPartType?.value) !== PART_TYPE_ASSEMBLY ? obj?.TechnologyId : RMCCTabData[0]?.TechnologyId)?.ccForOtherTechnologyCost)
        partObj.CostingPartDetails.NetOperationCostForOverhead = getOverheadAndProfitCostTotal(gridData?.CostingOperationCostResponse, Number(isPartType?.value) !== PART_TYPE_ASSEMBLY ? obj?.TechnologyId : RMCCTabData[0]?.TechnologyId)?.overheadOperationCost;
        partObj.CostingPartDetails.NetOperationCostForProfit = getOverheadAndProfitCostTotal(gridData?.CostingOperationCostResponse, Number(isPartType?.value) !== PART_TYPE_ASSEMBLY ? obj?.TechnologyId : RMCCTabData[0]?.TechnologyId)?.profitOperationCost;
        partObj.CostingPartDetails.NetWeldingCost = getOverheadAndProfitCostTotal(gridData?.CostingOperationCostResponse, Number(isPartType?.value) !== PART_TYPE_ASSEMBLY ? obj?.TechnologyId : RMCCTabData[0]?.TechnologyId)?.weldingCost
        partObj.CostingPartDetails.NetWeldingCostForOverhead = getOverheadAndProfitCostTotal(gridData?.CostingOperationCostResponse, Number(isPartType?.value) !== PART_TYPE_ASSEMBLY ? obj?.TechnologyId : RMCCTabData[0]?.TechnologyId)?.overheadWeldingCost;
        partObj.CostingPartDetails.NetWeldingCostForProfit = getOverheadAndProfitCostTotal(gridData?.CostingOperationCostResponse, Number(isPartType?.value) !== PART_TYPE_ASSEMBLY ? obj?.TechnologyId : RMCCTabData[0]?.TechnologyId)?.profitWeldingCost;
        // partObj.CostingPartDetails.NetOperationCostForOverheadExcl = gridData?.NetOperationCostForOverheadExcl
        // partObj.CostingPartDetails.NetOperationCostForProfitExcl = gridData?.NetOperationCostForProfitExcl

        partObj.CostingPartDetails.NetOperationCost = gridData?.NetOperationCosts
        partObj.CostingPartDetails.NetOtherOperationCost = gridData.NetOtherOperationCost
        partObj.CostingPartDetails.TotalConversionCostComponent = gridData.NetConversionCost

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

        GrandTotalCost = checkForNull(partObj?.CostingPartDetails?.NetRawMaterialsCost) + checkForNull(partObj?.CostingPartDetails?.NetBoughtOutPartCost) + checkForNull(partObj?.CostingPartDetails?.NetConversionCost)

        partObj.CostingPartDetails.NetTotalRMBOPCC = GrandTotalCost;
        partObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(GrandTotalCost) * checkForNull(partObj?.CostingPartDetails?.Quantity);

        break;
      default:
        break;
    }
    if (Number(isPartType?.value) === PART_TYPE_ASSEMBLY) {
      partObj.CostingPartDetails.BasicRate = checkForNull(partObj.CostingPartDetails.NetTotalRMBOPCC) + checkForNull(findSurfaceTreatmentData(partObj)?.CostingPartDetails?.NetSurfaceTreatmentCost)
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
        subAssemObj.CostingPartDetails.NetRawMaterialsCost = setRMCostForSubAssembly(tempArr)
        subAssemObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity = subAssemObj?.CostingPartDetails?.NetRawMaterialsCost;
        subAssemObj.CostingPartDetails.RawMaterialCostWithCutOff = setRMCCutOffSubAssembly(tempArr)
        subAssemObj.CostingPartDetails.NetTotalRMBOPCC = subAssemObj?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity + checkForNull(subAssemObj?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) + checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostWithQuantity);
        subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = subAssemObj?.CostingPartDetails?.NetTotalRMBOPCC * subAssemObj?.CostingPartDetails?.Quantity;
        break;
      case 'BOP':
        subAssemObj.CostingPartDetails.NetBoughtOutPartCost = setBOPCostForSubAssembly(tempArr)

        subAssemObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = checkForNull(subAssemObj?.CostingPartDetails?.NetBoughtOutPartCost) + checkForNull(subAssemObj?.CostingPartDetails?.BOPHandlingCharges);
        subAssemObj.CostingPartDetails.NetTotalRMBOPCC = checkForNull(subAssemObj?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity) + checkForNull(subAssemObj?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) + checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostWithQuantity);
        subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(subAssemObj?.CostingPartDetails?.NetTotalRMBOPCC) * subAssemObj?.CostingPartDetails?.Quantity;
        break;
      case 'CC':
        subAssemObj.CostingPartDetails.NetConversionCost = setConversionCostForSubAssembly(tempArr)
        // subAssemObj.CostingPartDetails.TotalOperationCostPerAssembly = setOperationForSubAssembly(tempArr)

        subAssemObj.CostingPartDetails.TotalOperationCostComponent = checkForNull(getOperationTotalCostForAssembly(tempArr))
        subAssemObj.CostingPartDetails.TotalOperationCostSubAssembly = setOperationCostForAssembly(tempArr)

        subAssemObj.CostingPartDetails.TotalWeldingCostComponent = checkForNull(getOperationTotalCostForAssembly(tempArr, "Welding"))
        subAssemObj.CostingPartDetails.TotalWeldingCostSubAssembly = setOperationCostForAssembly(tempArr, "Welding")


        subAssemObj.CostingPartDetails.TotalOperationCostComponentForOverhead = checkForNull(getOverheadAndProfitTotalCostForAssembly(tempArr, 'Overhead', 'Operation'))
        subAssemObj.CostingPartDetails.TotalOperationCostSubAssemblyForOverhead = checkForNull(setOverheadAndProfitCostForAssembly(tempArr, 'Overhead', 'Operation'))

        subAssemObj.CostingPartDetails.TotalWeldingCostComponentForOverhead = checkForNull(getOverheadAndProfitTotalCostForAssembly(tempArr, 'Overhead', 'Welding'))
        subAssemObj.CostingPartDetails.TotalWeldingCostSubAssemblyForOverhead = checkForNull(setOverheadAndProfitCostForAssembly(tempArr, 'Overhead', 'Welding'))


        subAssemObj.CostingPartDetails.TotalOperationCostComponentForProfit = checkForNull(getOverheadAndProfitTotalCostForAssembly(tempArr, 'Profit', 'Operation'))
        subAssemObj.CostingPartDetails.TotalOperationCostSubAssemblyForProfit = checkForNull(setOverheadAndProfitCostForAssembly(tempArr, 'Profit', 'Operation'))

        subAssemObj.CostingPartDetails.TotalWeldingCostComponentForProfit = checkForNull(getOverheadAndProfitTotalCostForAssembly(tempArr, 'Profit', 'Welding'))
        subAssemObj.CostingPartDetails.TotalWeldingCostSubAssemblyForProfit = checkForNull(setOverheadAndProfitCostForAssembly(tempArr, 'Profit', 'Welding'))


        // other tecnology
        subAssemObj.CostingPartDetails.TotalProcessCostComponent = checkForNull(getProcessTotalCostForAssembly(tempArr))
        subAssemObj.CostingPartDetails.TotalProcessCostSubAssembly = setProcessCostForAssembly(tempArr)

        subAssemObj.CostingPartDetails.TotalCCForOtherTechnologyCostComponent = checkForNull(getProcessTotalCostForAssembly(tempArr, RMCCTabData[0]?.TechnologyId, "CCForOtherTechnology"))
        subAssemObj.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssembly = setProcessCostForAssembly(tempArr, RMCCTabData[0]?.TechnologyId, "CCForOtherTechnology")

        subAssemObj.CostingPartDetails.TotalProcessCostComponentForOverhead = checkForNull(getOverheadAndProfitTotalCostForAssembly(tempArr, 'Overhead', 'Process'))
        subAssemObj.CostingPartDetails.TotalProcessCostSubAssemblyForOverhead = checkForNull(setOverheadAndProfitCostForAssembly(tempArr, 'Overhead', 'Process'))

        subAssemObj.CostingPartDetails.TotalCCForOtherTechnologyCostComponentForOverhead = checkForNull(getOverheadAndProfitTotalCostForAssembly(tempArr, 'Overhead', 'CCForOtherTechnology'))
        subAssemObj.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssemblyForOverhead = checkForNull(setOverheadAndProfitCostForAssembly(tempArr, 'Overhead', 'CCForOtherTechnology'))

        subAssemObj.CostingPartDetails.TotalProcessCostComponentForProfit = checkForNull(getOverheadAndProfitTotalCostForAssembly(tempArr, 'Profit', 'Process'))
        subAssemObj.CostingPartDetails.TotalProcessCostSubAssemblyForProfit = checkForNull(setOverheadAndProfitCostForAssembly(tempArr, 'Profit', 'Process'))


        subAssemObj.CostingPartDetails.TotalCCForOtherTechnologyCostComponentForProfit = checkForNull(getOverheadAndProfitTotalCostForAssembly(tempArr, 'Profit', 'CCForOtherTechnology'))
        subAssemObj.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssemblyForProfit = checkForNull(setOverheadAndProfitCostForAssembly(tempArr, 'Profit', 'CCForOtherTechnology'))

        subAssemObj.CostingPartDetails.TotalOtherOperationCostComponent = checkForNull(getOtherOperationTotalCostForAssembly(tempArr))
        subAssemObj.CostingPartDetails.TotalOtherOperationCostPerSubAssembly = setOtherOperationCostForAssembly(tempArr)
        subAssemObj.CostingPartDetails.TotalOtherOperationCostPerAssembly = 0


        subAssemObj.CostingPartDetails.TotalConversionCostComponent = checkForNull(subAssemObj?.CostingPartDetails?.TotalOperationCostComponent) + checkForNull(subAssemObj?.CostingPartDetails?.TotalProcessCostComponent) + checkForNull(subAssemObj?.CostingPartDetails?.TotalOtherOperationCostComponent) + checkForNull(subAssemObj?.CostingPartDetails?.TotalWeldingCostComponent)
        subAssemObj.CostingPartDetails.TotalConversionCostPerSubAssembly = checkForNull(subAssemObj?.CostingPartDetails?.TotalOperationCostSubAssembly) + checkForNull(subAssemObj?.CostingPartDetails?.TotalProcessCostSubAssembly) + checkForNull(subAssemObj?.CostingPartDetails?.TotalOtherOperationCostPerSubAssembly) + checkForNull(subAssemObj?.CostingPartDetails?.TotalWeldingCostSubAssembly)
        subAssemObj.CostingPartDetails.TotalConversionCostPerAssembly = checkForNull(subAssemObj?.CostingPartDetails?.TotalOperationCostPerAssembly) + checkForNull(subAssemObj?.CostingPartDetails?.TotalProcessCostPerAssembly) + checkForNull(subAssemObj?.CostingPartDetails?.TotalOtherOperationCostPerAssembly) + checkForNull(subAssemObj?.CostingPartDetails?.TotalWeldingCostPerAssembly)
        subAssemObj.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostComponent) + checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostPerSubAssembly) + checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostPerAssembly)

        subAssemObj.CostingPartDetails.NetTotalRMBOPCC = checkForNull(subAssemObj?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity) + checkForNull(subAssemObj?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) + checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostWithQuantity);
        subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(subAssemObj?.CostingPartDetails?.NetTotalRMBOPCC) * subAssemObj?.CostingPartDetails?.Quantity;

        break;
      case 'Sub Assembly':
        subAssemObj.CostingPartDetails.NetRawMaterialsCost = setRMCostForSubAssembly(tempArr)
        subAssemObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity = checkForNull(subAssemObj?.CostingPartDetails?.NetRawMaterialsCost)
        subAssemObj.CostingPartDetails.RawMaterialCostWithCutOff = checkForNull(subAssemObj?.CostingPartDetails?.RawMaterialCostWithCutOff) * checkForNull(quantity)
        subAssemObj.CostingPartDetails.NetBoughtOutPartCost = setBOPCostForSubAssembly(tempArr)
        subAssemObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = (checkForNull(subAssemObj?.CostingPartDetails?.NetBoughtOutPartCost)) + checkForNull(subAssemObj?.CostingPartDetails?.BOPHandlingCharges);
        subAssemObj.CostingPartDetails.NetConversionCost = setConversionCostForSubAssembly(tempArr) + checkForNull(subAssemObj?.CostingPartDetails?.TotalOperationCostPerAssembly) + checkForNull(subAssemObj?.CostingPartDetails?.TotalWeldingCostPerAssembly) + checkForNull(subAssemObj?.CostingPartDetails?.TotalProcessCostPerAssembly)
        subAssemObj.CostingPartDetails.NetTotalRMBOPCC = checkForNull(subAssemObj?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity) + checkForNull(subAssemObj?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) + checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostWithQuantity);
        subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(subAssemObj?.CostingPartDetails?.NetTotalRMBOPCC) * checkForNull(subAssemObj?.CostingPartDetails?.Quantity);
        subAssemObj.CostingPartDetails.TotalOtherOperationCostPerAssembly = 0

        subAssemObj.CostingPartDetails.TotalConversionCostComponent = checkForNull(subAssemObj.CostingPartDetails.TotalOperationCostComponent) + checkForNull(subAssemObj.CostingPartDetails.TotalProcessCostComponent) + checkForNull(subAssemObj.CostingPartDetails.TotalOtherOperationCostComponent) + checkForNull(subAssemObj?.CostingPartDetails?.TotalWeldingCostComponent)
        subAssemObj.CostingPartDetails.TotalConversionCostPerSubAssembly = checkForNull(subAssemObj.CostingPartDetails.TotalOperationCostSubAssembly) + checkForNull(subAssemObj.CostingPartDetails.TotalProcessCostSubAssembly) + checkForNull(subAssemObj.CostingPartDetails.TotalOtherOperationCostPerSubAssembly) + checkForNull(subAssemObj.CostingPartDetails.TotalWeldingCostSubAssembly)
        subAssemObj.CostingPartDetails.TotalConversionCostPerAssembly = checkForNull(subAssemObj.CostingPartDetails.TotalOperationCostPerAssembly) + checkForNull(subAssemObj.CostingPartDetails.TotalProcessCostPerAssembly) + checkForNull(subAssemObj.CostingPartDetails.TotalOtherOperationCostPerAssembly) + checkForNull(subAssemObj.CostingPartDetails.TotalWeldingCostPerAssembly)
        subAssemObj.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostComponent) + checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostPerSubAssembly) + checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostPerAssembly)

        break;
      case 'Sub Assembly Operation':
        subAssemObj.CostingPartDetails.TotalOperationCostSubAssembly = setOperationCostForAssembly(tempArr)
        subAssemObj.CostingPartDetails.TotalOperationCostSubAssemblyForOverhead = checkForNull(setOverheadAndProfitCostForAssembly(tempArr, 'Overhead', 'Operation'))
        subAssemObj.CostingPartDetails.TotalOperationCostSubAssemblyForProfit = checkForNull(setOverheadAndProfitCostForAssembly(tempArr, 'Profit', 'Operation'))
        subAssemObj.CostingPartDetails.TotalOtherOperationCostComponent = getOtherOperationTotalCostForAssembly(tempArr)
        subAssemObj.CostingPartDetails.TotalOtherOperationCostPerSubAssembly = setOtherOperationCostForAssembly(tempArr)

        subAssemObj.CostingPartDetails.TotalWeldingCostSubAssembly = setOperationCostForAssembly(tempArr, 'Welding')
        subAssemObj.CostingPartDetails.TotalWeldingCostSubAssemblyForOverhead = checkForNull(setOverheadAndProfitCostForAssembly(tempArr, 'Overhead', 'Welding'))
        subAssemObj.CostingPartDetails.TotalWeldingCostSubAssemblyForProfit = checkForNull(setOverheadAndProfitCostForAssembly(tempArr, 'Profit', 'Welding'))



        subAssemObj.CostingPartDetails.TotalConversionCostComponent = checkForNull(subAssemObj.CostingPartDetails.TotalOperationCostComponent) + checkForNull(subAssemObj.CostingPartDetails.TotalProcessCostComponent) + checkForNull(subAssemObj.CostingPartDetails.TotalOtherOperationCostComponent) + checkForNull(subAssemObj?.CostingPartDetails?.TotalWeldingCostComponent)
        subAssemObj.CostingPartDetails.TotalConversionCostPerSubAssembly = checkForNull(subAssemObj.CostingPartDetails.TotalOperationCostSubAssembly) + checkForNull(subAssemObj.CostingPartDetails.TotalOtherOperationCostPerSubAssembly) + checkForNull(subAssemObj.CostingPartDetails.TotalProcessCostSubAssembly) + checkForNull(subAssemObj?.CostingPartDetails?.TotalWeldingCostSubAssembly)
        subAssemObj.CostingPartDetails.TotalConversionCostPerAssembly = checkForNull(subAssemObj?.CostingPartDetails?.TotalOperationCostPerAssembly) + checkForNull(subAssemObj?.CostingPartDetails?.TotalProcessCostPerAssembly) + checkForNull(subAssemObj?.CostingPartDetails?.TotalOtherOperationCostPerAssembly) + checkForNull(subAssemObj?.CostingPartDetails?.TotalWeldingCostPerAssembly)
        subAssemObj.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostComponent) + checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostPerSubAssembly) + checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostPerAssembly)
        subAssemObj.CostingPartDetails.NetConversionCost = checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostWithQuantity)

        subAssemObj.CostingPartDetails.NetTotalRMBOPCC = checkForNull(subAssemObj?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity) + checkForNull(subAssemObj?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) + checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostWithQuantity);
        subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(subAssemObj?.CostingPartDetails?.NetTotalRMBOPCC) * checkForNull(subAssemObj?.CostingPartDetails?.Quantity);
        break;
      case 'Sub Assembly Process':
        subAssemObj.CostingPartDetails.TotalProcessCostSubAssembly = setProcessCostForAssembly(tempArr)
        subAssemObj.CostingPartDetails.TotalProcessCostSubAssemblyForOverhead = checkForNull(setOverheadAndProfitCostForAssembly(tempArr, 'Overhead', 'Process'))
        subAssemObj.CostingPartDetails.TotalProcessCostSubAssemblyForProfit = checkForNull(setOverheadAndProfitCostForAssembly(tempArr, 'Profit', 'Process'))

        subAssemObj.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssembly = setProcessCostForAssembly(tempArr, RMCCTabData[0]?.TechnolohyId,"CCForOtherTechnology")
        subAssemObj.CostingPartDetails.TotatCCForOtherTechnologyCostSubAssemblyForOverhead = checkForNull(setOverheadAndProfitCostForAssembly(tempArr, 'Overhead', 'CCForOtherTechnology'))
        subAssemObj.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssemblyForProfit = checkForNull(setOverheadAndProfitCostForAssembly(tempArr, 'Profit', 'CCForOtherTechnology'))



        subAssemObj.CostingPartDetails.TotalConversionCostComponent = checkForNull(subAssemObj.CostingPartDetails.TotalOperationCostComponent) + checkForNull(subAssemObj.CostingPartDetails.TotalProcessCostComponent) + checkForNull(subAssemObj.CostingPartDetails.TotalOtherOperationCostComponent) + checkForNull(subAssemObj?.CostingPartDetails?.TotalWeldingCostComponent)
        subAssemObj.CostingPartDetails.TotalConversionCostPerSubAssembly = checkForNull(subAssemObj.CostingPartDetails.TotalOperationCostSubAssembly) + checkForNull(subAssemObj.CostingPartDetails.TotalOtherOperationCostPerSubAssembly) + checkForNull(subAssemObj.CostingPartDetails.TotalProcessCostSubAssembly) + checkForNull(subAssemObj?.CostingPartDetails?.TotalWeldingCostSubAssembly)
        subAssemObj.CostingPartDetails.TotalConversionCostPerAssembly = checkForNull(subAssemObj?.CostingPartDetails?.TotalOperationCostPerAssembly) + checkForNull(subAssemObj?.CostingPartDetails?.TotalProcessCostPerAssembly) + checkForNull(subAssemObj?.CostingPartDetails?.TotalOtherOperationCostPerAssembly) + checkForNull(subAssemObj?.CostingPartDetails?.TotalWeldingCostPerAssembly)
        subAssemObj.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostComponent) + checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostPerSubAssembly) + checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostPerAssembly)
        subAssemObj.CostingPartDetails.NetConversionCost = checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostWithQuantity)
        subAssemObj.CostingPartDetails.NetTotalRMBOPCC = checkForNull(subAssemObj?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity) + checkForNull(subAssemObj?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) + checkForNull(subAssemObj?.CostingPartDetails?.TotalConversionCostWithQuantity);
        subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(subAssemObj?.CostingPartDetails?.NetTotalRMBOPCC) * checkForNull(subAssemObj?.CostingPartDetails?.Quantity);
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
      newItem.CostingPartDetails.NetRawMaterialsCost = checkForNull(obj?.CostingPartDetails?.NetRawMaterialsCost)
      newItem.CostingPartDetails.RawMaterialCostWithCutOff = checkForNull(obj?.CostingPartDetails?.RawMaterialCostWithCutOff)
      newItem.CostingPartDetails.IsApplyBOPHandlingCharges = obj?.CostingPartDetails?.IsApplyBOPHandlingCharges;
      newItem.CostingPartDetails.BOPHandlingChargeApplicability = obj?.CostingPartDetails?.BOPHandlingChargeApplicability;
      newItem.CostingPartDetails.BOPHandlingPercentage = obj?.CostingPartDetails?.BOPHandlingPercentage;
      newItem.CostingPartDetails.BOPHandlingCharges = obj?.CostingPartDetails?.BOPHandlingCharges;
      newItem.CostingPartDetails.TotalRawMaterialsCostWithQuantity = obj?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity
      newItem.CostingPartDetails.NetBoughtOutPartCost = checkForNull(obj?.CostingPartDetails?.NetBoughtOutPartCost)
      newItem.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = obj?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity

      // FOR ASSEMBLY (OPERATION)
      newItem.CostingPartDetails.TotalOperationCostPerAssembly = obj?.CostingPartDetails?.TotalOperationCostPerAssembly
      newItem.CostingPartDetails.TotalOperationCostPerAssemblyForOverhead = obj?.CostingPartDetails?.TotalOperationCostPerAssemblyForOverhead
      newItem.CostingPartDetails.TotalOperationCostPerAssemblyForProfit = obj?.CostingPartDetails?.TotalOperationCostPerAssemblyForProfit

      newItem.CostingPartDetails.TotalWeldingCostPerAssembly = obj?.CostingPartDetails?.TotalWeldingCostPerAssembly
      newItem.CostingPartDetails.TotalWeldingCostPerAssemblyForOverhead = obj?.CostingPartDetails?.TotalWeldingCostPerAssemblyForOverhead
      newItem.CostingPartDetails.TotalWeldingCostPerAssemblyForProfit = obj?.CostingPartDetails?.TotalWeldingCostPerAssemblyForProfit

      // FOR SUB ASSEMBLY (OPERATION)
      newItem.CostingPartDetails.TotalOperationCostSubAssembly = obj?.CostingPartDetails?.TotalOperationCostSubAssembly
      newItem.CostingPartDetails.TotalOperationCostSubAssemblyForOverhead = obj?.CostingPartDetails?.TotalOperationCostSubAssemblyForOverhead
      newItem.CostingPartDetails.TotalOperationCostSubAssemblyForProfit = obj?.CostingPartDetails?.TotalOperationCostSubAssemblyForProfit

      newItem.CostingPartDetails.TotalWeldingCostSubAssembly = obj?.CostingPartDetails?.TotalWeldingCostSubAssembly
      newItem.CostingPartDetails.TotalWeldingCostSubAssemblyForOverhead = obj?.CostingPartDetails?.TotalWeldingCostSubAssemblyForOverhead
      newItem.CostingPartDetails.TotalWeldingCostSubAssemblyForProfit = obj?.CostingPartDetails?.TotalWeldingCostSubAssemblyForProfit

      // FOR COMPONENT (OPERATION)
      newItem.CostingPartDetails.TotalOperationCostComponent = obj?.CostingPartDetails?.TotalOperationCostComponent
      newItem.CostingPartDetails.TotalOperationCostComponentForOverhead = obj?.CostingPartDetails?.TotalOperationCostComponentForOverhead
      newItem.CostingPartDetails.TotalOperationCostComponentForProfit = obj?.CostingPartDetails?.TotalOperationCostComponentForProfit

      // FOR COMPONENT (WELDING)
      newItem.CostingPartDetails.TotalWeldingCostComponent = obj?.CostingPartDetails?.TotalWeldingCostComponent
      newItem.CostingPartDetails.TotalWeldingCostComponentForOverhead = obj?.CostingPartDetails?.TotalWeldingCostComponentForOverhead
      newItem.CostingPartDetails.TotalWeldingCostComponentForProfit = obj?.CostingPartDetails?.TotalWeldingCostComponentForProfit


      // FOR ASSEMBLY (PROCESS)
      newItem.CostingPartDetails.TotalProcessCostPerAssembly = obj?.CostingPartDetails?.TotalProcessCostPerAssembly
      newItem.CostingPartDetails.TotalProcessCostPerAssemblyForOverhead = obj?.CostingPartDetails?.TotalProcessCostPerAssemblyForOverhead
      newItem.CostingPartDetails.TotalProcessCostPerAssemblyForProfit = obj?.CostingPartDetails?.TotalProcessCostPerAssemblyForProfit

      //FOR OTHER PROCES TECHNOLOGY
      newItem.CostingPartDetails.TotalCCForOtherTechnologyCostPerAssembly = obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssembly
      newItem.CostingPartDetails.TotalCCForOtherTechnologyCostPerAssemblyForOverhead = obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssemblyForOverhead
      newItem.CostingPartDetails.TotalCCForOtherTechnologyCostPerAssemblyForProfit = obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssemblyForProfit

      // FOR SUB ASSEMBLY (PROCESS)
      newItem.CostingPartDetails.TotalProcessCostSubAssembly = obj?.CostingPartDetails?.TotalProcessCostSubAssembly
      newItem.CostingPartDetails.TotalProcessCostSubAssemblyForOverhead = obj?.CostingPartDetails?.TotalProcessCostSubAssemblyForOverhead
      newItem.CostingPartDetails.TotalProcessCostSubAssemblyForProfit = obj?.CostingPartDetails?.TotalProcessCostSubAssemblyForProfit

      //FOR OTHER PROCES TECHNOLOGY
      newItem.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssembly = obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostSubAssembly
      newItem.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssemblyForOverhead = obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostSubAssemblyForOverhead
      newItem.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssemblyForProfit = obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostSubAssemblyForProfit

      // FOR COMPONENT (PROCESS)
      newItem.CostingPartDetails.TotalProcessCostComponent = obj?.CostingPartDetails?.TotalProcessCostComponent
      newItem.CostingPartDetails.TotalProcessCostComponentForOverhead = obj?.CostingPartDetails?.TotalProcessCostComponentForOverhead
      newItem.CostingPartDetails.TotalProcessCostComponentForProfit = obj?.CostingPartDetails?.TotalProcessCostComponentForProfit
      //FOR OTHER PROCES TECHNOLOGY
      newItem.CostingPartDetails.TotalCCForOtherTechnologyCostComponent = obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostComponent
      newItem.CostingPartDetails.TotalCCForOtherTechnologyCostComponentForOverhead = obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostComponentForOverhead
      newItem.CostingPartDetails.TotalCCForOtherTechnologyCostComponentForProfit = obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostComponentForProfit

      newItem.CostingPartDetails.NetConversionCost = checkForNull(obj?.CostingPartDetails?.NetConversionCost)
      newItem.CostingPartDetails.TotalConversionCostPerAssembly = obj?.CostingPartDetails?.TotalConversionCostPerAssembly
      newItem.CostingPartDetails.TotalConversionCostPerSubAssembly = obj?.CostingPartDetails?.TotalConversionCostPerSubAssembly
      newItem.CostingPartDetails.TotalConversionCostComponent = obj?.CostingPartDetails?.TotalConversionCostComponent
      newItem.CostingPartDetails.TotalConversionCostWithQuantity = obj?.CostingPartDetails?.TotalConversionCostWithQuantity + checkForNull(obj?.CostingPartDetails?.IndirectLaborCost) + checkForNull(obj?.CostingPartDetails?.StaffCost) + checkForNull(obj?.CostingPartDetails?.NetLabourCost)

      newItem.CostingPartDetails.NetTotalRMBOPCC = checkForNull(obj?.CostingPartDetails?.NetTotalRMBOPCC)
      newItem.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = obj?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity
      newItem.CostingPartDetails.IsRMCutOffApplicable = obj?.CostingPartDetails?.IsRMCutOffApplicable

      newItem.CostingPartDetails.TotalOtherOperationCostComponent = obj?.CostingPartDetails?.TotalOtherOperationCostComponent
      newItem.CostingPartDetails.TotalOtherOperationCostPerSubAssembly = obj?.CostingPartDetails?.TotalOtherOperationCostPerSubAssembly
      newItem.CostingPartDetails.TotalOtherOperationCostPerAssembly = obj?.CostingPartDetails?.TotalOtherOperationCostPerAssembly
      newItem.CalculatorType = ComponentItemData?.CostingPartDetails?.CostingRawMaterialsCost && ComponentItemData?.CostingPartDetails?.CostingRawMaterialsCost[0]?.CalculatorType ? ComponentItemData?.CostingPartDetails?.CostingRawMaterialsCost[0]?.CalculatorType : ''
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
        if (assemblyObj?.CostingPartDetails?.PartType === 'Assembly' || assemblyObj?.CostingPartDetails?.PartType === TOOLINGPART) {

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
        if (assemblyObj?.CostingPartDetails?.PartType === 'Assembly' || assemblyObj?.CostingPartDetails?.PartType === TOOLINGPART) {
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
   * @method setConversionCost
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
        if (assemblyObj?.CostingPartDetails?.PartType === 'Assembly' || assemblyObj?.CostingPartDetails?.PartType === TOOLINGPART) {
          assemblyObj.CostingPartDetails.TotalOperationCostSubAssembly = setOperationCostForAssembly(subAssemblyArray)
          assemblyObj.CostingPartDetails.TotalOperationCostSubAssemblyForOverhead = setOverheadAndProfitCostForAssembly(subAssemblyArray, 'Overhead', 'Operation')
          assemblyObj.CostingPartDetails.TotalOperationCostSubAssemblyForProfit = setOverheadAndProfitCostForAssembly(subAssemblyArray, 'Profit', 'Operation')

          assemblyObj.CostingPartDetails.TotalWeldingCostSubAssembly = setOperationCostForAssembly(subAssemblyArray, 'Welding')
          assemblyObj.CostingPartDetails.TotalWeldingCostSubAssemblyForOverhead = setOverheadAndProfitCostForAssembly(subAssemblyArray, 'Overhead', 'Welding')
          assemblyObj.CostingPartDetails.TotalWeldingCostSubAssemblyForProfit = setOverheadAndProfitCostForAssembly(subAssemblyArray, 'Profit', 'Welding')

          assemblyObj.CostingPartDetails.TotalOperationCostComponent = getOperationTotalCostForAssembly(partAssemblyArray)
          assemblyObj.CostingPartDetails.TotalOperationCostComponentForOverhead = getOverheadAndProfitTotalCostForAssembly(partAssemblyArray, 'Overhead', 'Operation')
          assemblyObj.CostingPartDetails.TotalOperationCostComponentForProfit = getOverheadAndProfitTotalCostForAssembly(partAssemblyArray, 'Profit', 'Operation')

          assemblyObj.CostingPartDetails.TotalWeldingCostComponent = getOperationTotalCostForAssembly(partAssemblyArray, "Welding")
          assemblyObj.CostingPartDetails.TotalWeldingCostComponentForOverhead = getOverheadAndProfitTotalCostForAssembly(partAssemblyArray, 'Overhead', 'Welding')
          assemblyObj.CostingPartDetails.TotalWeldingCostComponentForProfit = getOverheadAndProfitTotalCostForAssembly(partAssemblyArray, 'Profit', 'Welding')

          assemblyObj.CostingPartDetails.TotalProcessCostComponent = getProcessTotalCostForAssembly(partAssemblyArray)
          assemblyObj.CostingPartDetails.TotalProcessCostComponentForOverhead = getOverheadAndProfitTotalCostForAssembly(partAssemblyArray, 'Overhead', 'Process')
          assemblyObj.CostingPartDetails.TotalProcessCostComponentForProfit = getOverheadAndProfitTotalCostForAssembly(partAssemblyArray, 'Profit', 'Process')


          assemblyObj.CostingPartDetails.TotalProcessCostSubAssembly = setProcessCostForAssembly(subAssemblyArray)
          assemblyObj.CostingPartDetails.TotalProcessCostSubAssemblyForOverhead = setOverheadAndProfitCostForAssembly(subAssemblyArray, 'Overhead', 'Process')
          assemblyObj.CostingPartDetails.TotalProcessCostSubAssemblyForProfit = setOverheadAndProfitCostForAssembly(subAssemblyArray, 'Profit', 'Process')


          //FOR OTHER PROCES TECHNOLOGY


          assemblyObj.CostingPartDetails.TotalCCForOtherTechnologyCostComponent = getProcessTotalCostForAssembly(partAssemblyArray, assemblyObj?.TechnologyId, "CCForOtherTechnology")
          assemblyObj.CostingPartDetails.TotalCCForOtherTechnologyCostComponentForOverhead = getOverheadAndProfitTotalCostForAssembly(partAssemblyArray, 'Overhead', 'CCForOtherTechnology')
          assemblyObj.CostingPartDetails.TotalCCForOtherTechnologyCostComponentForProfit = getOverheadAndProfitTotalCostForAssembly(partAssemblyArray, 'Profit', 'CCForOtherTechnology')

          assemblyObj.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssembly = setProcessCostForAssembly(subAssemblyArray, RMCCTabData[0]?.TechnologyId?.TechnologyId, "CCForOtherTechnology")
          assemblyObj.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssemblyForOverhead = setOverheadAndProfitCostForAssembly(subAssemblyArray, 'Overhead', 'CCForOtherTechnology')
          assemblyObj.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssemblyForProfit = setOverheadAndProfitCostForAssembly(subAssemblyArray, 'Profit', 'CCForOtherTechnology')

          assemblyObj.CostingPartDetails.TotalOtherOperationCostComponent = getOtherOperationTotalCostForAssembly(partAssemblyArray)
          assemblyObj.CostingPartDetails.TotalOtherOperationCostPerSubAssembly = setOtherOperationCostForAssembly(subAssemblyArray)
          assemblyObj.CostingPartDetails.TotalOtherOperationCostPerAssembly = 0

          assemblyObj.CostingPartDetails.TotalConversionCostComponent = checkForNull(assemblyObj.CostingPartDetails.TotalOperationCostComponent) + checkForNull(assemblyObj.CostingPartDetails.TotalProcessCostComponent) + checkForNull(assemblyObj.CostingPartDetails.TotalOtherOperationCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.TotalWeldingCostComponent)
          assemblyObj.CostingPartDetails.TotalConversionCostPerSubAssembly = checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostSubAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalOtherOperationCostPerSubAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalProcessCostSubAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalWeldingCostSubAssembly)
          assemblyObj.CostingPartDetails.TotalConversionCostPerAssembly = checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalOtherOperationCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalProcessCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalWeldingCostPerAssembly)

          assemblyObj.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.TotalConversionCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.TotalConversionCostPerSubAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalConversionCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.IndirectLaborCost) + checkForNull(assemblyObj?.CostingPartDetails?.NetLabourCost) + checkForNull(assemblyObj?.CostingPartDetails?.StaffCost)
          // assemblyObj.CostingPartDetails.TotalConversionCostWithQuantity = setConversionCostAssembly(subAssemblyArray) + checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.TotalProcessCostPerAssembly) + checkForNull(assemblyObj.CostingPartDetails.TotalProcessCostComponent) + checkForNull(setOtherOperationForSubAssembly([...subAssemblyArray, ...partAssemblyArray]))


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
  * @method toggleAssembly
  * @description SET PART DETAILS
  */
  const toggleAssembly = (BOMLevel, PartNumber, Children = {}, AssemblyPartNumber) => {
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
    setAssembly(BOMLevel, PartNumber, Children, RMCCTabData, AssemblyPartNumber)
  }

  /**
  * @method setAssembly
  * @description SET PART DETAILS
  */
  const setAssembly = (BOMLevel, PartNumber, Children, RMCCTabData, AssemblyPartNumber) => {
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
          let subbAssemblyIndex = tempArrForCosting && tempArrForCosting.findIndex(item => item.PartNumber === params.PartNumber && item.AssemblyPartNumber === AssemblyPartNumber)

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

            // FOR ASSEMBLY (OPERATION)
            subAssemblyToUpdate.CostingPartDetails.TotalOperationCostPerAssembly = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalOperationCostPerAssembly)
            subAssemblyToUpdate.CostingPartDetails.TotalOperationCostPerAssemblyForOverhead = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalOperationCostPerAssemblyForOverhead)
            subAssemblyToUpdate.CostingPartDetails.TotalOperationCostPerAssemblyForProfit = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalOperationCostPerAssemblyForProfit)

            // FOR ASSEMBLY (WELDING)
            subAssemblyToUpdate.CostingPartDetails.TotalWeldingCostPerAssembly = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalWeldingCostPerAssembly)
            subAssemblyToUpdate.CostingPartDetails.TotalWeldingCostPerAssemblyForOverhead = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalWeldingCostPerAssemblyForOverhead)
            subAssemblyToUpdate.CostingPartDetails.TotalWeldingCostPerAssemblyForProfit = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalWeldingCostPerAssemblyForProfit)

            // FOR SUB ASSEMBLY (OPERATION)
            subAssemblyToUpdate.CostingPartDetails.TotalOperationCostSubAssembly = setOperationCostForAssembly(ccSubAssemblyArray)
            subAssemblyToUpdate.CostingPartDetails.TotalOperationCostSubAssemblyForOverhead = setOverheadAndProfitCostForAssembly(ccSubAssemblyArray, 'Overhead', 'Operation')
            subAssemblyToUpdate.CostingPartDetails.TotalOperationCostSubAssemblyForProfit = setOverheadAndProfitCostForAssembly(ccSubAssemblyArray, 'Profit', 'Operation')

            // FOR SUB ASSEMBLY (WELDING)
            subAssemblyToUpdate.CostingPartDetails.TotalWeldingCostSubAssembly = setOperationCostForAssembly(ccSubAssemblyArray, "Welding")
            subAssemblyToUpdate.CostingPartDetails.TotalWeldingCostSubAssemblyForOverhead = setOverheadAndProfitCostForAssembly(ccSubAssemblyArray, 'Overhead', 'Welding')
            subAssemblyToUpdate.CostingPartDetails.TotalWeldingCostSubAssemblyForProfit = setOverheadAndProfitCostForAssembly(ccSubAssemblyArray, 'Profit', 'Welding')


            // FOR COMPONENT (OPERATION)
            subAssemblyToUpdate.CostingPartDetails.TotalOperationCostComponent = getOperationTotalCostForAssembly(ccPartAssemblyArray)
            subAssemblyToUpdate.CostingPartDetails.TotalOperationCostComponentForOverhead = getOverheadAndProfitTotalCostForAssembly(ccPartAssemblyArray, 'Overhead', 'Operation')
            subAssemblyToUpdate.CostingPartDetails.TotalOperationCostComponentForProfit = getOverheadAndProfitTotalCostForAssembly(ccPartAssemblyArray, 'Profit', 'Operation')

            // FOR COMPONENT (WELDING)
            subAssemblyToUpdate.CostingPartDetails.TotalWeldingCostComponent = getOperationTotalCostForAssembly(ccPartAssemblyArray, "Welding")
            subAssemblyToUpdate.CostingPartDetails.TotalWeldingCostComponentForOverhead = getOverheadAndProfitTotalCostForAssembly(ccPartAssemblyArray, 'Overhead', 'Welding')
            subAssemblyToUpdate.CostingPartDetails.TotalWeldingCostComponentForProfit = getOverheadAndProfitTotalCostForAssembly(ccPartAssemblyArray, 'Profit', 'Welding')

            // FOR ASSEMBLY (PROCESS)
            subAssemblyToUpdate.CostingPartDetails.TotalProcessCostPerAssembly = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalProcessCostPerAssembly)
            subAssemblyToUpdate.CostingPartDetails.TotalProcessCostPerAssemblyForOverhead = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalProcessCostPerAssemblyForOverhead)
            subAssemblyToUpdate.CostingPartDetails.TotalProcessCostPerAssemblyForProfit = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalProcessCostPerAssemblyForProfit)
            // FOR SUB ASSEMBLY (PROCESS)
            subAssemblyToUpdate.CostingPartDetails.TotalProcessCostSubAssembly = setProcessCostForAssembly(ccSubAssemblyArray)
            subAssemblyToUpdate.CostingPartDetails.TotalProcessCostSubAssemblyForOverhead = setOverheadAndProfitCostForAssembly(ccSubAssemblyArray, 'Overhead', 'Process')
            subAssemblyToUpdate.CostingPartDetails.TotalProcessCostSubAssemblyForProfit = setOverheadAndProfitCostForAssembly(ccSubAssemblyArray, 'Profit', 'Process')
            // FOR COMPONENT (PROCESS)
            subAssemblyToUpdate.CostingPartDetails.TotalProcessCostComponent = getProcessTotalCostForAssembly(ccPartAssemblyArray)
            subAssemblyToUpdate.CostingPartDetails.TotalProcessCostComponentForOverhead = getOverheadAndProfitTotalCostForAssembly(ccPartAssemblyArray, 'Overhead', 'Process')
            subAssemblyToUpdate.CostingPartDetails.TotalProcessCostComponentForProfit = getOverheadAndProfitTotalCostForAssembly(ccPartAssemblyArray, 'Profit', 'Process')

            // FOR ASSEMBLY (OTHER TECHNOLOGY PROCESS)
            subAssemblyToUpdate.CostingPartDetails.TotalCCForOtherTechnologyCostPerAssembly = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssembly)
            subAssemblyToUpdate.CostingPartDetails.TotalCCForOtherTechnologyCostPerAssemblyForOverhead = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssemblyForOverhead)
            subAssemblyToUpdate.CostingPartDetails.TotalCCForOtherTechnologyCostPerAssemblyForProfit = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssemblyForProfit)
            // FOR SUB ASSEMBLY (OTHER TECHNOLOGY PROCESS)

            subAssemblyToUpdate.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssembly = setProcessCostForAssembly(ccSubAssemblyArray, RMCCTabData[0]?.TechnologyId, "CCForOtherTechnology")
            subAssemblyToUpdate.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssemblyForOverhead = setOverheadAndProfitCostForAssembly(ccSubAssemblyArray, 'Overhead', 'CCForOtherTechnology')
            subAssemblyToUpdate.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssemblyForProfit = setOverheadAndProfitCostForAssembly(ccSubAssemblyArray, 'Profit', 'CCForOtherTechnology')
            // FOR COMPONENT (OTHER TECHNOLOGY PROCESS)


            subAssemblyToUpdate.CostingPartDetails.TotalCCForOtherTechnologyCostComponent = getProcessTotalCostForAssembly(ccPartAssemblyArray, subAssemblyToUpdate?.TechnologyId, "CCForOtherTechnology")
            subAssemblyToUpdate.CostingPartDetails.TotalCCForOtherTechnologyCostComponentForOverhead = getOverheadAndProfitTotalCostForAssembly(ccPartAssemblyArray, 'Overhead', 'Process')
            subAssemblyToUpdate.CostingPartDetails.TotalCCForOtherTechnologyCostComponentForProfit = getOverheadAndProfitTotalCostForAssembly(ccPartAssemblyArray, 'Profit', 'Process')



            subAssemblyToUpdate.CostingPartDetails.TotalOtherOperationCostComponent = getOtherOperationTotalCostForAssembly(ccPartAssemblyArray)
            subAssemblyToUpdate.CostingPartDetails.TotalOtherOperationCostPerSubAssembly = setOtherOperationCostForAssembly(ccSubAssemblyArray)
            subAssemblyToUpdate.CostingPartDetails.TotalOtherOperationCostPerAssembly = 0

            subAssemblyToUpdate.CostingPartDetails.TotalConversionCostComponent = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalOperationCostComponent) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalProcessCostComponent) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalOtherOperationCostComponent) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalWeldingCostComponent)
            subAssemblyToUpdate.CostingPartDetails.TotalConversionCostPerAssembly = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalOperationCostPerAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalProcessCostPerAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalOtherOperationCostPerAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalWeldingCostPerAssembly)
            subAssemblyToUpdate.CostingPartDetails.TotalConversionCostPerSubAssembly = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalOperationCostSubAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalProcessCostSubAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalOtherOperationCostPerSubAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalWeldingCostSubAssembly)
            subAssemblyToUpdate.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalConversionCostComponent) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalConversionCostPerSubAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalConversionCostPerAssembly)
            subAssemblyToUpdate.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = (checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalConversionCostWithQuantity)) * checkForNull(subAssemblyToUpdate?.Quantity)

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

        // FOR ASSEMBLY (OPERATION)
        assemblyObj.CostingPartDetails.TotalOperationCostPerAssembly = checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostPerAssembly)
        assemblyObj.CostingPartDetails.TotalOperationCostPerAssemblyForOverhead = checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostPerAssemblyForOverhead)
        assemblyObj.CostingPartDetails.TotalOperationCostPerAssemblyForProfit = checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostPerAssemblyForProfit)

        // FOR ASSEMBLY (WELDING)
        assemblyObj.CostingPartDetails.TotalWeldingCostPerAssembly = checkForNull(assemblyObj?.CostingPartDetails?.TotalWeldingCostPerAssembly)
        assemblyObj.CostingPartDetails.TotalWeldingCostPerAssemblyForOverhead = checkForNull(assemblyObj?.CostingPartDetails?.TotalWeldingCostPerAssemblyForOverhead)
        assemblyObj.CostingPartDetails.TotalWeldingCostPerAssemblyForProfit = checkForNull(assemblyObj?.CostingPartDetails?.TotalWeldingCostPerAssemblyForProfit)

        // FOR SUB ASSEMBLY (OPERATION)
        assemblyObj.CostingPartDetails.TotalOperationCostSubAssembly = setOperationCostForAssembly(ccSubAssemblyArray)
        assemblyObj.CostingPartDetails.TotalOperationCostSubAssemblyForOverhead = setOverheadAndProfitCostForAssembly(ccSubAssemblyArray, 'Overhead', 'Operation')
        assemblyObj.CostingPartDetails.TotalOperationCostSubAssemblyForProfit = setOverheadAndProfitCostForAssembly(ccSubAssemblyArray, 'Profit', 'Operation')

        // FOR SUB ASSEMBLY (WELDING)
        assemblyObj.CostingPartDetails.TotalWeldingCostSubAssembly = setOperationCostForAssembly(ccSubAssemblyArray, "Welding")
        assemblyObj.CostingPartDetails.TotalWeldingCostSubAssemblyForOverhead = setOverheadAndProfitCostForAssembly(ccSubAssemblyArray, 'Overhead', 'Welding')
        assemblyObj.CostingPartDetails.TotalWeldingCostSubAssemblyForProfit = setOverheadAndProfitCostForAssembly(ccSubAssemblyArray, 'Profit', 'Welding')

        // FOR COMPONENT (OPERATION)
        assemblyObj.CostingPartDetails.TotalOperationCostComponent = getOperationTotalCostForAssembly(ccPartAssemblyArray)
        assemblyObj.CostingPartDetails.TotalOperationCostComponentForOverhead = getOverheadAndProfitTotalCostForAssembly(ccPartAssemblyArray, 'Overhead', 'Operation')
        assemblyObj.CostingPartDetails.TotalOperationCostComponentForProfit = getOverheadAndProfitTotalCostForAssembly(ccPartAssemblyArray, 'Profit', 'Operation')

        // FOR COMPONENT (WELDING)
        assemblyObj.CostingPartDetails.TotalWeldingCostComponent = getOperationTotalCostForAssembly(ccPartAssemblyArray, "Welding")
        assemblyObj.CostingPartDetails.TotalWeldingCostComponentForOverhead = getOverheadAndProfitTotalCostForAssembly(ccPartAssemblyArray, 'Overhead', 'Welding')
        assemblyObj.CostingPartDetails.TotalWeldingCostComponentForProfit = getOverheadAndProfitTotalCostForAssembly(ccPartAssemblyArray, 'Profit', 'Welding')

        // FOR ASSEMBLY (PROCESS)
        assemblyObj.CostingPartDetails.TotalProcessCostPerAssembly = checkForNull(assemblyObj?.CostingPartDetails?.TotalProcessCostPerAssembly)
        assemblyObj.CostingPartDetails.TotalProcessCostPerAssemblyForOverhead = checkForNull(assemblyObj?.CostingPartDetails?.TotalProcessCostPerAssemblyForOverhead)
        assemblyObj.CostingPartDetails.TotalProcessCostPerAssemblyForProfit = checkForNull(assemblyObj?.CostingPartDetails?.TotalProcessCostPerAssemblyForProfit)
        // FOR ASSEMBLY ( OTHER TECHNOLOGY PROCESS)
        assemblyObj.CostingPartDetails.TotalCCForOtherTechnologyCostPerAssembly = checkForNull(assemblyObj?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssembly)
        assemblyObj.CostingPartDetails.TotalCCForOtherTechnologyCostPerAssemblyForOverhead = checkForNull(assemblyObj?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssemblyForOverhead)
        assemblyObj.CostingPartDetails.TotalCCForOtherTechnologyCostPerAssemblyForProfit = checkForNull(assemblyObj?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssemblyForProfit)


        // FOR SUB ASSEMBLY (PROCESS)
        assemblyObj.CostingPartDetails.TotalProcessCostSubAssembly = setProcessCostForAssembly(ccSubAssemblyArray)
        assemblyObj.CostingPartDetails.TotalProcessCostSubAssemblyForOverhead = setOverheadAndProfitCostForAssembly(ccSubAssemblyArray, 'Overhead', 'Process')
        assemblyObj.CostingPartDetails.TotalProcessCostSubAssemblyForProfit = setOverheadAndProfitCostForAssembly(ccSubAssemblyArray, 'Profit', 'Process')

        // FOR SUB ASSEMBLY ( Other Technology Process)
        assemblyObj.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssembly = setProcessCostForAssembly(ccSubAssemblyArray, RMCCTabData[0]?.TechnologyId, "CCForOtherTechnology")
        assemblyObj.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssemblyForOverhead = setOverheadAndProfitCostForAssembly(ccSubAssemblyArray, 'Overhead', 'CCForOtherTechnology')
        assemblyObj.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssemblyForProfit = setOverheadAndProfitCostForAssembly(ccSubAssemblyArray, 'Profit', 'CCForOtherTechnology')


        // FOR COMPONENT (PROCESS)
        assemblyObj.CostingPartDetails.TotalProcessCostComponent = getProcessTotalCostForAssembly(ccPartAssemblyArray)
        assemblyObj.CostingPartDetails.TotalProcessCostComponentForOverhead = getOverheadAndProfitTotalCostForAssembly(ccPartAssemblyArray, 'Overhead', 'Process')
        assemblyObj.CostingPartDetails.TotalProcessCostComponentForProfit = getOverheadAndProfitTotalCostForAssembly(ccPartAssemblyArray, 'Profit', 'Process')
        // FOR COMPONENT ( Other Technology Process)
        assemblyObj.CostingPartDetails.TotalCCForOtherTechnologyCostComponent = getProcessTotalCostForAssembly(ccPartAssemblyArray, assemblyObj?.TechnologyId, "CCForOtherTechnology")
        assemblyObj.CostingPartDetails.TotalCCForOtherTechnologyCostComponentForOverhead = getOverheadAndProfitTotalCostForAssembly(ccPartAssemblyArray, 'Overhead', 'CCForOtherTechnology')
        assemblyObj.CostingPartDetails.TotalCCForOtherTechnologyCostComponentForProfit = getOverheadAndProfitTotalCostForAssembly(ccPartAssemblyArray, 'Profit', 'CCForOtherTechnology')


        assemblyObj.CostingPartDetails.TotalOtherOperationCostComponent = setOtherOperationForSubAssembly([...ccPartAssemblyArray])
        assemblyObj.CostingPartDetails.TotalOtherOperationCostPerSubAssembly = setOtherOperationCostForAssembly(ccSubAssemblyArray)
        assemblyObj.CostingPartDetails.TotalOtherOperationCostPerAssembly = 0


        assemblyObj.CostingPartDetails.TotalConversionCostComponent = checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.TotalProcessCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.TotalOtherOperationCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.TotalWeldingCostComponent)
        assemblyObj.CostingPartDetails.TotalConversionCostPerAssembly = checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalProcessCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalOtherOperationCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalWeldingCostPerAssembly)
        assemblyObj.CostingPartDetails.TotalConversionCostPerSubAssembly = checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostSubAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalProcessCostSubAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalOtherOperationCostPerSubAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalWeldingCostSubAssembly)
        assemblyObj.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.TotalConversionCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.TotalConversionCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalConversionCostPerSubAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.IndirectLaborCost) + checkForNull(assemblyObj?.CostingPartDetails?.NetLabourCost) + checkForNull(assemblyObj?.CostingPartDetails?.StaffCost)


        assemblyObj.CostingPartDetails.IsOpen = params.BOMLevel !== LEVEL0 ? true : !assemblyObj?.CostingPartDetails?.IsOpen
        assemblyObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalConversionCostWithQuantity)



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
          newItem.CostingPartDetails.NetRawMaterialsCost = checkForNull(obj?.CostingPartDetails?.NetRawMaterialsCost)
          newItem.CostingPartDetails.TotalRawMaterialsCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity)
          newItem.CostingPartDetails.RawMaterialCostWithCutOff = checkForNull(obj?.CostingPartDetails?.RawMaterialCostWithCutOff)
          newItem.CostingPartDetails.NetBoughtOutPartCost = checkForNull(obj?.CostingPartDetails?.NetBoughtOutPartCost)
          newItem.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity)
          newItem.CostingPartDetails.NetConversionCost = checkForNull(obj?.CostingPartDetails?.NetConversionCost)

          newItem.CostingPartDetails.TotalConversionCostPerAssembly = obj?.CostingPartDetails?.TotalConversionCostPerAssembly
          newItem.CostingPartDetails.TotalConversionCostPerSubAssembly = obj?.CostingPartDetails?.TotalConversionCostPerSubAssembly
          newItem.CostingPartDetails.TotalConversionCostComponent = obj?.CostingPartDetails?.TotalConversionCostComponent

          newItem.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalConversionCostWithQuantity)
          //Assembly (Operation)
          newItem.CostingPartDetails.TotalOperationCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TotalOperationCostPerAssembly)
          newItem.CostingPartDetails.TotalOperationCostPerAssemblyForOverhead = checkForNull(obj?.CostingPartDetails?.TotalOperationCostPerAssemblyForOverhead)
          newItem.CostingPartDetails.TotalOperationCostPerAssemblyForProfit = checkForNull(obj?.CostingPartDetails?.TotalOperationCostPerAssemblyForProfit)

          //Assembly (WELDING)
          newItem.CostingPartDetails.TotalWeldingCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TotalWeldingCostPerAssembly)
          newItem.CostingPartDetails.TotalWeldingCostPerAssemblyForOverhead = checkForNull(obj?.CostingPartDetails?.TotalWeldingCostPerAssemblyForOverhead)
          newItem.CostingPartDetails.TotalWeldingCostPerAssemblyForProfit = checkForNull(obj?.CostingPartDetails?.TotalWeldingCostPerAssemblyForProfit)

          //Sub Assembly (Operation)
          newItem.CostingPartDetails.TotalOperationCostSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalOperationCostSubAssembly)
          newItem.CostingPartDetails.TotalOperationCostSubAssemblyForOverhead = checkForNull(obj?.CostingPartDetails?.TotalOperationCostSubAssemblyForOverhead)
          newItem.CostingPartDetails.TotalOperationCostSubAssemblyForProfit = checkForNull(obj?.CostingPartDetails?.TotalOperationCostSubAssemblyForProfit)

          //Sub Assembly (WELDING)
          newItem.CostingPartDetails.TotalWeldingCostSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalWeldingCostSubAssembly)
          newItem.CostingPartDetails.TotalWeldingCostSubAssemblyForOverhead = checkForNull(obj?.CostingPartDetails?.TotalWeldingCostSubAssemblyForOverhead)
          newItem.CostingPartDetails.TotalWeldingCostSubAssemblyForProfit = checkForNull(obj?.CostingPartDetails?.TotalWeldingCostSubAssemblyForProfit)

          //Component (Operation)
          newItem.CostingPartDetails.TotalOperationCostComponent = checkForNull(obj?.CostingPartDetails?.TotalOperationCostComponent)
          newItem.CostingPartDetails.TotalOperationCostComponentForOverhead = checkForNull(obj?.CostingPartDetails?.TotalOperationCostComponentForOverhead)
          newItem.CostingPartDetails.TotalOperationCostComponentForProfit = checkForNull(obj?.CostingPartDetails?.TotalOperationCostComponentForProfit)

          //Component (WELDING)
          newItem.CostingPartDetails.TotalWeldingCostComponent = checkForNull(obj?.CostingPartDetails?.TotalWeldingCostComponent)
          newItem.CostingPartDetails.TotalWeldingCostComponentForOverhead = checkForNull(obj?.CostingPartDetails?.TotalWeldingCostComponentForOverhead)
          newItem.CostingPartDetails.TotalWeldingCostComponentForProfit = checkForNull(obj?.CostingPartDetails?.TotalWeldingCostComponentForProfit)

          //Assembly (Process)
          newItem.CostingPartDetails.TotalProcessCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TotalProcessCostPerAssembly)
          newItem.CostingPartDetails.TotalProcessCostPerAssemblyForOverhead = checkForNull(obj?.CostingPartDetails?.TotalProcessCostPerAssemblyForOverhead)
          newItem.CostingPartDetails.TotalProcessCostPerAssemblyForProfit = checkForNull(obj?.CostingPartDetails?.TotalProcessCostPerAssemblyForProfit)

          //Assembly (Other Technology Process)
          newItem.CostingPartDetails.TotalCCForOtherTechnologyCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssembly)
          newItem.CostingPartDetails.TotalCCForOtherTechnologyCostPerAssemblyForOverhead = checkForNull(obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssemblyForOverhead)
          newItem.CostingPartDetails.TotalCCForOtherTechnologyCostPerAssemblyForProfit = checkForNull(obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssemblyForProfit)

          //Sub Assembly (Process)
          newItem.CostingPartDetails.TotalProcessCostSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalProcessCostSubAssembly)
          newItem.CostingPartDetails.TotalProcessCostSubAssemblyForOverhead = checkForNull(obj?.CostingPartDetails?.TotalProcessCostSubAssemblyForOverhead)
          newItem.CostingPartDetails.TotalProcessCostSubAssemblyForProfit = checkForNull(obj?.CostingPartDetails?.TotalProcessCostSubAssemblyForProfit)


          //Sub Assembly (Other Technology Process)
          newItem.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostSubAssembly)
          newItem.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssemblyForOverhead = checkForNull(obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostSubAssemblyForOverhead)
          newItem.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssemblyForProfit = checkForNull(obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostSubAssemblyForProfit)

          //Component (Process)
          newItem.CostingPartDetails.TotalProcessCostComponent = checkForNull(obj?.CostingPartDetails?.TotalProcessCostComponent)
          newItem.CostingPartDetails.TotalProcessCostComponentForOverhead = checkForNull(obj?.CostingPartDetails?.TotalProcessCostComponentForOverhead)
          newItem.CostingPartDetails.TotalProcessCostComponentForProfit = checkForNull(obj?.CostingPartDetails?.TotalProcessCostComponentForProfit)

          //Component (Other Technology Process)

          newItem.CostingPartDetails.TotalCCForOtherTechnologyCostComponent = checkForNull(obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostComponent)
          newItem.CostingPartDetails.TotalCCForOtherTechnologyCostComponentForOverhead = checkForNull(obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostComponentForOverhead)
          newItem.CostingPartDetails.TotalCCForOtherTechnologyCostComponentForProfit = checkForNull(obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostComponentForProfit)

          //Operation for subassembly key will come here
          newItem.CostingPartDetails.NetTotalRMBOPCC = checkForNull(obj?.CostingPartDetails?.NetTotalRMBOPCC)
          newItem.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity)
          newItem.CostingPartDetails.IsRMCutOffApplicable = obj?.CostingPartDetails?.IsRMCutOffApplicable
          newItem.CostingPartDetails.TotalOtherOperationCostComponent = obj?.CostingPartDetails?.TotalOtherOperationCostComponent
          newItem.CostingPartDetails.TotalOtherOperationCostPerSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalOtherOperationCostPerSubAssembly)
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
    tempArrForCosting[0].CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(tempArrForCosting[0]?.CostingPartDetails?.TotalConversionCostComponent) + checkForNull(tempArrForCosting[0]?.CostingPartDetails?.TotalConversionCostPerAssembly) + checkForNull(tempArrForCosting[0]?.CostingPartDetails?.TotalConversionCostPerSubAssembly) + checkForNull(data?.IndirectLaborCost) + checkForNull(data?.StaffCost) + checkForNull(data?.NetLabourCost)


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
        newItem.CostingPartDetails.TotalWeldingCostComponent = checkForNull(obj?.CostingPartDetails?.TotalWeldingCostComponent)

        newItem.CostingPartDetails.NetConversionCost = checkForNull(obj?.CostingPartDetails?.NetConversionCost)

        newItem.CostingPartDetails.TotalConversionCostPerAssembly = obj?.CostingPartDetails?.TotalConversionCostPerAssembly
        newItem.CostingPartDetails.TotalConversionCostPerSubAssembly = obj?.CostingPartDetails?.TotalConversionCostPerSubAssembly
        newItem.CostingPartDetails.TotalConversionCostComponent = obj?.CostingPartDetails?.TotalConversionCostComponent

        newItem.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalConversionCostWithQuantity)
        newItem.CostingPartDetails.NetTotalRMBOPCC = checkForNull(obj?.CostingPartDetails?.NetTotalRMBOPCC)
        newItem.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity)
        newItem.CostingPartDetails.IsRMCutOffApplicable = obj?.CostingPartDetails?.IsRMCutOffApplicable
        newItem.CostingPartDetails.TotalOtherOperationCostComponent = obj?.CostingPartDetails?.TotalOtherOperationCostComponent
        newItem.CostingPartDetails.TotalOtherOperationCostPerSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalOtherOperationCostPerSubAssembly)
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
  * @method setAssemblyProcessCost
  * @description SET RM COST
  */
  const setAssemblyProcessCost = (ProcessGrid, params, IsGridChanged, item) => {
    setAssemblyOperationCostInDataList(ProcessGrid, params, RMCCTabData, IsGridChanged, item, false)
  }



  /**
  * @method GetOperationCostTotal
  * @description GET TOTAL OPERATION COST FOR ASSEMBLY
  */
  const GetOperationCostTotal = (item, ForType = "") => {
    let NetCost = 0;
    if (!item) return NetCost;
    if (ForType === "Welding") {
      // Filter and sum only Welding operations
      const weldingOperations = item.filter(op => op?.ForType === "Welding");
      NetCost = weldingOperations.reduce((accumulator, el) => {
        return accumulator + checkForNull(el?.OperationCost);
      }, 0);
    } else {
      // Filter and sum only non-Welding operations
      const nonWeldingOperations = item.filter(op => op?.ForType !== "Welding");
      NetCost = nonWeldingOperations.reduce((accumulator, el) => {
        return accumulator + checkForNull(el?.OperationCost);
      }, 0);

    }

    return NetCost;
  }

  const GetProcessCostTotal = (item, TechnologyId, technologyType = "") => {
    
    if (technologyType === "CCForOtherTechnology") {
      return item.reduce((acc, el) =>
        el.ProcessTechnologyId !== TechnologyId ? acc + checkForNull(el?.ProcessCost) : acc
        , 0);
    }

    return item.reduce((acc, el) => acc + checkForNull(el?.ProcessCost), 0);
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
    if (ComponentItemData?.CostingPartDetails?.CostingConversionCost?.CostingOperationCostResponse?.length > 0) {
      const operations = ComponentItemData?.CostingPartDetails?.CostingConversionCost?.CostingOperationCostResponse;
      const hasMissingApplicability = operations?.some(item => !item?.CostingConditionMasterAndTypeLinkingId);
      if (operations?.length > 0 && hasMissingApplicability) {
        Toaster.warning('Please select Applicability for all operations');
        return false;
      }
    }
    setSaveDisable(true)

    let count = 0
    for (var prop in ErrorObjRMCC) {
      if (ErrorObjRMCC && ErrorObjRMCC[prop] && Object.keys(ErrorObjRMCC[prop])?.length > 0) {
        count++
      }
    }

    if (ErrorObjRMCC && count !== 0) {
      setSaveDisable(false)
      return false;
    }

    if (Object.keys(ComponentItemData).length > 0 && ComponentItemData.IsOpen !== false && checkIsDataChange === true) {
      let stCostingData = findSurfaceTreatmentData(ComponentItemData)
      let basicRateComponent = checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(RMCCTabData[0]?.CostingPartDetails?.NetTotalRMBOPCC) +
        checkForNull(SurfaceTabData[0]?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) + (initialConfiguration?.IsAddPaymentTermInNetCost ? checkForNull(DiscountCostData?.paymentTermCost) : 0) - checkForNull(DiscountCostData?.HundiOrDiscountValue)

      // "CalculatorType": ComponentItemData?.CostingPartDetails?.CostingRawMaterialsCost && ComponentItemData?.CostingPartDetails?.CostingRawMaterialsCost[0]?.CalculatorType,
      if (costData.IsAssemblyPart && !CostingViewMode) {
        const tabData = RMCCTabData[0]
        const surfaceTabData = SurfaceTabData[0]
        const overHeadAndProfitTabData = OverheadProfitTabData[0]
        const discountAndOtherTabData = DiscountCostData

        let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, netPOPrice, getAssemBOPCharge, 1, CostingEffectiveDate, '', '', isPartType, initialConfiguration?.IsAddPaymentTermInNetCost)

        dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
      }
      let obj = {
        costingId: ComponentItemData?.CostingId,
        subAsmCostingId: ComponentItemData?.SubAssemblyCostingId,
        asmCostingId: ComponentItemData?.AssemblyCostingId
      }
      dispatch(getCostingCostDetails(obj, response => {
        let allCostingData = response?.data?.Data
        let basicRate
        let netPOPriceTemp

        if (ComponentItemData?.PartType === "Component") {// COMPONENT
          basicRate = basicRateComponent
          netPOPriceTemp = netPOPrice
        } else if (ComponentItemData?.PartType === "Part") {// CHILD PART OF ASM : COMPONENT
          basicRate = (checkForNull(allCostingData?.NetSurfaceTreatmentCost) + checkForNull(ComponentItemData?.CostingPartDetails?.NetTotalRMBOPCC))
          netPOPriceTemp = (checkForNull(allCostingData?.NetSurfaceTreatmentCost) + checkForNull(ComponentItemData?.CostingPartDetails?.NetTotalRMBOPCC))
        }
        const hasNegativeValue = checkNegativeValue(ComponentItemData?.CostingPartDetails?.CostingRawMaterialsCost, 'NetLandedCost', 'Net Landed Cost')
        if (hasNegativeValue) {
          return false;
        }
        if (response?.data?.Result) {
          let requestData = createSaveComponentObject(ComponentItemData, CostingEffectiveDate, basicRate, netPOPriceTemp)
          dispatch(saveComponentCostingRMCCTab(requestData, res => {
            if (res.data.Result) {
              setSaveDisable(false)
              Toaster.success(isBreakupBoughtOutPartCostingFromAPI ? MESSAGES.RMCC_TAB_COSTING_SAVE_SUCCESS_IS_BOP_BREAKUP : MESSAGES.RMCC_TAB_COSTING_SAVE_SUCCESS);
              dispatch(savePartNumber(''))
              dispatch(saveBOMLevel(''))
              dispatch(CloseOpenAccordion())
              dispatch(setComponentItemData({}, () => { }))
              InjectDiscountAPICall()
              dispatch(isDataChange(false))
              dispatch(gridDataAdded(true))

            } else {
              setSaveDisable(false)
            }
          }))
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
      basicRate = checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(RMCCTabData[0]?.CostingPartDetails?.NetTotalRMBOPCC) +
        checkForNull(SurfaceTabData[0]?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
    }

    dispatch(saveDiscountOtherCostTab({ ...ComponentItemDiscountData, BasicRate: basicRate, EffectiveDate: CostingEffectiveDate, CallingFrom: 2, RFQCostingAttachments: [] }, res => {
      if (Number(previousTab) === 6) {
        dispatch(saveCostingPaymentTermDetail(PaymentTermDataDiscountTab, (res) => { }));
      }
    }))
  }


  const setBOPCostForhandling = (tempArr) => {
    const total = tempArr && tempArr.reduce((accummlator, item) => {
      if (item.PartType === 'Part' || item.PartType === 'BOP') {
        return accummlator + checkForNull(item?.CostingPartDetails?.NetBoughtOutPartCost) * checkForNull(item?.CostingPartDetails?.Quantity)
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
            subAssembObj.CostingPartDetails.NetBoughtOutPartCost = checkForNull(subAssembObj?.CostingPartDetails?.NetBoughtOutPartCost) + checkForNull(subAssembObj?.CostingPartDetails?.BOPHandlingCharges)
            let GrandTotalCost = checkForNull(subAssembObj?.CostingPartDetails?.NetRawMaterialsCost) + checkForNull(subAssembObj?.CostingPartDetails?.NetBoughtOutPartCost) + checkForNull(subAssembObj?.CostingPartDetails?.NetConversionCost)
            subAssembObj.CostingPartDetails.NetTotalRMBOPCC = GrandTotalCost;
            subAssembObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = subAssembObj?.CostingPartDetails?.NetTotalRMBOPCC * subAssembObj?.CostingPartDetails?.Quantity
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
        checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.ICCCost)) +
      checkForNull(PackageAndFreightTabData && PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) + checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost)) -
      checkForNull(discountAndOtherTabData?.HundiOrDiscountValue)) + checkForNull(discountAndOtherTabData?.AnyOtherCost)
    if (!CostingViewMode) {

      let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, TotalCost, getAssemBOPCharge, 1, CostingEffectiveDate, '', '', isPartType, initialConfiguration?.IsAddPaymentTermInNetCost)

      dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
    }

  }

  /**
* @method setAssemblyOperationCost
* @description SET Operation COST
*/
  const setAssemblyOperationCost = (OperationGrid, params, IsGridChanged, item) => {
    setAssemblyOperationCostInDataList(OperationGrid, params, RMCCTabData, IsGridChanged, item, true)
  }

  const setAssemblyOperationCostInDataList = (gridData, params, arr, IsGridChanged, item, isOperation) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {
        if (IsGridChanged) {

          const level = params.BOMLevel
          const useLevel = level.split('L')[1]
          let initialPartNo = ''
          let quant = ''
          let tempArrForCosting = JSON.parse(sessionStorage.getItem('costingArray')) || []

          for (let i = useLevel; i >= 0; i--) {

            if (item.PartType === "Sub Assembly") {
              // IF LEVEL WE ARE WOKRING IS OF SUBASSEMBLY TYPE UNDER SOME SUBASSMEBLY OR ASSEMBLY
              if (i === useLevel) { // SUB ASSEMBLY LEVEL HERE
                let checkIsAssemblyOpen = tempArrForCosting?.filter((x) => x.AssemblyPartNumber === item.PartNumber);
                let subAssemblyIndex = tempArrForCosting?.findIndex((x) => x.PartNumber === params.PartNumber && x.AssemblyPartNumber === item.AssemblyPartNumber);
                let subAssembObj = tempArrForCosting[subAssemblyIndex];
                // THIS ARRAY IS FOR GETTING CHILD UNDER SUBASSEMBLY (COMPONENT CHILD)
                let tempArr = tempArrForCosting?.filter((x) => x.AssemblyPartNumber === params.PartNumber && x.PartType === 'Part');
                // Assigning Costing Data Based on Operation or Process
                if (isOperation) {
                  subAssembObj.CostingPartDetails.CostingOperationCostResponse = gridData;
                  subAssembObj.CostingPartDetails.TotalOperationCostPerAssembly = GetOperationCostTotal(gridData);
                  subAssembObj.CostingPartDetails.TotalOperationCostPerAssemblyForOverhead = checkForNull(getOverheadAndProfitCostTotal(gridData, RMCCTabData[0]?.TechnologyId)?.overheadOperationCost) ?? 0
                  subAssembObj.CostingPartDetails.TotalOperationCostPerAssemblyForProfit = checkForNull(getOverheadAndProfitCostTotal(gridData, RMCCTabData[0]?.TechnologyId)?.profitOperationCost) ?? 0

                  subAssembObj.CostingPartDetails.TotalWeldingCostPerAssembly = GetOperationCostTotal(gridData, "Welding");
                  subAssembObj.CostingPartDetails.TotalWeldingCostPerAssemblyForOverhead = checkForNull(getOverheadAndProfitCostTotal(gridData, RMCCTabData[0]?.TechnologyId)?.overheadWeldingCost) ?? 0
                  subAssembObj.CostingPartDetails.TotalWeldingCostPerAssemblyForProfit = checkForNull(getOverheadAndProfitCostTotal(gridData, RMCCTabData[0]?.TechnologyId)?.profitWeldingCost) ?? 0
                } else {


                  subAssembObj.CostingPartDetails.CostingProcessCostResponse = gridData;
                  subAssembObj.CostingPartDetails.TotalProcessCostPerAssembly = GetProcessCostTotal(gridData);
                  subAssembObj.CostingPartDetails.TotalProcessCostPerAssemblyForOverhead = checkForNull(getOverheadAndProfitCostTotal(gridData, RMCCTabData[0]?.TechnologyId)?.overheadProcessCost) ?? 0
                  subAssembObj.CostingPartDetails.TotalProcessCostPerAssemblyForProfit = checkForNull(getOverheadAndProfitCostTotal(gridData, RMCCTabData[0]?.TechnologyId)?.profitProcessCost) ?? 0
                  
                  subAssembObj.CostingPartDetails.TotalCCForOtherTechnologyCostPerAssembly = GetProcessCostTotal(gridData, RMCCTabData[0]?.TechnologyId, "CCForOtherTechnology");
                  subAssembObj.CostingPartDetails.TotalCCForOtherTechnologyCostPerAssemblyForOverhead = checkForNull(getOverheadAndProfitCostTotal(gridData, RMCCTabData[0]?.TechnologyId)?.ccForOtherTechnologyCostForOverhead) ?? 0
                  subAssembObj.CostingPartDetails.TotalCCForOtherTechnologyCostPerAssemblyForProfit = checkForNull(getOverheadAndProfitCostTotal(gridData, RMCCTabData[0]?.TechnologyId)?.ccForOtherTechnologyCostForProfit) ?? 0
                }

                if (checkIsAssemblyOpen.length !== 0) {
let subAssemblyArray = tempArrForCosting?.filter((x) => {

return x.AssemblyPartNumber === params.PartNumber && x.PartType === 'Sub Assembly';
                  });
                  // 
                  // Calculating and Assigning Costs
                  subAssembObj.CostingPartDetails.TotalOperationCostComponent = getOperationTotalCostForAssembly(tempArr);
                  subAssembObj.CostingPartDetails.TotalOperationCostComponentForOverhead = getOverheadAndProfitTotalCostForAssembly(tempArr, 'Overhead', 'Operation')
                  subAssembObj.CostingPartDetails.TotalOperationCostComponentForProfit = getOverheadAndProfitTotalCostForAssembly(tempArr, 'Profit', 'Operation')

                  // Calculating and Assigning Costs for Welding
                  subAssembObj.CostingPartDetails.TotalWeldingCostComponent = checkForNull(getOperationTotalCostForAssembly(tempArr, "Welding"))
                  subAssembObj.CostingPartDetails.TotalWeldingCostComponentForOverhead = getOverheadAndProfitTotalCostForAssembly(tempArr, 'Overhead', 'Welding')
                  subAssembObj.CostingPartDetails.TotalWeldingCostComponentForProfit = getOverheadAndProfitTotalCostForAssembly(tempArr, 'Profit', 'Welding')

                  subAssembObj.CostingPartDetails.TotalOperationCostSubAssembly = setOperationCostForAssembly(subAssemblyArray);
                  subAssembObj.CostingPartDetails.TotalOperationCostSubAssemblyForOverhead = setOverheadAndProfitCostForAssembly(subAssemblyArray, 'Overhead', 'Operation')
                  subAssembObj.CostingPartDetails.TotalOperationCostSubAssemblyForProfit = setOverheadAndProfitCostForAssembly(subAssemblyArray, 'Profit', 'Operation')

                  subAssembObj.CostingPartDetails.TotalOtherOperationCostPerSubAssembly = setOtherOperationCostForAssembly(subAssemblyArray);

                  subAssembObj.CostingPartDetails.TotalWeldingCostSubAssembly = setOperationCostForAssembly(subAssemblyArray, "Welding");
                  subAssembObj.CostingPartDetails.TotalWeldingCostSubAssemblyForOverhead = setOverheadAndProfitCostForAssembly(subAssemblyArray, 'Overhead', 'Welding')
                  subAssembObj.CostingPartDetails.TotalWeldingCostSubAssemblyForProfit = setOverheadAndProfitCostForAssembly(subAssemblyArray, 'Profit', 'Welding')

                  // FOR COMPONENT (PROCESS)

                  subAssembObj.CostingPartDetails.TotalProcessCostComponent = getProcessTotalCostForAssembly(tempArr);
                  subAssembObj.CostingPartDetails.TotalProcessCostComponentForOverhead = getOverheadAndProfitTotalCostForAssembly(tempArr, 'Overhead', 'Process')
                  subAssembObj.CostingPartDetails.TotalProcessCostComponentForProfit = getOverheadAndProfitTotalCostForAssembly(tempArr, 'Profit', 'Process')


                  subAssembObj.CostingPartDetails.TotalProcessCostSubAssembly = setProcessCostForAssembly(subAssemblyArray);
                  subAssembObj.CostingPartDetails.TotalProcessCostSubAssemblyForOverhead = setOverheadAndProfitCostForAssembly(subAssemblyArray, 'Overhead', 'Process')
                  subAssembObj.CostingPartDetails.TotalProcessCostSubAssemblyForProfit = setOverheadAndProfitCostForAssembly(subAssemblyArray, 'Profit', 'Process')


                  subAssembObj.CostingPartDetails.TotalCCForOtherTechnologyCostComponent = getProcessTotalCostForAssembly(tempArr, RMCCTabData[0]?.TechnologyId, "CCForOtherTechnology");
                  subAssembObj.CostingPartDetails.TotalCCForOtherTechnologyCostComponentForOverhead = getOverheadAndProfitTotalCostForAssembly(tempArr, 'Overhead', 'CCForOtherTechnology')
                  subAssembObj.CostingPartDetails.TotalCCForOtherTechnologyCostComponentForProfit = getOverheadAndProfitTotalCostForAssembly(tempArr, 'Profit', 'CCForOtherTechnology')

                  



                  subAssembObj.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssembly = setProcessCostForAssembly(subAssemblyArray, RMCCTabData[0]?.TechnologyId, "CCForOtherTechnology");
                  subAssembObj.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssemblyForOverhead = setOverheadAndProfitCostForAssembly(subAssemblyArray, 'Overhead', 'CCForOtherTechnology')
                  subAssembObj.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssemblyForProfit = setOverheadAndProfitCostForAssembly(subAssemblyArray, 'Profit', 'CCForOtherTechnology')

                }

                subAssembObj.CostingPartDetails.TotalConversionCostComponent = checkForNull(subAssembObj?.CostingPartDetails?.TotalOperationCostComponent) + checkForNull(subAssembObj?.CostingPartDetails?.TotalProcessCostComponent) + checkForNull(subAssembObj?.CostingPartDetails?.TotalOtherOperationCostComponent) + checkForNull(subAssembObj?.CostingPartDetails?.TotalWeldingCostComponent)
                subAssembObj.CostingPartDetails.TotalConversionCostPerAssembly = checkForNull(subAssembObj?.CostingPartDetails?.TotalOperationCostPerAssembly) + checkForNull(subAssembObj?.CostingPartDetails?.TotalWeldingCostPerAssembly) + checkForNull(subAssembObj?.CostingPartDetails?.TotalProcessCostPerAssembly) + checkForNull(subAssembObj?.CostingPartDetails?.TotalOtherOperationCostPerAssembly)
                subAssembObj.CostingPartDetails.TotalConversionCostPerSubAssembly = checkForNull(subAssembObj?.CostingPartDetails?.TotalOperationCostSubAssembly) + checkForNull(subAssembObj?.CostingPartDetails?.TotalWeldingCostSubAssembly) + checkForNull(subAssembObj?.CostingPartDetails?.TotalProcessCostSubAssembly) + checkForNull(subAssembObj?.CostingPartDetails?.TotalOtherOperationCostPerSubAssembly)
                subAssembObj.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(subAssembObj?.CostingPartDetails?.TotalConversionCostComponent) + checkForNull(subAssembObj?.CostingPartDetails?.TotalConversionCostPerSubAssembly) + checkForNull(subAssembObj?.CostingPartDetails?.TotalConversionCostPerAssembly)
                subAssembObj.CostingPartDetails.NetConversionCost = checkForNull(subAssembObj?.CostingPartDetails?.TotalConversionCostWithQuantity)

                subAssembObj.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(subAssembObj?.CostingPartDetails?.TotalConversionCostComponent) + checkForNull(subAssembObj?.CostingPartDetails?.TotalConversionCostPerAssembly) + checkForNull(subAssembObj?.CostingPartDetails?.TotalConversionCostSubAssembly)

                // Calculating Grand Total Cost
                let GrandTotalCost = checkForNull(subAssembObj?.CostingPartDetails?.NetRawMaterialsCost) + checkForNull(subAssembObj?.CostingPartDetails?.NetBoughtOutPartCost) + checkForNull(subAssembObj?.CostingPartDetails?.NetConversionCost)
                subAssembObj.CostingPartDetails.NetTotalRMBOPCC = GrandTotalCost;
                subAssembObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = subAssembObj?.CostingPartDetails?.NetTotalRMBOPCC * subAssembObj?.CostingPartDetails?.Quantity

                tempArrForCosting = Object.assign([...tempArrForCosting], { [subAssemblyIndex]: subAssembObj })
                initialPartNo = item.AssemblyPartNumber; // ASSEMBLY PART NO OF SUBASSEMBLY
                quant = item?.CostingPartDetails?.Quantity
              } else {
                let indexForUpdate = _.findIndex(tempArrForCosting, ['PartNumber', initialPartNo]); // PARENT ASSEMBLY (SUBASSEMBLY/ASSEMBLY)
                let objectToUpdate = tempArrForCosting[indexForUpdate];

                if (objectToUpdate.PartType === 'Sub Assembly') {
                  let tempArr = _.filter(tempArrForCosting, ['AssemblyPartNumber', initialPartNo]);
                  initialPartNo = objectToUpdate.AssemblyPartNumber;

                  let subAssemObj = {}
                  if (isOperation) {
                    subAssemObj = calculationForSubAssembly(objectToUpdate, quant, 'Sub Assembly Operation', tempArr)
                  } else {
                    subAssemObj = calculationForSubAssembly(objectToUpdate, quant, 'Sub Assembly Process', tempArr)
                  }
                  quant = objectToUpdate?.CostingPartDetails?.Quantity
                  tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })
                }
              }
            }
          }

          // let Arr = tempArrForCosting && tempArrForCosting.filter(costing => costing.PartNumber === item.PartNumber && costing.AssemblyPartNumber !== item.AssemblyPartNumber)
          // Arr && Arr.map(costingItem => {
          //   const level = costingItem.BOMLevel
          //   const useLevel = level.split('L')[1]
          //   let initialPartNo = ''
          //   let quant = ''
          //   for (let i = useLevel; i >= 0; i--) {
          //     if (costingItem.PartType === "Sub Assembly") {
          //       // IF LEVEL WE ARE WORKING IS OF PART TYPE UNDER SOME SUBASSMEBLY OR ASSEMBLY
          //       if (i === useLevel) {
          //         let subAssemblyIndex = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === params.PartNumber && x.AssemblyPartNumber !== item.AssemblyPartNumber)
          //         let subAssembObj = tempArrForCosting[subAssemblyIndex]
          //         //THIS ARRAY IS FOR GETTING CHILD UNDER SUBASSEMBLY (COMPONENT CHILD)
          //         let tempArr = tempArrForCosting && tempArrForCosting.filter((x) => x.AssemblyPartNumber === params.PartNumber && x.PartType === 'Part')
          //         subAssembObj.CostingPartDetails.CostingOperationCostResponse = gridData;
          //         subAssembObj.CostingPartDetails.TotalOperationCostComponent = getCCTotalCostForAssembly(tempArr)
          //         subAssembObj.CostingPartDetails.TotalOperationCostPerAssembly = GetOperationCostTotal(gridData)
          //         //THIS ARRAY IS FOR GETTING CHILD UNDER SUBASSEMBLY (SUB ASSEMBLY CHILD)
          //         let subAssemblyArray = tempArrForCosting && tempArrForCosting.filter(x => x.AssemblyPartNumber === params.PartNumber && x.PartType === 'Sub Assembly')
          //         subAssembObj.CostingPartDetails.TotalOperationCostSubAssembly = setOperationCostForAssembly(subAssemblyArray)
          //         subAssembObj.CostingPartDetails.NetConversionCost = checkForNull(subAssembObj?.CostingPartDetails?.TotalOperationCostComponent) + checkForNull(subAssembObj?.CostingPartDetails?.TotalOperationCostSubAssembly) + checkForNull(subAssembObj?.CostingPartDetails?.TotalOperationCostPerAssembly)
          //         subAssembObj.CostingPartDetails.TotalConversionCostWithQuantity = subAssembObj?.CostingPartDetails?.NetConversionCost  //NEED TO CONFRIM THIS CALCULATION
          //         let GrandTotalCost = checkForNull(subAssembObj?.CostingPartDetails?.NetRawMaterialsCost) + checkForNull(subAssembObj?.CostingPartDetails?.NetBoughtOutPartCost) + checkForNull(subAssembObj?.CostingPartDetails?.NetConversionCost)
          //         subAssembObj.CostingPartDetails.NetTotalRMBOPCC = GrandTotalCost;
          //         subAssembObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = subAssembObj?.CostingPartDetails?.NetTotalRMBOPCC * subAssembObj?.CostingPartDetails?.Quantity
          //         tempArrForCosting = Object.assign([...tempArrForCosting], { [subAssemblyIndex]: subAssembObj })
          //         initialPartNo = item.AssemblyPartNumber //ASSEMBLY PART NO OF SUBASSEMBLY
          //         quant = item?.CostingPartDetails?.Quantity
          //       }
          //       else {
          //         let indexForUpdate = _.findIndex(tempArrForCosting, ['PartNumber', initialPartNo]); //WILL GIVE PARENT ASSEMBLY (SUBASSEMBLY /ASSEMBLY)
          //         let objectToUpdate = tempArrForCosting[indexForUpdate]
          //         if (objectToUpdate.PartType === 'Sub Assembly') {
          //           let tempArr = _.filter(tempArrForCosting, ['AssemblyPartNumber', initialPartNo]);
          //           initialPartNo = objectToUpdate.AssemblyPartNumber
          //           let subAssemObj = calculationForSubAssembly(objectToUpdate, quant, 'Sub Assembly Operation', tempArr)
          //           quant = objectToUpdate?.CostingPartDetails?.Quantity
          //           tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })
          //         }
          //       }
          //     }
          //   }
          //   return null
          // })
          let assemblyObj = tempArrForCosting[0]
          if (tempArrForCosting.length > 1) {
            let subAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item => item.BOMLevel === LEVEL1 && item.PartType === 'Sub Assembly')
            let componentArray = tempArrForCosting && tempArrForCosting.filter(item => item.BOMLevel === LEVEL1 && item.PartType === 'Part')

            // if (isOperation) {
            //   assemblyObj.CostingPartDetails.NetOperationCostPerComponent = checkForNull(setOperationCostForComponent(componentArray))

            // } else {

            // }
            assemblyObj.CostingPartDetails.TotalOperationCostSubAssembly = checkForNull(setOperationCostForAssembly(subAssemblyArray))
            assemblyObj.CostingPartDetails.TotalOperationCostSubAssemblyForOverhead = setOverheadAndProfitCostForAssembly(subAssemblyArray, 'Overhead', 'Operation')
            assemblyObj.CostingPartDetails.TotalOperationCostSubAssemblyForProfit = setOverheadAndProfitCostForAssembly(subAssemblyArray, 'Profit', 'Operation')

            assemblyObj.CostingPartDetails.TotalWeldingCostSubAssembly = checkForNull(setOperationCostForAssembly(subAssemblyArray, "Welding"))
            assemblyObj.CostingPartDetails.TotalWeldingCostSubAssemblyForOverhead = setOverheadAndProfitCostForAssembly(subAssemblyArray, 'Overhead', 'Welding')
            assemblyObj.CostingPartDetails.TotalWeldingCostSubAssemblyForProfit = setOverheadAndProfitCostForAssembly(subAssemblyArray, 'Profit', 'Welding')

            assemblyObj.CostingPartDetails.TotalOperationCostComponent = checkForNull(getOperationTotalCostForAssembly(componentArray))
            assemblyObj.CostingPartDetails.TotalOperationCostComponentForOverhead = checkForNull(getOverheadAndProfitTotalCostForAssembly(componentArray, 'Overhead', 'Operation'))
            assemblyObj.CostingPartDetails.TotalOperationCostComponentForProfit = checkForNull(getOverheadAndProfitTotalCostForAssembly(componentArray, 'Profit', 'Operation'))

            assemblyObj.CostingPartDetails.TotalOtherOperationCostPerSubAssembly = checkForNull(setOtherOperationCostForAssembly(subAssemblyArray))

            assemblyObj.CostingPartDetails.TotalWeldingCostComponent = checkForNull(getOperationTotalCostForAssembly(componentArray, "Welding"))
            assemblyObj.CostingPartDetails.TotalWeldingCostComponentForOverhead = checkForNull(getOverheadAndProfitTotalCostForAssembly(componentArray, 'Overhead', 'Welding'))
            assemblyObj.CostingPartDetails.TotalWeldingCostComponentForProfit = checkForNull(getOverheadAndProfitTotalCostForAssembly(componentArray, 'Profit', 'Welding'))

            assemblyObj.CostingPartDetails.TotalProcessCostSubAssembly = checkForNull(setProcessCostForAssembly(subAssemblyArray))
            assemblyObj.CostingPartDetails.TotalProcessCostSubAssemblyForOverhead = checkForNull(setOverheadAndProfitCostForAssembly(subAssemblyArray, 'Overhead', 'Process'))
            assemblyObj.CostingPartDetails.TotalProcessCostSubAssemblyForProfit = checkForNull(setOverheadAndProfitCostForAssembly(subAssemblyArray, 'Profit', 'Process'))

            assemblyObj.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssembly = checkForNull(setProcessCostForAssembly(subAssemblyArray, RMCCTabData[0]?.TechnologyId, "CCForOtherTechnology"))
            assemblyObj.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssemblyForOverhead = checkForNull(setOverheadAndProfitCostForAssembly(subAssemblyArray, 'Overhead', 'CCForOtherTechnology'))
            assemblyObj.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssemblyForProfit = checkForNull(setOverheadAndProfitCostForAssembly(subAssemblyArray, 'Profit', 'CCForOtherTechnology'))

            assemblyObj.CostingPartDetails.TotalProcessCostComponent = checkForNull(getProcessTotalCostForAssembly(componentArray))
            assemblyObj.CostingPartDetails.TotalProcessCostComponentForOverhead = checkForNull(getOverheadAndProfitTotalCostForAssembly(componentArray, 'Overhead', 'Process'))
            assemblyObj.CostingPartDetails.TotalProcessCostComponentForProfit = checkForNull(getOverheadAndProfitTotalCostForAssembly(componentArray, 'Profit', 'Process'))
            assemblyObj.CostingPartDetails.TotalCCForOtherTechnologyCostComponent = checkForNull(getProcessTotalCostForAssembly(componentArray, assemblyObj?.TechnologyId, "CCForOtherTechnology"))
            assemblyObj.CostingPartDetails.TotalCCForOtherTechnologyCostComponentForOverhead = checkForNull(getOverheadAndProfitTotalCostForAssembly(componentArray, 'Overhead', 'CCForOtherTechnology'))
            assemblyObj.CostingPartDetails.TotalCCForOtherTechnologyCostComponentForProfit = checkForNull(getOverheadAndProfitTotalCostForAssembly(componentArray, 'Profit', 'CCForOtherTechnology'))

          }
          if (isOperation) {
            assemblyObj.CostingPartDetails.CostingOperationCostResponse = params.BOMLevel === LEVEL0 ? gridData : assemblyObj?.CostingPartDetails?.CostingOperationCostResponse.length > 0 ? assemblyObj?.CostingPartDetails?.CostingOperationCostResponse : [];
            assemblyObj.CostingPartDetails.TotalOperationCostPerAssembly = params.BOMLevel === LEVEL0 ? GetOperationCostTotal(gridData) : checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostPerAssembly)
            assemblyObj.CostingPartDetails.TotalOperationCostPerAssemblyForOverhead = params.BOMLevel === LEVEL0 ? checkForNull(getOverheadAndProfitCostTotal(gridData, RMCCTabData[0]?.TechnologyId)?.overheadOperationCost) : checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostPerAssemblyForOverhead)
            assemblyObj.CostingPartDetails.TotalOperationCostPerAssemblyForProfit = params.BOMLevel === LEVEL0 ? checkForNull(getOverheadAndProfitCostTotal(gridData, RMCCTabData[0]?.TechnologyId)?.profitOperationCost) : checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostPerAssemblyForProfit)

            assemblyObj.CostingPartDetails.CostingWeldingCostResponse = params.BOMLevel === LEVEL0 ? gridData : assemblyObj?.CostingPartDetails?.CostingOperationCostResponse.length > 0 ? assemblyObj?.CostingPartDetails?.CostingOperationCostResponse : [];
            assemblyObj.CostingPartDetails.TotalWeldingCostPerAssembly = params.BOMLevel === LEVEL0 ? GetOperationCostTotal(gridData, "Welding") : checkForNull(assemblyObj?.CostingPartDetails?.TotalWeldingCostPerAssembly)
            assemblyObj.CostingPartDetails.TotalWeldingCostPerAssemblyForOverhead = params.BOMLevel === LEVEL0 ? checkForNull(getOverheadAndProfitCostTotal(gridData, RMCCTabData[0]?.TechnologyId)?.overheadWeldingCost) : checkForNull(assemblyObj?.CostingPartDetails?.TotalWeldingCostPerAssemblyForOverhead)
            assemblyObj.CostingPartDetails.TotalWeldingCostPerAssemblyForProfit = params.BOMLevel === LEVEL0 ? checkForNull(getOverheadAndProfitCostTotal(gridData, RMCCTabData[0]?.TechnologyId)?.profitWeldingCost) : checkForNull(assemblyObj?.CostingPartDetails?.TotalWeldingCostPerAssemblyForProfit)
          } else {
            assemblyObj.CostingPartDetails.CostingProcessCostResponse = params.BOMLevel === LEVEL0 ? gridData : assemblyObj?.CostingPartDetails?.CostingProcessCostResponse.length > 0 ? assemblyObj?.CostingPartDetails?.CostingProcessCostResponse : [];
            assemblyObj.CostingPartDetails.TotalProcessCostPerAssembly = params.BOMLevel === LEVEL0 ? GetProcessCostTotal(gridData) : checkForNull(assemblyObj?.CostingPartDetails?.TotalProcessCostPerAssembly)
            assemblyObj.CostingPartDetails.TotalProcessCostPerAssemblyForOverhead = params.BOMLevel === LEVEL0 ? checkForNull(getOverheadAndProfitCostTotal(gridData, RMCCTabData[0]?.TechnologyId)?.overheadProcessCost) : checkForNull(assemblyObj?.CostingPartDetails?.TotalProcessCostPerAssemblyForOverhead)
            assemblyObj.CostingPartDetails.TotalProcessCostPerAssemblyForProfit = params.BOMLevel === LEVEL0 ? checkForNull(getOverheadAndProfitCostTotal(gridData, RMCCTabData[0]?.TechnologyId)?.profitProcessCost) : checkForNull(assemblyObj?.CostingPartDetails?.TotalProcessCostPerAssemblyForProfit)
            
            assemblyObj.CostingPartDetails.TotalCCForOtherTechnologyCostPerAssembly = params.BOMLevel === LEVEL0 ? GetProcessCostTotal(gridData, RMCCTabData[0]?.TechnologyId, "CCForOtherTechnology") : checkForNull(assemblyObj?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssembly)
            assemblyObj.CostingPartDetails.TotalCCForOtherTechnologyCostPerAssemblyForOverhead = params.BOMLevel === LEVEL0 ? checkForNull(getOverheadAndProfitCostTotal(gridData, RMCCTabData[0]?.TechnologyId)?.ccForOtherTechnologyCostForOverhead) : checkForNull(assemblyObj?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssemblyForOverhead)
            assemblyObj.CostingPartDetails.TotalCCForOtherTechnologyCostPerAssemblyForProfit = params.BOMLevel === LEVEL0 ? checkForNull(getOverheadAndProfitCostTotal(gridData, RMCCTabData[0]?.TechnologyId)?.ccForOtherTechnologyCostForProfit) : checkForNull(assemblyObj?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssemblyForProfit)
          }




          assemblyObj.CostingPartDetails.TotalConversionCostComponent = checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.TotalProcessCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.TotalOtherOperationCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.TotalWeldingCostComponent)
          assemblyObj.CostingPartDetails.TotalConversionCostPerAssembly = checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalWeldingCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalProcessCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalOtherOperationCostPerAssembly)
          assemblyObj.CostingPartDetails.TotalConversionCostPerSubAssembly = checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostSubAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalWeldingCostSubAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalProcessCostSubAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalOtherOperationCostPerSubAssembly)

          assemblyObj.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.TotalConversionCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.TotalConversionCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalConversionCostPerSubAssembly)
            + checkForNull(assemblyObj?.CostingPartDetails?.IndirectLaborCost)
            + checkForNull(assemblyObj?.CostingPartDetails?.StaffCost)
            + checkForNull(assemblyObj?.CostingPartDetails?.NetLabourCost)
          //   if (isOperation) {
          //     assemblyObj.CostingPartDetails.TotalOperationCostSubAssembly = checkForNull(setOperationCostForAssembly(subAssemblyArray))
          //     assemblyObj.CostingPartDetails.TotalOperationCostComponent = checkForNull(getCCTotalCostForAssembly(componentArray))
          //   } else {
          //     assemblyObj.CostingPartDetails.TotalProcessCostSubAssembly = checkForNull(setProcessCostForAssembly(subAssemblyArray))
          //     assemblyObj.CostingPartDetails.TotalProcessCostComponent = checkForNull(getCCTotalCostForAssembly(componentArray))
          //   }

          // if (isOperation) {
          //   assemblyObj.CostingPartDetails.TotalOperationCostPerAssembly = params.BOMLevel === LEVEL0 ? GetOperationCostTotal(gridData) : checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostPerAssembly)
          //   assemblyObj.CostingPartDetails.CostingOperationCostResponse = params.BOMLevel === LEVEL0 ? gridData : assemblyObj?.CostingPartDetails?.CostingOperationCostResponse.length > 0 ? assemblyObj?.CostingPartDetails?.CostingOperationCostResponse : [];
          // } else {
          //   assemblyObj.CostingPartDetails.TotalProcessCostPerAssembly = params.BOMLevel === LEVEL0 ? GetProcessCostTotal(gridData) : checkForNull(assemblyObj?.CostingPartDetails?.TotalProcessCostPerAssembly)
          //   assemblyObj.CostingPartDetails.CostingProcessCostResponse = params.BOMLevel === LEVEL0 ? gridData : assemblyObj?.CostingPartDetails?.CostingProcessCostResponse.length > 0 ? assemblyObj?.CostingPartDetails?.CostingProcessCostResponse : [];
          // }


          // assemblyObj.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostComponent) +
          //   checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostSubAssembly) +
          //   checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostPerAssembly) +
          //   checkForNull(assemblyObj?.CostingPartDetails?.TotalProcessCostComponent) +
          //   checkForNull(assemblyObj?.CostingPartDetails?.TotalProcessCostSubAssembly) +
          //   checkForNull(assemblyObj?.CostingPartDetails?.TotalProcessCostPerAssembly) +
          //   checkForNull(assemblyObj?.CostingPartDetails?.IndirectLaborCost) +
          //   checkForNull(assemblyObj?.CostingPartDetails?.StaffCost) +
          //   checkForNull(assemblyObj?.CostingPartDetails?.NetLabourCost)

          assemblyObj.CostingPartDetails.NetTotalRMBOPCC = checkForNull(assemblyObj?.CostingPartDetails?.TotalRawMaterialsCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalConversionCostWithQuantity)
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
          newItem.CostingPartDetails.TotalOperationCostSubAssemblyForOverhead = checkForNull(obj?.CostingPartDetails?.TotalOperationCostSubAssemblyForOverhead)
          newItem.CostingPartDetails.TotalOperationCostSubAssemblyForProfit = checkForNull(obj?.CostingPartDetails?.TotalOperationCostSubAssemblyForProfit)

          newItem.CostingPartDetails.TotalWeldingCostSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalWeldingCostSubAssembly)
          newItem.CostingPartDetails.TotalWeldingCostSubAssemblyForOverhead = checkForNull(obj?.CostingPartDetails?.TotalWeldingCostSubAssemblyForOverhead)
          newItem.CostingPartDetails.TotalWeldingCostSubAssemblyForProfit = checkForNull(obj?.CostingPartDetails?.TotalWeldingCostSubAssemblyForProfit)

          newItem.CostingPartDetails.TotalOperationCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TotalOperationCostPerAssembly)
          newItem.CostingPartDetails.TotalOperationCostPerAssemblyForOverhead = checkForNull(obj?.CostingPartDetails?.TotalOperationCostPerAssemblyForOverhead)
          newItem.CostingPartDetails.TotalOperationCostPerAssemblyForProfit = checkForNull(obj?.CostingPartDetails?.TotalOperationCostPerAssemblyForProfit)

          newItem.CostingPartDetails.TotalWeldingCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TotalWeldingCostPerAssembly)
          newItem.CostingPartDetails.TotalWeldingCostPerAssemblyForOverhead = checkForNull(obj?.CostingPartDetails?.TotalWeldingCostPerAssemblyForOverhead)
          newItem.CostingPartDetails.TotalWeldingCostPerAssemblyForProfit = checkForNull(obj?.CostingPartDetails?.TotalWeldingCostPerAssemblyForProfit)

          newItem.CostingPartDetails.CostingOperationCostResponse = obj?.CostingPartDetails?.CostingOperationCostResponse
          newItem.CostingPartDetails.TotalOperationCostComponent = checkForNull(obj?.CostingPartDetails?.TotalOperationCostComponent)
          newItem.CostingPartDetails.TotalOperationCostComponentForOverhead = checkForNull(obj?.CostingPartDetails?.TotalOperationCostComponentForOverhead)
          newItem.CostingPartDetails.TotalOperationCostComponentForProfit = checkForNull(obj?.CostingPartDetails?.TotalOperationCostComponentForProfit)

          newItem.CostingPartDetails.CostingWeldingCostResponse = obj?.CostingPartDetails?.CostingWeldingCostResponse
          newItem.CostingPartDetails.TotalWeldingCostComponent = checkForNull(obj?.CostingPartDetails?.TotalWeldingCostComponent)
          newItem.CostingPartDetails.TotalWeldingCostComponentForOverhead = checkForNull(obj?.CostingPartDetails?.TotalWeldingCostComponentForOverhead)
          newItem.CostingPartDetails.TotalWeldingCostComponentForProfit = checkForNull(obj?.CostingPartDetails?.TotalWeldingCostComponentForProfit)

          newItem.CostingPartDetails.TotalProcessCostSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalProcessCostSubAssembly)
          newItem.CostingPartDetails.TotalProcessCostSubAssemblyForOverhead = checkForNull(obj?.CostingPartDetails?.TotalProcessCostSubAssemblyForOverhead)
          newItem.CostingPartDetails.TotalProcessCostSubAssemblyForProfit = checkForNull(obj?.CostingPartDetails?.TotalProcessCostSubAssemblyForProfit)

          newItem.CostingPartDetails.TotalProcessCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TotalProcessCostPerAssembly)
          newItem.CostingPartDetails.TotalProcessCostPerAssemblyForOverhead = checkForNull(obj?.CostingPartDetails?.TotalProcessCostPerAssemblyForOverhead)
          newItem.CostingPartDetails.TotalProcessCostPerAssemblyForProfit = checkForNull(obj?.CostingPartDetails?.TotalProcessCostPerAssemblyForProfit)

          newItem.CostingPartDetails.CostingProcessCostResponse = obj?.CostingPartDetails?.CostingProcessCostResponse
          newItem.CostingPartDetails.TotalProcessCostComponent = checkForNull(obj?.CostingPartDetails?.TotalProcessCostComponent)
          newItem.CostingPartDetails.TotalProcessCostComponentForOverhead = checkForNull(obj?.CostingPartDetails?.TotalProcessCostComponentForOverhead)
          newItem.CostingPartDetails.TotalProcessCostComponentForProfit = checkForNull(obj?.CostingPartDetails?.TotalProcessCostComponentForProfit)

          newItem.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostSubAssembly)
          newItem.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssemblyForOverhead = checkForNull(obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostSubAssemblyForOverhead)
          newItem.CostingPartDetails.TotalCCForOtherTechnologyCostSubAssemblyForProfit = checkForNull(obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostSubAssemblyForProfit)

          newItem.CostingPartDetails.TotalCCForOtherTechnologyCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssembly)
          newItem.CostingPartDetails.TotalCCForOtherTechnologyCostPerAssemblyForOverhead = checkForNull(obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssemblyForOverhead)
          newItem.CostingPartDetails.TotalCCForOtherTechnologyCostPerAssemblyForProfit = checkForNull(obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostPerAssemblyForProfit)

          newItem.CostingPartDetails.TotalCCForOtherTechnologyCostComponent = checkForNull(obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostComponent)
          newItem.CostingPartDetails.TotalCCForOtherTechnologyCostComponentForOverhead = checkForNull(obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostComponentForOverhead)
          newItem.CostingPartDetails.TotalCCForOtherTechnologyCostComponentForProfit = checkForNull(obj?.CostingPartDetails?.TotalCCForOtherTechnologyCostComponentForProfit)

          newItem.CostingPartDetails.NetConversionCost = checkForNull(obj?.CostingPartDetails?.NetConversionCost)

          newItem.CostingPartDetails.TotalConversionCostPerAssembly = obj?.CostingPartDetails?.TotalConversionCostPerAssembly
          newItem.CostingPartDetails.TotalConversionCostPerSubAssembly = obj?.CostingPartDetails?.TotalConversionCostPerSubAssembly
          newItem.CostingPartDetails.TotalConversionCostComponent = obj?.CostingPartDetails?.TotalConversionCostComponent

          newItem.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalConversionCostWithQuantity)
          newItem.CostingPartDetails.NetTotalRMBOPCC = checkForNull(obj?.CostingPartDetails?.NetTotalRMBOPCC)
          newItem.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity)
          newItem.CostingPartDetails.IsRMCutOffApplicable = obj?.CostingPartDetails?.IsRMCutOffApplicable
          newItem.CostingPartDetails.TotalOtherOperationCostComponent = obj?.CostingPartDetails?.TotalOtherOperationCostComponent
          newItem.CostingPartDetails.TotalOtherOperationCostPerSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalOtherOperationCostPerSubAssembly)
          newItem.CostingPartDetails.TotalOtherOperationCostPerAssembly = obj?.CostingPartDetails?.TotalOtherOperationCostPerAssembly
          newItem.CostingPartDetails.TotalOtherProcessCostPerAssembly = obj?.CostingPartDetails?.TotalOtherProcessCostPerAssembly
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
  const isAccordionOpen = ComponentItemData && Object.keys(ComponentItemData)?.length > 0 && ComponentItemData?.IsOpen;
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
                    <Table className="table cr-brdr-main mb-0" size="sm">
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
                                    setAssemblyOperationCost={setAssemblyOperationCost}
                                    setAssemblyLabourCost={setAssemblyLabourCost}
                                    subAssembId={selectedCostingDetail.SubAssemblyCostingId ? selectedCostingDetail.SubAssemblyCostingId : costData.CostingId}
                                    setBOPCostWithAsssembly={setBOPCostWithAsssembly}
                                    setAssemblyProcessCost={setAssemblyProcessCost}
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
                      disabled={saveDisable || Object.keys(ComponentItemData).length === 0 || (DayTime(CostingEffectiveDate).isValid() === false || !checkIsDataChange) ? true : false}
                    >
                      <div className={'save-icon'}></div>
                      {'Save'}
                    </button>
                  </div>
                }
              </form >
              {!isAccordionOpen && costData?.IsAssemblyPart !== "Assembly" && !CostingViewMode && <WarningMessage dClass={"col-md-12 pr-0 justify-content-end"} message={'Please open the accordion to enter costing data.'} />}
            </div >
          </Col >
        </Row >
      </div >

    </>
  );
};

export default TabRMCC;
//export default React.memo(TabRMCC);
