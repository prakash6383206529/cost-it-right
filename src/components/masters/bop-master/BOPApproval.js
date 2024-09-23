import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { useDispatch, useSelector } from 'react-redux'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import LoaderCustom from '../../common/LoaderCustom'
import { defaultPageSize, EMPTY_DATA } from '../../../config/constants';
import { DRAFT, BOP_MASTER_ID } from '../../../config/constants';
import { getBOPApprovalList } from '../actions/BoughtOutParts'
import DayTime from '../../common/DayTimeWrapper'
import SummaryDrawer from '../SummaryDrawer';
import Toaster from '../../common/Toaster'
import MasterSendForApproval from '../MasterSendForApproval';
import { masterFinalLevelUser } from '../actions/Material'
import { getConfigurationKey, loggedInUserId, showBopLabel, userDetails } from '../../../helper'
import NoContentFound from '../../common/NoContentFound';
import { PaginationWrapper } from '../../common/commonPagination';
import { reactLocalStorage } from 'reactjs-localstorage';
import { useLabels } from '../../../helper/core';




const gridOptions = {};

function BOPApproval(props) {
    const { vendorLabel } = useLabels();
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [selectedRowData, setSelectedRowData] = useState([]);
    const [approvalData, setApprovalData] = useState('')
    const { approvalList } = useSelector((state) => state.material)
    const { BopApprovalList } = useSelector((state) => state.boughtOutparts)
    const [loader, setLoader] = useState(false)
    const [approvalDrawer, setApprovalDrawer] = useState(false)
    const [showApprovalSumary, setShowApprovalSummary] = useState(false)
    const [isFinalApprover, setIsFinalApprover] = useState(false)
    const dispatch = useDispatch()

    useEffect(() => {
        getTableData()

        let obj = {
            MasterId: BOP_MASTER_ID,
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


    /**
* @method getTableData
* @description getting approval list table
*/

    const getTableData = () => {
        //  API CALL FOR GETTING RM APPROVAL LIST
        setLoader(true)
        dispatch(getBOPApprovalList((res) => {
            setLoader(false)
        }))


    }



    const closeApprovalDrawer = (e = '', type) => {
        setApprovalDrawer(false)
        if (type === 'submit') {
            setLoader(true)
            getTableData()
        }
        setLoader(false)
    }



    const statusFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return <div className={cell}>{row.DisplayStatus}</div>
    }



    const viewDetails = (approvalNumber = '', approvalProcessId = '') => {
        setApprovalData({ approvalProcessId: approvalProcessId, approvalNumber: approvalNumber })
        setShowApprovalSummary(true)
        // props.closeDashboard()

    }


    const closeDrawer = (e = '') => {
        setShowApprovalSummary(false)
        setLoader(false)
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
  * @method linkableFormatter
  * @description Renders Name link
  */
    const linkableFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
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



    const onRowSelect = () => {
        var selectedRows = gridApi.getSelectedRows();
        setSelectedRowData(selectedRows)
    }

    const isFirstColumn = (params) => {
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;

        return thisIsFirstColumn;
    }

    const resetState = () => {
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);
        getTableData()
    }

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
        gridApi.paginationSetPageSize(Number(newPageSize));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const frameworkComponents = {

        statusFormatter: statusFormatter,
        linkableFormatter: linkableFormatter,
        effectiveDateRenderer: effectiveDateFormatter,
        customNoRowsOverlay: NoContentFound

    };

    const isRowSelectable = rowNode => rowNode.data ? rowNode.data.Status === DRAFT : false



    return (
        <div className='min-height100vh'>
            {loader && <LoaderCustom />}
            <Row className="pt-4 blue-before">
                <Col md="6" lg="6" className="search-user-block mb-3">
                    <div className="d-flex justify-content-end bd-highlight w100">
                        <div>
                            {/* <button title="send-for-approval" class="user-btn approval-btn mr5" onClick={sendForApproval}>
                      <div className="send-for-approval mr-0" ></div>
                    </button> */}
                            <button type="button" className="user-btn mr5" title="Reset Grid" onClick={resetState}>
                                <div className="refresh mr-0"></div>
                            </button>
                            <button title="Send For Approval"
                                class="user-btn approval-btn"
                                disabled={BopApprovalList && (isFinalApprover || BopApprovalList.length === 0) ? true : false}
                                onClick={sendForApproval}
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
                        <div className={`ag-grid-wrapper height-width-wrapper ${BopApprovalList && BopApprovalList?.length <= 0 ? "overlay-contain" : ""}`}>
                            <div className="ag-grid-header">
                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                            </div>
                            <div className={`ag-theme-material ${loader && "max-loader-height"}`}>
                                <AgGridReact
                                    floatingFilter={true}
                                    style={{ height: '100%', width: '100%' }}
                                    defaultColDef={defaultColDef}
                                    domLayout='autoHeight'
                                    // columnDefs={c}
                                    rowData={BopApprovalList}
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
                                    {/* <AgGridColumn width="145" field="CostingId" hide dataAlign="center" searchable={false} ></AgGridColumn> */}
                                    <AgGridColumn width="145" cellClass="has-checkbox" field="ApprovalProcessId" cellRenderer='linkableFormatter' headerName="Token No."></AgGridColumn>
                                    <AgGridColumn width="145" field="CostingHead" headerName='Costing Head'></AgGridColumn>
                                    <AgGridColumn width="145" field="ApprovalProcessId" hide></AgGridColumn>

                                    <AgGridColumn width="145" field="BoughtOutPartNumber" headerName={`${showBopLabel()} Part No`}></AgGridColumn>
                                    <AgGridColumn width="145" field="BoughtOutPartName" headerName={`${showBopLabel()} Part Name`}></AgGridColumn>
                                    <AgGridColumn width="145" field="BoughtOutPartCategory" headerName={`${showBopLabel()} Category`}></AgGridColumn>
                                    <AgGridColumn width="150" field="UOM" headerName='UOM'></AgGridColumn>
                                    <AgGridColumn width="140" field="Specification" headerName='Specification'></AgGridColumn>
                                    <AgGridColumn width="140" field="Plants" headerName='Plant'></AgGridColumn>
                                    <AgGridColumn field="VendorName" headerName={`${vendorLabel}`}></AgGridColumn>
                                    <AgGridColumn width="140" field="BasicRate" headerName={`Basic Rate (${reactLocalStorage.getObject("baseCurrency")})`}></AgGridColumn>
                                    <AgGridColumn width="140" field="NetLandedCost" headerName={`Net Cost (${reactLocalStorage.getObject("baseCurrency")})`}></AgGridColumn>
                                    <AgGridColumn width="140" field="EffectiveDate" cellRenderer='effectiveDateRenderer' headerName="Effective Date"></AgGridColumn>


                                    <AgGridColumn headerClass="justify-content-center" pinned="right" cellClass="text-center" field="Status" cellRenderer='statusFormatter' headerName="Status" ></AgGridColumn>
                                </AgGridReact>

                                {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
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
                    masterId={BOP_MASTER_ID}
                />
            }

            {
                approvalDrawer &&
                <MasterSendForApproval
                    isOpen={approvalDrawer}
                    closeDrawer={closeApprovalDrawer}
                    isEditFlag={false}
                    masterId={BOP_MASTER_ID}
                    type={'Sender'}
                    anchor={"right"}
                    isBulkUpload={true}
                    approvalData={selectedRowData}
                />
            }

        </div>

    );
}

export default BOPApproval;