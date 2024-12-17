import React, { useEffect, useMemo, useState } from "react";
import { connect, useSelector, useDispatch } from "react-redux";
import { getMenuByUser } from "../../actions/auth/AuthActions";
import { Col, Nav, NavItem, Row, NavLink, TabPane, TabContent } from "reactstrap";
import { reduxForm } from "redux-form";
import dashboardImg from '../../assests/images/dashboard-img.png';
import classnames from 'classnames';
import { CheckApprovalApplicableMaster, getConfigurationKey, showBopLabel } from "../../helper";
import { checkPermission } from "../../helper/util";
import { ADDITIONAL_MASTERS, BOP, BOP_MASTER_ID, COSTING, MACHINE, MACHINE_MASTER_ID, MASTERS, OPERATION, OPERATIONS_ID, RAW_MATERIAL, RM_MASTER_ID, SIMULATION } from "../../config/constants";
import CalculatorWrapper from "../common/Calculator/CalculatorWrapper";
import { setSelectedRowForPagination } from "../simulation/actions/Simulation";
import Tabs from "./Tabs";
import MasterApprovalTabs from "./MasterApprovalTabs";
import ScrollToTop from "../common/ScrollToTop";
import { MESSAGES } from "../../config/message";
import TourWrapper from "../common/Tour/TourWrapper";
import { Steps } from "./TourMessages";
import { useTranslation } from "react-i18next";
import { validateForm } from "../layout/FormInputs";


function Dashboard(props) {
  const { handleSubmit } = props
  const { t } = useTranslation("Dashboard")
  const [acc1, setAcc1] = useState(false)

  const [acc2, setAcc2] = useState(true)

  const [acc3, setAcc3] = useState(false)

  const [acc4, setAcc4] = useState(false)

  const [hideDash, setShowHideDash] = useState(false)
  const [activeTab, setactiveTab] = useState('1');
  const [viewSimulation, setViewSimulation] = useState(true)
  const [viewCosting, setViewCosting] = useState(true)
  const [pageDropDownRef, setPageDropDownRef] = useState('')
  const [delegationMasterTab, setDelegationMasterTab] = useState(CheckApprovalApplicableMaster(RM_MASTER_ID) ? RM_MASTER_ID : CheckApprovalApplicableMaster(BOP_MASTER_ID) ? BOP_MASTER_ID : CheckApprovalApplicableMaster(OPERATIONS_ID) ? OPERATIONS_ID : CheckApprovalApplicableMaster(MACHINE_MASTER_ID) ? MACHINE_MASTER_ID : null)

  const [viewMastersObj, setViewMAstersObj] = useState({
    RM: false,
    BOP: false,
    operation: false,
    machine: false
  })
  const topAndLeftMenuData = useSelector((state) => state.auth.topAndLeftMenuData)
  const dashboardTabLock = useSelector(state => state.comman.dashboardTabLock)

  const dispatch = useDispatch()

  const [showMasterButtons, setShowMasterButtons] = useState(false);

  const toggleMasterButtons = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMasterButtons(!showMasterButtons);
  };

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
      const accessBOPData = masterData && masterData.Pages.find(el => el.PageName === showBopLabel())
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
      dispatch(setSelectedRowForPagination([]))
      setTimeout(() => {
        setactiveTab(tab);
      }, 300);
    }
  }

  const isPageNoChange = (data) => {
    setPageDropDownRef(data)
    setTimeout(() => {
      document.getElementById('refresh-to-top').scrollIntoView({
        behavior: 'smooth'
      });
    }, 100);
  }
  const masterToggle = (master) => {
    setDelegationMasterTab(master);
    toggle('3');
  }

  return (
    <div id="dashboard-go-to-top">
      {
        !hideDash &&
        <>
          <ScrollToTop pointProp={"dashboard-go-to-top"} />
          <div className="dashboard-page w-100">

            <CalculatorWrapper />
            {/* <Row>
              <Col md="12">
                <h1>Dashboard</h1>
              </Col>
            </Row> */}
            <form onSubmit={handleSubmit}>

              {viewSimulation && JSON.parse(localStorage.getItem('simulationViewPermission'))?.length !== 0 && <Row className="m-0">
                <div className="graph-box w-100" id={`${pageDropDownRef === 'simulation' ? 'refresh-to-top' : ''}`}>
                  <Row>
                    <Col md="8"><h3 className="mb-0">Amendments Approval Status {acc2 &&

                      <TourWrapper
                        buttonSpecificProp={{ id: "Dashboard_Simulation_Form" }}
                        stepsSpecificProp={{
                          steps: Steps(t).DASHBOARD_SIMULATION_TAB
                        }} />}
                    </h3></Col>
                    <Col md="4" className="text-right">
                      <button id="Dashboard_Simulation_Accordian" className="btn btn-small-primary-circle ml-1" type="button" disabled={dashboardTabLock} onClick={() => { setAcc2(!acc2) }}>
                        {acc2 ? (
                          <i className="fa fa-minus" ></i>
                        ) : (
                          <i className="fa fa-plus"></i>
                        )}
                      </button>
                    </Col>
                  </Row>

                  {acc2 && <Row>
                    <Col md="12" className="mt-3">{acc2 && <>
                      <Tabs isPageNoChange={isPageNoChange} costing={false} accordion={false} module={'simulation'} />
                    </>}</Col>
                  </Row>}
                </div>
              </Row>}

              {viewCosting && <Row className="m-0" id={`${pageDropDownRef === 'costing' ? 'refresh-to-top' : ''}`}>
                <div className={`graph-box w-100 ${acc1 ? "dashboard-height" : ''}`}>
                  <Row>
                    <Col md="8"><h3 className="mb-0">Costings Approval Status  {acc1 && <TourWrapper
                      buttonSpecificProp={{ id: "Dashboard_Costing_Form" }}
                      stepsSpecificProp={{
                        steps: Steps(t).DASHBOARD_COSTING_TAB
                      }} />}</h3></Col>
                    <Col md="4" className="text-right">
                      <button id="Dashboard_Costing_Accordian" className="btn btn-small-primary-circle ml-1 " disabled={dashboardTabLock} type="button" onClick={() => { setAcc1(!acc1) }}>
                        {acc1 ? (
                          <i className="fa fa-minus" ></i>
                        ) : (
                          <i className="fa fa-plus"></i>
                        )}

                      </button>
                    </Col>
                  </Row>
                  {acc1 && <Row>
                    <Col md="12" className="mt-3">{acc1 && <Tabs isPageNoChange={isPageNoChange} closeDashboard={closeDashboard} costing={true} module={'costing'} accordion={true} />}</Col>
                  </Row>}
                </div>
              </Row>}

              {getConfigurationKey().IsMasterApprovalAppliedConfigure && (viewMastersObj.RM || viewMastersObj.BOP || viewMastersObj.operation || viewMastersObj.machine) &&
                <Row className="m-0" id={`${pageDropDownRef === 'master' ? 'refresh-to-top' : ''}`}>
                  <div className="graph-box w-100">
                    <Row>
                      <Col md="8"><h3 className="mb-0">Masters Approval Status{acc3 && <TourWrapper
                        buttonSpecificProp={{ id: "Dashboard_Master_Form" }}
                        stepsSpecificProp={{
                          steps: Steps(t).DASHBOARD_MASTER_TAB
                        }} />}</h3></Col>
                      <Col md="4" className="text-right">
                        <button id="Dashboard_Master_Accordian" className="btn btn-small-primary-circle ml-1" type="button" disabled={dashboardTabLock} onClick={() => { setAcc3(!acc3) }}>
                          {acc3 ? (
                            <i className="fa fa-minus" ></i>
                          ) : (
                            <i className="fa fa-plus"></i>
                          )}
                        </button>
                      </Col>
                    </Row>
                    {acc3 && <Row className="master-tabs-row mt-3">
                      <Col md="1" className="master-tabs px-0 p-relative"> <Nav tabs className="subtabs">
                        {dashboardTabLock && <div title={MESSAGES.LOADING_MESSAGE} className="disabled-overflow min-width"></div>}
                        {(CheckApprovalApplicableMaster(RM_MASTER_ID) && viewMastersObj.RM) && <NavItem>
                          <NavLink id={`dashboard_RM_Masters_Approval`} className={classnames({ active: activeTab === '1' })} onClick={() => { toggle('1'); }}>
                            RM
                          </NavLink>
                        </NavItem>}
                        {(CheckApprovalApplicableMaster(BOP_MASTER_ID) && viewMastersObj.BOP) && <NavItem>
                          <NavLink id={`dashboard_BOP_Masters_Approval`} className={classnames({ active: activeTab === '2' })} onClick={() => { toggle('2'); }}>
                            {showBopLabel()}
                          </NavLink>
                        </NavItem>}
                        {(CheckApprovalApplicableMaster(OPERATIONS_ID) && viewMastersObj.operation) && <NavItem>
                          <NavLink id={`dashboard_Operation_Masters_Approval`} className={classnames({ active: activeTab === '3' })} onClick={() => { toggle('3'); }}>
                            Operation
                          </NavLink>
                        </NavItem>}
                        {(CheckApprovalApplicableMaster(MACHINE_MASTER_ID) && viewMastersObj.machine) && <NavItem>
                          <NavLink id={`dashboard_Machine_Masters_Approval`} className={classnames({ active: activeTab === '4' })} onClick={() => { toggle('4'); }}>
                            Machine
                          </NavLink>
                        </NavItem>}
                      </Nav></Col>
                      <Col md="11"><TabContent activeTab={activeTab}>
                        {(Number(activeTab) === 1 && viewMastersObj.RM) &&
                          <TabPane tabId="1">
                            <MasterApprovalTabs isApproval={true} MasterId={RM_MASTER_ID} isPageNoChange={isPageNoChange} />
                          </TabPane>}
                        {(Number(activeTab) === 2 && viewMastersObj.BOP) &&
                          <TabPane tabId="2">
                            <MasterApprovalTabs isApproval={true} MasterId={BOP_MASTER_ID} isPageNoChange={isPageNoChange} />
                          </TabPane>}
                        {(Number(activeTab) === 3 && viewMastersObj.operation) &&
                          <TabPane tabId="3">
                            <MasterApprovalTabs isApproval={true} MasterId={OPERATIONS_ID} isPageNoChange={isPageNoChange} />
                          </TabPane>}
                        {(Number(activeTab) === 4 && viewMastersObj.machine) &&
                          <TabPane tabId="4">
                            <MasterApprovalTabs isApproval={true} MasterId={MACHINE_MASTER_ID} isPageNoChange={isPageNoChange} />
                          </TabPane>}
                      </TabContent></Col>
                    </Row>}
                  </div>
                </Row>
              }
              <Row className="m-0 delegation" id={`${pageDropDownRef === 'delegation' ? 'refresh-to-top' : ''}`}>
                <div className="graph-box w-100">
                  <Row>
                    <Col md="8"><h3 className="mb-0">Delegation Status{acc4 && <TourWrapper
                      buttonSpecificProp={{ id: "Dashboard_Master_Form" }}
                      stepsSpecificProp={{
                        steps: Steps(t).DASHBOARD_MASTER_TAB
                      }} />}</h3></Col>
                    <Col md="4" className="text-right">
                      <button id="Dashboard_Master_Accordian" className="btn btn-small-primary-circle ml-1" type="button" disabled={dashboardTabLock} onClick={() => { setAcc4(!acc4) }}>
                        {acc4 ? (
                          <i className="fa fa-minus" ></i>
                        ) : (
                          <i className="fa fa-plus"></i>
                        )}
                      </button>
                    </Col>
                  </Row>
                  {acc4 && <Row className="master-tabs-row mt-3">
                    <Col md="1" className="master-tabs px-0 p-relative"> <Nav tabs className="subtabs">
                      {dashboardTabLock && <div title={MESSAGES.LOADING_MESSAGE} className="disabled-overflow min-width"></div>}
                      {(CheckApprovalApplicableMaster(RM_MASTER_ID) && viewMastersObj.RM) && <NavItem>
                        <NavLink id={`dashboard_RM_Masters_Approval`} className={classnames({ active: activeTab === '1' })} onClick={() => { toggle('1'); }}>
                          Costing
                        </NavLink>
                      </NavItem>}
                      {(CheckApprovalApplicableMaster(BOP_MASTER_ID) && viewMastersObj.BOP) && <NavItem>
                        <NavLink id={`dashboard_BOP_Masters_Approval`} className={classnames({ active: activeTab === '2' })} onClick={() => { toggle('2'); }}>
                          Simulation
                        </NavLink>
                      </NavItem>}
                      {delegationMasterTab && <NavItem className="delegation-master-tab">
                        <NavLink id={`dashboard_Operation_Masters_Approval`} className={`${classnames({ active: activeTab === '3' })} `} onClick={() => { toggle('3') }}>
                          <div className="master-header">
                            Master
                            <button
                              type="button"
                              className="chevron-button"
                              onClick={toggleMasterButtons}
                            >
                              <i className={`fa ${showMasterButtons ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                            </button>
                          </div>
                          {showMasterButtons && (
                            <div className="master-buttons">
                              {CheckApprovalApplicableMaster(RM_MASTER_ID) && <button
                                type="button"
                                className={`master-button ${(activeTab === '3' && delegationMasterTab === RM_MASTER_ID) ? 'active' : ''}`}
                                onClick={() => masterToggle(RM_MASTER_ID)}
                              >
                                RM
                              </button>
                              }
                              {CheckApprovalApplicableMaster(BOP_MASTER_ID) && <button
                                type="button"
                                className={`master-button ${(activeTab === '3' && delegationMasterTab === BOP_MASTER_ID) ? 'active' : ''}`}
                                onClick={() => masterToggle(BOP_MASTER_ID)}
                              >
                                BOP
                              </button>
                              }
                              {CheckApprovalApplicableMaster(OPERATIONS_ID) && <button
                                type="button"
                                className={`master-button ${(activeTab === '3' && delegationMasterTab === OPERATIONS_ID) ? 'active' : ''}`}
                                onClick={() => masterToggle(OPERATIONS_ID)}
                              >
                                Operation
                              </button>}
                              {CheckApprovalApplicableMaster(MACHINE_MASTER_ID) && <button
                                type="button"
                                className={`master-button ${(activeTab === '3' && delegationMasterTab === MACHINE_MASTER_ID) ? 'active' : ''}`}
                                onClick={() => masterToggle(MACHINE_MASTER_ID)}
                              >
                                Machine
                              </button>}
                            </div>
                          )}
                        </NavLink>
                      </NavItem>}
                      {(CheckApprovalApplicableMaster(MACHINE_MASTER_ID) && viewMastersObj.machine) && <NavItem>
                        <NavLink id={`dashboard_Machine_Masters_Approval`} className={classnames({ active: activeTab === '4' })} onClick={() => { toggle('4'); }}>
                          Onboarding & Management
                        </NavLink>
                      </NavItem>}
                    </Nav></Col>
                    <Col md="11"><TabContent activeTab={activeTab}>
                      {(Number(activeTab) === 1) &&
                        <TabPane tabId="1">
                          {acc4 && <Row>
                            <Col md="12" className="mt-3">{acc4 && <Tabs isPageNoChange={isPageNoChange} closeDashboard={closeDashboard} costing={true} module={'costing'} accordion={true} />}</Col>
                          </Row>}
                        </TabPane>}
                      {(Number(activeTab) === 2) &&
                        <TabPane tabId="2">
                          {acc4 && <Row>
                            <Col md="12" className="mt-3">{acc4 && <><Tabs isPageNoChange={isPageNoChange} costing={false} accordion={false} module={'simulation'} /></>}</Col>
                          </Row>}
                        </TabPane>}
                      {(Number(activeTab) === 3) &&
                        <TabPane tabId="3">
                          <MasterApprovalTabs isApproval={true} MasterId={delegationMasterTab} isPageNoChange={isPageNoChange} />
                        </TabPane>}
                      {(Number(activeTab) === 4) &&
                        <TabPane tabId="4">
                          <MasterApprovalTabs isApproval={true} MasterId={MACHINE_MASTER_ID} isPageNoChange={isPageNoChange} />
                        </TabPane>}
                    </TabContent></Col>
                  </Row>}
                </div>
              </Row>
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
    </div>
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
  validate: validateForm,
  enableReinitialize: true,
  touchOnChange: true
})(Dashboard));
