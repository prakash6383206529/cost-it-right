import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { useDispatch, useSelector } from 'react-redux'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import LoaderCustom from '../../common/LoaderCustom'
import NoContentFound from '../../common/NoContentFound';
import DayTime from '../../common/DayTimeWrapper'
import { IsShowFreightAndShearingCostFields, checkForDecimalAndNull, getConfigurationKey, loggedInUserId, userDetails } from '../../../helper'
import { defaultPageSize, EMPTY_DATA, PENDING } from '../../../config/constants';
import { getRMApprovalList } from '../actions/Material';
import SummaryDrawer from '../SummaryDrawer';
import { DRAFT, RM_MASTER_ID } from '../../../config/constants';
import MasterSendForApproval from '../MasterSendForApproval';
import WarningMessage from '../../common/WarningMessage';
import { debounce } from 'lodash'
import Toaster from '../../common/Toaster'
import { masterFinalLevelUser } from '../actions/Material'
import { PaginationWrapper } from '../../common/commonPagination';
import { useLabels } from '../../../helper/core';

const gridOptions = {};

function RMApproval(props) {

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
    const dispatch = useDispatch()
    const { technologyLabel, vendorLabel } = useLabels();
    useEffect(() => {
        getTableData()
        let obj = {
            MasterId: RM_MASTER_ID,
            DepartmentId: userDetails().DepartmentId,
            LoggedInUserLevelId: userDetails().LoggedInMasterLevelId,
            LoggedInUserId: loggedInUserId()
        }

        dispatch(masterFinalLevelUser(obj, (res) => {


            if (res.data.Result) {
                setIsFinalApprover(res.data.Data.IsFinalApprovar)
            }
        }))
    }, [])

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



    /**
* @method getTableData
* @description getting approval list table
*/

    const getTableData = () => {
        //  API CALL FOR GETTING RM APPROVAL LIST
        dispatch(getRMApprovalList((res) => {
            setLoader(false)
        }))
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

                {cell != null ? checkForDecimalAndNull(cell, initialConfiguration && initialConfiguration?.NoOfDecimalForPrice) : ''}
            </>
        )
    }

    const oldpriceFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>

                {cell != null ? checkForDecimalAndNull(cell, initialConfiguration && initialConfiguration?.NoOfDecimalForPrice) : ''}
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

        return (
            <Fragment>
                {
                    row.Status !== DRAFT ?
                        <div onClick={() => viewDetails(row.ApprovalNumber, row.ApprovalProcessId)} className={row.Status !== DRAFT ? 'link' : ''}>
                            {row.ApprovalNumber || row.ApprovalNumber === 0 ? row.ApprovalNumber : "-"}
                        </div> :
                        row.ApprovalNumber || row.ApprovalNumber === 0 ? row.ApprovalNumber : "-"
                }
            </Fragment>
        )
    }


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

    const isFirstColumn = (params) => {
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;

        return thisIsFirstColumn;
    }

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

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
        headerCheckboxSelection: isFirstColumn,
        checkboxSelection: isFirstColumn
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);

    };

    const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;

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
        effectiveDateRenderer: effectiveDateFormatter
    };

    const isRowSelectable = (rowNode) => {
        if (rowNode?.data?.Status === DRAFT) {
            return true;
        } else {
            return false
        }
    }

    return (
        <div className='min-height100vh'>
            {loader && <LoaderCustom />}
            <Row className="pt-4 blue-before">
                <Col md="6" lg="6" className="search-user-block mb-3">
                    <div className="d-flex justify-content-end bd-highlight w100">
                        <div>

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
                                    paginationPageSize={defaultPageSize}
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
                                    onSelectionChanged={onRowSelect}
                                    isRowSelectable={isRowSelectable}
                                >
                                    <AgGridColumn width="145" field="CostingId" hide dataAlign="center" searchable={false} ></AgGridColumn>
                                    <AgGridColumn width="145" cellClass="has-checkbox" field="ApprovalNumber" cellRenderer='linkableFormatter' headerName="Token No."></AgGridColumn>
                                    <AgGridColumn width="145" field="CostingHead" headerName='Head'></AgGridColumn>
                                    <AgGridColumn width="145" field="ApprovalProcessId" hide></AgGridColumn>
                                    <AgGridColumn width="145" field="TechnologyName" headerName={technologyLabel}></AgGridColumn>
                                    <AgGridColumn width="145" field="RawMaterial" ></AgGridColumn>
                                    <AgGridColumn width="145" field="RMGrade"></AgGridColumn>
                                    <AgGridColumn width="150" field="RMSpec"></AgGridColumn>
                                    <AgGridColumn width="140" field="Category"></AgGridColumn>
                                    <AgGridColumn width="140" field="MaterialType"></AgGridColumn>
                                    <AgGridColumn field="Plant"></AgGridColumn>
                                    <AgGridColumn field="VendorName" headerName={`${vendorLabel} (Code)`}></AgGridColumn>
                                    <AgGridColumn width="140" field="UOM"></AgGridColumn>
                                    <AgGridColumn width="140" field="BasicRate"></AgGridColumn>
                                    <AgGridColumn width="140" field="ScrapRate"></AgGridColumn>
                                    {IsShowFreightAndShearingCostFields() && (
                                        <>
                                            <AgGridColumn width="155" field="RMFreightCost" cellRenderer='freightCostFormatter'></AgGridColumn>
                                            <AgGridColumn width="165" field="RMShearingCost" cellRenderer='shearingCostFormatter'></AgGridColumn>
                                        </>
                                    )}
                                    <AgGridColumn width="165" field="NetLandedCost" cellRenderer='costFormatter'></AgGridColumn>
                                    <AgGridColumn width="140" field="EffectiveDate" cellRenderer='effectiveDateRenderer' filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                                    <AgGridColumn width="150" field="RequestedBy" cellRenderer='createdOnFormatter' headerName="Initiated By"></AgGridColumn>
                                    <AgGridColumn width="150" field="CreatedByName" cellRenderer='createdOnFormatter' headerName="Created By"></AgGridColumn>
                                    <AgGridColumn width="160" field="LastApprovedBy" cellRenderer='requestedOnFormatter' headerName="Last Approved by"></AgGridColumn>
                                    <AgGridColumn headerClass="justify-content-center" pinned="right" cellClass="text-center" floatingFilter={false} field="Status" cellRenderer='statusFormatter' headerName="Status" ></AgGridColumn>
                                </AgGridReact>
                                {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
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
                    masterId={RM_MASTER_ID}
                />
            }
            {
                approvalDrawer &&
                <MasterSendForApproval
                    isOpen={approvalDrawer}
                    closeDrawer={closeApprovalDrawer}
                    isEditFlag={false}
                    masterId={RM_MASTER_ID}
                    type={'Sender'}
                    anchor={"right"}
                    isBulkUpload={true}
                    approvalData={selectedRowData}
                />
            }
        </div>

    );
}

export default RMApproval;
// HP3-I1368