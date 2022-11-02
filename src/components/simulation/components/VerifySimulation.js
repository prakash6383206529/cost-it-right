import React, { useState, useRef } from 'react';
import { Row, Col, } from 'reactstrap';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NoContentFound from '../../common/NoContentFound';
import { EMPTY_DATA, EXCHNAGERATE, OPERATIONS, RMDOMESTIC, RMIMPORT, SURFACETREATMENT, BOPDOMESTIC, BOPIMPORT, MACHINERATE, OVERHEAD, defaultPageSize, COMBINED_PROCESS, } from '../../../config/constants';
import { getAllMultiTechnologyCostings, getAllMultiTechnologyImpactedSimulationCostings, getVerifyBoughtOutPartSimulationList, getverifyCombinedProcessSimulationList, getVerifyExchangeSimulationList, getVerifyMachineRateSimulationList, getVerifySimulationList, getVerifySurfaceTreatmentSimulationList } from '../actions/Simulation';
import RunSimulationDrawer from './RunSimulationDrawer';
import CostingSimulation from './CostingSimulation';
import { checkForDecimalAndNull, getConfigurationKey, loggedInUserId } from '../../../helper';
import Toaster from '../../common/Toaster';
import LoaderCustom from '../../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { debounce } from 'lodash'
import { PaginationWrapper } from '../../common/commonPagination';
import { IdForMultiTechnology } from '../../../config/masterData';
// import AssemblySimulation from './AssemblySimulation';

const gridOptions = {};

function VerifySimulation(props) {
    const { cancelVerifyPage, token, assemblyTechnology, isCombinedProcess } = props
    const [selectedRowData, setSelectedRowData] = useState([]);
    const [effectiveDate, setEffectiveDate] = useState('')
    const [selectedIds, setSelectedIds] = useState('')
    const [tokenNo, setTokenNo] = useState('')
    const [simulationId, setSimualtionId] = useState('')
    const [simulationTechnologyId, setSimulationTechnologyId] = useState('')
    const [vendorId, setVendorId] = useState('')
    const [hideRunButton, setHideRunButton] = useState(false)
    const [simulationDrawer, setSimulationDrawer] = useState(false)
    const [costingPage, setSimulationCostingPage] = useState(false)
    const [objs, setObj] = useState({})
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    // const [showAssemblyPage, setShowAssemblyPage] = useState(false);   // REJECTED ASSEMBLY
    const { filteredRMData } = useSelector(state => state.material)
    const { selectedMasterForSimulation } = useSelector(state => state.simulation)
    const isSurfaceTreatmentOrOperation = ((Number(selectedMasterForSimulation.value) === Number(SURFACETREATMENT)) || (Number(selectedMasterForSimulation.value) === Number(OPERATIONS)));
    const isRMDomesticOrRMImport = ((Number(selectedMasterForSimulation.value) === Number(RMDOMESTIC)) || (Number(selectedMasterForSimulation.value) === Number(RMIMPORT)));
    const isExchangeRate = Number(selectedMasterForSimulation.value) === (Number(EXCHNAGERATE));
    const isBOPDomesticOrImport = ((Number(selectedMasterForSimulation.value) === Number(BOPDOMESTIC)) || (Number(selectedMasterForSimulation.value) === Number(BOPIMPORT)))
    const isMachineRate = Number(selectedMasterForSimulation.value) === (Number(MACHINERATE));
    const isOverHeadProfit = Number(selectedMasterForSimulation.value) === (Number(OVERHEAD));
    const isMultiTechnology = IdForMultiTechnology.includes(String(selectedMasterForSimulation.value));
    const runSimulationPermission = !((JSON.parse(localStorage.getItem('simulationRunPermission'))).includes(selectedMasterForSimulation?.label))
    const { selectedTechnologyForSimulation } = useSelector(state => state.simulation)
    const { selectedVendorForSimulation } = useSelector(state => state.simulation)

    const gridRef = useRef();

    const verifyList = useSelector(state => state.simulation.simulationVerifyList)

    // const isAssemblyCosting = true
    const dispatch = useDispatch()

    useEffect(() => {
        if (token) {
            verifyCostingList()
        }

    }, [token])

    const verifyCostingList = (plantId = '', rawMatrialId = '') => {
        const plant = filteredRMData.plantId && filteredRMData.plantId.value ? filteredRMData.plantId.value : null
        if (IdForMultiTechnology.includes(String(selectedTechnologyForSimulation?.value))) {
            dispatch(getAllMultiTechnologyImpactedSimulationCostings(props?.token, (res) => {
                if (res?.data?.Result) {
                    const data = res?.data?.Data
                    if (data?.SimulationImpactedCostings?.length === 0) {
                        Toaster.warning('No approved costing exist for this Vendor.')
                        setHideRunButton(true)
                        return false
                    }
                    setTokenNo(data?.TokenNumber)
                    setSimualtionId(data?.SimulationId)
                    setHideRunButton(false)
                    setSimulationTechnologyId(data?.SimulationtechnologyId)
                    setVendorId(data?.VendorId)
                    setEffectiveDate(data?.EffectiveDate)
                }
            }))

            // dispatch(getVerifySimulationList(props.token, plant, rawMatrialId, (res) => {
            //     if (res.data.Result) {
            //         const data = res.data.Data
            //         if (data.SimulationImpactedCostings.length === 0) {
            //             Toaster.warning('No approved costing exist for this raw material.')
            //             setHideRunButton(true)
            //             return false
            //         }
            //         setTokenNo(data.TokenNumber)
            //         setSimualtionId(data.SimulationId)
            //         setHideRunButton(false)
            //         setSimulationTechnologyId(data.SimulationtechnologyId)
            //         setVendorId(data.VendorId)
            //         setEffectiveDate(data.EffectiveDate)
            //     }
            // }))
        } else {
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
                            setEffectiveDate(data.EffectiveDate)
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
                            setEffectiveDate(data.EffectiveDate)
                        }
                    }))
                    break;
                case Number(SURFACETREATMENT):

                    dispatch(getVerifySurfaceTreatmentSimulationList(props.token, (res) => {
                        if (res.data.Result) {
                            const data = res.data.Data
                            if (data.SimulationSurfaceTreatmentAndOperationImpactedCosting.length === 0) {           //   for condition
                                Toaster.warning('No approved costing exist for this surface treatment.')
                                setHideRunButton(true)
                                return false
                            }
                            setTokenNo(data.TokenNumber)
                            setSimualtionId(data.SimulationId)
                            setSimulationTechnologyId(data.SimulationtechnologyId)
                            setHideRunButton(false)
                            setEffectiveDate(data.EffectiveDate)
                        }
                    }))
                    break;
                case Number(OPERATIONS):

                    dispatch(getVerifySurfaceTreatmentSimulationList(props.token, (res) => {
                        if (res.data.Result) {
                            const data = res.data.Data
                            if (data.SimulationSurfaceTreatmentAndOperationImpactedCosting.length === 0) {           //   for condition
                                Toaster.warning('No approved costing exist for this surface treatment.')
                                setHideRunButton(true)
                                return false
                            }
                            setTokenNo(data.TokenNumber)
                            setSimualtionId(data.SimulationId)
                            setSimulationTechnologyId(data.SimulationtechnologyId)
                            setHideRunButton(false)
                            setEffectiveDate(data.EffectiveDate)
                        }
                    }))
                    break;
                case Number(MACHINERATE):

                    dispatch(getVerifyMachineRateSimulationList(props.token, (res) => {
                        if (res.data.Result) {
                            const data = res.data.Data
                            if (data.SimulationMachineProcesstImpactedCostings.length === 0) {           //   for condition
                                Toaster.warning('No approved costing exist for this machine rate.')
                                setHideRunButton(true)
                                return false
                            }
                            setTokenNo(data.TokenNumber)
                            setSimualtionId(data.SimulationId)
                            setHideRunButton(false)
                            setEffectiveDate(data.EffectiveDate)
                        }
                    }))
                    break;
                case Number(BOPDOMESTIC):

                    dispatch(getVerifyBoughtOutPartSimulationList(props.token, (res) => {
                        if (res.data.Result) {
                            const data = res.data.Data
                            if (data.simulationBoughtOutPartImpactedCostings.length === 0) {
                                Toaster.warning('No approved costing exist for this bought out part.')
                                setHideRunButton(true)
                                return false
                            }
                            setTokenNo(data.TokenNumber)
                            setSimualtionId(data.SimulationId)
                            setHideRunButton(false)
                            setEffectiveDate(data.EffectiveDate)
                        }
                    }))
                    break;
                case Number(BOPIMPORT):

                    dispatch(getVerifyBoughtOutPartSimulationList(props.token, (res) => {
                        if (res.data.Result) {
                            const data = res.data.Data
                            if (data.simulationBoughtOutPartImpactedCostings.length === 0) {
                                Toaster.warning('No approved costing exist for this bought out part.')
                                setHideRunButton(true)
                                return false
                            }
                            setTokenNo(data.TokenNumber)
                            setSimualtionId(data.SimulationId)
                            setHideRunButton(false)
                            setEffectiveDate(data.EffectiveDate)
                        }
                    }))
                    break;
                // case Number(BOPIMPORT):

                // dispatch(getVerifyOverheadSimulationList(props.token, (res) => {
                //     if (res.data.Result) {
                //         const data = res.data.Data
                //         if (data.SimulationOverheadImpactedCostings.length === 0) {           //   for condition
                //             Toaster.warning('No approved costing exist for this bought out part.')
                //             setHideRunButton(true)
                //             return false
                //         }
                //         setTokenNo(data.TokenNumber)
                //         setSimualtionId(data.SimulationId)
                //         // setMasterId(data.SimulationtechnologyId)
                //         // setVerifyList(data.SimulationCombinedProcessImpactedCostings)
                //         setHideRunButton(false)
                //     }
                // }))
                // break;
                // case Number(BOPIMPORT):

                //     dispatch(getVerifyProfitSimulationList(props.token, (res) => {
                //         if (res.data.Result) {
                //             const data = res.data.Data
                //             if (data.SimulationProfitImpactedCostings.length === 0) {           //   for condition
                //                 Toaster.warning('No approved costing exist for this bought out part.')
                //                 setHideRunButton(true)
                //                 return false
                //             }
                //             setTokenNo(data.TokenNumber)
                //             setSimualtionId(data.SimulationId)
                //             // setMasterId(data.SimulationtechnologyId)
                //             // setVerifyList(data.SimulationCombinedProcessImpactedCostings)
                //             setHideRunButton(false)
                //         }
                //     }))
                //     break;

                case Number(EXCHNAGERATE):

                    dispatch(getVerifyExchangeSimulationList(props.token, (res) => {
                        if (res.data.Result) {
                            const data = res.data.Data
                            if (data.SimulationExchangeRateImpactedCostings.length === 0) {
                                Toaster.warning('No approved costing exist for this exchange rate.')
                                setHideRunButton(true)
                                return false
                            }
                            setTokenNo(data.TokenNumber)
                            setSimualtionId(data.SimulationId)
                            setSimulationTechnologyId(data.SimulationtechnologyId)
                            // setMasterId(data.SimulationtechnologyId)
                            setHideRunButton(false)
                            setEffectiveDate(data.EffectiveDate)
                        }
                    }))
                    break;
                case Number(COMBINED_PROCESS):

                    dispatch(getverifyCombinedProcessSimulationList(props.token, (res) => {
                        if (res.data.Result) {
                            const data = res.data.Data
                            if (data.SimulationCombinedProcessImpactedCostings.length === 0) {           //   for condition
                                Toaster.warning('No approved costing exist for this combined process.')
                                setHideRunButton(true)
                                return false
                            }
                            setTokenNo(data.TokenNumber)
                            setSimualtionId(data.SimulationId)
                            setSimulationTechnologyId(data.SimulationtechnologyId)
                            setHideRunButton(false)
                            setEffectiveDate(data.EffectiveDate)
                        }
                    }))
                    break;
                default:
                    break;
            }
        }
    }

    const newBRFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewBasicRate > row.OldBasicRate) ? 'red-value form-control' : (row.NewBasicRate < row.OldBasicRate) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : '-'
    }

    const newSRFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewScrapRate > row.OldScrapRate) ? 'red-value form-control' : (row.NewScrapRate < row.OldScrapRate) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : '-'
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

    const poPriceFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cell != null && cell.length !== 0) ? checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice) : '-'
    }

    const renderPlant = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (cell !== null && cell !== '-') ? `${cell}(${row.PlantCode})` : '-'
    }

    const renderVendor = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (cell !== null && cell !== '-') ? `${cell}(${row.VendorCode})` : '-'
    }

    const renderPart = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        let value = isMultiTechnology ? row.PartNumber : row.PartNo
        return (value !== null && value !== '-') ? value : '-'
    }

    const renderRM = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return `${cell}-${row.RMGrade ? row.RMGrade : '-'}`
    }

    const newExchangeRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewExchangeRate > row.OldExchangeRate) ? 'red-value form-control' : (row.NewExchangeRate < row.OldExchangeRate) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : '-'
    }

    const newCCFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewNetCC > row.OldNetCC) ? 'red-value form-control' : (row.NewNetCC < row.OldNetCC) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : '-'
    }

    const decimalFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)
    }

    const onRowSelect = () => {
        var selectedRows = gridApi.getSelectedRows();
        setSelectedRowData(selectedRows)
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

    useEffect(() => {
        if (verifyList && verifyList.length > 0) {
            window.screen.width >= 1600 && gridRef.current.api.sizeColumnsToFit();
        }
    }, [verifyList])

    const runSimulation = debounce(() => {
        if (selectedRowData.length === 0) {
            Toaster.warning('Please select atleast one costing.')
            return false
        }

        let obj = {};
        obj.SimulationId = simulationId
        obj.LoggedInUserId = loggedInUserId()
        let tempArr = []

        if (isMultiTechnology) {
            selectedRowData && selectedRowData.map(item => {
                let tempObj = {}
                tempObj.AssemblyCostingId = item.AssemblyCostingId
                tempObj.BaseWeightedAverageCostingId = item.BaseWeightedAverageCostingId
                tempObj.BaseCostingId = item.BaseCostingId
                tempObj.NewBaseCostingId = item.NewBaseCostingId
                tempObj.PartTypeId = item.PartTypeId
                tempArr.push(tempObj)
                return null;
            })
        } else {
            switch (Number(selectedMasterForSimulation.value)) {
                case Number(RMDOMESTIC):
                case Number(RMIMPORT):
                    selectedRowData && selectedRowData.map(item => {
                        let tempObj = {}
                        tempObj.RawMaterialId = item.RawMaterialId
                        tempObj.CostingId = item.CostingId
                        tempArr.push(tempObj)
                        return null;
                    })
                    break;

                case Number(SURFACETREATMENT):
                case Number(OPERATIONS):
                    selectedRowData && selectedRowData.map(item => {
                        let tempObj = {}
                        tempObj.OperationId = item.OperationId
                        tempObj.CostingId = item.CostingId
                        tempArr.push(tempObj)
                        return null;
                    })
                    break;

                case Number(BOPDOMESTIC):
                case Number(BOPIMPORT):
                    selectedRowData && selectedRowData.map(item => {
                        let tempObj = {}
                        tempObj.BoughtOutPartId = item.BoughtOutPartId
                        tempObj.CostingId = item.CostingId
                        tempArr.push(tempObj)
                        return null;
                    })
                    break;

                case Number(EXCHNAGERATE):
                    selectedRowData && selectedRowData.map(item => {
                        let tempObj = {}
                        tempObj.CostingId = item.CostingId
                        tempArr.push(tempObj)
                        return null;
                    })
                    obj.RunSimualtionExchangeRateCostingInfos = tempArr
                    setObj(obj)
                    setSimulationDrawer(true)

                    break;

                case Number(MACHINERATE):
                    selectedRowData && selectedRowData.map(item => {
                        let tempObj = {}
                        tempObj.CostingId = item.CostingId
                        tempObj.MachineId = item.MachineId
                        tempObj.ProcessId = item.ProcessId
                        tempArr.push(tempObj)
                        return null;
                    })
                    obj.RunSimualtionCostingInfo = tempArr
                    setObj(obj)
                    setSimulationDrawer(true)
                    break;
                case Number(COMBINED_PROCESS):
                    selectedRowData && selectedRowData.map(item => {
                        let tempObj = {}
                        tempObj.CostingId = item.CostingId
                        tempArr.push(tempObj)
                        return null;
                    })
                    obj.RunSimualtionCostingInfo = tempArr
                    setObj(obj)
                    setSimulationDrawer(true)
                    break;
                default:
                    break;
            }
        }

        if (!isExchangeRate && !isCombinedProcess) {
            obj.RunSimualtionCostingInfo = tempArr
            setObj(obj)
            setSimulationDrawer(true)
        }

    }, 500)

    const closeDrawer = (e = '', mode) => {
        if (mode === true) {
            setSimulationDrawer(false)
            setSimulationCostingPage(true)
        } else {
            setSimulationDrawer(false)
        }
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
        window.screen.width >= 1600 && gridRef.current.api.sizeColumnsToFit();
    };

    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const resetState = () => {
        gridOptions?.columnApi?.resetColumnState();
        gridOptions?.api?.setFilterModel(null);
        gridApi.setQuickFilter(null);
        document.getElementById("filter-text-box").value = "";
        window.screen.width >= 1600 && gridRef.current.api.sizeColumnsToFit();

    }

    const frameworkComponents = {
        descriptionFormatter: descriptionFormatter,
        ecnFormatter: ecnFormatter,
        revisionFormatter: revisionFormatter,
        renderVendor: renderVendor,
        renderPlant: renderPlant,
        renderRM: renderRM,
        newBRFormatter: newBRFormatter,
        newSRFormatter: newSRFormatter,
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
        poPriceFormatter: poPriceFormatter,
        newExchangeRateFormatter: newExchangeRateFormatter,
        decimalFormatter: decimalFormatter,
        newCCFormatter: newCCFormatter,
        renderPart: renderPart,
    };
    return (
        <>
            {
                // (!costingPage && !showAssemblyPage) &&   // REJECTED ASSEMBLY
                !costingPage &&
                <>
                    {!assemblyTechnology && <Row>
                        <Col sm="12">
                            <h3 class="mb-0">Token No:{tokenNo}</h3>
                        </Col>
                    </Row>
                    }
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
                            <div className={`ag-grid-react`}>
                                <div className={`ag-grid-wrapper height-width-wrapper ${verifyList && verifyList?.length <= 0 ? "overlay-contain" : ""}`}>
                                    <div className="ag-grid-header">
                                        <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                                        <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                                            <div className="refresh mr-0"></div>
                                        </button>
                                    </div>
                                    <div
                                        className="ag-theme-material">
                                        <AgGridReact
                                            defaultColDef={defaultColDef}
                                            floatingFilter={true}
                                            domLayout='autoHeight'
                                            rowData={verifyList}
                                            ref={gridRef}
                                            pagination={true}
                                            paginationPageSize={defaultPageSize}
                                            onGridReady={onGridReady}
                                            gridOptions={gridOptions}
                                            loadingOverlayComponent={'customLoadingOverlay'}
                                            noRowsOverlayComponent={'customNoRowsOverlay'}
                                            noRowsOverlayComponentParams={{
                                                title: EMPTY_DATA,
                                                imagClass: "verify-simulation-overlay"
                                            }}
                                            frameworkComponents={frameworkComponents}
                                            rowSelection={'multiple'}
                                            onRowSelected={onRowSelected}
                                            onSelectionChanged={onRowSelect}

                                        >
                                            <AgGridColumn field="CostingId" hide ></AgGridColumn>
                                            <AgGridColumn width={185} field="CostingNumber" headerName="Costing Number"></AgGridColumn>
                                            {!isMultiTechnology && <AgGridColumn width={140} field="VendorName" cellRenderer='renderVendor' headerName="Vendor(Code)"></AgGridColumn>}
                                            <AgGridColumn width={120} field="PlantName" cellRenderer='renderPlant' headerName="Plant(Code)"></AgGridColumn>
                                            <AgGridColumn width={110} field="PartNo" headerName="Part No." cellRenderer='renderPart'></AgGridColumn>
                                            <AgGridColumn width={120} field="PartName" cellRenderer='descriptionFormatter' headerName="Part Name"></AgGridColumn>
                                            <AgGridColumn width={130} field="RevisionNumber" cellRenderer='revisionFormatter' headerName="Revision No."></AgGridColumn>
                                            <AgGridColumn width={130} field="POPrice" headerName="Current PO Price" cellRenderer='poPriceFormatter'></AgGridColumn>

                                            {isSurfaceTreatmentOrOperation === true && <AgGridColumn width={185} field="OperationName" headerName="Operation Name"></AgGridColumn>}
                                            {isSurfaceTreatmentOrOperation === true && <AgGridColumn width={185} field="OperationCode" headerName="Operation Code"></AgGridColumn>}
                                            {isSurfaceTreatmentOrOperation === true && <AgGridColumn width={185} field="OldOperationRate" headerName="Old Rate"></AgGridColumn>}
                                            {isSurfaceTreatmentOrOperation === true && <AgGridColumn width={185} field="NewOperationRate" headerName="New Rate"></AgGridColumn>}

                                            {isBOPDomesticOrImport === true && <AgGridColumn width={130} field="BoughtOutPartCode" headerName="BOP Number"></AgGridColumn>}
                                            {isBOPDomesticOrImport === true && <AgGridColumn width={130} field="BoughtOutPartName" headerName="BOP Name"></AgGridColumn>}
                                            {isBOPDomesticOrImport === true && <AgGridColumn width={145} field="OldBoughtOutPartRate" headerName="Old Basic Rate"></AgGridColumn>}
                                            {isBOPDomesticOrImport === true && <AgGridColumn width={150} field="NewBoughtOutPartRate" cellRenderer='newBRFormatter' headerName="New Basic Rate"></AgGridColumn>}

                                            {isMachineRate && <AgGridColumn width={145} field="ProcessName" headerName="Process Name"></AgGridColumn>}
                                            {isMachineRate && <AgGridColumn width={150} field="MachineNumber" headerName="Machine Number"></AgGridColumn>}
                                            {isMachineRate && <AgGridColumn width={145} field="OldMachineRate" headerName="Old Machine Rate"></AgGridColumn>}
                                            {isMachineRate && <AgGridColumn width={150} field="NewMachineRate" headerName="New Machine Rate"></AgGridColumn>}

                                            {isRMDomesticOrRMImport === true && <AgGridColumn width={120} field="RMName" headerName="RM Name" ></AgGridColumn>}
                                            {isRMDomesticOrRMImport === true && <AgGridColumn width={120} field="RMGrade" headerName="RM Grade" ></AgGridColumn>}
                                            {isRMDomesticOrRMImport === true && <AgGridColumn width={145} field="OldBasicRate" headerName="Old Basic Rate"></AgGridColumn>}
                                            {isRMDomesticOrRMImport === true && <AgGridColumn width={150} field="NewBasicRate" cellRenderer='newBRFormatter' headerName="New Basic Rate"></AgGridColumn>}
                                            {isRMDomesticOrRMImport === true && <AgGridColumn width={145} field="OldScrapRate" headerName="Old Scrap Rate"></AgGridColumn>}
                                            {isRMDomesticOrRMImport === true && <AgGridColumn width={150} field="NewScrapRate" cellRenderer='newSRFormatter' headerName="New Scrap Rate" ></AgGridColumn>}
                                            {isRMDomesticOrRMImport === true && <AgGridColumn field="RawMaterialId" hide ></AgGridColumn>}

                                            {isExchangeRate && <AgGridColumn width={130} field="Currency" headerName="Currency"></AgGridColumn>}
                                            {isExchangeRate && <AgGridColumn width={130} field="POPrice" headerName="PO Price Old"></AgGridColumn>}
                                            {isExchangeRate && <AgGridColumn width={145} field="OldExchangeRate" headerName="Old Exchange Rate"></AgGridColumn>}
                                            {isExchangeRate && <AgGridColumn width={150} field="NewExchangeRate" cellRenderer='newExchangeRateFormatter' headerName="New Exchange Rate"></AgGridColumn>}

                                            {isCombinedProcess && <AgGridColumn width={130} field="OldPOPrice" headerName="PO Price Old" cellRenderer='decimalFormatter'></AgGridColumn>}
                                            {isCombinedProcess && <AgGridColumn width={130} field="NewPOPrice" headerName="PO Price New" cellRenderer='decimalFormatter'></AgGridColumn>}
                                            {isCombinedProcess && <AgGridColumn width={145} field="OldNetCC" headerName="Old CC" cellRenderer='decimalFormatter'></AgGridColumn>}
                                            {isCombinedProcess && <AgGridColumn width={150} field="NewNetCC" cellRenderer='newCCFormatter' headerName="New CC"></AgGridColumn>}
                                            {isMultiTechnology && <AgGridColumn width={150} field="Delta" headerName="Delta"></AgGridColumn>}
                                            {isMultiTechnology && <AgGridColumn width={150} field="DeltaSign" headerName="DeltaSign"></AgGridColumn>}
                                            {isMultiTechnology && <AgGridColumn width={150} field="NetCost" headerName="Net Cost"></AgGridColumn>}
                                            {isMultiTechnology && <AgGridColumn width={150} field="SOBPercentage" headerName="SOB Percentage"></AgGridColumn>}
                                            {isMultiTechnology && <AgGridColumn width={150} field="OldPOPrice" headerName="Old PO Price"></AgGridColumn>}
                                            {isMultiTechnology && <AgGridColumn width={150} field="NewPOPrice" headerName="New PO Price"></AgGridColumn>}


                                            {isOverHeadProfit === true && <AgGridColumn width={120} field="OverheadName" headerName="Overhead Name" ></AgGridColumn>}
                                        </AgGridReact>
                                        {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
                                    </div>
                                </div>
                            </div>
                        </Col >
                    </Row >
                    <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer sticky-btn-footer">
                        <div className="col-sm-12 text-right bluefooter-butn">
                            <button type={"button"} className="mr15 cancel-btn" onClick={cancelVerifyPage}>
                                <div className={"cancel-icon"}></div>
                                {"CANCEL"}
                            </button>
                            {/* {!isAssemblyCosting && */}
                            {/* <button onClick={runSimulation} type="submit" disabled={hideRunButton || runSimulationPermission} className="user-btn mr5 save-btn"                    > */}
                            <button onClick={runSimulation} type="submit" className="user-btn mr5 save-btn"                    >
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
                <CostingSimulation simulationId={simulationId} master={selectedMasterForSimulation.value} />
            }
            {
                simulationDrawer &&
                <RunSimulationDrawer
                    tokenNo={tokenNo}
                    vendorId={vendorId}
                    isOpen={simulationDrawer}
                    closeDrawer={closeDrawer}
                    date={effectiveDate}
                    objs={objs}
                    anchor={"right"}
                    masterId={selectedMasterForSimulation.value}
                    technology={props.technology}
                    token={props?.token}
                />
            }
            {/* {   // REJECTED ASSEMBLY
                showAssemblyPage &&

                <AssemblySimulation selectedRowDataFromVerify={selectedRowData} token={tokenNo} cancelAssemblyPage={cancelAssemblyPage} />

            } */}
        </>
    );
}

export default VerifySimulation;