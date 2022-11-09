import React, { useEffect, useState } from 'react';
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm } from '../../layout/HookFormInputs';
import RMDomesticListing from '../../masters/material-master/RMDomesticListing';
import RMImportListing from '../../masters/material-master/RMImportListing';
import { Row, Col } from 'reactstrap'
import { Controller, useForm } from 'react-hook-form';
import { getMasterSelectListSimulation, getTokenSelectListAPI, setSelectedRowForPagination, setMasterForSimulation, setTechnologyForSimulation, setTokenCheckBoxValue, setTokenForSimulation, getSelectListOfMasters, setVendorForSimulation } from '../actions/Simulation';
import { useDispatch, useSelector } from 'react-redux';
import SimulationUploadDrawer from './SimulationUploadDrawer';
import { BOPDOMESTIC, BOPIMPORT, EXCHNAGERATE, MACHINERATE, OPERATIONS, RMDOMESTIC, RMIMPORT, SURFACETREATMENT, RM_MASTER_ID, searchCount, COMBINED_PROCESS } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { CombinedProcessSimulation, getTechnologyForSimulation, OperationSimulation, RMDomesticSimulation, RMImportSimulation, SurfaceTreatmentSimulation, MachineRateSimulation, BOPDomesticSimulation, BOPImportSimulation, IdForMultiTechnology, ASSEMBLY_TECHNOLOGY } from '../../../config/masterData';
import RMSimulation from './SimulationPages/RMSimulation';
import { getCostingSpecificTechnology, getCostingTechnologySelectList } from '../../costing/actions/Costing';
import CostingSimulation from './CostingSimulation';
import WarningMessage from '../../common/WarningMessage';
import MachineRateListing from '../../masters/machine-master/MachineRateListing';
import BOPDomesticListing from '../../masters/bop-master/BOPDomesticListing';
import BOPImportListing from '../../masters/bop-master/BOPImportListing';
import ExchangeRateListing from '../../masters/exchange-rate-master/ExchangeRateListing';
import OperationListing from '../../masters/operation/OperationListing';
import { setFilterForRM } from '../../masters/actions/Material';
import { applyEditCondSimulation, checkForNull, getFilteredData, isUploadSimulation, loggedInUserId, userDetails } from '../../../helper';
import ERSimulation from './SimulationPages/ERSimulation';
import CPSimulation from './SimulationPages/CPSimulation';
import { ProcessListingSimulation } from './ProcessListingSimulation';
import { getVendorWithVendorCodeSelectList } from '../../../actions/Common';
import OperationSTSimulation from './SimulationPages/OperationSTSimulation';
import MRSimulation from './SimulationPages/MRSimulation';
import BDSimulation from './SimulationPages/BDSimulation';
import ScrollToTop from '../../common/ScrollToTop';
import LoaderCustom from '../../common/LoaderCustom';
import _ from 'lodash'
import AssemblySimulationListing from './AssemblySimulationListing';
import VerifySimulation from './VerifySimulation';
import { reactLocalStorage } from 'reactjs-localstorage';
import { autoCompleteDropdown } from '../../common/CommonFunctions';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
function Simulation(props) {

    const { register, control, setValue, formState: { errors }, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const { selectedMasterForSimulation, selectedTechnologyForSimulation, selectedVendorForSimulation, getTokenSelectList, tokenCheckBoxValue, tokenForSimulation } = useSelector(state => state.simulation)

    const [master, setMaster] = useState({})
    const [technology, setTechnology] = useState({})
    const [showMasterList, setShowMasterList] = useState(false)
    const [showUploadDrawer, setShowDrawer] = useState(false)
    const [showEditTable, setShowEditTable] = useState(false)
    const [isHide, setIsHide] = useState(true)
    const [isbulkUpload, setIsBulkUpload] = useState(false)
    const [tableData, setTableData] = useState([])
    const [rowCount, setRowCount] = useState({})
    const [editWarning, setEditWarning] = useState(true)

    const [vendorDropdown, setVendorDropdown] = useState([])
    const [filterStatus, setFilterStatus] = useState(`Please check the ${(selectedMasterForSimulation?.label)} that you want to edit.`)
    const [token, setToken] = useState([])
    const [showTokenDropdown, setShowTokenDropdown] = useState(false)
    const [selectionForListingMasterAPI, setSelectionForListingMasterAPI] = useState('')
    const [loader, setloader] = useState(false)
    const [masterSummaryDrawerState, setmasterSummaryDrawerState] = useState(props.isCancelClicked)
    const [isTechnologyDisable, setIsTechnologyDisable] = useState(false)
    const [vendor, setVendor] = useState({})
    const [inputLoader, setInputLoader] = useState(false)
    const [showverifyPage, setShowVerifyPage] = useState(false)
    const [vendorName, setVendorName] = useState({})
    const partType = (checkForNull(selectedMasterForSimulation?.value) === ASSEMBLY_TECHNOLOGY) ? true : false

    const dispatch = useDispatch()
    const vendorSelectList = useSelector(state => state.comman.vendorWithVendorCodeSelectList)
    useEffect(() => {
        setInputLoader(true)
        dispatch(setTokenForSimulation([]))
        dispatch(getMasterSelectListSimulation(loggedInUserId(), () => { }))
        dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
        dispatch(getVendorWithVendorCodeSelectList(() => { setInputLoader(false) }))

        // ASSEMBLY TECHNOLOGY
        setInputLoader(true)
        dispatch(getSelectListOfMasters(() => { }))
        dispatch(getCostingTechnologySelectList(() => { }))

        setShowEditTable(false)
        if (props.isRMPage) {
            setValue('Technology', { label: selectedTechnologyForSimulation?.label, value: selectedTechnologyForSimulation?.value })
            setValue('Masters', { label: selectedMasterForSimulation?.label, value: selectedMasterForSimulation?.value })
            setValue('Vendor', { label: selectedVendorForSimulation?.label, value: selectedVendorForSimulation?.value })
            setValue('token', { label: tokenForSimulation?.label, value: tokenForSimulation?.value })

            setMaster({ label: selectedMasterForSimulation?.label, value: selectedMasterForSimulation?.value })
            setTechnology({ label: selectedTechnologyForSimulation?.label, value: selectedTechnologyForSimulation?.value })
            setVendor({ label: selectedVendorForSimulation?.label, value: selectedVendorForSimulation?.value })
            setEditWarning(applyEditCondSimulation(getValues('Masters').value))
            setShowMasterList(true)
        }
        return () => {
            reactLocalStorage?.setObject('vendorData', [])
        }
    }, [])

    const masterList = useSelector(state => state.simulation.masterSelectListSimulation)
    const rmDomesticListing = useSelector(state => state.material.rmDataList)
    const rmImportListing = useSelector(state => state.material.rmImportDataList)
    const bopDomesticList = useSelector(state => state.material.bopDomesticList)
    const bopImportList = useSelector(state => state.material.bopImportList)
    const exchangeRateDataList = useSelector(state => state.material.exchangeRateDataList)
    const operationList = useSelector(state => state.material.operationList)

    const technologySelectList = useSelector(state => state.costing.costingSpecifiTechnology)
    useEffect(() => {
        // CHECK FOR ASSEMBLY TECHNOLOGY APPLIED BECAUSE WE DON'T WANT TO DO LINKED TOKEN API FOR IT
        if (technology && (technology?.value !== undefined && technology?.value !== '' && partType)) {
            setShowTokenDropdown(false)
        }
    }, [selectedTechnologyForSimulation])

    useEffect(() => {
        renderListing('vendor')
    }, [vendorSelectList])

    useEffect(() => {
        renderListing('vendor')
    }, [vendorSelectList])

    const handleMasterChange = (value) => {
        dispatch(setFilterForRM({ costingHeadTemp: '', plantId: '', RMid: '', RMGradeid: '', Vendorid: '' }))
        dispatch(setTokenForSimulation([]))
        setMaster(value)
        setShowMasterList(false)
        setShowTokenDropdown(false)
        setTechnology({ label: '', value: '' })
        setValue('Technology', '')
        setValue('token', '')
        setIsTechnologyDisable(false)
        dispatch(setMasterForSimulation(value))
        if (value !== '' && (Object.keys(getValues('Technology')).length > 0 || !getTechnologyForSimulation.includes(value.value))) {
            setSelectionForListingMasterAPI('Master')
            setShowTokenDropdown(true)
            setShowMasterList(true)
            let obj = {
                technologyId: value.value,
                loggedInUserId: loggedInUserId(),
                simulationTechnologyId: (String(master.value) === BOPDOMESTIC || String(master.value) === BOPIMPORT || String(master.value) === EXCHNAGERATE || master.value === undefined) ? 0 : master.value,
                /**************************************** UNCOMMENT THIS WHENEVER WE WILL APPLY VENDOR CHECK ********************************************/
                // vendorId: Object.keys(vendor).length === 0 ? EMPTY_GUID : vendor.value
            }
            dispatch(getTokenSelectListAPI(obj, () => { }))
        }
        if (checkForNull(value.value) === ASSEMBLY_TECHNOLOGY) {
            // SINCE WE ARE IN MASTER HANDLE CHANGE, TO SET VALUE OF ASSEMBLY TECHNOLOGY IN DROPDOWN WE NEED TO GET DYNAMIC VALUE FROM DROPDOWN API'S REDUCER
            setShowTokenDropdown(false)
            dispatch(setTechnologyForSimulation(value))
        }
        setEditWarning(applyEditCondSimulation(value.value))
        setFilterStatus(`Please check the ${(value.label)} that you want to edit.`)
    }

    const handleTechnologyChange = (value) => {
        if (checkForNull(value?.value) === ASSEMBLY_TECHNOLOGY) {
            setTechnology(value)
            setShowMasterList(false)
            dispatch(setTechnologyForSimulation(value))
            setShowTokenDropdown(false)
            setVendor({ label: '', value: '' })
            setValue('Vendor', { label: '', value: '' })
        } else {
            dispatch(setFilterForRM({ costingHeadTemp: '', plantId: '', RMid: '', RMGradeid: '', Vendorid: '' }))
            setTechnology(value)
            setShowMasterList(false)
            setEditWarning(true);
            setToken([])
            dispatch(setTokenForSimulation([]))
            setValue('token', '')
            setSelectionForListingMasterAPI('Master')
            setmasterSummaryDrawerState(false)
            setTimeout(() => {
                dispatch(setTechnologyForSimulation(value))
                let obj = {
                    technologyId: value.value,
                    loggedInUserId: loggedInUserId(),
                    simulationTechnologyId: master.value
                }
                dispatch(getTokenSelectListAPI(obj, () => { }))
                if (value !== '' && Object.keys(master).length > 0) {
                    setShowMasterList(true)
                    setShowTokenDropdown(true)
                }
            }, 100);
        }
    }

    const handleVendorChange = (value) => {
        setShowMasterList(false)
        setToken([])
        setValue('token', '')
        setSelectionForListingMasterAPI('Master')
        setTimeout(() => {
            setValue('Vendor', '')
            dispatch(setTechnologyForSimulation(value))
            if (value !== '' && Object.keys(master).length > 0 && !(master.value === '3')) {
                let obj = {
                    technologyId: value.value,
                    loggedInUserId: loggedInUserId(),
                    simulationTechnologyId: master.value,
                    /**************************************** UNCOMMENT THIS WHENEVER WE WILL APPLY VENDOR CHECK ********************************************/
                    // vendorId: Object.keys(vendor).length === 0 ? EMPTY_GUID : vendor.value
                }
                dispatch(getTokenSelectListAPI(obj, () => { }))
                if (value !== '' && Object.keys(master).length > 0) {
                    setShowMasterList(true)
                    setShowTokenDropdown(true)
                }

            }
        }, 100);
    }



    const handleTokenChange = (value) => {
        setToken(value)
        dispatch(setTokenForSimulation(value))
    }

    const returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData && TempData.map((item) => {
            if (item.CostingHead === true) {
                item.CostingHead = 'Vendor Based'
            } else if (item.CostingHead === false) {
                item.CostingHead = 'Zero Based'
            }
            return item
        })
        if (Number(master.value) === Number(COMBINED_PROCESS)) {
            temp = TempData
        }
        // if (rmDomesticListing && rmDomesticListing.length > 0 || rmImportListing && rmImportListing.length > 0) {
        //     const edit = editTable()

        // }

        switch (Number(master.value)) {
            case Number(SURFACETREATMENT):
                temp = TempData && TempData.map((item) => {
                    if (item.CostingHead === true) {
                        item.IsVendor = 'Vendor Based'
                    } else if (item.CostingHead === false) {
                        item.IsVendor = 'Zero Based'
                    }
                    return item
                })
                break;
            case Number(OPERATIONS):
                temp = TempData && TempData.map((item) => {
                    if (item.CostingHead === true) {
                        item.IsVendor = 'Vendor Based'
                    } else if (item.CostingHead === false) {
                        item.IsVendor = 'Zero Based'
                    }
                    return item
                })
                break;
            case Number(MACHINERATE):
                temp = TempData
                break;
            case Number(BOPDOMESTIC):
            case Number(BOPIMPORT):
                temp = TempData && TempData.map((item) => {
                    if (item.IsVendor === true) {
                        item.IsVendor = 'Vendor Based'
                    } else if (item.IsVendor === false) {
                        item.IsVendor = 'Zero Based'
                    }
                    return item
                })
                break;
            default:
                break;
        }

        return (<ExcelSheet data={temp} name={master.label}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
        </ExcelSheet>);
    }

    const changeSetLoader = (value) => {
        setloader(value)
    }

    const changeTokenCheckBox = (value) => {
        dispatch(setTokenCheckBoxValue(value))
    }

    const cancelVerifyPage = () => {
        setShowVerifyPage(false)
    }

    const cancelViewPage = () => {
        setIsHide(false)
    }

    const cancelSimulationListingPage = () => {
        setShowMasterList(false)

        setValue('Vendor', { label: '', value: '' })
        setValue('Technology', '')
        setValue('Masters', '')

        dispatch(setVendorForSimulation({ label: '', value: '' }))
        dispatch(setTechnologyForSimulation({ label: '', value: '' }))
        dispatch(setMasterForSimulation({ label: '', value: '' }))
    }

    const renderModule = (value) => {
        let tempValue = [{ SimulationId: tokenForSimulation?.value }]

        let temp = userDetails().Department
        temp = temp && temp.map((item) => {
            item = item.DepartmentCode
            return item
        })
        let obj = {

            MasterId: master.value,
            TechnologyId: technology.value,
            // DepartmentCode: temp.join(),
            DepartmentCode: '',
            SimulationIds: tempValue
        }
        if (partType) {
            // return <VerifySimulation token={token} cancelVerifyPage={cancelVerifyPage} assemblyTechnology={true} technology={technology} closeSimulation={closeSimulation} />
            return <AssemblySimulationListing isOperation={true} cancelRunSimulation={cancelRunSimulation} list={tableData} isbulkUpload={isbulkUpload} technology={technology} master={master.value} rowCount={rowCount} tokenForMultiSimulation={{}} cancelViewPage={cancelViewPage} showHide={showHide} cancelSimulationListingPage={cancelSimulationListingPage} />
        } else {
            switch (value.value) {
                case RMDOMESTIC:
                    return (<RMDomesticListing isSimulation={true} technology={technology.value} isMasterSummaryDrawer={masterSummaryDrawerState ? props.isMasterSummaryDrawer : false} apply={editTable} objectForMultipleSimulation={obj} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} ListFor='simulation' />)
                case RMIMPORT:
                    return (<RMImportListing isSimulation={true} technology={technology.value} isMasterSummaryDrawer={masterSummaryDrawerState ? props.isMasterSummaryDrawer : false} apply={editTable} objectForMultipleSimulation={obj} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} ListFor='simulation' />)
                case MACHINERATE:
                    return (<MachineRateListing isSimulation={true} isMasterSummaryDrawer={false} technology={technology.value} objectForMultipleSimulation={obj} apply={editTable} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} ListFor='simulation' />)
                case BOPDOMESTIC:
                    return (<BOPDomesticListing isSimulation={true} isMasterSummaryDrawer={masterSummaryDrawerState ? props.isMasterSummaryDrawer : false} technology={technology.value} objectForMultipleSimulation={obj} apply={editTable} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} ListFor='simulation' />)
                case BOPIMPORT:
                    return (<BOPImportListing isSimulation={true} isMasterSummaryDrawer={masterSummaryDrawerState ? props.isMasterSummaryDrawer : false} technology={technology.value} objectForMultipleSimulation={obj} apply={editTable} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} ListFor='simulation' />)
                case EXCHNAGERATE:
                    return (<ExchangeRateListing isSimulation={true} technology={technology.value} apply={editTable} tokenArray={tokenForSimulation} objectForMultipleSimulation={obj} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} />)
                case OPERATIONS:
                    return (<OperationListing isSimulation={true} isMasterSummaryDrawer={masterSummaryDrawerState ? props.isMasterSummaryDrawer : false} technology={technology.value} objectForMultipleSimulation={obj} apply={editTable} isOperationST={OPERATIONS} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} ListFor='simulation' stopAPICall={false} />)
                case SURFACETREATMENT:
                    return (<OperationListing isSimulation={true} isMasterSummaryDrawer={masterSummaryDrawerState ? props.isMasterSummaryDrawer : false} technology={technology.value} objectForMultipleSimulation={obj} apply={editTable} isOperationST={SURFACETREATMENT} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} ListFor='simulation' stopAPICall={false} />)
                case COMBINED_PROCESS:
                    return (<ProcessListingSimulation isSimulation={true} technology={technology.value} vendorId={vendor.value} objectForMultipleSimulation={obj} apply={editTable} tokenArray={token} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} />)
                // case BOPIMPORT:
                //     return (<OverheadListing isSimulation={true} technology={technology.value} apply={editTable} />)
                // case BOPIMPORT:
                //     return (<ProfitListing isSimulation={true} technology={technology.value} apply={editTable} />)
                default:
                    return <div className="empty-table-paecholder" />;
            }
        }



        // let tempValue = [{ SimulationId: tokenForSimulation?.value }]
        // let obj = {
        //     MasterId: master.value,
        //     TechnologyId: technology.value,
        //     // DepartmentCode: temp.join(),
        //     DepartmentCode: '',
        //     SimulationIds: tempValue
        // }
        // switch (value.value) {
        //     case RMDOMESTIC:
        //         return (<RMDomesticListing isSimulation={true} technology={technology.value} isMasterSummaryDrawer={masterSummaryDrawerState ? props.isMasterSummaryDrawer : false} apply={editTable} objectForMultipleSimulation={obj} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} />)
        //     case RMIMPORT:
        //         return (<RMImportListing isSimulation={true} technology={technology.value} isMasterSummaryDrawer={masterSummaryDrawerState ? props.isMasterSummaryDrawer : false} apply={editTable} objectForMultipleSimulation={obj} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} />)
        //     case MACHINERATE:
        //         return (<MachineRateListing isSimulation={true} isMasterSummaryDrawer={false} technology={technology.value} objectForMultipleSimulation={obj} apply={editTable} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} />)
        //     case BOPDOMESTIC:
        //         return (<BOPDomesticListing isSimulation={true} isMasterSummaryDrawer={masterSummaryDrawerState ? props.isMasterSummaryDrawer : false} technology={technology.value} objectForMultipleSimulation={obj} apply={editTable} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} />)
        //     case BOPIMPORT:
        //         return (<BOPImportListing isSimulation={true} isMasterSummaryDrawer={masterSummaryDrawerState ? props.isMasterSummaryDrawer : false} technology={technology.value} objectForMultipleSimulation={obj} apply={editTable} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} />)
        //     case EXCHNAGERATE:
        //         return (<ExchangeRateListing isSimulation={true} technology={technology.value} apply={editTable} tokenArray={tokenForSimulation} objectForMultipleSimulation={obj} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} />)
        //     case OPERATIONS:
        //         return (<OperationListing isSimulation={true} isMasterSummaryDrawer={masterSummaryDrawerState ? props.isMasterSummaryDrawer : false} technology={technology.value} objectForMultipleSimulation={obj} apply={editTable} isOperationST={OPERATIONS} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} />)
        //     case SURFACETREATMENT:
        //         return (<OperationListing isSimulation={true} isMasterSummaryDrawer={masterSummaryDrawerState ? props.isMasterSummaryDrawer : false} technology={technology.value} objectForMultipleSimulation={obj} apply={editTable} isOperationST={SURFACETREATMENT} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} />)
        //     // case BOPIMPORT:
        //     //     return (<OverheadListing isSimulation={true} technology={technology.value} apply={editTable} />)
        //     // case BOPIMPORT:
        //     //     return (<ProfitListing isSimulation={true} technology={technology.value} apply={editTable} />)
        //     default:
        //         return <div className="empty-table-paecholder" />;
        // }
    }


    const renderColumn = (fileName) => {
        switch (fileName) {
            case RMDOMESTIC:
                return returnExcelColumn(RMDomesticSimulation, tableData && tableData ? tableData : [])
            case RMIMPORT:
                return returnExcelColumn(RMImportSimulation, tableData && tableData.length > 0 ? tableData : [])

            case COMBINED_PROCESS:
                return returnExcelColumn(CombinedProcessSimulation, tableData && tableData.length > 0 ? tableData : [])
            // return returnExcelColumn(CombinedProcessSimulation, getFilteredRMData(rmDomesticListing) && getFilteredRMData(rmDomesticListing).length > 0 ? getFilteredRMData(rmImportListing) : [])
            case SURFACETREATMENT:
                return returnExcelColumn(SurfaceTreatmentSimulation, tableData && tableData.length > 0 ? tableData : [])
            case OPERATIONS:
                return returnExcelColumn(OperationSimulation, tableData && tableData.length > 0 ? tableData : [])
            case MACHINERATE:
                return returnExcelColumn(MachineRateSimulation, tableData && tableData.length > 0 ? tableData : [])
            case BOPDOMESTIC:
                return returnExcelColumn(BOPDomesticSimulation, tableData && tableData.length > 0 ? tableData : [])
            case BOPIMPORT:
                return returnExcelColumn(BOPImportSimulation, tableData && tableData.length > 0 ? tableData : [])
            // case BOPIMPORT:
            //     return returnExcelColumn(OverheadProfitSimulation, tableData && tableData.length > 0 ? tableData : [])
            default:
                return 'foo';
        }
    }

    const renderListing = (label) => {
        let temp = []

        if (label === 'masters') {
            // temp.push({ label: '-', value: '0' })
            masterList && masterList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }

        if (label === 'technology') {
            if (partType) {
                // IdForMultiTechnology.includes(String(value.value))
                technologySelectList && technologySelectList.map((item) => {
                    if (item.Value === '0') return false
                    if (IdForMultiTechnology.includes(String(item?.Value))) temp.push({ label: item.Text, value: item.Value })
                    return null
                })
                return temp

            } else {
                technologySelectList && technologySelectList.map((item) => {
                    if (item.Value === '0') return false
                    temp.push({ label: item.Text, value: item.Value })
                    return null
                })
                return temp
            }
        }

        if (label === 'vendor') {
            vendorSelectList && vendorSelectList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            setVendorDropdown(temp)

            return temp
        }
        if (label === 'token') {
            getTokenSelectList && getTokenSelectList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
    }

    const editTableCancel = () => {
        setShowEditTable(false)
    }

    const closeSimulation = () => {
        setShowEditTable(true)
    }

    const cancelEditPage = () => {
        setShowEditTable(false)
        setIsBulkUpload(false)
        // setTableData([])
        setMaster({ label: master.label, value: master.value })
        setTechnology({ label: technology.label, value: technology.value })
        setTimeout(() => {
            setShowEditTable(true)
        }, 200);

        setSelectionForListingMasterAPI('Master')
        setTimeout(() => {
            dispatch(setTechnologyForSimulation(technology))
        }, 200);
    }
    const dataForSimulationFunction = () => {
        switch (master?.label) {
            case RMDOMESTIC:
                return (rmDomesticListing && rmDomesticListing.length === 0) ? true : false
            case RMIMPORT:
                return (rmImportListing && rmImportListing.length === 0) ? true : false
            case MACHINERATE:
                return (bopDomesticList && bopDomesticList.length === 0) ? true : false
            case BOPDOMESTIC:
                return (bopDomesticList && bopDomesticList.length === 0) ? true : false
            case BOPIMPORT:
                return (bopImportList && bopImportList.length === 0) ? true : false
            case EXCHNAGERATE:
                return (exchangeRateDataList && exchangeRateDataList.length === 0) ? true : false
            case OPERATIONS:
                return (operationList && operationList.length === 0) ? true : false
            case SURFACETREATMENT:
                return (operationList && operationList.length === 0) ? true : false
            // case BOPIMPORT:
            //     return (<OverheadListing isSimulation={true} technology={technology.value} apply={editTable} />)
            // case BOPIMPORT:
            //     return (<ProfitListing isSimulation={true} technology={technology.value} apply={editTable} />)

            default:
                return ''
        }
    }

    const cancelRunSimulation = () => {
        setMaster({ label: '', value: '' })
        setValue('Masters', { label: '', value: '' })
        setVendor({ label: '', value: '' })
        setValue('Vendor', { label: '', value: '' })

    }

    /**
    * @method closeGradeDrawer
    * @description  used to toggle grade Popup/Drawer
    */
    const closeDrawer = (e = '', tableData = {}, correctRow = 0, NoOfRowsWithoutChange = 0, isSaveButtonClicked) => {
        setShowDrawer(false)
        if (Object.keys(tableData).length > 0 && isSaveButtonClicked === true) {
            setTableData(tableData)
            setRowCount({ correctRow: correctRow, NoOfRowsWithoutChange: NoOfRowsWithoutChange })
            setShowEditTable(true)
            setIsBulkUpload(true)
        }
    }

    const editTable = (Data, length) => {
        let uniqeArray = _.uniq(Data)
        dispatch(setSelectedRowForPagination(uniqeArray))
        setTableData(uniqeArray)
        // alert('Hello')
        let flag = true;
        let vendorFlag = true;
        let plantFlag = true;
        if (length === 0 || length === undefined || length === null) {
            setFilterStatus(`Please check the ${(master.label)} that you want to edit.`)
        }
        switch (master.value) {
            case RMDOMESTIC:
                if (Data.length === 0) {
                    setEditWarning(true)
                    return false
                }
                Data && Data.forEach((element, index) => {
                    if (index !== 0) {
                        if (element.CostingHead !== Data[index - 1].CostingHead) {
                            setEditWarning(true);
                            flag = false
                        }
                        if (element.VendorName !== Data[index - 1].VendorName) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Vendor')
                            setEditWarning(true);
                            vendorFlag = false
                        }
                    }
                });
                if (flag === true && vendorFlag === true) {
                    (length !== 0) && setFilterStatus('Please filter out the Costing Head and Vendor')
                    setEditWarning(false)
                } if (flag === false && vendorFlag === false) {
                    (length !== 0) && setFilterStatus(`Please select one Costing Head, Vendor at a time.`)
                }

                break;
            case RMIMPORT:
                if (Data.length === 0) {
                    setEditWarning(true)
                    return false
                }
                Data && Data.forEach((element, index) => {

                    if (index !== 0) {
                        if (element.CostingHead !== Data[index - 1].CostingHead) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Costing Head')
                            setEditWarning(true);
                            flag = false
                        }
                        if (element.VendorName !== Data[index - 1].VendorName) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Vendor')
                            setEditWarning(true);
                            vendorFlag = false
                        }
                    }
                })
                if (flag === true && vendorFlag === true) {
                    (length !== 0) && setFilterStatus('Please filter out the Costing Head and Vendor')
                    setEditWarning(false)
                } if (flag === false && vendorFlag === false) {
                    (length !== 0) && setFilterStatus(`Please select one Costing Head, Vendor at a time.`)
                }
                break;

            case SURFACETREATMENT:
                if (Data.length === 0) {
                    setEditWarning(true)
                    return false
                }
                Data && Data.forEach((element, index) => {
                    if (index !== 0) {
                        if (element.CostingHead !== Data[index - 1].CostingHead) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Costing Head')
                            setEditWarning(true);
                            flag = false
                        }
                        if (element.VendorName !== Data[index - 1].VendorName) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Vendor')
                            setEditWarning(true);
                            vendorFlag = false
                        }
                    }
                });
                if (flag === true && vendorFlag === true) {
                    (length !== 0) && setFilterStatus('Please filter out the Costing Head and Vendor')
                    setEditWarning(false)
                } if (flag === false && vendorFlag === false) {
                    (length !== 0) && setFilterStatus(`Please select one Costing Head, Vendor at a time.`)
                }
                break;
            case OPERATIONS:
                if (Data.length === 0) {
                    setEditWarning(true)
                    return false
                }
                Data && Data.forEach((element, index) => {
                    if (index !== 0) {
                        if (element.CostingHead !== Data[index - 1].CostingHead) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Costing Head')
                            setEditWarning(true);
                            flag = false
                            return false
                        }
                        if (element.VendorName !== Data[index - 1].VendorName) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Vendor')
                            setEditWarning(true);
                            vendorFlag = false
                        }
                        // if (element.PlantId !== Data[index - 1].PlantId) {
                        //     // toastr.warning('Please select one Plant at a time.')
                        //     setEditWarning(true);
                        //     plantFlag = false
                        //     return false
                        // }
                    }
                });
                if (flag === true && vendorFlag === true && plantFlag === true) {
                    setEditWarning(false)
                } if (flag === false && vendorFlag === false) {
                    (length !== 0) && setFilterStatus(`Please select one Costing Head, Vendor at a time.`)
                } if (vendorFlag === false && plantFlag === false) {
                    (length !== 0) && setFilterStatus(`Please select one  Vendor, Plant at a time.`)
                } if (flag === false && plantFlag === false) {
                    (length !== 0) && setFilterStatus(`Please select one Costing Head, Plant at a time.`)
                } if (flag === false && vendorFlag === false && plantFlag === false) {
                    (length !== 0) && setFilterStatus('Please filter out the Costing Head, Vendor and Plant')
                }
                break;
            case MACHINERATE:
                if (Data.length === 0) {
                    setEditWarning(true)
                    return false
                }
                Data && Data.forEach((element, index) => {
                    if (index !== 0) {
                        if (element.CostingHead !== Data[index - 1].CostingHead) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Costing Head')
                            setEditWarning(true);
                            flag = false
                        }
                        if (element.VendorName !== Data[index - 1].VendorName) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Vendor')
                            setEditWarning(true);
                            vendorFlag = false
                        }
                        if (element.DestinationPlant !== Data[index - 1].DestinationPlant) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Plant')
                            setEditWarning(true);
                            plantFlag = false
                        }
                    }
                });
                if (flag === true && vendorFlag === true && plantFlag === true) {
                    setEditWarning(false)
                } if (flag === false && vendorFlag === false) {
                    (length !== 0) && setFilterStatus(`Please select one Costing Head, Vendor at a time.`)
                } if (vendorFlag === false && plantFlag === false) {
                    (length !== 0) && setFilterStatus(`Please select one  Vendor, Plant at a time.`)
                } if (flag === false && plantFlag === false) {
                    (length !== 0) && setFilterStatus(`Please select one Costing Head, Plant at a time.`)
                } if (flag === false && vendorFlag === false && plantFlag === false) {
                    (length !== 0) && setFilterStatus('Please filter out the Costing Head, Vendor and Plant')
                }
                break;
            case BOPDOMESTIC:
                if (Data.length === 0) {
                    setEditWarning(true)
                    return false
                }
                Data && Data.forEach((element, index) => {
                    if (index !== 0) {
                        if (element.IsVendor !== Data[index - 1].IsVendor) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Costing Head')
                            setEditWarning(true);
                            flag = false
                        }
                        if (element.Vendor !== Data[index - 1].Vendor) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Vendor')
                            setEditWarning(true);
                            vendorFlag = false
                        }
                        if (element.DestinationPlant !== Data[index - 1].DestinationPlant) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Plant')
                            setEditWarning(true);
                            plantFlag = false
                        }
                    }
                });
                if (flag === true && vendorFlag === true && plantFlag === true) {
                    setEditWarning(false)
                } if (flag === false && vendorFlag === false) {
                    (length !== 0) && setFilterStatus(`Please select one Costing Head, Vendor at a time.`)
                } if (vendorFlag === false && plantFlag === false) {
                    (length !== 0) && setFilterStatus(`Please select one  Vendor, Plant at a time.`)
                } if (flag === false && plantFlag === false) {
                    (length !== 0) && setFilterStatus(`Please select one Costing Head, Plant at a time.`)
                } if (flag === false && vendorFlag === false && plantFlag === false) {
                    (length !== 0) && setFilterStatus('Please filter out the Costing Head, Vendor and Plant')
                }
                break;
            case BOPIMPORT:
                if (Data.length === 0) {
                    setEditWarning(true)
                    return false
                }
                Data && Data.forEach((element, index) => {
                    if (index !== 0) {
                        if (element.IsVendor !== Data[index - 1].IsVendor) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Costing Head')
                            setEditWarning(true);
                            flag = false
                        }
                        if (element.Vendor !== Data[index - 1].Vendor) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Vendor')
                            setEditWarning(true);
                            vendorFlag = false
                        }
                        if (element.DestinationPlant !== Data[index - 1].DestinationPlant) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Plant')
                            setEditWarning(true);
                            plantFlag = false
                        }
                    }
                });
                if (flag === true && vendorFlag === true && plantFlag === true) {
                    setEditWarning(false)
                } if (flag === false && vendorFlag === false) {
                    (length !== 0) && setFilterStatus(`Please select one Costing Head, Vendor at a time.`)
                } if (vendorFlag === false && plantFlag === false) {
                    (length !== 0) && setFilterStatus(`Please select one  Vendor, Plant at a time.`)
                } if (flag === false && plantFlag === false) {
                    (length !== 0) && setFilterStatus(`Please select one Costing Head, Plant at a time.`)
                } if (flag === false && vendorFlag === false && plantFlag === false) {
                    (length !== 0) && setFilterStatus('Please filter out the Costing Head, Vendor and Plant')
                }
                break;
            // case BOPIMPORT:
            //     if (Data.length === 0) {
            //         setEditWarning(true)
            //         return false
            //     }
            //     Data && Data.forEach((element, index) => {
            //         if (index !== 0) {
            //             if (element.VendorName !== Data[index - 1].VendorName) {
            //                 (Data.length !== 0) && setFilterStatus('Please filter out the Vendor')
            //                 setEditWarning(true);
            //                 vendorFlag = false
            //             }
            //             // UNCOMMENT THIS IN MINDA ONLY
            //             // if (element.Plant !== Data[index - 1].Plant) {
            //             //     (Data.length !== 0) && setFilterStatus('Please filter out the Vendor')
            //             //     setEditWarning(true);
            //             //     vendorFlag = false
            //             // }
            //             if (element.OverheadApplicabilityType !== Data[index - 1].OverheadApplicabilityType) {
            //                 (Data.length !== 0) && setFilterStatus('Please filter out the Plant')
            //                 setEditWarning(true);
            //                 plantFlag = false
            //             }
            //         }
            //     });
            //     if (flag === true && vendorFlag === true && plantFlag === true) {
            //         setEditWarning(false)
            //     } if (flag === false && vendorFlag === false) {
            //         (length !== 0) && setFilterStatus(`Please select one Costing Head, Vendor at a time.`)
            //     } if (vendorFlag === false && plantFlag === false) {
            //         (length !== 0) && setFilterStatus(`Please select one  Vendor, Plant at a time.`)
            //     } if (flag === false && plantFlag === false) {
            //         (length !== 0) && setFilterStatus(`Please select one Costing Head, Plant at a time.`)
            //     } if (flag === false && vendorFlag === false && plantFlag === false) {
            //         (length !== 0) && setFilterStatus('Please filter out the Costing Head, Vendor and Plant')
            //     }
            //     break;
            // case BOPIMPORT:
            //     if (Data.length === 0) {
            //         setEditWarning(true)
            //         return false
            //     }
            //     Data && Data.forEach((element, index) => {
            //         if (index !== 0) {
            //             if (element.CostingHead !== Data[index - 1].CostingHead) {
            //                 (Data.length !== 0) && setFilterStatus('Please filter out the Costing Head')
            //                 setEditWarning(true);
            //                 flag = false
            //             }
            //             if (element.VendorName !== Data[index - 1].VendorName) {
            //                 (Data.length !== 0) && setFilterStatus('Please filter out the Vendor')
            //                 setEditWarning(true);
            //                 vendorFlag = false
            //             }
            //             if (element.ProfitApplicabilityType !== Data[index - 1].ProfitApplicabilityType) {
            //                 (Data.length !== 0) && setFilterStatus('Please filter out the Applicability Type')
            //                 setEditWarning(true);
            //                 plantFlag = false
            //             }
            //         }
            //     });
            //     if (flag === true && vendorFlag === true && plantFlag === true) {
            //         setEditWarning(false)
            //     } if (flag === false && vendorFlag === false) {
            //         (length !== 0) && setFilterStatus(`Please select one Costing Head, Vendor at a time.`)
            //     } if (vendorFlag === false && plantFlag === false) {
            //         (length !== 0) && setFilterStatus(`Please select one  Vendor, Overhead Applicability at a time.`)
            //     } if (flag === false && plantFlag === false) {
            //         (length !== 0) && setFilterStatus(`Please select one Costing Head, Overhead Applicability at a time.`)
            //     } if (flag === false && vendorFlag === false && plantFlag === false) {
            //         (length !== 0) && setFilterStatus('Please filter out the Costing Head, Vendor and Overhead Applicability')
            //     }
            //     break;

            case COMBINED_PROCESS:
                if (Data && Data.length === 0) {
                    setEditWarning(true)
                } else {
                    setEditWarning(false)
                }
                break;

            default:
                break;
        }
    }

    const openEditPage = () => {
        setShowEditTable(true)
    }

    const editMasterPage = (page) => {
        // let tempObject = token && token.map((item) => {
        //     let obj = {}
        //     obj.SimulationId = item.value
        //     return obj

        // })
        let tempObject = tokenForSimulation?.length !== 0 ? [{ SimulationId: tokenForSimulation?.value }] : []

        switch (page) {
            case RMDOMESTIC:
                return <RMSimulation isDomestic={true} cancelEditPage={cancelEditPage} isbulkUpload={isbulkUpload} rowCount={rowCount} list={tableData.length > 0 ? tableData : getFilteredData(rmDomesticListing, RM_MASTER_ID)} technology={technology.label} master={master.label} tokenForMultiSimulation={tempObject} />  //IF WE ARE USING BULK UPLOAD THEN ONLY TABLE DATA WILL BE USED OTHERWISE DIRECT LISTING
            case RMIMPORT:
                return <RMSimulation isDomestic={false} cancelEditPage={cancelEditPage} isbulkUpload={isbulkUpload} rowCount={rowCount} list={tableData.length > 0 ? tableData : getFilteredData(rmImportListing, RM_MASTER_ID)} technology={technology.label} master={master.label} tokenForMultiSimulation={tempObject} />   //IF WE ARE USING BULK UPLOAD THEN ONLY TABLE DATA WILL BE USED OTHERWISE DIRECT LISTING
            case EXCHNAGERATE:
                return <ERSimulation cancelEditPage={cancelEditPage} list={exchangeRateDataList} technology={technology.label} master={master.value} tokenForMultiSimulation={tempObject} />
            case COMBINED_PROCESS:
                return <CPSimulation cancelEditPage={cancelEditPage} list={tableData} isbulkUpload={isbulkUpload} technology={technology.label} master={master.value} rowCount={rowCount} tokenForMultiSimulation={tempObject} />
            // case OPERATIONS:
            //     return <OperationSTSimulation cancelEditPage={cancelEditPage} list={tableData} isbulkUpload={isbulkUpload} technology={technology.label} master={master.value} rowCount={rowCount} />
            case SURFACETREATMENT:
                return <OperationSTSimulation cancelEditPage={cancelEditPage} list={tableData} isbulkUpload={isbulkUpload} technology={technology.label} master={master.value} rowCount={rowCount} tokenForMultiSimulation={tempObject} changeTokenCheckBox={changeTokenCheckBox} />
            case OPERATIONS:
                return <OperationSTSimulation isOperation={true} cancelEditPage={cancelEditPage} list={tableData} isbulkUpload={isbulkUpload} technology={technology.label} master={master.value} rowCount={rowCount} tokenForMultiSimulation={tempObject} changeTokenCheckBox={changeTokenCheckBox} />
            case MACHINERATE:
                return <MRSimulation isOperation={true} cancelEditPage={cancelEditPage} list={tableData} isbulkUpload={isbulkUpload} technology={technology.label} master={master.value} rowCount={rowCount} tokenForMultiSimulation={tempObject} />
            case BOPDOMESTIC:
                return <BDSimulation isOperation={true} cancelEditPage={cancelEditPage} list={tableData} isbulkUpload={isbulkUpload} technology={technology.label} master={master.value} rowCount={rowCount} tokenForMultiSimulation={tempObject} />
            case BOPIMPORT:
                return <BDSimulation isOperation={true} cancelEditPage={cancelEditPage} list={tableData} isbulkUpload={isbulkUpload} technology={technology.label} master={master.value} rowCount={rowCount} tokenForMultiSimulation={tempObject} />
            // case BOPIMPORT:
            //     return <OverheadSimulation isOperation={true} openEditPageReload={openEditPageReload} cancelEditPage={cancelEditPage} list={tableData} isbulkUpload={isbulkUpload} technology={technology.label} master={master.value} rowCount={rowCount} />
            // case BOPIMPORT:
            //     return <ProfitSimulation isOperation={true} openEditPageReload={openEditPageReload} cancelEditPage={cancelEditPage} list={tableData} isbulkUpload={isbulkUpload} technology={technology.label} master={master.value} rowCount={rowCount} />
            default:
                break;
        }
    }

    const callAPIOnClick = () => {
        setloader(true)
        setSelectionForListingMasterAPI('Combined')
        setShowMasterList(false)
        setEditWarning(true);
        setTimeout(() => {
            setShowMasterList(true)
        }, 700);
    }

    const filterList = async (inputValue) => {
        const resultInput = inputValue.slice(0, 3)
        if (inputValue?.length >= searchCount && vendorName !== resultInput) {
            let res
            res = await getVendorWithVendorCodeSelectList(resultInput)
            setVendorName(resultInput)
            let vendorDataAPI = res?.data?.SelectList
            reactLocalStorage?.setObject('vendorData', vendorDataAPI)
            let VendorData = []
            if (inputValue) {
                VendorData = reactLocalStorage?.getObject('vendorData')
                return autoCompleteDropdown(inputValue, VendorData)
            } else {
                return VendorData
            }
        }
        else {
            if (inputValue?.length < searchCount) return false
            else {
                let VendorData = reactLocalStorage?.getObject('vendorData')
                if (inputValue) {
                    VendorData = reactLocalStorage?.getObject('vendorData')
                    return autoCompleteDropdown(inputValue, VendorData)
                } else {
                    return VendorData
                }
            }
        }
    };

    const showHide = () => {
        setIsHide(true)
    }

    // THIS WILL RENDER WHEN CLICK FROM SIMULATION HISTORY FOR DRAFT STATUS
    if (props?.isFromApprovalListing === true) {
        const simulationId = props?.approvalProcessId;
        const masterId = props?.master
        // THIS WILL RENDER CONDITIONALLY.(IF BELOW FUNC RETUTM TRUE IT WILL GO TO OTHER COSTING SIMULATION COMPONENT OTHER WISE COSTING SIMULATION)

        return <CostingSimulation simulationId={simulationId} master={masterId} isFromApprovalListing={props?.isFromApprovalListing} statusForLinkedToken={props?.statusForLinkedToken} />
    }


    return (
        <div className="container-fluid simulation-page mt-4">
            {
                !showEditTable &&
                <div className="simulation-main" id="go-to-top">
                    <ScrollToTop pointProp={"go-to-top"} />
                    {isHide &&
                        <Row>
                            <Col md="12" className="filter-block zindex-9 simulation-labels">

                                <div className="d-inline-flex justify-content-start align-items-center mr-3 ">
                                    <div className="flex-fills label">Masters:</div>
                                    <div className="hide-label flex-fills pl-0">
                                        <SearchableSelectHookForm
                                            label={''}
                                            name={'Masters'}
                                            placeholder={'Masters'}
                                            Controller={Controller}
                                            control={control}
                                            rules={{ required: false }}
                                            register={register}
                                            defaultValue={master.length !== 0 ? master : ''}
                                            options={renderListing('masters')}
                                            mandatory={false}
                                            handleChange={handleMasterChange}
                                            errors={errors.Masters}
                                        />
                                    </div>
                                </div>

                                {
                                    master.value === '3' &&
                                    <div className="d-inline-flex justify-content-start align-items-center mr-3">
                                        <div className="flex-fills label">Vendor:</div>
                                        <div className="flex-fills hide-label pl-0 p-relative">
                                            {/* {inputLoader && <LoaderCustom customClass="input-loader" />} */}
                                            <AsyncSearchableSelectHookForm
                                                label={''}
                                                name={'Vendor'}
                                                placeholder={'Vendor'}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: false }}
                                                register={register}
                                                defaultValue={vendor.length !== 0 ? vendor : ''}
                                                asyncOptions={filterList}
                                                mandatory={false}
                                                handleChange={handleVendorChange}
                                                errors={errors.Masters}
                                                NoOptionMessage={"Enter 3 characters to show data"}
                                            />
                                        </div>
                                    </div>
                                }
                                {showTokenDropdown &&
                                    <div className={`d-inline-flex justify-content-start align-items-center`}>
                                        <div className="flex-fills label">Token:</div>
                                        <div className="flex-fills hide-label pl-0">
                                            <SearchableSelectHookForm
                                                label={''}
                                                name={'token'}
                                                placeholder={'token'}
                                                valueDescription={token}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: false }}
                                                register={register}
                                                // defaultValue={technology.length !== 0 ? technology : ''}
                                                options={renderListing('token')}
                                                mandatory={false}
                                                handleChange={handleTokenChange}
                                                errors={errors.Masters}
                                            />
                                        </div>
                                    </div>

                                }
                                {partType &&
                                    < div className="d-inline-flex justify-content-start align-items-center mr-3">
                                        <div className="flex-fills label">Vendor:</div>
                                        <div className="flex-fills hide-label pl-0 p-relative">
                                            {/* {inputLoader && <LoaderCustom customClass="vendor-loader" />} */}
                                            <AsyncSearchableSelectHookForm
                                                label={''}
                                                name={'Vendor'}
                                                placeholder={'Vendor'}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: false }}
                                                register={register}
                                                defaultValue={vendor.length !== 0 ? vendor : ''}
                                                asyncOptions={filterList}
                                                mandatory={false}
                                                handleChange={handleVendorChange}
                                                errors={errors.Masters}
                                                NoOptionMessage={"Enter 3 characters to show data"}
                                            />
                                        </div>
                                    </div>
                                }
                                {showTokenDropdown &&
                                    <div className="d-inline-flex justify-content-start align-items-center">
                                        <div className="flex-fills label">Token:</div>
                                        <div className="flex-fills hide-label pl-0">
                                            <SearchableSelectHookForm
                                                label={''}
                                                name={'token'}
                                                placeholder={'token'}
                                                valueDescription={token}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: false }}
                                                register={register}
                                                // defaultValue={technology.length !== 0 ? technology : ''}
                                                options={renderListing('token')}
                                                mandatory={false}
                                                handleChange={handleTokenChange}
                                                errors={errors.Masters}
                                            />
                                        </div>
                                    </div>
                                }

                                {(tokenForSimulation?.length !== 0 && tokenForSimulation !== null && tokenForSimulation !== undefined && tokenCheckBoxValue) && <button className='user-btn ml-2' onClick={callAPIOnClick}>
                                    <div className='save-icon'></div>
                                </button>}
                            </Col>
                        </Row>
                    }
                    {/* <RMDomesticListing isSimulation={true} /> */}
                    {showMasterList &&
                        <div className={`${partType ? 'simulation-edit' : ''} ${loader ? 'min-height-simulation' : ''}`}>{renderModule(master)}</div>
                    }

                    {
                        showMasterList && !partType &&
                        <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer sticky-btn-footer">
                            <div className="col-sm-12 text-right bluefooter-butn mt-3">
                                <div className="d-flex justify-content-end bd-highlight w100 my-2 align-items-center ">
                                    {editWarning && <WarningMessage dClass="mr-3" message={filterStatus} />}
                                    <button type="button" className={"user-btn mt2 mr5"} onClick={openEditPage} disabled={(dataForSimulationFunction() || editWarning) ? true : false}>
                                        <div className={"edit-icon"}></div>  {"EDIT"} </button>
                                    {
                                        !isUploadSimulation(master.value) &&
                                        <>
                                            <ExcelFile filename={master.label} fileExtension={'.xls'} element={<button type="button"
                                                disabled={editWarning}
                                                className={'user-btn mr5'}><div className="download"></div>DOWNLOAD</button>}>
                                                {/* {true ? '' : renderColumn(master.label)} */}
                                                {/* {!editWarning ?  */}
                                                {renderColumn(master.value)}
                                                {/* : ''} */}
                                            </ExcelFile>
                                            <button type="button" className={"user-btn mr5"} onClick={() => { setShowDrawer(true) }}> <div className={"upload"}></div>UPLOAD</button>
                                        </>
                                    }
                                    {/* <button type="button" onClick={handleExcel} className={'btn btn-primary pull-right'}><img className="pr-2" alt={''} src={require('../../../assests/images/download.png')}></img> Download File</button> */}

                                </div>
                            </div >
                        </Row >
                    }
                </div >
            }
            {
                showverifyPage &&
                <VerifySimulation token={token} cancelVerifyPage={cancelVerifyPage} technology={technology} closeSimulation={closeSimulation} />
            }
            {
                loader ? <LoaderCustom customClass="simulation-loader" /> :
                    <div className="simulation-edit">
                        {showEditTable && editMasterPage(master.value)}
                    </div>
            }
            {
                showUploadDrawer &&
                <SimulationUploadDrawer
                    isOpen={showUploadDrawer}
                    closeDrawer={closeDrawer}
                    anchor={"right"}
                    master={master}
                />
            }
        </div >
    );
}

export default Simulation;