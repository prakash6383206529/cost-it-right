import React, { useState, useEffect, useCallback, } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Table } from 'reactstrap';
import { getZBCCostingByCostingId } from '../actions/Costing';
import { checkForNull } from '../../../helper';
import { VBC, ZBC } from '../../../config/constants';
import moment from 'moment';
import CostingHeadTabs from './CostingHeaderTabs/index'


export const costingInfoContext = React.createContext()

function CostingDetailStepTwo(props) {

  const [costData, setCostData] = useState({});
  const [netPOPrice, setPOPrice] = useState(0);
  const [partDataList, setPartDataList] = useState([]);
  const [headCostRMCCBOPData, setHeadCostRMCCBOPData] = useState({});
  const [headCostSurfaceData, setHeadCostSurfaceData] = useState({});

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
    console.log('called')
    const netRM = item && item.NetRMCost !== null ? checkForNull(item.NetRMCost) : 0
    const netBOP = item && item.NetBOPCost !== null ? checkForNull(item.NetBOPCost) : 0
    const netCC = item && item.NetConversionCost !== null ? checkForNull(item.NetConversionCost) : 0
    return netRM + netBOP + netCC;
  }, [])

  /**
   * @method netSurfaceTreatmentCost
   * @description GET NET SURFACE TREATMENT COST FOR TOP HEADER 
   */
  const netSurfaceTreatmentCost = useCallback((item) => {
    return item && item.NetSurfaceTreatmentCost !== null ? checkForNull(item.NetSurfaceTreatmentCost) : 0
  }, [])

  /**
   * @method netOverheadProfitCost
   * @description GET NET OVERHEAD & PROFIT COST FOR TOP HEADER 
   */
  const netOverheadProfitCost = useCallback((item) => {
    return item && item.NetOverheadAndProfitCost !== null ? checkForNull(item.NetOverheadAndProfitCost) : 0
  }, [])

  /**
   * @method netPackagingFreightCost
   * @description GET NET PACKAGING & FREIGHT COST FOR TOP HEADER 
   */
  const netPackagingFreightCost = useCallback((item) => {
    return item && item.NetPackagingAndFreight !== null ? checkForNull(item.NetPackagingAndFreight) : 0
  }, [])

  /**
   * @method netToolCost
   * @description GET NET TOOL COST FOR TOP HEADER 
   */
  const netToolCost = useCallback((item) => {
    return item && item.ToolCost !== null ? checkForNull(item.ToolCost) : 0
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
    const netOverheadProfitCost = item && item.NetOverheadAndProfictCost !== null ? checkForNull(item.NetOverheadAndProfictCost) : 0
    const netPackagingFreightCost = item && item.NetPackagingAndFreight !== null ? checkForNull(item.NetPackagingAndFreight) : 0
    const ToolCost = item && item.ToolCost !== null ? checkForNull(item.ToolCost) : 0
    const discountOtherCost = item && item.DiscountsAndOtherCost !== null ? checkForNull(item.DiscountsAndOtherCost) : 0

    return RMCCCost + netSurfaceTreatmentCost + netPackagingFreightCost + netOverheadProfitCost + ToolCost - discountOtherCost;

  }, [])

  /**
   * @method setHeaderCostRMCCTab
   * @description SET COSTS FOR TOP HEADER FROM RM+CC TAB 
   */
  const setHeaderCostRMCCTab = (data) => {
    console.log('data RMCC: ', data);
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
      console.log('OverAllCost: ', OverAllCost);

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
    }, 200)

  }

  /**
   * @method setHeaderCostSurfaceTab
   * @description SET COSTS FOR TOP HEADER FROM SURFACE TAB 
   */
  const setHeaderCostSurfaceTab = (data) => {
    console.log('data Surface: ', data);
    const headerIndex = 0;

    setTimeout(() => {
      let tempData = partDataList[headerIndex];
      console.log('tempData: ', tempData);

      let OverAllCost = 0;
      if (tempData && tempData !== undefined) {
        OverAllCost =
          tempData.NetTotalRMBOPCC +
          data.NetSurfaceTreatmentCost +
          tempData.NetOverheadAndProfitCost +
          tempData.NetPackagingAndFreight +
          checkForNull(tempData.ToolCost) - checkForNull(tempData.DiscountsAndOtherCost)
      }
      console.log('OverAllCost: ', OverAllCost);

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

    }, 200)

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

              <Row>
                <Col md="2"><div className={'part-info-title'}><p>Part No.</p>{costingData.PartNumber}</div></Col>
                <Col md="2"><div className={'part-info-title'}><p>Part Name</p>{costingData.PartName}</div></Col>
                <Col md="2"><div className={'part-info-title'}><p>{costingData.VendorType}</p>SOB:{costingData.ShareOfBusinessPercent}%</div></Col>
                <Col md="2"><div className={'part-info-title'}><p>Costing ID</p>{costingData.CostingNumber}</div></Col>
                <Col md="4"><div className={'part-info-title'}><p>Costing Date Time</p>{moment(costingData.CreatedDate).format('DD/MM/YYYY HH:mmA')}</div></Col>
              </Row>

              <Row>
                <Table className="table" size="sm" >
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
                  <tbody >
                    {
                      partDataList &&
                      partDataList.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{item.PartNumber}</td>
                            <td>{netRMCostPerAssembly(item)}</td>
                            <td>{netBOPCostPerAssembly(item)}</td>
                            <td>{netConversionCostPerAssembly(item)}</td>
                            <td>{netRMCCcost(item)}</td>
                            <td>{netSurfaceTreatmentCost(item)}</td>
                            <td>{netOverheadProfitCost(item)}</td>
                            <td>{netPackagingFreightCost(item)}</td>
                            <td>{netToolCost(item)}</td>
                            <td>{netDiscountOtherCost(item)}</td>
                            <td>{netTotalCost(item)}</td>
                          </tr>
                        )
                      }
                      )}
                  </tbody>
                </Table>
              </Row>

              <Row>
                <Col md="3">
                  <button
                    type="button"
                    className="submit-button mr5 save-btn"
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
                    <CostingHeadTabs
                      costData={costData}
                      netPOPrice={netPOPrice}
                      setHeaderCost={setHeaderCostRMCCTab}
                      setHeaderCostSurfaceTab={setHeaderCostSurfaceTab}
                      headCostRMCCBOPData={headCostRMCCBOPData}
                      headCostSurfaceData={headCostSurfaceData}
                    />
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