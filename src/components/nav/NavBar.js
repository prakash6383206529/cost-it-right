import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, } from "react-router-dom";
import { NavbarToggler, Nav } from "reactstrap";
import { getConfigurationKey, handleDepartmentHeader, isUserLoggedIn, loggedInUserId } from '../../helper/auth';
import {
  logoutUserAPI, getMenuByUser, getModuleSelectList, getPermissionByUser, getMenu,
  getTopAndLeftMenuData
} from '../../actions/auth/AuthActions';
import { Loader } from "../common/Loader";
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
import logoutImg from '../../assests/images/logout.svg'
import activeReport from '../../assests/images/report-active.svg'
import activeRFQ from '../../assests/images/rfqActive.svg'
import RFQ from '../../assests/images/rfq.svg'
import PopupMsgWrapper from "../common/PopupMsgWrapper";
// import Calculator from "../common/Calculator/component/Calculator";
import { CBC_COSTING, COSTING, SIMULATION, VBC_COSTING, VERSION, ZBC_COSTING } from '../../config/constants';
import _ from "lodash";
import { reactLocalStorage } from "reactjs-localstorage";
import { MESSAGES } from "../../config/message";
import { checkForNull, displayNavigationLength } from "../../helper";
import LanguageDropdown from "../common/Tour/LanguageDropdown";
import TourWrapper from "../common/Tour/TourWrapper";
import { Steps } from "./TourMessages";
import { withTranslation } from "react-i18next";
import { CirLogo, CompanyLogo, LabelsClass } from "../../helper/core";
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
      CostingsAwaitingApprovalDashboard: false,
      showPopup: false,
      updatedObj: {},
      isShowCal: false,
      showTour: false,
      startIndex: 0,
      showAllCategory: false
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
      this.props.getTopAndLeftMenuData((res) => {
        this.simulationPermission(res?.data?.Data, 1)
        this.simulationPermission(res?.data?.Data, 0)
        this.simulationPermission(res?.data?.Data, 2)

        let Data = res?.data?.Data
        let costingIndex = Data && Data?.findIndex(item => item?.ModuleName === COSTING)
        let cbcCostingData = Data && Data[costingIndex]?.Pages?.filter(item => item?.PageName === CBC_COSTING)
        let zbcCostingData = Data && Data[costingIndex]?.Pages?.filter(item => item?.PageName === ZBC_COSTING)
        let vbcCostingData = Data && Data[costingIndex]?.Pages?.filter(item => item?.PageName === VBC_COSTING)

        let permissionArr = {
          vbc: checkForNull(vbcCostingData?.length) === 0 ? false : true,
          zbc: checkForNull(zbcCostingData?.length) === 0 ? false : true,
          cbc: checkForNull(cbcCostingData?.length) === 0 ? false : true
        }
        reactLocalStorage.setObject('CostingTypePermission', permissionArr)

      })
    }

    const loginUserId = loggedInUserId();
    this.props.getModuleSelectList(() => { });
    if (loginUserId != null) {
      this.props.getMenuByUser(loginUserId, () => {
        this.setState({ isLoader: false });
      });
    }
    let disabledLogo = document.getElementsByClassName('logo-container')[0];
    disabledLogo.addEventListener('contextmenu', function (e) {
      e.preventDefault();
    }, false);
  }

  /**
  * @method simulationPermission
  * @description permission for add and view simulation
  */
  simulationPermission(Data, index) {
    let simulationIndex = Data && Data?.findIndex(item => item?.ModuleName === SIMULATION)

    if (simulationIndex !== -1 && simulationIndex !== undefined) {
      let simulationPages = Data[simulationIndex].Pages && Data[simulationIndex].Pages.filter(item => item.Sequence !== 0 && item.IsChecked === true)
      let simulationArray = simulationPages && simulationPages.filter((item) => {
        if (item?.Actions[index] && item?.Actions[index]?.IsChecked === true) return item.PageName;
        return null
      })
      if (index === 1) {                                 // 1 IS FOR VIEW PERMISSION 
        localStorage.setItem('simulationViewPermission', JSON.stringify(_.map(simulationArray, 'PageName')))
      } else if (index === 0) {                          // 0 IS FOR ADD PERMISSION 
        localStorage.setItem('simulationAddPermission', JSON.stringify(_.map(simulationArray, 'PageName')))
      } else if (index === 2) {                          // 2 IS FOR Run PERMISSION 
        localStorage.setItem('simulationRunPermission', JSON.stringify(_.map(simulationArray, 'PageName')))
      }
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
    this.setState({ showPopup: true, updatedObj: requestData })

  };

  onPopupConfirm = (e) => {
    const { updatedObj } = this.state
    e.preventDefault()
    this.props.logoutUserAPI(updatedObj, () => this.props.logUserOut());
  }
  closePopUp = () => {
    this.setState({ showPopup: false })
  }
  /**
   * @method user toggle
   */
  toggle = () => {
    this.setState((prevState) => ({
      dropdownOpen: !prevState.dropdownOpen,
    }));
  };
  showCalculator = () => {
    this.setState({ isShowCal: !this.state.isShowCal })
  }
  /**
   * @method mobile menu open
   */
  toggleMobile = () => {
    this.setState({
      isOpen: !this.state.isOpen,
    });
  };

  commonObj = {}

  /**
   * @method renderMenus
   * @description Render menus according to user access.
   */
  renderMenus = (module, LandingPageURL) => {
    switch (module) {
      case "Dashboard":
        return this.renderDashboard(module, LandingPageURL);
      case "Master":
        return this.renderMaster(module, LandingPageURL);
      case "Additional Masters":
        return this.renderAdditionalMaster(module, LandingPageURL);
      case "Costing":
        return this.renderCosting(module, LandingPageURL);
      case "Simulation":
        return this.renderSimulation(module, LandingPageURL);
      case "Reports And Analytics":
        return this.renderReportAnalytics(module, LandingPageURL);
      case "Users":
        return this.renderUser(module, LandingPageURL);
      case "Audit":
        return this.renderAudit(module, LandingPageURL);
      case "NFR":
        return this.renderNFR(module, LandingPageURL);
      case `Vendor Management`:
        return this.renderVendorManagement(module, LandingPageURL);
      case "RFQ":
        if (getConfigurationKey().IsRFQConfigured) {
          return this.renderRFQ(module, LandingPageURL);
        } else {
          break;
        }
      case "Reverse Auction":
        return this.renderAuction(module, LandingPageURL);
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
  };

  /**
  * @method setLeftMenu
  * @description Used to set left menu and Redirect to first menu.
  */
  SetMenu = (ModuleId) => {
    reactLocalStorage.set("MenuModuleId", ModuleId);
  };

  /**
   * @method renderDashboard
   * @description Render dashboard menu.
   */
  renderDashboard = (module, LandingPageURL) => {

    const { topAndLeftMenuData } = this.props
    return (
      topAndLeftMenuData &&
      topAndLeftMenuData.map((el, i) => {
        if (el.ModuleName === module) {
          return (
            <>
              <li>
                <Link
                  id="Dashboard_NavBar"
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
                  <span className="module">{module}</span>
                </Link>
              </li>
            </>
          );
        }
        return null
      })
    );
  };

  getSpecificIdForElement = (data) => {
    let id = '';
    if (data) {
      id = data.NavigationURL && data.NavigationURL.replace('/', '');
    }
    return id;
  }

  /**
   * @method renderMaster
   * @description Render master menu.
   */
  renderMaster = (module, LandingPageURL) => {
    const { topAndLeftMenuData } = this.props

    topAndLeftMenuData &&
      topAndLeftMenuData.map((el, i) => {
        if (el.ModuleName === module) {
          el.Pages.map((item, index) => {
            if (window.location.href.includes(item.NavigationURL)) {
              this.setLeftMenu(el.ModuleId)
            }
            return null
          })
        }
        return null
      })

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
                  id="Master_NavBar"
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
                  <span className="masters">Masters</span>
                </Link>
                <div className={`dropdown-menu ${this.state.showAllCategory ? "" : "sub-menu"}`}>
                  <ul>
                    {
                      el && el.Pages && el.Pages.map((item, i) => {
                        // if (item.Sequence === 22) return false;
                        if (item.Sequence === 0) return false

                        return (
                          <li key={i} className={`mb5`}>
                            <Link
                              id={this.getSpecificIdForElement(item)}
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
  renderAdditionalMaster = (module, LandingPageURL) => {

    const { topAndLeftMenuData } = this.props

    topAndLeftMenuData &&
      topAndLeftMenuData.map((el, i) => {
        if (el.ModuleName === module) {
          el.Pages.map((item, index) => {
            if (window.location.href.includes(item.NavigationURL)) {
              this.setLeftMenu(el.ModuleId)
            }
            return null
          })
        }
        return null
      })

    return (
      topAndLeftMenuData &&
      topAndLeftMenuData.map((el, i) => {
        if (el.ModuleName === module) {
          return (
            <>
              <li className="nav-item dropdown" onMouseOver={() => this.SetMenu(el.ModuleId)}>
                <Link
                  id="AdditionalMaster_NavBar"
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
                  <span className="additional-masters">Additional Masters</span>
                </Link>
                <div className={`dropdown-menu ${this.state.showAllCategory ? "" : "sub-menu"}`}>
                  <ul>
                    {
                      el && el.Pages && el.Pages.map((item, i) => {
                        return (
                          <li key={i} className={`mb5`}>
                            <Link
                              onClick={() => this.setLeftMenu(el.ModuleId)}
                              id={this.getSpecificIdForElement(item)}
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
  renderReportAnalytics = (module, LandingPageURL) => {
    const { topAndLeftMenuData } = this.props;

    topAndLeftMenuData &&
      topAndLeftMenuData.map((el, i) => {
        if (el.ModuleName === module) {
          el.Pages.map((item, index) => {
            if (window.location.href.includes(item.NavigationURL)) {
              this.setLeftMenu(el.ModuleId)
            }
            return null
          })
        }
        return null
      })

    return (
      topAndLeftMenuData && topAndLeftMenuData.map((el, i) => {
        if (el.ModuleName === module) {
          return (
            <li className="nav-item dropdown" onMouseOver={() => this.SetMenu(el.ModuleId)}>
              <Link
                id="Report_NavBar"
                key={i}
                className={`nav-link ${reactLocalStorage.get("ModuleId") === el.ModuleId ? 'IsActive' : ''}`}
                onClick={() => this.setLeftMenu(el.ModuleId)}
                to={{
                  pathname: el.LandingPageURL,
                  state: {
                    ModuleId: el.ModuleId,
                    PageName: "Costing Breakup Details",
                    PageURL: el.LandingPageURL,
                  },
                }}
              >
                <img
                  className=""
                  src={reactLocalStorage.get("ModuleId") === el.ModuleId ? activeReport : reportImg}
                  alt={module + " icon"}
                />
                <span className="report">Report</span>
              </Link>
              <div className={`dropdown-menu ${this.state.showAllCategory ? "" : "sub-menu"}`}>
                <ul>
                  {
                    el && el.Pages && el.Pages.map((item, i) => {
                      return (
                        <li key={i} className={`mb5`}>
                          <Link
                            onClick={() => this.setLeftMenu(el.ModuleId)}
                            id={this.getSpecificIdForElement(item)}
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
                  id="Costing_NavBar"
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
                  <span className="costing">Costing </span>
                </Link>
                <div className={`dropdown-menu ${this.state.showAllCategory ? "" : "sub-menu"}`}>
                  <ul>
                    {
                      el && el.Pages && el.Pages.map((item, i) => {
                        if (item.Sequence !== 0) return false
                        return (
                          <li key={i} className={`mb5`}>
                            <Link

                              id={this.getSpecificIdForElement(item)}
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
  renderSimulation = (module, LandingPageURL) => {
    const { topAndLeftMenuData } = this.props

    topAndLeftMenuData &&
      topAndLeftMenuData.map((el, i) => {
        if (el.ModuleName === module) {
          el.Pages.map((item, index) => {
            if (window.location.href.includes(item.NavigationURL)) {
              this.setLeftMenu(el.ModuleId)
            }
            return null
          })
        }
        return null
      })

    return (
      topAndLeftMenuData && topAndLeftMenuData.map((el, i) => {
        if (el.ModuleName === module) {
          return (
            <li className={'nav-item dropdown'}>
              <Link
                id="Simulation_NavBar"
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
                <span className="simulation">Simulation</span>
              </Link>
              <div className={`dropdown-menu ${this.state.showAllCategory ? "" : "sub-menu"}`}>
                <ul>
                  {
                    el && el.Pages && el.Pages.map((item, i) => {
                      if (item.Sequence !== 0) return false
                      if (item.PageName === 'Simulation Upload') return false; //NEED TO REMOVE USED FOR NOW
                      return (
                        <li key={i} className={`mb5`}>
                          <Link
                            onClick={() => this.setLeftMenu(el.ModuleId)}
                            id={this.getSpecificIdForElement(item)}
                            to={{
                              pathname: item.NavigationURL,
                              state: { ModuleId: localStorage.getItem('ModuleId'), PageName: item.PageName, PageURL: item.NavigationURL }
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
  renderUser = (module, LandingPageURL) => {
    const { topAndLeftMenuData } = this.props

    topAndLeftMenuData &&
      topAndLeftMenuData.map((el, i) => {
        if (el.ModuleName === module) {
          el.Pages.map((item, index) => {
            if (window.location.href.includes(item.NavigationURL)) {
              this.setLeftMenu(el.ModuleId)
            }
            return null
          })
        }
        return null
      })

    return (
      topAndLeftMenuData &&
      topAndLeftMenuData.map((el, i) => {
        if (el.ModuleName === module) {
          return (
            <li>
              <Link
                key={i}
                id={this.getSpecificIdForElement(el)}
                className={`nav-link ${reactLocalStorage.get("ModuleId") === el.ModuleId ? 'IsActive' : ''} Users_NavBar`}
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
                <span className="users">{el.ModuleName}</span>
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
                id={this.getSpecificIdForElement(el)}
                className={`nav-link ${reactLocalStorage.get("ModuleId") === el.ModuleId ? 'IsActive' : ''} Audit_NavBar`}
                onClick={() => this.setLeftMenu(el.ModuleId)}
                to={{
                  pathname: el.LandingPageURL,
                  state: {
                    ModuleId: el.ModuleId,
                    PageName: "Audit",
                    PageURL: el.LandingPageURL,
                  },
                }}
              >
                <img
                  className=""
                  src={reactLocalStorage.get("ModuleId") === el.ModuleId ? activeAudit : auditImg}
                  alt={module + " icon"}
                />
                <span className="audit">{el.ModuleName}</span>
              </Link >
            </li >
          );
        }
        return null
      })
    );
  };


  renderRFQ = (module) => {
    const { topAndLeftMenuData } = this.props
    return (
      topAndLeftMenuData &&
      topAndLeftMenuData.map((el, i) => {
        if (el.ModuleName === module) {
          return (
            <li>
              <Link
                key={i}
                id={this.getSpecificIdForElement(el)}
                className={`nav-link ${reactLocalStorage.get("ModuleId") === el.ModuleId ? 'IsActive' : ''} RFQ_NavBar`}
                onClick={() => this.setLeftMenu(el.ModuleId)}
                to={{
                  pathname: el.LandingPageURL,
                  state: {
                    ModuleId: el.ModuleId,
                    PageName: "RFQ",
                    PageURL: el.LandingPageURL,
                  },
                }}
              >
                <img
                  className=""
                  src={reactLocalStorage.get("ModuleId") === el.ModuleId ? activeRFQ : RFQ}
                  alt={module + " icon"}
                />
                <span className="rfq">{el.ModuleName}</span>
              </Link>
            </li>
          );
        }
        return null
      })
    );
  };

  renderNFR = (module) => {
    const { topAndLeftMenuData } = this.props
    return (
      topAndLeftMenuData &&
      topAndLeftMenuData.map((el, i) => {
        if (el.ModuleName === module) {
          return (
            <li>
              <Link
                key={i}
                id={this.getSpecificIdForElement(el)}
                className={`nav-link ${reactLocalStorage.get("ModuleId") === 'NFR' ? 'IsActive' : ''} NFR_NavBar`}
                onClick={() => this.setLeftMenu('NFR')}
                to={{
                  pathname: el.LandingPageURL,
                  state: {
                    ModuleId: el.ModuleId,
                    PageName: "NFR",
                    PageURL: el.LandingPageURL,
                  },
                }}
              >
                <img
                  className=""
                  src={reactLocalStorage.get("ModuleId") === 'NFR' ? activeRFQ : RFQ}
                  alt={module + " icon"}
                />
                <span className="rfq">{'NFR'}</span>
              </Link>
            </li>
          );
        }
        return null
      })
    );
  };

  /**
   * @method renderSupplierManagement
   * @description Render Supplier Management.
   */


  renderVendorManagement = (module) => {
    const { t, menusData, topAndLeftMenuData } = this.props
    const VendorLabel = LabelsClass(t, 'MasterLabels').vendorLabel;
    console.log(VendorLabel, 'VendorLabel')
    return (
      topAndLeftMenuData &&
      topAndLeftMenuData.map((el, i) => {

        if (el.ModuleName === module) {
          return (
            <li className="nav-item dropdown" onMouseOver={() => this.SetMenu(el.ModuleId)}>
              <Link
                key={i}
                id={this.getSpecificIdForElement(el)}
                className={`nav-link ${reactLocalStorage.get("ModuleId") === el.ModuleId ? 'IsActive' : ''} Vendor_NavBar`}
                onClick={() => this.setLeftMenu(el.ModuleId)}
                to={{
                  pathname: el.LandingPageURL,
                  state: {
                    ModuleId: el.ModuleId,
                    PageName: `${VendorLabel} Management`,
                    PageURL: el.LandingPageURL,
                  },
                }}
              >
                <img
                  className=""
                  src={reactLocalStorage.get("ModuleId") === el.ModuleId ? activeAudit : auditImg}
                  alt={module + " icon"}
                />
                <span className="vendor_management">{el.ModuleName}</span>
                <div className={`dropdown-menu ${this.state.showAllCategory ? "" : "sub-menu"}`}>
                  <ul>
                    {
                      el && el.Pages && el.Pages.map((item, i) => {
                        return (
                          <li key={i} className={`mb5`}>
                            <Link
                              onClick={() => this.setLeftMenu(el.ModuleId)}
                              id={this.getSpecificIdForElement(item)}
                              to={{
                                pathname: item.NavigationURL,
                                state: { ModuleId: reactLocalStorage.get("ModuleId"), PageName: item.PageName, PageURL: item.NavigationURL }
                              }}
                            >{item.PageName}</Link>
                          </li>
                        )

                      })
                    }
                  </ul>
                </div>
              </Link >
            </li >
          );
        }
        return null
      })
    );
  };

  renderAuction = (module) => {
    const { topAndLeftMenuData } = this.props
    return (
      topAndLeftMenuData &&
      topAndLeftMenuData.map((el, i) => {
        if (el.ModuleName === module) {
          return (
            <li>
              <Link
                key={i}
                id={this.getSpecificIdForElement(el)}
                className={`nav-link ${reactLocalStorage.get("ModuleId") === el.ModuleId ? 'IsActive' : ''} AUCTION_NavBar`}
                onClick={() => this.setLeftMenu(el.ModuleId)}
                to={{
                  pathname: el.LandingPageURL,
                  state: {
                    ModuleId: el.ModuleId,
                    PageName: "Reverse Auction",
                    PageURL: el.LandingPageURL,
                  },
                }}
              >
                <img
                  className=""
                  src={reactLocalStorage.get("ModuleId") === el.ModuleId ? activeRFQ : RFQ}
                  alt={module + " icon"}
                />
                <span className="rfq">{el.ModuleName}</span>
              </Link>
            </li>
          );
        }
        return null
      })
    );
  };

  tourStart = () => {
    const { location, TourStartAction } = this.props;
    const { showTour } = this.state;
    this.setState({ showTour: !showTour });


    TourStartAction({
      showTour: !showTour,
    });

  }


  nextNavItems = () => {
    const { startIndex } = this.state;
    const { topAndLeftMenuData } = this.props;
    const totalNavItems = topAndLeftMenuData ? topAndLeftMenuData.length : 0;
    if (startIndex + displayNavigationLength() < totalNavItems) {
      this.setState({ startIndex: startIndex + 1 });
    }
  };

  prevNavItems = () => {
    const { startIndex } = this.state;
    if (startIndex > 0) {
      this.setState({ startIndex: startIndex - 1 });
    }
  };


  render() {
    const { userData, moduleSelectList, leftMenuData, topAndLeftMenuData, t } = this.props;
    const { isLoader, startIndex, showAllCategory } = this.state;
    const isLoggedIn = isUserLoggedIn();
    const isScrollButtonVisible = (topAndLeftMenuData && topAndLeftMenuData.length) > displayNavigationLength();
    const endIndex = startIndex + displayNavigationLength();
    const totalNavItems = topAndLeftMenuData ? topAndLeftMenuData.length : 0;
    const visibleNavItems = topAndLeftMenuData && topAndLeftMenuData.slice(startIndex, endIndex);

    return (
      <nav className={`${this.props.sidebarAndNavbarHide ? 'hide-navbar' : ''}`}>
        {isLoader && <Loader />}
        <div>
          <div className="flex-conatiner sign-social ">
            <NavbarToggler
              className="navbar-light"
              onClick={this.toggleMobile}
            />
          </div>
          <div>
            <nav className="navbar navbar-expand-lg fixed-top nav bg-light">
              <div className="logo-container">
                <div className="py-1">
                  <CompanyLogo height="40" />
                </div>
                <div className="border-left"></div>
                <div className="py-1">
                  <CirLogo height="40" />
                </div>
              </div>
              <div className="navbar-collapse offcanvas-collapse justify-content-end" id="">
                <ul className="navbar-nav ml-auto">
                  <li className="nav-item d-xl-inline-block">
                    <div className="d-flex align-items-center">
                      <LanguageDropdown />
                      <TourWrapper
                        buttonSpecificProp={{ id: "Navigation_Bar_Tour" }}
                        stepsSpecificProp={{
                          steps: Steps(t, { topAndLeftMenuData }).NAV_BAR
                        }} />

                    </div>
                  </li>
                  <li className="nav-item d-xl-inline-block version">
                    <div className="nav-link-user ml-3 pl-3">
                      {VERSION}
                    </div>
                  </li>
                  <li className="nav-item d-xl-inline-block">
                    <div className="nav-link-user">
                      <Nav className="ml-auto top-menu logout d-inline-flex">
                        <div className="user-container"><div className="dropdown"><div className="user-name">{userData.Name}</div>
                          <ul className="dropdown_menu">
                            <li className="dropdown_item-1">User Name: <span>{userData.UserName}</span></li>
                            <li className="dropdown_item-2">Email Id:<span>{userData.Email}</span></li>
                            <li className="dropdown_item-3">Role:<span>{userData.Role}</span></li>
                            <li className="dropdown_item-4">{handleDepartmentHeader()}:{userData.Department && userData.Department.map((item, index) => {
                              return <span>{index + 1}. {item.DepartmentName}{userData.Department > 1 ? ',' : ''}</span>
                            })}</li>
                          </ul>
                        </div>
                        </div>
                      </Nav>
                    </div>
                  </li>
                  {isLoggedIn ? (
                    <li className=" d-xl-inline-block ml-2 p-relative">
                      {this.props.disabledClass && <div title={MESSAGES.DOWNLOADING_MESSAGE} className="disabled-overflow min-width"></div>}
                      <button className="btn btn-no-border" onClick={this.logout}>
                        <img
                          className=""
                          src={logoutImg}
                          alt="logout"
                        />
                      </button>
                    </li>
                  ) : (
                    ""
                  )}
                </ul>
              </div >
            </nav >
          </div >

          {isLoggedIn && (
            <div className="nav-scroller bg-white shadow-sm header-secondry w100 p-relative">
              {this.props.disabledClass && <div title={MESSAGES.DOWNLOADING_MESSAGE} className="disabled-overflow min-width"></div>}
              <nav className="navbar navbar-expand-lg pl-0">
                {isScrollButtonVisible && <button className="arrow-previous" onClick={this.prevNavItems} disabled={startIndex === 0}></button>}
                <ul className="navbar-nav mr-auto">
                  {isScrollButtonVisible && <li> <button className="all-modules-btn"
                    onMouseEnter={() => this.setState({ showAllCategory: true })}
                    onMouseLeave={() => this.setState({ showAllCategory: false })}
                  ><div className={showAllCategory ? 'cross-module' : 'all-modules'}></div>View All</button> </li>}
                  {visibleNavItems &&
                    visibleNavItems.map((item, index) => {

                      return this.renderMenus(item.ModuleName, item.LandingPageURL);
                    })}
                  {/* {this.renderNFR('RFQ')} */}
                </ul>
                {isScrollButtonVisible && <button className="arrow-next" onClick={this.nextNavItems} disabled={endIndex >= totalNavItems}></button>}
              </nav>
              <div
                onMouseEnter={() => this.setState({ showAllCategory: true })}
                onMouseLeave={() => this.setState({ showAllCategory: false })}
                className={`mega-menu ${showAllCategory ? 'show' : ''}`}> {topAndLeftMenuData &&
                  topAndLeftMenuData.map((item, index) => {
                    return this.renderMenus(item.ModuleName, item.LandingPageURL);
                  })}</div>
            </div>
          )
          }
        </div >
        {
          this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`Are you sure you want to log out?`} />
        }

      </nav >
    )
  }
}

/**
 * @name mapStateToProps
 * @desc map state containing organisation details from the api to props
 * @return object{}
 */
function mapStateToProps({ auth, comman }) {
  const { loading, userData, leftMenuData, menusData, moduleSelectList, menuData, topAndLeftMenuData } = auth
  const { disabledClass, sidebarAndNavbarHide } = comman;
  return { loading, userData, leftMenuData, menusData, moduleSelectList, menuData, topAndLeftMenuData, disabledClass, sidebarAndNavbarHide }
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
  getPermissionByUser,
  getMenu,
  getTopAndLeftMenuData,

})(withTranslation(['NavBar', 'MasterLabels'])(SideBar))

