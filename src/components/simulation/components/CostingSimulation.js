import React, { useState, useRef, Fragment } from 'react';
import { Row, Col, } from 'reactstrap';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NoContentFound from '../../common/NoContentFound';
import { BOPDOMESTIC, BOPIMPORT, TOFIXEDVALUE, EMPTY_DATA, MACHINERATE, OPERATIONS, RMDOMESTIC, RMIMPORT, SURFACETREATMENT, ImpactMaster, EXCHNAGERATE, defaultPageSize } from '../../../config/constants';
import { getComparisionSimulationData, getCostingBoughtOutPartSimulationList, getCostingSimulationList, getCostingSurfaceTreatmentSimulationList, setShowSimulationPage, getSimulatedAssemblyWiseImpactDate, getImpactedMasterData, getExchangeCostingSimulationList, getMachineRateCostingSimulationList, getAllMultiTechnologyCostings, getAllSimulatedMultiTechnologyCosting } from '../actions/Simulation';
import ApproveRejectDrawer from '../../costing/components/approval/ApproveRejectDrawer'
import CostingDetailSimulationDrawer from './CostingDetailSimulationDrawer'
import { checkForDecimalAndNull, checkForNull, formViewData, getConfigurationKey, userDetails } from '../../../helper';
import VerifyImpactDrawer from './VerifyImpactDrawer';
import { EMPTY_GUID, AssemblyWiseImpactt } from '../../../config/constants';
import Toaster from '../../common/Toaster';
import { Redirect } from 'react-router';
import { setCostingViewData } from '../../costing/actions/Costing';
import { toast } from 'react-toastify';
import {
    ASSEMBLY_WISEIMPACT_DOWNLOAD_EXCEl,
    BOPGridForToken,
    CostingSimulationDownloadAssemblyTechnology,
    CostingSimulationDownloadBOP, CostingSimulationDownloadMR, CostingSimulationDownloadOperation, CostingSimulationDownloadRM, CostingSimulationDownloadST
    , ERGridForToken, EXCHANGESIMULATIONDOWNLOAD, IdForMultiTechnology, InitialGridForToken, LastGridForToken, MRGridForToken, OperationGridForToken, RMGridForToken, STGridForToken
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

const gridOptions = {};

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

function CostingSimulation(props) {
    const { simulationId, isFromApprovalListing, master, statusForLinkedToken } = props

    const getShowSimulationPage = useSelector((state) => state.simulation.getShowSimulationPage)

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
        hideFreightPackagingCost: true
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
    const [downloadList, setDownloadList] = useState([]);
    const [rejectedList, setRejectedList] = useState([]);
    const [sendInAPIState, setSendInAPIState] = useState([]);
    const [isMultipleMasterSimulation, setIsMultipleMasterSimulation] = useState(false);

    const isSurfaceTreatment = (Number(master) === Number(SURFACETREATMENT));
    const isOperation = (Number(master) === Number(OPERATIONS));
    const isRMDomesticOrRMImport = ((Number(master) === Number(RMDOMESTIC)) || (Number(master) === Number(RMIMPORT)));
    const isBOPDomesticOrImport = ((Number(master) === Number(BOPDOMESTIC)) || (Number(master) === Number(BOPIMPORT)))
    const isMachineRate = Number(master) === (Number(MACHINERATE));
    const isExchangeRate = Number(master) === (Number(EXCHNAGERATE));
    const simulationAssemblyListSummary = useSelector((state) => state.simulation.simulationAssemblyListSummary)
    const impactedMasterData = useSelector(state => state.comman.impactedMasterData)
    const gridRef = useRef();

    const costingList = useSelector(state => state.simulation.costingSimulationList)

    const costingSimulationListAllKeys = useSelector(state => state.simulation.costingSimulationListAllKeys)

    const selectedMasterForSimulation = useSelector(state => state.simulation.selectedMasterForSimulation)
    const selectedTechnologyForSimulation = useSelector(state => state.simulation.selectedTechnologyForSimulation)
    const isMultiTechnology = IdForMultiTechnology.includes(String(selectedMasterForSimulation?.value));

    const dispatch = useDispatch()

    useEffect(() => {
        getCostingList()
        dispatch(getImpactedMasterData(simulationId, () => { }))
    }, [])

    useEffect(() => {
        // TO CHECK IF ANY OF THE RECORD HAS ASSEMBLY ROW
        let count = 0
        tableData && tableData.map((item) => {
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
            setSimulationTypeState(SimulationType)
            let tempArrayCosting = Data.SimulatedCostingList

            tempArrayCosting && tempArrayCosting.map(item => {
                item.Variance = (item.OldPOPrice - item.NewPOPrice).toFixed(getConfigurationKey().NoOfDecimalForPrice)
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
                switch (String(master)) {
                    case EXCHNAGERATE:
                        item.POVariance = (checkForNull(item.OldNetPOPriceOtherCurrency).toFixed(TOFIXEDVALUE) -
                            checkForNull(item.NewNetPOPriceOtherCurrency).toFixed(TOFIXEDVALUE))
                        item.ERVariance = (checkForNull(item.OldExchangeRate).toFixed(TOFIXEDVALUE) -
                            checkForNull(item.NewExchangeRate).toFixed(TOFIXEDVALUE))

                        break;
                    default:
                        break;
                }
                return null
            })

            let uniqeArray = []
            const map = new Map();
            for (const item of tempArrayCosting) {
                if (!map.has(item.CostingNumber)) {                          // ENTERS "IF", IF MAP DO NOT HAVE COSTING NUMBER IN IT 
                    map.set(item.CostingNumber, true);                       // SET COSTING (NUMBER, TRUE) IN MAP 
                    uniqeArray.push(item);                                   //  ALSO PUSH ITEM IN ARRAY WHICH BECOMES UNIQUE FROM COSTING NUMBER
                }
            }

            setTokenNo(tokenNo)
            setAPIData(tempArrayCosting)
            setCostingArr(tempArrayCosting)
            setSimulationDetail({ TokenNo: Data.SimulationTokenNumber, Status: Data.SimulationStatus, SimulationId: Data.SimulationId, SimulationAppliedOn: Data.SimulationAppliedOn, EffectiveDate: Data.EffectiveDate })
            setLoader(false)
            let tempObj = {}
            tempObj.EffectiveDate = Data.EffectiveDate
            tempObj.SimulationHeadId = Data.SimulatedCostingList[0].SimulationHeadId
            tempObj.SimulationAppliedOn = Data.SimulationAppliedOn
            tempObj.Technology = Data.SimulatedCostingList[0].Technology
            tempObj.Vendor = Data.SimulatedCostingList[0].VendorName
            tempObj.TotalImpactPerQuarter = Data.TotalImpactPerQuarter
            setAmendmentDetails(tempObj)

            //LISTING
            // SECOND PARAMETER TRUE | TO SAVE UNIQUE LIST OF NON REQUIRED COSTING(COMPONENT COSTING OF ASSEMBLY'S CHILD)  
            const list = getListMultipleAndAssembly(uniqeArray, true)
            setTableData(list)

            //DOWNLOAD
            let downloadList = getListMultipleAndAssembly(Data.SimulatedCostingList, false)
            setDownloadList(downloadList)

        }
    }

    /**
    * @method getCostingList
    * @description API CALL FOR GET LIST OF ALL MASTERS
    */
    const getCostingList = (plantId = '', rawMatrialId = '') => {
        if (IdForMultiTechnology.includes(String(selectedTechnologyForSimulation?.value))) {
            dispatch(getAllSimulatedMultiTechnologyCosting(simulationId, (res) => {
                setCommonStateForList(res)
            }))
        } else {
            switch (Number(selectedMasterForSimulation?.value)) {
                //  ***** WHEN SAME BLOCK OF CODE IS FOR TWO DIFFERENT CASES | WE WRITE TWO CASES TOGETHER *****
                case Number(RMDOMESTIC):
                case Number(RMIMPORT):
                    dispatch(getCostingSimulationList(simulationId, plantId, rawMatrialId, res => {
                        setCommonStateForList(res)
                    }))
                    break;
                case Number(SURFACETREATMENT):
                    dispatch(getCostingSurfaceTreatmentSimulationList(simulationId, plantId, rawMatrialId, (res) => {
                        setCommonStateForList(res)
                    }))
                    break;
                case Number(OPERATIONS):
                    dispatch(getCostingSurfaceTreatmentSimulationList(simulationId, plantId, rawMatrialId, (res) => {
                        setCommonStateForList(res)
                    }))
                    break;
                case Number(BOPDOMESTIC):
                case Number(BOPIMPORT):
                    dispatch(getCostingBoughtOutPartSimulationList(simulationId, (res) => {
                        setCommonStateForList(res)
                    }))
                    break;
                case Number(EXCHNAGERATE):
                    dispatch(getExchangeCostingSimulationList(simulationId, (res) => {
                        setCommonStateForList(res)
                    }))
                    break;
                case Number(MACHINERATE):
                    dispatch(getMachineRateCostingSimulationList(simulationId, (res) => {
                        setCommonStateForList(res)
                    }))
                    break;

                default:
                    break;
            }
        }
    }

    useEffect(() => {
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
            CostingNumber: data.CostingNumber, PlantCode: data.PlantCode, OldPOPrice: data.OldPOPrice, NewPOPrice: data.NewPOPrice, OldRMPrice: data.OldNetRawMaterialsCost, NewRMPrice: data.NewNetRawMaterialsCost, CostingHead: data.CostingHead, OldNetSurfaceTreatmentCost: data.OldNetSurfaceTreatmentCost, NewNetSurfaceTreatmentCost: data.NewNetSurfaceTreatmentCost, OldOperationCost: data.OldNetOperationCost, NewOperationCost: data.NewNetOperationCost, OldBOPCost: data.OldNetBoughtOutPartCost, NewBOPCost: data.NewNetBoughtOutPartCost, OldExchangeRate: data.OldExchangeRate, NewExchangeRate: data.NewExchangeRate, OldNetPOPriceOtherCurrency: data.OldNetPOPriceOtherCurrency, NewNetPOPriceOtherCurrency: data.NewNetPOPriceOtherCurrency, OldMachineRate: data.OldMachineRate, NewMachineRate: data.NewMachineRate,
        })
        dispatch(getComparisionSimulationData(obj, res => {
            const Data = res.data.Data
            const obj1 = formViewData(Data.OldCosting)
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
                <button className="View" title='View' type={'button'} onClick={() => { viewCosting(cell, row, props?.rowIndex) }} />
                {row?.IsAssemblyExist && <button title='Assembly Impact' className="hirarchy-btn" type={'button'} onClick={() => { viewAssembly(cell, row, props?.rowIndex) }}> </button>}

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
                document.getElementsByClassName('custom-toaster')[0].classList.add('custom-class')
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

    /**
    * @method setGridSelection
    * @description SET REJECTED DATA FOR API RESPONSE
    */
    const setGridSelection = (isSelected, clickedElement) => {
        var selectedRows = gridApi.getSelectedRows();
        let sendInAPI = sendInAPIState ? sendInAPIState : []

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
        return cell !== null ? cell : '-'
    }

    const revisionFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell !== null ? cell : '-'
    }

    const oldPOFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewPOPrice > row.OldPOPrice) ? 'red-value form-control' : (row.NewPOPrice < row.OldPOPrice) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newPOFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewPOPrice > row.OldPOPrice) ? 'red-value form-control' : (row.NewPOPrice < row.OldPOPrice) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const oldRMFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewRMPrice > row.OldRMPrice) ? 'red-value form-control' : (row.NewRMPrice < row.OldRMPrice) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newRMFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewRMPrice > row.OldRMPrice) ? 'red-value form-control' : (row.NewRMPrice < row.OldRMPrice) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const overheadFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewOverheadCost > row.OldOverheadCost) ? 'red-value form-control' : (row.NewOverheadCost < row.OldOverheadCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const profitFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewProfitCost > row.OldProfitCost) ? 'red-value form-control' : (row.NewProfitCost < row.OldProfitCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const rejectionFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewRejectionCost > row.OldRejectionCost) ? 'red-value form-control' : (row.NewRejectionCost < row.OldRejectionCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const costICCFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewICCCost > row.OldICCCost) ? 'red-value form-control' : (row.NewICCCost < row.OldICCCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const paymentTermFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewPaymentTermsCost > row.OldPaymentTermsCost) ? 'red-value form-control' : (row.NewPaymentTermsCost < row.OldPaymentTermsCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const otherCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewOtherCost > row.OldOtherCost) ? 'red-value form-control' : (row.NewOtherCost < row.OldOtherCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const discountCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewDiscountCost > row.OldDiscountCost) ? 'red-value form-control' : (row.NewDiscountCost < row.OldDiscountCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const toolCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewNetToolCost > row.OldNetToolCost) ? 'red-value form-control' : (row.NewNetToolCost < row.OldNetToolCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const freightCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewNetFreightCost > row.OldNetFreightCost) ? 'red-value form-control' : (row.NewNetFreightCost < row.OldNetFreightCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const packagingCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewNetPackagingCost > row.OldNetPackagingCost) ? 'red-value form-control' : (row.NewNetPackagingCost < row.OldNetPackagingCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const freightPackagingCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewNetFreightPackagingCost > row.OldNetFreightPackagingCost) ? 'red-value form-control' : (row.NewNetFreightPackagingCost < row.OldNetFreightPackagingCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const netOverheadAndProfitFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewNetOverheadAndProfitCost > row.OldNetOverheadAndProfitCost) ? 'red-value form-control' : (row.NewNetOverheadAndProfitCost < row.OldNetOverheadAndProfitCost) ? 'green-value form-control' : 'form-class'
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
        const classGreen = (row.NewNetRawMaterialsCost > row.OldNetRawMaterialsCost) ? 'red-value form-control' : (row.NewNetRawMaterialsCost < row.OldNetRawMaterialsCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const newRMCFormatter = (props) => {
        // const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // const sumold = oldRMCalc(row)
        // const sumnew = newRMCalc(row)
        // const classGreen = (sumnew > sumold) ? 'red-value form-control' : (row.NewPOPrice < row.OldPOPrice) ? 'green-value form-control' : 'form-class'
        // return <span className={classGreen}>{checkForDecimalAndNull(sumnew, getConfigurationKey().NoOfDecimalForPrice)}</span>
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewNetRawMaterialsCost > row.OldNetRawMaterialsCost) ? 'red-value form-control' : (row.NewNetRawMaterialsCost < row.OldNetRawMaterialsCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''

    }
    const oldOPERFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewOperationCost > row.OldOperationCost) ? 'red-value form-control' : (row.NewOperationCost < row.OldOperationCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newOPERFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewOperationCost > row.OldOperationCost) ? 'red-value form-control' : (row.NewOperationCost < row.OldOperationCost) ? 'green-value form-control' : 'form-class'
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
        const temp = row.IsMultiBoughtOutPart === true ? 'Multiple BOP' : cell
        return cell != null ? temp : '-';
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

        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // const classGreen = (row.NewNetRawMaterialsCost > row.OldNetRawMaterialsCost) ? 'red-value form-control' : (row.NewNetRawMaterialsCost < row.OldNetRawMaterialsCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? checkForDecimalAndNull(row.RMVariance, getConfigurationKey().NoOfDecimalForPrice) : ''

    }
    const variancePOFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return cell != null ? checkForDecimalAndNull(row.Variance, getConfigurationKey().NoOfDecimalForPrice) : ''
    }

    const decimalFormatter = (props) => {
        const cell = props?.value;
        return cell != null ? checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice) : ''
    }

    const varianceSTFormatter = (props) => {
        // const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // const sumold = oldRMCalc(row)
        // const sumnew = newRMCalc(row)
        // const diff = (sumold - sumnew).toFixed(getConfigurationKey().NoOfDecimalForPrice)
        // return checkForDecimalAndNull(diff)

        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // const classGreen = (row.NewNetRawMaterialsCost > row.OldNetRawMaterialsCost) ? 'red-value form-control' : (row.NewNetRawMaterialsCost < row.OldNetRawMaterialsCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? checkForDecimalAndNull(row.NetSurfaceTreatmentCostVariance, getConfigurationKey().NoOfDecimalForPrice) : ''

    }

    const ERVarianceFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)
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
        return `${props.value}(${props.data.PlantCode})`
    }

    const impactPerQuarterFormatter = (props) => {
        const cell = props?.value;
        return cell != null ? checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice) : '-'
    }

    const machineRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewMachineRate > row.OldMachineRate) ? 'red-value form-control' : (row.NewMachineRate < row.OldMachineRate) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const processCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewNetProcessCost > row.OldNetProcessCost) ? 'red-value form-control' : (row.NewNetProcessCost < row.OldNetProcessCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const hideColumn = (props) => {

        costingList && costingList.map((item, i) => {
            if (costingList[i].NewOverheadCost !== 0 || costingList[i].OldOverheadCost !== costingList[i].NewOverheadCost) {
                setHideDataColumn(prevState => ({ ...prevState, hideOverhead: false }))
            }

            if (costingList[i].NewProfitCost !== 0 || costingList[i].OldProfitCost !== costingList[i].NewProfitCost) {
                setHideDataColumn(prevState => ({ ...prevState, hideProfit: false }))
            }

            if (costingList[i].NewRejectionCost !== 0 || costingList[i].OldRejectionCost !== costingList[i].NewRejectionCost) {
                setHideDataColumn(prevState => ({ ...prevState, hideRejection: false }))
            }

            if (costingList[i].NewICCCost !== 0 || costingList[i].OldICCCost !== costingList[i].NewICCCost) {
                setHideDataColumn(prevState => ({ ...prevState, hideICC: false }))
            }
            if (costingList[i].NewPaymentTermsCost !== 0 || costingList[i].OldPaymentTermsCost !== costingList[i].NewPaymentTermsCost) {
                setHideDataColumn(prevState => ({ ...prevState, hidePayment: false }))
            }

            if (costingList[i].NewOtherCost !== 0 || costingList[i].OldOtherCost !== costingList[i].NewOtherCost) {
                setHideDataColumn(prevState => ({ ...prevState, hideOtherCost: false }))
            }

            if (costingList[i].NewDiscountCost !== 0 || costingList[i].OldDiscountCost !== costingList[i].NewDiscountCost) {
                setHideDataColumn(prevState => ({ ...prevState, hideDiscount: false }))
            }

            if (costingList[i].NewNetOverheadAndProfitCost !== 0 || costingList[i].OldNetOverheadAndProfitCost !== costingList[i].NewNetOverheadAndProfitCost) {
                setHideDataColumn(prevState => ({ ...prevState, hideOveheadAndProfit: false }))
            }

            if (costingList[i].NewNetToolCost !== 0 || costingList[i].OldNetToolCost !== costingList[i].NewNetToolCost) {
                setHideDataColumn(prevState => ({ ...prevState, hideToolCost: false }))
            }

            if (costingList[i].NewNetFreightCost !== 0 || costingList[i].OldNetFreightCost !== costingList[i].NewNetFreightCost) {

                setHideDataColumn(prevState => ({ ...prevState, hideFrieghtCost: false }))
            }

            if (costingList[i].NewNetPackagingCost !== 0 || costingList[i].OldNetPackagingCost !== costingList[i].NewNetPackagingCost) {
                setHideDataColumn(prevState => ({ ...prevState, hidePackagingCost: false }))
            }

            if (costingList[i].NewNetFreightPackagingCost !== 0 || costingList[i].OldNetFreightPackagingCost !== costingList[i].NewNetFreightPackagingCost) {
                setHideDataColumn(prevState => ({ ...prevState, hideFreightPackagingCost: false }))
            }

        })

        setShowBOPColumn(costingSimulationListAllKeys?.IsBoughtOutPartSimulation === true ? true : false)
        setShowSurfaceTreatmentColumn(costingSimulationListAllKeys?.IsSurfaceTreatmentSimulation === true ? true : false)
        setShowOperationColumn(costingSimulationListAllKeys?.IsOperationSimulation === true ? true : false)
        setShowRMColumn(costingSimulationListAllKeys?.IsRawMaterialSimulation === true ? true : false)
        setShowExchangeRateColumn(costingSimulationListAllKeys?.IsExchangeRateSimulation === true ? true : false)
        setShowMachineRateColumn(costingSimulationListAllKeys?.IsMachineProcessSimulation === true ? true : false)
        setIsMultipleMasterSimulation(costingSimulationListAllKeys?.IsBoughtOutPartSimulation === true ||
            costingSimulationListAllKeys?.IsCombinedProcessSimulation === true || costingSimulationListAllKeys?.IsExchangeRateSimulation === true ||
            costingSimulationListAllKeys?.IsRawMaterialSimulation === true || costingSimulationListAllKeys?.IsOperationSimulation === true ||
            costingSimulationListAllKeys?.IsSurfaceTreatmentSimulation === true || costingSimulationListAllKeys?.IsBoughtOutPartSimulation === true ||
            costingSimulationListAllKeys?.IsMachineProcessSimulation === true)



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
        let temp = []
        temp = SimulationUtils(TempData)    // common function 
        return (
            <ExcelSheet data={temp} name={'Costing'}>
                {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
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
        let finalGrid = [], isTokenAPI = false
        if (showBOPColumn === true || showRMColumn === true || showOperationColumn === true || showSurfaceTreatmentColumn === true ||
            showExchangeRateColumn === true || showMachineRateColumn === true) {
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
            finalGrid = [...InitialGridForToken, ...finalGrid, ...LastGridForToken]
        }

        if (isMultiTechnology) {
            return returnExcelColumn(CostingSimulationDownloadAssemblyTechnology, selectedRowData?.length > 0 ? arrayOFCorrectObjIndividual : downloadList && downloadList?.length > 0 ? downloadList : [])
        } else {
            switch (Number(master)) {
                case Number(RMDOMESTIC):
                case Number(RMIMPORT):
                    return returnExcelColumn(isTokenAPI ? finalGrid : CostingSimulationDownloadRM, selectedRowData?.length > 0 ? arrayOFCorrectObjIndividual : downloadList && downloadList?.length > 0 ? downloadList : [])
                case Number(SURFACETREATMENT):
                    return returnExcelColumn(isTokenAPI ? finalGrid : CostingSimulationDownloadST, selectedRowData?.length > 0 ? arrayOFCorrectObjIndividual : downloadList && downloadList?.length > 0 ? downloadList : [])
                case Number(OPERATIONS):
                    return returnExcelColumn(isTokenAPI ? finalGrid : CostingSimulationDownloadOperation, selectedRowData?.length > 0 ? arrayOFCorrectObjIndividual : downloadList && downloadList?.length > 0 ? downloadList : [])
                case Number(BOPDOMESTIC):
                case Number(BOPIMPORT):
                    return returnExcelColumn(isTokenAPI ? finalGrid : CostingSimulationDownloadBOP, selectedRowData?.length > 0 ? arrayOFCorrectObjIndividual : downloadList && downloadList?.length > 0 ? downloadList : [])
                case Number(EXCHNAGERATE):
                    return returnExcelColumn(isTokenAPI ? finalGrid : EXCHANGESIMULATIONDOWNLOAD, selectedRowData.length > 0 ? selectedRowData : downloadList && downloadList.length > 0 ? downloadList : [])
                case Number(MACHINERATE):
                    return returnExcelColumn(isTokenAPI ? finalGrid : CostingSimulationDownloadMR, selectedRowData.length > 0 ? selectedRowData : downloadList && downloadList.length > 0 ? downloadList : [])
                default:
                    return 'foo'
            }
        }
    }

    useEffect(() => {
        if (userDetails().Role === 'SuperAdmin') {
            setDisableApprovalButton(true)
        }
    }, [])

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
        var allColumnIds = [];
        params.columnApi.getAllColumns().forEach(function (column) {
            allColumnIds.push(column.colId);
        });

        window.screen.width >= 1921 && gridRef.current.api.sizeColumnsToFit();

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
        window.screen.width >= 1921 && gridRef.current.api.sizeColumnsToFit();
    }
    const errorBoxClass = () => {
        let temp
        temp = (status === '' || status === null || status === undefined) ? 'd-none' : ''
        return temp
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
        netBOPPartCostFormatter: netBOPPartCostFormatter,
        operVarianceFormatter: operVarianceFormatter,
        BOPVarianceFormatter: BOPVarianceFormatter,
        plantFormatter: plantFormatter,
        impactPerQuarterFormatter: impactPerQuarterFormatter,
        hyphenFormatter: hyphenFormatter,
        machineRateFormatter: machineRateFormatter,
        processCostFormatter: processCostFormatter
    };

    const isRowSelectable = rowNode => statusForLinkedToken === true ? false : true;
    return (
        <>
            {
                false ? <LoaderCustom customClass={`center-loader`} /> :

                    !showApprovalHistory &&

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
                                                    <button title="Download" type="button" className={'user-btn mr5'} ><div className="download mr-0"></div></button>}>
                                                    {renderColumn()}
                                                    {returnExcelColumnSecond()}
                                                    {returnExcelColumnImpactedMaster()}

                                                </ExcelFile> :
                                                <ExcelFile filename={'Costing'} fileExtension={'.xls'} element={
                                                    <button title="Download" type="button" className={'user-btn mr5'} ><div className="download mr-0"></div></button>}>
                                                    {renderColumn()}
                                                    {returnExcelColumnSecond()}
                                                </ExcelFile>

                                            }
                                            <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                                                <div className="refresh mr-0"></div>
                                            </button>
                                        </div>
                                    </Col>

                                </Row>
                                <Row>
                                    <Col>
                                        <div className={`ag-grid-wrapper ${tableData && tableData?.length <= 0 ? "overlay-contain" : ""}`}>
                                            <div className="ag-grid-header">
                                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                                            </div>
                                            <div
                                                className="ag-theme-material"
                                            >
                                                <AgGridReact
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
                                                >
                                                    {/* <AgGridColumn width={150} field="CostingNumber" headerName='Costing ID'></AgGridColumn>
                                                    <AgGridColumn width={110} field="PartNo" headerName='Part No.'></AgGridColumn>
                                                    <AgGridColumn width={120} field="PartName" headerName='Part Name' cellRenderer='descriptionFormatter'></AgGridColumn>
                                                    <AgGridColumn width={110} field="ECNNumber" headerName='ECN No.' cellRenderer='ecnFormatter'></AgGridColumn>
                                                    <AgGridColumn width={130} field="RevisionNumber" headerName='Revision No.' cellRenderer='revisionFormatter'></AgGridColumn>
                                                    <AgGridColumn width={140} field="VendorName" cellRenderer='vendorFormatter' headerName='Vendor'></AgGridColumn> */}

                                                    <AgGridColumn width={150} field="CostingNumber" headerName='Costing ID'></AgGridColumn>
                                                    <AgGridColumn width={140} field="CostingHead" headerName='Costing Head'></AgGridColumn>
                                                    <AgGridColumn width={140} field="VendorName" headerName='Vendor(Code)'></AgGridColumn>
                                                    <AgGridColumn width={120} field="PlantName" cellRenderer='plantFormatter' headerName='Plant (Code)'></AgGridColumn>
                                                    <AgGridColumn width={110} field="PartNo" headerName='Part No.'></AgGridColumn>
                                                    <AgGridColumn width={120} field="PartName" headerName='Part Name' cellRenderer='descriptionFormatter'></AgGridColumn>
                                                    <AgGridColumn width={130} field="Technology" headerName='Technology'></AgGridColumn>
                                                    <AgGridColumn width={110} field="ECNNumber" headerName='ECN No.' cellRenderer='ecnFormatter'></AgGridColumn>
                                                    <AgGridColumn width={130} field="RevisionNumber" headerName='Revision No.' cellRenderer='revisionFormatter'></AgGridColumn>


                                                    {(isRMDomesticOrRMImport || showRMColumn) && <AgGridColumn width={110} field="RMName" hide ></AgGridColumn>}
                                                    {(isRMDomesticOrRMImport || showRMColumn) && <AgGridColumn width={120} field="RMGrade" hide ></AgGridColumn>}
                                                    {(isRMDomesticOrRMImport || showRMColumn) && <AgGridColumn field="RawMaterialFinishWeight" hide headerName='Finish Weight'></AgGridColumn>}
                                                    {(isRMDomesticOrRMImport || showRMColumn) && <AgGridColumn field="RawMaterialGrossWeight" hide headerName='Gross Weight'></AgGridColumn>}


                                                    {!(isExchangeRate || showExchangeRateColumn) && <AgGridColumn width={140} field="OldPOPrice" headerName='Old PO Price' cellRenderer='oldPOFormatter'></AgGridColumn>}
                                                    {!(isExchangeRate || showExchangeRateColumn) && <AgGridColumn width={140} field="NewPOPrice" headerName='New PO Price' cellRenderer='newPOFormatter'></AgGridColumn>}
                                                    {!(isExchangeRate || showExchangeRateColumn) && <AgGridColumn width={140} field="Variance" headerName=' PO Variance' cellRenderer='variancePOFormatter' ></AgGridColumn>}


                                                    {(isRMDomesticOrRMImport || showRMColumn) && <AgGridColumn width={140} field="OldNetRawMaterialsCost" headerName='Old RM Cost/Pc' cellRenderer='oldRMCFormatter'></AgGridColumn>}
                                                    {(isRMDomesticOrRMImport || showRMColumn) && <AgGridColumn width={140} field="NewNetRawMaterialsCost" headerName='New RM Cost/Pc' cellRenderer='newRMCFormatter'></AgGridColumn>}
                                                    {(isRMDomesticOrRMImport || showRMColumn) && <AgGridColumn width={140} field="RMVariance" headerName='RM Variance' cellRenderer='varianceRMCFormatter' ></AgGridColumn>}
                                                    {(isRMDomesticOrRMImport || showRMColumn) && <AgGridColumn width={140} field="OldScrapRate" hide></AgGridColumn>}
                                                    {(isRMDomesticOrRMImport || showRMColumn) && <AgGridColumn width={140} field="NewScrapRate" hide></AgGridColumn>}


                                                    {((isSurfaceTreatment || showSurfaceTreatmentColumn) && !isMultipleMasterSimulation) && <AgGridColumn width={140} field="SurfaceArea" headerName='Surface Area' cellRenderer='operSTFormatter' ></AgGridColumn>}
                                                    {(isSurfaceTreatment || showSurfaceTreatmentColumn) && <AgGridColumn width={140} field="OldSurfaceTreatmentRate" headerName='Old ST Rate' cellRenderer="operSTFormatter"></AgGridColumn>}
                                                    {(isSurfaceTreatment || showSurfaceTreatmentColumn) && <AgGridColumn width={140} field="NewSurfaceTreatmentRate" headerName='New ST Rate' cellRenderer="operSTFormatter"></AgGridColumn>}
                                                    {(isSurfaceTreatment || showSurfaceTreatmentColumn) && <AgGridColumn width={140} field="OldSurfaceTreatmentCost" headerName='Old Surface Treatment Cost' cellRenderer="oldSTFormatter"></AgGridColumn>}
                                                    {(isSurfaceTreatment || showSurfaceTreatmentColumn) && <AgGridColumn width={140} field="NewSurfaceTreatmentCost" headerName='New Surface Treatment Cost' cellRenderer="newSTFormatter"></AgGridColumn>}
                                                    {(isSurfaceTreatment || showSurfaceTreatmentColumn) && <AgGridColumn width={140} field="OldTranspotationCost" headerName='Old Extra Cost' ></AgGridColumn>}
                                                    {(isSurfaceTreatment || showSurfaceTreatmentColumn) && <AgGridColumn width={140} field="NewTranspotationCost" headerName='New Extra Cost' ></AgGridColumn>}
                                                    {(isSurfaceTreatment || showSurfaceTreatmentColumn) && <AgGridColumn width={140} field="OldNetSurfaceTreatmentCost" headerName='Old Net ST Cost' cellRenderer="oldNetSTFormatter"></AgGridColumn>}
                                                    {(isSurfaceTreatment || showSurfaceTreatmentColumn) && <AgGridColumn width={140} field="NewNetSurfaceTreatmentCost" headerName='New Net ST Cost' cellRenderer="newNetSTFormatter"></AgGridColumn>}
                                                    {(isSurfaceTreatment || showSurfaceTreatmentColumn) && <AgGridColumn width={140} field="NetSurfaceTreatmentCostVariance" headerName='ST Variance' cellRenderer='varianceSTFormatter' ></AgGridColumn>}


                                                    {((isOperation || showOperationColumn) && !isMultipleMasterSimulation) && <AgGridColumn width={140} field="Quantity" headerName='Quantity' cellRenderer='operQuantityFormatter'  ></AgGridColumn>}
                                                    {(isOperation || showOperationColumn) && <AgGridColumn width={140} field="OldOperationRate" headerName='Old Oper Rate' cellRenderer="operQuantityFormatter" ></AgGridColumn>}
                                                    {(isOperation || showOperationColumn) && <AgGridColumn width={140} field="NewOperationRate" headerName='New Oper Rate' cellRenderer="operQuantityFormatter"></AgGridColumn>}
                                                    {(isOperation || showOperationColumn) && <AgGridColumn width={140} field="OldNetOperationCost" headerName='Old Net Oper Cost' cellRenderer="oldOPERFormatter" ></AgGridColumn>}
                                                    {(isOperation || showOperationColumn) && <AgGridColumn width={140} field="NewNetOperationCost" headerName='New Net Oper Cost' cellRenderer="newOPERFormatter"></AgGridColumn>}
                                                    {(isOperation || showOperationColumn) && <AgGridColumn width={140} field="OperationCostVariance" headerName='Oper Variance' cellRenderer="operVarianceFormatter" ></AgGridColumn>}


                                                    {((isBOPDomesticOrImport || showBOPColumn) && !isMultipleMasterSimulation) && <AgGridColumn width={140} field="BoughtOutPartQuantity" headerName='BOP Quantity' cellRenderer='BOPQuantityFormatter' ></AgGridColumn>}
                                                    {((isBOPDomesticOrImport || showBOPColumn) && !isMultipleMasterSimulation) && <AgGridColumn width={140} field="OldBOPRate" headerName='Old BOP Rate' cellRenderer={BOPQuantityFormatter} ></AgGridColumn>}
                                                    {((isBOPDomesticOrImport || showBOPColumn) && !isMultipleMasterSimulation) && <AgGridColumn width={140} field="NewBOPRate" headerName='New BOP Rate' cellRenderer={BOPQuantityFormatter} ></AgGridColumn>}
                                                    {(isBOPDomesticOrImport || showBOPColumn) && <AgGridColumn width={140} field="OldNetBoughtOutPartCost" headerName='Old Net BOP Cost' cellRenderer='netBOPPartCostFormatter' ></AgGridColumn>}
                                                    {(isBOPDomesticOrImport || showBOPColumn) && <AgGridColumn width={140} field="NewNetBoughtOutPartCost" headerName='New Net BOP Cost' cellRenderer='netBOPPartCostFormatter'></AgGridColumn>}
                                                    {(isBOPDomesticOrImport || showBOPColumn) && <AgGridColumn width={140} field="NetBoughtOutPartCostVariance" headerName='BOP Variance' cellRenderer='BOPVarianceFormatter' ></AgGridColumn>}


                                                    {((isMachineRate || showMachineRateColumn) && !isMultipleMasterSimulation) && <AgGridColumn width={140} field="OldMachineRate" headerName='Old Machine Rate' cellRenderer='machineRateFormatter'></AgGridColumn>}
                                                    {((isMachineRate || showMachineRateColumn) && !isMultipleMasterSimulation) && <AgGridColumn width={140} field="NewMachineRate" headerName='New Machine Rate' cellRenderer='machineRateFormatter' ></AgGridColumn>}
                                                    {((isMachineRate || showMachineRateColumn) && !isMultipleMasterSimulation) && <AgGridColumn width={140} field="MRVariance" headerName='MR Variance' cellRenderer='hyphenFormatter' ></AgGridColumn>}
                                                    {(isMachineRate || showMachineRateColumn) && <AgGridColumn width={140} field="OldNetProcessCost" headerName='Old Net Process Cost' cellRenderer='processCostFormatter' ></AgGridColumn>}
                                                    {(isMachineRate || showMachineRateColumn) && <AgGridColumn width={140} field="NewNetProcessCost" headerName='New Net Process Cost' cellRenderer='processCostFormatter'></AgGridColumn>}
                                                    {(isMachineRate || showMachineRateColumn) && <AgGridColumn width={140} field="NetProcessCostVariance" headerName='Net Process Cost Variance' cellRenderer='hyphenFormatter' ></AgGridColumn>}


                                                    {(isExchangeRate || showExchangeRateColumn) && <AgGridColumn width={130} field="Currency" headerName='Currency' cellRenderer='revisionFormatter'></AgGridColumn>}
                                                    {(isExchangeRate || showExchangeRateColumn) && <AgGridColumn width={140} field="OldPOPrice" headerName='PO Price' cellRenderer='oldPOFormatter'></AgGridColumn>}


                                                    {/* <AgGridColumn width={140} field="NewPOPrice" headerName='PO Price New' cellRenderer='newPOFormatter'></AgGridColumn> */}


                                                    {(isExchangeRate || showExchangeRateColumn) && <AgGridColumn width={220} field="OldNetPOPriceOtherCurrency" headerName='PO Price Old(in Currency)' cellRenderer='oldPOCurrencyFormatter'></AgGridColumn>}
                                                    {(isExchangeRate || showExchangeRateColumn) && <AgGridColumn width={220} field="NewNetPOPriceOtherCurrency" headerName='PO Price New (in Currency)' cellRenderer='newPOCurrencyFormatter'></AgGridColumn>}
                                                    {(isExchangeRate || showExchangeRateColumn) && <AgGridColumn width={170} field="POVariance" headerName='PO Variance' cellRenderer={decimalFormatter}></AgGridColumn>}
                                                    {(isExchangeRate || showExchangeRateColumn) && <AgGridColumn width={170} field="OldExchangeRate" headerName='Old Exchange Rate' cellRenderer='oldExchangeFormatter'></AgGridColumn>}
                                                    {(isExchangeRate || showExchangeRateColumn) && <AgGridColumn width={170} field="NewExchangeRate" headerName='New Exchange Rate' cellRenderer='newExchangeFormatter'></AgGridColumn>}
                                                    {(isExchangeRate || showExchangeRateColumn) && <AgGridColumn width={140} field="ERVariance" headerName='Variance' cellRenderer='ERVarianceFormatter'></AgGridColumn>}

                                                    {isMultiTechnology && <AgGridColumn width={140} field="OldNetChildPartsCostWithQuantity" headerName='Old Net Child Parts Cost With Quantity' ></AgGridColumn>}
                                                    {isMultiTechnology && <AgGridColumn width={140} field="NewNetChildPartsCostWithQuantity" headerName='New Net Child Parts Cost With Quantity' ></AgGridColumn>}
                                                    {isMultiTechnology && <AgGridColumn width={140} field="Variance" headerName='Variance' ></AgGridColumn>}
                                                    {isMultiTechnology && <AgGridColumn width={140} field="OldNetBoughtOutPartCost" headerName='Old Net BOP Cost' cellRenderer='netBOPPartCostFormatter' ></AgGridColumn>}
                                                    {isMultiTechnology && <AgGridColumn width={140} field="NewNetBoughtOutPartCost" headerName='New Net BOP Cost' cellRenderer='netBOPPartCostFormatter'></AgGridColumn>}
                                                    {isMultiTechnology && <AgGridColumn width={140} field="NetBoughtOutPartCostVariance" headerName='BOP Variance' cellRenderer='BOPVarianceFormatter' ></AgGridColumn>}

                                                    <AgGridColumn width={140} field="ImpactPerQuarter" headerName='Impact for Quarter(INR)' cellRenderer='impactPerQuarterFormatter'></AgGridColumn>
                                                    <AgGridColumn width={140} field="BudgetedPriceImpactPerQuarter" headerName='Budgeted Price Impact/Quarter' cellRenderer='impactPerQuarterFormatter'></AgGridColumn>
                                                    <AgGridColumn width={140} field="BudgetedPriceVariance" headerName='Budgeted Price Variance' cellRenderer='impactPerQuarterFormatter'></AgGridColumn>
                                                    <AgGridColumn width={140} field="BudgetedPrice" headerName='Budgeted Price' cellRenderer='impactPerQuarterFormatter'></AgGridColumn>

                                                    {!(isExchangeRate) && <AgGridColumn width={140} field="OldOverheadCost" hide={hideDataColumn.hideOverhead} cellRenderer='overheadFormatter' headerName='Old Overhead'></AgGridColumn>}
                                                    {!(isExchangeRate) && <AgGridColumn width={140} field="NewOverheadCost" hide={hideDataColumn.hideOverhead} cellRenderer='overheadFormatter' headerName='New Overhead'></AgGridColumn>}
                                                    {!(isExchangeRate) && <AgGridColumn width={140} field="OldProfitCost" hide={hideDataColumn.hideProfit} cellRenderer='profitFormatter' headerName='Old Profit'></AgGridColumn>}
                                                    {!(isExchangeRate) && <AgGridColumn width={140} field="NewProfitCost" hide={hideDataColumn.hideProfit} cellRenderer='profitFormatter' headerName='New Profit'></AgGridColumn>}
                                                    {!(isExchangeRate) && <AgGridColumn width={140} field="OldRejectionCost" hide={hideDataColumn.hideRejection} cellRenderer='rejectionFormatter' headerName='Old Rejection'></AgGridColumn>}
                                                    {!(isExchangeRate) && <AgGridColumn width={140} field="NewRejectionCost" hide={hideDataColumn.hideRejection} cellRenderer='rejectionFormatter' headerName='New Rejection'></AgGridColumn>}
                                                    {!(isExchangeRate) && <AgGridColumn width={140} field="OldICCCost" hide={hideDataColumn.hideICC} cellRenderer='costICCFormatter' headerName='Old ICC'></AgGridColumn>}
                                                    {!(isExchangeRate) && <AgGridColumn width={140} field="NewICCCost" hide={hideDataColumn.hideICC} cellRenderer='costICCFormatter' headerName='New ICC'></AgGridColumn>}
                                                    {!(isExchangeRate) && <AgGridColumn width={140} field="OldPaymentTermsCost" hide={hideDataColumn.hidePayment} cellRenderer='paymentTermFormatter' headerName='Old Payment Terms'></AgGridColumn>}
                                                    {!(isExchangeRate) && <AgGridColumn width={140} field="NewPaymentTermsCost" hide={hideDataColumn.hidePayment} cellRenderer='paymentTermFormatter' headerName='New Payment Terms'></AgGridColumn>}
                                                    {!(isExchangeRate) && <AgGridColumn width={140} field="OldOtherCost" hide={hideDataColumn.hideOtherCost} cellRenderer='otherCostFormatter' headerName='Old Other Cost'></AgGridColumn>}
                                                    {!(isExchangeRate) && <AgGridColumn width={140} field="NewOtherCost" hide={hideDataColumn.hideOtherCost} cellRenderer='otherCostFormatter' headerName='New Other Cost'></AgGridColumn>}
                                                    {!(isExchangeRate) && <AgGridColumn width={140} field="OldDiscountCost" hide={hideDataColumn.hideDiscount} cellRenderer='discountCostFormatter' headerName='Old Discount'></AgGridColumn>}
                                                    {!(isExchangeRate) && <AgGridColumn width={140} field="NewDiscountCost" hide={hideDataColumn.hideDiscount} cellRenderer='discountCostFormatter' headerName='New Discount'></AgGridColumn>}
                                                    {!(isExchangeRate) && <AgGridColumn width={140} field="NewNetToolCost" hide={hideDataColumn.hideToolCost} cellRenderer='toolCostFormatter' headerName='New Tool Cost'></AgGridColumn>}
                                                    {!(isExchangeRate) && <AgGridColumn width={140} field="OldNetToolCost" hide={hideDataColumn.hideToolCost} cellRenderer='toolCostFormatter' headerName='Old Tool Cost'></AgGridColumn>}
                                                    {!(isExchangeRate) && <AgGridColumn width={140} field="NewNetFreightCost" hide={hideDataColumn.hideFrieghtCost} cellRenderer='freightCostFormatter' headerName='New Freight Cost'></AgGridColumn>}
                                                    {!(isExchangeRate) && <AgGridColumn width={140} field="OldNetFreightCost" hide={hideDataColumn.hideFrieghtCost} cellRenderer='freightCostFormatter' headerName='Old Freight Cost'></AgGridColumn>}
                                                    {!(isExchangeRate) && <AgGridColumn width={140} field="NewNetPackagingCost" hide={hideDataColumn.hidePackagingCost} cellRenderer='packagingCostFormatter' headerName='New Packaging Cost'></AgGridColumn>}
                                                    {!(isExchangeRate) && <AgGridColumn width={140} field="OldNetPackagingCost" hide={hideDataColumn.hidePackagingCost} cellRenderer='packagingCostFormatter' headerName='Old Packaging Cost'></AgGridColumn>}
                                                    {!(isExchangeRate) && <AgGridColumn width={140} field="NewNetFreightPackagingCost" hide={hideDataColumn.hideFreightPackagingCost} cellRenderer='freightPackagingCostFormatter' headerName='New Freight & Packaging Cost'></AgGridColumn>}
                                                    {!(isExchangeRate) && <AgGridColumn width={140} field="OldNetFreightPackagingCost" hide={hideDataColumn.hideFreightPackagingCost} cellRenderer='freightPackagingCostFormatter' headerName='Old Freight & Packaging Cost'></AgGridColumn>}

                                                    <AgGridColumn width={120} field="CostingId" headerName='Actions' type="rightAligned" floatingFilter={false} cellRenderer='buttonFormatter' pinned="right"></AgGridColumn>
                                                </AgGridReact>

                                                {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                            <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer sticky-btn-footer">
                                <div className="col-sm-12 text-right bluefooter-butn">

                                    <button
                                        class="user-btn approval-btn mr5"
                                        onClick={() => { setIsApprovalDrawer(true) }}
                                        disabled={selectedRowData && selectedRowData.length === 0 ? true : disableApproveButton ? true : false}
                                        title="Send For Approval"
                                    >
                                        <div className="send-for-approval"></div>
                                        {'Send For Approval'}
                                    </button>

                                    <button
                                        type="button"
                                        className="user-btn mr5 save-btn"
                                        // disabled={((selectedRowData && selectedRowData.length === 0) || isFromApprovalListing) ? true : false}
                                        onClick={onSaveSimulation}>
                                        <div className={"back-icon"}></div>
                                        {"Go to History"}
                                    </button>

                                    <button className="user-btn mr5 save-btn" onClick={() => { setIsVerifyImpactDrawer(true) }}>
                                        <div className={"save-icon"}></div>
                                        {"Verify Impact"}
                                    </button>

                                </div>
                            </Row>
                        </div>
                        {
                            isApprovalDrawer &&
                            <ApproveRejectDrawer
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
                                master={selectedMasterForSimulation ? selectedMasterForSimulation?.value : master}
                                closeDrawer={closeDrawer}
                                isSimulation={true}
                                apiData={apiData}
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
                                TypeOfCosting={amendmentDetails.SimulationHeadId}

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
                    master={selectedMasterForSimulation ? selectedMasterForSimulation?.value : master}
                    // closeDrawer={closeDrawer}
                    isSimulation={true}
                    simulationDrawer={true}
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
