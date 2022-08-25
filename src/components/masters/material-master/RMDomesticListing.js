import React from 'react';
import { useState, useEffect, } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, } from 'reactstrap';
import {
    deleteRawMaterialAPI, getRMDomesticDataList, masterFinalLevelUser,
} from '../actions/Material';
import { checkForDecimalAndNull } from "../../../helper/validation";
import { userDepartmetList } from "../../../helper/auth"
import { APPROVED_STATUS, defaultPageSize, EMPTY_DATA, RMDOMESTIC } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import 'react-input-range/lib/css/index.css'
import DayTime from '../../common/DayTimeWrapper'
import BulkUpload from '../../massUpload/BulkUpload';
import LoaderCustom from '../../common/LoaderCustom';
import { RMDOMESTIC_DOWNLOAD_EXCEl } from '../../../config/masterData';
import { RM_MASTER_ID, APPROVAL_ID } from '../../../config/constants'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import ReactExport from 'react-export-excel';
import { CheckApprovalApplicableMaster, getConfigurationKey, loggedInUserId, userDetails } from '../../../helper';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { getListingForSimulationCombined, setSelectedRowForPagination } from '../../simulation/actions/Simulation';
import WarningMessage from '../../common/WarningMessage';
import { PaginationWrapper } from '../../common/commonPagination';
import _ from 'lodash';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};


function RMDomesticListing(props) {
    const { AddAccessibility, BulkUploadAccessibility, ViewRMAccessibility, EditAccessibility, DeleteAccessibility, DownloadAccessibility, isSimulation, apply, selectionForListingMasterAPI, objectForMultipleSimulation, ListFor } = props;
    const [value, setvalue] = useState({ min: 0, max: 0 });
    const [isBulkUpload, setisBulkUpload] = useState(false);
    const [gridApi, setgridApi] = useState(null);                      // DONT DELETE THIS STATE , IT IS USED BY AG GRID
    const [gridColumnApi, setgridColumnApi] = useState(null);          // DONT DELETE THIS STATE , IT IS USED BY AG GRID
    const [loader, setloader] = useState(false);
    const dispatch = useDispatch();
    const rmDataList = useSelector((state) => state.material.rmDataList);
    const allRmDataList = useSelector((state) => state.material.allRmDataList);
    const filteredRMData = useSelector((state) => state.material.filteredRMData);
    const { selectedRowForPagination } = useSelector((state => state.simulation))
    const [showPopup, setShowPopup] = useState(false)
    const [deletedId, setDeletedId] = useState('')
    const [showPopupBulk, setShowPopupBulk] = useState(false)
    const [isFinalLevelUser, setIsFinalLevelUser] = useState(false)
    const [disableFilter, setDisableFilter] = useState(true) // STATE MADE FOR CHECKBOX IN SIMULATION
    const [disableDownload, setDisableDownload] = useState(false)
    //STATES BELOW ARE MADE FOR PAGINATION PURPOSE
    const [warningMessage, setWarningMessage] = useState(false)
    const [globalTake, setGlobalTake] = useState(defaultPageSize)
    const [filterModel, setFilterModel] = useState({});
    const [pageNo, setPageNo] = useState(1)
    const [pageNoNew, setPageNoNew] = useState(1)
    const [totalRecordCount, setTotalRecordCount] = useState(1)
    const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false)
    const [currentRowIndex, setCurrentRowIndex] = useState(0)
    const [pageSize, setPageSize] = useState({ pageSize10: true, pageSize50: false, pageSize100: false })
    const [floatingFilterData, setFloatingFilterData] = useState({ CostingHead: "", TechnologyName: "", RawMaterial: "", RMGrade: "", RMSpec: "", RawMaterialCode: "", Category: "", MaterialType: "", Plant: "", UOM: "", VendorName: "", BasicRate: "", ScrapRate: "", RMFreightCost: "", RMShearingCost: "", NetLandedCost: "", EffectiveDate: "", DepartmentName: isSimulation ? userDepartmetList() : "" })


    var filterParams = {
        comparator: function (filterLocalDateAtMidnight, cellValue) {
            var dateAsString = cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
            var newDate = filterLocalDateAtMidnight != null ? DayTime(filterLocalDateAtMidnight).format('DD/MM/YYYY') : '';
            setFloatingFilterData({ ...floatingFilterData, EffectiveDate: newDate })
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
        if (rmDataList?.length > 0) {
            setTotalRecordCount(rmDataList[0].TotalRecordCount)
        }

    }, [rmDataList])

    useEffect(() => {
        if (!props.stopApiCallOnCancel) {
            if (isSimulation && selectionForListingMasterAPI === 'Combined') {
                props?.changeSetLoader(true)
                dispatch(getListingForSimulationCombined(objectForMultipleSimulation, RMDOMESTIC, (res) => {
                    props?.changeSetLoader(false)
                }))
            } else {
                if (isSimulation) {
                    props?.changeTokenCheckBox(false)
                }
                getDataList(null, null, null, null, null, 0, 0, defaultPageSize, true, floatingFilterData)
            }
            setvalue({ min: 0, max: 0 });
        }
    }, [])


    useEffect(() => {
        if (!props.stopApiCallOnCancel) {
            let obj = {
                MasterId: RM_MASTER_ID,
                DepartmentId: userDetails().DepartmentId,
                LoggedInUserLevelId: userDetails().LoggedInMasterLevelId,
                LoggedInUserId: loggedInUserId()
            }
            dispatch(masterFinalLevelUser(obj, (res) => {
                if (res?.data?.Result) {
                    setIsFinalLevelUser(res.data.Data.IsFinalApprovar)
                }
            }))

            return () => {
                dispatch(setSelectedRowForPagination([]))
            }
        }
    }, [])


    /**
    * @method hideForm
    * @description HIDE DOMESTIC, IMPORT FORMS
    */
    const getDataList = (costingHead = null, plantId = null, materialId = null, gradeId = null, vendorId = null, technologyId = 0, skip = 0, take = 100, isPagination = true, dataObj) => {
        const { isSimulation } = props
        // TO HANDLE FUTURE CONDITIONS LIKE [APPROVED_STATUS, DRAFT_STATUS] FOR MULTIPLE STATUS
        let statusString = [APPROVED_STATUS].join(",")

        const filterData = {
            costingHead: isSimulation && filteredRMData && filteredRMData.costingHeadTemp ? filteredRMData.costingHeadTemp.value : costingHead,
            plantId: isSimulation && filteredRMData && filteredRMData.plantId ? filteredRMData.plantId.value : plantId,
            material_id: isSimulation && filteredRMData && filteredRMData.RMid ? filteredRMData.RMid.value : materialId,
            grade_id: isSimulation && filteredRMData && filteredRMData.RMGradeid ? filteredRMData.RMGradeid.value : gradeId,
            vendor_id: isSimulation && filteredRMData && filteredRMData.Vendorid ? filteredRMData.Vendorid.value : vendorId,
            technologyId: isSimulation ? props.technology : technologyId,
            net_landed_min_range: value.min,
            net_landed_max_range: value.max,
            statusId: CheckApprovalApplicableMaster(RM_MASTER_ID) ? APPROVAL_ID : 0,
            ListFor: ListFor,
            StatusId: statusString
        }
        //THIS CONDTION IS FOR IF THIS COMPONENT IS RENDER FROM MASTER APPROVAL SUMMARY IN THIS NO GET API
        if (isPagination === true) {
            setloader(true)
        }
        if (!props.isMasterSummaryDrawer) {
            dispatch(getRMDomesticDataList(filterData, skip, take, isPagination, dataObj, (res) => {
                // apply(selectedRowForPagination, selectedRowForPagination.length)
                if (isSimulation) {
                    props?.changeTokenCheckBox(true)
                }
                if (res && res.status === 200) {
                    setloader(false);

                } else if (res && res.response && res.response.status === 412) {
                    setloader(false);

                } else {
                    setloader(false);
                }

                if (res && isPagination === false) {
                    setDisableDownload(false)
                    setTimeout(() => {
                        let button = document.getElementById('Excel-Downloads-rm-import')
                        button && button.click()
                    }, 500);
                }

                if (res) {
                    let isReset = true
                    setTimeout(() => {
                        for (var prop in floatingFilterData) {

                            if (isSimulation && getConfigurationKey().IsCompanyConfigureOnPlant) {
                                if (floatingFilterData[prop] !== "") {
                                    isReset = false
                                }
                            } else {

                                if (prop !== "DepartmentName" && floatingFilterData[prop] !== "") {
                                    isReset = false
                                }
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
    }


    const onFloatingFilterChanged = (value) => {
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

                        if (isSimulation && getConfigurationKey().IsCompanyConfigureOnPlant) {
                            if (prop !== "DepartmentName") {
                                floatingFilterData[prop] = ""
                            }

                        } else {
                            floatingFilterData[prop] = ""
                        }
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


    const onSearch = () => {

        setWarningMessage(false)
        setIsFilterButtonClicked(true)
        setPageNo(1)
        setPageNoNew(1)
        setCurrentRowIndex(0)
        gridOptions?.columnApi?.resetColumnState();
        getDataList(null, null, null, null, null, 0, 0, globalTake, true, floatingFilterData)
    }



    const resetState = () => {
        setIsFilterButtonClicked(false)
        gridOptions?.columnApi?.resetColumnState(null);
        gridOptions?.api?.setFilterModel(null);

        for (var prop in floatingFilterData) {

            if (isSimulation && getConfigurationKey().IsCompanyConfigureOnPlant) {
                if (prop !== "DepartmentName") {
                    floatingFilterData[prop] = ""
                }
            } else {
                floatingFilterData[prop] = ""
            }
        }

        setFloatingFilterData(floatingFilterData)
        setWarningMessage(false)
        setPageNo(1)
        setPageNoNew(1)
        setCurrentRowIndex(0)
        getDataList(null, null, null, null, null, 0, 0, 10, true, floatingFilterData)
        dispatch(setSelectedRowForPagination([]))
        setGlobalTake(10)
        setPageSize(prevState => ({ ...prevState, pageSize10: true, pageSize50: false, pageSize100: false }))
    }


    const onBtPrevious = () => {
        if (currentRowIndex >= 10) {
            setPageNo(pageNo - 1)
            setPageNoNew(pageNo - 1)
            const previousNo = currentRowIndex - 10;
            getDataList(null, null, null, null, null, 0, previousNo, globalTake, true, floatingFilterData)
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
            getDataList(null, null, null, null, null, 0, nextNo, globalTake, true, floatingFilterData)
            setCurrentRowIndex(nextNo)
        }
    };

    /**
    * @method editItemDetails
    * @description edit material type
    */
    const viewOrEditItemDetails = (Id, rowData = {}, isViewMode) => {
        let data = {

            isEditFlag: true,
            isViewFlag: isViewMode,
            Id: Id,
            IsVendor: rowData.CostingHead === 'Vendor Based' ? true : rowData.CostingHead === 'Zero Based' ? false : rowData.CostingHead,
        }
        props.getDetails(data, rowData?.IsRMAssociated);
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
        dispatch(deleteRawMaterialAPI(ID, (res) => {
            if (res !== undefined && res.status === 417 && res.data.Result === false) {
                Toaster.error(res.data.Message)
            } else if (res && res.data && res.data.Result === true) {
                Toaster.success(MESSAGES.DELETE_RAW_MATERIAL_SUCCESS);
                resetState()
            }
        }));
        setShowPopup(false)
    }

    const onPopupConfirm = () => {
        confirmDelete(deletedId);
    }
    const onPopupConfirmBulk = () => {
        confirmDensity()
    }
    const closePopUp = () => {
        setShowPopup(false)
        setShowPopupBulk(false)
    }
    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    const buttonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        let isEditbale = false
        let isDeleteButton = false


        if (EditAccessibility) {
            isEditbale = true
        } else {
            isEditbale = false
        }

        if (EditAccessibility && !rowData.IsRMAssociated) {
            isEditbale = true
        } else {
            isEditbale = false
        }

        if (DeleteAccessibility && !rowData.IsRMAssociated) {
            isDeleteButton = true
        } else {
            isDeleteButton = false
        }

        return (
            <>
                {ViewRMAccessibility && < button title='View' className="View" type={'button'} onClick={() => viewOrEditItemDetails(cellValue, rowData, true)} />}
                {isEditbale && <button title='Edit' className="Edit align-middle" type={'button'} onClick={() => viewOrEditItemDetails(cellValue, rowData, false)} />}
                {isDeleteButton && <button title='Delete' className="Delete align-middle" type={'button'} onClick={() => deleteItem(cellValue)} />}
            </>
        )
    };

    /**
    * @method costingHeadFormatter
    * @description Renders Costing head
    */
    const costingHeadFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;

        let data = (cellValue === true || cellValue === 'Vendor Based' || cellValue === 'VBC') ? 'Vendor Based' : 'Zero Based';

        return data;
    }


    const costFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        let value = cell != null ? checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice) : '';
        return value
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
    * @method hyphenFormatter
    */
    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }

    const statusFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // CHANGE IN STATUS IN AFTER KAMAL SIR API
        return <div className={row.Status}>{row.DisplayStatus}</div>
    }

    /**
    * @method commonCostFormatter
    * @description Renders buttons
    */
    const commonCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice) : '-';
    }


    const formToggle = () => {
        props.formToggle()
    }

    const bulkToggle = () => {
        setisBulkUpload(true);
    }

    const closeBulkUploadDrawer = () => {
        setisBulkUpload(false);
        resetState()
    }

    /**
    * @method densityAlert
    * @description confirm Redirection to Material tab.
    */
    const densityAlert = () => {
    }


    /**
    * @method confirmDensity
    * @description confirm density popup.
    */
    const confirmDensity = () => {
        props.toggle('4')
    }


    const onGridReady = (params) => {
        setgridApi(params.api);

        setgridColumnApi(params.columnApi);
        params.api.paginationGoToPage(0);
    };

    const onPageSizeChanged = (newPageSize) => {

        if (Number(newPageSize) === 10) {
            getDataList(null, null, null, null, null, 0, currentRowIndex, 10, true, floatingFilterData)
            setPageSize(prevState => ({ ...prevState, pageSize10: true, pageSize50: false, pageSize100: false }))
            setGlobalTake(10)
            setPageNo(pageNoNew)
        }
        else if (Number(newPageSize) === 50) {
            getDataList(null, null, null, null, null, 0, currentRowIndex, 50, true, floatingFilterData)
            setPageSize(prevState => ({ ...prevState, pageSize50: true, pageSize10: false, pageSize100: false }))
            setGlobalTake(50)
            setPageNo(pageNoNew)
            if (pageNo >= Math.ceil(totalRecordCount / 50)) {
                setPageNo(Math.ceil(totalRecordCount / 50))
                getDataList(null, null, null, null, null, 0, 0, 50, true, floatingFilterData)
            }
        }
        else if (Number(newPageSize) === 100) {
            getDataList(null, null, null, null, null, 0, currentRowIndex, 100, true, floatingFilterData)
            setPageSize(prevState => ({ ...prevState, pageSize100: true, pageSize10: false, pageSize50: false }))
            setGlobalTake(100)
            if (pageNo >= Math.ceil(totalRecordCount / 100)) {
                setPageNo(Math.ceil(totalRecordCount / 100))
                getDataList(null, null, null, null, null, 0, 0, 100, true, floatingFilterData)
            }
        }

        gridApi.paginationSetPageSize(Number(newPageSize));

    };

    const returnExcelColumn = (data = [], TempData) => {
        let temp = []

        temp = TempData && TempData.map((item) => {
            if (item.CostingHead === true) {
                item.CostingHead = 'Vendor Based'
                item.EffectiveDate = (item.EffectiveDate)?.slice(0, 10)

            } else if (item.CostingHead === false) {
                item.CostingHead = 'Zero Based'
                item.EffectiveDate = (item.EffectiveDate)?.slice(0, 10)

            } else {
                item.EffectiveDate = (item.EffectiveDate)?.slice(0, 10)

            }
            return item
        })

        return (

            <ExcelSheet data={temp} name={'RM Domestic'}>
                {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
    }



    const onExcelDownload = () => {
        setDisableDownload(true)

        //let tempArr = gridApi && gridApi?.getSelectedRows()
        let tempArr = selectedRowForPagination
        if (tempArr?.length > 0) {
            setTimeout(() => {
                setDisableDownload(false)
                let button = document.getElementById('Excel-Downloads-rm-import')
                button && button.click()
            }, 400);


        } else {

            getDataList(null, null, null, null, null, 0, 0, defaultPageSize, false, floatingFilterData) // FOR EXCEL DOWNLOAD OF COMPLETE DATA
        }

    }

    const onBtExport = () => {
        let tempArr = []
        //tempArr = gridApi && gridApi?.getSelectedRows()
        tempArr = selectedRowForPagination


        tempArr = (tempArr && tempArr.length > 0) ? tempArr : (allRmDataList ? allRmDataList : [])
        return returnExcelColumn(RMDOMESTIC_DOWNLOAD_EXCEl, tempArr)
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }


    const isFirstColumn = (params) => {

        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;

        if (props?.isMasterSummaryDrawer) {
            return false
        } else {
            return thisIsFirstColumn;
        }

    }

    const onRowSelect = (event) => {

        var selectedRows = gridApi && gridApi?.getSelectedRows();
        if (selectedRows === undefined || selectedRows === null) {    //CONDITION FOR FIRST RENDERING OF COMPONENT
            selectedRows = selectedRowForPagination
        } else if (selectedRowForPagination && selectedRowForPagination.length > 0) {  // CHECKING IF REDUCER HAS DATA

            let finalData = []
            if (event.node.isSelected() === false) {    // CHECKING IF CURRENT CHECKBOX IS UNSELECTED

                for (let i = 0; i < selectedRowForPagination.length; i++) {
                    if (selectedRowForPagination[i].RawMaterialId === event.data.RawMaterialId) {   // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
                        continue;
                    }
                    finalData.push(selectedRowForPagination[i])
                }

            } else {
                finalData = selectedRowForPagination
            }
            selectedRows = [...selectedRows, ...finalData]

        }


        let uniqeArray = _.uniqBy(selectedRows, "RawMaterialId")          //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
        dispatch(setSelectedRowForPagination(uniqeArray))              //SETTING CHECKBOX STATE DATA IN REDUCER
        let finalArr = selectedRows
        let length = finalArr?.length
        let uniqueArray = _.uniqBy(finalArr, "RawMaterialId")


        if (isSimulation) {
            apply(uniqueArray, length)
        }
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
        headerCheckboxSelection: isSimulation ? isFirstColumn : false,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: isFirstColumn
    };

    const checkBoxRenderer = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        if (selectedRowForPagination?.length > 0) {
            selectedRowForPagination.map((item) => {
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

    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        effectiveDateRenderer: effectiveDateFormatter,
        costingHeadRenderer: costingHeadFormatter,
        customNoRowsOverlay: NoContentFound,
        costFormatter: costFormatter,
        commonCostFormatter: commonCostFormatter,
        statusFormatter: statusFormatter,
        hyphenFormatter: hyphenFormatter,
        checkBoxRenderer: checkBoxRenderer

    }


    return (
        <div className={`ag-grid-react ${(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) ? "custom-pagination" : ""} ${DownloadAccessibility ? "show-table-btn" : ""} ${isSimulation ? 'simulation-height' : props?.isMasterSummaryDrawer ? '' : 'min-height100vh'}`}>
            {(loader && !props.isMasterSummaryDrawer) ? <LoaderCustom customClass="simulation-Loader" /> :
                <>

                    <Row className={`filter-row-large pt-4 ${props?.isSimulation ? 'zindex-0 ' : ''}`}>
                        <Col md="3" lg="3" className='mb-2'>
                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                        </Col>
                        <Col md="9" lg="9" className="mb-3 d-flex justify-content-end">
                            {
                                // SHOW FILTER BUTTON ONLY FOR RM MASTER NOT FOR SIMULATION AMD MASTER APPROVAL SUMMARY
                                (!props.isMasterSummaryDrawer) &&
                                <>

                                    {isSimulation &&

                                        <div className="warning-message d-flex align-items-center">
                                            {warningMessage && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                                            <button disabled={disableFilter} title="Filtered data" type="button" class="user-btn mr5" onClick={() => onSearch()}><div class="filter mr-0"></div></button>
                                        </div>
                                    }
                                    {!isSimulation &&
                                        <div className="d-flex justify-content-end bd-highlight w100">

                                            <>
                                                {(props?.isMasterSummaryDrawer === undefined || this.props?.isMasterSummaryDrawer === false) &&
                                                    <div className="warning-message d-flex align-items-center">
                                                        {warningMessage && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                                                    </div>
                                                }
                                                {(props?.isMasterSummaryDrawer === undefined || this.props?.isMasterSummaryDrawer === false) &&
                                                    <button disabled={disableFilter} title="Filtered data" type="button" class="user-btn mr5" onClick={() => onSearch()}><div class="filter mr-0"></div></button>
                                                }

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
                                                {BulkUploadAccessibility && (
                                                    <button
                                                        type="button"
                                                        className={"user-btn mr5"}
                                                        onClick={bulkToggle}
                                                        title="Bulk Upload"
                                                    >
                                                        <div className={"upload mr-0"}></div>
                                                        {/* Bulk Upload */}
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

                                                                <ExcelFile filename={'RM Domestic'} fileExtension={'.xls'} element={
                                                                    <button id={'Excel-Downloads-rm-import'} className="p-absolute" type="button" >
                                                                    </button>}>
                                                                    {onBtExport()}
                                                                </ExcelFile>

                                                            </>

                                                        }

                                                    </>
                                                }

                                            </>
                                        </div>
                                    }
                                    <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                                        <div className="refresh mr-0"></div>
                                    </button>
                                </>
                            }
                        </Col>

                    </Row>
                    <Row>
                        <Col>
                            <div className={`ag-grid-wrapper ${props?.isDataInMaster ? 'master-approval-overlay' : ''} ${rmDataList && rmDataList?.length <= 0 ? 'overlay-contain' : ''}`}>
                                <div className={`ag-theme-material ${(loader && !props.isMasterSummaryDrawer) && "max-loader-height"}`}>
                                    <AgGridReact
                                        style={{ height: '100%', width: '100%' }}
                                        defaultColDef={defaultColDef}
                                        floatingFilter={true}
                                        domLayout='autoHeight'
                                        rowData={rmDataList}
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
                                    >
                                        <AgGridColumn cellClass="has-checkbox" field="CostingHead" headerName='Costing Head' cellRenderer={checkBoxRenderer}></AgGridColumn>
                                        <AgGridColumn field="TechnologyName" headerName='Technology'></AgGridColumn>
                                        <AgGridColumn field="RawMaterial" ></AgGridColumn>
                                        <AgGridColumn field="RMGrade"></AgGridColumn>
                                        <AgGridColumn field="RMSpec" headerName="RM Specs"></AgGridColumn>
                                        <AgGridColumn field="RawMaterialCode" headerName='Code' cellRenderer='hyphenFormatter'></AgGridColumn>
                                        <AgGridColumn field="Category"></AgGridColumn>
                                        <AgGridColumn field="MaterialType"></AgGridColumn>
                                        <AgGridColumn field="Plant" headerName="Plant(Code)"></AgGridColumn>
                                        <AgGridColumn field="VendorName" headerName="Vendor(Code)"></AgGridColumn>
                                        {/* <AgGridColumn field="DepartmentName" headerName="Department"></AgGridColumn> */}
                                        <AgGridColumn field="UOM"></AgGridColumn>
                                        <AgGridColumn field="BasicRate" cellRenderer='commonCostFormatter'></AgGridColumn>
                                        <AgGridColumn field="ScrapRate" cellRenderer='commonCostFormatter'></AgGridColumn>
                                        <AgGridColumn field="RMFreightCost" headerName="Freight Cost" cellRenderer='commonCostFormatter'></AgGridColumn>
                                        <AgGridColumn field="RMShearingCost" headerName="Shearing Cost" cellRenderer='commonCostFormatter'></AgGridColumn>
                                        <AgGridColumn field="NetLandedCost" headerName="Net Cost" cellRenderer='costFormatter'></AgGridColumn>
                                        <AgGridColumn field="EffectiveDate" cellRenderer='effectiveDateRenderer' filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                                        {(!isSimulation && !props.isMasterSummaryDrawer) && <AgGridColumn width={160} field="RawMaterialId" cellClass={"actions-wrapper"} headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}
                                        <AgGridColumn field="VendorId" hide={true}></AgGridColumn>
                                        <AgGridColumn field="TechnologyId" hide={true}></AgGridColumn>
                                    </AgGridReact>
                                    <div className='button-wrapper'>
                                        {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={globalTake} />}
                                        {(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) &&
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
                        </Col>
                    </Row>
                </>
            }
            {
                isBulkUpload && (
                    <BulkUpload
                        isOpen={isBulkUpload}
                        closeDrawer={closeBulkUploadDrawer}
                        isEditFlag={false}
                        densityAlert={densityAlert}
                        fileName={"RMDomestic"}
                        isZBCVBCTemplate={true}
                        messageLabel={"RM Domestic"}
                        anchor={"right"}
                        isFinalApprovar={isFinalLevelUser}
                    />
                )
            }
            {
                showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.RAW_MATERIAL_DETAIL_DELETE_ALERT}`} />
            }
            {
                showPopupBulk && <PopupMsgWrapper isOpen={showPopupBulk} closePopUp={closePopUp} confirmPopup={onPopupConfirmBulk} message={`Recently Created Material's Density is not created, Do you want to create?`} />
            }

        </div >
    );
}

export default RMDomesticListing;

