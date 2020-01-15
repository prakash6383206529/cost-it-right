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
      isUserLoggedIn: false
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

  logUserIn = () => {
    this.setState({ isUserLoggedIn: true });
    reactLocalStorage.setObject("isUserLoggedIn", true);
  }

  logUserOut = () => {
    this.setState({ isUserLoggedIn: false });
    reactLocalStorage.setObject("isUserLoggedIn", false);
    reactLocalStorage.setObject("userDetail", {});
    toastr.success(MESSAGES.LOGOUT_SUCCESS);
    setTimeout(() => {
      window.location.assign('/login');
    }, 1000)
  }

  render() {
    return (
      <BrowserRouter>
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

export default connect(null, {})(App);

