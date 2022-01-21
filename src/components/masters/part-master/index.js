import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TabContent, TabPane, Nav, NavItem, NavLink, Row, Col } from "reactstrap";
import classnames from 'classnames';
import AddAssemblyPart from './AddAssemblyPart';
import AddIndivisualPart from './AddIndivisualPart';
import AssemblyPartListing from './AssemblyPartListing';
import IndivisualPartListing from './IndivisualPartListing';
import { MASTERS, PART } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';
import IndivisualProductListing from './IndivisualProductListing';
import AddIndivisualProduct from './AddIndivisualProduct';
import FetchDrawer from './FetchBOMDrawer'
import ScrollToTop from '../../common/ScrollToTop';

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
            openDrawer: false,
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

    toggleFetchDrawer = () => {

        this.setState({
            openDrawer: false
        });
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

    //Open the Fetch Drawer

    openFetchDrawer = () => {
        this.setState({ openDrawer: true })

    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isAddBOMForm, isPartForm, isProductForm } = this.state;
        const { initialConfiguration } = this.props;
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
                <div className="container-fluid" id='go-to-top'>
                    <ScrollToTop pointProp="go-to-top" />
                    <div className="user-page p-0">
                        {/* {this.props.loading && <Loader/>} */}
                        <div>
                            <div className="d-flex justify-content-between">
                                <h1>Part Master</h1>
                                <button
                                    type="button"
                                    className={'user-btn mr5 mt-1'}
                                    title="Fetch"
                                    onClick={this.openFetchDrawer}>
                                    <div className={'swap mr-0'}></div></button>
                            </div>


                            <Nav tabs className="subtabs mt-0">
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                        Manage Assembly
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                        Manage Component
                                    </NavLink>
                                </NavItem>
                                {/* {getConfigurationKey().IsVendorPlantConfigurable && <NavItem> */}
                                {initialConfiguration?.IsProductMasterConfigurable &&
                                    <NavItem>
                                        <NavLink className={classnames({ active: this.state.activeTab === '3' })} onClick={() => { this.toggle('3'); }}>
                                            Manage Products
                                        </NavLink>
                                    </NavItem>
                                }
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
                                            ViewAccessibility={this.state.ViewAccessibility}
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
                                            ViewAccessibility={this.state.ViewAccessibility}
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
                                            ViewAccessibility={this.state.ViewAccessibility}
                                        />
                                    </TabPane>}
                            </TabContent>


                            {this.state.openDrawer &&
                                <FetchDrawer

                                    isOpen={this.state.openDrawer}
                                    toggleDrawer={this.toggleFetchDrawer}
                                    anchor={"right"}


                                />

                            }
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
    const { leftMenuData, topAndLeftMenuData, initialConfiguration } = auth;
    return { leftMenuData, topAndLeftMenuData, initialConfiguration }
}


export default connect(mapStateToProps,
    {
    }
)(PartMaster);

