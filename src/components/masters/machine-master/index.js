import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, } from "reactstrap";
import classnames from 'classnames';
import MachineRateListing from './MachineRateListing';
import AddMachineRate from './AddMachineRate';
import AddMoreDetails from './AddMoreDetails';
import ProcessListing from './ProcessListing';
import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { MACHINE, MASTERS, } from '../../../config/constants';
import { loggedInUserId } from '../../../helper';
import { getLeftMenu, } from '../../../actions/auth/AuthActions';

class MachineMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: '1',
            isMachineRateForm: false,
            isAddMoreDetails: false,
            isProcessForm: false,
            data: {},
            editDetails: {},

            ViewAccessibility: false,
            AddAccessibility: false,
            EditAccessibility: false,
            DeleteAccessibility: false,
            DownloadAccessibility: false,
            BulkUploadAccessibility: false,
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
            const accessData = Data && Data.Pages.find(el => el.PageName === MACHINE)
            const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

            if (permmisionData !== undefined) {
                this.setState({
                    ViewAccessibility: permmisionData && permmisionData.View ? permmisionData.View : false,
                    AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
                    EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
                    DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
                    DownloadAccessibility: permmisionData && permmisionData.Download ? permmisionData.Download : false,
                    BulkUploadAccessibility: permmisionData && permmisionData.BulkUpload ? permmisionData.BulkUpload : false,
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
    * @method displayForm
    * @description DISPLAY MACHINE FORM
    */
    displayForm = () => {
        this.setState({
            isMachineRateForm: true,
            isAddMoreDetails: false,
            editDetails: { isEditFlag: false }
        })
    }

    /**
    * @method getDetails
    * @description DISPLAY MACHINE FORM
    */
    getDetails = (data) => {
        this.setState({
            isMachineRateForm: true,
            isAddMoreDetails: false,
            editDetails: data,
        })
    }

    /**
    * @method setData
    * @description SET DATA FOR EDIT MACHINE FORM
    */
    setData = (data = {}) => {
        this.setState({ data: data })
    }

    /**
    * @method hideForm
    * @description HIDE MACHINE FORM
    */
    hideForm = () => {
        this.setState({ isMachineRateForm: false, data: {}, editDetails: {} })
    }

    addMoreDetailsData = (data) => {

    }

    /**
    * @method displayMoreDetailsForm
    * @description DISPLAY MORE DETAILS FORM
    */
    displayMoreDetailsForm = (data = {}) => {
        this.setState({
            isAddMoreDetails: true,
            isMachineRateForm: false,
            editDetails: data,
        })
    }

    /**
    * @method hideMoreDetailsForm
    * @description HIDE MORE DETAILS FORM(save and cancel button(more confirmation from Tanmay sir))
    */
    hideMoreDetailsForm = (data = {}, editDetails = {}) => {

        this.setState({
            isAddMoreDetails: false,
            isMachineRateForm: true,
            data: data,
            editDetails: editDetails,
        })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isMachineRateForm, isAddMoreDetails, } = this.state;

        if (isMachineRateForm === true) {
            return <AddMachineRate
                editDetails={this.state.editDetails}
                data={this.state.data}
                setData={this.setData}
                hideForm={this.hideForm}
                displayMoreDetailsForm={this.displayMoreDetailsForm}
                AddAccessibility={this.state.AddAccessibility}
                EditAccessibility={this.state.EditAccessibility}
            />
        }

        if (isAddMoreDetails === true) {
            return <AddMoreDetails
                editDetails={this.state.editDetails}
                data={this.state.data}
                hideMoreDetailsForm={this.hideMoreDetailsForm}
            />
        }

        return (
            <>
                <div className="container-fluid">
                    <Row>
                        <Col sm="4">
                            <h1>{`Machine Master`}</h1>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <div>
                                <Nav tabs className="subtabs mt-0">
                                    <NavItem>
                                        <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                            Machine Rate
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                            Manage Process
                                        </NavLink>
                                    </NavItem>
                                </Nav>

                                <TabContent activeTab={this.state.activeTab}>

                                    {this.state.activeTab == 1 &&
                                        <TabPane tabId="1">
                                            <MachineRateListing
                                                displayForm={this.displayForm}
                                                getDetails={this.getDetails}
                                                AddAccessibility={this.state.AddAccessibility}
                                                EditAccessibility={this.state.EditAccessibility}
                                                DeleteAccessibility={this.state.DeleteAccessibility}
                                                BulkUploadAccessibility={this.state.BulkUploadAccessibility}
                                                DownloadAccessibility={this.state.DownloadAccessibility}
                                            />
                                        </TabPane>}

                                    {this.state.activeTab == 2 &&
                                        <TabPane tabId="2">
                                            <ProcessListing
                                                AddAccessibility={this.state.AddAccessibility}
                                                EditAccessibility={this.state.EditAccessibility}
                                                DeleteAccessibility={this.state.DeleteAccessibility}
                                                DownloadAccessibility={this.state.DownloadAccessibility}
                                            />
                                        </TabPane>}
                                </TabContent>
                            </div>
                        </Col>
                    </Row>
                </div>
            </>
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


export default connect(mapStateToProps,
    { getLeftMenu, }
)(MachineMaster);

