import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { focusOnError, } from "../../layout/FormInputs";
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { getClientDataList, deleteClient } from '../actions/Client';
import AddClientDrawer from './AddClientDrawer';
import { checkPermission } from '../../../helper/util';
import { CLIENT, Clientmaster, MASTERS } from '../../../config/constants';
import { getLeftMenu, } from '../../../actions/auth/AuthActions';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import LoaderCustom from '../../common/LoaderCustom';
import ReactExport from 'react-export-excel';
import { CLIENT_DOWNLOAD_EXCEl } from '../../../config/masterData';
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

class ClientListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            isOpenVendor: false,
            tableData: [],
            ID: '',

            AddAccessibility: false,
            EditAccessibility: false,
            DeleteAccessibility: false,
            DownloadAccessibility: false,
            gridApi: null,
            gridColumnApi: null,
            rowData: null,
            sideBar: { toolPanels: ['columns'] },
            showData: false

        }
    }

    componentDidMount() {
        this.applyPermission(this.props.topAndLeftMenuData)
        setTimeout(() => {
            this.getTableListData(null, null)
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
            const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === MASTERS);
            const accessData = Data && Data.Pages.find(el => el.PageName === CLIENT)
            const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)

            if (permmisionData !== undefined) {
                this.setState({
                    AddAccessibility: permmisionData && permmisionData.Add ? permmisionData.Add : false,
                    EditAccessibility: permmisionData && permmisionData.Edit ? permmisionData.Edit : false,
                    DeleteAccessibility: permmisionData && permmisionData.Delete ? permmisionData.Delete : false,
                    DownloadAccessibility: permmisionData && permmisionData.Download ? permmisionData.Download : false,
                })
            }
        }
    }

    // Get updated Supplier's list after any action performed.
    getUpdatedData = () => {
        this.getTableListData(null, null)
    }

    /**
    * @method getTableListData
    * @description Get user list data
    */
    getTableListData = (clientName = null, companyName = null) => {
        let filterData = {
            clientName: clientName,
            companyName: companyName,
        }
        this.props.getClientDataList(filterData, res => {
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
                this.confirmDeleteItem(Id)
            },
            onCancel: () => { },
            component: () => <ConfirmComponent />,
        };
        return toastr.confirm(MESSAGES.CLIENT_DELETE_ALERT, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteItem
    * @description confirm delete item
    */
    confirmDeleteItem = (ID) => {
        this.props.deleteClient(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.DELETE_CLIENT_SUCCESS);
                this.getTableListData(null, null)
            }
        });
    }

    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    buttonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

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
        return cellValue != null ? cellValue : '-';
    }

    /**
    * @method handlePlant
    * @description called
    */
    handlePlant = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ plant: newValue });
        } else {
            this.setState({ plant: [] })
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

    renderSerialNumber = () => {
        return <>Sr. <br />No. </>
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
    * @description Filter DATALIST
    */
    filterList = () => {
        this.getTableListData(null, null)
    }

    /**
    * @method resetFilter
    * @description RESET FILTERS
    */
    resetFilter = () => {
        this.getTableListData(null, null)
    }

    formToggle = () => {
        this.setState({ isOpenVendor: true })
    }

    closeVendorDrawer = (e = '') => {
        this.setState({
            isOpenVendor: false,
            isEditFlag: false,
            ID: '',
        }, () => {
            this.getTableListData(null, null)
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
        data && data.map((item => {
            tempArr.push(item.data)
        }))

        return this.returnExcelColumn(CLIENT_DOWNLOAD_EXCEl, this.props.clientDataList)
    };

    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        TempData.map((item) => {
            if (item.ClientName === null) {
                item.ClientName = ' '
            } else {
                return false
            }
            return item
        })
        return (

            <ExcelSheet data={TempData} name={Clientmaster}>
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
        const { handleSubmit, } = this.props;
        const { isOpenVendor, isEditFlag, AddAccessibility, DownloadAccessibility } = this.state;
        const ExcelFile = ReactExport.ExcelFile;

        const options = {
            clearSearch: true,
            noDataText: (this.props.clientDataList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
            //exportCSVText: 'Download Excel',
            // exportCSVBtn: this.createCustomExportCSVButton,
            // onExportToCSV: this.handleExportCSVButtonClick,
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
            hyphenFormatter: this.hyphenFormatter
        };

        return (
            // <div className="">
            <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>

                {/* {this.props.loading && <Loader />} */}
                < div className="container-fluid" >
                    <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                        <h1 className="mb-0">Customer Master</h1>
                        <Row className="pt-4 no-filter-row">
                            <Col md="10" className="filter-block"></Col>
                            <Col md="2" className="search-user-block">
                                <div className="d-flex justify-content-end bd-highlight">
                                    {AddAccessibility && (
                                        <button
                                            type="button"
                                            className={"user-btn mr5"}
                                            onClick={this.formToggle}
                                            title="Add"
                                        >
                                            <div className={"plus mr-0"}></div>
                                        </button>
                                    )}
                                    {
                                        DownloadAccessibility &&
                                        <>
                                            <ExcelFile filename={Clientmaster} fileExtension={'.xls'} element={<button type="button" title="Download" className={'user-btn mr5'}><div className="download mr-0"></div></button>}>
                                                {this.onBtExport()}
                                            </ExcelFile>
                                        </>
                                        //   <button type="button" className={"user-btn mr5"} onClick={this.onBtExport}><div className={"download"} ></div>Download</button>
                                    }

                                    <button type="button" className="user-btn" title="Reset Grid" onClick={() => this.resetState()}>
                                        <div className="refresh mr-0"></div>
                                    </button>

                                </div>
                            </Col>
                        </Row>

                    </form>



                    <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                        <div className="ag-grid-header">
                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => this.onFilterTextBoxChanged(e)} />
                        </div>
                        <div
                            className="ag-theme-material"
                            style={{ height: '100%', width: '100%' }}
                        >
                            <AgGridReact
                                defaultColDef={defaultColDef}
                                domLayout='autoHeight'
                                // columnDefs={c}
                                rowData={this.props.clientDataList}
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
                                <AgGridColumn field="CompanyName" headerName="Company"></AgGridColumn>
                                <AgGridColumn field="ClientName" headerName="Contact Name" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                <AgGridColumn field="ClientEmailId" headerName="Email Id"></AgGridColumn>
                                <AgGridColumn field="CountryName" headerName="Country"></AgGridColumn>
                                <AgGridColumn field="StateName" headerName="State"></AgGridColumn>
                                <AgGridColumn field="CityName" headerName="City"></AgGridColumn>
                                <AgGridColumn field="ClientId" headerName="Action" type="rightAligned" cellRenderer={'totalValueRenderer'}></AgGridColumn>
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
                        isOpenVendor && <AddClientDrawer
                            isOpen={isOpenVendor}
                            closeDrawer={this.closeVendorDrawer}
                            isEditFlag={isEditFlag}
                            ID={this.state.ID}
                            anchor={'right'}
                        />
                    }
                </div >
            </div >
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ comman, auth, client }) {
    const { loading, } = comman;
    const { leftMenuData, topAndLeftMenuData } = auth;
    const { clientDataList } = client;
    return { loading, leftMenuData, clientDataList, topAndLeftMenuData };
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/
export default connect(mapStateToProps, {
    getClientDataList,
    deleteClient,
    getLeftMenu,
})(reduxForm({
    form: 'ClientListing',
    onSubmitFail: errors => {
        focusOnError(errors);
    },
    enableReinitialize: true,
})(ClientListing));
