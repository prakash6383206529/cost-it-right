import React, { Component } from 'react';
import { connect } from "react-redux";
import {
    getModuleSelectList, getActionHeadsSelectList, getModuleActionInit,
} from "../../../actions/auth/AuthActions";
import { VENDOR_MANAGEMENT } from '../../../config/constants';
// Update the import path


class VendorManagementTab extends Component {
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
        }
    }

    componentDidMount() {
        // Call the action to fetch vendor modules and actions
        this.props.getVendorModuleActionInit();
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
    renderActionHeads = (actionHeads) => {
        const { actionData } = this.state;

        let actionNames = actionData && actionData.find(el => el.ModuleName === VENDOR_MANAGEMENT)
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
    // Rest of the component methods remain unchanged...
}


const mapStateToProps = (state, ownProps) => {
    const { vendorManagement } = state;
    const { moduleSelectList, actionSelectList, loading } = vendorManagement;
    let initialValues = {};

    return { loading, initialValues, moduleSelectList, actionSelectList };
};

export default connect(mapStateToProps, {
    getModuleSelectList,
    getActionHeadsSelectList,
    getModuleActionInit,
})(VendorManagementTab);
