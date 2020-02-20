import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import { langs } from "../../config/localization";
import { toastr } from "react-redux-toastr";
import { connect } from "react-redux";
import { Loader } from "../common/Loader";
import { required, alphabetsOnlyForName, number } from "../../helper/validation";
import { renderText } from "../layout/FormInputs";
import "./UserRegistration.scss";
import { addDepartmentAPI, getAllDepartmentAPI, getDepartmentAPI, setEmptyDepartmentAPI, updateDepartmentAPI } from "../../actions/auth/AuthActions";
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
            isEditFlag: false,
            DepartmentId: '',
        };
    }

    /**
    * @method componentDidMount
    * @description used to called after mounting component
    */
    componentDidMount() { }

    /**
    * @method getDepartmentDetail
    * @description used to get department detail
    */
    getDepartmentDetail = (data) => {
        if (data && data.isEditFlag) {
            this.props.getDepartmentAPI(data.DepartmentId, () => {
                this.setState({
                    isEditFlag: true,
                    DepartmentId: data.DepartmentId,
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
        this.props.setEmptyDepartmentAPI('', () => { })
    }

    /**
     * @name onSubmit
     * @param values
     * @desc Submit the signup form values.
     * @returns {{}}
     */
    onSubmit(values) {
        const { isEditFlag, DepartmentId } = this.state;
        const { reset } = this.props;
        this.setState({ isLoader: true })

        if (isEditFlag) {

            // Update existing department
            let formReq = {
                DepartmentId: DepartmentId,
                IsActive: true,
                CreatedDate: '',
                DepartmentName: values.DepartmentName,
                Description: values.Description,
            }
            this.props.updateDepartmentAPI(formReq, (res) => {
                if (res && res.data && res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_DEPARTMENT_SUCCESSFULLY)
                }
                this.props.getAllDepartmentAPI(res => { });
                reset();
                this.setState({ isLoader: false, isEditFlag: false })
                this.props.setEmptyDepartmentAPI('', () => { })
            })

        } else {

            // Add new department
            this.props.addDepartmentAPI(values, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.ADD_DEPARTMENT_SUCCESSFULLY)
                }
                this.props.getAllDepartmentAPI(res => { });
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
                                        maxLength={100}
                                    />
                                </div>

                            </div>

                            <div className="text-center ">
                                <input
                                    disabled={isSubmitted ? true : false}
                                    type="submit"
                                    value={this.state.isEditFlag ? 'Update' : 'Save'}
                                    className="btn  login-btn w-10 dark-pinkbtn"
                                />
                                <input
                                    disabled={pristine || submitting}
                                    onClick={this.cancel}
                                    type="submit"
                                    value="Reset"
                                    className="btn  login-btn w-10 dark-pinkbtn"
                                />
                            </div>
                        </form>
                    </div>
                </div>
                <DepartmentsListing
                    getDepartmentDetail={this.getDepartmentDetail} />
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
    const { departmentDetail } = auth;
    let initialValues = {};

    if (departmentDetail && departmentDetail != undefined) {
        initialValues = {
            DepartmentName: departmentDetail.DepartmentName,
            Description: departmentDetail.Description,
        }
    }

    return { initialValues, departmentDetail };
};

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    addDepartmentAPI,
    getDepartmentAPI,
    updateDepartmentAPI,
    getAllDepartmentAPI,
    setEmptyDepartmentAPI,
})(reduxForm({
    form: 'Department',
    enableReinitialize: true,
})(Department));
