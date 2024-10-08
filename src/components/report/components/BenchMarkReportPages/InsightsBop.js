import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Col, Row } from 'reactstrap';
import { SearchableSelectHookForm } from '../../../layout/HookFormInputs'
import { useDispatch, useSelector } from 'react-redux';
import { AgGridReact } from 'ag-grid-react/lib/agGridReact';
import LoaderCustom from '../../../common/LoaderCustom'
import { AgGridColumn } from 'ag-grid-react/lib/agGridColumn';
import NoContentFound from '../../../common/NoContentFound'
import { defaultPageSize, EMPTY_DATA } from '../../../../config/constants'
import { Costmovementgraph } from '../../../dashboard/CostMovementGraph'
import { graphColor1, graphColor3, graphColor4, graphColor6 } from '../../../dashboard/ChartsDashboard'
import { PaginationWrapper } from '../../../common/commonPagination';
import { getCostingBenchMarkBopReport } from '../../actions/ReportListing';
import DayTime from '../../../common/DayTimeWrapper';
import { checkForDecimalAndNull } from '../../../../helper';
import { useLabels } from '../../../../helper/core';

function InsightsBop(props) {
    const { register, handleSubmit, control, formState: { errors } } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [showListing, setShowListing] = useState(false);

    const [techSelected, setTechSelected] = useState(false);
    const [materialSelected, setMaterialSelected] = useState(false);
    const [gradeSelected, setGradeSelected] = useState(false);

    const [dynamicGrpahData, setDynamicGrpahData] = useState()
    const [averageGrpahData, setAverageGrpahData] = useState()
    const [minimumGrpahData, setMinimumGrpahData] = useState()
    const [maximumGrpahData, setMaximumGrpahData] = useState()
    const [tableHeaderColumnDefs, setTableHeaderColumnDefs] = useState([])
    const [rowDataNew, setRowDataNew] = useState([])
    const [isLoader, setIsLoader] = useState(true)
    const [vendor, setVendor] = useState([])
    const [plantName, setPlantName] = useState([])
    const [uniqueVendors, setUniqueVendors] = useState([])
    const { technologyLabel } = useLabels();
    const [labelArray, setLabelArray] = useState([])

    const gridOptions = {};

    // const [technology, setTechnology] = useState({})
    const dispatch = useDispatch()
    let bopBenchmarkList = useSelector((state) => state.report.BenchmarkList)



    let obj4 = {
        Identity: null,
        Result: true,
        Message: "Success",
        Data: {},
        DataList: [
            {
                BoughtOutPartId: "c16c308f-a862-41ed-a64a-e643fd378d45",
                BOPSpecifications: [
                    {
                        BoughtOutPartCode: "Pin Nail1",
                        BoughtOutPartName: "Bolt",
                        BoughtOutPartCategory: "Blub123",
                        Minimum: 99,
                        Maximum: 99,
                        Average: 99,
                        WeightedAverage: 0,
                        BOPVendorPrice: [
                            {
                                Vendor: "Ashokv",
                                BOPPlant: [
                                    {
                                        PlantName: "Flottweg SEP",
                                        Rate: 99,
                                        IsVendor: false,
                                        TotalQuantity: 0,
                                        TotalValue: 0,
                                        EffectiveDate: "2022-11-05T00:00:00"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                BoughtOutPartId: "3ccf1eb6-0b60-4dbd-9a92-3d8f3fcaa75b",
                BOPSpecifications: [
                    {
                        BoughtOutPartCode: "bop-test123",
                        BoughtOutPartName: "bop-test123",
                        BoughtOutPartCategory: "1234",
                        Minimum: 120,
                        Maximum: 120,
                        Average: 120,
                        WeightedAverage: 0,
                        BOPVendorPrice: [
                            {
                                Vendor: "Flottweg SE",
                                BOPPlant: [
                                    {
                                        PlantName: "Flottweg SEP",
                                        Rate: 120,
                                        IsVendor: false,
                                        TotalQuantity: 0,
                                        TotalValue: 0,
                                        EffectiveDate: "2022-10-11T00:00:00"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            {
                BoughtOutPartId: "fe2cafbc-0da9-4764-aa06-13029191e32c",
                BOPSpecifications: [
                    {
                        BoughtOutPartCode: "BOP1",
                        BoughtOutPartName: "BOP1",
                        BoughtOutPartCategory: "BOP1",
                        Minimum: 10,
                        Maximum: 40,
                        Average: 25,
                        WeightedAverage: 0,
                        BOPVendorPrice: [
                            {
                                Vendor: "V4",
                                BOPPlant: [
                                    {
                                        PlantName: "P1",
                                        Rate: 40,
                                        IsVendor: false,
                                        TotalQuantity: 0,
                                        TotalValue: 0,
                                        EffectiveDate: "2022-09-22T00:00:00"
                                    }
                                ]
                            },
                            {
                                Vendor: "V3",
                                BOPPlant: [
                                    {
                                        PlantName: "P1",
                                        Rate: 30,
                                        IsVendor: false,
                                        TotalQuantity: 0,
                                        TotalValue: 0,
                                        EffectiveDate: "2022-09-22T00:00:00"
                                    }
                                ]
                            },
                            {
                                Vendor: "V1",
                                BOPPlant: [
                                    {
                                        PlantName: "P1",
                                        Rate: 10,
                                        IsVendor: false,
                                        TotalQuantity: 0,
                                        TotalValue: 0,
                                        EffectiveDate: "2022-09-22T00:00:00"
                                    }
                                ]
                            },
                            {
                                Vendor: "V2",
                                BOPPlant: [
                                    {
                                        PlantName: "P1",
                                        Rate: 20,
                                        IsVendor: false,
                                        TotalQuantity: 0,
                                        TotalValue: 0,
                                        EffectiveDate: "2022-09-22T00:00:00"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ],
        SelectList: [],
        DynamicData: null
    }


    useEffect(() => {
        let arr = []
        props.data && props.data.map((item) => {
            arr.push({
                BoughtOutPartId: item.BoughtOutPartId
                ,
                CategoryId: item.CategoryId ? item.CategoryId : "",

            })
            return arr
        })
        let data = {
            FromDate: props.dateArray[0] ? props.dateArray[0] : null,
            ToDate: props.dateArray[1] ? props.dateArray[1] : null,
            bOPCostBenchMarkingReports: arr
        }

        dispatch(getCostingBenchMarkBopReport(data, (res) => {
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


        bopBenchmarkList && bopBenchmarkList?.BOPSpecifications?.map((item, i) => {               //ITERATION FOR ALL SPECIFICATIONS
            let plantTemp = []
            let obj = {
                Specification: item.BoughtOutPartName,                       //SETTING 6 VALUES FOR EACH SPECIFICATION IN OBJ
                Minimum: item.Minimum,
                Maximum: item.Maximum,
                Average: item.Average,
                WeightedAverage: item.WeightedAverage,
                EffectiveDate: item.EffectiveDate

            }


            item.BOPVendorPrice?.map((data, indx) => {

                data.BOPPlant.map((ele, ind) => {

                    let Val = `plant${data.VendorName}${ele.PlantName}`                           // SETTING PLANTS FOR EACH VENDOR IN OBJ
                    obj[Val] = ele.Price

                    let Val2 = `quantity${data.VendorName}${ele.PlantName}`                        // SETTING PLANTS FOR EACH VENDOR IN OBJ
                    obj[Val2] = ele.TotalVolumeAndBOPCostingQuantity


                    let Val3 = `value${data.VendorName}${ele.PlantName}`                           // SETTING PLANTS FOR EACH VENDOR IN OBJ
                    obj[Val3] = ele.TotalValue

                })

            })


            temp.push(obj)           // PUSHING OBJ IN TEMP ARRAY FOR EACH SPECIFICATION

            ///////////////////////////////////////////////////////////////////////////////////////////

            let obj2 = {}
            let arrSample = []
            item.BOPVendorPrice?.map((ele, ind) => {

                obj2 = {}
                obj2.vendor = ele.VendorName                    // OBJ2 

                ele.BOPPlant.map((el) => {
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


        let arr = [{               //SETTING DYNAMIC COLUMN DEFINATIONS

            field: "Specification",
            pinned: "left",
            width: "115"

        }, {

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
            width: "115"

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
    }, [bopBenchmarkList]);

    const technologySelectList = useSelector(state => state.costing.technologySelectList)
    const gradeSelectList = useSelector(state => state.material.gradeSelectList)
    const filterRMSelectList = useSelector(state => state.material.filterRMSelectList.RawMaterials)
    // 


    const handleTechnologyChange = (value) => {
        // setTechnology(value)
        if (value && value !== '') {
            setTechSelected(true)
        }
        else {
            setTechSelected(false)
        }
    }

    const handleMaterialChange = (value) => {
        // setTechnology(value)
        if (value && value !== '') {
            setMaterialSelected(true)
        }
        else {
            setMaterialSelected(false)
        }
    }

    const handleGradeChange = (value) => {
        // setTechnology(value)
        if (value && value !== '') {
            setGradeSelected(true)
        }
        else {
            setGradeSelected(false)
        }
    }

    const submitDropdown = () => {
        if (techSelected && materialSelected && gradeSelected) {
            setShowListing(true)
            setDynamicGrpahData(rowData[0].graphData);
            setAverageGrpahData(rowData[0].averageData);
            setMinimumGrpahData(rowData[0].minimumData);
            setMaximumGrpahData(rowData[0].maximumData);

        }
        else {
            setShowListing(false)
        }
    }



    let rowData2 = []


    const rowData = [
        {
            Specification: 'OP1', Minimum: '10', Maximum: '80', Average: '45', Plant1: '15', Plant2: '22', Plant3: '18', Plant4: '24', Plant5: '8', Plant6: '27', Plant7: '15', Plant8: '38',
            graphData: [20, 40, 50, 40, 60, 80, 60, 20], averageData: [12, 25, 45, 32, 51, 45, 36, 15], minimumData: [10, 10, 10, 10, 10, 10, 10, 10], maximumData: [80, 80, 80, 80, 80, 80, 80, 80],
        },
        {
            Specification: 'OP2', Minimum: '40', Maximum: '160', Average: '100', Plant1: '15', Plant2: '22', Plant3: '18', Plant4: '24', Plant5: '8', Plant6: '27', Plant7: '15', Plant8: '38',
            graphData: [40, 80, 100, 80, 120, 160, 120, 40], averageData: [22, 45, 85, 62, 101, 85, 66, 25], minimumData: [40, 40, 40, 40, 40, 40, 40, 40], maximumData: [160, 160, 160, 160, 160, 160, 160, 160],

        },
        {
            Specification: 'OP3', Minimum: '50', Maximum: '170', Average: '110', Plant1: '15', Plant2: '22', Plant3: '18', Plant4: '24', Plant5: '8', Plant6: '27', Plant7: '15', Plant8: '38',
            graphData: [50, 90, 110, 90, 130, 170, 130, 50], averageData: [12, 55, 65, 72, 111, 45, 76, 25], minimumData: [20, 20, 20, 20, 20, 20, 20, 20], maximumData: [170, 170, 170, 170, 170, 170, 170, 170],
        },
        {
            Specification: 'OP4', Minimum: '20', Maximum: '80', Average: '500', Plant1: '15', Plant2: '22', Plant3: '18', Plant4: '24', Plant5: '8', Plant6: '27', Plant7: '15', Plant8: '38',
            graphData: [20, 40, 50, 40, 60, 80, 60, 20], averageData: [12, 25, 45, 32, 51, 45, 36, 15], minimumData: [20, 20, 20, 20, 20, 20, 20, 20], maximumData: [80, 80, 80, 80, 80, 80, 80, 80],
        },
        {
            Specification: 'OP12', Minimum: '40', Maximum: '100', Average: '150', Plant1: '15', Plant2: '22', Plant3: '18', Plant4: '24', Plant5: '8', Plant6: '27', Plant7: '15', Plant8: '38',
            graphData: [20, 40, 50, 40, 60, 80, 60, 20], averageData: [12, 25, 45, 32, 51, 45, 36, 15], minimumData: [10, 10, 10, 10, 10, 10, 10, 10], maximumData: [80, 80, 80, 80, 80, 80, 80, 80],
        },
    ];

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

        // 
    }

    const renderListing = (label) => {
        let temp = []
        if (label && label !== '') {
            if (label === 'technology') {
                technologySelectList && technologySelectList.map((item) => {
                    if (item.Value === '0') return false
                    temp.push({ label: item.Text, value: item.Value })
                    return null
                })
                return temp
            }
            if (label === 'material') {
                filterRMSelectList && filterRMSelectList.map(item => {
                    if (item.Value === '0') return false;
                    temp.push({ label: item.Text, value: item.Value })
                    return null;
                });
                return temp;
            }
            if (label === 'grade') {
                gradeSelectList && gradeSelectList.map(item => {
                    if (item.Value === '0') return false;
                    temp.push({ label: item.Text, value: item.Value })
                    return null;
                });
                return temp;
            }
        }
        else {
            // 
        }
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        // headerCheckboxSelection: isFirstColumn,
        // checkboxSelection: isFirstColumn
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
                    <form onSubmit={handleSubmit} noValidate >
                        {false && <Row className="pt-4">
                            <Col md="12" className="filter-block">
                                <div className="d-inline-flex justify-content-start align-items-center mr-3">
                                    <div className="flex-fills label">{technologyLabel}:</div>
                                    <div className="hide-label flex-fills pl-0 w-auto">
                                        <SearchableSelectHookForm
                                            label={''}
                                            name={'Technology'}
                                            placeholder={'Technology'}
                                            Controller={Controller}
                                            control={control}
                                            rules={{ required: false }}
                                            register={register}
                                            // defaultValue={technology.length !== 0 ? technology : ''}
                                            options={renderListing('technology')}
                                            mandatory={false}
                                            handleChange={handleTechnologyChange}
                                            errors={errors.Masters}
                                            customClassName="mb-0"
                                        />
                                    </div>
                                </div>{/* d-inline-flex */}

                                <div className="d-inline-flex justify-content-start align-items-center mr-3">
                                    <div className="flex-fills label">Raw Material:</div>
                                    <div className="hide-label flex-fills pl-0 w-auto">
                                        <SearchableSelectHookForm
                                            label={''}
                                            name={'Raw Material'}
                                            placeholder={'Raw Material'}
                                            Controller={Controller}
                                            control={control}
                                            rules={{ required: false }}
                                            register={register}
                                            // defaultValue={technology.length !== 0 ? technology : ''}
                                            options={renderListing('material')}
                                            mandatory={false}
                                            handleChange={handleMaterialChange}
                                            errors={errors.Masters}
                                            customClassName="mb-0"
                                        />
                                    </div>
                                </div>{/* d-inline-flex */}

                                <div className="d-inline-flex justify-content-start align-items-center mr-3">
                                    <div className="flex-fills label">Grade:</div>
                                    <div className="hide-label flex-fills pl-0 w-auto">
                                        <SearchableSelectHookForm
                                            label={''}
                                            name={'Grade'}
                                            placeholder={'Grade'}
                                            Controller={Controller}
                                            control={control}
                                            rules={{ required: false }}
                                            register={register}
                                            // defaultValue={technology.length !== 0 ? technology : ''}
                                            options={renderListing('grade')}
                                            mandatory={false}
                                            handleChange={handleGradeChange}
                                            errors={errors.Masters}
                                            customClassName="mb-0"
                                        />
                                    </div>
                                </div>{/* d-inline-flex */}
                                <button title="Run" type="button" class="user-btn" onClick={submitDropdown}><div class="save-icon mr-0"></div></button>
                            </Col>
                        </Row>}

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
                                                    {/* <AgGridColumn headerName="Vendor2" headerClass="justify-content-center" marryChildren={true}>
                                                    <AgGridColumn width="150" field="Plant3" headerName="Plant 3" />
                                                    <AgGridColumn width="150" field="Plant4" headerName="Plant 4" />
                                                    <AgGridColumn width="150" field="Plant5" headerName="Plant 5" />
                                                </AgGridColumn> */}
                                                    {/* <AgGridColumn headerName="Vendor3" headerClass="justify-content-center" marryChildren={true}>
                                                    <AgGridColumn width="150" field="Plant6" headerName="Plant 6" />
                                                    <AgGridColumn width="150" field="Plant7" headerName="Plant 7" />
                                                    <AgGridColumn width="150" field="Plant8" headerName="Plant 8" />
                                                </AgGridColumn> */}
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
        </>
    )
}

export default InsightsBop