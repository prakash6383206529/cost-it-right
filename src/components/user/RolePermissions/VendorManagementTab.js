import React, { Component } from 'react';
import { connect } from "react-redux";
import {
    getModuleSelectList, getActionHeadsSelectList, getModuleActionInit,
} from "../../../actions/auth/AuthActions";
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
