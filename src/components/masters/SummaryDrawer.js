import React, { useState, useEffect } from 'react';
import ApprovalWorkFlow from '../costing/components/approval/ApprovalWorkFlow';
import RMDomesticListing from './material-master/RMDomesticListing';
import BOPDomesticListing from './bop-master/BOPDomesticListing';
import Drawer from '@material-ui/core/Drawer';
import { useDispatch } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { getMasterApprovalSummary } from './actions/Material';
import { Fragment } from 'react';
import MasterSendForApproval from './MasterSendForApproval';
import LoaderCustom from '../common/LoaderCustom';
import OperationListing from './operation/OperationListing'
import { BOP_MASTER_ID, RM_MASTER_ID, OPERATIONS_ID, MACHINE_MASTER_ID, FILE_URL } from '../../config/constants';
import MachineRateListing from './machine-master/MachineRateListing';

function SummaryDrawer(props) {
    const { approvalData } = props

    const dispatch = useDispatch()
    /**
    * @method toggleDrawer
    * @description TOGGLE DRAWER
    */
    const toggleDrawer = (event, type = 'cancel') => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        props.closeDrawer('', type)
    };


    const cancel = (type) => {
        props.closeDrawer('', type)
    }

    const [approvalLevelStep, setApprovalLevelStep] = useState([])
    const [files, setFiles] = useState([])
    const [approvalDetails, setApprovalDetails] = useState({})
    const [approvalDrawer, setApprovalDrawer] = useState(false)
    const [rejectDrawer, setRejectDrawer] = useState(false)
    const [loader, setLoader] = useState(true)
    const [isRMApproval, setIsRMApproval] = useState(false)
    const [isBOPApproval, setIsBOPApproval] = useState(false)
    const [isOperationApproval, setIsOperationApproval] = useState(false)
    const [isMachineApproval, setIsMachineApproval] = useState(false)
    const [isDataInMaster, setIsDataInMaster] = useState(false)


    useEffect(() => {
        dispatch(getMasterApprovalSummary(approvalData.approvalNumber, approvalData.approvalProcessId, props.masterId, res => {
            const Data = res.data.Data
            setApprovalLevelStep(Data.MasterSteps)
            setApprovalDetails({ IsSent: Data.IsSent, IsFinalLevelButtonShow: Data.IsFinalLevelButtonShow, ApprovalProcessId: Data.ApprovalProcessId, MasterApprovalProcessSummaryId: Data.ApprovalProcessSummaryId, Token: Data.Token, MasterId: Data.MasterId })
            setLoader(false)
            if (Number(props.masterId) === RM_MASTER_ID) {
                setFiles(Data.ImpactedMasterDataList[0].Files)
                Data.ImpactedMasterDataList.length > 0 ? setIsDataInMaster(true) : setIsDataInMaster(false);
            }
            else if (Number(props.masterId) === BOP_MASTER_ID) {
                setFiles(Data.ImpactedMasterDataListBOP[0].Files)
                Data.ImpactedMasterDataListBOP.length > 0 ? setIsDataInMaster(true) : setIsDataInMaster(false);
            } else if (Number(props.masterId) === OPERATIONS_ID) {
                setFiles(Data.ImpactedMasterDataListOperation[0].Files)
                Data.ImpactedMasterDataListOperation.length > 0 ? setIsDataInMaster(true) : setIsDataInMaster(false);
            } else if (Number(props.masterId) === MACHINE_MASTER_ID) {
                setFiles(Data.ImpactedMasterDataListMachine[0].Files)
                Data.ImpactedMasterDataListMachine.length > 0 ? setIsDataInMaster(true) : setIsDataInMaster(false);
            }
            Data.NumberOfMaster > 0 ? setIsDataInMaster(true) : setIsDataInMaster(false);
        }))

        if (Number(props.masterId) === RM_MASTER_ID) {            // MASTER ID 1 FOR RAW MATERIAL
            setIsRMApproval(true)
        }
        else if (Number(props.masterId) === BOP_MASTER_ID) {     // MASTER ID 2 FOR BOP 
            setIsBOPApproval(true)
        } else if (Number(props.masterId) === OPERATIONS_ID) {  // MASTER ID 3 FOR OPERATION
            setIsOperationApproval(true)

        } else if (Number(props.masterId) === MACHINE_MASTER_ID) {  // MASTER ID 4 FOR MACHINE
            setIsMachineApproval(true)
        }


    }, [])
    // const [approvalData, setApprovalData] = useState('')

    const closeApproveRejectDrawer = (e, type) => {
        setApprovalDrawer(false)
        setRejectDrawer(false)
        if (type === 'submit') {
            cancel('submit')
        }
    }

    return (
        <div>
            <Drawer className="bottom-drawer" anchor={props.anchor} open={props.isOpen}>
                <div className="container-fluid">
                    <div className={'drawer-wrapper drawer-1500px master-summary-drawer'}>
                        <Row className="drawer-heading sticky-top-0">
                            <Col>
                                <div className={'header-wrapper left'}>
                                    <h3>{`Master Summary (Token No.${approvalDetails.Token})`}</h3>
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
                                <ApprovalWorkFlow approvalLevelStep={approvalLevelStep} approvalNo={approvalDetails.Token} />


                                {isRMApproval &&
                                    <RMDomesticListing isMasterSummaryDrawer={true} selectionForListingMasterAPI='Master' isDataInMaster={isDataInMaster} />}
                                {isBOPApproval &&
                                    <BOPDomesticListing isMasterSummaryDrawer={true} selectionForListingMasterAPI='Master' isDataInMaster={isDataInMaster} />}

                                {isOperationApproval &&
                                    <OperationListing isMasterSummaryDrawer={true} selectionForListingMasterAPI='Master' isDataInMaster={isDataInMaster} stopAPICall={false} />}

                                {isMachineApproval &&
                                    <MachineRateListing isMasterSummaryDrawer={true} selectionForListingMasterAPI='Master' isDataInMaster={isDataInMaster} />}


                                <Row>
                                    <Col md="12">
                                        <h5 className="left-border">Attachments</h5>
                                    </Col>
                                    <Col md="12">
                                        <div className={"attachment-wrapper mt-0"}>

                                            {files &&
                                                files.map((f) => {
                                                    const withOutTild = f.FileURL?.replace(
                                                        "~",
                                                        ""
                                                    );
                                                    const fileURL = `${FILE_URL}${withOutTild}`;
                                                    return (
                                                        <div className={"attachment images"}>
                                                            <a href={fileURL} target="_blank" rel="noreferrer" title={f.OriginalFileName}>
                                                                {f.OriginalFileName}
                                                            </a>

                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </Col>
                                </Row>
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

            </Drawer >

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
        </div >
    );
}

export default SummaryDrawer;