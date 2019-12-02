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
  alphabetsOnlyForName,
  number
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
  componentDidMount() { }

  /**
   * @name Capitalize
   * @desc Capitallize the first letter of the string
   */
  Capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
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

  /**
   * @name onSubmit
   * @param values
   * @desc Submit the signup form values.
   * @returns {{}}
   */
  onSubmit(values) {
    console.log("signup values", values)
    values.MiddleName = values.MiddleName
    this.props.registerUserAPI(values, res => {
      console.log('register res', res)
    })
  }


  render() {
    const { handleSubmit } = this.props;
    const { isLoader, isSubmitted } = this.state;

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
                <div className="input-group col-md-4 input-withouticon" >
                  <Field
                    label="First Name"
                    name={"FirstName"}
                    type="text"
                    placeholder={''}
                    validate={[required, minLength3, maxLength25, alphabetsOnlyForName]}
                    component={renderText}
                    required={true}
                    maxLength={26}
                  />
                </div>
                <div className="input-group  col-md-4 input-withouticon">
                  <Field
                    label="Middle Name"
                    name={"MiddleName"}
                    type="text"
                    placeholder={''}
                    validate={[alphabetsOnlyForName]}
                    component={renderText}
                    required={false}
                    maxLength={26}
                  />
                </div>
                <div className="input-group  col-md-4 input-withouticon">
                  <Field
                    label="Last Name"
                    name={"LastName"}
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
                <div className="input-group col-md-4">
                  <Field
                    name="email"
                    label="Email Address"
                    component={renderEmailInputField}
                    isDisabled={false}
                    placeholder={''}
                    validate={[required, email, minLength7, maxLength70]}
                    required={true}
                    maxLength={70}
                  />
                </div>
                <div className="input-group col-md-4">
                  <Field
                    name="Mobile"
                    label="Mobile"
                    type="text"
                    placeholder={''}
                    component={renderText}
                    isDisabled={false}
                    validate={[required, number, minLength7]}
                    required={true}
                    maxLength={70}
                  />
                </div>
                <div className="input-group col-md-4 input-withouticon" >
                  <Field
                    label="Role Name"
                    name={"RoleName"}
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
                <div className="input-group col-md-6">
                  <Field
                    name="Password"
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

              <div className="text-center ">
                <input
                  disabled={isSubmitted ? true : false}
                  type="submit"
                  value="SIGN UP"
                  className="btn  login-btn w-50 dark-pinkbtn"
                />
              </div>
            </form>
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
  if (values.passwordConfirm !== values.Password) {
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
})(connect(mapStateToProps,
  { registerUserAPI }
)(Signup));
