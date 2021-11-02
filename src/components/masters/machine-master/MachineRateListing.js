import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { searchableSelect } from "../../layout/FormInputs";
import { EMPTY_DATA } from '../../../config/constants';
import {
    getInitialPlantSelectList, getInitialMachineTypeSelectList, getInitialProcessesSelectList, getInitialVendorWithVendorCodeSelectList, getMachineTypeSelectListByPlant,
    getVendorSelectListByTechnology, getMachineTypeSelectListByTechnology, getMachineTypeSelectListByVendor, getProcessSelectListByMachineType,
} from '../actions/Process';
import { getMachineDataList, deleteMachine, copyMachine, } from '../actions/MachineMaster';
import { getTechnologySelectList, } from '../../../actions/Common';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr';
import BulkUpload from '../../massUpload/BulkUpload';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import { costingHeadObjs, MACHINERATE_DOWNLOAD_EXCEl } from '../../../config/masterData';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import LoaderCustom from '../../common/LoaderCustom';
import moment from 'moment';
import { MachineRate } from '../../../config/constants';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import ReactExport from 'react-export-excel';

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
            isLoader: false
        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        this.props.getTechnologySelectList(() => { })
        this.props.getInitialPlantSelectList(() => { })
        this.props.getInitialVendorWithVendorCodeSelectList(() => { })
        this.props.getInitialMachineTypeSelectList(() => { })
        this.props.getInitialProcessesSelectList(() => { })
        this.getDataList()
    }

    getDataList = (costing_head = '', technology_id = 0, vendor_id = '', machine_type_id = 0, process_id = '', plant_id = '') => {
        const filterData = {
            costing_head: costing_head,
            technology_id: this.props.isSimulation ? this.props.technology : technology_id,
            vendor_id: vendor_id,
            machine_type_id: machine_type_id,
            process_id: process_id,
            plant_id: plant_id,
        }
        this.props.getMachineDataList(filterData, (res) => {
            this.setState({ isLoader: false })
            if (res && res.status === 200) {
                let Data = res.data.DataList;
                this.setState({ tableData: Data })
            } else if (res && res.response && res.response.status === 412) {
                this.setState({ tableData: [] })
            } else {
                this.setState({ tableData: [] })
            }
        })
    }


    /**

    /**
    * @method editItemDetails
    * @description edit material type
    */
    editItemDetails = (Id, rowData) => {
        let data = {
            isEditFlag: true,
            Id: Id,
            IsVendor: rowData.CostingHead,
        }
        this.props.getDetails(data);
    }

    /**
    * @method copyItem
    * @description edit material type
    */
    copyItem = (Id) => {
        this.props.copyMachine(Id, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.COPY_MACHINE_SUCCESS);
                this.getDataList()
            }
        });
    }

    /**
    * @method deleteItem
    * @description confirm delete Raw Material details
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id);
            },
            onCancel: () => { },
            component: () => <ConfirmComponent />,
        };
        return toastr.confirm(`${MESSAGES.MACHINE_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete Raw Material details
    */
    confirmDelete = (ID) => {
        this.props.deleteMachine(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_MACHINE_SUCCESS);
                this.getDataList()
            }
        });
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
                {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cellValue, rowData)} />}
                <button className="Copy All Costing mr-2" title="Copy Machine" type={'button'} onClick={() => this.copyItem(cellValue)} />
                {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
            </>
        )
    };

    /**
    * @method costingHeadFormatter
    * @description Renders Costing head
    */
    costingHeadFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue === 'VBC' ? 'Vendor Based' : 'Zero Based';
    }

    /**
    * @method hyphenFormatter
    */
    hyphenFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? cellValue : '-';
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
        return cellValue != null ? moment(cellValue).format('DD/MM/YYYY') : '';
    }


    renderPlantFormatter = (props) => {
        const row = props?.data;
        return row.IsVendor ? row.DestinationPlant : row.Plants
    }


    bulkToggle = () => {
        this.setState({ isBulkUpload: true })
    }

    closeBulkUploadDrawer = () => {
        this.setState({ isBulkUpload: false }, () => {
            this.getDataList()
        })
    }

    /**
    * @method filterList
    * @description Filter user listing on the basis of role and department
    */


    /**
    * @method resetFilter
    * @description Reset user filter
    */


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
            } else {
                return false
            }
            if (item.EffectiveDate !== null) {
                item.EffectiveDate = moment(item.EffectiveDate).format('DD/MM/YYYY')
            }

            return item
        })

        return (<ExcelSheet data={TempData} name={`${MachineRate}`}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)
            }
        </ExcelSheet>);
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
        const data = this.state.gridApi && this.state.gridApi.getModel().rowsToDisplay
        data && data.map((item => {
            tempArr.push(item.data)
        }))
        return this.returnExcelColumn(MACHINERATE_DOWNLOAD_EXCEl, this.props.machineDatalist)
    };

    onFilterTextBoxChanged(e) {
        this.state.gridApi.setQuickFilter(e.target.value);
    }

    resetState() {
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);
    }

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, AddAccessibility, BulkUploadAccessibility, DownloadAccessibility } = this.props;
        const { isBulkUpload, isLoader } = this.state;

        const defaultColDef = {
            resizable: true,
            filter: true,
            sortable: true,
        };

        const frameworkComponents = {
            totalValueRenderer: this.buttonFormatter,
            effectiveDateRenderer: this.effectiveDateFormatter,
            costingHeadRenderer: this.costingHeadFormatter,
            customLoadingOverlay: LoaderCustom,
            customNoRowsOverlay: NoContentFound,
            hyphenFormatter: this.hyphenFormatter,
            renderPlantFormatter: this.renderPlantFormatter
        };

        return (
            <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>
                {/* {this.props.loading && <Loader />} */}
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                    <Row className={`pt-4 filter-row-large ${this.props.isSimulation ? 'simulation-filter' : ''}`}>


                        <Col md="6" lg="6" className="search-user-block pl-0 mb-3">
                            <div className="d-flex justify-content-end bd-highlight w100">
                                <div>
                                    {this.state.shown ? (
                                        <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => this.setState({ shown: !this.state.shown })}>
                                            <div className="cancel-icon-white"></div></button>
                                    ) : (
                                        <>
                                        </>
                                    )}
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
                <Row>
                    <Col>
                        {isLoader && <LoaderCustom />}

                        <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                            <div className="ag-grid-header">
                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
                            </div>
                            <div
                                className="ag-theme-material"
                            >
                                <AgGridReact
                                    defaultColDef={defaultColDef}
                                    floatingFilter={true}
                                    domLayout='autoHeight'
                                    // columnDefs={c}
                                    rowData={this.props.machineDatalist}
                                    pagination={true}
                                    paginationPageSize={10}
                                    onGridReady={this.onGridReady}
                                    gridOptions={gridOptions}
                                    loadingOverlayComponent={'customLoadingOverlay'}
                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                    noRowsOverlayComponentParams={{
                                        title: EMPTY_DATA,
                                        imagClass: 'imagClass'
                                    }}
                                    frameworkComponents={frameworkComponents}
                                >
                                    <AgGridColumn field="CostingHead" headerName="Costing Head" cellRenderer={'costingHeadRenderer'}></AgGridColumn>
                                    <AgGridColumn field="Technologies" headerName="Technology"></AgGridColumn>
                                    <AgGridColumn field="VendorName" headerName="Vendor Name"></AgGridColumn>
                                    <AgGridColumn field="Plants" headerName="Plant" cellRenderer='renderPlantFormatter'></AgGridColumn>
                                    <AgGridColumn field="MachineNumber" headerName="Machine Number"></AgGridColumn>
                                    <AgGridColumn field="MachineTypeName" headerName="Machine Type"></AgGridColumn>
                                    <AgGridColumn field="MachineTonnage" cellRenderer={'hyphenFormatter'} headerName="Machine Tonnage"></AgGridColumn>
                                    <AgGridColumn field="ProcessName" headerName="Process Name"></AgGridColumn>
                                    <AgGridColumn field="MachineRate" headerName="Machine Rate"></AgGridColumn>
                                    <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={'effectiveDateRenderer'}></AgGridColumn>
                                    {!this.props.isSimulation && <AgGridColumn field="MachineId" width={160} headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}
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

                    </Col>
                </Row>
                {isBulkUpload && <BulkUpload
                    isOpen={isBulkUpload}
                    closeDrawer={this.closeBulkUploadDrawer}
                    isEditFlag={false}
                    fileName={'Machine'}
                    isZBCVBCTemplate={true}
                    isMachineMoreTemplate={true}
                    messageLabel={'Machine'}
                    anchor={'right'}
                />}
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
    getInitialPlantSelectList,
    getInitialVendorWithVendorCodeSelectList,
    getInitialMachineTypeSelectList,
    getInitialProcessesSelectList,
    getMachineDataList,
    deleteMachine,
    copyMachine,
    getMachineTypeSelectListByPlant,
    getVendorSelectListByTechnology,
    getMachineTypeSelectListByTechnology,
    getMachineTypeSelectListByVendor,
    getProcessSelectListByMachineType,
})(reduxForm({
    form: 'MachineRateListing',
    enableReinitialize: true,
})(MachineRateListing));