import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import {
  renderPasswordInputField, renderEmailInputField, renderCheckboxInputField, focusOnError,
  renderText
} from "../layout/FormInputs";
import { connect } from "react-redux";
import { loginUserAPI, getMenuByUser, getLeftMenu, TokenAPI } from "../../actions/auth/AuthActions";
import { maxLength70, maxLength25, required, email } from "../../helper/validation";
import "./Login.scss";
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
      flag: false
    };
  }

  UNSAFE_componentWillMount() {

    const isLoggedIn = reactLocalStorage.getObject('isUserLoggedIn');
    if (isLoggedIn === true) {
      this.setState({
        isRedirect: true
      })
    } else {
      reactLocalStorage.setObject('isUserLoggedIn', false);
    }



  }

  forgotConfirm = () => {
    this.setState({ flag: true })
  }

  /**
   * Submit the login form
   * @param values
   */
  onSubmit(values) {

    let reqParams = {
      username: values.UserName,
      password: values.Password,
      grant_type: 'password',
    }
    //this.props.loginUserAPI(values, (res) => {
    this.props.TokenAPI(reqParams, (res) => {
      if (res && res.status === 200) {
        this.setState({ isLoader: false, isSubmitted: false });
        let userDetail = formatLoginResult(res.data);
        reactLocalStorage.setObject("userDetail", userDetail);
        this.props.logUserIn();
        //this.setState({ isRedirect: true })
        setTimeout(() => {
          window.location.replace("/");
        }, 1000)
      }
    })
    //});
  }

  render() {
    const { handleSubmit, initialConfiguration } = this.props;
    const { isLoader, isSubmitted, isRedirect, } = this.state;

    if (isRedirect === true) {
      return <Redirect
        to={{
          pathname: "/",
        }} />
    }

    return (
      <div className="login-bg d-flex align-items-center">
        {isLoader && <Loader />}
        <div className="container ">
          <div className="login-form pt-0">

            <div className="row shadow-lg">
              <div className="col-md-5 form-section">

                <div className="text-center">
                  <a href="javaScript:Void(0);"><img className="logo-first" src={require("../../assests/images/sipl-logo.svg")} alt="Systematix" />
                  </a>
                </div>
                <h3 className="text-center">Welcome Back,<br /> Please login to your account</h3>
                {/* <p>Welcome Back, Please login to your account</p> */}
                <form
                  noValidate
                  className="form"
                  onSubmit={handleSubmit(this.onSubmit.bind(this))}
                >
                  <div className="input-group mail">
                    {initialConfiguration && initialConfiguration.IsLoginEmailConfigure ?
                      <Field
                        name="UserName"
                        // label="UserName"
                        component={renderEmailInputField}
                        isDisabled={false}
                        placeholder={"Email"}
                        onClickCapture={(e) => this.setState({ flag: false })}
                        validate={[required, email, maxLength70]}
                        required={true}
                      // maxLength={71}
                      />
                      :
                      <Field
                        label=""
                        name={"UserName"}
                        type="text"
                        placeholder={'User Name'}
                        validate={[required, maxLength70]}
                        component={renderText}
                        required={true}
                        onClickCapture={(e) => this.setState({ flag: false })}
                        // maxLength={26}
                        customClassName={'withBorder'}
                      />
                    }
                  </div>
                  <div className="input-group phone" onClickCapture={(e) => this.setState({ flag: false })}>
                    <Field
                      name="Password"
                      // label="Password"
                      placeholder="Password"
                      component={renderPasswordInputField}
                      validate={[required, maxLength25]}
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
                  <div className="form-group forgot-link d-flex pt-2 justify-content-center">
                    {/* <Field name="RememberMe" label="Remember Me" id="remember" component={renderCheckboxInputField} type="checkbox" /> */}
                    <a className="forgotpwd-field" onClick={() => this.forgotConfirm()}>{'Forgot Password?'}</a>
                  </div>
                  {this.state.flag && (
                    <div className="text-help mb-2">Please contact your IT Administrator</div>
                  )
                  }
                </form>
                <div className="bottomlogo_con">
                  <span>Powered By</span>
                  <img className="logo-second" src={require("../../assests/images/logo_small.png")} alt="Cost It Right" />
                </div>
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
  const { menusData, leftMenuData, initialConfiguration } = auth
  return { menusData, leftMenuData, initialConfiguration }
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
  TokenAPI,
})(Login));
