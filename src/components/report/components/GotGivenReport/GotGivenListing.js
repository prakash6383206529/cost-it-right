import React, { useState, useEffect } from 'react'
import { Row, Col } from 'reactstrap'
import NoContentFound from '../../../common/NoContentFound'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { EMPTY_DATA, EMPTY_GUID, GOT_GIVEN_REPORT } from '../../../../config/constants';
import LoaderCustom from '../../../common/LoaderCustom';
import { useDispatch, useSelector } from 'react-redux';
import { getGotAndGivenDetails } from '../../actions/ReportListing';
import { checkForDecimalAndNull, formViewData } from '../../../../helper';
import CostingDetailSimulationDrawer from '../../../simulation/components/CostingDetailSimulationDrawer';
import { getSingleCostingDetails, setCostingViewData } from '../../../costing/actions/Costing';
// import ReactExport from 'react-export-excel';
import { GOT_GIVEN_EXCEL_TEMPLATE } from '../../ExcelTemplate';
// const ExcelFile = ReactExport.ExcelFile;
// const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
// const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};

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
    const [isLoader, setIsLoader] = useState(false)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)


    useEffect(() => {
        let obj = {}
        obj.plantId = props?.plantId
        obj.partId = (part ? part : EMPTY_GUID)
        obj.productCategoryId = product ? (product.value ? product.value : EMPTY_GUID) : EMPTY_GUID
        obj.isRequestForSummary = false
        obj.customerId = props?.customerId
        obj.vendorId = props?.vendorId
        setIsLoader(true)
        dispatch(getGotAndGivenDetails(obj, (res) => {
            setIsLoader(false)
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
        hyperLinkableFormatter: hyperLinkableFormatter,

    };

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

    const renderColumn = () => {
        return returnExcelColumn(GOT_GIVEN_EXCEL_TEMPLATE, gotCost)
    }

    const returnExcelColumn = (data = [], TempData) => {
        let tempData = [...data]
        let tempArray = []
        let givenArray = [...givenCost]
        let finalGivenArray = []
        givenArray && givenArray.map((item, index) => {
            let obj = {}
            for (let key in item) {
                obj[`given${key}`] = item[key]
            }
            finalGivenArray.push(obj)
        })

        gotCost.map((item, index) => {
            let obj = { ...gotCost[index], ...finalGivenArray[index], ...variance[index] }
            tempArray.push(obj)
        })

        // return (<ExcelSheet data={tempArray} name={GOT_GIVEN_REPORT}>
        //     {tempData && tempData.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} />)}
        // </ExcelSheet>);
    }

    return (
        <div className="container-fluid report-listing-page ag-grid-react">
            <Row className="pt-4 blue-before ">
                <Col md="6" lg="6" className="search-user-block mb-3">
                    <div className="d-flex justify-content-end bd-highlight excel-btn w100">
                        {/* <ExcelFile filename={'Got Given Report'} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div></button>}>
                            {renderColumn()}
                        </ExcelFile> */}
                        <div className="mb-3"><button type="button" className={"apply"} onClick={exitReport}> <div className={'back-icon'}></div>Back</button></div>

                    </div>
                </Col>
            </Row>
            <div className='got-given-container-listing mt-4'>
                {isLoader && <LoaderCustom />}

                <div className="ag-grid-react">
                    <div className={`ag-grid-wrapper height-width-wrapper ${gotCost && gotCost?.length <= 0 ? "overlay-contain" : ""}`}>
                        <div className='got-given-header border-end-0'>
                            Got Cost Details
                        </div>
                        <div
                            className="ag-theme-material got-report">
                            <AgGridReact
                                defaultColDef={defaultColDef}
                                floatingFilter={true}
                                domLayout='autoHeight'
                                // columnDefs={c}
                                rowData={gotCost}
                                pagination={true}
                                paginationPageSize={100}
                                onGridReady={onGridReady}
                                gridOptions={gridOptions}
                                loadingOverlayComponent={'customLoadingOverlay'}
                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                frameworkComponents={frameworkComponents}
                                suppressRowClickSelection={true}
                                rowSelection={'multiple'}
                            >
                                <AgGridColumn field="PartNumber" width={160} headerName="Part No." cellRenderer={'hyperLinkableFormatter'}></AgGridColumn>
                                <AgGridColumn field="PartRevisionNumber" width={130} headerName="Revision No." cellRenderer={hyphenFormatter}></AgGridColumn>

                                <AgGridColumn field="PartDescription" headerName="Part Description" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="PartType" width={130} headerName="Type" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialGrossWeight" width={110} headerName="GW" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialRate" width={120} headerName="RM Rate" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialScrapRate" width={130} headerName="Scrap Rate" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialGrossWeightAndRate" width={130} headerName="Gr RM Cost" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialFinishWeight" width={110} headerName="FW" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialScrapWeight" width={130} headerName="Scrap Weight" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NetRawMaterialsCost" width={130} headerName="Net RM Cost" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="ProfitRMTotalCost" width={130} headerName="Profit of Component" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NetProcessOperationAndSTCost" headerName="Process Cost of Component" cellRenderer={hyphenFormatter}></AgGridColumn>
                                {/* <AgGridColumn field="NetProcessCost" headerName="Process Cost of Component" cellRenderer={hyphenFormatter}></AgGridColumn>            //RE */}
                                <AgGridColumn field="ProfitCCPercentage" headerName="Profit of Component on CC (%)" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="SubTotal" width={130} headerName="Sub Total" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NewRawMaterialRate" width={130} headerName="Revised RM Rate" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NewRawMaterialScrapRate" width={130} headerName="Revised Scrap Rate" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialCostVariance" width={130} headerName="RM Variance" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="ProductSum" width={130} headerName="Sum product" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NewRejectionCost" width={130} headerName="Rejection" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NewNetFreightPackagingCost" width={160} headerName="Packaging and Freight of Part" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NewICCCost" width={130} headerName="ICC of Part" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NewSubTotal" width={130} headerName="Sub total" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="Total" width={130} headerName="Total" cellRenderer={hyphenFormatter}></AgGridColumn>

                            </AgGridReact>
                        </div>
                    </div>
                </div>


                <div className="ag-grid-react">
                    <div className={`ag-grid-wrapper height-width-wrapper ${gotCost && gotCost?.length <= 0 ? "overlay-contain" : ""}`}>
                        <div className='got-given-header border-end-0'>
                            Given Cost Details
                        </div>
                        <div
                            className="ag-theme-material given-report">
                            <AgGridReact
                                defaultColDef={defaultColDef}
                                floatingFilter={true}
                                domLayout='autoHeight'
                                // columnDefs={c}
                                rowData={givenCost}
                                pagination={true}
                                paginationPageSize={100}
                                onGridReady={onGridReady}
                                gridOptions={gridOptions}
                                loadingOverlayComponent={'customLoadingOverlay'}
                                noRowsOverlayComponent={'customNoRowsOverlay'}

                                frameworkComponents={frameworkComponents}
                                suppressRowClickSelection={true}
                                rowSelection={'multiple'}
                            >
                                <AgGridColumn field="VendorName" headerName="Vendor Name" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="SAPCode" headerName="SAP Code" cellRenderer={hyphenFormatter}></AgGridColumn>

                                <AgGridColumn field="PartDescription" headerName="Material Description" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="PartType" width={130} headerName="Type" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialGrossWeight" width={110} headerName="GW" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialRate" width={110} headerName="RM Rate" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialScrapRate" width={110} headerName="Scrap Rate" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialGrossWeightAndRate" width={120} headerName="Gr RM Cost" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialFinishWeight" width={100} headerName="FW" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialScrapWeight" width={130} headerName="Scrap Weight" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NetRawMaterialsCost" width={130} headerName="Net RM Cost" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="ProfitRMTotalCost" width={130} headerName="Profit of Component" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NetProcessOperationAndSTCost" width={170} headerName="Process Cost of Component" cellRenderer={hyphenFormatter}></AgGridColumn>
                                {/* <AgGridColumn field="NetProcessCost" width={170} headerName="Process Cost of Component" cellRenderer={hyphenFormatter}></AgGridColumn>     //RE */}
                                <AgGridColumn field="ProfitCCPercentage" width={170} headerName="Profit of Component on CC (%)" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="SubTotal" width={130} headerName="Sub Total" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NewRawMaterialRate" headerName="Revised RM Rate" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NewRawMaterialScrapRate" width={130} headerName="Revised Scrap Rate" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="RawMaterialCostVariance" width={130} headerName="RM Variance" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="ProductSum" width={130} headerName="Sum product" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NewRejectionCost" width={130} headerName="Rejection" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NewNetFreightPackagingCost" headerName="Packaging and Freight of Part" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NewICCCost" width={130} headerName="ICC of Part" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="NewSubTotal" width={130} headerName="Sub total" cellRenderer={hyphenFormatter}></AgGridColumn>
                                <AgGridColumn field="Total" width={130} headerName="Total" cellRenderer={hyphenFormatter}></AgGridColumn>
                            </AgGridReact>
                        </div>
                    </div>
                </div>


                <div className="ag-grid-react 400px">
                    <div className={`ag-grid-wrapper height-width-wrapper ${gotCost && gotCost?.length <= 0 ? "overlay-contain" : ""}`}>
                        <div className='got-given-header'>
                            Variance
                        </div>
                        <div
                            className="ag-theme-material variance-report">
                            <AgGridReact
                                defaultColDef={defaultColDef}
                                floatingFilter={true}
                                domLayout='autoHeight'
                                // columnDefs={c}
                                rowData={variance}
                                pagination={true}
                                paginationPageSize={100}
                                onGridReady={onGridReady}
                                gridOptions={gridOptions}
                                loadingOverlayComponent={'customLoadingOverlay'}

                                frameworkComponents={frameworkComponents}
                                suppressRowClickSelection={true}
                                rowSelection={'multiple'}
                            >

                                <AgGridColumn width={120} field="TotalDelta" headerName="Variance" cellRenderer={decimalFormatter}></AgGridColumn>
                                <AgGridColumn width={120} field="TotalDeltaPercentage" headerName="Variance (%)" cellRenderer={decimalFormatter}></AgGridColumn>
                            </AgGridReact>
                        </div>
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
