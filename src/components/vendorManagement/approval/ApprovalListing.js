
import React, { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchApprovalData, fetchApprovalList, getApprovalList } from '../Action';
import { Col, Row } from 'reactstrap';
import LoaderCustom from '../../common/LoaderCustom';
import ScrollToTop from '../../common/ScrollToTop';
import WarningMessage from '../../common/WarningMessage';
import NoContentFound from '../../common/NoContentFound';
import SummaryDrawer from './SummaryDrawer';
import { DRAFT, EMPTY_DATA, PENDING, SUPPLIER_MANAGEMENT_ID, defaultPageSize } from '../../../config/constants';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import { IsShowFreightAndShearingCostFields, checkForDecimalAndNull, getConfigurationKey, loggedInUserId, searchNocontentFilter, userDetails } from '../../../helper';
import DayTime from '../../common/DayTimeWrapper';
import { dashboardTabLock, isResetClick } from '../../../actions/Common';
import { Redirect } from 'react-router'
import { reactLocalStorage } from 'reactjs-localstorage';
import { resetStatePagination, setCurrentRowIndex, updateCurrentRowIndex, updateGlobalTake, updatePageNumber, updatePageSize } from '../../common/Pagination/paginationAction';
import { setSelectedRowForPagination } from '../../simulation/actions/Simulation';
import { debounce } from 'lodash';
import Toaster from '../../common/Toaster';
import { PaginationWrappers } from '../../common/Pagination/PaginationWrappers';
import PaginationControls from '../../common/Pagination/PaginationControls';
import ApproveRejectDrawer from './ApproveRejectDrawer';
import { checkFinalUser } from '../../costing/actions/Costing';
import SingleDropdownFloationFilter from '../../masters/material-master/SingleDropdownFloationFilter';
// import { masterFinalLevelUser } from '../../../actions/Material';
const gridOptions = {};

function ApprovalListing(props) {

    const [showApprovalSummary, setShowApprovalSummary] = useState(false);
    const [loader, setLoader] = useState(true);
    const { globalTakes } = useSelector((state) => state.pagination);
    const { isApproval, isDashboard } = props;

    const [disableFilter, setDisableFilter] = useState(true)
    const [warningMessage, setWarningMessage] = useState(false)
    const approvalList = useSelector(state => state?.supplierManagement?.approvalListing); // assuming approvals and isLoading are stored in the redux state

    const [gridApi, setGridApi] = useState(null);     // DON'T DELETE THIS STATE, IT IS USED BY AG-GRID
    const [gridColumnApi, setGridColumnApi] = useState(null);   // DON'T DELETE THIS STATE, IT IS USED BY AG-GRID
    const [totalRecordCount, setTotalRecordCount] = useState(0)
    const [filterModel, setFilterModel] = useState({});
    const [noData, setNoData] = useState(false)
    const statusColumnData = useSelector((state) => state.comman.statusColumnData);

    const [selectedRowData, setSelectedRowData] = useState([]);
    const [approvalData, setApprovalData] = useState('')
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const [approvalDrawer, setApprovalDrawer] = useState(false)
    const [isFinalApprover, setIsFinalApprover] = useState(false)
    const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false)

    const [floatingFilterData, setFloatingFilterData] = useState({
        ApprovalNumber: '',
        ReasonForRequest: '',
        Plant: '',
        VendorCode: '',
        VendorName: '',
        Category: '',
        EffectiveDate: '',
        RequestedBy: '',
        LastApprovedBy: '',


    })
    const dispatch = useDispatch();

    useEffect(() => {
        getTableData()
        let obj = {
            MasterId: SUPPLIER_MANAGEMENT_ID,
            DepartmentId: userDetails().DepartmentId,
            LoggedInUserLevelId: userDetails().LoggedInMasterLevelId,
            LoggedInUserId: loggedInUserId()
        }

        dispatch(checkFinalUser(obj, (res) => {


            if (res.data.Result) {
                setIsFinalApprover(res.data.Data.IsFinalApprovar)
            }
        }))
    }, [])

    useEffect(() => {
        setTimeout(() => {
            if (statusColumnData && statusColumnData.data) {
                setDisableFilter(false)
                setWarningMessage(true)
                setFloatingFilterData(prevState => ({ ...prevState, DisplayStatus: statusColumnData.data }))
            }
        }, 200)
    }, [statusColumnData])
    /**
 * @method getTableData
 * @description getting approval list table
 */
    const getTableData = () => {
        setLoader(true);
        dispatch(fetchApprovalList((res) => {
            if (res) {
                setLoader(false);

            }
        }));
    };
    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            if ((isDashboard ? approvalList : approvalList)?.length !== 0 || (isDashboard ? approvalList : approvalList)?.length !== 0) setNoData(searchNocontentFilter(value, noData))
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
    const costingHeadFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cellValue === true || cellValue === 'VBC') ? 'Vendor Based' : 'Zero Based';
    }
    const freightCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? cell : '-';
    }


    const costFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        return cell != null ? checkForDecimalAndNull(cell, getConfigurationKey() && getConfigurationKey().NoOfDecimalForPrice) : '';
    }

    const viewDetails = (approvalNumber = '', approvalProcessId = '', reasonForRequest = '') => {
        setApprovalData({ approvalProcessId: approvalProcessId, approvalNumber: approvalNumber, reasonForRequest: reasonForRequest })
        setShowApprovalSummary(true)

    }
    /**
* @method linkableFormatter
* @description Renders Name link
*/
    const linkableFormatter = (props) => {
        props.node.setSelected(true)

        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;


        return (
            <Fragment>
                <div onClick={() => viewDetails(row.ApprovalNumber, row.ApprovalProcessId, row.ReasonForRequest)} className='link'>
                    {row.ApprovalNumber || row.ApprovalNumber === 0 ? row.ApprovalNumber : "-"}
                </div>
            </Fragment>
        );
    };

    /**
  * @method closeDrawer
  * @description HIDE RM DRAWER
  */
    const closeDrawer = (e = '') => {
        setShowApprovalSummary(false)
        // setLoader(true)
        // getTableData()
    }
    const closeApprovalDrawer = (e = '') => {
        setApprovalDrawer(false)
        // setLoader(true)
        // getTableData()
    }

    const onRowSelect = () => {
        var selectedRows = gridApi.getSelectedRows();
        setSelectedRowData(selectedRows)
    }


    const isRowSelectable = (rowNode) => {
        console.log('rowNode: ', rowNode);
        return rowNode?.data?.Status === PENDING;
    };

    const resetState = debounce(() => {
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);
        setLoader(true)
        getTableData()
    }, 500)
    const sendForApproval = () => {
        if (selectedRowData.length > 0) {
            setApprovalDrawer(true)
        }
        else {
            Toaster.warning('Please select draft token to send for approval.')
        }
    }

    const onGridReady = (params) => {
        setGridApi(params.api);
        params.api.sizeColumnsToFit();
    };
    const isFirstColumn = (params) => {
        console.log('params: ', params);
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        console.log('displayedColumns: ', displayedColumns);
        var thisIsFirstColumn = displayedColumns[0] === params.column;
        console.log('thisIsFirstColumn: ', thisIsFirstColumn);

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
    var filterParams = {
        comparator: function (filterLocalDateAtMidnight, cellValue) {
            var dateAsString = cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
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
        statusFilter: SingleDropdownFloationFilter,


    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }
    var floatingFilterStatus = {
        maxValue: 1,
        suppressFilterButton: true,
        component: 'costingApproval',
        location: "costing"
    }
    const onSearch = () => {
        setNoData(false)
        setWarningMessage(false)
        setIsFilterButtonClicked(true)
        // setPageNo(1)
        dispatch(updatePageNumber(1))
        // setPageNoNew(1)
        dispatch(updateCurrentRowIndex(10))
        // setCurrentRowIndex(0)
        gridOptions?.columnApi?.resetColumnState();
        getTableData(null, null, null, null, null, 0, 0, globalTakes, true, floatingFilterData)
    }


    return (
        <Fragment>

            <div className="container-fluid">
                {!isDashboard && <ScrollToTop pointProp={"approval-go-to-top"} />}

                {/* {loader && <LoaderCustom />} */}
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
                                <button
                                    title="Send For Approval"
                                    class="user-btn approval-btn"
                                    onClick={sendForApproval}
                                    disabled={approvalList && (approvalList.length === 0 || isFinalApprover) ? true : false}
                                >
                                    <div className="send-for-approval mr-0" ></div>
                                </button>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <div className={`ag-grid-react custom-pagination`}>
                            <div className={`ag-grid-wrapper height-width-wrapper min-height-auto ${approvalList && approvalList?.length <= 0 ? "overlay-contain" : ""}`}>
                                <div className="ag-grid-header">
                                    <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                                </div>
                                <div className={`ag-theme-material`}>
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
                                        // rowSelection={'multiple'}
                                        onSelectionChanged={onRowSelect}
                                        isRowSelectable={isRowSelectable}
                                    >
                                        <AgGridColumn width="145" field="SupplierID" hide dataAlign="center" searchable={false} ></AgGridColumn>
                                        <AgGridColumn width="145" cellClass="has-checkbox" field="ApprovalNumber" cellRenderer="linkableFormatter" headerName="Token No."></AgGridColumn>
                                        <AgGridColumn width="145" field="ReasonForRequest" headerName='Type'></AgGridColumn>
                                        <AgGridColumn width="145" field="Plant" headerName='Plant'></AgGridColumn>
                                        <AgGridColumn width="145" field="VendorCode" headerName='Supplier Code'></AgGridColumn>
                                        <AgGridColumn width="145" field="VendorName" headerName='Supplier Name' ></AgGridColumn>
                                        <AgGridColumn width="145" field="Category" headerName='Category'></AgGridColumn>
                                        <AgGridColumn width="140" field="EffectiveDate" cellRenderer='effectiveDateRenderer' filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                                        <AgGridColumn width="150" field="RequestedBy" cellRenderer='createdOnFormatter' headerName="Created By"></AgGridColumn>
                                        <AgGridColumn width="160" field="LastApprovedBy" cellRenderer='requestedOnFormatter' headerName="Last Approved by"></AgGridColumn>
                                        {!isApproval && <AgGridColumn headerClass="justify-content-center" pinned="right" cellClass="text-center" field="Status" tooltipField="TooltipText" cellRenderer='statusFormatter' headerName="Status" floatingFilterComponent="statusFilter" floatingFilterComponentParams={floatingFilterStatus}></AgGridColumn>}

                                    </AgGridReact>
                                    <div className='button-wrapper'>
                                        {<PaginationWrappers gridApi={gridApi} totalRecordCount={totalRecordCount} getDataList={getTableData} floatingFilterData={floatingFilterData} module="RM" />}
                                        {(props?.isMasterSummaryDrawer === undefined || props?.isMasterSummaryDrawer === false) &&
                                            <PaginationControls totalRecordCount={totalRecordCount} getDataList={getTableData} floatingFilterData={floatingFilterData} module="RM" />

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
                    showApprovalSummary &&
                    <SummaryDrawer
                        isOpen={showApprovalSummary}
                        closeDrawer={closeDrawer}
                        approvalData={approvalData}
                        anchor={'bottom'}
                        masterId={SUPPLIER_MANAGEMENT_ID}
                    />
                }

            </div>
        </Fragment>


    );
}

export default ApprovalListing;
