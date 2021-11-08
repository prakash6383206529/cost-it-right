import React, { Component, useEffect, useState } from "react";
import { connect, useSelector } from "react-redux";
import { getMenuByUser, getLeftMenu } from "../../actions/auth/AuthActions";
import { checkForNull, loggedInUserId } from "../../helper";
import { Col, Container, Row } from "reactstrap";
import ApprovalListing from '../costing/components/approval/ApprovalListing';
import SimulationApprovalListing from '../simulation/components/SimulationApprovalListing';
import RMApproval from "../masters/material-master/RMApproval";
import { reactLocalStorage } from "reactjs-localstorage";
import { Field, reduxForm } from "redux-form";
import dashboardImg from '../../assests/images/dashboard-img.png'

function Dashboard(props) {
  const { handleSubmit, menusData } = props

  const [acc1, setAcc1] = useState(false)
  const [acc2, setAcc2] = useState(true)
  const [acc3, setAcc3] = useState(false)
  const [costingApprovalListingView, setCostingApprovalListingView] = useState(false)
  const [simulationApprovalListingView, setSimulationApprovalListingView] = useState(false)
  const [RMApprovalView, setRMApprovalView] = useState(false)
  const [hideDash, setShowHideDash] = useState(false)

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



  // useEffect(() => {
  //   props.getMenuByUser(loggedInUserId(), () => {
  //     if (menusData !== undefined) {
  //       reactLocalStorage.set("ModuleId", menusData[0].ModuleId);
  //       props.getLeftMenu(
  //         menusData[0].ModuleId,
  //         loggedInUserId(),
  //         (res) => { }
  //       );
  //     }
  //   });
  // })

  const closeDashboard = () => {
    setShowHideDash(true)
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

              {/* {RMApprovalView &&
                <Row className="m-0">
                  <div className="graph-box w-100">
                    <Row>
                      <Col md="8"><h3 className="mb-0">RM Awaiting Approval</h3></Col>
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

                    <Row>
                      <Col md="12">{acc3 && <RMApproval isApproval={true} />}</Col>
                    </Row>
                  </div>
                </Row>
              } */}
            </form>
          </div>
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
  const { menusData, leftMenuData } = auth;
  return { menusData, leftMenuData };
}

export default connect(mapStateToProps, {
  getMenuByUser,
  getLeftMenu,
})(reduxForm({
  form: 'Dashboard',
  enableReinitialize: true,
})(Dashboard));
