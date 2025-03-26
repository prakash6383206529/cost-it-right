import React, { useState, useEffect } from 'react'
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { useDispatch } from 'react-redux'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { EMPTY_DATA, MASTER_MOVEMENT_REPORT } from '../../../config/constants'
import { Costmovementgraph } from '../../dashboard/CostMovementGraph'
import { primaryColor, secondryColor } from '../../dashboard/ChartsDashboard'
import { Line } from 'react-chartjs-2';
import DayTime from '../../common/DayTimeWrapper';
import { getCostMovementReport } from '../../../actions/Common';
import RenderGraphList from '../../common/RenderGraphList';
import HeaderTitle from '../../common/HeaderTitle';
import { PaginationWrapper } from '../../common/commonPagination';
import { checkForDecimalAndNull, getConfigurationKey, getCurrencySymbol, showBopLabel } from '../../../helper';
import ReactExport from 'react-export-excel';
import { BOP_DOMESTIC_TEMPLATE, BOP_IMPORT_TEMPLATE, MACHINE_TEMPLATE, OPERATION_TEMPLATE, RM_DOMESTIC_TEMPLATE, RM_IMPORT_TEMPLATE } from '../../report/ExcelTemplate';
import { reactLocalStorage } from 'reactjs-localstorage';
const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
const gridOptions = {};

function AnalyticsDrawer(props) {

    const { ModeId, rowData, importEntry } = props

    const toggleDrawer = (event, mode = false) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        props.closeDrawer('', mode)
    };

    const dispatch = useDispatch()

    const [showList, setShowList] = useState(false)
    const [uomValue, setUomValue] = useState("")
    const [showBarGraph, setShowBarGraph] = useState(false)
    const [showLineGraph, setShowLineGraph] = useState(true)
    const [gridData, setGridData] = useState([])
    const [dateRangeArray, setDateRangeArray] = useState([])
    const [netLandedCostArray, setNetLandedCostArray] = useState([])
    const [gridApi, setGridApi] = useState(null);
    const [currency, setCurrency] = useState("Currency")
    const [gridColumnApi, setgridColumnApi] = useState(null);



    useEffect(() => {
        const getUomValue = (modeId, rowData) => {
            if (!rowData) return null;

            switch (modeId) {
                case 1:
                case 2:
                    return rowData?.NetLandedCost || 0;
                case 3:
                    return rowData?.Rate || 0;
                case 4:
                    return rowData?.MachineRate || 0;
                default:
                    return rowData?.NetLandedCost || 0;
            }
        };
        const calculatedUomValue = getUomValue(props.ModeId, props.rowData);
        setUomValue(checkForDecimalAndNull(calculatedUomValue, getConfigurationKey().NoOfDecimalForPrice))
        setCurrency(props.rowData?.Currency)
        let obj = {}
        obj.ModeId = props.ModeId
        obj.MasterIdList = [{
            MasterId: ModeId === 1 ? props.rowData.RawMaterialId : ModeId === 2 ? props.rowData.BoughtOutPartId : ModeId === 3 ? props.rowData.OperationId : props.rowData.MachineId,
            ProcessId: ModeId === 4 ? props.rowData?.ProcessId : ""

        }]

        dispatch(getCostMovementReport(obj, (res) => {
            if (res?.data?.Result) {
                setGridData(res.data.Data?.MasterData)

                // let sampleGrid = []
                // res.data.Data?.MasterData.map((item, index) => {   //DONT DELETE THIS
                //     if (index != 0) {

                //         delete item.RawMaterialCode
                //     }
                //     sampleGrid.push(item)
                // })

                let arr = res.data.Data.MasterData
                let dateArray = []
                let netLandedCostArray = []
                arr && arr.map((item) => {
                    dateArray.push(`${DayTime(item.EffectiveDate).format('DD-MM-YYYY')}`)
                    netLandedCostArray.push(checkForDecimalAndNull(item.NetLandedCost, getConfigurationKey().NoOfDecimalForPrice))
                })
                setNetLandedCostArray(netLandedCostArray)
                setDateRangeArray(dateArray)
            }
        }))

    }, [])


    const valueChanged = (event) => {

        if (Number(event.value) === Number(1)) { //FOR LISTING
            setShowList(false)
            setShowLineGraph(true)
            setShowBarGraph(false)
        }

        if (Number(event.value) === Number(2)) { //FOR BAR CHART

            setShowList(false)
            setShowLineGraph(false)
            setShowBarGraph(true)
        }

        if (Number(event.value) === Number(3)) { //FOR LINE CHART

            setShowList(true)
            setShowLineGraph(false)
            setShowBarGraph(false)
        }

    }


    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,

    };


    const state = {
        labels: dateRangeArray,
        datasets: [
            {
                label: `Net Landed Rate (${uomValue})`,
                fill: false,
                lineTension: 0,
                backgroundColor: primaryColor,
                borderColor: primaryColor,
                borderWidth: 2,
                data: netLandedCostArray,
                spanGaps: true,
                pointBackgroundColor: primaryColor
            },
        ]
    }



    const data1 = {
        labels: dateRangeArray,
        datasets: [

            {
                type: 'bar',
                label: `Net Landed Rate (${uomValue})`,
                backgroundColor: primaryColor,
                data: netLandedCostArray,
                maxBarThickness: 25,
                borderColor: primaryColor
            },

        ],
    };


    const effectiveDateFormatter = (props) => {
        let cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        if (cellValue?.includes('T')) {
            cellValue = DayTime(cellValue).format('DD/MM/YYYY')
        }
        return (!cellValue ? '-' : cellValue)
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
        setgridColumnApi(params.columnApi);
    };

    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined && cellValue !== 0) ? cellValue : '-';
    }

    // const rowSpan = (params) => { //DONT DELETE
    //     return 5
    // }

    let Options = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {

                        let label = '';

                        if (label) {
                            label += ': ';
                        }
                        if (context.parsed.y !== null) {
                            label += new Intl.NumberFormat('en-US', { style: 'currency', currency: (props?.rowData?.Currency) ? props.rowData.Currency : 'INR' }).format(context.parsed.y);
                        }
                        return label;
                    }
                }
            },
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 16,
                    boxHeight: 14,
                    borderWidth: 0,
                    color: '#000'
                }
            },
            datalabels: {
                display: true,
                color: '#000',
                anchor: 'end',
                align: 'top',
                formatter: function (value) {
                    const formattedValue = checkForDecimalAndNull(value, getConfigurationKey().NoOfDecimalForPrice);
                    return formattedValue;
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grace: '5%'
            }
        }
    }
    const renderColumn = () => {
        switch (ModeId) {
            case 1:
                return returnExcelColumn(importEntry ? RM_IMPORT_TEMPLATE : RM_DOMESTIC_TEMPLATE, gridData)
            case 2:
                return returnExcelColumn(importEntry ? BOP_IMPORT_TEMPLATE : BOP_DOMESTIC_TEMPLATE, gridData)
            case 3:
                return returnExcelColumn(OPERATION_TEMPLATE, gridData)
            case 4:
                return returnExcelColumn(MACHINE_TEMPLATE, gridData)
            default:
                return null
        }
    }

    const returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData && TempData.map((item) => {
            if (item.EffectiveDate?.includes('T')) {
                item.EffectiveDate = DayTime(item.EffectiveDate).format('DD/MM/YYYY')
            }
            return item
        })
        return (<ExcelSheet data={temp} name={MASTER_MOVEMENT_REPORT}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} />)}
        </ExcelSheet>);
    }
    const resetState = () => {
        gridOptions?.columnApi?.resetColumnState();
        gridOptions?.api?.setFilterModel(null);
    }
    return (
        <div>
            {<>
                <Drawer
                    anchor={props.anchor}
                    open={props.isOpen}
                    className={"chart-drawer"}
                // onClose={(e) => this.toggleDrawer(e)}
                >
                    <Container>
                        <div className={"drawer-wrapper drawer-1500px "}>
                            <form noValidate className="form">
                                <Row className="drawer-heading mb-0">
                                    <Col className='px-0'>
                                        <div className={"header-wrapper left"}>
                                            <h3>
                                                {ModeId === 1 ? " RM History" : (ModeId === 2 ? `${showBopLabel()} History` : ModeId === 3 ? "Operation History" : "Machine History")}
                                            </h3>
                                        </div>
                                        <div
                                            onClick={(e) => toggleDrawer(e)}
                                            className={"close-button right"}
                                        ></div>
                                    </Col>
                                </Row>

                                <div className='analytics-drawer'>
                                    <HeaderTitle customClass="mb-0"
                                        title={ModeId === 1 ? `RM Code : ${rowData?.RawMaterialCode} ` : (ModeId === 2 ? `${showBopLabel()} No. : ${rowData?.BoughtOutPartNumber}` : ModeId === 3 ? `Operation Code : ${rowData?.OperationCode} ` : `Machine No. : ${rowData?.MachineNumber}`)}
                                    />
                                    <div className='d-flex align-items-center'>
                                        {showList && <ExcelFile filename={MASTER_MOVEMENT_REPORT} fileExtension={'.xls'} element={<button type="button" className={'user-btn mr5'}><div className="download"></div></button>}>
                                            {renderColumn()}
                                        </ExcelFile>}
                                        {showList && <button type="button" className="user-btn mr5" title="Reset Grid" onClick={() => resetState()}>
                                            <div className="refresh mr-0"></div>
                                        </button>}
                                        <RenderGraphList valueChanged={valueChanged} />
                                    </div>
                                    {/* <h7>{ModeId === 1 ? `RM Code : ${rowData?.RawMaterialCode} ` : (ModeId === 2 ? `BOP No. : ${rowData?.BoughtOutPartNumber}` : ModeId === 3 ? `Operation Code : ${rowData?.OperationCode} ` : `Machine No. : ${rowData?.MachineNumber}`)}</h7> */}
                                </div>
                                {showList &&
                                    < Row >
                                        <Col className='pr-0'>
                                            <div className='ag-grid-react'>
                                                <div className="ag-grid-wrapper height-width-wrapper">
                                                    <div className="ag-grid-header">

                                                    </div>
                                                    <div
                                                        className="ag-theme-material"
                                                    >

                                                        <AgGridReact
                                                            defaultColDef={defaultColDef}
                                                            domLayout='autoHeight'
                                                            suppressRowTransform={true}

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

                                                            {/* {ModeId == 1 && <AgGridColumn field="RawMaterialCode" headerName="RM Code" rowSpan={rowSpan} showRowGroup={true}
                                                            cellClassRules={{
                                                                'cell-span': "true",
                                                            }}></AgGridColumn>} */}
                                                            {ModeId === 4 && <AgGridColumn field="ProcessName" headerName="Process Name" cellRenderer={hyphenFormatter} ></AgGridColumn>}
                                                            {(ModeId === 1 || ModeId === 2) && <AgGridColumn field="BasicRatePerUOM" headerName="Basic Rate" cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                            {ModeId === 1 && <AgGridColumn field="RMFreightCost" headerName="Freight Cost" cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                            {ModeId === 1 && <AgGridColumn field="RMShearingCost" headerName="Shearing Cost" cellRenderer={hyphenFormatter} ></AgGridColumn>}
                                                            {<AgGridColumn field="UnitOfMeasurement" headerName="UOM" cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                            {<AgGridColumn field="NetLandedCost" headerName={props.import ? `Net Landed (${currency})` : `Net Landed Total (${currency})`} cellRenderer={hyphenFormatter} ></AgGridColumn>}
                                                            {(ModeId === 1 || ModeId === 2) && importEntry && <AgGridColumn field="NetLandedCostCurrency" headerName={`Net Landed Total (${reactLocalStorage.getObject("baseCurrency")})`} cellRenderer={hyphenFormatter} ></AgGridColumn>}
                                                            {<AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer='effectiveDateRenderer'></AgGridColumn>}

                                                        </AgGridReact>
                                                        <PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />
                                                    </div>
                                                </div>
                                            </div>
                                        </Col>
                                    </Row>

                                }

                                {showBarGraph &&
                                    <Row className="mt-4">
                                        <Col md="12" className='pr-0'>
                                            <Costmovementgraph graphData={data1} graphHeight={120} options1={Options} currency={rowData?.Currency ? rowData?.Currency : getConfigurationKey().BaseCurrency} />
                                        </Col>
                                    </Row>

                                }


                                {showLineGraph &&
                                    <Row>
                                        <Col className='pr-0 d-flex align-items-center'>
                                            <div className='mb-5 pb-5 mr-2' title={rowData?.Currency && props?.rowData?.Currency !== '-' ? rowData?.Currency : getConfigurationKey().BaseCurrency}>{getCurrencySymbol(rowData?.Currency ? rowData?.Currency : getConfigurationKey().BaseCurrency)}</div>
                                            <Line
                                                data={state}
                                                height={120}
                                                options={{
                                                    plugins: {
                                                        tooltip: {
                                                            callbacks: {
                                                                label: function (context) {

                                                                    let label = '';

                                                                    if (label) {
                                                                        label += ': ';
                                                                    }
                                                                    if (context.parsed.y !== null) {
                                                                        label += new Intl.NumberFormat('en-US', { style: 'currency', currency: (props?.rowData?.Currency && props?.rowData?.Currency !== '-') ? props.rowData.Currency : 'INR' }).format(context.parsed.y);
                                                                    }
                                                                    return label;
                                                                }
                                                            }
                                                        },
                                                        legend: {
                                                            position: 'bottom',
                                                            labels: {
                                                                boxWidth: 16,
                                                                boxHeight: 14,
                                                                color: '#000',

                                                            }
                                                        },
                                                        datalabels: {
                                                            display: true,
                                                            color: '#000',
                                                            anchor: 'end',
                                                            align: 'top',
                                                            offset: 5,
                                                            formatter: function (value) {
                                                                const formattedValue = checkForDecimalAndNull(value, getConfigurationKey().NoOfDecimalForPrice);
                                                                return formattedValue;
                                                            }
                                                        }
                                                    },
                                                    scales: {
                                                        y: {
                                                            beginAtZero: true,
                                                            grace: '5%',
                                                            ticks: {
                                                                padding: 5,
                                                            }
                                                        }
                                                    }
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                }
                            </form>
                        </div >
                    </Container >
                </Drawer >
            </>}


        </div >
    );
}

export default AnalyticsDrawer;