import React, { Component } from "react";
import { Field, reduxForm } from "redux-form";
import { toastr } from "react-redux-toastr";
import { connect } from "react-redux";
import { Loader } from "../common/Loader";
import { required, alphabetsOnlyForName, number } from "../../helper/validation";
import { renderText } from "../layout/FormInputs";
import "./UserRegistration.scss";
import {
    addRoleAPI, getAllRoleAPI, getRoleDataAPI, updateRoleAPI, setEmptyRoleDataAPI,
    getModuleSelectList, getActionHeadsSelectList, getModuleActionInit,
} from "../../actions/auth/AuthActions";
import { MESSAGES } from "../../config/message";
import RolesListing from './RolesListing';
import { Table } from 'reactstrap';
import NoContentFound from "../common/NoContentFound";
import { CONSTANT } from "../../helper/AllConastant";
import { userDetails, loggedInUserId } from "../../helper/auth";

class Role extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            isLoader: false,
            isSubmitted: false,
            isEditFlag: false,
            permissions: [],
            checkedAll: false,
            RoleId: '',
            Modules: [],
        };
    }

    /**
    * @method componentDidMount
    * @description used to called after mounting component
    */
    componentDidMount() {
        this.props.getActionHeadsSelectList(() => {
            this.getRolePermission()
        })
        this.props.getModuleSelectList(() => { })

    }

    getRolePermission = () => {
        this.setState({ isLoader: true });
        this.props.getModuleActionInit((res) => {
            if (res && res.data && res.data.Data) {

                let Data = res.data.Data;
                let Modules = res.data.Data;

                let moduleCheckedArray = [];
                Modules && Modules.map((el, i) => {
                    let tempObj = {
                        ModuleName: el.ModuleName,
                        IsChecked: el.IsChecked,
                        ModuleId: el.ModuleId,
                    }
                    moduleCheckedArray.push(tempObj)
                })

                this.setState({
                    actionData: Data,
                    Modules: Modules,
                    moduleCheckedAll: moduleCheckedArray,
                    isLoader: false,
                })
            }
        })
    }

    /**
    * @method getRoleDetail
    * @description used to get role detail
    */
    getRoleDetail = (data) => {
        if (data && data.isEditFlag) {
            this.setState({ isLoader: true })
            this.props.getRoleDataAPI(data.RoleId, (res) => {
                if (res && res.data && res.data.Data) {
                    let Data = res.data.Data;
                    let Modules = Data.Modules;

                    let moduleCheckedArray = [];
                    Modules && Modules.map((el, i) => {
                        let tempObj = {
                            ModuleName: el.ModuleName,
                            IsChecked: el.IsChecked,
                            ModuleId: el.ModuleId,
                        }
                        moduleCheckedArray.push(tempObj)
                    })

                    this.setState({
                        isEditFlag: true,
                        RoleId: data.RoleId,
                        Modules: Modules,
                        moduleCheckedAll: moduleCheckedArray,
                        isLoader: false,
                        isShowForm: true,
                    })
                    if (Modules.length == 0) this.getRolePermission();
                }
            })
        }
    }

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
    //         this.setState({ permissions: tempArray, checkedAll: false }, () => { console.log('All', this.state.permissions) })
    //     } else {
    //         moduleSelectList && moduleSelectList.map((item, index) => {
    //             if (item.Value == 0) return false;
    //             return tempArray.push(item.Value)
    //         })
    //         this.setState({ permissions: tempArray, checkedAll: true }, () => { console.log('All', this.state.permissions) })
    //     }

    // }

    /**
    * @method isSelected
    * @description used to select permission's
    */
    // isSelected = ID => {
    //     const { permissions } = this.state;
    //     return permissions.includes(ID);
    // }

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
    * @method renderModule
    * @description used to render module checkbox for roles permission
    */
    // renderModule = () => {
    //     const { moduleSelectList } = this.props;

    //     return moduleSelectList && moduleSelectList.map((item, index) => {
    //         if (item.Value == 0) return false;
    //         return (
    //             <div>
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











    //Below code for Table rendering...... 

    /**
    * @method renderActionHeads
    * @description used to add more permission for user
    */
    renderActionHeads = (actionHeads) => {
        return actionHeads && actionHeads.map((item, index) => {
            if (item.Value == 0) return false;
            return (
                <th >{item.Text}</th>
            )
        })
    }

    /**
    * @method moduleHandler
    * @description used to checked module
    */
    moduleHandler = (index) => {
        //alert('hi')
        const { Modules, checkedAll } = this.state;
        const isModuleChecked = Modules[index].IsChecked;

        let actionArray = [];
        let tempArray = [];

        let actionRow = (Modules && Modules != undefined) ? Modules[index].Actions : [];
        if (isModuleChecked) {
            actionArray = actionRow && actionRow.map((item, index) => {
                item.IsChecked = false;
                return item;
            })

            tempArray = Object.assign([...Modules], { [index]: Object.assign({}, Modules[index], { IsChecked: false, Actions: actionArray }) })

            this.setState({ Modules: tempArray })
        } else {
            actionArray = actionRow && actionRow.map((item, index) => {
                item.IsChecked = true;
                return item;
            })

            tempArray = Object.assign([...Modules], { [index]: Object.assign({}, Modules[index], { IsChecked: true, Actions: actionArray }) })

            this.setState({ Modules: tempArray })
        }
    }

    /**
    * @method isCheckAll
    * @description used to select module's action row (Horizontally)
    */
    isCheckAll = (parentIndex, actionData) => {
        const { actionSelectList } = this.props;

        let tempArray = actionData.filter(item => item.IsChecked == true)
        if (actionData && actionData != undefined) {
            return tempArray.length == actionSelectList.length - 1 ? true : false;
        }
    }

    selectAllHandler = (parentIndex, actionRows) => {
        const { Modules } = this.state;
        const { actionSelectList } = this.props;

        let checkedActions = actionRows.filter(item => item.IsChecked == true)

        let tempArray = [];
        let isCheckedSelectAll = (checkedActions.length == actionSelectList.length - 1) ? true : false;

        if (isCheckedSelectAll) {
            let actionArray = actionRows && actionRows.map((item, index) => {
                item.IsChecked = false;
                return item;
            })
            tempArray = Object.assign([...Modules], { [parentIndex]: Object.assign({}, Modules[parentIndex], { IsChecked: false, Actions: actionArray }) })
            this.setState({
                Modules: tempArray,
                //checkedAll: false,
            })
        } else {
            let actionArray = actionRows && actionRows.map((item, index) => {
                item.IsChecked = true;
                return item;
            })
            tempArray = Object.assign([...Modules], { [parentIndex]: Object.assign({}, Modules[parentIndex], { IsChecked: true, Actions: actionArray }) })
            this.setState({
                Modules: tempArray,
                //checkedAll: true
            })
        }
    }

    /**
    * @method renderAction
    * @description used to render row of actions
    */
    renderAction = (actions, parentIndex) => {
        const { actionSelectList } = this.props;

        return actionSelectList && actionSelectList.map((el, i) => {
            return actions && actions.map((item, index) => {
                if (el.Text != item.ActionName) return false;
                return (
                    <td>
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

        let checkedActions = Modules[parentIndex].Actions.filter(item => item.IsChecked == true)

        let isCheckedSelectAll = (checkedActions.length - 1 != 0) ? true : false;

        let actionRow = (Modules && Modules != undefined) ? Modules[parentIndex].Actions : [];
        let actionArray = actionRow && actionRow.map((el, index) => {
            if (childIndex == index) {
                el.IsChecked = !el.IsChecked
            }
            return el;
        })
        let tempArray = Object.assign([...Modules], { [parentIndex]: Object.assign({}, Modules[parentIndex], { IsChecked: isCheckedSelectAll, Actions: actionArray }) })
        this.setState({ Modules: tempArray })
    }

    /**
    * @method cancel
    * @description used to cancel role edit
    */
    cancel = () => {
        const { reset } = this.props;
        reset();
        this.props.setEmptyRoleDataAPI('', () => { })
        this.setState({
            isEditFlag: false,
            Modules: [],
            RoleId: '',
        })
        this.getRolePermission()
    }

    /**
     * @name onSubmit
     * @param values
     * @desc Submit the signup form values.
     * @returns {{}}
     */
    onSubmit(values) {
        const { isEditFlag, Modules, RoleId } = this.state;
        const { reset } = this.props;

        //Validation for atleast 1 permission should be allowed for role, 
        //Should not be empty
        const checkedModules = Modules.filter(item => item.IsChecked == true)
        if (checkedModules.length == 0) {
            toastr.warning(MESSAGES.DEPARTMENT_EMPTY_ALERT)
            return false;
        }

        this.setState({ isLoader: true })
        values.Modules = Modules;

        let userDetail = userDetails()

        if (isEditFlag) {
            // Update existing role

            let formData = {
                RoleId: RoleId,
                IsActive: true,
                CreatedDate: '',
                RoleName: values.RoleName,
                Description: values.Description,
                Modules: this.state.Modules,
                CreatedDate: '',
                CreatedByName: userDetail.Name,
                CreatedBy: loggedInUserId(),
            }
            reset();
            this.props.updateRoleAPI(formData, (res) => {
                if (res.data.Result) {
                    toastr.success(MESSAGES.UPDATE_ROLE_SUCCESSFULLY)
                }
                this.setState({
                    isLoader: false,
                    isEditFlag: false,
                    Modules: [],
                    isShowForm: false,
                })
                this.props.getAllRoleAPI(res => { })
                this.getRolePermission()
                this.props.setEmptyRoleDataAPI('', () => { })
                this.child.getUpdatedData();
            })
        } else {
            // Add new role
            this.props.addRoleAPI(values, (res) => {
                if (res && res.data && res.data.Result) {
                    toastr.success(MESSAGES.ADD_ROLE_SUCCESSFULLY)
                }
                reset();
                this.props.getAllRoleAPI(res => { })
                this.getRolePermission()
                this.child.getUpdatedData();
                this.setState({ isLoader: false, Modules: [] })
            })
        }

    }


    render() {
        const { handleSubmit, pristine, reset, submitting, moduleSelectList, actionSelectList, loading } = this.props;
        const { isLoader, isSubmitted, permissions, isEditFlag } = this.state;

        return (
            <div>
                {isLoader && <Loader />}
                <div className="login-container signup-form">
                    <div className="row">
                        <div className="col-md-12" >
                            <button
                                type="button"
                                className={'btn btn-primary user-btn'}
                                onClick={() => this.setState({ isShowForm: !this.state.isShowForm })}>Add</button>
                        </div>
                        {this.state.isShowForm &&
                            <div className="col-md-12">
                                <div className="shadow-lg login-form">
                                    <div className="form-heading">
                                        <h2>{isEditFlag ? 'Update Role' : 'Add Role'}</h2>
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
                                            {/* <div className="input-group  col-md-6 input-withouticon">
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
                                </div> */}
                                            {/* <div className="input-group  col-md-6 input-withouticon">
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
                                </div> */}

                                        </div>

                                        <div className=" row form-group">
                                            <div className="col-md-12">
                                                <Table className="table table-striped" size="sm" bordered dark striped >
                                                    <thead>
                                                        <tr>
                                                            <th>{`Module`}</th>
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
                                                                        onClick={() => this.selectAllHandler(index, item.Actions)} />}</td>

                                                                    {this.renderAction(item.Actions, index)}
                                                                </tr>
                                                            )
                                                        })}
                                                        {this.state.Modules.length == 0 && <NoContentFound title={CONSTANT.EMPTY_DATA} />}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </div>

                                        <div className="text-center ">
                                            <input
                                                disabled={isSubmitted ? true : false}
                                                type="submit"
                                                value={isEditFlag ? 'Update' : 'Save'}
                                                className="btn  login-btn w-10 dark-pinkbtn"
                                            />
                                            {!isEditFlag &&
                                                <input
                                                    disabled={pristine || submitting}
                                                    onClick={this.cancel}
                                                    type="button"
                                                    value="Reset"
                                                    className="btn  login-btn w-10 dark-pinkbtn"
                                                />}
                                        </div>
                                    </form>
                                </div>
                            </div>}
                    </div>
                </div>
                <RolesListing
                    onRef={ref => (this.child = ref)}
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
const mapStateToProps = (state, ownProps) => {
    const { auth } = state;
    const { roleList, roleDetail, moduleSelectList, actionSelectList, loading } = auth;
    let initialValues = {};

    if (roleDetail && roleDetail != undefined) {
        initialValues = {
            RoleName: roleDetail.RoleName,
            Description: roleDetail.Description,
        }
    }

    return { loading, roleList, initialValues, moduleSelectList, actionSelectList };
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
    setEmptyRoleDataAPI,
    updateRoleAPI,
    getModuleSelectList,
    getActionHeadsSelectList,
    getModuleActionInit,
})(reduxForm({
    form: 'Role',
    enableReinitialize: true,
})(Role));