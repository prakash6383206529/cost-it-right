import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApprovalList, getApprovalList } from './Action';
import { Col, Row } from 'reactstrap';
import LoaderCustom from '../common/LoaderCustom';
import ScrollToTop from '../common/ScrollToTop';
import WarningMessage from '../common/WarningMessage';
import NoContentFound from '../common/NoContentFound';
import { EMPTY_DATA, PENDING, defaultPageSize } from '../../config/constants';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import PopupMsgWrapper from '../common/PopupMsgWrapper';
import { checkForDecimalAndNull, getConfigurationKey, loggedInUserId, searchNocontentFilter, userDetails } from '../../helper';
import DayTime from '../common/DayTimeWrapper';
import SingleDropdownFloationFilter from '../masters/material-master/SingleDropdownFloationFilter';
import { dashboardTabLock, isResetClick } from '../../actions/Common';
import { Redirect } from 'react-router'
import { PaginationWrappers } from '../common/Pagination/PaginationWrappers';
import PaginationControls from '../common/Pagination/PaginationControls';

const gridOptions = {};


const ApprovalListing = (props) => {
    const dispatch = useDispatch();
    const loggedUser = loggedInUserId()
    const { isApproval, isDashboard } = props;
    const [loader, setloader] = useState(false);
    const [approvalData, setApprovalData] = useState('')
    const [selectedRowData, setSelectedRowData] = useState([]);
    const [approveDrawer, setApproveDrawer] = useState(false)
    const [openDraftDrawer, setOpenDraftDrawer] = useState(false)
    const [reasonId, setReasonId] = useState('')
    const [showApprovalSumary, setShowApprovalSummary] = useState(false)
    const [showFinalLevelButtons, setShowFinalLevelButton] = useState(false)
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [isOpen, setIsOpen] = useState(false)
    const [showPopup, setShowPopup] = useState(false)

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
    const [noData, setNoData] = useState(false)
    const [pageSize, setPageSize] = useState({ pageSize10: true, pageSize50: false, pageSize100: false })
    const [floatingFilterData, setFloatingFilterData] = useState({ ApprovalNumber: "", CostingNumber: "", PartNumber: "", PartName: "", VendorName: "", PlantName: "", TechnologyName: "", NetPOPriceNew: "", OldPOPriceNew: "", Reason: "", EffectiveDate: "", CreatedBy: "", CreatedOn: "", RequestedBy: "", RequestedOn: "" })
    const approvalListing = useSelector(state => state?.vendorManagement?.approvalListing); // assuming approvals and isLoading are stored in the redux state


    useEffect(() => {
        dispatch(fetchApprovalList()); // Fetch approvals when the component mounts
    }, []);
    const hyperLinkableFormatter = (props) => {

        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // return (
        //     <>
        //         <div
        //             id={`Costing_Approval_Costing_Id_${props?.rowIndex}`}
        //             onClick={() => viewDetailCostingID(row.UserId, cell, row)}
        //             className={'link'}
        //         >{cell}</div>
        //     </>
        // )
    }
    const dateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? DayTime(cell).format('DD/MM/YYYY') : '-';
    }
    var floatingFilterStatus = {
        maxValue: 1,
        suppressFilterButton: true,
        component: 'costingApproval',
        location: "costing"
    }

    const getDataList = (
        partNo = '00000000-0000-0000-0000-000000000000',
        createdBy = '00000000-0000-0000-0000-000000000000',
        requestedBy = '00000000-0000-0000-0000-000000000000',
        status = '00000000-0000-0000-0000-000000000000',
        skip = 0, take = 10, isPagination = true, dataObj

    ) => {
        if (isDashboard) {
            dataObj.DisplayStatus = props.status
        }
        let filterData = {
            loggedUser: loggedUser,
            logged_in_user_level_id: userDetails().LoggedInLevelId,
            partNo: partNo,
            createdBy: createdBy,
            requestedBy: requestedBy,
            status: status,
            isDashboard: isDashboard ?? false
        }
        setloader(true)
        isDashboard && dispatch(dashboardTabLock(true))        // LOCK DASHBOARD TAB WHEN LOADING
        // dispatch(
        //     getApprovalList(filterData, skip, take, isPagination, dataObj, (res) => {
        //         if (res.status === 204 && res.data === '') {
        //             setloader(false)
        //             dispatch(dashboardTabLock(false))      // UNLOCK DASHBOARD TAB AFTER LOADING  
        //             setTotalRecordCount(0)
        //             setPageNo(0)
        //             let isReset = true
        //             setTimeout(() => {
        //                 for (var prop in floatingFilterData) {
        //                     if (props?.status) {   // CONDITION WHEN RENDERED FROM DASHBOARD
        //                         if (prop !== 'DisplayStatus' && floatingFilterData[prop] !== "") {
        //                             isReset = false
        //                         }
        //                     }
        //                     else {
        //                         if (floatingFilterData[prop] !== "") {
        //                             isReset = false
        //                         }
        //                     }
        //                 }

        //                 // Sets the filter model via the grid API
        //                 isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(filterModel))
        //             }, 300);

        //             setTimeout(() => {
        //                 setWarningMessage(false)
        //                 dispatch(isResetClick(false))
        //             }, 330);

        //             setTimeout(() => {
        //                 setIsFilterButtonClicked(false)
        //             }, 600);

        //         } else if (res && res.data && res.data.DataList) {
        //             let unSelectedData = res.data.DataList
        //             let temp = []

        //             unSelectedData.map(item => {
        //                 if (item.Status !== PENDING) {
        //                     temp.push(item.CostingId)
        //                     return null
        //                 }
        //                 return temp
        //             })
        //             setloader(false)
        //             dispatch(dashboardTabLock(false))
        //             //  setTableData(Data)

        //             if (res) {
        //                 let isReset = true
        //                 setTimeout(() => {
        //                     for (var prop in floatingFilterData) {
        //                         if (props?.status) {    // CONDITION WHEN RENDERED FROM DASHBOARD
        //                             if (prop !== 'DisplayStatus' && floatingFilterData[prop] !== "") {
        //                                 isReset = false
        //                             }
        //                         }
        //                         else {
        //                             if (floatingFilterData[prop] !== "") {
        //                                 isReset = false
        //                             }
        //                         }
        //                     }
        //                     // Sets the filter model via the grid API
        //                     isReset ? (gridOptions?.api?.setFilterModel({})) : (gridOptions?.api?.setFilterModel(filterModel))
        //                 }, 300);

        //                 setTimeout(() => {
        //                     setWarningMessage(false)
        //                     dispatch(isResetClick(false))
        //                 }, 330);

        //                 setTimeout(() => {
        //                     setIsFilterButtonClicked(false)
        //                 }, 600);
        //             }
        //         } else {
        //             setloader(false)
        //         }
        //     }),
        // )
    }

    const priceFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                {/* <img className={`arrow-ico mr-1 ${(row.NetPOPrice === 0 || row.OldPOPrice === row.NetPOPrice || cell === null) ? '' : (row.OldPOPrice > row.NetPOPrice ? 'arrow-green' : 'arrow-red')}`} src={row.OldPOPrice > row.NetPOPrice ? imgArrowDown : imgArrowUP} alt="arro-up" /> */}
                {cell != null ? row.NetPOPriceNew : '-'}
            </>
        )
    }

    const oldpriceFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (
            <>
                {/* <img className={`${row.OldPOPrice > row.NetPOPrice ? 'arrow-ico mr-1 arrow-green' : 'mr-1 arrow-ico arrow-red'}`} src={row.OldPOPrice > row.NetPOPrice ? imgArrowDown : imgArrowUP} alt="arro-up" /> */}
                {cell != null ? cell : '-'}
            </>
        )
    }

    const requestedOnFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? DayTime(cell).format('DD/MM/YYYY') : '-';
    }


    const lastApprovalFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? cell : '-';
    }

    const statusFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        console.log('cell: ', cell);
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;

        return <div className={cell}>{row.DisplayStatus}</div>
    }
    const renderVendor = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cell !== null && cell !== '-') ? `${cell}` : '-'
    }
    const basicRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return !cell ? '-' : checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice);
    }
    const onSearch = () => {

        setWarningMessage(false)
        setIsFilterButtonClicked(true)
        setPageNo(1)
        setCurrentRowIndex(0)
        gridOptions?.columnApi?.resetColumnState();
        getDataList("", "", "", "", 0, globalTake, true, floatingFilterData)
    }

    const resetState = () => {
        // dispatch(agGridStatus("", ""))
        dispatch(isResetClick(true))
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
        setCurrentRowIndex(0)
        // dispatch(setSelectedRowForPagination([]))
        getDataList("", "", "", "", 0, 10, true, floatingFilterData)
        setGlobalTake(10)
        setPageSize(prevState => ({ ...prevState, pageSize10: true, pageSize50: false, pageSize100: false }))
    }
    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            if ((isDashboard ? approvalListing : [])?.length !== 0 || (isDashboard ? approvalListing : [])?.length !== 0) setNoData(searchNocontentFilter(value, noData))
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

            if (value.column.colId === "EffectiveDate" || value.column.colId === "RequestedOn" || value.column.colId === "CreatedOn") {
                return false
            }
            setFloatingFilterData({ ...floatingFilterData, [value.column.colId]: value.filterInstance.appliedModel.filter })
        }
    }
    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const onPopupConfirm = () => {
        setShowPopup(false)
        // sendForApprovalDrawer()
    }

    const closePopUp = () => {
        setShowPopup(false)
    }

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

    const frameworkComponents = {
        renderVendor: renderVendor,
        priceFormatter: priceFormatter,
        oldpriceFormatter: oldpriceFormatter,
        dateFormatter: dateFormatter,
        requestedOnFormatter: requestedOnFormatter,
        statusFormatter: statusFormatter,
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
        // linkableFormatter: linkableFormatter,
        // hyperLinkableFormatter: hyperLinkableFormatter,
        lastApprovalFormatter: lastApprovalFormatter,
        statusFilter: SingleDropdownFloationFilter,
        basicRateFormatter: basicRateFormatter
    };
    if (showApprovalSumary === true) {

        return <Redirect
            to={{
                pathname: "/approval-listing",
                // state: {
                //     approvalNumber: approvalData.approvalNumber,
                //     approvalProcessId: approvalData.approvalProcessId
                // }
            }}
        />
    }
    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        headerCheckboxSelectionFilteredOnly: true,
        // headerCheckboxSelection: isFirstColumn,
        // checkboxSelection: isFirstColumn
    };
    return (
        <Fragment>
            {!showApprovalSumary && <> {
                <div className={` ${!isApproval && 'container-fluid'} approval-listing-page ${loader ? 'dashboard-loader' : ''}`} id={'approval-go-to-top'}>
                    {(loader) ? <LoaderCustom customClass="loader-center" /> : <div>
                        {<ScrollToTop pointProp={"approval-go-to-top"} />}
                        <form noValidate>
                            <Row className="pt-4 blue-before">
                                <Col md="6" lg="6" className="search-user-block mb-3">
                                    <div className="d-flex justify-content-end bd-highlight w100">
                                        <div className="warning-message d-flex align-items-center">
                                            {warningMessage && <><WarningMessage dClass="mr-3" message={'Please click on filter button to filter all data'} /><div className='right-hand-arrow mr-2'></div></>}
                                            <button id='Costing_Approval_Filter' disabled={disableFilter} title="Filtered data" type="button" class="user-btn mr5" onClick={() => onSearch()}><div class="filter mr-0"></div></button>
                                        </div >
                                        <div>
                                            <button type="button" id="Costing_Approval_Reset" className="user-btn mr-2" title="Reset Grid" onClick={() => resetState()}>
                                                <div className="refresh mr-0"></div>
                                            </button>

                                        </div>
                                    </div >
                                </Col >
                            </Row >
                        </form >
                        <Row>
                            <Col>
                                <div className={`ag-grid-react custom-pagination`}>

                                    <div id={'parentId'} className={`ag-grid-wrapper height-width-wrapper min-height-auto p-relative `}>
                                        <div className="ag-grid-header">
                                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                        </div>
                                        <div className="ag-theme-material">
                                            {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found approval-listing" />}
                                            <AgGridReact
                                                style={{ height: '100%', width: '100%' }}
                                                defaultColDef={defaultColDef}
                                                domLayout='autoHeight'
                                                // columnDefs={c}
                                                rowData={approvalListing ? approvalListing : []}
                                                pagination={true}
                                                floatingFilter={true}

                                                paginationPageSize={globalTake}
                                                // onGridReady={onGridReady}
                                                gridOptions={gridOptions}
                                                //loadingOverlayComponent={'customLoadingOverlay'}
                                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                                noRowsOverlayComponentParams={{
                                                    title: EMPTY_DATA,
                                                    imagClass: "imagClass"
                                                }}
                                                frameworkComponents={frameworkComponents}
                                                suppressRowClickSelection={true}
                                                rowSelection={'multiple'}
                                                onFilterModified={onFloatingFilterChanged}
                                                //onSelectionChanged={onRowSelect}
                                                // onRowSelected={onRowSelect}
                                                // isRowSelectable={isRowSelectable}
                                                enableBrowserTooltips={true}
                                            >
                                                <AgGridColumn field="sno" headerName="S no."  ></AgGridColumn>
                                                <AgGridColumn field="Plant" headerName='Plant'></AgGridColumn>
                                                <AgGridColumn field="VendorCode" headerName="Vendor Code"></AgGridColumn>
                                                <AgGridColumn field="VendorName" cellRenderer='renderVendor' headerName="Vendor (Code)"></AgGridColumn>
                                                <AgGridColumn field="Category" headerName="Category"></AgGridColumn>
                                                <AgGridColumn field="RequestID" headerName="Request ID" cellRenderer='hyperLinkableFormatter' ></AgGridColumn>
                                                <AgGridColumn field="RequestDate" cellRenderer='dateFormatter' headerName="RequestDate" filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                                                {!isApproval && <AgGridColumn headerClass="justify-content-center" pinned="right" cellClass="text-center" field="Status" tooltipField="TooltipText" cellRenderer='statusFormatter' headerName="Status" floatingFilterComponent="statusFilter" floatingFilterComponentParams={floatingFilterStatus}></AgGridColumn>}
                                            </AgGridReact>
                                            <div className='button-wrapper'>
                                                {<PaginationWrappers gridApi={gridApi} totalRecordCount={totalRecordCount} getDataList={getDataList} floatingFilterData={floatingFilterData} module="RM" />}
                                                <PaginationControls totalRecordCount={totalRecordCount} getDataList={getDataList} floatingFilterData={floatingFilterData} module="RM" />



                                            </div>

                                            {
                                                showPopup && <PopupMsgWrapper className={'main-modal-container'} isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`Quantity for this costing lies between regularization limit & maximum deviation limit. Do you wish to continue?`} />
                                            }
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right pb-3">
                                    <WarningMessage message="It may take up to 5 minutes for the status to be updated." />
                                </div>
                            </Col>
                        </Row>
                    </div >}
                </div >
            }</>
            }

        </Fragment >
    )
};

export default ApprovalListing;
