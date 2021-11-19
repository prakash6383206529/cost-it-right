import React, { Component } from 'react';
import axios from 'axios';
import './ResetPassword.css';
import Toaster from '../common/Toaster';
import { Field, reduxForm } from 'redux-form';
import { renderPasswordInputField, focusOnError } from '../layout/FormInputs'
import { connect } from 'react-redux';
import { langs } from "../../config/localization";
import { minLength5, required } from '../../helper/validation';
import { Loader } from '../common/Loader';
import { MESSAGES } from '../../config/message';
import { updatePasswordAPI } from '../../actions/auth/AuthActions';
import { reactLocalStorage } from 'reactjs-localstorage';

class ResetPassword extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isSubmitted: false,
            isLoader: false,
            changePassword: false
        }
    }

    /**
     * @method onSubmit Submit the login form
     * @param values
     */
    onSubmit(values) {
        this.setState({ isLoader: true })
        const userObj = reactLocalStorage.getObject('userResponse');
        const userAuthToken = axios.defaults.headers.common['Authorization'];
        if (typeof userAuthToken == 'undefined' || userAuthToken === '' || userAuthToken == null) {
            axios.defaults.headers.common = { 'Authorization': `bearer ${userObj.token}` };
        }

        this.props.updatePasswordAPI(values, (response) => {
            this.setState({ isLoader: false })
            if (response && response.data) {
                if (response.data.success !== true) {
                    if (response.data.success === false) {
                        Toaster.error(response.data.errors[0]);
                    } else {
                        Toaster.error(MESSAGES.SOME_ERROR);
                    }
                } else {
                    Toaster.success(MESSAGES.UPDATE_PASSWORD_SUCCESS);
                    setTimeout(() => {
                        window.location.assign('/dashboard');
                    }, 3000)
                }
            } else {
                this.setState({ isLoader: false });
            }
        });
    }


    /**
     * @method render Render login form
     * @returns {*}
     */
    render() {
        const { handleSubmit } = this.props;
        return (
            <div>
                {this.state.isLoader && <Loader />}
                <div className="login-container small-screen">
                    <div className="card-body shadow-lg login-form forgot-pwd">
                        <div className="form-heading">
                            <h2>Change Password</h2>
                        </div>
                        <form noValidate className="form" onSubmit={handleSubmit(this.onSubmit.bind(this))}>
                            <div className="input-group form-group">
                                <Field
                                    name="newPassword"
                                    label="New Password"
                                    placeholder="Must have atleast 5 characters"
                                    component={renderPasswordInputField}
                                    validate={[required]}
                                    required={true}
                                    maxLength={26}
                                    changePassword={true}
                                    isEyeIcon={false}
                                />
                            </div>
                            <div className="input-group form-group">
                                <Field
                                    name="confirm"
                                    label="Confirm Password"
                                    placeholder="Confirm your new password"
                                    component={renderPasswordInputField}
                                    validate={[required]}
                                    required={true}
                                    maxLength={26}
                                    changePassword={true}
                                    isEyeIcon={false}
                                />
                            </div>
                            <div className="text-center "> <input type="submit" value="Update" className="btn  login-btn  dark-pinkbtn m-3"></input>
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

    if (!values.newPassword) {
        errors.newPassword = langs.validation_messages.new_password_required;
    }
    if (minLength5(values.newPassword)) {
        errors.newPassword = langs.validation_messages.password_pattern;
    }
    if (!values.confirm) {
        errors.confirm = langs.validation_messages.confirm_password_required;
    }
    if (values.newPassword !== values.confirm) {
        errors.confirm = langs.validation_messages.password_confirm_password;
    }

    return errors;
}


/**
    * @method mapStateToProps
    * @description return state to component as props
    * @param {*} state
    */
function mapStateToProps({ auth }) {
    const { error, loading, userData } = auth;
    return { error, loading, userData };
}

/**
    * @method connect
    * @description connect with redux
    * @param {function} mapStateToProps
    */
export default reduxForm({
    validate,
    form: 'ResetPassword',
    onSubmitFail: (errors) => {
        focusOnError(errors)
    }
})(
    connect(mapStateToProps, { updatePasswordAPI })(ResetPassword)
);

