import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TabContent, TabPane, Nav, NavItem, NavLink, } from "reactstrap";
import classnames from 'classnames';
import AddAssemblyPart from './AddAssemblyPart';
import AddIndivisualPart from './AddIndivisualPart';
import AssemblyPartListing from './AssemblyPartListing';
import IndivisualPartListing from './IndivisualPartListing';
import { MASTERS, PART } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { loggedInUserId } from '../../../helper/auth';
import { getLeftMenu, } from '../../../actions/auth/AuthActions';
import IndivisualProductListing from './IndivisualProductListing';
import AddIndivisualProduct from './AddIndivisualProduct';

class PartMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            activeTab: '1',
            isAddBOMForm: false,
            isPartForm: false,
            isProductForm: false,
            getDetails: {},

            ViewAccessibility: false,
            AddAccessibility: false,
            EditAccessibility: false,
            DeleteAccessibility: false,
            BulkUploadAccessibility: false,
            DownloadAccessibility: false,

        }
    }

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
            const accessData = Data && Data.Pages.find(el => el.PageName === PART)
            const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

            if (permmisionData !== undefined) {
                this.setState({
                    ViewAccessibility: permmisionData && permmisionData.View ? permmisionData.View : false,
                    AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
                    EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
                    DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
                    BulkUploadAccessibility: permmisionData && permmisionData.BulkUpload ? permmisionData.BulkUpload : false,
                    DownloadAccessibility: permmisionData && permmisionData.Download ? permmisionData.Download : false,
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

    // DISPLAY BOM FORM
    displayForm = () => {
        this.setState({ isAddBOMForm: true, isPartForm: false, getDetails: {} })
    }

    //GET DETAILS OF BOM 
    getDetails = (data) => {
        this.setState({ getDetails: data, isAddBOMForm: true, isPartForm: false, })
    }

    //HIDE BOM & PART INDIVIDUAL FORM
    hideForm = () => {
        this.setState({ isAddBOMForm: false, isPartForm: false, isProductForm: false, getDetails: {}, })
    }

    //DISPLAY INDIVIDUAL PART FORM
    displayIndividualForm = () => {
        this.setState({ isPartForm: true, isAddBOMForm: false, getDetails: {} })
    }

    //GET DETAILS OF INDIVIDUAL PART
    getIndividualPartDetails = (data) => {
        this.setState({ getDetails: data, isPartForm: true, isAddBOMForm: false, })
    }

    //DISPLAY INDIVIDUAL PART FORM
    displayIndividualProductForm = () => {
        this.setState({ isProductForm: true, getDetails: {} })
    }

    //GET DETAILS OF INDIVIDUAL PART
    getIndividualProductDetails = (data) => {
        this.setState({ getDetails: data, isProductForm: true, isAddBOMForm: false, })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isAddBOMForm, isPartForm, isProductForm } = this.state;

        if (isAddBOMForm === true) {
            return <AddAssemblyPart
                hideForm={this.hideForm}
                data={this.state.getDetails}
                displayBOMViewer={this.displayBOMViewer}
            />
        }

        if (isPartForm === true) {
            return <AddIndivisualPart
                hideForm={this.hideForm}
                data={this.state.getDetails}
            />
        }

        if (isProductForm === true) {
            return <AddIndivisualProduct
                hideForm={this.hideForm}
                data={this.state.getDetails}
            />
        }

        return (
            <>
                <div className="container-fluid">
                    <div className="user-page p-0">
                        {/* {this.props.loading && <Loader/>} */}
                        <div>
                            <h1>Part Master</h1>
                            <Nav tabs className="subtabs mt-0">
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                        Manage Assembly Part
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                        Manage Component/Part
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '3' })} onClick={() => { this.toggle('3'); }}>
                                        Manage Products
                                </NavLink>
                                </NavItem>
                            </Nav>
                            <TabContent activeTab={this.state.activeTab}>
                                {this.state.activeTab === '1' &&
                                    <TabPane tabId="1">
                                        <AssemblyPartListing
                                            displayForm={this.displayForm}
                                            getDetails={this.getDetails}
                                            AddAccessibility={this.state.AddAccessibility}
                                            EditAccessibility={this.state.EditAccessibility}
                                            DeleteAccessibility={this.state.DeleteAccessibility}
                                            BulkUploadAccessibility={this.state.BulkUploadAccessibility}
                                            DownloadAccessibility={this.state.DownloadAccessibility}
                                        />
                                    </TabPane>}
                                {this.state.activeTab === '2' &&
                                    <TabPane tabId="2">
                                        <IndivisualPartListing
                                            formToggle={this.displayIndividualForm}
                                            getDetails={this.getIndividualPartDetails}
                                            AddAccessibility={this.state.AddAccessibility}
                                            EditAccessibility={this.state.EditAccessibility}
                                            DeleteAccessibility={this.state.DeleteAccessibility}
                                            BulkUploadAccessibility={this.state.BulkUploadAccessibility}
                                            DownloadAccessibility={this.state.DownloadAccessibility}
                                        />
                                    </TabPane>}
                                {this.state.activeTab === '3' &&
                                    <TabPane tabId="3">
                                        <IndivisualProductListing
                                            formToggle={this.displayIndividualProductForm}
                                            getDetails={this.getIndividualProductDetails}
                                            AddAccessibility={this.state.AddAccessibility}
                                            EditAccessibility={this.state.EditAccessibility}
                                            DeleteAccessibility={this.state.DeleteAccessibility}
                                            BulkUploadAccessibility={this.state.BulkUploadAccessibility}
                                            DownloadAccessibility={this.state.DownloadAccessibility}
                                        />
                                    </TabPane>}
                            </TabContent>
                        </div>
                    </div >
                </div>
            </ >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ auth }) {
    const { leftMenuData, topAndLeftMenuData } = auth;
    return { leftMenuData, topAndLeftMenuData }
}


export default connect(mapStateToProps,
    {
        getLeftMenu
    }
)(PartMaster);

