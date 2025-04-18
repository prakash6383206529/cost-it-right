import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'reactstrap';
import { deleteUserLevelAPI, getMasterLevelDataList, manageLevelTabApi } from '../../actions/auth/AuthActions';
import Toaster from '../common/Toaster';
import { MESSAGES } from '../../config/message';
import { EMPTY_DATA, } from '../../config/constants';
import NoContentFound from '../common/NoContentFound';
import LoaderCustom from '../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { getConfigurationKey } from '../../helper/auth';
import PopupMsgWrapper from '../common/PopupMsgWrapper';
import { PaginationWrapper } from '../common/commonPagination';
import { ApplyPermission } from './LevelsListing';
import { useContext } from 'react';
import Button from '../layout/Button';
import { getLocalizedCostingHeadValue, searchNocontentFilter } from '../../helper';
import { useLabels } from "../../helper/core";
const gridOptions = {};
const defaultPageSize = 5;
const MasterLevelListing = (props) => {
    const agGrid3 = useRef(null);
    const masterFilter = useRef(null);
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
    const dispatch = useDispatch();
    const { masterLevelDataList, isCallApi } = useSelector((state) => state.auth)
    const { technologyLabel, RMCategoryLabel, vendorLabel, vendorBasedLabel, zeroBasedLabel, customerBasedLabel } = useLabels();

    useEffect(() => {
        getMasterDataList()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isCallApi === true || props.tab !== '')
            setTimeout(() => {
                getMasterDataList();
            }, 100);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCallApi]);

    const getMasterDataList = () => {
        setState((prevState) => ({ ...prevState, isLoader: true }))
        dispatch(getMasterLevelDataList(res => {
            setState((prevState) => ({ ...prevState, isLoader: false }))
            if (res.status === 204 && res.data === '') {
                setState((prevState) => ({ ...prevState, tableData: [], }))
            } else {
                let Data = res.data.DataList;
                Data = Data.map(item => {
                    const localizedApprovalType = getLocalizedCostingHeadValue(item.ApprovalType, vendorBasedLabel, zeroBasedLabel, customerBasedLabel);
                    // Only create a new object if the approval type changed
                    if (localizedApprovalType !== item.ApprovalType) {
                        return {
                            ...item,
                            ApprovalType: localizedApprovalType
                        };
                    }
                    // Otherwise return the original item
                    return item;
                   });
                dispatch(manageLevelTabApi(false))
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
    const confirmDeleteItem = (LevelId) => {
        dispatch(deleteUserLevelAPI(LevelId, (res) => {
            if (res.data.Result === true) {
                Toaster.success(MESSAGES.DELETE_LEVEL_SUCCESSFULLY);
                getMasterDataList()
            }
        }));
        setState((prevState) => ({ ...prevState, showPopup: false }))
    }
    const onPopupConfirm = () => {
        confirmDeleteItem(state.deletedId);

    }
    const closePopUp = () => {
        setState((prevState) => ({ ...prevState, showPopup: false }))
    }

    /**
    * @method masterButtonFormatter
    * @description Renders buttons
    */
    const masterButtonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                {permissions.Edit && <Button id={`levelTechnologyListing_edit${props.rowIndex}`} className={"Edit HighestApproval_Edit"} variant="Edit" onClick={() => editItemDetails(cellValue, 'Master', rowData)} title={"Edit"} />
                }
            </>
        )
    }

    const onGridReady = (params) => {
        state.gridApi = params.api;
        state.gridApi.sizeColumnsToFit();
        setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi }))
        params.api.paginationGoToPage(0);
    };

    const masterFilterHandler = (e) => {
        agGrid3?.current.api.setQuickFilter(e.target.value);
    }

    const masterResetState = () => {
        agGrid3?.current.api.setQuickFilter(null)
        agGrid3?.current?.columnApi?.resetColumnState();
        agGrid3?.current?.api.setFilterModel(null)
        if (masterFilter.current) {
            masterFilter.current.value = '';
        }
        setState((prevState) => ({ ...prevState, globalTake: defaultPageSize }));
        getMasterDataList();
    }

    const masterPagination = (newPageSize) => {
        agGrid3?.current.api.paginationSetPageSize(Number(newPageSize + 1))
        agGrid3?.current.api.paginationSetPageSize(Number(newPageSize))
        setState((prevState) => ({ ...prevState, globalTake: newPageSize }));
    };
    const defaultColDef = {
        resizable: true, filter: true, sortable: false,

    };

    const frameworkComponents = {
        customNoRowsOverlay: NoContentFound,
        masterButtonFormatter: masterButtonFormatter
    };


    return (
        <>
            {getConfigurationKey().IsMasterApprovalAppliedConfigure &&
                <>
                    <div className='p-relative'>
                        {state.isLoader && <LoaderCustom />}

                        <Row className="levellisting-page">
                            <Col md="6" className=""></Col>
                            <Col md="6" className="text-right search-user-block">
                                <Button id={"masterLevelTyListing_refresh"} className="user-btn HighestApproval_Refresh" onClick={() => masterResetState()} title={"Reset Grid"} icon={"refresh mr-0"} />
                            </Col>
                        </Row>

                        <Row className="levellisting-page">
                            <Col className="level-table" md="12 ">
                                <div className={`ag-grid-wrapper height-width-wrapper ${(state.tableData && state.tableData?.length <= 0) || state.noData || !state.tableData ? "overlay-contain" : ""}`}>
                                    <div className="ag-grid-header mt-3 mb-2 d-flex">
                                        <input ref={masterFilter} type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => masterFilterHandler(e)} />
                                    </div>
                                    <div className={`ag-theme-material`}>
                                        {state.noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                                        {!state.isLoader && <AgGridReact
                                            defaultColDef={defaultColDef}
                                            floatingFilter={true}
                                            domLayout='autoHeight'
                                            // columnDefs={c}
                                            rowData={state.tableData ?? []}
                                            pagination={true}
                                            ref={agGrid3}
                                            paginationPageSize={defaultPageSize}
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
                                                    }, 500);
                                                }
                                            }}
                                        >
                                            {/* <AgGridColumn field="" cellRenderer={indexFormatter}>Sr. No.yy</AgGridColumn> */}
                                            <AgGridColumn field="ApprovalType" headerName="Approval Type"></AgGridColumn>
                                            <AgGridColumn field="Master" headerName="Master"></AgGridColumn>
                                            <AgGridColumn field="Level" headerName="Highest Approval Level"></AgGridColumn>
                                            <AgGridColumn field="MasterId" cellClass="ag-grid-action-container" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'masterButtonFormatter'}></AgGridColumn>
                                        </AgGridReact>}
                                        {<PaginationWrapper gridApi={state.gridApi} setPage={masterPagination} pageSize1={state.pageSize1} pageSize2={state.pageSize2} pageSize3={state.pageSize3} globalTake={state.globalTake} />}
                                    </div>
                                </div>

                                {state.showPopup && <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.LEVEL_DELETE_ALERT}`} />}
                            </Col>
                        </Row>
                    </div>
                </>
            }
        </>
    );
};

export default MasterLevelListing;