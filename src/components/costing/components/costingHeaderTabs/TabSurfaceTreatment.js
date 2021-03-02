import React, { useState, useEffect, useContext } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { getSurfaceTreatmentTabData, saveCostingSurfaceTreatmentTab } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, loggedInUserId, } from '../../../../helper';
import SurfaceTreatment from '../CostingHeadCosts/SurfaceTreatMent';
import { SurfaceTreatmentAssemblyGetJSON } from '../../../../config/masterData';
import PartSurfaceTreatment from '../CostingHeadCosts/SurfaceTreatMent/PartSurfaceTreatment';
import AssemblySurfaceTreatment from '../CostingHeadCosts/SurfaceTreatMent/AssemblySurfaceTreatment';
import { LEVEL0 } from '../../../../helper/AllConastant';

function TabSurfaceTreatment(props) {

  const { netPOPrice } = props;

  const { handleSubmit, } = useForm();
  const [tabData, setTabData] = useState(SurfaceTreatmentAssemblyGetJSON);
  const [costingData, setCostingData] = useState({});
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
    let topHeaderData = {
      NetSurfaceTreatmentCost: surfaceTotal + transportationTotal,
    }
    props.setHeaderCost(topHeaderData)
  }, [tabData]);

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
        return accummlator + checkForNull(el.CostingPartDetails.NetSurfaceTreatmentCostAssembly !== null ? el.CostingPartDetails.NetSurfaceTreatmentCostAssembly : 0);
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
        return accummlator + checkForNull(el.CostingPartDetails.NetTransportationCostAssembly !== null ? el.CostingPartDetails.NetTransportationCostAssembly : 0);
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
    let arr = formatData(Params, Data, tabData)
    //dispatch(setRMCCData(arr, () => { }))
    setTabData(arr)
  }

  /**
  * @method formatData
  * @description FORMATE DATA FOR SET PART DETAILS
  */
  const formatData = (Params, Data, tabData) => {
    let tempArr = [];
    try {
      tempArr = tabData && tabData.map(i => {

        const { CostingChildPartDetails, CostingPartDetails } = i;

        if (i.IsAssemblyPart === true) {

          // let NetSurfaceTreatmentCost = getTotalSurfaceCostForAssembly(CostingChildPartDetails, Data.NetSurfaceTreatmentCostAssembly, Params) +
          //   getTotalTransportationCostForAssembly(CostingChildPartDetails, Data.NetTransportationCostAssembly, Params) +
          //   getTotalSurfaceCost(CostingChildPartDetails, Data.SurfaceTreatmentCost, Params) +
          //   getTotalTransportationCost(CostingChildPartDetails, Data.TransportationCost, Params);

          // i.CostingPartDetails.NetSurfaceTreatmentCost = NetSurfaceTreatmentCost;
          // i.CostingPartDetails.NetSurfaceTreatmentCostAssembly = getTotalSurfaceCostForAssembly(CostingChildPartDetails, Data.NetSurfaceTreatmentCostAssembly, Params);
          // i.CostingPartDetails.NetTransportationCostAssembly = getTotalTransportationCostForAssembly(CostingChildPartDetails, Data.NetTransportationCostAssembly, Params);
          // i.CostingPartDetails.SurfaceTreatmentCost = getTotalSurfaceCost(CostingChildPartDetails, Data.SurfaceTreatmentCost, Params);
          // i.CostingPartDetails.TransportationCost = getTotalTransportationCost(CostingChildPartDetails, Data.TransportationCost, Params);

          formatData(Params, Data, i.CostingChildPartDetails)

        } else if (i.PartNumber === Params.PartNumber && i.BOMLevel === Params.BOMLevel) {

          // let NetSurfaceTreatmentCost = checkForNull(surfaceCost(Data.SurfaceTreatmentDetails)) + checkForNull(Data.TransportationCost);

          // i.CostingPartDetails = Data;
          // i.CostingPartDetails.NetSurfaceTreatmentCost = NetSurfaceTreatmentCost;
          // i.CostingPartDetails.SurfaceTreatmentCost = surfaceCost(Data.SurfaceTreatmentDetails);
          // i.CostingPartDetails.SurfaceTreatmentDetails = Data.SurfaceTreatmentDetails;

          i.IsOpen = !i.IsOpen;

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
    let arr = setAssembly(params, Children, tabData)
    //dispatch(setRMCCData(arr, () => { }))
    setTabData(arr)
  }

  /**
  * @method setAssembly
  * @description SET ASSEMBLY DETAILS
  */
  const setAssembly = (params, Children, tabData) => {
    let tempArr = [];
    try {

      tempArr = tabData && tabData.map(i => {

        const { CostingChildPartDetails, CostingPartDetails } = Children;

        if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          // i.CostingChildPartDetails = params.BOMLevel !== LEVEL0 ? ChangeBOMLeveL(Children.CostingChildPartDetails, params.BOMLevel) : i.CostingChildPartDetails;
          // i.CostingPartDetails = Children.CostingPartDetails;

          // let NetSurfaceTreatmentCost = getTotalSurfaceCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.NetSurfaceTreatmentCostAssembly, params) +
          //   getTotalTransportationCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.NetTransportationCostAssembly, params) +
          //   getTotalSurfaceCost(CostingChildPartDetails, Children.CostingPartDetails.SurfaceTreatmentCost, params) +
          //   getTotalTransportationCost(CostingChildPartDetails, Children.CostingPartDetails.TransportationCost, params);

          // i.CostingPartDetails.NetSurfaceTreatmentCost = NetSurfaceTreatmentCost;
          // i.CostingPartDetails.NetSurfaceTreatmentCostAssembly = getTotalSurfaceCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.NetSurfaceTreatmentCostAssembly, params);
          // i.CostingPartDetails.NetTransportationCostAssembly = getTotalTransportationCostForAssembly(CostingChildPartDetails, Children.CostingPartDetails.NetTransportationCostAssembly, params);
          // i.CostingPartDetails.SurfaceTreatmentCost = getTotalSurfaceCost(CostingChildPartDetails, Children.CostingPartDetails.SurfaceTreatmentCost, params);
          // i.CostingPartDetails.TransportationCost = getTotalTransportationCost(CostingChildPartDetails, Children.CostingPartDetails.TransportationCost, params);

          i.IsAssemblyPart = true;
          i.IsOpen = !i.IsOpen;

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
    let arr = dispatchSurfaceCost(surfaceGrid, params, tabData)
    //dispatch(setRMCCData(arr, () => { }))
    setTabData(arr)
  }

  /**
  * @method dispatchSurfaceCost
  * @description DISPATCHED SURFACE COST
  */
  const dispatchSurfaceCost = (surfaceGrid, params, tabData) => {
    let tempArr = [];
    try {

      tempArr = tabData && tabData.map(i => {

        if (i.IsAssemblyPart === true) {

          let NetSurfaceTreatmentCost = checkForNull(surfaceCost(surfaceGrid)) + checkForNull(i.CostingPartDetails.TransportationCost);

          i.CostingPartDetails.NetSurfaceTreatmentCost = NetSurfaceTreatmentCost;
          i.CostingPartDetails.NetSurfaceTreatmentCostAssembly = 699;
          i.CostingPartDetails.NetTransportationCostAssembly = 555;
          i.CostingPartDetails.SurfaceTreatmentCost = surfaceCost(surfaceGrid);
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
    let arr = dispatchTransportationCost(transportationObj, params, tabData)
    //dispatch(setRMCCData(arr, () => { }))
    setTabData(arr)
  }

  /**
  * @method dispatchTransportationCost
  * @description DISPATCHED TRANSPORTATION COST
  */
  const dispatchTransportationCost = (transportationObj, params, tabData) => {
    let tempArr = [];
    try {

      tempArr = tabData && tabData.map(i => {

        if (i.IsAssemblyPart === true) {

          dispatchTransportationCost(transportationObj, params, i.CostingChildPartDetails)

        } else if (i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {

          let NetSurfaceTreatmentCost = checkForNull(surfaceCost(i.CostingPartDetails.SurfaceTreatmentDetails)) + checkForNull(transportationObj.TransportationCost);

          i.CostingPartDetails.NetSurfaceTreatmentCost = NetSurfaceTreatmentCost;
          i.CostingPartDetails.TransportationCost = checkForNull(transportationObj.TransportationCost);
          //i.IsOpen = !i.IsOpen;

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
  * @method setAssemblySurfaceCost
  * @description SET ASSEMBLY SURFACE COST
  */
  const setAssemblySurfaceCost = (OperationGrid, params, IsGridChanged) => {
    let arr = dispatchAssemblySurfaceCost(OperationGrid, params, tabData, IsGridChanged)
    //dispatch(setRMCCData(arr, () => { }))
    setTabData(arr)
  }

  const dispatchAssemblySurfaceCost = (OperationGrid, params, arr, IsGridChanged) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {

        if (i.IsAssemblyPart === true && i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {



          dispatchAssemblySurfaceCost(OperationGrid, params, i.CostingChildPartDetails, IsGridChanged)

        } else {
          dispatchAssemblySurfaceCost(OperationGrid, params, i.CostingChildPartDetails, IsGridChanged)
        }
        return i;
      });
    } catch (error) {
      console.log('error: ', error);
    }
    return tempArr;
  }

  /**
  * @method setAssemblyTransportationCost
  * @description SET ASSEMBLY TRANSPORTATION COST
  */
  const setAssemblyTransportationCost = (TransportationObj, params) => {
    let arr = dispatchAssemblyTransportationCost(TransportationObj, params, tabData)
    //dispatch(setRMCCData(arr, () => { }))
    setTabData(arr)
  }

  const dispatchAssemblyTransportationCost = (TransportationObj, params, arr) => {
    let tempArr = [];
    try {
      tempArr = arr && arr.map(i => {

        if (i.IsAssemblyPart === true && i.PartNumber === params.PartNumber && i.BOMLevel === params.BOMLevel) {



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
      CostingPartDetails: tabData,
    }

    // dispatch(saveCostingSurfaceTreatmentTab(data, res => {
    //   console.log('saveCostingSurfaceTreatmentTab: ', res);
    // }))

  }

  /**
  * @method onSubmit
  * @description Used to Submit the form
  */
  const onSubmit = (values) => {


  }

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
                          <th style={{ width: "100px" }}>{``}</th>
                          <th style={{ width: '100px' }}>{`Type`}</th>
                          <th style={{ width: "100px" }}>{`Surface Treatment Cost`}</th>
                          <th style={{ width: "150px" }}>{`Transportation Cost`}</th>
                          <th style={{ width: "150px" }}>{`Total Surface Treatment Cost`}</th>
                          <th style={{ width: "100px" }}>{``}</th>
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