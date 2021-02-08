import React, { useState, useEffect, useContext } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { getSurfaceTreatmentTabData, saveCostingSurfaceTreatmentTab } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, loggedInUserId, } from '../../../../helper';
import SurfaceTreatment from '../CostingHeadCosts/SurfaceTreatMent';

function TabSurfaceTreatment(props) {

  const { netPOPrice } = props;

  const { handleSubmit, } = useForm();
  const [tabData, setTabData] = useState([]);
  const [costingData, setCostingData] = useState({});
  const [surfaceTotal, setSurfaceTotal] = useState('');
  const [transportationTotal, setTransportationTotal] = useState('');
  const [isIncludeSurfaceTreatment, setIsIncludeSurfaceTreatment] = useState(false);

  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext);

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
        //PlantId: costData.PlantId,
      }
      dispatch(getSurfaceTreatmentTabData(data, (res) => {
        if (res && res.data && res.data.Result) {
          let Data = res.data.Data;
          setCostingData(Data)
          setIsIncludeSurfaceTreatment(Data && Data.IsIncludeSurfaceTreatmentWithOverheadAndProfit)
          setTabData(Data.CostingPartDetails)
        }
      }))
    }
  }, [costData]);

  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    let topHeaderData = {
      NetSurfaceTreatmentCost: surfaceTotal + transportationTotal,
    }
    props.setHeaderCost(topHeaderData)
  }, [tabData]);

  const toggle = (index) => {
    let tempData = tabData[index];
    let tempObj = { ...tempData, IsOpen: !tempData.IsOpen }
    let tempArr = Object.assign([...tabData], { [index]: tempObj })
    setTabData(tempArr)
  }

  /**
  * @method setSurfaceCost
  * @description SET SURFACE TREATMENT COST
  */
  const setSurfaceCost = (surfaceGrid, index) => {
    let tempObj = tabData[index];
    let NetSurfaceTreatmentCost = checkForNull(surfaceCost(surfaceGrid)) + checkForNull(tempObj.TransportationCost)

    let tempArr = Object.assign([...tabData], {
      [index]: Object.assign({}, tabData[index],
        {
          //GrandTotalCost: tempObj.GrandTotalCost + NetSurfaceTreatmentCost,
          NetSurfaceTreatmentCost: NetSurfaceTreatmentCost,
          SurfaceTreatmentCost: surfaceCost(surfaceGrid),
          SurfaceTreatmentDetails: surfaceGrid
        })
    })

    setTimeout(() => {
      setSurfaceTotal(surfaceCost(surfaceGrid))
      setTabData(tempArr)
    }, 200)

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
  const setTransportationCost = (transportationObj, index) => {
    let tempObj = tabData[index];
    let NetSurfaceTreatmentCost = checkForNull(tempObj.SurfaceTreatmentCost) + checkForNull(transportationObj.TransportationCost)
    setTransportationTotal(checkForNull(transportationObj.TransportationCost))

    let tempArr = Object.assign([...tabData], {
      [index]: Object.assign({}, tabData[index],
        {
          //GrandTotalCost: tempObj.GrandTotalCost + NetSurfaceTreatmentCost,
          NetSurfaceTreatmentCost: NetSurfaceTreatmentCost,
          TransportationCost: transportationObj.TransportationCost,
          TransportationDetails: transportationObj,
        })
    })

    setTimeout(() => {
      setTabData(tempArr)
    }, 200)
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

    dispatch(saveCostingSurfaceTreatmentTab(data, res => {
      console.log('saveCostingSurfaceTreatmentTab: ', res);
    }))

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
              <Row>
                <Col md="6">
                  <div className="form-heading mb-0">
                    <h2>{""}</h2>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col md="6" className="mb15">
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
                          <th
                            style={{ width: "100px" }}
                          >{`Surface Treatment Cost`}</th>
                          <th
                            style={{ width: "150px" }}
                          >{`Transportation Cost`}</th>
                          <th
                            style={{ width: "150px" }}
                          >{`Total Surface Treatment Cost`}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {tabData &&
                          tabData.map((item, index) => {
                            return (
                              <>
                                <tr key={index} onClick={() => toggle(index)}>
                                  <td>
                                    <span class="cr-prt-nm">
                                      {item.PartName}
                                    </span>
                                  </td>
                                  <td>
                                    {item.SurfaceTreatmentCost !== null
                                      ? checkForDecimalAndNull(
                                          item.SurfaceTreatmentCost,
                                          2
                                        )
                                      : 0}
                                  </td>
                                  <td>
                                    {item.TransportationCost !== null
                                      ? checkForDecimalAndNull(
                                          item.TransportationCost,
                                          2
                                        )
                                      : 0}
                                  </td>
                                  <td>
                                    {item.NetSurfaceTreatmentCost !== null
                                      ? checkForDecimalAndNull(
                                          item.NetSurfaceTreatmentCost,
                                          2
                                        )
                                      : 0}
                                  </td>
                                </tr>
                                {item.IsOpen && (
                                  <tr>
                                    <td colSpan={4}>
                                      <div>
                                        <SurfaceTreatment
                                          index={index}
                                          surfaceData={
                                            item.SurfaceTreatmentDetails
                                          }
                                          transportationData={
                                            item.TransportationDetails
                                          }
                                          setSurfaceCost={setSurfaceCost}
                                          setTransportationCost={
                                            setTransportationCost
                                          }
                                        />
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </>
                            );
                          })}
                      </tbody>
                    </Table>
                  </Col>
                </Row>

                <Row className="sf-btn-footer no-gutters justify-content-between mt25 mb-35-minus">
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
                </Row>
              </form>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default React.memo(TabSurfaceTreatment);