import React, { useEffect, useState } from "react";
import { connect, useSelector, useDispatch } from "react-redux";
import { getMenuByUser } from "../../actions/auth/AuthActions";
import { Col, Nav, NavItem, Row, NavLink, TabPane, TabContent } from "reactstrap";
import ApprovalListing from '../costing/components/approval/ApprovalListing';
import SimulationApprovalListing from '../simulation/components/SimulationApprovalListing';
import { reduxForm } from "redux-form";
import dashboardImg from '../../assests/images/dashboard-img.png';
import classnames from 'classnames';
import { CheckApprovalApplicableMaster, getConfigurationKey } from "../../helper";
import { checkPermission } from "../../helper/util";
import { ADDITIONAL_MASTERS, BOP, BOP_MASTER_ID, COSTING, MACHINE, MACHINE_MASTER_ID, MASTERS, OPERATION, OPERATIONS_ID, RAW_MATERIAL, RM_MASTER_ID, SIMULATION } from "../../config/constants";
import CalculatorWrapper from "../common/Calculator/CalculatorWrapper";
import CommonApproval from "../masters/material-master/CommonApproval";
import { setSelectedCostingListSimualtion } from "../simulation/actions/Simulation";


function Dashboard(props) {
  const { handleSubmit } = props

  const [acc1, setAcc1] = useState(false)
  const [acc2, setAcc2] = useState(true)
  const [acc3, setAcc3] = useState(false)
  const [hideDash, setShowHideDash] = useState(false)
  const [activeTab, setactiveTab] = useState('1');
  const [viewSimulation, setViewSimulation] = useState(true)
  const [viewCosting, setViewCosting] = useState(true)

  const [viewMastersObj, setViewMAstersObj] = useState({
    RM: false,
    BOP: false,
    operation: false,
    machine: false
  })
  const topAndLeftMenuData = useSelector((state) => state.auth.topAndLeftMenuData)

  const dispatch = useDispatch()

  const closeDashboard = () => {
    setShowHideDash(true)
  }
  useEffect(() => {
    applyPermission(topAndLeftMenuData);
  }, [topAndLeftMenuData])

  const applyPermission = (topAndLeftMenuData) => {
    if (topAndLeftMenuData !== undefined) {
      const masterData = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === MASTERS)
      const additionalMasterData = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === ADDITIONAL_MASTERS)
      const simulationData = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === SIMULATION)
      const costingData = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === COSTING)
      if (simulationData === undefined) {
        setViewSimulation(false)
      }
      if (costingData === undefined) {
        setViewCosting(false)
      }

      const accessRMData = masterData && masterData.Pages.find(el => el.PageName === RAW_MATERIAL)
      const accessBOPData = masterData && masterData.Pages.find(el => el.PageName === BOP)
      const accessMachineData = masterData && masterData.Pages.find(el => el.PageName === MACHINE)
      const accessOperationData = additionalMasterData && additionalMasterData.Pages.find(el => el.PageName === OPERATION)

      const permmisionRMData = accessRMData && accessRMData.Actions && checkPermission(accessRMData.Actions)
      const permmisionBOPData = accessBOPData && accessBOPData.Actions && checkPermission(accessBOPData.Actions)
      const permmisionMachineData = accessMachineData && accessMachineData.Actions && checkPermission(accessMachineData.Actions)
      const permmisionOperationData = accessOperationData && accessOperationData.Actions && checkPermission(accessOperationData.Actions)
      const rmAccessibility = permmisionRMData && permmisionRMData.View ? permmisionRMData.View : false;
      const bopAccesibility = permmisionBOPData && permmisionBOPData.View ? permmisionBOPData.View : false;
      const machineAccessibilty = permmisionMachineData && permmisionMachineData.View ? permmisionMachineData.View : false
      const operationAccessibility = permmisionOperationData && permmisionOperationData.View ? permmisionOperationData.View : false
      setactiveTab(rmAccessibility ? '1' : bopAccesibility ? '2' : operationAccessibility ? '3' : '4')

      setViewMAstersObj({
        RM: rmAccessibility,
        BOP: bopAccesibility,
        operation: operationAccessibility,
        machine: machineAccessibilty
      })
    }
  }
  const toggle = (tab) => {

    if (activeTab !== tab) {
      dispatch(setSelectedCostingListSimualtion([]))
      setTimeout(() => {
        setactiveTab(tab);
      }, 300);
    }
  }

  return (
    <>
      {
        !hideDash &&
        <>
          <div className="dashboard-page w-100">
            <CalculatorWrapper />
            <Row>
              <Col md="12">
                <h1>Dashboard</h1>
              </Col>
            </Row>
            <form onSubmit={handleSubmit}>

              {viewSimulation && JSON.parse(localStorage.getItem('simulationViewPermission'))?.length !== 0 && <Row className="m-0">
                <div className="graph-box w-100">
                  <Row>
                    <Col md="8"><h3 className="mb-0">Amendments Approval Status</h3></Col>
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
              </Row>}

              {viewCosting && <Row className="m-0">
                <div className={`graph-box w-100 ${acc1 ? "dashboard-height" : ''}`}>
                  <Row>
                    <Col md="8"><h3 className="mb-0">Costings Approval Status</h3></Col>
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
              </Row>}

              {getConfigurationKey().IsMasterApprovalAppliedConfigure && (viewMastersObj.RM || viewMastersObj.BOP || viewMastersObj.operation || viewMastersObj.machine) &&
                <Row className="m-0">
                  <div className="graph-box w-100">
                    <Row>
                      <Col md="8"><h3 className="mb-0">Masters Approval Status</h3></Col>
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
                        {(CheckApprovalApplicableMaster(RM_MASTER_ID) && viewMastersObj.RM) && <NavItem>
                          <NavLink className={classnames({ active: activeTab === '1' })} onClick={() => { toggle('1'); }}>
                            RM Approval Status
                          </NavLink>
                        </NavItem>}
                        {(CheckApprovalApplicableMaster(BOP_MASTER_ID) && viewMastersObj.BOP) && <NavItem>
                          <NavLink className={classnames({ active: activeTab === '2' })} onClick={() => { toggle('2'); }}>
                            BOP Approval Status
                          </NavLink>
                        </NavItem>}
                        {(CheckApprovalApplicableMaster(OPERATIONS_ID) && viewMastersObj.operation) && <NavItem>
                          <NavLink className={classnames({ active: activeTab === '3' })} onClick={() => { toggle('3'); }}>
                            Operation Approval Status
                          </NavLink>
                        </NavItem>}
                        {(CheckApprovalApplicableMaster(MACHINE_MASTER_ID) && viewMastersObj.machine) && <NavItem>
                          <NavLink className={classnames({ active: activeTab === '4' })} onClick={() => { toggle('4'); }}>
                            Machine Approval Status
                          </NavLink>
                        </NavItem>}

                      </Nav>
                      <TabContent activeTab={activeTab}>
                        {(Number(activeTab) === 1 && viewMastersObj.RM) &&
                          <TabPane tabId="1">
                            <CommonApproval isApproval={true} MasterId={RM_MASTER_ID} />
                          </TabPane>}
                        {(Number(activeTab) === 2 && viewMastersObj.BOP) &&
                          <TabPane tabId="2">
                            <CommonApproval isApproval={true} MasterId={BOP_MASTER_ID} />
                          </TabPane>}
                        {(Number(activeTab) === 3 && viewMastersObj.operation) &&
                          <TabPane tabId="3">
                            <CommonApproval isApproval={true} MasterId={OPERATIONS_ID} />
                          </TabPane>}
                        {(Number(activeTab) === 4 && viewMastersObj.machine) &&
                          <TabPane tabId="4">
                            <CommonApproval isApproval={true} MasterId={MACHINE_MASTER_ID} />
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
