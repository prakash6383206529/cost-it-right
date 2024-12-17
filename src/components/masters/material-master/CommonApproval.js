import React, { useState, useEffect, Fragment, useRef } from 'react'
import { Row, Col } from 'reactstrap'
import { useDispatch, useSelector } from 'react-redux'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import LoaderCustom from '../../common/LoaderCustom'
import NoContentFound from '../../common/NoContentFound';
import DayTime from '../../common/DayTimeWrapper'
import { IsShowFreightAndShearingCostFields, checkForDecimalAndNull, getConfigurationKey, getLocalizedCostingHeadValue, handleDepartmentHeader, loggedInUserId, removeSpaces, searchNocontentFilter, showBopLabel, userDetails, userTechnologyDetailByMasterId, userTechnologyLevelDetailsWithoutCostingToApproval } from '../../../helper'
import { BOP_MASTER_ID, BUDGET_ID, CLASSIFICATIONAPPROVALTYPEID, EMPTY_DATA, LPSAPPROVALTYPEID, MACHINE_MASTER_ID, ONBOARDINGID, OPERATIONS_ID } from '../../../config/constants';
import { deleteRawMaterialAPI, getRMApprovalList } from '../actions/Material';
import SummaryDrawer from '../SummaryDrawer';
import { DRAFT, RM_MASTER_ID } from '../../../config/constants';
import MasterSendForApproval from '../MasterSendForApproval';
import WarningMessage from '../../common/WarningMessage';
import Toaster from '../../common/Toaster'
import { setSelectedRowForPagination } from '../../simulation/actions/Simulation';
import { hyphenFormatter } from '../masterUtil';
import { agGridStatus, dashboardTabLock, getGridHeight, isResetClick } from '../../../actions/Common'
import _ from 'lodash';
import SingleDropdownFloationFilter from './SingleDropdownFloationFilter';
import { reactLocalStorage } from 'reactjs-localstorage';
import { getUsersMasterLevelAPI, getUsersOnboardingLevelAPI } from '../../../actions/auth/AuthActions';
import Button from '../../layout/Button';
import { MESSAGES } from '../../../config/message';
import { deleteBOP } from '../actions/BoughtOutParts';
import { deleteMachine } from '../actions/MachineMaster';
import { deleteOperationAPI } from '../actions/OtherOperation';
import { deleteBudget } from '../actions/Budget';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { PaginationWrappers } from '../../common/Pagination/PaginationWrappers';
import PaginationControls from '../../common/Pagination/PaginationControls';
import { resetStatePagination, updateCurrentRowIndex, updatePageNumber } from '../../common/Pagination/paginationAction';
import SendForApproval from '../../vendorManagement/approval/SendForApproval';
import { useLabels } from '../../../helper/core';
import CostingHeadDropdownFilter from './CostingHeadDropdownFilter';

const gridOptions = {};

function CommonApproval(props) {
    const searchRef = useRef(null);

    const [gridApi, setGridApi] = useState(null);     // DON'T DELETE THIS STATE, IT IS USED BY AG-GRID
    const [gridColumnApi, setGridColumnApi] = useState(null);   // DON'T DELETE THIS STATE, IT IS USED BY AG-GRID
    const [selectedRowData, setSelectedRowData] = useState([]);
    const [approvalData, setApprovalData] = useState('')
    const [showApprovalSumary, setShowApprovalSummary] = useState(false)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const { approvalList } = useSelector((state) => state.material)
    const [approvalDrawer, setApprovalDrawer] = useState(false)
    const [loader, setLoader] = useState(true)
    const [isFinalApprover, setIsFinalApprover] = useState(false)
    //STATES BELOW ARE MADE FOR PAGINATION PURPOSE
    const [disableFilter, setDisableFilter] = useState(true)
    const [warningMessage, setWarningMessage] = useState(false)
    // const [globalTake, setGlobalTake] = useState(defaultPageSize)
    const [filterModel, setFilterModel] = useState({});
    // const [pageNo, setPageNo] = useState(1)
    // const [pageNoNew, setPageNoNew] = useState(1)
    const [totalRecordCount, setTotalRecordCount] = useState(1)
    const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false)
    // const [currentRowIndex, setCurrentRowIndex] = useState(0)
    // const [pageSize, setPageSize] = useState({ pageSize10: true, pageSize50: false, pageSize100: false })
    const [noData, setNoData] = useState(false)
    const [floatingFilterData, setFloatingFilterData] = useState({ EntryType: '', ApprovalProcessId: "", ApprovalNumber: "", CostingHead: "", TechnologyName: "", RawMaterialName: "", RawMaterialGradeName: "", RawMaterialSpecificationName: "", Category: "", MaterialType: "", Plant: "", VendorName: "", UOM: "", BasicRatePerUOM: "", ScrapRate: "", RMFreightCost: "", RMShearingCost: "", NetLandedCost: "", EffectiveDate: "", RequestedBy: "", CreatedByName: "", LastApprovedBy: "", DisplayStatus: "", BoughtOutPartNumber: "", BoughtOutPartName: "", BoughtOutPartCategory: "", Specification: "", Plants: "", MachineNumber: "", MachineTypeName: "", MachineTonnage: "", MachineRate: "", Technology: "", OperationName: "", OperationCode: "", UnitOfMeasurement: "", Rate: "", vendor: "", DestinationPlantName: "", UnitOfMeasurementName: "", IsScrapUOMApply: "", CalculatedFactor: "", ScrapUnitOfMeasurement: "", UOMToScrapUOMRatio: "" })
    const [levelDetails, setLevelDetails] = useState({})
    const [disableApprovalButton, setDisableApprovalButton] = useState(false)
    const [showPopup, setShowPopup] = useState(false);
    const [deletedId, setDeletedId] = useState('');
    const dispatch = useDispatch()
    const { selectedCostingListSimulation } = useSelector((state => state.simulation))
    let master = props?.MasterId
    const { globalTakes } = useSelector((state) => state.pagination)
    const statusColumnData = useSelector((state) => state.comman.statusColumnData);
    const netCostHeader = `Net Cost (${reactLocalStorage.getObject("baseCurrency")})`
    const { technologyLabel, vendorLabel, vendorBasedLabel, zeroBasedLabel, customerBasedLabel } = useLabels();
    useEffect(() => {
        dispatch(agGridStatus("", ""))
        dispatch(setSelectedRowForPagination([]))
        setSelectedRowData([])
        getTableData(0, 10, true, floatingFilterData)

        dispatch(isResetClick(false, "status"))
        if (userDetails().Role === 'SuperAdmin') {
            setDisableApprovalButton(true)
        }

        return () => {
            // Cleanup function
            dispatch(setSelectedRowForPagination([]))
            setSelectedRowData([])
            dispatch(resetStatePagination())
        }

    }, [])


    useEffect(() => {

        if (statusColumnData && statusColumnData.data) {
            setDisableFilter(false)
            setWarningMessage(true)
            setFloatingFilterData(prevState => ({ ...prevState, DisplayStatus: removeSpaces(statusColumnData.data) }))
        }
    }, [statusColumnData])
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

    var floatingFilterStatus = {
        maxValue: 1,
        suppressFilterButton: true,
        component: "common",
        location: "masters"
    }
    useEffect(() => {
        if (approvalList?.length > 0) {
            setTotalRecordCount(approvalList[0].TotalRecordCount)
        }
        else {
            setNoData(false)
        }
        dispatch(getGridHeight({ value: approvalList?.length, component: "common" }))
    }, [approvalList])

    /**
* @method getTableData
* @description getting approval list table
*/

    const getTableData = (skip = 0, take = 10, isPagination = true, dataObj, pageDropDownChange = false) => {
        //  API CALL FOR GETTING RM APPROVAL LIST
        if (props.isDashboard) {
            dataObj.DisplayStatus = props.status
        }
        const { zbc, vbc, cbc } = reactLocalStorage.getObject('CostingTypePermission')
        dataObj.IsCustomerDataShow = cbc
        dataObj.IsVendorDataShow = vbc
        dataObj.IsZeroDataShow = zbc

        setLoader(true)
        props?.isDashboard && dispatch(dashboardTabLock(true))
        dispatch(getRMApprovalList(props?.MasterId, skip, take, isPagination, dataObj, props?.OnboardingApprovalId, (res) => {
            setLoader(false)
            dispatch(dashboardTabLock(false))
            let obj = { ...floatingFilterData }
            if (res) {
                if (res && res.status === 204) {
                    setTotalRecordCount(0)
                    // setPageNo(0)
                    dispatch(updatePageNumber(0))
                }
                let isReset = true
                setTimeout(() => {

                    for (var prop in obj) {
                        if (prop !== "DepartmentCode" && obj[prop] !== "") {
                            isReset = false
                        }
                    }

                    // Sets the filter model via the grid API
                    isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(filterModel))
                    setTimeout(() => {

                        dispatch(isResetClick(false, "status"))
                        setWarningMessage(false)
                        setFloatingFilterData(obj)
                    }, 23);
                }, 300);
                setTimeout(() => {
                    setIsFilterButtonClicked(false)
                }, 600);
            }
        }))
    }


    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            if (approvalList?.length !== 0) setNoData(searchNocontentFilter(value, noData))
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

                        if (prop !== "DepartmentCode") {
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
        // setPageNo(1)
        // setPageNoNew(1)
        // setCurrentRowIndex(0)
        dispatch(updatePageNumber(1))
        dispatch(updateCurrentRowIndex(10))
        gridOptions?.columnApi?.resetColumnState();
        getTableData(0, globalTakes, true, floatingFilterData)
    }



    const resetState = () => {
        dispatch(agGridStatus("", ""))
        dispatch(isResetClick(true, "status"))
        setIsFilterButtonClicked(false)
        gridApi.setQuickFilter(null)

        gridOptions?.columnApi?.resetColumnState(null);
        gridOptions?.api?.setFilterModel(null);
        
        if (props?.OnboardingApprovalId === ONBOARDINGID) {
            gridApi.sizeColumnsToFit();
        }
        for (var prop in floatingFilterData) {

            if (prop !== "DepartmentCode") {
                floatingFilterData[prop] = ""
            }
        }

        setFloatingFilterData(floatingFilterData)
        setWarningMessage(false)
        // setPageNo(1)
        // setPageNoNew(1)
        // setCurrentRowIndex(0)
        dispatch(resetStatePagination())
        getTableData(0, 10, true, floatingFilterData)
        dispatch(setSelectedRowForPagination([]))
        setSelectedRowData([])
        // setGlobalTake(10)
        // setPageSize(prevState => ({ ...prevState, pageSize10: true, pageSize50: false, pageSize100: false }))
        if (searchRef.current) {
            searchRef.current.value = '';
        }
    }


    const createdOnFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? cell : '';
    }

    const priceFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (
            <>

                {cell != null ? checkForDecimalAndNull(cell, initialConfiguration && initialConfiguration.NoOfDecimalForPrice) : ''}
            </>
        )
    }

    const oldpriceFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (
            <>
                {cell != null ? checkForDecimalAndNull(cell, initialConfiguration && initialConfiguration.NoOfDecimalForPrice) : ''}
            </>
        )
    }
    const floatingFilterStatusCostingHead = {
        maxValue: 1,
        suppressFilterButton: true,
        component: CostingHeadDropdownFilter,
        onFilterChange: (originalValue, value) => {
            // setSelectedCostingHead(originalValue);
            setDisableFilter(false);
            setFloatingFilterData(prevState => ({
                ...prevState,
                CostingHead: value
            }));
        }
    };
    const requestedOnFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell ? cell : '-';
    }

    const statusFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return <div className={cell}>{row.DisplayStatus}</div>
    }

    const renderPlant = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (cell !== null && cell !== '-') ? `${cell}(${row.PlantCode})` : '-'
    }

    const renderVendor = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (cell !== null && cell !== '-') ? `${cell}(${row.VendorCode})` : '-'
    }

    /**
    * @method costingHeadFormatter
    * @description Renders Costing head
    */
    const costingHeadFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cellValue === true || cellValue === 'VBC') ? 'Vendor Based' : 'Zero Based';
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
    * @method basicRateFormatter
    * @description Renders buttons
    */
    const basicRateFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue ? cellValue : (row?.IsBreakupBoughtOutPart ? '-' : 0);
    }

    /**
    * @method netCostFormatter
    * @description Renders buttons
    */
    const netCostFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue ? cellValue : (row?.IsBreakupBoughtOutPart ? '-' : 0);
    }

    /**
    * @method breakupFormatter
    * @description Renders buttons
    */
    const breakupFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue ? 'Yes' : 'No';
    }

    /**
    * @method technologyFormatter
    * @description Renders buttons
    */
    const technologyFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue ? cellValue : '-';
    }

    /**
    * @method shearingCostFormatter
    * @description Renders buttons
    */
    const shearingCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? cell : '-';
    }

    /**
    * @method freightCostFormatter
    * @description Renders buttons
    */
    const freightCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? cell : '-';
    }


    const costFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? cell : '';
    }

    const viewDetails = (approvalNumber = '', approvalProcessId = '', costingTypeId = '', id = '') => {
        setApprovalData({ approvalProcessId: approvalProcessId, approvalNumber: approvalNumber, costingTypeId: costingTypeId, id: id })
        setShowApprovalSummary(true)

    }

    /**
    * @method linkableFormatter
    * @description Renders Name link
    */
    const linkableFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        let id = ''
        switch (master) {
            case RM_MASTER_ID:
                id = row?.RawMaterialId
                break;
            case BOP_MASTER_ID:
                id = row?.BoughtOutPartId
                break;
            case OPERATIONS_ID:
                id = row?.OperationId
                break;
            case MACHINE_MASTER_ID:
                id = row?.MachineId
                break;
            default:
                break;
        }
        if (selectedCostingListSimulation?.length > 0) {
            selectedCostingListSimulation.map((item) => {

                switch (master) {
                    case 1:
                        if (item?.RawMaterialId === props?.node?.data?.RawMaterialId) {
                            id = item?.RawMaterialId
                            props.node.setSelected(true)
                        }
                        break;
                    case 2:
                        if (item?.BoughtOutPartId === props?.node?.data?.BoughtOutPartId) {
                            id = item?.BoughtOutPartId
                            props.node.setSelected(true)
                        }
                        break;
                    case 3:
                        if (item?.OperationId === props?.node?.data?.OperationId) {
                            id = item?.OperationId
                            props.node.setSelected(true)
                        }
                        break;
                    case 4:
                        if (item?.MachineId === props?.node?.data?.MachineId) {
                            id = item?.MachineId
                            props.node.setSelected(true)
                        }
                        break;
                    default:
                        // code block
                        if (item?.ApprovalProcessId === props?.node?.data?.ApprovalProcessId) {
                            id = item?.ApprovalProcessId
                            props.node.setSelected(true)
                        }
                }
                return null
            })
        }

        return (
            <Fragment>
                {
                    row.Status !== DRAFT ?
                        <div onClick={() => viewDetails(row.ApprovalNumber, row.ApprovalProcessId, row.CostingTypeId, id)} className={row.Status !== DRAFT ? 'link' : ''}>
                            {row.ApprovalNumber === 0 ? row.ApprovalNumber : row.ApprovalNumber}
                        </div> :
                        row.ApprovalNumber === 0 ? row.ApprovalNumber : row.ApprovalNumber
                }
            </Fragment>
        )
    }


    /**
    * @method closeDrawer
    * @description HIDE RM DRAWER
    */
    const closeDrawer = (e = '', type) => {
        setShowApprovalSummary(false)
        if (type === 'submit') {
            setLoader(true)
            getTableData(0, 10, true, floatingFilterData)
        }
    }
    const closeApprovalDrawer = (e = '', type) => {
        setApprovalDrawer(false)
        if (type === 'submit') {
            setSelectedRowData([])
            setLoader(true)
            getTableData(0, 10, true, floatingFilterData)
        }
    }


    const onRowSelect = (event) => {

        var selectedRows = gridApi && gridApi?.getSelectedRows();
        if (selectedRows === undefined || selectedRows === null) {    //CONDITION FOR FIRST RENDERING OF COMPONENT
            selectedRows = selectedCostingListSimulation
        } else if (selectedCostingListSimulation && selectedCostingListSimulation.length > 0) {  // CHECKING IF REDUCER HAS DATA

            let finalData = []
            if (event.node.isSelected() === false) {    // CHECKING IF CURRENT CHECKBOX IS UNSELECTED

                for (let i = 0; i < selectedCostingListSimulation.length; i++) {

                    switch (props?.MasterId) {
                        case 1:
                            if (selectedCostingListSimulation[i]?.RawMaterialId === event?.data?.RawMaterialId) {   // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
                                continue;
                            }
                            break;
                        case 2:
                            if (selectedCostingListSimulation[i]?.BoughtOutPartId === event?.data?.BoughtOutPartId) {   // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
                                continue;
                            }
                            break;
                        case 3:
                            if (selectedCostingListSimulation[i]?.OperationId === event?.data?.OperationId) {   // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
                                continue;
                            }
                            break;
                        case 4:
                            if (selectedCostingListSimulation[i]?.MachineId === event?.data?.MachineId) {   // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
                                continue;
                            }
                            break;
                        default:
                            // code block
                            if (selectedCostingListSimulation[i]?.ApprovalProcessId === event?.data?.ApprovalProcessId) {   // REMOVING UNSELECTED CHECKBOX DATA FROM REDUCER
                                continue;
                            }
                    }
                    finalData.push(selectedCostingListSimulation[i])
                }

            } else {
                finalData = selectedCostingListSimulation
            }
            selectedRows = [...selectedRows, ...finalData]
        }


        let uniqeArray = []
        switch (props?.MasterId) {
            case 1:
                uniqeArray = _.uniqBy(selectedRows, "RawMaterialId")          //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
                dispatch(setSelectedRowForPagination(uniqeArray))              //SETTING CHECKBOX STATE DATA IN REDUCER
                setSelectedRowData(uniqeArray)
                break;
            case 2:
                uniqeArray = _.uniqBy(selectedRows, "BoughtOutPartId")          //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
                dispatch(setSelectedRowForPagination(uniqeArray))              //SETTING CHECKBOX STATE DATA IN REDUCER
                setSelectedRowData(uniqeArray)
                break;
            case 3:
                uniqeArray = _.uniqBy(selectedRows, "OperationId")          //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
                dispatch(setSelectedRowForPagination(uniqeArray))              //SETTING CHECKBOX STATE DATA IN REDUCER
                setSelectedRowData(uniqeArray)
                break;
            case 4:
                uniqeArray = _.uniqBy(selectedRows, "MachineId")          //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
                dispatch(setSelectedRowForPagination(uniqeArray))              //SETTING CHECKBOX STATE DATA IN REDUCER
                setSelectedRowData(uniqeArray)
                break;
            default:
                // code block
                uniqeArray = _.uniqBy(selectedRows, "ApprovalProcessId")          //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
                dispatch(setSelectedRowForPagination(uniqeArray))              //SETTING CHECKBOX STATE DATA IN REDUCER
                setSelectedRowData(uniqeArray)
        }
    }


    const isFirstColumn = (params) => {
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;

        return thisIsFirstColumn;
    }


    const sendForApproval = () => {
        if (selectedRowData?.length > 0) {
            let levelDetailsTemp = []
            dispatch(getUsersMasterLevelAPI(loggedInUserId(), props?.MasterId, (res) => {
                levelDetailsTemp = userTechnologyDetailByMasterId(selectedRowData[0]?.CostingTypeId, props?.MasterId, res?.data?.Data?.MasterLevels)
                setLevelDetails(levelDetailsTemp)
            }))

            let costingHead = selectedRowData[0]?.CostingHead;
            let plantId = selectedRowData[0]?.MasterApprovalPlantId
            let checkPlantIdSame = true;
            let checkCostingHeadSame = true
            selectedRowData.map((item) => {
                if (item.CostingHead !== costingHead) {
                    checkCostingHeadSame = false
                    return false
                }
                if (item.MasterApprovalPlantId !== plantId) {
                    checkPlantIdSame = false
                    return false
                }
                return null
            })
            let checkApprovalTypeOfSupplier = true
            if (props?.OnboardingApprovalId !== ONBOARDINGID) {

                dispatch(getUsersMasterLevelAPI(loggedInUserId(), props?.MasterId, (res) => {
                    levelDetailsTemp = userTechnologyDetailByMasterId(selectedRowData[0]?.CostingTypeId, props?.MasterId, res?.data?.Data?.MasterLevels)
                    setLevelDetails(levelDetailsTemp)
                }))

                let costingHead = selectedRowData[0]?.CostingHead;
                let plantId = selectedRowData[0]?.MasterApprovalPlantId

                selectedRowData.map((item) => {
                    if (item.CostingHead !== costingHead) {
                        checkCostingHeadSame = false
                        return false
                    }
                    if (item.MasterApprovalPlantId !== plantId) {
                        checkPlantIdSame = false
                        return false
                    }
                    return null
                })
            } else {
                dispatch(getUsersOnboardingLevelAPI(loggedInUserId(), (res) => {

                    levelDetailsTemp = userTechnologyLevelDetailsWithoutCostingToApproval(selectedRowData[0]?.ApprovalTypeId, res?.data?.Data?.OnboardingApprovalLevels)

                }))
                let approvalTypeId = selectedRowData[0]?.ApprovalTypeId;
                let plantId = selectedRowData[0]?.PlantId

                selectedRowData.map((item) => {
                    if (item.ApprovalTypeId !== approvalTypeId) {
                        checkApprovalTypeOfSupplier = false
                        return false
                    }
                    if (item.PlantId !== plantId) {
                        checkPlantIdSame = false
                        return false
                    }
                    return null
                })
            }

            if (!checkCostingHeadSame && props?.OnboardingApprovalId !== ONBOARDINGID) {
                Toaster.warning('Please select token with same costing head.')
                return;
            } else if (!(initialConfiguration.IsMultipleUserAllowForApproval ? checkPlantIdSame : true)) {
                Toaster.warning('Please select token with same plant.')
                return;
            } else if (!checkApprovalTypeOfSupplier && props?.OnboardingApprovalId === ONBOARDINGID) {
                Toaster.warning('Please select token with same plant.')
                return;
            }

            else {
                setApprovalDrawer(true)
            }
        }
        else {
            Toaster.warning('Please select draft token to send for approval.')
        }
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        checkboxSelection: isFirstColumn
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
        if (props?.OnboardingApprovalId === ONBOARDINGID) {
            params.api.sizeColumnsToFit();
        }

    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    /**
     * @method deleteItem
     * @description confirm delete Item.
     */
    const deleteItem = (id) => {
        setShowPopup(true)
        setDeletedId(id)
    }
    const deleteActions = {
        [RM_MASTER_ID]: {
            action: deleteRawMaterialAPI,
            successMessage: MESSAGES.DELETE_RAW_MATERIAL_SUCCESS,
        },
        [BOP_MASTER_ID]: {
            action: deleteBOP,
            successMessage: MESSAGES.BOP_DELETE_SUCCESS,
        },
        [MACHINE_MASTER_ID]: {
            action: deleteMachine,
            successMessage: MESSAGES.MACHINE_DELETE_SUCCESS,
        },
        [OPERATIONS_ID]: {
            action: deleteOperationAPI,
            successMessage: MESSAGES.DELETE_OPERATION_SUCCESS,
        },
        [BUDGET_ID]: {
            action: deleteBudget,
            successMessage: MESSAGES.DELETE_BUDGET_SUCCESS,
        },
        default: {
            action: '',
            successMessage: 'Deleted successfully',
        },
    };

    const confirmDeleteItem = (id) => {
        const loggedInUser = loggedInUserId();
        const deleteConfig = deleteActions[props?.MasterId] || deleteActions.default;

        dispatch(deleteConfig.action(id, loggedInUser, (res) => {
            if (res && res.data && res.data.Result === true) {
                Toaster.success(deleteConfig.successMessage);
                resetState();
            }
        }));

        setShowPopup(false);
    };

    const onPopupConfirm = () => {
        confirmDeleteItem(deletedId);
    }
    const closePopUp = () => {
        setShowPopup(false)
    }
    /**
        * @method buttonFormatter
        * @description Renders buttons
        */
    const buttonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

        let status = rowData.Status;

        let isDeleteButton = false;

        if (status === 'Draft') {
            isDeleteButton = true;
        } else {
            isDeleteButton = false;
        }

        return (
            <>
                {isDeleteButton ? (
                    <Button
                        id={`bopDomesticListing_delete${props.rowIndex}`}
                        className={"mr-1"}
                        variant="Delete"
                        onClick={() => deleteItem(cellValue)}
                        title={"Delete"}
                    />
                ) : (
                    <div> </div>
                )}
            </>
        );
    };
    
    const combinedCostingHeadRenderer = (props) => {
        // Call the existing checkBoxRenderer
      
        // Get and localize the cell value
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const localizedValue = getLocalizedCostingHeadValue(cellValue, vendorBasedLabel, zeroBasedLabel, customerBasedLabel);
      
        // Return the localized value (the checkbox will be handled by AgGrid's default renderer)
        return localizedValue;
      };
    const frameworkComponents = {
        combinedCostingHeadRenderer: combinedCostingHeadRenderer,
        renderPlant: renderPlant,
        renderVendor: renderVendor,
        priceFormatter: priceFormatter,
        oldpriceFormatter: oldpriceFormatter,
        createdOnFormatter: createdOnFormatter,
        requestedOnFormatter: requestedOnFormatter,
        statusFormatter: statusFormatter,
        customNoRowsOverlay: NoContentFound,
        costingHeadRenderer: costingHeadFormatter,
        costFormatter: costFormatter,
        freightCostFormatter: freightCostFormatter,
        shearingCostFormatter: shearingCostFormatter,
        effectiveDateFormatter: effectiveDateFormatter,
        linkableFormatter: linkableFormatter,
        effectiveDateRenderer: effectiveDateFormatter,
        hyphenFormatter: hyphenFormatter,
        statusFilter: SingleDropdownFloationFilter,
        basicRateFormatter: basicRateFormatter,
        netCostFormatter: netCostFormatter,
        breakupFormatter: breakupFormatter,
        technologyFormatter: technologyFormatter,
        actionRenderer: buttonFormatter,
        statusFilterCostingHead: CostingHeadDropdownFilter,
        statusFilterCostingHeadApproval: CostingHeadDropdownFilter,
    };

    const isRowSelectable = (rowNode) => {
        if (rowNode?.data?.Status === DRAFT && !rowNode?.data?.IsBreakupBoughtOutPart) {
            return true;
        } else {
            return false
        }
    }
    const getMasterField = (MasterId) => {
        switch (MasterId) {
            case RM_MASTER_ID:
                return "RawMaterialId";
            case BOP_MASTER_ID:
                return "BoughtOutPartId";
            case MACHINE_MASTER_ID:
                return "MachineId";
            case OPERATIONS_ID:
                return "OperationId";
            case BUDGET_ID:
                return "BudgetingId";
            default:
                return " ";
        }
    };
    const deleteAlertMessages = {
        [RM_MASTER_ID]: MESSAGES.RAW_MATERIAL_DETAIL_DELETE_ALERT,
        [BOP_MASTER_ID]: MESSAGES.BOP_DELETE_ALERT,
        [MACHINE_MASTER_ID]: MESSAGES.MACHINE_DELETE_ALERT,
        [OPERATIONS_ID]: MESSAGES.OPERATION_DELETE_ALERT,
        [BUDGET_ID]: MESSAGES.BUDGET_DELETE_ALERT,
        default: 'Are you sure you want to delete?',
    };
    return (
        <div className={` ${props.isDashboard ? '' : 'min-height100vh'} custom-pagination`}>
            {loader && <LoaderCustom />}
            <Row className="pt-4 blue-before">
                <Col md="8" lg="8" className="search-user-block mb-3">
                    <div className="d-flex justify-content-end bd-highlight w100">
                        <div className="warning-message d-flex align-items-center">
                            {warningMessage && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                            <button disabled={disableFilter} title="Filtered data" type="button" class="user-btn mr5" onClick={() => onSearch()}><div class="filter mr-0"></div></button>
                        </div>

                        <button type="button" className="user-btn mr5" title="Reset Grid" onClick={resetState}>
                            <div className="refresh mr-0"></div>
                        </button>
                        {!props.hidesendBtn && <button
                            title="Send For Approval"
                            class="user-btn approval-btn"
                            onClick={sendForApproval}
                            disabled={approvalList && (approvalList.length === 0 || isFinalApprover || disableApprovalButton) ? true : false}
                        >
                            <div className="send-for-approval mr-0" ></div>
                        </button>}

                    </div>
                </Col>
            </Row>
            <Row>
                <Col>
                    <div className={`ag-grid-react`} >
                        <div className={`ag-grid-wrapper height-width-wrapper min-height-auto ${(approvalList && approvalList?.length <= 0) || noData ? "overlay-contain p-relative" : ""}`}>
                            <div className="ag-grid-header">
                                <input ref={searchRef} type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                            </div>
                            <div className={`ag-theme-material ${props?.isApproval ? "report-grid" : ""} ${loader && "max-loader-height"}`}>
                                {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found approval-listing" />}
                                <AgGridReact
                                    floatingFilter={true}
                                    style={{ height: '100%', width: '100%' }}
                                    defaultColDef={defaultColDef}
                                    domLayout='autoHeight'
                                    rowData={approvalList}
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
                                    suppressRowClickSelection={true}
                                    rowSelection={'multiple'}
                                    //onSelectionChanged={onRowSelect}
                                    onRowSelected={onRowSelect}
                                    onFilterModified={onFloatingFilterChanged}
                                    isRowSelectable={isRowSelectable}
                                    enableBrowserTooltips={true}
                                >


                                    <AgGridColumn width="145" cellClass="has-checkbox" field="ApprovalNumber" cellRenderer='linkableFormatter' headerName="Token No."></AgGridColumn>
                                    {(props?.MasterId === RM_MASTER_ID || props?.MasterId === BOP_MASTER_ID) && <AgGridColumn width="145" field="EntryType" headerName='Entry Type'></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="145" field="CostingHead" headerName='Costing Head' cellRenderer={'combinedCostingHeadRenderer'}   floatingFilterComponentParams={floatingFilterStatusCostingHead} 
                                            floatingFilterComponent="statusFilterCostingHead"></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="145" field="ApprovalProcessId" hide></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="145" field="TechnologyName" headerName={technologyLabel}></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="145" field="RawMaterialName" headerName='Raw Material'></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="145" field="RawMaterialGradeName" headerName='Grade'></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="150" field="RawMaterialSpecificationName" headerName='Spec'></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="140" field="Category" headerName='Category'></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="140" field="MaterialType"></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn field="VendorName" headerName={`${vendorLabel} (Code)`}></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && reactLocalStorage.getObject('CostingTypePermission').cbc && <AgGridColumn field="CustomerName" headerName="Customer (Code)"></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn field="DestinationPlantName" headerName='Plant (Code)'></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="140" field="UnitOfMeasurementName" headerName='UOM'></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="140" field="BasicRatePerUOM" headerName='Basic Rate'></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="140" field="IsScrapUOMApply" headerName="Has different Scrap Rate UOM"></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="140" field="ScrapUnitOfMeasurement" headerName="Scrap Rate UOM"></AgGridColumn>}
                                    {/* {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="140" field="UOMToScrapUOMRatio" headerName="UOM To Scrap UOM Ratio" cellRenderer={"hyphenFormatter"}></AgGridColumn>} */}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="140" field="CalculatedFactor" headerName="Calculated Factor" cellRenderer={"hyphenFormatter"}></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="140" field="ScrapRatePerScrapUOM" headerName='Scrap Rate (In Scrap Rate UOM)'></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="140" field="ScrapRate"></AgGridColumn>}

                                    {IsShowFreightAndShearingCostFields() && (props?.MasterId === RM_MASTER_ID && (<AgGridColumn width="155" field="RMFreightCost" headerName='FreightCost' cellRenderer='freightCostFormatter'></AgGridColumn>))}

                                    {IsShowFreightAndShearingCostFields() && (props?.MasterId === RM_MASTER_ID && (<AgGridColumn width="165" field="RMShearingCost" headerName='Shearing Cost' cellRenderer='shearingCostFormatter'></AgGridColumn>))}

                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="165" field="NetLandedCost" cellRenderer='costFormatter'></AgGridColumn>}

                                    {!props?.isApproval && <AgGridColumn headerClass="justify-content-center" pinned="right" tooltipField="TooltipText" cellClass="text-center" field="DisplayStatus" cellRenderer='statusFormatter' headerName="Status" floatingFilterComponent="statusFilter" floatingFilterComponentParams={floatingFilterStatus} ></AgGridColumn>}



                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="145" field="CostingHead" headerName='Costing Head' cellRenderer={'combinedCostingHeadRenderer'}floatingFilterComponentParams={floatingFilterStatusCostingHead} 
                                            floatingFilterComponent="statusFilterCostingHead"></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="145" field="ApprovalProcessId" hide></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="145" field="BoughtOutPartNumber" headerName={`${showBopLabel()} Part No`}></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="145" field="BoughtOutPartName" headerName={`${showBopLabel()} Part Name`}></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="145" field="BoughtOutPartCategory" headerName={`${showBopLabel()} Category`}></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="150" field="UOM" headerName='UOM'></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="140" field="Specification" cellRenderer={"hyphenFormatter"} headerName='Specification'></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn field="Vendor" headerName={`${vendorLabel} (Code)`}></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && reactLocalStorage.getObject('CostingTypePermission').cbc && <AgGridColumn field="CustomerName" headerName="Customer (Code)"></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="140" field="Plants" headerName='Plant (Code)'></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="140" field="IncoTermDescriptionAndInfoTerm" headerName='Inco Terms'></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && getConfigurationKey().IsShowPaymentTermsFields && <AgGridColumn width="140" field="PaymentTermDescriptionAndPaymentTerm" headerName='Payment Terms'></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="140" field="Currency" headerName="Currency"></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="140" field="NumberOfPieces" headerName='Minimum Order Quantity'></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="140" field="BasicRate" headerName="Basic Rate" cellRenderer='basicRateFormatter'></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="140" field="BasicRateConversion" headerName="Basic Rate Conversion" cellRenderer='basicRateFormatter'></AgGridColumn>}

                                    {initialConfiguration?.IsBasicRateAndCostingConditionVisible && (props?.MasterId === BOP_MASTER_ID || props?.MasterId === RM_MASTER_ID) && <AgGridColumn width="140" field="NetCostWithoutConditionCost" headerName="Basic Price" cellRenderer='basicRateFormatter'></AgGridColumn>}
                                    {initialConfiguration?.IsBasicRateAndCostingConditionVisible && (props?.MasterId === BOP_MASTER_ID || props?.MasterId === RM_MASTER_ID) && <AgGridColumn width="140" field="NetCostWithoutConditionCostConversion" headerName="Basic Price (Currency)" cellRenderer='basicRateFormatter'></AgGridColumn>}
                                    {initialConfiguration?.IsBasicRateAndCostingConditionVisible && (props?.MasterId === BOP_MASTER_ID || props?.MasterId === RM_MASTER_ID) && <AgGridColumn width="140" field="NetConditionCost" headerName="Net Condition Cost" cellRenderer='basicRateFormatter'></AgGridColumn>}
                                    {initialConfiguration?.IsBasicRateAndCostingConditionVisible && (props?.MasterId === BOP_MASTER_ID || props?.MasterId === RM_MASTER_ID) && <AgGridColumn width="140" field="NetConditionCostConversion" headerName="Net Condition Cost (Currency)" cellRenderer='basicRateFormatter'></AgGridColumn>}

                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="140" field="NetLandedCost" headerName="Net Cost (Currency)" cellRenderer='netCostFormatter'></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="140" field="NetLandedCostConversion" headerName={netCostHeader} cellRenderer='netCostFormatter'></AgGridColumn>}

                                    {/* {props?.MasterId === BOP_MASTER_ID && !props?.isApproval && <AgGridColumn headerClass="justify-content-center" pinned="right" cellClass="text-center" field="DisplayStatus" cellRenderer='statusFormatter' headerName="Status" ></AgGridColumn>} */}
                                    {props?.MasterId === MACHINE_MASTER_ID && <AgGridColumn width="145" field="CostingHead" headerName='Costing Head' cellRenderer={'combinedCostingHeadRenderer'}floatingFilterComponentParams={floatingFilterStatusCostingHead} 
                                            floatingFilterComponent="statusFilterCostingHead"></AgGridColumn>}
                                    {props?.MasterId === MACHINE_MASTER_ID && <AgGridColumn width="145" field="ApprovalProcessId" hide></AgGridColumn>}
                                    {props?.MasterId === MACHINE_MASTER_ID && <AgGridColumn width="145" field="Technology" headerName={technologyLabel}></AgGridColumn>}
                                    {props?.MasterId === MACHINE_MASTER_ID && <AgGridColumn width="145" field="VendorName" headerName={`${vendorLabel} (Code)`}></AgGridColumn>}
                                    {props?.MasterId === MACHINE_MASTER_ID && reactLocalStorage.getObject('CostingTypePermission').cbc && <AgGridColumn field="CustomerName" headerName="Customer (Code)"></AgGridColumn>}
                                    {props?.MasterId === MACHINE_MASTER_ID && <AgGridColumn width="145" field="Plants" headerName='Plant (Code)'></AgGridColumn>}
                                    {props?.MasterId === MACHINE_MASTER_ID && <AgGridColumn width="150" field="MachineNumber" headerName='Machine Number'></AgGridColumn>}
                                    {props?.MasterId === MACHINE_MASTER_ID && <AgGridColumn width="140" field="MachineTypeName" headerName='Machine Type'></AgGridColumn>}
                                    {props?.MasterId === MACHINE_MASTER_ID && <AgGridColumn width="140" field="MachineTonnage" headerName='Machine Tonnage' cellRenderer={"hyphenFormatter"}></AgGridColumn>}
                                    {props?.MasterId === MACHINE_MASTER_ID && <AgGridColumn field="ProcessName" headerName='Process Name'></AgGridColumn>}
                                    {props?.MasterId === MACHINE_MASTER_ID && <AgGridColumn field="BasicRate" headerName="Machine Rate"></AgGridColumn>}
                                    {/* {props?.MasterId === MACHINE_MASTER_ID && !props?.isApproval && <AgGridColumn headerClass="justify-content-center" pinned="right" cellClass="text-center" field="DisplayStatus" cellRenderer='statusFormatter' headerName="Status" ></AgGridColumn>} */}

                                    {props?.MasterId === OPERATIONS_ID && <AgGridColumn width="145" field="CostingHead" headerName='Costing Head' cellRenderer={'combinedCostingHeadRenderer'}floatingFilterComponentParams={floatingFilterStatusCostingHead} 
                                            floatingFilterComponent="statusFilterCostingHead"></AgGridColumn>}
                                    {props?.MasterId === OPERATIONS_ID && <AgGridColumn width="145" field="ApprovalProcessId" hide></AgGridColumn>}
                                    {props?.MasterId === OPERATIONS_ID && <AgGridColumn width="145" field="TechnologyName" tooltipField='Technology' headerName={technologyLabel}></AgGridColumn>}
                                    {props?.MasterId === OPERATIONS_ID && <AgGridColumn width="145" field="OperationName" headerName='Operation Name'></AgGridColumn>}
                                    {props?.MasterId === OPERATIONS_ID && <AgGridColumn width="145" field="OperationCode" headerName='Operation Code'></AgGridColumn>}
                                    {props?.MasterId === OPERATIONS_ID && <AgGridColumn width="180" field="VendorName" headerName={`${vendorLabel} (Code)`}></AgGridColumn>}
                                    {props?.MasterId === OPERATIONS_ID && reactLocalStorage.getObject('CostingTypePermission').cbc && <AgGridColumn field="CustomerName" headerName="Customer (Code)"></AgGridColumn>}
                                    {props?.MasterId === OPERATIONS_ID && <AgGridColumn width="150" field="Plants" headerName='Plant (Code)'></AgGridColumn>}
                                    {props?.MasterId === OPERATIONS_ID && <AgGridColumn width="140" field="UOM" headerName='UOM'></AgGridColumn>}
                                    {props?.MasterId === OPERATIONS_ID && <AgGridColumn field="BasicRate" headerName='Rate'></AgGridColumn>}

                                    {/* {props?.MasterId === OPERATIONS_ID && !props?.isApproval && <AgGridColumn headerClass="justify-content-center" pinned="right" cellClass="text-center" field="DisplayStatus" cellRenderer='statusFormatter' headerName="Status" ></AgGridColumn>} */}
                                    {props?.MasterId === BUDGET_ID && <AgGridColumn width="145" field="CostingHead" headerName='Costing Head' cellRenderer={'combinedCostingHeadRenderer'}floatingFilterComponentParams={floatingFilterStatusCostingHead} 
                                            floatingFilterComponent="statusFilterCostingHead"></AgGridColumn>}
                                    {props?.MasterId === BUDGET_ID && <AgGridColumn width="145" field="FinancialYear" headerName='Financial Year'></AgGridColumn>}
                                    {props?.MasterId === BUDGET_ID && <AgGridColumn width="145" field="PartNumber" headerName='Part No.'></AgGridColumn>}
                                    {props?.MasterId === BUDGET_ID && <AgGridColumn width="145" field="PlantName" headerName='Plant (Code)'></AgGridColumn>}
                                    {props?.MasterId === BUDGET_ID && <AgGridColumn width="145" field="VendorName" headerName={`${vendorLabel} (Code)`}></AgGridColumn>}
                                    {props?.MasterId === BUDGET_ID && <AgGridColumn width="160" field="CustomerName" headerName='Customer (Code)'></AgGridColumn>}
                                    {props?.MasterId === BUDGET_ID && <AgGridColumn field="BudgetedPoPrice" headerName="Budgeted Cost" ></AgGridColumn>}
                                    {props?.MasterId === BUDGET_ID && <AgGridColumn width="145" field="NetPoPrice" headerName="Net Cost"></AgGridColumn>}
                                    {/* {props?.OnboardingApprovalId === ONBOARDINGID && <AgGridColumn width="160" cellClass="has-checkbox" field="ApprovalNumber" cellRenderer="linkableFormatter" headerName="Token No."></AgGridColumn>} */}
                                    {props?.OnboardingApprovalId === ONBOARDINGID && <AgGridColumn width="160" field="ApprovalType" headerName='Type'></AgGridColumn>}
                                    {props?.OnboardingApprovalId === ONBOARDINGID && <AgGridColumn width="160" field="PlantName" headerName='Plant (Code)'></AgGridColumn>}
                                    {props?.OnboardingApprovalId === ONBOARDINGID && <AgGridColumn width="160" field="VendorName" headerName={`${vendorLabel} (Code)`} ></AgGridColumn>}
                                    {props?.OnboardingApprovalId === ONBOARDINGID && <AgGridColumn width="160" field="DeviationDuration" headerName='Deviation Duration' ></AgGridColumn>}
                                    {/* {props?.OnboardingApprovalId === ONBOARDINGID && <AgGridColumn width="145" field="Department" headerName={`${handleDepartmentHeader()} (Code)`}></AgGridColumn>} */}
                                    {getConfigurationKey().IsBoughtOutPartCostingConfigured && props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="150" field="IsBreakupBoughtOutPart" cellRenderer='breakupFormatter' headerName={`Breakup ${showBopLabel()} `}></AgGridColumn>}
                                    {getConfigurationKey().IsBoughtOutPartCostingConfigured && props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="150" field="TechnologyName" cellRenderer='technologyFormatter' headerName={technologyLabel}></AgGridColumn>}
                                    <AgGridColumn width="150" field="RequestedBy" cellRenderer='createdOnFormatter' headerName="Initiated By"></AgGridColumn>
                                    {props?.MasterId !== 0 && <AgGridColumn width="150" field="CreatedByName" cellRenderer='createdOnFormatter' headerName="Created By"></AgGridColumn>}
                                    <AgGridColumn width="200" field="LastApprovedBy" cellRenderer='requestedOnFormatter' headerName="Last Approved/Rejected By"></AgGridColumn>
                                    {!props?.MasterId === BUDGET_ID && <AgGridColumn cell width="190" field="EffectiveDate" cellRenderer='effectiveDateRenderer' filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>}
                                    {props?.OnboardingApprovalId !== ONBOARDINGID && <AgGridColumn field={getMasterField(props?.MasterId)} width={170} pinned="right" cellClass="ag-grid-action-container" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer='actionRenderer'></AgGridColumn>}
                                </AgGridReact>
                                <div className='button-wrapper'>
                                    {!loader &&
                                        <PaginationWrappers gridApi={gridApi} totalRecordCount={totalRecordCount} getDataList={getTableData} floatingFilterData={floatingFilterData} module="Approval" isApproval={props?.isApproval} />}
                                    {<PaginationControls totalRecordCount={totalRecordCount} getDataList={getTableData} floatingFilterData={floatingFilterData} module="Approval" />}
                                </div>
                            </div >
                        </div >
                        <div className="text-right pb-3">
                            <WarningMessage message="It may take up to 5 minutes for the status to be updated." />
                        </div>
                    </div >
                </Col >
            </Row >
            {
                showApprovalSumary &&
                <SummaryDrawer
                    isOpen={showApprovalSumary}
                    closeDrawer={closeDrawer}
                    approvalData={approvalData}
                    anchor={'bottom'}
                    masterId={props?.MasterId}
                    OnboardingApprovalId={props?.OnboardingApprovalId}
                    selectedRowData={selectedRowData[0]?.CostingHead}
                />
            }
            {
                props?.OnboardingApprovalId !== ONBOARDINGID && approvalDrawer &&
                <MasterSendForApproval
                    isOpen={approvalDrawer}
                    closeDrawer={closeApprovalDrawer}
                    isEditFlag={false}
                    masterId={props?.MasterId}
                    type={'Sender'}
                    anchor={"right"}
                    isBulkUpload={true}
                    masterPlantId={selectedRowData[0]?.MasterApprovalPlantId}
                    approvalData={selectedRowData}
                    levelDetails={levelDetails}
                    costingTypeId={selectedRowData[0]?.CostingTypeId}
                    divisionId={selectedRowData[0]?.DivisionId}
                    approvalListing={true}
                />
            }
            {
                props?.OnboardingApprovalId === ONBOARDINGID && approvalDrawer &&
                <SendForApproval
                    isOpen={approvalDrawer}
                    closeDrawer={closeApprovalDrawer}
                    isEditFlag={false}
                    masterId={0}
                    type={'Sender'}
                    anchor={"right"}
                    isBulkUpload={true}
                    isApprovalisting={false}
                    deviationData={selectedRowData[0]}
                    isClassification={selectedRowData[0]?.ApprovalTypeId === CLASSIFICATIONAPPROVALTYPEID ? true : false}
                    isLpsRating={selectedRowData[0]?.ApprovalTypeId === LPSAPPROVALTYPEID ? true : false} // 
                />
            }

            {
                showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={deleteAlertMessages[props?.MasterId] || deleteAlertMessages.default} />
            }
        </div >

    );
}

export default CommonApproval;