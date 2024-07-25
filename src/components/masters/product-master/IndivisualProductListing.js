import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { } from '../../../actions/Common';
import { getPartDataList, deletePart, activeInactivePartStatus, checkStatusCodeAPI, } from '../actions/Part';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import Switch from "react-switch";
import DayTime from '../../common/DayTimeWrapper'
import { loggedInUserId } from '../../../helper/auth';
import BulkUpload from '../../massUpload/BulkUpload';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import ConfirmComponent from '../../../helper/ConfirmComponent';
import LoaderCustom from '../../common/LoaderCustom';
import { checkForDecimalAndNull } from '../../../helper';
import { ComponentPart } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { INDIVIDUALPART_DOWNLOAD_EXCEl } from '../../../config/masterData';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

function enumFormatter(cell, row, enumObject) {
    return enumObject[cell];
}

class IndivisualProductListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            isOpen: false,
            tableData: [],

            isBulkUpload: false,
            ActivateAccessibility: true,
            showPopup: false,
            deletedId: '',

        }
    }

    componentDidMount() {
        this.getTableListData();
        //this.props.checkStatusCodeAPI(412, () => { })
    }

    // Get updated list after any action performed.
    getUpdatedData = () => {
        this.getTableListData()
    }

    /**
    * @method getTableListData
    * @description Get DATA LIST
    */
    getTableListData = () => {
        this.props.getPartDataList((res) => {
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
    * @method editItemDetails
    * @description confirm edit item
    */
    editItemDetails = (Id) => {
        let requestData = {
            isEditFlag: true,
            Id: Id,
        }
        this.props.getDetails(requestData)
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
    confirmDeleteItem = (ID) => {
        this.props.deletePart(ID, (res) => {
            if (res.data.Result === true) {
                Toaster.success(MESSAGES.PART_DELETE_SUCCESS);
                this.getTableListData();
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
    * @method hyphenFormatter
    */
    hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }

    handleChange = (cell, row, enumObject, rowIndex) => {
        let data = {
            Id: row.PartId,
            ModifiedBy: loggedInUserId(),
            IsActive: !cell, //Status of the user.
        }
        this.props.activeInactivePartStatus(data, res => {
            if (res && res.data && res.data.Result) {
                // if (cell === true) {
                //     Toaster.success(MESSAGES.PLANT_INACTIVE_SUCCESSFULLY)
                // } else {
                //     Toaster.success(MESSAGES.PLANT_ACTIVE_SUCCESSFULLY)
                // }
                this.getTableListData()
            }
        })
    }

    /**
    * @method statusButtonFormatter
    * @description Renders buttons
    */
    statusButtonFormatter = (cell, row, enumObject, rowIndex) => {
        const { ActivateAccessibility } = this.state;
        if (ActivateAccessibility) {
            return (
                <>
                    <label htmlFor="normal-switch" className="normal-switch">
                        {/* <span>Switch with default style</span> */}
                        <Switch
                            onChange={() => this.handleChange(cell, row, enumObject, rowIndex)}
                            checked={cell}
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
                        cell ?
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

    /**
    * @method effectiveDateFormatter
    * @description Renders buttons
    */
    effectiveDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
    }
    renderEffectiveDate = () => {
        return <> Effective <br /> Date </>
    }

    onExportToCSV = (row) => {
        return this.state.userData; // must return the data which you want to be exported
    }

    renderPaginationShowsTotal(start, to, total) {
        return <GridTotalFormate start={start} to={to} total={total} />
    }

    bulkToggle = () => {
        this.setState({ isBulkUpload: true })
    }

    closeBulkUploadDrawer = () => {
        this.setState({ isBulkUpload: false }, () => {
            this.getTableListData()
        })
    }

    formToggle = () => {
        this.props.formToggle()
    }

    closeBulkUploadDrawer = () => {
        this.setState({ isBulkUpload: false }, () => {
        })
    }



    onGridReady = (params) => {
        this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
        params.api.paginationGoToPage(0);

        // dont remove this
        // var allColumnIds = [];
        // params.columnApi.getAllColumns().forEach(function (column) {
        //     allColumnIds.push(column.colId);
        // });
        // params.columnApi.autoSizeColumns(allColumnIds);
        // dont remove this

        //if resolution greater than 1920 table listing fit to 100%
        window.screen.width >= 1920 && params.api.sizeColumnsToFit()
        //if resolution greater than 1920 table listing fit to 100%
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

        return this.returnExcelColumn(INDIVIDUALPART_DOWNLOAD_EXCEl, tempArr)
    };

    returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData && TempData.map((item) => {
            if (item.ECNNumber === null) {
                item.ECNNumber = ' '
            } else if (item.RevisionNumber === null) {
                item.RevisionNumber = ' '
            } else if (item.DrawingNumber === null) {
                item.DrawingNumber = ' '
            } else if (item.Technology === '-') {
                item.Technology = ' '
            } else {
                return false
            }
            return item
        })
        return (

            <ExcelSheet data={temp} name={ComponentPart}>
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
        const { isBulkUpload } = this.state;
        const { AddAccessibility, BulkUploadAccessibility, DownloadAccessibility } = this.props;

        const onExportToCSV = (row) => {
            // ...
            let products = []
            products = this.props.newPartsListing
            return products; // must return the data which you want to be exported
        }

        const options = {
            clearSearch: true,
            noDataText: (this.props.newPartsListing === undefined ? <LoaderCustom /> : <NoContentFound title={EMPTY_DATA} />),
            //exportCSVText: 'Download Excel',
            //onExportToCSV: this.onExportToCSV,
            //paginationShowsTotal: true,
            exportCSVBtn: this.createCustomExportCSVButton,
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
            effectiveDateFormatter: this.effectiveDateFormatter
        };

        return (
            <div className={`ag-grid-react ${DownloadAccessibility ? "show-table-btn" : ""}`}>
                {/* {this.props.loading && <Loader />} */}

                <Row className="pt-4 no-filter-row">
                    <Col md="8" className="filter-block">

                    </Col>
                    <Col md="6" className="search-user-block pr-0">
                        <div className="d-flex justify-content-end bd-highlight w100">
                            <div>
                                {AddAccessibility && (
                                    <button
                                        type="button"
                                        className={'user-btn mr5'}
                                        title="Add"
                                        onClick={this.formToggle}>
                                        <div className={'plus mr-0'}></div></button>
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

                                        <ExcelFile filename={'Component Part'} fileExtension={'.xls'} element={
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

                <div className={`ag-grid-wrapper height-width-wrapper  ${this.props.newPartsListing && this.props.newPartsListing?.length <= 0 ? "overlay-contain" : ""}`}>
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
                            rowData={this.props.newPartsListing}
                            pagination={true}
                            paginationPageSize={10}
                            onGridReady={this.onGridReady}
                            gridOptions={gridOptions}
                            loadingOverlayComponent={'customLoadingOverlay'}
                            noRowsOverlayComponent={'customNoRowsOverlay'}
                            noRowsOverlayComponentParams={{
                                title: EMPTY_DATA,
                            }}
                            frameworkComponents={frameworkComponents}
                        >
                            <AgGridColumn field="Technology" headerName="Technology" cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                            <AgGridColumn field="PartNumber" headerName="Part No."></AgGridColumn>
                            <AgGridColumn field="PartName" headerName="Name"></AgGridColumn>
                            <AgGridColumn field="ECNNumber" headerName="ECN No." cellRenderer={'hyphenFormatter'}></AgGridColumn>
                            <AgGridColumn field="RevisionNumber" headerName="Revision No." cellRenderer={'hyphenFormatter'}></AgGridColumn>
                            <AgGridColumn field="DrawingNumber" headerName="Drawing No." cellRenderer={'hyphenFormatter'}></AgGridColumn>
                            <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={'effectiveDateFormatter'}></AgGridColumn>
                            <AgGridColumn field="PartId" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
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


                {isBulkUpload && <BulkUpload
                    isOpen={isBulkUpload}
                    closeDrawer={this.closeBulkUploadDrawer}
                    isEditFlag={false}
                    fileName={'PartComponent'}
                    isZBCVBCTemplate={false}
                    messageLabel={'Part'}
                    anchor={'right'}
                />}
                {
                    this.state.showPopup && <PopupMsgWrapper isOpen={this.state.showPopup} closePopUp={this.closePopUp} confirmPopup={this.onPopupConfirm} message={`${MESSAGES.CONFIRM_DELETE}`} />
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
function mapStateToProps({ part, auth }) {
    const { newPartsListing } = part
    const { initialConfiguration } = auth;

    return { newPartsListing, initialConfiguration };
}

/**
* @method connect
* @description connect with redux
* @param {function} mapStateToProps
* @param {function} mapDispatchToProps
*/

export default connect(mapStateToProps, {
    getPartDataList,
    deletePart,
    activeInactivePartStatus,
    checkStatusCodeAPI,
})(IndivisualProductListing);
