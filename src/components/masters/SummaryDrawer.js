import React, { useState, useEffect } from 'react';
import ApprovalWorkFlow from '../costing/components/approval/ApprovalWorkFlow';
import RMDomesticListing from './material-master/RMDomesticListing';
import Drawer from '@material-ui/core/Drawer';
import { useForm, Controller } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, } from 'reactstrap';
import { getMasterApprovalSummary } from './actions/Material';
import { Fragment } from 'react';
import MasterSendForApproval from './MasterSendForApproval';
import LoaderCustom from '../common/LoaderCustom';

function SummaryDrawer(props) {
    const { approvalData } = props

    const dispatch = useDispatch()


    /**
    * @method toggleDrawer
    * @description TOGGLE DRAWER
    */
    const toggleDrawer = (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        props.closeDrawer('')
    };


    const cancel = () => {
        props.closeDrawer('')
    }

    const [approvalLevelStep, setApprovalLevelStep] = useState([])
    const [approvalDetails, setApprovalDetails] = useState({})
    const [approvalDrawer, setApprovalDrawer] = useState(false)
    const [rejectDrawer, setRejectDrawer] = useState(false)
    const [loader, setLoader] = useState(true)


    useEffect(() => {
        dispatch(getMasterApprovalSummary(approvalData.approvalNumber, approvalData.approvalProcessId, res => {
            console.log(res, "REPONSE");
            const Data = res.data.Data
            setApprovalLevelStep(Data.MasterSteps)
            setApprovalDetails({ IsSent: Data.IsSent, IsFinalLevelButtonShow: Data.IsFinalLevelButtonShow, ApprovalProcessId: Data.ApprovalProcessId, MasterApprovalProcessSummaryId: Data.ApprovalProcessSummaryId, Token: Data.Token, MasterId: Data.MasterId })
            setLoader(false)
        }))
    }, [])
    // const [approvalData, setApprovalData] = useState('')

    const closeApproveRejectDrawer = (e, type) => {
        setApprovalDrawer(false)
        setRejectDrawer(false)
        if (type === 'submit') {
            cancel()
        }
    }

    return (
        <div>
            <Drawer className="bottom-drawer" anchor={props.anchor} open={props.isOpen}>
                <div className="container-fluid">
                    <div className={'drawer-wrapper drawer-1500px'}>
                        <Row className="drawer-heading sticky-top-0">
                            <Col>
                                <div className={'header-wrapper left'}>
                                    <h3>{'Master Summary'}</h3>
                                </div>
                                <div
                                    onClick={(e) => toggleDrawer(e)}
                                    className={'close-button right'}>
                                </div>
                            </Col>
                        </Row>
                        {loader && <LoaderCustom />}
                        <Row className="mx-0 mb-3">
                            <Col>
                                <ApprovalWorkFlow approvalLevelStep={approvalLevelStep} approvalNo={approvalData.ApprovalNumber} />

                                <RMDomesticListing isMasterSummaryDrawer={true} />


                            </Col>
                        </Row>
                        {
                            !approvalDetails.IsSent &&
                            <Row className="sf-btn-footer no-gutters justify-content-between">
                                <div className="col-sm-12 text-right bluefooter-butn">
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
                        }
                    </div>
                </div>

            </Drawer>

            {
                (approvalDrawer || rejectDrawer) &&
                <MasterSendForApproval
                    isOpen={approvalDrawer ? approvalDrawer : rejectDrawer}
                    approvalDetails={approvalDetails}
                    type={approvalDrawer ? 'Approve' : 'Reject'}
                    anchor={'right'}
                    masterId={approvalDetails.MasterId}
                    closeDrawer={closeApproveRejectDrawer}
                    IsFinalLevelButtonShow={approvalDetails.IsFinalLevelButtonShow}
                />
            }
        </div>
    );
}

export default SummaryDrawer;