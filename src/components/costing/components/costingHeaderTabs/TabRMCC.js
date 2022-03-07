import React, { useEffect, useContext, useState } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import PartCompoment from '../CostingHeadCosts/Part'
import {
  getRMCCTabData, setRMCCData, saveComponentCostingRMCCTab, setComponentItemData,
  saveDiscountOtherCostTab, setComponentDiscountOtherItemData, CloseOpenAccordion, saveAssemblyPartRowCostingCalculation,isDataChange, setAllCostingInArray
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
import { Link } from 'react-scroll';
import _ from 'lodash'
import { reactLocalStorage } from 'reactjs-localstorage';

function TabRMCC(props) {

  const { handleSubmit } = useForm()

  const dispatch = useDispatch()

  const { RMCCTabData, ComponentItemData, ComponentItemDiscountData, ErrorObjRMCC, CostingEffectiveDate, getAssemBOPCharge, SurfaceTabData, OverheadProfitTabData, PackageAndFreightTabData, ToolTabData, DiscountCostData ,checkIsDataChange,setArrayForCosting} = useSelector(state => state.costing)



  const [isOpenBOPDrawer, setIsOpenBOPDrawer] = useState(false)

  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const netPOPrice = useContext(NetPOPriceContext);

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
        AssemCostingId: costData.CostingId,
        subAsmCostingId:costData.CostingId
      }
      dispatch(getRMCCTabData(data, true, (res) => {  
        // dispatch(setAllCostingInArray(res.data.DataList,false))
      let tempArr  = [];
      tempArr.push(res.data.DataList[0]);
      localStorage.setItem('costingArray',JSON.stringify(tempArr));

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
          TotalOperationCostPerAssembly:TopHeaderValues?.TotalOperationCostPerAssembly? TopHeaderValues.TotalOperationCostPerAssembly:0,
          TotalOperationCostSubAssembly:TopHeaderValues?.TotalOperationCostSubAssembly ? TopHeaderValues.TotalOperationCostSubAssembly:0,
          TotalOtherOperationCostPerAssembly:TopHeaderValues?.TotalOtherOperationCostPerAssembly?checkForNull(TopHeaderValues.TotalOtherOperationCostPerAssembly):0
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
  const getRMTotalCostForAssembly = (arr) => {
  
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.CostingPartDetails.TotalRawMaterialsCost !== null ? el.CostingPartDetails.TotalRawMaterialsCost : 0)

    }, 0)
    
    return NetCost;
  }

 

  /**
  * @method getRMTotalCostForAssemblyWithQuantity
  * @description GET RM TOTAL COST FOR ASSEMBLY WITH QUANTITY
  */
  const getRMTotalCostForAssemblyWithQuantity = (arr, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {

      return accummlator + (checkForNull(el.CostingPartDetails.TotalRawMaterialsCost !== null ? el.CostingPartDetails.TotalRawMaterialsCost : 0) * el.Quantity);

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

      return accummlator + checkForNull(el.CostingPartDetails.TotalBoughtOutPartCost !== null ? el.CostingPartDetails.TotalBoughtOutPartCost : 0);

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

      return accummlator + (checkForNull(el.CostingPartDetails.TotalBoughtOutPartCost !== null ? el.CostingPartDetails.TotalBoughtOutPartCost : 0) * el.Quantity);

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

      return accummlator + (checkForNull(el.CostingPartDetails.TotalConversionCost !== null ? el.CostingPartDetails.TotalConversionCost : 0) * el.CostingPartDetails.Quantity);

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

        return accummlator + checkForNull(el.CostingPartDetails !== null && el.CostingPartDetails.TotalProcessCost !== undefined ? el.CostingPartDetails.TotalProcessCost: 0);


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
    

        return accummlator + checkForNull(el.CostingPartDetails !== null && el.CostingPartDetails.TotalOperationCost !== undefined ? el.CostingPartDetails.TotalOperationCost : 0);
      

    }, 0)

    return NetCost;
  }
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
  * @description GET CC TOTAL COST FOR ASSEMBLY
  */
  const getCCTotalCostForAssembly = (PartNo) => {
    let tempArr = setArrayForCosting && setArrayForCosting.filter(item=>item.AssemblyPartNumber === PartNo && item.PartType !== 'Assembly')
    let NetCost = 0;
    NetCost = tempArr && tempArr.reduce((accummlator, el) => {

      return accummlator + checkForNull(el.CostingPartDetails.TotalConversionCost !== null ? el.CostingPartDetails.TotalConversionCost * el.CostingPartDetails.Quantity : 0);

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
      if ( item.PartType === 'Part') {
        return accummlator + checkForNull(item.CostingPartDetails.TotalBoughtOutPartCost) * item.Quantity
      } 
      else {
        return accummlator + checkForNull(item.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) * item.Quantity
      }
    }, 0)
    return total
  }

const setBOPCostForSubAssembly = (arr)=> {
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

  const setConversionCostForSubAssembly = (arr)=> {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + item.CostingPartDetails.TotalConversionCost 
      } else {
  
        return accummlator + item.CostingPartDetails.TotalConversionCostWithQuantity
      }
    }, 0)
    return total
  }
  

  const setOperationCostForAssembly = (PartNo)=>{
    let tempArr = setArrayForCosting && setArrayForCosting.filter(item=>item.AssemblyPartNumber === PartNo && item.PartType !== 'Assembly')
    const total = tempArr && tempArr.reduce((accummlator, item) => {
  
        return accummlator + checkForNull(item.CostingPartDetails.TotalOperationCostPerAssembly * item.Quantity)
      
    }, 0)
    return total
  }

  const setOtherOperationCostAssy = (arr)=>{
    const total = arr &&arr.reduce((accummlator,item)=>{
      if(item.PartType === 'Part'){
      return accummlator +checkForNull(item.CostingPartDetails.TotalOtherOperationCost * item.Quantity)
      }else{

        return accummlator + checkForNull(item.CostingPartDetails.TotalOtherOperationCostPerSubAssembly * item.Quantity)
      }
    },0)
    return total
  }

 const childComponentConversionCostPerAssembly = (arr)=>{
  const total = arr &&arr.reduce((accummlator,item)=>{
    if(item.PartType === 'Part'){
    return accummlator +checkForNull(item.CostingPartDetails.TotalConversionCost * item.Quantity)
    }else{

      return accummlator + checkForNull(item.CostingPartDetails.TotalOperationCostComponent * item.Quantity)
    }
  },0)
  return total
 }

  const assemblyCalculation = (arr, type = '') => {

    let tempArr = []
    tempArr = arr && arr.map((i) => {
      switch (type) {
        case 'RM':
          i.CostingPartDetails.TotalRawMaterialsCost = setRMCostForAssembly(i.CostingChildPartDetails)
          i.CostingPartDetails.TotalRawMaterialsCostWithQuantity = i.CostingPartDetails.TotalRawMaterialsCost * i.CostingPartDetails.Quantity;

          break;
        case 'BOP':
          i.CostingPartDetails.TotalBoughtOutPartCost = setBOPCostAssembly(i.CostingChildPartDetails)
          i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = (i.CostingPartDetails.TotalBoughtOutPartCost * i.CostingPartDetails.Quantity) + checkForNull(getAssemBOPCharge.BOPHandlingCharges)

          break;
        case 'CC':
          
          i.CostingPartDetails.TotalConversionCost = setConversionCostAssembly(i.CostingChildPartDetails)        
          
          i.CostingPartDetails.TotalOperationCostComponent = childComponentConversionCostPerAssembly(i.CostingChildPartDetails)
          i.CostingPartDetails.TotalOperationCostPerAssembly =   checkForNull(i.CostingPartDetails.TotalOperationCostPerAssembly)
          i.CostingPartDetails.TotalOperationCostSubAssembly = setOperationCostForAssembly(i.CostingChildPartDetails)
          i.CostingPartDetails.TotalConversionCostWithQuantity = (i.CostingPartDetails.TotalConversionCost * i.CostingPartDetails.Quantity) + checkForNull(i.CostingPartDetails.TotalOperationCostPerAssembly)
          break;
        // case 'Assembly':
        //   i.CostingPartDetails.TotalBoughtOutPartCost = bopForAssembAndSubAssembly(i.CostingChildPartDetails) 
        //   i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = (i.CostingPartDetails.TotalBoughtOutPartCost * i.CostingPartDetails.Quantity)+ checkForNull(getAssemBOPCharge.BOPHandlingCharges)
        // break;
        default:
          break;
      }
      i.CostingPartDetails.TotalOtherOperationCostPerAssembly = setOtherOperationCostAssy(i.CostingChildPartDetails)
      const total = i.CostingPartDetails.TotalRawMaterialsCostWithQuantity + checkForNull(i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) + checkForNull(i.CostingPartDetails.TotalConversionCostWithQuantity)
      
      i.CostingPartDetails.TotalCalculatedRMBOPCCCost = total
      //BELOW KEYS FOR COST WITH QUANTITY
      i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = total * i.CostingPartDetails.Quantity

      return i
    })

    return tempArr
  }


  const calculationForPart = (gridData,obj,type,BOPHandlingFields={})=>{
    let partObj = obj
    let GrandTotalCost =0 
    switch (type) {
      case 'RM':
        GrandTotalCost = checkForNull(netRMCost(gridData)) + checkForNull(partObj.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(partObj.CostingPartDetails.TotalConversionCost)
        partObj.CostingPartDetails.CostingRawMaterialsCost = gridData;
        partObj.CostingPartDetails.TotalRawMaterialsCost = netRMCost(gridData);
        partObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
        partObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost * partObj.Quantity;
        break;
      case 'BOP':
        partObj.CostingPartDetails.CostingBoughtOutPartCost = gridData;
        partObj.CostingPartDetails.TotalBoughtOutPartCost = netBOPCost(gridData) + checkForNull(BOPHandlingFields?.BOPHandlingCharges);
        partObj.CostingPartDetails.IsApplyBOPHandlingCharges = BOPHandlingFields?.IsApplyBOPHandlingCharges;
        partObj.CostingPartDetails.BOPHandlingPercentage = checkForNull(BOPHandlingFields?.BOPHandlingPercentage);
        partObj.CostingPartDetails.BOPHandlingCharges = checkForNull(BOPHandlingFields?.BOPHandlingCharges);
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

        let otherOperationData = gridData && gridData.CostingOperationCostResponse && gridData.CostingOperationCostResponse.map(el => {
          return el;
        })
        partObj.CostingPartDetails.CostingConversionCost = { ...gridData, CostingProcessCostResponse: data ,CostingOperationCostResponse: operationData,CostingOtherOperationCostResponse:otherOperationData};

         GrandTotalCost = checkForNull(partObj.CostingPartDetails.TotalRawMaterialsCost) + checkForNull(partObj.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(partObj.CostingPartDetails.TotalConversionCost)
 
        partObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
        partObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost * partObj.Quantity;
        break;
      default:
        break;
    }
    return partObj
  }


  const calculationForSubAssembly = (obj={},PartNo,quantity,type='',tempArr=[])=>{
  let subAssemObj=obj
  switch (type) {
    case 'RM':
      subAssemObj.CostingPartDetails.TotalRawMaterialsCost = setRMCostForSubAssembly(tempArr)
      subAssemObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity = subAssemObj.CostingPartDetails.TotalRawMaterialsCost* quantity;
      subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCost =  subAssemObj.CostingPartDetails.TotalRawMaterialsCost +  checkForNull(subAssemObj.CostingPartDetails.TotalBoughtOutPartCost)+ checkForNull(subAssemObj.CostingPartDetails.TotalConversionCost);
      subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity =    subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCost * quantity;
      break;
    case 'BOP':
      subAssemObj.CostingPartDetails.TotalBoughtOutPartCost = setBOPCostForSubAssembly(tempArr)
      subAssemObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = subAssemObj.CostingPartDetails.TotalBoughtOutPartCost * quantity;
      subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCost =  checkForNull(subAssemObj.CostingPartDetails.TotalRawMaterialsCost) +  checkForNull(subAssemObj.CostingPartDetails.TotalBoughtOutPartCost)+ checkForNull(subAssemObj.CostingPartDetails.TotalConversionCost);
      subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity =    subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCost * quantity;
      break;
    case 'CC':
      subAssemObj.CostingPartDetails.TotalConversionCost = setConversionCostForSubAssembly(tempArr)
      subAssemObj.CostingPartDetails.TotalConversionCostWithQuantity = subAssemObj.CostingPartDetails.TotalConversionCost * quantity;
      subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCost =  subAssemObj.CostingPartDetails.TotalRawMaterialsCost +  checkForNull(subAssemObj.CostingPartDetails.TotalBoughtOutPartCost)+ checkForNull(subAssemObj.CostingPartDetails.TotalConversionCost);
      subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity =   subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCost * quantity;
      break;
    case 'Sub Assembly':
      subAssemObj.CostingPartDetails.TotalRawMaterialsCost = setRMCostForSubAssembly(tempArr)
      subAssemObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity = subAssemObj.CostingPartDetails.TotalRawMaterialsCost* quantity;
      subAssemObj.CostingPartDetails.TotalBoughtOutPartCost = setBOPCostForSubAssembly(tempArr)
      subAssemObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = subAssemObj.CostingPartDetails.TotalBoughtOutPartCost * quantity;
      subAssemObj.CostingPartDetails.TotalConversionCost = setConversionCostForSubAssembly(tempArr)
      subAssemObj.CostingPartDetails.TotalConversionCostWithQuantity = subAssemObj.CostingPartDetails.TotalConversionCost * quantity;
      subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCost =  subAssemObj.CostingPartDetails.TotalRawMaterialsCost +  checkForNull(subAssemObj.CostingPartDetails.TotalBoughtOutPartCost)+ checkForNull(subAssemObj.CostingPartDetails.TotalConversionCost);
      subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity =   subAssemObj.CostingPartDetails.TotalCalculatedRMBOPCCCost * quantity;
      break;
    case 'Sub Assembly Operation':
      subAssemObj.CostingPartDetails.CostingPartDetails.TotalOperationCostComponent = getCCTotalCostForAssembly(PartNo)     
      subAssemObj.CostingPartDetails.TotalOperationCostSubAssembly = setOperationCostForAssembly(PartNo)
      break;
    default:
      break;
  }

  return subAssemObj
  }

  const updateStructure = ()=>{

  }

  /**
  * @method setRMCost
  * @description SET RM COST
  */
  const setRMCost = (rmGrid, params, item) => {
     const arr = setRMCostInDataList(rmGrid, params,RMCCTabData, item)
  }

  const setRMCostInDataList = (rmGrid, params, arr1,item) => {
    const arr =_.cloneDeep(arr1)
    
    let tempArr = [];
    try {
       tempArr = arr && arr.map((i) => {
          const level = params.BOMLevel
          const useLevel = level.split('L')[1]
          let initialPartNo=''
          let quant =''
          let tempArrForCosting  = JSON.parse(localStorage.getItem('costingArray'))
          for(let i= useLevel; i>=0; i--){
              if(item.PartType ==="Part"){
                // IF LEVEL WE ARE WORKING IS OF PART TYPE UNDER SOME SUBASSMEBLY OR ASSEMBLY
                if(i === useLevel){
                  let partIndex = tempArrForCosting && tempArrForCosting.findIndex((x)=> x.PartNumber === params.PartNumber && x.AssemblyPartNumber === item.AssemblyPartNumber)
                  let partObj =  calculationForPart(rmGrid,item,'RM')
                  tempArrForCosting = Object.assign([...tempArrForCosting], { [partIndex]: partObj })
                  initialPartNo = item.AssemblyPartNumber
                  quant= item.CostingPartDetails.Quantity
                }
                else {
                  let indexForUpdate = tempArrForCosting && tempArrForCosting.findIndex((x)=>x.PartNumber === initialPartNo)
                  let objectToUpdate = tempArrForCosting[indexForUpdate]
                  if(objectToUpdate.PartType ==='Sub Assembly'){
                    let tempArr = tempArrForCosting && tempArrForCosting.filter(item=>item.AssemblyPartNumber === initialPartNo)
                    initialPartNo = objectToUpdate.AssemblyPartNumber
                    let subAssemObj = calculationForSubAssembly(objectToUpdate,objectToUpdate.PartNumber,quant,'RM',tempArr)
                    quant = objectToUpdate.CostingPartDetails.Quantity
                    tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })
                    console.log('tempArrForCosting in First Condition: ', tempArrForCosting);
                  }
                }
              }
              else if(item.PartType ==="Sub Assembly"){
                // IF LEVEL WE ARE WOKRING IS OF SUBASSEMBLY TYPE UNDER SOME SUBASSMEBLY OR ASSEMBLY
              }
              else if(item.PartType === 'BOP'){

              }
          }
          let Arr = tempArrForCosting && tempArrForCosting.filter(costing=>costing.PartNumber === item.PartNumber && costing.AssemblyPartNumber !== item.AssemblyPartNumber)
          Arr && Arr.map(costingItem=>{
            const level = costingItem.BOMLevel
            const useLevel = level.split('L')[1]
            let initialPartNo=''
            let quant =''
            for(let i= useLevel; i>=0; i--){
              if(costingItem.PartType ==="Part"){
                // IF LEVEL WE ARE WORKING IS OF PART TYPE UNDER SOME SUBASSMEBLY OR ASSEMBLY
                if(i === useLevel){
                  let partIndex = tempArrForCosting && tempArrForCosting.findIndex((x)=> x.PartNumber === costingItem.PartNumber && x.AssemblyPartNumber === costingItem.AssemblyPartNumber)
                  let partObj =  calculationForPart(rmGrid,costingItem,'RM')
                  tempArrForCosting = Object.assign([...tempArrForCosting], { [partIndex]: partObj })
                  initialPartNo = costingItem.AssemblyPartNumber
                  quant= costingItem.CostingPartDetails.Quantity
                }
                else {
                  let indexForUpdate = tempArrForCosting && tempArrForCosting.findIndex((x)=>x.PartNumber === initialPartNo)
                  let objectToUpdate = tempArrForCosting[indexForUpdate]
                  if(objectToUpdate.PartType ==='Sub Assembly'){
                    let tempArr = tempArrForCosting && tempArrForCosting.filter(item=>item.AssemblyPartNumber === initialPartNo )
                    initialPartNo = objectToUpdate.AssemblyPartNumber
                    let subAssemObj = calculationForSubAssembly(objectToUpdate,objectToUpdate.PartNumber,quant,'RM',tempArr)
                    quant = objectToUpdate.CostingPartDetails.Quantity
                    tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })
                    console.log('tempArrForCosting in second costing: ', tempArrForCosting);
                  }
                }
              }
              else if(item.PartType ==="Sub Assembly"){
                // IF LEVEL WE ARE WOKRING IS OF SUBASSEMBLY TYPE UNDER SOME SUBASSMEBLY OR ASSEMBLY
              }
              else if(item.PartType === 'BOP'){
              }
          }
          })
          let subAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item=>item.BOMLevel === 'L1')
          let assemblyObj = tempArrForCosting[0]
          assemblyObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity = setRMCostForAssembly(subAssemblyArray)
          assemblyObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity =checkForNull(assemblyObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity) + checkForNull(assemblyObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) + checkForNull(assemblyObj.CostingPartDetails.TotalConversionCostWithQuantity)
          tempArrForCosting = Object.assign([...tempArrForCosting],{[0]:assemblyObj})
          localStorage.setItem('costingArray',[])
          localStorage.setItem('costingArray',JSON.stringify(tempArrForCosting))
      
          return i;
        });

        const mapArray=(data)=> data.map(item=>{
        let newItem = item
        let updatedArr = JSON.parse(localStorage.getItem('costingArray'))
        let obj = updatedArr && updatedArr.find(updateditem=>updateditem.PartNumber === newItem.PartNumber && updateditem.AssemblyPartNumber === newItem.AssemblyPartNumber)
        newItem.CostingPartDetails.TotalRawMaterialsCost = checkForNull(obj.CostingPartDetails.TotalRawMaterialsCost)
        newItem.CostingPartDetails.TotalCalculatedRMBOPCCCost =checkForNull(obj.CostingPartDetails.TotalCalculatedRMBOPCCCost)
        newItem.CostingPartDetails.TotalRawMaterialsCostWithQuantity = obj.CostingPartDetails.TotalRawMaterialsCostWithQuantity
        newItem.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = obj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity
        if(item.CostingChildPartDetails.length >0){
          mapArray(item.CostingChildPartDetails)
        }
        return newItem
      })
       const updatedArr=  mapArray(RMCCTabData)
       dispatch(setRMCCData(updatedArr, () => { }))

    } catch (error) {
    }
    return tempArr;
  } 

  /**
  * @method setRMMasterBatchCost
  * @description SET RM MASTER BATCH COST
  */
  const setRMMasterBatchCost = (rmGrid, MasterBatchObj, params) => {
    // let arr = setRMBatchCostInDataList(rmGrid, MasterBatchObj, params, RMCCTabData)
    // dispatch(setRMCCData(arr, () => { }))
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
  const setBOPCost = (bopGrid, params, item,BOPHandlingFields={}) => {
    const arr = setBOPCostInDataList(bopGrid, params, RMCCTabData, item,BOPHandlingFields)
  }

  const setBOPCostInDataList = (bopGrid, params, arr, item,BOPHandlingFields={}) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {     
          const level = params.BOMLevel
          const useLevel = level.split('L')[1]
          let initialPartNo=''
          let quant =''
          let tempArrForCosting  =  JSON.parse(localStorage.getItem('costingArray'))        
          for(let i= useLevel; i>=0; i--){
              if(item.PartType ==="Part" || item.PartType === 'BOP'){
                // IF LEVEL WE ARE WORKING IS OF PART TYPE UNDER SOME SUBASSMEBLY OR ASSEMBLY
                if(i === useLevel){
                  let partIndex = tempArrForCosting && tempArrForCosting.findIndex((x)=> x.PartNumber === params.PartNumber && x.AssemblyPartNumber === item.AssemblyPartNumber)
                  let partObj =  calculationForPart(bopGrid,item,'BOP',BOPHandlingFields) 
                  tempArrForCosting = Object.assign([...tempArrForCosting], { [partIndex]: partObj })
                  initialPartNo = item.AssemblyPartNumber
                  quant= item.CostingPartDetails.Quantity
                }else {
                  let indexForUpdate = tempArrForCosting && tempArrForCosting.findIndex((x)=>x.PartNumber === initialPartNo)
                  let objectToUpdate = tempArrForCosting[indexForUpdate]
                  if(objectToUpdate.PartType ==='Sub Assembly' || objectToUpdate.PartType === 'Assembly'){
                    let tempArr = tempArrForCosting && tempArrForCosting.filter(item=>item.AssemblyPartNumber === initialPartNo)
                    initialPartNo = objectToUpdate.AssemblyPartNumber
                    let subAssemObj = calculationForSubAssembly(objectToUpdate,objectToUpdate.PartNumber,quant,'BOP',tempArr)
                    quant = objectToUpdate.CostingPartDetails.Quantity
                    tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })
                  }

                }
              }
          }
          
          let Arr = tempArrForCosting && tempArrForCosting.filter(costing=>costing.PartNumber === item.PartNumber && costing.AssemblyPartNumber !== item.AssemblyPartNumber)
          Arr && Arr.map(costingItem=>{
            const level = costingItem.BOMLevel
            const useLevel = level.split('L')[1]
            let initialPartNo=''
            let quant =''
            for(let i= useLevel; i>=0; i--){
              if(costingItem.PartType ==="Part"){
                // IF LEVEL WE ARE WORKING IS OF PART TYPE UNDER SOME SUBASSMEBLY OR ASSEMBLY
                if(i === useLevel){
                  let partIndex = tempArrForCosting && tempArrForCosting.findIndex((x)=> x.PartNumber === costingItem.PartNumber && x.AssemblyPartNumber === costingItem.AssemblyPartNumber)
                  let partObj =  calculationForPart(bopGrid,costingItem,'BOP',BOPHandlingFields)
                  tempArrForCosting = Object.assign([...tempArrForCosting], { [partIndex]: partObj })
                  initialPartNo = costingItem.AssemblyPartNumber
                  quant= costingItem.CostingPartDetails.Quantity
                }
                else {
                  let indexForUpdate = tempArrForCosting && tempArrForCosting.findIndex((x)=>x.PartNumber === initialPartNo)
                  let objectToUpdate = tempArrForCosting[indexForUpdate]
                  if(objectToUpdate.PartType ==='Sub Assembly'){
                    let tempArr = tempArrForCosting && tempArrForCosting.filter(item=>item.AssemblyPartNumber === initialPartNo )
                    initialPartNo = objectToUpdate.AssemblyPartNumber
                    let subAssemObj = calculationForSubAssembly(objectToUpdate,objectToUpdate.PartNumber,quant,'BOP',tempArr)
                    quant = objectToUpdate.CostingPartDetails.Quantity
                    tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })
                    console.log('tempArrForCosting in second BOP costing: ', tempArrForCosting);
                  }
                }
              }
          }
          })
          let subAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item=>item.BOMLevel === 'L1')
          let assemblyObj = tempArrForCosting[0]
          assemblyObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = setBOPCostAssembly(subAssemblyArray)
          assemblyObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity =checkForNull(assemblyObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity) + checkForNull(assemblyObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) + checkForNull(assemblyObj.CostingPartDetails.TotalConversionCostWithQuantity)
          tempArrForCosting = Object.assign([...tempArrForCosting],{[0]:assemblyObj})
          localStorage.setItem('costingArray',[])
          localStorage.setItem('costingArray',JSON.stringify(tempArrForCosting))
        return i;
      });
      
      const mapArray=(data)=> data.map(item=>{
        let newItem = item
        let updatedArr = JSON.parse(localStorage.getItem('costingArray'))
        let obj = updatedArr && updatedArr.find(updateditem=>updateditem.PartNumber === newItem.PartNumber && updateditem.AssemblyPartNumber === newItem.AssemblyPartNumber)
        newItem.CostingPartDetails.TotalBoughtOutPartCost = checkForNull(obj.CostingPartDetails.TotalBoughtOutPartCost)
        newItem.CostingPartDetails.TotalCalculatedRMBOPCCCost =checkForNull(obj.CostingPartDetails.TotalCalculatedRMBOPCCCost)
        newItem.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = obj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity
        newItem.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = obj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity
        if(item.CostingChildPartDetails.length >0){
          mapArray(item.CostingChildPartDetails)
        }
        return newItem
      })
       const updatedArr=  mapArray(RMCCTabData)
       dispatch(setRMCCData(updatedArr, () => { }))

    } catch (error) {

    }
    return tempArr;
  }

  /**
   * @method setBOPHandlingCost
   * @description SET BOP COST
   */
  const setBOPHandlingCost = (bopGrid, BOPHandlingFields, params,item) => {
    let arr =setBOPCost(bopGrid,params,item,BOPHandlingFields)
    
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
  const setProcessCost = (conversionGrid, params, item) => {
    let arr = setProcessCostInDataList(conversionGrid, params, RMCCTabData, item)

  }

  const setProcessCostInDataList = (conversionGrid, params, arr, item) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {
        const level = params.BOMLevel
        const useLevel = level.split('L')[1]
        let initialPartNo=''
        let quant =''
        let tempArrForCosting  = JSON.parse(localStorage.getItem('costingArray'))        
        for(let i= useLevel; i>=0; i--){
            if(item.PartType ==="Part" || item.PartType === 'BOP'){
              // IF LEVEL WE ARE WORKING IS OF PART TYPE UNDER SOME SUBASSMEBLY OR ASSEMBLY
              if(i === useLevel){
                let partIndex = tempArrForCosting && tempArrForCosting.findIndex((x)=> x.PartNumber === params.PartNumber && x.AssemblyPartNumber === item.AssemblyPartNumber)
                let partObj =  calculationForPart(conversionGrid,item,'CC') 
                tempArrForCosting = Object.assign([...tempArrForCosting], { [partIndex]: partObj })
                initialPartNo = item.AssemblyPartNumber
                quant= item.CostingPartDetails.Quantity
              }else {
                let indexForUpdate = tempArrForCosting && tempArrForCosting.findIndex((x)=>x.PartNumber === initialPartNo)
                let objectToUpdate = tempArrForCosting[indexForUpdate]
                if(objectToUpdate.PartType ==='Sub Assembly' || objectToUpdate.PartType === 'Assembly'){
                  let tempArr = tempArrForCosting && tempArrForCosting.filter(item=>item.AssemblyPartNumber === initialPartNo)
                  initialPartNo = objectToUpdate.AssemblyPartNumber
                  let subAssemObj = calculationForSubAssembly(objectToUpdate,objectToUpdate.PartNumber,quant,'CC',tempArr)
                  quant = objectToUpdate.CostingPartDetails.Quantity
                  tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })
                }

              }
            }
        }
        let Arr = tempArrForCosting && tempArrForCosting.filter(costing=>costing.PartNumber === item.PartNumber && costing.AssemblyPartNumber !== item.AssemblyPartNumber)
          Arr && Arr.map(costingItem=>{
            const level = costingItem.BOMLevel
            const useLevel = level.split('L')[1]
            let initialPartNo=''
            let quant =''
            for(let i= useLevel; i>=0; i--){
              if(costingItem.PartType ==="Part"){
                // IF LEVEL WE ARE WORKING IS OF PART TYPE UNDER SOME SUBASSMEBLY OR ASSEMBLY
                if(i === useLevel){
                  let partIndex = tempArrForCosting && tempArrForCosting.findIndex((x)=> x.PartNumber === costingItem.PartNumber && x.AssemblyPartNumber === costingItem.AssemblyPartNumber)
                  let partObj =  calculationForPart(conversionGrid,costingItem,'CC')
                  tempArrForCosting = Object.assign([...tempArrForCosting], { [partIndex]: partObj })
                  initialPartNo = costingItem.AssemblyPartNumber
                  quant= costingItem.CostingPartDetails.Quantity
                }
                else {
                  let indexForUpdate = tempArrForCosting && tempArrForCosting.findIndex((x)=>x.PartNumber === initialPartNo)
                  let objectToUpdate = tempArrForCosting[indexForUpdate]
                  if(objectToUpdate.PartType ==='Sub Assembly'){
                    let tempArr = tempArrForCosting && tempArrForCosting.filter(item=>item.AssemblyPartNumber === initialPartNo )
                    initialPartNo = objectToUpdate.AssemblyPartNumber
                    let subAssemObj = calculationForSubAssembly(objectToUpdate,objectToUpdate.PartNumber,quant,'CC',tempArr)
                    quant = objectToUpdate.CostingPartDetails.Quantity
                    tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })
                    console.log('tempArrForCosting in second CC Array: ', tempArrForCosting);
                  }
                }
              }
          }
          })
          let subAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item=>item.BOMLevel === 'L1')
          let assemblyObj = tempArrForCosting[0]
          assemblyObj.CostingPartDetails.TotalConversionCostWithQuantity = setConversionCostAssembly(subAssemblyArray)
          assemblyObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity =checkForNull(assemblyObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity) + checkForNull(assemblyObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) + checkForNull(assemblyObj.CostingPartDetails.TotalConversionCostWithQuantity)
          tempArrForCosting = Object.assign([...tempArrForCosting],{[0]:assemblyObj})
          localStorage.setItem('costingArray',[])
          localStorage.setItem('costingArray',JSON.stringify(tempArrForCosting))

        return i;
      });

      const mapArray=(data)=> data.map(item=>{
        let newItem = item
        let updatedArr = JSON.parse(localStorage.getItem('costingArray'))
        let obj = updatedArr && updatedArr.find(updateditem=>updateditem.PartNumber === newItem.PartNumber && updateditem.AssemblyPartNumber === newItem.AssemblyPartNumber)
        newItem.CostingPartDetails.TotalConversionCost = checkForNull(obj.CostingPartDetails.TotalConversionCost)
        newItem.CostingPartDetails.TotalCalculatedRMBOPCCCost =checkForNull(obj.CostingPartDetails.TotalCalculatedRMBOPCCCost)
        newItem.CostingPartDetails.TotalConversionCostWithQuantity = obj.CostingPartDetails.TotalConversionCostWithQuantity
        newItem.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = obj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity
        if(item.CostingChildPartDetails.length >0){
          mapArray(item.CostingChildPartDetails)
        }
        return newItem
      })
       const updatedArr=  mapArray(RMCCTabData)
       dispatch(setRMCCData(updatedArr, () => { }))

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
  const setOperationCost = (operationGrid, params, item) => {
//  let arr = setOperationCostInDataList(operationGrid, params, RMCCTabData, item)
//     if (RMCCTabData[0].PartNumber === params.PartNumber && RMCCTabData[0].BOMLevel === params.BOMLevel) {
//       // dispatch(setRMCCData(arr, () => { }))
//     } else {
//       const arr1 = arr // THIS FUNCTION IS FOR ASSEMBLY CALCULATION
//       // dispatch(setRMCCData(arr1, () => { }))
//     }
  }



  const setOtherOperationCost = (otherOperationGrid, params, item) => {
    // let arr = setOtherOperationCostInDataList(otherOperationGrid, params, RMCCTabData, item)
    // if (RMCCTabData[0].PartNumber === params.PartNumber && RMCCTabData[0].BOMLevel === params.BOMLevel) {
    //   // dispatch(setRMCCData(arr, () => { }))
    // } else {
    //   const arr1 = arr // THIS FUNCTION IS FOR ASSEMBLY CALCULATION
    //   // dispatch(setRMCCData(arr1, () => { }))
    // }
  }

  /**
   * @method setToolCost
   * @description SET TOOL COST
   */
  const setToolCost = (toolGrid, params) => {
    let arr = setToolCostInDataList(toolGrid, params, RMCCTabData)
    // dispatch(setRMCCData(arr, () => { }))
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


  // const assyCalculation = (arr)=>{
  //   let total =0
  //   let arr1 = arr[0].CostingChildPartDetails
  //   arr1 && arr1.map(item=>{
  //     console.log('item: ', item);
  //     total = total+ item.CostingPartDetails.TotalRawMaterialsCostWithQuantity
  //   })
  //   console.log(total,"TOTAL");
  //   return total
  // }


  /**
  * @method toggleAssembly
  * @description SET PART DETAILS
  */
  const toggleAssembly = (BOMLevel, PartNumber, Children = {}) => {
    let arr = setAssembly(BOMLevel, PartNumber, Children, RMCCTabData)
    // let arr1 = arr
    // arr[0].CostingPartDetails.TotalRawMaterialsCostWithQuantity =assyCalculation(arr)
    dispatch(setRMCCData(arr, () => { }))

  }

  /**
  * @method setAssembly
  * @description SET PART DETAILS
  */
  const setAssembly = (BOMLevel, PartNumber, Children, RMCCTabData) => {
    let tempArr = [];
    let updatedArr=[]
    try {

      tempArr = RMCCTabData && RMCCTabData.map(i => {

        const { CostingChildPartDetails, } = Children;
        const params = { BOMLevel: BOMLevel, PartNumber: PartNumber };
        console.log('params: ', params);

        // if (i.IsAssemblyPart === true && i.PartNumber === PartNumber && i.BOMLevel === BOMLevel) {
          
          i.CostingChildPartDetails = BOMLevel !== LEVEL0 ? ChangeBOMLeveL(Children.CostingChildPartDetails, BOMLevel) : i.CostingChildPartDetails;
          i.CostingPartDetails = Children.CostingPartDetails;
          i.IsAssemblyPart = true;
          i.IsOpen = !i.IsOpen;
          console.log('i.CostingPartDetails: ', i.CostingPartDetails);
          let tempArrForCosting  = JSON.parse(localStorage.getItem('costingArray'))
         console.log('tempArrForCosting: ', tempArrForCosting);
          if(params.BOMLevel !== LEVEL0){ 

          let childArray = tempArrForCosting && tempArrForCosting.filter(item=>item.AssemblyPartNumber === params.PartNumber)
          let subbAssemblyIndex = tempArrForCosting && tempArrForCosting.findIndex(item=>item.PartNumber === params.PartNumber)
          let subAssemblyToUpdate = tempArrForCosting[subbAssemblyIndex]
          subAssemblyToUpdate.CostingChildPartDetails = childArray
          subAssemblyToUpdate.CostingPartDetails.TotalRawMaterialsCostWithQuantity = setRMCostForAssembly(childArray)
          subAssemblyToUpdate.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = setBOPCostAssembly(childArray)
          subAssemblyToUpdate.CostingPartDetails.TotalConversionCostWithQuantity = setConversionCostAssembly(childArray)
          subAssemblyToUpdate.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = checkForNull(subAssemblyToUpdate.CostingPartDetails.TotalRawMaterialsCostWithQuantity) + checkForNull(subAssemblyToUpdate.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) + checkForNull(subAssemblyToUpdate.CostingPartDetails.TotalConversionCostWithQuantity)
          tempArrForCosting = Object.assign([...tempArrForCosting],{[subbAssemblyIndex]:subAssemblyToUpdate})

          const level = params.BOMLevel
          const useLevel = level.split('L')[1]
          let initialPartNo = subAssemblyToUpdate.CostingPartDetails.AssemblyPartNumber
          let quant =subAssemblyToUpdate.CostingPartDetails.Quantity

          if(useLevel >1){
            for(let i= useLevel; i>=0; i--){
                // IF LEVEL WE ARE WORKING IS OF PART TYPE UNDER SOME SUBASSMEBLY 
                  let indexForUpdate = tempArrForCosting && tempArrForCosting.findIndex((x)=>x.PartNumber === initialPartNo)
                  let objectToUpdate = tempArrForCosting[indexForUpdate]
                  if(objectToUpdate.PartType ==='Sub Assembly'){
                    let tempArr = tempArrForCosting && tempArrForCosting.filter(item=>item.PartNumber === initialPartNo)
                    initialPartNo = objectToUpdate.AssemblyPartNumber
                    let subAssemObj = calculationForSubAssembly(objectToUpdate,objectToUpdate.PartNumber,quant,'Sub Assembly',tempArr)
                    quant = objectToUpdate.CostingPartDetails.Quantity
                    tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })
                    console.log('tempArrForCosting in First Condition: ', tempArrForCosting);
                  }
                 
                  //  dispatch(setRMCCData(updatedArr, () => { }))
            }
          }
        }
        let assemblyObj = tempArrForCosting[0]
        let subAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item=>item.AssemblyPartNumber === assemblyObj.PartNumber && item.BOMLevel !== LEVEL0)
        console.log('subAssemblyArray: ', subAssemblyArray);
          assemblyObj.CostingChildPartDetails = subAssemblyArray
          assemblyObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity = setRMCostForAssembly(subAssemblyArray)
          assemblyObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = setBOPCostAssembly(subAssemblyArray)
          assemblyObj.CostingPartDetails.TotalConversionCostWithQuantity = setConversionCostAssembly(subAssemblyArray)

          assemblyObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity =checkForNull(assemblyObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity) + checkForNull(assemblyObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) + checkForNull(assemblyObj.CostingPartDetails.TotalConversionCostWithQuantity)
          tempArrForCosting = Object.assign([...tempArrForCosting],{[0]:assemblyObj})
          localStorage.setItem('costingArray',[])
          localStorage.setItem('costingArray',JSON.stringify(tempArrForCosting))

          const mapArray=(data)=> data.map(item=>{
            let newItem = item
            let updatedArr1 = JSON.parse(localStorage.getItem('costingArray'))
            let obj = updatedArr1 && updatedArr1.find(updateditem=>updateditem.PartNumber === newItem.PartNumber && updateditem.AssemblyPartNumber === newItem.AssemblyPartNumber)
      
            newItem.CostingChildPartDetails = obj.CostingChildPartDetails
            newItem.CostingPartDetails.TotalRawMaterialsCost = checkForNull(obj.CostingPartDetails.TotalRawMaterialsCost)
            newItem.CostingPartDetails.TotalRawMaterialsCostWithQuantity = obj.CostingPartDetails.TotalRawMaterialsCostWithQuantity
            newItem.CostingPartDetails.TotalBoughtOutPartCost = obj.CostingPartDetails.TotalBoughtOutPartCost
            newItem.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = obj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity
            newItem.CostingPartDetails.TotalConversionCost = obj.CostingPartDetails.TotalConversionCost
            newItem.CostingPartDetails.TotalConversionCostWithQuantity = obj.CostingPartDetails.TotalConversionCostWithQuantity
            
            //Operation for subassembly key will come here
            newItem.CostingPartDetails.TotalCalculatedRMBOPCCCost =checkForNull(obj.CostingPartDetails.TotalCalculatedRMBOPCCCost)
            newItem.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = obj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity
            if(item.CostingChildPartDetails.length >0){
              mapArray(item.CostingChildPartDetails)
            }
            return newItem
          })
            updatedArr=  mapArray(RMCCTabData)
            console.log('updatedArr: ', updatedArr);



        
      
        // setAssembly(BOMLevel, PartNumber, Children, i.CostingChildPartDetails)
        // }
        // else {
        //   // i.CostingPartDetails.TotalBoughtOutPartCost = setBOPCostAssembly(i.CostingChildPartDetails)
        //   // i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity =    i.CostingPartDetails.TotalBoughtOutPartCost * i.CostingPartDetails.Quantity
        //   const total = i.CostingPartDetails.TotalRawMaterialsCostWithQuantity + i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity + i.CostingPartDetails.TotalConversionCostWithQuantity
        //   i.CostingPartDetails.TotalCalculatedRMBOPCCCost = total
        //   i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = i.CostingPartDetails.TotalCalculatedRMBOPCCCost * i.CostingPartDetails.Quantity;
        //   setAssembly(BOMLevel, PartNumber, Children, i.CostingChildPartDetails)
        // }
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
  const setPartDetails = (BOMLevel, PartNumber, Data, item) => {
  if(item.PartType === 'Component'){
    let arr = formatData(BOMLevel, PartNumber, Data, RMCCTabData, item)
   dispatch(setRMCCData(arr, () => { }))

  }else{

    let arr = formatData(BOMLevel, PartNumber, Data, RMCCTabData, item)
    let arr1= arr
    dispatch(setRMCCData(arr1, () => { }))
  }
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
          // i.CostingPartDetails.TotalRawMaterialsCost = item.CostingPartDetails.TotalRawMaterialsCost
          // i.CostingPartDetails.TotalConversionCost = getProcessTotalCost(i.CostingChildPartDetails, Data.TotalProcessCost, params) +
          //   getOperationTotalCost(i.CostingChildPartDetails, Data.TotalOperationCost, params) + getOtherOperationTotalCost(i.CostingChildPartDetails, Data.TotalOtherOperationCost, params)
          // 
          // i.CostingPartDetails.TotalConversionCostWithQuantity = i.CostingPartDetails.TotalConversionCost * i.CostingPartDetails.Quantity
          


          // i.CostingPartDetails.TotalCalculatedRMBOPCCCost =checkForNull(i.CostingPartDetails.TotalRawMaterialsCostWithQuantity) + checkForNull(i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) + checkForNull(i.CostingPartDetails.TotalConversionCostWithQuantity)


          // i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = Data.TotalCalculatedRMBOPCCCost * i.CostingPartDetails.Quantity;
          

          // i.CostingPartDetails.TotalConversionCost = checkForNull(i.CostingPartDetails.TotalConversionCost) +
          // getCCTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(Data.CostingConversionCost.NetConversionCost), params);


          formatData(BOMLevel, PartNumber, Data, i.CostingChildPartDetails, item)

        } else if (i.PartNumber === PartNumber && i.BOMLevel === BOMLevel) {
          
          i.CostingPartDetails = { ...Data, Quantity: i.CostingPartDetails.Quantity };
          // i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = Data.TotalCalculatedRMBOPCCCost * i.CostingPartDetails.Quantity;

          i.IsOpen = !i.IsOpen;

        } else {
          
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
  const setAssemblyOperationCost = (OperationGrid, params, IsGridChanged,item) => {
    let arr = setAssemblyOperationCostInDataList(OperationGrid, params, RMCCTabData, IsGridChanged,item)
    let arr1= arr
    
    // dispatch(setRMCCData(arr1, () => {
   
    // }))
  }

  const setAssemblyOperationCostInDataList = (OperationGrid, params, arr, IsGridChanged,item) => {
    
    
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {
      if(IsGridChanged){

          const level = params.BOMLevel
          const useLevel = level.split('L')[1]
          let initialPartNo=''
          let tempArrForCosting  = setArrayForCosting 
          for(let i= useLevel; i>=0; i--){
              if(item.PartType ==="Part" || item.PartType === 'BOP'){
                // IF LEVEL WE ARE WORKING IS OF PART TYPE UNDER SOME SUBASSMEBLY OR ASSEMBLY
                // if(i === useLevel){
                //   let partIndex = setArrayForCosting && setArrayForCosting.findIndex((x)=> x.PartNumber === params.PartNumber)
                //   let partObj =  calculationForPart(operationGrid,item,'CC') 
                //   tempArrForCosting = Object.assign([...tempArrForCosting], { [partIndex]: partObj })
                //   initialPartNo = item.AssemblyPartNumber
                //   dispatch(setAllCostingInArray(tempArrForCosting,true))
                // }else {
                //   let indexForUpdate = setArrayForCosting && setArrayForCosting.findIndex((x)=>x.PartNumber === initialPartNo)
                //   let objectToUpdate = setArrayForCosting[indexForUpdate]
                //   if(objectToUpdate.PartType ==='Sub Assembly' || objectToUpdate.PartType === 'Assembly'){
                //     initialPartNo = objectToUpdate.AssemblyPartNumber
                //     let subAssemObj = calculationForSubAssembly(objectToUpdate.PartNumber,objectToUpdate.CostingPartDetails.Quantity,'CC')
                //     objectToUpdate.CostingPartDetails.TotalConversionCost = subAssemObj.TotalConversionCost
                //     objectToUpdate.CostingPartDetails.TotalConversionCostWithQuantity = subAssemObj.TotalConversionCostWithQuantity
                //     tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: objectToUpdate })
                //     dispatch(setAllCostingInArray(tempArrForCosting,true))
                //   }

                // }

              }
              else if(item.PartType ==="Sub Assembly"){
                // IF LEVEL WE ARE WOKRING IS OF SUBASSEMBLY TYPE UNDER SOME SUBASSMEBLY OR ASSEMBLY

                if(i === useLevel){ // SUB ASSEMBLY LEVEL HERE
                  let subAssemblyIndex = setArrayForCosting && setArrayForCosting.findIndex((x)=> x.PartNumber === params.PartNumber)
                  let subAssembObj = setArrayForCosting[subAssemblyIndex]
                  subAssembObj.CostingPartDetails.CostingOperationCostResponse = OperationGrid;
                  subAssembObj.CostingPartDetails.TotalOperationCostComponent = getCCTotalCostForAssembly(subAssembObj.PartNumber)                  
                  subAssembObj.CostingPartDetails.TotalOperationCostPerAssembly = GetOperationCostTotal(OperationGrid);
                  subAssembObj.CostingPartDetails.TotalConversionCost = checkForNull(subAssembObj.CostingPartDetails.TotalOperationCostComponent) + checkForNull(subAssembObj.CostingPartDetails.TotalOperationCostSubAssembly) + checkForNull(subAssembObj.CostingPartDetails.TotalOperationCostPerAssembly)
                  subAssembObj.CostingPartDetails.TotalConversionCostWithQuantity = subAssembObj.CostingPartDetails.TotalConversionCost 
                  let GrandTotalCost =checkForNull(subAssembObj.CostingPartDetails.TotalRawMaterialsCost) + checkForNull(subAssembObj.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(subAssembObj.CostingPartDetails.TotalConversionCost)
                  subAssembObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
                  subAssembObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = subAssembObj.CostingPartDetails.TotalCalculatedRMBOPCCCost * subAssembObj.CostingPartDetails.Quantity
                
                  tempArrForCosting = Object.assign([...tempArrForCosting], { [subAssemblyIndex]: subAssembObj })
                  initialPartNo = item.AssemblyPartNumber
                  // dispatch(setAllCostingInArray(tempArrForCosting,true))
                }else{
              
                  let indexForUpdate = setArrayForCosting && setArrayForCosting.findIndex((x)=>x.PartNumber === initialPartNo)
                  let objectToUpdate = setArrayForCosting[indexForUpdate]
                  if(objectToUpdate.PartType ==='Sub Assembly' || objectToUpdate.PartType === 'Assembly'){
                    initialPartNo = objectToUpdate.AssemblyPartNumber
                    let subAssemObj = calculationForSubAssembly(objectToUpdate.PartNumber,objectToUpdate.CostingPartDetails.Quantity,'Sub Assembly Operation')
                 
                    objectToUpdate.CostingPartDetails.TotalOperationCostComponent = subAssemObj.TotalOperationCostComponent
                    objectToUpdate.CostingPartDetails.TotalOperationCostSubAssembly = subAssemObj.TotalOperationCostSubAssembly
                    objectToUpdate.CostingPartDetails.TotalOperationCostPerAssembly = GetOperationCostTotal(OperationGrid);
                    objectToUpdate.CostingPartDetails.TotalConversionCost =objectToUpdate.CostingPartDetails.TotalOperationCostComponent + objectToUpdate.CostingPartDetails.TotalOperationCostSubAssembly + objectToUpdate.CostingPartDetails.TotalOperationCostPerAssembly
                    objectToUpdate.CostingPartDetails.TotalConversionCostWithQuantity = objectToUpdate.CostingPartDetails.TotalConversionCost
                    tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: objectToUpdate })
                    // dispatch(setAllCostingInArray(tempArrForCosting,true))
                  }
                }







              }
              else if(item.PartType === 'BOP'){

              }
          }
        }

       
        //  if (i.IsAssemblyPart === true && i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel && IsGridChanged) {

        //   let GrandTotalCost = checkForNull(i.CostingPartDetails.TotalRawMaterialsCostWithQuantity) +
        //     checkForNull(i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) +checkForNull(i.CostingPartDetails.TotalConversionCostWithQuantity)

        //   i.CostingPartDetails.CostingOperationCostResponse = OperationGrid;
         
   
        //   if(i.PartType ==='Sub Assembly'){
            
        //     i.CostingPartDetails.TotalOperationCostComponent = getCCTotalCostForAssembly(i.CostingChildPartDetails)
            
        //     i.CostingPartDetails.TotalConversionCost = getCCTotalCostForAssembly(i.CostingChildPartDetails) 
        //     i.CostingPartDetails.TotalConversionCostWithQuantity = i.CostingPartDetails.TotalConversionCost + GetOperationCostTotal(OperationGrid)
        //   }

        //   i.CostingPartDetails.TotalOperationCostPerAssembly = GetOperationCostTotal(OperationGrid);
          

        //   i.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
        //   i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = i.CostingPartDetails.TotalCalculatedRMBOPCCCost * i.CostingPartDetails.Quantity

        // }
        //  else {
        //   setAssemblyOperationCostInDataList(OperationGrid, params, i.CostingChildPartDetails, IsGridChanged)
        // }
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


  // 

  /**
  * @method saveCosting
  * @description SAVE COSTING
  */
  const saveCosting = () => {

    if (ErrorObjRMCC && Object.keys(ErrorObjRMCC).length > 0) return false;

    if (Object.keys(ComponentItemData).length > 0 && ComponentItemData.IsOpen !== false  && checkIsDataChange === true) {
      let requestData = {
        "NetRawMaterialsCost": ComponentItemData.CostingPartDetails.TotalRawMaterialsCost,
        "NetBoughtOutPartCost": ComponentItemData.CostingPartDetails.TotalBoughtOutPartCost,
        "NetConversionCost": ComponentItemData.CostingPartDetails.TotalConversionCost,
        "NetOperationCost": ComponentItemData.CostingPartDetails.CostingConversionCost && ComponentItemData.CostingPartDetails.CostingConversionCost.OperationCostTotal !== undefined ? ComponentItemData.CostingPartDetails.CostingConversionCost.OperationCostTotal : 0,
        "NetProcessCost": ComponentItemData.CostingPartDetails.CostingConversionCost && ComponentItemData.CostingPartDetails.CostingConversionCost.ProcessCostTotal !== undefined ? ComponentItemData.CostingPartDetails.CostingConversionCost.ProcessCostTotal : 0,
        "NetOtherOperationCost": ComponentItemData.CostingPartDetails.CostingConversionCost && ComponentItemData.CostingPartDetails.CostingConversionCost.OtherOperationCostTotal !== undefined ? ComponentItemData.CostingPartDetails.CostingConversionCost.OtherOperationCostTotal : 0,
        "NetToolCost": ComponentItemData.CostingPartDetails.TotalToolCost,
        "NetTotalRMBOPCC": ComponentItemData.CostingPartDetails.TotalCalculatedRMBOPCCCost,
        "TotalCost":costData.IsAssemblyPart? ComponentItemData.CostingPartDetails.TotalCalculatedRMBOPCCCost :netPOPrice,
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
        "AssemblyCostingId":ComponentItemData.AssemblyCostingId,
        "SubAssemblyCostingId":ComponentItemData.SubAssemblyCostingId,
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
       
        let assemblyRequestedData = createToprowObjAndSave(tabData,surfaceTabData,PackageAndFreightTabData,overHeadAndProfitTabData,ToolTabData,discountAndOtherTabData,netPOPrice,getAssemBOPCharge,1,setArrayForCosting)
       
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
    else{
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
    //  setBOPCostWithAsssembly()
  }

  useEffect(() => {
    if (Object.keys(getAssemBOPCharge).length > 0) {
      setBOPCostWithAsssembly()
    }
  }, [getAssemBOPCharge])

  const setBOPCostWithAsssembly = () => {

    let arr = assemblyCalculation(RMCCTabData, 'BOP')
  //   dispatch(setRMCCData(arr, () => {
  //     const tabData = RMCCTabData[0]
      
  //     const surfaceTabData = SurfaceTabData[0]
      
  //     const overHeadAndProfitTabData = OverheadProfitTabData[0]
      
  //     const discountAndOtherTabData = DiscountCostData
      

  //     let assemblyWorkingRow = []
  //     tabData && tabData.CostingChildPartDetails && tabData.CostingChildPartDetails.map((item) => {
  //       if(item.PartType === 'Sub Assembly'){
  
  //         let subAssemblyObj = {
  //           "CostingId": item.CostingId,
  //           "CostingNumber": "", // Need to find out how to get it.
  //           "TotalRawMaterialsCostWithQuantity": item.PartType=== 'Part' ?item.CostingPartDetails?.TotalRawMaterialsCost * item.CostingPartDetails.Quantity :item.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
  //           "TotalBoughtOutPartCostWithQuantity":item.PartType=== 'Part' ?item.CostingPartDetails?.TotalBoughtOutPartCost * item.CostingPartDetails.Quantity :item.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
  //           "TotalConversionCostWithQuantity":item.PartType=== 'Part' ?item.CostingPartDetails?.TotalConversionCost * item.CostingPartDetails.Quantity :item.CostingPartDetails?.TotalConversionCostWithQuantity,
  //           "TotalCalculatedRMBOPCCCostPerPC": item.CostingPartDetails?.TotalRawMaterialsCost + item.CostingPartDetails?.TotalBoughtOutPartCost + item.CostingPartDetails?.TotalConversionCost,
  //           "TotalCalculatedRMBOPCCCostPerAssembly": item.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
  //           "TotalOperationCostPerAssembly": checkForNull(item.CostingPartDetails?.TotalOperationCostPerAssembly),
  //           "TotalOperationCostSubAssembly":checkForNull(item.CostingPartDetails?.TotalOperationCostSubAssembly),
  //           "TotalOperationCostComponent": item.CostingPartDetails.TotalOperationCostComponent,
  //           "SurfaceTreatmentCostPerAssembly": 0,
  //           "TransportationCostPerAssembly": 0,
  //           "TotalSurfaceTreatmentCostPerAssembly": 0,
  //           "TotalCostINR": netPOPrice
  //         }
  //         assemblyWorkingRow.push(subAssemblyObj)
  //         return assemblyWorkingRow
  //       }
  //     })
  //     let assemblyRequestedData = {
  
  //       "TopRow": {
  //         "CostingId": tabData.CostingId,
  //         "CostingNumber": tabData.CostingNumber,
  //         "TotalRawMaterialsCostWithQuantity": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
  //         "TotalBoughtOutPartCostWithQuantity": tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
  //         "TotalConversionCostWithQuantity": tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
  //         "TotalCalculatedRMBOPCCCostPerPC": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity + tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity + tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
  //         "TotalCalculatedRMBOPCCCostPerAssembly": tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
  //         "NetRMCostPerAssembly": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
  //         "NetBOPCostAssembly": tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
  //         "NetConversionCostPerAssembly": tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
  //         "NetRMBOPCCCost": tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
  //         "TotalOperationCostPerAssembly": tabData.CostingPartDetails.TotalOperationCostPerAssembly,
  //         "TotalOperationCostSubAssembly":checkForNull(tabData.CostingPartDetails?.TotalOperationCostSubAssembly),
  //          "TotalOperationCostComponent": checkForNull(tabData.CostingPartDetails?.TotalOperationCostComponent),
  //         "SurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.SurfaceTreatmentCost,
  //         "TransportationCostPerAssembly": surfaceTabData.CostingPartDetails?.TransportationCost,
  //         "TotalSurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
  //         "NetSurfaceTreatmentCost": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
  //         "NetOverheadAndProfits": overHeadAndProfitTabData.CostingPartDetails ?( checkForNull(overHeadAndProfitTabData.CostingPartDetails.OverheadCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails.ProfitCost)+ checkForNull(overHeadAndProfitTabData.CostingPartDetails.RejectionCost)+ checkForNull(overHeadAndProfitTabData.CostingPartDetails.ICCCost)+ checkForNull(overHeadAndProfitTabData.CostingPartDetails.PaymentTermCost)):0,
  //         "NetPackagingAndFreightCost": PackageAndFreightTabData && PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost,
  //         "NetToolCost": ToolTabData[0]?.CostingPartDetails?.TotalToolCost,
  //         "NetOtherCost": discountAndOtherTabData?.AnyOtherCost,
  //         "NetDiscounts": discountAndOtherTabData?.HundiOrDiscountValue,
  //         "TotalCostINR": tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity +
  //          checkForNull(surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost) +
  //   (checkForNull(overHeadAndProfitTabData.CostingPartDetails?.OverheadCost) + 
  //          checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.ProfitCost)+ checkForNull(overHeadAndProfitTabData.CostingPartDetails?.RejectionCost)+ 
  //          checkForNull(overHeadAndProfitTabData.CostingPartDetails?.ICCCost)+ checkForNull(overHeadAndProfitTabData.CostingPartDetails?.PaymentTermCost))+
  //            checkForNull(PackageAndFreightTabData && PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) +
  //           checkForNull( discountAndOtherTabData?.AnyOtherCost) +checkForNull(discountAndOtherTabData?.HundiOrDiscountValue) ,
  //         "TabId": 1
  //       },
  //       "WorkingRows": assemblyWorkingRow,
  //       "BOPHandlingCharges": {
  //         "AssemblyCostingId": tabData.CostingId,
  //           "IsApplyBOPHandlingCharges": true,
  //           "BOPHandlingPercentage": getAssemBOPCharge.BOPHandlingPercentage,
  //           "BOPHandlingCharges": getAssemBOPCharge.BOPHandlingCharges
  //       },
  //       "LoggedInUserId": loggedInUserId()
  
  //     }
  // if(!CostingViewMode && checkIsDataChange){

  //   dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
  // }
  //    }))
  }

  /**
   * @method onSubmit
   * @description Used to Submit the form
   */
  const onSubmit = (values) => { }

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
                                  <div className={'plus'}></div>{`${CostingViewMode ? 'View BOP H' : 'BOP H'}`}</button>}
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
