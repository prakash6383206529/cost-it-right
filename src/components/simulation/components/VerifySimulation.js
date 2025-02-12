import React, { useState, useRef, useContext } from 'react';
import { Row, Col, Tooltip, } from 'reactstrap';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NoContentFound from '../../common/NoContentFound';
import { EMPTY_DATA, EXCHNAGERATE, OPERATIONS, RMDOMESTIC, RMIMPORT, SURFACETREATMENT, BOPDOMESTIC, BOPIMPORT, MACHINERATE, OVERHEAD, defaultPageSize, COMBINED_PROCESS, CBCTypeId, ZBCTypeId } from '../../../config/constants';
import { getAllMultiTechnologyCostings, getAllMultiTechnologyImpactedSimulationCostings, getAllSimulationBoughtOutPart, getVerifyBoughtOutPartSimulationList, getverifyCombinedProcessSimulationList, getVerifyExchangeSimulationList, getVerifyMachineRateSimulationList, getVerifySimulationList, getVerifySurfaceTreatmentSimulationList, runSimulationOnSelectedBoughtOutPart } from '../actions/Simulation';
import RunSimulationDrawer from './RunSimulationDrawer';
import CostingSimulation from './CostingSimulation';
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId, searchNocontentFilter, showBopLabel } from '../../../helper';
import Toaster from '../../common/Toaster';
import LoaderCustom from '../../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { debounce } from 'lodash'
import { PaginationWrapper } from '../../common/commonPagination';
import { APPLICABILITY_BOP_NON_ASSOCIATED_SIMULATION, APPLICABILITY_BOP_SIMULATION, APPLICABILITY_MACHINE_RATES_SIMULATION, APPLICABILITY_OPERATIONS_SIMULATION, APPLICABILITY_PART_SIMULATION, APPLICABILITY_RM_SIMULATION, APPLICABILITY_SURFACE_TREATMENT_SIMULATION, ASSEMBLY_TECHNOLOGY_MASTER } from '../../../config/masterData';
import DayTime from '../../common/DayTimeWrapper';
import DatePicker from "react-datepicker";
import { reactLocalStorage } from 'reactjs-localstorage';
import { simulationContext } from '.';
import { useLabels } from '../../../helper/core';
// import AssemblySimulation from './AssemblySimulation';

const gridOptions = {};

function VerifySimulation(props) {
    const { showEditMaster, showverifyPage, costingDrawerPage, handleEditMasterPage, showTour } = useContext(simulationContext) || {};

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
    const [noData, setNoData] = useState(false);
    const [minimumPoPrice, setMinimumPoPrice] = useState('');
    const [currencyViewTooltip, setCurrencyViewTooltip] = useState(false)
    // const [showAssemblyPage, setShowAssemblyPage] = useState(false);   // REJECTED ASSEMBLY
    const { filteredRMData } = useSelector(state => state.material)
    const [showTooltip, setShowTooltip] = useState(false)

    const simulationApplicability = useSelector(state => state.simulation.simulationApplicability)
    const { selectedMasterForSimulation } = useSelector(state => state.simulation)
    const isSurfaceTreatmentOrOperation = ((Number(selectedMasterForSimulation.value) === Number(SURFACETREATMENT)) || (Number(selectedMasterForSimulation.value) === Number(OPERATIONS)) || simulationApplicability?.value === APPLICABILITY_SURFACE_TREATMENT_SIMULATION || simulationApplicability?.value === APPLICABILITY_OPERATIONS_SIMULATION);
    const isRMDomesticOrRMImport = ((Number(selectedMasterForSimulation.value) === Number(RMDOMESTIC)) || (Number(selectedMasterForSimulation.value) === Number(RMIMPORT)) || simulationApplicability?.value === APPLICABILITY_RM_SIMULATION);
    const isExchangeRate = Number(selectedMasterForSimulation.value) === (Number(EXCHNAGERATE));
    const isBOPDomesticOrImport = ((Number(selectedMasterForSimulation.value) === Number(BOPDOMESTIC)) || (Number(selectedMasterForSimulation.value) === Number(BOPIMPORT)) || simulationApplicability?.value === APPLICABILITY_BOP_SIMULATION || simulationApplicability?.value === APPLICABILITY_BOP_NON_ASSOCIATED_SIMULATION);
    const isMachineRate = (Number(selectedMasterForSimulation.value) === (Number(MACHINERATE)) || simulationApplicability?.value === APPLICABILITY_MACHINE_RATES_SIMULATION);
    const isOverHeadProfit = Number(selectedMasterForSimulation.value) === (Number(OVERHEAD));
    const isMultiTechnology = (checkForNull(selectedMasterForSimulation.value) === ASSEMBLY_TECHNOLOGY_MASTER) ? true : false;
    const { isMasterAssociatedWithCosting } = useSelector(state => state.simulation)
    const [showRM, setShowRM] = useState(simulationApplicability?.value === 'RM');
    const [showBOP, setShowBOP] = useState(simulationApplicability?.value === 'BOP');
    const [showComponent, setShowComponent] = useState(simulationApplicability?.value === 'Component');
    const runSimulationPermission = !((JSON.parse(localStorage.getItem('simulationRunPermission'))).includes(selectedMasterForSimulation?.label))
    const { selectedTechnologyForSimulation } = useSelector(state => state.simulation)
    const { selectedVendorForSimulation } = useSelector(state => state.simulation)
    const gridRef = useRef();
    const { vendorLabel } = useLabels()
    const verifyList = useSelector(state => state.simulation.simulationVerifyList)

    // const isAssemblyCosting = true
    const dispatch = useDispatch()
    useEffect(() => {

        if (handleEditMasterPage) {
            handleEditMasterPage(showEditMaster, showverifyPage, costingPage)
        }
    }, [costingPage, cancelVerifyPage])
    useEffect(() => {
        if (token) {
            verifyCostingList()
        }

    }, [token])

    useEffect(() => {
        const minimalPOPrice = selectedRowData.reduce((minPOPrice, currentItem) => {
            return currentItem.POPrice < minPOPrice ? currentItem.POPrice : minPOPrice;
        }, Infinity);
        setMinimumPoPrice(minimalPOPrice)
    }, [selectedRowData])

    const verifyCostingList = (plantId = '', rawMatrialId = '') => {
        const plant = filteredRMData.plantId && filteredRMData.plantId.value ? filteredRMData.plantId.value : null
        if (checkForNull(selectedMasterForSimulation?.value) === ASSEMBLY_TECHNOLOGY_MASTER) {
            dispatch(getAllMultiTechnologyImpactedSimulationCostings(props?.token, (res) => {
                if (res?.data?.Result) {
                    const data = res?.data?.Data
                    if ((Object.keys(data).length === 0) || (data?.SimulationImpactedCostings?.length === 0)) {
                        Toaster.warning('No approved costing exist for this technology.')
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
            let masterTemp = selectedMasterForSimulation.value
            if (selectedMasterForSimulation?.value === EXCHNAGERATE && simulationApplicability?.value === APPLICABILITY_RM_SIMULATION) {
                masterTemp = RMIMPORT
            } else if (selectedMasterForSimulation?.value === EXCHNAGERATE && simulationApplicability?.value === APPLICABILITY_BOP_SIMULATION) {
                masterTemp = BOPIMPORT
            }
            switch (Number(masterTemp)) {
                case Number(RMDOMESTIC):
                    handleRawMaterialCase(props.token, plant, rawMatrialId)
                    break;
                case Number(RMIMPORT):
                    handleRawMaterialCase(props.token, plant, rawMatrialId)
                    break;
                case Number(SURFACETREATMENT):

                    handleOperationCase()
                    break;
                case Number(OPERATIONS):
                    handleOperationCase()
                    break;
                case Number(MACHINERATE):
                    handleMachineRateCase()
                    break;
                case Number(BOPDOMESTIC):
                    handleBOPCase()
                    break;
                case Number(BOPIMPORT):

                    handleBOPCase()

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
                    switch (simulationApplicability?.value) {
                        case APPLICABILITY_RM_SIMULATION:

                            handleRawMaterialCase(props.token, plant, rawMatrialId);
                            break;
                        case APPLICABILITY_BOP_SIMULATION:
                        case APPLICABILITY_BOP_NON_ASSOCIATED_SIMULATION:

                            handleBOPCase();
                            break;
                        case APPLICABILITY_OPERATIONS_SIMULATION:

                            handleOperationCase();
                            break;
                        case APPLICABILITY_SURFACE_TREATMENT_SIMULATION:

                            handleOperationCase();
                            break;
                        case APPLICABILITY_MACHINE_RATES_SIMULATION:

                            handleMachineRateCase();
                            break;
                        default:

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
                                    setHideRunButton(false)
                                    setEffectiveDate(data.EffectiveDate)
                                }
                            }));
                            break;
                    }
                    break;
                case Number(COMBINED_PROCESS):          						//RE

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
    const handleOperationCase = () => {
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
    }
    const handleBOPCase = () => {
        if (isMasterAssociatedWithCosting) {
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
                    setSimulationTechnologyId(data.SimulationtechnologyId)
                    setHideRunButton(false)
                    setEffectiveDate(data.EffectiveDate)
                }
            }))
        } else {
            dispatch(getAllSimulationBoughtOutPart(props.token, (res) => {
                if (res.data.Result) {
                    const data = res.data.Data
                    if (data.SimulationBoughtOutPart.length === 0) {
                        Toaster.warning('No approved bought out part.')
                        setHideRunButton(true)
                        return false
                    }
                    setTokenNo(data.TokenNumber)
                    setSimualtionId(data.SimulationId)
                    setSimulationTechnologyId(data.SimulationTechnologyId)
                    setHideRunButton(false)
                    setEffectiveDate(data.EffectiveDate)
                }

            }))
        }
    }
    const handleMachineRateCase = () => {
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
                setSimulationTechnologyId(data.SimulationtechnologyId)
                setHideRunButton(false)
                setEffectiveDate(data.EffectiveDate)
            }
        }))
    }

    const handleRawMaterialCase = (token, plant, rawMatrialId) => {
        dispatch(getVerifySimulationList(token, plant, rawMatrialId, (res) => {
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
    }
    const newBRFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        let data = ''
        let classGreen = ''
        if (isMasterAssociatedWithCosting) {
            data = (row?.NewBoughtOutPartRate ? row?.NewBoughtOutPartRate : '-')
            classGreen = (row?.NewBoughtOutPartRate > row?.OldBoughtOutPartRate) ? 'red-value form-control' : (row?.NewBoughtOutPartRate < row?.OldBoughtOutPartRate) ? 'green-value form-control' : 'form-class'
        } else {
            data = row?.NewBOPRate ? row?.NewBOPRate : '-'
            classGreen = (row?.NewBasicRate > row?.OldBasicRate) ? 'red-value form-control' : (row?.NewBasicRate < row?.OldBasicRate) ? 'green-value form-control' : 'form-class'
        }
        return data != null ? <span className={classGreen}>{checkForDecimalAndNull(data, getConfigurationKey().NoOfDecimalForPrice)}</span> : '-'
    }

    const newNetLandedCostFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        let data = ''
        let classGreen = ''
        data = row?.NewNetLandedCost ? row?.NewNetLandedCost : '-'
        classGreen = (row?.NewNetLandedCost > row?.OldNetLandedCost) ? 'red-value form-control' : (row?.NewNetLandedCost < row?.OldNetLandedCost) ? 'green-value form-control' : 'form-class'
        return data != null ? <span className={classGreen}>{checkForDecimalAndNull(data, getConfigurationKey().NoOfDecimalForPrice)}</span> : '-'
    }

    const newRMBasicRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row?.NewBasicRate > row?.OldBasicRate) ? 'red-value form-control' : (row?.NewBasicRate < row?.OldBasicRate) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : '-'
    }

    const newSRFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row?.NewScrapRate > row?.OldScrapRate) ? 'red-value form-control' : (row?.NewScrapRate < row?.OldScrapRate) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : '-'
    }

    const descriptionFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cell != null && cell.length !== 0) ? cell : '-'
    }

    const partTypeFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cell != null && cell.length !== 0) ? cell : '-'
    }

    const ecnFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cell != null && cell.length !== 0) ? cell : '-'
    }

    const revisionFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell ? cell : '-'
    }

    const priceFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cell != null && cell.length !== 0) ? checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice) : '-'
    }

    const renderPlant = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cell !== null && cell !== '-') ? `${cell}` : '-'
    }

    const renderVendor = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cell !== null && cell !== '-') ? `${cell}` : '-'
    }

    const renderCustomer = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cell !== null && cell !== '-') ? `${cell}` : '-'
    }

    const renderPart = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        let value = isMultiTechnology ? row?.PartNumber : row?.PartNo
        return (value !== null && value !== '-' && value !== undefined) ? value : '-'
    }

    const renderRM = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return `${cell}-${row?.RMGrade ? row?.RMGrade : '-'}`
    }

    const newExchangeRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row?.NewExchangeRate > row?.OldExchangeRate) ? 'red-value form-control' : (row?.NewExchangeRate < row?.OldExchangeRate) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : '-'
    }

    const bopNumberFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return <span title={isMasterAssociatedWithCosting ? (row?.BoughtOutPartCode ? row?.BoughtOutPartCode : '-') : (row?.BoughtOutPartNumber ? row?.BoughtOutPartNumber : '-')}>{isMasterAssociatedWithCosting ? (row?.BoughtOutPartCode ? row?.BoughtOutPartCode : '-') : (row?.BoughtOutPartNumber ? row?.BoughtOutPartNumber : '-')}</span>
    }

    const newCCFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewNetCC > row.OldNetCC) ? 'red-value form-control' : (row.NewNetCC < row.OldNetCC) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : '-'
    }

    const decimalFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return isMasterAssociatedWithCosting ? (row?.BoughtOutPartCode ? row?.BoughtOutPartCode : '-') : (row?.BoughtOutPartNumber ? row?.BoughtOutPartNumber : '-')
    }

    const combinedProcessCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell ? checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice) : '-'
    }

    const existingBasicFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return isMasterAssociatedWithCosting ? (row?.OldBoughtOutPartRate ? row?.OldBoughtOutPartRate : '-') : (row?.OldBOPRate ? row?.OldBOPRate : '-')
    }

    /**
     * @method hyphenFormatter
     */
    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }

    const zeroFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '0';
    }

    const onRowSelect = () => {
        var selectedRows = gridApi.getSelectedRows();
        setSelectedRowData(selectedRows)
    }

    const onRowSelected = (e) => {
        let row = e.node.isSelected()
        setGridSelection(row, e.node)
    }

    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            if (verifyList.length !== 0) {
                setNoData(searchNocontentFilter(value, noData))
            }
        }, 500);
    }

    const setGridSelection = (type, clickedElement) => {
        var selectedRows = gridApi.getSelectedRows();
        const rowIndex = clickedElement.rowIndex
        const costingNumber = clickedElement.data.CostingNumber
        if (isMasterAssociatedWithCosting) {
            gridApi.forEachNode(node => {
                if (node.rowIndex !== rowIndex) {
                    if (node.data.CostingNumber === costingNumber) {
                        node.setSelected(type);
                    }
                }
            });
        }
        setSelectedRowData(selectedRows)
    }

    useEffect(() => {
        if (verifyList && verifyList.length > 0) {
            // window.screen.width >= 1600 && gridRef.current.api.sizeColumnsToFit();
        }
    }, [verifyList])

    const checkForResponse = (res) => {
        if ('response' in res) {
            if (res && res?.response?.data?.Result === false) {
            }
        }
        if (res?.data?.Result) {
            Toaster.success('Simulation process run successfully.')
            closeDrawer('', true)
        }
    }

    const runSimulation = debounce(() => {
        if (isMasterAssociatedWithCosting) {
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
                let masterTemp = selectedMasterForSimulation.value
                if (selectedMasterForSimulation?.value === EXCHNAGERATE) {
                    switch (simulationApplicability?.value) {
                        case APPLICABILITY_RM_SIMULATION:
                            masterTemp = RMIMPORT;
                            break;
                        case APPLICABILITY_BOP_SIMULATION:
                        case APPLICABILITY_BOP_NON_ASSOCIATED_SIMULATION:
                            masterTemp = BOPIMPORT;
                            break;
                        case APPLICABILITY_MACHINE_RATES_SIMULATION:
                            masterTemp = MACHINERATE;
                            break;
                        case APPLICABILITY_OPERATIONS_SIMULATION:
                            masterTemp = OPERATIONS;
                            break;
                        case APPLICABILITY_SURFACE_TREATMENT_SIMULATION:
                            masterTemp = SURFACETREATMENT;
                            break;
                        default:
                    }
                }
                switch (Number(masterTemp)) {
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
                    case Number(COMBINED_PROCESS):          						//RE
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

            // if (selectedMasterForSimulation?.value === EXCHNAGERATE) {
            //     if (simulationApplicability?.value === APPLICABILITY_PART_SIMULATION) {
            //         obj.RunSimualtionExchangeRateCostingInfos = tempArr;
            //     } else {
            //         obj.RunSimualtionCostingInfo = tempArr;

            //     }
            // } else {
            //     obj.RunSimualtionCostingInfo = tempArr;
            // }
            obj.RunSimualtionCostingInfo = tempArr

            setObj(obj)
            setSimulationDrawer(true)
        } else {
            if (selectedRowData.length === 0) {
                Toaster.warning('Please select atleast one Bought Out Part.')
                return false
            }


            let tempArr = []
            let obj = {}
            let obj2 = {}

            let temp1 = []
            let temp = []
            obj2.IsOverhead = false
            obj2.IsProfit = false
            obj2.IsRejection = false
            obj2.IsInventory = false
            obj2.IsPaymentTerms = false
            obj2.IsDiscountAndOtherCost = false
            obj2.IsAdditionalDiscount = false
            obj2.IsAdditionalOtherCost = false
            obj2.AdditionalOtherValue = ''                  // if toggleSwitchAdditionalOtherCOst==true then we will fetch percent value else (fixed value)
            obj2.AdditionalDiscountPercentage = ''               // if toggleSwitchAdditionalDiscount==true then we will fetch discount percent value else fixed value
            obj2.IsAdditionalOtherCostPercentage = false
            obj2.IsAdditionalDiscountPercentage = false
            obj2.IsTool = false
            obj2.IsFreight = false
            obj2.IsPackaging = false
            obj2.IsBOPHandlingCharge = false
            obj2.AdditionalOtherCostApplicability = ''
            obj2.AdditionalDiscountApplicability = ''
            obj2.IsAdditionalToolPercentage = ''
            obj2.AdditionalToolApplicability = ''
            obj2.IsAdditionalTool = false
            obj2.AdditionalToolValue = ''
            obj2.IsAdditionalPackagingPercentage = false
            obj2.AdditionalPackagingApplicability = ''
            obj2.IsAdditionalPackaging = false
            obj2.AdditionalPackagingValue = ''
            obj2.IsAdditionalFreightPercentage = false
            obj2.AdditionalFreightApplicability = ''
            obj2.IsAdditionalFreight = false
            obj2.AdditionalFreightValue = ''
            obj2.IsApplyLatestExchangeRate = false
            obj2.IsCostingCondition = false
            obj2.IsCostingNPV = false
            temp1.push(obj2)

            selectedRowData && selectedRowData.map(item => {
                let tempObj = {}
                tempObj.BoughtOutPartId = item.BoughtOutPartId
                tempObj.CostingId = item.CostingId
                tempArr.push(tempObj)
                return null;
            })

            obj.SimulationId = simulationId
            obj.LoggedInUserId = loggedInUserId()
            obj.RunSimualtionCostingInfo = tempArr

            dispatch(runSimulationOnSelectedBoughtOutPart({ ...obj, EffectiveDate: DayTime(effectiveDate !== null ? effectiveDate : "").format('YYYY/MM/DD HH:mm'), IsProvisional: false, SimulationApplicability: temp1 }, (res) => {
                checkForResponse(res)
            }))
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
        sortable: false,
        headerCheckboxSelection: isFirstColumn,
        checkboxSelection: isFirstColumn
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        setTimeout(() => {
            setShowTooltip(true)
        }, 100);
        setTimeout(() => {
            const checkBoxInstance = document.querySelectorAll('.ag-input-field-input.ag-checkbox-input');
            checkBoxInstance.forEach((checkBox, index) => {
                const specificId = `verify_simulation_Checkbox${index}`;
                checkBox.id = specificId;
            })
        }, 200);
        const floatingFilterInstances = document.querySelectorAll('.ag-input-field-input.ag-text-field-input');
        floatingFilterInstances.forEach((floatingFilter, index) => {
            const specificId = `verify_simulation_Floating${index}`;
            floatingFilter.id = specificId;
        });
        params.api.paginationGoToPage(0);
        if (!isMasterAssociatedWithCosting) {
            params.api.sizeColumnsToFit();
        } else {
            window.screen.width >= 1921 && params.api.sizeColumnsToFit();
        }
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
        if (!isMasterAssociatedWithCosting && isBOPDomesticOrImport) {
            gridRef.current.api.sizeColumnsToFit();
        } else {
            // window.screen.width >= 1600 && gridRef.current.api.sizeColumnsToFit();
        }
    }
    const currencytooltipToggle = () => {
        setCurrencyViewTooltip(!currencyViewTooltip)
    }
    const currencyHeader = (props) => {
        return (
            <div className='ag-header-cell-label'>
                <span className='ag-header-cell-text ' style={{ display: 'flex', gridGap: '5px' }}>Currency {<i className={`fa fa-info-circle tooltip_custom_right tooltip-icon mb-n3 ml-4 mt2 `} id={"currency-tooltip"}></i>} </span>
            </div>
        );
    };
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
        priceFormatter: priceFormatter,
        newExchangeRateFormatter: newExchangeRateFormatter,
        decimalFormatter: decimalFormatter,
        newCCFormatter: newCCFormatter,
        renderPart: renderPart,
        renderCustomer: renderCustomer,
        bopNumberFormatter: bopNumberFormatter,
        existingBasicFormatter: existingBasicFormatter,
        newRMBasicRateFormatter: newRMBasicRateFormatter,
        partTypeFormatter: partTypeFormatter,
        combinedProcessCostFormatter: combinedProcessCostFormatter,
        hyphenFormatter: hyphenFormatter,
        currencyHeader: currencyHeader,
        newNetLandedCostFormatter: newNetLandedCostFormatter,
        zeroFormatter: zeroFormatter
    };
    function getOperationTypes(list) {
        return list && list?.map(item => item.ForType);
    }
    const operationTypes = getOperationTypes(verifyList);
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

                    {showTooltip && <Tooltip className="simulation-tooltip-left" placement={"top"} isOpen={currencyViewTooltip} toggle={currencytooltipToggle} target={"currency-tooltip"}>
                        {"This is the currency selected during the costing"}
                    </Tooltip>}
                    <Row>
                        <Col>
                            <div className={`ag-grid-react`}>
                                <div className={`ag-grid-wrapper height-width-wrapper ${(verifyList && verifyList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                                    <div className="ag-grid-header d-flex align-item-center justify-content-between">
                                        <div className='d-flex align-item-center'>
                                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                            <button type="button" className="user-btn float-right" title="Reset Grid" onClick={() => resetState()}>
                                                <div className="refresh mr-0"></div>
                                            </button>
                                        </div>
                                        <button type="button" className={"apply back_verify_page"} id="verfiy-simulation-back" onClick={cancelVerifyPage}> <div className={'back-icon'}></div>Back</button>
                                    </div >
                                    <div className="ag-theme-material p-relative">
                                        {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found simulation-lisitng" />}
                                        {verifyList && <AgGridReact
                                            defaultColDef={defaultColDef}
                                            floatingFilter={true}
                                            domLayout='autoHeight'
                                            rowData={verifyList}
                                            ref={gridRef}
                                            pagination={true}
                                            paginationPageSize={defaultPageSize}
                                            onGridReady={onGridReady}
                                            gridOptions={gridOptions}
                                            suppressColumnVirtualisation={true} // Add this line
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
                                            onFilterModified={onFloatingFilterChanged}
                                            suppressRowClickSelection={true}
                                            enableBrowserTooltips={true}
                                        >
                                            <AgGridColumn field="CostingId" hide ></AgGridColumn>
                                            {isMasterAssociatedWithCosting && <AgGridColumn width={185} field="CostingNumber" tooltipField='CostingNumber' headerName="Costing Number"></AgGridColumn>}
                                            {isMasterAssociatedWithCosting && <AgGridColumn width={110} field="PartNo" tooltipField="PartNo" headerName="Part No." cellRenderer='renderPart'></AgGridColumn>}
                                            {isMasterAssociatedWithCosting && <AgGridColumn width={120} field="PartName" tooltipField="PartName" cellRenderer='descriptionFormatter' headerName="Part Name"></AgGridColumn>}
                                            {isMasterAssociatedWithCosting && <AgGridColumn width={120} field="PartType" tooltipField="PartType" cellRenderer='partTypeFormatter' headerName="Part Type"></AgGridColumn>}
                                            {isMasterAssociatedWithCosting && <AgGridColumn width={130} field="RevisionNumber" tooltipField="RevisionNumber" cellRenderer='revisionFormatter' headerName="Revision No."></AgGridColumn>}
                                            {isMasterAssociatedWithCosting && <AgGridColumn width={160} field="InfoCategory" tooltipField="InfoCategory" cellRenderer='hyphenFormatter' headerName="Category"></AgGridColumn>}
                                            {isRMDomesticOrRMImport === true && <AgGridColumn width={120} field="RMName" tooltipField="RMName" headerName="RM Name" ></AgGridColumn>}
                                            {isRMDomesticOrRMImport === true && <AgGridColumn width={120} field="RMGrade" tooltipField="RMGrade" headerName="Grade" ></AgGridColumn>}
                                            {isMachineRate && <AgGridColumn width={145} field="ProcessName" tooltipField="ProcessName" headerName="Process Name"></AgGridColumn>}
                                            {isMachineRate && <AgGridColumn width={150} field="MachineNumber" tooltipField="MachineNumber" headerName="Machine Number"></AgGridColumn>}
                                            {isBOPDomesticOrImport === true && <AgGridColumn width={130} field="BoughtOutPartCode" tooltipField="BoughtOutPartCode" headerName={`${showBopLabel()} Number`} cellRenderer={"bopNumberFormatter"}></AgGridColumn>}
                                            {isBOPDomesticOrImport === true && <AgGridColumn width={130} field="BoughtOutPartName" tooltipField="BoughtOutPartName" cellRenderer='BoughtOutPartName' headerName={`${showBopLabel()} Name`}></AgGridColumn>}
                                            {isSurfaceTreatmentOrOperation === true && <AgGridColumn width={185} field="OperationName" tooltipField="OperationName" headerName="Operation Name"></AgGridColumn>}
                                            {isSurfaceTreatmentOrOperation === true && <AgGridColumn width={185} field="OperationCode" tooltipField="OperationCode" headerName="Operation Code"></AgGridColumn>}
                                            {!isMultiTechnology && verifyList && verifyList[0]?.CostingHeadId !== CBCTypeId && <AgGridColumn width={140} field="VendorName" tooltipField="VendorName" cellRenderer='renderVendor' headerName={`${vendorLabel} (Code)`}></AgGridColumn>}
                                            {!isMultiTechnology && verifyList && verifyList[0]?.CostingHeadId === CBCTypeId && <AgGridColumn width={140} field="CustomerName" tooltipField="CustomerName" cellRenderer='renderCustomer' headerName="Customer (Code)"></AgGridColumn>}
                                            <AgGridColumn width={120} field="PlantName" tooltipField="PlantName" cellRenderer='renderPlant' headerName="Plant (Code)"></AgGridColumn>
                                            {!isMultiTechnology && !isOverHeadProfit && !isCombinedProcess && getConfigurationKey().IsSourceExchangeRateNameVisible && <AgGridColumn field="ExchangeRateSourceName" headerName="Exchange Rate Source"></AgGridColumn>}
                                            {!isMultiTechnology && !isOverHeadProfit && !isCombinedProcess && <AgGridColumn field={isMasterAssociatedWithCosting ? "CostingCurrency" : "Currency"} tooltipField='Currency' editable='false' headerName="Currency" headerComponent={'currencyHeader'} minWidth={140} ></AgGridColumn>}
                                            {isMasterAssociatedWithCosting && !isMultiTechnology && <AgGridColumn width={190} field="POPrice" tooltipField="POPrice" headerName={`Existing Net Cost (Currency)`} cellRenderer='priceFormatter'></AgGridColumn>}
                                            {isSurfaceTreatmentOrOperation === true && <AgGridColumn width={185} field="ForType" headerName="Operation Type" minWidth={190}></AgGridColumn>}
                                            {isSurfaceTreatmentOrOperation === true && operationTypes.includes('Welding') && <AgGridColumn width={185} field="OldOperationConsumption" tooltipField="OldOperationRate" headerName="Consumption"></AgGridColumn>}
                                            {isSurfaceTreatmentOrOperation === true && operationTypes.includes('Welding') && <AgGridColumn width={220} field="OldOperationBasicRate" tooltipField="OldOperationRate" headerName="Existing Welding Material Rate/kg"></AgGridColumn>}
                                            {isSurfaceTreatmentOrOperation === true && operationTypes.includes('Welding') && <AgGridColumn width={220} field="NewOperationBasicRate" tooltipField="NewOperationRate" headerName="Revised Welding Material Rate/kg"></AgGridColumn>}
                                            {simulationApplicability?.value !== APPLICABILITY_PART_SIMULATION && <AgGridColumn field='Currency' headerName='Master Currency' />}
                                            {isSurfaceTreatmentOrOperation === true && <AgGridColumn width={185} field="OldOperationRate" tooltipField="OldOperationRate" headerName="Existing Rate"></AgGridColumn>}
                                            {isSurfaceTreatmentOrOperation === true && <AgGridColumn width={185} field="NewOperationRate" tooltipField="NewOperationRate" headerName="Revised Rate"></AgGridColumn>}

                                            {isBOPDomesticOrImport === true && <AgGridColumn width={230} field="OldBoughtOutPartRate" tooltipField="OldBoughtOutPartRate" headerName="Existing Basic Rate (Master Currency)" cellRenderer={existingBasicFormatter}></AgGridColumn>}
                                            {isBOPDomesticOrImport === true && <AgGridColumn width={230} field="NewBoughtOutPartRate" tooltipField="NewBoughtOutPartRate" cellRenderer='newBRFormatter' headerName="Revised Basic Rate (Master Currency)"></AgGridColumn>}

                                            {/* {isBOPDomesticOrImport === true && <AgGridColumn width={140} field="OldNetLandedCost" tooltipField='OldNetLandedCost' headerName='Existing Net Landed Cost (Currency)' cellRenderer={priceFormatter} ></AgGridColumn>}
                                            {isBOPDomesticOrImport === true && <AgGridColumn width={140} field="NewNetLandedCost" tooltipField='NewNetLandedCost' headerName='Revised Net Landed Cost (Currency)' cellRenderer={priceFormatter} ></AgGridColumn>} */}

                                            {isMachineRate && <AgGridColumn width={145} field="OldMachineRate" tooltipField="OldMachineRate" headerName="Existing Machine Rate"></AgGridColumn>}
                                            {isMachineRate && <AgGridColumn width={150} field="NewMachineRate" tooltipField="NewMachineRate" headerName="Revised Machine Rate"></AgGridColumn>}


                                            {isRMDomesticOrRMImport === true && <AgGridColumn width={230} field="OldBasicRate" tooltipField="OldBasicRate" headerName="Existing Basic Rate (Master Currency)"></AgGridColumn>}
                                            {isRMDomesticOrRMImport === true && <AgGridColumn width={230} field="NewBasicRate" tooltipField="NewBasicRate" cellRenderer='newRMBasicRateFormatter' headerName="Revised Basic Rate (Master Currency)"></AgGridColumn>}
                                            {(isRMDomesticOrRMImport === true || isBOPDomesticOrImport) && <AgGridColumn width={230} field="OldOtherNetCost" cellRenderer={zeroFormatter} headerName="Existing Other Cost (Master Currency)"></AgGridColumn>}
                                            {(isRMDomesticOrRMImport === true || isBOPDomesticOrImport) && <AgGridColumn width={230} field="NewOtherNetCost" cellRenderer={zeroFormatter} headerName="Revised Other Cost (Master Currency)"></AgGridColumn>}
                                            {((isRMDomesticOrRMImport === true || isBOPDomesticOrImport) && verifyList && verifyList[0]?.CostingHeadId === ZBCTypeId) && <AgGridColumn width={230} field="OldNetConditionCost" cellRenderer={zeroFormatter} headerName="Existing Condition Cost (Master Currency)"></AgGridColumn>}
                                            {((isRMDomesticOrRMImport === true || isBOPDomesticOrImport) && verifyList && verifyList[0]?.CostingHeadId === ZBCTypeId) && <AgGridColumn width={230} field="NewNetConditionCost" cellRenderer={zeroFormatter} headerName="Revised Condition Cost (Master Currency)"></AgGridColumn>}


                                            {isRMDomesticOrRMImport === true && <AgGridColumn width={230} field="OldScrapRate" tooltipField="OldScrapRate" headerName="Existing Scrap Rate (Master Currency)"></AgGridColumn>}
                                            {isRMDomesticOrRMImport === true && <AgGridColumn width={230} field="NewScrapRate" tooltipField="NewScrapRate" cellRenderer='newSRFormatter' headerName="Revised Scrap Rate (Master Currency)" ></AgGridColumn>}
                                            {isRMDomesticOrRMImport === true && <AgGridColumn field="RawMaterialId" hide ></AgGridColumn>}

                                            {(isRMDomesticOrRMImport || isBOPDomesticOrImport) && <AgGridColumn width={230} field="OldNetLandedCost" tooltipField="OldNetLandedCost" headerName="Old Net Landed Cost(Master Currency)" cellRenderer='hyphenFormatter'></AgGridColumn>}
                                            {(isRMDomesticOrRMImport || isBOPDomesticOrImport) && <AgGridColumn width={230} field="NewNetLandedCost" tooltipField="NewNetLandedCost" headerName="New Net Landed Cost(Master Currency)" cellRenderer='newNetLandedCostFormatter'></AgGridColumn>}

                                            {/* {getConfigurationKey().IsSourceExchangeRateNameVisible && <AgGridColumn field="ExchangeRateSourceName" headerName="Exchange Rate Source"></AgGridColumn>}
                                            {isExchangeRate && <AgGridColumn width={130} field="Currency" tooltipField="Currency" headerName="Currency"></AgGridColumn>} */}
                                            {/* {isExchangeRate && <AgGridColumn width={130} field="POPrice" tooltipField="POPrice" headerName="Existing Net Cost (INR)"></AgGridColumn>} */}
                                            {isExchangeRate && <AgGridColumn width={145} field="OldExchangeRate" tooltipField="OldExchangeRate" headerName="Existing Exchange Rate"></AgGridColumn>}
                                            {isExchangeRate && <AgGridColumn width={150} field="NewExchangeRate" tooltipField="NewExchangeRate" cellRenderer='newExchangeRateFormatter' headerName="Revised Exchange Rate"></AgGridColumn>}

                                            {isCombinedProcess && <AgGridColumn width={130} field="NewPOPrice" headerName={`Revised Net Cost (${reactLocalStorage.getObject("baseCurrency")})`} cellRenderer='combinedProcessCostFormatter'></AgGridColumn>}
                                            {isCombinedProcess && <AgGridColumn width={145} field="OldNetCC" headerName="Existing CC" cellRenderer='combinedProcessCostFormatter'></AgGridColumn>}
                                            {isCombinedProcess && <AgGridColumn width={150} field="NewNetCC" cellRenderer='combinedProcessCostFormatter' headerName="Revised CC" ></AgGridColumn>}

                                            {isMultiTechnology && <AgGridColumn width={150} field="Delta" tooltipField="Delta" headerName="Delta"></AgGridColumn>}
                                            {isMultiTechnology && <AgGridColumn width={150} field="DeltaSign" tooltipField="DeltaSign" headerName="DeltaSign"></AgGridColumn>}
                                            {isMultiTechnology && <AgGridColumn width={150} field="NetCost" tooltipField="NetCost" headerName="Net Cost"></AgGridColumn>}
                                            {isMultiTechnology && <AgGridColumn width={150} field="SOBPercentage" tooltipField="SOBPercentage" headerName="SOB Percentage"></AgGridColumn>}
                                            {isMultiTechnology && <AgGridColumn width={150} field="OldPOPrice" tooltipField="OldPOPrice" headerName="Existing Net Cost"></AgGridColumn>}
                                            {isMultiTechnology && <AgGridColumn width={150} field="NewPOPrice" tooltipField="NewPOPrice" headerName="Revised Net Cost"></AgGridColumn>}

                                            {isOverHeadProfit === true && <AgGridColumn width={120} field="OverheadName" cellRenderer='overHeadFormatter' tooltipField="OverheadName" headerName="Overhead Name" ></AgGridColumn>}
                                        </AgGridReact >}
                                        {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
                                    </div >
                                </div >
                            </div >
                        </Col >
                    </Row >
                    <Row className={`sf-btn-footer no-gutters justify-content-between bottom-footer ${showTour ? '' : 'sticky-btn-footer'}`}>
                        <div className="col-sm-12 text-right bluefooter-butn run-simulation">
                            {/* {!isAssemblyCosting && */}
                            {/* <button onClick={runSimulation} type="submit" disabled={hideRunButton || runSimulationPermission} className="user-btn mr5 save-btn"                    > */}
                            {!isMasterAssociatedWithCosting && <DatePicker
                                selected={DayTime(effectiveDate).isValid() ? new Date(effectiveDate) : ''}
                                dateFormat="dd/MM/yyyy"
                                showMonthDropdown
                                showYearDropdown
                                readonly="readonly"
                                onBlur={() => null}
                                autoComplete={'off'}
                                disabledKeyboardNavigation
                                disabled={true}
                                className='form-control bottom-disabled-date'
                            />}
                            <button onClick={runSimulation} id="run-simulation-btn" type="submit" className="user-btn mr5 save-btn">
                                <div className={"Run-icon"}>
                                </div>{" "}
                                {"RUN SIMULATION"}
                            </button>
                        </div>
                    </Row >
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
                    simulationTechnologyId={simulationTechnologyId}
                    vendorId={vendorId}
                    isOpen={simulationDrawer}
                    closeDrawer={closeDrawer}
                    date={effectiveDate}
                    objs={objs}
                    anchor={"right"}
                    masterId={selectedMasterForSimulation.value}
                    technology={props.technology}
                    token={props?.token}
                    minimumPoPrice={minimumPoPrice}
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