import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row } from 'reactstrap';
import $ from "jquery";
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { defaultPageSize, EMPTY_DATA, OUTSOURCING } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import Switch from "react-switch";
import { ADDITIONAL_MASTERS } from '../../../config/constants';
import { checkPermission, searchNocontentFilter, showTitleForActiveToggle } from '../../../helper/util';
import { loggedInUserId } from '../../../helper/auth';
import LoaderCustom from '../../common/LoaderCustom';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import ScrollToTop from '../../common/ScrollToTop';
import { useEffect } from 'react';
import { useState } from 'react';
import AddOutsourcing from './AddOutsourcing';
import { activeInactiveOutsourcingStatus, getAllOutsourcing } from '../actions/Outsourcing';
import { OUTSOURCING_EXCEL_DOWNLOAD } from '../../report/ExcelTemplate';
import { setSelectedRowForPagination } from '../../simulation/actions/Simulation';
import { disabledClass } from '../../../actions/Common';
import _ from 'lodash';
import WarningMessage from '../../common/WarningMessage';
import Button from '../../layout/Button';
import { reactLocalStorage } from 'reactjs-localstorage';
import { resetStatePagination, updatePageNumber, updateCurrentRowIndex, updateGlobalTake } from '../../common/Pagination/paginationAction';
import { PaginationWrappers } from '../../common/Pagination/PaginationWrappers';
import PaginationControls from '../../common/Pagination/PaginationControls';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

const OutsourcingListing = (props) => {
    const [isEditMode, setIsEditMode] = useState(false);
    const [isViewMode, setIsViewMode] = useState(false);
    const [isOpenDrawer, setIsOpenDrawer] = useState(false);
    const [outsourcingId, setOutsourcingId] = useState('');
    const [ViewAccessibility, setViewAccessibility] = useState(false);
    const [AddAccessibility, setAddAccessibility] = useState(false);
    const [EditAccessibility, setEditAccessibility] = useState(false);
    const [DownloadAccessibility, setDownloadAccessibility] = useState(false);
    const [ActivateAccessibility, setActivateAccessibility] = useState(false);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [isLoader, setIsLoader] = useState(false);
    const [showPopupToggle, setShowPopupToggle] = useState(false);
    const [cellValue, setCellValue] = useState('');
    const [cellData, setCellData] = useState('');
    const [disableFilter, setDisableFilter] = useState(true)
    const [disableDownload, setDisableDownload] = useState(false)
    //STATES BELOW ARE MADE FOR PAGINATION PURPOSE
    const [warningMessage, setWarningMessage] = useState(false)
    // const [globalTake, setGlobalTake] = useState(defaultPageSize)
    const [filterModel, setFilterModel] = useState({});
    // const [pageNo, setPageNo] = useState(1)
    // const [pageNoNew, setPageNoNew] = useState(1)
    const [totalRecordCount, setTotalRecordCount] = useState(1)
    const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false)
    // const [currentRowIndex, setCurrentRowIndex] = useState(0)
    const [noData, setNoData] = useState(false)
    const [dataCount, setDataCount] = useState(0)
    // const [pageSize, setPageSize] = useState({ pageSize10: true, pageSize50: false, pageSize100: false })
    const [floatingFilterData, setFloatingFilterData] = useState({ OutSourcingName: '', OutSourcingShortName: '' })
    const [gridLoad, setGridLoad] = useState(false);
    const { outsourcingDataList, outsourcingDataListForDownload } = useSelector(state => state.outsourcing);
    const { topAndLeftMenuData } = useSelector(state => state.auth);
    const { selectedRowForPagination } = useSelector((state => state.simulation))
    const { globalTakes } = useSelector((state) => state.pagination)
    const dispatch = useDispatch();

    useEffect(() => {
        // setSelectedRowForPagination([])
        getTableListData(0, defaultPageSize, true)
        return () => {
            dispatch(setSelectedRowForPagination([]))
            dispatch(resetStatePagination());

        }
    }, [])

    useEffect(() => {
        applyPermission(topAndLeftMenuData)
    }, [topAndLeftMenuData])


    useEffect(() => {
        if (outsourcingDataList?.length > 0) {
            setTotalRecordCount(outsourcingDataList[0].TotalRecordCount)
        }
        else {
            setNoData(false)
        }
    }, [outsourcingDataList])
    /**
    * @method applyPermission
    * @description ACCORDING TO PERMISSION HIDE AND SHOW, ACTION'S
    */
    const applyPermission = (topAndLeftMenuData) => {
        if (topAndLeftMenuData !== undefined) {
            setGridLoad(true)
            const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === ADDITIONAL_MASTERS);
            const accessData = Data && Data.Pages.find((el) => el.PageName === OUTSOURCING)
            const permissionData = accessData && accessData.Actions && checkPermission(accessData.Actions)
            if (permissionData !== undefined) {
                setViewAccessibility(permissionData && permissionData.View ? permissionData.View : false);
                setAddAccessibility(permissionData && permissionData.Add ? permissionData.Add : false);
                setEditAccessibility(permissionData && permissionData.Edit ? permissionData.Edit : false);
                setDownloadAccessibility(permissionData && permissionData.Download ? permissionData.Download : false);
                setActivateAccessibility(permissionData && permissionData.Activate ? permissionData.Activate : false);
            }
        }
    }

    /**
     * @method getTableListData
     * @description Get user list data
     */
    const getTableListData = (skip = 0, take = 10, isPagination = true) => {
        if (isPagination === true || isPagination === null) setIsLoader(true)
        let dataObj = { ...floatingFilterData }
        dispatch(getAllOutsourcing(dataObj, isPagination, skip, take, (res) => {
            if (isPagination === true || isPagination === null) setIsLoader(false)
            if ((res && res.status === 204) || res.length === 0) {
                setTotalRecordCount(0)
                dispatch(updatePageNumber(0))
                // setPageNo(0)
            }
            if (res && isPagination === false) {
                setDisableDownload(false)
                dispatch(disabledClass(false))
                setTimeout(() => {
                    let button = document.getElementById('Excel-Downloads-outsourcing')
                    button && button.click()
                }, 500);
            }
            if (res) {
                let isReset = true
                setTimeout(() => {
                    for (var prop in floatingFilterData) {
                        if (floatingFilterData[prop] !== "") {
                            isReset = false
                        }
                    }
                    // Sets the filter model via the grid API
                    isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(filterModel))

                }, 300);

                setTimeout(() => {
                    setWarningMessage(false)
                }, 330);

                setTimeout(() => {
                    setIsFilterButtonClicked(false)
                }, 600);
            }
        }))
    }

    const viewOrEditItemDetails = (Id, rowData, isViewMode) => {
        if (rowData.IsActive === false && !isViewMode) {
            Toaster.warning('You can not edit inactive outsourcing')
        }
        else {
            setIsEditMode(!isViewMode);
            setIsOpenDrawer(true);
            setOutsourcingId(rowData.OutSourcingId);
            setIsViewMode(isViewMode);
        }
    }

    const closePopUp = () => {
        setShowPopupToggle(false)
    }
    const onPopupConfirmToggle = () => {
        confirmDeactivateItem(cellData, cellValue)
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
                {ViewAccessibility && <Button id={`outsourcingListing_view${props.rowIndex}`} className={"mr-1"} variant="View" onClick={() => viewOrEditItemDetails(cellValue, rowData, true)} title={"View"} />}
                {EditAccessibility && <Button id={`outsourcingListing_edit${props.rowIndex}`} className={"mr-1"} variant="Edit" onClick={() => viewOrEditItemDetails(cellValue, rowData, false)} title={"Edit"} />}
            </>
        )
    };

    /**
     * @method onFloatingFilterChanged
     * @description Filter data when user type in searching input
     */
    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            if (outsourcingDataList?.length !== 0) {
                setNoData(searchNocontentFilter(value, noData))
            }
        }, 500);
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
            } else {
                setFloatingFilterData({ ...floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter })
            }

        } else {

            setFloatingFilterData({ ...floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter })
        }
    }
    /**
     * @method statusButtonFormatter
     * @description Renders buttons
     */
    const statusButtonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        showTitleForActiveToggle(props?.rowIndex, 'Active', 'Inactive');
        return (
            <>
                <label htmlFor="normal-switch" className="normal-switch">
                    {/* <span>Switch with default style</span> */}
                    <Switch onChange={() => handleChange(cellValue, rowData)} checked={cellValue} disabled={!ActivateAccessibility} background="#ff6600" onColor="#4DC771" onHandleColor="#ffffff" offColor="#FC5774" id="normal-switch" height={24} className={cellValue ? "active-switch" : "inactive-switch"} />
                </label>
            </>
        )
    }

    const handleChange = (cell, row) => {

        let data = { Id: row.OutSourcingId, LoggedInUserId: loggedInUserId(), IsActive: !cell, }
        setCellData(data)
        setCellValue(cell)
        setShowPopupToggle(true)
    }
    const confirmDeactivateItem = (data, cell) => {
        dispatch(activeInactiveOutsourcingStatus(data, res => {
            if (res && res.data && res.data.Result) {
                if (cell === true) {
                    Toaster.success(MESSAGES.OUTSOURCING_INACTIVE_SUCCESSFULLY)
                } else {
                    Toaster.success(MESSAGES.OUTSOURCING_ACTIVE_SUCCESSFULLY)
                }
                getTableListData(0, defaultPageSize, true)
                setDataCount(0)
            }
        }))
        setShowPopupToggle(false)
    }

    const formToggle = () => {
        $("html,body").animate({ scrollTop: 0 }, "slow");
        setIsOpenDrawer(true)
    }

    const closeDrawer = (e = '', type) => {
        setIsOpenDrawer(false)
        setIsEditMode(false)
        setIsViewMode(false)
        setOutsourcingId('')
        if (type === 'submit') {
            getTableListData(0, defaultPageSize, true)
        }
    }

    const onGridReady = (params) => {
        params.api.sizeColumnsToFit();
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
    };


    const onSearch = () => {
        setWarningMessage(false)
        setIsFilterButtonClicked(true)
        // setPageNo(1)
        // setPageNoNew(1)
        // setCurrentRowIndex(0)
        dispatch(updatePageNumber(1))
        dispatch(updateCurrentRowIndex(0))
        gridOptions?.columnApi?.resetColumnState();
        getTableListData(0, globalTakes, true)
    }

    const onRowSelect = (event) => {
        let selectedRowForPagination = reactLocalStorage.getObject('selectedRow').selectedRow
        var selectedRows = gridApi && gridApi?.getSelectedRows();
        if (selectedRows === undefined || selectedRows === null) {    //CONDITION FOR FIRST RENDERING OF COMPONENT
            selectedRows = selectedRowForPagination
        } else if (selectedRowForPagination && selectedRowForPagination.length > 0) {  // CHECKING IF REDUCER HAS DATA
            let finalData = []
            if (event.node?.isSelected() === false) {    // CHECKING IF CURRENT CHECKBOX IS UNSELECTED

                for (let i = 0; i < selectedRowForPagination.length; i++) {
                    if (selectedRowForPagination[i].OutSourcingId === event.data.OutSourcingId) {   // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
                        continue;
                    }
                    finalData.push(selectedRowForPagination[i])
                }

            } else {
                finalData = selectedRowForPagination
            }
            selectedRows = [...selectedRows, ...finalData]

        }
        let uniqeArray = _.uniqBy(selectedRows, "OutSourcingId")          //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
        reactLocalStorage.setObject('selectedRow', { selectedRow: uniqeArray }) //SETTING CHECKBOX STATE DATA IN LOCAL STORAGE
        setDataCount(uniqeArray.length)
        dispatch(setSelectedRowForPagination(uniqeArray))              //SETTING CHECKBOX STATE DATA IN REDUCER

    }


    const onExcelDownload = () => {
        setDisableDownload(true)
        dispatch(disabledClass(true))
        //let tempArr = gridApi && gridApi?.getSelectedRows()
        let tempArr = selectedRowForPagination
        if (tempArr?.length > 0) {
            setTimeout(() => {
                setDisableDownload(false)
                dispatch(disabledClass(false))
                let button = document.getElementById('Excel-Downloads-outsourcing')
                button && button.click()
            }, 400);


        } else {
            getTableListData(0, defaultPageSize, false) // FOR EXCEL DOWNLOAD OF COMPLETE DATA
        }

    }

    const onBtExport = () => {
        let tempArr = []
        //tempArr = gridApi && gridApi?.getSelectedRows()
        tempArr = selectedRowForPagination
        tempArr = (tempArr && tempArr.length > 0) ? tempArr : (outsourcingDataListForDownload ? outsourcingDataListForDownload : [])
        return returnExcelColumn(OUTSOURCING_EXCEL_DOWNLOAD, tempArr)
    };
    const returnExcelColumn = (data = [], TempData) => {
        return (
            <ExcelSheet data={TempData} name={OUTSOURCING}>
                {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
    }

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }


    const resetState = () => {
        setNoData(false)
        setIsFilterButtonClicked(false)
        gridApi.deselectAll()
        gridOptions?.columnApi?.resetColumnState(null);
        gridOptions?.api?.setFilterModel(null);

        for (var prop in floatingFilterData) {
            floatingFilterData[prop] = ""

        }
        setFloatingFilterData(floatingFilterData)
        setWarningMessage(false)
        // setPageNo(1)
        // setPageNoNew(1)
        // setCurrentRowIndex(0)
        dispatch(resetStatePagination())
        getTableListData(0, 10, true)
        dispatch(setSelectedRowForPagination([]))
        // setGlobalTake(10)
        dispatch(updateGlobalTake(10))
        // setPageSize(prevState => ({ ...prevState, pageSize10: true, pageSize50: false, pageSize100: false }))
        setDataCount(0)
        reactLocalStorage.setObject('selectedRow', {})
    }
    const checkBoxRenderer = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        if (selectedRowForPagination?.length > 0) {
            selectedRowForPagination.map((item) => {
                if (item.OutSourcingId === props.node.data.OutSourcingId) {
                    props.node.setSelected(true)
                }
                return null
            })
            return cellValue
        } else {
            return cellValue
        }
    }

    const isFirstColumn = (params) => {
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;
        return thisIsFirstColumn;

    }
    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: isFirstColumn
    };

    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        customNoRowsOverlay: NoContentFound,
        statusButtonFormatter: statusButtonFormatter
    };


    return (
        <>
            {isLoader ? <LoaderCustom customClass="loader-center" /> :
                <div className={`ag-grid-react custom-pagination ${DownloadAccessibility ? "show-table-btn" : ""}`}>
                    <ScrollToTop pointProp="go-to-top" />
                    <form noValidate>
                        <Row className="pt-4 ">
                            <Col md="9" className="search-user-block mb-3 pl-0">
                                <div className="d-flex justify-content-end bd-highlight w100">
                                    <div className="warning-message d-flex align-items-center">
                                        {warningMessage && !disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                                        <Button id="outsourcingListing_filter" className={"mr5"} onClick={() => onSearch()} title={"Filtered data"} icon={"filter"} disabled={disableFilter} />
                                    </div>

                                    {AddAccessibility && (<Button id="outsourcingListing_add" className={"mr5"} onClick={formToggle} title={"Add"} icon={"plus"} />)}
                                    {DownloadAccessibility &&
                                        <>
                                            <Button className="mr5" id={"outsourceListing_excel_download"} onClick={onExcelDownload} title={`Download ${dataCount === 0 ? "All" : "(" + dataCount + ")"}`} icon={"download mr-1"} buttonName={`${dataCount === 0 ? "All" : "(" + dataCount + ")"}`} />
                                            <ExcelFile filename={'Outsourcing'} fileExtension={'.xls'} element={
                                                <Button id={"Excel-Downloads-outsourcing"} className="p-absolute" />

                                            }>
                                                {onBtExport()}
                                            </ExcelFile>
                                        </>
                                    }
                                    <Button id={"outsourceListing_refresh"} onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />
                                </div>
                            </Col>
                        </Row>
                    </form >
                    {gridLoad && <div className={`ag-grid-wrapper height-width-wrapper  ${(outsourcingDataList && outsourcingDataList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                        <div className="ag-grid-header">
                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                        </div>
                        <div className={`ag-theme-material ${isLoader && "max-loader-height"}`}>
                            {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}

                            <AgGridReact
                                defaultColDef={defaultColDef}
                                floatingFilter={true}
                                domLayout='autoHeight'
                                rowData={outsourcingDataList}
                                pagination={true}
                                paginationPageSize={globalTakes}
                                onGridReady={onGridReady}
                                gridOptions={gridOptions}
                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                noRowsOverlayComponentParams={{ title: EMPTY_DATA, imagClass: 'imagClass' }}
                                frameworkComponents={frameworkComponents}
                                rowSelection={'multiple'}
                                onRowSelected={onRowSelect}
                                onFilterModified={onFloatingFilterChanged}
                                suppressRowClickSelection={true}
                            >
                                <AgGridColumn field="OutSourcingName" headerName="Outsourcing Name" cellRenderer={checkBoxRenderer}></AgGridColumn>
                                <AgGridColumn field="OutSourcingShortName" headerName="Outsourcing Short Name"></AgGridColumn>
                                <AgGridColumn field="IsActive" headerName="Status" floatingFilter={false} cellRenderer={'statusButtonFormatter'}></AgGridColumn>
                                <AgGridColumn field="OutSourcingId" cellClass="ag-grid-action-container" headerName="Actions" type="rightAligned" floatingFilter={false} cellRenderer='totalValueRenderer'></AgGridColumn>
                            </AgGridReact>
                            <div className='button-wrapper'>
                                {<PaginationWrappers gridApi={gridApi} totalRecordCount={totalRecordCount} getDataList={getTableListData} floatingFilterData={floatingFilterData} module="Outsourcing" />}
                                {
                                    <PaginationControls totalRecordCount={totalRecordCount} getDataList={getTableListData} floatingFilterData={floatingFilterData} module="Outsourcing" />

                                }
                            </div>
                        </div>
                    </div>}

                    {showPopupToggle && <PopupMsgWrapper isOpen={showPopupToggle} closePopUp={closePopUp} confirmPopup={onPopupConfirmToggle} message={`${cellValue ? MESSAGES.OUTSOURCING_DEACTIVE_ALERT : MESSAGES.OUTSOURCING_ACTIVE_ALERT}`} />}
                </div >}
            {isOpenDrawer && (<AddOutsourcing isOpen={isOpenDrawer} closeDrawer={closeDrawer} isEditMode={isEditMode} isViewMode={isViewMode} outsourcing_Id={outsourcingId} anchor={'right'} />
            )
            }
        </>

    );
}


export default OutsourcingListing
