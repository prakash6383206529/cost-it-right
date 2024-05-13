import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import { getModuleActionInit, } from "../../../actions/auth/AuthActions";
import { Table } from 'reactstrap';
import NoContentFound from "../../common/NoContentFound";
import { EMPTY_DATA, VENDOR_MANAGEMENT_ROLE } from "../../../config/constants";
import { renderActionCommon } from "../userUtil";

const SupplierManagementTab = ({
    data, actionSelectList, actionData, permissions
}) => {

    const [isLoader, setIsLoader] = useState(false);
    const [Modules, setModules] = useState([]);
    const [actionDataState, setActionDataState] = useState([]);
    const { roleList, moduleSelectList, loading } = useSelector(state => state.auth) || {};




    useEffect(() => {
        getRolePermission();
    }, []);

    useEffect(() => {
        if (actionData !== actionDataState) {
            setActionDataState(actionData);
            setModules(data && data.sort((a, b) => a.Sequence - b.Sequence));
        }
    }, [actionData, data]);

    const getRolePermission = () => {
        setIsLoader(true);
        getModuleActionInit((res) => {
            if (res && res.data && res.data.Data) {
                const { Data } = res.data;
                setActionDataState(Data);
                setModules(Data);
                setIsLoader(false);
            }
        });
    };

    //Below code for Table rendering...... 

    /**
   * @method actionCheckHandler
   * @description Used to check/uncheck action's checkbox
   */
    const actionCheckHandler = (parentIndex, childIndex) => {
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
    const renderActionHeads = (actionHeads) => {


        const actionNames = actionData && actionData.find(el => el.ModuleName === VENDOR_MANAGEMENT_ROLE);

        if (actionNames !== undefined) {
            return actionHeads && actionHeads.map((item, index) => {
                if (item.Value === 0) return false;
                if (actionNames.ActionItems && actionNames.ActionItems.includes(item.Text)) {
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

    const moduleHandler = (index) => {

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

            setModules(tempArray)
        } else {
            actionArray = actionRow && actionRow.map((item, index) => {
                item.IsChecked = true;
                return item;
            })

            tempArray = Object.assign([...Modules], { [index]: Object.assign({}, Modules[index], { IsChecked: true, Actions: actionArray }) })

            setModules(tempArray)
        }
    }

    const isCheckModule = (actionData) => {

        let tempArray = actionData && actionData.filter(item => item.IsChecked === true)
        if (actionData && actionData !== undefined) {
            return tempArray.length > 0 ? true : false;
        }
    }

    const isCheckAll = (parentIndex, actionData) => {

        let tempArray = actionData && actionData.filter(item => item.IsChecked === true)
        if (actionData && actionData !== undefined) {
            return tempArray.length === Modules[parentIndex].Actions.length ? true : false;
        }
    }

    const selectAllHandler = (parentIndex, actionRows) => {

        let checkedActions = actionRows.filter(item => item.IsChecked === true)

        let tempArray = [];
        let isCheckedSelectAll = (checkedActions.length === Modules[parentIndex].Actions.length) ? true : false;

        if (isCheckedSelectAll) {
            let actionArray = actionRows && actionRows.map((item, index) => {
                item.IsChecked = false;
                return item;
            })
            tempArray = Object.assign([...Modules], { [parentIndex]: Object.assign({}, Modules[parentIndex], { IsChecked: false, Actions: actionArray }) })
            setModules(tempArray,)
        } else {
            let actionArray = actionRows && actionRows.map((item, index) => {
                item.IsChecked = true;
                return item;
            })
            tempArray = Object.assign([...Modules], { [parentIndex]: Object.assign({}, Modules[parentIndex], { IsChecked: true, Actions: actionArray }) })
            setModules(tempArray,)
        }
    }

    const renderAction = (actions, parentIndex) => {
        let obj = {
            actionSelectList: actionSelectList,
            actionData: actionData,
        }
        const functionContainer = {
            actionCheckHandler: actionCheckHandler,
            state: obj
        }
        return renderActionCommon(actions, parentIndex, functionContainer, VENDOR_MANAGEMENT_ROLE)
    }


    const updateModules = () => {
        permissions(Modules, VENDOR_MANAGEMENT_ROLE);
    }

    useEffect(() => {
        // if (prevState.Modules !== Modules) {
        updateModules();
        // }
    }, [Modules]);


    return (
        <div>
            <div className="row form-group grant-user-grid">
                <div className="col-md-12">
                    <Table className="table table-bordered" size="sm">
                        <thead>
                            <tr>
                                <th>{`Module`}</th>
                                <th>{``}</th>
                                {renderActionHeads(actionSelectList)}
                            </tr>
                        </thead>
                        <tbody>
                            {Modules &&
                                Modules.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>
                                                {
                                                    <label
                                                        className="custom-checkbox"
                                                        onChange={() => moduleHandler(index)}
                                                    >
                                                        {item.PageName}
                                                        <input
                                                            type="checkbox"
                                                            value={"All"}
                                                            checked={isCheckModule(item.Actions)}
                                                        />
                                                        <span
                                                            className=" before-box"
                                                            checked={isCheckModule(item.Actions)}
                                                            onChange={() => moduleHandler(index)}
                                                        />
                                                    </label>
                                                }
                                            </td>
                                            <td className="select-all-block">
                                                <label id='Vendor_Specific_SelectAll_Check' className="custom-checkbox">
                                                    {" "}
                                                    {
                                                        <input
                                                            type="checkbox"
                                                            value={"All"}
                                                            className={
                                                                isCheckAll(index, item.Actions)
                                                                    ? "selected-box"
                                                                    : "not-selected-box"
                                                            }
                                                            checked={isCheckAll(
                                                                index,
                                                                item.Actions
                                                            )}
                                                            onClick={() =>
                                                                selectAllHandler(index, item.Actions)
                                                            }
                                                        />
                                                    }
                                                    <span className=" before-box">Select All</span>
                                                </label>
                                            </td>

                                            {renderAction(item.Actions, index)}
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </Table>
                    {Modules.length === 0 && (
                        <NoContentFound title={EMPTY_DATA} />
                    )}
                </div>
            </div>
        </div>
    );

}

export default SupplierManagementTab;
