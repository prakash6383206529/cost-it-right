import React, { Component } from 'react';
import { connect } from "react-redux";
import {
    getModuleSelectList, getActionHeadsSelectList, getModuleActionInit,
} from "../../../actions/auth/AuthActions";
import { Table, } from 'reactstrap';
import NoContentFound from "../../common/NoContentFound";
import { EMPTY_DATA, RFQ, RFQVendor } from "../../../config/constants";
import { renderActionCommon } from "../userUtil"

class RFQTab extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoader: false,
            isEditFlag: false,
            checkedAll: false,
            RoleId: '',
            Modules: [],
            actionData: [],
            actionSelectList: [],
            initialConfiguration: props?.initialConfiguration || {},

        }
    }

    /**
    * @method componentDidMount
    * @description used to called after mounting component
    */
    componentDidMount() {
        this.getRolePermission();

    }
    componentDidUpdate(prevProps, prevState) {
        if (prevState.Modules !== this.state.Modules) {
            this.updateModules();
        }
    }
    UNSAFE_componentWillReceiveProps(nextProps) {
        if (nextProps.data !== this.state.data) {
            const { data, actionData, actionSelectList, initialConfiguration } = nextProps;
            this.setState({
                actionData: actionData,
                Modules: data && data.sort((a, b) => a.Sequence - b.Sequence),
                actionSelectList: actionSelectList,
                initialConfiguration: initialConfiguration
            })

            actionData && actionData.map((ele, index) => {
                if (ele.ModuleName === RFQ) {
                    this.setState({ checkBox: ele.SelectAll })
                    // this.setState({ checkBox: ele.IsChecked })          		//MINDA				//RE
                }
                return null
            })
        }
    }

    getRolePermission = () => {
        this.setState({ isLoader: true });
        this.props.getModuleActionInit((res) => {
            if (res && res.data && res.data.Data) {
                let Data = res.data.Data;
                let Modules = res.data.Data;

                this.setState({
                    actionData: Data,
                    Modules: Modules,
                    isLoader: false,
                })
            }
        })
    }

    //Below code for Table rendering...... 

    /**
    * @method renderActionHeads
    * @description used to add more permission for user
    */
    renderActionHeads = (actionHeads) => {
        const { actionData } = this.state;
        let actionNames = actionData && actionData.find(el => el.ModuleName === RFQ)
        if (actionNames !== undefined) {
            return actionHeads && actionHeads.map((item, index) => {
                if (item.Value === 0) return false;
                if (actionNames.ActionItems && actionNames.ActionItems.includes(item.Text)) {
                    if (item.Text === "Send For Review" && !this.state.initialConfiguration?.IsManageSeparateUserPermissionForPartAndVendorInRaiseRFQ) {
                        return null
                    }
                    return (
                        <th className="crud-label" key={index}>
                            <div className={item.Text}></div>
                            {item.Text}
                        </th>
                    )
                }
                return null
            })
        }
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

            this.setState({ Modules: tempArray })
        } else {
            actionArray = actionRow && actionRow.map((item, index) => {
                item.IsChecked = true;
                return item;
            })

            tempArray = Object.assign([...Modules], { [index]: Object.assign({}, Modules[index], { IsChecked: true, Actions: actionArray }) })

            this.setState({ Modules: tempArray })
        }
        this.checkIsVendorSelected(index, tempArray)

    }

    /**
    * @method isCheckModule
    * @description used to select module's 
    */
    isCheckModule = (actionData) => {
        let tempArray = actionData && actionData.filter(item => item.IsChecked === true)
        if (actionData && actionData !== undefined) {
            return tempArray.length > 0 ? true : false;
        }
    }

    /**
    * @method isCheckAll
    * @description used to select module's action row (Horizontally)
    */
    isCheckAll = (parentIndex, actionData) => {
        const { Modules } = this.state;

        let tempArray = actionData && actionData.filter(item => item.IsChecked === true)
        if (actionData && actionData !== undefined) {
            return tempArray.length === Modules[parentIndex].Actions.length ? true : false;
        }
    }


    selectAllHandler = (parentIndex, actionRows) => {
        const { Modules, } = this.state;
        //const { actionSelectList } = this.props;

        let checkedActions = actionRows.filter(item => item.IsChecked === true)

        let tempArray = [];
        let isCheckedSelectAll = (checkedActions.length === Modules[parentIndex].Actions.length) ? true : false;

        if (isCheckedSelectAll) {
            let actionArray = actionRows && actionRows.map((item, index) => {
                item.IsChecked = false;
                return item;
            })
            tempArray = Object.assign([...Modules], { [parentIndex]: Object.assign({}, Modules[parentIndex], { IsChecked: false, Actions: actionArray }) })
            this.setState({ Modules: tempArray, })
        } else {
            let actionArray = actionRows && actionRows.map((item, index) => {
                item.IsChecked = true;
                return item;
            })
            tempArray = Object.assign([...Modules], { [parentIndex]: Object.assign({}, Modules[parentIndex], { IsChecked: true, Actions: actionArray }) })
            this.setState({ Modules: tempArray, })
        }
        this.checkIsVendorSelected(parentIndex, tempArray)
    }

    checkIsVendorSelected = (parentIndex, Module) => {
        let tempModule = [...Module];
        let tempArray = [...Module]; // Manipulated array to set in state

        // Common function to handle action checking based on ModuleName
        const commonLogic = (ModuleName, value) => {
            let index = tempModule.findIndex((x) => x.PageName === ModuleName);
            if (index !== -1) {
                let actionList = tempModule[index].Actions;
                let actions = actionList.map((item) => {
                    // Check only specific actions in RFQ when RFQVendor is checked
                    if (ModuleName === RFQ && ["View"].includes(item.ActionName)) {
                        item.IsChecked = value;
                    } else if (ModuleName !== RFQ) {
                        item.IsChecked = value;
                    }
                    return item;
                });
                tempArray = Object.assign([...tempModule], { [index]: Object.assign({}, tempModule[index], { IsChecked: value, Actions: actions }) });
            }
        };

        // Logic for checking/unchecking RFQ actions based on RFQVendor state
        if (tempModule[parentIndex]?.PageName === RFQVendor && tempModule[parentIndex]?.IsChecked === true) {
            commonLogic(RFQ, true); // Check specific actions in RFQ
        }

        this.setState({ Modules: tempArray });
    };


    /**
    * @method renderAction
    * @description used to render row of actions
    */
    renderAction = (actions, parentIndex) => {

        return renderActionCommon(actions, parentIndex, this, RFQ)
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
                // Automatically check "View" if "Add", "Edit", or "Bulk Upload" is checked for the 0th module
                if (parentIndex === 0 && ["Add", "Edit", "Bulk Upload"].includes(el.ActionName) && el.IsChecked) {
                    let viewAction = actionRow.find(action => action.ActionName === 'View');
                    if (viewAction) {
                        viewAction.IsChecked = true;
                    }
                }

                // If "Add" or "Edit" is checked for the 1st module
                if (parentIndex === 1 && ["Add", "Edit"].includes(el.ActionName) && el.IsChecked) {
                    let firstModuleActions = Modules[0].Actions;

                    // Ensure "View" is checked for both the 0th and 1st modules
                    let firstModuleViewAction = firstModuleActions.find(action => action.ActionName === 'View');
                    let secondModuleViewAction = actionRow.find(action => action.ActionName === 'View');
                    if (firstModuleViewAction) {
                        firstModuleViewAction.IsChecked = true;
                    }
                    if (secondModuleViewAction) {
                        secondModuleViewAction.IsChecked = true;
                    }
                }
            }
            return el;
        });
        let tempArray = Object.assign([...Modules], { [parentIndex]: Object.assign({}, Modules[parentIndex], { Actions: actionArray }) })
        this.setState({ Modules: tempArray }, () => {
            const { Modules } = this.state;
            let aa = (Modules && Modules !== undefined) ? Modules[parentIndex].Actions : [];
            let checkedActions = aa.filter(item => item.IsChecked === true)
            let abcd = checkedActions && checkedActions.length !== 0 ? true : false;
            let tempArray1 = Object.assign([...Modules], { [parentIndex]: Object.assign({}, Modules[parentIndex], { IsChecked: abcd, Actions: actionArray }) })
            this.setState({ Modules: tempArray1 })
        })
    }


    updateModules = () => {
        const { Modules } = this.state;
        this.props.permissions(Modules, RFQ)
    }

    selectAllHandlerEvery = () => {
        const { Modules } = this.state;

        let booleanVal = this.state.checkBox
        this.setState({ checkBox: !booleanVal })
        let isCheckedSelectAll = !booleanVal

        let actionRows
        let actionArray = Modules && Modules.map((item, index) => {
            actionRows = item
            item.Actions && item.Actions.map((item1, index) => {
                item1.IsChecked = isCheckedSelectAll;
                return null
            })
            item.IsChecked = isCheckedSelectAll
            return actionRows;
        })
        this.setState({ Modules: actionArray, })
    }

    render() {
        const { actionSelectList, initialConfiguration } = this.state;
        const showOnlyFirstModule = initialConfiguration?.IsManageSeparateUserPermissionForPartAndVendorInRaiseRFQ;

        return (
            <div>
                <div className="row form-group grant-user-grid">
                    <div className="col-md-12">
                        <Table className="table table-bordered" size="sm">
                            <thead>
                                {/* <tr>
                                    <th>{`Module`}</th>
                                    <th>{``}</th>
                                    {this.renderActionHeads(actionSelectList)}
                                </tr> */}
                                <tr>
                                    <th>{`Module`}</th>
                                    <th className="select-all-block pr-2">
                                        <label id='Onboarding_Specific_SelectAll_Check' className="custom-checkbox align-middle text-left">
                                            <input
                                                type="checkbox"
                                                value={"All"}
                                                checked={this.state.checkBox}
                                                onClick={() =>
                                                    this.selectAllHandlerEvery()
                                                }
                                            />
                                            <span className=" before-box pl-0">Select All</span>
                                        </label>
                                    </th>
                                    {this.renderActionHeads(actionSelectList)}
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.Modules &&
                                    this.state.Modules.map((item, index) => {
                                        if (index === 0 || showOnlyFirstModule) {
                                            return (
                                                <tr key={index}>
                                                    <td>
                                                        <label className="custom-checkbox" onChange={() => this.moduleHandler(index)}>
                                                            {item.PageName}
                                                            <input
                                                                type="checkbox"
                                                                value={"All"}
                                                                checked={this.isCheckModule(item.Actions)}
                                                            />
                                                            <span
                                                                className=" before-box"
                                                                checked={this.isCheckModule(item.Actions)}
                                                                onChange={() => this.moduleHandler(index)}
                                                            />
                                                        </label>
                                                    </td>
                                                    <td className="select-all-block">
                                                        <label id='RFQ_Specific_SelectAll_Check' className="custom-checkbox">
                                                            {" "}
                                                            <input
                                                                type="checkbox"
                                                                value={"All"}
                                                                className={
                                                                    this.isCheckAll(index, item.Actions)
                                                                        ? "selected-box"
                                                                        : "not-selected-box"
                                                                }
                                                                checked={this.isCheckAll(index, item.Actions)}
                                                                onClick={() => this.selectAllHandler(index, item.Actions)}
                                                            />
                                                            <span className=" before-box">Select All</span>
                                                        </label>
                                                    </td>
                                                    {this.renderAction(item.Actions, index)}
                                                </tr>
                                            );
                                        }
                                        return null; // Render nothing for other modules if showOnlyFirstModule is true
                                    })}
                            </tbody>
                        </Table>
                        {this.state.Modules.length === 0 && (
                            <NoContentFound title={EMPTY_DATA} />
                        )}
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
const mapStateToProps = (state, ownProps) => {
    const { auth } = state;
    const { roleList, moduleSelectList, actionSelectList, loading, initialConfiguration } = auth;
    let initialValues = {};


    return { loading, roleList, initialValues, moduleSelectList, actionSelectList, initialConfiguration };
};

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getModuleSelectList,
    getActionHeadsSelectList,
    getModuleActionInit,
})(RFQTab);
