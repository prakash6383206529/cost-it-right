import React, { useState, useEffect, useContext } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { getSurfaceTreatmentTabData, setSurfaceData, saveCostingSurfaceTreatmentTab, setSurfaceCostInOverheadProfit } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { checkForNull, } from '../../../../helper';
import PartSurfaceTreatment from '../CostingHeadCosts/SurfaceTreatMent/PartSurfaceTreatment';
import AssemblySurfaceTreatment from '../CostingHeadCosts/SurfaceTreatMent/AssemblySurfaceTreatment';
import { LEVEL0 } from '../../../../config/constants';
import { ViewCostingContext } from '../CostingDetails';
import _ from 'lodash'

function TabSurfaceTreatment(props) {

  const { netPOPrice } = props;

  const { handleSubmit, } = useForm();

  const dispatch = useDispatch()

  let SurfaceTabData = useSelector(state => state.costing.SurfaceTabData)

  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
        AssemCostingId: costData.CostingId,
        SubAsmCostingId: costData.CostingId
      }
      dispatch(getSurfaceTreatmentTabData(data, true, res => {
        let tempArr = [];
        tempArr.push(res.data.DataList[0]);
        localStorage.setItem('surfaceCostingArray', JSON.stringify(tempArr));
      }))
    }
  }, [costData]);

  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    // CostingViewMode CONDITION IS USED TO AVOID CALCULATION IN VIEWMODE
    if (CostingViewMode === false) {
      let TopHeaderValues = SurfaceTabData && SurfaceTabData.length > 0 && SurfaceTabData[0].CostingPartDetails !== undefined ? SurfaceTabData[0].CostingPartDetails : null;
      let topHeaderData = {
        NetSurfaceTreatmentCost: TopHeaderValues && TopHeaderValues.NetSurfaceTreatmentCost !== null ? TopHeaderValues.NetSurfaceTreatmentCost : 0,
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
        return accummlator + checkForNull(el.CostingPartDetails.TransportationCost !== null ? el.CostingPartDetails.TransportationCost : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method setPartDetails
  * @description SET PART DETAILS
  */
  const setPartDetails = (Params, Data = {}) => {
    let arr = formatData(Params, Data, SurfaceTabData)
    dispatch(setSurfaceData(arr, () => { }))
  }

  /**
  * @method formatData
  * @description FORMATE DATA FOR SET PART DETAILS
  */
  const formatData = (Params, Data, aar) => {



    let tempArr = [];
    try {
      tempArr = aar && aar.map(i => {

        const { CostingChildPartDetails, CostingPartDetails } = i;

        if (i.IsAssemblyPart === true) {
          let NetSurfaceTreatmentCost = getSurfaceTreatmentTotalCost(i.CostingChildPartDetails, checkForNull(surfaceCost(Data.SurfaceTreatmentDetails)), Params) +
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
          let NetSurfaceTreatmentCost = checkForNull(surfaceCost(Data.SurfaceTreatmentDetails)) + checkForNull(Data.TransportationCost);

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

    let arr = setAssembly(params, Children, SurfaceTabData)
    dispatch(setSurfaceData(arr, () => { }))
  }

  /**
  * @method setAssembly
  * @description SET ASSEMBLY DETAILS
  */
  const setAssembly = (params, Children, arr) => {
    console.log('params: ', params);

    let tempArr = [];
    try {

      tempArr = arr && arr.map(i => {

        const { CostingChildPartDetails, CostingPartDetails } = Children;

        if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          i.CostingChildPartDetails = params.BOMLevel !== LEVEL0 ? ChangeBOMLeveL(Children.CostingChildPartDetails, params.BOMLevel) : i.CostingChildPartDetails;
          i.CostingPartDetails = Children.CostingPartDetails;

          const stAsmblyTotal = getTotalSurfaceCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly, params);
          const transAsmblyTotal = getTotalTransportationCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.TotalTransportationCostPerAssembly, params);
          const stTotal = getTotalSurfaceCost(CostingChildPartDetails, Children.CostingPartDetails.SurfaceTreatmentCost, params);
          const transTotal = getTotalTransportationCost(CostingChildPartDetails, Children.CostingPartDetails.TransportationCost, params);

          let NetSurfaceTreatmentCost = stAsmblyTotal + transAsmblyTotal + stTotal + transTotal;

          // let NetSurfaceTreatmentCost = checkForNull(Children.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly) +
          //   checkForNull(Children.CostingPartDetails.TotalTransportationCostPerAssembly) +
          //   checkForNull(Children.CostingPartDetails.SurfaceTreatmentCost) +
          //   checkForNull(Children.CostingPartDetails.TransportationCost);

          i.CostingPartDetails.NetSurfaceTreatmentCost = stAsmblyTotal + transAsmblyTotal + stTotal + transTotal;
          i.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly = getTotalSurfaceCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly, params);
          i.CostingPartDetails.TotalTransportationCostPerAssembly = getTotalTransportationCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.TotalTransportationCostPerAssembly, params);
          i.CostingPartDetails.SurfaceTreatmentCost = getTotalSurfaceCost(CostingChildPartDetails, Children.CostingPartDetails.SurfaceTreatmentCost, params);
          i.CostingPartDetails.TransportationCost = getTotalTransportationCost(CostingChildPartDetails, Children.CostingPartDetails.TransportationCost, params);

          i.IsAssemblyPart = true;
          i.IsOpen = params.IsCollapse ? !i.IsOpen : false;
          i.IsOpenAssemblyDrawer = false;

        }
        else {
          setAssembly(params, Children, i.CostingChildPartDetails)
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

  const totalSurfaceTreatmentCost = (arr, type) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (type === 'surface') {
        return accummlator + checkForNull(item.CostingPartDetails.SurfaceTreatmentCost)
      } else {
        return accummlator + checkForNull(item.CostingPartDetails.TransportationCost)
      }
    }, 0)
    return total
  }

  const assemblyTotalSurfaceTransportCost = (arr) => {
    let tempArr = []
    tempArr = arr && arr.map((i) => {
      i.CostingPartDetails.SurfaceTreatmentCost = totalSurfaceTreatmentCost(i.CostingChildPartDetails, 'surface')
      i.CostingPartDetails.TransportationCost = totalSurfaceTreatmentCost(i.CostingChildPartDetails, 'transport')
      i.CostingPartDetails.NetSurfaceTreatmentCost = checkForNull(i.CostingPartDetails.SurfaceTreatmentCost) + checkForNull(i.CostingPartDetails.TransportationCost)

      return i
    })
    return tempArr
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
    try {

      tempArr = arr && arr.map(i => {

        if (i.IsAssemblyPart === true) {

          let NetSurfaceTreatmentCost = getSurfaceTreatmentTotalCost(i.CostingChildPartDetails, checkForNull(surfaceCost(surfaceGrid)), params) +
            getTransportationTotalCost(i.CostingChildPartDetails, checkForNull(i.CostingPartDetails.TransportationCost), params) +
            getSurfaceTreatmentTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(i.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly), params) +
            getTransportationTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(i.CostingPartDetails.TotalTransportationCostPerAssembly), params);

          i.CostingPartDetails.NetSurfaceTreatmentCost = NetSurfaceTreatmentCost;
          i.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly = checkForNull(i.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly);
          i.CostingPartDetails.TotalTransportationCostPerAssembly = checkForNull(i.CostingPartDetails.TotalTransportationCostPerAssembly);
          i.CostingPartDetails.SurfaceTreatmentCost = getSurfaceTreatmentTotalCost(i.CostingChildPartDetails, checkForNull(surfaceCost(surfaceGrid)), params);
          i.CostingPartDetails.SurfaceTreatmentDetails = surfaceGrid;

          dispatchSurfaceCost(surfaceGrid, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let NetSurfaceTreatmentCost = checkForNull(surfaceCost(surfaceGrid)) + checkForNull(i.CostingPartDetails.TransportationCost);

          i.CostingPartDetails.NetSurfaceTreatmentCost = NetSurfaceTreatmentCost;
          i.CostingPartDetails.SurfaceTreatmentCost = surfaceCost(surfaceGrid);
          i.CostingPartDetails.SurfaceTreatmentDetails = surfaceGrid;
          //i.IsOpen = !i.IsOpen;

        } else {
          dispatchSurfaceCost(surfaceGrid, params, i.CostingChildPartDetails)
        }
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
    // let arr1 = assemblyTotalSurfaceTransportCost(arr)
    dispatch(setSurfaceData(arr, () => { }))
  }

  /**
  * @method dispatchTransportationCost
  * @description DISPATCHED TRANSPORTATION COST
  */
  const dispatchTransportationCost = (transportationObj, params, arr) => {
    let tempArr = [];
    try {

      tempArr = arr && arr.map(i => {

        if (i.IsAssemblyPart === true) {

          // let NetSurfaceTreatmentCost = getSurfaceTreatmentTotalCost(i.CostingChildPartDetails, checkForNull(i.CostingPartDetails.SurfaceTreatmentCost), params) +
          // getSurfaceTreatmentTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(i.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly), params) +
          // getTransportationTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(i.CostingPartDetails.TotalTransportationCostPerAssembly), params) +
          // getTransportationTotalCost(i.CostingChildPartDetails, checkForNull(transportationObj.TransportationCost), params)

          let NetSurfaceTreatmentCost = checkForNull(i.CostingPartDetails.SurfaceTreatmentCost) + +
            checkForNull(i.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly) +
            checkForNull(i.CostingPartDetails.TotalTransportationCostPerAssembly) +
            getTransportationTotalCost(i.CostingChildPartDetails, checkForNull(transportationObj.TransportationCost), params)

          i.CostingPartDetails.NetSurfaceTreatmentCost = NetSurfaceTreatmentCost;
          i.CostingPartDetails.TransportationCost = getTransportationTotalCost(i.CostingChildPartDetails, checkForNull(transportationObj.TransportationCost), params);

          dispatchTransportationCost(transportationObj, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let NetSurfaceTreatmentCost = checkForNull(surfaceCost(i.CostingPartDetails.SurfaceTreatmentDetails)) +
            checkForNull(transportationObj.TransportationCost);

          i.CostingPartDetails.NetSurfaceTreatmentCost = NetSurfaceTreatmentCost;
          i.CostingPartDetails.TransportationCost = checkForNull(transportationObj.TransportationCost);
          i.CostingPartDetails.TransportationDetails = transportationObj;

        } else {
          dispatchTransportationCost(transportationObj, params, i.CostingChildPartDetails)
        }
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
        return accummlator + checkForNull(item.CostingPartDetails.SurfaceTreatmentCost) * checkForNull(item.Quantity ? item.Quantity : 3)
      }
    }, 0)
    return total
  }
  const transportCostSubAssembly = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Sub Assembly') {
        return accummlator + checkForNull(item.CostingPartDetails.TransportationCost) * checkForNull(item.Quantity ? item.Quantity : 3)
      }
    }, 0)
    return total
  }



  const surfaceCostPart = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + checkForNull(item.CostingPartDetails.SurfaceTreatmentCost) * checkForNull(item.Quantity ? item.Quantity : 2)
      }
    }, 0)
    return total
  }
  const transportCostPart = (arr) => {
    const total = arr && arr.reduce((accummlator, item) => {
      if (item.PartType === 'Part') {
        return accummlator + checkForNull(item.CostingPartDetails.TransportationCost) * checkForNull(item.Quantity ? item.Quantity : 2)
      }
    }, 0)
    return total
  }


  const calculationForPart = (surfaceGrid = [], item, type, TransportationObj = {}) => {
    let obj = item

    switch (type) {
      case 'Operation':
        obj.CostingPartDetails.SurfaceTreatmentCost = checkForNull(surfaceCost(surfaceGrid));
        obj.CostingPartDetails.SurfaceTreatmentDetails = surfaceGrid;
        obj.CostingPartDetails.NetSurfaceTreatmentCost = (checkForNull(surfaceCost(surfaceGrid)) + obj.CostingPartDetails.TransportationCost) * (obj.Quantity ? obj.Quantity : 2)
        break;
      case 'Transport':
        obj.CostingPartDetails.TransportationCost = checkForNull(TransportationObj?.TransportationCost)
        obj.CostingPartDetails.TransportationDetails = TransportationObj
        obj.CostingPartDetails.NetSurfaceTreatmentCost = (checkForNull(obj.CostingPartDetails.SurfaceTreatmentCost) + checkForNull(TransportationObj.TransportationCost)) * (obj.Quantity ? obj.Quantity : 2)
        break;
      default:
        break;
    }
    return obj
  }


  const calculationForSubAssembly = (surfaceGrid, obj = {}, quantity, type = '', tempArr = [], TransportationObj = {}) => {
    let subAssemblyObj = obj
    switch (type) {
      case 'Operation':
        subAssemblyObj.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly = surfaceGrid.length > 0 ? checkForNull(surfaceCost(surfaceGrid)) : checkForNull(subAssemblyObj.CostingPartDetails?.SurfaceTreatmentCostPerAssembly)
        subAssemblyObj.CostingPartDetails.SurfaceTreatmentCostPerAssembly = surfaceGrid.length > 0 ? checkForNull(surfaceCost(surfaceGrid)) : checkForNull(subAssemblyObj.CostingPartDetails?.SurfaceTreatmentCostPerAssembly)
        subAssemblyObj.CostingPartDetails.SurfaceTreatmentCostPerSubAssembly = checkForNull(surfaceCostSubAssembly(tempArr))
        subAssemblyObj.CostingPartDetails.SurfaceTreatmentPerPart = surfaceCostPart(tempArr)
        subAssemblyObj.CostingPartDetails.SurfaceTreatmentCost = checkForNull(subAssemblyObj.CostingPartDetails.SurfaceTreatmentCostPerAssembly) + checkForNull(subAssemblyObj.CostingPartDetails.SurfaceTreatmentCostPerSubAssembly) + checkForNull(subAssemblyObj.CostingPartDetails.SurfaceTreatmentPerPart)
        subAssemblyObj.CostingPartDetails.NetSurfaceTreatmentCost = (checkForNull(subAssemblyObj.CostingPartDetails.SurfaceTreatmentCost) + checkForNull(subAssemblyObj.CostingPartDetails.TransportationCost)) * (subAssemblyObj.Quantity ? subAssemblyObj.Quantity : 3)
        break;
      case 'Transport':
        subAssemblyObj.CostingPartDetails.TotalTransportationCostPerAssembly = Object.keys(TransportationObj).length > 0 ? checkForNull(TransportationObj?.TransportationCost) : 0
        subAssemblyObj.CostingPartDetails.TransportationCostPerAssembly = Object.keys(TransportationObj).length > 0 ? checkForNull(TransportationObj?.TransportationCost) : 0
        subAssemblyObj.CostingPartDetails.TransportationCostPerSubAssembly = transportCostSubAssembly(tempArr)
        subAssemblyObj.CostingPartDetails.TransportationCostPerPart = transportCostPart(tempArr)
        subAssemblyObj.CostingPartDetails.TransportationCost = checkForNull(subAssemblyObj.CostingPartDetails.TransportationCostPerAssembly) + checkForNull(subAssemblyObj.CostingPartDetails.TransportationCostPerSubAssembly) + checkForNull(subAssemblyObj.CostingPartDetails.TransportationCostPerPart)
        subAssemblyObj.CostingPartDetails.TransportationDetails = TransportationObj
        subAssemblyObj.CostingPartDetails.NetSurfaceTreatmentCost = (checkForNull(subAssemblyObj.CostingPartDetails.SurfaceTreatmentCost) + checkForNull(subAssemblyObj.CostingPartDetails.TransportationCost)) * (subAssemblyObj.Quantity ? subAssemblyObj.Quantity : 3)
        break;
      default:
        break;
    }
    return obj
  }


  /**
  * @method updateCostingValuesInStructure
  * @description UPDATE WHOLE COSTING VALUE IN RMCCTAB DATA REDUCER TO SHOW UPDATED VALUE ON UI
 */

  const updateCostingValuesInStructure = () => {
    //MAKING THIS MAP ARRAY COMMON
    const mapArray = (data) => data.map(item => {
      let newItem = item
      let updatedArr = JSON.parse(localStorage.getItem('surfaceCostingArray'))
      let obj = updatedArr && updatedArr.find(updateditem => updateditem.PartNumber === newItem.PartNumber && updateditem.AssemblyPartNumber === newItem.AssemblyPartNumber)
      newItem.CostingPartDetails.SurfaceTreatmentCostPerAssembly = checkForNull(obj.CostingPartDetails.SurfaceTreatmentCostPerAssembly)
      newItem.CostingPartDetails.SurfaceTreatmentCostPerSubAssembly = checkForNull(obj.CostingPartDetails.SurfaceTreatmentCostPerSubAssembly)
      newItem.CostingPartDetails.SurfaceTreatmentPerPart = checkForNull(obj.CostingPartDetails.SurfaceTreatmentPerPart)
      newItem.CostingPartDetails.SurfaceTreatmentCost = checkForNull(obj.CostingPartDetails.SurfaceTreatmentCost)
      newItem.CostingPartDetails.TransportationCostPerAssembly = checkForNull(obj.CostingPartDetails.TransportationCostPerAssembly)
      newItem.CostingPartDetails.TransportationCostPerSubAssembly = checkForNull(obj.CostingPartDetails.TransportationCostPerSubAssembly)
      newItem.CostingPartDetails.TransportationCostPerPart = checkForNull(obj.CostingPartDetails.TransportationCostPerPart)
      newItem.CostingPartDetails.TransportationCost = checkForNull(obj.CostingPartDetails.TransportationCost)
      newItem.CostingPartDetails.NetSurfaceTreatmentCost = checkForNull(obj.CostingPartDetails.NetSurfaceTreatmentCost)
      newItem.CostingPartDetails.SurfaceTreatmentDetails = obj.CostingPartDetails?.SurfaceTreatmentDetails
      newItem.CostingPartDetails.TransportationDetails = obj.CostingPartDetails?.TransportationDetails


      if (item.CostingChildPartDetails.length > 0) {
        mapArray(item.CostingChildPartDetails)
      }
      return newItem
    })
    const updatedArr = mapArray(SurfaceTabData)
    console.log('updatedArr: ', updatedArr);
    dispatch(setSurfaceData(updatedArr, () => { }))
  }


  /**
  * @method setAssemblySurfaceCost
  * @description SET ASSEMBLY SURFACE COST
  */
  const setAssemblySurfaceCost = (surfaceGrid, params, IsGridChanged, item) => {
    if (IsGridChanged) {

      dispatchAssemblySurfaceCost(surfaceGrid, params, SurfaceTabData, IsGridChanged, item)
    }
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
            // quant = item.CostingPartDetails.Quantity
            quant = 2
          }
          else {
            // THIS ELSE CONDITION WILL RUN FOR ALL SUBASSEMBLY COSTING CALCULATION (WILL FIND PARENT ON THE BASIS OF PARENT NO PRESENT IN IT'S CHILD)
            let indexForUpdate = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === initialPartNo)
            let objectToUpdate = tempArrForCosting[indexForUpdate]
            if (objectToUpdate.PartType === 'Sub Assembly') {
              let tempArr = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === initialPartNo)

              initialPartNo = objectToUpdate.AssemblyPartNumber
              let surfaceCostGrid = params.PartNumber === objectToUpdate.PartNumber ? surfaceGrid : []
              let subAssemObj = calculationForSubAssembly(surfaceCostGrid, objectToUpdate, quant, 'Operation', tempArr)

              // quant = objectToUpdate.CostingPartDetails.Quantity
              quant = 3
              tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })
            }
          }
        } else {
          if (item.PartType === 'Sub Assembly') {
            if (i === useLevel) {
              let tempArr = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === params.PartNumber)
              let partIndex = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === item.PartNumber && x.AssemblyPartNumber === item.AssemblyPartNumber)
              let partObj = calculationForSubAssembly(surfaceGrid, item, quant, 'Operation', tempArr)

              tempArrForCosting = Object.assign([...tempArrForCosting], { [partIndex]: partObj })
              initialPartNo = item.AssemblyPartNumber
              // quant = item.CostingPartDetails.Quantity
              quant = 2
            }
            else {
              // THIS ELSE CONDITION WILL RUN FOR ALL SUBASSEMBLY COSTING CALCULATION (WILL FIND PARENT ON THE BASIS OF PARENT NO PRESENT IN IT'S CHILD)
              let indexForUpdate = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === initialPartNo)
              let objectToUpdate = tempArrForCosting[indexForUpdate]
              if (objectToUpdate.PartType === 'Sub Assembly') {
                let tempArr = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === initialPartNo)

                initialPartNo = objectToUpdate.AssemblyPartNumber
                let surfaceCostGrid = params.PartNumber === objectToUpdate.PartNumber ? surfaceGrid : []
                let subAssemObj = calculationForSubAssembly(surfaceCostGrid, objectToUpdate, quant, 'Operation', tempArr)

                // quant = objectToUpdate.CostingPartDetails.Quantity
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
        let tempArrForCosting = JSON.parse(localStorage.getItem('surfaceCostingArray'))
        //CALCULATION FOR PART/COMPONENT AND SUBASSEMBLY COSTING (OPERATION COST)
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
        if (assemblyObj.PartType === 'Assembly') {
          assemblyObj.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly = params.PartNumber === assemblyObj.PartNumber ? checkForNull(surfaceCost(surfaceGrid)) : 0
          assemblyObj.CostingPartDetails.SurfaceTreatmentCostPerAssembly = params.PartNumber === assemblyObj.PartNumber ? checkForNull(surfaceCost(surfaceGrid)) : 0
          assemblyObj.CostingPartDetails.SurfaceTreatmentCostPerSubAssembly = surfaceCostSubAssembly(subAssemblyArray)
          assemblyObj.CostingPartDetails.SurfaceTreatmentPerPart = checkForNull(surfaceCostPart(subAssemblyArray))
          assemblyObj.CostingPartDetails.SurfaceTreatmentCost = checkForNull(assemblyObj.CostingPartDetails.SurfaceTreatmentCostPerAssembly) + checkForNull(assemblyObj.CostingPartDetails.SurfaceTreatmentCostPerSubAssembly) + checkForNull(assemblyObj.CostingPartDetails.SurfaceTreatmentPerPart)
          assemblyObj.CostingPartDetails.NetSurfaceTreatmentCost = checkForNull(assemblyObj.CostingPartDetails.SurfaceTreatmentCost) + checkForNull(assemblyObj.CostingPartDetails.TransportationCost)
          tempArrForCosting = Object.assign([...tempArrForCosting], { [0]: assemblyObj })
        }
        // STORING CALCULATED AND UPDATED COSTING VALUE IN LOCAL STORAGE
        localStorage.setItem('surfaceCostingArray', [])
        localStorage.setItem('surfaceCostingArray', JSON.stringify(tempArrForCosting))

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

    let arr = dispatchAssemblyTransportationCost(TransportationObj, params, SurfaceTabData, item)
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
            // quant = item.CostingPartDetails.Quantity
            quant = 2
          }
          else {
            // THIS ELSE CONDITION WILL RUN FOR ALL SUBASSEMBLY COSTING CALCULATION (WILL FIND PARENT ON THE BASIS OF PARENT NO PRESENT IN IT'S CHILD)
            let indexForUpdate = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === initialPartNo)
            let objectToUpdate = tempArrForCosting[indexForUpdate]
            if (objectToUpdate.PartType === 'Sub Assembly') {
              let tempArr = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === initialPartNo)

              initialPartNo = objectToUpdate.AssemblyPartNumber
              let transportationCostGrid = params.PartNumber === objectToUpdate.PartNumber ? TransportationObj : {}
              let subAssemObj = calculationForSubAssembly([], objectToUpdate, quant, 'Transport', tempArr, transportationCostGrid)

              // quant = objectToUpdate.CostingPartDetails.Quantity
              quant = 3
              tempArrForCosting = Object.assign([...tempArrForCosting], { [indexForUpdate]: subAssemObj })
            }
          }
        } else {
          if (item.PartType === 'Sub Assembly') {
            if (i === useLevel) {
              let tempArr = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === params.PartNumber)
              let partIndex = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === item.PartNumber && x.AssemblyPartNumber === item.AssemblyPartNumber)
              let partObj = calculationForSubAssembly([], item, quant, 'Transport', tempArr, TransportationObj)

              tempArrForCosting = Object.assign([...tempArrForCosting], { [partIndex]: partObj })
              initialPartNo = item.AssemblyPartNumber
              // quant = item.CostingPartDetails.Quantity
              quant = 2
            }
            else {
              // THIS ELSE CONDITION WILL RUN FOR ALL SUBASSEMBLY COSTING CALCULATION (WILL FIND PARENT ON THE BASIS OF PARENT NO PRESENT IN IT'S CHILD)
              let indexForUpdate = tempArrForCosting && tempArrForCosting.findIndex((x) => x.PartNumber === initialPartNo)
              let objectToUpdate = tempArrForCosting[indexForUpdate]
              if (objectToUpdate.PartType === 'Sub Assembly') {
                let tempArr = tempArrForCosting && tempArrForCosting.filter(item => item.AssemblyPartNumber === initialPartNo)

                initialPartNo = objectToUpdate.AssemblyPartNumber
                let transportationCostGrid = params.PartNumber === objectToUpdate.PartNumber ? TransportationObj : {}
                let subAssemObj = calculationForSubAssembly([], objectToUpdate, quant, 'Transport', tempArr, transportationCostGrid)

                // quant = objectToUpdate.CostingPartDetails.Quantity
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
        let tempArrForCosting = JSON.parse(localStorage.getItem('surfaceCostingArray'))
        //CALCULATION FOR PART/COMPONENT AND SUBASSEMBLY COSTING (OPERATION COST)
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
        if (assemblyObj.PartType === 'Assembly') {
          assemblyObj.CostingPartDetails.TotalTransportationCostPerAssembly = params.PartNumber === assemblyObj.PartNumber ? checkForNull(TransportationObj.TransportationCost) : 0
          assemblyObj.CostingPartDetails.TransportationCostPerAssembly = params.PartNumber === assemblyObj.PartNumber ? checkForNull(TransportationObj.TransportationCost) : 0
          assemblyObj.CostingPartDetails.TransportationCostPerSubAssembly = transportCostSubAssembly(subAssemblyArray)
          assemblyObj.CostingPartDetails.TransportationCostPerPart = checkForNull(transportCostPart(subAssemblyArray))
          assemblyObj.CostingPartDetails.TransportationCost = checkForNull(assemblyObj.CostingPartDetails.TransportationCostPerAssembly) + checkForNull(assemblyObj.CostingPartDetails.TransportationCostPerSubAssembly) + checkForNull(assemblyObj.CostingPartDetails.TransportationCostPerPart)
          assemblyObj.CostingPartDetails.NetSurfaceTreatmentCost = checkForNull(assemblyObj.CostingPartDetails.SurfaceTreatmentCost) + checkForNull(assemblyObj.CostingPartDetails.TransportationCost)
          tempArrForCosting = Object.assign([...tempArrForCosting], { [0]: assemblyObj })
        }
        // STORING CALCULATED AND UPDATED COSTING VALUE IN LOCAL STORAGE
        localStorage.setItem('surfaceCostingArray', [])
        localStorage.setItem('surfaceCostingArray', JSON.stringify(tempArrForCosting))

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
  * @method saveCosting
  * @description SAVE COSTING
  */
  const saveCosting = () => {

    const data = {}
    // dispatch(saveCostingSurfaceTreatmentTab(data, res => { }))

  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = (values) => { }

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
                          <th className="py-3 align-middle" style={{ width: "100px" }}>{`Part Number`}</th>
                          <th className="py-3 align-middle" style={{ width: '100px' }}>{`Level`}</th>
                          <th className="py-3 align-middle" style={{ width: '100px' }}>{`Type`}</th>
                          <th className="py-3 align-middle" style={{ width: "100px" }}>{`Surface Treatment Cost`}</th>
                          <th className="py-3 align-middle" style={{ width: "150px" }}>{`Extra Cost`}</th>
                          <th className="py-align-middle" style={{ width: "100px" }}>{`Quantity`}</th>
                          <th className="py-3 align-middle" style={{ width: "150px" }}>{`Total Surface Treatment Cost`}</th>
                          <th className="py-3 align-middle" style={{ width: "100px" }}>{``}</th>
                        </tr>
                      </thead>
                      <tbody>

                        {
                          SurfaceTabData && SurfaceTabData.map((item, index) => {
                            if (item && item.PartType === 'Component') {

                              return (
                                < >
                                  <PartSurfaceTreatment
                                    index={index}
                                    item={item}
                                    setPartDetails={setPartDetails}
                                    setSurfaceCost={setSurfaceCost}
                                    setTransportationCost={setTransportationCost}
                                    IsAssemblyCalculation={false}
                                  />
                                </>
                              )

                            } else {
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
                                    SubAssembId={item.CostingId}
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