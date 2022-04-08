import React, { useEffect, useContext, useState } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import PartCompoment from '../CostingHeadCosts/Part'
import {
  getRMCCTabData, setRMCCData, saveComponentCostingRMCCTab, setComponentItemData,
  saveDiscountOtherCostTab, setComponentDiscountOtherItemData, CloseOpenAccordion, saveAssemblyPartRowCostingCalculation, isDataChange, setAllCostingInArray
} from '../../actions/Costing';
import { costingInfoContext, NetPOPriceContext } from '../CostingDetailStepTwo';
import { checkForNull, CheckIsCostingDateSelected, isGuid, loggedInUserId } from '../../../../helper';
import AssemblyPart from '../CostingHeadCosts/SubAssembly';
import { LEVEL0, LEVEL1, } from '../../../../config/constants';
import Toaster from '../../../common/Toaster';
import { MESSAGES } from '../../../../config/message';
import { ViewCostingContext } from '../CostingDetails';
import DayTime from '../../../common/DayTimeWrapper'
import AddBOPHandling from '../Drawers/AddBOPHandling';
import { createToprowObjAndSave } from '../../CostingUtil';
import _ from 'lodash'

function TabRMCC(props) {

  const { handleSubmit } = useForm()
  const dispatch = useDispatch()

  const { RMCCTabData, ComponentItemData, ComponentItemDiscountData, ErrorObjRMCC, CostingEffectiveDate, getAssemBOPCharge, SurfaceTabData,
    OverheadProfitTabData, PackageAndFreightTabData, ToolTabData, DiscountCostData, checkIsDataChange, setArrayForCosting, NetPOPrice, masterBatchObj } = useSelector(state => state.costing)

  const [isOpenBOPDrawer, setIsOpenBOPDrawer] = useState(false)

  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const netPOPrice = useContext(NetPOPriceContext);

  const RMCHeaderData = RMCCTabData && RMCCTabData.length > 0 && RMCCTabData[0].CostingPartDetails !== undefined ? RMCCTabData[0].CostingPartDetails : null;

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
        AssemCostingId: costData.CostingId,
        subAsmCostingId: costData.CostingId
      }
      dispatch(getRMCCTabData(data, true, (res) => {
        // dispatch(setAllCostingInArray(res.data.DataList,false))
        let tempArr = [];
        tempArr.push(res?.data?.DataList[0]);
        localStorage.setItem('costingArray', JSON.stringify(tempArr));

      }))
    }
  }, [Object.keys(costData).length > 0])

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
          NetConversionCost: TopHeaderValues?.TotalConversionCostWithQuantity ? TopHeaderValues.TotalConversionCostWithQuantity : 0,
          NetToolsCost: TopHeaderValues?.TotalToolCost ? TopHeaderValues.TotalToolCost : 0,
          NetTotalRMBOPCC: TopHeaderValues?.TotalCalculatedRMBOPCCCostWithQuantity ? TopHeaderValues.TotalRawMaterialsCostWithQuantity + TopHeaderValues.TotalBoughtOutPartCostWithQuantity + TopHeaderValues.TotalConversionCostWithQuantity : 0,
          OtherOperationCost: TopHeaderValues?.CostingConversionCost?.OtherOperationCostTotal ? TopHeaderValues.CostingConversionCost.OtherOperationCostTotal : 0,
          ProcessCostTotal: TopHeaderValues?.CostingConversionCost?.ProcessCostTotal ? TopHeaderValues.CostingConversionCost.ProcessCostTotal : 0,
          OperationCostTotal: TopHeaderValues?.CostingConversionCost?.OperationCostTotal ? TopHeaderValues.CostingConversionCost.OperationCostTotal : 0,
          TotalOperationCostPerAssembly: TopHeaderValues?.TotalOperationCostPerAssembly ? TopHeaderValues.TotalOperationCostPerAssembly : 0,
          TotalOperationCostSubAssembly: TopHeaderValues?.TotalOperationCostSubAssembly ? TopHeaderValues.TotalOperationCostSubAssembly : 0,
          TotalOtherOperationCostPerAssembly: TopHeaderValues?.TotalOtherOperationCostPerAssembly ? checkForNull(TopHeaderValues.TotalOtherOperationCostPerAssembly) : 0
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

  const getOtherOperationTotalCost = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.CostingPartDetails !== null && el.CostingPartDetails.TotalOtherOperationCost !== undefined ? el.CostingPartDetails.TotalOtherOperationCost : 0);
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
  * @description GET CC TOTAL COST FOR ASSEMBLY (tOTAL CHILD'S CONVERSION COST)
  */
  const getCCTotalCostForAssembly = (tempArr) => {
    // let tempArr = setArrayForCosting && setArrayForCosting.filter(item=>item.AssemblyPartNumber === PartNo && item.PartType !== 'Assembly')
    let NetCost = 0;
    NetCost = tempArr && tempArr.reduce((accummlator, el) => {

      return accummlator + checkForNull(el.CostingPartDetails.TotalConversionCost !== null ? checkForNull(el.CostingPartDetails.TotalConversionCost) * el.CostingPartDetails.Quantity : 0);

    }, 0)
    return NetCost;
  }




  const setRMCostForAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + item.CostingPartDetails.TotalRawMaterialsCost * item.Quantity
      } else {
        return accummlator + item.CostingPartDetails.TotalRawMaterialsCostWithQuantity * item.Quantity
      }
    }, 0)
    return total
  }

  const setRMCostForSubAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + item.CostingPartDetails.TotalRawMaterialsCost
      } else {

        return accummlator + item.CostingPartDetails.TotalRawMaterialsCostWithQuantity
      }
    }, 0)
    return total
  }

  const setBOPCostAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part' || item.PartType === 'BOP') {
        return accummlator + checkForNull(item.CostingPartDetails.TotalBoughtOutPartCost) * item.Quantity
      }
      else {
        return accummlator + checkForNull(item.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) * item.Quantity
      }
    }, 0)
    return total
  }

  const setBOPCostForSubAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + item.CostingPartDetails.TotalBoughtOutPartCost
      } else {

        return accummlator + item.CostingPartDetails.TotalBoughtOutPartCostWithQuantity
      }
    }, 0)
    return total
  }

  const setConversionCostAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + checkForNull(item.CostingPartDetails.TotalConversionCost) * item.Quantity
      } else {
        return accummlator + checkForNull(item.CostingPartDetails.TotalConversionCostWithQuantity) * item.Quantity
      }
    }, 0)
    return total
  }

  const setConversionCostForSubAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + checkForNull(item.CostingPartDetails.TotalConversionCost)
      } else {

        return accummlator + checkForNull(item.CostingPartDetails.TotalConversionCostWithQuantity)
      }
    }, 0)
    return total
  }

  const setOperationCostForAssembly = (tempArr) => {
    const total = tempArr && tempArr.reduce((accummlator, item) => {
      return accummlator + checkForNull(item.CostingPartDetails.TotalConversionCostWithQuantity * item.Quantity)
    }, 0)
    return total
  }

  /**
   * @function bopTypeCostForSubassembly
   * @description FOR FINDING BOP COST OF TYPE BOP FOR SUBASSEMBLY (BOP IN SUBASSEMBLY)
  */
  const bopTypeCostForSubassembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'BOP') {
        return accummlator + checkForNull(item.CostingPartDetails.TotalBoughtOutPartCost)
      }
    }, 0)
    return total
  }

  /**
   * @function calculationForPart
   * @param GRIDdATA (RM/BOP/CC) ,OBJ (WHICH WE HAVE TO UPDATE),TYPE(RM/BOP/CC),checkboxFields (IF BOP HANDLING CHARGE IS THERE / MASTERBATCH OBJECT IS THERE)
   * @description PART/ COMPONENT CALCULATION FOR RM,BOP,CC BASED ON THE TYPE RECEIVED IN FUNCTION CALLING
  */
  const calculationForPart = (gridData, obj, type, checkboxFields = {}) => {


    let partObj = obj
    let GrandTotalCost = 0
    switch (type) {
      case 'RM':
        GrandTotalCost = checkForNull(netRMCost(gridData)) + checkForNull(partObj.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(partObj.CostingPartDetails.TotalConversionCost)
        partObj.CostingPartDetails.CostingRawMaterialsCost = gridData;
        partObj.CostingPartDetails.TotalRawMaterialsCost = netRMCost(gridData);
        partObj.CostingPartDetails.MasterBatchRMId = checkboxFields?.MasterBatchRMId;
        partObj.CostingPartDetails.IsApplyMasterBatch = checkboxFields?.IsApplyMasterBatch;
        partObj.CostingPartDetails.MasterBatchRMName = checkboxFields?.MasterBatchRMName;
        partObj.CostingPartDetails.MasterBatchRMPrice = checkForNull(checkboxFields?.MasterBatchRMPrice);
        partObj.CostingPartDetails.MasterBatchPercentage = checkForNull(checkboxFields?.MasterBatchPercentage);
        partObj.CostingPartDetails.MasterBatchTotal = checkForNull(checkboxFields?.MasterBatchTotal);

        partObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
        partObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost * partObj.Quantity;
        break;
      case 'BOP':
        partObj.CostingPartDetails.CostingBoughtOutPartCost = gridData;
        partObj.CostingPartDetails.TotalBoughtOutPartCost = netBOPCost(gridData) + checkForNull(checkboxFields?.BOPHandlingCharges);
        partObj.CostingPartDetails.IsApplyBOPHandlingCharges = checkboxFields?.IsApplyBOPHandlingCharges;
        partObj.CostingPartDetails.BOPHandlingPercentage = checkForNull(checkboxFields?.BOPHandlingPercentage);
        partObj.CostingPartDetails.BOPHandlingCharges = checkForNull(checkboxFields?.BOPHandlingCharges);
        GrandTotalCost = checkForNull(partObj.CostingPartDetails.TotalRawMaterialsCost) + checkForNull(partObj.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(partObj.CostingPartDetails.TotalConversionCost)
        partObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
        partObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost * partObj.Quantity;
        break;
      case 'CC':
        partObj.CostingPartDetails.TotalConversionCost = gridData.NetConversionCost
        partObj.CostingPartDetails.TotalOtherOperationCostPerSubAssembly = gridData.OtherOperationCostTotal
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

        GrandTotalCost = checkForNull(partObj.CostingPartDetails.TotalRawMaterialsCost) + checkForNull(partObj.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(partObj.CostingPartDetails.TotalConversionCost)

        partObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
        partObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost * partObj.Quantity;
        break;
      default:
        break;
    }
    return partObj
  }

  /**
   * @function calculationForSubAssembly
   * @param OBJ (WHICH WE HAVE TO UPDATE),QUANTITY (CHILD PART QUANTITY),TYPE(RM/BOP/CC),tempArrALL (THE CHILD SUBASSEMBLIES /PART )
   * @description SUBASSEMBLY CALCULATION WITH THE HELP OF ALL PART/SUBASSEMBLIES RECEIVED IN TEMPARR PARAMETER (CHILDS TO UPDATE PARENT CALCULATION)
  */
  const calculationForSubAssembly = (obj = {}, quantity, type = '', tempArr = []) => {
    let subAssemObj = obj
    switch (type) {
      case 'RM':
        subAssemObj.CostingPartDetails.TotalRawMaterialsCost = setRMCostForSubAssembly(tempArr)
        subAssemObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity = subAssemObj.CostingPartDetails.TotalRawMaterialsCost * quantity;
        subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = subAssemObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity + checkForNull(subAssemObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) + checkForNull(subAssemObj.CostingPartDetails.TotalConversionCostWithQuantity);
        subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCost * subAssemObj.CostingPartDetails.Quantity;
        break;
      case 'BOP':
        subAssemObj.CostingPartDetails.TotalBoughtOutPartCost = setBOPCostForSubAssembly(tempArr)
        subAssemObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = subAssemObj.CostingPartDetails.TotalBoughtOutPartCost * quantity;
        subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = subAssemObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity + checkForNull(subAssemObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) + checkForNull(subAssemObj.CostingPartDetails.TotalConversionCostWithQuantity);
        subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCost * subAssemObj.CostingPartDetails.Quantity;
        break;
      case 'CC':
        subAssemObj.CostingPartDetails.TotalConversionCost = setConversionCostForSubAssembly(tempArr)
        subAssemObj.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(subAssemObj.CostingPartDetails.TotalConversionCost) * quantity;
        subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = subAssemObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity + checkForNull(subAssemObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) + checkForNull(subAssemObj.CostingPartDetails.TotalConversionCostWithQuantity);
        subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCost * subAssemObj.CostingPartDetails.Quantity;
        break;
      case 'Sub Assembly':
        subAssemObj.CostingPartDetails.TotalRawMaterialsCost = setRMCostForSubAssembly(tempArr)
        subAssemObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity = subAssemObj.CostingPartDetails.TotalRawMaterialsCost * quantity;
        subAssemObj.CostingPartDetails.TotalBoughtOutPartCost = setBOPCostForSubAssembly(tempArr) + bopTypeCostForSubassembly(tempArr)
        subAssemObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = subAssemObj.CostingPartDetails.TotalBoughtOutPartCost * quantity;
        subAssemObj.CostingPartDetails.TotalConversionCost = setConversionCostForSubAssembly(tempArr)
        subAssemObj.CostingPartDetails.TotalConversionCostWithQuantity = subAssemObj.CostingPartDetails.TotalConversionCost * quantity;
        subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = subAssemObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity + checkForNull(subAssemObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) + checkForNull(subAssemObj.CostingPartDetails.TotalConversionCostWithQuantity);
        subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCost * subAssemObj.CostingPartDetails.Quantity;
        break;
      case 'Sub Assembly Operation':
        subAssemObj.CostingPartDetails.TotalOperationCostSubAssembly = setOperationCostForAssembly(tempArr)
        subAssemObj.CostingPartDetails.TotalConversionCost = checkForNull(subAssemObj.CostingPartDetails.TotalOperationCostComponent) + checkForNull(subAssemObj.CostingPartDetails.TotalOperationCostSubAssembly) + checkForNull(subAssemObj.CostingPartDetails.TotalOperationCostPerAssembly)
        subAssemObj.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(subAssemObj.CostingPartDetails.TotalConversionCost)
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
    const mapArray = (data) => data.map(item => {
      let newItem = item
      let updatedArr = JSON.parse(localStorage.getItem('costingArray'))
      let obj = updatedArr && updatedArr.find(updateditem => updateditem.PartNumber === newItem.PartNumber && updateditem.AssemblyPartNumber === newItem.AssemblyPartNumber)
      newItem.CostingPartDetails.TotalRawMaterialsCost = checkForNull(obj.CostingPartDetails.TotalRawMaterialsCost)
      newItem.CostingPartDetails.TotalRawMaterialsCostWithQuantity = obj.CostingPartDetails.TotalRawMaterialsCostWithQuantity
      newItem.CostingPartDetails.TotalBoughtOutPartCost = checkForNull(obj.CostingPartDetails.TotalBoughtOutPartCost)
      newItem.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = obj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity
      newItem.CostingPartDetails.TotalConversionCost = checkForNull(obj.CostingPartDetails.TotalConversionCost)
      newItem.CostingPartDetails.TotalConversionCostWithQuantity = obj.CostingPartDetails.TotalConversionCostWithQuantity
      newItem.CostingPartDetails.TotalCalculatedRMBOPCCCost = checkForNull(obj.CostingPartDetails.TotalCalculatedRMBOPCCCost)
      newItem.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = obj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity
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
        if (item.PartType === "Part" || item.PartType === "Component") {
          // IF LEVEL WE ARE WORKING IS OF PART TYPE UNDER SOME SUBASSMEBLY OR ASSEMBLY
          if (i === useLevel) {
            let partIndex = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === item.PartNumber && x.AssemblyPartNumber === item.AssemblyPartNumber)
            let partObj = calculationForPart(rmGrid, item, 'RM', masterBatchObj)
            tempArrForCosting = Object.assign([...tempArrForCosting], { [partIndex]: partObj })
            initialPartNo = item.AssemblyPartNumber
            quant = item.CostingPartDetails.Quantity
          }
          else {
            // THIS ELSE CONDITION WILL RUN FOR ALL SUBASSEMBLY COSTING CALCULATION (WILL FIND PARENT ON THE BASIS OF PARENT NO PRESENT IN IT'S CHILD)
            let indexForUpdate = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === initialPartNo)
            let objectToUpdate = tempArrForCosting[indexForUpdate]
            if (objectToUpdate.PartType === 'Sub Assembly') {
              let tempArr = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === initialPartNo)
              initialPartNo = objectToUpdate.AssemblyPartNumber
              let subAssemObj = calculationForSubAssembly(objectToUpdate, quant, 'RM', tempArr)
              quant = objectToUpdate.CostingPartDetails.Quantity
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
        let tempArrForCosting = JSON.parse(localStorage.getItem('costingArray'))
        //CALCULATION FOR PART/COMPONENT AND SUBASSEMBLY COSTING (RM COST)
        tempArrForCosting = calculateValue(useLevel, item, tempArrForCosting)
        // THIS ARRAY IS FOR FINDING THE SUBASSEMBLIES  WHICH  HAVE SAME PART ON WHICH WE ARE DOING COSTING
        let Arr = tempArrForCosting && tempArrForCosting.filter(costing => costing.PartNumber === item.PartNumber && costing.AssemblyPartNumber !== item.AssemblyPartNumber)
        // THIS ARRAY IS FOR CALCUALTING THE COSTING OF ALL PARTS (WHICH HAVE SAME PART NUMBER ON WHICH WE ARE DOING COSTING) AND SUBASSEMBLY(CONTAINIG SAME PART NUMBER)
        Arr && Arr.map(costingItem => {
          const level = costingItem.BOMLevel
          const useLevel = level.split('L')[1]
          tempArrForCosting = calculateValue(useLevel, costingItem, tempArrForCosting)
        })

        // MAIN ASSEMBLY CALCULATION
        let subAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item => item.BOMLevel === 'L1')
        let assemblyObj = tempArrForCosting[0]
        // WILL RUN IF IT IS ASSEMBLY COSTING. WILL NOT RUN FOR COMPONENT COSTING
        if (assemblyObj.CostingPartDetails.PartType === 'Assembly') {
          assemblyObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity = setRMCostForAssembly(subAssemblyArray)
          assemblyObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(assemblyObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity) + checkForNull(assemblyObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) + checkForNull(assemblyObj.CostingPartDetails.TotalConversionCostWithQuantity)
          tempArrForCosting = Object.assign([...tempArrForCosting], { [0]: assemblyObj })
        }
        // STORING CALCULATED AND UPDATED COSTING VALUE IN LOCAL STORAGE
        localStorage.setItem('costingArray', [])
        localStorage.setItem('costingArray', JSON.stringify(tempArrForCosting))

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
        if (item.PartType === "Part" || item.PartType === "Component") {
          if (i === useLevel) {
            let partIndex = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === item.PartNumber && x.AssemblyPartNumber === item.AssemblyPartNumber)
            let partObj = calculationForPart(bopGrid, item, 'BOP', BOPHandlingFields)
            tempArrForCosting = Object.assign([...tempArrForCosting], { [partIndex]: partObj })
            initialPartNo = item.AssemblyPartNumber
            quant = item.CostingPartDetails.Quantity
          }
          else {
            // THIS ELSE CONDITION WILL RUN FOR ALL SUBASSEMBLY COSTING CALCULATION (WILL FIND PARENT ON THE BASIS OF PARENT NO PRESENT IN IT'S CHILD)
            let indexForUpdate = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === initialPartNo)
            let objectToUpdate = tempArrForCosting[indexForUpdate]
            if (objectToUpdate.PartType === 'Sub Assembly') {
              let tempArr = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === initialPartNo)
              initialPartNo = objectToUpdate.AssemblyPartNumber
              let subAssemObj = calculationForSubAssembly(objectToUpdate, quant, 'BOP', tempArr)
              quant = objectToUpdate.CostingPartDetails.Quantity
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
        let tempArrForCosting = JSON.parse(localStorage.getItem('costingArray'))
        //CALCULATION FOR PART/COMPONENT AND SUBASSEMBLY COSTING (BOP COST)
        tempArrForCosting = calculateValue(useLevel, item, tempArrForCosting)
        // THIS ARRAY IS FOR FINDING THE SUBASSEMBLIES  WHICH  HAVE SAME PART ON WHICH WE ARE DOING COSTING
        let Arr = tempArrForCosting && tempArrForCosting.filter(costing => costing.PartNumber === item.PartNumber && costing.AssemblyPartNumber !== item.AssemblyPartNumber)
        // THIS ARRAY IS FOR CALCUALTING THE COSTING OF ALL PARTS (WHICH HAVE SAME PART NUMBER ON WHICH WE ARE DOING COSTING) AND SUBASSEMBLY(CONTAINIG SAME PART NUMBER)
        Arr && Arr.map(costingItem => {
          const level = costingItem.BOMLevel
          const useLevel = level.split('L')[1]
          tempArrForCosting = calculateValue(useLevel, costingItem, tempArrForCosting)
        })
        // MAIN ASSEMBLY CALCULATION
        let subAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item => item.BOMLevel === 'L1')
        let assemblyObj = tempArrForCosting[0]
        // WILL RUN IF IT IS ASSEMBLY COSTING. WILL NOT RUN FOR COMPONENT COSTING
        if (assemblyObj.CostingPartDetails.PartType === 'Assembly') {
          assemblyObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = setBOPCostAssembly(subAssemblyArray) + checkForNull(getAssemBOPCharge?.BOPHandlingCharges)
          assemblyObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(assemblyObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity) + checkForNull(assemblyObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) + checkForNull(assemblyObj.CostingPartDetails.TotalConversionCostWithQuantity)
          tempArrForCosting = Object.assign([...tempArrForCosting], { [0]: assemblyObj })
        }
        // STORING CALCULATED AND UPDATED COSTING VALUE IN LOCAL STORAGE
        localStorage.setItem('costingArray', [])
        localStorage.setItem('costingArray', JSON.stringify(tempArrForCosting))
        return i;
      });
      // CALLING THIS FUNCTION TO UPDATE THE COSTING VALUE ON UI (RMMCCTABDATA REDUCER)
      updateCostingValuesInStructure()

    } catch (error) {

    }
    return tempArr;
  }

  /**
   * @method setBOPHandlingCost
   * @description SET BOP COST
   */
  const setBOPHandlingCost = (bopGrid, BOPHandlingFields, params, item) => {
    let arr = setBOPCost(bopGrid, params, item, BOPHandlingFields)
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
        if (item.PartType === "Part" || item.PartType === "Component") {
          // IF LEVEL WE ARE WORKING IS OF PART TYPE UNDER SOME SUBASSMEBLY OR ASSEMBLY
          if (i === useLevel) {
            let partIndex = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === item.PartNumber && x.AssemblyPartNumber === item.AssemblyPartNumber)
            let partObj = calculationForPart(conversionGrid, item, 'CC')
            tempArrForCosting = Object.assign([...tempArrForCosting], { [partIndex]: partObj })
            initialPartNo = item.AssemblyPartNumber
            quant = item.CostingPartDetails.Quantity
          }
          else {
            // THIS ELSE CONDITION WILL RUN FOR ALL SUBASSEMBLY COSTING CALCULATION (WILL FIND PARENT ON THE BASIS OF PARENT NO PRESENT IN IT'S CHILD)
            let indexForUpdate = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === initialPartNo)
            let objectToUpdate = tempArrForCosting[indexForUpdate]
            if (objectToUpdate.PartType === 'Sub Assembly') {
              let tempArr = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === initialPartNo)
              initialPartNo = objectToUpdate.AssemblyPartNumber
              let subAssemObj = calculationForSubAssembly(objectToUpdate, quant, 'CC', tempArr)
              quant = objectToUpdate.CostingPartDetails.Quantity
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
        let tempArrForCosting = JSON.parse(localStorage.getItem('costingArray'))
        //CALCULATION FOR PART/COMPONENT AND SUBASSEMBLY COSTING (PROCESS/OPERATION,OTHEROPEARTION COST)
        tempArrForCosting = calculateValue(useLevel, item, tempArrForCosting)
        // THIS ARRAY IS FOR FINDING THE SUBASSEMBLIES  WHICH  HAVE SAME PART ON WHICH WE ARE DOING COSTING
        let Arr = tempArrForCosting && tempArrForCosting.filter(costing => costing.PartNumber === item.PartNumber && costing.AssemblyPartNumber !== item.AssemblyPartNumber)
        // THIS ARRAY IS FOR CALCUALTING THE COSTING OF ALL PARTS (WHICH HAVE SAME PART NUMBER ON WHICH WE ARE DOING COSTING) AND SUBASSEMBLY(CONTAINIG SAME PART NUMBER)
        Arr && Arr.map(costingItem => {
          const level = costingItem.BOMLevel
          const useLevel = level.split('L')[1]
          tempArrForCosting = calculateValue(useLevel, costingItem, tempArrForCosting)
        })
        // MAIN ASSEMBLY CALCULATION
        let subAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item => item.BOMLevel === 'L1')
        let assemblyObj = tempArrForCosting[0]
        // WILL RUN IF IT IS ASSEMBLY COSTING. WILL NOT RUN FOR COMPONENT COSTING
        if (assemblyObj.CostingPartDetails.PartType === 'Assembly') {
          assemblyObj.CostingPartDetails.TotalConversionCostWithQuantity = setConversionCostAssembly(subAssemblyArray) + checkForNull(assemblyObj.CostingPartDetails.TotalOperationCostPerAssembly)
          assemblyObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(assemblyObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity) + checkForNull(assemblyObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) + checkForNull(assemblyObj.CostingPartDetails.TotalConversionCostWithQuantity)
          tempArrForCosting = Object.assign([...tempArrForCosting], { [0]: assemblyObj })
        }
        // STORING CALCULATED AND UPDATED COSTING VALUE IN LOCAL STORAGE
        localStorage.setItem('costingArray', [])
        localStorage.setItem('costingArray', JSON.stringify(tempArrForCosting))

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
    let arr = setToolCostInDataList(toolGrid, params, RMCCTabData)
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
    setAssembly(BOMLevel, PartNumber, Children, RMCCTabData)
  }

  /**
  * @method setAssembly
  * @description SET PART DETAILS
  */
  const setAssembly = (BOMLevel, PartNumber, Children, RMCCTabData) => {
    let tempArr = [];
    let updatedArr = []
    try {

      tempArr = RMCCTabData && RMCCTabData.map(i => {

        const { CostingChildPartDetails, } = Children;
        const params = { BOMLevel: BOMLevel, PartNumber: PartNumber };

        // if (i.IsAssemblyPart === true && i.PartNumber === PartNumber && i.BOMLevel === BOMLevel) {

        i.CostingChildPartDetails = BOMLevel !== LEVEL0 ? ChangeBOMLeveL(Children.CostingChildPartDetails, BOMLevel) : i.CostingChildPartDetails;
        i.CostingPartDetails = Children.CostingPartDetails;
        i.IsAssemblyPart = true;
        i.IsOpen = !i.IsOpen;
        let tempArrForCosting = JSON.parse(localStorage.getItem('costingArray'))
        if (params.BOMLevel !== LEVEL0) {

          let childArray = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === params.PartNumber)
          let subbAssemblyIndex = tempArrForCosting && tempArrForCosting.findIndex(item => item.PartNumber === params.PartNumber)
          let subAssemblyToUpdate = tempArrForCosting[subbAssemblyIndex]
          subAssemblyToUpdate.CostingChildPartDetails = BOMLevel !== LEVEL0 ? ChangeBOMLeveL(childArray, BOMLevel) : childArray
          subAssemblyToUpdate.CostingPartDetails.TotalRawMaterialsCostWithQuantity = 0
          subAssemblyToUpdate.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = 0
          subAssemblyToUpdate.CostingPartDetails.TotalConversionCostWithQuantity = 0
          subAssemblyToUpdate.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = 0
          subAssemblyToUpdate.CostingPartDetails.TotalRawMaterialsCostWithQuantity = setRMCostForAssembly(childArray)
          subAssemblyToUpdate.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = setBOPCostAssembly(childArray)
          subAssemblyToUpdate.CostingPartDetails.TotalConversionCostWithQuantity = setConversionCostAssembly(childArray) + checkForNull(subAssemblyToUpdate.CostingPartDetails.TotalOperationCostPerAssembly)
          subAssemblyToUpdate.CostingPartDetails.IsOpen = subAssemblyToUpdate.PartType !== "Part" ? !subAssemblyToUpdate.CostingPartDetails.IsOpen : false
          subAssemblyToUpdate.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = (checkForNull(subAssemblyToUpdate.CostingPartDetails.TotalRawMaterialsCostWithQuantity) + checkForNull(subAssemblyToUpdate.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) + checkForNull(subAssemblyToUpdate.CostingPartDetails.TotalConversionCostWithQuantity)) * subAssemblyToUpdate.Quantity


          tempArrForCosting = Object.assign([...tempArrForCosting], { [subbAssemblyIndex]: subAssemblyToUpdate })

          const level = params.BOMLevel
          const useLevel = level.split('L')[1]
          let initialPartNo = subAssemblyToUpdate.AssemblyPartNumber
          let quant = subAssemblyToUpdate.CostingPartDetails.Quantity


          if (useLevel > 1) {
            for (let i = useLevel + 1; i > 0; i--) {
              // IF LEVEL WE ARE WORKING IS OF PART TYPE UNDER SOME SUBASSMEBLY 
              let indexForUpdate = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === initialPartNo)
              let objectToUpdate = tempArrForCosting[indexForUpdate]
              if (objectToUpdate.PartType === 'Sub Assembly') {
                let tempArr = tempArrForCosting && tempArrForCosting.filter(item => item.PartNumber === initialPartNo)
                initialPartNo = objectToUpdate.AssemblyPartNumber
                let subAssemObj = calculationForSubAssembly(objectToUpdate, quant, 'Sub Assembly', tempArr)
                quant = objectToUpdate.CostingPartDetails.Quantity
                tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })

              }
            }
          }
        }
        let assemblyObj = tempArrForCosting[0]
        let subAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === assemblyObj.PartNumber && item.BOMLevel !== LEVEL0)
        assemblyObj.CostingChildPartDetails = subAssemblyArray
        assemblyObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity = setRMCostForAssembly(subAssemblyArray)
        assemblyObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = setBOPCostAssembly(subAssemblyArray) + checkForNull(getAssemBOPCharge?.BOPHandlingCharges)
        assemblyObj.CostingPartDetails.TotalConversionCostWithQuantity = setConversionCostAssembly(subAssemblyArray) + checkForNull(assemblyObj.CostingPartDetails.TotalOperationCostPerAssembly)
        assemblyObj.CostingPartDetails.IsOpen = params.BOMLevel !== LEVEL0 ? true : !assemblyObj.CostingPartDetails.IsOpen
        assemblyObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(assemblyObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity) + checkForNull(assemblyObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) + checkForNull(assemblyObj.CostingPartDetails.TotalConversionCostWithQuantity)


        tempArrForCosting = Object.assign([...tempArrForCosting], { [0]: assemblyObj })
        localStorage.setItem('costingArray', [])
        localStorage.setItem('costingArray', JSON.stringify(tempArrForCosting))

        const mapArray = (data) => data.map(item => {
          let newItem = item

          let updatedArr1 = JSON.parse(localStorage.getItem('costingArray'))
          let obj = updatedArr1 && updatedArr1.find(updateditem => updateditem.PartNumber === newItem.PartNumber && updateditem.AssemblyPartNumber === newItem.AssemblyPartNumber)
          newItem.CostingPartDetails.Quantity = obj.CostingPartDetails.Quantity
          newItem.CostingPartDetails.IsOpen = obj.CostingPartDetails.IsOpen
          newItem.IsAssemblyPart = true
          newItem.CostingChildPartDetails = obj.CostingChildPartDetails
          newItem.CostingPartDetails.TotalRawMaterialsCost = checkForNull(obj.CostingPartDetails.TotalRawMaterialsCost)
          newItem.CostingPartDetails.TotalRawMaterialsCostWithQuantity = obj.CostingPartDetails.TotalRawMaterialsCostWithQuantity
          newItem.CostingPartDetails.TotalBoughtOutPartCost = obj.CostingPartDetails.TotalBoughtOutPartCost
          newItem.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = obj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity
          newItem.CostingPartDetails.TotalConversionCost = obj.CostingPartDetails.TotalConversionCost
          newItem.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(obj?.CostingPartDetails.TotalConversionCostWithQuantity)
          newItem.CostingPartDetails.TotalOperationCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TotalOperationCostPerAssembly)
          newItem.CostingPartDetails.TotalOperationCostSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalOperationCostSubAssembly)
          newItem.CostingPartDetails.TotalOperationCostComponent = checkForNull(obj?.CostingPartDetails?.TotalOperationCostComponent)
          //Operation for subassembly key will come here
          newItem.CostingPartDetails.TotalCalculatedRMBOPCCCost = checkForNull(obj.CostingPartDetails.TotalCalculatedRMBOPCCCost)
          newItem.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = obj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity

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
        const tempObj = i.CostingChildPartDetails.filter((x) => x.PartNumber === item.AssemblyPartNumber && x.PartType === 'Sub Assembly')

        if (i.IsAssemblyPart === true) {
          i.CostingPartDetails = { ...i.CostingPartDetails };

          if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel && i.AssemblyPartNumber === item.AssemblyPartNumber) {
            i.CostingPartDetails = Data
            i.IsOpen = !i.IsOpen
          } else {
            i.IsOpen = false
          }
          formatData(BOMLevel, PartNumber, Data, i.CostingChildPartDetails, item)

        } else if (i.PartNumber === PartNumber && i.BOMLevel === BOMLevel && i.AssemblyPartNumber === item.AssemblyPartNumber) {

          i.CostingPartDetails = { ...Data, Quantity: i.CostingPartDetails.Quantity };


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
          let tempArrForCosting = JSON.parse(localStorage.getItem('costingArray'))

          for (let i = useLevel; i >= 0; i--) {

            if (item.PartType === "Sub Assembly") {
              // IF LEVEL WE ARE WOKRING IS OF SUBASSEMBLY TYPE UNDER SOME SUBASSMEBLY OR ASSEMBLY
              if (i === useLevel) { // SUB ASSEMBLY LEVEL HERE
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

                subAssembObj.CostingPartDetails.TotalConversionCost = checkForNull(subAssembObj.CostingPartDetails.TotalOperationCostComponent) + checkForNull(subAssembObj.CostingPartDetails.TotalOperationCostSubAssembly) + checkForNull(subAssembObj.CostingPartDetails.TotalOperationCostPerAssembly)
                subAssembObj.CostingPartDetails.TotalConversionCostWithQuantity = subAssembObj.CostingPartDetails.TotalConversionCost  //NEED TO CONFRIM THIS CALCULATION
                let GrandTotalCost = checkForNull(subAssembObj.CostingPartDetails.TotalRawMaterialsCost) + checkForNull(subAssembObj.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(subAssembObj.CostingPartDetails.TotalConversionCost)
                subAssembObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
                subAssembObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = subAssembObj.CostingPartDetails.TotalCalculatedRMBOPCCCost * subAssembObj.CostingPartDetails.Quantity
                tempArrForCosting = Object.assign([...tempArrForCosting], { [subAssemblyIndex]: subAssembObj })

                initialPartNo = item.AssemblyPartNumber //ASSEMBLY PART NO OF SUBASSEMBLY
                quant = item.CostingPartDetails.Quantity
              } else {
                let indexForUpdate = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === initialPartNo) //WILL GIVE PARENT ASSEMBLY (SUBASSEMBLY /ASSEMBLY)
                let objectToUpdate = tempArrForCosting[indexForUpdate]
                if (objectToUpdate.PartType === 'Sub Assembly') {
                  let tempArr = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === initialPartNo)
                  initialPartNo = objectToUpdate.AssemblyPartNumber
                  let subAssemObj = calculationForSubAssembly(objectToUpdate, quant, 'Sub Assembly Operation', tempArr)

                  quant = objectToUpdate.CostingPartDetails.Quantity
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
                  subAssembObj.CostingPartDetails.TotalConversionCost = checkForNull(subAssembObj.CostingPartDetails.TotalOperationCostComponent) + checkForNull(subAssembObj.CostingPartDetails.TotalOperationCostSubAssembly) + checkForNull(subAssembObj.CostingPartDetails.TotalOperationCostPerAssembly)
                  subAssembObj.CostingPartDetails.TotalConversionCostWithQuantity = subAssembObj.CostingPartDetails.TotalConversionCost  //NEED TO CONFRIM THIS CALCULATION
                  let GrandTotalCost = checkForNull(subAssembObj.CostingPartDetails.TotalRawMaterialsCost) + checkForNull(subAssembObj.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(subAssembObj.CostingPartDetails.TotalConversionCost)
                  subAssembObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
                  subAssembObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = subAssembObj.CostingPartDetails.TotalCalculatedRMBOPCCCost * subAssembObj.CostingPartDetails.Quantity
                  tempArrForCosting = Object.assign([...tempArrForCosting], { [subAssemblyIndex]: subAssembObj })
                  initialPartNo = item.AssemblyPartNumber //ASSEMBLY PART NO OF SUBASSEMBLY
                  quant = item.CostingPartDetails.Quantity
                }
                else {
                  let indexForUpdate = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === initialPartNo) //WILL GIVE PARENT ASSEMBLY (SUBASSEMBLY /ASSEMBLY)
                  let objectToUpdate = tempArrForCosting[indexForUpdate]
                  if (objectToUpdate.PartType === 'Sub Assembly') {
                    let tempArr = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === initialPartNo)
                    initialPartNo = objectToUpdate.AssemblyPartNumber
                    let subAssemObj = calculationForSubAssembly(objectToUpdate, quant, 'Sub Assembly Operation', tempArr)
                    quant = objectToUpdate.CostingPartDetails.Quantity
                    tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })
                  }
                }
              }
            }
          })

          let subAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item => item.BOMLevel === LEVEL1 && item.PartType === 'Sub Assembly')


          let componentArray = tempArrForCosting && tempArrForCosting.filter(item => item.BOMLevel === LEVEL1 && item.PartType === 'Part')

          let assemblyObj = tempArrForCosting[0]

          assemblyObj.CostingPartDetails.TotalOperationCostSubAssembly = checkForNull(setOperationCostForAssembly(subAssemblyArray))

          assemblyObj.CostingPartDetails.TotalOperationCostPerAssembly = params.BOMLevel === LEVEL0 ? GetOperationCostTotal(OperationGrid) : checkForNull(assemblyObj?.CostingPartDetails?.TotalOperationCostPerAssembly)
          assemblyObj.CostingPartDetails.CostingOperationCostResponse = params.BOMLevel === LEVEL0 ? OperationGrid : [];
          assemblyObj.CostingPartDetails.TotalOperationCostComponent = checkForNull(getCCTotalCostForAssembly(componentArray))
          assemblyObj.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(assemblyObj.CostingPartDetails.TotalOperationCostComponent) + checkForNull(assemblyObj.CostingPartDetails.TotalOperationCostSubAssembly) + checkForNull(assemblyObj.CostingPartDetails.TotalOperationCostPerAssembly)
          assemblyObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = checkForNull(assemblyObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity) + checkForNull(assemblyObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) + checkForNull(assemblyObj.CostingPartDetails.TotalConversionCostWithQuantity)
          assemblyObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(assemblyObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity) + checkForNull(assemblyObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) + checkForNull(assemblyObj.CostingPartDetails.TotalConversionCostWithQuantity) * assemblyObj.CostingPartDetails.Quantity

          tempArrForCosting = Object.assign([...tempArrForCosting], { [0]: assemblyObj })
          localStorage.setItem('costingArray', [])
          localStorage.setItem('costingArray', JSON.stringify(tempArrForCosting))
          return i;

        }

      });
      const mapArray = (data) => data.map(item => {
        let newItem = item
        let updatedArr = JSON.parse(localStorage.getItem('costingArray'))
        let obj = updatedArr && updatedArr.find(updateditem => updateditem.PartNumber === newItem.PartNumber && updateditem.AssemblyPartNumber === newItem.AssemblyPartNumber)

        newItem.CostingPartDetails.TotalOperationCostSubAssembly = checkForNull(obj.CostingPartDetails.TotalOperationCostSubAssembly)
        newItem.CostingPartDetails.TotalOperationCostPerAssembly = checkForNull(obj.CostingPartDetails.TotalOperationCostPerAssembly)
        newItem.CostingPartDetails.CostingOperationCostResponse = obj.CostingPartDetails.CostingOperationCostResponse
        newItem.CostingPartDetails.TotalOperationCostComponent = checkForNull(obj.CostingPartDetails.TotalOperationCostComponent)
        newItem.CostingPartDetails.TotalConversionCost = checkForNull(obj.CostingPartDetails.TotalConversionCost)
        newItem.CostingPartDetails.TotalConversionCostWithQuantity = checkForNull(obj.CostingPartDetails.TotalConversionCostWithQuantity)
        newItem.CostingPartDetails.TotalCalculatedRMBOPCCCost = checkForNull(obj.CostingPartDetails.TotalCalculatedRMBOPCCCost)
        newItem.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(obj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity)
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
    let arr = setAssemblyToolCostInDataList(ToolGrid, params, RMCCTabData)
    // dispatch(setRMCCData(arr, () => { }))
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

  /**
  * @method saveCosting
  * @description SAVE COSTING
  */
  const saveCosting = () => {

    if (ErrorObjRMCC && Object.keys(ErrorObjRMCC).length > 0) return false;

    if (Object.keys(ComponentItemData).length > 0 && ComponentItemData.IsOpen !== false && checkIsDataChange === true) {
      let requestData = {
        "NetRawMaterialsCost": ComponentItemData.CostingPartDetails.TotalRawMaterialsCost,
        "NetBoughtOutPartCost": ComponentItemData.CostingPartDetails.TotalBoughtOutPartCost,
        "NetConversionCost": ComponentItemData.CostingPartDetails.TotalConversionCost,
        "NetOperationCost": ComponentItemData.CostingPartDetails.CostingConversionCost && ComponentItemData.CostingPartDetails.CostingConversionCost.OperationCostTotal !== undefined ? ComponentItemData.CostingPartDetails.CostingConversionCost.OperationCostTotal : 0,
        "NetProcessCost": ComponentItemData.CostingPartDetails.CostingConversionCost && ComponentItemData.CostingPartDetails.CostingConversionCost.ProcessCostTotal !== undefined ? ComponentItemData.CostingPartDetails.CostingConversionCost.ProcessCostTotal : 0,
        "NetOtherOperationCost": ComponentItemData.CostingPartDetails.CostingConversionCost && ComponentItemData.CostingPartDetails.CostingConversionCost.OtherOperationCostTotal !== undefined ? ComponentItemData.CostingPartDetails.CostingConversionCost.OtherOperationCostTotal : 0,
        "NetToolCost": ComponentItemData.CostingPartDetails.TotalToolCost,
        "NetTotalRMBOPCC": ComponentItemData.CostingPartDetails.TotalCalculatedRMBOPCCCost,
        "TotalCost": costData.IsAssemblyPart ? ComponentItemData.CostingPartDetails.TotalCalculatedRMBOPCCCost : netPOPrice,
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
        CostingPartDetails: ComponentItemData.CostingPartDetails,
      }
      if (costData.IsAssemblyPart) {
        const tabData = RMCCTabData[0]
        const surfaceTabData = SurfaceTabData[0]
        const overHeadAndProfitTabData = OverheadProfitTabData[0]
        const discountAndOtherTabData = DiscountCostData

        let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, netPOPrice, getAssemBOPCharge, 1, setArrayForCosting)

        dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
      }

      dispatch(saveComponentCostingRMCCTab(requestData, res => {
        if (res.data.Result) {
          Toaster.success(MESSAGES.RMCC_TAB_COSTING_SAVE_SUCCESS);
          dispatch(CloseOpenAccordion())
          dispatch(setComponentItemData({}, () => { }))
          InjectDiscountAPICall()
          dispatch(isDataChange(false))
        }
      }))
    }
    else {
      dispatch(CloseOpenAccordion())
      dispatch(isDataChange(false))
    }
  }

  const InjectDiscountAPICall = () => {
    dispatch(saveDiscountOtherCostTab({ ...ComponentItemDiscountData, EffectiveDate: CostingEffectiveDate, CallingFrom: 2 }, res => {
      dispatch(setComponentDiscountOtherItemData({}, () => { }))
    }))
  }

  const bopHandlingDrawer = () => {
    if (CheckIsCostingDateSelected(CostingEffectiveDate)) return false;
    setIsOpenBOPDrawer(true)
  }

  const handleBOPCalculationAndClose = (e = '') => {
    setIsOpenBOPDrawer(false)
  }

  useEffect(() => {
    console.log(getAssemBOPCharge, "getAssemBOPCharge");
    if (getAssemBOPCharge && Object.keys(getAssemBOPCharge).length > 0 && getAssemBOPCharge.BOPHandlingCharges !== null && getAssemBOPCharge.BOPHandlingCharges > 0) {
      setBOPCostWithAsssembly()
    }
  }, [getAssemBOPCharge])

  /**
   * @function setBOPCostWithAsssembly
   * @description FOR APPLYING BOP HANDLING CHARGE TO ASSEMBLY (ONLY FOR ASSEMBLY)
  */
  const setBOPCostWithAsssembly = () => {

    let tempArrForCosting = JSON.parse(localStorage.getItem('costingArray'))
    let subAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item => item.BOMLevel === 'L1')
    let assemblyObj = tempArrForCosting[0]
    assemblyObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = setBOPCostAssembly(subAssemblyArray) + checkForNull(getAssemBOPCharge?.BOPHandlingCharges)
    assemblyObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(assemblyObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity) + checkForNull(assemblyObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) + checkForNull(assemblyObj.CostingPartDetails.TotalConversionCostWithQuantity)
    tempArrForCosting = Object.assign([...tempArrForCosting], { [0]: assemblyObj })
    localStorage.setItem('costingArray', [])
    localStorage.setItem('costingArray', JSON.stringify(tempArrForCosting))

    let arr = RMCCTabData && RMCCTabData.map(i => {
      i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity + checkForNull(getAssemBOPCharge?.BOPHandlingCharges)
      i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(i.CostingPartDetails.TotalRawMaterialsCostWithQuantity) + checkForNull(i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) + checkForNull(i.CostingPartDetails.TotalConversionCostWithQuantity)
      return i
    })
    dispatch(setRMCCData(arr, () => {
      setTimeout(() => {

        const tabData = RMCCTabData[0]
        const surfaceTabData = SurfaceTabData[0]
        const overHeadAndProfitTabData = OverheadProfitTabData[0]
        const discountAndOtherTabData = DiscountCostData

        const TotalCost = ((tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity +
          checkForNull(surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost) +
          (checkForNull(overHeadAndProfitTabData.CostingPartDetails?.OverheadCost) +
            checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.ProfitCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails?.RejectionCost) +
            checkForNull(overHeadAndProfitTabData.CostingPartDetails?.ICCCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails?.PaymentTermCost)) +
          checkForNull(PackageAndFreightTabData && PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) + checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost)) -
          checkForNull(discountAndOtherTabData?.HundiOrDiscountValue)) + checkForNull(discountAndOtherTabData?.AnyOtherCost)

        let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, TotalCost, getAssemBOPCharge, 1, setArrayForCosting)

        dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
      }, 2000);
    }))



  }

  /**
   * @method onSubmit
   * @description Used to Submit the form
   */
  const onSubmit = (values) => { }
  console.log(RMCCTabData?.CostingPartDetails, 'RMCCTabDataRMCCTabData');
  return (

    <>
      <div className="login-container signup-form" id="rm-cc-costing-header">
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
                    <Table className="table cr-brdr-main mb-0 rmcc-main-headings" size="sm">
                      <thead>
                        <tr>
                          <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{`Part Number`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '70px' }}>{`Level`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{`Type`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{`RM Cost`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{`BOP Cost`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`CC`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`Quantity`} {/*<button class="Edit ml-1 mb-0 align-middle" type="button" title="Edit Costing"></button>*/}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{`RMC + CC/Pc`}</th>
                          {costData.IsAssemblyPart && <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`RMC + CC/Assembly`}</th>}
                          {
                            costData.IsAssemblyPart && <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{
                              <button
                                type="button"
                                className={'user-btn add-oprn-btn'}
                                onClick={bopHandlingDrawer}>
                                <div className={`${RMCHeaderData !== null && RMCHeaderData.IsApplyBOPHandlingCharges ? 'fa fa-eye pr-1' : 'plus'}`}></div>{`BOP H`}</button>}
                            </th>
                          }
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
                                    setPartDetails={setPartDetails}
                                    setRMCost={setRMCost}
                                    setBOPCost={setBOPCost}
                                    setBOPHandlingCost={setBOPHandlingCost}
                                    setConversionCost={setConversionCost}
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
                                    setBOPCost={setBOPCost}
                                    setBOPHandlingCost={setBOPHandlingCost}
                                    setConversionCost={setConversionCost}
                                    setToolCost={setToolCost}
                                    setAssemblyOperationCost={setAssemblyOperationCost}
                                    setAssemblyToolCost={setAssemblyToolCost}
                                    subAssembId={item.CostingId}
                                  />
                                </>
                              )
                            }
                          })
                        }

                      </tbody>
                    </Table>
                  </Col>
                </Row>
                {
                  isOpenBOPDrawer &&
                  <AddBOPHandling
                    isOpen={isOpenBOPDrawer}
                    closeDrawer={handleBOPCalculationAndClose}
                    isEditFlag={false}
                    ID={''}
                    anchor={'right'}
                  />
                }

                {!CostingViewMode &&
                  <div className="col-sm-12 text-right bluefooter-butn btn-stciky-container">
                    <button type={"button"} className="reset mr15 cancel-btn" onClick={props.backBtn}>
                      <div className={'cancel-icon'}></div>
                      {"Cancel"}
                    </button>
                    <button
                      type={'button'}
                      className="submit-button mr5 save-btn"
                      onClick={saveCosting}
                      disabled={Object.keys(ComponentItemData).length === 0 || (DayTime(CostingEffectiveDate).isValid() === false) ? true : false}
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
