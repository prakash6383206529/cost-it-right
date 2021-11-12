import React, { Fragment } from 'react'
import { Container, Row, Col, Table } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import { useSelector } from 'react-redux'
import { FILE_URL } from '../../../../config/constants'

function Attachament(props) {
  const { index } = props
  const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)
  console.log('viewCostingData: ', viewCostingData);
  const Data = viewCostingData[index]
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
      <Drawer anchor={props.anchor} open={props.isOpen}       >
        <Container>
          <div className={'drawer-wrapper'}>
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
            <Row className="mx-0">
              <Col md="12">

                {Data.attachment &&
                  Data.attachment.map((f) => {
                    const withOutTild = f.FileURL
                      ? f.FileURL.replace('~', '')
                      : ''
                    const fileURL = `${FILE_URL}${withOutTild}`
                    return (
                      <div className={"attachment-row"}>
                        <a href={fileURL} target="_blank" rel="noreferrer">
                          {f.OriginalFileName}
                        </a>
                      </div>
                    )
                  })}

              </Col>
            </Row>
          </div>
        </Container>
      </Drawer>
    </Fragment>
  )
}

export default React.memo(Attachament)
