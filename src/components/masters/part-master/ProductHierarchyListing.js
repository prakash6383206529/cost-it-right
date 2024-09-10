
import React, { useState, useContext, useEffect } from "react";
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
import { getAllProductLevels } from "../actions/Part";
import LoaderCustom from "../../common/LoaderCustom";
import UpdateHierarchyLabels from "./UpdateHierarchyLabels";

const gridOptions = {};

const ProductHierarchyListing = (props) => {

    const [state, setState] = useState({
        // pageNo: 1,
        gridApi: null,
        gridColumnApi: null,
        isLoader: false,
        noData: false,
        rowData: [],
        isDrawerOpen: false,
        searchText: '',
        labelupdateDrawerOpen: false,
        levelId: ''
    });
    const { globalTakes } = useSelector((state) => state.pagination);
    const dispatch = useDispatch()
    const { productHierarchyData } = useSelector((state) => state.part);
    useEffect(() => {
        setState(prevState => ({ ...prevState, isLoader: true }))
        dispatch(getAllProductLevels((res) => {
            setState(prevState => ({ ...prevState, isLoader: false, rowData: productHierarchyData }))
        }))
    }, [])
    const resetState = () => {
        setState((prevState) => ({
            ...prevState,
            noData: false,
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
    const EditLabel = (id) => {
        setState(prevState => ({ ...prevState, labelupdateDrawerOpen: true, levelId: id }))
    }
    const ButtonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        const disabled = !rowData.IsProductLevelChangeAllowed || props.agGridReact?.gridOptions?.rowData?.length === cellValue

        return (
            <>
                <button
                    title="Edit"
                    className="Edit mr-2 Tour_List_Edit"
                    type={"button"}
                    onClick={() => EditLabel(cellValue)}
                    disabled={disabled}
                />
            </>
        );
    };
    const frameworkComponents = {
        customNoRowsOverlay: NoContentFound,
        ButtonFormatter: ButtonFormatter
    };
    const cancelDrawer = () => {
        setState((prevState) => ({ ...prevState, labelupdateDrawerOpen: false }));
    }
    return (
        <>
            <div className="ag-grid-react">
                <Row className="pt-4 no-filter-row">
                    <Col md="9" className="search-user-block pr-0">
                        <div className="d-flex justify-content-end bd-highlight w100">
                            <div className="d-flex">
                                {(
                                    <button
                                        type="button"
                                        className={"user-btn mr5 Tour_List_Add"}
                                        title="Add"
                                        onClick={formToggle}
                                    >
                                        <div className={`${productHierarchyData?.length === 0 ? 'plus' : 'view'} mr-0`}></div>
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
                <div className={`ag-grid-wrapper height-width-wrapper ${(productHierarchyData && productHierarchyData?.length <= 0) || state.noData ? "overlay-contain" : ""}`}>
                    <div className={`ag-theme-material ${state.isLoader && "max-loader-height"}`} >
                        {state.isLoader && <LoaderCustom />}
                        {
                            <AgGridReact
                                defaultColDef={defaultColDef}
                                floatingFilter={true}
                                domLayout="autoHeight"
                                rowData={productHierarchyData}

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
                                <AgGridColumn field="LevelNo" headerName="Level"  ></AgGridColumn>
                                <AgGridColumn field="LevelName" headerName="Level Name" ></AgGridColumn>
                                <AgGridColumn field="LevelId" cellClass="ag-grid-action-container" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={"ButtonFormatter"}
                                ></AgGridColumn>
                            </AgGridReact>}
                        {<PaginationWrapper gridApi={state.gridApi} setPage={onPageSizeChanged} />}
                    </div>
                </div>
            </div>
            {state.isDrawerOpen && <AddProductHierarchy isOpen={state.isDrawerOpen} toggle={formToggle} />}
            {state.labelupdateDrawerOpen && <UpdateHierarchyLabels isOpen={state.labelupdateDrawerOpen} levelId={state.levelId} cancelDrawer={cancelDrawer} />}
        </>
    );
};


export default ProductHierarchyListing