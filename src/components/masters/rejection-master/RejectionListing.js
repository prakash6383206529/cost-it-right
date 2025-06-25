import React, { useState, useEffect, Fragment, useContext } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, } from 'reactstrap';
import { getOverheadDataList, deleteOverhead } from '../actions/OverheadProfit';
import { defaultPageSize, EMPTY_DATA } from '../../../config/constants';
import { getConfigurationKey, getLocalizedCostingHeadValue, loggedInUserId, searchNocontentFilter, setLoremIpsum, showBopLabel } from '../../../helper';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import Switch from "react-switch";
import { REJECTION_DOWNLOAD_EXCEl } from '../../../config/masterData';
import LoaderCustom from '../../common/LoaderCustom';
import DayTime from '../../common/DayTimeWrapper'
import { RejectionMaster } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { setSelectedRowForPagination } from '../../simulation/actions/Simulation';
import WarningMessage from '../../common/WarningMessage';
import { disabledClass, fetchModelTypeAPI, setResetCostingHead } from '../../../actions/Common';
import _ from 'lodash';
import SingleDropdownFloationFilter from '../material-master/SingleDropdownFloationFilter';
import { agGridStatus, getGridHeight, isResetClick } from '../../../actions/Common';
import { reactLocalStorage } from 'reactjs-localstorage';
import { checkMasterCreateByCostingPermission, hideColumnFromExcel, hideCustomerFromExcel } from '../../common/CommonFunctions';
import PaginationControls from '../../common/Pagination/PaginationControls';
import { PaginationWrappers } from '../../common/Pagination/PaginationWrappers';
import { updatePageNumber, updateCurrentRowIndex, resetStatePagination } from '../../common/Pagination/paginationAction';
import TourWrapper from '../../common/Tour/TourWrapper';
import { useTranslation } from 'react-i18next';
import { Steps } from '../../common/Tour/TourMessages';
import { ApplyPermission } from '.';
import BulkUpload from '../../../../src/components/massUpload/BulkUpload';
import { useLabels, useWithLocalization } from '../../../helper/core';
import CostingHeadDropdownFilter from '../material-master/CostingHeadDropdownFilter';


const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

function RejectionListing(props) {

    const { EditAccessibility, DeleteAccessibility, ViewAccessibility, BulkUploadAccessibility } = props;
    const { t } = useTranslation("common")
    const permissions = useContext(ApplyPermission);
    const { vendorLabel, vendorBasedLabel, zeroBasedLabel, customerBasedLabel, technologyLabel } = useLabels()

    const [showPopup, setShowPopup] = useState(false)
    const [deletedId, setDeletedId] = useState('')
    const [isLoader, setIsLoader] = useState(false)
    const dispatch = useDispatch()
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [disableFilter, setDisableFilter] = useState(true)
    const [disableDownload, setDisableDownload] = useState(false)
    const [showExtraData, setShowExtraData] = useState(false)
    const [render, setRender] = useState(false)
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
    const [state, setState] = useState({ isBulkUpload: false })
    const [floatingFilterData, setFloatingFilterData] = useState({ CostingHead: "", TechnologyName: "", RawMaterial: "", RMGrade: "", RMSpec: "", RawMaterialCode: "", Category: "", MaterialType: "", Plant: "", UOM: "", VendorName: "", BasicRate: "", ScrapRate: "", RMFreightCost: "", RMShearingCost: "", NetLandedCost: "", EffectiveDateNew: "", RawMaterialName: "", RawMaterialGrade: "" })
    let overheadProfitList = useSelector((state) => state.overheadProfit.overheadProfitList)
    let overheadProfitListAll = useSelector((state) => state.overheadProfit.overheadProfitListAll)
    const { selectedRowForPagination } = useSelector((state => state.simulation))
    const statusColumnData = useSelector((state) => state.comman.statusColumnData);
    const { globalTakes } = useSelector((state) => state.pagination)
    const modelTypes = useSelector(state => state.comman?.modelTypes)
    const [modelText, setModelText] = useState('')
    const [pageRecord, setPageRecord] = useState(0)

    // In CostingHeadDropdownFilter.js
    const onFilterChange = (event) => {
        // Clean and encode the filter value
        const filterValue = event.target.value;
        const cleanedValue = encodeFilterValue(filterValue);

        // Call the parent's filter change handler
        if (props.onFilterChange) {
            props.onFilterChange(filterValue, cleanedValue);
        }
    };

    // Helper function to clean and encode filter value
    const encodeFilterValue = (value) => {
        if (!value) return '';

        // Replace special combinations with encoded versions
        const encodedValue = value
            .replace(/\s\+\s/g, '%2B') // Replace ' + ' with encoded plus
            .replace(/\s/g, '%20');    // Replace spaces with encoded spaces

        return encodedValue;
    };
    var floatingFilterOverhead = {
        maxValue: 1,
        suppressFilterButton: true,
        component: 'overhead',
        onFilterChange: (originalValue, encodedValue) => {
            setDisableFilter(false);
            setFloatingFilterData(prevState => ({
                ...prevState,
                OverheadApplicabilityType: encodedValue
            }));
        }
    }

    const { isBulkUpload } = state;
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


    useEffect(() => {
        setTimeout(() => {
            if (!props.stopApiCallOnCancel) {
                getDataList(null, null, null, null, 0, 10, true, floatingFilterData)
            }
        }, 300);
        dispatch(fetchModelTypeAPI('--Model Types--', (res) => { }))
        dispatch(isResetClick(false, "applicablity"))
        dispatch(agGridStatus("", ""))
        dispatch(setSelectedRowForPagination([]))
        dispatch(resetStatePagination());
        return () => {
            dispatch(setResetCostingHead(true, "costingHead"))
        }

    }, [])

    useEffect(() => {
        if (overheadProfitList?.length > 0) {
            setTotalRecordCount(overheadProfitList[0].TotalRecordCount)
        }
        else {
            setNoData(false)
        }
        dispatch(getGridHeight({ value: overheadProfitList?.length, component: 'overhead' }))
    }, [overheadProfitList])

    useEffect(() => {
        const modelText = modelTypes?.reduce((acc, item) => {
            if (item.Value !== '0') acc.push(item.Text); // Only push valid items
            return acc;
        }, []).join('/'); // Join with slashes
        setModelText(modelText)
    }, [modelTypes])

    const getDataList = (costingHead = null, vendorName = null, overhead = null, modelType = null, skip = 0, take = 10, isPagination = true, dataObj) => {
        setPageRecord(skip)
        const filterData = {
            costing_head: costingHead,
            vendor_id: vendorName,
            overhead_applicability_type_id: overhead,
            model_type_id: modelType,
        }
        // Clean up the dataObj filters before sending to API
        const cleanedDataObj = {
            ...dataObj,
            OverheadApplicabilityType: dataObj?.OverheadApplicabilityType
                ? decodeURIComponent(dataObj?.OverheadApplicabilityType)
                : ''
        };
        if (isPagination === true) {
            setIsLoader(true)
        }
        dispatch(getOverheadDataList(filterData, skip, take, isPagination, cleanedDataObj, true, (res) => {
            setIsLoader(false)
            if (res && res.status === 204) {
                setTotalRecordCount(0)
                dispatch(updatePageNumber(0))
                // setPageNo(0)
            }

            if (res && isPagination === false) {
                setDisableDownload(false)
                dispatch(disabledClass(false))
                setTimeout(() => {
                    let button = document.getElementById('Excel-Downloads-Rejection')
                    button && button.click()
                }, 500);
            }

            if (res) {
                let isReset = true
                setTimeout(() => {
                    for (var prop in floatingFilterData) {
                        if (prop !== "DepartmentName" && floatingFilterData[prop] !== "") {
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
                    dispatch(setResetCostingHead(false, "costingHead"))
                }, 330);

                setTimeout(() => {
                    setIsFilterButtonClicked(false)
                }, 600);
            }
        }
        ))
    }


    useEffect(() => {

        if (statusColumnData?.id) {
            setDisableFilter(false)
            setWarningMessage(true)
            setFloatingFilterData(prevState => ({ ...prevState, OverheadApplicabilityType: encodeURIComponent(statusColumnData.data) }))
        }
    }, [statusColumnData])

    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            if (overheadProfitList?.length !== 0) {
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

    const toggleExtraData = (showTour) => {
        setRender(true)
        setTimeout(() => {
            setShowExtraData(showTour)
            setRender(false)
        }, 100);
    }
    const onSearch = () => {
        setNoData(false)
        setWarningMessage(false)
        setIsFilterButtonClicked(true)
        dispatch(updatePageNumber(1))
        dispatch(updateCurrentRowIndex(0))
        // setPageNo(1)
        // setPageNoNew(1)
        // setCurrentRowIndex(0)
        gridOptions?.columnApi?.resetColumnState();
        getDataList(null, null, null, null, 0, globalTakes, true, floatingFilterData)
    }



    const resetState = () => {
        setNoData(false)
        dispatch(agGridStatus("", ""))
        dispatch(isResetClick(true, "applicablity"))
        dispatch(setResetCostingHead(true, "costingHead"))
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
        getDataList(null, null, null, null, 0, 10, true, floatingFilterData)
        dispatch(setSelectedRowForPagination([]))
        // setGlobalTake(10)
        dispatch(resetStatePagination())
        // setPageSize(prevState => ({ ...prevState, pageSize10: true, pageSize50: false, pageSize100: false }))
        setDataCount(0)
    }


    /**
    * @method viewOrEditItemDetails
    * @description edit or view material type
    */
    const viewOrEditItemDetails = (Id, rowData, isViewMode) => {
        let data = {
            isEditFlag: true,
            Id: Id,
            IsVendor: rowData.CostingHead,
            isViewMode: isViewMode,
            costingTypeId: rowData.CostingTypeId,
        }
        props.getDetails(data, rowData?.IsOverheadAssociated);
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
        const loggedInUser = loggedInUserId();
        dispatch(deleteOverhead(ID, loggedInUser, (res) => {
            if (res?.data?.Result === true) {
                Toaster.success(MESSAGES.DELETE_REJECTION_SUCCESS);
                dispatch(setSelectedRowForPagination([]));
                if (gridApi) {
                    gridApi?.deselectAll();
                }
                getDataList(null, null, null, null, pageRecord, globalTakes, true, floatingFilterData);
                setDataCount(0);
            }
        }));
        setShowPopup(false);
    };



    const onPopupConfirm = () => {
        confirmDelete(deletedId);
    }

    const closePopUp = () => {
        setShowPopup(false)
    }

    /**
 * @method bulkToggle
 * @description This method toggles the bulk upload state.it sets the `isBulkUpload` state to true.
 */
    const bulkToggle = () => {
        if (checkMasterCreateByCostingPermission(true)) {
            setState((prevState) => ({ ...prevState, isBulkUpload: true }))
        }
    }

    /**
* @method closeBulkUploadDrawer
* @description This method toggles the bulk upload state.it sets the `isBulkUpload` state to false.
*/
    const closeBulkUploadDrawer = (event, type) => {
        setState((prevState) => ({ ...prevState, isBulkUpload: false }))
        if (type !== 'cancel') {
            resetState()
        }
    }

    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    const buttonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        ;
        return (
            <>
                {ViewAccessibility && <button title='View' className="View mr-2 Tour_List_View" type={'button'} onClick={() => viewOrEditItemDetails(cellValue, rowData, true)} />}
                {EditAccessibility && rowData?.IsEditable && <button title='Edit' className="Edit mr-2 Tour_List_Edit" type={'button'} onClick={() => viewOrEditItemDetails(cellValue, rowData, false)} />}
                {DeleteAccessibility && !rowData?.IsOverheadAssociated && <button title='Delete' className="Delete Tour_List_Delete" type={'button'} onClick={() => deleteItem(cellValue)} />}
            </>
        )
    };
    /**
    * @method effectiveDateFormatter
    * @description Renders buttons
    */
    const effectiveDateFormatter = (cell, row, enumObject, rowIndex) => {
        if (showExtraData && props?.rowIndex === 0) {
            return "Lorem Ipsum";
        } else {
            let value = cell.value != null ? DayTime(cell.value).format('DD/MM/YYYY') : '';
            return value
        }
    }

    /**
     * @method hyphenFormatter
     */
    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }


    /**
    * @method statusButtonFormatter
    * @description Renders buttons
    */
    const statusButtonFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <label htmlFor="normal-switch" className="normal-switch">
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
            Id: row.OverheadId,
            LoggedInUserId: loggedInUserId(),
            IsActive: !cell, //Status of the UOM.
        }
        this.props.activeInactiveOverhead(data, res => {
            if (res && res.data && res.data.Result) {
                if (cell === true) {
                    Toaster.success(MESSAGES.OVERHEAD_INACTIVE_SUCCESSFULLY)
                } else {
                    Toaster.success(MESSAGES.OVERHEAD_ACTIVE_SUCCESSFULLY)
                }
                getDataList(null, null, null, null)
            }
        })
    }


    const formToggle = () => {
        if (checkMasterCreateByCostingPermission()) {
            props?.formToggle()
        }
    }

    const onGridReady = (params) => {
        window.screen.width >= 1920 && params.api.sizeColumnsToFit();
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
                    if (selectedRowForPagination[i].OverheadId === event.data.OverheadId) {   // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
                        continue;
                    }
                    finalData.push(selectedRowForPagination[i])
                }

            } else {
                finalData = selectedRowForPagination
            }
            selectedRows = [...selectedRows, ...finalData]

        }

        let uniqeArray = _.uniqBy(selectedRows, "OverheadId")          //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
        setDataCount(uniqeArray.length)
        dispatch(setSelectedRowForPagination(uniqeArray))              //SETTING CHECKBOX STATE DATA IN REDUCER

    }


    const onExcelDownload = () => {
        setDisableDownload(true)
        dispatch(disabledClass(true))
        let tempArr = selectedRowForPagination
        if (tempArr?.length > 0) {
            setTimeout(() => {
                setDisableDownload(false)
                dispatch(disabledClass(false))
                let button = document.getElementById('Excel-Downloads-Rejection')
                button && button.click()
            }, 400);

        } else {
            getDataList(null, null, null, null, 0, defaultPageSize, false, floatingFilterData) // FOR EXCEL DOWNLOAD OF COMPLETE DATA
        }

    }
    const REJECTION_DOWNLOAD_EXCEl_LOCALIZATION = useWithLocalization(REJECTION_DOWNLOAD_EXCEl, "MasterLabels")
    const onBtExport = () => {

        let tempArr = []
        tempArr = selectedRowForPagination
        tempArr = (tempArr && tempArr.length > 0) ? tempArr : (overheadProfitListAll ? overheadProfitListAll : [])
        return returnExcelColumn(REJECTION_DOWNLOAD_EXCEl_LOCALIZATION, tempArr)
    };

    const returnExcelColumn = (data = [], TempData) => {
        let excelData = hideCustomerFromExcel(data, "CustomerName")
        if (!getConfigurationKey()?.PartAdditionalMasterFields?.IsShowPartFamily) {
            excelData = hideColumnFromExcel(data, "PartFamily");
        }
        let temp = []
        temp = TempData && TempData?.map(item => {
            Object.keys(item).forEach(field => {
                if (item[field] === null || item[field] === ' ') {
                    item[field] = '-';
                }
            });
            if (item?.EffectiveDate?.includes('T')) {
                item.EffectiveDate = DayTime(item.EffectiveDate).format('DD/MM/YYYY');
            }
            return item;
        });
        const isShowRawMaterial = getConfigurationKey().IsShowRawMaterialInOverheadProfitAndICC
        const excelColumns = excelData && excelData.map((ele, index) => {
            if ((ele.label === 'Raw Material Name' || ele.label === 'Raw Material Grade') && !isShowRawMaterial) {
                return null // hide column
            } else {
                return <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />
            }
        }).filter(Boolean) // remove null columns
        return <ExcelSheet data={temp} name={RejectionMaster}>{excelColumns}</ExcelSheet>
    }

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const combinedCostingHeadRenderer = (props) => {
        // Call the existing checkBoxRenderer
        checkBoxRenderer(props);

        // Get and localize the cell value
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const localizedValue = getLocalizedCostingHeadValue(cellValue, vendorBasedLabel, zeroBasedLabel, customerBasedLabel);

        // Return the localized value (the checkbox will be handled by AgGrid's default renderer)
        return localizedValue;
    };
    const checkBoxRenderer = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        if (selectedRowForPagination?.length > 0) {
            selectedRowForPagination.map((item) => {
                if (item.OverheadId === props.node.data.OverheadId) {
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
    * @method render
    * @description Renders the component
    */

    const { handleSubmit, AddAccessibility, DownloadAccessibility } = props;

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
    const floatingFilterStatus = {
        maxValue: 1,
        suppressFilterButton: true,
        component: CostingHeadDropdownFilter, onFilterChange: (originalValue, value) => {
            setWarningMessage(true);
            // setSelectedCostingHead(originalValue);
            setDisableFilter(false);
            setFloatingFilterData(prevState => ({
                ...prevState,
                CostingHead: value
            }));
        }
    };
    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        effectiveDateFormatter: effectiveDateFormatter,
        statusButtonFormatter: statusButtonFormatter,
        hyphenFormatter: hyphenFormatter,
        customNoRowsOverlay: NoContentFound,
        combinedCostingHeadRenderer: combinedCostingHeadRenderer,
        valuesFloatingFilter: SingleDropdownFloationFilter,
        statusFilter: CostingHeadDropdownFilter,
    };


    return (
        <>
            {
                isLoader ? <LoaderCustom customClass={"loader-center"} /> :
                    <div className={`ag-grid-react grid-parent-wrapper custom-pagination ${DownloadAccessibility ? "show-table-btn" : ""}`}>
                        {disableDownload && <LoaderCustom message={MESSAGES.DOWNLOADING_MESSAGE} />}
                        <Row className="pt-4 ">
                            <Col md="9" className="search-user-block mb-3 pl-0">
                                <div className="d-flex justify-content-end bd-highlight w100">
                                    <div className="warning-message d-flex align-items-center">
                                        {warningMessage && !disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                                        <button disabled={disableFilter} title="Filtered data" type="button" class="user-btn mr5 Tour_List_Filter" onClick={() => onSearch()}><div class="filter mr-0"></div></button>
                                    </div>

                                    {AddAccessibility && (
                                        <button
                                            type="button"
                                            className={"user-btn mr5 Tour_List_Add"}
                                            onClick={formToggle}
                                            title="Add"
                                        >
                                            <div className={"plus mr-0"}></div>
                                            {/* ADD */}
                                        </button>
                                    )}
                                    {BulkUploadAccessibility &&
                                        <button
                                            type="button"
                                            className={"user-btn mr5 Tour_List_Add"}
                                            onClick={bulkToggle}
                                            title="Bulk Upload"
                                        >
                                            <div className={"upload mr-0"}></div>

                                        </button>
                                    }
                                    {
                                        DownloadAccessibility &&
                                        <>
                                            <button title={`Download ${dataCount === 0 ? "All" : "(" + dataCount + ")"}`} type="button" disabled={totalRecordCount === 0} onClick={onExcelDownload} className={'user-btn mr5 Tour_List_Download'}><div className="download mr-1" ></div>
                                                {/* DOWNLOAD */}
                                                {`${dataCount === 0 ? "All" : "(" + dataCount + ")"}`}
                                            </button>
                                            <ExcelFile filename={'Rejection'} fileExtension={'.xls'} element={
                                                <button id={'Excel-Downloads-Rejection'} className="p-absolute" type="button" >
                                                </button>}>
                                                {onBtExport()}
                                            </ExcelFile>
                                        </>
                                    }

                                    <button type="button" className="user-btn Tour_List_Reset" title="Reset Grid" onClick={() => resetState()}>
                                        <div className="refresh mr-0"></div>
                                    </button>

                                </div>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                <div className={`ag-grid-wrapper height-width-wrapper report-grid ${(overheadProfitList && overheadProfitList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                                    <div className="ag-grid-header">
                                        <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                        <TourWrapper
                                            buttonSpecificProp={{ id: "Overhead_listing_Tour", onClick: toggleExtraData }}
                                            stepsSpecificProp={{
                                                steps: Steps(t, { bulkUpload: false, costMovementButton: false, addLimit: false, copyButton: false, viewBOM: false, status: false, updateAssociatedTechnology: false, addMaterial: false, addAssociation: false, generateReport: false, approve: false, reject: false }).COMMON_LISTING
                                            }} />
                                    </div>
                                    <div className={`ag-theme-material ${isLoader && "max-loader-height"}`}>
                                        {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                                        {render ? <LoaderCustom customClass="loader-center" /> : <AgGridReact

                                            defaultColDef={defaultColDef}
                                            floatingFilter={true}
                                            domLayout='autoHeight'
                                            rowData={showExtraData ? [...setLoremIpsum(overheadProfitList[0]), ...overheadProfitList] : overheadProfitList}

                                            pagination={true}
                                            paginationPageSize={globalTakes}
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
                                        >
                                            <AgGridColumn field="CostingHead" minWidth={200} headerName="Costing Head" cellRenderer={combinedCostingHeadRenderer} floatingFilterComponentParams={floatingFilterStatus}
                                                floatingFilterComponent="statusFilter"></AgGridColumn>
                                            <AgGridColumn field="TechnologyName" tooltipField='Technologies' filter={true} floatingFilter={true} headerName={technologyLabel}></AgGridColumn>
                                            {getConfigurationKey().IsShowRawMaterialInOverheadProfitAndICC && <AgGridColumn field="RawMaterialName" headerName='Raw Material Name'></AgGridColumn>}
                                            {getConfigurationKey().IsShowRawMaterialInOverheadProfitAndICC && <AgGridColumn field="RawMaterialGrade" headerName="Raw Material Grade"></AgGridColumn>}
                                            {(getConfigurationKey().IsPlantRequiredForOverheadProfitInterestRate || getConfigurationKey().IsDestinationPlantConfigure) && <AgGridColumn field="PlantName" headerName="Plant (Code)"></AgGridColumn>}
                                            <AgGridColumn field="VendorName" headerName={`${vendorLabel} (Code)`} cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                            {reactLocalStorage.getObject('CostingTypePermission').cbc && <AgGridColumn field="CustomerName" headerName="Customer (Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                                            {getConfigurationKey()?.PartAdditionalMasterFields?.IsShowPartFamily && <AgGridColumn field="PartFamily" headerName="Part Family (Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                                            <AgGridColumn field="ModelType" headerName="Model Type"></AgGridColumn>
                                            <AgGridColumn field="Applicability" headerName="Rejection Applicability" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                            <AgGridColumn field="EffectiveDateNew" headerName="Effective Date" cellRenderer={'effectiveDateFormatter'} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                                            <AgGridColumn field="OverheadId" width={180} cellClass="ag-grid-action-container" pinned="right" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                                        </AgGridReact>}
                                        <div className='button-wrapper'>
                                            {<PaginationWrappers gridApi={gridApi} totalRecordCount={totalRecordCount} getDataList={getDataList} floatingFilterData={floatingFilterData} module="overHeadAndProfits" />}
                                            {<PaginationControls totalRecordCount={totalRecordCount} getDataList={getDataList} floatingFilterData={floatingFilterData} module="overHeadAndProfits" />
                                            }
                                        </div>
                                    </div>
                                </div>

                            </Col>
                        </Row>
                        {isBulkUpload && <BulkUpload isOpen={isBulkUpload} closeDrawer={closeBulkUploadDrawer} isEditFlag={false} fileName={`Rejection`} isZBCVBCTemplate={true} messageLabel={`Rejection`} anchor={'right'} modelText={modelText} />}
                        {
                            showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.REJECTION_DELETE_ALERT}`} />
                        }

                    </div >
            }
        </>

    );

}

export default RejectionListing
