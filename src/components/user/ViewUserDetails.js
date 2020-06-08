import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Row, Col, Button, Table } from 'reactstrap';
import {
  getUserDataAPI, getPermissionByUser, getActionHeadsSelectList,
  getUsersTechnologyLevelAPI,
} from "../../actions/auth/AuthActions";
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../config/message';
import { Loader } from '../common/Loader';
import { CONSTANT } from '../../helper/AllConastant';
import NoContentFound from '../common/NoContentFound';
import { makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import HeaderTitle from '../common/HeaderTitle';

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

  componentDidMount() {
    this.props.getUserDataAPI(this.props.UserId, (res) => {
      if (res && res.data && res.data.Data) {
      }
    })
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
        if (el.Text != item.ActionName || item.IsChecked == false) return false;
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
      const { isTechnologyOpen, isPermissionOpen } = this.state;
      if (isPermissionOpen == false) {
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
      const { isTechnologyOpen, isPermissionOpen } = this.state;
      if (isTechnologyOpen == false) {
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
    const { UserId } = this.props;
    const { isPermissionOpen, isTechnologyOpen } = this.state;
    return (
      <>
        {this.props.loading && <Loader />}
        <Drawer anchor={this.props.anchor} open={this.props.isOpen} onClose={(e) => this.toggleDrawer(e)}>
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
                    <button
                      className={'user-btn'}
                      onClick={() => this.props.editItemDetails(UserId)}
                      type="button"><div className={'edit-icon'}></div>EDIT DETAILS</button>
                  </Col>
                  <Col md={'12'}>
                    <div className={'left-details'}>Name</div>
                    <div className={'right-details'}>Dheeraj Solanki</div>
                  </Col>
                  <Col md={'12'}>
                    <div className={'left-details'}>Mobile No.</div>
                    <div className={'right-details'}>8888899999</div>
                  </Col>
                  <Col md={'12'}>
                    <div className={'left-details'}>Phone No.-Ext:</div>
                    <div className={'right-details'}>0731 257 8888-89</div>
                  </Col>
                </Row>
                <Row className="mt-15">
                  <Col md="12">
                    <HeaderTitle
                      title={'ID & Password:'}
                      customClass={''} />
                  </Col>
                  <Col md={'12'}>
                    <div className={'left-details'}>Email ID:</div>
                    <div className={'right-details'}>dheeraj.solanki@gmail.com</div>
                  </Col>
                  <Col md={'12'}>
                    <div className={'left-details'}>User Name</div>
                    <div className={'right-details'}>dheeraj.solanki</div>
                  </Col>
                  <Col md={'12'}>
                    <div className={'left-details'}>Password</div>
                    <div className={'right-details'}><a href="javascript:void(0)">Change Password</a></div>
                  </Col>
                </Row>
                <Row className="mt-15">
                  <Col md="12">
                    <div className={'left-details'}>
                      <HeaderTitle
                        title={'Address:'}
                        customClass={'Header-address'} />
                    </div>
                    <div className={'right-details'}>
                      {`206-207, Bansi Trade Centre, Mahatma Gandhi road, Indore, 
                                        Madhya Pradesh ,452015`}
                    </div>
                  </Col>
                </Row>
                <Row className="mt-15 grant-user-grid drawer-table-sm">
                  <Col md="12">
                    <div className={'left-details'}>
                      <HeaderTitle
                        title={'Role & Department:'}
                        customClass={'role-department-details'} />
                    </div>
                    <div className={'right-details'}>
                      {`Executive (Administration)`}
                      <div
                        onClick={this.permissionToggle}
                        className={`${isPermissionOpen ? 'minus-icon' : 'plus-icon'} pull-right`}></div>
                    </div>
                  </Col>
                  {isPermissionOpen &&
                    <Col md="12">
                      <Table className="table table-bordered table table-sm" size="sm" >
                        <thead>
                          <tr>
                            <th>{`Module Name`}</th>
                            <th colSpan="5">{`Permission Granted`}</th>
                          </tr>
                        </thead>
                        <tbody >
                          {this.state.Modules && this.state.Modules.map((item, index) => {
                            if (item.IsChecked == false) return false;
                            return (
                              <tr key={index}>

                                <td className={'Module-Name'} >{item.ModuleName}</td>

                                {this.renderAction(item.Actions, index)}
                              </tr>
                            )
                          })}
                          {this.state.Modules.length == 0 && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                        </tbody>
                      </Table>
                    </Col>}

                </Row>

                <Row className="mt-15 grant-user-grid ">
                  <Col md="12">
                    <div className={'left-details'}>
                      <HeaderTitle
                        title={'Technology & Level:'}
                        customClass={'technology-level-details'} />
                    </div>
                    <div className={'right-details'}>
                      <div
                        onClick={this.technologyToggle}
                        className={`${isTechnologyOpen ? 'minus-icon' : 'plus-icon'} pull-right`}></div>
                    </div>
                  </Col>
                  {isTechnologyOpen &&
                    <Col md="12">
                      <Table className="table table-bordered table table-sm" size="sm" >
                        <thead>
                          <tr>
                            <th className="text-left" style={{ width: "36%" }}>{`Technology`}</th>
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
                        {this.state.TechnologyLevelGrid.length == 0 && <NoContentFound title={CONSTANT.EMPTY_DATA} />}

                      </Table>
                    </Col>}

                </Row>
                <Row className="mt-15 grant-user-grid drawer-table-sm">
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

