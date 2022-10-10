import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { EMPTY_DATA, BOP_MASTER_ID, BOPDOMESTIC, defaultPageSize, APPROVED_STATUS } from '../../../config/constants';
import {
    getBOPDomesticDataList, deleteBOP, getAllVendorSelectList, getPlantSelectListByVendor,
} from '../actions/BoughtOutParts';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import { onFloatingFilterChanged, onSearch, resetState, onBtPrevious, onBtNext, onPageSizeChanged, PaginationWrapper } from '../../common/commonPagination'
import DayTime from '../../common/DayTimeWrapper'
import BulkUpload from '../../massUpload/BulkUpload';
import { BOP_DOMESTIC_DOWNLOAD_EXCEl, } from '../../../config/masterData';
import LoaderCustom from '../../common/LoaderCustom';
import { checkForDecimalAndNull, getConfigurationKey, loggedInUserId, searchNocontentFilter, userDepartmetList, userDetails } from '../../../helper';
import { BopDomestic, } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { getListingForSimulationCombined, setSelectedRowForPagination } from '../../simulation/actions/Simulation';
import { masterFinalLevelUser } from '../../masters/actions/Material'
import WarningMessage from '../../common/WarningMessage';
import { hyphenFormatter } from '../masterUtil';
import { disabledClass } from '../../../actions/Common';
import _ from 'lodash';
import SelectRowWrapper from '../../common/SelectRowWrapper';
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
            disableFilter: true,
            disableDownload: false,

            //states for pagination purpose
            floatingFilterData: { CostingHead: "", BoughtOutPartNumber: "", BoughtOutPartName: "", BoughtOutPartCategory: "", UOM: "", Specification: "", Plants: "", Vendor: "", BasicRate: "", NetLandedCost: "", EffectiveDateNew: "", DepartmentName: this.props.isSimulation ? userDepartmetList() : "", CustomerName: "" },
            warningMessage: false,
            filterModel: {},
            pageNo: 1,
            pageNoNew: 1,
            totalRecordCount: 0,
            isFilterButtonClicked: false,
            currentRowIndex: 0,
            pageSize: { pageSize10: true, pageSize50: false, pageSize100: false },
            globalTake: defaultPageSize,
            noData: false,
            dataCount: 0
        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        setTimeout(() => {
            if (!this.props.stopApiCallOnCancel) {
                this.getDataList("", 0, "", "", 0, defaultPageSize, true, this.state.floatingFilterData)
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
        }, 300);
    }

    componentWillUnmount() {
        setTimeout(() => {
            if (!this.props.stopApiCallOnCancel) {
                this.props.setSelectedRowForPagination([])
            }
        }, 300);
    }

    /**
    * @method getDataList
    * @description GET DETAILS OF BOP DOMESTIC
    */
    getDataList = (bopFor = '', CategoryId = 0, vendorId = '', plantId = '', skip = 0, take = 100, isPagination = true, dataObj) => {
        // TO HANDLE FUTURE CONDITIONS LIKE [APPROVED_STATUS, DRAFT_STATUS] FOR MULTIPLE STATUS
        let statusString = [APPROVED_STATUS].join(",")

        const filterData = {
            bop_for: bopFor,
            category_id: CategoryId,
            vendor_id: vendorId,
            plant_id: plantId,
            ListFor: this.props.ListFor,
            StatusId: statusString
        }
        const { isMasterSummaryDrawer } = this.props

        if (this.props.isSimulation && this.props.selectionForListingMasterAPI === 'Combined') {
            this.props?.changeSetLoader(true)
            this.props.getListingForSimulationCombined(this.props.objectForMultipleSimulation, BOPDOMESTIC, (res) => {
                this.props?.changeSetLoader(false)

            })
        } else {

            this.setState({ isLoader: isPagination ? true : false })
            if (isMasterSummaryDrawer !== undefined && !isMasterSummaryDrawer) {
                if (this.props.isSimulation) {
                    this.props?.changeTokenCheckBox(false)
                }

                let constantFilterData = this.state.filterModel
                let obj = { ...this.state.floatingFilterData }
                this.props.getBOPDomesticDataList(filterData, skip, take, isPagination, dataObj, (res) => {
                    this.setState({ isLoader: false })
                    this.setState({ noData: false })
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

                    if (res && res.status === 204) {
                        this.setState({ totalRecordCount: 0, pageNo: 0 })
                    }

                    if (res && isPagination === false) {
                        this.setState({ disableDownload: false })
                        setTimeout(() => {
                            this.props.disabledClass(false)
                            let button = document.getElementById('Excel-Downloads-bop-domestic')
                            button && button.click()
                        }, 500);
                    }

                    if (res) {
                        if (res && res.data && res.data.DataList.length > 0) {
                            this.setState({ totalRecordCount: res.data.DataList[0].TotalRecordCount })
                        }
                        let isReset = true
                        setTimeout(() => {

                            for (var prop in obj) {
                                if (this.props.isSimulation && getConfigurationKey().IsCompanyConfigureOnPlant) {
                                    if (prop !== "DepartmentName" && obj[prop] !== "") {
                                        isReset = false
                                    }

                                } else {
                                    if (obj[prop] !== "") {
                                        isReset = false
                                    }
                                }
                            }
                            // Sets the filter model via the grid API
                            isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(constantFilterData))

                        }, 300);

                        setTimeout(() => {
                            this.setState({ warningMessage: false })
                        }, 335);

                        setTimeout(() => {
                            this.setState({ isFilterButtonClicked: false })
                        }, 600);
                    }
                })
            } else {
                this.setState({ isLoader: false })
            }
        }
    }


    onFloatingFilterChanged = (value) => {

        if (this.props.bopDomesticList?.length !== 0) {
            this.setState({ noData: searchNocontentFilter(value, this.state.noData) })
        }
        this.setState({ disableFilter: false })
        onFloatingFilterChanged(value, gridOptions, this)   // COMMON FUNCTION
    }

    onSearch = () => {
        onSearch(gridOptions, this, "BOP", this.state.globalTake)  // COMMON PAGINATION FUNCTION
    }

    resetState = () => {
        resetState(gridOptions, this, "BOP")  //COMMON PAGINATION FUNCTION
        this.props.setSelectedRowForPagination([])
        this.setState({ dataCount: 0 })
    }

    onBtPrevious = () => {
        onBtPrevious(this, "BOP")       //COMMON PAGINATION FUNCTION
    }

    onBtNext = () => {
        onBtNext(this, "BOP")   // COMMON PAGINATION FUNCTION

    };

    onPageSizeChanged = (newPageSize) => {

        onPageSizeChanged(this, newPageSize, "BOP", this.state.currentRowIndex)  // COMMON PAGINATION FUNCTION
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
            isViewMode: isViewMode,
            costingTypeId: rowData.CostingTypeId,
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

    checkBoxRenderer = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        // var selectedRows = gridApi?.getSelectedRows();


        if (this.props.selectedRowForPagination?.length > 0) {
            this.props.selectedRowForPagination.map((item) => {
                if (item.RawMaterialId === props.node.data.RawMaterialId) {
                    props.node.setSelected(true)
                }
                return null
            })
            return cellValue
        } else {
            return cellValue
        }

    }
    /**
    * @method commonCostFormatter
    * @description Renders buttons
    */
    commonCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? cell : '-';
    }

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
        //return cellValue          // IN SUMMARY DRAWER COSTING HEAD IS ROWDATA.COSTINGHEAD & IN MAIN DOMESTIC LISTING IT IS CELLVALUE
        if (this.props.selectedRowForPagination?.length > 0) {
            this.props.selectedRowForPagination.map((item) => {
                if (item.BoughtOutPartId === props.node.data.BoughtOutPartId) {
                    props.node.setSelected(true)
                }
                return null
            })
            return cellValue
        } else {
            return cellValue
        }

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


    onGridReady = (params) => {
        this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
        params.api.paginationGoToPage(0);
    };


    onExcelDownload = () => {

        this.setState({ disableDownload: true })
        this.props.disabledClass(true)

        //let tempArr = this.state.gridApi && this.state.gridApi?.getSelectedRows()
        let tempArr = this.props.selectedRowForPagination
        if (tempArr?.length > 0) {
            setTimeout(() => {
                this.setState({ disableDownload: false })
                this.props.disabledClass(false)
                let button = document.getElementById('Excel-Downloads-bop-domestic')
                button && button.click()
            }, 400);

        } else {

            this.getDataList("", 0, "", "", 0, defaultPageSize, false, this.state.floatingFilterData)  // FOR EXCEL DOWNLOAD OF COMPLETE DATA
        }
    }

    onBtExport = () => {
        let tempArr = []
        //tempArr = this.state.gridApi && this.state.gridApi?.getSelectedRows()
        tempArr = this?.props?.selectedRowForPagination
        tempArr = (tempArr && tempArr.length > 0) ? tempArr : (this.props.allBopDataList ? this.props.allBopDataList : [])
        return this.returnExcelColumn(BOP_DOMESTIC_DOWNLOAD_EXCEl, tempArr)
    };

    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData && TempData.map((item) => {
            if (item.Plants === '-') {
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

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, AddAccessibility, BulkUploadAccessibility, DownloadAccessibility } = this.props;
        const { isBulkUpload, noData } = this.state;

        var filterParams = {
            date: "",
            inRangeInclusive: true,
            filterOptions: ['equals', 'inRange'],
            comparator: function (filterLocalDateAtMidnight, cellValue) {
                var dateAsString = cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
                var newDate = filterLocalDateAtMidnight != null ? DayTime(filterLocalDateAtMidnight).format('DD/MM/YYYY') : '';

                let date = document.getElementsByClassName('ag-input-field-input')
                for (let i = 0; i < date.length; i++) {
                    if (date[i].type == 'radio') {
                        date[i].click()
                    }
                }

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

            var displayedColumns = params.columnApi.getAllDisplayedColumns();
            var thisIsFirstColumn = displayedColumns[0] === params.column;
            if (this.props?.isMasterSummaryDrawer) {
                return false
            } else {
                return thisIsFirstColumn;
            }

        }
        const defaultColDef = {
            resizable: true,
            filter: true,
            sortable: true,
            headerCheckboxSelectionFilteredOnly: true,
            headerCheckboxSelection: this.props.isSimulation ? isFirstColumn : false,
            checkboxSelection: isFirstColumn
        };

        const frameworkComponents = {
            totalValueRenderer: this.buttonFormatter,
            customNoRowsOverlay: NoContentFound,
            hyphenFormatter: hyphenFormatter,
            costingHeadFormatter: this.costingHeadFormatter,
            effectiveDateFormatter: this.effectiveDateFormatter,
            checkBoxRenderer: this.checkBoxRenderer,
            commonCostFormatter: this.commonCostFormatter
        };

        const onRowSelect = (event) => {

            var selectedRows = this.state.gridApi.getSelectedRows();

            if (selectedRows === undefined || selectedRows === null) {   //CONDITION FOR FIRST RENDERING OF COMPONENT
                selectedRows = this.props.selectedRowForPagination
            } else if (this.props.selectedRowForPagination && this.props.selectedRowForPagination.length > 0) {   // CHECKING IF REDUCER HAS DATA

                let finalData = []
                if (event.node.isSelected() === false) {    // CHECKING IF CURRENT CHECKBOX IS UNSELECTED

                    for (let i = 0; i < this.props.selectedRowForPagination.length; i++) {
                        if (this.props.selectedRowForPagination[i].BoughtOutPartId === event.data.BoughtOutPartId) {     // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
                            continue;
                        }
                        finalData.push(this.props.selectedRowForPagination[i])
                    }

                } else {
                    finalData = this.props.selectedRowForPagination
                }
                selectedRows = [...selectedRows, ...finalData]
            }


            let uniqeArray = _.uniqBy(selectedRows, "BoughtOutPartId")           //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
            this.props.setSelectedRowForPagination(uniqeArray)                   //SETTING CHECKBOX STATE DATA IN REDUCER
            this.setState({ dataCount: uniqeArray.length })
            let finalArr = selectedRows
            let length = finalArr?.length
            let uniqueArray = _.uniqBy(finalArr, "BoughtOutPartId")

            if (this.props.isSimulation) {

                this.props.apply(uniqueArray, length)
            }
            this.setState({ selectedRowData: selectedRows })
        }

        return (

            <div className={`ag-grid-react ${(this.props?.isMasterSummaryDrawer === undefined || this.props?.isMasterSummaryDrawer === false) ? "custom-pagination" : ""} ${DownloadAccessibility ? "show-table-btn" : ""} ${this.props.isSimulation ? 'simulation-height' : this.props?.isMasterSummaryDrawer ? '' : 'min-height100vh'}`}>
                {/* {this.state.isLoader && <LoaderCustom />} */}
                {(this.state.isLoader && !this.props.isMasterSummaryDrawer) && <LoaderCustom customClass="simulation-Loader" />}
                < form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate >
                    <Row className={`pt-4 filter-row-large  ${this.props.isSimulation ? 'simulation-filter zindex-0 ' : ''}`}>
                        <Col md="3" lg="3">
                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
                            <SelectRowWrapper dataCount={this.state.dataCount} className="mb-1" />
                        </Col>
                        <Col md="9" lg="9" className="mb-3">
                            <div className="d-flex justify-content-end bd-highlight w100">
                                {this.state.disableDownload && <div title={MESSAGES.DOWNLOADING_MESSAGE} className="disabled-overflow"><WarningMessage dClass="ml-4 mt-1" message={MESSAGES.DOWNLOADING_MESSAGE} /></div>}
                                {this.state.shown ? (
                                    <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => this.setState({ shown: !this.state.shown })}>
                                        <div className="cancel-icon-white"></div></button>
                                ) : (
                                    <>
                                    </>
                                )}

                                {(this.props?.isMasterSummaryDrawer === undefined || this.props?.isMasterSummaryDrawer === false) &&
                                    <div className="warning-message d-flex align-items-center">
                                        {this.state.warningMessage && !this.state.disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                                    </div>
                                }

                                {(this.props?.isMasterSummaryDrawer === undefined || this.props?.isMasterSummaryDrawer === false) &&
                                    <button disabled={this.state.disableFilter} title="Filtered data" type="button" class="user-btn mr5" onClick={() => this.onSearch()}><div class="filter mr-0"></div></button>

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

                                        {this.state.disableDownload ? <div className='p-relative mr5'> <LoaderCustom customClass={"download-loader"} /> <button type="button" className={'user-btn'}><div className="download mr-0"></div>
                                        </button></div> :

                                            <>
                                                <button type="button" onClick={this.onExcelDownload} className={'user-btn mr5'}><div className="download mr-0" title="Download"></div>
                                                    {/* DOWNLOAD */}
                                                </button>

                                                <ExcelFile filename={'BOP Domestic'} fileExtension={'.xls'} element={
                                                    <button id={'Excel-Downloads-bop-domestic'} className="p-absolute" type="button" >
                                                    </button>}>
                                                    {this.onBtExport()}
                                                </ExcelFile>

                                            </>

                                        }
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

                        <div className={`ag-grid-wrapper ${this.props?.isDataInMaster && noData ? 'master-approval-overlay' : ''} ${(this.props.bopDomesticList && this.props.bopDomesticList?.length <= 0) || noData ? 'overlay-contain' : ''}`}>
                            <div className={`ag-theme-material ${(this.state.isLoader && !this.props.isMasterSummaryDrawer) && "max-loader-height"}`}>
                                {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                                <AgGridReact
                                    defaultColDef={defaultColDef}
                                    floatingFilter={true}
                                    domLayout='autoHeight'
                                    rowData={this.props.bopDomesticList}
                                    pagination={true}
                                    paginationPageSize={this.state.globalTake}
                                    onGridReady={this.onGridReady}
                                    gridOptions={gridOptions}
                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                    noRowsOverlayComponentParams={{
                                        title: EMPTY_DATA,
                                        imagClass: 'imagClass'
                                    }}
                                    frameworkComponents={frameworkComponents}
                                    rowSelection={'multiple'}
                                    //onSelectionChanged={onRowSelect}
                                    onRowSelected={onRowSelect}
                                    onFilterModified={this.onFloatingFilterChanged}
                                    suppressRowClickSelection={true}
                                >
                                    <AgGridColumn field="CostingHead" headerName="Costing Head" cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                                    <AgGridColumn field="BoughtOutPartNumber" headerName="BOP Part No."></AgGridColumn>
                                    <AgGridColumn field="BoughtOutPartName" headerName="BOP Part Name"></AgGridColumn>
                                    <AgGridColumn field="BoughtOutPartCategory" headerName="BOP Category"></AgGridColumn>
                                    <AgGridColumn field="UOM" headerName="UOM"></AgGridColumn>
                                    <AgGridColumn field="Specification" headerName="Specification" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    <AgGridColumn field="Plants" cellRenderer={'hyphenFormatter'} headerName="Plant(Code)"></AgGridColumn>
                                    <AgGridColumn field="Vendor" headerName="Vendor(Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    <AgGridColumn field="CustomerName" headerName="CustomerName" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    {/* <AgGridColumn field="DepartmentName" headerName="Department"></AgGridColumn> */}
                                    <AgGridColumn field="BasicRate" headerName="Basic Rate" cellRenderer={'commonCostFormatter'} ></AgGridColumn>
                                    <AgGridColumn field="NetLandedCost" headerName="Net Cost" cellRenderer={'commonCostFormatter'} ></AgGridColumn>
                                    <AgGridColumn field="EffectiveDateNew" headerName="Effective Date" cellRenderer={'effectiveDateFormatter'} filter="agDateColumnFilter" filterParams={filterParams} ></AgGridColumn>
                                    {!this.props?.isSimulation && !this.props?.isMasterSummaryDrawer && <AgGridColumn field="BoughtOutPartId" width={160} headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}
                                </AgGridReact>
                                <div className={`button-wrapper ${this.props?.isMasterSummaryDrawer ? 'mb-5' : ''}`}>
                                    {!this.state.isLoader && <PaginationWrapper gridApi={this.gridApi} setPage={this.onPageSizeChanged} globalTake={this.state.globalTake} />}
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
function mapStateToProps({ boughtOutparts, supplier, auth, material, simulation, comman }) {
    const { bopCategorySelectList, vendorAllSelectList, plantSelectList, bopDomesticList, allBopDataList } = boughtOutparts;
    const { vendorWithVendorCodeSelectList } = supplier;
    const { initialConfiguration } = auth;
    const { selectedRowForPagination } = simulation;
    const { disabledClass } = comman
    return { bopCategorySelectList, plantSelectList, vendorAllSelectList, bopDomesticList, allBopDataList, vendorWithVendorCodeSelectList, initialConfiguration, selectedRowForPagination, disabledClass }
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
    getAllVendorSelectList,
    getPlantSelectListByVendor,
    getListingForSimulationCombined,
    masterFinalLevelUser,
    setSelectedRowForPagination,
    disabledClass
})(reduxForm({
    form: 'BOPDomesticListing',
    enableReinitialize: true,
    touchOnChange: true
})(BOPDomesticListing));
