import React, { Component } from "react";
import axios from "axios";
import { Field, reduxForm } from "redux-form";
import { Link } from "react-router-dom";
import {
  renderPasswordInputField, renderEmailInputField, renderCheckboxInputField, focusOnError,
  renderText
} from "../layout/FormInputs";
import { connect } from "react-redux";
import { toastr } from "react-redux-toastr";
import { loginUserAPI, getMenuByUser, getLeftMenu, getLoginPageInit, } from "../../actions";
import { maxLength70, minLength5, maxLength25, required, email } from "../../helper/validation";
import { MESSAGES } from "../../config/message";
import "./Login.scss";
//import "../users/Users.css";
import { Loader } from "../common/Loader";
import { reactLocalStorage } from "reactjs-localstorage";
import { Redirect } from 'react-router-dom';
import { formatLoginResult } from '../../helper/ApiResponse';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoader: false,
      isSubmitted: false,
      isRedirect: false,
      IsLoginEmailConfigure: true,
    };
  }

  UNSAFE_componentWillMount() {

    this.props.getLoginPageInit(res => {
      let Data = res.data.Data;
      this.setState({ IsLoginEmailConfigure: Data.IsLoginEmailConfigure })
      reactLocalStorage.setObject('InitialConfiguration', Data)
    })

    const isLoggedIn = reactLocalStorage.getObject('isUserLoggedIn');
    if (isLoggedIn == true) {
      this.setState({
        isRedirect: true
      })
    }

  }

  /**
   * Submit the login form
   * @param values
   */
  onSubmit(values) {

    this.props.loginUserAPI(values, (res) => {
      if (res && res.data && res.data.Result) {
        this.setState({ isLoader: false, isSubmitted: false });
        toastr.success(MESSAGES.LOGIN_SUCCESS)
        let userDetail = formatLoginResult(res.data);
        reactLocalStorage.setObject("userDetail", userDetail);
        this.props.logUserIn();

        setTimeout(() => {
          window.location.replace("/");
        }, 1000)
      }
    });
  }

  render() {
    const { handleSubmit } = this.props;
    const { isLoader, isSubmitted, isRedirect, IsLoginEmailConfigure } = this.state;

    if (isRedirect == true) {
      return <Redirect
        to={{
          pathname: "/",
        }} />
    }

    return (
      <div className="login-bg">
        {isLoader && <Loader />}
        <div className="container ">
          <div className="login-form">

            <div className="row shadow-lg">
              <div className="col-md-5 form-section">

                <div className="text-center">
                  <a href="javaScript:Void(0);"><img src={require('../../assests/images/logo-login.png')} alt='Cost It Rights' />
                  </a>
                </div>
                <h3>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do.</h3>
                <p>Welcome Back, Please login to your account</p>
                <form
                  noValidate
                  className="form"
                  onSubmit={handleSubmit(this.onSubmit.bind(this))}
                >
                  <div className="input-group mail">
                    {IsLoginEmailConfigure ?
                      <Field
                        name="UserName"
                        // label="UserName"
                        component={renderEmailInputField}
                        isDisabled={false}
                        placeholder={"Email"}
                        validate={[required, email, minLength5, maxLength70]}
                        required={true}
                        maxLength={71}
                      />
                      :
                      <Field
                        label=""
                        name={"UserName"}
                        type="text"
                        placeholder={'User Name'}
                        validate={[required, minLength5, maxLength70]}
                        component={renderText}
                        required={true}
                        maxLength={26}
                        customClassName={'withBorder'}
                      />
                    }
                  </div>
                  <div className="input-group phone">
                    <Field
                      name="Password"
                      // label="Password"
                      placeholder="Must have atleast 5 characters"
                      component={renderPasswordInputField}
                      validate={[required, minLength5, maxLength25]}
                      required={true}
                      maxLength={26}
                    />
                  </div>

                  <div className="text-center ">
                    <input
                      type="submit"
                      disabled={isSubmitted ? true : false}
                      value="Login"
                      className="btn login-btn w-100 dark-pinkbtn"
                    />
                  </div>
                  <div className="form-group forgot-link d-flex pt-2 ">
                    {/* <div className="checkboxWrap ">
                          <label className="customs-checkbox">
                          Remember me
                            <input type="checkbox" />
                            <span className=" before-box"></span>
                          </label>
                        </div> */}
                    <Field name="RememberMe" label="Remember Me" id="remember" component={renderCheckboxInputField} type="checkbox" />
                    <Link to="/forgot-password" className="forgotpwd-field" target='_blank'>
                      Forgot Password?
                        </Link>
                  </div>

                </form>
              </div>
              <div className="col-md-7 p-0 right-sideimg">
                <img src={require('../../assests/images/box.png')} alt='error-icon.jpg' />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Form validations
 * @param values
 * @returns {{}}
 */
const validate = values => {
  let errors = {};

  return errors;
};

/**
 * @name mapStateToProps
 * @desc map state containing organisation details from the api to props
 * @return object{}
 */
function mapStateToProps({ auth }) {
  const { menusData, leftMenuData } = auth
  return { menusData, leftMenuData }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default reduxForm({
  validate,
  form: "Login",
  onSubmitFail: errors => {
    focusOnError(errors);
  }
})(connect(mapStateToProps, {
  loginUserAPI,
  getMenuByUser,
  getLeftMenu,
  getLoginPageInit,
})(Login));
