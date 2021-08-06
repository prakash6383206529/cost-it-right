import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { getPlantDataAPI, activeInactiveStatus, deletePlantAPI, getFilteredPlantList } from '../actions/Plant';
import { fetchCountryDataAPI, fetchStateDataAPI, fetchCityDataAPI, } from '../../../actions/Common';
import { focusOnError, searchableSelect } from "../../layout/FormInputs";
import { toastr } from 'react-redux-toastr';
import { MESSAGES } from '../../../config/message';
import { CONSTANT } from '../../../helper/AllConastant';
import NoContentFound from '../../common/NoContentFound';
import { BootstrapTable, TableHeaderColumn, ExportCSVButton } from 'react-bootstrap-table';
import Switch from "react-switch";
import { loggedInUserId } from '../../../helper/auth';
import AddZBCPlant from './AddZBCPlant';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import LoaderCustom from '../../common/LoaderCustom';
import { PlantZbc } from '../../../config/constants';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { ZBCPLANT_DOWNLOAD_EXCEl } from '../../../config/masterData';
import ReactExport from 'react-export-excel';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

class ZBCPlantListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            isOpenVendor: false,
            shown: false,
            ID: '',
            tableData: [],
            city: [],
            country: [],
            state: [],
        }
    }

    componentDidMount() {
        // this.getTableListData();
        this.props.fetchCountryDataAPI(() => { })
        this.filterList()
        //this.props.onRef(this)
    }

    /**
    * @method getTableListData
    * @description Get user list data
    */
    getTableListData = () => {
        this.props.getPlantDataAPI(false, (res) => {
            if (res && res.data && res.status === 200) {
                let Data = res.data.DataList;
                this.setState({ tableData: Data })
            }
        })
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
    * @description confirm delete part
    */
    deleteItem = (Id) => {
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeleteItem(Id);
            },
            onCancel: () => { },
            component: () => <ConfirmComponent />,
        };
        return toastr.confirm(`${MESSAGES.PLANT_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteItem
    * @description confirm delete user item
    */
    confirmDeleteItem = (ID) => {
        this.props.deletePlantAPI(ID, (res) => {
            if (res.data.Result === true) {
                toastr.success(MESSAGES.PLANT_DELETE_SUCCESSFULLY);
                this.filterList()
                //this.getTableListData();
            }
        });
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
                {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
            </>
        )
    };
    handleChange = (cell, row) => {
        let data = {
            Id: row.PlantId,
            ModifiedBy: loggedInUserId(),
            IsActive: !cell, //Status of the user.
        }
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeactivateItem(data, cell)
            },
            onCancel: () => { },
            component: () => <ConfirmComponent />,
        };

        return (
            toastr.confirm(`${cell ? MESSAGES.PLANT_DEACTIVE_ALERT : MESSAGES.PLANT_ACTIVE_ALERT}`, toastrConfirmOptions)
        )
    }

    confirmDeactivateItem = (data, cell) => {
        this.props.activeInactiveStatus(data, res => {
            if (res && res.data && res.data.Result) {
                if (cell == true) {
                    toastr.success(MESSAGES.PLANT_INACTIVE_SUCCESSFULLY)
                } else {
                    toastr.success(MESSAGES.PLANT_ACTIVE_SUCCESSFULLY)
                }
                // this.getTableListData()
                this.filterList()
            }
        })
    }

    /**
    * @method statusButtonFormatter
    * @description Renders buttons
    */
    statusButtonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

        const { ActivateAccessibility } = this.props;
        if (ActivateAccessibility) {
            return (
                <>
                    <label htmlFor="normal-switch">
                        {/* <span>Switch with default style</span> */}
                        <Switch
                            onChange={() => this.handleChange(cellValue, rowData)}
                            checked={cellValue}
                            background="#ff6600"
                            onColor="#4DC771"
                            onHandleColor="#ffffff"
                            offColor="#FC5774"
                            id="normal-switch"
                            height={24}
                        />
                    </label>
                </>
            )
        } else {
            return (
                <>
                    {
                        cellValue ?
                            <div className={'Activated'}> {'Active'}</div>
                            :
                            <div className={'Deactivated'}>{'Deactive'}</div>
                    }
                </>
            )
        }
    }

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

    onExportToCSV = (row) => {
        return this.state.userData; // must return the data which you want to be exported
    }

    renderPaginationShowsTotal(start, to, total) {
        return <GridTotalFormate start={start} to={to} total={total} />
    }

    /**
    * @method selectType
    * @description Used show listing of unit of measurement
    */
    selectType = (label) => {
        const { countryList, stateList, cityList } = this.props;
        const temp = [];

        if (label === 'country') {
            countryList && countryList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'state') {
            stateList && stateList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
        if (label === 'city') {
            cityList && cityList.map(item => {
                if (item.Value === '0') return false;
                temp.push({ label: item.Text, value: item.Value })
                return null;
            });
            return temp;
        }
    }

    /**
    * @method countryHandler
    * @description Used to handle country
    */
    countryHandler = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ country: newValue }, () => {
                const { country } = this.state;
                this.props.fetchStateDataAPI(country.value, () => { })
            });
        } else {
            this.setState({ country: [], state: [], city: [], })
            this.props.fetchStateDataAPI(0, () => { })
        }
    };

    /**
    * @method stateHandler
    * @description Used to handle state
    */
    stateHandler = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ state: newValue }, () => {
                const { state } = this.state;
                this.props.fetchCityDataAPI(state.value, () => { })
            });
        } else {
            this.setState({ state: [], city: [] });
            this.props.fetchCityDataAPI(0, () => { })
        }

    };

    /**
    * @method cityHandler
    * @description Used to handle City
    */
    cityHandler = (newValue, actionMeta) => {
        if (newValue && newValue !== '') {
            this.setState({ city: newValue });
        } else {
            this.setState({ city: [] });
        }
    };

    /**
    * @method filterList
    * @description FILTER DATALIST
    */
    filterList = () => {
        const { country, state, city, } = this.state;
        let filterData = {
            country: country && country.hasOwnProperty('value') ? country.value : '',
            state: state && state.hasOwnProperty('value') ? state.value : '',
            city: city && city.hasOwnProperty('value') ? city.value : '',
            is_vendor: false,
        }
        this.props.getFilteredPlantList(filterData, (res) => {
            if (res.status === 204 && res.data === '') {
                this.setState({ tableData: [], })
            } else if (res && res.data && res.data.DataList) {
                let Data = res.data.DataList;
                this.setState({
                    tableData: Data,
                })
            } else {

            }
        })
    }

    /**
    * @method resetFilter
    * @description Reset user filter
    */
    resetFilter = () => {
        this.setState({ country: [], state: [], city: [], }, () => {
            this.props.fetchStateDataAPI(0, () => { })
            this.props.fetchCityDataAPI(0, () => { })
            this.getTableListData()
        })
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
            //this.getTableListData()
            this.filterList()
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

        return this.returnExcelColumn(ZBCPLANT_DOWNLOAD_EXCEl, tempArr)
    };

    returnExcelColumn = (data = [], TempData) => {
        // let temp = []
        // TempData.map((item) => {
        //     if (item.ECNNumber === null) {
        //         item.ECNNumber = ' '
        //     } else if (item.RevisionNumber === null) {
        //         item.RevisionNumber = ' '
        //     } else if (item.DrawingNumber === null) {
        //         item.DrawingNumber = ' '
        //     } else if (item.Technology === '-') {
        //         item.Technology = ' '
        //     } else {
        //         return false
        //     }
        //     return item
        // })
        return (

            <ExcelSheet data={TempData} name={PlantZbc}>
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
        const { handleSubmit, AddAccessibility, plantZBCList, initialConfiguration, DownloadAccessibility } = this.props;

        const { isEditFlag, isOpenVendor, } = this.state;
        const options = {
            clearSearch: true,
            noDataText: (this.props.plantDataList === undefined ? <LoaderCustom /> : <NoContentFound title={CONSTANT.EMPTY_DATA} />),
            //exportCSVText: 'Download Excel',
            exportCSVBtn: this.createCustomExportCSVButton,
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
            hyphenFormatter: this.hyphenFormatter,
            statusButtonFormatter: this.statusButtonFormatter
        };

        return (
            <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>
                {/* {this.props.loading && <Loader />} */}
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                    <Row className="pt-4">
                        {this.state.shown && (
                            <Col md="8" className="filter-block">
                                <div className="d-inline-flex justify-content-start align-items-top w100">
                                    <div className="flex-fills">
                                        <h5>{`Filter By:`}</h5>
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="CountryId"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={"Country"}
                                            options={this.selectType("country")}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            //validate={(this.state.country == null || this.state.country.length == 0) ? [required] : []}
                                            //required={true}
                                            handleChangeDescription={this.countryHandler}
                                            valueDescription={this.state.country}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="StateId"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={"State"}
                                            options={this.selectType("state")}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            //validate={(this.state.state == null || this.state.state.length == 0) ? [required] : []}
                                            //required={true}
                                            handleChangeDescription={this.stateHandler}
                                            valueDescription={this.state.state}
                                        />
                                    </div>
                                    <div className="flex-fill">
                                        <Field
                                            name="CityId"
                                            type="text"
                                            label=""
                                            component={searchableSelect}
                                            placeholder={"City"}
                                            options={this.selectType("city")}
                                            //onKeyUp={(e) => this.changeItemDesc(e)}
                                            //validate={(this.state.city == null || this.state.city.length == 0) ? [required] : []}
                                            //required={true}
                                            handleChangeDescription={this.cityHandler}
                                            valueDescription={this.state.city}
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
                                        </button>
                                    )}
                                    {
                                        DownloadAccessibility &&
                                        <>
                                            <ExcelFile filename={PlantZbc} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'} title="Download"><div className="download mr-0"></div></button>}>
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
                {/* <BootstrapTable
                    data={this.props.plantDataList}
                    striped={false}
                    hover={false}
                    bordered={false}
                    options={options}
                    search
                    exportCSV={DownloadAccessibility}
                    csvFileName={`${PlantZbc}.csv`}
                    //ignoreSinglePage
                    ref={"table"}
                    trClassName={"userlisting-row"}
                    tableHeaderClass="my-custom-header"
                    pagination
                >
                    <TableHeaderColumn dataField="PlantName" dataAlign="left" dataSort={true}>Plant Name</TableHeaderColumn>
                    <TableHeaderColumn dataField="PlantCode" dataAlign="left" dataSort={true}>Plant Code</TableHeaderColumn>
                    {initialConfiguration && initialConfiguration.IsCompanyConfigureOnPlant && <TableHeaderColumn dataField="CompanyName" dataAlign="left" dataSort={true}>Company</TableHeaderColumn>}
                    <TableHeaderColumn dataField="CountryName" dataAlign="left" dataSort={true}>Country</TableHeaderColumn>
                    <TableHeaderColumn dataField="StateName" dataAlign="left" dataSort={true}>State</TableHeaderColumn>
                    <TableHeaderColumn dataField="CityName" dataAlign="left" dataSort={true}>City</TableHeaderColumn>
                    <TableHeaderColumn dataField="IsActive" dataAlign="left" export={false} dataFormat={this.statusButtonFormatter}>Status</TableHeaderColumn>
                    <TableHeaderColumn dataAlign="right" dataSort={false} searchable={false} className="action" dataField="PlantId" export={false} isKey={true} dataFormat={this.buttonFormatter}>Actions</TableHeaderColumn>
                </BootstrapTable> */}

                <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                    <div className="ag-grid-header">
                        <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
                    </div>
                    <div
                        className="ag-theme-material"
                        
                    >
                        <AgGridReact
                            defaultColDef={defaultColDef}
domLayout='autoHeight'
                            // columnDefs={c}
                            rowData={this.props.plantDataList}
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
                            <AgGridColumn field="PlantName" headerName="Plant Name"></AgGridColumn>
                            <AgGridColumn field="PlantCode" headerName="Plant Code"></AgGridColumn>
                            <AgGridColumn field="CompanyName" headerName="Company Name"></AgGridColumn>
                            <AgGridColumn field="CountryName" headerName="Country"></AgGridColumn>
                            <AgGridColumn field="StateName" headerName="State"></AgGridColumn>
                            <AgGridColumn field="CityName" headerName="City"></AgGridColumn>
                            <AgGridColumn width="100" pinned="right" field="IsActive" headerName="Status" cellRenderer={'statusButtonFormatter'}></AgGridColumn>
                            <AgGridColumn field="PlantId" headerName="Action"  type="rightAligned" cellRenderer={'totalValueRenderer'}></AgGridColumn>
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

                {isOpenVendor && (
                    <AddZBCPlant
                        isOpen={isOpenVendor}
                        closeDrawer={this.closeVendorDrawer}
                        isEditFlag={isEditFlag}
                        ID={this.state.ID}
                        anchor={"right"}
                    />
                )}
            </div>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ comman, auth, plant }) {

    const { countryList, stateList, cityList } = comman;
    const { initialConfiguration } = auth
    const { plantDataList } = plant;
    return { countryList, stateList, cityList, plantDataList, initialConfiguration };
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/

export default connect(mapStateToProps, {
    getPlantDataAPI,
    deletePlantAPI,
    activeInactiveStatus,
    fetchCountryDataAPI,
    fetchStateDataAPI,
    fetchCityDataAPI,
    getFilteredPlantList,
})(reduxForm({
    form: 'ZBCPlantListing',
    onSubmitFail: errors => {
        focusOnError(errors);
    },
    enableReinitialize: true,
})(ZBCPlantListing));
