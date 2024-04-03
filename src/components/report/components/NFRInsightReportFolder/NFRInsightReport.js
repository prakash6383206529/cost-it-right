import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { getNfrInsightsDetails, getNfrInsightsStatusDetails } from '../../actions/ReportListing';
import { handleDepartmentHeader, loggedInUserId, searchNocontentFilter } from '../../../../helper';
import { EMPTY_DATA } from '../../../../config/constants';
import LoaderCustom from '../../../common/LoaderCustom';
import NoContentFound from '../../../common/NoContentFound';
import ScrollToTop from '../../../common/ScrollToTop';
import { PaginationWrapper } from '../../../common/commonPagination';
import ReactExport from 'react-export-excel';
import { NFR_INSIGHT_REPORT } from '../../../../config/masterData';
import NFRInsightStatusDetailsDrawer from './NFRInsightStatusDetailsDrawer';
import { agGridStatus, isResetClick } from '../../../../actions/Common';
import TourWrapper from '../../../common/Tour/TourWrapper';
import { Steps } from '../../../common/Tour/TourMessages';
import { useTranslation } from "react-i18next"

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};

function NFRInsightsReport(props) {
    const { t } = useTranslation("common")

    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [isLoader, setIsLoader] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState(false);
    const [noData, setNoData] = useState(false);
    const [dataCount, setDataCount] = useState(0);
    const [showDrawer, setShowDrawer] = useState(false);
    const { reasonDataList } = useSelector(state => state.reason);
    const { nfrInsightDetails } = useSelector(state => state.report);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getNfrInsightsDetails((res) => { }))
    }, [])

    /**
     * @method onFloatingFilterChanged
     * @description Filter data when user type in searching input
     */
    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            reasonDataList?.length !== 0 && setNoData(searchNocontentFilter(value, noData))
        }, 500);
    }
    /**
     * @method statusButtonFormatter
     * @description Renders buttons
     */
    const statusButtonFormatter = (props) => {
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        if (rowData.UserId === loggedInUserId()) return null;
        return (
            <>
                <label htmlFor="normal-switch" className="normal-switch">
                </label>
            </>
        )
    }

    const onGridReady = (params) => {

        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);

    };

    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
    };
    const onRowSelect = () => {
        const selectedRows = gridApi.getSelectedRows();
        setSelectedRowData(selectedRows)
        setDataCount(selectedRows.length)
    }

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const resetState = () => {
        const searchBox = document.getElementById("filter-text-box");
        if (searchBox) {
            searchBox.value = ""; // Reset the input field's value
        }
        gridApi.setQuickFilter(null)
        gridOptions?.columnApi?.resetColumnState(null);
        gridOptions?.api?.setFilterModel(null);
        gridApi.deselectAll()
        dispatch(agGridStatus("", ""))
        setNoData(false)
    }

    const callAPI = (props) => {
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        let data = {
            plantCode: rowData?.PlantCode,
            nfrVersion: ''
        }
        switch (props?.column?.colId) {
            case "TotalOEQA1Count":
                data.nfrVersion = "OEQA1"
                break;
            case "TotalOEQA2Count":
                data.nfrVersion = "OEQA2"
                break;
            case "TotalOEQA3Count":
                data.nfrVersion = "OEQA3"
                break;
            case "TotalOEQA4Count":
                data.nfrVersion = "OEQA4"
                break;
            case "TotalPFS1Count":
                data.nfrVersion = "PFS1"
                break;
            case "TotalPFS2Count":
                data.nfrVersion = "PFS2"
                break;
            case "TotalPFS3Count":
                data.nfrVersion = "PFS3"
                break;

            default:
                break;
        }
        if (cell) {
            dispatch(getNfrInsightsStatusDetails(data, (res) => {
                setShowDrawer(true)
            }))
        }
    }

    /**
  * @method linkableTotalOEQA1Formatter
  * @description Renders Name link
  */
    const linkableTotalOEQA1Formatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (
            <Fragment>{<div onClick={() => callAPI(props)} className={props?.rowIndex !== 0 && cell ? 'link' : ''}>
                {cell ? cell : "-"}
            </div>}</Fragment>
        )
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        headerCheckboxSelectionFilteredOnly: true,
    };

    const frameworkComponents = {
        customNoRowsOverlay: NoContentFound,
        statusButtonFormatter: statusButtonFormatter,
        linkableTotalOEQA1Formatter: linkableTotalOEQA1Formatter
    };

    const returnExcelColumn = (data = [], TempData) => {
        let excelData = data
        return (

            <ExcelSheet data={TempData} name={'NFR Insight Report'}>
                {excelData && excelData.map((ele, index) => <ExcelColumn key={index} label={(ele.label === "Company") ? `${handleDepartmentHeader()}` : ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
    }

    const onBtExport = () => {
        let tempArr = []
        tempArr = nfrInsightDetails
        return returnExcelColumn(NFR_INSIGHT_REPORT, tempArr)
    };

    const closeDrawer = () => {
        setShowDrawer(false)
    }

    return (
        <>
            <div className={`ag-grid-react container-fluid p-relative`} id='go-to-top'>
                <ScrollToTop pointProp="go-to-top" />
                {isLoader && <LoaderCustom customClass="loader-center" />}
                <Row className="no-filter-row">
                    <Col md={6} className="text-right filter-block"></Col>
                    <Col md="6" className="text-right search-user-block pr-0">
                        <div className="d-flex justify-content-end bd-highlight w100">
                            <div>
                                <button type="button" className="user-btn Tour_List_Reset" title="Reset Grid" onClick={() => resetState()}>
                                    <div className="refresh mr-0"></div>
                                </button>
                                <ExcelFile filename={'NFR Insight Report'} fileExtension={'.xls'} element={
                                    <button id={'Excel-Downloads-nfr'} className=" ml-1 user-btn Tour_List_Download" type="button"><div className="download mr-1" ></div>
                                    </button>}>
                                    {onBtExport()}
                                </ExcelFile>
                            </div>
                        </div>
                    </Col>
                </Row>
                {<div className={`ag-grid-wrapper height-width-wrapper ${(nfrInsightDetails && nfrInsightDetails?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                    <div className="ag-grid-header">
                        <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                        <TourWrapper
                            buttonSpecificProp={{ id: "Nfr_Insight_Report" }}
                            stepsSpecificProp={{
                                steps: Steps(t, { addButton: false, bulkUpload: false, viewButton: false, EditButton: false, DeleteButton: false, filterButton: false, addLimit: false, costMovementButton: false, copyButton: false, viewBOM: false, status: false, updateAssociatedTechnology: false, addMaterial: false, addAssociation: false, generateReport: false, approve: false, reject: false }).COMMON_LISTING
                            }} />
                    </div>
                    <div className={`ag-theme-material ${isLoader && "max-loader-height"}`}>
                        {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}


                        <AgGridReact
                            style={{ height: '100%', width: '100%' }}
                            domLayout="autoHeight"
                            defaultColDef={defaultColDef}
                            floatingFilter={true}
                            rowData={nfrInsightDetails}
                            pagination={true}
                            onFilterModified={onFloatingFilterChanged}
                            paginationPageSize={5}
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
                            onRowSelected={onRowSelect}
                        >
                            <AgGridColumn field="Company" width={"240px"} headerName={`${handleDepartmentHeader()}`}></AgGridColumn>
                            <AgGridColumn field="PlantName" width={"240px"} headerName="Plant (Code)"></AgGridColumn>
                            <AgGridColumn field="TotalNfrCount" headerName="Total Nfr Count"></AgGridColumn>
                            <AgGridColumn field="TotalOEQA1Count" headerName="Total OEQA1 Count" cellRenderer='linkableTotalOEQA1Formatter'></AgGridColumn>
                            <AgGridColumn field="TotalOEQA2Count" headerName="Total OEQA2 Count" cellRenderer='linkableTotalOEQA1Formatter'></AgGridColumn>
                            <AgGridColumn field="TotalOEQA3Count" headerName="Total OEQA3 Count" cellRenderer='linkableTotalOEQA1Formatter'></AgGridColumn>
                            <AgGridColumn field="TotalOEQA4Count" headerName="Total OEQA4 Count" cellRenderer='linkableTotalOEQA1Formatter'></AgGridColumn>
                            <AgGridColumn field="TotalPFS1Count" headerName="Total PFS1 Count" cellRenderer='linkableTotalOEQA1Formatter'></AgGridColumn>
                            <AgGridColumn field="TotalPFS2Count" headerName="Total PFS2 Count" cellRenderer='linkableTotalOEQA1Formatter'></AgGridColumn>
                            <AgGridColumn field="TotalPFS3Count" headerName="Total PFS3 Count" cellRenderer='linkableTotalOEQA1Formatter'></AgGridColumn>
                            <AgGridColumn field="OEQA1DraftCount" headerName="OEQA1 Draft Count"></AgGridColumn>
                            <AgGridColumn field="OEQA1PendingForApprovalCount" headerName="OEQA1 Pending For Approval Count"></AgGridColumn>
                            <AgGridColumn field="OEQA1ApprovedCount" headerName="OEQA1 Approved Count"></AgGridColumn>
                            <AgGridColumn field="OEQA1RejectedCount" headerName="OEQA1 Rejected Count"></AgGridColumn>
                            <AgGridColumn field="OEQA1ErrorCount" headerName="OEQA1 Error Count"></AgGridColumn>
                            <AgGridColumn field="OEQA1PushedCount" headerName="OEQA1 Pushed Count"></AgGridColumn>
                            <AgGridColumn field="OEQA1ExternalRejectCount" headerName="OEQA1 External Reject Count"></AgGridColumn>
                            <AgGridColumn field="OEQA2DraftCount" headerName="OEQA2 Draft Count"></AgGridColumn>
                            <AgGridColumn field="OEQA2PendingForApprovalCount" headerName="OEQA2 Pending For Approval Count"></AgGridColumn>
                            <AgGridColumn field="OEQA2ApprovedCount" headerName="OEQA2 Approved Count"></AgGridColumn>
                            <AgGridColumn field="OEQA2RejectedCount" headerName="OEQA2 Rejected Count"></AgGridColumn>
                            <AgGridColumn field="OEQA2ErrorCount" headerName="OEQA2 Error Count"></AgGridColumn>
                            <AgGridColumn field="OEQA2PushedCount" headerName="OEQA2 Pushed Count"></AgGridColumn>
                            <AgGridColumn field="OEQA2ExternalRejectCount" headerName="OEQA2 External Reject Count"></AgGridColumn>
                            <AgGridColumn field="OEQA3DraftCount" headerName="OEQA3 Draft Count"></AgGridColumn>
                            <AgGridColumn field="OEQA3PendingForApprovalCount" headerName="OEQA3 Pending For Approval Count"></AgGridColumn>
                            <AgGridColumn field="OEQA3ApprovedCount" headerName="OEQA3 Approved Count"></AgGridColumn>
                            <AgGridColumn field="OEQA3RejectedCount" headerName="OEQA3 Rejected Count"></AgGridColumn>
                            <AgGridColumn field="OEQA3ErrorCount" headerName="OEQA3 Error Count"></AgGridColumn>
                            <AgGridColumn field="OEQA3PushedCount" headerName="OEQA3 Pushed Count"></AgGridColumn>
                            <AgGridColumn field="OEQA3ExternalRejectCount" headerName="OEQA3 External Reject Count"></AgGridColumn>
                            <AgGridColumn field="OEQA4DraftCount" headerName="OEQA4 Draft Count"></AgGridColumn>
                            <AgGridColumn field="OEQA4PendingForApprovalCount" headerName="OEQA4 Pending For Approval Count"></AgGridColumn>
                            <AgGridColumn field="OEQA4ApprovedCount" headerName="OEQA4 Approved Count"></AgGridColumn>
                            <AgGridColumn field="OEQA4RejectedCount" headerName="OEQA4 Rejected Count"></AgGridColumn>
                            <AgGridColumn field="OEQA4ErrorCount" headerName="OEQA4 Error Count"></AgGridColumn>
                            <AgGridColumn field="OEQA4PushedCount" headerName="OEQA4 Pushed Count"></AgGridColumn>
                            <AgGridColumn field="OEQA4ExternalRejectCount" headerName="OEQA4 External Reject Count"></AgGridColumn>
                            <AgGridColumn field="PFS1DraftCount" headerName="PFS1 Draft Count"></AgGridColumn>
                            <AgGridColumn field="PFS1PendingForApprovalCount" headerName="PFS1 Pending For Approval Count"></AgGridColumn>
                            <AgGridColumn field="PFS1ApprovedCount" headerName="PFS1 Approved Count"></AgGridColumn>
                            <AgGridColumn field="PFS1RejectedCount" headerName="PFS1 Rejected Count"></AgGridColumn>
                            <AgGridColumn field="PFS1ErrorCount" headerName="PFS1 Error Count"></AgGridColumn>
                            <AgGridColumn field="PFS1PushedCount" headerName="PFS1 Pushed Count"></AgGridColumn>
                            <AgGridColumn field="PFS1ExternalRejectCount" headerName="PFS1 External Reject Count"></AgGridColumn>
                            <AgGridColumn field="PFS2DraftCount" headerName="PFS2 Draft Count"></AgGridColumn>
                            <AgGridColumn field="PFS2PendingForApprovalCount" headerName="PFS2 Pending For Approval Count"></AgGridColumn>
                            <AgGridColumn field="PFS2ApprovedCount" headerName="PFS2 Approved Count"></AgGridColumn>
                            <AgGridColumn field="PFS2RejectedCount" headerName="PFS2 Rejected Count"></AgGridColumn>
                            <AgGridColumn field="PFS2ErrorCount" headerName="PFS2 Error Count"></AgGridColumn>
                            <AgGridColumn field="PFS2PushedCount" headerName="PFS2 Pushed Count"></AgGridColumn>
                            <AgGridColumn field="PFS2ExternalRejectCount" headerName="PFS2 External Reject Count"></AgGridColumn>
                            <AgGridColumn field="PFS3DraftCount" headerName="PFS3 Draft Count"></AgGridColumn>
                            <AgGridColumn field="PFS3PendingForApprovalCount" headerName="PFS3 Pending For Approval Count"></AgGridColumn>
                            <AgGridColumn field="PFS3ApprovedCount" headerName="PFS3 Approved Count"></AgGridColumn>
                            <AgGridColumn field="PFS3ErrorCount" headerName="PFS3 Error Count"></AgGridColumn>
                            <AgGridColumn field="PFS3PushedCount" headerName="PFS3 Pushed Count"></AgGridColumn>
                            <AgGridColumn field="PFS3ExternalRejectCount" headerName="PFS3 External Reject Count"></AgGridColumn>
                        </AgGridReact>
                        {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
                    </div>
                </div>}
            </div >
            {showDrawer && <NFRInsightStatusDetailsDrawer
                anchor={"right"}
                isOpen={showDrawer}
                closeDrawer={closeDrawer}
            />}
        </>
    )
}

export default NFRInsightsReport
