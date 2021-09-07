import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { required } from "../../../helper/validation";
import {
    getProfitDataList, deleteProfit, activeInactiveProfit, fetchModelTypeAPI,
    getVendorWithVendorCodeSelectList, getProfitVendorFilterByModelSelectList, getProfitModelFilterByVendorSelectList,
} from '../actions/OverheadProfit';
import { searchableSelect } from "../../layout/FormInputs";
import { CONSTANT } from '../../../helper/AllConastant';
import { loggedInUserId, } from '../../../helper';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr';
import Switch from "react-switch";
import { GridTotalFormate } from '../../common/TableGridFunctions';
import { costingHeadObj, PROFIT_DOWNLOAD_EXCEl } from '../../../config/masterData';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import { fetchCostingHeadsAPI, } from '../../../actions/Common';
import LoaderCustom from '../../common/LoaderCustom';
import moment from 'moment';
import { ProfitMaster } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

class ProfitListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            tableData: [],
            IsVendor: false,
            shown: false,

            costingHead: [],
            ModelType: [],
            vendorName: [],
            overheadAppli: [],
        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        this.props.fetchModelTypeAPI('--Model Types--', res => { });
        this.props.fetchCostingHeadsAPI('--Costing Heads--', res => { });
        this.props.getVendorWithVendorCodeSelectList()
        this.getDataList()
    }

    // Get updated Table data list after any action performed.
    getUpdatedData = () => {
        this.getDataList()
    }

    getDataList = (costingHead = null, vendorName = null, overhead = null, modelType = null,) => {
        const filterData = {
            costing_head: costingHead,
            vendor_id: vendorName,
            profit_applicability_type_id: overhead,
            model_type_id: modelType,
        }
        this.props.getProfitDataList(filterData, (res) => {
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
    * @method deleteItem
    * @description confirm delete
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id)
            },
            onCancel: () => { },
            component: () => <ConfirmComponent />
        };
        return toastr.confirm(`${MESSAGES.PROFIT_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete
    */
    confirmDelete = (ID) => {
        this.props.deleteProfit(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_PROFIT_SUCCESS);
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
    * @method dashFormatter
    * @description Renders dash
    */
    dashFormatter = (cell, row, enumObject, rowIndex) => {
        return cell == null ? '-' : cell;
    }

    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    buttonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

        const { EditAccessibility, DeleteAccessibility } = this.props;


        return (
            <>
                {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => this.editItemDetails(cellValue, rowData)} />}
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
        let headText = '';
        if (cellValue === 'ZBC') {
            headText = 'Zero Based';
        } if (cellValue === 'VBC') {
            headText = 'Vendor Based';
        } if (cellValue === 'CBC') {
            headText = 'Client Based';
        }
        return headText;
    }

    /**
    * @method hyphenFormatter
    */
    hyphenFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? cellValue : '-';
    }

    /**
  * @method effectiveDateFormatter
  * @description Renders buttons
  */
    effectiveDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? moment(cellValue).format('DD/MM/YYYY') : '';
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

    effectiveDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? moment(cellValue).format('DD/MM/YYYY') : '';
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
    * @method handleModelTypeChange
    * @description called
    */
    handleModelTypeChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ ModelType: newValue, }, () => {
                const { ModelType } = this.state;
                this.props.getProfitVendorFilterByModelSelectList(ModelType.value, () => { })
            });
        } else {
            this.setState({ ModelType: [], })
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
                this.props.getProfitModelFilterByVendorSelectList(vendorName.value, () => { })
            });
        } else {
            this.setState({ vendorName: [] })
            this.props.fetchModelTypeAPI('--Model Types--', res => { });
        }
    };

    /**
    * @method handleOverheadChange
    * @description called
    */
    handleOverheadChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ overheadAppli: newValue });
        } else {
            this.setState({ overheadAppli: [] })
        }
    };

    /**
    * @method renderListing
    * @description Used to show type of listing
    */
    renderListing = (label) => {
        const { filterOverheadSelectList, costingHead } = this.props;
        const temp = [];

        if (label === 'costingHead') {
            return costingHeadObj;
        }

        if (label === 'ModelType') {
            filterOverheadSelectList && filterOverheadSelectList.modelTypeSelectList && filterOverheadSelectList.modelTypeSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }

        if (label === 'VendorNameList') {
            filterOverheadSelectList && filterOverheadSelectList.VendorsSelectList && filterOverheadSelectList.VendorsSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'ProfitApplicability') {
            costingHead && costingHead.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }


    }

    /**
    * @method statusButtonFormatter
    * @description Renders buttons
    */
    statusButtonFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <label htmlFor="normal-switch" className="normal-switch">
                    {/* <span>Switch with default style</span> */}
                    <Switch
                        onChange={() => this.handleChange(cell, row, enumObject, rowIndex)}
                        checked={cell}
                        background="#ff6600"
                        onColor="#4DC771"
                        onHandleColor="#ffffff"
                        id="normal-switch"
                        height={24}
                    />
                </label>
            </>
        )
    }

    handleChange = (cell, row, enumObject, rowIndex) => {
        let data = {
            Id: row.ProfitId,
            LoggedInUserId: loggedInUserId(),
            IsActive: !cell, //Status of the Profit.
        }
        this.props.activeInactiveProfit(data, res => {
            if (res && res.data && res.data.Result) {
                if (cell === true) {
                    toastr.success(MESSAGES.PROFIT_INACTIVE_SUCCESSFULLY)
                } else {
                    toastr.success(MESSAGES.PROFIT_ACTIVE_SUCCESSFULLY)
                }
                this.getDataList(null, null, null, null)
            }
        })
    }

    /**
    * @method filterList
    * @description Filter user listing on the basis of role and department
    */
    filterList = () => {
        const { costingHead, ModelType, vendorName, overheadAppli, } = this.state;
        const costingHeadTemp = costingHead ? costingHead.value : null;
        const ModelTypeTemp = ModelType ? ModelType.value : null;
        const vendorNameTemp = vendorName ? vendorName.value : null;
        const OverheadAppliTemp = overheadAppli ? overheadAppli.value : null;

        this.getDataList(costingHeadTemp, vendorNameTemp, OverheadAppliTemp, ModelTypeTemp)
    }

    /**
    * @method resetFilter
    * @description Reset filter
    */
    resetFilter = () => {
        this.setState({
            costingHead: [],
            ModelType: [],
            vendorName: [],
            overheadAppli: []
        }, () => {
            this.props.fetchModelTypeAPI('--Model Types--', res => { });
            this.props.getVendorWithVendorCodeSelectList()
            this.getDataList(null, null, null, null)
        })

    }

    formToggle = () => {
        this.props.formToggle()
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => { }

    /**
 * @method handleOverheadChange
 * @description Handle overhead chnage
*/
    handleOverheadChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ overheadAppli: newValue });
        }
    };

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

        return this.returnExcelColumn(PROFIT_DOWNLOAD_EXCEl, this.props.overheadProfitList)
    };

    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        TempData && TempData.map((item) => {
            if (item.ClientName === '-') {
                item.ClientName = ' '
            } if (item.TypeOfHead === 'VBC') {
                item.TypeOfHead = 'Vendor Based'
            } if (item.TypeOfHead === 'ZBC') {
                item.TypeOfHead = 'Zero Based'
            } if (item.TypeOfHead === 'CBC') {
                item.TypeOfHead = 'Client Based'
            } if (item.ClientName === null) {
                item.ClientName = ' '
            } if (item.ProfitBOPPercentage === null) {
                item.ProfitBOPPercentage = ' '
            } if (item.ProfitMachiningCCPercentage === null) {
                item.ProfitMachiningCCPercentage = ' '
            } if (item.ProfitPercentage === null) {
                item.ProfitPercentage = ' '
            } if (item.ProfitRMPercentage === null) {
                item.ProfitRMPercentage = ' '
            } if (item.VendorName === '-') {
                item.VendorName = ' '
            } else {
                return false
            }

            return item
        })
        return (

            <ExcelSheet data={TempData} name={ProfitMaster}>
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

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, AddAccessibility, DownloadAccessibility } = this.props;
        const { isEditFlag, } = this.state;

        const options = {
            clearSearch: true,
            noDataText: (this.props.overheadProfitList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
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
            customLoadingOverlay: LoaderCustom,
            customNoRowsOverlay: NoContentFound,
            costingHeadFormatter: this.costingHeadFormatter,
            effectiveDateFormatter: this.effectiveDateFormatter,
            statusButtonFormatter: this.statusButtonFormatter,
            hyphenFormatter: this.hyphenFormatter,
            plantFormatter: this.plantFormatter
        };

        return (
            <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>
                {/* {this.props.loading && <Loader />} */}
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                    <Row className="pt-4">
                        {this.state.shown && (
                            <Col md="10" className="filter-block profit-filter-block">
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
                                            validate={
                                                this.state.costingHead == null ||
                                                    this.state.costingHead.length === 0
                                                    ? [required]
                                                    : []
                                            }
                                            required={true}
                                            handleChangeDescription={this.handleHeadChange}
                                            valueDescription={this.state.costingHead}
                                        //disabled={isEditFlag ? true : false}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="ModelType"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={"Model Type"}
                                            isClearable={false}
                                            options={this.renderListing("ModelType")}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            validate={
                                                this.state.ModelType == null ||
                                                    this.state.ModelType.length === 0
                                                    ? [required]
                                                    : []
                                            }
                                            required={true}
                                            handleChangeDescription={this.handleModelTypeChange}
                                            valueDescription={this.state.ModelType}
                                        //disabled={isEditFlag ? true : false}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="ProfitApplicabilityId"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={"Profit Applicability"}
                                            options={this.renderListing(
                                                "ProfitApplicability"
                                            )}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            validate={
                                                this.state.overheadAppli == null ||
                                                    this.state.overheadAppli.length === 0
                                                    ? [required]
                                                    : []
                                            }
                                            required={true}
                                            handleChangeDescription={
                                                this.handleOverheadChange
                                            }
                                            valueDescription={this.state.overheadAppli}
                                        //disabled={isEditFlag ? true : false}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="vendorName"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={"Vendor Name"}
                                            isClearable={false}
                                            options={this.renderListing("VendorNameList")}
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
                                            disabled={isEditFlag ? true : false}
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
                        <Col md="6" className="search-user-block mb-3">
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
                                    {
                                        DownloadAccessibility &&
                                        <>

                                            <ExcelFile filename={'Profit'} fileExtension={'.xls'} element={
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
                                    rowData={this.props.overheadProfitList}
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
                                    <AgGridColumn field="TypeOfHead" headerName="Costing Head" ></AgGridColumn>
                                    <AgGridColumn field="VendorName" headerName="Vendor Name"></AgGridColumn>
                                    <AgGridColumn field="PlantName" headerName="Plant" cellRenderer='plantFormatter'></AgGridColumn>
                                    {/* <AgGridColumn field="ClientName" headerName="Client Name" cellRenderer={'hyphenFormatter'}></AgGridColumn> */}
                                    <AgGridColumn field="ModelType" headerName="Model Type"></AgGridColumn>
                                    <AgGridColumn field="ProfitApplicabilityType" headerName="Profit Applicability"></AgGridColumn>
                                    <AgGridColumn field="ProfitPercentage" headerName="Profit Applicability (%)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    <AgGridColumn field="ProfitRMPercentage" headerName="Profit on RM (%)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    <AgGridColumn field="ProfitBOPPercentage" headerName="Profit on BOP (%)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    <AgGridColumn field="ProfitMachiningCCPercentage" headerName="Profit on CC (%)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={'effectiveDateFormatter'}></AgGridColumn>
                                    <AgGridColumn field="ProfitId" width={120} headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
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
    const { overheadProfit, comman } = state;

    const { filterOverheadSelectList, overheadProfitList } = overheadProfit;

    const { costingHead } = comman;

    return { filterOverheadSelectList, overheadProfitList, costingHead }

}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getProfitDataList,
    deleteProfit,
    activeInactiveProfit,
    fetchModelTypeAPI,
    getVendorWithVendorCodeSelectList,
    getProfitVendorFilterByModelSelectList,
    getProfitModelFilterByVendorSelectList,
    fetchCostingHeadsAPI
})(reduxForm({
    form: 'ProfitListing',
    enableReinitialize: true,
})(ProfitListing));