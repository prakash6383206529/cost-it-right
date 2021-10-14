import React, { Component } from "react";
import { connect } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link, Redirect, } from "react-router-dom";
import { NavbarToggler, Nav, Dropdown, DropdownToggle } from "reactstrap";
import { reactLocalStorage } from 'reactjs-localstorage';
import { isUserLoggedIn, loggedInUserId } from '../../helper/auth';
import {
  logoutUserAPI, getMenuByUser, getModuleSelectList, getLeftMenu, getPermissionByUser, getModuleIdByPathName, getMenu,
  getTopAndLeftMenuData,
} from '../../actions/auth/AuthActions';
import "./NavBar.scss";
import { Loader } from "../common/Loader";
import ConfirmComponent from "../../helper/ConfirmComponent"
import masterImage from '../../assests/images/list.svg'
import masterActive from '../../assests/images/masters-active.svg'
import additionalMaster from '../../assests/images/list-add.png'
import reportImg from '../../assests/images/chart.svg'
import costingImg from '../../assests/images/costing.svg'
import simulationImg from '../../assests/images/imac.svg'
import userImg from '../../assests/images/men.svg'
import auditImg from '../../assests/images/Audit.svg'
import dashboardImg from '../../assests/images/homeicon.svg'
import activeDashBoard from '../../assests/images/home-active.svg'
import addMasterActive from '../../assests/images/aa-master-active.svg'
import activeCosting from '../../assests/images/costing-active.svg'
import activeSimulation from '../../assests/images/simulation-active.svg'
import activeUser from '../../assests/images/user-active.svg'
import activeAudit from '../../assests/images/audit-active.svg'
import Logo from '../../assests/images/logo/company-logo.png'
import cirLogo from '../../assests/images/logo/CIRlogo.svg'
import userPic from '../../assests/images/user-pic.png'
import UserImg from '../../assests/images/user.png'
import logoutImg from '../../assests/images/logout.svg'
import activeReport from '../../assests/images/report-active.svg'

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

  // UNSAFE_componentWillMount() {
  //   // const { location } = this.props;
  //   // this.setState({ isLoader: true });
  //   // if (location && location !== undefined) {
  //   //   this.props.getModuleIdByPathName(location.pathname, (res) => {
  //   //     this.setLeftMenu(res.data.Data.ModuleId);
  //   //     this.setState({ isLoader: false });
  //   //   });

  //   //   this.props.getTopAndLeftMenuData(() => { })
  //   // }

  //   // const loginUserId = loggedInUserId();
  //   // this.props.getModuleSelectList(() => { });
  //   // if (loginUserId != null) {
  //   //   this.props.getMenuByUser(loginUserId, () => {
  //   //     this.setState({ isLoader: false });
  //   //   });
  //   // }

  // }


  /**
   * @method componentDidMount
   * @description used to called after mounting component
   */
  componentDidMount() {
    const { location } = this.props;
    this.setState({ isLoader: true });
    if (location && location !== undefined) {
      this.props.getModuleIdByPathName(location.pathname, (res) => {
        // this.setLeftMenu(res.data.Data.ModuleId);
        this.setState({ isLoader: false });
      });

      this.props.getTopAndLeftMenuData(() => { })
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
      onCancel: () => { },
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
      const { location } = this.props;
      this.setState({ isLeftMenuRendered: true });
      // if (location && location.state) {
      //   this.setState({ activeURL: location.pathname })
      // }
    });
  };


  setModuleId = (ModuleId) => {
    reactLocalStorage.set('ModuleId', ModuleId)
  }

  /**
  * @method setLeftMenu
  * @description Used to set left menu and Redirect to first menu.
  */
  SetMenu = (ModuleId) => {
    if (ModuleId !== reactLocalStorage.get("MenuModuleId")) {
      this.props.getMenu(ModuleId, loggedInUserId(), (res) => { });
    }
    reactLocalStorage.set("MenuModuleId", ModuleId);
  };

  /**
   * @method renderDashboard
   * @description Render dashboard menu.
   */
  renderDashboard = (module) => {
    const { menusData, topAndLeftMenuData } = this.props
    return (
      topAndLeftMenuData &&
      topAndLeftMenuData.map((el, i) => {
        if (el.ModuleName === module) {
          return (
            <>
              <li>
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
                    src={`${reactLocalStorage.get("ModuleId") === el.ModuleId ? activeDashBoard : dashboardImg}`}
                    alt={module + " icon"}
                  />
                  <span>{module}</span>
                </Link>
              </li>
            </>
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
    const { menusData, leftMenuData, menuData, topAndLeftMenuData } = this.props
    return (
      topAndLeftMenuData &&
      topAndLeftMenuData.map((el, i) => {
        if (el.ModuleName === module) {
          return (
            <>
              <li className="nav-item dropdown"
              // onMouseOver={(e) => {
              //   //e.stopPropagation()
              //   this.SetMenu(el.ModuleId)
              // }}
              >
                <Link
                  className={`nav-link ${reactLocalStorage.get("ModuleId") === el.ModuleId ? 'IsActive' : ''}`}
                  onClick={() => this.setLeftMenu(el.ModuleId)}
                  onMouseOver={() => this.SetMenu(el.ModuleId)}
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
                    src={reactLocalStorage.get("ModuleId") === el.ModuleId ? masterActive : masterImage}
                    alt={module + " icon"}
                  />
                  <span>Masters</span>
                </Link>
                <div className="dropdown-menu sub-menu">
                  <ul>
                    {
                      el && el.Pages && el.Pages.map((item, i) => {
                        if (item.Sequence === 22) return false;
                        return (
                          <li key={i} className={`mb5`}>
                            <Link
                              onClick={() => this.setLeftMenu(el.ModuleId)}
                              to={{
                                pathname: item.NavigationURL,
                                state: { ModuleId: reactLocalStorage.get("MenuModuleId"), PageName: item.PageName, PageURL: item.NavigationURL }
                              }}
                            >{item.PageName}</Link>
                          </li>
                        )
                        // return (
                        //   <li key={i}>
                        //     <Link
                        //       className="dropdown-item"
                        //       // onClick={this.setLeftMenuAccToMenu(menu.NavigationURL)}
                        //       to={{
                        //         pathname: menu.NavigationURL,
                        //         state: {
                        //           ModuleId: menu.PageId,
                        //           PageName: menu.PageName,
                        //           PageURL: menu.NavigationURL,
                        //         },
                        //       }}
                        //     >
                        //       - {menu.PageName}
                        //     </Link>
                        //   </li>
                        // )
                      })
                    }
                  </ul>
                </div>
              </li>
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
    const { menusData, leftMenuData, menuData, topAndLeftMenuData } = this.props
    return (
      topAndLeftMenuData &&
      topAndLeftMenuData.map((el, i) => {
        if (el.ModuleName === module) {
          return (
            <>
              <li className="nav-item dropdown" onMouseOver={() => this.SetMenu(el.ModuleId)}>
                <Link
                  key={i}
                  className={`nav-link ${reactLocalStorage.get("ModuleId") === el.ModuleId ? 'IsActive' : ''}`}
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
                    src={reactLocalStorage.get("ModuleId") === el.ModuleId ? addMasterActive : additionalMaster}
                    alt={module + " icon"}
                  />
                  <span>Additional Masters</span>
                </Link>
                <div className="dropdown-menu sub-menu">
                  <ul>
                    {
                      el && el.Pages && el.Pages.map((item, i) => {
                        return (
                          <li key={i} className={`mb5`}>
                            <Link
                              onClick={() => this.setLeftMenu(el.ModuleId)}
                              to={{
                                pathname: item.NavigationURL,
                                state: { ModuleId: reactLocalStorage.get("MenuModuleId"), PageName: item.PageName, PageURL: item.NavigationURL }
                              }}
                            >{item.PageName}</Link>
                          </li>
                        )

                      })
                    }
                  </ul>
                </div>
              </li>
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
    const { menusData, topAndLeftMenuData } = this.props;
    return (
      topAndLeftMenuData && topAndLeftMenuData.map((el, i) => {
        if (el.ModuleName === module) {
          return (
            <li>
              <Link
                key={i}
                className={`nav-link ${reactLocalStorage.get("ModuleId") === el.ModuleId ? 'IsActive' : ''}`}
                onClick={() => this.setLeftMenu(el.ModuleId)}
                to={{
                  pathname: el.LandingPageURL,
                  state: {
                    ModuleId: el.ModuleId,
                    PageName: "costing-detail-report",
                    PageURL: el.LandingPageURL,
                  },
                }}
              >
                <img
                  className=""
                  src={reactLocalStorage.get("ModuleId") === el.ModuleId ? activeReport : reportImg}
                  alt={module + " icon"}
                />
                <span>Report</span>
              </Link>
            </li>
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
    const { menusData, location, menuData, topAndLeftMenuData } = this.props
    return (
      topAndLeftMenuData && topAndLeftMenuData.map((el, i) => {
        if (el.ModuleName === module) {
          return (
            <>
              <li className="nav-item dropdown" onMouseOver={() => this.SetMenu(el.ModuleId)}>
                <Link
                  key={i}
                  // isActive={location && location.pathname === '/costing' ? true : false}
                  className={`nav-link ${reactLocalStorage.get("ModuleId") === el.ModuleId ? 'IsActive' : ''}`}
                  onClick={() => this.setLeftMenu(el.ModuleId)}
                  to={{
                    pathname: el.LandingPageURL,
                    state: {
                      ModuleId: el.ModuleId,
                      PageName: "Costing",
                      PageURL: el.LandingPageURL,
                    },
                  }}
                >
                  <img
                    className=""
                    src={reactLocalStorage.get("ModuleId") === el.ModuleId ? activeCosting : costingImg}
                    alt={module + " icon"}
                  />
                  <span>Costing </span>
                </Link>
                <div className="dropdown-menu sub-menu">
                  <ul>
                    {
                      el && el.Pages && el.Pages.map((item, i) => {
                        if (item.Sequence !== 0) return false
                        return (
                          <li key={i} className={`mb5`}>
                            <Link
                              onClick={() => this.setLeftMenu(el.ModuleId)}
                              to={{
                                pathname: item.NavigationURL,
                                state: { ModuleId: reactLocalStorage.get("MenuModuleId"), PageName: item.PageName, PageURL: item.NavigationURL }
                              }}
                            >{item.PageName}</Link>
                          </li>
                        )
                      })
                    }
                  </ul>
                </div>
              </li>
            </>
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
    const { menusData, menuData, topAndLeftMenuData } = this.props
    return (
      topAndLeftMenuData && topAndLeftMenuData.map((el, i) => {
        if (el.ModuleName === module) {
          return (
            <li className={'nav-item dropdown'}>
              <Link
                key={i}
                className={`nav-link ${reactLocalStorage.get("ModuleId") === el.ModuleId ? 'IsActive' : ''}`}
                onClick={() => this.setLeftMenu(el.ModuleId)}
                onMouseOver={() => this.SetMenu(el.ModuleId)}
                to={{
                  pathname: el.LandingPageURL, //COMMENT FOR NOW
                  // pathname: '/simulation',
                  state: {
                    ModuleId: el.ModuleId,
                    PageName: "Simulation",
                    PageURL: el.LandingPageURL,
                  },
                }}
              >
                <img
                  className=""
                  src={reactLocalStorage.get("ModuleId") === el.ModuleId ? activeSimulation : simulationImg}
                  alt={module + " icon"}
                />
                <span>Simulation</span>
              </Link>
              <div className="dropdown-menu sub-menu">
                <ul>
                  {
                    el && el.Pages && el.Pages.map((item, i) => {
                      if (item.Sequence !== 0) return false
                      if (item.PageName === 'Simulation Upload') return false; //NEED TO REMOVE USED FOR NOW
                      return (
                        <li key={i} className={`mb5`}>
                          <Link
                            onClick={() => this.setLeftMenu(el.ModuleId)}
                            to={{
                              pathname: item.NavigationURL,
                              state: { ModuleId: reactLocalStorage.get("MenuModuleId"), PageName: item.PageName, PageURL: item.NavigationURL }
                            }}
                          >{item.PageName}</Link>
                        </li>
                      )
                    })
                  }
                  {/* <li>
                    <Link
                      className="dropdown-item "
                      to={{
                        pathname: "/approval-listing",
                        state: {
                          ModuleId: 1,
                          PageName: "Costing",
                          PageURL: "/approval-listing",
                        },
                      }}
                    >
                      - Approval
                  </Link>
                  </li> */}
                </ul>
              </div>
            </li>
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
    const { menusData, topAndLeftMenuData } = this.props
    return (
      topAndLeftMenuData &&
      topAndLeftMenuData.map((el, i) => {
        if (el.ModuleName === module) {
          return (
            <li>
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
                  src={reactLocalStorage.get("ModuleId") === el.ModuleId ? activeUser : userImg}
                  alt={module + " icon"}
                />
                <span>{el.ModuleName}</span>
              </Link>
            </li>
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
    const { menusData, topAndLeftMenuData } = this.props
    return (
      topAndLeftMenuData &&
      topAndLeftMenuData.map((el, i) => {
        if (el.ModuleName === module) {
          return (
            <li>
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
                  src={reactLocalStorage.get("ModuleId") === el.ModuleId ? activeAudit : auditImg}
                  alt={module + " icon"}
                />
                <span>{el.ModuleName}</span>
              </Link>
            </li>
          );
        }
        return null
      })
    );
  };

  render() {
    const { userData, moduleSelectList, leftMenuData, topAndLeftMenuData } = this.props;
    const { isLoader, isLeftMenuRendered } = this.state;
    const isLoggedIn = isUserLoggedIn();
    return (
      <nav>
        {isLoader && <Loader />}
        {/* {isLeftMenuRendered && leftMenuData[0] !== undefined && (
          <Redirect
            to={{
              pathname: leftMenuData[0].NavigationURL,
            }}
          />
        )} */}
        <div>
          <div className="flex-conatiner sign-social ">
            <NavbarToggler
              className="navbar-light"
              onClick={this.toggleMobile}
            />
          </div>
          <div>
            <nav className="navbar navbar-expand-lg fixed-top nav bg-light">
              <a href="javaScript:Void(0);" className="navbar-brand mr-auto mr-lg-0 ">
                <img
                  src={Logo}
                  // src={require("../../assests/images/sipl-logo.jpg")}
                  alt="Systematix"
                  height="40"
                />
              </a>
              <a href="javaScript:Void(0);" className="navbar-brand mr-auto mr-lg-0 cr-other-logo">
                <img src={cirLogo} alt="Cost It Right" height="40" />
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
                                  src={UserImg}
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
                          src={logoutImg}
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
              <nav className="navbar navbar-expand-lg pl-0">
                <ul className="navbar-nav mr-auto">
                  {topAndLeftMenuData &&
                    topAndLeftMenuData.map((item, index) => {
                      return this.renderMenus(item.ModuleName);
                    })}
                </ul>
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
  const { loading, userData, leftMenuData, menusData, moduleSelectList, menuData, topAndLeftMenuData } = auth
  return { loading, userData, leftMenuData, menusData, moduleSelectList, menuData, topAndLeftMenuData }
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
  getMenu,
  getTopAndLeftMenuData,
})(SideBar)
