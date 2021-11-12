import React, { Component } from 'react';
import { connect } from "react-redux";
import "../UserRegistration.scss";
import {
  getModuleSelectList, getActionHeadsSelectList, getModuleActionInit,
} from "../../../actions/auth/AuthActions";
import { Table, } from 'reactstrap';
import NoContentFound from "../../common/NoContentFound";
import { EMPTY_DATA } from "../../../config/constants";
import { COSTING, } from "../../../config/constants";
import Switch from "react-switch";

class CostingTab extends Component {
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
      checkBox: true
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
      this.setState({
        actionData: actionData,
        Modules: data && data.sort((a, b) => a.Sequence - b.Sequence),
        actionSelectList: actionSelectList,
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
    let count = 0;

    let actionNames = actionData && actionData.find(el => el.ModuleName === COSTING)
    if (actionNames !== undefined) {
      return actionHeads && actionHeads.map((item, index) => {
        if (item.Value == 0) return false;
        if (actionNames.ActionItems && actionNames.ActionItems.includes(item.Text)) {

          if (item.Text == "Reject" || item.Text == "Bulk Upload") { return false }
          else {
            if (item.Text == 'SOB') { count++; }

            if (count > 0) {
              return (
                <>
                  <th className="crud-label">
                    <div className={item.Text}></div>
                    {item.Text}
                  </th>

                  <th className="crud-label">
                    <div className='Bulk Upload'></div>
                    Bulk Upload
                  </th>

                  <th className="crud-label">
                    <div className='Reject'></div>
                    Reject
                  </th>
                </>
              )

            }
            else {
              return (
                <th className="crud-label">
                  <div className={item.Text}></div>
                  {item.Text}
                </th>
              )

            }

          }
        }

      })

    }

  }

  /**
  * @method moduleHandler
  * @description used to checked module
  */
  moduleHandler = (index) => {
    //alert('hi')
    const { Modules, } = this.state;
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
      this.setState({ Modules: tempArray, })
    } else {
      let actionArray = actionRows && actionRows.map((item, index) => {
        item.IsChecked = true;
        return item;
      })
      tempArray = Object.assign([...Modules], { [parentIndex]: Object.assign({}, Modules[parentIndex], { IsChecked: true, Actions: actionArray }) })
      this.setState({ Modules: tempArray, })
    }
  }

  selectAllHandlerEvery = () => {
    const { Modules, checkBox } = this.state;
    let booleanVal = this.state.checkBox
    this.setState({ checkBox: !booleanVal })
    let tempArray = [];
    let isCheckedSelectAll = checkBox
    let actionRows
    let actionArray = Modules && Modules.map((item, index) => {
      if (item.Sequence === 0) {
        item.IsChecked = false
      }
      actionRows = item
      item.Actions && item.Actions.map((item1, index) => {
        if (item.Sequence === 0) {
          item1.IsChecked = false
        } else {
          item1.IsChecked = isCheckedSelectAll;
        }
      })
      return actionRows;
    })
    this.setState({ Modules: actionArray, })
  }

  /**
  * @method renderAction
  * @description used to render row of actions
  */
  renderAction = (actions, parentIndex) => {
    const { actionSelectList } = this.state;


    return actionSelectList && actionSelectList.map((el, i) => {
      if (el.Value == 0) return false;
      return actions && actions.map((item, index) => {
        if (el.Value !== item.ActionId) return false;

        if (item.ActionName == 'Reject') {

          return (
            <td colSpan='8' className="text-right">
              {
                <label htmlFor="normal-switch" className="normal-switch">
                  <Switch
                    onChange={() => this.actionCheckHandler(parentIndex, index)}
                    checked={item.IsChecked}
                    value={item.ActionId}
                    id="normal-switch"
                    onColor="#4DC771"
                    onHandleColor="#ffffff"
                    offColor="#959CB6"
                    checkedIcon={false}
                    uncheckedIcon={false}
                    height={18}
                    width={40}
                  />
                </label>
              }
            </td>
          )

        } if (item.ActionName == 'Bulk Upload') {

          return (
            <td colSpan='6' className="text-right">
              {
                <label htmlFor="normal-switch" className="normal-switch">
                  <Switch
                    onChange={() => this.actionCheckHandler(parentIndex, index)}
                    checked={item.IsChecked}
                    value={item.ActionId}
                    id="normal-switch"
                    onColor="#4DC771"
                    onHandleColor="#ffffff"
                    offColor="#959CB6"
                    checkedIcon={false}
                    uncheckedIcon={false}
                    height={18}
                    width={40}
                  />
                </label>
              }
            </td>
          )

        }



        return (
          <td className="text-center">
            {
              <label htmlFor="normal-switch" className="normal-switch">
                <Switch
                  onChange={() => this.actionCheckHandler(parentIndex, index)}
                  checked={item.IsChecked}
                  value={item.ActionId}
                  id="normal-switch"
                  onColor="#4DC771"
                  onHandleColor="#ffffff"
                  offColor="#959CB6"
                  checkedIcon={false}
                  uncheckedIcon={false}
                  height={18}
                  width={40}
                />
              </label>
            }
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
    this.setState({ Modules: tempArray }, () => {
      const { Modules } = this.state;
      let aa = (Modules && Modules !== undefined) ? Modules[parentIndex].Actions : [];
      let checkedActions = aa.filter(item => item.IsChecked === true)
      let abcd = checkedActions && checkedActions.length !== 0 ? true : false;
      let tempArray1 = Object.assign([...Modules], { [parentIndex]: Object.assign({}, Modules[parentIndex], { IsChecked: abcd, Actions: actionArray }) })
      this.setState({ Modules: tempArray1 })
    })
  }

  componentDidUpdate(prevState) {
    if (prevState.Modules !== this.state.Modules) {
      this.updateModules()
    }
  }

  updateModules = () => {
    const { Modules } = this.state;
    this.props.permissions(Modules, COSTING)
  }

  /**
  * @method cancel
  * @description used to cancel role edit
  */
  cancel = () => {

  }

  clearForm = () => {

  }

  render() {
    const { actionSelectList } = this.state;
    return (
      <div>
        <div className="row form-group grant-user-grid user-costing-tab">
          <div className="col-md-12">
            <Table className="table table-bordered" size="sm">
              <thead>
                <tr>
                  <th>{`Module`}</th>
                  <th className=" pr-2">
                    <label className="custom-checkbox align-middle select-all-label">
                      <input
                        type="checkbox"
                        value={"All"}
                        // className={
                        //     this.isCheckAll(item, item)
                        //         ? "selected-box"
                        //         : "not-selected-box"
                        // }
                        // checked={this.isCheckAll(
                        //     index,
                        //     item.Actions
                        // )}
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
                    if (item.Sequence === 0) return false
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
                          <label className="custom-checkbox">
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
})(CostingTab);
