import React, { Component } from 'react';
import { connect } from "react-redux";
import {
  getModuleSelectList, getActionHeadsSelectList, getModuleActionInit,
} from "../../../actions/auth/AuthActions";
import { Table, } from 'reactstrap';
import NoContentFound from "../../common/NoContentFound";
import { EMPTY_DATA } from "../../../config/constants";
import { USERS, } from "../../../config/constants";
import { renderActionCommon } from "../userUtil"
import { getConfigurationKey } from '../../../helper';

const SELF_DELEGATION = "Self Delegation";
const BEHALF_DELEGATION = "On Behalf Delegation";

class UsersTab extends Component {
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
      checkBox: false

    }
  }

  /**
  * @method componentDidMount
  * @description used to called after mounting component
  */
  componentDidMount() {

  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.data !== this.state.data) {
      const { data, actionData, actionSelectList } = nextProps;

      let arrayModules = data && data.sort((a, b) => a.Sequence - b.Sequence)
      let newArrayModules = []

      arrayModules && arrayModules.map((item, index) => {
        if (getConfigurationKey().IsRFQConfigured) {
          newArrayModules.push(item)
        } else {
          if (item.PageName !== "RFQUser") {
            newArrayModules.push(item)
          }
        }
      })

      this.setState({
        actionData: actionData,
        Modules: newArrayModules,
        actionSelectList: actionSelectList,
      })

      actionData && actionData.map((ele, index) => {
        if (ele.ModuleName === 'Users') {
          this.setState({ checkBox: ele.SelectAll })
          // this.setState({ checkBox: ele.IsChecked })          						//RE
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
    let actionNames = actionData && actionData.find(el => el.ModuleName === USERS)
    if (actionNames !== undefined) {
      return actionHeads && actionHeads.map((item, index) => {
        if (item.Value === 0) return false;
        if (actionNames.ActionItems && actionNames.ActionItems.includes(item.Text)) {
          return (
            <th className="crud-label">
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
    const { Modules } = this.state;
    const isModuleChecked = Modules[index].IsChecked;
    let actionArray = [];
    let tempArray = [];

    let actionRow = (Modules && Modules !== undefined) ? Modules[index].Actions : [];
    if (isModuleChecked) {
      actionArray = actionRow && actionRow.map((item) => {
        item.IsChecked = false;
        return item;
      })
      tempArray = Object.assign([...Modules], { [index]: Object.assign({}, Modules[index], { IsChecked: false, Actions: actionArray }) })
    } else {
      actionArray = actionRow && actionRow.map((item) => {
        item.IsChecked = true;
        return item;
      })
      tempArray = Object.assign([...Modules], { [index]: Object.assign({}, Modules[index], { IsChecked: true, Actions: actionArray }) })
    }
    
    this.setState({ Modules: tempArray, checkBox: false }, () => {
      // Check delegation dependency
      this.checkDelegationDependency(index, tempArray);
    })
  }

  checkDelegationDependency = (parentIndex, Module) => {
    let tempModule = [...Module];
    let tempArray = [...Module];

    const commonLogic = (ModuleName, value) => {
      let index = tempModule.findIndex((x) => x.PageName === ModuleName);
      if (index !== -1) {
        let actionList = tempModule[index].Actions || [];
        let actions = actionList.map((item) => {
          item.IsChecked = value;
          return item;
        });
        tempArray = Object.assign([...tempModule], { 
          [index]: Object.assign({}, tempModule[index], { IsChecked: value, Actions: actions }) 
        });
      }
    }

    // When On Behalf Delegation is selected, select Self Delegation
    if (tempModule[parentIndex]?.PageName === BEHALF_DELEGATION && tempModule[parentIndex]?.IsChecked === true) {
      commonLogic(SELF_DELEGATION, true);
    }
    
    // When Self Delegation is deselected, deselect On Behalf Delegation
    if (tempModule[parentIndex]?.PageName === SELF_DELEGATION && tempModule[parentIndex]?.IsChecked === false) {
      commonLogic(BEHALF_DELEGATION, false);
    }

    this.setState({ Modules: tempArray });
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
    const { Modules, } = this.state;

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
      this.setState({ Modules: tempArray, checkBox: false })
    } else {
      let actionArray = actionRows && actionRows.map((item, index) => {
        item.IsChecked = true;
        return item;
      })
      tempArray = Object.assign([...Modules], { [parentIndex]: Object.assign({}, Modules[parentIndex], { IsChecked: true, Actions: actionArray }) })
      this.setState({ Modules: tempArray, checkBox: false })
    }
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

  /**
  * @method renderAction
  * @description used to render row of actions
  */
  renderAction = (actions, parentIndex) => {

    return renderActionCommon(actions, parentIndex, this, USERS)
  }

  /**
  * @method actionCheckHandler
  * @description Used to check/uncheck action's checkbox
  */
  actionCheckHandler = (parentIndex, childIndex) => {
    const { Modules } = this.state;

    // When On Behalf Delegation action is selected, select same action in Self Delegation
    if (Modules[parentIndex]?.PageName === BEHALF_DELEGATION) {
      let selfDelegationIndex = Modules.findIndex(x => x.PageName === SELF_DELEGATION);
      if (selfDelegationIndex !== -1) {
        let tempModules = [...Modules];
        tempModules[selfDelegationIndex].Actions[childIndex].IsChecked = true;
        this.setState({ Modules: tempModules });
      }
    }

    // When Self Delegation action is deselected, deselect same action in On Behalf Delegation
    if (Modules[parentIndex]?.PageName === SELF_DELEGATION) {
      let behalfDelegationIndex = Modules.findIndex(x => x.PageName === BEHALF_DELEGATION);
      if (behalfDelegationIndex !== -1) {
        let tempModules = [...Modules];
        tempModules[behalfDelegationIndex].Actions[childIndex].IsChecked = false;
        this.setState({ Modules: tempModules });
      }
    }

    // Original action check handler logic
    let actionRow = (Modules && Modules !== undefined) ? Modules[parentIndex].Actions : [];
    let actionArray = actionRow && actionRow.map((el, index) => {
      if (childIndex === index) {
        el.IsChecked = !el.IsChecked;
      }
      return el;
    });
    
    let tempArray = Object.assign([...Modules], { 
      [parentIndex]: Object.assign({}, Modules[parentIndex], { Actions: actionArray }) 
    });

    this.setState({ Modules: tempArray }, () => {
      const { Modules } = this.state;
      let actions = Modules[parentIndex].Actions || [];
      let checkedActions = actions.filter(item => item.IsChecked === true);
      let isChecked = checkedActions.length !== 0;
      let tempArray1 = Object.assign([...Modules], { 
        [parentIndex]: Object.assign({}, Modules[parentIndex], { IsChecked: isChecked, Actions: actionArray }) 
      });
      this.setState({ Modules: tempArray1 });
    });
  }

  componentDidUpdate(prevState) {
    if (prevState.Modules !== this.state.Modules) {
      this.updateModules()
    }
  }

  updateModules = () => {
    const { Modules } = this.state;
    this.props.permissions(Modules, USERS)
  }


  render() {
    const { actionSelectList } = this.state;
    return (
      <div>
        <div className="row form-group grant-user-grid">
          <div className="col-md-12">
            <Table className="table table-bordered" size="sm">
              <thead>
                <tr>
                  <th>{`Module`}</th>
                  <th className="select-all-block pr-2">
                    <label id='User_SelectAll_Check' className="custom-checkbox align-middle text-left">
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
                    return (
                      <tr key={index}>
                        <td>
                          {
                            <label
                              className="custom-checkbox"
                              onChange={() => this.moduleHandler(index)}
                            >
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
                          }
                        </td>
                        <td className="select-all-block">
                          <label id='User_Specific_SelectAll_Check' className="custom-checkbox">
                            {
                              <input
                                type="checkbox"
                                value={"All"}
                                className={
                                  this.isCheckAll(index, item.Actions)
                                    ? "selected-box"
                                    : "not-selected-box"
                                }
                                checked={this.isCheckAll(
                                  index,
                                  item.Actions
                                )}
                                onClick={() =>
                                  this.selectAllHandler(index, item.Actions)
                                }
                              />
                            }
                            <span className=" before-box">Select All</span>
                          </label>
                        </td>

                        {this.renderAction(item.Actions, index)}
                      </tr>
                    );
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
  const { roleList, moduleSelectList, actionSelectList, loading } = auth;
  let initialValues = {};

  return { loading, roleList, initialValues, moduleSelectList, actionSelectList };
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
})(UsersTab);
