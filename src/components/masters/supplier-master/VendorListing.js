import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { focusOnError } from "../../layout/FormInputs";
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { defaultPageSize, EMPTY_DATA } from '../../../config/constants';
import $ from 'jquery';
import NoContentFound from '../../common/NoContentFound';
import {
    getSupplierDataList, activeInactiveVendorStatus, deleteSupplierAPI,
    getVendorsByVendorTypeID,
    getVendorTypeByVendorSelectList
} from '../actions/Supplier';
import Switch from "react-switch";
import BulkUpload from '../../massUpload/BulkUpload';
import AddVendorDrawer from './AddVendorDrawer';
import { checkPermission, searchNocontentFilter, showTitleForActiveToggle } from '../../../helper/util';
import { MASTERS, VENDOR, VendorMaster } from '../../../config/constants';
import { loggedInUserId } from '../../../helper';
import LoaderCustom from '../../common/LoaderCustom';
import ReactExport from 'react-export-excel';
import { VENDOR_DOWNLOAD_EXCEl } from '../../../config/masterData';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import WarningMessage from '../../common/WarningMessage'
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import ScrollToTop from '../../common/ScrollToTop';
import { onFloatingFilterChanged, onSearch, resetState, onBtPrevious, onBtNext, onPageSizeChanged, PaginationWrapper } from '../../common/commonPagination'
import { disabledClass, isResetClick } from '../../../actions/Common';
import SelectRowWrapper from '../../common/SelectRowWrapper';
import { setSelectedRowForPagination } from '../../simulation/actions/Simulation'
import _ from 'lodash';
import MultiDropdownFloatingFilter from '../../masters/material-master/MultiDropdownFloatingFilter'

const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

class VendorListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            isOpenVendor: false,
            ID: '',
            shown: false,
            isBulkUpload: false,
            tableData: [],
            vendorType: [],
            vendorName: [],
            country: [],
            currentRowIndex: 0,
            totalRecordCount: 0,
            pageNo: 1,
            pageNoNew: 1,
            floatingFilterData: { vendorType: "", vendorName: "", VendorCode: "", Country: "", State: "", City: "" },
            AddAccessibility: false,
            EditAccessibility: false,
            DeleteAccessibility: false,
            ViewAccessibility: false,
            DownloadAccessibility: false,
            BulkUploadAccessibility: false,
            ActivateAccessibility: false,
            gridApi: null,
            gridColumnApi: null,
            rowData: null,
            warningMessage: false,
            sideBar: { toolPanels: ['columns'] },
            showData: false,
            showPopup: false,
            deletedId: '',
            isViewMode: false,
            showPopupToggle: false,
            isLoader: false,
            pageSize: { pageSize10: true, pageSize50: false, pageSize100: false },
            globalTake: defaultPageSize,
            disableFilter: true,
            disableDownload: false,
            noData: false,
            dataCount: 0
        }
    }


    floatingFilterVendorType = {
        maxValue: 6,
        suppressFilterButton: true,
        component: "vendorType"
    }

    componentWillUnmount() {
        this.props.setSelectedRowForPagination([])
    }

    componentDidMount() {
        this.getTableListData(0, '', "", "", defaultPageSize, this.state.floatingFilterData, true)

        this.applyPermission(this.props.topAndLeftMenuData)
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.topAndLeftMenuData !== nextProps.topAndLeftMenuData) {
            this.applyPermission(nextProps.topAndLeftMenuData)
        }


        setTimeout(() => {
            if (this.props.statusColumnData?.data) {
                this.setState({ disableFilter: false, warningMessage: true })
            } else {
                this.setState({ warningMessage: false })
            }
            this.setState({ floatingFilterData: { ...this.state.floatingFilterData, VendorType: (this.props.statusColumnData?.data) ? (this.props.statusColumnData?.data) : "" } })
        }, 500);


    }


    onFloatingFilterChanged = (value) => {
        if (this.props.supplierDataList?.length !== 0) {
            this.setState({ noData: searchNocontentFilter(value, this.state.noData) })
        }
        this.setState({ disableFilter: false })
        onFloatingFilterChanged(value, gridOptions, this)   // COMMON FUNCTION

    }


    onSearch = () => {
        onSearch(gridOptions, this, "Vendor", this.state.globalTake)  // COMMON PAGINATION FUNCTION
    }


    onBtPrevious = () => {
        onBtPrevious(this, "Vendor")       //COMMON PAGINATION FUNCTION
    }

    onBtNext = () => {
        onBtNext(this, "Vendor")   // COMMON PAGINATION FUNCTION

    };


    /**
    * @method applyPermission
    * @description ACCORDING TO PERMISSION HIDE AND SHOW, ACTION'S
    */
    applyPermission = (topAndLeftMenuData) => {
        if (topAndLeftMenuData !== undefined) {
            const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === MASTERS);
            const accessData = Data && Data.Pages.find(el => el.PageName === VENDOR)
            const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

            if (permmisionData !== undefined) {

                this.setState({
                    ViewAccessibility: permmisionData && permmisionData.View ? permmisionData.View : false,
                    AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
                    EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
                    DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
                    DownloadAccessibility: permmisionData && permmisionData.Download ? permmisionData.Download : false,
                    BulkUploadAccessibility: permmisionData && permmisionData.BulkUpload ? permmisionData.BulkUpload : false,
                    ActivateAccessibility: permmisionData && permmisionData.Activate ? permmisionData.Activate : false,
                })
            }
        }
    }

    // Get updated Supplier's list after any action performed.
    getUpdatedData = () => {
        this.getTableListData(null, null, null)
    }

    /**
    * @method getTableListData
    * @description GET VENDOR DATA LIST
    */
    getTableListData = (skip, vendorType = "", vendorName = "", country = "", take, obj, isPagination) => {

        this.setState({ isLoader: isPagination ? true : false })

        let constantFilterData = this.state.filterModel
        let object = { ...this.state.floatingFilterData }
        this.props.getSupplierDataList(skip, obj, take, isPagination, res => {
            setTimeout(() => {
                this.setState({ isLoader: false })
            }, 300);
            this.setState({ noData: false })
            if (res.status === 202) {
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

            }

            if (res && isPagination === false) {
                this.setState({ disableDownload: false })
                this.props.disabledClass(false)
                setTimeout(() => {
                    let button = document.getElementById('Excel-Downloads-vendor')
                    button && button.click()
                }, 500);
            }

            if (res) {
                if (res && res.status === 204) {
                    this.setState({ totalRecordCount: 0, pageNo: 0 })
                }
                if (res && res.data && res.data.DataList.length > 0) {
                    this.setState({ totalRecordCount: res.data.DataList[0].TotalRecordCount })
                }
                let isReset = true
                setTimeout(() => {

                    for (var prop in object) {
                        if (prop !== "DepartmentCode" && object[prop] !== "") {
                            isReset = false
                        }
                    }
                    // Sets the filter model via the grid API
                    isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(constantFilterData))
                    setTimeout(() => {
                        this.setState({ warningMessage: false })
                    }, 23);

                }, 300);

                setTimeout(() => {
                    this.setState({ warningMessage: false })
                }, 335);

                setTimeout(() => {
                    this.setState({ isFilterButtonClicked: false })
                }, 600);
            }

        });
    }

    /**
    * @method editItemDetails
    * @description confirm edit item
    */
    viewOrEditItemDetails = (Id, isViewMode) => {
        this.setState({
            isOpenVendor: true,
            isEditFlag: true,
            ID: Id,
            isViewMode: isViewMode,
        })
    }


    /**
    * @method deleteItem
    * @description confirm delete Item.
    */
    deleteItem = (Id) => {
        this.setState({ showPopup: true, deletedId: Id })
    }

    /**
    * @method confirmDeleteItem
    * @description confirm delete item
    */
    confirmDeleteItem = (ID) => {
        this.props.deleteSupplierAPI(ID, (res) => {
            if (res.data.Result === true) {
                Toaster.success(MESSAGES.DELETE_SUPPLIER_SUCCESS);
                this.filterList()
                //this.getTableListData(null, null, null)
                this.props.setSelectedRowForPagination([])
                this.setState({ dataCount: 0 })
                this.state.gridApi.deselectAll()
            }
        });
        this.setState({ showPopup: false })
    }
    onPopupConfirm = () => {
        this.confirmDeleteItem(this.state.deletedId);
    }
    closePopUp = () => {
        this.setState({ showPopup: false })
        this.setState({ showPopupToggle: false })
    }
    onPopupConfirmToggle = () => {
        this.confirmDeactivateItem(this.state.cellData, this.state.cellValue)
    }
    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    buttonFormatter = (props) => {
        const cellValue = props?.value;

        const { EditAccessibility, DeleteAccessibility, ViewAccessibility } = this.state;
        return (
            <>
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
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined && String(cellValue) !== 'NA') ? cellValue : '-';
    }


    checkBoxRenderer = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        // var selectedRows = gridApi?.getSelectedRows();


        if (this.props.selectedRowForPagination?.length > 0) {
            this.props.selectedRowForPagination.map((item) => {
                if (item.VendorId === props.node.data.VendorId) {
                    props.node.setSelected(true)
                }
                return null
            })
            return cellValue
        } else {
            return cellValue
        }

    }


    handleChange = (cell, row) => {
        let data = {
            Id: row.VendorId,
            ModifiedBy: loggedInUserId(),
            IsActive: !cell, //Status of the user.
        }
        this.setState({ showPopupToggle: true, cellData: data, cellValue: cell })
    }
    confirmDeactivateItem = (data, cell) => {
        this.props.activeInactiveVendorStatus(data, res => {
            if (res && res.data && res.data.Result) {
                if (cell === true) {
                    Toaster.success(MESSAGES.VENDOR_INACTIVE_SUCCESSFULLY)
                } else {
                    Toaster.success(MESSAGES.VENDOR_ACTIVE_SUCCESSFULLY)
                }
                this.filterList()
                this.setState({ dataCount: 0 })
            }
        })
        this.setState({ showPopupToggle: false })
    }
    /**
    * @method handleVendorType
    * @description Used to handle vendor type
    */
    handleVendorType = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ vendorType: newValue, }, () => {
                const { vendorType } = this.state;
                this.props.getVendorsByVendorTypeID(vendorType.value, this.state.vendorName, (res) => { })
            });
        } else {
            this.setState({ vendorType: [], }, () => {
                this.props.getAllVendorSelectList()
            })
        }
    };

    /**
    * @method handleVendorName
    * @description Used to handle vendor name
    */
    handleVendorName = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ vendorName: newValue, }, () => {
                const { vendorName } = this.state;
                this.props.getVendorTypeByVendorSelectList(vendorName.value)
            });
        } else {
            this.setState({ vendorName: [], })
        }
    };

    /**
    * @method countryHandler
    * @description Used to handle country
    */
    countryHandler = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ country: newValue, });
        } else {
            this.setState({ country: [], })
        }
    };

    /**
    * @method statusButtonFormatter
    * @description Renders buttons
    */
    statusButtonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

        const { ActivateAccessibility } = this.state;
        if (rowData.UserId === loggedInUserId()) return null;
        showTitleForActiveToggle(props?.rowIndex)
        return (
            <>
                <label htmlFor="normal-switch" className="normal-switch">
                    {/* <span>Switch with default style</span> */}
                    <Switch
                        onChange={() => this.handleChange(cellValue, rowData)}
                        checked={cellValue}
                        disabled={!ActivateAccessibility}
                        background="#ff6600"
                        onColor="#4DC771"
                        onHandleColor="#ffffff"
                        offColor="#FC5774"
                        id="normal-switch"
                        height={24}
                        className={cellValue ? "active-switch" : "inactive-switch"}
                    />
                </label>
            </>
        )
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


    bulkToggle = () => {
        $("html,body").animate({ scrollTop: 0 }, "slow");
        this.setState({ isBulkUpload: true })
    }

    closeBulkUploadDrawer = () => {
        this.setState({ isBulkUpload: false }, () => {
            this.getTableListData(this.state.currentRowIndex, '', "", "", 100, this.state.floatingFilterData, true)
        })
    }

    /**
    * @method filterList
    * @description Filter user listing on the basis of role and department
    */
    filterList = () => {

        this.getTableListData(this.state.currentRowIndex, '', "", "", 100, this.state.floatingFilterData, true)

    }

    /**
    * @method resetFilter
    * @description Reset user filter
    */
    resetFilter = () => {
        this.setState({
            vendorType: [],
            vendorName: [],
            country: [],
        }, () => {
            this.getTableListData(null, null, null)
        })
    }

    formToggle = () => {
        this.setState({ isOpenVendor: true, isViewMode: false })
    }

    closeVendorDrawer = (e = '', formdata, type) => {
        this.setState({
            isOpenVendor: false,
            isEditFlag: false,
            ID: '',
        }, () => {
            if (type === 'submit') {
                this.filterList()
            }
        })

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
        window.screen.width >= 1367 && params.api.sizeColumnsToFit();
        this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
        params.api.paginationGoToPage(0);
    };

    onPageSizeChanged = (newPageSize) => {
        onPageSizeChanged(this, newPageSize, "Vendor", this.state.currentRowIndex)    // COMMON PAGINATION FUNCTION
    };

    resetState = () => {
        this.props.setSelectedRowForPagination([])
        this.props.isResetClick(true, "vendorType")
        resetState(gridOptions, this, "Vendor")  //COMMON PAGINATION FUNCTION
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);
        this.state.gridApi.deselectAll()
        this.props.setSelectedRowForPagination([])
        this.setState({ dataCount: 0 })
    }
    onExcelDownload = () => {

        this.setState({ disableDownload: true })
        this.props.disabledClass(true)

        let tempArr = this.state.gridApi && this.state.gridApi?.getSelectedRows()
        if (tempArr?.length > 0) {
            setTimeout(() => {
                this.setState({ disableDownload: false })
                this.props.disabledClass(false)
                let button = document.getElementById('Excel-Downloads-vendor')
                button && button.click()
            }, 400);

        } else {

            this.getTableListData(0, '', "", "", 100, this.state.floatingFilterData, false)  // FOR EXCEL DOWNLOAD OF COMPLETE DATA
        }
    }
    onRowSelect = (event) => {
        let selectedRows = this.state.gridApi?.getSelectedRows()

        if (selectedRows === undefined || selectedRows === null) {   //CONDITION FOR FIRST RENDERING OF COMPONENT
            selectedRows = this.props.selectedRowForPagination
        } else if (this.props.selectedRowForPagination && this.props.selectedRowForPagination.length > 0) {   // CHECKING IF REDUCER HAS DATA

            let finalData = []
            if (event.node.isSelected() === false) {    // CHECKING IF CURRENT CHECKBOX IS UNSELECTED

                for (let i = 0; i < this.props.selectedRowForPagination.length; i++) {
                    if (this.props.selectedRowForPagination[i].VendorId === event.data.VendorId) {     // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
                        continue;
                    }
                    finalData.push(this.props.selectedRowForPagination[i])
                }

            } else {
                finalData = this.props.selectedRowForPagination
            }
            selectedRows = [...selectedRows, ...finalData]
        }

        let uniqeArray = _.uniqBy(selectedRows, "VendorId")           //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
        this.props.setSelectedRowForPagination(uniqeArray)                     //SETTING CHECKBOX STATE DATA IN REDUCER
        this.setState({ dataCount: uniqeArray.length })
        this.setState({ selectedRowData: selectedRows })

    }

    onBtExport = () => {
        let tempArr = []
        tempArr = this.state.gridApi && this.state.gridApi?.getSelectedRows()
        tempArr = (tempArr && tempArr.length > 0) ? tempArr : (this.props.allSupplierDataList ? this.props.allSupplierDataList : [])
        return this.returnExcelColumn(VENDOR_DOWNLOAD_EXCEl, tempArr)
    };

    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData && TempData.map((item) => {
            if (String(item.Country) === 'NA') {
                item.Country = ' '
            } else if (String(item.State) === 'NA') {
                item.State = ' '
            } else if (String(item.City) === 'NA') {
                item.City = ' '
            }
            // if (item.IsActive === true) {
            //     item.IsActive = 'Active'
            // }
            // else if (item.IsActive === false) {
            //     item.IsActive = 'In Active'
            // }
            return item
        })
        return (

            <ExcelSheet data={temp} name={VendorMaster}>
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
        const { isOpenVendor, isEditFlag, isBulkUpload, AddAccessibility, BulkUploadAccessibility, DownloadAccessibility, noData } = this.state;
        const ExcelFile = ReactExport.ExcelFile;

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
            indexFormatter: this.indexFormatter,
            statusButtonFormatter: this.statusButtonFormatter,
            hyphenFormatter: this.hyphenFormatter,
            checkBoxRenderer: this.checkBoxRenderer,
            valuesFloatingFilter: MultiDropdownFloatingFilter,
        };

        return (
            <div className={`ag-grid-react container-fluid blue-before-inside report-grid custom-pagination ${DownloadAccessibility ? "show-table-btn no-tab-page" : ""}`} id='go-to-top'>
                <ScrollToTop pointProp="go-to-top" />
                {this.state.isLoader && <LoaderCustom customClass={"loader-center"} />}
                {this.state.disableDownload && <LoaderCustom message={MESSAGES.DOWNLOADING_MESSAGE} />}
                <Row>
                    <Col md="12" className="d-flex justify-content-between">
                        <h1 className="mb-0">Vendor Master</h1>
                    </Col>
                </Row>
                <Row className="py-4 no-filter-row zindex-2">
                    <Col md="3"> <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => this.onFilterTextBoxChanged(e)} /></Col>
                    <Col md="9">
                        <div className="d-flex justify-content-end bd-highlight w100 ">
                            <div className="warning-message d-flex align-items-center">
                                {this.state.warningMessage && !this.state.disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                            </div>
                            <div className='d-flex'>
                                <button title="Filtered data" type="button" class="user-btn mr5" onClick={() => this.onSearch(this)} disabled={this.state.disableFilter}><div class="filter mr-0"></div></button>
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
                                        <button title={`Download ${this.state.dataCount === 0 ? "All" : "(" + this.state.dataCount + ")"}`} type="button" onClick={this.onExcelDownload} className={'user-btn mr5'}><div className="download mr-1" ></div>
                                            {`${this.state.dataCount === 0 ? "All" : "(" + this.state.dataCount + ")"}`}
                                        </button>

                                        <ExcelFile filename={'Vendor'} fileExtension={'.xls'} element={
                                            <button id={'Excel-Downloads-vendor'} className="p-absolute" type="button" >
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
                {!this.state.isLoader && <div className={`ag-grid-wrapper height-width-wrapper ${(this.props.supplierDataList && this.props.supplierDataList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                    <div className="ag-grid-header col-md-4 pl-0">
                    </div>
                    <div className={`ag-theme-material ${this.state.isLoader && "max-loader-height"}`}>

                        {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found vendor-listing" />}
                        <AgGridReact
                            defaultColDef={defaultColDef}
                            floatingFilter={true}
                            domLayout='autoHeight'
                            rowData={this.props.supplierDataList}
                            pagination={true}
                            paginationPageSize={this.state.globalTake}
                            onGridReady={this.onGridReady}
                            onFilterModified={this.onFloatingFilterChanged}
                            gridOptions={gridOptions}
                            suppressRowClickSelection={true}
                            noRowsOverlayComponent={'customNoRowsOverlay'}
                            rowSelection={'multiple'}
                            noRowsOverlayComponentParams={{
                                title: EMPTY_DATA,
                                imagClass: 'imagClass'
                            }}
                            onRowSelected={this.onRowSelect}
                            frameworkComponents={frameworkComponents}
                            enablePivot={true}
                            enableBrowserTooltips={true}
                        >
                            <AgGridColumn field="VendorType" tooltipField="VendorType" width={"240px"} headerName="Vendor Type" cellRenderer={'checkBoxRenderer'} floatingFilterComponent="valuesFloatingFilter" floatingFilterComponentParams={this.floatingFilterVendorType}></AgGridColumn>
                            <AgGridColumn field="VendorName" headerName="Vendor Name"></AgGridColumn>
                            <AgGridColumn field="VendorCode" headerName="Vendor Code"></AgGridColumn>
                            <AgGridColumn field="Country" headerName="Country" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                            <AgGridColumn field="State" headerName="State" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                            <AgGridColumn field="City" headerName="City" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                            <AgGridColumn field="VendorId" minWidth={"180"} cellClass="actions-wrapper" headerName="Actions" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                            <AgGridColumn width="150" pinned="right" field="IsActive" headerName="Status" floatingFilter={false} cellRenderer={'statusButtonFormatter'}></AgGridColumn>
                        </AgGridReact>
                        <div className="button-wrapper">

                            {!this.state.isLoader && <PaginationWrapper gridApi={this.gridApi} setPage={this.onPageSizeChanged} globalTake={this.state.globalTake} />}
                            <div className="d-flex pagination-button-container">
                                <p><button className="previous-btn" type="button" disabled={this.state.pageNo === 1 ? true : false} onClick={() => this.onBtPrevious(this)}> </button></p>
                                {/* <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{this.state.pageNo}</span> of {Math.ceil(this.state.totalRecordCount / 10)}</p> */}
                                {this.state.pageSize.pageSize10 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{this.state.pageNo}</span> of {Math.ceil(this.state.totalRecordCount / 10)}</p>}
                                {this.state.pageSize.pageSize50 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{this.state.pageNo}</span> of {Math.ceil(this.state.totalRecordCount / 50)}</p>}
                                {this.state.pageSize.pageSize100 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{this.state.pageNo}</span> of {Math.ceil(this.state.totalRecordCount / 100)}</p>}
                                <p><button className="next-btn" type="button" onClick={() => this.onBtNext(this)}> </button></p>
                            </div>
                        </div>
                        <div className="text-right pb-3">
                            <WarningMessage message="All the above details of supplier is entered through SAP." />
                        </div>
                    </div>
                </div>}


                {
                    isBulkUpload && (
                        <BulkUpload
                            isOpen={isBulkUpload}
                            closeDrawer={this.closeBulkUploadDrawer}
                            isEditFlag={false}
                            isZBCVBCTemplate={false}
                            fileName={"Vendor"}
                            messageLabel={"Vendor"}
                            anchor={"right"}
                        />
                    )
                }
                {
                    isOpenVendor && (
                        <AddVendorDrawer
                            isOpen={isOpenVendor}
                            closeDrawer={this.closeVendorDrawer}
                            isEditFlag={isEditFlag}
                            isRM={false}
                            isViewMode={this.state.isViewMode}
                            ID={this.state.ID}
                            anchor={"right"}
                        />
                    )
                }
                {
                    this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`Are you sure you want to delete this Vendor?`} />
                }
                {
                    this.state.showPopupToggle && <PopupMsgWrapper isOpen={this.state.showPopupToggle} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirmToggle} message={`${this.state.cellValue ? MESSAGES.VENDOR_DEACTIVE_ALERT : MESSAGES.VENDOR_ACTIVE_ALERT}`} />
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
function mapStateToProps({ comman, supplier, auth, simulation }) {
    const { loading, vendorTypeList, vendorSelectList, vendorTypeByVendorSelectList, supplierDataList, allSupplierDataList } = supplier;
    const { countryList, statusColumnData } = comman;
    const { leftMenuData, topAndLeftMenuData } = auth;
    const { selectedRowForPagination } = simulation;

    return { statusColumnData, loading, vendorTypeList, countryList, leftMenuData, vendorSelectList, vendorTypeByVendorSelectList, supplierDataList, allSupplierDataList, topAndLeftMenuData, selectedRowForPagination };
}

/**
                    * @method connect
                    * @description connect with redux
                    * @param {function} mapStateToProps
                    * @param {function} mapDispatchToProps
                    */

export default connect(mapStateToProps, {
    getSupplierDataList,
    activeInactiveVendorStatus,
    deleteSupplierAPI,
    getVendorsByVendorTypeID,
    getVendorTypeByVendorSelectList,
    setSelectedRowForPagination,
    disabledClass,
    isResetClick
})(reduxForm({
    form: 'VendorListing',
    onSubmitFail: errors => {
        focusOnError(errors);
    },
    enableReinitialize: true,
    touchOnChange: true
})(VendorListing));
