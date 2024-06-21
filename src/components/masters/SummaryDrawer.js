import React, { useState, useEffect } from 'react';
import ApprovalWorkFlow from '../costing/components/approval/ApprovalWorkFlow';
import RMDomesticListing from './material-master/RMDomesticListing';
import BOPDomesticListing from './bop-master/BOPDomesticListing';
import BOPImportListing from './bop-master/BOPImportListing';
import Drawer from '@material-ui/core/Drawer';
import { useDispatch } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { getMasterApprovalSummary } from './actions/Material';
import { Fragment } from 'react';
import MasterSendForApproval from './MasterSendForApproval';
import LoaderCustom from '../common/LoaderCustom';
import OperationListing from './operation/OperationListing'
import { BOP_MASTER_ID, RM_MASTER_ID, OPERATIONS_ID, MACHINE_MASTER_ID, BUDGET_ID, APPROVED_STATUS, ZBCTypeId, INR, SUPPLIER_MANAGEMENT_ID, ONBOARDINGID, LPSAPPROVALTYPEID, CLASSIFICATIONAPPROVALTYPEID } from '../../config/constants';
import MachineRateListing from './machine-master/MachineRateListing';
import { checkForNull, getCodeBySplitting, getConfigurationKey, loggedInUserId, userTechnologyDetailByMasterId } from '../../helper';
import { checkFinalUser } from '../costing/actions/Costing';
import { getUsersMasterLevelAPI } from '../../actions/auth/AuthActions';
import { costingTypeIdToApprovalTypeIdFunction } from '../common/CommonFunctions';
import BudgetListing from './budget-master/BudgetListing';
import RMImportListing from './material-master/RMImportListing';
import { debounce } from 'lodash';
import { approvalPushedOnSap } from '../costing/actions/Approval';
import Toaster from '../common/Toaster';
import DayTime from '../common/DayTimeWrapper';
import { reactLocalStorage } from 'reactjs-localstorage';
import InitiateUnblocking from '../vendorManagement/InitiateUnblocking';

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
    const [bopDataResponse, setBopDataResponse] = useState([])
    const [showPushButton, setShowPushButton] = useState(false) // This is for showing push button when master is approved and need to push it for scheduling
    // const { rmDomesticListing, rmImportListing, bopDomesticList, bopImportList } = useSelector(state => state.material)
    const [dataForFetchingAllApprover, setDataForFetchingAllApprover] = useState({})
    const [mastersPlantId, setMastersPlantId] = useState('')
    const [isOnboardingApproval, setIsOnboardingApproval] = useState(false)
    const [onBoardingData, setOnBoardingData] = useState({})



    useEffect(() => {

        let CostingTypeId = ''
        setLoader(true)

        dispatch(getMasterApprovalSummary(approvalData.approvalNumber, approvalData.approvalProcessId, props?.masterId, props?.OnboardingApprovalId, res => {

            const Data = res.data.Data

            setApprovalLevelStep(Data?.MasterSteps)
            setApprovalDetails({ IsSent: Data?.IsSent, IsFinalLevelButtonShow: Data?.IsFinalLevelButtonShow, ApprovalProcessId: Data?.ApprovalProcessId, MasterApprovalProcessSummaryId: Data?.ApprovalProcessSummaryId, Token: Data?.Token, MasterId: Data?.MasterId, OnboardingId: Data?.OnboardingId, ApprovalTypeId: Data?.ApprovalTypeId })
            setLoader(false)
            let masterPlantId = ''
            if (checkForNull(props?.masterId) === RM_MASTER_ID) {
                CostingTypeId = Data?.ImpactedMasterDataList.RawMaterialListResponse[0]?.CostingTypeId
                setFiles(Data?.ImpactedMasterDataList.RawMaterialListResponse[0].Attachements)
                masterPlantId = Data?.ImpactedMasterDataList.RawMaterialListResponse[0]?.MasterApprovalPlantId
                Data?.ImpactedMasterDataList?.RawMaterialListResponse.length > 0 ? setIsDataInMaster(true) : setIsDataInMaster(false);
                if (Data?.ImpactedMasterDataList.RawMaterialListResponse[0]?.Currency === reactLocalStorage.getObject("baseCurrency")) {
                    setShowImport(false)
                } else {
                    setShowImport(true)
                }
            } else if (checkForNull(props?.masterId) === BOP_MASTER_ID) {
                CostingTypeId = Data?.ImpactedMasterDataList.BOPListResponse[0]?.CostingTypeId
                setFiles(Data?.ImpactedMasterDataList.BOPListResponse[0].Attachements)
                setBopDataResponse(Data?.ImpactedMasterDataList.BOPListResponse)
                masterPlantId = Data?.ImpactedMasterDataList.BOPListResponse[0]?.MasterApprovalPlantId
                if (Data?.ImpactedMasterDataList.BOPListResponse[0]?.Currency === reactLocalStorage.getObject("baseCurrency")) {
                    setShowImport(false)
                } else {
                    setShowImport(true)
                }
                Data?.ImpactedMasterDataList?.length > 0 ? setIsDataInMaster(true) : setIsDataInMaster(false);
                setShowPushButton(Data?.IsPushedButtonShow)
            } else if (checkForNull(props?.masterId) === OPERATIONS_ID) {
                CostingTypeId = Data?.ImpactedMasterDataList.OperationListResponse[0]?.CostingTypeId
                setFiles(Data?.ImpactedMasterDataList.OperationListResponse[0].Attachements)
                Data?.ImpactedMasterDataList?.length > 0 ? setIsDataInMaster(true) : setIsDataInMaster(false);
                masterPlantId = Data?.ImpactedMasterDataList.OperationListResponse[0]?.MasterApprovalPlantId
            } else if (checkForNull(props?.masterId) === MACHINE_MASTER_ID) {
                CostingTypeId = Data?.ImpactedMasterDataList.MachineListResponse[0]?.CostingTypeId
                setFiles(Data?.ImpactedMasterDataList.MachineListResponse[0].Attachements)
                Data?.ImpactedMasterDataList?.length > 0 ? setIsDataInMaster(true) : setIsDataInMaster(false);
                masterPlantId = Data?.ImpactedMasterDataList.MachineListResponse[0]?.MasterApprovalPlantId
            } else if (checkForNull(props?.masterId) === BUDGET_ID) {
                CostingTypeId = Data?.ImpactedMasterDataList.BudgetingListResponse[0]?.CostingHeadId
                setFiles(Data?.ImpactedMasterDataList.BudgetingListResponse[0].Attachements)
                Data?.ImpactedMasterDataList?.length > 0 ? setIsDataInMaster(true) : setIsDataInMaster(false);
                masterPlantId = Data?.ImpactedMasterDataList.BudgetingListResponse[0]?.MasterApprovalPlantId
            }
            else if (Number(props?.masterId) === 0 && checkForNull(props?.OnboardingApprovalId) === Number(ONBOARDINGID)) {

                CostingTypeId = Data?.ImpactedMasterDataList.VendorPlantClassificationLPSRatingListResponses[0]?.CostingHeadId
                setFiles(Data?.ImpactedMasterDataList.VendorPlantClassificationLPSRatingListResponses[0].Attachements)
                Data?.ImpactedMasterDataList?.length > 0 ? setIsDataInMaster(true) : setIsDataInMaster(false);
                masterPlantId = Data?.ImpactedMasterDataList.VendorPlantClassificationLPSRatingListResponses[0]?.MasterApprovalPlantId
                setOnBoardingData(Data?.ImpactedMasterDataList.VendorPlantClassificationLPSRatingListResponses[0])
            }
            setCostingTypeId(CostingTypeId)
            Data?.NumberOfMaster > 0 ? setIsDataInMaster(true) : setIsDataInMaster(false);
            let obj = {
                DepartmentId: Data?.DepartmentId,
                UserId: loggedInUserId(),
                TechnologyId: props?.masterId,
                Mode: (props?.masterId === 0 && props?.OnboardingApprovalId === ONBOARDINGID) ? 'onboarding' : 'master',
                approvalTypeId: (props?.masterId === 0 && props?.OnboardingApprovalId === ONBOARDINGID) ? Data?.ApprovalTypeId : costingTypeIdToApprovalTypeIdFunction(CostingTypeId),
                plantId: masterPlantId
            }
            setMastersPlantId(masterPlantId)
            setDataForFetchingAllApprover({
                processId: approvalData.approvalProcessId,
                levelId: Data?.MasterSteps[Data?.MasterSteps.length - 1].LevelId,
                mode: (props?.masterId === 0 && props?.OnboardingApprovalId === ONBOARDINGID) ? 'onboarding' : 'Master'
            })
            dispatch(checkFinalUser(obj, res => {
                if (res && res.data && res.data.Result) {
                    setFinalLevelUser(res.data.Data?.IsFinalApprover)
                }
            }))
        }))

        if (checkForNull(props?.masterId) === RM_MASTER_ID) {            // MASTER ID 1 FOR RAW MATERIAL
            setIsRMApproval(true)
        }
        else if (checkForNull(props?.masterId) === BOP_MASTER_ID) {     // MASTER ID 2 FOR BOP 
            setIsBOPApproval(true)
        } else if (checkForNull(props?.masterId) === OPERATIONS_ID) {  // MASTER ID 3 FOR OPERATION
            setIsOperationApproval(true)
        } else if (checkForNull(props?.masterId) === MACHINE_MASTER_ID) {  // MASTER ID 4 FOR MACHINE
            setIsMachineApproval(true)
        } else if (checkForNull(props?.masterId) === BUDGET_ID) {
            setIsBudgetApproval(true)
        }
        else if (props.masterId === 0 && (props?.OnboardingApprovalId) === ONBOARDINGID) {
            setIsOnboardingApproval(true)
        }

        dispatch(getUsersMasterLevelAPI(loggedInUserId(), props?.masterId, res => {
            if (res && res.data && res.data.Result) {
                setFinalLevelUser(res.data.Data?.IsFinalApprover)
                let levelDetailsTemp = []
                levelDetailsTemp = userTechnologyDetailByMasterId(CostingTypeId, props?.masterId, res.data.Data?.MasterLevels)
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

    const callPushAPI = debounce(() => {
        let obj = {
            "BaseCositngId": null,
            "LoggedInUserId": loggedInUserId(),
            "SimulationId": null,
            "BoughtOutPartId": bopDataResponse[0].BoughtOutPartId,
        }
        dispatch(approvalPushedOnSap(obj, res => {
            if (res?.data?.DataList && res?.data?.DataList[0]?.IsPushed === false) {
                Toaster.error(res?.data?.DataList[0]?.Message)
            } else if (res?.data?.Result) {
                Toaster.success('Approval pushed successfully.')
            }
        }))
    }, 500)


    return (
        <div>
            <Drawer className="bottom-drawer" anchor={props.anchor} open={props.isOpen}>
                <div className="container-fluid">
                    <div className={'drawer-wrapper drawer-1500px master-summary-drawer'}>
                        <Row className="drawer-heading sticky-top-0">
                            <Col>
                                <div className={'header-wrapper left'}>
                                    {/* <h3>{`Master Summary (Token No.${approvalDetails.Token}):`}</h3> */}
                                    <h3>{`${approvalDetails?.ApprovalTypeId === LPSAPPROVALTYPEID ? 'LPS' : (approvalDetails?.ApprovalTypeId === CLASSIFICATIONAPPROVALTYPEID ? 'Classification' : 'Master')} Summary (Token No.${approvalDetails?.Token ?? ''}):`}</h3>

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
                                    <ApprovalWorkFlow approvalLevelStep={approvalLevelStep} approvalNo={approvalDetails.Token} approverData={dataForFetchingAllApprover} />


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

                                    {
                                        isOnboardingApproval &&
                                        <InitiateUnblocking deviationData={onBoardingData} isMasterSummaryDrawer={true} selectionForListingMasterAPI='Master' isDataInMaster={isDataInMaster} />
                                    }
                                </Col>
                            </Row>
                        }
                        {(checkForNull(props?.masterId) === BOP_MASTER_ID) && costingTypeId === ZBCTypeId && showPushButton &&
                            <div className='d-flex justify-content-end'>
                                <button type="submit" className="submit-button mr5 save-btn" onClick={() => callPushAPI()}>
                                    <div className={"save-icon"}></div>
                                    {"Repush"}
                                </button>
                            </div>
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
                    masterId={approvalDetails?.MasterId !== null ? approvalDetails.MasterId : 0}
                    OnboardingId={approvalDetails?.OnboardingId !== null ? approvalDetails.OnboardingId : 0}
                    masterPlantId={mastersPlantId}
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