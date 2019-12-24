import React, { Component } from 'react';
import { connect } from "react-redux";
import Main from './components/Main.js';
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { reactLocalStorage } from 'reactjs-localstorage';
import { toastr } from "react-redux-toastr";
import { MESSAGES } from '../src/config/message';
//import './App.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoggedIn: false
    };
  }

  componentDidMount() {
    // const key = "isLoggedIn";
    // const loggedInDetail = reactLocalStorage.getObject("loggedInDetail");
    // reactLocalStorage.setObject('verificationStatus', false);
    // if (loggedInDetail.hasOwnProperty(key)) {
    //   let value = reactLocalStorage.getObject("loggedInDetail");
    //   value = value === true;
    //   this.setState({ [key]: value });
    // }
  }

  // logUserIn = () => {
  //   this.setState({ isLoggedIn: true });
  //   reactLocalStorage.setObject("isLoggedIn", true);
  // }

  // logUserOut = () => {
  //   // console.log("Log out");
  //   const key = "rememberCredential";
  //   this.setState({ isLoggedIn: false });
  //   reactLocalStorage.setObject("isLoggedIn", false);
  //   reactLocalStorage.setObject("basicProfileAndProd", false);
  //   reactLocalStorage.setObject("userResponse", {});
  //   reactLocalStorage.setObject("internalRouteANDID", {});
  //   toastr.success(MESSAGES.LOGOUT_SUCCESS);
  //   setTimeout(() => {
  //     window.location.assign('/login');
  //   }, 1000)
  // }

  // isBasicProfileAndProduction = () => {
  //   reactLocalStorage.setObject("basicProfileAndProd", true);
  // }

  render() {
    return (
      <BrowserRouter basename={'http://10.10.1.8/CIRLite/'}>
        <div>
          <Route path="/" render={
            (props) => <Main {...props}
            // isLoggedIn={this.state.isLoggedIn}
            // logUserIn={this.logUserIn}
            // logUserOut={this.logUserOut}
            // isBasicProfileAndProduction= {this.isBasicProfileAndProduction}
            />
          } />
        </div>
      </BrowserRouter>
    );
  }
}

export default connect(null, {})(App);

