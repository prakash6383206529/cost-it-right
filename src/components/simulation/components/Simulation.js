import React, { useEffect, useState, useContext } from 'react';
import { AsyncSearchableSelectHookForm, SearchableSelectHookForm } from '../../layout/HookFormInputs';
import RMDomesticListing from '../../masters/material-master/RMDomesticListing';
import RMImportListing from '../../masters/material-master/RMImportListing';
import { Row, Col } from 'reactstrap'
import { Controller, useForm } from 'react-hook-form';
import { getMasterSelectListSimulation, getTokenSelectListAPI, setSelectedRowForPagination, setMasterForSimulation, setTechnologyForSimulation, setTokenCheckBoxValue, setTokenForSimulation, getSelectListOfMasters, setVendorForSimulation, setIsMasterAssociatedWithCosting, setSimulationApplicability, setCustomerForSimulation, getCostingHeadsList } from '../actions/Simulation';
import { useDispatch, useSelector } from 'react-redux';
import SimulationUploadDrawer from './SimulationUploadDrawer';
import { BOPDOMESTIC, BOPIMPORT, EXCHNAGERATE, MACHINERATE, OPERATIONS, RMDOMESTIC, RMIMPORT, SURFACETREATMENT, RM_MASTER_ID, searchCount, VBC_VENDOR_TYPE, APPROVED_STATUS, EMPTY_GUID, MACHINE, MASTERS, VBCTypeId, ZBCTypeId, CBCTypeId, ZBC, RAWMATERIALINDEX } from '../../../config/constants';
// import ReactExport from 'react-export-excel';
import { getTechnologyForSimulation, OperationSimulation, RMDomesticSimulation, RMImportSimulation, SurfaceTreatmentSimulation, MachineRateSimulation, BOPDomesticSimulation, BOPImportSimulation, IdForMultiTechnology, ASSEMBLY_TECHNOLOGY_MASTER, ASSEMBLY, associationDropdownList, NON_ASSOCIATED, ASSOCIATED, applicabilityList, APPLICABILITY_RM_SIMULATION, APPLICABILITY_BOP_SIMULATION, indexationDropdown } from '../../../config/masterData';
import { COMBINED_PROCESS } from '../../../config/constants';
import { CombinedProcessSimulation } from '../../../config/masterData';
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
import { allEqual, applyEditCondSimulation, checkForNull, checkPermission, getConfigurationKey, getFilteredData, isUploadSimulation, loggedInUserId, userDetails } from '../../../helper';
import ERSimulation from './SimulationPages/ERSimulation';
import CPSimulation from './SimulationPages/CPSimulation';
import { ProcessListingSimulation } from './ProcessListingSimulation';
import OperationSTSimulation from './SimulationPages/OperationSTSimulation';
import MRSimulation from './SimulationPages/MRSimulation';
import BDSimulation from './SimulationPages/BDSimulation';
import ScrollToTop from '../../common/ScrollToTop';
import LoaderCustom from '../../common/LoaderCustom';
import _ from 'lodash'
import AssemblySimulationListing from './AssemblySimulationListing';
import { getPlantSelectListByType, getVendorNameByVendorSelectList } from '../../../actions/Common';
import VerifySimulation from './VerifySimulation';
import { reactLocalStorage } from 'reactjs-localstorage';
import { autoCompleteDropdown, hideColumnFromExcel, hideMultipleColumnFromExcel } from '../../common/CommonFunctions';
import { MESSAGES } from '../../../config/message';
import BDNonAssociatedSimulation from './SimulationPages/BDNonAssociatedSimulation';
import TooltipCustom from '../../common/Tooltip';
import { getClientSelectList } from '../../masters/actions/Client';
import Toaster from '../../common/Toaster';
import { simulationContext } from '.';
import RMIndexationSimulationListing from './SimulationPages/RMIndexationSimulationListing';
import RMIndexationSimulation from './SimulationPages/RMIndexationSimulation';
import { setCommodityDetails } from '../../masters/actions/Indexation';

// const ExcelFile = ReactExport.ExcelFile;
// const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
// const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
export const ApplyPermission = React.createContext();
function Simulation(props) {
    const { handleEditMasterPage, showTour } = useContext(simulationContext) || {};

    const { register, control, setValue, formState: { errors }, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const { selectedMasterForSimulation, selectedTechnologyForSimulation, getTokenSelectList, tokenCheckBoxValue, tokenForSimulation, selectedCustomerSimulation, selectedVendorForSimulation, isMasterAssociatedWithCosting, selectListCostingHead } = useSelector(state => state.simulation)
    const plantSelectList = useSelector(state => state.comman.plantSelectList);
    const [master, setMaster] = useState([])

    const [technology, setTechnology] = useState({})
    const [showMasterList, setShowMasterList] = useState(false)
    const [showUploadDrawer, setShowDrawer] = useState(false)
    const [showEditTable, setShowEditTable] = useState(false)
    const [isHide, setIsHide] = useState(true)
    const [isbulkUpload, setIsBulkUpload] = useState(false)
    const [tableData, setTableData] = useState([])
    const [rowCount, setRowCount] = useState({})
    const [editWarning, setEditWarning] = useState(true)
    /**************************************** UNCOMMENT THIS WHENEVER WE WILL APPLY VENDOR CHECK ********************************************/
    // const [vendor, setVendor] = useState({})

    // const [vendorDropdown, setVendorDropdown] = useState([])                //RE
    const [filterStatus, setFilterStatus] = useState(`Please check the ${(selectedMasterForSimulation?.label)} that you want to edit.`)
    const [token, setToken] = useState([])
    const [showTokenDropdown, setShowTokenDropdown] = useState(false)
    const [selectionForListingMasterAPI, setSelectionForListingMasterAPI] = useState('')
    const [loader, setloader] = useState(false)
    const [masterSummaryDrawerState, setmasterSummaryDrawerState] = useState(props.isCancelClicked)
    const [isTechnologyDisable, setIsTechnologyDisable] = useState(false)
    const [vendor, setVendor] = useState('')
    const [showverifyPage, setShowVerifyPage] = useState(false)
    const [vendorName, setVendorName] = useState({})
    const [association, setAssociation] = useState('')
    const partType = (checkForNull(selectedMasterForSimulation?.value) === ASSEMBLY_TECHNOLOGY_MASTER) ? true : false
    const [bopLoader, setBopLoader] = useState(false)
    const [isCustomer, setIsCustomer] = useState(false)
    const [showApplicabilityDropdown, setShowApplicabilityDropdown] = useState(false)
    const [applicability, setApplicability] = useState('')
    const [showVendor, setShowVendor] = useState(false)
    const [showCustomer, setShowCustomer] = useState(false)
    const [customer, setCustomer] = useState('')
    const [renderComponent, setRenderComponent] = useState(false)
    const [permissionData, setPermissionData] = useState({});
    const [costingHead, setCostingHead] = useState({});
    const [showDropdown, setShowDropdown] = useState({});
    const [plant, setPlant] = useState('')
    const [type, setType] = useState('')
    const [rawMaterialIds, setRawMaterialIds] = useState([])

    const dispatch = useDispatch()
    const vendorSelectList = useSelector(state => state.comman.vendorWithVendorCodeSelectList)
    useEffect(() => {
        dispatch(getMasterSelectListSimulation(loggedInUserId(), () => { }))
        dispatch(getCostingSpecificTechnology(loggedInUserId(), () => { }))
        dispatch(getClientSelectList(() => { }))
        dispatch(setTokenForSimulation([]))

        // ASSEMBLY TECHNOLOGY
        dispatch(getSelectListOfMasters(() => { }))
        dispatch(getCostingTechnologySelectList(() => { }))
        dispatch(getCostingHeadsList(() => { }))
        dispatch(getPlantSelectListByType(ZBC, "SIMULATION", '', (res) => { }))

        setShowEditTable(false)
        if (props.isRMPage) {
            setValue('Technology', { label: selectedTechnologyForSimulation?.label, value: selectedTechnologyForSimulation?.value })
            setValue('Masters', { label: selectedMasterForSimulation?.label, value: selectedMasterForSimulation?.value })
            setValue('token', { label: tokenForSimulation?.label, value: tokenForSimulation?.value })
            setValue('Applicability', { label: simulationApplicability?.label, value: simulationApplicability?.value })
            setValue('Vendor', { label: selectedVendorForSimulation?.label, value: selectedVendorForSimulation?.value })
            let value = isMasterAssociatedWithCosting ? ASSOCIATED : NON_ASSOCIATED
            setValue('Association', { label: value, value: value })
            setAssociation({ label: value, value: value })
            setMaster({ label: selectedMasterForSimulation?.label, value: selectedMasterForSimulation?.value })
            setTechnology({ label: selectedTechnologyForSimulation?.label, value: selectedTechnologyForSimulation?.value })
            setEditWarning(applyEditCondSimulation(getValues('Masters').value))
            setShowApplicabilityDropdown(true)
            setShowMasterList(true)
            setShowEditTable(false)
            setValue('Vendor', { label: selectedVendorForSimulation?.label, value: selectedVendorForSimulation?.label })
            setValue('Customer', { label: selectedCustomerSimulation?.label, value: selectedCustomerSimulation?.label })
            setShowTokenDropdown(true)
            // setEditWarning(applyEditCondSimulation(getValues('Masters').value))                //RE
            if (simulationApplicability?.value) {
                setShowCustomer(true)
                setShowVendor(true)
            }
        }
        if (!props.isRMPage && !props.preserveData) {
            dispatch(setMasterForSimulation({ label: '', value: '' }))
            dispatch(setTokenForSimulation([]))
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
    const customerList = useSelector(state => state.client.clientSelectList)
    const simulationApplicability = useSelector(state => state.simulation.simulationApplicability)

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
        if (showMasterList) {
            setShowEditTable(false)
        }
    }, [showMasterList])
    useEffect(() => {
        if (handleEditMasterPage) {
            handleEditMasterPage(showEditTable);
        }
    }, [showEditTable]);
    const { topAndLeftMenuData } = useSelector((state) => state.auth);

    useEffect(() => {
        applyPermission(topAndLeftMenuData);
    }, [topAndLeftMenuData]);

    useEffect(() => {
        callMultiAPI()
    }, [plant, vendor, customer]);

    const applyPermission = (topAndLeftMenuData) => {
        if (topAndLeftMenuData !== undefined) {
            const Data = topAndLeftMenuData && topAndLeftMenuData.find((el) => el.ModuleName === MASTERS);
            const accessData = Data && Data.Pages.find((el) => el.PageName === MACHINE);
            const permmisionDataAccess = accessData && accessData.Actions && checkPermission(accessData.Actions);
            if (permmisionDataAccess !== undefined) {
                setPermissionData(permmisionDataAccess);
            }
        }
    };

    const handleMasterChange = (value) => {
        setCostingHead('')
        setValue('CostingHead', '')
        dispatch(setFilterForRM({ costingHeadTemp: '', plantId: '', RMid: '', RMGradeid: '', Vendorid: '' }))
        dispatch(setTokenForSimulation([]))
        setMaster(value)
        setShowMasterList(false)
        setShowTokenDropdown(false)
        setTechnology({ label: '', value: '' })
        setValue('Technology', '')
        setValue('Vendor', '')
        setValue('token', '')
        setValue('Plant', '')
        setPlant('')
        setShowDropdown({})
        dispatch(setVendorForSimulation(''))
        setIsTechnologyDisable(false)
        dispatch(setMasterForSimulation(value))
        dispatch(setTechnologyForSimulation(''))
        setAssociation('')
        setValue('Association', '')
        setShowVendor(false)
        setApplicability('')
        setShowApplicabilityDropdown(false)
        dispatch(setSimulationApplicability(''))
        setValue('Applicability', '')
        setShowCustomer(false)
        setShowCustomer(false)
        setType('')
        setValue('Type', '')
        if (value !== '' && (Object.keys(getValues('Technology')).length > 0 || !getTechnologyForSimulation.includes(value.value)) && checkForNull(value.value) !== ASSEMBLY_TECHNOLOGY_MASTER && value.value !== COMBINED_PROCESS) {
            setSelectionForListingMasterAPI('Master')
            if (checkForNull(value.value) === Number(EXCHNAGERATE)) {
                // setShowTokenDropdown(false)
                setShowApplicabilityDropdown(true)
            } else if (checkForNull(value.value) === Number(RAWMATERIALINDEX)) {
                setShowMasterList(false)
            } else {
                setShowTokenDropdown(true)
                setShowMasterList(true)
            }
            let obj = {
                technologyId: value.value,
                loggedInUserId: loggedInUserId(),
                simulationTechnologyId: (String(master.value) === BOPDOMESTIC || String(master.value) === BOPIMPORT || String(master.value) === EXCHNAGERATE || master.value === undefined) ? 0 : master.value,
                /**************************************** UNCOMMENT THIS WHENEVER WE WILL APPLY VENDOR CHECK ********************************************/
                // vendorId: Object.keys(vendor).length === 0 ? EMPTY_GUID : vendor.value
            }
            dispatch(getTokenSelectListAPI(obj, () => { }))
        }
        if (value.value === COMBINED_PROCESS) {
            setShowVendor(true)
            setShowCustomer(true)
        }
        if (checkForNull(value.value) === ASSEMBLY_TECHNOLOGY_MASTER) {
            // SINCE WE ARE IN MASTER HANDLE CHANGE, TO SET VALUE OF ASSEMBLY TECHNOLOGY IN DROPDOWN WE NEED TO GET DYNAMIC VALUE FROM DROPDOWN API'S REDUCER
            setShowTokenDropdown(false)
            dispatch(setTechnologyForSimulation(value))
        }
        setEditWarning(applyEditCondSimulation(value.value))
        setFilterStatus(`Please check the ${(value.label)} that you want to edit.`)
    }

    const handleApplicabilityChange = (value) => {
        setShowTokenDropdown(false)
        setApplicability(value)
        setShowVendor(false)
        setShowCustomer(false)
        dispatch(setSimulationApplicability(value))
        setEditWarning(false);
        dispatch(setCustomerForSimulation(''))
        setValue('customer', '')
        setCustomer('')
        dispatch(setVendorForSimulation(''))
        setValue('Vendor', '')
        setVendor('')
        dispatch(setTokenForSimulation(''))
        setValue('token', '')
        setToken('')
        setTimeout(() => {
            setShowMasterList(false)
            setShowVendor(true)
            setShowCustomer(true)
            setShowTokenDropdown(true)
            setEditWarning(true);
        }, 200);
        dispatch(setIsMasterAssociatedWithCosting(true))
    }

    const handleAssociationChange = (value) => {
        setShowMasterList(false)
        setShowEditTable(false)
        setTechnology({ label: '', value: '' })
        setValue('Technology', '')
        dispatch(setIsMasterAssociatedWithCosting(value?.value === ASSOCIATED))
        setTimeout(() => {
            setAssociation(value)
            if (value?.value === NON_ASSOCIATED) {
                setShowMasterList(true)
                setSelectionForListingMasterAPI('Master')
                setmasterSummaryDrawerState(false)
                dispatch(setTokenForSimulation([]))
                setEditWarning(true);
                setShowTokenDropdown(false)
            }
        }, 200);
    }
    const handleType = (value) => {
        setShowMasterList(false)
        setTimeout(() => {
            setShowMasterList(true)
        }, 100);
        setType(value)
    }

    const handleTechnologyChange = (value) => {

        setCostingHead('')
        setValue('CostingHead', '')
        setVendor('')
        setValue('Vendor', '')
        setPlant('')
        setValue('Plant', '')
        setShowDropdown({})
        if ((IdForMultiTechnology.includes(String(value?.value)) && Number(master?.value) === Number(ASSEMBLY_TECHNOLOGY_MASTER)) || Number(master.value) === Number(COMBINED_PROCESS) || Number(master.value) === Number(RMDOMESTIC)) {
            setTechnology(value)
            setShowMasterList(false)
            dispatch(setTechnologyForSimulation(value))
            setShowTokenDropdown(false)
            setVendor('')
            setValue('Vendor', '')
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
                    simulationTechnologyId: master.value,
                    // vendorId: Object.keys(vendor).length === 0 ? EMPTY_GUID : vendor.value                //RE
                }
                dispatch(getTokenSelectListAPI(obj, () => { }))
                // if (value !== '' && Object.keys(master).length > 0 && !(master.value === COMBINED_PROCESS)) {                //RE
                if (value !== '' && Object.keys(master).length > 0) {
                    setShowMasterList(true)
                    setShowTokenDropdown(true)
                }
            }, 100);
        }
        dispatch(setIsMasterAssociatedWithCosting(true))
    }

    const handleCostingHeadChange = (value) => {
        let obj = {}
        setCostingHead(value)
        switch (value?.value) {
            case VBCTypeId:
                obj.showVendorDropdown = true
                obj.showPlantDropdown = true
                obj.showCustomerDropdown = false
                break;
            case ZBCTypeId:
                obj.showVendorDropdown = false
                obj.showPlantDropdown = true
                obj.showCustomerDropdown = false
                break;
            case CBCTypeId:
                obj.showVendorDropdown = false
                obj.showPlantDropdown = true
                obj.showCustomerDropdown = true
                break;

            default:
                break;
        }
        setPlant('')
        setValue('Plant', '')
        setVendor('')
        setValue('Vendor', '')
        dispatch(setVendorForSimulation(''))
        setCustomer('')
        setValue('customer', '')
        dispatch(setCustomerForSimulation(''))

        setShowDropdown(obj)
    }

    const handleVendorChange = (value) => {
        setToken([])
        setValue('token', '')
        setSelectionForListingMasterAPI('Master')
        dispatch(setVendorForSimulation(value))
        dispatch(setCustomerForSimulation(''))
        setVendor(value)
        dispatch(setFilterForRM({ VendorId: value?.value }))
        setToken('')
        dispatch(setTokenForSimulation(''))
        let simuTechId = technology?.value
        if (master?.value === EXCHNAGERATE && applicability?.value === APPLICABILITY_RM_SIMULATION) {
            simuTechId = RMIMPORT
        } else if (master?.value === EXCHNAGERATE && applicability?.value === APPLICABILITY_BOP_SIMULATION) {
            simuTechId = BOPIMPORT
        }
        let obj = {
            technologyId: technology?.value ? technology?.value : 0,
            loggedInUserId: loggedInUserId(),
            simulationTechnologyId: simuTechId,
            vendorId: value.value ? value.value : EMPTY_GUID,
            customerId: customer?.value ? customer?.value : EMPTY_GUID,
            /**************************************** UNCOMMENT THIS WHENEVER WE WILL APPLY VENDOR CHECK ********************************************/
        }
        dispatch(getTokenSelectListAPI(obj, () => { }))
    }

    const callMultiAPI = () => {
        setShowMasterList(false)
        switch (costingHead?.value) {
            case VBCTypeId:
                if (Number(Object.keys(vendor)?.length) > 0 && Number(Object.keys(plant)?.length) > 0) {
                    setTimeout(() => {
                        setShowMasterList(true)
                    }, 200);
                }
                break;
            case ZBCTypeId:
                if (Number(Object.keys(plant)?.length) > 0) {
                    setTimeout(() => {
                        setShowMasterList(true)
                    }, 200);
                }

                break;
            case CBCTypeId:
                if (Number(Object.keys(customer)?.length) > 0 && Number(Object.keys(plant)?.length) > 0) {
                    setTimeout(() => {
                        setShowMasterList(true)
                    }, 200);
                }

                break;

            default:
                if (Number(Object.keys(customer)?.length) > 0 || Number(Object.keys(vendor)?.length) > 0) {
                    setTimeout(() => {
                        setShowMasterList(true)
                    }, 200);
                }
                break;
        }
    }

    const handlePlantChange = (value) => {
        setPlant(value);
    }

    const handleCustomerChange = (value) => {
        Number(master?.value) !== ASSEMBLY_TECHNOLOGY_MASTER && setShowMasterList(false)
        setToken([])
        setValue('token', '')
        setSelectionForListingMasterAPI('Master')
        if (Number(master?.value) !== ASSEMBLY_TECHNOLOGY_MASTER) {
            setTimeout(() => {
                if (value !== '') {
                    setShowMasterList(true)
                }
            }, 50);
        }
        setToken('')
        dispatch(setTokenForSimulation(''))
        dispatch(setCustomerForSimulation(value))
        dispatch(setVendorForSimulation(''))
        setIsCustomer(true)
        setCustomer(value)
        dispatch(setFilterForRM({ CustomerId: value?.value }))
        let simuTechId = technology?.value
        if (master?.value === EXCHNAGERATE && applicability?.value === APPLICABILITY_RM_SIMULATION) {
            simuTechId = RMIMPORT
        } else if (master?.value === EXCHNAGERATE && applicability?.value === APPLICABILITY_BOP_SIMULATION) {
            simuTechId = BOPIMPORT
        }
        let obj = {
            technologyId: technology?.value ? technology?.value : 0,
            loggedInUserId: loggedInUserId(),
            simulationTechnologyId: simuTechId,
            vendorId: vendor.value ? vendor.value : EMPTY_GUID,
            customerId: value.value ? value.value : EMPTY_GUID,
            /**************************************** UNCOMMENT THIS WHENEVER WE WILL APPLY VENDOR CHECK ********************************************/
        }
        dispatch(getTokenSelectListAPI(obj, () => { }))
    }

    const backToSimulation = (value) => {
        setShowEditTable(false)
        setShowMasterList(true)
        setEditWarning(true)
        setTableData([])
        setIsBulkUpload(false)
    }

    const handleTokenChange = (value) => {
        setToken(value)
        dispatch(setTokenForSimulation(value))
    }

    const returnExcelColumn = (data = [], TempData, isOperation = false) => {
        let templateArray
        if (!reactLocalStorage.getObject('CostingTypePermission').cbc) {
            templateArray = hideColumnFromExcel(data, 'CustomerName')
        } else if (isMasterAssociatedWithCosting) {
            templateArray = hideColumnFromExcel(data, 'Percentage')
        } else {
            templateArray = data
        }
        if (isOperation && TempData && TempData[0]?.ForType !== 'Welding') {
            templateArray = hideMultipleColumnFromExcel(data, ["OperationConsumption", "OperationBasicRate", "NewOperationBasicRate"])
        } else if (isOperation && TempData && TempData[0]?.ForType === 'Welding') {
            templateArray = hideMultipleColumnFromExcel(data, ["NewRate"])
        }
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

        // return (<ExcelSheet data={temp} name={master.label}>
        //     {templateArray && templateArray.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
        // </ExcelSheet>);
    }

    const changeSetLoader = (value) => {
        setloader(value)
    }

    const isReset = () => {
        setEditWarning(true)
        setFilterStatus(`Please check the ${(selectedMasterForSimulation?.label)} that you want to edit.`)
    }

    const changeTokenCheckBox = (value) => {
        dispatch(setTokenCheckBoxValue(value))
    }

    const getSelectedRows = (list) => {

        let costingHeadArray = _.map(list, "CostingHeadId")
        let vendorCodeArray = _.map(list, "VendorId")
        let customerCodeArray = _.map(list, "CustomerId")

        if (!allEqual(costingHeadArray)) {
            setEditWarning(true)
        } else if (!allEqual(vendorCodeArray)) {
            setEditWarning(true)
        } else if (!allEqual(customerCodeArray)) {
            setEditWarning(true)
        }
        setTableData(list)
    }

    const cancelVerifyPage = () => {
        setShowVerifyPage(false)
    }

    const cancelViewPage = () => {
        setIsHide(false)
    }

    const cancelSimulationListingPage = () => {
        setShowMasterList(false)

        setValue('Vendor', '')
        setValue('Technology', '')
        setValue('Masters', '')

        dispatch(setVendorForSimulation({ label: '', value: '' }))
        dispatch(setTechnologyForSimulation({ label: '', value: '' }))
        dispatch(setMasterForSimulation({ label: '', value: '' }))
    }

    const callBackLoader = data => {
        setBopLoader(data)
    }

    const renderModule = (value) => {
        let tempValue = [{ SimulationId: tokenForSimulation?.value }]

        let masterTemp
        if (master?.value === EXCHNAGERATE && simulationApplicability?.value === APPLICABILITY_RM_SIMULATION) {
            masterTemp = RMIMPORT
        } else if (master?.value === EXCHNAGERATE && simulationApplicability?.value === APPLICABILITY_BOP_SIMULATION) {
            masterTemp = BOPIMPORT
        } else {
            masterTemp = master?.value
        }
        let obj = {
            MasterId: masterTemp,
            TechnologyId: technology.value,
            // DepartmentCode: temp.join(),
            DepartmentCode: '',
            SimulationIds: tempValue
        }
        if (partType) {

            // return <VerifySimulation token={token} cancelVerifyPage={cancelVerifyPage} assemblyTechnology={true} technology={technology} closeSimulation={closeSimulation} />
            return <AssemblySimulationListing isOperation={true} cancelRunSimulation={cancelRunSimulation} list={tableData} isbulkUpload={isbulkUpload} technology={technology} master={master.value} rowCount={rowCount} tokenForMultiSimulation={{}} cancelViewPage={cancelViewPage} showHide={showHide} cancelSimulationListingPage={cancelSimulationListingPage} isCustomer={isCustomer} customer={customer} plant={plant} vendor={vendor} costingHead={costingHead} />
        } else {

            switch (value.value) {
                case RMDOMESTIC:
                    if (type?.label === "Indexed") {
                        return (<RMIndexationSimulationListing isCostingSimulation={true} technology={technology.value} master={master.value} rawMaterialIds={rawMaterialIds} isSimulation={true} type={type} isMasterSummaryDrawer={false} apply={editTable} objectForMultipleSimulation={obj} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} isReset={isReset} ListFor='simulation' approvalStatus={APPROVED_STATUS} />)
                    } else {
                        return (<RMDomesticListing isSimulation={true} technology={technology.value} isMasterSummaryDrawer={false} apply={editTable} objectForMultipleSimulation={obj} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} isReset={isReset} ListFor='simulation' approvalStatus={APPROVED_STATUS} />)
                    }
                case RMIMPORT:
                    return (<RMImportListing isSimulation={true} technology={technology.value} isMasterSummaryDrawer={false} apply={editTable} objectForMultipleSimulation={obj} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} isReset={isReset} ListFor='simulation' approvalStatus={APPROVED_STATUS} />)
                case MACHINERATE:
                    return (<MachineRateListing isSimulation={true} isMasterSummaryDrawer={false} technology={technology} objectForMultipleSimulation={obj} apply={editTable} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} isReset={isReset} ListFor='simulation' approvalStatus={APPROVED_STATUS} />)
                case BOPDOMESTIC:
                    return (<BOPDomesticListing isSimulation={true} isMasterSummaryDrawer={false} technology={technology.value} objectForMultipleSimulation={obj} apply={editTable} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} isReset={isReset} ListFor={association?.value === ASSOCIATED ? 'simulation' : 'master'} isBOPAssociated={association?.value === ASSOCIATED ? true : false} approvalStatus={APPROVED_STATUS} callBackLoader={callBackLoader} />)
                case BOPIMPORT:
                    return (<BOPImportListing isSimulation={true} isMasterSummaryDrawer={false} technology={technology.value} objectForMultipleSimulation={obj} apply={editTable} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} isReset={isReset} ListFor={association?.value === ASSOCIATED ? 'simulation' : 'master'} isBOPAssociated={association?.value === ASSOCIATED ? true : false} approvalStatus={APPROVED_STATUS} callBackLoader={callBackLoader} />)
                case EXCHNAGERATE:
                    return (<ExchangeRateListing isSimulation={true} technology={technology.value} apply={editTable} tokenArray={tokenForSimulation} objectForMultipleSimulation={obj} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} approvalStatus={APPROVED_STATUS} getSelectedRows={getSelectedRows} />)
                case OPERATIONS:
                    return (<OperationListing isSimulation={true} isMasterSummaryDrawer={false} technology={technology.value} objectForMultipleSimulation={obj} apply={editTable} isOperationST={OPERATIONS} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} isReset={isReset} ListFor='simulation' stopAPICall={false} approvalStatus={APPROVED_STATUS} />)
                case SURFACETREATMENT:
                    return (<OperationListing isSimulation={true} isMasterSummaryDrawer={false} technology={technology.value} objectForMultipleSimulation={obj} apply={editTable} isOperationST={SURFACETREATMENT} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} isReset={isReset} ListFor='simulation' stopAPICall={false} approvalStatus={APPROVED_STATUS} />)
                case COMBINED_PROCESS:
                    return (<ProcessListingSimulation isSimulation={true} technology={technology.value} vendorId={vendor.value} customerId={customer.value} objectForMultipleSimulation={obj} apply={editTable} tokenArray={token} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} />)
                case RAWMATERIALINDEX:
                    return (<RMIndexationSimulationListing master={master.value} rawMaterialIds={rawMaterialIds} isSimulation={true} type={type} isMasterSummaryDrawer={false} apply={editTable} objectForMultipleSimulation={obj} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} isReset={isReset} ListFor='simulation' approvalStatus={APPROVED_STATUS} />)
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
                return returnExcelColumn(RMDomesticSimulation, tableData ? tableData : [])
            case RMIMPORT:
                return returnExcelColumn(RMImportSimulation, tableData ? tableData : [])
            case COMBINED_PROCESS:                //RE
                return returnExcelColumn(CombinedProcessSimulation, tableData && tableData.length > 0 ? tableData : [])
            case SURFACETREATMENT:
                return returnExcelColumn(SurfaceTreatmentSimulation, tableData && tableData.length > 0 ? tableData : [])
            case OPERATIONS:
                return returnExcelColumn(OperationSimulation, tableData && tableData.length > 0 ? tableData : [], true)
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
                    if (item.Value === '0') return false;
                    if (String(master.value) === String(RMDOMESTIC) || String(master.value) === String(RMIMPORT)) {
                        if (String(item.Value) !== String(ASSEMBLY)) temp.push({ label: item.Text, value: item.Value })
                    } else {
                        temp.push({ label: item.Text, value: item.Value });

                    }
                    return null;
                })
                return temp
            }
        }
        if (label === 'token') {
            getTokenSelectList && getTokenSelectList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
        if (label === 'association') {
            let tempList = [...associationDropdownList]
            tempList && tempList.map((item) => {
                if (item.value === '0') return false
                temp.push({ label: item.label, value: item.value })
                return null
            })
            return temp
        }
        if (label === 'customer') {

            customerList && customerList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })

            return temp
        }
        if (label === 'applicability') {

            applicabilityList && applicabilityList.map((item) => {
                if (item.value === '0') return false
                temp.push({ label: item.label, value: item.value })
                return null
            })
            return temp
        }
        if (label === 'vendor') {
            vendorSelectList && vendorSelectList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })

            return temp
        }

        if (label === 'CostingHead') {
            selectListCostingHead && selectListCostingHead?.map((item) => {
                if (item?.CostingHeadId === VBCTypeId || item?.CostingHeadId === ZBCTypeId ||
                    item?.CostingHeadId === CBCTypeId) temp.push({ label: item.CostingHead, value: item.CostingHeadId })
                return null
            })

            return temp
        }

        if (label === 'plant') {
            plantSelectList && plantSelectList.map((item) => {
                if (item.PlantId === '0') return false
                temp.push({ label: item?.PlantNameCode, value: item?.PlantId, PlantName: item?.PlantName, PlantCode: item?.PlantCode })
                return null
            })

            return temp
        }
        if (label === 'type') {
            let tempList = [...indexationDropdown]
            tempList && tempList.map((item) => {
                if (item.value === '0') return false
                temp.push({ label: item.label, value: item.value })
                return null
            })
            return temp
        }
    }

    const closeSimulation = () => {
        setShowEditTable(true)
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
            //RE
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
        setValue('Masters', '')
        setVendor('')
        setValue('Vendor', '')

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
        const rawMaterialIds = uniqeArray.map(item => item.RawMaterialId)
        setRawMaterialIds(rawMaterialIds)
        dispatch(setSelectedRowForPagination(uniqeArray))
        setTableData(uniqeArray)
        // alert('Hello')
        let flag = true;
        let vendorFlag = true;
        let plantFlag = true;
        let operationTypeFlag = true;
        if (length === 0 || length === undefined || length === null) {
            setFilterStatus(`Please check the ${(master.label)} that you want to edit.`)
        }
        switch (String(master.value)) {
            case String(RMDOMESTIC):
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
                        // if (userDetails().Role !== 'Group Category Head') { //MINDA
                        if (element.VendorName !== Data[index - 1].VendorName) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Vendor')
                            setEditWarning(true);
                            vendorFlag = false
                        }
                        if (element.PlantId !== Data[index - 1].PlantId || element.DestinationPlantId !== Data[index - 1].DestinationPlantId) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Plant')
                            setEditWarning(true);
                            plantFlag = false
                        }



                    }
                });
                // if (userDetails().Role !== 'Group Category Head') { //MINDA
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
                // }
                //  else {
                //     setEditWarning(true)
                // }
                break;
            case String(RMIMPORT):
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
                        // if (userDetails().Role !== 'Group Category Head') { //MINDA
                        if (element.VendorName !== Data[index - 1].VendorName) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Vendor')
                            setEditWarning(true);
                            vendorFlag = false
                        }
                        if (element.PlantId !== Data[index - 1].PlantId || element.DestinationPlantId !== Data[index - 1].DestinationPlantId) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Plant')
                            setEditWarning(true);
                            plantFlag = false
                        }
                    }
                });
                // if (userDetails().Role !== 'Group Category Head') { //MINDA
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
            // case String(BOPIMPORT):
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
            // case String(BOPIMPORT):
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

            case String(SURFACETREATMENT):
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
            case String(OPERATIONS):
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
                        if (element.ForType !== Data[index - 1].ForType) {
                            setTimeout(() => {
                                (Data.length !== 0) && setFilterStatus('Please filter out the Operation Type')
                                setEditWarning(true);
                                operationTypeFlag = false
                            }, 200);
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
                } if (flag === false && operationTypeFlag === false) {
                    (length !== 0) && setFilterStatus('Please filter out the Operation Type')
                }
                break;
            case String(MACHINERATE):
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
            case String(BOPDOMESTIC):
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
            case String(BOPIMPORT):
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

            case String(EXCHNAGERATE):
                if (Data.length === 0) {
                    setEditWarning(true)
                    return false
                }
                Data && Data.forEach((element, index) => {
                    if (index !== 0) {
                        if (element.CostingHeadId !== Data[index - 1].CostingHeadId) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Costing Head')
                            setEditWarning(true);
                            flag = false
                        }
                        if (element.VendorId !== Data[index - 1].VendorId) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Vendor')
                            setEditWarning(true);
                            vendorFlag = false
                        }
                        if (element.CustomerId !== Data[index - 1].CustomerId) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Customer')
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
                    (length !== 0) && setFilterStatus(`Please select one  Vendor, Customer at a time.`)
                } if (flag === false && plantFlag === false) {
                    (length !== 0) && setFilterStatus(`Please select one Costing Head, Customer at a time.`)
                } if (flag === false && vendorFlag === false && plantFlag === false) {
                    (length !== 0) && setFilterStatus('Please filter out the Costing Head, Vendor and Customer')
                }
                break;
            // case String(BOPIMPORT):
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
            // case String(BOPIMPORT):
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
            case String(COMBINED_PROCESS):                //RE
            case String(RAWMATERIALINDEX):
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
        if (tableData?.length === 0) {
            Toaster.warning("Please select at least one record.")
            return false
        }

        setShowEditTable(true)
        setShowMasterList(false)
    }

    const cancelEditPage = () => {
        setShowEditTable(false)
        setIsBulkUpload(false)
        // setTableData([])
        setMaster({ label: master.label, value: master.value })
        setTechnology({ label: technology.label, value: technology.value })
        // setTimeout(() => {
        //     setShowEditTable(true)
        // }, 200);

        setSelectionForListingMasterAPI('Master')
        setTimeout(() => {
            dispatch(setTechnologyForSimulation(technology))
        }, 200);
    }

    const editMasterPage = (page) => {

        // let tempObject = token && token.map((item) => {
        //     let obj = {}
        //     obj.SimulationId = item.value
        //     return obj

        // })
        let tempObject = tokenForSimulation?.length !== 0 ? [{ SimulationId: tokenForSimulation?.value }] : []
        switch (page) {
            // case RMDOMESTIC:
            //     if (type?.label === "Indexed") {
            //         return (<RMIndexationSimulationListing isCostingSimulation={true} technology={technology.value} master={master.value} rawMaterialIds={rawMaterialIds} isSimulation={true} type={type} isMasterSummaryDrawer={false} apply={editTable} objectForMultipleSimulation={obj} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} isReset={isReset} ListFor='simulation' approvalStatus={APPROVED_STATUS} />)
            //     } else {
            //         return (<RMDomesticListing isSimulation={true} technology={technology.value} isMasterSummaryDrawer={false} apply={editTable} objectForMultipleSimulation={obj} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} isReset={isReset} ListFor='simulation' approvalStatus={APPROVED_STATUS} />)
            //     }
            case RMDOMESTIC:

                if (type?.label === "Indexed") {
                    return <ApplyPermission.Provider value={permissionData}>
                        <RMIndexationSimulation isCostingSimulation={true} backToSimulation={backToSimulation} isbulkUpload={isbulkUpload} rowCount={rowCount} list={tableData} master={master.label} tokenForMultiSimulation={tempObject} />
                    </ApplyPermission.Provider>
                } else {
                    return <ApplyPermission.Provider value={permissionData}>
                        <RMSimulation isDomestic={true} backToSimulation={backToSimulation} isbulkUpload={isbulkUpload} rowCount={rowCount} list={tableData.length > 0 ? tableData : getFilteredData(rmDomesticListing, RM_MASTER_ID)} technology={technology.label} technologyId={technology.value} master={master.label} tokenForMultiSimulation={tempObject} />
                    </ApplyPermission.Provider> //IF WE ARE USING BULK UPLOAD THEN ONLY TABLE DATA WILL BE USED OTHERWISE DIRECT LISTING
                }
            case RMIMPORT:
                return <RMSimulation isDomestic={false} backToSimulation={backToSimulation} isbulkUpload={isbulkUpload} rowCount={rowCount} list={tableData.length > 0 ? tableData : getFilteredData(rmImportListing, RM_MASTER_ID)} technology={technology.label} technologyId={technology.value} master={master.label} tokenForMultiSimulation={tempObject} />   //IF WE ARE USING BULK UPLOAD THEN ONLY TABLE DATA WILL BE USED OTHERWISE DIRECT LISTING
            case EXCHNAGERATE:
                return <ERSimulation backToSimulation={backToSimulation} list={tableData.length > 0 ? tableData : getFilteredData(exchangeRateDataList, RM_MASTER_ID)} technology={technology.label} master={master.label} tokenForMultiSimulation={tempObject} technologyId={technology.value} />
            case COMBINED_PROCESS:
                return <CPSimulation cancelEditPage={cancelEditPage} list={tableData} isbulkUpload={isbulkUpload} technology={technology.label} master={master.value} rowCount={rowCount} tokenForMultiSimulation={tempObject} />
            case SURFACETREATMENT:
                return <OperationSTSimulation backToSimulation={backToSimulation} list={tableData} isbulkUpload={isbulkUpload} technology={technology.label} master={master.value} rowCount={rowCount} tokenForMultiSimulation={tempObject} />
            case OPERATIONS:
                return <OperationSTSimulation isOperation={true} backToSimulation={backToSimulation} list={tableData} isbulkUpload={isbulkUpload} technology={technology.label} master={master.value} rowCount={rowCount} tokenForMultiSimulation={tempObject} />
            case MACHINERATE:
                return <MRSimulation isOperation={true} backToSimulation={backToSimulation} list={tableData} isbulkUpload={isbulkUpload} technology={technology.label} master={master.value} rowCount={rowCount} tokenForMultiSimulation={tempObject} technologyId={technology.value} />
            case BOPDOMESTIC:
                if (isMasterAssociatedWithCosting) {
                    return <BDSimulation isOperation={true} backToSimulation={backToSimulation} list={tableData} isbulkUpload={isbulkUpload} technology={technology.label} master={master.value} rowCount={rowCount} tokenForMultiSimulation={tempObject} />
                } else if (!isMasterAssociatedWithCosting) {
                    return <BDNonAssociatedSimulation isOperation={true} backToSimulation={backToSimulation} list={tableData} isbulkUpload={isbulkUpload} technology={technology.label} master={master.value} rowCount={rowCount} tokenForMultiSimulation={tempObject} />
                } else {
                    return ''
                }
            case BOPIMPORT:
                if (isMasterAssociatedWithCosting) {
                    return <BDSimulation isOperation={true} backToSimulation={backToSimulation} list={tableData} isbulkUpload={isbulkUpload} technology={technology.label} master={master.value} rowCount={rowCount} tokenForMultiSimulation={tempObject} />
                } else if (!isMasterAssociatedWithCosting) {
                    return <BDNonAssociatedSimulation isOperation={true} backToSimulation={backToSimulation} list={tableData} isbulkUpload={isbulkUpload} technology={technology.label} master={master.value} rowCount={rowCount} tokenForMultiSimulation={tempObject} />
                } else {
                    return ''
                }
            case String(RAWMATERIALINDEX):
                return <RMIndexationSimulation backToSimulation={backToSimulation} isbulkUpload={isbulkUpload} rowCount={rowCount} list={tableData} master={master.label} tokenForMultiSimulation={tempObject} />
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
        if (inputValue && typeof inputValue === 'string' && inputValue.includes(' ')) {
            inputValue = inputValue.trim();
        }
        const resultInput = inputValue.slice(0, searchCount)
        if (inputValue?.length >= searchCount && vendorName !== resultInput) {
            let res
            res = await getVendorNameByVendorSelectList(VBC_VENDOR_TYPE, resultInput)
            setVendorName(resultInput)
            let vendorDataAPI = res?.data?.SelectList
            if (inputValue) {
                return autoCompleteDropdown(inputValue, vendorDataAPI, false, [], true)
            } else {
                return vendorDataAPI
            }
        }
        else {
            if (inputValue?.length < searchCount) return false
            else {
                let VendorData = reactLocalStorage?.getObject('Data')
                if (inputValue) {
                    return autoCompleteDropdown(inputValue, VendorData, false, [], false)
                } else {
                    return VendorData
                }
            }
        }
    };

    const showHide = () => {
        setIsHide(true)
    }

    const buttonCrossVendor = () => {
        setValue('Vendor', '')
        setVendor('')
        setRenderComponent(!renderComponent)
        setShowMasterList(false)
        dispatch(getTokenSelectListAPI(false, () => { }))
    }

    const buttonCrossPlant = () => {
        setValue('Plant', '')
        setPlant('')
        setRenderComponent(!renderComponent)
        setShowMasterList(false)
        dispatch(getTokenSelectListAPI(false, () => { }))
    }

    const buttonCrossCustomer = () => {
        setValue('customer', '')
        setCustomer('')
        setRenderComponent(!renderComponent)
        setShowMasterList(false)
    }

    // THIS WILL RENDER WHEN CLICK FROM SIMULATION HISTORY FOR DRAFT STATUS
    if (props?.isFromApprovalListing === true && String(props?.master) !== RAWMATERIALINDEX) {
        const simulationId = props?.approvalProcessId;
        const masterId = props?.master
        // THIS WILL RENDER CONDITIONALLY.(IF BELOW FUNC RETUTM TRUE IT WILL GO TO OTHER COSTING SIMULATION COMPONENT OTHER WISE COSTING SIMULATION)

        return <CostingSimulation simulationId={simulationId} master={masterId} isFromApprovalListing={props?.isFromApprovalListing} statusForLinkedToken={props?.statusForLinkedToken} />
    }
    if (props?.isFromApprovalListing === true && String(props?.master) === RAWMATERIALINDEX) {
        const simulationId = props?.approvalProcessId;
        const masterId = props?.master
        // THIS WILL RENDER CONDITIONALLY.(IF BELOW FUNC RETUTM TRUE IT WILL GO TO OTHER COSTING SIMULATION COMPONENT OTHER WISE COSTING SIMULATION)

        return <RMIndexationSimulation simulationId={simulationId} master={masterId} isFromApprovalListing={props?.isFromApprovalListing} statusForLinkedToken={props?.statusForLinkedToken} isImpactedMaster={false} />
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

                                <div className="d-inline-flex justify-content-start align-items-center pr-3 mb-3 zindex-unset ">
                                    <div className="flex-fills label">Masters:</div>
                                    <div className="hide-label flex-fills pl-0">
                                        <SearchableSelectHookForm
                                            label={''}
                                            name={'Masters'}
                                            placeholder={'Select'}
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
                                    showApplicabilityDropdown && <div className="d-inline-flex justify-content-start align-items-center mr-2 mb-3 zindex-unset ">
                                        <div className="flex-fills label">Applied On:</div>
                                        <div className="hide-label flex-fills pl-0">
                                            <SearchableSelectHookForm
                                                label={''}
                                                name={'Applicability'}
                                                placeholder={'Select'}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: false }}
                                                register={register}
                                                defaultValue={applicability.length !== 0 ? applicability : ''}
                                                options={renderListing('applicability')}
                                                mandatory={false}
                                                handleChange={handleApplicabilityChange}
                                                errors={errors.Applicability}
                                            />
                                        </div>
                                    </div>
                                }
                                {
                                    (String(master?.value) === BOPDOMESTIC || String(master?.value) === BOPIMPORT) &&
                                    <div className="d-inline-flex justify-content-start align-items-center mr-2 mb-3 zindex-unset">
                                        <div className="flex-fills label">Association:</div>
                                        <div className="flex-fills hide-label pl-0 d-flex mr-3">
                                            <SearchableSelectHookForm
                                                label={''}
                                                name={'Association'}
                                                placeholder={'Select'}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: false }}
                                                register={register}
                                                defaultValue={association.length !== 0 ? association : ''}
                                                options={renderListing('association')}
                                                mandatory={false}
                                                handleChange={handleAssociationChange}
                                                errors={errors.Association}
                                            />
                                            {!bopLoader && <TooltipCustom id="association-tooltip" width="310px" tooltipText='To run a simulation on BOPs associated with costing, please select "Associate with Costing". Otherwise, select "Not Associate with Costing"' />}
                                        </div>
                                    </div>
                                }

                                {((String(selectedMasterForSimulation?.value) !== BOPDOMESTIC && String(selectedMasterForSimulation?.value) !== BOPIMPORT) ? true :
                                    (association !== '' && association?.value !== NON_ASSOCIATED)) &&
                                    getTechnologyForSimulation.includes(master.value) &&
                                    <div className="d-inline-flex justify-content-start align-items-center mr-2 mb-3 zindex-unset">
                                        <div className="flex-fills label">Technology:</div>
                                        <div className="flex-fills hide-label pl-0">
                                            <SearchableSelectHookForm
                                                label={''}
                                                name={'Technology'}
                                                placeholder={'Select'}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: false }}
                                                register={register}
                                                defaultValue={technology.length !== 0 ? technology : ''}
                                                options={renderListing('technology')}
                                                mandatory={false}
                                                handleChange={handleTechnologyChange}
                                                errors={errors.Technology}
                                                disabled={isTechnologyDisable}
                                            />
                                        </div>
                                    </div>
                                }
                                {
                                    ((String(master?.value) === RAWMATERIALINDEX) || ((String(master?.value) === RMDOMESTIC || String(master?.value) === RMIMPORT) && getConfigurationKey()?.IsShowMaterialIndexation)) &&
                                    <div className="d-inline-flex justify-content-start align-items-center mr-2 mb-3 zindex-unset">
                                        <div className="flex-fills label">Type:</div>
                                        <div className="flex-fills hide-label pl-0 d-flex mr-3">
                                            <SearchableSelectHookForm
                                                label={''}
                                                name={'Type'}
                                                placeholder={'Select'}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: false }}
                                                register={register}
                                                defaultValue={type.length !== 0 ? type : ''}
                                                options={renderListing('type')}
                                                mandatory={false}
                                                handleChange={handleType}
                                                errors={errors.Type}
                                            />
                                        </div>
                                    </div>
                                }
                                {partType &&
                                    <div className="d-inline-flex justify-content-start align-items-center mr-2 mb-3 zindex-unset">
                                        <div className="flex-fills label">Costing Head:</div>
                                        <div className="flex-fills hide-label pl-0">
                                            <SearchableSelectHookForm
                                                label={''}
                                                name={'CostingHead'}
                                                placeholder={'Select'}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: false }}
                                                register={register}
                                                defaultValue={costingHead.length !== 0 ? costingHead : ''}
                                                options={renderListing('CostingHead')}
                                                mandatory={false}
                                                handleChange={handleCostingHeadChange}
                                                errors={errors.CostingHead}
                                                disabled={isTechnologyDisable}
                                            />
                                        </div>
                                    </div>
                                }
                                {(showVendor || showDropdown?.showVendorDropdown) &&
                                    // {(partType || master.value === COMBINED_PROCESS) &&                //RE
                                    < div className="d-inline-flex justify-content-start align-items-center mr-2 mb-3 zindex-unset">
                                        <div className="flex-fills label">Vendor:{Number(master?.value) === ASSEMBLY_TECHNOLOGY_MASTER && <span className="asterisk-required">*</span>}</div>
                                        <div className="flex-fills hide-label pl-0 p-relative">
                                            {/* {inputLoader && <LoaderCustom customClass="vendor-loader" />} */}
                                            <AsyncSearchableSelectHookForm
                                                label={''}
                                                name={'Vendor'}
                                                placeholder={'Select'}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: false }}
                                                register={register}
                                                defaultValue={vendor.length !== 0 ? vendor : ''}
                                                asyncOptions={filterList}
                                                mandatory={false}
                                                handleChange={handleVendorChange}
                                                errors={errors.Masters}
                                                NoOptionMessage={MESSAGES.ASYNC_MESSAGE_FOR_DROPDOWN}
                                                buttonCross={buttonCrossVendor}
                                                disabled={getValues('customer')?.value}
                                            />
                                        </div>
                                    </div>
                                }
                                {
                                    (showCustomer || showDropdown?.showCustomerDropdown) &&
                                    < div className="d-inline-flex justify-content-start align-items-center mr-2 mb-3 zindex-unset">
                                        <div className="flex-fills label">Customer:{Number(master?.value) === ASSEMBLY_TECHNOLOGY_MASTER && <span className="asterisk-required">*</span>}</div>
                                        <div className="flex-fills hide-label pl-0 p-relative">
                                            <SearchableSelectHookForm
                                                label={''}
                                                name={'customer'}
                                                placeholder={'Select'}
                                                valueDescription={customer}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: false }}
                                                register={register}
                                                options={renderListing('customer')}
                                                defaultValue={customer.length !== 0 ? customer : ''}
                                                mandatory={false}
                                                handleChange={handleCustomerChange}
                                                errors={errors.Masters}
                                                buttonCross={buttonCrossCustomer}
                                                disabled={getValues('Vendor')?.value ? true : false}
                                            />
                                        </div>
                                    </div>
                                }
                                {
                                    (showDropdown?.showPlantDropdown) &&
                                    < div className="d-inline-flex justify-content-start align-items-center mr-2 mb-3 zindex-unset">
                                        <div className="flex-fills label">Plant:{Number(master?.value) === ASSEMBLY_TECHNOLOGY_MASTER && <span className="asterisk-required">*</span>}</div>
                                        <div className="flex-fills hide-label pl-0 p-relative">
                                            <SearchableSelectHookForm
                                                label={''}
                                                name={'Plant'}
                                                placeholder={'Select'}
                                                valueDescription={plant}
                                                Controller={Controller}
                                                control={control}
                                                rules={{ required: false }}
                                                register={register}
                                                options={renderListing('plant')}
                                                defaultValue={plant.length !== 0 ? plant : ''}
                                                mandatory={false}
                                                handleChange={handlePlantChange}
                                                errors={errors.Masters}
                                                buttonCross={buttonCrossPlant}
                                            />
                                        </div>
                                    </div>
                                }
                                {
                                    (showTokenDropdown && !(selectedMasterForSimulation?.value === RAWMATERIALINDEX)) &&
                                    <div className="d-inline-flex justify-content-start align-items-center zindex-unset">
                                        <div className="flex-fills label">Token:</div>
                                        <div className="flex-fills hide-label pl-0">
                                            <SearchableSelectHookForm
                                                label={''}
                                                name={'token'}
                                                placeholder={'Select'}
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
                        </Row >
                    }
                    {/* <RMDomesticListing isSimulation={true} /> */}
                    {
                        showMasterList &&
                        <div className={`${partType ? 'simulation-edit' : ''} ${loader ? 'min-height-simulation' : ''}`}>{renderModule(master)}</div>
                    }

                    {
                        showMasterList && !partType &&
                        <Row className={`sf-btn-footer no-gutters justify-content-between bottom-footer ${showTour ? '' : 'sticky-btn-footer'}`}>
                            <div className="col-sm-12 text-right bluefooter-butn mt-3">
                                <div className="d-flex justify-content-end bd-highlight w100 my-2 align-items-center ">
                                    {editWarning && <WarningMessage dClass="mr-3" message={filterStatus} />}
                                    <button id={"simulation-edit"} type="button" className={"user-btn mt2 mr5"} onClick={openEditPage} disabled={(dataForSimulationFunction() || editWarning) ? true : false}>
                                        <div className={"edit-icon"}></div>  {"EDIT"} </button>
                                    {
                                        !isUploadSimulation(master.value) &&
                                        <>
                                            {/* <ExcelFile filename={master.label} fileExtension={'.xls'} element={<button id={"simulation-download"} type="button" disabled={editWarning} className={'user-btn mr5'}><div className="download"></div>DOWNLOAD</button>}>
                                                {!editWarning ? renderColumn(master.value) : ''}
                                            </ExcelFile> */}
                                            {!(master?.value === RAWMATERIALINDEX) && <button type="button" id='simulation-upload' className={"user-btn mr5"} onClick={() => { setShowDrawer(true) }}> <div className={"upload"}></div>UPLOAD</button>}
                                        </>
                                    }
                                    {/* <button type="button" onClick={handleExcel} className={'btn btn-primary pull-right'}><img className="pr-2" alt={''} src={require('../../../assests/images/download.png')}></img> Download File</button> */}

                                </div >
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
                    isMasterAssociatedWithCosting={isMasterAssociatedWithCosting}
                />
            }
        </div >
    );
}

export default Simulation;