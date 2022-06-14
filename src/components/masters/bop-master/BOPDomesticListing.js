import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { EMPTY_DATA, BOP_MASTER_ID, BOPDOMESTIC, defaultPageSize } from '../../../config/constants';
import {
    getBOPDomesticDataList, deleteBOP, getBOPCategorySelectList, getAllVendorSelectList,
    getPlantSelectList, getPlantSelectListByVendor,
} from '../actions/BoughtOutParts';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import { onFloatingFilterChanged, onSearch, resetState, onBtPrevious, onBtNext, onPageSizeChanged, PaginationWrapper } from '../../common/commonPagination'
import DayTime from '../../common/DayTimeWrapper'
import BulkUpload from '../../massUpload/BulkUpload';
import { BOP_DOMESTIC_DOWNLOAD_EXCEl, } from '../../../config/masterData';
import LoaderCustom from '../../common/LoaderCustom';
import { getVendorWithVendorCodeSelectList, } from '../actions/Supplier';
import { getFilteredData, loggedInUserId, userDepartmetList, userDetails } from '../../../helper';
import { BopDomestic, } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { getListingForSimulationCombined } from '../../simulation/actions/Simulation';
import { masterFinalLevelUser } from '../../masters/actions/Material'
import WarningMessage from '../../common/WarningMessage';
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

class BOPDomesticListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            tableData: [],
            isBulkUpload: false,
            shown: false,
            costingHead: [],
            BOPCategory: [],
            plant: [],
            vendor: [],
            gridApi: null,
            gridColumnApi: null,
            rowData: null,
            sideBar: { toolPanels: ['columns'] },
            showData: false,
            showPopup: false,
            deletedId: '',
            isLoader: false,
            isFinalApprovar: false,

            //states for pagination purpose
            floatingFilterData: { IsVendor: "", BoughtOutPartNumber: "", BoughtOutPartName: "", BoughtOutPartCategory: "", UOM: "", Specification: "", Plants: "", Vendor: "", BasicRate: "", NetLandedCost: "", EffectiveDateNew: "", DepartmentCode: this.props.isSimulation ? userDepartmetList() : "" },
            warningMessage: false,
            filterModel: {},
            pageNo: 1,
            totalRecordCount: 0,
            isFilterButtonClicked: false,
            currentRowIndex: 0,
            pageSize: { pageSize10: true, pageSize50: false, pageSize100: false },
        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {

        this.props.getBOPCategorySelectList(() => { })
        this.props.getPlantSelectList(() => { })
        this.props.getVendorWithVendorCodeSelectList(() => { })
        this.getDataList("", 0, "", "", 0, 100, true, this.state.floatingFilterData)
        let obj = {
            MasterId: BOP_MASTER_ID,
            DepartmentId: userDetails().DepartmentId,
            LoggedInUserLevelId: userDetails().LoggedInMasterLevelId,
            LoggedInUserId: loggedInUserId()
        }
        this.props.masterFinalLevelUser(obj, (res) => {
            if (res?.data?.Result) {
                this.setState({ isFinalApprovar: res.data.Data.IsFinalApprovar })
            }
        })
    }

    /**
    * @method getDataList
    * @description GET DETAILS OF BOP DOMESTIC
    */
    getDataList = (bopFor = '', CategoryId = 0, vendorId = '', plantId = '', skip = 0, take = 100, isPagination = true, dataObj) => {
        const filterData = {
            bop_for: bopFor,
            category_id: CategoryId,
            vendor_id: vendorId,
            plant_id: plantId,
        }
        const { isMasterSummaryDrawer } = this.props

        if (this.props.isSimulation && this.props.selectionForListingMasterAPI === 'Combined') {
            this.props?.changeSetLoader(true)
            this.props.getListingForSimulationCombined(this.props.objectForMultipleSimulation, BOPDOMESTIC, (res) => {
                this.props?.changeSetLoader(false)

            })
        } else {

            this.setState({ isLoader: true })
            if (isMasterSummaryDrawer !== undefined && !isMasterSummaryDrawer) {
                if (this.props.isSimulation) {
                    this.props?.changeTokenCheckBox(false)
                }

                let constantFilterData = this.state.filterModel
                this.props.getBOPDomesticDataList(filterData, skip, take, isPagination, dataObj, (res) => {
                    this.setState({ isLoader: false })
                    if (this.props.isSimulation) {
                        this.props?.changeTokenCheckBox(true)
                    }
                    if (res && res.status === 200) {
                        let Data = res.data.DataList;
                        this.setState({ tableData: Data })
                    } else if (res && res.response && res.response.status === 412) {
                        this.setState({ tableData: [] })
                    } else {
                        this.setState({ tableData: [] })
                    }


                    if (res) {
                        if (res && res.data && res.data.DataList.length > 0) {
                            this.setState({ totalRecordCount: res.data.DataList[0].TotalRecordCount })
                        }
                        let isReset = true
                        setTimeout(() => {
                            let obj = this.state.floatingFilterData
                            for (var prop in obj) {
                                if (prop !== "DepartmentCode" && obj[prop] !== "") {
                                    isReset = false
                                }
                            }
                            // Sets the filter model via the grid API
                            isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(constantFilterData))

                        }, 300);

                        setTimeout(() => {
                            this.setState({ isFilterButtonClicked: false })
                        }, 600);
                    }
                })
            }
        }
    }


    onFloatingFilterChanged = (value) => {
        onFloatingFilterChanged(value, gridOptions, this)   // COMMON FUNCTION
    }

    onSearch = () => {
        onSearch(gridOptions, this, "BOP")  // COMMON PAGINATION FUNCTION
    }

    resetState = () => {
        resetState(gridOptions, this, "BOP")  //COMMON PAGINATION FUNCTION
    }

    onBtPrevious = () => {
        onBtPrevious(this, "BOP")       //COMMON PAGINATION FUNCTION
    }

    onBtNext = () => {
        onBtNext(this, "BOP")   // COMMON PAGINATION FUNCTION

    };

    onPageSizeChanged = (newPageSize) => {

        onPageSizeChanged(this, newPageSize)  // COMMON PAGINATION FUNCTION
    };

    componentDidUpdate(prevProps, prevState) {
        if (prevState.currentRowIndex !== this.state.currentRowIndex) {
            // Now fetch the new data here.

            if (this.props.bopDomesticList?.length > 0) {

                this.setState({ totalRecordCount: this.props.bopDomesticList[0].TotalRecordCount })

            }
        }
    }

    /**
    * @method editItemDetails
    * @description edit material type
    */
    viewOrEditItemDetails = (Id, rowData, isViewMode) => {
        let data = {
            isEditFlag: true,
            Id: Id,
            IsVendor: rowData.CostingHead,
            isViewMode: isViewMode
        }
        this.props.getDetails(data, rowData?.IsBOPAssociated);
    }


    /**
    * @method deleteItem
    * @description confirm delete Raw Material details
    */
    deleteItem = (Id) => {
        this.setState({ showPopup: true, deletedId: Id })

    }

    /**
    * @method confirmDelete
    * @description confirm delete Raw Material details
    */
    confirmDelete = (ID) => {
        this.props.deleteBOP(ID, (res) => {
            if (res.data.Result === true) {
                Toaster.success(MESSAGES.BOP_DELETE_SUCCESS);
                this.resetState()
            }
        });
        this.setState({ showPopup: false })
    }
    onPopupConfirm = () => {
        this.confirmDelete(this.state.deletedId);
    }
    closePopUp = () => {
        this.setState({ showPopup: false })
    }

    bulkToggle = () => {
        this.setState({ isBulkUpload: true })
    }

    closeBulkUploadDrawer = () => {
        this.setState({ isBulkUpload: false }, () => {
            this.resetState()
        })
    }


    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    buttonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

        const { EditAccessibility, DeleteAccessibility, ViewAccessibility } = this.props;

        let isEditbale = false
        let isDeleteButton = false
        if (EditAccessibility) {
            isEditbale = true
        } else {
            isEditbale = false
        }


        if (DeleteAccessibility && !rowData.IsBOPAssociated) {
            isDeleteButton = true
        } else {
            isDeleteButton = false
        }


        return (
            <>
                {ViewAccessibility && <button title='View' className="View mr-2" type={'button'} onClick={() => this.viewOrEditItemDetails(cellValue, rowData, true)} />}
                {isEditbale && <button title='Edit' className="Edit" type={'button'} onClick={() => this.viewOrEditItemDetails(cellValue, rowData, false)} />}
                {isDeleteButton && <button title='Delete' className="Delete ml-2" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
            </>
        )
    };

    /**
    * @method costingHeadFormatter
    * @description Renders Costing head
    */
    costingHeadFormatter = (props) => {

        let cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        if (cellValue === true) {
            cellValue = 'Vendor Based'
        } else if (cellValue === false) {
            cellValue = 'Zero Based'
        }
        return cellValue          // IN SUMMARY DRAWER COSTING HEAD IS ROWDATA.COSTINGHEAD & IN MAIN DOMESTIC LISTING IT IS CELLVALUE

    }

    formToggle = () => {
        this.props.displayForm()
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {

    }

    /**
    * @method effectiveDateFormatter
    * @description Renders buttons
    */
    effectiveDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
    }

    /**
    * @method hyphenFormatter
    */
    hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }

    onGridReady = (params) => {
        this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
        params.api.paginationGoToPage(0);
    };

    onBtExport = () => {
        let tempArr = []
        if (this.props.isSimulation === true) {
            const data = this.state.gridApi && this.state.gridApi.getModel().rowsToDisplay
            data && data.map((item => (
                tempArr.push(item.data)
            )))
        } else {
            tempArr = this.props.bopDomesticList && this.props.bopDomesticList
        }
        return this.returnExcelColumn(BOP_DOMESTIC_DOWNLOAD_EXCEl, tempArr)
    };

    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData && TempData.map((item) => {
            if (item.IsVendor === true) {
                item.IsVendor = 'Vendor Based'
            } if (item.IsVendor === false) {
                item.IsVendor = 'Zero Based'
            } if (item.Plants === '-') {
                item.Plants = ' '
            } if (item.Vendor === '-') {
                item.Vendor = ' '
            }

            if (item.EffectiveDate.includes('T')) {
                item.EffectiveDate = DayTime(item.EffectiveDate).format('DD/MM/YYYY')
            }

            return item
        })


        return (

            <ExcelSheet data={temp} name={BopDomestic}>
                {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
    }

    onFilterTextBoxChanged(e) {
        this.state.gridApi.setQuickFilter(e.target.value);
    }

    getFilterBOPData = () => {
        if (this.props.isSimulation) {
            return getFilteredData(this.props.bopDomesticList, BOP_MASTER_ID)
        }
        else {
            return this.props.bopDomesticList
        }
    }
    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, AddAccessibility, BulkUploadAccessibility, DownloadAccessibility } = this.props;
        const { isBulkUpload } = this.state;

        var filterParams = {
            date: "",
            comparator: function (filterLocalDateAtMidnight, cellValue) {
                var dateAsString = cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
                var newDate = filterLocalDateAtMidnight != null ? DayTime(filterLocalDateAtMidnight).format('DD/MM/YYYY') : '';
                setDate(newDate)
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


        var setDate = (date) => {
            this.setState({ floatingFilterData: { ...this.state.floatingFilterData, newDate: date } })

        }


        const isFirstColumn = (params) => {
            if (this.props.isSimulation) {

                var displayedColumns = params.columnApi.getAllDisplayedColumns();
                var thisIsFirstColumn = displayedColumns[0] === params.column;

                return thisIsFirstColumn;
            } else {
                return false
            }

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
            totalValueRenderer: this.buttonFormatter,
            customNoRowsOverlay: NoContentFound,
            hyphenFormatter: this.hyphenFormatter,
            costingHeadFormatter: this.costingHeadFormatter,
            effectiveDateFormatter: this.effectiveDateFormatter,
        };

        const onRowSelect = () => {

            var selectedRows = this.state.gridApi.getSelectedRows();
            if (this.props.isSimulation) {
                let length = this.state.gridApi.getSelectedRows().length
                this.props.apply(selectedRows, length)
            }

            this.setState({ selectedRowData: selectedRows })

        }


        return (

            <div className={`ag-grid-react ${(this.props?.isMasterSummaryDrawer === undefined || this.props?.isMasterSummaryDrawer === false) ? "custom-pagination" : ""} ${DownloadAccessibility ? "show-table-btn" : ""}`}>
                {/* {this.state.isLoader && <LoaderCustom />} */}
                {(this.state.isLoader && !this.props.isMasterSummaryDrawer) && <LoaderCustom />}
                < form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate >
                    <Row className={`mt-4 filter-row-large  ${this.props.isSimulation ? 'simulation-filter zindex-0 ' : ''}`}>
                        <Col md="3" lg="3">
                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
                        </Col>
                        <Col md="9" lg="9" className="mb-3">
                            <div className="d-flex justify-content-end bd-highlight w100">
                                {this.state.shown ? (
                                    <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => this.setState({ shown: !this.state.shown })}>
                                        <div className="cancel-icon-white"></div></button>
                                ) : (
                                    <>
                                    </>
                                )}

                                {(this.props?.isMasterSummaryDrawer === undefined || this.props?.isMasterSummaryDrawer === false) &&
                                    <div className="warning-message d-flex align-items-center">
                                        {this.state.warningMessage && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                                    </div>
                                }

                                {(this.props?.isMasterSummaryDrawer === undefined || this.props?.isMasterSummaryDrawer === false) &&
                                    <button disabled={!this.state.warningMessage} title="Filtered data" type="button" class="user-btn mr5" onClick={() => this.onSearch()}><div class="filter mr-0"></div></button>

                                }

                                {AddAccessibility && (
                                    <button
                                        type="button"
                                        className={"user-btn mr5"}
                                        onClick={this.formToggle}
                                        title="Add"
                                    >
                                        <div className={"plus mr-0"}></div>
                                        {/* ADD */}
                                    </button>
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

                                        <ExcelFile filename={'BOP Domestic'} fileExtension={'.xls'} element={
                                            <button type="button" className={'user-btn mr5'}><div className="download mr-0" title="Download"></div>
                                                {/* DOWNLOAD */}
                                            </button>}>

                                            {this.onBtExport()}
                                        </ExcelFile>

                                    </>
                                }
                                <button type="button" className="user-btn" title="Reset Grid" onClick={() => this.resetState()}>
                                    <div className="refresh mr-0"></div>
                                </button>

                            </div>
                        </Col>
                    </Row>

                </form >

                <Row>
                    <Col>

                        <div className={`ag-grid-wrapper  ${this.props.isSimulation ? 'simulation-height' : 'height-width-wrapper'} overlay-contain `}>
                            <div className={`ag-theme-material ${(this.state.isLoader && !this.props.isMasterSummaryDrawer) && "max-loader-height"}`}>
                                <AgGridReact
                                    defaultColDef={defaultColDef}
                                    floatingFilter={true}
                                    domLayout='autoHeight'
                                    rowData={this.getFilterBOPData()}
                                    pagination={true}
                                    paginationPageSize={defaultPageSize}
                                    onGridReady={this.onGridReady}
                                    gridOptions={gridOptions}
                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                    noRowsOverlayComponentParams={{
                                        title: EMPTY_DATA,
                                        imagClass: 'imagClass'
                                    }}
                                    frameworkComponents={frameworkComponents}
                                    rowSelection={'multiple'}
                                    onSelectionChanged={onRowSelect}
                                    onFilterModified={this.onFloatingFilterChanged}
                                >
                                    <AgGridColumn field="IsVendor" headerName="Costing Head" cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                                    <AgGridColumn field="BoughtOutPartNumber" headerName="BOP Part No."></AgGridColumn>
                                    <AgGridColumn field="BoughtOutPartName" headerName="BOP Part Name"></AgGridColumn>
                                    <AgGridColumn field="BoughtOutPartCategory" headerName="BOP Category"></AgGridColumn>
                                    <AgGridColumn field="UOM" headerName="UOM"></AgGridColumn>
                                    <AgGridColumn field="Specification" headerName="Specification" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    <AgGridColumn field="Plants" cellRenderer={'hyphenFormatter'} headerName="Plant(Code)"></AgGridColumn>
                                    <AgGridColumn field="Vendor" headerName="Vendor(Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    <AgGridColumn field="BasicRate" headerName="Basic Rate"></AgGridColumn>
                                    <AgGridColumn field="NetLandedCost" headerName="Net Cost"></AgGridColumn>
                                    <AgGridColumn field="EffectiveDateNew" headerName="Effective Date" cellRenderer={'effectiveDateFormatter'} filter="agDateColumnFilter" filterParams={filterParams} ></AgGridColumn>
                                    {!this.props?.isSimulation && !this.props?.isMasterSummaryDrawer && <AgGridColumn field="BoughtOutPartId" width={160} headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}
                                </AgGridReact>
                                <div className='button-wrapper'>
                                    {<PaginationWrapper gridApi={this.gridApi} setPage={this.onPageSizeChanged} />}
                                    {(this.props?.isMasterSummaryDrawer === undefined || this.props?.isMasterSummaryDrawer === false) &&
                                        <div className="d-flex pagination-button-container">
                                            <p><button className="previous-btn" type="button" disabled={false} onClick={() => this.onBtPrevious()}> </button></p>
                                            {this.state.pageSize.pageSize10 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{this.state.pageNo}</span> of {Math.ceil(this.state.totalRecordCount / 10)}</p>}
                                            {this.state.pageSize.pageSize50 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{this.state.pageNo}</span> of {Math.ceil(this.state.totalRecordCount / 50)}</p>}
                                            {this.state.pageSize.pageSize100 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{this.state.pageNo}</span> of {Math.ceil(this.state.totalRecordCount / 100)}</p>}
                                            <p><button className="next-btn" type="button" onClick={() => this.onBtNext()}> </button></p>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </Col>
                </Row>
                {
                    isBulkUpload && <BulkUpload
                        isOpen={isBulkUpload}
                        closeDrawer={this.closeBulkUploadDrawer}
                        isEditFlag={false}
                        fileName={'BOPDomestic'}
                        isZBCVBCTemplate={true}
                        messageLabel={'BOP Domestic'}
                        anchor={'right'}
                        isFinalApprovar={this.state.isFinalApprovar}
                    />
                }
                {
                    this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.BOP_DELETE_ALERT}`} />
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
function mapStateToProps({ boughtOutparts, supplier, auth, material }) {
    const { bopCategorySelectList, vendorAllSelectList, plantSelectList, bopDomesticList } = boughtOutparts;
    const { vendorWithVendorCodeSelectList } = supplier;
    const { initialConfiguration } = auth;
    return { bopCategorySelectList, plantSelectList, vendorAllSelectList, bopDomesticList, vendorWithVendorCodeSelectList, initialConfiguration }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getBOPDomesticDataList,
    deleteBOP,
    getBOPCategorySelectList,
    getPlantSelectList,
    getAllVendorSelectList,
    getPlantSelectListByVendor,
    getVendorWithVendorCodeSelectList,
    getListingForSimulationCombined,
    masterFinalLevelUser
})(reduxForm({
    form: 'BOPDomesticListing',
    enableReinitialize: true,
})(BOPDomesticListing));
