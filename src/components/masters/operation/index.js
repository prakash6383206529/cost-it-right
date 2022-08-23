import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, } from "reactstrap";
import classnames from 'classnames';
import OperationListing from './OperationListing';
import AddOperation from './AddOperation';
import ScrollToTop from '../../common/ScrollToTop';
import { CheckApprovalApplicableMaster } from '../../../helper';
import { OPERATIONS_ID } from '../../../config/constants';
import CommonApproval from '../material-master/CommonApproval';

class OperationsMaster extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Id: '',
            activeTab: '1',
            isOperation: false,
            ViewAccessibility: false,
            AddAccessibility: false,
            EditAccessibility: false,
            DeleteAccessibility: false,
            BulkUploadAccessibility: false,
            DownloadAccessibility: false,
            data: {},
            isOperationAssociated: false,
            stopAPICall: false
        }
    }

    displayOperationForm = () => {
        this.setState({ isOperation: true, data: { isEditFlag: false } })
    }

    hideForm = (type) => {
        this.setState({ isOperation: false, data: {}, stopAPICall: false })
        if (type === 'Cancel') {
            this.setState({ stopAPICall: true })
        }
    }

    getDetails = (data, isOperationAssociate) => {
        this.setState({ isOperation: true, data: data, isOperationAssociated: isOperationAssociate })
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
        const { isOperation, data } = this.state;

        if (isOperation === true) {
            return <AddOperation
                data={data}
                hideForm={this.hideForm}
                isOperationAssociated={this.state.isOperationAssociated}
            />
        }

        return (
            <>
                <div className="container-fluid" id='go-to-top'>
                    {/* {this.props.loading && <Loader/>} */}
                    <ScrollToTop pointProp="go-to-top" />
                    <Row>
                        <Col sm="4">
                            <h1>{`Operation Master`}</h1>
                        </Col>
                    </Row>

                    <Row>
                        <Col>
                            <div>
                                <Nav tabs className="subtabs mt-0">

                                    <NavItem>
                                        <NavLink className={classnames({ active: this.state.activeTab === '1' })} onClick={() => { this.toggle('1'); }}>
                                            Manage Operation
                                        </NavLink>
                                    </NavItem>

                                    {CheckApprovalApplicableMaster(OPERATIONS_ID) && <NavItem>
                                        <NavLink className={classnames({ active: this.state.activeTab === '2' })} onClick={() => { this.toggle('2'); }}>
                                            Approval Status
                                        </NavLink>
                                    </NavItem>}

                                </Nav>

                                <TabContent activeTab={this.state.activeTab}>



                                    {Number(this.state.activeTab) === 1 &&
                                        <TabPane tabId="1">
                                            <OperationListing
                                                formToggle={this.displayOperationForm}
                                                getDetails={this.getDetails}
                                                AddAccessibility={this.state.AddAccessibility}
                                                EditAccessibility={this.state.EditAccessibility}
                                                DeleteAccessibility={this.state.DeleteAccessibility}
                                                BulkUploadAccessibility={this.state.BulkUploadAccessibility}
                                                DownloadAccessibility={this.state.DownloadAccessibility}
                                                isMasterSummaryDrawer={false}
                                                selectionForListingMasterAPI='Master'
                                                stopAPICall={this.state.stopAPICall}
                                            />
                                        </TabPane>}


                                    {Number(this.state.activeTab) === 2 &&
                                        <TabPane tabId="2">
                                            <CommonApproval
                                                AddAccessibility={this.state.AddAccessibility}
                                                EditAccessibility={this.state.EditAccessibility}
                                                DeleteAccessibility={this.state.DeleteAccessibility}
                                                DownloadAccessibility={this.state.DownloadAccessibility}
                                                MasterId={OPERATIONS_ID}
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


export default connect(mapStateToProps, {})(OperationsMaster);

