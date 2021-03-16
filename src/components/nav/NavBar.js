import React, { Component } from "react";
import { connect } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link, Redirect, } from "react-router-dom";
import { NavbarToggler, Nav, Dropdown, DropdownToggle, DropdownItem, DropdownMenu } from "reactstrap";
import { reactLocalStorage } from 'reactjs-localstorage';
import { isUserLoggedIn, loggedInUserId } from '../../helper/auth';
import {
  logoutUserAPI, getMenuByUser, getModuleSelectList, getLeftMenu, getPermissionByUser, getModuleIdByPathName,
} from '../../actions/auth/AuthActions';
import "./NavBar.scss";
import { Loader } from "../common/Loader";
import ConfirmComponent from "../../helper/ConfirmComponent"

class SideBar extends Component {
  constructor(props) {
    super(props)
    this.state = {
      menu: false,
      dropdownOpen: false,
      isOpen: false,
      isRedirect: false,
      isLoader: false,
      isLeftMenuRendered: false,
    };
  }

  UNSAFE_componentWillMount() {
    const { location } = this.props;
    console.log(location, "Location");
    this.setState({ isLoader: true });
    if (location && location !== undefined) {
      this.props.getModuleIdByPathName(location.pathname, (res) => {
        this.setLeftMenu(res.data.Data.ModuleId);
        this.setState({ isLoader: false });
      });
    }

    const loginUserId = loggedInUserId();
    this.props.getModuleSelectList(() => { });
    if (loginUserId != null) {
      this.props.getMenuByUser(loginUserId, () => {
        this.setState({ isLoader: false });
      });
    }

  }


  /**
   * @method componentDidMount
   * @description used to called after mounting component
   */
  componentDidMount() { }

  /**
   * @method toggleMenue
   * @description Toggle the visibility of sidebar menue.
   */
  toggleMenue = () => {
    this.setState({ menu: !this.state.menu })
  }

  /**
   * @method logout
   * @description logout
   */
  logout = (e) => {
    const { userData } = this.props
    e.preventDefault()
    let requestData = {
      AccessToken: userData.Token,
      UserId: userData.LoggedInUserId,
    };
    const toastrConfirmOptions = {
      onOk: () => {
        this.props.logoutUserAPI(requestData, () => this.props.logUserOut());
        //this.props.logUserOut();
      },
      onCancel: () => console.log("CANCEL: clicked"),
      component: () => <ConfirmComponent />
    };

    return toastr.confirm(`Are you sure do you want to logout?`, toastrConfirmOptions);
  };

  /**
   * @method user toggle
   */
  toggle = () => {
    this.setState((prevState) => ({
      dropdownOpen: !prevState.dropdownOpen,
    }));
  };

  /**
   * @method mobile menu open
   */
  toggleMobile = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };

  /**
   * @method renderMenus
   * @description Render menus according to user access.
   */
  renderMenus = (module) => {
    switch (module) {
      case "Dashboard":
        return this.renderDashboard(module);
      case "Master":
        return this.renderMaster(module);
      case "Additional Masters":
        return this.renderAdditionalMaster(module);
      case "Costing":
        return this.renderCosting(module);
      case "Simulation":
        return this.renderSimulation(module);
      case "Reports And Analytics":
        return this.renderReportAnalytics(module);
      case "Users":
        return this.renderUser(module);
      case "Audit":
        return this.renderAudit(module);
      default:
        return null
    }
  };

  /**
   * @method setLeftMenu
   * @description Used to set left menu and Redirect to first menu.
   */
  setLeftMenu = (ModuleId) => {
    reactLocalStorage.set("ModuleId", ModuleId);
    this.props.getLeftMenu(ModuleId, loggedInUserId(), (res) => {
      console.log(res, "RESSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSS");
      const { location } = this.props;
      this.setState({ isLeftMenuRendered: true });
      // if (location && location.state) {
      //   this.setState({ activeURL: location.pathname })
      // }
    });
  };

  /**
   * @method renderDashboard
   * @description Render dashboard menu.
   */
  renderDashboard = (module) => {
    const { menusData } = this.props
    return (
      menusData &&
      menusData.map((el, i) => {
        if (el.ModuleName === module) {
          return (
            <Link
              className={`nav-link ${reactLocalStorage.get("ModuleId") === el.ModuleId ? 'IsActive' : ''}`}
              onClick={() => this.setLeftMenu(el.ModuleId)}
              to={{
                pathname: "/",
                state: {
                  ModuleId: el.ModuleId,
                  PageName: "Dashboard",
                  PageURL: "/",
                },
              }}
              key={i}
            >
              <img
                className=""
                src={`${reactLocalStorage.get("ModuleId") === el.ModuleId ? (require("../../assests/images/home-active.svg")) : (require("../../assests/images/homeicon.svg"))}`}
                alt={module + " icon"}
              />
              <span>{module}</span>
            </Link>
          );
        }
        return null
      })
    );
  };

  /**
   * @method renderMaster
   * @description Render master menu.
   */
  renderMaster = (module) => {
    const { menusData } = this.props
    console.log(menusData, "MENU DATA")
    return (
      menusData &&
      menusData.map((el, i) => {
        if (el.ModuleName === module) {
          return (
            <>
              <Link
                className={`nav-link ${reactLocalStorage.get("ModuleId") === el.ModuleId ? 'IsActive' : ''}`}
                onClick={() => this.setLeftMenu(el.ModuleId)}
                to={{
                  pathname: el.LandingPageURL,
                  state: {
                    ModuleId: el.ModuleId,
                    PageName: "Masters",
                    PageURL: el.LandingPageURL,
                  },
                }}
                key={i}
              >
                <img
                  className=""
                  src={reactLocalStorage.get("ModuleId") === el.ModuleId ? require("../../assests/images/masters-active.svg") : require("../../assests/images/list.svg")}
                  alt={module + " icon"}
                />
                <span>Masters</span>
              </Link>
            </>
          );
        }
        return null
      })
    );
  };

  /**
   * @method renderAdditionalMaster
   * @description Render Addtional master menu.
   */
  renderAdditionalMaster = (module) => {
    const { menusData } = this.props
    return (
      menusData &&
      menusData.map((el, i) => {
        if (el.ModuleName === module) {
          return (
            <>
              <Link
                key={i}
                className={`nav-link additional-masters ${reactLocalStorage.get("ModuleId") === el.ModuleId ? 'IsActive' : ''}`}
                onClick={() => this.setLeftMenu(el.ModuleId)}
                to={{
                  pathname: el.LandingPageURL,
                  state: {
                    ModuleId: el.ModuleId,
                    PageName: "Additional Masters",
                    PageURL: el.LandingPageURL,
                  },
                }}
              >
                <img
                  className=""
                  src={reactLocalStorage.get("ModuleId") === el.ModuleId ? (require("../../assests/images/aa-master-active.svg")) : (require("../../assests/images/list-add.png"))}
                  alt={module + " icon"}
                />
                <span>Additional Masters</span>
              </Link>
            </>
          );
        }
        return null
      })
    );
  };

  /**
   * @method renderReportAnalytics
   * @description Render Report & Analytics menu.
   */
  renderReportAnalytics = (module) => {
    const { menusData } = this.props;
    return (
      menusData && menusData.map((el, i) => {
        if (el.ModuleName === module) {
          return (
            <Link
              key={i}
              className={`nav-link ${reactLocalStorage.get("ModuleId") === el.ModuleId ? 'IsActive' : ''}`}
              onClick={() => this.setLeftMenu(el.ModuleId)}
              to={{
                pathname: "/report-analytics",
                state: {
                  ModuleId: el.ModuleId,
                  PageName: "Reports & Analytics",
                  PageURL: "/report-analytics",
                },
              }}
            >
              <img
                className=""
                src={reactLocalStorage.get("ModuleId") === el.ModuleId ? require("../../assests/images/report-active.svg") : require("../../assests/images/chart.svg")}
                alt={module + " icon"}
              />
              <span>Report</span>
            </Link>
          );
        }
        return null
      })
    );
  };

  /**
   * @method renderCosting
   * @description Render Costing menu.
   */
  renderCosting = (module) => {
    const { menusData, location } = this.props
    return (
      menusData && menusData.map((el, i) => {
        if (el.ModuleName === module) {
          return (
            <Link
              key={i}
              isActive={location && location.pathname === '/costing' ? true : false}
              className={`nav-link ${reactLocalStorage.get("ModuleId") === el.ModuleId ? 'IsActive' : ''}`}
              onClick={() => this.setLeftMenu(el.ModuleId)}
              to={{
                pathname: "/costing",
                state: {
                  ModuleId: el.ModuleId,
                  PageName: "Technology",
                  PageURL: "/costing",
                },
              }}
            >
              <img
                className=""
                src={reactLocalStorage.get("ModuleId") === el.ModuleId ? require("../../assests/images/costing-active.svg") : require("../../assests/images/costing.svg")}
                alt={module + " icon"}
              />
              <span>Costing</span>
            </Link>
          );
        }
        return null
      })
    );
  };

  /**
   * @method renderSimulation
   * @description Render Simulation.
   */
  renderSimulation = (module) => {
    const { menusData } = this.props
    return (
      menusData && menusData.map((el, i) => {
        if (el.ModuleName === module) {
          return (
            <Link
              key={i}
              className={`nav-link ${reactLocalStorage.get("ModuleId") === el.ModuleId ? 'IsActive' : ''}`}
              onClick={() => this.setLeftMenu(el.ModuleId)}
              to={{
                pathname: "/simulation",
                state: {
                  ModuleId: el.ModuleId,
                  PageName: "Simulation",
                  PageURL: "/simulation",
                },
              }}
            >
              <img
                className=""
                src={reactLocalStorage.get("ModuleId") === el.ModuleId ? require("../../assests/images/simulation-active.svg") : require("../../assests/images/imac.svg")}
                alt={module + " icon"}
              />
              <span>Simulation</span>
            </Link>
          );
        }
        return null
      })
    );
  };

  /**
   * @method renderUser
   * @description Render User menu.
   */
  renderUser = (module) => {
    const { menusData } = this.props
    return (
      menusData &&
      menusData.map((el, i) => {
        if (el.ModuleName === module) {
          return (
            <Link
              key={i}
              className={`nav-link ${reactLocalStorage.get("ModuleId") === el.ModuleId ? 'IsActive' : ''}`}
              onClick={() => this.setLeftMenu(el.ModuleId)}
              to={{
                pathname: el.LandingPageURL,
                state: {
                  ModuleId: el.ModuleId,
                  PageName: "Users",
                  PageURL: el.LandingPageURL,
                },
              }}
            >
              <img
                className=""
                src={reactLocalStorage.get("ModuleId") === el.ModuleId ? require("../../assests/images/user-active.svg") : require("../../assests/images/men.svg")}
                alt={module + " icon"}
              />
              <span>{el.ModuleName}</span>
            </Link>
          );
        }
        return null
      })
    );
  };

  /**
   * @method renderAudit
   * @description Render User menu.
   */
  renderAudit = (module) => {
    const { menusData } = this.props
    return (
      menusData &&
      menusData.map((el, i) => {
        if (el.ModuleName === module) {
          return (
            <Link
              key={i}
              className={`nav-link ${reactLocalStorage.get("ModuleId") === el.ModuleId ? 'IsActive' : ''}`}
              onClick={() => this.setLeftMenu(el.ModuleId)}
              to={{
                pathname: "/audit",
                state: {
                  ModuleId: el.ModuleId,
                  PageName: "Audit",
                  PageURL: "/audit",
                },
              }}
            >
              <img
                className=""
                src={reactLocalStorage.get("ModuleId") === el.ModuleId ? require("../../assests/images/audit-active.svg") : require("../../assests/images/Audit.svg")}
                alt={module + " icon"}
              />
              <span>{el.ModuleName}</span>
            </Link>
          );
        }
        return null
      })
    );
  };

  render() {
    const { userData, moduleSelectList, leftMenuData } = this.props;
    const { isLoader, isLeftMenuRendered } = this.state;
    const isLoggedIn = isUserLoggedIn();
    return (
      <nav>
        {isLoader && <Loader />}
        {isLeftMenuRendered && leftMenuData[0] !== undefined && (
          <Redirect
            to={{
              pathname: leftMenuData[0].NavigationURL,
            }}
          />
        )}
        <div>
          <div className="flex-conatiner sign-social ">
            <NavbarToggler
              className="navbar-light"
              onClick={this.toggleMobile}
            />
          </div>
          <div>
            <nav className="navbar navbar-expand-lg fixed-top nav bg-light">
              <a href="javaScript:Void(0);" className="navbar-brand mr-auto mr-lg-0"              >
                <img
                  src={require("../../assests/images/logo.png")}
                  alt="Cost It Right"
                  height="30"
                />
              </a>
              <a href="javaScript:Void(0);" className="navbar-brand mr-auto mr-lg-0 cr-other-logo"              >
                <img
                  src={require("../../assests/images/logo.png")}
                  alt="Cost It Right"
                  height="30"
                />
              </a>
              <button
                className="navbar-toggler p-0 border-0"
                type="button"
                data-toggle="offcanvas"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
              <div className="navbar-collapse offcanvas-collapse" id="">
                <ul className="navbar-nav ml-auto">
                  {isLoggedIn && (
                    <>
                      <li className="nav-item active d-xl-inline-block">
                        <div className="dropdown">
                          <a
                            className="dropdown-toggle nav-link bell"
                            href="#"
                            role="button"
                            id="dropdownMenuLink"
                            data-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                          >
                            <i className="fa fa-bell" aria-hidden="true"></i>
                            <span className="count">3</span>
                          </a>
                          <div
                            className="dropdown-menu preview-list notification-dropdown"
                            aria-labelledby="dropdownMenuLink"
                          >
                            <a className="dropdown-item pb-2  mb-2 border-bottom d-flex justify-content-between align-items-center top-row">
                              <p className="mb-0 font-weight-medium">
                                You have 3 unread mails{" "}
                              </p>
                              <span className="badge badge-pill badge-primary float-right">
                                View all
                              </span>
                            </a>
                            <div className="notification-items-cons">

                              <a className="dropdown-item preview-item d-flex py-2 align-items-start">
                                <div className="preview-thumbnail d-inline-block">
                                  <img
                                    src={require("../../assests/images/user-pic.png")}
                                    alt={""}
                                    className="img-sm profile-pic"
                                  />{" "}
                                </div>
                                <div className="preview-item-content flex-grow">
                                  <p className="preview-subject ellipsis font-weight-medium text-dark mb-2">
                                    Marian Garner{" "}
                                  </p>
                                  <p className="font-weight-light small-text">
                                    {" "}
                                    The meeting is cancelled{" "}
                                  </p>
                                </div>
                              </a>

                              <a className="dropdown-item preview-item d-flex py-2 align-items-start">
                                <div className="preview-thumbnail d-inline-block">
                                  <img
                                    src={require("../../assests/images/user-pic.png")}
                                    alt={""}
                                    className="img-sm profile-pic"
                                  />{" "}
                                </div>
                                <div className="preview-item-content flex-grow">
                                  <p className="preview-subject ellipsis font-weight-medium text-dark mb-2">
                                    Marian Garner{" "}
                                  </p>
                                  <p className="font-weight-light small-text">
                                    {" "}
                                    The meeting is cancelled{" "}
                                  </p>
                                </div>
                              </a>

                              <a className="dropdown-item preview-item d-flex py-2 align-items-start">
                                <div className="preview-thumbnail d-inline-block">
                                  <img
                                    src={require("../../assests/images/user-pic.png")}
                                    alt={""}
                                    className="img-sm profile-pic"
                                  />{" "}
                                </div>
                                <div className="preview-item-content flex-grow">
                                  <p className="preview-subject ellipsis font-weight-medium text-dark mb-2">
                                    Marian Garner{" "}
                                  </p>
                                  <p className="font-weight-light small-text">
                                    {" "}
                                    The meeting is cancelled{" "}
                                  </p>
                                </div>
                              </a>

                            </div>
                          </div>
                        </div>
                      </li>
                      {/* <li className="nav-item d-xl-inline-block">
                        <a className="nav-link" href="#"><i className="fa fa-cog" aria-hidden="true"></i></a>
                      </li>
                      <li className="nav-item d-xl-inline-block">
                        <a className="nav-link" href="#"><i className="fa fa-question-circle" aria-hidden="true"></i>
                        </a>
                      </li> */}
                    </>
                  )}

                  <li className="nav-item d-xl-inline-block">
                    <div className="nav-link-user">
                      <Nav className="ml-auto top-menu logout d-inline-flex">
                        <Dropdown
                          isOpen={this.state.dropdownOpen}
                          toggle={this.toggle}
                        >
                          <DropdownToggle caret>
                            {isLoggedIn ? (
                              <>
                                <img
                                  className="img-xs rounded-circle"
                                  alt={""}
                                  src={require("../../assests/images/user.png")}
                                />
                                {userData.Name}
                              </>
                            ) : (
                              "Login"
                            )}
                          </DropdownToggle>

                          {/* <DropdownMenu>
                            {
                              isLoggedIn ?
                                <DropdownItem tag="a" href="javascript:void(0)" onClick={this.logout}>Logout</DropdownItem>
                                :
                                <DropdownItem header>
                                  <Link className="bell-notifcation-icon" to="/login">
                                    Login
                                  </Link>
                                </DropdownItem>
                            }
                          </DropdownMenu> */}
                        </Dropdown>
                        <NavbarToggler
                          className="navbar-light float-right"
                          onClick={this.toggleMobile}
                        />
                      </Nav>
                    </div>
                  </li>
                  {isLoggedIn ? (
                    <li className="nav-item d-xl-inline-block cr-logout-btn">
                      <a className="nav-link" href="javascript:void(0)" onClick={this.logout}                      >
                        <img
                          className=""
                          src={require("../../assests/images/logout.svg")}
                          alt=""
                        />
                      </a>
                    </li>
                  ) : (
                    ""
                  )}
                </ul>
              </div>
            </nav>
          </div>

          {isLoggedIn && (
            <div className="nav-scroller bg-white shadow-sm header-secondry w100">
              <nav className="nav nav-underline">
                {moduleSelectList &&
                  moduleSelectList.map((item, index) => {
                    return this.renderMenus(item.Text);
                  })}
              </nav>
            </div>
          )}
        </div>
      </nav>
    )
  }
}

/**
 * @name mapStateToProps
 * @desc map state containing organisation details from the api to props
 * @return object{}
 */
function mapStateToProps({ auth }) {
  const { loading, userData, leftMenuData, menusData, moduleSelectList } = auth
  return { loading, userData, leftMenuData, menusData, moduleSelectList }
}

/**
 * @method connect
 * @description connect with redux
 * @param {function} mapStateToProps
 * @param {function} mapDispatchToProps
 */
export default connect(mapStateToProps, {
  logoutUserAPI,
  getMenuByUser,
  getModuleSelectList,
  getLeftMenu,
  getPermissionByUser,
  getModuleIdByPathName,
})(SideBar)
