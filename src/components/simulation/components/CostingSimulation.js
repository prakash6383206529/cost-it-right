import React, { useState, useRef, Fragment, useContext } from 'react';
import { Row, Col, } from 'reactstrap';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NoContentFound from '../../common/NoContentFound';
import { BOPDOMESTIC, BOPIMPORT, TOFIXEDVALUE, EMPTY_DATA, MACHINERATE, OPERATIONS, RMDOMESTIC, RMIMPORT, SURFACETREATMENT, ImpactMaster, EXCHNAGERATE, COMBINED_PROCESS, defaultPageSize, CBCTypeId, FORGINGNAME, VBCTypeId, ZBCTypeId } from '../../../config/constants';
import { getComparisionSimulationData, getCostingBoughtOutPartSimulationList, getCostingSimulationList, getCostingSurfaceTreatmentSimulationList, setShowSimulationPage, getSimulatedAssemblyWiseImpactDate, getImpactedMasterData, getExchangeCostingSimulationList, getMachineRateCostingSimulationList, getCombinedProcessCostingSimulationList, getAllMultiTechnologyCostings, getAllSimulatedMultiTechnologyCosting, getAllSimulatedBoughtOutPart, setTechnologyForSimulation } from '../actions/Simulation';
import CostingDetailSimulationDrawer from './CostingDetailSimulationDrawer'
import { checkForDecimalAndNull, checkForNull, formViewData, getConfigurationKey, loggedInUserId, searchNocontentFilter, showBopLabel, showSaLineNumber, userDetails } from '../../../helper';
import VerifyImpactDrawer from './VerifyImpactDrawer';
import { AssemblyWiseImpactt } from '../../../config/constants';
import Toaster from '../../common/Toaster';
import { Redirect } from 'react-router';
import { checkFinalUser, getReleaseStrategyApprovalDetails, setCostingViewData } from '../../costing/actions/Costing';
import {
    APPLICABILITY_BOP_SIMULATION,
    APPLICABILITY_PART_SIMULATION,
    APPLICABILITY_RM_SIMULATION,
    ASSEMBLY_TECHNOLOGY_MASTER,
    ASSEMBLY_WISEIMPACT_DOWNLOAD_EXCEl,
    BOPGridForToken,
    CostingSimulationDownloadAssemblyTechnology,
    CostingSimulationDownloadBOP, CostingSimulationDownloadMR, CostingSimulationDownloadOperation, CostingSimulationDownloadRM, CostingSimulationDownloadST
    , CPGridForToken, ERGridForToken, EXCHANGESIMULATIONDOWNLOAD, IdForMultiTechnology, InitialGridForToken, LastGridForToken, MRGridForToken, OperationGridForToken, RMGridForToken, STGridForToken, SimulationDownloadBOP, COMBINEDPROCESSSIMULATION
} from '../../../config/masterData'
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import LoaderCustom from '../../common/LoaderCustom';
import { Errorbox } from '../../common/ErrorBox';
import { impactmasterDownload, SimulationUtils } from '../SimulationUtils'
import ViewAssembly from './ViewAssembly';
import _ from 'lodash';
import { PaginationWrapper } from '../../common/commonPagination';
import WarningMessage from '../../common/WarningMessage';
import { hideColumnFromExcel, hideMultipleColumnFromExcel } from '../../common/CommonFunctions';
import { reactLocalStorage } from 'reactjs-localstorage';
import { costingTypeIdToApprovalTypeIdFunction } from '../../common/CommonFunctions';
import SimulationApproveReject from '../../costing/components/approval/SimulationApproveReject';
import { simulationContext } from '.';
import { useLabels } from '../../../helper/core';

const gridOptions = {};

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

function CostingSimulation(props) {
    const { simulationId, isFromApprovalListing, master, statusForLinkedToken } = props
    const { vendorLabel } = useLabels()
    const getShowSimulationPage = useSelector((state) => state.simulation.getShowSimulationPage)
    const { isMasterAssociatedWithCosting } = useSelector(state => state.simulation)

    const [selectedRowData, setSelectedRowData] = useState([]);
    const [tokenNo, setTokenNo] = useState('')
    const [CostingDetailDrawer, setCostingDetailDrawer] = useState(false)
    const [isVerifyImpactDrawer, setIsVerifyImpactDrawer] = useState(false)
    const [isApprovalDrawer, setIsApprovalDrawer] = useState(false)
    const [showApprovalHistory, setShowApprovalHistory] = useState(false)
    const [simulationDetail, setSimulationDetail] = useState('')
    const [costingArr, setCostingArr] = useState([])
    const [apiData, setAPIData] = useState([])
    const [pricesDetail, setPricesDetail] = useState({})
    const [disableApproveButton, setDisableApprovalButton] = useState(false)
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [loader, setLoader] = useState(true)
    const [vendorIdState, setVendorIdState] = useState("")
    const [simulationTypeState, setSimulationTypeState] = useState("")
    const [SimulationTechnologyIdState, setSimulationTechnologyIdState] = useState("")
    const [tableData, setTableData] = useState([])
    const [status, setStatus] = useState('')
    const [isMasterLoader, setMasterLoader] = useState(false)
    const [isSimulationWithCosting, setIsSimulationWithCosting] = useState(isMasterAssociatedWithCosting)
    const [hideDataColumn, setHideDataColumn] = useState({
        hideOverhead: true,
        hideProfit: true,
        hideRejection: true,
        hideICC: true,
        hidePayment: true,
        hideOtherCost: true,
        hideDiscount: true,
        hideOveheadAndProfit: true,
        hideToolCost: true,
        hideFrieghtCost: true,
        hidePackagingCost: true,
        hideFreightPackagingCost: true,
        showChildParts: false,
        showBoughtOutPartCost: false
    })
    const [amendmentDetails, setAmendmentDetails] = useState({})
    const [showViewAssemblyDrawer, setShowViewAssemblyDrawer] = useState(false)
    const [dataForAssemblyImpact, setDataForAssemblyImpact] = useState({})
    const [assemblyImpactButtonTrue, setAssemblyImpactButtonTrue] = useState(true);
    const [showBOPColumn, setShowBOPColumn] = useState(false);
    const [showRMColumn, setShowRMColumn] = useState(false);
    const [showOperationColumn, setShowOperationColumn] = useState(false);
    const [showSurfaceTreatmentColumn, setShowSurfaceTreatmentColumn] = useState(false);
    const [showExchangeRateColumn, setShowExchangeRateColumn] = useState(false);
    const [showMachineRateColumn, setShowMachineRateColumn] = useState(false);
    const [showCombinedProcessColumn, setShowCombinedProcessColumn] = useState(false);
    const [downloadList, setDownloadList] = useState([]);
    const [rejectedList, setRejectedList] = useState([]);
    const [sendInAPIState, setSendInAPIState] = useState([]);
    const [isMultipleMasterSimulation, setIsMultipleMasterSimulation] = useState(false);
    const [isFinalLevelApprover, setIsFinalLevelApprover] = useState(false);
    const [count, setCount] = useState(0);
    const [storeTechnology, setStoreTechnology] = useState(0)
    const [isBreakupBoughtOutPart, setIsBreakupBoughtOutPart] = useState(false)
    const [disableSendForApproval, setDisableSendForApproval] = useState(false);
    const [message, setMessage] = useState('');
    const [plantId, setPlantId] = useState(null)
    const { showEditMaster, showverifyPage, costingDrawerPage, handleEditMasterPage, showTour } = useContext(simulationContext) || {};

    const simulationApplicability = useSelector(state => state.simulation.simulationApplicability)

    const isSurfaceTreatment = (Number(master) === Number(SURFACETREATMENT));
    const isOperation = (Number(master) === Number(OPERATIONS));
    const isRMDomesticOrRMImport = ((Number(master) === Number(RMDOMESTIC)) || (Number(master) === Number(RMIMPORT)) || (simulationApplicability?.value === APPLICABILITY_RM_SIMULATION));
    const isBOPDomesticOrImport = ((Number(master) === Number(BOPDOMESTIC)) || (Number(master) === Number(BOPIMPORT)) || (simulationApplicability?.value === APPLICABILITY_BOP_SIMULATION))
    const isMachineRate = Number(master) === (Number(MACHINERATE));
    const isExchangeRate = (Number(master) === Number(EXCHNAGERATE) && simulationApplicability?.value === APPLICABILITY_PART_SIMULATION);
    const isCombinedProcess = Number(master) === Number(COMBINED_PROCESS);

    const simulationAssemblyListSummary = useSelector((state) => state.simulation.simulationAssemblyListSummary)
    const impactedMasterData = useSelector(state => state.comman.impactedMasterData)
    const gridRef = useRef();

    const costingList = useSelector(state => state.simulation.costingSimulationList)
    const [noData, setNoData] = useState(false);
    const [releaseStrategyDetails, setReleaseStrategyDetails] = useState({})
    const [isPFSOrBudgetingDetailsExistWarning, showIsPFSOrBudgetingDetailsExistWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');
    const [showRM, setShowRM] = useState(simulationApplicability?.value === 'RM');
    const [showBOP, setShowBOP] = useState(simulationApplicability?.value === 'BOP');
    const [showComponent, setShowComponent] = useState(simulationApplicability?.value === 'Component');
    const [costingIdArray, setCostingIdArray] = useState({})
    const { initialConfiguration } = useSelector(state => state.auth)

    const costingSimulationListAllKeys = useSelector(state => state.simulation.costingSimulationListAllKeys)

    const selectedMasterForSimulation = useSelector(state => state.simulation.selectedMasterForSimulation)
    const isMultiTechnology = (checkForNull(selectedMasterForSimulation?.value) === ASSEMBLY_TECHNOLOGY_MASTER) ? true : false
    const userData = userDetails()

    const dispatch = useDispatch()
    const { technologyLabel } = useLabels();
    useEffect(() => {
        getCostingList()
        dispatch(getImpactedMasterData(simulationId, () => { }))
        return () => {
            setHideDataColumn({
                hideOverhead: true,
                hideProfit: true,
                hideRejection: true,
                hideICC: true,
                hidePayment: true,
                hideOtherCost: true,
                hideDiscount: true,
                hideOveheadAndProfit: true,
                hideToolCost: true,
                hideFrieghtCost: true,
                hidePackagingCost: true,
                hideFreightPackagingCost: true,
                showChildParts: false,
                showBoughtOutPartCost: false
            })
        }
    }, [])

    useEffect(() => {
        if (SimulationTechnologyIdState && count === 0 && amendmentDetails?.SimulationHeadId) {
            if (getConfigurationKey().IsReleaseStrategyConfigured) {
                let data = []
                selectedRowData && selectedRowData?.map(item => {
                    let obj = {}
                    obj.SimulationId = simulationId
                    data.push(obj)
                })
                let requestObject = {
                    "RequestFor": "SIMULATION",
                    "TechnologyId": props.technologyId,
                    "LoggedInUserId": loggedInUserId(),
                    "ReleaseStrategyApprovalDetails": _.uniqBy(data, 'SimulationId')
                }
                dispatch(getReleaseStrategyApprovalDetails(requestObject, (res) => {
                    setReleaseStrategyDetails(res?.data?.Data)
                    if (res?.data?.Data?.IsUserInApprovalFlow && !res?.data?.Data?.IsFinalApprover) {
                        showIsPFSOrBudgetingDetailsExistWarning(false)
                        setWarningMessage("")
                        setDisableSendForApproval(false)
                        setIsFinalLevelApprover(false)

                    } else if (res?.data?.Data?.IsPFSOrBudgetingDetailsExist === false) {
                        setWarningMessage("Budgeting cost does not exist, common approval flow will run for this part")
                        showIsPFSOrBudgetingDetailsExistWarning(true)
                        let obj = {
                            DepartmentId: userData.DepartmentId,
                            UserId: loggedInUserId(),
                            TechnologyId: SimulationTechnologyIdState,
                            Mode: 'simulation',
                            approvalTypeId: costingTypeIdToApprovalTypeIdFunction(amendmentDetails?.SimulationHeadId)
                        }
                        dispatch(checkFinalUser(obj, res => {
                            if (res && res.data && res.data.Result) {
                                setIsFinalLevelApprover(res.data.Data?.IsFinalApprover)
                                if (res.data?.Data?.IsUserInApprovalFlow === false) {
                                    setDisableSendForApproval(true)
                                }
                                let countTemp = count + 1
                                setCount(countTemp)
                            }
                        }))
                    } else if (res?.data?.Result === false) {
                        showIsPFSOrBudgetingDetailsExistWarning(true)
                        setWarningMessage("This user is not in the approval cycle")
                    } else {
                        // showIsPFSOrBudgetingDetailsExistWarning(true)
                        // setWarningMessage("This user is not in the approval cycle")
                    }
                }))
            } else {
                let technologyId = SimulationTechnologyIdState
                if (amendmentDetails?.IsExchangeRateSimulation) {
                    if (String(SimulationTechnologyIdState) === String(RMIMPORT) || String(SimulationTechnologyIdState) === String(BOPIMPORT)) {
                        technologyId = EXCHNAGERATE
                    }
                } else {
                    technologyId = SimulationTechnologyIdState
                }
                let obj = {
                    DepartmentId: userData.DepartmentId,
                    UserId: loggedInUserId(),
                    TechnologyId: technologyId,
                    Mode: 'simulation',
                    approvalTypeId: costingTypeIdToApprovalTypeIdFunction(amendmentDetails?.SimulationHeadId),
                    plantId: plantId
                }
                if (initialConfiguration.IsMultipleUserAllowForApproval ? plantId : true) {
                    if (!getConfigurationKey().IsDivisionAllowedForDepartment) {
                        dispatch(checkFinalUser(obj, res => {
                            if (res && res.data && res.data.Result) {
                                setIsFinalLevelApprover(res.data.Data?.IsFinalApprover)
                                if (res?.data?.Data?.IsUserInApprovalFlow === false) {
                                    setMessage("This user is not in the approval cycle")
                                    setDisableSendForApproval(true)
                                } if (res.data.Data.IsFinalApprover) {
                                    setDisableSendForApproval(true)
                                    setMessage("Final level approver can not send draft token for approval")
                                } if (res.data.Data.IsUserInApprovalFlow && !res.data.Data.IsFinalApprover) {
                                    setDisableSendForApproval(false)
                                }
                                let countTemp = count + 1
                                setCount(countTemp)
                            }
                        }))
                    }
                }
            }
            // let obj = {
            //     DepartmentId: userData.DepartmentId,
            //     UserId: loggedInUserId(),
            //     TechnologyId: SimulationTechnologyIdState,
            //     Mode: 'simulation',
            //     approvalTypeId: costingTypeIdToApprovalTypeIdFunction(amendmentDetails?.SimulationHeadId)
            // }
            // dispatch(checkFinalUser(obj, res => {
            //     if (res && res.data && res.data.Result) {
            //         setIsFinalLevelApprover(res.data.Data?.IsFinalApprover)
            //         if (res.data?.Data?.IsUserInApprovalFlow === false) {
            //             setDisableSendForApproval(true)
            //         }
            //         let countTemp = count + 1
            //         setCount(countTemp)
            //     }
            // }))
        }
    }, [SimulationTechnologyIdState, amendmentDetails?.SimulationHeadId, plantId])
    useEffect(() => {

        if (props?.isFromApprovalListing === true) {

            handleEditMasterPage(true, true, true);
        } else {
            handleEditMasterPage(showEditMaster, showverifyPage, props.costingPage);
        }
    }, [handleEditMasterPage, props?.isFromApprovalListing]);


    useEffect(() => {
        // TO CHECK IF ANY OF THE RECORD HAS ASSEMBLY ROW
        let count = 0
        tableData && tableData.map((item) => {
            setStoreTechnology(item.Technology)
            if (item.IsAssemblyExist === true) {
                count++
            }
            return null
        })
        // IF COUNT NOT EQUAL TO ZERO -> ASSEMBLY EXIST 
        if (count !== 0) {
            setAssemblyImpactButtonTrue(true)
        } else {
            setAssemblyImpactButtonTrue(false)
        }

        // CREATE REQUEST OBJECT FOR ASSEMBLY WISE IMPACT DATA
        if (tableData !== undefined && tableData.length > 0) {
            let requestData = []
            let isAssemblyInDraft = false

            let uniqueArr = _.uniqBy(tableData, function (o) {
                return o.CostingId;
            });

            uniqueArr && uniqueArr.map(item => {
                requestData.push({ CostingId: item.CostingId, delta: item.Variance, IsSinglePartImpact: false, SimulationId: simulationId })
                return null
            })

            dispatch(getSimulatedAssemblyWiseImpactDate(requestData, isAssemblyInDraft, (res) => { }))
        }

    }, [tableData])

    useEffect(() => {
        if (userDetails().Role === 'SuperAdmin') {
            setDisableApprovalButton(true)
        }
    }, [])

    // ********* WHEN PAGE IS RELOADED THIS WILL GET EXECUTED TO SHOW MAIN SIMULATION PAGE *********
    window.onbeforeunload = (e) => {
        dispatch(setShowSimulationPage(true))
    };

    /**
    * @method getListMultipleAndAssembly
    * @description COMMON FUNCTION FOR LIST AND DOWNLOAD | SAME TYPE OF DIFFERENT DATA INPUT
    */
    const getListMultipleAndAssembly = (SimulationCostingList, storeInRemovedObjects) => {               //getListForUIAndDownload
        let tempRemoveObject1 = []
        if (SimulationCostingList && SimulationCostingList) {
            let indexList = []
            let tempArray1 = []
            tempArray1 = SimulationCostingList && SimulationCostingList.map((itemFalue, index) => {         // INDEX OF NOT ASSEMBLY
                if (itemFalue.IsAssemblyExist === false) {               // ENTER "IF", WHEN "IsAssemblyExist" IS FALSE (NOT ASSEMBLY)
                    SimulationCostingList && SimulationCostingList.map((itemTrue) => {
                        if (itemTrue.IsAssemblyExist === true) {         // ENTER "IF", WHEN "IsAssemblyExist" IS TRUE (ASSEMBLY)

                            // ********** IF PART NUMBER, PLANT CODE, VENDOR NAME IS SAME (ASSEMBLY FALSE RECORD WHOSE ASSEMBLY TRUE EXIST THAT ASSEMBLY FALSE WILL BE THROWN OUT )  **********
                            if (itemTrue.PartNo === itemFalue.PartNo && itemTrue.PlantCode === itemFalue.PlantCode &&
                                itemTrue.VendorName === itemFalue.VendorName) {

                                tempRemoveObject1.push(itemFalue)        // RECORD TO BE REJECTED IS PUSHED INTO ARRAY FOR FURTHER USE TO SEND IN API 
                                indexList.push(index)
                            }
                        }
                        return null
                    })
                }
                // ********** indexList CONTAINS RECORD WHICH SHOULD BE REMOVED | IN OUTER MAP | CHECK FOR EACH ITERATION | WHICH RECORD BASED ON INDEX SHOULD BE REMOVED **********
                if (!indexList.includes(index)) {
                    return itemFalue
                }
                return null
            })
            //  ********** STORE REJECTED RECORD LIST FOR UNIQUE ARRAY ONLY | storeInRemovedObjects HAS TRUE IN CASE OF UNIQUE ARRAY (UI DATA) ********** 
            if (storeInRemovedObjects) {
                setRejectedList(tempRemoveObject1)
            }
            //  ********** tempArray1 CONTAINS UNDEFINED VALUES WHEN WE DO NOT RETURN ANYTHING | FILTER REMOVES UNDEFINED RECORD FROM LIST ********** 
            return tempArray1.filter(e => e)
        }
    }

    /**
    * @method setCommonStateForList
    * @description COMMON FUNCTION TO HANDLE RESPONSE FROM API
    */
    const setCommonStateForList = (res) => {
        if (res?.data?.Result) {
            const tokenNo = res.data.Data.SimulationTokenNumber
            const Data = res.data.Data
            setStatus(Data.SapMessage)
            var vendorId = Data.VendorId
            var SimulationTechnologyId = Data.SimulationTechnologyId
            var SimulationType = Data.SimulationType
            setVendorIdState(vendorId)
            setSimulationTechnologyIdState(SimulationTechnologyId)
            dispatch(setTechnologyForSimulation({ label: Data.SimulationTechnology, value: SimulationTechnologyId }))
            setSimulationTypeState(SimulationType)
            setIsSimulationWithCosting(!Data.IsSimulationWithOutCosting)
            let tempArrayCosting
            if (isMasterAssociatedWithCosting) {
                setIsBreakupBoughtOutPart(res.data?.Data?.IsBreakupBoughtOutPart)
                if (res.data?.Data?.IsBreakupBoughtOutPart === true && res.data?.DataList?.length > 0) {
                    tempArrayCosting = [...Data.SimulatedCostingList, ...res.data?.DataList]
                } else {
                    tempArrayCosting = Data.SimulatedCostingList
                }
            } else {
                tempArrayCosting = Data.SimulationBoughtOutPart
            }
            tempArrayCosting && tempArrayCosting.map(item => {
                item.Variance = (item?.CostingHeadId !== CBCTypeId ? item.OldPOPrice - item.NewPOPrice : item.NewPOPrice - item.OldPOPrice).toFixed(getConfigurationKey().NoOfDecimalForPrice)
                //  ********** ADDED NEW FIELDS FOR ADDING THE OLD AND NEW RM COST / PC BUT NOT GETTING THE AS SUM IN DOWNLOAD **********
                item.RMCVariance = (checkForNull(item.OldRMPrice).toFixed(TOFIXEDVALUE) -
                    checkForNull(item.NewRMPrice).toFixed(TOFIXEDVALUE))
                item.STVariance = (checkForNull(item.OldSurfaceTreatmentCost).toFixed(TOFIXEDVALUE) -
                    checkForNull(item.NewSurfaceTreatmentCost).toFixed(TOFIXEDVALUE))
                item.OperationVariance = (checkForNull(item.OldOperationRate).toFixed(TOFIXEDVALUE) -
                    checkForNull(item.NewOperationRate).toFixed(TOFIXEDVALUE))
                item.BOPVariance = (checkForNull(item.OldBOPCost).toFixed(TOFIXEDVALUE) -
                    checkForNull(item.NewBOPCost).toFixed(TOFIXEDVALUE))
                item.MRVariance = (checkForNull(item.OldMachineRate).toFixed(TOFIXEDVALUE) -
                    checkForNull(item.NewMachineRate).toFixed(TOFIXEDVALUE))
                item.BOPNONVariance = (checkForNull(item.OldBOPRate).toFixed(TOFIXEDVALUE) -
                    checkForNull(item.NewBOPRate).toFixed(TOFIXEDVALUE))
                if ((String(master) === String(EXCHNAGERATE)) || Data?.IsExchangeRateSimulation) {
                    item.POVariance = (checkForNull(item.OldNetPOPriceOtherCurrency).toFixed(TOFIXEDVALUE) -
                        checkForNull(item.NewNetPOPriceOtherCurrency).toFixed(TOFIXEDVALUE))
                    item.ERVariance = (checkForNull(item.OldExchangeRate).toFixed(TOFIXEDVALUE) -
                        checkForNull(item.NewExchangeRate).toFixed(TOFIXEDVALUE))
                }
                // switch (String(master)) {            //RE
                //     case String(COMBINED_PROCESS):
                //         item.POVariance = checkForDecimalAndNull(item.OldPOPrice - item.NewPOPrice, getConfigurationKey().NoOfDecimalForPrice)
                //         break;
                //     default:
                //         break;
                return null
            })

            let uniqeArray = []
            if (isMasterAssociatedWithCosting) {
                const map = new Map();
                for (const item of tempArrayCosting) {
                    if (!map.has(item.CostingNumber)) {                          // ENTERS "IF", IF MAP DO NOT HAVE COSTING NUMBER IN IT 
                        map.set(item.CostingNumber, true);                       // SET COSTING (NUMBER, TRUE) IN MAP 
                        uniqeArray.push(item);                                   //  ALSO PUSH ITEM IN ARRAY WHICH BECOMES UNIQUE FROM COSTING NUMBER
                    }
                }
            } else {
                uniqeArray = [...Data.SimulationBoughtOutPart]
            }
            let simulationList = isMasterAssociatedWithCosting ? Data?.SimulatedCostingList : Data?.SimulationBoughtOutPart
            setTokenNo(tokenNo)
            setAPIData(tempArrayCosting)
            setCostingArr(tempArrayCosting)
            setSimulationDetail({ TokenNo: Data.SimulationTokenNumber, Status: Data.SimulationStatus, SimulationId: Data.SimulationId, SimulationAppliedOn: Data.SimulationAppliedOn, EffectiveDate: Data.EffectiveDate, IsExchangeRateSimulation: Data.IsExchangeRateSimulation })
            let requestObject = {}

            requestObject.IsCreate = true
            requestObject.CostingId = []
            setCostingIdArray(requestObject)

            let tempObj = {}
            tempObj.EffectiveDate = Data.EffectiveDate
            tempObj.CostingHead = simulationList[0]?.CostingHead
            tempObj.SimulationHeadId = Data.SimulationHeadId
            tempObj.SimulationAppliedOn = Data.SimulationAppliedOn
            tempObj.Technology = simulationList[0].Technology
            tempObj.Vendor = simulationList[0].VendorName
            tempObj.TotalImpactPerQuarter = Data.TotalImpactPerQuarter
            tempObj.CustomerName = simulationList[0].CustomerName
            tempObj.BudgetedPriceImpactPerQuarter = simulationList[0]?.BudgetedPriceImpactPerQuarter
            tempObj.IsExchangeRateSimulation = Data?.IsExchangeRateSimulation
            setAmendmentDetails(tempObj)

            //LISTING
            // SECOND PARAMETER TRUE | TO SAVE UNIQUE LIST OF NON REQUIRED COSTING(COMPONENT COSTING OF ASSEMBLY'S CHILD)  
            const list = getListMultipleAndAssembly(uniqeArray, true)
            setTableData(list)

            //DOWNLOAD
            let downloadList = getListMultipleAndAssembly(simulationList, false)
            setDownloadList(downloadList)

            setLoader(false)

        } else {
            setLoader(false)
        }
    }

    /**
    * @method getCostingList
    * @description API CALL FOR GET LIST OF ALL MASTERS
    */
    const getCostingList = (plantId = '', rawMatrialId = '') => {
        setLoader(true)
        if (isMultiTechnology) {
            dispatch(getAllSimulatedMultiTechnologyCosting(simulationId, (res) => {
                setCommonStateForList(res)
                if (res?.data?.Result) {
                    setPlantId(res?.data?.Data.SimulatedCostingList[0].PlantId)
                }
            }))
        } else {
            let masterTemp = selectedMasterForSimulation?.value
            if (selectedMasterForSimulation?.value === EXCHNAGERATE && simulationApplicability?.value === APPLICABILITY_RM_SIMULATION) {
                masterTemp = RMIMPORT
            } else if (selectedMasterForSimulation?.value === EXCHNAGERATE && simulationApplicability?.value === APPLICABILITY_BOP_SIMULATION) {
                masterTemp = BOPIMPORT
            } else {
                masterTemp = selectedMasterForSimulation?.value
            }
            switch (Number(masterTemp)) {
                //  ***** WHEN SAME BLOCK OF CODE IS FOR TWO DIFFERENT CASES | WE WRITE TWO CASES TOGETHER *****
                case Number(RMDOMESTIC):
                case Number(RMIMPORT):
                    setMasterLoader(true)
                    dispatch(getCostingSimulationList(simulationId, plantId, rawMatrialId, res => {
                        setMasterLoader(false)
                        setCommonStateForList(res)
                        if (res?.data?.Result) {
                            setPlantId(res?.data?.Data.SimulatedCostingList[0].PlantId)
                        }
                    }))
                    break;
                case Number(SURFACETREATMENT):
                    setMasterLoader(true)
                    dispatch(getCostingSurfaceTreatmentSimulationList(simulationId, plantId, rawMatrialId, (res) => {
                        setMasterLoader(false)
                        setCommonStateForList(res)
                        if (res?.data?.Result) {
                            setPlantId(res?.data?.Data.SimulatedCostingList[0].PlantId)
                        }
                    }))
                    break;
                case Number(OPERATIONS):
                    setMasterLoader(true)
                    dispatch(getCostingSurfaceTreatmentSimulationList(simulationId, plantId, rawMatrialId, (res) => {
                        setMasterLoader(false)
                        setCommonStateForList(res)
                        if (res?.data?.Result) {
                            setPlantId(res?.data?.Data.SimulatedCostingList[0].PlantId)
                        }
                    }))
                    break;
                case Number(BOPDOMESTIC):
                case Number(BOPIMPORT):
                    setMasterLoader(true)
                    if (isMasterAssociatedWithCosting) {
                        dispatch(getCostingBoughtOutPartSimulationList(simulationId, (res) => {
                            setMasterLoader(false)
                            setCommonStateForList(res)
                            if (res?.data?.Result) {
                                setPlantId(res?.data?.Data?.SimulatedCostingList[0]?.PlantId)
                            }
                        }))
                    } else {
                        dispatch(getAllSimulatedBoughtOutPart(simulationId, (res) => {
                            setMasterLoader(false)
                            setCommonStateForList(res)
                            if (res?.data?.Result) {
                                setPlantId(res?.data?.Data.SimulationBoughtOutPart[0].PlantId)
                            }
                        }))
                    }
                    break;
                case Number(EXCHNAGERATE):
                    setMasterLoader(true)
                    dispatch(getExchangeCostingSimulationList(simulationId, (res) => {
                        setMasterLoader(false)
                        setCommonStateForList(res)
                        if (res?.data?.Result) {
                            setPlantId(res?.data?.Data.SimulatedCostingList[0].PlantId)
                        }
                    }))
                    break;
                case Number(MACHINERATE):
                    setMasterLoader(true)
                    dispatch(getMachineRateCostingSimulationList(simulationId, (res) => {
                        setMasterLoader(false)
                        setCommonStateForList(res)
                        if (res?.data?.Result) {
                            setPlantId(res?.data?.Data.SimulatedCostingList[0].PlantId)
                        }
                    }))
                    break;
                case Number(COMBINED_PROCESS):                   //RE
                    dispatch(getCombinedProcessCostingSimulationList(simulationId, (res) => {
                        setCommonStateForList(res)
                    }))
                    break;
                default:
                    break;
            }
        }
    }

    useEffect(() => {
        setLoader(true)
        hideColumn()
    }, [costingList])

    const closeDrawer2 = (e = '', mode) => {
        if (mode === true) {
            setCostingDetailDrawer(false)
        } else {
            setCostingDetailDrawer(false)
        }
    }

    const viewCosting = (id, data, rowIndex) => {
        let obj = {
            simulationId: simulationId,
            costingId: data.CostingId
        }
        setPricesDetail({
            CostingNumber: data.CostingNumber, PlantCode: data.PlantCode, OldPOPrice: data.OldPOPrice, NewPOPrice: data.NewPOPrice, OldRMPrice: data.OldNetRawMaterialsCost, NewRMPrice: data.NewNetRawMaterialsCost, CostingHead: data.CostingHead, OldNetSurfaceTreatmentCost: data.OldNetSurfaceTreatmentCost, NewNetSurfaceTreatmentCost: data.NewNetSurfaceTreatmentCost, OldOperationCost: data.OldNetOperationCost, NewOperationCost: data.NewNetOperationCost, OldBOPCost: data.OldNetBoughtOutPartCost, NewBOPCost: data.NewNetBoughtOutPartCost, OldExchangeRate: data.OldExchangeRate, NewExchangeRate: data.NewExchangeRate, OldNetPOPriceOtherCurrency: data.OldNetPOPriceOtherCurrency, NewNetPOPriceOtherCurrency: data.NewNetPOPriceOtherCurrency, OldMachineRate: data.OldMachineRate, NewMachineRate: data.NewMachineRate, NewNetCC: data.NewNetCC, OldNetCC: data.OldNetCC, technology: data?.Technology
        })
        dispatch(getComparisionSimulationData(obj, res => {
            const Data = res.data.Data
            const obj1 = [...formViewData(Data.OldCosting, 'Old Costing'), ...formViewData(Data.NewCosting, 'New Costing'), ...formViewData(Data.Variance, 'Variance')]
            dispatch(setCostingViewData(obj1))
            setCostingDetailDrawer(true)
        }))
    }

    const viewAssembly = (cell, row, rowIndex) => {
        const data = row
        setDataForAssemblyImpact(data)
        setShowViewAssemblyDrawer(true)
    }

    const buttonFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                <button className="View" title='View' id={`other_simulation_view${props.rowIndex}`} type={'button'} onClick={() => { viewCosting(cell, row, props?.rowIndex) }} />
                {row?.IsAssemblyExist && <button title='Assembly Impact' id={`other_simulation_assembly${props.rowIndex}`} className="hirarchy-btn" type={'button'} onClick={() => { viewAssembly(cell, row, props?.rowIndex) }}> </button>}

            </>
        )
    }

    const onRowSelect = () => {
        var selectedRows = gridApi.getSelectedRows();
        let tempArr = []
        selectedRows && selectedRows?.map((item, index) => {
            // IsLockedBySimulation COMES TRUE WHEN THAT COSTING IS UNDER APPROVAL
            if (item?.IsLockedBySimulation) {
                tempArr?.push(item)
                return false
            }
            return null
        })

        if (tempArr.length > 1) {

            // IF MULTIPLE COSTING ARE SELECTED AND THEY ARE UNDER APPROVAL "IF" WILL GET EXECUTED
            setSelectedRowData([])
            let approvalLockArray = []
            approvalLockArray = tempArr && tempArr.map(item => {
                return <p className='toaster-message'>{item.ApprovalLockedMessage}</p>
            })
            gridApi.deselectAll()
            Toaster.warning(<div>{approvalLockArray}</div>)
            setTimeout(() => {
                document?.getElementsByClassName('custom-toaster')[0]?.classList?.add('custom-class')
            }, 200);
            return false
        }

        else if (tempArr.length === 1) {         // IF SINGLE COSTING IS SELECTED AND THAT IS UNDER APPROVAL "ELSE IF" WILL GET EXECUTED
            Toaster.warning(tempArr[0]?.ApprovalLockedMessage)
            gridApi.deselectAll()
            return false
        } else {
            setSelectedRowData(selectedRows)
        }
    }

    const onRowSelected = (e) => {
        let isSelected = e.node.isSelected()
        setGridSelection(isSelected, e.node)
    }
    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            if (tableData.length !== 0) {
                setNoData(searchNocontentFilter(value, noData))
            }
        }, 500);
    }
    /**
    * @method setGridSelection
    * @description SET REJECTED DATA FOR API RESPONSE
    */
    const setGridSelection = (isSelected, clickedElement) => {
        var selectedRows = gridApi.getSelectedRows();
        let sendInAPI = sendInAPIState ? sendInAPIState : []
        let index

        if (clickedElement?.data?.BreakupBoughtOutPartId) {
            if (tableData?.findIndex(element => element?.BoughtOutPartId === clickedElement?.data?.BreakupBoughtOutPartId) !== -1) {
                index = tableData?.findIndex(element => element?.BoughtOutPartId === clickedElement?.data?.BreakupBoughtOutPartId)
            }
        }
        // WHEN ROW IS SELECTED "isSelected" COMES TRUE | "IF" WILL GET EXECUTED || WHEN DEELECTED "ELSE" WILL GET EXECUTED
        if (isSelected) {
            // PUSH IN ARRAY | IF PlantCost, PartNo, VendorName of SELECTED ROW MATCHES WITH ANY RECORD OF REJECTED LIST'S PlantCost, PartNo, VendorName 
            rejectedList && rejectedList.map((item) => {
                if (item.PartNo === clickedElement.data.PartNo && item.PlantCode === clickedElement.data.PlantCode &&
                    item.VendorName === clickedElement.data.VendorName) {
                    sendInAPI.push(item)
                }
                return null
            })
        } else {
            let temp = sendInAPI
            // REMOVE FROM ARRAY | IF PlantCost, PartNo, VendorName of SELECTED ROW MATCHES WITH ANY RECORD OF sendInAPI LIST'S PlantCost, PartNo, VendorName
            temp && temp.map((item, index) => {
                if (item.PartNo === clickedElement.data.PartNo && item.PlantCode === clickedElement.data.PlantCode &&
                    item.VendorName === clickedElement.data.VendorName) {
                    sendInAPI.splice(index, 1)                                  // CHECK 
                }
                return null
            })
        }
        setSendInAPIState(sendInAPI)
        setCostingArr([...selectedRows, ...sendInAPI])

        const rowIndex = clickedElement.rowIndex
        const VendorName = clickedElement.data.VendorName
        const PlantCode = clickedElement.data.PlantCode
        const PartNo = clickedElement.data.PartNo
        gridApi.forEachNode(node => {                                           // CHECK 
            if (node.rowIndex !== rowIndex) {
                if (node.data.VendorName === VendorName && node.data.PlantCode === PlantCode &&
                    node.data.PartNo === PartNo) {
                    node.setSelected(isSelected);
                }
            }
            if (index === node.rowIndex) {
                node.setSelected(isSelected);
            }
        });
        setSelectedRowData(selectedRows)
    }

    const onSaveSimulation = () => {
        setShowApprovalHistory(true)
    }

    const closeDrawer = (e = '', type) => {
        if (type === 'submit') {
            setIsApprovalDrawer(false);
            setIsVerifyImpactDrawer(false);
            setShowApprovalHistory(true)
        } else {
            setIsApprovalDrawer(false);
            setCostingDetailDrawer(false)
            setIsVerifyImpactDrawer(false);
        }
    }

    const closeAssemblyDrawer = () => {
        setShowViewAssemblyDrawer(false)
    }

    const verifyImpactDrawer = (e = '', type) => {
        if (type === 'cancel') {
            setIsVerifyImpactDrawer(false);
        }
    }

    const descriptionFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell && cell !== null ? cell : '-'
    }

    const ecnFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cell !== ' ' && cell !== null && cell !== '' && cell !== undefined) ? cell : '-';
    }

    const revisionFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell ? cell : '-'
    }
    const returnVarianceClass = (rowData, value1, value2) => {

        if (rowData?.CostingHeadId === CBCTypeId ? value1 < value2 : value1 > value2) {
            return 'red-value form-control'
        } else if (rowData?.CostingHeadId === CBCTypeId ? value1 > value2 : value1 < value2) {
            return 'green-value form-control'
        } else {
            return 'form-class'
        }
    }
    const oldPOFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row, row.NewPOPrice, row.OldPOPrice)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newPOFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row, row.NewPOPrice, row.OldPOPrice)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const oldRMFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row, row.NewRMPrice, row.OldRMPrice)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newRMFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row, row.NewRMPrice, row.OldRMPrice)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const overheadFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row, row.NewOverheadCost, row.OldOverheadCost)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const profitFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row, row.NewProfitCost, row.OldProfitCost)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const rejectionFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row, row.NewRejectionCost, row.OldRejectionCost)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const costICCFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row, row.NewICCCost, row.OldICCCost)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const paymentTermFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row, row.NewPaymentTermsCost, row.OldPaymentTermsCost)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const otherCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row, row.NewOtherCost, row.OldOtherCost)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const discountCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row, row.NewDiscountCost, row.OldDiscountCost)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const toolCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row, row.NewNetToolCost, row.OldNetToolCost)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const freightCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row, row.NewNetFreightCost, row.OldNetFreightCost)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const packagingCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row, row.NewNetPackagingCost, row.OldNetPackagingCost)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const freightPackagingCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row, row.NewNetFreightPackagingCost, row.OldNetFreightPackagingCost)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const netOverheadAndProfitFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row, row.NewNetOverheadAndProfitCost, row.OldNetOverheadAndProfitCost)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const oldRMCFormatter = (props) => {
        // const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        // const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // const sumold = oldRMCalc(row)
        // const sumnew = newRMCalc(row)
        // const classGreen = (sumnew > sumold) ? 'red-value form-control' :
        //     (row.NewPOPrice < row.OldPOPrice) ? 'green-value form-control' : 'form-class'
        // return <span className={classGreen}>{checkForDecimalAndNull(sumold, getConfigurationKey().NoOfDecimalForPrice)}</span>

        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row, row.NewNetRawMaterialsCost, row.OldNetRawMaterialsCost)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    // // ********** THIS IS RE SPECIFIC **********                    //RE
    // const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
    // const row = props?.valueFormatted ? props.valueFormatted : props?.data;
    // const classGreen = (row.NewNetRawMaterialsCost > row.OldNetRawMaterialsCost) ? 'red-value form-control' : (row.NewNetRawMaterialsCost < row.OldNetRawMaterialsCost) ? 'green-value form-control' : 'form-class'
    // return cell != null ? <span className={classGreen}>{_.round(cell, COSTINGSIMULATIONROUND)}</span> : ''


    const newRMCFormatter = (props) => {
        // const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // const sumold = oldRMCalc(row)
        // const sumnew = newRMCalc(row)
        // const classGreen = (sumnew > sumold) ? 'red-value form-control' : (row.NewPOPrice < row.OldPOPrice) ? 'green-value form-control' : 'form-class'
        // return <span className={classGreen}>{checkForDecimalAndNull(sumnew, getConfigurationKey().NoOfDecimalForPrice)}</span>
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row, row.NewNetRawMaterialsCost, row.OldNetRawMaterialsCost)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''

        // // ********** THIS IS RE SPECIFIC **********                    //RE
        // const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        // const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // const classGreen = (row.NewNetRawMaterialsCost > row.OldNetRawMaterialsCost) ? 'red-value form-control' : (row.NewNetRawMaterialsCost < row.OldNetRawMaterialsCost) ? 'green-value form-control' : 'form-class'
        // return cell != null ? <span className={classGreen}>{_.round(cell, COSTINGSIMULATIONROUND)}</span> : ''
    }
    const oldOPERFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row, row.NewOperationCost, row.OldOperationCost)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newOPERFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = returnVarianceClass(row, row.NewOperationCost, row.OldOperationCost)
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const operQuantityFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const temp = row.IsMultiOperation === true ? 'Multiple Operation' : cell
        return cell != null ? temp : '-';
    }

    const operSTFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const temp = row.IsMultiOperation === true ? 'Multiple Surface Treatment' : cell
        return cell != null ? temp : '-';
    }

    const BOPQuantityFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const temp = row.IsMultiBoughtOutPart === true ? `Multiple ${showBopLabel()} ` : cell
        return cell != null ? temp : '-';
    }

    const processFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const temp = row.IsMultiProcess === true ? 'Multiple Process' : cell
        return cell != null ? temp : '-';
    }

    const varianceFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        let value = row?.OldBOPRate - row?.NewBOPRate
        return cell != null ? checkForDecimalAndNull(value, getConfigurationKey().NoOfDecimalForPrice) : '-';
    }

    const partTypeFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cell != null && cell.length !== 0) ? cell : '-'
    }

    const oldSTFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewSurfaceTreatmentCost > row.OldSurfaceTreatmentCost) ? 'red-value form-control' : (row.NewSurfaceTreatmentCost < row.OldSurfaceTreatmentCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newSTFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewSurfaceTreatmentCost > row.OldSurfaceTreatmentCost) ? 'red-value form-control' : (row.NewSurfaceTreatmentCost < row.OldSurfaceTreatmentCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const oldNetSTFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewNetSurfaceTreatmentCost > row.OldNetSurfaceTreatmentCost) ? 'red-value form-control' : (row.NewNetSurfaceTreatmentCost < row.OldNetSurfaceTreatmentCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newNetSTFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewNetSurfaceTreatmentCost > row.OldNetSurfaceTreatmentCost) ? 'red-value form-control' : (row.NewNetSurfaceTreatmentCost < row.OldNetSurfaceTreatmentCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const varianceRMCFormatter = (props) => {
        // const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // const sumold = oldRMCalc(row)
        // const sumnew = newRMCalc(row)
        // const diff = (sumold - sumnew).toFixed(getConfigurationKey().NoOfDecimalForPrice)
        // return checkForDecimalAndNull(diff)
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        let variance = checkForDecimalAndNull(row.RMVariance, initialConfiguration?.NoOfDecimalForPrice)
        variance = variance > 0 ? `+${variance}` : variance;
        // const classGreen = (row.NewNetRawMaterialsCost > row.OldNetRawMaterialsCost) ? 'red-value form-control' : (row.NewNetRawMaterialsCost < row.OldNetRawMaterialsCost) ? 'green-value form-control' : 'form-class'
        return variance;

        // const cell = props?.valueFormatted ? props.valueFormatted : props?.value;                    //RE
        // const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // let roudOffOld = 0, rounfOffNew = 0
        // roudOffOld = _.round(row.OldNetRawMaterialsCost, COSTINGSIMULATIONROUND)
        // rounfOffNew = _.round(row.NewNetRawMaterialsCost, COSTINGSIMULATIONROUND)
        // let value = Math.abs(roudOffOld - rounfOffNew)
        // return (<div>
        //     {value ? (row.NewNetRawMaterialsCost > row.OldNetRawMaterialsCost ? < span className='positive-sign'>+</span> : < span className='positive-sign'>-</span>) : ''}
        //     {cell != null ? (Math.abs(value)).toFixed(COSTINGSIMULATIONROUND) : '-'}
        // </div >)                    //RE


    }
    const variancePOFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        let variance = checkForDecimalAndNull(row.Variance, getConfigurationKey().NoOfDecimalForPrice)
        variance = variance > 0 ? `+${variance}` : variance;
        return variance;


        // const cell = props?.valueFormatted ? props.valueFormatted : props?.value;                    //RE
        // const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // let roudOffOld = 0, rounfOffNew = 0
        // roudOffOld = _.round(row.OldPOPrice, COSTINGSIMULATIONROUND)
        // rounfOffNew = _.round(row.NewPOPrice, COSTINGSIMULATIONROUND)
        // let value = Math.abs(roudOffOld - rounfOffNew)
        // return (<div>
        //     {value ? (row.NewPOPrice > row.OldPOPrice ? < span className='positive-sign'>+</span> : < span className='positive-sign'>-</span>) : ''}
        //     {cell != null ? (Math.abs(value)).toFixed(COSTINGSIMULATIONROUND) : '-'}
        // </div >)                    //RE

    }

    const decimalFormatter = (props) => {
        const cell = props?.value;
        let variance = checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)
        variance = variance > 0 ? `+${variance}` : variance;
        return variance;
    }

    const varianceSTFormatter = (props) => {
        // const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // const sumold = oldRMCalc(row)
        // const sumnew = newRMCalc(row)
        // const diff = (sumold - sumnew).toFixed(getConfigurationKey().NoOfDecimalForPrice)
        // return checkForDecimalAndNull(diff)

        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        let variance = checkForDecimalAndNull(row.NetSurfaceTreatmentCostVariance, getConfigurationKey().NoOfDecimalForPrice)
        variance = variance > 0 ? `+${variance}` : variance;
        return variance;

        // // ********** THIS IS RE SPECIFIC **********                    //RE
        // const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        // const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // let roudOffOld = 0, rounfOffNew = 0
        // roudOffOld = _.round(row.OldNetSurfaceTreatmentCost, COSTINGSIMULATIONROUND)
        // rounfOffNew = _.round(row.NewNetSurfaceTreatmentCost, COSTINGSIMULATIONROUND)
        // let value = Math.abs(roudOffOld - rounfOffNew)
        // return (<div>
        //     {value ? (row.NewNetSurfaceTreatmentCost > row.OldNetSurfaceTreatmentCost ? < span className='positive-sign'>+</span> : < span className='positive-sign'>-</span>) : ''}
        //     {cell != null ? (Math.abs(value)).toFixed(COSTINGSIMULATIONROUND) : '-'}
        // </div >)                    //RE
    }

    const ERVarianceFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        let variance = checkForDecimalAndNull(row.ExchangeRateVariance, getConfigurationKey().NoOfDecimalForPrice)
        variance = variance > 0 ? `+${variance}` : variance;
        return variance;

        // // ********** THIS IS RE SPECIFIC **********                    //RE
        // const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        // const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // let roudOffOld = 0, rounfOffNew = 0
        // roudOffOld = _.round(row.OldExchangeRate, COSTINGSIMULATIONROUND)
        // rounfOffNew = _.round(row.NewExchangeRate, COSTINGSIMULATIONROUND)
        // let value = Math.abs(roudOffOld - rounfOffNew)
        // return (<div>
        //     {value ? (row.NewExchangeRate > row.OldExchangeRate ? < span className='positive-sign'>+</span> : < span className='positive-sign'>-</span>) : ''}
        //     {cell != null ? (Math.abs(value)).toFixed(COSTINGSIMULATIONROUND) : '-'}
        // </div >)                    //RE


    }

    const oldExchangeFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewExchangeRate > row.OldExchangeRate) ? 'red-value form-control' : (row.NewExchangeRate < row.OldExchangeRate) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newExchangeFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewExchangeRate > row.OldExchangeRate) ? 'red-value form-control' : (row.NewExchangeRate < row.OldExchangeRate) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newPOCurrencyFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewNetPOPriceOtherCurrency > row.OldNetPOPriceOtherCurrency) ? 'red-value form-control' : (row.NewNetPOPriceOtherCurrency < row.OldNetPOPriceOtherCurrency) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const oldPOCurrencyFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewNetPOPriceOtherCurrency > row.OldNetPOPriceOtherCurrency) ? 'red-value form-control' : (row.NewNetPOPriceOtherCurrency < row.OldNetPOPriceOtherCurrency) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const plantFormatter = (props) => {
        return props.value ? `${props.value}` : '-'
    }

    const impactPerQuarterFormatter = (props) => {
        const cell = props?.value;
        return cell != null ? checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice) : '-'
    }

    const processCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewNetProcessCost > row.OldNetProcessCost) ? 'red-value form-control' : (row.NewNetProcessCost < row.OldNetProcessCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const hideColumn = (props) => {
        let data = { ...hideDataColumn }
        costingList && costingList.map((item, i) => {
            if (costingList[i].NewOverheadCost !== 0 && Number(costingList[i].OldOverheadCost) !== Number(costingList[i].NewOverheadCost)) {
                data = { ...data, hideOverhead: false }
            }

            if (costingList[i].NewProfitCost !== 0 && Number(costingList[i].OldProfitCost) !== Number(costingList[i].NewProfitCost)) {
                data = { ...data, hideProfit: false }
            }

            if (costingList[i].NewRejectionCost !== 0 && Number(costingList[i].OldRejectionCost) !== Number(costingList[i].NewRejectionCost)) {
                data = { ...data, hideRejection: false }
            }

            if (costingList[i].NewICCCost !== 0 && Number(costingList[i].OldICCCost) !== Number(costingList[i].NewICCCost)) {
                data = { ...data, hideICC: false }
            }
            if (costingList[i].NewPaymentTermsCost !== 0 && Number(costingList[i].OldPaymentTermsCost) !== Number(costingList[i].NewPaymentTermsCost)) {
                data = { ...data, hidePayment: false }
            }

            if (costingList[i].NewOtherCost !== 0 && Number(costingList[i].OldOtherCost) !== Number(costingList[i].NewOtherCost)) {
                data = { ...data, hideOtherCost: false }
            }

            if (costingList[i].NewDiscountCost !== 0 && Number(costingList[i].OldDiscountCost) !== Number(costingList[i].NewDiscountCost)) {
                data = { ...data, hideDiscount: false }
            }

            if (costingList[i].NewNetOverheadAndProfitCost !== 0 && Number(costingList[i].OldNetOverheadAndProfitCost) !== Number(costingList[i].NewNetOverheadAndProfitCost)) {
                data = { ...data, hideOveheadAndProfit: false }
            }

            if (costingList[i].NewNetToolCost !== 0 && Number(costingList[i].OldNetToolCost) !== Number(costingList[i].NewNetToolCost)) {
                data = { ...data, hideToolCost: false }
            }

            if (costingList[i].NewNetFreightCost !== 0 && Number(costingList[i].OldNetFreightCost) !== Number(costingList[i].NewNetFreightCost)) {

                data = { ...data, hideFrieghtCost: false }
            }

            if (costingList[i].NewNetPackagingCost !== 0 && Number(costingList[i].OldNetPackagingCost) !== Number(costingList[i].NewNetPackagingCost)) {
                data = { ...data, hidePackagingCost: false }
            }

            if (costingList[i].NewNetFreightPackagingCost !== 0 && Number(costingList[i].OldNetFreightPackagingCost) !== Number(costingList[i].NewNetFreightPackagingCost)) {
                data = { ...data, hideFreightPackagingCost: false }
            }

            if (costingList[i].NewNetChildPartsCostWithQuantity !== 0 && costingList[i].OldNetChildPartsCostWithQuantity !== 0) {
                data = { ...data, showChildParts: false }
            }

            if (costingList[i].NewNetBoughtOutPartCost !== 0 && costingList[i].OldNetBoughtOutPartCost !== 0) {
                data = { ...data, showBoughtOutPartCost: false }
            }
            return null
        })

        setHideDataColumn({ ...hideDataColumn, ...data })
        setShowBOPColumn(costingSimulationListAllKeys?.IsBoughtOutPartSimulation === true ? true : false)
        setShowSurfaceTreatmentColumn(costingSimulationListAllKeys?.IsSurfaceTreatmentSimulation === true ? true : false)
        setShowOperationColumn(costingSimulationListAllKeys?.IsOperationSimulation === true ? true : false)
        setShowRMColumn(costingSimulationListAllKeys?.IsRawMaterialSimulation === true ? true : false)
        setShowExchangeRateColumn((costingSimulationListAllKeys?.IsExchangeRateSimulation === true && simulationApplicability?.value === APPLICABILITY_PART_SIMULATION) ? true : false)
        setShowMachineRateColumn(costingSimulationListAllKeys?.IsMachineProcessSimulation === true ? true : false)
        setShowCombinedProcessColumn(costingSimulationListAllKeys?.IsCombinedProcessSimulation === true ? true : false)
        setIsMultipleMasterSimulation(costingSimulationListAllKeys?.IsBoughtOutPartSimulation === true ||
            // costingSimulationListAllKeys?.IsCombinedProcessSimulation === true ||                    //RE
            costingSimulationListAllKeys?.IsRawMaterialSimulation === true ||
            costingSimulationListAllKeys?.IsOperationSimulation === true || costingSimulationListAllKeys?.IsSurfaceTreatmentSimulation === true ||
            costingSimulationListAllKeys?.IsBoughtOutPartSimulation === true || costingSimulationListAllKeys?.IsMachineProcessSimulation === true)
        setTimeout(() => {
            if (costingList && costingList.length > 0) {

                setLoader(false)
            }
        }, 200);


        // let arr = [], countFalse = 0
        // costingList && costingList.map((item) => {
        //     // item.IsBoughtOutPartSimulation
        //     arr.push(item.IsBoughtOutPartSimulation)
        //     countFalse = item.IsBoughtOutPartSimulation === false ? countFalse++ : countFalse
        //     if (countFalse === costingList.length) {
        //         setShowBOPColumn(false)
        //     } else {
        //         setShowBOPColumn(true)
        //     }
        // })
    }

    const netBOPPartCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewNetBoughtOutPartCost > row.OldNetBoughtOutPartCost) ? 'red-value form-control' : (row.NewNetBoughtOutPartCost < row.OldNetBoughtOutPartCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const operVarianceFormatter = (props) => {
        const cell = props?.value;
        return cell != null ? checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice) : ''
    }

    const BOPVarianceFormatter = (props) => {
        const cell = props?.value;
        return cell != null ? checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice) : ''
    }

    /**
     * @method hyphenFormatter
     */
    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }

    const returnExcelColumn = (data = [], TempData) => {
        let tempData = [...data]
        if (!reactLocalStorage.getObject('CostingTypePermission').cbc) {
            tempData = hideColumnFromExcel(tempData, 'CustomerName')
        } else {
            if (Number(amendmentDetails?.SimulationHeadId) === Number(CBCTypeId)) {
                tempData = hideColumnFromExcel(tempData, 'VendorName')
            } else if (Number(amendmentDetails?.SimulationHeadId) === Number(VBCTypeId)) {
                tempData = hideColumnFromExcel(tempData, 'CustomerName')
            } else if (Number(amendmentDetails?.SimulationHeadId) === Number(ZBCTypeId)) {

                tempData = hideMultipleColumnFromExcel(tempData, ['CustomerName', 'VendorName'])
            }
        }
        let temp = []
        temp = SimulationUtils(TempData)    // common function 
        return (
            <ExcelSheet data={temp} name={'Costing'}>
                {tempData && tempData.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>
        );
    }

    const returnExcelColumnSecond = (data = []) => {
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
        let arrayOFCorrectObjIndividual = []
        let tempArr = []
        // ********** EXTRACT PART NO. FROM SELECTED ROWS IN AN ARRAY ********** */
        selectedRowData.map((item) => {
            tempArr.push(item?.CostingId)
            return null
        })

        //********** APPLY MAP ON PART NO ARRAY | COMPARE WITH REDUCER'S ALL PART NO. ONE BY ONE | CONDITION - TRUE -> PUSH IN ARRAY  ********** */
        //********** TO GET OTHER RECOED IN LIST WHICH WERE FILTERED TO SHOW UNIQUE IN LISTING  ********** */
        tempArr && tempArr.map((itemOut) => {
            let temp = []
            costingList && costingList.map((item) => {
                if (itemOut === item.CostingId) {
                    temp.push(item)
                }
                return null
            })
            // ************ CONCAT ALL DATA IN SINGLE ARRAY *********** */
            arrayOFCorrectObjIndividual = arrayOFCorrectObjIndividual.concat(temp);
            return null
        })
        if (!isMasterAssociatedWithCosting) {
            arrayOFCorrectObjIndividual = [...selectedRowData]
        }
        let finalGrid = [], isTokenAPI = false
        if (showBOPColumn === true || showRMColumn === true || showOperationColumn === true || showSurfaceTreatmentColumn === true ||
            showExchangeRateColumn === true || showMachineRateColumn === true
            || showCombinedProcessColumn === true
        ) {
            if (showBOPColumn || isBOPDomesticOrImport) {
                finalGrid = [...finalGrid, ...BOPGridForToken]
                isTokenAPI = true
            }
            if (showRMColumn || isRMDomesticOrRMImport) {
                finalGrid = [...finalGrid, ...RMGridForToken]
                isTokenAPI = true
            }
            if (showOperationColumn || isOperation) {
                finalGrid = [...finalGrid, ...OperationGridForToken]
                isTokenAPI = true
            }
            if (showSurfaceTreatmentColumn || isSurfaceTreatment) {
                finalGrid = [...finalGrid, ...STGridForToken]
                isTokenAPI = true
            }
            if (showExchangeRateColumn || isExchangeRate) {
                finalGrid = [...finalGrid, ...ERGridForToken]
                isTokenAPI = true
            }
            if (showMachineRateColumn || isMachineRate) {
                finalGrid = [...finalGrid, ...MRGridForToken]
                isTokenAPI = true
            }
            // if (showMachineRateColumn || isMachineRate) {
            //     finalGrid = [...finalGrid, ...OperationGridForToken]
            // isTokenAPI = true
            // }

            // CONDITION FOR COMBINED PROCESS
            if (showCombinedProcessColumn || isCombinedProcess) {                    //RE
                finalGrid = [...finalGrid, ...CPGridForToken]
                isTokenAPI = true
            }
            finalGrid = [...InitialGridForToken, ...finalGrid, ...LastGridForToken]
        }

        if (isMultiTechnology) {
            return returnExcelColumn(CostingSimulationDownloadAssemblyTechnology, selectedRowData?.length > 0 ? arrayOFCorrectObjIndividual : downloadList && downloadList?.length > 0 ? downloadList : [])
        } else {
            let masterIdTemp = master
            let listRM = []
            let listBOP = []
            let listST = []
            let listOP = []
            let listMR = []
            let listCP = []
            let listER = []
            if (String(master) === String(EXCHNAGERATE) || amendmentDetails?.IsExchangeRateSimulation) {
                if (simulationApplicability?.value === APPLICABILITY_BOP_SIMULATION) {
                    masterIdTemp = BOPIMPORT
                } else if (simulationApplicability?.value === APPLICABILITY_RM_SIMULATION) {
                    masterIdTemp = RMIMPORT
                }
                listRM = CostingSimulationDownloadRM
                listBOP = CostingSimulationDownloadBOP
            } else {
                masterIdTemp = master
                listRM = hideMultipleColumnFromExcel(CostingSimulationDownloadRM, ["OldExchangeRate", "NewExchangeRate", "ERVariance"])
                listBOP = hideMultipleColumnFromExcel(CostingSimulationDownloadBOP, ["OldExchangeRate", "NewExchangeRate", "ERVariance"])
            }
            if (!showSaLineNumber()) {
                // Hide the specified columns using the common function
                listRM = hideMultipleColumnFromExcel(listRM, ['SANumber', 'LineNumber']);
                listBOP = hideMultipleColumnFromExcel(listBOP, ['SANumber', 'LineNumber']);
                listST = hideMultipleColumnFromExcel(CostingSimulationDownloadST, ['SANumber', 'LineNumber']);
                listOP = hideMultipleColumnFromExcel(CostingSimulationDownloadOperation, ['SANumber', 'LineNumber']);
                listMR = hideMultipleColumnFromExcel(CostingSimulationDownloadMR, ['SANumber', 'LineNumber']);
                listCP = hideMultipleColumnFromExcel(COMBINEDPROCESSSIMULATION, ['SANumber', 'LineNumber']);
                listER = hideMultipleColumnFromExcel(EXCHANGESIMULATIONDOWNLOAD, ['SANumber', 'LineNumber']);
            }

            switch (Number(masterIdTemp)) {
                case Number(RMDOMESTIC):
                case Number(RMIMPORT):
                    return returnExcelColumn(isTokenAPI ? finalGrid : !showSaLineNumber() ? listRM : CostingSimulationDownloadRM, selectedRowData?.length > 0 ? arrayOFCorrectObjIndividual : downloadList && downloadList?.length > 0 ? downloadList : [])
                case Number(SURFACETREATMENT):
                    return returnExcelColumn(isTokenAPI ? finalGrid : !showSaLineNumber() ? listST : CostingSimulationDownloadST, selectedRowData?.length > 0 ? arrayOFCorrectObjIndividual : downloadList && downloadList?.length > 0 ? downloadList : [])
                case Number(OPERATIONS):
                    return returnExcelColumn(isTokenAPI ? finalGrid : !showSaLineNumber() ? listOP : CostingSimulationDownloadOperation, selectedRowData?.length > 0 ? arrayOFCorrectObjIndividual : downloadList && downloadList?.length > 0 ? downloadList : [])
                case Number(BOPDOMESTIC):
                case Number(BOPIMPORT):
                    return returnExcelColumn(isTokenAPI ? finalGrid : (isMasterAssociatedWithCosting ? !showSaLineNumber() ? listBOP : CostingSimulationDownloadBOP : SimulationDownloadBOP), selectedRowData?.length > 0 ? arrayOFCorrectObjIndividual : downloadList && downloadList?.length > 0 ? downloadList : [])
                // return returnExcelColumn(isTokenAPI ? finalGrid : (isMasterAssociatedWithCosting ? CostingSimulationDownloadBOP : SimulationDownloadBOP), selectedRowData?.length > 0 ? arrayOFCorrectObjIndividual : downloadList && downloadList?.length > 0 ? downloadList : [])                    //RE
                case Number(EXCHNAGERATE):
                    return returnExcelColumn(isTokenAPI ? finalGrid : !showSaLineNumber() ? listER : EXCHANGESIMULATIONDOWNLOAD, selectedRowData.length > 0 ? selectedRowData : downloadList && downloadList.length > 0 ? downloadList : [])
                case Number(MACHINERATE):
                    return returnExcelColumn(isTokenAPI ? finalGrid : !showSaLineNumber() ? listMR : CostingSimulationDownloadMR, selectedRowData.length > 0 ? selectedRowData : downloadList && downloadList.length > 0 ? downloadList : [])
                case Number(COMBINED_PROCESS):                    //RE
                    return returnExcelColumn(isTokenAPI ? finalGrid : !showSaLineNumber() ? listCP : COMBINEDPROCESSSIMULATION, selectedRowData.length > 0 ? selectedRowData : downloadList && downloadList.length > 0 ? downloadList : [])
                default:
                    return 'foo'
            }
        }
    }

    const isFirstColumn = (params) => {
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;

        return thisIsFirstColumn;
    }


    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        headerCheckboxSelection: isFirstColumn,
        checkboxSelection: isFirstColumn
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
        const checkBoxInstance = document.querySelectorAll('.ag-input-field-input.ag-checkbox-input');
        checkBoxInstance.forEach((checkBox, index) => {
            const specificId = `other_simulation_Checkbox${index}`;
            checkBox.id = specificId;
        })
        const floatingFilterInstances = document.querySelectorAll('.ag-input-field-input.ag-text-field-input');
        floatingFilterInstances.forEach((floatingFilter, index) => {
            const specificId = `other_simulation_Floating${index}`;
            floatingFilter.id = specificId;
        });
        var allColumnIds = [];
        params.columnApi.getAllColumns().forEach(function (column) {
            allColumnIds.push(column.colId);
        });
        if (!isMasterAssociatedWithCosting && isBOPDomesticOrImport) {
            params.api.sizeColumnsToFit();
        } else {
            window.screen.width >= 1921 && gridRef.current.api.sizeColumnsToFit();
        }

    };

    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const resetState = () => {
        gridOptions?.columnApi?.resetColumnState();
        gridOptions?.api?.setFilterModel(null);
        gridApi?.setQuickFilter(null);
        document.getElementById("filter-text-box").value = "";
        if (!isMasterAssociatedWithCosting) {
            gridRef.current.api.sizeColumnsToFit();
        } else {
            window.screen.width >= 1921 && gridRef.current.api.sizeColumnsToFit();
        }
    }
    const errorBoxClass = () => {
        let temp
        temp = (status === '' || status === null || status === undefined) ? 'd-none' : ''
        return temp
    }

    const costingIdObj = (list) => {
        let data = []
        list && list?.map(item => {
            let obj = {}
            obj.SimulationId = simulationId
            data.push(obj)
        })
        return data
    }

    const sendForApproval = () => {
        if (getConfigurationKey().IsReleaseStrategyConfigured) {
            let returnValue = true
            let dataList = costingIdObj(selectedRowData)
            let requestObject = {
                "RequestFor": "SIMULATION",
                "TechnologyId": SimulationTechnologyIdState,
                "LoggedInUserId": loggedInUserId(),
                "ReleaseStrategyApprovalDetails": _.uniqBy(dataList, 'SimulationId')
            }
            dispatch(getReleaseStrategyApprovalDetails(requestObject, (res) => {
                setReleaseStrategyDetails(res?.data?.Data)
                if (res?.data?.Data?.IsUserInApprovalFlow && res?.data?.Data?.IsFinalApprover === false) {
                    setIsApprovalDrawer(true)
                } else if (res?.data?.Data?.IsPFSOrBudgetingDetailsExist === false) {
                    setIsApprovalDrawer(true)
                    showIsPFSOrBudgetingDetailsExistWarning(true)
                } else if (res?.data?.Data?.IsFinalApprover === true) {
                    Toaster.warning('This is final level user')
                    return false
                } else {
                    Toaster.warning(res?.data?.Message ? res?.data?.Message : 'This user is not in approval cycle')
                    return false
                }
            }))
            return returnValue
        } else {
            setIsApprovalDrawer(true)
        }
    }


    const frameworkComponents = {

        descriptionFormatter: descriptionFormatter,
        ecnFormatter: ecnFormatter,
        revisionFormatter: revisionFormatter,
        oldPOFormatter: oldPOFormatter,
        newPOFormatter: newPOFormatter,
        oldRMFormatter: oldRMFormatter,
        buttonFormatter: buttonFormatter,
        newRMFormatter: newRMFormatter,
        newOPERFormatter: newOPERFormatter,
        oldOPERFormatter: oldOPERFormatter,
        newSTFormatter: newSTFormatter,
        oldSTFormatter: oldSTFormatter,
        newNetSTFormatter: newNetSTFormatter,
        oldNetSTFormatter: oldNetSTFormatter,
        // customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
        ERVarianceFormatter: ERVarianceFormatter,
        overheadFormatter: overheadFormatter,
        profitFormatter: profitFormatter,
        rejectionFormatter: rejectionFormatter,
        costICCFormatter: costICCFormatter,
        paymentTermFormatter: paymentTermFormatter,
        otherCostFormatter: otherCostFormatter,
        discountCostFormatter: discountCostFormatter,
        toolCostFormatter: toolCostFormatter,
        freightPackagingCostFormatter: freightPackagingCostFormatter,
        packagingCostFormatter: packagingCostFormatter,
        freightCostFormatter: freightCostFormatter,
        netOverheadAndProfitFormatter: netOverheadAndProfitFormatter,
        hideColumn: hideColumn,
        oldRMCFormatter: oldRMCFormatter,
        newRMCFormatter: newRMCFormatter,
        varianceRMCFormatter: varianceRMCFormatter,
        varianceSTFormatter: varianceSTFormatter,
        variancePOFormatter: variancePOFormatter,
        oldExchangeFormatter: oldExchangeFormatter,
        newExchangeFormatter: newExchangeFormatter,
        oldPOCurrencyFormatter: oldPOCurrencyFormatter,
        newPOCurrencyFormatter: newPOCurrencyFormatter,
        operQuantityFormatter: operQuantityFormatter,
        BOPQuantityFormatter: BOPQuantityFormatter,
        operSTFormatter: operSTFormatter,
        // CPvarianceFormatter: CPvarianceFormatter,            //RE
        operVarianceFormatter: operVarianceFormatter,
        BOPVarianceFormatter: BOPVarianceFormatter,
        decimalFormatter: decimalFormatter,
        netBOPPartCostFormatter: netBOPPartCostFormatter,
        // netCCFormatter: netCCFormatter,          //RE
        plantFormatter: plantFormatter,
        impactPerQuarterFormatter: impactPerQuarterFormatter,
        hyphenFormatter: hyphenFormatter,
        processCostFormatter: processCostFormatter,
        processFormatter: processFormatter,
        // processVarianceFormatter: processVarianceFormatter,          //RE
        varianceFormatter: varianceFormatter,
        partTypeFormatter: partTypeFormatter
    };

    const isRowSelectable = rowNode => statusForLinkedToken === true ? false : true;

    const headers = { netCostHeadder: `Net Cost (${reactLocalStorage.getObject("baseCurrency")})` }

    return (
        <>
            {isMasterLoader ? <LoaderCustom customClass={`center-loader`} /> :

                !showApprovalHistory &&
                    loader ? <LoaderCustom customClass={`center-loader`} /> :
                    <div className="costing-simulation-page blue-before-inside other-costing-simulation">
                        <div className="container-fluid">
                            <div className={`ag-grid-react ${isFromApprovalListing ? 'pt-4' : ''}`}>


                                <Row>
                                    <Col sm="12">
                                        <Errorbox customClass={errorBoxClass()} errorText={status} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm="12">
                                        <h3 class="mb-0">Token No:{tokenNo}</h3>
                                    </Col>
                                </Row>
                                <Row className="filter-row-large pt-4 blue-before">

                                    <Col md="3" lg="3" className="search-user-block mb-3">
                                        <div className="d-flex justify-content-end bd-highlight w100">

                                            {(showRMColumn || showBOPColumn || showOperationColumn ||
                                                showMachineRateColumn || showExchangeRateColumn || showSurfaceTreatmentColumn)
                                                ?
                                                <ExcelFile filename={'Costing'} fileExtension={'.xls'} element={
                                                    <button title="Download" type="button" className={'user-btn mr5'} id={'other_simulation_excel_download'} ><div className="download mr-0"></div></button>}>
                                                    {renderColumn()}
                                                    {returnExcelColumnSecond()}
                                                    {returnExcelColumnImpactedMaster()}

                                                </ExcelFile> :
                                                <ExcelFile filename={'Costing'} fileExtension={'.xls'} element={
                                                    <button title="Download" type="button" className={'user-btn mr5'} id={'other_simulation_excel_download'} ><div className="download mr-0"></div></button>}>
                                                    {renderColumn()}
                                                    {returnExcelColumnSecond()}
                                                </ExcelFile>

                                            }
                                            <button type="button" className="user-btn" id={'other_simulation_reset_grid'} title="Reset Grid" onClick={() => resetState()}>
                                                <div className="refresh mr-0"></div>
                                            </button>
                                        </div>
                                    </Col >
                                </Row >
                                <Row>
                                    <Col>
                                        <div className={`ag-grid-wrapper ${(tableData && tableData?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                                            <div className="ag-grid-header">
                                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                                            </div>
                                            <div className="ag-theme-material p-relative" >
                                                {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found simulation-lisitng" />}
                                                {<AgGridReact
                                                    defaultColDef={defaultColDef}
                                                    floatingFilter={true}
                                                    ref={gridRef}
                                                    domLayout='autoHeight'
                                                    // columnDefs={c}
                                                    rowData={tableData}
                                                    pagination={true}
                                                    paginationPageSize={defaultPageSize}
                                                    onGridReady={onGridReady}
                                                    gridOptions={gridOptions}
                                                    // loadingOverlayComponent={'customLoadingOverlay'}
                                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                                    noRowsOverlayComponentParams={{
                                                        title: EMPTY_DATA,
                                                    }}
                                                    frameworkComponents={frameworkComponents}
                                                    suppressRowClickSelection={true}
                                                    rowSelection={'multiple'}
                                                    // frameworkComponents={frameworkComponents}
                                                    onSelectionChanged={onRowSelect}
                                                    isRowSelectable={isRowSelectable}
                                                    onRowSelected={onRowSelected}
                                                    onFilterModified={onFloatingFilterChanged}
                                                    enableBrowserTooltips={true}
                                                >
                                                    {/* <AgGridColumn width={150} field="CostingNumber" headerName='Costing ID'></AgGridColumn>
                                                    <AgGridColumn width={110} field="PartNo" headerName='Part No.'></AgGridColumn>
                                                    <AgGridColumn width={120} field="PartName" headerName='Part Name' cellRenderer='descriptionFormatter'></AgGridColumn>
                                                    <AgGridColumn width={110} field="ECNNumber" headerName='ECN No.' cellRenderer='ecnFormatter'></AgGridColumn>
                                                    <AgGridColumn width={130} field="RevisionNumber" headerName='Revision No.' cellRenderer='revisionFormatter'></AgGridColumn>
                                                <AgGridColumn width={140} field="VendorName" cellRenderer='vendorFormatter' headerName='Vendor'></AgGridColumn> */}

                                                    {isSimulationWithCosting && <AgGridColumn width={150} field="CostingNumber" tooltipField='CostingNumber' headerName='Costing Id'></AgGridColumn>}
                                                    <AgGridColumn width={140} field="CostingHead" tooltipField='CostingHead' headerName='Costing Head'></AgGridColumn>
                                                    {!isSimulationWithCosting && isBOPDomesticOrImport && <AgGridColumn width={130} field="BoughtOutPartNumber" tooltipField='BoughtOutPartNumber' headerName='BOP Number'></AgGridColumn>}
                                                    {!isSimulationWithCosting && isBOPDomesticOrImport && <AgGridColumn width={130} field="BoughtOutPartName" tooltipField='BoughtOutPartName' headerName='BOP Name'></AgGridColumn>}

                                                    {isSimulationWithCosting && <AgGridColumn width={130} field="PartNo" tooltipField='PartNo' headerName='Part No.'></AgGridColumn>}
                                                    {!isSimulationWithCosting && isBOPDomesticOrImport && <AgGridColumn width={130} field="BoughtOutPartNumber" tooltipField='BoughtOutPartNumber' headerName='BOP Number'></AgGridColumn>}
                                                    {!isSimulationWithCosting && isBOPDomesticOrImport && <AgGridColumn width={130} field="BoughtOutPartName" tooltipField='BoughtOutPartName' headerName='BOP Name'></AgGridColumn>}
                                                    {isSimulationWithCosting && <AgGridColumn width={130} field="PartName" tooltipField='PartName' headerName='Part Name' cellRenderer='descriptionFormatter'></AgGridColumn>}
                                                    {isSimulationWithCosting && <AgGridColumn width={120} field="PartType" tooltipField='PartType' cellRenderer='partTypeFormatter' headerName="Part Type"></AgGridColumn>}
                                                    {(isSimulationWithCosting && !amendmentDetails?.IsExchangeRateSimulation) && <AgGridColumn width={130} field="Technology" tooltipField='Technology' headerName={technologyLabel}></AgGridColumn>}
                                                    {isSimulationWithCosting && <AgGridColumn width={110} field="ECNNumber" tooltipField='ECNNumber' headerName='ECN No.' cellRenderer='ecnFormatter'></AgGridColumn>}
                                                    {isSimulationWithCosting && <AgGridColumn width={130} field="RevisionNumber" tooltipField='RevisionNumber' headerName='Revision No.' cellRenderer='revisionFormatter'></AgGridColumn>}
                                                    {/* //MINDA */}
                                                    {isSimulationWithCosting && showSaLineNumber() && <AgGridColumn width={130} field="SANumber" tooltipField='SANumber' headerName='SA Number' editable={true}></AgGridColumn>}
                                                    {isSimulationWithCosting && showSaLineNumber() && <AgGridColumn width={130} field="LineNumber" tooltipField='LineNumber' headerName='Line Number' editable={true}></AgGridColumn>}
                                                    {/* //MINDA */}
                                                    {((isMachineRate || showMachineRateColumn) && !isMultipleMasterSimulation) && <AgGridColumn width={140} field="ProcessName" tooltipField='ProcessName' headerName='Process Name' cellRenderer='processFormatter'></AgGridColumn>}
                                                    {((isMachineRate || showMachineRateColumn) && !isMultipleMasterSimulation) && <AgGridColumn width={140} field="ProcessCode" tooltipField='ProcessCode' headerName='Process Code' cellRenderer='processFormatter'></AgGridColumn>}
                                                    {Number(amendmentDetails?.SimulationHeadId) === Number(VBCTypeId) && <AgGridColumn width={150} field="VendorName" tooltipField='VendorName' headerName={vendorLabel + " (Code)"}></AgGridColumn>}
                                                    {Number(amendmentDetails?.SimulationHeadId) === Number(CBCTypeId) && <AgGridColumn width={150} field="CustomerName" tooltipField='CustomerName' headerName='Customer (Code)'></AgGridColumn>}
                                                    {isSimulationWithCosting && <AgGridColumn width={150} field="PlantName" tooltipField='PlantName' cellRenderer='plantFormatter' headerName='Plant (Code)'></AgGridColumn>}
                                                    {isSimulationWithCosting && <AgGridColumn width={150} field="InfoCategory" tooltipField='InfoCategory' cellRenderer='hyphenFormatter' headerName='Category'></AgGridColumn>}
                                                    {isSimulationWithCosting && <AgGridColumn width={140} field="BudgetedPrice" tooltipField='BudgetedPrice' headerName='Budgeted Price' cellRenderer='impactPerQuarterFormatter'></AgGridColumn>}


                                                    {(isRMDomesticOrRMImport || showRMColumn) && <AgGridColumn width={110} field="RMName" hide ></AgGridColumn>}
                                                    {(isRMDomesticOrRMImport || showRMColumn) && <AgGridColumn width={120} field="RMGrade" hide ></AgGridColumn>}
                                                    {(isRMDomesticOrRMImport || showRMColumn) && <AgGridColumn field="RawMaterialFinishWeight" hide headerName='Finish Weight'></AgGridColumn>}
                                                    {(isRMDomesticOrRMImport || showRMColumn) && <AgGridColumn field="RawMaterialGrossWeight" hide headerName='Gross Weight'></AgGridColumn>}

                                                    {(isRMDomesticOrRMImport || isBOPDomesticOrImport || showRMColumn || showBOPColumn) && <AgGridColumn field="Currency" headerName='Currency' />}

                                                    {(isCombinedProcess || showCombinedProcessColumn) && <AgGridColumn width={140} field="OldNetCC" headerName='Old Net CC' cellRenderer='netCCFormatter'></AgGridColumn>}
                                                    {(isCombinedProcess || showCombinedProcessColumn) && <AgGridColumn width={140} field="NewNetCC" headerName='New Net CC' cellRenderer='netCCFormatter'></AgGridColumn>}

                                                    {!(isExchangeRate || showExchangeRateColumn) && isSimulationWithCosting && <AgGridColumn width={140} field="OldPOPrice" tooltipField='OldPOPrice' headerName='Existing PO Price' cellRenderer='oldPOFormatter'></AgGridColumn>}
                                                    {!(isExchangeRate || showExchangeRateColumn) && isSimulationWithCosting && <AgGridColumn width={140} field="NewPOPrice" tooltipField='NewPOPrice' headerName='Revised PO Price' cellRenderer='newPOFormatter'></AgGridColumn>}
                                                    {!(isExchangeRate || showExchangeRateColumn) && isSimulationWithCosting && <AgGridColumn width={140} field="Variance" tooltipField='Variance' headerName='Variance (w.r.t. Existing)' cellRenderer='variancePOFormatter' ></AgGridColumn>}
                                                    {!(isExchangeRate || showExchangeRateColumn) && isSimulationWithCosting && <AgGridColumn width={140} field="BudgetedPriceVariance" tooltipField='BudgetedPriceVariance' headerName='Variance (w.r.t. Budgeted)' cellRenderer='impactPerQuarterFormatter'></AgGridColumn>}

                                                    {(isRMDomesticOrRMImport || showRMColumn) && <AgGridColumn width={140} field="OldNetRawMaterialsCost" tooltipField='OldNetRawMaterialsCost' headerName='Existing RM Cost/Pc' cellRenderer='oldRMCFormatter'></AgGridColumn>}
                                                    {(isRMDomesticOrRMImport || showRMColumn) && <AgGridColumn width={140} field="NewNetRawMaterialsCost" tooltipField='NewNetRawMaterialsCost' headerName='Revised RM Cost/Pc' cellRenderer='newRMCFormatter'></AgGridColumn>}
                                                    {(isRMDomesticOrRMImport || showRMColumn) && <AgGridColumn width={140} field="RMVariance" tooltipField='RMVariance' headerName='Variance (RM Cost)' cellRenderer='varianceRMCFormatter' ></AgGridColumn>}
                                                    {(isRMDomesticOrRMImport || showRMColumn) && <AgGridColumn width={140} field="OldScrapRate" hide></AgGridColumn>}
                                                    {(isRMDomesticOrRMImport || showRMColumn) && <AgGridColumn width={140} field="NewScrapRate" hide></AgGridColumn>}


                                                    {((isSurfaceTreatment || showSurfaceTreatmentColumn) && !isMultipleMasterSimulation) && <AgGridColumn width={140} field="SurfaceArea" tooltipField='SurfaceArea' headerName='Surface Area' cellRenderer='operSTFormatter' ></AgGridColumn>}
                                                    {(isSurfaceTreatment || showSurfaceTreatmentColumn) && <AgGridColumn width={140} field="OldSurfaceTreatmentRate" tooltipField='OldSurfaceTreatmentRate' headerName='Existing ST Rate' cellRenderer="operSTFormatter"></AgGridColumn>}
                                                    {(isSurfaceTreatment || showSurfaceTreatmentColumn) && <AgGridColumn width={140} field="NewSurfaceTreatmentRate" tooltipField='NewSurfaceTreatmentRate' headerName='Revised ST Rate' cellRenderer="operSTFormatter"></AgGridColumn>}
                                                    {(isSurfaceTreatment || showSurfaceTreatmentColumn) && <AgGridColumn width={140} field="OldSurfaceTreatmentCost" tooltipField='OldSurfaceTreatmentCost' headerName='Existing ST Cost' cellRenderer="oldSTFormatter"></AgGridColumn>}
                                                    {(isSurfaceTreatment || showSurfaceTreatmentColumn) && <AgGridColumn width={140} field="NewSurfaceTreatmentCost" tooltipField='NewSurfaceTreatmentCost' headerName='Revised ST Cost' cellRenderer="newSTFormatter"></AgGridColumn>}
                                                    {(isSurfaceTreatment || showSurfaceTreatmentColumn) && <AgGridColumn width={140} field="OldTranspotationCost" tooltipField='OldTranspotationCost' headerName='Existing Extra Cost' ></AgGridColumn>}
                                                    {(isSurfaceTreatment || showSurfaceTreatmentColumn) && <AgGridColumn width={140} field="NewTranspotationCost" tooltipField='NewTranspotationCost' headerName='Revised Extra Cost' ></AgGridColumn>}
                                                    {(isSurfaceTreatment || showSurfaceTreatmentColumn) && <AgGridColumn width={140} field="OldNetSurfaceTreatmentCost" tooltipField='OldNetSurfaceTreatmentCost' headerName='Existing Net ST Cost' cellRenderer="oldNetSTFormatter"></AgGridColumn>}
                                                    {(isSurfaceTreatment || showSurfaceTreatmentColumn) && <AgGridColumn width={140} field="NewNetSurfaceTreatmentCost" tooltipField='NewNetSurfaceTreatmentCost' headerName='Revised Net ST Cost' cellRenderer="newNetSTFormatter"></AgGridColumn>}
                                                    {(isSurfaceTreatment || showSurfaceTreatmentColumn) && <AgGridColumn width={140} field="NetSurfaceTreatmentCostVariance" tooltipField='NetSurfaceTreatmentCostVariance' headerName='Variance (ST Cost)' cellRenderer='varianceSTFormatter' ></AgGridColumn>}

                                                    {(isOperation || showOperationColumn) && <AgGridColumn width={185} field="ForType" headerName="Operation Type" minWidth={190}></AgGridColumn>}
                                                    {((isOperation || showOperationColumn) && !isMultipleMasterSimulation) && <AgGridColumn width={140} field="Quantity" tooltipField='Quantity' headerName='Quantity' cellRenderer='operQuantityFormatter'  ></AgGridColumn>}
                                                    {(isOperation || showOperationColumn) && <AgGridColumn width={140} field="OldOperationRate" tooltipField='OldOperationRate' headerName='Existing Oper Rate' cellRenderer="operQuantityFormatter" ></AgGridColumn>}
                                                    {(isOperation || showOperationColumn) && <AgGridColumn width={140} field="NewOperationRate" tooltipField='NewOperationRate' headerName='Revised Oper Rate' cellRenderer="operQuantityFormatter"></AgGridColumn>}
                                                    {(isOperation || showOperationColumn) && <AgGridColumn width={140} field="OldNetOperationCost" tooltipField='OldNetOperationCost' headerName='Existing Net Oper Cost' cellRenderer="oldOPERFormatter" ></AgGridColumn>}
                                                    {(isOperation || showOperationColumn) && <AgGridColumn width={140} field="NewNetOperationCost" tooltipField='NewNetOperationCost' headerName='Revised Net Oper Cost' cellRenderer="newOPERFormatter"></AgGridColumn>}
                                                    {(isOperation || showOperationColumn) && <AgGridColumn width={140} field="OperationCostVariance" tooltipField='OperationCostVariance' headerName='Variance (Oper. Cost)' cellRenderer="operVarianceFormatter" ></AgGridColumn>}


                                                    {((isBOPDomesticOrImport || showBOPColumn) && !isMultipleMasterSimulation) && isSimulationWithCosting && <AgGridColumn width={140} field="BoughtOutPartQuantity" tooltipField='BoughtOutPartQuantity' headerName={`${showBopLabel()} Quantity`} cellRenderer='BOPQuantityFormatter' ></AgGridColumn>}
                                                    {((isBOPDomesticOrImport || showBOPColumn) && !isMultipleMasterSimulation) && <AgGridColumn width={140} field="OldBOPRate" tooltipField='OldBOPRate' headerName={`Existing ${showBopLabel()} Rate`} cellRenderer={BOPQuantityFormatter} ></AgGridColumn>}
                                                    {((isBOPDomesticOrImport || showBOPColumn) && !isMultipleMasterSimulation) && <AgGridColumn width={140} field="NewBOPRate" tooltipField='NewBOPRate' headerName={`Revised ${showBopLabel()} Rate`} cellRenderer={BOPQuantityFormatter} ></AgGridColumn>}

                                                    {((isBOPDomesticOrImport || showBOPColumn) && !isMultipleMasterSimulation) && <AgGridColumn width={140} field="OldNetLandedCost" tooltipField='OldNetLandedCost' headerName='Existing Net Landed Cost' cellRenderer={BOPQuantityFormatter} ></AgGridColumn>}
                                                    {((isBOPDomesticOrImport || showBOPColumn) && !isMultipleMasterSimulation) && <AgGridColumn width={140} field="NewNetLandedCost" tooltipField='NewNetLandedCost' headerName='Revised Net Landed Cost' cellRenderer={BOPQuantityFormatter} ></AgGridColumn>}

                                                    {!isSimulationWithCosting && <AgGridColumn width={140} field="Variance" tooltipField='Variance' headerName='Variance' cellRenderer='varianceFormatter' ></AgGridColumn>}
                                                    {(isBOPDomesticOrImport || showBOPColumn || isBreakupBoughtOutPart) && isSimulationWithCosting && <AgGridColumn width={140} field="OldNetBoughtOutPartCost" tooltipField='OldNetBoughtOutPartCost' headerName={`Existing Net ${showBopLabel()} Cost`} cellRenderer='netBOPPartCostFormatter' ></AgGridColumn>}
                                                    {(isBOPDomesticOrImport || showBOPColumn || isBreakupBoughtOutPart) && isSimulationWithCosting && <AgGridColumn width={140} field="NewNetBoughtOutPartCost" tooltipField='NewNetBoughtOutPartCost' headerName={`Revised Net ${showBopLabel()} Cost`} cellRenderer='netBOPPartCostFormatter'></AgGridColumn>}
                                                    {(isBOPDomesticOrImport || showBOPColumn || isBreakupBoughtOutPart) && isSimulationWithCosting && <AgGridColumn width={140} field="NetBoughtOutPartCostVariance" tooltipField='NetBoughtOutPartCostVariance' headerName={`Variance (${showBopLabel()} Cost)`} cellRenderer='BOPVarianceFormatter' ></AgGridColumn>}


                                                    {(isMachineRate || showMachineRateColumn) && <AgGridColumn width={140} field="OldNetProcessCost" tooltipField='OldNetProcessCost' headerName='Existing Net Process Cost' cellRenderer='processCostFormatter' ></AgGridColumn>}
                                                    {(isMachineRate || showMachineRateColumn) && <AgGridColumn width={140} field="NewNetProcessCost" tooltipField='NewNetProcessCost' headerName='Revised Net Process Cost' cellRenderer='processCostFormatter'></AgGridColumn>}
                                                    {(isMachineRate || showMachineRateColumn) && <AgGridColumn width={140} field="NetProcessCostVariance" tooltipField='NetProcessCostVariance' headerName='Variance (Proc. Cost)' cellRenderer={decimalFormatter} ></AgGridColumn>}


                                                    {(isExchangeRate || showExchangeRateColumn) && <AgGridColumn width={130} field="Currency" tooltipField='Currency' headerName='Currency' cellRenderer='revisionFormatter'></AgGridColumn>}
                                                    {(isExchangeRate || showExchangeRateColumn) && <AgGridColumn width={140} field="OldPOPrice" tooltipField='OldPOPrice' headerName='Net Cost' cellRenderer='oldPOFormatter'></AgGridColumn>}


                                                    {/* <AgGridColumn width={140} field="NewPOPrice" headerName='Net Cost New' cellRenderer='newPOFormatter'></AgGridColumn> */}


                                                    {(isExchangeRate || showExchangeRateColumn) && <AgGridColumn width={220} field="OldNetPOPriceOtherCurrency" tooltipField='OldNetPOPriceOtherCurrency' headerName='Existing Net Cost(in Currency)' cellRenderer='oldPOCurrencyFormatter'></AgGridColumn>}
                                                    {(isExchangeRate || showExchangeRateColumn) && <AgGridColumn width={220} field="NewNetPOPriceOtherCurrency" tooltipField='NewNetPOPriceOtherCurrency' headerName='Revised Net Cost (in Currency)' cellRenderer='newPOCurrencyFormatter'></AgGridColumn>}
                                                    {(isExchangeRate || showExchangeRateColumn) && <AgGridColumn width={170} field="POVariance" tooltipField='POVariance' headerName='Variance (w.r.t. Existing)' cellRenderer={decimalFormatter}></AgGridColumn>}
                                                    {(isExchangeRate || showExchangeRateColumn) && <AgGridColumn width={140} field="BudgetedPriceVariance" tooltipField='BudgetedPriceVariance' headerName='Variance (w.r.t. Budgeted)' cellRenderer='impactPerQuarterFormatter'></AgGridColumn>}
                                                    {(isExchangeRate || showExchangeRateColumn) && <AgGridColumn width={170} field="OldExchangeRate" tooltipField='OldExchangeRate' headerName='Existing Exchange Rate' cellRenderer='oldExchangeFormatter'></AgGridColumn>}
                                                    {(isExchangeRate || showExchangeRateColumn) && <AgGridColumn width={170} field="NewExchangeRate" tooltipField='NewExchangeRate' headerName='Revised Exchange Rate' cellRenderer='newExchangeFormatter'></AgGridColumn>}
                                                    {(isExchangeRate || showExchangeRateColumn) && <AgGridColumn width={140} field="ERVariance" tooltipField='ERVariance' headerName='Variance (ER Cost)' cellRenderer='ERVarianceFormatter'></AgGridColumn>}

                                                    {(isMultiTechnology && hideDataColumn.showChildParts) && <AgGridColumn width={140} field="OldNetChildPartsCostWithQuantity" tooltipField='OldNetChildPartsCostWithQuantity' headerName="Existing Net Child's Part Cost With Quantity" cellRenderer={decimalFormatter}></AgGridColumn>}
                                                    {(isMultiTechnology && hideDataColumn.showChildParts) && <AgGridColumn width={140} field="NewNetChildPartsCostWithQuantity" tooltipField='NewNetChildPartsCostWithQuantity' headerName="Revised Net Child's Part Cost With Quantity" cellRenderer={decimalFormatter}></AgGridColumn>}
                                                    {(isMultiTechnology && hideDataColumn.showChildParts) && <AgGridColumn width={140} field="Variance" tooltipField='Variance' headerName='Variance (w.r.t. Existing)' cellRenderer={decimalFormatter}></AgGridColumn>}
                                                    {(isMultiTechnology && hideDataColumn.showBoughtOutPartCost) && <AgGridColumn width={140} field="OldNetBoughtOutPartCost" tooltipField='OldNetBoughtOutPartCost' headerName={`Existing Net ${showBopLabel()} Cost`} cellRenderer='netBOPPartCostFormatter' ></AgGridColumn>}
                                                    {(isMultiTechnology && hideDataColumn.showBoughtOutPartCost) && <AgGridColumn width={140} field="NewNetBoughtOutPartCost" tooltipField='NewNetBoughtOutPartCost' headerName={`Revised Net ${showBopLabel()} Cost`} cellRenderer='netBOPPartCostFormatter'></AgGridColumn>}
                                                    {(isMultiTechnology && hideDataColumn.showBoughtOutPartCost) && <AgGridColumn width={140} field="NetBoughtOutPartCostVariance" tooltipField='NetBoughtOutPartCostVariance' headerName={`Variance (${showBopLabel()} Cost)`} cellRenderer='BOPVarianceFormatter' ></AgGridColumn>}

                                                    {/* {showRM && <AgGridColumn width={150} field="RMName" tooltipField="RMName" headerName="RM Name"></AgGridColumn>}
                                                        {showRM && <AgGridColumn width={150} field="RMGrade" tooltipField="RMGrade" headerName="RM Grade"></AgGridColumn>}
                                                        {showRM && <AgGridColumn width={150} field="RMSpecification" tooltipField="RMSpecification" headerName="RM Specification"></AgGridColumn>}

                                                        {showBOP && <AgGridColumn width={150} field="BOPName" tooltipField="BOPName" headerName="BOP Name"></AgGridColumn>}
                                                        {showBOP && <AgGridColumn width={150} field="BOPNumber" tooltipField="BOPNumber" headerName="BOP Number"></AgGridColumn>}
                                                        {showBOP && <AgGridColumn width={150} field="Category" tooltipField="Category" headerName="Category"></AgGridColumn>} */}

                                                    {/* {showComponent && <AgGridColumn width={150} field="NewPOPrice" tooltipField="NewPOPrice" headerName="Revised Net Cost"></AgGridColumn>}
                                                             {showComponent && <AgGridColumn width={150} field="NewPOPrice" tooltipField="NewPOPrice" headerName="Revised Net Cost"></AgGridColumn>}
                                                              {showComponent && <AgGridColumn width={150} field="NewPOPrice" tooltipField="NewPOPrice" headerName="Revised Net Cost"></AgGridColumn>} */}

                                                    {isSimulationWithCosting && <AgGridColumn width={140} field="ImpactPerQuarter" tooltipField='ImpactPerQuarter' headerName='Impact/Quarter (w.r.t. Existing)' cellRenderer='impactPerQuarterFormatter'></AgGridColumn>}
                                                    {isSimulationWithCosting && <AgGridColumn width={140} field="BudgetedPriceImpactPerQuarter" tooltipField='BudgetedPriceImpactPerQuarter' headerName='Impact/Quarter (w.r.t. Budgeted Price)' cellRenderer='impactPerQuarterFormatter'></AgGridColumn>}

                                                    {!(isExchangeRate) && isSimulationWithCosting && <AgGridColumn width={140} field="OldOverheadCost" hide={hideDataColumn.hideOverhead} cellRenderer='overheadFormatter' headerName='Existing Overhead'></AgGridColumn>}
                                                    {!(isExchangeRate) && isSimulationWithCosting && <AgGridColumn width={140} field="NewOverheadCost" hide={hideDataColumn.hideOverhead} cellRenderer='overheadFormatter' headerName='Revised Overhead'></AgGridColumn>}
                                                    {!(isExchangeRate) && isSimulationWithCosting && <AgGridColumn width={140} field="OldProfitCost" hide={hideDataColumn.hideProfit} cellRenderer='profitFormatter' headerName='Existing Profit'></AgGridColumn>}
                                                    {!(isExchangeRate) && isSimulationWithCosting && <AgGridColumn width={140} field="NewProfitCost" hide={hideDataColumn.hideProfit} cellRenderer='profitFormatter' headerName='Revised Profit'></AgGridColumn>}
                                                    {!(isExchangeRate) && isSimulationWithCosting && <AgGridColumn width={140} field="OldRejectionCost" hide={hideDataColumn.hideRejection} cellRenderer='rejectionFormatter' headerName='Existing Rejection'></AgGridColumn>}
                                                    {!(isExchangeRate) && isSimulationWithCosting && <AgGridColumn width={140} field="NewRejectionCost" hide={hideDataColumn.hideRejection} cellRenderer='rejectionFormatter' headerName='Revised Rejection'></AgGridColumn>}
                                                    {!(isExchangeRate) && isSimulationWithCosting && <AgGridColumn width={140} field="OldICCCost" hide={hideDataColumn.hideICC} cellRenderer='costICCFormatter' headerName='Existing ICC'></AgGridColumn>}
                                                    {!(isExchangeRate) && isSimulationWithCosting && <AgGridColumn width={140} field="NewICCCost" hide={hideDataColumn.hideICC} cellRenderer='costICCFormatter' headerName='Revised ICC'></AgGridColumn>}
                                                    {!(isExchangeRate) && isSimulationWithCosting && <AgGridColumn width={140} field="OldPaymentTermsCost" hide={hideDataColumn.hidePayment} cellRenderer='paymentTermFormatter' headerName='Existing Payment Terms'></AgGridColumn>}
                                                    {!(isExchangeRate) && isSimulationWithCosting && <AgGridColumn width={140} field="NewPaymentTermsCost" hide={hideDataColumn.hidePayment} cellRenderer='paymentTermFormatter' headerName='Revised Payment Terms'></AgGridColumn>}
                                                    {!(isExchangeRate) && isSimulationWithCosting && <AgGridColumn width={140} field="OldOtherCost" hide={hideDataColumn.hideOtherCost} cellRenderer='otherCostFormatter' headerName='Existing Other Cost'></AgGridColumn>}
                                                    {!(isExchangeRate) && isSimulationWithCosting && <AgGridColumn width={140} field="NewOtherCost" hide={hideDataColumn.hideOtherCost} cellRenderer='otherCostFormatter' headerName='Revised Other Cost'></AgGridColumn>}
                                                    {!(isExchangeRate) && isSimulationWithCosting && <AgGridColumn width={140} field="OldDiscountCost" hide={hideDataColumn.hideDiscount} cellRenderer='discountCostFormatter' headerName='Existing Discount'></AgGridColumn>}
                                                    {!(isExchangeRate) && isSimulationWithCosting && <AgGridColumn width={140} field="NewDiscountCost" hide={hideDataColumn.hideDiscount} cellRenderer='discountCostFormatter' headerName='Revised Discount'></AgGridColumn>}
                                                    {!(isExchangeRate) && isSimulationWithCosting && <AgGridColumn width={140} field="NewNetToolCost" hide={hideDataColumn.hideToolCost} cellRenderer='toolCostFormatter' headerName='Revised Tool Cost'></AgGridColumn>}
                                                    {!(isExchangeRate) && isSimulationWithCosting && <AgGridColumn width={140} field="OldNetToolCost" hide={hideDataColumn.hideToolCost} cellRenderer='toolCostFormatter' headerName='Existing Tool Cost'></AgGridColumn>}
                                                    {!(isExchangeRate) && isSimulationWithCosting && <AgGridColumn width={140} field="NewNetFreightCost" hide={hideDataColumn.hideFrieghtCost} cellRenderer='freightCostFormatter' headerName='Revised Freight Cost'></AgGridColumn>}
                                                    {!(isExchangeRate) && isSimulationWithCosting && <AgGridColumn width={140} field="OldNetFreightCost" hide={hideDataColumn.hideFrieghtCost} cellRenderer='freightCostFormatter' headerName='Existing Freight Cost'></AgGridColumn>}
                                                    {!(isExchangeRate) && isSimulationWithCosting && <AgGridColumn width={140} field="NewNetPackagingCost" hide={hideDataColumn.hidePackagingCost} cellRenderer='packagingCostFormatter' headerName='Revised Packaging Cost'></AgGridColumn>}
                                                    {!(isExchangeRate) && isSimulationWithCosting && <AgGridColumn width={140} field="OldNetPackagingCost" hide={hideDataColumn.hidePackagingCost} cellRenderer='packagingCostFormatter' headerName='Existing Packaging Cost'></AgGridColumn>}
                                                    {!(isExchangeRate) && isSimulationWithCosting && <AgGridColumn width={160} field="NewNetFreightPackagingCost" hide={hideDataColumn.hideFreightPackagingCost} cellRenderer='freightPackagingCostFormatter' headerName='Revised Freight & Packaging Cost'></AgGridColumn>}
                                                    {!(isExchangeRate) && isSimulationWithCosting && <AgGridColumn width={160} field="OldNetFreightPackagingCost" hide={hideDataColumn.hideFreightPackagingCost} cellRenderer='freightPackagingCostFormatter' headerName='Existing Freight & Packaging Cost'></AgGridColumn>}

                                                    {isSimulationWithCosting && <AgGridColumn width={120} field="CostingId" headerName='Actions' type="rightAligned" floatingFilter={false} cellRenderer='buttonFormatter' pinned="right"></AgGridColumn>}
                                                </AgGridReact >}
                                                {storeTechnology === FORGINGNAME && <WarningMessage dClass="float-right" textClass="mt2" message="If RMC is calculated through RM weight calculator then change in scrap rate won't affect the RMC." />}
                                                {amendmentDetails?.SimulationHeadId && <PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
                                            </div >
                                        </div >
                                    </Col >
                                </Row >
                            </div >
                            <Row className={`sf-btn-footer no-gutters justify-content-between bottom-footer ${showTour ? '' : 'sticky-btn-footer'}`}>
                                <div className="col-sm-12 text-right bluefooter-butn d-flex align-items-center justify-content-end">
                                    {disableSendForApproval && <WarningMessage dClass={"mr-2"} message={message} />}
                                    {isPFSOrBudgetingDetailsExistWarning && <WarningMessage message={warningMessage} />}
                                    <button
                                        class="user-btn approval-btn mr5"
                                        onClick={() => sendForApproval()}
                                        id={'other_simulation_send_for_approval'}
                                        disabled={((selectedRowData && selectedRowData.length === 0) || isFinalLevelApprover || disableSendForApproval) ? true : disableApproveButton ? true : false}
                                        title="Send For Approval"
                                    >
                                        <div className="send-for-approval"></div>
                                        {'Send For Approval'}
                                    </button>

                                    <button
                                        type="button"
                                        className="user-btn mr5 save-btn"
                                        id={'other_simulation_go_to_history'}
                                        // disabled={((selectedRowData && selectedRowData.length === 0) || isFromApprovalListing) ? true : false}
                                        onClick={onSaveSimulation}>
                                        <div className={"back-icon"}></div>
                                        {"Go to History"}
                                    </button>

                                    <button className="user-btn mr5 save-btn" id={'other_simulation_verify_impact'} onClick={() => { setIsVerifyImpactDrawer(true) }}>
                                        <div className={"save-icon"}></div>
                                        {"Verify Impact"}
                                    </button>

                                    <div>
                                        {disableApproveButton && <WarningMessage message={'Super Admin cannot send simulation for approval'} />}
                                    </div>
                                </div >
                            </Row >
                        </div >
                        {isApprovalDrawer &&
                            <SimulationApproveReject
                                isOpen={isApprovalDrawer}
                                vendorId={vendorIdState}
                                SimulationTechnologyId={SimulationTechnologyIdState}
                                SimulationType={simulationTypeState}

                                anchor={'right'}
                                approvalData={[]}
                                type={'Sender'}
                                simulationDetail={simulationDetail}
                                selectedRowData={selectedRowData}
                                costingArr={costingArr}
                                master={selectedMasterForSimulation?.value ? selectedMasterForSimulation?.value : master}
                                closeDrawer={closeDrawer}
                                isSimulation={true}
                                apiData={apiData}
                                costingTypeId={amendmentDetails?.SimulationHeadId}
                                releaseStrategyDetails={releaseStrategyDetails}
                                technologyId={SimulationTechnologyIdState}
                                showApprovalTypeDropdown={true}
                                approvalTypeIdValue={amendmentDetails?.SimulationHeadId}
                                IsExchangeRateSimulation={amendmentDetails?.IsExchangeRateSimulation}
                            // isSaveDone={isSaveDone}
                            />
                        }

                        {
                            isVerifyImpactDrawer &&
                            <VerifyImpactDrawer
                                isOpen={isVerifyImpactDrawer}
                                anchor={'bottom'}
                                approvalData={[]}
                                type={'Approve'}
                                closeDrawer={verifyImpactDrawer}
                                isSimulation={true}
                                SimulationTechnologyIdState={SimulationTechnologyIdState}
                                simulationId={simulationId}
                                tokenNo={tokenNo}
                                vendorIdState={vendorIdState}
                                EffectiveDate={simulationDetail.EffectiveDate}
                                amendmentDetails={amendmentDetails}
                                dataForAssemblyImpactInVerifyImpact={tableData}
                                assemblyImpactButtonTrue={assemblyImpactButtonTrue}
                                CostingTypeId={amendmentDetails?.SimulationHeadId}
                                isSimulationWithCosting={isSimulationWithCosting}
                                costingIdArray={costingIdArray}
                            />
                        }
                    </div >

            }


            {(showApprovalHistory || getShowSimulationPage) && <Redirect to='/simulation-history' />}

            {
                CostingDetailDrawer &&
                <CostingDetailSimulationDrawer
                    isOpen={CostingDetailSimulationDrawer}
                    closeDrawer={closeDrawer2}
                    anchor={"right"}
                    pricesDetail={pricesDetail}
                    simulationDetail={simulationDetail}
                    selectedRowData={selectedRowData}
                    costingArr={costingArr}
                    master={selectedMasterForSimulation?.value ? selectedMasterForSimulation?.value : master}
                    // closeDrawer={closeDrawer}
                    isSimulation={true}
                    simulationDrawer={true}
                    IsExchangeRateSimulation={amendmentDetails?.IsExchangeRateSimulation}
                    simulationMode={true}
                    selectedTechnology={pricesDetail.technology}
                />
            }
            {
                showViewAssemblyDrawer &&
                <ViewAssembly
                    isOpen={showViewAssemblyDrawer}
                    closeDrawer={closeAssemblyDrawer}
                    // approvalData={approvalData}
                    anchor={'bottom'}
                    dataForAssemblyImpact={dataForAssemblyImpact}
                    vendorIdState={vendorIdState}
                    isPartImpactAssembly={true}
                    isImpactDrawer={true}
                    simulationId={simulationId}
                />
            }
        </>

    );
}

export default CostingSimulation;
