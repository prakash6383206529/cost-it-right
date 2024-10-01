import React, { useState } from 'react';
import { Row, Col, } from 'reactstrap';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NoContentFound from '../../common/NoContentFound';
import { AssemblyWiseImpactt, EMPTY_DATA, ImpactMaster, TOFIXEDVALUE } from '../../../config/constants';
import { getComparisionSimulationData, getExchangeCostingSimulationList, getImpactedMasterData, getSimulatedAssemblyWiseImpactDate } from '../actions/Simulation';
import ApproveRejectDrawer from '../../costing/components/approval/ApproveRejectDrawer'
import CostingDetailSimulationDrawer from './CostingDetailSimulationDrawer'
import { checkForDecimalAndNull, checkForNull, formViewData, getConfigurationKey, searchNocontentFilter, showSaLineNumber, userDetails } from '../../../helper';
import VerifyImpactDrawer from './VerifyImpactDrawer';
import { EMPTY_GUID, EXCHNAGERATE } from '../../../config/constants';
import Toaster from '../../common/Toaster';
import { Redirect } from 'react-router';
import { setCostingViewData } from '../../costing/actions/Costing';
import { ASSEMBLY_WISEIMPACT_DOWNLOAD_EXCEl, BOPGridForToken, ERGridForToken, EXCHANGESIMULATIONDOWNLOAD, InitialGridForToken, LastGridForToken, OperationGridForToken, RMGridForToken, STGridForToken } from '../../../config/masterData'
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import LoaderCustom from '../../common/LoaderCustom';
import { impactmasterDownload, SimulationUtils } from '../SimulationUtils'
import ViewAssembly from './ViewAssembly';
import _ from 'lodash';
import { PaginationWrapper } from '../../common/commonPagination';
import { useLabels } from '../../../helper/core';

const gridOptions = {};

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

function OtherCostingSimulation(props) {
    const { simulationId, isFromApprovalListing, master, statusForLinkedToken } = props
const {vendorLabel} = useLabels()
     const [selectedRowData, setSelectedRowData] = useState([]);
    const [tokenNo, setTokenNo] = useState('')
    const [CostingDetailDrawer, setCostingDetailDrawer] = useState(false)
    const [isVerifyImpactDrawer, setIsVerifyImpactDrawer] = useState(false)
    const [isApprovalDrawer, setIsApprovalDrawer] = useState(false)
    const [showApprovalHistory, setShowApprovalHistory] = useState(false)
    const [simulationDetail, setSimulationDetail] = useState('')
    const [costingArr, setCostingArr] = useState([])
    const [isSaveDone, setSaveDone] = useState(isFromApprovalListing ? isFromApprovalListing : false)
    const [oldArr, setOldArr] = useState([])
    const [pricesDetail, setPricesDetail] = useState({})
    const [disableApproveButton, setDisableApprovalButton] = useState(false)
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [selectedCostingIds, setSelectedCostingIds] = useState();
    const [loader, setLoader] = useState(true)
    const [tableData, setTableData] = useState([])
    const [vendorIdState, setVendorIdState] = useState("")
    const [simulationTypeState, setSimulationTypeState] = useState("")
    const [SimulationTechnologyIdState, setSimulationTechnologyIdState] = useState("")
    const selectedMasterForSimulation = useSelector(state => state.simulation.selectedMasterForSimulation)

    const [showBOPColumn, setShowBOPColumn] = useState(false);
    const [showRMColumn, setShowRMColumn] = useState(false);
    const [showOperationColumn, setShowOperationColumn] = useState(false);
    const [showSurfaceTreatmentColumn, setShowSurfaceTreatmentColumn] = useState(false);
    const [showExchangeRateColumn, setShowExchangeRateColumn] = useState(false);
    const [showMachineRateColumn, setShowMachineRateColumn] = useState(false);
    const [assemblyImpactButtonTrue, setAssemblyImpactButtonTrue] = useState(true);
    const [noData, setNoData] = useState(false);

    const isExchangeRate = String(selectedMasterForSimulation?.value) === EXCHNAGERATE;

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

    const dispatch = useDispatch()
    const simulationAssemblyListSummary = useSelector((state) => state.simulation.simulationAssemblyListSummary)

    useEffect(() => {
        getCostingList()
        dispatch(getImpactedMasterData(simulationId, (res) => { }))
    }, [])

    useEffect(() => {
        let count = 0
        tableData && tableData.map((item) => {

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


        if (tableData !== undefined && (Object.keys(tableData).length !== 0 || tableData.length > 0)) {
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

    const getCostingList = () => {
        dispatch(getExchangeCostingSimulationList(simulationId, (res) => {
            if (res.data.Result) {
                dataSet(res)
            }
        }))
    }
    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            if (tableData.length !== 0) {
                setNoData(searchNocontentFilter(value, noData))
            }
        }, 500);
    }

    const dataSet = (res) => {
        const tokenNo = res.data.Data.SimulationTokenNumber
        const Data = res.data.Data
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
            switch (master) {
                case EXCHNAGERATE:
                    item.POVariance = (checkForNull(item.OldNetPOPriceOtherCurrency).toFixed(TOFIXEDVALUE) -
                        checkForNull(item.NewNetPOPriceOtherCurrency).toFixed(TOFIXEDVALUE))
                    item.Variance = (checkForNull(item.OldExchangeRate).toFixed(TOFIXEDVALUE) -
                        checkForNull(item.NewExchangeRate).toFixed(TOFIXEDVALUE))

                    break;
                default:
                    break;
            }
            return null
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
        tempObj.EffectiveDate = Data?.EffectiveDate
        tempObj.CostingHead = Data?.SimulatedCostingList[0]?.CostingHead
        tempObj.SimulationAppliedOn = Data.SimulationAppliedOn
        tempObj.Technology = Data?.SimulatedCostingList[0]?.Technology
        tempObj.Vendor = Data?.SimulatedCostingList[0]?.VendorName
        setAmendmentDetails(tempObj)
    }

    const impactedMasterData = useSelector(state => state.comman.impactedMasterData)

    const costingList = useSelector(state => state.simulation.costingSimulationList)
    const costingSimulationListAllKeys = useSelector(state => state.simulation.costingSimulationListAllKeys)

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
            simulationId: simulationId,
            costingId: data.CostingId
        }
        setPricesDetail({
            CostingNumber: data.CostingNumber, PlantCode: data.PlantCode, OldPOPrice: data.OldPOPrice, NewPOPrice: data.NewPOPrice,
            CostingHead: data.CostingHead, OldExchangeRate: data.OldExchangeRate, NewExchangeRate: data.NewExchangeRate, OldNetPOPriceOtherCurrency: data.OldNetPOPriceOtherCurrency,
            NewNetPOPriceOtherCurrency: data.NewNetPOPriceOtherCurrency
        })
        dispatch(getComparisionSimulationData(obj, res => {
            const Data = res.data.Data

            const obj1 = [...formViewData(Data.OldCosting), ...formViewData(Data.NewCosting), ...formViewData(Data.Variance)]
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
                <button className="View" title='View' type={'button'} onClick={() => { viewCosting(cell, row, props?.rowIndex) }} />
                {row?.IsAssemblyExist && <button title='Assembly Impact' className="hirarchy-btn" type={'button'} onClick={() => { viewAssembly(cell, row, props?.rowIndex) }}> </button>}

            </>
        )
    }

    const onRowSelect = () => {
        var selectedRows = gridApi.getSelectedRows();
        let temp = []
        selectedRows && selectedRows.map(item => {
            if (item.IsLockedBySimulation) {
                temp.push(item.CostingNumber)
                return false
            }
            return null
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
            const isChanged = JSON.stringify(oldArr) === JSON.stringify(selectedRowData)
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

    const verifyImpactDrawer = (e = '', type) => {
        if (type === 'cancel') {
            setIsVerifyImpactDrawer(false);
        }
    }

    const closeAssemblyDrawer = () => {
        setShowViewAssemblyDrawer(false)
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

    const VarianceFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        let value
        switch (master) {
            case EXCHNAGERATE:
                value = checkForDecimalAndNull(row.Variance, getConfigurationKey().NoOfDecimalForPrice)
                break;
            default:
                break;
        }
        return value
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

    }

    const returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = SimulationUtils(TempData)

        return (<ExcelSheet data={temp} name={'Costing'}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
        </ExcelSheet>);
    }

    const returnExcelColumnImpactedMaster = () => {
        let multiDataSet = impactmasterDownload(impactedMasterData)

        return (

            <ExcelSheet dataSet={multiDataSet} name={ImpactMaster} />
        );
    }

    const returnExcelColumnSecond = (data = []) => {

        return (

            <ExcelSheet data={simulationAssemblyListSummary} name={AssemblyWiseImpactt}>
                {ASSEMBLY_WISEIMPACT_DOWNLOAD_EXCEl && ASSEMBLY_WISEIMPACT_DOWNLOAD_EXCEl.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
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
                return null
            })
            // ************ CONCAT ALL DATA IN SINGLE ARRAY *********** */
            arrayOFCorrectObjIndividual = arrayOFCorrectObjIndividual.concat(temp);
            return null
        })
        let finalGrid = [], isTokenAPI = false
        if (showBOPColumn === true || showRMColumn === true || showOperationColumn === true || showSurfaceTreatmentColumn === true ||
            showExchangeRateColumn === true || showMachineRateColumn === true || true) {

            if (showBOPColumn) {
                finalGrid = [...finalGrid, ...BOPGridForToken]
                isTokenAPI = true
            }
            if (showRMColumn) {
                finalGrid = [...finalGrid, ...RMGridForToken]
                isTokenAPI = true
            }
            if (showOperationColumn) {
                finalGrid = [...finalGrid, ...OperationGridForToken]
                isTokenAPI = true
            }
            if (showSurfaceTreatmentColumn) {
                finalGrid = [...finalGrid, ...STGridForToken]
                isTokenAPI = true
            }
            if (showExchangeRateColumn || isExchangeRate) {
                finalGrid = [...finalGrid, ...ERGridForToken]
                isTokenAPI = true
            }
            // if (showMachineRateColumn || isMachineRate) {
            //     finalGrid = [...finalGrid, ...OperationGridForToken]
            // isTokenAPI = true
            // }

            // CONDITION FOR COMBINED PROCESS
            finalGrid = [...InitialGridForToken, ...finalGrid, ...LastGridForToken]
        }

        switch (Number(master)) {
            case Number(EXCHNAGERATE):
                return returnExcelColumn(isTokenAPI ? finalGrid : EXCHANGESIMULATIONDOWNLOAD, selectedRowData.length > 0 ? selectedRowData : costingList && costingList.length > 0 ? costingList : [])
            // CostingSimulationDownloadRM
            default:
                break;
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

        window.screen.width <= 1366 ? params.columnApi.autoSizeColumns(allColumnIds) : params.api.sizeColumnsToFit()

    };

    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const resetState = () => {
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);
    }


    const frameworkComponents = {

        descriptionFormatter: descriptionFormatter,
        ecnFormatter: ecnFormatter,
        revisionFormatter: revisionFormatter,
        oldPOFormatter: oldPOFormatter,
        newPOFormatter: newPOFormatter,
        oldExchangeFormatter: oldExchangeFormatter,
        buttonFormatter: buttonFormatter,
        newExchangeFormatter: newExchangeFormatter,
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
        VarianceFormatter: VarianceFormatter,
        overheadFormatter: overheadFormatter,
        profitFormatter: profitFormatter,
        rejectionFormatter: rejectionFormatter,
        costICCFormatter: costICCFormatter,
        paymentTermFormatter: paymentTermFormatter,
        otherCostFormatter: otherCostFormatter,
        discountCostFormatter: discountCostFormatter,
        netOverheadAndProfitFormatter: netOverheadAndProfitFormatter,
        hideColumn: hideColumn,
        oldPOCurrencyFormatter: oldPOCurrencyFormatter,
        newPOCurrencyFormatter: newPOCurrencyFormatter

    };

    const isRowSelectable = rowNode => statusForLinkedToken === true ? false : true;
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
                                        <h1 class="mb-0">Token No:{tokenNo}</h1>
                                    </Col>
                                </Row>
                                <Row className="filter-row-large pt-4 blue-before">

                                    <Col md="3" lg="3" className="search-user-block mb-3">
                                        <div className="d-flex justify-content-end bd-highlight w100">

                                            {(showRMColumn || showBOPColumn || showOperationColumn ||
                                                showMachineRateColumn || showExchangeRateColumn)
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
                                        <div className={`ag-grid-wrapper height-width-wrapper ${(tableData && tableData?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                                            <div className="ag-grid-header">
                                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                            </div>
                                            <div className="ag-theme-material">
                                                {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found simulation-lisitng" />}
                                                <AgGridReact
                                                    defaultColDef={defaultColDef}
                                                    floatingFilter={true}
                                                    domLayout='autoHeight'
                                                    // columnDefs={c}
                                                    rowData={tableData}
                                                    pagination={true}
                                                    paginationPageSize={10}
                                                    onGridReady={onGridReady}
                                                    gridOptions={gridOptions}
                                                    loadingOverlayComponent={'customLoadingOverlay'}
                                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                                    noRowsOverlayComponentParams={{
                                                        title: EMPTY_DATA,
                                                        customClassName: 'nodata-found-container'
                                                    }}
                                                    frameworkComponents={frameworkComponents}
                                                    suppressRowClickSelection={true}
                                                    rowSelection={'multiple'}
                                                    // frameworkComponents={frameworkComponents}
                                                    onSelectionChanged={onRowSelect}
                                                    isRowSelectable={isRowSelectable}
                                                    onFilterModified={onFloatingFilterChanged}
                                                    enableBrowserTooltips={true}
                                                >
                                                    <AgGridColumn width={150} field="CostingNumber" headerName='Costing Id'></AgGridColumn>
                                                    <AgGridColumn width={110} field="PartNo" tooltipField='PartNo' headerName='Part No.'></AgGridColumn>
                                                    <AgGridColumn width={120} field="PartName" tooltipField='PartName' headerName='Part Name' cellRenderer='descriptionFormatter'></AgGridColumn>
                                                    <AgGridColumn width={110} field="ECNNumber" headerName='ECN No.' cellRenderer='ecnFormatter'></AgGridColumn>
                                                    <AgGridColumn width={130} field="RevisionNumber" headerName='Revision No.' cellRenderer='revisionFormatter'></AgGridColumn>
                                                    <AgGridColumn width={140} field="VendorName" tooltipField='VendorName' cellRenderer='vendorFormatter' headerName={vendorLabel}></AgGridColumn>
                                                    {/* MINDA */}
                                                    {showSaLineNumber() && <AgGridColumn width={130} field="SANumber" headerName='SA Number' editable={true}></AgGridColumn>}
                                                    {showSaLineNumber() && <AgGridColumn width={130} field="LineNumber" headerName='Line Number' editable={true}></AgGridColumn>}
                                                    {(String(master) === EXCHNAGERATE || showExchangeRateColumn) &&
                                                        <>
                                                            <AgGridColumn width={130} field="Currency" headerName='Currency' cellRenderer='revisionFormatter'></AgGridColumn>
                                                            <AgGridColumn width={140} field="OldPOPrice" headerName='Net Cost' cellRenderer='oldPOFormatter'></AgGridColumn>
                                                        </>
                                                    }

                                                    {/* <AgGridColumn width={140} field="NewPOPrice" headerName='PO Price New' cellRenderer='newPOFormatter'></AgGridColumn> */}

                                                    {(String(master) === EXCHNAGERATE || showExchangeRateColumn) &&
                                                        <>
                                                            <AgGridColumn width={140} field="OldNetPOPriceOtherCurrency" headerName='Existing Net Cost (in Currency)' cellRenderer='oldPOCurrencyFormatter'></AgGridColumn>
                                                            <AgGridColumn width={140} field="NewNetPOPriceOtherCurrency" headerName='Revised Net Cost (in Currency)' cellRenderer='newPOCurrencyFormatter'></AgGridColumn>
                                                            <AgGridColumn width={140} field="POVariance" headerName='Variance (w.r.t. Existing)' cellRenderer='POVarianceFormatter'></AgGridColumn>
                                                            <AgGridColumn width={140} field="OldExchangeRate" headerName='Existing Exchange Rate' cellRenderer='oldExchangeFormatter'></AgGridColumn>
                                                            <AgGridColumn width={140} field="NewExchangeRate" headerName='Revised Exchange Rate' cellRenderer='newExchangeFormatter'></AgGridColumn>
                                                        </>
                                                    }

                                                    {(showRMColumn) && <>
                                                        <AgGridColumn field="RawMaterialFinishWeight" hide headerName='Finish Weight'></AgGridColumn>
                                                        <AgGridColumn field="RawMaterialGrossWeight" hide headerName='Gross Weight'></AgGridColumn>
                                                    </>}

                                                    <AgGridColumn width={140} field="OldPOPrice" headerName='Existing Net Cost' cellRenderer='oldPOFormatter'></AgGridColumn>
                                                    <AgGridColumn width={140} field="NewPOPrice" headerName='Revised Net Cost' cellRenderer='newPOFormatter'></AgGridColumn>
                                                    <AgGridColumn width={140} field="Variance" headerName='Variance (w.r.t. Existing)' cellRenderer='variancePOFormatter' ></AgGridColumn>

                                                    {(showRMColumn) && <>
                                                        {/* <AgGridColumn width={140} field="OldRMCSum" headerName='Existing RM Cost/Pc' cellRenderer='oldRMCFormatter'></AgGridColumn>
                                                        <AgGridColumn width={140} field="NewRMCSum" headerName='New RM Cost/Pc' cellRenderer='newRMCFormatter' ></AgGridColumn>
                                                        <AgGridColumn width={140} field="RMVarianceSum" headerName='RM Variance' cellRenderer='varianceRMCFormatter' ></AgGridColumn> */}
                                                        <AgGridColumn width={140} field="OldNetRawMaterialsCost" headerName='Existing RM Cost/Pc' cellRenderer='oldRMCFormatter'></AgGridColumn>
                                                        <AgGridColumn width={140} field="NewNetRawMaterialsCost" headerName='Revised RM Cost/Pc' cellRenderer='newRMCFormatter'></AgGridColumn>
                                                        <AgGridColumn width={140} field="RMVariance" headerName='Variance (RM Cost)' cellRenderer='varianceRMCFormatter' ></AgGridColumn>
                                                        {/* <AgGridColumn width={140} field="OldRMRate" hide></AgGridColumn> */}
                                                        {/* <AgGridColumn width={140} field="NewRMRate" hide></AgGridColumn> */}
                                                        <AgGridColumn width={140} field="OldScrapRate" hide></AgGridColumn>
                                                        <AgGridColumn width={140} field="NewScrapRate" hide></AgGridColumn>
                                                    </>}

                                                    {(showSurfaceTreatmentColumn) && <>
                                                        <AgGridColumn width={140} field="OldSurfaceTreatmentCost" headerName='Existing ST Cost' cellRenderer="oldSTFormatter"></AgGridColumn>
                                                        <AgGridColumn width={140} field="NewSurfaceTreatmentCost" headerName='Revised ST Cost' cellRenderer="newSTFormatter"></AgGridColumn>
                                                        <AgGridColumn width={140} field="OldTranspotationCost" headerName='Existing Extra Cost' ></AgGridColumn>
                                                        <AgGridColumn width={140} field="NewTranspotationCost" headerName='Revised Extra Cost' ></AgGridColumn>
                                                        <AgGridColumn width={140} field="OldNetSurfaceTreatmentCost" headerName='Existing Net ST Cost' cellRenderer="oldNetSTFormatter"></AgGridColumn>
                                                        <AgGridColumn width={140} field="NewNetSurfaceTreatmentCost" headerName='Revised Net ST Cost' cellRenderer="newNetSTFormatter"></AgGridColumn>
                                                        <AgGridColumn width={140} field="NetSurfaceTreatmentCostVariance" headerName='Variance (ST Cost)' cellRenderer='varianceSTFormatter' ></AgGridColumn>
                                                    </>}

                                                    {(showOperationColumn) && <>
                                                        <AgGridColumn width={140} field="OldOperationCost" headerName='Existing Oper Cost' cellRenderer="oldOPERFormatter"></AgGridColumn>
                                                        <AgGridColumn width={140} field="NewOperationCost" headerName='Revised Oper Cost' cellRenderer="newOPERFormatter"></AgGridColumn>
                                                        <AgGridColumn width={140} field="OperationCostVariance" headerName='Variance (Oper. Cost)' ></AgGridColumn>
                                                    </>}

                                                    {(showBOPColumn) && <>
                                                        <AgGridColumn width={140} field="OldBasicRate" headerName='Existing Basic Rate' ></AgGridColumn>
                                                        <AgGridColumn width={140} field="NewBasicRate" headerName='Revised Basic Rate' ></AgGridColumn>
                                                    </>}

                                                    {showMachineRateColumn && <>
                                                        <AgGridColumn width={140} field="OldMachineRate" headerName='Existing Machine Rate' ></AgGridColumn>
                                                        <AgGridColumn width={140} field="NewMachineRate" headerName='Revised Machine Rate' ></AgGridColumn>
                                                    </>}


                                                    <AgGridColumn width={140} field="Variance" headerName='Variance (MR Cost)' cellRenderer='VarianceFormatter'></AgGridColumn>
                                                    <AgGridColumn width={100} field="CostingId" headerName='Actions' type="rightAligned" cellRenderer='buttonFormatter'></AgGridColumn>

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
                                        onClick={sendForApproval}
                                        disabled={selectedRowData && selectedRowData.length === 0 ? true : disableApproveButton ? true : false}
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
                                anchor={'right'}
                                approvalData={[]}
                                type={'Sender'}
                                simulationDetail={simulationDetail}
                                selectedRowData={selectedRowData}
                                costingArr={costingArr}
                                master={selectedMasterForSimulation ? selectedMasterForSimulation.value : master}
                                closeDrawer={closeDrawer}
                                isSimulation={true}
                                vendorId={vendorIdState}
                                SimulationTechnologyId={SimulationTechnologyIdState}
                                SimulationType={simulationTypeState}

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
                                assemblyImpactButtonTrue={assemblyImpactButtonTrue}
                            />}
                    </div>

            }


            {showApprovalHistory && <Redirect to='/simulation-history' />}

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
                />}

            {showViewAssemblyDrawer &&
                <ViewAssembly
                    isOpen={showViewAssemblyDrawer}
                    closeDrawer={closeAssemblyDrawer}
                    // approvalData={approvalData}
                    anchor={'bottom'}
                    dataForAssemblyImpact={dataForAssemblyImpact}
                    vendorIdState={vendorIdState}
                    isPartImpactAssembly={true}
                />
            }
        </>

    );
}


export default OtherCostingSimulation;
