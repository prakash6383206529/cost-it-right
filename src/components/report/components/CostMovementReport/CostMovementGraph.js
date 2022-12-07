import React, { useState, useEffect } from 'react'
import { Container, Row, Col, } from 'reactstrap';
import { useDispatch } from 'react-redux'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { EMPTY_DATA } from '../../../../config/constants'
import { Costmovementgraph } from '../../../dashboard/CostMovementGraph'
import { primaryColor, secondryColor, graphColor7, graphColor1, graphColor2, graphColor3, graphColor4, graphColor5, graphColor6 } from '../../../dashboard/ChartsDashboard'
import { Line } from 'react-chartjs-2';
import DayTime from '../../../common/DayTimeWrapper';
import RenderGraphList from '../../../common/RenderGraphList';
import { PaginationWrapper } from '../../../common/commonPagination';
import { getCostMovementReportByPart } from '../../actions/ReportListing';
import { checkForDecimalAndNull } from '../../../../helper';
import _ from 'lodash';


function CostMovementGraph(props) {
    const { fromDate, toDate, tableData, ModeId, importEntry } = props

    const dispatch = useDispatch()
    const [showList, setShowList] = useState(true)
    const [showBarGraph, setShowBarGraph] = useState(false)
    const [showLineGraph, setShowLineGraph] = useState(false)
    const [gridData, setGridData] = useState([])
    const [dateRangeArray, setDateRangeArray] = useState([])
    const [gridApi, setGridApi] = useState(null);
    const [barDataSets, setBarDataSets] = useState([]);
    const [lineDataSets, setLineDataSets] = useState([]);

    const getGrapHColour = (index) => {

        switch (index) {
            case 0:
                return primaryColor
            case 1:
                return secondryColor
            case 2:
                return graphColor4
            default:
                return primaryColor
        }
    }


    useEffect(() => {

        let obj = {}
        obj.FromDate = fromDate
        obj.ToDate = toDate
        let arr = []
        let allEffectiveDates = []

        tableData && tableData.map((item) => {
            arr.push({ PartId: item.PartId, RevisionNumber: item.RevisionNo === "-" ? "" : item.RevisionNo })
        })
        obj.PartIdList = arr


        dispatch(getCostMovementReportByPart(obj, (res) => {

            if (res?.data?.Result) {

                let grid = []
                let perPartData = []
                let barDataSet = []
                let lineDataSet = []

                res.data.Data && res.data.Data.map((item, index) => {
                    item.Data.map((ele) => {
                        allEffectiveDates.push((ele.EffectiveDate))       //SETTING ALL DATES IN ALLEFFECTIVEDATE ARRAY
                    })

                })


                var uniqueDates = _.uniq(allEffectiveDates, false, function (date) {
                    return date.getTime();
                })

                function dateComparison(a, b) {
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


                res.data.Data && res.data.Data.map((item, index) => {
                    let dateIndex;
                    item.Data.map((ele) => {
                        grid.push(ele)

                        allEffectiveDates.map((date, ind) => {

                            if (date == DayTime(ele.EffectiveDate).format('DD-MM-YYYY')) {
                                dateIndex = ind
                            }
                        })

                        perPartData = Object.assign([...perPartData], { [dateIndex]: checkForDecimalAndNull(ele.NetPOPrice, 2) })

                    })


                    barDataSet.push({

                        type: 'bar',
                        label: `Part Cost (${item.PartNumber})`,
                        backgroundColor: getGrapHColour(index),
                        data: perPartData,
                        maxBarThickness: 25,
                        borderColor: getGrapHColour(index)

                    })

                    lineDataSet.push({

                        label: `Part Cost (${item.PartNumber})`,
                        fill: false,
                        lineTension: 0,
                        backgroundColor: getGrapHColour(index),
                        borderColor: primaryColor,
                        borderWidth: 2,
                        data: perPartData,
                        pointBackgroundColor: getGrapHColour(index)

                    })

                    perPartData = []
                })

                setGridData(grid)
                setBarDataSets(barDataSet)
                setLineDataSets(lineDataSet)

                // setGridData(res.data.Data?.MasterData)
                // let sampleGrid = []
                // res.data.Data?.MasterData.map((item, index) => {   //DONT DELETE THIS
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
            setShowList(true)
            setShowLineGraph(false)
            setShowBarGraph(false)
        }

        if (Number(event.value) === Number(2)) { //FOR BAR CHART

            setShowList(false)
            setShowLineGraph(false)
            setShowBarGraph(true)
        }

        if (Number(event.value) === Number(3)) { //FOR LINE CHART

            setShowList(false)
            setShowLineGraph(true)
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
        datasets: lineDataSets
        // datasets: [
        //     {
        //         label: `Landed Rate`,
        //         fill: false,
        //         lineTension: 0,
        //         backgroundColor: secondryColor,
        //         borderColor: primaryColor,
        //         borderWidth: 2,
        //         data: netLandedCostArray,
        //         pointBackgroundColor: secondryColor
        //     },
        // ]
    }


    const data1 = {
        labels: [...dateRangeArray],
        datasets: barDataSets
        //     datasets: [

        //         {
        //             type: 'bar',
        //             label: `Landed Rate`,
        //             backgroundColor: primaryColor,
        //             data: netLandedCostArray,
        //             maxBarThickness: 25,
        //             borderColor: primaryColor
        //         },
        //         {
        //             type: 'bar',
        //             label: `Landed Rate2`,
        //             backgroundColor: primaryColor,
        //             data: [100, 200, 300, 400, 5000],
        //             maxBarThickness: 25,
        //             borderColor: primaryColor
        //         },

        //     ],
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
        // this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
        params.api.paginationGoToPage(0);
        setGridApi(params.api)
        params.api.sizeColumnsToFit();
    };

    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined && cellValue !== 0) ? cellValue : '-';
    }

    // const rowSpan = (params) => { //DONT DELETE
    //     return 5
    // }


    return (
        <div>
            {<>

                <div className={"container-fluid"}>
                    <form noValidate className="form">
                        <div className='analylics-drawer'>
                            <RenderGraphList valueChanged={valueChanged} />
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

                                                    {<AgGridColumn field="PartNumber" headerName="Part Number" cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                    {<AgGridColumn field="NetPOPrice" headerName="Net PO Price" cellRenderer={hyphenFormatter} ></AgGridColumn>}

                                                    {(ModeId === 1 || ModeId === 2) && importEntry && <AgGridColumn field="NetLandedCostCurrency" headerName="Landed Total (Currency)" cellRenderer={hyphenFormatter} ></AgGridColumn>}
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
                                    <Costmovementgraph graphData={data1} graphHeight={120} />
                                </Col>
                            </Row>

                        }


                        {showLineGraph &&
                            <Row>
                                <Col className='pr-0'>
                                    <Line
                                        data={state}
                                        height={120}
                                        options={{
                                            title: {
                                                display: true,
                                                text: 'Average Rainfall per month',
                                                fontSize: 10
                                            },
                                            legend: {
                                                display: true,
                                                position: 'right'
                                            },

                                        }}
                                    />
                                </Col>
                            </Row>
                        }
                        <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">

                            <div className="col-sm-12 text-right bluefooter-butn mt-3">

                                <div className="d-flex justify-content-end bd-highlight w100 my-2 align-items-center">

                                    <button type="button" className={"mr15 cancel-btn"} onClick={cancelReport}> <div className={"cancel-icon"}></div>CANCEL</button>
                                </div>

                            </div>

                        </Row>


                    </form>
                </div >


            </>}


        </div >
    );
}

export default CostMovementGraph;