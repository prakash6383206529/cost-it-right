import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from "react-router-dom";
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import LoaderCustom from '../../common/LoaderCustom'
import NoContentFound from '../../common/NoContentFound';
import moment from 'moment'
import { checkForDecimalAndNull, getConfigurationKey } from '../../../helper'
import { CONSTANT } from '../../../helper/AllConastant';
import { getRMApprovalList } from '../actions/Material';
import SummaryDrawer from '../SummaryDrawer';
import { DRAFT, RM_MASTER_ID } from '../../../config/constants';
import MasterSendForApproval from '../MasterSendForApproval';



const gridOptions = {};

function RMApproval(props) {

    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [rowData, setRowData] = useState(null);
    const [selectedRowData, setSelectedRowData] = useState([]);
    const [approvalData, setApprovalData] = useState('')
    const [showApprovalSumary, setShowApprovalSummary] = useState(false)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const { approvalList } = useSelector((state) => state.material)
    const [approvalDrawer, setApprovalDrawer] = useState(false)
    const [approvalObj, setApprovalObj] = useState([])
    const [loader, setLoader] = useState(true)
    const dispatch = useDispatch()

    useEffect(() => {
        getTableData()
    }, [])


    var filterParams = {
        comparator: function (filterLocalDateAtMidnight, cellValue) {
            var dateAsString = cellValue != null ? moment(cellValue).format('DD/MM/YYYY') : '';
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
                {/* <img className={`${row.OldPOPrice > row.NetPOPrice ? 'arrow-ico mr-1 arrow-green' : 'mr-1 arrow-ico arrow-red'}`} src={row.OldPOPrice > row.NetPOPrice ? imgArrowDown : imgArrowUP} alt="arro-up" /> */}
                {cell != null ? checkForDecimalAndNull(cell, initialConfiguration && initialConfiguration.NoOfDecimalForPrice) : ''}
            </>
        )
    }

    const oldpriceFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                {/* <img className={`${row.OldPOPrice > row.NetPOPrice ? 'arrow-ico mr-1 arrow-green' : 'mr-1 arrow-ico arrow-red'}`} src={row.OldPOPrice > row.NetPOPrice ? imgArrowDown : imgArrowUP} alt="arro-up" /> */}
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
        return cellValue != null ? moment(cellValue).format('DD/MM/yyyy') : '';
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
        // props.closeDashboard()

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
                            {row.ApprovalNumber === 0 ? '-' : row.ApprovalNumber}
                        </div> :
                        row.ApprovalNumber === 0 ? '-' : row.ApprovalNumber
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
        setLoader(true)
        getTableData()
    }
    const closeApprovalDrawer = (e = '') => {
        setApprovalDrawer(false)
        setLoader(true)
        getTableData()
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
        setApprovalDrawer(true)
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

        // var allColumnIds = [];
        // params.columnApi.getAllColumns().forEach(function (column) {
        //     allColumnIds.push(column.colId);
        // });
        // params.columnApi.autoSizeColumns(allColumnIds);

    };

    const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const frameworkComponents = {
        renderPlant: renderPlant,
        renderVendor: renderVendor,
        renderVendor: renderVendor,
        priceFormatter: priceFormatter,
        oldpriceFormatter: oldpriceFormatter,
        createdOnFormatter: createdOnFormatter,
        requestedOnFormatter: requestedOnFormatter,
        statusFormatter: statusFormatter,
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
        costingHeadRenderer: costingHeadFormatter,
        costFormatter: costFormatter,
        freightCostFormatter: freightCostFormatter,
        shearingCostFormatter: shearingCostFormatter,
        effectiveDateFormatter: effectiveDateFormatter,
        linkableFormatter: linkableFormatter,
        effectiveDateRenderer: effectiveDateFormatter



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
                                        title: CONSTANT.EMPTY_DATA,
                                    }}
                                    frameworkComponents={frameworkComponents}
                                    suppressRowClickSelection={true}
                                    rowSelection={'multiple'}
                                    onSelectionChanged={onRowSelect}
                                    isRowSelectable={isRowSelectable}
                                >
                                    <AgGridColumn width="145" field="CostingId" hide dataAlign="center" searchable={false} ></AgGridColumn>
                                    <AgGridColumn width="145" cellClass="has-checkbox" field="ApprovalProcessId" cellRenderer='linkableFormatter' headerName="Token No."></AgGridColumn>
                                    <AgGridColumn width="145" field="CostingHead" headerName='Head' cellRenderer={'costingHeadRenderer'}></AgGridColumn>
                                    <AgGridColumn width="145" field="ApprovalProcessId" hide></AgGridColumn>
                                    <AgGridColumn width="145" field="TechnologyName" headerName='Technology'></AgGridColumn>
                                    <AgGridColumn width="145" field="RawMaterial" ></AgGridColumn>
                                    <AgGridColumn width="145" field="RMGrade"></AgGridColumn>
                                    <AgGridColumn width="150" field="RMSpec"></AgGridColumn>
                                    <AgGridColumn width="140" field="Category"></AgGridColumn>
                                    <AgGridColumn width="140" field="MaterialType"></AgGridColumn>
                                    <AgGridColumn field="Plant"></AgGridColumn>
                                    <AgGridColumn field="VendorName" headerName="Vendor(Code)"></AgGridColumn>
                                    <AgGridColumn width="140" field="UOM"></AgGridColumn>
                                    <AgGridColumn width="140" field="BasicRate"></AgGridColumn>
                                    <AgGridColumn width="140" field="ScrapRate"></AgGridColumn>
                                    <AgGridColumn width="155" field="RMFreightCost" cellRenderer='freightCostFormatter'></AgGridColumn>
                                    <AgGridColumn width="165" field="RMShearingCost" cellRenderer='shearingCostFormatter'></AgGridColumn>
                                    <AgGridColumn width="165" field="NetLandedCost" cellRenderer='costFormatter'></AgGridColumn>
                                    <AgGridColumn width="140" field="EffectiveDate" cellRenderer='effectiveDateRenderer' filter="agDateColumnFilter" filterParams={filterParams}></AgGridColumn>
                                    <AgGridColumn width="150" field="RequestedBy" cellRenderer='createdOnFormatter' headerName="Initiated By"></AgGridColumn>
                                    <AgGridColumn width="150" field="CreatedByName" cellRenderer='createdOnFormatter' headerName="Created By"></AgGridColumn>
                                    <AgGridColumn width="160" field="LastApprovedBy" cellRenderer='requestedOnFormatter' headerName="Last Approved by"></AgGridColumn>
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