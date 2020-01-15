import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import { langs } from "../../config/localization";
import { toastr } from "react-redux-toastr";
import { connect } from "react-redux";
import { Loader } from "../common/Loader";
import { required, alphabetsOnlyForName, number } from "../../helper/validation";
import { renderText } from "../layout/FormInputs";
import "./UserRegistration.scss";
import { addRoleAPI } from "../../actions/auth/AuthActions";
import { MESSAGES } from "../../config/message";
import { reactLocalStorage } from "reactjs-localstorage";
import { Redirect } from 'react-router-dom';
import RolesListing from './RolesListing';

class Role extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoader: false,
            isSubmitted: false,
        };
    }

    /**
    * @method componentDidMount
    * @description used to called after mounting component
    */
    componentDidMount() {

    }

    /**
     * @name onSubmit
     * @param values
     * @desc Submit the signup form values.
     * @returns {{}}
     */
    onSubmit(values) {
        console.log("Role values", values)
        this.setState({ isLoader: true })
        this.props.addRoleAPI(values, (res) => {
            if (res.data.Result) {
                toastr.success(MESSAGES.ADD_ROLE_SUCCESSFULLY)
            }
            this.setState({ isLoader: false })
        })

    }


    render() {
        const { handleSubmit, pristine, reset, submitting } = this.props;
        const { isLoader, isSubmitted } = this.state;

        return (
            <div>
                {isLoader && <Loader />}
                <div className="login-container  signup-form">
                    <div className="shadow-lg login-form">
                        <div className="form-heading">
                            <h2>
                                Add Role
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                            <div className=" row form-group">
                                <div className="input-group col-md-6 input-withouticon" >
                                    <Field
                                        label="Role Name"
                                        name={"RoleName"}
                                        type="text"
                                        placeholder={''}
                                        validate={[required, alphabetsOnlyForName]}
                                        component={renderText}
                                        required={true}
                                        maxLength={26}
                                    />
                                </div>
                                <div className="input-group  col-md-6 input-withouticon">
                                    <Field
                                        label="Description"
                                        name={"Description"}
                                        type="text"
                                        placeholder={''}
                                        validate={[]}
                                        component={renderText}
                                        required={false}
                                        maxLength={26}
                                    />
                                </div>

                            </div>

                            <div className="text-center ">
                                <input
                                    disabled={isSubmitted ? true : false}
                                    type="submit"
                                    value="Save"
                                    className="btn  login-btn w-10 dark-pinkbtn"
                                />
                                <input
                                    disabled={pristine || submitting}
                                    onClick={reset}
                                    type="submit"
                                    value="Reset"
                                    className="btn  login-btn w-10 dark-pinkbtn"
                                />
                            </div>
                        </form>
                    </div>
                </div>
                <RolesListing />
            </div>
        );
    }
}


/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
const mapStateToProps = ({ auth }) => {
    const { roleList } = auth;

    return { roleList };
};

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default reduxForm({
    form: "Role",
})(connect(mapStateToProps, {
    addRoleAPI,
})(Role));
