import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import { langs } from "../../config/localization";
import { toastr } from "react-redux-toastr";
import { connect } from "react-redux";
import { Loader } from "../common/Loader";
import { required, alphabetsOnlyForName, number } from "../../helper/validation";
import { renderText } from "../layout/FormInputs";
import "./UserRegistration.scss";
import { addRoleAPI, getAllRoleAPI, getRoleDataAPI, updateRoleAPI, getModuleSelectList } from "../../actions/auth/AuthActions";
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
            permissions: [],
            checkedAll: false,
            RoleId: '',
        };
    }

    /**
    * @method componentDidMount
    * @description used to called after mounting component
    */
    componentDidMount() {
        this.props.getModuleSelectList(() => { })
    }

    /**
    * @method getRoleDetail
    * @description used to get role detail
    */
    getRoleDetail = (data) => {
        if (data && data.isEditFlag) {
            this.props.getRoleDataAPI(data.RoleId, (res) => {
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data;
                    this.setState({
                        isEditFlag: true,
                        RoleId: data.RoleId,
                        permissions: Data.ModuleIds,
                    })
                }
            })
        }
    }

    /**
    * @method moduleHandler
    * @description used to select permission's
    */
    moduleHandler = (ID) => {
        const { permissions } = this.state;
        let newArray = [];
        if (permissions.includes(ID)) {
            const index = permissions.indexOf(ID);
            if (index > -1) {
                permissions.splice(index, 1);
            }
            newArray = [...new Set(permissions)]
        } else {
            permissions.push(ID)
            newArray = [...new Set(permissions)]
        }
        this.setState({ permissions: newArray }, () => {
            this.setState({ checkedAll: this.isCheckAll() })
        })
    }

    /**
    * @method selectAllHandler
    * @description used to select permission's
    */
    selectAllHandler = () => {
        const { permissions, checkedAll } = this.state;
        const { moduleSelectList } = this.props;
        let tempArray = [];
        let tempObj = {}
        if (checkedAll) {
            this.setState({ permissions: tempArray, checkedAll: false }, () => { console.log('All', this.state.permissions) })
        } else {
            moduleSelectList && moduleSelectList.map((item, index) => {
                if (item.Value == 0) return false;
                return tempArray.push(item.Value)
            })
            this.setState({ permissions: tempArray, checkedAll: true }, () => { console.log('All', this.state.permissions) })
        }

    }

    /**
    * @method isSelected
    * @description used to select permission's
    */
    isSelected = ID => {
        const { permissions } = this.state;
        return permissions.includes(ID);
    }

    /**
    * @method isCheckAll
    * @description used to select permission's
    */
    isCheckAll = () => {
        const { permissions } = this.state;
        const { moduleSelectList } = this.props;
        if (moduleSelectList && moduleSelectList != undefined) {
            return moduleSelectList.length - 1 == permissions.length ? true : false;
        }
    }

    /**
    * @method renderModule
    * @description used to render module checkbox for roles permission
    */
    renderModule = () => {
        const { moduleSelectList } = this.props;

        return moduleSelectList && moduleSelectList.map((item, index) => {
            if (item.Value == 0) return false;
            return (
                <div>
                    <label
                        className="custom-checkbox"
                        onChange={() => this.moduleHandler(item.Value)}
                    >
                        {item.Text}
                        <input type="checkbox" value={item.Value} checked={this.isSelected(item.Value)} />
                        <span
                            className=" before-box"
                            checked={this.isSelected(item.Value)}
                            onChange={() => this.moduleHandler(item.Value)}
                        />
                    </label>
                </div>
            )
        })
    }

    /**
    * @method cancel
    * @description used to cancel role edit
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.setState({ isEditFlag: false, permissions: [] })
    }

    /**
     * @name onSubmit
     * @param values
     * @desc Submit the signup form values.
     * @returns {{}}
     */
    onSubmit(values) {
        const { isEditFlag, permissions, RoleId } = this.state;
        const { reset } = this.props;
        this.setState({ isLoader: true })

        values.ModuleIds = permissions;

        if (isEditFlag) {
            // Update existing role

            let formData = {
                RoleId: RoleId,
                IsActive: true,
                CreatedDate: '',
                RoleName: values.RoleName,
                Description: values.Description,
                ModuleIds: this.state.permissions,
            }
            reset();
            this.props.updateRoleAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_ROLE_SUCCESSFULLY)
                }
                //this.props.change('RoleName', '');
                //this.props.change('Description', '');
                this.setState({ isLoader: false, isEditFlag: false, permissions: [] })
                this.props.getAllRoleAPI(res => { })
            })
        } else {
            // Add new role
            this.props.addRoleAPI(values, (res) => {
                if (res && res.data && res.data.Result) {
                    toastr.success(MESSAGES.ADD_ROLE_SUCCESSFULLY)
                }
                reset();
                this.props.getAllRoleAPI(res => { })
                this.setState({ isLoader: false, permissions: [] })
            })
        }

    }


    render() {
        const { handleSubmit, pristine, reset, submitting, moduleSelectList } = this.props;
        const { isLoader, isSubmitted, permissions, isEditFlag } = this.state;

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
                                <div className="input-group col-md-3 input-withouticon" >
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
                                <div className="input-group  col-md-3 input-withouticon">
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
                                <div className="input-group  col-md-6 input-withouticon">
                                    <label>Select Permission</label>
                                    <label
                                        className="custom-checkbox"
                                        onChange={this.selectAllHandler}
                                    >
                                        {'Select All'}
                                        <input type="checkbox" value={'All'} checked={this.isCheckAll()} />
                                        <span
                                            className=" before-box"
                                            checked={this.isCheckAll()}
                                            onChange={this.selectAllHandler}
                                        />
                                    </label>
                                    {this.renderModule()}
                                </div>

                            </div>

                            <div className="text-center ">
                                <input
                                    disabled={isSubmitted ? true : false}
                                    type="submit"
                                    value={isEditFlag ? 'Update' : 'Save'}
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
    const { roleList, roleDetail, moduleSelectList } = auth;
    let initialValues = {};

    if (roleDetail && roleDetail != undefined) {
        initialValues = {
            RoleName: roleDetail.RoleName,
            Description: roleDetail.Description,
        }
    }

    return { roleList, initialValues, moduleSelectList };
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
    getModuleSelectList,
})(reduxForm({
    form: 'Role',
    enableReinitialize: true,
})(Role));