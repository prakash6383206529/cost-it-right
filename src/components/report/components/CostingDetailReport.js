import React, { useState, useEffect, Fragment } from 'react'
import DayTime from '../../common/DayTimeWrapper'
import { Row, Col } from 'reactstrap'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import NoContentFound from '../../common/NoContentFound'
import { REPORT_DOWNLOAD_EXCEl } from '../../../config/masterData';
import { getCostingReport } from '.././actions/ReportListing'
import { getSingleCostingDetails, setCostingViewData } from '../../costing/actions/Costing'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import ReactExport from 'react-export-excel';
import { ReportMaster, EMPTY_DATA, defaultPageSize } from '../../../config/constants';
import LoaderCustom from '../../common/LoaderCustom';
import WarningMessage from '../../common/WarningMessage'
import CostingDetailSimulationDrawer from '../../simulation/components/CostingDetailSimulationDrawer'
import { formViewData, checkForDecimalAndNull } from '../../../helper'
import ViewRM from '../../costing/components/Drawers/ViewRM'
import { PaginationWrapper } from '../../common/commonPagination'

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};

function ReportListing(props) {

    const [selectedRowData, setSelectedRowData] = useState([]);
    const [searchButtonClicked, setSearchButtonClicked] = useState(false);
    const [filterModel, setFilterModel] = useState({});
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [isLoader, setLoader] = useState(true)
    const [isReportLoader, setIsReportLoader] = useState(false)
    const [isOpen, setIsOpen] = useState(false)
    const [warningMessage, setWarningMessage] = useState(false)
    const [totalRecordCount, setTotalRecordCount] = useState(0)
    const [pageSize10, setPageSize10] = useState(true)
    const [pageSize50, setPageSize50] = useState(false)
    const [pageSize100, setPageSize100] = useState(false)
    const [viewRMData, setViewRMData] = useState([])
    const [isViewRM, setIsViewRM] = useState(false)
    const [isAssemblyCosting, setIsAssemblyCosting] = useState(false)
    const [rmMBDetail, setrmMBDetail] = useState({})
    const [pageNo, setPageNo] = useState(1)
    const [pageNoNew, setPageNoNew] = useState(1)
    const [disableNextButtton, setDisableNextButtton] = useState(false)
    const [currentRowIndex, setCurrentRowIndex] = useState(0)
    const [floatingFilterData, setFloatingFilterData] = useState({ CostingNumber: "", TechnologyName: "", AmorizationQuantity: "", AnyOtherCost: "", CostingVersion: "", DisplayStatus: "", EffectiveDate: "", Currency: "", DepartmentCode: "", DepartmentName: "", DiscountCost: "", ECNNumber: "", FinalPOPrice: "", RawMaterialFinishWeight: "", FreightCost: "", FreightPercentage: "", FreightType: "", GrossWeight: "", HundiOrDiscountValue: "", ICCApplicability: "", ICCCost: "", ICCInterestRate: "", ICCOn: "", MasterBatchTotal: "", ModelTypeForOverheadAndProfit: "", ModifiedByName: "", ModifiedByUserName: "", ModifiedDate: "", NetBoughtOutPartCost: "", NetConversionCost: "", NetConvertedPOPrice: "", NetDiscountsCost: "", NetFreightPackaging: "", NetFreightPackagingCost: "", NetICCCost: "", NetOperationCost: "", NetOtherCost: "", NetOverheadAndProfitCost: "", NetPOPrice: "", NetPOPriceINR: "", NetPOPriceInCurrency: "", NetPOPriceOtherCurrency: "", NetProcessCost: "", NetRawMaterialsCost: "", NetSurfaceTreatmentCost: "", NetToolCost: "", NetTotalRMBOPCC: "", OtherCost: "", OtherCostPercentage: "", OverheadApplicability: "", OverheadCombinedCost: "", OverheadCost: "", OverheadOn: "", OverheadPercentage: "", PackagingCost: "", PackagingCostPercentage: "", PartName: "", PartNumber: "", PartType: "", PaymentTermCost: "", PaymentTermsOn: "", PlantCode: "", PlantName: "", ProfitApplicability: "", ProfitCost: "", ProfitOn: "", ProfitPercentage: "", RMGrade: "", RMSpecification: "", RawMaterialCode: "", RawMaterialGrossWeight: "", RawMaterialName: "", RawMaterialRate: "", RawMaterialScrapWeight: "", RawMaterialSpecification: "", RecordInsertedBy: "", RejectOn: "", RejectionApplicability: "", RejectionCost: "", RejectionPercentage: "", Remark: "", Rev: "", RevisionNumber: "", ScrapRate: "", ScrapWeight: "", SurfaceTreatmentCost: "", ToolCost: "", ToolLife: "", ToolMaintenaceCost: "", ToolPrice: "", ToolQuantity: "", TotalCost: "", TotalOtherCost: "", TotalRecordCount: "", TransportationCost: "", VendorCode: "", VendorName: "", Version: "", RawMaterialGrade: "", HundiOrDiscountPercentage: "", FromDate: "", ToDate: "" })
    const [enableSearchFilterSearchButton, setEnableSearchFilterButton] = useState(true)
    const [reportListingDataStateArray, setReportListingDataStateArray] = useState([])
    const [globalTake, setGlobalTake] = useState(defaultPageSize)
    const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false)
    const [disableDownload, setDisableDownload] = useState(false)
    const viewCostingData = useSelector((state) => state.costing.viewCostingDetailData)
    var filterParams = {
        comparator: function (filterLocalDateAtMidnight, cellValue) {
            var dateAsString = cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
            var newDate = filterLocalDateAtMidnight != null ? DayTime(filterLocalDateAtMidnight).format('DD/MM/YYYY') : '';
            setFloatingFilterData({ ...floatingFilterData, EffectiveDate: newDate })
            if (dateAsString == null) return -1;
            var dateParts = dateAsString.split('/');
            var cellDate = new Date(
                Number(dateParts[2]),
                Number(dateParts[1]) - 1,
                Number(dateParts[0])
            );
            if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                return 0;
            }
            if (cellDate < filterLocalDateAtMidnight) {
                return -1;
            }
            if (cellDate > filterLocalDateAtMidnight) {
                return 1;
            }
        },
        browserDatePicker: true,
        minValidYear: 2000,
    };

    let filterClick = false
    const dispatch = useDispatch()
    const { handleSubmit, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    let reportListingData = useSelector((state) => state.report.reportListing)
    let allReportListingData = useSelector((state) => state.report.allReportListing)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)

    const simulatedOnFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        //return cell != null ? moment(cell).format('DD/MM/YYYY hh:mm A') : '';
        return cellValue != null ? cellValue : '';
    }

    const linkableFormatter = (props) => {
        let tempDate = props.data.CreatedDate
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        let temp = `${DayTime(tempDate).format('DD/MM/YYYY')}-${cellValue}`
        return temp
    }

    // @method hyperLinkFormatter( This function will make the first column details into hyperlink )

    const hyperLinkableFormatter = (props) => {

        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                {row.Status !== "CreatedByAssembly" ?
                    <div
                        onClick={() => viewDetails(row.UserId, cell, row)}
                        className={'link'}
                    >{cell}</div>
                    : <div>{cell}</div>
                }
            </>
        )
    }

    const viewDetails = (UserId, cell, row) => {
        setIsReportLoader(true)
        if (row.BaseCostingId && Object.keys(row.BaseCostingId).length > 0) {
            dispatch(getSingleCostingDetails(row.BaseCostingId, (res) => {
                if (res.data.Data) {
                    let dataFromAPI = res.data.Data
                    setIsReportLoader(false)
                    const tempObj = formViewData(dataFromAPI)
                    dispatch(setCostingViewData(tempObj))
                }
            },
            ))
        }
        setIsOpen(true)
    }

    const closeUserDetails = () => {
        setIsViewRM(false)
        setIsOpen(false)
    }

    const dateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        let temp = DayTime(cellValue).format('DD/MM/YYYY h:m:s')
        return temp
    }

    /**
    * @method hyphenFormatter
    */
    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }


    const remarkFormatter = (props) => {

        const cellValue = props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const costingID = row.BaseCostingId;

        if (props.data.RawMaterialName === "Multiple RM") {
            return <>
                {row.Status !== "CreatedByAssembly" ?
                    <div
                        onClick={() => viewMultipleRMDetails(costingID)}
                        className={'link'}
                    >Multiple RM</div>
                    : <div>Multiple RM</div>
                }
            </>

        } else {
            return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
        }

    }

    const viewMultipleRMDetails = (costingID) => {
        dispatch(getSingleCostingDetails(costingID, (res) => {
            if (res.data.Data) {
                let dataFromAPI = res.data.Data;

                const tempObj = formViewData(dataFromAPI)
                dispatch(setCostingViewData(tempObj))
                let data = dataFromAPI && dataFromAPI?.CostingPartDetails?.CostingRawMaterialsCost
                setIsAssemblyCosting(dataFromAPI && dataFromAPI?.IsAssemblyCosting)

                setViewRMData(data)
                setrmMBDetail({
                    MasterBatchTotal: dataFromAPI.CostingPartDetails?.masterBatchTotal,
                    MasterBatchRMPrice: dataFromAPI.CostingPartDetails?.masterBatchRMPrice,
                    MasterBatchPercentage: dataFromAPI.CostingPartDetails?.masterBatchPercentage,
                    IsApplyMasterBatch: dataFromAPI.CostingPartDetails?.isApplyMasterBatch
                })
                setIsViewRM(true)
            }
        },
        ))

    }

    const partTypeAssemblyFormatter = (props) => {

        const cellValue = props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const costingID = row.BaseCostingId;

        if (props.data.RawMaterialName === "Multiple RM") {
            return <>
                {row.Status !== "CreatedByAssembly" ?
                    <div
                        onClick={() => viewMultipleRMDetails(costingID)}
                        className={'link'}
                    >Multiple RM</div>
                    : <div>Multiple RM</div>
                }
            </>

        } else {
            return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
        }
    }


    /**
    * @method decimalPriceFormatter
    */
    const decimalPriceFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? checkForDecimalAndNull(cellValue, initialConfiguration.NoOfDecimalForPrice) : '-';
    }

    /**
    * @method decimalInputOutputFormatter
    */
    const decimalInputOutputFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? checkForDecimalAndNull(cellValue, initialConfiguration.NoOfDecimalForInputOutput) : '-';
    }

    /**
    * @method effectiveDateFormatter
    */
    const effectiveDateFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? DayTime(cellValue).format('DD/MM/YYYY') : '-';
    }

    const statusFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return <div className={row.Status}>{row.DisplayStatus}</div>
    }

    /**
    * @method getTableData
    * @description getting approval list table
    */
    const rmHyperLinkFormatter = (props) => {
        const cellValue = props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const costingID = row.BaseCostingId;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? <>
            {row.Status !== "CreatedByAssembly" ?
                <div
                    onClick={() => viewMultipleRMDetails(costingID)}
                    className={'link'}
                > {checkForDecimalAndNull(cellValue, initialConfiguration.NoOfDecimalForPrice)}</div> : <div>{checkForDecimalAndNull(cellValue, initialConfiguration.NoOfDecimalForPrice)}</div>} </> : '-';
    }

    const getTableData = (skip, take, isPagination, data, isLastWeek, isCallApi) => {

        if (isPagination === true) {
            setLoader(true)
        }
        let newData = {}
        if (isLastWeek) {
            let currentDate = new Date()
            currentDate = DayTime(currentDate).format('DD/MM/YYYY')
            let today = new Date();
            today.setDate(today.getDate() - 7);
            let sevenDaysBack = DayTime(today).format('DD/MM/YYYY')
            newData = { ...data, ToDate: currentDate, FromDate: sevenDaysBack }
            setFloatingFilterData({ ...floatingFilterData, FromDate: sevenDaysBack, ToDate: currentDate })
        }
        else {
            newData = data
        }
        dispatch(getCostingReport(skip, take, isPagination, newData, isLastWeek, isCallApi, (res) => {

            if (res) {
                setLoader(false)
                let isReset = true
                setLoader(false)
                setTimeout(() => {
                    for (var prop in floatingFilterData) {
                        if (prop !== 'DepartmentCode' && floatingFilterData[prop] !== "") {
                            isReset = false
                        }
                    }
                    // Sets the filter model via the grid API
                    isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(filterModel))
                }, 300);

                setTimeout(() => {
                    setWarningMessage(false)
                }, 330);

                setTimeout(() => {
                    setIsFilterButtonClicked(false)
                }, 600);
            }

            if (res && isPagination === false) {  // CODE WRITTEN FOR EXCEL DOWNLOAD
                setTimeout(() => {
                    setDisableDownload(false)
                    let button = document.getElementById('Excel-Downloads')
                    button.click()
                }, 800);
            }
        }))
    }

    useEffect(() => {

        setLoader(true)
        getTableData(0, defaultPageSize, true, floatingFilterData, false, true);

    }, [])

    const onBtNext = () => {

        if ((pageSize10 && pageNo === Math.ceil(totalRecordCount / 10)) || (pageSize50 && pageNo === Math.ceil(totalRecordCount / 50)) || (pageSize100 && pageNo === Math.ceil(totalRecordCount / 100))) {
            setDisableNextButtton(true)
            return false
        }

        if (currentRowIndex < (totalRecordCount - 10)) {

            setPageNo(pageNo + 1)
            setPageNoNew(pageNo + 1)
            const nextNo = currentRowIndex + 10;

            apiCall(nextNo, true)

            setCurrentRowIndex(nextNo)
        }
    };

    const onBtPrevious = () => {
        setDisableNextButtton(false)

        if (currentRowIndex >= 10) {
            setPageNo(pageNo - 1)
            setPageNoNew(pageNo - 1)
            const previousNo = currentRowIndex - 10;
            apiCall(previousNo)
            setCurrentRowIndex(previousNo)
        }
    }

    const apiCall = (no) => {                      //COMMON FUNCTION FOR PREVIOUS & NEXT BUTTON

        if (floatingFilterData.FromDate) {
            getTableData(no, globalTake, true, floatingFilterData, true, true);
        } else {

            getTableData(no, globalTake, true, floatingFilterData, false, true);
        }
    }

    useEffect(() => {

        setReportListingDataStateArray(reportListingData)
        if (reportListingData.length > 0) {

            setTotalRecordCount(reportListingData[0].TotalRecordCount)
        }

    }, [reportListingData])

    const onFloatingFilterChanged = (value) => {
        setEnableSearchFilterButton(false)

        // Gets filter model via the grid API
        const model = gridOptions?.api?.getFilterModel();
        setFilterModel(model)
        if (!isFilterButtonClicked) {
            setWarningMessage(true)
        }

        if (value?.filterInstance?.appliedModel === null || value?.filterInstance?.appliedModel?.filter === "") {
            setWarningMessage(false)

            if (!filterClick) {
                setFloatingFilterData({ ...floatingFilterData, [value.column.colId]: "" })                                                         // DYNAMICALLY SETTING KEY:VALUE PAIRS IN OBJECT THAT WE ARE RECEIVING FROM THE FLOATING FILTER
            }

        } else {
            if (!searchButtonClicked) {
                setWarningMessage(true)
            }
            // setSearchButtonClicked(false)
            if (value.column.colId === "EffectiveDate") {
                return false
            }

            // if (value.column.colId !== "DepartmentCode" && (userDetails().Role !== 'SuperAdmin')) {    //MAY BE USED LATER
            //     setFloatingFilterData({ ...floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter, DepartmentCode: JSON.parse(localStorage.getItem('departmentList')) })
            // }
            else {
                let valueString = value?.filterInstance?.appliedModel?.filter
                if (valueString.includes("+")) {
                    valueString = encodeURIComponent(valueString)
                }
                setFloatingFilterData({ ...floatingFilterData, [value.column.colId]: valueString })
            }
        }
        filterClick = false

    }

    const onSearch = () => {
        setIsFilterButtonClicked(true)
        setWarningMessage(false)
        setPageNo(1)
        setPageNoNew(1)
        setCurrentRowIndex(0)
        gridOptions?.columnApi?.resetColumnState();
        //gridOptions?.api?.setFilterModel(null);



        // getTableData(0, 100, true, floatingFilterData, false);

        // if (floatingFilterData.DepartmentCode !== JSON.parse(localStorage.getItem('departmentList')) && (userDetails().Role !== 'SuperAdmin')) {  MAY BE USED LATER

        //     if (found !== undefined) {
        //         getTableData(0, 100, true, floatingFilterData, false, true);
        //     } else {
        //         getTableData(0, 100, true, floatingFilterData, false, false);
        //     }
        // }
        // else {
        //     getTableData(0, 100, true, floatingFilterData, false, true);

        // }
        getTableData(0, globalTake, true, floatingFilterData, false, true);
        setEnableSearchFilterButton(true)
        filterClick = true
        setSearchButtonClicked(true)
    }

    const isFirstColumn = (params) => {
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;
        return thisIsFirstColumn;
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
        headerCheckboxSelectionFilteredOnly: true,
        headerCheckboxSelection: isFirstColumn,
        checkboxSelection: isFirstColumn
    };

    const onGridReady = (params) => {

        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);

    };

    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
        if (Number(newPageSize) === 10) {
            getTableData(currentRowIndex, 10, true, floatingFilterData, false, true);
            setPageSize10(true)
            setPageSize50(false)
            setPageSize100(false)
            setDisableNextButtton(false)
            setGlobalTake(10)
            setPageNo(pageNoNew)

        }
        else if (Number(newPageSize) === 50) {
            getTableData(currentRowIndex, 50, true, floatingFilterData, false, true);
            setPageSize10(false)
            setPageSize50(true)
            setPageSize100(false)
            setGlobalTake(50)

            setPageNo(pageNoNew)
            if (pageNo >= Math.ceil(totalRecordCount / 50)) {
                setPageNo(Math.ceil(totalRecordCount / 50))
                getTableData(0, 50, true, floatingFilterData, false, true);
            }

            setTimeout(() => {
                setWarningMessage(false)
            }, 1000);
        }

        else if (Number(newPageSize) === 100) {
            getTableData(currentRowIndex, 100, true, floatingFilterData, false, true);
            setPageSize10(false)
            setPageSize50(false)
            setPageSize100(true)
            setGlobalTake(100)

            if (pageNo >= Math.ceil(totalRecordCount / 100)) {
                setPageNo(Math.ceil(totalRecordCount / 100))
                getTableData(0, 100, true, floatingFilterData, false, true);
            }

            setTimeout(() => {
                setWarningMessage(false)
            }, 1400);
        }
    };
    const frameworkComponents = {
        linkableFormatter: linkableFormatter,
        hyphenFormatter: hyphenFormatter,
        partTypeAssemblyFormatter: partTypeAssemblyFormatter,
        simulatedOnFormatter: simulatedOnFormatter,
        customNoRowsOverlay: NoContentFound,
        dateFormatter: dateFormatter,
        statusFormatter: statusFormatter,
        hyperLinkableFormatter: hyperLinkableFormatter,
        effectiveDateFormatter: effectiveDateFormatter,
        decimalInputOutputFormatter: decimalInputOutputFormatter,
        decimalPriceFormatter: decimalPriceFormatter,
        rmHyperLinkFormatter: rmHyperLinkFormatter,
        remarkFormatter: remarkFormatter
    };

    const resetState = () => {
        setIsFilterButtonClicked(false)
        gridOptions?.columnApi?.resetColumnState();
        setSearchButtonClicked(false)

        for (var prop in floatingFilterData) {
            floatingFilterData[prop] = ""
        }

        // if (userDetails().Role === 'SuperAdmin') {  MAY BE USED LATER
        //     floatingFilterData.DepartmentCode = ""
        // } else {
        //     floatingFilterData.DepartmentCode = JSON.parse(localStorage.getItem('departmentList'))
        // }

        setFloatingFilterData(floatingFilterData)
        setWarningMessage(false)
        setPageNo(1)
        setPageNoNew(1)
        setCurrentRowIndex(0)
        getTableData(0, defaultPageSize, true, floatingFilterData, false, true);
        setGlobalTake(10)
        setPageSize10(true)
        setPageSize50(false)
        setPageSize100(false)
    }

    const onRowSelect = () => {

        var selectedRows = gridApi.getSelectedRows();
        if (JSON.stringify(selectedRows) === JSON.stringify(props.Ids)) return false
        setSelectedRowData(selectedRows)

    }


    const onExcelDownload = () => {
        setDisableDownload(true)

        let tempArr = gridApi && gridApi?.getSelectedRows()
        if (tempArr?.length > 0) {
            setTimeout(() => {
                setDisableDownload(false)
                let button = document.getElementById('Excel-Downloads')
                button.click()
            }, 400);

        } else {
            getTableData(0, defaultPageSize, false, floatingFilterData, false, true); // FOR EXCEL DOWNLOAD OF COMPLETE DATA
        }

    }


    const renderColumn = (fileName) => {

        let tempArr = []
        tempArr = gridApi && gridApi?.getSelectedRows()
        tempArr = (tempArr && tempArr.length > 0) ? tempArr : (allReportListingData ? allReportListingData : [])

        return returnExcelColumn(REPORT_DOWNLOAD_EXCEl, tempArr)
    }

    const returnExcelColumn = (data = [], TempData) => {
        return (<ExcelSheet data={TempData} name={ReportMaster}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} />)}
        </ExcelSheet>);
    }

    /**
    * @method onSubmit
    * @description filtering data on Apply button
    */
    const onSubmit = (values) => {
        const tempPartNo = getValues('partNo') ? getValues('partNo').value : '00000000-0000-0000-0000-000000000000'
        const tempcreatedBy = getValues('createdBy') ? getValues('createdBy').value : '00000000-0000-0000-0000-000000000000'
        const tempRequestedBy = getValues('requestedBy') ? getValues('requestedBy').value : '00000000-0000-0000-0000-000000000000'
        const tempStatus = getValues('status') ? getValues('status').value : '00000000-0000-0000-0000-000000000000'
        // const type_of_costing = 
        getTableData(tempPartNo, tempcreatedBy, tempRequestedBy, tempStatus)
    }

    return (
        <div className="container-fluid custom-pagination report-listing-page ag-grid-react">
            {isLoader && <LoaderCustom />}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>

                <h1 className="mb-0">Costing Details</h1>

                <Row className="pt-4 mt-1 blue-before">
                    {/* <Col md="3">
                        <button title="Last Week" type="button" class="user-btn mr5" onClick={() => lastWeekFilter()}><div class="swap rotate90 mr-2"></div>Last Week</button>
                    </Col> */}
                    <Col md="12" lg="12" className="search-user-block mb-3">
                        <div className="d-flex justify-content-end bd-highlight excel-btn w100 mb-4 pb-2">
                            <div className="warning-message d-flex align-items-center">
                                {warningMessage && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                            </div>
                            <button disabled={enableSearchFilterSearchButton} title="Filtered data" type="button" class="user-btn mr5" onClick={() => onSearch()}><div class="filter mr-0"></div></button>
                            <button type="button" className="user-btn mr5" title="Reset Grid" onClick={() => resetState()}>
                                <div className="refresh mr-0"></div>
                            </button>

                            {disableDownload ? <div className='p-relative mr5'> <LoaderCustom customClass={"download-loader"} /> <button type="button" className={'user-btn'}><div className="download mr-0"></div>
                            </button></div> :

                                <>
                                    <button type="button" onClick={onExcelDownload} className={'user-btn mr5'}><div className="download mr-0" title="Download"></div>
                                        {/* DOWNLOAD */}
                                    </button>

                                    <ExcelFile filename={'ReportMaster'} fileExtension={'.xls'} element={
                                        <button id={'Excel-Downloads'} type="button" className='p-absolute right-22'>
                                        </button>}>
                                        {renderColumn(ReportMaster)}
                                    </ExcelFile>

                                </>

                            }

                        </div>

                    </Col>
                </Row>
            </form>

            <div className={`ag-grid-wrapper height-width-wrapper  ${reportListingDataStateArray && reportListingDataStateArray?.length <= 0 ? "overlay-contain" : ""}`}>
                <div className={`ag-theme-material mt-2 ${isLoader && "max-loader-height"}`}>
                    <AgGridReact
                        style={{ height: '100%', width: '100%' }}
                        domLayout="autoHeight"
                        defaultColDef={defaultColDef}
                        floatingFilter={true}
                        rowData={reportListingData}
                        pagination={true}
                        onFilterModified={onFloatingFilterChanged}
                        paginationPageSize={globalTake}
                        onGridReady={onGridReady}
                        gridOptions={gridOptions}
                        noRowsOverlayComponent={'customNoRowsOverlay'}
                        noRowsOverlayComponentParams={{
                            title: EMPTY_DATA,
                            imagClass: 'imagClass'
                        }}
                        suppressRowClickSelection={true}
                        rowSelection={'multiple'}
                        frameworkComponents={frameworkComponents}
                        onSelectionChanged={onRowSelect}
                    >

                        <AgGridColumn field="CostingNumber" headerName="Costing Version" cellRenderer={'hyperLinkableFormatter'}></AgGridColumn>
                        <AgGridColumn field="TechnologyName" headerName="Technology" cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='VendorName' headerName='Vendor' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='VendorCode' headerName='Vendor(Code)' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='PlantName' headerName='Plant' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='PlantCode' headerName='Plant(Code)' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='PartNumber' headerName='Part Number' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='PartName' headerName='Part Name' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='ECNNumber' headerName='ECN Number' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='PartType' headerName='Part Type' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='DepartmentCode' headerName='Purchase Group Code' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='DepartmentName' headerName='Purchase Group' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='RevisionNumber' headerName='Revision Number' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='RawMaterialCode' headerName='RM Code' cellRenderer='partTypeAssemblyFormatter'></AgGridColumn>
                        <AgGridColumn field='RawMaterialName' headerName='RM Name' cellRenderer='partTypeAssemblyFormatter'></AgGridColumn>
                        <AgGridColumn field='RawMaterialGrade' headerName='RM Grade' cellRenderer='partTypeAssemblyFormatter'></AgGridColumn>
                        <AgGridColumn field='RawMaterialSpecification' headerName='RM Specs' cellRenderer='partTypeAssemblyFormatter'></AgGridColumn>
                        <AgGridColumn field='RawMaterialRate' headerName='RM Rate' cellRenderer='partTypeAssemblyFormatter'></AgGridColumn>
                        <AgGridColumn field='RawMaterialScrapWeight' headerName='Scrap Weight' cellRenderer='decimalInputOutputFormatter'></AgGridColumn>
                        <AgGridColumn field='RawMaterialGrossWeight' headerName='Gross Weight' cellRenderer='decimalInputOutputFormatter'></AgGridColumn>
                        <AgGridColumn field='RawMaterialFinishWeight' headerName='Finish Weight' cellRenderer='decimalInputOutputFormatter'></AgGridColumn>
                        <AgGridColumn field='NetRawMaterialsCost' headerName='Net RM Cost' cellRenderer='rmHyperLinkFormatter'></AgGridColumn>
                        <AgGridColumn field='RawMaterialRemark' headerName='RM Remark' cellRenderer='remarkFormatter'></AgGridColumn>
                        <AgGridColumn field='NetBoughtOutPartCost' headerName='Net BOP Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='NetProcessCost' headerName='Net Process Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='NetOperationCost' headerName='Net Operation Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='NetConversionCost' headerName='Net Conversion Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='SurfaceTreatmentCost' headerName='Surface Treatment Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='TransportationCost' headerName='Extra Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='NetSurfaceTreatmentCost' headerName='Net Surface Treatment Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='ModelTypeForOverheadAndProfit' headerName='Model Type' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='OverheadApplicability' headerName='Overhead Applicability' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='OverheadPercentage' headerName='Overhead Percentage(Overall)' cellRenderer='decimalInputOutputFormatter'></AgGridColumn>
                        <AgGridColumn field='OverheadCombinedCost' headerName='Overhead Combined Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='ProfitApplicability' headerName='Profit Applicability' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='ProfitPercentage' headerName='Profit Percentage(Overall)' cellRenderer='decimalInputOutputFormatter'></AgGridColumn>
                        <AgGridColumn field='ProfitCost' headerName='Profit Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='NetOverheadAndProfitCost' headerName='Net Overhead And Profit Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='RejectionApplicability' headerName='Rejection Applicability' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='RejectionPercentage' headerName='Rejection Percentage' cellRenderer='decimalInputOutputFormatter'></AgGridColumn>
                        <AgGridColumn field='RejectionCost' headerName='Rejection Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='ICCApplicability' headerName='ICC Applicability' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='ICCInterestRate' headerName='ICC Interest Rate' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='NetICCCost' headerName='Net ICC Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='PaymentTermsOn' headerName='Payment Terms On' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='PaymentTermCost' headerName='Payment Term Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='PackagingCostPercentage' headerName='Packaging Cost Percentage' cellRenderer='decimalInputOutputFormatter'></AgGridColumn>
                        <AgGridColumn field='PackagingCost' headerName='Packaging Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='FreightPercentage' headerName='Freight Percentage' cellRenderer='decimalInputOutputFormatter'></AgGridColumn>
                        <AgGridColumn field='FreightCost' headerName='Freight Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='FreightType' headerName='Freight Type' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='ToolCost' headerName='Tool Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='ToolLife' headerName='Amortization Quantity (Tool Life)' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='ToolMaintenanceCost' headerName='Tool Maintenance Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='NetToolCost' headerName='Net Tool Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='HundiOrDiscountPercentage' headerName='Hundi/Discount Percentage' cellRenderer='decimalInputOutputFormatter'></AgGridColumn>
                        <AgGridColumn field='HundiOrDiscountValue' headerName='Hundi/Discount Value' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='OtherCostPercentage' headerName='Other Cost Percentage' cellRenderer='decimalInputOutputFormatter'></AgGridColumn>
                        <AgGridColumn field='AnyOtherCost' headerName='Any Other Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='EffectiveDate' headerName='Effective Date' cellRenderer='effectiveDateFormatter' filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                        <AgGridColumn field='Currency' headerName='Currency' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='NetPOPriceOtherCurrency' headerName='Net PO Price Other Currency' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='NetPOPriceINR' headerName='Net PO Price (INR)' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='Remark' headerName='Remark' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn width={"240px"} pinned="right" field="DisplayStatus" headerName="Status" cellRenderer={'statusFormatter'}></AgGridColumn>

                    </AgGridReact>
                    <div className='button-wrapper'>
                        {!isLoader && <PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={globalTake} />}
                        <div className="d-flex pagination-button-container">
                            <p><button className="previous-btn" type="button" disabled={false} onClick={() => onBtPrevious()}> </button></p>
                            {pageSize10 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 10)}</p>}
                            {pageSize50 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 50)}</p>}
                            {pageSize100 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 100)}</p>}
                            <p><button className="next-btn" type="button" disabled={disableNextButtton} onClick={() => onBtNext()}> </button></p>
                        </div>

                    </div>
                </div>
            </div>
            {
                isOpen &&
                <CostingDetailSimulationDrawer
                    isOpen={isOpen}
                    closeDrawer={closeUserDetails}
                    anchor={"right"}
                    isSummaryDrawer={isOpen}
                    selectedRowData={selectedRowData}
                    isSimulation={false}
                    simulationMode={false}
                    simulationDrawer={false}
                    isReportLoader={isReportLoader}
                />
            }
            {isViewRM && <ViewRM
                isOpen={isViewRM}
                viewRMData={viewRMData}
                closeDrawer={closeUserDetails}
                isAssemblyCosting={isAssemblyCosting}
                anchor={'right'}
                technologyId={viewCostingData[0].technologyId}
                rmMBDetail={rmMBDetail}
                index={0}
            />}
        </div >
    );
}

export default ReportListing