import React, { Component } from 'react';
import { connect } from "react-redux";
import Main from './components/Main.js';
import { BrowserRouter, Route, } from "react-router-dom";
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
    reactLocalStorage.setObject("isUserLoggedIn", false);
    reactLocalStorage.setObject("userDetail", {});
    reactLocalStorage.set('ModuleId', '');
    toastr.success(MESSAGES.LOGOUT_SUCCESS);
    setTimeout(() => {
      window.location.assign('/login');
    }, 100)
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

export default connect(null, {})(App);

