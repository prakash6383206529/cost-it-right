import React, { useState, useEffect } from 'react'
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { useDispatch } from 'react-redux'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { EMPTY_DATA } from '../../../config/constants'
import { Costmovementgraph } from '../../dashboard/CostMovementGraph'
import { graphColor1, graphColor2, graphColor3, graphColor4, graphColor6, options5 } from '../../dashboard/ChartsDashboard'
import { Line, Bar } from 'react-chartjs-2';
import DayTime from '../../common/DayTimeWrapper';
import { getCostMovementReport } from '../../../actions/Common';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import { Controller, useForm } from "react-hook-form";
import RenderGraphList from '../../common/RenderGraphList';



function AnalyticsDrawer(props) {

    const { ModeId, rowData, importEntry } = props



    const { register, handleSubmit, control, setValue, formState: { errors } } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const toggleDrawer = (event, mode = false) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        props.closeDrawer('', mode)
    };

    const dispatch = useDispatch()

    const [showList, setShowList] = useState(true)
    const [uomValue, setUomValue] = useState("")
    const [showBarGraph, setShowBarGraph] = useState(false)
    const [showLineGraph, setShowLineGraph] = useState(false)
    const [gridData, setGridData] = useState([])
    const [dateRangeArray, setDateRangeArray] = useState([])
    const [netLandedCostArray, setNetLandedCostArray] = useState([])


    useEffect(() => {


        setUomValue(props.rowData?.UOM)
        setValue('singleDropDown', { label: "List", value: "1" })

        let obj = {}
        obj.ModeId = props.ModeId
        obj.MasterIdList = [{
            MasterId: ModeId === 1 ? props.rowData.RawMaterialId : ModeId === 2 ? props.rowData.BoughtOutPartId : ModeId === 3 ? props.rowData.OperationId : props.rowData.MachineId,

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
                    netLandedCostArray.push(item.NetLandedCost)
                })
                setNetLandedCostArray(netLandedCostArray)
                setDateRangeArray(dateArray)

            }
        }))

    }, [])




    const gridOptions = {};
    const cancel = (e = '') => {
        toggleDrawer(e)
    }



    const onChangeValue = (e) => {


        if (e.target.value === "List") {
            setShowList(true)
            setShowLineGraph(false)
            setShowBarGraph(false)
        }

        if (e.target.value === "BarGraph") {
            setShowList(false)
            setShowLineGraph(false)
            setShowBarGraph(true)
        }
        if (e.target.value === "LineGraph") {
            setShowList(false)
            setShowLineGraph(true)
            setShowBarGraph(false)
        }



    }


    const valueChanged = (event) => {



        if (Number(event.value) === Number(1)) {
            setShowList(true)
            setShowLineGraph(false)
            setShowBarGraph(false)
        }

        if (Number(event.value) === Number(2)) {

            setShowList(false)
            setShowLineGraph(false)
            setShowBarGraph(true)
        }

        if (Number(event.value) === Number(3)) {

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
        datasets: [
            {
                label: `Landed Rate (${uomValue})`,
                fill: false,
                lineTension: 0,
                backgroundColor: 'rgba(75,192,192,1)',
                borderColor: 'rgba(0,0,0,1)',
                borderWidth: 2,
                data: netLandedCostArray
            },

        ]
    }




    const data1 = {
        labels: dateRangeArray,
        datasets: [

            {
                type: 'bar',
                label: `Landed Rate (${uomValue})`,
                backgroundColor: graphColor4,
                data: netLandedCostArray,
                maxBarThickness: 25,
            },

        ],
    };


    const effectiveDateFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? DayTime(cellValue).format('DD/MM/YYYY') : '';


    }


    const frameworkComponents = {

        effectiveDateRenderer: effectiveDateFormatter
    };

    const onGridReady = (params) => {
        // this.setState({ gridApi: params.api, gridColumnApi: params.columnApi })
        params.api.paginationGoToPage(0);
    };

    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined && cellValue !== 0) ? cellValue : '-';
    }

    const rowSpan = (params) => {
        return 5
    }


    return (
        <div>
            {<>
                <Drawer
                    anchor={props.anchor}
                    open={props.isOpen}
                // onClose={(e) => this.toggleDrawer(e)}
                >
                    <Container>
                        <div className={"drawer-wrapper drawer-1500px simulation-costing-details-drawers"}>
                            <form noValidate className="form">
                                <Row className="drawer-heading">
                                    <Col>
                                        <div className={"header-wrapper left"}>
                                            <h3>
                                                {ModeId === 1 ? " RM History" : (ModeId === 2 ? "BOP History" : ModeId === 3 ? "Operation History" : "Machine History")}
                                            </h3>
                                        </div>
                                        <div
                                            onClick={(e) => toggleDrawer(e)}
                                            className={"close-button right"}
                                        ></div>
                                    </Col>
                                </Row>


                                <RenderGraphList valueChanged={valueChanged} />
                                {/* 
                                <div onChange={onChangeValue}>
                                    <Col>

                                        <input className="mr-1" type="radio" value="List" name="graph" defaultChecked /> List


                                        <input className="ml-4 mr-1" type="radio" value="BarGraph" name="graph" /> Bar-Graph


                                        <input className="ml-4 mr-1" type="radio" value="LineGraph" name="graph" /> Line-Graph

                                    </Col>
                                </div> */}

                                <div className='mt-3 mb-3'>
                                    <h7>{ModeId === 1 ? `RM Code : ${rowData?.RawMaterialCode} ` : (ModeId === 2 ? `BOP No. : ${rowData?.BoughtOutPartNumber}` : ModeId === 3 ? `Operation Code : ${rowData?.OperationCode} ` : `Machine No. : ${rowData?.MachineNumber}`)}</h7>
                                </div>



                                {showList &&

                                    < Row >
                                        <Col>

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
                                                        {<AgGridColumn field="BasicRatePerUOM" headerName="Basic Rate" ></AgGridColumn>}
                                                        {ModeId == 1 && <AgGridColumn field="RMFreightCost" headerName="Freight" cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                        {ModeId == 1 && <AgGridColumn field="RMShearingCost" headerName="Shearing" cellRenderer={hyphenFormatter} ></AgGridColumn>}
                                                        {<AgGridColumn field="NetLandedCost" headerName="Landed (Total)"></AgGridColumn>}

                                                        {(ModeId == 1 || ModeId == 2) && importEntry && <AgGridColumn field="NetLandedCostCurrency" headerName="Landed Total (Currency)"></AgGridColumn>}

                                                        {<AgGridColumn field="UnitOfMeasurement" headerName="UOM"></AgGridColumn>}
                                                        {<AgGridColumn field="EffectiveDate" headerName="Effective Date" cellRenderer='effectiveDateRenderer'></AgGridColumn>}





                                                    </AgGridReact>

                                                </div>
                                            </div>

                                        </Col>
                                    </Row>

                                }

                                {showBarGraph &&
                                    <Row className="mt-4">
                                        <Col md="12">
                                            <Costmovementgraph graphData={data1} graphHeight={120} />
                                        </Col>
                                    </Row>

                                }



                                {showLineGraph &&

                                    <div>
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
                                                }
                                            }}
                                        />
                                    </div>
                                }



                            </form>
                            <Row className="sf-btn-footer no-gutters justify-content-between">
                                <div className="col-md-12 px-3">
                                    <div className="text-right px-3">

                                        <button type={"button"} className="cancel-btn" onClick={cancel}>
                                            <div className={"cancel-icon"}></div>{" "}
                                            {"CANCEL"}
                                        </button>
                                    </div>
                                </div>
                            </Row>
                        </div >
                    </Container >
                </Drawer >
            </>}


        </div >
    );
}

export default AnalyticsDrawer;