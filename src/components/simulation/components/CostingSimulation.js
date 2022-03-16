import React, { useState } from 'react';
import { useForm } from 'react-hook-form'
import { Row, Col, } from 'reactstrap';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRawMaterialNameChild } from '../../masters/actions/Material';
import NoContentFound from '../../common/NoContentFound';
import { BOPDOMESTIC, BOPIMPORT, TOFIXEDVALUE, EMPTY_DATA, MACHINERATE, OPERATIONS, RMDOMESTIC, RMIMPORT, SURFACETREATMENT } from '../../../config/constants';
import { getComparisionSimulationData, getCostingBoughtOutPartSimulationList, getCostingSimulationList, getCostingSurfaceTreatmentSimulationList, setShowSimulationPage } from '../actions/Simulation';
import ApproveRejectDrawer from '../../costing/components/approval/ApproveRejectDrawer'
import CostingDetailSimulationDrawer from './CostingDetailSimulationDrawer'
import { checkForDecimalAndNull, checkForNull, formViewData, getConfigurationKey, userDetails } from '../../../helper';
import VerifyImpactDrawer from './VerifyImpactDrawer';
import { EMPTY_GUID, ZBC } from '../../../config/constants';
import Toaster from '../../common/Toaster';
import { Redirect } from 'react-router';
import { getPlantSelectListByType } from '../../../actions/Common';
import { setCostingViewData } from '../../costing/actions/Costing';
import { CostingSimulationDownloadBOP, CostingSimulationDownloadOperation, CostingSimulationDownloadRM, CostingSimulationDownloadST } from '../../../config/masterData'
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import LoaderCustom from '../../common/LoaderCustom';
import { Errorbox } from '../../common/ErrorBox';
import { SimulationUtils } from '../SimulationUtils'
import ViewAssembly from './ViewAssembly';

const gridOptions = {};

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

function CostingSimulation(props) {
    const { simulationId, isFromApprovalListing, master, } = props

    const { formState: getValues, setValue } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })
    const getShowSimulationPage = useSelector((state) => state.simulation.getShowSimulationPage)


    const [selectedRowData, setSelectedRowData] = useState([]);
    const [tokenNo, setTokenNo] = useState('')
    const [CostingDetailDrawer, setCostingDetailDrawer] = useState(false)
    const [isVerifyImpactDrawer, setIsVerifyImpactDrawer] = useState(false)
    const [isApprovalDrawer, setIsApprovalDrawer] = useState(false)
    const [showApprovalHistory, setShowApprovalHistory] = useState(false)
    const [simulationDetail, setSimulationDetail] = useState('')
    const [costingArr, setCostingArr] = useState([])
    const [id, setId] = useState('')
    const [isSaveDone, setSaveDone] = useState(isFromApprovalListing ? isFromApprovalListing : false)
    const [oldArr, setOldArr] = useState([])
    const [material, setMaterial] = useState([])
    const [pricesDetail, setPricesDetail] = useState({})
    const [isView, setIsView] = useState(false)
    const [disableApproveButton, setDisableApprovalButton] = useState(false)
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [rowData, setRowData] = useState(null);
    const [selectedCostingIds, setSelectedCostingIds] = useState();
    const [loader, setLoader] = useState(true)
    const [vendorIdState, setVendorIdState] = useState("")
    const [simulationTypeState, setSimulationTypeState] = useState("")
    const [SimulationTechnologyIdState, setSimulationTechnologyIdState] = useState("")
    const [tableData, setTableData] = useState([])
    const [status, setStatus] = useState('')
    const [hideDataColumn, setHideDataColumn] = useState({
        hideOverhead: false,
        hideProfit: false,
        hideRejection: false,
        hideICC: false,
        hidePayment: false,
        hideOtherCost: false,
        hideDiscount: false,
        hideOveheadAndProfit: false
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

    const isSurfaceTreatment = (Number(master) === Number(SURFACETREATMENT));
    const isOperation = (Number(master) === Number(OPERATIONS));
    const isRMDomesticOrRMImport = ((Number(master) === Number(RMDOMESTIC)) || (Number(master) === Number(RMIMPORT)));
    const isBOPDomesticOrImport = ((Number(master) === Number(BOPDOMESTIC)) || (Number(master) === Number(BOPIMPORT)))
    const isMachineRate = Number(master) === (Number(MACHINERATE));

    const dispatch = useDispatch()

    useEffect(() => {
        getCostingList()
        dispatch(getPlantSelectListByType(ZBC, () => { }))
        dispatch(getRawMaterialNameChild(() => { }))
    }, [])

    useEffect(() => {
        let count = 0
        tableData && tableData.map((item) => {

            if (item.IsAssemblyExist === true) {
                count++
            }
        })
        if (count !== 0) {
            setAssemblyImpactButtonTrue(true)
        } else {
            setAssemblyImpactButtonTrue(false)
        }
    }, [tableData])

    window.onbeforeunload = (e) => {
        dispatch(setShowSimulationPage(true))
    };

    const setCommonStateForList = (res) => {
        if (res.data.Result) {
            const tokenNo = res.data.Data.SimulationTokenNumber
            const Data = res.data.Data
            setStatus(Data.SapMessage)
            var vendorId = Data.VendorId
            var SimulationTechnologyId = Data.SimulationTechnologyId
            var SimulationType = Data.SimulationType
            setVendorIdState(vendorId)
            setSimulationTechnologyIdState(SimulationTechnologyId)
            setSimulationTypeState(SimulationType)

            Data.SimulatedCostingList && Data.SimulatedCostingList.map(item => {
                if (item.IsLockedBySimulation) {
                    setSelectedCostingIds(item.CostingId)
                }
                item.Variance = (item.OldPOPrice - item.NewPOPrice).toFixed(getConfigurationKey().NoOfDecimalForPrice)
                //  ********** ADDED NEW FIELDS FOR ADDING THE OLD AND NEW RM COST / PC BUT NOT GETTING THE AS SUM IN DOWNLOAD **********
                switch (Number(selectedMasterForSimulation.value)) {
                    case Number(RMIMPORT):
                    case Number(RMDOMESTIC):
                        item.RMCVariance = (checkForNull(item.OldRMPrice).toFixed(TOFIXEDVALUE) -
                            checkForNull(item.NewRMPrice).toFixed(TOFIXEDVALUE))
                        return item
                    case Number(SURFACETREATMENT):
                        item.STVariance = (checkForNull(item.OldSurfaceTreatmentCost).toFixed(TOFIXEDVALUE) -
                            checkForNull(item.NewSurfaceTreatmentCost).toFixed(TOFIXEDVALUE))
                        return item
                    case Number(OPERATIONS):
                        item.OperationVariance = (checkForNull(item.OldOperationCost).toFixed(TOFIXEDVALUE) -
                            checkForNull(item.NewOperationCost).toFixed(TOFIXEDVALUE))
                        return item
                    case Number(BOPDOMESTIC):
                    case Number(BOPIMPORT):
                        item.BOPVariance = (checkForNull(item.OldBOPCost).toFixed(TOFIXEDVALUE) -
                            checkForNull(item.NewBOPCost).toFixed(TOFIXEDVALUE))
                        return item
                    default:
                        break;
                }

            })
            let uniqeArray = []
            const map = new Map();
            for (const item of Data.SimulatedCostingList) {
                if (!map.has(item.CostingNumber)) {

                    map.set(item.CostingNumber, true);    // set any value to Map
                    uniqeArray.push(item);
                }
            }
            setTableData(uniqeArray)
            setTokenNo(tokenNo)
            setCostingArr(Data.SimulatedCostingList)
            setSimulationDetail({ TokenNo: Data.SimulationTokenNumber, Status: Data.SimulationStatus, SimulationId: Data.SimulationId, SimulationAppliedOn: Data.SimulationAppliedOn, EffectiveDate: Data.EffectiveDate })
            setLoader(false)
            let tempObj = {}
            tempObj.EffectiveDate = Data.EffectiveDate
            tempObj.CostingHead = Data.SimulatedCostingList[0].CostingHead
            tempObj.SimulationAppliedOn = Data.SimulationAppliedOn
            tempObj.Technology = Data.SimulatedCostingList[0].Technology
            tempObj.Vendor = Data.SimulatedCostingList[0].VendorName
            setAmendmentDetails(tempObj)
        }
    }

    const getCostingList = (plantId = '', rawMatrialId = '') => {
        switch (Number(selectedMasterForSimulation?.value)) {
            case Number(RMDOMESTIC):
            case Number(RMIMPORT):
                dispatch(getCostingSimulationList(simulationId, plantId, rawMatrialId, (res) => {
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

            default:
                break;
        }
    }

    const costingList = useSelector(state => state.simulation.costingSimulationList)
    const costingSimulationListAllKeys = useSelector(state => state.simulation.costingSimulationListAllKeys)

    const selectedMasterForSimulation = useSelector(state => state.simulation.selectedMasterForSimulation)

    useEffect(() => {
        hideColumn()

    }, [costingList])


    const runCostingDetailSimulation = () => {
        setCostingDetailDrawer(true)
    }

    const closeDrawer2 = (e = '', mode) => {
        if (mode === true) {
            setCostingDetailDrawer(false)
        } else {
            setCostingDetailDrawer(false)
        }
    }

    const viewCosting = (id, data, rowIndex) => {
        let obj = {
            simulationApprovalProcessSummaryId: EMPTY_GUID,
            simulationId: simulationId,
            costingId: data.CostingId
        }
        setId(id)
        setPricesDetail({
            CostingNumber: data.CostingNumber, PlantCode: data.PlantCode, OldPOPrice: data.OldPOPrice, NewPOPrice: data.NewPOPrice, OldRMPrice: data.OldNetRawMaterialsCost, NewRMPrice: data.NewNetRawMaterialsCost, CostingHead: data.CostingHead, OldNetSurfaceTreatmentCost: data.OldNetSurfaceTreatmentCost, NewNetSurfaceTreatmentCost: data.NewNetSurfaceTreatmentCost, OldOperationCost: data.OldOperationCost, NewOperationCost: data.NewOperationCost, OldBOPCost: data.OldNetBoughtOutPartCost, NewBOPCost: data.NewNetBoughtOutPartCost
        })
        dispatch(getComparisionSimulationData(obj, res => {
            const Data = res.data.Data
            const obj1 = formViewData(Data.OldCosting)
            dispatch(setCostingViewData(obj1))
            runCostingDetailSimulation()
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
                <button className="View" type={'button'} onClick={() => { viewCosting(cell, row, props?.rowIndex) }} />
                {row?.IsAssemblyExist && <button className="hirarchy-btn" type={'button'} onClick={() => { viewAssembly(cell, row, props?.rowIndex) }}> </button>}

            </>
        )
    }

    const onRowSelect = () => {
        var selectedRows = gridApi.getSelectedRows();
        let temp = []
        let selectedTemp = []
        selectedRows && selectedRows.map(item => {
            if (item.IsLockedBySimulation) {
                temp.push(item.CostingNumber)
                return false
            }
        })

        if (temp.length > 1) {
            setSelectedRowData([])
            Toaster.warning(`Costings ${temp.map(item => item)} is already sent for approval through another token number.`)
            gridApi.deselectAll()
            return false
        } else if (temp.length === 1) {
            Toaster.warning(`This costing is under approval with token number ${selectedRows[0].LockedBySimulationToken ? selectedRows[0].LockedBySimulationToken : '-'} at ${selectedRows[0].LockedBySimulationProcessStep ? selectedRows[0].LockedBySimulationProcessStep : "-"} with ${selectedRows[0].LockedBySimulationStuckInWhichUser ? selectedRows[0].LockedBySimulationStuckInWhichUser : '-'} .`)
            gridApi.deselectAll()
            return false
        } else {
            setSelectedRowData(selectedRows)
        }

    }

    const onSaveSimulation = () => {
        setShowApprovalHistory(true)
    }

    const VerifyImpact = () => {
        setIsVerifyImpactDrawer(true)
    }

    const sendForApproval = () => {
        setIsApprovalDrawer(true)
        if (!isFromApprovalListing) {

            const isChanged = JSON.stringify(oldArr) == JSON.stringify(selectedRowData)
            if (isChanged) {
                setSaveDone(true)
            } else {
                setSaveDone(false)
            }
        }
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

    const vendorFormatter = (cell, row, enumObject, rowIndex) => {
        return cell !== null ? cell : '-'
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
    const netOverheadAndProfitFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewNetOverheadAndProfitCost > row.OldNetOverheadAndProfitCost) ? 'red-value form-control' : (row.NewNetOverheadAndProfitCost < row.OldNetOverheadAndProfitCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const oldRMCalc = (row) => {
        let temparr = costingArr.filter(item1 => item1.CostingId === row.CostingId)
        const sum = temparr.reduce((accumulator, el) => {
            if (temparr.length === 1) {
                return checkForNull(row.OldRMPrice)
            } else {
                if (el.CostingId === row.CostingId) {
                    return checkForNull(accumulator) + checkForNull(el.OldRMPrice)
                }
            }
        }, 0)
        return sum
    }
    const newRMCalc = (row) => {
        let temparr = costingArr.filter(item1 => item1.CostingId === row.CostingId)
        const sum = temparr.reduce((accumulator, el) => {
            if (temparr.length === 1) {
                return checkForNull(row.NewRMPrice)
            } else {
                if (el.CostingId === row.CostingId) {
                    return checkForNull(accumulator) + checkForNull(el.NewRMPrice)
                }
            }
        }, 0)
        return sum
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

    const varianceFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)
    }

    const NewOverheadCostReducer = (array) => {
        const arr = array.reduce((accumulator, currentValue) => {
            return accumulator + checkForNull(currentValue.NewOverheadCost)
        }, 0)
        return arr === 0 ? true : false
    }
    const NewProfitCostReducer = (array, type) => {
        const arr = array.reduce((accumulator, currentValue) => {
            return accumulator + checkForNull(currentValue.NewProfitCost)
        }, 0)
        return arr === 0 ? true : false
    }
    const NewRejectionCost = (array, type) => {
        const arr = array.reduce((accumulator, currentValue) => {
            return accumulator + checkForNull(currentValue.NewRejectionCost)
        }, 0)
        return arr === 0 ? true : false
    }
    const NewICCCostReducer = (array, type) => {
        const arr = array.reduce((accumulator, currentValue) => {
            return accumulator + checkForNull(currentValue.NewICCCost)
        }, 0)
        return arr === 0 ? true : false
    }
    const NewPaymentTermsCostReducer = (array, type) => {
        const arr = array.reduce((accumulator, currentValue) => {
            return accumulator + checkForNull(currentValue.NewPaymentTermsCost)
        }, 0)
        return arr === 0 ? true : false
    }
    const NewOtherCostReducer = (array, type) => {
        const arr = array.reduce((accumulator, currentValue) => {
            return accumulator + checkForNull(currentValue.NewOtherCost)
        }, 0)
        return arr === 0 ? true : false
    }
    const NewDiscountCostReducer = (array, type) => {
        const arr = array.reduce((accumulator, currentValue) => {
            return accumulator + checkForNull(currentValue.NewDiscountCost)
        }, 0)
        return arr === 0 ? true : false
    }
    const NewNetOverheadAndProfitCostReducer = (array, type) => {
        const arr = array.reduce((accumulator, currentValue) => {
            return accumulator + checkForNull(currentValue.NewNetOverheadAndProfitCost)
        }, 0)
        return arr === 0 ? true : false
    }


    const hideColumn = (props) => {
        setHideDataColumn({
            hideOverhead: costingList && costingList.length > 0 && (costingList[0].NewOverheadCost === 0 || costingList[0].OldOverheadCost === costingList[0].NewOverheadCost) ? true : false,
            hideProfit: costingList && costingList.length > 0 && (costingList[0].NewProfitCost === 0 || costingList[0].OldProfitCost === costingList[0].NewProfitCost) ? true : false,
            hideRejection: costingList && costingList.length > 0 && (costingList[0].NewRejectionCost === 0 || costingList[0].OldRejectionCost === costingList[0].NewRejectionCost) ? true : false,
            hideICC: costingList && costingList.length > 0 && (costingList[0].NewICCCost === 0 || costingList[0].OldICCCost === costingList[0].NewICCCost) ? true : false,
            hidePayment: costingList && costingList.length > 0 && (costingList[0].NewPaymentTermsCost === 0 || costingList[0].OldPaymentTermsCost === costingList[0].NewPaymentTermsCost) ? true : false,
            hideOtherCost: costingList && costingList.length > 0 && (costingList[0].NewOtherCost === 0 || costingList[0].OldOtherCost === costingList[0].NewOtherCost) ? true : false,
            hideDiscount: costingList && costingList.length > 0 && (costingList[0].NewDiscountCost === 0 || costingList[0].OldDiscountCost === costingList[0].NewDiscountCost) ? true : false,
            hideOveheadAndProfit: costingList && costingList.length > 0 && (costingList[0].NewNetOverheadAndProfitCost === 0 || costingList[0].OldNetOverheadAndProfitCost === costingList[0].NewNetOverheadAndProfitCost) ? true : false
        })

        setShowBOPColumn(costingSimulationListAllKeys?.IsBoughtOutPartSimulation === true ? true : false)
        setShowSurfaceTreatmentColumn(costingSimulationListAllKeys?.IsSurfaceTreatmentSimulation === true ? true : false)
        setShowOperationColumn(costingSimulationListAllKeys?.IsOperationSimulation === true ? true : false)
        setShowRMColumn(costingSimulationListAllKeys?.IsRawMaterialSimulation === true ? true : false)
        setShowExchangeRateColumn(costingSimulationListAllKeys?.IsExchangeRateSimulation === true ? true : false)
        setShowMachineRateColumn(costingSimulationListAllKeys?.IsMachineRateSimulation === true ? true : false)



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


    const filterList = () => {
        const plant = getValues('plantCode').value
        getCostingList(plant, material.value)
    }
    const resetFilter = () => {
        setValue('plantCode', '')
        setValue('rawMaterial', '')
        setMaterial('')
        getCostingList('', '')
    }

    const handleMaterial = (value) => {
        setMaterial(value)
    }

    useEffect(() => {

    }, [isView])

    const returnExcelColumn = (data = [], TempData) => {


        let temp = []
        temp = SimulationUtils(TempData)    // common function 


        return (<ExcelSheet data={temp} name={'Costing'}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
        </ExcelSheet>);
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
            })
            // ************ CONCAT ALL DATA IN SINGLE ARRAY *********** */
            arrayOFCorrectObjIndividual = arrayOFCorrectObjIndividual.concat(temp);
        })

        switch (Number(master)) {
            case Number(RMDOMESTIC):
            case Number(RMIMPORT):
                return returnExcelColumn(CostingSimulationDownloadRM, selectedRowData?.length > 0 ? arrayOFCorrectObjIndividual : costingList && costingList?.length > 0 ? costingList : [])
            case Number(SURFACETREATMENT):
                return returnExcelColumn(CostingSimulationDownloadST, selectedRowData?.length > 0 ? arrayOFCorrectObjIndividual : costingList && costingList?.length > 0 ? costingList : [])
            case Number(OPERATIONS):
                return returnExcelColumn(CostingSimulationDownloadOperation, selectedRowData?.length > 0 ? arrayOFCorrectObjIndividual : costingList && costingList?.length > 0 ? costingList : [])
            case Number(BOPDOMESTIC):
            case Number(BOPIMPORT):
                return returnExcelColumn(CostingSimulationDownloadBOP, selectedRowData?.length > 0 ? arrayOFCorrectObjIndividual : costingList && costingList?.length > 0 ? costingList : [])
            default:
                return 'foo'
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
        sortable: true,
        headerCheckboxSelection: isFirstColumn,
        checkboxSelection: isFirstColumn
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);

    };

    const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const resetState = () => {
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);
    }
    const errorBoxClass = () => {
        let temp
        temp = status === (null && '') ? 'd-none' : ''
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
        varianceFormatter: varianceFormatter,
        overheadFormatter: overheadFormatter,
        profitFormatter: profitFormatter,
        rejectionFormatter: rejectionFormatter,
        costICCFormatter: costICCFormatter,
        paymentTermFormatter: paymentTermFormatter,
        otherCostFormatter: otherCostFormatter,
        discountCostFormatter: discountCostFormatter,
        netOverheadAndProfitFormatter: netOverheadAndProfitFormatter,
        hideColumn: hideColumn,
        oldRMCFormatter: oldRMCFormatter,
        newRMCFormatter: newRMCFormatter,
        varianceRMCFormatter: varianceRMCFormatter,
        varianceSTFormatter: varianceSTFormatter,
        variancePOFormatter: variancePOFormatter,
        decimalFormatter: decimalFormatter,
    };

    // const isRowSelectable = rowNode => rowNode.data ? selectedCostingIds.length > 0 && !selectedCostingIds.includes(rowNode.data.CostingId) : false;
    return (
        <>
            {
                loader ? <LoaderCustom /> :

                    !showApprovalHistory &&

                    <div className="costing-simulation-page blue-before-inside">
                        <div className="container-fluid">
                            <div className={`ag-grid-react`}>


                                <Row>
                                    <Col sm="12">
                                        <Errorbox customClass={errorBoxClass()} errorText={status} />
                                    </Col>
                                </Row>
                                <Row>
                                    <Col sm="12">
                                        <h1 class="mb-0">Token No:{tokenNo}</h1>
                                    </Col>
                                </Row>
                                <Row className="filter-row-large pt-4 blue-before">

                                    <Col md="3" lg="3" className="search-user-block mb-3">
                                        <div className="d-flex justify-content-end bd-highlight w100">

                                            <ExcelFile filename={'Costing'} fileExtension={'.xls'} element={
                                                <button title="Download" type="button" className={'user-btn mr5'}><div className="download mr-0"></div></button>}>
                                                {renderColumn()}
                                            </ExcelFile>
                                            <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                                                <div className="refresh mr-0"></div>
                                            </button>
                                        </div>
                                    </Col>

                                </Row>
                                <Row>
                                    <Col>
                                        <div className={`ag-grid-wrapper height-width-wrapper ${tableData && tableData?.length <= 0 ? "overlay-contain" : ""}`}>
                                            <div className="ag-grid-header">
                                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                                            </div>
                                            <div
                                                className="ag-theme-material"
                                            >
                                                <AgGridReact
                                                    defaultColDef={defaultColDef}
                                                    floatingFilter={true}
                                                    domLayout='autoHeight'
                                                    floatingFilter={true}
                                                    // columnDefs={c}
                                                    rowData={tableData}
                                                    pagination={true}
                                                    paginationPageSize={10}
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
                                                    // isRowSelectable={isRowSelectable}
                                                    stopEditingWhenCellsLoseFocus={true}
                                                >
                                                    <AgGridColumn width={150} field="CostingNumber" headerName='Costing ID'></AgGridColumn>
                                                    <AgGridColumn width={140} field="CostingHead" headerName='Costing Head'></AgGridColumn>
                                                    <AgGridColumn width={140} field="VendorName" cellRenderer='vendorFormatter' headerName='Vendor(Code)'></AgGridColumn>
                                                    <AgGridColumn width={120} field="PlantCode" headerName='Plant Code'></AgGridColumn>
                                                    <AgGridColumn width={110} field="RMName" hide ></AgGridColumn>
                                                    <AgGridColumn width={120} field="RMGrade" hide ></AgGridColumn>
                                                    <AgGridColumn width={110} field="PartNo" headerName='Part No.'></AgGridColumn>
                                                    <AgGridColumn width={120} field="PartName" headerName='Part Name' cellRenderer='descriptionFormatter'></AgGridColumn>
                                                    <AgGridColumn width={130} field="Technology" headerName='Technology'></AgGridColumn>
                                                    <AgGridColumn width={130} field="RevisionNumber" headerName='Revision No.' cellRenderer='revisionFormatter'></AgGridColumn>
                                                    <AgGridColumn width={140} field="OldPOPrice" headerName='Old PO Price' cellRenderer='oldPOFormatter'></AgGridColumn>
                                                    <AgGridColumn width={140} field="NewPOPrice" headerName='New PO Price' cellRenderer='newPOFormatter'></AgGridColumn>
                                                    <AgGridColumn width={130} field="SANumber" headerName='SA Number' editable={true}></AgGridColumn>
                                                    <AgGridColumn width={130} field="LineNumber" headerName='Line Number' editable={true}></AgGridColumn>
                                                    {(isRMDomesticOrRMImport || showRMColumn) && <>
                                                        {/* <AgGridColumn width={140} field="OldRMCSum" headerName='Old RM Cost/Pc' cellRenderer='oldRMCFormatter'></AgGridColumn>
                                                        <AgGridColumn width={140} field="NewRMCSum" headerName='New RM Cost/Pc' cellRenderer='newRMCFormatter' ></AgGridColumn>
                                                        <AgGridColumn width={140} field="RMVarianceSum" headerName='RM Variance' cellRenderer='varianceRMCFormatter' ></AgGridColumn> */}
                                                        <AgGridColumn width={140} field="OldNetRawMaterialsCost" headerName='Old RM Cost/Pc' cellRenderer='oldRMCFormatter'></AgGridColumn>
                                                        <AgGridColumn width={140} field="NewNetRawMaterialsCost" headerName='New RM Cost/Pc' cellRenderer='newRMCFormatter'></AgGridColumn>
                                                        <AgGridColumn width={140} field="RMVariance" headerName='RM Variance' cellRenderer='varianceRMCFormatter' ></AgGridColumn>
                                                        {/* <AgGridColumn width={140} field="OldRMRate" hide></AgGridColumn> */}
                                                        {/* <AgGridColumn width={140} field="NewRMRate" hide></AgGridColumn> */}
                                                        <AgGridColumn width={140} field="OldScrapRate" hide></AgGridColumn>
                                                        <AgGridColumn width={140} field="NewScrapRate" hide></AgGridColumn>
                                                    </>}

                                                    {(isSurfaceTreatment || showSurfaceTreatmentColumn) && <>
                                                        <AgGridColumn width={140} field="OldSurfaceTreatmentCost" headerName='Old ST Cost' cellRenderer="oldSTFormatter"></AgGridColumn>
                                                        <AgGridColumn width={140} field="NewSurfaceTreatmentCost" headerName='New ST Cost' cellRenderer="newSTFormatter"></AgGridColumn>
                                                        <AgGridColumn width={140} field="OldTranspotationCost" headerName='Old Extra Cost' ></AgGridColumn>
                                                        <AgGridColumn width={140} field="NewTranspotationCost" headerName='New Extra Cost' ></AgGridColumn>
                                                        <AgGridColumn width={140} field="OldNetSurfaceTreatmentCost" headerName='Old Net ST Cost' cellRenderer="oldNetSTFormatter"></AgGridColumn>
                                                        <AgGridColumn width={140} field="NewNetSurfaceTreatmentCost" headerName='New Net ST Cost' cellRenderer="newNetSTFormatter"></AgGridColumn>
                                                        <AgGridColumn width={140} field="NetSurfaceTreatmentCostVariance" headerName='ST Variance' cellRenderer='varianceSTFormatter' ></AgGridColumn>
                                                    </>}

                                                    {(isOperation || showOperationColumn) && <>
                                                        <AgGridColumn width={140} field="OldOperationCost" headerName='Old Oper Cost' cellRenderer="oldOPERFormatter" ></AgGridColumn>
                                                        <AgGridColumn width={140} field="NewOperationCost" headerName='New Oper Cost' cellRenderer="newOPERFormatter"></AgGridColumn>
                                                        <AgGridColumn width={140} field="OperationCostVariance" headerName='Oper Variance' ></AgGridColumn>
                                                    </>}

                                                    {(isBOPDomesticOrImport || showBOPColumn) && <>
                                                        <AgGridColumn width={140} field="OldNetBoughtOutPartCost" headerName='Old BOP Cost' cellRenderer={decimalFormatter} ></AgGridColumn>
                                                        <AgGridColumn width={140} field="NewNetBoughtOutPartCost" headerName='New BOP Cost' cellRenderer={decimalFormatter}></AgGridColumn>
                                                        <AgGridColumn width={140} field="NetBoughtOutPartCostVariance" headerName='BOP Variance' cellRenderer={decimalFormatter} ></AgGridColumn>
                                                    </>}

                                                    {(isMachineRate || showMachineRateColumn) && <>
                                                        <AgGridColumn width={140} field="OldMachineRate" headerName='Old Machine Rate' ></AgGridColumn>
                                                        <AgGridColumn width={140} field="NewMachineRate" headerName='New Machine Rate' ></AgGridColumn>
                                                    </>}

                                                    {showExchangeRateColumn &&
                                                        <>
                                                            <AgGridColumn width={130} field="Currency" headerName='Currency' cellRenderer='revisionFormatter'></AgGridColumn>
                                                            <AgGridColumn width={140} field="OldPOPrice" headerName='PO Price' cellRenderer='oldPOFormatter'></AgGridColumn>
                                                        </>
                                                    }

                                                    {/* <AgGridColumn width={140} field="NewPOPrice" headerName='PO Price New' cellRenderer='newPOFormatter'></AgGridColumn> */}

                                                    {showExchangeRateColumn &&
                                                        <>
                                                            <AgGridColumn width={140} field="OldNetPOPriceOtherCurrency" headerName='PO Price Old(in Currency)' cellRenderer='oldPOCurrencyFormatter'></AgGridColumn>
                                                            <AgGridColumn width={140} field="NewNetPOPriceOtherCurrency" headerName='PO Price New (in Currency)' cellRenderer='newPOCurrencyFormatter'></AgGridColumn>
                                                            <AgGridColumn width={140} field="POVariance" headerName='PO Variance' cellRenderer='POVarianceFormatter'></AgGridColumn>
                                                            <AgGridColumn width={140} field="OldExchangeRate" headerName='Exchange Rate Old' cellRenderer='oldExchangeFormatter'></AgGridColumn>
                                                            <AgGridColumn width={140} field="NewExchangeRate" headerName='Exchange Rate New' cellRenderer='newExchangeFormatter'></AgGridColumn>
                                                        </>
                                                    }



                                                    <AgGridColumn width={140} field="OldOverheadCost" hide={hideDataColumn.hideOverhead} cellRenderer='overheadFormatter' headerName='Old Overhead'></AgGridColumn>
                                                    <AgGridColumn width={140} field="NewOverheadCost" hide={hideDataColumn.hideOverhead} cellRenderer='overheadFormatter' headerName='New Overhead'></AgGridColumn>
                                                    <AgGridColumn width={140} field="OldProfitCost" hide={hideDataColumn.hideProfit} cellRenderer='profitFormatter' headerName='Old Profit'></AgGridColumn>
                                                    <AgGridColumn width={140} field="NewProfitCost" hide={hideDataColumn.hideProfit} cellRenderer='profitFormatter' headerName='New Profit'></AgGridColumn>
                                                    <AgGridColumn width={140} field="OldRejectionCost" hide={hideDataColumn.hideRejection} cellRenderer='rejectionFormatter' headerName='Old Rejection'></AgGridColumn>
                                                    <AgGridColumn width={140} field="NewRejectionCost" hide={hideDataColumn.hideRejection} cellRenderer='rejectionFormatter' headerName='New Rejection'></AgGridColumn>
                                                    <AgGridColumn width={140} field="OldICCCost" hide={hideDataColumn.hideICC} cellRenderer='costICCFormatter' headerName='Old ICC'></AgGridColumn>
                                                    <AgGridColumn width={140} field="NewICCCost" hide={hideDataColumn.hideICC} cellRenderer='costICCFormatter' headerName='New ICC'></AgGridColumn>
                                                    <AgGridColumn width={140} field="OldPaymentTermsCost" hide={hideDataColumn.hidePayment} cellRenderer='paymentTermFormatter' headerName='Old Payment Terms'></AgGridColumn>
                                                    <AgGridColumn width={140} field="NewPaymentTermsCost" hide={hideDataColumn.hidePayment} cellRenderer='paymentTermFormatter' headerName='New Payment Terms'></AgGridColumn>
                                                    <AgGridColumn width={140} field="OldOtherCost" hide={hideDataColumn.hideOtherCost} cellRenderer='otherCostFormatter' headerName='Old Other Cost'></AgGridColumn>
                                                    <AgGridColumn width={140} field="NewOtherCost" hide={hideDataColumn.hideOtherCost} cellRenderer='otherCostFormatter' headerName='New Other Cost'></AgGridColumn>
                                                    <AgGridColumn width={140} field="OldDiscountCost" hide={hideDataColumn.hideDiscount} cellRenderer='discountCostFormatter' headerName='Old Discount'></AgGridColumn>
                                                    <AgGridColumn width={140} field="NewDiscountCost" hide={hideDataColumn.hideDiscount} cellRenderer='discountCostFormatter' headerName='New Discount'></AgGridColumn>
                                                    <AgGridColumn width={110} field="CostingId" headerName='Actions' type="rightAligned" floatingFilter={false} cellRenderer='buttonFormatter' pinned="right"></AgGridColumn>
                                                    {/* </>} */}
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
                                </Row>
                            </div>
                            <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer sticky-btn-footer">
                                <div className="col-sm-12 text-right bluefooter-butn">

                                    <button
                                        class="user-btn approval-btn mr5"
                                        onClick={sendForApproval}
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


                                    <button className="user-btn mr5 save-btn" onClick={VerifyImpact}>
                                        <div className={"save-icon"}></div>
                                        {"Verify Impact"}
                                    </button>



                                </div>
                            </Row>
                        </div>
                        {isApprovalDrawer &&
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
                                master={selectedMasterForSimulation ? selectedMasterForSimulation.value : master}
                                closeDrawer={closeDrawer}
                                isSimulation={true}
                            // isSaveDone={isSaveDone}
                            />}

                        {isVerifyImpactDrawer &&
                            <VerifyImpactDrawer
                                isOpen={isVerifyImpactDrawer}
                                anchor={'right'}
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
                            />}
                    </div>

            }


            {(showApprovalHistory || getShowSimulationPage) && <Redirect to='/simulation-history' />}

            {CostingDetailDrawer &&
                <CostingDetailSimulationDrawer
                    isOpen={CostingDetailSimulationDrawer}
                    closeDrawer={closeDrawer2}
                    anchor={"right"}
                    pricesDetail={pricesDetail}
                    simulationDetail={simulationDetail}
                    selectedRowData={selectedRowData}
                    costingArr={costingArr}
                    master={selectedMasterForSimulation ? selectedMasterForSimulation.value : master}
                    // closeDrawer={closeDrawer}
                    isSimulation={true}
                />
            }
            {showViewAssemblyDrawer &&
                <ViewAssembly
                    isOpen={showViewAssemblyDrawer}
                    closeDrawer={closeAssemblyDrawer}
                    // approvalData={approvalData}
                    anchor={'bottom'}
                    dataForAssemblyImpact={dataForAssemblyImpact}
                    vendorIdState={vendorIdState}
                    isPartImpactAssembly={true}
                    isImpactDrawer={true}
                />
            }
        </>

    );
}

export default CostingSimulation;
