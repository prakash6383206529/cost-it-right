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
    this.props.getLoginPageInit(res => {
      if (res && res.data && res.data.Data) {
        let Data = res.data.Data;
        reactLocalStorage.setObject('InitialConfiguration', Data)
        let CostingHeadsList = Data.CostingHeadsList
        let costingHeadsListArray = CostingHeadsList.split(",")
        let objShort = {};
        costingHeadsListArray && costingHeadsListArray.map(item => {
          let shortFormList = objShort[item.split("=")[0]] = item.match(/\d+/g)[0]
          return shortFormList
        })
        let objFull = {}
        costingHeadsListArray && costingHeadsListArray.map(item => {
          let fullFormList = objFull[item.split("=")[1]] = item.match(/\d+/g)[0]
          return fullFormList
        })
        reactLocalStorage.setObject('CostingHeadsListShortForm', objShort)
        reactLocalStorage.setObject('CostingHeadsListFullForm', objFull)
      }
    })
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

