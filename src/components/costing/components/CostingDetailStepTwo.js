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
      OverAllCost =
        data.NetTotalRMBOPCC +
        tempData.NetSurfaceTreatmentCost +
        tempData.NetOverheadAndProfitCost +
        tempData.NetPackagingAndFreight +
        tempData.ToolCost - checkForNull(tempData.DiscountsAndOtherCost)
    }

    tempData = {
      ...tempData,
      NetRMCost: data.NetRawMaterialsCost,
      NetBOPCost: data.NetBoughtOutPartCost,
      NetConversionCost: data.NetConversionCost,
      NetTotalRMBOPCC: data.NetTotalRMBOPCC,
      //ToolCost: data.ToolCost,
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
        tempData.ToolCost - checkForNull(tempData.DiscountsAndOtherCost)
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
        tempData.ToolCost - tempData.DiscountsAndOtherCost
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
        tempData.ToolCost - checkForNull(tempData.DiscountsAndOtherCost)
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
        OverAllCost =
          tempData.NetTotalRMBOPCC +
          tempData.NetSurfaceTreatmentCost +
          tempData.NetOverheadAndProfitCost +
          tempData.NetPackagingAndFreight +
          data.ToolCost - checkForNull(tempData.DiscountsAndOtherCost)
      }

      tempData = {
        ...tempData,
        ToolCost: data.ToolCost,
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

      const discountedCost = SumOfTab * calculatePercentage(data.HundiOrDiscountPercentage);
      const discountValues = {
        NetPOPriceINR: checkForDecimalAndNull(SumOfTab - discountedCost, 2) + checkForDecimalAndNull(data.AnyOtherCost, 2),
        HundiOrDiscountValue: checkForDecimalAndNull(discountedCost, 2),
        AnyOtherCost: checkForDecimalAndNull(data.AnyOtherCost, 2),
        HundiOrDiscountPercentage: checkForDecimalAndNull(data.HundiOrDiscountPercentage, 2),
      }
      dispatch(setDiscountCost(discountValues, () => { }))

      OverAllCost = checkForNull(tempData.NetTotalRMBOPCC) +
        checkForNull(tempData.NetSurfaceTreatmentCost) +
        checkForNull(tempData.NetOverheadAndProfitCost) +
        checkForNull(tempData.NetPackagingAndFreight) +
        checkForNull(tempData.ToolCost) - checkForDecimalAndNull(discountedCost, 2)

      //setTimeout(() => {
      tempData = {
        ...tempData,
        DiscountsAndOtherCost: checkForDecimalAndNull(discountedCost, 2),
        TotalCost: OverAllCost + checkForDecimalAndNull(data.AnyOtherCost, 2),
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
                      <td><div className={'part-info-title'}><p><span className="cr-tbl-label">Costing Version:</span><span className="dark-blue pl-1"> {`${moment(costingData.CreatedDate).format('DD/MM/YYYY HH:mmA')}-${costingData.CostingNumber}`}</span></p></div></td>
                    </tbody>
                  </Table>
                  <div class="table-responsive">
                    <Table className="table cr-brdr-main mb-0" size="sm">
                      <thead>
                        <tr>
                          <th style={{ width: '100px' }}>{``}</th>
                          <th style={{ width: '100px' }}><span className="font-weight-500">{`${costingInfoContext.IsAssemblyPart ? 'Net RM Cost/Assembly' : 'Net RM Cost/Pc'}`}</span></th>
                          <th style={{ width: '120px' }}><span className="font-weight-500">{`${costingInfoContext.IsAssemblyPart ? 'Net BOP Cost/Assembly' : 'Net BOP Cost/Pc'}`}</span></th>
                          <th style={{ width: '120px' }}><span className="font-weight-500">{`${costingInfoContext.IsAssemblyPart ? 'Net Conversion Cost/Assembly' : 'Net Conversion Cost/Pc'}`}</span></th>
                          <th style={{ width: '150px' }}><span className="font-weight-500">{`RM + CC Cost`}</span></th>
                          <th style={{ width: '150px' }}><span className="font-weight-500">{`Surface Treatment`}</span></th>
                          <th style={{ width: '150px' }}><span className="font-weight-500">{`Overheads & Profits`}</span></th>
                          <th style={{ width: '150px' }}><span className="font-weight-500">{`Packaging & Freight`}</span></th>
                          <th style={{ width: '150px' }}><span className="font-weight-500">{`Tool Cost`}</span></th>
                          <th style={{ width: '150px' }}><span className="font-weight-500">{`Discount & Other Cost`}</span></th>
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
                                  <td><span className="dark-blue fs1 font-weight-500">{checkForDecimalAndNull(item.NetRMCost, 2)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{checkForDecimalAndNull(item.NetBOPCost, 2)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{checkForDecimalAndNull(item.NetConversionCost, 2)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{checkForDecimalAndNull(item.NetTotalRMBOPCC, 2)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{checkForDecimalAndNull(item.NetSurfaceTreatmentCost, 2)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{checkForDecimalAndNull(item.NetOverheadAndProfitCost, 2)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{checkForDecimalAndNull(item.NetPackagingAndFreight, 2)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{checkForDecimalAndNull(item.ToolCost, 2)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{checkForDecimalAndNull(item.DiscountsAndOtherCost, 2)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{checkForDecimalAndNull(item.TotalCost, 2)}</span></td>
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