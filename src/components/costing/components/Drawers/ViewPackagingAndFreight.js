import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Table } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import NoContentFound from '../../../common/NoContentFound';
import { CONSTANT } from '../../../../helper/AllConastant';
import { checkForDecimalAndNull } from '../../../../helper';
import { useSelector } from 'react-redux';

function ViewPackagingAndFreight(props) {

  const { packagingData, freightData } = props.packagingAndFreightCost

  const [viewPackaging, setViewPackaging] = useState([])
  const [viewFrieght, setViewFrieght] = useState([])

  const initialConfiguration = useSelector(state => state.auth.initialConfiguration)

  useEffect(() => {
    setViewPackaging(packagingData)
    setViewFrieght(freightData)
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
                  <h3>{'View Packaging & Freight Cost:'}</h3>
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
                  <div className="left-border">{'Packaging:'}</div>
                </Col>
              </Row>
              <Row>
                {/*Packaging COST GRID */}

                <Col md="12">
                  <Table className="table cr-brdr-main" size="sm">
                    <thead>
                      <tr>
                        <th>{`Packaging Description`}</th>
                        <th>{`Packaging Type/Percentage`}</th>
                        <th className="costing-border-right">{`Cost`}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {viewPackaging &&
                        viewPackaging.map((item, index) => {
                          return (
                            <tr key={index}>
                              <td>
                                {item.PackagingDescription ? item.PackagingDescription : '-'}
                              </td>
                              <td>
                                {item.IsPackagingCostFixed && item.IsPackagingCostFixed ? item.PackagingCostPercentage : 'Fixed'}
                              </td>
                              <td>
                                {item.PackagingCost ? checkForDecimalAndNull(item.PackagingCost, initialConfiguration.NoOfDecimalForPrice) : '-'}
                              </td>
                            </tr>
                          )
                        })}
                      {viewPackaging && viewPackaging.length === 0 && (
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
                    <div className="left-border">{'Freight:'}</div>
                  </Col>
                </Row>
                <Row>
                  {/*Freight COST GRID */}

                  <Col md="12">
                    <Table className="table cr-brdr-main" size="sm">
                      <thead>
                        <tr>
                          <th>{`Freight Type`}</th>
                          <th>{`Criteria`}</th>
                          <th>{`Rate`}</th>
                          <th>{`Quantity`}</th>
                          <th className="costing-border-right">{`Cost`}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {viewFrieght &&
                          viewFrieght.map((item, index) => {
                            return (
                              <tr key={index}>
                                <td>{item.FreightType ? item.FreightType : '-'}</td>
                                <td>{item.Criteria ? item.Criteria : '-'}</td>
                                <td>{item.Rate ? checkForDecimalAndNull(item.Rate, initialConfiguration.NoOfDecimalForPrice) : '-'}</td>
                                <td>{item.Quantity ? item.Quantity : '-'}</td>
                                <td>
                                  {item.FreightCost ? checkForDecimalAndNull(item.FreightCost, initialConfiguration.NoOfDecimalForPrice) : '-'}
                                </td>
                              </tr>
                            )
                          })}
                        {viewFrieght.length === 0 && (
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
            </div>
          </div>
        </Container>
      </Drawer>
    </>
  )
}

export default React.memo(ViewPackagingAndFreight)
