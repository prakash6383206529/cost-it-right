import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Col, Row } from 'reactstrap';
import { SearchableSelectHookForm } from '../../../layout/HookFormInputs'
import { getCostingTechnologySelectList } from '../../../costing/actions/Costing'
import { useDispatch, useSelector } from 'react-redux';
import { getGradeSelectList, getRawMaterialFilterSelectList } from '../../../masters/actions/Material'
import { AgGridReact } from 'ag-grid-react/lib/agGridReact';
import LoaderCustom from '../../../common/LoaderCustom'
import { AgGridColumn } from 'ag-grid-react/lib/agGridColumn';
import NoContentFound from '../../../common/NoContentFound'
import { defaultPageSize, EMPTY_DATA } from '../../../../config/constants'
import { Costmovementgraph } from '../../../dashboard/CostMovementGraph'
import { graphColor1, graphColor3, graphColor4, graphColor6 } from '../../../dashboard/ChartsDashboard'
import { PaginationWrapper } from '../../../common/commonPagination';
import { getCostingBenchMarkRmReport } from '../../actions/ReportListing';

function Insights(props) {
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
    const [vendor, setVendor] = useState([])
    const [plantName, setPlantName] = useState([])
    const [uniqueVendors, setUniqueVendors] = useState([])

    const [labelArray, setLabelArray] = useState([])

    const gridOptions = {};

    // const [technology, setTechnology] = useState({})
    const dispatch = useDispatch()
    let rmBenchmarkList = useSelector((state) => state.report.rmBenchmarkList)

    useEffect(() => {


        let arr = []

        props.data && props.data.map((item) => {

            arr.push({
                RawMaterialId: item.RawMaterialId,
                RawMaterialName: item.RawMaterial,
                TechnologyId: item.TechnologyId
            })
            return arr
        })
        let data = {
            FromDate: '',
            ToDate: '',
            RMCostBenchMarkingReports: arr
        }

        dispatch(getCostingBenchMarkRmReport(data, () => { }))

    }, [])



    let objNew = {
        Identity: null,
        Result: true,
        Message: "Success",
        Data: {},
        DataList: [
            {
                RawMaterialId: "ea97db49-e9f9-48bc-a055-9824f4c55c1c",
                Specification: [
                    {
                        TechnologyId: 2,
                        TechnologyName: "Forging",
                        RawMaterialName: "Iron Fillers",
                        RawMaterialCode: "RM-10003042",
                        RawMaterialSpecificationId: "ff593d32-37c3-484d-83af-9b9c51198817",
                        RawMaterialSpecificationName: "Iron Filler Sp-1",
                        RawMaterialGradeId: "88a0f881-2226-4420-ab91-8c156b163f40",
                        RawMaterialGradeName: "Iron Filler-1",
                        RawMaterialCategory: "STD",
                        Minimum: 1600,
                        Maximum: 1600,
                        Average: 1600,
                        RMVendorPrice: [
                            {
                                Vendor: "Associated Mfg. LLP",
                                Plant: [
                                    {
                                        PlantName: "SECBP1",
                                        Price: 1600,
                                        IsVendor: false,
                                        TotalVolume: 0,
                                        TotalGrossWeight: 0,
                                        TotalScrapWeight: 0,
                                        TotalConsumptionInTon: 0
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        TechnologyId: 2,
                        TechnologyName: "Forging",
                        RawMaterialName: "Iron Fillers",
                        RawMaterialCode: "RM-10003042",
                        RawMaterialSpecificationId: "3a2586ab-a5a2-44ae-9d44-77ec96600758",
                        RawMaterialSpecificationName: "Iron Filler Sp-2",
                        RawMaterialGradeId: "aa064e4d-7d07-445e-abd1-ab6d46d20720",
                        RawMaterialGradeName: "Iron Filler-2",
                        RawMaterialCategory: "STD",
                        Minimum: 2000,
                        Maximum: 2000,
                        Average: 2000,
                        RMVendorPrice: [
                            {
                                Vendor: "Associated Mfg. LLP",
                                Plant: [
                                    {
                                        PlantName: "SECBP2",
                                        Price: 2000,
                                        IsVendor: true,
                                        TotalVolume: 0,
                                        TotalGrossWeight: 0,
                                        TotalScrapWeight: 0,
                                        TotalConsumptionInTon: 0
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        TechnologyId: 2,
                        TechnologyName: "Forging",
                        RawMaterialName: "Iron Fillers",
                        RawMaterialCode: "RM-10003042",
                        RawMaterialSpecificationId: "ede81dbf-97ad-4dc0-af19-7eca2f5741e7",
                        RawMaterialSpecificationName: "Iron Filler Sp-4",
                        RawMaterialGradeId: "aa064e4d-7d07-445e-abd1-ab6d46d20720",
                        RawMaterialGradeName: "Iron Filler-2",
                        RawMaterialCategory: "STD",
                        Minimum: 40,
                        Maximum: 40001,
                        Average: 11023.75,
                        RMVendorPrice: [
                            {
                                Vendor: "Associated Mfg. LLP",
                                Plant: [
                                    {
                                        PlantName: "SECBP1",
                                        Price: 40001,
                                        IsVendor: true,
                                        TotalVolume: 0,
                                        TotalGrossWeight: 0,
                                        TotalScrapWeight: 0,
                                        TotalConsumptionInTon: 0
                                    },
                                    {
                                        PlantName: "SECBP1",
                                        Price: 40,
                                        IsVendor: true,
                                        TotalVolume: 0,
                                        TotalGrossWeight: 0,
                                        TotalScrapWeight: 0,
                                        TotalConsumptionInTon: 0
                                    },
                                    {
                                        PlantName: "SECBP1",
                                        Price: 54,
                                        IsVendor: true,
                                        TotalVolume: 0,
                                        TotalGrossWeight: 0,
                                        TotalScrapWeight: 0,
                                        TotalConsumptionInTon: 0
                                    },
                                    {
                                        PlantName: "SECBP1",
                                        Price: 4000,
                                        IsVendor: true,
                                        TotalVolume: 0,
                                        TotalGrossWeight: 0,
                                        TotalScrapWeight: 0,
                                        TotalConsumptionInTon: 0
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        TechnologyId: 2,
                        TechnologyName: "Forging",
                        RawMaterialName: "Iron Fillers",
                        RawMaterialCode: "RM-10003042",
                        RawMaterialSpecificationId: "de6ddddf-f93f-43a9-8fa2-fe85c5f843dd",
                        RawMaterialSpecificationName: "Iron Filler Sp-3",
                        RawMaterialGradeId: "aa064e4d-7d07-445e-abd1-ab6d46d20720",
                        RawMaterialGradeName: "Iron Filler-2",
                        RawMaterialCategory: "STD",
                        Minimum: 2500,
                        Maximum: 2500,
                        Average: 2500,
                        RMVendorPrice: [
                            {
                                Vendor: "Associated Mfg. LLP",
                                Plant: [
                                    {
                                        PlantName: "SECBP5",
                                        Price: 2500,
                                        IsVendor: false,
                                        TotalVolume: 0,
                                        TotalGrossWeight: 0,
                                        TotalScrapWeight: 0,
                                        TotalConsumptionInTon: 0
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        TechnologyId: 2,
                        TechnologyName: "Forging",
                        RawMaterialName: "Iron Fillers",
                        RawMaterialCode: "RM-10003042",
                        RawMaterialSpecificationId: "eb9ce772-2630-4805-8a5f-96b7206349f0",
                        RawMaterialSpecificationName: "Iron Filler Sp-4",
                        RawMaterialGradeId: "1039366c-d52f-4903-a658-bdf66de21add",
                        RawMaterialGradeName: "Iron Filler-3",
                        RawMaterialCategory: "STD",
                        Minimum: 3000,
                        Maximum: 3500,
                        Average: 3250,
                        RMVendorPrice: [
                            {
                                Vendor: "Associated Mfg. LLP2",
                                Plant: [
                                    {
                                        PlantName: "SECBP2",
                                        Price: 3500,
                                        IsVendor: true,
                                        TotalVolume: 40,
                                        TotalGrossWeight: 5,
                                        TotalScrapWeight: 1,
                                        TotalConsumptionInTon: 0.2
                                    },
                                    {
                                        PlantName: "SECBP3",
                                        Price: 3000,
                                        IsVendor: true,
                                        TotalVolume: 60,
                                        TotalGrossWeight: 3,
                                        TotalScrapWeight: 1,
                                        TotalConsumptionInTon: 0.18
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
        setShowListing(false)
        dispatch(getCostingTechnologySelectList(() => { }))
        dispatch(getGradeSelectList(() => { }))
        dispatch(getRawMaterialFilterSelectList(() => { }))

        let temp = []
        let vendorTemp = []
        let uniqueVendors = []

        ////////////////////////////////////////////////////////////////

        rmBenchmarkList && rmBenchmarkList[0].Specification.map((item, i) => {               //ITERATION FOR ALL SPECIFICATIONS
            let plantTemp = []
            let obj = {
                Specification: item.RawMaterialSpecificationName,                       //SETTING 4 VALUES FOR EACH SPECIFICATION IN OBJ
                Minimum: item.Minimum,
                Maximum: item.Maximum,
                Average: item.Average,
            }


            item.RMVendorPrice[0].Plant.map((ele, ind) => {
                let Val = `plant` + ind
                obj[Val] = ele.Price

            })


            temp.push(obj)           // PUSHING OBJ IN TEMP ARRAY FOR EACH SPECIFICATION

            let obj2 = {}
            obj2.vendor = item.RMVendorPrice[0].Vendor                    // OBJ2 
            item.RMVendorPrice[0].Plant.map((el) => {
                plantTemp.push(el.PlantName)

            })
            obj2.plants = plantTemp

            vendorTemp.push(obj2)
            uniqueVendors.push(item?.RMVendorPrice[0]?.Vendor)

        })

        ////////////////////////////////////////////////////////////////////
        let uniqueV = uniqueVendors.filter((item, i, ar) => ar.indexOf(item) === i);





        let finalArray = []
        uniqueV.map((item) => {
            let obj = {}
            obj.vendor = item
            let plants = []

            vendorTemp.map((element) => {

                if (element.vendor == item) {

                    plants = [...plants, ...element.plants]
                }

            })
            let uniqueP = plants.filter((item, i, ar) => ar.indexOf(item) === i);
            obj.plants = uniqueP
            finalArray.push(obj)
        })





        setVendor(finalArray)
        setRowDataNew(temp)



        let arr = [{

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


        ]



        let array55 = []
        finalArray.map((item) => {

            let childPlants = []

            item.plants.map((ele, ind) => {

                let plantObj = {
                    headerName: ele,
                    field: `plant${ind}`,
                    width: "115"
                }
                childPlants.push(plantObj)

            })


            let obj = {

                headerName: `${item.vendor}`,
                headerClass: "justify-content-center",
                marryChildren: true,
                children: childPlants
            }

            array55.push(obj)

        })


        setTableHeaderColumnDefs([...arr, ...array55])



        setTimeout(() => {


            setShowListing(true)
        }, 500);
    }, [rmBenchmarkList]);

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

        tableHeaderColumnDefs.map((item, index) => {

            if (index > 3) {

                item.children.map((ele) => {
                    labelArr.push(`${item.headerName}-${ele.headerName}`)
                })

            }

        })


        setLabelArray(labelArr)


        var rowCount = event.api.getSelectedRows();
        console.log(rowCount[0], "rowcount")
        var graphDataNew = rowCount[0].graphData;
        var avgGraphData = rowCount[0].Average;
        var minGraphData = rowCount[0].minimumData;
        var maxGraphData = rowCount[0].maximumData;

        var array = []
        var obj = rowCount[0]
        for (var prop in obj) {
            if (prop.includes('plant')) {

                array.push(obj[prop])
            }

        }


        graphDataNew = array

        setDynamicGrpahData(graphDataNew);

        setAverageGrpahData(avgGraphData);

        setMinimumGrpahData(minGraphData);
        setMaximumGrpahData(maxGraphData);
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
        sortable: true,
        // headerCheckboxSelection: isFirstColumn,
        // checkboxSelection: isFirstColumn
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
        params.api.sizeColumnsToFit()

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
                data: [25, 25, 30, 35, 45, 55, 65, 75]
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




    return (
        <>
            <div className="container-fluid rminsights_page">
                <form onSubmit={handleSubmit} noValidate >
                    {false && <Row className="pt-4">
                        <Col md="12" className="filter-block">
                            <div className="d-inline-flex justify-content-start align-items-center mr-3">
                                <div className="flex-fills label">Technology:</div>
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
                                                <AgGridColumn pinned="left" width="140" field="Specification" />
                                                <AgGridColumn pinned="left" width="115" field="Minimum" />
                                                <AgGridColumn pinned="left" width="115" field="Maximum" />
                                                <AgGridColumn pinned="left" width="115" field="Average" />
                                                { }



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
                </form>
            </div>
            {/* container-fluid */}
        </>
    )
}

export default Insights