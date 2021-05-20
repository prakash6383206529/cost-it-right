import React, { useState, useEffect, useContext } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { getSurfaceTreatmentTabData, setSurfaceData, saveCostingSurfaceTreatmentTab, setSurfaceCostInOverheadProfit } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { checkForNull, } from '../../../../helper';
import PartSurfaceTreatment from '../CostingHeadCosts/SurfaceTreatMent/PartSurfaceTreatment';
import AssemblySurfaceTreatment from '../CostingHeadCosts/SurfaceTreatMent/AssemblySurfaceTreatment';
import { LEVEL0 } from '../../../../helper/AllConastant';
import { ViewCostingContext } from '../CostingDetails';

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
      }
      dispatch(getSurfaceTreatmentTabData(data, true, () => { }))
    }
  }, [costData]);

  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    let TopHeaderValues = SurfaceTabData && SurfaceTabData.length > 0 && SurfaceTabData[0].CostingPartDetails !== undefined ? SurfaceTabData[0].CostingPartDetails : null;
    let topHeaderData = {
      NetSurfaceTreatmentCost: TopHeaderValues && TopHeaderValues.NetSurfaceTreatmentCost !== null ? TopHeaderValues.NetSurfaceTreatmentCost : 0,
    }
    props.setHeaderCost(topHeaderData)
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
    console.log('setPartDetails: ',);
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
    console.log('toggleAssembly: ',);
    let arr = setAssembly(params, Children, SurfaceTabData)
    dispatch(setSurfaceData(arr, () => { }))
  }

  /**
  * @method setAssembly
  * @description SET ASSEMBLY DETAILS
  */
  const setAssembly = (params, Children, arr) => {

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

        } else {
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

  /**
  * @method setSurfaceCost
  * @description SET SURFACE TREATMENT COST
  */
  const setSurfaceCost = (surfaceGrid, params) => {
    console.log('setSurfaceCost: ',);
    let arr = dispatchSurfaceCost(surfaceGrid, params, SurfaceTabData)
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
    console.log('setTransportationCost: ',);
    let arr = dispatchTransportationCost(transportationObj, params, SurfaceTabData)
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

  /**
  * @method setAssemblySurfaceCost
  * @description SET ASSEMBLY SURFACE COST
  */
  const setAssemblySurfaceCost = (surfaceGrid, params, IsGridChanged) => {
    console.log('setAssemblySurfaceCost: ',);
    let arr = dispatchAssemblySurfaceCost(surfaceGrid, params, SurfaceTabData, IsGridChanged)
    dispatch(setSurfaceData(arr, () => { }))
  }

  const dispatchAssemblySurfaceCost = (surfaceGrid, params, arr, IsGridChanged) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {

        if (i.IsAssemblyPart === true && i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          // let NetSurfaceTreatmentCost = getSurfaceTreatmentTotalCost(i.CostingChildPartDetails, checkForNull(i.CostingPartDetails.SurfaceTreatmentCost), params) +
          //   getTransportationTotalCost(i.CostingChildPartDetails, checkForNull(i.CostingPartDetails.TransportationCost), params) +
          //   getSurfaceTreatmentTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(surfaceCost(surfaceGrid)), params) +
          //   getTransportationTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(i.CostingPartDetails.TotalTransportationCostPerAssembly), params);

          let NetSurfaceTreatmentCost = getSurfaceTreatmentTotalCost(i.CostingChildPartDetails, checkForNull(i.CostingPartDetails.SurfaceTreatmentCost), params) +
            getTransportationTotalCost(i.CostingChildPartDetails, checkForNull(i.CostingPartDetails.TransportationCost), params) +
            getSurfaceTreatmentTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(surfaceCost(surfaceGrid)), params) +
            getTransportationTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(i.CostingPartDetails.TotalTransportationCostPerAssembly), params);

          i.CostingPartDetails.NetSurfaceTreatmentCost = NetSurfaceTreatmentCost + checkForNull(surfaceCost(surfaceGrid));
          //i.CostingPartDetails.SurfaceTreatmentCost = getSurfaceTreatmentTotalCost(i.CostingChildPartDetails, checkForNull(i.CostingPartDetails.SurfaceTreatmentCost), params)
          //+            checkForNull(surfaceCost(surfaceGrid));
          i.CostingPartDetails.SurfaceTreatmentDetails = surfaceGrid;
          i.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly = checkForNull(surfaceCost(surfaceGrid));
          i.IsOpen = true;

          dispatchAssemblySurfaceCost(surfaceGrid, params, i.CostingChildPartDetails, IsGridChanged)

        } else {
          dispatchAssemblySurfaceCost(surfaceGrid, params, i.CostingChildPartDetails, IsGridChanged)
        }
        return i;
      });
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
  const setAssemblyTransportationCost = (TransportationObj, params) => {
    console.log('setAssemblyTransportationCost: ',);
    let arr = dispatchAssemblyTransportationCost(TransportationObj, params, SurfaceTabData)
    dispatch(setSurfaceData(arr, () => { }))
  }

  const dispatchAssemblyTransportationCost = (TransportationObj, params, arr) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {

        if (i.IsAssemblyPart === true && i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let NetSurfaceTreatmentCost = getSurfaceTreatmentTotalCost(i.CostingChildPartDetails, checkForNull(i.CostingPartDetails.SurfaceTreatmentCost), params) +
            getTransportationTotalCost(i.CostingChildPartDetails, checkForNull(i.CostingPartDetails.TransportationCost), params) +
            getSurfaceTreatmentTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(i.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly), params) +
            getTransportationTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(TransportationObj.TransportationCost), params);

          // let NetSurfaceTreatmentCost = checkForNull(i.CostingPartDetails.SurfaceTreatmentCost) +
          //   checkForNull(i.CostingPartDetails.TransportationCost) +
          //   checkForNull(i.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly) +
          //   checkForNull(TransportationObj.TransportationCost);

          i.CostingPartDetails.NetSurfaceTreatmentCost = NetSurfaceTreatmentCost;
          i.CostingPartDetails.TransportationDetails = TransportationObj;
          i.CostingPartDetails.TotalTransportationCostPerAssembly = checkForNull(TransportationObj.TransportationCost);
          i.IsOpen = true;

          dispatchAssemblyTransportationCost(TransportationObj, params, i.CostingChildPartDetails)

        } else {
          dispatchAssemblyTransportationCost(TransportationObj, params, i.CostingChildPartDetails)
        }
        return i;
      });
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
                          <th className="py-3 align-middle" style={{ width: "150px" }}>{`Transportation Cost`}</th>
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
                      <div className={"check-icon"}>
                        <img
                          src={require("../../../../assests/images/check.png")}
                          alt="check-icon.jpg"
                        />{" "}
                      </div>
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