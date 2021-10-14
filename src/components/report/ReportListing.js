import React, { useState, useEffect, Fragment } from 'react'
import moment from 'moment'
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col } from 'reactstrap'
import { SearchableSelectHookForm } from '../layout/HookFormInputs'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import { useDispatch, useSelector } from 'react-redux'
import { loggedInUserId, userDetails } from '../../helper/auth'
import { Badge } from 'reactstrap'
import NoContentFound from '../common/NoContentFound'
import { CONSTANT } from '../../helper/AllConastant'
import { REPORT_DOWNLOAD_EXCEl, REPORT_DOWNLOAD_SAP_EXCEl } from '../../config/masterData';
import { GridTotalFormate } from '../common/TableGridFunctions'
import { getReportListing } from '../report/actions/ReportListing'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import ReactExport from 'react-export-excel';
import { CREATED_BY_ASSEMBLY, DRAFT, ReportMaster, ReportSAPMaster } from '../../config/constants';
import LoaderCustom from '../common/LoaderCustom';
import { table } from 'react-dom-factories';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

function ReportListing(props) {

    const loggedUser = loggedInUserId()


    const [selectedRowData, setSelectedRowData] = useState([]);
    const [selectedIds, setSelectedIds] = useState(props.Ids);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [rowData, setRowData] = useState(null);
    const [createDate, setCreateDate] = useState(Date);
    const [costingVersionChange, setCostingVersion] = useState('');
    const [tableData, setTableData] = useState([])
    const [isLoader, setLoader] = useState(true)
    const dispatch = useDispatch()

    const { register, handleSubmit, control, setValue, formState: { errors }, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const partSelectList = useSelector((state) => state.costing.partSelectList)
    const reportListingData = useSelector((state) => state.report.reportListing)
    const statusSelectList = useSelector((state) => state.approval.costingStatusList)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const approvalList = useSelector(state => state.approval.approvalList)

    const userList = useSelector(state => state.auth.userList)
    // const { bopDrawerList } = useSelector(state => state.costing)



    const simulatedOnFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        //return cell != null ? moment(cell).format('DD/MM/YYYY hh:mm A') : '';
        return cellValue != null ? cellValue : '';
    }

    const approvedOnFormatter = (cell, row, enumObject, rowIndex) => {
        //   return cell != null ? moment(cell).format('DD/MM/YYYY hh:mm A') : '';
        return cell != null ? cell : '';
    }

    const createDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        setCreateDate(cellValue)
    }

    const linkableFormatter = (props) => {
        let tempDate = props.data.CreatedDate
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        let temp = `${moment(tempDate).format('DD/MM/YYYY')}-${cellValue}`
        setCostingVersion(temp);
        return temp
    }

    const dateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        let temp = moment(cellValue).format('DD/MM/YYYY h:m:s')
        return temp
    }

    /**
    * @method hyphenFormatter
    */
    const hyphenFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value ? props.value : '-';
        return cell
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

    const getTableData = () => {
        const filterData = {
            costingNumber: "",
            toDate: null,
            fromDate: null,
            statusId: null,
            technologyId: null,
            plantCode: "",
            vendorCode: "",
            userId: loggedUser,
            isSortByOrderAsc: true,
        }
        var t0 = performance.now();
        // console.log('t0: ', t0);
        dispatch(getReportListing(filterData, (res) => {
            //  props.getReportListing();   // <---- The function you're measuring time for 


            setLoader(false)

            // var t1 = performance.now();
            // console.log("Call to doSomething took " + (t1 - t0) + " milliseconds.");
        }))

    }


    useEffect(() => {
        getTableData();
    }, [])




    const renderPaginationShowsTotal = (start, to, total) => {
        return <GridTotalFormate start={start} to={to} total={total} />
    }

    const options = {
        clearSearch: true,
        noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
        paginationShowsTotal: renderPaginationShowsTotal(),
        prePage: <span className="prev-page-pg"></span>, // Previous page button text
        nextPage: <span className="next-page-pg"></span>, // Next page button text
        firstPage: <span className="first-page-pg"></span>, // First page button text
        lastPage: <span className="last-page-pg"></span>,
        //exportCSVText: 'Download Excel',
        //onExportToCSV: this.onExportToCSV,
        //paginationShowsTotal: true,
        //paginationShowsTotal: this.renderPaginationShowsTotal,
    }

    const renderDropdownListing = (label) => {
        const tempDropdownList = []

        if (label === 'PartList') {
            partSelectList &&
                partSelectList.map((item) => {
                    if (item.Value === '0') return false
                    tempDropdownList.push({ label: item.Text, value: item.Value })
                    return null
                })

            return tempDropdownList
        }

        if (label === 'Status') {
            statusSelectList &&
                statusSelectList.map((item) => {
                    if (item.Value === '0') return false
                    tempDropdownList.push({ label: item.Text, value: item.Value })
                    return null
                })
            return tempDropdownList
        }
        if (label === 'users') {
            userList && userList.map((item) => {
                if (item.Value === '0') return false
                tempDropdownList.push({ label: item.Text, value: item.Value })
                return null
            })
            return tempDropdownList
        }
    }

    const isFirstColumn = (params) => {
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;

        return thisIsFirstColumn;
    }


    const revisionFormatter = (props) => {

        const cell = props?.valueFormatted ? props.valueFormatted : props?.value ? props.value : '-';

        return cell
        // return params.value !== null ? params.value : '-'
    }
    const requestterFormatter = (props) => {

        return userDetails().Name
        // return params.value !== null ? params.value : '-'
    }

    const onGridReady = (params) => {
        // this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
        // getDataList()
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


    // const renderColumn = (fileName) => {
    //     return returnExcelColumn(CONSTANT.REPORT_DOWNLOAD_EXCEL, reportListingData)
    // }


    /**
    * @method resetHandler
    * @description Reseting all filter
    */
    const resetHandler = () => {
        setValue('partNo', '')
        setValue('createdBy', '')
        setValue('requestedBy', '')
        setValue('status', '')
        getTableData()
    }

    const resetState = () => {
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);
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
        // console.log('TempData: ', TempData);
        let temp = []


        return (<ExcelSheet data={TempData} name={ReportMaster}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} />)}
        </ExcelSheet>);
    }
    const renderColumnSAP = (fileName) => {
        let tempData = []

        if (selectedRowData.length == 0) {
            tempData = reportListingData
        }
        else {
            tempData = selectedRowData
        }
        return returnExcelColumnSAP(REPORT_DOWNLOAD_SAP_EXCEl, tempData)


    }



    const returnExcelColumnSAP = (data = [], TempData) => {
        // console.log('TempData: ', TempData);
        let temp = []


        return (<ExcelSheet data={TempData} name={ReportSAPMaster}>
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

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
        headerCheckboxSelectionFilteredOnly: true,
        headerCheckboxSelection: isFirstColumn,
        checkboxSelection: isFirstColumn
    };

    const frameworkComponents = {
        linkableFormatter: linkableFormatter,
        createDateFormatter: createDateFormatter,
        hyphenFormatter: hyphenFormatter,
        simulatedOnFormatter: simulatedOnFormatter,
        customNoRowsOverlay: NoContentFound,
        dateFormatter: dateFormatter,
        statusFormatter: statusFormatter,
        customLoadingOverlay: LoaderCustom,
        revisionFormatter: revisionFormatter,
        requestterFormatter: requestterFormatter
    };


    return (
        <div className="container-fluid report-listing-page ag-grid-react">
            {/* {isLoader && <LoaderCustom />} */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>

                <h1 className="mb-0">Report</h1>

                <Row className="pt-4 blue-before">


                    <Col md="6" lg="6" className="search-user-block mb-3">
                        <div className="d-flex justify-content-end bd-highlight w100">
                            <div>
                                <ExcelFile filename={ReportMaster} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div>DOWNLOAD</button>}>
                                    {renderColumn(ReportMaster)}
                                </ExcelFile>
                                <ExcelFile filename={ReportSAPMaster} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div>SAP Excel Download</button>}>
                                    {renderColumnSAP(ReportSAPMaster)}
                                </ExcelFile>

                                <button type="button" className="user-btn refresh-icon" onClick={() => resetState()}></button>

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
                        paginationPageSize={10}
                        onGridReady={onGridReady}
                        gridOptions={gridOptions}
                        loadingOverlayComponent={'customLoadingOverlay'}
                        noRowsOverlayComponent={'customNoRowsOverlay'}
                        noRowsOverlayComponentParams={{
                            title: CONSTANT.EMPTY_DATA,
                        }}
                        // suppressRowClickSelection={true}
                        rowSelection={'multiple'}
                        frameworkComponents={frameworkComponents}
                        onSelectionChanged={onRowSelect}

                    >

                        <AgGridColumn field="CostingNumber" headerName="Costing Version"></AgGridColumn>
                        <AgGridColumn field="TechnologyName" headerName="Technology"></AgGridColumn>
                        <AgGridColumn field="DepartmentName" headerName="Company" cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field="PlantName" headerName="Plant(Code)" cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field="NetPOPrice" headerName="PO Price"></AgGridColumn>
                        <AgGridColumn field="PartNumber" headerName="Part Number"></AgGridColumn>
                        <AgGridColumn field="Rev" headerName="Revision Number" cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field="ECN" headerName="ECN Number" cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field="PartName" headerName="Part Name"></AgGridColumn>
                        <AgGridColumn field="VendorName" headerName="Vendor" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="VendorCode" headerName="Vendor Code" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="RawMaterialCode" headerName="RM Code" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="RawMaterialName" headerName="RM Name" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="RMGrade" headerName="RM Grade" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="RMSpecification" headerName="RM Specs" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="GrossWeight" headerName="Gross Weight" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="FinishWeight" headerName="Finish Weight" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="ScrapWeight" headerName="Scrap Weight"></AgGridColumn>
                        <AgGridColumn field="NetRawMaterialsCost" headerName="Net RM Cost"></AgGridColumn>
                        <AgGridColumn field="NetBoughtOutPartCost" headerName="Net Insert Cost"></AgGridColumn>
                        <AgGridColumn field="NetProcessCost" headerName="Process Cost"></AgGridColumn>
                        <AgGridColumn field="NetOperationCost" headerName="Operation Cost"></AgGridColumn>
                        <AgGridColumn field="SurfaceTreatmentCost" headerName="Surface Treatment"></AgGridColumn>
                        <AgGridColumn field="TransportationCost" headerName="Transportation Cost"></AgGridColumn>
                        <AgGridColumn field="NetConversionCost" headerName="Net Conversion Cost"></AgGridColumn>
                        <AgGridColumn field="ModelTypeForOverheadAndProfit" headerName="Model Type For Overhead/Profit" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="OverheadOn" headerName="Overhead On" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="OverheadCost" headerName="Overhead Cost" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="ProfitOn" headerName="Profit On" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="ProfitCost" headerName="Profit Cost" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="RejectOn" headerName="Rejection On" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="RejectionCost" headerName="Rejection Cost" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="ICCOn" headerName="ICC On" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="ICCCost" headerName="ICC Cost" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="PaymentTermCost" headerName="Payment Terms"></AgGridColumn>
                        {/* <AgGridColumn field="PaymentTermCost" headerName="Payment Terms"></AgGridColumn> */}
                        <AgGridColumn field="NetOverheadAndProfitCost" headerName="Net Overhead & Profits"></AgGridColumn>
                        <AgGridColumn field="PackagingCost" headerName="Packaging Cost"></AgGridColumn>
                        <AgGridColumn field="FreightCost" headerName="Freight Cost"></AgGridColumn>
                        <AgGridColumn field="NetFreightPackagingCost" headerName="Net Packaging & Freight"></AgGridColumn>
                        <AgGridColumn field="ToolMaintenaceCost" headerName="Tool Maintenance Cost" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="ToolPrice" headerName="Tool Price" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="AmorizationQuantity" headerName="Amortization Quantity(Tool Life)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="NetToolCost" headerName="Net Tool Cost" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="TotalCost" headerName="Total Cost" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="NetDiscountsCost" headerName="Hundi/Other Discount" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="AnyOtherCost" headerName="Any Other Cost" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="NetPOPrice" headerName="Net PO Price(INR)"></AgGridColumn>
                        <AgGridColumn field="Currency" headerName="Currency"></AgGridColumn>
                        <AgGridColumn field="NetPOPriceInCurrency" headerName="Net PO Price Currency"></AgGridColumn>
                        <AgGridColumn field="Remark" headerName="Remark" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="CreatedBy" headerName="CreatedBy" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="CreatedDate" headerName="Created Date and Time" cellRenderer={'dateFormatter'}></AgGridColumn>
                        <AgGridColumn field="SANumber" headerName="SA Number"></AgGridColumn>
                        <AgGridColumn field="LineNumber" headerName="Line Number"></AgGridColumn>
                        <AgGridColumn pinned="right" field="DisplayStatus" headerName="Status" cellRenderer={'statusFormatter'}></AgGridColumn>
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

        </div>
    );
}


export default ReportListing
// function mapStateToProps({ report, auth }) {
//     const { reportDataList, loading } = report;
//     const { initialConfiguration } = auth;
//     return { reportDataList, loading, initialConfiguration, }
// }

// export default connect(mapStateToProps, {
//     getReportListing,
// })(reduxForm({
//     form: 'ReportListing',
//     enableReinitialize: true,
// })(ReportListing));