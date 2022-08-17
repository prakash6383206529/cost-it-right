import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { useDispatch, useSelector } from 'react-redux'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import LoaderCustom from '../../common/LoaderCustom'
import NoContentFound from '../../common/NoContentFound';
import DayTime from '../../common/DayTimeWrapper'
import { checkForDecimalAndNull, getConfigurationKey, loggedInUserId, userDetails } from '../../../helper'
import { BOP_MASTER_ID, defaultPageSize, EMPTY_DATA, MACHINE_MASTER_ID, OPERATIONS_ID, PENDING } from '../../../config/constants';
import { getRMApprovalList } from '../actions/Material';
import SummaryDrawer from '../SummaryDrawer';
import { DRAFT, RM_MASTER_ID } from '../../../config/constants';
import MasterSendForApproval from '../MasterSendForApproval';
import WarningMessage from '../../common/WarningMessage';
import Toaster from '../../common/Toaster'
import { masterFinalLevelUser } from '../actions/Material'
import { PaginationWrapper } from '../../common/commonPagination';
import { setSelectedCostingListSimualtion } from '../../simulation/actions/Simulation';
import { hyphenFormatter } from '../masterUtil';
import _ from 'lodash';

const gridOptions = {};

function CommonApproval(props) {

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
    const [globalTake, setGlobalTake] = useState(defaultPageSize)
    const [filterModel, setFilterModel] = useState({});
    const [pageNo, setPageNo] = useState(1)
    const [pageNoNew, setPageNoNew] = useState(1)
    const [totalRecordCount, setTotalRecordCount] = useState(1)
    const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false)
    const [currentRowIndex, setCurrentRowIndex] = useState(0)
    const [pageSize, setPageSize] = useState({ pageSize10: true, pageSize50: false, pageSize100: false })
    const [floatingFilterData, setFloatingFilterData] = useState({ ApprovalProcessId: "", ApprovalNumber: "", CostingHead: "", TechnologyName: "", RawMaterial: "", RMGrade: "", RMSpec: "", Category: "", MaterialType: "", Plant: "", VendorName: "", UOM: "", BasicRate: "", ScrapRate: "", RMFreightCost: "", RMShearingCost: "", NetLandedCost: "", EffectiveDate: "", RequestedBy: "", CreatedByName: "", LastApprovedBy: "", DisplayStatus: "", BoughtOutPartNumber: "", BoughtOutPartName: "", BoughtOutPartCategory: "", Specification: "", Plants: "", MachineNumber: "", MachineTypeName: "", MachineTonnage: "", MachineRate: "", Technology: "", OperationName: "", OperationCode: "", UnitOfMeasurement: "", Rate: "", })
    const dispatch = useDispatch()
    const { selectedCostingListSimulation } = useSelector((state => state.simulation))
    let master = props?.MasterId

    useEffect(() => {
        dispatch(setSelectedCostingListSimualtion([]))
        setSelectedRowData([])
        getTableData(0, 10, true, floatingFilterData)
        let obj = {
            MasterId: props?.MasterId,
            DepartmentId: userDetails().DepartmentId,
            LoggedInUserLevelId: userDetails().LoggedInMasterLevelId,
            LoggedInUserId: loggedInUserId()
        }
        dispatch(masterFinalLevelUser(obj, (res) => {
            if (res.data.Result) {
                setIsFinalApprover(res.data.Data.IsFinalApprovar)
            }
        }))

        return () => {
            // Cleanup function
            dispatch(setSelectedCostingListSimualtion([]))
            setSelectedRowData([])
        }

    }, [])

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
        if (approvalList?.length > 0) {
            setTotalRecordCount(approvalList[0].TotalRecordCount)
        }

    }, [approvalList])


    /**
* @method getTableData
* @description getting approval list table
*/

    const getTableData = (skip = 0, take = 10, isPagination = true, dataObj, pageDropDownChange = false) => {
        //  API CALL FOR GETTING RM APPROVAL LIST
        setLoader(true)
        dispatch(getRMApprovalList(props?.MasterId, skip, take, isPagination, dataObj, (res) => {
            setLoader(false)
            let obj = { ...floatingFilterData }

            if (res) {
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
        setPageNo(1)
        setPageNoNew(1)
        setCurrentRowIndex(0)
        gridOptions?.columnApi?.resetColumnState();
        getTableData(0, globalTake, true, floatingFilterData)
    }



    const resetState = () => {
        setIsFilterButtonClicked(false)
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
        setPageNoNew(1)
        setCurrentRowIndex(0)
        getTableData(0, 10, true, floatingFilterData)
        dispatch(setSelectedCostingListSimualtion([]))
        setSelectedRowData([])
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



    const createdOnFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return cell != null ? cell : '';
    }

    const priceFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>

                {cell != null ? checkForDecimalAndNull(cell, initialConfiguration && initialConfiguration.NoOfDecimalForPrice) : ''}
            </>
        )
    }

    const oldpriceFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>

                {cell != null ? checkForDecimalAndNull(cell, initialConfiguration && initialConfiguration.NoOfDecimalForPrice) : ''}
            </>
        )
    }

    const requestedOnFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return cell != null ? cell : '-';
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

        return cell != null ? checkForDecimalAndNull(cell, getConfigurationKey() && getConfigurationKey().NoOfDecimalForPrice) : '';
    }

    const viewDetails = (approvalNumber = '', approvalProcessId = '') => {
        setApprovalData({ approvalProcessId: approvalProcessId, approvalNumber: approvalNumber })
        setShowApprovalSummary(true)

    }

    /**
    * @method linkableFormatter
    * @description Renders Name link
    */
    const linkableFormatter = (props) => {

        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;


        if (selectedCostingListSimulation?.length > 0) {
            selectedCostingListSimulation.map((item) => {

                switch (master) {
                    case 1:
                        if (item?.RawMaterialId === props?.node?.data?.RawMaterialId) {
                            props.node.setSelected(true)
                        }
                        break;
                    case 2:
                        if (item?.BoughtOutPartId === props?.node?.data?.BoughtOutPartId) {
                            props.node.setSelected(true)
                        }
                        break;
                    case 3:
                        if (item?.OperationId === props?.node?.data?.OperationId) {
                            props.node.setSelected(true)
                        }
                        break;
                    case 4:
                        if (item?.MachineId === props?.node?.data?.MachineId) {
                            props.node.setSelected(true)
                        }
                        break;
                    default:
                        // code block
                        if (item?.ApprovalProcessId === props?.node?.data?.ApprovalProcessId) {
                            props.node.setSelected(true)
                        }
                }
            })
        }

        return (
            <Fragment>
                {
                    row.Status !== DRAFT ?
                        <div onClick={() => viewDetails(row.ApprovalNumber, row.ApprovalProcessId)} className={row.Status !== DRAFT ? 'link' : ''}>
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
            setLoader(true)
            getTableData(0, 10, true, floatingFilterData)
        }
    }

    // const onRowSelect = () => {
    //     var selectedRows = gridApi.getSelectedRows();
    //     setSelectedRowData(selectedRows)
    // }

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
                dispatch(setSelectedCostingListSimualtion(uniqeArray))              //SETTING CHECKBOX STATE DATA IN REDUCER
                setSelectedRowData(uniqeArray)
                break;
            case 2:
                uniqeArray = _.uniqBy(selectedRows, "BoughtOutPartId")          //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
                dispatch(setSelectedCostingListSimualtion(uniqeArray))              //SETTING CHECKBOX STATE DATA IN REDUCER
                setSelectedRowData(uniqeArray)
                break;
            case 3:
                uniqeArray = _.uniqBy(selectedRows, "OperationId")          //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
                dispatch(setSelectedCostingListSimualtion(uniqeArray))              //SETTING CHECKBOX STATE DATA IN REDUCER
                setSelectedRowData(uniqeArray)
                break;
            case 4:
                uniqeArray = _.uniqBy(selectedRows, "MachineId")          //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
                dispatch(setSelectedCostingListSimualtion(uniqeArray))              //SETTING CHECKBOX STATE DATA IN REDUCER
                setSelectedRowData(uniqeArray)
                break;
            default:
                // code block
                uniqeArray = _.uniqBy(selectedRows, "ApprovalProcessId")          //UNIQBY FUNCTION IS USED TO FIND THE UNIQUE ELEMENTS & DELETE DUPLICATE ENTRY
                dispatch(setSelectedCostingListSimualtion(uniqeArray))              //SETTING CHECKBOX STATE DATA IN REDUCER
                setSelectedRowData(uniqeArray)
        }
    }


    const isFirstColumn = (params) => {
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;

        return thisIsFirstColumn;
    }

    // const resetState = debounce(() => {
    //     gridOptions.columnApi.resetColumnState();
    //     gridOptions.api.setFilterModel(null);
    //     setLoader(true)
    //     getTableData()
    // }, 500)

    const sendForApproval = () => {

        if (selectedRowData?.length > 0) {
            setApprovalDrawer(true)
        }
        else {
            Toaster.warning('Please select draft token to send for approval.')
        }
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
        checkboxSelection: isFirstColumn
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);

    };



    const onPageSizeChanged = (newPageSize) => {

        var value = document.getElementById('page-size').value;

        if (Number(newPageSize) === 10) {
            getTableData(currentRowIndex, 10, true, floatingFilterData, true)
            setPageSize(prevState => ({ ...prevState, pageSize10: true, pageSize50: false, pageSize100: false }))
            setGlobalTake(10)
            setPageNo(pageNoNew)
        }
        else if (Number(newPageSize) === 50) {

            setPageSize(prevState => ({ ...prevState, pageSize50: true, pageSize10: false, pageSize100: false }))
            setGlobalTake(50)
            setPageNo(pageNoNew)
            if (pageNo >= Math.ceil(totalRecordCount / 50)) {
                setPageNo(Math.ceil(totalRecordCount / 50))
                getTableData(0, 50, true, floatingFilterData)
            } else {
                getTableData(currentRowIndex, 50, true, floatingFilterData, true)
            }

        }
        else if (Number(newPageSize) === 100) {

            setPageSize(prevState => ({ ...prevState, pageSize100: true, pageSize10: false, pageSize50: false }))
            setGlobalTake(100)

            if (pageNo >= Math.ceil(totalRecordCount / 100)) {
                setPageNo(Math.ceil(totalRecordCount / 100))
                getTableData(0, 100, true, floatingFilterData)
            } else {
                getTableData(currentRowIndex, 100, true, floatingFilterData, true)
            }
        }

        if (props?.isApproval) {
            gridApi.paginationSetPageSize(Number(newPageSize));  // APPLIED THIS IF ELSE CONDITION JUST BECAUSE IN DASHBOARD INCREASING PAGE DROPDOWN WAS NOT WORKING

        }
        else {
            gridApi.paginationSetPageSize(Number(value));
        }
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const frameworkComponents = {
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
        hyphenFormatter: hyphenFormatter
    };

    const isRowSelectable = (rowNode) => {
        if (rowNode?.data?.Status === DRAFT) {
            return true;
        } else {
            return false
        }
    }

    return (
        <div className='min-height100vh custom-pagination'>
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
                        <button
                            title="Send For Approval"
                            class="user-btn approval-btn"
                            onClick={sendForApproval}
                            disabled={approvalList && (approvalList.length === 0 || isFinalApprover) ? true : false}
                        >
                            <div className="send-for-approval mr-0" ></div>
                        </button>

                    </div>
                </Col>
            </Row>
            <Row>
                <Col>
                    <div className={`ag-grid-react`}>
                        <div className={`ag-grid-wrapper height-width-wrapper min-height-auto ${approvalList && approvalList?.length <= 0 ? "overlay-contain" : ""}`}>
                            <div className="ag-grid-header">
                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                            </div>
                            <div className={`ag-theme-material ${loader && "max-loader-height"}`}>
                                <AgGridReact
                                    floatingFilter={true}
                                    style={{ height: '100%', width: '100%' }}
                                    defaultColDef={defaultColDef}
                                    domLayout='autoHeight'
                                    rowData={approvalList}
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
                                    suppressRowClickSelection={true}
                                    rowSelection={'multiple'}
                                    //onSelectionChanged={onRowSelect}
                                    onRowSelected={onRowSelect}
                                    onFilterModified={onFloatingFilterChanged}
                                    isRowSelectable={isRowSelectable}
                                >


                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="145" field="CostingId" hide dataAlign="center" searchable={false} ></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="145" cellClass="has-checkbox" field="ApprovalNumber" cellRenderer='linkableFormatter' headerName="Token No."></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && props?.isApproval && <AgGridColumn headerClass="justify-content-center" cellClass="text-center" field="DisplayStatus" cellRenderer='statusFormatter' headerName="Status" ></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="145" field="CostingHead" headerName='Head'></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="145" field="ApprovalProcessId" hide></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="145" field="TechnologyName" headerName='Technology'></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="145" field="RawMaterial" ></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="145" field="RMGrade"></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="150" field="RMSpec"></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="140" field="Category"></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="140" field="MaterialType"></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn field="VendorName" headerName="Vendor (Code)"></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn field="Plants" headerName='Plant (Code)'></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="140" field="UOM"></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="140" field="BasicRate"></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="140" field="ScrapRate"></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="155" field="RMFreightCost" cellRenderer='freightCostFormatter'></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="165" field="RMShearingCost" cellRenderer='shearingCostFormatter'></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="165" field="NetLandedCost" cellRenderer='costFormatter'></AgGridColumn>}

                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="150" field="RequestedBy" cellRenderer='createdOnFormatter' headerName="Initiated By"></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="150" field="CreatedByName" cellRenderer='createdOnFormatter' headerName="Created By"></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && <AgGridColumn width="160" field="LastApprovedBy" cellRenderer='requestedOnFormatter' headerName="Last Approved by"></AgGridColumn>}
                                    {props?.MasterId === RM_MASTER_ID && !props?.isApproval && <AgGridColumn headerClass="justify-content-center" pinned="right" cellClass="text-center" field="DisplayStatus" cellRenderer='statusFormatter' headerName="Status" ></AgGridColumn>}



                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="145" cellClass="has-checkbox" field="ApprovalNumber" cellRenderer='linkableFormatter' headerName="Token No."></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && props?.isApproval && <AgGridColumn headerClass="justify-content-center" cellClass="text-center" field="DisplayStatus" cellRenderer='statusFormatter' headerName="Status" ></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="145" field="CostingHead" headerName='Costing Head'></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="145" field="ApprovalProcessId" hide></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="145" field="BoughtOutPartNumber" headerName='BOP Part No'></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="145" field="BoughtOutPartName" headerName='BOP Part Name'></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="145" field="BoughtOutPartCategory" headerName='BOP Category'></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="150" field="UOM" headerName='UOM'></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="140" field="Specification" cellRenderer={"hyphenFormatter"} headerName='Specification'></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn field="VendorName" headerName='Vendor (Code)'></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="140" field="Plants" headerName='Plant (Code)'></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="140" field="BasicRate" headerName="Basic Rate(INR)"></AgGridColumn>}
                                    {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="140" field="NetLandedCost" headerName="Net Cost(INR)"></AgGridColumn>}
                                    {/* {props?.MasterId === BOP_MASTER_ID && <AgGridColumn width="140" field="EffectiveDate" cellRenderer='effectiveDateRenderer' headerName="Effective Date"></AgGridColumn>} */}
                                    {props?.MasterId === BOP_MASTER_ID && !props?.isApproval && <AgGridColumn headerClass="justify-content-center" pinned="right" cellClass="text-center" field="DisplayStatus" cellRenderer='statusFormatter' headerName="Status" ></AgGridColumn>}



                                    {props?.MasterId === MACHINE_MASTER_ID && <AgGridColumn width="145" field="CostingId" hide dataAlign="center" searchable={false} ></AgGridColumn>}
                                    {props?.MasterId === MACHINE_MASTER_ID && <AgGridColumn width="145" cellClass="has-checkbox" field="ApprovalNumber" cellRenderer='linkableFormatter' headerName="Token No."></AgGridColumn>}
                                    {props?.MasterId === MACHINE_MASTER_ID && props?.isApproval && <AgGridColumn headerClass="justify-content-center" cellClass="text-center" field="DisplayStatus" cellRenderer='statusFormatter' headerName="Status" ></AgGridColumn>}
                                    {props?.MasterId === MACHINE_MASTER_ID && <AgGridColumn width="145" field="CostingHead" headerName='Costing Head'></AgGridColumn>}
                                    {props?.MasterId === MACHINE_MASTER_ID && <AgGridColumn width="145" field="ApprovalProcessId" hide></AgGridColumn>}
                                    {props?.MasterId === MACHINE_MASTER_ID && <AgGridColumn width="145" field="TechnologyName" headerName='Technology'></AgGridColumn>}
                                    {props?.MasterId === MACHINE_MASTER_ID && <AgGridColumn width="145" field="VendorName" headerName='Vendor (Code)'></AgGridColumn>}
                                    {props?.MasterId === MACHINE_MASTER_ID && <AgGridColumn width="145" field="Plants" headerName='Plant (Code)'></AgGridColumn>}
                                    {props?.MasterId === MACHINE_MASTER_ID && <AgGridColumn width="150" field="MachineNumber" headerName='Machine Number'></AgGridColumn>}
                                    {props?.MasterId === MACHINE_MASTER_ID && <AgGridColumn width="140" field="MachineTypeName" headerName='Machine Type'></AgGridColumn>}
                                    {props?.MasterId === MACHINE_MASTER_ID && <AgGridColumn width="140" field="MachineTonnage" headerName='Machine Tonnage' cellRenderer={"hyphenFormatter"}></AgGridColumn>}
                                    {props?.MasterId === MACHINE_MASTER_ID && <AgGridColumn field="ProcessName" headerName='Process Name'></AgGridColumn>}
                                    {props?.MasterId === MACHINE_MASTER_ID && <AgGridColumn field="BasicRate" headerName="Machine Rate"></AgGridColumn>}
                                    {/* {props?.MasterId === MACHINE_MASTER_ID && <AgGridColumn width="140" field="EffectiveDate" headerName="Effective Date" cellRenderer='effectiveDateRenderer' ></AgGridColumn>} */}
                                    {props?.MasterId === MACHINE_MASTER_ID && !props?.isApproval && <AgGridColumn headerClass="justify-content-center" pinned="right" cellClass="text-center" field="DisplayStatus" cellRenderer='statusFormatter' headerName="Status" ></AgGridColumn>}



                                    {props?.MasterId === OPERATIONS_ID && <AgGridColumn width="145" field="CostingId" hide dataAlign="center" searchable={false} ></AgGridColumn>}
                                    {props?.MasterId === OPERATIONS_ID && <AgGridColumn width="145" cellClass="has-checkbox" field="ApprovalNumber" cellRenderer='linkableFormatter' headerName="Token No."></AgGridColumn>}
                                    {props?.MasterId === OPERATIONS_ID && props?.isApproval && <AgGridColumn headerClass="justify-content-center" cellClass="text-center" field="DisplayStatus" cellRenderer='statusFormatter' headerName="Status" ></AgGridColumn>}
                                    {props?.MasterId === OPERATIONS_ID && <AgGridColumn width="145" field="CostingHead" headerName='Costing Head'></AgGridColumn>}
                                    {props?.MasterId === OPERATIONS_ID && <AgGridColumn width="145" field="ApprovalProcessId" hide></AgGridColumn>}
                                    {props?.MasterId === OPERATIONS_ID && <AgGridColumn width="145" field="TechnologyName" headerName='Technology'></AgGridColumn>}
                                    {props?.MasterId === OPERATIONS_ID && <AgGridColumn width="145" field="OperationName" headerName='Operation Name'></AgGridColumn>}
                                    {props?.MasterId === OPERATIONS_ID && <AgGridColumn width="145" field="OperationCode" headerName='Operation Code'></AgGridColumn>}
                                    {props?.MasterId === OPERATIONS_ID && <AgGridColumn width="180" field="VendorName" headerName='Vendor (Code)'></AgGridColumn>}
                                    {props?.MasterId === OPERATIONS_ID && <AgGridColumn width="150" field="Plants" headerName='Plant (Code)'></AgGridColumn>}
                                    {props?.MasterId === OPERATIONS_ID && <AgGridColumn width="140" field="UOM" headerName='UOM'></AgGridColumn>}
                                    {props?.MasterId === OPERATIONS_ID && <AgGridColumn field="BasicRate" headerName='Rate'></AgGridColumn>}
                                    {/* {props?.MasterId === OPERATIONS_ID && <AgGridColumn field="EffectiveDate" headerName="EffectiveDate" cellRenderer='effectiveDateRenderer'></AgGridColumn>} */}
                                    {props?.MasterId === OPERATIONS_ID && !props?.isApproval && <AgGridColumn headerClass="justify-content-center" pinned="right" cellClass="text-center" field="DisplayStatus" cellRenderer='statusFormatter' headerName="Status" ></AgGridColumn>}
                                    <AgGridColumn cell width="190" field="EffectiveDate" cellRenderer='effectiveDateRenderer' filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                                </AgGridReact>
                                <div className='button-wrapper'>
                                    {!loader && <PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={globalTake} />}
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

                                <div className="text-right pb-3">
                                    <WarningMessage message="It may take up to 5 minutes for the status to be updated." />
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
            {
                showApprovalSumary &&
                <SummaryDrawer
                    isOpen={showApprovalSumary}
                    closeDrawer={closeDrawer}
                    approvalData={approvalData}
                    anchor={'bottom'}
                    masterId={props?.MasterId}
                />
            }

            {
                approvalDrawer &&
                <MasterSendForApproval
                    isOpen={approvalDrawer}
                    closeDrawer={closeApprovalDrawer}
                    isEditFlag={false}
                    masterId={props?.MasterId}
                    type={'Sender'}
                    anchor={"right"}
                    isBulkUpload={true}
                    approvalData={selectedRowData}
                />
            }
        </div>

    );
}

export default CommonApproval;