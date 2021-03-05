import React, { useState, useEffect, useCallback, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table } from 'reactstrap';
import {
  getZBCCostingByCostingId, setCostingDataList, setPOPrice, setRMCCBOPCostData, setSurfaceCostData,
  setOverheadProfitCostData, setDiscountCost,
} from '../actions/Costing';
import { calculatePercentage, checkForDecimalAndNull, checkForNull } from '../../../helper';
import moment from 'moment';
import CostingHeadTabs from './costingHeaderTabs/index'
import { VBC, ZBC } from '../../../config/constants';

export const costingInfoContext = React.createContext()
export const netHeadCostContext = React.createContext()

function CostingDetailStepTwo(props) {

  const dispatch = useDispatch()

  useEffect(() => {
    const { costingInfo } = props;
    dispatch(getZBCCostingByCostingId(costingInfo.costingId, (res) => { }))
  }, []);

  const costingData = useSelector(state => state.costing.costingData)
  const CostingDataList = useSelector(state => state.costing.CostingDataList)
  const NetPOPrice = useSelector(state => state.costing.NetPOPrice)
  const RMCCBOPCost = useSelector(state => state.costing.RMCCBOPCost)
  const SurfaceCostData = useSelector(state => state.costing.SurfaceCostData)
  const OverheadProfitCostData = useSelector(state => state.costing.OverheadProfitCostData)
  const DiscountCostData = useSelector(state => state.costing.DiscountCostData)

  /**
  * @method netRMCostPerAssembly
  * @description GET TOTAL RM COST FOR TOP HEADER 
  */
  const netRMCostPerAssembly = useCallback((item) => {
    return item && item.NetRMCost !== null ? checkForDecimalAndNull(item.NetRMCost, 2) : 0
  }, [])

  /**
   * @method netBOPCostPerAssembly
   * @description GET TOTAL BOP COST FOR TOP HEADER 
   */
  const netBOPCostPerAssembly = useCallback((item) => {
    return item && item.NetBOPCost !== null ? checkForNull(item.NetBOPCost) : 0
  }, [])

  /**
   * @method netConversionCostPerAssembly
   * @description GET TOTAL CONVERSION COST FOR TOP HEADER 
   */
  const netConversionCostPerAssembly = useCallback((item) => {
    return item && item.NetConversionCost !== null ? checkForNull(item.NetConversionCost) : 0
  }, [])

  /**
   * @method netRMCCcost
   * @description GET RM + CC COST TOTAL OF (RM+BOP+CC) FOR TOP HEADER 
   */
  const netRMCCcost = useCallback((item) => {
    const netRM = item && item.NetRMCost !== null ? checkForNull(item.NetRMCost) : 0
    const netBOP = item && item.NetBOPCost !== null ? checkForNull(item.NetBOPCost) : 0
    const netCC = item && item.NetConversionCost !== null ? checkForNull(item.NetConversionCost) : 0
    return checkForDecimalAndNull(netRM + netBOP + netCC, 2);
  }, [])

  /**
   * @method netSurfaceTreatmentCost
   * @description GET NET SURFACE TREATMENT COST FOR TOP HEADER 
   */
  const netSurfaceTreatmentCost = useCallback((item) => {
    return item && item.NetSurfaceTreatmentCost !== null ? checkForDecimalAndNull(item.NetSurfaceTreatmentCost, 2) : 0
  }, [])

  /**
   * @method netOverheadProfitCost
   * @description GET NET OVERHEAD & PROFIT COST FOR TOP HEADER 
   */
  const netOverheadProfitCost = useCallback((item) => {
    return item && item.NetOverheadAndProfitCost !== null ? checkForDecimalAndNull(item.NetOverheadAndProfitCost, 2) : 0
  }, [])

  /**
   * @method netPackagingFreightCost
   * @description GET NET PACKAGING & FREIGHT COST FOR TOP HEADER 
   */
  const netPackagingFreightCost = useCallback((item) => {
    return item && item.NetPackagingAndFreight !== null ? checkForDecimalAndNull(item.NetPackagingAndFreight, 2) : 0
  }, [])

  /**
   * @method netToolCost
   * @description GET NET TOOL COST FOR TOP HEADER 
   */
  const netToolCost = useCallback((item) => {
    return item && item.ToolCost !== null ? checkForDecimalAndNull(item.ToolCost, 2) : 0
  }, [])

  /**
   * @method netDiscountOtherCost
   * @description GET NET DISCOUNT & OTHER COST FOR TOP HEADER 
   */
  const netDiscountOtherCost = useCallback((item) => {
    return item && item.DiscountsAndOtherCost !== null ? checkForNull(item.DiscountsAndOtherCost) : 0
  }, [])

  /**
   * @method netTotalCost
   * @description GET NET TOTAL COST FOR TOP HEADER 
   */
  const netTotalCost = useCallback((item) => {

    const RMCCCost = netRMCCcost(item);
    const netSurfaceTreatmentCost = item && item.NetSurfaceTreatmentCost !== null ? checkForNull(item.NetSurfaceTreatmentCost) : 0
    const netOverheadProfitCost = item && item.NetOverheadAndProfitCost !== null ? checkForNull(item.NetOverheadAndProfitCost) : 0
    const netPackagingFreightCost = item && item.NetPackagingAndFreight !== null ? checkForNull(item.NetPackagingAndFreight) : 0
    const ToolCost = item && item.ToolCost !== null ? checkForNull(item.ToolCost) : 0
    const discountOtherCost = item && item.DiscountsAndOtherCost !== null ? checkForNull(item.DiscountsAndOtherCost) : 0

    return checkForDecimalAndNull(RMCCCost + netSurfaceTreatmentCost + netPackagingFreightCost + netOverheadProfitCost + ToolCost - discountOtherCost, 2);

  }, [])

  /**
   * @method setHeaderCostRMCCTab
   * @description SET COSTS FOR TOP HEADER FROM RM+CC TAB 
   */
  const setHeaderCostRMCCTab = (data) => {
    const headerIndex = 0;

    setTimeout(() => {
      let DataList = CostingDataList;
      let tempData = CostingDataList && CostingDataList[headerIndex];

      let OverAllCost = 0;
      if (tempData && tempData !== undefined) {
        OverAllCost =
          data.NetTotalRMBOPCC +
          tempData.NetSurfaceTreatmentCost +
          tempData.NetOverheadAndProfitCost +
          tempData.NetPackagingAndFreight + data.NetToolsCost - checkForNull(tempData.DiscountsAndOtherCost)
      }

      tempData = {
        ...tempData,
        NetRMCost: data.NetRawMaterialsCost,
        NetBOPCost: data.NetBoughtOutPartCost,
        NetConversionCost: data.NetConversionCost,
        NetTotalRMBOPCC: data.NetTotalRMBOPCC,
        ToolCost: data.NetToolsCost,
        TotalCost: OverAllCost,
      }

      let tempArr = DataList && Object.assign([...DataList], { [headerIndex]: tempData })

      dispatch(setCostingDataList(tempArr, () => { }))
      dispatch(setPOPrice(calculateNetPOPrice(tempArr), () => { }))
      dispatch(setRMCCBOPCostData(data, () => { }))
    }, 500)

  }

  /**
   * @method setHeaderCostSurfaceTab
   * @description SET COSTS FOR TOP HEADER FROM SURFACE TAB 
   */
  const setHeaderCostSurfaceTab = (data) => {
    const headerIndex = 0;

    setTimeout(() => {
      let DataList = CostingDataList;
      let tempData = CostingDataList && CostingDataList[headerIndex];

      let OverAllCost = 0;
      if (tempData && tempData !== undefined) {
        OverAllCost =
          tempData.NetTotalRMBOPCC +
          data.NetSurfaceTreatmentCost +
          tempData.NetOverheadAndProfitCost +
          tempData.NetPackagingAndFreight +
          checkForNull(tempData.ToolCost) - checkForNull(tempData.DiscountsAndOtherCost)
      }

      tempData = {
        ...tempData,
        NetSurfaceTreatmentCost: data.NetSurfaceTreatmentCost,
        TotalCost: OverAllCost,
      }
      let tempArr = DataList && Object.assign([...DataList], { [headerIndex]: tempData })

      dispatch(setCostingDataList(tempArr, () => { }))
      dispatch(setPOPrice(calculateNetPOPrice(tempArr), () => { }))
      dispatch(setSurfaceCostData(data, () => { }))

    }, 500)

  }

  /**
   * @method setHeaderOverheadProfitCostTab
   * @description SET COSTS FOR TOP HEADER FROM OVERHEAD PROFIT TAB
   */
  const setHeaderOverheadProfitCostTab = (data) => {
    const headerIndex = 0;

    setTimeout(() => {
      let DataList = CostingDataList;
      let tempData = CostingDataList && CostingDataList[headerIndex];

      let OverAllCost = 0;

      if (tempData && tempData !== undefined) {
        const RMBOPCCCost = tempData && tempData.NetTotalRMBOPCC !== undefined ? checkForNull(tempData.NetTotalRMBOPCC) : 0;
        const surfaceCost = tempData && tempData.NetSurfaceTreatmentCost !== undefined ? checkForNull(tempData.NetSurfaceTreatmentCost) : 0;
        const PackageCost = tempData && tempData.NetPackagingAndFreight !== undefined ? checkForNull(tempData.NetPackagingAndFreight) : 0;
        const toolCost = tempData && tempData.ToolCost !== undefined ? checkForNull(tempData.ToolCost) : 0;
        const discountCost = tempData && tempData.DiscountsAndOtherCost !== undefined ? checkForNull(tempData.DiscountsAndOtherCost) : 0;

        OverAllCost = RMBOPCCCost + surfaceCost + data.NetOverheadProfitCost + PackageCost + toolCost - discountCost
      }

      tempData = {
        ...tempData,
        NetOverheadAndProfitCost: data.NetOverheadProfitCost,
        TotalCost: OverAllCost,
      }
      let tempArr = DataList && Object.assign([...DataList], { [headerIndex]: tempData })

      dispatch(setCostingDataList(tempArr, () => { }))
      dispatch(setPOPrice(calculateNetPOPrice(tempArr), () => { }))
      dispatch(setOverheadProfitCostData(data, () => { }))

    }, 500)

  }

  /**
   * @method setHeaderPackageFreightTab
   * @description SET COSTS FOR TOP HEADER FROM PACKAGE AND FREIGHT
   */
  const setHeaderPackageFreightTab = (data) => {

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
          data.NetFreightPackagingCost +
          checkForNull(tempData.ToolCost) - checkForNull(tempData.DiscountsAndOtherCost)
      }

      tempData = {
        ...tempData,
        NetPackagingAndFreight: data.NetFreightPackagingCost,
        TotalCost: OverAllCost,
      }
      let tempArr = DataList && Object.assign([...DataList], { [headerIndex]: tempData })

      dispatch(setCostingDataList(tempArr, () => { }))
      dispatch(setPOPrice(calculateNetPOPrice(tempArr), () => { }))

    }, 500)

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
          checkForNull(data.ToolCost) - checkForNull(tempData.DiscountsAndOtherCost)
      }

      tempData = {
        ...tempData,
        ToolCost: data.ToolCost,
        TotalCost: OverAllCost,
      }
      let tempArr = DataList && Object.assign([...DataList], { [headerIndex]: tempData })

      dispatch(setCostingDataList(tempArr, () => { }))
      dispatch(setPOPrice(calculateNetPOPrice(tempArr), () => { }))
      //dispatch(setSurfaceCostData(data, () => { }))

    }, 500)

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
      const SumOfTab = checkForNull(tempData.NetTotalRMBOPCC) + checkForNull(tempData.NetSurfaceTreatmentCost) +
        checkForNull(tempData.NetOverheadAndProfitCost) + checkForNull(tempData.NetPackagingAndFreight) +
        checkForNull(tempData.ToolCost)

      const cost = SumOfTab * calculatePercentage(data.HundiOrDiscountPercentage);
      const discountValues = {
        NetPOPriceINR: checkForDecimalAndNull(SumOfTab - cost, 2),
        HundiOrDiscountValue: checkForDecimalAndNull(cost, 2),
      }
      dispatch(setDiscountCost(discountValues, () => { }))

      OverAllCost = checkForNull(tempData.NetTotalRMBOPCC) +
        checkForNull(tempData.NetSurfaceTreatmentCost) +
        checkForNull(tempData.NetOverheadAndProfitCost) +
        checkForNull(tempData.NetPackagingAndFreight) +
        checkForNull(tempData.ToolCost) - checkForDecimalAndNull(cost, 2)

      setTimeout(() => {
        tempData = {
          ...tempData,
          DiscountsAndOtherCost: checkForDecimalAndNull(cost, 2),
          TotalCost: OverAllCost,
        }
        let tempArr = DataList && Object.assign([...DataList], { [headerIndex]: tempData })

        dispatch(setCostingDataList(tempArr, () => { }))
        dispatch(setPOPrice(calculateNetPOPrice(tempArr), () => { }))

      }, 500)
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
      <span className="position-relative costing-page-tabs d-block w-100">
        <div className="right-actions">
          <button className="btn btn-link text-primary">
            <img src={require('../../../assests/images/print.svg')} alt="print-button" />
            <span className="d-block mt-1">PRINT</span>
          </button>
          <button className="btn btn-link text-primary">
            <img src={require('../../../assests/images/excel.svg')} alt="print-button" />
            <span className="d-block mt-1">XLS</span>
          </button>
          <button className="btn btn-link text-primary">
            <img src={require('../../../assests/images/pdf.svg')} alt="print-button" />
            <span className="d-block mt-1">PDF</span>
          </button>
          <button className="btn btn-link text-primary pr-0">
            <img src={require('../../../assests/images/add-bom.svg')} alt="print-button" />
            <span className="d-block mt-1">ADD BOM</span>
          </button>
        </div>
      </span>
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
                      <td><div className={'part-info-title'}><p><span className="cr-tbl-label">Part No:</span><span className="dark-blue pl-1"> {costingData.PartNumber}</span></p></div></td>
                      <td><div className={'part-info-title'}><p><span className="cr-tbl-label">Part Name:</span><span className="dark-blue pl-1"> {costingData.PartName}</span></p></div></td>
                      <td><div className={'part-info-title'}><p><span className="cr-tbl-label">{costingData.VendorType}:</span><span className="dark-blue pl-1"> SOB:{costingData.ShareOfBusinessPercent}%</span></p></div></td>
                      <td><div className={'part-info-title'}><p><span className="cr-tbl-label">Costing ID:</span><span className="dark-blue pl-1"> {costingData.CostingNumber}</span></p></div></td>
                      <td><div className={'part-info-title'}><p><span className="cr-tbl-label">Costing Date Time:</span><span className="dark-blue pl-1"> {moment(costingData.CreatedDate).format('DD/MM/YYYY HH:mmA')}</span></p></div></td>
                    </tbody>
                  </Table>
                  <div class="table-responsive">
                    <Table className="table cr-brdr-main mb-0" size="sm">
                      <thead>
                        <tr>
                          <th style={{ width: '100px' }}>{``}</th>
                          <th style={{ width: '100px' }}>{`Net RM Cost/Assembly`}</th>
                          <th style={{ width: '120px' }}>{`Net BOP Cost/Assembly`}</th>
                          <th style={{ width: '120px' }}>{`Net Conversion Cost/Assembly`}</th>
                          <th style={{ width: '150px' }}>{`RM + CC Cost`}</th>
                          <th style={{ width: '150px' }}>{`Surface Treatment`}</th>
                          <th style={{ width: '150px' }}>{`Overheads & Profits`}</th>
                          <th style={{ width: '150px' }}>{`Packaging & Freight`}</th>
                          <th style={{ width: '150px' }}>{`Tool Cost`}</th>
                          <th style={{ width: '150px' }}>{`Discount & Other Cost`}</th>
                          <th style={{ width: '150px' }}>{`Total Cost`}</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="cr-bg-tbl">
                          {
                            CostingDataList &&
                            CostingDataList.map((item, index) => {
                              return (
                                <>
                                  <td><span className="cr-prt-nm fs1 font-weight-500">{item.PartNumber}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{netRMCostPerAssembly(item)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{netBOPCostPerAssembly(item)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{netConversionCostPerAssembly(item)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{netRMCCcost(item)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{netSurfaceTreatmentCost(item)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{netOverheadProfitCost(item)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{netPackagingFreightCost(item)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{netToolCost(item)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{netDiscountOtherCost(item)}</span></td>
                                  <td><span className="dark-blue fs1 font-weight-500">{netTotalCost(item)}</span></td>
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