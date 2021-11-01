import React, { useEffect, useContext, } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import PartCompoment from '../CostingHeadCosts/Part'
import {
  getRMCCTabData, setRMCCData, saveComponentCostingRMCCTab, setComponentItemData,
  saveDiscountOtherCostTab, setComponentDiscountOtherItemData, CloseOpenAccordion
} from '../../actions/Costing';
import { costingInfoContext, NetPOPriceContext } from '../CostingDetailStepTwo';
import { checkForNull, loggedInUserId } from '../../../../helper';
import AssemblyPart from '../CostingHeadCosts/SubAssembly';
import { LEVEL0, LEVEL1, } from '../../../../config/constants';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { ViewCostingContext } from '../CostingDetails';
import moment from 'moment';

function TabRMCC(props) {

  const { handleSubmit } = useForm()

  const dispatch = useDispatch()

  const { RMCCTabData, ComponentItemData, ComponentItemDiscountData, ErrorObjRMCC, CostingEffectiveDate } = useSelector(state => state.costing)

  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const netPOPrice = useContext(NetPOPriceContext);

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
      }
      dispatch(getRMCCTabData(data, true, (res) => { }))
    }
  }, [costData])

  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    // CostingViewMode CONDITION IS USED TO AVOID CALCULATION IN VIEWMODE
    if (CostingViewMode === false) {
      let TopHeaderValues = RMCCTabData && RMCCTabData.length > 0 && RMCCTabData[0].CostingPartDetails !== undefined ? RMCCTabData[0].CostingPartDetails : null;

      let topHeaderData = {};

      if (costData.IsAssemblyPart) {
        topHeaderData = {
          NetRawMaterialsCost: TopHeaderValues?.TotalRawMaterialsCostWithQuantity ? TopHeaderValues.TotalRawMaterialsCostWithQuantity : 0,
          NetBoughtOutPartCost: TopHeaderValues?.TotalBoughtOutPartCostWithQuantity ? TopHeaderValues.TotalBoughtOutPartCostWithQuantity : 0,
          NetConversionCost: TopHeaderValues?.TotalConversionCostWithQuantity ? TopHeaderValues.TotalConversionCostWithQuantity + TopHeaderValues.TotalOperationCostPerAssembly : 0,
          NetToolsCost: TopHeaderValues?.TotalToolCost ? TopHeaderValues.TotalToolCost : 0,
          NetTotalRMBOPCC: TopHeaderValues?.TotalCalculatedRMBOPCCCostWithQuantity ? TopHeaderValues.TotalRawMaterialsCostWithQuantity + TopHeaderValues.TotalBoughtOutPartCostWithQuantity + TopHeaderValues.TotalConversionCostWithQuantity + TopHeaderValues.TotalOperationCostPerAssembly : 0,
          OtherOperationCost: TopHeaderValues?.CostingConversionCost?.OtherOperationCostTotal ? TopHeaderValues.CostingConversionCost.OtherOperationCostTotal : 0,
          ProcessCostTotal: TopHeaderValues?.CostingConversionCost?.ProcessCostTotal ? TopHeaderValues.CostingConversionCost.ProcessCostTotal : 0,
          OperationCostTotal: TopHeaderValues?.CostingConversionCost?.OperationCostTotal ? TopHeaderValues.CostingConversionCost.OperationCostTotal : 0,
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
        }
      }
      props.setHeaderCost(topHeaderData)
    }
  }, [RMCCTabData]);

  /**
  * @method getRMTotalCostForAssembly
  * @description GET RM TOTAL COST FOR ASSEMBLY
  */
  const getRMTotalCostForAssembly = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if ((el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) || (el.IsAssemblyPart)) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el.CostingPartDetails.TotalRawMaterialsCost !== null ? el.CostingPartDetails.TotalRawMaterialsCost : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method getRMTotalCostForAssemblySkipChildren
  * @description GET RM TOTAL COST FOR ASSEMBLY SKIP CHILDREN
  */
  const getRMTotalCostForAssemblySkipChildren = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if ((el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) || (el.IsAssemblyPart)) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        // return accummlator + 0;
        return accummlator + checkForNull(el?.CostingPartDetails?.TotalRawMaterialsCost ? el.CostingPartDetails.TotalRawMaterialsCost : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method getRMTotalCostForAssemblyWithQuantity
  * @description GET RM TOTAL COST FOR ASSEMBLY WITH QUANTITY
  */
  const getRMTotalCostForAssemblyWithQuantity = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if ((el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) || (el.IsAssemblyPart)) {
        return accummlator + (checkForNull(GridTotalCost) * el.CostingPartDetails.Quantity);
      } else {
        return accummlator + (checkForNull(el.CostingPartDetails.TotalRawMaterialsCost !== null ? el.CostingPartDetails.TotalRawMaterialsCost : 0) * el.CostingPartDetails.Quantity);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method getBOPTotalCostForAssembly
  * @description GET BOP TOTAL COST FOR ASSEMBLY
  */
  const getBOPTotalCostForAssembly = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if ((el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) || (el.IsAssemblyPart)) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el.CostingPartDetails.TotalBoughtOutPartCost !== null ? el.CostingPartDetails.TotalBoughtOutPartCost : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method getBOPTotalCostForAssemblyWithQuantity
  * @description GET BOP TOTAL COST FOR ASSEMBLY WITH QUANTITY
  */
  const getBOPTotalCostForAssemblyWithQuantity = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if ((el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) || (el.IsAssemblyPart)) {
        return accummlator + (checkForNull(GridTotalCost) * el.CostingPartDetails.Quantity);
      } else {
        return accummlator + (checkForNull(el.CostingPartDetails.TotalBoughtOutPartCost !== null ? el.CostingPartDetails.TotalBoughtOutPartCost : 0) * el.CostingPartDetails.Quantity);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method getCCTotalCostForAssemblyWithQuantity
  * @description GET CC TOTAL COST FOR ASSEMBLY WITH QUANTITY
  */
  const getCCTotalCostForAssemblyWithQuantity = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if ((el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) || (el.IsAssemblyPart)) {
        return accummlator + (checkForNull(GridTotalCost) * el.CostingPartDetails.Quantity);
      } else {
        return accummlator + (checkForNull(el.CostingPartDetails.TotalProcessCost !== null ? el.CostingPartDetails.TotalProcessCost : 0) * el.CostingPartDetails.Quantity);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method getProcessTotalCost
  * @description GET PROCESS TOTAL COST
  */
  const getProcessTotalCost = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if ((el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) || (el.IsAssemblyPart)) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el.CostingPartDetails !== null && el.CostingPartDetails.TotalProcessCost !== undefined ? el.CostingPartDetails.TotalProcessCost : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
   * @method getOperationTotalCost
   * @description GET OPERATION TOTAL COST
   */
  const getOperationTotalCost = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if ((el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) || (el.IsAssemblyPart)) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el.CostingPartDetails !== null && el.CostingPartDetails.TotalOperationCost !== undefined ? el.CostingPartDetails.TotalOperationCost : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method getProcessTotalCostForAssembly
  * @description GET PROCESS TOTAL COST FOR ASSEMBLY
  */
  const getProcessTotalCostForAssembly = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if (el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el.CostingPartDetails.TotalProcessCost !== null ? el.CostingPartDetails.TotalProcessCost : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method getOperationTotalCostForAssembly
  * @description GET OPERATION TOTAL COST FOR ASSEMBLY
  */
  const getOperationTotalCostForAssembly = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if ((el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) || (el.IsAssemblyPart)) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el.CostingPartDetails.TotalOperationCostPerAssembly !== null ? el.CostingPartDetails.TotalOperationCostPerAssembly : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method getToolTotalCostForAssembly
  * @description GET TOOL TOTAL COST FOR ASSEMBLY
  */
  const getToolTotalCostForAssembly = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if ((el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) || (el.IsAssemblyPart)) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el.CostingPartDetails !== null && el.CostingPartDetails.CostingConversionCost && el.CostingPartDetails.CostingConversionCost.ToolsCostTotal !== undefined ? el.CostingPartDetails.CostingConversionCost.ToolsCostTotal : 0);
      }
    }, 0)
    return NetCost;
  }

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
        return accummlator + checkForNull(el.CostingPartDetails !== null && el.CostingPartDetails.CostingConversionCost && el.CostingPartDetails.CostingConversionCost.ToolsCostTotal !== undefined ? el.CostingPartDetails.CostingConversionCost.ToolsCostTotal : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method getCCTotalCostForAssembly
  * @description GET CC TOTAL COST FOR ASSEMBLY
  */
  const getCCTotalCostForAssembly = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if ((el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) || (el.IsAssemblyPart)) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el.CostingPartDetails.TotalConversionCost !== null ? el.CostingPartDetails.TotalConversionCost : 0);
      }
    }, 0)
    return NetCost;
  }


  /**
  * @method getTotalCostForAssembly
  * @description GET TOTAL COST FOR ASSEMBLY
  * @params flag:- Where to add Grid Total in assembly
  */
  const getTotalCostForAssembly = (arr, CostingPartDetails = {}, flag = '', GridTotalCost = 0, params = {}) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if ((el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) || (el.IsAssemblyPart)) {
        let total = 0;
        switch (flag) {
          case 'RM':
            total = accummlator +
              GridTotalCost +
              checkForNull(el.CostingPartDetails.TotalBoughtOutPartCost !== null ? el.CostingPartDetails.TotalBoughtOutPartCost : 0) +
              checkForNull(el.CostingPartDetails.TotalConversionCost !== null ? el.CostingPartDetails.TotalConversionCost : 0) +
              checkForNull(CostingPartDetails.TotalOperationCostPerAssembly !== null ? el.CostingPartDetails.TotalOperationCostPerAssembly : 0) +
              checkForNull(CostingPartDetails.TotalToolCostPerAssembly !== null ? el.CostingPartDetails.TotalToolCostPerAssembly : 0)
            break;

          case 'BOP':
            total = accummlator +
              checkForNull(el.CostingPartDetails.TotalRawMaterialsCost !== null ? el.CostingPartDetails.TotalRawMaterialsCost : 0) +
              GridTotalCost +
              checkForNull(el.CostingPartDetails.TotalConversionCost !== null ? el.CostingPartDetails.TotalConversionCost : 0) +
              checkForNull(CostingPartDetails.TotalOperationCostPerAssembly !== null ? el.CostingPartDetails.TotalOperationCostPerAssembly : 0) +
              checkForNull(CostingPartDetails.TotalToolCostPerAssembly !== null ? el.CostingPartDetails.TotalToolCostPerAssembly : 0)
            break;

          case 'CC':
            total = accummlator +
              checkForNull(el.CostingPartDetails.TotalRawMaterialsCost !== null ? el.CostingPartDetails.TotalRawMaterialsCost : 0) +
              checkForNull(el.CostingPartDetails.TotalBoughtOutPartCost !== null ? el.CostingPartDetails.TotalBoughtOutPartCost : 0) +
              GridTotalCost +
              checkForNull(CostingPartDetails.TotalOperationCostPerAssembly !== null ? el.CostingPartDetails.TotalOperationCostPerAssembly : 0) +
              checkForNull(CostingPartDetails.TotalToolCostPerAssembly !== null ? el.CostingPartDetails.TotalToolCostPerAssembly : 0)
            break;

          case 'ALL':
            total = accummlator +
              checkForNull(el.CostingPartDetails.TotalRawMaterialsCost !== null ? el.CostingPartDetails.TotalRawMaterialsCost : 0) +
              checkForNull(el.CostingPartDetails.TotalBoughtOutPartCost !== null ? el.CostingPartDetails.TotalBoughtOutPartCost : 0) +
              checkForNull(el.CostingPartDetails.TotalConversionCost !== null ? el.CostingPartDetails.TotalConversionCost : 0) +
              checkForNull(CostingPartDetails.TotalOperationCostPerAssembly !== null ? el.CostingPartDetails.TotalOperationCostPerAssembly : 0) +
              checkForNull(CostingPartDetails.TotalToolCostPerAssembly !== null ? el.CostingPartDetails.TotalToolCostPerAssembly : 0)
            break;

          default:
            break;
        }
        return total;
      } else {
        return accummlator + checkForNull(el.CostingPartDetails.TotalCalculatedRMBOPCCCost !== null ? el.CostingPartDetails.TotalCalculatedRMBOPCCCost : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method setRMCost
  * @description SET RM COST
  */
  const setRMCost = (rmGrid, params) => {
    let arr = setRMCostInDataList(rmGrid, params, RMCCTabData)
    dispatch(setRMCCData(arr, () => { }))
  }

  const setRMCostInDataList = (rmGrid, params, arr) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map((i) => {

        if (i.IsAssemblyPart === true) {

          i.CostingPartDetails.TotalRawMaterialsCost = getRMTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(netRMCost(rmGrid)), params);
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = getTotalCostForAssembly(i.CostingChildPartDetails, i.CostingPartDetails, 'RM', checkForNull(netRMCost(rmGrid)), params);

          //BELOW KEYS FOR COST WITH QUANTITY
          i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = getRMCostWithQuantity(i.CostingChildPartDetails, checkForNull(netRMCost(rmGrid)), params);
          i.CostingPartDetails.TotalRawMaterialsCostWithQuantity = getRMTotalCostForAssemblyWithQuantity(i.CostingChildPartDetails, checkForNull(netRMCost(rmGrid)), params);

          setRMCostInDataList(rmGrid, params, i.CostingChildPartDetails) //TODO :OPTIMAZATION

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = checkForNull(netRMCost(rmGrid)) + checkForNull(i.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(i.CostingPartDetails.TotalConversionCost)

          i.CostingPartDetails.CostingRawMaterialsCost = rmGrid;
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
          i.CostingPartDetails.TotalRawMaterialsCost = netRMCost(rmGrid);
          i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost * i.CostingPartDetails.Quantity;

          // MASTER BATCH FOR RM
          // i.CostingPartDetails.IsApplyMasterBatch = MasterBatchObj.IsApplyMasterBatch;
          // i.CostingPartDetails.MasterBatchRMName = MasterBatchObj.MasterBatchRMName;
          // i.CostingPartDetails.MasterBatchRMPrice = checkForNull(MasterBatchObj.MasterBatchRMPrice);
          // i.CostingPartDetails.MasterBatchPercentage = checkForNull(MasterBatchObj.MasterBatchPercentage);
          // i.CostingPartDetails.MasterBatchTotal = checkForNull(MasterBatchObj.MasterBatchTotal);

        } else {
          setRMCostInDataList(rmGrid, params, i.CostingChildPartDetails)
        }
        return i;
      });

    } catch (error) {

    }
    return tempArr;
  }

  /**
  * @method setRMMasterBatchCost
  * @description SET RM MASTER BATCH COST
  */
  const setRMMasterBatchCost = (rmGrid, MasterBatchObj, params) => {
    let arr = setRMBatchCostInDataList(rmGrid, MasterBatchObj, params, RMCCTabData)
    dispatch(setRMCCData(arr, () => { }))
  }

  const setRMBatchCostInDataList = (rmGrid, MasterBatchObj, params, arr) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map((i) => {

        if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          // let GrandTotalCost = checkForNull(netRMCost(rmGrid)) + checkForNull(i.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(i.CostingPartDetails.TotalConversionCost)

          // i.CostingPartDetails.CostingRawMaterialsCost = rmGrid;
          // i.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
          // i.CostingPartDetails.TotalRawMaterialsCost = netRMCost(rmGrid);
          // i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost * i.CostingPartDetails.Quantity;

          // MASTER BATCH FOR RM
          i.CostingPartDetails.MasterBatchRMId = MasterBatchObj.MasterBatchRMId;
          i.CostingPartDetails.IsApplyMasterBatch = MasterBatchObj.IsApplyMasterBatch;
          i.CostingPartDetails.MasterBatchRMName = MasterBatchObj.MasterBatchRMName;
          i.CostingPartDetails.MasterBatchRMPrice = checkForNull(MasterBatchObj.MasterBatchRMPrice);
          i.CostingPartDetails.MasterBatchPercentage = checkForNull(MasterBatchObj.MasterBatchPercentage);
          i.CostingPartDetails.MasterBatchTotal = checkForNull(MasterBatchObj.MasterBatchTotal);

        } else {
          setRMBatchCostInDataList(rmGrid, MasterBatchObj, params, i.CostingChildPartDetails)
        }
        return i;
      });

    } catch (error) {

    }
    return tempArr;
  }

  /**
  * @method getRMCostWithQuantity
  * @description GET RM TOTAL COST FOR ASSEMBLY
  */
  const getRMCostWithQuantity = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if ((el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) || (el.IsAssemblyPart)) {
        return accummlator + ((checkForNull(GridTotalCost) + checkForNull(el.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(el.CostingPartDetails.TotalConversionCost)) * el.CostingPartDetails.Quantity);
      } else {
        return accummlator + (checkForNull(el.CostingPartDetails.TotalCalculatedRMBOPCCCost !== null ? el.CostingPartDetails.TotalCalculatedRMBOPCCCost : 0) * el.CostingPartDetails.Quantity);
      }
    }, 0)
    return NetCost;
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
   * @description SET BOP COST
   */
  const setBOPCost = (bopGrid, params) => {
    let arr = setBOPCostInDataList(bopGrid, params, RMCCTabData)
    dispatch(setRMCCData(arr, () => { }))
  }

  const setBOPCostInDataList = (bopGrid, params, arr) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {
        if (i.IsAssemblyPart === true) {

          i.CostingPartDetails.TotalBoughtOutPartCost = getBOPTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(netBOPCost(bopGrid)), params);
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = getTotalCostForAssembly(i.CostingChildPartDetails, i.CostingPartDetails, 'BOP', checkForNull(netBOPCost(bopGrid)), params);

          // BELOW KEYS USED FOR BOP COST WITH QUANTITY
          i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = getBOPCostWithQuantity(i.CostingChildPartDetails, checkForNull(netBOPCost(bopGrid)), params);
          i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = getBOPTotalCostForAssemblyWithQuantity(i.CostingChildPartDetails, checkForNull(netBOPCost(bopGrid)), params);
          setBOPCostInDataList(bopGrid, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = checkForNull(i.CostingPartDetails.TotalRawMaterialsCost) + checkForNull(netBOPCost(bopGrid)) + checkForNull(i.CostingPartDetails.TotalConversionCost);

          i.CostingPartDetails.CostingBoughtOutPartCost = bopGrid;
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost + checkForNull(i.CostingPartDetails.BOPHandlingCharges);
          i.CostingPartDetails.TotalBoughtOutPartCost = netBOPCost(bopGrid) + checkForNull(i.CostingPartDetails.BOPHandlingCharges);
          i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost * i.CostingPartDetails.Quantity;

        } else {
          setBOPCostInDataList(bopGrid, params, i.CostingChildPartDetails)
        }
        return i;
      });

    } catch (error) {

    }
    return tempArr;
  }

  /**
   * @method setBOPHandlingCost
   * @description SET BOP COST
   */
  const setBOPHandlingCost = (bopGrid, BOPHandlingFields, params) => {
    let arr = setBOPHandlingCostInDataList(bopGrid, BOPHandlingFields, params, RMCCTabData)
    dispatch(setRMCCData(arr, () => { }))
  }

  const setBOPHandlingCostInDataList = (bopGrid, BOPHandlingFields, params, arr) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {
        if (i.IsAssemblyPart === true) {

          i.CostingPartDetails.TotalBoughtOutPartCost = getBOPTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(netBOPCost(bopGrid)), params) + checkForNull(BOPHandlingFields.BOPHandlingCharges);
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = getTotalCostForAssembly(i.CostingChildPartDetails, i.CostingPartDetails, 'BOP', checkForNull(netBOPCost(bopGrid)), params) + checkForNull(BOPHandlingFields.BOPHandlingCharges);

          // BELOW KEYS USED FOR BOP COST WITH QUANTITY
          i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = getBOPCostWithQuantity(i.CostingChildPartDetails, checkForNull(netBOPCost(bopGrid)), params);
          i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = getBOPTotalCostForAssemblyWithQuantity(i.CostingChildPartDetails, checkForNull(netBOPCost(bopGrid)), params);
          setBOPHandlingCostInDataList(bopGrid, BOPHandlingFields, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = checkForNull(i.CostingPartDetails.TotalRawMaterialsCost) + checkForNull(netBOPCost(bopGrid)) + checkForNull(i.CostingPartDetails.TotalConversionCost);

          i.CostingPartDetails.CostingBoughtOutPartCost = bopGrid;
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost + checkForNull(BOPHandlingFields.BOPHandlingCharges);
          i.CostingPartDetails.TotalBoughtOutPartCost = netBOPCost(bopGrid) + checkForNull(BOPHandlingFields.BOPHandlingCharges);
          i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost * i.CostingPartDetails.Quantity;

          i.CostingPartDetails.IsApplyBOPHandlingCharges = BOPHandlingFields.IsApplyBOPHandlingCharges;
          i.CostingPartDetails.BOPHandlingPercentage = checkForNull(BOPHandlingFields.BOPHandlingPercentage);
          i.CostingPartDetails.BOPHandlingCharges = checkForNull(BOPHandlingFields.BOPHandlingCharges);

        } else {
          setBOPHandlingCostInDataList(bopGrid, BOPHandlingFields, params, i.CostingChildPartDetails)
        }
        return i;
      });

    } catch (error) {

    }
    return tempArr;
  }

  /**
  * @method getBOPCostWithQuantity
  * @description GET TOTAL RMBOPCC COST THAT IS UPDATED BY BOP GRID
  */
  const getBOPCostWithQuantity = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if ((el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) || (el.IsAssemblyPart)) {
        return accummlator + ((checkForNull(GridTotalCost) + checkForNull(el.CostingPartDetails.TotalRawMaterialsCost) + checkForNull(el.CostingPartDetails.TotalConversionCost)) * el.CostingPartDetails.Quantity);
      } else {
        return accummlator + (checkForNull(el.CostingPartDetails.TotalCalculatedRMBOPCCCost !== null ? el.CostingPartDetails.TotalCalculatedRMBOPCCCost : 0) * el.CostingPartDetails.Quantity);
      }
    }, 0)
    return NetCost;
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
   * @description SET PROCESS COST
   */
  const setProcessCost = (conversionGrid, params) => {
    let arr = setProcessCostInDataList(conversionGrid, params, RMCCTabData)
    dispatch(setRMCCData(arr, () => { }))
  }

  const setProcessCostInDataList = (conversionGrid, params, arr) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {

        if (i.IsAssemblyPart === true) {

          i.CostingPartDetails.TotalConversionCost = getCCTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(conversionGrid.NetConversionCost), params);
          i.CostingPartDetails.TotalProcessCost = getProcessTotalCost(i.CostingChildPartDetails, checkForNull(conversionGrid.ProcessCostTotal), params);
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = getTotalCostForAssembly(i.CostingChildPartDetails, i.CostingPartDetails, 'CC', checkForNull(conversionGrid.NetConversionCost), params);

          // BELOW KEYS COST WITH QUANTITY
          i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = getCCCostWithQuantity(i.CostingChildPartDetails, checkForNull(conversionGrid.NetConversionCost), params);
          i.CostingPartDetails.TotalConversionCostWithQuantity = getCCTotalCostForAssemblyWithQuantity(i.CostingChildPartDetails, checkForNull(conversionGrid.NetConversionCost), params);

          setProcessCostInDataList(conversionGrid, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = checkForNull(i.CostingPartDetails.TotalRawMaterialsCost) +
            checkForNull(i.CostingPartDetails.TotalBoughtOutPartCost) +
            checkForNull(conversionGrid && conversionGrid.NetConversionCost !== null ? conversionGrid.NetConversionCost : 0);

          let data = conversionGrid && conversionGrid.CostingProcessCostResponse && conversionGrid.CostingProcessCostResponse.map(el => {
            return el;
          })

          i.CostingPartDetails.CostingConversionCost = { ...conversionGrid, CostingProcessCostResponse: data };
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
          i.CostingPartDetails.TotalConversionCost = conversionGrid.NetConversionCost !== null ? conversionGrid.NetConversionCost : 0;
          i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost * i.CostingPartDetails.Quantity;

        } else {
          setProcessCostInDataList(conversionGrid, params, i.CostingChildPartDetails)
        }
        return i;
      });

    } catch (error) {

    }
    return tempArr;
  }

  /**
  * @method getCCCostWithQuantity
  * @description GET TOTAL RMBOPCC COST THAT IS UPDATED BY PROCESS OR OPERATION  GRID
  */
  const getCCCostWithQuantity = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if (el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) {
        return accummlator + ((checkForNull(el.CostingPartDetails.TotalRawMaterialsCost) + checkForNull(el.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(GridTotalCost)) * el.CostingPartDetails.Quantity);
      } else {
        return accummlator + (checkForNull(el.CostingPartDetails.TotalCalculatedRMBOPCCCost !== null ? el.CostingPartDetails.TotalCalculatedRMBOPCCCost : 0) * el.CostingPartDetails.Quantity);
      }
    }, 0)
    return NetCost;
  }

  /**
   * @method setOperationCost
   * @description SET OPERATION COST
   */
  const setOperationCost = (operationGrid, params) => {
    let arr = setOperationCostInDataList(operationGrid, params, RMCCTabData)
    dispatch(setRMCCData(arr, () => { }))
  }

  const setOperationCostInDataList = (operationGrid, params, arr) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {

        if (i.IsAssemblyPart === true) {

          i.CostingPartDetails.TotalConversionCost = getCCTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(operationGrid.NetConversionCost), params);
          i.CostingPartDetails.TotalOperationCost = getOperationTotalCost(i.CostingChildPartDetails, checkForNull(operationGrid.OperationCostTotal), params);
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = getTotalCostForAssembly(i.CostingChildPartDetails, i.CostingPartDetails, 'CC', checkForNull(operationGrid.NetConversionCost), params);
          i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = getCCCostWithQuantity(i.CostingChildPartDetails, checkForNull(operationGrid.NetConversionCost), params);
          setOperationCostInDataList(operationGrid, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = checkForNull(i.TotalRawMaterialsCost) +
            checkForNull(i.TotalBoughtOutPartCost) +
            checkForNull(operationGrid && operationGrid.NetConversionCost !== null ? operationGrid.NetConversionCost : 0)

          let data = operationGrid && operationGrid.CostingOperationCostResponse && operationGrid.CostingOperationCostResponse.map(el => {
            return el;
          })

          i.GrandTotalCost = GrandTotalCost;
          i.CostingPartDetails.CostingConversionCost = { ...operationGrid, CostingOperationCostResponse: data };
          i.TotalConversionCost = operationGrid.NetConversionCost !== null ? operationGrid.NetConversionCost : 0;
          i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost * i.CostingPartDetails.Quantity;

        } else {
          setOperationCostInDataList(operationGrid, params, i.CostingChildPartDetails)
        }
        return i;
      });
    } catch (error) {

    }
    return tempArr;
  }

  const setOtherOperationCost = (otherOperationGrid, params) => {
    let arr = setOtherOperationCostInDataList(otherOperationGrid, params, RMCCTabData)
    dispatch(setRMCCData(arr, () => { }))
  }

  const setOtherOperationCostInDataList = (otherOperationGrid, params, arr) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {

        if (i.IsAssemblyPart === true) {

          i.CostingPartDetails.TotalConversionCost = getCCTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(otherOperationGrid.NetConversionCost), params);
          i.CostingPartDetails.TotalOperationCost = getOperationTotalCost(i.CostingChildPartDetails, checkForNull(otherOperationGrid.OperationCostTotal), params);
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = getTotalCostForAssembly(i.CostingChildPartDetails, i.CostingPartDetails, 'CC', checkForNull(otherOperationGrid.NetConversionCost), params);
          i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = getCCCostWithQuantity(i.CostingChildPartDetails, checkForNull(otherOperationGrid.NetConversionCost), params);
          setOtherOperationCostInDataList(otherOperationGrid, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = checkForNull(i.TotalRawMaterialsCost) +
            checkForNull(i.TotalBoughtOutPartCost) +
            checkForNull(otherOperationGrid && otherOperationGrid.NetConversionCost !== null ? otherOperationGrid.NetConversionCost : 0)

          let data = otherOperationGrid && otherOperationGrid.OtherOperationCostResponse && otherOperationGrid.OtherOperationCostResponse.map(el => {
            return el;
          })

          i.GrandTotalCost = GrandTotalCost;
          i.CostingPartDetails.CostingConversionCost = { ...otherOperationGrid, OtherOperationCostResponse: data };
          i.TotalConversionCost = otherOperationGrid.NetConversionCost !== null ? otherOperationGrid.NetConversionCost : 0;
          i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost * i.CostingPartDetails.Quantity;

        } else {
          setOtherOperationCostInDataList(otherOperationGrid, params, i.CostingChildPartDetails)
        }
        return i;
      });
    } catch (error) {

    }
    return tempArr;
  }

  /**
   * @method setToolCost
   * @description SET TOOL COST
   */
  const setToolCost = (toolGrid, params) => {
    let arr = setToolCostInDataList(toolGrid, params, RMCCTabData)
    dispatch(setRMCCData(arr, () => { }))
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
    let arr = setAssembly(BOMLevel, PartNumber, Children, RMCCTabData)
    dispatch(setRMCCData(arr, () => { }))
  }

  /**
  * @method setAssembly
  * @description SET PART DETAILS
  */
  const setAssembly = (BOMLevel, PartNumber, Children, RMCCTabData) => {
    let tempArr = [];
    try {

      tempArr = RMCCTabData && RMCCTabData.map(i => {

        const { CostingChildPartDetails, CostingPartDetails } = Children;
        const params = { BOMLevel: BOMLevel, PartNumber: PartNumber };

        if (i.IsAssemblyPart === true && i.PartNumber === PartNumber && i.BOMLevel === BOMLevel) {

          i.CostingChildPartDetails = BOMLevel !== LEVEL0 ? ChangeBOMLeveL(Children.CostingChildPartDetails, BOMLevel) : i.CostingChildPartDetails;
          i.CostingPartDetails = Children.CostingPartDetails;

          i.CostingPartDetails.TotalRawMaterialsCost = getRMTotalCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.TotalRawMaterialsCost, params);
          i.CostingPartDetails.TotalBoughtOutPartCost = getBOPTotalCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.TotalBoughtOutPartCost, params);
          i.CostingPartDetails.TotalProcessCost = getProcessTotalCost(CostingChildPartDetails, Children.CostingPartDetails.TotalProcessCost, params);
          i.CostingPartDetails.TotalOperationCost = getOperationTotalCost(CostingChildPartDetails, Children.CostingPartDetails.TotalOperationCost, params);
          i.CostingPartDetails.TotalToolCost = getToolTotalCost(CostingChildPartDetails, Children.CostingPartDetails.TotalToolCost, params);

          // i.CostingPartDetails.TotalConversionCost = getProcessTotalCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.TotalProcessCost, params) +
          //   getOperationTotalCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.TotalOperationCost, params) +
          //   GetOperationCostTotal(CostingPartDetails.CostingOperationCostResponse) +
          //   GetToolCostTotal(CostingPartDetails.CostingToolCostResponse);

          i.CostingPartDetails.TotalConversionCost = getProcessTotalCost(CostingChildPartDetails, CostingPartDetails.TotalProcessCost, params) +
            getOperationTotalCost(CostingChildPartDetails, CostingPartDetails.TotalOperationCost, params) +
            getOperationTotalCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.TotalOperationCostPerAssembly, params) +
            getToolTotalCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.TotalToolCostPerAssembly, params);
          // checkForNull(i.CostingPartDetails.TotalOperationCostPerAssembly) +
          // checkForNull(i.CostingPartDetails.TotalToolCostPerAssembly);

          // i.CostingPartDetails.TotalCalculatedRMBOPCCCost = (getTotalCostForAssembly(CostingChildPartDetails, CostingPartDetails, 'ALL', 0, params)) +
          //   checkForNull(CostingPartDetails.TotalOperationCostPerAssembly);

          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = getRMTotalCostForAssembly(CostingChildPartDetails, CostingPartDetails.TotalRawMaterialsCost, params) +
            getBOPTotalCostForAssembly(CostingChildPartDetails, CostingPartDetails.TotalBoughtOutPartCost, params) +
            getProcessTotalCost(CostingChildPartDetails, CostingPartDetails.TotalProcessCost, params) +
            getOperationTotalCost(CostingChildPartDetails, CostingPartDetails.TotalOperationCost, params) +
            getOperationTotalCostForAssembly(CostingChildPartDetails, CostingPartDetails.TotalOperationCostPerAssembly, params) +
            getToolTotalCostForAssembly(CostingChildPartDetails, CostingPartDetails.TotalToolCostPerAssembly, params);

          i.IsAssemblyPart = true;
          i.IsOpen = !i.IsOpen;
          i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = getRMBOPCCTotalCostWithQuantity(CostingChildPartDetails) * i.CostingPartDetails.Quantity;
          i.CostingPartDetails.TotalRawMaterialsCostWithQuantity = getRMTotalCostForAssemblyWithQuantity(CostingChildPartDetails, 0, params);
          i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = getBOPTotalCostForAssemblyWithQuantity(CostingChildPartDetails, 0, params);
          i.CostingPartDetails.TotalConversionCostWithQuantity = getCCTotalCostForAssemblyWithQuantity(CostingChildPartDetails, 0, params);

          setAssembly(BOMLevel, PartNumber, Children, i.CostingChildPartDetails)
        } else {
          i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = i.CostingPartDetails.TotalCalculatedRMBOPCCCost * i.CostingPartDetails.Quantity;
          setAssembly(BOMLevel, PartNumber, Children, i.CostingChildPartDetails)
        }
        return i;
      });

    } catch (error) {

    }
    return tempArr;

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
  * @method getRMBOPCCTotalCostWithQuantity
  * @description GET RMBOPCC TOTAL COST WITH QUANTITY
  */
  const getRMBOPCCTotalCostWithQuantity = (arr) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      return accummlator + (checkForNull(el.CostingPartDetails.TotalCalculatedRMBOPCCCost !== null ? el.CostingPartDetails.TotalCalculatedRMBOPCCCost : 0) * el.CostingPartDetails.Quantity);
    }, 0)
    return NetCost;
  }

  /**
  * @method setPartDetails
  * @description SET PART DETAILS
  */
  const setPartDetails = (BOMLevel, PartNumber, Data) => {
    let arr = formatData(BOMLevel, PartNumber, Data, RMCCTabData)
    dispatch(setRMCCData(arr, () => { }))
  }

  /**
  * @method formatData
  * @description FORMATE DATA FOR SET PART DETAILS
  */
  const formatData = (BOMLevel, PartNumber, Data, RMCCTabData) => {
    let tempArr = [];
    try {
      tempArr = RMCCTabData && RMCCTabData.map(i => {
        const params = { BOMLevel: BOMLevel, PartNumber: PartNumber };
        if (i.IsAssemblyPart === true) {
          // i.CostingPartDetails.TotalConversionCost = checkForNull(i.CostingPartDetails.TotalConversionCost) +
          // getCCTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(Data.CostingConversionCost.NetConversionCost), params);

          i.CostingPartDetails.TotalRawMaterialsCost = getRMTotalCostForAssemblySkipChildren(i.CostingChildPartDetails, Data.TotalRawMaterialsCost, params);

          i.CostingPartDetails.TotalConversionCost = checkForNull(i.CostingPartDetails.TotalOperationCostPerAssembly) +
            checkForNull(i.CostingPartDetails.TotalToolCostPerAssembly) +
            getProcessTotalCost(i.CostingChildPartDetails, Data.TotalProcessCost, params) +
            getOperationTotalCost(i.CostingChildPartDetails, Data.TotalOperationCost, params);

          //getOperationTotalCostForAssembly(i.CostingChildPartDetails, Data.TotalOperationCostPerAssembly, params) +
          //getToolTotalCostForAssembly(i.CostingChildPartDetails, Data.TotalToolCostPerAssembly, params);
          //checkForNull(i.CostingPartDetails.TotalConversionCost) +
          //getCCTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(Data.CostingConversionCost.NetConversionCost), params) +

          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = (checkForNull(i.CostingPartDetails.TotalOperationCostPerAssembly) +
            checkForNull(i.CostingPartDetails.TotalToolCostPerAssembly) +
            getTotalCostForAssembly(i.CostingChildPartDetails));

          formatData(BOMLevel, PartNumber, Data, i.CostingChildPartDetails)

        } else if (i.PartNumber === PartNumber && i.BOMLevel === BOMLevel) {

          i.CostingPartDetails = { ...Data, Quantity: i.CostingPartDetails.Quantity };
          i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = Data.TotalCalculatedRMBOPCCCost * i.CostingPartDetails.Quantity;
          i.IsOpen = !i.IsOpen;

        } else {
          i.IsOpen = false;
          formatData(BOMLevel, PartNumber, Data, i.CostingChildPartDetails)
        }
        return i;

      });
    } catch (error) {

    }
    return tempArr;
  }

  /**
  * @method setAssemblyOperationCost
  * @description SET RM COST
  */
  const setAssemblyOperationCost = (OperationGrid, params, IsGridChanged) => {
    let arr = setAssemblyOperationCostInDataList(OperationGrid, params, RMCCTabData, IsGridChanged)
    dispatch(setRMCCData(arr, () => { }))
  }

  const setAssemblyOperationCostInDataList = (OperationGrid, params, arr, IsGridChanged) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {
        if (i.IsAssemblyPart === true && i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = checkForNull(i.CostingPartDetails.TotalRawMaterialsCost) +
            checkForNull(i.CostingPartDetails.TotalBoughtOutPartCost) +
            checkForNull(i.CostingPartDetails.TotalOperationCostPerAssembly) +
            checkForNull(i.CostingPartDetails.TotalToolCostPerAssembly) +
            getProcessTotalCost(i.CostingChildPartDetails, i.CostingPartDetails.TotalProcessCost, params) +
            getOperationTotalCost(i.CostingChildPartDetails, i.CostingPartDetails.TotalOperationCost, params);

          i.CostingPartDetails.CostingOperationCostResponse = OperationGrid;

          i.CostingPartDetails.TotalConversionCost = GetOperationCostTotal(OperationGrid) +
            checkForNull(i.CostingPartDetails.TotalToolCostPerAssembly) +
            getProcessTotalCost(i.CostingChildPartDetails, i.CostingPartDetails.TotalProcessCost, params) +
            getOperationTotalCost(i.CostingChildPartDetails, i.CostingPartDetails.TotalOperationCost, params);

          // i.CostingPartDetails.TotalConversionCost = checkForNull(i.CostingPartDetails.TotalConversionCost) +
          //   (IsGridChanged ? GetOperationCostTotal(OperationGrid) : 0) +
          //   checkForNull(i.CostingPartDetails.TotalToolCostPerAssembly)
          // //- (IsGridChanged ? checkForNull(i.CostingPartDetails.TotalOperationCostPerAssembly) : 0);

          // i.CostingPartDetails.TotalConversionCost = checkForNull(i.CostingPartDetails.TotalProcessCost) +
          //   checkForNull(i.CostingPartDetails.TotalOperationCost) +
          //   GetOperationCostTotal(OperationGrid) +
          //   checkForNull(i.CostingPartDetails.TotalToolCostPerAssembly);

          i.CostingPartDetails.TotalOperationCostPerAssembly = GetOperationCostTotal(OperationGrid);

          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;

          setAssemblyOperationCostInDataList(OperationGrid, params, i.CostingChildPartDetails, IsGridChanged)

        } else {
          setAssemblyOperationCostInDataList(OperationGrid, params, i.CostingChildPartDetails, IsGridChanged)
        }
        return i;
      });
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
    let arr = setAssemblyToolCostInDataList(ToolGrid, params, RMCCTabData)
    dispatch(setRMCCData(arr, () => { }))
  }

  const setAssemblyToolCostInDataList = (ToolGrid, params, arr) => {
    let tempArr = [];
    try {

      tempArr = arr && arr.map(i => {
        if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = GetToolCostTotal(ToolGrid) + checkForNull(i.CostingPartDetails.TotalOperationCostPerAssembly);

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


  // 

  /**
  * @method saveCosting
  * @description SAVE COSTING
  */
  const saveCosting = () => {

    if (ErrorObjRMCC && Object.keys(ErrorObjRMCC).length > 0) return false;

    if (Object.keys(ComponentItemData).length > 0 && ComponentItemData.IsOpen !== false) {
      let requestData = {
        "NetRawMaterialsCost": ComponentItemData.CostingPartDetails.TotalRawMaterialsCost,
        "NetBoughtOutPartCost": ComponentItemData.CostingPartDetails.TotalBoughtOutPartCost,
        "NetConversionCost": ComponentItemData.CostingPartDetails.TotalConversionCost,
        "NetOperationCost": ComponentItemData.CostingPartDetails.CostingConversionCost && ComponentItemData.CostingPartDetails.CostingConversionCost.OperationCostTotal !== undefined ? ComponentItemData.CostingPartDetails.CostingConversionCost.OperationCostTotal : 0,
        "NetProcessCost": ComponentItemData.CostingPartDetails.CostingConversionCost && ComponentItemData.CostingPartDetails.CostingConversionCost.ProcessCostTotal !== undefined ? ComponentItemData.CostingPartDetails.CostingConversionCost.ProcessCostTotal : 0,
        "NetOtherOperationCost": ComponentItemData.CostingPartDetails.CostingConversionCost && ComponentItemData.CostingPartDetails.CostingConversionCost.OtherOperationCostTotal !== undefined ? ComponentItemData.CostingPartDetails.CostingConversionCost.OtherOperationCostTotal : 0,
        "NetToolCost": ComponentItemData.CostingPartDetails.TotalToolCost,
        "NetTotalRMBOPCC": ComponentItemData.CostingPartDetails.TotalCalculatedRMBOPCCCost,
        "TotalCost": netPOPrice,
        "LoggedInUserId": loggedInUserId(),
        "EffectiveDate": CostingEffectiveDate,

        "IsSubAssemblyComponentPart": costData.IsAssemblyPart,
        "CostingId": ComponentItemData.CostingId,
        "PartId": ComponentItemData.PartId,                              //ROOT ID
        "CostingNumber": costData.CostingNumber,                         //ROOT    
        "PartNumber": ComponentItemData.PartNumber,                      //ROOT

        "AssemblyCostingId": ComponentItemData.BOMLevel === LEVEL1 ? costData.CostingId : ComponentItemData.AssemblyCostingId,                  //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
        "AssemblyCostingNumber": ComponentItemData.BOMLevel === LEVEL1 ? costData.CostingNumber : ComponentItemData.AssemblyCostingNumber,      //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
        "AssemblyPartId": ComponentItemData.BOMLevel === LEVEL1 ? ComponentItemData.PartId : ComponentItemData.AssemblyPartId,                               //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
        "AssemblyPartNumber": ComponentItemData.BOMLevel === LEVEL1 ? ComponentItemData.PartNumber : ComponentItemData.AssemblyPartNumber,                   //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID

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
        CostingPartDetails: ComponentItemData.CostingPartDetails,
      }
      dispatch(saveComponentCostingRMCCTab(requestData, res => {
        if (res.data.Result) {
          toastr.success(MESSAGES.RMCC_TAB_COSTING_SAVE_SUCCESS);
          dispatch(CloseOpenAccordion())
          dispatch(setComponentItemData({}, () => { }))
          InjectDiscountAPICall()
        }
      }))
    }
  }

  const InjectDiscountAPICall = () => {
    dispatch(saveDiscountOtherCostTab({ ...ComponentItemDiscountData, EffectiveDate: CostingEffectiveDate, CallingFrom: 2 }, res => {
      dispatch(setComponentDiscountOtherItemData({}, () => { }))
    }))
  }

  /**
   * @method onSubmit
   * @description Used to Submit the form
   */
  const onSubmit = (values) => { }

  return (
    <>
      <div className="login-container signup-form">
        <Row>
          <Col md="12">
            <div className="shadow-lgg login-formg">
              <form
                noValidate
                className="form"
                onSubmit={handleSubmit(onSubmit)}
              >
                <Row>
                  <Col md="12">
                    <div className="table-responsive">
                      <Table className="table cr-brdr-main mb-0 rmcc-main-headings" size="sm">
                        <thead>
                          <tr>
                            <th className="py-3 align-middle" style={{ width: '100px' }}>{`Part Number`}</th>
                            <th className="py-3 align-middle" style={{ width: '70px' }}>{`Level`}</th>
                            <th className="py-3 align-middle" style={{ width: '100px' }}>{`Type`}</th>
                            <th className="py-3 align-middle" style={{ width: '100px' }}>{`RM Cost`}</th>
                            <th className="py-3 align-middle" style={{ width: '100px' }}>{`Insert Cost`}</th>
                            <th className="py-3 align-middle" style={{ width: '150px' }}>{`Conversion Cost`}</th>
                            <th className="py-3 align-middle" style={{ width: '90px' }}>{`Quantity`} {/*<button class="Edit ml-1 mb-0 align-middle" type="button" title="Edit Costing"></button>*/}</th>
                            <th className="py-3 align-middle" style={{ width: '150px' }}>{`RM + CC Cost/Pc`}</th>
                            {costData.IsAssemblyPart && <th className="py-3 align-middle" style={{ width: '200px' }}>{`RM + CC Cost/Assembly`}</th>}
                            <th className="py-3 align-middle" style={{ width: '100px' }}>{``}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {
                            RMCCTabData && RMCCTabData.map((item, index) => {
                              if (item.CostingPartDetails && item.CostingPartDetails.PartType === 'Component') {

                                return (
                                  < >
                                    <PartCompoment
                                      index={index}
                                      item={item}
                                      rmData={item.CostingPartDetails.CostingRawMaterialsCost}
                                      bopData={item.CostingPartDetails.CostingBoughtOutPartCost}
                                      ccData={item.CostingPartDetails.CostingConversionCost}
                                      setPartDetails={setPartDetails}
                                      setRMCost={setRMCost}
                                      setRMMasterBatchCost={setRMMasterBatchCost}
                                      setBOPCost={setBOPCost}
                                      setBOPHandlingCost={setBOPHandlingCost}
                                      setProcessCost={setProcessCost}
                                      setOperationCost={setOperationCost}
                                      setOtherOperationCost={setOtherOperationCost}
                                      setToolCost={setToolCost}
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
                                      setRMMasterBatchCost={setRMMasterBatchCost}
                                      setBOPCost={setBOPCost}
                                      setBOPHandlingCost={setBOPHandlingCost}
                                      setProcessCost={setProcessCost}
                                      setOperationCost={setOperationCost}
                                      setOtherOperationCost={setOtherOperationCost}
                                      setToolCost={setToolCost}
                                      setAssemblyOperationCost={setAssemblyOperationCost}
                                      setAssemblyToolCost={setAssemblyToolCost}
                                    />
                                  </>
                                )
                              }
                            })
                          }

                        </tbody>
                      </Table>
                    </div>
                  </Col>
                </Row>

                {!CostingViewMode &&
                  <div className="col-sm-12 text-right bluefooter-butn">
                    <button type={"button"} className="reset mr15 cancel-btn" onClick={props.backBtn}>
                      <div className={'cancel-icon'}></div>
                      {"Cancel"}
                    </button>
                    <button
                      type={'button'}
                      className="submit-button mr5 save-btn"
                      onClick={saveCosting}
                      disabled={Object.keys(ComponentItemData).length === 0 || (moment(CostingEffectiveDate)._isValid === false) ? true : false}
                    >
                      <div className={'save-icon'}></div>
                      {'Save'}
                    </button>
                  </div>}

              </form>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default TabRMCC;
//export default React.memo(TabRMCC);
