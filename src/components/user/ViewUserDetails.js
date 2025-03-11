import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col } from 'reactstrap';
import { getUserDataAPI, getPermissionByUser, getActionHeadsSelectList, getUsersTechnologyLevelAPI, getUsersSimulationTechnologyLevelAPI, getUsersMasterLevelAPI, getUsersOnboardingLevelAPI } from "../../actions/auth/AuthActions";
import { Loader } from '../common/Loader';
import { EMPTY_DATA, ONBOARDING } from '../../config/constants'
import NoContentFound from '../common/NoContentFound';
import Drawer from '@material-ui/core/Drawer';
import HeaderTitle from '../common/HeaderTitle';
import { loggedInUserId, getConfigurationKey, handleDepartmentHeader } from '../../helper/auth';
import LoaderCustom from '../common/LoaderCustom';
import { COSTING, SIMULATION, MASTERS } from '../../config/constants'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { PaginationWrapper } from '../common/commonPagination';
import TourWrapper from '../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { withTranslation } from 'react-i18next';


const gridOptionsTechnology = {}
const gridOptionsSimulation = {}
const gridOptionsMaster = {}
const gridOptionsOnboarding = {}

const gridOptions = {
  gridOptionsTechnology: gridOptionsTechnology,
  gridOptionsSimulation: gridOptionsSimulation,
  gridOptionsMaster: gridOptionsMaster,
  gridOptionsOnboarding: gridOptionsOnboarding,
};
class ViewUserDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditFlag: false,
      isPermissionOpen: true,
      isTechnologyOpen: false,
      Modules: [],
      TechnologyLevelGrid: [],
      department: '',
      loader: false,
      isSimulationOpen: false,
      isMasterOpen: false,
      SimulationLevelGrid: [],
      MasterLevelGrid: [],
      gridApiTechnology: null,
      gridColumnApiTechnology: null,
      gridApiSimulation: null,
      gridColumnApiSimulation: null,
      gridApiMaster: null,
      gridColumnApiMaster: null,
      OnboardingLevelGrid: [],
      isOnboardingOpen: false
    }
  }

  UNSAFE_componentWillMount() {
    this.setState({ loader: true })
    this.props.getUserDataAPI(this.props.UserId, (res) => {
      this.setState({ loader: false })
      if (res && res.data && res.data.Data) {
        this.changeDepartment()
      }
    })
  }

  componentDidMount() {

    this.props.getActionHeadsSelectList(() => { })
    this.getUserPermission(this.props.UserId)
    this.getUsersTechnologyLevelData(this.props.UserId)
    this.getUsersSimulationTechnologyLevelData(this.props.UserId)
    getConfigurationKey().IsMasterApprovalAppliedConfigure && this.getUsersMasterLevelData(this.props.UserId)
    if(getConfigurationKey().IsShowOnboarding ){
      this.getOnboardingUserData(this.props.UserId)
    }
  }

  changeDepartment() {
    const { registerUserData } = this.props;
    if (registerUserData !== undefined) {
      let array_Department = []
      registerUserData && registerUserData?.Departments && registerUserData?.Departments.map((item) => {
        array_Department.push(item?.DepartmentName)
        return null
      })
      array_Department.toString()
      this.setState({ department: array_Department })
    }
  }

  getUserPermission = (UserId) => {
    this.props.getPermissionByUser(UserId, (res) => {
      if (res && res.data && res.data.Data) {

        let Data = res.data.Data;
        let Modules = Data.Modules;

        this.setState({
          Modules: Modules,
        })
      }
    })
  }

  /**
 * @method getUsersTechnologyLevelData
 * @description used to get users technology level listing
 */
  getUsersTechnologyLevelData = (UserId) => {
    this.props.getUsersTechnologyLevelAPI(UserId, 0, (res) => {
      if (res && res.data && res.data.Data) {

        let Data = res.data.Data;
        let TechnologyLevels = Data.TechnologyLevels;

        this.setState({
          TechnologyLevelGrid: TechnologyLevels,
        })
      }
    })
  }
  getUsersSimulationTechnologyLevelData = (UserId) => {
    this.props.getUsersSimulationTechnologyLevelAPI(UserId, 0, (res) => {
      if (res && res.data && res.data.Data) {
        let Data = res.data.Data;
        let simulationLevel = Data.TechnologyLevels;
        this.setState({
          SimulationLevelGrid: simulationLevel,
        })
      }
    })
  }
  getUsersMasterLevelData = (UserId) => {
    this.props.getUsersMasterLevelAPI(UserId, 0, (res) => {
      if (res && res.data && res.data.Data) {
        let Data = res.data.Data;
        let masterLevel = Data.MasterLevels;
        this.setState({
          MasterLevelGrid: masterLevel,
        })
      }
    })
  }
  getOnboardingUserData = (UserId) => {
    this.props.getUsersOnboardingLevelAPI(UserId, (res) => {
      if (res && res.data && res.data.Data) {
        let Data = res.data.Data;
        let onboardingLevel = Data.OnboardingApprovalLevels;
        this.setState({
          OnboardingLevelGrid: onboardingLevel,
        })
      }
    })
  }

  /**
  * @method renderAction
  * @description used to render row of actions
  */
  renderAction = (actions, parentIndex) => {
    const { actionSelectList } = this.props;

    return actionSelectList && actionSelectList.map((el, i) => {
      return actions && actions.map((item, index) => {
        if (el.Text !== item.ActionName || item.IsChecked === false) return false;
        this.renderSecondLevelAction(item.Actions, index)
        return null
      })
    })
  }

  renderSecondLevelAction = (actions, parentIndex) => {
    const { actionSelectList } = this.props;

    return actionSelectList && actionSelectList.map((el, i) => {
      return actions && actions.map((item, index) => {
        if (el.Text !== item.ActionName || item.IsChecked === false) return false;
        return (
          <td>
            <div className={`${item.ActionName}-icon`}>
              {item.ActionName}
            </div>
          </td>
        )
      })
    })
  }

  toggleDrawer = (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }

    this.props.closeUserDetails()
  };

  /**
   * @method permissionToggle
   * @description used to render row of actions
   */
  permissionToggle = () => {
    this.setState({
      isPermissionOpen: !this.state.isPermissionOpen,
    }, () => {
      const { isPermissionOpen } = this.state;
      if (isPermissionOpen === false) {
        this.setState({ isTechnologyOpen: true })
      } else {
        this.setState({ isTechnologyOpen: false })
      }
    })
  }

  /**
   * @method permissionToggle
   * @description used to render row of actions
   */
  technologyToggle = (value) => {
    const { isTechnologyOpen, isSimulationOpen, isMasterOpen, isOnboardingOpen } = this.state;
    switch (value) {
      case COSTING:
        this.setState({ isTechnologyOpen: !this.state.isTechnologyOpen })
        if (isTechnologyOpen === false) {
          this.setState({ isPermissionOpen: true })
        } else {
          this.setState({ isPermissionOpen: false })
        }
        break;
      case SIMULATION:
        this.setState({ isSimulationOpen: !this.state.isSimulationOpen })
        if (isSimulationOpen === false) {
          this.setState({ isPermissionOpen: true })
        } else {
          this.setState({ isPermissionOpen: false })
        }
        break;
      case MASTERS:
        this.setState({ isMasterOpen: !this.state.isMasterOpen })
        if (isMasterOpen === false) {
          this.setState({ isPermissionOpen: true })
        } else {
          this.setState({ isPermissionOpen: false })
        }
        break;
      case ONBOARDING:
        this.setState({ isOnboardingOpen: !this.state.isOnboardingOpen })
        if (isOnboardingOpen === false) {
          this.setState({ isPermissionOpen: true })
        } else {
          this.setState({ isPermissionOpen: false })
        }
        break;
      default:
        break;
    }
  }


  resetState = (gridOption) => {
    const options = gridOptions[gridOption];
    options.columnApi?.resetColumnState(null);
    options.api?.setFilterModel(null);
  }

  onGridReady = (params, module) => {
    this.gridApi = params.api;
    this.gridApi.sizeColumnsToFit();
    switch (module) {
      case 'technology':
        this.setState({ gridApiTechnology: params.api, gridColumnApiTechnology: params.columnApi })
        break;
      case "simulation":
        this.setState({ gridApiSimulation: params.api, gridColumnApiSimulation: params.columnApi })
        break;
      case "master":
        this.setState({ gridApiMaster: params.api, gridColumnApiMaster: params.columnApi })
        break;
      default:
        break;
    }
    params.api.paginationGoToPage(0);
  };
  onPageSizeChanged = (gridApi, newPageSize) => {
    gridApi.paginationSetPageSize(Number(newPageSize));
  };
  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { UserId, registerUserData, EditAccessibility, IsLoginEmailConfigure, t } = this.props;
    const { isTechnologyOpen, department, isMasterOpen, isSimulationOpen, SimulationLevelGrid, MasterLevelGrid, gridApiTechnology, gridApiSimulation, gridApiMaster, OnboardingLevelGrid, gridApiOnboarding, isOnboardingOpen } = this.state;

    const departmentName = department ? department.join(", ") : '-';
    const defaultColDef = {
      resizable: true,
      filter: true,
      sortable: false,

    };
    const frameworkComponents = {
      totalValueRenderer: this.buttonFormatter,
      // customLoadingOverlay: LoaderCustom,
      customNoRowsOverlay: NoContentFound,
      hyphenFormatter: this.hyphenFormatter
    };
    return (
      <>
        {(this.props.loading) && <Loader />}
        <Drawer className="user-detail" anchor={this.props.anchor} open={this.props.isOpen}
        // onClose={(e) => this.toggleDrawer(e)}
        >
          {(this.state.loader) && <LoaderCustom />}
          <Container>
            <div className={'drawer-wrapper'}>
              <Row className="drawer-heading">
                <Col>
                  <div className={'header-wrapper left'}>
                    <h3>{`User Details`}
                      <TourWrapper
                        buttonSpecificProp={{ id: "View_User_Details_Form" }}
                        stepsSpecificProp={{
                          steps: Steps(t, { RFQUser: this.props?.RFQUser }).USER_DETAILS
                        }} />
                    </h3>
                  </div>
                  <div
                    onClick={(e) => this.toggleDrawer(e)}
                    className={'close-button right'}>
                  </div>
                </Col>
              </Row>
              <div className="drawer-body">
                <Row>
                  <Col md="6">
                    <HeaderTitle
                      title={'Personal Details:'}
                      customClass={'Personal-Details'} />
                  </Col>
                  <Col md="6">
                    {EditAccessibility && (UserId !== loggedInUserId()) && <button
                      className={'user-btn'}
                      id="edit_userDetails"
                      onClick={() => this.props.editItemDetails(UserId, false)}
                      type="button">
                      <div className={'edit-icon'}></div>EDIT DETAILS</button>}
                  </Col>
                  <Col md={'12'}>
                    <div className={'left-details'}>Name</div>
                    <div className={'right-details'}>{registerUserData ? registerUserData.FullName : ''}</div>
                  </Col>
                  <Col md={'12'}>
                    <div className={'left-details'}>Mobile No.</div>
                    <div className={'right-details'}>{registerUserData ? registerUserData.Mobile : ''}</div>
                  </Col>
                  {!this.props.RFQUser &&
                    <Col md={'12'}>
                      <div className={'left-details'}>Phone No.</div>
                      <div className={'right-details'}>{registerUserData ? registerUserData.PhoneNumber : ''}-{registerUserData ? registerUserData.Extension : ''}</div>
                    </Col>}
                </Row>
                <Row className="pt-3">
                  <Col md="12">
                    <HeaderTitle
                      title={'ID & Password:'}
                      customClass={''} />
                  </Col>
                  <Col md={'12'}>
                    <div className={'left-details'}>Email ID:</div>
                    <div className={'right-details'}>{registerUserData ? registerUserData.EmailAddress : ''}</div>
                  </Col>
                  {!IsLoginEmailConfigure && <Col md={'12'}>
                    <div className={'left-details'}>User Name</div>
                    <div className={'right-details'}>{registerUserData ? registerUserData.UserName : ''}</div>
                  </Col>}

                  {(UserId !== loggedInUserId()) &&
                    < Col md={'12'}>
                      <div className={'left-details'}>Password</div>
                      <div id="changePassword" className={'right-details'}>
                        {!EditAccessibility ? <span className='encrpt-pwd'>•••••••</span> : <span className='link'
                          onClick={() => this.props.editItemDetails(UserId, true)}
                        >Change Password</span>}
                      </div>
                    </Col>
                  }
                </Row>



                {!this.props.RFQUser &&
                  <>
                    <Row className="pt-3 drawer-table-sm">
                      <Col md="12">
                        <div className={'left-details'}>
                          <HeaderTitle
                            title={`Role & ${handleDepartmentHeader()}:`}
                            customClass={'role-department-details'} />
                        </div>
                        <div className={'right-details pt-2 role-department-container'}>
                          <div>{registerUserData ? registerUserData.RoleName : ''}</div>(<div title={departmentName} className="departments">{departmentName}</div>)
                          {/* <div
                        onClick={this.permissionToggle}
                        className={`${isPermissionOpen ? 'minus-icon' : 'plus-icon'} pull-right`}>
                      </div> */}
                        </div>
                      </Col>
                      {/* {isPermissionOpen &&
                    <Col md="12">
                      <Table className="table table-bordered table table-sm role-depatment" size="sm" >
                        <thead>
                          <tr>
                            <th>{`Module Name`}</th>
                            <th colSpan="7">{`Permission Granted`}</th>
                          </tr>
                        </thead>
                        <tbody >

                          {this.state.Modules && this.state.Modules.map((item, index) => {
                            if (item.IsChecked == false) return false;
                            return (
                              <tr key={index}>

                                <td colSpan="6" className={'Module-Name'} >{item.ModuleName}</td>

                                {this.renderAction(item.Pages, index)}
                              </tr>
                            )
                          })}
                          {this.state.Modules.length == 0 && <NoContentFound title={CONSTANT.EMPTY_DATA} />}

                        </tbody>
                      </Table>
                    </Col>} */}

                    </Row>

                    <Row className="pt-3 ">
                      <Col md="12">
                        <Row>
                          <Col md="10">
                            <HeaderTitle
                              title={'Costing Approval Level:'}
                              customClass={'technology-level-details'} />
                          </Col>
                          <Col md="2" className='text-right'>
                            <button id="costing_level" onClick={() => this.technologyToggle(COSTING)} className={`btn btn-small-primary-circle ml-1`}>{isTechnologyOpen ? (
                              <i className="fa fa-minus" ></i>
                            ) : (
                              <i className="fa fa-plus"></i>
                            )}</button>
                          </Col>
                        </Row>
                      </Col>
                      {isTechnologyOpen &&
                        <Col md="12">
                          <div className="row mb-0">
                            <Col md="12" className="mb-2">
                              <button type="button" className="user-btn" title="Reset Grid" onClick={() => this.resetState('gridOptionsTechnology')}>
                                <div className="refresh mr-0"></div>
                              </button>
                            </Col>
                            <div className="col-md-12">
                              <div className="ag-grid-react">
                                <div className={`ag-grid-wrapper height-width-wrapper min-height-auto p-relative ${this.state.TechnologyLevelGrid.length <= 0 ? 'overlay-contain' : ''}`}>
                                  <div className="ag-theme-material">
                                    <AgGridReact
                                      defaultColDef={defaultColDef}
                                      floatingFilter={true}
                                      pagination={true}
                                      paginationPageSize={10}
                                      onGridReady={params => this.onGridReady(params, 'technology')}
                                      domLayout='autoHeight'
                                      noRowsOverlayComponent={'customNoRowsOverlay'}
                                      gridOptions={gridOptionsTechnology}
                                      noRowsOverlayComponentParams={{
                                        title: EMPTY_DATA,
                                        imagClass: 'imagClass'
                                      }}
                                      rowData={this.state.TechnologyLevelGrid}
                                      frameworkComponents={{
                                        ...frameworkComponents,
                                      }}
                                      // onFilterModified={onFloatingFilterChanged}
                                      enableBrowserTooltips={true}
                                    >
                                      <AgGridColumn field="Technology" headerName={this.props.t('TechnologyLabel', { ns: 'MasterLabels', defaultValue: 'Technology' })} />
                                      <AgGridColumn field="ApprovalType" headerName="Approval Type" />
                                      <AgGridColumn field="Level" headerName="Level" />
                                    </AgGridReact>
                                    <PaginationWrapper
                                      gridApi={gridApiTechnology}
                                      setPage={newPageSize => this.onPageSizeChanged(gridApiTechnology, newPageSize)}
                                    />
                                  </div>
                                </div>
                              </div>

                            </div>
                          </div>
                        </Col>
                      }

                    </Row>
                    <Row className="pt-3 ">
                      <Col md="12">
                        <Row>
                          <Col md="10">
                            <HeaderTitle
                              title={'Simulation Approval Level:'}
                              customClass={'technology-level-details'} />
                          </Col>
                          <Col md="2" className='text-right'>
                            <button id="simulation_level" onClick={() => this.technologyToggle(SIMULATION)} className={`btn btn-small-primary-circle ml-1`}>{isSimulationOpen ? (
                              <i className="fa fa-minus" ></i>
                            ) : (
                              <i className="fa fa-plus"></i>
                            )}</button>
                          </Col>
                        </Row>
                      </Col>
                      {isSimulationOpen && <Col md="12">
                        <Row>
                          <Col md="12" className="mb-2">
                            <button type="button" className="user-btn" title="Reset Grid" onClick={() => this.resetState('gridOptionsSimulation')}>
                              <div className="refresh mr-0"></div>
                            </button>
                          </Col>
                          <Col md="12">

                            <div className="ag-grid-react">
                              <div className={`ag-grid-wrapper height-width-wrapper min-height-auto p-relative ${SimulationLevelGrid.length <= 0 ? 'overlay-contain' : ''}`}>
                                <div className="ag-theme-material">
                                  <AgGridReact
                                    defaultColDef={defaultColDef}
                                    floatingFilter={true}
                                    pagination={true}
                                    paginationPageSize={10}
                                    domLayout='autoHeight'
                                    onGridReady={params => this.onGridReady(params, "simulation")}
                                    gridOptions={gridOptionsSimulation}
                                    noRowsOverlayComponent="customNoRowsOverlay"
                                    noRowsOverlayComponentParams={{
                                      title: EMPTY_DATA,
                                      imagClass: 'imagClass'
                                    }}
                                    rowData={SimulationLevelGrid}
                                    frameworkComponents={{
                                      ...frameworkComponents,
                                    }}
                                  >
                                    <AgGridColumn field="Technology" headerName="Head" />
                                    <AgGridColumn field="ApprovalType" headerName="Approval Type" />
                                    <AgGridColumn field="Level" headerName="Level" />
                                  </AgGridReact>
                                  <PaginationWrapper
                                    gridApi={gridApiSimulation}
                                    setPage={newPageSize => this.onPageSizeChanged(gridApiSimulation, newPageSize)}
                                  />
                                </div>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </Col>}

                    </Row>
                    {getConfigurationKey().IsMasterApprovalAppliedConfigure &&
                      <Row className="pt-3 ">
                        <Col md="12">
                          <Row>
                            <Col md="10">
                              <HeaderTitle
                                title={'Master Approval Level:'}
                                customClass={'technology-level-details'} />
                            </Col>
                            <Col md="2" className='text-right'>
                              <button id="master_level" onClick={() => this.technologyToggle(MASTERS)} className={`btn btn-small-primary-circle ml-1`}>{isMasterOpen ? (
                                <i className="fa fa-minus" ></i>
                              ) : (
                                <i className="fa fa-plus"></i>
                              )}</button>
                            </Col>
                          </Row>
                        </Col>
                        {isMasterOpen && <Col md="12">

                          <Row>
                            <Col md="12" className="mb-2">
                              <button type="button" className="user-btn" title="Reset Grid" onClick={() => this.resetState('gridOptionsMaster')}>
                                <div className="refresh mr-0"></div>
                              </button>
                            </Col>
                            <Col md="12">
                              <div className="ag-grid-react">
                                <div className={`ag-grid-wrapper height-width-wrapper min-height-auto p-relative ${MasterLevelGrid.length <= 0 ? 'overlay-contain' : ''}`}>
                                  <div className="ag-theme-material">
                                    <AgGridReact
                                      defaultColDef={defaultColDef}
                                      floatingFilter={true}
                                      pagination={true}
                                      paginationPageSize={10}
                                      domLayout='autoHeight'
                                      onGridReady={params => this.onGridReady(params, "master")}
                                      gridOptions={gridOptionsMaster}
                                      noRowsOverlayComponent="customNoRowsOverlay"
                                      noRowsOverlayComponentParams={{
                                        title: EMPTY_DATA,
                                        imagClass: 'imagClass'
                                      }}
                                      rowData={MasterLevelGrid}
                                      frameworkComponents={{
                                        ...frameworkComponents,
                                      }}
                                    >
                                      <AgGridColumn field="Master" headerName="Master" />
                                      <AgGridColumn field="ApprovalType" headerName="Approval Type" />
                                      <AgGridColumn field="Level" headerName="Level" />
                                    </AgGridReact>
                                    <PaginationWrapper
                                      gridApi={gridApiMaster}
                                      setPage={newPageSize => this.onPageSizeChanged(gridApiMaster, newPageSize)}
                                    />
                                  </div>
                                </div>
                              </div>
                            </Col>
                          </Row>
                        </Col>}

                      </Row>}
                    {getConfigurationKey().IsShowOnboarding && <Row className="pt-3 ">
                      <Col md="12">
                        <Row>
                          <Col md="10">
                            <HeaderTitle
                              title={'Onboarding Approval Level:'}
                              customClass={'technology-level-details'} />
                          </Col>
                          <Col md="2" className='text-right'>
                            <button id="onboarding_level" onClick={() => this.technologyToggle(ONBOARDING)} className={`btn btn-small-primary-circle ml-1`}>{isOnboardingOpen ? (
                              <i className="fa fa-minus" ></i>
                            ) : (
                              <i className="fa fa-plus"></i>
                            )}</button>
                          </Col>
                        </Row>
                      </Col>
                      {isOnboardingOpen && <Col md="12">
                        <Row>
                          <Col md="12" className="mb-2">
                            <button type="button" className="user-btn" title="Reset Grid" onClick={() => this.resetState('gridOptionsOnboarding')}>
                              <div className="refresh mr-0"></div>
                            </button>
                          </Col>
                          <Col md="12">

                            <div className="ag-grid-react">
                              <div className={`ag-grid-wrapper height-width-wrapper min-height-auto p-relative ${OnboardingLevelGrid.length <= 0 ? 'overlay-contain' : ''}`}>
                                <div className="ag-theme-material">
                                  <AgGridReact
                                    defaultColDef={defaultColDef}
                                    floatingFilter={true}
                                    pagination={true}
                                    paginationPageSize={10}
                                    domLayout='autoHeight'
                                    onGridReady={params => this.onGridReady(params, "onboarding")}
                                    gridOptions={gridOptionsOnboarding}
                                    noRowsOverlayComponent="customNoRowsOverlay"
                                    noRowsOverlayComponentParams={{
                                      title: EMPTY_DATA,
                                      imagClass: 'imagClass'
                                    }}
                                    rowData={OnboardingLevelGrid}
                                    frameworkComponents={{
                                      ...frameworkComponents,
                                    }}
                                  >
                                    <AgGridColumn field="ApprovalType" headerName="Approval Type" />
                                    <AgGridColumn field="Level" headerName="Level" />
                                  </AgGridReact>
                                  <PaginationWrapper
                                    gridApi={gridApiOnboarding}
                                    setPage={newPageSize => this.onPageSizeChanged(gridApiOnboarding, newPageSize)}
                                  />
                                </div>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      </Col>}
                    </Row>}
                  </>
                }
                {/* <Row className="pt-3 drawer-table-sm">
                  <Col md="12">&nbsp;</Col>
                </Row> */}
              </div>
            </div>
          </Container>
        </Drawer>
      </ >
    );
  }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ auth }) {
  const { registerUserData, actionSelectList, loading } = auth;

  return { loading, registerUserData, actionSelectList, };
}


export default connect(mapStateToProps,
  {
    getUserDataAPI,
    getPermissionByUser,
    getActionHeadsSelectList,
    getUsersTechnologyLevelAPI,
    getUsersSimulationTechnologyLevelAPI,
    getUsersMasterLevelAPI,
    getUsersOnboardingLevelAPI
  })(withTranslation(['UserRegistration', 'MasterLabels'])(ViewUserDetails));
