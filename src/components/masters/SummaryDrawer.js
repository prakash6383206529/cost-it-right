import React, { useState, useEffect } from 'react';
import ApprovalWorkFlow from '../costing/components/approval/ApprovalWorkFlow';
import RMDomesticListing from './material-master/RMDomesticListing';
import BOPDomesticListing from './bop-master/BOPDomesticListing';
import BOPImportListing from './bop-master/BOPImportListing';
import Drawer from '@material-ui/core/Drawer';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { getMasterApprovalSummary } from './actions/Material';
import { Fragment } from 'react';
import MasterSendForApproval from './MasterSendForApproval';
import LoaderCustom from '../common/LoaderCustom';
import OperationListing from './operation/OperationListing'
import { BOP_MASTER_ID, RM_MASTER_ID, OPERATIONS_ID, MACHINE_MASTER_ID, FILE_URL, BUDGET_ID, APPROVED_STATUS } from '../../config/constants';
import MachineRateListing from './machine-master/MachineRateListing';
import { getConfigurationKey, loggedInUserId, userDetails, userTechnologyDetailByMasterId } from '../../helper';
import { checkFinalUser } from '../costing/actions/Costing';
import { getUsersMasterLevelAPI } from '../../actions/auth/AuthActions';
import { costingTypeIdToApprovalTypeIdFunction } from '../common/CommonFunctions';
import BudgetListing from './budget-master/BudgetListing';
import RMImportListing from './material-master/RMImportListing';

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
    const [finalLevelUser, setFinalLevelUser] = useState(false)
    const [costingTypeId, setCostingTypeId] = useState('')
    const [levelDetails, setLevelDetails] = useState('')
    const [isBudgetApproval, setIsBudgetApproval] = useState(false)
    const [showImport, setShowImport] = useState(false)

    // const { rmDomesticListing, rmImportListing, bopDomesticList, bopImportList } = useSelector(state => state.material)


    useEffect(() => {
        let CostingTypeId = ''
        setLoader(true)
        dispatch(getMasterApprovalSummary(approvalData.approvalNumber, approvalData.approvalProcessId, props.masterId, res => {
            const Data = res.data.Data
            setApprovalLevelStep(Data.MasterSteps)
            setApprovalDetails({ IsSent: Data.IsSent, IsFinalLevelButtonShow: Data.IsFinalLevelButtonShow, ApprovalProcessId: Data.ApprovalProcessId, MasterApprovalProcessSummaryId: Data.ApprovalProcessSummaryId, Token: Data.Token, MasterId: Data.MasterId })
            setLoader(false)
            if (Number(props.masterId) === RM_MASTER_ID) {
                CostingTypeId = Data.ImpactedMasterDataList.RawMaterialListResponse[0]?.CostingTypeId
                setFiles(Data.ImpactedMasterDataList.RawMaterialListResponse[0].Attachements)
                Data.ImpactedMasterDataList?.RawMaterialListResponse.length > 0 ? setIsDataInMaster(true) : setIsDataInMaster(false);
                if (Data.ImpactedMasterDataList.RawMaterialListResponse[0]?.Currency === getConfigurationKey()?.BaseCurrency) {
                    setShowImport(false)
                } else {
                    setShowImport(true)
                }
            } else if (Number(props.masterId) === BOP_MASTER_ID) {
                CostingTypeId = Data.ImpactedMasterDataList.BOPDomesticListResponse[0]?.CostingTypeId
                setFiles(Data.ImpactedMasterDataList.BOPDomesticListResponse[0].Attachements)

                if (Data.ImpactedMasterDataList.BOPDomesticListResponse[0]?.Currency === getConfigurationKey()?.BaseCurrency) {
                    setShowImport(false)
                } else {
                    setShowImport(true)
                }

                Data.ImpactedMasterDataList?.length > 0 ? setIsDataInMaster(true) : setIsDataInMaster(false);
            } else if (Number(props.masterId) === OPERATIONS_ID) {
                CostingTypeId = Data.ImpactedMasterDataList.OperationListResponse[0]?.CostingTypeId
                setFiles(Data.ImpactedMasterDataList.OperationListResponse[0].Attachements)
                Data.ImpactedMasterDataList?.length > 0 ? setIsDataInMaster(true) : setIsDataInMaster(false);
            } else if (Number(props.masterId) === MACHINE_MASTER_ID) {
                CostingTypeId = Data.ImpactedMasterDataList.MachineListResponse[0]?.CostingTypeId
                setFiles(Data.ImpactedMasterDataList.MachineListResponse[0].Attachements)
                Data.ImpactedMasterDataList?.length > 0 ? setIsDataInMaster(true) : setIsDataInMaster(false);
            } else if (Number(props.masterId) === BUDGET_ID) {
                CostingTypeId = Data.ImpactedMasterDataList.BudgetListResponse[0]?.CostingHeadId
                setFiles(Data.ImpactedMasterDataList.BudgetingListResponse[0].Attachements)
                Data.ImpactedMasterDataList?.length > 0 ? setIsDataInMaster(true) : setIsDataInMaster(false);
            }
            setCostingTypeId(CostingTypeId)
            Data.NumberOfMaster > 0 ? setIsDataInMaster(true) : setIsDataInMaster(false);
            let obj = {
                DepartmentId: Data.DepartmentId,
                UserId: loggedInUserId(),
                TechnologyId: props.masterId,
                Mode: 'master',
                approvalTypeId: costingTypeIdToApprovalTypeIdFunction(CostingTypeId)
            }
            dispatch(checkFinalUser(obj, res => {
                if (res && res.data && res.data.Result) {
                    setFinalLevelUser(res.data.Data.IsFinalApprover)
                }
            }))
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
        } else if (Number(props.masterId) === BUDGET_ID) {
            setIsBudgetApproval(true)
        }

        dispatch(getUsersMasterLevelAPI(loggedInUserId(), props.masterId, res => {
            if (res && res.data && res.data.Result) {
                setFinalLevelUser(res.data.Data.IsFinalApprover)
                let levelDetailsTemp = []
                levelDetailsTemp = userTechnologyDetailByMasterId(CostingTypeId, props.masterId, res.data.Data.MasterLevels)
                setLevelDetails(levelDetailsTemp)
            }
        }))

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
                        {loader ? <LoaderCustom /> :
                            <Row className="mx-0 mb-3">
                                <Col>
                                    <ApprovalWorkFlow approvalLevelStep={approvalLevelStep} approvalNo={approvalDetails.Token} />


                                    {isRMApproval && <>
                                        {showImport ?
                                            <RMImportListing isMasterSummaryDrawer={true} selectionForListingMasterAPI='Master' isDataInMaster={isDataInMaster} approvalStatus={APPROVED_STATUS} stopApiCallOnCancel={true} costingTypeId={approvalData?.costingTypeId} />
                                            :
                                            <RMDomesticListing isMasterSummaryDrawer={true} selectionForListingMasterAPI='Master' isDataInMaster={isDataInMaster} approvalStatus={APPROVED_STATUS} stopApiCallOnCancel={true} costingTypeId={approvalData?.costingTypeId} />
                                        }
                                    </>}
                                    {isBOPApproval && <>
                                        {showImport ?
                                            <BOPImportListing isMasterSummaryDrawer={true} selectionForListingMasterAPI='Master' isDataInMaster={isDataInMaster} approvalStatus={APPROVED_STATUS} stopApiCallOnCancel={true} costingTypeId={approvalData?.costingTypeId} />
                                            :
                                            <BOPDomesticListing isMasterSummaryDrawer={true} selectionForListingMasterAPI='Master' isDataInMaster={isDataInMaster} approvalStatus={APPROVED_STATUS} stopApiCallOnCancel={true} costingTypeId={approvalData?.costingTypeId} />
                                        }
                                    </>
                                    }

                                    {isOperationApproval &&
                                        <OperationListing isMasterSummaryDrawer={true} selectionForListingMasterAPI='Master' isDataInMaster={isDataInMaster} stopAPICall={false} approvalStatus={APPROVED_STATUS} />}

                                    {isMachineApproval &&
                                        <MachineRateListing isMasterSummaryDrawer={true} selectionForListingMasterAPI='Master' isDataInMaster={isDataInMaster} approvalStatus={APPROVED_STATUS} />}
                                    {isBudgetApproval &&
                                        <BudgetListing isMasterSummaryDrawer={true} selectionForListingMasterAPI='Master' />}

                                </Col>


                            </Row>
                        }
                        {
                            !approvalDetails.IsSent &&
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
                    IsFinalLevelButtonShow={finalLevelUser}
                    costingTypeId={costingTypeId}
                    levelDetails={levelDetails}
                />
            }
        </div >
    );
}

export default SummaryDrawer;