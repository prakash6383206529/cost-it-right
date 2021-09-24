import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { checkForDecimalAndNull, required } from "../../../helper/validation";
import { searchableSelect } from "../../layout/FormInputs";
import { Loader } from '../../common/Loader';
import { CONSTANT } from '../../../helper/AllConastant';
import { getBOPImportDataList, deleteBOP, getBOPCategorySelectList, getAllVendorSelectList, } from '../actions/BoughtOutParts';
import { getPlantSelectList, } from '../../../actions/Common';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr';
import moment from 'moment';
import BulkUpload from '../../massUpload/BulkUpload';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import { BOP_IMPORT_DOWNLOAD_EXCEl, costingHeadObjs } from '../../../config/masterData';
import ConfirmComponent from "../../../helper/ConfirmComponent";
import LoaderCustom from '../../common/LoaderCustom';
import { getVendorWithVendorCodeSelectList, } from '../actions/Supplier';
import { BopImport, INR } from '../../../config/constants';
import { getConfigurationKey } from '../../../helper';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

class BOPImportListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            isEditFlag: false,
            tableData: [],
            isBulkUpload: false,
            shown: false,
            costingHead: [],
            BOPCategory: [],
            plant: [],
            vendor: [],
            gridApi: null,
            gridColumnApi: null,
            rowData: null,
            sideBar: { toolPanels: ['columns'] },
            showData: false

        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        this.props.getBOPCategorySelectList(() => { })
        this.props.getPlantSelectList(() => { })
        this.props.getVendorWithVendorCodeSelectList(() => { })
        this.getDataList()
    }

    /**
    * @method getDataList
    * @description GET DATALIST OF IMPORT BOP
    */
    getDataList = (bopFor = '', CategoryId = 0, vendorId = '', plantId = '',) => {
        const filterData = {
            bop_for: bopFor,
            category_id: CategoryId,
            vendor_id: vendorId,
            plant_id: plantId,
        }
        this.props.getBOPImportDataList(filterData, (res) => {
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
        return toastr.confirm(`${MESSAGES.BOP_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete BOP
    */
    confirmDelete = (ID) => {
        this.props.deleteBOP(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.BOP_DELETE_SUCCESS);
                this.getDataList()
            }
        });
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
    * @method handleCategoryChange
    * @description  used to handle BOP Category Selection
    */
    handleCategoryChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ BOPCategory: newValue });
        } else {
            this.setState({ BOPCategory: [], });

        }
    }

    /**
    * @method handlePlantChange
    * @description  PLANT LIST
    */
    handlePlantChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ plant: newValue });
        } else {
            this.setState({ plant: [], });

        }
    }

    /**
    * @method handleVendorChange
    * @description  VENDOR LIST
    */
    handleVendorChange = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ vendor: newValue });

        } else {
            this.setState({ vendor: [], });

        }
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
        return cellValue ? 'Vendor Based' : 'Zero Based';
    }

    costFormatter = (cell, row, enumObject, rowIndex) => {
        const { initialConfiguration } = this.props
        return checkForDecimalAndNull(row.Currency === INR ? row.NetLandedCost : row.NetLandedCostConversion, initialConfiguration && initialConfiguration.NoOfDecimalForPrice);
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
    * @method renderListing
    * @description Used to show type of listing
    */
    renderListing = (label) => {
        const { bopCategorySelectList, plantSelectList, vendorWithVendorCodeSelectList, } = this.props;
        const temp = [];

        if (label === 'costingHead') {
            return costingHeadObjs;
        }

        if (label === 'BOPCategory') {
            bopCategorySelectList && bopCategorySelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

        if (label === 'plant') {
            plantSelectList && plantSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

        if (label === 'vendor') {
            vendorWithVendorCodeSelectList && vendorWithVendorCodeSelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

    }

    /**
    * @method filterList
    * @description Filter user listing on the basis of role and department
    */
    filterList = () => {
        const { costingHead, BOPCategory, plant, vendor } = this.state;

        const costingHeadTemp = costingHead ? costingHead.value : '';
        const categoryTemp = BOPCategory ? BOPCategory.value : 0;
        const vendorTemp = vendor ? vendor.value : '';
        const plantTemp = plant ? plant.value : '';

        this.getDataList(costingHeadTemp, categoryTemp, vendorTemp, plantTemp)
    }

    /**
    * @method resetFilter
    * @description Reset user filter
    */
    resetFilter = () => {
        this.setState({
            costingHead: [],
            BOPCategory: [],
            plant: [],
            vendor: [],
        }, () => {
            this.getDataList()
        })

    }
    formToggle = () => {
        this.props.displayForm()
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => {

    }

    /**
    * @method hyphenFormatter
    */
    hyphenFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        let value;
        if (cellValue === null || cellValue === '') {
            value = '-';
        }
        else {
            value = cellValue
        }
        return value
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

        return this.returnExcelColumn(BOP_IMPORT_DOWNLOAD_EXCEl, tempArr)
    };

    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = this.props.bopImportList && this.props.bopImportList.map((item) => {
            if (item.IsVendor === true) {
                item.IsVendor = 'Vendor Based'
            } if (item.IsVendor === false) {
                item.IsVendor = 'Zero Based'
            } if (item.Plants === '-') {
                item.Plants = ' '
            } if (item.Vendor === '-') {
                item.Vendor = ' '
            }
            return item
        })
        return (

            <ExcelSheet data={temp} name={BopImport}>
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
        const { handleSubmit, AddAccessibility, BulkUploadAccessibility, DownloadAccessibility } = this.props;
        const { isBulkUpload } = this.state;

        const onExportToCSV = (row) => {
            // ...
            let products = []
            products = this.props.bopImportList
            return products; // must return the data which you want to be exported
        }

        const options = {
            clearSearch: true,
            noDataText: (this.props.bopImportList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
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
            hyphenFormatter: this.hyphenFormatter,
            costingHeadFormatter: this.costingHeadFormatter,
            effectiveDateFormatter: this.effectiveDateFormatter
        };

        return (
            <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>
                {this.props.loading && <Loader />}
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                    <Row className="pt-4 filter-row-large">
                        {this.state.shown && (
                            <Col md="12" lg="10" className="filter-block">
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
                                            validate={(this.state.costingHead == null || this.state.costingHead.length === 0) ? [required] : []}
                                            required={true}
                                            handleChangeDescription={this.handleHeadChange}
                                            valueDescription={this.state.costingHead}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="category"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={'Category'}
                                            isClearable={false}
                                            options={this.renderListing('BOPCategory')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            validate={(this.state.BOPCategory == null || this.state.BOPCategory.length === 0) ? [required] : []}
                                            required={true}
                                            handleChangeDescription={this.handleCategoryChange}
                                            valueDescription={this.state.BOPCategory}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="vendor"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={'Vendor'}
                                            isClearable={false}
                                            options={this.renderListing('vendor')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            validate={(this.state.vendor == null || this.state.vendor.length === 0) ? [required] : []}
                                            required={true}
                                            handleChangeDescription={this.handleVendorChange}
                                            valueDescription={this.state.vendor}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="plant"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={'Plant'}
                                            isClearable={false}
                                            options={this.renderListing('plant')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            validate={(this.state.plant == null || this.state.plant.length === 0) ? [required] : []}
                                            required={true}
                                            handleChangeDescription={this.handlePlantChange}
                                            valueDescription={this.state.plant}
                                        />
                                    </div>

                                    <div className="flex-fill">
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
                                            className="apply"
                                        >
                                            {'Apply'}
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

                                            <ExcelFile filename={'Insert Import'} fileExtension={'.xls'} element={
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
                                    floatingFilter={true}
                                    domLayout='autoHeight'
                                    // columnDefs={c}
                                    rowData={this.props.bopImportList}
                                    pagination={true}
                                    paginationPageSize={10}
                                    onGridReady={this.onGridReady}
                                    gridOptions={gridOptions}
                                    // loadingOverlayComponent={'customLoadingOverlay'}
                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                    noRowsOverlayComponentParams={{
                                        title: CONSTANT.EMPTY_DATA,
                                    }}
                                    frameworkComponents={frameworkComponents}
                                >
                                    {/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
                                    <AgGridColumn field="IsVendor" headerName="Costing Head" cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                                    <AgGridColumn field="BoughtOutPartNumber" headerName="Insert Part No."></AgGridColumn>
                                    <AgGridColumn field="BoughtOutPartName" headerName="Insert Part Name"></AgGridColumn>
                                    <AgGridColumn field="BoughtOutPartCategory" headerName="Insert Category"></AgGridColumn>
                                    <AgGridColumn field="UOM" headerName="UOM"></AgGridColumn>
                                    <AgGridColumn field="Specification" headerName="Specification" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    <AgGridColumn field="Plants" hide={getConfigurationKey().IsDestinationPlantConfigure !== false} cellRenderer={'hyphenFormatter'} headerName="Plant"></AgGridColumn>
                                    <AgGridColumn field="DestinationPlant" hide={getConfigurationKey().IsDestinationPlantConfigure !== true} cellRenderer={'hyphenFormatter'} headerName="Plant"></AgGridColumn>
                                    <AgGridColumn field="Vendor" headerName="Vendor"></AgGridColumn>
                                    <AgGridColumn field="NumberOfPieces" headerName="Minimum Order Quantity"></AgGridColumn>
                                    <AgGridColumn field="BasicRate" headerName="Basic Rate(INR)"></AgGridColumn>
                                    <AgGridColumn field="NetLandedCostConversion" headerName="Net Cost(INR)"></AgGridColumn>
                                    <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={'effectiveDateFormatter'}></AgGridColumn>
                                    {!this.props.isSimulation && <AgGridColumn field="BoughtOutPartId" width={120} floatingFilter={false} headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}
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
                    fileName={'InsertImport'}
                    isZBCVBCTemplate={true}
                    messageLabel={'Insert Import'}
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
function mapStateToProps({ boughtOutparts, comman, supplier, auth }) {
    const { bopCategorySelectList, vendorAllSelectList, bopImportList } = boughtOutparts;
    const { plantSelectList, } = comman;
    const { vendorWithVendorCodeSelectList } = supplier;
    const { initialConfiguration } = auth;

    return { bopCategorySelectList, plantSelectList, vendorAllSelectList, bopImportList, vendorWithVendorCodeSelectList, initialConfiguration }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getBOPImportDataList,
    deleteBOP,
    getBOPCategorySelectList,
    getPlantSelectList,
    getAllVendorSelectList,
    getVendorWithVendorCodeSelectList
})(reduxForm({
    form: 'BOPImportListing',
    enableReinitialize: true,
})(BOPImportListing));