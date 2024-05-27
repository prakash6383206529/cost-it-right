import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'reactstrap';
import { deleteUserLevelAPI, getOnboardingLevelDataList, manageLevelTabApi } from '../../actions/auth/AuthActions';
import Toaster from '../common/Toaster';
import { MESSAGES } from '../../config/message';
import { EMPTY_DATA, } from '../../config/constants';
import NoContentFound from '../common/NoContentFound';
import LoaderCustom from '../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import PopupMsgWrapper from '../common/PopupMsgWrapper';
import { PaginationWrapper } from '../common/commonPagination';
import { ApplyPermission } from './LevelsListing';
import { useContext } from 'react';
import Button from '../layout/Button';
import { searchNocontentFilter } from '../../helper';
const gridOptions = {};
const defaultPageSize = 5;
const OnboardingLevelListing = (props) => {
    const agGrid3 = useRef(null);
    const onboardingFilter = useRef(null);
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
    const { onboardingLevelDataList, isCallApi } = useSelector((state) => state.auth)

    useEffect(() => {
        getOnboardingDataList()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (isCallApi === true || props.tab !== '')
            setTimeout(() => {
                getOnboardingDataList();
            }, 100);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCallApi]);

    const getOnboardingDataList = () => {
        setState((prevState) => ({ ...prevState, isLoader: true }))
        dispatch(getOnboardingLevelDataList(res => {
            dispatch(manageLevelTabApi(false))
            setState((prevState) => ({ ...prevState, isLoader: false }))
        }))
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
                getOnboardingDataList()
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
    * @method onboardingButtonFormatter
    * @description Renders buttons
    */
    const onboardingButtonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                {permissions.Edit && <Button id={`levelTechnologyListing_edit${props.rowIndex}`} className={"Edit HighestApproval_Edit"} variant="Edit" onClick={() => editItemDetails(cellValue, 'Onboarding', rowData)} title={"Edit"} />}
            </>
        )
    }

    const onGridReady = (params) => {
        state.gridApi = params.api;
        state.gridApi.sizeColumnsToFit();
        setState((prevState) => ({ ...prevState, gridApi: params.api, gridColumnApi: params.columnApi }))
        params.api.paginationGoToPage(0);
    };

    const onboardingFilterHandler = (e) => {
        agGrid3?.current.api.setQuickFilter(e.target.value);
    }

    const onboardingResetState = () => {

        agGrid3?.current.api.setQuickFilter(null)
        agGrid3?.current?.columnApi?.resetColumnState();
        agGrid3?.current?.api.setFilterModel(null)
        if (onboardingFilter.current) {
            onboardingFilter.current.value = '';
        }
    }

    const onboardingPagination = (newPageSize) => {
        agGrid3?.current.api.paginationSetPageSize(Number(newPageSize + 1))
        agGrid3?.current.api.paginationSetPageSize(Number(newPageSize))
    };
    const defaultColDef = {
        resizable: true, filter: true, sortable: false,

    };

    const frameworkComponents = {
        customNoRowsOverlay: NoContentFound,
        onboardingButtonFormatter: onboardingButtonFormatter
    };


    return (
        <>
            <div className='p-relative'>
                {state.isLoader && <LoaderCustom />}

                <Row className="levellisting-page">
                    <Col md="6" className=""></Col>
                    <Col md="6" className="text-right search-user-block">
                        <Button id={"onboardingLevelTyListing_refresh"} className="user-btn HighestApproval_Refresh" onClick={() => onboardingResetState()} title={"Reset Grid"} icon={"refresh mr-0"} />
                    </Col>
                </Row>

                <Row className="levellisting-page">
                    <Col className="level-table" md="12 ">
                        <div className={`ag-grid-wrapper height-width-wrapper ${(onboardingLevelDataList && onboardingLevelDataList?.length <= 0) || state.noData ? "overlay-contain" : ""}`}>
                            <div className="ag-grid-header mt-3 mb-2 d-flex">
                                <input ref={onboardingFilter} type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onboardingFilterHandler(e)} />
                            </div>
                            <div className={`ag-theme-material`}>
                                {state.noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found" />}
                                {<AgGridReact
                                    defaultColDef={defaultColDef}
                                    floatingFilter={true}
                                    domLayout='autoHeight'
                                    // columnDefs={c}
                                    rowData={onboardingLevelDataList ?? []}
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
                                        if (onboardingLevelDataList.length !== 0) {
                                            setTimeout(() => {
                                                setState((prevState) => ({ ...prevState, noData: searchNocontentFilter(e) }));
                                            }, 500);
                                        }
                                    }}
                                >
                                    <AgGridColumn field="ApprovalType" headerName="Approval Type"></AgGridColumn>
                                    <AgGridColumn field="Level" headerName="Highest Approval Level"></AgGridColumn>
                                    <AgGridColumn field="OnboardingId" cellClass="ag-grid-action-container" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'onboardingButtonFormatter'}></AgGridColumn>
                                </AgGridReact>}
                                {<PaginationWrapper gridApi={state.gridApi} setPage={onboardingPagination} pageSize1={5} pageSize2={15} pageSize3={25} />}
                            </div>
                        </div>

                        {state.showPopup && <PopupMsgWrapper isOpen={state.showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.LEVEL_DELETE_ALERT}`} />}
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default OnboardingLevelListing;