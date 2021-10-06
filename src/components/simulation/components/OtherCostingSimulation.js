import React, { useState } from 'react';
import { useForm } from 'react-hook-form'
import { Row, Col, } from 'reactstrap';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NoContentFound from '../../common/NoContentFound';
import { CONSTANT } from '../../../helper/AllConastant';
import { getComparisionSimulationData, getExchangeCostingSimulationList, getCombinedProcessCostingSimulationList } from '../actions/Simulation';
import ApproveRejectDrawer from '../../costing/components/approval/ApproveRejectDrawer'
import CostingDetailSimulationDrawer from './CostingDetailSimulationDrawer'
import { checkForDecimalAndNull, formViewData, getConfigurationKey, userDetails } from '../../../helper';
import VerifyImpactDrawer from './VerifyImpactDrawer';
import { EMPTY_GUID, EXCHNAGERATE, PROCESS } from '../../../config/constants';
import { toastr } from 'react-redux-toastr';
import { Redirect } from 'react-router';
import { setCostingViewData } from '../../costing/actions/Costing';
import { CombinedProcessSimulationFinal, CostingSimulationDownload } from '../../../config/masterData'
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import LoaderCustom from '../../common/LoaderCustom';
const gridOptions = {};

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

function OtherCostingSimulation(props) {
    const { simulationId, isFromApprovalListing, master } = props

    const { register, control, formState: { errors }, getValues, setValue } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const [shown, setshown] = useState(false);

    const [selectedRowData, setSelectedRowData] = useState([]);
    const [selectedIds, setSelectedIds] = useState([])
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
    const [tableData, setTableData] = useState([{
        CostingNumber: "12345",
        PartNo: "12345",
        PartName: "12345",
        ECNNumber: "12345",
        RevisionNumber: "12345",
        VendorName: "qwerty",
        OldCC: 3,
        NewCC: 2,
        Variance: 1,
        CostingId: "12345"
    }, {
        CostingNumber: "12345",
        PartNo: "12345",
        PartName: "12345",
        ECNNumber: "12345",
        RevisionNumber: "12345",
        VendorName: "qwerty",
        OldCC: 3,
        NewCC: 2,
        Variance: 1,
        CostingId: "12346"
    }, {
        CostingNumber: "12345",
        PartNo: "12345",
        PartName: "12345",
        ECNNumber: "12345",
        RevisionNumber: "12345",
        VendorName: "qwerty",
        OldCC: 3,
        NewCC: 2,
        Variance: 1,
        CostingId: "12347"
    }, {
        CostingNumber: "12345",
        PartNo: "12345",
        PartName: "12345",
        ECNNumber: "12345",
        RevisionNumber: "12345",
        VendorName: "qwerty",
        OldCC: 3,
        NewCC: 2,
        Variance: 1,
        CostingId: "12348"
    }, {
        CostingNumber: "12345",
        PartNo: "12345",
        PartName: "12345",
        ECNNumber: "12345",
        RevisionNumber: "12345",
        VendorName: "qwerty",
        OldCC: 3,
        NewCC: 2,
        Variance: 1,
        CostingId: "12349"
    }, {
        CostingNumber: "12345",
        PartNo: "12345",
        PartName: "12345",
        ECNNumber: "12345",
        RevisionNumber: "12345",
        VendorName: "qwerty",
        OldCC: 3,
        NewCC: 2,
        Variance: 1,
        CostingId: "123411"
    },

    ])
    // const [tableData, setTableData] = useState([])
    const [vendorIdState, setVendorIdState] = useState("")
    const [simulationTypeState, setSimulationTypeState] = useState("")
    const [SimulationTechnologyIdState, setSimulationTechnologyIdState] = useState("")

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
    const dispatch = useDispatch()

    useEffect(() => {
        getCostingList()
    }, [])


    const getCostingList = () => {

        switch (Number(selectedMasterForSimulation.value)) {
            case Number(EXCHNAGERATE):
                dispatch(getExchangeCostingSimulationList(simulationId, (res) => {
                    if (res.data.Result) {
                        dataSet(res)
                    }
                }))
            case Number(PROCESS):
                dispatch(getCombinedProcessCostingSimulationList(simulationId, (res) => {
                    if (res.data.Result) {
                        dataSet(res)
                    }
                }))

            default:
                break;
        }
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
            if (Number(master) === Number(EXCHNAGERATE)) {
                item.Variance = checkForDecimalAndNull(item.OldExchangeRate - item.NewExchangeRate, getConfigurationKey().NoOfDecimalForPrice)
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
    }


    const costingList = useSelector(state => state.simulation.costingSimulationList)

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
            CostingNumber: data.CostingNumber, PlantCode: data.PlantCode, OldPOPrice: data.OldPOPrice, NewPOPrice: data.NewPOPrice,
            CostingHead: data.CostingHead, OldExchangeRate: data.OldExchangeRate, NewExchangeRate: data.NewExchangeRate, OldNetPOPriceOtherCurrency: data.OldNetPOPriceOtherCurrency,
            NewNetPOPriceOtherCurrency: data.NewNetPOPriceOtherCurrency
        })
        dispatch(getComparisionSimulationData(obj, res => {
            const Data = res.data.Data
            const obj1 = formViewData(Data.OldCosting)
            dispatch(setCostingViewData(obj1))
            runCostingDetailSimulation()
        }))
    }


    const buttonFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                <button className="View" type={'button'} onClick={() => { viewCosting(cell, row, props?.rowIndex) }} />

            </>
        )
    }

    const onRowSelect = () => {
        var selectedRows = gridApi.getSelectedRows();
        console.log('selectedRows: ', selectedRows);
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
            toastr.warning(`Costings ${temp.map(item => item)} is already sent for approval through another token number.`)
            gridApi.deselectAll()
            return false
        } else if (temp.length === 1) {
            toastr.warning(`This costing is under approval with token number ${selectedRows[0].LockedBySimulationToken ? selectedRows[0].LockedBySimulationToken : '-'} at ${selectedRows[0].LockedBySimulationProcessStep ? selectedRows[0].LockedBySimulationProcessStep : "-"} with ${selectedRows[0].LockedBySimulationStuckInWhichUser ? selectedRows[0].LockedBySimulationStuckInWhichUser : '-'} .`)
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

    const varianceFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return cell
    }
    const hideColumn = (props) => {
        // console.log(costingList && costingList[0].NewOverheadCost, "costingList");
        setHideDataColumn({
            hideOverhead: costingList && costingList.length > 0 && costingList[0]?.NewOverheadCost === 0 ? true : false,
            hideProfit: costingList && costingList.length > 0 && costingList[0].NewProfitCost && costingList[0]?.NewProfitCost === 0 ? true : false,
            hideRejection: costingList && costingList.length > 0 && costingList[0].NewRejectionCost && costingList[0]?.NewRejectionCost === 0 ? true : false,
            hideICC: costingList && costingList.length > 0 && costingList[0].NewICCCost && costingList[0]?.NewICCCost === 0 ? true : false,
            hidePayment: costingList && costingList.length > 0 && costingList[0].NewPaymentTermsCost && costingList[0]?.NewPaymentTermsCost === 0 ? true : false,
            hideOtherCost: costingList && costingList.length > 0 && costingList[0].NewOtherCost && costingList[0]?.NewOtherCost === 0 ? true : false,
            hideDiscount: costingList && costingList.length > 0 && costingList[0].NewDiscountCost && costingList[0]?.NewDiscountCost === 0 ? true : false,
            hideOveheadAndProfit: costingList && costingList.length > 0 && costingList[0].NewNetOverheadAndProfitCost && costingList[0]?.NewNetOverheadAndProfitCost === 0 ? true : false
        })
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
        temp = TempData.map((item) => {
            if (item.CostingHead === true) {
                item.CostingHead = 'Vendor Based'
            } else if (item.CostingHead === false) {
                item.CostingHead = 'Zero Based'
            }
            return item
        })

        return (<ExcelSheet data={temp} name={'Costing'}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
        </ExcelSheet>);
    }

    const renderColumn = () => {
        if (master === '3') {
            return returnExcelColumn(CombinedProcessSimulationFinal, selectedRowData.length > 0 ? selectedRowData : costingList && costingList.length > 0 ? costingList : [])
        } else {
            return returnExcelColumn(CostingSimulationDownload, selectedRowData.length > 0 ? selectedRowData : costingList && costingList.length > 0 ? costingList : [])
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
        var allColumnIds = [];
        params.columnApi.getAllColumns().forEach(function (column) {
            allColumnIds.push(column.colId);
        });

        window.screen.width <= 1366 ? params.columnApi.autoSizeColumns(allColumnIds) : params.api.sizeColumnsToFit()

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
        oldPOCurrencyFormatter: oldPOCurrencyFormatter,
        newPOCurrencyFormatter: newPOCurrencyFormatter

    };
    // const isRowSelectable = rowNode => rowNode.data ? selectedCostingIds.length > 0 && !selectedCostingIds.includes(rowNode.data.CostingId) : false;
    return (
        <>
            {
                false ? <LoaderCustom /> :          //loader

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
                                        <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                                            <div className="ag-grid-header">
                                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                                            </div>
                                            <div
                                                className="ag-theme-material"
                                            >
                                                <AgGridReact
                                                    style={{ height: '100%', width: '100%' }}
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
                                                        title: CONSTANT.EMPTY_DATA,
                                                        customClassName: 'nodata-found-container'
                                                    }}
                                                    frameworkComponents={frameworkComponents}
                                                    suppressRowClickSelection={true}
                                                    rowSelection={'multiple'}
                                                    // frameworkComponents={frameworkComponents}
                                                    onSelectionChanged={onRowSelect}
                                                // isRowSelectable={isRowSelectable}
                                                >
                                                    <AgGridColumn width={150} field="CostingNumber" headerName='Costing ID'></AgGridColumn>
                                                    <AgGridColumn width={110} field="PartNo" headerName='Part No.'></AgGridColumn>
                                                    <AgGridColumn width={120} field="PartName" headerName='Part Name' cellRenderer='descriptionFormatter'></AgGridColumn>
                                                    <AgGridColumn width={110} field="ECNNumber" headerName='ECN No.' cellRenderer='ecnFormatter'></AgGridColumn>
                                                    <AgGridColumn width={130} field="RevisionNumber" headerName='Revision No.' cellRenderer='revisionFormatter'></AgGridColumn>
                                                    <AgGridColumn width={140} field="VendorName" cellRenderer='vendorFormatter' headerName='Vendor Name'></AgGridColumn>
                                                    {
                                                        String(master) === EXCHNAGERATE &&
                                                        <>
                                                            <AgGridColumn width={130} field="Currency" headerName='Currency' cellRenderer='revisionFormatter'></AgGridColumn>
                                                            <AgGridColumn width={140} field="OldPOPrice" headerName='PO Price' cellRenderer='oldPOFormatter'></AgGridColumn>
                                                        </>
                                                    }
                                                    {/* <AgGridColumn width={140} field="NewPOPrice" headerName='PO Price New' cellRenderer='newPOFormatter'></AgGridColumn> */}
                                                    {String(master) === EXCHNAGERATE &&
                                                        <>
                                                            <AgGridColumn width={140} field="OldNetPOPriceOtherCurrency" headerName='PO Price Old(in Currency)' cellRenderer='oldPOCurrencyFormatter'></AgGridColumn>
                                                            <AgGridColumn width={140} field="NewNetPOPriceOtherCurrency" headerName='PO Price New (in Currency)' cellRenderer='newPOCurrencyFormatter'></AgGridColumn>
                                                            <AgGridColumn width={140} field="OldExchangeRate" headerName='Exchange Rate Old' cellRenderer='oldExchangeFormatter'></AgGridColumn>
                                                            <AgGridColumn width={140} field="NewExchangeRate" headerName='Exchange Rate New' cellRenderer='newExchangeFormatter'></AgGridColumn>
                                                        </>
                                                    }
                                                    {String(master) === PROCESS &&
                                                        <>
                                                            <AgGridColumn width={140} field="OldCC" headerName='Old CC' cellRenderer='oldExchangeFormatter'></AgGridColumn>
                                                            <AgGridColumn width={140} field="NewCC" headerName='New CC' cellRenderer='newExchangeFormatter'></AgGridColumn>
                                                        </>
                                                    }
                                                    <AgGridColumn width={140} field="Variance" headerName='Variance' cellRenderer='varianceFormatter'></AgGridColumn>
                                                    <AgGridColumn width={100} field="CostingId" headerName='Actions' type="rightAligned" cellRenderer='buttonFormatter'></AgGridColumn>

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
                            <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
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

                                    {/* <button className="user-btn mr5 save-btn" onClick={VerifyImpact}>
                                        <div className={"save-icon"}></div>
                                        {"Verify Impact"}
                                    </button> */}



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
        </>

    );
}


export default OtherCostingSimulation;