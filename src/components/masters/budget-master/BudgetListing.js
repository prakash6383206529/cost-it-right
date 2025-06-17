import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, Container } from 'reactstrap'
import { MESSAGES } from '../../../config/message'
import { BUDGETING, defaultPageSize, EMPTY_DATA, ENTRY_TYPE_DOMESTIC, ENTRY_TYPE_IMPORT, FILE_URL } from '../../../config/constants'
import NoContentFound from '../../common/NoContentFound'
import { deleteBudget, getBudgetDataList, getPartCostingHead, } from '../actions/Budget'
import { BUDGET_DOWNLOAD_EXCEl, Vendor } from '../../../config/masterData'
import BulkUpload from '../../massUpload/BulkUpload'
import { ADDITIONAL_MASTERS } from '../../../config/constants'
import { checkPermission, getLocalizedCostingHeadValue, searchNocontentFilter, setLoremIpsum } from '../../../helper/util'
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
import { TourStartAction, disabledClass, setListToggle, setResetCostingHead } from '../../../actions/Common'
import { reactLocalStorage } from 'reactjs-localstorage'
import { Drawer } from '@material-ui/core'
import Attachament from '../../costing/components/Drawers/Attachament'
import Toaster from '../../common/Toaster'
import PopupMsgWrapper from '../../common/PopupMsgWrapper'
import Button from '../../layout/Button';
import { checkMasterCreateByCostingPermission } from '../../common/CommonFunctions'
import { resetStatePagination, updatePageNumber, updateCurrentRowIndex, updateGlobalTake } from '../../common/Pagination/paginationAction';
import { PaginationWrappers } from '../../common/Pagination/PaginationWrappers';
import PaginationControls from '../../common/Pagination/PaginationControls';
import TourWrapper from '../../common/Tour/TourWrapper'
import { Steps } from '../../common/Tour/TourMessages'
import { useTranslation } from 'react-i18next'
import { useLabels, useWithLocalization } from '../../../helper/core'
import { getConfigurationKey } from '../../../helper'
import Switch from 'react-switch'
import CostingHeadDropdownFilter from '../material-master/CostingHeadDropdownFilter'

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
    const [ViewAccessibility, setViewAccessibility] = useState(false);
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [isLoader, setIsLoader] = useState(false);
    const [dataCount, setDataCount] = useState(0);
    const [showExtraData, setShowExtraData] = useState(false)
    const [render, setRender] = useState(false)
    //STATES BELOW ARE MADE FOR PAGINATION PURPOSE
    const [disableFilter, setDisableFilter] = useState(true) // STATE MADE FOR CHECKBOX SELECTION
    const [warningMessage, setWarningMessage] = useState(false)
    // const [globalTake, setGlobalTake] = useState(defaultPageSize)
    const [filterModel, setFilterModel] = useState({});
    // const [pageNo, setPageNo] = useState(1)
    // const [pageNoNew, setPageNoNew] = useState(1)
    const [totalRecordCount, setTotalRecordCount] = useState(1)
    const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false)
    // const [currentRowIndex, setCurrentRowIndex] = useState(0)
    // const [pageSize, setPageSize] = useState({ pageSize10: true, pageSize50: false, pageSize100: false })
    const [floatingFilterData, setFloatingFilterData] = useState({ CostingHead: '', Year: '', Month: '', vendorNameWithCode: '', plantNameWithCode: '', partNoWithRevNo: '', PartName: '', BudgetedQuantity: '', ApprovedQuantity: '', applyPagination: '', skip: '', take: '', customerNameWithCode: '', PartType: '' })
    const [disableDownload, setDisableDownload] = useState(false)
    const [noData, setNoData] = useState(false)
    const [attachment, setAttachment] = useState(false);
    const [viewAttachment, setViewAttachment] = useState([])
    const [pageRecord, setPageRecord] = useState(0);
    const [showPopup, setShowPopup] = useState(false);
    const [deletedId, setDeletedId] = useState('');
    const { topAndLeftMenuData } = useSelector(state => state.auth);
    const { volumeDataList, volumeDataListForDownload } = useSelector(state => state.volume);
    const { globalTakes } = useSelector(state => state.pagination)
    const { selectedRowForPagination } = useSelector((state => state.simulation))
    const { listToggle } = useSelector((state) => state.comman)
    const [isImport, setIsImport] = useState(listToggle.Budget);
    const dispatch = useDispatch();
    const { t } = useTranslation("common")
    const { vendorLabel, vendorBasedLabel, zeroBasedLabel, customerBasedLabel, revisionNoLabel } = useLabels()
    useEffect(() => {
        applyPermission(topAndLeftMenuData)
        if (!props?.isMasterSummaryDrawer) {
            getTableListData(0, defaultPageSize, true, isImport)

            dispatch(getPartCostingHead((res) => {
                reactLocalStorage.setObject("budgetCostingHeads", res?.data?.SelectList); //FOR SHOWING DYNAMIC HEADERS IN BUDGET BULK UPLOAD EXCEL DOWNLOAD
            }))
        } return () => {
            dispatch(setSelectedRowForPagination([]))
            dispatch(resetStatePagination());
            dispatch(setResetCostingHead(true, "costingHead"))

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
        } else {
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
            const accessData = Data && Data.Pages.find((el) => el.PageName === BUDGETING)
            const permmisionData = accessData && accessData.Actions && checkPermission(accessData.Actions)
            if (permmisionData !== undefined) {
                setAddAccessibility(permmisionData && permmisionData.Add ? permmisionData.Add : false)
                setEditAccessibility(permmisionData && permmisionData.Edit ? permmisionData.Edit : false)
                setDeleteAccessibility(permmisionData && permmisionData.Delete ? permmisionData.Delete : false)
                setBulkUploadAccessibility(permmisionData && permmisionData.BulkUpload ? permmisionData.BulkUpload : false)
                setDownloadAccessibility(permmisionData && permmisionData.Download ? permmisionData.Download : false)
                setViewAccessibility(permmisionData && permmisionData.View ? permmisionData.View : false)
            }
        }
    }

    /**
     * @method getTableListData
     * @description Get user list data
     */
    const getTableListData = (skip = 0, take = 10, isPagination = true, BudgetedEntryType = false) => {
        setPageRecord(skip);
        if (isPagination === true || isPagination === null) setIsLoader(true)
        let dataObj = { ...floatingFilterData }
        //dataObj.ExchangeRateSourceName = floatingFilterData?.ExchangeRateSourceName

        const { zbc, vbc, cbc } = reactLocalStorage.getObject('CostingTypePermission')
        dataObj.IsCustomerDataShow = cbc
        dataObj.IsVendorDataShow = vbc
        dataObj.IsZeroDataShow = zbc
        dataObj.BudgetedEntryType = BudgetedEntryType ? ENTRY_TYPE_IMPORT : ENTRY_TYPE_DOMESTIC
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
                    // setPageNo(0)
                    dispatch(updatePageNumber(0))
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
                    dispatch(setResetCostingHead(false, "costingHead"))
                }, 330);

                setTimeout(() => {
                    setIsFilterButtonClicked(false)
                }, 600);
            }
        }))
    }
    /**
       * @method toggleExtraData
       * @description Handle specific module tour state to display lorem data
       */
    const toggleExtraData = (showTour) => {

        setRender(true)
        setTimeout(() => {
            setShowExtraData(showTour)
            setRender(false)
        }, 100);


    }
    /**
     * @method editItemDetails
     * @description confirm edit item
     */
    const editItemDetails = (Id, isViewMode) => {
        setData({ isEditFlag: true, ID: Id, isViewMode: isViewMode })
        setShowBudgetForm(true)
    }
    /**
     * @method deleteItem
     * @description confirm delete Raw Material details
     */
    const deleteItem = (Id) => {
        setShowPopup(true)
        setDeletedId(Id)
    }

    /**
    * @method confirmDelete
    * @description confirm delete Raw Material details
    */
    const confirmDelete = (ID) => {
        dispatch(deleteBudget(ID, (res) => {
            if (res && res?.data && res?.data?.Result === true) {
                Toaster.success(MESSAGES.DELETE_BUDGET_SUCCESS);
                dispatch(setSelectedRowForPagination([]));
                if (gridApi) {
                    gridApi.deselectAll();
                }
                getTableListData(pageRecord, globalTakes, true, isImport);
                setDataCount(0);
            }
        }));
        setShowPopup(false)
    }

    const onPopupConfirm = () => {
        confirmDelete(deletedId);
    }
    const closePopUp = () => {
        setShowPopup(false)
    }
    /**
  * @method buttonFormatter
  * @description Renders buttons
  */
    const buttonFormatter = (props) => {
        const cellValue = props?.value;
        const rowData = props?.data;
        return (
            <>  {ViewAccessibility && <Button id={`budgetListing_view${props.rowIndex}`} className={"mr-1 Tour_List_View"} variant="View" onClick={() => editItemDetails(cellValue, true)} title={"View"} />}
                {editAccessibility && <Button id={`budgetListing_edit${props.rowIndex}`} variant="Edit" className={"mr-1 Tour_List_Edit"} onClick={() => editItemDetails(cellValue, false)} title={"Edit"} />}
                {deleteAccessibility && <Button id={`budgetListing_delete${props.rowIndex}`} title='Delete' variant="Delete" onClick={() => deleteItem(rowData.BudgetingId)} className={"Tour_List_Delete"} />}
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


    const formToggle = () => {
        if (checkMasterCreateByCostingPermission()) {
            setShowBudgetForm(true)
        }
    }

    const returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData && TempData.map((item) => {
            for (const key in item) {
                if (item[key] === null || item[key] === undefined || item[key] === "") {
                    item[key] = "-"; // Set to hyphen if data is not available
                }
            }

            return item;

        })
        return (
            <ExcelSheet data={temp} name={'Budget'}>
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
        setDataCount(uniqeArrayVolumeApprovedId.length)
        dispatch(setSelectedRowForPagination(uniqeArrayVolumeApprovedId))              //SETTING CHECKBOX STATE DATA IN REDUCER
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
            getTableListData(0, defaultPageSize, false, isImport)
        }

    }
    const BUDGET_DOWNLOAD_EXCEl_LOCALIZATION = useWithLocalization(BUDGET_DOWNLOAD_EXCEl, "MasterLabels")
    const onBtExport = () => {
        let tempArr = []
        //tempArr = gridApi && gridApi?.getSelectedRows()
        tempArr = selectedRowForPagination
        tempArr = (tempArr && tempArr.length > 0) ? tempArr : (volumeDataListForDownload ? volumeDataListForDownload : [])
        const filteredLabels = BUDGET_DOWNLOAD_EXCEl_LOCALIZATION.filter(column => {
            if (column.value === "ExchangeRateSourceName") {
                return getConfigurationKey().IsSourceExchangeRateNameVisible
            }
            return true;
        })
        return returnExcelColumn(filteredLabels, tempArr)
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
                getTableListData(0, globalTakes, true, isImport)
        }, 200);
    }


    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
    };


    const onSearch = () => {
        setWarningMessage(false)
        setIsFilterButtonClicked(true)
        dispatch(updatePageNumber(1))
        dispatch(updateCurrentRowIndex(0))
        // setPageNo(1)
        // setPageNoNew(1)
        // setCurrentRowIndex(0)
        gridOptions?.columnApi?.resetColumnState();
        getTableListData(0, globalTakes, true, isImport)
    }

    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            if (volumeDataList?.length !== 0) {
                setNoData(searchNocontentFilter(value, noData))
                setTotalRecordCount(gridApi?.getDisplayedRowCount())
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
        dispatch(setResetCostingHead(true, "costingHead"))
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
            dispatch(resetStatePagination())
            // setPageNo(1)
            // setPageNoNew(1)
            // setCurrentRowIndex(0)
            getTableListData(0, 10, true, isImport)
            dispatch(setSelectedRowForPagination([]))
            // setGlobalTake(10)
            dispatch(updateGlobalTake(10))
            // setPageSize(prevState => ({ ...prevState, pageSize10: true, pageSize50: false, pageSize100: false }))
            setDataCount(0)
        }

    }
    const BulkToggle = () => {
        if (checkMasterCreateByCostingPermission(true)) {
            setBulkUploadBtn(true)
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

    const combinedCostingHeadRenderer = (props) => {
        // Call the existing checkBoxRenderer
        checkBoxRenderer(props);

        // Get and localize the cell value
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const localizedValue = getLocalizedCostingHeadValue(cellValue, vendorBasedLabel, zeroBasedLabel, customerBasedLabel);

        // Return the localized value (the checkbox will be handled by AgGrid's default renderer)
        return localizedValue;
    };
    const floatingFilterStatus = {
        maxValue: 1,
        suppressFilterButton: true,
        component: CostingHeadDropdownFilter,
        onFilterChange: (originalValue, value) => {
            setWarningMessage(true);
            // setSelectedCostingHead(originalValue);
            setDisableFilter(false);
            setFloatingFilterData(prevState => ({
                ...prevState,
                CostingHead: value
            }));
        }
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
        getTableListData(0, defaultPageSize, true, isImport)
    }

    const frameworkComponents = {
        combinedCostingHeadRenderer: combinedCostingHeadRenderer,
        totalValueRenderer: buttonFormatter,
        customNoRowsOverlay: NoContentFound,
        hyphenFormatter: hyphenFormatter,
        statusFilter: CostingHeadDropdownFilter,

    };

    if (showBudgetForm) {
        props?.formToggle(data, isImport)

    }

    const toggleDrawer = () => {
        setBulkUploadBtn(false)
    }
    const importToggle = () => {
        dispatch(setListToggle({ Budget: !isImport }));
        setIsImport(!isImport)
        getTableListData(0, defaultPageSize, true, !isImport)

    }
    /**
     * @method render
     * @description Renders the component
     */
    return (
        <>
            <div className={`ag-grid-react grid-parent-wrapper ${(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) ? "custom-pagination" : ""} ${downloadAccessibility ? "show-table-btn no-tab-page" : ""}`}>
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
                                        {(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) &&
                                            // <button disabled={disableFilter} title="Filtered data" type="button" class="user-btn mr5" onClick={() => onSearch()}><div class="filter mr-0"></div></button>
                                            <Button id="budgetListing_filter" className={"user-btn mr5 Tour_List_Filter"} onClick={() => onSearch()} title={"Filtered data"} icon={"filter"} disabled={disableFilter} />

                                        }
                                        {shown ? (
                                            <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => setShown(!shown)}>
                                                <div className="cancel-icon-white"></div></button>
                                        ) : (
                                            ""
                                        )}

                                        {addAccessibility && !props?.isMasterSummaryDrawer && !isImport && (
                                            <Button id="budgetListing_add" className={"user-btn mr5 Tour_List_Add "} onClick={formToggle} title={"Add"} icon={"plus mr-0"} />

                                        )}
                                        {bulkUploadAccessibility && !props?.isMasterSummaryDrawer &&
                                            <Button id="budgetListing_bulkUpload" className={"user-btn mr5 Tour_List_BulkUpload"} onClick={BulkToggle} title={"Bulk Upload"} icon={"upload mr-0"} />
                                        }

                                        {
                                            downloadAccessibility && !props?.isMasterSummaryDrawer &&
                                            <>
                                                <Button className="user-btn mr5 Tour_List_Download" id={"budgetListing_excel_download"} onClick={onExcelDownload} title={`Download ${dataCount === 0 ? "All" : "(" + dataCount + ")"}`}
                                                    icon={"download mr-1"}
                                                    disabled={totalRecordCount === 0}
                                                    buttonName={`${dataCount === 0 ? "All" : "(" + dataCount + ")"}`}
                                                />
                                                <ExcelFile filename={'Budget'} fileExtension={'.xls'} element={
                                                    <Button id={"Excel-Downloads-volume"} className="p-absolute" />
                                                }>
                                                    {totalRecordCount !== 0 ? onBtExport() : null}
                                                </ExcelFile>
                                            </>
                                        }
                                        <Button id={"budgetListing_refresh"} className={"Tour_List_Reset"} onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />

                                    </div>
                                </Col>
                                <Col md="4" className="switch mb15">
                                    <label className="switch-level">
                                        <div className="left-title">Domestic</div>
                                        <Switch
                                            onChange={importToggle}
                                            checked={isImport}
                                            id="normal-switch"
                                            background="#4DC771"
                                            onColor="#4DC771"
                                            onHandleColor="#ffffff"
                                            offColor="#4DC771"
                                            uncheckedIcon={false}
                                            checkedIcon={false}
                                            height={20}
                                            width={46}
                                        />
                                        <div className="right-title">Import</div>
                                    </label>
                                </Col>
                            </Row>
                        </form>

                        <div className={`ag-grid-wrapper height-width-wrapper  ${(volumeDataList && volumeDataList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                            <div className="ag-grid-header">
                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                {(!props?.isMasterSummaryDrawer) && <TourWrapper
                                    buttonSpecificProp={{ id: "Budget_Listing_Tour", onClick: toggleExtraData }}
                                    stepsSpecificProp={{
                                        steps: Steps(t, { addLimit: false, costMovementButton: false, copyButton: false, viewBOM: false, status: false, updateAssociatedTechnology: false, addMaterial: false, addAssociation: false, generateReport: false, approve: false, reject: false }).COMMON_LISTING
                                    }} />}
                            </div>
                            <div className={`ag-theme-material ${isLoader && !props?.isMasterSummaryDrawer && "max-loader-height"}`}>
                                {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                                <AgGridReact
                                    defaultColDef={defaultColDef}
                                    floatingFilter={true}
                                    domLayout='autoHeight'
                                    // columnDefs={c}
                                    rowData={showExtraData ? [...setLoremIpsum(volumeDataList[0]), ...volumeDataList] : volumeDataList}

                                    editable={true}
                                    // pagination={true}
                                    paginationPageSize={globalTakes}
                                    onGridReady={onGridReady}
                                    gridOptions={gridOptions}
                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                    noRowsOverlayComponentParams={{ title: EMPTY_DATA, imagClass: 'imagClass' }}
                                    rowSelection={'multiple'}
                                    frameworkComponents={frameworkComponents}
                                    onFilterModified={onFloatingFilterChanged}
                                    onRowSelected={onRowSelect}
                                    suppressRowClickSelection={true}
                                    enableBrowserTooltips={true}
                                >
                                    <AgGridColumn field="CostingHead" headerName="Costing Head" cellRenderer={combinedCostingHeadRenderer} floatingFilterComponentParams={floatingFilterStatus}
                                        floatingFilterComponent="statusFilter"></AgGridColumn>
                                    <AgGridColumn field="vendorNameWithCode" headerName={`${vendorLabel} (Code)`} cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    {reactLocalStorage.getObject('CostingTypePermission').cbc && <AgGridColumn field="customerNameWithCode" headerName="Customer (Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                                    <AgGridColumn field="plantNameWithCode" headerName="Plant (Code)"></AgGridColumn>
                                    <AgGridColumn field="PartType" headerName="Part Type" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    <AgGridColumn field="partNoWithRevNo" headerName={`Part No. (${revisionNoLabel})`} width={200}></AgGridColumn>
                                    <AgGridColumn field="FinancialYear" headerName="Financial Year"></AgGridColumn>
                                    {getConfigurationKey().IsSourceExchangeRateNameVisible && <AgGridColumn field="ExchangeRateSourceName" headerName="Exchange Rate Source" cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                                    <AgGridColumn field="Currency" headerName="Currency" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    <AgGridColumn field="NetPoPrice" headerName="Net Cost"></AgGridColumn>
                                    <AgGridColumn field="BudgetedPoPrice" headerName="Budgeted Cost" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    {/*  <AgGridColumn field="BudgetedPrice" headerName="Budgeted Price"></AgGridColumn>   ONCE CODE DEPLOY FROM BACKEND THEN UNCOMENT THE LINE */}
                                    {!props?.isMasterSummaryDrawer && <AgGridColumn field="BudgetingId" width={120} pinned="right" cellClass={"actions-wrapper ag-grid-action-container"} headerName="Actions" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}
                                    {props.isMasterSummaryDrawer && <AgGridColumn field="Attachements" headerName='Attachments' cellRenderer='attachmentFormatter'></AgGridColumn>}
                                    {props.isMasterSummaryDrawer && <AgGridColumn field="Remark" tooltipField="Remark" ></AgGridColumn>}
                                </AgGridReact>
                                <div className='button-wrapper'>
                                    {<PaginationWrappers gridApi={gridApi} totalRecordCount={totalRecordCount} getDataList={(newSkip, numericPageSize, isPagination) => getTableListData(newSkip, numericPageSize, isPagination, isImport)} floatingFilterData={floatingFilterData} module="Budget" />
                                    }
                                    {<PaginationControls totalRecordCount={totalRecordCount} getDataList={(newSkip, numericPageSize, isPagination) => getTableListData(newSkip, numericPageSize, isPagination, isImport)} floatingFilterData={floatingFilterData} module="Budget" />}

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
                                <Col md="12" className='px-0 mt-3'>
                                    <BulkUpload closeDrawer={closeActualBulkUploadDrawer} isEditFlag={false} fileName={'Budget'} isZBCVBCTemplate={true} messageLabel={'Budget Actual'} anchor={'right'} isDrawerfasle={true} />
                                </Col>
                            </Row>
                        </div>
                    </Container>

                </Drawer>}
                {showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.BUDGET_DELETE_ALERT}`} />}
                {attachment && (<Attachament isOpen={attachment} index={viewAttachment} closeDrawer={closeAttachmentDrawer} anchor={'right'} gridListing={true} />)}
            </div>
        </>
    )
}

export default BudgetListing;