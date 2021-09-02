import React, { Component } from 'react';
import { connect } from 'react-redux';
import { TabContent, TabPane, Nav, NavItem, NavLink, } from "reactstrap";
import classnames from 'classnames';
import AddAssemblyProduct from './AddAssemblyProduct';
import AddIndivisualProduct from './AddIndivisualProduct';
import AssemblyProductListing from './AssemblyProductListing';
import IndivisualProductListing from './IndivisualProductListing';
import { PART } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { loggedInUserId } from '../../../helper/auth';
import { getLeftMenu, } from '../../../actions/auth/AuthActions';

class ProductMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            activeTab: '1',
            isAddBOMForm: false,
            isPartForm: false,
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
        let ModuleId = reactLocalStorage.get('ModuleId');
        this.props.getLeftMenu(ModuleId, loggedInUserId(), (res) => {
            const { leftMenuData } = this.props;
            if (leftMenuData !== undefined) {
                let Data = leftMenuData;
                const accessData = Data && Data.find(el => el.PageName === PART)
                const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)
                console.log(permmisionData, 'permmisionDatapermmisionData')
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
        this.setState({ isAddBOMForm: false, isPartForm: false, getDetails: {}, })
    }

    //DISPLAY INDIVIDUAL PART FORM
    displayIndividualForm = () => {
        this.setState({ isPartForm: true, isAddBOMForm: false, getDetails: {} })
    }

    //GET DETAILS OF INDIVIDUAL PART
    getIndividualPartDetails = (data) => {
        this.setState({ getDetails: data, isPartForm: true, isAddBOMForm: false, })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isAddBOMForm, isPartForm, } = this.state;

        if (isAddBOMForm === true) {
            return <AddAssemblyProduct
                hideForm={this.hideForm}
                data={this.state.getDetails}
                displayBOMViewer={this.displayBOMViewer}
            />
        }

        if (isPartForm === true) {
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
                            <h1>Product Master</h1>
                            <Nav tabs className="subtabs mt-0">
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                        Manage Assembly Product
                                </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                        Manage Component/Product
                                </NavLink>
                                </NavItem>
                            </Nav>
                            <TabContent activeTab={this.state.activeTab}>
                                {this.state.activeTab === '1' &&
                                    <TabPane tabId="1">
                                        <AssemblyProductListing
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
                                        <IndivisualProductListing
                                            formToggle={this.displayIndividualForm}
                                            getDetails={this.getIndividualPartDetails}
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
    const { leftMenuData } = auth;
    return { leftMenuData }
}


export default connect(mapStateToProps,
    {
        getLeftMenu
    }
)(ProductMaster);

