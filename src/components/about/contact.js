import React, { Component } from "react";
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import {
  renderTextInputField,
  renderEmailInputField,
  renderTextAreaField,
  focusOnError
} from "../layout/FormInputs";
import { reactLocalStorage } from "reactjs-localstorage";
import { getUserProfileAPI } from '../../actions/Profile'
import { contactUsAPI } from "../../actions/auth/AuthActions";
import { isUserLoggedIn } from "../../helper/auth";
import {
  required,
  alphabetsOnlyForName,
  minLength5,
  minLength3,
  maxLength25,
  maxLength1000,
  email,
} from "../../helper/validation";
import { Redirect } from "react-router-dom";
import { Row, Col } from "reactstrap";
import { toastr } from 'react-redux-toastr';
import "./about.scss";

class Contact extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoader: false,
      isRedirect: false,
      name: '',
      email: '',
      message: ''
    };
  }

  /**
  * @method componentDidMount
  * @description  call after mounting the component
  */
  componentDidMount() {
    const isLoggedIn = isUserLoggedIn();
    if (isLoggedIn === true) {
      this.props.getUserProfileAPI(this.props.userData.id, true, () => { })
    }
  }

  /**
  * @method onSubmit
  * @description checek validation of fields and call  update profile api
  */
  onSubmit = values => {
    this.setState({ isLoader: true })
    let userData = reactLocalStorage.getObject("userData");
    userData.email = values.email.toLowerCase();
    this.setState({ isSubmitted: true });
    const requestData = {
      name: values.firstName,
      email: values.email,
      message: values.Message
    };
    this.props.contactUsAPI(requestData, (res) => {
      if (res.data.status === true) {
        toastr.success(res.data.message,'success');
        this.props.history.push('/dashboard');
      } else {
        toastr.error(res.data.message,'danger');
      }
    });
  }

  /**
  * Submit the login form
  * @param values
  */
  render() {
    const { isRedirect } = this.state;

    if (isRedirect == true) {
      return (
        <Redirect push
          to={{
            pathname: "/"
          }}
        />
      );
    }
    const { handleSubmit } = this.props;
    return (
      <div>
        <div className="login-container contact-form ">
          <div className="card-body shadow-lg login-form ">
            <div className="form-heading">
              <h2>Contact Us</h2>
            </div>
            <form noValidate className="form" onSubmit={handleSubmit(this.onSubmit.bind(this))}>
              <Row className="contact-image text-center">
                <img
                  src={require("../../assests/images/contact-icon.svg")}
                  alt=""
                />
                <Col xs={12}>
                  <h5>
                    Have questions or comments? Stage & Set is ready to help.{" "}
                  </h5>
                  <p>PO Box 444, New Albany, IN47151</p>
                </Col>
              </Row>
              <div className="input-group ">
                <Field
                  label="Your Name"
                  name={"firstName"}
                  type="text"
                  placeholder={"Enter"}
                  validate={[
                    required,
                    alphabetsOnlyForName,
                    minLength3,
                    maxLength25
                  ]}
                  component={renderTextInputField}
                  required={true}
                  maxLength="25"
                />
              </div>
              <div className="input-group ">
                <Field
                  name="email"
                  label="Email Address"
                  type="text"
                  isDisabled={false}
                  placeholder={"email@domain.com/co.us"}
                  validate={[required, email]}
                  component={renderEmailInputField}
                  required={true}
                />
              </div>
              <div className="input-group ">
                <Field
                  name="Message"
                  label="Message"
                  placeholder={"Enter"}
                  type="textarea"
                  component={renderTextAreaField}
                  validate={[required, minLength5, maxLength1000]}
                  required={true}
                  maxLength="1000"
                />
              </div>
              <div className="text-center ">
                <input
                  type="submit"
                  value="Send message"
                  className="btn login-btn dark-pinkbtn"
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
  return errors;
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ auth }) {
  const { userData, loading } = auth;
  let initialValues = {
  }
  if (userData) {
    initialValues = {
      firstName: userData.firstName,
      email: userData.email
    };
  }

  return { loading, userData, auth, initialValues };
}

export default connect(mapStateToProps, { getUserProfileAPI, contactUsAPI })(
  reduxForm({
    validate,
    form: "Contact",
    enableReinitialize: true,
    onSubmitFail: errors => {
      focusOnError(errors);
    }
  })(Contact)
);
