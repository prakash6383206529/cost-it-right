import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import WarningMessage from '../../common/WarningMessage';
import { PaginationWrapper } from '../../common/commonPagination';
import { EMPTY_DATA, defaultPageSize } from '../../../config/constants';
import { useDispatch, useSelector } from 'react-redux';
import { getNFRApprovals } from './actions/nfr';
import { getSingleCostingDetails, setCostingViewData } from '../../costing/actions/Costing';
import { formViewData, loggedInUserId } from '../../../helper';
import CostingDetailSimulationDrawer from '../../simulation/components/CostingDetailSimulationDrawer';
import ApprovalSummary from '../../costing/components/approval/ApprovalSummary';
import { Redirect } from 'react-router';
import NoContentFound from '../../common/NoContentFound';
import NfrSummaryDrawer from './NfrSumaryDrawer';
import SingleDropdownFloationFilter from '../material-master/SingleDropdownFloationFilter';
import { useRef } from 'react';
import { agGridStatus, getGridHeight, isResetClick } from '../../../actions/Common';
import TourWrapper from '../../common/Tour/TourWrapper';
import { Steps } from './TourMessages';
import { useTranslation } from 'react-i18next';
import LoaderCustom from '../../common/LoaderCustom';
import { useLabels } from '../../../helper/core';
const gridOptions = {};

function NFRApprovalListing(props) {
    const { t } = useTranslation("Nfr")
    const { activeTab } = props || {}
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [rowData, setRowData] = useState([]);
    const [isOpen, setIsOpen] = useState(false)
    const [showApprovalSumary, setShowApprovalSummary] = useState(false)
    const [approvalData, setApprovalData] = useState('')
    const [singleRowData, setSingleRowData] = useState([]);
    const statusColumnData = useSelector((state) => state.comman.statusColumnData);
    const agGridRef = useRef(null);
    const [showExtraData, setShowExtraData] = useState(false)
    const [render, setRender] = useState(false)
    const { revisionNoLabel } = useLabels()
    const floatingFilterNfr = {
        maxValue: 12,
        suppressFilterButton: true,
        component: "NFRApproval",
    }

    const defaultColDef = {
        resizable: true,
        filter: true,

    };
    const dispatch = useDispatch()
    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
        agGridRef.current = params.api;
        window.screen.width >= 1920 && params.api.sizeColumnsToFit();
    };
    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    useEffect(() => {
        dispatch(getNFRApprovals(loggedInUserId(), res => {
            if (res?.data?.Result === true) {
                setRowData(res?.data?.DataList)
            }
        }))
        dispatch(agGridStatus("", ""))
        dispatch(isResetClick(true, "status"))
    }, [])

    useEffect(() => {
        if (statusColumnData) {
            gridApi?.setQuickFilter(statusColumnData?.data);
        }
    }, [statusColumnData])
    /**
    * @method hyphenFormatter
    */
    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return cellValue ? cellValue : '-';
    }

    const hyperLinkableFormatter = (props) => {

        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                <div id="view_nfrSummary"
                    onClick={() => viewDetailCostingID(row.UserId, cell, row)}
                    className={'link'}
                >{cell}</div>
            </>
        )
    }

    const viewDetailCostingID = (UserId, cell, row) => {

        if (row.CostingId && Object.keys(row.CostingId).length > 0) {
            dispatch(getSingleCostingDetails(row.CostingId, (res) => {
                if (res.data.Data) {
                    let dataFromAPI = res.data.Data

                    const tempObj = formViewData(dataFromAPI)
                    dispatch(setCostingViewData(tempObj))
                }
            },
            ))
        }
        setIsOpen(true)
    }

    const closeDrawer = (e = '', type) => {
        if (type === 'submit') {
            setIsOpen(false)
            dispatch(getNFRApprovals(loggedInUserId(), res => {
                if (res?.data?.Result === true) {
                    setRowData(res?.data?.DataList)
                }
            }))

        } else {
            setIsOpen(false)
        }
    }

    /**
     * @method linkableFormatter
     * @description Renders Name link
     */
    const linkableFormatter = (props) => {

        // if (selectedRowForPagination?.length > 0) {
        //     selectedRowForPagination.map((item) => {

        //         if (item.CostingId === props.node.data.CostingId) {
        //             props.node.setSelected(true)
        //         }
        //         return null
        //     })

        // }


        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <Fragment>
                {(cell === '' || cell === null) ? <div className='ml-4'>-</div> : <div id="view_nfrSummary" onClick={() => viewDetails(cell, row)} className={'link'}>{cell}</div>}
            </Fragment>
        )
    }
    /**
           * @method toggleExtraData
           * @description Handle specific module tour state to display lorem data
           */
    const toggleExtraData = (showTour) => {

        setRender(true)
        setTimeout(() => {
            setShowExtraData(showTour)
            setRender(false)
        }, 200);


    }
    const viewDetails = (approvalNumber, row) => {
        setIsOpen(true)
        setSingleRowData(row)
    }

    const statusFormatter = (props) => {
        dispatch(getGridHeight({ value: agGridRef.current.rowRenderer.allRowCons.length, component: 'NFRApproval' }))
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return <div className={row?.Status}>{row.DisplayStatus}</div>
    }

    const frameworkComponents = {

        hyphenFormatter: hyphenFormatter,
        hyperLinkableFormatter: hyperLinkableFormatter,
        linkableFormatter: linkableFormatter,
        customNoRowsOverlay: NoContentFound,
        statusFormatter: statusFormatter,
        valuesFloatingFilter: SingleDropdownFloationFilter,

    };

    if (showApprovalSumary === true) {

        return <Redirect
            to={{
                pathname: "/approval-summary",
                state: {
                    approvalNumber: approvalData?.approvalNumber,
                    approvalProcessId: approvalData?.approvalProcessId,
                    NfrGroupId: approvalData?.NfrGroupId,
                    isNFR: true
                }
            }}
        />
    }
    const onFirstDataRendered = () => {
        if (gridApi) {
            window.screen.width > 1600 && gridApi.sizeColumnsToFit();
        }
    };
    const resetState = () => {
        gridOptions?.columnApi?.resetColumnState(null);
        gridOptions?.api?.setFilterModel(null);
        window.screen.width >= 1920 && gridApi.sizeColumnsToFit();
        gridApi.deselectAll()
        dispatch(agGridStatus("", ""))
        dispatch(isResetClick(true, "status"))
    }

    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
        window.screen.width >= 1920 && gridApi.sizeColumnsToFit();

    };

    return (
        <Fragment>
            {!showApprovalSumary &&

                <div className={`'container-fluid'} approval-listing-page`} id={'approval-go-to-top'}>

                    <Row>
                        <Col>
                            <div className={`ag-grid-react grid-parent-wrapper p-relative`}>

                                <div id={'parentId'} className={`ag-grid-wrapper height-width-wrapper min-height-auto p-relative ${rowData?.length <= 0 ? 'overlay-contain' : ''} `}>
                                    <div className="ag-grid-header d-flex justify-content-between">
                                        <Col md="3" lg="3" className='mb-2'>
                                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                            {rowData.length !== 0 && <TourWrapper
                                                buttonSpecificProp={{ id: "Nfr_Approval_Listing", onClick: toggleExtraData }}
                                                stepsSpecificProp={{
                                                    steps: Steps(t, { activeTab }).NFR_lISTING
                                                }} />}
                                        </Col>
                                        <button type="button" id="resetNFR_listing" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                                            <div className="refresh mr-0"></div>
                                        </button>
                                    </div>
                                    <div className="ag-theme-material">
                                        {render ? <LoaderCustom customClass="loader-center" /> : <AgGridReact
                                            floatingFilter={true}
                                            style={{ height: '100%', width: '100%' }}
                                            defaultColDef={defaultColDef}
                                            domLayout='autoHeight'
                                            // columnDefs={c}
                                            rowData={rowData}
                                            pagination={true}
                                            paginationPageSize={defaultPageSize}
                                            onGridReady={onGridReady}
                                            gridOptions={gridOptions}
                                            //loadingOverlayComponent={'customLoadingOverlay'}
                                            noRowsOverlayComponent={'customNoRowsOverlay'}
                                            noRowsOverlayComponentParams={{
                                                title: EMPTY_DATA,
                                                imagClass: "imagClass"
                                            }}
                                            onFirstDataRendered={onFirstDataRendered}
                                            // frameworkComponents={frameworkComponents}
                                            suppressRowClickSelection={true}
                                            rowSelection={'multiple'}
                                            // frameworkComponents={frameworkComponents}
                                            // onFilterModified={onFloatingFilterChanged}
                                            //onSelectionChanged={onRowSelect}
                                            // onRowSelected={onRowSelect}
                                            // isRowSelectable={isRowSelectable}
                                            enableBrowserTooltips={true}
                                            frameworkComponents={frameworkComponents}
                                            ref={agGridRef}
                                        >
                                            <AgGridColumn cellClass="has-checkbox" field="ApprovalToken" cellRenderer='linkableFormatter' headerName="Token No."></AgGridColumn>
                                            <AgGridColumn field="NfrNumber" headerName="Customer RFQ Number" cellRenderer='hyphenFormatter' ></AgGridColumn>
                                            <AgGridColumn field="GroupName" headerName="Group Name"  ></AgGridColumn>
                                            <AgGridColumn field="PartNumber" headerName={`Part No. (${revisionNoLabel})`}></AgGridColumn>
                                            <AgGridColumn field="ProductCode" headerName="Product Code" cellRenderer='hyphenFormatter'></AgGridColumn>
                                            <AgGridColumn field="InitiatedByName" headerName="Initiated By" cellRenderer='hyphenFormatter'></AgGridColumn>
                                            <AgGridColumn field="CreatedByName" headerName=" Created By" cellRenderer='hyphenFormatter'></AgGridColumn>
                                            <AgGridColumn field='LastApprovedByName' headerName="Last Approved /Rejected By" cellRenderer='hyphenFormatter'></AgGridColumn>
                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" field="DisplayStatus" tooltipField="TooltipText" cellRenderer='statusFormatter' headerName="Status" floatingFilterComponent="valuesFloatingFilter" floatingFilterComponentParams={floatingFilterNfr}></AgGridColumn>
                                        </AgGridReact>}
                                        {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} globalTake={defaultPageSize} />}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right pb-3">
                                <WarningMessage message="It may take up to 5 minutes for the status to be updated." />
                            </div>
                        </Col>
                    </Row>
                </div>
            }
            {isOpen && <NfrSummaryDrawer isOpen={isOpen} closeDrawer={closeDrawer} anchor={"bottom"} rowData={singleRowData} />}

        </Fragment>
    )
}

export default NFRApprovalListing
