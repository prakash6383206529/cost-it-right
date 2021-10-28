import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import ReactExport from 'react-export-excel';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { getCostingBulkUploadList, sendForApprovalFromBulkUpload, getErrorFile } from '../actions/CostWorking';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import CostingBulkUploadDrawer from './CostingBulkUploadDrawer';
import { toastr } from 'react-redux-toastr';
import { loggedInUserId } from '../../../helper';
import { APPROVED, PENDING } from '../../../config/constants';
import { AgGridReact } from 'ag-grid-react/lib/agGridReact';
import { AgGridColumn } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

const ExcelFile = ReactExport.ExcelFile;
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
    refresh = () => { this.props.getCostingBulkUploadList(() => { }) }

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
        var value = document.getElementById('page-size').value;
        this.state.gridApi.paginationSetPageSize(Number(value));
    };
    /**
   * @method buttonFormatter
   * @description Renders buttons
   */
    buttonFormatter = (props) => {
        const row = props?.data;
        //  console.log(row,'row: ', row.FileUploadStatus);
        const status = row.FileUploadStatus

        if (status === PENDING) {
            return (
                <>
                    <button className={'user-btn mr5'} onClick={() => this.sendForApprovalOrReject(props.value, true)} type={'button'}>Approve</button>
                    <button className={'user-btn mr5'} onClick={() => this.sendForApprovalOrReject(props.value, false)} type={'button'}>Reject</button>
                    {/* {row.IncorrectCostingCount > 0 && <button className={'user-btn mr5'} onClick={() => this.downloadErrorFile(row.CostingBulkUploadFileId)} type={'button'}>Download Error File</button>} */}
                </>
            )
        }
        else if (status === APPROVED) {
            return <span>-</span>
        }
        // else if (row?.FileUploadStatus === "Error") {

        //     return <button className={'user-btn mr5'} onClick={() => this.downloadErrorFile(row?.CostingBulkUploadFileId)} type={'button'}>Download Error File</button>

        // }

        // else if (row.IncorrectCostingCount > 0) {

        //     return <button className={'user-btn mr5'} onClick={() => this.downloadErrorFile(row.CostingBulkUploadFileId)} type={'button'}>Download Error File</button>

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
                toastr.success(res.data.Message)
                this.props.getCostingBulkUploadList(() => { })
            } else {
                this.props.getCostingBulkUploadList(() => { })
            }
        })
    }
    onFilterTextBoxChanged(e) {
        this.state.gridApi.setQuickFilter(e.target.value);
    }

    resetState() {
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);
    }
    onSubmit = () => { }

    render() {
        // const { handleSubmit } = this.props;
        const { costingBulkUploadList, handleSubmit } = this.props
        const { showBulkUpload } = this.state

        const options = {
            clearSearch: true,
            noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
            //exportCSVText: 'Download Excel',
            //onExportToCSV: this.onExportToCSV,
            //paginationShowsTotal: true,
            paginationShowsTotal: this.renderPaginationShowsTotal,
            prePage: <span className="prev-page-pg"></span>, // Previous page button text
            nextPage: <span className="next-page-pg"></span>, // Next page button text
            firstPage: <span className="first-page-pg"></span>, // First page button text
            lastPage: <span className="last-page-pg"></span>,

        };
        const defaultColDef = {
            resizable: true,
            filter: true,
            sortable: true,

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
                                        className={'user-btn'}
                                        onClick={this.bulkToggle}>
                                        <div className={'upload'}></div>Bulk Upload
                                    </button>

                                </div>
                            </Col>
                        </Row>

                    </form>

                    {/* <BootstrapTable
                        data={this.props.costingBulkUploadList}
                        striped={false}
                        hover={false}
                        bordered={false}
                        options={options}
                        search
                        // exportCSV
                        //ignoreSinglePage
                        ref={'table'}
                        trClassName={'userlisting-row'}
                        tableHeaderClass='my-custom-header client-table'
                        className={'client-table'}
                        pagination>
                        <TableHeaderColumn dataField="FileUploadStatus" dataAlign="left" >{'Status'}</TableHeaderColumn>
                        <TableHeaderColumn dataField="CorrectCostingCount" dataAlign="left" >{'No. of Correct Row'}</TableHeaderColumn>
                        <TableHeaderColumn dataField="IncorrectCostingCount" dataAlign="left" >{'No. of Incorrect Row'}</TableHeaderColumn>
                        <TableHeaderColumn dataField="OriginalFileName" dataAlign="left" >{'File Name'}</TableHeaderColumn>
                        <TableHeaderColumn width={400} className="action" searchable={false} dataField="CostingBulkUploadFileId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
                    </BootstrapTable> */}
                    {/* <----------------------START AG Grid convert on 21-10-2021---------------------------------------------> */}
                    <div className="ag-grid-react">
                        <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                            <div className="ag-grid-header">
                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
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
                                    paginationPageSize={10}
                                    onGridReady={this.onGridReady}
                                    gridOptions={this.gridOptions}
                                    loadingOverlayComponent={'customLoadingOverlay'}
                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                    noRowsOverlayComponentParams={{
                                        title: CONSTANT.EMPTY_DATA,
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
                                    <AgGridColumn field="CostingBulkUploadFileId" headerName="Actions" cellRenderer='totalValueRenderer'></AgGridColumn>
                                </AgGridReact>
                                <div className="paging-container d-inline-block float-right">
                                    <select className="form-control paging-dropdown" onChange={(e) => this.onPageSizeChanged(e.target.value)} id="page-size">
                                        <option value="10" selected={true}>10</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                </div>
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
    getCostingBulkUploadList,
    sendForApprovalFromBulkUpload, getErrorFile
})(reduxForm({
    form: 'CostingSummaryBulkUpload',
    // onSubmitFail: errors => {
    //     focusOnError(errors);
    // },
    enableReinitialize: true,
})(CostingSummaryBulkUpload));

// export default CostingSummaryBulkUpload;