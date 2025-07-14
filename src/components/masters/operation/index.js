import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, TabContent, TabPane, Nav, NavItem, NavLink, } from "reactstrap";
import classnames from 'classnames';
import OperationListing from './OperationListing';
import AddOperation from './AddOperation';
import ScrollToTop from '../../common/ScrollToTop';
import { CheckApprovalApplicableMaster } from '../../../helper';
import { APPROVAL_CYCLE_STATUS_MASTER, OPERATIONS_ID } from '../../../config/constants';
//MINDA
// import { APPROVED_STATUS_MASTER, OPERATIONS_ID } from '../../../config/constants';
import CommonApproval from '../material-master/CommonApproval';
import { MESSAGES } from '../../../config/message';
import { resetStatePagination } from '../../common/Pagination/paginationAction';

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
            stopAPICall: false,
            isImport: false
        }
    }

    displayOperationForm = () => {
        this.setState({ isOperation: true, data: { isEditFlag: false } })
    }

    hideForm = (type, isImport) => {
        this.setState({ isOperation: false, data: {}, stopAPICall: false, isImport: isImport })
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
            this.props.resetStatePagination(); // Dispatching the action
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
                        <Col>
                            {/* {Object.keys(permissions).length > 0 && ( */}

                            <div>
                                <Nav tabs className="subtabs mt-0 p-relative">
                                    {this.props.disabledClass && <div title={MESSAGES.DOWNLOADING_MESSAGE} className="disabled-overflow"></div>}

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
                                                isMasterSummaryDrawer={false}
                                                selectionForListingMasterAPI='Master'
                                                stopAPICall={this.state.stopAPICall}
                                                approvalStatus={APPROVAL_CYCLE_STATUS_MASTER}
                                                isImport={this.state.isImport}
                                            //MINDA
                                            // approvalStatus={APPROVED_STATUS_MASTER}
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
                                                OnboardingApprovalId={'0'}
                                                BulkDeleteType={'Operation Approval'}

                                            />
                                        </TabPane>}

                                </TabContent>
                            </div>
                            {/* )} */}
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
function mapStateToProps({ auth, comman }) {
    const { leftMenuData, loading, topAndLeftMenuData } = auth;
    const { disabledClass } = comman;
    return { leftMenuData, loading, topAndLeftMenuData, disabledClass }
}
const mapDispatchToProps = (dispatch) => ({
    resetStatePagination: () => dispatch(resetStatePagination())
});

export default connect(mapStateToProps, mapDispatchToProps)(OperationsMaster);

