import React, { useState, useEffect } from 'react'
import { Row, Col } from 'reactstrap'
import NoContentFound from '../../../common/NoContentFound'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { EMPTY_DATA, EMPTY_GUID, defaultPageSize } from '../../../../config/constants';
import LoaderCustom from '../../../common/LoaderCustom';
import { PaginationWrapper } from '../../../common/commonPagination';
import { useDispatch, useSelector } from 'react-redux';
import { getGotAndGivenDetails } from '../../actions/ReportListing';
import { checkForDecimalAndNull, formViewData } from '../../../../helper';
import CostingDetailSimulationDrawer from '../../../simulation/components/CostingDetailSimulationDrawer';
import { getSingleCostingDetails, setCostingViewData } from '../../../costing/actions/Costing';

function GotGivenListing(props) {

    const { part, product } = props

    const simulationInsights = []
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [gotCost, setGotCost] = useState([]);
    const [givenCost, setGivenCost] = useState([]);
    const [variance, setVariance] = useState([]);
    const dispatch = useDispatch()
    const [isOpen, setIsOpen] = useState(false)
    const [isReportLoader, setIsReportLoader] = useState(false)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)


    useEffect(() => {
        let obj = {}
        obj.plantId = EMPTY_GUID
        obj.partId = (part ? part : EMPTY_GUID)
        obj.productCategoryId = product ? (product.value ? product.value : EMPTY_GUID) : EMPTY_GUID
        obj.isRequestForSummary = false
        dispatch(getGotAndGivenDetails(obj, (res) => {

            setGotCost(res.data.Data.GotCostingDetails)
            setGivenCost(res.data.Data.GivenCostingDetails)
            setVariance(res.data.Data.GotAndGivenVariance)
        }))


    }, [])


    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);

    };
    const gridOptions = {
        clearSearch: true,
        noDataText: (simulationInsights === undefined ? <LoaderCustom /> : <NoContentFound title={EMPTY_DATA} />),

    };
    const defaultColDef = {

        resizable: true,
        filter: true,
        sortable: false,
    };

    const hyperLinkableFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;

        return (
            <>
                {
                    <div
                        onClick={() => viewDetails(row.UserId, cell, row)}
                        className={'link'}
                    >{cell}</div>
                }
            </>
        )
    }

    const viewDetails = (UserId, cell, row) => {
        setIsReportLoader(true)
        if (row.CostingId) {
            dispatch(getSingleCostingDetails(row.CostingId, (res) => {
                if (res.data.Data) {
                    let dataFromAPI = res.data.Data
                    const tempObj = formViewData(dataFromAPI)
                    dispatch(setCostingViewData(tempObj))
                    setIsReportLoader(false)
                }
            },
            ))
        }
        setIsOpen(true)
    }


    const frameworkComponents = {
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
        hyperLinkableFormatter: hyperLinkableFormatter,

    };

    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
    };
    useEffect(() => {

    }, [])
    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const exitReport = () => {
        props.closeDrawer()
    }

    const decimalFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        let value = cell != null ? checkForDecimalAndNull(cell, initialConfiguration.NoOfDecimalForPrice) : '';
        return value
    }

    const closeUserDetails = () => {
        setIsOpen(false)
    }

    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }


    return (
        <div className="container-fluid report-listing-page ag-grid-react">
            <h1 className="mb-0">Got Given Report
            </h1>
            <Row className="pt-4 blue-before ">
                <Col md="6" lg="6" className="search-user-block mb-3">
                    <div className="d-flex justify-content-end bd-highlight excel-btn w100">
                        <div>
                            <Row>
                                {/* <button type="button" className="user-btn mr5" title="Reset Grid" onClick={() => resetState()}>
                                    <div className="refresh mr-0"></div>
                                </button> */}
                                <div className="supplier-back-btn mb-5 mr-2"><button type="button" className={"apply ml-1"} onClick={exitReport}> <div className={'back-icon'}></div>Back</button></div>
                            </Row>
                        </div>
                    </div>
                </Col>
            </Row>
            <div className="ag-grid-react">
                <div className={`ag-grid-wrapper height-width-wrapper ${gotCost && gotCost?.length <= 0 ? "overlay-contain" : ""}`}>
                    <div className="ag-grid-header">
                        <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                    </div>
                    <div
                        className="ag-theme-material">
                        <AgGridReact
                            defaultColDef={defaultColDef}
                            floatingFilter={true}
                            domLayout='autoHeight'
                            // columnDefs={c}
                            rowData={gotCost}
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
                            suppressRowClickSelection={true}
                            rowSelection={'multiple'}
                        >
                            <AgGridColumn headerName="Got Cost Details" headerClass="justify-content-center" marryChildren={true}>
                                <AgGridColumn field="PartNumber" headerName="Part No." cellRenderer={'hyperLinkableFormatter'}></AgGridColumn>
                                <AgGridColumn field="PartRevisionNumber" headerName="Revision No." cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="PartDescription" headerName="Part Description" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="PartType" headerName="Type" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialGrossWeight" headerName="GW" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialRate" headerName="RM Rate." cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialScrapRate" headerName="Scrap Rate" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialGrossWeightAndRate" headerName="Gr.RM Cost" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialFinishWeight" headerName="FW" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialScrapWeight" headerName="Scrap Weight" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NetRawMaterialsCost" headerName="Net RM Cost" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="ProfitRMTotalCost" headerName="Profit of Component" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NetProcessCost" headerName="Process Cost of Component" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="ProfitCCPercentage" headerName="Profit of Component on CC (%)" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="SubTotal" headerName="Sub Total" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NewRawMaterialRate" headerName="Revised RM Rate" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NewRawMaterialScrapRate" headerName="Revised Scrap Rate" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialCostVariance" headerName="RawMaterial Variance" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="ProductSum" headerName="Sum product" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NewRejectionCost" headerName="Rejection" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NewNetFreightPackagingCost" headerName="Packaging and Freight of Part" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NewICCCost" headerName="ICC of Part" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NewSubTotal" headerName="Sub total" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="Total" headerName="Total" cellRenderer={hyphenFormatter}></AgGridColumn>

                            </AgGridColumn>

                        </AgGridReact>
                        {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
                    </div>
                </div>
            </div>


            <div className="ag-grid-react">
                <div className={`ag-grid-wrapper height-width-wrapper ${gotCost && gotCost?.length <= 0 ? "overlay-contain" : ""}`}>

                    <div
                        className="ag-theme-material">
                        <AgGridReact
                            defaultColDef={defaultColDef}
                            floatingFilter={true}
                            domLayout='autoHeight'
                            // columnDefs={c}
                            rowData={givenCost}
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
                            suppressRowClickSelection={true}
                            rowSelection={'multiple'}
                        >
                            <AgGridColumn headerName="Given Cost Details" headerClass="justify-content-center" marryChildren={true}>
                                <AgGridColumn field="VendorName" headerName="Vendor Name" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="SAPCode" headerName="SAP Code" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="PartDescription" headerName="Material Description" cellRenderer={hyphenFormatter}></AgGridColumn>

                                <AgGridColumn field="PartType" headerName="Type" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialGrossWeight" headerName="GW" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialRate" headerName="RM Rate." cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialScrapRate" headerName="Scrap Rate" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialGrossWeightAndRate" headerName="Gr.RM Cost" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialFinishWeight" headerName="FW" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialScrapWeight" headerName="Scrap Weight" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NetRawMaterialsCost" headerName="Net RM Cost" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="ProfitRMTotalCost" headerName="Profit of Component" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NetProcessCost" headerName="Process Cost of Component" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="ProfitCCPercentage" headerName="Profit of Component on CC (%)" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="SubTotal" headerName="Sub Total" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NewRawMaterialRate" headerName="Revised RM Rate" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NewRawMaterialScrapRate" headerName="Revised Scrap Rate" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialCostVariance" headerName="RawMaterial Variance" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="ProductSum" headerName="Sum product" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NewRejectionCost" headerName="Rejection" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NewNetFreightPackagingCost" headerName="Packaging and Freight of Part" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NewICCCost" headerName="ICC of Part" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NewSubTotal" headerName="Sub total" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="Total" headerName="Total" cellRenderer={hyphenFormatter}></AgGridColumn>
                            </AgGridColumn>

                        </AgGridReact>
                    </div>
                </div>
            </div>


            <div className="ag-grid-react">
                <div className={`ag-grid-wrapper height-width-wrapper ${gotCost && gotCost?.length <= 0 ? "overlay-contain" : ""}`}>
                    <div
                        className="ag-theme-material">
                        <AgGridReact
                            defaultColDef={defaultColDef}
                            floatingFilter={true}
                            domLayout='autoHeight'
                            // columnDefs={c}
                            rowData={variance}
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
                            suppressRowClickSelection={true}
                            rowSelection={'multiple'}
                        >
                            <AgGridColumn field="TotalDelta" headerName="Variance" cellRenderer={decimalFormatter}></AgGridColumn>
                            <AgGridColumn field="TotalDeltaPercentage" headerName="Variance (%)" cellRenderer={decimalFormatter}></AgGridColumn>
                        </AgGridReact>
                    </div>
                </div>
            </div>
            {
                isOpen &&
                <CostingDetailSimulationDrawer
                    isOpen={isOpen}
                    closeDrawer={closeUserDetails}
                    anchor={"right"}
                    isReport={isOpen}
                    isSimulation={false}
                    simulationDrawer={false}
                    isReportLoader={isReportLoader}
                />
            }
        </div >
    );
}

export default GotGivenListing