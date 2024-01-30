
import React, { Component } from "react";
import { Field, formValueSelector, reduxForm } from "redux-form";
import {
  renderPasswordInputField, renderEmailInputField, focusOnError,
  renderText
} from "../layout/FormInputs";
import { connect } from "react-redux";
import { loginUserAPI, getMenuByUser, TokenAPI, forgetPassword } from "../../actions/auth/AuthActions";
import { maxLength70, maxLength25, required, email } from "../../helper/validation";
import "./Login.scss";
import { Loader } from "../common/Loader";
import { reactLocalStorage } from "reactjs-localstorage";
import { Redirect } from 'react-router-dom';
import { formatLoginResult } from '../../helper/ApiResponse';
import logo from '../../assests/images/logo/company-logo.svg'
//MINDA
// import logo from '../../assests/images/logo/company-logo.png'
import secondLogo from '../../assests/images/logo/CIRlogo.svg'
import CheckIcon from '../../assests/images/mail-sent.png'
import errorImg from '../../assests/images/box.png'
import { IV, KEY, VERSION } from '../../config/constants'
import LoaderCustom from "../common/LoaderCustom";
var CryptoJS = require('crypto-js')

const selector = formValueSelector('Login')
class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoader: false,
      isSubmitted: false,
      isRedirect: false,
      inputLoader: false,
      mailSent: false,
      userNotFound: false,
      buttonFlag: true,
      forgetIsCalled: false,
      flag: false,
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
      if (reactLocalStorage.getObject('logoutRefresh')) {
        reactLocalStorage.setObject('logoutRefresh', false)
        setTimeout(() => {
          window.location.reload()
        }, 500);
      }
    }
  }

  /**
   * @method FORGOT CONFIRM
   */
  forgotConfirm = () => {
    const { fieldsObj } = this.props;
    if (this.state.forgetIsCalled) {
      return false
    } else {
      this.setState({ forgetIsCalled: true })
      this.props.forgetPassword(fieldsObj, (res) => {
        if (res && res.status === 200) {
          this.setState({ mailSent: true, userNotFound: false, buttonFlag: false, forgetIsCalled: false })
        } else if (res && res.status === 204) {
          this.setState({ userNotFound: true, mailSent: false, buttonFlag: false, forgetIsCalled: false })
        }
      })
    }



  }

  /**
   * Submit the login form
   * @param values
   */
  onSubmit(values) {

    var key = CryptoJS.enc.Utf8.parse(KEY);
    var iv = CryptoJS.enc.Utf8.parse(IV);
    var encryptedpassword = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(values.Password), key,
      {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

    let reqParams = {
      username: values.UserName,
      password: encryptedpassword.toString(),
      grant_type: 'password',
    }
    this.setState({ inputLoader: true })
    // this.props.loginUserAPI(values, (res) => {
    this.props.TokenAPI(reqParams, (res) => {
      if (res && res.status === 200) {
        reactLocalStorage.setObject("loginTime", new Date());
        this.setState({ isLoader: false, isSubmitted: false });

        let userDetail = formatLoginResult(res.data.Data);
        let departmentList = ''
        const dept = userDetail && userDetail.Department.map((item) => {
          if (item.Role === 'SuperAdmin') {
            //MINDA
            // if (userDetail.Role === 'Group Category Head' || userDetail.Role === 'SuperAdmin') {
            return ''
          } else {
            return item.DepartmentCode
          }

        })
        departmentList = dept.join(',')
        localStorage.setItem("userDetail", JSON.stringify(userDetail))
        reactLocalStorage.setObject("departmentList", departmentList);
        setTimeout(() => {
          this.setState({ inputLoader: false })
        }, 1500)
        this.props.logUserIn();

        // this.setState({ isRedirect: true })
        setTimeout(() => {
          window.location.replace("/");
        }, 1000)
      }
      setTimeout(() => {
        this.setState({ inputLoader: false })
      }, 1500)
    })

    // });
  }

  render() {
    const { handleSubmit, initialConfiguration } = this.props;
    const { isLoader, isSubmitted, isRedirect, mailSent, userNotFound, buttonFlag } = this.state;

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
                  <img className="logo-first" src={logo} alt="Softude" />
                  {/* //RE */}
                  {/* <img className="logo-first" src={logo} alt="Royal Enfield" /> */}
                  {/* MINDA */}
                  {/* <img className="logo-first" src={logo} alt="Minda" /> */}
                </div >
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
                        onClickCapture={(e) => this.setState({ buttonFlag: true, userNotFound: false, mailSent: false, forgetIsCalled: false })}
                        validate={[required, email, maxLength70]}
                        required={true}
                      // maxLength={71}
                      />
                      :
                      <span className="inputbox input-group ">
                        <Field
                          label=""
                          name={"UserName"}
                          type="text"
                          placeholder={'User Name'}
                          validate={[required, maxLength70]}
                          component={renderText}
                          required={true}
                          onClickCapture={(e) => this.setState({ buttonFlag: true, userNotFound: false, mailSent: false, forgetIsCalled: false })}
                          // maxLength={26}
                          className={'withBorder'}
                        /></span>
                    }
                  </div>
                  <div className="input-group phone" onClickCapture={(e) => this.setState({ buttonFlag: true, userNotFound: false, mailSent: false, forgetIsCalled: false })}>
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

                  <div className="text-center p-relative">
                    {this.state.inputLoader && <LoaderCustom customClass="login-loader" />}
                    <input
                      type="submit"
                      disabled={isSubmitted ? true : false}
                      value="Login"
                      className="btn login-btn w-100 dark-pinkbtn"
                    />
                  </div>
                </form >
                {buttonFlag && <div className="forgot-link  d-flex pt-2 justify-content-center">
                  <span id="userNotFound" className="btn btn-link" onClick={this.forgotConfirm}>{'Forgot Password ?'}</span>
                </div>
                }
                <div className="forget-wrapper">
                  {userNotFound && (
                    <div className="text-help userNotFound text-center">The provided user does not exist.</div>
                  )
                  }
                  {mailSent && (
                    <div className="mail-sent"><img src={CheckIcon} alt="check" />Password reset email sent successfully! Please check your inbox.</div>
                  )}
                </div>

                <div className="bottomlogo_con mt-3">
                  <span className="mt-0">Powered By</span>
                  <img className="logo-second" src={secondLogo} alt="Cost It Right" />

                </div>
              </div >
              <div className="col-md-7 p-0 right-sideimg">
                <img src={errorImg} alt='error-icon' />
              </div>
            </div >
          </div >
        </div >
        <p className="login-version">{VERSION}</p>
      </div >
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
function mapStateToProps(state) {
  const fieldsObj = selector(state, 'UserName')
  const { menusData, leftMenuData, initialConfiguration } = state.auth
  return { menusData, leftMenuData, initialConfiguration, fieldsObj }
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
  TokenAPI,
  forgetPassword
})(Login));
