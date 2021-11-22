import React, { useState, useEffect, Fragment } from 'react'
import { checkForDecimalAndNull } from '../../../../../src/helper'
import { Container, Row, Col, Table } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import NoContentFound from '../../../common/NoContentFound'
import { EMPTY_DATA } from '../../../../config/constants'
import { useSelector } from 'react-redux'

function ViewBOP(props) {
  const { viewBOPData } = props
  const { BOPData, bopPHandlingCharges, bopHandlingPercentage } = viewBOPData
  const [viewBOPCost, setviewBOPCost] = useState([])
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  useEffect(() => {
    setviewBOPCost(BOPData)
  }, [])

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
  return (
    <Fragment>
      <Drawer
        anchor={props.anchor}
        open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={'drawer-wrapper drawer-1500px'}>
            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'View Insert Cost:'}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}
                ></div>
              </Col>
            </Row>

            <Row className="mx-0">
              <Col md="12">
                <Row>
                  <Col md="12">
                    <div className="left-border">{'View Insert:'}</div>
                  </Col>
                </Row>
                <Table className="table cr-brdr-main" size="sm">
                  <thead>
                    <tr>
                      <th>{`Part No.`}</th>
                      <th>{`Insert Part No.`}</th>
                      <th>{`Insert Part Name`}</th>
                      <th>{`Currency`}</th>
                      <th>{`Landed Cost (INR)`}</th>
                      <th>{`Quantity`}</th>
                      <th className="costing-border-right">{`Net Insert Cost`}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewBOPCost &&
                      viewBOPCost.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{item.PartNumber !== null || item.PartNumber !== "" ? item.PartNumber : ""}</td>
                            <td>{item.BOPPartNumber}</td>
                            <td>{item.BOPPartName}</td>
                            <td>{item.Currency}</td>
                            <td>
                              {checkForDecimalAndNull(item.LandedCostINR, initialConfiguration.NoOfDecimalForPrice)}
                            </td>
                            <td> {item.Quantity}</td>
                            <td>
                              {checkForDecimalAndNull(item.NetBoughtOutPartCost, initialConfiguration.NoOfDecimalForPrice)}
                            </td>
                          </tr>
                        )
                      })}
                    {viewBOPCost.length === 0 && (
                      <tr>
                        <td colSpan={7}>
                          <NoContentFound title={EMPTY_DATA} />
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </Col>
            </Row>

            <Row className="mx-0">
              <Col md="12">
                <hr />
                <Row>
                  <Col md="12">
                    <div className="left-border">{'Insert Handling Charge:'}</div>
                  </Col>
                </Row>
                <Table className="table cr-brdr-main" size="sm">
                  <thead>
                    <tr>
                      <th>{`Percentage`}</th>
                      <th className="costing-border-right">{`Handling Charges`}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      bopHandlingPercentage ?
                        <tr>
                          <td>{bopHandlingPercentage ? bopHandlingPercentage : 0}</td>
                          <td>{checkForDecimalAndNull(bopPHandlingCharges, initialConfiguration.NoOfDecimalForPrice)}</td>
                        </tr> :

                        <tr>
                          <td colSpan={7}>
                            <NoContentFound title={EMPTY_DATA} />
                          </td>
                        </tr>
                    }

                  </tbody>
                </Table>
              </Col>
            </Row>
          </div>
        </Container>
      </Drawer>
    </Fragment>
  )
}

export default React.memo(ViewBOP)
