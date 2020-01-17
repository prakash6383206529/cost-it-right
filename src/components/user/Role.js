import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import { langs } from "../../config/localization";
import { toastr } from "react-redux-toastr";
import { connect } from "react-redux";
import { Loader } from "../common/Loader";
import { required, alphabetsOnlyForName, number } from "../../helper/validation";
import { renderText } from "../layout/FormInputs";
import "./UserRegistration.scss";
import { addRoleAPI, getAllRoleAPI, getRoleDataAPI, updateRoleAPI } from "../../actions/auth/AuthActions";
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
            isEditFlag: false,
        };
    }

    /**
    * @method componentDidMount
    * @description used to called after mounting component
    */
    componentDidMount() {

    }

    /**
    * @method getRoleDetail
    * @description used to get role detail
    */
    getRoleDetail = (data) => {
        if (data && data.isEditFlag) {
            this.props.getRoleDataAPI(data.RoleId, () => {
                this.setState({
                    isEditFlag: true,
                })
            })
        }
    }

    /**
    * @method cancel
    * @description used to cancel role edit
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.setState({ isEditFlag: false })
    }

    /**
     * @name onSubmit
     * @param values
     * @desc Submit the signup form values.
     * @returns {{}}
     */
    onSubmit(values) {
        const { isEditFlag } = this.state;
        const { reset } = this.props;
        this.setState({ isLoader: true })

        if (isEditFlag) {
            // Update existing role
            this.props.updateRoleAPI(values, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_ROLE_SUCCESSFULLY)
                }
                this.setState({ isLoader: false })
            })
        } else {
            // Add new role
            this.props.addRoleAPI(values, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.ADD_ROLE_SUCCESSFULLY)
                }
                this.props.getAllRoleAPI(res => { })
                reset();
                this.setState({ isLoader: false })
            })
        }

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
                                    onClick={this.cancel}
                                    type="button"
                                    value="Reset"
                                    className="btn  login-btn w-10 dark-pinkbtn"
                                />
                            </div>
                        </form>
                    </div>
                </div>
                <RolesListing
                    getRoleDetail={this.getRoleDetail}
                />
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
    const { roleList, roleDetail } = auth;
    let initialValues = {};

    if (roleDetail && roleDetail != undefined) {
        initialValues = {
            RoleName: '',
            Description: '',
        }
    }

    return { roleList, initialValues };
};

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    addRoleAPI,
    getAllRoleAPI,
    getRoleDataAPI,
    updateRoleAPI,
})(reduxForm({
    form: 'Role',
    enableReinitialize: true,
})(Role));