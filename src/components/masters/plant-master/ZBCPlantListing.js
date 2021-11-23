import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Field, reduxForm } from "redux-form";
import { Row, Col, } from 'reactstrap';
import { getPlantDataAPI, activeInactiveStatus, deletePlantAPI, getFilteredPlantList } from '../actions/Plant';
import { fetchCountryDataAPI, fetchStateDataAPI, fetchCityDataAPI, } from '../../../actions/Common';
import { focusOnError, searchableSelect } from "../../layout/FormInputs";
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
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
import PopupMsgWrapper from '../../common/PopupMsgWrapper';

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
            showPopup:false,
            deletedId:'',
           
            cellData:{},
            cellValue:'',
            showPopupToggle:false
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
        this.setState({showPopup:true, deletedId:Id })
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeleteItem(Id);
            },
            onCancel: () => { },
            component: () => <ConfirmComponent />,
        };
        // return Toaster.confirm(`${MESSAGES.PLANT_DELETE_ALERT}`, toastrConfirmOptions);
    }

    /**
    * @method confirmDeleteItem
    * @description confirm delete user item
    */
    confirmDeleteItem = (ID) => {
        this.props.deletePlantAPI(ID, (res) => {
            if (res.data.Result === true) {
                Toaster.success(MESSAGES.PLANT_DELETE_SUCCESSFULLY);
                this.filterList()
                //this.getTableListData();
            }
        });
        this.setState({showPopup:false})
    }
    onPopupConfirm =() => {        
            this.confirmDeleteItem(this.state.deletedId);         
    }
    closePopUp= () =>{
        this.setState({showPopup:false})
        this.setState({showPopupToggle:false})
      }
      onPopupConfirmToggle =() => {        
        this.confirmDeactivateItem(this.state.cellData, this.state.cellValue)      
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
        this.setState({showPopupToggle:true, cellData:data, cellValue:cell})
        const toastrConfirmOptions = {
            onOk: () => {
                this.confirmDeactivateItem(data, cell)
            },
            onCancel: () => { },
            component: () => <ConfirmComponent />,
        };
// this.setState({isTogglePopup:true})
    //     return (
    //     //     Toaster.confirm(`${cell ? MESSAGES.PLANT_DEACTIVE_ALERT : MESSAGES.PLANT_ACTIVE_ALERT}`, toastrConfirmOptions)
    //  <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${cell?MESSAGES.PLANT_DEACTIVE_ALERT:MESSAGES.PLANT_ACTIVE_ALERT}`}  />
    //     )
    }

    confirmDeactivateItem = (data, cell) => {
        this.props.activeInactiveStatus(data, res => {
            if (res && res.data && res.data.Result) {
                if (cell == true) {
                    Toaster.success(MESSAGES.PLANT_INACTIVE_SUCCESSFULLY)
                } else {
                    Toaster.success(MESSAGES.PLANT_ACTIVE_SUCCESSFULLY)
                }
                // this.getTableListData()
                this.filterList()
            }
        })
        this.setState({showPopupToggle:false})
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

        return this.returnExcelColumn(ZBCPLANT_DOWNLOAD_EXCEl, this.props.plantDataList)
    };

    returnExcelColumn = (data = [], TempData) => {

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
        gridOptions.api.setFilterModel(null);
    }


    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { handleSubmit, AddAccessibility, plantZBCList, initialConfiguration, DownloadAccessibility } = this.props;

        const { isEditFlag, isOpenVendor,isDeletePopoup,isTogglePopup } = this.state;
        const options = {
            clearSearch: true,
            noDataText: (this.props.plantDataList === undefined ? <LoaderCustom /> : <NoContentFound title={EMPTY_DATA} />),
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

                        <Col md="6" className="search-user-block mb-3">
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
                            rowData={this.props.plantDataList}
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
                            <AgGridColumn field="PlantName" headerName="Plant Name"></AgGridColumn>
                            <AgGridColumn field="PlantCode" headerName="Plant Code"></AgGridColumn>
                            <AgGridColumn field="CompanyName" headerName="Company Name"></AgGridColumn>
                            <AgGridColumn field="CountryName" headerName="Country"></AgGridColumn>
                            <AgGridColumn field="StateName" headerName="State"></AgGridColumn>
                            <AgGridColumn field="CityName" headerName="City"></AgGridColumn>
                            <AgGridColumn width="130" pinned="right" field="IsActive" headerName="Status" floatingFilter={false} cellRenderer={'statusButtonFormatter'}></AgGridColumn>
                            <AgGridColumn field="PlantId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
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
                {
            this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.PLANT_DELETE_ALERT}`}  />
            
            // `${cell ? MESSAGES.PLANT_DEACTIVE_ALERT : MESSAGES.PLANT_ACTIVE_ALERT}`
        }
        {
            this.state.showPopupToggle && <PopupMsgWrapper isOpen={this.state.showPopupToggle} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirmToggle} message={`${this.state.cellValue ? MESSAGES.PLANT_DEACTIVE_ALERT : MESSAGES.PLANT_ACTIVE_ALERT}`}  />
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
