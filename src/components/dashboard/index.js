import React, { useEffect, useState } from "react";
import { useSelector } from 'react-redux';
import { connect } from "react-redux";
import { getMenuByUser } from "../../actions/auth/AuthActions";
import { Col, Nav, NavItem, Row, NavLink, TabPane, TabContent } from "reactstrap";
import ApprovalListing from '../costing/components/approval/ApprovalListing';
import SimulationApprovalListing from '../simulation/components/SimulationApprovalListing';
import RMApproval from "../masters/material-master/RMApproval";
import {reduxForm } from "redux-form";
import dashboardImg from '../../assests/images/dashboard-img.png';
import BOPApproval from "../masters/bop-master/BOPApproval";
import OperationApproval from "../masters/operation/OperationApproval";
import MachineApproval from "../masters/machine-master/MachineApproval";
import classnames from 'classnames';


function Dashboard(props) {
  const { handleSubmit, menusData, } = props

  const [acc1, setAcc1] = useState(false)
  const [acc2, setAcc2] = useState(true)
  const [acc3, setAcc3] = useState(false)
  const [costingApprovalListingView, setCostingApprovalListingView] = useState(false)
  const [simulationApprovalListingView, setSimulationApprovalListingView] = useState(false)
  const [RMApprovalView, setRMApprovalView] = useState(false)
  const [hideDash, setShowHideDash] = useState(false)
  const [activeTab, setactiveTab] = useState('1');

  const isOpenRMApprovalDashboard = useSelector((state) => state.auth.RMApprovalDashboard)


  useEffect(() => {

    if (isOpenRMApprovalDashboard) {

      if (isOpenRMApprovalDashboard.RMApprovalDashboard === true) {
        setRMApprovalView(true);
      }

      if (isOpenRMApprovalDashboard.AmendmentsApprovalDashboard === true) {
        setSimulationApprovalListingView(true);
      }
      if (isOpenRMApprovalDashboard.CostingsApprovalDashboard === true) {
        setCostingApprovalListingView(true);
      }
      
    }


  }, [isOpenRMApprovalDashboard]);

  const closeDashboard = () => {
    setShowHideDash(true)
  }
  //console.log(this.props.CostingsApprovalDashboard, "as")
  const toggle = (tab) => {

    if (activeTab !== tab) {
        setactiveTab(tab);
    }
}

  return (
    <>
      {
        !hideDash &&
        <>
          <div className="dashboard-page w-100">
            <Row>
              <Col md="12">
                <h1>Dashboard</h1>
              </Col>
            </Row>
            <form onSubmit={handleSubmit}>

              {simulationApprovalListingView &&
                <Row className="m-0">
                  <div className="graph-box w-100">
                    <Row>
                      <Col md="8"><h3 className="mb-0">Amendments Awaiting Approval</h3></Col>
                      <Col md="4" className="text-right">
                        <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setAcc2(!acc2) }}>
                          {acc2 ? (
                            <i className="fa fa-minus" ></i>
                          ) : (
                            <i className="fa fa-plus"></i>
                          )}
                        </button>
                      </Col>
                    </Row>

                    <Row>
                      <Col md="12">{acc2 && <SimulationApprovalListing isSmApprovalListing={true} isDashboard={true} />}</Col>
                    </Row>
                  </div>
                </Row>
              }


              {costingApprovalListingView &&
                <Row className="m-0">
                  <div className="graph-box w-100">
                    <Row>
                      <Col md="8"><h3 className="mb-0">Costings Awaiting Approval</h3></Col>
                      <Col md="4" className="text-right">
                        <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setAcc1(!acc1) }}>
                          {acc1 ? (
                            <i className="fa fa-minus" ></i>
                          ) : (
                            <i className="fa fa-plus"></i>
                          )}
                        </button>
                      </Col>
                    </Row>
                    <Row>
                      <Col md="12">{acc1 && <ApprovalListing isApproval={true} closeDashboard={closeDashboard} isDashboard={true} />}</Col>
                    </Row>
                  </div>
                </Row>
              }

              {RMApprovalView &&
                <Row className="m-0">
                  <div className="graph-box w-100">
                    <Row>
                      <Col md="8"><h3 className="mb-0">Masters Awaiting Approval</h3></Col>
                      <Col md="4" className="text-right">
                        <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setAcc3(!acc3) }}>
                          {acc3 ? (
                            <i className="fa fa-minus" ></i>
                          ) : (
                            <i className="fa fa-plus"></i>
                          )}
                        </button>
                      </Col>
                    </Row>
                    {acc3 && <>
                    <Nav tabs className="subtabs mt-4">
                  <NavItem>
                      <NavLink className={classnames({ active: activeTab === '1' })} onClick={() => { toggle('1'); }}>
                      RM Awaiting Approval
                      </NavLink>
                  </NavItem>
                  <NavItem>
                      <NavLink className={classnames({ active: activeTab === '2' })} onClick={() => { toggle('2'); }}>
                      BOP Awaiting Approval
                      </NavLink>
                  </NavItem>
                   <NavItem>
                      <NavLink className={classnames({ active: activeTab === '3' })} onClick={() => { toggle('3'); }}>
                      Operation Awaiting Approval
                      </NavLink>
                  </NavItem>
                   <NavItem>
                      <NavLink className={classnames({ active: activeTab === '4' })} onClick={() => { toggle('4'); }}>
                      Machine Awaiting Approval
                      </NavLink>
                  </NavItem>
                  
                </Nav>
                 <TabContent activeTab={activeTab}>
                            {activeTab == 1 &&
                                <TabPane tabId="1">
                                   <RMApproval isApproval={true} />
                                </TabPane>}
                            {activeTab == 2 &&
                                <TabPane tabId="2">
                                   <BOPApproval isApproval={true}/>
                                </TabPane>}
                            {activeTab == 3 &&
                                <TabPane tabId="3">
                                   <OperationApproval isApproval={true}/>
                                </TabPane>}
                            {activeTab == 4 &&
                                <TabPane tabId="4">
                                  <MachineApproval  isApproval={true}/>
                                </TabPane>}
                        </TabContent>
                        </>}
                  </div>
                </Row>
              }
            </form>
          </div >
          <Row className="m-0">
            <div className="graph-box w-100">
              <div className="dashboard-top position-relative">
                <div className="dashboard-text">
                  <h2>Other Widgets Will Come Here</h2>
                </div>
                <img src={dashboardImg} alt='dashboard-background' />
              </div>
            </div>
          </Row>
        </>
      }
    </>
  )
}
/**
 * @name mapStateToProps
 * @desc map state containing organisation details from the api to props
 * @return object{}
 */
function mapStateToProps({ auth }) {
  const { menusData, leftMenuData, } = auth;
  return { menusData, leftMenuData, };
}

export default connect(mapStateToProps, {
  getMenuByUser,
})(reduxForm({
  form: 'Dashboard',
  enableReinitialize: true,
})(Dashboard));
