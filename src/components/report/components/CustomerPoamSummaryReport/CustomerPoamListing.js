import React, { useState, useEffect } from 'react'
import { Row, Col, } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { CUSTOMER_POAM_SUMMARY_REPORT, EMPTY_DATA } from '../../../../config/constants'
import DayTime from '../../../common/DayTimeWrapper';
import { PaginationWrapper } from '../../../common/commonPagination';
import { getPoamSummaryReport } from '../../actions/ReportListing';
import NoContentFound from '../../../common/NoContentFound';
import LoaderCustom from '../../../common/LoaderCustom';
import CustomerPoamImpact from './CustomerPoamImpact';
// import ReactExport from 'react-export-excel';
import { CUSTOMER_POAM_EXCEL_TEMPLATE } from '../../ExcelTemplate';
import { reactLocalStorage } from 'reactjs-localstorage';
import Button from '../../../layout/Button';
// const ExcelFile = ReactExport.ExcelFile;
// const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
// const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
function CustomerPoamListing(props) {

    const dispatch = useDispatch()
    const [showList, setShowList] = useState(false)
    const [gridData, setGridData] = useState([])
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setgridColumnApi] = useState(null);
    const [noRecordFound, setNoRecordFound] = useState(false);
    const [isLoader, setIsLoader] = useState(false);
    const [endIndexArray, setEndIndexArray] = useState([]);
    const [customerPoamImpact, setCustomerPoamImpact] = useState(false);
    const [apiObject, setApiObject] = useState({});
    const costReportFormData = useSelector(state => state.report.costReportFormGridData)
    let tableData = costReportFormData && costReportFormData.gridData ? costReportFormData.gridData : [];
    let startDate = costReportFormData && costReportFormData.fromDate
    let endDate = costReportFormData && costReportFormData.toDate


    useEffect(() => {

        let obj = {}
        obj.FromDate = startDate ? DayTime(startDate).format('YYYY-MM-DD HH:mm:ss') : ''
        obj.ToDate = endDate ? DayTime(endDate).format('YYYY-MM-DD HH:mm:ss') : ''
        obj.ShowLastQuarterData = costReportFormData?.includeQuarterData

        let sampleArray = []
        tableData && tableData.map((item) => {
            sampleArray.push({ ProductCategoryId: item.productCategoryId, CustomerId: item.CustomerId, PlantId: item.PlantId, VendorId: item.VendorId ? item.VendorId : '' })
        })
        obj.POAMImpactRequestDetails = sampleArray

        setApiObject(obj)
        setIsLoader(true)
        dispatch(getPoamSummaryReport(obj, (res) => {
            // Set the state to show the list of data
            setShowList(true)

            // Check if there are no records found in the response and update the state
            setNoRecordFound(res?.status === 204 ? false : true)

            // Set the state to hide the loader
            setIsLoader(false)

            // Check if the response data has a "Result" property
            if (res?.data?.Result) {
                // Create an empty array to hold the transformed data
                let temp = []

                // Create an array to hold the end index of each plant's data in the temp array
                let endIndex = []

                // Get the data list from the response
                let Data = res?.data?.DataList

                // Loop through each item in the data list
                Data.map((item, index) => {
                    // Loop through each item's summary report response array
                    item.summaryReportResponse.map((ele, ind) => {
                        // Create a copy of the summary report response object
                        let obj = { ...ele }

                        // If it's the first item in the summary report response array, add the plant name to the object
                        if (ind === 0) {
                            obj.PlantName = `${item.PlantName} (${item.PlantCode})`
                        }

                        // Update other properties in the object
                        obj.CustomerName = ele.CustomerName
                        obj.GroupCode = ele.GroupCode
                        obj.LastQuarterQuantity = ele.LastQuarterQuantity
                        obj.TotalDispatchQuantity = ele.TotalDispatchQuantity
                        obj.TotalPOAMReceivedQuantity = ele.TotalPOAMReceivedQuantity
                        obj.TotalPOAMReceivedCost = ele.TotalPOAMReceivedCost
                        obj.TotalTentitivePOQuantity = ele.TotalTentitivePOQuantity
                        obj.TotalTentitivePOCost = ele.TotalTentitivePOCost
                        obj.TotalNoDispatchQuantity = ele.TotalNoDispatchQuantity
                        obj.TotalNoDispatchCost = ele.TotalNoDispatchCost
                        obj.TotalOneTimeQuantity = ele.TotalOneTimeQuantity
                        obj.TotalOneTimeCost = ele.TotalOneTimeCost
                        obj.TotalAmendmentAwaitedQuantity = ele.TotalAmendmentAwaitedQuantity
                        obj.TotalImpact = ele.TotalImpact
                        obj.Remark = '-'

                        // Push the transformed object to the temp array
                        temp.push(obj)
                    })

                    // Add the end index of the plant's data in the temp array to the endIndex array
                    endIndex.push(temp.length - 1)
                })

                // Set the state with the transformed data
                setGridData(temp)

                // Set the state to show the list of data
                setShowList(true)

                // Set the end index array state
                setEndIndexArray(endIndex)

                // Wait for 400ms before merging the border of the last row for each plant
                setTimeout(() => {
                    endIndex.map((item) => {
                        var row = document.querySelector(`.ag-row[row-index="${item}"] .ag-cell[col-id="PlantName"]`);
                        row?.classList.add("border-bottomRowMerge");
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


    const buttonFormatter = (props) => {
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;

        return (
            <>
                {< button title='View' className="View mr-1" type={'button'} onClick={() => viewData(rowData)} />}
            </>
        )
    };

    const viewData = (data) => {
        let obj = {}
        obj.CustomerId = data.CustomerId
        obj.PlantId = data.PlantId
        obj.VendorId = data.VendorId
        obj.ProductCategoryId = apiObject?.POAMImpactRequestDetails[0]?.ProductCategoryId
        apiObject.POAMImpactRequestDetails = [obj]
        setApiObject(apiObject)

        setTimeout(() => {
            setCustomerPoamImpact(true)
        }, 400);
    }

    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }

    const frameworkComponents = {

        effectiveDateRenderer: effectiveDateFormatter,
        totalValueRenderer: buttonFormatter,
        hyphenFormatter: hyphenFormatter
    };

    const onGridReady = (params) => {
        params.api.paginationGoToPage(0);
        setGridApi(params.api)
        params.api.sizeColumnsToFit();
        setgridColumnApi(params.columnApi);
    };

    const closeDrawerr = () => {

        setCustomerPoamImpact(false)

    }
    const renderColumn = () => {
        return returnExcelColumn(CUSTOMER_POAM_EXCEL_TEMPLATE, gridData)
    }

    const returnExcelColumn = (data = [], TempData) => {
        // return (<ExcelSheet data={TempData} name={CUSTOMER_POAM_SUMMARY_REPORT}>
        //     {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} />)}
        // </ExcelSheet>);
    }
    const resetState = () => {
        gridOptions?.columnApi?.resetColumnState();
        gridOptions?.api?.setFilterModel(null);
    }
    return (
        <>
            {!customerPoamImpact && <div className={"container-fluid"}>
                <form noValidate className="form">
                    <div className='d-flex justify-content-between align-items-center'>
                        <div className='d-flex'>
                            <div className='d-flex align-items-center'>From:  <input value={DayTime(startDate).format('DD/MM/YYYY')} className='form-control ml-1' disabled={true} /> </div>
                            <div className='ml-2 d-flex align-items-center'> To:  <input value={DayTime(endDate).format('DD/MM/YYYY')} className='form-control ml-1' disabled={true} /> </div>
                        </div>
                        <div>

                            {/* <ExcelFile filename={CUSTOMER_POAM_SUMMARY_REPORT} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div></button>}>
                                {renderColumn()}
                            </ExcelFile> */}

                            <Button id={"CustomerPoamListing_refresh"} className={"user-btn mr5 Tour_List_Reset"} onClick={() => resetState()} title={"Reset Grid"} icon={"refresh"} />
                            <button type="button" className={"apply mr-2"} onClick={cancelReport}> <div className={'back-icon'}></div>Back</button>

                        </div>

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
                                                {<AgGridColumn field="PlantName" width="130" headerName="Plant (Code)" cellClass={"colorWhite"} floatingFilter={true}></AgGridColumn>}
                                                {<AgGridColumn field="CustomerName" headerName="Customer Name" floatingFilter={true} width="130" cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                {<AgGridColumn field="GroupCode" headerName="Product Category" width="130" floatingFilter={true} cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                {<AgGridColumn field="LastQuarterQuantity" width="130" headerName="Status of last Quarter II" floatingFilter={true} cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                {<AgGridColumn field="TotalDispatchQuantity" headerName="Sale Parts Quantity (No.)" floatingFilter={true} width="130" cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                {<AgGridColumn field="TotalPOAMReceivedQuantity" headerName="Poam Received Quantity (No.)" width="130" floatingFilter={true} cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                {<AgGridColumn field="TotalPOAMReceivedCost" headerName={`Poam Received Cost (${reactLocalStorage.getObject("baseCurrency")})`} width="130" floatingFilter={true} cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                {<AgGridColumn field="TotalTentitivePOQuantity" headerName="Tentative Po Quantity (No.)" width="130" floatingFilter={true} cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                {<AgGridColumn field="TotalTentitivePOCost" headerName={`Tentative Po Cost (${reactLocalStorage.getObject("baseCurrency")})`} width="130" floatingFilter={true} cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                {<AgGridColumn field="TotalNoDispatchQuantity" headerName="No Dispatch Quantity (No.)" width="130" floatingFilter={true} cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                {<AgGridColumn field="TotalNoDispatchCost" headerName={`No Dispatch Cost (${reactLocalStorage.getObject("baseCurrency")})`} width="130" floatingFilter={true} cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                {<AgGridColumn field="TotalOneTimeQuantity" headerName="One Time Quantity (No.)" width="130" floatingFilter={true} cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                {<AgGridColumn field="TotalOneTimeCost" headerName={`One Time Cost (${reactLocalStorage.getObject("baseCurrency")})`} width="130" floatingFilter={true} cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                {<AgGridColumn field="TotalAmendmentAwaitedQuantity" headerName="Amendmend Awaited Quantity (No.)" width="130" floatingFilter={true} cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                {<AgGridColumn field="TotalImpact" headerName={`Impact Cost (${reactLocalStorage.getObject("baseCurrency")})`} width="130" floatingFilter={true} cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                {<AgGridColumn field="Remark" headerName="Remark" width="130" floatingFilter={true}></AgGridColumn>}
                                                <AgGridColumn width={160} field="TotalImpact" cellClass="ag-grid-action-container" headerName="Action" type="rightAligned" floatingFilter={false} cellRenderer={'totalValueRenderer'}></AgGridColumn>
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
            </div >}

            {customerPoamImpact &&
                <CustomerPoamImpact closeDrawer={closeDrawerr} apiObject={apiObject} />
            }
        </>
    );
}

export default CustomerPoamListing;