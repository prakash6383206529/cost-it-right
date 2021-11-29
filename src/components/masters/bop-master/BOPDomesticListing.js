import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { checkForDecimalAndNull, required } from "../../../helper/validation";
import { searchableSelect } from "../../layout/FormInputs";
import { Loader } from '../../common/Loader';
import { EMPTY_DATA } from '../../../config/constants';
import {
    getBOPDomesticDataList, deleteBOP, getBOPCategorySelectList, getAllVendorSelectList,
    getPlantSelectList, getPlantSelectListByVendor,
} from '../actions/BoughtOutParts';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import DayTime from '../../common/DayTimeWrapper'
import BulkUpload from '../../massUpload/BulkUpload';
import { BOP_DOMESTIC_DOWNLOAD_EXCEl, costingHeadObjs } from '../../../config/masterData';
import ConfirmComponent from "../../../helper/ConfirmComponent";
import LoaderCustom from '../../common/LoaderCustom';
import { getVendorWithVendorCodeSelectList, } from '../actions/Supplier';
import { getConfigurationKey } from '../../../helper';
import { BopDomestic, } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

class BOPDomesticListing extends Component {
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
        this.getDataList()
    }

    /**
    * @method getDataList
    * @description GET DETAILS OF BOP DOMESTIC
    */
    getDataList = (bopFor = '', CategoryId = 0, vendorId = '', plantId = '',) => {
        const filterData = {
            bop_for: bopFor,
            category_id: CategoryId,
            vendor_id: vendorId,
            plant_id: plantId,
        }
        this.props.getBOPDomesticDataList(filterData, (res) => {
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
        this.setState({ showPopup: true, deletedId: Id })
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDelete(Id);
            },
            onCancel: () => { },
            component: () => <ConfirmComponent />,
        };
        // return Toaster.confirm(`${MESSAGES.BOP_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete Raw Material details
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
        return cell != null ? checkForDecimalAndNull(cell, initialConfiguration && initialConfiguration.NoOfDecimalForPrice) : '';
    }


    renderPlant = (cell, row, enumObject, rowIndex) => {
        return cell !== null ? row.IsVendor ? row.DestinationPlant : row.Plants : '-'
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
    * @method effectiveDateFormatter
    * @description Renders buttons
    */
    effectiveDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
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

        return this.returnExcelColumn(BOP_DOMESTIC_DOWNLOAD_EXCEl, tempArr)
    };

    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = this.props.bopDomesticList && this.props.bopDomesticList.map((item) => {
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

            <ExcelSheet data={temp} name={BopDomestic}>
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

        const options = {
            clearSearch: true,
            noDataText: (this.props.bopDomesticList === undefined ? <LoaderCustom /> : <NoContentFound title={EMPTY_DATA} />),
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


        const selectRow = {
            mode: 'checkbox',  // multi select
            clickToSelect: true,
            hideSelectColumn: true,
        };

        return (
            // <div>
            <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>

                {/* {this.props.loading && <Loader />} */}
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                    <Row className={`pt-4 filter-row-large  ${this.props.isSimulation ? 'simulation-filter' : ''}`}>

                        <Col md="6" lg="6" className="search-user-block mb-3">
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

                                            <ExcelFile filename={'BOP Domestic'} fileExtension={'.xls'} element={
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

                        <div className="ag-grid-wrapper height-width-wrapper">
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
                                    rowData={this.props.bopDomesticList}
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

                                    <AgGridColumn field="IsVendor" headerName="Costing Head" cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                                    <AgGridColumn field="BoughtOutPartNumber" headerName="BOP Part No."></AgGridColumn>
                                    <AgGridColumn field="BoughtOutPartName" headerName="BOP Part Name"></AgGridColumn>
                                    <AgGridColumn field="BoughtOutPartCategory" headerName="BOP Category"></AgGridColumn>
                                    <AgGridColumn field="UOM" headerName="UOM"></AgGridColumn>
                                    <AgGridColumn field="Specification" headerName="Specification" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    <AgGridColumn field="Plants" hide={getConfigurationKey().IsDestinationPlantConfigure !== false} cellRenderer={'hyphenFormatter'} headerName="Plant"></AgGridColumn>
                                    <AgGridColumn field="DestinationPlant" hide={getConfigurationKey().IsDestinationPlantConfigure !== true} cellRenderer={'hyphenFormatter'} headerName="Plant"></AgGridColumn>
                                    <AgGridColumn field="Vendor" headerName="Vendor"></AgGridColumn>
                                    <AgGridColumn width={205} field="NumberOfPieces" headerName="Minimum Order Quantity"></AgGridColumn>
                                    <AgGridColumn field="BasicRate" headerName="Basic Rate(INR)"></AgGridColumn>
                                    <AgGridColumn field="NetLandedCost" headerName="Net Cost(INR)"></AgGridColumn>
                                    <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={'effectiveDateFormatter'}></AgGridColumn>
                                    {!this.props.isSimulation && <AgGridColumn field="BoughtOutPartId" width={120} headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}
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
                    fileName={'BOPDomestic'}
                    isZBCVBCTemplate={true}
                    messageLabel={'BOP Domestic'}
                    anchor={'right'}
                />}
                {
                    this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.BOP_DELETE_ALERT}`} />
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
function mapStateToProps({ boughtOutparts, supplier, auth }) {
    const { bopCategorySelectList, vendorAllSelectList, plantSelectList, bopDomesticList } = boughtOutparts;
    const { vendorWithVendorCodeSelectList } = supplier;
    const { initialConfiguration } = auth;
    return { bopCategorySelectList, plantSelectList, vendorAllSelectList, bopDomesticList, vendorWithVendorCodeSelectList, initialConfiguration }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getBOPDomesticDataList,
    deleteBOP,
    getBOPCategorySelectList,
    getPlantSelectList,
    getAllVendorSelectList,
    getPlantSelectListByVendor,
    getVendorWithVendorCodeSelectList
})(reduxForm({
    form: 'BOPDomesticListing',
    enableReinitialize: true,
})(BOPDomesticListing));