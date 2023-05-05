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
import { checkForDecimalAndNull } from '../../../../helper';
import GotGivenListing from './GotGivenListing';

function GotGivenSummary(props) {

    const { part, product } = props

    const simulationInsights = []
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [gotCost, setGotCost] = useState([]);
    const [givenCost, setGivenCost] = useState([]);
    const [variance, setVariance] = useState([]);
    const [selectedPartId, setSelectedPartId] = useState('');
    const [mainGotGivenListing, setMainGotGivenListing] = useState(false);
    const dispatch = useDispatch()
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)


    useEffect(() => {

        let obj = {}
        obj.plantId = EMPTY_GUID
        obj.partId = part ? (part.value ? part.value : EMPTY_GUID) : EMPTY_GUID
        obj.productCategoryId = product ? (product.value ? product.value : EMPTY_GUID) : EMPTY_GUID
        obj.isRequestForSummary = true
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

    const buttonFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

        return (
            <button title='Edit' className="Edit mr-1" type={'button'} onClick={() => EditItemDetails(cellValue, rowData)} />

        )
    };


    const frameworkComponents = {
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
        totalValueRenderer: buttonFormatter
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



    const EditItemDetails = (value, rowData) => {

        setSelectedPartId(value)
        setTimeout(() => {
            setMainGotGivenListing(true)
        }, 300);
    }

    const closeDrawer = (value) => {
        setMainGotGivenListing(false)

    }

    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }

    return (
        <>
            {!mainGotGivenListing && <div className="container-fluid report-listing-page ag-grid-react">
                <h1 className="mb-0">Got Given Report
                </h1>
                <Row className="pt-4 blue-before ">
                    <Col md="6" lg="6" className="search-user-block mb-3">
                        <div className="d-flex justify-content-end bd-highlight excel-btn w100">
                            <div>
                                <Row>
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
                                <AgGridColumn field="TokenNumber" headerName="Model No." cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="PartNumber" headerName="Part No." cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="PartDescription" headerName="Part Description" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="VendorName" headerName="BAL Sale Rate 01.01.22 (A)" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NetPOPrice" headerName="Got Cost" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="PartId" headerName="Actions" cellRenderer={'totalValueRenderer'}></AgGridColumn>
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

                                <AgGridColumn field="NetPOPrice" headerName="Given Cost" cellRenderer={decimalFormatter}></AgGridColumn>

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
                                <AgGridColumn field="NetPOPriceDelta" headerName="Variance" cellRenderer={decimalFormatter}></AgGridColumn>
                                <AgGridColumn field="NetPOPriceDeltaPercentage" headerName="Variance (%)" cellRenderer={decimalFormatter}></AgGridColumn>
                            </AgGridReact>
                        </div>
                    </div>
                </div>
            </div >}
            {
                mainGotGivenListing &&
                < GotGivenListing
                    part={selectedPartId}
                    closeDrawer={closeDrawer} />
            }
        </>
    );

}

export default GotGivenSummary