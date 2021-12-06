import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, } from "reactstrap";
import classnames from 'classnames';
import AddFuel from './AddFuel';
import AddPower from './AddPower';
import FuelListing from './FuelListing';
import PowerListing from './PowerListing';
import { ADDITIONAL_MASTERS, FUEL_AND_POWER } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { loggedInUserId } from '../../../helper/auth';

class FuelMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Id: '',
            activeTab: '1',

            isFuelForm: false,
            isPowerForm: false,
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
            const accessData = Data && Data.Pages.find(el => el.PageName === FUEL_AND_POWER)
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

    displayFuelForm = () => {
        this.setState({ isFuelForm: true, isPowerForm: false, data: {} })
    }

    displayPowerForm = () => {
        this.setState({ isPowerForm: true, isFuelForm: false, data: {} })
    }

    hideForm = () => {
        this.setState({ isFuelForm: false, isPowerForm: false, data: {} })
    }

    getDetails = (data) => {
        this.setState({ isFuelForm: true, data: data })
    }

    getDetailsPower = (data) => {
        this.setState({ isPowerForm: true, data: data })
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isFuelForm, isPowerForm, data } = this.state;

        if (isFuelForm === true) {
            return <AddFuel
                data={data}
                hideForm={this.hideForm}
            />
        }

        if (isPowerForm === true) {
            return <AddPower
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
                            <h1>{`Fuel & Power Master`}</h1>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <div>
                                <Nav tabs className="subtabs mt-0">
                                    <NavItem>
                                        <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                            Manage Fuel
                                        </NavLink>
                                    </NavItem>
                                    <NavItem>
                                        <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                            Manage Power
                                        </NavLink>
                                    </NavItem>

                                </Nav>

                                <TabContent activeTab={this.state.activeTab}>

                                    {this.state.activeTab == 1 &&
                                        <TabPane tabId="1">
                                            <FuelListing
                                                formToggle={this.displayFuelForm}
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
                                            <PowerListing
                                                formToggle={this.displayPowerForm}
                                                getDetails={this.getDetailsPower}
                                                AddAccessibility={this.state.AddAccessibility}
                                                EditAccessibility={this.state.EditAccessibility}
                                                DeleteAccessibility={this.state.DeleteAccessibility}
                                                BulkUploadAccessibility={this.state.BulkUploadAccessibility}
                                                DownloadAccessibility={this.state.DownloadAccessibility}
                                            />
                                        </TabPane>}

                                </TabContent>
                            </div>
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
function mapStateToProps({ auth }) {
    const { leftMenuData, loading, topAndLeftMenuData } = auth;
    return { leftMenuData, loading, topAndLeftMenuData }
}


export default connect(mapStateToProps, {})(FuelMaster);

