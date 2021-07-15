import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { focusOnError, searchableSelect } from "../../layout/FormInputs";
import { required } from "../../../helper/validation";
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { CONSTANT } from '../../../helper/AllConastant';
import $ from 'jquery';
import NoContentFound from '../../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import {
    getSupplierDataList, activeInactiveVendorStatus, deleteSupplierAPI,
    getVendorTypesSelectList, getVendorsByVendorTypeID, getAllVendorSelectList,
    getVendorTypeByVendorSelectList
} from '../actions/Supplier';
import { fetchCountryDataAPI, } from '../../../actions/Common';
import Switch from "react-switch";
import BulkUpload from '../../massUpload/BulkUpload';
import AddVendorDrawer from './AddVendorDrawer';
import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { VENDOR, VendorMaster } from '../../../config/constants';
import { loggedInUserId } from '../../../helper';
import { getLeftMenu, } from '../../../actions/auth/AuthActions';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import LoaderCustom from '../../common/LoaderCustom';
import ReactExport from 'react-export-excel';
import { VENDOR_DOWNLOAD_EXCEl } from '../../../config/masterData';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

function enumFormatter(cell, row, enumObject) {
    return enumObject[cell];
}

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
            sideBar: { toolPanels: ['columns'] },
            showData: false

        }
    }

    /**
    * @method componentWillMount
    * @description called before render the component
    */
    UNSAFE_componentWillMount() {
        this.props.getVendorTypesSelectList()
        this.props.getAllVendorSelectList()
        this.props.fetchCountryDataAPI(() => { })
    }

    componentDidMount() {
        this.getTableListData(null, null, null)

        let ModuleId = reactLocalStorage.get('ModuleId');
        this.props.getLeftMenu(ModuleId, loggedInUserId(), (res) => {
            const { leftMenuData } = this.props;
            if (leftMenuData !== undefined) {
                let Data = leftMenuData;
                const accessData = Data && Data.find(el => el.PageName === VENDOR)
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
        })
        //this.props.onRef(this)
    }

    // Get updated Supplier's list after any action performed.
    getUpdatedData = () => {
        this.getTableListData(null, null, null)
    }

    /**
    * @method getTableListData
    * @description GET VENDOR DATA LIST
    */
    getTableListData = (vendorType = null, vendorName = null, country = null) => {
        let filterData = {
            vendor_type: vendorType,
            vendor_name: vendorName,
            country: country,
        }
        this.props.getSupplierDataList(filterData, res => {
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
        const { countryList, vendorTypeList, vendorSelectList } = this.props;

        const temp = [];
        if (label === 'country') {
            countryList && countryList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'vendorType') {
            vendorTypeList && vendorTypeList.map((item, i) => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'vendorList') {
            vendorSelectList && vendorSelectList.map(item => {
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
            isOpenVendor: true,
            isEditFlag: true,
            ID: Id,
        })
    }

    /**
    * @method deleteItem
    * @description confirm delete Item.
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeleteItem(Id);
            },
            onCancel: () => { },
            component: () => <ConfirmComponent />,
        };
        return toastr.confirm(`Are you sure you want to delete this Vendor?`, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteItem
    * @description confirm delete item
    */
    confirmDeleteItem = (ID) => {
        this.props.deleteSupplierAPI(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_SUPPLIER_SUCCESS);
                this.filterList()
                //this.getTableListData(null, null, null)
            }
        });
    }

    /**
  * @method buttonFormatter
  * @description Renders buttons
  */
    buttonFormatter = (props) => {
        const cellValue = props?.value;
        const rowData = props?.data;

        const { EditAccessibility, DeleteAccessibility } = this.state;
        return (
            <>
                {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cellValue, rowData)} />}
                {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
            </>
        )
    };

    /**
    * @method hyphenFormatter
    */
    hyphenFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != 'NA' ? cellValue : '-';
    }

    handleChange = (cell, row) => {
        let data = {
            Id: row.VendorId,
            ModifiedBy: loggedInUserId(),
            IsActive: !cell, //Status of the user.
        }
        this.props.activeInactiveVendorStatus(data, res => {
            if (res && res.data && res.data.Result) {
                if (cell == true) {
                    toastr.success(MESSAGES.VENDOR_INACTIVE_SUCCESSFULLY)
                } else {
                    toastr.success(MESSAGES.VENDOR_ACTIVE_SUCCESSFULLY)
                }
                //this.getTableListData(null, null, null)
                this.filterList()
            }
        })
    }

    /**
    * @method handleVendorType
    * @description Used to handle vendor type
    */
    handleVendorType = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ vendorType: newValue, }, () => {
                const { vendorType } = this.state;
                this.props.getVendorsByVendorTypeID(vendorType.value, (res) => { })
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
        if (ActivateAccessibility) {
            return (
                <>
                    <label htmlFor="normal-switch">
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
        } else {
            return (
                <>
                    {
                        cellValue ?
                            <div className={'Activated'}> {'Active'}</div>
                            :
                            <div className={'Deactivated'}>{'Deactive'}</div>
                    }
                </>
            )
        }
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

    bulkToggle = () => {
        $("html,body").animate({ scrollTop: 0 }, "slow");
        this.setState({ isBulkUpload: true })
    }

    closeBulkUploadDrawer = () => {
        this.setState({ isBulkUpload: false }, () => {
            this.getTableListData(null, null, null)
        })
    }

    /**
    * @method filterList
    * @description Filter user listing on the basis of role and department
    */
    filterList = () => {
        const { vendorType, vendorName, country } = this.state;
        const vType = vendorType && vendorType != null ? vendorType.value : null;
        const vName = vendorName && vendorName != null ? vendorName.value : null;
        const Country = country && country != null ? country.value : null;
        this.getTableListData(vType, vName, Country)
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
            this.props.getVendorTypesSelectList()
            this.props.getAllVendorSelectList()
            this.getTableListData(null, null, null)
        })
    }

    formToggle = () => {
        $('html, body').animate({ scrollTop: 0 }, 'slow');
        this.setState({ isOpenVendor: true })
    }

    closeVendorDrawer = (e = '') => {
        this.setState({
            isOpenVendor: false,
            isEditFlag: false,
            ID: '',
        }, () => {
            this.filterList()
            // this.getTableListData(null, null, null)
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
        this.gridApi.sizeColumnsToFit();
        this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
        params.api.paginationGoToPage(0);
    };

    onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        this.state.gridApi.paginationSetPageSize(Number(value));
    };

    onBtExport = () => {
        let tempArr = []
        const data = this.state.gridApi && this.state.gridApi.getModel().rowsToDisplay
        console.log(this.state.gridApi, 'this.state.gridApithis.state.gridApi')
        data && data.map((item => {
            tempArr.push(item.data)
        }))

        return this.returnExcelColumn(VENDOR_DOWNLOAD_EXCEl, tempArr)
    };

    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        TempData.map((item) => {
            if (item.Country == 'NA') {
                item.Country = ' '
            } else if (item.State == 'NA') {
                item.State = ' '
            } else if (item.City == 'NA') {
                item.City = ' '
            } else {
                return false
            }
            return item
        })
        return (

            <ExcelSheet data={TempData} name={VendorMaster}>
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
        const { isOpenVendor, isEditFlag, isBulkUpload, AddAccessibility, BulkUploadAccessibility, DownloadAccessibility } = this.state;

        const options = {
            clearSearch: true,
            noDataText: (this.props.supplierDataList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
            //exportCSVText: 'Download Excel',
            exportCSVBtn: this.createCustomExportCSVButton,
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
            indexFormatter: this.indexFormatter,
            statusButtonFormatter: this.statusButtonFormatter,
            hyphenFormatter: this.hyphenFormatter
        };

        return (
            <div className={`ag-grid-react container-fluid blue-before-inside ${DownloadAccessibility ? "show-table-btn" : ""}`}>
                {/* {this.props.loading && <Loader />} */}
                <form
                    onSubmit={handleSubmit(this.onSubmit.bind(this))}
                    noValidate
                >
                    <Row>
                        <Col md="12">
                            <h1 className="mb-0">Vendor Master</h1>
                        </Col>
                    </Row>
                    <Row className="pt-4 px-15 blue-before">
                        {this.state.shown && (
                            <Col md="12" lg="8" className="filter-block">
                                <div className="d-inline-flex justify-content-start align-items-top w100">
                                    <div className="flex-fills">
                                        <h5>{`Filter By:`}</h5>
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="VendorType"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={"Vendor Type"}
                                            options={this.renderListing("vendorType")}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            validate={
                                                this.state.vendorType == null ||
                                                    this.state.vendorType.length === 0
                                                    ? [required]
                                                    : []
                                            }
                                            required={true}
                                            handleChangeDescription={this.handleVendorType}
                                            valueDescription={this.state.vendorType}
                                            disabled={this.state.isEditFlag ? true : false}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="Vendors"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={"Vendor Name"}
                                            options={this.renderListing("vendorList")}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            validate={
                                                this.state.vendorName == null ||
                                                    this.state.vendorName.length === 0
                                                    ? [required]
                                                    : []
                                            }
                                            required={true}
                                            handleChangeDescription={this.handleVendorName}
                                            valueDescription={this.state.vendorName}
                                            disabled={this.state.isEditFlag ? true : false}
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
                                            className="user-btn mr5"
                                        >
                                            {"Apply"}
                                        </button>
                                    </div>
                                </div>
                            </Col>
                        )}
                        <Col md="6" lg="6" className="search-user-block mb-3">
                            <div className="d-flex justify-content-end bd-highlight w100">
                                <div>
                                    {this.state.shown ? (
                                        <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => this.setState({ shown: !this.state.shown })}>
                                            <div className="cancel-icon-white"></div></button>
                                    ) : (
                                        <button title="Filter" type="button" className="user-btn mr5" onClick={() => this.setState({ shown: !this.state.shown })}>
                                                    <div className="filter mr-0"></div>
                                                </button>
                                            )}
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

                                                    <ExcelFile filename={'RM Domestic'} fileExtension={'.xls'} element={
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
                {/* <BootstrapTable
                    data={this.props.supplierDataList}
                    striped={false}
                    hover={false}
                    bordered={false}
                    options={options}
                    search
                    exportCSV={DownloadAccessibility}
                    csvFileName={`${VendorMaster}.csv`}
                    //ignoreSinglePage
                    ref={"table"}
                    trClassName={"userlisting-row"}
                    tableHeaderClass="my-custom-header"
                    pagination
                >
                    <TableHeaderColumn dataField="VendorType" dataAlign="left" dataSort={true} >Vendor Type</TableHeaderColumn>
                    <TableHeaderColumn dataField="VendorName" dataAlign="left" dataSort={true}>Vendor Name</TableHeaderColumn>
                    <TableHeaderColumn dataField="VendorCode" dataAlign="left" dataSort={true}> Vendor Code </TableHeaderColumn>
                    <TableHeaderColumn dataField="Country" dataAlign="left" dataSort={true}>Country</TableHeaderColumn>
                    <TableHeaderColumn dataField="State" dataAlign="left" dataSort={true}> State </TableHeaderColumn>
                    <TableHeaderColumn dataField="City" dataAlign="left" dataSort={true}>City</TableHeaderColumn>
                    <TableHeaderColumn dataField="IsActive" export={false} dataFormat={this.statusButtonFormatter}>Status</TableHeaderColumn>
                    <TableHeaderColumn dataAlign="right" className="action" dataField="VendorId" export={false} isKey={true} dataFormat={this.buttonFormatter}> Actions </TableHeaderColumn>
                </BootstrapTable> */}

                <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                    <div className="ag-grid-header">
                        <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
                    </div>
                    <div
                        className="ag-theme-material"
                        style={{ height: '100%', width: '100%' }}
                    >
                        <AgGridReact
                            defaultColDef={defaultColDef}
                            // columnDefs={c}
                            rowData={this.props.supplierDataList}
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
                            <AgGridColumn field="VendorType" headerName="Vendor Type"></AgGridColumn>
                            <AgGridColumn field="VendorName" headerName="Vendor Name"></AgGridColumn>
                            <AgGridColumn field="VendorCode" headerName="Vendor Code"></AgGridColumn>
                            <AgGridColumn field="Country" headerName="Country" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                            <AgGridColumn field="State" headerName="State" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                            <AgGridColumn field="City" headerName="City" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                            <AgGridColumn field="IsActive" headerName="Status" cellRenderer={'statusButtonFormatter'}></AgGridColumn>
                            <AgGridColumn field="VendorId" headerName="Actions" cellRenderer={'totalValueRenderer'}></AgGridColumn>
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


                {isBulkUpload && (
                    <BulkUpload
                        isOpen={isBulkUpload}
                        closeDrawer={this.closeBulkUploadDrawer}
                        isEditFlag={false}
                        isZBCVBCTemplate={false}
                        fileName={"Vendor"}
                        messageLabel={"Vendor"}
                        anchor={"right"}
                    />
                )}
                {isOpenVendor && (
                    <AddVendorDrawer
                        isOpen={isOpenVendor}
                        closeDrawer={this.closeVendorDrawer}
                        isEditFlag={isEditFlag}
                        isRM={false}
                        ID={this.state.ID}
                        anchor={"right"}
                    />
                )}
            </div>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ comman, supplier, auth, }) {
    const { loading, vendorTypeList, vendorSelectList, vendorTypeByVendorSelectList, supplierDataList } = supplier;
    const { countryList } = comman;
    const { leftMenuData } = auth;

    return { loading, vendorTypeList, countryList, leftMenuData, vendorSelectList, vendorTypeByVendorSelectList, supplierDataList };
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
    getVendorTypesSelectList,
    fetchCountryDataAPI,
    getVendorsByVendorTypeID,
    getLeftMenu,
    getAllVendorSelectList,
    getVendorTypeByVendorSelectList
})(reduxForm({
    form: 'VendorListing',
    onSubmitFail: errors => {
        focusOnError(errors);
    },
    enableReinitialize: true,
})(VendorListing));
