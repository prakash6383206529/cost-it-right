import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { focusOnError, searchableSelect } from "../../layout/FormInputs";
import { checkForDecimalAndNull, required } from "../../../helper/validation";
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import { getExchangeRateDataList, deleteExchangeRate, getCurrencySelectList, getExchangeRateData } from '../actions/ExchangeRateMaster';
import AddExchangeRate from './AddExchangeRate';
import { ExchangeMaster, EXCHANGE_RATE } from '../../../config/constants';
import { checkPermission } from '../../../helper/util';
import { reactLocalStorage } from 'reactjs-localstorage';
import { loggedInUserId } from '../../../helper/auth';
import { getLeftMenu, } from '../../../actions/auth/AuthActions';
import moment from 'moment';
import { GridTotalFormate } from '../../common/TableGridFunctions';
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
        }
    }

    componentDidMount() {

        let ModuleId = reactLocalStorage.get('ModuleId');
        this.props.getLeftMenu(ModuleId, loggedInUserId(), (res) => {
            const { leftMenuData } = this.props;
            if (leftMenuData !== undefined) {
                let Data = leftMenuData;
                const accessData = Data && Data.find(el => el.PageName === EXCHANGE_RATE)
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
        this.props.getCurrencySelectList(() => { })
        this.getTableListData()
    }

    /**
    * @method getTableListData
    * @description Get list data
    */
    getTableListData = (currencyId = 0) => {
        let filterData = {
            currencyId: currencyId,
        }
        this.props.getExchangeRateDataList(filterData, res => {
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
        const { currencySelectList } = this.props;
        const temp = [];
        if (label === 'currency') {
            currencySelectList && currencySelectList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
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
            component: () => <ConfirmComponent />
        };
        return toastr.confirm(MESSAGES.EXCHANGE_DELETE_ALERT, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteItem
    * @description confirm delete item
    */
    confirmDeleteItem = (ID) => {
        this.props.deleteExchangeRate(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_EXCHANGE_SUCCESS);
                this.getTableListData()
            }
        });
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
        return cellValue != null ? moment(cellValue).format('DD/MM/YYYY') : '';
    }

    renderEffectiveDate = () => {
        return <> Effective Date </>
    }
    renderExchangeRate = () => {
        return <> Exchange <br /> Rate(INR) </>
    }
    renderBankRate = () => {
        return <> Bank <br /> Rate(INR) </>
    }

    renderBankCommision = () => {
        return <> Bank <br /> Commission % </>
    }

    renderCustomrate = () => {
        return <> Custom <br /> Rate(INR)</>
    }
    renderDateOfModification = () => {
        return <> Date of <br /> Modification</>
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
    * @method handleCurrency
    * @description called
    */
    handleCurrency = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ currency: newValue, });
        } else {
            this.setState({ currency: [], })
        }
    };

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

    /**
    * @method costingHeadFormatter
    * @description Renders Costing head
    */
    costingHeadFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cellValue === true || cellValue === 'Vendor Based') ? 'Vendor Based' : 'Zero Based';
    }

    onExportToCSV = (row) => {
        // ...
        return this.state.userData; // must return the data which you want to be exported
    }

    renderPaginationShowsTotal(start, to, total) {
        return <GridTotalFormate start={start} to={to} total={total} />
    }

    /**
    * @method filterList
    * @description Filter user listing on the basis of role and department
    */
    filterList = () => {
        const { currency, } = this.state;
        const currencyTemp = currency ? currency.value : 0;
        this.getTableListData(currencyTemp)
    }

    /**
    * @method resetFilter
    * @description Reset user filter
    */
    resetFilter = () => {
        this.setState({
            currency: [],
        }, () => {
            this.getTableListData()
        })
    }

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

        return this.returnExcelColumn(EXCHANGERATE_DOWNLOAD_EXCEl, tempArr)
    };

    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        TempData.map((item) => {
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
    }



    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, } = this.props;
        const { toggleForm, data, AddAccessibility, DownloadAccessibility } = this.state;
        const ExcelFile = ReactExport.ExcelFile;

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

        const frameworkComponents = {
            totalValueRenderer: this.buttonFormatter,
            effectiveDateRenderer: this.effectiveDateFormatter,
            customLoadingOverlay: LoaderCustom,
            customNoRowsOverlay: NoContentFound
        };
        const options = {
            clearSearch: true,
            noDataText: (this.props.exchangeRateDataList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
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

        return (
            <>
                {/* <div className=""> */}
                <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>

                    {/* {this.props.loading && <Loader />} */}
                    <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                        <Row>
                            <Col md="12"><h1 className="mb-0">Exchange Rate Master</h1></Col>
                        </Row>
                        <Row className="pt-4 blue-before">
                            {this.state.shown && (
                                <Col md="7" className="filter-block">
                                    <div className="d-inline-flex justify-content-start align-items-top w100">
                                        <div className="flex-fills"><h5>{`Filter By:`}</h5></div>
                                        <div className="flex-fill">
                                            <Field
                                                name="Currency"
                                                type="text"
                                                label=""
                                                component={searchableSelect}
                                                placeholder={'Select Currency'}
                                                isClearable={false}
                                                options={this.renderListing('currency')}
                                                //onKeyUp={(e) => this.changeItemDesc(e)}
                                                validate={(this.state.currency == null || this.state.currency.length === 0) ? [required] : []}
                                                required={true}
                                                handleChangeDescription={this.handleCurrency}
                                                valueDescription={this.state.currency}
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
                                            <button type="button" className="user-btn mr5 filter-btn-top mt3px" onClick={() => this.setState({ shown: !this.state.shown })}>
                                                <div className="cancel-icon-white"></div></button>
                                        ) : (
                                            <button type="button" className="user-btn mr5" onClick={() => this.setState({ shown: !this.state.shown })}>Show Filter</button>
                                        )}
                                        {AddAccessibility && <button
                                            type="button"
                                            className={'user-btn mr5'}
                                            onClick={this.formToggle}>
                                            <div className={'plus'}></div>ADD</button>}
                                        {
                                            DownloadAccessibility &&
                                            <>
                                                <ExcelFile filename={ExchangeMaster} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div>DOWNLOAD</button>}>
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
                        data={this.props.exchangeRateDataList}
                        striped={false}
                        hover={false}
                        bordered={false}
                        options={options}
                        search
                        exportCSV={DownloadAccessibility}
                        csvFileName={`${ExchangeMaster}.csv`}
                        //ignoreSinglePage
                        ref={'table'}
                        trClassName={'userlisting-row'}
                        tableHeaderClass='my-custom-header'
                        pagination>
                        <TableHeaderColumn dataField="Currency" width={90} columnTitle={true} dataAlign="left" dataSort={true} >{'Currency'}</TableHeaderColumn>
                        <TableHeaderColumn dataField="CurrencyExchangeRate" width={120} columnTitle={true} dataAlign="left" >{this.renderExchangeRate()}</TableHeaderColumn>
                        <TableHeaderColumn dataField="BankRate" width={110} columnTitle={true} dataAlign="left" >{this.renderBankRate()}</TableHeaderColumn>
                        <TableHeaderColumn dataField="BankCommissionPercentage" width={160} columnTitle={true} dataAlign="left" >{this.renderBankCommision()}</TableHeaderColumn>
                        <TableHeaderColumn dataField="CustomRate" width={150} columnTitle={true} dataAlign="left" >{this.renderCustomrate()}</TableHeaderColumn>
                        <TableHeaderColumn dataField="EffectiveDate" width={160} columnTitle={true} dataAlign="left" dataSort={true} dataFormat={this.effectiveDateFormatter} >{this.renderEffectiveDate()}</TableHeaderColumn>
                        <TableHeaderColumn dataField="DateOfModification" width={130} columnTitle={true} dataAlign="left" dataFormat={this.effectiveDateFormatter} >{this.renderDateOfModification()}</TableHeaderColumn>
                        <TableHeaderColumn dataAlign="right" searchable={false} className="action" width={100} dataField="ExchangeRateId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
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
                                rowData={this.props.exchangeRateDataList}
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
                                <AgGridColumn field="Currency" headerName="Currency"></AgGridColumn>
                                <AgGridColumn field="CurrencyExchangeRate" headerName="Exchange Rate(INR)"></AgGridColumn>
                                <AgGridColumn field="BankRate" headerName="Bank Rate(INR)"></AgGridColumn>
                                <AgGridColumn field="BankCommissionPercentage" headerName="Bank Commission % "></AgGridColumn>
                                <AgGridColumn field="CustomRate" headerName="Custom Rate(INR)"></AgGridColumn>
                                <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={'effectiveDateRenderer'}></AgGridColumn>
                                <AgGridColumn field="DateOfModification" headerName="Date of Modification" cellRenderer={'effectiveDateRenderer'}></AgGridColumn>
                                <AgGridColumn field="ExchangeRateId" headerName="Action" cellRenderer={'totalValueRenderer'}></AgGridColumn>
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
    const { leftMenuData, initialConfiguration } = auth;
    return { leftMenuData, currencySelectList, exchangeRateDataList, initialConfiguration };
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
    getLeftMenu,
    getExchangeRateData
})(reduxForm({
    form: 'ExchangeRateListing',
    onSubmitFail: errors => {
        focusOnError(errors);
    },
    enableReinitialize: true,
})(ExchangeRateListing));
