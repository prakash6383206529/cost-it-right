import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import { langs } from "../../config/localization";
import { toastr } from "react-redux-toastr";
import { connect } from "react-redux";
import { Loader } from "../common/Loader";
import { required, alphabetsOnlyForName, number } from "../../helper/validation";
import { renderText } from "../layout/FormInputs";
import "./UserRegistration.scss";
import { addDepartmentAPI } from "../../actions/auth/AuthActions";
import { MESSAGES } from "../../config/message";
import { reactLocalStorage } from "reactjs-localstorage";
import { Redirect } from 'react-router-dom';
import DepartmentsListing from './DepartmentsListing';

class Department extends Component {
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
    componentDidMount() { }

    /**
     * @name onSubmit
     * @param values
     * @desc Submit the signup form values.
     * @returns {{}}
     */
    onSubmit(values) {
        console.log("Department values", values)
        this.setState({ isLoader: true })
        this.props.addDepartmentAPI(values, (res) => {
            if (res.data.Result) {
                toastr.success(MESSAGES.ADD_DEPARTMENT_SUCCESSFULLY)
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
                                Add Department
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                            <div className=" row form-group">
                                <div className="input-group col-md-6 input-withouticon" >
                                    <Field
                                        label="Department Name"
                                        name={"DepartmentName"}
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
                <DepartmentsListing />
            </div>
        );
    }
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
    form: "Department",
})(connect(mapStateToProps,
    { addDepartmentAPI }
)(Department));
