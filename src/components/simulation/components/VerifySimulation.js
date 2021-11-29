import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form'
import { Row, Col, } from 'reactstrap';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NoContentFound from '../../common/NoContentFound';
import { EMPTY_DATA, EXCHNAGERATE, OPERATIONS, RMDOMESTIC, RMIMPORT, SURFACETREATMENT, BOPDOMESTIC, BOPIMPORT, MACHINERATE } from '../../../config/constants';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs'
import { getVerifyBoughtOutPartSimulationList, getVerifyMachineRateSimulationList, getVerifySimulationList, getVerifySurfaceTreatmentSimulationList } from '../actions/Simulation';
import RunSimulationDrawer from './RunSimulationDrawer';
import CostingSimulation from './CostingSimulation';
import { checkForDecimalAndNull, getConfigurationKey, loggedInUserId } from '../../../helper';
import Toaster from '../../common/Toaster';
import { getPlantSelectListByType } from '../../../actions/Common';
import { ZBC } from '../../../config/constants';
import { getRawMaterialNameChild } from '../../masters/actions/Material';
import LoaderCustom from '../../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { debounce } from 'lodash'
// import AssemblySimulation from './AssemblySimulation';

const gridOptions = {};

function VerifySimulation(props) {
    const { cancelVerifyPage } = props
    const [shown, setshown] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState([]);

    const [selectedIds, setSelectedIds] = useState('')
    const [tokenNo, setTokenNo] = useState('')
    const [simulationId, setSimualtionId] = useState('')
    const [simulationTechnologyId, setSimulationTechnologyId] = useState('')
    const [vendorId, setVendorId] = useState('')
    const [hideRunButton, setHideRunButton] = useState(false)
    const [simulationDrawer, setSimulationDrawer] = useState(false)
    const [costingPage, setSimulationCostingPage] = useState(false)
    const [material, setMaterial] = useState([])
    const [objs, setObj] = useState({})
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [rowData, setRowData] = useState(null);
    // const [showAssemblyPage, setShowAssemblyPage] = useState(false);   // REJECTED ASSEMBLY
    const { filteredRMData } = useSelector(state => state.material)
    const { selectedMasterForSimulation } = useSelector(state => state.simulation)
    const isSurfaceTreatmentOrOperation = ((Number(selectedMasterForSimulation.value) === Number(SURFACETREATMENT)) || (Number(selectedMasterForSimulation.value) === Number(OPERATIONS)));
    const isRMDomesticOrRMImport = ((Number(selectedMasterForSimulation.value) === Number(RMDOMESTIC)) || (Number(selectedMasterForSimulation.value) === Number(RMIMPORT)));
    const isExchangeRate = Number(selectedMasterForSimulation.value) === (Number(EXCHNAGERATE));
    const isBOPDomesticOrImport = ((Number(selectedMasterForSimulation.value) === Number(BOPDOMESTIC)) || (Number(selectedMasterForSimulation.value) === Number(BOPIMPORT)))
    const isMachineRate = Number(selectedMasterForSimulation.value) === (Number(MACHINERATE));

    // const isAssemblyCosting = true
    const dispatch = useDispatch()

    useEffect(() => {
        verifyCostingList()
        dispatch(getPlantSelectListByType(ZBC, () => { }))
        dispatch(getRawMaterialNameChild(() => { }))
    }, [])

    const verifyCostingList = (plantId = '', rawMatrialId = '') => {
        const plant = filteredRMData.plantId && filteredRMData.plantId.value ? filteredRMData.plantId.value : null
     
        switch (Number(selectedMasterForSimulation.value)) {
            case Number(RMDOMESTIC):
                dispatch(getVerifySimulationList(props.token, plant, rawMatrialId, (res) => {
                    if (res.data.Result) {
                        const data = res.data.Data
                        if (data.SimulationImpactedCostings.length === 0) {
                            Toaster.warning('No approved costing exist for this raw material.')
                            setHideRunButton(true)
                            return false
                        }
                        setTokenNo(data.TokenNumber)
                        setSimualtionId(data.SimulationId)
                        setHideRunButton(false)
                        setSimulationTechnologyId(data.SimulationtechnologyId)
                        setVendorId(data.VendorId)

                    }
                }))
                break;
            case Number(RMIMPORT):
                dispatch(getVerifySimulationList(props.token, plant, rawMatrialId, (res) => {
                    if (res.data.Result) {
                        const data = res.data.Data
                        if (data.SimulationImpactedCostings.length === 0) {
                            Toaster.warning('No approved costing exist for this raw material.')
                            setHideRunButton(true)
                            return false
                        }
                        setTokenNo(data.TokenNumber)
                        setSimualtionId(data.SimulationId)
                        setHideRunButton(false)
                        setSimulationTechnologyId(data.SimulationtechnologyId)
                        setVendorId(data.VendorId)

                    }
                }))
                break;
            case Number(SURFACETREATMENT):

                dispatch(getVerifySurfaceTreatmentSimulationList(props.token, (res) => {
                    if (res.data.Result) {
                        const data = res.data.Data
                        if (data.SimulationCombinedProcessImpactedCostings.length === 0) {           //   for condition
                            Toaster.warning('No approved costing exist for this exchange rate.')
                            setHideRunButton(true)
                            return false
                        }
                        setTokenNo(data.TokenNumber)
                        setSimualtionId(data.SimulationId)
                        // setMasterId(data.SimulationtechnologyId)
                        // setVerifyList(data.SimulationCombinedProcessImpactedCostings)
                        setHideRunButton(false)
                    }
                }))
                break;
            case Number(OPERATIONS):

                dispatch(getVerifySurfaceTreatmentSimulationList(props.token, (res) => {
                    if (res.data.Result) {
                        const data = res.data.Data
                        if (data.SimulationCombinedProcessImpactedCostings.length === 0) {           //   for condition
                            Toaster.warning('No approved costing exist for this exchange rate.')
                            setHideRunButton(true)
                            return false
                        }
                        setTokenNo(data.TokenNumber)
                        setSimualtionId(data.SimulationId)
                        // setMasterId(data.SimulationtechnologyId)
                        // setVerifyList(data.SimulationCombinedProcessImpactedCostings)
                        setHideRunButton(false)
                    }
                }))
                break;
            case Number(MACHINERATE):

                dispatch(getVerifyMachineRateSimulationList(props.token, (res) => {
                    if (res.data.Result) {
                        const data = res.data.Data
                        if (data.SimulationCombinedProcessImpactedCostings.length === 0) {           //   for condition
                            Toaster.warning('No approved costing exist for this machine rate.')
                            setHideRunButton(true)
                            return false
                        }
                        setTokenNo(data.TokenNumber)
                        setSimualtionId(data.SimulationId)
                        // setMasterId(data.SimulationtechnologyId)
                        // setVerifyList(data.SimulationCombinedProcessImpactedCostings)
                        setHideRunButton(false)
                    }
                }))
                break;
            case Number(BOPDOMESTIC):

                dispatch(getVerifyBoughtOutPartSimulationList(props.token, (res) => {
                    if (res.data.Result) {
                        const data = res.data.Data
                        if (data.SimulationCombinedProcessImpactedCostings.length === 0) {           //   for condition
                            Toaster.warning('No approved costing exist for this bought out part.')
                            setHideRunButton(true)
                            return false
                        }
                        setTokenNo(data.TokenNumber)
                        setSimualtionId(data.SimulationId)
                        // setMasterId(data.SimulationtechnologyId)
                        // setVerifyList(data.SimulationCombinedProcessImpactedCostings)
                        setHideRunButton(false)
                    }
                }))
                break;
            case Number(BOPIMPORT):

                dispatch(getVerifyBoughtOutPartSimulationList(props.token, (res) => {
                    if (res.data.Result) {
                        const data = res.data.Data
                        if (data.SimulationCombinedProcessImpactedCostings.length === 0) {           //   for condition
                            Toaster.warning('No approved costing exist for this bought out part.')
                            setHideRunButton(true)
                            return false
                        }
                        setTokenNo(data.TokenNumber)
                        setSimualtionId(data.SimulationId)
                        // setMasterId(data.SimulationtechnologyId)
                        // setVerifyList(data.SimulationCombinedProcessImpactedCostings)
                        setHideRunButton(false)
                    }
                }))
                break;
            default:
                break;
        }
     



           
    
    }


    const verifyList = useSelector(state => state.simulation.simulationVerifyList)

    const buttonFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <button className="View" type={'button'} onClick={() => { }} />
            </>
        )
    }
    const newBRFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewBasicRate > row.OldBasicRate) ? 'red-value form-control' : (row.NewBasicRate < row.OldBasicRate) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newSRFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewScrapRate > row.OldScrapRate) ? 'red-value form-control' : (row.NewScrapRate < row.OldScrapRate) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const descriptionFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cell != null && cell.length !== 0) ? cell : '-'
    }

    const ecnFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cell != null && cell.length !== 0) ? cell : '-'
    }

    const revisionFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cell != null && cell.length !== 0) ? cell : '-'
    }

    const renderPlant = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cell !== null && cell !== '-') ? `${cell}` : '-'

    }

    const renderVendor = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (cell !== null && cell !== '-') ? `${cell}(${row.VendorCode})` : '-'
    }

    const renderRM = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return `${cell}-${row.RMGrade ? row.RMGrade : '-'}`
    }


    const onRowSelect = () => {

        var selectedRows = gridApi.getSelectedRows();
        if (JSON.stringify(selectedRows) === JSON.stringify(selectedIds)) return false
        var selected = gridApi.getSelectedNodes()
        setSelectedRowData(selectedRows)
        console.log(selectedRows, 'ROW')

    }

    const onRowSelected = (e) => {
        let row = e.node.isSelected()
        setGridSelection(row, e.node)
    }

    const setGridSelection = (type, clickedElement) => {
        var selectedRows = gridApi.getSelectedRows();
        const rowIndex = clickedElement.rowIndex
        const costingNumber = clickedElement.data.CostingNumber
        gridApi.forEachNode(node => {
            if (node.rowIndex !== rowIndex) {
                if (node.data.CostingNumber === costingNumber) {
                    node.setSelected(type);

                }
            }
        });
        setSelectedRowData(selectedRows)
    }

    const runSimulation = debounce(() => {
        // if (selectedRowData.length === 0) {
        //     Toaster.warning('Please select atleast one costing.')
        //     return false
        // }

        let obj = {};
        obj.SimulationId = simulationId
        obj.LoggedInUserId = loggedInUserId()
        let tempArr = []

        selectedRowData && selectedRowData.map(item => {
            let tempObj = {}
            tempObj.RawMaterialId = item.RawMaterialId
            tempObj.CostingId = item.CostingId
            tempArr.push(tempObj)
            return null;
        })

        obj.RunSimualtionCostingInfo = tempArr
        setObj(obj)
        setSimulationDrawer(true)

    }, 500)
    const assemblySimulation = debounce(() => {
        if (selectedRowData.length === 0) {
            Toaster.warning('Please select atleast one costing.')
            return false
        }
        // setShowAssemblyPage(true)   // REJECTED ASSEMBLY

    }, 500)
    const closeDrawer = (e = '', mode) => {
        if (mode === true) {
            setSimulationDrawer(false)
            setSimulationCostingPage(true)
        } else {
            setSimulationDrawer(false)
        }
    }

    const cancelAssemblyPage = () => {
        // setShowAssemblyPage(false)   // REJECTED ASSEMBLY
    }

    const isFirstColumn = (params) => {
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;

        return thisIsFirstColumn;
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
        headerCheckboxSelection: isFirstColumn,
        checkboxSelection: isFirstColumn
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);

    };

    const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const resetState = () => {
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);

    }

    const frameworkComponents = {
        descriptionFormatter: descriptionFormatter,
        ecnFormatter: ecnFormatter,
        revisionFormatter: revisionFormatter,
        renderVendor: renderVendor,
        renderPlant: renderPlant,
        renderRM: renderRM,
        buttonFormatter: buttonFormatter,
        newBRFormatter: newBRFormatter,
        newSRFormatter: newSRFormatter,
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
    };

    return (
        <>
            {
                // (!costingPage && !showAssemblyPage) &&   // REJECTED ASSEMBLY
                !costingPage &&
                <>
                    <Row>
                        <Col sm="12">
                            <h1 class="mb-0">Token No:{tokenNo}</h1>
                        </Col>
                    </Row>
                    <Row className="filter-row-large pt-4 blue-before">

                        <Col md="2" lg="2" className="search-user-block mb-3">
                            <div className="d-flex justify-content-end bd-highlight w100">
                                <div>

                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Col>
                                <div className={`ag-grid-react`}>
                                    <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                                        <div className="ag-grid-header">
                                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                                            <button type="button" className="user-btn float-right" title="Reset Grid" onClick={() => resetState()}>
                                                <div className="refresh mr-0"></div>
                                            </button>
                                        </div>
                                        <div
                                            className="ag-theme-material"
                                            style={{ height: '100%', width: '100%' }}
                                        >
                                            <AgGridReact
                                                // style={{ height: '100%', width: '100%' }}
                                                defaultColDef={defaultColDef}
                                                floatingFilter={true}
                                                domLayout='autoHeight'
                                                // columnDefs={c}
                                                rowData={[]}
                                                pagination={true}
                                                paginationPageSize={10}
                                                onGridReady={onGridReady}
                                                gridOptions={gridOptions}
                                                loadingOverlayComponent={'customLoadingOverlay'}
                                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                                noRowsOverlayComponentParams={{
                                                    title: EMPTY_DATA,
                                                }}
                                                frameworkComponents={frameworkComponents}
                                                // suppressRowClickSelection={true}
                                                rowSelection={'multiple'}
                                                onRowSelected={onRowSelected}
                                                // frameworkComponents={frameworkComponents}
                                                onSelectionChanged={onRowSelect}

                                            >
                                                <AgGridColumn field="CostingId" hide ></AgGridColumn>
                                                <AgGridColumn width={185} field="CostingNumber" headerName="Costing Number"></AgGridColumn>
                                                <AgGridColumn width={140} field="VendorName" cellRenderer='renderVendor' headerName="Vendor Name"></AgGridColumn>
                                                <AgGridColumn width={120} field="PlantName" cellRenderer='renderPlant' headerName="Plant Code"></AgGridColumn>
                                                <AgGridColumn width={110} field="PartNo" headerName="Part No."></AgGridColumn>
                                                <AgGridColumn width={120} field="PartName" cellRenderer='descriptionFormatter' headerName="Part Name"></AgGridColumn>
                                                <AgGridColumn width={130} field="RevisionNumber" cellRenderer='revisionFormatter' headerName="Revision No."></AgGridColumn>
                                                <AgGridColumn width={130} field="POPrice" headerName="Current PO Price"></AgGridColumn>

                                                {isSurfaceTreatmentOrOperation === true &&
                                                    <>
                                                        <AgGridColumn width={185} field="OperationName" headerName="Operation Name"></AgGridColumn>
                                                        <AgGridColumn width={185} field="OperationCode" headerName="Operation Code"></AgGridColumn>
                                                        <AgGridColumn width={185} field="NewRate" headerName="New Rate"></AgGridColumn>
                                                        <AgGridColumn width={185} field="OldRate" headerName="Old Rate"></AgGridColumn>
                                                    </>
                                                }

                                                {isBOPDomesticOrImport === true &&
                                                    <>
                                                        <AgGridColumn width={130} field="BoughtOutPartNumber" headerName="BOP Number"></AgGridColumn>
                                                        <AgGridColumn width={130} field="BoughtOutPartName" headerName="BOP Name"></AgGridColumn>
                                                        <AgGridColumn width={145} field="OldBasicRate" headerName="Old Basic Rate"></AgGridColumn>
                                                        <AgGridColumn width={150} field="NewBasicRate" cellRenderer='newBRFormatter' headerName="New Basic Rate"></AgGridColumn>
                                                    </>
                                                }

                                                {isBOPDomesticOrImport === true &&
                                                    <>
                                                        <AgGridColumn width={130} field="BoughtOutPartNumber" headerName="BOP Number"></AgGridColumn>
                                                        <AgGridColumn width={130} field="BoughtOutPartName" headerName="BOP Name"></AgGridColumn>
                                                        <AgGridColumn width={145} field="OldBasicRate" headerName="Old Basic Rate"></AgGridColumn>
                                                        <AgGridColumn width={150} field="NewBasicRate" cellRenderer='newBRFormatter' headerName="New Basic Rate"></AgGridColumn>
                                                    </>
                                                }
                                                {isMachineRate &&
                                                    <>
                                                        <AgGridColumn width={145} field="ProcessName" headerName="Process Name"></AgGridColumn>
                                                        <AgGridColumn width={150} field="MachineNumber" headerName="Machine Number"></AgGridColumn>
                                                        <AgGridColumn width={145} field="OldMachineRate" headerName="Old Machine Rate"></AgGridColumn>
                                                        <AgGridColumn width={150} field="NewMachineRate" headerName="New Machine Rate"></AgGridColumn>
                                                    </>
                                                }
                                                {isRMDomesticOrRMImport === true &&
                                                    <>
                                                        <AgGridColumn width={120} field="RMName" headerName="RM Name" ></AgGridColumn>
                                                        <AgGridColumn width={120} field="RMGrade" headerName="RM Grade" ></AgGridColumn>
                                                        <AgGridColumn width={145} field="OldBasicRate" headerName="Old Basic Rate"></AgGridColumn>
                                                        <AgGridColumn width={150} field="NewBasicRate" cellRenderer='newBRFormatter' headerName="New Basic Rate"></AgGridColumn>
                                                        <AgGridColumn width={145} field="OldScrapRate" headerName="Old Scrap Rate"></AgGridColumn>
                                                        <AgGridColumn width={150} field="NewScrapRate" cellRenderer='newSRFormatter' headerName="New Scrap Rate" ></AgGridColumn>
                                                        <AgGridColumn field="RawMaterialId" hide ></AgGridColumn>
                                                    </>
                                                }


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


                        </Col>
                    </Row>
                    <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                        <div className="col-sm-12 text-right bluefooter-butn">
                            <button type={"button"} className="mr15 cancel-btn" onClick={cancelVerifyPage}>
                                <div className={"cancel-icon"}></div>
                                {"CANCEL"}
                            </button>
                            {/* {!isAssemblyCosting && */}
                            <button onClick={runSimulation} type="submit" disabled={hideRunButton} className="user-btn mr5 save-btn"                    >
                                <div className={"Run-icon"}>
                                </div>{" "}
                                {"RUN SIMULATION"}
                            </button>
                            {/* } */}
                            {/* {isAssemblyCosting &&    // REJECTED ASSEMBLY
                                <button onClick={assemblySimulation} type="submit" disabled={hideRunButton} className="user-btn mr5 save-btn"                    >
                                    <div className={"Run-icon"}>
                                    </div>{" "}
                                    {"assembly SIMULATION"}
                                </button>
                            } */}
                        </div>
                    </Row>
                </>
            }
            {
                costingPage &&
                <CostingSimulation simulationId={simulationId} />
            }
            {
                simulationDrawer &&
                <RunSimulationDrawer
                    tokenNo={tokenNo}
                    masterId={simulationTechnologyId}
                    vendorId={vendorId}
                    isOpen={simulationDrawer}
                    closeDrawer={closeDrawer}
                    objs={objs}
                    anchor={"right"}
                />
            }
            {/* {   // REJECTED ASSEMBLY
                showAssemblyPage &&

                <AssemblySimulation selectedRowDataFromVerify={selectedRowData} isSurfaceTreatment={false} token={tokenNo} cancelAssemblyPage={cancelAssemblyPage} />

            } */}
        </>
    );
}


export default VerifySimulation;