import React, { useState, useEffect } from 'react'
import { checkForDecimalAndNull } from '../../../../../src/helper'
import { Container, Row, Col, Table } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import NoContentFound from '../../../common/NoContentFound'
import { CONSTANT } from '../../../../helper/AllConastant'

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
  const {
    CostingOperationCostResponse,
    CostingProcessCostResponse,
    CostingToolsCostResponse,
    IsShowToolCost,
  } = viewConversionCostData
  
  const [costingProcessCost, setCostingProcessCost] = useState([])
  const [costingOperationCost, setCostingOperationCostResponse] = useState([])
  const [isShowToolCost, setIsShowToolCost] = useState(false)
  const [costingToolsCost, setcostingToolsCost] = useState(false)
  useEffect(() => {
    if (IsShowToolCost) {
      setIsShowToolCost(IsShowToolCost)
    }
    setCostingProcessCost(CostingProcessCostResponse)
    setCostingOperationCostResponse(CostingOperationCostResponse)
    setcostingToolsCost(CostingToolsCostResponse)
  }, [])
  return (
    <>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
        onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={'drawer-wrapper drawer-1500px'}>
            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'Conversion Cost'}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}
                ></div>
              </Col>
            </Row>

            <div
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
                        <th>{`Net Cost`}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costingProcessCost &&
                        costingProcessCost.map((item, index) => {
                          return (
                            <tr key={index}>
                              <td>
                                {item.ProcessName ? item.ProcessName : '-'}
                              </td>
                              <td>
                                {item.ProcessDescription
                                  ? item.ProcessDescription
                                  : '-'}
                              </td>
                              <td>
                                {item.MachineName ? item.MachineName : '-'}
                              </td>
                              <td>{item.Tonnage ? item.Tonnage : '-'}</td>
                              <td>{item.UOM ? item.UOM : '-'}</td>
                              <td>{item.MHR ? item.MHR : '-'}</td>
                              <td>{item.CycleTime ? item.CycleTime : '-'}</td>
                              <td>{item.Efficiency ? item.Efficiency : '-'}</td>
                              <td>{item.Cavity ? item.Cavity : '-'}</td>
                              <td>{item.Quantity ? item.Quantity : '-'}</td>
                              <td>
                                {item.ProcessCost
                                  ? checkForDecimalAndNull(item.ProcessCost, 2)
                                  : 0}
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
                          <th>{`Labour Rate`}</th>
                          <th>{`Labour Quantity`}</th>
                          <th>{`Net Cost`}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {costingOperationCost &&
                          costingOperationCost.map((item, index) => {
                            return (
                              <tr key={index}>
                                <td>
                                  {item.OperationName
                                    ? item.OperationName
                                    : '-'}
                                </td>
                                <td>
                                  {item.OperationCode
                                    ? item.OperationCode
                                    : '-'}
                                </td>
                                <td>{item.UOM ? item.UOM : '-'}</td>
                                <td>{item.Rate ? item.Rate : '-'}</td>
                                <td>{item.Quantity ? item.Quantity : '-'}</td>
                                <td>
                                  {item.IsLabourRateExist
                                    ? checkForDecimalAndNull(item.LabourRate, 2)
                                    : '-'}
                                </td>
                                <td>
                                  {item.LabourQuantity
                                    ? item.LabourQuantity
                                    : '-'}
                                </td>
                                {/* <td>{netCost(item.OperationCost)}</td> */}
                                <td>
                                  {item.OperationCost
                                    ? item.OperationCost
                                    : '-'}
                                </td>
                              </tr>
                            )
                          })}
                        {costingOperationCost.length === 0 && (
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
                                  <td>{item.ProcessOrOperation ? item.ProcessOrOperation: '-' }</td>
                                  <td>{item.ToolCategory ? item.ToolCategory: '-' }</td>
                                  <td>{item.ToolName ? item.ToolName: '-' }</td>
                                  <td>{item.Quantity ? item.Quantity: '-' }</td>
                                  <td>{item.ToolCost ? item.ToolCost: '-' }</td>
                                  <td>{item.Life ? item.Life: '-' }</td>
                                  <td>
                                    {item.NetToolCost
                                      ? checkForDecimalAndNull(
                                          item.NetToolCost,
                                          2,
                                        )
                                      : 0}
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
            </div>
          </div>
        </Container>
      </Drawer>
    </>
  )
}

export default React.memo(ViewConversionCost)
