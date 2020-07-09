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
import Privilege from './privilege';
import Homepage from './homepage/Homepage';
import Dashboard from './dashboard';
import { Loader } from '../../src/components/common/Loader';
import PartMaster from './masters/sap-masters/part-master';
import UOMMaster from './masters/sap-masters/uom-master';
import CategoryMaster from './masters/sap-masters/category-master';
import RowMaterialMaster from './masters/sap-masters/material-master/raw-material';
import PlantMaster from './masters/sap-masters/plant-master/index';
import SupplierMaster from './masters/sap-masters/supplier-master/AddSupplier';
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
import PartBOMRegister from './masters/sap-masters/part-bom-register/PartBOMRegister';
import MachineTypeMaster from './masters/sap-masters/machine-type-master';
import MachineMaster from './masters/sap-masters/machine-master';
import PowerMaster from './masters/sap-masters/power-master';
import ReasonMaster from './masters/sap-masters/reason-master';
import MassUpload from './massUpload';
import LeftMenu from './nav/Leftsidemenu';
import Breadcrumb from './nav/Breadcrumb';

import Costing from './costing';
import { showUserData } from '../actions';
import AuthMiddleware from '../AuthMiddleware';

import { isUserLoggedIn } from '../helper/auth';
import Contact from "./about/contact";
import termCondition from "./about/term&condition";
import privacyandpolicy from "./about/privacyandpolicy";
import aboutus from "./about/aboutus";

class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visibelPageNotFound: false,
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
    return (
      <Suspense fallback={<Loader />}>
        <div>
          {!this.state.visibelPageNotFound &&
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
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>}

          {isLogin && !this.state.visibelPageNotFound && <Breadcrumb />}
          {isLogin && !this.state.visibelPageNotFound && <LeftMenu {...this.props} />}

          <div className="content-page">
            <div className=" middleContainer">
              <Switch>
                {/* <Route exact path="/" component={Homepage} /> */}
                <Route exact path="/" component={AuthMiddleware(Dashboard)} />
                <Route path="/login" render={(props) =>
                  <Login
                    {...props}
                    isUserLoggedIn={this.props.isUserLoggedIn}
                    logUserIn={this.props.logUserIn}
                  />
                } />

                <Route path="/user" component={AuthMiddleware(User)} />

                <Route path="/privilege" component={AuthMiddleware(Privilege)} />

                <Route path="/dashboard" component={AuthMiddleware(Dashboard)} />

                {/* <Route path="/PartMasterOld" component={AuthMiddleware(PartMaster)} /> */}

                <Route path="/PartMaster" component={AuthMiddleware(PartMaster)} />

                <Route path="/UOMMaster" component={AuthMiddleware(UOMMaster)} />

                <Route path="/category-master" component={AuthMiddleware(CategoryMaster)} />

                <Route path="/raw-material-master" component={AuthMiddleware(RowMaterialMaster)} />

                <Route path="/plant-master" component={AuthMiddleware(PlantMaster)} />

                <Route path="/supplier-master" component={AuthMiddleware(SupplierMaster)} />

                <Route path="/bom-master" component={AuthMiddleware(BOMMaster)} />

                <Route path="/bop-master" component={AuthMiddleware(BOPMaster)} />

                <Route path="/process-master" component={AuthMiddleware(ProcessMaster)} />

                <Route path="/other-operation" component={AuthMiddleware(OtherOperationMaster)} />

                <Route path="/fuel-master" component={AuthMiddleware(FuelMaster)} />

                <Route path="/ced-other-operation" component={AuthMiddleware(CEDoperationMaster)} />

                <Route path="/mhr-master" component={AuthMiddleware(MHRMaster)} />

                <Route path="/machine-type-master" component={AuthMiddleware(MachineTypeMaster)} />

                <Route path="/machine-master" component={AuthMiddleware(MachineMaster)} />

                <Route path="/power-master" component={AuthMiddleware(PowerMaster)} />

                <Route path="/operation-master" component={AuthMiddleware(OperationMaster)} />

                <Route path="/material-master" component={AuthMiddleware(MaterialMaster)} />

                <Route path="/freight-master" component={AuthMiddleware(FreightMaster)} />

                <Route path="/labour-master" component={AuthMiddleware(LabourMaster)} />

                <Route path="/overhead-profit-master" component={AuthMiddleware(OverheadProfit)} />

                <Route path="/depreciation-master" component={AuthMiddleware(DepreciationMaster)} />

                <Route path="/interest-rate-master" component={AuthMiddleware(InterestRate)} />

                <Route path="/costing" component={AuthMiddleware(Costing)} />

                <Route path="/part-bom-register" component={AuthMiddleware(PartBOMRegister)} />

                <Route path="/mass-upload" component={AuthMiddleware(MassUpload)} />

                <Route path="/reason-master" component={AuthMiddleware(ReasonMaster)} />

                <Route
                  render={props => <NotFoundPage {...props} isLoggeIn={false} handlePageNotFound={this.handlePageNotFound} />}
                />
              </Switch>
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
export default connect(null, { showUserData })(Main);