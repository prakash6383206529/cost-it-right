import React, { useEffect, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table } from 'reactstrap';
import {
  getZBCCostingByCostingId, setCostingDataList, setPOPrice, setRMCCBOPCostData, setSurfaceCostData,
  setOverheadProfitCostData, setDiscountCost,
} from '../actions/Costing';
import { calculatePercentage, checkForDecimalAndNull, checkForNull } from '../../../helper';
import moment from 'moment';
import CostingHeadTabs from './CostingHeaderTabs/index'

export const costingInfoContext = React.createContext()
export const netHeadCostContext = React.createContext()
export const SurfaceCostContext = React.createContext()

function CostingDetailStepTwo(props) {

  const dispatch = useDispatch()

  useEffect(() => {
    const { costingInfo } = props;
    // setTimeout(() => {
    //   dispatch(getZBCCostingByCostingId(costingInfo.costingId, (res) => { }))
    // }, 500)
  }, []);

  const costingData = useSelector(state => state.costing.costingData)
  const CostingDataList = useSelector(state => state.costing.CostingDataList)
  const NetPOPrice = useSelector(state => state.costing.NetPOPrice)
  const RMCCBOPCost = useSelector(state => state.costing.RMCCBOPCost)
  const SurfaceCostData = useSelector(state => state.costing.SurfaceCostData)
  const OverheadProfitCostData = useSelector(state => state.costing.OverheadProfitCostData)
  const DiscountCostData = useSelector(state => state.costing.DiscountCostData)
  const partNo = useSelector((state) => state.costing.partNo)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const IsToolCostApplicable = useSelector(state => state.costing.IsToolCostApplicable)

  useEffect(() => {
    if (partNo.isChanged === true) {
      props.backBtn()
    }
  }, [partNo.isChanged])

  /**
   * @method setHeaderCostRMCCTab
   * @description SET COSTS FOR TOP HEADER FROM RM+CC TAB 
   */
  const setHeaderCostRMCCTab = (data) => {
    const headerIndex = 0;

    //setTimeout(() => {
    let DataList = CostingDataList;
    let tempData = CostingDataList && CostingDataList[headerIndex];

    let OverAllCost = 0;
    if (tempData && tempData !== undefined) {
      //CONDITION FOR OVERALL & PROCESS WISE TOOL COST.
      const ApplyCost = IsToolCostApplicable ? checkForNull(data?.NetToolsCost) : checkForNull(tempData?.ToolCost);
      OverAllCost =
        data.NetTotalRMBOPCC +
        tempData.NetSurfaceTreatmentCost +
        tempData.NetOverheadAndProfitCost +
        tempData.NetPackagingAndFreight +
        ApplyCost - checkForNull(tempData.NetDiscountsCost)
    }

    tempData = {
      ...tempData,
      NetRMCost: data.NetRawMaterialsCost,
      NetBOPCost: data.NetBoughtOutPartCost,
      NetConversionCost: data.NetConversionCost,
      NetTotalRMBOPCC: data.NetTotalRMBOPCC,
      ToolCost: IsToolCostApplicable ? checkForNull(data?.NetToolsCost) : checkForNull(tempData?.ToolCost),
      TotalCost: OverAllCost,
    }

    let tempArr = DataList && Object.assign([...DataList], { [headerIndex]: tempData })

    dispatch(setCostingDataList('setHeaderCostRMCCTab', tempArr, () => { }))
    dispatch(setPOPrice(calculateNetPOPrice(tempArr), () => { }))
    dispatch(setRMCCBOPCostData(data, () => { }))
    //}, 500)

  }

  /**
   * @method setHeaderCostSurfaceTab
   * @description SET COSTS FOR TOP HEADER FROM SURFACE TAB 
   */
  const setHeaderCostSurfaceTab = (data) => {
    const headerIndex = 0;

    //setTimeout(() => {
    let DataList = CostingDataList;
    let tempData = CostingDataList && CostingDataList[headerIndex];

    let OverAllCost = 0;
    if (tempData && tempData !== undefined) {
      OverAllCost =
        tempData.NetTotalRMBOPCC +
        data.NetSurfaceTreatmentCost +
        tempData.NetOverheadAndProfitCost +
        tempData.NetPackagingAndFreight +
        tempData.ToolCost - checkForNull(tempData.NetDiscountsCost)
    }

    tempData = {
      ...tempData,
      NetSurfaceTreatmentCost: data.NetSurfaceTreatmentCost,
      TotalCost: OverAllCost,
    }
    let tempArr = DataList && Object.assign([...DataList], { [headerIndex]: tempData })

    dispatch(setCostingDataList('setHeaderCostSurfaceTab', tempArr, () => { }))
    dispatch(setPOPrice(calculateNetPOPrice(tempArr), () => { }))
    dispatch(setSurfaceCostData(data, () => { }))

    //}, 500)

  }

  /**
   * @method setHeaderOverheadProfitCostTab
   * @description SET COSTS FOR TOP HEADER FROM OVERHEAD PROFIT TAB
   */
  const setHeaderOverheadProfitCostTab = (data) => {
    const headerIndex = 0;

    //setTimeout(() => {
    let DataList = CostingDataList;
    let tempData = CostingDataList && CostingDataList[headerIndex];

    let OverAllCost = 0;

    if (tempData && tempData !== undefined) {
      OverAllCost =
        tempData.NetTotalRMBOPCC +
        tempData.NetSurfaceTreatmentCost +
        data.NetOverheadProfitCost +
        tempData.NetPackagingAndFreight +
        tempData.ToolCost - tempData.NetDiscountsCost
    }

    tempData = {
      ...tempData,
      NetOverheadAndProfitCost: data.NetOverheadProfitCost,
      TotalCost: OverAllCost,
    }
    let tempArr = DataList && Object.assign([...DataList], { [headerIndex]: tempData })

    dispatch(setCostingDataList('setHeaderOverheadProfitCostTab', tempArr, () => { }))
    dispatch(setPOPrice(calculateNetPOPrice(tempArr), () => { }))
    dispatch(setOverheadProfitCostData(data, () => { }))

    //}, 500)

  }

  /**
   * @method setHeaderPackageFreightTab
   * @description SET COSTS FOR TOP HEADER FROM PACKAGE AND FREIGHT
   */
  const setHeaderPackageFreightTab = (data) => {
    const headerIndex = 0;

    //setTimeout(() => {
    let DataList = CostingDataList;
    let tempData = CostingDataList && CostingDataList[headerIndex];

    let OverAllCost = 0;
    if (tempData && tempData !== undefined) {
      OverAllCost =
        tempData.NetTotalRMBOPCC +
        tempData.NetSurfaceTreatmentCost +
        tempData.NetOverheadAndProfitCost +
        data.NetFreightPackagingCost +
        tempData.ToolCost - checkForNull(tempData.NetDiscountsCost)
    }

    tempData = {
      ...tempData,
      NetPackagingAndFreight: data.NetFreightPackagingCost,
      TotalCost: OverAllCost,
    }
    let tempArr = DataList && Object.assign([...DataList], { [headerIndex]: tempData })

    dispatch(setCostingDataList('setHeaderPackageFreightTab', tempArr, () => { }))
    dispatch(setPOPrice(calculateNetPOPrice(tempArr), () => { }))

    //}, 300)

  }

  /**
   * @method setHeaderCostToolTab
   * @description SET COSTS FOR TOP HEADER FROM TOOL TAB 
   */
  const setHeaderCostToolTab = (data) => {

    const headerIndex = 0;

    setTimeout(() => {
      let DataList = CostingDataList;
      let tempData = CostingDataList && CostingDataList[headerIndex];

      let OverAllCost = 0;
      if (tempData && tempData !== undefined) {
        const ApplyCost = IsToolCostApplicable ? checkForNull(tempData?.ToolCost) : checkForNull(data?.ToolCost);
        OverAllCost =
          tempData.NetTotalRMBOPCC +
          tempData.NetSurfaceTreatmentCost +
          tempData.NetOverheadAndProfitCost +
          tempData.NetPackagingAndFreight +
          ApplyCost - checkForNull(tempData.NetDiscountsCost)
      }

      tempData = {
        ...tempData,
        // ToolCost: data.ToolCost,
        ToolCost: IsToolCostApplicable ? checkForNull(tempData?.ToolCost) : checkForNull(data?.ToolCost),
        TotalCost: OverAllCost,
      }
      let tempArr = DataList && Object.assign([...DataList], { [headerIndex]: tempData })

      dispatch(setCostingDataList('setHeaderCostToolTab', tempArr, () => { }))
      dispatch(setPOPrice(calculateNetPOPrice(tempArr), () => { }))
      //dispatch(setSurfaceCostData(data, () => { }))

    }, 200)

  }

  /**
   * @method setHeaderDiscountTab
   * @description SET COSTS FOR TOP HEADER FROM DISCOUNT AND COST
   */
  const setHeaderDiscountTab = (data) => {
    const headerIndex = 0;

    let DataList = CostingDataList;
    let tempData = CostingDataList && CostingDataList[headerIndex];

    let OverAllCost = 0;
    if (tempData && tempData !== undefined) {
      //SUM OF ALL TAB EXCEPT DISCOUNT TAB
      const SumOfTab = checkForNull(tempData.NetTotalRMBOPCC) +
        checkForNull(tempData.NetSurfaceTreatmentCost) +
        checkForNull(tempData.NetOverheadAndProfitCost) +
        checkForNull(tempData.NetPackagingAndFreight) +
        checkForNull(tempData.ToolCost)

      const discountedCost = checkForDecimalAndNull(SumOfTab * calculatePercentage(data.HundiOrDiscountPercentage), initialConfiguration.NoOfDecimalForPrice);
      const discountValues = {
        NetPOPriceINR: checkForDecimalAndNull(SumOfTab - discountedCost, initialConfiguration.NoOfDecimalForPrice) + checkForDecimalAndNull(data.AnyOtherCost, initialConfiguration.NoOfDecimalForPrice),
        HundiOrDiscountValue: checkForDecimalAndNull(discountedCost, initialConfiguration.NoOfDecimalForPrice),
        AnyOtherCost: checkForDecimalAndNull(data.AnyOtherCost, initialConfiguration.NoOfDecimalForPrice),
        HundiOrDiscountPercentage: checkForDecimalAndNull(data.HundiOrDiscountPercentage, initialConfiguration.NoOfDecimalForPrice),
      }
      dispatch(setDiscountCost(discountValues, () => { }))

      OverAllCost = checkForNull(tempData.NetTotalRMBOPCC) +
        checkForNull(tempData.NetSurfaceTreatmentCost) +
        checkForNull(tempData.NetOverheadAndProfitCost) +
        checkForNull(tempData.NetPackagingAndFreight) +
        checkForNull(tempData.ToolCost) - checkForDecimalAndNull(discountedCost, initialConfiguration.NoOfDecimalForPrice)

      //setTimeout(() => {
      tempData = {
        ...tempData,
        NetDiscountsCost: checkForDecimalAndNull(discountedCost, initialConfiguration.NoOfDecimalForPrice),
        NetOtherCost: checkForDecimalAndNull(data.AnyOtherCost, initialConfiguration.NoOfDecimalForPrice),
        TotalCost: OverAllCost + checkForDecimalAndNull(data.AnyOtherCost, initialConfiguration.NoOfDecimalForPrice),
      }
      let tempArr = DataList && Object.assign([...DataList], { [headerIndex]: tempData })

      dispatch(setCostingDataList('setHeaderDiscountTab', tempArr, () => { }))
      dispatch(setPOPrice(calculateNetPOPrice(tempArr), () => { }))

      //}, 500)
    }
  }

  /**
  * @method calculateNetPOPrice
  * @description CALCULATE NET PO PRICE
  */
  const calculateNetPOPrice = (item) => {
    let TotalCost = 0;
    TotalCost = item && item.reduce((accummlator, el) => {
      return accummlator + checkForNull(el.TotalCost);
    }, 0)
    return TotalCost;
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
                    <h2>{''}</h2>
                  </div>
                </Col>
              </Row>

              <Row className="sticky-top-0 mb-3">
                <Col md="12">
                  <Table className="table cr-brdr-main mb-0 border-bottom-0" size="sm">
                    <tbody>
                      <td><div className={'part-info-title'}><p><span className="">Technology:</span><span className="dark-blue pl-1"> {costingData.TechnologyName}</span></p></div></td>
                      {/* <td><div className={'part-info-title'}><p><span className="cr-tbl-label">Part No:</span><span className="dark-blue pl-1"> {costingData.PartNumber}</span></p></div></td> */}
                      <td><div className={'part-info-title'}><p><span className="cr-tbl-label">Part Name:</span><span className="dark-blue pl-1"> {costingData.PartName}</span></p></div></td>
                      {costingData.IsVendor && <td><div className={'part-info-title'}><p><span className="cr-tbl-label">Vendor:</span><span className="dark-blue pl-1"> {costingData.VendorName}</span></p></div></td>}
                      {!costingData.IsVendor && <td><div className={'part-info-title'}><p><span className="cr-tbl-label">Plant:</span><span className="dark-blue pl-1"> {`${costingData.IsVendor ? costingData.VendorPlantName : costingData.PlantName}(${costingData.VendorType})`}</span></p></div></td>}
                      <td><div className={'part-info-title'}><p><span className="cr-tbl-label">SOB:</span><span className="dark-blue pl-1"> {costingData.ShareOfBusinessPercent}%</span></p></div></td>
                      <td><div className={'part-info-title'}><p><span className="cr-tbl-label">Costing Version:</span><span className="dark-blue pl-1"> {`${moment(costingData.CreatedDate).format('DD/MM/YYYY')}-${costingData.CostingNumber}`}</span></p></div></td>
                    </tbody>
                  </Table>
                  <div class="table-responsive">
                    <Table className="table cr-brdr-main mb-0" size="sm">
                      <thead>
                        <tr>
                          <th style={{ width: '140px' }}>{``}</th>
                          <th style={{ width: '100px' }}><span className="font-weight-500">{`${costingInfoContext.IsAssemblyPart ? 'RM Cost/Assembly' : 'RM Cost/Pc'}`}</span></th>
                          <th style={{ width: '120px' }}><span className="font-weight-500">{`${costingInfoContext.IsAssemblyPart ? 'BOP Cost/Assembly' : 'BOP Cost/Pc'}`}</span></th>
                          <th style={{ width: '120px' }}><span className="font-weight-500">{`${costingInfoContext.IsAssemblyPart ? 'Conversion Cost/Assembly' : 'Conversion Cost/Pc'}`}</span></th>
                          <th style={{ width: '150px' }}><span className="font-weight-500">{`Net RM + CC Cost`}</span></th>
                          <th style={{ width: '150px' }}><span className="font-weight-500">{`Surface Treatment Cost`}</span></th>
                          <th style={{ width: '150px' }}><span className="font-weight-500">{`Overheads & Profits`}</span></th>
                          <th style={{ width: '150px' }}><span className="font-weight-500">{`Packaging & Freight Cost`}</span></th>
                          <th style={{ width: '150px' }}><span className="font-weight-500">{`Tool Cost`}</span></th>
                          <th style={{ width: '150px' }}><span className="font-weight-500">{`Other Cost`}</span></th>
                          <th style={{ width: '150px' }}><span className="font-weight-500">{`Discounts`}</span></th>
                          <th style={{ width: '150px' }}><span className="font-weight-500">{`Total Cost(INR)`}</span></th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="cr-bg-tbl">
                          {
                            CostingDataList && CostingDataList.map((item, index) => {
                              return (
                                <>
                                  <td><span className="cr-prt-nm fs1 font-weight-500">{item.PartNumber}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{checkForDecimalAndNull(item.NetRMCost, initialConfiguration.NoOfDecimalForPrice)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{checkForDecimalAndNull(item.NetBOPCost, initialConfiguration.NoOfDecimalForPrice)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{checkForDecimalAndNull(item.NetConversionCost, initialConfiguration.NoOfDecimalForPrice)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{checkForDecimalAndNull(item.NetTotalRMBOPCC, initialConfiguration.NoOfDecimalForPrice)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{checkForDecimalAndNull(item.NetSurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{checkForDecimalAndNull(item.NetOverheadAndProfitCost, initialConfiguration.NoOfDecimalForPrice)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{checkForDecimalAndNull(item.NetPackagingAndFreight, initialConfiguration.NoOfDecimalForPrice)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{checkForDecimalAndNull(item.ToolCost, initialConfiguration.NoOfDecimalForPrice)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{checkForDecimalAndNull(item.NetOtherCost, initialConfiguration.NoOfDecimalForPrice)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{checkForDecimalAndNull(item.NetDiscountsCost, initialConfiguration.NoOfDecimalForPrice)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{checkForDecimalAndNull(item.TotalCost, initialConfiguration.NoOfDecimalForPrice)}</span></td>
                                </>
                              )
                            }
                            )}
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </Col>
              </Row>

              <Row>
                <Col md="3">
                  <button
                    type="button"
                    className="submit-button mr5 save-btn cr-bk-btn"
                    onClick={props.backBtn} >
                    <div className={'check-icon'}><img src={require('../../../assests/images/back.png')} alt='check-icon.jpg' /> </div>
                    {'Back '}
                  </button>
                </Col>
              </Row>

              <Row className="sepration-box"></Row>

              <Row>
                <Col md="12">
                  <costingInfoContext.Provider value={costingData} >
                    <netHeadCostContext.Provider value={RMCCBOPCost} >
                      <SurfaceCostContext.Provider value={SurfaceCostData} >
                        <CostingHeadTabs
                          //costData={costingData}
                          netPOPrice={NetPOPrice}
                          setHeaderCost={setHeaderCostRMCCTab}
                          setHeaderCostSurfaceTab={setHeaderCostSurfaceTab}
                          setHeaderOverheadProfitCostTab={setHeaderOverheadProfitCostTab}
                          setHeaderPackageFreightTab={setHeaderPackageFreightTab}
                          setHeaderCostToolTab={setHeaderCostToolTab}
                          setHeaderDiscountTab={setHeaderDiscountTab}
                          DiscountTabData={DiscountCostData}
                          headCostRMCCBOPData={RMCCBOPCost}
                          headCostSurfaceData={SurfaceCostData}
                          headCostOverheadProfitData={OverheadProfitCostData}
                          backBtn={props.backBtn}
                          toggle={props.toggle}
                        />
                      </SurfaceCostContext.Provider>
                    </netHeadCostContext.Provider>
                  </costingInfoContext.Provider>
                </Col>
              </Row>

            </div>
          </Col>
        </Row>
      </div>

    </>
  );
};


export default CostingDetailStepTwo;