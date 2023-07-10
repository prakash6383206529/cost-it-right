import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, TabContent, Nav, Container } from 'reactstrap'
import { MESSAGES } from '../../../config/message'
import { defaultPageSize, EMPTY_DATA, FILE_URL } from '../../../config/constants'
import NoContentFound from '../../common/NoContentFound'
import { getBudgetDataList, getPartCostingHead, } from '../actions/Budget'
import { BUDGET_DOWNLOAD_EXCEl } from '../../../config/masterData'
import BulkUpload from '../../massUpload/BulkUpload'
import { ADDITIONAL_MASTERS, VOLUME } from '../../../config/constants'
import { checkPermission, searchNocontentFilter } from '../../../helper/util'
import LoaderCustom from '../../common/LoaderCustom'
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import ScrollToTop from '../../common/ScrollToTop'
import { PaginationWrapper } from '../../common/commonPagination'
import WarningMessage from '../../common/WarningMessage'
import { setSelectedRowForPagination } from '../../simulation/actions/Simulation'
import _ from 'lodash'
import { disabledClass } from '../../../actions/Common'
import { reactLocalStorage } from 'reactjs-localstorage'
import { Drawer } from '@material-ui/core'
import AddBudget from './AddBudget'
import Attachament from '../../costing/components/Drawers/Attachament'

const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};
function BudgetListing(props) {

    const [shown, setShown] = useState(false);
    const [showBudgetForm, setShowBudgetForm] = useState(false);
    const [data, setData] = useState({ isEditFlag: false, ID: '' });
    const [bulkUploadBtn, setBulkUploadBtn] = useState(false);
    const [addAccessibility, setAddAccessibility] = useState(false);
    const [editAccessibility, setEditAccessibility] = useState(false);
    const [deleteAccessibility, setDeleteAccessibility] = useState(false);
    const [bulkUploadAccessibility, setBulkUploadAccessibility] = useState(false);
    const [downloadAccessibility, setDownloadAccessibility] = useState(false);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [deletedId, setDeletedId] = useState('');
    const [isLoader, setIsLoader] = useState(false);
    const [limit, setLimit] = useState(false);
    const [dataCount, setDataCount] = useState(0);
    const [activeTab, setactiveTab] = useState('1');

    //STATES BELOW ARE MADE FOR PAGINATION PURPOSE
    const [disableFilter, setDisableFilter] = useState(true) // STATE MADE FOR CHECKBOX SELECTION
    const [warningMessage, setWarningMessage] = useState(false)
    const [globalTake, setGlobalTake] = useState(defaultPageSize)
    const [filterModel, setFilterModel] = useState({});
    const [pageNo, setPageNo] = useState(1)
    const [pageNoNew, setPageNoNew] = useState(1)
    const [totalRecordCount, setTotalRecordCount] = useState(1)
    const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false)
    const [currentRowIndex, setCurrentRowIndex] = useState(0)
    const [pageSize, setPageSize] = useState({ pageSize10: true, pageSize50: false, pageSize100: false })
    const [floatingFilterData, setFloatingFilterData] = useState({ CostingHead: '', Year: '', Month: '', VendorName: '', Plant: '', PartNumber: '', PartName: '', BudgetedQuantity: '', ApprovedQuantity: '', applyPagination: '', skip: '', take: '', CustomerName: '' })
    const [disableDownload, setDisableDownload] = useState(false)
    const [noData, setNoData] = useState(false)
    const [attachment, setAttachment] = useState(false);
    const [viewAttachment, setViewAttachment] = useState([])

    const { topAndLeftMenuData } = useSelector(state => state.auth);
    const { volumeDataList, volumeDataListForDownload } = useSelector(state => state.volume);
    const { selectedRowForPagination } = useSelector((state => state.simulation))


    const dispatch = useDispatch();

    useEffect(() => {
        applyPermission(topAndLeftMenuData)
        if (!props?.isMasterSummaryDrawer) {
            getTableListData(0, defaultPageSize, true)
            dispatch(getPartCostingHead((res) => {
                reactLocalStorage.setObject("budgetCostingHeads", res?.data?.SelectList); //FOR SHOWING DYNAMIC HEADERS IN BUDGET BULK UPLOAD EXCEL DOWNLOAD
            }))
        }
        return () => {
            dispatch(setSelectedRowForPagination([]))
        }

    }, [])

    useEffect(() => {
        setIsLoader(true)
        applyPermission(topAndLeftMenuData)
        setTimeout(() => {
            setIsLoader(false)
        }, 200);
    }, [topAndLeftMenuData])

    useEffect(() => {
        if (volumeDataList?.length > 0) {
            setTotalRecordCount(volumeDataList[0].TotalRecordCount)
        }
        else {
            setNoData(false)
        }
    }, [volumeDataList])

    /**
    * @method applyPermission
    * @description ACCORDING TO PERMISSION HIDE AND SHOW, ACTION'S
    */
    const applyPermission = (topAndLeftMenuData) => {
        if (topAndLeftMenuData !== undefined) {
            const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === ADDITIONAL_MASTERS);
            const accessData = Data && Data.Pages.find((el) => el.PageName === VOLUME)
            const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)
            if (permmisionData !== undefined) {
                setAddAccessibility(permmisionData && permmisionData.Add ? permmisionData.Add : false)
                setEditAccessibility(permmisionData && permmisionData.Edit ? permmisionData.Edit : false)
                setDeleteAccessibility(permmisionData && permmisionData.Delete ? permmisionData.Delete : false)
                setBulkUploadAccessibility(permmisionData && permmisionData.BulkUpload ? permmisionData.BulkUpload : false)
                setDownloadAccessibility(permmisionData && permmisionData.Download ? permmisionData.Download : false)
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
        dataObj.IsCustomerDataShow = reactLocalStorage.getObject('cbcCostingPermission')
        dispatch(getBudgetDataList(skip, take, isPagination, dataObj, (res) => {
            if (isPagination === true || isPagination === null) setIsLoader(false)

            if (res && isPagination === false) {
                setDisableDownload(false)
                dispatch(disabledClass(false))
                setTimeout(() => {
                    let button = document.getElementById('Excel-Downloads-volume')
                    button && button.click()
                }, 500);
            }
            if (res) {

                if ((res && res.status === 204) || res.length === 0) {
                    setTotalRecordCount(0)
                    setPageNo(0)
                }
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

    /**
     * @method editItemDetails
     * @description confirm edit item
     */
    const editItemDetails = (Id) => {
        setData({ isEditFlag: true, ID: Id })
        setShowBudgetForm(true)
    }

    /**
  * @method buttonFormatter
  * @description Renders buttons
  */
    const buttonFormatter = (props) => {
        const cellValue = props?.value;
        const rowData = props?.data;
        return (
            <>
                {editAccessibility && <button title='Edit' className="Edit mr-2" type={'button'} onClick={() => editItemDetails(cellValue)} />}
            </>
        )
    };

    /**
    * @method hyphenFormatter
    */
    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }
    const viewAttachmentData = (index) => {
        setAttachment(true)
        setViewAttachment(index)
    }
    const closeAttachmentDrawer = (e = '') => {
        setAttachment(false)
    }
    const attachmentFormatter = (props) => {
        const row = props?.data;
        let files = row?.Attachements
        if (files && files?.length === 0) {
            return '-'
        }
        return (
            <>
                <div className={"attachment images"}>
                    {files && files.length === 1 ?
                        files.map((f) => {
                            const withOutTild = f.FileURL?.replace("~", "");
                            const fileURL = `${FILE_URL}${withOutTild}`;
                            return (
                                <a href={fileURL} target="_blank" rel="noreferrer">
                                    {f.OriginalFileName}
                                </a>
                            )

                        }) : <button
                            type='button'
                            title='View Attachment'
                            className='btn-a pl-0'
                            onClick={() => viewAttachmentData(row)}
                        >View Attachment</button>}
                </div>
            </>
        )

    }

    const formToggle = () => {
        setShowBudgetForm(true)
    }

    const returnExcelColumn = (data = [], TempData) => {
        return (
            <ExcelSheet data={TempData} name={'Budget'}>
                {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
    }

    const onRowSelect = (event) => {
        var selectedRows = gridApi && gridApi?.getSelectedRows();
        if (selectedRows === undefined || selectedRows === null) {    //CONDITION FOR FIRST RENDERING OF COMPONENT
            selectedRows = selectedRowForPagination
        } else if (selectedRowForPagination && selectedRowForPagination.length > 0) {  // CHECKING IF REDUCER HAS DATA
            let finalData = []
            if (event.node.isSelected() === false) {    // CHECKING IF CURRENT CHECKBOX IS UNSELECTED
                for (let i = 0; i < selectedRowForPagination.length; i++) {
                    if (selectedRowForPagination[i].BudgetingId === event.data.BudgetingId && selectedRowForPagination[i].FinancialYear === event.data.FinancialYear) {   // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
                        continue;
                    }
                    finalData.push(selectedRowForPagination[i])
                }
            } else {
                finalData = selectedRowForPagination
            }
            selectedRows = [...selectedRows, ...finalData]
        }
        let uniqeArrayVolumeApprovedId = _.uniqBy(selectedRows, "BudgetingId")          //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
        let uniqeArrayVolumeBudgetedId = _.uniqBy(uniqeArrayVolumeApprovedId, "FinancialYear")          //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
        dispatch(setSelectedRowForPagination(uniqeArrayVolumeBudgetedId))              //SETTING CHECKBOX STATE DATA IN REDUCER
        setDataCount(uniqeArrayVolumeBudgetedId.length)
    }


    const onExcelDownload = () => {
        setDisableDownload(true)
        dispatch(disabledClass(false))
        //let tempArr = gridApi && gridApi?.getSelectedRows()
        let tempArr = volumeDataListForDownload
        if (tempArr?.length > 0) {
            setTimeout(() => {
                setDisableDownload(false)
                dispatch(disabledClass(false))
                let button = document.getElementById('Excel-Downloads-volume')
                button && button.click()
            }, 400);


        } else {
            getTableListData(0, defaultPageSize, false)
            // getDataList(, null, null, 0, 0, defaultPageSize, false, floatingFilterData) // FOR EXCEL DOWNLOAD OF COMPLETE DATA
        }

    }

    const onBtExport = () => {
        let tempArr = []
        //tempArr = gridApi && gridApi?.getSelectedRows()
        tempArr = selectedRowForPagination
        tempArr = (tempArr && tempArr.length > 0) ? tempArr : (volumeDataListForDownload ? volumeDataListForDownload : [])
        return returnExcelColumn(BUDGET_DOWNLOAD_EXCEl, tempArr)
    };

    /**
     * @method hideForm
     * @description HIDE FORM
     */
    const hideForm = (type) => {
        setShowBudgetForm(false)
        setData({ isEditFlag: false, ID: '' })
        setTimeout(() => {
            if (type === 'submit')
                getTableListData(0, globalTake, true)
        }, 200);
    }

    const onBtPrevious = () => {
        if (currentRowIndex >= 10) {
            setPageNo(pageNo - 1)
            setPageNoNew(pageNo - 1)
            const previousNo = currentRowIndex - 10;
            getTableListData(previousNo, globalTake, true)
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
            getTableListData(nextNo, globalTake, true)
            // skip, take, isPagination, floatingFilterData, (res)
            setCurrentRowIndex(nextNo)
        }
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
    };

    const onPageSizeChanged = (newPageSize) => {

        if (Number(newPageSize) === 10) {
            getTableListData(currentRowIndex, 10, true)
            setPageSize(prevState => ({ ...prevState, pageSize10: true, pageSize50: false, pageSize100: false }))
            setGlobalTake(10)
            setPageNo(pageNoNew)
        }
        else if (Number(newPageSize) === 50) {
            getTableListData(currentRowIndex, 50, true)
            setPageSize(prevState => ({ ...prevState, pageSize50: true, pageSize10: false, pageSize100: false }))
            setGlobalTake(50)
            setPageNo(pageNoNew)
            if (pageNo >= Math.ceil(totalRecordCount / 50)) {
                setPageNo(Math.ceil(totalRecordCount / 50))
                getTableListData(0, 50, true)
            }
        }
        else if (Number(newPageSize) === 100) {
            getTableListData(currentRowIndex, 100, true)
            setPageSize(prevState => ({ ...prevState, pageSize100: true, pageSize10: false, pageSize50: false }))
            setGlobalTake(100)
            if (pageNo >= Math.ceil(totalRecordCount / 100)) {
                setPageNo(Math.ceil(totalRecordCount / 100))
                getTableListData(0, 100, true)
            }
        }

        gridApi.paginationSetPageSize(Number(newPageSize));

    };

    const onSearch = () => {

        setWarningMessage(false)
        setIsFilterButtonClicked(true)
        setPageNo(1)
        setPageNoNew(1)
        setCurrentRowIndex(0)
        gridOptions?.columnApi?.resetColumnState();
        getTableListData(0, globalTake, true)
    }

    const onFloatingFilterChanged = (value) => {
        if (volumeDataList?.length !== 0) {
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

            if (value.column.colId === "EffectiveDate" || value.column.colId === "CreatedDate") {
                return false
            }
            setFloatingFilterData({ ...floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter })
        }
    }

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const resetState = () => {
        setNoData(false)
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);
        if (props.isMasterSummaryDrawer === false) {
            gridApi.deselectAll()

            for (var prop in floatingFilterData) {
                floatingFilterData[prop] = ""
            }

            setFloatingFilterData(floatingFilterData)
            setWarningMessage(false)
            setPageNo(1)
            setPageNoNew(1)
            setCurrentRowIndex(0)
            getTableListData(0, 10, true)
            dispatch(setSelectedRowForPagination([]))
            setGlobalTake(10)
            setPageSize(prevState => ({ ...prevState, pageSize10: true, pageSize50: false, pageSize100: false }))
            setDataCount(0)
        }

    }
    const BulkToggle = () => {
        setBulkUploadBtn(true)
    }

    const toggle = (tab) => {
        if (activeTab !== tab) {
            setactiveTab(tab);
        }
    }

    const ExcelFile = ReactExport.ExcelFile;

    const isFirstColumn = (params) => {
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;
        if (props?.isMasterSummaryDrawer) {
            return false
        } else {
            return thisIsFirstColumn;
        }
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: isFirstColumn
    };

    const checkBoxRenderer = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        if (selectedRowForPagination?.length > 0) {
            selectedRowForPagination.map((item) => {
                if (item.BudgetingId === props.node.data.BudgetingId) {
                    props.node.setSelected(true)
                }
                return null
            })
            return cellValue
        } else {
            return cellValue
        }
    }

    const closeActualBulkUploadDrawer = () => {
        setBulkUploadBtn(false)
        getTableListData(0, defaultPageSize, true)
    }

    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        customNoRowsOverlay: NoContentFound,
        hyphenFormatter: hyphenFormatter,
        attachmentFormatter: attachmentFormatter,
    };

    if (showBudgetForm) {
        props?.formToggle(data)
        // return (
        //     <AddBudget
        //         hideForm={hideForm}
        //         data={data}
        //     />
        // )
    }

    const toggleDrawer = () => {
        setBulkUploadBtn(false)
    }
    /**s
     * @method render
     * @description Renders the component
     */
    return (
        <>
            <div className={`ag-grid-react ${(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) ? "custom-pagination" : ""} ${downloadAccessibility ? "show-table-btn no-tab-page" : ""}`}>
                <ScrollToTop pointProp="go-to-top" />
                {isLoader ? <LoaderCustom customClass={"loader-center"} /> :
                    <>
                        {disableDownload && <LoaderCustom message={MESSAGES.DOWNLOADING_MESSAGE} customClass="mt-5" />}
                        <form noValidate>
                            <Row className={`${props?.isMasterSummaryDrawer ? '' : 'pt-4'} blue-before`}>
                                <Col md="9" className="search-user-block mb-3">
                                    <div className="d-flex justify-content-end bd-highlight">
                                        {(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) &&
                                            <div className="warning-message d-flex align-items-center">
                                                {warningMessage && !disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                                            </div>}
                                        {(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) && <button disabled={disableFilter} title="Filtered data" type="button" class="user-btn mr5" onClick={() => onSearch()}><div class="filter mr-0"></div></button>}
                                        {shown ? (
                                            <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => setShown(!shown)}>
                                                <div className="cancel-icon-white"></div></button>
                                        ) : (
                                            ""
                                        )}

                                        {addAccessibility && !props?.isMasterSummaryDrawer && (
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
                                        {bulkUploadAccessibility && !props?.isMasterSummaryDrawer && <button
                                            type="button"
                                            className={"user-btn mr5"}
                                            onClick={BulkToggle}
                                            title="Bulk Upload"
                                        >
                                            <div className={"upload mr-0"}></div>
                                            {/* Budgeted Bulk Upload */}
                                        </button>}

                                        {
                                            downloadAccessibility && !props?.isMasterSummaryDrawer &&
                                            <>
                                                <button title={`Download ${dataCount === 0 ? "All" : "(" + dataCount + ")"}`} type="button" onClick={onExcelDownload} className={'user-btn mr5'}><div className="download mr-1" ></div>
                                                    {/* DOWNLOAD */}
                                                    {`${dataCount === 0 ? "All" : "(" + dataCount + ")"}`}
                                                </button>
                                                <ExcelFile filename={'Budget'} fileExtension={'.xls'} element={
                                                    <button id={'Excel-Downloads-volume'} className="p-absolute" type="button" >
                                                    </button>}>
                                                    {onBtExport()}
                                                </ExcelFile>
                                            </>
                                        }
                                        <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                                            <div className="refresh mr-0"></div>
                                        </button>
                                    </div>
                                </Col>
                            </Row>
                        </form>

                        <div className={`ag-grid-wrapper height-width-wrapper  ${(volumeDataList && volumeDataList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                            <div className="ag-grid-header">
                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                            </div>
                            <div className={`ag-theme-material ${isLoader && !props?.isMasterSummaryDrawer && "max-loader-height"}`}>
                                {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                                <AgGridReact
                                    defaultColDef={defaultColDef}
                                    floatingFilter={true}
                                    domLayout='autoHeight'
                                    // columnDefs={c}
                                    rowData={volumeDataList}
                                    editable={true}
                                    // pagination={true}
                                    paginationPageSize={globalTake}
                                    onGridReady={onGridReady}
                                    gridOptions={gridOptions}
                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                    noRowsOverlayComponentParams={{
                                        title: EMPTY_DATA,
                                        imagClass: 'imagClass'
                                    }}
                                    rowSelection={'multiple'}
                                    frameworkComponents={frameworkComponents}
                                    onFilterModified={onFloatingFilterChanged}
                                    onRowSelected={onRowSelect}
                                    suppressRowClickSelection={true}
                                    enableBrowserTooltips={true}
                                >
                                    <AgGridColumn field="CostingHead" headerName="Costing Head" cellRenderer={checkBoxRenderer}></AgGridColumn>
                                    <AgGridColumn field="FinancialYear" headerName="Financial Year"></AgGridColumn>
                                    <AgGridColumn field="NetPoPrice" headerName="Net Po Price"></AgGridColumn>
                                    <AgGridColumn field="BudgetedPoPrice" headerName="Budgeted Po Price" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    <AgGridColumn field="partNoWithRevNo" headerName="Part No. (Revision No.)" width={200}></AgGridColumn>
                                    <AgGridColumn field="plantNameWithCode" headerName="Plant (Code)"></AgGridColumn>
                                    {/*  <AgGridColumn field="BudgetedPrice" headerName="Budgeted Price"></AgGridColumn>   ONCE CODE DEPLOY FROM BACKEND THEN UNCOMENT THE LINE */}
                                    <AgGridColumn field="vendorNameWithCode" headerName="Vendor (Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    <AgGridColumn field="customerNameWithCode" headerName="Customer (Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    {!props?.isMasterSummaryDrawer && <AgGridColumn field="BudgetingId" width={120} headerName="Actions" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}
                                    {props.isMasterSummaryDrawer && <AgGridColumn field="Attachements" headerName='Attachments' cellRenderer='attachmentFormatter'></AgGridColumn>}
                                    {props.isMasterSummaryDrawer && <AgGridColumn field="Remark" tooltipField="Remark" ></AgGridColumn>}
                                </AgGridReact>
                                <div className='button-wrapper'>
                                    {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={globalTake} />}
                                    <div className="d-flex pagination-button-container">
                                        <p><button className="previous-btn" type="button" disabled={false} onClick={() => onBtPrevious()}> </button></p>
                                        {pageSize.pageSize10 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 10)}</p>}
                                        {pageSize.pageSize50 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 50)}</p>}
                                        {pageSize.pageSize100 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 100)}</p>}
                                        <p><button className="next-btn" type="button" onClick={() => onBtNext()}> </button></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                }

                {bulkUploadBtn && <Drawer anchor={"right"} open={bulkUploadBtn}>
                    <Container>
                        <div className='drawer-wrapper volume-drawer'>
                            <Row className="drawer-heading mb-0">
                                <Col>
                                    <div className={'header-wrapper left'}>
                                        <h3>Bulk Upload</h3>
                                    </div>
                                    <div
                                        onClick={toggleDrawer}
                                        className={'close-button right'}>
                                    </div>
                                </Col>
                            </Row>
                            <Row className="">
                                <Col md="12" className=""> <Nav tabs className="subtabs">

                                </Nav></Col>
                                <Col md="12" className='px-0 mt-3'><TabContent activeTab={activeTab}>
                                    <BulkUpload
                                        closeDrawer={closeActualBulkUploadDrawer}
                                        isEditFlag={false}
                                        fileName={'Budget'}
                                        isZBCVBCTemplate={true}
                                        messageLabel={'Budget Actual'}
                                        anchor={'right'}
                                        isDrawerfasle={true}
                                    />
                                </TabContent></Col>
                            </Row>
                        </div>
                    </Container>

                </Drawer>}
                {
                    attachment && (
                        <Attachament
                            isOpen={attachment}
                            index={viewAttachment}
                            closeDrawer={closeAttachmentDrawer}
                            anchor={'right'}
                            gridListing={true}
                        />
                    )
                }
            </div>
        </>
    )
}

export default BudgetListing;