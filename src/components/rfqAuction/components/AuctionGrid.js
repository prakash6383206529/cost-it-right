import React, { useState } from "react";
import { Row, Col } from "reactstrap";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import NoContentFound from "../../common/NoContentFound";
import { AuctionLiveId, defaultPageSize, EMPTY_DATA } from "../../../config/constants";
import { PaginationWrapper } from "../../common/commonPagination";
import { useDispatch, useSelector } from "react-redux";
import { searchNocontentFilter } from "../../../helper";
import AuctionClosed from "./AuctionClosed";
import Button from "../../layout/Button";
import { ShowBidWindow } from "../actions/RfqAuction";

const gridOptions = {};
const AuctionGrid = (props) => {
    const { auctionlistId } = props
    const { AuctionList } = useSelector(state => state.Auction);
    const [state, setState] = useState({
        gridApi: null,
        gridColumnApi: null,
        isLoader: false,
        noData: false,
    });
    const dispatch = useDispatch()
    const onFloatingFilterChanged = (value) => {

    };

    const onGridReady = (params) => {
        setState((prevState) => ({
            ...prevState,
            gridApi: params.api,
            gridColumnApi: params.columnApi,
        }));
        params.api.paginationGoToPage(0);
        // params.api.sizeColumnsToFit();
    };
    const onFilterTextBoxChanged = (e) => {
        state.gridApi.setQuickFilter(e.target.value);
        if (
            e.target.value === "" ||
            e.target.value === null ||
            e.target.value === undefined
        ) {
            // resetState();
        }
    };

    const onPageSizeChanged = (newPageSize) => {
        state.gridApi.paginationSetPageSize(Number(newPageSize));
    };
    // const isFirstColumn = (params) => {
    //     var displayedColumns = params.columnApi.getAllDisplayedColumns();
    //     var thisIsFirstColumn = displayedColumns[0] === params.column;
    //     return thisIsFirstColumn;
    // };

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        headerCheckboxSelectionFilteredOnly: false,
        // checkboxSelection: isFirstColumn,
    };

    const viewBid = (QuotationAuctionId) => {
        dispatch(ShowBidWindow({ showBidWindow: true, QuotationAuctionId: QuotationAuctionId }))
    }

    const buttonFormatter = (props) => {
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        return <Button
            id={`auction_view${props.rowIndex}`}
            className={"mr-1 Tour_List_View"}
            variant="View"
            onClick={() => viewBid(rowData.QuotationAuctionId)}
            title={"View"}
        />
    };
    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        customNoRowsOverlay: NoContentFound,
    };

    return <>
        <Row className={`ag-grid-react`}>
            <Col>
                <div
                    className={`ag-grid-wrapper height-width-wrapper ${AuctionList.length === 0 ? "overlay-contain" : ""}`}>
                    <div className="ag-grid-header">
                        <input
                            type="text"
                            className="form-control table-search"
                            id="filter-text-box"
                            placeholder="Search"
                            autoComplete={"off"}
                            onChange={(e) => onFilterTextBoxChanged(e)}
                        />
                    </div>
                    <div className={`ag-theme-material ${state.isLoader && "max-loader-height"}`}>
                        {state.noData && (
                            <NoContentFound
                                title={EMPTY_DATA}
                                customClassName="no-content-found"
                            />
                        )}
                        <AgGridReact
                            defaultColDef={defaultColDef}
                            floatingFilter={true}
                            domLayout="autoHeight"
                            // columnDefs={c}
                            rowData={AuctionList}
                            pagination={true}
                            paginationPageSize={defaultPageSize}
                            onGridReady={onGridReady}
                            gridOptions={gridOptions}
                            // rowSelection={"multiple"}
                            // onSelectionChanged={onRowSelect}
                            noRowsOverlayComponent={"customNoRowsOverlay"}
                            noRowsOverlayComponentParams={{
                                title: EMPTY_DATA,
                            }}
                            frameworkComponents={frameworkComponents}
                            onFilterModified={onFloatingFilterChanged}
                            suppressRowClickSelection={true}
                        >
                            <AgGridColumn field="AuctionName" headerName="Auction Name" ></AgGridColumn>
                            <AgGridColumn field="RfqNumber" headerName="RFQ No." ></AgGridColumn>
                            <AgGridColumn field="Technology" headerName="Technology" ></AgGridColumn>
                            <AgGridColumn field="PartType" headerName="Part Type"  ></AgGridColumn>
                            <AgGridColumn field="PartNumber" headerName="Part No." ></AgGridColumn>
                            <AgGridColumn field="RawMaterial" headerName="RM Name" ></AgGridColumn>
                            <AgGridColumn field="RawMaterialCode" headerName="RM Grade" ></AgGridColumn>
                            <AgGridColumn field="RMSpecification" headerName="RM Specification" ></AgGridColumn>
                            <AgGridColumn field="RMCode" headerName="RM Code" ></AgGridColumn>
                            <AgGridColumn field="BOPNumber" headerName="BOP No." ></AgGridColumn>
                            <AgGridColumn field="BOPName" headerName="BOP Name" ></AgGridColumn>
                            <AgGridColumn field="BOPCategory" headerName="Category" ></AgGridColumn>
                            <AgGridColumn field="VendorName" headerName="Vendor Name" ></AgGridColumn>
                            <AgGridColumn field="Plant" headerName="Plant" ></AgGridColumn>
                            <AgGridColumn field="Date" headerName="Date"></AgGridColumn>
                            <AgGridColumn field="TotalAuctionExtensionDuration" headerName="Time"></AgGridColumn>
                            <AgGridColumn field="TotalVendor" headerName="Total Vendors" ></AgGridColumn>
                            <AgGridColumn field="ActiveVendors" headerName="Active Vendors" ></AgGridColumn>
                            <AgGridColumn field="BasePrice" headerName="Base Price" ></AgGridColumn>
                            <AgGridColumn field="RankOnePrice" headerName="Level One Price" ></AgGridColumn>
                            <AgGridColumn field="RankOneVendor" headerName="Level One Vendor" ></AgGridColumn>
                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={180} headerName="Color Codes" marryChildren={true} >
                                <AgGridColumn width={50} field="GreenCount" headerName="R" ></AgGridColumn>
                                <AgGridColumn width={50} field="YellowCount" headerName="Y" colId="GreenColor"></AgGridColumn>
                                <AgGridColumn width={50} field="RedCount" headerName="B" colId="BlueColor"></AgGridColumn>
                            </AgGridColumn>
                            {(auctionlistId === AuctionLiveId || auctionlistId === AuctionClosed) && <AgGridColumn width={'80px'} field="QuotationPartId" cellClass="ag-grid-action-container" headerName="Action" pinned="right" type="rightAligned" floatingFilter={false} cellRenderer={"totalValueRenderer"}></AgGridColumn>}
                        </AgGridReact>
                        {
                            <PaginationWrapper
                                gridApi={state.gridApi}
                                setPage={onPageSizeChanged}
                            />
                        }
                    </div>
                </div>
            </Col>
        </Row>
    </>
}
export default AuctionGrid;