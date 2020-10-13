import React, { Component, Suspense } from "react";
import { reactLocalStorage } from 'reactjs-localstorage';
import { connect } from 'react-redux';
import SideBar from './nav/NavBar';
import { Route, Switch } from "react-router-dom";
import ReduxToastr from 'react-redux-toastr';
import Footer from "../components/footer/Footer";
import Login from './login/Login';
import NotFoundPage from './common/NotFoundPage';
import User from './user';
import Dashboard from './dashboard';
import { Loader } from '../../src/components/common/Loader';
import PartMaster from './masters/sap-masters/part-master';
import UOMMaster from './masters/sap-masters/uom-master';
import RowMaterialMaster from './masters/sap-masters/material-master/raw-material';
import PlantMaster from './masters/sap-masters/plant-master/index';
import SupplierMaster from './masters/sap-masters/supplier-master/VendorListing';
import BOPMaster from './masters/sap-masters/bop-master';
import FuelMaster from './masters/sap-masters/fuel-master';
import OperationListing from './masters/sap-masters/operation/OperationListing';
import FreightMaster from './masters/sap-masters/freight-master';
import LabourListing from './masters/sap-masters/labour-master/LabourListing';
import OverheadProfit from './masters/sap-masters/overhead-profit-master';
import InterestRate from './masters/sap-masters/interest-rate-master/InterestRateListing';
import MachineMaster from './masters/sap-masters/machine-master';
import ReasonListing from "./masters/sap-masters/reason-master/ReasonListing";
import VolumeListing from './masters/sap-masters/volume-master/VolumeListing';
import ClientMaster from './masters/sap-masters/client-master/AddClient';
import ExchangeRateListing from './masters/sap-masters/exchange-rate-master/ExchangeRateListing';
import TaxListing from './masters/sap-masters/tax-master/TaxListing';
import LeftMenu from './nav/Leftsidemenu';
import Breadcrumb from './nav/Breadcrumb';

import Costing from './costing';
import { showUserData } from '../actions';
import AuthMiddleware from '../AuthMiddleware';
import {
  BOP, DASHBOARD, FREIGHT, FUEL_AND_POWER, INTEREST_RATE, LABOUR, MACHINE, OPERATION, OVERHEAD_AND_PROFIT, PART, PLANT,
  RAW_MATERIAL, UOM, USER, VENDOR, SHEET_METAL, REASON, VOLUME, CLIENT, EXCHANGE_RATE, TAX, COSTING_PATH
} from '../config/constants'

class Main extends Component {
  constructor(props) {
    super(props);
    this.child = React.createRef();
    this.state = {
      visibelPageNotFound: false,
      breadcrumbTrail: {},
    };
  }

  /**
   * @method handlePageNotFound
   * @description Handle the page not found when the url entered is incorrect.
   */
  handlePageNotFound = () => {
    this.setState({
      visibelPageNotFound: true
    });
  };

  /**
   * @method handleUserData
   * @description Method used when refreshing browser then consistency of logged in user.
   */
  handleUserData = () => {
    let userData = reactLocalStorage.getObject("userDetail");
    this.props.showUserData(userData)
  }

  setSidebarLinks = (linkText) => {
    this.setState({
      sidebarLinks: linkText
    })
  }

  render() {
    const { location } = this.props;
    let isLogin = false;
    let checkLogin = reactLocalStorage.getObject("isUserLoggedIn");

    if (typeof checkLogin == 'object') {
      isLogin = false;
    } if (checkLogin === true) {
      isLogin = true;
    } else {
      isLogin = false;
    }

    const fullSizeClass = location.pathname === COSTING_PATH ? 'full_size_content' : '';

    return (
      <Suspense fallback={<Loader />}>
        <div className="testting">

          {!this.state.visibelPageNotFound && isLogin &&
            <div className="sf-mainwrapper">
              <div className=" sf-mainheader">
                <div className="container-fluild header-menu">
                  <div className="row">
                    <div className="col-md-12">
                      <div className="inner-header main-menu">
                        <Route
                          path="/"
                          render={props => (
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
                  {isLogin && !this.state.visibelPageNotFound && <Breadcrumb {...this.props} />}
                </div>
              </div>
            </div>}

          <div className={isLogin ? 'blue-box' : ''}>

            <div className={isLogin ? 'main-section' : ''}>
              {isLogin && !this.state.visibelPageNotFound && location.pathname !== COSTING_PATH && <LeftMenu {...this.props} />}

              <div className={isLogin ? `content-page ${fullSizeClass}` : ''}>
                <div className={isLogin ? 'middleContainer' : ''}>
                  <Switch>
                    <Route exact path="/" component={AuthMiddleware(Dashboard, DASHBOARD)} />
                    <Route path="/login" render={(props) =>
                      <Login
                        {...props}
                        isUserLoggedIn={this.props.isUserLoggedIn}
                        logUserIn={this.props.logUserIn}
                      />
                    } />

                    <Route path="/users" component={AuthMiddleware(User, USER)} />

                    <Route path="/dashboard" component={AuthMiddleware(Dashboard, DASHBOARD)} />

                    <Route path="/part-master" component={AuthMiddleware(PartMaster, PART)} />

                    <Route path="/UOM-Master" component={AuthMiddleware(UOMMaster, UOM)} />

                    <Route path="/raw-material-master" component={AuthMiddleware(RowMaterialMaster, RAW_MATERIAL)} />

                    <Route path="/plant-master" component={AuthMiddleware(PlantMaster, PLANT)} />

                    <Route path="/vendor-master" component={AuthMiddleware(SupplierMaster, VENDOR)} />

                    <Route path="/bop-master" component={AuthMiddleware(BOPMaster, BOP)} />

                    <Route path="/fuel-master" component={AuthMiddleware(FuelMaster, FUEL_AND_POWER)} />

                    <Route path="/machine-master" component={AuthMiddleware(MachineMaster, MACHINE)} />

                    <Route path="/operation-master" component={AuthMiddleware(OperationListing, OPERATION)} />

                    <Route path="/freight-master" component={AuthMiddleware(FreightMaster, FREIGHT)} />

                    <Route path="/labour-master" component={AuthMiddleware(LabourListing, LABOUR)} />

                    <Route path="/overhead-profits-master" component={AuthMiddleware(OverheadProfit, OVERHEAD_AND_PROFIT)} />

                    <Route path="/interest-rate-master" component={AuthMiddleware(InterestRate, INTEREST_RATE)} />

                    <Route path="/costing" component={AuthMiddleware(Costing, SHEET_METAL)} />

                    <Route path="/reason-master" component={AuthMiddleware(ReasonListing, REASON)} />

                    <Route path="/volume-master" component={AuthMiddleware(VolumeListing, VOLUME)} />

                    <Route path="/client-master" component={AuthMiddleware(ClientMaster, CLIENT)} />

                    <Route path="/exchange-master" component={AuthMiddleware(ExchangeRateListing, EXCHANGE_RATE)} />

                    <Route path="/tax-master" component={AuthMiddleware(TaxListing, TAX)} />

                    <Route
                      render={props => <NotFoundPage {...props} isLoggeIn={false} handlePageNotFound={this.handlePageNotFound} />}
                    />
                  </Switch>
                </div>
              </div>
            </div>
          </div>
          {!this.state.visibelPageNotFound &&
            <div>
              <Route path="/" component={Footer} />
            </div>
          }
          <ReduxToastr
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
      </Suspense >
    )
  }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(null, { showUserData })(Main);