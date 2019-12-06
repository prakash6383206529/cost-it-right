import React, { Component, Suspense } from "react";
import { reactLocalStorage } from 'reactjs-localstorage';
import { connect } from 'react-redux';
import SideBar from './nav/NavBar';
import { Route, Switch } from "react-router-dom";
import ReduxToastr from 'react-redux-toastr';
import Footer from "../components/footer/Footer";
import Login from './login/Login';
import NotFoundPage from './common/NotFoundPage';
import Signup from './signup/SignupForm';
import Homepage from './homepage/Homepage';
import Dashboard from './dashboard';
import { Loader } from '../../src/components/common/Loader';
import PartMaster from './masters/sap-masters/part-master';
import UOMMaster from './masters/sap-masters/uom-master';
import CategoryMaster from './masters/sap-masters/category-master';
import RowMaterialMaster from './masters/sap-masters/material-master/row-material';
import PlantMaster from './masters/sap-masters/plant-master';
import SupplierMaster from './masters/sap-masters/supplier-master';
import BOMMaster from './masters/sap-masters/bom-master';
import BOPMaster from './masters/sap-masters/bop-master';
import OtherOperationMaster from './masters/sap-masters/other-operation';
import CEDoperationMaster from './masters/sap-masters/ced-other-operation';
import MHRMaster from './masters/sap-masters/mhr-master';
//import OperationMaster from './masters/sap-masters/operation';
import ProcessMaster from './masters/sap-masters/process-master';
import FuelMaster from './masters/sap-masters/fuel-master';
import OperationMaster from './masters/sap-masters/operation';
import MaterialMaster from './masters/sap-masters/material-master/material';
import FreightMaster from './masters/sap-masters/freight-master';
import LabourMaster from './masters/sap-masters/labour-master';
import OverheadProfit from './masters/sap-masters/overhead-profit-master';
import DepreciationMaster from './masters/sap-masters/depreciation-master';
import InterestRate from './masters/sap-masters/interest-rate-master';

import Costing from './costing';

import { isUserLoggedIn } from '../helper/auth';
import Contact from "./about/contact";
import termCondition from "./about/term&condition";
import privacyandpolicy from "./about/privacyandpolicy";
import aboutus from "./about/aboutus";

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibelPageNotFound: false
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

  render() {
    return (
      <Suspense fallback={<Loader />}>
        <div>
          {!this.state.visibelPageNotFound &&
            <div className="sf-mainwrapper">
              <div className=" sf-mainheader">
                <div className="container header-menu">
                  <div className="row ss-menu">
                    <div className="logo-section col-md-2 col-4">
                      <div className="inner-header">
                        <div className="main-logo">
                          <a href="javaScript:Void(0);"><img src={require('../assests/images/cir-logo.png')} alt='Cost It Rights' />
                          </a>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-10 col-8">
                      <div className="inner-header main-menu">
                        <Route
                          path="/"
                          render={props => (
                            <SideBar
                              {...props}
                            // isLoggedIn={this.props.isLoggedIn}
                            // logUserIn={this.props.logUserIn}
                            // logUserOut={this.props.logUserOut}
                            // isBasicProfileAndProduction={this.props.isBasicProfileAndProduction}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>}
          <div className=" middleContainer">
            <Switch>
              <Route exact path="/" component={Homepage} />
              <Route path="/login" render={(props) =>
                <Login
                  {...props}
                // isLoggedIn={this.props.isLoggedIn}
                // logUserIn={this.props.logUserIn}
                // logUserOut={this.props.logUserOut}
                // isBasicProfileAndProduction={this.props.isBasicProfileAndProduction}
                />
              } />

              <Route
                path="/signup"
                render={props => (
                  <Signup
                    {...props}
                    isLoggedIn={this.props.isLoggedIn}
                    logUserIn={this.props.logUserIn}
                    logUserOut={this.props.logUserOut}
                    isBasicProfileAndProduction={this.props.isBasicProfileAndProduction}
                  />
                )}
              />
              {props => <Signup {...props} />}
              <Route
                path="/dashboard"
                render={props => (
                  <Dashboard
                    {...props}
                  />
                )}
              />
              <Route
                path="/PartMaster"
                render={props => (
                  <PartMaster
                    {...props}
                  />
                )}
              />
              <Route
                path="/UOMMaster"
                render={props => (
                  <UOMMaster
                    {...props}
                  />
                )}
              />
              <Route
                path="/category-master"
                render={props => (
                  <CategoryMaster
                    {...props}
                  />
                )}
              />
              <Route
                path="/raw-material-master"
                render={props => (
                  <RowMaterialMaster
                    {...props}
                  />
                )}
              />
              <Route
                path="/plant-master"
                render={props => (
                  <PlantMaster
                    {...props}
                  />
                )}
              />
              <Route
                path="/supplier-master"
                render={props => (
                  <SupplierMaster
                    {...props}
                  />
                )}
              />
              <Route
                path="/bom-master"
                render={props => (
                  <BOMMaster
                    {...props}
                  />
                )}
              />
              <Route
                path="/bop-master"
                render={props => (
                  <BOPMaster
                    {...props}
                  />
                )}
              />
              <Route
                path="/process-master"
                render={props => (
                  <ProcessMaster
                    {...props}
                  />
                )}
              />
              <Route
                path="/other-operation"
                render={props => (
                  <OtherOperationMaster
                    {...props}
                  />
                )}
              />
              <Route
                path="/fuel-master"
                render={props => (
                  <FuelMaster
                    {...props}
                  />
                )}
              />
              <Route
                path="/ced-other-operation"
                render={props => (
                  <CEDoperationMaster
                    {...props}
                  />
                )}
              />
              <Route
                path="/mhr-master"
                render={props => (
                  <MHRMaster
                    {...props}
                  />
                )}
              />
              <Route
                path="/operation-master"
                render={props => (
                  <OperationMaster
                    {...props}
                  />
                )}
              />
              <Route
                path="/material-master"
                render={props => (
                  <MaterialMaster
                    {...props}
                  />
                )}
              />
              <Route
                path="/freight-master"
                render={props => (
                  <FreightMaster
                    {...props}
                  />
                )}
              />
              <Route
                path="/labour-master"
                render={props => (
                  <LabourMaster
                    {...props}
                  />
                )}
              />
              <Route
                path="/overhead-profit-master"
                render={props => (
                  <OverheadProfit
                    {...props}
                  />
                )}
              />
              <Route
                path="/depreciation-master"
                render={props => (
                  <DepreciationMaster
                    {...props}
                  />
                )}
              />
              <Route
                path="/interest-rate-master"
                render={props => (
                  <InterestRate
                    {...props}
                  />
                )}
              />
              <Route
                path="/costing"
                render={props => (
                  <Costing
                    {...props}
                  />
                )}
              />
              <Route
                render={props => <NotFoundPage {...props} isLoggeIn={false} handlePageNotFound={this.handlePageNotFound} />}
              />
            </Switch>
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
            progressBar
          />
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
export default connect(null, {})(Main);