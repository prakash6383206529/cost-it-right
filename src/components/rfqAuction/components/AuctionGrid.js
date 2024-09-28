import React, { useState } from "react";
import { Row, Col } from "reactstrap";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";
import NoContentFound from "../../common/NoContentFound";
import { AuctionClosedId, AuctionLiveId, defaultPageSize, EMPTY_DATA } from "../../../config/constants";
import { PaginationWrapper } from "../../common/commonPagination";
import { useDispatch, useSelector } from "react-redux";
import { addTime } from "../../../helper";
import Button from "../../layout/Button";
import { ShowBidWindow } from "../actions/RfqAuction";
import DayTime from "../../common/DayTimeWrapper";
import { hyphenFormatter } from "../../masters/masterUtil";
import { useLabels } from "../../../helper/core";

const gridOptions = {};
const AuctionGrid = (props) => {
    const { auctionlistId, ViewRMAccessibility, AddAccessibility, loader } = props
    const { AuctionList } = useSelector(state => state.Auction);
    const [state, setState] = useState({
        gridApi: null,
        gridColumnApi: null,
        isLoader: false,
        noData: false,
    });
    const dispatch = useDispatch()
    const { technologyLabel,vendorLabel } = useLabels();
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
        dispatch(ShowBidWindow({ showBidWindow: true, QuotationAuctionId: QuotationAuctionId, AuctionStatusId: auctionlistId }))
    }

    const buttonFormatter = (props) => {
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

        return (
            ViewRMAccessibility && (
                <Button
                    id={`auction_view${props.rowIndex}`}
                    className={"mr-1 Tour_List_View"}
                    variant="View"
                    onClick={() => viewBid(rowData.QuotationAuctionId)}
                    title={"View"}
                />
            )
        );
    };
    const dateAndTimeFormatter = (props, cell, row, enumObject, rowIndex) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY HH:mm') : '-';
    };
    const dateFormatter = (props, cell, row, enumObject, rowIndex) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '-';
    };
    const durationFormatter = (props, cell, row, enumObject, rowIndex) => {
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        const totalTime = addTime(rowData.AuctionDuration, rowData.TotalAuctionExtensionDuration)
        return totalTime ? totalTime : '-';
    };


    const resetState = () => {
        const searchBox = document.getElementById("filter-text-box");
        if (searchBox) {
            searchBox.value = ""; // Reset the input field's value
        }
        state.gridApi.setQuickFilter(null);
        state.gridApi.deselectAll();
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);
    }
    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        customNoRowsOverlay: NoContentFound,
        dateAndTimeFormatter: dateAndTimeFormatter,
        dateFormatter: dateFormatter,
        durationFormatter: durationFormatter,
        hyphenFormatter: hyphenFormatter,

    };

    return <>
        <Row className={`ag-grid-react`}>
            <Col>
                <Row className="my-2">
                    <Col md="6"> <input
                        type="text"
                        className="form-control table-search"
                        id="filter-text-box"
                        placeholder="Search"
                        autoComplete={"off"}
                        onChange={(e) => onFilterTextBoxChanged(e)}
                    /></Col>
                    <Col md="6"><div className="d-flex justify-content-end">
                        {auctionlistId === AuctionLiveId && AddAccessibility && <Button
                            id="rmDomesticListing_add"
                            className={"mr5 Tour_List_Add"}
                            onClick={props.formToggle}
                            title={"Add"}
                            icon={"plus"}
                        />}
                        <button
                            type="button"
                            className="user-btn Tour_List_Reset "
                            title="Reset Grid"
                            onClick={resetState}
                        >
                            <div className="refresh mr-0"></div>
                        </button>
                    </div></Col>
                </Row>
                <div className={`ag-grid-wrapper height-width-wrapper ${AuctionList.length === 0 ? "overlay-contain" : ""}`}>
                    <div className={`ag-theme-material ${loader && "max-loader-height"}`}>
                        {state.noData && (
                            <NoContentFound
                                title={EMPTY_DATA}
                                customClassName="no-content-found"
                            />
                        )}
                        {!loader ? <AgGridReact
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
                                imagClass: 'auction-NoContent'
                            }}
                            frameworkComponents={frameworkComponents}
                            onFilterModified={onFloatingFilterChanged}
                            suppressRowClickSelection={true}
                        >
                            <AgGridColumn field="AuctionName" headerName="Auction Name" ></AgGridColumn>
                            <AgGridColumn field="RfqNumber" headerName="RFQ No." ></AgGridColumn>
                            <AgGridColumn field="AuctionStartDateTime" headerName="Auction Start" cellRenderer={"dateAndTimeFormatter"} ></AgGridColumn>
                            <AgGridColumn field="AuctionEndDateTime" headerName="Auction End" cellRenderer={"dateAndTimeFormatter"} ></AgGridColumn>
                            <AgGridColumn field="AuctionDuration" headerName="Auction Duration" cellRenderer={"durationFormatter"} ></AgGridColumn>
                            <AgGridColumn field="AuctionStartDateTime" headerName="Date" cellRenderer={"dateFormatter"}></AgGridColumn>
                            <AgGridColumn field="Technology" headerName={technologyLabel} cellRenderer={"hyphenFormatter"} ></AgGridColumn>
                            <AgGridColumn field="PartType" headerName="Part Type" cellRenderer={"hyphenFormatter"} ></AgGridColumn>
                            <AgGridColumn field="PartNumber" headerName="Part No." cellRenderer={"hyphenFormatter"} ></AgGridColumn>
                            <AgGridColumn field="RawMaterial" headerName="RM Name" cellRenderer={"hyphenFormatter"}></AgGridColumn>
                            <AgGridColumn field="RawMaterialCode" headerName="RM Grade" cellRenderer={"hyphenFormatter"} ></AgGridColumn>
                            <AgGridColumn field="RMSpecification" headerName="RM Specification" cellRenderer={"hyphenFormatter"} ></AgGridColumn>
                            <AgGridColumn field="RMCode" headerName="RM Code" cellRenderer={"hyphenFormatter"}></AgGridColumn>
                            <AgGridColumn field="BOPNumber" headerName="BOP No." cellRenderer={"hyphenFormatter"}></AgGridColumn>
                            <AgGridColumn field="BOPName" headerName="BOP Name" cellRenderer={"hyphenFormatter"} ></AgGridColumn>
                            <AgGridColumn field="BOPCategory" headerName="Category" cellRenderer={"hyphenFormatter"}></AgGridColumn>
                            <AgGridColumn field="VendorName" headerName={`${vendorLabel} Name`} cellRenderer={"hyphenFormatter"}></AgGridColumn>
                            <AgGridColumn field="Plant" headerName="Plant" cellRenderer={"hyphenFormatter"} ></AgGridColumn>
                            <AgGridColumn field="TotalVendor" headerName="Total Vendors" cellRenderer={"hyphenFormatter"}></AgGridColumn>
                            <AgGridColumn field="ActiveVendors" headerName="Active Vendors" cellRenderer={"hyphenFormatter"}></AgGridColumn>
                            <AgGridColumn field="BasePrice" headerName="Base Price" cellRenderer={"hyphenFormatter"}></AgGridColumn>
                            <AgGridColumn field="RankOnePrice" headerName="Level One Price" cellRenderer={"hyphenFormatter"}></AgGridColumn>
                            <AgGridColumn field="RankOneVendor" headerName={`Level One ${vendorLabel}`} cellRenderer={"hyphenFormatter"} ></AgGridColumn>
                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={180} headerName="Color" marryChildren={true} >
                                <AgGridColumn width={50} field="GreenCount" headerName="G" ></AgGridColumn>
                                <AgGridColumn width={50} field="YellowCount" headerName="Y" colId="GreenColor"></AgGridColumn>
                                <AgGridColumn width={50} field="RedCount" headerName="R" colId="BlueColor"></AgGridColumn>
                            </AgGridColumn>
                            {(auctionlistId === AuctionLiveId || auctionlistId === AuctionClosedId) && <AgGridColumn width={'80px'} field="QuotationPartId" cellClass="ag-grid-action-container" headerName="Action" pinned="right" type="rightAligned" floatingFilter={false} cellRenderer={"totalValueRenderer"}></AgGridColumn>}
                        </AgGridReact> : null}
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