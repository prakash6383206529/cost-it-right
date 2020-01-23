import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import { connect } from "react-redux";
import { Loader } from "../common/Loader";
import { required, alphabetsOnlyForName, number } from "../../helper/validation";
import { renderText, renderMultiSelectField, renderSelectField } from "../layout/FormInputs";
import { rolesSelectList, getModuleSelectList, getPageSelectListByModule, setPagePermissionRoleWise } from "../../actions/auth/AuthActions";
import { MESSAGES } from "../../config/message";
import { reactLocalStorage } from "reactjs-localstorage";
import { Redirect } from 'react-router-dom';
import { toastr } from "react-redux-toastr";
import Select from "react-select";
import { EAccessType } from "../../config/masterData";

class PrivilegePageRoleWise extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoader: false,
            isSubmitted: false,
            isEditFlag: false,
            isRoot: false,
            selectedPages: [],
            checked: false,
            selectedRoles: [],
        };
    }

    /**
    * @method componentDidMount
    * @description used to called after mounting component
    */
    componentDidMount() {
        this.props.rolesSelectList(() => { })
        this.props.getModuleSelectList(() => { })
    }

    /**
    * @method cancel
    * @description used to cancel privilege edit
    */
    rootHandler = () => {
        this.setState({ isRoot: !this.state.isRoot })
    }

    /**
    * @method renderTypeOfListing
    * @description Used show select listings
    */
    renderTypeOfListing = (label) => {
        const { moduleSelectList, pageSelectListByModule, roleSelectList } = this.props;
        const temp = [];

        if (label === 'pages') {
            pageSelectListByModule && pageSelectListByModule.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }

        if (label === 'module') {
            moduleSelectList && moduleSelectList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }

        if (label === 'roles') {
            roleSelectList && roleSelectList.map(item =>
                temp.push({ Text: item.Text, Value: item.Value })
            );
            return temp;
        }

        if (label === 'selectAllRoles') {
            roleSelectList && roleSelectList.map((item, i) => {
                if (item.Value == 0) {
                    return false;
                }
                return (
                    temp.push({ Text: item.Text, Value: item.Value })
                )
            });
            return temp;
        }
    }

    /**
    * @method handleModule
    * @description Used handle module select list
    */
    handleModule = (e) => {
        let moduleId = e.target.value;
        if (moduleId && moduleId != '') {
            this.setState({ selectedPages: [] })
            this.props.getPageSelectListByModule(moduleId, () => { })
        }
    }

    /**
    * @method handlePageSelection
    * @description Used handle page select list
    */
    handlePageSelection = (e) => {
        this.setState({ selectedPages: e })
    }

    /**
    * @method selectAllCheckbox
    * @description Used handle selectAllCheckbox
    */
    selectAllCheckbox = e => {
        const isChecked = !this.state.checked;
        this.setState({
            checked: isChecked,
            selectedRoles: isChecked ? this.renderTypeOfListing('selectAllRoles') : []
        });
    };

    /**
     * @method onSelectChange
     * @description Used handle onSelectChange
     */
    onSelectChange = opt => {
        const { roleSelectList } = this.props;
        let optionsLength = (roleSelectList && roleSelectList.length > 0) ? roleSelectList.length : [];
        const allOptionsSelected = (opt && opt.length === optionsLength);
        this.setState({
            checked: allOptionsSelected ? true : false,
            selectedRoles: opt
        });
    };

    /**
    * @method cancel
    * @description used to cancel privilege edit
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            isRoot: false,
            selectedRoles: [],
            selectedPages: [],
            checked: false,
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
        const { selectedRoles, selectedPages } = this.state;

        if (selectedPages.length == 0 || selectedRoles.length == 0) {
            return false;
        }

        this.setState({ isLoader: true })

        let tempArr = [];

        selectedPages && selectedPages.map((page, index) => {
            selectedRoles && selectedRoles.map((role, i) => {
                let tempObj = {
                    Id: '',
                    PageId: page.Value,
                    RoleId: role.Value,
                    EAccessType: values.EAccessType,
                    IsActive: true,
                    CreatedDate: '',
                    CreatedBy: ''
                }
                tempArr.push(tempObj)
            })
        })
        let formData = tempArr;

        this.props.setPagePermissionRoleWise(formData, (res) => {
            if (res && res.data && res.data.Result) {
                toastr.success(MESSAGES.ADD_PRIVILEGE_PAGE_ROLEWISE_SUCCESSFULLY)
            }
            reset();
            this.setState({
                isLoader: false,
                selectedRoles: [],
                selectedPages: [],
            })
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
                                Privilege Page Role Wise
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                            <div className=" row form-group">
                                <div className="input-group col-md-4 input-withouticon" >
                                    <Field
                                        label={`Module`}
                                        name={"ModuleId"}
                                        type="text"
                                        placeholder={''}
                                        validate={[required]}
                                        required={true}
                                        className=" withoutBorder custom-select"
                                        options={this.renderTypeOfListing('module')}
                                        onChange={this.handleModule}
                                        optionValue={'Value'}
                                        optionLabel={'Text'}
                                        component={renderSelectField}
                                    />
                                </div>
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
                                <div className="input-group  col-md-4 input-withouticon multiselect-checkboxs">
                                    {/* <label>
                                        {'User'}
                                        {<span className="asterisk-required">*</span>}
                                    </label>
                                    <Select
                                        isMulti
                                        onChange={this.onSelectChange}
                                        options={this.renderTypeOfListing('roles')}
                                        value={this.state.selectedRoles}
                                        classNames={'custom'}
                                    /> */}
                                    <Field
                                        label="Roles"
                                        name="RoleId"
                                        placeholder="--Select Roles --"
                                        selection={this.state.selectedRoles}
                                        options={this.renderTypeOfListing('roles')}
                                        selectionChanged={this.onSelectChange}
                                        optionValue={option => option.Value}
                                        optionLabel={option => option.Text}
                                        component={renderMultiSelectField}
                                        mendatory={true}
                                        className="withoutBorder"
                                    />
                                    <div className="selectAll-checkbox">
                                        <input
                                            onChange={this.selectAllCheckbox}
                                            type="checkbox"
                                            id="selectAll"
                                            value="selectAll"
                                            checked={this.state.checked}
                                        />
                                        <label htmlFor="selectAll">Select all</label>
                                    </div>
                                </div>
                            </div>
                            <div className=" row form-group">
                                <div className="input-group col-md-4 input-withouticon" >
                                    <Field
                                        label={`EAccessType`}
                                        name={"EAccessType"}
                                        type="text"
                                        placeholder={''}
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
    const { roleSelectList, moduleSelectList, pageSelectListByModule } = auth;

    return { roleSelectList, moduleSelectList, pageSelectListByModule };
};

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    rolesSelectList,
    getModuleSelectList,
    getPageSelectListByModule,
    setPagePermissionRoleWise,
})(reduxForm({
    form: 'PrivilegePageRoleWise',
    enableReinitialize: true,
})(PrivilegePageRoleWise));