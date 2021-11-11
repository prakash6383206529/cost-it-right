import React, { useState, useEffect, useContext } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import {
  getPackageFreightTabData, saveCostingPackageFreightTab, setPackageAndFreightData,
  setComponentPackageFreightItemData, saveDiscountOtherCostTab, setComponentDiscountOtherItemData, saveAssemblyPartRowCostingCalculation
} from '../../actions/Costing';
import { costingInfoContext, NetPOPriceContext } from '../CostingDetailStepTwo';
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
  const netPOPrice = useContext(NetPOPriceContext);

  const { PackageAndFreightTabData, CostingEffectiveDate, ComponentItemDiscountData,RMCCTabData,SurfaceTabData,OverheadProfitTabData,DiscountCostData } = useSelector(state => state.costing)
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
    // CostingViewMode CONDITION IS USED TO AVOID CALCULATION IN VIEWMODE
    if (CostingViewMode === false) {
      let TopHeaderValues = PackageAndFreightTabData && PackageAndFreightTabData.length > 0 && PackageAndFreightTabData[0].CostingPartDetails !== undefined ? PackageAndFreightTabData[0].CostingPartDetails : null;
      let topHeaderData = {
        NetFreightPackagingCost: TopHeaderValues && TopHeaderValues.NetFreightPackagingCost !== null ? checkForNull(TopHeaderValues.NetFreightPackagingCost) : 0,
      }
      if (props.activeTab === '4') {
        props.setHeaderCost(topHeaderData)
      }
    }
  }, [PackageAndFreightTabData]);

  /**
  * @method setPackageCost
  * @description SET PACKAGE COST
  */
  const setPackageCost = (GridData, IsChanged) => {
    let arr = dispatchPackageCost(GridData, IsChanged, PackageAndFreightTabData)
    dispatch(setPackageAndFreightData(arr, () => { }))
  }

  /**
  * @method dispatchPackageCost
  * @description SET PACKAGE COST
  */
  const dispatchPackageCost = (GridData, IsChanged, arr) => {
    let tempArr = [];
    try {

      tempArr = arr && arr.map(i => {

        i.CostingPartDetails.PackagingNetCost = packageTotalCost(GridData);
        i.CostingPartDetails.NetFreightPackagingCost = i.CostingPartDetails.FreightNetCost + packageTotalCost(GridData);
        i.CostingPartDetails.CostingPackagingDetail = GridData;
        i.IsChanged = IsChanged;

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
  const setFreightCost = (GridData, IsChanged) => {
    let arr = dispatchFreightCost(GridData, IsChanged, PackageAndFreightTabData)
    dispatch(setPackageAndFreightData(arr, () => { }))
  }

  /**
  * @method dispatchFreightCost
  * @description SET FREIGHT COST
  */
  const dispatchFreightCost = (GridData, IsChanged, arr) => {
    let tempArr = [];
    try {

      tempArr = arr && arr.map(i => {

        i.CostingPartDetails.FreightNetCost = freightTotalCost(GridData);
        i.CostingPartDetails.NetFreightPackagingCost = i.CostingPartDetails.PackagingNetCost + freightTotalCost(GridData);
        i.CostingPartDetails.CostingFreightDetail = GridData;
        i.IsChanged = IsChanged;

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
    const tabData = RMCCTabData[0]
    const surfaceTabData= SurfaceTabData[0]
    const overHeadAndProfitTabData=OverheadProfitTabData[0]
    const discountAndOtherTabData =DiscountCostData[0]
    const data = {
      "CostingId": costData.CostingId,
      "PartId": costData.PartId,
      "PartNumber": costData.PartNumber,
      "NetPOPrice": netPOPrice,
      "LoggedInUserId": loggedInUserId(),
      "EffectiveDate": CostingEffectiveDate,
      "TotalCost": netPOPrice,
      "CostingNumber": costData.CostingNumber,
      //"NetPackagingAndFreight": PackageAndFreightTabData && PackageAndFreightTabData[0].NetPackagingAndFreight,
      "CostingPartDetails": PackageAndFreightTabData && PackageAndFreightTabData[0].CostingPartDetails
    }
if(costData.IsAssemblyPart === true){

  let assemblyRequestedData = {        
    "TopRow": {
      "CostingId":tabData.CostingId,
      "CostingNumber": tabData.CostingNumber,
      "TotalRawMaterialsCostWithQuantity": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
      "TotalBoughtOutPartCostWithQuantity": tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
      "TotalConversionCostWithQuantity": tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
      "TotalCalculatedRMBOPCCCostPerPC": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity +tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity+ tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
      "TotalCalculatedRMBOPCCCostPerAssembly": tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
      "NetRMCostPerAssembly": tabData.CostingPartDetails?.TotalRawMaterialsCostWithQuantity,
      "NetBOPCostAssembly": tabData.CostingPartDetails?.TotalBoughtOutPartCostWithQuantity,
      "NetConversionCostPerAssembly":tabData.CostingPartDetails?.TotalConversionCostWithQuantity,
      "NetRMBOPCCCost":tabData.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity,
      "SurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.SurfaceTreatmentCost,
      "TransportationCostPerAssembly": surfaceTabData.CostingPartDetails?.TransportationCost,
      "TotalSurfaceTreatmentCostPerAssembly": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
      "NetSurfaceTreatmentCost": surfaceTabData.CostingPartDetails?.NetSurfaceTreatmentCost,
      "NetOverheadAndProfits": overHeadAndProfitTabData.CostingPartDetails?.NetOverheadAndProfitCost,
      "NetPackagingAndFreightCost": PackageAndFreightTabData && PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost,
      "NetToolCost": discountAndOtherTabData?.CostingPartDetails?.TotalToolCost,
      "NetOtherCost": discountAndOtherTabData?.CostingPartDetails?.NetOtherCost,
      "NetDiscounts":discountAndOtherTabData?.CostingPartDetails?.NetDiscountsCost,
      "TotalCostINR": netPOPrice,
      "TabId": 4
    },
     "WorkingRows": [],
    "LoggedInUserId": loggedInUserId()
  
}
console.log(assemblyRequestedData,"assemblyRequestedData");
dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData,res =>{      }))
}

    dispatch(saveCostingPackageFreightTab(data, res => {
      if (res.data.Result) {
        toastr.success(MESSAGES.PACKAGE_FREIGHT_COSTING_SAVE_SUCCESS);
        dispatch(setComponentPackageFreightItemData({}, () => { }))
        InjectDiscountAPICall()
      }
    }))

  }


  const InjectDiscountAPICall = () => {
    dispatch(saveDiscountOtherCostTab({ ...ComponentItemDiscountData, CallingFrom: 3 }, res => {
      dispatch(setComponentDiscountOtherItemData({}, () => { }))
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
                          <th className="py-4 align-middle" style={{ width: "33.33%" }}>{`Part Number`}</th>
                          <th className="py-4 align-middle" style={{ width: "33.33%" }}>{`Net Packaging Cost`}</th>
                          <th className="py-4 align-middle" style={{ width: "33.33%" }}>{`Net Freight Cost`}</th>
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
                    <div className={"save-icon"}></div>
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