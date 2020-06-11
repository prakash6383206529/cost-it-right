import React, { Component } from "react";
import { connect } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";
import {
  Collapse, Navbar, NavbarToggler, Nav, NavItem, NavLink, Dropdown, DropdownToggle,
  DropdownItem, DropdownMenu
} from "reactstrap";
import { isUserLoggedIn, userDetails, loggedInUserId } from '../../helper/auth';
import { logoutUserAPI, getMenuByUser, getModuleSelectList } from '../../actions';
import "./NavBar.scss";

class SideBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      menu: false,
      dropdownOpen: false,
      isOpen: false,
      isRedirect: false,
    };
  }

  /**
  * @method componentDidMount
  * @description used to called after mounting component
  */
  componentDidMount() {
    const loginUserId = loggedInUserId();
    this.props.getModuleSelectList(() => { })
    if (loginUserId != null) {
      this.props.getMenuByUser(loginUserId, () => { })
    }
  }

  /**
   * @method toggleMenue
   * @description Toggle the visibility of sidebar menue.
   */
  toggleMenue = () => {
    this.setState({ menu: !this.state.menu });
  };

  /**
   * @method logout
   * @description logout
   */
  logout = (e) => {
    const { userData } = this.props;
    e.preventDefault();
    let requestData = {
      AccessToken: userData.Token,
      UserId: userData.LoggedInUserId,
    }
    const toastrConfirmOptions = {
      onOk: () => {
        this.props.logoutUserAPI(requestData, () => this.props.logUserOut())
        //this.props.logUserOut();
      },
      onCancel: () => console.log('CANCEL: clicked')
    };

    return toastr.confirm(`Are you sure do you want to logout?`, toastrConfirmOptions);
  };

  /** 
  * @method user toggle
  */
  toggle = () => {
    this.setState(prevState => ({
      dropdownOpen: !prevState.dropdownOpen
    }));
  }

  /** 
  * @method mobile menu open
  */
  toggleMobile = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }

  /**
  * @method renderMenus
  * @description Render menus according to user access.
  */
  renderMenus = (module) => {
    switch (module) {
      case 'Dashboard':
        return this.renderDashboard(module);
      case 'MassUpload':
        return this.renderMassUpload(module);
      case 'Master':
        return this.renderMaster(module);
      case 'Report And Analytics':
        return this.renderReportAnalytics(module);
      case 'Technology':
        return this.renderTechnology(module);
      case 'Simulation':
        return this.renderSimulation(module);
      case 'Users':
        return this.renderUser(module);
      // case 'Privilege Permission':
      //   return this.renderPrivilege(module);
      case 'AuditLog':
        return this.renderAuditLog(module);
      default:
        return null;
    }
  }

  /**
  * @method renderDashboard
  * @description Render dashboard menu.
  */
  renderDashboard = (module) => {
    const { menusData } = this.props;
    return (
      menusData && menusData.map((el, i) => {
        if (el.ModuleName == module) {
          return (
            <a className="nav-link active" href="/">
              <img className="" src={require('../../assests/images/sydney-opera-house.svg')} alt='sydney-opera-house' />
              <span>{module}</span>
            </a>
          )
        }
        return null;
      })
    )
  }

  /**
  * @method renderMassUpload
  * @description Render mass upload menu.
  */
  // renderMassUpload = () => {
  //   return (
  //     <li className="nav-item dropdown">
  //       <a className="nav-link " href="/mass-upload" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Mass Upload</a>
  //     </li>
  //   )
  // }

  /**
  * @method renderMaster
  * @description Render master menu.
  */
  renderMaster = (module) => {

    const { menusData } = this.props;
    return (
      menusData && menusData.map((el, i) => {
        if (el.ModuleName == module) {
          return (<>
            <a className="nav-link" href="/plant-master">
              <img className="" src={require('../../assests/images/list.svg')} alt='List' /><span>Masters</span>
            </a>
            <a className="nav-link additional-masters" href="/operation-master">
              <img className="" src={require('../../assests/images/list-add.png')} alt='List' /><span>Additional Masters</span>
            </a>
            {/* <a className="dropdown-item" href="/material-master">Raw Material Detail Master</a> */}
            {/* <a className="dropdown-item" href="/PartMasterOld">Part</a> */}
          </>)
        }
        return null;
      })
    )
  }

  /**
  * @method renderReportAnalytics
  * @description Render Report & Analytics menu.
  */
  renderReportAnalytics = (module) => {

    const { menusData } = this.props;
    return (
      menusData && menusData.map((el, i) => {
        if (el.ModuleName == module) {
          return (
            <a className="nav-link" href="/report-analytics">
              <img className="" src={require('../../assests/images/chart.svg')} alt='chart' />
              <span>Report</span>
            </a>
          )
        }
        return null;
      })
    )
  }

  /**
  * @method renderTechnology
  * @description Render Technology menu.
  */
  renderTechnology = (module) => {
    const { menusData } = this.props;
    return (
      menusData && menusData.map((el, i) => {
        if (el.ModuleName == module) {
          return (
            <a className="nav-link" href="/costing">
              <img className="" src={require('../../assests/images/html.svg')} alt='html' />
              <span>Costing</span>
            </a>
          )
        }
        return null;
      })
    )
  }

  /**
  * @method renderSimulation
  * @description Render Simulation.
  */
  renderSimulation = (module) => {
    const { menusData } = this.props;
    return (
      menusData && menusData.map((el, i) => {
        if (el.ModuleName == module) {
          return (
            <a className="nav-link" href="/simulation">
              <img className="" src={require('../../assests/images/imac.svg')} alt='imac' />
              <span>Simulation</span>
            </a>
          )
        }
        return null;
      })
    )
  }

  /**
  * @method renderUser
  * @description Render User menu.
  */
  renderUser = (module) => {
    const { menusData } = this.props;
    return (
      menusData && menusData.map((el, i) => {
        if (el.ModuleName == module) {
          return (
            <a className="nav-link" href="/user">
              <img className="" src={require('../../assests/images/men.svg')} alt='men' />
              <span>Users</span>
            </a>
          )
        }
        return null;
      })
    )
  }

  /**
  * @method renderPrivilege
  * @description Render User menu.
  */
  renderPrivilege = (module) => {
    const { menusData } = this.props;
    return (
      menusData && menusData.map((el, i) => {
        if (el.ModuleName == module) {
          return (
            <li className="nav-item dropdown">
              <a className="nav-link " href="/privilege" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Privilege</a>
            </li>
          )
        }
        return null;
      })
    )
  }

  /**
  * @method renderAuditLog
  * @description Render User menu.
  */
  renderAuditLog = (module) => {
    const { menusData } = this.props;
    return (
      menusData && menusData.map((el, i) => {
        if (el.ModuleName == module) {
          return (
            <a className="nav-link" href="/auditlog">
              <img className="" src={require('../../assests/images/men.svg')} alt='men' />
              <span>Audit Log</span>
            </a>
          )
        }
        return null;
      })
    )
  }

  render() {
    const { userData, menusData, moduleSelectList } = this.props;
    const isLoggedIn = isUserLoggedIn();
    return (
      <nav>
        <div>
          <div className="flex-conatiner sign-social ">
            <NavbarToggler className="navbar-light" onClick={this.toggleMobile} />
          </div>
          <div>
            <nav className="navbar navbar-expand-lg fixed-top nav bg-light">
              <a href="javaScript:Void(0);" className="navbar-brand mr-auto mr-lg-0">
                <img src={require('../../assests/images/logo.png')} alt='Cost It Rights' height="30" />
              </a>
              <button className="navbar-toggler p-0 border-0" type="button" data-toggle="offcanvas">
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="navbar-collapse offcanvas-collapse" id="navbarsExampleDefault">
                <ul className="navbar-nav ml-auto">
                  <li className="nav-item active d-xl-inline-block">
                    <div className="dropdown">
                      <a className="dropdown-toggle nav-link bell" href="#" role="button" id="dropdownMenuLink" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                        <i className="fa fa-bell" aria-hidden="true"></i>
                        <span className="count">2</span>
                      </a>
                      <div className="dropdown-menu preview-list" aria-labelledby="dropdownMenuLink">
                        <a className="dropdown-item py-3">
                          <p className="mb-0 font-weight-medium float-left">You have 7 unread mails </p>
                          <span className="badge badge-pill badge-primary float-right">View all</span>
                        </a>
                        <a className="dropdown-item preview-item">
                          <div className="preview-thumbnail">
                            <img src="../../assests/images/user-pic.png" alt="image" className="img-sm profile-pic" /> </div>
                          <div className="preview-item-content flex-grow py-2">
                            <p className="preview-subject ellipsis font-weight-medium text-dark">Marian Garner </p>
                            <p className="font-weight-light small-text"> The meeting is cancelled </p>
                          </div>
                        </a>
                      </div>
                    </div>
                  </li>
                  <li className="nav-item d-xl-inline-block">
                    <a className="nav-link" href="#"><i className="fa fa-cog" aria-hidden="true"></i></a>
                  </li>
                  <li className="nav-item d-xl-inline-block">
                    <a className="nav-link" href="#"><i className="fa fa-question-circle" aria-hidden="true"></i>
                    </a>
                  </li>
                  <li className="nav-item d-xl-inline-block">
                    <div className="nav-link-user">
                      <Nav className="ml-auto top-menu logout d-inline-flex">
                        <Dropdown isOpen={this.state.dropdownOpen} toggle={this.toggle}>
                          <DropdownToggle caret>
                            <img className="img-xs rounded-circle" src={require('../../assests/images/user-pic.png')} alt='Cost It Rights' />
                            {isLoggedIn ? userData.Name : 'Login'}
                          </DropdownToggle>
                          <DropdownMenu>
                            {!isLoggedIn && <DropdownItem header>
                              <Link className="bell-notifcation-icon" to="/login">
                                Login
                          </Link>
                            </DropdownItem>}
                            {isLoggedIn && <DropdownItem tag="a" href="javascript:void(0)" onClick={this.logout}>Logout</DropdownItem>}
                          </DropdownMenu>
                        </Dropdown>
                        <NavbarToggler className="navbar-light float-right" onClick={this.toggleMobile} />
                      </Nav>
                    </div>

                  </li>
                </ul>
              </div>
            </nav>
          </div>

          {isLoggedIn &&
            <div className="nav-scroller bg-white shadow-sm header-secondry w100">
              <nav className="nav nav-underline">
                {moduleSelectList && moduleSelectList.map((item, index) => {
                  return this.renderMenus(item.Text)
                })}
              </nav>
            </div>}
        </div>
      </nav>
    );
  }
}

/**
 * @name mapStateToProps
 * @desc map state containing organisation details from the api to props
 * @return object{}
 */
function mapStateToProps({ auth }) {
  const { userData, menusData, moduleSelectList } = auth
  return { userData, menusData, moduleSelectList }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(
  mapStateToProps, {
  logoutUserAPI,
  getMenuByUser,
  getModuleSelectList,
}
)(SideBar);
