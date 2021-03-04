import React, { useState, useEffect, useContext } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { getSurfaceTreatmentTabData, setSurfaceData, saveCostingSurfaceTreatmentTab } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, loggedInUserId, } from '../../../../helper';
import { SurfaceTreatmentAssemblyGetJSON } from '../../../../config/masterData';
import PartSurfaceTreatment from '../CostingHeadCosts/SurfaceTreatMent/PartSurfaceTreatment';
import AssemblySurfaceTreatment from '../CostingHeadCosts/SurfaceTreatMent/AssemblySurfaceTreatment';
import { LEVEL0 } from '../../../../helper/AllConastant';

function TabSurfaceTreatment(props) {

  const { netPOPrice } = props;

  const { handleSubmit, } = useForm();
  const [surfaceTotal, setSurfaceTotal] = useState('');
  const [transportationTotal, setTransportationTotal] = useState('');
  const [isIncludeSurfaceTreatment, setIsIncludeSurfaceTreatment] = useState(false);

  const dispatch = useDispatch()

  const SurfaceTabData = useSelector(state => state.costing.SurfaceTabData)
  //setIsIncludeSurfaceTreatment(SurfaceTabData && SurfaceTabData[0].IsIncludeSurfaceTreatmentWithOverheadAndProfit)

  const costData = useContext(costingInfoContext);

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
        //PlantId: costData.PlantId,
      }
      dispatch(getSurfaceTreatmentTabData(data, true, (res) => { }))
    }
  }, [costData]);

  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    let TopHeaderValues = SurfaceTabData && SurfaceTabData !== undefined && SurfaceTabData[0].CostingPartDetails !== undefined ? SurfaceTabData[0].CostingPartDetails : null;
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
      if (el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el.CostingPartDetails.SurfaceTreatmentCost !== null ? el.CostingPartDetails.SurfaceTreatmentCost : 0);
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
      if (el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el.CostingPartDetails.TransportationCost !== null ? el.CostingPartDetails.TransportationCost : 0);
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
      if (el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el.CostingPartDetails.SurfaceTreatmentCost !== null ? el.CostingPartDetails.SurfaceTreatmentCost : 0);
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
      if (el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) {
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
    console.log('setPartDetails Sunday: ', arr);
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
      console.log('error: ', error);
    }
    return tempArr;
  }

  /**
  * @method toggleAssembly
  * @description SET ASSEMBLY DETAILS
  */
  const toggleAssembly = (params, Children = {}) => {
    let arr = setAssembly(params, Children, SurfaceTabData)
    console.log('toggleAssembly  Sunday: ', params, arr);
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

          let NetSurfaceTreatmentCost = getTotalSurfaceCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly, params) +
            getTotalTransportationCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.TotalTransportationCostPerAssembly, params) +
            getTotalSurfaceCost(CostingChildPartDetails, Children.CostingPartDetails.SurfaceTreatmentCost, params) +
            getTotalTransportationCost(CostingChildPartDetails, Children.CostingPartDetails.TransportationCost, params);

          i.CostingPartDetails.NetSurfaceTreatmentCost = NetSurfaceTreatmentCost;
          i.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly = getTotalSurfaceCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly, params);
          i.CostingPartDetails.TotalTransportationCostPerAssembly = getTotalTransportationCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.TotalTransportationCostPerAssembly, params);
          i.CostingPartDetails.SurfaceTreatmentCost = getTotalSurfaceCost(CostingChildPartDetails, Children.CostingPartDetails.SurfaceTreatmentCost, params);
          i.CostingPartDetails.TransportationCost = getTotalTransportationCost(CostingChildPartDetails, Children.CostingPartDetails.TransportationCost, params);

          i.IsAssemblyPart = true;
          i.IsOpen = params.IsCollapse ? !i.IsOpen : true;
          i.IsOpenAssemblyDrawer = false;

        } else {
          setAssembly(params, Children, i.CostingChildPartDetails)
        }
        return i;
      });

    } catch (error) {
      console.log('error: ', error);
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
    console.log('setSurfaceCost Sunday: ', params, arr);
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
      console.log('error: ', error);
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
      if (el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el.CostingPartDetails !== null && el.CostingPartDetails.SurfaceTreatmentCost !== undefined ? el.CostingPartDetails.SurfaceTreatmentCost : 0);
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
    setSurfaceTotal(cost)
    return cost;
  }

  /**
  * @method setTransportationCost
  * @description SET TRANSPORTATION COST
  */
  const setTransportationCost = (transportationObj, params) => {
    let arr = dispatchTransportationCost(transportationObj, params, SurfaceTabData)
    console.log('setTransportationCost Sunday: ', params, arr);
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

          let NetSurfaceTreatmentCost = getSurfaceTreatmentTotalCost(i.CostingChildPartDetails, checkForNull(surfaceCost(i.CostingPartDetails.SurfaceTreatmentDetails)), params) +
            getTransportationTotalCost(i.CostingChildPartDetails, checkForNull(transportationObj.TransportationCost), params) +
            getSurfaceTreatmentTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(i.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly), params) +
            getTransportationTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(i.CostingPartDetails.TotalTransportationCostPerAssembly), params);

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
      console.log('error: ', error);
    }
    return tempArr;

  }

  /**
   * @method getTransportationTotalCost
   * @description GET TRANSPORTATION TOTAL COST
   */
  const getTransportationTotalCost = (arr, GridTotalCost, params) => {
    let NetCost = 0;
    NetCost = arr && arr.reduce((accummlator, el) => {
      if (el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el.CostingPartDetails !== null && el.CostingPartDetails.TransportationCost !== undefined ? el.CostingPartDetails.TransportationCost : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method setAssemblySurfaceCost
  * @description SET ASSEMBLY SURFACE COST
  */
  const setAssemblySurfaceCost = (surfaceGrid, params, IsGridChanged) => {
    let arr = dispatchAssemblySurfaceCost(surfaceGrid, params, SurfaceTabData, IsGridChanged)
    console.log('setAssemblySurfaceCost Sunday: ', params, arr);
    dispatch(setSurfaceData(arr, () => { }))
  }

  const dispatchAssemblySurfaceCost = (surfaceGrid, params, arr, IsGridChanged) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {

        if (i.IsAssemblyPart === true && i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let NetSurfaceTreatmentCost = getSurfaceTreatmentTotalCost(i.CostingChildPartDetails, checkForNull(i.CostingPartDetails.SurfaceTreatmentCost), params) +
            getTransportationTotalCost(i.CostingChildPartDetails, checkForNull(i.CostingPartDetails.TransportationCost), params) +
            getSurfaceTreatmentTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(surfaceCost(surfaceGrid)), params) +
            getTransportationTotalCostForAssembly(i.CostingChildPartDetails, checkForNull(i.CostingPartDetails.TotalTransportationCostPerAssembly), params);

          i.CostingPartDetails.NetSurfaceTreatmentCost = NetSurfaceTreatmentCost;
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
      console.log('error: ', error);
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
      if (el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly !== null ? el.CostingPartDetails.TotalSurfaceTreatmentCostPerAssembly : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method setAssemblyTransportationCost
  * @description SET ASSEMBLY TRANSPORTATION COST
  */
  const setAssemblyTransportationCost = (TransportationObj, params) => {
    let arr = dispatchAssemblyTransportationCost(TransportationObj, params, SurfaceTabData)
    console.log('setAssemblyTransportationCost Sunday: ', params, arr);
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
      console.log('error: ', error);
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
      if (el.BOMLevel === params.BOMLevel && el.PartNumber === params.PartNumber) {
        return accummlator + checkForNull(GridTotalCost);
      } else {
        return accummlator + checkForNull(el.CostingPartDetails.TransportationCost !== null ? el.CostingPartDetails.TransportationCost : 0);
      }
    }, 0)
    return NetCost;
  }

  /**
  * @method onPressIncludeSurfaceTreatment
  * @description SET INCLUDE SURFACE TREATMENT
  */
  const onPressIncludeSurfaceTreatment = () => {
    setIsIncludeSurfaceTreatment(!isIncludeSurfaceTreatment)
  }

  /**
  * @method saveCosting
  * @description SAVE COSTING
  */
  const saveCosting = () => {
    const data = {
      CostingId: costData.CostingId,
      PartId: costData.PartId,
      PartNumber: costData.PartNumber,
      NetPOPrice: netPOPrice,
      LoggedInUserId: loggedInUserId(),
      NetSurfaceTreatmentCost: surfaceTotal + transportationTotal,
      SurfaceTreatmentCost: surfaceTotal,
      TransportationCost: transportationTotal,
      IsIncludeSurfaceTreatmentWithOverheadAndProfit: isIncludeSurfaceTreatment,
      CostingPartDetails: SurfaceTabData,
    }

    // dispatch(saveCostingSurfaceTreatmentTab(data, res => {
    //   console.log('saveCostingSurfaceTreatmentTab: ', res);
    // }))

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
              {/* <Row>
                <Col md="6">
                  <div className="form-heading mb-0">
                    <h2>{""}</h2>
                  </div>
                </Col>
              </Row> */}

              <Row className="m-0">
                <Col md="12" className="px-3 py-4 costing-border-x border-bottom-0">
                  <label
                    className={`custom-checkbox`}
                    onChange={onPressIncludeSurfaceTreatment}
                  >
                    Include Surface Treatment Cost in Overhead & Profit
                    <input
                      type="checkbox"
                      checked={isIncludeSurfaceTreatment}
                      disabled={false}
                    />
                    <span
                      className=" before-box"
                      checked={isIncludeSurfaceTreatment}
                      onChange={onPressIncludeSurfaceTreatment}
                    />
                  </label>
                </Col>
              </Row>

              <form
                noValidate
                className="form"
                onSubmit={handleSubmit(onSubmit)}
              >
                <Row>
                  <Col md="12">
                    <Table className="table cr-brdr-main" size="sm">
                      <thead>
                        <tr>
                          <th className="py-3 align-middle" style={{ width: "100px" }}>{``}</th>
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