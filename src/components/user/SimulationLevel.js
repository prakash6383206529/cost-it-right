import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'reactstrap';
import { getSimulationLevelDataList, manageLevelTabApi } from '../../actions/auth/AuthActions';
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
const gridOptions = {};
const defaultPageSize = 5;
const SimulationLevelListing = (props) => {
    const agGrid2 = useRef(null);
    const simulationFilter = useRef(null);
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
    });
    const permissions = useContext(ApplyPermission);
    const dispatch = useDispatch();
    const { simulationLevelDataList, isCallApi } = useSelector((state) => state.auth)

    useEffect(() => {
        getSimulationDataList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        if (isCallApi === true || props.tab !== '')
            setTimeout(() => {
                getSimulationDataList();
            }, 100);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCallApi]);

    const getSimulationDataList = () => {
        setState((prevState) => ({ ...prevState, isLoader: true }))
        dispatch(getSimulationLevelDataList(res => {
            setState((prevState) => ({ ...prevState, isLoader: false }))
            if (res.status === 204 && res.data === '') {
                setState((prevState) => ({ ...prevState, tableData: [], }))
            } else if (res && res.data && res.data.DataList) {
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
        * @method simulationButtonFormatter
        * @description Renders buttons
        */

    const simulationButtonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                {permissions.Edit && <Button id={`levelTechnologyListing_edit${props.rowIndex}`} className={"Edit HighestApproval_Edit"} variant="Edit" onClick={() => editItemDetails(cellValue, 'Simulation', rowData)} title={"Edit"} />}
            </>
        )
    }

    const onGridReady = (params) => {
        state.gridApi = params.api;
        state.gridApi.sizeColumnsToFit();
        setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi }))
        params.api.paginationGoToPage(0);
    };

    const simulationFilterHandler = (e) => {
        agGrid2?.current.api.setQuickFilter(e.target.value);
    }

    const simulationResetState = () => {

        agGrid2?.current.api.setQuickFilter(null)
        agGrid2?.current?.columnApi?.resetColumnState();
        agGrid2?.current?.api.setFilterModel(null)
        if (simulationFilter.current) {
            simulationFilter.current.value = '';
        }
    }

    const simulationPagination = (newPageSize) => {
        agGrid2?.current.api.paginationSetPageSize(Number(newPageSize + 1))
        agGrid2?.current.api.paginationSetPageSize(Number(newPageSize))
    };

    const defaultColDef = {
        resizable: true, filter: true, sortable: false,

    };

    const frameworkComponents = {
        simulationButtonFormatter: simulationButtonFormatter,
        customNoRowsOverlay: NoContentFound,
    };


    return (
        <>
            <div className='p-relative'>
                {state.isLoader && <LoaderCustom />}
                <Row className="levellisting-page">
                    <Col md="6" className="text-right search-user-block">
                        <Button id={"SimulationListing_refresh"} className="user-btn HighestApproval_Refresh" onClick={() => simulationResetState()} title={"Reset Grid"} icon={"refresh mr-0"} />
                    </Col>
                </Row>

                <Row className="levellisting-page">
                    <Col className="level-table" md="12 ">
                        <div className={`ag-grid-wrapper height-width-wrapper ${state.tableData && state.tableData?.length <= 0 ? "overlay-contain" : ""}`}>
                            <div className="ag-grid-header mt-3 mb-2 d-flex">
                                <input ref={simulationFilter} type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => simulationFilterHandler(e)} />
                            </div>
                            <div className={`ag-theme-material`}>
                                {state.noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                                {<AgGridReact
                                    defaultColDef={defaultColDef}
                                    floatingFilter={true}
                                    domLayout='autoHeight'
                                    // columnDefs={c}
                                    rowData={state.tableData ?? []}
                                    pagination={true}
                                    paginationPageSize={defaultPageSize}
                                    ref={agGrid2}
                                    onGridReady={onGridReady}
                                    gridOptions={gridOptions}
                                    loadingOverlayComponent={'customLoadingOverlay'}
                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                    noRowsOverlayComponentParams={{ title: EMPTY_DATA, imagClass: 'imagClass' }}
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
                                    <AgGridColumn field="Technology" headerName="Heads"></AgGridColumn>
                                    <AgGridColumn field="Level" headerName="Highest Approval Level"></AgGridColumn>
                                    <AgGridColumn field="TechnologyId" cellClass="ag-grid-action-container" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'simulationButtonFormatter'}></AgGridColumn>
                                </AgGridReact>}
                                {<PaginationWrapper gridApi={state.gridApi} setPage={simulationPagination} pageSize1={5} pageSize2={15} pageSize3={25} />}
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

        </>
    );
};

export default SimulationLevelListing;