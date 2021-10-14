import React, { Component, Suspense } from 'react'
import { reactLocalStorage } from 'reactjs-localstorage'
import { connect } from 'react-redux'
import SideBar from './nav/NavBar'
import { Route, Switch } from 'react-router-dom'
import ReduxToastr from 'react-redux-toastr'
import Footer from './common/Footer'
import Login from './login/Login'
import NotFoundPage from './common/NotFoundPage'
import User from './user'
import Dashboard from './dashboard'
import DashboardWithGraph from './dashboard/DashboardWithGraph'
import { Loader } from '../../src/components/common/Loader'
import PartMaster from './masters/part-master'
import UOMMaster from './masters/uom-master'
import RowMaterialMaster from './masters/material-master'
import PlantMaster from './masters/plant-master/index'
import SupplierMaster from './masters/supplier-master/VendorListing'
import BOPMaster from './masters/bop-master'
import FuelMaster from './masters/fuel-master'
import OperationListing from './masters/operation/OperationListing'
import FreightMaster from './masters/freight-master'
import LabourListing from './masters/labour-master/LabourListing'
import OverheadProfit from './masters/overhead-profit-master'
import InterestRate from './masters/interest-rate-master/InterestRateListing'
import MachineMaster from './masters/machine-master'
import ReasonListing from './masters/reason-master/ReasonListing'
import VolumeListing from './masters/volume-master/VolumeListing'
import ClientMaster from './masters/client-master/AddClient'
import ExchangeRateListing from './masters/exchange-rate-master/ExchangeRateListing'
import TaxListing from './masters/tax-master/TaxListing'
import LeftMenu from './nav/Leftsidemenu'
import Breadcrumb from './nav/Breadcrumb'
import CostingRoutes from './costing/Routes'
import { showUserData, TokenAPI, AutoSignin } from '../actions/auth/AuthActions'
import AuthMiddleware from '../AuthMiddleware'
import {
  BOP, DASHBOARD, FREIGHT, FUEL_AND_POWER, INTEREST_RATE, LABOUR, MACHINE, OPERATION,
  OVERHEAD_AND_PROFIT, PART, PLANT, RAW_MATERIAL, UOM, USER, VENDOR,
  REASON, VOLUME, CLIENT, EXCHANGE_RATE, TAX, COSTING_PATH, APPROVAL_LISTING_PATH,
  APPROVAL_SUMMARY_PATH, COSTING_BULK_UPLOAD, COSTING_SUMMARY, Approval_Summary, Approval_Listing, CostingSummary_BulkUpload, Simulation_History, Simulation_Page, Simulation_Upload, API,
  config, DASHBOARDWITHGRAPH_PATH, SIMULATION_APPROVAL_SUMMARY_PATH, DASHBOARD_PATH, DASHBOARD_PATH_SECOND, PRODUCT, OperationMaster
} from '../config/constants'
import ApprovalSummary from './costing/components/approval/ApprovalSummary'
import ApprovalListing from './costing/components/approval/ApprovalListing'
import CostingSummaryBulkUpload from './costing/components/CostingSummaryBulkUpload'
import SimulationHistory from './simulation/components/SimulationHistory'
import Simulation from './simulation/components/Simulation'
import CostingSummary from './costing/components/CostingSummary'
import SimulationUpload from './simulation/components/SimulationUpload'
import { formatLoginResult, getAuthToken, userDetails } from '../helper'
import axios from 'axios';
import ReportListing from './report/ReportListing'
import SimulationApprovalListing from './simulation/components/SimulationApprovalListing'
import SimulationApprovalSummary from './simulation/components/SimulationApprovalSummary'
import productMaster from './masters/product-master'
import RMApproval from './masters/material-master/RMApproval'
import OperationsMaster from './masters/operation/index'
import NewReport from './report/NewReport'

const CustomHeader = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': 'true',
  'Authorization': `Bearer NRIsJAXFS-IgPMtfW05J1EiTwhv4z37BnFCk2TynvAdVYMuBIal7dTYyfboxRFjvPJ1zPl4r4LfQJ8_1fKDnSxTmGmThhl6YabKHaGvzp2WDQ7P0wFZs2wW10Mcmkt4Xb4ybDGzwSLt6fwRuI1uGNRuyNMxKQz-s533rIF5Qx08vwumo5ogN5x_oyi__b4KXJWbUU_0qLaJGLwISEf4o3_4CPBoP6Gv_tAGIO1W250SzOF3zwYpTxi8LwghOtQse`,
  'Access-From': 'WEB',
  'Api-Key': `${process.env.REACT_APP_API_KEY}`,
}

const Detail = userDetails()

if (Object.keys(Detail).length > 0) {
  // window.setInterval(() => {

  //   const NewDetail = userDetails()

  //   let reqParams = {
  //     IsRefreshToken: true,
  //     refresh_token: NewDetail.RefreshToken,
  //     ClientId: 'self',
  //     grant_type: 'refresh_token',
  //   }

  //   let queryParams = `refresh_token=${reqParams.refresh_token}&ClientId=${reqParams.ClientId}&grant_type=${reqParams.grant_type}`;
  //   axios.post(API.tokenAPI, queryParams, CustomHeader)
  //     .then((response) => {
  //       if (response && response.status === 200) {
  //         let userDetail = formatLoginResult(response.data);
  //         reactLocalStorage.setObject("userDetail", userDetail);
  //       }
  //     }).catch((error) => {

  //     });
  // }, (Detail.expires_in - 60) * 1000);
}

class Main extends Component {
  constructor(props) {
    super(props)
    this.child = React.createRef()
    this.state = {
      visibelPageNotFound: false,
      breadcrumbTrail: {},
      isLoader: false,
    }
  }

  UNSAFE_componentWillMount() {
    if (this?.props?.location?.search) {

      if (reactLocalStorage.getObject('isUserLoggedIn') === true) return false;
      this.setState({ isLoader: true })
      const queryParams = new URLSearchParams(this.props.location.search);
      const token = queryParams.get('token')
      const username = queryParams.get('username')

      let reqParams = {
        Token: token,
        UserName: username,
      }

      this.props.AutoSignin(reqParams, (res) => {
        if (res && res.status === 200) {
          let userDetail = formatLoginResult(res.data.Data);
          reactLocalStorage.setObject("userDetail", userDetail);
          this.props.logUserIn();
          setTimeout(() => {
            this.setState({ isLoader: false })
            window.location.replace("/");
          }, 1000)
        }
      })

    }
  }

  componentDidMount() {
    //this.refreshToken()
  }

  /**
   * @method REFRESH TOKEN
   * @description REFRESH TOKEN CALL AFTER A CERTAIN TIME
   */
  refreshToken = () => {
    const Detail = userDetails()
    if (Object.keys(Detail).length > 0) {

      const token_expires_at = new Date(Detail.expires);
      // const token_expires_at = new Date('Tue, 18 May 2021 17:57:23');
      const current_time = new Date();
      const totalSeconds = Math.floor((token_expires_at - (current_time)) / 1000);
      const callBeforeSeconds = 15 * 1000; //Refresh token API will call before 15 seconds 

      if ((totalSeconds * 1000 - callBeforeSeconds) > 0) {

        setInterval(() => {
          let reqParams = {
            IsRefreshToken: true,
            refresh_token: Detail.RefreshToken,
            ClientId: 'self',
            grant_type: 'refresh_token',
          }

          this.props.TokenAPI(reqParams, (res) => {
            if (res && res.status === 200) {
              let userDetail = formatLoginResult(res.data);
              reactLocalStorage.setObject("userDetail", userDetail);
            }
          })
        }, totalSeconds * 1000 - callBeforeSeconds)

      }
    }
  }

  /**
   * @method handlePageNotFound
   * @description Handle the page not found when the url entered is incorrect.
   */
  handlePageNotFound = () => {
    this.setState({
      visibelPageNotFound: true,
    })
  }

  /**
   * @method hidePageNotFound
   * @description Handle the page not found when the url entered is incorrect.
   */
  hidePageNotFound = () => {
    this.setState({
      visibelPageNotFound: false,
    })
  }

  /**
   * @method handleUserData
   * @description Method used when refreshing browser then consistency of logged in user.
   */
  handleUserData = () => {
    let userData = reactLocalStorage.getObject('userDetail')
    this.props.showUserData(userData)
  }

  setSidebarLinks = (linkText) => {
    this.setState({
      sidebarLinks: linkText,
    })
  }

  render() {
    const { location } = this.props
    let isLogin = false
    let checkLogin = reactLocalStorage.getObject('isUserLoggedIn')
    reactLocalStorage.set('location', location.pathname)
    if (typeof checkLogin == 'object') {
      isLogin = false
    }
    if (checkLogin === true) {
      isLogin = true
    } else {
      isLogin = false
    }

    const fullSizeClass =
      location.pathname === COSTING_PATH ||
        location.pathname === APPROVAL_LISTING_PATH ||
        location.pathname === APPROVAL_SUMMARY_PATH ||
        location.pathname === COSTING_BULK_UPLOAD ||
        location.pathname === COSTING_SUMMARY ||
        location.pathname === SIMULATION_APPROVAL_SUMMARY_PATH ||
        location.pathname === DASHBOARD_PATH ||
        location.pathname === DASHBOARD_PATH_SECOND ||
        location.pathname === DASHBOARDWITHGRAPH_PATH ? 'w-100' : ''

    //  ADD DASHBPOARD CLASS FOR DASHBOARD PAGE ONLY
    const DashboardPage = location.pathname === DASHBOARDWITHGRAPH_PATH ? 'Dashboard-page' : '';
    const DashboardMainPage = location.pathname === DASHBOARD_PATH || location.pathname === DASHBOARD_PATH_SECOND ? 'Dashboard-page' : ''
    //  ADD DASHBPOARD CLASS FOR DASHBOARD PAGE ONLY



    return (
      <Suspense fallback={<Loader />}>
        {this.state.isLoader && <Loader />}
        <div className="">
          {!this.state.visibelPageNotFound && isLogin && (
            <div className="sf-mainwrapper">
              <div className=" sf-mainheader">
                <div className="container-fluild header-menu">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="inner-header main-menu">
                        <Route
                          path="/"
                          render={(props) => (
                            <SideBar
                              {...props}
                              isUserLoggedIn={this.props.isUserLoggedIn}
                              logUserIn={this.props.logUserIn}
                              logUserOut={this.props.logUserOut}
                              breadCrumbTrail={this.breadCrumbTrail}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                  {isLogin && !this.state.visibelPageNotFound && (<Breadcrumb {...this.props} />)}
                </div>
              </div>
            </div>
          )}

          <div className={isLogin ? 'blue-box' : ''}>
            <div className={isLogin ? 'main-section' : ''}>
              {isLogin &&
                !this.state.visibelPageNotFound &&
                location.pathname !== COSTING_PATH &&
                location.pathname !== APPROVAL_SUMMARY_PATH &&
                location.pathname !== APPROVAL_LISTING_PATH &&
                location.pathname !== COSTING_BULK_UPLOAD &&
                location.pathname !== COSTING_SUMMARY &&
                location.pathname !== DASHBOARDWITHGRAPH_PATH &&
                location.pathname !== SIMULATION_APPROVAL_SUMMARY_PATH &&
                location.pathname !== DASHBOARD_PATH &&
                location.pathname !== DASHBOARD_PATH_SECOND &&
                (
                  <LeftMenu {...this.props} />
                )}

              <div className={isLogin ? `content-page ${fullSizeClass} ${DashboardPage} ${DashboardMainPage}` : ''}>
                <div className={`${isLogin ? `middleContainer ${Simulation ? 'h-auto' : ''}` : ''}`}>
                  <Switch>

                    <Route exact path="/" component={AuthMiddleware(Dashboard, DASHBOARD)} />

                    <Route
                      path="/login"
                      render={(props) => (
                        <Login
                          {...props}
                          isUserLoggedIn={this.props.isUserLoggedIn}
                          logUserIn={this.props.logUserIn}
                        />
                      )}
                    />

                    <Route path="/users" component={AuthMiddleware(User, USER)} />

                    <Route path="/dashboard" component={AuthMiddleware(Dashboard, DASHBOARD)} />

                    <Route path="/dashboardWithGraph" component={(DashboardWithGraph)} />

                    <Route path="/part-master" component={AuthMiddleware(PartMaster, PART)} />

                    <Route path="/UOM-Master" component={AuthMiddleware(UOMMaster, UOM)} />

                    <Route path="/raw-material-master" exact component={AuthMiddleware(RowMaterialMaster, RAW_MATERIAL,)} />

                    <Route path="/raw-material-master/raw-material-approval" component={AuthMiddleware(RMApproval, RAW_MATERIAL)} />

                    <Route path="/plant-master" component={AuthMiddleware(PlantMaster, PLANT)} />

                    <Route path="/vendor-master" component={AuthMiddleware(SupplierMaster, VENDOR)} />

                    <Route path="/bop-master" component={AuthMiddleware(BOPMaster, BOP)} />

                    <Route path="/fuel-master" component={AuthMiddleware(FuelMaster, FUEL_AND_POWER)} />

                    <Route path="/machine-master" component={AuthMiddleware(MachineMaster, MACHINE)} />

                    <Route path="/operation-master" component={AuthMiddleware(OperationsMaster, OPERATION)} />

                    <Route path="/freight-master" component={AuthMiddleware(FreightMaster, FREIGHT)} />

                    <Route path="/labour-master" component={AuthMiddleware(LabourListing, LABOUR)} />

                    <Route path="/overhead-profits-master" component={AuthMiddleware(OverheadProfit, OVERHEAD_AND_PROFIT,)} />

                    <Route path="/interest-rate-master" component={AuthMiddleware(InterestRate, INTEREST_RATE)} />

                    <Route path="/costing" component={CostingRoutes} exact={true} />

                    <Route path="/costing-summary" component={CostingRoutes} />

                    {/* <Route path="/approval-summary" component={AuthMiddleware(ApprovalSummary, Approval_Summary)} /> */}
                    <Route path="/approval-summary" component={ApprovalSummary} />

                    <Route path="/approval-listing" component={ApprovalListing} />
                    {/* <Route path="/approval-listing" component={AuthMiddleware(ApprovalListing,Approval_Listing)} /> */}

                    <Route path="/costing-bulkUpload" component={CostingSummaryBulkUpload} />

                    <Route path="/reason-master" component={AuthMiddleware(ReasonListing, REASON)} />

                    <Route path="/volume-master" component={AuthMiddleware(VolumeListing, VOLUME)} />

                    <Route path="/client-master" component={AuthMiddleware(ClientMaster, CLIENT)} />

                    <Route path="/exchange-master" component={AuthMiddleware(ExchangeRateListing, EXCHANGE_RATE,)} />

                    <Route path="/tax-master" component={AuthMiddleware(TaxListing, TAX)} />

                    {/* <Route path="/simulation-history" component={AuthMiddleware(SimulationHistory, Simulation_History)} /> */}

                    {/* <Route path="/simulation-history" component={SimulationHistory} /> */}
                    <Route path="/simulation-history" component={SimulationApprovalListing} />

                    <Route path='/simulation-approval-summary' component={SimulationApprovalSummary} />

                    <Route path="/simulation" component={Simulation} />

                    <Route path="/simulation-upload" component={SimulationUpload} />

                    <Route path="/costing-breakup-details" component={NewReport} />


                    <Route path="/costing-detail-report" component={ReportListing} />

                    {/* <Route path='/simulation-approval-listing' component={SimulationApprovalListing} /> */}

                    <Route path="/product-master" component={productMaster} />

                    <Route
                      render={(props) => (
                        <NotFoundPage
                          {...props}
                          isLoggeIn={false}
                          handlePageNotFound={this.handlePageNotFound}
                          hidePageNotFound={this.hidePageNotFound}
                        />
                      )}
                    />
                  </Switch>
                </div>
              </div>

            </div>
          </div>
          {!this.state.visibelPageNotFound && (
            <div>
              <Route path="/" component={Footer} />
            </div>
          )}
          <ReduxToastr
            timeOut={2500}
            newestOnTop={false}
            preventDuplicates
            position="top-right"
            transitionIn="fadeIn"
            transitionOut="fadeOut"
            // transitionIn="bounceIn"
            // transitionOut="bounceOut"
            progressBar
          />
          {this.handleUserData()}
        </div>
      </Suspense>
    )
  }
}

/**
 * @method connect
 * @description connect with redux
 * @param {function} mapStateToProps
 * @param {function} mapDispatchToProps
 */
export default connect(null, { showUserData, TokenAPI, AutoSignin })(Main)
