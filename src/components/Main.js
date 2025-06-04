import React, { Component, Suspense } from "react";
import { reactLocalStorage } from "reactjs-localstorage";
import { connect } from "react-redux";
import SideBar from "./nav/NavBar";
import { Route, Switch } from "react-router-dom";
import ReduxToastr from "react-redux-toastr";
import "react-toastify/dist/ReactToastify.css";
import Footer from "./common/Footer";
import Login from "./login/Login";
import NotFoundPage from "./common/NotFoundPage";
import User from "./user";
import Dashboard from "./dashboard";
import DashboardWithGraph from "./dashboard/DashboardWithGraph";
import { Loader } from "../../src/components/common/Loader";
import PartMaster from "./masters/part-master";
import UOMMaster from "./masters/uom-master";
import RowMaterialMaster from "./masters/material-master";
import PlantMaster from "./masters/plant-master/index";
import SupplierMaster from "./masters/supplier-master/VendorListing";
import BOPMaster from "./masters/bop-master";
import FuelMaster from "./masters/fuel-master";
import FreightMaster from "./masters/freight-master";
import LabourListing from "./masters/labour-master/LabourListing";
import OverheadProfit from "./masters/overhead-profit-master";
import InterestRatePayment from "./masters/interest-rate-master";
import MachineMaster from "./masters/machine-master";
import ReasonListing from "./masters/reason-master/ReasonListing";
import VolumeListing from "./masters/volume-master/VolumeListing";
import ClientMaster from "./masters/client-master/AddClient";
import ExchangeRateListing from "./masters/exchange-rate-master/ExchangeRateListing";
import RejectionMaster from "./masters/rejection-master";
import TaxListing from "./masters/tax-master/TaxListing";
import LeftMenu from "./nav/Leftsidemenu";
import Breadcrumb from "./nav/Breadcrumb";
import CostingRoutes from "./costing/Routes";
import {
  showUserData,
  TokenAPI,
  AutoSignin,
} from "../actions/auth/AuthActions";
import AuthMiddleware from "../AuthMiddleware";
import {
  BOP,
  DASHBOARD,
  FREIGHT,
  FUEL_AND_POWER,
  INTEREST_RATE,
  LABOUR,
  MACHINE,
  OPERATION,
  OVERHEAD_AND_PROFIT,
  PART,
  PLANT,
  RAW_MATERIAL,
  UOM,
  USER,
  VENDOR,
  REASON,
  VOLUME,
  CLIENT,
  EXCHANGE_RATE,
  TAX,
  COSTING_PATH,
  APPROVAL_LISTING_PATH,
  COSTING_BREAKUP_DETAILS_REPORT,
  APPROVAL_APP,
  APPROVAL_SUMMARY_PATH,
  COSTING_BULK_UPLOAD,
  COSTING_SUMMARY_,
  COSTING_SUMMARY,
  Simulation_Page,
  Simulation_Upload,
  API,
  DASHBOARDWITHGRAPH_PATH,
  SIMULATION_APPROVAL_SUMMARY_PATH,
  DASHBOARD_PATH,
  DASHBOARD_PATH_SECOND,
  SHEET_METAL,
  SIMULATION_PATH,
  SIMULATION_HISTORY_PATH,
  USER_PATH,
  RFQ_LISTING,
  AUCTION_LISTING,
  RFQ,
  COST_RATIO_REPORT,
  BUDGETING,
  NFR_LISTING,
  CUSTOMER_RFQ,
  MASTER_BENCHMARK_REPORT,
  COST_MOVEMENT_REPORT,
  SUPPLIER_CONTRIBUTION_REPORT,
  SALE_PROVISION_REPORT,
  PURCHASE_PROVISION_REPORT,
  CUSTOMER_POAM_REPORT,
  HEAD_WISE_COSTING_GOT_GIVEN,
  PLANT_HEAD_WISE,
  PRODUCT_ROLLOUT,
  OUTSOURCING,
  COSTING_DETAIL,
  MASTER_COST_MOVEMENT_REPORT,
  RESET_PASSWORD,
  FORGET_PASSWORD,
  NFR_INSIGHT_DETAILS,
  INSIGHT_SIMULATION_REPORT,
  lOGIN_AUDIT,
  VENDOR_MANAGEMENT,
  SUPPLIER_MANAGEMENT,
  lOGIN_AUDITS,
  INITIATE_UNBLOCKING,
  SUPPLIER_APPROVAL_SUMMARY,
  APPROVAL_LISTING,
  LPS,
  INDEXATION,
  ADD_AUCTION,
  COSTING_BULKUPLOAD,
  COST_VARIANCE_REPORT,
  COST_DEVIATION_REPORT,
  REJECTION,
  CUSTOMER_RFQ_LISTING,
  BUSINESS_VALUE_REPORT,
} from "../config/constants";
import ApprovalSummary from "./costing/components/approval/ApprovalSummary";
import CostingSummaryBulkUpload from "./costing/components/CostingSummaryBulkUpload";
import SimulationUpload from "./simulation/components/SimulationUpload";
import { userDetails } from "../helper/auth";
import { formatLoginResult } from "../helper/ApiResponse";
import axios from "axios";
import CostingDetailReport from "./report/components/CostingDetailReport";
import SimulationApprovalSummary from "./simulation/components/SimulationApprovalSummary";
import OperationsMaster from "./masters/operation/index";
import CostingBenchmarkReport from "./report/components/CostingBenchmarkReport";
import ToasterBoXWrapper from "./common/ToasterBoXWrapper";
import SimulationInsights from "./report/components/SimulationInsights";
import SimulationRoutes from "./simulation/Routes";
import CommonApproval from "./masters/material-master/CommonApproval";
import RfqListing from "./rfq/RfqListing";
import CostMovementReport from "./report/components/CostMovementReport/CostMovementReport";
import CostRatioReport from "./report/components/CostRatioReport/CostRatioReport";
import SupplierContributionReport from "./report/components/SupplierContribution";
import NfrTabs from "./masters/nfr";
import SaleProvisionReport from "./report/components/SaleProvisionReport/SaleProvisionReport";
import PurchaseProvisionReport from "./report/components/PurchaseProvisionReport/PurchaseProvisionReport";
import CustomerPoamSummaryReport from "./report/components/CustomerPoamSummaryReport/CustomerPoamSummaryReport";
import HeadWiseCostingGotGiven from "./report/components/HeadwiseCostingGotGiven/HeadWiseCostingGotGiven";
import MasterCostMovement from "./report/components/CostMovementByMaster/MasterCostMovement";
import BudgetMaster from "./masters/budget-master";
import GotGivenReport from "./report/components/GotGivenReport/GotGivenReport";
import PipdReport from "./report/components/PIPDReport/PipdReport";
import PlantWiseCostingGotGiven from "./report/components/PlantWiseCostingGotGiven/PlantWiseCostingGotGiven";
import ProductRollout from "./report/components/ProductRollout";
import OutsourcingListing from "./masters/outsourcing-master/OutsourcingListing";
import CostingForm from "./costing/components";
import SimulationForm from "./simulation/components";
import ResetPassword from "./login/ResetPassword";
import LoginAudit from "./audit/LoginAudit";
import SAPDetailList from "./masters/sap-detail/SAPDetailList";
import NFRInsightsReport from "./report/components/NFRInsightReportFolder/NFRInsightReport";
import VendorManagement from "./vendorManagement";
import InitiateUnblocking from "./vendorManagement/InitiateUnblocking";
import LpsRatingListing from "./vendorManagement/LpsRatingLisitng";
import VendorMaster from "./masters/supplier-master";
import VendorClassificationListing from "./vendorManagement/VendorClassificationListing";
import Indexation from "./masters/indexation";
import AuctionIndex from "./rfqAuction/AuctionIndex";
import AddAuction from "./rfqAuction/AddAuction";
import CostVariance from "./report/components/CostVariance/CostVariance";
import BusinessValueReport from "./report/components/BusinessSalesReport/BusinessValueReport";
import setupAxiosInterceptors from "../axiosInterceptor";
import CostDeviation from "./report/components/CostVariance/CostDeviation";

const CustomHeader = {
  "Content-Type": "application/x-www-form-urlencoded",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": "true",
  Authorization: `Bearer NRIsJAXFS-IgPMtfW05J1EiTwhv4z37BnFCk2TynvAdVYMuBIal7dTYyfboxRFjvPJ1zPl4r4LfQJ8_1fKDnSxTmGmThhl6YabKHaGvzp2WDQ7P0wFZs2wW10Mcmkt4Xb4ybDGzwSLt6fwRuI1uGNRuyNMxKQz-s533rIF5Qx08vwumo5ogN5x_oyi__b4KXJWbUU_0qLaJGLwISEf4o3_4CPBoP6Gv_tAGIO1W250SzOF3zwYpTxi8LwghOtQse`,
  "Access-From": "WEB",
  "Api-Key": `${process.env.REACT_APP_API_KEY}`,
};

const Detail = userDetails();


class Main extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      visibelPageNotFound: false,
      breadcrumbTrail: {},
      isLoader: false,
    };
  }

  UNSAFE_componentWillMount() {
    if (this?.props?.location?.search) {
      if (reactLocalStorage.getObject("isUserLoggedIn") === true) return false;
      this.setState({ isLoader: true });
      const queryParams = new URLSearchParams(this.props.location.search);
      const token = queryParams.get("token");
      const username = queryParams.get("username");

      let reqParams = {
        Token: token,
        UserName: username,
      };
      if (
        this.props.location.pathname === RESET_PASSWORD ||
        this.props.location.pathname === FORGET_PASSWORD
      ) {
        this.setState({ isLoader: false });
      } else {
        this.props.AutoSignin(reqParams, (res) => {
          if (res && res.status === 200) {
            let userDetail = formatLoginResult(res.data.Data);
            localStorage.setItem("userDetail", JSON.stringify(userDetail));
            //MIL DEPARTMENT RELATED CHANGE
            // let departmentList = ''
            // const dept = userDetail && userDetail.Department.map((item) => {
            //   if (item.DepartmentName === 'Corporate' || item.DepartmentName === 'Administration') {
            //     return ''
            //   } else {
            //     return item.DepartmentCode
            //   }

            // })
            // departmentList = dept.join(',')
            // localStorage.setItem("userDetail", JSON.stringify(userDetail))
            // reactLocalStorage.setObject("departmentList", departmentList);
            this.props.logUserIn();
            setTimeout(() => {
              this.setState({ isLoader: false });
              window.location.replace("/");
            }, 1000);
          }
        });
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
    });
  };

  /**
   * @method hidePageNotFound
   * @description Handle the page not found when the url entered is incorrect.
   */
  hidePageNotFound = () => {
    this.setState({
      visibelPageNotFound: false,
    });
  };

  /**
   * @method handleUserData
   * @description Method used when refreshing browser then consistency of logged in user.
   */
  handleUserData = () => {
    let userData = JSON.parse(localStorage.getItem("userDetail"));
    this.props.showUserData(userData);
  };

  setSidebarLinks = (linkText) => {
    this.setState({
      sidebarLinks: linkText,
    });
  };

  render() {

    if (Detail && Object.keys(Detail).length > 0){
    setupAxiosInterceptors();
    }
    const { location } = this.props;
    let isLogin = false;
    let checkLogin = reactLocalStorage.getObject("isUserLoggedIn");
    reactLocalStorage.set("location", location.pathname);
    if (typeof checkLogin == "object") {
      isLogin = false;
    }
    if (checkLogin === true) {
      isLogin = true;
    } else {
      isLogin = false;
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
        location.pathname === DASHBOARDWITHGRAPH_PATH ||
        location.pathname === SIMULATION_PATH ||
        location.pathname === SIMULATION_HISTORY_PATH ||
        location.pathname === USER_PATH ||
        location.pathname === RFQ_LISTING ||
        location.pathname === AUCTION_LISTING ||
        location.pathname === PRODUCT_ROLLOUT ||
        location.pathname === SUPPLIER_MANAGEMENT ||
        location.pathname === NFR_LISTING ||
        location.pathname === ADD_AUCTION ||
        location.pathname === lOGIN_AUDITS
        ? "w-100"
        : "";

    //  ADD DASHBPOARD CLASS FOR DASHBOARD PAGE ONLY
    const DashboardPage =
      location.pathname === DASHBOARDWITHGRAPH_PATH ? "Dashboard-page" : "";
    const DashboardMainPage =
      location.pathname === DASHBOARD_PATH ||
        location.pathname === DASHBOARD_PATH_SECOND ||
        location.pathname === PRODUCT_ROLLOUT
        ? "Dashboard-page"
        : "";
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
                </div>
              </div>
            </div>
          )}
          <div className={isLogin ? "blue-box" : ""}>
            <div className={isLogin ? "main-section" : ""}>
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
                location.pathname !== SIMULATION_PATH &&
                location.pathname !== SIMULATION_HISTORY_PATH &&
                location.pathname !== USER_PATH &&
                location.pathname !== RFQ_LISTING &&
                location.pathname !== AUCTION_LISTING &&
                location.pathname !== NFR_LISTING &&
                location.pathname !== PRODUCT_ROLLOUT &&
                location.pathname !== SUPPLIER_MANAGEMENT &&
                location.pathname !== lOGIN_AUDITS &&
                location.pathname !== SUPPLIER_APPROVAL_SUMMARY &&
                location.pathname !== ADD_AUCTION && 
                location.pathname !== CUSTOMER_RFQ_LISTING && (
                  <LeftMenu {...this.props} />
                )}

              <div
                className={
                  isLogin
                    ? `content-page w-100 ${fullSizeClass} ${DashboardPage} ${DashboardMainPage}`
                    : ""
                }
              >
                <div className={`${isLogin ? `middleContainer` : ""}`}>
                  <Switch>
                    <Route
                      exact
                      path="/"
                      component={AuthMiddleware(Dashboard, DASHBOARD)}
                    />

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

                    <Route
                      path="/users"
                      component={AuthMiddleware(User, USER)}
                    />

                    <Route path="/forget-password" component={ResetPassword} />

                    <Route
                      path="/dashboard"
                      component={AuthMiddleware(Dashboard, DASHBOARD)}
                    />

                    <Route
                      path="/dashboardWithGraph"
                      component={AuthMiddleware(DashboardWithGraph, DASHBOARD)}
                    />

                    <Route
                      path="/part-master"
                      component={AuthMiddleware(PartMaster, PART)}
                    />

                    <Route
                      path="/UOM-Master"
                      component={AuthMiddleware(UOMMaster, UOM)}
                    />

                    <Route
                      path="/raw-material-master"
                      exact
                      component={AuthMiddleware(
                        RowMaterialMaster,
                        RAW_MATERIAL
                      )}
                    />

                    <Route
                      path="/raw-material-master/raw-material-approval"
                      component={AuthMiddleware(CommonApproval, RAW_MATERIAL)}
                    />

                    <Route
                      path="/plant-master"
                      component={AuthMiddleware(PlantMaster, PLANT)}
                    />

                    <Route
                      path="/vendor-master"
                      component={AuthMiddleware(VendorMaster, VENDOR)}
                    />

                    <Route
                      path="/bop-master"
                      component={AuthMiddleware(BOPMaster, BOP)}
                    />

                    <Route
                      path="/fuel-master"
                      component={AuthMiddleware(FuelMaster, FUEL_AND_POWER)}
                    />

                    <Route
                      path="/machine-master"
                      component={AuthMiddleware(MachineMaster, MACHINE)}
                    />

                    <Route
                      path="/operation-master"
                      component={AuthMiddleware(OperationsMaster, OPERATION)}
                    />

                    <Route
                      path="/freight-master"
                      component={AuthMiddleware(FreightMaster, FREIGHT)}
                    />

                    <Route
                      path="/labour-master"
                      component={AuthMiddleware(LabourListing, LABOUR)}
                    />

                    <Route
                      path="/overhead-profits-master"
                      component={AuthMiddleware(
                        OverheadProfit,
                        OVERHEAD_AND_PROFIT
                      )}
                    />
                    <Route
                      path="/rejection-master"
                      component={AuthMiddleware(
                        RejectionMaster,
                        REJECTION
                      )}
                    />
                    <Route
                      path="/interest-rate-master"
                      component={AuthMiddleware(InterestRatePayment, INTEREST_RATE)}
                    />

                    <Route
                      path="/costing"
                      component={CostingRoutes}
                      exact={true}
                    />
                    <Route
                      path="/costing-summary"
                      component={AuthMiddleware(CostingForm, COSTING_SUMMARY_)}
                    />

                    {/* <Route path="/approval-summary" component={AuthMiddleware(ApprovalSummary, Approval_Summary)} /> */}
                    <Route
                      path="/approval-summary"
                      component={AuthMiddleware(ApprovalSummary, APPROVAL_APP)}
                    />

                    <Route
                      path="/approval-listing"
                      component={AuthMiddleware(CostingForm, APPROVAL_APP)}
                    />
                    {/* <Route path="/approval-listing" component={AuthMiddleware(ApprovalListing,Approval_Listing)} /> */}

                    <Route
                      path="/costing-bulkUpload"
                      component={AuthMiddleware(
                        CostingSummaryBulkUpload,
                        COSTING_BULKUPLOAD
                      )}
                    />

                    <Route
                      path="/reason-master"
                      component={AuthMiddleware(ReasonListing, REASON)}
                    />

                    <Route
                      path="/volume-master"
                      component={AuthMiddleware(VolumeListing, VOLUME)}
                    />

                    <Route
                      path="/client-master"
                      component={AuthMiddleware(ClientMaster, CLIENT)}
                    />

                    <Route
                      path="/exchange-master"
                      component={AuthMiddleware(
                        ExchangeRateListing,
                        EXCHANGE_RATE
                      )}
                    />

                    <Route
                      path="/tax-master"
                      component={AuthMiddleware(TaxListing, TAX)}
                    />

                    {/* <Route path="/simulation-history" component={AuthMiddleware(SimulationHistory, Simulation_History)} /> */}

                    {/* <Route path="/simulation-history" component={SimulationHistory} /> */}
                    <Route
                      path="/simulation-history"
                      component={AuthMiddleware(
                        SimulationForm,
                        Simulation_Page
                      )}
                    />

                    <Route
                      path="/simulation-approval-summary"
                      component={AuthMiddleware(
                        SimulationApprovalSummary,
                        Simulation_Page
                      )}
                    />
                    <Route
                      path="/simulation"
                      component={SimulationRoutes}
                      exact={true}
                    />
                    <Route
                      path="/simulation-upload"
                      component={AuthMiddleware(
                        SimulationUpload,
                        Simulation_Upload
                      )}
                    />
                    <Route
                      path="/costing-breakup-report"
                      component={AuthMiddleware(
                        CostingDetailReport,
                        COSTING_BREAKUP_DETAILS_REPORT
                      )}
                    />
                    <Route
                      path="/cost-ratio-report"
                      component={AuthMiddleware(
                        CostRatioReport,
                        COST_RATIO_REPORT
                      )}
                    />
                    <Route
                      path="/master-benchmarking-report"
                      component={AuthMiddleware(
                        CostingBenchmarkReport,
                        MASTER_BENCHMARK_REPORT
                      )}
                    />
                    <Route
                      path="/cost-movement-report"
                      component={AuthMiddleware(
                        CostMovementReport,
                        COST_MOVEMENT_REPORT
                      )}
                    />
                    <Route
                      path="/master-cost-movement-report"
                      component={AuthMiddleware(
                        MasterCostMovement,
                        MASTER_COST_MOVEMENT_REPORT
                      )}
                    />
                    <Route
                      path="/supplier-contribution-report"
                      component={AuthMiddleware(
                        SupplierContributionReport,
                        SUPPLIER_CONTRIBUTION_REPORT
                      )}
                    />
                    <Route
                      path="/sale-provision-report"
                      component={AuthMiddleware(
                        SaleProvisionReport,
                        SALE_PROVISION_REPORT
                      )}
                    />
                    <Route
                      path="/purchase-provision-report"
                      component={AuthMiddleware(
                        PurchaseProvisionReport,
                        PURCHASE_PROVISION_REPORT
                      )}
                    />
                    <Route
                      path="/customer-poam-summary-report"
                      component={AuthMiddleware(
                        CustomerPoamSummaryReport,
                        CUSTOMER_POAM_REPORT
                      )}
                    />
                    <Route
                      path="/head-wise-costing-got-given"
                      component={AuthMiddleware(
                        HeadWiseCostingGotGiven,
                        HEAD_WISE_COSTING_GOT_GIVEN
                      )}
                    />
                    <Route
                      path="/plant-head-wise"
                      component={AuthMiddleware(
                        PlantWiseCostingGotGiven,
                        PLANT_HEAD_WISE
                      )}
                    />
                    <Route path="/pipd-report" component={PipdReport} />
                    <Route path="/product-rollout" component={ProductRollout} />
                    {/*  NEED TO ADD PATH FROM BACKEND */}
                    <Route
                      path="/simulation-insights"
                      component={AuthMiddleware(
                        SimulationInsights,
                        INSIGHT_SIMULATION_REPORT
                      )}
                    />
                    <Route
                      path="/rfq-listing"
                      component={AuthMiddleware(RfqListing, RFQ)}
                    />
                    <Route
                      path="/customer-rfq"
                      component={AuthMiddleware(NfrTabs, CUSTOMER_RFQ)}
                    />
                    <Route
                      path="/budgeting"
                      component={AuthMiddleware(BudgetMaster, BUDGETING)}
                    />
                    <Route
                      path="/got-given-summary-details-report"
                      component={GotGivenReport}
                    />
                    <Route
                      path="/cost-deviation"
                      component={AuthMiddleware(CostDeviation,COST_DEVIATION_REPORT )}
                    />

                    <Route
                      path="/out-sourcing-master"
                      component={AuthMiddleware(
                        OutsourcingListing,
                        OUTSOURCING
                      )}
                    />
                    <Route path="/cost-variance" component={AuthMiddleware(CostVariance, COST_VARIANCE_REPORT)} />
                    <Route path="/business-value-summary" component={AuthMiddleware(BusinessValueReport, BUSINESS_VALUE_REPORT)} />
                    <Route path="/sap-push-detail" component={SAPDetailList} />
                    <Route
                      path="/nfr-insights-details"
                      component={AuthMiddleware(
                        NFRInsightsReport,
                        NFR_INSIGHT_DETAILS
                      )}
                    />
                    <Route
                      path="/login-audit"
                      component={AuthMiddleware(LoginAudit, lOGIN_AUDIT)}
                    />
                    <Route
                      path="/initiate-unblocking"
                      component={AuthMiddleware(
                        VendorManagement,
                        INITIATE_UNBLOCKING
                      )}
                    />
                    <Route
                      path="/supplier-approval-summary"
                      component={(CommonApproval, APPROVAL_LISTING)}
                    />
                    <Route
                      path="/initiate-unblocking "
                      component={AuthMiddleware(
                        InitiateUnblocking,
                        INITIATE_UNBLOCKING
                      )}
                    />
                    <Route
                      path="/vendor-classification"
                      component={AuthMiddleware(
                        VendorClassificationListing,
                        VENDOR_MANAGEMENT
                      )}
                    />
                    <Route
                      path="/lps-rating"
                      component={AuthMiddleware(LpsRatingListing, LPS)}
                    />
                    <Route
                      path="/material-indexation"
                      component={AuthMiddleware(Indexation, INDEXATION)}
                    />
                    <Route path="/reverse-auction" component={AuctionIndex} />
                    <Route path="/add-auction" component={AddAuction} />

                    {/* <Route path='/simulation-approval-listing' component={SimulationApprovalListing} /> */}

                    {/* <Route path="/product-master" component={productMaster} /> */}

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

          <ToasterBoXWrapper />

          {this.handleUserData()}
        </div>
      </Suspense>
    );
  }
}

/**
 * @method connect
 * @description connect with redux
 * @param {function} mapStateToProps
 * @param {function} mapDispatchToProps
 */
export default connect(null, { showUserData, TokenAPI, AutoSignin })(Main);
