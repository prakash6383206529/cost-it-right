import React, { useEffect, useContext } from 'react';
import { useForm, } from "react-hook-form";
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table, } from 'reactstrap';
import {
  getPackageFreightTabData, saveCostingPackageFreightTab, setPackageAndFreightData,
  setComponentPackageFreightItemData, saveDiscountOtherCostTab, setComponentDiscountOtherItemData, saveAssemblyPartRowCostingCalculation, saveCostingPaymentTermDetail
} from '../../actions/Costing';
import { costingInfoContext, NetPOPriceContext } from '../CostingDetailStepTwo';
import { checkForDecimalAndNull, checkForNull, loggedInUserId, } from '../../../../helper';
import PackageAndFreight from '../CostingHeadCosts/PackageAndFreight';
import Toaster from '../../../common/Toaster';
import { MESSAGES } from '../../../../config/message';
import { IsPartType, ViewCostingContext } from '../CostingDetails';
import { createToprowObjAndSave, formatMultiTechnologyUpdate } from '../../CostingUtil';
import { Link } from 'react-scroll';
import { IdForMultiTechnology, PART_TYPE_ASSEMBLY } from '../../../../config/masterData';
import { debounce } from 'lodash';
import { updateMultiTechnologyTopAndWorkingRowCalculation } from '../../actions/SubAssembly';
import { LOGISTICS } from '../../../../config/masterData';
import { useHistory } from 'react-router';
import { WACTypeId } from '../../../../config/constants';
import { PreviousTabData } from '../CostingHeaderTabs';
function TabPackagingFreight(props) {

  const { handleSubmit, } = useForm();

  const dispatch = useDispatch()

  const costData = useContext(costingInfoContext);
  const CostingViewMode = useContext(ViewCostingContext);
  const netPOPrice = useContext(NetPOPriceContext);
  const isPartType = useContext(IsPartType);

  const { PackageAndFreightTabData, CostingEffectiveDate, ComponentItemDiscountData, RMCCTabData, SurfaceTabData, OverheadProfitTabData, DiscountCostData, ToolTabData, getAssemBOPCharge, checkIsFreightPackageChange, PaymentTermDataDiscountTab } = useSelector(state => state.costing)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const partType = (IdForMultiTechnology.includes(String(costData?.TechnologyId)) || costData.CostingTypeId === WACTypeId)
  const { subAssemblyTechnologyArray } = useSelector(state => state.subAssembly)
  const { ComponentItemData, costingData } = useSelector(state => state.costing)
  let history = useHistory();
  const previousTab = useContext(PreviousTabData) || 0;

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
      let TopHeaderValues = PackageAndFreightTabData && PackageAndFreightTabData.length > 0 && PackageAndFreightTabData[0]?.CostingPartDetails !== undefined ? PackageAndFreightTabData[0]?.CostingPartDetails : null;
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
        i.CostingPartDetails.NetFreightPackagingCost = i?.CostingPartDetails?.FreightNetCost + packageTotalCost(GridData);
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
    cost = item && item?.reduce((accummlator, el) => {
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
        i.CostingPartDetails.NetFreightPackagingCost = i?.CostingPartDetails?.PackagingNetCost + freightTotalCost(GridData);
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
    cost = item && item?.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.FreightCost);
    }, 0)
    return cost;
  }

  /**
  * @method saveCosting
  * @description SAVE COSTING
  */
  const saveCosting = debounce((data, e, gotoNextValue) => {

    if (checkIsFreightPackageChange) {

      const tabData = RMCCTabData[0]
      const surfaceTabData = SurfaceTabData[0]
      const overHeadAndProfitTabData = OverheadProfitTabData[0]
      const discountAndOtherTabData = DiscountCostData
      const packageAndFreightTabData = PackageAndFreightTabData && PackageAndFreightTabData[0]
      const toolTabData = ToolTabData && ToolTabData[0]

      const data = {
        "CostingId": costData.CostingId,
        "PartId": costData.PartId,
        "PartNumber": costData.PartNumber,
        "NetPOPrice": netPOPrice,
        "LoggedInUserId": loggedInUserId(),
        "EffectiveDate": CostingEffectiveDate,
        "TotalCost": netPOPrice,
        "CostingNumber": costData.CostingNumber,
        // "NetPackagingAndFreight": PackageAndFreightTabData && PackageAndFreightTabData[0].NetPackagingAndFreight,
        "CostingPartDetails": PackageAndFreightTabData && PackageAndFreightTabData[0]?.CostingPartDetails,
        "BasicRate": discountAndOtherTabData?.BasicRateINR,
      }
      if (costData.IsAssemblyPart === true && !partType) {
        if (!CostingViewMode) {
          let assemblyRequestedData = createToprowObjAndSave(tabData, surfaceTabData, PackageAndFreightTabData, overHeadAndProfitTabData, ToolTabData, discountAndOtherTabData, netPOPrice, getAssemBOPCharge, 4, CostingEffectiveDate, '', '', isPartType, initialConfiguration?.IsAddPaymentTermInNetCost)
          dispatch(saveAssemblyPartRowCostingCalculation(assemblyRequestedData, res => { }))
        }
      }

      if (partType) {
        let tempsubAssemblyTechnologyArray = subAssemblyTechnologyArray[0]
        tempsubAssemblyTechnologyArray.CostingPartDetails.NetFreightPackagingCost = PackageAndFreightTabData && PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost
        const totalOverheadPrice = OverheadProfitTabData && (checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.OverheadCost) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.ProfitCost) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.RejectionCost) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.ICCCost))
        let totalCost = (checkForNull(tempsubAssemblyTechnologyArray?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) +
          checkForNull(surfaceTabData?.CostingPartDetails?.NetSurfaceTreatmentCost) +
          checkForNull(packageAndFreightTabData?.CostingPartDetails?.NetFreightPackagingCost) +
          checkForNull(toolTabData?.CostingPartDetails?.TotalToolCost) +
          checkForNull(totalOverheadPrice) +
          checkForNull(DiscountCostData?.AnyOtherCost) + checkForNull(DiscountCostData?.totalConditionCost)) + (initialConfiguration?.IsAddPaymentTermInNetCost ? checkForNull(DiscountCostData?.paymentTermCost) : 0) -
          checkForNull(DiscountCostData?.HundiOrDiscountValue)

        let request = formatMultiTechnologyUpdate(tempsubAssemblyTechnologyArray, totalCost, surfaceTabData, overHeadAndProfitTabData, packageAndFreightTabData, toolTabData, DiscountCostData, CostingEffectiveDate, initialConfiguration?.IsAddPaymentTermInNetCost)
        dispatch(updateMultiTechnologyTopAndWorkingRowCalculation(request, res => { }))

      }

      dispatch(saveCostingPackageFreightTab(data, res => {
        if (res.data.Result) {
          Toaster.success(costingData.TechnologyId === LOGISTICS ? MESSAGES.FREIGHT_COSTING_SAVE_SUCCESS : MESSAGES.PACKAGE_FREIGHT_COSTING_SAVE_SUCCESS);
          dispatch(setComponentPackageFreightItemData({}, () => { }))
          InjectDiscountAPICall()
          if ((costingData?.TechnologyId === LOGISTICS) && gotoNextValue) {
            props?.toggle('2')
            history?.push('/costing-summary')
          }
        }
      }))
    }
  }, 500)


  const InjectDiscountAPICall = () => {
    let basicRate = 0
    if (Number(isPartType?.value) === PART_TYPE_ASSEMBLY && !partType) {
      basicRate = checkForNull(RMCCTabData[0]?.CostingPartDetails?.TotalCalculatedRMBOPCCCostWithQuantity) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) +
        checkForNull(SurfaceTabData[0]?.CostingPartDetails?.TotalCalculatedSurfaceTreatmentCostWithQuantitys) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
    } else if (partType) {
      let totalOverheadPrice = OverheadProfitTabData && (checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.OverheadCost) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.ProfitCost) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.RejectionCost) + checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.ICCCost))
      basicRate = checkForNull(subAssemblyTechnologyArray[0]?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) + checkForNull(totalOverheadPrice) +
        checkForNull(SurfaceTabData[0]?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
    } else {
      basicRate = checkForNull(OverheadProfitTabData[0]?.CostingPartDetails?.NetOverheadAndProfitCost) + checkForNull(RMCCTabData[0]?.CostingPartDetails?.TotalCalculatedRMBOPCCCost) +
        checkForNull(SurfaceTabData[0]?.CostingPartDetails?.NetSurfaceTreatmentCost) + checkForNull(PackageAndFreightTabData[0]?.CostingPartDetails?.NetFreightPackagingCost) +
        checkForNull(ToolTabData[0]?.CostingPartDetails?.TotalToolCost) + checkForNull(DiscountCostData?.AnyOtherCost) - checkForNull(DiscountCostData?.HundiOrDiscountValue)
    }
    dispatch(saveDiscountOtherCostTab({ ...ComponentItemDiscountData, BasicRate: basicRate }, res => {
      if (Number(previousTab) === 6) {
        dispatch(saveCostingPaymentTermDetail(PaymentTermDataDiscountTab, (res) => { }));
      }
    }))
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

              <form
                noValidate
                className="form"
              >
                <Row>
                  <Col md="12">
                    <Table className="table cr-brdr-main mb-0 " size="sm">
                      <thead>
                        <tr>
                          <th className="py-4 align-middle" style={{ width: "33.33%" }}>{`Part Number`}</th>
                          {costingData.TechnologyId !== LOGISTICS && <th className="py-4 align-middle" style={{ width: "33.33%" }}>{`Net Packaging Cost`}</th>}
                          <th className="py-4 align-middle" style={{ width: "33.33%" }}>{`Net Freight Cost`}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {PackageAndFreightTabData && PackageAndFreightTabData.map((item, index) => {
                          return (
                            <>
                              <tr class="accordian-row" key={index} >
                                <td>{item?.PartNumber}</td>
                                <td>{item?.CostingPartDetails?.PackagingNetCost !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.PackagingNetCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
                                {costingData.TechnologyId !== LOGISTICS && <td>{item?.CostingPartDetails?.FreightNetCost !== null ? checkForDecimalAndNull(item?.CostingPartDetails?.FreightNetCost, initialConfiguration.NoOfDecimalForPrice) : 0}</td>}
                              </tr>
                              <tr>
                                <td colSpan={3} className="cr-innerwrap-td">
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
                <div className="col-sm-12 text-right bluefooter-butn sticky-btn-footer packaging-freight-btn-save">
                  {!CostingViewMode && <button
                    type={"button"}
                    className="submit-button mr5 save-btn"
                    onClick={(data, e) => { handleSubmit(saveCosting(data, e, false)) }}
                  >
                    <div className={"save-icon"}></div>
                    {"Save"}
                  </button>}
                  {!CostingViewMode && costingData.TechnologyId === LOGISTICS && <button
                    type="button"
                    className="submit-button save-btn"
                    onClick={(data, e) => { handleSubmit(saveCosting(data, e, true)) }}
                  // disabled={isDisable}
                  >
                    {"Next"}
                    <div className={"next-icon"}></div>
                  </button>}
                </div>
              </form>
            </div >
          </Col >
        </Row >
      </div >
    </>
  );
};

export default React.memo(TabPackagingFreight);