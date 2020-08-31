import React, { Component } from 'react';
import { connect } from 'react-redux';

import AddRMDomestic from './AddRMDomestic';
import RMListing from './RMListing';
import SpecificationListing from './SpecificationListing';

import { Row, Container, Col, TabContent, TabPane, Nav, NavItem, NavLink, Button } from "reactstrap";
import { Loader } from '../../../../common/Loader';
import { CONSTANT } from '../../../../../helper/AllConastant';
import classnames from 'classnames';

import { getRowMaterialDataAPI } from '../../../../../actions/master/Material';
import AddRMImport from './AddRMImport';
import RMDomesticListing from './RMDomesticListing';
import RMImportListing from './RMImportListing';

import { checkPermission } from '../../../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { RAW_MATERIAL } from '../../../../../config/constants';
import { loggedInUserId } from '../../../../../helper';
import { getLeftMenu, } from '../../../../../actions/auth/AuthActions';

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
        }
    }

    componentDidMount() {
        let ModuleId = reactLocalStorage.get('ModuleId');
        this.props.getLeftMenu(ModuleId, loggedInUserId(), (res) => {
            const { leftMenuData } = this.props;
            if (leftMenuData != undefined) {
                let Data = leftMenuData;
                const accessData = Data && Data.find(el => el.PageName == RAW_MATERIAL)
                const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

                if (permmisionData != undefined) {
                    this.setState({
                        ViewRMAccessibility: permmisionData && permmisionData.View ? permmisionData.View : false,
                        AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
                        EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
                        DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
                        DownloadAccessibility: permmisionData && permmisionData.Download ? permmisionData.Download : false,
                        BulkUploadAccessibility: permmisionData && permmisionData.BulkUpload ? permmisionData.BulkUpload : false,
                    })
                }
            }
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

    displayDomesticForm = () => {
        this.setState({ isRMDomesticForm: true, })
    }

    displayImportForm = () => {
        this.setState({ isRMImportForm: true, })
    }

    hideForm = () => {
        this.setState({ isRMDomesticForm: false, isRMImportForm: false, data: {} })
    }

    getDetails = (data) => {
        this.setState({ isRMDomesticForm: true, data: data })
    }

    getDetailsImport = (data) => {
        this.setState({ isRMImportForm: true, data: data })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isRMDomesticForm, isRMImportForm, data, ViewRMAccessibility } = this.state;

        if (isRMDomesticForm === true) {
            return <AddRMDomestic
                data={data}
                hideForm={this.hideForm}
            />
        }

        if (isRMImportForm === true) {
            return <AddRMImport
                data={data}
                hideForm={this.hideForm}
            />
        }

        return (
            <Container fluid>
                {/* {this.props.loading && <Loader/>} */}
                <Row>
                    <Col sm="4">
                        <h1>{`${CONSTANT.MATERIAL} ${CONSTANT.MASTER}`}</h1>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <div>
                            <Nav tabs className="subtabs">
                                {ViewRMAccessibility && <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                        Manage Raw Material (Domestic)
                                </NavLink>
                                </NavItem>}
                                {ViewRMAccessibility && <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                        Manage Raw Material (Import)
                                </NavLink>
                                </NavItem>}
                                {ViewRMAccessibility && <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '3' })} onClick={() => { this.toggle('3'); }}>
                                        Manage Specification
                                </NavLink>
                                </NavItem>}
                                {ViewRMAccessibility && <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '4' })} onClick={() => { this.toggle('4'); }}>
                                        Manage Material
                                </NavLink>
                                </NavItem>}
                            </Nav>

                            <TabContent activeTab={this.state.activeTab}>

                                {this.state.activeTab == 1 && ViewRMAccessibility &&
                                    <TabPane tabId="1">
                                        <RMDomesticListing
                                            formToggle={this.displayDomesticForm}
                                            getDetails={this.getDetails}
                                            toggle={this.toggle}
                                            AddAccessibility={this.state.AddAccessibility}
                                            EditAccessibility={this.state.EditAccessibility}
                                            DeleteAccessibility={this.state.DeleteAccessibility}
                                            BulkUploadAccessibility={this.state.BulkUploadAccessibility}
                                        />
                                    </TabPane>}

                                {this.state.activeTab == 2 && ViewRMAccessibility &&
                                    <TabPane tabId="2">
                                        <RMImportListing
                                            formToggle={this.displayImportForm}
                                            getDetails={this.getDetailsImport}
                                            toggle={this.toggle}
                                            AddAccessibility={this.state.AddAccessibility}
                                            EditAccessibility={this.state.EditAccessibility}
                                            DeleteAccessibility={this.state.DeleteAccessibility}
                                            BulkUploadAccessibility={this.state.BulkUploadAccessibility}
                                        />
                                    </TabPane>}

                                {this.state.activeTab == 3 && ViewRMAccessibility &&
                                    <TabPane tabId="3">
                                        <SpecificationListing
                                            toggle={this.toggle}
                                            AddAccessibility={this.state.AddAccessibility}
                                            EditAccessibility={this.state.EditAccessibility}
                                            DeleteAccessibility={this.state.DeleteAccessibility}
                                            BulkUploadAccessibility={this.state.BulkUploadAccessibility}
                                        />
                                    </TabPane>}

                                {this.state.activeTab == 4 && ViewRMAccessibility &&
                                    <TabPane tabId="4">
                                        <RMListing
                                            AddAccessibility={this.state.AddAccessibility}
                                            EditAccessibility={this.state.EditAccessibility}
                                            DeleteAccessibility={this.state.DeleteAccessibility}
                                        //BulkUploadAccessibility={this.state.BulkUploadAccessibility}
                                        />
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
    const { leftMenuData, loading } = auth;
    return { leftMenuData, loading }
}


export default connect(
    mapStateToProps, {
    getRowMaterialDataAPI,
    getLeftMenu,
})(RowMaterialMaster);

