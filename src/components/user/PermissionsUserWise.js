import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import { connect } from "react-redux";
import { Loader } from "../common/Loader";
import { required, alphabetsOnlyForName, number } from "../../helper/validation";
import { renderText, searchableSelect, renderSelectField } from "../layout/FormInputs";
import {
    getAllUserAPI, rolesSelectList, getModuleSelectList, getRolePermissionByUser,
    setUserAdditionalPermission,
} from "../../actions/auth/AuthActions";
import { MESSAGES } from "../../config/message";
import { reactLocalStorage } from "reactjs-localstorage";
import { Redirect } from 'react-router-dom';
import { toastr } from "react-redux-toastr";
import { Collapse, Button, CardBody, Card, CardTitle } from 'reactstrap';
import { EAccessType } from "../../config/masterData";

class PermissionsUserWise extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoader: false,
            isSubmitted: false,
            isEditFlag: false,
            isOpen: false,
            user: [],
            role: [],
            roleId: '',
            selectedModules: [],
            permissions: [],
            checkedAll: false,
        };
    }

    /**
    * @method componentDidMount
    * @description used to called after mounting component
    */
    componentDidMount() {
        const { permissions, selectedModules } = this.state;
        this.props.getAllUserAPI(() => { })
        this.props.rolesSelectList(() => { })
        this.props.getModuleSelectList(() => {
            selectedModules.map((item, index) => {
                permissions.push(item.Value)
            })
            this.setState({ permissions })
        })
    }

    /**
    * @method renderTypeOfListing
    * @description Used show select listings
    */
    renderTypeOfListing = (label) => {
        const { userList, roleSelectList } = this.props;
        const temp = [];

        if (label === 'user') {
            userList && userList.map(item => {
                if (item.Value == 0) return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

    }

    /**
    * @method renderSelectedModule
    * @description used to render selected module for roles permission
    */
    renderSelectedModule = () => {
        const { selectedModules } = this.state;

        return selectedModules && selectedModules.map((item, index) => {
            return (
                <div key={index} className={'col-md-4 additional'}>
                    <label
                        className="custom-checkbox"
                    >
                        {item.Text}
                        <input type="checkbox" disabled={true} value={item.Value} checked={true} />
                        <span
                            className=" before-box"
                            checked={true}
                        />
                    </label>
                </div>
            )
        })
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
    * @method renderAdditionalModule
    * @description used to render additional module checkbox for permission
    */
    renderAdditionalModule = () => {
        const { moduleSelectList } = this.props;
        const { selectedModules } = this.state;

        return moduleSelectList && moduleSelectList.map((item, index) => {
            if (item.Value == 0) return false;
            return (
                <div key={index} className={'col-md-3 additional'}>
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
    * @method handleUser
    * @description Used to handle user
    */
    handleUser = (newValue, actionMeta) => {
        if (newValue && newValue != null) {
            this.setState({ user: newValue }, () => {
                this.getRolePermission()
            });
        } else {
            this.props.change('Role', '');
            this.setState({
                user: [],
                permissions: [],
                selectedModules: []
            });
        }
    };

    /**
    * @method getRolePermission
    * @description Used to handle response of getRolePermissionByUser, called when user change
    */
    getRolePermission = () => {
        const { user, permissions } = this.state;
        this.props.getRolePermissionByUser(user.value, (res) => {
            if (res && res.data && res.data.Data) {
                let Data = res.data.Data;
                let ModulePermissions = Data.RoleInfo.ModulePermissions;

                ModulePermissions && ModulePermissions.map((item, i) => {
                    permissions.push(item.Value)
                })

                this.props.change('Role', Data.RoleInfo.RoleName);
                this.setState({
                    selectedModules: ModulePermissions,
                    permissions,
                    roleId: Data.RoleInfo.RoleId,
                })
            }
        })
    }

    /**
    * @method addPermission
    * @description used to add more permission for user
    */
    addPermission = () => {
        this.setState({ isOpen: !this.state.isOpen })
    }

    /**
    * @method cancel
    * @description used to cancel privilege edit
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.setState({
            user: [],
            permissions: [],
            selectedModules: []
        });
    }

    /**
     * @name onSubmit
     * @param values
     * @desc Submit the signup form values.
     * @returns {{}}
     */
    onSubmit(values) {
        const { reset } = this.props;
        const { user, roleId, selectedModules, permissions } = this.state;

        this.setState({ isLoader: true })

        //Permission that alloted while role creation.
        let DefaultModuleIds = [];
        selectedModules && selectedModules.map((item, index) => {
            DefaultModuleIds.push(item.Value)
        })

        //Permission that has been removed from default permissions(Default modules)
        let difference = DefaultModuleIds.filter(x => !permissions.includes(x));
        let formData = {
            UserId: user.value,
            RoleId: roleId,
            DefaultModuleIds: DefaultModuleIds,
            AdditionalModuleIds: permissions,
            RemovedModuleIds: difference
        }

        this.props.setUserAdditionalPermission(formData, (res) => {
            if (res && res.data && res.data.Result) {
                toastr.success(MESSAGES.ADDITIONAL_PERMISSION_ADDED_SUCCESSFULLY)
            }
            reset();
            this.setState({
                isLoader: false,
                selectedModules: [],
                permissions: [],
                user: [],
            })
        })
    }


    render() {
        const { handleSubmit, pristine, reset, submitting } = this.props;
        const { isLoader, isSubmitted, isOpen } = this.state;

        return (
            <div>
                {isLoader && <Loader />}
                <div className="login-container permission  signup-form">
                    <div className="shadow-lg privilege-form login-form">
                        <div className="form-heading">
                            <h2>
                                User Wise Permissions
                            </h2>
                        </div>
                        <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                            <div className=" row form-group">
                                <div className="col-md-3 input-withouticon" >
                                    <Field
                                        label="User Id"
                                        name="UserId"
                                        type="text"
                                        placeholder={'Select user'}
                                        options={this.renderTypeOfListing('user')}
                                        //onKeyUp={(e) => this.changeItemDesc(e)}
                                        //validate={[required]}
                                        //required={true}
                                        component={searchableSelect}
                                        handleChangeDescription={this.handleUser}
                                        valueDescription={this.state.user}
                                    />
                                </div>
                                <div className="col-md-3 input-withouticon " >
                                    <Field
                                        label="Role"
                                        name={"Role"}
                                        type="text"
                                        placeholder={''}
                                        customClassName={'withoutBorderBottom'}
                                        validate={[required]}
                                        component={renderText}
                                        required={true}
                                        maxLength={26}
                                        disabled={true}
                                    />
                                </div>
                                <div className="col-md-6 input-withouticon" >
                                    <label>Permission's</label>
                                    {this.renderSelectedModule()}
                                    {this.state.selectedModules.length == 0 ? <b>{"Permission's Not allowed yet"}</b> : ''}
                                </div>
                            </div>
                            <div className=" row form-group">
                                <div className="col-md-3 input-withouticon" >
                                    <button
                                        type="button"
                                        className={'btn btn-secondary'}
                                        onClick={this.addPermission}>Add More Permissions</button>
                                </div>
                            </div>
                            <div className=" row form-group">
                                <div className="col-md-12 input-withouticon" >
                                    <Collapse isOpen={isOpen}>
                                        <Card>
                                            <CardBody>
                                                <CardTitle>Select Permission</CardTitle>
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
                                                {this.renderAdditionalModule()}
                                            </CardBody>
                                        </Card>
                                    </Collapse>
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
            </div >
        );
    }
}


/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
const mapStateToProps = ({ auth }) => {
    const { userList, roleSelectList, moduleSelectList } = auth;

    return { userList, roleSelectList, moduleSelectList };
};

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getAllUserAPI,
    rolesSelectList,
    getModuleSelectList,
    getRolePermissionByUser,
    setUserAdditionalPermission,
})(reduxForm({
    form: 'PermissionsUserWise',
    enableReinitialize: true,
})(PermissionsUserWise));