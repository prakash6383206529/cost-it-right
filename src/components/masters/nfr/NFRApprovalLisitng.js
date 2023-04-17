import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import WarningMessage from '../../common/WarningMessage';
import { PaginationWrapper } from '../../common/commonPagination';
import { EMPTY_DATA, defaultPageSize } from '../../../config/constants';
import NfrSummaryDrawer from './NfrSumaryDrawer';

const gridOptions = {};

function NFRApprovalListing(props) {
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [singleRowData, setSingleRowData] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [rowData, setRowData] = useState([
        {
            TokenNo: '11021',
            NfrNo: '101',
            GroupName: 'Alloy',
            ProductCode: '1020',
            InitiatedBy: 'Ankit',
            CreatedBy: 'Aniket',
            LastApprovedRejected: 'Anand',
            DisplayStatus: 'PendingForApproval',

        }
    ]);
    const defaultColDef = {

        resizable: true,
        filter: true,

    };
    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
    };
    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const viewDetails = (approvalNumber, row) => {
        setIsOpen(true)
        setSingleRowData(row)
    }
    const linkableFormatter = (props) => {

        // if (selectedRowForPagination?.length > 0) {
        //     selectedRowForPagination.map((item) => {

        //         if (item.CostingId === props.node.data.CostingId) {
        //             props.node.setSelected(true)
        //         }
        //         return null
        //     })

        // }


        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <Fragment>
                {(cell === '' || cell === null) ? <div className='ml-4'>-</div> : <div onClick={() => viewDetails(cell, row)} className={'link'}>{cell}</div>}
            </Fragment>
        )
    }

    const statusFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return <div className={cell}>{row.DisplayStatus}</div>
    }

    const closeDrawer = () => {
        setIsOpen(false)
    }

    const frameworkComponents = {
        linkableFormatter: linkableFormatter,
        statusFormatter: statusFormatter,
    };

    return (
        <Fragment>

            <div className={`'container-fluid'} approval-listing-page`} id={'approval-go-to-top'}>

                <Row>
                    <Col>
                        <div className={`ag-grid-react custom-pagination`}>

                            <div id={'parentId'} className={`ag-grid-wrapper height-width-wrapper min-height-auto p-relative ${rowData.length <= 0 ? 'overlay-contain' : ''} `}>
                                <div className="ag-grid-header">
                                    <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                </div>
                                <div className="ag-theme-material">

                                    <AgGridReact
                                        floatingFilter={true}
                                        style={{ height: '100%', width: '100%' }}
                                        defaultColDef={defaultColDef}
                                        domLayout='autoHeight'
                                        // columnDefs={c}
                                        rowData={rowData}
                                        pagination={true}
                                        paginationPageSize={defaultPageSize}
                                        onGridReady={onGridReady}
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
                                        // onFilterModified={onFloatingFilterChanged}
                                        //onSelectionChanged={onRowSelect}
                                        // onRowSelected={onRowSelect}
                                        // isRowSelectable={isRowSelectable}
                                        enableBrowserTooltips={true}
                                    >
                                        <AgGridColumn cellClass="has-checkbox" field="TokenNo" cellRenderer='linkableFormatter' headerName="Token No."></AgGridColumn>
                                        <AgGridColumn field="NfrNo" headerName="Nfr No." cellRenderer='hyperLinkableFormatter' ></AgGridColumn>
                                        <AgGridColumn field="GroupName" headerName="Group Name"  ></AgGridColumn>
                                        <AgGridColumn field="PartNumber" headerName='Part No (Revision No)'></AgGridColumn>
                                        <AgGridColumn field="ProductCode" headerName="Product Code"></AgGridColumn>
                                        <AgGridColumn field="InitiatedBy" cellRenderer='renderVendor' headerName="Initiated By"></AgGridColumn>
                                        <AgGridColumn field="CreatedBy" cellRenderer='renderPlant' headerName=" Created By"></AgGridColumn>
                                        <AgGridColumn field='LastApprovedRejected' headerName="Last Approved /Rejected By"></AgGridColumn>
                                        <AgGridColumn headerClass="justify-content-center" pinned="right" cellClass="text-center" field="DisplayStatus" tooltipField="TooltipText" cellRenderer='statusFormatter' headerName="Status"></AgGridColumn>
                                    </AgGridReact>

                                    <div className='button-wrapper'>
                                        {<PaginationWrapper gridApi={gridApi} globalTake={defaultPageSize} />}
                                    </div>



                                </div>
                            </div>
                        </div>
                        <div className="text-right pb-3">
                            <WarningMessage message="It may take up to 5 minutes for the status to be updated." />
                        </div>
                    </Col>
                </Row>
            </div>
            {isOpen && <NfrSummaryDrawer isOpen={isOpen} closeDrawer={closeDrawer} anchor={"bottom"} rowData={singleRowData} />}
        </Fragment>
    )
}

export default NFRApprovalListing
