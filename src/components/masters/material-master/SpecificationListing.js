import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import {
    getRMSpecificationDataList, deleteRMSpecificationAPI, getRMGradeSelectListByRawMaterial, getGradeSelectList,
    getRawMaterialFilterSelectList, getGradeFilterByRawMaterialSelectList, getRawMaterialFilterByGradeSelectList,
} from '../actions/Material';
import { defaultPageSize, EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import AddSpecification from './AddSpecification';
import BulkUpload from '../../massUpload/BulkUpload';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import LoaderCustom from '../../common/LoaderCustom';
import { RmSpecification } from '../../../config/constants';
import { SPECIFICATIONLISTING_DOWNLOAD_EXCEl } from '../../../config/masterData';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { PaginationWrapper } from '../../common/commonPagination';
import { searchNocontentFilter } from '../../../helper';
import SelectRowWrapper from '../../common/SelectRowWrapper';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};


class SpecificationListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            shown: false,
            isEditFlag: false,
            isBulkUpload: false,
            ID: '',
            specificationData: [],
            RawMaterial: [],
            RMGrade: [],
            gridApi: null,
            gridColumnApi: null,
            rowData: null,
            showPopup: false,
            showPopup2: false,
            deletedId: '',
            isLoader: false,
            selectedRowData: false,
            noData: false,
            dataCount: 0
        }
    }

    /**
   * @method componentDidMount
   * @description Called after rendering the component
   */
    componentDidMount() {
        this.getSpecificationListData('', '');
    }

    /**
    * @method getSpecificationListData
    * @description Get user list data
    */
    getSpecificationListData = (materialId = '', gradeId = '') => {
        let data = {
            MaterialId: materialId,
            GradeId: gradeId
        }
        this.setState({ isLoader: true })
        this.props.getRMSpecificationDataList(data, res => {
            if (res.status === 204 && res.data === '') {
                this.setState({ specificationData: [], isLoader: false })
            } else if (res && res.data && res.data.DataList) {
                let Data = res.data.DataList;
                this.setState({ specificationData: Data, isLoader: false })
            }
        });
    }

    /**
    * @method closeDrawer
    * @description  used to cancel filter form
    */
    closeDrawer = (e = '', data, type) => {
        this.setState({ isOpen: false }, () => {
            if (type === 'submit')
                this.getSpecificationListData('', '');
            this.setState({ dataCount: 0 })
        })

    }

    /**
    * @method editItemDetails
    * @description edit RM Specification
    */
    editItemDetails = (Id) => {
        this.setState({
            isEditFlag: true,
            isOpen: true,
            ID: Id,
        })
    }

    /**
    * @method openModel
    * @description  used to open filter form 
    */
    openModel = () => {
        this.setState({
            isOpen: true,
            isEditFlag: false
        })
    }

    /**
    * @method deleteItem
    * @description confirm delete RM Specification
    */
    deleteItem = (Id) => {
        this.setState({ showPopup: true, deletedId: Id })
    }

    /**
    * @method confirmDelete
    * @description confirm delete RM Specification
    */
    confirmDelete = (ID) => {
        this.props.deleteRMSpecificationAPI(ID, (res) => {
            if (res.status === 417 && res.data.Result === false) {
                //Toaster.warning(res.data.Message)
                Toaster.error('The specification is associated in the system. Please remove the association to delete')
            } else if (res && res.data && res.data.Result === true) {
                Toaster.success(MESSAGES.DELETE_SPECIFICATION_SUCCESS);
                this.getSpecificationListData('', '');
                this.setState({ dataCount: 0 })
            }
            this.setState({ showPopup: false })
        });
    }
    onPopupConfirm = () => {
        this.confirmDelete(this.state.deletedId);
    }
    closePopUp = () => {
        this.setState({ showPopup: false })
    }
    /**
    * @method renderPaginationShowsTotal
    * @description Pagination
    */
    renderPaginationShowsTotal(start, to, total) {
        return <GridTotalFormate start={start} to={to} total={total} />
    }

    /**
* @method buttonFormatter
* @description Renders buttons
*/
    buttonFormatter = (props) => {

        const cellValue = props?.value;
        const rowData = props?.data;

        const { EditAccessibility, DeleteAccessibility } = this.props;
        return (
            <>
                {EditAccessibility && <button title='Edit' className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cellValue, rowData)} />}
                {DeleteAccessibility && <button title='Delete' className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
            </>
        )
    };


    /**
    * @method indexFormatter
    * @description Renders serial number
    */
    indexFormatter = (cell, row, enumObject, rowIndex) => {
        const { table } = this.refs;
        let currentPage = table && table.state && table.state.currPage ? table.state.currPage : '';
        let sizePerPage = table && table.state && table.state.sizePerPage ? table.state.sizePerPage : '';
        let serialNumber = '';
        if (currentPage === 1) {
            serialNumber = rowIndex + 1;
        } else {
            serialNumber = (rowIndex + 1) + (sizePerPage * (currentPage - 1));
        }
        return serialNumber;
    }

    /**
    * @method onFloatingFilterChanged
    * @description Filter data when user type in searching input
    */
    onFloatingFilterChanged = (value) => {
        this.props.rmSpecificationList.length !== 0 && this.setState({ noData: searchNocontentFilter(value, this.state.noData) })
    }

    /**
    * @method resetFilter
    * @description Reset user filter
    */


    bulkToggle = () => {
        this.setState({ isBulkUpload: true })
    }

    closeBulkUploadDrawer = () => {
        this.setState({ isBulkUpload: false }, () => {
            this.getSpecificationListData('', '');
        })
    }

    /**
    * @method densityAlert
    * @description confirm Redirection to Material tab.
    */
    densityAlert = () => {
        this.setState({ showPopup2: true })
    }

    /**
    * @method confirmDensity
    * @description confirm density popup.
    */
    confirmDensity = () => {
        this.props.toggle('4')
    }
    onPopupConfirm2 = () => {
        this.confirmDensity(this.state.deletedId);
    }
    closePopUp = () => {
        this.setState({ showPopup: false, showPopup2: false })
    }
    /**
    * @name onSubmit
    * @param values
    * @desc Submit the signup form values.
    * @returns {{}}
    */
    onSubmit(values) {
    }

    onGridReady = (params) => {
        this.gridApi = params.api;
        this.gridApi.sizeColumnsToFit();
        this.setState({ gridApi: params.api, gridColumnApi: params.columnApi });
        params.api.paginationGoToPage(0);
    };

    onPageSizeChanged = (newPageSize) => {
        this.state.gridApi.paginationSetPageSize(Number(newPageSize));
    };

    onBtExport = () => {
        let tempArr = []
        tempArr = this.state.gridApi && this.state.gridApi?.getSelectedRows()

        tempArr = (tempArr && tempArr.length > 0) ? tempArr : (this.props.rmSpecificationList ? this.props.rmSpecificationList : [])
        return this.returnExcelColumn(SPECIFICATIONLISTING_DOWNLOAD_EXCEl, tempArr)
    };

    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData && TempData.map((item) => {
            if (item.RMName === '-') {
                item.RMName = ' '
            } else if (item.RMGrade === '-') {
                item.RMGrade = ' '
            }
            return item
        })
        return (

            <ExcelSheet data={temp} name={RmSpecification}>
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
    hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }
    onRowSelect = () => {
        const selectedRows = this.state.gridApi?.getSelectedRows()
        this.setState({ selectedRowData: selectedRows, dataCount: selectedRows.length })
    }


    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isOpen, isEditFlag, ID, isBulkUpload, noData, dataCount } = this.state;
        const { handleSubmit, AddAccessibility, BulkUploadAccessibility, DownloadAccessibility } = this.props;

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
            hyphenFormatter: this.hyphenFormatter,
            customNoRowsOverlay: NoContentFound,
        };


        return (
            <div className={`ag-grid-react min-height100vh ${DownloadAccessibility ? "show-table-btn" : ""}`}>
                {this.state.isLoader && <LoaderCustom />}
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                    <Row className="pt-4">

                        <Col md={6} className="text-right mb-3 search-user-block">
                            {this.state.shown ? (
                                <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => this.setState({ shown: !this.state.shown })}>
                                    <div className="cancel-icon-white"></div></button>
                            ) : (
                                <>
                                </>
                            )}
                            {AddAccessibility && <button
                                type={'button'}
                                className={'user-btn mr5'}
                                title="Add"
                                onClick={this.openModel}>
                                <div className={'plus mr-0'}></div></button>}
                            {BulkUploadAccessibility && <button
                                type="button"
                                className={"user-btn mr5"}
                                onClick={this.bulkToggle}
                                title="Bulk Upload"
                            >
                                <div className={"upload mr-0"}></div>
                                {/* Bulk Upload */}
                            </button>}
                            {
                                DownloadAccessibility &&
                                <>

                                    <>

                                        <ExcelFile filename={'RMSpecification'} fileExtension={'.xls'} element={
                                            <button title={`Download ${this.state.dataCount === 0 ? "All" : "(" + this.state.dataCount + ")"}`} type="button" className={'user-btn mr5'} ><div className="download mr-1"></div>
                                                {`${this.state.dataCount === 0 ? "All" : "(" + this.state.dataCount + ")"}`}</button>}>
                                            {this.onBtExport()}
                                        </ExcelFile>

                                    </>

                                </>

                                //   <button type="button" className={"user-btn mr5"} onClick={this.onBtExport}><div className={"download"} ></div>Download</button>

                            }
                            <button type="button" className="user-btn" title="Reset Grid" onClick={() => this.resetState()}>
                                <div className="refresh mr-0"></div>
                            </button>

                        </Col>
                    </Row>
                </form>

                <Row>
                    <Col>
                        <div className={`ag-grid-wrapper height-width-wrapper ${(this.props.rmSpecificationList && this.props.rmSpecificationList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                            <div className="ag-grid-header">
                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => this.onFilterTextBoxChanged(e)} />
                            </div>
                            <div className={`ag-theme-material ${this.state.isLoader && "max-loader-height"}`}>
                                {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                                <AgGridReact
                                    defaultColDef={defaultColDef}
                                    floatingFilter={true}
                                    domLayout='autoHeight'
                                    // columnDefs={c}
                                    rowData={this.props.rmSpecificationList}
                                    pagination={true}
                                    paginationPageSize={defaultPageSize}
                                    onGridReady={this.onGridReady}
                                    gridOptions={gridOptions}
                                    rowSelection={'multiple'}
                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                    noRowsOverlayComponentParams={{
                                        title: EMPTY_DATA,
                                        imagClass: 'imagClass'
                                    }}
                                    onSelectionChanged={this.onRowSelect}
                                    frameworkComponents={frameworkComponents}
                                    onFilterModified={this.onFloatingFilterChanged}
                                    suppressRowClickSelection={true}
                                >
                                    <AgGridColumn field="RMName"></AgGridColumn>
                                    <AgGridColumn field="RMGrade"></AgGridColumn>
                                    <AgGridColumn field="RMSpec"></AgGridColumn>
                                    <AgGridColumn field="RawMaterialCode" headerName='Code' cellRenderer='hyphenFormatter'></AgGridColumn>
                                    <AgGridColumn field="SpecificationId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                                </AgGridReact>
                                {<PaginationWrapper gridApi={this.gridApi} setPage={this.onPageSizeChanged} />}
                            </div>
                        </div>
                    </Col>
                </Row>
                {isOpen && <AddSpecification
                    isOpen={isOpen}
                    closeDrawer={this.closeDrawer}
                    isEditFlag={isEditFlag}
                    ID={ID}
                    anchor={'right'}
                    AddAccessibilityRMANDGRADE={this.props.AddAccessibilityRMANDGRADE}
                    EditAccessibilityRMANDGRADE={this.props.EditAccessibilityRMANDGRADE}
                    isRMDomesticSpec={false}
                />}
                {isBulkUpload && <BulkUpload
                    isOpen={isBulkUpload}
                    closeDrawer={this.closeBulkUploadDrawer}
                    isEditFlag={false}
                    densityAlert={this.densityAlert}
                    fileName={'RMSpecification'}
                    messageLabel={'RM Specification'}
                    anchor={'right'}
                />}
                {
                    this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.SPECIFICATION_DELETE_ALERT}`} />
                }
                {
                    this.state.showPopup2 && <PopupMsgWrapper isOpen={this.state.showPopup2} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm2} message={`Recently Created Material Density is not created, Do you want to create?`} />
                }
            </div>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ material }) {
    const { rmSpecificationDetail, filterRMSelectList, rmSpecificationList } = material;
    return { rmSpecificationDetail, filterRMSelectList, rmSpecificationList }
}

export default connect(mapStateToProps, {
    getRMSpecificationDataList,
    deleteRMSpecificationAPI,
    getRMGradeSelectListByRawMaterial,
    getGradeSelectList,
    getRawMaterialFilterSelectList,
    getGradeFilterByRawMaterialSelectList,
    getRawMaterialFilterByGradeSelectList,
})(reduxForm({
    form: 'SpecificationListing',
    enableReinitialize: true,
})(SpecificationListing));
