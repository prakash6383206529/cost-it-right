import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { getPlantDataAPI, activeInactiveStatus, getFilteredPlantList, deletePlantAPI } from '../actions/Plant';
import { fetchStateDataAPI, fetchCityDataAPI } from '../../../actions/Common';
import { focusOnError } from "../../layout/FormInputs";
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { defaultPageSize, EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import Switch from "react-switch";
import { loggedInUserId } from '../../../helper/auth';
import AddVBCPlant from './AddVBCPlant';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import LoaderCustom from '../../common/LoaderCustom';
import { PlantVbc } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { VBCPLANT_DOWNLOAD_EXCEl } from '../../../config/masterData';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { PaginationWrapper } from '../../common/commonPagination';
import { showTitleForActiveToggle } from '../../../helper';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

class VBCPlantListing extends Component {
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
            showPopup: false,
            deletedId: '',
            cellData: {},
            cellValue: '',
            showPopupToggle: false,
            isViewMode: false,

        }
    }

    componentDidMount() {
        this.getTableListData();
        this.props.fetchCountryDataAPI(() => { })
    }

    /**
    * @method getTableListData
    * @description Get user list data
    */
    getTableListData = () => {
        this.props.getPlantDataAPI(true, (res) => {
            if (res && res.data && res.status === 200) {
                let Data = res.data.DataList;
                this.setState({ tableData: Data })
            }
        })
    }

    /**
    * @method deleteItem
    * @description confirm delete part
    */
    deleteItem = (Id) => {
        this.setState({ showPopup: true, deletedId: Id })
    }

    /**
    * @method confirmDeleteItem
    * @description confirm delete user item
    */
    confirmDeleteItem = (Id) => {
        this.props.deletePlantAPI(Id, (res) => {
            if (res.data.Result === true) {
                Toaster.success(MESSAGES.PLANT_DELETE_SUCCESSFULLY);
                // this.getTableListData();
                this.filterList()
            }
        });
        this.setState({ showPopup: false })
    }
    onPopupConfirm = () => {
        this.confirmDeleteItem(this.state.deletedId);
    }
    closePopUp = () => {
        this.setState({ showPopup: false })
        this.setState({ showPopupToggle: false })
    }
    onPopupConfirmToggle = () => {
        this.confirmDeactivateItem(this.state.cellData, this.state.cellValue)
    }

    /**
      * @method viewOrEditItemDetails
      * @description confirm edit item
      */
    viewOrEditItemDetails = (Id, isViewMode) => {
        this.setState({
            isOpenVendor: true,
            isEditFlag: true,
            ID: Id,
            isViewMode: isViewMode
        })

    }
    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    buttonFormatter = (cell, row, props) => {
        const cellValue = cell.value;

        const { EditAccessibility, DeleteAccessibility, ViewAccessibility } = this.props;
        return (
            <>
                {ViewAccessibility && <button title='View' className="View mr-2" type={'button'} onClick={() => this.viewOrEditItemDetails(cellValue, true)} />}
                {EditAccessibility && <button className="Edit mr-2" type={'button'} onClick={() => this.viewOrEditItemDetails(cellValue, false)} />}
                {DeleteAccessibility && <button className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
            </>
        )
    }

    handleChange = (cell, row, enumObject, rowIndex) => {
        let data = {
            Id: row.PlantId,
            ModifiedBy: loggedInUserId(),
            IsActive: !cell, //Status of the user.
        }
        this.setState({ showPopupToggle: true, cellData: data, cellValue: cell })
    }

    confirmDeactivateItem = (data, cell) => {
        this.props.activeInactiveStatus(data, res => {
            if (res && res.data && res.data.Result) {
                if (cell === true) {
                    Toaster.success(MESSAGES.PLANT_INACTIVE_SUCCESSFULLY)
                } else {
                    Toaster.success(MESSAGES.PLANT_ACTIVE_SUCCESSFULLY)
                }
                // this.getTableListData()
                this.filterList()
            }
        })
        this.setState({ showPopupToggle: false })
    }

    /**
    * @method statusButtonFormatter
    * @description Renders buttons
    */
    statusButtonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        const { ActivateAccessibility } = this.props;
        showTitleForActiveToggle(props)
        if (ActivateAccessibility) {
            return (
                <>
                    <label htmlFor="normal-switch" className="normal-switch">
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
                            className={cellValue ? "active-switch" : "inactive-switch"}
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
    * @description Filter user listing on the basis of role and department
    */
    filterList = () => {
        const { country, state, city, } = this.state;
        let filterData = {
            country: country && country.hasOwnProperty('value') ? country.value : '',
            state: state && state.hasOwnProperty('value') ? state.value : '',
            city: city && city.hasOwnProperty('value') ? city.value : '',
            is_vendor: true,
        }
        this.props.getFilteredPlantList(filterData, (res) => {
            if (res.status === 204 && res.data === '') {
                this.setState({ tableData: [], isLoader: false })
            } else if (res && res.data && res.data.DataList) {
                let Data = res.data.DataList;
                this.setState({
                    tableData: Data,
                    isLoader: false
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
        this.setState({ isOpenVendor: true, isViewMode: false })
    }

    closeVendorDrawer = (e = '') => {
        this.setState({
            isOpenVendor: false,
            isEditFlag: false,
            ID: '',
        }, () => {
            this.filterList()
            //this.getTableListData()
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
        window.screen.width >= 1600 && params.api.sizeColumnsToFit()
        this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
        params.api.paginationGoToPage(0);
    };

    onPageSizeChanged = (newPageSize) => {
        this.state.gridApi.paginationSetPageSize(Number(newPageSize));
    }

    onBtExport = () => {
        let tempArr = this.props.plantDataList && this.props.plantDataList
        return this.returnExcelColumn(VBCPLANT_DOWNLOAD_EXCEl, tempArr)
    };


    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData && TempData.map((item) => {
            if (item.IsActive === true) {
                item.IsActive = 'Active'
            } else if (item.IsActive === false) {
                item.IsActive = 'In Active'
            }
            return temp;
        })
        return (
            <ExcelSheet data={TempData} name={PlantVbc}>
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

    createCustomExportCSVButton = (onClick) => {
        return (
            <button type="button" className={"user-btn mr5"} onClick={this.onBtExport}><div className={"download"} ></div>Download</button>
        );
    }
    render() {
        const { handleSubmit, AddAccessibility, DownloadAccessibility } = this.props;
        const { isEditFlag, isOpenVendor, } = this.state;

        const defaultColDef = {
            resizable: true,
            filter: true,
            sortable: true,
        };

        const frameworkComponents = {
            totalValueRenderer: this.buttonFormatter,
            customLoadingOverlay: LoaderCustom,
            customNoRowsOverlay: NoContentFound,
            statusButtonFormatter: this.statusButtonFormatter
        };


        return (
            <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>
                {/* {this.props.loading && <Loader />} */}
                <form onSubmit={handleSubmit(this.onSubmit.bind(this))} noValidate>
                    <Row className="pt-4">

                        <Col md="6" className="search-user-block mb-3">
                            <div className="d-flex justify-content-end bd-highlight w100">
                                <div>

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
                                            <ExcelFile filename={PlantVbc} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'} title="Download"><div className="download mr-0"></div></button>}>
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
                <div className={`ag-grid-wrapper height-width-wrapper ${this.props.plantDataList && this.props.plantDataList?.length <= 0 ? "overlay-contain" : ""}`}>
                    <div className="ag-grid-header">
                        <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
                    </div>
                    <div className={`ag-theme-material ${this.state.isLoader && "max-loader-height"}`}>
                        <AgGridReact
                            defaultColDef={defaultColDef}
                            floatingFilter={true}
                            domLayout='autoHeight'
                            // columnDefs={c}
                            rowData={this.props.plantDataList}
                            pagination={true}
                            paginationPageSize={defaultPageSize}
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
                            <AgGridColumn field="VendorName" headerName="Vendor Name" cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                            <AgGridColumn field="PlantName" headerName="Plant Name"></AgGridColumn>
                            <AgGridColumn field="PlantCode" headerName="Plant Code"></AgGridColumn>
                            <AgGridColumn field="CountryName" headerName="Country"></AgGridColumn>
                            <AgGridColumn field="StateName" headerName="State"></AgGridColumn>
                            <AgGridColumn field="CityName" headerName="City"></AgGridColumn>
                            <AgGridColumn width="100" pinned="right" field="IsActive" headerName="Status" cellRenderer={'statusButtonFormatter'}></AgGridColumn>
                            <AgGridColumn field="PlantId" headerName="Action" type="rightAligned" width={"150px"} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                        </AgGridReact>
                        {<PaginationWrapper gridApi={this.gridApi} setPage={this.onPageSizeChanged} />}
                    </div>
                </div>

                {isOpenVendor && <AddVBCPlant
                    isOpen={isOpenVendor}
                    closeDrawer={this.closeVendorDrawer}
                    isEditFlag={isEditFlag}
                    isViewMode={this.state.isViewMode}
                    ID={this.state.ID}
                    anchor={'right'}

                />}
                {
                    this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.PLANT_DELETE_ALERT}`} />
                }
                {
                    this.state.showPopupToggle && <PopupMsgWrapper isOpen={this.state.showPopupToggle} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirmToggle} message={`${this.state.cellValue ? MESSAGES.PLANT_DEACTIVE_ALERT : MESSAGES.PLANT_ACTIVE_ALERT}`} />
                }
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
    const { loading } = auth;
    const { plantDataList } = plant;
    return { loading, countryList, stateList, cityList, plantDataList };
}


/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/

export default connect(mapStateToProps, {
    getPlantDataAPI,
    activeInactiveStatus,
    fetchStateDataAPI,
    fetchCityDataAPI,
    getFilteredPlantList,
    deletePlantAPI,
})(reduxForm({
    form: 'ZBCPlantListing',
    onSubmitFail: errors => {
        focusOnError(errors);
    },
    enableReinitialize: true,
})(VBCPlantListing));
