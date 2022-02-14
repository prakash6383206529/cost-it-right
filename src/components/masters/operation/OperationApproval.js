import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { useDispatch, useSelector } from 'react-redux'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import LoaderCustom from '../../common/LoaderCustom'
import { EMPTY_DATA, OPERATIONS_ID } from '../../../config/constants';
import { getOperationApprovalList } from '../actions/OtherOperation';
import { DRAFT } from '../../../config/constants';
import DayTime from '../../common/DayTimeWrapper'
import SummaryDrawer from '../SummaryDrawer';
import MasterSendForApproval from '../MasterSendForApproval';
import Toaster from '../../common/Toaster'



const gridOptions = {};

function OperationApproval(props) {

    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [selectedRowData, setSelectedRowData] = useState([]);
    const [approvalData, setApprovalData] = useState('')
    const { OperationApprovalList } = useSelector((state) => state.otherOperation)
    const [loader, setLoader] = useState(false)
    const [showApprovalSumary, setShowApprovalSummary] = useState(false)
    const [approvalDrawer, setApprovalDrawer] = useState(false)
    const dispatch = useDispatch()

    useEffect(() => {
        getTableData()

    }, [])




    const closeDrawer = (e = '') => {
        setShowApprovalSummary(false)
        setLoader(true)
        getTableData()
    }

    /**
* @method getTableData
* @description getting approval list table
*/

    const getTableData = () => {
        //  API CALL FOR GETTING RM APPROVAL LIST
        setLoader(true)
        dispatch(getOperationApprovalList((res) => {
            setLoader(false)
        }))
    }



    const closeApprovalDrawer = (e = '') => {
        setApprovalDrawer(false)
        setLoader(true)
        getTableData()

    }


    const statusFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return <div className={cell}>{row.DisplayStatus}</div>
    }




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
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const frameworkComponents = {

        statusFormatter: statusFormatter,
        linkableFormatter: linkableFormatter,
        effectiveDateRenderer: effectiveDateFormatter,

    };

    const isRowSelectable = rowNode => rowNode.data ? rowNode.data.Status === DRAFT : false

    const viewDetails = (approvalNumber = '', approvalProcessId = '') => {
        setApprovalData({ approvalProcessId: approvalProcessId, approvalNumber: approvalNumber })
        setShowApprovalSummary(true)
        // props.closeDashboard()

    }


    return (
        <div>
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
                            <button title="send-for-approval" class="user-btn approval-btn" onClick={sendForApproval}>
                                <div className="send-for-approval mr-0" ></div>
                            </button>
                        </div>
                    </div>
                </Col>
            </Row>
            <Row>
                <Col>
                    <div className={`ag-grid-react`}>
                        <div className={`ag-grid-wrapper height-width-wrapper ${OperationApprovalList && OperationApprovalList?.length <= 0 ? "overlay-contain" : ""}`}>
                            <div className="ag-grid-header">
                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                            </div>
                            <div
                                className="ag-theme-material"
                            >
                                <AgGridReact
                                    floatingFilter={true}
                                    style={{ height: '100%', width: '100%' }}
                                    defaultColDef={defaultColDef}
                                    domLayout='autoHeight'
                                    // columnDefs={c}
                                    rowData={OperationApprovalList}
                                    pagination={true}
                                    paginationPageSize={10}
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
                                    <AgGridColumn width="145" field="CostingHead" headerName='Costing Head'></AgGridColumn>
                                    <AgGridColumn width="145" field="ApprovalProcessId" hide></AgGridColumn>
                                    <AgGridColumn width="145" field="Technology" headerName='Technology'></AgGridColumn>
                                    <AgGridColumn width="145" field="OperationName" headerName='Operation Name'></AgGridColumn>
                                    <AgGridColumn width="145" field="OperationCode" headerName='Operation Code'></AgGridColumn>
                                    <AgGridColumn width="150" field="Plants" headerName='Plant (Code)'></AgGridColumn>
                                    <AgGridColumn width="180" field="VendorName" headerName='Vendor (Code)'></AgGridColumn>
                                    <AgGridColumn width="140" field="UnitOfMeasurement" headerName='UOM'></AgGridColumn>
                                    <AgGridColumn field="Rate" headerName='Rate'></AgGridColumn>
                                    <AgGridColumn field="EffectiveDate" headerName="EffectiveDate" cellRenderer='effectiveDateRenderer'></AgGridColumn>

                                    <AgGridColumn headerClass="justify-content-center" pinned="right" cellClass="text-center" field="Status" cellRenderer='statusFormatter' headerName="Status" ></AgGridColumn>
                                </AgGridReact>

                                <div className="paging-container d-inline-block float-right">
                                    <select className="form-control paging-dropdown" onChange={(e) => onPageSizeChanged(e.target.value)} id="page-size">
                                        <option value="10" selected={true}>10</option>
                                        <option value="50">50</option>
                                        <option value="100">100</option>
                                    </select>
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
                    masterId={OPERATIONS_ID}
                />
            }

            {
                approvalDrawer &&
                <MasterSendForApproval
                    isOpen={approvalDrawer}
                    closeDrawer={closeApprovalDrawer}
                    isEditFlag={false}
                    masterId={OPERATIONS_ID}
                    type={'Sender'}
                    anchor={"right"}
                    isBulkUpload={true}
                    approvalData={selectedRowData}
                />
            }

        </div>

    );
}

export default OperationApproval;