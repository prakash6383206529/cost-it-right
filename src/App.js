import React, { Component } from 'react';
import { connect } from "react-redux";
import Main from './components/Main.js';
import { BrowserRouter, Route, } from "react-router-dom";
import { reactLocalStorage } from 'reactjs-localstorage';
import { getLoginPageInit, } from "./actions/auth/AuthActions";
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
        let costingHeadsList = Data.CostingHeadsList
        let costingHeadsListArray = costingHeadsList.split(",")

        let approvalTypeList = Data.ApprovalTypeList
        let approvalTypeListArray = approvalTypeList.split(",")

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



        let objShortApp = {};
        approvalTypeListArray && approvalTypeListArray.map(item => {
          let shortFormList = objShortApp[item.split("=")[0]] = item.match(/\d+/g)[item.match(/\d+/g)?.length - 1]
          return shortFormList
        })
        let objFullApp = {}
        approvalTypeListArray && approvalTypeListArray.map(item => {
          let fullFormList = objFullApp[item.split("=")[1]] = item.match(/\d+/g)[item.match(/\d+/g)?.length - 1]
          return fullFormList
        })


        reactLocalStorage.setObject('CostingHeadsListShortForm', objShort)
        reactLocalStorage.setObject('CostingHeadsListFullForm', objFull)



        reactLocalStorage.setObject('ApprovalTypeListShortForm', objShortApp)
        reactLocalStorage.setObject('ApprovalTypeListFullForm', objFullApp)
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
    window.location.assign('/login');
    reactLocalStorage.setObject("isUserLoggedIn", false);
    reactLocalStorage.setObject("userDetail", {});
    reactLocalStorage.set('ModuleId', '');

    //setTimeout(() => {
    //}, 100)
  }

  render() {

    return (
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

