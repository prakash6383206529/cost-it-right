import React from 'react'
import { Container, Row, Col } from 'reactstrap'
import Drawer from '@material-ui/core/Drawer'

function ViewDrawer(props) {
  const { approvalLevelStep } = props
 
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
      <Drawer className="top-drawer" anchor={props.anchor} open={props.isOpen} >
        {/* <Container > */}
          <div className="container-fluid add-operation-drawer">
            <div className={'drawer-wrapper drawer-full-width'}>

              <Row className="drawer-heading sticky-top-0">
                <Col>
                  <div className={'header-wrapper left'}>
                    <h3>{`Approval Workflow`}</h3>
                  </div>
                  <div
                    onClick={(e) => toggleDrawer(e)}
                    className={'close-button right'}
                  ></div>
                </Col>
              </Row>

              {/* <Row> */}



              <div className="row process workflow-row justify-content-between">
                {
                  approvalLevelStep &&
                  approvalLevelStep.map((item, index) => {
                    console.log("item", item)
                    return (
                      <div key={index} className="col-lg-3 col-md-6 col-sm-12 d-flex" >
                        <div className="card-border card-green">
                <div className="top d-flex">
                  <div className="left text-center" >
                    <b>{item.FlowStepSequence}</b>
                    
                    <span className="d-block">Level</span>
                  </div>
                  <div className="right">
                    <span className="">Approved By:</span>
                    <p className="">{item.Name}</p>
                  </div>
                </div>
                {/* top */}
                <div className="bottom">
                  <div className="d-flex mb-3">
                    <span className="small-grey-text left">Date:</span>
                    <span className=" right">{item.DateTime}</span>
                  </div>
                  <div className="d-flex">
                    <span className="small-grey-text left">Remark:</span>
                    <span className=" right">{item.Remark}</span>
                  </div>
                </div>
                {/* bottom */}
              </div>
                      </div>
                    )
                  })}
              </div>

              {/* </Row> */}
              <hr />
              <Row className="sf-btn-footer no-gutters justify-content-between">
                <div className="col-sm-12 text-right bluefooter-butn">
                  <button
                    type={'button'}
                    className="reset mr15 cancel-btn"
                    onClick={toggleDrawer}
                  >
                    <div className={'cross-icon'}>
                      <img
                        src={require('../../../../assests/images/times.png')}
                        alt="cancel-icon.jpg"
                      />
                    </div>{' '}
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
