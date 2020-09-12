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
//import Privilege from './privilege';
import Dashboard from './dashboard';
import { Loader } from '../../src/components/common/Loader';
import PartMaster from './masters/sap-masters/part-master';
import UOMMaster from './masters/sap-masters/uom-master';
import CategoryMaster from './masters/sap-masters/category-master';
import RowMaterialMaster from './masters/sap-masters/material-master/raw-material';
import PlantMaster from './masters/sap-masters/plant-master/index';
import SupplierMaster from './masters/sap-masters/supplier-master/VendorListing';
import BOMMaster from './masters/sap-masters/bom-master';
import BOPMaster from './masters/sap-masters/bop-master';
import OtherOperationMaster from './masters/sap-masters/other-operation';
import CEDoperationMaster from './masters/sap-masters/ced-other-operation';
//import MHRMaster from './masters/sap-masters/mhr-master';
//import OperationMaster from './masters/sap-masters/operation';
//import ProcessMaster from './masters/sap-masters/process-master';
import FuelMaster from './masters/sap-masters/fuel-master';
import OperationListing from './masters/sap-masters/operation/OperationListing';
import MaterialMaster from './masters/sap-masters/material-master/raw-material';
import FreightMaster from './masters/sap-masters/freight-master';
import LabourListing from './masters/sap-masters/labour-master/LabourListing';
import OverheadProfit from './masters/sap-masters/overhead-profit-master';
import DepreciationMaster from './masters/sap-masters/depreciation-master';
import InterestRate from './masters/sap-masters/interest-rate-master';
import PartBOMRegister from './masters/sap-masters/part-bom-register/PartBOMRegister';
//import MachineTypeMaster from './masters/sap-masters/machine-type-master';
import MachineMaster from './masters/sap-masters/machine-master';
import PowerMaster from './masters/sap-masters/power-master';
import ReasonListing from "./masters/sap-masters/reason-master/ReasonListing";
import VolumeMaster from './masters/sap-masters/volume-master/AddVolume';
import ClientMaster from './masters/sap-masters/client-master/AddClient';
import LeftMenu from './nav/Leftsidemenu';
import Breadcrumb from './nav/Breadcrumb';

import Costing from './costing';
import { showUserData } from '../actions';
import AuthMiddleware from '../AuthMiddleware';

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
    const isLogin = reactLocalStorage.getObject("isUserLoggedIn");
    //console.log("isLogin", isLogin);

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
              {isLogin && !this.state.visibelPageNotFound && <LeftMenu {...this.props} />}

              <div className={isLogin ? 'content-page' : ''}>
                <div className={isLogin ? 'middleContainer' : ''}>
                  <Switch>
                    <Route exact path="/" component={AuthMiddleware(Dashboard)} />
                    <Route path="/login" render={(props) =>
                      <Login
                        {...props}
                        isUserLoggedIn={this.props.isUserLoggedIn}
                        logUserIn={this.props.logUserIn}
                      />
                    } />

                    <Route path="/users" component={AuthMiddleware(User)} />

                    {/* <Route path="/privilege" component={AuthMiddleware(Privilege)} /> */}

                    <Route path="/dashboard" component={AuthMiddleware(Dashboard)} />

                    {/* <Route path="/PartMasterOld" component={AuthMiddleware(PartMaster)} /> */}

                    <Route path="/part-master" component={AuthMiddleware(PartMaster)} />

                    <Route path="/UOM-Master" component={AuthMiddleware(UOMMaster)} />

                    <Route path="/category-master" component={AuthMiddleware(CategoryMaster)} />

                    <Route path="/raw-material-master" component={AuthMiddleware(RowMaterialMaster)} />

                    <Route path="/plant-master" component={AuthMiddleware(PlantMaster)} />

                    <Route path="/vendor-master" component={AuthMiddleware(SupplierMaster)} />

                    <Route path="/bom-master" component={AuthMiddleware(BOMMaster)} />

                    <Route path="/bop-master" component={AuthMiddleware(BOPMaster)} />

                    {/* <Route path="/process-master" component={AuthMiddleware(ProcessMaster)} /> */}

                    <Route path="/other-operation" component={AuthMiddleware(OtherOperationMaster)} />

                    <Route path="/fuel-master" component={AuthMiddleware(FuelMaster)} />

                    <Route path="/ced-other-operation" component={AuthMiddleware(CEDoperationMaster)} />

                    {/* <Route path="/mhr-master" component={AuthMiddleware(MHRMaster)} /> */}

                    {/* <Route path="/machine-type-master" component={AuthMiddleware(MachineTypeMaster)} /> */}

                    <Route path="/machine-master" component={AuthMiddleware(MachineMaster)} />

                    <Route path="/power-master" component={AuthMiddleware(PowerMaster)} />

                    <Route path="/operation-master" component={AuthMiddleware(OperationListing)} />

                    <Route path="/material-master" component={AuthMiddleware(MaterialMaster)} />

                    <Route path="/freight-master" component={AuthMiddleware(FreightMaster)} />

                    <Route path="/labour-master" component={AuthMiddleware(LabourListing)} />

                    <Route path="/overhead-profits-master" component={AuthMiddleware(OverheadProfit)} />

                    <Route path="/depreciation-master" component={AuthMiddleware(DepreciationMaster)} />

                    <Route path="/interest-rate-master" component={AuthMiddleware(InterestRate)} />

                    <Route path="/costing" component={AuthMiddleware(Costing)} />

                    <Route path="/part-bom-register" component={AuthMiddleware(PartBOMRegister)} />

                    <Route path="/reason-master" component={AuthMiddleware(ReasonListing)} />

                    <Route path="/volume-master" component={AuthMiddleware(VolumeMaster)} />

                    <Route path="/client-master" component={AuthMiddleware(ClientMaster)} />

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