import React from 'react'
import { Container, Row, Col } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'
import { APPROVED, PENDING, REJECTED } from '../../../../config/constants'
import moment from 'moment'

function ViewDrawer(props) {
  const { approvalLevelStep, approvalNo, isSimulation } = props

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
      <Drawer className="top-drawer approval-workflow-drawer" anchor={props.anchor} open={props.isOpen} >
        {/* <Container > */}
        <div className="container-fluid ">
          <div className={'drawer-wrapper drawer-full-width'}>

            <Row className="drawer-heading sticky-top-0">
              <Col>
                <div className={'header-wrapper left'}>
                  <h3>{`Approval Workflow (${isSimulation ? `Token No.${approvalNo})` : `Approval No.${approvalNo})`}`}</h3>
                </div>
                <div
                  onClick={(e) => toggleDrawer(e)}
                  className={'close-button right'}
                ></div>
              </Col>
            </Row>

            {/* <Row> */}


            {
              approvalLevelStep &&
              <div className="row process workflow-row mt-5 mx-0">
                {/* <div className="col-lg-3 col-md-6 col-sm-12 ">
        <div className="card-border card-green">
          <div className="top d-flex">
            <div className="left text-center">
              <b>{createdByDetail.FlowStepSequence ? createdByDetail.FlowStepSequence : 0}</b>
              <span className="d-block">Level</span>
            </div>
            <div className="right">
              <span className="">{createdByDetail.Title}</span>
              <p className="">{createdByDetail.ApprovedBy ? createdByDetail.ApprovedBy : '-'}</p>
            </div>
          </div>
          {/* top */}
                {/* <div className="bottom">
            <div className="d-flex mb-3">
              <span className="small-grey-text left">Date:</span>
              <span className=" right">{createdByDetail.Date ? createdByDetail.Date : '-'}</span>
            </div>
            <div className="d-flex">
              <span className="small-grey-text left">Remark:</span>
              <span className=" right">{createdByDetail.Remark ? createdByDetail.Remark : '-'}</span>
            </div>
          </div>         
        </div>
      </div> */}
                {approvalLevelStep &&
                  approvalLevelStep.map((item, index) => {
                    return (
                      <>
                        <div key={index} className="col-lg-3 col-md-6 col-sm-12 ">
                          <div className={`card-border  ${item.Title.split(' ')[0] === REJECTED ? 'card-red' : item.Title.split(' ')[0] === APPROVED ? 'card-green' : item.Status === PENDING ? 'card-yellow' : ''}`}>
                            <div className="top d-flex">
                              <div className="left text-center">
                                <b>{item.Level ? item.Level.split('-')[1] : 0}</b>
                                <span className="d-block">Level</span>
                              </div>
                              <div className="right">
                                <span className="">{item.Title}</span>
                                <p className="">{item.ApprovedBy ? item.ApprovedBy : '-'}</p>
                              </div>
                            </div>
                            {/* top */}
                            <div className="bottom">
                              <div className="d-flex mb-3">
                                <span className="small-grey-text left">Date:</span>
                                <span className=" right">{item.Date ? moment(item.Date).format('DD/MM/YYYY') : '-'}</span>
                              </div>
                              <div className="d-flex">
                                <span className="small-grey-text left">Remark:</span>
                                <span className=" right">{item.Remark ? item.Remark : '-'}</span>
                              </div>
                            </div>
                            {/* bottom */}
                          </div>
                        </div>
                      </>
                    )
                  })}
              </div>
            }
            {/* </Row> */}
            <Row className="sf-btn-footer no-gutters justify-content-between">
              <div className="col-sm-12 text-right bluefooter-butn">
                <button
                  type={'button'}
                  className="reset mr15 cancel-btn"
                  onClick={toggleDrawer}
                >
                  <div className={'cencel-icon'}></div>{' '}
                  {'Cancel'}
                </button>
              </div>
            </Row>
          </div>
        </div>
        {/* </Container> */}
      </Drawer>
    </>
  )
}

export default React.memo(ViewDrawer)
