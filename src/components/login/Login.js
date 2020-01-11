import React, { Component } from "react";
import axios from "axios";
import { Field, reduxForm } from "redux-form";
import { Link } from "react-router-dom";
import { renderPasswordInputField, renderEmailInputField, renderCheckboxInputField, focusOnError } from "../layout/FormInputs";
import { connect } from "react-redux";
import { toastr } from "react-redux-toastr";
import { loginUserAPI } from "../../actions";
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
    };
  }

  componentWillMount() { }

  /**
   * Submit the login form
   * @param values
   */

  onSubmit(values) {
    console.log("value", values)

    this.props.loginUserAPI(values, (res) => {
      if (res && res.data && res.data.Result) {
        this.setState({ isLoader: false, isSubmitted: false });
        toastr.success(MESSAGES.LOGIN_SUCCESS)
        let userDetail = formatLoginResult(res.data);
        reactLocalStorage.setObject("userDetail", userDetail);
        this.props.logUserIn();
        this.props.history.push("/");
      }
    });
  }

  render() {
    const { handleSubmit } = this.props;
    const { isLoader, isSubmitted } = this.state;

    return (
      <div>
        {isLoader && <Loader />}
        <div className="login-container ">
          <div className="card-body shadow-lg login-form">
            {/* <div className="main-logo">
              <a href="javaScript:Void(0);"><img src={require('../../assests/images/cir-logo.png')} alt='Cost It Rights' />
              </a>
            </div> */}
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
                  name="UserName"
                  label="UserName"
                  component={renderEmailInputField}
                  isDisabled={false}
                  placeholder={"email@domain.coms"}
                  validate={[required, email, minLength5, maxLength70]}
                  required={true}
                  maxLength={71}
                />
              </div>
              <div className="input-group ">
                <Field
                  name="Password"
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
                <Field name="RememberMe" label="Remember Me" id="remember" component={renderCheckboxInputField} type="checkbox" />
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
})(connect(null,
  { loginUserAPI }
)(Login));
