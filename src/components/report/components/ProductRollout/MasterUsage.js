import { AgGridColumn, AgGridReact } from "ag-grid-react";
import React, { useState } from "react";
import { PaginationWrapper } from "../../../common/commonPagination";
import { EMPTY_DATA, EMPTY_GUID } from "../../../../config/constants";
import NoContentFound from "../../../common/NoContentFound";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getUsageRmDetails } from "../../actions/ReportListing";
import LoaderCustom from "../../../common/LoaderCustom";
const gridOptions = {};

const MasterUsage = ({ productId }) => {
    const [gridApi, setgridApi] = useState(null);
    const [gridColumnApi, setgridColumnApi] = useState(null)
    const [rowData, setRowData] = useState([])
    const [isLoader, setIsLoader] = useState(false)
    const dispatch = useDispatch();
    useEffect(() => {
        setIsLoader(true)
        dispatch(getUsageRmDetails(productId, (res) => {
            setIsLoader(false)
            if (res && res.status === 200) {
                setRowData(res.data.Data)
            } else {
                setRowData([])
            }
        }))
    }, [productId])
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
                        {isLoader && <LoaderCustom />}
                        {/* {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />} */}
                        <AgGridReact
                            style={{ height: '100%', width: '100%' }}
                            defaultColDef={defaultColDef}
                            floatingFilter={true}
                            domLayout='autoHeight'
                            rowData={rowData}
                            pagination={true}
                            paginationPageSize={5}
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
                            <AgGridColumn field="RMCode" headerName='RM Name' cellRenderer='dateFormatter'></AgGridColumn>
                            {/* <AgGridColumn field="Material" headerName="Material" tooltipField="tooltipText" minWidth={170} cellRenderer="statusFormatter"></AgGridColumn> */}
                            <AgGridColumn field="PartCount" headerName='No. of Part'></AgGridColumn>

                        </AgGridReact>
                        <PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={5} />
                    </div>
                </div>

            </div >
        </div>
    );
}
MasterUsage.defualtProps = {
    productId: EMPTY_GUID
}
export default React.memo(MasterUsage);
