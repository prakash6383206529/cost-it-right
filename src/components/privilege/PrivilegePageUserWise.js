import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import { connect } from "react-redux";
import { Loader } from "../common/Loader";
import { required, alphabetsOnlyForName, number } from "../../helper/validation";
import { renderText, renderMultiSelectField, renderSelectField } from "../layout/FormInputs";
import { getPageSelectList, setPagePermissionUserWise, getAllUserAPI } from "../../actions/auth/AuthActions";
import { MESSAGES } from "../../config/message";
import { reactLocalStorage } from "reactjs-localstorage";
import { Redirect } from 'react-router-dom';
import { toastr } from "react-redux-toastr";
import { EAccessType } from "../../config/masterData";

class PrivilegePageUserWise extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoader: false,
            isSubmitted: false,
            isEditFlag: false,
            selectedPages: [],
        };
    }

    /**
    * @method componentDidMount
    * @description used to called after mounting component
    */
    componentDidMount() {
        this.props.getPageSelectList(() => { })
        this.props.getAllUserAPI(() => { })
    }

    /**
    * @method renderTypeOfListing
    * @description Used show select listings
    */
    renderTypeOfListing = (label) => {
        const { userList, pageSelectList } = this.props;
        const temp = [];

        if (label === 'pages') {
            pageSelectList && pageSelectList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }

        if (label === 'user') {
            userList && userList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }
    }

    /**
    * @method handleUser
    * @description Used handle user select list
    */
    handleUser = (e) => {

    }

    /**
    * @method handlePageSelection
    * @description Used handle page select list
    */
    handlePageSelection = (e) => {
        this.setState({ selectedPages: e })
    }

    /**
    * @method cancel
    * @description used to cancel privilege edit
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            isRoot: false,
            selectedPages: []
        })
    }

    /**
     * @name onSubmit
     * @param values
     * @desc Submit the signup form values.
     * @returns {{}}
     */
    onSubmit(values) {
        const { reset } = this.props;
        const { selectedPages } = this.state;

        if (selectedPages.length == 0) {
            return false;
        }
        this.setState({ isLoader: true })

        let tempArr = [];

        selectedPages && selectedPages.map((page, index) => {
            let tempObj = {
                Id: '',
                PrivilegePageId: page.Value,
                UserId: values.UserId,
                EAccessType: values.EAccessType,
                IsActive: true,
                IsDenied: true,
                IsPermission: true,
                CreatedDate: '',
                CreatedBy: '',
            }
            tempArr.push(tempObj)
        })
        let formData = tempArr;

        this.props.setPagePermissionUserWise(formData, (res) => {
            if (res && res.data && res.data.Result) {
                toastr.success(MESSAGES.ADD_PRIVILEGE_PAGE_USERWISE_SUCCESSFULLY)
            }
            reset();
            this.setState({ isLoader: false, selectedPages: [] })
        })

    }


    render() {
        const { handleSubmit, pristine, reset, submitting } = this.props;
        const { isLoader, isSubmitted } = this.state;

        return (
            <div>
                {isLoader && <Loader />}
                <div className="login-container  signup-form">
                    <div className="shadow-lg privilege-form login-form">
                        <div className="form-heading">
                            <h2>
                                Privilege Page User Wise
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                            <div className=" row form-group">

                                <div className="input-group col-md-4 input-withouticon" >
                                    <Field
                                        label="Pages"
                                        name="PageId"
                                        placeholder="--Select Pages --"
                                        selection={this.state.selectedPages}
                                        options={this.renderTypeOfListing('pages')}
                                        selectionChanged={this.handlePageSelection}
                                        optionValue={option => option.Value}
                                        optionLabel={option => option.Text}
                                        component={renderMultiSelectField}
                                        mendatory={true}
                                        className="withoutBorder"
                                    />
                                </div>
                                <div className="input-group col-md-4 input-withouticon" >
                                    <Field
                                        label={`User Id`}
                                        name={"UserId"}
                                        type="text"
                                        placeholder={'Enter'}
                                        validate={[required]}
                                        required={true}
                                        className=" withoutBorder custom-select"
                                        options={this.renderTypeOfListing('user')}
                                        onChange={this.handleUser}
                                        optionValue={'Value'}
                                        optionLabel={'Text'}
                                        component={renderSelectField}
                                    />
                                </div>
                                <div className="input-group col-md-4 input-withouticon" >
                                    <Field
                                        label={`EAccessType`}
                                        name={"EAccessType"}
                                        type="text"
                                        placeholder={'Enter'}
                                        validate={[required]}
                                        required={true}
                                        className=" withoutBorder custom-select"
                                        options={EAccessType}
                                        onChange={this.handleEAccessType}
                                        optionValue={'value'}
                                        optionLabel={'label'}
                                        component={renderSelectField}
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
    const { pageSelectList, userList } = auth;

    return { pageSelectList, userList };
};

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getPageSelectList,
    setPagePermissionUserWise,
    getAllUserAPI,
})(reduxForm({
    form: 'PrivilegePageUserWise',
    enableReinitialize: true,
})(PrivilegePageUserWise));