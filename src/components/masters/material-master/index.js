import React, { Component } from 'react';
import { connect } from 'react-redux';

import AddRMDomestic from './AddRMDomestic';
import RMListing from './RMListing';
import SpecificationListing from './SpecificationListing';

import { Row, Container, Col, TabContent, TabPane, Nav, NavItem, NavLink, } from "reactstrap";
import { CONSTANT } from '../../../helper/AllConastant';
import classnames from 'classnames';

import { getRowMaterialDataAPI } from '../actions/Material';
import AddRMImport from './AddRMImport';
import RMDomesticListing from './RMDomesticListing';
import RMImportListing from './RMImportListing';

import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { HISTORY, MASTERS, RAW_MATERIAL, RAW_MATERIAL_NAME_AND_GRADE } from '../../../config/constants';
import { getConfigurationKey, loggedInUserId } from '../../../helper';
import { getLeftMenu, } from '../../../actions/auth/AuthActions';
import Insights from './Insights';

import RMApproval from './RMApproval';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link
} from "react-router-dom";
class RowMaterialMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isRMOpen: false,
            isOpen: false,
            isEditFlag: false,
            Id: '',
            activeTab: '1',

            isRMDomesticForm: false,
            isRMImportForm: false,
            data: {},

            ViewRMAccessibility: false,
            AddAccessibility: false,
            EditAccessibility: false,
            DeleteAccessibility: false,
            DownloadAccessibility: false,
            BulkUploadAccessibility: false,

            AddAccessibilityRMANDGRADE: false,
            EditAccessibilityRMANDGRADE: false,

        }
    }



    /**
    * @method componentDidMount
    * @description SET PERMISSION FOR ADD, VIEW, EDIT, DELETE, DOWNLOAD AND BULKUPLOAD
    */
    componentDidMount() {
        this.applyPermission(this.props.topAndLeftMenuData)
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.topAndLeftMenuData !== nextProps.topAndLeftMenuData) {
            this.applyPermission(nextProps.topAndLeftMenuData)
        }
    }

    /**
    * @method applyPermission
    * @description ACCORDING TO PERMISSION HIDE AND SHOW, ACTION'S
    */
    applyPermission = (topAndLeftMenuData) => {
        if (topAndLeftMenuData !== undefined) {
            const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === MASTERS);

            const accessData = Data && Data.Pages.find(el => el.PageName === RAW_MATERIAL)
            const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

            const accessDataRMANDGRADE = Data && Data.Pages.find(el => el.PageName === RAW_MATERIAL_NAME_AND_GRADE)
            const permmisionDataRMANDGRADE = accessDataRMANDGRADE && accessDataRMANDGRADE.Actions && checkPermission(accessDataRMANDGRADE.Actions)

            if (permmisionData !== undefined) {
                this.setState({
                    ViewRMAccessibility: permmisionData && permmisionData.View ? permmisionData.View : false,
                    AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
                    EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
                    DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
                    DownloadAccessibility: permmisionData && permmisionData.Download ? permmisionData.Download : false,
                    BulkUploadAccessibility: permmisionData && permmisionData.BulkUpload ? permmisionData.BulkUpload : false,
                    AddAccessibilityRMANDGRADE: permmisionDataRMANDGRADE && permmisionDataRMANDGRADE.Add ? permmisionDataRMANDGRADE.Add : false,
                    EditAccessibilityRMANDGRADE: permmisionDataRMANDGRADE && permmisionDataRMANDGRADE.Edit ? permmisionDataRMANDGRADE.Edit : false,
                })
            }
        }
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

    /**
    * @method displayDomesticForm
    * @description DISPLAY DOMESTIC FORM
    */
    displayDomesticForm = () => {
        this.setState({ isRMDomesticForm: true, })
    }

    /**
    * @method displayImportForm
    * @description DISPLAY IMPORT FORM
    */
    displayImportForm = () => {
        this.setState({ isRMImportForm: true, })
    }

    /**
    * @method hideForm
    * @description HIDE DOMESTIC, IMPORT FORMS
    */
    hideForm = () => {
        this.setState({ isRMDomesticForm: false, isRMImportForm: false, data: {} })
    }

    /**
    * @method getDetails
    * @description GET DETAILS FOR DOMESTIC FORM IN EDIT MODE
    * @param DATA CONTAINS ID AND EDIT FLAG
    */
    getDetails = (data) => {
        this.setState({ isRMDomesticForm: true, data: data })
    }

    /**
    * @method getDetailsImport
    * @description GET DETAILS FOR IMPORT FORM IN EDIT MODE
    * @param DATA CONTAINS ID AND EDIT FLAG
    */
    getDetailsImport = (data) => {
        this.setState({ isRMImportForm: true, data: data })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isRMDomesticForm, isRMImportForm, data, ViewRMAccessibility, AddAccessibilityRMANDGRADE,
            EditAccessibilityRMANDGRADE, } = this.state;

        const history = History

        if (isRMDomesticForm === true) {
            return <AddRMDomestic
                data={data}
                hideForm={this.hideForm}
                AddAccessibilityRMANDGRADE={AddAccessibilityRMANDGRADE}
                EditAccessibilityRMANDGRADE={EditAccessibilityRMANDGRADE}
            />
        }

        if (isRMImportForm === true) {
            return <AddRMImport
                data={data}
                hideForm={this.hideForm}
                AddAccessibilityRMANDGRADE={AddAccessibilityRMANDGRADE}
                EditAccessibilityRMANDGRADE={EditAccessibilityRMANDGRADE}
            />
        }
        return (
            <Container fluid>
                <Row>
                    <Col sm="4">
                        <h1>{`Raw Material Master`}</h1>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div>
                            <Nav tabs className="subtabs mt-0">
                                {ViewRMAccessibility && <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                        Insights
                                    </NavLink>
                                </NavItem>}
                                {ViewRMAccessibility && <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                        Manage Raw Material (Domestic)
                                    </NavLink>
                                </NavItem>}
                                {ViewRMAccessibility && <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '3' })} onClick={() => { this.toggle('3'); }}>
                                        Manage Raw Material (Import)
                                    </NavLink>
                                </NavItem>}
                                {ViewRMAccessibility && <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '4' })} onClick={() => { this.toggle('4'); }}>
                                        Manage Specification
                                    </NavLink>
                                </NavItem>}
                                {ViewRMAccessibility && <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '6' })} onClick={() => { this.toggle('6'); }}>
                                        Manage Material
                                    </NavLink>
                                </NavItem>}
                                {/* SHOW THIS TAB IF KEY IS COMING TRUE FROM CONFIGURATION (CONNDITIONAL TAB) */}
                                {/* uncomment below line after cherry-pick to Minda  TODO */}
                                {/* {(ViewRMAccessibility && getConfigurationKey().IsMasterApprovalAppliedConfigure) && <NavItem> */}
                                {ViewRMAccessibility && <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '5' })} onClick={() => { this.toggle('5'); }}>
                                        RM Approval
                                    </NavLink>
                                </NavItem>}
                            </Nav>

                            <TabContent activeTab={this.state.activeTab}>

                                {this.state.activeTab == 1 && ViewRMAccessibility &&
                                    <TabPane tabId="1">
                                        <Insights/>
                                    </TabPane>}

                                {this.state.activeTab == 2 && ViewRMAccessibility &&
                                    <TabPane tabId="2">
                                        <RMDomesticListing
                                            formToggle={this.displayDomesticForm}
                                            getDetails={this.getDetails}
                                            toggle={this.toggle}
                                            AddAccessibility={this.state.AddAccessibility}
                                            EditAccessibility={this.state.EditAccessibility}
                                            DeleteAccessibility={this.state.DeleteAccessibility}
                                            BulkUploadAccessibility={this.state.BulkUploadAccessibility}
                                            DownloadAccessibility={this.state.DownloadAccessibility}
                                        />
                                    </TabPane>}

                                {this.state.activeTab == 3 && ViewRMAccessibility &&
                                    <TabPane tabId="3">
                                        <RMImportListing
                                            formToggle={this.displayImportForm}
                                            getDetails={this.getDetailsImport}
                                            toggle={this.toggle}
                                            AddAccessibility={this.state.AddAccessibility}
                                            EditAccessibility={this.state.EditAccessibility}
                                            DeleteAccessibility={this.state.DeleteAccessibility}
                                            BulkUploadAccessibility={this.state.BulkUploadAccessibility}
                                            DownloadAccessibility={this.state.DownloadAccessibility}
                                        />
                                    </TabPane>}

                                {this.state.activeTab == 4 && ViewRMAccessibility &&
                                    <TabPane tabId="4">
                                        <SpecificationListing
                                            toggle={this.toggle}
                                            AddAccessibility={this.state.AddAccessibility}
                                            EditAccessibility={this.state.EditAccessibility}
                                            DeleteAccessibility={this.state.DeleteAccessibility}
                                            BulkUploadAccessibility={this.state.BulkUploadAccessibility}
                                            AddAccessibilityRMANDGRADE={this.state.AddAccessibilityRMANDGRADE}
                                            EditAccessibilityRMANDGRADE={this.state.EditAccessibilityRMANDGRADE}
                                            DownloadAccessibility={this.state.DownloadAccessibility}
                                        />
                                    </TabPane>}

                                {this.state.activeTab == 6 && ViewRMAccessibility &&
                                    <TabPane tabId="6">
                                        <RMListing
                                            AddAccessibility={this.state.AddAccessibility}
                                            EditAccessibility={this.state.EditAccessibility}
                                            DeleteAccessibility={this.state.DeleteAccessibility}
                                            DownloadAccessibility={this.state.DownloadAccessibility}
                                        />
                                    </TabPane>}
                                {this.state.activeTab == 5 && ViewRMAccessibility &&
                                    <TabPane tabId="5">
                                        {
                                            this.props.history.push({ pathname: '/raw-material-approval' })
                                        }

                                        {/* <Link to="/raw-material-approval"></Link> */}
                                        {/* <Route path="/raw-material-approval">
                                            <RMApproval
                                                AddAccessibility={this.state.AddAccessibility}
                                                EditAccessibility={this.state.EditAccessibility}
                                                DeleteAccessibility={this.state.DeleteAccessibility}
                                                DownloadAccessibility={this.state.DownloadAccessibility}
                                            />
                                        </Route> */}
                                    </TabPane>}

                            </TabContent>
                        </div>
                    </Col>
                </Row>

            </Container >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ auth }) {
    const { leftMenuData, topAndLeftMenuData, loading } = auth;
    return { leftMenuData, topAndLeftMenuData, loading }
}


export default connect(
    mapStateToProps, {
    getRowMaterialDataAPI,
    getLeftMenu,
})(RowMaterialMaster);

