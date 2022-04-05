
import React, { useState, useEffect, Fragment } from 'react'
import DayTime from '../../common/DayTimeWrapper'
import { Row, Col } from 'reactstrap'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { loggedInUserId, } from '../../../helper/auth'
import NoContentFound from '../../common/NoContentFound'
import { REPORT_DOWNLOAD_EXCEl, REPORT_DOWNLOAD_SAP_EXCEl } from '../../../config/masterData';
import { getSingleCostingDetails, setCostingViewData } from '../../costing/actions/Costing'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import ReactExport from 'react-export-excel';
import { ReportMaster, ReportSAPMaster, EMPTY_DATA } from '../../../config/constants';
import LoaderCustom from '../../common/LoaderCustom';
import WarningMessage from '../../common/WarningMessage'
import CostingDetailSimulationDrawer from '../../simulation/components/CostingDetailSimulationDrawer'
import { formViewData, checkForDecimalAndNull } from '../../../helper'
import { getCostingReport } from '.././actions/ReportListing'



const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};



function ReportListing(props) {

    const [selectedRowData, setSelectedRowData] = useState([]);
    const [selectedIds, setSelectedIds] = useState(props.Ids);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [rowData, setRowData] = useState(null);
    const [createDate, setCreateDate] = useState(Date);
    const [costingVersionChange, setCostingVersion] = useState('');
    const [tableData, setTableData] = useState([])
    const [isLoader, setLoader] = useState(true)
    const [isOpen, setIsOpen] = useState(false)
    const [userId, setUserId] = useState(false)
    const [warningMessage, setWarningMessage] = useState(true)
    const [totalRecordCount, setTotalRecordCount] = useState(0)
    const [pageSize10, setPageSize10] = useState(true)
    const [pageSize50, setPageSize50] = useState(false)
    const [pageSize100, setPageSize100] = useState(false)
    const [pageNo, setPageNo] = useState(1)
    const [currentRowIndex, setCurrentRowIndex] = useState(0)
    const [floatingFilterData, setFloatingFilterData] = useState({ CostingNumber: "", TechnologyName: "", AmorizationQuantity: "", AnyOtherCost: "", CostingVersion: "", DisplayStatus: "", EffectiveDate: "", Currency: "", DepartmentCode: "", DepartmentName: "", DiscountCost: "", ECNNumber: "", FinalPOPrice: "", RawMaterialFinishWeight: "", FreightCost: "", FreightPercentage: "", FreightType: "", GrossWeight: "", HundiOrDiscountValue: "", ICCApplicability: "", ICCCost: "", ICCInterestRate: "", ICCOn: "", MasterBatchTotal: "", ModelTypeForOverheadAndProfit: "", ModifiedByName: "", ModifiedByUserName: "", ModifiedDate: "", NetBoughtOutPartCost: "", NetConversionCost: "", NetConvertedPOPrice: "", NetDiscountsCost: "", NetFreightPackaging: "", NetFreightPackagingCost: "", NetICCCost: "", NetOperationCost: "", NetOtherCost: "", NetOverheadAndProfitCost: "", NetPOPrice: "", NetPOPriceINR: "", NetPOPriceInCurrency: "", NetPOPriceOtherCurrency: "", NetProcessCost: "", NetRawMaterialsCost: "", NetSurfaceTreatmentCost: "", NetToolCost: "", NetTotalRMBOPCC: "", OtherCost: "", OtherCostPercentage: "", OverheadApplicability: "", OverheadCombinedCost: "", OverheadCost: "", OverheadOn: "", OverheadPercentage: "", PackagingCost: "", PackagingCostPercentage: "", PartName: "", PartNumber: "", PartType: "", PaymentTermCost: "", PaymentTermsOn: "", PlantCode: "", PlantName: "", ProfitApplicability: "", ProfitCost: "", ProfitOn: "", ProfitPercentage: "", RMGrade: "", RMSpecification: "", RawMaterialCode: "", RawMaterialGrossWeight: "", RawMaterialName: "", RawMaterialRate: "", RawMaterialScrapWeight: "", RawMaterialSpecification: "", RecordInsertedBy: "", RejectOn: "", RejectionApplicability: "", RejectionCost: "", RejectionPercentage: "", Remark: "", Rev: "", RevisionNumber: "", ScrapRate: "", ScrapWeight: "", SurfaceTreatmentCost: "", ToolCost: "", ToolLife: "", ToolMaintenaceCost: "", ToolPrice: "", ToolQuantity: "", TotalCost: "", TotalOtherCost: "", TotalRecordCount: "", TransportationCost: "", VendorCode: "", VendorName: "", Version: "", RawMaterialGrade: "", HundiOrDiscountPercentage: "", FromDate: "", ToDate: "" })
    const [enableSearchFilterSearchButton, setEnableSearchFilterButton] = useState(true)
    const [reportListingDataStateArray, setReportListingDataStateArray] = useState([])

    let filterClick = false

    const dispatch = useDispatch()

    const { handleSubmit, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    let reportListingData = useSelector((state) => state.report.reportListing)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)



    const simulatedOnFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        //return cell != null ? moment(cell).format('DD/MM/YYYY hh:mm A') : '';
        return cellValue != null ? cellValue : '';
    }


    const createDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        setCreateDate(cellValue)
    }

    const linkableFormatter = (props) => {
        let tempDate = props.data.CreatedDate
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        let temp = `${DayTime(tempDate).format('DD/MM/YYYY')}-${cellValue}`
        setCostingVersion(temp);
        return temp
    }


    // @method hyperLinkFormatter( This function will make the first column details into hyperlink )

    const hyperLinkableFormatter = (props) => {

        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                <div
                    onClick={() => viewDetails(row.UserId, cell, row)}
                    className={'link'}
                >{cell}</div>
            </>
        )
    }


    const viewDetails = (UserId, cell, row) => {

        if (row.BaseCostingId && Object.keys(row.BaseCostingId).length > 0) {
            dispatch(getSingleCostingDetails(row.BaseCostingId, (res) => {
                if (res.data.Data) {
                    let dataFromAPI = res.data.Data

                    const tempObj = formViewData(dataFromAPI)
                    dispatch(setCostingViewData(tempObj))
                }
            },
            ))
        }

        setIsOpen(true)
        setUserId(UserId)

    }

    const closeUserDetails = () => {
        setIsOpen(false)
        setUserId("")

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
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return <div className={cell}>{row.DisplayStatus}</div>
    }

    /**
   * @method getTableData
   * @description getting approval list table
   */

    const getTableData = (skip, take, isPagination, data, isLastWeek) => {

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
        dispatch(getCostingReport(skip, take, isPagination, newData, isLastWeek, (res) => {
            if (res) {
                setLoader(false)
            }

        }))
    }

    useEffect(() => {

        setLoader(true)
        getTableData(0, 100, true, floatingFilterData, false);

    }, [])

    const onBtNext = () => {

        if (currentRowIndex < (totalRecordCount - 10)) {

            setPageNo(pageNo + 1)
            const nextNo = currentRowIndex + 10;

            apiCall(nextNo, true)

            setCurrentRowIndex(nextNo)
        }

    };

    const onBtPrevious = () => {

        if (currentRowIndex >= 10) {

            setPageNo(pageNo - 1)
            const previousNo = currentRowIndex - 10;

            apiCall(previousNo)

            setCurrentRowIndex(previousNo)

        }
    }

    const apiCall = (no) => {                      //COMMON FUNCTION FOR PREVIOUS & NEXT BUTTON

        if (floatingFilterData.FromDate) {
            getTableData(no, 100, true, floatingFilterData, true);
        } else {

            getTableData(no, 100, true, floatingFilterData, false);
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
        setWarningMessage(true)

        if (value?.filterInstance?.appliedModel === null || value?.filterInstance?.appliedModel?.filter === "") {
            setWarningMessage(false)

            if (!filterClick) {

                setFloatingFilterData({ ...floatingFilterData, [value.column.colId]: "" })                                                         // DYNAMICALLY SETTING KEY:VALUE PAIRS IN OBJECT THAT WE ARE RECEIVING FROM THE FLOATING FILTER
            }

        } else {

            setFloatingFilterData({ ...floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter })
        }
        filterClick = false

    }


    const onSearch = () => {

        setWarningMessage(false)
        setPageNo(1)
        setCurrentRowIndex(0)
        gridOptions?.columnApi?.resetColumnState();
        gridOptions?.api?.setFilterModel(null);
        getTableData(0, 100, true, floatingFilterData, false);
        setEnableSearchFilterButton(true)
        filterClick = true
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
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));


        if (Number(newPageSize) === 10) {
            setPageSize10(true)
            setPageSize50(false)
            setPageSize100(false)

        }
        else if (Number(newPageSize) === 50) {
            setPageSize10(false)
            setPageSize50(true)
            setPageSize100(false)
        }

        else if (Number(newPageSize) === 100) {
            setPageSize10(false)
            setPageSize50(false)
            setPageSize100(true)
        }

    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }
    useEffect(() => {

    }, [tableData])


    const frameworkComponents = {

        linkableFormatter: linkableFormatter,
        createDateFormatter: createDateFormatter,
        hyphenFormatter: hyphenFormatter,
        simulatedOnFormatter: simulatedOnFormatter,
        customNoRowsOverlay: NoContentFound,
        dateFormatter: dateFormatter,
        statusFormatter: statusFormatter,
        //customLoadingOverlay: LoaderCustom
        hyperLinkableFormatter: hyperLinkableFormatter,
        effectiveDateFormatter: effectiveDateFormatter,
        decimalInputOutputFormatter: decimalInputOutputFormatter,
        decimalPriceFormatter: decimalPriceFormatter

    };



    const resetState = () => {
        gridOptions?.columnApi?.resetColumnState();
        gridOptions?.api?.setFilterModel(null);

        for (var prop in floatingFilterData) {
            floatingFilterData[prop] = ""
        }

        setFloatingFilterData(floatingFilterData)
        setWarningMessage(false)
        setPageNo(1)
        setCurrentRowIndex(0)
        getTableData(0, 100, true, floatingFilterData, false);
    }

    const onRowSelect = () => {

        var selectedRows = gridApi.getSelectedRows();
        if (JSON.stringify(selectedRows) === JSON.stringify(selectedIds)) return false
        var selected = gridApi.getSelectedNodes()
        setSelectedRowData(selectedRows)

    }

    const renderColumn = (fileName) => {

        let tempData
        if (selectedRowData.length == 0) {
            tempData = reportListingData
        }
        else {
            tempData = selectedRowData
        }
        return returnExcelColumn(REPORT_DOWNLOAD_EXCEl, tempData)

    }

    const returnExcelColumn = (data = [], TempData) => {
        return (<ExcelSheet data={TempData} name={ReportMaster}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} />)}
        </ExcelSheet>);
    }

    const renderColumnSAP = (fileName) => {
        let tempData = []

        if (selectedRowData.length === 0) {
            tempData = reportListingData
        }
        else {
            tempData = selectedRowData
        }
        return returnExcelColumnSAP(REPORT_DOWNLOAD_SAP_EXCEl, tempData)


    }


    const renderColumnSAPEncoded = (fileName) => {

        let tempData = []

        if (selectedRowData.length === 0) {


            tempData = reportListingData

        }
        else {
            tempData = selectedRowData

        }
        return returnExcelColumnSAPEncoded(REPORT_DOWNLOAD_SAP_EXCEl, tempData)


    }




    const returnExcelColumnSAP = (data = [], TempData) => {

        // 
        let temp = []

        return (<ExcelSheet data={TempData} name={ReportSAPMaster}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} />)}
        </ExcelSheet>);
    }


    const returnExcelColumnSAPEncoded = (data = [], TempData) => {

        // 
        let temp = []



        TempData && TempData.map(item => {

            temp.push({ SrNo: btoa(item.SrNo), SANumber: btoa(item.SANumber), LineNumber: btoa(item.LineNumber), CreatedDate: btoa(item.CreatedDate), NetPOPrice: btoa(item.NetPOPrice), Reason: btoa(item.Reason), Text: btoa(item.Text), PersonRequestingChange: btoa(item.PersonRequestingChange) })
            return null;
        });




        return (<ExcelSheet data={temp} name={ReportSAPMaster}>
            {data && data.map((ele, index) => < ExcelColumn key={index} label={ele.label} value={ele.value} />)}
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

    const lastWeekFilter = () => {

        setPageNo(1)
        setCurrentRowIndex(0)
        getTableData(0, 100, true, floatingFilterData, true);
    }
    return (
        <div className="container-fluid report-listing-page ag-grid-react">
            {isLoader && <LoaderCustom />}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>

                <h1 className="mb-0">Report</h1>

                <Row className="pt-3 blue-before ">
                    <Col md="3">
                        <button title="Last Week" type="button" class="user-btn mr5" onClick={() => lastWeekFilter()}><div class="swap rotate90 mr-2"></div>Last Week</button>
                    </Col>
                    <Col md="9" lg="9" className="search-user-block mb-3">
                        <div className="d-flex justify-content-end bd-highlight excel-btn w100 mb-4 pb-2">
                            <div className="warning-message d-flex align-items-center">
                                {warningMessage && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                            </div>
                            <div>
                                <ExcelFile filename={ReportMaster} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div>DOWNLOAD</button>}>
                                    {renderColumn(ReportMaster)}
                                </ExcelFile>
                                <ExcelFile filename={ReportSAPMaster} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div>SAP Excel Download</button>}>
                                    {renderColumnSAP(ReportSAPMaster)}
                                </ExcelFile>

                                <ExcelFile filename={ReportSAPMaster} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div>Encoded Download</button>}>
                                    {renderColumnSAPEncoded(ReportSAPMaster)}
                                </ExcelFile>


                            </div>
                        </div>

                    </Col>
                </Row>
            </form>


            <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                <div className="ag-grid-header">
                    <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Filter..." onChange={(e) => onFilterTextBoxChanged(e)} />
                </div>
                <div className="ag-theme-material" >
                    <AgGridReact
                        style={{ height: '100%', width: '100%' }}
                        domLayout="autoHeight"
                        defaultColDef={defaultColDef}
                        floatingFilter={true}
                        // columnDefs={c}
                        rowData={reportListingData}
                        pagination={true}
                        onFilterModified={onFloatingFilterChanged}
                        paginationPageSize={10}
                        onGridReady={onGridReady}
                        gridOptions={gridOptions}
                        loadingOverlayComponent={'customLoadingOverlay'}
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
                        <AgGridColumn field='PartName' headerName='Part' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='PartNumber' headerName='Part Number' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='ECNNumber' headerName='ECN Number' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='PartType' headerName='Part Type' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='DepartmentCode' headerName='Department Code' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='DepartmentName' headerName='Department Name' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='RevisionNumber' headerName='Revision Number' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='RawMaterialCode' headerName='RM Code' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='RawMaterialName' headerName='RM Name' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='RawMaterialGrade' headerName='RM Grade' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='RawMaterialSpecification' headerName='RM Specs' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='RawMaterialRate' headerName='RM Rate' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='RawMaterialScrapWeight' headerName='Scrap Weight' cellRenderer='decimalInputOutputFormatter'></AgGridColumn>
                        <AgGridColumn field='RawMaterialGrossWeight' headerName='Gross Weight' cellRenderer='decimalInputOutputFormatter'></AgGridColumn>
                        {/* <AgGridColumn field='GrossWeight' headerName='Gross Weight' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        <AgGridColumn field='RawMaterialFinishWeight' headerName='Finish Weight' cellRenderer='decimalInputOutputFormatter'></AgGridColumn>
                        <AgGridColumn field='NetRawMaterialsCost' headerName='Net RM Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='NetBoughtOutPartCost' headerName='Net BOP Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='NetProcessCost' headerName='Net Process Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='NetOperationCost' headerName='Net Operation Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='NetConversionCost' headerName='Net Conversion Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='SurfaceTreatmentCost' headerName='Surface Treatment Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='NetSurfaceTreatmentCost' headerName='Net Surface Treatment Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='ModelTypeForOverheadAndProfit' headerName='Model Type' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='OverheadApplicability' headerName='Overhead Applicability' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='OverheadPercentage' headerName='Overhead Percentage' cellRenderer='decimalInputOutputFormatter'></AgGridColumn>
                        <AgGridColumn field='OverheadCombinedCost' headerName='Overhead Combined Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        {/* <AgGridColumn field='OverheadOn' headerName='Overhead On' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        <AgGridColumn field='ProfitApplicability' headerName='Profit Applicability' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='ProfitPercentage' headerName='Profit Percentage' cellRenderer='decimalInputOutputFormatter'></AgGridColumn>
                        <AgGridColumn field='ProfitCost' headerName='Profit Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        {/* <AgGridColumn field='ProfitOn' headerName='Profit On' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        <AgGridColumn field='NetOverheadAndProfitCost' headerName='Net Overhead And Profit Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='RejectionApplicability' headerName='Rejection Applicability' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='RejectionPercentage' headerName='Rejection Percentage' cellRenderer='decimalInputOutputFormatter'></AgGridColumn>
                        <AgGridColumn field='RejectionCost' headerName='Rejection Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        {/* <AgGridColumn field='RejectOn' headerName='Reject On' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        <AgGridColumn field='ICCApplicability' headerName='ICC Applicability' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='ICCInterestRate' headerName='ICC Interest Rate' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        {/* <AgGridColumn field='ICCOn' headerName='ICC On' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        <AgGridColumn field='NetICCCost' headerName='Net ICC Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='PaymentTermsOn' headerName='Payment Terms On' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='PaymentTermCost' headerName='Payment Term Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='PackagingCostPercentage' headerName='Packaging Cost Percentage' cellRenderer='decimalInputOutputFormatter'></AgGridColumn>
                        <AgGridColumn field='PackagingCost' headerName='Packaging Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='FreightPercentage' headerName='Freight Percentage' cellRenderer='decimalInputOutputFormatter'></AgGridColumn>
                        <AgGridColumn field='FreightCost' headerName='Freight Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='TransportationCost' headerName='Transportation Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='FreightType' headerName='Freight Type' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='HundiOrDiscountPercentage' headerName='Hundi/Discount Percentage' cellRenderer='decimalInputOutputFormatter'></AgGridColumn>
                        <AgGridColumn field='HundiOrDiscountValue' headerName='Hundi/Discount Value' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='ToolCost' headerName='Tool Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='ToolLife' headerName='Amortization Quantity (Tool Life)' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='ToolMaintenanceCost' headerName='Tool Maintenance Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        {/* <AgGridColumn field='ToolPrice' headerName='Tool Price' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        {/* <AgGridColumn field='ToolQuantity' headerName='Tool Quantity' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        <AgGridColumn field='NetToolCost' headerName='Net Tool Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='OtherCostPercentage' headerName='Other Cost Percentage' cellRenderer='decimalInputOutputFormatter'></AgGridColumn>
                        <AgGridColumn field='AnyOtherCost' headerName='Any Other Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='OtherCost' headerName='Other Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='NetOtherCost' headerName='Net Other Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='TotalOtherCost' headerName='Total Other Cost' cellRenderer='decimalPriceFormatter'></AgGridColumn>
                        <AgGridColumn field='EffectiveDate' headerName='Effective Date' cellRenderer='effectiveDateFormatter'></AgGridColumn>
                        <AgGridColumn field='Currency' headerName='Currency' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='NetPOPriceOtherCurrency' headerName='Net PO Price Other Currency' cellRenderer='hyphenFormatter'></AgGridColumn>
                        {/* <AgGridColumn field='NetPOPrice' headerName='Net PO Price' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        <AgGridColumn field='NetPOPriceINR' headerName='Net PO Price (INR)' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='Remark' headerName='Remark' cellRenderer='hyphenFormatter'></AgGridColumn>
                        {/* <AgGridColumn field='BaseCostingId' headerName='BaseCostingId' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        {/* <AgGridColumn field='CreatedBy' headerName='CreatedBy' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='CreatedByName' headerName='CreatedByName' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='CreatedByUserName' headerName='CreatedByUserName' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        {/* <AgGridColumn field='CreatedDate' headerName='CreatedDate' cellRenderer='effectiveDateFormatter'></AgGridColumn> */}
                        {/* <AgGridColumn field='DisplayStatus' headerName='DisplayStatus' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        {/* <AgGridColumn field='ECN' headerName='ECN' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        {/* <AgGridColumn field='IsActive' headerName='IsActive' cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field='IsDeleted' headerName='IsDeleted' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        {/* <AgGridColumn field='Rev' headerName='Rev' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        {/* <AgGridColumn field='Status' headerName='Status' cellRenderer='hyphenFormatter'></AgGridColumn> */}
                        <AgGridColumn field="LineNumber" headerName="Line Number" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="SANumber" headerName="SANumber" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="CreatedBy" headerName="CreatedBy" cellRenderer={'hyphenFormatter'}></AgGridColumn>

                        <AgGridColumn pinned="right" field="Status" headerName="Status" cellRenderer={'statusFormatter'}></AgGridColumn>
                    </AgGridReact>
                    <div className="paging-container d-inline-block float-right">
                        <select className="form-control paging-dropdown" onChange={(e) => onPageSizeChanged(e.target.value)} id="page-size">
                            <option value="10" selected={true}>10</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div className="d-flex pagination-button-container">
                        <p><button className="previous-btn" type="button" disabled={false} onClick={() => onBtPrevious()}> </button></p>
                        {pageSize10 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 10)}</p>}
                        {pageSize50 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 50)}</p>}
                        {pageSize100 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 100)}</p>}
                        <p><button className="next-btn" type="button" onClick={() => onBtNext()}> </button></p>
                    </div>

                </div>
            </div>


            {
                isOpen &&
                <CostingDetailSimulationDrawer
                    isOpen={isOpen}
                    closeDrawer={closeUserDetails}
                    anchor={"right"}
                    isReport={isOpen}
                    selectedRowData={selectedRowData}
                    isSimulation={true}
                />
            }


        </div>
    );
}



export default ReportListing

