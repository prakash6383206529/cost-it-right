import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, } from "reactstrap";
import classnames from 'classnames';
import AddFreight from './AddFreight';
import AddPackaging from './AddPackaging';
import FreightListing from './FreightListing';
import PackagListing from './PackagListing';
import { ADDITIONAL_MASTERS, FREIGHT } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { loggedInUserId } from '../../../helper/auth';

class FreightMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeTab: '1',
            isFreightForm: false,
            isPackageForm: false,
            data: {},

            ViewAccessibility: false,
            AddAccessibility: false,
            EditAccessibility: false,
            DeleteAccessibility: false,
            BulkUploadAccessibility: false,
            DownloadAccessibility: false
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
            const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === ADDITIONAL_MASTERS);
            const accessData = Data && Data.Pages.find(el => el.PageName === FREIGHT)
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

    /**
    * @method displayFreightForm
    * @description DISPLAY FREIGHT FORM
    */
    displayFreightForm = () => {
        this.setState({ isFreightForm: true, isPackageForm: false, data: {} })
    }

    /**
    * @method displayPackagForm
    * @description DISPLAY PACKAGING FORM
    */
    displayPackagForm = () => {
        this.setState({ isFreightForm: false, isPackageForm: true, data: {} })
    }

    /**
    * @method hideForm
    * @description HIDE FREIGHT AND PACKAGING FORMS
    */
    hideForm = () => {
        this.setState({ isFreightForm: false, isPackageForm: false, data: {} })
    }

    /**
    * @method getDetails
    * @description GET DETAILS FOR FREIGHT FORM
    */
    getDetails = (data) => {
        this.setState({ isFreightForm: true, data: data })
    }

    /**
    * @method getPackaingDetails
    * @description GET DETAILS FOR PACKAGING FORM
    */
    getPackaingDetails = (data) => {
        this.setState({ isPackageForm: true, data: data })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isFreightForm, isPackageForm, data, } = this.state;

        if (isFreightForm === true) {
            return <AddFreight
                data={data}
                hideForm={this.hideForm}
            />
        }

        if (isPackageForm === true) {
            return <AddPackaging
                data={data}
                hideForm={this.hideForm}
            />
        }

        return (
            <>
                <div className="container-fluid">
                    {/* {this.props.loading && <Loader/>} */}
                    <Row>
                        <Col sm="4">
                            {/* <h1>{`Freight & Packaging Master`}</h1> */}
                            <h1>{`Freight Master`}</h1>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <Nav tabs className="subtabs mt-0">
                                <NavItem>
                                    <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                        Manage Freight
                                    </NavLink>
                                </NavItem>
                                {/* <NavItem>
                                <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                    Manage Packaging
                                </NavLink>
                            </NavItem> */}
                            </Nav>

                            <TabContent activeTab={this.state.activeTab}>

                                {this.state.activeTab == 1 &&
                                    <TabPane tabId="1">
                                        <FreightListing
                                            displayForm={this.displayFreightForm}
                                            getDetails={this.getDetails}
                                            AddAccessibility={this.state.AddAccessibility}
                                            EditAccessibility={this.state.EditAccessibility}
                                            DeleteAccessibility={this.state.DeleteAccessibility}
                                            DownloadAccessibility={this.state.DownloadAccessibility}
                                        />
                                    </TabPane>}

                                {this.state.activeTab == 2 &&
                                    <TabPane tabId="2">
                                        <PackagListing
                                            displayForm={this.displayPackagForm}
                                            getDetails={this.getPackaingDetails}
                                        />
                                    </TabPane>}
                            </TabContent>

                        </Col>
                    </Row>
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
function mapStateToProps({ boughtOutparts, auth }) {
    const { BOPListing, loading } = boughtOutparts;
    const { leftMenuData, topAndLeftMenuData } = auth;
    return { BOPListing, leftMenuData, loading, topAndLeftMenuData }
}


export default connect(mapStateToProps, {})(FreightMaster);

