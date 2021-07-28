import React, { useState, useEffect } from 'react'
import { checkForDecimalAndNull } from '../../../../../src/helper'
import { Container, Row, Col, Table } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import NoContentFound from '../../../common/NoContentFound'
import { CONSTANT } from '../../../../helper/AllConastant'
import { useSelector } from 'react-redux'

function ViewConversionCost(props) {

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
  const { viewConversionCostData } = props
  const { conversionData, netTransportationCostView, surfaceTreatmentDetails } = viewConversionCostData
  const { CostingOperationCostResponse, CostingProcessCostResponse, CostingToolsCostResponse, IsShowToolCost, CostingOtherOperationCostResponse } = conversionData
  const [costingProcessCost, setCostingProcessCost] = useState([])
  const [costingOperationCost, setCostingOperationCostResponse] = useState([])
  const [othercostingOperationCost, setOtherCostingOperationCostResponse] = useState([])
  const [isShowToolCost, setIsShowToolCost] = useState(false)
  const [costingToolsCost, setcostingToolsCost] = useState(false)
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  useEffect(() => {
    if (IsShowToolCost) {
      setIsShowToolCost(IsShowToolCost)
    }
    setCostingProcessCost(CostingProcessCostResponse)
    setCostingOperationCostResponse(CostingOperationCostResponse ? CostingOperationCostResponse : [])
    setcostingToolsCost(CostingToolsCostResponse)
    setOtherCostingOperationCostResponse(CostingOtherOperationCostResponse ? CostingOtherOperationCostResponse : [])
  }, [])
  return (
    <>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
        <Container className="view-conversion-cost-drawer">
          <div className={'drawer-wrapper drawer-1500px'}>
            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'View Conversion Cost:'}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}
                ></div>
              </Col>
            </Row>

            <div className="px-3"
            // className="cr-process-costwrap"
            >
              <Row>
                <Col md="12">
                  <div className="left-border">{'Process Cost:'}</div>
                </Col>
              </Row>
              <Row>
                {/*PROCESS COST GRID */}
                <Col md="12">
                  <Table className="table cr-brdr-main" size="sm">
                    <thead>
                      <tr>
                        <th>{`Process Name`}</th>
                        <th>{`Process Description`}</th>
                        <th>{`Machine Name`}</th>
                        <th>{`Tonnage`}</th>
                        <th>{`UOM`}</th>
                        <th>{`MHR`}</th>
                        <th>{`Cycle Time`}</th>
                        <th>{`Efficiency`}</th>
                        <th>{`Cavity`}</th>
                        <th>{`Quantity`}</th>
                        <th className="costing-border-right">{`Net Cost`}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costingProcessCost &&
                        costingProcessCost.map((item, index) => {
                          return (
                            <tr key={index}>
                              <td>{item.ProcessName ? item.ProcessName : '-'}</td>
                              <td>{item.ProcessDescription ? item.ProcessDescription : '-'}</td>
                              <td>{item.MachineName ? item.MachineName : '-'}</td>
                              <td>{item.Tonnage ? item.Tonnage : '-'}</td>
                              <td>{item.UOM ? item.UOM : '-'}</td>
                              <td>{item.MHR ? item.MHR : '-'}</td>
                              <td>{item.CycleTime ? item.CycleTime : '-'}</td>
                              <td>{item.Efficiency ? checkForDecimalAndNull(item.Efficiency, initialConfiguration.NoOfDecimalForInputOutput) : '-'}</td>
                              <td>{item.Cavity ? item.Cavity : '-'}</td>
                              <td>{item.Quantity ? checkForDecimalAndNull(item.Quantity, initialConfiguration.NoOfDecimalForInputOutput) : '-'}</td>
                              <td>{item.ProcessCost ? checkForDecimalAndNull(item.ProcessCost, initialConfiguration.NoOfDecimalForPrice) : 0}
                              </td>
                            </tr>
                          )
                        })}
                      {costingProcessCost && costingProcessCost.length === 0 && (
                        <tr>
                          <td colSpan={12}>
                            <NoContentFound title={CONSTANT.EMPTY_DATA} />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Col>
              </Row>

              <hr />
              <div>
                <Row>
                  <Col md="8">
                    <div className="left-border">{'Operation Cost:'}</div>
                  </Col>
                </Row>
                <Row>
                  {/*OPERATION COST GRID */}

                  <Col md="12">
                    <Table className="table cr-brdr-main" size="sm">
                      <thead>
                        <tr>
                          <th>{`Operation Name`}</th>
                          <th>{`Operation Code`}</th>
                          <th>{`UOM`}</th>
                          <th>{`Rate`}</th>
                          <th>{`Quantity`}</th>
                          {/* make it configurable after deployment */}
                          {/* <th>{`Labour Rate`}</th>
                          <th>{`Labour Quantity`}</th> */}
                          <th className="costing-border-right">{`Net Cost`}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {costingOperationCost &&
                          costingOperationCost.map((item, index) => {
                            return (
                              <tr key={index}>
                                <td>
                                  {item.OperationName ? item.OperationName : '-'}
                                </td>
                                <td>
                                  {item.OperationCode ? item.OperationCode : '-'}
                                </td>
                                <td>{item.UOM ? item.UOM : '-'}</td>
                                <td>{item.Rate ? item.Rate : '-'}</td>
                                <td>{item.Quantity ? item.Quantity : '-'}</td>
                                {/* <td>
                                  {item.IsLabourRateExist
                                    ? checkForDecimalAndNull(item.LabourRate, initialConfiguration.NoOfDecimalForPrice)
                                    : '-'}
                                </td>
                                <td>
                                  {item.LabourQuantity
                                    ? item.LabourQuantity
                                    : '-'}
                                </td> */}
                                {/* <td>{netCost(item.OperationCost)}</td> */}
                                <td>
                                  {item.OperationCost ? checkForDecimalAndNull(item.OperationCost, initialConfiguration.NoOfDecimalForPrice) : 0}
                                </td>
                              </tr>
                            )
                          })}
                        {costingOperationCost && costingOperationCost.length === 0 && (
                          <tr>
                            <td colSpan={9}>
                              <NoContentFound title={CONSTANT.EMPTY_DATA} />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              </div>

              <hr />
              <div>
                <Row>
                  <Col md="8">
                    <div className="left-border">{'Other Operation Cost:'}</div>
                  </Col>
                </Row>
                <Row>
                  {/*OPERATION COST GRID */}

                  <Col md="12">
                    <Table className="table cr-brdr-main" size="sm">
                      <thead>
                        <tr>
                          <th>{`Operation Name`}</th>
                          <th>{`Operation Code`}</th>
                          <th>{`UOM`}</th>
                          <th>{`Rate`}</th>
                          <th>{`Quantity`}</th>
                          {/* make it configurable after deployment */}
                          {/* <th>{`Labour Rate`}</th>
                          <th>{`Labour Quantity`}</th> */}
                          <th className="costing-border-right">{`Net Cost`}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {othercostingOperationCost &&
                          othercostingOperationCost.map((item, index) => {
                            return (
                              <tr key={index}>
                                <td>
                                  {item.OtherOperationName ? item.OtherOperationName : '-'}
                                </td>
                                <td>
                                  {item.OtherOperationCode ? item.OtherOperationCode : '-'}
                                </td>
                                <td>{item.UOM ? item.UOM : '-'}</td>
                                <td>{item.Rate ? item.Rate : '-'}</td>
                                <td>{item.Quantity ? item.Quantity : '-'}</td>
                                {/* <td>
                                  {item.IsLabourRateExist
                                    ? checkForDecimalAndNull(item.LabourRate, initialConfiguration.NoOfDecimalForPrice)
                                    : '-'}
                                </td>
                                <td>
                                  {item.LabourQuantity
                                    ? item.LabourQuantity
                                    : '-'}
                                </td> */}
                                {/* <td>{netCost(item.OperationCost)}</td> */}
                                <td>
                                  {item.OperationCost ? checkForDecimalAndNull(item.OperationCost, initialConfiguration.NoOfDecimalForPrice) : 0}
                                </td>
                              </tr>
                            )
                          })}
                        {othercostingOperationCost && othercostingOperationCost.length === 0 && (
                          <tr>
                            <td colSpan={9}>
                              <NoContentFound title={CONSTANT.EMPTY_DATA} />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Col>
                </Row>
              </div>

              <hr />
              {isShowToolCost && (
                <div>
                  <Row>
                    <Col md="10">
                      <div className="left-border">{'Tool Cost:'}</div>
                    </Col>
                  </Row>
                  <Row>
                    {/*TOOL COST GRID */}
                    <Col md="12">
                      <Table className="table cr-brdr-main" size="sm">
                        <thead>
                          <tr>
                            <th>{`Process/Operation`}</th>
                            <th>{`Tool Category`}</th>
                            <th>{`Name`}</th>
                            <th>{`Quantity`}</th>
                            <th>{`Tool Cost`}</th>
                            <th>{`Life`}</th>
                            <th>{`Net Tool Cost`}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {costingToolsCost &&
                            costingToolsCost.map((item, index) => {
                              return (
                                <tr key={index}>
                                  <td>{item.ProcessOrOperation ? item.ProcessOrOperation : '-'}</td>
                                  <td>{item.ToolCategory ? item.ToolCategory : '-'}</td>
                                  <td>{item.ToolName ? item.ToolName : '-'}</td>
                                  <td>{item.Quantity ? item.Quantity : '-'}</td>
                                  <td>{item.ToolCost ? checkForDecimalAndNull(item.ToolCost, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                                  <td>{item.Life ? item.Life : '-'}</td>
                                  <td>
                                    {item.NetToolCost ? checkForDecimalAndNull(item.NetToolCost, initialConfiguration.NoOfDecimalForPrice) : 0}
                                  </td>
                                </tr>
                              )
                            })}
                          {costingToolsCost.length === 0 && (
                            <tr>
                              <td colSpan={8}>
                                <NoContentFound title={CONSTANT.EMPTY_DATA} />
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
                    </Col>
                  </Row>
                </div>
              )}
              <Row>
                <Col md="12">
                  <div className="left-border">{'Surface Treatment Cost:'}</div>
                </Col>
              </Row>
              <Row>
                {/*PROCESS COST GRID */}
                <Col md="12">
                  <Table className="table cr-brdr-main" size="sm">
                    <thead>
                      <tr>
                        <th>{`Operation Name`}</th>
                        <th>{`Surface Area`}</th>
                        <th>{`UOM`}</th>
                        <th>{`Rate/UOM`}</th>
                        <th className="costing-border-right">{`Cost`}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {surfaceTreatmentDetails &&
                        surfaceTreatmentDetails.map((item, index) => {
                          return (
                            <tr key={index}>
                              <td>{item.OperationName ? item.OperationName : '-'}</td>
                              <td>{item.SurfaceArea ? item.SurfaceArea : '-'}</td>
                              <td>{item.UOM ? item.UOM : '-'}</td>
                              <td>{item.RatePerUOM ? checkForDecimalAndNull(item.RatePerUOM, initialConfiguration.NoOfDecimalForPrice) : 0}</td>
                              <td>{item.SurfaceTreatmentCost ? checkForDecimalAndNull(item.SurfaceTreatmentCost, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>

                            </tr>
                          )
                        })}
                      {surfaceTreatmentDetails && surfaceTreatmentDetails.length === 0 && (
                        <tr>
                          <td colSpan={12}>
                            <NoContentFound title={CONSTANT.EMPTY_DATA} />
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </Col>
              </Row>
              <hr />
              <Row>
                <Col md="12">
                  <div className="left-border">{'Transportation Cost:'}</div>
                </Col>
              </Row>
              <Row>
                {/*TRANSPORTATION COST GRID */}
                <Col md="12">
                  <Table className="table cr-brdr-main" size="sm">
                    <thead>
                      <tr>
                        <th>{`UOM`}</th>
                        <th>{`Rate`}</th>
                        <th>{`Quantity`}</th>
                        <th className="costing-border-right">{`Cost`}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {netTransportationCostView && netTransportationCostView.UOM === null ?
                        <tr>
                          <td colSpan={12}>
                            <NoContentFound title={CONSTANT.EMPTY_DATA} />
                          </td>
                        </tr> :
                        <tr>
                          <td>{netTransportationCostView && netTransportationCostView.UOM ? netTransportationCostView.UOM : '-'}</td>
                          <td>{netTransportationCostView && netTransportationCostView.Rate ? checkForDecimalAndNull(netTransportationCostView.Rate, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                          <td>{netTransportationCostView && netTransportationCostView.Quantity ? checkForDecimalAndNull(netTransportationCostView.Quantity, initialConfiguration.NoOfDecimalForInputOutput) : '-'}</td>
                          <td>{netTransportationCostView && netTransportationCostView.TransportationCost ? checkForDecimalAndNull(netTransportationCostView.TransportationCost, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                        </tr>
                      }

                    </tbody>
                  </Table>
                </Col>
              </Row>
            </div>
          </div>
        </Container>
      </Drawer>
    </>
  )
}

export default React.memo(ViewConversionCost)
