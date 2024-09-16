import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { handleDepartmentHeader, loggedInUserId, userDetails } from '../../../helper/auth'
import NoContentFound from '../../common/NoContentFound'
import { defaultPageSize, EMPTY_DATA, LINKED } from '../../../config/constants'
import DayTime from '../../common/DayTimeWrapper'
import { DRAFT, EMPTY_GUID, APPROVED, PUSHED, ERROR, WAITING_FOR_APPROVAL, REJECTED, POUPDATED } from '../../../config/constants'
import Toaster from '../../common/Toaster'
import { getSimulationApprovalList, setMasterForSimulation, deleteDraftSimulation, setSelectedRowForPagination, setTechnologyForSimulation, setIsMasterAssociatedWithCosting } from '../actions/Simulation'
import { Redirect, } from 'react-router-dom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import LoaderCustom from '../../common/LoaderCustom'
import { MESSAGES } from '../../../config/message'
import { allEqual, checkForNull, getConfigurationKey, removeSpaces, searchNocontentFilter, setLoremIpsum } from '../../../helper'
import SimulationApproveReject from '../../costing/components/approval/SimulationApproveReject'
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import WarningMessage from '../../common/WarningMessage'
import ScrollToTop from '../../common/ScrollToTop'
import { PaginationWrapper } from '../../common/commonPagination'
import { checkFinalUser, getReleaseStrategyApprovalDetails } from '../../costing/actions/Costing'
import SingleDropdownFloationFilter from '../../masters/material-master/SingleDropdownFloationFilter'
import { agGridStatus, isResetClick, getGridHeight, dashboardTabLock } from '../../../actions/Common'
import { costingTypeIdToApprovalTypeIdFunction } from '../../common/CommonFunctions'
import { Steps } from './TourMessages'
import TourWrapper from '../../common/Tour/TourWrapper'
import { useTranslation } from 'react-i18next';
import _ from 'lodash'
const gridOptions = {};
function SimulationApprovalListing(props) {
    const { isDashboard } = props
    const [approvalData, setApprovalData] = useState('')
    const [selectedRowData, setSelectedRowData] = useState([]);
    const [approveDrawer, setApproveDrawer] = useState(false)
    const [showApprovalSumary, setShowApprovalSummary] = useState(false)
    const [redirectCostingSimulation, setRedirectCostingSimulation] = useState(false)
    const [statusForLinkedToken, setStatusForLinkedToken] = useState(false)
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [isPendingForApproval, setIsPendingForApproval] = useState(false);
    const [showFinalLevelButtons, setShowFinalLevelButton] = useState(false)
    const [isSuperAdmin, setIsSuperAdmin] = useState(false)
    const userData = userDetails()
    const { initialConfiguration } = useSelector(state => state.auth)
    const dispatch = useDispatch()
    const { simualtionApprovalList, simualtionApprovalListDraft } = useSelector(state => state.simulation)

    const [deletedId, setDeletedId] = useState('')
    const [showPopup, setShowPopup] = useState(false)
    const [simulationDetail, setSimulationDetail] = useState([])
    const [isLoader, setIsLoader] = useState(false)
    const isSmApprovalListing = props.isSmApprovalListing;
    const { t } = useTranslation("Simulation")
    const [showExtraData, setShowExtraData] = useState(false)
    const [render, setRender] = useState(false)

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
    const [pageSize, setPageSize] = useState({ pageSize10: true, pageSize50: false, pageSize100: false })
    const [floatingFilterData, setFloatingFilterData] = useState({ ApprovalNumber: "", CostingNumber: "", PartNumber: "", PartName: "", VendorName: "", PlantName: "", TechnologyName: "", NetPOPrice: "", OldPOPrice: "", Reason: "", EffectiveDate: "", CreatedBy: "", CreatedOn: "", RequestedBy: "", RequestedOn: "" })
    const [noData, setNoData] = useState(false)
    const statusColumnData = useSelector((state) => state.comman.statusColumnData);
    const [releaseStrategyDetails, setReleaseStrategyDetails] = useState({})
    const [simulationId, setSimulationId] = useState(null);

    const { handleSubmit } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    var floatingFilterStatus = {
        maxValue: 1,
        suppressFilterButton: true,
        component: "simulationApproval",
        location: "simulation"
    }

    var filterParams = {
        comparator: function (filterLocalDateAtMidnight, cellValue) {
            var dateAsString = cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
            var newDate = filterLocalDateAtMidnight != null ? DayTime(filterLocalDateAtMidnight).format('DD/MM/YYYY') : '';
            setFloatingFilterData({ ...floatingFilterData, SimulatedOn: newDate })
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

    var filterParamsSecond = {
        comparator: function (filterLocalDateAtMidnight, cellValue) {
            var dateAsString = cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
            var newDate = filterLocalDateAtMidnight != null ? DayTime(filterLocalDateAtMidnight).format('DD/MM/YYYY') : '';
            setFloatingFilterData({ ...floatingFilterData, RequestedOn: newDate })
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
        setIsSuperAdmin(userDetails()?.Role === "SuperAdmin")
    }, [])

    useEffect(() => {
        if (props.activeTab === '2' || isDashboard) {
            resetState()
        }
        dispatch(isResetClick(false))
        dispatch(agGridStatus("", ""))
    }, [props.activeTab])

    useEffect(() => {
        setTimeout(() => {
            if (statusColumnData && statusColumnData.data) {
                setDisableFilter(false)
                setWarningMessage(true)
                setFloatingFilterData(prevState => ({ ...prevState, DisplayStatus: removeSpaces(statusColumnData.data) }))
            }
        }, 200);
    }, [statusColumnData])


    useEffect(() => {
        if ((isDashboard ? simualtionApprovalList : simualtionApprovalListDraft)?.length > 0) {

            let array = isDashboard ? simualtionApprovalList : simualtionApprovalListDraft
            setTotalRecordCount(checkForNull(array[0].TotalRecordCount))
        }
        else {
            setNoData(false)
        }
        dispatch(getGridHeight({ value: isDashboard ? simualtionApprovalList?.length : simualtionApprovalListDraft?.length, component: "simulationApproval" }))
    }, [(isDashboard ? simualtionApprovalList : simualtionApprovalListDraft)])



    /**
     * @method getTableData
     * @description getting approval list table
     */
    const getTableData = (skip = 0, take = 10, isPagination = true, dataObj, partNo = EMPTY_GUID, createdBy = EMPTY_GUID, requestedBy = EMPTY_GUID, status = 0,) => {

        if (isDashboard) {
            dataObj.DisplayStatus = props.status
        }

        let filterData = {
            logged_in_user_id: loggedInUserId(),
            logged_in_user_level_id: userDetails().LoggedInSimulationLevelId,
            token_number: null,
            simulated_by: createdBy,
            requestedBy: requestedBy,
            status: status,
            isDashboard: isDashboard ?? false
        }
        setIsLoader(true)
        isDashboard && dispatch(dashboardTabLock(true))
        let obj = { ...dataObj }
        dispatch(getSimulationApprovalList(filterData, skip, take, isPagination, dataObj, (res) => {
            dispatch(dashboardTabLock(false))
            if (res?.data?.DataList?.length === 0) {
                setTotalRecordCount(0)
                setPageNo(0)
                setIsLoader(false)
                dispatch(dashboardTabLock(false))
            }
            if (res && res.status === 204) {
                setTotalRecordCount(0)
                setPageNo(0)
                setIsLoader(false)
            }
            if (res?.data?.Result) {

                setIsLoader(false)
                dispatch(dashboardTabLock(false))
                let isReset = true
                if (res) {
                    setTimeout(() => {

                        for (var prop in obj) {
                            if (props?.status) {   // CONDITION WHEN RENDERED FROM DASHBOARD
                                if (prop !== 'DisplayStatus' && obj[prop] !== "") {
                                    isReset = false
                                }
                            }
                            else {
                                if (obj[prop] !== "") {
                                    isReset = false
                                }
                            }
                        }
                        // Sets the filter model via the grid API
                        // 
                        isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(filterModel))

                        setTimeout(() => {
                            dispatch(isResetClick(false))
                            setWarningMessage(false)
                            setFloatingFilterData(obj)
                        }, 23);
                    }, 500);
                    setTimeout(() => {
                        setIsFilterButtonClicked(false)
                    }, 600);
                }
            }
        }))
    }


    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            if ((isDashboard ? simualtionApprovalList : simualtionApprovalListDraft)?.length !== 0) setNoData(searchNocontentFilter(value, noData))
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

                    for (var prop in floatingFilterData) {
                        if (prop !== "DepartmentCode") {
                            floatingFilterData[prop] = ""
                        }
                    }
                    setFloatingFilterData(floatingFilterData)
                    setWarningMessage(false)
                }
            }

        } else {
            if (value.column.colId === "SimulatedOn" || value.column.colId === "RequestedOn") {
                return false
            }
            setFloatingFilterData({ ...floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter })
        }
    }

    //**  HANDLE TOGGLE EXTRA DATA */
    const toggleExtraData = (showTour) => {

        setRender(true)
        setTimeout(() => {
            setShowExtraData(showTour)
            setRender(false)
        }, 100);


    }
    const onSearch = () => {

        setWarningMessage(false)
        setIsLoader(true)
        setIsFilterButtonClicked(true)
        setPageNo(1)
        setCurrentRowIndex(0)
        gridOptions?.columnApi?.resetColumnState();

        getTableData(0, globalTake, true, floatingFilterData)
    }

    const resetState = () => {
        dispatch(agGridStatus("", ""))
        dispatch(isResetClick(true))
        setIsFilterButtonClicked(false)
        setIsLoader(true)
        gridOptions?.columnApi?.resetColumnState(null);
        gridOptions?.api?.setFilterModel(null);

        for (var prop in floatingFilterData) {

            if (prop !== "DepartmentCode") {
                floatingFilterData[prop] = ""
            }
        }
        setFloatingFilterData(floatingFilterData)
        setWarningMessage(false)
        setPageNo(1)
        setCurrentRowIndex(0)
        dispatch(setSelectedRowForPagination([]))
        getTableData(0, 10, true, floatingFilterData)

        setGlobalTake(10)
        setPageSize(prevState => ({ ...prevState, pageSize10: true, pageSize50: false, pageSize100: false }))
    }


    const onBtPrevious = () => {
        if (currentRowIndex >= 10) {
            setPageNo(pageNo - 1)
            setPageNoNew(pageNo - 1)
            const previousNo = currentRowIndex - 10;
            getTableData(previousNo, globalTake, true, floatingFilterData)
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
            getTableData(nextNo, globalTake, true, floatingFilterData)
            setCurrentRowIndex(nextNo)
        }
    };


    const onPageSizeChanged = (newPageSize) => {
        if (Number(newPageSize) === 10) {
            getTableData(currentRowIndex, 10, true, floatingFilterData)
            setPageSize(prevState => ({ ...prevState, pageSize10: true, pageSize50: false, pageSize100: false }))
            setGlobalTake(10)
            setPageNo(pageNoNew)
        }
        else if (Number(newPageSize) === 50) {
            setPageSize(prevState => ({ ...prevState, pageSize50: true, pageSize10: false, pageSize100: false }))
            setGlobalTake(50)

            if (pageNo >= Math.ceil(totalRecordCount / 50)) {
                setPageNo(Math.ceil(totalRecordCount / 50))
                getTableData(0, 50, true, floatingFilterData)
            } else {
                getTableData(currentRowIndex, 50, true, floatingFilterData)
            }

        }
        else if (Number(newPageSize) === 100) {
            setPageSize(prevState => ({ ...prevState, pageSize100: true, pageSize10: false, pageSize50: false }))
            setGlobalTake(100)
            if (pageNo >= Math.ceil(totalRecordCount / 100)) {
                setPageNo(Math.ceil(totalRecordCount / 100))
                getTableData(0, 100, true, floatingFilterData)
            } else {
                getTableData(currentRowIndex, 100, true, floatingFilterData)
            }
        }
        gridApi.paginationSetPageSize(Number(newPageSize));

        if (isDashboard) {
            props.isPageNoChange('simulation')
        }
    };

    /**
     * @method linkableFormatter
     * @description Renders Name link
     */
    const linkableFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <Fragment>
                <div
                    id={`simulation_approval_listing_${props?.rowIndex}`}
                    onClick={() => viewDetails(rowData)}
                    className={'link'}
                >
                    {cellValue}
                </div>
            </Fragment>
        )
    }

    /**
    * @method hyphenFormatter
    */
    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }

    const requestedOnFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? DayTime(cell).format('DD/MM/YYYY') : '-';
    }
    const reasonFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return !cell ? '-' : cell;
    }

    const statusFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;

        return <div className={cell} >{row.DisplayStatus}</div>
    }

    const buttonFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        let isDeleteButton = false
        if (showExtraData && props.rowIndex === 0) {
            isDeleteButton = true
        } else if (row.Status === DRAFT) {
            isDeleteButton = true
        }
        return (
            <>
                <button title='View' id="Simulation_View" className="View" type={'button'} onClick={() => viewDetails(row)} />
                {isDeleteButton && <button title='Delete' id="Simulation_Delete" className="Delete ml-1" type={'button'} onClick={() => deleteItem(row)} />}
            </>
        )
    }

    const viewDetails = (rowObj) => {
        dispatch(setIsMasterAssociatedWithCosting(!rowObj?.IsSimulationWithOutCosting))
        setApprovalData({ simulationId: rowObj?.SimulationId, approvalProcessId: rowObj?.ApprovalProcessId, approvalNumber: rowObj?.ApprovalNumber, SimulationTechnologyHead: rowObj?.SimulationTechnologyHead, SimulationTechnologyId: rowObj?.SimulationTechnologyId, SimulationHeadId: rowObj?.SimulationHeadId, DepartmentId: rowObj?.DepartmentId })
        dispatch(setMasterForSimulation({ label: rowObj.SimulationTechnologyHead, value: rowObj.SimulationTechnologyId }))
        // dispatch(setTechnologyForSimulation({ label: rowObj.SimulationTechnologyHead, value: rowObj.SimulationTechnologyId }))                //RE
        if (rowObj?.Status === 'Draft' || rowObj.SimulationType === 'Provisional' || rowObj?.Status === 'Linked') {
            setStatusForLinkedToken(rowObj?.Status === 'Linked')
            setRedirectCostingSimulation(true)
        } else {
            setShowApprovalSummary(true)
        }
    }

    const deleteItem = (rowData) => {
        let data = {
            loggedInUser: loggedInUserId(),
            simulationId: rowData.SimulationId
        }

        setShowPopup(true)
        setDeletedId(data)

    }
    const onPopupConfirm = () => {
        dispatch(deleteDraftSimulation(deletedId, res => {
            if (res.data.Result) {
                Toaster.success("Simulation token deleted successfully.")
                getTableData(0, 10, true, floatingFilterData)
            }
        }))
        setShowPopup(false)

    }
    const closePopUp = () => {
        setShowPopup(false)
    }
    const requestedByFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell !== null ? cell : '-'
    }

    const conditionFormatter = (props) => {
        const status = props.node.data.Status;

        if (status === DRAFT) {
            return `Y`;
        }
        else if (status === APPROVED) {
            return `R`
        } else {
            return `U`
        }

    }

    const onRowSelect = (row, isSelected, e) => {

        let arr = []
        let tempArrDepartmentId = []
        let tempArrIsFinalLevelButtonShow = []
        let tempArrIsPushedButtonShow = []
        var selectedRows = gridApi.getSelectedRows();
        let tempArrReason = []
        let tempArrTechnology = []
        let tempArrSimulationTechnologyHead = []
        let costingHeadArray = []
        let approvalTypeArray = []
        let plantIds = []

        selectedRows && selectedRows.map(item => {
            arr.push(item?.DisplayStatus)
            tempArrDepartmentId.push(item?.DepartmentId)
            tempArrIsFinalLevelButtonShow.push(item?.IsFinalLevelButtonShow)
            tempArrIsPushedButtonShow.push(item?.IsPushedButtonShow)
            tempArrReason.push(item?.ReasonId)
            tempArrTechnology.push(item?.TechnologyName)
            tempArrSimulationTechnologyHead.push(item?.SimulationTechnologyHead)
            costingHeadArray.push(item?.CostingHead)
            approvalTypeArray.push(item?.ApprovalTypeId)
            plantIds.push(item.PlantId)
            return null
        })
        selectedRows && dispatch(setMasterForSimulation({ label: selectedRows[0]?.SimulationTechnologyHead, value: selectedRows[0]?.SimulationTechnologyId }))
        if (!allEqual(plantIds) && initialConfiguration.IsMultipleUserAllowForApproval) {
            Toaster.warning('Plant should be same for sending multiple costing for approval')
            gridApi.deselectAll()
        }
        if (!allEqual(arr)) {
            Toaster.warning('Status should be same for sending multiple costing for approval')
            gridApi.deselectAll()
        } else if (!allEqual(tempArrDepartmentId)) {
            Toaster.warning(`${handleDepartmentHeader()} should be same for sending multiple costing for approval`)
            gridApi.deselectAll()
        } else if (!allEqual(tempArrIsFinalLevelButtonShow)) {
            Toaster.warning('Level should be same for sending multiple costing for approval')
            gridApi.deselectAll()
        }
        else if (!allEqual(costingHeadArray)) {
            Toaster.warning('Costing Head should be same for sending multiple costing for approval')
            gridApi.deselectAll()
        }
        else if (!allEqual(approvalTypeArray)) {
            Toaster.warning('Approval Type should be same for sending multiple costing for approval')
            gridApi.deselectAll()
        }
        // ********** IF WE DO MULTI SELECT FOR PUSH THENUNCOMMENT THIS ONLY ************
        // else if (!allEqual(tempArrIsPushedButtonShow)) {
        //     Toaster.warning('Please choose costing for same push')
        //     gridApi.deselectAll()
        // }
        // ********** UNCOMMENT THIS IN MINDA ONLY ********** */
        // else if (!allEqual(tempArrReason)) {
        //     Toaster.warning('Please choose costing which have same reason')
        //     gridApi.deselectAll()
        // }
        else if (!allEqual(tempArrSimulationTechnologyHead)) {
            Toaster.warning('Master should be same for sending multiple costing for approval')
            gridApi.deselectAll()
        } else if (!allEqual(tempArrTechnology)) {
            Toaster.warning('Technology should be same for sending multiple costing for approval')
            gridApi.deselectAll()
        }

        setIsPendingForApproval(arr.includes("Pending For Approval") ? true : false)

        if (JSON.stringify(selectedRows) === JSON.stringify('')) return false
        setSelectedRowData(selectedRows)
        // if (isSelected) {
        //     let tempArr = [...selectedRowData, row]
        //     setSelectedRowData(tempArr)
        // } else {
        //     const CostingId = row.CostingId;
        //     let tempArr = selectedRowData && selectedRowData.filter(el => el.CostingId !== CostingId)
        //     setSelectedRowData(tempArr)
        // }
    }
    const isRowSelectable = (rowNode) => {
        if (rowNode.data.Status === APPROVED || rowNode.data.Status === REJECTED || rowNode.data.Status === WAITING_FOR_APPROVAL || rowNode.data.Status === PUSHED || rowNode.data.Status === POUPDATED || rowNode.data.Status === ERROR || rowNode.data.Status === LINKED) {
            return false;
        } else {
            return true
        }
        // return rowNode.data ? !selectedIds.includes(rowNode.data.OperationId) : false;
    }

    const sendForApproval = () => {
        if (selectedRowData.length === 0) {
            Toaster.warning('Please select atleast one approval to send for approval.')
            return false
        }
        //MINDA
        if (getConfigurationKey().IsReleaseStrategyConfigured && selectedRowData && selectedRowData[0]?.Status === DRAFT) {
            let data = []
            selectedRowData && selectedRowData?.map(item => {
                let obj = {}
                obj.SimulationId = item?.SimulationId
                data.push(obj)
            })
            let requestObject = {
                "RequestFor": "SIMULATION",
                "TechnologyId": selectedRowData[0]?.SimulationTechnologyId,
                "LoggedInUserId": loggedInUserId(),
                "ReleaseStrategyApprovalDetails": _.uniqBy(data, 'SimulationId')
            }
            dispatch(getReleaseStrategyApprovalDetails(requestObject, (res) => {
                setReleaseStrategyDetails(res?.data?.Data)
                if (res?.data?.Data?.IsUserInApprovalFlow && !res?.data?.Data?.IsFinalApprover) {
                    setApproveDrawer(res.data.Data.IsFinalApprover ? false : true)
                } else if (res?.data?.Data?.IsPFSOrBudgetingDetailsExist === true && res?.data?.Data?.IsUserInApprovalFlow === false) {
                    Toaster.warning("This user is not in the approval cycle")
                    return false
                } else if (res?.data?.Data?.IsPFSOrBudgetingDetailsExist === false) {
                    let obj = {
                        DepartmentId: res?.data?.Data?.DepartmentId ? res?.data?.Data?.DepartmentId : selectedRowData[0].DepartmentId ?? EMPTY_GUID,
                        UserId: loggedInUserId(),
                        TechnologyId: approvalData?.SimulationTechnologyId ? approvalData?.SimulationTechnologyId : selectedRowData[0].SimulationTechnologyId,
                        Mode: 'simulation',
                        approvalTypeId: costingTypeIdToApprovalTypeIdFunction(res?.data?.Data?.ApprovalTypeId ? res?.data?.Data?.ApprovalTypeId : selectedRowData[0].ApprovalTypeId),
                        plantId: selectedRowData[0].PlantId ?? EMPTY_GUID,
                        divisionId: selectedRowData[0].DivisionId ?? EMPTY_GUID
                    }
                    dispatch(checkFinalUser(obj, res => {
                        if (res && res.data && res.data.Result) {
                            if (res.data?.Data?.IsUserInApprovalFlow === false) {
                                setApproveDrawer(res.data.Data.IsFinalApprover ? false : true)
                            } else {
                                if (res.data.Data.IsFinalApprover) {
                                    setApproveDrawer(true)
                                    setShowFinalLevelButton(res?.data?.Data?.IsFinalApprover)
                                }
                            }
                        }
                    }))
                } else if (res?.data?.Data?.IsUserInApprovalFlow && res?.data?.Data?.IsFinalApprover) {
                    setShowFinalLevelButton(res?.data?.Data?.IsFinalApprover)
                    setApproveDrawer(true)
                } else if (res?.data?.Result === false) {
                    Toaster.warning(res?.data?.Message ? res?.data?.Message : 'This user is not in approval cycle')
                    return false
                } else {
                }
            }))
        } else {
            let obj = {
                DepartmentId: selectedRowData[0]?.Status === DRAFT ? EMPTY_GUID : selectedRowData[0]?.DepartmentId,
                UserId: loggedInUserId(),
                TechnologyId: selectedRowData[0]?.SimulationTechnologyId,
                Mode: 'simulation',
                approvalTypeId: costingTypeIdToApprovalTypeIdFunction(selectedRowData[0]?.SimulationHeadId),
                plantId: selectedRowData[0].PlantId,
                divisionId: selectedRowData[0].DivisionId ?? null
            }
            setSimulationDetail({ DepartmentId: selectedRowData[0]?.DepartmentId, TokenNo: selectedRowData[0]?.SimulationTokenNumber, Status: selectedRowData[0]?.SimulationStatus, SimulationId: selectedRowData[0]?.SimulationId, SimulationAppliedOn: selectedRowData[0]?.SimulationAppliedOn, EffectiveDate: selectedRowData[0]?.EffectiveDate, IsExchangeRateSimulation: selectedRowData[0]?.IsExchangeRateSimulation })
            dispatch(setMasterForSimulation({ label: selectedRowData[0]?.SimulationTechnologyHead, value: selectedRowData[0]?.SimulationTechnologyId }))

            dispatch(checkFinalUser(obj, res => {
                if (res && res.data && res.data.Result) {
                    if (selectedRowData[0]?.Status === DRAFT) {
                        if (res.data.Data.IsUserInApprovalFlow === false) {
                            Toaster.warning("User does not have permission to send simulation for approval.")
                            gridApi.deselectAll()
                        } if (res.data.Data.IsFinalApprover) {
                            Toaster.warning("Final level approver can not send draft token for approval")
                            gridApi.deselectAll()
                        } if (res.data.Data.IsUserInApprovalFlow && !res.data.Data.IsFinalApprover) {
                            setApproveDrawer(true)
                        }
                    }
                    else {
                        setShowFinalLevelButton(res.data.Data.IsFinalApprover)
                        setApproveDrawer(true)
                    }
                }
            }))
        }
    }

    const closeDrawer = (e = '', type) => {
        gridApi.deselectAll()
        setApproveDrawer(false)
        if (type !== 'cancel') {
            getTableData(0, 10, true, floatingFilterData)
        }
        setSelectedRowData([])
    }

    if (redirectCostingSimulation === true) {
        // HERE FIRST IT WILL GO TO SIMULATION.JS COMPONENT FROM THERE IT WILL GO TO COSTING SIMULATION OR OTHER COSTINGSIMULATION.JS PAGE
        return <Redirect
            to={{
                pathname: "/simulation",
                state: {
                    isFromApprovalListing: true,
                    approvalProcessId: approvalData.approvalProcessId,
                    master: approvalData.SimulationTechnologyId,
                    statusForLinkedToken: statusForLinkedToken,
                    approvalTypeId: costingTypeIdToApprovalTypeIdFunction(approvalData.SimulationHeadId),
                    DepartmentId: approvalData.DepartmentId,
                    preserveData: true
                }

            }}
        />
    }

    if (showApprovalSumary === true) {
        return <Redirect
            to={{
                pathname: "/simulation-approval-summary",
                state: {
                    approvalNumber: approvalData.approvalNumber,
                    approvalId: approvalData.approvalProcessId,
                    SimulationTechnologyId: approvalData.SimulationTechnologyId,
                    simulationId: approvalData.simulationId
                }
            }}
        />
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
        headerCheckboxSelection: isFirstColumn,
        checkboxSelection: isFirstColumn
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
        setTimeout(() => {
            const checkBoxInstance = document.querySelectorAll('.ag-input-field-input.ag-checkbox-input');

            checkBoxInstance.forEach((checkBox, index) => {
                const specificId = `Simulation_Approval_Checkbox${index / 14}`;
                checkBox.id = specificId;
            })
        }, 1500);
        const floatingFilterInstances = document.querySelectorAll('.ag-input-field-input.ag-text-field-input');
        floatingFilterInstances.forEach((floatingFilter, index) => {
            const specificId = `Simulation_Approval_Floating${index}`;
            floatingFilter.id = specificId;
        });
        //if resolution greater than 1920 table listing fit to 100%
        window.screen.width > 1920 && params.api.sizeColumnsToFit()
        //if resolution greater than 1920 table listing fit to 100%

    };


    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }
    /**
          * @method renderRowData
          * @description This method is used to render the row data.
          */
    const renderRowData = () => {
        if (isDashboard) {
            return simualtionApprovalList; // Return simulationApprovalList if isDashboard is true
        } else {

            if (showExtraData && simualtionApprovalListDraft && simualtionApprovalListDraft.length > 0) {

                return [...setLoremIpsum(simualtionApprovalListDraft[0]), ...simualtionApprovalListDraft]; // Apply the second operation if showExtraData is true
            } else {

                return simualtionApprovalListDraft; // Return simulationApprovalListDraft if showExtraData is false
            }
        }

    }
    const frameworkComponents = {
        // totalValueRenderer: this.buttonFormatter,
        // effectiveDateRenderer: this.effectiveDateFormatter,
        // costingHeadRenderer: this.costingHeadFormatter,
        linkableFormatter: linkableFormatter,
        requestedByFormatter: requestedByFormatter,
        requestedOnFormatter: requestedOnFormatter,
        statusFormatter: statusFormatter,
        buttonFormatter: buttonFormatter,
        // customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
        reasonFormatter: reasonFormatter,
        conditionFormatter: conditionFormatter,
        hyphenFormatter: hyphenFormatter,
        statusFilter: SingleDropdownFloationFilter
    };

    return (
        <Fragment>
            {
                !showApprovalSumary &&
                <div className={`${!isSmApprovalListing && 'container-fluid'} approval-listing-page`} id='history-go-to-top'>
                    {(isLoader) ? <LoaderCustom customClass={isDashboard ? "dashboard-loader" : "loader-center"} /> : <div>
                        < div className={`ag-grid-react custom-pagination`}>
                            <form onSubmit={handleSubmit(() => { })} noValidate>
                                {!isDashboard && <ScrollToTop pointProp={"history-go-to-top"} />}
                                <Row className="pt-4">


                                    <Col md="8" lg="6" className="search-user-block mb-3">
                                        <div className="d-flex justify-content-end bd-highlight w100">
                                            <div className="warning-message d-flex align-items-center">
                                                {warningMessage && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                                                <button disabled={disableFilter} id="Simulation_Approval_Filter" title="Filtered data" type="button" class="user-btn mr5" onClick={() => onSearch()}><div class="filter mr-0"></div></button>
                                            </div >
                                            <button type="button" id="Simulation_Approval_Reset" className="user-btn  mr5" title="Reset Grid" onClick={() => resetState()}>
                                                <div className="refresh mr-0"></div>
                                            </button>
                                            {
                                                !props.hidesendBtn && <button
                                                    class="user-btn approval-btn"
                                                    id="Simulation_Approval_Send"
                                                    onClick={sendForApproval}
                                                    title="Send For Approval"
                                                    disabled={((isDashboard ? (simualtionApprovalList && simualtionApprovalList.length === 0) : (simualtionApprovalListDraft && simualtionApprovalListDraft.length === 0)) || isSuperAdmin) ? true : false}
                                                >
                                                    <div className="send-for-approval"></div>
                                                </button>
                                            }
                                        </div >
                                    </Col >

                                </Row >
                            </form >

                            <div className={`ag-grid-wrapper p-relative ${isDashboard ? (simualtionApprovalList && simualtionApprovalList?.length <= 0) || noData ? "overlay-contain" : "" : (simualtionApprovalListDraft && simualtionApprovalListDraft?.length <= 0) || noData ? "overlay-contain" : ""} ${isDashboard ? "report-grid" : ""}`}>
                                <div className="ag-grid-header">
                                    <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                    {!isDashboard && <TourWrapper
                                        buttonSpecificProp={{
                                            id: "simulation_approval_listing", onClick: toggleExtraData
                                        }}
                                        stepsSpecificProp={{
                                            steps: Steps(t).SIMULATION_APPROVAL
                                        }} />}
                                </div>
                                <div className="ag-theme-material">
                                    {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found approval-listing" />}
                                    {render ? <LoaderCustom customClass="loader-center" /> : <AgGridReact

                                        style={{ height: '100%', width: '100%', }}
                                        defaultColDef={defaultColDef}
                                        floatingFilter={true}
                                        domLayout='autoHeight'
                                        // columnDefs={c}
                                        rowData={renderRowData()}
                                        // columnDefs={colRow}
                                        pagination={true}
                                        paginationPageSize={globalTake}
                                        onGridReady={onGridReady}
                                        onFilterModified={onFloatingFilterChanged}
                                        gridOptions={gridOptions}
                                        noRowsOverlayComponent={'customNoRowsOverlay'}
                                        noRowsOverlayComponentParams={{
                                            title: EMPTY_DATA,
                                            imagClass: 'imagClass'
                                        }}
                                        frameworkComponents={frameworkComponents}
                                        rowSelection={'multiple'}
                                        onSelectionChanged={onRowSelect}
                                        isRowSelectable={isRowSelectable}
                                        suppressRowClickSelection={true}
                                        enableBrowserTooltips={true}
                                    >

                                        <AgGridColumn width={120} field="ApprovalNumber" cellRenderer='linkableFormatter' headerName="Token No." cellClass="token-no-grid"></AgGridColumn>
                                        <AgGridColumn width={141} field="CostingHead" headerName="Costing Head" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                        {/* // <AgGridColumn width={141} field="SimulationTechnologyHead" headerName="Simulation Head"></AgGridColumn>                //RE */}
                                        {/* THIS FEILD WILL ALWAYS COME BEFORE */}
                                        {getConfigurationKey().IsProvisionalSimulation && <AgGridColumn width={145} field="SimulationType" headerName='Simulation Type' ></AgGridColumn>}
                                        {getConfigurationKey().IsProvisionalSimulation && <AgGridColumn width={145} field="ProvisionalStatus" headerName='Amendment Status' ></AgGridColumn>}
                                        {getConfigurationKey().IsProvisionalSimulation && <AgGridColumn width={145} field="LinkingTokenNumber" headerName='Linking Token No' ></AgGridColumn>}

                                        <AgGridColumn width={141} field="SimulationTechnologyHead" headerName="Simulation Head"></AgGridColumn>
                                        <AgGridColumn width={130} field="TechnologyName" headerName="Technology"></AgGridColumn>
                                        <AgGridColumn width={200} field="VendorName" headerName="Vendor (Code)" cellRenderer='hyphenFormatter'></AgGridColumn>
                                        <AgGridColumn width={200} field="CustomerName" headerName="Customer (Code)" cellRenderer='hyphenFormatter'></AgGridColumn>
                                        <AgGridColumn width={170} field="ImpactCosting" headerName="Impacted Costing" ></AgGridColumn>
                                        <AgGridColumn width={154} field="ImpactParts" headerName="Impacted Parts"></AgGridColumn>
                                        <AgGridColumn width={170} field="Reason" headerName="Reason" cellRenderer='reasonFormatter'></AgGridColumn>
                                        <AgGridColumn width={140} field="SimulatedByName" headerName='Initiated By' cellRenderer='requestedByFormatter'></AgGridColumn>
                                        <AgGridColumn width={140} field="SimulatedOn" headerName='Simulated On' cellRenderer='requestedOnFormatter' filter="agDateColumnFilter" filterParams={filterParams} ></AgGridColumn>
                                        {/* <AgGridColumn width={140} field="SimulatedOn" headerName='Last Approved On' cellRenderer='requestedOnFormatter' filter="agDateColumnFilter" filterParams={filterParams} ></AgGridColumn>                //RE */}
                                        <AgGridColumn width={200} field="LastApprovedBy" headerName='Last Approved/Rejected By' cellRenderer='requestedByFormatter'></AgGridColumn>
                                        <AgGridColumn width={145} field="RequestedOn" headerName='Requested On' cellRenderer='requestedOnFormatter' filter="agDateColumnFilter" filterParams={filterParamsSecond}></AgGridColumn>

                                        {!isSmApprovalListing && <AgGridColumn pinned="right" field="DisplayStatus" headerClass="justify-content-center" cellClass="text-center" headerName='Status' tooltipField="TooltipText" cellRenderer='statusFormatter' floatingFilterComponent="statusFilter" floatingFilterComponentParams={floatingFilterStatus}></AgGridColumn>}
                                        <AgGridColumn width={115} field="SimulationId" headerName='Actions' pinned="right" type="rightAligned" floatingFilter={false} cellRenderer='buttonFormatter'></AgGridColumn>

                                    </AgGridReact >}

                                    <div className='button-wrapper'>
                                        {!isLoader && <PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={globalTake} />}
                                        <div className="d-flex pagination-button-container">
                                            <p><button className="previous-btn" type="button" disabled={false} onClick={() => onBtPrevious()}> </button></p>
                                            {pageSize.pageSize10 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 10)}</p>}
                                            {pageSize.pageSize50 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 50)}</p>}
                                            {pageSize.pageSize100 && <p className="next-page-pg custom-left-arrow">Page <span className="text-primary">{pageNo}</span> of {Math.ceil(totalRecordCount / 100)}</p>}
                                            <p><button className="next-btn" type="button" onClick={() => onBtNext()}> </button></p>
                                        </div>
                                    </div>
                                    {
                                        approveDrawer &&
                                        <SimulationApproveReject
                                            isOpen={approveDrawer}
                                            // <ApproveRejectDrawer                //RE
                                            //     isOpen={isApprovalDrawer}                //RE
                                            anchor={'right'}
                                            approvalData={[]}
                                            type={isPendingForApproval ? 'Approve' : 'Sender'}
                                            selectedRowData={selectedRowData}
                                            closeDrawer={closeDrawer}
                                            isSimulation={true}
                                            isSimulationApprovalListing={true}
                                            simulationDetail={simulationDetail}
                                            IsFinalLevel={showFinalLevelButtons}
                                            costingTypeId={selectedRowData[0]?.SimulationHeadId}
                                            approvalTypeIdValue={selectedRowData[0]?.SimulationHeadId}
                                            showApprovalTypeDropdown={selectedRowData && selectedRowData[0]?.Status === "Draft"}
                                            releaseStrategyDetails={releaseStrategyDetails}
                                            technologyId={selectedRowData ? selectedRowData[0]?.SimulationTechnologyId : approvalData?.SimulationTechnologyId}
                                            IsExchangeRateSimulation={selectedRowData[0]?.IsExchangeRateSimulation}
                                        />
                                    }
                                </div >
                            </div >
                        </div >
                        <div className="text-right pb-3">
                            <WarningMessage message="It may take up to 5 minutes for the status to be updated." />
                        </div>
                    </div >}
                </div >
            }
            {
                showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.DELETE_SIMULATION_DRAFT_TOKEN}`} />
            }
        </Fragment >
    )
}

export default SimulationApprovalListing;
