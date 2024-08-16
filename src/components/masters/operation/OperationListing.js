import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, } from 'reactstrap';
import Toaster from '../../common/Toaster';
import { MESSAGES } from '../../../config/message';
import { EMPTY_DATA, OPERATIONS, SURFACETREATMENT, defaultPageSize, FILE_URL } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { getOperationsDataList, deleteOperationAPI, setOperationList } from '../actions/OtherOperation';
import AddOperation from './AddOperation';
import BulkUpload from '../../massUpload/BulkUpload';
import { ADDITIONAL_MASTERS, OPERATION, OperationMaster, OPERATIONS_ID } from '../../../config/constants';
import { checkPermission, searchNocontentFilter, setLoremIpsum } from '../../../helper/util';
import { loggedInUserId } from '../../../helper/auth';
import { userDepartmetList, getConfigurationKey } from '../../../helper'
import { OPERATION_DOWNLOAD_EXCEl } from '../../../config/masterData';
import LoaderCustom from '../../common/LoaderCustom';
import DayTime from '../../common/DayTimeWrapper'
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { getListingForSimulationCombined, setSelectedRowForPagination, } from '../../simulation/actions/Simulation'
import WarningMessage from '../../common/WarningMessage';
import _ from 'lodash';
import { TourStartAction, disabledClass, isResetClick } from '../../../actions/Common';
import AnalyticsDrawer from '../material-master/AnalyticsDrawer';
import { reactLocalStorage } from 'reactjs-localstorage';
import { checkMasterCreateByCostingPermission, hideCustomerFromExcel } from '../../common/CommonFunctions';
import Attachament from '../../costing/components/Drawers/Attachament';
import Button from '../../layout/Button';
import PaginationControls from '../../common/Pagination/PaginationControls';
import { PaginationWrappers } from '../../common/Pagination/PaginationWrappers';
import { resetStatePagination, updateCurrentRowIndex, updateGlobalTake, updatePageNumber } from '../../common/Pagination/paginationAction';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from '../../common/Tour/TourMessages';
import { useTranslation } from 'react-i18next';
import { useLabels } from '../../../helper/core';
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {};

const OperationListing = (props) => {
    const dispatch = useDispatch();
    const [state, setState] = useState({
        tableData: [],
        shown: false,
        costingHead: [],
        selectedTechnology: [],
        vendorName: [],
        operationName: [],
        data: { isEditFlag: false, ID: '' },
        toggleForm: false,
        selectedRowData: [],
        showPopup: false,
        deletedId: '',
        isLoader: true,
        disableFilter: true,
        disableDownload: false,
        analyticsDrawer: false,
        selectedRowDataAnalytics: [],
        inRangeDate: [],
        //states for pagination purpose
        floatingFilterData: { CostingHead: "", Technology: "", OperationName: "", OperationCode: "", Plants: "", VendorName: "", UnitOfMeasurement: "", Rate: "", EffectiveDate: "", DepartmentName: props.isSimulation && getConfigurationKey().IsCompanyConfigureOnPlant ? userDepartmetList() : "", CustomerName: '', ForType: '' },
        warningMessage: false,
        filterModel: {},
        totalRecordCount: 0,
        isFilterButtonClicked: false,
        noData: false,
        dataCount: 0,
        attachment: false,
        viewAttachment: [],
        isBulkUpload: false,
        ViewAccessibility: false,
        AddAccessibility: false,
        EditAccessibility: false,
        DeleteAccessibility: false,
        BulkUploadAccessibility: false,
        DownloadAccessibility: false,
        showExtraData: false,
        render: false,
        permissionData: {},

    })
    const tourStartData = useSelector(state => state.comman.tourStartData);
    const { t } = useTranslation("common")
    const { technologyLabel } = useLabels();
    const [searchText, setSearchText] = useState('');
    const { operationList, allOperationList, operationDataHold } = useSelector(state => state.otherOperation);
    const { topAndLeftMenuData } = useSelector(state => state.auth);
    const { globalTakes } = useSelector(state => state.pagination);
    const { selectedRowForPagination } = useSelector(state => state.simulation);
    useEffect(() => {
        if (!topAndLeftMenuData) {
            setState(prevState => ({ ...prevState, isLoader: true }));
            return;
        }
        applyPermission(topAndLeftMenuData);
        if (props.stopAPICall) {
            setState((prevState) => ({ ...prevState, tableData: operationDataHold }));
        }
        setTimeout(() => {
            setState(prevState => ({ ...prevState, isLoader: false }));
        }, 300);

        // eslint-disable-next-line
    }, [topAndLeftMenuData]); // Add props.stopAPICall to the dependency array



    useEffect(() => {
        const fetchData = async () => {
            props.changeSetLoader(true);
            try {
                const res = await dispatch(getListingForSimulationCombined(props.objectForMultipleSimulation, OPERATIONS));
                setState(prevState => ({ ...prevState, tableData: res.data.DataList, isLoader: false }));
                props.changeSetLoader(false);
            } catch (error) {
                // Handle error state
                props.changeSetLoader(false);
            }
        };

        if (!props.stopAPICall && props.isSimulation && props.selectionForListingMasterAPI === 'Combined') {
            fetchData();
        } else if (!props.stopAPICall) {
            getTableListData(null, null, null, null, 0, defaultPageSize, true, state.floatingFilterData);
        } else if (props.stopAPICall === true) {
            setState(prevState => ({ ...prevState, tableData: props.operationDataHold }));
        }

        // eslint-disable-next-line
    }, []);
    useEffect(() => {
        dispatch(setSelectedRowForPagination([]));
        dispatch(resetStatePagination());

        // eslint-disable-next-line
    }, []);


    const applyPermission = (topAndLeftMenuData) => {
        if (topAndLeftMenuData !== undefined) {
            const Data = topAndLeftMenuData && topAndLeftMenuData.find(el => el.ModuleName === ADDITIONAL_MASTERS);
            const accessData = Data && Data.Pages.find(el => el.PageName === OPERATION)
            const permissionData = accessData && accessData.Actions && checkPermission(accessData.Actions)
            if (permissionData !== undefined) {
                setState((prevState) => ({
                    ...prevState,
                    permissionData: permissionData,
                    ViewAccessibility: permissionData && permissionData?.View ? permissionData?.View : false,
                    AddAccessibility: permissionData && permissionData?.Add ? permissionData?.Add : false,
                    EditAccessibility: permissionData && permissionData?.Edit ? permissionData?.Edit : false,
                    DeleteAccessibility: permissionData && permissionData?.Delete ? permissionData?.Delete : false,
                    BulkUploadAccessibility: permissionData && permissionData?.BulkUpload ? permissionData?.BulkUpload : false,
                    DownloadAccessibility: permissionData && permissionData?.Download ? permissionData?.Download : false,
                }))
            }
        }
    }

    const getTableListData = (operation_for = null, operation_Name_id = null, technology_id = null, vendor_id = null, skip = 0, take = 10, isPagination = true, dataObj) => {
        setState(prevState => ({ ...prevState, isLoader: isPagination ? true : false }))

        if (state.filterModel?.EffectiveDate) {
            if (state.filterModel.EffectiveDate.dateTo) {
                let temp = []
                temp.push(DayTime(state.filterModel.EffectiveDate.dateFrom).format('DD/MM/YYYY'))
                temp.push(DayTime(state.filterModel.EffectiveDate.dateTo).format('DD/MM/YYYY'))
                dataObj.dateArray = temp
            }
        }
        const { isMasterSummaryDrawer } = props
        // TO HANDLE FUTURE CONDITIONS LIKE [APPROVED_STATUS, DRAFT_STATUS] FOR MULTIPLE STATUS
        let statusString = [props?.approvalStatus].join(",")

        let filterData = { operation_for: operation_for, operation_Name_id: operation_Name_id, technology_id: props.isSimulation ? props.technology : technology_id, vendor_id: vendor_id, ListFor: props.ListFor, StatusId: statusString }        // THIS IS FOR SHOWING LIST IN 1 TAB(OPERATION LISTING) & ALSO FOR SHOWING LIST IN SIMULATION
        if ((isMasterSummaryDrawer !== undefined && !isMasterSummaryDrawer)) {
            if (props.isSimulation) {
                props?.changeTokenCheckBox(false)
            }

            if (Number(props?.isOperationST) === Number(SURFACETREATMENT)) {   //CONDITION TO GET SURFACETREATMENT LISTING DATA
                filterData.OperationType = 'surfacetreatment'
            } else if ((Number(props?.isOperationST) === Number(OPERATIONS))) {
                filterData.OperationType = 'operation'
            } else {
                filterData.OperationType = ''
            }

            // dataObj.IsCustomerDataShow = reactLocalStorage.getObject('cbcCostingPermission')
            dispatch(getOperationsDataList(filterData, skip, take, isPagination, dataObj, res => {
                setState(prevState => ({ ...prevState, noData: false }))
                if (props.isSimulation) {
                    props?.changeTokenCheckBox(true)
                }
                setState(prevState => ({ ...prevState, isLoader: false }))
                if (res.status === 204 && res.data === '') {
                    setState(prevState => ({ ...prevState, tableData: [] }))
                } else {
                    setState(prevState => ({ ...prevState, tableData: res.data.DataList }))
                    dispatch(setOperationList(res.data.DataList))
                }
                // CODE FOR DOWNLOAD BUTTON LOGIC
                if (res && isPagination === false) {
                    setState(prevState => ({ ...prevState, disableDownload: false }))
                    dispatch(disabledClass(false))
                    setTimeout(() => {
                        let button = document.getElementById('Excel-Downloads-operation')
                        button && button.click()
                    }, 500);
                }

                // PAGINATION CODE
                if (res && res.status === 204) {
                    setState(prevState => ({ ...prevState, totalRecordCount: 0 }))
                    dispatch(updatePageNumber(0))
                }
                let FloatingfilterData = state.filterModel
                let obj = { ...state.floatingFilterData }
                setState(prevState => ({ ...prevState, totalRecordCount: res?.data?.DataList && res?.data?.DataList[0]?.TotalRecordCount }))
                let isReset = true
                setTimeout(() => {
                    for (var prop in obj) {
                        if (props.isSimulation && getConfigurationKey().IsCompanyConfigureOnPlant) {
                            if (prop !== "DepartmentName" && obj[prop] !== "") {
                                isReset = false
                            }
                        } else {
                            if (obj[prop] !== "") {
                                isReset = false
                            }
                        }
                    }
                    // SETS  THE FILTER MODEL VIA THE GRID API
                    isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(FloatingfilterData))
                    setTimeout(() => {
                        setState(prevState => ({ ...prevState, warningMessage: false }))
                    }, 23);
                }, 600);

                setTimeout(() => {
                    setState(prevState => ({ ...prevState, warningMessage: false }))
                }, 335);
                setTimeout(() => {
                    setState(prevState => ({ ...prevState, isFilterButtonClicked: false }))
                }, 600);
            }));
        } else {
            setTimeout(() => {
                setState(prevState => ({ ...prevState, tableData: operationList }))
                setState(prevState => ({ ...prevState, isLoader: false }))
            }, 700);

        }
    }

    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            if (operationList?.length !== 0) {
                setState((prevState) => ({ ...prevState, noData: searchNocontentFilter(value, state.noData), }));
            }
        }, 500);
        setState((prevState) => ({ ...prevState, disableFilter: false }));
        const model = gridOptions?.api?.getFilterModel();
        setState((prevState) => ({ ...prevState, filterModel: model }));
        if (!state.isFilterButtonClicked) {
            setState((prevState) => ({ ...prevState, warningMessage: true }));
        }
        if (
            value?.filterInstance?.appliedModel === null ||
            value?.filterInstance?.appliedModel?.filter === ""

        ) {
            let isFilterEmpty = true;

            if (model !== undefined && model !== null) {
                if (Object.keys(model).length > 0) {
                    isFilterEmpty = false;

                    for (var property in state.floatingFilterData) {

                        if (property === value.column.colId) {
                            state.floatingFilterData[property] = "";
                        }
                    }

                    setState((prevState) => ({ ...prevState, floatingFilterData: state.floatingFilterData, }));
                }

                if (isFilterEmpty) {
                    setState((prevState) => ({ ...prevState, warningMessage: false }));
                    for (var prop in state.floatingFilterData) {
                        state.floatingFilterData[prop] = "";
                    }
                    setState((prevState) => ({ ...prevState, }));
                }
            }
        } else {
            if (
                value.column.colId === "EffectiveDate" ||
                value.column.colId === "CreatedDate"
            ) {
                return false;
            }
            setState((prevState) => ({ ...prevState, floatingFilterData: { ...prevState.floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter, }, }));
        }
    };

    const onSearch = () => {
        dispatch(updatePageNumber(1));
        dispatch(updateCurrentRowIndex(0));
        setState((prevState) => ({
            ...prevState, warningMessage: false,
            //  pageNo: 1, pageNoNew: 1, currentRowIndex: 0, 
            noData: false,
        }));
        getTableListData(null, null, null, null, 0, defaultPageSize, true, state.floatingFilterData)  // FOR EXCEL DOWNLOAD OF COMPLETE DATA
    };

    const resetState = () => {
        setState((prevState) => ({ ...prevState, noData: false, warningMessage: false, }));
        dispatch(isResetClick(true, "Operation"));
        setState((prevState) => ({ ...prevState, isFilterButtonClicked: false, }));
        setSearchText(''); // Clear the search text state
        if (state.gridApi) {
            state.gridApi.setQuickFilter(''); // Clear the Ag-Grid quick filter
        }
        state.gridApi.deselectAll();
        gridOptions?.columnApi?.resetColumnState(null);
        const val = gridOptions?.api?.setFilterModel({});

        for (var prop in state.floatingFilterData) {
            state.floatingFilterData[prop] = "";
        }
        dispatch(resetStatePagination());
        setState((prevState) => ({
            ...prevState, floatingFilterData: state.floatingFilterData, warningMessage: false,
            // pageNo: 1, pageNoNew: 1, currentRowIndex: 0,
        }));
        getTableListData(null, null, null, null, 0, defaultPageSize, true, state.floatingFilterData)  // FOR EXCEL DOWNLOAD OF COMPLETE DATA
        dispatch(setSelectedRowForPagination([]));
        dispatch(updateGlobalTake(10));
        setState((prevState) => ({
            ...prevState, dataCount: 0,
            // pageSize: { ...prevState.pageSize, pageSize10: true, pageSize50: false, pageSize100: false, },
        }));
        setSearchText(''); // Assuming this state is bound to the input value

    };
    const toggleExtraData = (showTour) => {
        dispatch(TourStartAction({
            showExtraData: showTour,
        }));
        setState((prevState) => ({ ...prevState, render: true }));
        setTimeout(() => {
            setState((prevState) => ({ ...prevState, showExtraData: showTour, render: false }));
        }, 100);

    }



    /**
    * @method viewOrEditItemDetails
    * @description confirm edit or view item
    */


    const viewOrEditItemDetails = (Id, rowData, isViewMode) => {
        let data = { isEditFlag: true, ID: Id, toggleForm: true, isViewMode: isViewMode }
        props?.getDetails(data, rowData?.IsOperationAssociated);
    }

    /**
    * @method deleteItem
    * @description confirm delete Item.
    */
    const deleteItem = (Id) => {
        setState(prevState => ({ ...prevState, showPopup: true, deletedId: Id }))
    }

    /**
    * @method confirmDeleteItem
    * @description confirm delete item
    */
    const confirmDeleteItem = (ID) => {
        const loggedInUser = loggedInUserId()
        dispatch(deleteOperationAPI(ID, loggedInUser, (res) => {
            if (res.data.Result === true) {
                Toaster.success(MESSAGES.DELETE_OPERATION_SUCCESS);
                resetState()
                setState(prevState => ({ ...prevState, dataCount: 0 }))
            }
        }));
        setState(prevState => ({ ...prevState, showPopup: false }))
    }
    const onPopupConfirm = () => {
        confirmDeleteItem(state.deletedId);
    }
    const closePopUp = () => {
        setState(prevState => ({ ...prevState, showPopup: false }))
    }


    const showAnalytics = (cell, rowData) => {
        setState(prevState => ({ ...prevState, selectedRowDataAnalytics: rowData, analyticsDrawer: true }))
    }

    /**
    * @method buttonFormatter
    * @description Renders buttons
    */
    const { permissionData } = state;
    const { benchMark } = props
    const buttonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        let isEditable = false
        let isDeleteButton = false
        if (permissionData?.Edit) {
            isEditable = true
        } else {
            isEditable = false
        }
        isDeleteButton = (tourStartData.showExtraData && props.rowIndex === 0) || (permissionData?.Delete && !rowData.IsOperationAssociated);


        return (
            <>

                <Button id={`operationListing_movement${props.rowIndex}`} className={"cost-movement Tour_List_Cost_Movement"} variant="cost-movement" onClick={() => showAnalytics(cellValue, rowData)} title={"Cost Movement"} />

                {benchMark !== true && (
                    <>
                        {permissionData?.View && <Button id={`operationListing_view${props.rowIndex}`} className={"View Tour_List_View"} variant="View" onClick={() => viewOrEditItemDetails(cellValue, rowData, true)} title={"View"} />}
                        {isEditable && <Button id={`operationListing_edit${props.rowIndex}`} className={"Edit Tour_List_Edit"} variant="Edit" onClick={() => viewOrEditItemDetails(cellValue, rowData, false)} title={"Edit"} />}
                        {isDeleteButton && <Button id={`operationListing_delete${props.rowIndex}`} className={"Delete Tour_List_Delete"} variant="Delete" onClick={() => deleteItem(cellValue)} title={"Delete"} />}
                    </>
                )}
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

    /**
    * @method commonCostFormatter
    */
    const commonCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? cell : '-';
    }

    /**
    * @method costingHeadFormatter
    * @description Renders Costing head
    */
    const costingHeadFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        if (selectedRowForPagination?.length > 0) {
            selectedRowForPagination.map((item) => {
                if (item.OperationId === props.node.data.OperationId) {
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
    // const effectiveDateFormatter = (props) => {
    //     
    //     const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
    //     return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '-';
    // }

    const effectiveDateFormatter = (props) => {
        if (state?.showExtraData && props?.rowIndex === 0) {
            return "Lorem Ipsum";
        } else {
            const cellValue = props?.valueFormatted || props?.value || '-';
            return cellValue !== '-' ? DayTime(cellValue).format('DD/MM/YYYY') : '-';
        }
    }

    const renderPlantFormatter = (props) => {
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        let data = rowData.CostingHead === "Vendor Based" ? rowData.DestinationPlant : rowData.Plants

        return (data !== ' ' ? data : '-');
    }
    const viewAttachmentData = (index) => {
        setState(prevState => ({ ...prevState, viewAttachment: index, attachment: true }))
    }
    const closeAttachmentDrawer = (e = '') => {
        setState(prevState => ({ ...prevState, attachment: false }))
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
                        >View Attachment</button>
                        //  <Button
                        //     type='button'
                        //     id='bopDomesticListing_btnViewAttachment'
                        //      title='View Attachment'
                        //      className='btn-a pl-0'
                        //      onClick={() => viewAttachmentData(row)}
                        //      buttonName={'View Attachment'}/>
                    }
                </div>
            </>
        )

    }

    const formToggle = () => {
        if (checkMasterCreateByCostingPermission()) {
            props.formToggle()
        }
    }

    const hideForm = () => {
        setState(prevState => ({ ...prevState, toggleForm: false, data: { isEditFlag: false, ID: '' } }, () => { resetState() }))
    }

    const bulkToggle = () => {
        if (checkMasterCreateByCostingPermission(true)) {
            setState(prevState => ({ ...prevState, isBulkUpload: true }))
        }
    }

    const closeBulkUploadDrawer = (event, type) => {
        setState(prevState => ({ ...prevState, isBulkUpload: false }))
        if (type !== 'cancel') {
            resetState()
        }
    }



    const onGridReady = (params) => {
        setState(prevState => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi }))
        if (props.isSimulation || props.isMasterSummaryDrawer) {
            window.screen.width >= 1600 && params.api.sizeColumnsToFit()
        }
        window.screen.width >= 1921 && params.api.sizeColumnsToFit()
        params.api.paginationGoToPage(0);

        const checkBoxInstance = document.querySelectorAll('.ag-input-field-input.ag-checkbox-input');
        checkBoxInstance.forEach((checkBox, index) => {
            const specificId = `Operation_Checkbox${index / 11}`;
            checkBox.id = specificId;
        })
        const floatingFilterInstances = document.querySelectorAll('.ag-input-field-input.ag-text-field-input');
        floatingFilterInstances.forEach((floatingFilter, index) => {
            const specificId = `Operation_Floating${index}`;
            floatingFilter.id = specificId;
        });
    };

    const onExcelDownload = () => {

        setState(prevState => ({ ...prevState, disableDownload: true }))
        dispatch(disabledClass(true))
        let tempArr = state.gridApi && state.gridApi?.getSelectedRows()
        // let tempArr = selectedRowForPagination
        if (tempArr?.length > 0) {
            setTimeout(() => {
                setState(prevState => ({ ...prevState, disableDownload: false }))
                dispatch(disabledClass(false))
                let button = document.getElementById('Excel-Downloads-operation')
                button && button.click()
            }, 400);

        } else {
            getTableListData(null, null, null, null, 0, defaultPageSize, false, state.floatingFilterData)  // FOR EXCEL DOWNLOAD OF COMPLETE DATA
        }
    }

    const onBtExport = () => {
        let tempArr = []
        //tempArr = state.gridApi && state.gridApi?.getSelectedRows()
        tempArr = selectedRowForPagination
        tempArr = (tempArr && tempArr.length > 0) ? tempArr : (allOperationList ? allOperationList : [])
        return returnExcelColumn(OPERATION_DOWNLOAD_EXCEl, tempArr)
    };

    const returnExcelColumn = (data = [], TempData) => {
        let excelData = hideCustomerFromExcel(data, "CustomerName")
        let temp = []
        temp = TempData && TempData.map((item) => {
            if (item.Specification === null) {
                item.Specification = ' '
            }
            else if (item.Plants === '-') {
                item.Plants = ' '
            } else if (item.VendorName === '-') {
                item.VendorName = ' '
            } else if (item?.EffectiveDate?.includes('T')) {
                item.EffectiveDate = DayTime(item.EffectiveDate).format('DD/MM/YYYY')
            }
            return item
        })
        return (

            <ExcelSheet data={temp} name={OperationMaster}>

                {excelData && excelData.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
    }

    const onFilterTextBoxChanged = (e) => {
        setSearchText(state.gridApi.setQuickFilter(e.target.value));
    }

    /**
    * @method render
    * @description Renders the component
    */

    const { isSimulation } = props;
    const { toggleForm, data, isBulkUpload, noData } = state;
    const ExcelFile = ReactExport.ExcelFile;


    var filterParams = {
        date: "",
        comparator: function (filterLocalDateAtMidnight, cellValue) {
            var dateAsString = cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
            var newDate = filterLocalDateAtMidnight != null ? DayTime(filterLocalDateAtMidnight).format('DD/MM/YYYY') : '';
            setDate(newDate)
            handleDate(newDate)// FOR COSTING BENCHMARK OPERATION REPORT
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

    var handleDate = (newDate) => {
        let temp = state.inRangeDate
        temp.push(newDate)
        setState(prevState => ({ ...prevState, inRangeDate: temp }))
        if (props?.benchMark) {
            props?.handleDate(state.inRangeDate)
        }
        setTimeout(() => {
            var y = document.getElementsByClassName('ag-radio-button-input');
            var radioBtn = y[0];
            radioBtn?.click()

        }, 300);
    }


    var setDate = (date) => {
        setState(prevState => ({ ...prevState, floatingFilterData: { ...state.floatingFilterData, EffectiveDate: date } }))
    }

    if (toggleForm) {
        return (
            <AddOperation hideForm={hideForm} data={data} />
        )
    }

    const onRowSelect = (event) => {
        var selectedRows = state.gridApi && state.gridApi?.getSelectedRows();
        if (selectedRows === undefined || selectedRows === null) {     //CONDITION FOR FIRST RENDERING OF COMPONENT
            selectedRows = selectedRowForPagination
        } else if (selectedRowForPagination && selectedRowForPagination.length > 0) {   // CHECKING IF REDUCER HAS DATA

            let finalData = []
            if (event.node.isSelected() === false) {  // CHECKING IF CURRENT CHECKBOX IS UNSELECTED

                for (let i = 0; i < selectedRowForPagination.length; i++) {
                    if (selectedRowForPagination[i].OperationId === event.data.OperationId) {  // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
                        continue;
                    }
                    finalData.push(selectedRowForPagination[i])
                }
            } else {
                finalData = selectedRowForPagination
            }
            selectedRows = [...selectedRows, ...finalData]
        }


        let uniqeArray = _.uniqBy(selectedRows, "OperationId")          //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
        dispatch(setSelectedRowForPagination(uniqeArray))               //SETTING CHECKBOX STATE DATA IN REDUCER
        setState(prevState => ({ ...prevState, dataCount: uniqeArray.length }))
        let finalArr = selectedRows
        let length = finalArr?.length
        let uniqueArray = _.uniqBy(finalArr, "OperationId")
        if (props.isSimulation) {

            props.apply(uniqueArray, length)
        }

        setState(prevState => ({ ...prevState, selectedRowData: selectedRows }))

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

    const closeAnalyticsDrawer = () => {
        setState(prevState => ({ ...prevState, analyticsDrawer: false }))
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: isFirstColumn,
        headerCheckboxSelection: (props.isSimulation || props.benchMark) ? isFirstColumn : false,
    };

    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        customNoRowsOverlay: NoContentFound,
        costingHeadFormatter: costingHeadFormatter,
        renderPlantFormatter: renderPlantFormatter,
        effectiveDateFormatter: effectiveDateFormatter,
        hyphenFormatter: hyphenFormatter,
        commonCostFormatter: commonCostFormatter,
        attachmentFormatter: attachmentFormatter,
    };
    return (
        <div className={`${isSimulation ? 'simulation-height' : props?.isMasterSummaryDrawer ? '' : 'min-height100vh'}`}>
            {(state.isLoader && !props.isMasterSummaryDrawer) && <LoaderCustom customClass="simulation-Loader" />}            {state.disableDownload && <LoaderCustom message={MESSAGES.DOWNLOADING_MESSAGE} />}
            <div className={`ag-grid-react ${(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) ? "custom-pagination" : ""} ${permissionData?.Download ? "show-table-btn no-tab-page" : ""}`}>
                <form>
                    <Row className={`${props?.isMasterSummaryDrawer ? '' : 'pt-4'} filter-row-large blue-before ${isSimulation || props.benchMark ? "zindex-0" : ""}`}>
                        <Col md="3" lg="3">
                            <input type="text" value={searchText} className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                            {(!props.isSimulation && !props.benchMark && !props?.isMasterSummaryDrawer) && (<TourWrapper
                                buttonSpecificProp={{ id: "Operation_Listing_Tour", onClick: toggleExtraData }}
                                stepsSpecificProp={{
                                    steps: Steps(t, { addLimit: false, copyButton: false, viewBOM: false, status: false, updateAssociatedTechnology: false, addMaterial: false, addAssociation: false, generateReport: false, approve: false, reject: false }).COMMON_LISTING
                                }} />)}
                        </Col>
                        <Col md="9" lg="9" className=" mb-3 d-flex justify-content-end">
                            <div className="d-flex justify-content-end bd-highlight w100">
                                {(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) &&
                                    <div className="warning-message d-flex align-items-center">
                                        {state.warningMessage && !state.disableDownload && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                                    </div>
                                }

                                { }
                                {(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) &&
                                    <Button id="operationListing_filter" className={"user-btn mr5 Tour_List_Filter"} onClick={() => onSearch()} title={"Filtered data"} icon={"filter"} disabled={state.disableFilter} />

                                }
                                {(!isSimulation && !props?.benchMark) && <>

                                    {state.shown ?
                                        <button type="button" className="user-btn mr5 filter-btn-top mt3px" onClick={() => setState(prevState => ({ ...prevState, shown: !state.shown }))}>
                                            <div className="cancel-icon-white"></div>
                                        </button>
                                        // <Button type="button" className="user-btn mr5 filter-btn-top" onClick={handleShown()} icon="cancel-icon-white"/>

                                        :
                                        ""
                                    }

                                    {permissionData?.Add && !props?.isMasterSummaryDrawer && (
                                        <Button id="operationListing_add" className={"user-btn mr5 Tour_List_Add"} onClick={formToggle} title={"Add"} icon={"plus mr-0"} />

                                    )}
                                    {permissionData?.BulkUpload && !props?.isMasterSummaryDrawer && (

                                        <Button id="operationListing_bulkUpload" className={"user-btn mr5 Tour_List_BulkUpload"} onClick={bulkToggle} title={"Bulk Upload"} icon={"upload"} />
                                    )}
                                    {
                                        permissionData?.Download && !props?.isMasterSummaryDrawer &&
                                        <>

                                            <Button className="user-btn mr5 Tour_List_Download" id={"operationListing_excel_download"} onClick={onExcelDownload} title={`Download ${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`}
                                                icon={"download mr-1"}
                                                buttonName={`${state.dataCount === 0 ? "All" : "(" + state.dataCount + ")"}`}
                                            />

                                            <ExcelFile filename={'Operation'} fileExtension={'.xls'} element={
                                                <Button id={"Excel-Downloads-operation"} className="p-absolute" />}>

                                                {onBtExport()}
                                            </ExcelFile>
                                        </>
                                    }
                                </>
                                }
                            </div>

                            <Button id={"operationListing_refresh"} className="Tour_List_Reset" onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />

                        </Col>

                    </Row>
                </form>
                <div className={`ag-grid-wrapper p-relative ${(props?.isDataInMaster && !noData) ? 'master-approval-overlay' : ''} ${(state.tableData && state.tableData.length <= 0) || noData ? 'overlay-contain' : ''}  ${props.isSimulation ? 'min-height' : ''}`}>
                    <div className={`ag-theme-material ${(state.isLoader && !props.isMasterSummaryDrawer) && "max-loader-height"}`}>
                        {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                        {(!state.render && !state.isLoader) && Object.keys(permissionData).length > 0 && <AgGridReact
                            defaultColDef={defaultColDef}
                            floatingFilter={true}
                            domLayout='autoHeight'
                            rowData={state.showExtraData ? [...setLoremIpsum(state.tableData[0]), ...state.tableData] : state.tableData}


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
                            //onSelectionChanged={onRowSelect}
                            onRowSelected={onRowSelect}
                            suppressRowClickSelection={true}
                            onFilterModified={onFloatingFilterChanged}
                            enableBrowserTooltips={true}
                        >
                            {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}

                            <AgGridColumn field="CostingHead" headerName="Costing Head" cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                            {!isSimulation && <AgGridColumn field="Technology" tooltipField='Technology' filter={true} floatingFilter={true} headerName={technologyLabel}></AgGridColumn>}
                            <AgGridColumn field="ForType" headerName="Operation Type" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                            <AgGridColumn field="OperationName" tooltipField="OperationName" headerName="Operation Name"></AgGridColumn>
                            <AgGridColumn field="OperationCode" headerName="Operation Code" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                            <AgGridColumn field="Plants" headerName="Plant (Code)" ></AgGridColumn>
                            <AgGridColumn field="VendorName" headerName="Vendor (Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                            {reactLocalStorage.getObject('cbcCostingPermission') && <AgGridColumn field="CustomerName" headerName="Customer (Code)" cellRenderer={'hyphenFormatter'}></AgGridColumn>}
                            {/* <AgGridColumn field="DepartmentName" headerName="Department"></AgGridColumn> */}
                            <AgGridColumn field="UOM" headerName="UOM"></AgGridColumn>
                            <AgGridColumn field="Rate" headerName={`Rate (${reactLocalStorage.getObject("baseCurrency")})`} cellRenderer={'commonCostFormatter'}></AgGridColumn>
                            <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={'effectiveDateFormatter'} filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                            {!isSimulation && !props?.isMasterSummaryDrawer && <AgGridColumn field="OperationId" cellClass={"actions-wrapper ag-grid-action-container"} width={150} pinned="right" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>}
                            {props.isMasterSummaryDrawer && <AgGridColumn field="Attachements" headerName='Attachments' cellRenderer={'attachmentFormatter'}></AgGridColumn>}
                            {props.isMasterSummaryDrawer && <AgGridColumn field="Remark" tooltipField="Remark" ></AgGridColumn>}
                        </AgGridReact>}
                        <div className='button-wrapper'>
                            {!state.isLoader &&
                                <PaginationWrappers gridApi={state.gridApi} totalRecordCount={state.totalRecordCount} getDataList={getTableListData} floatingFilterData={state.floatingFilterData} module="Operations" />
                            }
                            {(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) &&
                                <PaginationControls totalRecordCount={state.totalRecordCount} getDataList={getTableListData} floatingFilterData={state.floatingFilterData} module="Operations" />

                            }
                        </div>
                    </div>
                </div>

                {isBulkUpload && <BulkUpload isOpen={isBulkUpload} closeDrawer={closeBulkUploadDrawer} isEditFlag={false} fileName={'Operation'} isZBCVBCTemplate={true} messageLabel={'Operation'} anchor={'right'} masterId={OPERATIONS_ID} />}

                {
                    state.analyticsDrawer &&
                    <AnalyticsDrawer isOpen={state.analyticsDrawer} ModeId={3} closeDrawer={closeAnalyticsDrawer} anchor={"right"} isReport={state.analyticsDrawer} selectedRowData={state.selectedRowDataAnalytics} isSimulation={true}
                        rowData={state.selectedRowDataAnalytics}
                    />
                }
                {state.attachment && (<Attachament
                    isOpen={state.attachment}
                    index={state.viewAttachment}
                    closeDrawer={closeAttachmentDrawer}
                    anchor={'right'}
                    gridListing={true}
                />
                )
                }

            </div>
            {
                state.showPopup && <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.OPERATION_DELETE_ALERT}`} />
            }
        </div>
    );
}

export default OperationListing
