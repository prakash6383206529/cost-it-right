import React, { useState, useEffect } from 'react'
import { Row, Col, } from 'reactstrap';
import { useDispatch } from 'react-redux'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { CUSTOMER_POAM_IMPACT, EMPTY_DATA } from '../../../../config/constants'
import DayTime from '../../../common/DayTimeWrapper';
import { PaginationWrapper } from '../../../common/commonPagination';
import { getPoamImpactReport } from '../../actions/ReportListing';
import NoContentFound from '../../../common/NoContentFound';
import LoaderCustom from '../../../common/LoaderCustom';
import ReactExport from 'react-export-excel';
import { CUSTOMER_POAM_IMPACT_EXCEL_TEMPLATE } from '../../ExcelTemplate';
import { reactLocalStorage } from 'reactjs-localstorage';
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
function CustomerPoamImpact(props) {
    const { apiObject } = props

    const dispatch = useDispatch()
    const [showList, setShowList] = useState(false)
    const [gridData, setGridData] = useState([])
    const [gridApi, setGridApi] = useState(null);
    const [noRecordFound, setNoRecordFound] = useState(false);
    const [isLoader, setIsLoader] = useState(false);
    const [endIndexArray, setEndIndexArray] = useState([]);

    useEffect(() => {

        setIsLoader(true)
        dispatch(getPoamImpactReport(apiObject, (res) => {
            // Set show list to true to display the results
            setShowList(true)
            // Set no record found to false if response status is 204 (no content), otherwise true
            setNoRecordFound(res?.status === 204 ? false : true)
            // Set is loader to false to hide the loader
            setIsLoader(false)

            if (res?.data?.Result) {
                let temp = []
                let endIndex = []
                let Data = res?.data?.DataList

                // Loop through the data and extract the required information
                Data.map((item, index) => {
                    item.POAMImpactResponseDetails?.map((ele, ind) => {
                        let obj = { ...ele }
                        if (ind === 0) {
                            obj.CustomerName = item.CustomerName ? `${item.CustomerName} (${item.CustomerCode})` : '-'
                            obj.PartNumber = item.PartNumber ? item.PartNumber : '-'
                            obj.PartDescription = item.PartDescription ? item.PartDescription : '-'
                            obj.TotalDispatchQuantity = item.TotalDispatchQuantity ? item.TotalDispatchQuantity : '-'
                            obj.TotalImpact = item.TotalImpact ? item.TotalImpact : '-'
                        }

                        obj.PurchaseDocumentNumber = ele.PurchaseDocumentNumber
                        obj.POAMStatus = ele.POAMStatus
                        obj.DispatchQuantity = ele.DispatchQuantity
                        obj.NewRate = ele.NewRate
                        obj.OldRate = ele.OldRate
                        obj.Impact = ele.Impact
                        obj.FromDate = ele.FromDate ? DayTime(ele?.FromDate).format('DD/MM/YYYY') : "-"
                        obj.ToDate = ele.ToDate ? DayTime(ele?.ToDate).format('DD/MM/YYYY') : "-"
                        temp.push(obj)
                    })
                    endIndex.push(temp.length - 1)
                })

                // Set the extracted data to the grid data and show the list
                setGridData(temp)
                setShowList(true)

                // Set the end index array for merging rows in the grid
                setEndIndexArray(endIndex)

                // Wait for 400ms and then merge rows in the grid
                setTimeout(() => {
                    endIndex.map((item) => {
                        var row = document.querySelector(`.ag-row[row-index="${item}"] .ag-cell[col-id="CustomerName"]`);
                        row?.classList.add("border-bottomRowMerge");

                        var row2 = document.querySelector(`.ag-row[row-index="${item}"] .ag-cell[col-id="PartNumber"]`);
                        row2?.classList.add("border-bottomRowMerge");

                        var row3 = document.querySelector(`.ag-row[row-index="${item}"] .ag-cell[col-id="PartDescription"]`);
                        row3?.classList.add("border-bottomRowMerge");

                        var row4 = document.querySelector(`.ag-row[row-index="${item}"] .ag-cell[col-id="TotalDispatchQuantity"]`);
                        row4?.classList.add("border-bottomRowMerge");

                        var row5 = document.querySelector(`.ag-row[row-index="${item}"] .ag-cell[col-id="TotalImpact"]`);
                        row5?.classList.add("border-bottomRowMerge");
                    })
                }, 400);
            }
        }))


    }, [])


    const cancelReport = () => {
        props.closeDrawer('')

    }

    const gridOptions = {};

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
    };

    const handleBodyScroll = (event) => {
        // The event parameter contains information about the scroll position
        if (endIndexArray && endIndexArray.length > 0) {
            setTimeout(() => {
                endIndexArray.map((item) => {
                    var row = document.querySelector(`.ag-row[row-index="${item}"] .ag-cell[col-id="CustomerName"]`);
                    row?.classList.add("border-bottomRowMerge");

                    var row2 = document.querySelector(`.ag-row[row-index="${item}"] .ag-cell[col-id="PartNumber"]`);
                    row2?.classList.add("border-bottomRowMerge");

                    var row3 = document.querySelector(`.ag-row[row-index="${item}"] .ag-cell[col-id="PartDescription"]`);
                    row3?.classList.add("border-bottomRowMerge");

                    var row4 = document.querySelector(`.ag-row[row-index="${item}"] .ag-cell[col-id="TotalDispatchQuantity"]`);
                    row4?.classList.add("border-bottomRowMerge");

                    var row5 = document.querySelector(`.ag-row[row-index="${item}"] .ag-cell[col-id="TotalImpact"]`);
                    row5?.classList.add("border-bottomRowMerge");

                })
            }, 400);

        }
    };

    const effectiveDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
    }

    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
    };


    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }

    const frameworkComponents = {
        effectiveDateRenderer: effectiveDateFormatter,
        hyphenFormatter: hyphenFormatter
    };

    const onGridReady = (params) => {
        params.api.paginationGoToPage(0);
        setGridApi(params.api)
        params.api.sizeColumnsToFit();
    };
    const renderColumn = () => {
        return returnExcelColumn(CUSTOMER_POAM_IMPACT_EXCEL_TEMPLATE, gridData)
    }

    const returnExcelColumn = (data = [], TempData) => {
        return (<ExcelSheet data={TempData} name={CUSTOMER_POAM_IMPACT}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} />)}
        </ExcelSheet>);
    }
    return (
        <>
            <div className={"container-fluid"}>
                <form noValidate className="form">
                    <div className='analytics-drawer justify-content-end'>
                        <ExcelFile filename={CUSTOMER_POAM_IMPACT} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div></button>}>
                            {renderColumn()}
                        </ExcelFile>
                        <button type="button" className={"apply mr-2"} onClick={cancelReport}> <div className={'back-icon'}></div>Back</button>

                    </div>
                    {showList &&
                        <Row>
                            <Col>
                                <div className='ag-grid-react'>
                                    <div className="ag-grid-wrapper height-width-wrapper">
                                        <div className="ag-grid-header">
                                        </div>
                                        <div className="ag-theme-material">
                                            <AgGridReact
                                                defaultColDef={defaultColDef}
                                                domLayout='autoHeight'
                                                // suppressRowTransform={true}
                                                onBodyScroll={handleBodyScroll}
                                                floatingFilter={true}
                                                rowData={gridData}
                                                pagination={true}
                                                paginationPageSize={10}
                                                onGridReady={onGridReady}
                                                gridOptions={gridOptions}

                                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                                noRowsOverlayComponentParams={{
                                                    title: EMPTY_DATA,
                                                    imagClass: 'imagClass'
                                                }}
                                                frameworkComponents={frameworkComponents}
                                                rowSelection={'multiple'}
                                            >
                                                {<AgGridColumn field='CustomerName' width="130" headerName="Customer (Code)" cellClass={"colorWhite"} floatingFilter={true}></AgGridColumn>}
                                                {<AgGridColumn field="PartNumber" headerName="Part no." floatingFilter={true} cellClass={"colorWhite"} width="130"></AgGridColumn>}
                                                {<AgGridColumn field="PartDescription" width="130" headerName="Part Description" cellClass={"colorWhite"} floatingFilter={true}></AgGridColumn>}
                                                {<AgGridColumn field="TotalDispatchQuantity" headerName="Dispatch Quantity" floatingFilter={true} cellClass={"colorWhite"} width="130"></AgGridColumn>}
                                                {<AgGridColumn field="TotalImpact" headerName="Total Impact" width="130" floatingFilter={true} cellClass={"colorWhite"}></AgGridColumn>}

                                                {<AgGridColumn field="PurchaseDocumentNumber" headerName="Purchase Doc" width="130" floatingFilter={true} cellRenderer={hyphenFormatter} ></AgGridColumn>}
                                                {<AgGridColumn field="POAMStatus" headerName="Poam status" width="130" floatingFilter={true} cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                {<AgGridColumn field="DispatchQuantity" headerName="Dispatch Quantity (No.)" width="130" floatingFilter={true} cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                {<AgGridColumn field="FromDate" headerName="Old Effective Date" width="130" floatingFilter={true} cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                {<AgGridColumn field="ToDate" headerName="New Effective Date" width="130" floatingFilter={true} cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                {<AgGridColumn field="OldRate" headerName={`Old Rate (${reactLocalStorage.getObject("baseCurrency")})`} width="130" floatingFilter={true} cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                {<AgGridColumn field="NewRate" headerName={`New Rate (${reactLocalStorage.getObject("baseCurrency")})`} width="130" floatingFilter={true} cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                {<AgGridColumn field="Variance" headerName="Variance" width="130" floatingFilter={true} cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                {<AgGridColumn field="Impact" headerName="Impact" width="130" floatingFilter={true} cellRenderer={hyphenFormatter}></AgGridColumn>}
                                            </AgGridReact>
                                            <PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    }
                </form>
                {!noRecordFound && <div className='h-298 d-flex align-items-center mt-3'>
                    <NoContentFound title={'Cost card is not available for this date range'} />
                </div>}
                {isLoader && <LoaderCustom customClass="center-loader" />}
            </div >
        </>
    );
}

export default CustomerPoamImpact;
