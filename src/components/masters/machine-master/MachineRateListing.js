import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { searchableSelect } from "../../layout/FormInputs";
import { CONSTANT } from '../../../helper/AllConastant';
import {
    getInitialPlantSelectList, getInitialMachineTypeSelectList, getInitialProcessesSelectList, getInitialVendorWithVendorCodeSelectList, getMachineTypeSelectListByPlant,
    getVendorSelectListByTechnology, getMachineTypeSelectListByTechnology, getMachineTypeSelectListByVendor, getProcessSelectListByMachineType,
} from '../actions/Process';
import { getMachineDataList, deleteMachine, copyMachine, } from '../actions/MachineMaster';
import { getTechnologySelectList, } from '../../../actions/Common';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
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
            technology_id: technology_id,
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
    * @method renderListing
    * @description Used to show type of listing
    */
    renderListing = (label) => {
        const { technologySelectList, filterSelectList } = this.props;
        const temp = [];

        if (label === 'costingHead') {
            return costingHeadObjs;
        }

        if (label === 'plant') {
            filterSelectList && filterSelectList.plants && filterSelectList.plants.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }

        if (label === 'technology') {
            technologySelectList && technologySelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }

        if (label === 'VendorNameList') {
            filterSelectList && filterSelectList.vendor && filterSelectList.vendor.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }

        if (label === 'ProcessNameList') {
            filterSelectList && filterSelectList.processList && filterSelectList.processList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }

        if (label === 'MachineTypeList') {
            filterSelectList && filterSelectList.machineTypes && filterSelectList.machineTypes.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
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
    * @method handlePlant
    * @description  PLANT FILTER
    */
    handlePlant = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ plant: newValue }, () => {
                const { plant } = this.state;
                this.props.getMachineTypeSelectListByPlant(plant.value, () => { })
            });
        } else {
            this.setState({ plant: [], });
        }
    }

    /**
    * @method handleTechnology
    * @description called
    */
    handleTechnology = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ technology: newValue, }, () => {
                const { technology } = this.state;
                this.props.getVendorSelectListByTechnology(technology.value, () => { })
                this.props.getMachineTypeSelectListByTechnology(technology.value, () => { })
            });
        } else {
            this.setState({ technology: [], })
        }
    };

    /**
    * @method handleVendorName
    * @description called
    */
    handleVendorName = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ vendorName: newValue, }, () => {
                const { vendorName } = this.state;
                this.props.getMachineTypeSelectListByVendor(vendorName.value, () => { })
            });
        } else {
            this.setState({ vendorName: [], })
        }
    };

    /**
    * @method handleProcessName
    * @description called
    */
    handleProcessName = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ processName: newValue });
        } else {
            this.setState({ processName: [] })
        }
    };

    /**
    * @method handleMachineType
    * @description called
    */
    handleMachineType = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ machineType: newValue }, () => {
                const { machineType } = this.state;
                this.props.getProcessSelectListByMachineType(machineType.value, () => { })
            });
        } else {
            this.setState({ machineType: [], })
        }
    };

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
        console.log(props?.value, 'props?.valueprops?.valueprops?.value')
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue ? 'Vendor Based' : 'Zero Based';
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

    renderSerialNumber = () => {
        return <>Sr. <br />No. </>
    }

    renderCostingHead = () => {
        return <>Costing <br />Head </>
    }

    renderVendorName = () => {
        return <>Vendor <br />Name </>
    }
    renderMachineNo = () => {
        return <>Machine<br /> Number </>
    }

    renderMachineType = () => {
        return <>Machine<br /> Type </>
    }

    renderMachineTonage = () => {
        return <>Machine<br /> Tonnage </>
    }

    renderProcessName = () => {
        return <>Process<br /> Name </>
    }

    renderMachineRate = () => {
        return <>Machine<br /> Rate </>
    }

    renderPlantFormatter = (cell, row, enumObject, rowIndex) => {
        return row.IsVendor ? row.DestinationPlant : row.Plants
    }

    renderEffectiveDate = () => {
        return <>Effective <br />Date</>
    }

    /**
  * @method effectiveDateFormatter
  * @description Renders buttons
  */
    effectiveDateFormatter = (cell, row, enumObject, rowIndex) => {
        return cell != null ? moment(cell).format('DD/MM/YYYY') : '';
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
    filterList = () => {
        const { costingHead, plant, technology, vendorName, processName, machineType } = this.state;
        this.setState({ isLoader: true })

        const costingId = costingHead ? costingHead.value : '';
        const technologyId = technology ? technology.value : 0;
        const vendorId = vendorName ? vendorName.value : '';
        const machineTypeId = machineType ? machineType.value : 0;
        const processId = processName ? processName.value : '';
        const plantId = plant ? plant.value : '';


        this.getDataList(costingId, technologyId, vendorId, machineTypeId, processId, plantId)
    }

    /**
    * @method resetFilter
    * @description Reset user filter
    */
    resetFilter = () => {
        this.setState({
            costingHead: [],
            plant: [],
            technology: [],
            vendorName: [],
            processName: [],
            machineType: [],
            isLoader: true
        }, () => {
            this.props.getTechnologySelectList(() => { })
            this.props.getInitialPlantSelectList(() => { })
            this.props.getInitialVendorWithVendorCodeSelectList(() => { })
            this.props.getInitialMachineTypeSelectList(() => { })
            this.props.getInitialProcessesSelectList(() => { })
            this.getDataList()
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

    // returnExcelColumn = (data = [], TempData) => {
    //     const ExcelFile = ReactExport.ExcelFile;
    //     const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
    //     const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
    //     let temp = []
    //     temp = TempData.map((item) => {
    //         if (item.ClientName === null) {
    //             item.ClientName = ' '
    //         }
    //         return item
    //     })

    //     return (<ExcelSheet data={temp} name={`${MachineRate}`}>
    //         {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)
    //         }
    //     </ExcelSheet>);
    // }
    // renderColumn = (fileName) => {
    //     let arr = this.props.machineDatalist && this.props.machineDatalist.length > 0 ? this.props.machineDatalist : []
    //     if (arr != []) {
    //         arr && arr.map(item => {
    //             let len = Object.keys(item).length
    //             for (let i = 0; i < len; i++) {
    //                 // let s = Object.keys(item)[i]
    //                 if (item.MachineTonnage === null) {
    //                     item.MachineTonnage = ' '
    //                 } else if (item.EffectiveDate === null) {
    //                     item.EffectiveDate = ' '
    //                 } else if (item.IsVendor === true) {
    //                     item.IsVendor = 'VBC'
    //                 } else if (item.IsVendor === false) {
    //                     item.IsVendor = 'ZBC'
    //                 } else if (item.Plants === '-') {
    //                     item.Plants = ' '
    //                 } else if (item.MachineTypeName === '-') {
    //                     item.MachineTypeName = ' '
    //                 } else if (item.VendorName === '-') {
    //                     item.VendorName = ' '
    //                 } else {
    //                     return false
    //                 }
    //             }
    //         })
    //     }
    //     return this.returnExcelColumn(MACHINERATE_DOWNLOAD_EXCEl, arr)
    // }


    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData.map((item) => {
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
        return this.returnExcelColumn(MACHINERATE_DOWNLOAD_EXCEl, tempArr)
    };

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
        const { handleSubmit, AddAccessibility, BulkUploadAccessibility, DownloadAccessibility } = this.props;
        const { isBulkUpload, isLoader } = this.state;
        const options = {
            clearSearch: true,
            noDataText: (this.props.machineDatalist === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
            paginationShowsTotal: this.renderPaginationShowsTotal,
            exportCSVBtn: this.createCustomExportCSVButton,
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
            effectiveDateRenderer: this.effectiveDateFormatter,
            costingHeadRenderer: this.costingHeadFormatter,
            customLoadingOverlay: LoaderCustom,
            customNoRowsOverlay: NoContentFound,
            hyphenFormatter: this.hyphenFormatter
        };

        return (
            <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>
                {/* {this.props.loading && <Loader />} */}
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                    <Row className="pt-4 filter-row-large">
                        {this.state.shown && (
                            <Col md="12" lg="11" className="filter-block machine-rate-filter">
                                <div className="d-inline-flex justify-content-start align-items-top w100">
                                    <div className="flex-fills"><h5>{`Filter By:`}</h5></div>
                                    <div className="flex-fill">
                                        <Field
                                            name="costingHead"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={'Costing Head'}
                                            isClearable={false}
                                            options={this.renderListing('costingHead')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            //validate={(this.state.costingHead == null || this.state.costingHead.length == 0) ? [required] : []}
                                            //required={true}
                                            handleChangeDescription={this.handleHeadChange}
                                            valueDescription={this.state.costingHead}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="plant"
                                            type="text"
                                            label={''}
                                            component={searchableSelect}
                                            placeholder={'Plant'}
                                            isClearable={false}
                                            options={this.renderListing('plant')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            //validate={(this.state.plant == null || this.state.plant.length == 0) ? [required] : []}
                                            //required={true}
                                            handleChangeDescription={this.handlePlant}
                                            valueDescription={this.state.plant}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="technology"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={'Technology'}
                                            isClearable={false}
                                            options={this.renderListing('technology')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            //validate={(this.state.technology == null || this.state.technology.length == 0) ? [required] : []}
                                            //required={true}
                                            handleChangeDescription={this.handleTechnology}
                                            valueDescription={this.state.technology}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="VendorName"
                                            type="text"
                                            label={''}
                                            component={searchableSelect}
                                            placeholder={'Vendor'}
                                            isClearable={false}
                                            options={this.renderListing('VendorNameList')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            //validate={(this.state.vendorName == null || this.state.vendorName.length == 0) ? [required] : []}
                                            //required={true}
                                            handleChangeDescription={this.handleVendorName}
                                            valueDescription={this.state.vendorName}
                                            disabled={false}
                                            className="fullinput-icon"
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="MachineType"
                                            type="text"
                                            label=''
                                            component={searchableSelect}
                                            placeholder={'Machine'}
                                            isClearable={false}
                                            options={this.renderListing('MachineTypeList')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            //validate={(this.state.machineType == null || this.state.machineType.length == 0) ? [required] : []}
                                            //required={true}
                                            handleChangeDescription={this.handleMachineType}
                                            valueDescription={this.state.machineType}
                                            disabled={false}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="ProcessName"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={'Process'}
                                            isClearable={false}
                                            options={this.renderListing('ProcessNameList')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            //validate={(this.state.processName == null || this.state.processName.length == 0) ? [required] : []}
                                            //required={true}
                                            handleChangeDescription={this.handleProcessName}
                                            valueDescription={this.state.processName}
                                            disabled={false}
                                        />
                                    </div>
                                    <div className="flex-fill w-180">
                                        <button
                                            type="button"
                                            //disabled={pristine || submitting}
                                            onClick={this.resetFilter}
                                            className="reset mr10"
                                        >
                                            {'Reset'}
                                        </button>

                                        <button
                                            type="button"
                                            //disabled={pristine || submitting}
                                            onClick={this.filterList}
                                            className="user-btn"
                                        >
                                            {'Apply'}
                                        </button>
                                    </div>
                                </div>
                            </Col>
                        )}
                        <Col md="6" lg="6" className="search-user-block pl-0 mb-3">
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
                        {/* <BootstrapTable
                            data={this.props.machineDatalist}
                            striped={false}
                            hover={false}
                            bordered={false}
                            options={options}
                            search
                            exportCSV={DownloadAccessibility}
                            csvFileName={`${MachineRate}.csv`}
                            //ignoreSinglePage
                            ref={'table'}
                            pagination>
                            <TableHeaderColumn dataField="IsVendor" searchable={false} width={100} columnTitle={true} dataAlign="left" dataSort={true} dataFormat={this.costingHeadFormatter}>{this.renderCostingHead()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="Technologies" searchable={false} width={100} columnTitle={true} dataAlign="left" dataSort={true} >{'Technology'}</TableHeaderColumn>
                            <TableHeaderColumn dataField="VendorName" width={100} columnTitle={true} dataAlign="left" dataSort={true} >{this.renderVendorName()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="Plants" searchable={false} width={100} columnTitle={true} dataAlign="left" dataSort={true} dataFormat={this.renderPlantFormatter} >{'Plant'}</TableHeaderColumn>
                            <TableHeaderColumn dataField="MachineNumber" searchable={true} width={120} columnTitle={true} dataAlign="left" dataSort={true} >{this.renderMachineNo()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="MachineTypeName" width={110} columnTitle={true} dataAlign="left" dataSort={true} >{this.renderMachineType()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="MachineTonnage" searchable={false} width={100} columnTitle={true} dataAlign="left" dataSort={true} >{this.renderMachineTonage()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="ProcessName" width={90} columnTitle={true} dataAlign="left" dataSort={true} >{this.renderProcessName()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="MachineRate" searchable={false} width={80} columnTitle={true} dataAlign="left" dataSort={true} >{this.renderMachineRate()}</TableHeaderColumn>
                            <TableHeaderColumn dataField="EffectiveDate" searchable={false} width={80} columnTitle={true} dataAlign="left" dataFormat={this.effectiveDateFormatter} >{this.renderEffectiveDate()}</TableHeaderColumn>
                            <TableHeaderColumn dataAlign="right" width={140} dataField="MachineId" searchable={false} export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
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
                                        title: CONSTANT.EMPTY_DATA,
                                    }}
                                    frameworkComponents={frameworkComponents}
                                >
                                    <AgGridColumn field="IsVendor" headerName="Costing Head" cellRenderer={'costingHeadRenderer'}></AgGridColumn>
                                    <AgGridColumn field="Technologies" headerName="Technology"></AgGridColumn>
                                    <AgGridColumn field="VendorName" headerName="Vendor Name"></AgGridColumn>
                                    <AgGridColumn field="Plants" headerName="Plant"></AgGridColumn>
                                    <AgGridColumn field="MachineNumber" headerName="Machine Number"></AgGridColumn>
                                    <AgGridColumn field="MachineTypeName" headerName="Machine Type"></AgGridColumn>
                                    <AgGridColumn field="MachineTonnage" cellRenderer={'hyphenFormatter'} headerName="Machine Tonnage"></AgGridColumn>
                                    <AgGridColumn field="ProcessName" headerName="Process Name"></AgGridColumn>
                                    <AgGridColumn field="MachineRate" headerName="Machine Rate"></AgGridColumn>
                                    <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={'effectiveDateRenderer'}></AgGridColumn>
                                    <AgGridColumn field="MachineId" width={160} headerName="Action" type="rightAligned" cellRenderer={'totalValueRenderer'}></AgGridColumn>
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