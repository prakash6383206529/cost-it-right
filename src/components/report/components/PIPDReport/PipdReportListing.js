import { AgGridColumn, AgGridReact } from "ag-grid-react"
import React, { useEffect } from "react"
import { EMPTY_DATA } from "../../../../config/constants"
import { Col, Row } from "reactstrap"
import DayTime from "../../../common/DayTimeWrapper"
import { useState } from "react"
import { PaginationWrapper, onPageSizeChanged } from "../../../common/commonPagination"
import LoaderCustom from "../../../common/LoaderCustom"
import NoContentFound from "../../../common/NoContentFound"
import { useSelector } from "react-redux"
import { getConfigurationKey, showBopLabel } from "../../../../helper"

const gridOptions = {};
function PipdReportListing(props) {
    const [gridData, setGridData] = useState([])
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setgridColumnApi] = useState(null);
    const [noRecordFound, setNoRecordFound] = useState(false);
    const [isLoader, setIsLoader] = useState(true);
    const costReportFormData = useSelector(state => state.report.costReportFormGridData)

    const startDate = costReportFormData && costReportFormData.fromDate
    const endDate = costReportFormData && costReportFormData.toDate
    const isPlant = costReportFormData && costReportFormData.isPlant
    const isCompany = costReportFormData && costReportFormData.isCompany

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,

    };

    setTimeout(() => {
        setIsLoader(false)
    }, 800);

    const PIPDDataCompany = [

        {
            "Name": "",
            "PriceType": "Price Increase",
            "1/3/2022": "200",
            "1/4/2022": "200",
            "1/5/2023": "100",
            "1/6/2023": "400",
            "1/7/2023": "100",
            "1/9/2023": "200",
            "1/11/2023": "300",
            "Total": "1500"
        },
        {
            "Name": "4W Light",
            "PriceType": "Price Decrease",
            "1/3/2022": "400",
            "1/4/2022": "0",
            "1/5/2023": "50",
            "1/6/2023": "300",
            "1/7/2023": "100",
            "1/9/2023": "0",
            "1/11/2023": "200",
            "Total": "1050"
        },
        {
            "Name": "",
            "PriceType": "Net",
            "1/3/2022": "200",
            "1/4/2022": "-200",
            "1/5/2023": "-50",
            "1/6/2023": "-100",
            "1/7/2023": "0",
            "1/9/2023": "-200",
            "1/11/2023": "-100",
            "Total": "-450"
        },
        {
            "Name": "",
            "PriceType": "Price Increase",
            "1/3/2022": "500",
            "1/4/2022": "300",
            "1/5/2023": "200",
            "1/6/2023": "400",
            "1/7/2023": "100",
            "1/9/2023": "200",
            "1/11/2023": "300",
            "Total": "2000"
        },
        {
            "Name": "2W Light",
            "PriceType": "Price Decrease",
            "1/3/2022": "0",
            "1/4/2022": "200",
            "1/5/2023": "0",
            "1/6/2023": "300",
            "1/7/2023": "100",
            "1/9/2023": "",
            "1/11/2023": "200",
            "Total": "800"
        },
        {
            "Name": "",
            "PriceType": "Net",
            "1/3/2022": "-500",
            "1/4/2022": "-100",
            "1/5/2023": "-200",
            "1/6/2023": "-100",
            "1/7/2023": "0",
            "1/9/2023": "-200",
            "1/11/2023": "-100",
            "Total": "-1200"
        },
        {
            "Name": "",
            "PriceType": "Price Increase",
            "1/3/2022": "600",
            "1/4/2022": "400",
            "1/5/2023": "300",
            "1/6/2023": "500",
            "1/7/2023": "200",
            "1/9/2023": "300",
            "1/11/2023": "400",
            "Total": "2700"
        },
        {
            "Name": "Acoustics",
            "PriceType": "Price Decrease",
            "1/3/2022": "0",
            "1/4/2022": "200",
            "1/5/2023": "0",
            "1/6/2023": "300",
            "1/7/2023": "100",
            "1/9/2023": "0",
            "1/11/2023": "200",
            "Total": "800"
        },
        {
            "Name": "",
            "PriceType": "Net",
            "1/3/2022": "-600",
            "1/4/2022": "-200",
            "1/5/2023": "-300",
            "1/6/2023": "-200",
            "1/7/2023": "-100",
            "1/9/2023": "-300",
            "1/11/2023": "-200",
            "Total": "-1900"
        },
        {
            "Name": "",
            "PriceType": "Price Increase",
            "1/3/2022": "500",
            "1/4/2022": "500",
            "1/5/2023": "500",
            "1/6/2023": "500",
            "1/7/2023": "500",
            "1/9/2023": "500",
            "1/11/2023": "500",
            "Total": "3500"
        },
        {
            "Name": "MWTL",
            "PriceType": "Price Decrease",
            "1/3/2022": "400",
            "1/4/2022": "400",
            "1/5/2023": "400",
            "1/6/2023": "400",
            "1/7/2023": "400",
            "1/9/2023": "400",
            "1/11/2023": "400",
            "Total": "2800"
        },
        {
            "Name": "",
            "PriceType": "Net",
            "1/3/2022": "-100",
            "1/4/2022": "-100",
            "1/5/2023": "-100",
            "1/6/2023": "-100",
            "1/7/2023": "-100",
            "1/9/2023": "-100",
            "1/11/2023": "-100",
            "Total": "-700"
        },
        {
            "Name": "",
            "PriceType": "Price Increase",
            "1/3/2022": "500",
            "1/4/2022": "500",
            "1/5/2023": "500",
            "1/6/2023": "200",
            "1/7/2023": "100",
            "1/9/2023": "500",
            "1/11/2023": "500",
            "Total": "2800"
        },
        {
            "Name": "2W Switch",
            "PriceType": "Price Decrease",
            "1/3/2022": "400",
            "1/4/2022": "200",
            "1/5/2023": "100",
            "1/6/2023": "500",
            "1/7/2023": "700",
            "1/9/2023": "100",
            "1/11/2023": "20",
            "Total": "2020"
        },
        {
            "Name": "",
            "PriceType": "Net",
            "1/3/2022": "-100",
            "1/4/2022": "-300",
            "1/5/2023": "-400",
            "1/6/2023": "300",
            "1/7/2023": "600",
            "1/9/2023": "-400",
            "1/11/2023": "-480",
            "Total": "-780"
        }
    ]

    const PIPDDataTechnology = [
        {
            "Name": "",
            "PriceType": "Price Increase",
            "1/3/2022": "60",
            "1/4/2022": "30",
            "1/5/2023": "100",
            "1/6/2023": "100",
            "1/7/2023": "40",
            "1/9/2023": "0",
            "1/11/2023": "0",
            "Total": "330"
        },
        {
            "Name": "RM Cost",
            "PriceType": "Price Decrease",
            "1/3/2022": "300",
            "1/4/2022": "0",
            "1/5/2023": "15",
            "1/6/2023": "0",
            "1/7/2023": "0",
            "1/9/2023": "0",
            "1/11/2023": "0",
            "Total": "315"
        },
        {
            "Name": "",
            "PriceType": "Net",
            "1/3/2022": "240",
            "1/4/2022": "-30",
            "1/5/2023": "-85",
            "1/6/2023": "-100",
            "1/7/2023": "-40",
            "1/9/2023": "0",
            "1/11/2023": "0",
            "Total": "-15"
        },
        {
            "Name": "",
            "PriceType": "Price Increase",
            "1/3/2022": "40",
            "1/4/2022": "15",
            "1/5/2023": "0",
            "1/6/2023": "100",
            "1/7/2023": "35",
            "1/9/2023": "0",
            "1/11/2023": "0",
            "Total": "190"
        },
        {
            "Name": `${showBopLabel()} Cost`,
            "PriceType": "Price Decrease",
            "1/3/2022": "0",
            "1/4/2022": "0",
            "1/5/2023": "0",
            "1/6/2023": "0",
            "1/7/2023": "0",
            "1/9/2023": "0",
            "1/11/2023": "100",
            "Total": "100"
        },
        {
            "Name": "",
            "PriceType": "Net",
            "1/3/2022": "-40",
            "1/4/2022": "-15",
            "1/5/2023": "0",
            "1/6/2023": "-100",
            "1/7/2023": "-35",
            "1/9/2023": "0",
            "1/11/2023": "100",
            "Total": "-90"
        },
        {
            "Name": "",
            "PriceType": "Price Increase",
            "1/3/2022": "0",
            "1/4/2022": "0",
            "1/5/2023": "0",
            "1/6/2023": "0",
            "1/7/2023": "0",
            "1/9/2023": "0",
            "1/11/2023": "200",
            "Total": "200"
        },
        {
            "Name": "Conversion Cost",
            "PriceType": "Price Decrease",
            "1/3/2022": "0",
            "1/4/2022": "0",
            "1/5/2023": "0",
            "1/6/2023": "0",
            "1/7/2023": "60",
            "1/9/2023": "0",
            "1/11/2023": "0",
            "Total": "60"
        },
        {
            "Name": "",
            "PriceType": "Net",
            "1/3/2022": "0",
            "1/4/2022": "0",
            "1/5/2023": "0",
            "1/6/2023": "0",
            "1/7/2023": "60",
            "1/9/2023": "0",
            "1/11/2023": "-200",
            "Total": "-140"
        },
        {
            "Name": "",
            "PriceType": "Price Increase",
            "1/3/2022": "0",
            "1/4/2022": "0",
            "1/5/2023": "0",
            "1/6/2023": "0",
            "1/7/2023": "0",
            "1/9/2023": "0",
            "1/11/2023": "0",
            "Total": "0"
        },
        {
            "Name": "Overhead & Profit Cost",
            "PriceType": "Price Decrease",
            "1/3/2022": "0",
            "1/4/2022": "0",
            "1/5/2023": "0",
            "1/6/2023": "0",
            "1/7/2023": "0",
            "1/9/2023": "0",
            "1/11/2023": "0",
            "Total": "0"
        },
        {
            "Name": "",
            "PriceType": "Net",
            "1/3/2022": "0",
            "1/4/2022": "0",
            "1/5/2023": "0",
            "1/6/2023": "0",
            "1/7/2023": "0",
            "1/9/2023": "0",
            "1/11/2023": "0",
            "Total": "0"
        },
        {
            "Name": "",
            "PriceType": "Price Increase",
            "1/3/2022": "0",
            "1/4/2022": "30",
            "1/5/2023": "0",
            "1/6/2023": "0",
            "1/7/2023": "0",
            "1/9/2023": "50",
            "1/11/2023": "0",
            "Total": "80"
        },
        {
            "Name": "Packaging & Freight Cost",
            "PriceType": "Price Decrease",
            "1/3/2022": "0",
            "1/4/2022": "0",
            "1/5/2023": "25",
            "1/6/2023": "0",
            "1/7/2023": "40",
            "1/9/2023": "0",
            "1/11/2023": "0",
            "Total": "65"
        },
        {
            "Name": "",
            "PriceType": "Net",
            "1/3/2022": "0",
            "1/4/2022": "-30",
            "1/5/2023": "25",
            "1/6/2023": "0",
            "1/7/2023": "40",
            "1/9/2023": "-50",
            "1/11/2023": "0",
            "Total": "-15"
        },
        {
            "Name": "",
            "PriceType": "Price Increase",
            "1/3/2022": "0",
            "1/4/2022": "0",
            "1/5/2023": "0",
            "1/6/2023": "0",
            "1/7/2023": "0",
            "1/9/2023": "0",
            "1/11/2023": "0",
            "Total": "0"
        },
        {
            "Name": "Tool Cost",
            "PriceType": "Price Decrease",
            "1/3/2022": "0",
            "1/4/2022": "0",
            "1/5/2023": "0",
            "1/6/2023": "50",
            "1/7/2023": "0",
            "1/9/2023": "0",
            "1/11/2023": "0",
            "Total": "50"
        },
        {
            "Name": "",
            "PriceType": "Net",
            "1/3/2022": "0",
            "1/4/2022": "0",
            "1/5/2023": "0",
            "1/6/2023": "50",
            "1/7/2023": "0",
            "1/9/2023": "0",
            "1/11/2023": "0",
            "Total": "50"
        },
        {
            "Name": "",
            "PriceType": "Price Increase",
            "1/3/2022": "0",
            "1/4/2022": "0",
            "1/5/2023": "0",
            "1/6/2023": "0",
            "1/7/2023": "0",
            "1/9/2023": "0",
            "1/11/2023": "0",
            "Total": "0"
        },
        {
            "Name": "Other Cost",
            "PriceType": "Price Decrease",
            "1/3/2022": "0",
            "1/4/2022": "0",
            "1/5/2023": "10",
            "1/6/2023": "100",
            "1/7/2023": "0",
            "1/9/2023": "0",
            "1/11/2023": "0",
            "Total": "110"
        },
        {
            "Name": "",
            "PriceType": "Net",
            "1/3/2022": "0",
            "1/4/2022": "0",
            "1/5/2023": "10",
            "1/6/2023": "100",
            "1/7/2023": "0",
            "1/9/2023": "0",
            "1/11/2023": "0",
            "Total": "110"
        }
    ]

    const PIPDDataPLant = [
        {
            "Name": "",
            "PriceType": "Price Increase",
            "1/3/2022": "100",
            "1/4/2022": "75",
            "1/5/2023": "100",
            "1/6/2023": "200",
            "1/7/2023": "75",
            "1/9/2023": "50",
            "1/11/2023": "200",
            "Total": "800"
        },
        {
            "Name": "1031",
            "PriceType": "Price Decrease",
            "1/3/2022": "300",
            "1/4/2022": "0",
            "1/5/2023": "50",
            "1/6/2023": "200",
            "1/7/2023": "100",
            "1/9/2023": "0",
            "1/11/2023": "100",
            "Total": "750"
        },
        {
            "Name": "",
            "PriceType": "Net",
            "1/3/2022": "200",
            "1/4/2022": "-75",
            "1/5/2023": "-50",
            "1/6/2023": "0",
            "1/7/2023": "25",
            "1/9/2023": "-50",
            "1/11/2023": "-100",
            "Total": "-50"
        },
        {
            "Name": "",
            "PriceType": "Price Increase",
            "1/3/2022": "100",
            "1/4/2022": "125",
            "1/5/2023": "0",
            "1/6/2023": "200",
            "1/7/2023": "25",
            "1/9/2023": "150",
            "1/11/2023": "100",
            "Total": "700"
        },
        {
            "Name": "1032",
            "PriceType": "Price Decrease",
            "1/3/2022": "100",
            "1/4/2022": "0",
            "1/5/2023": "0",
            "1/6/2023": "100",
            "1/7/2023": "0",
            "1/9/2023": "0",
            "1/11/2023": "100",
            "Total": "300"
        },
        {
            "Name": "",
            "PriceType": "Net",
            "1/3/2022": "0",
            "1/4/2022": "-125",
            "1/5/2023": "0",
            "1/6/2023": "-100",
            "1/7/2023": "-25",
            "1/9/2023": "-150",
            "1/11/2023": "0",
            "Total": "-400"
        },
        {
            "Name": "",
            "PriceType": "Price Increase",
            "1/3/2022": "0",
            "1/4/2022": "0",
            "1/5/2023": "0",
            "1/6/2023": "0",
            "1/7/2023": "0",
            "1/9/2023": "0",
            "1/11/2023": "0",
            "Total": "0"
        },
        {
            "Name": "1035",
            "PriceType": "Price Decrease",
            "1/3/2022": "0",
            "1/4/2022": "0",
            "1/5/2023": "0",
            "1/6/2023": "0",
            "1/7/2023": "0",
            "1/9/2023": "0",
            "1/11/2023": "0",
            "Total": "0"
        },
        {
            "Name": "",
            "PriceType": "Net",
            "1/3/2022": "0",
            "1/4/2022": "0",
            "1/5/2023": "0",
            "1/6/2023": "0",
            "1/7/2023": "0",
            "1/9/2023": "0",
            "1/11/2023": "0",
            "Total": "0"
        },
        {
            "Name": "",
            "PriceType": "Price Increase",
            "1/3/2022": "0",
            "1/4/2022": "0",
            "1/5/2023": "0",
            "1/6/2023": "0",
            "1/7/2023": "0",
            "1/9/2023": "0",
            "1/11/2023": "0",
            "Total": "0"
        },
        {
            "Name": "1036",
            "PriceType": "Price Decrease",
            "1/3/2022": "0",
            "1/4/2022": "0",
            "1/5/2023": "0",
            "1/6/2023": "0",
            "1/7/2023": "0",
            "1/9/2023": "0",
            "1/11/2023": "0",
            "Total": "0"
        },
        {
            "Name": "",
            "PriceType": "Net",
            "1/3/2022": "0",
            "1/4/2022": "0",
            "1/5/2023": "0",
            "1/6/2023": "0",
            "1/7/2023": "0",
            "1/9/2023": "0",
            "1/11/2023": "0",
            "Total": "0"
        },
    ]


    useEffect(() => {
        if (isPlant) {
            setGridData(PIPDDataTechnology)
        } else if (isCompany) {
            setGridData(PIPDDataPLant)
        }
        else {
            setGridData(PIPDDataCompany)
        }
    }, [isPlant, isCompany])
    const onGridReady = (params) => {
        params.api.paginationGoToPage(0);
        setGridApi(params.api)
        window.screen.width >= 1440 && params.api.sizeColumnsToFit();
        setgridColumnApi(params.columnApi);
    };
    const cancelReport = () => {
        props?.viewListing(false)

    }
    const resetState = () => {
        gridOptions?.columnApi?.resetColumnState();
        gridOptions?.api?.setFilterModel(null);
    }
    const effectiveDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';
    }

    const BoldCellRenderer = (props) => {
        return <span style={{ fontWeight: 'bold' }}>{props.value}</span>;
    };
    const rowClassRules = {
        'highlight-row': (params) => {
            return params.data.PriceType === 'Net';
        },
    };
    const frameworkComponents = {
        effectiveDateRenderer: effectiveDateFormatter,
        BoldCellRenderer: BoldCellRenderer
    };
    return (
        <>
            <div className={"container-fluid"}>
                <form noValidate className="form">
                    <div className='d-flex justify-content-between align-items-center'>
                        <div className='d-flex'>
                            <div className='d-flex align-items-center'>From:
                                <input value={DayTime(startDate).format('DD/MM/YYYY')} className='form-control ml-1' disabled={true} />
                            </div>
                            <div className='ml-2 d-flex align-items-center'> To: <input value={DayTime(endDate).format('DD/MM/YYYY')} className='form-control ml-1' disabled={true} />
                            </div>
                        </div>

                        <div>
                            {/* <ExcelFile filename={props.isSaleProvision ? SALES_PROVISION_REPORT : PURCHASE_PROVISION_REPORT} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div></button>}>
                                {renderColumn()}
                            </ExcelFile> */}
                            <button type="button" className="user-btn mr5" title="Reset Grid" onClick={() => resetState()}>
                                <div className="refresh mr-0"></div>
                            </button>
                            <button type="button" className={"apply"} onClick={cancelReport}> <div className={'back-icon'}></div>Back</button>
                        </div>
                    </div>
                    <Row>
                        <Col>
                            <div className='ag-grid-react pipd-report-grid'>
                                <div className="ag-grid-wrapper height-width-wrapper">
                                    <div className="ag-grid-header">
                                    </div>
                                    <div className="ag-theme-material">
                                        <AgGridReact
                                            defaultColDef={defaultColDef}
                                            domLayout='autoHeight'
                                            // suppressRowTransform={true}
                                            floatingFilter={true}
                                            rowData={gridData}
                                            pagination={true}
                                            paginationPageSize={gridData.length}
                                            onGridReady={onGridReady}
                                            gridOptions={gridOptions}

                                            noRowsOverlayComponent={'customNoRowsOverlay'}
                                            noRowsOverlayComponentParams={{
                                                title: EMPTY_DATA,
                                                imagClass: 'imagClass'
                                            }}
                                            frameworkComponents={frameworkComponents}
                                            rowSelection={'multiple'}
                                            rowClassRules={rowClassRules}
                                        >
                                            <AgGridColumn field="Name" width="150" headerName="Name" cellClass={"colorWhite"} floatingFilter={true}></AgGridColumn>
                                            <AgGridColumn field="PriceType" headerName="In Lakh" floatingFilter={true}></AgGridColumn>
                                            <AgGridColumn headerName="Effective Date" headerClass="justify-content-center" marryChildren={true}>
                                                <AgGridColumn width="150" field="1/3/2022" headerName="1/3/2022" />
                                                <AgGridColumn width="150" field="1/4/2022" headerName="1/4/2022" />
                                                <AgGridColumn width="150" field="1/5/2023" headerName="1/5/2023" />
                                                <AgGridColumn width="150" field="1/6/2023" headerName="1/6/2023" />
                                                <AgGridColumn width="150" field="1/7/2023" headerName="1/7/2023" />
                                                <AgGridColumn width="150" field="1/9/2023" headerName="1/9/2023" />
                                                <AgGridColumn width="150" field="1/11/2023" headerName="1/11/2023" />
                                            </AgGridColumn>
                                            <AgGridColumn width="150" field="Total" headerName="Total" />

                                        </AgGridReact>
                                        {/* <PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} /> */}
                                    </div>
                                </div>
                            </div>
                        </Col>
                    </Row>
                    {/* } */}
                </form>
                {/* {!noRecordFound && <div className='h-298 d-flex align-items-center mt-3'>
                    <NoContentFound title={'Cost card is not available for this date range'} />
                </div>} */}
                {isLoader && <LoaderCustom customClass="center-loader" />}
            </div >
        </>
    )
}

export default PipdReportListing