import React, { useState, useEffect } from 'react';
import { checkForDecimalAndNull } from '../../../../../src/helper';
import { Container, Row, Col,Table } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'


 function ViewBOP(props) {
     const { viewBOPData } =props
     console.log(viewBOPData,"BOP data");
    const [gridData, setGridData] = useState([])
    useEffect(() => {
      setGridData(viewBOPData)
        
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
      <>
      <Drawer anchor={props.anchor} open={props.isOpen} onClose={(e) => toggleDrawer(e)}>
        <Container>
          <div className={'drawer-wrapper drawer-1500px'}>

            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'ADD BOP'}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}>
                </div>
              </Col>
            </Row>

            <Row>
              <Col md="12">
                <Table className="table cr-brdr-main" size="sm" >
                  <thead>
                    <tr>
                      <th>{`BOP Part No.`}</th>
                      <th>{`BOP Part Name`}</th>
                      <th>{`Currency`}</th>
                      <th>{`Landed Cost(INR)`}</th>
                      <th>{`Quantity`}</th>
                      <th>{`Net BOP Cost`}</th>
                    </tr>
                  </thead>
                  <tbody >
                    {
                      gridData &&
                      gridData.map((item, index) => {
                        return (
                            <tr key={index}>
                              <td>{item.BOPPartNumber}</td>
                              <td>{item.BOPPartName}</td>
                              <td>{item.Currency}</td>
                              <td>{checkForDecimalAndNull(item.LandedCostINR, 2)}</td>
                              <td> {item.Quantity}</td>
                              <td>{item.NetBoughtOutPartCost !== undefined ? checkForDecimalAndNull(item.NetBoughtOutPartCost, 2) : 0}</td>
                            </tr>
                        )
                      })
                    }
                    {/* {gridData.length === 0 &&
                      <tr>
                        <td colSpan={7}>
                          <NoContentFound title={CONSTANT.EMPTY_DATA} />
                        </td>
                      </tr>
                    } */}
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

export default React.memo(ViewBOP)
