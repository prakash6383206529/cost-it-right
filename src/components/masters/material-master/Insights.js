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
import { CONSTANT } from '../../../helper/AllConastant';
import { Costmovementgraph } from '../../dashboard/CostMovementGraph';

function Insights (props){
    const { register, handleSubmit, control, setValue, formState: { errors }, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [showListing,setShowListing] = useState(false);

    const [techSelected,setTechSelected] = useState(false);
    const [materialSelected,setMaterialSelected] = useState(false);
    const [gradeSelected,setGradeSelected] = useState(false);

    const [dynamicGrpahData,setDynamicGrpahData] = useState()

    const gridOptions = {};

    // const [technology, setTechnology] = useState({})
    const dispatch = useDispatch()

    useEffect( () => {
        dispatch(getCostingTechnologySelectList(() => { }))
        dispatch(getGradeSelectList(()=>{}))
        dispatch(getRawMaterialFilterSelectList(()=>{}))
    },[]);

    const technologySelectList = useSelector(state => state.costing.technologySelectList)
    const gradeSelectList = useSelector(state => state.material.gradeSelectList)
    const filterRMSelectList = useSelector(state=> state.material.filterRMSelectList.RawMaterials)
    // console.log(filterRMSelectList,'this is material')

    
    const handleTechnologyChange = (value) => {
        // setTechnology(value)
        if (value && value !== '') {
            setTechSelected(true)
        }
        else{
            setTechSelected(false)
        }
    }

    const handleMaterialChange = (value) => {
        // setTechnology(value)
        if (value && value !== '') {
            setMaterialSelected(true)
        }
        else{
            setMaterialSelected(false)
        }
    }

    const handleGradeChange = (value) => {
        // setTechnology(value)
        if (value && value !== '') {
            setGradeSelected(true)
        }
        else{
            setGradeSelected(false)
        }
    }

    const submitDropdown = () => {
        if(techSelected && materialSelected && gradeSelected){
            setShowListing(true)
            setDynamicGrpahData(rowData[0].graphData)
        }
        else{
            setShowListing(false)
        }
    }

    const rowData = [
        { Specification: 'OP1', Minimum: '100', Maximum: '200', Average: '150',Plant1: '15', Plant2: '22', Plant3: '18',Plant4: '24', Plant5: '8', Plant6: '27',Plant7: '15', Plant8: '38',
            graphData: [2, 4, 5, 3, 5, 4, 8, 10,12, 7, 4, 3, 5, 2, 4, 6,2, 4, 1, 3, 5, 2, 6, 4,2, 4, 3, 2, 5, 2, 6, 4]
        },
        {
             Specification: 'OP2', Minimum: '50', Maximum: '100', Average: '150',Plant1: '15', Plant2: '22', Plant3: '18',Plant4: '24', Plant5: '8', Plant6: '27',Plant7: '15', Plant8: '38',
             graphData: [12, 44, 45, 30, 5, 4, 8, 10,12, 70, 40, 30, 5, 2, 4, 6,2, 14, 12, 3, 5, 2, 26, 4,2, 24, 30, 2, 5, 2, 26, 44]
        },
        {
             Specification: 'OP3', Minimum: '60', Maximum: '100', Average: '150',Plant1: '15', Plant2: '22', Plant3: '18',Plant4: '24', Plant5: '8', Plant6: '27',Plant7: '15', Plant8: '38',
             graphData: [22, 42, 52, 3, 5, 4, 8, 50,12, 7, 4, 3, 52, 2, 14, 6,2, 4, 1, 3, 5, 2, 6, 14,2, 4, 3, 12, 5, 42, 6, 44]
        },
        {
             Specification: 'OP4', Minimum: '100', Maximum: '120', Average: '150',Plant1: '15', Plant2: '22', Plant3: '18',Plant4: '24', Plant5: '8', Plant6: '27',Plant7: '15', Plant8: '38',
             graphData: [2, 4, 5, 3, 5, 4, 8, 10,12, 7, 4, 3, 5, 2, 4, 6,2, 4, 1, 3, 5, 2, 6, 4,2, 4, 3, 2, 5, 2, 6, 4]
        },
        {
             Specification: 'OP5', Minimum: '100', Maximum: '120', Average: '150',Plant1: '15', Plant2: '22', Plant3: '18',Plant4: '24', Plant5: '8', Plant6: '27',Plant7: '15', Plant8: '38',
             graphData: [12, 44, 45, 30, 5, 4, 8, 10,12, 70, 40, 30, 5, 2, 4, 6,2, 14, 12, 3, 5, 2, 26, 4,2, 24, 30, 2, 5, 2, 26, 44]
        },
        {
             Specification: 'OP6', Minimum: '20', Maximum: '200', Average: '150',Plant1: '15', Plant2: '22', Plant3: '18',Plant4: '24', Plant5: '8', Plant6: '27',Plant7: '15', Plant8: '38',
             graphData: [22, 42, 52, 3, 5, 4, 8, 50,12, 7, 4, 3, 52, 2, 14, 6,2, 4, 1, 3, 5, 2, 6, 14,2, 4, 3, 12, 5, 42, 6, 44]
        },
        {
             Specification: 'OP7', Minimum: '100', Maximum: '110', Average: '150',Plant1: '15', Plant2: '22', Plant3: '18',Plant4: '24', Plant5: '8', Plant6: '27',Plant7: '15', Plant8: '38',
             graphData: [2, 4, 5, 3, 5, 4, 8, 10,12, 7, 4, 3, 5, 2, 4, 6,2, 4, 1, 3, 5, 2, 6, 4,2, 4, 3, 2, 5, 2, 6, 4]
        },
        {
             Specification: 'OP8', Minimum: '50', Maximum: '100', Average: '150',Plant1: '15', Plant2: '22', Plant3: '18',Plant4: '24', Plant5: '8', Plant6: '27',Plant7: '15', Plant8: '38',
             graphData: [12, 44, 45, 30, 5, 4, 8, 10,12, 70, 40, 30, 5, 2, 4, 6,2, 14, 12, 3, 5, 2, 26, 4,2, 24, 30, 2, 5, 2, 26, 44]
        },
        {
             Specification: 'OP9', Minimum: '10', Maximum: '60', Average: '150',Plant1: '15', Plant2: '22', Plant3: '18',Plant4: '24', Plant5: '8', Plant6: '27',Plant7: '15', Plant8: '38',
             graphData: [22, 42, 52, 3, 5, 4, 8, 50,12, 7, 4, 3, 52, 2, 14, 6,2, 4, 1, 3, 5, 2, 6, 14,2, 4, 3, 12, 5, 42, 6, 44]
        },
        {
             Specification: 'OP10', Minimum: '60', Maximum: '80', Average: '150',Plant1: '15', Plant2: '22', Plant3: '18',Plant4: '24', Plant5: '8', Plant6: '27',Plant7: '15', Plant8: '38',
             graphData: [2, 4, 5, 3, 5, 4, 8, 10,12, 7, 4, 3, 5, 2, 4, 6,2, 4, 1, 3, 5, 2, 6, 4,2, 4, 3, 2, 5, 2, 6, 4]
        },
        {
             Specification: 'OP11', Minimum: '100', Maximum: '150', Average: '150',Plant1: '15', Plant2: '22', Plant3: '18',Plant4: '24', Plant5: '8', Plant6: '27',Plant7: '15', Plant8: '38',
             graphData: [12, 44, 45, 30, 5, 4, 8, 10,12, 70, 40, 30, 5, 2, 4, 6,2, 14, 12, 3, 5, 2, 26, 4,2, 24, 30, 2, 5, 2, 26, 44]
        },
        {
             Specification: 'OP12', Minimum: '40', Maximum: '100', Average: '150',Plant1: '15', Plant2: '22', Plant3: '18',Plant4: '24', Plant5: '8', Plant6: '27',Plant7: '15', Plant8: '38',
             graphData: [22, 42, 52, 3, 5, 4, 8, 50,12, 7, 4, 3, 52, 2, 14, 6,2, 4, 1, 3, 5, 2, 6, 14,2, 4, 3, 12, 5, 42, 6, 44]
        },
    ];

    const onSelectionChanged = (event) => {
        var rowCount = event.api.getSelectedRows();
        var graphDataNew = rowCount[0].graphData;
        setDynamicGrpahData(graphDataNew)
        // console.log(dynamicGrpahData)
    }

    const renderListing = (label) => {
        let temp = []
        if ( label && label !== ''){
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
        else{
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

    const color1 = "#73b0f4";
    const data1 = {
        labels: ['2010', '2011', '2012', '2013', '2014', '2015','2016', '2017', '2018', '2019', '2020', '2021','2022', '2023', '2024', '2025', '2026', '2027','2028', '2029', '2030', '2031', '2032', '2033'],
        datasets: [
          {
            label: 'Insights',
            data: dynamicGrpahData,
            fill: false,
            borderColor: color1,
            backgroundColor:color1,
          },
        ],
    };
    

    return(
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
                                <div className="flex-fills label">Raw Material:</div>
                                <div className="hide-label flex-fills pl-0">
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
                                <div className="hide-label flex-fills pl-0">
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
                            <Costmovementgraph graphData={data1} graphHeight={60}/>
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