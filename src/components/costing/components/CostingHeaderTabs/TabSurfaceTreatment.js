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
function TabSurfaceTreatment(props) {

  const { handleSubmit, } = useForm();
  const dispatch = useDispatch()
  let SurfaceTabData = useSelector(state => state.costing.SurfaceTabData)
  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const selectedCostingDetail = useContext(SelectedCostingDetail);
  const headerCosts = useContext(netHeadCostContext);
  const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)
  const IsMultiVendorCosting = useSelector(state => state.costing?.IsMultiVendorCosting);
  const partType = (IdForMultiTechnology.includes(String(costData?.TechnologyId)) || costData.CostingTypeId === WACTypeId||(costData?.PartType === 'Assembly' && IsMultiVendorCosting))   // ASSEMBLY TECHNOLOGY
  const { ComponentItemData, CostingDataList, isBreakupBoughtOutPartCostingFromAPI } = useSelector(state => state.costing)
  const netPOPrice = useContext(NetPOPriceContext);


  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
        AssemCostingId: selectedCostingDetail.AssemblyCostingId ? selectedCostingDetail.AssemblyCostingId : costData.CostingId,
        SubAsmCostingId: selectedCostingDetail.SubAssemblyCostingId ? selectedCostingDetail.SubAssemblyCostingId : costData.CostingId,
        isComponentCosting: costData?.PartType === "Component" ? true : false
      }
      dispatch(getSurfaceTreatmentTabData(data, true, res => {
        let tempArr = [];
        tempArr.push(res?.data?.DataList[0]);
        if (!partType && res?.data?.DataList && res?.data?.DataList[0]?.CostingChildPartDetails) {
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

        let tempArr = _.cloneDeep(JSON.parse(sessionStorage.getItem('surfaceCostingArray')))
        let partIndex = tempArr && tempArr.findIndex(item => item.PartNumber === Params.PartNumber && partItem.AssemblyPartNumber === item.AssemblyPartNumber)
        let partObj = tempArr && tempArr.find(item => item.PartNumber === Params.PartNumber && partItem.AssemblyPartNumber === item.AssemblyPartNumber)

        partObj.CostingPartDetails.SurfaceTreatmentCost = surfaceCost(Data.SurfaceTreatmentDetails);
        partObj.CostingPartDetails.TransportationCost = checkForNull(Data.TransportationCost);
        partObj.CostingPartDetails.SurfaceTreatmentDetails = Data.SurfaceTreatmentDetails;
        partObj.CostingPartDetails.NetSurfaceTreatmentCost = checkForNull(partObj?.CostingPartDetails?.SurfaceTreatmentCost) + checkForNull(partObj?.CostingPartDetails?.TransportationCost) + checkForNull(partObj?.CostingPartDetails?.HangerCostPerPart) + checkForNull(partObj?.CostingPartDetails?.TotalPaintCost)
        partObj.CostingPartDetails.TransportationDetails = Data.TransportationDetails;
        tempArr = Object.assign([...tempArr], { [partIndex]: partObj })

        // STORING CALCULATED AND UPDATED COSTING VALUE IN LOCAL STORAGE
        sessionStorage.setItem('surfaceCostingArray', JSON.stringify([]))
        sessionStorage.setItem('surfaceCostingArray', JSON.stringify(tempArr))


        const mapArray = (data) => data.map(item => {

          let newItem = item
          let updatedArr = _.cloneDeep(JSON.parse(sessionStorage.getItem('surfaceCostingArray')))
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
            newItem.CostingPartDetails.HangerCostPerPart = checkForNull(obj?.CostingPartDetails?.HangerCostPerPart)
            newItem.CostingPartDetails.HangerRate = checkForNull(obj?.CostingPartDetails?.HangerRate)
            newItem.CostingPartDetails.NumberOfPartsPerHanger = checkForNull(obj?.CostingPartDetails?.NumberOfPartsPerHanger)
            newItem.CostingPartDetails.HangerCostPerPartComponent = checkForNull(obj?.CostingPartDetails?.HangerCostPerPartComponent)
            newItem.CostingPartDetails.HangerCostPerPartPerAssembly = checkForNull(obj?.CostingPartDetails?.HangerCostPerPartPerAssembly)
            newItem.CostingPartDetails.HangerCostPerPartPerSubAssembly = checkForNull(obj?.CostingPartDetails?.HangerCostPerPartPerSubAssembly)
            newItem.CostingPartDetails.HangerCostPerPartWithQuantity = checkForNull(obj?.CostingPartDetails?.HangerCostPerPartWithQuantity)

            newItem.CostingPartDetails.PaintCost = checkForNull(obj?.CostingPartDetails?.PaintCost)
            newItem.CostingPartDetails.PaintCostComponent = checkForNull(obj?.CostingPartDetails?.PaintCostComponent)
            newItem.CostingPartDetails.PaintCostPerAssembly = checkForNull(obj?.CostingPartDetails?.PaintCostPerAssembly)
            newItem.CostingPartDetails.PaintCostPerSubAssembly = checkForNull(obj?.CostingPartDetails?.PaintCostPerSubAssembly)
            newItem.CostingPartDetails.PaintCostWithQuantity = checkForNull(obj?.CostingPartDetails?.PaintCostWithQuantity)

            newItem.CostingPartDetails.PaintConsumptionCost = checkForNull(obj?.CostingPartDetails?.PaintConsumptionCost)
            newItem.CostingPartDetails.PaintConsumptionCostComponent = checkForNull(obj?.CostingPartDetails?.PaintConsumptionCostComponent)
            newItem.CostingPartDetails.PaintConsumptionCostPerAssembly = checkForNull(obj?.CostingPartDetails?.PaintConsumptionCostPerAssembly)
            newItem.CostingPartDetails.PaintConsumptionCostPerSubAssembly = checkForNull(obj?.CostingPartDetails?.PaintConsumptionCostPerSubAssembly)
            newItem.CostingPartDetails.PaintConsumptionCostWithQuantity = checkForNull(obj?.CostingPartDetails?.PaintConsumptionCostWithQuantity)

            newItem.CostingPartDetails.TapeCost = checkForNull(obj?.CostingPartDetails?.TapeCost)
            newItem.CostingPartDetails.TapeCostComponent = checkForNull(obj?.CostingPartDetails?.TapeCostComponent)
            newItem.CostingPartDetails.TapeCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TapeCostPerAssembly)
            newItem.CostingPartDetails.TapeCostPerSubAssembly = checkForNull(obj?.CostingPartDetails?.TapeCostPerSubAssembly)
            newItem.CostingPartDetails.TapeCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TapeCostWithQuantity)

            newItem.CostingPartDetails.TotalPaintCost = checkForNull(obj?.CostingPartDetails?.TotalPaintCost)
            newItem.CostingPartDetails.TotalPaintCostComponent = checkForNull(obj?.CostingPartDetails?.TotalPaintCostComponent)
            newItem.CostingPartDetails.TotalPaintCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TotalPaintCostPerAssembly)
            newItem.CostingPartDetails.TotalPaintCostPerSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalPaintCostPerSubAssembly)
            newItem.CostingPartDetails.TotalPaintCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalPaintCostWithQuantity)
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

    let updatedArr = _.cloneDeep(JSON.parse(sessionStorage.getItem('surfaceCostingArray')))
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
    subAssemblyToUpdate.CostingPartDetails.TotalPaintCostPerSubAssembly = checkForNull(totalPaintCostSubAssembly(childArray))
    subAssemblyToUpdate.CostingPartDetails.TotalPaintCostComponent = checkForNull(totalPaintCostPart(childArray))
    subAssemblyToUpdate.CostingPartDetails.TotalPaintCostWithQuantity = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalPaintCostPerAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalPaintCostPerSubAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalPaintCostComponent)
    subAssemblyToUpdate.CostingPartDetails.TapeCostComponent = checkForNull(tapeCostPart(childArray))
    subAssemblyToUpdate.CostingPartDetails.TapeCostPerSubAssembly = checkForNull(tapeCostSubAssembly(childArray))
    subAssemblyToUpdate.CostingPartDetails.TapeCostWithQuantity = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TapeCostPerAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TapeCostPerSubAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TapeCostComponent)
    subAssemblyToUpdate.CostingPartDetails.PaintCostComponent = checkForNull(paintCostPart(childArray))
    subAssemblyToUpdate.CostingPartDetails.PaintCostPerSubAssembly = checkForNull(paintCostSubAssembly(childArray))
    subAssemblyToUpdate.CostingPartDetails.PaintCostWithQuantity = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.PaintCostPerAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.PaintCostPerSubAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.PaintCostComponent)

    subAssemblyToUpdate.CostingPartDetails.HangerCostPerPartComponent = checkForNull(totalhangerCostPerPart(childArray))
    subAssemblyToUpdate.CostingPartDetails.HangerCostPerPartPerSubAssembly = checkForNull(hangerCostSubAssembly(childArray))
    subAssemblyToUpdate.CostingPartDetails.HangerCostPerPartWithQuantity = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.HangerCostPerPartPerAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.HangerCostPerPartPerSubAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.HangerCostPerPartComponent)




    subAssemblyToUpdate.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostWithQuantitys = (checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalTransportationCostWithQuantity) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalPaintCostWithQuantity) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.HangerCostPerPartWithQuantity)) * subAssemblyToUpdate.Quantity
    subAssemblyToUpdate.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerAssembly = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalTransportationCostPerAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalPaintCostPerAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.HangerCostPerPartPerAssembly)
    subAssemblyToUpdate.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerSubAssembly = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalTransportationCostPerSubAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalPaintCostPerSubAssembly) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.HangerCostPerPartPerSubAssembly)
    subAssemblyToUpdate.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostComponent = checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalSurfaceTreatmentCostComponent) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalTransportationCostComponent) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.TotalPaintCostComponent) + checkForNull(subAssemblyToUpdate?.CostingPartDetails?.HangerCostPerPartComponent)
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
          let subAssemblyToUpdate = { ...tempArrForCosting[subbAssemblyIndex] }
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
          assemblyObj.CostingPartDetails.HangerCostPerPartComponent = checkForNull(totalhangerCostPerPart(subAssemblyArray))
          assemblyObj.CostingPartDetails.HangerCostPerPartPerSubAssembly = checkForNull(hangerCostSubAssembly(subAssemblyArray))
          assemblyObj.CostingPartDetails.HangerCostPerPartWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.HangerCostPerPartComponent) + checkForNull(assemblyObj?.CostingPartDetails?.HangerCostPerPartPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.HangerCostPerPartPerSubAssembly)
          assemblyObj.CostingPartDetails.TapeCostComponent = checkForNull(tapeCostPart(subAssemblyArray))
          assemblyObj.CostingPartDetails.TapeCostPerSubAssembly = checkForNull(tapeCostSubAssembly(subAssemblyArray))
          assemblyObj.CostingPartDetails.TapeCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.TapeCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.TapeCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TapeCostPerSubAssembly)
          assemblyObj.CostingPartDetails.PaintCostComponent = checkForNull(paintCostPart(subAssemblyArray))
          assemblyObj.CostingPartDetails.PaintCostPerSubAssembly = checkForNull(paintCostSubAssembly(subAssemblyArray))
          assemblyObj.CostingPartDetails.PaintCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.PaintCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.PaintCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.PaintCostPerSubAssembly)
          assemblyObj.CostingPartDetails.TotalPaintCostComponent = checkForNull(totalPaintCostPart(subAssemblyArray))
          assemblyObj.CostingPartDetails.TotalPaintCostPerSubAssembly = checkForNull(totalPaintCostSubAssembly(subAssemblyArray))
          assemblyObj.CostingPartDetails.TotalPaintCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.TotalPaintCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.TotalPaintCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalPaintCostPerSubAssembly)
          assemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostWithQuantitys = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalPaintCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.HangerCostPerPartWithQuantity)
          assemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerAssembly = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalPaintCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.HangerCostPerPartPerAssembly)
          assemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerSubAssembly = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostPerSubAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalPaintCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.HangerCostPerPartPerSubAssembly)
          assemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostComponent = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.TotalPaintCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.HangerCostPerPartComponent)
          assemblyObj.CostingPartDetails.NetSurfaceTreatmentCost = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalPaintCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.HangerCostPerPartWithQuantity)
          assemblyObj.CostingPartDetails.BasicRate = checkForNull(assemblyObj?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(dataList?.CostingPartDetails?.NetTotalRMBOPCC)
        }
        assemblyObj.IsOpen = params.BOMLevel !== LEVEL0 ? true : !assemblyObj.IsOpen
        tempArrForCosting = Object.assign([...tempArrForCosting], { 0: assemblyObj })

        sessionStorage.setItem('surfaceCostingArray', JSON.stringify([]))
        sessionStorage.setItem('surfaceCostingArray', JSON.stringify(tempArrForCosting))

        const mapArray = (data) => data.map(item => {

          let newItem = item
          let updatedArr = _.cloneDeep(JSON.parse(sessionStorage.getItem('surfaceCostingArray')))

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
            newItem.CostingPartDetails.HangerCostPerPart = checkForNull(obj?.CostingPartDetails?.HangerCostPerPart)
            newItem.CostingPartDetails.HangerRate = checkForNull(obj?.CostingPartDetails?.HangerRate)
            newItem.CostingPartDetails.NumberOfPartsPerHanger = checkForNull(obj?.CostingPartDetails?.NumberOfPartsPerHanger)
            newItem.CostingPartDetails.HangerCostPerPartComponent = checkForNull(obj?.CostingPartDetails?.HangerCostPerPartComponent)
            newItem.CostingPartDetails.HangerCostPerPartPerAssembly = checkForNull(obj?.CostingPartDetails?.HangerCostPerPartPerAssembly)
            newItem.CostingPartDetails.HangerCostPerPartPerSubAssembly = checkForNull(obj?.CostingPartDetails?.HangerCostPerPartPerSubAssembly)
            newItem.CostingPartDetails.HangerCostPerPartWithQuantity = checkForNull(obj?.CostingPartDetails?.HangerCostPerPartWithQuantity)

            newItem.CostingPartDetails.PaintCost = checkForNull(obj?.CostingPartDetails?.PaintCost)
            newItem.CostingPartDetails.PaintCostComponent = checkForNull(obj?.CostingPartDetails?.PaintCostComponent)
            newItem.CostingPartDetails.PaintCostPerAssembly = checkForNull(obj?.CostingPartDetails?.PaintCostPerAssembly)
            newItem.CostingPartDetails.PaintCostPerSubAssembly = checkForNull(obj?.CostingPartDetails?.PaintCostPerSubAssembly)
            newItem.CostingPartDetails.PaintCostWithQuantity = checkForNull(obj?.CostingPartDetails?.PaintCostWithQuantity)

            newItem.CostingPartDetails.PaintConsumptionCost = checkForNull(obj?.CostingPartDetails?.PaintConsumptionCost)
            newItem.CostingPartDetails.PaintConsumptionCostComponent = checkForNull(obj?.CostingPartDetails?.PaintConsumptionCostComponent)
            newItem.CostingPartDetails.PaintConsumptionCostPerAssembly = checkForNull(obj?.CostingPartDetails?.PaintConsumptionCostPerAssembly)
            newItem.CostingPartDetails.PaintConsumptionCostPerSubAssembly = checkForNull(obj?.CostingPartDetails?.PaintConsumptionCostPerSubAssembly)
            newItem.CostingPartDetails.PaintConsumptionCostWithQuantity = checkForNull(obj?.CostingPartDetails?.PaintConsumptionCostWithQuantity)

            newItem.CostingPartDetails.TapeCost = checkForNull(obj?.CostingPartDetails?.TapeCost)
            newItem.CostingPartDetails.TapeCostComponent = checkForNull(obj?.CostingPartDetails?.TapeCostComponent)
            newItem.CostingPartDetails.TapeCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TapeCostPerAssembly)
            newItem.CostingPartDetails.TapeCostPerSubAssembly = checkForNull(obj?.CostingPartDetails?.TapeCostPerSubAssembly)
            newItem.CostingPartDetails.TapeCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TapeCostWithQuantity)

            newItem.CostingPartDetails.TotalPaintCost = checkForNull(obj?.CostingPartDetails?.TotalPaintCost)
            newItem.CostingPartDetails.TotalPaintCostComponent = checkForNull(obj?.CostingPartDetails?.TotalPaintCostComponent)
            newItem.CostingPartDetails.TotalPaintCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TotalPaintCostPerAssembly)
            newItem.CostingPartDetails.TotalPaintCostPerSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalPaintCostPerSubAssembly)
            newItem.CostingPartDetails.TotalPaintCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalPaintCostWithQuantity)



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

        const updatedArr1 = mapArray(_.cloneDeep(SurfaceTabData))


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
  const setSurfaceCost = (surfaceGrid, params, IsGridChanged, hangerCostDetails, extraCostDetails, paintAndMaskingDetails) => {
    let arr = dispatchSurfaceCost(surfaceGrid, params, SurfaceTabData, hangerCostDetails, extraCostDetails, paintAndMaskingDetails)

    // let arr1 = assemblyTotalSurfaceTransportCost(arr)
    dispatch(setSurfaceData(arr, () => { }))
  }

  /**
  * @method dispatchSurfaceCosts
  * @description DISPATCHED SURFACE COST
  */
  const dispatchSurfaceCost = (surfaceGrid, params, arr, hangerCostDetails, extraCostDetails, paintAndMaskingDetails) => {


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
          i.CostingPartDetails.HangerCostPerPart = checkForNull(hangerCostDetails?.HangerCostPerPart)
          i.CostingPartDetails.HangerRate = checkForNull(hangerCostDetails?.HangerRate)
          i.CostingPartDetails.NumberOfPartsPerHanger = checkForNull(hangerCostDetails?.NumberOfPartsPerHanger)
          i.CostingPartDetails.HangerRemark = hangerCostDetails?.HangerRemark
          i.CostingPartDetails.TotalPaintCost = checkForNull(paintAndMaskingDetails?.TotalPaintCost)
          i.CostingPartDetails.PaintCost = checkForNull(paintAndMaskingDetails?.PaintCost)
          i.CostingPartDetails.PaintConsumptionCost = checkForNull(paintAndMaskingDetails?.PaintConsumptionCost)
          i.CostingPartDetails.TapeCost = checkForNull(paintAndMaskingDetails?.TapeCost)
          i.CostingPartDetails.TransportationCost = checkForNull(extraCostDetails?.TransportationCost)
          i.CostingPartDetails.TransportationDetails = extraCostDetails?.TransportationDetails

          dispatchSurfaceCost(surfaceGrid, params, i.CostingChildPartDetails, hangerCostDetails, extraCostDetails, paintAndMaskingDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {



          i.CostingPartDetails.SurfaceTreatmentCost = surfaceCost(surfaceGrid);
          i.CostingPartDetails.SurfaceTreatmentDetails = surfaceGrid;
          i.CostingPartDetails.HangerCostPerPart = checkForNull(hangerCostDetails?.HangerCostPerPart)
          i.CostingPartDetails.HangerRate = checkForNull(hangerCostDetails?.HangerRate)
          i.CostingPartDetails.NumberOfPartsPerHanger = checkForNull(hangerCostDetails?.NumberOfPartsPerHanger)
          i.CostingPartDetails.HangerRemark = hangerCostDetails?.HangerRemark
          i.CostingPartDetails.TotalPaintCost = checkForNull(paintAndMaskingDetails?.TotalPaintCost)
          i.CostingPartDetails.PaintCost = checkForNull(paintAndMaskingDetails?.PaintCost)
          i.CostingPartDetails.PaintConsumptionCost = checkForNull(paintAndMaskingDetails?.PaintConsumptionCost)
          i.CostingPartDetails.TapeCost = checkForNull(paintAndMaskingDetails?.TapeCost)
          i.CostingPartDetails.TransportationCost = checkForNull(extraCostDetails?.TransportationCost)
          i.CostingPartDetails.TransportationDetails = extraCostDetails?.TransportationDetails
          i.CostingPartDetails.NetSurfaceTreatmentCost = checkForNull(surfaceCost(surfaceGrid)) + checkForNull(i?.CostingPartDetails?.TransportationCost) + checkForNull(i?.CostingPartDetails?.HangerCostPerPart) + checkForNull(i?.CostingPartDetails?.TotalPaintCost);

        } else {

          dispatchSurfaceCost(surfaceGrid, params, i.CostingChildPartDetails, hangerCostDetails, extraCostDetails, paintAndMaskingDetails)
        }
        let tempArr = _.cloneDeep(JSON.parse(sessionStorage.getItem('surfaceCostingArray')))


        let partObj = tempArr[0]

        partObj.CostingPartDetails.SurfaceTreatmentCost = surfaceCost(surfaceGrid);
        partObj.CostingPartDetails.SurfaceTreatmentDetails = surfaceGrid;
        partObj.CostingPartDetails.HangerCostPerPart = checkForNull(hangerCostDetails?.HangerCostPerPart)
        partObj.CostingPartDetails.HangerRate = checkForNull(hangerCostDetails?.HangerRate)
        partObj.CostingPartDetails.HangerRemark = hangerCostDetails?.HangerRemark
        partObj.CostingPartDetails.NumberOfPartsPerHanger = checkForNull(hangerCostDetails?.NumberOfPartsPerHanger)
        partObj.CostingPartDetails.TotalPaintCost = checkForNull(paintAndMaskingDetails?.TotalPaintCost)
        partObj.CostingPartDetails.PaintCost = checkForNull(paintAndMaskingDetails?.PaintCost)
        partObj.CostingPartDetails.PaintConsumptionCost = checkForNull(paintAndMaskingDetails?.PaintConsumptionCost)
        partObj.CostingPartDetails.TapeCost = checkForNull(paintAndMaskingDetails?.TapeCost)
        partObj.CostingPartDetails.TransportationCost = checkForNull(extraCostDetails?.TransportationCost)
        partObj.CostingPartDetails.TransportationDetails = extraCostDetails?.TransportationDetails
        partObj.CostingPartDetails.NetSurfaceTreatmentCost = checkForNull(surfaceCost(surfaceGrid)) + checkForNull(partObj.CostingPartDetails.TransportationCost) + checkForNull(partObj.CostingPartDetails.HangerCostPerPart) + checkForNull(partObj.CostingPartDetails.TotalPaintCost);


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
    let tempArr = _.cloneDeep(JSON.parse(sessionStorage.getItem('surfaceCostingArray')))

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
            checkForNull(transportationObj.TransportationCost) + checkForNull(i?.CostingPartDetails?.HangerCostPerPart) + checkForNull(i?.CostingPartDetails?.TotalPaintCost);

          i.CostingPartDetails.NetSurfaceTreatmentCost = NetSurfaceTreatmentCost;
          i.CostingPartDetails.TransportationCost = checkForNull(transportationObj.TransportationCost);
          i.CostingPartDetails.TransportationDetails = transportationObj;

        } else {
          dispatchTransportationCost(transportationObj, params, i.CostingChildPartDetails)
        }
        let tempArr = _.cloneDeep(JSON.parse(sessionStorage.getItem('surfaceCostingArray')))

        let partObj = tempArr[0]

        const total = checkForNull(dataList.NetTotalRMBOPCC) + checkForNull(NetSurfaceTreatmentCost) + checkForNull(dataList.NetOverheadAndProfitCost) + checkForNull(dataList.NetPackagingAndFreight) + checkForNull(dataList.ToolCost) + checkForNull(dataList.NetOtherCost) - checkForNull(dataList.NetDiscountsCost)
        partObj.CostingPartDetails.BasicRate = total;
        partObj.CostingPartDetails.NetSurfaceTreatmentCost = checkForNull(surfaceCost(i?.CostingPartDetails?.SurfaceTreatmentDetails)) +
          checkForNull(transportationObj.TransportationCost) + checkForNull(i?.CostingPartDetails?.HangerCostPerPart) + checkForNull(i?.CostingPartDetails?.TotalPaintCost);
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

  const paintCostSubAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Sub Assembly') {
        return accummlator + checkForNull(item?.CostingPartDetails?.PaintCostWithQuantity) * checkForNull(item?.Quantity)
      } else {
        return accummlator
      }
    }, 0)

    return total
  }
  const paintConsumptionCostSubAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Sub Assembly') {
        return accummlator + checkForNull(item?.CostingPartDetails?.PaintConsumptionCostWithQuantity) * checkForNull(item?.Quantity)
      } else {
        return accummlator
      }
    }, 0)

    return total
  }



  const tapeCostSubAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Sub Assembly') {
        return accummlator + checkForNull(item?.CostingPartDetails?.TapeCostWithQuantity) * checkForNull(item?.Quantity)
      } else {
        return accummlator
      }
    }, 0)
    return total
  }
  const totalPaintCostSubAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Sub Assembly') {
        return accummlator + checkForNull(item?.CostingPartDetails?.TotalPaintCostWithQuantity) * checkForNull(item?.Quantity)
      } else {
        return accummlator
      }
    }, 0)
    return total
  }

  const hangerCostSubAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {

      if (item.PartType === 'Sub Assembly') {
        return accummlator + checkForNull(item?.CostingPartDetails?.HangerCostPerPartWithQuantity) * checkForNull(item.Quantity)
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

  const tapeCostPart = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + checkForNull(item?.CostingPartDetails?.TapeCost) * checkForNull(item.Quantity)
      } else {
        return accummlator
      }
    }, 0)
    return total
  }
  const paintCostPart = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + checkForNull(item?.CostingPartDetails?.PaintCost) * checkForNull(item.Quantity)
      } else {
        return accummlator
      }
    }, 0)
    return total
  }
  const paintConsumptionCostPart = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + checkForNull(item?.CostingPartDetails?.PaintConsumptionCost) * checkForNull(item.Quantity)
      } else {
        return accummlator
      }
    }, 0)
    return total
  }

  const totalPaintCostPart = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + checkForNull(item?.CostingPartDetails?.TotalPaintCost) * checkForNull(item.Quantity)
      } else {
        return accummlator
      }
    }, 0)
    return total
  }

  const totalhangerCostPerPart = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + checkForNull(item?.CostingPartDetails?.HangerCostPerPart) * checkForNull(item.Quantity)
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


  const calculationForPart = (surfaceGrid = [], item, hangerCostDetails = {}, extraCostDetails = {}, paintAndMaskingDetails = {}) => {
    let obj = item
    let rmCcData = findrmCctData(item)

    obj.CostingPartDetails.SurfaceTreatmentCost = checkForNull(surfaceCost(surfaceGrid));
    obj.CostingPartDetails.SurfaceTreatmentDetails = surfaceGrid;
    obj.CostingPartDetails.HangerCostPerPart = checkForNull(hangerCostDetails?.HangerCostPerPart)
    obj.CostingPartDetails.HangerRate = checkForNull(hangerCostDetails?.HangerRate)
    obj.CostingPartDetails.NumberOfPartsPerHanger = checkForNull(hangerCostDetails?.NumberOfPartsPerHanger)
    obj.CostingPartDetails.TotalPaintCost = checkForNull(paintAndMaskingDetails?.TotalPaintCost)
    obj.CostingPartDetails.PaintCost = checkForNull(paintAndMaskingDetails?.PaintCost)
    obj.CostingPartDetails.PaintConsumptionCost = checkForNull(paintAndMaskingDetails?.PaintConsumptionCost)
    obj.CostingPartDetails.TapeCost = checkForNull(paintAndMaskingDetails?.TapeCost)
    obj.CostingPartDetails.TransportationCost = checkForNull(extraCostDetails?.TransportationCost)
    obj.CostingPartDetails.TransportationDetails = extraCostDetails?.TransportationDetails
    obj.CostingPartDetails.NetSurfaceTreatmentCost = (checkForNull(obj?.CostingPartDetails?.SurfaceTreatmentCost) + checkForNull(extraCostDetails?.TransportationCost) + checkForNull(obj?.CostingPartDetails?.HangerCostPerPart) + checkForNull(obj?.CostingPartDetails?.TotalPaintCost))
    obj.CostingPartDetails.BasicRate = checkForNull(obj.CostingPartDetails.NetSurfaceTreatmentCost) + checkForNull(ComponentItemData?.CostingPartDetails?.NetTotalRMBOPCC)

    return obj
  }


  const calculationForSubAssembly = (surfaceGrid, obj = {}, tempArr = [], TransportationObj = [], params, hangerCostDetails = {}, paintAndMaskingDetails = {}) => {




    let subAssemblyObj = obj
    let rmCcData = findrmCctData(subAssemblyObj)

    subAssemblyObj.CostingPartDetails.SurfaceTreatmentCost = checkForNull(surfaceCost(surfaceGrid))
    subAssemblyObj.CostingPartDetails.SurfaceTreatmentDetails = (params.PartNumber === subAssemblyObj.PartNumber) ? surfaceGrid : subAssemblyObj?.CostingPartDetails?.SurfaceTreatmentDetails;
    subAssemblyObj.CostingPartDetails.TotalSurfaceTreatmentCostComponent = surfaceCostPart(tempArr) //SURFACE TREATMENT COST OF COMPONENE OF THAT ASSEMBLY
    subAssemblyObj.CostingPartDetails.TotalSurfaceTreatmentCostPerSubAssembly = checkForNull(surfaceCostSubAssembly(tempArr)) // SURFACE TREATMENT COST OF IT'S SUBASSEMBLIES
    subAssemblyObj.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly = (params.PartNumber === subAssemblyObj.PartNumber) ? checkForNull(surfaceCost(surfaceGrid)) : checkForNull(subAssemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly) //OPERATION COST ADDED ON THAT PARTICULAR ASSEMBLY
    subAssemblyObj.CostingPartDetails.TotalSurfaceTreatmentCostWithQuantity = checkForNull(subAssemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly) + checkForNull(subAssemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly) + checkForNull(subAssemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostComponent)

    subAssemblyObj.CostingPartDetails.HangerRate = (params.PartNumber === subAssemblyObj.PartNumber) ? checkForNull(hangerCostDetails?.HangerRate) : checkForNull(subAssemblyObj?.CostingPartDetails?.HangerRate)
    subAssemblyObj.CostingPartDetails.NumberOfPartsPerHanger = (params.PartNumber === subAssemblyObj.PartNumber) ? checkForNull(hangerCostDetails?.NumberOfPartsPerHanger) : checkForNull(subAssemblyObj?.CostingPartDetails?.NumberOfPartsPerHanger)
    subAssemblyObj.CostingPartDetails.HangerCostPerPart = (params.PartNumber === subAssemblyObj.PartNumber) ? checkForNull(hangerCostDetails?.HangerCostPerPart) : checkForNull(subAssemblyObj?.CostingPartDetails?.HangerCostPerPart)
    subAssemblyObj.CostingPartDetails.HangerCostPerPartComponent = totalhangerCostPerPart(tempArr)
    subAssemblyObj.CostingPartDetails.HangerCostPerPartPerSubAssembly = checkForNull(hangerCostSubAssembly(tempArr))

    subAssemblyObj.CostingPartDetails.HangerCostPerPartPerAssembly = (params.PartNumber === subAssemblyObj.PartNumber) ? checkForNull(hangerCostDetails?.HangerCostPerPart) : checkForNull(subAssemblyObj?.CostingPartDetails?.HangerCostPerPartPerAssembly)


    subAssemblyObj.CostingPartDetails.HangerCostPerPartWithQuantity = checkForNull(subAssemblyObj?.CostingPartDetails?.HangerCostPerPartPerAssembly) + checkForNull(subAssemblyObj?.CostingPartDetails?.HangerCostPerPartPerSubAssembly) + checkForNull(subAssemblyObj?.CostingPartDetails?.HangerCostPerPartComponent)

    subAssemblyObj.CostingPartDetails.PaintCost = (params.PartNumber === subAssemblyObj.PartNumber) ? checkForNull(paintAndMaskingDetails?.PaintCost) : checkForNull(subAssemblyObj?.CostingPartDetails?.PaintCost)
    subAssemblyObj.CostingPartDetails.PaintCostComponent = checkForNull(paintCostPart(tempArr))
    subAssemblyObj.CostingPartDetails.PaintCostPerSubAssembly = checkForNull(paintCostSubAssembly(tempArr))
    subAssemblyObj.CostingPartDetails.PaintCostPerAssembly = (params.PartNumber === subAssemblyObj.PartNumber) ? checkForNull(paintAndMaskingDetails?.PaintCost) : checkForNull(subAssemblyObj?.CostingPartDetails?.PaintCostPerAssembly)
    subAssemblyObj.CostingPartDetails.PaintCostWithQuantity = checkForNull(subAssemblyObj?.CostingPartDetails?.PaintCostPerAssembly) + checkForNull(subAssemblyObj?.CostingPartDetails?.PaintCostPerSubAssembly) + checkForNull(subAssemblyObj?.CostingPartDetails?.PaintCostComponent)

    subAssemblyObj.CostingPartDetails.PaintConsumptionCost = (params.PartNumber === subAssemblyObj.PartNumber) ? checkForNull(paintAndMaskingDetails?.PaintConsumptionCost) : checkForNull(subAssemblyObj?.CostingPartDetails?.PaintConsumptionCost)
    subAssemblyObj.CostingPartDetails.PaintConsumptionCostComponent = checkForNull(paintConsumptionCostPart(tempArr))
    subAssemblyObj.CostingPartDetails.PaintConsumptionCostPerSubAssembly = checkForNull(paintConsumptionCostSubAssembly(tempArr))
    subAssemblyObj.CostingPartDetails.PaintConsumptionCostPerAssembly = (params.PartNumber === subAssemblyObj.PartNumber) ? checkForNull(paintAndMaskingDetails?.PaintConsumptionCost) : checkForNull(subAssemblyObj?.CostingPartDetails?.PaintConsumptionCostPerAssembly)
    subAssemblyObj.CostingPartDetails.PaintConsumptionCostWithQuantity = checkForNull(subAssemblyObj?.CostingPartDetails?.PaintConsumptionCostPerAssembly) + checkForNull(subAssemblyObj?.CostingPartDetails?.PaintConsumptionCostPerSubAssembly) + checkForNull(subAssemblyObj?.CostingPartDetails?.PaintConsumptionCostComponent)

    subAssemblyObj.CostingPartDetails.TapeCost = (params.PartNumber === subAssemblyObj.PartNumber) ? checkForNull(paintAndMaskingDetails?.TapeCost) : checkForNull(subAssemblyObj?.CostingPartDetails?.TapeCost)
    subAssemblyObj.CostingPartDetails.TapeCostComponent = tapeCostPart(tempArr)
    subAssemblyObj.CostingPartDetails.TapeCostPerSubAssembly = checkForNull(tapeCostSubAssembly(tempArr))
    subAssemblyObj.CostingPartDetails.TapeCostPerAssembly = (params.PartNumber === subAssemblyObj.PartNumber) ? checkForNull(paintAndMaskingDetails?.TapeCost) : checkForNull(subAssemblyObj?.CostingPartDetails?.TapeCostPerAssembly)
    subAssemblyObj.CostingPartDetails.TapeCostWithQuantity = checkForNull(subAssemblyObj?.CostingPartDetails?.TapeCostPerAssembly) + checkForNull(subAssemblyObj?.CostingPartDetails?.TapeCostPerSubAssembly) + checkForNull(subAssemblyObj?.CostingPartDetails?.TapeCostComponent)

    subAssemblyObj.CostingPartDetails.TotalPaintCost = (params.PartNumber === subAssemblyObj.PartNumber) ? checkForNull(paintAndMaskingDetails?.TotalPaintCost) : checkForNull(subAssemblyObj?.CostingPartDetails?.TotalPaintCost)
    subAssemblyObj.CostingPartDetails.TotalPaintCostComponent = totalPaintCostPart(tempArr)
    subAssemblyObj.CostingPartDetails.TotalPaintCostPerSubAssembly = totalPaintCostSubAssembly(tempArr)
    subAssemblyObj.CostingPartDetails.TotalPaintCostPerAssembly = (params.PartNumber === subAssemblyObj.PartNumber) ? checkForNull(paintAndMaskingDetails?.TotalPaintCost) : checkForNull(subAssemblyObj?.CostingPartDetails?.TotalPaintCostPerAssembly)
    subAssemblyObj.CostingPartDetails.TotalPaintCostWithQuantity = checkForNull(subAssemblyObj?.CostingPartDetails?.TotalPaintCostPerAssembly) + checkForNull(subAssemblyObj?.CostingPartDetails?.TotalPaintCostPerSubAssembly) + checkForNull(subAssemblyObj?.CostingPartDetails?.TotalPaintCostComponent)


    subAssemblyObj.CostingPartDetails.TransportationCost = (params.PartNumber === subAssemblyObj.PartNumber) ? checkForNull(TransportationObj?.TransportationCost) : checkForNull(subAssemblyObj?.CostingPartDetails?.TransportationCost)
    subAssemblyObj.CostingPartDetails.TransportationDetails = (params.PartNumber === subAssemblyObj.PartNumber) ? TransportationObj?.TransportationDetails : subAssemblyObj?.CostingPartDetails?.TransportationDetails
    subAssemblyObj.CostingPartDetails.TotalTransportationCostPerAssembly = (params.PartNumber === subAssemblyObj.PartNumber) ? checkForNull(TransportationObj?.TransportationCost) : checkForNull(subAssemblyObj?.CostingPartDetails?.TotalTransportationCostPerAssembly)
    subAssemblyObj.CostingPartDetails.TotalTransportationCostPerSubAssembly = transportCostSubAssembly(tempArr)
    subAssemblyObj.CostingPartDetails.TotalTransportationCostComponent = transportCostPart(tempArr)
    subAssemblyObj.CostingPartDetails.TotalTransportationCostWithQuantity = checkForNull(subAssemblyObj?.CostingPartDetails?.TotalTransportationCostPerAssembly) + checkForNull(subAssemblyObj?.CostingPartDetails?.TotalTransportationCostPerSubAssembly) + checkForNull(subAssemblyObj?.CostingPartDetails?.TotalTransportationCostComponent)


    subAssemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerAssembly = checkForNull(subAssemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly) + checkForNull(subAssemblyObj?.CostingPartDetails?.TotalTransportationCostPerAssembly) + checkForNull(subAssemblyObj?.CostingPartDetails?.TotalPaintCostPerAssembly) + checkForNull(subAssemblyObj?.CostingPartDetails?.HangerCostPerPartPerAssembly)
    subAssemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerSubAssembly = checkForNull(subAssemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly) + checkForNull(subAssemblyObj?.CostingPartDetails?.TotalTransportationCostPerSubAssembly) + checkForNull(subAssemblyObj?.CostingPartDetails?.TotalPaintCostPerSubAssembly) + checkForNull(subAssemblyObj?.CostingPartDetails?.HangerCostPerPartPerSubAssembly)
    subAssemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostComponent = checkForNull(subAssemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostComponent) + checkForNull(subAssemblyObj?.CostingPartDetails?.TotalTransportationCostComponent) + checkForNull(subAssemblyObj?.CostingPartDetails?.TotalPaintCostComponent) + checkForNull(subAssemblyObj?.CostingPartDetails?.HangerCostPerPartComponent)
    subAssemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostWithQuantitys = (checkForNull(subAssemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity) + checkForNull(subAssemblyObj?.CostingPartDetails?.TotalTransportationCostWithQuantity) + checkForNull(subAssemblyObj?.CostingPartDetails?.TotalPaintCostWithQuantity) + checkForNull(subAssemblyObj?.CostingPartDetails?.HangerCostPerPartWithQuantity)) * checkForNull(subAssemblyObj?.Quantity)

    subAssemblyObj.CostingPartDetails.NetSurfaceTreatmentCost = checkForNull(subAssemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity) + checkForNull(subAssemblyObj?.CostingPartDetails?.TotalTransportationCostWithQuantity) + checkForNull(subAssemblyObj?.CostingPartDetails?.TotalPaintCostWithQuantity) + checkForNull(subAssemblyObj?.CostingPartDetails?.HangerCostPerPartWithQuantity)
    subAssemblyObj.CostingPartDetails.BasicRate = checkForNull(rmCcData?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(ComponentItemData?.CostingPartDetails?.NetTotalRMBOPCC)

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
      let updatedArr = _.cloneDeep(JSON.parse(sessionStorage.getItem('surfaceCostingArray')))
      let obj = updatedArr && updatedArr.find(updateditem => updateditem.PartNumber === newItem.PartNumber && updateditem.AssemblyPartNumber === newItem.AssemblyPartNumber)

      let rmCcData = findrmCctData(item)

      if (obj && Object.keys(obj).length > 0) {
        newItem.CostingPartDetails.TransportationCost = checkForNull(obj?.CostingPartDetails?.TransportationCost)
        newItem.CostingPartDetails.SurfaceTreatmentCost = checkForNull(obj?.CostingPartDetails?.SurfaceTreatmentCost)

        newItem.CostingPartDetails.HangerCostPerPart = checkForNull(obj?.CostingPartDetails?.HangerCostPerPart)
        newItem.CostingPartDetails.HangerRate = checkForNull(obj?.CostingPartDetails?.HangerRate)
        newItem.CostingPartDetails.NumberOfPartsPerHanger = checkForNull(obj?.CostingPartDetails?.NumberOfPartsPerHanger)
        newItem.CostingPartDetails.HangerCostPerPartComponent = checkForNull(obj?.CostingPartDetails?.HangerCostPerPartComponent)
        newItem.CostingPartDetails.HangerCostPerPartPerAssembly = checkForNull(obj?.CostingPartDetails?.HangerCostPerPartPerAssembly)
        newItem.CostingPartDetails.HangerCostPerPartPerSubAssembly = checkForNull(obj?.CostingPartDetails?.HangerCostPerPartPerSubAssembly)
        newItem.CostingPartDetails.HangerCostPerPartWithQuantity = checkForNull(obj?.CostingPartDetails?.HangerCostPerPartWithQuantity)

        newItem.CostingPartDetails.PaintCost = checkForNull(obj?.CostingPartDetails?.PaintCost)
        newItem.CostingPartDetails.PaintCostComponent = checkForNull(obj?.CostingPartDetails?.PaintCostComponent)
        newItem.CostingPartDetails.PaintCostPerAssembly = checkForNull(obj?.CostingPartDetails?.PaintCostPerAssembly)
        newItem.CostingPartDetails.PaintCostPerSubAssembly = checkForNull(obj?.CostingPartDetails?.PaintCostPerSubAssembly)
        newItem.CostingPartDetails.PaintCostWithQuantity = checkForNull(obj?.CostingPartDetails?.PaintCostWithQuantity)

        newItem.CostingPartDetails.PaintConsumptionCost = checkForNull(obj?.CostingPartDetails?.PaintConsumptionCost)
        newItem.CostingPartDetails.PaintConsumptionCostComponent = checkForNull(obj?.CostingPartDetails?.PaintConsumptionCostComponent)
        newItem.CostingPartDetails.PaintConsumptionCostPerAssembly = checkForNull(obj?.CostingPartDetails?.PaintConsumptionCostPerAssembly)
        newItem.CostingPartDetails.PaintConsumptionCostPerSubAssembly = checkForNull(obj?.CostingPartDetails?.PaintConsumptionCostPerSubAssembly)
        newItem.CostingPartDetails.PaintConsumptionCostWithQuantity = checkForNull(obj?.CostingPartDetails?.PaintConsumptionCostWithQuantity)

        newItem.CostingPartDetails.TapeCost = checkForNull(obj?.CostingPartDetails?.TapeCost)
        newItem.CostingPartDetails.TapeCostComponent = checkForNull(obj?.CostingPartDetails?.TapeCostComponent)
        newItem.CostingPartDetails.TapeCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TapeCostPerAssembly)
        newItem.CostingPartDetails.TapeCostPerSubAssembly = checkForNull(obj?.CostingPartDetails?.TapeCostPerSubAssembly)
        newItem.CostingPartDetails.TapeCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TapeCostWithQuantity)

        newItem.CostingPartDetails.TotalPaintCost = checkForNull(obj?.CostingPartDetails?.TotalPaintCost)
        newItem.CostingPartDetails.TotalPaintCostComponent = checkForNull(obj?.CostingPartDetails?.TotalPaintCostComponent)
        newItem.CostingPartDetails.TotalPaintCostPerAssembly = checkForNull(obj?.CostingPartDetails?.TotalPaintCostPerAssembly)
        newItem.CostingPartDetails.TotalPaintCostPerSubAssembly = checkForNull(obj?.CostingPartDetails?.TotalPaintCostPerSubAssembly)
        newItem.CostingPartDetails.TotalPaintCostWithQuantity = checkForNull(obj?.CostingPartDetails?.TotalPaintCostWithQuantity)


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
  const setAssemblySurfaceCost = (surfaceGrid, params, IsGridChanged, item, hangerCostDetails, extraCostDetails, paintAndMaskingDetails) => {
    // if (IsGridChanged) {

    dispatchAssemblySurfaceCost(surfaceGrid, params, SurfaceTabData, IsGridChanged, item, hangerCostDetails, extraCostDetails, paintAndMaskingDetails)
    // }
    // dispatch(setSurfaceData(arr, () => { }))
  }

  const dispatchAssemblySurfaceCost = (surfaceGrid, params, arr, IsGridChanged, item, hangerCostDetails, extraCostDetails, paintAndMaskingDetails) => {


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
            let partObj = calculationForPart(surfaceGrid, item, hangerCostDetails, extraCostDetails, paintAndMaskingDetails)

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
              let subAssemObj = calculationForSubAssembly(surfaceCostGrid, objectToUpdate, tempArr, {}, params, hangerCostDetails, extraCostDetails, paintAndMaskingDetails)


              tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })

            }
          }
        } else {
          if (item.PartType === 'Sub Assembly') {
            if (i === useLevel) {
              let tempArr = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === params.PartNumber)
              let partIndex = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === item.PartNumber && x.AssemblyPartNumber === item.AssemblyPartNumber)


              let partObj = calculationForSubAssembly(surfaceGrid, item, tempArr, extraCostDetails, params, hangerCostDetails, paintAndMaskingDetails)

              tempArrForCosting = Object.assign([...tempArrForCosting], { [partIndex]: partObj })
              initialPartNo = item.AssemblyPartNumber

            }
            else {
              // THIS ELSE CONDITION WILL RUN FOR ALL SUBASSEMBLY COSTING CALCULATION (WILL FIND PARENT ON THE BASIS OF PARENT NO PRESENT IN IT'S CHILD)
              let indexForUpdate = _.findIndex(tempArrForCosting, ['PartNumber', initialPartNo]);
              let objectToUpdate = tempArrForCosting[indexForUpdate]
              if (objectToUpdate.PartType === 'Sub Assembly') {
                let tempArr = _.filter(tempArrForCosting, ['AssemblyPartNumber', initialPartNo]);

                initialPartNo = objectToUpdate.AssemblyPartNumber
                let surfaceCostGrid = params.PartNumber === objectToUpdate.PartNumber ? surfaceGrid : []
                let subAssemObj = calculationForSubAssembly(surfaceCostGrid, objectToUpdate, tempArr, extraCostDetails, params, hangerCostDetails, paintAndMaskingDetails)


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
        let tempArrForCosting = _.cloneDeep(JSON.parse(sessionStorage.getItem('surfaceCostingArray')))

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

          assemblyObj.CostingPartDetails.PaintCost = params.PartNumber === assemblyObj.PartNumber ? paintAndMaskingDetails?.PaintCost : checkForNull(assemblyObj?.CostingPartDetails?.PaintCost)
          assemblyObj.CostingPartDetails.PaintCostComponent = checkForNull(paintCostPart(subAssemblyArray))
          assemblyObj.CostingPartDetails.PaintCostPerAssembly = params.PartNumber === assemblyObj.PartNumber ? paintAndMaskingDetails?.PaintCost : checkForNull(assemblyObj?.CostingPartDetails?.PaintCostPerAssembly)
          assemblyObj.CostingPartDetails.PaintCostPerSubAssembly = checkForNull(paintCostSubAssembly(subAssemblyArray))
          assemblyObj.CostingPartDetails.PaintCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.PaintCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.PaintCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.PaintCostPerSubAssembly)

          assemblyObj.CostingPartDetails.PaintConsumptionCost = params.PartNumber === assemblyObj.PartNumber ? paintAndMaskingDetails?.PaintConsumptionCost : checkForNull(assemblyObj?.CostingPartDetails?.PaintConsumptionCost)
          assemblyObj.CostingPartDetails.PaintConsumptionCostComponent = checkForNull(paintConsumptionCostPart(subAssemblyArray))
          assemblyObj.CostingPartDetails.PaintConsumptionCostPerAssembly = params.PartNumber === assemblyObj.PartNumber ? paintAndMaskingDetails?.PaintConsumptionCost : checkForNull(assemblyObj?.CostingPartDetails?.PaintConsumptionCostPerAssembly)
          assemblyObj.CostingPartDetails.PaintConsumptionCostPerSubAssembly = checkForNull(paintConsumptionCostSubAssembly(subAssemblyArray))
          assemblyObj.CostingPartDetails.PaintConsumptionCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.PaintConsumptionCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.PaintConsumptionCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.PaintConsumptionCostPerSubAssembly)

          assemblyObj.CostingPartDetails.TapeCost = params.PartNumber === assemblyObj.PartNumber ? paintAndMaskingDetails?.TapeCost : checkForNull(assemblyObj?.CostingPartDetails?.TapeCost)
          assemblyObj.CostingPartDetails.TapeCostComponent = checkForNull(tapeCostPart(subAssemblyArray))
          assemblyObj.CostingPartDetails.TapeCostPerAssembly = params.PartNumber === assemblyObj.PartNumber ? paintAndMaskingDetails?.TapeCost : checkForNull(assemblyObj?.CostingPartDetails?.TapeCostPerAssembly)
          assemblyObj.CostingPartDetails.TapeCostPerSubAssembly = checkForNull(tapeCostSubAssembly(subAssemblyArray))
          assemblyObj.CostingPartDetails.TapeCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.TapeCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.TapeCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TapeCostPerSubAssembly)

          assemblyObj.CostingPartDetails.TotalPaintCost = params.PartNumber === assemblyObj.PartNumber ? paintAndMaskingDetails?.TotalPaintCost : checkForNull(assemblyObj?.CostingPartDetails?.TotalPaintCost)
          assemblyObj.CostingPartDetails.TotalPaintCostComponent = checkForNull(totalPaintCostPart(subAssemblyArray))
          assemblyObj.CostingPartDetails.TotalPaintCostPerAssembly = params.PartNumber === assemblyObj.PartNumber ? paintAndMaskingDetails?.TotalPaintCost : checkForNull(assemblyObj?.CostingPartDetails?.TotalPaintCostPerAssembly)
          assemblyObj.CostingPartDetails.TotalPaintCostPerSubAssembly = checkForNull(totalPaintCostSubAssembly(subAssemblyArray))
          assemblyObj.CostingPartDetails.TotalPaintCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.TotalPaintCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.TotalPaintCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalPaintCostPerSubAssembly)

          assemblyObj.CostingPartDetails.HangerRate = params.PartNumber === assemblyObj.PartNumber ? hangerCostDetails?.HangerRate : checkForNull(assemblyObj?.CostingPartDetails?.HangerRate)
          assemblyObj.CostingPartDetails.NumberOfPartsPerHanger = params.PartNumber === assemblyObj.PartNumber ? hangerCostDetails?.NumberOfPartsPerHanger : checkForNull(assemblyObj?.CostingPartDetails?.NumberOfPartsPerHanger)
          assemblyObj.CostingPartDetails.HangerCostPerPart = params.PartNumber === assemblyObj.PartNumber ? hangerCostDetails?.HangerCostPerPart : checkForNull(assemblyObj?.CostingPartDetails?.HangerCostPerPart)
          assemblyObj.CostingPartDetails.HangerCostPerPartComponent = checkForNull(totalhangerCostPerPart(subAssemblyArray))

          assemblyObj.CostingPartDetails.HangerCostPerPartPerAssembly = params.PartNumber === assemblyObj.PartNumber ? hangerCostDetails?.HangerCostPerPart : checkForNull(assemblyObj?.CostingPartDetails?.HangerCostPerPartPerAssembly)
          assemblyObj.CostingPartDetails.HangerCostPerPartPerSubAssembly = checkForNull(hangerCostSubAssembly(subAssemblyArray))
          assemblyObj.CostingPartDetails.HangerCostPerPartWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.HangerCostPerPartComponent) + checkForNull(assemblyObj?.CostingPartDetails?.HangerCostPerPartPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.HangerCostPerPartPerSubAssembly)

          assemblyObj.CostingPartDetails.TransportationCost = params.PartNumber === assemblyObj.PartNumber ? extraCostDetails?.TransportationCost : checkForNull(assemblyObj?.CostingPartDetails?.TransportationCost)
          assemblyObj.CostingPartDetails.TransportationDetails = params.PartNumber === assemblyObj.PartNumber ? extraCostDetails?.TransportationDetails : checkForNull(assemblyObj?.CostingPartDetails?.TransportationDetails)
          assemblyObj.CostingPartDetails.TotalTransportationCostComponent = checkForNull(transportCostPart(subAssemblyArray))
          assemblyObj.CostingPartDetails.TotalTransportationCostPerAssembly = params.PartNumber === assemblyObj.PartNumber ? extraCostDetails?.TransportationCost : checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostPerAssembly)
          assemblyObj.CostingPartDetails.TotalTransportationCostPerSubAssembly = checkForNull(transportCostSubAssembly(subAssemblyArray))
          assemblyObj.CostingPartDetails.TotalTransportationCostWithQuantity = checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostPerSubAssembly)

          assemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerAssembly = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalPaintCostPerAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.HangerCostPerPartPerAssembly)
          assemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostPerSubAssembly = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostPerSubAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostPerSubAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.TotalPaintCostPerSubAssembly) + checkForNull(assemblyObj?.CostingPartDetails?.HangerCostPerPartPerSubAssembly)
          assemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostComponent = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.TotalPaintCostComponent) + checkForNull(assemblyObj?.CostingPartDetails?.HangerCostPerPartComponent)
          assemblyObj.CostingPartDetails.NetSurfaceTreatmentCost = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalPaintCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.HangerCostPerPartWithQuantity)
          assemblyObj.CostingPartDetails.TotalCalculatedSurfaceTreatmentCostWithQuantitys = checkForNull(assemblyObj?.CostingPartDetails?.TotalSurfaceTreatmentCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalTransportationCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.TotalPaintCostWithQuantity) + checkForNull(assemblyObj?.CostingPartDetails?.HangerCostPerPartWithQuantity)

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
        let tempArrForCosting = _.cloneDeep(JSON.parse(sessionStorage.getItem('surfaceCostingArray')))
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
        // let subAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item => item.BOMLevel === 'L1')
        let subAssemblyArray = tempArrForCosting && tempArrForCosting.filter(item => {

          if (item.BOMLevel === 'L1') return item
        })

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

  const setSurfaceTreatmentCostAssemblyTechnology = (surfaceTreatmentGrid, params, hangerCostDetails, extraCostDetails, paintAndMaskingDetails) => {
    let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray

    let surfacetreatmentSum = 0
    surfacetreatmentSum = surfaceTreatmentGrid && surfaceTreatmentGrid.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.SurfaceTreatmentCost)
    }, 0)

    let totalCost = checkForNull(surfacetreatmentSum) + checkForNull(extraCostDetails?.TransportationCost) + checkForNull(extraCostDetails?.HangerCostPerPart) + checkForNull(paintAndMaskingDetails?.TotalPaintCost)

    tempsubAssemblyTechnologyArray[0].CostingPartDetails.SurfaceTreatmentCost = surfacetreatmentSum

    tempsubAssemblyTechnologyArray[0].CostingPartDetails.SurfaceTreatmentGrid = surfaceTreatmentGrid
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.SurfaceTreatmentDetails = surfaceTreatmentGrid
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.TransportationCost = extraCostDetails?.TransportationCost
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.TransportationDetails = extraCostDetails.TransportationDetails
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetSurfaceTreatmentCost = totalCost
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.HangerCostPerPart = hangerCostDetails?.HangerCostPerPart
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.NumberOfPartsPerHanger = hangerCostDetails?.NumberOfPartsPerHanger
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.HangerRate = hangerCostDetails?.HangerRate
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.TotalPaintCost = paintAndMaskingDetails?.TotalPaintCost
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.PaintCost = paintAndMaskingDetails?.PaintCost
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.PaintConsumptionCost = paintAndMaskingDetails?.PaintConsumptionCost
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.TapeCost = paintAndMaskingDetails?.TapeCost


    dispatch(setSubAssemblyTechnologyArray(tempsubAssemblyTechnologyArray, res => { }))

    setSurfaceCost(surfaceTreatmentGrid, params, false, hangerCostDetails, extraCostDetails, paintAndMaskingDetails)
    // setTransportationCost(extraCostDetails, params)
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
                          <th className="py-3 align-middle word-nowrap" style={{ width: "120px" }}>{`ST. Cost`}</th>
                          <th className="py-3 align-middle word-nowrap" style={{ width: "120px" }}>{`Hanger Cost`}</th>
                          <th className="py-3 align-middle word-nowrap" style={{ width: "120px" }}>{`Paint And Masking Cost`}</th>
                          <th className="py-3 align-middle" style={{ width: "150px" }}>{`Other Cost`}</th>
                          <th className="py-align-middle" style={{ width: "100px" }}>{`Quantity`}</th>
                          <th className="py-3 align-middle word-nowrap" style={{ width: "150px" }}>{`Total ST. Cost`}</th>
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
                                    subAssembId={selectedCostingDetail.SubAssemblyCostingId ? selectedCostingDetail.SubAssemblyCostingId : costData.CostingId}
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
                                    subAssembId={selectedCostingDetail.SubAssemblyCostingId ? selectedCostingDetail.SubAssemblyCostingId : costData.CostingId}
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