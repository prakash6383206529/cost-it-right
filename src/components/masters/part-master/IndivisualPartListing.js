import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import { } from '../../../actions/Common';
import { getPartDataList, deletePart, activeInactivePartStatus, checkStatusCodeAPI, } from '../actions/Part';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { defaultPageSize, EMPTY_DATA } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import Switch from "react-switch";
import { loggedInUserId } from '../../../helper/auth';
import BulkUpload from '../../massUpload/BulkUpload';
import { GridTotalFormate } from '../../common/TableGridFunctions';
import LoaderCustom from '../../common/LoaderCustom';
import { ComponentPart } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { INDIVIDUALPART_DOWNLOAD_EXCEl } from '../../../config/masterData';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import WarningMessage from '../../common/WarningMessage'
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import DayTime from '../../common/DayTimeWrapper';
import _ from 'lodash';
import { onFloatingFilterChanged, onSearch, resetState, onBtPrevious, onBtNext, onPageSizeChanged, PaginationWrapper } from '../../common/commonPagination'
import { setSelectedRowForPagination } from '../../simulation/actions/Simulation';
import { searchNocontentFilter } from '../../../helper';
import { disabledClass } from '../../../actions/Common';
import SelectRowWrapper from '../../common/SelectRowWrapper';

const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;


const gridOptions = {

    pagination: true,
    //rowModelType: 'infinite',
    cacheBlockSize: 10, // you can have your custom page size
    paginationPageSize: 10
};



class IndivisualPartListing extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isEditFlag: false,
            isOpen: false,
            tableData: [],
            startIndexCurrentPage: 0,
            endIndexCurrentPage: 9,
            totalRecordCount: 0,
            pageNo: 1,
            pageNoNew: 1,
            floatingFilterData: { Technology: "", PartNumber: "", PartName: "", ECNNumber: "", RevisionNumber: "", DrawingNumber: "", EffectiveDate: "" },
            currentRowIndex: 0,
            warningMessage: false,
            isBulkUpload: false,
            ActivateAccessibility: true,
            isLoader: false,
            showPopup: false,
            deletedId: '',
            globalTake: defaultPageSize,
            pageSize: { pageSize10: true, pageSize50: false, pageSize100: false },
            disableFilter: true,
            disableDownload: false,
            noData: false,
            dataCount: 0
        }
    }


    ApiActionCreator(skip, take, obj, isPagination) {
        this.setState({ isLoader: isPagination ? true : false })

        let constantFilterData = this.state.filterModel
        let object = { ...this.state.floatingFilterData }
        this.props.getPartDataList(skip, take, obj, isPagination, (res) => {
            this.setState({ isLoader: false })
            this.setState({ noData: false })
            if (res.status === 202) {
                this.setState({ pageNo: 0 })
                this.setState({ totalRecordCount: 0 })

                return
            }
            else if (res.status === 204 && res.data === '') {
                this.setState({ tableData: [], })
            } else if (res && res.data && res.data.DataList) {

                let Data = res.data.DataList;

                this.setState({
                    tableData: Data,
                    totalRecordCount: Data[0].TotalRecordCount,

                })
            }
            if (res && res.status === 204) {
                this.setState({ totalRecordCount: 0, pageNo: 0 })
            }

            if (res && isPagination === false) {
                this.setState({ disableDownload: false })
                this.props.disabledClass(false)
                setTimeout(() => {
                    let button = document.getElementById('Excel-Downloads-component-part')
                    button && button.click()
                }, 500);
            }

            if (res) {
                if (res && res.data && res.data.DataList.length > 0) {
                    this.setState({ totalRecordCount: res.data.DataList[0].TotalRecordCount })
                }
                let isReset = true
                setTimeout(() => {

                    for (var prop in object) {
                        if (prop !== "DepartmentCode" && object[prop] !== "") {
                            isReset = false
                        }
                    }
                    // Sets the filter model via the grid API
                    isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(constantFilterData))
                    setTimeout(() => {
                        this.setState({ warningMessage: false })
                    }, 23);

                }, 300);

                setTimeout(() => {
                    this.setState({ warningMessage: false })
                }, 335);

                setTimeout(() => {
                    this.setState({ isFilterButtonClicked: false })
                }, 600);
            }

        })

    }


    componentWillUnmount() {
        this.props.setSelectedRowForPagination([])
    }

    onFloatingFilterChanged = (value) => {
        if (this.props.newPartsListing?.length !== 0) {
            this.setState({ noData: searchNocontentFilter(value, this.state.noData) })
        }
        this.setState({ disableFilter: false })
        onFloatingFilterChanged(value, gridOptions, this)   // COMMON FUNCTION

    }


    onSearch = () => {
        onSearch(gridOptions, this, "Part", this.state.globalTake)  // COMMON PAGINATION FUNCTION
    }

    resetState = () => {
        this.props.setSelectedRowForPagination([])
        resetState(gridOptions, this, "Part")  //COMMON PAGINATION FUNCTION
        this.setState({ dataCount: 0 })

    }

    onBtPrevious = () => {
        onBtPrevious(this, "Part")       //COMMON PAGINATION FUNCTION
    }

    onBtNext = () => {
        onBtNext(this, "Part")   // COMMON PAGINATION FUNCTION

    };

    onPageSizeChanged = (newPageSize) => {

        onPageSizeChanged(this, newPageSize, "Part", this.state.currentRowIndex)  // COMMON PAGINATION FUNCTION
    };



    componentDidMount() {
        setTimeout(() => {
            if (!this.props.stopApiCallOnCancel) {
                this.ApiActionCreator(0, 100, this.state.floatingFilterData, true)
            }
        }, 200);
    }



    // Get updated list after any action performed.
    getUpdatedData = () => {
        setTimeout(() => {
            if (!this.props.stopApiCallOnCancel) {
                this.setState(() => {
                    this.getTableListData()
                })
            }
        }, 200);
    }

    /**
    * @method getTableListData
    * @description Get DATA LIST
    */
    getTableListData = () => {
        this.setState({ isLoader: true })
        this.props.getPartDataList((res) => {
            this.setState({ isLoader: false })
            this.setState({ noData: false })
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
    viewOrEditItemDetails = (Id, isViewMode) => {
        let requestData = {
            isEditFlag: true,
            Id: Id,
            isViewMode: isViewMode,
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
                //this.getTableListData();
                this.ApiActionCreator(this.state.currentRowIndex, 100, this.state.floatingFilterData, true)
                this.setState({ dataCount: 0 })
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

        const { EditAccessibility, DeleteAccessibility, ViewAccessibility } = this.props;
        return (
            <>
                {ViewAccessibility && <button title='View' className="View mr-2" type={'button'} onClick={() => this.viewOrEditItemDetails(cellValue, true)} />}
                {EditAccessibility && <button title='Edit' className="Edit mr-2" type={'button'} onClick={() => this.viewOrEditItemDetails(cellValue, false)} />}
                {DeleteAccessibility && <button title='Delete' className="Delete" type={'button'} onClick={() => this.deleteItem(cellValue)} />}
            </>
        )
    };

    /**
     * @method hyphenFormatter
     */
    hyphenFormatter = (props) => {
        const cellValue = props?.value;



        if (this.props.selectedCostingListSimulation?.length > 0) {
            this.props.selectedCostingListSimulation.map((item) => {
                if (item.PartId === props.node.data.PartId) {
                    props.node.setSelected(true)
                }
                return null
            })

            return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';

        } else {
            return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';

        }
    }


    handleChange = (cell, row, enumObject, rowIndex) => {
        let data = {
            Id: row.PartId,
            ModifiedBy: loggedInUserId(),
            IsActive: !cell, //Status of the user.
        }
        this.props.activeInactivePartStatus(data, res => {
            if (res && res.data && res.data.Result) {

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


    checkBoxRenderer = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        // var selectedRows = gridApi?.getSelectedRows();


        if (this.props.selectedCostingListSimulation?.length > 0) {
            this.props.selectedCostingListSimulation.map((item) => {
                if (item.RawMaterialId === props.node.data.RawMaterialId) {
                    props.node.setSelected(true)
                }
                return null
            })
            return cellValue
        } else {
            return cellValue
        }

    }

    /**
    * @method effectiveDateFormatter
    * @description Renders buttons
    */
    effectiveDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
        // return cellValue != null ? cellValue : '';
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
        this.setState({ isBulkUpload: false })
        this.resetState()
    }

    formToggle = () => {
        this.props.formToggle()
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
        window.screen.width >= 1600 && params.api.sizeColumnsToFit()
        //if resolution greater than 1920 table listing fit to 100%
    };


    onExcelDownload = () => {

        this.setState({ disableDownload: true })
        this.props.disabledClass(true)

        //let tempArr = this.state.gridApi && this.state.gridApi?.getSelectedRows()
        let tempArr = this.props.selectedCostingListSimulation
        if (tempArr?.length > 0) {
            setTimeout(() => {
                this.setState({ disableDownload: false })
                this.props.disabledClass(false)
                let button = document.getElementById('Excel-Downloads-component-part')
                button && button.click()
            }, 400);

        } else {

            this.ApiActionCreator(0, defaultPageSize, this.state.floatingFilterData, false)  // FOR EXCEL DOWNLOAD OF COMPLETE DATA
        }
    }


    onBtExport = () => {

        let tempArr = []
        //tempArr = this.state.gridApi && this.state.gridApi?.getSelectedRows()
        tempArr = this.props.selectedRowForPagination
        tempArr = (tempArr && tempArr.length > 0) ? tempArr : (this.props.allNewPartsListing ? this.props.allNewPartsListing : [])
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

    /**
    * @method render
    * @description Renders the component
    */
    render() {
        const { isBulkUpload, noData } = this.state;
        const { AddAccessibility, BulkUploadAccessibility, DownloadAccessibility } = this.props;
        const ExcelFile = ReactExport.ExcelFile;

        var filterParams = {
            date: "",
            comparator: function (filterLocalDateAtMidnight, cellValue) {
                var dateAsString = cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
                var newDate = filterLocalDateAtMidnight != null ? DayTime(filterLocalDateAtMidnight).format('DD/MM/YYYY') : '';
                setDate(newDate)
                if (dateAsString == null) return -1;
                var dateParts = dateAsString.split('/');
                var cellDate = new Date(
                    Number(dateParts[2]),
                    Number(dateParts[1]) - 1,
                    Number(dateParts[0])
                );
                if (filterLocalDateAtMidnight.getTime() === cellDate.getTime()) {
                    return 0;
                }
                if (cellDate < filterLocalDateAtMidnight) {
                    return -1;
                }
                if (cellDate > filterLocalDateAtMidnight) {
                    return 1;
                }
            },
            browserDatePicker: true,
            minValidYear: 2000,
        };

        var setDate = (date) => {
            this.setState({ floatingFilterData: { ...this.state.floatingFilterData, newDate: date } })

        }

        const isFirstColumn = (params) => {
            var displayedColumns = params.columnApi.getAllDisplayedColumns();
            var thisIsFirstColumn = displayedColumns[0] === params.column;
            return thisIsFirstColumn;

        }

        const onRowSelect = (event) => {

            var selectedRows = this.state.gridApi.getSelectedRows();

            if (selectedRows === undefined || selectedRows === null) {   //CONDITION FOR FIRST RENDERING OF COMPONENT
                selectedRows = this.props.selectedCostingListSimulation
            } else if (this.props.selectedCostingListSimulation && this.props.selectedCostingListSimulation.length > 0) {   // CHECKING IF REDUCER HAS DATA

                let finalData = []
                if (event.node.isSelected() === false) {    // CHECKING IF CURRENT CHECKBOX IS UNSELECTED

                    for (let i = 0; i < this.props.selectedCostingListSimulation.length; i++) {
                        if (this.props.selectedCostingListSimulation[i].PartId === event.data.PartId) {     // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
                            continue;
                        }
                        finalData.push(this.props.selectedCostingListSimulation[i])
                    }

                } else {
                    finalData = this.props.selectedCostingListSimulation
                }
                selectedRows = [...selectedRows, ...finalData]
            }


            let uniqeArray = _.uniqBy(selectedRows, "PartId")           //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
            this.props.setSelectedRowForPagination(uniqeArray)                     //SETTING CHECKBOX STATE DATA IN REDUCER
            this.setState({ dataCount: uniqeArray.length })
            this.setState({ selectedRowData: selectedRows })
        }


        const defaultColDef = {
            resizable: true,
            filter: true,
            sortable: false,
            headerCheckboxSelectionFilteredOnly: true,
            checkboxSelection: isFirstColumn
        };

        const frameworkComponents = {
            totalValueRenderer: this.buttonFormatter,
            customNoRowsOverlay: NoContentFound,
            hyphenFormatter: this.hyphenFormatter,
            effectiveDateFormatter: this.effectiveDateFormatter,
            checkBoxRenderer: this.checkBoxRenderer,
        };
        return (
            <>
                <div className={`ag-grid-react custom-pagination ${DownloadAccessibility ? "show-table-btn" : ""}`}>
                    {this.state.isLoader && <LoaderCustom />}
                    <Row className="pt-4 no-filter-row">
                        <Col md="9" className="search-user-block pr-0">
                            <div className="d-flex justify-content-end bd-highlight w100">
                                {this.state.disableDownload && <div title={MESSAGES.DOWNLOADING_MESSAGE} className="disabled-overflow"><WarningMessage dClass="ml-4 mt-1" message={MESSAGES.DOWNLOADING_MESSAGE} /></div>}
                                <div className="warning-message d-flex align-items-center">
                                    {this.state.warningMessage && !this.state.disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                                </div>
                                <div className='d-flex'>
                                    <button title="Filtered data" type="button" class="user-btn mr5" onClick={() => this.onSearch(this)} disabled={this.state.disableFilter}><div class="filter mr-0"></div></button>
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
                                            {this.state.disableDownload ? <div className='p-relative mr5'> <LoaderCustom customClass={"download-loader"} /> <button type="button" className={'user-btn'}><div className="download mr-0"></div>
                                            </button></div> :

                                                <>
                                                    <button title={`Download ${this.state.dataCount === 0 ? "All" : "(" + this.state.dataCount + ")"}`} type="button" onClick={this.onExcelDownload} className={'user-btn mr5'}><div className="download mr-1" ></div>
                                                        {/* DOWNLOAD */}
                                                        {`${this.state.dataCount === 0 ? "All" : "(" + this.state.dataCount + ")"}`}
                                                    </button>
                                                    <ExcelFile filename={'Component Part'} fileExtension={'.xls'} element={
                                                        <button id={'Excel-Downloads-component-part'} className="p-absolute" type="button" >
                                                        </button>}>
                                                        {this.onBtExport()}
                                                    </ExcelFile>
                                                </>
                                            }
                                        </>
                                    }
                                    <button type="button" className="user-btn" title="Reset Grid" onClick={() => this.resetState()}>
                                        <div className="refresh mr-0"></div>
                                    </button>

                                </div>
                            </div>
                        </Col>
                    </Row>
                    <div className={`ag-grid-wrapper height-width-wrapper ${(this.props.newPartsListing && this.props.newPartsListing?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                        <div className="ag-grid-header">
                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => this.onFilterTextBoxChanged(e)} />
                        </div>
                        <div className={`ag-theme-material ${this.state.isLoader && "max-loader-height"}`}>
                            {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                            <AgGridReact
                                defaultColDef={defaultColDef}
                                floatingFilter={true}
                                domLayout='autoHeight'
                                rowData={this.props.newPartsListing}
                                pagination={true}
                                paginationPageSize={this.state.globalTake}
                                onGridReady={this.onGridReady}
                                gridOptions={gridOptions}
                                onFilterModified={this.onFloatingFilterChanged}
                                rowSelection={'multiple'}
                                onRowSelected={onRowSelect}
                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                noRowsOverlayComponentParams={{
                                    title: EMPTY_DATA,
                                    imagClass: 'imagClass'

                                }}
                                frameworkComponents={frameworkComponents}
                                suppressRowClickSelection={true}
                            >
                                <AgGridColumn field="Technology" headerName="Technology" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                <AgGridColumn field="PartNumber" headerName="Part No."></AgGridColumn>
                                <AgGridColumn field="PartName" headerName="Name"></AgGridColumn>
                                <AgGridColumn field="ECNNumber" headerName="ECN No." cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                <AgGridColumn field="RevisionNumber" headerName="Revision No." cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                <AgGridColumn field="DrawingNumber" headerName="Drawing No." cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                <AgGridColumn field="EffectiveDateNew" headerName="Effective Date" cellRenderer={'effectiveDateFormatter'} filter="agDateColumnFilter" filterParams={filterParams}  ></AgGridColumn>
                                <AgGridColumn field="PartId" headerName="Action" width={160} type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                            </AgGridReact>
                            <div className="button-wrapper">
                                {!this.state.isLoader && <PaginationWrapper gridApi={this.gridApi} setPage={this.onPageSizeChanged} globalTake={this.state.globalTake} />}
                                <div className="d-flex pagination-button-container">
                                    <p><button className="previous-btn" type="button" disabled={this.state.pageNo === 1 ? true : false} onClick={() => this.onBtPrevious(this)}> </button></p>
                                    {this.state.pageSize.pageSize10 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{this.state.pageNo}</span> of {Math.ceil(this.state.totalRecordCount / 10)}</p>}
                                    {this.state.pageSize.pageSize50 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{this.state.pageNo}</span> of {Math.ceil(this.state.totalRecordCount / 50)}</p>}
                                    {this.state.pageSize.pageSize100 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{this.state.pageNo}</span> of {Math.ceil(this.state.totalRecordCount / 100)}</p>}
                                    <p><button className="next-btn" type="button" onClick={() => this.onBtNext(this)}> </button></p>
                                </div>
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
            </>
        );
    }
}

/**
* @method mapStateToProps
* @description return state to component as props
* @param {*} state
*/
function mapStateToProps({ part, auth, simulation }) {
    const { newPartsListing, allNewPartsListing } = part
    const { initialConfiguration } = auth;
    const { selectedCostingListSimulation, selectedRowForPagination } = simulation;

    return { newPartsListing, allNewPartsListing, initialConfiguration, selectedCostingListSimulation, selectedRowForPagination };
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
    setSelectedRowForPagination,
    disabledClass
})(IndivisualPartListing);
