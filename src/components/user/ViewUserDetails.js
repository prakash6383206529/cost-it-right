import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Table } from 'reactstrap';
import { getUserDataAPI, getPermissionByUser, getActionHeadsSelectList, getUsersTechnologyLevelAPI, } from "../../actions/auth/AuthActions";
import { Loader } from '../common/Loader';
import { CONSTANT } from '../../helper/AllConastant';
import NoContentFound from '../common/NoContentFound';
import Drawer from '@material-ui/core/Drawer';
import HeaderTitle from '../common/HeaderTitle';
import { loggedInUserId } from '../../helper/auth';

class ViewUserDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditFlag: false,
      isPermissionOpen: true,
      isTechnologyOpen: false,
      Modules: [],
      TechnologyLevelGrid: [],
    }
  }

  UNSAFE_componentWillMount() {
    this.props.getUserDataAPI(this.props.UserId, (res) => {
      if (res && res.data && res.data.Data) { }
    })
  }

  componentDidMount() {

    this.props.getActionHeadsSelectList(() => { })
    this.getUserPermission(this.props.UserId)
    this.getUsersTechnologyLevelData(this.props.UserId)
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
  technologyToggle = () => {
    this.setState({
      isTechnologyOpen: !this.state.isTechnologyOpen,
    }, () => {
      const { isTechnologyOpen, } = this.state;
      if (isTechnologyOpen === false) {
        this.setState({ isPermissionOpen: true })
      } else {
        this.setState({ isPermissionOpen: false })
      }
    })
  }


  /**
  * @method render
  * @description Renders the component
  */
  render() {
    const { UserId, registerUserData, EditAccessibility, IsLoginEmailConfigure } = this.props;
    const { isTechnologyOpen } = this.state;

    const address = registerUserData ? `${registerUserData.AddressLine1 ? registerUserData.AddressLine1 : "NA"}, ${registerUserData.AddressLine2 ? registerUserData.AddressLine2 : "NA"}, 
    ${registerUserData.CityName ? registerUserData.CityName : "NA"},  ${registerUserData.ZipCode ? registerUserData.ZipCode : "NA"}` : '';

    return (
      <>
        {this.props.loading && <Loader />}
        <Drawer className="user-detail" anchor={this.props.anchor} open={this.props.isOpen}
        // onClose={(e) => this.toggleDrawer(e)}
        >
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
                  <Col md={'12'}>
                    <div className={'left-details'}>Phone No.</div>
                    <div className={'right-details'}>{registerUserData ? registerUserData.PhoneNumber : ''}-{registerUserData ? registerUserData.Extension : ''}</div>
                  </Col>
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
                  <Col md={'12'}>
                    <div className={'left-details'}>Password</div>
                    <div className={'right-details'}>
                      <a
                        href="javascript:void(0)"
                        onClick={() => this.props.editItemDetails(UserId, true)}
                      >Change Password</a></div>
                  </Col>
                </Row>
                <Row className="pt-3">
                  <Col md="12">
                    <div className={'left-details'}>
                      <HeaderTitle
                        title={'Address:'}
                        customClass={'Header-address'} />
                    </div>
                    <div className={'right-details'}>{address}</div>
                  </Col>
                </Row>
                <Row className="pt-3 drawer-table-sm">
                  <Col md="12">
                    <div className={'left-details'}>
                      <HeaderTitle
                        title={'Role & Company:'}
                        customClass={'role-department-details'} />
                    </div>
                    <div className={'right-details'}>
                      {`${registerUserData ? registerUserData.RoleName : ''} (${registerUserData ? registerUserData.DepartmentName : ''})`}
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
                    <div className={'left-details'}>
                      <HeaderTitle
                        title={'Technology & Level:'}
                        customClass={'technology-level-details'} />
                    </div>
                    <div className={'right-details'}>
                      <a
                        onClick={this.technologyToggle}
                        className={`${isTechnologyOpen ? 'minus-icon' : 'plus-icon'} pull-right`}></a>
                    </div>
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
                      {this.state.TechnologyLevelGrid.length === 0 && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                    </Col>}

                </Row>
                <Row className="pt-3 drawer-table-sm">
                  <Col md="12">&nbsp;</Col>
                </Row>
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
  })(ViewUserDetails);

