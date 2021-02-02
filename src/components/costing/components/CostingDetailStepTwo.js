import React, { useState, useEffect, useCallback, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table } from 'reactstrap';
import moment from 'moment';
import { getZBCCostingByCostingId } from '../actions/Costing';
import { checkForDecimalAndNull, checkForNull } from '../../../helper';
import CostingHeadTabs from './costingHeaderTabs/index'
import { VBC, ZBC } from '../../../config/constants';


export const costingInfoContext = React.createContext()
export const netHeadCostContext = React.createContext()

function CostingDetailStepTwo(props) {

  const [costData, setCostData] = useState({});
  const [netPOPrice, setPOPrice] = useState(0);
  const [partDataList, setPartDataList] = useState([]);

  const [headCostRMCCBOPData, setHeadCostRMCCBOPData] = useState({});
  const [headCostSurfaceData, setHeadCostSurfaceData] = useState({});
  const [headCostOverheadProfitData, setHeadCostOverheadProfitData] = useState({});
  const [headCostPackageFreightData, setHeadCostPackageFreightData] = useState({});

  const dispatch = useDispatch()

  useEffect(() => {

    const { costingInfo } = props;

    if (costingInfo.type === ZBC) {
      dispatch(getZBCCostingByCostingId(costingInfo.costingId, (res) => {
        setCostData(res.data.Data);
        setPartDataList(res.data.DataList);
      }))
    }

    if (costingInfo.type === VBC) {
      dispatch(getZBCCostingByCostingId(costingInfo.costingId, (res) => {
        setCostData(res.data.Data);
        setPartDataList(res.data.DataList);
      }))
    }

  }, []);

  const costingData = useSelector(state => state.costing.costingData)

  /**
  * @method netRMCostPerAssembly
  * @description GET TOTAL RM COST FOR TOP HEADER 
  */
  const netRMCostPerAssembly = useCallback((item) => {
    return item && item.NetRMCost !== null ? checkForNull(item.NetRMCost) : 0
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
      let tempData = partDataList[headerIndex];

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

      let tempArr = Object.assign([...partDataList], { [headerIndex]: tempData })
      setPartDataList(tempArr)
      setPOPrice(calculateNetPOPrice(tempArr))
      setHeadCostRMCCBOPData(data)
    }, 500)

  }

  /**
   * @method setHeaderCostSurfaceTab
   * @description SET COSTS FOR TOP HEADER FROM SURFACE TAB 
   */
  const setHeaderCostSurfaceTab = (data) => {
    const headerIndex = 0;

    setTimeout(() => {
      let tempData = partDataList[headerIndex];

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
      let tempArr = Object.assign([...partDataList], { [headerIndex]: tempData })

      setPartDataList(tempArr)

      //setTimeout(() => {
      setPOPrice(calculateNetPOPrice(tempArr))
      setHeadCostSurfaceData(data)
      //}, 400)

    }, 500)

  }

  /**
   * @method setHeaderOverheadProfitCostTab
   * @description SET COSTS FOR TOP HEADER FROM OVERHEAD PROFIT TAB
   */
  const setHeaderOverheadProfitCostTab = (data) => {
    const headerIndex = 0;

    setTimeout(() => {
      let tempData = partDataList[headerIndex];

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
      let tempArr = Object.assign([...partDataList], { [headerIndex]: tempData })

      setPartDataList(tempArr)

      //setTimeout(() => {
      setPOPrice(calculateNetPOPrice(tempArr))
      setHeadCostOverheadProfitData(data)
      //}, 400)

    }, 500)

  }


  /**
   * @method setHeaderPackageFreightTab
   * @description SET COSTS FOR TOP HEADER FROM PACKAGE AND FREIGHT
   */
  const setHeaderPackageFreightTab = (data) => {

    const headerIndex = 0;

    setTimeout(() => {
      let tempData = partDataList[headerIndex];

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
      let tempArr = Object.assign([...partDataList], { [headerIndex]: tempData })

      setPartDataList(tempArr)

      setPOPrice(calculateNetPOPrice(tempArr))
      setHeadCostPackageFreightData(data)

    }, 500)

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
              <Row className="sticky-top-0">
                <Col md="12">
                  <Table className="table cr-brdr-main mb-0 border-bottom-0" size="sm">
                    <tbody>
                      <td><div className={'part-info-title'}><p><span className="cr-tbl-label">Part No.:</span><span className="dark-blue pl-1"> {costingData.PartNumber}</span></p></div></td>
                      <td><div className={'part-info-title'}><p><span className="cr-tbl-label">Part Name:</span><span className="dark-blue pl-1"> {costingData.PartName}</span></p></div></td>
                      <td><div className={'part-info-title'}><p><span className="cr-tbl-label">{costingData.VendorType}:</span><span className="dark-blue pl-1"> SOB:{costingData.ShareOfBusinessPercent}%</span></p></div></td>
                      <td><div className={'part-info-title'}><p><span className="cr-tbl-label">Costing ID:</span><span className="dark-blue pl-1"> {costingData.CostingNumber}</span></p></div></td>
                      <td><div className={'part-info-title'}><p><span className="cr-tbl-label">Costing Date Time:</span><span className="dark-blue pl-1"> {moment(costingData.CreatedDate).format('DD/MM/YYYY HH:mmA')}</span></p></div></td>
                    </tbody>
                  </Table>
                  <Table className="table cr-brdr-main" size="sm">
                    <thead>
                      <tr>
                        <th style={{ width: '100px' }}>{``}</th>
                        <th style={{ width: '100px' }}>{`Net RM Cost/Assembly`}</th>
                        <th style={{ width: '150px' }}>{`Net BOP Cost/Assembly`}</th>
                        <th style={{ width: '150px' }}>{`Net Conversion Cost/Assembly`}</th>
                        <th style={{ width: '200px' }}>{`RM + CC Cost`}</th>
                        <th style={{ width: '200px' }}>{`Surface Treatment`}</th>
                        <th style={{ width: '200px' }}>{`Overheads & Profits`}</th>
                        <th style={{ width: '200px' }}>{`Packaging & Freight`}</th>
                        <th style={{ width: '200px' }}>{`Tool Cost`}</th>
                        <th style={{ width: '200px' }}>{`Discount & Other Cost`}</th>
                        <th style={{ width: '200px' }}>{`Total Cost`}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        partDataList &&
                        partDataList.map((item, index) => {
                          return (
                            <tr key={index} className="cr-bg-tbl">
                              <td><span className="cr-prt-nm">{item.PartNumber}</span></td>
                              <td><span className="dark-blue">{netRMCostPerAssembly(item)}</span></td>
                              <td><span className="dark-blue">{netBOPCostPerAssembly(item)}</span></td>
                              <td><span className="dark-blue">{netConversionCostPerAssembly(item)}</span></td>
                              <td><span className="dark-blue">{netRMCCcost(item)}</span></td>
                              <td><span className="dark-blue">{netSurfaceTreatmentCost(item)}</span></td>
                              <td><span className="dark-blue">{netOverheadProfitCost(item)}</span></td>
                              <td><span className="dark-blue">{netPackagingFreightCost(item)}</span></td>
                              <td><span className="dark-blue">{netToolCost(item)}</span></td>
                              <td><span className="dark-blue">{netDiscountOtherCost(item)}</span></td>
                              <td><span className="dark-blue">{netTotalCost(item)}</span></td>
                            </tr>
                          )
                        }
                        )}
                    </tbody>
                  </Table>
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
                <hr />
              </Row>

              <Row>
                <Col md="12">
                  <costingInfoContext.Provider value={costData} >
                    <netHeadCostContext.Provider value={headCostRMCCBOPData} >
                      <CostingHeadTabs
                        costData={costData}
                        netPOPrice={netPOPrice}
                        setHeaderCost={setHeaderCostRMCCTab}
                        setHeaderCostSurfaceTab={setHeaderCostSurfaceTab}
                        setHeaderOverheadProfitCostTab={setHeaderOverheadProfitCostTab}
                        setHeaderPackageFreightTab={setHeaderPackageFreightTab}
                        headCostRMCCBOPData={headCostRMCCBOPData}
                        headCostSurfaceData={headCostSurfaceData}
                        headCostOverheadProfitData={headCostOverheadProfitData}
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