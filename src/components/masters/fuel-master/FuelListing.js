import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm, } from "redux-form";
import { Row, Col, } from 'reactstrap';
import {
    getFuelDetailDataList, getFuelComboData, deleteFuelDetailAPI, getStateListByFuel, getFuelListByState,
} from '../actions/Fuel';
import { searchableSelect } from "../../layout/FormInputs";
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import { toastr } from 'react-redux-toastr';
import 'react-input-range/lib/css/index.css'
import moment from 'moment';
import BulkUpload from '../../massUpload/BulkUpload';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import LoaderCustom from '../../common/LoaderCustom';
import { checkForDecimalAndNull } from '../../../helper';
import { FuelMaster } from '../../../config/constants';
import { FUELLISTING_DOWNLOAD_EXCEl } from '../../../config/masterData';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

class FuelListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            shown: false,
            tableData: [],
            isBulkUpload: false,
            fuel: [],
            StateName: [],
            gridApi: null,
            gridColumnApi: null,
            rowData: null,
            isLoader: true

        }
    }

    /**
    * @method componentDidMount
    * @description Called after rendering the component
    */
    componentDidMount() {
        setTimeout(() => {

            this.getDataList(0, 0)
            this.props.getFuelComboData(() => { })
        }, 500);
    }

    componentWillUnmount() {
        this.props.getFuelDetailDataList(false, {}, (res) => { })
    }

    getDataList = (fuelName = 0, stateName = 0) => {
        const filterData = {
            fuelName: fuelName,
            stateName: stateName,
        }
        this.props.getFuelDetailDataList(true, filterData, (res) => {
            if (res && res.status === 200) {
                let Data = res.data.DataList;
                this.setState({ tableData: Data }, () => { this.setState({ isLoader: false }) })
            } else if (res && res.response && res.response.status === 412) {
                this.setState({ tableData: [] })
            } else {
                this.setState({ tableData: [] })
            }
        })
    }

    /**
    * @method editItemDetails
    * @description Edit Fuel
    */
    editItemDetails = (Id, rowData) => {
        let data = {
            isEditFlag: true,
            Id: Id,
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
                this.confirmDelete(Id)
            },
            onCancel: () => { }
        };
        return toastr.confirm(`${MESSAGES.FUEL_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDelete
    * @description confirm delete Fuel details
    */
    confirmDelete = (ID) => {
        // this.props.deleteFuelDetailAPI(ID, (res) => {
        //     if (res.data.Result === true) {
        //         toastr.success(MESSAGES.DELETE_FUEL_DETAIL_SUCCESS);
        //         this.getDataList()
        //     }
        // });
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
                {EditAccessibility && <button className="Edit" type={'button'} onClick={() => this.editItemDetails(cellValue, rowData)} />}
                {/* {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />} */}
            </>
        )
    };

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
    costFormatter = (cell, row, enumObject, rowIndex) => {
        const { initialConfiguration } = this.props
        return cell != null ? checkForDecimalAndNull(cell, initialConfiguration.NoOfDecimalForPrice) : '';
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
        const { fuelComboSelectList } = this.props;
        const temp = [];
        if (label === 'fuel') {
            fuelComboSelectList && fuelComboSelectList.Fuels && fuelComboSelectList.Fuels.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }
        if (label === 'state') {
            fuelComboSelectList && fuelComboSelectList.States && fuelComboSelectList.States.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
            });
            return temp;
        }

    }

    /**
    * @method handleFuel
    * @description called
    */
    handleFuel = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ fuel: newValue, }, () => {
                const { fuel } = this.state;
                this.props.getStateListByFuel(fuel.value, () => { })
            })
        } else {
            this.setState({ fuel: [] })
        }
    };

    /**
    * @method handleState
    * @description called
    */
    handleState = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ StateName: newValue, }, () => {
                const { StateName } = this.state;
                this.props.getFuelListByState(StateName.value, () => { })
            })
        } else {
            this.setState({ StateName: [] })
        }
    };

    /**
    * @method filterList
    * @description Filter user listing on the basis of role and department
    */
    filterList = () => {
        const { StateName, fuel } = this.state;
        const fuelID = fuel ? fuel.value : 0;
        const stateId = StateName ? StateName.value : 0;

        this.getDataList(fuelID, stateId)
    }

    /**
    * @method resetFilter
    * @description Reset user filter
    */
    resetFilter = () => {
        this.setState({
            fuel: [],
            StateName: [],
        }, () => {
            this.props.getFuelComboData(() => { })
            this.getDataList(0, 0)
        })
    }

    formToggle = () => {
        this.props.formToggle()
    }

    bulkToggle = () => {
        this.setState({ isBulkUpload: true })
    }

    closeBulkUploadDrawer = () => {
        this.setState({ isBulkUpload: false }, () => this.getDataList(0, 0))
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    onSubmit = (values) => { }

    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData && TempData.map((item) => {
            if (item.IsVendor === true) {
                item.IsVendor = 'VBC'
            } if (item.IsVendor === false) {
                item.IsVendor = 'ZBC'
            } if (item.Plants === '-') {
                item.Plants = ' '
            } if (item.Vendor === '-') {
                item.Vendor = ' '
            }
            return item
        })

        return (<ExcelSheet data={temp} name={`${FuelMaster}`}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)
            }
        </ExcelSheet>);
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
        data && data.map((item => {
            tempArr.push(item.data)
        }))
        return this.returnExcelColumn(FUELLISTING_DOWNLOAD_EXCEl, this.props.fuelDataList)
    };

    onFilterTextBoxChanged(e) {
        this.state.gridApi.setQuickFilter(e.target.value);
    }

    resetState() {
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);
    }


    createCustomExportCSVButton = (onClick) => {
        // return (
        //     <ExportCSVButton btnText='Download' onClick={() => this.handleExportCSVButtonClick(onClick)} />
        // );
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
            noDataText: (this.props.fuelDataList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
            paginationShowsTotal: this.renderPaginationShowsTotal,
            // exportCSVBtn: this.createCustomExportCSVButton,
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
            customLoadingOverlay: LoaderCustom,
            customNoRowsOverlay: NoContentFound,
        };


        return (
            <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>
                {this.state.isLoader && <LoaderCustom />}
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                    <Row className="pt-4">
                        {this.state.shown && (
                            <Col md="8" className="filter-block">
                                <div className="d-inline-flex justify-content-start align-items-top w100">
                                    <div className="flex-fills"><h5>{`Filter By:`}</h5></div>
                                    <div className="flex-fill">
                                        <Field
                                            name="Fuel"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={'Select Fuel'}
                                            isClearable={false}
                                            options={this.renderListing('fuel')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            //validate={(this.state.fuel == null || this.state.fuel.length == 0) ? [required] : []}
                                            //required={true}
                                            handleChangeDescription={this.handleFuel}
                                            valueDescription={this.state.fuel}
                                            disabled={false}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="state"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={'Select State'}
                                            isClearable={false}
                                            options={this.renderListing('state')}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            //validate={(this.state.StateName == null || this.state.StateName.length == 0) ? [required] : []}
                                            //required={true}
                                            handleChangeDescription={this.handleState}
                                            valueDescription={this.state.StateName}
                                            disabled={false}
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
                                            className="user-btn mr5"
                                        >
                                            {'Apply'}
                                        </button>
                                    </div>
                                </div>
                            </Col>)}
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

                                            <ExcelFile filename={'Fuel'} fileExtension={'.xls'} element={
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
                                    rowData={this.props.fuelDataList}
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
                                    <AgGridColumn field="FuelName" headerName="Fuel" cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                                    <AgGridColumn field="UnitOfMeasurementName" headerName="UOM"></AgGridColumn>
                                    <AgGridColumn field="StateName" headerName="State"></AgGridColumn>
                                    <AgGridColumn field="Rate" headerName="Rate (INR)"></AgGridColumn>
                                    <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={'effectiveDateRenderer'}></AgGridColumn>
                                    <AgGridColumn field="ModifiedDate" headerName="Date Of Modification" cellRenderer={'effectiveDateRenderer'}></AgGridColumn>
                                    <AgGridColumn field="FuelDetailId" headerName="Action" type="rightAligned" cellRenderer={'totalValueRenderer'}></AgGridColumn>
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
                    fileName={'Fuel'}
                    messageLabel={'Fuel'}
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
function mapStateToProps({ fuel, auth }) {
    const { fuelComboSelectList, fuelDataList } = fuel;
    const { initialConfiguration } = auth;

    return { fuelComboSelectList, fuelDataList, initialConfiguration }
}

/**
 * @method connect
 * @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getFuelDetailDataList,
    getFuelComboData,
    deleteFuelDetailAPI,
    getStateListByFuel,
    getFuelListByState,
})(reduxForm({
    form: 'FuelListing',
    enableReinitialize: true,
})(FuelListing));