import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import ReactExport from 'react-export-excel';
import { defaultPageSize, EMPTY_DATA, REJECTED } from '../../../config/constants';
import { getCostingBulkUploadList, sendForApprovalFromBulkUpload, getErrorFile, generateReport } from '../actions/CostWorking';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import CostingBulkUploadDrawer from './CostingBulkUploadDrawer';
import Toaster from '../../common/Toaster';
import { loggedInUserId } from '../../../helper';
import { APPROVED, PENDING } from '../../../config/constants';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { PaginationWrapper } from '../../common/commonPagination';

const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};

class CostingSummaryBulkUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showBulkUpload: false,
            gridApi: null,
            gridColumnApi: null,
        }
    }
    componentDidMount() {
        this.props.getCostingBulkUploadList(() => { })
    }
    renderPaginationShowsTotal(start, to, total) {
        return <GridTotalFormate start={start} to={to} total={total} />
    }

    /**
     * @method refresh
     * @description Refresh the list
    */
    refresh = () => {
        this.props.getCostingBulkUploadList(() => { })
        gridOptions.columnApi?.resetColumnState();
        gridOptions.api?.setFilterModel(null);
    }

    generateReport = () => { this.props.generateReport(() => { }) }

    bulkToggle = () => {

        this.setState({
            showBulkUpload: true
        })
    }

    /**
   * @method closeGradeDrawer
   * @description  used to toggle grade Popup/Drawer
   */
    closeDrawer = (e = '') => {
        this.setState({ showBulkUpload: false }, () => {
            this.props.getCostingBulkUploadList(() => { })
        })
    }
    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridApi.sizeColumnsToFit();
        this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
        params.api.paginationGoToPage(0);
    };
    onPageSizeChanged = (newPageSize) => {
        this.state.gridApi.paginationSetPageSize(Number(newPageSize));
    };
    /**
   * @method buttonFormatter
   * @description Renders buttons
   */
    buttonFormatter = (props) => {
        const row = props?.data;
        const status = row.FileUploadStatus
        if (status === PENDING) {
            return (
                <>
                    <button className={'user-btn mr5'} disabled={row.IncorrectCostingCount > 0 ? true : false} onClick={() => this.sendForApprovalOrReject(props.value, true)} type={'button'}>Approve</button>
                    <button className={'user-btn mr5'} onClick={() => this.sendForApprovalOrReject(props.value, false)} type={'button'}>Reject</button>
                    {/* {row.IncorrectCostingCount > 0 && <button className={'user-btn mr5'} onClick={() => this.downloadErrorFile(row.CostingBulkUploadFileId)} type={'button'}>Download Error File</button>} */}
                </>
            )
        }
        else if (status === APPROVED || status === REJECTED) {
            return <span>-</span>

        }
        // else if (row.FileUploadStatus === "Error") {
        //     return <button className={'user-btn mr5'} onClick={() => this.downloadErrorFile(row.CostingBulkUploadFileId)} type={'button'}>Download Error File</button>
        // }
        // else if (row.NoOfIncorrectRow > 0) {
        //     return <button className={'user-btn mr5'} onClick={() => this.downloadErrorFile(row.CostingBulkUploadFileId)} type={'button'}>Download Error File</button>
        // }

        // }
    }


    /**
  * @method returnExcelColumn
  * @description Used to get excel column names
  */
    returnExcelColumn = (data = [], TempData) => {
        const { failedData, isFailedFlag } = this.props;

        if (isFailedFlag) {

            //BELOW CONDITION TO ADD 'REASON' COLUMN WHILE DOWNLOAD EXCEL SHEET IN CASE OF FAILED
            let isContentReason = data.filter(d => d.label === 'Reason')
            if (isContentReason.length === 0) {
                let addObj = { label: 'Reason', value: 'Reason' }
                data.push(addObj)
            }
        }
        const name = "Costing"
        this.props.getCostingBulkUploadList(() => { })
        return (<ExcelSheet data={isFailedFlag ? failedData : TempData} name={name}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.label} />)}
        </ExcelSheet>);
    }

    /**
     * @method downloadErrorFile
     * @description Download Error file
    */
    downloadErrorFile = (id) => {
        this.props.getErrorFile(id, res => {
            // Code for downloading excel file
            let Data = res.data
            this.returnExcelColumn(Data)

        })
    }

    /**
     * @method sendForApprovalOrReject
     * @description Send costing for approval or reject
    */
    sendForApprovalOrReject = (id, flag) => {

        let obj = {}
        obj.CostingBulkUploadFileId = id
        obj.IsAccept = flag
        obj.LoggedInUserId = loggedInUserId()
        this.props.sendForApprovalFromBulkUpload(obj, res => {
            if (res.data.Result) {
                Toaster.success(res.data.Message)
                this.props.getCostingBulkUploadList(() => { })
            } else {
                this.props.getCostingBulkUploadList(() => { })
            }
        })
    }
    onFilterTextBoxChanged(e) {
        this.state.gridApi.setQuickFilter(e.target.value);
    }

    onSubmit = () => { }

    render() {
        // const { handleSubmit } = this.props;
        const { handleSubmit } = this.props
        const { showBulkUpload } = this.state

        const defaultColDef = {
            resizable: true,
            filter: true,
            sortable: false,

        };
        const frameworkComponents = {
            totalValueRenderer: this.buttonFormatter,
        };
        return (
            <>
                {/* {this.props.loading && <Loader />} */}
                <div className="container-fluid">
                    <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                        <h1>Costing BulkUpload</h1>
                        <hr />
                        <Row className="pt-1 no-filter-row">
                            <Col md="9" className="filter-block"></Col>
                            <Col md="3" className="search-user-block">
                                <div className="d-flex justify-content-end bd-highlight">
                                    <button
                                        type="button"
                                        className={'user-btn mr5'}
                                        onClick={this.refresh}>
                                        <div className={'refresh'}></div>Refresh
                                    </button>

                                    <button
                                        type="button"
                                        className={'user-btn min-width-btn mr-2'}
                                        onClick={this.generateReport}>
                                        <div className={''}></div>Generate Report
                                    </button>

                                    <button
                                        type="button"
                                        className={'user-btn min-width-btn'}
                                        onClick={this.bulkToggle}>
                                        <div className={'upload'}></div>Bulk Upload
                                    </button>

                                </div>
                            </Col>
                        </Row>

                    </form>
                    {/* <----------------------START AG Grid convert on 21-10-2021---------------------------------------------> */}
                    <div className="ag-grid-react">
                        <div className="ag-grid-wrapper height-width-wrapper">
                            <div className="ag-grid-header">
                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => this.onFilterTextBoxChanged(e)} />
                            </div>
                            <div
                                className="ag-theme-material">
                                <AgGridReact
                                    defaultColDef={defaultColDef}
                                    floatingFilter={true}
                                    domLayout='autoHeight'
                                    // columnDefs={c}
                                    rowData={this.props.costingBulkUploadList}
                                    pagination={true}
                                    paginationPageSize={defaultPageSize}
                                    onGridReady={this.onGridReady}
                                    gridOptions={gridOptions}
                                    loadingOverlayComponent={'customLoadingOverlay'}
                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                    noRowsOverlayComponentParams={{
                                        title: EMPTY_DATA,
                                        imagClass: 'imagClass'
                                    }}
                                    frameworkComponents={frameworkComponents}
                                    suppressRowClickSelection={true}
                                    rowSelection={'multiple'}
                                >
                                    {/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
                                    <AgGridColumn field="FileUploadStatus" headerName="Status"></AgGridColumn>
                                    <AgGridColumn field="CorrectCostingCount" headerName="No. of Correct Row"></AgGridColumn>
                                    <AgGridColumn field="IncorrectCostingCount" headerName="No. of Incorrect Row"></AgGridColumn>
                                    <AgGridColumn field="OriginalFileName" headerName="File Name"></AgGridColumn>
                                    <AgGridColumn minWidth="230" field="CostingBulkUploadFileId" cellClass="ag-grid-action-container" headerName="Actions" cellRenderer='totalValueRenderer'></AgGridColumn>
                                </AgGridReact>
                                {<PaginationWrapper gridApi={this.gridApi} setPage={this.onPageSizeChanged} />}
                            </div>
                        </div>
                    </div>
                    {/* <--------------------AG Grid convert by 21-10-2021------> */}
                </div>
                {
                    showBulkUpload &&
                    <CostingBulkUploadDrawer
                        isOpen={showBulkUpload}
                        closeDrawer={this.closeDrawer}
                        anchor={"right"}
                    />
                }
            </ >
        );;
    }
}
/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps(state) {
    // 
    const { costing } = state
    const { costingBulkUploadList } = costing
    //return { vendorListByVendorType, paymentTermsSelectList, iccApplicabilitySelectList, leftMenuData, interestRateDataList, vendorWithVendorCodeSelectList };
    return { costingBulkUploadList }
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getCostingBulkUploadList, generateReport,
    sendForApprovalFromBulkUpload, getErrorFile
})(reduxForm({
    form: 'CostingSummaryBulkUpload',
    // onSubmitFail: errors => {
    //     focusOnError(errors);
    // },
    enableReinitialize: true,
    touchOnChange: true
})(CostingSummaryBulkUpload));

// export default CostingSummaryBulkUpload;
