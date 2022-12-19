import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Table } from 'reactstrap';
import { getUserDataAPI, getPermissionByUser, getActionHeadsSelectList, getUsersTechnologyLevelAPI, getUsersSimulationTechnologyLevelAPI, getUsersMasterLevelAPI } from "../../actions/auth/AuthActions";
import { Loader } from '../common/Loader';
import { EMPTY_DATA } from '../../config/constants'
import NoContentFound from '../common/NoContentFound';
import Drawer from '@material-ui/core/Drawer';
import HeaderTitle from '../common/HeaderTitle';
import { loggedInUserId, getConfigurationKey } from '../../helper/auth';
import LoaderCustom from '../common/LoaderCustom';
import { COSTING, SIMULATION, MASTERS } from '../../config/constants'

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
      MasterLevelGrid: []
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
    this.props.getUsersTechnologyLevelAPI(UserId, (res) => {
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
    this.props.getUsersSimulationTechnologyLevelAPI(UserId, (res) => {
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
    this.props.getUsersMasterLevelAPI(UserId, (res) => {
      if (res && res.data && res.data.Data) {
        let Data = res.data.Data;
        let masterLevel = Data.MasterLevels;
        this.setState({
          MasterLevelGrid: masterLevel,
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
    const { isTechnologyOpen, isSimulationOpen, isMasterOpen } = this.state;
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
      default:
        break;
    }
  }


  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { UserId, registerUserData, EditAccessibility, IsLoginEmailConfigure } = this.props;
    const { isTechnologyOpen, department, isMasterOpen, isSimulationOpen } = this.state;

    const departmentName = department ? department.join(", ") : '-';
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
                    <h3>{`User Details`}</h3>
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
                      <div className={'right-details'}>
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
                            title={'Role & Department:'}
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
                            <button onClick={() => this.technologyToggle(COSTING)} className={`btn btn-small-primary-circle ml-1`}>{isTechnologyOpen ? (
                              <i className="fa fa-minus" ></i>
                            ) : (
                              <i className="fa fa-plus"></i>
                            )}</button>
                          </Col>
                        </Row>
                      </Col>
                      {isTechnologyOpen &&
                        <Col md="12">
                          <Table className="table border table table-sm" size="sm" >
                            <thead>
                              <tr>
                                <th className="text-left" >{`Technology`}</th>
                                <th className="text-left">{`Level`}</th>
                              </tr>
                            </thead>
                            <tbody >
                              {
                                this.state.TechnologyLevelGrid &&
                                this.state.TechnologyLevelGrid.map((item, index) => {
                                  return (
                                    <tr key={index}>
                                      <td>{item.Technology}</td>
                                      <td>{item.Level}</td>
                                    </tr>
                                  )
                                })
                              }
                            </tbody>
                          </Table>
                          {this.state.TechnologyLevelGrid.length === 0 && <NoContentFound title={EMPTY_DATA} />}
                        </Col>}

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
                            <button onClick={() => this.technologyToggle(SIMULATION)} className={`btn btn-small-primary-circle ml-1`}>{isSimulationOpen ? (
                              <i className="fa fa-minus" ></i>
                            ) : (
                              <i className="fa fa-plus"></i>
                            )}</button>
                          </Col>
                        </Row>
                      </Col>
                      {isSimulationOpen && <Col md="12">
                        <Table className="table border table table-sm" size="sm" >
                          <thead>
                            <tr>
                              <th className="text-left" >{`Technology`}</th>
                              <th className="text-left">{`Level`}</th>
                            </tr>
                          </thead>
                          <tbody >
                            {
                              this.state.SimulationLevelGrid &&
                              this.state.SimulationLevelGrid.map((item, index) => {
                                return (
                                  <tr key={index}>
                                    <td>{item.Technology}</td>
                                    <td>{item.Level}</td>
                                  </tr>
                                )
                              })
                            }
                          </tbody>
                        </Table>
                        {this.state.SimulationLevelGrid.length === 0 && <NoContentFound title={EMPTY_DATA} />}
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
                              <button onClick={() => this.technologyToggle(MASTERS)} className={`btn btn-small-primary-circle ml-1`}>{isMasterOpen ? (
                                <i className="fa fa-minus" ></i>
                              ) : (
                                <i className="fa fa-plus"></i>
                              )}</button>
                              {/* <a
                          onClick={() => this.technologyToggle("Master")}
                          className={`${isSimulationOpen ? 'minus-icon' : 'plus-icon'} pull-right`}></a> */}
                            </Col>
                          </Row>
                        </Col>
                        {isMasterOpen && <Col md="12">
                          <Table className="table border table table-sm" size="sm" >
                            <thead>
                              <tr>
                                <th className="text-left" >{`Technology`}</th>
                                <th className="text-left">{`Level`}</th>
                              </tr>
                            </thead>
                            <tbody >
                              {
                                this.state.MasterLevelGrid &&
                                this.state.MasterLevelGrid.map((item, index) => {
                                  return (
                                    <tr key={index}>
                                      <td>{item.Master}</td>
                                      <td>{item.Level}</td>
                                    </tr>
                                  )
                                })
                              }
                            </tbody>
                          </Table>
                          {this.state.MasterLevelGrid.length === 0 && <NoContentFound title={EMPTY_DATA} />}
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
    getUsersMasterLevelAPI
  })(ViewUserDetails);

