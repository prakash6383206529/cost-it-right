import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { focusOnError, searchableSelect } from "../../layout/FormInputs";
import { checkForDecimalAndNull, required } from "../../../helper/validation";
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { getExchangeRateDataList, deleteExchangeRate, getCurrencySelectList, getExchangeRateData } from '../actions/ExchangeRateMaster';
import AddExchangeRate from './AddExchangeRate';
import { ADDITIONAL_MASTERS, ExchangeMaster, EXCHANGE_RATE } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { loggedInUserId } from '../../../helper/auth';
import { getLeftMenu, } from '../../../actions/auth/AuthActions';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import DayTime from '../../common/DayTimeWrapper'
import ConfirmComponent from '../../../helper/ConfirmComponent';
import LoaderCustom from '../../common/LoaderCustom';
import { EXCHANGERATE_DOWNLOAD_EXCEl } from '../../../config/masterData';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

class ExchangeRateListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tableData: [],
            currency: [],
            toggleForm: false,
            shown: false,
            data: { isEditFlag: false, ID: '' },

            ViewAccessibility: false,
            AddAccessibility: false,
            EditAccessibility: false,
            DeleteAccessibility: false,
            BulkUploadAccessibility: false,
            DownloadAccessibility: false,
            gridApi: null,
            gridColumnApi: null,
            rowData: null,
            isLoader: true,
            showPopup: false,
            deletedId: ''
        }
    }

    componentDidMount() {
        this.applyPermission(this.props.topAndLeftMenuData)
        setTimeout(() => {
            this.props.getCurrencySelectList(() => { })
            this.getTableListData()
        }, 500);
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
            const accessData = Data && Data.Pages.find(el => el.PageName === EXCHANGE_RATE)
            const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

            if (permmisionData !== undefined) {
                this.setState({
                    ViewAccessibility: permmisionData && permmisionData.View ? permmisionData.View : false,
                    AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
                    EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
                    DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
                    BulkUploadAccessibility: permmisionData && permmisionData.BulkUpload ? permmisionData.BulkUpload : false,
                    DownloadAccessibility: permmisionData && permmisionData.Download ? permmisionData.Download : false,
                }, () => {
                    setTimeout(() => {
                        this.props.getCurrencySelectList(() => { })
                        this.getTableListData()
                    }, 500);
                })
            }

        }
    }



    /**
    * @method getTableListData
    * @description Get list data
    */
    getTableListData = (currencyId = 0) => {
        this.setState({ isLoader: true })
        let filterData = {
            currencyId: currencyId,
        }
        this.props.getExchangeRateDataList(true, filterData, res => {
            if (res.status === 204 && res.data === '') {
                this.setState({ tableData: [], })
            } else if (res && res.data && res.data.DataList) {
                let Data = res.data.DataList;
                this.setState({ tableData: Data, }, () => { this.setState({ isLoader: false }) })
            } else {

            }
        });
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
        this.setState({ showPopup: true, deletedId: Id })
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeleteItem(Id)
            },
            onCancel: () => { },
            component: () => <ConfirmComponent />
        };
        // return toastr.confirm(MESSAGES.EXCHANGE_DELETE_ALERT, toastrConfirmOptions);
    }


    /**
    * @method confirmDeleteItem
    * @description confirm delete item
    */
    confirmDeleteItem = (ID) => {
        this.props.deleteExchangeRate(ID, (res) => {
            if (res.data.Result === true) {
                Toaster.success(MESSAGES.DELETE_EXCHANGE_SUCCESS);
                this.getTableListData()
            }
        });
        this.setState({ showPopup: false })
    }

    onPopupConfirm = () => {
        this.confirmDeleteItem(this.state.deletedId);
    }
    closePopUp = () => {
        this.setState({ showPopup: false })
    }

    costFormatter = (cell, row, enumObject, rowIndex) => {
        const { initialConfiguration } = this.props
        return cell != null ? checkForDecimalAndNull(cell, initialConfiguration.NoOfDecimalForPrice) : '';
    }
    inputOutputFormatter = (cell, row, enumObject, rowIndex) => {
        const { initialConfiguration } = this.props
        return cell != null ? checkForDecimalAndNull(cell, initialConfiguration.NoOfDecimalForInputOutput) : '';
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



    formToggle = () => {
        this.setState({ toggleForm: true })
    }

    hideForm = () => {

        // this.props.getExchangeRateData('', (res) => { })
        this.setState({
            currency: [],
            data: { isEditFlag: false, ID: '' },
            toggleForm: false,
        }, () => {
            this.getTableListData()
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

        var allColumnIds = [];
        params.columnApi.getAllColumns().forEach(function (column) {
            allColumnIds.push(column.colId);
        });

        window.screen.width >= 1366 && params.api.sizeColumnsToFit()

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

        return this.returnExcelColumn(EXCHANGERATE_DOWNLOAD_EXCEl, this.props.exchangeRateDataList)
    };

    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        TempData && TempData.map((item) => {
            if (item.BankRate === null) {
                item.BankRate = ' '
            } else if (item.BankCommissionPercentage === null) {
                item.BankCommissionPercentage = ' '
            } else if (item.CustomRate === null) {
                item.CustomRate = ' '
            } else {
                return false
            }
            return item
        })
        return (

            <ExcelSheet data={TempData} name={ExchangeMaster}>
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

    frameworkComponents = {
        totalValueRenderer: this.buttonFormatter,
        effectiveDateRenderer: this.effectiveDateFormatter,
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound
    };

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, } = this.props;
        const { toggleForm, data, AddAccessibility, DownloadAccessibility } = this.state;

        if (toggleForm) {
            return (
                <AddExchangeRate
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



        const options = {
            clearSearch: true,
            noDataText: (this.props.exchangeRateDataList === undefined ? <LoaderCustom /> : <NoContentFound title={EMPTY_DATA} />),
            //exportCSVText: 'Download Excel',
            //onExportToCSV: this.onExportToCSV,
            exportCSVBtn: this.createCustomExportCSVButton,
            //paginationShowsTotal: true,
            paginationShowsTotal: this.renderPaginationShowsTotal,
            prePage: <span className="prev-page-pg"></span>, // Previous page button text
            nextPage: <span className="next-page-pg"></span>, // Next page button text
            firstPage: <span className="first-page-pg"></span>, // First page button text
            lastPage: <span className="last-page-pg"></span>,

        };

        return (
            <>
                {/* {this.state.isLoader && <LoaderCustom />} */}
                <div className={`ag-grid-react exchange-rate ${DownloadAccessibility ? "show-table-btn no-tab-page" : ""}`}>
                    <div className="container-fluid">
                        {/* {this.props.loading && <Loader />} */}
                        <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                            {!this.props.isSimulation &&
                                <Row>
                                    <Col md="12"><h1 className="mb-0">Exchange Rate Master</h1></Col>
                                </Row>
                            }

                            <Row className="pt-4 blue-before">

                                <Col md="6" className="search-user-block mb-3">
                                    <div className="d-flex justify-content-end bd-highlight w100">
                                        <div>
                                            {this.state.shown ? (
                                                <button type="button" className="user-btn mr5 filter-btn-top mt3px" onClick={() => this.setState({ shown: !this.state.shown })}>
                                                    <div className="cancel-icon-white"></div></button>
                                            ) : (
                                                ""
                                            )}
                                            {(AddAccessibility && !this.props.isSimulation) && <button
                                                type="button"
                                                className={'user-btn mr5'}
                                                title="Add"
                                                onClick={this.formToggle}>
                                                <div className={'plus mr-0'}></div></button>}
                                            {
                                                DownloadAccessibility &&
                                                <>
                                                    <ExcelFile filename={ExchangeMaster} fileExtension={'.xls'} element={
                                                        <button type="button" className={'user-btn mr5'} title="Download"><div className="download mr-0"></div></button>}>
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
                            <div className="ag-theme-material" style={{ height: '100%', width: '100%' }}>
                                <AgGridReact
                                    defaultColDef={defaultColDef}
                                    floatingFilter={true}
                                    domLayout='autoHeight'
                                    // columnDefs={c}
                                    rowData={this.props.exchangeRateDataList}
                                    pagination={true}
                                    paginationPageSize={10}
                                    onGridReady={this.onGridReady}
                                    gridOptions={gridOptions}
                                    loadingOverlayComponent={'customLoadingOverlay'}
                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                    noRowsOverlayComponentParams={{
                                        title: EMPTY_DATA,
                                    }}
                                    frameworkComponents={this.frameworkComponents}
                                >
                                    <AgGridColumn field="Currency" headerName="Currency" minWidth={155}></AgGridColumn>
                                    <AgGridColumn suppressSizeToFit="true" field="CurrencyExchangeRate" headerName="Exchange Rate(INR)" minWidth={160}></AgGridColumn>
                                    <AgGridColumn field="BankRate" headerName="Bank Rate(INR)" minWidth={160}></AgGridColumn>
                                    <AgGridColumn suppressSizeToFit="true" field="BankCommissionPercentage" headerName="Bank Commission % " minWidth={160}></AgGridColumn>
                                    <AgGridColumn field="CustomRate" headerName="Custom Rate(INR)" minWidth={160}></AgGridColumn>
                                    <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer='effectiveDateRenderer' minWidth={160}></AgGridColumn>
                                    <AgGridColumn suppressSizeToFit="true" field="DateOfModification" headerName="Date of Modification" cellRenderer='effectiveDateRenderer' minWidth={160}></AgGridColumn>
                                    {!this.props.isSimulation && <AgGridColumn suppressSizeToFit="true" field="ExchangeRateId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer='totalValueRenderer' minWidth={160} ></AgGridColumn>}
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
                    </div>
                </div>
                {
                    this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} />
                }
            </ >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ exchangeRate, auth }) {
    const { currencySelectList, exchangeRateDataList } = exchangeRate;
    const { leftMenuData, initialConfiguration, topAndLeftMenuData } = auth;
    return { leftMenuData, currencySelectList, exchangeRateDataList, initialConfiguration, topAndLeftMenuData };
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getExchangeRateDataList,
    deleteExchangeRate,
    getCurrencySelectList,
    getExchangeRateData
})(reduxForm({
    form: 'ExchangeRateListing',
    onSubmitFail: errors => {
        focusOnError(errors);
    },
    enableReinitialize: true,
})(ExchangeRateListing));
