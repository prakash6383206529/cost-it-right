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
import { showUserData, TokenAPI } from '../actions/auth/AuthActions'
import AuthMiddleware from '../AuthMiddleware'
import {
  BOP, DASHBOARD, FREIGHT, FUEL_AND_POWER, INTEREST_RATE, LABOUR, MACHINE, OPERATION,
  OVERHEAD_AND_PROFIT, PART, PLANT, RAW_MATERIAL, UOM, USER, VENDOR,
  REASON, VOLUME, CLIENT, EXCHANGE_RATE, TAX, COSTING_PATH, APPROVAL_LISTING_PATH,
  APPROVAL_SUMMARY_PATH, COSTING_BULK_UPLOAD, COSTING_SUMMARY,Approval_Summary,Approval_Listing,CostingSummary_BulkUpload,Simulation_History,Simulation_Page,Simulation_Upload
} from '../config/constants'
import ApprovalSummary from './costing/components/approval/ApprovalSummary'
import ApprovalListing from './costing/components/approval/ApprovalListing'
import CostingSummaryBulkUpload from './costing/components/CostingSummaryBulkUpload'
import SimulationHistory from './simulation/components/SimulationHistory'
import Simulation from './simulation/components/Simulation'
import CostingSummary from './costing/components/CostingSummary'
import SimulationUpload from './simulation/components/SimulationUpload'
import { formatLoginResult, userDetails } from '../helper'

class Main extends Component {
  constructor(props) {
    super(props)
    this.child = React.createRef()
    this.state = {
      visibelPageNotFound: false,
      breadcrumbTrail: {},
    }
  }

  componentDidMount() {
    const Detail = userDetails()
    if (Object.keys(Detail).length > 0) {

      const token_expires_at = new Date(Detail.expires);
      // const token_expires_at = new Date('Mon, 17 May 2021 12:09:15');
      const current_time = new Date();
      const totalSeconds = Math.floor((token_expires_at - (current_time)) / 1000);
      const callBeforeSeconds = 15 * 1000; //Refresh token API will call before 15 seconds 

      console.log('token_expires_at: ', token_expires_at);
      console.log('totalSeconds * 1000 - callBeforeSeconds', totalSeconds * 1000 - callBeforeSeconds)

      if ((totalSeconds * 1000 - callBeforeSeconds) > 0) {

        setTimeout(() => {
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
        location.pathname === COSTING_SUMMARY
        ? 'w-100'
        : ''

    return (
      <Suspense fallback={<Loader />}>
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
                (
                  <LeftMenu {...this.props} />
                )}

              <div className={isLogin ? `content-page ${fullSizeClass}` : ''}>
                <div className={isLogin ? 'middleContainer' : ''}>
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

                    <Route path="/part-master" component={AuthMiddleware(PartMaster, PART)} />

                    <Route path="/UOM-Master" component={AuthMiddleware(UOMMaster, UOM)} />

                    <Route path="/raw-material-master" component={AuthMiddleware(RowMaterialMaster, RAW_MATERIAL,)} />

                    <Route path="/plant-master" component={AuthMiddleware(PlantMaster, PLANT)} />

                    <Route path="/vendor-master" component={AuthMiddleware(SupplierMaster, VENDOR)} />

                    <Route path="/bop-master" component={AuthMiddleware(BOPMaster, BOP)} />

                    <Route path="/fuel-master" component={AuthMiddleware(FuelMaster, FUEL_AND_POWER)} />

                    <Route path="/machine-master" component={AuthMiddleware(MachineMaster, MACHINE)} />

                    <Route path="/operation-master" component={AuthMiddleware(OperationListing, OPERATION)} />

                    <Route path="/freight-master" component={AuthMiddleware(FreightMaster, FREIGHT)} />

                    <Route path="/labour-master" component={AuthMiddleware(LabourListing, LABOUR)} />

                    <Route path="/overhead-profits-master" component={AuthMiddleware(OverheadProfit, OVERHEAD_AND_PROFIT,)} />

                    <Route path="/interest-rate-master" component={AuthMiddleware(InterestRate, INTEREST_RATE)} />

                    <Route path="/costing" component={CostingRoutes} />

                    <Route path="/costing-summary" component={CostingRoutes} />
                    
                    
                    <Route path="/approval-summary" component={AuthMiddleware(ApprovalSummary,Approval_Summary)} />

                    <Route path="/approval-listing" component={AuthMiddleware(ApprovalListing,Approval_Listing)} />

                    <Route path="/costing-bulkUpload" component={AuthMiddleware(CostingSummaryBulkUpload,CostingSummary_BulkUpload)} />

                    <Route path="/reason-master" component={AuthMiddleware(ReasonListing, REASON)}/>

                    <Route path="/volume-master" component={AuthMiddleware(VolumeListing, VOLUME)} />

                    <Route path="/client-master" component={AuthMiddleware(ClientMaster, CLIENT)} />

                    <Route path="/exchange-master" component={AuthMiddleware(ExchangeRateListing, EXCHANGE_RATE,)} />

                    <Route path="/tax-master" component={AuthMiddleware(TaxListing, TAX)} />

                    <Route path="/simulation-history" component={AuthMiddleware(SimulationHistory,Simulation_History)} />

                    <Route path="/simulation" component={AuthMiddleware(Simulation,Simulation_Page)} />

                    <Route path="/simulation-upload" component={AuthMiddleware(SimulationUpload,Simulation_Upload)} />

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
export default connect(null, { showUserData, TokenAPI })(Main)
