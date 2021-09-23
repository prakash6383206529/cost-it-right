import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import $ from "jquery";
import { focusOnError, searchableSelect } from "../../layout/FormInputs";
import { required } from "../../../helper/validation";
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import {
    getOperationsDataList, deleteOperationAPI, getOperationSelectList, getVendorWithVendorCodeSelectList, getTechnologySelectList,
    getVendorListByTechnology, getOperationListByTechnology, getTechnologyListByOperation, getVendorListByOperation,
    getTechnologyListByVendor, getOperationListByVendor,
} from '../actions/OtherOperation';
import Switch from "react-switch";
import AddOperation from './AddOperation';
import BulkUpload from '../../massUpload/BulkUpload';
import { ADDITIONAL_MASTERS, OPERATION, OperationMaster } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { loggedInUserId } from '../../../helper/auth';
import { getLeftMenu, } from '../../../actions/auth/AuthActions';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import { costingHeadObjs, OPERATION_DOWNLOAD_EXCEl } from '../../../config/masterData';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import LoaderCustom from '../../common/LoaderCustom';
import moment from 'moment';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

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
        let filterData = {
            operation_for: operation_for,
            operation_Name_id: operation_Name_id,
            technology_id: this.props.isSimulation ? this.props.technology : technology_id,
            vendor_id: vendor_id,
        }
        this.props.getOperationsDataList(filterData, res => {
            if (res.status === 204 && res.data === '') {
                this.setState({ tableData: [], })
            } else if (res && res.data && res.data.DataList) {
                let Data = res.data.DataList;
                this.setState({
                    tableData: Data,
                })
            } else {

            }
        });
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
    * @method editItemDetails
    * @description confirm edit item
    */
    // editItemDetails = (Id) => {
    //     this.setState({
    //         data: { isEditFlag: true, ID: Id },
    //         toggleForm: true,
    //     })
    // }

    editItemDetails = (Id, rowData) => {
        let data = {
            isEditFlag: true,
            ID: Id,
            toggleForm: true,
        }
        this.props.getDetails(data);
    }

    /**
    * @method deleteItem
    * @description confirm delete Item.
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeleteItem(Id)
            },
            onCancel: () => { },
            component: () => <ConfirmComponent />,
        };
        return toastr.confirm(MESSAGES.OPERATION_DELETE_ALERT, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteItem
    * @description confirm delete item
    */
    confirmDeleteItem = (ID) => {
        this.props.deleteOperationAPI(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_OPERATION_SUCCESS);
                this.getTableListData(null, null, null, null)
            }
        });
    }
    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    buttonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

        const { EditAccessibility, DeleteAccessibility } = this.state;

        return (
            <>
                {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cellValue, rowData)} />}
                {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
            </>
        )
    };

    handleChange = (cell, row) => {
        let data = {
            Id: row.VendorId,
            ModifiedBy: loggedInUserId(),
            IsActive: !cell, //Status of the user.
        }
        // this.props.activeInactiveVendorStatus(data, res => {
        //     if (res && res.data && res.data.Result) {
        //         if (cell == true) {
        //             toastr.success(MESSAGES.VENDOR_INACTIVE_SUCCESSFULLY)
        //         } else {
        //             toastr.success(MESSAGES.VENDOR_ACTIVE_SUCCESSFULLY)
        //         }
        //         this.getTableListData(null, null, null, null)
        //     }
        // })
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
    * @method costingHeadFormatter
    * @description Renders Costing head
    */
    costingHeadFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue ? 'Vendor Based' : 'Zero Based';
    }

    /**
 * @method effectiveDateFormatter
 * @description Renders buttons
 */
    effectiveDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? moment(cellValue).format('DD/MM/YYYY') : '';
    }


    renderPlantFormatter = (props) => {
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        return rowData.CostingHead ? rowData.DestinationPlant : rowData.Plants
    }

    /**
    * @method filterList
    * @description Filter user listing on the basis of role and department
    */
    filterList = () => {
        const { costingHead, selectedTechnology, vendorName, operationName, } = this.state;
        const costingHeadTemp = costingHead ? costingHead.value : null;
        const operationNameTemp = operationName ? operationName.value : null;
        const technologyTemp = selectedTechnology ? selectedTechnology.value : null;
        const vendorNameTemp = vendorName ? vendorName.value : null;
        this.getTableListData(costingHeadTemp, operationNameTemp, technologyTemp, vendorNameTemp)
    }

    /**
    * @method resetFilter
    * @description Reset user filter
    */
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
        // this.setState({ toggleForm: true })
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
        $("html,body").animate({ scrollTop: 0 }, "slow");
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
        let tempArr = []
        const data = this.state.gridApi && this.state.gridApi.length > 0 && this.state.gridApi.getModel().rowsToDisplay
        data && data.map((item => {
            tempArr.push(item.data)
        }))

        return this.returnExcelColumn(OPERATION_DOWNLOAD_EXCEl, this.props.operationList)
    };

    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        TempData && TempData.map((item) => {
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

            <ExcelSheet data={TempData} name={OperationMaster}>
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

    onFilterTextBoxChanged(e) {
        this.state.gridApi.setQuickFilter(e.target.value);
    }

    resetState() {
        gridOptions.columnApi.resetColumnState();
    }

    resetState() {
        gridOptions.columnApi.resetColumnState();
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, } = this.props;
        const { toggleForm, data, isBulkUpload, AddAccessibility, BulkUploadAccessibility, DownloadAccessibility } = this.state;
        const ExcelFile = ReactExport.ExcelFile;

        if (toggleForm) {
            return (
                <AddOperation
                    hideForm={this.hideForm}
                    data={data}
                />
            )
        }


        const defaultColDef = {
            resizable: true,
            filter: true,
            sortable: true,

        };

        const frameworkComponents = {
            totalValueRenderer: this.buttonFormatter,
            customLoadingOverlay: LoaderCustom,
            customNoRowsOverlay: NoContentFound,
            costingHeadFormatter: this.costingHeadFormatter,
            renderPlantFormatter: this.renderPlantFormatter,
            effectiveDateFormatter: this.effectiveDateFormatter,
            statusButtonFormatter: this.statusButtonFormatter
        };

        return (
            <div className="container-fluid">
                {/* {this.props.loading && <Loader />} */}
                <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn no-tab-page" : ""}`}>
                    <form>
                        {
                            // !this.props.isSimulation &&
                            // <Row>
                            //     <Col md="12"><h1 className="mb-0">Operation Master</h1></Col>
                            // </Row>
                        }
                        <Row className="pt-4 filter-row-large blue-before">
                            {this.state.shown &&
                                <Col md="12" lg="10" className="filter-block operation-filer-block ">
                                    <div className="d-inline-flex justify-content-start align-items-top w100">
                                        <div className="flex-fills">
                                            <h5>{`Filter By:`}</h5>
                                        </div>
                                        <div className="flex-fill">
                                            <Field
                                                name="costingHead"
                                                type="text"
                                                label=""
                                                component={searchableSelect}
                                                placeholder={"Costing Head"}
                                                isClearable={false}
                                                options={this.renderListing("costingHead")}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                validate={this.state.costingHead == null || this.state.costingHead.length === 0 ? [required] : []}
                                                required={true}
                                                handleChangeDescription={this.handleHeadChange}
                                                valueDescription={this.state.costingHead}
                                            />
                                        </div>
                                        <div className="flex-fill">
                                            <Field
                                                name="technology"
                                                type="text"
                                                label=""
                                                component={searchableSelect}
                                                placeholder={"Technology"}
                                                isClearable={false}
                                                options={this.renderListing("technology")}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                validate={this.state.selectedTechnology == null || this.state.selectedTechnology.length === 0 ? [required] : []}
                                                required={true}
                                                handleChangeDescription={this.handleTechnology}
                                                valueDescription={this.state.selectedTechnology}
                                            />
                                        </div>
                                        <div className="flex-fill">
                                            <Field
                                                name="operationName"
                                                type="text"
                                                label=""
                                                component={searchableSelect}
                                                placeholder={"Operation Name"}
                                                isClearable={false}
                                                options={this.renderListing("OperationNameList")}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                validate={this.state.operationName == null || this.state.operationName.length === 0 ? [required] : []}
                                                required={true}
                                                handleChangeDescription={this.handleOperationName}
                                                valueDescription={this.state.operationName}
                                            />
                                        </div>
                                        <div className="flex-fill">
                                            <Field
                                                name="vendorName"
                                                type="text"
                                                label=""
                                                component={searchableSelect}
                                                placeholder={"Vendors Name"}
                                                isClearable={false}
                                                options={this.renderListing("VendorList")}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                validate={this.state.vendorName == null || this.state.vendorName.length === 0 ? [required] : []}
                                                required={true}
                                                handleChangeDescription={this.handleVendorName}
                                                valueDescription={this.state.vendorName}
                                            />
                                        </div>

                                        <div className="flex-fill">
                                            <button
                                                type="button"
                                                //disabled={pristine || submitting}
                                                onClick={this.resetFilter}
                                                className="reset mr10"
                                            >
                                                {"Reset"}
                                            </button>
                                            <button
                                                type="button"
                                                //disabled={pristine || submitting}
                                                onClick={this.filterList}
                                                className="user-btn"
                                            >
                                                {"Apply"}
                                            </button>
                                        </div>
                                    </div>
                                </Col>}
                            <Col md="6" lg="6" className="search-user-block mb-3">
                                <div className="d-flex justify-content-end bd-highlight w100">
                                    <div>
                                        {this.state.shown ?
                                            <button type="button" className="user-btn mr5 filter-btn-top mt3px" onClick={() => this.setState({ shown: !this.state.shown })}>
                                                <div className="cancel-icon-white"></div>
                                            </button>
                                            :
                                            <button title="Filter" type="button" className="user-btn mr5" onClick={() => this.setState({ shown: !this.state.shown })}>
                                                <div className="filter mr-0"></div>
                                            </button>
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

                                                <ExcelFile filename={'Operation'} fileExtension={'.xls'} element={
                                                    <button type="button" className={'user-btn mr5'}><div className="download mr-0" title="Download"></div>
                                                        {/* DOWNLOAD */}
                                                    </button>}>

                                                    {this.onBtExport()}
                                                </ExcelFile>

                                            </>

                                            //   <button type="button" className={"user-btn mr5"} onClick={this.onBtExport}><div className={"download"} ></div>Download</button>

                                        }
                                        <button type="button" className="user-btn" title="Reset Grid" onClick={() => this.resetState()}>
                                            <div className="refresh mr-0"></div>
                                        </button>

                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </form>

                    <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                        <div className="ag-grid-header">
                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
                        </div>
                        <div
                            className="ag-theme-material"

                        >
                            <AgGridReact
                                defaultColDef={defaultColDef}
                                floatingFilter = {true}
domLayout='autoHeight'
                                // columnDefs={c}
                                rowData={this.props.operationList}
                                pagination={true}

                               // <AgGridColumn field="country" filter={true} floatingFilter={true} />

                                paginationPageSize={10}
                                onGridReady={this.onGridReady}
                                gridOptions={gridOptions}
                                loadingOverlayComponent={'customLoadingOverlay'}
                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                noRowsOverlayComponentParams={{
                                    customClassName:"operation-nodata",
                                    title: CONSTANT.EMPTY_DATA,
                                }}
                                frameworkComponents={frameworkComponents}
                            >
                                <AgGridColumn field="CostingHead" headerName="Costing Head" cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                                <AgGridColumn field="Technology"   filter={true} floatingFilter={true}      headerName="Technology"></AgGridColumn>
                                <AgGridColumn field="OperationName" headerName="Operation Name"></AgGridColumn>
                                <AgGridColumn field="OperationCode" headerName="Operation Code"></AgGridColumn>
                                <AgGridColumn field="Plants" headerName="Plant" cellRenderer={'renderPlantFormatter'} ></AgGridColumn>
                                <AgGridColumn field="VendorName" headerName="Vendor Name"></AgGridColumn>
                                <AgGridColumn field="UnitOfMeasurement" headerName="UOM"></AgGridColumn>
                                <AgGridColumn field="Rate" headerName="Rate"></AgGridColumn>
                                <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={'effectiveDateFormatter'}></AgGridColumn>
                                {!this.props.isSimulation && <AgGridColumn field="OperationId" width={120} headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}
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
    const { loading, filterOperation, operationList } = otherOperation;
    const { leftMenuData, initialConfiguration, topAndLeftMenuData } = auth;
    return { loading, filterOperation, leftMenuData, operationList, initialConfiguration, topAndLeftMenuData };
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
    getLeftMenu,
})(reduxForm({
    form: 'OperationListing',
    onSubmitFail: errors => {
        focusOnError(errors);
    },
    enableReinitialize: true,
})(OperationListing));
