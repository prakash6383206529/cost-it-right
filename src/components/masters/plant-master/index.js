import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Container, Col, TabContent, TabPane, Nav, NavItem, NavLink, } from "reactstrap";
import classnames from 'classnames';
import ZBCPlantListing from './ZBCPlantListing';
import VBCPlantListing from './VBCPlantListing';
import { checkPermission } from '../../../helper/util';
import { MASTERS, PLANT } from '../../../config/constants';
import ScrollToTop from '../../common/ScrollToTop';

class PlantMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            activeTab: '1',
            ViewAccessibility: false,
            AddAccessibility: false,
            EditAccessibility: false,
            DeleteAccessibility: false,
            BulkUploadAccessibility: false,
            ActivateAccessibility: false,
            DownloadAccessibility: false,
            stateUpdated: false,
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
            const accessData = Data && Data.Pages.find(el => el.PageName === PLANT)
            const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

            if (permmisionData !== undefined) {

                this.setState({
                    ViewAccessibility: permmisionData && permmisionData.View ? permmisionData.View : false,
                    AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
                    EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
                    DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
                    BulkUploadAccessibility: permmisionData && permmisionData.BulkUpload ? permmisionData.BulkUpload : false,
                    ActivateAccessibility: permmisionData && permmisionData.Activate ? permmisionData.Activate : false,
                    DownloadAccessibility: permmisionData && permmisionData.Download ? permmisionData.Download : false,
                }, () => {
                    this.setState({
                        stateUpdated: true

                    })

                });
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
                activeTab: tab,
                stopApiCallOnCancel: false
            });
        }
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { initialConfiguration } = this.props;
        return (
            <>
                <Container fluid className="user-page p-0" id='go-to-top'>
                    {/* {this.props.loading && <Loader/>} */}
                    <ScrollToTop pointProp="go-to-top" />
                    <Col>
                        <Nav tabs className="subtabs">
                            <NavItem>
                                <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                    ZBC
                                </NavLink>
                            </NavItem>
                            {initialConfiguration && initialConfiguration?.IsVendorPlantConfigurable && <NavItem>
                                <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                    VBC
                                </NavLink>
                            </NavItem>}
                        </Nav>


                        <TabContent activeTab={this.state.activeTab}>
                            {this.state.activeTab === '1' &&
                                <TabPane tabId="1">
                                    {this.state.stateUpdated &&
                                        <ZBCPlantListing
                                            AddAccessibility={this.state.AddAccessibility}
                                            EditAccessibility={this.state.EditAccessibility}
                                            DeleteAccessibility={this.state.DeleteAccessibility}
                                            BulkUploadAccessibility={this.state.BulkUploadAccessibility}
                                            ActivateAccessibility={this.state.ActivateAccessibility}
                                            DownloadAccessibility={this.state.DownloadAccessibility}
                                            ViewAccessibility={this.state.ViewAccessibility}

                                        />
                                    }
                                </TabPane>}
                            {initialConfiguration && initialConfiguration?.IsVendorPlantConfigurable && this.state.activeTab === '2' &&
                                <TabPane tabId="2">
                                    {this.state.stateUpdated &&
                                        <VBCPlantListing
                                            AddAccessibility={this.state.AddAccessibility}
                                            EditAccessibility={this.state.EditAccessibility}
                                            DeleteAccessibility={this.state.DeleteAccessibility}
                                            BulkUploadAccessibility={this.state.BulkUploadAccessibility}
                                            ActivateAccessibility={this.state.ActivateAccessibility}
                                            DownloadAccessibility={this.state.DownloadAccessibility}
                                            ViewAccessibility={this.state.ViewAccessibility}
                                        />
                                    }
                                </TabPane>}
                        </TabContent>


                    </Col>

                </Container >
            </ >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ comman, auth }) {
    const { loading, } = comman;
    const { leftMenuData, initialConfiguration, topAndLeftMenuData } = auth;
    return { loading, leftMenuData, initialConfiguration, topAndLeftMenuData };
}

export default connect(mapStateToProps,
    {
    }
)(PlantMaster);
