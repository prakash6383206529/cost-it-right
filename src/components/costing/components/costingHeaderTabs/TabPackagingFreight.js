import React, { useState, useEffect, useContext } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import { getPackageFreightTabData, saveCostingPackageFreightTab, setPackageAndFreightData } from '../../actions/Costing';
import { costingInfoContext } from '../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, loggedInUserId, } from '../../../../helper';
import PackageAndFreight from '../CostingHeadCosts/PackageAndFreight';
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../../config/message';
import { ViewCostingContext } from '../CostingDetails';

function TabPackagingFreight(props) {

  const { handleSubmit, } = useForm();

  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const PackageAndFreightTabData = useSelector(state => state.costing.PackageAndFreightTabData)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  useEffect(() => {
    if (Object.keys(costData).length > 0) {
      const data = {
        CostingId: costData.CostingId,
        PartId: costData.PartId,
      }
      dispatch(getPackageFreightTabData(data, true, (res) => { }))
    }
  }, [costData]);

  //MANIPULATE TOP HEADER COSTS
  useEffect(() => {
    let TopHeaderValues = PackageAndFreightTabData && PackageAndFreightTabData.length > 0 && PackageAndFreightTabData[0].CostingPartDetails !== undefined ? PackageAndFreightTabData[0].CostingPartDetails : null;
    let topHeaderData = {
      NetFreightPackagingCost: TopHeaderValues && checkForNull(TopHeaderValues.NetFreightPackagingCost),
    }
    props.setHeaderCost(topHeaderData)
  }, [PackageAndFreightTabData]);

  /**
  * @method setPackageCost
  * @description SET PACKAGE COST
  */
  const setPackageCost = (GridData, GridIndex) => {
    let arr = dispatchPackageCost(GridData, GridIndex, PackageAndFreightTabData)
    dispatch(setPackageAndFreightData(arr, () => { }))
  }

  /**
  * @method dispatchPackageCost
  * @description SET PACKAGE COST
  */
  const dispatchPackageCost = (GridData, GridIndex, arr) => {
    let tempArr = [];
    try {

      tempArr = arr && arr.map(i => {

        i.CostingPartDetails.PackagingNetCost = packageTotalCost(GridData);
        i.CostingPartDetails.NetFreightPackagingCost = i.CostingPartDetails.FreightNetCost + packageTotalCost(GridData);
        i.CostingPartDetails.CostingPackagingDetail = GridData;

        return i;
      });

    } catch (error) {

    }
    return tempArr;

  }

  /**
  * @method packageTotalCost
  * @description GET TOTAL PACKAGE COST
  */
  const packageTotalCost = (item) => {
    let cost = 0;
    cost = item && item.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.PackagingCost);
    }, 0)
    return cost;
  }

  /**
  * @method setFreightCost
  * @description SET FREIGHT COST
  */
  const setFreightCost = (GridData, GridIndex) => {
    let arr = dispatchFreightCost(GridData, GridIndex, PackageAndFreightTabData)
    dispatch(setPackageAndFreightData(arr, () => { }))
  }

  /**
  * @method dispatchFreightCost
  * @description SET FREIGHT COST
  */
  const dispatchFreightCost = (GridData, GridIndex, arr) => {
    let tempArr = [];
    try {

      tempArr = arr && arr.map(i => {

        i.CostingPartDetails.FreightNetCost = freightTotalCost(GridData);
        i.CostingPartDetails.NetFreightPackagingCost = i.CostingPartDetails.PackagingNetCost + freightTotalCost(GridData);
        i.CostingPartDetails.CostingFreightDetail = GridData;

        return i;
      });

    } catch (error) {

    }
    return tempArr;

  }

  /**
  * @method freightTotalCost
  * @description GET TOTAL FREIGHT COST
  */
  const freightTotalCost = (item) => {
    let cost = 0;
    cost = item && item.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.FreightCost);
    }, 0)
    return cost;
  }

  /**
  * @method saveCosting
  * @description SAVE COSTING
  */
  const saveCosting = () => {
    const data = {
      "CostingId": costData.CostingId,
      "PartId": costData.PartId,
      "PartNumber": costData.PartNumber,
      "NetPOPrice": props.netPOPrice,
      "LoggedInUserId": loggedInUserId(),
      "CostingNumber": costData.CostingNumber,
      "NetPackagingAndFreight": PackageAndFreightTabData && PackageAndFreightTabData[0].NetPackagingAndFreight,
      "CostingPartDetails": PackageAndFreightTabData && PackageAndFreightTabData[0].CostingPartDetails
    }

    dispatch(saveCostingPackageFreightTab(data, res => {
      if (res.data.Result) {
        toastr.success(MESSAGES.PACKAGE_FREIGHT_COSTING_SAVE_SUCCESS);
      }
    }))

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

              <form
                noValidate
                className="form"
                onSubmit={handleSubmit(onSubmit)}
              >
                <Row>
                  <Col md="12">
                    <Table className="table cr-brdr-main mb-0 " size="sm">
                      <thead>
                        <tr>
                          <th className="py-4 align-middle" style={{ width: "100px" }}>{`Part Number`}</th>
                          <th className="py-4 align-middle" style={{ width: "100px" }}>{`Net Packaging Cost`}</th>
                          <th className="py-4 align-middle" style={{ width: "150px" }}>{`Net Freight Cost`}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {PackageAndFreightTabData && PackageAndFreightTabData.map((item, index) => {
                          return (
                            <>
                              <tr class="accordian-row" key={index}>
                                <td>{item.PartNumber}</td>
                                <td>{item.CostingPartDetails.PackagingNetCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.PackagingNetCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
                                <td>{item.CostingPartDetails.FreightNetCost !== null ? checkForDecimalAndNull(item.CostingPartDetails.FreightNetCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
                              </tr>
                              <tr>
                                <td colSpan={3} className="cr-innerwrap-td ">
                                  <div>
                                    <PackageAndFreight
                                      index={index}
                                      item={item}
                                      setPackageCost={setPackageCost}
                                      setFreightCost={setFreightCost}
                                    />
                                  </div>
                                </td>
                              </tr>
                            </>
                          );
                        })}
                      </tbody>
                    </Table>
                  </Col>
                </Row>
                <div className="col-sm-12 text-right bluefooter-butn">
                  {!CostingViewMode && <button
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
                  </button>}
                </div>
              </form>
            </div>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default React.memo(TabPackagingFreight);