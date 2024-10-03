import React, { useState, useEffect, Fragment } from 'react'
import moment from 'moment'
import { Row, Col } from 'reactstrap'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { loggedInUserId, } from '../../helper/auth'
import NoContentFound from '../common/NoContentFound'
import { EMPTY_DATA } from '../../config/constants'
import { REPORT_DOWNLOAD_EXCEl } from '../../config/masterData';
import { GridTotalFormate } from '../common/TableGridFunctions'
import { getReportListing } from '../report/actions/ReportListing'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import ReactExport from 'react-export-excel';
import { CREATED_BY_ASSEMBLY, DRAFT, ReportMaster } from '../../config/constants';
import LoaderCustom from '../common/LoaderCustom';
import WarningMessage from '../common/WarningMessage'
import { handleDepartmentHeader, showBopLabel } from '../../../helper'
import { reactLocalStorage } from 'reactjs-localstorage'
import { useLabels, useWithLocalization } from '../../../helper/core'




const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

var filterParams = {
    comparator: function (filterLocalDateAtMidnight, cellValue) {
        var dateAsString = cellValue != null ? moment(cellValue).format('DD/MM/YYYY') : '';
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
    const [warningMessage, setWarningMessage] = useState(true)
    const [totalRecordCount, setTotalRecordCount] = useState(0)
    const [reportListingDataStateArray, setReportListingDataStateArray] = useState([])


    const dispatch = useDispatch()
    const { technologyLabel, discountLabel, toolMaintenanceCostLabel, vendorLabel } = useLabels();
    const { register, handleSubmit, control, setValue, formState: { errors }, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })




    const onBtFirst = () => {
        gridApi.paginationGoToFirstPage();
    };

    const onBtLast = () => {
        gridApi.paginationGoToLastPage();
    };




    const onBtPageFive = () => {
        gridApi.paginationGoToPage(4);
    };

    const onBtPageFifty = () => {
        gridApi.paginationGoToPage(49);
    };


    const partSelectList = useSelector((state) => state.costing.partSelectList)
    let reportListingData = useSelector((state) => state.report.reportListing)
    const statusSelectList = useSelector((state) => state.approval.costingStatusList)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const approvalList = useSelector(state => state.approval.approvalList)

    const userList = useSelector(state => state.auth.userList)
    // const { bopDrawerList } = useSelector(state => state.costing)

    const getData = () => {

        let temp = []
        temp = reportListingData && reportListingData.map(item => {
            if (item.Status === CREATED_BY_ASSEMBLY) {
                return false
            } else {
                return item
            }
        })
        setTableData(temp)
        setTimeout(() => {
            setLoader(false)
        }, 200);
    }

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
        return <div className={cell}>{row.Status}</div>
    }

    /**
   * @method getTableData
   * @description getting approval list table
   */

    const getTableData = (index, take, isPagination) => {
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

        dispatch(getReportListing(index, take, isPagination, filterData, (res) => {
            //  props.getReportListing();   // <---- The function you're measuring time for 


            // var t1 = performance.now();

        }))

    }


    useEffect(() => {



        getTableData(0, 100, true);

        return () => {

            getTableData(0, 500, false);


        }



    }, [])

    useEffect(() => {
        var tempArr = []

        // reportListingData && reportListingData.map(item => {
        //     if (item.Value === '0') return false;
        //     temp.push({ label: item.Text, value: item.Value })
        //     return null;
        // });
        const blank = () => { setWarningMessage(false) }

        setReportListingDataStateArray(reportListingData)
        if (reportListingData.length > 0) {
            if (totalRecordCount === 0) {
                setTotalRecordCount(reportListingData[0].TotalRecordCount)

                reportListingData[0].TotalRecordCount > 100 ? getTableData(100, reportListingData[0].TotalRecordCount, true) : blank()
                setLoader(false)
            }
            if (totalRecordCount !== 0) {
                setWarningMessage(false)
            }


        }





    }, [reportListingData])


    const renderPaginationShowsTotal = (start, to, total) => {
        return <GridTotalFormate start={start} to={to} total={total} />
    }

    const options = {
        clearSearch: true,
        noDataText: <NoContentFound title={EMPTY_DATA} />,
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

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
        headerCheckboxSelectionFilteredOnly: true,
        headerCheckboxSelection: isFirstColumn,
        checkboxSelection: isFirstColumn
    };


    const onGridReady = (params) => {
        // this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
        // getDataList()
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);


        //setGridApi(params.api);
        // setGridColumnApi(params.columnApi);

        // const updateData = (data) => {
        //     setRowData(data);
        // };



        // fetch('https://www.ag-grid.com/example-assets/olympic-winners.json')
        //     .then((resp) => resp.json())
        //     .then((data) => updateData(data));

    };

    const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }
    useEffect(() => {

    }, [tableData])

    // const renderColumn = (fileName) => {
    //     return returnExcelColumn(CONSTANT.REPORT_DOWNLOAD_EXCEL, reportListingData)
    // }

    const frameworkComponents = {
        linkableFormatter: linkableFormatter,
        createDateFormatter: createDateFormatter,
        hyphenFormatter: hyphenFormatter,
        simulatedOnFormatter: simulatedOnFormatter,
        customNoRowsOverlay: NoContentFound,
        dateFormatter: dateFormatter,
        statusFormatter: statusFormatter,
        customLoadingOverlay: LoaderCustom
    };

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
    const REPORT_DOWNLOAD_EXCEl_LOCALIZATION = useWithLocalization(REPORT_DOWNLOAD_EXCEl, "MasterLabels")
    const renderColumn = (fileName) => {

        let tempData
        if (selectedRowData.length == 0) {
            tempData = reportListingData
        }
        else {
            tempData = selectedRowData
        }
        return returnExcelColumn(REPORT_DOWNLOAD_EXCEl_LOCALIZATION, tempData)

    }


    const returnExcelColumn = (data = [], TempData) => {
        return (
            <ExcelSheet data={TempData} name={ReportMaster}>
                {data &&
                    data.map((ele, index) => (
                        <ExcelColumn
                            key={index}
                            label={(ele.label === "Department Code") ? `${handleDepartmentHeader()} Code` :
                                (ele.label === "Department Name") ? `${handleDepartmentHeader()} Name` :
                                    ele.label}
                            value={ele.value}
                        />
                    ))}
            </ExcelSheet>
        );
    };

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
        <div className="container-fluid report-listing-page ag-grid-react">
            {/* {isLoader && <LoaderCustom />} */}
            <form onSubmit={handleSubmit(onSubmit)} noValidate>

                <h1 className="mb-0">Report</h1>

                <Row className="pt-4 blue-before">


                    <Col md="6" lg="6" className="search-user-block mb-3">
                        <div className="d-flex justify-content-end bd-highlight excel-btn w100">
                            <div>
                                <ExcelFile filename={ReportMaster} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div>DOWNLOAD</button>}>
                                    {renderColumn(ReportMaster)}
                                </ExcelFile>

                            </div>
                        </div>

                    </Col>
                </Row>
            </form>

            <div>
                {/* <button onClick={() => onBtFirst()}>To First</button>
                <button onClick={() => onBtLast()} id="btLast">
                    To Last
                </button> */}
                {/* <button onClick={onBtPrevious}>To Previous</button>
                <button onClick={onBtNext}>To Next</button> */}
                {/* // <button onClick={() => onBtPageFive()}>To Page 5</button>
                //<button onClick={() => onBtPageFifty()}>To Page 50</button> */}

            </div>


            <div className={`ag-grid-wrapper height-width-wrapper  ${reportListingDataStateArray && reportListingDataStateArray?.length <= 0 ? "overlay-contain" : ""}`}>
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
                        rowData={reportListingDataStateArray}
                        pagination={true}
                        //   suppressPaginationPanel={true}
                        suppressScrollOnNewData={true}

                        paginationPageSize={10}
                        onGridReady={onGridReady}
                        gridOptions={gridOptions}

                        // onFilterModified={onFloatingFilterChanged}
                        loadingOverlayComponent={'customLoadingOverlay'}
                        noRowsOverlayComponent={'customNoRowsOverlay'}
                        noRowsOverlayComponentParams={{
                            title: EMPTY_DATA,
                        }}
                        //suppressRowClickSelection={true}
                        rowSelection={'multiple'}
                        frameworkComponents={frameworkComponents}
                        onSelectionChanged={onRowSelect}
                    >

                        <AgGridColumn field="CostingNumber" headerName="Costing Version"></AgGridColumn>
                        <AgGridColumn field="TechnologyName" headerName={technologyLabel}></AgGridColumn>
                        <AgGridColumn field="DepartmentName" headerName={`${handleDepartmentHeader()}`} cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field="PlantName" headerName="Plant(Code)" cellRenderer='hyphenFormatter'></AgGridColumn>
                        <AgGridColumn field="NetPOPrice" headerName="PO Price"></AgGridColumn>
                        <AgGridColumn field="PartNumber" headerName="Part Number"></AgGridColumn>
                        <AgGridColumn field="Rev" headerName="Revision Number" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="ECN" headerName="ECN Number" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="PartName" headerName="Part Name"></AgGridColumn>
                        <AgGridColumn field="VendorName" headerName={vendorLabel} cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="VendorCode"headerName={vendorLabel + " (Code)"}cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="RawMaterialName" headerName="RM Name" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="RawMaterialCode" headerName="RM Code" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="RMGrade" headerName="RM Grade" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="RMSpecification" headerName="RM Specs" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="GrossWeight" headerName="Gross Weight" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="FinishWeight" headerName="Finish Weight" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="NetRawMaterialsCost" headerName="Net RM Cost"></AgGridColumn>
                        <AgGridColumn field="NetBoughtOutPartCost" headerName={`Net ${showBopLabel()} Cost`}></AgGridColumn>
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
                        {/* <AgGridColumn field="PaymentTermCost" headerName="Payment Terms"></AgGridColumn> */}
                        <AgGridColumn field="NetOverheadAndProfitCost" headerName="Net Overhead & Profits"></AgGridColumn>
                        <AgGridColumn field="PackagingCost" headerName="Packaging Cost"></AgGridColumn>
                        <AgGridColumn field="FreightCost" headerName="Freight Cost"></AgGridColumn>
                        <AgGridColumn field="NetFreightPackagingCost" headerName="Net Packaging & Freight"></AgGridColumn>
                        <AgGridColumn field="ToolMaintenaceCost" headerName={`${toolMaintenanceCostLabel}`} cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="ToolPrice" headerName="Tool Price" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="AmorizationQuantity" headerName="Amortization Quantity (Tool Life)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="NetToolCost" headerName="Net Tool Cost" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="TotalCost" headerName="Total Cost" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="NetDiscountsCost" headerName={`${discountLabel}`} cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="AnyOtherCost" headerName="Any Other Cost" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="PaymentTermCost" headerName="Payment Terms"></AgGridColumn>
                        <AgGridColumn field="NetPOPrice" headerName={`Net PO Price (${reactLocalStorage.getObject("baseCurrency")})`}></AgGridColumn>
                        <AgGridColumn field="Currency" headerName="Currency"></AgGridColumn>
                        <AgGridColumn field="NetPOPriceInCurrency" headerName="Net PO Price Currency"></AgGridColumn>
                        <AgGridColumn field="Remark" headerName="Remark123" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="CreatedBy" headerName="CreatedBy" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                        <AgGridColumn field="CreatedDate" headerName="Created Date and Time" cellRenderer={'dateFormatter'} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                        <AgGridColumn pinned="right" field="DisplayStatus" headerName="Status" cellRenderer={'statusFormatter'}></AgGridColumn>
                    </AgGridReact>
                    <div className="paging-container d-inline-block float-right">
                        <select className="form-control paging-dropdown" onChange={(e) => onPageSizeChanged(e.target.value)} id="page-size">
                            <option value="10" selected={true}>10</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                    <div className="warning-text">
                        {warningMessage && <WarningMessage dClass="mr-3" message={'Loading More Data'} />}
                    </div>
                </div>
            </div>

        </div>
    );
}



export default ReportListing