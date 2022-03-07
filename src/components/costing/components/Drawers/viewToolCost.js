import React, { useState, useEffect } from 'react';
import { checkForDecimalAndNull } from '../../../../../src/helper';
import { Container, Row, Col, Table } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import { useSelector } from 'react-redux';
import NoContentFound from '../../../common/NoContentFound';
import { EMPTY_DATA } from '../../../../config/constants';


function ViewToolCost(props) {

  const { viewToolCost, isPDFShow } = props
  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
  
  const tableData = () => {
    return <>
              <Table className="table cr-brdr-main mt-3 mb-0" size="sm" >
                  <thead>
                    <tr>
                      <th>{`Tool Maintenance Applicability`}</th>
                      <th>{`Maintanence Tool Cost (%)`}</th>
                      <th>{`Cost (Applicability)`}</th>
                      <th>{`Tool Maintenance Cost`}</th>
                      <th>{`Tool Cost`}</th>
                      <th>{`Amortization Quantity (Tool Life)`}</th>
                      <th>{`Tool Amortization Cost`}</th>
                      <th>{`Net Tool Cost`}</th>
                    </tr>
                  </thead>
                  <tbody >
                    {
                      viewToolCost &&
                      viewToolCost.map((item, index) => {
                        return (
                          <tr key={index}>
                            <td>{item?.ToolCostType ? item?.ToolCostType:'-'}</td>
                            <td>{checkForDecimalAndNull(item.ToolMaintenancePercentage,initialConfiguration.NoOfDecimalForPrice)}</td>
                            <td>{checkForDecimalAndNull(item.ToolApplicabilityCost,initialConfiguration.NoOfDecimalForPrice)}</td>
                            <td>{item.ToolMaintenanceCost ? checkForDecimalAndNull(item.ToolMaintenanceCost, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                            <td>{item.ToolCost ? checkForDecimalAndNull(item.ToolCost, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                            <td>{item.Life ? item.Life : "-"}</td>
                            <td>{checkForDecimalAndNull(item.ToolAmortizationCost,initialConfiguration.NoOfDecimalForPrice)}</td>
                            <td>{item.NetToolCost ? checkForDecimalAndNull(item.NetToolCost, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                          </tr>
                        )
                      })
                    }
                    {viewToolCost?.length === 0 && (
                      <tr>
                        <td colSpan={7}>
                          <NoContentFound title={EMPTY_DATA} />
                        </td>
                      </tr>
                    )}
                </tbody>
             </Table>
            </>
        }
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
     {!isPDFShow ? <Drawer anchor={props.anchor} open={props.isOpen}
      // onClose={(e) => toggleDrawer(e)}
      
      >
        <Container>
          <div className={'drawer-wrapper drawer-1500px'}>

            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'View Tool Cost:'}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}>
                </div>
              </Col>
            </Row>
            <Row className="px-3">
              <Col md="12">
            {tableData()}
              </Col>
            </Row>      
          </div>
        </Container>
      </Drawer>: ((viewToolCost && viewToolCost.length !== 0) && 
             tableData())} 
    </>
  )
}

export default React.memo(ViewToolCost)
