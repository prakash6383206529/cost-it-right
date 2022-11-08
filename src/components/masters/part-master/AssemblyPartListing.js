import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { getAssemblyPartDataList, deleteAssemblyPart, } from '../actions/Part';
import { } from '../../../actions/Common';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { defaultPageSize, EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import DayTime from '../../common/DayTimeWrapper'
import { GridTotalFormate } from '../../common/TableGridFunctions';
import BOMViewer from './BOMViewer';
import BOMUploadDrawer from '../../massUpload/BOMUpload';
import LoaderCustom from '../../common/LoaderCustom';
import { AssemblyPart } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { ASSEMBLYPART_DOWNLOAD_EXCEl } from '../../../config/masterData';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { filterParams } from '../../common/DateFilter'
import { PaginationWrapper } from '../../common/commonPagination';
import { searchNocontentFilter } from '../../../helper';
import SelectRowWrapper from '../../common/SelectRowWrapper';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};



class AssemblyPartListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            isOpen: false,
            tableData: [],
            disableDownload: false,
            isOpenVisualDrawer: false,
            visualAdId: '',
            BOMId: '',
            isBulkUpload: false,
            showPopup: false,
            deletedId: '',
            isLoader: false,
            selectedRowData: false,
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

    // Get updated user list after any action performed.
    getUpdatedData = () => {
        if (!this.props.stopApiCallOnCancel) {
            this.getTableListData()
        }
    }

    /**
    * @method getTableListData
    * @description Get user list data
    */
    getTableListData = () => {
        this.setState({ isLoader: true })
        this.props.getAssemblyPartDataList((res) => {
            this.setState({ isLoader: false })
            if (res.status === 204 && res.data === '') {
                this.setState({ tableData: [], isLoader: false })
            } else if (res && res.data && res.data.DataList) {
                let Data = res.data.DataList;
                this.setState({
                    tableData: Data,
                    isLoader: false
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
    * @description CONFIRM DELETE PART
    */
    deleteItem = (Id) => {
        this.setState({ showPopup: true, deletedId: Id })
    }

    /**
    * @method confirmDeleteItem
    * @description DELETE ASSEMBLY PART
    */
    confirmDeleteItem = (ID) => {
        this.props.deleteAssemblyPart(ID, (res) => {
            if (res.data.Result === true) {
                Toaster.success(MESSAGES.DELETE_BOM_SUCCESS);
                this.getTableListData();
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

    renderNumberOfParts = () => {
        return <>No. of <br />Child Parts </>
    }
    renderBOMLevelCount = () => {
        return <>BOM <br />Level Count</>
    }


    /**
    * @method visualAdDetails
    * @description Renders buttons
    */
    visualAdDetails = (cell) => {
        this.setState({ visualAdId: cell, isOpenVisualDrawer: true })
    }
    /**
       * @method onFloatingFilterChanged
       * @description Filter data when user type in searching input
       */
    onFloatingFilterChanged = (value) => {
        this.props.partsListing.length !== 0 && this.setState({ noData: searchNocontentFilter(value, this.state.noData) })
    }
    /**
    * @method closeVisualDrawer
    * @description CLOSE VISUAL AD DRAWER
    */
    closeVisualDrawer = () => {
        this.setState({ isOpenVisualDrawer: false, visualAdId: '', })
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
                {ViewAccessibility && <button title='View BOM' className="hirarchy-btn" type={'button'} onClick={() => this.visualAdDetails(cellValue)} />}
                {ViewAccessibility && <button title='View' className="View" type={'button'} onClick={() => this.viewOrEditItemDetails(cellValue, true)} />}
                {EditAccessibility && <button title='Edit' className="Edit" type={'button'} onClick={() => this.viewOrEditItemDetails(cellValue, false)} />}
                {DeleteAccessibility && <button title='Delete' className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
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

    onExportToCSV = (row) => {
        return this.state.userData; // must return the data which you want to be exported
    }

    renderPaginationShowsTotal(start, to, total) {
        return <GridTotalFormate start={start} to={to} total={total} />
    }

    formToggle = () => {
        this.props.formToggle()
    }

    displayForm = () => {
        this.props.displayForm()
    }


    bulkToggle = () => {
        this.setState({ isBulkUpload: true })
    }

    closeBulkUploadDrawer = (isCancel) => {
        this.setState({ isBulkUpload: false }, () => {
        })
        if (!isCancel) {
            this.getTableListData();
        }
    }

    onGridReady = (params) => {
        this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
        params.api.paginationGoToPage(0);
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
        tempArr = (tempArr && tempArr?.length > 0) ? tempArr : (this.props.partsListing ? this.props.partsListing : [])
        return this.returnExcelColumn(ASSEMBLYPART_DOWNLOAD_EXCEl, tempArr)
    };

    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData && TempData.map((item) => {
            if (item.Technology === '-') {
                item.Technology = ' '
            }
            if (item.EffectiveDate.includes('T')) {
                item.EffectiveDate = DayTime(item.EffectiveDate).format('DD/MM/YYYY')
            }
            return item
        })
        return (

            <ExcelSheet data={temp} name={AssemblyPart}>
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
        const { isOpenVisualDrawer, isBulkUpload, noData } = this.state;
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
            hyphenFormatter: this.hyphenFormatter,
            visualAdFormatter: this.visualAdFormatter,
            effectiveDateFormatter: this.effectiveDateFormatter
        };

        return (
            <div className={`ag-grid-react p-relative ${DownloadAccessibility ? "show-table-btn" : ""}`}>
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
                                        onClick={this.displayForm}>
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
                                        <ExcelFile filename={'BOM'} fileExtension={'.xls'} element={
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


                <div className={`ag-grid-wrapper height-width-wrapper ${(this.props.partsListing && this.props.partsListing?.length <= 0) || noData ? "overlay-contain" : ""}`}>
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
                            rowData={this.props.partsListing}
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
                            <AgGridColumn cellClass="has-checkbox" field="Technology" headerName="Technology" cellRenderer={'checkBoxRenderer'}></AgGridColumn>
                            <AgGridColumn field="BOMNumber" headerName="BOM No."></AgGridColumn>
                            <AgGridColumn field="PartNumber" headerName="Part No."></AgGridColumn>
                            <AgGridColumn field="PartName" headerName="Name"></AgGridColumn>
                            <AgGridColumn field="NumberOfParts" headerName="No. of Child Parts"></AgGridColumn>
                            <AgGridColumn field="BOMLevelCount" headerName="BOM Level Count"></AgGridColumn>
                            <AgGridColumn field="ECNNumber" headerName="ECN No." cellRenderer={'hyphenFormatter'}></AgGridColumn>
                            <AgGridColumn field="RevisionNumber" headerName="Revision No." cellRenderer={'hyphenFormatter'}></AgGridColumn>
                            <AgGridColumn field="DrawingNumber" headerName="Drawing No." cellRenderer={'hyphenFormatter'}></AgGridColumn>
                            <AgGridColumn field="EffectiveDateNew" headerName="Effective Date" cellRenderer={'effectiveDateFormatter'} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                            <AgGridColumn field="PartId" width={180} headerName="Action" cellClass={"actions-wrapper"} pinned="right" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                        </AgGridReact>
                        {<PaginationWrapper gridApi={this.gridApi} setPage={this.onPageSizeChanged} />}
                    </div>
                </div>

                {isOpenVisualDrawer && <BOMViewer
                    isOpen={isOpenVisualDrawer}
                    closeDrawer={this.closeVisualDrawer}
                    isEditFlag={true}
                    PartId={this.state.visualAdId}
                    anchor={'right'}
                    isFromVishualAd={true}
                    NewAddedLevelOneChilds={[]}
                />}
                {isBulkUpload && <BOMUploadDrawer
                    isOpen={isBulkUpload}
                    closeDrawer={this.closeBulkUploadDrawer}
                    isEditFlag={false}
                    fileName={'BOM'}
                    messageLabel={'BOM'}
                    anchor={'right'}
                />}
                {
                    this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.BOM_DELETE_ALERT}`} />
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
    const { partsListing } = part
    const { initialConfiguration } = auth;

    return { partsListing, initialConfiguration };
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/

export default connect(mapStateToProps,
    {
        getAssemblyPartDataList,
        deleteAssemblyPart,
    })(AssemblyPartListing);
