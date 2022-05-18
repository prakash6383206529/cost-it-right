import React, { useEffect, useContext, useState } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import {
  setRMCCData, saveComponentCostingRMCCTab, setComponentItemData,
  saveDiscountOtherCostTab, setComponentDiscountOtherItemData, CloseOpenAccordion, saveAssemblyPartRowCostingCalculation, isDataChange
} from '../../actions/Costing';
import { costingInfoContext, NetPOPriceContext } from '../CostingDetailStepTwo';
import { checkForNull, CheckIsCostingDateSelected, loggedInUserId } from '../../../../helper';
import { LEVEL0, LEVEL1, } from '../../../../config/constants';
import Toaster from '../../../common/Toaster';
import { MESSAGES } from '../../../../config/message';
import { ViewCostingContext } from '../CostingDetails';
import DayTime from '../../../common/DayTimeWrapper'
import AddBOPHandling from '../Drawers/AddBOPHandling';
import AssemblyTechnology from '../CostingHeadCosts/SubAssembly/AssemblyTechnology';
import { tempObject } from '../../../../config/masterData';
import { setSubAssemblyTechnologyArray } from '../../actions/SubAssembly';

function TabAssemblyTechnology(props) {

  const { handleSubmit } = useForm()

  const dispatch = useDispatch()

  const { ComponentItemDiscountData, ErrorObjRMCC, CostingEffectiveDate, getAssemBOPCharge, SurfaceTabData, OverheadProfitTabData, PackageAndFreightTabData, ToolTabData, DiscountCostData, checkIsDataChange } = useSelector(state => state.costing)




  const [isOpenBOPDrawer, setIsOpenBOPDrawer] = useState(false)
  const [costPerPiece, setcostPerPiece] = useState('')
  const [operationCostValue, setOperationCostValue] = useState('')
  const [processCostValue, setprocessCostValue] = useState('')

  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const netPOPrice = useContext(NetPOPriceContext);
  const { subAssemblyTechnologyArray } = useSelector(state => state.SubAssembly)



  useEffect(() => {
    dispatch(setSubAssemblyTechnologyArray(tempObject, res => { }))

    // API FOR FIRST TIME DATA LOAD
    // dispatch(getSubAssemblyAPI(tempObject, res => { }))         //WIP
  }, [])


  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    // CostingViewMode CONDITION IS USED TO AVOID CALCULATION IN VIEWMODE
    if (CostingViewMode === false) {
      let TopHeaderValues = subAssemblyTechnologyArray && subAssemblyTechnologyArray.length > 0 && subAssemblyTechnologyArray[0].CostingPartDetails !== undefined ? subAssemblyTechnologyArray[0].CostingPartDetails : null;

      let topHeaderData = {};


      if (costData.IsAssemblyPart) {
        topHeaderData = {
          NetRawMaterialsCost: TopHeaderValues?.EditPartCost ? TopHeaderValues.EditPartCost : 0,
          NetBoughtOutPartCost: TopHeaderValues?.CostPerAssemblyBOP ? TopHeaderValues.CostPerAssemblyBOP : 0,
          NetConversionCost: (TopHeaderValues?.operationCostValue || TopHeaderValues?.processCostValue) ? (checkForNull(TopHeaderValues?.processCostValue) + checkForNull(TopHeaderValues?.operationCostValue)) : 0,
          NetToolsCost: TopHeaderValues?.TotalToolCost ? TopHeaderValues.TotalToolCost : 0,
          NetTotalRMBOPCC: TopHeaderValues?.CostPerAssembly ? TopHeaderValues.CostPerAssembly : 0,
          OtherOperationCost: TopHeaderValues?.CostingConversionCost?.OtherOperationCostTotal ? TopHeaderValues.CostingConversionCost.OtherOperationCostTotal : 0,   //HELP
          ProcessCostTotal: TopHeaderValues?.processCostValue ? TopHeaderValues?.processCostValue : 0,
          OperationCostTotal: TopHeaderValues?.operationCostValue ? TopHeaderValues?.operationCostValue : 0,
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
  }, [subAssemblyTechnologyArray]);



  const getCostPerPiece = (value) => {
    setcostPerPiece(value)
  }

  const setOperationCostFunction = (value, gridData) => {
    // gridData contains Operaion Grid
    setOperationCostValue(value)
    let temp = subAssemblyTechnologyArray

    temp[0].CostingPartDetails.CostPerAssembly = checkForNull(temp[0].CostingPartDetails.CostPerAssembly) - checkForNull(temp[0].operationCostValue)
    temp[0].operationCostValue = value
    temp[0].CostingPartDetails.operationCostValue = value
    temp[0].CostingPartDetails.CostPerAssembly = checkForNull(temp[0].CostingPartDetails.CostPerAssembly) + checkForNull(value)
    dispatch(setSubAssemblyTechnologyArray(temp, res => { }))

  }

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

  const setBOPCostAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'BOP' || item.PartType === 'Part') {
        return accummlator + item.CostingPartDetails.TotalBoughtOutPartCost * item.Quantity
      } else {
        return accummlator + item.CostingPartDetails.TotalBoughtOutPartCostWithQuantity * item.Quantity
      }

    }, 0)
    return total
  }

  const setConversionCostAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {

      if (item.PartType === 'Part') {
        return accummlator + item.CostingPartDetails.TotalConversionCost * item.Quantity
      } else {
        return accummlator + checkForNull(item.CostingPartDetails.TotalConversionCostWithQuantity * item.Quantity)
      }
    }, 0)
    return total
  }


  const setOperationCostForAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {

      return accummlator + checkForNull(item.CostingPartDetails.TotalOperationCostPerAssembly * item.Quantity)

    }, 0)
    return total
  }

  const setOtherOperationCostAssy = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + checkForNull(item.CostingPartDetails.TotalOtherOperationCost * item.Quantity)
      } else {

        return accummlator + checkForNull(item.CostingPartDetails.TotalOtherOperationCostPerSubAssembly * item.Quantity)
      }
    }, 0)
    return total
  }

  const childComponentConversionCostPerAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + checkForNull(item.CostingPartDetails.TotalConversionCost * item.Quantity)
      } else {

        return accummlator + checkForNull(item.CostingPartDetails.TotalOperationCostComponent * item.Quantity)
      }
    }, 0)
    return total
  }

  const assemblyCalculation = (arr, type = '') => {

    let tempArr = []
    tempArr = arr && arr.map((i) => {
      switch (type) {
        case 'RM2':
          i.CostingPartDetails.TotalRawMaterialsCost = setRMCostForAssembly(i.CostingChildPartDetails)
          i.CostingPartDetails.TotalRawMaterialsCostWithQuantity = i.CostingPartDetails.TotalRawMaterialsCost * i.CostingPartDetails.Quantity;

          break;
        case 'BOP2':
          i.CostingPartDetails.TotalBoughtOutPartCost = setBOPCostAssembly(i.CostingChildPartDetails)
          i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity = (i.CostingPartDetails.TotalBoughtOutPartCost * i.CostingPartDetails.Quantity) + checkForNull(getAssemBOPCharge.BOPHandlingCharges)

          break;
        case 'CC2':

          i.CostingPartDetails.TotalConversionCost = setConversionCostAssembly(i.CostingChildPartDetails)

          i.CostingPartDetails.TotalOperationCostComponent = childComponentConversionCostPerAssembly(i.CostingChildPartDetails)
          i.CostingPartDetails.TotalOperationCostPerAssembly = checkForNull(i.CostingPartDetails.TotalOperationCostPerAssembly)
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
      // i.CostingPartDetails.TotalOtherOperationCostPerAssembly = setOtherOperationCostAssy(i.CostingChildPartDetails)
      // const total = i.CostingPartDetails.TotalRawMaterialsCostWithQuantity + checkForNull(i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) + checkForNull(i.CostingPartDetails.TotalConversionCostWithQuantity)

      // i.CostingPartDetails.TotalCalculatedRMBOPCCCost = total
      // //BELOW KEYS FOR COST WITH QUANTITY
      // i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = total * i.CostingPartDetails.Quantity

      return i
    })

    return tempArr
  }

  /**
  * @method toggleAssembly
  * @description SET PART DETAILS
  */
  const toggleAssembly = (BOMLevel, PartNumber, Children = {}) => {

    let arr = setAssembly(BOMLevel, PartNumber, Children, subAssemblyTechnologyArray)
    // let arr1 = assemblyCalculation(arr, 'BOP')
    // dispatch(setRMCCData(arr1, () => { }))
  }

  /**
  * @method setAssembly
  * @description SET PART DETAILS
  */
  const setAssembly = (BOMLevel, PartNumber, Children, subAssemblyTechnologyArray) => {

    let tempArr = [];
    try {

      tempArr = subAssemblyTechnologyArray && subAssemblyTechnologyArray.map(i => {

        const { CostingChildPartDetails, } = Children;
        const params = { BOMLevel: BOMLevel, PartNumber: PartNumber };

        if (i.IsAssemblyPart === true && i.PartNumber === PartNumber && i.BOMLevel === BOMLevel) {

          i.CostingChildPartDetails = BOMLevel !== LEVEL0 ? ChangeBOMLeveL(Children.CostingChildPartDetails, BOMLevel) : i.CostingChildPartDetails;
          // i.CostingPartDetails = Children.CostingPartDetails;
          i.IsAssemblyPart = true;
          i.IsOpen = !i.IsOpen;

          setAssembly(BOMLevel, PartNumber, Children, i.CostingChildPartDetails)
        }
        else {
          const total = i.CostingPartDetails.TotalRawMaterialsCostWithQuantity + i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity + i.CostingPartDetails.TotalConversionCostWithQuantity
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
  * @method setAssemblyOperationCost
  * @description SET RM COST
  */
  const setAssemblyOperationCost = (OperationGrid, params, IsGridChanged) => {
    let arr = setAssemblyOperationCostInDataList(OperationGrid, params, subAssemblyTechnologyArray, IsGridChanged)
    let arr1 = assemblyCalculation(arr, 'CC')

    dispatch(setRMCCData(arr1, () => {

    }))
  }

  const setAssemblyOperationCostInDataList = (OperationGrid, params, arr, IsGridChanged) => {


    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {

        // const tempObj = i.CostingChildPartDetails.filter((x) => x.PartNumber === params.PartNumber && x.PartType === 'Sub Assembly')
        // 
        // if(tempObj.length>0){
        //   let GrandTotalCost = checkForNull(tempObj[0].CostingPartDetails.TotalRawMaterialsCostWithQuantity) +
        //   checkForNull(tempObj[0].CostingPartDetails.TotalBoughtOutPartCostWithQuantity) +checkForNull(tempObj[0].CostingPartDetails.TotalConversionCostWithQuantity)

        //     tempObj[0].CostingPartDetails.CostingOperationCostResponse = OperationGrid;
        //     tempObj[0].CostingPartDetails.TotalOperationCostComponent = getCCTotalCostForAssembly(tempObj[0].CostingChildPartDetails)
        //     tempObj[0].CostingPartDetails.TotalOperationCostPerAssembly = GetOperationCostTotal(OperationGrid);
        //     tempObj[0].CostingPartDetails.TotalConversionCost = getCCTotalCostForAssembly(tempObj[0].CostingChildPartDetails) +  tempObj[0].CostingPartDetails.TotalOperationCostPerAssembly
        //     tempObj[0].CostingPartDetails.TotalConversionCostWithQuantity = tempObj[0].CostingPartDetails.TotalConversionCost * tempObj[0].CostingPartDetails.Quantity
        //     
        //     i.CostingPartDetails ={...i.CostingPartDetails,tempObj}
        //     i.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
        //     i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = i.CostingPartDetails.TotalCalculatedRMBOPCCCost * i.CostingPartDetails.Quantity
        //     setAssemblyOperationCostInDataList(OperationGrid, params, i.CostingChildPartDetails, IsGridChanged)


        // }
        if (i.IsAssemblyPart === true && i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel && IsGridChanged) {

          let GrandTotalCost = checkForNull(i.CostingPartDetails.TotalRawMaterialsCostWithQuantity) +
            checkForNull(i.CostingPartDetails.TotalBoughtOutPartCostWithQuantity) + checkForNull(i.CostingPartDetails.TotalConversionCostWithQuantity)

          i.CostingPartDetails.CostingOperationCostResponse = OperationGrid;
          //  i.CostingPartDetails.TotalConversionCost =  checkForNull(i.CostingPartDetails.TotalConversionCostWithQuantity)
          //  i.CostingPartDetails.TotalConversionCostWithQuantity = i.CostingPartDetails.TotalConversionCost * i.CostingPartDetails.Quantity
          // i.CostingPartDetails.TotalConversionCost = checkForNull(i.CostingPartDetails.TotalConversionCost) +
          //   (IsGridChanged ? GetOperationCostTotal(OperationGrid) : 0) +
          //   checkForNull(i.CostingPartDetails.TotalToolCostPerAssembly)
          // //- (IsGridChanged ? checkForNull(i.CostingPartDetails.TotalOperationCostPerAssembly) : 0);

          // i.CostingPartDetails.TotalConversionCost = checkForNull(i.CostingPartDetails.TotalProcessCost) +
          //   checkForNull(i.CostingPartDetails.TotalOperationCost) +
          //   GetOperationCostTotal(OperationGrid) +
          //   checkForNull(i.CostingPartDetails.TotalToolCostPerAssembly);

          if (i.PartType === 'Sub Assembly') {

            i.CostingPartDetails.TotalOperationCostComponent = getCCTotalCostForAssembly(i.CostingChildPartDetails)

            i.CostingPartDetails.TotalConversionCost = getCCTotalCostForAssembly(i.CostingChildPartDetails)
            i.CostingPartDetails.TotalConversionCostWithQuantity = i.CostingPartDetails.TotalConversionCost + GetOperationCostTotal(OperationGrid)
          }

          i.CostingPartDetails.TotalOperationCostPerAssembly = GetOperationCostTotal(OperationGrid);


          i.CostingPartDetails.TotalCalculatedRMBOPCCCost = GrandTotalCost;
          i.CostingPartDetails.TotalCalculatedRMBOPCCCostWithQuantity = i.CostingPartDetails.TotalCalculatedRMBOPCCCost * i.CostingPartDetails.Quantity

          // setAssemblyOperationCostInDataList(OperationGrid, params, i.CostingChildPartDetails, IsGridChanged)
        }
        else {
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
  * @method saveCosting
  * @description SAVE COSTING
  */
  const saveCosting = () => {

    if (ErrorObjRMCC && Object.keys(ErrorObjRMCC).length > 0) return false;

    // if (Object.keys(ComponentItemData).length > 0 && ComponentItemData.IsOpen !== false && checkIsDataChange === true) {
    //   let requestData = {
    //     "NetRawMaterialsCost": ComponentItemData.CostingPartDetails.TotalRawMaterialsCost,
    //     "NetBoughtOutPartCost": ComponentItemData.CostingPartDetails.TotalBoughtOutPartCost,
    //     "NetConversionCost": ComponentItemData.CostingPartDetails.TotalConversionCost,
    //     "NetOperationCost": ComponentItemData.CostingPartDetails.CostingConversionCost && ComponentItemData.CostingPartDetails.CostingConversionCost.OperationCostTotal !== undefined ? ComponentItemData.CostingPartDetails.CostingConversionCost.OperationCostTotal : 0,
    //     "NetProcessCost": ComponentItemData.CostingPartDetails.CostingConversionCost && ComponentItemData.CostingPartDetails.CostingConversionCost.ProcessCostTotal !== undefined ? ComponentItemData.CostingPartDetails.CostingConversionCost.ProcessCostTotal : 0,
    //     "NetOtherOperationCost": ComponentItemData.CostingPartDetails.CostingConversionCost && ComponentItemData.CostingPartDetails.CostingConversionCost.OtherOperationCostTotal !== undefined ? ComponentItemData.CostingPartDetails.CostingConversionCost.OtherOperationCostTotal : 0,
    //     "NetToolCost": ComponentItemData.CostingPartDetails.TotalToolCost,
    //     "NetTotalRMBOPCC": ComponentItemData.CostingPartDetails.TotalCalculatedRMBOPCCCost,
    //     "TotalCost": costData.IsAssemblyPart ? ComponentItemData.CostingPartDetails.TotalCalculatedRMBOPCCCost : netPOPrice,
    //     "LoggedInUserId": loggedInUserId(),
    //     "EffectiveDate": CostingEffectiveDate,

    //     "IsSubAssemblyComponentPart": costData.IsAssemblyPart,
    //     "CostingId": ComponentItemData.CostingId,
    //     "PartId": ComponentItemData.PartId,                              //ROOT ID
    //     "CostingNumber": costData.CostingNumber,                         //ROOT    
    //     "PartNumber": ComponentItemData.PartNumber,                      //ROOT

    //     // "AssemblyCostingId": ComponentItemData.BOMLevel === LEVEL1 ? costData.CostingId : ComponentItemData.AssemblyCostingId,                  //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
    //     "AssemblyCostingNumber": ComponentItemData.BOMLevel === LEVEL1 ? costData.CostingNumber : ComponentItemData.AssemblyCostingNumber,      //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
    //     "AssemblyPartId": ComponentItemData.BOMLevel === LEVEL1 ? ComponentItemData.PartId : ComponentItemData.AssemblyPartId,                               //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
    //     "AssemblyPartNumber": ComponentItemData.BOMLevel === LEVEL1 ? ComponentItemData.PartNumber : ComponentItemData.AssemblyPartNumber,                   //IF ITS L1 PART THEN ROOT ID ELSE JUST PARENT SUB ASSEMBLY ID
    //     "AssemblyCostingId": ComponentItemData.AssemblyCostingId,
    //     "SubAssemblyCostingId": ComponentItemData.SubAssemblyCostingId,
    //     "PlantId": costData.PlantId,
    //     "VendorId": costData.VendorId,
    //     "VendorCode": costData.VendorCode,
    //     "VendorPlantId": costData.VendorPlantId,
    //     "TechnologyId": ComponentItemData.TechnologyId,
    //     "Technology": ComponentItemData.Technology,
    //     "TypeOfCosting": costData.VendorType,
    //     "PlantCode": costData.PlantCode,
    //     "Version": ComponentItemData.Version,
    //     "ShareOfBusinessPercent": ComponentItemData.ShareOfBusinessPercent,
    //     CostingPartDetails: ComponentItemData.CostingPartDetails,
    //   }
    //   if (costData.IsAssemblyPart) {
    //     let assemblyWorkingRow = []
    //     const tabData = subAssemblyTechnologyArray[0]
    //     const surfaceTabData = SurfaceTabData[0]
    //     const overHeadAndProfitTabData = OverheadProfitTabData[0]
    //     const discountAndOtherTabData = DiscountCostData
    //     tabData && tabData.CostingChildPartDetails && tabData.CostingChildPartDetails.map((item) => {
    //       if (item.PartType === 'Sub Assembly') {
    //         let subAssemblyObj = {
    //           "CostingId": item.CostingId,
    //           "SubAssemblyCostingId": item.SubAssemblyCostingId,
    //           "CostingNumber": "", // Need to find out how to get it.
    //           "TotalRawMaterialsCostWithQuantity": item.PartType === 'Part' ? item.CostingPartDetails?.TotalRawMaterialsCost * item.CostingPartDetails.Quantity : item.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
    //           "TotalBoughtOutPartCostWithQuantity": item.PartType === 'Part' ? item.CostingPartDetails?.TotalBoughtOutPartCost * item.CostingPartDetails.Quantity : item.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
    //           "TotalConversionCostWithQuantity": item.PartType === 'Part' ? item.CostingPartDetails?.TotalConversionCost * item.CostingPartDetails.Quantity : item.CostingPartDetails?.TotalConversionCostWithQuantity,
    //           "TotalCalculatedRMBOPCCCostPerPC": item.CostingPartDetails?.TotalRawMaterialsCost + item.CostingPartDetails?.TotalBoughtOutPartCost + item.CostingPartDetails?.TotalConversionCost,
    //           "TotalCalculatedRMBOPCCCostPerAssembly": item.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
    //           "TotalOperationCostPerAssembly": checkForNull(item.CostingPartDetails?.TotalOperationCostPerAssembly),
    //           "TotalOperationCostSubAssembly": checkForNull(item.CostingPartDetails?.TotalOperationCostSubAssembly),
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
    //         "TotalOperationCostSubAssembly": checkForNull(tabData.CostingPartDetails?.TotalOperationCostSubAssembly),
    //         "TotalOperationCostComponent": checkForNull(tabData.CostingPartDetails?.TotalOperationCostComponent),
    //         "SurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.SurfaceTreatmentCost,
    //         "TransportationCostPerAssembly": surfaceTabData.CostingPartDetails?.TransportationCost,
    //         "TotalSurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
    //         "NetSurfaceTreatmentCost": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
    //         "NetOverheadAndProfits": overHeadAndProfitTabData.CostingPartDetails ? (checkForNull(overHeadAndProfitTabData.CostingPartDetails.OverheadCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails.ProfitCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails.RejectionCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails.ICCCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails.PaymentTermCost)) : 0,
    //         "NetPackagingAndFreightCost": PackageAndFreightTabData && PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost,
    //         "NetToolCost": ToolTabData[0]?.CostingPartDetails?.TotalToolCost,
    //         "NetOtherCost": discountAndOtherTabData?.AnyOtherCost,
    //         "NetDiscounts": discountAndOtherTabData?.HundiOrDiscountValue,
    //         "TotalCostINR": netPOPrice,
    //         "TabId": 1
    //       },
    //       "WorkingRows": assemblyWorkingRow,
    //       "BOPHandlingCharges": {
    //         "AssemblyCostingId": tabData.CostingId,
    //         "IsApplyBOPHandlingCharges": true,
    //         "BOPHandlingPercentage": getAssemBOPCharge.BOPHandlingPercentage,
    //         "BOPHandlingCharges": getAssemBOPCharge.BOPHandlingCharges
    //       },
    //       "LoggedInUserId": loggedInUserId()

    //     }
    //     if (!CostingViewMode) {

    //       dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
    //     }
    //   }

    //   dispatch(saveComponentCostingRMCCTab(requestData, res => {
    //     if (res.data.Result) {
    //       Toaster.success(MESSAGES.RMCC_TAB_COSTING_SAVE_SUCCESS);
    //       dispatch(CloseOpenAccordion())
    //       dispatch(setComponentItemData({}, () => { }))
    //       InjectDiscountAPICall()
    //       dispatch(isDataChange(false))
    //     }
    //   }))
    // }
    // else {
    //   dispatch(CloseOpenAccordion())
    //   dispatch(isDataChange(false))
    // }
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

  const setBOPCostWithAsssembly = (obj, item) => {
    let totalBOPCost = checkForNull(obj?.BOPHandlingChargeApplicability) + checkForNull(obj?.BOPHandlingCharges)
    let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray
    let changeTempObject = tempsubAssemblyTechnologyArray[0]?.CostingChildPartDetails
    let costPerPieceTotal = 0
    let costPerAssemblyTotal = 0
    let CostPerAssemblyBOPTotal = 0

    changeTempObject && changeTempObject.map((item) => {

      costPerPieceTotal = checkForNull(costPerPieceTotal) + checkForNull(item?.CostingPartDetails?.CostPerPiece)
      costPerAssemblyTotal = checkForNull(costPerAssemblyTotal) + checkForNull(item?.CostingPartDetails?.CostPerAssembly)
      CostPerAssemblyBOPTotal = checkForNull(CostPerAssemblyBOPTotal) + checkForNull(item?.CostingPartDetails?.CostPerAssemblyBOP)
      return null
    })
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.CostPerPiece = costPerPieceTotal
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.EditPartCost = costPerAssemblyTotal
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.CostPerAssembly = checkForNull(costPerAssemblyTotal) + checkForNull(totalBOPCost) + (checkForNull(tempsubAssemblyTechnologyArray[0].processCostValue) + checkForNull(tempsubAssemblyTechnologyArray[0].operationCostValue))
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.CostPerAssemblyBOP = checkForNull(totalBOPCost)
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.BOPHandlingCharges = checkForNull(obj?.BOPHandlingCharges)
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.IsApplyBOPHandlingCharges = obj.IsApplyBOPHandlingCharges
    dispatch(setSubAssemblyTechnologyArray(tempsubAssemblyTechnologyArray, res => { }))


    // __________________________________________ ASSEMBLY DOWN    ||     SUBASSEMBLY UP
    // let arr = assemblyCalculation(subAssemblyTechnologyArray, 'BOP')
    // dispatch(setRMCCData(arr, () => {
    //   const tabData = subAssemblyTechnologyArray[0]

    //   const surfaceTabData = SurfaceTabData[0]

    //   const overHeadAndProfitTabData = OverheadProfitTabData[0]

    //   const discountAndOtherTabData = DiscountCostData


    //   let assemblyWorkingRow = []
    //   tabData && tabData.CostingChildPartDetails && tabData.CostingChildPartDetails.map((item) => {
    //     if (item.PartType === 'Sub Assembly') {

    //       let subAssemblyObj = {
    //         "CostingId": item.CostingId,
    //         "SubAssemblyCostingId": item.SubAssemblyCostingId,
    //         "CostingNumber": "", // Need to find out how to get it.
    //         "TotalRawMaterialsCostWithQuantity": item.PartType === 'Part' ? item.CostingPartDetails?.TotalRawMaterialsCost * item.CostingPartDetails.Quantity : item.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
    //         "TotalBoughtOutPartCostWithQuantity": item.PartType === 'Part' ? item.CostingPartDetails?.TotalBoughtOutPartCost * item.CostingPartDetails.Quantity : item.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
    //         "TotalConversionCostWithQuantity": item.PartType === 'Part' ? item.CostingPartDetails?.TotalConversionCost * item.CostingPartDetails.Quantity : item.CostingPartDetails?.TotalConversionCostWithQuantity,
    //         "TotalCalculatedRMBOPCCCostPerPC": item.CostingPartDetails?.TotalRawMaterialsCost + item.CostingPartDetails?.TotalBoughtOutPartCost + item.CostingPartDetails?.TotalConversionCost,
    //         "TotalCalculatedRMBOPCCCostPerAssembly": item.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
    //         "TotalOperationCostPerAssembly": checkForNull(item.CostingPartDetails?.TotalOperationCostPerAssembly),
    //         "TotalOperationCostSubAssembly": checkForNull(item.CostingPartDetails?.TotalOperationCostSubAssembly),
    //         "TotalOperationCostComponent": item.CostingPartDetails.TotalOperationCostComponent,
    //         "SurfaceTreatmentCostPerAssembly": 0,
    //         "TransportationCostPerAssembly": 0,
    //         "TotalSurfaceTreatmentCostPerAssembly": 0,
    //         "TotalCostINR": netPOPrice
    //       }
    //       assemblyWorkingRow.push(subAssemblyObj)
    //       return assemblyWorkingRow
    //     }
    //   })
    //   let assemblyRequestedData = {

    //     "TopRow": {
    //       "CostingId": tabData.CostingId,
    //       "CostingNumber": tabData.CostingNumber,
    //       "TotalRawMaterialsCostWithQuantity": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
    //       "TotalBoughtOutPartCostWithQuantity": tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
    //       "TotalConversionCostWithQuantity": tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
    //       "TotalCalculatedRMBOPCCCostPerPC": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity + tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity + tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
    //       "TotalCalculatedRMBOPCCCostPerAssembly": tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
    //       "NetRMCostPerAssembly": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
    //       "NetBOPCostAssembly": tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
    //       "NetConversionCostPerAssembly": tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
    //       "NetRMBOPCCCost": tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
    //       "TotalOperationCostPerAssembly": tabData.CostingPartDetails.TotalOperationCostPerAssembly,
    //       "TotalOperationCostSubAssembly": checkForNull(tabData.CostingPartDetails?.TotalOperationCostSubAssembly),
    //       "TotalOperationCostComponent": checkForNull(tabData.CostingPartDetails?.TotalOperationCostComponent),
    //       "SurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.SurfaceTreatmentCost,
    //       "TransportationCostPerAssembly": surfaceTabData.CostingPartDetails?.TransportationCost,
    //       "TotalSurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
    //       "NetSurfaceTreatmentCost": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
    //       "NetOverheadAndProfits": overHeadAndProfitTabData.CostingPartDetails ? (checkForNull(overHeadAndProfitTabData.CostingPartDetails.OverheadCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails.ProfitCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails.RejectionCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails.ICCCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails.PaymentTermCost)) : 0,
    //       "NetPackagingAndFreightCost": PackageAndFreightTabData && PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost,
    //       "NetToolCost": ToolTabData[0]?.CostingPartDetails?.TotalToolCost,
    //       "NetOtherCost": discountAndOtherTabData?.AnyOtherCost,
    //       "NetDiscounts": discountAndOtherTabData?.HundiOrDiscountValue,
    //       "TotalCostINR": tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity +
    //         checkForNull(surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost) +
    //         (checkForNull(overHeadAndProfitTabData.CostingPartDetails?.OverheadCost) +
    //           checkForNull(overHeadAndProfitTabData?.CostingPartDetails?.ProfitCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails?.RejectionCost) +
    //           checkForNull(overHeadAndProfitTabData.CostingPartDetails?.ICCCost) + checkForNull(overHeadAndProfitTabData.CostingPartDetails?.PaymentTermCost)) +
    //         checkForNull(PackageAndFreightTabData && PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) + checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) +
    //         checkForNull(discountAndOtherTabData?.AnyOtherCost) + checkForNull(discountAndOtherTabData?.HundiOrDiscountValue),
    //       "TabId": 1
    //     },
    //     "WorkingRows": assemblyWorkingRow,
    //     "BOPHandlingCharges": {
    //       "AssemblyCostingId": tabData.CostingId,
    //       "IsApplyBOPHandlingCharges": true,
    //       "BOPHandlingPercentage": getAssemBOPCharge.BOPHandlingPercentage,
    //       "BOPHandlingCharges": getAssemBOPCharge.BOPHandlingCharges
    //     },
    //     "LoggedInUserId": loggedInUserId()

    //   }
    //   if (!CostingViewMode && checkIsDataChange) {

    //     dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
    //   }
    // }))
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
                          <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{`Part Name`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '70px' }}>{`Level`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{`Type`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`Technology`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`Quantity`} </th>
                          <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`Cost/Pc`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`Operation Cost`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`Process Cost`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`BOP Cost`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '90px' }}>{`Cost/Assembly`}</th>
                          <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{`Action`}</th>
                          {
                            costData.IsAssemblyPart && <th className="py-3 align-middle" style={{ minWidth: '100px' }}>{
                              <button
                                type="button"
                                className={'user-btn add-oprn-btn'}
                                onClick={bopHandlingDrawer}>
                                <div className={`${CostingViewMode ? 'fa fa-eye pr-1' : 'plus'}`}></div>{`BOP H`}</button>}
                            </th>
                          }
                        </tr>

                      </thead>

                      <tbody>
                        {
                          subAssemblyTechnologyArray && subAssemblyTechnologyArray.map((item, index) => {
                            return (
                              < >
                                <AssemblyTechnology
                                  index={index}
                                  item={item}
                                  children={item.CostingChildPartDetails}
                                  toggleAssembly={toggleAssembly}
                                  setAssemblyOperationCost={setAssemblyOperationCost}
                                  subAssembId={item.CostingId}
                                  getCostPerPiece={getCostPerPiece}
                                  setOperationCostFunction={setOperationCostFunction}
                                />
                              </>
                            )
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
                    isAssemblyTechnology={true}
                    setBOPCostWithAsssembly={setBOPCostWithAsssembly}
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
                      disabled={checkIsDataChange || (DayTime(CostingEffectiveDate).isValid() === false) ? true : false}
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

export default TabAssemblyTechnology;
//export default React.memo(TabAssemblyTechnology);
