import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { useDispatch, useSelector } from 'react-redux'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import LoaderCustom from '../../common/LoaderCustom'
import { EMPTY_DATA } from '../../../config/constants';
import { getRMApprovalList } from '../actions/Material';
import { DRAFT } from '../../../config/constants';




const gridOptions = {};

function OperationApproval(props) {

    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [selectedRowData, setSelectedRowData] = useState([]);
    const [approvalData, setApprovalData] = useState('')
    const { approvalList } = useSelector((state) => state.material)
    const [loader, setLoader] = useState(true)
    const dispatch = useDispatch()

    useEffect(() => {
        getTableData()

    }, [])


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



    const statusFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return <div className={cell}>{row.DisplayStatus}</div>
    }



    const viewDetails = (approvalNumber = '', approvalProcessId = '') => {
        setApprovalData({ approvalProcessId: approvalProcessId, approvalNumber: approvalNumber })

        // props.closeDashboard()

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

    };

    const isRowSelectable = rowNode => rowNode.data ? rowNode.data.Status === DRAFT : false



    return (
        <div>
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
                    {loader && <LoaderCustom />}
                    <div className={`ag-grid-react`}>
                        <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
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
                                    rowData={approvalList}
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
                                    <AgGridColumn width="145" cellClass="has-checkbox" field="ApprovalProcessId" cellRenderer='linkableFormatter' headerName="Token No."></AgGridColumn>
                                    <AgGridColumn width="145" field="CostingHead" headerName='Costing Head'></AgGridColumn>
                                    <AgGridColumn width="145" field="ApprovalProcessId" hide></AgGridColumn>
                                    <AgGridColumn width="145" field="TechnologyName" headerName='BOP Part No'></AgGridColumn>
                                    <AgGridColumn width="145" field="RawMaterial" headerName='BOP Part Name'></AgGridColumn>
                                    <AgGridColumn width="145" field="RMGrade" headerName='BOP Category'></AgGridColumn>
                                    <AgGridColumn width="150" field="RMSpec" headerName='UOM'></AgGridColumn>
                                    <AgGridColumn width="140" field="Category" headerName='Specification'></AgGridColumn>
                                    <AgGridColumn width="140" field="MaterialType" headerName='Plant'></AgGridColumn>
                                    <AgGridColumn field="Plant" headerName='Vendor'></AgGridColumn>
                                    <AgGridColumn field="VendorName" headerName="Minimum Order Quantity"></AgGridColumn>
                                    <AgGridColumn width="140" field="UOM" headerName="Basic Rate(INR)"></AgGridColumn>
                                    <AgGridColumn width="140" field="BasicRate" headerName="Net Cost(INR)"></AgGridColumn>
                                    <AgGridColumn width="140" field="ScrapRate" headerName="Effective Date"></AgGridColumn>


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

        </div>

    );
}

export default OperationApproval;