import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import ReactExport from 'react-export-excel';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { getCostingBulkUploadList, sendForApprovalFromBulkUpload, getErrorFile } from '../actions/CostWorking';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import CostingBulkUploadDrawer from './CostingBulkUploadDrawer';
import { toastr } from 'react-redux-toastr';
import { loggedInUserId } from '../../../helper';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

class CostingSummaryBulkUpload extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showBulkUpload: false
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
    /**
   * @method buttonFormatter
   * @description Renders buttons
   */
    buttonFormatter = (cell, row, enumObject, rowIndex) => {
        if (row.CostingStatus === "Pending For Approval") {
            return (
                <>
                    <button className={'user-btn mr5'} onClick={() => this.sendForApprovalOrReject(row.FileNameId, true)} type={'button'}>Approve</button>
                    <button className={'user-btn mr5'} onClick={() => this.sendForApprovalOrReject(row.FileNameId, false)} type={'button'}>Reject</button>
                    {row.NoOfIncorrectRow > 0 && <button className={'user-btn mr5'} onClick={() => this.downloadErrorFile(row.FileNameId)} type={'button'}>Download Error File</button>}
                </>
            )
        }
        else if (row.CostingStatus === "Error") {
            return <button className={'user-btn mr5'} onClick={() => this.downloadErrorFile(row.FileNameId)} type={'button'}>Download Error File</button>
        }
        else if (row.NoOfIncorrectRow > 0) {
            return <button className={'user-btn mr5'} onClick={() => this.downloadErrorFile(row.FileNameId)} type={'button'}>Download Error File</button>
        }

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

                    <BootstrapTable
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
                    </BootstrapTable>

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