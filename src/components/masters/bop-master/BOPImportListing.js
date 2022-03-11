import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { checkForDecimalAndNull } from "../../../helper/validation";
import { BOPIMPORT, EMPTY_DATA } from '../../../config/constants';
import { getBOPImportDataList, deleteBOP, getBOPCategorySelectList, getAllVendorSelectList, } from '../actions/BoughtOutParts';
import { getPlantSelectList, } from '../../../actions/Common';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import DayTime from '../../common/DayTimeWrapper'
import BulkUpload from '../../massUpload/BulkUpload';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import { BOP_IMPORT_DOWNLOAD_EXCEl } from '../../../config/masterData';
import LoaderCustom from '../../common/LoaderCustom';
import { getVendorWithVendorCodeSelectList, } from '../actions/Supplier';
import { BopImport, INR, BOP_MASTER_ID } from '../../../config/constants';
import { getConfigurationKey, CheckApprovalApplicableMaster, getFilteredData } from '../../../helper';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { filterParams } from '../../common/DateFilter'
import { getListingForSimulationCombined } from '../../simulation/actions/Simulation';


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
            showData: false,
            isLoader: false,
            showPopup: false,
            deletedId: ''

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

        if (this.props.isSimulation) {
            if (this.props.selectionForListingMasterAPI === 'Combined') {
                this.props?.changeSetLoader(true)
                this.props.getListingForSimulationCombined(this.props.objectForMultipleSimulation, BOPIMPORT, () => {
                    this.props?.changeSetLoader(false)

                })
            }
            if (this.props.selectionForListingMasterAPI === 'Master') {
                this.getDataList()
            }
        }
        else {
            this.getDataList()
        }
    }

    /**
    * @method getDataList
    * @description GET DATALIST OF IMPORT BOP
    */
    getDataList = (bopFor = '', CategoryId = 0, vendorId = '', plantId = '',) => {
        if (this.props.isSimulation) {
            this.props?.changeTokenCheckBox(false)
        }
        const filterData = {
            bop_for: bopFor,
            category_id: CategoryId,
            vendor_id: vendorId,
            plant_id: plantId,
        }
        this.setState({ isLoader: true })
        this.props.getBOPImportDataList(filterData, (res) => {
            if (this.props.isSimulation) {
                this.props?.changeTokenCheckBox(true)
            }
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
        this.props.getDetails(data);
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
    * @description confirm delete BOP
    */
    confirmDelete = (ID) => {

        this.props.deleteBOP(ID, (res) => {
            if (res.data.Result === true) {
                Toaster.success(MESSAGES.BOP_DELETE_SUCCESS);
                this.getDataList()
            }
        });
        this.setState({ showPopup: false })
    }
    onPopupConfirm = () => {
        this.confirmDelete(this.state.deletedId);

    }
    closePopUp = () => {
        this.setState({ showPopup: false })
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

        const { EditAccessibility, DeleteAccessibility, ViewAccessibility } = this.props;

        let isEditable = false
        let isDeleteButton = false


        if (EditAccessibility && !rowData.IsBOPAssociated) {
            isEditable = true
        } else {
            isEditable = false
        }


        if (DeleteAccessibility && !rowData.IsBOPAssociated) {
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

    /**
    * @method costingHeadFormatter
    * @description Renders Costing head
    */
    costingHeadFormatter = (props) => {

        let cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        if (cellValue === true) {
            cellValue = 'Vendor Based'
        } else if (cellValue === false) {
            cellValue = 'Zero Based'
        }
        return cellValue          // IN SUMMARY DRAWER COSTING HEAD IS ROWDATA.COSTINGHEAD & IN MAIN DOMESTIC LISTING IT IS CELLVALUE

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

        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
    }
    plantFormatter = (props) => {

        const rowData = props.data
        return rowData.IsVendor === 'Vendor Based' ? rowData.DestinationPlant : rowData.Plants
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
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
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
        if (this.props.isSimulation === true) {
            const data = this.state.gridApi && this.state.gridApi.getModel().rowsToDisplay
            data && data.map((item => {
                tempArr.push(item.data)
                return null
            }))
        } else {
            tempArr = this.props.bopImportList && this.props.bopImportList
        }
        return this.returnExcelColumn(BOP_IMPORT_DOWNLOAD_EXCEl, tempArr)
    };

    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData && TempData.map((item) => {
            if (item.IsVendor === true) {
                item.IsVendor = 'Vendor Based'
            } if (item.IsVendor === false) {
                item.IsVendor = 'Zero Based'
            } if (item.Plants === '-') {
                item.Plants = ' '
            } if (item.Vendor === '-') {
                item.Vendor = ' '
            }

            if (item.EffectiveDate.includes('T')) {
                item.EffectiveDate = DayTime(item.EffectiveDate).format('DD/MM/YYYY')
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

    getFilterBOPData = () => {
        if (this.props.isSimulation) {
            return getFilteredData(this.props.bopImportList, BOP_MASTER_ID)
        } else {
            return this.props.bopImportList
        }
    }


    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, AddAccessibility, BulkUploadAccessibility, DownloadAccessibility } = this.props;
        const { isBulkUpload } = this.state;
        const ExcelFile = ReactExport.ExcelFile;



        const isFirstColumn = (params) => {
            if (this.props.isSimulation) {

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
            headerCheckboxSelection: isFirstColumn,
            checkboxSelection: isFirstColumn
        };

        const frameworkComponents = {
            totalValueRenderer: this.buttonFormatter,
            customNoRowsOverlay: NoContentFound,
            hyphenFormatter: this.hyphenFormatter,
            costingHeadFormatter: this.costingHeadFormatter,
            effectiveDateFormatter: this.effectiveDateFormatter,
            plantFormatter: this.plantFormatter
        };

        const onRowSelect = () => {

            var selectedRows = this.state.gridApi.getSelectedRows();
            if (this.props.isSimulation) {
                let length = this.state.gridApi.getSelectedRows().length
                this.props.apply(selectedRows, length)
            }
            this.setState({ selectedRowData: selectedRows })
        }



        return (
            <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>
                {this.state.isLoader && <LoaderCustom />}
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                    <Row className={`pt-4 filter-row-large  ${this.props.isSimulation ? 'simulation-filter' : ''}`}>


                        <Col md="6" lg="6" className="search-user-block mb-3">
                            <div className="d-flex justify-content-end bd-highlight w100">
                                <div>
                                    {this.state.shown ? (
                                        <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => { this.setState({ shown: !this.state.shown }); this.getDataList(); }}>
                                            <div className="cancel-icon-white"></div></button>
                                    ) : (
                                        <>
                                        </>
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

                                            <ExcelFile filename={'BOP Import'} fileExtension={'.xls'} element={
                                                <button type="button" className={'user-btn mr5'}><div className="download mr-0" title="Download"></div>
                                                    {/* DOWNLOAD */}
                                                </button>}>

                                                {this.onBtExport()}
                                            </ExcelFile>

                                        </>
                                    }
                                    <button type="button" className="user-btn" title="Reset Grid" onClick={() => { this.resetState(); }}>
                                        <div className="refresh mr-0"></div>
                                    </button>

                                </div>
                            </div>
                        </Col>
                    </Row>

                </form >
                <Row>
                    <Col>

                        <div className={`ag-grid-wrapper height-width-wrapper ${this.props.bopImportList && this.props.bopImportList?.length <= 0 ? "overlay-contain" : ""}`}>
                            <div className="ag-grid-header">
                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
                            </div>
                            <div className={`ag-theme-material ${this.state.isLoader && "max-loader-height"}`} >
                                <AgGridReact
                                    defaultColDef={defaultColDef}

                                    floatingFilter={true}

                                    domLayout='autoHeight'
                                    // columnDefs={c}
                                    rowData={this.getFilterBOPData()}
                                    pagination={true}
                                    paginationPageSize={10}
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
                                >
                                    {/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
                                    <AgGridColumn field="IsVendor" headerName="Costing Head" cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                                    <AgGridColumn field="BoughtOutPartNumber" headerName="BOP Part No."></AgGridColumn>
                                    <AgGridColumn field="BoughtOutPartName" headerName="BOP Part Name"></AgGridColumn>
                                    <AgGridColumn field="BoughtOutPartCategory" headerName="BOP Category"></AgGridColumn>
                                    <AgGridColumn field="UOM" headerName="UOM"></AgGridColumn>
                                    <AgGridColumn field="Currency"></AgGridColumn>
                                    <AgGridColumn field="Specification" headerName="Specification" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    <AgGridColumn field="Plants" hide={getConfigurationKey().IsDestinationPlantConfigure !== false} cellRenderer={'hyphenFormatter'} headerName="Plant"></AgGridColumn>
                                    <AgGridColumn field="DestinationPlant" hide={getConfigurationKey().IsDestinationPlantConfigure !== true} cellRenderer={'plantFormatter'} headerName="Plant(Code)"></AgGridColumn>
                                    <AgGridColumn field="Vendor" headerName="Vendor(Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    <AgGridColumn field="NumberOfPieces" headerName="Minimum Order Quantity"></AgGridColumn>
                                    <AgGridColumn field="BasicRate" headerName="Basic Rate"></AgGridColumn>
                                    <AgGridColumn field="NetLandedCost" headerName="Net Cost (Currency)" cellRenderer='costFormatter'></AgGridColumn>
                                    <AgGridColumn field="NetLandedCostConversion" headerName="Net Cost (INR)"></AgGridColumn>
                                    <AgGridColumn field="EffectiveDateNew" headerName="Effective Date" cellRenderer={'effectiveDateFormatter'} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                                    {!this.props.isSimulation && <AgGridColumn field="BoughtOutPartId" width={160} headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}
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
                        {
                            this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.BOP_DELETE_ALERT}`} />
                        }
                    </Col>
                </Row>
                {
                    isBulkUpload && <BulkUpload
                        isOpen={isBulkUpload}
                        closeDrawer={this.closeBulkUploadDrawer}
                        isEditFlag={false}
                        fileName={'BOPImport'}
                        isZBCVBCTemplate={true}
                        messageLabel={'BOP Import'}
                        anchor={'right'}
                    />
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
    getVendorWithVendorCodeSelectList,
    getListingForSimulationCombined
})(reduxForm({
    form: 'BOPImportListing',
    enableReinitialize: true,
})(BOPImportListing));