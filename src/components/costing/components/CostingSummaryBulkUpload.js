import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col } from 'reactstrap';
import { defaultPageSize, EMPTY_DATA, REJECTED, APPROVED, PENDING } from '../../../config/constants';
import { getCostingBulkUploadList, sendForApprovalFromBulkUpload, generateReport } from '../actions/CostWorking';
import CostingBulkUploadDrawer from './CostingBulkUploadDrawer';
import Toaster from '../../common/Toaster';
import { loggedInUserId } from '../../../helper';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { PaginationWrapper } from '../../common/commonPagination';
import LoaderCustom from '../../common/LoaderCustom';

import Button from '../../layout/Button';
import { useDispatch, useSelector } from 'react-redux';
const gridOptions = {};

const CostingSummaryBulkUpload = () => {
    const dispatch = useDispatch();
    const costingBulkUploadList = useSelector(state => state.costing.costingBulkUploadList);
    

    const [isLoading, setIsLoading] = useState(false);
    const [state, setState] = useState({
        showBulkUpload: false,
        gridApi: null,
        gridColumnApi: null
    });

    useEffect(() => {
        dispatch(getCostingBulkUploadList(() => { }));
    }, [dispatch]);

    const refresh = useCallback(() => {
        dispatch(getCostingBulkUploadList(() => { }));
        gridOptions.columnApi?.resetColumnState();
        gridOptions.api?.setFilterModel(null);
    }, [dispatch]);

    const generateReportHandler = useCallback(() => {
        dispatch(generateReport(() => { }));
    }, [dispatch]);

    const bulkToggle = () => {
        

        setState(prev => ({ ...prev, showBulkUpload: true }));
    };

    const closeDrawer = useCallback(() => {
        

        setState(prev => ({ ...prev, showBulkUpload: false }));
        dispatch(getCostingBulkUploadList(() => { }));
    }, [dispatch]);

    const onGridReady = useCallback((params) => {
        params.api.sizeColumnsToFit();
        setState(prev => ({
            ...prev,
            gridApi: params.api,
            gridColumnApi: params.columnApi
        }));
        params.api.paginationGoToPage(0);
    }, []);

    const onPageSizeChanged = useCallback((newPageSize) => {
        state.gridApi?.paginationSetPageSize(Number(newPageSize));
    }, [state.gridApi]);

    const sendForApprovalOrReject =(id, flag) => {
        setIsLoading(true);

        const obj = {
            CostingBulkUploadFileId: id,
            IsAccept: flag,
            LoggedInUserId: loggedInUserId()
        };

        dispatch(sendForApprovalFromBulkUpload(obj, res => {
            setIsLoading(false);
            if (res.data.Result) {
                Toaster.success(res.data.Message);
            }
            dispatch(getCostingBulkUploadList(() => { }));
        }));
    }

    const buttonFormatter = (props) => {
        

        const row = props?.data;
        const status = row.FileUploadStatus;

        if (status === PENDING) {
            return (
                <>
                    <Button
                        id="approve-btn"
                        className="mr-2"
                        disabled={row.IncorrectCostingCount > 0}
                        onClick={() => sendForApprovalOrReject(props.value, true)}
                        type="button"
                    >
                        {
                            'Approve'
                        }
                    </Button>
                    <Button
                        id="reject-btn"
                        variant={"cancel-btn"}
                        onClick={() => sendForApprovalOrReject(props.value, false)}
                        type="button"
                    >
                        
                            {'Reject'
                        }
                    </Button>
                </>
            );
        }
        return status === APPROVED || status === REJECTED ? <span>-</span> : null;
    }

    const onFilterTextBoxChanged = useCallback((e) => {
        state.gridApi?.setQuickFilter(e.target.value);
    }, [state.gridApi]);

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false
    };
    const handleFormSubmit = (values) => {
        // Handle form submission
        
    };
    const frameworkComponents = {
        totalValueRenderer: buttonFormatter
    };

    return (
        <>
            {isLoading && <LoaderCustom customClass="simulation-Loader" />}
            <div className="container-fluid">
                <form noValidate>
                    <h1>Costing BulkUpload</h1>
                    <hr />
                    <Row className="pt-1 no-filter-row">
                        <Col md="9" className="filter-block" />
                        <Col md="3" className="search-user-block">
                            <div className="d-flex justify-content-end bd-highlight">
                                <button
                                    type="button"
                                    className="user-btn mr5"
                                    onClick={refresh}
                                >
                                    <div className="refresh" />
                                    Refresh
                                </button>
                                <button
                                    type="button"
                                    className="user-btn min-width-btn mr-2"
                                    onClick={generateReportHandler}
                                >
                                    Generate Report
                                </button>
                                <button
                                    type="button"
                                    className="user-btn min-width-btn"
                                    onClick={bulkToggle}
                                >
                                    <div className="upload" />
                                    Bulk Upload
                                </button>
                            </div>
                        </Col>
                    </Row>
                </form>

                <div className="ag-grid-react">
                    <div className="ag-grid-wrapper height-width-wrapper">
                        <div className="ag-grid-header">
                            <input
                                type="text"
                                className="form-control table-search"
                                placeholder="Search"
                                onChange={onFilterTextBoxChanged}
                                autoComplete="off"
                            />
                        </div>
                        <div className="ag-theme-material">
                            <AgGridReact
                                defaultColDef={defaultColDef}
                                floatingFilter={true}
                                domLayout="autoHeight"
                                rowData={costingBulkUploadList}
                                pagination={true}
                                paginationPageSize={defaultPageSize}
                                onGridReady={onGridReady}
                                gridOptions={gridOptions}
                                noRowsOverlayComponentParams={{
                                    title: EMPTY_DATA,
                                    imagClass: 'imagClass'
                                }}
                                frameworkComponents={frameworkComponents}
                                suppressRowClickSelection={true}
                                rowSelection="multiple"
                            >
                                <AgGridColumn field="FileUploadStatus" headerName="Status" />
                                <AgGridColumn field="CorrectCostingCount" headerName="No. of Correct Row" />
                                <AgGridColumn field="IncorrectCostingCount" headerName="No. of Incorrect Row" />
                                <AgGridColumn field="OriginalFileName" headerName="File Name" />
                                <AgGridColumn
                                    minWidth={230}
                                    field="CostingBulkUploadFileId"
                                    cellClass="ag-grid-action-container"
                                    headerName="Actions"
                                    cellRenderer="totalValueRenderer"
                                />
                            </AgGridReact>
                            <PaginationWrapper
                                gridApi={state.gridApi}
                                setPage={onPageSizeChanged}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {state.showBulkUpload && (
                <CostingBulkUploadDrawer
                    isOpen={state.showBulkUpload}
                    closeDrawer={closeDrawer}
                    anchor="right"
                    onSubmit={handleFormSubmit}
                />
            )}
        </>
    );
};

export default CostingSummaryBulkUpload;
