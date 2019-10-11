import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import { langs } from "../../config/localization";
import { toastr } from "react-redux-toastr";
import { connect } from "react-redux";
import { Loader } from "../common/Loader";
import {
  minLength3,
  minLength5,
  maxLength25,
  maxLength11,
  maxLength12,
  required,
  email,
  minLength7,
  maxLength70,
  alphabetsOnlyForName
} from "../../helper/validation";
import {
  renderPasswordInputField,
  focusOnError,
  renderEmailInputField,
  renderText
} from "../layout/FormInputs";
import "./SignupForm.scss";
import { registerUserAPI } from "../../actions/auth/AuthActions";
import { MESSAGES } from "../../config/message";
import { reactLocalStorage } from "reactjs-localstorage";
import { Redirect } from 'react-router-dom';

class Signup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      token: this.props.match.params.token,
      maxLength: maxLength11,
      countryCode: false,
      lowerCaseCheck: false,
      upperCaseCheck: false,
      numberCheck: false,
      lengthCheck: false,
      specialCharacterCheck: false,
      isLoader: false,
      isSubmitted: false,
      isShowHide: false,
      isShowHidePassword: false,
      isRedirect: false,
      isSignup: false
    };
  }

  /**
  * @method componentDidMount
  * @description used to called after mounting component
  */
  componentDidMount() {
    const isLoggedIn = reactLocalStorage.getObject('isLoggedIn');
    if (isLoggedIn == true) {
      this.setState({
        isRedirect: true
      })
    }
  }

  /**
   * @name Capitalize
   * @desc Capitallize the first letter of the string
   */
  Capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * @name onSubmit
   * @param values
   * @desc Submit the signup form values.
   * @returns {{}}
   */
  onSubmit(values) {
    values.username = values.email.toLowerCase();
    values.accountType = "Performer";
    values.registrationType = "mobile";
    //this.state.isSubmitted = true;
    this.setState({ isLoader: true, isSubmitted: true })
    this.props.registerUserAPI(values, res => {
      this.setState({ isSubmitted: false, isLoader: false })
      const status = res.status;
      if (res && res.status) {
        if (status === 200) {
          if (res.data.success === true) {
            toastr.success(MESSAGES.REGISTRATION_SUCCESS);
            reactLocalStorage.setObject("userData", values);
            reactLocalStorage.setObject('verificationStatus', true);
            setTimeout(() => {
              window.location.assign("/verification");
            }, 2000);
          } else {
            if (typeof res.data.errfor.username != "undefined") {
              toastr.error(MESSAGES.EMAIL_ALREADY_EXIST);
            } else if (res.data.errfor.email) {
              toastr.error(MESSAGES.EMAIL_ALREADY_EXIST);
            } else {
              toastr.error(MESSAGES.SOME_ERROR);
            }
          }
        } else {
          if (status === 422) {
            toastr.error(MESSAGES.SOME_ERROR);
          } else {
            toastr.error(MESSAGES.SOME_ERROR);
          }
        }
      } else {
        this.setState({ isLoader: false });
      }
    });
  }

  /**
   * @name hanldePhoneNumber
   * @param e
   * @desc Validate phone number
   */
  hanldePhoneNumber = e => {
    const value = e.target.value;
    var number = value.split("");

    if (number[0] === "6" && number[1] === "1") {
      if (number.length === 11) {
        this.setState({ maxLength: maxLength12, countryCode: true });
      }
    }

    if (number[0] === "0") {
      if (number.length === 10) {
        this.setState({ maxLength: maxLength11, countryCode: false });
      }
    }
  };

  /**
   * @name passwordPatternHandler
   * @param e
   * @desc Validate password pattern
   */
  passwordPatternHandler = e => {
    const value = e.target.value;
    const input = value;
    var number = input.split("");

    if (/^(?=.*[a-z])/.test(value) === true) {
      this.setState({ lowerCaseCheck: true });
    } else {
      this.setState({ lowerCaseCheck: false });
    }

    if (/^(?=.*[A-Z])/.test(value) === true) {
      this.setState({ upperCaseCheck: true });
    } else {
      this.setState({ upperCaseCheck: false });
    }

    if (/^(?=.*\d)/.test(value)) {
      this.setState({ numberCheck: true });
    } else {
      this.setState({ numberCheck: false });
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      this.setState({ specialCharacterCheck: true });
    } else {
      this.setState({ specialCharacterCheck: false });
    }

    if (number.length >= 6) {
      this.setState({ lengthCheck: true });
    } else {
      this.setState({ lengthCheck: false });
    }
  };

  showHideHandler = () => {
    this.setState({ isShowHide: !this.state.isShowHide })
  }

  showHidePasswordHandler = () => {
    this.setState({ isShowHidePassword: !this.state.isShowHidePassword })
  }
  render() {
    const { handleSubmit } = this.props;
    const {
      isLoader,
      isSubmitted,
      isRedirect
    } = this.state;

    if (isRedirect == true) {
      return <Redirect
        to={{
          pathname: "/dashboard",
        }} />
    }

    return (
      <div>
        {isLoader && <Loader />}
        <div className="login-container  signup-form">
          <div className="card-body shadow-lg login-form">
            <div className="form-heading">
              <h2>
                Sign Up
             </h2>
            </div>
            <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
              <div className=" row form-group">
                <div className="input-group col-md-6 input-withouticon" >
                  {/* <div className="input-group-prepend ">
                    <span className="input-group-text bg-white"><i className="fas fa-phone fa-rotate-90"></i></span>
                </div> */}
                  <Field
                    label="First Name"
                    name={"firstName"}
                    type="text"
                    placeholder={''}
                    validate={[required, minLength3, maxLength25, alphabetsOnlyForName]}
                    component={renderText}
                    required={true}
                    maxLength={26}
                  />
                </div>
                <div className="input-group  col-md-6 input-withouticon">
                  <Field
                    label="Last Name"
                    name={"lastName"}
                    type="text"
                    placeholder={''}
                    validate={[required, minLength3, maxLength25, alphabetsOnlyForName]}
                    component={renderText}
                    required={true}
                    maxLength={26}
                  />
                </div>
              </div>
              <div className="row form-group">
                <div className="input-group col-md-12">
                  <Field
                    name="email"
                    label="Email Address"
                    component={renderEmailInputField}
                    isDisabled={false}
                    placeholder={'email@domain.com/co.us'}
                    validate={[required, email, minLength7, maxLength70]}
                    required={true}
                    maxLength={70}
                  />
                </div>
              </div>
              <div className="row form-group">
                <div className="input-group col-md-6">
                  <Field
                    name="password"
                    label="Password"
                    placeholder="Must have atleast 5 characters"
                    component={renderPasswordInputField}
                    onChange={this.passwordPatternHandler}
                    validate={[required, minLength5, maxLength25]}
                    isShowHide={this.state.isShowHidePassword}
                    showHide={this.showHidePasswordHandler}
                    required={true}
                    maxLength={26}
                    isEyeIcon={true}
                  />
                </div>
                <div className="input-group col-md-6">
                  <Field
                    name="passwordConfirm"
                    label="Confirm Password"
                    placeholder={''}
                    component={renderPasswordInputField}
                    validate={[required, minLength5, maxLength25]}
                    required={true}
                    maxLength={26}
                    isShowHide={this.state.isShowHide}
                    showHide={this.showHideHandler}
                    isEyeIcon={true}
                  />
                </div>
              </div>
              <div className="row form-group">
                <div className="col-md-12 text-center">
                  <p>
                    By creating an account you are agree to our <a className="yellow-color" target="_blank" href="/terms-conditions" target='blank'>Terms & Conditions </a>
                    and <a className="yellow-color" target="_blank" href="/privacy-policy">Privacy Policy.</a>
                  </p>
                </div>
              </div>

              <div className="text-center ">
                <input
                  disabled={isSubmitted ? true : false}
                  type="submit"
                  value="SIGN UP"
                  className="btn  login-btn w-50 dark-pinkbtn"
                />
              </div>
            </form>
            {/* <div className="row">
              <div className="col-md-12 text-center login-social">
                <p className="m-3" >or login through social media</p>
                <ul className="list-unstyled d-flex text-center m-b0">
                  <li><a href=""><span className="fb-icon"><i className="fab fa-facebook-f"></i></span></a></li>
                  <li><a href=""><span className="insta-icon"><i className="fab fa-instagram"></i></span></a></li>
                  <li><a href=""><span className=" google-icon"><i className="fab fa-google"></i></span></a></li>
                </ul>
              </div>
            </div> */}
            
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
function validate(values) {
  let errors = {};

  // if (!values.phone) {
  //   errors.phone = langs.validation_messages.phone_number_required;
  // }
  // if (vlidatePhoneNumber(values.phone)) {
  //   errors.phone = langs.validation_messages.phone_number_pattern;
  // }
  if (values.passwordConfirm !== values.password) {
    errors.passwordConfirm =
      langs.validation_messages.password_confirm_password;
  }
  if (!values.passwordConfirm) {
    errors.passwordConfirm =
      langs.validation_messages.confirm_password_required;
  }
  if (!values.agree && values.agree !== true) {
    errors.agree = langs.validation_messages.agree_to_terms;
  }
  return errors;
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
const mapStateToProps = state => {
  let returnObj = {};

  return returnObj;
};

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default reduxForm({
  validate,
  form: "Signup",
  onSubmitFail: errors => {
    focusOnError(errors);
  }
})(
  connect(
    mapStateToProps,
    { registerUserAPI }
  )(Signup)
);
