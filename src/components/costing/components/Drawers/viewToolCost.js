import React, { useState, useEffect } from 'react';
import { checkForDecimalAndNull } from '../../../../../src/helper';
import { Container, Row, Col, Table } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'


function ViewToolCost(props) {

  const { viewToolCost } = props

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
    <>
      <Drawer anchor={props.anchor} open={props.isOpen} 
      // onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={'drawer-wrapper drawer-1500px'}>

            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'View Tool Cost'}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}>
                </div>
              </Col>
            </Row>

            <Row className="px-3">
              <Col md="12">
                <Table className="table cr-brdr-main" size="sm" >
                  <thead>
                    <tr>
                      <th>{`Tool Maintenance Cost`}</th>
                      <th>{`Tool Cost`}</th>
                      <th>{`Amortization Quantity(Tool Life)`}</th>
                      <th>{`Net Tool Cost`}</th>
                    </tr>
                  </thead>
                  <tbody >
                    {
                      viewToolCost &&
                      viewToolCost.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{item.ToolMaintenanceCost ? checkForDecimalAndNull(item.ToolMaintenanceCost, 2) : '-'}</td>
                            <td>{item.ToolCost ? checkForDecimalAndNull(item.ToolCost, 2) : '-'}</td>
                            <td>{item.Life ? item.Life : "-"}</td>
                            <td>{item.NetToolCost ? checkForDecimalAndNull(item.NetToolCost, 2) : '-'}</td>
                          </tr>
                        )
                      })
                    }
                  </tbody>
                </Table>
              </Col>
            </Row>
          </div>
        </Container>
      </Drawer>
    </>
  )
}

export default React.memo(ViewToolCost)
