
import React, { useEffect, useState } from 'react'
import { Row, Col, Table, Tooltip } from 'reactstrap'
import DayTime from '../../common/DayTimeWrapper'
import { Fragment } from 'react'
import ApprovalWorkFlow from '../../costing/components/approval/ApprovalWorkFlow';
import ViewDrawer from '../../costing/components/approval/ViewDrawer'
import { useDispatch, useSelector } from 'react-redux'
import {
    SIMULATIONAPPROVALSUMMARYDOWNLOADBOP, BOPGridForTokenSummary, InitialGridForTokenSummary,
    LastGridForTokenSummary, OperationGridForTokenSummary, RMGridForTokenSummary, STGridForTokenSummary,
    SIMULATIONAPPROVALSUMMARYDOWNLOADST, ASSEMBLY_WISEIMPACT_DOWNLOAD_EXCEl, CPGridForTokenSummary, SIMULATIONAPPROVALSUMMARYDOWNLOADOPERATION, SIMULATIONAPPROVALSUMMARYDOWNLOADMR, MRGridForTokenSummary, SIMULATIONAPPROVALSUMMARYDOWNLOADASSEMBLYTECHNOLOGY, ASSEMBLY_TECHNOLOGY_MASTER, SIMULATIONAPPROVALSUMMARYDOWNLOADCP, SIMULATIONAPPROVALSUMMARYDOWNLOADBOPWITHOUTCOSTING, SIMULATIONAPPROVALSUMMARYDOWNLOADER
} from '../../../config/masterData';
import { getApprovalSimulatedCostingSummary, getComparisionSimulationData, getImpactedMasterData, getLastSimulationData, uploadSimulationAttachment, getSimulatedAssemblyWiseImpactDate, getApprovalSimulatedRawMaterialSummary } from '../actions/Simulation'
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css';
import Toaster from '../../common/Toaster';
import { EXCHNAGERATE, RMDOMESTIC, RMIMPORT, FILE_URL, COMBINED_PROCESS, SURFACETREATMENT, OPERATIONS, BOPDOMESTIC, BOPIMPORT, AssemblyWiseImpactt, ImpactMaster, defaultPageSize, MACHINERATE, VBCTypeId, CBCTypeId, ZBCTypeId, RAWMATERIALINDEX, RAWMATERIALAPPROVALTYPEID, } from '../../../config/constants';
import CostingSummaryTable from '../../costing/components/CostingSummaryTable';
import { checkForDecimalAndNull, formViewData, checkForNull, getConfigurationKey, loggedInUserId, searchNocontentFilter, handleDepartmentHeader, showSaLineNumber, showBopLabel, getLocalizedCostingHeadValue } from '../../../helper';
import LoaderCustom from '../../common/LoaderCustom';
import VerifyImpactDrawer from './VerifyImpactDrawer';
import { checkFinalUser, resetExchangeRateData, setCostingViewData, storePartNumber } from '../../costing/actions/Costing';
import { EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { Redirect } from 'react-router';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { Impactedmasterdata } from './ImpactedMasterData';
import { Fgwiseimactdata } from './FgWiseImactData'
// import PushButtonDrawer from '../../costing/components/approval/PushButtonDrawer';
import ReactExport from 'react-export-excel';
import redcrossImg from '../../../assests/images/red-cross.png'
import { Link } from 'react-scroll';
import ScrollToTop from '../../common/ScrollToTop';
import { ErrorMessage, impactmasterDownload, SimulationUtils } from '../SimulationUtils'              //ERROR MESSAGE WILL USE IN FUTURE
import { SIMULATIONAPPROVALSUMMARYDOWNLOADRM } from '../../../config/masterData'
import ViewAssembly from './ViewAssembly';
import AssemblyWiseImpactSummary from './AssemblyWiseImpactSummary';
import _, { debounce } from 'lodash'
import CalculatorWrapper from '../../common/Calculator/CalculatorWrapper';
import { approvalPushedOnSap } from '../../costing/actions/Approval'; //MINDA
import { PaginationWrapper } from '../../common/commonPagination';
import { hideColumnFromExcel, hideMultipleColumnFromExcel } from '../../common/CommonFunctions';
import { reactLocalStorage } from 'reactjs-localstorage';
import { costingTypeIdToApprovalTypeIdFunction } from '../../common/CommonFunctions';
import SimulationApproveReject from '../../costing/components/approval/SimulationApproveReject';
import RMIndexationSimulation from './SimulationPages/RMIndexationSimulation';
import { useLabels } from '../../../helper/core';
import Popup from 'reactjs-popup';

const gridOptions = {};
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

function SimulationApprovalSummary(props) {
    const { vendorLabel, vendorBasedLabel, zeroBasedLabel, customerBasedLabel } = useLabels()
    const { isbulkUpload } = props;
    const { approvalNumber, approvalId, SimulationTechnologyId, simulationId, receiverId, SimulationHeadId, fromDashboard } = props?.location?.state
    const [showImpactedData, setshowImpactedData] = useState(false)
    const [fgWiseDataAcc, setFgWiseDataAcc] = useState(true)
    const [assemblyWiseAcc, setAssemblyWiseAcc] = useState(true)
    const [showListing, setShowListing] = useState(false)
    const [approveDrawer, setApproveDrawer] = useState(false)
    const [rejectDrawer, setRejectDrawer] = useState(false)
    const [viewButton, setViewButton] = useState(false)
    const [costingSummary, setCostingSummary] = useState(true)
    const [costingList, setCostingList] = useState([])
    const [simulationDetail, setSimulationDetail] = useState({})
    const [approvalLevelStep, setApprovalLevelStep] = useState([])
    const [isApprovalDone, setIsApprovalDone] = useState(true) // this is for hiding approve and  reject button when costing is approved and  send for futher approval
    const [showFinalLevelButtons, setShowFinalLevelButton] = useState(false) //This is for showing approve ,reject and approve and push button when costing approval is at final level for aaproval

    /****************************************WHENEVER WE ENABLE PUSH BUTTON UNCOMMENT THIS********************************************/
    // const [showPushButton, setShowPushButton] = useState(false) // This is for showing push button when costing is approved and need to push it for scheduling               //RE
    // const [hidePushButton, setHideButton] = useState(false) // This is for hiding push button ,when it is send for push for scheduling.
    // const [pushButton, setPushButton] = useState(false)
    const [loader, setLoader] = useState(false)
    const [effectiveDate, setEffectiveDate] = useState('')
    const [impactedMasterDataListForLastRevisionData, setImpactedMasterDataListForLastRevisionData] = useState([])
    const [impactedMasterDataListForImpactedMaster, setImpactedMasterDataListForImpactedMaster] = useState([])
    const [showPushButton, setShowPushButton] = useState(false) // This is for showing push button when costing is approved and need to push it for scheduling
    // const [hidePushButton, setHideButton] = useState(false) // This is for hiding push button ,when it is send for push for scheduling.
    const [showPushDrawer, setShowPushDrawer] = useState(false)


    const [compareCosting, setCompareCosting] = useState(false)
    const [showLastRevisionData, setShowLastRevisionData] = useState(false)
    const [isVerifyImpactDrawer, setIsVerifyImpactDrawer] = useState(false)
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [id, setId] = useState('')
    const [isSuccessfullyUpdated, setIsSuccessfullyUpdated] = useState(false) //MINDA
    const [noContent, setNoContent] = useState(false) //MINDA

    const [files, setFiles] = useState([]);
    const [IsOpen, setIsOpen] = useState(false);
    const [DataForAssemblyImpactForFg, setdataForAssemblyImpactForFg] = useState([]);
    const [textFilterSearch, setTextFilterSearch] = useState('')
    const [approvalTypeId, setApprovalTypeId] = useState(null)

    const [showViewAssemblyDrawer, setShowViewAssemblyDrawer] = useState(false)
    const [dataForAssemblyImpact, setDataForAssemblyImpact] = useState({})
    const [dataForDownload, setDataForDownload] = useState([])
    const [assemblyImpactButtonTrue, setAssemblyImpactButtonTrue] = useState(true);
    const [showBOPColumn, setShowBOPColumn] = useState(false);
    const [showRMColumn, setShowRMColumn] = useState(false);
    const [showOperationColumn, setShowOperationColumn] = useState(false);
    const [showSurfaceTreatmentColumn, setShowSurfaceTreatmentColumn] = useState(false);
    const [showExchangeRateColumn, setShowExchangeRateColumn] = useState(false);
    const [showMachineRateColumn, setShowMachineRateColumn] = useState(false);
    const [showCombinedProcessColumn, setShowCombinedProcessColumn] = useState(false);               //RE
    const [noData, setNoData] = useState(false);
    const [tooltipStates, setTooltipStates] = useState({});
    const [showTooltip, setShowTooltip] = useState(false)
    const [listWithTooltip, setListWithTooltip] = useState([])

    const isSurfaceTreatment = (Number(SimulationTechnologyId) === Number(SURFACETREATMENT));
    const isOperation = (Number(SimulationTechnologyId) === Number(OPERATIONS));
    const isRMDomesticOrRMImport = ((Number(SimulationTechnologyId) === Number(RMDOMESTIC)) || (Number(SimulationTechnologyId) === Number(RMIMPORT)));
    const isBOPDomesticOrImport = ((Number(SimulationTechnologyId) === Number(BOPDOMESTIC)) || (Number(SimulationTechnologyId) === Number(BOPIMPORT)))
    const isExchangeRate = String(SimulationTechnologyId) === EXCHNAGERATE;
    const isMachineRate = String(SimulationTechnologyId) === MACHINERATE;
    const isMultiTechnology = (checkForNull(simulationDetail?.SimulationTechnologyId) === ASSEMBLY_TECHNOLOGY_MASTER) ? true : false
    const simulationAssemblyListSummary = useSelector((state) => state?.simulation.simulationAssemblyListSummary)
    const { isMasterAssociatedWithCosting } = useSelector(state => state?.simulation)
    const simulationApplicability = useSelector(state => state?.simulation.simulationApplicability)
    const isCombinedProcess = String(SimulationTechnologyId) === COMBINED_PROCESS;
    const { initialConfiguration } = useSelector(state => state?.auth)

    const dispatch = useDispatch()

    const impactedMasterData = useSelector(state => state?.comman?.impactedMasterData)
    const { keysForDownloadSummary } = useSelector(state => state?.simulation)
    const [lastRevisionDataAccordian, setLastRevisionDataAccordian] = useState(impactedMasterDataListForLastRevisionData?.length >= 0 ? false : true)
    const [editWarning, setEditWarning] = useState(false)
    const [finalLeveluser, setFinalLevelUser] = useState(false)
    const [releaseStrategyDetails, setReleaseStrategyDetails] = useState({})
    const headerName = ['Revision No.', 'Name', 'Existing Cost/Pc', 'Revised Cost/Pc', 'Quantity', 'Impact/Pc', 'Volume/Year', 'Impact/Quarter', 'Impact/Year']
        const [accDisable, setAccDisable] = useState(false)
    const [technologyName, setTechnologyName] = useState('')
    const [simulationData, setSimulationData] = useState(null)
    const [count, setCount] = useState(0)
    const [dataForFetchingAllApprover, setDataForFetchingAllApprover] = useState({})
    const headers = {
        NetCost: `Net Cost (${reactLocalStorage.getObject("baseCurrency")})`,
    }

    const [costingIdArray, setCostingIdArray] = useState({})


    const rmIndexedSimulationSummaryData = useSelector(state => state?.simulation?.simulatedRawMaterialSummary?.SimulationRawMaterialDetailsResponse)

    useEffect(() => {
        const reqParams = {
            approvalTokenNumber: approvalNumber,
            approvalId: approvalId,
            loggedInUserId: loggedInUserId(),
            receiverId: receiverId
        }
        const params = {
            simulationId: simulationId,
            loggedInUserId: loggedInUserId(),
        }
        setLoader(false)
        if (Number(SimulationHeadId) === Number(RAWMATERIALAPPROVALTYPEID)) {
            dispatch(getApprovalSimulatedRawMaterialSummary(params, res => {
                const { SimulationSteps, SimulatedCostingList, SimulationApprovalProcessId, Token, NumberOfCostings, IsSent, IsFinalLevelButtonShow,
                    IsPushedButtonShow, SimulationTechnologyId, SimulationApprovalProcessSummaryId, DepartmentCode, EffectiveDate, SimulationId, MaterialGroup, PurchasingGroup, DecimalOption,
                    SenderReason, ImpactedMasterDataList, AmendmentDetails, Attachements, SenderReasonId, DepartmentId, TotalImpactPerQuarter, SimulationHeadId, TotalBudgetedPriceImpactPerQuarter, PartType, IsSimulationWithOutCosting, ApprovalTypeId, DepartmentName } = res.data.Data
                setSimulationData(res?.data?.Data)
                setApprovalTypeId(ApprovalTypeId)
                setDataForFetchingAllApprover({
                    processId: SimulationApprovalProcessId,
                    levelId: SimulationSteps[SimulationSteps.length - 1].LevelId,
                    mode: 'Simulation'
                })
                setApprovalLevelStep(SimulationSteps)
                setSimulationDetail({
                    SimulationApprovalProcessId: SimulationApprovalProcessId, Token: Token, NumberOfCostings: NumberOfCostings,
                    SimulationTechnologyId: SimulationTechnologyId, SimulationApprovalProcessSummaryId: SimulationApprovalProcessSummaryId,
                    DepartmentCode: DepartmentCode, EffectiveDate: EffectiveDate, SimulationId: SimulationId, SenderReason: SenderReason,
                    ImpactedMasterDataList: ImpactedMasterDataList, AmendmentDetails: AmendmentDetails, MaterialGroup: MaterialGroup,
                    PurchasingGroup: PurchasingGroup, DecimalOption: DecimalOption, Attachements: Attachements, SenderReasonId: SenderReasonId, DepartmentId: DepartmentId
                    , TotalImpactPerQuarter: TotalImpactPerQuarter, SimulationHeadId: SimulationHeadId, TotalBudgetedPriceImpactPerQuarter: TotalBudgetedPriceImpactPerQuarter
                    , PartType: PartType, ApprovalTypeId: ApprovalTypeId, DepartmentName: DepartmentName
                })
                setIsApprovalDone(IsSent)
                setShowFinalLevelButton(IsFinalLevelButtonShow)
                setFiles(Attachements)
            }))
        } else {
            dispatch(getApprovalSimulatedCostingSummary(reqParams, res => {
                const { SimulationSteps, SimulatedCostingList, SimulationApprovalProcessId, Token, NumberOfCostings, IsSent, IsFinalLevelButtonShow,
                    IsPushedButtonShow, SimulationTechnologyId, SimulationApprovalProcessSummaryId, DepartmentCode, EffectiveDate, SimulationId, MaterialGroup, PurchasingGroup, DecimalOption,
                    SenderReason, ImpactedMasterDataList, AmendmentDetails, Attachements, SenderReasonId, DepartmentId, TotalImpactPerQuarter, SimulationHeadId, TotalBudgetedPriceImpactPerQuarter, PartType, IsSimulationWithOutCosting, ApprovalTypeId, DivisionId, DepartmentName } = res.data.Data
                    let localizedData = {...res.data.Data};
                    if (localizedData.AmendmentDetails) {
                        if (localizedData.AmendmentDetails.CostingHead) {
                            localizedData.AmendmentDetails.CostingHead = getLocalizedCostingHeadValue(
                                localizedData.AmendmentDetails.CostingHead,
                                vendorBasedLabel,
                                zeroBasedLabel,
                                customerBasedLabel
                            );
                        }
                        
                        if (localizedData.AmendmentDetails.SimulationHead) {
                            localizedData.AmendmentDetails.SimulationHead = getLocalizedCostingHeadValue(
                                localizedData.AmendmentDetails.SimulationHead,
                                vendorBasedLabel,
                                zeroBasedLabel,
                                customerBasedLabel
                            );
                        }
                    }
                setApprovalTypeId(ApprovalTypeId)
                let uniqueArr
                setSimulationData(res?.data?.Data)
                setDataForFetchingAllApprover({
                    processId: SimulationApprovalProcessId,
                    levelId: SimulationSteps[SimulationSteps.length - 1].LevelId,
                    mode: 'Simulation'
                })
                if (IsSimulationWithOutCosting) {
                    uniqueArr = SimulatedCostingList
                } else {
                    uniqueArr = _.uniqBy(SimulatedCostingList, function (o) {
                        return o.CostingId;
                    });
                }
                setCostingSummary(false)
                setTimeout(() => {
                    setCostingSummary(true)
                }, 100);

                setCostingList(uniqueArr)
                setDataForDownload(SimulatedCostingList)
                setApprovalLevelStep(SimulationSteps)
                setEffectiveDate(res.data.Data.EffectiveDate)

                setSimulationDetail({
                    SimulationApprovalProcessId: SimulationApprovalProcessId, Token: Token, NumberOfCostings: NumberOfCostings,
                    SimulationTechnologyId: SimulationTechnologyId, SimulationApprovalProcessSummaryId: SimulationApprovalProcessSummaryId,
                    DepartmentCode: DepartmentCode, EffectiveDate: EffectiveDate, SimulationId: SimulationId, SenderReason: SenderReason,
                    ImpactedMasterDataList: ImpactedMasterDataList, AmendmentDetails: AmendmentDetails, MaterialGroup: MaterialGroup,
                    PurchasingGroup: PurchasingGroup, DecimalOption: DecimalOption, Attachements: Attachements, SenderReasonId: SenderReasonId, DepartmentId: DepartmentId
                    , TotalImpactPerQuarter: TotalImpactPerQuarter, SimulationHeadId: SimulationHeadId, TotalBudgetedPriceImpactPerQuarter: TotalBudgetedPriceImpactPerQuarter
                    , PartType: PartType, ApprovalTypeId: ApprovalTypeId, DivisionId: DivisionId, DepartmentName: DepartmentName
                })
                let requestObject = {}

                requestObject.IsCreate = false
                requestObject.CostingId = []
                setCostingIdArray(requestObject)
                setFiles(Attachements)
                // dispatch(setAttachmentFileData(Attachements, () => { }))               //RE
                setIsApprovalDone(IsSent)
                // setIsApprovalDone(false)
                setShowFinalLevelButton(IsFinalLevelButtonShow)
                /****************************************WHENEVER WE ENABLE PUSH BUTTON UNCOMMENT THIS********************************************/
                setShowPushButton(IsPushedButtonShow)

                // SimulatedCostingList CONTAINS LIST TO SHOW ON UI | SUMMARY BLOCK
                if (SimulatedCostingList !== undefined && (Object.keys(SimulatedCostingList).length !== 0 || SimulatedCostingList.length > 0)) {
                    let requestData = []
                    let isAssemblyInDraft = false

                    // UNIQUE LIST BY CostingId 
                    let uniqueArr = _.uniqBy(SimulatedCostingList, function (o) {
                        return o.CostingId;
                    });

                    // CREATE OBJECT FOR ASSEMBLY WISE IMPACT API
                    uniqueArr && uniqueArr.map(item => {
                        requestData.push({ CostingId: item?.CostingId, delta: item?.POVariance, IsSinglePartImpact: false, SimulationId: SimulationId, LoggedInUserId: loggedInUserId() })
                        return null
                    })

                    dispatch(getSimulatedAssemblyWiseImpactDate(requestData, isAssemblyInDraft, (res) => {
                    }))
                }

                // const valueTemp = {
                //     CostingHead: SimulatedCostingList[0]?.CostingHead === 'VBC' ? 1 : 0,
                //     impactPartNumber: SimulatedCostingList[0]?.PartNo,
                //     plantCode: SimulatedCostingList[0]?.PlantCode,
                //     vendorId: SimulatedCostingList[0]?.CostingHead === 'VBC' ? SimulatedCostingList[0]?.VendorId : EMPTY_GUID,
                //     delta: SimulatedCostingList[0]?.Variance,
                //     quantity: 1
                // }
                setdataForAssemblyImpactForFg(SimulatedCostingList)

                // if (initialConfiguration?.IsReleaseStrategyConfigured) {
                //     let requestObject = {
                //         "RequestFor": "SIMULATION",
                //         "TechnologyId": SimulationTechnologyId,
                //         "LoggedInUserId": loggedInUserId(),
                //         "ReleaseStrategyApprovalDetails": [{ SimulationId: SimulationId }]
                //     }
                //     dispatch(getReleaseStrategyApprovalDetails(requestObject, (res) => {
                //         setReleaseStrategyDetails(res?.data?.Data)
                //         if (res?.data?.Data?.IsUserInApprovalFlow && !res?.data?.Data?.IsFinalApprover) {

                //         } else if (res?.data?.Data?.IsPFSOrBudgetingDetailsExist === false) {
                //             let obj = {
                //                 DepartmentId: DepartmentId,
                //                 UserId: loggedInUserId(),
                //                 TechnologyId: SimulationTechnologyId,
                //                 Mode: 'simulation',
                //                 approvalTypeId: ApprovalTypeId,
                //             }
                //             dispatch(checkFinalUser(obj, res => {
                //                 if (res && res.data && res.data.Result) {
                //                     setFinalLevelUser(res.data.Data.IsFinalApprover)
                //                 }
                //             }))
                //         } else if (res?.data?.Data?.IsFinalApprover) {
                //             setFinalLevelUser(res?.data?.Data?.IsFinalApprover)
                //             return false
                //         } else if (res?.data?.Result === false) {
                //         } else {
                //         }
                //     }))
                // } else {
            }))
        }
        return () => {
            dispatch(storePartNumber(''))
        }
    }, [])
    useEffect(() => {
        if ((simulationData && Object.keys(simulationData)?.length > 0)) {
            let technologyIdTemp = simulationData?.SimulationTechnologyId
            if (simulationData?.IsExchangeRateSimulation) {
                if (String(simulationData?.SimulationTechnologyId) === String(RMIMPORT) || String(simulationData?.SimulationTechnologyId) === String(BOPIMPORT) || String(simulationData?.SimulationTechnologyId) === String(RAWMATERIALINDEX) || String(simulationData?.SimulationTechnologyId) === String(SURFACETREATMENT) || String(simulationData?.SimulationTechnologyId) === String(MACHINERATE) || String(simulationData?.SimulationTechnologyId) === String(OPERATIONS)) {
                    technologyIdTemp = EXCHNAGERATE
                }
            } else {
                technologyIdTemp = simulationData?.SimulationTechnologyId
            }
            let obj = {
                DepartmentId: simulationData.DepartmentId,
                UserId: loggedInUserId(),
                TechnologyId: technologyIdTemp,
                Mode: 'simulation',
                approvalTypeId: approvalTypeId === null ? simulationData.ApprovalTypeId : approvalTypeId,

                // approvalTypeId: costingTypeIdToApprovalTypeIdFunction(simulationData.SimulationHeadId),
                plantId: simulationData?.SimulatedCostingList && simulationData?.SimulatedCostingList[0]?.PlantId ? simulationData?.SimulatedCostingList[0]?.PlantId : null,
                divisionId: simulationData?.DivisionId ?? null,
                ReceiverId: receiverId
            }
            if (initialConfiguration?.IsMultipleUserAllowForApproval ? simulationData?.SimulatedCostingList && simulationData?.SimulatedCostingList[0]?.PlantId ? simulationData?.SimulatedCostingList[0]?.PlantId : true : true) {
                dispatch(checkFinalUser(obj, res => {
                    if (res && res.data && res.data.Result) {
                        setFinalLevelUser(res.data.Data.IsFinalApprover)
                    }
                }))
            }
        }
    }, [simulationData])
    useEffect(() => {
        // CHECK IF THERE IS NO DATA FOR EACH MASTER IN LAST REVISION DATA
        let check = impactedMasterDataListForLastRevisionData?.RawMaterialImpactedMasterDataList?.length <= 0 &&
            impactedMasterDataListForLastRevisionData?.OperationImpactedMasterDataList?.length <= 0 &&
            impactedMasterDataListForLastRevisionData?.ExchangeRateImpactedMasterDataList?.length <= 0 &&
            impactedMasterDataListForLastRevisionData?.BoughtOutPartImpactedMasterDataList?.length <= 0 &&
            impactedMasterDataListForLastRevisionData?.SurfaceTreatmentImpactedMasterDataList?.length <= 0 &&
            impactedMasterDataListForLastRevisionData?.MachineProcessImpactedMasterDataList <= 0
            && impactedMasterDataListForLastRevisionData?.CombinedProcessImpactedMasterDataList?.length <= 0
        if (lastRevisionDataAccordian && check) {
            Toaster.warning('There is no data for the Last Revision.')
            setEditWarning(true)
        } else {
            setEditWarning(false)
        }
    }, [lastRevisionDataAccordian, impactedMasterDataListForLastRevisionData])

    const hideColumn = (props) => {
        setShowBOPColumn(keysForDownloadSummary?.IsBoughtOutPartSimulation === true ? true : false)
        setShowSurfaceTreatmentColumn(keysForDownloadSummary?.IsSurfaceTreatmentSimulation === true ? true : false)
        setShowOperationColumn(keysForDownloadSummary?.IsOperationSimulation === true ? true : false)
        setShowRMColumn(keysForDownloadSummary?.IsRawMaterialSimulation === true ? true : false)
        setShowExchangeRateColumn(keysForDownloadSummary?.IsExchangeRateSimulation === true ? true : false)
        setShowMachineRateColumn(keysForDownloadSummary?.IsMachineProcessSimulation === true ? true : false)
        setShowCombinedProcessColumn(keysForDownloadSummary?.IsCombinedProcessSimulation === true ? true : false)
        setTimeout(() => {
            setLoader(false)
        }, 500);

    }

    useEffect(() => {
        hideColumn()
    }, [keysForDownloadSummary])

    useEffect(() => {
        // if (costingList?.length > 0 && effectiveDate) {
        setLoader(false)
        if (count === 0 && effectiveDate && costingList && simulationDetail?.SimulationId) {
            setCount(1)
            if (costingList && costingList?.length > 0 && effectiveDate && Object.keys('simulationDetail'?.length > 0) && simulationDetail?.SimulationHeadId === VBCTypeId) {
                dispatch(getLastSimulationData(costingList[0]?.VendorId, effectiveDate, res => {
                    const structureOfData = {
                        ExchangeRateImpactedMasterDataList: [],
                        OperationImpactedMasterDataList: [],
                        RawMaterialImpactedMasterDataList: [],
                        BoughtOutPartImpactedMasterDataList: [],
                        SurfaceTreatmentImpactedMasterDataList: [],
                        MachineProcessImpactedMasterDataList: [],
                        CombinedProcessImpactedMasterDataList: []               //RE
                    }

                    let masterId
                    let Data = []
                    if (Number(res?.status) === 204) {
                        Data = structureOfData
                    } else {
                        Data = res?.data?.Data
                        masterId = res?.data?.Data?.SimulationTechnologyId;
                    }
                    if (res) {
                        setImpactedMasterDataListForLastRevisionData(Data)
                        setShowLastRevisionData(true)
                        setSimulationDetail(prevState => ({ ...prevState, masterId: masterId }))

                    }
                }))
                // }
                // if (simulationDetail?.SimulationId) {
            }
            dispatch(getImpactedMasterData(simulationDetail?.SimulationId, () => { }))
        }

    }, [effectiveDate, costingList, simulationDetail?.SimulationId, DataForAssemblyImpactForFg])

    useEffect(() => {
        let count = 0
        DataForAssemblyImpactForFg && DataForAssemblyImpactForFg.map((item) => {

            if (item.IsAssemblyExist === true) {
                count++
            }
            return null
        })
        if (count !== 0) {
            setAssemblyImpactButtonTrue(true)
        } else {
            setAssemblyImpactButtonTrue(false)
        }
    }, [DataForAssemblyImpactForFg])

    useEffect(() => {
        if (impactedMasterData) {
            setImpactedMasterDataListForImpactedMaster(impactedMasterData)
            setshowImpactedData(true)
        }
    }, [impactedMasterData])


    const closeViewDrawer = (e = '') => {
        setViewButton(false)
    }

    const closeApproveDrawer = (e = '', type) => {
        // const closeApproveDrawer = (e = '', type, status = '') => {               //RE
        if (type === 'submit') {
            setApproveDrawer(false)
            setShowListing(true)
            setRejectDrawer(false)
        } else {
            setApproveDrawer(false)
            setRejectDrawer(false)
        }
    }

    const Preview = ({ meta }) => {
        return (
            <span style={{ alignSelf: 'flex-start', margin: '10px 3%', fontFamily: 'Helvetica' }}>
                {/* {Math.round(percent)}% */}
            </span>
        )
    }

    const handleChangeStatus = ({ meta, file }, status) => {


        if (status === 'removed') {
            const removedFileName = file.name;
            let tempArr = files && files.filter(item => item.OriginalFileName !== removedFileName)
            setFiles(tempArr)
            setIsOpen(!IsOpen)
        }

        if (status === 'done') {
            let data = new FormData()
            data.append('file', file)
            dispatch(uploadSimulationAttachment(data, (res) => {
                let Data = res.data[0]
                files.push(Data)
                setFiles(files)
                setIsOpen(!IsOpen)
            }))
        }

        if (status === 'rejected_file_type') {
            Toaster.warning('Allowed only xls, doc, jpeg, pdf files.')
        }
    }
    const DisplayCompareCosting = (el, data) => {
        setId(data.CostingNumber)
        // setCompareCostingObj(el)
        let obj = {
            simulationId: simulationDetail?.SimulationId,
            costingId: data?.CostingId
        }
        dispatch(storePartNumber({ partId: data?.PartId, partNumber: data?.PartNumber }))
        dispatch(getComparisionSimulationData(obj, res => {
            const Data = res.data.Data
            const obj1 = formViewData(Data.OldCosting, 'Old Costing')
            const obj2 = formViewData(Data.NewCosting, 'New Costing')
            const obj3 = formViewData(Data.Variance, 'Variance')
            const objj3 = [obj1[0], obj2[0], obj3[0]]
            objj3[1].SimulationId = Data?.SimulationId
            objj3[1].SimulationStatusId = Data?.SimulationStatusId
            dispatch(setCostingViewData(objj3))
            setCompareCosting(true)
            setTechnologyName(obj1[0]?.technology)
        }))
    }

    const returnExcelColumnSecond = () => {

        return (

            <ExcelSheet data={simulationAssemblyListSummary} name={AssemblyWiseImpactt}>
                {ASSEMBLY_WISEIMPACT_DOWNLOAD_EXCEl && ASSEMBLY_WISEIMPACT_DOWNLOAD_EXCEl.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
    }

    const returnExcelColumnImpactedMaster = () => {
        let multiDataSet = impactmasterDownload(impactedMasterData)
        return (

            <ExcelSheet dataSet={multiDataSet} name={ImpactMaster} />
        );
    }

    const renderColumn = () => {
        let finalGrid = [], isTokenAPI = false, downloadGrid = []
        downloadGrid = dataForDownload && dataForDownload.map((item) => {
            if (item.IsMultipleRM === true) {
                item.RMName = 'Multiple RM'
                item.RMCode = 'Multiple RM'
                item.RMSpecs = 'Multiple RM'
                item.RMGrade = 'Multiple RM'
            } if (item.IsMultipleOperation === true) {
                item.OperationName = 'Multiple Operation'
                item.OperationCode = 'Multiple Operation'
            } if (item.IsMultipleSTOperation === true) {
                item.OperationName = 'Multiple Surface Treatment'
                item.OperationCode = 'Multiple Surface Treatment'
            } if (item.IsMultipleBOP === true) {
                item.BoughtOutPartName = 'Multiple BOP'
                item.BoughtOutPartNumber = 'Multiple BOP'
            } if (item?.IsMultipleMachine === true) {
                item.MachineName = 'Multiple Process'
                item.MachineNumber = 'Multiple Process'
            }
            return item
        })
        if (showBOPColumn === true || showRMColumn === true || showOperationColumn === true || showSurfaceTreatmentColumn === true ||
            showExchangeRateColumn === true || showMachineRateColumn === true || showCombinedProcessColumn === true) {
            if (showBOPColumn || isBOPDomesticOrImport) {
                finalGrid = [...finalGrid, ...BOPGridForTokenSummary]
                isTokenAPI = true
            }
            if (showRMColumn || isRMDomesticOrRMImport) {
                finalGrid = [...finalGrid, ...RMGridForTokenSummary]
                isTokenAPI = true
            }
            if (showOperationColumn || isOperation) {
                finalGrid = [...finalGrid, ...OperationGridForTokenSummary]
                isTokenAPI = true
            }
            if (showSurfaceTreatmentColumn || isSurfaceTreatment) {
                finalGrid = [...finalGrid, ...STGridForTokenSummary]
                isTokenAPI = true
            }
            if (showMachineRateColumn || isMachineRate) {
                finalGrid = [...finalGrid, ...MRGridForTokenSummary]
                isTokenAPI = true
            }
            // if (showExchangeRateColumn || isOperation) {         
            //     finalGrid = [...finalGrid, ...OperationGridForTokenSummary]
            // isTokenAPI = true
            // }
            // if (showMachineRateColumn || isMachineRate) {
            //     finalGrid = [...finalGrid, ...OperationGridForTokenSummary]
            // isTokenAPI = true
            // }
            if (showCombinedProcessColumn || isCombinedProcess) {
                finalGrid = [...finalGrid, ...CPGridForTokenSummary]
            }
            finalGrid = [...InitialGridForTokenSummary, ...finalGrid, ...LastGridForTokenSummary]
        }
        if (isMultiTechnology) {
            return returnExcelColumn(isTokenAPI ? finalGrid : SIMULATIONAPPROVALSUMMARYDOWNLOADASSEMBLYTECHNOLOGY, downloadGrid?.length > 0 ? downloadGrid : [])
        }
        else {
            let listRM = []
            let listBOP = []
            let listST = []
            let listOP = []
            let listMR = []
            let listCP = []
            let listER = []
            if (!showSaLineNumber()) {
                // Hide the specified columns using the common function
                listRM = hideMultipleColumnFromExcel(SIMULATIONAPPROVALSUMMARYDOWNLOADRM, ['SANumber', 'LineNumber']);
                listBOP = hideMultipleColumnFromExcel(isMasterAssociatedWithCosting ? SIMULATIONAPPROVALSUMMARYDOWNLOADBOP : SIMULATIONAPPROVALSUMMARYDOWNLOADBOPWITHOUTCOSTING, ['SANumber', 'LineNumber']);
                listST = hideMultipleColumnFromExcel(SIMULATIONAPPROVALSUMMARYDOWNLOADST, ['SANumber', 'LineNumber']);
                listOP = hideMultipleColumnFromExcel(SIMULATIONAPPROVALSUMMARYDOWNLOADOPERATION, ['SANumber', 'LineNumber']);
                listMR = hideMultipleColumnFromExcel(SIMULATIONAPPROVALSUMMARYDOWNLOADMR, ['SANumber', 'LineNumber']);
                listCP = hideMultipleColumnFromExcel(SIMULATIONAPPROVALSUMMARYDOWNLOADCP, ['SANumber', 'LineNumber']);
                listER = hideMultipleColumnFromExcel(SIMULATIONAPPROVALSUMMARYDOWNLOADER, ['SANumber', 'LineNumber']);
            }
            switch (String(SimulationTechnologyId)) {
                case RMDOMESTIC:
                case RMIMPORT:
                    return returnExcelColumn(isTokenAPI ? finalGrid : !showSaLineNumber() ? listRM : SIMULATIONAPPROVALSUMMARYDOWNLOADRM, downloadGrid?.length > 0 ? downloadGrid : [])
                case SURFACETREATMENT:
                    return returnExcelColumn(isTokenAPI ? finalGrid : !showSaLineNumber() ? listST : SIMULATIONAPPROVALSUMMARYDOWNLOADST, downloadGrid?.length > 0 ? downloadGrid : [])
                case OPERATIONS:
                    return returnExcelColumn(isTokenAPI ? finalGrid : !showSaLineNumber() ? listOP : SIMULATIONAPPROVALSUMMARYDOWNLOADOPERATION, downloadGrid?.length > 0 ? downloadGrid : [])
                case BOPDOMESTIC:
                case BOPIMPORT:
                    return returnExcelColumn(isTokenAPI ? finalGrid : !showSaLineNumber() ? listBOP : (isMasterAssociatedWithCosting ? SIMULATIONAPPROVALSUMMARYDOWNLOADBOP : SIMULATIONAPPROVALSUMMARYDOWNLOADBOPWITHOUTCOSTING), downloadGrid?.length > 0 ? downloadGrid : [])
                case MACHINERATE:
                    return returnExcelColumn(isTokenAPI ? finalGrid : !showSaLineNumber() ? listMR : SIMULATIONAPPROVALSUMMARYDOWNLOADMR, downloadGrid?.length > 0 ? downloadGrid : [])
                case EXCHNAGERATE:
                    return returnExcelColumn(isTokenAPI ? finalGrid : !showSaLineNumber() ? listER : SIMULATIONAPPROVALSUMMARYDOWNLOADER, downloadGrid?.length > 0 ? downloadGrid : [])
                case COMBINED_PROCESS:
                    return returnExcelColumn(isTokenAPI ? finalGrid : !showSaLineNumber() ? listCP : SIMULATIONAPPROVALSUMMARYDOWNLOADCP, downloadGrid?.length > 0 ? downloadGrid : [])
                default:
                    break;
            }
        }

    }

    const returnExcelColumn = (data = [], TempData) => {
        let tempData = [...data]
        if (!reactLocalStorage.getObject('CostingTypePermission').cbc) {
            tempData = hideColumnFromExcel(tempData, 'CustomerName')
        } else {
            if (simulationDetail?.SimulationHeadId === CBCTypeId) {
                tempData = hideColumnFromExcel(tempData, 'VendorName')
            } else {
                tempData = hideColumnFromExcel(tempData, 'CustomerName')
            }
        }
        let temp = []
        temp = SimulationUtils(TempData)    // common function 


        return (<ExcelSheet data={temp} name={'Costing Summary'}>
            {tempData && tempData.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
        </ExcelSheet>);
    }

    const verifyImpactDrawer = (e = '', type) => {
        if (type === 'cancel') {
            setIsVerifyImpactDrawer(false);
        }
    }

    const ecnFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props?.valueFormatted : props?.value;
        
        // Return a value to prevent the "Nothing was returned from render" error
        return cellValue ? cellValue : '-';
      }
      

    const revisionFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        return cell !== null ? cell : '-'
    }
    const returnVarianceClass = (value1, value2) => {
        if (simulationDetail?.SimulationHeadId === CBCTypeId ? value1 < value2 : value1 > value2) {
            return 'red-value form-control'
        } else if (simulationDetail?.SimulationHeadId === CBCTypeId ? value1 > value2 : value1 < value2) {
            return 'green-value form-control'
        } else {
            return 'form-class'
        }
    }
    const oldPOFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row.NewPOPrice, row.OldPOPrice)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, initialConfiguration?.NoOfDecimalForPrice)}</span> : ''
    }

    const newPOFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row.NewPOPrice, row.OldPOPrice)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, initialConfiguration?.NoOfDecimalForPrice)}</span> : ''
    }

    const oldRMFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row.NewNetRawMaterialsCost, row.OldNetRawMaterialsCost)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, initialConfiguration?.NoOfDecimalForPrice)}</span> : ''
    }

    const newRMFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row.NewNetRawMaterialsCost, row.OldNetRawMaterialsCost)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, initialConfiguration?.NoOfDecimalForPrice)}</span> : ''
    }
    const oldPOCurrencyFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row.NewNetPOPriceOtherCurrency, row.OldNetPOPriceOtherCurrency)
        // const classGreen = (row.NewNetPOPriceOtherCurrency > row.OldNetPOPriceOtherCurrency) ? 'red-value form-control' : (row.NewNetPOPriceOtherCurrency < row.OldNetPOPriceOtherCurrency) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, initialConfiguration?.NoOfDecimalForPrice)}</span> : ''
    }

    const newPOCurrencyFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row.NewNetPOPriceOtherCurrency, row.OldNetPOPriceOtherCurrency)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, initialConfiguration?.NoOfDecimalForPrice)}</span> : ''
    }

    const oldERFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row.NewExchangeRate, row.OldExchangeRate)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, initialConfiguration?.NoOfDecimalForPrice)}</span> : ''
    }

    const newERFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row.NewExchangeRate, row.OldExchangeRate)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, initialConfiguration?.NoOfDecimalForPrice)}</span> : ''
    }

    const oldBOPFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row.NewNetBoughtOutPartCost, checkForDecimalAndNull(row.OldNetBoughtOutPartCost, initialConfiguration?.NoOfDecimalForPrice))
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, initialConfiguration?.NoOfDecimalForPrice)}</span> : ''
    }

    const newBOPFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row.NewNetBoughtOutPartCost, checkForDecimalAndNull(row.OldNetBoughtOutPartCost, initialConfiguration?.NoOfDecimalForPrice))
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, initialConfiguration?.NoOfDecimalForPrice)}</span> : ''
    }
    const processFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row.NewNetProcessCost, row.OldNetProcessCost)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, initialConfiguration?.NoOfDecimalForPrice)}</span> : ''
    }

    const varianceFormatter = (props) => {
        const cell = props?.value;
        let variance = checkForDecimalAndNull(cell, initialConfiguration?.NoOfDecimalForPrice)
        variance = variance > 0 ? `+${variance}` : variance;
        return variance;
    }

    const BOPVarianceFormatter = (props) => {
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        let variance = checkForDecimalAndNull(row.NetBoughtOutPartCostVariance, initialConfiguration?.NoOfDecimalForPrice)
        variance = variance > 0 ? `+${variance}` : variance;
        return variance;
    }
    const OPVarianceFormatter = (props) => {
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        let variance = checkForDecimalAndNull(row.OperationCostVariance, initialConfiguration?.NoOfDecimalForPrice)
        variance = variance > 0 ? `+${variance}` : variance;
        return variance;
    }
    const STVarianceFormatter = (props) => {
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        let variance = checkForDecimalAndNull(row.NetSurfaceTreatmentCostVariance, initialConfiguration?.NoOfDecimalForPrice)
        variance = variance > 0 ? `+${variance}` : variance;
        return variance;
    }
    const processVarianceFormatter = (props) => {
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        let variance = checkForDecimalAndNull(row.NetProcessCostVariance, initialConfiguration?.NoOfDecimalForPrice)
        variance = variance > 0 ? `+${variance}` : variance;
        return variance;
    }

    const POVarianceFormatter = (props) => {
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        let variance = checkForDecimalAndNull(row.POVariance, initialConfiguration?.NoOfDecimalForPrice)
        variance = variance > 0 ? `+${variance}` : variance;
        return variance;
    }

    const oldSTFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        const classGreen = (row.NewNetSurfaceTreatmentCost > row.OldNetSurfaceTreatmentCost) ? 'red-value form-control' : (row.NewNetSurfaceTreatmentCost < row.OldNetSurfaceTreatmentCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, initialConfiguration?.NoOfDecimalForPrice)}</span> : ''
    }

    const newSTFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        const classGreen = (row.NewNetSurfaceTreatmentCost > row.OldNetSurfaceTreatmentCost) ? 'red-value form-control' : (row.NewNetSurfaceTreatmentCost < row.OldNetSurfaceTreatmentCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, initialConfiguration?.NoOfDecimalForPrice)}</span> : ''
    }

    const oldOperationFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        const classGreen = (row.NewOperationCost > row.OldOperationCost) ? 'red-value form-control' : (row.NewOperationCost < row.OldOperationCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, initialConfiguration?.NoOfDecimalForPrice)}</span> : ''
    }

    const newOperationFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        const classGreen = (row.NewOperationCost > row.OldOperationCost) ? 'red-value form-control' : (row.NewOperationCost < row.OldOperationCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, initialConfiguration?.NoOfDecimalForPrice)}</span> : ''
    }

    const plantFormatter = (props) => {
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        const temp = `${row.PlantName}`
        return <span title={temp}>{temp}</span>
    }
    const categoryFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data ?? '-';
        const temp = `${row?.Category ?? '-'}`
        return <span title={temp}>{temp}</span>
    }
    const percentageFormatter = (props) => {
        const cell = props?.value;
        return cell != null ? checkForDecimalAndNull(cell, initialConfiguration?.NoOfDecimalForPrice) : '-'
    }

    const viewAssembly = (cell, row, rowIndex) => {
        const data = row
        setDataForAssemblyImpact(data)
        setShowViewAssemblyDrawer(true)
    }

    const closeAssemblyDrawer = () => {
        // setAssemblyWiseAcc(false)
        // if (DataForAssemblyImpactForFg !== undefined && (Object.keys(DataForAssemblyImpactForFg)?.length !== 0 || DataForAssemblyImpactForFg?.length > 0) && count === 0) {
        //     let requestData = []
        //     DataForAssemblyImpactForFg && DataForAssemblyImpactForFg.map(item => {
        //         requestData.push({ CostingId: item.CostingId, delta: item.POVariance, IsSinglePartImpact: false })
        //         return null
        //     })
        //     setCount(1)
        //     dispatch(getSimulatedAssemblyWiseImpactDate(requestData, (res) => { }))
        //     setCount(0)
        // }
        setShowViewAssemblyDrawer(false)
        setCompareCosting(false)
        // setTimeout(() => {
        // setAssemblyWiseAcc(true)
        // }, 350);
    }

    // WHEN FGWISE API IS PENDING THEN THIS CODE WILL MOUNT FOR DISABLED FGWISE ACCORDION
    const fgWiseAccDisable = (data) => {
        setAccDisable(data)
    }

    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            if (costingList?.length !== 0) {
                setNoData(searchNocontentFilter(value, noData))
            }
        }, 500);
    }
    const buttonFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        return (
            <>
                <Link to="compare-costing" spy={true} title="Compare" smooth={true} activeClass="active" ><button className="Balance mb-0" type={'button'} onClick={() => DisplayCompareCosting(cell, row)}></button></Link>
                {row?.IsAssemblyExist && <button className="hirarchy-btn" title='Assembly Impact' type={'button'} onClick={() => { viewAssembly(cell, row, props?.rowIndex) }}> </button>}
            </>
        )
    }

    const newBasicRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        return (
            <>
                <span className={`${!isbulkUpload ? '' : ''}`} >{cell ? cell : row.BasicRate} </span>
            </>
        )
    }

    const newScrapRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        return (
            <>
                <span className={`${!isbulkUpload ? '' : ''}`} >{cell ? cell : row.ScrapRate}</span>
            </>
        )
    }
    const freightCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        return cell != null ? cell : '-';
    }
    const shearingCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        return cell != null ? cell : '-';
    }



    const costFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        const tempA = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost);
        const classGreen = (tempA > row.NetLandedCost) ? 'red-value form-control' : (tempA < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, initialConfiguration?.NoOfDecimalForPrice)}</span> : ''
    }

    const NewcostFormatter = (props) => {
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        const NewBasicRate = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost)
        const classGreen = (NewBasicRate > row.NetLandedCost) ? 'red-value form-control' : (NewBasicRate < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
        return row.NewBasicRate != null ? <span className={classGreen}>{checkForDecimalAndNull(NewBasicRate, initialConfiguration?.NoOfDecimalForPrice)}</span> : ''
        // checkForDecimalAndNull(NewBasicRate, initialConfiguration?.NoOfDecimalForPrice)
    }

    const effectiveDateFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        return cell != null ? DayTime(cell).format('DD/MM/YYYY') : '-';
    }

    //MINDA
    const handleApproveAndPushButton = () => {
        setShowPushDrawer(true)
        setApproveDrawer(true)
    }
    //MINDA
    const rawMaterailFormat = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        const temp = row.IsMultipleRM === true ? 'Multiple RM' : `${cell}- ${row.RMGrade}`
        return cell != null ? temp : '-';
    }

    const rawMaterailCodeSpecFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        const temp = row.IsMultipleRM === true ? 'Multiple RM' : cell
        return cell != null ? temp : '-';
    }

    const bopNameFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        let temp = ''
        temp = (row.IsMultipleBOP === true) ? 'Multiple BOP' : row.BoughtOutPartName
        return cell != null ? temp : '-';
    }

    const processNameFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        let temp = ''
        temp = (row.IsMultipleProcess === true) ? 'Multiple Process' : row.ProcessName
        return cell != null ? temp : '-';
    }

    const processCodeFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        let temp = ''
        temp = (row.IsMultipleProcess === true) ? 'Multiple Process' : row.ProcessCode
        return cell != null ? temp : '-';
    }

    const decimalFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? checkForDecimalAndNull(cellValue, initialConfiguration?.NoOfDecimalForPrice) : '-';
    }

    const bopNumberFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        let temp = ''
        temp = (row.IsMultipleBOP === true) ? 'Multiple BOP' : row.BoughtOutPartNumber
        return cell != null ? temp : '-';
    }

    const operationNameFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        let temp = ''
        temp = row.OperationName
        if (row.IsMultipleSTOperation === true) {
            temp = 'Multiple Surface Treatment'
        } if (row.IsMultipleOperation === true) {
            temp = 'Multiple Operation'
        }
        return cell != null ? temp : '-';
    }

    const operationCodeFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        let temp = ''
        temp = row.OperationCode
        if (row.IsMultipleSTOperation === true) {
            temp = 'Multiple Surface Treatment'
        } if (row.IsMultipleOperation === true) {
            temp = 'Multiple Operation'
        }
        return cell != null ? <span title={temp}>{temp}</span> : '-';
    }
    const tooltipToggle = (costingId) => {
        setTooltipStates((prevTooltipStates) => ({
            ...prevTooltipStates,
            [costingId]: !prevTooltipStates[costingId]
        }));
    };

    const partFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        return (
            <>
                {cell}
                {row?.IsImpactedPart && (
                    <i
                        className={`fa fa-info-circle tooltip_custom_right tooltip-icon mb-2 pb-1 ml-5 float-unset`}
                        id={`bop-tooltip${row?.CostingId}`}
                        onMouseEnter={() => tooltipToggle(row?.CostingId)}
                        onMouseLeave={() => tooltipToggle(row?.CostingId)}
                    ></i>
                )}
            </>
        )
    }

    const impactPerQuarterFormatter = (props) => {
        const cell = props?.value;
        return cell != null ? checkForDecimalAndNull(cell, initialConfiguration?.NoOfDecimalForPrice) : '-'
    }

    if (showListing === true) {
        return <Redirect to={{
            pathname: fromDashboard ? "/" : "/simulation-history",
            state: fromDashboard ? {
                activeTab: '1',  // Or whichever tab the user came from
                module: 'simulation'
            } : undefined
        }} />
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
        if (!isMasterAssociatedWithCosting) {
            params.api.sizeColumnsToFit();
        }
        const isTooltip = costingList.filter(item => item.IsImpactedPart === true)
        setListWithTooltip(isTooltip)
        setTimeout(() => {
            setShowTooltip(true)
        }, 300);
    };



    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));

    };

    const onFilterTextBoxChanged = (e) => {
        gridApi?.setQuickFilter(e?.target?.value);
        setTextFilterSearch(e?.target?.value)
    }

    const resetState = (e) => {
        gridApi.setQuickFilter('');
        setTextFilterSearch('')
        gridOptions?.columnApi?.resetColumnState();
        gridOptions?.api?.setFilterModel(null);
        if (!isMasterAssociatedWithCosting) {
            gridApi.sizeColumnsToFit();
        }
    }

    const frameworkComponents = {
        // totalValueRenderer: this.buttonFormatter,
        // effectiveDateRenderer: this.effectiveDateFormatter,
        // costingHeadRenderer: this.costingHeadFormatter,
        ecnFormatter: ecnFormatter,
        revisionFormatter: revisionFormatter,
        oldPOFormatter: oldPOFormatter,
        newPOFormatter: newPOFormatter,
        oldRMFormatter: oldRMFormatter,
        buttonFormatter: buttonFormatter,
        newRMFormatter: newRMFormatter,
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
        newBasicRateFormatter: newBasicRateFormatter,
        newScrapRateFormatter: newScrapRateFormatter,
        shearingCostFormatter: shearingCostFormatter,
        freightCostFormatter: freightCostFormatter,
        NewcostFormatter: NewcostFormatter,
        costFormatter: costFormatter,
        effectiveDateFormatter: effectiveDateFormatter,
        rawMaterailFormat: rawMaterailFormat,
        varianceFormatter: varianceFormatter,
        newERFormatter: newERFormatter,
        oldERFormatter: oldERFormatter,
        oldPOCurrencyFormatter: oldPOCurrencyFormatter,
        newPOCurrencyFormatter: newPOCurrencyFormatter,
        POVarianceFormatter: POVarianceFormatter,
        operationNameFormatter: operationNameFormatter,
        oldBOPFormatter: oldBOPFormatter,
        newBOPFormatter: newBOPFormatter,
        BOPVarianceFormatter: BOPVarianceFormatter,
        OPVarianceFormatter: OPVarianceFormatter,
        STVarianceFormatter: STVarianceFormatter,
        bopNameFormatter: bopNameFormatter,
        newSTFormatter: newSTFormatter,
        oldSTFormatter: oldSTFormatter,
        newOperationFormatter: newOperationFormatter,
        oldOperationFormatter: oldOperationFormatter,
        plantFormatter: plantFormatter,
        categoryFormatter: categoryFormatter,
        rawMaterailCodeSpecFormatter: rawMaterailCodeSpecFormatter,
        operationCodeFormatter: operationCodeFormatter,
        bopNumberFormatter: bopNumberFormatter,
        impactPerQuarterFormatter: impactPerQuarterFormatter,
        processCodeFormatter: processCodeFormatter,
        processNameFormatter: processNameFormatter,
        decimalFormatter: decimalFormatter,
        processFormatter: processFormatter,
        processVarianceFormatter: processVarianceFormatter,
        percentageFormatter: percentageFormatter,
        partFormatter: partFormatter
    };
    const deleteFile = (FileId, OriginalFileName) => {
        if (FileId != null) {
            // dispatch(fileDeleteCosting(deleteData, (res) => {
            //     Toaster.success('File deleted successfully.')
            //   }))
            let tempArr = files && files.filter(item => item.FileId !== FileId)
            setFiles(tempArr)
            setIsOpen(!IsOpen)
        }
        if (FileId == null) {
            let tempArr = files && files.filter(item => item.FileName !== OriginalFileName)
            setFiles(tempArr)
            setIsOpen(!IsOpen)
        }
    }
    const callPushAPI = debounce(() => {
        let obj = {
            "BaseCositngId": null,
            "LoggedInUserId": loggedInUserId(),
            "SimulationId": simulationDetail?.SimulationId,
            "BoughtOutPartId": null,
        }
        dispatch(approvalPushedOnSap(obj, res => {
            if (res?.data?.DataList && res?.data?.DataList[0]?.IsPushed === false) {
                Toaster.error(res?.data?.DataList[0]?.Message)
            } else if (res?.data?.Result) {
                Toaster.success('Approval pushed successfully.')
            }
            setShowListing(true)
        }))
    }, 500)

    const header = {
        RevisedNetCost: `Revised Net Cost ${reactLocalStorage.getObject("baseCurrency")}`
    }
    const vendorList = (vendorName) => {
        const vendorArray = vendorName ? vendorName?.split(',').map(vendor => vendor.trim()) : [];
        switch (vendorArray?.length) {
            case 0:
                return ''
            case 1:
                return vendorArray[0];
            default:
                return <>
                    <div className='view-all-wrapper word-nowrap'>{vendorArray[0]}<Popup trigger={<button id={`popUpTriggerProfit`} className="view-btn" type={'button'}><span className="ml-1">+{vendorArray?.length - 1}</span></button>}
                        position="bottom center">
                        <ul className="px-1 view-all-list">
                            {vendorArray && vendorArray.map((item, index) => {
                                if (index === 0) return false
                                return <li key={item}>{item}</li>
                            })}
                        </ul>
                    </Popup>
                    </div>
                </>
        }
    }
    const CheckFinalLevel = (value) => {
        setFinalLevelUser(value)
    }
    return (
        <>
            {showListing === false &&
                <>
                    <CalculatorWrapper />
                    {/* {!loader && <LoaderCustom />} */}
                    <div className={`container-fluid  smh-approval-summary-page ${!loader === true ? '' : ''}`} id="go-to-top">
                        {getConfigurationKey()?.IsSAPConfigured && costingList[0]?.CostingId && <ErrorMessage module="Simulation" id={simulationDetail?.SimulationId} approvalNumber={approvalNumber} />}
                        <h2 className="heading-main">Approval Summary</h2>
                        <ScrollToTop pointProp={"go-to-top"} />
                        <Row>
                            <Col md="8">
                                <div className="left-border">
                                    {'Approval Workflow (Token No. '}
                                    {`${simulationDetail && simulationDetail?.Token ? simulationDetail?.Token : '-'}):`}
                                </div >
                            </Col >
                            <Col md="4" className="text-right">
                                <div className="right-border">
                                    <button type={'button'} className="apply mr5" onClick={() => setShowListing(true)}>
                                        <div className={'back-icon'}></div>
                                        {'Back '}
                                    </button>
                                    <button type={'button'} className="apply mr5" onClick={() => setViewButton(true)}>
                                        View All
                                    </button>
                                    {/* <button className="user-btn mr5 save-btn" onClick={VerifyImpact}>
                                        <div className={"save-icon"}></div>{"Verify Impact "}
                                    </button> */}
                                </div>
                            </Col>
                        </Row >

                        {/* Code for approval workflow */}
                        <ApprovalWorkFlow approvalLevelStep={approvalLevelStep} approvalNo={simulationDetail?.Token} approverData={dataForFetchingAllApprover} viewAll={() => setViewButton(true)} />

                        <Row>
                            <Col md="10"><div className="left-border">{'Amendment Details:'}</div></Col>
                            {/* <Col md="2" className="text-right">
                                <div className="right-border">
                                    <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setAmendment(!amendment) }}>
                                        {amendment ? (
                                            <i className="fa fa-minus" ></i>
                                        ) : (
                                            <i className="fa fa-plus"></i>
                                        )}
                                    </button>
                                </div>
                            </Col> */}
                        </Row>
                        {/* {amendment && */}
                        <Row>
                            <Col md="12" className="mb-2">
                                <Table responsive className="table cr-brdr-main sub-table">  {/* sub table class is alternative className which will use in future for added styles */}
                                    <thead>
                                        <tr>
                                            <th>Token No:</th>
                                            {isMasterAssociatedWithCosting && <th>Technology:</th>}
                                            {Number(SimulationTechnologyId) !== Number(RAWMATERIALINDEX) && <th>Parts Supplied:</th>}
                                            <th>{handleDepartmentHeader()} Code:</th>
                                            {Number(SimulationTechnologyId) !== Number(RAWMATERIALINDEX) && <>
                                                {String(SimulationTechnologyId) !== EXCHNAGERATE && <th>Costing Head:</th>}
                                                {simulationDetail?.SimulationHeadId !== CBCTypeId && simulationDetail?.SimulationHeadId !== ZBCTypeId && <th>{vendorLabel} (Code):</th>}
                                                {simulationDetail?.SimulationHeadId === ZBCTypeId && <th>Plant (Code):</th>}
                                                {simulationDetail?.SimulationHeadId === CBCTypeId && <th>Customer (Code):</th>}
                                                <th>Impacted Parts:</th>
                                            </>}
                                            <th>Reason:</th>
                                            <th>Master:</th>
                                            {Number(SimulationTechnologyId) !== Number(RAWMATERIALINDEX) && <th>Effective Date:</th>}
                                            {isMasterAssociatedWithCosting && <th>Impact/Quarter (w.r.t. Existing):</th>}
                                            {isMasterAssociatedWithCosting && <th>Impact/Quarter (w.r.t. Budgeted Price):</th>}
                                        </tr >
                                    </thead >
                                    <tbody>
                                        <tr>
                                            <td>{simulationDetail && simulationDetail?.AmendmentDetails?.TokenNumber}</td>
                                            {isMasterAssociatedWithCosting && <td>{simulationDetail && simulationDetail?.AmendmentDetails?.Technology}</td>}
                                            {Number(SimulationTechnologyId) !== Number(RAWMATERIALINDEX) && <td>{simulationDetail && simulationDetail?.AmendmentDetails?.PartsSupplied}</td>}
                                            <td>{simulationDetail && simulationDetail?.DepartmentCode ? simulationDetail?.DepartmentCode : '-'}</td>
                                            {Number(SimulationTechnologyId) !== Number(RAWMATERIALINDEX) && <>
                                                {String(SimulationTechnologyId) !== EXCHNAGERATE && <td>{simulationDetail && simulationDetail?.AmendmentDetails?.CostingHead}</td>}
                                                {simulationDetail?.SimulationHeadId !== CBCTypeId && simulationDetail?.SimulationHeadId !== ZBCTypeId && <td>{vendorList(simulationDetail && simulationDetail?.AmendmentDetails?.VendorName)}</td>}
                                                {simulationDetail?.SimulationHeadId === ZBCTypeId && <td>{simulationDetail && simulationDetail?.AmendmentDetails?.PlantName}</td>}
                                                {simulationDetail?.SimulationHeadId === CBCTypeId && <td>{simulationDetail && simulationDetail?.AmendmentDetails?.CustomerName}</td>}
                                                <td>{simulationDetail && simulationDetail?.AmendmentDetails?.ImpactParts}</td>
                                            </>}
                                            <td>{simulationDetail && simulationDetail?.AmendmentDetails?.Reason}</td>
                                            <td>{simulationDetail && simulationDetail?.AmendmentDetails?.SimulationTechnology}</td>
                                            {Number(SimulationTechnologyId) !== Number(RAWMATERIALINDEX) && <td>{simulationDetail && DayTime(simulationDetail?.AmendmentDetails?.EffectiveDate).format('DD/MM/YYYY')}</td>}
                                            {isMasterAssociatedWithCosting && <td>{simulationDetail && (simulationDetail?.TotalImpactPerQuarter ? checkForDecimalAndNull(simulationDetail?.TotalImpactPerQuarter, initialConfiguration?.NoOfDecimalForPrice) : '-')}</td>}
                                            {isMasterAssociatedWithCosting && <td>{simulationDetail && (simulationDetail?.TotalBudgetedPriceImpactPerQuarter ? checkForDecimalAndNull(simulationDetail?.TotalBudgetedPriceImpactPerQuarter, initialConfiguration?.NoOfDecimalForPrice) : '-')}</td>}
                                        </tr >
                                    </tbody >
                                </Table >
                            </Col >
                        </Row >
                        {/* } */}
                        {(Number(SimulationTechnologyId) !== Number(RAWMATERIALINDEX) && !isMultiTechnology) && < Row className='reset-btn-container' >
                            <Col md="6"><div className="left-border ">{'Impacted Master Data:'}</div></Col>
                            <Col md="6" className="text-right">
                                <div className={'right-details'}>
                                    <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setshowImpactedData(!showImpactedData) }}>
                                        {showImpactedData ? (
                                            <i className="fa fa-minus" ></i>
                                        ) : (
                                            <i className="fa fa-plus"></i>
                                        )}
                                    </button>
                                </div>
                            </Col>
                            {/* {lastRevisionDataAccordian && */}

                            <div className="accordian-content w-100 px-3 impacted-min-height">
                                {showImpactedData && <Impactedmasterdata data={impactedMasterDataListForImpactedMaster} masterId={simulationDetail?.SimulationTechnologyId} viewCostingAndPartNo={false} lastRevision={false} />}

                            </div>
                            {/* } */}
                            {/* <div className="accordian-content w-100 px-3 impacted-min-height">
                                {showImpactedData && <Impactedmasterdata data={simulationDetail?.ImpactedMasterDataList} masterId={simulationDetail?.SimulationTechnologyId} viewCostingAndPartNo={false} />}

                            </div> */}

                        </Row >}

                        {/* FG wise Impact section start */}
                        {isMasterAssociatedWithCosting && <>
                            <Row className='mt-2'>
                                <Col md="10">
                                    <div className="left-border">{'FG wise Impact:'}</div>
                                </Col>
                                <Col md="2" className="text-right">
                                    <div className="right-border">
                                        <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setFgWiseDataAcc(!fgWiseDataAcc) }}>
                                            {fgWiseDataAcc ? (
                                                <i className="fa fa-minus" ></i>
                                            ) : (
                                                <i className="fa fa-plus"></i>
                                            )}
                                        </button>
                                    </div>
                                </Col>
                            </Row>
                            {
                                fgWiseDataAcc &&
                                <Fgwiseimactdata
                                    DisplayCompareCosting={DisplayCompareCosting}
                                    SimulationId={simulationDetail?.SimulationId}
                                    headerName={headerName}
                                    impactType={'FgWise'}
                                    tooltipEffectiveDate={DayTime(simulationDetail?.AmendmentDetails?.EffectiveDate).format('DD/MM/YYYY')}
                                    fgWiseAccDisable={fgWiseAccDisable}
                                    isSimulation={true}
                                    costingIdArray={costingIdArray}
                                />
                            }
                        </>}

                        {/* FG wise Impact section end */}

                        <Row className='mt-2'>
                            <Col md="10">
                                <div className="left-border">{'Summary:'}</div>
                            </Col>
                            <Col md="2" className="text-right">
                                <div className="right-border">
                                    <button className="btn btn-small-primary-circle ml-1" type="button" value={textFilterSearch} onClick={() => { setCostingSummary(!costingSummary) }}>
                                        {costingSummary ? (
                                            <i className="fa fa-minus" ></i>
                                        ) : (
                                            <i className="fa fa-plus"></i>
                                        )}
                                    </button>
                                </div>
                            </Col>
                        </Row>
                        {
                            listWithTooltip?.length !== 0 && listWithTooltip.map(item => {
                                return showTooltip && <Tooltip
                                    key={`tooltip-${item.CostingId}`}
                                    className=""
                                    placement={"top"}
                                    isOpen={tooltipStates[item.CostingId]}
                                    toggle={() => tooltipToggle(item.CostingId)}
                                    target={`bop-tooltip${item.CostingId}`}
                                >
                                    {`This part is impacted by ${showBopLabel()} costing`}
                                </Tooltip>
                            })
                        }

                        {
                            costingSummary && keysForDownloadSummary && Object.keys(keysForDownloadSummary)?.length > 0 && Number(SimulationTechnologyId) !== Number(RAWMATERIALINDEX) &&
                            <>
                                <div className={`ag-grid-react`}>
                                    { }
                                    <Row className="pb-2">
                                        <Col md="12">
                                            <Row>
                                                <Col>
                                                    <div className={`ag-grid-wrapper height-width-wrapper ${(costingList && costingList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                                                        <div className="ag-grid-header d-flex align-items-center">
                                                            <input type="text" className="form-control table-search mr-1" id="filter-text-box" value={textFilterSearch} placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                                            <button type="button" className="user-btn float-right mr5" title="Reset Grid" onClick={() => resetState()}>
                                                                <div className="refresh mr-0"></div>
                                                            </button>
                                                            {(keysForDownloadSummary?.IsBoughtOutPartSimulation || keysForDownloadSummary?.IsSurfaceTreatmentSimulation || keysForDownloadSummary?.IsOperationSimulation ||
                                                                keysForDownloadSummary?.IsRawMaterialSimulation || keysForDownloadSummary?.IsMachineProcessSimulation || keysForDownloadSummary?.IsExchangeRateSimulation
                                                                // || keysForDownloadSummary?.IsCombinedProcessSimulation               //RE
                                                            )
                                                                ?
                                                                < ExcelFile filename={'Costing'} fileExtension={'.xls'} element={
                                                                    <button title="Download" type="button" className={'user-btn'} ><div className="download mr-0"></div></button>}>
                                                                    {renderColumn()}
                                                                    {returnExcelColumnSecond()}
                                                                    {returnExcelColumnImpactedMaster()}

                                                                </ExcelFile> :
                                                                <ExcelFile filename={'Costing'} fileExtension={'.xls'} element={
                                                                    <button title="Download" type="button" className={'user-btn'} ><div className="download mr-0"></div></button>}>
                                                                    {renderColumn()}
                                                                    {returnExcelColumnSecond()}
                                                                </ExcelFile>

                                                            }
                                                        </div>
                                                        <div className="ag-theme-material" >
                                                            {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found simulation-lisitng" />}
                                                            <AgGridReact
                                                                style={{ height: '100%', width: '100%' }}
                                                                defaultColDef={defaultColDef}
                                                                floatingFilter={true}
                                                                domLayout='autoHeight'
                                                                // columnDefs={c}
                                                                rowData={costingList}
                                                                pagination={true}
                                                                paginationPageSize={defaultPageSize}
                                                                onGridReady={onGridReady}
                                                                gridOptions={gridOptions}
                                                                loadingOverlayComponent={'customLoadingOverlay'}
                                                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                                                noRowsOverlayComponentParams={{
                                                                    title: EMPTY_DATA,
                                                                }}
                                                                frameworkComponents={frameworkComponents}
                                                                onFilterModified={onFloatingFilterChanged}
                                                                enableBrowserTooltips={true}
                                                            >
                                                                <AgGridColumn width={140} field="SimulationCostingId" hide='true'></AgGridColumn>
                                                                {isMasterAssociatedWithCosting && <AgGridColumn width={160} field="CostingNumber" headerName="Costing Id"></AgGridColumn>}


                                                                {(isRMDomesticOrRMImport || keysForDownloadSummary.IsRawMaterialSimulation) && <AgGridColumn width={192} field="RMName" headerName="RM-Grade" cellRenderer='rawMaterailFormat' ></AgGridColumn>}
                                                                {(isRMDomesticOrRMImport || keysForDownloadSummary.IsRawMaterialSimulation) && <AgGridColumn width={192} field="RMCode" headerName="Code" cellRenderer='rawMaterailCodeSpecFormatter'></AgGridColumn>}
                                                                {(isRMDomesticOrRMImport || keysForDownloadSummary.IsRawMaterialSimulation) && <AgGridColumn width={192} field="RMSpecs" headerName="Spec" cellRenderer='rawMaterailCodeSpecFormatter'></AgGridColumn>}


                                                                <AgGridColumn width={136} field="PartNo" tooltipField='PartNo' headerName="Part No." cellRenderer='partFormatter'></AgGridColumn>
                                                                <AgGridColumn width={160} field="PartName" tooltipField='PartName' headerName='Part Name'></AgGridColumn>
                                                                <AgGridColumn width={160} field="PartType" tooltipField='PartType' headerName='Part Type'></AgGridColumn>
                                                                {isMasterAssociatedWithCosting && <AgGridColumn width={150} field="ECNNumber" headerName='ECN No.' cellRenderer='ecnFormatter'></AgGridColumn>}
                                                                {isMasterAssociatedWithCosting && <AgGridColumn width={150} field="RevisionNumber" headerName='Revision No.' cellRenderer={revisionFormatter}></AgGridColumn>}
                                                                {costingList[0]?.CostingHeadId !== CBCTypeId && <AgGridColumn width={150} field="VendorName" tooltipField='VendorName' headerName={`${vendorLabel} (Code)`}></AgGridColumn>}
                                                                {costingList[0]?.CostingHeadId !== CBCTypeId && <AgGridColumn width={150} field="BoughtOutPartCategory" tooltipField='BoughtOutPartCategory' headerName="Category" cellRenderer='categoryFormatter'></AgGridColumn>}
                                                                {isMasterAssociatedWithCosting && showSaLineNumber() && <AgGridColumn width={150} field="SANumber" headerName="SA Number"></AgGridColumn>}
                                                                {isMasterAssociatedWithCosting && showSaLineNumber() && <AgGridColumn width={150} field="LineNumber" headerName="Line Number"></AgGridColumn>}
                                                                {costingList[0]?.CostingHeadId === CBCTypeId && <AgGridColumn width={150} field="CustomerName" tooltipField='CustomerName' headerName="Customer (Code)"></AgGridColumn>}
                                                                {String(SimulationTechnologyId) !== EXCHNAGERATE && <AgGridColumn width={150} field="PlantName" headerName='Plant (Code)' cellRenderer={'plantFormatter'} ></AgGridColumn>}
                                                                {(isRMDomesticOrRMImport || isBOPDomesticOrImport || showRMColumn || showBOPColumn || isExchangeRate || isOperation || showOperationColumn || isMachineRate || showMachineRateColumn) && getConfigurationKey().IsSourceExchangeRateNameVisible && <AgGridColumn width={100} field="ExchangeRateSourceName" headerName="Exchange Rate Source"></AgGridColumn>}
                                                                {(isRMDomesticOrRMImport || isBOPDomesticOrImport || showRMColumn || showBOPColumn || isExchangeRate || isOperation || showOperationColumn || isMachineRate || showMachineRateColumn) && <AgGridColumn field={isMasterAssociatedWithCosting ? "CostingCurrency" : "Currency"} headerName='Currency' />}

                                                                {isMasterAssociatedWithCosting && <AgGridColumn width={140} field="BudgetedPrice" headerName='Budgeted Price' cellRenderer='impactPerQuarterFormatter'></AgGridColumn>}

                                                                {(isOperation || isSurfaceTreatment || keysForDownloadSummary.IsSurfaceTreatmentSimulation || keysForDownloadSummary.IsOperationSimulation) && <AgGridColumn width={140} field="OperationName" tooltipField='OperationName' headerName="Operation Name" cellRenderer='operationNameFormatter'></AgGridColumn>}
                                                                {(isOperation || isSurfaceTreatment || keysForDownloadSummary.IsSurfaceTreatmentSimulation || keysForDownloadSummary.IsOperationSimulation) && <AgGridColumn width={140} field="OperationCode" tooltipField='OperationCode' headerName="Operation Code" cellRenderer='operationCodeFormatter'></AgGridColumn>}

                                                                {(isSurfaceTreatment || keysForDownloadSummary.IsSurfaceTreatmentSimulation) && <AgGridColumn width={140} field="OldNetSurfaceTreatmentCost" headerName="Existing ST Cost" cellRenderer='oldSTFormatter'></AgGridColumn>}
                                                                {(isSurfaceTreatment || keysForDownloadSummary.IsSurfaceTreatmentSimulation) && <AgGridColumn width={140} field="NewNetSurfaceTreatmentCost" headerName="Revised ST Cost" cellRenderer='newSTFormatter'></AgGridColumn>}
                                                                {(isSurfaceTreatment || keysForDownloadSummary.IsSurfaceTreatmentSimulation) && <AgGridColumn width={140} field="NetSurfaceTreatmentCostVariance" headerName="Variance (ST Cost)" cellRenderer='STVarianceFormatter'></AgGridColumn>}

                                                                {(isOperation || keysForDownloadSummary.IsOperationSimulation) && <AgGridColumn width={140} field="OldOperationCost" headerName="Existing Operation Cost" cellRenderer='oldOperationFormatter'></AgGridColumn>}
                                                                {(isOperation || keysForDownloadSummary.IsOperationSimulation) && <AgGridColumn width={140} field="NewOperationCost" headerName="Revised Operation Cost" cellRenderer='newOperationFormatter'></AgGridColumn>}
                                                                {(isOperation || keysForDownloadSummary.IsOperationSimulation) && <AgGridColumn width={140} field="OperationCostVariance" headerName="Variance (Oper. Cost)" cellRenderer='OPVarianceFormatter'></AgGridColumn>}

                                                                {isMasterAssociatedWithCosting && <AgGridColumn width={140} field="OldPOPrice" cellRenderer='oldPOFormatter' headerName={`Existing Net Cost (Currency)`}></AgGridColumn>}
                                                                {isMasterAssociatedWithCosting && <AgGridColumn width={140} field="NewPOPrice" cellRenderer='oldPOFormatter' headerName={`Revised Net Cost (Currency)`}></AgGridColumn>}

                                                                {/* {String(SimulationTechnologyId) !== EXCHNAGERATE && isMasterAssociatedWithCosting && <AgGridColumn width={140} field="NewPOPrice" cellRenderer='newPOFormatter' headerName={header?.RevisedNetCost}></AgGridColumn>} */}
                                                                {String(SimulationTechnologyId) !== EXCHNAGERATE && isMasterAssociatedWithCosting && <AgGridColumn width={140} field="POVariance" headerName="Variance (w.r.t. Existing)" cellRenderer='POVarianceFormatter' ></AgGridColumn>}
                                                                {String(SimulationTechnologyId) !== EXCHNAGERATE && isMasterAssociatedWithCosting && <AgGridColumn width={140} field="BudgetedPriceVariance" headerName='Variance (w.r.t. Budgeted)' cellRenderer='impactPerQuarterFormatter'></AgGridColumn>}
                                                                {(isRMDomesticOrRMImport || keysForDownloadSummary.IsRawMaterialSimulation) && <AgGridColumn width={140} field="OldNetRawMaterialsCost" cellRenderer='oldRMFormatter' headerName="Existing RM Cost/pc" ></AgGridColumn>}
                                                                {(isRMDomesticOrRMImport || keysForDownloadSummary.IsRawMaterialSimulation) && <AgGridColumn width={140} field="NewNetRawMaterialsCost" cellRenderer='newRMFormatter' headerName="Revised RM Cost/pc" ></AgGridColumn>}
                                                                {(isRMDomesticOrRMImport || keysForDownloadSummary.IsRawMaterialSimulation) && <AgGridColumn width={140} field="RMVariance" headerName="Variance (RM Cost)" cellRenderer='varianceFormatter' ></AgGridColumn>}

                                                                {/* {(isExchangeRate || (keysForDownloadSummary.IsExchangeRateSimulation && simulationDetail?.SimulationTechnologyId === EXCHNAGERATE)) && <AgGridColumn width={140} field="OldNetPOPriceOtherCurrency" cellRenderer='oldPOCurrencyFormatter' headerName="Existing Net Cost (in Currency)"></AgGridColumn>}
                                                                {(isExchangeRate || (keysForDownloadSummary.IsExchangeRateSimulation && simulationDetail?.SimulationTechnologyId === EXCHNAGERATE)) && <AgGridColumn width={140} field="NewNetPOPriceOtherCurrency" cellRenderer='newPOCurrencyFormatter' headerName="Revised Net Cost (in Currency)"></AgGridColumn>} */}
                                                                {(isExchangeRate || keysForDownloadSummary.IsExchangeRateSimulation) && <AgGridColumn width={140} field="POVariance" headerName="Variance (w.r.t. Existing)" cellRenderer='POVarianceFormatter' ></AgGridColumn>}
                                                                {(isExchangeRate || keysForDownloadSummary.IsExchangeRateSimulation) && <AgGridColumn width={140} field="BudgetedPriceVariance" headerName='Variance (w.r.t. Budgeted)' cellRenderer='impactPerQuarterFormatter'></AgGridColumn>}
                                                                {(isExchangeRate || keysForDownloadSummary.IsExchangeRateSimulation) && <AgGridColumn width={140} field="OldExchangeRate" cellRenderer='oldERFormatter' headerName="Existing Exchange Rate" ></AgGridColumn>}
                                                                {(isExchangeRate || keysForDownloadSummary.IsExchangeRateSimulation) && <AgGridColumn width={140} field="NewExchangeRate" cellRenderer='newERFormatter' headerName="Revised Exchange Rate" ></AgGridColumn>}
                                                                {(isExchangeRate || keysForDownloadSummary.IsExchangeRateSimulation) && <AgGridColumn width={140} field="Variance" headerName="Variance (ER Cost)" cellRenderer='varianceFormatter' ></AgGridColumn>}
                                                                {/* {(isExchangeRate || keysForDownloadSummary.IsExchangeRateSimulation) && <AgGridColumn width={140} field="Variance" headerName="Variance (ER Cost)" cellRenderer='ERvarianceFormatter' ></AgGridColumn>}               //RE */}

                                                                {(isBOPDomesticOrImport || keysForDownloadSummary.IsBoughtOutPartSimulation) && isMasterAssociatedWithCosting && <AgGridColumn width={140} field="BoughtOutPartName" headerName="Bought Out Part Name" cellRenderer='bopNameFormatter'></AgGridColumn>}
                                                                {(isBOPDomesticOrImport || keysForDownloadSummary.IsBoughtOutPartSimulation) && isMasterAssociatedWithCosting && <AgGridColumn width={140} field="BoughtOutPartNumber" headerName="Bought Out Part Number" cellRenderer='bopNumberFormatter'></AgGridColumn>}
                                                                {(isBOPDomesticOrImport || keysForDownloadSummary.IsBoughtOutPartSimulation) && <AgGridColumn width={140} field="OldNetBoughtOutPartCost" headerName={`Existing ${showBopLabel()} ${isMasterAssociatedWithCosting ? 'Cost' : 'Rate'}`} cellRenderer='oldBOPFormatter' ></AgGridColumn>}
                                                                {(isBOPDomesticOrImport || keysForDownloadSummary.IsBoughtOutPartSimulation) && <AgGridColumn width={140} field="NewNetBoughtOutPartCost" headerName={`Revised ${showBopLabel()} ${isMasterAssociatedWithCosting ? 'Cost' : 'Rate'}`} cellRenderer='newBOPFormatter'></AgGridColumn>}
                                                                {(isBOPDomesticOrImport || keysForDownloadSummary.IsBoughtOutPartSimulation) && !isMasterAssociatedWithCosting && <AgGridColumn width={140} field="PercentageChange" headerName="Percentage" cellRenderer='percentageFormatter'></AgGridColumn>}
                                                                {(isBOPDomesticOrImport || keysForDownloadSummary.IsBoughtOutPartSimulation) && <AgGridColumn width={140} field="NetBoughtOutPartCostVariance" headerName={`Variance (${showBopLabel()} Cost)`} cellRenderer='BOPVarianceFormatter' ></AgGridColumn>}

                                                                {(isMachineRate || keysForDownloadSummary.IsMachineProcessSimulation) && <AgGridColumn width={140} field="OldNetProcessCost" headerName="Existing Net Process Cost" cellRenderer='processFormatter' ></AgGridColumn>}
                                                                {(isMachineRate || keysForDownloadSummary.IsMachineProcessSimulation) && <AgGridColumn width={140} field="NewNetProcessCost" headerName="Revised Net Process Cost" cellRenderer='processFormatter' ></AgGridColumn>}
                                                                {(isMachineRate || keysForDownloadSummary.IsMachineProcessSimulation) && <AgGridColumn width={140} field="NetProcessCostVariance" headerName="Variance (Proc. Cost)" cellRenderer='processVarianceFormatter' ></AgGridColumn>}

                                                                {/* {showComponent && <AgGridColumn width={150} field="NewPOPrice" tooltipField="NewPOPrice" headerName="Revised Net Cost"></AgGridColumn>}
                                                             {showComponent && <AgGridColumn width={150} field="NewPOPrice" tooltipField="NewPOPrice" headerName="Revised Net Cost"></AgGridColumn>}
                                                              {showComponent && <AgGridColumn width={150} field="NewPOPrice" tooltipField="NewPOPrice" headerName="Revised Net Cost"></AgGridColumn>} */}

                                                                {isMultiTechnology && <AgGridColumn width={140} field="OldNetBoughtOutPartCost" headerName="Existing Net Bought Out Part Cost" cellRenderer='decimalFormatter' ></AgGridColumn>}
                                                                {isMultiTechnology && <AgGridColumn width={140} field="NewNetBoughtOutPartCost" headerName="Revised Net Bought Out Part Cost" cellRenderer='decimalFormatter' ></AgGridColumn>}
                                                                {isMultiTechnology && <AgGridColumn width={140} field="NetBoughtOutPartCostVariance" headerName="Net Bought Out Part Cost Variance"></AgGridColumn>}
                                                                {/* {isMultiTechnology && <AgGridColumn width={140} field="OldPOPrice" headerName="Old PO Price" cellRenderer='decimalFormatter' ></AgGridColumn>}
                                                                {isMultiTechnology && <AgGridColumn width={140} field="NewPOPrice" headerName="New PO Price" cellRenderer='decimalFormatter' ></AgGridColumn>}
                                                                {isMultiTechnology && <AgGridColumn width={140} field="POVariance" headerName="Variance (w.r.t. Existing)" cellRenderer='decimalFormatter' ></AgGridColumn>} */}

                                                                {
                                                                    (keysForDownloadSummary?.IsBoughtOutPartSimulation || keysForDownloadSummary?.IsSurfaceTreatmentSimulation || keysForDownloadSummary?.IsOperationSimulation ||
                                                                        keysForDownloadSummary?.IsRawMaterialSimulation || keysForDownloadSummary?.IsMachineProcessSimulation)
                                                                    // || keysForDownloadSummary?.IsCombinedProcessSimulation
                                                                    &&
                                                                    < AgGridColumn width={140} field="DraftPOPrice" headerName="Draft Net Cost" ></AgGridColumn>
                                                                }
                                                                {isMasterAssociatedWithCosting && < AgGridColumn width={140} field="ImpactPerQuarter" headerName="Impact/Quarter (w.r.t. Existing)" cellRenderer='impactPerQuarterFormatter'></AgGridColumn>}
                                                                {isMasterAssociatedWithCosting && <AgGridColumn minWidth={160} field="BudgetedPriceImpactPerQuarter" headerName='Impact/Quarter (w.r.t. Budgeted Price)' cellRenderer='impactPerQuarterFormatter'></AgGridColumn>}

                                                                {isMasterAssociatedWithCosting && <AgGridColumn width={140} field="SimulationCostingId" pinned="right" cellRenderer='buttonFormatter' floatingFilter={false} cellClass="ag-grid-action-container" headerName="Actions" type="rightAligned"></AgGridColumn>}
                                                                {/* <AgGridColumn field="Status" headerName='Status' cellRenderer='statusFormatter'></AgGridColumn>
                                                                <AgGridColumn field="SimulationId" headerName='Actions'   type="rightAligned" cellRenderer='buttonFormatter'></AgGridColumn> */}

                                                            </AgGridReact >
                                                            {< PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
                                                        </div >
                                                    </div >
                                                </Col >
                                            </Row >

                                        </Col >
                                    </Row >
                                </div >
                            </>
                        }
                        {
                            Number(SimulationHeadId) === Number(RAWMATERIALAPPROVALTYPEID) && rmIndexedSimulationSummaryData &&
                            <RMIndexationSimulation isApprovalSummary={true} />
                        }
                        {
                            assemblyImpactButtonTrue && <>
                                <Row className='mt-2'>
                                    <Col md="10">
                                        <div className="left-border">{'Assembly wise Impact:'}</div>
                                    </Col>
                                    <Col md="2" className="text-right">
                                        <div className="right-border">
                                            <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setAssemblyWiseAcc(!assemblyWiseAcc) }}>
                                                {assemblyWiseAcc ? (
                                                    <i className="fa fa-minus" ></i>
                                                ) : (
                                                    <i className="fa fa-plus"></i>
                                                )}
                                            </button>
                                        </div>
                                    </Col>
                                </Row>
                                <div>
                                    {assemblyWiseAcc && <AssemblyWiseImpactSummary
                                        DisplayCompareCosting={DisplayCompareCosting}
                                        dataForAssemblyImpact={DataForAssemblyImpactForFg}
                                        vendorIdState={costingList[0]?.VendorId}
                                        impactType={'AssemblySummary'}
                                        isPartImpactAssembly={false}
                                        isImpactDrawer={false}
                                    />}
                                </div>
                            </>
                        }
                        {
                            isMasterAssociatedWithCosting && <>
                                <Row className="mt-2">
                                    <Col md="10">
                                        <div id="compare-costing" className="left-border">{'Compare Costing:'}</div>
                                    </Col>
                                    <Col md="2" className="text-right">
                                        <div className="right-border">
                                            <button className="btn btn-small-primary-circle ml-1" type="button" disabled={!compareCosting} onClick={() => { setCompareCosting(!compareCosting) }}>
                                                {compareCosting ? <i className="fa fa-minus"></i> : <i className="fa fa-plus"></i>}
                                            </button>
                                        </div>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md="12" className="costing-summary-row">
                                        {compareCosting && <CostingSummaryTable
                                            viewMode={true}
                                            id={id}
                                            simulationMode={true}
                                            isApproval={true}
                                            costingIdExist={true}
                                            selectedTechnology={technologyName}
                                            showAddToComparison={true}
                                            simulationId={simulationDetail?.SimulationId}
                                            receiverId={simulationDetail?.ReceiverId}
                                        />}
                                    </Col>
                                </Row>
                            </>
                        }
                        <Row className='mt-2'>
                            <Col md="6"><div className="left-border">{'Attachments:'}</div></Col>
                            {false && <Col md="12" className="px-4">
                                <label>Upload Attachment (upload up to 2 files)</label>
                                {files && files?.length > 2 ? (
                                    <div class="alert alert-danger" role="alert">
                                        Maximum file upload limit reached.
                                    </div>
                                ) : (
                                    <Dropzone
                                        onChangeStatus={handleChangeStatus}
                                        PreviewComponent={Preview}
                                        // onSubmit={handleImapctSubmit}
                                        accept="image/jpeg,image/jpg,image/png,image/PNG,.xls,.doc,.pdf,.xlsx"
                                        initialFiles={[]}
                                        maxFiles={4}
                                        maxSizeBytes={2000000000}
                                        inputContent={(files, extra) =>
                                            extra.reject ? (
                                                "Image, audio and video files only"
                                            ) : (
                                                <div className="text-center">
                                                    <i className="text-primary fa fa-cloud-upload"></i>
                                                    <span className="d-block">
                                                        Drag and Drop or{" "}
                                                        <span className="text-primary">Browse</span>
                                                        <br />
                                                        file to upload
                                                    </span>
                                                </div>
                                            )
                                        }
                                        styles={{
                                            dropzoneReject: {
                                                borderColor: "red",
                                                backgroundColor: "#DAA",
                                            },
                                            inputLabel: (files, extra) =>
                                                extra.reject ? { color: "red" } : {},
                                        }}
                                        classNames="draper-drop"
                                        disabled={true}
                                    />
                                )}
                            </Col>}
                            <div className="w-100">
                                <div className={"attachment-wrapper mt-0 mb-3 px-4"}>
                                    {files &&
                                        files.map((f) => {
                                            const withOutTild = f.FileURL.replace("~", "");
                                            const fileURL = `${FILE_URL}${withOutTild}`;
                                            return (
                                                <div className={"attachment images"}>
                                                    <a href={fileURL} target="_blank" rel="noreferrer">
                                                        {f.OriginalFileName}
                                                    </a>
                                                    {false && <img
                                                        alt={""}
                                                        className="float-right"
                                                        onClick={() => false ? deleteFile(f.FileId, f.FileName) : ""}
                                                        src={redcrossImg}
                                                    ></img>
                                                    }
                                                </div>
                                            );
                                        })}
                                </div>
                            </div>
                        </Row>

                        {
                            simulationDetail?.SimulationHeadId === VBCTypeId && <>
                                <Row className="mb-4 reset-btn-container">
                                    <Col md="6"><div className="left-border">{'Last Revision Data:'}</div></Col>
                                    <Col md="6" className="text-right">
                                        <div className={'right-details'}>
                                            <button onClick={() => setLastRevisionDataAccordian(!lastRevisionDataAccordian)} className={`btn btn-small-primary-circle ml-1`}>{lastRevisionDataAccordian ? (
                                                <i className="fa fa-minus" ></i>
                                            ) : (
                                                <i className="fa fa-plus"></i>
                                            )}</button>
                                        </div>

                                    </Col>

                                    {lastRevisionDataAccordian &&
                                        <>
                                            <div className="accordian-content w-100 px-3 impacted-min-height">
                                                {showLastRevisionData && <Impactedmasterdata data={impactedMasterDataListForLastRevisionData} masterId={simulationDetail?.SimulationTechnologyId} viewCostingAndPartNo={false} lastRevision={true} />}
                                                {impactedMasterDataListForLastRevisionData?.length === 0 ? <div className='border'><NoContentFound title={EMPTY_DATA} /></div> : ""}
                                            </div>
                                            {editWarning && <Row className='w-100'>
                                                <Col md="12">
                                                    <NoContentFound title={"There is no data for the Last Revision."} />
                                                </Col>
                                            </Row>}
                                        </>
                                    }
                                </Row>
                            </>
                        }
                        {
                            showViewAssemblyDrawer &&
                            <ViewAssembly
                                isOpen={showViewAssemblyDrawer}
                                closeDrawer={closeAssemblyDrawer}
                                // approvalData={approvalData}
                                anchor={'bottom'}
                                dataForAssemblyImpact={dataForAssemblyImpact}
                                vendorIdState={costingList[0]?.VendorId}
                                isPartImpactAssembly={true}
                                impactType={'AssemblySummary'}
                                isImpactDrawer={false}
                                simulationId={simulationDetail?.SimulationId}
                            />
                        }
                        {/* {lastRevisionDataAccordian &&
                                <div className="accordian-content w-100">
                                    <div className={`ag-grid-react`}>
                                        <Col md="12" className="mb-3">
                                            <div className="ag-grid-wrapper height-width-wrapper">
                                                <div className="ag-grid-header">
                                                    <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search "  autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                                </div>
                                                <div
                                                    className="ag-theme-material"
                                                >
                                                    <AgGridReact
                                                        style={{ height: '100%', width: '100%' }}
                                                        defaultColDef={defaultColDef}
                                                        domLayout='autoHeight'
                                                        // columnDefs={c}
                                                        rowData={rmDomesticListing}
                                                        pagination={true}
                                                        paginationPageSize={10}
                                                        onGridReady={onGridReady}
                                                        gridOptions={gridOptions}
                                                        loadingOverlayComponent={'customLoadingOverlay'}
                                                        noRowsOverlayComponent={'customNoRowsOverlay'}
                                                        noRowsOverlayComponentParams={{
                                                            title: CONSTANT.EMPTY_DATA,
                                                        }}
                                                        frameworkComponents={frameworkComponents}
                                                        stopEditingWhenCellsLoseFocus={true}
                                                    >
                                                        <AgGridColumn width={160} field="RawMaterial" headerName="Raw Material"></AgGridColumn>
                                                        <AgGridColumn width={140} field="RMGrade" headerName="RM Grade" ></AgGridColumn>
                                                        <AgGridColumn width={144} field="RMSpec" headerName="RM Spec"></AgGridColumn>
                                                        <AgGridColumn width={145} field="Category" headerName="Category"></AgGridColumn>
                                                        <AgGridColumn width={100} field="UOM" headerName="UOM"></AgGridColumn>
                                                        <AgGridColumn width={200} headerClass="justify-content-center" headerName="Basic Rate (INR)" marryChildren={true} >
                                                            <AgGridColumn width={100} field="BasicRate" headerName="Old" colId="BasicRate"></AgGridColumn>
                                                            <AgGridColumn width={100} cellRenderer={'newBasicRateFormatter'} field="NewBasicRate" headerName="New" colId='NewBasicRate'></AgGridColumn>
                                                        </AgGridColumn>
                                                        <AgGridColumn width={200} headerClass="justify-content-center" marryChildren={true} headerName="Scrap Rate (INR)">
                                                            <AgGridColumn width={100} field="ScrapRate" headerName="Old" colId="ScrapRate" ></AgGridColumn>
                                                            <AgGridColumn width={100} cellRenderer={'newScrapRateFormatter'} field="NewScrapRate" headerName="New" colId="NewScrapRate"></AgGridColumn>
                                                        </AgGridColumn>
                                                        <AgGridColumn width={160} field="RMFreightCost" cellRenderer={'freightCostFormatter'} headerName="RM Freight Cost"></AgGridColumn>
                                                        <AgGridColumn width={180} field="RMShearingCost" cellRenderer={'shearingCostFormatter'} headerName="RM Shearing Cost" ></AgGridColumn>
                                                        <AgGridColumn width={200} headerClass="justify-content-center" headerName="Net Cost (INR)">
                                                            <AgGridColumn width={100} field="NetLandedCost" cellRenderer={'costFormatter'} headerName="Old" colId='NetLandedCost'></AgGridColumn>
                                                            <AgGridColumn width={100} field="NewNetLandedCost" cellRenderer={'NewcostFormatter'} headerName="New" colId='NewNetLandedCost'></AgGridColumn>
                                                        </AgGridColumn>
                                                        <AgGridColumn width={160} field="EffectiveDate" cellRenderer={'effectiveDateFormatter'} headerName="Effective Date" ></AgGridColumn>
                                                        <AgGridColumn width={160} field="RawMaterialId" hide></AgGridColumn>

                                                    </AgGridReact>

                                                    <div className="paging-container d-inline-block float-right">
                                                        <select className="form-control paging-dropdown" onChange={(e) => onPageSizeChanged(e.target.value)} id="page-size">
                                                            <option value="10" selected={true}>10</option>
                                                            <option value="50">50</option>
                                                            <option value="100">100</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                    </div>
                                </div>
                            } */}

                    </div >

                    {!isApprovalDone &&
                        <Row className="sf-btn-footer no-gutters justify-content-between">
                            <div className="col-sm-12 text-right bluefooter-butn">
                                <Fragment>
                                    <button type={'button'} className="mr5 approve-reject-btn" onClick={() => { setRejectDrawer(true) }} >
                                        <div className={'cancel-icon-white mr5'}></div>
                                        {'Reject'}
                                    </button>
                                    <button
                                        type="button"
                                        className="approve-button mr5 approve-hover-btn"
                                        onClick={() => setApproveDrawer(true)}>
                                        <div className={'save-icon'}></div>
                                        {'Approve'}
                                    </button>

                                    {/* {showFinalLevelButtons &&
                                        <button
                                            type="button" className="mr5 user-btn" onClick={() => { }}                    >
                                            <div className={'save-icon'}></div>
                                            {'Approve & Push'}
                                        </button>} */}
                                </Fragment>
                            </div>
                        </Row>
                    }
                    {/* WHENEVER WE ENABLE PUSH BUTTON UNCOMMENT THIS                //RE OPEN IN RE*/}
                    {initialConfiguration?.IsSAPConfigured &&
                        showPushButton &&
                        <Row className="sf-btn-footer no-gutters justify-content-between">
                            <div className="col-sm-12 text-right bluefooter-butn">
                                <Fragment>
                                    <button type="submit" className="submit-button mr5 save-btn" onClick={() => callPushAPI()}>
                                        <div className={"save-icon"}></div>{" "}
                                        {"RePush"}
                                    </button>
                                </Fragment>
                            </div>
                        </Row>
                    }
                </>
                // :
                // <SimulationApprovalListing />
            }

            {
                approveDrawer && <SimulationApproveReject
                    // approveDrawer && <ApproveRejectDrawer               //RE
                    type={'Approve'}
                    isOpen={approveDrawer}
                    closeDrawer={closeApproveDrawer}
                    // tokenNo={approvalNumber}
                    approvalData={[]}
                    anchor={'right'}
                    isSimulation={true}
                    simulationDetail={simulationDetail}
                    costingList={costingList}
                    // reasonId={approvalDetails.ReasonId}
                    IsPushDrawer={showPushDrawer}
                    showFinalLevelButtons={showFinalLevelButtons}
                    Attachements={simulationDetail?.Attachements}
                    reasonId={simulationDetail?.SenderReasonId}
                    IsFinalLevel={finalLeveluser}
                    SimulationHeadId={simulationDetail?.SimulationHeadId}
                    costingTypeId={simulationDetail?.SimulationHeadId}
                    releaseStrategyDetails={releaseStrategyDetails}
                    technologyId={SimulationTechnologyId}
                    approvalTypeIdValue={simulationDetail?.ApprovalTypeId}
                    IsExchangeRateSimulation={keysForDownloadSummary?.IsExchangeRateSimulation}
                    CheckFinalLevel={CheckFinalLevel}
                    receiverId={receiverId}
                // IsPushDrawer={showPushDrawer}
                // dataSend={[approvalDetails, partDetail]}
                />
            }
            {
                rejectDrawer && <SimulationApproveReject
                    // rejectDrawer && <ApproveRejectDrawer               //RE
                    type={'Reject'}
                    isOpen={rejectDrawer}
                    simulationDetail={simulationDetail}
                    closeDrawer={closeApproveDrawer}
                    isSimulation={true}
                    //  tokenNo={approvalNumber}
                    anchor={'right'}
                    IsFinalLevel={!showFinalLevelButtons}
                    // reasonId={approvalDetails.ReasonId}
                    // IsPushDrawer={showPushDrawer}
                    // dataSend={[approvalDetails, partDetail]}
                    Attachements={simulationDetail?.Attachements}
                    reasonId={simulationDetail?.SenderReasonId}
                    SimulationHeadId={simulationDetail?.SimulationHeadId}
                    costingTypeId={simulationDetail?.SimulationHeadId}
                    technologyId={SimulationTechnologyId}
                    CheckFinalLevel={CheckFinalLevel}
                    receiverId={receiverId}
                />
            }

            {/* {pushButton && <PushButtonDrawer
                isOpen={pushButton}
                closeDrawer={closePushButton}
                dataSend={[approvalDetails, partDetail]}
                anchor={'right'}
                approvalData={[approvalData]}
            />} */}
            {/* //MINDA */}
            {/* {
                pushButton && <PushButtonDrawer
                    isOpen={pushButton}
                    closeDrawer={closePushButton}
                    approvalData={[approvalData ? approvalData : []]}
                    isSimulation={true}
                    simulationDetail={simulationDetail}
                    // dataSend={dataSend ? dataSend : []}
                    costingList={costingList}
                    anchor={'right'}
                // approvalData={[approvalData]}
                />
            } */}
            {/* //MINDA */}

            {
                viewButton && <ViewDrawer
                    approvalLevelStep={approvalLevelStep}
                    isOpen={viewButton}
                    closeDrawer={closeViewDrawer}
                    anchor={'top'}
                    approvalNo={simulationDetail?.Token}
                    isSimulation={true}
                />
            }
            {
                isVerifyImpactDrawer &&
                <VerifyImpactDrawer
                    isOpen={isVerifyImpactDrawer}
                    anchor={'right'}
                    approvalData={[]}
                    type={'Approve'}
                    closeDrawer={verifyImpactDrawer}
                    isSimulation={true}
                    // approvalSummaryTrue={false}               //RE
                    CostingTypeId={simulationDetail?.SimulationHeadId}
                />
            }
        </>
    )
}

export default SimulationApprovalSummary;
