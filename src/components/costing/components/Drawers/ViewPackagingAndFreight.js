import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Table } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import NoContentFound from '../../../common/NoContentFound';
import { EMPTY_DATA } from '../../../../config/constants';
import { checkForDecimalAndNull } from '../../../../helper';
import { useSelector } from 'react-redux';
import PackagingCalculator from '../WeightCalculatorDrawer/PackagingCalculator';

function ViewPackagingAndFreight(props) {

  const { packagingData, freightData } = props.packagingAndFreightCost;
  const { isPDFShow, isLogisticsTechnology } = props
  const [packagingCalculatorDrawer, setPackagingCalculatorDrawer] = useState(false)
  const [viewCostingData, setViewCostingData] = useState([])
  // console.log(viewCostingData, "viewCostingData")
  const [rowObjData, setRowObjData] = useState({
    PackagingDetailId:null,
    CostingPackagingCalculationDetailsId:null,
    SimulationTempData:null
  })
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  const { viewCostingDetailData} = useSelector((state) => state.costing)
  console.log(viewCostingDetailData, "viewCostingDetailData")
  useEffect(() => {
    if (viewCostingDetailData && viewCostingDetailData?.length > 0) {
      setViewCostingData(viewCostingDetailData)
    } 
  }, [viewCostingDetailData])
  /**
    * @method toggleDrawer
    * @description closing drawer
    */

  const toggleDrawer = (event) => {
    if (
      event.type === 'keydown' &&
      (event.key === 'Tab' || event.key === 'Shift')
    ) {
      return
    }
    props.closeDrawer('')
  }

  const getPackagingCalculator = (index) => {
    setRowObjData({
      PackagingDetailId:packagingData[index]?.PackagingDetailId,
      CostingPackagingCalculationDetailsId:packagingData[index]?.CostingPackagingCalculationDetailsId,
      SimulationTempData:viewCostingDetailData
    })
    setPackagingCalculatorDrawer(true)
  }

  const closePackagingCalculatorDrawer = () => {
    setPackagingCalculatorDrawer(false)
  }

  const packageTableData = () => {
    return <>
      <Row>
        <Col md="12">
          <div className="left-border">{`${isLogisticsTechnology ? 'Freight' : 'Packaging'}:`}</div>
        </Col>
      </Row>
      <Row>
        {/*Packaging COST GRID */}

        <Col md="12">
          <Table className="table cr-brdr-main" size="sm">
            <tbody>
              <tr className='thead'>
                <th>{`${isLogisticsTechnology ? 'Charges' : 'Packaging Description'}`}</th>
                <th>{`Criteria/Applicability`}</th>
                <th>{`${isLogisticsTechnology ? 'Freight' : 'Packaging'} Type/Percentage`}</th>
                <th>{`Rate`}</th>
                <th>{`Quantity`}</th>
                <th className={initialConfiguration.IsShowCRMHead ? "" : 'costing-border-right'}>{`Cost`}</th>
                {initialConfiguration.IsShowCRMHead && <th className="costing-border-right">{`CRM Head`}</th>}
              </tr>
              {packagingData &&
                packagingData.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>
                        {item.PackagingDescription ? item.PackagingDescription : '-'}
                      </td>
                      {!isLogisticsTechnology && <td>{item.Applicability ? item.Applicability : '-'}</td>}
                      {!isLogisticsTechnology && <td>
                        {item.IsPackagingCostFixed ? (item.PackagingCostPercentage ? item.PackagingCostPercentage : '-') : 'Fixed'}
                      </td>}
                      <td>{item.Rate ? checkForDecimalAndNull(item.Rate, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                      <td>{item.Quantity ? checkForDecimalAndNull(item.Quantity, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                      <td>{item.PackagingCost ? checkForDecimalAndNull(item.PackagingCost, initialConfiguration.NoOfDecimalForPrice) : '-'}
                      {item?.CostingPackagingCalculationDetailsId !== 0 && item?.CostingPackagingCalculationDetailsId !== null && <button
                        className="CalculatorIcon cr-cl-icon mr-auto ml-0"
                        type={"button"}
                        onClick={() => { getPackagingCalculator(index) }}
                      />}
                      </td>

                      {initialConfiguration.IsShowCRMHead && <td>{item.PackagingCRMHead ? item.PackagingCRMHead : '-'}</td>}
                    </tr>
                  )
                })}
              {packagingData && packagingData.length === 0 && (
                <tr>
                  <td colSpan={12}>
                    <NoContentFound title={EMPTY_DATA} />
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </>
  }
  const freightTableData = () => {
    return <>
      <Row>
        <Col md="8">
          <div className="left-border">{'Freight:'}</div>
        </Col>
      </Row>
      <Row>
        {/*Freight COST GRID */}

        <Col md="12">
          <Table className="table cr-brdr-main" size="sm">
            <tbody>
              <tr className='thead'>
                <th>{`Freight Type`}</th>
                <th>{`Criteria/Applicability`}</th>
                <th>{`Capacity`}</th>
                <th>{`Rate/Percentage`}</th>
                <th>{`Quantity`}</th>
                <th className={initialConfiguration.IsShowCRMHead ? "" : 'costing-border-right'}>{`Cost`}</th>
                {initialConfiguration.IsShowCRMHead && <th className="costing-border-right">{`CRM Head`}</th>}
              </tr>
              {freightData &&
                freightData.map((item, index) => {
                  return (
                    <tr key={index}>
                      <td>{item.FreightType ? item.FreightType : '-'}</td>
                      <td>{item.Criteria ? item.Criteria : '-'}</td>
                      <td>{item.Capacity ? item.Capacity : '-'}</td>
                      <td>{item.Rate ? checkForDecimalAndNull(item.Rate, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                      <td>{item.Quantity ? item.Quantity : '-'}</td>
                      <td>
                        {item.FreightCost ? checkForDecimalAndNull(item.FreightCost, initialConfiguration.NoOfDecimalForPrice) : '-'}
                      </td>
                      {initialConfiguration.IsShowCRMHead && <td>{item.FreightCRMHead ? item.FreightCRMHead : '-'}</td>}
                    </tr>
                  )
                })}
              {freightData?.length === 0 && (
                <tr>
                  <td colSpan={9}>
                    <NoContentFound title={EMPTY_DATA} />
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </Col>
      </Row>
    </>
  }

  return (
    <>
      {!isPDFShow ? <Drawer
        anchor={props.anchor}
        open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={'drawer-wrapper drawer-1500px'}>
            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{`${isLogisticsTechnology ? 'View Freight Cost:' : 'View Packaging & Freight Cost:'}`}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}
                ></div>
              </Col>
            </Row>

            <div className="px-3">
              {packageTableData()}
              <div>
                {!isLogisticsTechnology && freightTableData()}
              </div>
            </div>
            {packagingCalculatorDrawer && (
              <PackagingCalculator
                anchor={`right`}
                isOpen={packagingCalculatorDrawer}
                closeCalculator={closePackagingCalculatorDrawer}
                rowObjData={rowObjData}
                CostingViewMode={true}
                simulationMode={props?.simulationMode}
                viewPackaingData={packagingData}
                index={props?.index}
              />
            )}
          </div>
        </Container>
      </Drawer> : <>
        <div>{freightData?.length !== 0 && freightTableData()}</div>
        <div>{packagingData?.length !== 0 && packageTableData()}</div>
      </>}
    </>
  )
}

export default React.memo(ViewPackagingAndFreight)
