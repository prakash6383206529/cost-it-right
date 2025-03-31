import React, { lazy, Suspense, useMemo, useRef } from 'react';
import { useState, useEffect, } from 'react';
import { useDispatch, useSelector } from 'react-redux'
import { Row, Col, } from 'reactstrap';
import { deleteRawMaterialAPI, getAllRMDataList, setReducerRMListing } from '../actions/Material';
import { IsShowFreightAndShearingCostFields, loggedInUserId, userDepartmetList } from "../../../helper/auth"
import { defaultPageSize, EMPTY_DATA, ENTRY_TYPE_DOMESTIC, FILE_URL, MASTERS, RMDOMESTIC, ZBCTypeId } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { MESSAGES } from '../../../config/message';
import Toaster from '../../common/Toaster';
import 'react-input-range/lib/css/index.css'
import DayTime from '../../common/DayTimeWrapper'
import LoaderCustom from '../../common/LoaderCustom';
import { FORGING, RMDOMESTIC_DOWNLOAD_EXCEl } from '../../../config/masterData';
import { RM_MASTER_ID, APPROVAL_ID, RmDomestic } from '../../../config/constants'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import ReactExport from 'react-export-excel';
import { CheckApprovalApplicableMaster, getConfigurationKey, getLocalizedCostingHeadValue, searchNocontentFilter, setLoremIpsum } from '../../../helper';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { getListingForSimulationCombined, setSelectedRowForPagination } from '../../simulation/actions/Simulation';
import { disabledClass, useFetchAPICall, getApprovalTypeSelectList, getGridHeight, setResetCostingHead } from '../../../actions/Common';
import WarningMessage from '../../common/WarningMessage';
import AnalyticsDrawer from './AnalyticsDrawer'
import _ from 'lodash';
import { reactLocalStorage } from 'reactjs-localstorage';
import { checkMasterCreateByCostingPermission, hideCustomerFromExcel, hideMultipleColumnFromExcel } from '../../common/CommonFunctions';
import Attachament from '../../costing/components/Drawers/Attachament';
import Button from '../../layout/Button';
import PaginationControls from '../../common/Pagination/PaginationControls';
import { PaginationWrappers } from '../../common/Pagination/PaginationWrappers';
import { resetStatePagination, updateCurrentRowIndex, updateGlobalTake, updatePageNumber, updatePageSize } from '../../common/Pagination/paginationAction';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from '../../common/Tour/TourMessages';
import { useTranslation } from 'react-i18next';
import BulkUpload from '../../massUpload/BulkUpload';
import RfqMasterApprovalDrawer from './RfqMasterApprovalDrawer';
import { localizeHeadersWithLabels, useLabels, useLocalizedHeaders, useWithLocalization } from '../../../helper/core';
import CostingHeadDropdownFilter from './CostingHeadDropdownFilter';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};

function RMDomesticListing(props) {

    const { AddAccessibility, BulkUploadAccessibility, ViewRMAccessibility, EditAccessibility, DeleteAccessibility, DownloadAccessibility, isSimulation, apply, selectionForListingMasterAPI, objectForMultipleSimulation, ListFor, initialConfiguration } = props;
    const [value, setvalue] = useState({ min: 0, max: 0 });
    const [isBulkUpload, setisBulkUpload] = useState(false);
    const [gridApi, setgridApi] = useState(null);                      // DONT DELETE THIS STATE , IT IS USED BY AG GRID
    const [gridColumnApi, setgridColumnApi] = useState(null);          // DONT DELETE THIS STATE , IT IS USED BY AG GRID
    const [loader, setloader] = useState(false);
    const dispatch = useDispatch();
    const rmDataList = useSelector((state) => state.material.rmDataList);
    const allRmDataList = useSelector((state) => state.material.allRmDataList);
    const filteredRMData = useSelector((state) => state.material.filteredRMData);
    const { selectedRowForPagination, simulationCostingStatus } = useSelector((state => state.simulation))
    const { globalTakes } = useSelector((state) => state.pagination);
    const [selectedCostingHead, setSelectedCostingHead] = useState(null);

    const [showPopup, setShowPopup] = useState(false)
    const [deletedId, setDeletedId] = useState('')
    const [showPopupBulk, setShowPopupBulk] = useState(false)
    const [disableFilter, setDisableFilter] = useState(true) // STATE MADE FOR CHECKBOX IN SIMULATION
    const [disableDownload, setDisableDownload] = useState(false)
    const [analyticsDrawer, setAnalyticsDrawer] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState([]);
    //STATES BELOW ARE MADE FOR PAGINATION PURPOSE
    const [warningMessage, setWarningMessage] = useState(false)
    // const [globalTake, setGlobalTake] = useState(defaultPageSize)
    const [filterModel, setFilterModel] = useState({});
    // const [pageNo, setPageNo] = useState(1)
    const [totalRecordCount, setTotalRecordCount] = useState(0)
    const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false)
    const [noData, setNoData] = useState(false)
    const [dataCount, setDataCount] = useState(0)
    const [inRangeDate, setinRangeDate] = useState([])
    const [floatingFilterData, setFloatingFilterData] = useState({ CostingHead: "", TechnologyName: "", RawMaterialName: "", RawMaterialGradeName: "", RawMaterialSpecificationName: "", RawMaterialCode: "", Category: "", MaterialType: "", DestinationPlantName: "", UnitOfMeasurementName: "", VendorName: "", BasicRatePerUOM: "", ScrapRate: "", RMFreightCost: "", RMShearingCost: "", NetLandedCost: "", EffectiveDate: "", DepartmentName: isSimulation && getConfigurationKey().IsCompanyConfigureOnPlant ? userDepartmetList() : "", NetConditionCost: "", NetCostWithoutConditionCost: "", MachiningScrapRate: "", IsScrapUOMApply: "", ScrapUnitOfMeasurement: "", CalculatedFactor: "", ScrapRatePerScrapUOM: "", Currency: "", ExchangeRateSourceName: "", OtherNetCost: "" })
    const [attachment, setAttachment] = useState(false);
    const [viewAttachment, setViewAttachment] = useState([])
    const [showExtraData, setShowExtraData] = useState(false)
    const [render, setRender] = useState(true)

    const { t } = useTranslation(["MasterLabel", "common"])
    const { technologyLabel, RMCategoryLabel, vendorLabel, vendorBasedLabel, zeroBasedLabel, customerBasedLabel } = useLabels();

    const [compareDrawer, setCompareDrawer] = useState(false)
    const [rowDataForCompare, setRowDataForCompare] = useState([])
    const [pageRecord, setPageRecord] = useState(0);
    const isRfq = props?.quotationId !== null && props?.quotationId !== '' &&props?.quotationId !== undefined ? true : false
    var filterParams = {
        date: "", inRangeInclusive: true, filterOptions: ['equals', 'inRange'],
        comparator: function (filterLocalDateAtMidnight, cellValue) {
            var dateAsString = cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
            var newDate = filterLocalDateAtMidnight != null ? DayTime(filterLocalDateAtMidnight).format('DD/MM/YYYY') : '';
            handleDate(newDate)// FOR COSTING BENCHMARK BOP REPORT
            let date = document.getElementsByClassName('ag-input-field-input')
            for (let i = 0; i < date.length; i++) {
                if (date[i].type == 'radio') {
                    date[i].click()
                }
            }

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

    // const params = useMemo(() => {
    //     let obj = { ...floatingFilterData }

    //     if (obj?.EffectiveDate) {
    //         if (obj.EffectiveDate.dateTo) {
    //             let temp = []
    //             temp.push(DayTime(obj.EffectiveDate.dateFrom).format('DD/MM/YYYY'))
    //             temp.push(DayTime(obj.EffectiveDate.dateTo).format('DD/MM/YYYY'))
    //             obj.dateArray = temp
    //         }
    //     }

    //     obj.RawMaterialEntryType = !isSimulation ? Number(ENTRY_TYPE_DOMESTIC) : ''
    //     obj.Currency = floatingFilterData?.Currency
    //     obj.ExchangeRateSourceName = floatingFilterData?.ExchangeRateSourceName
    //     obj.OtherNetCost = floatingFilterData?.OtherNetCost
    //     obj.StatusId = [props?.approvalStatus].join(",")
    //     let data = {
    //         StatusId: [props?.approvalStatus].join(","),
    //         net_landed_min_range: value.min,
    //         net_landed_max_range: value.max,
    //         ListFor: ListFor,
    //     }

    //     return {
    //         data: { technologyId: props?.technology ?? null },
    //         skip: 0,
    //         take: globalTakes,
    //         isPagination: true,
    //         obj: obj,
    //         isImport: false,
    //         dataObj: obj,
    //         master: 'RawMaterial',
    //         tabs: 'Domestic',
    //         isMasterSummaryDrawer: props?.isMasterSummaryDrawer
    //     }
    // }, []);

    // const { isLoading, isError, error, data } = useFetchAPICall('MastersRawMaterial_GetAllRawMaterialList', params);

    useEffect(() => {
        if (rmDataList?.length > 0) {
            setTotalRecordCount(rmDataList[0].TotalRecordCount)
            setRender(false)
        }
        else {
            setRender(false)
            setNoData(false)
        }

    }, [rmDataList, dispatch])



    useEffect(() => {
        if (!props.stopApiCallOnCancel) {
            if (isSimulation && selectionForListingMasterAPI === 'Combined') {
                props?.changeSetLoader(true)
                dispatch(getListingForSimulationCombined(objectForMultipleSimulation, RMDOMESTIC, (res) => {
                    props?.changeSetLoader(false)
                    setloader(false)
                }))
            } else {
                if (isSimulation) {
                    props?.changeTokenCheckBox(false)
                }
                getDataList(null, null, null, null, null, 0, 0, defaultPageSize, true, floatingFilterData)
            }
            setvalue({ min: 0, max: 0 });
        }
        return () => {
            dispatch(setResetCostingHead(true, "costingHead"))
        }
    }, [])


    useEffect(() => {
        reactLocalStorage.setObject('selectedRow', {})
        if (!props.stopApiCallOnCancel) {
            return () => {
                dispatch(setSelectedRowForPagination([]))
                dispatch(resetStatePagination());

                reactLocalStorage.setObject('selectedRow', {})
            }
        }
    }, [])


    /**
    * @method hideForm
    * @description HIDE DOMESTIC, IMPORT FORMS
    */
    const getDataList = (costingHead = null, plantId = null, materialId = null, gradeId = null, vendorId = null, technologyId = 0, skip = 0, take = 10, isPagination = true, dataObj, isReset = false) => {
        const { isSimulation } = props
        setPageRecord(skip)
        if (filterModel?.EffectiveDate && !isReset) {

            if (filterModel.EffectiveDate.dateTo) {
                let temp = []
                temp.push(DayTime(filterModel.EffectiveDate.dateFrom).format('DD/MM/YYYY'))
                temp.push(DayTime(filterModel.EffectiveDate.dateTo).format('DD/MM/YYYY'))

                dataObj.dateArray = temp
            }
        }

        // TO HANDLE FUTURE CONDITIONS LIKE [APPROVED_STATUS, DRAFT_STATUS] FOR MULTIPLE STATUS
        let statusString = [props?.approvalStatus]

        const filterData = {
            costingHead: isSimulation && filteredRMData && filteredRMData.costingHeadTemp ? filteredRMData.costingHeadTemp.value : costingHead,
            plantId: isSimulation && filteredRMData && filteredRMData.plantId ? filteredRMData.plantId.value : plantId,
            material_id: isSimulation && filteredRMData && filteredRMData.RMid ? filteredRMData.RMid.value : materialId,
            grade_id: isSimulation && filteredRMData && filteredRMData.RMGradeid ? filteredRMData.RMGradeid.value : gradeId,
            vendor_id: isSimulation && filteredRMData && filteredRMData.Vendorid ? filteredRMData.Vendorid.value : vendorId,
            technologyId: isSimulation ? props.technology : technologyId,
            net_landed_min_range: value.min,
            net_landed_max_range: value.max,
            departmentCode: isSimulation ? userDepartmetList() : "",
            statusId: CheckApprovalApplicableMaster(RM_MASTER_ID) ? APPROVAL_ID : 0,
            ListFor: ListFor,
            StatusId: statusString,
        }
        //THIS CONDTION IS FOR IF THIS COMPONENT IS RENDER FROM MASTER APPROVAL SUMMARY IN THIS NO GET API
        if (isPagination === true) {
            setloader(true)
        }
        dataObj.RawMaterialEntryType = Number(ENTRY_TYPE_DOMESTIC)
        dataObj.Currency = floatingFilterData?.Currency
        dataObj.ExchangeRateSourceName = floatingFilterData?.ExchangeRateSourceName
        dataObj.OtherNetCost = floatingFilterData?.OtherNetCost
        dataObj.StatusId = statusString
        if (isSimulation && getConfigurationKey().IsDivisionAllowedForDepartment) {
            dataObj.isRequestForPendingSimulation = simulationCostingStatus ? true : false
        }
        if (!props.isMasterSummaryDrawer) {

            dispatch(getAllRMDataList(filterData, skip, take, isPagination, dataObj, false, (res) => {
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
                        dispatch(disabledClass(false))
                        let button = document.getElementById('Excel-Downloads-rm-import')
                        button && button.click()
                    }, 500);
                }

                if (res && res.status === 204) {
                    setTotalRecordCount(0)
                    dispatch(updatePageNumber(0))
                    // setPageNo(0)
                }

                if (res) {
                    let isReset = true
                    setTimeout(() => {
                        for (var prop in floatingFilterData) {

                            if (prop !== "DepartmentName" && prop !== 'RawMaterialEntryType' && floatingFilterData[prop] !== "") {
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
    }
    var setDate = (date) => {
        setFloatingFilterData((prevState) => ({ ...prevState, EffectiveDate: date }));
    };

    var handleDate = (newDate) => {
        let temp = inRangeDate
        temp.push(newDate)
        setinRangeDate(temp)        // setState((prevState) => ({ ...prevState, inRangeDate: temp }))
        if (props?.benchMark) {
            props?.handleDate(inRangeDate)
        }
        setTimeout(() => {
            var y = document.getElementsByClassName('ag-radio-button-input');
            var radioBtn = y[0];
            radioBtn?.click()

        }, 300);
    }

    const onFloatingFilterChanged = (value) => {

        setTimeout(() => {
            if (rmDataList.length !== 0) {
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
    const onSearch = () => {
        setNoData(false)
        setWarningMessage(false)
        setIsFilterButtonClicked(true)
        gridApi.setQuickFilter(null)

        // setPageNo(1)
        dispatch(updatePageNumber(1))
        dispatch(updateCurrentRowIndex(10))
        gridOptions?.columnApi?.resetColumnState();
        getDataList(null, null, null, null, null, 0, 0, globalTakes, true, floatingFilterData)
    }



    const resetState = () => {
        setNoData(false)
        setinRangeDate([])
        dispatch(setResetCostingHead(true, "costingHead"))
        setDisableFilter(true)
        gridOptions?.api?.setFilterModel(null);
        setIsFilterButtonClicked(false)
        gridApi.setQuickFilter(null)
        gridApi.deselectAll();
        gridOptions?.columnApi?.resetColumnState(null);

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
        dispatch(updatePageNumber(1))
        dispatch(updateCurrentRowIndex(10))
        getDataList(null, null, null, null, null, 0, 0, 10, true, floatingFilterData, true)
        dispatch(setSelectedRowForPagination([]))
        dispatch(updateGlobalTake(10))
        dispatch(updatePageSize({ pageSize10: true, pageSize50: false, pageSize100: false }))
        setDataCount(0)
        reactLocalStorage.setObject('selectedRow', {})
        if (isSimulation) {
            props.isReset()
        }
    }

    /**
    * @method viewOrEditItemDetails
    * @description edit or view material type
    */
    const viewOrEditItemDetails = (Id, rowData = {}, isViewMode) => {

        let data = {
            isEditFlag: true,
            isViewFlag: isViewMode,
            costingTypeId: rowData.CostingTypeId,
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
        const loggedInUser = loggedInUserId()
        dispatch(deleteRawMaterialAPI(ID, loggedInUser, (res) => {
            if (res && res?.data && res?.data?.Result === true) {
                dispatch(setSelectedRowForPagination([]));
                if (gridApi) {
                    gridApi.deselectAll();
                }
                reactLocalStorage.remove('selectedRow');
                Toaster.success(MESSAGES.DELETE_RAW_MATERIAL_SUCCESS);
                getDataList(null, null, null, null, null, 0, pageRecord, globalTakes, true, floatingFilterData, false);
                setDataCount(0);
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
    const handleCompareDrawer = (data) => {

        setCompareDrawer(true)
        setRowDataForCompare([data])
    }
    const { benchMark, isMasterSummaryDrawer } = props

    const buttonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        let isEditbale = false
        let isDeleteButton = false
        const IsRFQRawMaterial = Boolean(rowData?.IsRFQRawMaterial);
        if (EditAccessibility) {
            isEditbale = true
        } else {
            isEditbale = false
        }
        if (isRfq && isMasterSummaryDrawer && !IsRFQRawMaterial) {
            return (
                <button className="Balance mb-0 button-stick" type="button" onClick={() => handleCompareDrawer(rowData)}>

                </button>
            );
        }
        if (showExtraData && props.rowIndex === 0) {
            isDeleteButton = true
        } else {
            if (DeleteAccessibility && !rowData?.IsRMAssociated) {
                isDeleteButton = true
            }
        }

        return (
            <>

                <Button
                    id={`rmDomesticListing_movement${props.rowIndex}`}
                    className={"mr-1 Tour_List_Cost_Movement"}
                    variant="cost-movement"
                    onClick={() => showAnalytics(cellValue, rowData)}
                    title={"Cost Movement"}
                />

                {(!benchMark) && (
                    <>
                        {ViewRMAccessibility && <Button
                            id={`rmDomesticListing_view${props.rowIndex}`}
                            className={"mr-1 Tour_List_View"}
                            variant="View"
                            onClick={() => viewOrEditItemDetails(cellValue, rowData, true)}
                            title={"View"}
                        />}
                        {isEditbale && !IsRFQRawMaterial && <Button
                            id={`rmDomesticListing_edit${props.rowIndex}`}
                            className={"mr-1 Tour_List_Edit"}
                            variant="Edit"
                            onClick={() => viewOrEditItemDetails(cellValue, rowData, false)}
                            title={"Edit"}
                        />}
                        {isDeleteButton && !IsRFQRawMaterial && <Button
                            id={`rmDomesticListing_delete${props.rowIndex}`}
                            className={"mr-1 Tour_List_Delete"}
                            variant="Delete"
                            onClick={() => deleteItem(cellValue)}
                            title={"Delete"}
                        />}
                    </>
                )}
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
        let value = cell != null ? cell : '';
        return value
    }

    /**
    * @method effectiveDateFormatter
    * @description Renders buttons
    */
    const effectiveDateFormatter = (props) => {
        if (showExtraData && props?.rowIndex === 0) {
            return "Lorem Ipsum";
        } else {
            const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
            return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
        }
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
        return cell != null ? cell : '-';
    }


    const formToggle = () => {
        if (checkMasterCreateByCostingPermission()) {
            props.formToggle()
        }
    }

    const bulkToggle = () => {
        if (checkMasterCreateByCostingPermission(true)) {
            setisBulkUpload(true);
        }
    }

    const closeBulkUploadDrawer = (event, type) => {
        setisBulkUpload(false);
        if (type !== 'cancel') {
            resetState()
        }
    }

    const closeCompareDrawer = (event, type) => {
        setCompareDrawer(false);
        if (type !== 'cancel') {
            resetState()
        }
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
        const checkBoxInstance = document.querySelectorAll('.ag-input-field-input.ag-checkbox-input');
        checkBoxInstance.forEach((checkBox, index) => {
            const specificId = `RM_Domestic_Checkbox${index / 11}`;
            checkBox.id = specificId;
        })
        const floatingFilterInstances = document.querySelectorAll('.ag-input-field-input.ag-text-field-input');
        floatingFilterInstances.forEach((floatingFilter, index) => {
            const specificId = `RM_Domestic_Floating${index}`;
            floatingFilter.id = specificId;
        });
    };



    const returnExcelColumn = (data = [], TempData) => {
        let excelData = hideCustomerFromExcel(data, "CustomerName")
        if (!IsShowFreightAndShearingCostFields()) {
            excelData = hideMultipleColumnFromExcel(excelData, ['FreightCost', 'ShearingCost', 'RMFreightCost', 'RMShearingCost', 'RawMaterialFreightCostConversion', 'RawMaterialShearingCostConversion '])
        }

        if (!getConfigurationKey().IsBasicRateAndCostingConditionVisible) {
            excelData = hideMultipleColumnFromExcel(excelData, ["NetConditionCost", "NetCostWithoutConditionCost"])
        }
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

            <ExcelSheet data={temp} name={RmDomestic}>
                {excelData && excelData.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
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
                let button = document.getElementById('Excel-Downloads-rm-import')
                button && button.click()
            }, 400);


        } else {

            getDataList(null, null, null, null, null, 0, 0, defaultPageSize, false, floatingFilterData) // FOR EXCEL DOWNLOAD OF COMPLETE DATA
        }

    }
    const RMDOMESTIC_DOWNLOAD_EXCEl_LOCALIZATION = useLocalizedHeaders(RMDOMESTIC_DOWNLOAD_EXCEl)
    const onBtExport = () => {
        let tempArr = []
        //tempArr = gridApi && gridApi?.getSelectedRows()
        tempArr = selectedRowForPagination
        tempArr = (tempArr && tempArr.length > 0) ? tempArr : (allRmDataList ? allRmDataList : [])
        const filteredLabels = RMDOMESTIC_DOWNLOAD_EXCEl_LOCALIZATION.filter(column => {
            if (column.value === "ExchangeRateSourceName") {
                return getConfigurationKey().IsSourceExchangeRateNameVisible
            }
            return true;
        })
        return returnExcelColumn(filteredLabels, tempArr)
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

        let selectedRowForPagination = reactLocalStorage.getObject('selectedRow').selectedRow

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
        reactLocalStorage.setObject('selectedRow', { selectedRow: uniqeArray }) //SETTING CHECKBOX STATE DATA IN LOCAL STORAGE
        setDataCount(uniqeArray.length)
        dispatch(setSelectedRowForPagination(uniqeArray))
        let finalArr = selectedRows
        let length = finalArr?.length
        let uniqueArray = _.uniqBy(finalArr, "RawMaterialId")

        if (isSimulation) {
            apply(uniqueArray, length)
        }

        if (props?.benchMark) {
            let uniqueArrayNew = _.uniqBy(selectedRows, v => [v.TechnologyId, v.RawMaterial].join())

            if (uniqueArrayNew.length > 1) {
                dispatch(setSelectedRowForPagination([]))
                gridApi.deselectAll()
                Toaster.warning(`${technologyLabel} & Raw material should be same`)
            }
        }
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        headerCheckboxSelection: (isSimulation || props?.benchMark) ? isFirstColumn : false,
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
    const checkBoxRenderer = (props) => {
        let selectedRowForPagination = reactLocalStorage.getObject('selectedRow').selectedRow
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

    const closeAnalyticsDrawer = () => {
        setAnalyticsDrawer(false)
    }

console.log(warningMessage);

    const floatingFilterStatus = {
        maxValue: 1,
        suppressFilterButton: true,
        component: CostingHeadDropdownFilter,
        onFilterChange: (originalValue, value) => {

            setSelectedCostingHead(originalValue);
            setDisableFilter(false);
            setWarningMessage(true);
            setFloatingFilterData(prevState => ({
                ...prevState,
                CostingHead: value
            }));
        }
    };

    const showAnalytics = (cell, rowData) => {
        setSelectedRowData(rowData)
        setAnalyticsDrawer(true)
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

                        }) :


                        <Button
                            id={`rmDomesticListing_attachment${props.rowIndex}`}
                            className={"mr5"}
                            variant="btn-a"
                            onClick={() => viewAttachmentData(row)}
                            title={"View Attachment"}
                        >View Attachment</Button>}

                </div >
            </>
        )

    }
    const headerCategory = (props) => {
        return t('RMCategoryLabel', { defaultValue: 'Category' })
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
        checkBoxRenderer: checkBoxRenderer,
        attachmentFormatter: attachmentFormatter,
        combinedCostingHeadRenderer: combinedCostingHeadRenderer,
        statusFilter: CostingHeadDropdownFilter,



    }






    return (
        <div className={`ag-grid-react grid-parent-wrapper ${(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) ? "custom-pagination" : ""} ${DownloadAccessibility ? "show-table-btn" : ""} ${isSimulation ? 'simulation-height' : props?.isMasterSummaryDrawer ? '' : 'min-height100vh'}`}>
            {(loader && !props.isMasterSummaryDrawer) ? <LoaderCustom customClass="simulation-Loader" /> :
                <>
                    {disableDownload && <LoaderCustom message={MESSAGES.DOWNLOADING_MESSAGE} />}
                    <Row className={`filter-row-large ${props?.isSimulation ? 'zindex-0 ' : ''} ${props?.isMasterSummaryDrawer ? '' : 'pt-2'}`}>
                        <Col md="6" lg="6" className='mb-2'>
                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                            {(!props.isSimulation && !props.benchMark && !props?.isMasterSummaryDrawer) && (<TourWrapper
                                buttonSpecificProp={{
                                    id: "RMDomestic_Listing_Tour", onClick: toggleExtraData
                                }}
                                stepsSpecificProp={{
                                    steps: Steps(t, { addLimit: false, copyButton: false, viewBOM: false, status: false, updateAssociatedTechnology: false, addMaterial: false, addAssociation: false, generateReport: false, approve: false, reject: false }).COMMON_LISTING
                                }} />)}
                        </Col>
                        <Col md="6" lg="6" className="mb-3 d-flex justify-content-end">
                            {
                                // SHOW FILTER BUTTON ONLY FOR RM MASTER NOT FOR SIMULATION AMD MASTER APPROVAL SUMMARY
                                (!props.isMasterSummaryDrawer) &&
                                <>
                                    {isSimulation &&

                                        <div className="warning-message d-flex align-items-center">
                                            {warningMessage && !disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}

                                            <Button
                                                id="rmDomesticListing_filter"
                                                className={"mr5 Tour_List_Filter"}
                                                onClick={() => onSearch()}
                                                title={"Filtered data"}
                                                icon={"filter"}
                                                disabled={disableFilter}
                                            />
                                        </div>
                                    }
                                    {!isSimulation &&
                                        <div className="d-flex justify-content-end bd-highlight w100">

                                            <>
                                                {(props?.isMasterSummaryDrawer === undefined || this.props?.isMasterSummaryDrawer === false) &&
                                                    <div className="warning-message d-flex align-items-center">
                                                        {warningMessage && !disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                                                    </div>
                                                }
                                                {(props?.isMasterSummaryDrawer === undefined || this.props?.isMasterSummaryDrawer === false) &&

                                                    <Button
                                                        id="rmDomesticListing_filter"
                                                        className={"mr5 Tour_List_Filter"}
                                                        onClick={() => onSearch()}
                                                        title={"Filtered data"}
                                                        icon={"filter"}
                                                        disabled={disableFilter}
                                                    />
                                                }

                                                {AddAccessibility && (
                                                    <Button
                                                        id="rmDomesticListing_add"
                                                        className={"mr5 Tour_List_Add"}
                                                        onClick={formToggle}
                                                        title={"Add"}
                                                        icon={"plus"}
                                                    />
                                                )}
                                                {BulkUploadAccessibility && (
                                                    <Button
                                                        id="rmDomesticListing_add"
                                                        className={"mr5 Tour_List_BulkUpload"}
                                                        onClick={bulkToggle}
                                                        title={"Bulk Upload"}
                                                        icon={"upload"}
                                                    />
                                                )}
                                                {
                                                    DownloadAccessibility &&
                                                    <>

                                                        <Button
                                                            className="mr5 Tour_List_Download"
                                                            id={"rmDomesticListing_excel_download"}
                                                            onClick={onExcelDownload}
                                                            title={`Download ${dataCount === 0 ? "All" : "(" + dataCount + ")"}`}
                                                            icon={"download mr-1"}
                                                            buttonName={`${dataCount === 0 ? "All" : "(" + dataCount + ")"}`}
                                                            disabled={totalRecordCount === 0}
                                                        />
                                                        <ExcelFile filename={'RM Domestic'} fileExtension={'.xls'} element={
                                                            <Button id={"Excel-Downloads-rm-import"} className="p-absolute" />

                                                        }>
                                                            {onBtExport()}
                                                        </ExcelFile>
                                                    </>
                                                }

                                            </>
                                        </div>
                                    }


                                </>

                            }
                            <Button
                                id={"rmDomesticListing_refresh"}
                                className={"Tour_List_Reset"}
                                onClick={() => resetState()}
                                title={"Reset Grid"}
                                icon={"refresh"}
                            />
                        </Col>

                    </Row>
                    <Row>

                        <Col>
                            <div className={`ag-grid-wrapper ${(props?.isDataInMaster && !noData) ? 'master-approval-overlay' : ''} ${(rmDataList && rmDataList?.length <= 0) || noData ? 'overlay-contain' : ''}`}>
                                <div className={`ag-theme-material `}>
                                    {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                                    {render ? <LoaderCustom customClass="loader-center" /> : <AgGridReact
                                        style={{ height: '100%', width: '100%' }}
                                        defaultColDef={defaultColDef}
                                        floatingFilter={true}
                                        domLayout='autoHeight'
                                        rowData={showExtraData && rmDataList ? [...setLoremIpsum(rmDataList[0]), ...rmDataList] : rmDataList}
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
                                        enableBrowserTooltips={true}
                                    >
                                        <AgGridColumn
                                            cellClass="has-checkbox"
                                            field="CostingHead"
                                            headerName='Costing Head'
                                            floatingFilterComponentParams={floatingFilterStatus}
                                            floatingFilterComponent="statusFilter"
                                            cellRenderer={combinedCostingHeadRenderer}
                                        />
                                        <AgGridColumn field="TechnologyName" headerName={technologyLabel}></AgGridColumn>
                                        <AgGridColumn field="RawMaterialName" headerName='Raw Material'></AgGridColumn>
                                        <AgGridColumn field="RawMaterialGradeName" headerName="Grade"></AgGridColumn>
                                        <AgGridColumn field="RawMaterialSpecificationName" headerName="Spec"></AgGridColumn>
                                        <AgGridColumn field="RawMaterialCode" headerName='Code' cellRenderer='hyphenFormatter'></AgGridColumn>
                                        <AgGridColumn field="Category" headerName={RMCategoryLabel}></AgGridColumn>
                                        <AgGridColumn field="MaterialType"></AgGridColumn>
                                        <AgGridColumn field="DestinationPlantName" headerName="Plant (Code)"></AgGridColumn>
                                        <AgGridColumn field="VendorName" headerName={vendorLabel + " (Code)"}></AgGridColumn>
                                        {true && <AgGridColumn field="Division" headerName="Division"></AgGridColumn>}
                                        {reactLocalStorage.getObject('CostingTypePermission').cbc && <AgGridColumn field="CustomerName" headerName="Customer (Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                                        {getConfigurationKey()?.IsShowSourceVendorInRawMaterial && <AgGridColumn field="SourceVendorName" headerName={`Source ${vendorLabel} Name`} cellRenderer='hyphenFormatter'></AgGridColumn>}
                                        <AgGridColumn field="UnitOfMeasurementName" headerName='UOM'></AgGridColumn>
                                        {getConfigurationKey().IsSourceExchangeRateNameVisible && <AgGridColumn field="ExchangeRateSourceName" headerName="Exchange Rate Source"></AgGridColumn>}
                                        <AgGridColumn field="Currency" headerName="Currency"></AgGridColumn>
                                        <AgGridColumn field="BasicRatePerUOM" headerName='Basic Rate' cellRenderer='commonCostFormatter'></AgGridColumn>
                                        <AgGridColumn field="IsScrapUOMApply" headerName="Has different Scrap Rate UOM" cellRenderer='commonCostFormatter'></AgGridColumn>
                                        <AgGridColumn field="ScrapUnitOfMeasurement" headerName='Scrap Rate UOM' cellRenderer='commonCostFormatter'></AgGridColumn>
                                        <AgGridColumn field="CalculatedFactor" headerName='Calculated Factor' cellRenderer='commonCostFormatter'></AgGridColumn>
                                        <AgGridColumn field="ScrapRatePerScrapUOM" headerName='Scrap Rate (In Scrap Rate UOM)' cellRenderer='commonCostFormatter'></AgGridColumn>
                                        <AgGridColumn field="ScrapRate" cellRenderer='commonCostFormatter'></AgGridColumn>
                                        {props.isMasterSummaryDrawer && rmDataList[0]?.TechnologyId === FORGING && <AgGridColumn width="140" field="MachiningScrapRate" headerName='Machining Scrap Rate'></AgGridColumn>}
                                        {/* ON RE FREIGHT COST AND SHEARING COST COLUMN IS COMMENTED //RE */}
                                        <AgGridColumn field="OtherNetCost" headerName='Other Net Cost' cellRenderer='commonCostFormatter'></AgGridColumn>
                                        {getConfigurationKey()?.IsBasicRateAndCostingConditionVisible && ((props.isMasterSummaryDrawer && rmDataList[0]?.CostingTypeId === ZBCTypeId) || !props.isMasterSummaryDrawer) && <AgGridColumn field="NetCostWithoutConditionCost" headerName="Basic Price" cellRenderer='commonCostFormatter'></AgGridColumn>}
                                        {getConfigurationKey()?.IsBasicRateAndCostingConditionVisible && ((props.isMasterSummaryDrawer && rmDataList[0]?.CostingTypeId === ZBCTypeId) || !props.isMasterSummaryDrawer) && <AgGridColumn field="NetConditionCost" headerName="Net Condition Cost" cellRenderer='commonCostFormatter'></AgGridColumn>}
                                        <AgGridColumn field="OtherNetCost" headerName='Other Net Cost' cellRenderer='commonCostFormatter'></AgGridColumn>
                                        <AgGridColumn field="NetLandedCost" headerName="Net Cost" cellRenderer='costFormatter'></AgGridColumn>

                                        <AgGridColumn field="EffectiveDate" cellRenderer='effectiveDateRenderer' filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                                        {((!isSimulation && !props.isMasterSummaryDrawer) || (isRfq && props?.isMasterSummaryDrawer)) && <AgGridColumn width={160} field="RawMaterialId" cellClass="ag-grid-action-container" pinned="right" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}
                                        <AgGridColumn field="VendorId" hide={true}></AgGridColumn>
                                        <AgGridColumn field="TechnologyId" hide={true}></AgGridColumn>
                                        {props.isMasterSummaryDrawer && <AgGridColumn field="Attachements" headerName='Attachments' cellRenderer='attachmentFormatter'></AgGridColumn>}
                                        {props.isMasterSummaryDrawer && <AgGridColumn field="Remark" tooltipField="Remark" ></AgGridColumn>}
                                    </AgGridReact>}
                                    <div className='button-wrapper'>
                                        {<PaginationWrappers gridApi={gridApi} totalRecordCount={totalRecordCount} getDataList={getDataList} floatingFilterData={floatingFilterData} module="RM" />}
                                        {(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) &&
                                            <PaginationControls totalRecordCount={totalRecordCount} getDataList={getDataList} floatingFilterData={floatingFilterData} module="RM" />

                                        }

                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </>
            }

            <Suspense fallback={<div>Loading...</div>}>
                {/* Render the lazily loaded component */}
                {/* <MyLazyComponent /> */}
                {
                    isBulkUpload && (
                        <BulkUpload
                            isOpen={isBulkUpload}
                            closeDrawer={closeBulkUploadDrawer}
                            isEditFlag={false}
                            densityAlert={densityAlert}
                            fileName={"RM"}
                            isZBCVBCTemplate={true}
                            messageLabel={"RM"}
                            anchor={"right"}
                            masterId={RM_MASTER_ID}
                            typeOfEntryId={ENTRY_TYPE_DOMESTIC}
                        />
                    )
                }
            </Suspense>

            {
                analyticsDrawer &&
                <AnalyticsDrawer
                    isOpen={analyticsDrawer}
                    ModeId={1}
                    closeDrawer={closeAnalyticsDrawer}
                    anchor={"right"}
                    isReport={analyticsDrawer}
                    selectedRowData={selectedRowData}
                    isSimulation={true}
                    //cellValue={cellValue}
                    rowData={selectedRowData}
                />
            }

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

            {
                showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.RAW_MATERIAL_DETAIL_DELETE_ALERT}`} />
            }
            {
                showPopupBulk && <PopupMsgWrapper isOpen={showPopupBulk} closePopUp={closePopUp} confirmPopup={onPopupConfirmBulk} message={`Recently Created Material's Density is not created, Do you want to create?`} />
            }
            {compareDrawer &&
                <RfqMasterApprovalDrawer
                    isOpen={compareDrawer}
                    anchor={'right'}
                    selectedRows={rowDataForCompare}
                    type={'Raw Material'}
                    quotationId={props.quotationId}
                    closeDrawer={closeCompareDrawer}
                    summaryDrawer={props?.isMasterSummaryDrawer}

                // selectedRow = {props.bopDataResponse}
                />

            }

        </div >
    );
}

export default RMDomesticListing;

