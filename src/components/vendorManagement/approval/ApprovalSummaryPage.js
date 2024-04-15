import React, { Fragment, useEffect, useState } from 'react';
import { Button, Col, Row, Table } from 'reactstrap';
import ApprovalWorkFlow from '../../costing/components/approval/ApprovalWorkFlow'
import { useDispatch, useSelector } from 'react-redux';
import { fetchApprovalData } from '../Action';
import MasterSendForApproval from './MasterSendForApproval';

const ApprovalSummaryPage = (props) => {

    const { approvalData, data } = props.history.location.state;
    const dispatch = useDispatch();
    const [rejectDrawer, setRejectDrawer] = useState(false)
    const [approvalDrawer, setApprovalDrawer] = useState(false)
    const [dataForFetchingAllApprover, setDataForFetchingAllApprover] = useState({})
    // const [approvalLevelStep, setApprovalLevelStep] = useState([])
    const approvalSummary = useSelector(state => state?.vendorManagement?.approvalSummary); // assuming approvals and isLoading are stored in the redux state

    useEffect(() => {
        dispatch(fetchApprovalData())
    }, []); // Make sure to include dispatch in the dependency array

    // 
    // const approvalTokenData = data.filter(item => item.ApprovalNumber === 'ApprovalToken');
    // if (approvalTokenData.length > 0) {
    //     return approvalTokenData;
    // }
    // 


    // const { approvalData, approvaToken } = props;
    // 
    // const approvalSummaryHandler = () => {
    //     setApprovalLevelStep(ApprovalLevelStep)
    // }
    const sendForApproval = () => {

    }
    const closeApproveRejectDrawer = () => {
        setRejectDrawer(false);
        setApprovalDrawer(false);
    };
    const isDisable = false; // Set this based on your condition

    return (
        <div className="approval-summary-page-container">
            <div className="container-fluid">
                <h2 className="heading-main">Approval Summary1</h2>
                <Row>
                    <Col md="8">
                        <div className="left-border">
                            {'Approval Workflow (Approval No. '}
                            {`${approvalSummary?.approvalNo}):`}
                        </div>
                    </Col>
                    <Col md="4" className="text-right">
                        <div className="right-border">
                            {/* You can add buttons here if needed */}
                        </div>
                    </Col>
                </Row>

                {/* Code for approval workflow */}
                {/* <ApprovalWorkFlow approvalLevelStep={approvalSummary?.approvalLevelStep} approvalNo={approvalSummary?.approvalNo} approverData={approvalSummary?.approverData} /> */}

                <Row>
                    <Col md="8">
                        <div className="left-border">
                            {'Supplier Classification'}
                        </div>
                    </Col>
                </Row>

                <Table>
                    <thead>
                        <tr>
                            <th>Supplier Code</th>
                            <th>Supplier Category</th>
                            <th>Plant</th>
                            <th>Division</th>
                            <th>Supplier Classification</th>
                            <th>LPS Rating</th>
                            <th>Request ID</th>
                            <th>Approval For Duration</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>2345</td>
                            <td>Plant X</td>
                            <td>Division Name</td>
                            <td>No New Business</td>
                            <td>LPS 3</td>
                            <td>1234</td>
                            <td>User</td>
                            <td>12 Months</td>
                        </tr>
                        <tr>
                            <td colSpan="8">
                                <div className="box">
                                    <p>Approval For Duration</p>
                                    <p>12 Months</p>
                                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                                    <p>Ram Singh (22)</p>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan="8">
                                <div className="box">
                                    <p>Remark</p>
                                    <p>Reason Near to Factory</p>
                                </div>
                            </td>
                        </tr>
                        {/* Add more rows here with dynamic data */}
                    </tbody>
                </Table>
            </div>

            {/* Send for approval button */}
            <Row className="sf-btn-footer no-gutters drawer-sticky-btn justify-content-between">
                <div className="col-sm-12 text-right bluefooter-butn ml-0">
                    <Fragment>
                        <button type={'button'} className="mr5 approve-reject-btn" onClick={() => setRejectDrawer(true)} >
                            <div className={'cancel-icon-white mr5'}></div>
                            {'Reject'}
                        </button>
                        <button type="button" className="approve-button mr5 approve-hover-btn" onClick={() => setApprovalDrawer(true)}>
                            <div className={'save-icon'}></div>
                            {'Approve'}
                        </button>
                    </Fragment>
                </div>
            </Row>
            {
                (approvalDrawer || rejectDrawer) &&
                <MasterSendForApproval
                    isOpen={approvalDrawer ? approvalDrawer : rejectDrawer}
                    closeDrawer={closeApproveRejectDrawer}
                    isDisable={isDisable}
                    anchor={'right'}
                    type={approvalDrawer ? 'Approve' : 'Reject'}
                    // masterId={BOP_MASTER_ID}
                    isBulkUpload={true}
                    approvalData={approvalSummary}


                // approvalDetails={approvalDetails}
                // type={approvalDrawer ? 'Approve' : 'Reject'}
                // anchor={'right'}
                // masterId={approvalDetails.MasterId}
                // masterPlantId={mastersPlantId}
                // closeDrawer={closeApproveRejectDrawer}
                // IsFinalLevelButtonShow={finalLevelUser}
                // costingTypeId={costingTypeId}
                // levelDetails={levelDetails}
                />
            }

        </div>
    );

};

export default ApprovalSummaryPage;
