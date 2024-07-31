import React, { Component } from 'react';
import { connect } from "react-redux";
import Main from './components/Main.js';
import { BrowserRouter, Route, } from "react-router-dom";
import { reactLocalStorage } from 'reactjs-localstorage';
import { getLoginPageInit, } from "./actions/auth/AuthActions";
import { MsalProvider } from '@azure/msal-react';
require('dotenv').config();
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isUserLoggedIn: false,
    };
  }

  UNSAFE_componentWillMount() {
    if (window.performance.getEntriesByType("navigation")[0].type === 'back_forward' || window.performance.getEntriesByType("navigation")[0].type === 'navigate') { //TO CHECK IF DUPLICATE TAB IS OPENED
      setTimeout(() => {
        window.location.reload();
      }, 200);
    }

    this.props.getLoginPageInit(res => {
      if (res && res.data && res.data.Data) {
        let Data = res.data.Data;

        reactLocalStorage.setObject('InitialConfiguration', Data)
        let BOPLabel = Data.BOPLabel
        reactLocalStorage.setObject('BOPLabel', BOPLabel)
        let costingHeadsList = Data.CostingHeadsList
        let costingHeadsListArray = costingHeadsList.split(",")

        let approvalTypeList = Data.ApprovalTypeList
        let approvalTypeListArray = approvalTypeList.split(",")

        let onboardingName = Data.ApprovalOnboardingList.split("=")[0]
        let onboardingId = Data.ApprovalOnboardingList.split("=")[1]
        reactLocalStorage.setObject('onboardingName', onboardingName)
        reactLocalStorage.setObject('onboardingId', onboardingId)

        const moduleListArray = Data.ApprovalModuleTypeList.split(",")
        const moduleType = Object.fromEntries(moduleListArray.map(item => {
          const moduleTypeobj = item.split("=");
          return moduleTypeobj;
        }));
        reactLocalStorage.setObject('moduleType', moduleType)



        let baseCurrency = Data.BaseCurrency
        reactLocalStorage.setObject('baseCurrency', baseCurrency)

        let objShort = {};
        costingHeadsListArray && costingHeadsListArray.map(item => {
          let shortFormList = objShort[item.split("=")[0]] = item.match(/\d+/g)[item.match(/\d+/g)?.length - 1]
          return shortFormList
        })
        let objFull = {}
        costingHeadsListArray && costingHeadsListArray.map(item => {
          let fullFormList = objFull[item.split("=")[1]] = item.match(/\d+/g)[item.match(/\d+/g)?.length - 1]
          return fullFormList
        })


        // let objShortApp = {};
        // approvalTypeListArray && approvalTypeListArray.map(item => {
        //   let shortFormList = objShortApp[item.split("=")[0]] = item.match(/\d+/g)[item.match(/\d+/g)?.length - 1]
        //   return shortFormList
        // })
        // let objFullApp = {}
        // approvalTypeListArray && approvalTypeListArray.map(item => {
        //   let fullFormList = objFullApp[item.split("=")[1]] = item.match(/\d+/g)[item.match(/\d+/g)?.length - 1]
        //   return fullFormList
        // })
        let objShortApp = {};
        let objFullApp = {};

        approvalTypeListArray && approvalTypeListArray.map(item => {
          let parts = item.split('=');
          let shortForm = parts[0];
          let fullForm = parts[1];
          let id = parts[2];
          objShortApp[shortForm] = id;
          objFullApp[fullForm] = id;
          return { shortForm, fullForm, id };
        });


        reactLocalStorage.setObject('CostingHeadsListShortForm', objShort)
        reactLocalStorage.setObject('CostingHeadsListFullForm', objFull)

        reactLocalStorage.setObject('ApprovalTypeListShortForm', objShortApp)
        reactLocalStorage.setObject('ApprovalTypeListFullForm', objFullApp)

        const approvalmasterType = Data.ApprovalMasterArrayList.split(",")
        const masterType = Object.fromEntries(approvalmasterType.map(item => {
          const masterTypeobj = item.split("=");
          return masterTypeobj;
        }));
        reactLocalStorage.setObject('masterType', masterType)

        const vendorTypeList = Data?.VendorTypeList?.split(",")
        const vendortype = Object.fromEntries(vendorTypeList?.map(item => {
          const vendortypeobj = item?.split("=");
          return vendortypeobj;
        }));
        reactLocalStorage.setObject('vendortype', vendortype)
      }
    })
    reactLocalStorage.setObject('isFromDiscountObj', false)
  }

  /**
  * @method logUserIn
  * @description After user successfully login, flag used internally.
  */
  logUserIn = () => {
    this.setState({ isUserLoggedIn: true });
    reactLocalStorage.setObject("isUserLoggedIn", true);
  }

  /**
   * @method logUserOut
   * @description Used to logout logged in user.
   */
  logUserOut = () => {
    this.setState({ isUserLoggedIn: false });
    // Call MSAL logout method
    this.props.instance.logout();
    // Clear local storage tokens and other relevant data
    reactLocalStorage.setObject('msaltoken', null);
    reactLocalStorage.setObject("isUserLoggedIn", false);
    reactLocalStorage.setObject("userDetail", {});
    reactLocalStorage.set('ModuleId', '');
    reactLocalStorage.setObject('logoutRefresh', true);
    window.location.assign('/login');
    //setTimeout(() => {
    //}, 100)
  }

  render() {

    return (
      <MsalProvider instance={this.props.instance}>
        <BrowserRouter browserHistory>
          <div>
            <Route path="/" render={
              (props) => <Main {...props}
                isUserLoggedIn={this.state.isUserLoggedIn}
                logUserIn={this.logUserIn}
                logUserOut={this.logUserOut}
              />
            } />
          </div>
        </BrowserRouter>
      </MsalProvider>
    );
  }
}


/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps(state) {
  const { auth } = state;
  const { initialConfiguration } = auth;

  return { initialConfiguration, }
}

export default connect(mapStateToProps, { getLoginPageInit })(App);

