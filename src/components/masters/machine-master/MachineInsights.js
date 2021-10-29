import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Col, Row } from 'reactstrap';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import { getCostingTechnologySelectList } from '../../costing/actions/Costing';
import { useDispatch, useSelector } from 'react-redux';
import { getGradeSelectList, getRawMaterialFilterSelectList } from '../actions/Material';
import { AgGridReact } from 'ag-grid-react/lib/agGridReact';
import LoaderCustom from '../../common/LoaderCustom';
import { AgGridColumn } from 'ag-grid-react/lib/agGridColumn';
import NoContentFound from '../../common/NoContentFound';
import { CONSTANT } from '../../../config/constants';
import { Costmovementgraph } from '../../dashboard/CostMovementGraph';
import { graphColor1, graphColor2, graphColor3, graphColor4, graphColor6, options5 } from '../../dashboard/ChartsDashboard';
import { getProcessesSelectList } from '../actions/MachineMaster';

function Insights(props) {
    const { register, handleSubmit, control, setValue, formState: { errors }, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [showListing, setShowListing] = useState(false);

    const [techSelected, setTechSelected] = useState(false);
    const [processSelected, setProcessSelected] = useState(false);

    const [dynamicGrpahData, setDynamicGrpahData] = useState()
    const [averageGrpahData, setAverageGrpahData] = useState()
    const [minimumGrpahData, setMinimumGrpahData] = useState()
    const [maximumGrpahData, setMaximumGrpahData] = useState()

    const gridOptions = {};

    // const [technology, setTechnology] = useState({})
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getCostingTechnologySelectList(() => { }))
        dispatch(getProcessesSelectList(() => { }))
    }, []);

    const technologySelectList = useSelector(state => state.costing.technologySelectList)
    const processSelectList = useSelector(state => state.machine.processSelectList)
    console.log(processSelectList, 'this is material')


    const handleTechnologyChange = (value) => {
        // setTechnology(value)
        if (value && value !== '') {
            setTechSelected(true)
        }
        else {
            setTechSelected(false)
        }
    }

    const handleGradeChange = (value) => {
        // setTechnology(value)
        if (value && value !== '') {
            setProcessSelected(true)
        }
        else {
            setProcessSelected(false)
        }
    }

    const submitDropdown = () => {
        if (techSelected && processSelected) {
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
        var rowCount = event.api.getSelectedRows();
        var graphDataNew = rowCount[0].graphData;
        var avgGraphData = rowCount[0].averageData;
        var minGraphData = rowCount[0].minimumData;
        var maxGraphData = rowCount[0].maximumData;
        setDynamicGrpahData(graphDataNew);
        setAverageGrpahData(avgGraphData);
        setMinimumGrpahData(minGraphData);
        setMaximumGrpahData(maxGraphData);
        // console.log(rowData);
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
            if (label === 'Process') {
                processSelectList && processSelectList.map(item => {
                    if (item.Value === '0') return false;
                    temp.push({ label: item.Text, value: item.Value })
                    return null;
                });
                return temp;
            }
        }
        else {
            // console.log('genrated');
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

        window.screen.width >= 1921 && params.api.sizeColumnsToFit()

    };

    const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
    };

    const frameworkComponents = {
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
    }

    const data1 = {
        labels: ['vendor1-plant1', 'vendor1-plant2', 'vendor2-plant3', 'vendor2-plant4', 'vendor2-plant5', 'vendor3-plant6', 'vendor3-plant7', 'vendor3-plant8'],
        datasets: [
            {
                type: 'line',
                label: 'Average',
                borderColor: graphColor1,
                fill: false,
                tension: 0.1,
                borderDash: [5, 5],
                data: averageGrpahData,
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
                    <Row className="pt-4">
                        <Col md="12" className="filter-block">
                            <div className="d-inline-flex justify-content-start align-items-center mr-3">
                                <div className="flex-fills label">Technology:</div>
                                <div className="hide-label flex-fills pl-0">
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
                                <div className="flex-fills label">Process Name:</div>
                                <div className="hide-label flex-fills pl-0">
                                    <SearchableSelectHookForm
                                        label={''}
                                        name={'Process'}
                                        placeholder={'Process'}
                                        Controller={Controller}
                                        control={control}
                                        rules={{ required: false }}
                                        register={register}
                                        // defaultValue={technology.length !== 0 ? technology : ''}
                                        options={renderListing('Process')}
                                        mandatory={false}
                                        handleChange={handleGradeChange}
                                        errors={errors.Masters}
                                        customClassName="mb-0"
                                    />
                                </div>
                            </div>{/* d-inline-flex */}
                            <button title="Run" type="button" class="user-btn" onClick={submitDropdown}><div class="save-icon mr-0"></div></button>
                        </Col>
                    </Row>

                    {showListing && <>
                        <Row>
                            <Col md="12">
                                <div className={`ag-grid-react`}>
                                    <div className="ag-grid-wrapper rminsights_table" style={{ width: '100%', height: '100%' }}>
                                        <div className="ag-theme-material">
                                            <AgGridReact
                                                style={{ height: '100%', width: '100%' }}
                                                defaultColDef={defaultColDef}
                                                domLayout='autoHeight'
                                                rowData={rowData}
                                                rowSelection={'single'}
                                                onSelectionChanged={onSelectionChanged}
                                                pagination={true}
                                                paginationPageSize={10}
                                                onGridReady={onGridReady}
                                                gridOptions={gridOptions}
                                                // enableCellTextSelection={true}
                                                loadingOverlayComponent={'customLoadingOverlay'}
                                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                                noRowsOverlayComponentParams={{
                                                    title: CONSTANT.EMPTY_DATA,
                                                }}
                                                frameworkComponents={frameworkComponents}
                                            >
                                                <AgGridColumn pinned="left" width="140" field="Specification" />
                                                <AgGridColumn pinned="left" width="115" field="Minimum" />
                                                <AgGridColumn pinned="left" width="115" field="Maximum" />
                                                <AgGridColumn pinned="left" width="115" field="Average" />
                                                <AgGridColumn headerName="Vendor1" headerClass="justify-content-center" marryChildren={true}>
                                                    <AgGridColumn width="150" field="Plant1" headerName="Plant 1" />
                                                    <AgGridColumn width="150" field="Plant2" headerName="Plant 2" />
                                                </AgGridColumn>
                                                <AgGridColumn headerName="Vendor2" headerClass="justify-content-center" marryChildren={true}>
                                                    <AgGridColumn width="150" field="Plant3" headerName="Plant 3" />
                                                    <AgGridColumn width="150" field="Plant4" headerName="Plant 4" />
                                                    <AgGridColumn width="150" field="Plant5" headerName="Plant 5" />
                                                </AgGridColumn>
                                                <AgGridColumn headerName="Vendor3" headerClass="justify-content-center" marryChildren={true}>
                                                    <AgGridColumn width="150" field="Plant6" headerName="Plant 6" />
                                                    <AgGridColumn width="150" field="Plant7" headerName="Plant 7" />
                                                    <AgGridColumn width="150" field="Plant8" headerName="Plant 8" />
                                                </AgGridColumn>
                                            </AgGridReact>
                                            <div className="paging-container d-inline-block float-right">
                                                <select className="form-control paging-dropdown" onChange={(e) => onPageSizeChanged(e.target.value)} id="page-size">
                                                    <option value="10" selected={true}>10</option>
                                                    <option value="50">50</option>
                                                    <option value="100">100</option>
                                                </select>
                                            </div>
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