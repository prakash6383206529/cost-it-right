import React, { useEffect, useContext, useState } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { getSurfaceTreatmentTabData, setSurfaceData, setMessageForAssembly } from '../../actions/Costing';
import { NetPOPriceContext, costingInfoContext } from '../CostingDetailStepTwo';
import { checkForNull } from '../../../../helper';
import PartSurfaceTreatment from '../CostingHeadCosts/SurfaceTreatMent/PartSurfaceTreatment';
import AssemblySurfaceTreatment from '../CostingHeadCosts/SurfaceTreatMent/AssemblySurfaceTreatment';
import { ViewCostingContext, SelectedCostingDetail } from '../CostingDetails';
import { IdForMultiTechnology } from '../../../../config/masterData';
import { setSubAssemblyTechnologyArray } from '../../actions/SubAssembly';
import _ from 'lodash'
import { reactLocalStorage } from 'reactjs-localstorage';
import { ASSEMBLYNAME, LEVEL0, TOOLINGPART, WACTypeId } from '../../../../config/constants';
import { ASSEMBLY } from '../../../../config/masterData';
import { netHeadCostContext, SurfaceCostContext } from '../CostingDetailStepTwo';
import { findrmCctData } from '../../CostingUtil';
import { PreviousTabData } from '.';
function TabSurfaceTreatment(props) {

  const { handleSubmit, } = useForm();
  const dispatch = useDispatch()
  let SurfaceTabData = useSelector(state => state.costing.SurfaceTabData)
  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const vbcExistingCosting = useContext(SelectedCostingDetail);
  const headerCosts = useContext(netHeadCostContext);
  const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)
  const partType = IdForMultiTechnology.includes(String(costData?.TechnologyId))   // ASSEMBLY TECHNOLOGY
  const { ComponentItemData, CostingDataList, isBreakupBoughtOutPartCostingFromAPI } = useSelector(state => state.costing)
  const netPOPrice = useContext(NetPOPriceContext);

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
        AssemCostingId: vbcExistingCosting.AssemblyCostingId ? vbcExistingCosting.AssemblyCostingId : costData.CostingId,
        SubAsmCostingId: vbcExistingCosting.SubAssemblyCostingId ? vbcExistingCosting.SubAssemblyCostingId : costData.CostingId,
      }
      dispatch(getSurfaceTreatmentTabData(data, true, res => {
        let tempArr = [];
        tempArr.push(res?.data?.DataList[0]);
        if (!partType) {
          tempArr.push(...res?.data?.DataList[0]?.CostingChildPartDetails);
        }
        sessionStorage.setItem('surfaceCostingArray', JSON.stringify(tempArr))
      }))
    }
  }, [costData]);

  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    // CostingViewMode CONDITION IS USED TO AVOID CALCULATION IN VIEWMODE
    if (CostingViewMode === false) {
      let TopHeaderValues = SurfaceTabData && SurfaceTabData.length > 0 && SurfaceTabData[0]?.CostingPartDetails !== undefined ? SurfaceTabData[0]?.CostingPartDetails : null;
      let topHeaderData = {}
      let surfaceTreatment = partType ?
        (TopHeaderValues?.NetSurfaceTreatmentCost ? TopHeaderValues?.NetSurfaceTreatmentCost : 0)
        : (TopHeaderValues && TopHeaderValues.TotalCalculatedSurfaceTreatmentCostWithQuantitys !== null ? TopHeaderValues.TotalCalculatedSurfaceTreatmentCostWithQuantitys : 0)
      if (costData.IsAssemblyPart) {
        topHeaderData = {
          NetSurfaceTreatmentCost: surfaceTreatment,
        }
      } else {
        topHeaderData = {
          NetSurfaceTreatmentCost: TopHeaderValues && TopHeaderValues.NetSurfaceTreatmentCost !== null ? TopHeaderValues.NetSurfaceTreatmentCost : 0,
        }
      }
      if (props.activeTab === '2') {
        props.setHeaderCost(topHeaderData)
      }
    }
  }, [SurfaceTabData]);


  /**
  * @method getTotalSurfaceCostForAssembly
  * @description GET TOTAL SURFACE COST FOR ASSEMBLY
  */
  const getTotalSurfaceCostForAssembly = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if (el.PartType === 'BOP') {
        return accummlator;
      } else if ((el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) || (el.IsAssemblyPart)) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method getTotalTransportationCostForAssembly
  * @description GET TOTAL TRANSPORTATION COST FOR ASSEMBLY
  */
  const getTotalTransportationCostForAssembly = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if (el.PartType === 'BOP') {
        return accummlator;
      } else if ((el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) || (el.IsAssemblyPart)) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el?.CostingPartDetails?.TotalTransportationCostPerAssembly);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method getTotalSurfaceCost
  * @description GET TOTAL SURFACE COST
  */
  const getTotalSurfaceCost = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if (el.PartType === 'BOP') {
        return accummlator;
      } else if ((el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) || (el.IsAssemblyPart)) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el?.CostingPartDetails?.SurfaceTreatmentCost);
      }
    }, 0)

    return NetCost;
  }

  /**
  * @method getTotalTransportationCost
  * @description GET TOTAL TRANSPORTATION COST
  */
  const getTotalTransportationCost = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if (el.PartType === 'BOP') {
        return accummlator;
      } else if ((el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) || (el.IsAssemblyPart)) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el?.CostingPartDetails?.TransportationCost !== null ? el?.CostingPartDetails?.TransportationCost : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method setPartDetails
  * @description SET PART DETAILS
  */
  const setPartDetails = (Params, Data = {}, item) => {
    formatData(Params, Data, SurfaceTabData, item)


    // dispatch(setSurfaceData(arr, () => { }))
  }

  /**
  * @method formatData
  * @description FORMATE DATA FOR SET PART DETAILS
  */
  const formatData = (Params, Data, aar, partItem) => {

    let tempArr = [];
    try {
      tempArr = aar && aar.map(i => {
        let NetSurfaceTreatmentCost
        const { CostingChildPartDetails } = i;

        if (i.IsAssemblyPart === true && !partType) {
          NetSurfaceTreatmentCost = getSurfaceTreatmentTotalCost(i.CostingChildPartDetails, checkForNull(surfaceCost(Data.SurfaceTreatmentDetails)), Params) +
            getTransportationTotalCost(i.CostingChildPartDetails, checkForNull(Data.TransportationCost), Params) +
            getSurfaceTreatmentTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(Data.TotalSurfaceTreatmentCostPerAssembly), Params) +
            getTransportationTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(Data.TotalTransportationCostPerAssembly), Params);

          i.CostingPartDetails.NetSurfaceTreatmentCost = NetSurfaceTreatmentCost;
          i.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly = getTotalSurfaceCostForAssembly(CostingChildPartDetails, Data.TotalSurfaceTreatmentCostPerAssembly, Params);
          i.CostingPartDetails.TotalTransportationCostPerAssembly = getTotalTransportationCostForAssembly(CostingChildPartDetails, Data.TotalTransportationCostPerAssembly, Params);
          i.CostingPartDetails.SurfaceTreatmentCost = getTotalSurfaceCost(CostingChildPartDetails, Data.SurfaceTreatmentCost, Params);
          i.CostingPartDetails.TransportationCost = getTotalTransportationCost(CostingChildPartDetails, Data.TransportationCost, Params);

          formatData(Params, Data, i.CostingChildPartDetails)

        } else if (i.PartNumber === Params.PartNumber && i.BOMLevel === Params.BOMLevel) {
          NetSurfaceTreatmentCost = checkForNull(surfaceCost(Data.SurfaceTreatmentDetails)) + checkForNull(Data.TransportationCost);

          i.CostingPartDetails = Data;
          i.CostingPartDetails.NetSurfaceTreatmentCost = NetSurfaceTreatmentCost;
          i.CostingPartDetails.SurfaceTreatmentCost = surfaceCost(Data.SurfaceTreatmentDetails);
          i.CostingPartDetails.TransportationCost = checkForNull(Data.TransportationCost);
          i.CostingPartDetails.SurfaceTreatmentDetails = Data.SurfaceTreatmentDetails;
          i.CostingPartDetails.TransportationDetails = Data.TransportationDetails;

          i.IsOpen = !Data.IsOpen;

        } else {
          i.IsOpen = false;
          formatData(Params, Data, i.CostingChildPartDetails)
        }

        let tempArr = JSON.parse(sessionStorage.getItem('surfaceCostingArray'))
        let partIndex = tempArr && tempArr.findIndex(item => item.PartNumber === Params.PartNumber && partItem.AssemblyPartNumber === item.AssemblyPartNumber)
        let partObj = tempArr && tempArr.find(item => item.PartNumber === Params.PartNumber && partItem.AssemblyPartNumber === item.AssemblyPartNumber)

        partObj.CostingPartDetails.SurfaceTreatmentCost = surfaceCost(Data.SurfaceTreatmentDetails);
        partObj.CostingPartDetails.TransportationCost = checkForNull(Data.TransportationCost);
        partObj.CostingPartDetails.SurfaceTreatmentDetails = Data.SurfaceTreatmentDetails;
        partObj.CostingPartDetails.NetSurfaceTreatmentCost = checkForNull(partObj?.CostingPartDetails?.SurfaceTreatmentCost) + checkForNull(partObj?.CostingPartDetails?.TransportationCost)
        partObj.CostingPartDetails.TransportationDetails = Data.TransportationDetails;
        tempArr = Object.assign([...tempArr], { [partIndex]: partObj })

        // STORING CALCULATED AND UPDATED COSTING VALUE IN LOCAL STORAGE
        sessionStorage.setItem('surfaceCostingArray', JSON.stringify([]))
        sessionStorage.setItem('surfaceCostingArray', JSON.stringify(tempArr))


        const mapArray = (data) => data.map(item => {

          let newItem = item
          let updatedArr = JSON.parse(sessionStorage.getItem('surfaceCostingArray'))
          let obj = updatedArr && updatedArr.find(updateditem => updateditem.PartNumber === newItem.PartNumber && updateditem.AssemblyPartNumber === newItem.AssemblyPartNumber)

          if (obj && Object.keys(obj).length > 0) {
            newItem.IsOpen = obj.IsOpen
            newItem.IsAssemblyPart = obj?.CostingPartDetails?.PartType === 'Part' ? true : false
            newItem.CostingPartDetails.TransportationCost = checkForNull(obj?.CostingPartDetails?.TransportationCost)
            newItem.CostingPartDetails.SurfaceTreatmentCost = checkForNull(obj?.CostingPartDetails?.SurfaceTreatmentCost)
            newItem.CostingPartDetails.NetSurfaceTreatmentCost = checkForNull(obj?.CostingPartDetails?.NetSurfaceTreatmentCost)
            newItem.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly)
            newItem.CostingPartDetails.TotalSurfaceTreatmentCostPerSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly)
            newItem.CostingPartDetails.TotalSurfaceTreatmentCostComponent = checkForNull(obj?.CostingPartDetails?.TotalSurfaceTreatmentCostComponent)
            newItem.CostingPartDetails.TotalSurfaceTreatmentCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity)
            newItem.CostingPartDetails.TotalTransportationCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TotalTransportationCostPerAssembly)
            newItem.CostingPartDetails.TotalTransportationCostPerSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalTransportationCostPerSubAssembly)
            newItem.CostingPartDetails.TotalTransportationCostComponent = checkForNull(obj?.CostingPartDetails?.TotalTransportationCostComponent)
            newItem.CostingPartDetails.TotalTransportationCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalTransportationCostWithQuantity)
            newItem.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostWithQuantitys = checkForNull(obj?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys)
            newItem.CostingPartDetails.SurfaceTreatmentDetails = obj?.CostingPartDetails?.SurfaceTreatmentDetails
            newItem.CostingPartDetails.TransportationDetails = obj?.CostingPartDetails?.TransportationDetails
            newItem.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostPerAssembly)
            newItem.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostPerSubAssembly)
            newItem.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostComponent = checkForNull(obj?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostComponent)
            newItem.CostingPartDetails.BasicRate = checkForNull(obj.CostingPartDetails?.BasicRate)
          }

          if (newItem.CostingChildPartDetails.length > 0) {
            mapArray(newItem.CostingChildPartDetails)
          }
          return newItem
        })

        const updatedArr = mapArray(SurfaceTabData)

        dispatch(setSurfaceData(updatedArr, () => { }))


        return i;

      });
    } catch (error) {

    }
    return tempArr;
  }

  /**
  * @method toggleAssembly
  * @description SET ASSEMBLY DETAILS
  */
  const toggleAssembly = (params, Children = {}) => {
    let updatedArr = JSON.parse(sessionStorage.getItem('surfaceCostingArray'))
    let tempPartNumber = []
    updatedArr && updatedArr.map((item) => {
      if (item.IsCostingLocked === true) {
        tempPartNumber.push(item.PartNumber)
      }
      return null
    })
    dispatch(setMessageForAssembly(tempPartNumber.join(',')))
    setAssembly(params, Children, SurfaceTabData)
    // dispatch(setSurfaceData(arr, () => { }))
  }

  const totalSubAssemblyCalcuation = (obj, childArray) => {
    let subAssemblyToUpdate = obj
    subAssemblyToUpdate.CostingPartDetails.TotalSurfaceTreatmentCostPerSubAssembly = surfaceCostSubAssembly(childArray)
    subAssemblyToUpdate.CostingPartDetails.TotalSurfaceTreatmentCostComponent = checkForNull(surfaceCostPart(childArray))
    subAssemblyToUpdate.CostingPartDetails.TotalSurfaceTreatmentCostWithQuantity = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalSurfaceTreatmentCostComponent)
    subAssemblyToUpdate.CostingPartDetails.TotalTransportationCostPerSubAssembly = transportCostSubAssembly(childArray)
    subAssemblyToUpdate.CostingPartDetails.TotalTransportationCostComponent = checkForNull(transportCostPart(childArray))
    subAssemblyToUpdate.CostingPartDetails.TotalTransportationCostWithQuantity = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalTransportationCostPerAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalTransportationCostPerSubAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalTransportationCostComponent)
    subAssemblyToUpdate.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostWithQuantitys = (checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalTransportationCostWithQuantity)) * subAssemblyToUpdate.Quantity
    subAssemblyToUpdate.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerAssembly = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalTransportationCostPerAssembly)
    subAssemblyToUpdate.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerSubAssembly = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalTransportationCostPerSubAssembly)
    subAssemblyToUpdate.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostComponent = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalSurfaceTreatmentCostComponent) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalTransportationCostComponent)
    subAssemblyToUpdate.CostingPartDetails.NetSurfaceTreatmentCost = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys)

    return subAssemblyToUpdate
  }

  // const setAssembly = (params, Children, arr) => {


  //   let tempArr = [];
  //   try {

  //     tempArr = arr && arr.map(i => {

  //       const { CostingChildPartDetails } = Children;

  //       if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

  //         i.CostingChildPartDetails = params.BOMLevel !== LEVEL0 ? ChangeBOMLeveL(Children.CostingChildPartDetails, params.BOMLevel) : i.CostingChildPartDetails;
  //         i.CostingPartDetails = Children?.CostingPartDetails;
  //         i.IsAssemblyPart = true;
  //         i.IsOpen = params.IsCollapse ? !i.IsOpen : false;
  //         i.IsOpenAssemblyDrawer = false;

  //         if (i.PartType === 'Assembly') {
  //           let tempArrForCosting = reactLocalStorage.getObject('surfaceCostingArray')
  //         if (i.PartType === ASSEMBLY) {
  //           let tempArrForCosting = JSON.parse(localStorage.getItem('surfaceCostingArray'))
  //           let subAssemblyArray = i.CostingChildPartDetails

  //           let assemblyObj = tempArrForCosting[0]
  //           i.CostingPartDetails.TotalSurfaceTreatmentCostPerSubAssembly = surfaceCostSubAssembly(subAssemblyArray)
  //           i.CostingPartDetails.TotalSurfaceTreatmentCostComponent = checkForNull(surfaceCostPart(subAssemblyArray))

  //           i.CostingPartDetails.TotalSurfaceTreatmentCostWithQuantity = checkForNull(i?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly) + checkForNull(i?.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly) + checkForNull(i?.CostingPartDetails?.TotalSurfaceTreatmentCostComponent)
  //           i.CostingPartDetails.TotalTransportationCostPerSubAssembly = transportCostSubAssembly(subAssemblyArray)
  //           i.CostingPartDetails.TotalTransportationCostComponent = checkForNull(transportCostPart(subAssemblyArray))
  //           i.CostingPartDetails.TotalTransportationCostWithQuantity = checkForNull(i?.CostingPartDetails?.TotalTransportationCostPerAssembly) + checkForNull(i?.CostingPartDetails?.TotalTransportationCostPerSubAssembly) + checkForNull(i?.CostingPartDetails?.TotalTransportationCostComponent)
  //           i.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostWithQuantitys = checkForNull(i?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity) + checkForNull(i?.CostingPartDetails?.TotalTransportationCostWithQuantity)
  //           i.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerAssembly = checkForNull(i?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly) + checkForNull(i?.CostingPartDetails?.TotalTransportationCostPerAssembly)
  //           i.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerSubAssembly = checkForNull(i?.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly) + checkForNull(i?.CostingPartDetails?.TotalTransportationCostPerSubAssembly)
  //           i.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostComponent = checkForNull(i?.CostingPartDetails?.TotalSurfaceTreatmentCostComponent) + checkForNull(i?.CostingPartDetails?.TotalTransportationCostComponent)
  //           i.CostingPartDetails.NetSurfaceTreatmentCost = checkForNull(i?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity) + checkForNull(i?.CostingPartDetails?.TotalTransportationCostWithQuantity)
  //         } else {
  //           const stAsmblyTotal = getTotalSurfaceCostForAssembly(CostingChildPartDetails, Children?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly, params);
  //           const transAsmblyTotal = getTotalTransportationCostForAssembly(CostingChildPartDetails, Children?.CostingPartDetails?.TotalTransportationCostPerAssembly, params);
  //           const stTotal = getTotalSurfaceCost(CostingChildPartDetails, Children?.CostingPartDetails?.SurfaceTreatmentCost, params);
  //           const transTotal = getTotalTransportationCost(CostingChildPartDetails, Children?.CostingPartDetails?.TransportationCost, params);

  //           let NetSurfaceTreatmentCost = stAsmblyTotal + transAsmblyTotal + stTotal + transTotal;

  //           i.CostingPartDetails.NetSurfaceTreatmentCost = stAsmblyTotal + transAsmblyTotal + stTotal + transTotal;
  //           i.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly = getTotalSurfaceCostForAssembly(CostingChildPartDetails, Children?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly, params);
  //           i.CostingPartDetails.TotalTransportationCostPerAssembly = getTotalTransportationCostForAssembly(CostingChildPartDetails, Children?.CostingPartDetails?.TotalTransportationCostPerAssembly, params);
  //           i.CostingPartDetails.SurfaceTreatmentCost = getTotalSurfaceCost(CostingChildPartDetails, Children?.CostingPartDetails?.SurfaceTreatmentCost, params);
  //           i.CostingPartDetails.TransportationCost = getTotalTransportationCost(CostingChildPartDetails, Children?.CostingPartDetails?.TransportationCost, params);
  //         }

  //         // let tempArrForCosting = JSON.parse(sessionStorage.getItem('surfaceCostingArray'))

  //         // if (params.BOMLevel !== LEVEL0) {
  //         //   let childArray = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === params.PartNumber)
  //         //   let subbAssemblyIndex = tempArrForCosting && tempArrForCosting.findIndex(item => item.PartNumber === params.PartNumber)
  //         //   let subAssemblyToUpdate = tempArrForCosting[subbAssemblyIndex]
  //         //   subAssemblyToUpdate.CostingChildPartDetails = params.BOMLevel !== LEVEL0 ? ChangeBOMLeveL(childArray, params.BOMLevel) : childArray

  //         //   subAssemblyToUpdate?.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly = 
  //         // }



  //       }
  //       else {
  //         setAssembly(params, Children, i.CostingChildPartDetails)
  //       }
  //       return i;
  //     });

  //   } catch (error) {

  //   }
  //   return tempArr;

  // }


  const setAssembly = (params, Children, arr) => {


    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {

        // i.CostingChildPartDetails = params.BOMLevel !== LEVEL0 ? ChangeBOMLeveL(Children.CostingChildPartDetails, params.BOMLevel) : i.CostingChildPartDetails;
        i.CostingPartDetails = Children?.CostingPartDetails;
        i.IsAssemblyPart = true;
        i.IsOpen = params.IsCollapse ? !i.IsOpen : false;
        i.IsOpenAssemblyDrawer = false;

        let tempArrForCosting = JSON.parse(sessionStorage.getItem('surfaceCostingArray'))


        if (params.BOMLevel !== LEVEL0) {
          let childArray = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === params.PartNumber)
          let subbAssemblyIndex = tempArrForCosting && tempArrForCosting.findIndex(item => item.PartNumber === params.PartNumber)
          let subAssemblyToUpdate = tempArrForCosting[subbAssemblyIndex]
          subAssemblyToUpdate.CostingChildPartDetails = params.BOMLevel !== LEVEL0 ? ChangeBOMLeveL(Children.CostingChildPartDetails, params.BOMLevel) : Children.CostingChildPartDetails
          subAssemblyToUpdate.IsOpen = subAssemblyToUpdate.PartType !== "Part" ? !subAssemblyToUpdate.IsOpen : false

          let obj = totalSubAssemblyCalcuation(subAssemblyToUpdate, childArray)
          let totalObj = { ...subAssemblyToUpdate, ...obj }


          tempArrForCosting = Object.assign([...tempArrForCosting], { [subbAssemblyIndex]: totalObj })

          const level = params.BOMLevel
          const useLevel = level.split('L')[1]
          let initialPartNo = subAssemblyToUpdate.AssemblyPartNumber
          if (useLevel > 1 && !CostingViewMode) {
            for (let i = useLevel + 1; i > 0; i--) {
              // IF LEVEL WE ARE WORKING IS OF PART TYPE UNDER SOME SUBASSMEBLY 
              let indexForUpdate = _.findIndex(tempArrForCosting, ['PartNumber', initialPartNo]);
              let objectToUpdate = tempArrForCosting[indexForUpdate]
              if (objectToUpdate.PartType === 'Sub Assembly') {
                let tempArr = _.filter(tempArrForCosting, ['AssemblyPartNumber', initialPartNo]);
                initialPartNo = objectToUpdate.AssemblyPartNumber
                let subAssemObj = totalSubAssemblyCalcuation(objectToUpdate, tempArr)
                tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })

              }
            }
          }
        }

        let assemblyObj = tempArrForCosting[0]
        let subAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === assemblyObj.PartNumber && item.BOMLevel !== LEVEL0)

        assemblyObj.CostingChildPartDetails = subAssemblyArray
        if (!CostingViewMode) {
          let dataList = CostingDataList[0]
          assemblyObj.CostingPartDetails.TotalSurfaceTreatmentCostPerSubAssembly = surfaceCostSubAssembly(subAssemblyArray)
          assemblyObj.CostingPartDetails.TotalSurfaceTreatmentCostComponent = checkForNull(surfaceCostPart(subAssemblyArray))
          assemblyObj.CostingPartDetails.TotalSurfaceTreatmentCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostComponent)
          assemblyObj.CostingPartDetails.TotalTransportationCostPerSubAssembly = transportCostSubAssembly(subAssemblyArray)
          assemblyObj.CostingPartDetails.TotalTransportationCostComponent = checkForNull(transportCostPart(subAssemblyArray))
          assemblyObj.CostingPartDetails.TotalTransportationCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostPerSubAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostComponent)
          assemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostWithQuantitys = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostWithQuantity)
          assemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerAssembly = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostPerAssembly)
          assemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerSubAssembly = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostPerSubAssembly)
          assemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostComponent = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostComponent)
          assemblyObj.CostingPartDetails.NetSurfaceTreatmentCost = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostWithQuantity)
          assemblyObj.CostingPartDetails.BasicRate = checkForNull(assemblyObj?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(dataList?.CostingPartDetails?.NetTotalRMBOPCC)
        }
        assemblyObj.IsOpen = params.BOMLevel !== LEVEL0 ? true : !assemblyObj.IsOpen
        tempArrForCosting = Object.assign([...tempArrForCosting], { 0: assemblyObj })

        sessionStorage.setItem('surfaceCostingArray', JSON.stringify([]))
        sessionStorage.setItem('surfaceCostingArray', JSON.stringify(tempArrForCosting))

        const mapArray = (data) => data.map(item => {

          let newItem = item
          let updatedArr = JSON.parse(sessionStorage.getItem('surfaceCostingArray'))

          let obj = updatedArr && updatedArr.find(updateditem => updateditem.PartNumber === newItem.PartNumber && updateditem.AssemblyPartNumber === newItem.AssemblyPartNumber)

          if (obj && Object.keys(obj).length > 0) {
            newItem.IsOpen = obj.IsOpen
            newItem.IsAssemblyPart = true
            newItem.CostingChildPartDetails = obj.CostingChildPartDetails
            newItem.CostingPartDetails.TransportationCost = checkForNull(obj?.CostingPartDetails?.TransportationCost)
            newItem.CostingPartDetails.SurfaceTreatmentCost = checkForNull(obj?.CostingPartDetails?.SurfaceTreatmentCost)
            newItem.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly)
            newItem.CostingPartDetails.TotalSurfaceTreatmentCostPerSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly)
            newItem.CostingPartDetails.TotalSurfaceTreatmentCostComponent = checkForNull(obj?.CostingPartDetails?.TotalSurfaceTreatmentCostComponent)
            newItem.CostingPartDetails.TotalSurfaceTreatmentCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity)
            newItem.CostingPartDetails.TotalTransportationCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TotalTransportationCostPerAssembly)
            newItem.CostingPartDetails.TotalTransportationCostPerSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalTransportationCostPerSubAssembly)
            newItem.CostingPartDetails.TotalTransportationCostComponent = checkForNull(obj?.CostingPartDetails?.TotalTransportationCostComponent)
            newItem.CostingPartDetails.TotalTransportationCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalTransportationCostWithQuantity)
            newItem.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostWithQuantitys = checkForNull(obj?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys)
            newItem.CostingPartDetails.SurfaceTreatmentDetails = obj?.CostingPartDetails?.SurfaceTreatmentDetails
            newItem.CostingPartDetails.TransportationDetails = obj?.CostingPartDetails?.TransportationDetails
            newItem.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostPerAssembly)
            newItem.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostPerSubAssembly)
            newItem.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostComponent = checkForNull(obj?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostComponent)
            newItem.CostingPartDetails.BasicRate = obj?.CostingPartDetails?.BasicRate
          }

          if (item.CostingChildPartDetails.length > 0) {
            mapArray(newItem.CostingChildPartDetails)
          }
          return newItem
        })

        const updatedArr1 = mapArray(SurfaceTabData)


        dispatch(setSurfaceData(updatedArr1, () => { }))
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
  * @method setSurfaceCost
  * @description SET SURFACE TREATMENT COST
  */
  const setSurfaceCost = (surfaceGrid, params) => {

    let arr = dispatchSurfaceCost(surfaceGrid, params, SurfaceTabData)

    // let arr1 = assemblyTotalSurfaceTransportCost(arr)
    dispatch(setSurfaceData(arr, () => { }))
  }

  /**
  * @method dispatchSurfaceCost
  * @description DISPATCHED SURFACE COST
  */
  const dispatchSurfaceCost = (surfaceGrid, params, arr) => {
    let tempArr = [];
    let dataList = CostingDataList[0]
    try {

      tempArr = arr && arr.map(i => {
        let NetSurfaceTreatmentCost
        if (i.IsAssemblyPart === true && !partType) {

          NetSurfaceTreatmentCost = getSurfaceTreatmentTotalCost(i.CostingChildPartDetails, checkForNull(surfaceCost(surfaceGrid)), params) +
            getTransportationTotalCost(i.CostingChildPartDetails, checkForNull(i?.CostingPartDetails?.TransportationCost), params) +
            getSurfaceTreatmentTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(i?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly), params) +
            getTransportationTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(i?.CostingPartDetails?.TotalTransportationCostPerAssembly), params);

          i.CostingPartDetails.NetSurfaceTreatmentCost = NetSurfaceTreatmentCost;
          i.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly = checkForNull(i?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly);
          i.CostingPartDetails.TotalTransportationCostPerAssembly = checkForNull(i?.CostingPartDetails?.TotalTransportationCostPerAssembly);
          i.CostingPartDetails.SurfaceTreatmentCost = getSurfaceTreatmentTotalCost(i.CostingChildPartDetails, checkForNull(surfaceCost(surfaceGrid)), params);
          i.CostingPartDetails.SurfaceTreatmentDetails = surfaceGrid;

          dispatchSurfaceCost(surfaceGrid, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          NetSurfaceTreatmentCost = checkForNull(surfaceCost(surfaceGrid)) + checkForNull(i?.CostingPartDetails?.TransportationCost);

          i.CostingPartDetails.NetSurfaceTreatmentCost = NetSurfaceTreatmentCost;
          i.CostingPartDetails.SurfaceTreatmentCost = surfaceCost(surfaceGrid);
          i.CostingPartDetails.SurfaceTreatmentDetails = surfaceGrid;

        } else {
          dispatchSurfaceCost(surfaceGrid, params, i.CostingChildPartDetails)
        }
        let tempArr = JSON.parse(sessionStorage.getItem('surfaceCostingArray'))


        let partObj = tempArr[0]

        partObj.CostingPartDetails.NetSurfaceTreatmentCost = checkForNull(surfaceCost(surfaceGrid)) + checkForNull(i?.CostingPartDetails?.TransportationCost);
        partObj.CostingPartDetails.SurfaceTreatmentCost = surfaceCost(surfaceGrid);
        partObj.CostingPartDetails.SurfaceTreatmentDetails = surfaceGrid;
        const total = checkForNull(dataList.NetTotalRMBOPCC) + checkForNull(NetSurfaceTreatmentCost) + checkForNull(dataList.NetOverheadAndProfitCost) + checkForNull(dataList.NetPackagingAndFreight) + checkForNull(dataList.ToolCost) + checkForNull(dataList.NetOtherCost) - checkForNull(dataList.NetDiscountsCost)
        partObj.CostingPartDetails.BasicRate = total;
        tempArr = Object.assign([...tempArr], { 0: partObj })

        // STORING CALCULATED AND UPDATED COSTING VALUE IN LOCAL STORAGE
        sessionStorage.setItem('surfaceCostingArray', JSON.stringify([]))
        sessionStorage.setItem('surfaceCostingArray', JSON.stringify(tempArr))

        return i;
      });


    } catch (error) {

    }
    return tempArr;

  }

  /**
   * @method getSurfaceTreatmentTotalCost
   * @description GET SURFACE TREATMENT TOTAL COST
   */
  const getSurfaceTreatmentTotalCost = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if (el.PartType === 'BOP') {
        return accummlator;
      } else if ((el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) || (el.IsAssemblyPart)) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el?.CostingPartDetails?.SurfaceTreatmentCost);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method surfaceCost
  * @description GET SURFACE TREATMENT COST
  */
  const surfaceCost = (item) => {
    let cost = 0;
    cost = item && item.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.SurfaceTreatmentCost);
    }, 0)
    return cost;
  }

  /**
  * @method setTransportationCost
  * @description SET TRANSPORTATION COST
  */
  const setTransportationCost = (transportationObj, params) => {

    let arr = dispatchTransportationCost(transportationObj, params, SurfaceTabData)
    let tempArr = JSON.parse(sessionStorage.getItem('surfaceCostingArray'))

    // let arr1 = assemblyTotalSurfaceTransportCost(arr)
    dispatch(setSurfaceData(tempArr, () => { }))
  }

  /**
  * @method dispatchTransportationCost
  * @description DISPATCHED TRANSPORTATION COST
  */
  const dispatchTransportationCost = (transportationObj, params, arr) => {
    let tempArr = [];
    let NetSurfaceTreatmentCost
    let dataList = CostingDataList[0]
    try {

      tempArr = arr && arr.map(i => {

        if (i.IsAssemblyPart === true && !partType) {

          // let NetSurfaceTreatmentCost = getSurfaceTreatmentTotalCost(i.CostingChildPartDetails, checkForNull(i?.CostingPartDetails?.SurfaceTreatmentCost), params) +
          // getSurfaceTreatmentTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(i?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly), params) +
          // getTransportationTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(i?.CostingPartDetails?.TotalTransportationCostPerAssembly), params) +
          // getTransportationTotalCost(i.CostingChildPartDetails, checkForNull(transportationObj.TransportationCost), params)

          NetSurfaceTreatmentCost = checkForNull(i?.CostingPartDetails?.SurfaceTreatmentCost) + +
            checkForNull(i?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly) +
            checkForNull(i?.CostingPartDetails?.TotalTransportationCostPerAssembly) +
            getTransportationTotalCost(i.CostingChildPartDetails, checkForNull(transportationObj.TransportationCost), params)

          i.CostingPartDetails.NetSurfaceTreatmentCost = NetSurfaceTreatmentCost;
          i.CostingPartDetails.TransportationCost = getTransportationTotalCost(i.CostingChildPartDetails, checkForNull(transportationObj.TransportationCost), params);

          dispatchTransportationCost(transportationObj, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          NetSurfaceTreatmentCost = checkForNull(surfaceCost(i?.CostingPartDetails?.SurfaceTreatmentDetails)) +
            checkForNull(transportationObj.TransportationCost);

          i.CostingPartDetails.NetSurfaceTreatmentCost = NetSurfaceTreatmentCost;
          i.CostingPartDetails.TransportationCost = checkForNull(transportationObj.TransportationCost);
          i.CostingPartDetails.TransportationDetails = transportationObj;

        } else {
          dispatchTransportationCost(transportationObj, params, i.CostingChildPartDetails)
        }
        let tempArr = JSON.parse(sessionStorage.getItem('surfaceCostingArray'))

        let partObj = tempArr[0]

        const total = checkForNull(dataList.NetTotalRMBOPCC) + checkForNull(NetSurfaceTreatmentCost) + checkForNull(dataList.NetOverheadAndProfitCost) + checkForNull(dataList.NetPackagingAndFreight) + checkForNull(dataList.ToolCost) + checkForNull(dataList.NetOtherCost) - checkForNull(dataList.NetDiscountsCost)
        partObj.CostingPartDetails.BasicRate = total;
        partObj.CostingPartDetails.NetSurfaceTreatmentCost = checkForNull(surfaceCost(i?.CostingPartDetails?.SurfaceTreatmentDetails)) +
          checkForNull(transportationObj.TransportationCost);
        partObj.CostingPartDetails.TransportationCost = checkForNull(transportationObj.TransportationCost);
        partObj.CostingPartDetails.TransportationDetails = transportationObj;
        tempArr = Object.assign([...tempArr], { 0: partObj })

        // STORING CALCULATED AND UPDATED COSTING VALUE IN LOCAL STORAGE
        sessionStorage.setItem('surfaceCostingArray', JSON.stringify([]))
        sessionStorage.setItem('surfaceCostingArray', JSON.stringify(tempArr))
        return i;
      });

    } catch (error) {

    }
    return tempArr;

  }

  /**
   * @method getTransportationTotalCost
   * @description GET TRANSPORTATION TOTAL COST
   */
  const getTransportationTotalCost = (arr, GridTotalCost, params, flag) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if (el.PartType === 'BOP') {
        return accummlator;
      } else if ((el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) || (el.IsAssemblyPart)) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el?.CostingPartDetails?.TransportationCost);
      }
    }, 0)
    return NetCost;
  }


  const surfaceCostSubAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Sub Assembly') {
        return accummlator + checkForNull(item?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity) * checkForNull(item?.Quantity)
      } else {
        return accummlator
      }
    }, 0)

    return total
  }
  const transportCostSubAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Sub Assembly') {
        return accummlator + checkForNull(item?.CostingPartDetails?.TotalTransportationCostWithQuantity) * checkForNull(item.Quantity ? item.Quantity : 3)
      } else {
        return accummlator
      }
    }, 0)
    return total
  }



  const surfaceCostPart = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + checkForNull(item?.CostingPartDetails?.SurfaceTreatmentCost) * checkForNull(item.Quantity)
      } else {
        return accummlator
      }
    }, 0)
    return total
  }
  const transportCostPart = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + checkForNull(item?.CostingPartDetails?.TransportationCost) * checkForNull(item.Quantity)
      } else {
        return accummlator
      }
    }, 0)
    return total
  }


  const calculationForPart = (surfaceGrid = [], item, type, TransportationObj = {}) => {
    let obj = item
    let rmCcData = findrmCctData(item)



    switch (type) {
      case 'Operation':
        obj.CostingPartDetails.SurfaceTreatmentCost = checkForNull(surfaceCost(surfaceGrid));
        obj.CostingPartDetails.SurfaceTreatmentDetails = surfaceGrid;
        obj.CostingPartDetails.NetSurfaceTreatmentCost = (checkForNull(surfaceCost(surfaceGrid)) + obj?.CostingPartDetails?.TransportationCost)
        obj.CostingPartDetails.BasicRate = checkForNull(obj.CostingPartDetails.NetSurfaceTreatmentCost) + checkForNull(ComponentItemData?.CostingPartDetails?.TotalCalculatedRMBOPCCCost)

        break;
      case 'Transport':
        obj.CostingPartDetails.TransportationCost = checkForNull(TransportationObj?.TransportationCost)
        obj.CostingPartDetails.TransportationDetails = TransportationObj
        obj.CostingPartDetails.NetSurfaceTreatmentCost = (checkForNull(obj?.CostingPartDetails?.SurfaceTreatmentCost) + checkForNull(TransportationObj.TransportationCost))
        obj.CostingPartDetails.BasicRate = checkForNull(obj.CostingPartDetails.NetSurfaceTreatmentCost) + checkForNull(ComponentItemData?.CostingPartDetails?.TotalCalculatedRMBOPCCCost)
        break;
      default:
        break;
    }
    return obj
  }


  const calculationForSubAssembly = (surfaceGrid, obj = {}, quantity, type = '', tempArr = [], TransportationObj = {}, params) => {


    let subAssemblyObj = obj
    let rmCcData = findrmCctData(subAssemblyObj)
    switch (type) {
      case 'Operation':
        subAssemblyObj.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly = (surfaceGrid.length > 0 || params.PartNumber === subAssemblyObj.PartNumber) ? checkForNull(surfaceCost(surfaceGrid)) : checkForNull(subAssemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly) //OPERATION COST ADDED ON THAT PARTICULAR ASSEMBLY

        subAssemblyObj.CostingPartDetails.TotalSurfaceTreatmentCostPerSubAssembly = checkForNull(surfaceCostSubAssembly(tempArr)) // SURFACE TREATMENT COST OF IT'S SUBASSEMBLIES
        subAssemblyObj.CostingPartDetails.TotalSurfaceTreatmentCostComponent = surfaceCostPart(tempArr) //SURFACE TREATMENT COST OF COMPONENE OF THAT ASSEMBLY
        subAssemblyObj.CostingPartDetails.TotalSurfaceTreatmentCostWithQuantity = checkForNull(subAssemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly) + checkForNull(subAssemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly) + checkForNull(subAssemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostComponent)
        subAssemblyObj.CostingPartDetails.SurfaceTreatmentCost = checkForNull(subAssemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly)
        subAssemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostWithQuantitys = (checkForNull(subAssemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity) + checkForNull(subAssemblyObj?.CostingPartDetails?.TotalTransportationCostWithQuantity)) * checkForNull(subAssemblyObj?.Quantity)
        subAssemblyObj.CostingPartDetails.SurfaceTreatmentDetails = (surfaceGrid.length > 0 || params.PartNumber === subAssemblyObj.PartNumber) ? surfaceGrid : subAssemblyObj?.CostingPartDetails?.SurfaceTreatmentDetails;

        break;
      case 'Transport':
        subAssemblyObj.CostingPartDetails.TotalTransportationCostPerAssembly = (Object.keys(TransportationObj).length > 0 && params.PartNumber === subAssemblyObj.PartNumber) ? checkForNull(TransportationObj?.TransportationCost) : checkForNull(subAssemblyObj?.CostingPartDetails?.TotalTransportationCostPerAssembly)
        subAssemblyObj.CostingPartDetails.TransportationCostPerAssembly = (Object.keys(TransportationObj).length > 0 && params.PartNumber === subAssemblyObj.PartNumber) ? checkForNull(TransportationObj?.TransportationCost) : checkForNull(subAssemblyObj?.CostingPartDetails?.TotalTransportationCostPerAssembly)
        subAssemblyObj.CostingPartDetails.TotalTransportationCostPerSubAssembly = transportCostSubAssembly(tempArr)
        subAssemblyObj.CostingPartDetails.TotalTransportationCostComponent = transportCostPart(tempArr)
        subAssemblyObj.CostingPartDetails.TotalTransportationCostWithQuantity = checkForNull(subAssemblyObj?.CostingPartDetails?.TotalTransportationCostPerAssembly) + checkForNull(subAssemblyObj?.CostingPartDetails?.TotalTransportationCostPerSubAssembly) + checkForNull(subAssemblyObj?.CostingPartDetails?.TotalTransportationCostComponent)
        subAssemblyObj.CostingPartDetails.TransportationCost = checkForNull(subAssemblyObj?.CostingPartDetails?.TotalTransportationCostPerAssembly)
        subAssemblyObj.CostingPartDetails.TransportationDetails = (Object.keys(TransportationObj).length > 0 && params.PartNumber === subAssemblyObj.PartNumber) ? TransportationObj : subAssemblyObj?.CostingPartDetails?.TransportationDetails
        subAssemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostWithQuantitys = (checkForNull(subAssemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity) + checkForNull(subAssemblyObj?.CostingPartDetails?.TotalTransportationCostWithQuantity)) * checkForNull(subAssemblyObj?.Quantity)
        break;
      default:
        break;
    }
    subAssemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerAssembly = subAssemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly + subAssemblyObj?.CostingPartDetails?.TotalTransportationCostPerAssembly
    subAssemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerSubAssembly = subAssemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly + subAssemblyObj?.CostingPartDetails?.TotalTransportationCostPerSubAssembly
    subAssemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostComponent = subAssemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostComponent + subAssemblyObj?.CostingPartDetails?.TotalTransportationCostComponent
    subAssemblyObj.CostingPartDetails.NetSurfaceTreatmentCost = checkForNull(subAssemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity) + checkForNull(subAssemblyObj?.CostingPartDetails?.TotalTransportationCostWithQuantity)
    subAssemblyObj.CostingPartDetails.BasicRate = checkForNull(rmCcData?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(ComponentItemData?.CostingPartDetails?.TotalCalculatedRMBOPCCCost)
    return subAssemblyObj
  }


  /**
  * @method updateCostingValuesInStructure
  * @description UPDATE WHOLE COSTING VALUE IN RMCCTAB DATA REDUCER TO SHOW UPDATED VALUE ON UI
  */

  const updateCostingValuesInStructure = () => {
    //MAKING THIS MAP ARRAY COMMON
    const mapArray = (data) => data.map(item => {
      let newItem = item
      let updatedArr = JSON.parse(sessionStorage.getItem('surfaceCostingArray'))
      let obj = updatedArr && updatedArr.find(updateditem => updateditem.PartNumber === newItem.PartNumber && updateditem.AssemblyPartNumber === newItem.AssemblyPartNumber)

      let rmCcData = findrmCctData(item)

      if (obj && Object.keys(obj).length > 0) {
        newItem.CostingPartDetails.TransportationCost = checkForNull(obj?.CostingPartDetails?.TransportationCost)
        newItem.CostingPartDetails.SurfaceTreatmentCost = checkForNull(obj?.CostingPartDetails?.SurfaceTreatmentCost)
        newItem.CostingPartDetails.NetSurfaceTreatmentCost = checkForNull(obj?.CostingPartDetails?.NetSurfaceTreatmentCost)
        newItem.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly)
        newItem.CostingPartDetails.TotalSurfaceTreatmentCostPerSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly)
        newItem.CostingPartDetails.TotalSurfaceTreatmentCostComponent = checkForNull(obj?.CostingPartDetails?.TotalSurfaceTreatmentCostComponent)
        newItem.CostingPartDetails.TotalSurfaceTreatmentCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity)
        newItem.CostingPartDetails.TotalTransportationCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TotalTransportationCostPerAssembly)
        newItem.CostingPartDetails.TotalTransportationCostPerSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalTransportationCostPerSubAssembly)
        newItem.CostingPartDetails.TotalTransportationCostComponent = checkForNull(obj?.CostingPartDetails?.TotalTransportationCostComponent)
        newItem.CostingPartDetails.TotalTransportationCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalTransportationCostWithQuantity)
        newItem.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostWithQuantitys = checkForNull(obj?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys)
        newItem.CostingPartDetails.SurfaceTreatmentDetails = obj?.CostingPartDetails?.SurfaceTreatmentDetails
        newItem.CostingPartDetails.TransportationDetails = obj?.CostingPartDetails?.TransportationDetails
        newItem.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostPerAssembly)
        newItem.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostPerSubAssembly)
        newItem.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostComponent = checkForNull(obj?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostComponent)
        newItem.CostingPartDetails.BasicRate = checkForNull(obj?.CostingPartDetails?.BasicRate)
      }

      if (item.CostingChildPartDetails.length > 0) {
        mapArray(item.CostingChildPartDetails)
      }
      return newItem
    })
    const updatedArr = mapArray(SurfaceTabData)


    dispatch(setSurfaceData(updatedArr, () => { }))
  }


  /**
  * @method setAssemblySurfaceCost
  * @description SET ASSEMBLY SURFACE COST
  */
  const setAssemblySurfaceCost = (surfaceGrid, params, IsGridChanged, item) => {
    // if (IsGridChanged) {

    dispatchAssemblySurfaceCost(surfaceGrid, params, SurfaceTabData, IsGridChanged, item)
    // }
    // dispatch(setSurfaceData(arr, () => { }))
  }

  const dispatchAssemblySurfaceCost = (surfaceGrid, params, arr, IsGridChanged, item) => {




    let tempArr = [];
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
            let partObj = calculationForPart(surfaceGrid, item, 'Operation')

            tempArrForCosting = Object.assign([...tempArrForCosting], { [partIndex]: partObj })
            initialPartNo = item.AssemblyPartNumber
            // quant = item?.CostingPartDetails?.Quantity
            quant = 2
          }
          else {
            // THIS ELSE CONDITION WILL RUN FOR ALL SUBASSEMBLY COSTING CALCULATION (WILL FIND PARENT ON THE BASIS OF PARENT NO PRESENT IN IT'S CHILD)

            let indexForUpdate = _.findIndex(tempArrForCosting, ['PartNumber', initialPartNo]);
            let objectToUpdate = tempArrForCosting[indexForUpdate]

            if (objectToUpdate.PartType === 'Sub Assembly') {
              let indexForUpdate = _.findIndex(tempArrForCosting, ['PartNumber', initialPartNo]);
              let tempArr = _.filter(tempArrForCosting, ['AssemblyPartNumber', initialPartNo]);
              initialPartNo = objectToUpdate.AssemblyPartNumber
              let surfaceCostGrid = params.PartNumber === objectToUpdate.PartNumber ? surfaceGrid : []
              let subAssemObj = calculationForSubAssembly(surfaceCostGrid, objectToUpdate, quant, 'Operation', tempArr, {}, params)


              tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })

            }
          }
        } else {
          if (item.PartType === 'Sub Assembly') {
            if (i === useLevel) {
              let tempArr = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === params.PartNumber)
              let partIndex = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === item.PartNumber && x.AssemblyPartNumber === item.AssemblyPartNumber)


              let partObj = calculationForSubAssembly(surfaceGrid, item, quant, 'Operation', tempArr, {}, params)

              tempArrForCosting = Object.assign([...tempArrForCosting], { [partIndex]: partObj })
              initialPartNo = item.AssemblyPartNumber
              // quant = item?.CostingPartDetails?.Quantity
              quant = 2
            }
            else {
              // THIS ELSE CONDITION WILL RUN FOR ALL SUBASSEMBLY COSTING CALCULATION (WILL FIND PARENT ON THE BASIS OF PARENT NO PRESENT IN IT'S CHILD)
              let indexForUpdate = _.findIndex(tempArrForCosting, ['PartNumber', initialPartNo]);
              let objectToUpdate = tempArrForCosting[indexForUpdate]
              if (objectToUpdate.PartType === 'Sub Assembly') {
                let tempArr = _.filter(tempArrForCosting, ['AssemblyPartNumber', initialPartNo]);

                initialPartNo = objectToUpdate.AssemblyPartNumber
                let surfaceCostGrid = params.PartNumber === objectToUpdate.PartNumber ? surfaceGrid : []
                let subAssemObj = calculationForSubAssembly(surfaceCostGrid, objectToUpdate, quant, 'Operation', tempArr, {}, params)

                // quant = objectToUpdate?.CostingPartDetails?.Quantity
                quant = 3
                tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })
              }
            }
          }
        }
      }

      return tempArrForCosting
    }

    try {
      tempArr = arr && arr.map(i => {
        // TO FIND THE LEVEL OF PART ON WHICH COSTING IS DONE
        const level = params.BOMLevel

        const useLevel = level.split('L')[1]
        //GETTING LASTEST COSTING OF ASSEMBLY,SUBASSEMBLY AND PART FROM LOCAL STORAGE
        let tempArrForCosting = JSON.parse(sessionStorage.getItem('surfaceCostingArray'))
        //CALCULATION FOR PART/COMPONENT AND SUBASSEMBLY COSTING (OPERATION COST)
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
        let assemblyObj = tempArrForCosting[0]
        let subAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === assemblyObj.PartNumber && item.BOMLevel === 'L1')


        // WILL RUN IF IT IS ASSEMBLY COSTING. WILL NOT RUN FOR COMPONENT COSTING
        if (assemblyObj.PartType === 'Assembly' || assemblyObj?.CostingPartDetails?.PartType === TOOLINGPART) {
          let dataList = CostingDataList[0]

          assemblyObj.CostingPartDetails.SurfaceTreatmentDetails = params.PartNumber === assemblyObj.PartNumber ? surfaceGrid : assemblyObj?.CostingPartDetails?.SurfaceTreatmentDetails
          assemblyObj.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly = params.PartNumber === assemblyObj.PartNumber ? checkForNull(surfaceCost(surfaceGrid)) : checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly)
          assemblyObj.CostingPartDetails.SurfaceTreatmentCost = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly)
          assemblyObj.CostingPartDetails.TotalSurfaceTreatmentCostPerSubAssembly = surfaceCostSubAssembly(subAssemblyArray)
          assemblyObj.CostingPartDetails.TotalSurfaceTreatmentCostComponent = checkForNull(surfaceCostPart(subAssemblyArray))
          assemblyObj.CostingPartDetails.TotalSurfaceTreatmentCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostComponent)
          assemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostWithQuantitys = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostWithQuantity)
          assemblyObj.CostingPartDetails.TotalTransportationCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostWithQuantity)
          assemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerAssembly = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostPerAssembly)
          assemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerSubAssembly = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostPerSubAssembly)
          assemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostComponent = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostComponent)
          assemblyObj.CostingPartDetails.NetSurfaceTreatmentCost = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostWithQuantity)

          const total = checkForNull(dataList.NetTotalRMBOPCC) + checkForNull(assemblyObj?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys) + checkForNull(dataList.NetOverheadAndProfitCost) + checkForNull(dataList.NetPackagingAndFreight) + checkForNull(dataList.ToolCost) + checkForNull(dataList.NetOtherCost) - checkForNull(dataList.NetDiscountsCost)

          assemblyObj.CostingPartDetails.BasicRate = total;
          tempArrForCosting = Object.assign([...tempArrForCosting], { 0: assemblyObj })
        }
        // STORING CALCULATED AND UPDATED COSTING VALUE IN LOCAL STORAGE
        sessionStorage.setItem('surfaceCostingArray', JSON.stringify([]))
        sessionStorage.setItem('surfaceCostingArray', JSON.stringify(tempArrForCosting))

        return i;
      });
      updateCostingValuesInStructure()
    } catch (error) {

    }
    return tempArr;
  }

  /**
  * @method getSurfaceTreatmentTotalCostForAssembly
  * @description GET SURFACE TREATMENT TOTAL COST FOR ASSEMBLY
  */
  const getSurfaceTreatmentTotalCostForAssembly = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if (el.PartType === 'BOP') {
        return accummlator;
      } else if ((el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) || (el.IsAssemblyPart)) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method setAssemblyTransportationCost
  * @description SET ASSEMBLY TRANSPORTATION COST
  */
  const setAssemblyTransportationCost = (TransportationObj, params, item) => {

    dispatchAssemblyTransportationCost(TransportationObj, params, SurfaceTabData, item)
    // dispatch(setSurfaceData(arr, () => { }))
  }

  const dispatchAssemblyTransportationCost = (TransportationObj, params, arr, item) => {


    let tempArr = [];
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

            let partObj = calculationForPart([], item, 'Transport', TransportationObj)

            tempArrForCosting = Object.assign([...tempArrForCosting], { [partIndex]: partObj })
            initialPartNo = item.AssemblyPartNumber
            // quant = item?.CostingPartDetails?.Quantity
            quant = 2
          }
          else {
            // THIS ELSE CONDITION WILL RUN FOR ALL SUBASSEMBLY COSTING CALCULATION (WILL FIND PARENT ON THE BASIS OF PARENT NO PRESENT IN IT'S CHILD)
            let indexForUpdate = _.findIndex(tempArrForCosting, ['PartNumber', initialPartNo]);
            let objectToUpdate = tempArrForCosting[indexForUpdate]
            if (objectToUpdate.PartType === 'Sub Assembly') {
              let tempArr = _.filter(tempArrForCosting, ['AssemblyPartNumber', initialPartNo]);

              initialPartNo = objectToUpdate.AssemblyPartNumber
              let transportationCostGrid = params.PartNumber === objectToUpdate.PartNumber ? TransportationObj : {}
              let subAssemObj = calculationForSubAssembly([], objectToUpdate, quant, 'Transport', tempArr, transportationCostGrid, params)

              // quant = objectToUpdate?.CostingPartDetails?.Quantity
              quant = 3
              tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })
            }
          }
        } else {
          if (item.PartType === 'Sub Assembly') {
            if (i === useLevel) {
              let tempArr = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === params.PartNumber)
              let partIndex = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === item.PartNumber && x.AssemblyPartNumber === item.AssemblyPartNumber)
              let partObj = calculationForSubAssembly([], item, quant, 'Transport', tempArr, TransportationObj, params)

              tempArrForCosting = Object.assign([...tempArrForCosting], { [partIndex]: partObj })
              initialPartNo = item.AssemblyPartNumber
              // quant = item?.CostingPartDetails?.Quantity
              quant = 2
            }
            else {
              // THIS ELSE CONDITION WILL RUN FOR ALL SUBASSEMBLY COSTING CALCULATION (WILL FIND PARENT ON THE BASIS OF PARENT NO PRESENT IN IT'S CHILD)
              let indexForUpdate = _.findIndex(tempArrForCosting, ['PartNumber', initialPartNo]);
              let objectToUpdate = tempArrForCosting[indexForUpdate]
              if (objectToUpdate.PartType === 'Sub Assembly') {
                let tempArr = _.filter(tempArrForCosting, ['AssemblyPartNumber', initialPartNo]);

                initialPartNo = objectToUpdate.AssemblyPartNumber
                let transportationCostGrid = params.PartNumber === objectToUpdate.PartNumber ? TransportationObj : {}
                let subAssemObj = calculationForSubAssembly([], objectToUpdate, quant, 'Transport', tempArr, transportationCostGrid, params)

                // quant = objectToUpdate?.CostingPartDetails?.Quantity
                quant = 3
                tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })
              }
            }
          }
        }
      }
      return tempArrForCosting
    }
    try {
      tempArr = arr && arr.map(i => {

        // TO FIND THE LEVEL OF PART ON WHICH COSTING IS DONE
        const level = params.BOMLevel

        const useLevel = level.split('L')[1]
        //GETTING LASTEST COSTING OF ASSEMBLY,SUBASSEMBLY AND PART FROM LOCAL STORAGE
        let tempArrForCosting = JSON.parse(sessionStorage.getItem('surfaceCostingArray'))
        //CALCULATION FOR PART/COMPONENT AND SUBASSEMBLY COSTING (OPERATION COST)
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
        if (assemblyObj.PartType === 'Assembly' || assemblyObj?.CostingPartDetails?.PartType === TOOLINGPART) {
          let dataList = CostingDataList[0]
          assemblyObj.CostingPartDetails.TransportationDetails = params.PartNumber === assemblyObj.PartNumber ? TransportationObj : assemblyObj?.CostingPartDetails?.TransportationDetails
          assemblyObj.CostingPartDetails.TotalTransportationCostPerAssembly = params.PartNumber === assemblyObj.PartNumber ? checkForNull(TransportationObj.TransportationCost) : checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostPerAssembly)
          assemblyObj.CostingPartDetails.TransportationCost = checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostPerAssembly)
          assemblyObj.CostingPartDetails.TotalTransportationCostPerSubAssembly = transportCostSubAssembly(subAssemblyArray)
          assemblyObj.CostingPartDetails.TotalTransportationCostComponent = checkForNull(transportCostPart(subAssemblyArray))
          assemblyObj.CostingPartDetails.TotalTransportationCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostPerSubAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostComponent)
          assemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostWithQuantitys = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostWithQuantity)
          assemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerAssembly = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostPerAssembly)
          assemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerSubAssembly = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostPerSubAssembly)
          assemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostComponent = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostComponent)
          assemblyObj.CostingPartDetails.NetSurfaceTreatmentCost = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostWithQuantity)
          const total = checkForNull(dataList.NetTotalRMBOPCC) + checkForNull(assemblyObj?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys) + checkForNull(dataList.NetOverheadAndProfitCost) + checkForNull(dataList.NetPackagingAndFreight) + checkForNull(dataList.ToolCost) + checkForNull(dataList.NetOtherCost) - checkForNull(dataList.NetDiscountsCost)

          assemblyObj.CostingPartDetails.BasicRate = total;
          tempArrForCosting = Object.assign([...tempArrForCosting], { 0: assemblyObj })
        }
        // STORING CALCULATED AND UPDATED COSTING VALUE IN LOCAL STORAGE
        sessionStorage.setItem('surfaceCostingArray', JSON.stringify([]))
        sessionStorage.setItem('surfaceCostingArray', JSON.stringify(tempArrForCosting))

        return i;


      });
      updateCostingValuesInStructure()
    } catch (error) {

    }
    return tempArr;
  }

  /**
  * @method getTransportationTotalCostForAssembly
  * @description GET TRANSPORTATION TOTAL COST FOR ASSEMBLY
  */
  const getTransportationTotalCostForAssembly = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if (el.PartType === 'BOP') {
        return accummlator;
      } else if ((el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) || (el.IsAssemblyPart)) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el?.CostingPartDetails?.TotalTransportationCostPerAssembly);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = (values) => { }

  const setSurfaceTreatmentCostAssemblyTechnology = (surfaceTreatmentGrid, transportationGrid, params) => {
    let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray

    let surfacetreatmentSum = 0
    surfacetreatmentSum = surfaceTreatmentGrid && surfaceTreatmentGrid.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.SurfaceTreatmentCost)
    }, 0)

    let totalCost = checkForNull(surfacetreatmentSum) + checkForNull(transportationGrid?.TransportationCost)

    tempsubAssemblyTechnologyArray[0].CostingPartDetails.SurfaceTreatmentCost = surfacetreatmentSum

    tempsubAssemblyTechnologyArray[0].CostingPartDetails.SurfaceTreatmentGrid = surfaceTreatmentGrid
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.SurfaceTreatmentDetails = surfaceTreatmentGrid
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.TransportationCost = transportationGrid?.TransportationCost
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.TransportationGrid = transportationGrid.tempObj
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.TransportationDetails = transportationGrid
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetSurfaceTreatmentCost = totalCost


    dispatch(setSubAssemblyTechnologyArray(tempsubAssemblyTechnologyArray, res => { }))

    setSurfaceCost(surfaceTreatmentGrid, params)
    setTransportationCost(transportationGrid, params)
    // props.setTransportationCost(transportObj, transportationObject.Params)


    // dispatch(setSurfaceData(tempsubAssemblyTechnologyArray, () => { }))
    // // STORING CALCULATED AND UPDATED COSTING VALUE IN LOCAL STORAGE
    // sessionStorage.setItem('surfaceCostingArray', JSON.stringify([]))
    // reactLocalStorage.setObject('surfaceCostingArray', tempsubAssemblyTechnologyArray)

  }

  return (
    <>
      {/* {filteredUsers} */}
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
                    <Table className="table cr-brdr-main surfacetreatment-main-headings" size="sm">
                      <thead>
                        <tr>
                          <th className="py-3 align-middle" style={{ width: "140px" }}>{`Part Number`}</th>
                          <th className="py-3 align-middle" style={{ width: '100px' }}>{`Level`}</th>
                          <th className="py-3 align-middle" style={{ width: '100px' }}>{`Type`}</th>
                          <th className="py-3 align-middle word-nowrap" style={{ width: "120px" }}>{`Surface Treatment Cost`}</th>
                          <th className="py-3 align-middle" style={{ width: "150px" }}>{`Extra Cost`}</th>
                          <th className="py-align-middle" style={{ width: "100px" }}>{`Quantity`}</th>
                          <th className="py-3 align-middle word-nowrap" style={{ width: "150px" }}>{`Total Surface Treatment Cost`}</th>
                          <th className="py-3 align-middle" style={{ width: "100px" }}>{``}</th>
                        </tr>
                      </thead>
                      <tbody>

                        {
                          SurfaceTabData && SurfaceTabData.map((item, index) => {
                            if ((item && item.PartType === 'Component') || partType || isBreakupBoughtOutPartCostingFromAPI) {

                              return (
                                < >
                                  <PartSurfaceTreatment
                                    index={index}
                                    item={item}
                                    setPartDetails={setPartDetails}
                                    setSurfaceCost={setSurfaceCost}
                                    setTransportationCost={setTransportationCost}
                                    IsAssemblyCalculation={false}
                                    subAssembId={vbcExistingCosting.SubAssemblyCostingId ? vbcExistingCosting.SubAssemblyCostingId : costData.CostingId}
                                    isAssemblyTechnology={true}
                                    setSurfaceTreatmentCostAssemblyTechnology={setSurfaceTreatmentCostAssemblyTechnology}
                                    activeTab={props.activeTab}
                                  />
                                </>
                              )

                            } else if (item && item.PartType === 'BOP') return false
                            else {
                              return (
                                < >
                                  <AssemblySurfaceTreatment
                                    index={index}
                                    item={item}
                                    children={item.CostingChildPartDetails}
                                    toggleAssembly={toggleAssembly}
                                    setPartDetails={setPartDetails}
                                    setSurfaceCost={setSurfaceCost}
                                    setTransportationCost={setTransportationCost}
                                    setAssemblySurfaceCost={setAssemblySurfaceCost}
                                    setAssemblyTransportationCost={setAssemblyTransportationCost}
                                    subAssembId={vbcExistingCosting.SubAssemblyCostingId ? vbcExistingCosting.SubAssemblyCostingId : costData.CostingId}
                                    activeTab={props.activeTab}
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

                {/* <Row className="sf-btn-footer no-gutters justify-content-between mt25 mb-35-minus">
                  <div className="col-sm-12 text-right bluefooter-butn">
                    <button
                      type={"button"}
                      className="submit-button mr5 save-btn"
                      onClick={saveCosting}
                    >
                      <div className={"save-icon"}></div>
                      {"Save"}
                    </button>
                  </div>
                </Row> */}
              </form>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default React.memo(TabSurfaceTreatment);