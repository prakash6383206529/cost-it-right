import React, { useState, useEffect } from 'react'
import { Container, Row, Col, } from 'reactstrap';
import Drawer from '@material-ui/core/Drawer';
import { useDispatch } from 'react-redux'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import { EMPTY_DATA } from '../../../config/constants'
import { Costmovementgraph } from '../../dashboard/CostMovementGraph'
import { primaryColor, secondryColor } from '../../dashboard/ChartsDashboard'
import { Line, Bar } from 'react-chartjs-2';
import DayTime from '../../common/DayTimeWrapper';
import { getCostMovementReport } from '../../../actions/Common';
import { Controller, useForm } from "react-hook-form";
import RenderGraphList from '../../common/RenderGraphList';
import HeaderTitle from '../../common/HeaderTitle';
import { PaginationWrapper } from '../../common/commonPagination';


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
    const [gridApi, setGridApi] = useState(null);


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
                backgroundColor: secondryColor,
                borderColor: primaryColor,
                borderWidth: 2,
                data: netLandedCostArray,
                pointBackgroundColor: secondryColor
            },

        ]
    }




    const data1 = {
        labels: dateRangeArray,
        datasets: [

            {
                type: 'bar',
                label: `Landed Rate (${uomValue})`,
                backgroundColor: primaryColor,
                data: netLandedCostArray,
                maxBarThickness: 25,
                borderColor: primaryColor
            },

        ],
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
                        <div className={"drawer-wrapper drawer-1500px "}>
                            <form noValidate className="form">
                                <Row className="drawer-heading mb-0">
                                    <Col className='px-0'>
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

                                <div className='analylics-drawer'>
                                    <HeaderTitle customClass="mb-0"
                                        title={ModeId === 1 ? `RM Code : ${rowData?.RawMaterialCode} ` : (ModeId === 2 ? `BOP No. : ${rowData?.BoughtOutPartNumber}` : ModeId === 3 ? `Operation Code : ${rowData?.OperationCode} ` : `Machine No. : ${rowData?.MachineNumber}`)}
                                    />
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
                                                            {<AgGridColumn field="BasicRatePerUOM" headerName="Basic Rate" ></AgGridColumn>}
                                                            {ModeId == 1 && <AgGridColumn field="RMFreightCost" headerName="Freight" cellRenderer={hyphenFormatter}></AgGridColumn>}
                                                            {ModeId == 1 && <AgGridColumn field="RMShearingCost" headerName="Shearing" cellRenderer={hyphenFormatter} ></AgGridColumn>}
                                                            {<AgGridColumn field="NetLandedCost" headerName="Landed (Total)"></AgGridColumn>}

                                                            {(ModeId == 1 || ModeId == 2) && importEntry && <AgGridColumn field="NetLandedCostCurrency" headerName="Landed Total (Currency)"></AgGridColumn>}

                                                            {<AgGridColumn field="UnitOfMeasurement" headerName="UOM"></AgGridColumn>}
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
                            </form>
                        </div >
                    </Container >
                </Drawer >
            </>}


        </div >
    );
}

export default AnalyticsDrawer;