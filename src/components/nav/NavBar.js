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
      case 'Users':
        return this.renderUser(module);
      case 'Privilege Permission':
        return this.renderPrivilege(module);
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
            <li className="nav-item dropdown">
              <a className="nav-link " href="/" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Dashboard</a>
            </li>
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
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Masters</a>
              <div className="dropdown-menu" aria-labelledby="navbarDropdown">
                <a className="dropdown-item" href="/plant-master">Plant</a>
                <a className="dropdown-item" href="/supplier-master">Supplier</a>
                <a className="dropdown-item" href="/raw-material-master">Raw Material</a>
                {/* <a className="dropdown-item" href="/material-master">Raw Material Detail Master</a> */}
                {/* <a className="dropdown-item" href="/PartMasterOld">Part</a> */}
                <a className="dropdown-item" href="/PartMaster">Part</a>
                <a className="dropdown-item" href="/bom-master">BOM Master Old</a>
                <a className="dropdown-item" href="/part-bom-register">Bill Of Material</a>
                <a className="dropdown-item" href="/bop-master">Bought Out Parts</a>
                <a className="dropdown-item" href="/other-operation">Other Operation</a>
                <a className="dropdown-item" href="/ced-other-operation">CED Other Operation</a>
                <a className="dropdown-item" href="/mhr-master">Machine Rate</a>
                <a className="dropdown-item" href="/machine-type-master">Machine Type</a>
                <a className="dropdown-item" href="/machine-master">Machine</a>
                <a className="dropdown-item" href="/power-master">Power</a>
              </div>
            </li>

            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown1" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Additional Masters</a>
              <div className="dropdown-menu" aria-labelledby="navbarDropdown1">
                <a className="dropdown-item" href="/operation-master">Process Operation</a>
                <a className="dropdown-item" href='/UOMMaster'>UOM</a>
                <a className="dropdown-item" href='/category-master'>Category</a>
                <a className="dropdown-item" href="/freight-master">Freight</a>
                <a className="dropdown-item" href="/labour-master">Labour</a>
                <a className="dropdown-item" href="/overhead-profit-master">Overhead and Profit</a>
                <a className="dropdown-item" href="/depreciation-master">Depreciation</a>
                <a className="dropdown-item" href="/process-master">Process MHR</a>
                <a className="dropdown-item" href="/interest-rate-master">Interest Rate</a>
                <a className="dropdown-item" href="/fuel-master">Fuel</a>
                <a className="dropdown-item" href="/reason-master">Reason</a>
              </div>
            </li>
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
          return (<li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Report</a>
            <div className="dropdown-menu" aria-labelledby="navbarDropdown">
              <a className="dropdown-item" href='#'>Contribution Report</a>
            </div>
          </li>)
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
          return (<li className="nav-item dropdown">
            <a className="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Technology</a>
            <div className="dropdown-menu" aria-labelledby="navbarDropdown">
              <a className="dropdown-item" href='/costing'>Sheet metal</a>
            </div>
          </li>)
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
            <li className="nav-item dropdown">
              <a className="nav-link " href="/user" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">User</a>
            </li>
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
            <li className="nav-item dropdown">
              <a className="nav-link " href="/audit-log" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Audit Log</a>
            </li>
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
          <div className="nav-scroller bg-white shadow-sm header-secondry">
            <nav className="nav nav-underline">
              <a className="nav-link active" href="#">
                <img className="" src={require('../../assests/images/sydney-opera-house.svg')} alt='sydney-opera-house' /><span>Dashboard</span></a>
              <a className="nav-link" href="#">
                <img className="" src={require('../../assests/images/list.svg')} alt='List' /><span>Masters</span>
              </a>
              <a className="nav-link additional-masters" href="#">
                <img className="" src={require('../../assests/images/list-add.png')} alt='List' /><span>Additional Masters</span></a>
              <a className="nav-link" href="#">
                <img className="" src={require('../../assests/images/chart.svg')} alt='chart' />
                <span>Report</span>
              </a>
              <a className="nav-link" href="#">
                <img className="" src={require('../../assests/images/imac.svg')} alt='imac' />
                <span>Simulation</span></a>
              <a className="nav-link" href="#">
                <img className="" src={require('../../assests/images/html.svg')} alt='html' />
                <span>Technology</span></a>
              <a className="nav-link" href="#">
                <img className="" src={require('../../assests/images/men.svg')} alt='men' />
                <span>Users</span></a>
            </nav>
          </div>
        </div>

        <Navbar className="menu-bottom-list " expand="md" style={{ display: "none" }}>

          {isLoggedIn &&
            <Collapse isOpen={this.state.isOpen} navbar>
              <Nav className="ml-auto menu-list">

                {moduleSelectList && moduleSelectList.map((item, index) => {
                  return (
                    this.renderMenus(item.Text)
                  )
                })}
                <li className="nav-item dropdown">
                  <a className="nav-link " href="/mass-upload" id="navbarDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">Mass Upload</a>
                </li>
              </Nav>
            </Collapse>}
        </Navbar>
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
