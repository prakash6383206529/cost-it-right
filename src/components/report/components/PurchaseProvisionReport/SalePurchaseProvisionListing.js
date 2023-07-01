import React, { useState, useEffect } from 'react'
import { Row, Col, } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { EMPTY_DATA } from '../../../../config/constants'
import DayTime from '../../../common/DayTimeWrapper';
import { PaginationWrapper } from '../../../common/commonPagination';
import { getSalePurchaseProvisionReport } from '../../actions/ReportListing';
import { getConfigurationKey, getCurrencySymbol } from '../../../../helper';
import NoContentFound from '../../../common/NoContentFound';
import LoaderCustom from '../../../common/LoaderCustom';

function SalePurchaseProvisionListing(props) {

    const dispatch = useDispatch()
    const [showList, setShowList] = useState(false)
    const [gridData, setGridData] = useState([])
    const [gridApi, setGridApi] = useState(null);
    const [noRecordFound, setNoRecordFound] = useState(false);
    const [isLoader, setIsLoader] = useState(false);
    const [endIndexArray, setEndIndexArray] = useState([]);
    const costReportFormData = useSelector(state => state.report.costReportFormGridData)
    let tableData = costReportFormData && costReportFormData.gridData ? costReportFormData.gridData : [];
    let startDate = costReportFormData && costReportFormData.fromDate
    let endDate = costReportFormData && costReportFormData.toDate


    useEffect(() => {

        let obj = {}
        obj.FromDate = startDate ? DayTime(startDate).format('MM/DD/YYYY') : ''
        obj.ToDate = endDate ? DayTime(endDate).format('MM/DD/YYYY') : ''

        let sampleArray = []
        tableData && tableData.map((item) => {
            sampleArray.push({ PartId: item.PartId, PlantId: item.PlantId, VendorId: (props.isSaleProvision ? null : item.VendorId), TechnologyId: item.TechnologyId, CustomerId: (props.isSaleProvision ? item.CustomerId : null) })
        })
        obj.salesPurchaseProvisionReportInfoList = sampleArray

        setIsLoader(true)
        dispatch(getSalePurchaseProvisionReport(obj, (res) => {
            setNoRecordFound(res?.status === 204 ? false : true)
            setIsLoader(false)

            if (res?.data?.Result) {
                let temp = []
                let endIndex = []
                let Data = res?.data?.DataList

                Data.map((item, index) => {
                    item.costingInfo.map((ele, ind) => {
                        let obj = { ...ele }
                        if (ind === 0) {
                            obj.PlantName = `${item.PlantName} (${item.PlantCode})`
                            obj.PartNumber = item.PartNumber
                            obj.PartDescription = item.PartDescription
                            obj.VendorName = item.VendorName ? `${item.VendorName} (${item.VendorCode})` : '-'
                            obj.CustomerName = item.CustomerName ? `${item.CustomerName} (${item.CustomerCode})` : '-'
                        }
                        obj.PlantCode = item.PlantCode
                        obj.UnitOfMeasurement = item.UnitOfMeasurement
                        obj.PurchaseOrderNumber = item.PurchaseOrderNumber
                        obj.FromDate = ele.FromDate ? DayTime(ele?.FromDate).format('DD/MM/YYYY') : "-"
                        obj.ToDate = ele.ToDate ? DayTime(ele?.ToDate).format('DD/MM/YYYY') : "-"
                        temp.push(obj)
                    })
                    endIndex.push(temp.length - 1)
                })

                setGridData(temp)
                setShowList(true)

                setEndIndexArray(endIndex)
                setTimeout(() => {
                    endIndex.map((item) => {
                        var row = document.querySelector(`.ag-row[row-index="${item}"] .ag-cell[col-id="PlantName"]`);
                        row.classList.add("border-bottomRowMerge");

                        var row2 = document.querySelector(`.ag-row[row-index="${item}"] .ag-cell[col-id="PartNumber"]`);
                        row2.classList.add("border-bottomRowMerge");

                        var row3 = document.querySelector(`.ag-row[row-index="${item}"] .ag-cell[col-id="PartDescription"]`);
                        row3.classList.add("border-bottomRowMerge");

                        if (!(props.isSaleProvision)) {
                            var row4 = document.querySelector(`.ag-row[row-index="${item}"] .ag-cell[col-id="VendorName"]`);
                            row4?.classList.add("border-bottomRowMerge");
                        }
                        if ((props.isSaleProvision)) {
                            var row5 = document.querySelector(`.ag-row[row-index="${item}"] .ag-cell[col-id="CustomerName"]`);
                            row5?.classList.add("border-bottomRowMerge");
                        }
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
                    var row = document.querySelector(`.ag-row[row-index="${item}"] .ag-cell[col-id="PlantName"]`);
                    row?.classList.add("border-bottomRowMerge");

                    var row2 = document.querySelector(`.ag-row[row-index="${item}"] .ag-cell[col-id="PartNumber"]`);
                    row2?.classList.add("border-bottomRowMerge");

                    var row3 = document.querySelector(`.ag-row[row-index="${item}"] .ag-cell[col-id="PartDescription"]`);
                    row3?.classList.add("border-bottomRowMerge");

                    if (!(props.isSaleProvision)) {
                        var row4 = document.querySelector(`.ag-row[row-index="${item}"] .ag-cell[col-id="VendorName"]`);
                        row4?.classList.add("border-bottomRowMerge");
                    }

                    if ((props.isSaleProvision)) {
                        var row5 = document.querySelector(`.ag-row[row-index="${item}"] .ag-cell[col-id="CustomerName"]`);
                        row5?.classList.add("border-bottomRowMerge");
                    }
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

    const frameworkComponents = {

        effectiveDateRenderer: effectiveDateFormatter
    };

    const onGridReady = (params) => {
        params.api.paginationGoToPage(0);
        setGridApi(params.api)
        params.api.sizeColumnsToFit();
    };

    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined && cellValue !== 0) ? cellValue : '-';
    }

    const POPriceCurrencyFormatter = (props) => {
        const cellValue = props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        const currencySymbol = getCurrencySymbol(rowData?.Currency ? rowData?.Currency : getConfigurationKey().BaseCurrency)
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined && cellValue !== 0) ? currencySymbol + " " + cellValue : '-';
    }
    const dashFormatter = (props) => {
        const cellValue = props?.value;
        return cellValue ? cellValue : '-';
    }


    return (
        <>
            <div className={"container-fluid"}>
                <form noValidate className="form">
                    <div className='analytics-drawer justify-content-between'>
                        <div className='d-flex'>
                            <div>From: <span className=''> {DayTime(startDate).format('DD/MM/YYYY')}</span>  </div>
                            <div className='ml-2'> To: <span className=''> {DayTime(endDate).format('DD/MM/YYYY')}</span>  </div>
                        </div>
                        <button type="button" className={"apply"} onClick={cancelReport}> <div className={'back-icon'}></div>Back</button>
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
                                                {<AgGridColumn field="PlantName" width="150" headerName="Plant (Code)" cellClass={"colorWhite"} floatingFilter={true}></AgGridColumn>}
                                                {!(props.isSaleProvision) && <AgGridColumn field="VendorName" headerName="Vendor (Code)" cellClass={"colorWhite"} floatingFilter={true}></AgGridColumn>}
                                                {(props.isSaleProvision) && <AgGridColumn field="CustomerName" headerName="Customer (Code)" cellClass={"colorWhite"} floatingFilter={true}></AgGridColumn>}
                                                {<AgGridColumn field="PartNumber" headerName="Part Number" width="120" cellClass={"colorWhite"} floatingFilter={true}></AgGridColumn>}
                                                {<AgGridColumn field="PartDescription" width="120" headerName="Part Description" cellClass={"colorWhite"} floatingFilter={true}></AgGridColumn>}

                                                {<AgGridColumn field="PurchaseOrderNumber" headerName="Purch. Doc." cellRenderer={hyphenFormatter} floatingFilter={true}></AgGridColumn>}
                                                <AgGridColumn headerName="Period" headerClass="justify-content-center" marryChildren={true}>
                                                    <AgGridColumn width="150" field="FromDate" headerName="From" />
                                                    <AgGridColumn width="150" field="ToDate" headerName="To" />
                                                </AgGridColumn>
                                                {<AgGridColumn field="UnitOfMeasurement" headerName="UOM" floatingFilter={true}></AgGridColumn>}
                                                {<AgGridColumn field="OldRate" width="120" headerName="Existing Po Price (INR)" cellRenderer={POPriceCurrencyFormatter} floatingFilter={true}></AgGridColumn>}
                                                {<AgGridColumn field="NewRate" width="120" headerName="Revised Po Price (INR)" cellRenderer={POPriceCurrencyFormatter} floatingFilter={true}></AgGridColumn>}
                                                {<AgGridColumn field="Difference" headerName="Variance (w.r.t. Existing)" cellRenderer={dashFormatter} floatingFilter={true}></AgGridColumn>}
                                                {<AgGridColumn field="SupplyQuantity" headerName="Supply Quantity (No.)" floatingFilter={true}></AgGridColumn>}
                                                {<AgGridColumn field="Impact" headerName="Impact" floatingFilter={true}></AgGridColumn>}
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

export default SalePurchaseProvisionListing;