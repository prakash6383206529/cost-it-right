import React, { useState, useEffect } from 'react'
import { Row, Col } from 'reactstrap'
import NoContentFound from '../../../common/NoContentFound'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { EMPTY_DATA, EMPTY_GUID, GOT_GIVEN_REPORT, defaultPageSize } from '../../../../config/constants';
import LoaderCustom from '../../../common/LoaderCustom';
import { useDispatch, useSelector } from 'react-redux';
import { getGotAndGivenDetails } from '../../actions/ReportListing';
import { checkForDecimalAndNull } from '../../../../helper';
import GotGivenListing from './GotGivenListing';
import ReactExport from 'react-export-excel';
import { GOT_GIVEN_EXCEL_TEMPLATE_SUMMARY } from '../../ExcelTemplate';
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

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
    const [nodataFound, setNodataFound] = useState(false);
    const [isLoader, setIsLoader] = useState(false)
    const dispatch = useDispatch()
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)

    useEffect(() => {
        let obj = {}
        obj.plantId = props?.plantId
        obj.partId = part ? (part.value ? part.value : EMPTY_GUID) : EMPTY_GUID
        obj.productCategoryId = product ? (product.value ? product.value : EMPTY_GUID) : EMPTY_GUID
        obj.isRequestForSummary = true
        obj.customerId = props?.customerId
        obj.vendorId = props?.vendorId
        setIsLoader(true)
        dispatch(getGotAndGivenDetails(obj, (res) => {
            setIsLoader(false)
            if (res.status === 200) {
                setGotCost(res.data.Data.GotCostingDetails)
                setGivenCost(res.data.Data.GivenCostingDetails)
                setVariance(res.data.Data.GotAndGivenVariance)
            } else {
                setNodataFound(true)
            }
        }))
    }, [])


    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);

    };

    const onGridReadyVariance = (params) => {
        params.api.sizeColumnsToFit()

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
            <button title='View' className="View mr-1" type={'button'} onClick={() => EditItemDetails(cellValue, rowData)} />

        )
    };


    const frameworkComponents = {
        customLoadingOverlay: LoaderCustom,
        totalValueRenderer: buttonFormatter
    };

    const exitReport = () => {
        props.closeDrawer()
    }

    const decimalFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        let value = cell != null ? checkForDecimalAndNull(cell, initialConfiguration?.NoOfDecimalForPrice) : '';
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

    const renderColumn = () => {
        return returnExcelColumn(GOT_GIVEN_EXCEL_TEMPLATE_SUMMARY, gotCost)
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

        return (<ExcelSheet data={tempArray} name={GOT_GIVEN_REPORT}>
            {tempData && tempData.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} />)}
        </ExcelSheet>);
    }

    return (
        <>
            {!mainGotGivenListing && <div className="container-fluid report-listing-page ag-grid-react ">
                <Row className="pt-4 blue-before ">
                    <Col md="6" lg="6" className="search-user-block mb-3">
                        <div className="d-flex justify-content-end bd-highlight excel-btn w100">
                            <ExcelFile filename={'Got Given Report'} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div></button>}>
                                {renderColumn()}
                            </ExcelFile>
                            <div className="mb-3"><button type="button" className={"apply"} onClick={exitReport}> <div className={'back-icon'}></div>Back</button></div>

                        </div>
                    </Col>
                </Row>
                {isLoader && <LoaderCustom />}
                {nodataFound ? <NoContentFound title={EMPTY_DATA} /> : <div className='got-given-summary-container mt-4'>

                    <div className="ag-grid-react -800px">
                        <div className={`ag-grid-wrapper height-width-wrapper ${gotCost && gotCost?.length <= 0 ? "overlay-contain" : ""}`}>
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
                                    frameworkComponents={frameworkComponents}
                                    suppressRowClickSelection={true}
                                    rowSelection={'multiple'}
                                >
                                    <AgGridColumn field="TokenNumber" width={140} headerName="Model No." cellRenderer={hyphenFormatter}></AgGridColumn>
                                    <AgGridColumn field="PartNumber" width={150} headerName="Part No." cellRenderer={hyphenFormatter}></AgGridColumn>
                                    <AgGridColumn field="PartDescription" headerName="Part Description" cellRenderer={hyphenFormatter}></AgGridColumn>
                                    <AgGridColumn field="VendorName" headerName="BAL Sale Rate 01.01.22 (A)" cellRenderer={hyphenFormatter}></AgGridColumn>
                                    <AgGridColumn field="NetPOPrice" width={131} headerName="Got Cost" cellRenderer={hyphenFormatter}></AgGridColumn>
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
                                    rowData={givenCost}
                                    pagination={true}
                                    paginationPageSize={defaultPageSize}
                                    onGridReady={onGridReady}
                                    gridOptions={gridOptions}
                                    loadingOverlayComponent={'customLoadingOverlay'}
                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                    frameworkComponents={frameworkComponents}
                                    suppressRowClickSelection={true}
                                    rowSelection={'multiple'}
                                >

                                    <AgGridColumn width={160} field="NetPOPrice" headerName="Given Cost" cellRenderer={decimalFormatter}></AgGridColumn>

                                </AgGridReact>
                            </div>
                        </div>
                    </div>


                    <div className="ag-grid-react -600px">
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
                                    onGridReady={onGridReadyVariance}
                                    gridOptions={gridOptions}
                                    loadingOverlayComponent={'customLoadingOverlay'}
                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                    frameworkComponents={frameworkComponents}
                                    suppressRowClickSelection={true}
                                    rowSelection={'multiple'}
                                >
                                    <AgGridColumn field="NetPOPriceDelta" headerName="Variance" cellRenderer={decimalFormatter}></AgGridColumn>
                                    <AgGridColumn field="NetPOPriceDeltaPercentage" headerName="Variance (%)" cellRenderer={decimalFormatter}></AgGridColumn>
                                    <AgGridColumn field="PartId" cellClass="ag-grid-action-container" headerName="Actions" cellRenderer={'totalValueRenderer'}></AgGridColumn>
                                </AgGridReact>
                            </div>
                        </div>
                    </div>
                </div>}

            </div >}
            {
                mainGotGivenListing &&
                < GotGivenListing
                    part={selectedPartId}
                    closeDrawer={closeDrawer}
                    customerId={props?.customerId}
                    plantId={props.plantId}
                    vendorId={props.vendorId}

                />
            }
        </>
    );

}

export default GotGivenSummary
