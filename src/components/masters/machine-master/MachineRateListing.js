import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { defaultPageSize, EMPTY_DATA, MACHINERATE, MACHINE_MASTER_ID } from '../../../config/constants';
import { getMachineDataList, deleteMachine, copyMachine, getProcessGroupByMachineId } from '../actions/MachineMaster';
import { getTechnologySelectList } from '../../../actions/Common';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import BulkUpload from '../../massUpload/BulkUpload';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import { MACHINERATE_DOWNLOAD_EXCEl } from '../../../config/masterData';
import LoaderCustom from '../../common/LoaderCustom';
import DayTime from '../../common/DayTimeWrapper'
import { MachineRate } from '../../../config/constants';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import ReactExport from 'react-export-excel';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { onFloatingFilterChanged, onSearch, resetState, onBtPrevious, onBtNext, onPageSizeChanged, PaginationWrapper } from '../../common/commonPagination'
import { getFilteredData, userDetails, loggedInUserId, getConfigurationKey, userDepartmetList } from '../../../helper'
import { getListingForSimulationCombined } from '../../simulation/actions/Simulation';
import { masterFinalLevelUser } from '../../masters/actions/Material'
import ProcessGroupDrawer from './ProcessGroupDrawer'
import WarningMessage from '../../common/WarningMessage';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

class MachineRateListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            tableData: [],
            shown: false,
            costingHead: [],
            plant: [],
            technology: [],
            vendorName: [],
            processName: [],
            machineType: [],

            isBulkUpload: false,
            isLoader: false,
            showPopup: false,
            deletedId: '',
            isFinalApprovar: false,
            isProcessGroup: getConfigurationKey().IsMachineProcessGroup, // UNCOMMENT IT AFTER DONE FROM BACKEND AND REMOVE BELOW CODE
            // isProcessGroup: false,
            isOpenProcessGroupDrawer: false,

            //states for pagination purpose
            floatingFilterData: { CostingHeadNew: "", Technologies: "", VendorName: "", Plants: "", MachineNumber: "", MachineTypeName: "", MachineTonnage: "", ProcessName: "", MachineRate: "", EffectiveDateNew: "", DepartmentCode: this.props.isSimulation ? userDepartmetList() : "" },
            warningMessage: false,
            filterModel: {},
            pageNo: 1,
            totalRecordCount: 0,
            isFilterButtonClicked: false,
            currentRowIndex: 0,
            pageSize: { pageSize10: true, pageSize50: false, pageSize100: false },
            globalTake: defaultPageSize
        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {

        if (this.props.isSimulation) {
            if (this.props.selectionForListingMasterAPI === 'Combined') {
                this.props?.changeSetLoader(true)
                this.props.getListingForSimulationCombined(this.props.objectForMultipleSimulation, MACHINERATE, () => {
                    this.props?.changeSetLoader(false)

                })
            }
        }
        if (this.props.selectionForListingMasterAPI === 'Master') {
            this.getDataList("", 0, "", 0, "", "", 0, defaultPageSize, true, this.state.floatingFilterData)
        }
        let obj = {
            MasterId: MACHINE_MASTER_ID,
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


    getDataList = (costing_head = '', technology_id = 0, vendor_id = '', machine_type_id = 0, process_id = '', plant_id = '', skip = 0, take = 100, isPagination = true, dataObj) => {
        const filterData = {
            costing_head: costing_head,
            technology_id: this.props.isSimulation ? this.props.technology : technology_id,
            vendor_id: vendor_id,
            machine_type_id: machine_type_id,
            process_id: process_id,
            plant_id: plant_id,
        }

        if (this.props.isMasterSummaryDrawer !== undefined && !this.props.isMasterSummaryDrawer) {
            if (this.props.isSimulation) {
                this.props?.changeTokenCheckBox(false)
            }
            this.setState({ isLoader: true })
            let FloatingfilterData = this.state.filterModel
            this.props.getMachineDataList(filterData, skip, take, isPagination, dataObj, (res) => {
                if (this.props.isSimulation) {
                    this.props?.changeTokenCheckBox(true)
                }
                this.setState({ isLoader: false })

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
                        isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(FloatingfilterData))

                    }, 300);

                    setTimeout(() => {
                        this.setState({ isFilterButtonClicked: false })
                    }, 600);
                }
            })
        }
    }


    onFloatingFilterChanged = (value) => {
        onFloatingFilterChanged(value, gridOptions, this)   // COMMON FUNCTION
    }

    onSearch = () => {
        onSearch(gridOptions, this, "Machine", this.state.globalTake)  // COMMON PAGINATION FUNCTION
    }

    resetState = () => {
        resetState(gridOptions, this, "Machine")  //COMMON PAGINATION FUNCTION
    }

    onBtPrevious = () => {
        onBtPrevious(this, "Machine")       //COMMON PAGINATION FUNCTION
    }

    onBtNext = () => {
        onBtNext(this, "Machine")   // COMMON PAGINATION FUNCTION
    };

    onPageSizeChanged = (newPageSize) => {
        onPageSizeChanged(this, newPageSize, "Machine", this.state.currentRowIndex)    // COMMON PAGINATION FUNCTION
    };

    /**
    
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
        }
        this.props.getDetails(data, rowData?.IsMachineAssociated);
    }

    /**
     * @method viewProcessGroupDetail
     * @description VIEW PROCESS GROUP LIST 
    */

    viewProcessGroupDetail = (rowData) => {
        this.props.getProcessGroupByMachineId(rowData.MachineId, res => {
            if (res.data.Result || res.status === 204) {
                this.setState({
                    isOpenProcessGroupDrawer: true
                })
            }
        })
    }

    closeProcessGroupDrawer = () => {
        this.setState({ isOpenProcessGroupDrawer: false })
    }


    /**
    * @method copyItem
    * @description edit material type
    */
    copyItem = (Id) => {
        this.props.copyMachine(Id, (res) => {
            if (res.data.Result === true) {
                Toaster.success(MESSAGES.COPY_MACHINE_SUCCESS);
                this.resetState()
            }
        });
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
        this.props.deleteMachine(ID, (res) => {
            if (res.data.Result === true) {
                Toaster.success(MESSAGES.DELETE_MACHINE_SUCCESS);
                this.resetState()
            }
        });
    }
    onPopupConfirm = () => {
        this.confirmDelete(this.state.deletedId);
        this.setState({ showPopup: false })

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

        const { EditAccessibility, DeleteAccessibility, ViewAccessibility } = this.props;


        let isEditable = false
        let isDeleteButton = false


        if (EditAccessibility) {
            isEditable = true
        } else {
            isEditable = false
        }


        if (DeleteAccessibility && !rowData.IsMachineAssociated) {
            isDeleteButton = true
        } else {
            isDeleteButton = false
        }

        return (
            <>
                {this.state.isProcessGroup && <button className="group-process" type={'button'} title={'View Process Group'} onClick={() => this.viewProcessGroupDetail(rowData)} />}
                {ViewAccessibility && <button title="View" className="View" type={'button'} onClick={() => this.viewOrEditItemDetails(cellValue, rowData, true)} />}
                {isEditable && <button title="Edit" className="Edit" type={'button'} onClick={() => this.viewOrEditItemDetails(cellValue, rowData, false)} />}
                <button className="Copy All Costing" title="Copy Machine" type={'button'} onClick={() => this.copyItem(cellValue)} />
                {isDeleteButton && <button title="Delete" className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
            </>
        )
    };

    /**
    * @method costingHeadFormatter
    * @description Renders Costing head
    */
    costingHeadFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cellValue === 'VBC' || cellValue === "Vendor Based") ? 'Vendor Based' : 'Zero Based';
    }

    /**
     * @method hyphenFormatter
     */
    hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }

    /**
    * @method plantsFormatter
    * @description Renders Costing head
    */
    plantsFormatter = (cell, row, enumObject, rowIndex) => {
        return cell === '' ? '-' : cell;
    }

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
    * @method effectiveDateFormatter
    * @description Renders buttons
    */
    effectiveDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
    }

    renderPlantFormatter = (props) => {
        const row = props?.data;

        const value = row.CostingHead === 'VBC' ? row.DestinationPlant : row.Plants
        return value
    }

    bulkToggle = () => {
        this.setState({ isBulkUpload: true })
    }

    closeBulkUploadDrawer = () => {
        this.setState({ isBulkUpload: false }, () => {
            this.resetState()
        })
    }

    displayForm = () => {
        this.props.displayForm()
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => { }
    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData && TempData.map((item) => {
            if (item.MachineTonnage === null) {
                item.MachineTonnage = ' '
            } else if (item.EffectiveDate === null) {
                item.EffectiveDate = ' '
            } else if (item.IsVendor === true) {
                item.IsVendor = 'Vendor Based'
            } else if (item.IsVendor === false) {
                item.IsVendor = 'Zero Based'
            } else if (item.Plants === '-') {
                item.Plants = ' '
            } else if (item.MachineTypeName === '-') {
                item.MachineTypeName = ' '
            } else if (item.VendorName === '-') {
                item.VendorName = ' '
            }
            if (item.EffectiveDate !== null) {
                item.EffectiveDate = DayTime(item.EffectiveDate).format('DD/MM/YYYY')
            }

            return item
        })

        return (<ExcelSheet data={temp} name={`${MachineRate}`}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)
            }
        </ExcelSheet>);
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
            tempArr = this.props.machineDatalist && this.props.machineDatalist
        }
        return this.returnExcelColumn(MACHINERATE_DOWNLOAD_EXCEl, tempArr)
    };

    onFilterTextBoxChanged(e) {
        this.state.gridApi.setQuickFilter(e.target.value);
    }

    resetState() {
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);
    }

    getFilterMachineData = () => {
        if (this.props.isSimulation) {
            return getFilteredData(this.props.machineDatalist, MACHINE_MASTER_ID)
        } else {
            return this.props.machineDatalist
        }
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, AddAccessibility, BulkUploadAccessibility, DownloadAccessibility, isSimulation } = this.props;
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
            this.setState({ floatingFilterData: { ...this.state.floatingFilterData, EffectiveDateNew: date, newDate: date } })
        }


        const isFirstColumn = (params) => {
            if (isSimulation) {

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
            effectiveDateRenderer: this.effectiveDateFormatter,
            costingHeadRenderer: this.costingHeadFormatter,
            customNoRowsOverlay: NoContentFound,
            hyphenFormatter: this.hyphenFormatter,
            renderPlantFormatter: this.renderPlantFormatter
        };
        const onRowSelect = () => {
            var selectedRows = this.state.gridApi.getSelectedRows();
            if (isSimulation) {
                let length = this.state.gridApi.getSelectedRows().length
                this.props.apply(selectedRows, length)
            }
        }

        return (
            <div className={`ag-grid-react ${(this.props?.isMasterSummaryDrawer === undefined || this.props?.isMasterSummaryDrawer === false) ? "custom-pagination" : ""} ${DownloadAccessibility ? "show-table-btn" : ""}`}>
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                    {(this.state.isLoader && !this.props.isMasterSummaryDrawer) && <LoaderCustom />}
                    <Row className={`pt-4 filter-row-large ${this.props.isSimulation ? 'simulation-filter zindex-0' : ''}`}>
                        <Col md="3" lg="3">
                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
                        </Col>
                        <Col md="9" lg="9" className="pl-0 mb-3">
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
                                        onClick={this.displayForm}
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

                                        <ExcelFile filename={'Machine Rate'} fileExtension={'.xls'} element={
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

                </form>
                <Row>
                    <Col>
                        <div className={`ag-grid-wrapper ${this.props.isSimulation ? 'simulation-height' : 'height-width-wrapper'} ${this.props.machineDatalist && this.props.machineDatalist?.length <= 0 ? "overlay-contain" : ""}`}>

                            <div className={`ag-theme-material ${this.state.isLoader && "max-loader-height"}`}>
                                <AgGridReact
                                    defaultColDef={defaultColDef}
                                    floatingFilter={true}
                                    domLayout='autoHeight'
                                    rowData={this.getFilterMachineData()}
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
                                    onSelectionChanged={onRowSelect}
                                    onFilterModified={this.onFloatingFilterChanged}
                                >
                                    <AgGridColumn field="CostingHeadNew" headerName="Costing Head" ></AgGridColumn>
                                    {!isSimulation && <AgGridColumn field="Technologies" headerName="Technology"></AgGridColumn>}
                                    <AgGridColumn field="VendorName" headerName="Vendor(Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    <AgGridColumn field="Plants" headerName="Plant(Code)" cellRenderer='hyphenFormatter'></AgGridColumn>
                                    <AgGridColumn field="MachineNumber" headerName="Machine Number" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    <AgGridColumn field="MachineTypeName" headerName="Machine Type" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    <AgGridColumn field="MachineTonnage" cellRenderer={'hyphenFormatter'} headerName="Machine Tonnage"></AgGridColumn>
                                    <AgGridColumn field="ProcessName" headerName="Process Name"></AgGridColumn>
                                    <AgGridColumn field="MachineRate" headerName="Machine Rate"></AgGridColumn>
                                    <AgGridColumn field="EffectiveDateNew" headerName="Effective Date" cellRenderer={'effectiveDateRenderer'} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                                    {!isSimulation && !this.props?.isMasterSummaryDrawer && <AgGridColumn field="MachineId" width={230} cellClass={"actions-wrapper"} headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}
                                </AgGridReact>
                                <div className='button-wrapper'>
                                    {<PaginationWrapper gridApi={this.gridApi} setPage={this.onPageSizeChanged} globalTake={this.state.globalTake} />}
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
                        fileName={'Machine'}
                        isZBCVBCTemplate={true}
                        isMachineMoreTemplate={true}
                        messageLabel={'Machine'}
                        anchor={'right'}
                        isFinalApprovar={this.state.isFinalApprovar}
                    />
                }
                {
                    this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.MACHINE_DELETE_ALERT}`} />
                }
                {
                    this.state.isOpenProcessGroupDrawer && <ProcessGroupDrawer anchor={'right'} isOpen={this.state.isOpenProcessGroupDrawer} toggleDrawer={this.closeProcessGroupDrawer} isViewFlag={true} />
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
function mapStateToProps(state) {

    const { comman, process, machine, } = state;
    const { technologySelectList, } = comman;
    const { filterSelectList } = process;
    const { machineDatalist } = machine
    const { auth } = state;
    const { initialConfiguration } = auth;

    return { technologySelectList, filterSelectList, machineDatalist, initialConfiguration }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getTechnologySelectList,
    getMachineDataList,
    deleteMachine,
    copyMachine,
    getListingForSimulationCombined,
    masterFinalLevelUser,
    getProcessGroupByMachineId
})(reduxForm({
    form: 'MachineRateListing',
    enableReinitialize: true,
})(MachineRateListing));