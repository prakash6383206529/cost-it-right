import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { } from '../../../actions/Common';
import { getPartDataList, deletePart, activeInactivePartStatus, checkStatusCodeAPI, } from '../actions/Part';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import Switch from "react-switch";
import DayTime from '../../common/DayTimeWrapper'
import { loggedInUserId } from '../../../helper/auth';
import BulkUpload from '../../massUpload/BulkUpload';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import LoaderCustom from '../../common/LoaderCustom';
import { ComponentPart } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { INDIVIDUALPART_DOWNLOAD_EXCEl } from '../../../config/masterData';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import WarningMessage from '../../common/WarningMessage'
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { filterParams } from '../../common/DateFilter'

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;


const gridOptions = {

    pagination: true,
    //rowModelType: 'infinite',
    cacheBlockSize: 10, // you can have your custom page size
    paginationPageSize: 10
};



class IndivisualPartListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            isOpen: false,
            tableData: [],
            startIndexCurrentPage: 0,
            endIndexCurrentPage: 9,
            totalRecordCount: 0,
            pageNo: 1,
            floatingFilterData: { Technology: "", PartNumber: "", PartName: "", ECNNumber: "", RevisionNumber: "", DrawingNumber: "", EffectiveDate: "" },
            currentRowIndex: 0,
            warningMessage: false,
            isBulkUpload: false,
            ActivateAccessibility: true,
            isLoader: false,
            showPopup: false,
            deletedId: ''
        }
    }




    ApiActionCreator(skip, take, obj, isPagination) {
      this.setState({isLoader:true})

        this.props.getPartDataList(skip, take, obj, isPagination, (res) => {
            this.setState({isLoader:false})

            if (res.status === 202) {
                this.setState({ pageNo: 0 })
                this.setState({ totalRecordCount: 0 })

                return
            }
            else if (res.status === 204 && res.data === '') {
                this.setState({ tableData: [], })
            } else if (res && res.data && res.data.DataList) {

                let Data = res.data.DataList;

                this.setState({
                    tableData: Data,
                    totalRecordCount: Data[0].TotalRecordCount,

                })

            } else {

            }
        })

    }


    onBtNext(data) {

        if (data.state.currentRowIndex < (this.state.totalRecordCount - 10)) {

            data.setState({ pageNo: data.state.pageNo + 1 })

            const nextNo = data.state.currentRowIndex + 10;

            data.ApiActionCreator(nextNo, 100, this.state.floatingFilterData, true)
            data.setState({ currentRowIndex: nextNo })
        }

    };

    onBtPrevious(data) {

        if (data.state.currentRowIndex >= 10) {

            data.setState({ pageNo: data.state.pageNo - 1 })
            const previousNo = data.state.currentRowIndex - 10;

            data.ApiActionCreator(previousNo, 100, this.state.floatingFilterData, true)
            data.setState({ currentRowIndex: previousNo })

        }


    };


    onSearch(data) {

        this.setState({ warningMessage: false })
        this.setState({ pageNo: 1 })
        data.setState({ currentRowIndex: 0 })
        data.ApiActionCreator(0, 100, this.state.floatingFilterData, true)
        data.setState({ enableExitFilterSearchButton: true })

    }

    onSearchExit(data) {

        this.setState({ floatingFilterData: { Technology: "", PartNumber: "", PartName: "", ECNNumber: "", RevisionNumber: "", DrawingNumber: "", EffectiveDate: "" } })
        let emptyObj = { Technology: "", PartNumber: "", PartName: "", ECNNumber: "", RevisionNumber: "", DrawingNumber: "", EffectiveDate: "" }
        data.setState({ pageNo: 1 })
        data.ApiActionCreator(0, 100, emptyObj, true)
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);

    }



    onFloatingFilterChanged = (value) => {
        this.setState({ warningMessage: true })
        this.setState({ enableSearchFilterSearchButton: true })

        if (value?.filterInstance?.appliedModel === null || value?.filterInstance?.appliedModel?.filter === "") {
            this.setState({ warningMessage: false })

            return false
        } else {

            if (value.column.colId === 'Technology') { this.setState({ floatingFilterData: { ...this.state.floatingFilterData, Technology: value.filterInstance.appliedModel.filter } }) }
            if (value.column.colId === 'PartNumber') { this.setState({ floatingFilterData: { ...this.state.floatingFilterData, PartNumber: value.filterInstance.appliedModel.filter } }) }

            if (value.column.colId === 'PartName') { this.setState({ floatingFilterData: { ...this.state.floatingFilterData, PartName: value.filterInstance.appliedModel.filter } }) }
            if (value.column.colId === 'ECNNumber') { this.setState({ floatingFilterData: { ...this.state.floatingFilterData, ECNNumber: value.filterInstance.appliedModel.filter } }) }

            if (value.column.colId === 'RevisionNumber') { this.setState({ floatingFilterData: { ...this.state.floatingFilterData, RevisionNumber: value.filterInstance.appliedModel.filter } }) }

            if (value.column.colId === 'DrawingNumber') { this.setState({ floatingFilterData: { ...this.state.floatingFilterData, DrawingNumber: value.filterInstance.appliedModel.filter } }) }
            if (value.column.colId === 'EffectiveDate') { this.setState({ floatingFilterData: { ...this.state.floatingFilterData, EffectiveDate: value.filterInstance.appliedModel.filter } }) }


        }

    }



    componentDidMount() {
        this.ApiActionCreator(0, 100, this.state.floatingFilterData, true)


    }



    // Get updated list after any action performed.
    getUpdatedData = () => {
        this.setState( () => {
            this.getTableListData()
        })
    }

    /**
    * @method getTableListData
    * @description Get DATA LIST
    */
    getTableListData = () => {
        this.setState({isLoader:true})
        this.props.getPartDataList((res) => {
            this.setState({isLoader:false})
            if (res.status === 204 && res.data === '') {
                this.setState({ tableData: [], })
            } else if (res && res.data && res.data.DataList) {
                let Data = res.data.DataList;
                this.setState({
                    tableData: Data,
                })
            } else {

            }
        })
    }

    /**
    * @method editItemDetails
    * @description confirm edit item
    */
    viewOrEditItemDetails = (Id, isViewMode) => {
        let requestData = {
            isEditFlag: true,
            Id: Id,
            isViewMode: isViewMode,
        }
        this.props.getDetails(requestData)
    }

    /**
    * @method deleteItem
    * @description confirm delete part
    */
    deleteItem = (Id) => {
        this.setState({ showPopup: true, deletedId: Id })
    }

    /**
    * @method confirmDeleteItem
    * @description confirm delete user item
    */
    confirmDeleteItem = (ID) => {
        this.props.deletePart(ID, (res) => {
            if (res.data.Result === true) {
                Toaster.success(MESSAGES.PART_DELETE_SUCCESS);
                //this.getTableListData();
                this.ApiActionCreator(this.state.currentRowIndex, 100, this.state.floatingFilterData, true)
            }
        });
        this.setState({ showPopup: false })
    }

    onPopupConfirm = () => {
        this.confirmDeleteItem(this.state.deletedId);
    }
    closePopUp = () => {
        this.setState({ showPopup: false })
    }
    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    buttonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

        const { EditAccessibility, DeleteAccessibility, ViewAccessibility } = this.props;
        return (
            <>
                {ViewAccessibility && <button className="View mr-2" type={'button'} onClick={() => this.viewOrEditItemDetails(cellValue, true)} />}
                {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => this.viewOrEditItemDetails(cellValue, false)} />}
                {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
            </>
        )
    };

    /**
     * @method hyphenFormatter
     */
    hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }

    handleChange = (cell, row, enumObject, rowIndex) => {
        let data = {
            Id: row.PartId,
            ModifiedBy: loggedInUserId(),
            IsActive: !cell, //Status of the user.
        }
        this.props.activeInactivePartStatus(data, res => {
            if (res && res.data && res.data.Result) {

                this.getTableListData()
            }
        })
    }

    /**
    * @method statusButtonFormatter
    * @description Renders buttons
    */
    statusButtonFormatter = (cell, row, enumObject, rowIndex) => {
        const { ActivateAccessibility } = this.state;
        if (ActivateAccessibility) {
            return (
                <>
                    <label htmlFor="normal-switch" className="normal-switch">

                        <Switch
                            onChange={() => this.handleChange(cell, row, enumObject, rowIndex)}
                            checked={cell}
                            background="#ff6600"
                            onColor="#4DC771"
                            onHandleColor="#ffffff"
                            offColor="#FC5774"
                            id="normal-switch"
                            height={24}
                        />
                    </label>
                </>
            )
        } else {
            return (
                <>
                    {
                        cell ?
                            <div className={'Activated'}> {'Active'}</div>
                            :
                            <div className={'Deactivated'}>{'Deactive'}</div>
                    }
                </>
            )
        }
    }

    /**
    * @method indexFormatter
    * @description Renders serial number
    */
    indexFormatter = (cell, row, enumObject, rowIndex) => {
        let currentPage = this.refs.table.state.currPage;
        let sizePerPage = this.refs.table.state.sizePerPage;
        let serialNumber = '';
        if (currentPage === 1) {
            serialNumber = rowIndex + 1;
        } else {
            serialNumber = (rowIndex + 1) + (sizePerPage * (currentPage - 1));
        }
        return serialNumber;
    }

    /**
    * @method effectiveDateFormatter
    * @description Renders buttons
    */
    effectiveDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
    }
    renderEffectiveDate = () => {
        return <> Effective <br /> Date </>
    }

    onExportToCSV = (row) => {
        return this.state.userData; // must return the data which you want to be exported
    }

    renderPaginationShowsTotal(start, to, total) {
        return <GridTotalFormate start={start} to={to} total={total} />
    }

    bulkToggle = () => {
        this.setState({ isBulkUpload: true })
    }

    closeBulkUploadDrawer = () => {
        this.setState({ isBulkUpload: false }, () => {
            this.getTableListData()
        })
    }

    formToggle = () => {
        this.props.formToggle()
    }

    closeBulkUploadDrawer = () => {
        this.setState({ isBulkUpload: false }, () => {
        })
    }



    onGridReady = (params) => {
        this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
        params.api.paginationGoToPage(0);

        // dont remove this
        // var allColumnIds = [];
        // params.columnApi.getAllColumns().forEach(function (column) {
        //     allColumnIds.push(column.colId);
        // });
        // params.columnApi.autoSizeColumns(allColumnIds);
        // dont remove this

        //if resolution greater than 1920 table listing fit to 100%
        window.screen.width >= 1600 && params.api.sizeColumnsToFit()
        //if resolution greater than 1920 table listing fit to 100%
    };

    onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        this.state.gridApi.paginationSetPageSize(Number(value));
    };

    onBtExport = () => {
        let tempArr = this.props.newPartsListing && this.props.newPartsListing

        return this.returnExcelColumn(INDIVIDUALPART_DOWNLOAD_EXCEl, tempArr)
    };

    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData && TempData.map((item) => {
            if (item.ECNNumber === null) {
                item.ECNNumber = ' '
            } else if (item.RevisionNumber === null) {
                item.RevisionNumber = ' '
            } else if (item.DrawingNumber === null) {
                item.DrawingNumber = ' '
            } else if (item.Technology === '-') {
                item.Technology = ' '
            }

            return item
        })
        return (

            <ExcelSheet data={temp} name={ComponentPart}>
                {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
    }




    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isBulkUpload } = this.state;
        const { AddAccessibility, BulkUploadAccessibility, DownloadAccessibility } = this.props;
        const ExcelFile = ReactExport.ExcelFile;

        const onExportToCSV = (row) => {
            // ...
            let products = []
            products = this.props.newPartsListing
            return products; // must return the data which you want to be exported
        }

        const options = {
            clearSearch: true,
            noDataText: <NoContentFound title={EMPTY_DATA} />,
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
            customNoRowsOverlay: NoContentFound,
            hyphenFormatter: this.hyphenFormatter,
            effectiveDateFormatter: this.effectiveDateFormatter
        };
        return (
            <>
                <div className={`ag-grid-react part-manage-component ${DownloadAccessibility ? "show-table-btn" : ""}`}>
                  {this.state.isLoader && <LoaderCustom />}
                    <Row className="pt-3 no-filter-row">
                        <Col md="8">
                            <div className="warning-message mt-1">
                                {this.state.warningMessage && <WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} />}
                            </div>
                        </Col>
                        <Col md="6" className="search-user-block pr-0">
                            <div className="d-flex justify-content-end bd-highlight w100">
                                <div>
                                    <button title="Filtered data" type="button" class="user-btn mr5" onClick={() => this.onSearch(this)}><div class="filter mr-0"></div></button>
                                    {AddAccessibility && (
                                        <button
                                            type="button"
                                            className={'user-btn mr5'}
                                            title="Add"
                                            onClick={this.formToggle}>
                                            <div className={'plus mr-0'}></div></button>
                                    )}
                                    {BulkUploadAccessibility && (
                                        <button
                                            type="button"
                                            className={"user-btn mr5"}
                                            onClick={this.bulkToggle}
                                            title="Bulk Upload"
                                        >
                                            <div className={"upload mr-0"}></div>
                                            {/* Bulk Upload */}
                                        </button>
                                    )}
                                    {
                                        DownloadAccessibility &&
                                        <>

                                            <ExcelFile filename={'Component Part'} fileExtension={'.xls'} element={
                                                <button type="button" className={'user-btn mr5'}><div className="download mr-0" title="Download"></div>
                                                    {/* DOWNLOAD */}
                                                </button>}>

                                                {this.onBtExport()}
                                            </ExcelFile>

                                        </>
                                    }
                                    <button type="button" className="user-btn" title="Reset Grid" onClick={() => this.onSearchExit(this)}>
                                        <div className="refresh mr-0"></div>
                                    </button>

                                </div>
                            </div>
                        </Col>
                    </Row>
                    <div className={`ag-grid-wrapper height-width-wrapper ${this.props.newPartsListing && this.props.newPartsListing?.length <= 0 ? "overlay-contain" : ""}`}>
                        <div className="ag-grid-header mt-4 pt-1">

                        </div>
                        <div className="ag-theme-material">
                            <AgGridReact
                                defaultColDef={defaultColDef}
                                floatingFilter={true}
                                domLayout='autoHeight'
                                rowData={this.props.newPartsListing}
                                pagination={true}
                                paginationPageSize={10}
                                onGridReady={this.onGridReady}
                                gridOptions={gridOptions}
                                onFilterModified={this.onFloatingFilterChanged}
                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                noRowsOverlayComponentParams={{
                                    title: EMPTY_DATA,
                                    imagClass: 'imagClass'

                                }}
                                frameworkComponents={frameworkComponents}
                            >
                                <AgGridColumn field="Technology" headerName="Technology" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                <AgGridColumn field="PartNumber" headerName="Part No."></AgGridColumn>
                                <AgGridColumn field="PartName" headerName="Name"></AgGridColumn>
                                <AgGridColumn field="ECNNumber" headerName="ECN No." cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                <AgGridColumn field="RevisionNumber" headerName="Revision No." cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                <AgGridColumn field="DrawingNumber" headerName="Drawing No." cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={'effectiveDateFormatter'}  filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                                <AgGridColumn field="PartId" headerName="Action" width={160} type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                            </AgGridReact>
                            <div className="button-wrapper">
                                <div className="paging-container d-inline-block float-right">
                                    <select className="form-control paging-dropdown" onChange={(e) => this.onPageSizeChanged(e.target.value)} id="page-size">
                                        <option value="10" selected={true}>10</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
                                </div>
                                <div className="d-flex pagination-button-container">
                                    <p><button className="previous-btn" type="button" disabled={this.state.pageNo === 1 ? true : false} onClick={() => this.onBtPrevious(this)}> </button></p>
                                    <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{this.state.pageNo}</span> of {Math.ceil(this.state.totalRecordCount / 10)}</p>
                                    <p><button className="next-btn" type="button" onClick={() => this.onBtNext(this)}> </button></p>
                                </div>
                            </div>
                        </div>
                    </div>


                    {isBulkUpload && <BulkUpload
                        isOpen={isBulkUpload}
                        closeDrawer={this.closeBulkUploadDrawer}
                        isEditFlag={false}
                        fileName={'PartComponent'}
                        isZBCVBCTemplate={false}
                        messageLabel={'Part'}
                        anchor={'right'}
                    />}
                    {
                        this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.CONFIRM_DELETE}`} />
                    }
                </div >
            </>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ part, auth }) {
    const { newPartsListing } = part
    const { initialConfiguration } = auth;

    return { newPartsListing, initialConfiguration };
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/

export default connect(mapStateToProps, {
    getPartDataList,
    deletePart,
    activeInactivePartStatus,
    checkStatusCodeAPI,
})(IndivisualPartListing);
