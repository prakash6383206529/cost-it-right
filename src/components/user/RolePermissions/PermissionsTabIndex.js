import React, { Component } from "react";
import { toastr } from "react-redux-toastr";
import { connect } from "react-redux";
import { Loader } from "../../common/Loader";
import { required, alphabetsOnlyForName, number } from "../../../helper/validation";
import "../UserRegistration.scss";
import {
    getActionHeadsSelectList, getModuleActionInit, getModuleActionInitNew
} from "../../../actions/auth/AuthActions";
import { MESSAGES } from "../../../config/message";
import {
    DASHBOARD_AND_AUDIT, MASTERS, ADDITIONAL_MASTERS, COSTING, SIMULATION, REPORTS_AND_ANALYTICS,
    USERS,
} from "../../../config/constants";
import { Table, TabContent, TabPane, Nav, NavItem, NavLink, } from 'reactstrap';
import classnames from 'classnames';
import NoContentFound from "../../common/NoContentFound";
import Switch from "react-switch";
import DashboardAuditTab from "./DashboardAuditTab";
import MastersTab from "./MastersTab";
import AdditionalMastersTab from "./AdditionalMastersTab";
import CostingTab from "./CostingTab";
import SimulationTab from "./SimulationTab";
import UsersTab from "./UsersTab";
import ReportsTab from "./ReportsTab";

class PermissionsTabIndex extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoader: false,
            isSubmitted: false,
            activeTab: '1',
            dashoard: [],
            masters: [],
            additionalMasters: [],
            costing: [],
            simulation: [],
            reportAnalytics: [],
            user: [],
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
        this.props.onRef(this);
    }

    getRolePermission = () => {
        const { isEditFlag, } = this.props;
        if (isEditFlag == false) {
            console.log('New call')
            this.setState({ isLoader: true });
            this.props.getModuleActionInitNew((res) => {
                if (res && res.data && res.data.Data) {
                    let Data = res.data.DataList;
                    this.props.setInitialModuleData(Data)
                    this.updateTabs(Data)
                }
            })
        }
    }

    /**
	* @method getUpdatedData
	* @description get updated data after updatesuccess
	*/
    getUpdatedData = (data) => {
        console.log('Update Call')
        this.updateTabs(data)
    }

    /**
	* @method updateTabs
	* @description get updated tabs data after update success
	*/
    updateTabs = (Data) => {
        let dashboardObj = Data && Data.filter(el => el.ModuleName == DASHBOARD_AND_AUDIT)
        let masterObj = Data && Data.filter(el => el.ModuleName == MASTERS)
        let additionalMasterObj = Data && Data.filter(el => el.ModuleName == ADDITIONAL_MASTERS)
        let costingObj = Data && Data.filter(el => el.ModuleName == COSTING)
        let simulationObj = Data && Data.filter(el => el.ModuleName == SIMULATION)
        let reportAnalyticsObj = Data && Data.filter(el => el.ModuleName == REPORTS_AND_ANALYTICS)
        let usersObj = Data && Data.filter(el => el.ModuleName == USERS)

        this.setState({
            actionData: Data,
            isLoader: false,
            dashoard: dashboardObj && dashboardObj != undefined ? dashboardObj[0].Pages : [],
            masters: masterObj && masterObj != undefined ? masterObj[0].Pages : [],
            additionalMasters: additionalMasterObj && additionalMasterObj != undefined ? additionalMasterObj[0].Pages : [],
            costing: costingObj && costingObj != undefined ? costingObj[0].Pages : [],
            simulation: simulationObj && simulationObj != undefined ? simulationObj[0].Pages : [],
            reportAnalytics: reportAnalyticsObj && reportAnalyticsObj != undefined ? reportAnalyticsObj[0].Pages : [],
            user: usersObj && usersObj != undefined ? usersObj[0].Pages : [],
        }, () => {
            this.permissionHandler(this.state.dashoard, DASHBOARD_AND_AUDIT)
            this.permissionHandler(this.state.masters, MASTERS)
            this.permissionHandler(this.state.additionalMasters, ADDITIONAL_MASTERS)
            this.permissionHandler(this.state.costing, COSTING)
            this.permissionHandler(this.state.simulation, SIMULATION)
            this.permissionHandler(this.state.reportAnalytics, REPORTS_AND_ANALYTICS)
            this.permissionHandler(this.state.user, USERS)
        })
    }

	/**
    * @method toggle
    * @description toggling the tabs
    */
    toggle = (tab) => {
        if (this.state.activeTab !== tab) {
            this.setState({
                activeTab: tab
            });
        }
    }

    permissionHandler = (data, ModuleName) => {
        this.props.moduleData(data, ModuleName)
    }

    render() {
        const { moduleSelectList, actionSelectList, loading } = this.props;
        const { isLoader, } = this.state;

        return (
            <div>
                {isLoader && <Loader />}
                <div className="login-container signup-form ">
                    <div className="row mb-30">
                        <div className="col-md-12">
                            <div className="shadow-lgg login-formg ">

                                <Nav tabs className="subtabs">
                                    <NavItem>
                                        <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                            Dashboard & Audit
              								</NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                            Masters
              								</NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink className={classnames({ active: this.state.activeTab === '3' })} onClick={() => { this.toggle('3'); }}>
                                            Additional Masters
              								</NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink className={classnames({ active: this.state.activeTab === '4' })} onClick={() => { this.toggle('4'); }}>
                                            Costing
              								</NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink className={classnames({ active: this.state.activeTab === '5' })} onClick={() => { this.toggle('5'); }}>
                                            Simulation
              								</NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink className={classnames({ active: this.state.activeTab === '6' })} onClick={() => { this.toggle('6'); }}>
                                            Reports
              								</NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink className={classnames({ active: this.state.activeTab === '7' })} onClick={() => { this.toggle('7'); }}>
                                            Users
              								</NavLink>
                                    </NavItem>
                                </Nav>
                                <TabContent activeTab={this.state.activeTab}>
                                    {/* {this.state.activeTab === '1' && */}
                                    <TabPane tabId="1">
                                        <DashboardAuditTab
                                            data={this.state.dashoard}
                                            actionData={this.state.actionData}
                                            actionSelectList={this.props.actionSelectList}
                                            permissions={this.permissionHandler}
                                        />
                                    </TabPane>
                                    {/* } */}
                                    {/* {this.state.activeTab === '2' && */}
                                    <TabPane tabId="2">
                                        <MastersTab
                                            data={this.state.masters}
                                            actionData={this.state.actionData}
                                            actionSelectList={this.props.actionSelectList}
                                            permissions={this.permissionHandler}
                                        />
                                    </TabPane>
                                    {/* } */}
                                    {/* {this.state.activeTab === '3' && */}
                                    <TabPane tabId="3">
                                        <AdditionalMastersTab
                                            data={this.state.additionalMasters}
                                            actionData={this.state.actionData}
                                            actionSelectList={this.props.actionSelectList}
                                            permissions={this.permissionHandler}
                                        />
                                    </TabPane>
                                    {/* } */}
                                    {/* {this.state.activeTab === '4' && */}
                                    <TabPane tabId="4">
                                        <CostingTab
                                            data={this.state.costing}
                                            actionData={this.state.actionData}
                                            actionSelectList={this.props.actionSelectList}
                                            permissions={this.permissionHandler}
                                        />
                                    </TabPane>
                                    {/* } */}
                                    {/* {this.state.activeTab === '5' && */}
                                    <TabPane tabId="5">
                                        <SimulationTab
                                            data={this.state.simulation}
                                            actionData={this.state.actionData}
                                            actionSelectList={this.props.actionSelectList}
                                            permissions={this.permissionHandler}
                                        />
                                    </TabPane>
                                    {/* } */}
                                    {/* {this.state.activeTab === '5' && */}
                                    <TabPane tabId="6">
                                        <ReportsTab
                                            data={this.state.reportAnalytics}
                                            actionData={this.state.actionData}
                                            actionSelectList={this.props.actionSelectList}
                                            permissions={this.permissionHandler}
                                        />
                                    </TabPane>
                                    {/* } */}
                                    {/* {this.state.activeTab === '6' && */}
                                    <TabPane tabId="7">
                                        <UsersTab
                                            data={this.state.user}
                                            actionData={this.state.actionData}
                                            actionSelectList={this.props.actionSelectList}
                                            permissions={this.permissionHandler}
                                        />
                                    </TabPane>
                                    {/* } */}

                                </TabContent>
                            </div>
                        </div>
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
    const { roleList, roleDetail, actionSelectList, loading } = auth;
    let initialValues = {};

    if (roleDetail && roleDetail != undefined) {
        initialValues = {
            RoleName: roleDetail.RoleName,
            Description: roleDetail.Description,
        }
    }

    return { loading, roleList, initialValues, actionSelectList };
};

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getActionHeadsSelectList,
    getModuleActionInit,
    getModuleActionInitNew,
})(PermissionsTabIndex);