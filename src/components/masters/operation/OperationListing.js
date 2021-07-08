import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import $ from "jquery";
import { focusOnError, searchableSelect } from "../../layout/FormInputs";
import { checkForDecimalAndNull, required } from "../../../helper/validation";
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import {
    getOperationsDataList, deleteOperationAPI, getOperationSelectList, getVendorWithVendorCodeSelectList, getTechnologySelectList,
    getVendorListByTechnology, getOperationListByTechnology, getTechnologyListByOperation, getVendorListByOperation,
    getTechnologyListByVendor, getOperationListByVendor,
} from '../actions/OtherOperation';
import Switch from "react-switch";
import AddOperation from './AddOperation';
import BulkUpload from '../../massUpload/BulkUpload';
import { OPERATION, OperationMaster } from '../../../config/constants';
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

        let ModuleId = reactLocalStorage.get('ModuleId');
        this.props.getLeftMenu(ModuleId, loggedInUserId(), (res) => {
            const { leftMenuData } = this.props;
            if (leftMenuData !== undefined) {
                let Data = leftMenuData;
                const accessData = Data && Data.find(el => el.PageName === OPERATION)
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
        })

        this.props.getTechnologySelectList(() => { })
        this.props.getOperationSelectList(() => { })
        this.props.getVendorWithVendorCodeSelectList()
        this.getTableListData(null, null, null, null)
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
            technology_id: technology_id,
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
    editItemDetails = (Id) => {
        this.setState({
            data: { isEditFlag: true, ID: Id },
            toggleForm: true,
        })
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
    buttonFormatter = (cell, row, enumObject, rowIndex) => {
        const { EditAccessibility, DeleteAccessibility } = this.state;
        return (
            <>
                {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cell)} />}
                {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cell)} />}
            </>
        )
    }

    handleChange = (cell, row, enumObject, rowIndex) => {
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
        console.log(props, 'propspropsprops')

        // const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        // const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        // return (
        //     <>
        //         <label htmlFor="normal-switch">
        //             {/* <span>Switch with default style</span> */}
        //             <Switch
        //                 onChange={() => this.handleChange(cell, row, enumObject, rowIndex)}
        //                 checked={cell}
        //                 background="#ff6600"
        //                 onColor="#4DC771"
        //                 onHandleColor="#ffffff"
        //                 offColor="#FC5774"
        //                 id="normal-switch"
        //                 height={24}
        //             />
        //         </label>
        //     </>
        // )
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

    renderSerialNumber = () => {
        return <>Sr. <br />No. </>
    }

    renderCostingHead = () => {
        return <>Costing <br />Head </>
    }
    renderOperationName = () => {
        return <>Operation <br />Name </>
    }
    renderOperationCode = () => {
        return <>Operation <br />Code </>
    }
    renderVendorName = () => {
        return <>Vendor <br />Name </>
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

    onExportToCSV = (row) => {
        // ...
        return this.state.userData; // must return the data which you want to be exported
    }

    renderPaginationShowsTotal(start, to, total) {
        return <GridTotalFormate start={start} to={to} total={total} />
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
        this.setState({ toggleForm: true })
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
        params.api.paginationGoToPage(1);
    };

    onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        this.state.gridApi.paginationSetPageSize(Number(value));
    };

    onBtExport = () => {
        let tempArr = []
        const data = this.state.gridApi && this.state.gridApi.getModel().rowsToDisplay
        data && data.map((item => {
            tempArr.push(item.data)
        }))

        return this.returnExcelColumn(OPERATION_DOWNLOAD_EXCEl, tempArr)
    };

    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        TempData.map((item) => {
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
            } else {
                return false
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
        const options = {
            clearSearch: true,
            noDataText: (this.props.operationList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
            //exportCSVText: 'Download Excel',
            //onExportToCSV: this.onExportToCSV,
            // exportCSVBtn: this.createCustomExportCSVButton,
            // onExportToCSV: this.handleExportCSVButtonClick,
            //paginationShowsTotal: true,
            paginationShowsTotal: this.renderPaginationShowsTotal,
            prePage: <span className="prev-page-pg"></span>, // Previous page button text
            nextPage: <span className="next-page-pg"></span>, // Next page button text
            firstPage: <span className="first-page-pg"></span>, // First page button text
            lastPage: <span className="last-page-pg"></span>,

        };

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
            <>
                {/* {this.props.loading && <Loader />} */}
                <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>
                    <form>
                        <Row>
                            <Col md="12"><h1 className="mb-0">Operation Master</h1></Col>
                        </Row>
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
                                            <button type="button" className="user-btn mr5" onClick={() => this.setState({ shown: !this.state.shown })}>Show Filter</button>
                                        }
                                        {BulkUploadAccessibility && (
                                            <button
                                                type="button"
                                                className={"user-btn mr5"}
                                                onClick={this.bulkToggle}
                                            >
                                                <div className={"upload"}></div>Bulk Upload
                                            </button>
                                        )}
                                        {AddAccessibility && (
                                            <button
                                                type="button"
                                                className={"user-btn mr5"}
                                                onClick={this.formToggle}
                                            >
                                                <div className={"plus"}></div>ADD
                                            </button>
                                        )}
                                        {
                                            DownloadAccessibility &&
                                            <>
                                                <ExcelFile filename={OperationMaster} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div>DOWNLOAD</button>}>
                                                    {this.onBtExport()}
                                                </ExcelFile>
                                            </>
                                            //   <button type="button" className={"user-btn mr5"} onClick={this.onBtExport}><div className={"download"} ></div>Download</button>
                                        }

                                        <button type="button" className="user-btn refresh-icon" onClick={() => this.resetState()}></button>

                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </form>
                    {/* <BootstrapTable
                        data={this.props.operationList}
                        striped={false}
                        hover={false}
                        bordered={false}
                        options={options}
                        search
                        // exportCSV={DownloadAccessibility}
                        // csvFileName={`${OperationMaster}.csv`}
                        //ignoreSinglePage
                        ref={'table'}
                        trClassName={'userlisting-row'}
                        tableHeaderClass='my-custom-header'
                        pagination> */}
                    {/* <TableHeaderColumn dataField="" width={50} dataAlign="center" dataFormat={this.indexFormatter}>{this.renderSerialNumber()}</TableHeaderColumn> */}
                    {/* <TableHeaderColumn searchable={false} dataField="CostingHead" columnTitle={true} dataAlign="left" dataSort={true} dataFormat={this.costingHeadFormatter}>{this.renderCostingHead()}</TableHeaderColumn>
                        <TableHeaderColumn searchable={false} dataField="Technology" width={150} columnTitle={true} dataAlign="left" >{'Technology'}</TableHeaderColumn>
                        <TableHeaderColumn dataField="OperationName" columnTitle={true} dataAlign="left" >{this.renderOperationName()}</TableHeaderColumn>
                        <TableHeaderColumn searchable={false} dataField="OperationCode" columnTitle={true} dataAlign="left" >{this.renderOperationCode()}</TableHeaderColumn>
                        <TableHeaderColumn dataField="Plants" width={150} columnTitle={true} dataAlign="left" dataFormat={this.renderPlantFormatter} >{'Plant'}</TableHeaderColumn>
                        <TableHeaderColumn dataField="VendorName" columnTitle={true} dataAlign="left" >{this.renderVendorName()}</TableHeaderColumn>
                        <TableHeaderColumn searchable={false} dataField="UnitOfMeasurement" columnTitle={true} dataAlign="left" >{'UOM'}</TableHeaderColumn>
                        <TableHeaderColumn searchable={false} dataField="Rate" width={100} columnTitle={true} dataAlign="left" >{'Rate'}</TableHeaderColumn>
                        <TableHeaderColumn searchable={false} dataField="EffectiveDate" width={120} columnTitle={true} dataFormat={this.effectiveDateFormatter} dataAlign="left" >{'Effective Date'}</TableHeaderColumn> */}
                    {/* <TableHeaderColumn dataField="IsActive" width={100} columnTitle={true} dataAlign="center" dataFormat={this.statusButtonFormatter}>{'Status'}</TableHeaderColumn> */}
                    {/* <TableHeaderColumn dataAlign="right" searchable={false} className="action" width={110} dataField="OperationId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
                    </BootstrapTable> */}

                    <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                        <div className="ag-grid-header">
                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Filter..." onChange={(e) => this.onFilterTextBoxChanged(e)} />
                        </div>
                        <div
                            className="ag-theme-material"
                            style={{ height: '100%', width: '100%' }}
                        >
                            <AgGridReact
                                defaultColDef={defaultColDef}
                                // columnDefs={c}
                                rowData={this.props.operationList}
                                pagination={true}
                                paginationPageSize={10}
                                onGridReady={this.onGridReady}
                                gridOptions={gridOptions}
                                loadingOverlayComponent={'customLoadingOverlay'}
                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                noRowsOverlayComponentParams={{
                                    title: CONSTANT.EMPTY_DATA,
                                }}
                                frameworkComponents={frameworkComponents}
                            >
                                <AgGridColumn field="CostingHead" headerName="Costing Head" cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                                <AgGridColumn field="Technology" headerName="Technology"></AgGridColumn>
                                <AgGridColumn field="OperationName" headerName="Operation Name"></AgGridColumn>
                                <AgGridColumn field="OperationCode" headerName="Operation Code"></AgGridColumn>
                                <AgGridColumn field="Plants" headerName="Plant" cellRenderer={'renderPlantFormatter'} ></AgGridColumn>
                                <AgGridColumn field="VendorName" headerName="Vendor Name"></AgGridColumn>
                                <AgGridColumn field="UnitOfMeasurement" headerName="UOM"></AgGridColumn>
                                <AgGridColumn field="Rate" headerName="Rate"></AgGridColumn>
                                <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={'effectiveDateFormatter'} ></AgGridColumn>
                                <AgGridColumn field="IsActive" headerName="Status"
                                // cellRenderer={'statusButtonFormatter'} 
                                ></AgGridColumn>
                                <AgGridColumn field="OperationId" headerName="Action" cellRenderer={'totalValueRenderer'}></AgGridColumn>
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
            </ >
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
    const { leftMenuData, initialConfiguration } = auth;
    return { loading, filterOperation, leftMenuData, operationList, initialConfiguration };
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
