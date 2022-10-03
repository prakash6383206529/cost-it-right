import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { focusOnError } from "../../layout/FormInputs";
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { EMPTY_DATA, OPERATIONS, SURFACETREATMENT, defaultPageSize, APPROVED_STATUS } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import {
    getOperationsDataList, deleteOperationAPI, getOperationSelectList, getVendorWithVendorCodeSelectList, getTechnologySelectList,
    getVendorListByTechnology, getOperationListByTechnology, getTechnologyListByOperation, getVendorListByOperation,
    getTechnologyListByVendor, getOperationListByVendor, setOperationList
} from '../actions/OtherOperation';
import AddOperation from './AddOperation';
import { onFloatingFilterChanged, onSearch, resetState, onBtPrevious, onBtNext, onPageSizeChanged, PaginationWrapper } from '../../common/commonPagination'
import BulkUpload from '../../massUpload/BulkUpload';
import { ADDITIONAL_MASTERS, OPERATION, OperationMaster, OPERATIONS_ID } from '../../../config/constants';
import { checkPermission, searchNocontentFilter } from '../../../helper/util';
import { loggedInUserId, userDetails } from '../../../helper/auth';
import { checkForDecimalAndNull, userDepartmetList, getConfigurationKey } from '../../../helper'
import { costingHeadObjs, OPERATION_DOWNLOAD_EXCEl } from '../../../config/masterData';
import LoaderCustom from '../../common/LoaderCustom';
import DayTime from '../../common/DayTimeWrapper'
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { getListingForSimulationCombined, setSelectedRowForPagination, } from '../../simulation/actions/Simulation'
import { masterFinalLevelUser } from '../../masters/actions/Material'
import WarningMessage from '../../common/WarningMessage';
import _ from 'lodash';
import { disabledClass } from '../../../actions/Common';
import SelectRowWrapper from '../../common/SelectRowWrapper';

const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

class OperationListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tableData: [],
            shown: false,
            costingHead: [],
            selectedTechnology: [],
            vendorName: [],
            operationName: [],

            data: { isEditFlag: false, ID: '' },
            toggleForm: false,
            isBulkUpload: false,

            ViewAccessibility: false,
            AddAccessibility: false,
            EditAccessibility: false,
            DeleteAccessibility: false,
            BulkUploadAccessibility: false,
            DownloadAccessibility: false,
            selectedRowData: [],
            showPopup: false,
            deletedId: '',
            isLoader: false,
            isFinalApprovar: false,
            disableFilter: true,
            disableDownload: false,

            //states for pagination purpose
            floatingFilterData: { CostingHead: "", Technology: "", OperationName: "", OperationCode: "", Plants: "", VendorName: "", UnitOfMeasurement: "", Rate: "", EffectiveDate: "", DepartmentName: this.props.isSimulation ? userDepartmetList() : "" },
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
    componentDidMount() {

        this.applyPermission(this.props.topAndLeftMenuData)
        setTimeout(() => {
            if (!this.props.stopAPICall) {
                if (this.props.isSimulation && this.props?.selectionForListingMasterAPI === 'Combined') {
                    this.props?.changeSetLoader(true)
                    this.props.getListingForSimulationCombined(this.props.objectForMultipleSimulation, OPERATIONS, (res) => {
                        this.props?.changeSetLoader(false)
                        this.setState({ tableData: res.data.DataList })
                    })
                } else {
                    this.getTableListData(null, null, null, null, 0, defaultPageSize, true, this.state.floatingFilterData)
                }
                let obj = {
                    MasterId: OPERATIONS_ID,
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

            if (this.props.stopAPICall === true) {
                this.setState({ tableData: this.props.operationDataHold })
            }
        }, 300);
    }

    componentWillUnmount() {
        this.props.setSelectedRowForPagination([])
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        if (this.props.topAndLeftMenuData !== nextProps.topAndLeftMenuData) {
            this.applyPermission(nextProps.topAndLeftMenuData)
        }
    }

    /**
    * @method applyPermission
    * @description ACCORDING TO PERMISSION HIDE AND SHOW, ACTION'S
    */
    applyPermission = (topAndLeftMenuData) => {
        if (topAndLeftMenuData !== undefined) {
            const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === ADDITIONAL_MASTERS);
            const accessData = Data && Data.Pages.find(el => el.PageName === OPERATION)
            const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

            if (permmisionData !== undefined) {
                this.setState({
                    ViewAccessibility: permmisionData && permmisionData.View ? permmisionData.View : false,
                    AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
                    EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
                    DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
                    BulkUploadAccessibility: permmisionData && permmisionData.BulkUpload ? permmisionData.BulkUpload : false,
                    DownloadAccessibility: permmisionData && permmisionData.Download ? permmisionData.Download : false,
                })
            }

        }
    }

    // Get updated Supplier's list after any action performed.
    getUpdatedData = () => {
        this.getTableListData(null, null, null, null, 0, 100, true, this.state.floatingFilterData)
    }

    /**
    * @method getTableListData
    * @description Get user list data
    */
    getTableListData = (operation_for = null, operation_Name_id = null, technology_id = null, vendor_id = null, skip = 0, take = 100, isPagination = true, dataObj) => {
        this.setState({ isLoader: isPagination ? true : false })

        const { isMasterSummaryDrawer } = this.props
        // TO HANDLE FUTURE CONDITIONS LIKE [APPROVED_STATUS, DRAFT_STATUS] FOR MULTIPLE STATUS
        let statusString = [APPROVED_STATUS].join(",")

        let filterData = {
            operation_for: operation_for,
            operation_Name_id: operation_Name_id,
            technology_id: this.props.isSimulation ? this.props.technology : technology_id,
            vendor_id: vendor_id,
            ListFor: this.props.ListFor,
            StatusId: statusString
        }
        // THIS IS FOR SHOWING LIST IN 1 TAB(OPERATION LISTING) & ALSO FOR SHOWING LIST IN SIMULATION
        if ((isMasterSummaryDrawer !== undefined && !isMasterSummaryDrawer)) {
            if (this.props.isSimulation) {
                this.props?.changeTokenCheckBox(false)
            }

            if (Number(this?.props?.isOperationST) === Number(SURFACETREATMENT)) {
                filterData.OperationType = 'surfacetreatment'
            } else if ((Number(this?.props?.isOperationST) === Number(OPERATIONS))) {
                filterData.OperationType = 'operation'
            } else {
                filterData.OperationType = ''
            }

            this.props.getOperationsDataList(filterData, skip, take, isPagination, dataObj, res => {
                this.setState({ noData: false })
                if (this.props.isSimulation) {
                    this.props?.changeTokenCheckBox(true)
                }
                this.setState({ isLoader: false })
                if (res.status === 204 && res.data === '') {
                    this.setState({ tableData: [] })
                } else {
                    this.setState({ tableData: res.data.DataList })
                    this.props.setOperationList(res.data.DataList)
                }
                // CODE FOR DOWNLOAD BUTTON LOGIC
                if (res && isPagination === false) {
                    this.setState({ disableDownload: false })
                    this.props.disabledClass(false)
                    setTimeout(() => {
                        let button = document.getElementById('Excel-Downloads-operation')
                        button && button.click()
                    }, 500);
                }

                // PAGINATION CODE
                if (res && res.status === 204) {
                    this.setState({ totalRecordCount: 0, pageNo: 0 })
                }
                let FloatingfilterData = this.state.filterModel
                let obj = { ...this.state.floatingFilterData }
                this.setState({ totalRecordCount: res?.data?.DataList && res?.data?.DataList[0]?.TotalRecordCount })
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
                    // SETS  THE FILTER MODEL VIA THE GRID API
                    isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(FloatingfilterData))
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
            });
        } else {
            setTimeout(() => {
                this.setState({ tableData: this.props.operationList })
                this.setState({ isLoader: false })
            }, 700);

        }
    }

    onFloatingFilterChanged = (value) => {
        if (this.state.tableData?.length !== 0) {
            this.setState({ noData: searchNocontentFilter(value, this.state.noData) })
        }
        this.setState({ disableFilter: false })
        onFloatingFilterChanged(value, gridOptions, this)   // COMMON FUNCTION
    }

    onSearch = () => {
        onSearch(gridOptions, this, "Operation", this.state.globalTake)  // COMMON PAGINATION FUNCTION
    }

    resetState = () => {
        resetState(gridOptions, this, "Operation")  //COMMON PAGINATION FUNCTION
        this.props.setSelectedRowForPagination([])
        this.setState({ dataCount: 0 })
    }

    onBtPrevious = () => {
        onBtPrevious(this, "Operation")       //COMMON PAGINATION FUNCTION
    }

    onBtNext = () => {
        onBtNext(this, "Operation")   // COMMON PAGINATION FUNCTION

    };

    onPageSizeChanged = (newPageSize) => {
        onPageSizeChanged(this, newPageSize, "Operation", this.state.currentRowIndex)    // COMMON PAGINATION FUNCTION
    };

    /**
    * @method renderListing
    * @description Used show listing of unit of measurement
    */
    renderListing = (label) => {
        const { filterOperation } = this.props;
        const temp = [];

        if (label === 'technology') {
            filterOperation && filterOperation.technology && filterOperation.technology.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }

        if (label === 'costingHead') {
            return costingHeadObjs;
        }

        if (label === 'OperationNameList') {
            filterOperation && filterOperation.operations && filterOperation.operations.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }

        if (label === 'VendorList') {
            filterOperation && filterOperation.vendors && filterOperation.vendors.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
    }


    /**
 * @method viewOrEditItemDetails
 * @description confirm edit or view item
 */

    viewOrEditItemDetails = (Id, rowData, isViewMode) => {
        let data = {
            isEditFlag: true,
            ID: Id,
            toggleForm: true,
            isViewMode: isViewMode
        }
        this.props.getDetails(data, rowData?.IsOperationAssociated);
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
        this.props.deleteOperationAPI(ID, (res) => {
            if (res.data.Result === true) {
                Toaster.success(MESSAGES.DELETE_OPERATION_SUCCESS);
                this.resetState()
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

        const { EditAccessibility, DeleteAccessibility, ViewAccessibility } = this.state;

        let isEditable = false
        let isDeleteButton = false


        if (EditAccessibility) {
            isEditable = true
        } else {
            isEditable = false
        }


        if (DeleteAccessibility && !rowData.IsOperationAssociated) {
            isDeleteButton = true
        } else {
            isDeleteButton = false
        }


        return (
            <>
                {ViewAccessibility && <button title='View' className="View" type={'button'} onClick={() => this.viewOrEditItemDetails(cellValue, rowData, true)} />}
                {isEditable && <button title='Edit' className="Edit" type={'button'} onClick={() => this.viewOrEditItemDetails(cellValue, rowData, false)} />}
                {isDeleteButton && <button title='Delete' className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
            </>
        )
    };

    /**
    * @method handleHeadChange
    * @description called
    */
    handleHeadChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ costingHead: newValue, });
        } else {
            this.setState({ costingHead: [], })
        }
    };

    /**
    * @method handleTechnology
    * @description called
    */
    handleTechnology = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ selectedTechnology: newValue, }, () => {
                const { selectedTechnology } = this.state;
                this.props.getVendorListByTechnology(selectedTechnology.value, () => { })
                this.props.getOperationListByTechnology(selectedTechnology.value, () => { })
            });
        } else {
            this.setState({ selectedTechnology: [], })
            this.props.getOperationSelectList(() => { })
            this.props.getVendorWithVendorCodeSelectList()
        }
    };

    /**
    * @method handleOperationName
    * @description called
    */
    handleOperationName = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ operationName: newValue }, () => {
                const { operationName } = this.state;
                this.props.getTechnologyListByOperation(operationName.value, () => { })
                this.props.getVendorListByOperation(operationName.value, () => { })
            });
        } else {
            this.setState({ operationName: [] })
            this.props.getTechnologySelectList(() => { })
            this.props.getVendorWithVendorCodeSelectList()
        }
    };

    /**
    * @method handleVendorName
    * @description called
    */
    handleVendorName = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ vendorName: newValue }, () => {
                const { vendorName } = this.state;
                this.props.getTechnologyListByVendor(vendorName.value, () => { })
                this.props.getOperationListByVendor(vendorName.value, () => { })
            });
        } else {
            this.setState({ vendorName: [] })
            this.props.getTechnologySelectList(() => { })
            this.props.getOperationSelectList(() => { })
        }
    };

    /**
    * @method handleVendorType
    * @description Used to handle vendor type
    */
    handleVendorType = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ vendorType: newValue, vendorName: [], });
        } else {
            this.setState({ vendorType: [], vendorName: [] })
        }
    };

    /**
    * @method hyphenFormatter
    */
    hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }

    /**
    * @method commonCostFormatter
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
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        if (this.props.selectedRowForPagination?.length > 0) {
            this.props.selectedRowForPagination.map((item) => {
                if (item.OperationId === props.node.data.OperationId) {
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
 * @method effectiveDateFormatter
 * @description Renders buttons
 */
    effectiveDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '-';
    }


    renderPlantFormatter = (props) => {
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        let data = rowData.CostingHead === "Vendor Based" ? rowData.DestinationPlant : rowData.Plants

        return (data !== ' ' ? data : '-');
    }


    formToggle = () => {

        this.props.formToggle()
    }

    hideForm = () => {
        this.setState({
            toggleForm: false,
            data: { isEditFlag: false, ID: '' }
        }, () => {
            this.resetState()
        })
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
    * @name onSubmit
    * @param values
    * @desc Submit the signup form values.
    * @returns {{}}
    */
    onSubmit(values) {
    }

    onGridReady = (params) => {
        this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
        if (this.props.isSimulation || this.props.isMasterSummaryDrawer) {
            window.screen.width >= 1600 && params.api.sizeColumnsToFit()
        }
        window.screen.width >= 1921 && params.api.sizeColumnsToFit()
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
                let button = document.getElementById('Excel-Downloads-operation')
                button && button.click()
            }, 400);

        } else {
            this.getTableListData(null, null, null, null, 0, defaultPageSize, false, this.state.floatingFilterData)  // FOR EXCEL DOWNLOAD OF COMPLETE DATA
        }
    }

    onBtExport = () => {
        let tempArr = []
        //tempArr = this.state.gridApi && this.state.gridApi?.getSelectedRows()
        tempArr = this.props.selectedRowForPagination
        tempArr = (tempArr && tempArr.length > 0) ? tempArr : (this.props.allOperationList ? this.props.allOperationList : [])
        return this.returnExcelColumn(OPERATION_DOWNLOAD_EXCEl, tempArr)
    };

    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData && TempData.map((item) => {
            if (item.Specification === null) {
                item.Specification = ' '
            }
            else if (item.Plants === '-') {
                item.Plants = ' '
            } else if (item.VendorName === '-') {
                item.VendorName = ' '
            }
            return item
        })
        return (

            <ExcelSheet data={temp} name={OperationMaster}>
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
        const { isSimulation } = this.props;
        const { toggleForm, data, isBulkUpload, AddAccessibility, BulkUploadAccessibility, DownloadAccessibility, noData } = this.state;
        const ExcelFile = ReactExport.ExcelFile;


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
            this.setState({ floatingFilterData: { ...this.state.floatingFilterData, EffectiveDate: date } })
        }

        if (toggleForm) {
            return (
                <AddOperation
                    hideForm={this.hideForm}
                    data={data}
                />
            )
        }

        const onRowSelect = (event) => {

            var selectedRows = this.state.gridApi.getSelectedRows();
            if (selectedRows === undefined || selectedRows === null) {     //CONDITION FOR FIRST RENDERING OF COMPONENT
                selectedRows = this.props.selectedRowForPagination
            } else if (this.props.selectedRowForPagination && this.props.selectedRowForPagination.length > 0) {   // CHECKING IF REDUCER HAS DATA

                let finalData = []
                if (event.node.isSelected() === false) {  // CHECKING IF CURRENT CHECKBOX IS UNSELECTED

                    for (let i = 0; i < this.props.selectedRowForPagination.length; i++) {
                        if (this.props.selectedRowForPagination[i].OperationId === event.data.OperationId) {  // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
                            continue;
                        }
                        finalData.push(this.props.selectedRowForPagination[i])
                    }
                } else {
                    finalData = this.props.selectedRowForPagination
                }
                selectedRows = [...selectedRows, ...finalData]
            }


            let uniqeArray = _.uniqBy(selectedRows, "OperationId")          //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
            this.props.setSelectedRowForPagination(uniqeArray)                //SETTING CHECKBOX STATE DATA IN REDUCER
            this.setState({ dataCount: uniqeArray.length })
            let finalArr = selectedRows
            let length = finalArr?.length
            let uniqueArray = _.uniqBy(finalArr, "OperationId")

            if (this.props.isSimulation) {

                this.props.apply(uniqueArray, length)
            }

            this.setState({ selectedRowData: selectedRows })
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
            checkboxSelection: isFirstColumn,
            headerCheckboxSelection: this.props.isSimulation ? isFirstColumn : false,
        };

        const frameworkComponents = {
            totalValueRenderer: this.buttonFormatter,
            customNoRowsOverlay: NoContentFound,
            costingHeadFormatter: this.costingHeadFormatter,
            renderPlantFormatter: this.renderPlantFormatter,
            effectiveDateFormatter: this.effectiveDateFormatter,
            hyphenFormatter: this.hyphenFormatter,
            commonCostFormatter: this.commonCostFormatter
        };
        return (
            <div className={`${isSimulation ? 'simulation-height' : this.props?.isMasterSummaryDrawer ? '' : 'min-height100vh'}`}>
                {(this.state.isLoader && !this.props.isMasterSummaryDrawer) && <LoaderCustom customClass="simulation-Loader" />}
                <div className={`ag-grid-react ${(this.props?.isMasterSummaryDrawer === undefined || this.props?.isMasterSummaryDrawer === false) ? "custom-pagination" : ""} ${DownloadAccessibility ? "show-table-btn no-tab-page" : ""}`}>
                    <form>

                        <Row className={`pt-4 filter-row-large blue-before ${isSimulation ? "zindex-0" : ""}`}>
                            <Col md="3" lg="3">
                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
                            </Col>
                            <Col md="9" lg="9" className=" mb-3 d-flex justify-content-end">
                                {this.state.disableDownload && <div title={MESSAGES.DOWNLOADING_MESSAGE} className="disabled-overflow"><WarningMessage dClass="ml-4 mt-1" message={MESSAGES.DOWNLOADING_MESSAGE} /></div>}
                                <div className="d-flex justify-content-end bd-highlight w100">
                                    {(this.props?.isMasterSummaryDrawer === undefined || this.props?.isMasterSummaryDrawer === false) &&
                                        <div className="warning-message d-flex align-items-center">
                                            {this.state.warningMessage && !this.state.disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                                        </div>
                                    }

                                    { }
                                    {(this.props?.isMasterSummaryDrawer === undefined || this.props?.isMasterSummaryDrawer === false) &&
                                        <button disabled={this.state.disableFilter} title="Filtered data" type="button" class="user-btn mr5" onClick={() => this.onSearch()}><div class="filter mr-0"></div></button>

                                    }
                                    {(!isSimulation) && <>

                                        {this.state.shown ?
                                            <button type="button" className="user-btn mr5 filter-btn-top mt3px" onClick={() => this.setState({ shown: !this.state.shown })}>
                                                <div className="cancel-icon-white"></div>
                                            </button>
                                            :
                                            ""
                                        }

                                        {AddAccessibility && !this.props?.isMasterSummaryDrawer && (
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
                                        {BulkUploadAccessibility && !this.props?.isMasterSummaryDrawer && (
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
                                            DownloadAccessibility && !this.props?.isMasterSummaryDrawer &&
                                            <>

                                                {this.state.disableDownload ? <div className='p-relative mr5'> <LoaderCustom customClass={"download-loader"} /> <button type="button" className={'user-btn'}><div className="download mr-0"></div>
                                                </button></div> :
                                                    <>
                                                        <button type="button" onClick={this.onExcelDownload} className={'user-btn mr5'}><div className="download mr-0" title="Download"></div>
                                                            {/* DOWNLOAD */}
                                                        </button>

                                                        <ExcelFile filename={'Operation'} fileExtension={'.xls'} element={
                                                            <button id={'Excel-Downloads-operation'} className="p-absolute" type="button" >
                                                            </button>}>
                                                            {this.onBtExport()}
                                                        </ExcelFile>
                                                    </>
                                                }

                                            </>
                                        }
                                    </>
                                    }
                                </div>

                                <button type="button" className="user-btn mr5" title="Reset Grid" onClick={() => this.resetState()}>
                                    <div className="refresh mr-0"></div>
                                </button>
                            </Col>

                        </Row>
                    </form>
                    <div className={`ag-grid-wrapper p-relative ${(this.props?.isDataInMaster && noData) ? 'master-approval-overlay' : ''} ${(this.state.tableData && this.state.tableData.length <= 0) || noData ? 'overlay-contain' : ''}  ${this.props.isSimulation ? 'min-height' : ''}`}>
                        <SelectRowWrapper dataCount={this.state.dataCount} className="mb-0 mt-n1" />
                        <div className={`ag-theme-material ${(this.state.isLoader && !this.props.isMasterSummaryDrawer) && "max-loader-height"}`}>
                            {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                            <AgGridReact
                                defaultColDef={defaultColDef}
                                floatingFilter={true}
                                domLayout='autoHeight'
                                rowData={this.state.tableData}
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
                                suppressRowClickSelection={true}
                                onFilterModified={this.onFloatingFilterChanged}
                                enableBrowserTooltips={true}
                            >

                                <AgGridColumn field="CostingHead" headerName="Costing Head" cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                                {!isSimulation && <AgGridColumn field="Technology" tooltipField='Technology' filter={true} floatingFilter={true} headerName="Technology"></AgGridColumn>}
                                <AgGridColumn field="OperationName" tooltipField="OperationName" headerName="Operation Name"></AgGridColumn>
                                <AgGridColumn field="OperationCode" headerName="Operation Code" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                <AgGridColumn field="Plants" headerName="Plant(Code)"  ></AgGridColumn>
                                <AgGridColumn field="VendorName" headerName="Vendor(Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                <AgGridColumn field="DepartmentName" headerName="Company Code" ></AgGridColumn>
                                <AgGridColumn field="CustomerName" headerName="CustomerName" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                {/* <AgGridColumn field="DepartmentName" headerName="Department"></AgGridColumn> */}
                                <AgGridColumn field="UnitOfMeasurement" headerName="UOM"></AgGridColumn>
                                <AgGridColumn field="Rate" headerName="Rate" cellRenderer={'commonCostFormatter'}></AgGridColumn>
                                <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={'effectiveDateFormatter'} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                                {!isSimulation && !this.props?.isMasterSummaryDrawer && <AgGridColumn field="OperationId" cellClass={"actions-wrapper"} width={150} headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}
                            </AgGridReact>
                            <div className='button-wrapper'>
                                {!this.state.isLoader && <PaginationWrapper gridApi={this.gridApi} setPage={this.onPageSizeChanged} globalTake={this.state.globalTake} />}
                                {(this.props?.isMasterSummaryDrawer === undefined || this.props?.isMasterSummaryDrawer === false) &&
                                    <div className="d-flex pagination-button-container">
                                        <p><button className="previous-btn" type="button" disabled={false} onClick={() => this.onBtPrevious()}> </button></p>
                                        {this.state.pageSize.pageSize10 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{this.state.pageNo}</span> of {Math.ceil(Number(this.state.totalRecordCount ? this.state.totalRecordCount / 10 : 0 / 10))}</p>}
                                        {this.state.pageSize.pageSize50 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{this.state.pageNo}</span> of {Math.ceil(this.state.totalRecordCount / 50)}</p>}
                                        {this.state.pageSize.pageSize100 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{this.state.pageNo}</span> of {Math.ceil(this.state.totalRecordCount / 100)}</p>}
                                        <p><button className="next-btn" type="button" onClick={() => this.onBtNext()}> </button></p>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>

                    {isBulkUpload && <BulkUpload
                        isOpen={isBulkUpload}
                        closeDrawer={this.closeBulkUploadDrawer}
                        isEditFlag={false}
                        fileName={'Operation'}
                        isZBCVBCTemplate={true}
                        messageLabel={'Operation'}
                        anchor={'right'}
                        isFinalApprovar={this.state.isFinalApprovar}
                    />}
                </div>
                {
                    this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.OPERATION_DELETE_ALERT}`} />
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
function mapStateToProps({ otherOperation, auth, simulation }) {
    const { loading, filterOperation, operationList, allOperationList, operationSurfaceTreatmentList, operationIndividualList, setOperationData, operationDataHold } = otherOperation;
    const { leftMenuData, initialConfiguration, topAndLeftMenuData } = auth;
    const { selectedRowForPagination } = simulation;
    return { loading, filterOperation, leftMenuData, operationList, allOperationList, initialConfiguration, topAndLeftMenuData, operationSurfaceTreatmentList, operationIndividualList, selectedRowForPagination, setOperationData, operationDataHold };
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
                * @param {function} mapDispatchToProps
                */
export default connect(mapStateToProps, {
    getTechnologySelectList,
    getOperationsDataList,
    deleteOperationAPI,
    getVendorWithVendorCodeSelectList,
    getOperationSelectList,
    getVendorListByTechnology,
    getOperationListByTechnology,
    getTechnologyListByOperation,
    getVendorListByOperation,
    getTechnologyListByVendor,
    getOperationListByVendor,
    getListingForSimulationCombined,
    masterFinalLevelUser,
    setSelectedRowForPagination,
    setOperationList,
    disabledClass
})(reduxForm({
    form: 'OperationListing',
    onSubmitFail: errors => {
        focusOnError(errors);
    },
    enableReinitialize: true,
})(OperationListing));
