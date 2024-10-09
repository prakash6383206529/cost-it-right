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
import { getCostingBenchMarkRmReport } from '../../actions/ReportListing';
import DayTime from '../../../common/DayTimeWrapper';
import { checkForDecimalAndNull } from '../../../../helper';
import { useLabels } from '../../../../helper/core';

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
    const [isLoader, setIsLoader] = useState(true)
    const [vendor, setVendor] = useState([])

    const [labelArray, setLabelArray] = useState([])
    const { technologyLabel } = useLabels();
    const gridOptions = {};

    // const [technology, setTechnology] = useState({})
    const dispatch = useDispatch()
    let rmBenchmarkList = useSelector((state) => state.report.BenchmarkList)



    let obj5 = {
        Identity: null,
        Result: true,
        Message: "Success",
        Data: {
            RawMaterialChildId: "6e267266-d42d-41ed-bfba-03a349648e47",
            Specification: [
                {
                    TechnologyId: 1,
                    TechnologyName: "Sheet Metal",
                    RawMaterialName: "RM-20-10-22-18:20",
                    RawMaterialCode: "RM-1000119",
                    RawMaterialSpecificationId: "33f3d772-b736-4842-9883-b88b430a9e8e",
                    RawMaterialSpecificationName: "RMS-20-10-22-1",
                    RawMaterialGradeId: "21fbb80c-a3dd-4cc9-bf3b-2ce3d1bd2440",
                    RawMaterialGradeName: "RMG-20-10-22-1",
                    RawMaterialCategory: "STD",
                    EffectiveDate: "2022-09-02T00:00:00",
                    Minimum: 10,
                    Maximum: 10,
                    Average: 10,
                    WeightedAverage: 432,
                    RMVendorPrice: [
                        {
                            Vendor: "BU Vendor SIPL",
                            Plant: [
                                {
                                    PlantName: "Bhandari Plant",
                                    Price: 10,
                                    CostingTypeId: 2,
                                    TotalVolume: 432,
                                    TotalGrossWeight: 5,
                                    TotalScrapWeight: 1,
                                    TotalConsumptionInTon: 2.16
                                },
                                {
                                    PlantName: "second Plant",
                                    Price: 20,
                                    CostingTypeId: 2,
                                    TotalVolume: 432,
                                    TotalGrossWeight: 5,
                                    TotalScrapWeight: 1,
                                    TotalConsumptionInTon: 2.16
                                }
                            ]
                        }
                    ]
                },
                {
                    TechnologyId: 1,
                    TechnologyName: "Sheet Metal",
                    RawMaterialName: "RM-20-10-22-18:20",
                    RawMaterialCode: "RM-1000120",
                    RawMaterialSpecificationId: "dea86c1f-b2d0-4109-ad32-550968a6003b",
                    RawMaterialSpecificationName: "RMS-20-10-22-2",
                    RawMaterialGradeId: "da4a0c18-03e0-4a5b-8c26-708be7d89f38",
                    RawMaterialGradeName: "RMG-20-10-22-2",
                    RawMaterialCategory: "STD",
                    EffectiveDate: "2022-09-04T00:00:00",
                    Minimum: 20,
                    Maximum: 20,
                    Average: 20,
                    WeightedAverage: 297,
                    RMVendorPrice: [
                        {
                            Vendor: "Flottweg SE",
                            Plant: [
                                {
                                    PlantName: "Bhu Plant",
                                    Price: 20,
                                    CostingTypeId: 2,
                                    TotalVolume: 297,
                                    TotalGrossWeight: 10,
                                    TotalScrapWeight: 1,
                                    TotalConsumptionInTon: 2.97
                                }
                            ]
                        }
                    ]
                },
                {
                    TechnologyId: 1,
                    TechnologyName: "Sheet Metal",
                    RawMaterialName: "RM-20-10-22-18:20",
                    RawMaterialCode: "RM-1000121",
                    RawMaterialSpecificationId: "50c34546-9dcd-4d66-8f68-6b04086fdf73",
                    RawMaterialSpecificationName: "RMS-20-10-22-3",
                    RawMaterialGradeId: "42a7400f-a5a6-4bf6-be11-58048abf3c59",
                    RawMaterialGradeName: "RMG-20-10-22-3",
                    RawMaterialCategory: "CTS",
                    EffectiveDate: "2022-09-14T00:00:00",
                    Minimum: 60,
                    Maximum: 60,
                    Average: 60,
                    WeightedAverage: 149,
                    RMVendorPrice: [
                        {
                            Vendor: "wallmax",
                            Plant: [
                                {
                                    PlantName: "P1",
                                    Price: 60,
                                    CostingTypeId: 2,
                                    TotalVolume: 149,
                                    TotalGrossWeight: 123,
                                    TotalScrapWeight: 110,
                                    TotalConsumptionInTon: 18.327
                                }
                            ]
                        }
                    ]
                },
                {
                    TechnologyId: 1,
                    TechnologyName: "Sheet Metal",
                    RawMaterialName: "RM-20-10-22-18:20",
                    RawMaterialCode: "RM-1000121",
                    RawMaterialSpecificationId: "50c34546-9dcd-4d66-8f68-6b04086fdf73",
                    RawMaterialSpecificationName: "RMS-20-10-22-3",
                    RawMaterialGradeId: "42a7400f-a5a6-4bf6-be11-58048abf3c59",
                    RawMaterialGradeName: "RMG-20-10-22-3",
                    RawMaterialCategory: "STD",
                    EffectiveDate: "2022-09-26T00:00:00",
                    Minimum: 488,
                    Maximum: 488,
                    Average: 488,
                    WeightedAverage: 135,
                    RMVendorPrice: [
                        {
                            Vendor: "wallmax",
                            Plant: [
                                {
                                    PlantName: "P1",
                                    Price: 488,
                                    CostingTypeId: 2,
                                    TotalVolume: 135,
                                    TotalGrossWeight: 72,
                                    TotalScrapWeight: 2,
                                    TotalConsumptionInTon: 9.72
                                }
                            ]
                        }
                    ]
                },
                {
                    TechnologyId: 1,
                    TechnologyName: "Sheet Metal",
                    RawMaterialName: "RM-20-10-22-18:20",
                    RawMaterialCode: "RM-1000121",
                    RawMaterialSpecificationId: "50c34546-9dcd-4d66-8f68-6b04086fdf73",
                    RawMaterialSpecificationName: "RMS-20-10-22-3",
                    RawMaterialGradeId: "42a7400f-a5a6-4bf6-be11-58048abf3c59",
                    RawMaterialGradeName: "RMG-20-10-22-3",
                    RawMaterialCategory: "STD",
                    EffectiveDate: "2022-09-26T00:00:00",
                    Minimum: 30,
                    Maximum: 30,
                    Average: 30,
                    WeightedAverage: 148,
                    RMVendorPrice: [
                        {
                            Vendor: "Green Planet PVT LTD",
                            Plant: [
                                {
                                    PlantName: "Flottweg SEP",
                                    Price: 30,
                                    CostingTypeId: 2,
                                    TotalVolume: 148,
                                    TotalGrossWeight: 123,
                                    TotalScrapWeight: 100,
                                    TotalConsumptionInTon: 18.204
                                }
                            ]
                        }
                    ]
                },
                {
                    TechnologyId: 1,
                    TechnologyName: "Sheet Metal",
                    RawMaterialName: "RM-20-10-22-18:20",
                    RawMaterialCode: "RM-1000122",
                    RawMaterialSpecificationId: "3764ef2f-35b7-4ea2-a338-45da7a4cece1",
                    RawMaterialSpecificationName: "RMS-20-10-22-4",
                    RawMaterialGradeId: "9d373f23-b30c-4565-b782-6b62789c470f",
                    RawMaterialGradeName: "RMG-20-10-22-4",
                    RawMaterialCategory: "STD",
                    EffectiveDate: "2022-09-10T00:00:00",
                    Minimum: 40,
                    Maximum: 40,
                    Average: 40,
                    WeightedAverage: 149,
                    RMVendorPrice: [
                        {
                            Vendor: "LMN PVT LTD",
                            Plant: [
                                {
                                    PlantName: "Honda P",
                                    Price: 40,
                                    CostingTypeId: 2,
                                    TotalVolume: 149,
                                    TotalGrossWeight: 33,
                                    TotalScrapWeight: 1,
                                    TotalConsumptionInTon: 4.917
                                }
                            ]
                        }
                    ]
                },
                {
                    TechnologyId: 1,
                    TechnologyName: "Sheet Metal",
                    RawMaterialName: "RM-20-10-22-18:20",
                    RawMaterialCode: "RM-1000123",
                    RawMaterialSpecificationId: "1d8a0f44-f9ff-412c-8c49-95943d6f1163",
                    RawMaterialSpecificationName: "RMS-20-10-22-5",
                    RawMaterialGradeId: "18b5ae46-2f73-40ab-9c80-89498cd2298b",
                    RawMaterialGradeName: "RMG-20-10-22-5",
                    RawMaterialCategory: "COIL",
                    EffectiveDate: "2022-09-12T00:00:00",
                    Minimum: 50,
                    Maximum: 345,
                    Average: 197.5,
                    WeightedAverage: 297.746835443038,
                    RMVendorPrice: [
                        {
                            Vendor: "Honda V",
                            Plant: [
                                {
                                    PlantName: "Flottweg SEP",
                                    Price: 345,
                                    CostingTypeId: 2,
                                    TotalVolume: 149,
                                    TotalGrossWeight: 122,
                                    TotalScrapWeight: 2,
                                    TotalConsumptionInTon: 18.178
                                }
                            ]
                        },
                        {
                            Vendor: "SIPL",
                            Plant: [
                                {
                                    PlantName: "MindaPlant",
                                    Price: 50,
                                    CostingTypeId: 2,
                                    TotalVolume: 148,
                                    TotalGrossWeight: 35,
                                    TotalScrapWeight: 1,
                                    TotalConsumptionInTon: 5.18
                                }
                            ]
                        }
                    ]
                },
                {
                    TechnologyId: 1,
                    TechnologyName: "Sheet Metal",
                    RawMaterialName: "RM-20-10-22-18:20",
                    RawMaterialCode: "RM-1000124",
                    RawMaterialSpecificationId: "9cca12e6-ffd1-44b7-a0f4-0edcc7873307",
                    RawMaterialSpecificationName: "RMS-20-10-22-2",
                    RawMaterialGradeId: "9d373f23-b30c-4565-b782-6b62789c470f",
                    RawMaterialGradeName: "RMG-20-10-22-4",
                    RawMaterialCategory: "CTL",
                    EffectiveDate: "2022-09-15T00:00:00",
                    Minimum: 45,
                    Maximum: 45,
                    Average: 45,
                    WeightedAverage: 135,
                    RMVendorPrice: [
                        {
                            Vendor: "Aone1",
                            Plant: [
                                {
                                    PlantName: "SECBP",
                                    Price: 45,
                                    CostingTypeId: 2,
                                    TotalVolume: 135,
                                    TotalGrossWeight: 44,
                                    TotalScrapWeight: 1,
                                    TotalConsumptionInTon: 5.94
                                }
                            ]
                        }
                    ]
                },
                {
                    TechnologyId: 1,
                    TechnologyName: "Sheet Metal",
                    RawMaterialName: "RM-20-10-22-18:20",
                    RawMaterialCode: "RM-1000125",
                    RawMaterialSpecificationId: "622ed071-e8c9-4bdf-b67b-6066a7610e56",
                    RawMaterialSpecificationName: "RMS-20-10-22-2",
                    RawMaterialGradeId: "21fbb80c-a3dd-4cc9-bf3b-2ce3d1bd2440",
                    RawMaterialGradeName: "RMG-20-10-22-1",
                    RawMaterialCategory: "CTS",
                    EffectiveDate: "2022-09-17T00:00:00",
                    Minimum: 23,
                    Maximum: 44,
                    Average: 33.5,
                    WeightedAverage: 278.92537313432837,
                    RMVendorPrice: [
                        {
                            Vendor: "Stark",
                            Plant: [
                                {
                                    PlantName: "SECBP",
                                    Price: 23,
                                    CostingTypeId: 2,
                                    TotalVolume: 148,
                                    TotalGrossWeight: 76,
                                    TotalScrapWeight: 2,
                                    TotalConsumptionInTon: 11.248
                                }
                            ]
                        },
                        {
                            Vendor: "RajKumar",
                            Plant: [
                                {
                                    PlantName: "RajManiP",
                                    Price: 44,
                                    CostingTypeId: 2,
                                    TotalVolume: 135,
                                    TotalGrossWeight: 65,
                                    TotalScrapWeight: 10,
                                    TotalConsumptionInTon: 8.775
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        DataList: [],
        SelectList: [],
        DynamicData: null
    }



    useEffect(() => {

        let arr = []
        props.data && props.data.map((item) => {

            arr.push({
                RawMaterialId: item.RawMaterialId,
                RawMaterialName: item.RawMaterialName,
                // RawMaterialName: item.RawMaterial,           //RE
                TechnologyId: item.TechnologyId
            })
            return arr
        })
        let data = {
            FromDate: props.dateArray[0] ? props.dateArray[0] : null,
            ToDate: props.dateArray[1] ? props.dateArray[1] : null,
            RMCostBenchMarkingReports: arr
        }

        dispatch(getCostingBenchMarkRmReport(data, (res) => {
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

        rmBenchmarkList && rmBenchmarkList.Specification?.map((item, i) => {               //ITERATION FOR ALL SPECIFICATIONS
            let plantTemp = []
            let plantTypeTemp = []
            let obj = {           //OBJ IS CUSTOM OBJECT THAT WILL BE PASSED AS ROWDATA TO AG-GRID
                Specification: item.RawMaterialSpecificationName,
                Minimum: item.Minimum,
                Maximum: item.Maximum,                //SETTING 6 VALUES FOR EACH SPECIFICATION IN OBJ
                Average: item.Average,
                WeightedAverage: item.WeightedAverage,
                EffectiveFromDate: item.EffectiveFromDate,
                EffectiveToDate: item.EffectiveToDate
            }


            item.RMVendorPrice.map((data, indx) => {

                data.Plant.map((ele, ind) => {
                    let Val = `plant${data.VendorName}${ele.PlantName}`                         // SETTING PLANTS FOR EACH VENDOR IN OBJ
                    obj[Val] = ele.Price

                    let Val2 = `quantity${data.VendorName}${ele.PlantName}`                          // SETTING PLANTS FOR EACH VENDOR IN OBJ
                    obj[Val2] = ele.TotalConsumptionInTon


                    let Val3 = `value${data.VendorName}${ele.PlantName}`                          // SETTING PLANTS FOR EACH VENDOR IN OBJ
                    obj[Val3] = ele.TotalValue


                    let Val4 = `plantBar${data.VendorName}${ele.PlantName}` + ind
                    obj[Val4] = ele.Price


                })

            })


            temp.push(obj)           // PUSHING OBJ IN TEMP ARRAY FOR EACH SPECIFICATION

            ///////////////////////////////////////////////////////////////////////////////////////////

            let obj2 = {}
            let arrSample = []
            item.RMVendorPrice.map((ele, ind) => {

                obj2 = {}
                obj2.vendor = ele.VendorName
                obj2.vendorCode = ele.VendorCode                // OBJ2 

                ele.Plant.map((el) => {
                    plantTemp.push(el.PlantName)
                    plantTypeTemp.push(el.PlantName + el.CostingTypeId + el.CostingTypeId)

                })
                obj2.plants = plantTemp
                obj2.plantsType = plantTypeTemp
                plantTemp = []
                plantTypeTemp = []

                arrSample.push(obj2)
                uniqueVendors.push(ele.VendorName)        //UNIQUEVENDORS HAS ALL THE TOTAL VENDORS IN DATA (WITH DUPLICATE ENTRY)

            })

            vendorTemp.push(arrSample)           //VENDOR TEMP HAS VENDOR & ITS ASSOCIATED PLANTS

        })


        ////////////////////////////////////////////////////////////////////////////

        let uniqueV = uniqueVendors.filter((item, i, ar) => ar.indexOf(item) === i);   //UNIQUEV= ALL VENDORS WITHOUT DUPLICATE ENTRY

        let finalArray = []
        uniqueV.map((item) => {

            let obj = {}
            obj.vendor = item
            let plants = []
            let plantsType = []

            vendorTemp.map((element, indx) => {


                element.map((e) => {

                    if (e.vendor == item) {
                        obj.vendorCode = e.vendorCode

                        plants = [...plants, ...e.plants]
                        plantsType = [...plantsType, ...e.plantsType]
                    }

                })

            })
            let uniqueP = plants.filter((item, i, ar) => ar.indexOf(item) === i);
            let uniquePType = plantsType.filter((item, i, ar) => ar.indexOf(item) === i);

            obj.plants = uniqueP
            obj.plantsType = uniquePType
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


            let childPlantsVbc = []
            let childPlantsZbc = []


            item.plants.map((ele, ind) => {



                let rate = {

                    headerName: "RM Rate",
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
                    width: "125",
                    cellRendererFramework: (params) => params.value ? params.value : '-',
                    marryChildren: true,
                    children: [rate, Quantity, Value]

                }


                let str = item.plantsType[ind]
                if (str.charAt(str.length - 1) == 2) {

                    childPlantsVbc.push(plantObj)
                } else {
                    childPlantsZbc.push(plantObj)

                }


                // childPlantsVbc.push(plantObj)

            })

            let inHouse = {
                headerName: "In-house",
                width: "115",
                marryChildren: true,
                children: childPlantsZbc

            }
            let VendorBased = {
                headerName: "Vendor Based",
                width: "115",
                marryChildren: true,
                children: childPlantsVbc
            }
            let VbcZbc = [inHouse, VendorBased]



            let obj = {
                headerName: `${item.vendor}`,
                headerClass: "justify-content-center",
                marryChildren: true,
                // children: childPlants
                children: VbcZbc
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

                    ele.children.map((itemI) => {

                        labelArr.push(`${item.headerName}-${itemI.headerName}`)
                    })
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
            if (prop.includes('plantBar')) {
                array.push(obj[prop])
                plantLabel.push(prop)

            }
        }


        let newArr = []
        labelArr.map((item, index) => {
            plantLabel.map((element, ind) => {
                let ele = element.slice(8, -1)

                var newStr = item.replaceAll('-', '')
                ele = ele.replaceAll('-', '')

                if (newStr.includes(ele)) {
                    newArr[index] = array[ind]
                }
            })
        })

        graphDataNew = newArr
        setDynamicGrpahData(graphDataNew);
        setMinimumGrpahData(minGraphData);
        setMaximumGrpahData(maxGraphData);

        let avgArray = []
        labelArr && labelArr.map((item, ind) => {
            avgArray.push(avgGraphData)
        })
        setAverageGrpahData(avgArray)

        // var rowCount = event.api.getSelectedRows();

        // var graphDataNew = rowCount[0].graphData;
        // var avgGraphData = rowCount[0].Average;
        // var minGraphData = rowCount[0].minimumData;
        // var maxGraphData = rowCount[0].maximumData;

        // var array = []
        // var obj = rowCount[0]
        // for (var prop in obj) {
        //     if (prop.includes('plant')) {

        //         array.push(obj[prop])
        //     }

        // }

        // graphDataNew = array

        // setDynamicGrpahData(graphDataNew);

        // setAverageGrpahData(avgGraphData);

        // setMinimumGrpahData(minGraphData);
        // setMaximumGrpahData(maxGraphData);
        // // 
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
        // customLoadingOverlay: LoaderCustom,
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
            {showListing &&
                <button type="button" className="user-btn report-btn-reset float-right mb-2" title="Reset Grid" onClick={() => resetState()}>
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
                        { }

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
                                                    enableBrowserTooltips={true}
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
            {/* container-fluid */}
        </>
    )
}

export default Insights