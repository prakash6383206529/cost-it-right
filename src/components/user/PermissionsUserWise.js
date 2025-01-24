import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import { connect } from "react-redux";
import { Loader } from "../common/Loader";
import { required } from "../../helper/validation";
import { renderText, searchableSelect, validateForm } from "../layout/FormInputs";
import {
    getAllUserAPI, rolesSelectList, getModuleSelectList, getRolePermissionByUser, getPermissionByUser,
    setUserAdditionalPermission, getActionHeadsSelectList, revertDefaultPermission,
} from "../../actions/auth/AuthActions";
import { MESSAGES } from "../../config/message";
import Toaster from "../common/Toaster";
import { Table } from 'reactstrap';
import NoContentFound from '../common/NoContentFound';
import { EMPTY_DATA } from '../../config/constants';
import { loggedInUserId } from "../../helper";

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

            actionData: {},
            Modules: [],
            DefaultModuleIds: [],
            moduleCheckedAll: [],
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
        this.props.getActionHeadsSelectList(() => { })
        this.props.getModuleSelectList(() => {
            selectedModules.map((item, index) => {
                permissions.push(item.Value)
                return null
            })
            this.setState({ permissions })
        })
    }

    /**
    * @method renderTypeOfListing
    * @description Used show select listings
    */
    renderTypeOfListing = (label) => {
        const { userList } = this.props;
        const temp = [];

        if (label === 'user') {
            userList && userList.map(item => {
                if (item.Value === 0) return false;
                temp.push({ label: item.Text, value: item.Value })
                return null
            });
            return temp;
        }
    }

    /**
    * @method renderSelectedModule
    * @description used to render selected module for roles permission
    */
    // renderSelectedModule = () => {
    //     const { selectedModules } = this.state;

    //     return selectedModules && selectedModules.map((item, index) => {
    //         return (
    //             <div key={index} className={'col-md-4 additional'}>
    //                 <label
    //                     className="custom-checkbox"
    //                 >
    //                     {item.Text}
    //                     <input type="checkbox" disabled={true} value={item.Value} checked={true} />
    //                     <span
    //                         className=" before-box"
    //                         checked={true}
    //                     />
    //                 </label>
    //             </div>
    //         )
    //     })
    // }

    /**
    * @method moduleHandler
    * @description used to select permission's
    */
    // moduleHandler = (ID) => {
    //     const { permissions } = this.state;
    //     let newArray = [];
    //     if (permissions.includes(ID)) {
    //         const index = permissions.indexOf(ID);
    //         if (index > -1) {
    //             permissions.splice(index, 1);
    //         }
    //         newArray = [...new Set(permissions)]
    //     } else {
    //         permissions.push(ID)
    //         newArray = [...new Set(permissions)]
    //     }
    //     this.setState({ permissions: newArray }, () => {
    //         this.setState({ checkedAll: this.isCheckAll() })
    //     })
    // }

    /**
    * @method selectAllHandler
    * @description used to select permission's
    */
    // selectAllHandler = () => {
    //     const { permissions, checkedAll } = this.state;
    //     const { moduleSelectList } = this.props;
    //     let tempArray = [];
    //     let tempObj = {}
    //     if (checkedAll) {
    //         this.setState({ permissions: tempArray, checkedAll: false }, () => {  })
    //     } else {
    //         moduleSelectList && moduleSelectList.map((item, index) => {
    //             if (item.Value == 0) return false;
    //             return tempArray.push(item.Value)
    //         })
    //         this.setState({ permissions: tempArray, checkedAll: true }, () => {  })
    //     }
    // }

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
    // isCheckAll = () => {
    //     const { permissions } = this.state;
    //     const { moduleSelectList } = this.props;
    //     if (moduleSelectList && moduleSelectList != undefined) {
    //         return moduleSelectList.length - 1 == permissions.length ? true : false;
    //     }
    // }

    /**
    * @method renderAdditionalModule
    * @description used to render additional module checkbox for permission
    */
    // renderAdditionalModule = () => {
    //     const { moduleSelectList } = this.props;
    //     const { selectedModules } = this.state;

    //     return moduleSelectList && moduleSelectList.map((item, index) => {
    //         if (item.Value == 0) return false;
    //         return (
    //             <div key={index} className={'col-md-3 additional'}>
    //                 <label
    //                     className="custom-checkbox"
    //                     onChange={() => this.moduleHandler(item.Value)}
    //                 >
    //                     {item.Text}
    //                     <input type="checkbox" value={item.Value} checked={this.isSelected(item.Value)} />
    //                     <span
    //                         className=" before-box"
    //                         checked={this.isSelected(item.Value)}
    //                         onChange={() => this.moduleHandler(item.Value)}
    //                     />
    //                 </label>
    //             </div>
    //         )
    //     })
    // }

    /**
    * @method handleUser
    * @description Used to handle user
    */
    // handleUser = (newValue, actionMeta) => {
    //     if (newValue && newValue != null) {
    //         this.setState({ user: newValue, permissions: [] }, () => {
    //             this.getRolePermission()
    //         });
    //     } else {
    //         this.props.change('Role', '');
    //         this.setState({
    //             user: [],
    //             permissions: [],
    //             selectedModules: []
    //         });
    //     }
    // };

    /**
    * @method getRolePermission
    * @description Used to handle response of getRolePermissionByUser, called when user change
    */
    // getRolePermission = () => {
    //     const { user, permissions } = this.state;
    //     this.props.getRolePermissionByUser(user.value, (res) => {
    //         if (res && res.data && res.data.Data) {
    //             let Data = res.data.Data;
    //             let ModulePermissions = Data.RoleInfo.ModulePermissions;

    //             ModulePermissions && ModulePermissions.map((item, i) => {
    //                 permissions.push(item.Value)
    //             })

    //             this.props.change('Role', Data.RoleInfo.RoleName);
    //             this.setState({
    //                 selectedModules: ModulePermissions,
    //                 permissions,
    //                 roleId: Data.RoleInfo.RoleId,
    //             })
    //         }
    //     })
    // }

    /**
    * @method addPermission
    * @description used to add more permission for user
    */
    addPermission = () => {
        this.setState({ isOpen: !this.state.isOpen })
    }


















    // //////////////////////////////////////////////////////////////////////////////
    /**
    * @method isCheckModuleAll
    * @description used to check Module checkbox, if select all and actions checked
    */
    isCheckModuleAll = (parentIndex, parentIsChecked, actionData) => {
        const { actionSelectList } = this.props;

        let tempArray = actionData.filter(item => item.IsChecked === true)
        if (actionData && actionData !== undefined) {
            return tempArray.length === actionSelectList.length - 1 ? true : false;
        }
    }

    /**
    * @method renderActionHeads
    * @description used to add more permission for user
    */
    renderActionHeads = (actionHeads) => {
        return actionHeads && actionHeads.map((item, index) => {
            if (item.Value === 0) return false;
            return (
                <th >{item.Text}</th>
            )
        })
    }

    /**
    * @method renderAction
    * @description used to render row of actions
    */
    renderAction = (actions, parentIndex) => {
        const { actionSelectList } = this.props;

        return actionSelectList && actionSelectList.map((el, i) => {
            return actions && actions.map((item, index) => {
                if (el.Text !== item.ActionName) return false;
                return (
                    <td key={index}>
                        {<input
                            type="checkbox"
                            value={item.ActionId}
                            onChange={() => this.actionCheckHandler(parentIndex, index)}
                            checked={item.IsChecked}
                        />}
                    </td>
                )
            })
        })
    }

    /**
    * @method actionCheckHandler
    * @description Used to check/uncheck action's checkbox
    */
    actionCheckHandler = (parentIndex, childIndex) => {
        const { Modules } = this.state;

        let actionRow = (Modules && Modules !== undefined) ? Modules[parentIndex].Actions : [];
        let actionArray = actionRow && actionRow.map((el, index) => {
            if (childIndex === index) {
                el.IsChecked = !el.IsChecked
            }
            return el;
        })
        let tempArray = Object.assign([...Modules], { [parentIndex]: Object.assign({}, Modules[parentIndex], { Actions: actionArray }) })
        this.setState({ Modules: tempArray })
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
                actionData: {},
                Modules: [],
                DefaultModuleIds: [],
                roleId: '',
            })
        }
    };

    getRolePermission = () => {
        const loggedInUser = { loggedInUserId: loggedInUserId() }
        this.props.getPermissionByUser(loggedInUser, (res) => {
            if (res && res.data && res.data.Data) {

                let Data = res.data.Data;
                let Modules = Data.Modules;
                //let DefaultModuleIds = res.data.Data.DefaultModuleIds;

                let moduleCheckedArray = [];
                Modules && Modules.map((el, i) => {
                    let tempObj = {
                        ModuleName: el.ModuleName,
                        IsChecked: el.IsChecked,
                        ModuleId: el.ModuleId,
                    }
                    moduleCheckedArray.push(tempObj)
                    return null
                })
                this.props.change('Role', Data.RoleName);
                this.props.change('Description', Data.Description);

                this.setState({
                    actionData: Data,
                    Modules: Modules,
                    //DefaultModuleIds: DefaultModuleIds,
                    roleId: Data.RoleId,
                    moduleCheckedAll: moduleCheckedArray,
                })
            }
        })
    }

    /**
    * @method renderSelectedModule
    * @description used to render selected module for roles permission
    */
    renderSelectedModule = () => {
        const { DefaultModuleIds } = this.state;
        const { moduleSelectList } = this.props;

        return moduleSelectList && moduleSelectList.map((item, index) => {
            if (DefaultModuleIds.includes(item.Value) === false) return false;
            return (
                <div key={index} className={'col-md-2 additional'}>
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
    * @description used to checked module
    */
    moduleHandler = (index) => {
        //alert('hi')
        const { Modules } = this.state;
        const isModuleChecked = Modules[index].IsChecked;

        let actionArray = [];
        let tempArray = [];

        let actionRow = (Modules && Modules !== undefined) ? Modules[index].Actions : [];
        if (isModuleChecked) {
            actionArray = actionRow && actionRow.map((item, index) => {
                item.IsChecked = false;
                return item;
            })

            tempArray = Object.assign([...Modules], { [index]: Object.assign({}, Modules[index], { IsChecked: false, Actions: actionArray }) })

            this.setState({ Modules: tempArray, checkedAll: false })
        } else {
            actionArray = actionRow && actionRow.map((item, index) => {
                item.IsChecked = true;
                return item;
            })

            tempArray = Object.assign([...Modules], { [index]: Object.assign({}, Modules[index], { IsChecked: true, Actions: actionArray }) })

            this.setState({ Modules: tempArray, checkedAll: true })
        }
    }

    /**
    * @method isCheckAll
    * @description used to select module's action row (Horizontally)
    */
    isCheckAll = (parentIndex, actionData) => {
        const { actionSelectList } = this.props;

        //let actionRow = (Modules && Modules != undefined) ? Modules[parentIndex].Actions : [];

        let tempArray = actionData.filter(item => item.IsChecked === true)
        if (actionData && actionData !== undefined) {
            return tempArray.length === actionSelectList.length - 1 ? true : false;
        }
    }

    selectAllHandler = (parentIndex, actionRows) => {
        const { Modules } = this.state;
        const { actionSelectList } = this.props;

        //let actionRows = (Modules && Modules != undefined) ? Modules[parentIndex].Actions : [];
        let checkedActions = actionRows.filter(item => item.IsChecked === true)

        let tempArray = [];
        let isCheckedSelectAll = (checkedActions.length === actionSelectList.length - 1) ? true : false;

        if (isCheckedSelectAll) {
            let actionArray = actionRows && actionRows.map((item, index) => {
                item.IsChecked = false;
                return item;
            })
            tempArray = Object.assign([...Modules], { [parentIndex]: Object.assign({}, Modules[parentIndex], { Actions: actionArray }) })
            this.setState({
                Modules: tempArray,
                checkedAll: false,
            })
        } else {
            let actionArray = actionRows && actionRows.map((item, index) => {
                item.IsChecked = true;
                return item;
            })
            tempArray = Object.assign([...Modules], { [parentIndex]: Object.assign({}, Modules[parentIndex], { Actions: actionArray }) })
            this.setState({
                Modules: tempArray,
                checkedAll: true
            })
        }
    }

    /**
    * @method cancel
    * @description used to cancel privilege edit
    */
    revertPermission = () => {
        const { user } = this.state;
        const { reset } = this.props;
        this.props.revertDefaultPermission(user.value, (res) => {
            reset();
            this.setState({
                user: [],
                Modules: [],
                DefaultModuleIds: []
            });
        })
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
            Modules: [],
            DefaultModuleIds: []
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
        const { user, Modules } = this.state;

        this.setState({ isLoader: true })

        //DefaultIds that alloted while role creation.
        // let DefaultIds = [];
        // DefaultModuleIds && DefaultModuleIds.map((item, index) => {
        //     DefaultIds.push(item.Value)
        // })

        // let checkedModuleIds = [];
        // Modules && Modules.map((el) => {
        //     if (el.IsChecked) {
        //         checkedModuleIds.push(el.ModuleId)
        //     }
        // })

        //Additonal module that has been added apart from default privilege(Modules)
        //let Additonal = checkedModuleIds.filter(x => !DefaultModuleIds.includes(x));

        //Modules that has been removed from default modules.
        //let difference = DefaultModuleIds.filter(x => !checkedModuleIds.includes(x));

        let formData = {
            UserId: user.value,
            //RoleId: roleId,
            //DefaultModuleIds: DefaultModuleIds,
            //AdditionalModuleIds: Additonal,
            //RemovedModuleIds: difference,
            Modules: Modules,
        }

        this.props.setUserAdditionalPermission(formData, (res) => {
            if (res && res.data && res.data.Result) {
                Toaster.success(MESSAGES.ADDITIONAL_PERMISSION_ADDED_SUCCESSFULLY)
            }
            reset();
            this.setState({
                isLoader: false,
                DefaultModuleIds: [],
                Modules: [],
                user: [],
            })
        })
    }


    render() {
        const { handleSubmit, pristine, submitting, actionSelectList } = this.props;
        const { isLoader, isSubmitted } = this.state;

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
                                <div className="col-md-6 input-withouticon" >
                                    <Field
                                        label="User Name"
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
                                        placeholder={'Enter'}
                                        customClassName={'withoutBorderBottom'}
                                        validate={[required]}
                                        component={renderText}
                                        required={true}
                                        maxLength={100}
                                        disabled={true}
                                    />
                                </div>
                                {/* <div className="col-md-3 input-withouticon " >
                                    <Field
                                        label="Description"
                                        name={"Description"}
                                        type="text"
                                        placeholder={''}
                                        customClassName={'withoutBorderBottom'}
                                        validate={[required]}
                                        component={renderText}
                                        required={true}
                                        maxLength={100}
                                        disabled={true}
                                    />
                                </div> */}

                            </div>
                            {/* <div className=" row form-group">
                                <div className="col-md-12 input-withouticon" >
                                    <label>Default Permission's</label>
                                    {this.renderSelectedModule()}
                                    {this.state.DefaultModuleIds.length == 0 ? <b>{"Permission's Not allowed yet"}</b> : ''}
                                </div>
                            </div> */}
                            {/* <div className=" row form-group">
                                <div className="col-md-3 input-withouticon" >
                                    <button
                                        type="button"
                                        className={'btn btn-secondary'}
                                        onClick={this.addPermission}>Add More Permissions</button>
                                </div>
                            </div> */}

                            {/* <div className=" row form-group">
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
                            </div> */}


                            <Table className="table table-striped switch-table" size="sm" bordered dark striped >
                                <thead>
                                    <tr>
                                        <th>{`Module Name`}</th>
                                        <th>{`Select All`}</th>
                                        {this.renderActionHeads(actionSelectList)}
                                    </tr>
                                </thead>
                                <tbody >
                                    {this.state.Modules && this.state.Modules.map((item, index) => {
                                        return (
                                            <tr key={index}>

                                                <td >{
                                                    <label
                                                        className="custom-checkbox"
                                                        onChange={() => this.moduleHandler(index)}
                                                    >
                                                        {item.ModuleName}
                                                        <input type="checkbox" value={'All'} checked={item.IsChecked} />
                                                        <span
                                                            className=" before-box"
                                                            checked={item.IsChecked}
                                                            onChange={() => this.moduleHandler(index)}
                                                        />
                                                    </label>
                                                }
                                                </td>

                                                <td >{<input
                                                    type="checkbox"
                                                    value={'All'}
                                                    checked={this.isCheckAll(index, item.Actions)}
                                                    onClick={() => this.selectAllHandler(index, item.Actions)} />}
                                                </td>

                                                {this.renderAction(item.Actions, index)}
                                            </tr>
                                        )
                                    })}
                                    {this.state.Modules.length === 0 && <NoContentFound title={EMPTY_DATA} />}
                                </tbody>
                            </Table>

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
                                {/* <input
                                    disabled={pristine || submitting}
                                    onClick={this.revertPermission}
                                    type="button"
                                    value="Revert Permission"
                                    className="btn  login-btn w-10 dark-pinkbtn"
                                /> */}
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
    const { userList, roleSelectList, moduleSelectList, actionSelectList } = auth;

    return { userList, roleSelectList, moduleSelectList, actionSelectList };
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
    getPermissionByUser,
    setUserAdditionalPermission,
    getActionHeadsSelectList,
    revertDefaultPermission,
})(reduxForm({
    form: 'PermissionsUserWise',
    validate: validateForm,
    enableReinitialize: true,
    touchOnChange: true
})(PermissionsUserWise));