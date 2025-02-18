import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'reactstrap';
import { getAllLevelMappingAPI, manageLevelTabApi } from '../../actions/auth/AuthActions';
import { EMPTY_DATA, } from '../../config/constants';
import NoContentFound from '../common/NoContentFound';
import LoaderCustom from '../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { PaginationWrapper } from '../common/commonPagination';
import { ApplyPermission } from './LevelsListing';
import { useContext } from 'react';
import Button from '../layout/Button';
import { searchNocontentFilter } from '../../helper';
import { useLabels } from '../../helper/core';
const gridOptions = {};
const defaultPageSize = 5;
const CostingLevelListing = (props) => {
    const levelMappingFilter = useRef(null);
    const [state, setState] = useState({
        isEditFlag: false,
        tableData: [],
        gridApi: null,
        gridColumnApi: null,
        rowData: null,
        sideBar: { toolPanels: ['columns'] },
        showData: false,
        showPopup: false,
        deletedId: '',
        isLoader: false,
        noData: false,
        pageSize1: 5,
        pageSize2: 15,
        pageSize3: 25,
        globalTake: 5
    });
    const permissions = useContext(ApplyPermission);
    const { isCallApi } = useSelector((state) => state.auth)
    const dispatch = useDispatch();
    const { technologyLabel } = useLabels();
    useEffect(() => {
        getLevelsListData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isCallApi === true || props.tab !== '')
            setTimeout(() => {
                getLevelsListData();
            }, 100);
    }, [isCallApi]);
    const getLevelsListData = () => {
        setState((prevState) => ({ ...prevState, isLoader: true }))
        dispatch(getAllLevelMappingAPI(res => {
            setState((prevState) => ({ ...prevState, isLoader: false }))
            if (res.status === 204 && res.data === '') {
                setState((prevState) => ({ ...prevState, tableData: [], }))
            } else {
                dispatch(manageLevelTabApi(false))
                let Data = res.data.DataList;
                setState((prevState) => ({
                    ...prevState, tableData: Data,
                }))
            }
        }));
    }

    /**
     * @method editItemDetails
     * @description confirm edit item
     */
    const editItemDetails = (Id, levelType, rowData = []) => {
        props.getLevelMappingDetail(Id, levelType, rowData?.ApprovalTypeId)
    }
    /**
        * @method confirmDeleteItem
        * @description confirm delete level item
        */

    const buttonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                {permissions.Edit && <Button id={`levelTechnologyListing_edit${props.rowIndex}`} className={"Edit HighestApproval_Edit"} variant="Edit" onClick={() => editItemDetails(cellValue, 'Costing', rowData)} title={"Edit"} />}
            </>
        )
    }

    const onGridReady = (params) => {
        state.gridApi = params.api;
        state.gridApi.sizeColumnsToFit();
        setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi }))
        params.api.paginationGoToPage(0);
    };

    const levelMappingFilterHandler = (e) => {
        state.gridApi.setQuickFilter(e.target.value);

    }

    const levelMappingResetState = () => {
        state.gridApi.setQuickFilter(null)
        gridOptions.columnApi?.resetColumnState();
        gridOptions.api.setFilterModel(null)
        if (levelMappingFilter.current) {
            levelMappingFilter.current.value = '';
        }
        setState((prevState) => ({ ...prevState, globalTake: defaultPageSize }));
        getLevelsListData();
    }

    const levelMappingPagination = (newPageSize) => {
        // state.gridApi.paginationSetPageSize(Number(newPageSize + 1))
        state.gridApi.paginationSetPageSize(Number(newPageSize))
        setState((prevState) => ({ ...prevState, globalTake: newPageSize }));
    };

    const defaultColDef = {
        resizable: true, filter: true, sortable: false,

    };

    const frameworkComponents = {
        totalValueRenderer: buttonFormatter,
        customNoRowsOverlay: NoContentFound,
    };


    return (
        <>{state.isLoader ? <LoaderCustom /> :
            <div className='p-relative'>
                <Row className="levellisting-page">
                    <Col md="6" className="text-right search-user-block">
                        <Button id={"levelMappingListing_refresh"} className="user-btn HighestApproval_Refresh" onClick={() => levelMappingResetState()} title={"Reset Grid"} icon={"refresh mr-0"} />
                    </Col>
                </Row>
                <Row className="levellisting-page">
                    <Col className="level-table" md="12">
                        <div className={`ag-grid-wrapper height-width-wrapper ${(state.tableData && state.tableData?.length <= 0) || state.noData ? "overlay-contain" : ""}`}>
                            <div className="ag-grid-header mt-3 mb-2 d-flex">
                                <input ref={levelMappingFilter} type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => levelMappingFilterHandler(e)} />
                            </div>
                            <div className={`ag-theme-material `}>
                                {state.noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                                {<AgGridReact
                                    defaultColDef={defaultColDef}
                                    floatingFilter={true}
                                    domLayout='autoHeight'
                                    // columnDefs={c}
                                    rowData={state.tableData ?? []}
                                    pagination={true}
                                    paginationPageSize={defaultPageSize}
                                    onGridReady={onGridReady}
                                    gridOptions={gridOptions}
                                    loadingOverlayComponent={'customLoadingOverlay'}
                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                    noRowsOverlayComponentParams={{
                                        title: EMPTY_DATA,
                                        imagClass: 'imagClass'
                                    }}
                                    frameworkComponents={frameworkComponents}
                                    onFilterModified={(e) => {
                                        if (state.tableData.length !== 0) {
                                            setTimeout(() => {
                                                setState((prevState) => ({ ...prevState, noData: searchNocontentFilter(e) }));
                                            }, 50);
                                        }
                                    }}
                                >
                                    {/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
                                    <AgGridColumn field="ApprovalType" headerName="Approval Type"></AgGridColumn>
                                    <AgGridColumn field="Technology" headerName={technologyLabel}></AgGridColumn>
                                    <AgGridColumn field="Level" headerName="Highest Approval Level"></AgGridColumn>
                                    <AgGridColumn field="TechnologyId" cellClass="ag-grid-action-container" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
                                </AgGridReact>}
                                {<PaginationWrapper gridApi={state.gridApi} setPage={levelMappingPagination} pageSize1={state.pageSize1} pageSize2={state.pageSize2} pageSize3={state.pageSize3} globalTake={state.globalTake} />}
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        }
        </>
    );
};

export default CostingLevelListing;