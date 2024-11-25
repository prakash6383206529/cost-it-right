import React, { Component } from "react";
import { connect } from "react-redux";
import {
    getActionHeadsSelectList, getModuleActionInit, getModuleActionInitNew
} from "../../../actions/auth/AuthActions";
import {
    DASHBOARD_AND_AUDIT, MASTERS, ADDITIONAL_MASTERS, COSTING, SIMULATION, REPORTS_AND_ANALYTICS,
    USERS, AUDIT, RFQ, NFR, VENDOR_MANAGEMENT_ROLE, AUCTION
} from "../../../config/constants";
import { TabContent, TabPane, Nav, NavItem, NavLink, } from 'reactstrap';
import classnames from 'classnames';
import DashboardAuditTab from "./DashboardAuditTab";
import MastersTab from "./MastersTab";
import AdditionalMastersTab from "./AdditionalMastersTab";
import CostingTab from "./CostingTab";
import SimulationTab from "./SimulationTab";
import UsersTab from "./UsersTab";
import ReportsTab from "./ReportsTab";
import AuditTab from "./AuditTab";
import LoaderCustom from "../../common/LoaderCustom";
import RfqTab from "./RfqTab";
import AuctionTab from "./AuctionTab";
import { getConfigurationKey, scrollReset } from "../../../helper";
import NfrTab from "./NfrTab";
import TourWrapper from "../../common/Tour/TourWrapper";
import { Steps } from "./TourMessages";
import { withTranslation } from "react-i18next";
import VendorManagementTab from "./SupplierManagementTab";
import SupplierManagementTab from "./SupplierManagementTab";
import { LabelsClass } from "../../../helper/core";
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
            audit: [],
            scrollReset: false,
            supplierManagement: [],
            counter: 0,
            auction: []
        };
    }

    /**
    * @method componentDidMount
    * @description used to called after mounting component
    */
    componentDidMount() {

        this.setState({ isLoader: true, counter: this.state.counter + 1 });
        this.props.getActionHeadsSelectList(() => {
            setTimeout(() => {
                const { isEditFlag, isNewRole } = this.props;
                if (isEditFlag === false && isNewRole && this.props.isCallNewApi === true) {
                    this.getRolePermission()
                }
            }, 500)
        })

        if (this.props.refVariable) {
            this.props.onRef(this);
        }
    }


    UNSAFE_componentWillReceiveProps(nextProps) {

        if (nextProps.updatedData !== this.props.updatedData) {
            if (JSON.stringify(nextProps.updatedData) != JSON.stringify(this.props.updatedData)) {
                if (this.state.counter == 1) {
                    this.getUpdatedData(nextProps.updatedData)
                    this.setState({ counter: this.state.counter + 1 })
                }
            }
        }
    }


    getRolePermission = () => {
        const { isEditFlag, isNewRole } = this.props;
        if (isEditFlag === false && isNewRole) {
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
        this.setState({ isLoader: true })
        setTimeout(() => {
            this.updateTabs(data)
            this.setState({ isLoader: false })
        }, 2000)
    }

    /**
    * @method updateTabs
    * @description get updated tabs data after update success
    */
    updateTabs = (Data) => {



        let dashboardObj = Data && Data.filter(el => el.ModuleName === DASHBOARD_AND_AUDIT)
        let masterObj = Data && Data.filter(el => el.ModuleName === MASTERS)
        let additionalMasterObj = Data && Data.filter(el => el.ModuleName === ADDITIONAL_MASTERS)
        let costingObj = Data && Data.filter(el => el.ModuleName === COSTING)
        let simulationObj = Data && Data.filter(el => el.ModuleName === SIMULATION)
        let reportAnalyticsObj = Data && Data.filter(el => el.ModuleName === REPORTS_AND_ANALYTICS)
        let usersObj = Data && Data.filter(el => el.ModuleName === USERS)
        let auditObj = Data && Data.filter(el => el.ModuleName === AUDIT)
        let rfqObj = Data && Data.filter(el => el.ModuleName === RFQ)
        let nfrObj = Data && Data.filter(el => el.ModuleName === NFR)
        let supperilerObj = Data && Data.filter(el => el.ModuleName === VENDOR_MANAGEMENT_ROLE)
        let auctionObj = Data && Data.filter(el => el.ModuleName === AUCTION)

        this.setState({
            actionData: Data,
            isLoader: false,
            dashoard: dashboardObj && dashboardObj?.length > 0 ? dashboardObj[0].Pages : [],
            masters: masterObj && masterObj?.length > 0 ? masterObj[0].Pages : [],
            additionalMasters: additionalMasterObj && additionalMasterObj?.length > 0 ? additionalMasterObj[0].Pages : [],
            costing: costingObj && costingObj?.length > 0 ? costingObj[0].Pages : [],
            simulation: simulationObj && simulationObj?.length > 0 ? simulationObj[0].Pages : [],
            reportAnalytics: reportAnalyticsObj && reportAnalyticsObj?.length > 0 ? reportAnalyticsObj[0].Pages : [],
            user: usersObj && usersObj?.length > 0 ? usersObj[0].Pages : [],
            audit: auditObj && auditObj?.length > 0 ? auditObj[0].Pages : [],
            rfq: rfqObj && rfqObj?.length > 0 ? rfqObj[0].Pages : [],
            nfr: nfrObj && nfrObj?.length > 0 ? nfrObj[0].Pages : [],
            supplierManagement: supperilerObj && supperilerObj?.length > 0 ? supperilerObj[0].Pages : [],
            auction: auctionObj && auctionObj?.length > 0 ? auctionObj[0].Pages : []
        }, () => {

            this.permissionHandler(this.state.dashoard, DASHBOARD_AND_AUDIT)
            this.permissionHandler(this.state.masters, MASTERS)
            this.permissionHandler(this.state.additionalMasters, ADDITIONAL_MASTERS)
            this.permissionHandler(this.state.costing, COSTING)
            this.permissionHandler(this.state.simulation, SIMULATION)
            this.permissionHandler(this.state.reportAnalytics, REPORTS_AND_ANALYTICS)
            this.permissionHandler(this.state.user, USERS)
            this.permissionHandler(this.state.audit, AUDIT)
            this.permissionHandler(this.state.rfq, RFQ)
            this.permissionHandler(this.state.nfr, NFR)
            this.permissionHandler(this.state.supplierManagement, VENDOR_MANAGEMENT_ROLE)
            this.permissionHandler(this.state.auction, AUCTION)
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
        if (Number(tab) === Number(4)) { //THIS CODE WILL EXECUTE ONLY FOR COSTING TAB
            setTimeout(() => {
                scrollReset('costingTab')
            }, 100);
        }
    }

    permissionHandler = (data, ModuleName) => {

        this.props.moduleData(data, ModuleName)
    }
    render() {
        const { t } = this.props;
        const { isLoader, } = this.state;
        const VendorLabel = LabelsClass(t, 'MasterLabels').vendorLabel;

        return (
            <div>
                {isLoader && <LoaderCustom customClass="attachment-loader" />}
                <div className="login-container signup-form ">
                    <div className="row mb-30">
                        <div className="col-md-12">
                            <div className="shadow-lgg login-formg ">

                                <Nav tabs className="subtabs pr-tab">
                                    {
                                        this.state.dashoard?.length > 0 &&
                                        <NavItem>
                                            <NavLink id="Dashboard" className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                                Dashboard
                                            </NavLink>
                                        </NavItem>
                                    }
                                    {
                                        this.state.masters?.length > 0 &&
                                        <NavItem>
                                            <NavLink id="Masters" className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                                Masters
                                                {this.state.activeTab === '2' && (
                                                    <TourWrapper
                                                        buttonSpecificProp={{ id: "Add_User_Form" }}
                                                        stepsSpecificProp={{
                                                            steps: Steps(t,).Master
                                                        }}
                                                    />
                                                )}
                                            </NavLink>
                                        </NavItem>
                                    }
                                    {
                                        this.state.additionalMasters?.length > 0 &&
                                        <NavItem>
                                            <NavLink id="AdditionalMasters" className={classnames({ active: this.state.activeTab === '3' })} onClick={() => { this.toggle('3'); }}>
                                                Additional Masters
                                                {this.state.activeTab === '3' && (
                                                    <TourWrapper
                                                        buttonSpecificProp={{ id: "Add_Additonal_Master_Form" }}
                                                        stepsSpecificProp={{
                                                            steps: Steps(t,).AdditionalMaster
                                                        }}
                                                    />
                                                )}
                                            </NavLink>
                                        </NavItem>
                                    }
                                    {
                                        this.state.costing?.length > 0 &&
                                        <NavItem>
                                            <NavLink id="Costing" className={classnames({ active: this.state.activeTab === '4' })} onClick={() => { this.toggle('4'); }}>
                                                Costing
                                                {this.state.activeTab === '4' && (
                                                    <TourWrapper
                                                        buttonSpecificProp={{ id: "Add_Costing_Form" }}
                                                        stepsSpecificProp={{
                                                            steps: Steps(t,).Costing
                                                        }}
                                                    />
                                                )}
                                            </NavLink>
                                        </NavItem>
                                    }
                                    {
                                        this.state.simulation?.length > 0 &&
                                        <NavItem>
                                            <NavLink id="Simulation" className={classnames({ active: this.state.activeTab === '5' })} onClick={() => { this.toggle('5'); }}>
                                                Simulation
                                                {this.state.activeTab === '5' && (
                                                    <TourWrapper
                                                        buttonSpecificProp={{ id: "Add_Simulation_Form" }}
                                                        stepsSpecificProp={{
                                                            steps: Steps(t,).Simulation
                                                        }}
                                                    />
                                                )}
                                            </NavLink>
                                        </NavItem>
                                    }
                                    {
                                        this.state.reportAnalytics?.length > 0 &&
                                        <NavItem>
                                            <NavLink id="Reports" className={classnames({ active: this.state.activeTab === '6' })} onClick={() => { this.toggle('6'); }}>
                                                Reports
                                                {this.state.activeTab === '6' && (
                                                    <TourWrapper
                                                        buttonSpecificProp={{ id: "Add_Report_Form" }}
                                                        stepsSpecificProp={{
                                                            steps: Steps(t,).Report
                                                        }}
                                                    />
                                                )}
                                            </NavLink>
                                        </NavItem>
                                    }
                                    {
                                        this.state.user?.length > 0 &&
                                        <NavItem>
                                            <NavLink id="Users" className={classnames({ active: this.state.activeTab === '7' })} onClick={() => { this.toggle('7'); }}>
                                                Users
                                                {this.state.activeTab === '7' && (
                                                    <TourWrapper
                                                        buttonSpecificProp={{ id: "Add_User_Form" }}
                                                        stepsSpecificProp={{
                                                            steps: Steps(t,).User
                                                        }}
                                                    />
                                                )}
                                            </NavLink>
                                        </NavItem>
                                    }
                                    {
                                        this?.state?.rfq?.length > 0 && getConfigurationKey().IsRFQConfigured &&
                                        <NavItem>
                                            <NavLink id="RFQ" className={classnames({ active: this.state.activeTab === '8' })} onClick={() => { this.toggle('8'); }}>
                                                RFQ
                                                {this.state.activeTab === '8' && (
                                                    <TourWrapper
                                                        buttonSpecificProp={{ id: "Add_RFQ_Form" }}
                                                        stepsSpecificProp={{
                                                            steps: Steps(t,).RFQ
                                                        }}
                                                    />
                                                )}
                                            </NavLink>
                                        </NavItem>
                                    }
                                    {
                                        this?.state?.nfr?.length > 0 &&
                                        <NavItem>
                                            <NavLink id="NFR" className={classnames({ active: this.state.activeTab === '9' })} onClick={() => { this.toggle('9'); }}>
                                                NFR
                                                {this.state.activeTab === '9' && (
                                                    <TourWrapper
                                                        buttonSpecificProp={{ id: "Add_Nfr_Form" }}
                                                        stepsSpecificProp={{
                                                            steps: Steps(t,).NFR
                                                        }}
                                                    />
                                                )}
                                            </NavLink>
                                        </NavItem>
                                    }
                                    {
                                        this.state.audit?.length > 0 &&
                                        <NavItem>
                                            <NavLink id="Audit" className={classnames({ active: this.state.activeTab === '10' })} onClick={() => { this.toggle('10'); }}>
                                                Audit
                                                {this.state.activeTab === '10' && (
                                                    <TourWrapper
                                                        buttonSpecificProp={{ id: "Add_Audit_Form" }}
                                                        stepsSpecificProp={{
                                                            steps: Steps(t,).Audit
                                                        }}
                                                    />
                                                )}
                                            </NavLink>
                                        </NavItem>
                                    }
                                    {
                                        this.state.supplierManagement?.length > 0 &&
                                        <NavItem>
                                            <NavLink className={classnames({ active: this.state.activeTab === '11' })} onClick={() => { this.toggle('11'); }}>
                                                {VendorLabel} Management
                                            </NavLink>
                                        </NavItem>
                                    }
                                    {
                                        this.state.auction?.length > 0 &&
                                        <NavItem>
                                            <NavLink className={classnames({ active: this.state.activeTab === '12' })} onClick={() => { this.toggle('12'); }}>
                                                Reverse Auction
                                            </NavLink>
                                        </NavItem>
                                    }
                                </Nav>
                                <TabContent className="pr-tab-content" activeTab={this.state.activeTab}>

                                    <TabPane tabId="1">
                                        <DashboardAuditTab
                                            data={this.state.dashoard}
                                            actionData={this.state.actionData}
                                            actionSelectList={this.props.actionSelectList}
                                            permissions={this.permissionHandler}
                                        />
                                    </TabPane>

                                    <TabPane tabId="2">
                                        <MastersTab
                                            data={this.state.masters}
                                            actionData={this.state.actionData}
                                            actionSelectList={this.props.actionSelectList}
                                            permissions={this.permissionHandler}
                                        />
                                    </TabPane>

                                    <TabPane tabId="3">
                                        <AdditionalMastersTab
                                            data={this.state.additionalMasters}
                                            actionData={this.state.actionData}
                                            actionSelectList={this.props.actionSelectList}
                                            permissions={this.permissionHandler}
                                        />
                                    </TabPane>

                                    <TabPane tabId="4">
                                        <CostingTab
                                            data={this.state.costing}
                                            actionData={this.state.actionData}
                                            actionSelectList={this.props.actionSelectList}
                                            permissions={this.permissionHandler}
                                        />
                                    </TabPane>

                                    <TabPane tabId="5">
                                        <SimulationTab
                                            data={this.state.simulation}
                                            actionData={this.state.actionData}
                                            actionSelectList={this.props.actionSelectList}
                                            permissions={this.permissionHandler}
                                        />
                                    </TabPane>

                                    <TabPane tabId="6">
                                        <ReportsTab
                                            data={this.state.reportAnalytics}
                                            actionData={this.state.actionData}
                                            actionSelectList={this.props.actionSelectList}
                                            permissions={this.permissionHandler}
                                        />
                                    </TabPane>

                                    <TabPane tabId="7">
                                        <UsersTab
                                            data={this.state.user}
                                            actionData={this.state.actionData}
                                            actionSelectList={this.props.actionSelectList}
                                            permissions={this.permissionHandler}
                                        />
                                    </TabPane>

                                    <TabPane tabId="8">
                                        <RfqTab
                                            data={this.state.rfq}
                                            actionData={this.state.actionData}
                                            actionSelectList={this.props.actionSelectList}
                                            permissions={this.permissionHandler}
                                        />
                                    </TabPane>
                                    <TabPane tabId="9">
                                        <NfrTab
                                            data={this.state.nfr}
                                            actionData={this.state.actionData}
                                            actionSelectList={this.props.actionSelectList}
                                            permissions={this.permissionHandler}
                                        />
                                    </TabPane>

                                    <TabPane tabId="10">
                                        <AuditTab
                                            data={this.state.audit}
                                            actionData={this.state.actionData}
                                            actionSelectList={this.props.actionSelectList}
                                            permissions={this.permissionHandler}
                                        />
                                    </TabPane>
                                    <TabPane tabId="11">
                                        <SupplierManagementTab
                                            data={this.state.supplierManagement}
                                            actionData={this.state.actionData}
                                            actionSelectList={this.props.actionSelectList}
                                            permissions={this.permissionHandler}
                                        />
                                    </TabPane>
                                    <TabPane tabId="12">
                                        <AuctionTab
                                            data={this.state.auction}
                                            actionData={this.state.actionData}
                                            actionSelectList={this.props.actionSelectList}
                                            permissions={this.permissionHandler}
                                        />
                                    </TabPane>

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

    if (roleDetail && roleDetail !== undefined) {
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
})(withTranslation(['UserRegistration'])(PermissionsTabIndex));