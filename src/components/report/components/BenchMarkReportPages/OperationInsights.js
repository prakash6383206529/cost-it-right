import React, { useEffect, useState } from 'react';
import { Col, Row } from 'reactstrap';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react/lib/agGridReact';
import LoaderCustom from '../../../common/LoaderCustom'
import { AgGridColumn } from 'ag-grid-react/lib/agGridColumn';
import NoContentFound from '../../../common/NoContentFound'
import { defaultPageSize, EMPTY_DATA } from '../../../../config/constants'
import { Costmovementgraph } from '../../../dashboard/CostMovementGraph'
import { graphColor1, graphColor3, graphColor4, graphColor6 } from '../../../dashboard/ChartsDashboard'
import { PaginationWrapper } from '../../../common/commonPagination';
import { getCostingBenchMarkOperationReport } from '../../actions/ReportListing';
import DayTime from '../../../common/DayTimeWrapper';
import { checkForDecimalAndNull } from '../../../../helper';

function OperationInsights(props) {

    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [showListing, setShowListing] = useState(false);
    const [dynamicGrpahData, setDynamicGrpahData] = useState()
    const [averageGrpahData, setAverageGrpahData] = useState()
    const [minimumGrpahData, setMinimumGrpahData] = useState()
    const [maximumGrpahData, setMaximumGrpahData] = useState()
    const [tableHeaderColumnDefs, setTableHeaderColumnDefs] = useState([])
    const [rowDataNew, setRowDataNew] = useState([])
    const [vendor, setVendor] = useState([])
    const [isLoader, setIsLoader] = useState(true)
    const [labelArray, setLabelArray] = useState([])
    const gridOptions = {};
    const dispatch = useDispatch()

    let operationBenchmarkList = useSelector((state) => state.report.BenchmarkList)

    useEffect(() => {

        let arr = []
        props.data && props.data.map((item) => {
            arr.push({
                OperationId: item.OperationId
            })
            return arr
        })
        let data = {
            FromDate: props.dateArray[0] ? props.dateArray[0] : null,
            ToDate: props.dateArray[1] ? props.dateArray[1] : null,
            IsSurfaceTreatmentOperation: props?.surfaceTreatMent,
            OperationBenchMarkingReports: arr
        }

        dispatch(getCostingBenchMarkOperationReport(data, (res) => {
            if (res) {
                setIsLoader(false)
            }
        }))

    }, [])


    useEffect(() => {
        setShowListing(false)
        let temp = []
        let vendorTemp = []
        let uniqueVendors = []

        //////////////////////////////////////////////////////////////////////////////////////

        operationBenchmarkList && operationBenchmarkList?.OperationChildDetails?.map((item, i) => {               //ITERATION FOR ALL SPECIFICATIONS
            let plantTemp = []
            let obj = {
                OperationName: item.OperationName,                       //SETTING 6 VALUES FOR EACH SPECIFICATION IN OBJ
                Minimum: item.Minimum,
                Maximum: item.Maximum,
                Average: item.Average,
                WeightedAverage: item.WeightedAverage,
                EffectiveDate: item.EffectiveDate

            }


            item.VendorPlantsDetail?.map((data, indx) => {

                data.PlantDetails.map((ele, ind) => {
                    let Val = `plant${data.VendorName}${ele.PlantName}`                           // SETTING PLANTS FOR EACH VENDOR IN OBJ
                    obj[Val] = ele.Price

                    let Val2 = `quantity${data.VendorName}${ele.PlantName}`                           // SETTING PLANTS FOR EACH VENDOR IN OBJ
                    obj[Val2] = ele.TotalOperationCostingQuantity


                    let Val3 = `value${data.VendorName}${ele.PlantName}`                           // SETTING PLANTS FOR EACH VENDOR IN OBJ
                    obj[Val3] = ele.TotalValue

                })

            })


            temp.push(obj)           // PUSHING OBJ IN TEMP ARRAY FOR EACH SPECIFICATION

            ///////////////////////////////////////////////////////////////////////////////////////////

            let obj2 = {}
            let arrSample = []
            item.VendorPlantsDetail?.map((ele, ind) => {

                obj2 = {}
                obj2.vendor = ele.VendorName                    // OBJ2 

                ele.PlantDetails.map((el) => {
                    plantTemp.push(el.PlantName)

                })
                obj2.plants = plantTemp
                plantTemp = []

                arrSample.push(obj2)
                uniqueVendors.push(ele.VendorName)

            })

            vendorTemp.push(arrSample)

        })


        ////////////////////////////////////////////////////////////////////////////

        let uniqueV = uniqueVendors.filter((item, i, ar) => ar.indexOf(item) === i);


        let finalArray = []
        uniqueV.map((item) => {
            let obj = {}
            obj.vendor = item
            let plants = []

            vendorTemp.map((element, indx) => {
                element.map((e) => {

                    if (e.vendor == item) {

                        plants = [...plants, ...e.plants]
                    }

                })

            })
            let uniqueP = plants.filter((item, i, ar) => ar.indexOf(item) === i);
            obj.plants = uniqueP
            finalArray.push(obj)
        })


        setVendor(finalArray)
        setRowDataNew(temp)


        let arr = [               //SETTING DYNAMIC COLUMN DEFINATIONS


            {

                field: "OperationName",
                pinned: "left",
                width: "115"

            },

            {

                field: "Minimum",
                pinned: "left",
                width: "115"

            },
            {
                field: "Maximum",
                pinned: "left",
                width: "115"

            }, {
                field: "Average",
                pinned: "left",
                width: "115",
                cellRendererFramework: (params) => checkForDecimalAndNull(params.value, 4),

            },
            {
                field: "WeightedAverage",
                pinned: "left",
                width: "130",
                cellRendererFramework: (params) => checkForDecimalAndNull(params.value, 4),

            },
            {
                field: "EffectiveFromDate",
                pinned: "left",
                width: "130",
                cellRendererFramework: (params) => DayTime(params.value).format('DD/MM/YYYY'),
            },
            {
                field: "EffectiveToDate",
                pinned: "left",
                width: "130",
                cellRendererFramework: (params) => DayTime(params.value).format('DD/MM/YYYY'),
            }

        ]


        let array55 = []
        finalArray.map((item) => {

            let childPlants = []


            item.plants.map((ele, ind) => {

                let rate = {

                    headerName: "Rate",
                    width: "130",
                    field: `plant${item.vendor}${ele}`,
                    cellRendererFramework: (params) => params.value ? params.value : '-',

                }
                let Quantity = {

                    headerName: "Quantity",
                    width: "130",
                    field: `quantity${item.vendor}${ele}`,
                    cellRendererFramework: (params) => params.value ? params.value : '-',

                }
                let Value = {

                    headerName: "Value",
                    width: "130",
                    field: `value${item.vendor}${ele}`,
                    cellRendererFramework: (params) => params.value ? checkForDecimalAndNull(params.value, 4) : '-',

                }

                let plantObj = {
                    headerName: ele,
                    // field: `plant${item.vendor}${ind}`,
                    width: "115",
                    cellRendererFramework: (params) => params.value ? params.value : '-',
                    marryChildren: true,
                    children: [rate, Quantity, Value]

                }
                childPlants.push(plantObj)

            })


            let obj = {

                headerName: `${item.vendor}`,
                headerClass: "justify-content-center",
                marryChildren: true,
                children: childPlants,
                cellRendererFramework: (params) => params.value ? params.value : '-',
            }

            array55.push(obj)

        })


        setTableHeaderColumnDefs([...arr, ...array55])
        setTimeout(() => {

            setShowListing(true)
        }, 500);
    }, [operationBenchmarkList]);



    const onSelectionChanged = (event) => {

        let labelArr = []

        tableHeaderColumnDefs?.map((item, index) => {

            if (index > 6) {

                item.children.map((ele) => {
                    labelArr.push(`${item.headerName}-${ele.headerName}`)
                })
            }
        })



        setLabelArray(labelArr)


        var rowCount = event.api.getSelectedRows();

        var graphDataNew = rowCount[0].graphData;
        var avgGraphData = rowCount[0].Average;
        var minGraphData = rowCount[0].minimumData;
        var maxGraphData = rowCount[0].maximumData;

        var array = []
        var plantLabel = []
        var obj = rowCount[0]
        for (var prop in obj) {
            if (prop.includes('plant')) {
                array.push(obj[prop])
                plantLabel.push(prop)

            }
        }


        let newArr = []
        labelArr.map((item, index) => {

            plantLabel.map((element, ind) => {
                let ele = element.slice(5)
                ele = ele.replace('-', '')

                var newStr = item.replaceAll('-', '')
                ele = ele.replaceAll('-', '')

                if (newStr.includes(ele)) {
                    newArr[index] = array[ind]
                }
            })
        })

        graphDataNew = newArr
        setDynamicGrpahData(graphDataNew);
        // setAverageGrpahData(avgGraphData);
        setMinimumGrpahData(minGraphData);
        setMaximumGrpahData(maxGraphData);

        let avgArray = []
        labelArr && labelArr.map((item, ind) => {
            avgArray.push(avgGraphData)
        })
        setAverageGrpahData(avgArray)


    }


    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);

    };

    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
    };

    const frameworkComponents = {
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
    }

    const data1 = {
        // labels: ['vendor1-plant1', 'vendor1-plant2', 'vendor2-plant3', 'vendor2-plant4', 'vendor2-plant5', 'vendor3-plant6', 'vendor3-plant7', 'vendor3-plant8'],
        labels: labelArray,
        datasets: [
            {
                type: 'line',
                label: 'Average',
                borderColor: graphColor1,
                fill: false,
                tension: 0.1,
                borderDash: [5, 5],
                // data: [averageGrpahData, averageGrpahData, averageGrpahData, averageGrpahData, averageGrpahData]
                data: averageGrpahData
            },
            {
                type: 'line',
                label: 'Minimum',
                borderColor: graphColor6,
                fill: false,
                tension: 0.1,
                borderDash: [5, 5],
                data: minimumGrpahData,
            },
            {
                type: 'line',
                label: 'Maximum',
                borderColor: graphColor3,
                fill: false,
                tension: 0.1,
                borderDash: [5, 5],
                data: maximumGrpahData,
            },
            {
                type: 'bar',
                label: 'Plants',
                backgroundColor: graphColor4,
                data: dynamicGrpahData,
                maxBarThickness: 25,

            },
        ],
    };

    const resetState = () => {
        setIsLoader(true)
        setTimeout(() => {
            setIsLoader(false)
        }, 50);
    }

    return (
        <>
            {showListing && <button type="button" className="user-btn report-btn-reset float-right mb-2" title="Reset Grid" onClick={() => resetState()}>
                <div className="refresh mr-0"></div>
            </button>}
            <div className="container-fluid rminsights_page">
                {isLoader ? <LoaderCustom customClass="loader-center" /> :
                    <form noValidate >
                        {showListing && <>
                            <Row>
                                <Col md="12">
                                    <div className={`ag-grid-react`}>
                                        <div className={`ag-grid-wrapper rminsights_table  ${rowDataNew && rowDataNew?.length <= 0 ? "overlay-contain" : ""}`}>
                                            <div className="ag-theme-material">
                                                <AgGridReact
                                                    style={{ height: '100%', width: '100%' }}
                                                    defaultColDef={defaultColDef}
                                                    columnDefs={tableHeaderColumnDefs}
                                                    domLayout='autoHeight'
                                                    rowData={rowDataNew}
                                                    rowSelection={'single'}
                                                    onSelectionChanged={onSelectionChanged}
                                                    pagination={true}
                                                    paginationPageSize={defaultPageSize}
                                                    onGridReady={onGridReady}
                                                    gridOptions={gridOptions}
                                                    // enableCellTextSelection={true}
                                                    loadingOverlayComponent={'customLoadingOverlay'}
                                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                                    noRowsOverlayComponentParams={{
                                                        title: EMPTY_DATA,
                                                    }}
                                                    frameworkComponents={frameworkComponents}
                                                >
                                                    <AgGridColumn pinned="left" field="Specification" />
                                                    <AgGridColumn pinned="left" width="120" field="Minimum" />
                                                    <AgGridColumn pinned="left" width="120" field="Maximum" />
                                                    <AgGridColumn pinned="left" width="120" field="Average" />

                                                    <AgGridColumn headerName="Vendor1" headerClass="justify-content-center" marryChildren={true}>
                                                        <AgGridColumn width="150" field="Plant1" headerName="Plant 1" />
                                                        <AgGridColumn width="150" field="Plant2" headerName="Plant 2" />
                                                    </AgGridColumn>
                                                </AgGridReact>
                                                {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                            <Row className="mt-4">
                                <Col md="12">
                                    <Costmovementgraph graphData={data1} graphHeight={60} />
                                </Col>
                            </Row>

                        </>}
                    </form>}
            </div>
            {/* container-fluid */}
        </>
    )
}

export default OperationInsights