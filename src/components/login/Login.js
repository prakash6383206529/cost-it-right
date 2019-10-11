import React, { Component } from "react";
import axios from "axios";
import { Field, reduxForm } from "redux-form";
import { Link } from "react-router-dom";
import {
  renderPasswordInputField,
  renderEmailInputField,
  focusOnError
} from "../layout/FormInputs";
import { connect } from "react-redux";
import { toastr } from "react-redux-toastr";
import { loginUserAPI } from "../../actions";
import {
  maxLength70,
  minLength5,
  maxLength25,
  required,
  email
} from "../../helper/validation";
import { MESSAGES } from "../../config/message";
import "./Login.scss";
//import "../users/Users.css";
import { Loader } from "../common/Loader";
import { reactLocalStorage } from "reactjs-localstorage";
import { Redirect } from 'react-router-dom';
//import SocialLogin from '../social-login';
import { formatLoginResult } from '../../helper/ApiResponse';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoader: false,
      isSubmitted: false,
      isRedirect: false,
    };
  }

  componentWillMount() {
    const isLoggedIn = reactLocalStorage.getObject('isLoggedIn');
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
    this.setState({ isLoader: true, isSubmitted: true });
    values.username = values.email.toLowerCase();
    values.lastKnownLocation = ["-85.8364448", "38.2756219"];
    values.deviceId = "00000000-00000000-112233FF-FF445566";

    this.props.loginUserAPI(values, res => {
      // console.log("resloginuser===========",res)
      this.setState({ isLoader: false, isSubmitted: false });
      if (res && res.data) {
        let status = res.data.success;
        if (status != true) {
          if (status == false) {
            toastr.error(MESSAGES.INVALID_EMAIL_PASSWORD);
          } else {
            toastr.error(MESSAGES.SOME_ERROR);
          }

        } else {
          reactLocalStorage.setObject('userResponse', '');
          reactLocalStorage.setObject('userId', res.data.user.id);
          reactLocalStorage.setObject('companyId', res.data.user.companyDetails._id);
          reactLocalStorage.setObject("isSubscriptionDone", 'yes');

          const userObj = formatLoginResult(res);
          const userAuthToken = axios.defaults.headers.common["Authorization"];
          if (typeof userAuthToken == "undefined" || userAuthToken == "" || userAuthToken == null) {
            axios.defaults.headers.common = {
              Authorization: `bearer ${userObj.token}`
            };
          }

          if (userObj.isVerified === true && userObj.isBasicInfoCompleted === true) {
            toastr.success(MESSAGES.LOGIN_SUCCESS);
            reactLocalStorage.setObject("userResponse", userObj);
            reactLocalStorage.setObject("isSubscriptionDone", 'yes');
            this.props.logUserIn();
            setTimeout(() => {
              //this.setState({loader:false})
              window.location.assign("/dashboard");
            }, 3000);
          } else if (userObj.isVerified != true) {
            toastr.error(MESSAGES.NOT_VERIFIED_USER);
            reactLocalStorage.setObject("userResponse", userObj);
            reactLocalStorage.setObject("userData", userObj);
            reactLocalStorage.setObject('verificationStatus', true);
            setTimeout(() => {
              //this.setState({loader:false})
              window.location.assign("/verification");
            }, 3000);
          } else if (userObj.planCode === '') {
            toastr.error(MESSAGES.NO_PLAN_SUBSCRIPTION);
            const data = {
              isInternalRoute: false,
              userId: userObj.id,
            }
            reactLocalStorage.setObject("isLoggedIn", true);
            reactLocalStorage.setObject("internalRouteANDID", data);
            reactLocalStorage.setObject("basicProfileAndProd", true);
            reactLocalStorage.setObject("isSubscriptionDone", 'no');

            setTimeout(() => {
              window.location.assign("/subscription-planlist");
            }, 3000);
          } else if (userObj.isBasicInfoCompleted != true) {
              reactLocalStorage.setObject("userResponse", userObj);
              reactLocalStorage.setObject("isSubscriptionDone", 'yes');
              console.log('userObj', userObj);

              const userAuthToken = axios.defaults.headers.common["Authorization"];
              if (typeof userAuthToken == "undefined" || userAuthToken == "" || userAuthToken == null
              ) {
                axios.defaults.headers.common = {
                  Authorization: `bearer ${userObj.token}`
                };
              }
              this.props.logUserIn();
              this.props.isBasicProfileAndProduction();
              toastr.warning(MESSAGES.BASIC_PROFILE_INFO_INCOMPLETE);
              setTimeout(() => {
                this.setState({ loader: false })
                window.location.assign('/basic-profile');
              }, 3000);
            }
        }
      } else {
        this.setState({ isLoader: false });
      }
    });
  }

  render() {
    const { handleSubmit } = this.props;
    const { isLoader, isSubmitted, isRedirect } = this.state;

    if (isRedirect == true) {
      return <Redirect
        to={{
          pathname: "/dashboard",
        }} />
    }

    return (
      <div>
        {isLoader && <Loader />}
        <div className="login-container ">
          <div className="card-body shadow-lg login-form">
            <div className="form-heading">
              <h2>Login</h2>
            </div>
            <form
              noValidate
              className="form"
              onSubmit={handleSubmit(this.onSubmit.bind(this))}
            >
              <div className="input-group ">
                <Field
                  name="email"
                  label="Email Address"
                  component={renderEmailInputField}
                  isDisabled={false}
                  placeholder={"email@domain.com/co.us"}
                  validate={[required, email, minLength5, maxLength70]}
                  required={true}
                  maxLength={71}
                />
              </div>
              <div className="input-group ">
                <Field
                  name="password"
                  label="Password"
                  placeholder="Must have atleast 5 characters"
                  component={renderPasswordInputField}
                  validate={[required, minLength5, maxLength25]}
                  required={true}
                  maxLength={26}
                />
              </div>
              <div className="form-group forgot-link">
                {/* <div className="checkboxWrap ">
                  <label className="customs-checkbox">
                  Remember me
                    <input type="checkbox" />
                    <span className=" before-box"></span>
                  </label>
                </div> */}
                {/* <Field name="remember" label="Remember Me" id="remember" component={renderCheckboxInputField} type="checkbox" />  */}
                <Link to="/forgot-password" className="" target='_blank'>
                  Forgot Password?
                </Link>
              </div>
              <div className="text-center ">
                <input
                  type="submit"
                  disabled={isSubmitted ? true : false}
                  value="Login"
                  className="btn login-btn w-50 dark-pinkbtn"
                />
              </div>
            </form>
            <div className="row">
              <div className="col-md-12 text-center login-social">
                {/* <p className="m-3">or login using social media</p>
                <ul className="list-unstyled d-flex text-center m-b0">
                  <li>
                    <a href="">
                      <span className="fb-icon">
                        <i className="fab fa-facebook-f" />
                      </span>
                    </a>
                  </li>
                  <li>
                    <a href="">
                      <span className="insta-icon">
                        <i className="fab fa-instagram" />
                      </span>
                    </a>
                  </li>
                  <li>
                    <a href="">
                      <span className=" google-icon">
                        <i className="fab fa-google" />
                      </span>
                    </a>
                  </li>
                </ul> */}
                {/* <SocialLogin
                  isLoggedIn={this.props.isLoggedIn}
                  logUserIn={this.props.logUserIn}
                  logUserOut={this.props.logUserOut}
                  isBasicProfileAndProduction={this.props.isBasicProfileAndProduction}
                /> */}
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
})(
  connect(
    null,
    { loginUserAPI }
  )(Login)
);
