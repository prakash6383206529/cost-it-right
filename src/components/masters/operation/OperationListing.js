import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { focusOnError } from "../../layout/FormInputs";
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { EMPTY_DATA, OPERATIONS, SURFACETREATMENT } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import {
    getOperationsDataList, deleteOperationAPI, getOperationSelectList, getVendorWithVendorCodeSelectList, getTechnologySelectList,
    getVendorListByTechnology, getOperationListByTechnology, getTechnologyListByOperation, getVendorListByOperation,
    getTechnologyListByVendor, getOperationListByVendor,
} from '../actions/OtherOperation';
import Switch from "react-switch";
import AddOperation from './AddOperation';
import BulkUpload from '../../massUpload/BulkUpload';
import { ADDITIONAL_MASTERS, OPERATION, OperationMaster, OPERATIONS_ID } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';
import { loggedInUserId } from '../../../helper/auth';
import { getFilteredData, CheckApprovalApplicableMaster } from '../../../helper'
import { costingHeadObjs, OPERATION_DOWNLOAD_EXCEl } from '../../../config/masterData';
import LoaderCustom from '../../common/LoaderCustom';
import DayTime from '../../common/DayTimeWrapper'
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { filterParams } from '../../common/DateFilter'

const ExcelFile = ReactExport.ExcelFile;
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
            isLoader: false
        }
    }

    componentDidMount() {
        this.applyPermission(this.props.topAndLeftMenuData)
        this.props.getTechnologySelectList(() => { })
        this.props.getOperationSelectList(() => { })
        this.props.getVendorWithVendorCodeSelectList()
        this.getTableListData(null, null, null, null)
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
        this.getTableListData(null, null, null, null)
    }

    /**
    * @method getTableListData
    * @description Get user list data
    */
    getTableListData = (operation_for = null, operation_Name_id = null, technology_id = null, vendor_id = null) => {
        this.setState({ isLoader: true })

        const { isMasterSummaryDrawer } = this.props
        let filterData = {
            operation_for: operation_for,
            operation_Name_id: operation_Name_id,
            technology_id: this.props.isSimulation ? this.props.technology : technology_id,
            vendor_id: vendor_id,
        }


        if (isMasterSummaryDrawer !== undefined && !isMasterSummaryDrawer) {
            this.props.getOperationsDataList(filterData, this.props.isOperationST, res => {
                this.setState({ isLoader: false })
                if (res.status === 204 && res.data === '') {
                    this.setState({ tableData: [], })
                } else if (res && res.data && res.data.DataList) {
                    let Data = res.data.DataList;
                    if (Number(this.props.isOperationST) === Number(SURFACETREATMENT)) {
                        let surfaceTreatmentOperationData = []
                        Data && Data.map(item => {
                            if (item.IsSurfaceTreatmentOperation === true) {
                                surfaceTreatmentOperationData.push(item)
                            }
                        })
                        this.setState({ tableData: surfaceTreatmentOperationData })
                    } else if (Number(this.props.isOperationST) === Number(OPERATIONS)) {
                        let OperationData = []
                        Data && Data.map(item => {
                            if (item.IsSurfaceTreatmentOperation === false) {
                                OperationData.push(item)
                            }
                        })
                        this.setState({ tableData: OperationData })
                    } else {
                        this.setState({ tableData: Data })
                    }

                    // if (this.props.isSimulation) {
                    //     this.props.apply(Data)
                    // }
                } else {

                }
            });
        } else {

            setTimeout(() => {
                this.setState({ tableData: this.props.operationList })

            }, 700);

        }
    }

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
        this.props.getDetails(data);
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
                this.getTableListData(null, null, null, null)
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


            if (EditAccessibility && !rowData.IsOperationAssociated) {
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
                {ViewAccessibility && <button className="View mr-2" type={'button'} onClick={() => this.viewOrEditItemDetails(cellValue, rowData, true)} />}
                {isEditable && <button className="Edit mr-2" type={'button'} onClick={() => this.viewOrEditItemDetails(cellValue, rowData, false)} />}
                {isDeleteButton && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
            </>
        )
    };

    handleChange = (cell, row) => {
        let data = {
            Id: row.VendorId,
            ModifiedBy: loggedInUserId(),
            IsActive: !cell, //Status of the user.
        }

    }

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
    * @method statusButtonFormatter
    * @description Renders buttons
    */
    statusButtonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                <label htmlFor="normal-switch" className="normal-switch">
                    {/* <span>Switch with default style</span> */}
                    <Switch
                        onChange={() => this.handleChange(cellValue, rowData)}
                        checked={cellValue}
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
    }

    /**
    * @method hyphenFormatter
    */
    hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }

    /**
    * @method costingHeadFormatter
    * @description Renders Costing head
    */
    costingHeadFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        let data = (cellValue === true || cellValue === 'Vendor Based' || cellValue === 'VBC') ? 'Vendor Based' : 'Zero Based';
        return data;
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


    resetFilter = () => {
        this.setState({
            costingHead: [],
            vendorName: [],
            selectedTechnology: [],
            operationName: [],
        }, () => {
            this.props.getTechnologySelectList(() => { })
            this.props.getOperationSelectList(() => { })
            this.props.getVendorWithVendorCodeSelectList()
            this.getTableListData(null, null, null, null)
        })
    }

    formToggle = () => {

        this.props.formToggle()
    }

    hideForm = () => {
        this.setState({
            toggleForm: false,
            data: { isEditFlag: false, ID: '' }
        }, () => {
            this.getTableListData(null, null, null, null)
        })
    }

    bulkToggle = () => {
        this.setState({ isBulkUpload: true })
    }

    closeBulkUploadDrawer = () => {
        this.setState({ isBulkUpload: false }, () => {
            this.getTableListData(null, null, null, null)
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
        params.api.paginationGoToPage(0);
    };

    onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        this.state.gridApi.paginationSetPageSize(Number(value));
    };

    onBtExport = () => {
        let tempArr = this.state.tableData && this.state.tableData
        return this.returnExcelColumn(OPERATION_DOWNLOAD_EXCEl, tempArr)
    };

    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData && TempData.map((item) => {
            if (item.Specification === null) {
                item.Specification = ' '
            } else if (item.CostingHead === true) {
                item.CostingHead = 'Vendor Based'
            } else if (item.CostingHead === false) {
                item.CostingHead = 'Zero Based'
            } else if (item.Plants === '-') {
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

    resetState() {
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);
    }


    getFilterOperationData = () => {
        if (this.props.isSimulation) {
            return getFilteredData(this.state.tableData, OPERATIONS_ID)
        } else {
            return this.state.tableData
        }
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, isSimulation } = this.props;
        const { toggleForm, data, isBulkUpload, AddAccessibility, BulkUploadAccessibility, DownloadAccessibility, tableData } = this.state;
        const ExcelFile = ReactExport.ExcelFile;

        if (toggleForm) {
            return (
                <AddOperation
                    hideForm={this.hideForm}
                    data={data}
                />
            )
        }
        const onRowSelect = () => {
            const { isSimulation } = this.props
            var selectedRows = this.state.gridApi.getSelectedRows();
            if (isSimulation) {
                let length = this.state.gridApi.getSelectedRows().length
                this.props.apply(selectedRows, length)
            }
            this.setState({ selectedRowData: selectedRows })

        }

        const isFirstColumn = (params) => {
            const { isSimulation } = this.props
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
            customNoRowsOverlay: NoContentFound,
            costingHeadFormatter: this.costingHeadFormatter,
            renderPlantFormatter: this.renderPlantFormatter,
            effectiveDateFormatter: this.effectiveDateFormatter,
            statusButtonFormatter: this.statusButtonFormatter,
            hyphenFormatter: this.hyphenFormatter
        };

        return (
            <div className="container-fluid">
                {(this.state.isLoader && !this.props.isMasterSummaryDrawer) && <LoaderCustom />}
                <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn no-tab-page" : ""}`}>
                    <form>

                        <Row className="pt-4 filter-row-large blue-before">
                            {(!isSimulation) &&

                                <Col md="6" lg="6" className="search-user-block mb-3">
                                    <div className="d-flex justify-content-end bd-highlight w100">
                                        <div>
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

                                                    <ExcelFile filename={'Operation'} fileExtension={'.xls'} element={
                                                        <button type="button" className={'user-btn mr5'}><div className="download mr-0" title="Download"></div>
                                                            {/* DOWNLOAD */}
                                                        </button>}>

                                                        {this.onBtExport()}
                                                    </ExcelFile>

                                                </>


                                            }
                                            <button type="button" className="user-btn mr5" title="Reset Grid" onClick={() => this.resetState()}>
                                                <div className="refresh mr-0"></div>
                                            </button>

                                        </div>
                                    </div>
                                </Col>
                            }
                        </Row>
                    </form>

                    <div className={`ag-grid-wrapper height-width-wrapper ${this.getFilterOperationData() && this.getFilterOperationData()?.length <= 0 ? "overlay-contain" : ""}`}>
                        <div className="ag-grid-header">
                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
                        </div>
                        <div className={`ag-theme-material ${(this.state.isLoader && !this.props.isMasterSummaryDrawer) && "max-loader-height"}`}>
                            <AgGridReact
                                defaultColDef={defaultColDef}
                                floatingFilter={true}
                                domLayout='autoHeight'
                                rowData={this.getFilterOperationData()}
                                pagination={true}

                                paginationPageSize={10}
                                onGridReady={this.onGridReady}
                                gridOptions={gridOptions}
                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                noRowsOverlayComponentParams={{
                                    customClassName: "operation-nodata",
                                    title: EMPTY_DATA,
                                    imagClass: 'imagClass'
                                }}
                                frameworkComponents={frameworkComponents}
                                rowSelection={'multiple'}
                                onSelectionChanged={onRowSelect}
                            >
                                <AgGridColumn field="CostingHead" headerName="Costing Head" cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                                <AgGridColumn field="Technology" filter={true} floatingFilter={true} headerName="Technology"></AgGridColumn>
                                <AgGridColumn field="OperationName" headerName="Operation Name"></AgGridColumn>
                                <AgGridColumn field="OperationCode" headerName="Operation Code" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                <AgGridColumn field="Plants" headerName="Plant(Code)" cellRenderer={'renderPlantFormatter'} ></AgGridColumn>
                                <AgGridColumn field="VendorName" headerName="Vendor(Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                <AgGridColumn field="UnitOfMeasurement" headerName="UOM"></AgGridColumn>
                                <AgGridColumn field="Rate" headerName="Rate" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={'effectiveDateFormatter'} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                                {!isSimulation && !this.props?.isMasterSummaryDrawer && <AgGridColumn field="OperationId" width={150} headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}
                            </AgGridReact>
                            <div className="paging-container d-inline-block float-right">
                                <select className="form-control paging-dropdown" onChange={(e) => this.onPageSizeChanged(e.target.value)} id="page-size">
                                    <option value="10" selected={true}>10</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
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
function mapStateToProps({ otherOperation, auth }) {
    const { loading, filterOperation, operationList, operationSurfaceTreatmentList, operationIndividualList } = otherOperation;
    const { leftMenuData, initialConfiguration, topAndLeftMenuData } = auth;
    return { loading, filterOperation, leftMenuData, operationList, initialConfiguration, topAndLeftMenuData, operationSurfaceTreatmentList, operationIndividualList };
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
})(reduxForm({
    form: 'OperationListing',
    onSubmitFail: errors => {
        focusOnError(errors);
    },
    enableReinitialize: true,
})(OperationListing));
