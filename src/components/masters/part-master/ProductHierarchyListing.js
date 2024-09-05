
import React, { useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col } from "reactstrap";

import { EMPTY_DATA } from "../../../config/constants";
import NoContentFound from "../../common/NoContentFound";
import { AgGridColumn, AgGridReact } from "ag-grid-react";
import "ag-grid-community/dist/styles/ag-grid.css";
import "ag-grid-community/dist/styles/ag-theme-material.css";


import { ApplyPermission } from ".";
import { PaginationWrapper } from "../../common/commonPagination";
import AddProductHierarchy from "./AddProductHierarchy";

const gridOptions = {};

const ProductHierarchyListing = (props) => {

    const [state, setState] = useState({
        // pageNo: 1,
        gridApi: null,
        gridColumnApi: null,
        isLoader: true,
        noData: false,
        tableData: [],
        rowData: [],
        isDrawerOpen: false,
        searchText: ''
    });
    const { newPartsListing } = useSelector((state) => state.part);
    const { globalTakes } = useSelector((state) => state.pagination);
    const permissions = useContext(ApplyPermission);

    const resetState = () => {
        setState((prevState) => ({
            ...prevState,
            noData: false,
            warningMessage: false,

        }));
        setState((prevState) => ({
            ...prevState,

            isFilterButtonClicked: false,
        }));

        if (state.gridApi) {
            state.gridApi.setQuickFilter(''); // Clear the Ag-Grid quick filter
        }
        state.gridApi.deselectAll();
        gridOptions?.columnApi?.resetColumnState(null);
    };


    const formToggle = () => {
        setState((prevState) => ({ ...prevState, isDrawerOpen: !state.isDrawerOpen }));
    };

    const onGridReady = (params) => {
        setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi, }))
        params.api.sizeColumnsToFit();
        params.api.paginationGoToPage(0);
    };

    const onFilterTextBoxChanged = (e) => {
        setState((prevState) => ({ ...prevState, searchText: state.gridApi.setQuickFilter(e.target.value) }));
    }
    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
    };
    const onPageSizeChanged = (newPageSize) => {
        state.gridApi.paginationSetPageSize(Number(newPageSize));
    };
    const frameworkComponents = {
        customNoRowsOverlay: NoContentFound,
    };
    return (
        <>
            <div
                className={`ag-grid-react custom-pagination ${permissions.Download ? "show-table-btn" : ""
                    }`}
            >
                {/* {state.isLoader && <LoaderCustom />}
                {state.disableDownload && (
                    <LoaderCustom message={MESSAGES.DOWNLOADING_MESSAGE} />
                )} */}
                <Row className="pt-4 no-filter-row">
                    <Col md="9" className="search-user-block pr-0">
                        <div className="d-flex justify-content-end bd-highlight w100">
                            <div className="d-flex">
                                {permissions.Add && (
                                    <button
                                        type="button"
                                        className={"user-btn mr5 Tour_List_Add"}
                                        title="Add"
                                        onClick={formToggle}
                                    >
                                        <div className={"plus mr-0"}></div>
                                    </button>
                                )}


                                <button
                                    type="button"
                                    className="user-btn Tour_List_Reset"

                                    title="Reset Grid"
                                    onClick={() => resetState()}
                                >
                                    <div className="refresh mr-0"></div>
                                </button>
                            </div>
                        </div>
                    </Col>
                </Row>
                <div className="ag-grid-header">
                    <input type="text" value={state.searchText} className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={"off"} onChange={onFilterTextBoxChanged} />
                </div>
                <div
                    className={`ag-grid-wrapper height-width-wrapper ${(state.rowData && state.rowData?.length <= 0) || state.noData ? "overlay-contain" : ""}`}
                >
                    <div
                        className={`ag-theme-material ${state.isLoader && "max-loader-height"}`}
                    >
                        {(state.noData && newPartsListing.length !== 0) ? (
                            <NoContentFound
                                title={EMPTY_DATA}
                                customClassName="no-content-found"
                            />
                        ) : <></>}
                        {
                            <AgGridReact
                                defaultColDef={defaultColDef}
                                floatingFilter={true}
                                domLayout="autoHeight"
                                rowData={[]}

                                pagination={true}
                                paginationPageSize={globalTakes}
                                onGridReady={onGridReady}
                                gridOptions={gridOptions}
                                onFilterModified={() => { }}
                                rowSelection={"multiple"}
                                noRowsOverlayComponent={"customNoRowsOverlay"}
                                noRowsOverlayComponentParams={{
                                    title: EMPTY_DATA,
                                    imagClass: "imagClass",
                                }}
                                frameworkComponents={frameworkComponents}
                                suppressRowClickSelection={true}
                            >
                                <AgGridColumn field="DrawingNumber" headerName="Drawing No." cellRenderer={"hyphenFormatter"}  ></AgGridColumn>
                                <AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer={"effectiveDateFormatter"} filter="agDateColumnFilter" ></AgGridColumn>
                            </AgGridReact>}
                        {<PaginationWrapper gridApi={state.gridApi} setPage={onPageSizeChanged} />}
                    </div>
                </div>
            </div>
            {state.isDrawerOpen && <AddProductHierarchy isOpen={state.isDrawerOpen} toggle={formToggle} />}
        </>
    );
};


export default ProductHierarchyListing