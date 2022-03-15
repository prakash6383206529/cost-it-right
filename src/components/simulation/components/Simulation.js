import React, { useEffect, useState } from 'react';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import RMDomesticListing from '../../masters/material-master/RMDomesticListing';
import RMImportListing from '../../masters/material-master/RMImportListing';
import { Row, Col } from 'reactstrap'
import { Controller, useForm } from 'react-hook-form';
import { getListingForSimulationCombined, getSelectListOfMasters, getTokenSelectListAPI, setMasterForSimulation, setTechnologyForSimulation } from '../actions/Simulation';
import { useDispatch, useSelector } from 'react-redux';
import SimulationUploadDrawer from './SimulationUploadDrawer';
import { BOPDOMESTIC, BOPIMPORT, EXCHNAGERATE, MACHINERATE, OPERATIONS, RMDOMESTIC, RMIMPORT, SURFACETREATMENT, RM_MASTER_ID } from '../../../config/constants';
import ReactExport from 'react-export-excel';
import { getTechnologyForSimulation, OperationSimulation, RMDomesticSimulation, RMImportSimulation, SurfaceTreatmentSimulation, MachineRateSimulation, BOPDomesticSimulation, BOPImportSimulation, OverheadProfitSimulation } from '../../../config/masterData';
import Toaster from '../../common/Toaster';
import RMSimulation from './SimulationPages/RMSimulation';
import { getCostingTechnologySelectList } from '../../costing/actions/Costing';
import CostingSimulation from './CostingSimulation';
import WarningMessage from '../../common/WarningMessage';
import MachineRateListing from '../../masters/machine-master/MachineRateListing';
import BOPDomesticListing from '../../masters/bop-master/BOPDomesticListing';
import BOPImportListing from '../../masters/bop-master/BOPImportListing';
import ExchangeRateListing from '../../masters/exchange-rate-master/ExchangeRateListing';
import OperationListing from '../../masters/operation/OperationListing';
import { setFilterForRM } from '../../masters/actions/Material';
import { applyEditCondSimulation, getFilteredData, getOtherCostingSimulation, isUploadSimulation, loggedInUserId, userDetails } from '../../../helper';
import ERSimulation from './SimulationPages/ERSimulation';
import OtherCostingSimulation from './OtherCostingSimulation';
import OperationSTSimulation from './SimulationPages/OperationSTSimulation';
import MRSimulation from './SimulationPages/MRSimulation';
import BDSimulation from './SimulationPages/BDSimulation';
import OverheadListing from '../../masters/overhead-profit-master/OverheadListing'
import ProfitListing from '../../masters/overhead-profit-master/ProfitListing'
import ScrollToTop from '../../common/ScrollToTop';
import OverheadSimulation from './SimulationPages/OverheadSimulation';
import ProfitSimulation from './SimulationPages/ProfitSimulation';
import { reactLocalStorage } from 'reactjs-localstorage';
import LoaderCustom from '../../common/LoaderCustom';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;
function Simulation(props) {
    const { location } = props;

    const { register, handleSubmit, control, setValue, formState: { errors }, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const { selectedMasterForSimulation, selectedTechnologyForSimulation, getTokenSelectList } = useSelector(state => state.simulation)

    const [master, setMaster] = useState({})
    const [technology, setTechnology] = useState({})
    const [showMasterList, setShowMasterList] = useState(false)
    const [showUploadDrawer, setShowDrawer] = useState(false)
    const [showEditTable, setShowEditTable] = useState(false)
    const [isbulkUpload, setIsBulkUpload] = useState(false)
    const [tableData, setTableData] = useState([])
    const [rowCount, setRowCount] = useState({})
    const [editWarning, setEditWarning] = useState(true)
    const [onLoad, setOnLoad] = useState(false)
    const [filterStatus, setFilterStatus] = useState('')
    const [token, setToken] = useState([])
    const [showTokenDropdown, setShowTokenDropdown] = useState(false)
    const [selectionForListingMasterAPI, setSelectionForListingMasterAPI] = useState('')
    const [loader, setloader] = useState(false)
    const [tokenCheckBox, setTokenCheckBox] = useState(false)

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getSelectListOfMasters(() => { }))
        dispatch(getCostingTechnologySelectList(() => { }))
        setShowEditTable(false)
        if (props.isRMPage) {
            setValue('Technology', { label: selectedTechnologyForSimulation?.label, value: selectedTechnologyForSimulation?.value })
            setValue('Masters', { label: selectedMasterForSimulation?.label, value: selectedMasterForSimulation?.value })

            setMaster({ label: selectedMasterForSimulation?.label, value: selectedMasterForSimulation?.value })
            setTechnology({ label: selectedTechnologyForSimulation?.label, value: selectedTechnologyForSimulation?.value })
            setEditWarning(applyEditCondSimulation(getValues('Masters').value))
            setShowMasterList(true)
        }
        setOnLoad(true)
    }, [])

    const masterList = useSelector(state => state.simulation.masterSelectList)
    const rmDomesticListing = useSelector(state => state.material.rmDataList)
    const rmImportListing = useSelector(state => state.material.rmImportDataList)
    const technologySelectList = useSelector(state => state.costing.technologySelectList)
    const exchangeRateDataList = useSelector(state => state.exchangeRate.exchangeRateDataList)

    // useEffect(() => {
    //     editTable()
    // }, [rmDomesticListing, rmImportListing])

    const handleMasterChange = (value) => {
        dispatch(setFilterForRM({ costingHeadTemp: '', plantId: '', RMid: '', RMGradeid: '', Vendorid: '' }))
        setMaster(value)
        setShowMasterList(false)
        setShowTokenDropdown(false)
        setTechnology({ label: '', value: '' })
        setValue('Technology', '')
        dispatch(setMasterForSimulation(value))
        if (value !== '' && (Object.keys(getValues('Technology')).length > 0 || !getTechnologyForSimulation.includes(value.value))) {
            setSelectionForListingMasterAPI('Master')
            setShowTokenDropdown(true)
            setShowMasterList(true)
            let obj = {
                technologyId: value.value,
                loggedInUserId: loggedInUserId(),
                simulationTechnologyId: (String(master.value) === BOPDOMESTIC || String(master.value) === BOPIMPORT || String(master.value) === EXCHNAGERATE || master.value === undefined) ? 0 : master.value
            }
            dispatch(getTokenSelectListAPI(obj, () => { }))
        }
        setEditWarning(applyEditCondSimulation(value.value))
        setFilterStatus(`Please check the ${(value.label)} that you want to edit.`)
    }

    const handleTechnologyChange = (value) => {
        dispatch(setFilterForRM({ costingHeadTemp: '', plantId: '', RMid: '', RMGradeid: '', Vendorid: '' }))
        setTechnology(value)
        setShowMasterList(false)
        setEditWarning(true);
        setToken([])
        setValue('token', '')
        setSelectionForListingMasterAPI('Master')
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

    const handleTokenChange = (value) => {
        setToken(value)
    }

    const returnExcelColumn = (data = [], TempData) => {
        let temp = []
        let temp1 = getFilteredData(TempData, RM_MASTER_ID)
        temp = temp1 && temp1.map((item) => {
            if (item.CostingHead === true) {
                item.CostingHead = 'Vendor Based'
            } else if (item.CostingHead === false) {
                item.CostingHead = 'Zero Based'
            }
            return item
        })

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
        setTokenCheckBox(value)
    }

    const renderModule = (value) => {
        let temp = userDetails().Department
        temp = temp && temp.map((item) => {
            item = item.DepartmentCode
            return item
        })
        let tempValue = token
        tempValue = tempValue && tempValue.map((item) => {
            let object = {}
            object.SimulationId = item.value
            return object
        })

        let obj = {

            MasterId: master.value,
            TechnologyId: technology.value,
            // DepartmentCode: temp.join(),
            DepartmentCode: '',
            SimulationIds: tempValue
        }

        switch (value.value) {
            case RMDOMESTIC:
                return (<RMDomesticListing isSimulation={true} technology={technology.value} apply={editTable} objectForMultipleSimulation={obj} selectionForListingMasterAPI={selectionForListingMasterAPI} loaderTokenAPI={loader} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} />)
            case RMIMPORT:
                return (<RMImportListing isSimulation={true} technology={technology.value} apply={editTable} objectForMultipleSimulation={obj} tokenArray={token} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} />)
            case MACHINERATE:
                return (<MachineRateListing isSimulation={true} isMasterSummaryDrawer={false} technology={technology.value} objectForMultipleSimulation={obj} apply={editTable} tokenArray={token} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} />)
            case BOPDOMESTIC:
                return (<BOPDomesticListing isSimulation={true} isMasterSummaryDrawer={false} technology={technology.value} objectForMultipleSimulation={obj} apply={editTable} tokenArray={token} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} />)
            case BOPIMPORT:
                return (<BOPImportListing isSimulation={true} isMasterSummaryDrawer={false} technology={technology.value} objectForMultipleSimulation={obj} apply={editTable} tokenArray={token} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} />)
            case EXCHNAGERATE:
                return (<ExchangeRateListing isSimulation={true} technology={technology.value} apply={editTable} tokenArray={token} objectForMultipleSimulation={obj} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} />)
            case OPERATIONS:
                return (<OperationListing isSimulation={true} isMasterSummaryDrawer={false} technology={technology.value} objectForMultipleSimulation={obj} apply={editTable} isOperationST={OPERATIONS} tokenArray={token} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} />)
            case SURFACETREATMENT:
                return (<OperationListing isSimulation={true} isMasterSummaryDrawer={false} technology={technology.value} objectForMultipleSimulation={obj} apply={editTable} isOperationST={SURFACETREATMENT} tokenArray={token} selectionForListingMasterAPI={selectionForListingMasterAPI} changeSetLoader={changeSetLoader} changeTokenCheckBox={changeTokenCheckBox} />)
            // case BOPIMPORT:
            //     return (<OverheadListing isSimulation={true} technology={technology.value} apply={editTable} />)
            // case BOPIMPORT:
            //     return (<ProfitListing isSimulation={true} technology={technology.value} apply={editTable} />)

            default:
                return <div className="empty-table-paecholder" />;
        }
    }

    const renderColumn = (fileName) => {
        switch (fileName) {
            case RMDOMESTIC:
                return returnExcelColumn(RMDomesticSimulation, getFilteredData(tableData, RM_MASTER_ID) && getFilteredData(tableData, RM_MASTER_ID).length > 0 ? getFilteredData(tableData, RM_MASTER_ID) : [])
            case RMIMPORT:
                return returnExcelColumn(RMImportSimulation, getFilteredData(tableData, RM_MASTER_ID) && getFilteredData(tableData, RM_MASTER_ID).length > 0 ? getFilteredData(tableData, RM_MASTER_ID) : [])
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
            masterList && masterList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }

        if (label === 'technology') {
            technologySelectList && technologySelectList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
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

    const cancelEditPage = () => {
        setShowEditTable(false)
        setIsBulkUpload(false)
        // setTableData([])
        setMaster({ label: master.label, value: master.value })
        setTechnology({ label: technology.label, value: technology.value })
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
        setTableData(Data)
        // alert('Hello')
        let flag = true;
        let vendorFlag = true;
        let plantFlag = true;
        //  setShowEditTable(true)
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
                            (Data.length !== 0) && setFilterStatus('Please filter out the Costing Head')
                            setEditWarning(true);
                            flag = false
                        }
                        if (element.VendorName !== Data[index - 1].VendorName) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Vendor')
                            setEditWarning(true);
                            vendorFlag = false
                        }
                        if (element.PlantId !== Data[index - 1].PlantId) {
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
                        if (element.PlantId !== Data[index - 1].PlantId) {
                            (Data.length !== 0) && setFilterStatus('Please filter out the Plant')
                            setEditWarning(true);
                            plantFlag = false
                        }
                    }
                })
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


            default:
                break;
        }
    }

    const openEditPage = () => {
        setShowEditTable(true)
    }
    const openEditPageReload = () => {
        setShowEditTable(false)
        setTimeout(() => {

            setShowEditTable(true)
        }, 1);
    }

    const editMasterPage = (page) => {
        let tempObject = token && token.map((item) => {
            let obj = {}
            obj.SimulationId = item.value
            return obj

        })
        switch (page) {
            case RMDOMESTIC:
                return <RMSimulation isDomestic={true} cancelEditPage={cancelEditPage} isbulkUpload={isbulkUpload} rowCount={rowCount} list={tableData.length > 0 ? tableData : getFilteredData(rmDomesticListing, RM_MASTER_ID)} technology={technology.label} master={master.label} tokenForMultiSimulation={tempObject} />  //IF WE ARE USING BULK UPLOAD THEN ONLY TABLE DATA WILL BE USED OTHERWISE DIRECT LISTING
            case RMIMPORT:
                return <RMSimulation isDomestic={false} cancelEditPage={cancelEditPage} isbulkUpload={isbulkUpload} rowCount={rowCount} list={tableData.length > 0 ? tableData : getFilteredData(rmImportListing, RM_MASTER_ID)} technology={technology.label} master={master.label} tokenForMultiSimulation={tempObject} />   //IF WE ARE USING BULK UPLOAD THEN ONLY TABLE DATA WILL BE USED OTHERWISE DIRECT LISTING
            case EXCHNAGERATE:
                return <ERSimulation cancelEditPage={cancelEditPage} list={exchangeRateDataList} technology={technology.label} master={master.label} tokenForMultiSimulation={tempObject} />
            case SURFACETREATMENT:
                return <OperationSTSimulation cancelEditPage={cancelEditPage} list={tableData} isbulkUpload={isbulkUpload} technology={technology.label} master={master.value} rowCount={rowCount} tokenForMultiSimulation={tempObject} />
            case OPERATIONS:
                return <OperationSTSimulation isOperation={true} cancelEditPage={cancelEditPage} list={tableData} isbulkUpload={isbulkUpload} technology={technology.label} master={master.value} rowCount={rowCount} tokenForMultiSimulation={tempObject} />
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

    // THIS WILL RENDER WHEN CLICK FROM SIMULATION HISTORY FOR DRAFT STATUS
    if (location?.state?.isFromApprovalListing === true) {
        const simulationId = location?.state?.approvalProcessId;
        const masterId = location?.state?.master
        // THIS WILL RENDER CONDITIONALLY.(IF BELOW FUNC RETUTM TRUE IT WILL GO TO OTHER COSTING SIMULATION COMPONENT OTHER WISE COSTING SIMULATION)
        if (getOtherCostingSimulation(String(masterId))) {
            return <OtherCostingSimulation master={masterId} simulationId={simulationId} isFromApprovalListing={location?.state?.isFromApprovalListing} />
        }
        return <CostingSimulation simulationId={simulationId} master={masterId} isFromApprovalListing={location?.state?.isFromApprovalListing} />
    }

    return (
        <div className="container-fluid simulation-page">
            {
                !showEditTable &&
                <div className="simulation-main" id="go-to-top">
                    <Row>
                        <Col sm="12">
                            <h1>{`Simulation`}</h1>
                        </Col>
                    </Row>
                    <ScrollToTop pointProp={"go-to-top"} />
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
                                getTechnologyForSimulation.includes(master.value) &&
                                <div className="d-inline-flex justify-content-start align-items-center mr-3">
                                    <div className="flex-fills label">Technology:</div>
                                    <div className="flex-fills hide-label pl-0">
                                        <SearchableSelectHookForm
                                            label={''}
                                            name={'Technology'}
                                            placeholder={'Technology'}
                                            Controller={Controller}
                                            control={control}
                                            rules={{ required: false }}
                                            register={register}
                                            defaultValue={technology.length !== 0 ? technology : ''}
                                            options={renderListing('technology')}
                                            mandatory={false}
                                            handleChange={handleTechnologyChange}
                                            errors={errors.Masters}
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
                                            isMulti={true}
                                        />
                                    </div>
                                </div>
                            }

                            {(token?.length !== 0 && token !== null && tokenCheckBox) && <button className='user-btn' onClick={callAPIOnClick}>
                                <div className='save-icon'></div>
                            </button>}
                        </Col>
                    </Row>

                    {/* <RMDomesticListing isSimulation={true} /> */}
                    {showMasterList && renderModule(master)}

                    {showMasterList &&
                        <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer sticky-btn-footer">
                            <div className="col-sm-12 text-right bluefooter-butn mt-3">
                                <div className="d-flex justify-content-end bd-highlight w100 my-2 align-items-center ">
                                    {editWarning && <WarningMessage dClass="mr-3" message={filterStatus} />}
                                    <button type="button" className={"user-btn mt2 mr5"} onClick={openEditPage} disabled={(rmDomesticListing && rmDomesticListing.length === 0 || rmImportListing && rmImportListing.length === 0 || editWarning) ? true : false}>
                                        <div className={"edit-icon"}></div>  {"EDIT"} </button>
                                    {
                                        !isUploadSimulation(master.value) &&
                                        <>
                                            <ExcelFile filename={master.label} fileExtension={'.xls'} element={<button type="button" disabled={editWarning} className={'user-btn mr5'}><div className="download"></div>DOWNLOAD</button>}>
                                                {/* {true ? '' : renderColumn(master.label)} */}
                                                {!editWarning ? renderColumn(master.value) : ''}
                                            </ExcelFile>
                                            <button type="button" className={"user-btn mr5"} onClick={() => { setShowDrawer(true) }}> <div className={"upload"}></div>UPLOAD</button>
                                        </>
                                    }
                                    {/* <button type="button" onClick={handleExcel} className={'btn btn-primary pull-right'}><img className="pr-2" alt={''} src={require('../../../assests/images/download.png')}></img> Download File</button> */}

                                </div>
                            </div>
                        </Row>
                    }


                    {showUploadDrawer &&
                        <SimulationUploadDrawer
                            isOpen={showUploadDrawer}
                            closeDrawer={closeDrawer}
                            anchor={"right"}
                            master={master}
                        />}
                </div>
            }
            {loader ? <LoaderCustom /> :

                <div className="simulation-edit">
                    {showEditTable && editMasterPage(master.value)}
                </div>
            }
        </div>
    );
}

export default Simulation;