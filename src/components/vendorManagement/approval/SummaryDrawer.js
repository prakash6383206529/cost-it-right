import React, { Fragment, useEffect, useState } from 'react';
import { Button, Col, Row, Table } from 'reactstrap';
import ApprovalWorkFlow from '../../costing/components/approval/ApprovalWorkFlow'
import { useDispatch, useSelector } from 'react-redux';
import { fetchApprovalData } from '../Action';
import ApproveRejectDrawer from './ApproveRejectDrawer';
import Drawer from '@material-ui/core/Drawer';
import LoaderCustom from '../../common/LoaderCustom';

const ApprovalSummaryPage = (props) => {

    const { approvalData } = props;
    const dispatch = useDispatch();
    const [rejectDrawer, setRejectDrawer] = useState(false)
    const [approvalDrawer, setApprovalDrawer] = useState(false)
    const [loader, setLoader] = useState(false);
    const approvalSummary = useSelector(state => state?.supplierManagement?.approvalSummary); // assuming approvals and isLoading are stored in the redux state


    useEffect(() => {
        dispatch(fetchApprovalData())
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const closeApproveRejectDrawer = () => {
        setRejectDrawer(false);
        setApprovalDrawer(false);
    };
    const isDisable = false; // Set this based on your condition
    const toggleDrawer = (event, type = 'cancel') => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        props.closeDrawer('', type)
    };

    return (
        <div>
            <Drawer className="bottom-drawer" anchor={props.anchor} open={props.isOpen}>
                <div className="container-fluid">
                    <div className={'drawer-wrapper drawer-1500px master-summary-drawer'}>
                        <Row className="drawer-heading sticky-top-0">
                            <Col>
                                <div className={'header-wrapper left'}>
                                    <h3>{`Approval Summary (Token No.${approvalSummary?.approvalNo}):`}</h3>
                                </div>
                                <div
                                    onClick={(e) => toggleDrawer(e)}
                                    className={'close-button right'}>
                                </div>
                            </Col>
                        </Row>
                        {loader ? <LoaderCustom /> :
                            <Row className="mx-0 mb-3">
                                <Col>
                                    {/* Code for approval workflow */}
                                    <ApprovalWorkFlow approvalLevelStep={approvalSummary?.approvalLevelStep} approvalNo={approvalSummary?.approvalNo} approverData={approvalSummary?.approverData} />
                                </Col>
                            </Row>}
                        <Row>
                            <Col md="12">
                                <div className="left-border">{'Approval Details:'}</div>
                            </Col>
                        </Row>

                        <Table>
                            <thead>
                                <tr>
                                    <th>Supplier Code</th>
                                    <th>Supplier Category</th>
                                    <th>Plant</th>
                                    <th>Division</th>
                                    {approvalData?.reasonForRequest === 'Classification' && (<th >Supplier Classification</th>)}
                                    {approvalData?.reasonForRequest === 'LPS' && (<th>LPS Rating</th>)}
                                    <th>Request ID</th>
                                    <th>Approval For Duration</th>
                                    <th>Requested By
                                    </th>
                                    <td >Remarks</td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td >2345</td>
                                    <td>Plant X</td>
                                    <td>Division Name</td>
                                    {approvalData?.reasonForRequest === 'Classification' && (<th >Stragetic</th>)}
                                    {approvalData?.reasonForRequest === 'LPS' && (<td>LPS 3</td>)}
                                    <td>1234</td>
                                    <td>User</td>
                                    <td>12 Months</td>
                                    <td>Ram Singh</td>
                                    <td>...</td>
                                </tr>
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
                </div>
            </Drawer >

            {
                (approvalDrawer || rejectDrawer) &&
                <ApproveRejectDrawer
                    isOpen={approvalDrawer ? approvalDrawer : rejectDrawer}
                    closeDrawer={closeApproveRejectDrawer}
                    isDisable={isDisable}
                    anchor={'right'}
                    type={approvalDrawer ? 'Approve' : 'Reject'}
                    // masterId={BOP_MASTER_ID}
                    isBulkUpload={true}
                    approvalData={approvalSummary}

                />
            }

        </div >
    );

};

export default ApprovalSummaryPage;
