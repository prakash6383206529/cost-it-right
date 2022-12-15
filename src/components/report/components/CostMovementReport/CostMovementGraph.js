import React, { useState, useEffect } from 'react'
import { Row, Col, } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { EMPTY_DATA } from '../../../../config/constants'
import { Costmovementgraph } from '../../../dashboard/CostMovementGraph'
import { Line } from 'react-chartjs-2';
import DayTime from '../../../common/DayTimeWrapper';
import RenderGraphList from '../../../common/RenderGraphList'
import { PaginationWrapper } from '../../../common/commonPagination';
import { getCostMovementReportByPart } from '../../actions/ReportListing';
import { checkForDecimalAndNull, getConfigurationKey, getCurrencySymbol } from '../../../../helper';
import _ from 'lodash';
import HeaderTitle from '../../../common/HeaderTitle';

function CostMovementGraph(props) {
    const { ModeId, importEntry } = props
    const dispatch = useDispatch()
    const [showList, setShowList] = useState(false)
    const [showBarGraph, setShowBarGraph] = useState(false)
    const [showLineGraph, setShowLineGraph] = useState(true)
    const [gridData, setGridData] = useState([])
    const [dateRangeArray, setDateRangeArray] = useState([])
    const [gridApi, setGridApi] = useState(null);
    const [barDataSets, setBarDataSets] = useState([]);
    const [lineDataSets, setLineDataSets] = useState([]);
    const initialConfiguration = useSelector(state => state.auth.initialConfiguration)
    const costReportFormData = useSelector(state => state.report.costReportFormGridData)
    let tableData = costReportFormData && costReportFormData.gridData ? costReportFormData.gridData : [];
    let startDate = costReportFormData && costReportFormData.fromDate
    let endDate = costReportFormData && costReportFormData.toDate

    const getGraphColour = (index) => {
        let bgColor = '#' + Math.floor(16777215 * 0.34 + (index * 90146) + (index * 1310)).toString(16)
        return bgColor;

    }

    useEffect(() => {

        let obj = {}
        obj.FromDate = startDate
        obj.ToDate = endDate
        let sampleArray = []
        let allEffectiveDates = []

        tableData && tableData.map((item) => {
            sampleArray.push({ PartId: item.PartId, RevisionNumber: item.RevisionNumber, PlantId: item.PlantId, VendorId: item.VendorId, TechnologyId: item.TechnologyId })
        })
        obj.PartIdList = sampleArray

        dispatch(getCostMovementReportByPart(obj, (res) => {

            if (res?.data?.Result) {

                let grid = []
                let perPartData = []
                let barDataSet = []
                let lineDataSet = []

                res.data.Data && res.data.Data.map((item, index) => {
                    item.Data.map((ele) => {
                        ele.PlantNameWithCode = `${ele.PlantName} (${ele.PlantCode})`
                        ele.VendorNameWithCode = `${ele.VendorName} (${ele.VendorCode})`
                        grid.push(ele)
                        allEffectiveDates.push((ele.EffectiveDate))       //SETTING ALL DATES IN ALLEFFECTIVEDATE ARRAY
                    })

                })

                let uniqueDates = _.uniq(allEffectiveDates, false, function (date) {
                    return date.getTime();
                })

                function dateComparison(a, b) {       //FUNCTION TO SORT DATES IN ASCENDING ORDER YEAR WISE
                    const date1 = new Date(a)
                    const date2 = new Date(b)

                    return date1 - date2;
                }

                uniqueDates.sort(dateComparison);          //FILTERING AND RECEIVING ALL UNIQUE DATES
                allEffectiveDates = []

                uniqueDates.map((item) => {

                    allEffectiveDates.push(DayTime(item).format('DD-MM-YYYY'))
                })


                allEffectiveDates = allEffectiveDates.filter((v, i, a) => a.indexOf(v) === i);
                setDateRangeArray(allEffectiveDates)            //WE HAVE UNIQUE DATES ARRAY HERE OUT OF ALL DATES


                let uniquePartPlantVendor = []
                res.data.Data && res.data.Data.map((item, index) => {

                    item.Data.map((ele, i) => {
                        uniquePartPlantVendor.push(`${ele.PartNumber}${ele.PlantCode}${ele.VendorCode}`)
                    })
                })

                uniquePartPlantVendor = uniquePartPlantVendor.filter((v, i, a) => a.indexOf(v) === i);

                /////////////////////////////////////////main-logic///////////////

                uniquePartPlantVendor.map((uniqueItem, uniqueIndex) => {
                    let uniquePlantLabel = ''

                    res.data.Data && res.data.Data.map((item, index) => {
                        let dateIndex;

                        item.Data.map((ele, i) => {

                            if (`${ele.PartNumber}${ele.PlantCode}${ele.VendorCode}` == uniqueItem) {

                                uniquePlantLabel = `${ele.PartNumber}-${ele.PlantCode}-${ele.VendorCode}`

                                allEffectiveDates.map((date, indexFromDate) => {

                                    if (date == DayTime(ele.EffectiveDate).format('DD-MM-YYYY')) {
                                        dateIndex = indexFromDate
                                    }
                                })

                                perPartData = Object.assign([...perPartData], { [dateIndex]: checkForDecimalAndNull(ele.NetPOPrice, initialConfiguration.NoOfDecimalForPrice) })  //SETTING VALUE AT DATE INDEX
                            }
                        })
                    })


                    barDataSet.push({          //PUSHING VALUE FOR BAR GRAPH

                        type: 'bar',
                        label: `${uniquePlantLabel}`,
                        backgroundColor: getGraphColour(uniqueIndex),
                        data: perPartData,
                        maxBarThickness: 25,
                        borderColor: getGraphColour(uniqueIndex)

                    })


                    let finalPartData = [] // ARRAY FOR LINE CHART
                    for (let i = 0; i < perPartData.length; i++) {    //FOR LOOP IS FOR LINE CHART (COVERT UNDEFINED VALUE IN ARRAY TO PREVOUS VALUE TO SHOW LINE
                        if (i === 0) {

                            if (perPartData[i]) {
                                finalPartData.push(perPartData[i])
                            } else {
                                finalPartData.push(undefined)
                            }
                        }
                        else if (perPartData[i]) {
                            finalPartData.push(perPartData[i])
                        } else {
                            finalPartData.push(perPartData[i - 1])
                        }

                    }

                    lineDataSet.push({         //PUSHING VALUE FOR LINE CHART

                        label: `${uniquePlantLabel}`,
                        fill: false,
                        lineTension: 0,
                        backgroundColor: getGraphColour(uniqueIndex),
                        borderColor: getGraphColour(uniqueIndex),
                        borderWidth: 2,
                        data: finalPartData,
                        pointBackgroundColor: getGraphColour(uniqueIndex)
                    })

                    perPartData = []
                    uniquePlantLabel = ''
                })

                setGridData(grid)       // SETTING ALL DATA TO SHOW IN LISTING IN GRID
                setBarDataSets(barDataSet)
                setLineDataSets(lineDataSet)

                // setGridData(res.data.Data?.MasterData)
                // let sampleGrid = []
                // res.data.Data?.MasterData.map((item, index) => {   //DONT DELETE THIS  (WILL BE USED FOR ROW MERGING LATER)
                //     if (index != 0) {
                //         delete item.RawMaterialCode
                //     }
                //     sampleGrid.push(item)
                // })

            }
        }))

    }, [])


    const cancelReport = () => {

        props.closeDrawer('')

    }

    const gridOptions = {};

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
        sortable: false,

    };


    const state = {
        labels: dateRangeArray,
        datasets: lineDataSets
    }


    const data1 = {
        labels: [...dateRangeArray],
        datasets: barDataSets
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

    const POPriceFormatter = (props) => {
        const cellValue = props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        const currencySymbol = getCurrencySymbol(rowData?.Currency ? rowData?.Currency : getConfigurationKey().BaseCurrency)
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined && cellValue !== 0) ? currencySymbol + " " + cellValue : '-';
    }

    // const rowSpan = (params) => { //DONT DELETE (WILL BE USED FOR ROW MERGING LATER)
    //     return 5
    // }
    const lineChartOptions = {
        plugins: {
            legend: {
                position: 'bottom',
                align: 'start',

                labels: {
                    boxWidth: 14,
                    boxHeight: 12,
                    borderWidth: 0,
                    color: '#000',
                    font: {
                        size: 16,
                        weight: 500
                    }
                },
            },
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
            subtitle: {
                display: true,
                position: 'bottom',
                text: '  Format: Color | Part No.-Vendor code-Plant code ',
                fontSize: 10,
                align: 'start',
                color: '#000',
                font: {
                    size: 14,
                    weight: 600
                },
                padding: {
                    left: 25,
                    right: 40,
                    top: 10,
                    bottom: 15
                }
            },
            // subtitle: {
            //     display: true,
            //     text: 'Chart Subtitle',
            //     align: 'start',
            //     color: '#000',
            //     font: {
            //         size: 13,
            //         weight: 'normal',
            //     },
            //     padding: {
            //         bottom: 15,
            //         left: 15
            //     }
            // },
        },

        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Effective Date',
                    color: '#000',
                    font: {
                        size: 16,
                        weight: 500
                    },
                    Rotation: 180,
                    maxRatation: 180,
                    minRatation: 180,
                    padding: {
                        top: 10,
                        bottom: 5
                    },
                },
                Rotation: 180,
                maxRatation: 180,
                minRatation: 180,
            },
            // y: {
            //     title: {
            //         display: true,
            //         text: getCurrencySymbol(getConfigurationKey().BaseCurrency),
            //         color: '#000',
            //         autoSkip: false,
            //         maxRotation: 90,
            //         minRotation: 90,
            //         font: {
            //             size: 28,
            //             weight: 500,

            //         },
            //     },
            //     maxRatation: 180,
            //     minRatation: 180,
            // },

        },
    }
    const barChartOptions = {
        plugins: {
            legend: {
                position: 'bottom',
                align: 'start',
                labels: {
                    boxWidth: 16,
                    boxHeight: 14,
                    borderWidth: 0,
                    color: '#000'
                }
            },
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
            subtitle: {
                display: true,
                position: 'bottom',
                text: '  Format: Color | serial no.): Part No.-Vendor code-Plant code ',
                fontSize: 10,
                align: 'start',
                color: '#000',
                font: {
                    size: 14,
                    weight: 600
                },
                padding: {
                    left: 25,
                    right: 40,
                    top: 10,
                    bottom: 15
                }
            },
        },
        scales: {
            x: {

                title: {
                    display: true,
                    text: 'Effective Date',
                    color: '#000',
                    font: {
                        size: 16,
                        weight: 500
                    },
                }
            },

        },
    }

    return (
        <>
            <div className={"container-fluid"}>
                <div className='cost-ratio-report h-298'>
                    <form noValidate className="form">
                        <div className='analytics-drawer justify-content-end'>
                            <button type="button" className={"apply mr-2"} onClick={cancelReport}> <div className={'back-icon'}></div>Back</button>
                            <RenderGraphList valueChanged={valueChanged} />
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

                                                    {/* {ModeId == 1 && <AgGridColumn field="RawMaterialCode" headerName="RM Code" rowSpan={rowSpan} showRowGroup={true}
                                                            cellClassRules={{
                                                                'cell-span': "true",
                                                            }}></AgGridColumn>}   //DONT DELETE (WILL BE USED FOR ROW MERGING LATER) */}

                                                    {<AgGridColumn field="PartNumber" headerName="Part Number" cellRenderer={hyphenFormatter} floatingFilter={true}></AgGridColumn>}
                                                    {<AgGridColumn field="PlantNameWithCode" headerName="Plant (Code)" cellRenderer={hyphenFormatter} floatingFilter={true}></AgGridColumn>}
                                                    {<AgGridColumn field="VendorNameWithCode" headerName="Vendor (Code)" cellRenderer={hyphenFormatter} floatingFilter={true}></AgGridColumn>}

                                                    {(ModeId === 1 || ModeId === 2) && importEntry && <AgGridColumn field="NetLandedCostCurrency" headerName="Landed Total (Currency)" cellRenderer={hyphenFormatter} floatingFilter={true}></AgGridColumn>}
                                                    {<AgGridColumn field="NetPOPrice" headerName="Net PO Price" cellRenderer={POPriceFormatter} floatingFilter={true}></AgGridColumn>}
                                                    {<AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer='effectiveDateRenderer' floatingFilter={true}></AgGridColumn>}

                                                </AgGridReact>
                                                <PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                        }

                        { }
                        {showBarGraph &&
                            <Row className="mt-2 ">
                                <Col md="12">
                                    <Costmovementgraph graphData={data1} options1={barChartOptions} graphHeight={120} currency={getCurrencySymbol(getConfigurationKey().BaseCurrency)} />
                                </Col>
                            </Row>

                        }

                        {showLineGraph &&
                            <Row>
                                <Col className='pr-3 d-flex align-items-center mt-2'>
                                    <div className='mb-5 pb-5 mr-2'><strong>{getCurrencySymbol(getConfigurationKey().BaseCurrency)}</strong></div>
                                    <Line
                                        data={state}
                                        height={120}
                                        options={lineChartOptions}
                                    />
                                </Col>
                            </Row>
                        }
                    </form>
                </div >
            </div >
        </>
    );
}

export default CostMovementGraph;