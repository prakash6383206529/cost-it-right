import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import {
    getProfitDataList, deleteProfit, activeInactiveProfit,
} from '../actions/OverheadProfit';
import { EMPTY_DATA, defaultPageSize } from '../../../config/constants';
import { getConfigurationKey, loggedInUserId, searchNocontentFilter, } from '../../../helper';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import Switch from "react-switch";
import { PROFIT_DOWNLOAD_EXCEl } from '../../../config/masterData';
import LoaderCustom from '../../common/LoaderCustom';
import DayTime from '../../common/DayTimeWrapper'
import { ProfitMaster } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { PaginationWrapper } from '../../common/commonPagination';
import WarningMessage from '../../common/WarningMessage';
import { setSelectedRowForPagination } from '../../simulation/actions/Simulation';
import _ from 'lodash';
import SingleDropdownFloationFilter from '../material-master/SingleDropdownFloationFilter';
import { agGridStatus, getGridHeight, isResetClick, disabledClass } from '../../../actions/Common';
import SelectRowWrapper from '../../common/SelectRowWrapper';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

function ProfitListing(props) {

    const { EditAccessibility, DeleteAccessibility, ViewAccessibility } = props

    const [tableData, setTableData] = useState([])
    const dispatch = useDispatch()
    const [showPopup, setShowPopup] = useState(false)
    const [deletedId, setDeletedId] = useState('')
    const [isLoader, setIsLoader] = useState(false)
    const [noData, setNoData] = useState(false)
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [selectedRowData, setSelectedRowData] = useState([])
    const [disableDownload, setDisableDownload] = useState(false)

    //STATES BELOW ARE MADE FOR PAGINATION PURPOSE
    const [disableFilter, setDisableFilter] = useState(true)
    const [warningMessage, setWarningMessage] = useState(false)
    const [globalTake, setGlobalTake] = useState(defaultPageSize)
    const [filterModel, setFilterModel] = useState({});
    const [pageNo, setPageNo] = useState(1)
    const [pageNoNew, setPageNoNew] = useState(1)
    const [totalRecordCount, setTotalRecordCount] = useState(1)
    const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false)
    const [currentRowIndex, setCurrentRowIndex] = useState(0)
    const [dataCount, setDataCount] = useState(0)
    const [pageSize, setPageSize] = useState({ pageSize10: true, pageSize50: false, pageSize100: false })
    const [floatingFilterData, setFloatingFilterData] = useState({ CostingHead: "", TechnologyName: "", RawMaterial: "", RMGrade: "", RMSpec: "", RawMaterialCode: "", Category: "", MaterialType: "", Plant: "", UOM: "", VendorName: "", BasicRate: "", ScrapRate: "", RMFreightCost: "", RMShearingCost: "", NetLandedCost: "", EffectiveDateNew: "", })
    let overheadProfitList = useSelector((state) => state.overheadProfit.overheadProfitList)
    let overheadProfitListAll = useSelector((state) => state.overheadProfit.overheadProfitListAll)
    const statusColumnData = useSelector((state) => state.comman.statusColumnData);
    const { selectedRowForPagination } = useSelector((state => state.simulation))

    var filterParams = {
        comparator: function (filterLocalDateAtMidnight, cellValue) {
            var dateAsString = cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
            var newDate = filterLocalDateAtMidnight != null ? DayTime(filterLocalDateAtMidnight).format('DD/MM/YYYY') : '';
            setFloatingFilterData({ ...floatingFilterData, EffectiveDateNew: newDate })
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

    var floatingFilterProfit = {
        maxValue: 2,
        suppressFilterButton: true,
        component: 'profit'
    }

    useEffect(() => {
        setTimeout(() => {
            if (!props.stopApiCallOnCancel) {
                getDataList(null, null, null, null, 0, 10, true, floatingFilterData)
            }
        }, 300);
        dispatch(isResetClick(false, "applicablity"))
        dispatch(agGridStatus("", ""))

    }, [])


    useEffect(() => {
        if (overheadProfitList?.length > 0) {
            setTotalRecordCount(overheadProfitList[0].TotalRecordCount)
        }
        else {
            setNoData(false)
        }
        dispatch(getGridHeight({ value: overheadProfitList?.length, component: 'profit' }))
    }, [overheadProfitList])

    useEffect(() => {

        if (statusColumnData) {
            setDisableFilter(false)
            setWarningMessage(true)
            setFloatingFilterData(prevState => ({ ...prevState, ProfitApplicabilityType: encodeURIComponent(statusColumnData.data) }))
        }
    }, [statusColumnData])

    const getDataList = (costingHead = null, vendorName = null, overhead = null, modelType = null, skip = 0, take = 10, isPagination = true, dataObj) => {
        const filterData = {
            costing_head: costingHead,
            vendor_id: vendorName,
            profit_applicability_type_id: overhead,
            model_type_id: modelType,
        }
        if (isPagination === true) {
            setIsLoader(true)
        }
        let obj = { ...dataObj }
        dispatch(getProfitDataList(filterData, skip, take, isPagination, dataObj, (res) => {
            setIsLoader(false)
            if (res && res.status === 204) {
                setTotalRecordCount(0)
                setPageNo(0)
            }
            if (res && res.status === 200) {
                let Data = res.data.DataList;
                setTableData(Data)
            } else if (res && res.response && res.response.status === 412) {
                setTableData([])
            } else {
                setTableData([])
            }

            if (res && isPagination === false) {
                setDisableDownload(false)
                dispatch(disabledClass(false))
                setTimeout(() => {
                    let button = document.getElementById('Excel-Downloads-profit')
                    button && button.click()
                }, 500);
            }

            if (res) {
                let isReset = true
                setTimeout(() => {
                    for (var prop in obj) {
                        if (obj[prop] !== "") {
                            isReset = false
                        }
                    }
                    // Sets the filter model via the grid API
                    isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(filterModel))
                }, 300);

                setTimeout(() => {
                    setWarningMessage(false)
                    if (take == 100) {
                        setTimeout(() => {
                            setWarningMessage(false)
                        }, 100);
                    }
                    dispatch(isResetClick(false, "applicablity"))
                }, 330);

                setTimeout(() => {
                    setIsFilterButtonClicked(false)
                }, 600);
            }
        }))
    }


    const onFloatingFilterChanged = (value) => {
        if (overheadProfitList?.length !== 0) {
            setNoData(searchNocontentFilter(value, noData))
        }
        setDisableFilter(false)
        const model = gridOptions?.api?.getFilterModel();
        setFilterModel(model)
        if (!isFilterButtonClicked) {
            setWarningMessage(true)
        }

        if (value?.filterInstance?.appliedModel === null || value?.filterInstance?.appliedModel?.filter === "") {
            let isFilterEmpty = true

            if (model !== undefined && model !== null) {
                if (Object.keys(model).length > 0) {
                    isFilterEmpty = false

                    for (var property in floatingFilterData) {

                        if (property === value.column.colId) {
                            floatingFilterData[property] = ""
                        }
                    }
                    setFloatingFilterData(floatingFilterData)
                }

                if (isFilterEmpty) {
                    setWarningMessage(false)
                    for (var prop in floatingFilterData) {

                        floatingFilterData[prop] = ""
                    }
                    setFloatingFilterData(floatingFilterData)
                }
            }

        } else {

            if (value.column.colId === "EffectiveDateNew" || value.column.colId === "CreatedDate" || value.column.colId === "EffectiveDate") {
                return false
            }

            let valueString = value?.filterInstance?.appliedModel?.filter
            if (valueString.includes("+")) {
                valueString = encodeURIComponent(valueString)
            }
            setFloatingFilterData({ ...floatingFilterData, [value.column.colId]: valueString })
        }
    }


    const onSearch = () => {

        setWarningMessage(false)
        setIsFilterButtonClicked(true)
        setPageNo(1)
        setPageNoNew(1)
        setCurrentRowIndex(0)
        gridOptions?.columnApi?.resetColumnState();
        getDataList(null, null, null, null, 0, globalTake, true, floatingFilterData)
    }



    const resetState = () => {
        dispatch(agGridStatus("", ""))
        dispatch(isResetClick(true, "applicablity"))
        setIsFilterButtonClicked(false)
        gridApi.deselectAll()
        gridOptions?.columnApi?.resetColumnState(null);
        gridOptions?.api?.setFilterModel(null);

        for (var prop in floatingFilterData) {
            floatingFilterData[prop] = ""

        }

        setFloatingFilterData(floatingFilterData)
        setWarningMessage(false)
        setPageNo(1)
        setPageNoNew(1)
        setCurrentRowIndex(0)
        getDataList(null, null, null, null, 0, 10, true, floatingFilterData)
        dispatch(setSelectedRowForPagination([]))
        setGlobalTake(10)
        setPageSize(prevState => ({ ...prevState, pageSize10: true, pageSize50: false, pageSize100: false }))
        setDataCount(0)
    }


    const onBtPrevious = () => {
        if (currentRowIndex >= 10) {
            setPageNo(pageNo - 1)
            setPageNoNew(pageNo - 1)
            const previousNo = currentRowIndex - 10;
            getDataList(null, null, null, null, previousNo, globalTake, true, floatingFilterData)
            setCurrentRowIndex(previousNo)
        }
    }

    const onBtNext = () => {

        if (pageSize.pageSize50 && pageNo >= Math.ceil(totalRecordCount / 50)) {
            return false
        }

        if (pageSize.pageSize100 && pageNo >= Math.ceil(totalRecordCount / 100)) {
            return false
        }

        if (currentRowIndex < (totalRecordCount - 10)) {
            setPageNo(pageNo + 1)
            setPageNoNew(pageNo + 1)
            const nextNo = currentRowIndex + 10;
            getDataList(null, null, null, null, nextNo, globalTake, true, floatingFilterData)
            setCurrentRowIndex(nextNo)
        }
    };


    const onPageSizeChanged = (newPageSize) => {

        if (Number(newPageSize) === 10) {
            getDataList(null, null, null, null, currentRowIndex, 10, true, floatingFilterData)
            setPageSize(prevState => ({ ...prevState, pageSize10: true, pageSize50: false, pageSize100: false }))
            setGlobalTake(10)
            setPageNo(pageNoNew)
        }
        else if (Number(newPageSize) === 50) {
            getDataList(null, null, null, null, currentRowIndex, 50, true, floatingFilterData)
            setPageSize(prevState => ({ ...prevState, pageSize50: true, pageSize10: false, pageSize100: false }))
            setGlobalTake(50)
            if (pageNo >= Math.ceil(totalRecordCount / 50)) {
                setPageNo(Math.ceil(totalRecordCount / 50))
                getDataList(null, null, null, null, 0, 50, true, floatingFilterData)
            }
        }
        else if (Number(newPageSize) === 100) {
            getDataList(null, null, null, null, currentRowIndex, 100, true, floatingFilterData)
            setPageSize(prevState => ({ ...prevState, pageSize100: true, pageSize10: false, pageSize50: false }))
            setGlobalTake(100)
            if (pageNo >= Math.ceil(totalRecordCount / 100)) {
                setPageNo(Math.ceil(totalRecordCount / 100))
                getDataList(null, null, null, null, 0, 100, true, floatingFilterData)
            }
        }

        gridApi.paginationSetPageSize(Number(newPageSize));

    };


    /**
    * @method viewOrEditItemDetails
    * @description edit or view material type
    */
    const viewOrEditItemDetails = (Id, rowData, isViewMode) => {
        let data = {
            isEditFlag: true,
            Id: Id,
            IsVendor: rowData.CostingHead,
            isViewMode: isViewMode
        }
        props.getDetails(data);
    }

    /**
    * @method deleteItem
    * @description confirm delete
    */
    const deleteItem = (Id) => {
        setShowPopup(true)
        setDeletedId(Id)
    }

    /**
    * @method confirmDelete
    * @description confirm delete
    */
    const confirmDelete = (ID) => {
        dispatch(deleteProfit(ID, (res) => {
            if (res.data.Result === true) {
                Toaster.success(MESSAGES.DELETE_PROFIT_SUCCESS);
                getDataList(null, null, null, null, 0, 10, true, floatingFilterData)
                dispatch(setSelectedRowForPagination([]))
                setDataCount(0)
            }
        }))
        setShowPopup(false)
    }


    const onPopupConfirm = () => {
        confirmDelete(deletedId);
    }


    const closePopUp = () => {
        showPopup(false)
    }


    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    const buttonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

        return (
            <>
                {ViewAccessibility && <button title='View' className="View mr-2" type={'button'} onClick={() => viewOrEditItemDetails(cellValue, rowData, true)} />}
                {EditAccessibility && <button title='Edit' className="Edit mr-2" type={'button'} onClick={() => viewOrEditItemDetails(cellValue, rowData, false)} />}
                {DeleteAccessibility && <button title='Delete' className="Delete" type={'button'} onClick={() => deleteItem(cellValue)} />}
            </>
        )
    };

    /**
    * @method costingHeadFormatter
    * @description Renders Costing head
    */
    const costingHeadFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        let headText = '';
        if (cellValue === 'ZBC') {
            headText = 'Zero Based';
        } if (cellValue === 'VBC') {
            headText = 'Vendor Based';
        } if (cellValue === 'CBC') {
            headText = 'Client Based';
        }
        return headText;
    }

    /**
     * @method hyphenFormatter
     */
    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }

    /**
  * @method effectiveDateFormatter
  * @description Renders buttons
  */
    const effectiveDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
    }


    /**
    * @method statusButtonFormatter
    * @description Renders buttons
    */
    const statusButtonFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <label htmlFor="normal-switch" className="normal-switch">
                    {/* <span>Switch with default style</span> */}
                    <Switch
                        onChange={() => handleChange(cell, row, enumObject, rowIndex)}
                        checked={cell}
                        background="#ff6600"
                        onColor="#4DC771"
                        onHandleColor="#ffffff"
                        id="normal-switch"
                        height={24}
                    />
                </label>
            </>
        )
    }

    const handleChange = (cell, row, enumObject, rowIndex) => {
        let data = {
            Id: row.ProfitId,
            LoggedInUserId: loggedInUserId(),
            IsActive: !cell, //Status of the Profit.
        }
        dispatch(activeInactiveProfit(data, res => {
            if (res && res.data && res.data.Result) {
                if (cell === true) {
                    Toaster.success(MESSAGES.PROFIT_INACTIVE_SUCCESSFULLY)
                } else {
                    Toaster.success(MESSAGES.PROFIT_ACTIVE_SUCCESSFULLY)
                }
                getDataList(null, null, null, null, 0, 10, true, floatingFilterData)
            }
        }))
    }

    /**
    * @method filterList
    * @description Filter user listing on the basis of role and department
    */

    const formToggle = () => {
        props.formToggle()
    }

    /**
    * @method onSubmit
    * @description Used to Submit the form
    */
    const onSubmit = (values) => { }


    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
    };

    const onRowSelect = (event) => {

        var selectedRows = gridApi && gridApi?.getSelectedRows();
        if (selectedRows === undefined || selectedRows === null) {    //CONDITION FOR FIRST RENDERING OF COMPONENT
            selectedRows = selectedRowForPagination
        } else if (selectedRowForPagination && selectedRowForPagination.length > 0) {  // CHECKING IF REDUCER HAS DATA

            let finalData = []
            if (event.node.isSelected() === false) {    // CHECKING IF CURRENT CHECKBOX IS UNSELECTED

                for (let i = 0; i < selectedRowForPagination.length; i++) {
                    if (selectedRowForPagination[i].ProfitId === event.data.ProfitId) {   // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
                        continue;
                    }
                    finalData.push(selectedRowForPagination[i])
                }

            } else {
                finalData = selectedRowForPagination
            }
            selectedRows = [...selectedRows, ...finalData]

        }

        let uniqeArray = _.uniqBy(selectedRows, "ProfitId")          //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
        dispatch(setSelectedRowForPagination(uniqeArray))              //SETTING CHECKBOX STATE DATA IN REDUCER
        setDataCount(uniqeArray.length)
        setSelectedRowData(uniqeArray)
    }


    const checkBoxRenderer = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;


        if (selectedRowForPagination?.length > 0) {
            selectedRowForPagination.map((item) => {
                if (item.ProfitId === props.node.data.ProfitId) {
                    props.node.setSelected(true)
                }
                return null
            })
            return cellValue
        } else {
            return cellValue
        }
    }

    const onBtExport = () => {
        let tempArr = []
        tempArr = selectedRowForPagination
        tempArr = (tempArr && tempArr.length > 0) ? tempArr : (overheadProfitListAll ? overheadProfitListAll : [])
        return returnExcelColumn(PROFIT_DOWNLOAD_EXCEl, tempArr)
    };

    const returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData && TempData.map((item) => {
            if (item.ClientName === '-') {
                item.ClientName = ' '
            }
            if (item.ClientName === null) {
                item.ClientName = ' '
            } if (item.ProfitBOPPercentage === null) {
                item.ProfitBOPPercentage = ' '
            } if (item.ProfitMachiningCCPercentage === null) {
                item.ProfitMachiningCCPercentage = ' '
            } if (item.ProfitPercentage === null) {
                item.ProfitPercentage = ' '
            } if (item.ProfitRMPercentage === null) {
                item.ProfitRMPercentage = ' '
            } if (item?.VendorName === '-') {
                item.VendorName = ' '
            }
            if (item?.EffectiveDate?.includes('T')) {
                item.EffectiveDate = DayTime(item.EffectiveDate).format('DD/MM/YYYY')

            }

            return item
        })
        return (

            <ExcelSheet data={temp} name={ProfitMaster}>
                {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
    }

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const onExcelDownload = () => {
        setDisableDownload(true)
        dispatch(disabledClass(true))
        let tempArr = selectedRowForPagination
        if (tempArr?.length > 0) {
            setTimeout(() => {
                setDisableDownload(false)
                dispatch(disabledClass(false))
                let button = document.getElementById('Excel-Downloads-profit')
                button && button.click()
            }, 400);

        } else {
            getDataList(null, null, null, null, 0, defaultPageSize, false, floatingFilterData) // FOR EXCEL DOWNLOAD OF COMPLETE DATA
        }

    }


    const { handleSubmit, AddAccessibility, DownloadAccessibility } = props;

    const isFirstColumn = (params) => {
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;
        return thisIsFirstColumn;
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: isFirstColumn
    };

    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        costingHeadFormatter: costingHeadFormatter,
        effectiveDateFormatter: effectiveDateFormatter,
        statusButtonFormatter: statusButtonFormatter,
        hyphenFormatter: hyphenFormatter,
        customNoRowsOverlay: NoContentFound,
        valuesFloatingFilter: SingleDropdownFloationFilter,
    };

    return (


        <>
            {
                isLoader ? <LoaderCustom customClass={"loader-center"} /> :
                    <div className={`ag-grid-react custom-pagination ${DownloadAccessibility ? "show-table-btn" : ""}`}>
                        <form noValidate>
                            <Row className="pt-4">
                                <Col md="9" className="search-user-block mb-3">
                                    <div className="d-flex justify-content-end bd-highlight w100">
                                        {disableDownload && <div title={MESSAGES.DOWNLOADING_MESSAGE} className="disabled-overflow"><WarningMessage dClass="ml-4 mt-1" message={MESSAGES.DOWNLOADING_MESSAGE} /></div>}
                                        <div className="warning-message d-flex align-items-center">
                                            {warningMessage && !disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                                            <button disabled={disableFilter} title="Filtered data" type="button" class="user-btn mr5" onClick={() => onSearch()}><div class="filter mr-0"></div></button>
                                        </div>

                                        {AddAccessibility && (
                                            <button
                                                type="button"
                                                className={"user-btn mr5"}
                                                onClick={formToggle}
                                                title="Add"
                                            >
                                                <div className={"plus mr-0"}></div>
                                                {/* ADD */}
                                            </button>
                                        )}
                                        {
                                            DownloadAccessibility &&
                                            <>
                                                {disableDownload ? <div className='p-relative mr5'> <LoaderCustom customClass={"download-loader"} /> <button type="button" className={'user-btn'}><div className="download mr-0"></div>
                                                </button></div> :
                                                    <>
                                                        <button type="button" onClick={onExcelDownload} className={'user-btn mr5'}><div className="download mr-0" title="Download"></div>
                                                            {/* DOWNLOAD */}
                                                        </button>
                                                        <ExcelFile filename={'Profit'} fileExtension={'.xls'} element={
                                                            <button id={'Excel-Downloads-profit'} className="p-absolute" type="button" >
                                                            </button>}>
                                                            {onBtExport()}
                                                        </ExcelFile>
                                                    </>
                                                }
                                            </>
                                        }

                                        <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                                            <div className="refresh mr-0"></div>
                                        </button>
                                    </div>
                                </Col>
                            </Row>
                        </form>
                        <Row>
                            <Col>

                                <div className={`ag-grid-wrapper height-width-wrapper report-grid ${(overheadProfitList && overheadProfitList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                                    <div className="ag-grid-header">
                                        <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => onFilterTextBoxChanged(e)} />
                                        <SelectRowWrapper dataCount={dataCount} />
                                    </div>
                                    <div className={`ag-theme-material ${isLoader && "max-loader-height"}`}>
                                        {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                                        <AgGridReact
                                            defaultColDef={defaultColDef}
                                            floatingFilter={true}
                                            domLayout='autoHeight'

                                            rowData={overheadProfitList}
                                            pagination={true}
                                            paginationPageSize={globalTake}
                                            onGridReady={onGridReady}
                                            gridOptions={gridOptions}
                                            noRowsOverlayComponent={'customNoRowsOverlay'}
                                            noRowsOverlayComponentParams={{
                                                title: EMPTY_DATA,
                                                imagClass: 'imagClass'
                                            }}
                                            frameworkComponents={frameworkComponents}
                                            rowSelection={'multiple'}
                                            onRowSelected={onRowSelect}
                                            onFilterModified={onFloatingFilterChanged}
                                            suppressRowClickSelection={true}
                                        //onFilterModified={(e) => { setNoData(searchNocontentFilter(e)) }}
                                        >
                                            <AgGridColumn field="CostingHead" headerName="Costing Head" cellRenderer={checkBoxRenderer}></AgGridColumn>
                                            {(getConfigurationKey().IsPlantRequiredForOverheadProfitInterestRate || getConfigurationKey().IsDestinationPlantConfigure) && <AgGridColumn field="PlantName" headerName="Plant(Code)"></AgGridColumn>}
                                            <AgGridColumn field="VendorName" headerName="Vendor(Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                            <AgGridColumn field="CustomerName" headerName="Customer (Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                            <AgGridColumn field="ModelType" headerName="Model Type"></AgGridColumn>
                                            <AgGridColumn field="ProfitApplicabilityType" headerName="Profit Applicability" floatingFilterComponent="valuesFloatingFilter" floatingFilterComponentParams={floatingFilterProfit}></AgGridColumn>
                                            <AgGridColumn field="ProfitPercentage" headerName="Profit Applicability (%)" cellRenderer={'hyphenFormatter'} ></AgGridColumn>
                                            <AgGridColumn field="ProfitRMPercentage" headerName="Profit on RM (%)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                            <AgGridColumn field="ProfitBOPPercentage" headerName="Profit on BOP (%)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                            <AgGridColumn field="ProfitMachiningCCPercentage" headerName="Profit on CC (%)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                            <AgGridColumn field="EffectiveDateNew" headerName="Effective Date" cellRenderer={'effectiveDateFormatter'} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                                            <AgGridColumn field="ProfitId" width={180} headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                                        </AgGridReact>
                                        <div className='button-wrapper'>
                                            {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={globalTake} />}
                                            {
                                                <div className="d-flex pagination-button-container">
                                                    <p><button className="previous-btn" type="button" disabled={false} onClick={() => onBtPrevious()}> </button></p>
                                                    {pageSize.pageSize10 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 10)}</p>}
                                                    {pageSize.pageSize50 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 50)}</p>}
                                                    {pageSize.pageSize100 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 100)}</p>}
                                                    <p><button className="next-btn" type="button" onClick={() => onBtNext()}> </button></p>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </Col >
                        </Row >
                        {
                            showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.PROFIT_DELETE_ALERT}`} />
                        }
                    </div >
            }
        </>
    );


}

export default ProfitListing


