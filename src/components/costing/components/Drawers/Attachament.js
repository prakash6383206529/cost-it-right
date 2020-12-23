import React, { Fragment } from 'react'
import { Container, Row, Col, Table } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import { useSelector } from 'react-redux'
import { FILE_URL } from '../../../../config/constants'
function Attachament(props) {
  const viewCostingData = useSelector(
    (state) => state.costing.viewCostingDetailData,
  )
  /*
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
        onClose={(e) => toggleDrawer(e)}
      >
        <Container>
          <div className={'drawer-wrapper drawer-1500px'}>
            <Row className="drawer-heading">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{'View Attachments'}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}
                ></div>
              </Col>
            </Row>

            <Row>
              <Col md="12">
                <Row>
                  <Col md="12">
                    <div className="left-border">{'View Attachments:'}</div>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row>
              {viewCostingData &&
                viewCostingData.map((data) => {
                  return (
                    <td>
                      {data.attachment &&
                        data.attachment.map((f) => {
                          const withOutTild = f.FileURL
                            ? f.FileURL.replace('~', '')
                            : ''
                          const fileURL = `${FILE_URL}${withOutTild}`
                          return (
                            <div className={'image-viwer'} onClick={() => {}}>
                              <img
                                src={fileURL}
                                height={50}
                                width={100}
                                alt="cancel-icon.jpg"
                              />
                            </div>
                          )
                        })}
                    </td>
                  )
                })}
            </Row>
          </div>
        </Container>
      </Drawer>
    </Fragment>
  )
}

export default React.memo(Attachament)
