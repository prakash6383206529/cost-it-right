import { AgGridColumn, AgGridReact } from "ag-grid-react";
import React, { useState } from "react";
import { PaginationWrapper } from "../../../common/commonPagination";
import { EMPTY_DATA } from "../../../../config/constants";
import NoContentFound from "../../../common/NoContentFound";
const gridOptions = {};
const DUMMY_DATA = [
    {
        RMName: 'RM00ARC-1002',
        Material: 'Online',
        NoOfPart: 5
    },
    {
        RMName: 'RM00PRC-1005',
        Material: 'Online',
        NoOfPart: 1
    },
    {
        RMName: 'RM20ARC-1222',
        Material: 'Offline',
        NoOfPart: 6
    },
    {
        RMName: 'RM70ARC-1242',
        Material: 'Offline',
        NoOfPart: 14
    },
    {
        RMName: 'RM10ARC-3002',
        Material: 'Online',
        NoOfPart: 70
    },
    {
        RMName: 'RM06TRP-1002',
        Material: 'Offline',
        NoOfPart: 12
    },
    {
        RMName: 'RM00ARC-1042',
        Material: 'Online',
        NoOfPart: 11
    },
    {
        RMName: 'RM00ARC-1042',
        Material: 'Online',
        NoOfPart: 2
    },
    {
        RMName: 'RM00ARC-1042',
        Material: 'Online',
        NoOfPart: 0
    },
    {
        RMName: 'RM00ARC-1042',
        Material: 'Online',
        NoOfPart: 9
    },
    {
        RMName: 'RM00ARC-1042',
        Material: 'Online',
        NoOfPart: 9
    },
    {
        RMName: 'RM00ARC-1042',
        Material: 'Online',
        NoOfPart: 9
    },
    {
        RMName: 'RM00ARC-1042',
        Material: 'Online',
        NoOfPart: 9
    }
]
const MasterUserage = () => {
    const [gridApi, setgridApi] = useState(null);
    const [gridColumnApi, setgridColumnApi] = useState(null)
    const [rowData, setRowData] = useState(DUMMY_DATA)
    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }
    const resetState = () => {

    }
    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));

    };

    const onGridReady = (params) => {
        setgridApi(params.api);
        setgridColumnApi(params.columnApi);
        params.api.paginationGoToPage(0);
        params.api.sizeColumnsToFit()
    };

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
    };

    const statusFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const classNames = cell === 'Online' ? 'Approved' : 'Error'
        return <div className={classNames}>{cell}</div>
    }
    const frameworkComponents = {
        customNoRowsOverlay: NoContentFound,
        statusFormatter: statusFormatter,
    }


    return (
        <div className="seprate-box">
            <div className="d-flex justify-content-between align-items-center">
                <h6>RM Usage</h6>
                <div className="d-flex">
                    <input type="text" className={`form-control table-search w-auto border ${window.screen.width >= 1440 ? 'custom-height-34px' : 'custom-height-28px'}`} id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                    <button type="button" className="user-btn ml-1" title="Reset Grid" onClick={() => resetState()}>
                        <div className="refresh mr-0"></div>
                    </button>
                </div>
            </div>

            <div className={`ag-grid-react mt-3`}>
                <div className={`ag-grid-wrapper ${(rowData && rowData?.length <= 0) ? 'overlay-contain' : ''}`}>
                    <div className={`ag-theme-material`}>
                        {/* {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />} */}
                        <AgGridReact
                            style={{ height: '100%', width: '100%' }}
                            defaultColDef={defaultColDef}
                            floatingFilter={true}
                            domLayout='autoHeight'
                            rowData={rowData}
                            pagination={true}
                            paginationPageSize={9}
                            onGridReady={onGridReady}
                            gridOptions={gridOptions}
                            noRowsOverlayComponent={'customNoRowsOverlay'}
                            noRowsOverlayComponentParams={{
                                title: EMPTY_DATA,
                                imagClass: 'imagClass'
                            }}
                            frameworkComponents={frameworkComponents}
                            rowSelection={'multiple'}
                            suppressRowClickSelection={true}
                            enableBrowserTooltips={true}
                        >
                            <AgGridColumn field="RMName" headerName='RM Name' cellRenderer='dateFormatter'></AgGridColumn>
                            <AgGridColumn field="Material" headerName="Material" tooltipField="tooltipText" minWidth={170} cellRenderer="statusFormatter"></AgGridColumn>
                            <AgGridColumn field="NoOfPart" headerName='No. of Part'></AgGridColumn>

                        </AgGridReact>
                        <PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={10} />
                    </div>
                </div>

            </div >
        </div>
    );
}
export default MasterUserage;