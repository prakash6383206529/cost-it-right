import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { } from '../../../actions/Common';
import { getProductDataList, deleteProduct, activeInactivePartStatus, checkStatusCodeAPI, } from '../actions/Part';
import { MESSAGES } from '../../../config/message';
import { defaultPageSize, EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import Switch from "react-switch";
import DayTime from '../../common/DayTimeWrapper'
import { loggedInUserId } from '../../../helper/auth';
import BulkUpload from '../../massUpload/BulkUpload';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import LoaderCustom from '../../common/LoaderCustom';
import Toaster from '../../common/Toaster';
import { ComponentPart } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { INDIVIDUAL_PRODUCT_DOWNLOAD_EXCEl } from '../../../config/masterData';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { filterParams } from '../../common/DateFilter'
import { PaginationWrapper } from '../../common/commonPagination';
import { hyphenFormatter } from '../masterUtil';
import { searchNocontentFilter } from '../../../helper';
import SelectRowWrapper from '../../common/SelectRowWrapper';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};



class IndivisualProductListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            isOpen: false,
            tableData: [],
            selectedRowData: false,
            isBulkUpload: false,
            ActivateAccessibility: true,
            showPopup: false,
            deletedId: '',
            isLoader: false,
            noData: false,
            dataCount: 0
        }
    }

    componentDidMount() {
        setTimeout(() => {
            if (!this.props.stopApiCallOnCancel) {
                this.getTableListData();
            }
        }, 300);
    }

    /**
    * @method getTableListData
    * @description Get DATA LIST
    */
    getTableListData = () => {
        this.setState({ isLoader: true })
        this.props.getProductDataList((res) => {
            this.setState({ isLoader: false })
            if (res.status === 204 && res.data === '') {
                this.setState({ tableData: [], isLoader: false })
            } else if (res && res.data && res.data.DataList) {

                let Data = res.data.DataList;
                this.setState({
                    tableData: Data
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
   * @method onFloatingFilterChanged
   * @description Filter data when user type in searching input
   */
    onFloatingFilterChanged = (value) => {
        this.props.productDataList.length !== 0 && this.setState({ noData: searchNocontentFilter(value, this.state.noData) })
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
        this.props.deleteProduct(ID, (res) => {
            if (res.data.Result === true) {
                Toaster.success(MESSAGES.PRODUCT_DELETE_SUCCESS);

                this.getTableListData();
                this.setState({ dataCount: 0 })
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
        const { EditAccessibility, DeleteAccessibility, ViewAccessibility } = this.props;
        return (
            <>
                {ViewAccessibility && <button title='View' className="View mr-2" type={'button'} onClick={() => this.viewOrEditItemDetails(cellValue, true)} />}
                {EditAccessibility && <button title='Edit' className="Edit mr-2" type={'button'} onClick={() => this.viewOrEditItemDetails(cellValue, false)} />}
                {DeleteAccessibility && <button title='Delete' className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
            </>
        )
    };



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
        let cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;

        if (cellValue !== null && cellValue.includes('T')) {
            cellValue = DayTime(cellValue).format('DD/MM/YYYY')
            return cellValue
        } else {
            return cellValue != null ? cellValue : '-'
        }
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
        this.getTableListData()
        this.setState({ isBulkUpload: false })
    }

    formToggle = () => {
        this.props.formToggle()
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
        window.screen.width >= 1920 && params.api.sizeColumnsToFit()
        //if resolution greater than 1920 table listing fit to 100%
    };

    onPageSizeChanged = (newPageSize) => {
        this.state.gridApi.paginationSetPageSize(Number(newPageSize));
    };
    onRowSelect = () => {
        const selectedRows = this.state.gridApi?.getSelectedRows()
        this.setState({ selectedRowData: selectedRows, dataCount: selectedRows.length })
    }
    onBtExport = () => {
        let tempArr = []
        tempArr = this.state.gridApi && this.state.gridApi?.getSelectedRows()
        tempArr = (tempArr && tempArr.length > 0) ? tempArr : (this.props.productDataList ? this.props.productDataList : [])
        return this.returnExcelColumn(INDIVIDUAL_PRODUCT_DOWNLOAD_EXCEl, tempArr)
    };

    returnExcelColumn = (data = [], tempArr) => {
        let temp = tempArr
        temp && temp.map((item) => {
            if (item.ECNNumber === null) {
                item.ECNNumber = ' '
            } if (item.RevisionNumber === null) {
                item.RevisionNumber = ' '
            } if (item.DrawingNumber === null) {
                item.DrawingNumber = ' '
            } if (item.EffectiveDate?.includes('T')) {
                item.EffectiveDate = DayTime(item.EffectiveDate).format('DD/MM/YYYY')
            }
            return item
        })
        return (

            <ExcelSheet data={temp} name={ComponentPart}>
                {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
    }

    onFilterTextBoxChanged(e) {
        this.state.gridApi.setQuickFilter(e.target.value);
    }

    resetState() {
        this.state.gridApi.deselectAll()
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);
    }


    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isBulkUpload, noData } = this.state;
        const { AddAccessibility, BulkUploadAccessibility, DownloadAccessibility } = this.props;

        const isFirstColumn = (params) => {
            var displayedColumns = params.columnApi.getAllDisplayedColumns();
            var thisIsFirstColumn = displayedColumns[0] === params.column;
            return thisIsFirstColumn;
        }

        const defaultColDef = {
            resizable: true,
            filter: true,
            sortable: false,
            headerCheckboxSelectionFilteredOnly: true,
            checkboxSelection: isFirstColumn
        };

        const frameworkComponents = {
            totalValueRenderer: this.buttonFormatter,
            customNoRowsOverlay: NoContentFound,
            effectiveDateFormatter: this.effectiveDateFormatter,
            hyphenFormatter: hyphenFormatter
        };

        return (
            <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>
                {this.state.isLoader && <LoaderCustom />}
                <Row className="pt-4 no-filter-row">
                    <Col md="8" className="filter-block">

                    </Col>
                    <Col md="6" className="search-user-block pr-0">
                        <div className="d-flex justify-content-end bd-highlight w100">
                            <div>
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
                                        <ExcelFile filename={'Product'} fileExtension={'.xls'} element={
                                            <button type="button" className={'user-btn mr5'}><div className="download mr-0" title="Download"></div>
                                            </button>}>
                                            {this.onBtExport()}
                                        </ExcelFile>
                                    </>
                                }
                                <button type="button" className="user-btn" title="Reset Grid" onClick={() => this.resetState()}>
                                    <div className="refresh mr-0"></div>
                                </button>

                            </div>
                        </div>
                    </Col>
                </Row>

                <div className={`ag-grid-wrapper height-width-wrapper ${(this.props.productDataList && this.props.productDataList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                    <div className="ag-grid-header">
                        <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
                        <SelectRowWrapper dataCount={this.state.dataCount} />
                    </div>
                    <div className={`ag-theme-material ${this.state.isLoader && "max-loader-height"}`}>
                        {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                        <AgGridReact
                            defaultColDef={defaultColDef}
                            floatingFilter={true}
                            domLayout='autoHeight'
                            rowData={this.props.productDataList}
                            pagination={true}
                            paginationPageSize={defaultPageSize}
                            onGridReady={this.onGridReady}
                            gridOptions={gridOptions}
                            noRowsOverlayComponent={'customNoRowsOverlay'}
                            noRowsOverlayComponentParams={{
                                title: EMPTY_DATA,
                                imagClass: 'imagClass'
                            }}
                            rowSelection={'multiple'}
                            onSelectionChanged={this.onRowSelect}
                            frameworkComponents={frameworkComponents}
                            onFilterModified={this.onFloatingFilterChanged}
                            suppressRowClickSelection={true}
                        >

                            <AgGridColumn field="ProductNumber" headerName="Product No."></AgGridColumn>
                            <AgGridColumn field="ProductName" headerName="Name"></AgGridColumn>
                            {/* <AgGridColumn field="ProductGroupCode" headerName="Group Code" cellRenderer={"hyphenFormatter"}></AgGridColumn> */}
                            <AgGridColumn field="ECNNumber" headerName="ECN No." cellRenderer={'hyphenFormatter'}></AgGridColumn>
                            <AgGridColumn field="RevisionNumber" headerName="Revision No." cellRenderer={'hyphenFormatter'}></AgGridColumn>
                            <AgGridColumn field="DrawingNumber" headerName="Drawing No." cellRenderer={'hyphenFormatter'}></AgGridColumn>
                            <AgGridColumn field="IsConsideredForMBOM" headerName="Preferred for Impact Calculation" ></AgGridColumn>
                            <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={'effectiveDateFormatter'} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                            <AgGridColumn field="ProductId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                        </AgGridReact>
                        {<PaginationWrapper gridApi={this.gridApi} setPage={this.onPageSizeChanged} />}
                    </div>
                </div>


                {isBulkUpload && <BulkUpload
                    isOpen={isBulkUpload}
                    closeDrawer={this.closeBulkUploadDrawer}
                    isEditFlag={false}
                    fileName={'ProductComponent'}
                    isZBCVBCTemplate={false}
                    messageLabel={'Product'}
                    anchor={'right'}
                />}
                {
                    this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.CONFIRM_DELETE}`} />
                }
            </div >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ part, auth }) {
    const { newPartsListing, productDataList } = part
    const { initialConfiguration } = auth;

    return { newPartsListing, initialConfiguration, productDataList };
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/

export default connect(mapStateToProps, {
    getProductDataList,
    deleteProduct,
    activeInactivePartStatus,
    checkStatusCodeAPI,
})(IndivisualProductListing);
