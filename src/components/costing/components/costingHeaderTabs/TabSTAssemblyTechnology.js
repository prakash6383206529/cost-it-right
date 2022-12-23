import React, { useState, useEffect, useContext } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { getSurfaceTreatmentTabData, setSurfaceData } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { checkForNull, } from '../../../../helper';
import PartSurfaceTreatment from '../CostingHeadCosts/SurfaceTreatMent/PartSurfaceTreatment';
import { LEVEL0 } from '../../../../config/constants';
import { ViewCostingContext } from '../CostingDetails';
import { setSubAssemblyTechnologyArray } from '../../actions/SubAssembly';

function TabSTAssemblyTechnology(props) {

  const { handleSubmit } = useForm();

  const dispatch = useDispatch()
  const [surfaceTreatmentCost, setSurfaceTreatmentCost] = useState(0);

  let SurfaceTabData = useSelector(state => state.costing.SurfaceTabData)

  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
        AssemCostingId: costData.CostingId,
        SubAsmCostingId: costData.CostingId
      }
      dispatch(getSurfaceTreatmentTabData(data, true, () => { }))
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

        const { CostingChildPartDetails } = i;

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

        let NetSurfaceTreatmentCost = checkForNull(surfaceCost(surfaceGrid)) + checkForNull(i.CostingPartDetails.TransportationCost);
        i.CostingPartDetails.NetSurfaceTreatmentCost = NetSurfaceTreatmentCost;
        i.CostingPartDetails.SurfaceTreatmentCost = surfaceCost(surfaceGrid);
        i.CostingPartDetails.SurfaceTreatmentDetails = surfaceGrid;

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
        let NetSurfaceTreatmentCost = checkForNull(surfaceCost(i.CostingPartDetails.SurfaceTreatmentDetails)) +
          checkForNull(transportationObj.TransportationCost);

        i.CostingPartDetails.NetSurfaceTreatmentCost = NetSurfaceTreatmentCost;
        i.CostingPartDetails.TransportationCost = checkForNull(transportationObj.TransportationCost);
        i.CostingPartDetails.TransportationDetails = transportationObj;
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

  const setSurfaceTreatmentCostAT = (SurfaceTreatmentCost, TransportationCost, NetSurfaceTreatmentCost) => {
    let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray

    tempsubAssemblyTechnologyArray[0].CostingPartDetails.SurfaceTreatmentCost = SurfaceTreatmentCost
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.TransportationCost = TransportationCost
    tempsubAssemblyTechnologyArray[0].CostingPartDetails.NetSurfaceTreatmentCost = NetSurfaceTreatmentCost
    dispatch(setSubAssemblyTechnologyArray(tempsubAssemblyTechnologyArray, res => { }))


    setSurfaceTreatmentCost(NetSurfaceTreatmentCost)
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
                          <th className="py-3 align-middle" style={{ width: "100px" }}>{`Assembly Number`}</th>
                          <th className="py-3 align-middle" style={{ width: '100px' }}>{`Level`}</th>
                          <th className="py-3 align-middle" style={{ width: '100px' }}>{`Type`}</th>
                          <th className="py-3 align-middle" style={{ width: "100px" }}>{`Surface Treatment Cost`}</th>
                          <th className="py-3 align-middle" style={{ width: "150px" }}>{`Extra Cost`}</th>
                          <th className="py-3 align-middle" style={{ width: "150px" }}>{`Total Surface Treatment Cost`}</th>
                          <th className="py-3 align-middle" style={{ width: "100px" }}>{``}</th>
                        </tr>
                      </thead>
                      <tbody>

                        {
                          SurfaceTabData && SurfaceTabData.map((item, index) => {
                            return (
                              < >
                                <PartSurfaceTreatment
                                  index={index}
                                  item={item}
                                  setPartDetails={setPartDetails}
                                  setSurfaceCost={setSurfaceCost}
                                  setTransportationCost={setTransportationCost}
                                  isAssemblyTechnology={true}
                                  setSurfaceTreatmentCostAT={setSurfaceTreatmentCostAT}
                                />
                              </>
                            )
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

export default React.memo(TabSTAssemblyTechnology);