import React, { Component } from "react";
import "./ForgotPassword.scss";
import { Field, reduxForm } from "redux-form";
import { reactLocalStorage } from "reactjs-localstorage";
import { Redirect } from 'react-router-dom';
import { connect } from "react-redux";
import Toaster from "../common/Toaster";
import { Link } from "react-router-dom";
import { renderEmailInputField, focusOnError } from "../layout/FormInputs";
import { required, email } from "../../helper/validation";
import { forgotPasswordAPI } from "../../actions/auth/AuthActions";
import { MESSAGES } from "../../config/message";
import { Loader } from "../common/Loader";

class ForgotPassword extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoader: false,
      isRedirect: false
    };
  }
  /**
  * @method componentDidMount
  * @description used to called after mounting component
  */
  componentDidMount() {
    const isLoggedIn = reactLocalStorage.getObject('isLoggedIn');
    if (isLoggedIn === true) {
      this.setState({
        isRedirect: true
      })
    }
  }

  /**
   * Submit the ForgotPassword form
   * @param values
   */
  onSubmit(values) {
    this.setState({ isLoader: true })
    let userData = reactLocalStorage.getObject("userData");
    values.registrationType = "mobile";
    values.email = values.email.toLowerCase();
    userData.email = values.email.toLowerCase();
    this.props.forgotPasswordAPI(values, res => {
      this.setState({ isLoader: false })
      if (res && res.data) {
        if (res.data.success !== true) {
          Toaster.error(MESSAGES.INVALID_EMAIL);
        } else {
          reactLocalStorage.setObject("userData", userData);
          Toaster.success(res.data.message);
          setTimeout(() => {
            window.location.assign("/login");
          }, 3000);
        }
      }
    });
  }

  /**
   * Render login form
   * @returns {*}
   */
  render() {
    const { handleSubmit } = this.props;
    const { isLoader, isRedirect } = this.state;

    if (isRedirect === true) {
      return <Redirect
        to={{
          pathname: "/dashboard",
        }} />
    }

    return (
      <div>
        {isLoader && <Loader />}
        <div className="login-container small-screen">
          <div className="card-body shadow-lg login-form forgot-pwd">
            <div className="form-heading">
              <h2>Forgot Password</h2>
            </div>
            <form
              noValidate
              className="form w-100"
              onSubmit={handleSubmit(this.onSubmit.bind(this))}
            >
              <div className="input-group ">
                <Field
                  name="email"
                  label="Email Address"
                  component={renderEmailInputField}
                  isDisabled={false}
                  placeholder={"email@domain.com/co.us"}
                  validate={[required, email]}
                  required={true}
                />
              </div>

              <div className="text-center ">
                <input
                  type="submit"
                  value="Confirm"
                  className="btn  login-btn  dark-pinkbtn m-3"
                />
              </div>
              <div className="text-center forgot-text p-2">
                <Link to="/login">Back to login page</Link>
              </div>
            </form>
            <div className="row" />
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
  return errors;
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default reduxForm({
  validate,
  form: "ForgotPassword",
  onSubmitFail: errors => {
    focusOnError(errors);
  }
})(
  connect(
    null,
    { forgotPasswordAPI }
  )(ForgotPassword)
);
