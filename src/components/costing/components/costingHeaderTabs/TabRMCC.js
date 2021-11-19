import React, { useEffect, useContext, useState} from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import PartCompoment from '../CostingHeadCosts/Part'
import {
  getRMCCTabData, setRMCCData, saveComponentCostingRMCCTab, setComponentItemData,
  saveDiscountOtherCostTab, setComponentDiscountOtherItemData, CloseOpenAccordion,saveAssemblyPartRowCostingCalculation
} from '../../actions/Costing';
import { costingInfoContext, NetPOPriceContext } from '../CostingDetailStepTwo';
import { checkForNull, loggedInUserId } from '../../../../helper';
import AssemblyPart from '../CostingHeadCosts/SubAssembly';
import { LEVEL0, LEVEL1, } from '../../../../config/constants';
import Toaster from '../../../common/Toaster';
import { MESSAGES } from '../../../../config/message';
import { ViewCostingContext } from '../CostingDetails';
import moment from 'moment';
import AddBOPHandling from '../Drawers/AddBOPHandling';

function TabRMCC(props) {

  const { handleSubmit } = useForm()

  const dispatch = useDispatch()

  const { RMCCTabData, ComponentItemData, ComponentItemDiscountData, ErrorObjRMCC, CostingEffectiveDate,getAssemBOPCharge,SurfaceTabData,OverheadProfitTabData,PackageAndFreightTabData,ToolTabData,DiscountCostData } = useSelector(state => state.costing)
  console.log('getAssemBOPCharge: ', getAssemBOPCharge);


  const [isOpenBOPDrawer,setIsOpenBOPDrawer] = useState(false)

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
  const getRMTotalCostForAssembly = (arr) => {
    console.log('arr in RM total cost for subassembly: ', arr);
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      console.log('el: ', el);
    
        return accummlator + checkForNull(el.CostingPartDetails.TotalRawMaterialsCost !== null ? el.CostingPartDetails.TotalRawMaterialsCost : 0) 
      
    }, 0)
  console.log(NetCost,"NetCostNetCost");
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
 
        return accummlator + checkForNull(el.CostingPartDetails !== null && el.CostingPartDetails.TotalProcessCost !== undefined ? el.CostingPartDetails.TotalProcessCost : 0);
      
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
 
        return accummlator + checkForNull(el.CostingPartDetails.TotalConversionCost !== null ? el.CostingPartDetails.TotalConversionCost : 0);
      
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
      if(item.PartType === 'Part'){
        return accummlator + item.CostingPartDetails.TotalRawMaterialsCost * item.Quantity
      }else{

        return accummlator + item.CostingPartDetails.TotalRawMaterialsCostWithQuantity * item.Quantity
      }
    }, 0)
    return total
  }

  const setBOPCostAssembly = (arr)=>{
    const total = arr && arr.reduce((accummlator, item) => {
      if(item.PartType ==='BOP' || item.PartType ==='Part'){
        return accummlator + item.CostingPartDetails.TotalBoughtOutPartCost * item.Quantity
      }else{
        return accummlator + item.CostingPartDetails.TotalBoughtOutPartCostWithQuantity * item.Quantity
      }
        
    }, 0)
    return total
  }

  const setConversionCostAssembly = (arr)=>{
    const total = arr && arr.reduce((accummlator,item)=>{
      if(item.PartType === 'Part'){
        return accummlator + item.CostingPartDetails.TotalConversionCost * item.Quantity
      }else{
        return accummlator + checkForNull(item.CostingPartDetails.TotalConversionCostWithQuantity* item.Quantity) + checkForNull(item.CostingPartDetails.TotalOperationCostPerAssembly)
      }
    },0)
    return total 
  }

const bopForAssembAndSubAssembly =(childPartDetail)=>{
  let BOPSum = 0
  childPartDetail && childPartDetail.map((el) => {
 if(el.PartType ==='Sub Assembly'){
        el.CostingChildPartDetails && el.CostingChildPartDetails.map(item =>{
            if(item.PartType === 'BOP'){                      
                BOPSum = BOPSum + ( item.CostingPartDetails.TotalBoughtOutPartCost * item.CostingPartDetails.Quantity)
            }
        })
    }   
    else if(el.PartType ==='BOP'){
    
      BOPSum= BOPSum+( el.CostingPartDetails.TotalBoughtOutPartCost * el.CostingPartDetails.Quantity)
    }
  })
  return BOPSum + checkForNull(getAssemBOPCharge.BOPHandlingCharges)
}

  const assemblyCalculation = (arr,type='') => {
 
    let tempArr = []
    tempArr = arr && arr.map((i) => {
     switch (type) {
       case 'RM':
        i.CostingPartDetails.TotalRawMaterialsCost = setRMCostForAssembly(i.CostingChildPartDetails)
        i.CostingPartDetails.TotalRawMaterialsCostWithQuantity = i.CostingPartDetails.TotalRawMaterialsCost * i.CostingPartDetails.Quantity;
      
       break;
       case 'BOP':
         i.CostingPartDetails.TotalBoughtOutPartCost = setBOPCostAssembly(i.CostingChildPartDetails) 
         i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = (i.CostingPartDetails.TotalBoughtOutPartCost * i.CostingPartDetails.Quantity)+ checkForNull(getAssemBOPCharge.BOPHandlingCharges)
      
         break;
        case 'CC':

          i.CostingPartDetails.TotalConversionCost = setConversionCostAssembly(i.CostingChildPartDetails)
          i.CostingPartDetails.TotalConversionCostWithQuantity = i.CostingPartDetails.TotalConversionCost * i.CostingPartDetails.Quantity
        break;
        // case 'Assembly':
        //   i.CostingPartDetails.TotalBoughtOutPartCost = bopForAssembAndSubAssembly(i.CostingChildPartDetails) 
        //   i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = (i.CostingPartDetails.TotalBoughtOutPartCost * i.CostingPartDetails.Quantity)+ checkForNull(getAssemBOPCharge.BOPHandlingCharges)
        // break;
       default:
         break;
     }
         const total =  i.CostingPartDetails.TotalRawMaterialsCostWithQuantity +  checkForNull(i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity)+checkForNull( i.CostingPartDetails.TotalConversionCostWithQuantity)
           console.log('total: ', total);
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = total
           //BELOW KEYS FOR COST WITH QUANTITY
         i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = total * i.CostingPartDetails.Quantity

      return i
    })

    return tempArr
  }

  /**
  * @method setRMCost
  * @description SET RM COST
  */
  const setRMCost = (rmGrid, params,item) => {
    const arr = setRMCostInDataList(rmGrid, params, RMCCTabData,item)
    if(RMCCTabData[0].PartNumber === params.PartNumber && RMCCTabData[0].BOMLevel === params.BOMLevel){
      console.log("Coming in if block");
      dispatch(setRMCCData(arr, () => { }))
    }else{
      const arr1 = assemblyCalculation(arr,'RM') // THIS FUNCTION IS FOR ASSEMBLY CALCULATION
      console.log('arr1: ', arr1);
      dispatch(setRMCCData(arr1, () => { }))
    }
  }

  const setRMCostInDataList = (rmGrid, params, arr,item) => {
      let tempArr = [];
    try {
      tempArr = arr && arr.map((i) => {
        let tempIndex=i.CostingChildPartDetails.findIndex((x)=>x.PartNumber === item.AssemblyPartNumber && x.PartType === 'Sub Assembly')       
   
        if((item.PartType ==='Part' || item.PartType ==='BOP') && item.BOMLevel === LEVEL1){
          console.log("COMING IN PART OR BOP CONDITION");
          let partOrBopIndex = i.CostingChildPartDetails.findIndex((x)=>x.PartNumber === item.PartNumber && (x.PartType==='Part'||x.PartType==='BOP'))
          let partOrBopObj = i.CostingChildPartDetails[partOrBopIndex]
          let GrandTotalCost = checkForNull(netRMCost(rmGrid)) + checkForNull(partOrBopObj.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(partOrBopObj.CostingPartDetails.TotalConversionCost)

          partOrBopObj.CostingPartDetails.CostingRawMaterialsCost = rmGrid;
          partOrBopObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
          partOrBopObj.CostingPartDetails.TotalRawMaterialsCost = netRMCost(rmGrid);
          partOrBopObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity = partOrBopObj.CostingPartDetails.TotalRawMaterialsCost 
          partOrBopObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost *partOrBopObj.Quantity;
          i.CostingChildPartDetails = Object.assign([...i.CostingChildPartDetails],{[partOrBopIndex]:partOrBopObj})
          console.log(' i.CostingChildPartDetails: ',  i.CostingChildPartDetails);
   
        }else if(item.PartType ==='Sub Assembly' && item.BOMLevel === LEVEL1){
          //ASSEMBLY CALCULATION WILL COME HERE 
         console.log("COMING IN SUBASSEMBLY AND LEVEL!");
         setRMCostInDataList(rmGrid, params, i.CostingChildPartDetails) //TODO :OPTIMAZATION

       
        }else if(item.PartType === 'Sub Assembly' && item.BOMLevel !== LEVEL1){ // INNER SUBASSEMBLY WILL COME HERE
          console.log("COMING IN SUB ASSEMBLY CONDITION"); 
          setRMCostInDataList(rmGrid, params, i.CostingChildPartDetails) //TODO :OPTIMAZATION

         
        }else if(item.PartType === 'Part' && tempIndex !==-1){     
          console.log("COMING IN PART CONDITION");     
          let tempObj= i.CostingChildPartDetails[tempIndex]
          let partTempIndex=tempObj.CostingChildPartDetails.findIndex((x)=>x.PartNumber === item.PartNumber && x.PartType === 'Part')
          let partTempObj = tempObj.CostingChildPartDetails[partTempIndex]
          //PART CALCULATION WILL COME HERE
             let GrandTotalCost = checkForNull(netRMCost(rmGrid)) + checkForNull(partTempObj.TotalBoughtOutPartCost) + checkForNull(partTempObj.TotalConversionCost)
            partTempObj.CostingPartDetails.CostingRawMaterialsCost = rmGrid;
            partTempObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
            partTempObj.CostingPartDetails.TotalRawMaterialsCost = netRMCost(rmGrid);
            partTempObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost *partTempObj.Quantity;
            tempObj.CostingChildPartDetails = Object.assign([...tempObj.CostingChildPartDetails],{[partTempIndex]:partTempObj})
           //SUBAMMSEMBLY CALCULATION WILL COME HERE 
            tempObj.CostingPartDetails.TotalRawMaterialsCost =  getRMTotalCostForAssembly(tempObj.CostingChildPartDetails, params);
            tempObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = tempObj.CostingPartDetails.TotalRawMaterialsCost  + checkForNull(i.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(i.CostingPartDetails.TotalConversionCost)

            //BELOW KEYS FOR COST WITH QUANTITY
            tempObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity =  tempObj.CostingPartDetails.TotalCalculatedRMBOPCCCost* tempObj.Quantity;
            tempObj.CostingPartDetails.TotalRawMaterialsCostWithQuantity =  getRMTotalCostForAssemblyWithQuantity(tempObj.CostingChildPartDetails, params)
       
            i.CostingChildPartDetails = Object.assign([...i.CostingChildPartDetails],{[tempIndex]:tempObj})
           setRMCostInDataList(rmGrid, params, i.CostingChildPartDetails) //TODO :OPTIMAZATION
        }
        else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {
          // PART CALCULATION HERE 
          let GrandTotalCost = checkForNull(netRMCost(rmGrid)) + checkForNull(i.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(i.CostingPartDetails.TotalConversionCost)

          i.CostingPartDetails.CostingRawMaterialsCost = rmGrid;
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
          i.CostingPartDetails.TotalRawMaterialsCost = checkForNull(netRMCost(rmGrid));
          i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost * i.CostingPartDetails.Quantity;

          // MASTER BATCH FOR RM
          // i.CostingPartDetails.IsApplyMasterBatch = MasterBatchObj.IsApplyMasterBatch;
          // i.CostingPartDetails.MasterBatchRMName = MasterBatchObj.MasterBatchRMName;
          // i.CostingPartDetails.MasterBatchRMPrice = checkForNull(MasterBatchObj.MasterBatchRMPrice);
          // i.CostingPartDetails.MasterBatchPercentage = checkForNull(MasterBatchObj.MasterBatchPercentage);
          // i.CostingPartDetails.MasterBatchTotal = checkForNull(MasterBatchObj.MasterBatchTotal);

        } 
        else {
       
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
  const setBOPCost = (bopGrid, params,item) => {
    const arr = setBOPCostInDataList(bopGrid, params, RMCCTabData,item)
    if(RMCCTabData[0].PartNumber === params.PartNumber && RMCCTabData[0].BOMLevel === params.BOMLevel){
      dispatch(setRMCCData(arr, () => { }))
    }else{

      const arr1 = assemblyCalculation(arr,'BOP') // THIS FUNCTION IS FOR ASSEMBLY CALCULATION
      console.log('arr1: ', arr1);
      dispatch(setRMCCData(arr1, () => { }))
    }
  }

  const setBOPCostInDataList = (bopGrid, params, arr,item) => {
    
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {
         let tempIndex=i.CostingChildPartDetails.findIndex((x)=>x.PartNumber === item.AssemblyPartNumber && x.PartType === 'Sub Assembly')
        if((item.PartType ==='Part' || item.PartType ==='BOP') && item.BOMLevel === LEVEL1){
          let partOrBopIndex = i.CostingChildPartDetails.findIndex((x)=>x.PartNumber === item.PartNumber && (x.PartType==='Part'||x.PartType==='BOP'))
          let partOrBopObj = i.CostingChildPartDetails[partOrBopIndex]
          let GrandTotalCost = checkForNull(partOrBopObj.CostingPartDetails.TotalRawMaterialsCost) + checkForNull(netBOPCost(bopGrid))  + checkForNull(partOrBopObj.CostingPartDetails.TotalConversionCost)

          partOrBopObj.CostingPartDetails.CostingBoughtOutPartCost = bopGrid;
          partOrBopObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
          partOrBopObj.CostingPartDetails.TotalBoughtOutPartCost = netBOPCost(bopGrid);
          partOrBopObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = partOrBopObj.CostingPartDetails.TotalBoughtOutPartCost 
          partOrBopObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost *partOrBopObj.Quantity;
          i.CostingChildPartDetails = Object.assign([...i.CostingChildPartDetails],{[partOrBopIndex]:partOrBopObj})
          setBOPCostInDataList(bopGrid, params, i.CostingChildPartDetails) //TODO :OPTIMAZATION

        }
        else if(item.PartType ==='Sub Assembly' && params.BOMLevel === LEVEL1){
          //ASSEMBLY CALCULATION WILL COME HERE 
         
        }else if(item.PartType === 'Sub Assembly' && params.BOMLevel !== LEVEL1){ // INNER SUBASSEMBLY WILL COME HERE
        }
        else if(item.PartType === 'Part' && tempIndex !==-1){    
          let tempObj= i.CostingChildPartDetails[tempIndex]
          let partTempIndex=tempObj.CostingChildPartDetails.findIndex((x)=>x.PartNumber === item.PartNumber && x.PartType === 'Part')
          let partTempObj = tempObj.CostingChildPartDetails[partTempIndex]
          //PART CALCULATION WILL COME HERE
          let GrandTotalCost = checkForNull(partTempObj.CostingPartDetails.TotalRawMaterialsCost) + checkForNull(netBOPCost(bopGrid))  + checkForNull(partTempObj.CostingPartDetails.TotalConversionCost)
           
            partTempObj.CostingPartDetails.CostingBoughtOutPartCost = bopGrid;
            partTempObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
            partTempObj.CostingPartDetails.TotalBoughtOutPartCost = netBOPCost(bopGrid);
            partTempObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost *partTempObj.Quantity;
            tempObj.CostingChildPartDetails = Object.assign([...tempObj.CostingChildPartDetails],{[partTempIndex]:partTempObj})

           //SUBAMMSEMBLY CALCULATION WILL COME HERE 
            tempObj.CostingPartDetails.TotalBoughtOutPartCost =  getBOPTotalCostForAssembly(tempObj.CostingChildPartDetails, params);
            tempObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = tempObj.CostingPartDetails.TotalBoughtOutPartCost  + checkForNull(i.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(i.CostingPartDetails.TotalConversionCost)

            //BELOW KEYS FOR COST WITH QUANTITY
            tempObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity =  tempObj.CostingPartDetails.TotalCalculatedRMBOPCCCost* tempObj.Quantity;
            tempObj.CostingPartDetails.TotalBoughtOutPartCostWithQuantity =  getBOPTotalCostForAssemblyWithQuantity(tempObj.CostingChildPartDetails, params)
        
            i.CostingChildPartDetails = Object.assign([...i.CostingChildPartDetails],{[tempIndex]:tempObj})
            setBOPCostInDataList(bopGrid, params, i.CostingChildPartDetails) //TODO :OPTIMAZATION
        }
        else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = checkForNull(i.CostingPartDetails.TotalRawMaterialsCost) + checkForNull(netBOPCost(bopGrid)) + checkForNull(i.CostingPartDetails.TotalConversionCost);

          i.CostingPartDetails.CostingBoughtOutPartCost = bopGrid;
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost + checkForNull(i.CostingPartDetails.BOPHandlingCharges);
          i.CostingPartDetails.TotalBoughtOutPartCost = checkForNull(netBOPCost(bopGrid)) + checkForNull(i.CostingPartDetails.BOPHandlingCharges);
          i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost * i.CostingPartDetails.Quantity;

        } 
         else {
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
  const setProcessCost = (conversionGrid, params,item) => {
        let arr = setProcessCostInDataList(conversionGrid, params, RMCCTabData,item)
        if(RMCCTabData[0].PartNumber === params.PartNumber && RMCCTabData[0].BOMLevel === params.BOMLevel){
          dispatch(setRMCCData(arr, () => { }))
        }else{
              const arr1 = assemblyCalculation(arr,'CC') // THIS FUNCTION IS FOR ASSEMBLY CALCULATION
          dispatch(setRMCCData(arr1, () => { }))
        }
  }

  const setProcessCostInDataList = (conversionGrid, params, arr,item) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {
        let tempIndex=i.CostingChildPartDetails.findIndex((x)=>x.PartNumber === item.AssemblyPartNumber && x.PartType === 'Sub Assembly')
        if((item.PartType ==='Part' || item.PartType ==='BOP') && item.BOMLevel === LEVEL1){
          let partOrBopIndex = i.CostingChildPartDetails.findIndex((x)=>x.PartNumber === item.PartNumber && (x.PartType==='Part'||x.PartType==='BOP'))
          let partOrBopObj = i.CostingChildPartDetails[partOrBopIndex]
          partOrBopObj.CostingPartDetails.TotalProcessCost = conversionGrid.ProcessCostTotal
          partOrBopObj.CostingPartDetails.TotalConversionCost =  conversionGrid.NetConversionCost
          let data = conversionGrid && conversionGrid.CostingProcessCostResponse && conversionGrid.CostingProcessCostResponse.map(el => {
            return el;
          })
          partOrBopObj.CostingPartDetails.CostingConversionCost = { ...conversionGrid, CostingProcessCostResponse: data };
          let GrandTotalCost = checkForNull(partOrBopObj.CostingPartDetails.TotalRawMaterialsCost) + checkForNull(partOrBopObj.CostingPartDetails.TotalBoughtOutPartCost)  + checkForNull(partOrBopObj.CostingPartDetails.TotalConversionCost)
          partOrBopObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
          partOrBopObj.CostingPartDetails.TotalConversionCostWithQuantity = partOrBopObj.CostingPartDetails.TotalConversionCost  
          partOrBopObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost *partOrBopObj.Quantity;
          i.CostingChildPartDetails = Object.assign([...i.CostingChildPartDetails],{[partOrBopIndex]:partOrBopObj})
          setProcessCostInDataList(conversionGrid, params, i.CostingChildPartDetails) //TODO :OPTIMAZATION

        }
        else if(item.PartType ==='Sub Assembly' && params.BOMLevel === LEVEL1){
          //ASSEMBLY CALCULATION WILL COME HERE 
         
        }else if(item.PartType === 'Sub Assembly' && params.BOMLevel !== LEVEL1){ // INNER SUBASSEMBLY WILL COME HERE
        }
        else if(item.PartType === 'Part' && tempIndex !==-1){    
          let tempObj= i.CostingChildPartDetails[tempIndex]
           let partTempIndex=tempObj.CostingChildPartDetails.findIndex((x)=>x.PartNumber === item.PartNumber && x.PartType === 'Part')
          let partTempObj = tempObj.CostingChildPartDetails[partTempIndex]
          // //PART CALCULATION WILL COME HERE
           let GrandTotalCost = checkForNull(partTempObj.CostingPartDetails.TotalRawMaterialsCost)  + checkForNull(partTempObj.CostingPartDetails.TotalBoughtOutPartCost)+ checkForNull(conversionGrid.NetConversionCost) 
           
          //   // partTempObj.CostingPartDetails.CostingBoughtOutPartCost = bopGrid;
            partTempObj.CostingPartDetails.CostingConversionCost = { ...conversionGrid, CostingProcessCostResponse: conversionGrid.CostingProcessCostResponse};
            partTempObj.CostingPartDetails.TotalConversionCost = conversionGrid.NetConversionCost;
            partTempObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
            partTempObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost *partTempObj.Quantity;
            tempObj.CostingChildPartDetails = Object.assign([...tempObj.CostingChildPartDetails],{[partTempIndex]:partTempObj})

           //SUBAMMSEMBLY CALCULATION WILL COME HERE 
            tempObj.CostingPartDetails.TotalConversionCost =  getCCTotalCostForAssembly(tempObj.CostingChildPartDetails, params);
            tempObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = tempObj.CostingPartDetails.TotalBoughtOutPartCost  + checkForNull(i.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(i.CostingPartDetails.TotalConversionCost)

            //BELOW KEYS FOR COST WITH QUANTITY
            tempObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity =  tempObj.CostingPartDetails.TotalCalculatedRMBOPCCCost* tempObj.Quantity;
            tempObj.CostingPartDetails.TotalConversionCostWithQuantity =  getCCTotalCostForAssemblyWithQuantity(tempObj.CostingChildPartDetails, params)
        
            i.CostingChildPartDetails = Object.assign([...i.CostingChildPartDetails],{[tempIndex]:tempObj})
          setProcessCostInDataList(conversionGrid, params, i.CostingChildPartDetails) //TODO :OPTIMAZATION
        }




        else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

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

        } 
        else {
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
  const setOperationCost = (operationGrid, params,item) => {
    let arr = setOperationCostInDataList(operationGrid, params, RMCCTabData,item)
    if(RMCCTabData[0].PartNumber === params.PartNumber && RMCCTabData[0].BOMLevel === params.BOMLevel){
      dispatch(setRMCCData(arr, () => { }))
    }else{
          const arr1 = assemblyCalculation(arr,'CC') // THIS FUNCTION IS FOR ASSEMBLY CALCULATION
      dispatch(setRMCCData(arr1, () => { }))
    }
  }


  const setOperationCostInDataList = (operationGrid, params, arr,item) => {   
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {
        let tempIndex=i.CostingChildPartDetails.findIndex((x)=>x.PartNumber === item.AssemblyPartNumber && x.PartType === 'Sub Assembly')
        
        if((item.PartType ==='Part' || item.PartType ==='BOP') && item.BOMLevel === LEVEL1){
          let partOrBopIndex = i.CostingChildPartDetails.findIndex((x)=>x.PartNumber === item.PartNumber && (x.PartType==='Part'||x.PartType==='BOP'))
          let partOrBopObj = i.CostingChildPartDetails[partOrBopIndex]
          partOrBopObj.CostingPartDetails.TotalOperationCost =operationGrid.OperationCostTotal
          partOrBopObj.CostingPartDetails.TotalConversionCost = operationGrid.NetConversionCost
          let data = operationGrid && operationGrid.CostingOperationCostResponse && operationGrid.CostingOperationCostResponse.map(el => {
            return el;
          })
          partOrBopObj.CostingPartDetails.CostingConversionCost = { ...operationGrid, CostingOperationCostResponse: data };
          let GrandTotalCost = checkForNull(partOrBopObj.CostingPartDetails.TotalRawMaterialsCost) + checkForNull(partOrBopObj.CostingPartDetails.TotalBoughtOutPartCost)  + checkForNull(partOrBopObj.CostingPartDetails.TotalConversionCost)
          partOrBopObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
          partOrBopObj.CostingPartDetails.TotalConversionCostWithQuantity = partOrBopObj.CostingPartDetails.TotalConversionCost  
          partOrBopObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost *partOrBopObj.Quantity;
          i.CostingChildPartDetails = Object.assign([...i.CostingChildPartDetails],{[partOrBopIndex]:partOrBopObj})
          setOperationCostInDataList(operationGrid, params, i.CostingChildPartDetails) //TODO :OPTIMAZATION
        }
        else if(item.PartType ==='Sub Assembly' && params.BOMLevel === LEVEL1){
          //ASSEMBLY CALCULATION WILL COME HERE 
         
        }else if(item.PartType === 'Sub Assembly' && params.BOMLevel !== LEVEL1){ // INNER SUBASSEMBLY WILL COME HERE
        }
        else if(item.PartType === 'Part' && tempIndex !==-1){  
          let tempObj= i.CostingChildPartDetails[tempIndex]
           let partTempIndex=tempObj.CostingChildPartDetails.findIndex((x)=>x.PartNumber === item.PartNumber && x.PartType === 'Part')
          let partTempObj = tempObj.CostingChildPartDetails[partTempIndex]
          // //PART CALCULATION WILL COME HERE
           let GrandTotalCost = checkForNull(partTempObj.CostingPartDetails.TotalRawMaterialsCost)  + checkForNull(partTempObj.CostingPartDetails.TotalBoughtOutPartCost)+ checkForNull(operationGrid.NetConversionCost) 
           
            partTempObj.CostingPartDetails.CostingConversionCost = { ...operationGrid, CostingOperationCostResponse: operationGrid.CostingOperationCostResponse};
            partTempObj.CostingPartDetails.TotalConversionCost = operationGrid.NetConversionCost;
            partTempObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
            partTempObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost *partTempObj.Quantity;
            tempObj.CostingChildPartDetails = Object.assign([...tempObj.CostingChildPartDetails],{[partTempIndex]:partTempObj})

           //SUBAMMSEMBLY CALCULATION WILL COME HERE 
            tempObj.CostingPartDetails.TotalConversionCost =  getCCTotalCostForAssembly(tempObj.CostingChildPartDetails, params);
            tempObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = tempObj.CostingPartDetails.TotalBoughtOutPartCost  + checkForNull(i.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(i.CostingPartDetails.TotalConversionCost)

            //BELOW KEYS FOR COST WITH QUANTITY
            tempObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity =  tempObj.CostingPartDetails.TotalCalculatedRMBOPCCCost* tempObj.Quantity;
            tempObj.CostingPartDetails.TotalConversionCostWithQuantity =  getCCTotalCostForAssemblyWithQuantity(tempObj.CostingChildPartDetails, params)
           
        
            i.CostingChildPartDetails = Object.assign([...i.CostingChildPartDetails],{[tempIndex]:tempObj})
          setOperationCostInDataList(operationGrid, params, i.CostingChildPartDetails) //TODO :OPTIMAZATION
        }

        else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {
          let GrandTotalCost = checkForNull(i.TotalRawMaterialsCost) +
            checkForNull(i.TotalBoughtOutPartCost) +
            checkForNull(operationGrid && operationGrid.NetConversionCost !== null ? operationGrid.NetConversionCost : 0)

          let data = operationGrid && operationGrid.CostingOperationCostResponse && operationGrid.CostingOperationCostResponse.map(el => {
            return el;
          })

          i.GrandTotalCost = GrandTotalCost;
          i.CostingPartDetails.CostingConversionCost = { ...operationGrid, CostingOperationCostResponse: data };
          i.TotalConversionCost = operationGrid.NetConversionCost !== null ? operationGrid.NetConversionCost : 0;
          i.CostingPartDetails.TotalConversionCost = operationGrid.NetConversionCost !== null ? operationGrid.NetConversionCost : 0;
          i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost * i.CostingPartDetails.Quantity;

        } 
        else {
          setOperationCostInDataList(operationGrid, params, i.CostingChildPartDetails)
        }
        return i;
      });
    } catch (error) {

    }
    return tempArr;
  }

  const setOtherOperationCost = (otherOperationGrid, params,item) => {
    let arr = setOtherOperationCostInDataList(otherOperationGrid, params, RMCCTabData,item)
    if(RMCCTabData[0].PartNumber === params.PartNumber && RMCCTabData[0].BOMLevel === params.BOMLevel){
      dispatch(setRMCCData(arr, () => { }))
    }else{
          const arr1 = assemblyCalculation(arr,'CC') // THIS FUNCTION IS FOR ASSEMBLY CALCULATION
      dispatch(setRMCCData(arr1, () => { }))
    }
  }

  const setOtherOperationCostInDataList = (otherOperationGrid, params, arr,item) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {
        let tempIndex=i.CostingChildPartDetails.findIndex((x)=>x.PartNumber === item.AssemblyPartNumber && x.PartType === 'Sub Assembly')
        
        if((item.PartType ==='Part' || item.PartType ==='BOP') && item.BOMLevel === LEVEL1){
          let partOrBopIndex = i.CostingChildPartDetails.findIndex((x)=>x.PartNumber === item.PartNumber && (x.PartType==='Part'||x.PartType==='BOP'))
          let partOrBopObj = i.CostingChildPartDetails[partOrBopIndex]
          partOrBopObj.CostingPartDetails.TotalOtherOperationCost =otherOperationGrid.OtherOperationCostTotal
          partOrBopObj.CostingPartDetails.TotalConversionCost =  otherOperationGrid.NetConversionCost
          let data = otherOperationGrid && otherOperationGrid.CostingOperationCostResponse && otherOperationGrid.CostingOperationCostResponse.map(el => {
            return el;
          })
          partOrBopObj.CostingPartDetails.CostingConversionCost = { ...otherOperationGrid, OtherOperationCostResponse: data };
          let GrandTotalCost = checkForNull(partOrBopObj.CostingPartDetails.TotalRawMaterialsCost) + checkForNull(partOrBopObj.CostingPartDetails.TotalBoughtOutPartCost)  + checkForNull(partOrBopObj.CostingPartDetails.TotalConversionCost)
          partOrBopObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
          partOrBopObj.CostingPartDetails.TotalConversionCostWithQuantity = partOrBopObj.CostingPartDetails.TotalConversionCost  
          partOrBopObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost *partOrBopObj.Quantity;
          i.CostingChildPartDetails = Object.assign([...i.CostingChildPartDetails],{[partOrBopIndex]:partOrBopObj})
          setOtherOperationCostInDataList(otherOperationGrid, params, i.CostingChildPartDetails) //TODO :OPTIMAZATION
        }
        else if(item.PartType ==='Sub Assembly' && params.BOMLevel === LEVEL1){
          //ASSEMBLY CALCULATION WILL COME HERE 
         
        }else if(item.PartType === 'Sub Assembly' && params.BOMLevel !== LEVEL1){ // INNER SUBASSEMBLY WILL COME HERE
        }
        else if(item.PartType === 'Part' && tempIndex !==-1){  
          let tempObj= i.CostingChildPartDetails[tempIndex]
           let partTempIndex=tempObj.CostingChildPartDetails.findIndex((x)=>x.PartNumber === item.PartNumber && x.PartType === 'Part')
          let partTempObj = tempObj.CostingChildPartDetails[partTempIndex]
          // //PART CALCULATION WILL COME HERE
           let GrandTotalCost = checkForNull(partTempObj.CostingPartDetails.TotalRawMaterialsCost)  + checkForNull(partTempObj.CostingPartDetails.TotalBoughtOutPartCost)+ checkForNull(otherOperationGrid.NetConversionCost) 
           
            partTempObj.CostingPartDetails.CostingConversionCost = { ...otherOperationGrid, CostingOtherOperationCostResponse: otherOperationGrid.CostingOtherOperationCostResponse};
            partTempObj.CostingPartDetails.TotalConversionCost = otherOperationGrid.NetConversionCost;
            partTempObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
            partTempObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = GrandTotalCost *partTempObj.Quantity;
            tempObj.CostingChildPartDetails = Object.assign([...tempObj.CostingChildPartDetails],{[partTempIndex]:partTempObj})

           //SUBAMMSEMBLY CALCULATION WILL COME HERE 
            tempObj.CostingPartDetails.TotalConversionCost =  getCCTotalCostForAssembly(tempObj.CostingChildPartDetails, params);
            tempObj.CostingPartDetails.TotalCalculatedRMBOPCCCost = tempObj.CostingPartDetails.TotalBoughtOutPartCost  + checkForNull(i.CostingPartDetails.TotalBoughtOutPartCost) + checkForNull(i.CostingPartDetails.TotalConversionCost)

            //BELOW KEYS FOR COST WITH QUANTITY
            tempObj.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity =  tempObj.CostingPartDetails.TotalCalculatedRMBOPCCCost* tempObj.Quantity;
            tempObj.CostingPartDetails.TotalConversionCostWithQuantity =  getCCTotalCostForAssemblyWithQuantity(tempObj.CostingChildPartDetails, params)
           
        
            i.CostingChildPartDetails = Object.assign([...i.CostingChildPartDetails],{[tempIndex]:tempObj})
            setOtherOperationCostInDataList(otherOperationGrid, params, i.CostingChildPartDetails) //TODO :OPTIMAZATION
        }


        // if (i.IsAssemblyPart === true) {

        //   i.CostingPartDetails.TotalConversionCost = getCCTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(otherOperationGrid.NetConversionCost), params);
        //   i.CostingPartDetails.TotalOperationCost = getOperationTotalCost(i.CostingChildPartDetails, checkForNull(otherOperationGrid.OperationCostTotal), params);
        //   i.CostingPartDetails.TotalCalculatedRMBOPCCCost = getTotalCostForAssembly(i.CostingChildPartDetails, i.CostingPartDetails, 'CC', checkForNull(otherOperationGrid.NetConversionCost), params);
        //   i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = getCCCostWithQuantity(i.CostingChildPartDetails, checkForNull(otherOperationGrid.NetConversionCost), params);
        //   setOtherOperationCostInDataList(otherOperationGrid, params, i.CostingChildPartDetails)

        // } 
        else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

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

        } 
        else {
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
     let arr1= assemblyCalculation(arr,'BOP')
    dispatch(setRMCCData(arr1, () => { }))
  }

  /**
  * @method setAssembly
  * @description SET PART DETAILS
  */
  const setAssembly = (BOMLevel, PartNumber, Children, RMCCTabData) => {
    // console.log('Children: ', Children);
    let tempArr = [];
    try {

      tempArr = RMCCTabData && RMCCTabData.map(i => {

        const { CostingChildPartDetails,  } = Children;
        const params = { BOMLevel: BOMLevel, PartNumber: PartNumber };

        if (i.IsAssemblyPart === true && i.PartNumber === PartNumber && i.BOMLevel === BOMLevel) {
          console.log("in IF BLOCK",RMCCTabData);
          i.CostingChildPartDetails = BOMLevel !== LEVEL0 ? ChangeBOMLeveL(Children.CostingChildPartDetails, BOMLevel) : i.CostingChildPartDetails;
          i.CostingPartDetails = Children.CostingPartDetails;

          // i.CostingPartDetails.TotalRawMaterialsCost = getRMTotalCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.TotalRawMaterialsCost, params);
          // i.CostingPartDetails.TotalRawMaterialsCost = setRMCostForAssembly(CostingChildPartDetails);
          // i.CostingPartDetails.TotalBoughtOutPartCost = getBOPTotalCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.TotalBoughtOutPartCost, params);
          // i.CostingPartDetails.TotalBoughtOutPartCost = setBOPCostAssembly (CostingChildPartDetails);
          // i.CostingPartDetails.TotalProcessCost = getProcessTotalCost(CostingChildPartDetails, Children.CostingPartDetails.TotalProcessCost, params);
          // i.CostingPartDetails.TotalOperationCost = getOperationTotalCost(CostingChildPartDetails, Children.CostingPartDetails.TotalOperationCost, params);
          // i.CostingPartDetails.TotalToolCost = getToolTotalCost(CostingChildPartDetails, Children.CostingPartDetails.TotalToolCost, params);

          // i.CostingPartDetails.TotalConversionCost = getProcessTotalCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.TotalProcessCost, params) +
          //   getOperationTotalCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.TotalOperationCost, params) +
          //   GetOperationCostTotal(CostingPartDetails.CostingOperationCostResponse) +
          //   GetToolCostTotal(CostingPartDetails.CostingToolCostResponse);

          // i.CostingPartDetails.TotalConversionCost = getProcessTotalCost(CostingChildPartDetails, CostingPartDetails.TotalProcessCost, params) +
          //   getOperationTotalCost(CostingChildPartDetails, CostingPartDetails.TotalOperationCost, params) +
          //   getOperationTotalCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.TotalOperationCostPerAssembly, params) +
          //   getToolTotalCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.TotalToolCostPerAssembly, params);
          // i.CostingPartDetails.TotalConversionCost = setConversionCostAssembly(CostingChildPartDetails) 
          // +
            // getOperationTotalCost(CostingChildPartDetails, CostingPartDetails.TotalOperationCost, params) +
            // getOperationTotalCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.TotalOperationCostPerAssembly, params) +
            // getToolTotalCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.TotalToolCostPerAssembly, params);
          // checkForNull(i.CostingPartDetails.TotalOperationCostPerAssembly) +
          // checkForNull(i.CostingPartDetails.TotalToolCostPerAssembly);

          // i.CostingPartDetails.TotalCalculatedRMBOPCCCost = (getTotalCostForAssembly(CostingChildPartDetails, CostingPartDetails, 'ALL', 0, params)) +
          //   checkForNull(CostingPartDetails.TotalOperationCostPerAssembly);
        
          // i.CostingPartDetails.TotalCalculatedRMBOPCCCost = getRMTotalCostForAssembly(CostingChildPartDetails, CostingPartDetails.TotalRawMaterialsCost, params) +
          //   getBOPTotalCostForAssembly(CostingChildPartDetails, CostingPartDetails.TotalBoughtOutPartCost, params) +
          //   getProcessTotalCost(CostingChildPartDetails, CostingPartDetails.TotalProcessCost, params) +
          //   getOperationTotalCost(CostingChildPartDetails, CostingPartDetails.TotalOperationCost, params) +
          //   getOperationTotalCostForAssembly(CostingChildPartDetails, CostingPartDetails.TotalOperationCostPerAssembly, params) +
          //   getToolTotalCostForAssembly(CostingChildPartDetails, CostingPartDetails.TotalToolCostPerAssembly, params);
         

          i.IsAssemblyPart = true;
          i.IsOpen = !i.IsOpen;
          // i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = getRMBOPCCTotalCostWithQuantity(CostingChildPartDetails) * i.CostingPartDetails.Quantity;
          // i.CostingPartDetails.TotalRawMaterialsCostWithQuantity = getRMTotalCostForAssemblyWithQuantity(CostingChildPartDetails, 0, params);
          // i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = getBOPTotalCostForAssemblyWithQuantity(CostingChildPartDetails, 0, params);
          // i.CostingPartDetails.TotalConversionCostWithQuantity = getCCTotalCostForAssemblyWithQuantity(CostingChildPartDetails, 0, params);
          // i.CostingPartDetails.TotalRawMaterialsCostWithQuantity =    i.CostingPartDetails.TotalRawMaterialsCost *  i.CostingPartDetails.Quantity;
          // i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity =  i.CostingPartDetails.TotalBoughtOutPartCost *  i.CostingPartDetails.Quantity;
          // i.CostingPartDetails.TotalConversionCostWithQuantity =  i.CostingPartDetails.TotalConversionCost *  i.CostingPartDetails.Quantity;
          // const total = i.CostingPartDetails.TotalRawMaterialsCostWithQuantity +i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity +  i.CostingPartDetails.TotalConversionCostWithQuantity
          // i.CostingPartDetails.TotalCalculatedRMBOPCCCost = total
          // i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity =(total) * i.CostingPartDetails.Quantity;
          setAssembly(BOMLevel, PartNumber, Children, i.CostingChildPartDetails)
        } 
         else {
          // i.CostingPartDetails.TotalBoughtOutPartCost = setBOPCostAssembly(i.CostingChildPartDetails)
          // i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity =    i.CostingPartDetails.TotalBoughtOutPartCost * i.CostingPartDetails.Quantity
          const total = i.CostingPartDetails.TotalRawMaterialsCostWithQuantity +i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity +  i.CostingPartDetails.TotalConversionCostWithQuantity
          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = total
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
  const setPartDetails = (BOMLevel, PartNumber, Data,item) => {
    let arr = formatData(BOMLevel, PartNumber, Data, RMCCTabData,item)
    console.log('arr: ', arr);
    // let arr1= assemblyCalculation(arr)
    dispatch(setRMCCData(arr, () => { }))
  }

  /**
  * @method formatData
  * @description FORMATE DATA FOR SET PART DETAILS
  */
  const formatData = (BOMLevel, PartNumber, Data, RMCCTabData,item) => {
 
    let tempArr = [];
    try {
      tempArr = RMCCTabData && RMCCTabData.map(i => {
        const params = { BOMLevel: BOMLevel, PartNumber: PartNumber };
        const tempObj=i.CostingChildPartDetails.filter((x)=>x.PartNumber === item.AssemblyPartNumber && x.PartType === 'Sub Assembly')
     
        if (i.IsAssemblyPart === true) {
          // if(tempObj.length >0){
            i.CostingPartDetails.TotalRawMaterialsCost = getRMTotalCostForAssembly(i.CostingChildPartDetails, Data.TotalRawMaterialsCost, params);
            i.CostingPartDetails.TotalConversionCost =  checkForNull(i.CostingPartDetails.TotalOperationCostPerAssembly) +
            checkForNull(i.CostingPartDetails.TotalToolCostPerAssembly) +
            getProcessTotalCost(i.CostingChildPartDetails, Data.TotalProcessCost, params) +
            getOperationTotalCost(i.CostingChildPartDetails, Data.TotalOperationCost, params)+ getOtherOperationTotalCost(i.CostingChildPartDetails, Data.TotalOtherOperationCost, params)
          
            i.CostingPartDetails.TotalConversionCostWithQuantity = i.CostingPartDetails.TotalConversionCost * i.CostingPartDetails.Quantity
  
  
             i.CostingPartDetails.TotalCalculatedRMBOPCCCost = checkForNull(i.CostingPartDetails.TotalOperationCostPerAssembly) +checkForNull(i.CostingPartDetails.TotalToolCostPerAssembly) +  checkForNull(i.CostingPartDetails.TotalRawMaterialsCostWithQuantity)+checkForNull(i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity)+ checkForNull(i.CostingPartDetails.TotalConversionCostWithQuantity)
         
              
            i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = Data.TotalCalculatedRMBOPCCCost * i.CostingPartDetails.Quantity;
           
          // i.CostingPartDetails.TotalConversionCost = checkForNull(i.CostingPartDetails.TotalConversionCost) +
          // getCCTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(Data.CostingConversionCost.NetConversionCost), params);


          formatData(BOMLevel, PartNumber, Data, i.CostingChildPartDetails,item)

        } else if (i.PartNumber === PartNumber && i.BOMLevel === BOMLevel) {
          console.log("Coming in ELSSE If in FOrmat data");
          i.CostingPartDetails = { ...Data, Quantity: i.CostingPartDetails.Quantity };
          i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = Data.TotalCalculatedRMBOPCCCost * i.CostingPartDetails.Quantity;
        
          i.IsOpen = !i.IsOpen;

        } else {
          console.log("Coming in ELSSE in FOrmat data");
          i.IsOpen = false;
          formatData(BOMLevel, PartNumber, Data, i.CostingChildPartDetails,item)
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
    // let arr1 = assemblyCalculation(arr,'CC')
    dispatch(setRMCCData(arr, () => { 
      const tabData = RMCCTabData[0]
      const surfaceTabData= SurfaceTabData[0]
      const overHeadAndProfitTabData=OverheadProfitTabData[0]
      const discountAndOtherTabData =DiscountCostData

      
      let assemblyWorkingRow=[]
      tabData && tabData.CostingChildPartDetails && tabData.CostingChildPartDetails.map((item)=>{
        let subAssemblyObj ={
        "CostingId":item.CostingId,
        "CostingNumber": "", // Need to find out how to get it.
        "TotalRawMaterialsCostWithQuantity": item.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
        "TotalBoughtOutPartCostWithQuantity": item.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
        "TotalConversionCostWithQuantity": item.CostingPartDetails?.TotalConversionCostWithQuantity,
         "TotalCalculatedRMBOPCCCostPerPC": item.CostingPartDetails?.TotalRawMaterialsCostWithQuantity +item.CostingPartDetails?.TotalBoughtOutPartCost+item.CostingPartDetails?.TotalConversionCost,
        "TotalCalculatedRMBOPCCCostPerAssembly": item.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
        "SurfaceTreatmentCostPerAssembly": 0,
        "TransportationCostPerAssembly": 0,
        "TotalSurfaceTreatmentCostPerAssembly": 0,
        "TotalCostINR": item.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity
        }
        assemblyWorkingRow.push(subAssemblyObj)
        return assemblyWorkingRow
      })
      let assemblyRequestedData = {
        
          "TopRow": {
          "CostingId":tabData.CostingId,
          "CostingNumber": tabData.CostingNumber,
          "TotalRawMaterialsCostWithQuantity": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
          "TotalBoughtOutPartCostWithQuantity": tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
          "TotalConversionCostWithQuantity": tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
          "TotalCalculatedRMBOPCCCostPerPC": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity +tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity+ tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
          "TotalCalculatedRMBOPCCCostPerAssembly": tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
          "NetRMCostPerAssembly": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
          "NetBOPCostAssembly": tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
          "NetConversionCostPerAssembly":tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
          "NetRMBOPCCCost":tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
          "SurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.SurfaceTreatmentCost,
          "TransportationCostPerAssembly": surfaceTabData.CostingPartDetails?.TransportationCost,
          "TotalSurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
          "NetSurfaceTreatmentCost": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
          "NetOverheadAndProfits": overHeadAndProfitTabData.CostingPartDetails?.NetOverheadAndProfitCost,
          "NetPackagingAndFreightCost": PackageAndFreightTabData && PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost,
          "NetToolCost": ToolTabData[0]?.CostingPartDetails?.TotalToolCost,
          "NetOtherCost": discountAndOtherTabData?.AnyOtherCost,
          "NetDiscounts":discountAndOtherTabData?.HundiOrDiscountValue,
          "TotalCostINR": netPOPrice,
          "TabId": 1
          },
          "WorkingRows": assemblyWorkingRow,
          "BOPHandlingCharges": {
            "AssemblyCostingId": tabData.CostingId,
            "IsApplyBOPHandlingCharges": true,
            "BOPHandlingPercentage": getAssemBOPCharge.BOPHandlingPercentage,
            "BOPHandlingCharges": getAssemBOPCharge.BOPHandlingCharges
          },
          "LoggedInUserId": loggedInUserId()
        
      }
      dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData,res =>{}))
    }))
  }

  const setAssemblyOperationCostInDataList = (OperationGrid, params, arr, IsGridChanged) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {
        console.log('i: ', i);
        if (i.IsAssemblyPart === true && i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let GrandTotalCost = checkForNull(i.CostingPartDetails.TotalRawMaterialsCostWithQuantity) +
            checkForNull(i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) +
            checkForNull(i.CostingPartDetails.TotalOperationCostPerAssembly) +
            checkForNull(i.CostingPartDetails.TotalToolCostPerAssembly) + checkForNull(i.CostingPartDetails.TotalConversionCostWithQuantity)

          i.CostingPartDetails.CostingOperationCostResponse = OperationGrid;

          i.CostingPartDetails.TotalConversionCost = GetOperationCostTotal(OperationGrid) +
            checkForNull(i.CostingPartDetails.TotalToolCostPerAssembly) + checkForNull(i.CostingPartDetails.TotalConversionCostWithQuantity)
          i.CostingPartDetails.TotalConversionCostWithQuantity = i.CostingPartDetails.TotalConversionCost * i.CostingPartDetails.Quantity
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
          i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = i.CostingPartDetails.TotalCalculatedRMBOPCCCost * i.CostingPartDetails.Quantity

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
          Toaster.success(MESSAGES.RMCC_TAB_COSTING_SAVE_SUCCESS);
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

  const bopHandlingDrawer = ()=>{
    setIsOpenBOPDrawer(true)
  }

  const handleBOPCalculationAndClose= (e='')=>{
    console.log("Close drawer");
      setIsOpenBOPDrawer(false)
    //  setBOPCostWithAsssembly()
  }

  useEffect(()=>{
    if(Object.keys(getAssemBOPCharge).length>0){
      setBOPCostWithAsssembly()
    }
  },[getAssemBOPCharge])

  const setBOPCostWithAsssembly = () =>{
   
    let arr = assemblyCalculation(RMCCTabData,'BOP')
    dispatch(setRMCCData(arr, () => { }))
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
                            <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{`Part Number`}</th>
                            <th className="py-3 align-middle" style={{ minWidth: '70px' }}>{`Level`}</th>
                            <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{`Type`}</th>
                            <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{`RM Cost`}</th>
                            <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{`BOP Cost`}</th>
                            <th className="py-3 align-middle" style={{ minWidth: '150px' }}>{`Conversion Cost`}</th>
                            <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`Quantity`} {/*<button class="Edit ml-1 mb-0 align-middle" type="button" title="Edit Costing"></button>*/}</th>
                            <th className="py-3 align-middle" style={{ minWidth: '150px' }}>{`RM + CC Cost/Pc`}</th>
                            {costData.IsAssemblyPart && <th className="py-3 align-middle" style={{ minWidth: '200px' }}>{`RM + CC Cost/Assembly`}</th>}
                             {
                             costData.IsAssemblyPart && <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{
                                <button
                                type="button"
                                className={'user-btn add-oprn-btn'}
                                onClick={bopHandlingDrawer}>
                                <div className={'plus'}></div>{`${CostingViewMode ? 'View BOP Handling' : 'Add BOP Handling'}`}</button>}
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
