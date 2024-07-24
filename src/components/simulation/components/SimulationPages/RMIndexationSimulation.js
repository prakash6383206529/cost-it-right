import React, { useEffect, useState, useRef, useContext } from 'react';
import { Row, Col, Tooltip, } from 'reactstrap';
import DayTime from '../../../common/DayTimeWrapper'
import { CBCTypeId, defaultPageSize, EMPTY_DATA, EXCHNAGERATE, RMDOMESTIC, RMIMPORT, BOPIMPORT, RAWMATERIALAPPROVALTYPEID } from '../../../../config/constants';
import NoContentFound from '../../../common/NoContentFound';
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId, searchNocontentFilter, userDetails } from '../../../../helper';
import Toaster from '../../../common/Toaster';
import { editRMIndexedSimulationData, getCommodityDetailForSimulation, draftSimulationForRMMaster, runVerifySimulation, updateSimulationRawMaterial, runSimulationOnRawMaterial, getAllSimulatedRawMaterial } from '../../actions/Simulation';
import { Fragment } from 'react';
import { TextFieldHookForm } from '../../../layout/HookFormInputs';
import DatePicker from "react-datepicker";
import { useForm, Controller } from 'react-hook-form'
import RunSimulationDrawer from '../RunSimulationDrawer';
import VerifySimulation from '../VerifySimulation';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import _, { debounce } from 'lodash'
import { VBC, ZBC } from '../../../../config/constants';
import { PaginationWrapper } from '../../../common/commonPagination';
import WarningMessage from '../../../common/WarningMessage';
import { getMaxDate } from '../../SimulationUtils';
import PopupMsgWrapper from '../../../common/PopupMsgWrapper';
import { APPLICABILITY_RM_SIMULATION, FORGING, RM_IMPACT_DOWNLOAD_EXCEl, RM_IMPACT_DOWNLOAD_EXCEl_IMPORT } from '../../../../config/masterData';
// import ReactExport from 'react-export-excel';
import { createMultipleExchangeRate } from '../../../masters/actions/ExchangeRateMaster';
import LoaderCustom from '../../../common/LoaderCustom';
import { reactLocalStorage } from 'reactjs-localstorage';
import { simulationContext } from '..';
import { setCommodityDetails } from '../../../masters/actions/Indexation';
import CommoditySimulationDrawer from './CommoditySimulationDrawer';
import AddOtherCostDrawer from '../../../masters/material-master/AddOtherCostDrawer';
import SimulationApproveReject from '../../../costing/components/approval/SimulationApproveReject';
import { Redirect } from 'react-router-dom/cjs/react-router-dom';

const gridOptions = {

};

// const ExcelFile = ReactExport.ExcelFile;
// const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
// const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

function RMIndexationSimulation(props) {

    const { showEditMaster, handleEditMasterPage, showCompressedColumns, render } = useContext(simulationContext) || {};


    const { list, isbulkUpload, rowCount, technology, master, isImpactedMaster, costingAndPartNo, tokenForMultiSimulation, technologyId, isApprovalSummary, isCostingSimulation } = props
    const [showRunSimulationDrawer, setShowRunSimulationDrawer] = useState(false)
    const [showverifyPage, setShowVerifyPage] = useState(false)
    const [token, setToken] = useState('')
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [textFilterSearch, setTextFilterSearch] = useState('')
    const [isDisable, setIsDisable] = useState(false)
    const [effectiveDate, setEffectiveDate] = useState('');
    const [maxDate, setMaxDate] = useState('');
    const [isEffectiveDateSelected, setIsEffectiveDateSelected] = useState(false);
    const [isWarningMessageShow, setIsWarningMessageShow] = useState(false)
    const [titleObj, setTitleObj] = useState({})
    const [showPopup, setShowPopup] = useState(false)
    const [popupMessage, setPopupMessage] = useState('There is no changes in scrap rate Do you want to continue')
    const gridRef = useRef();
    const [noData, setNoData] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false)
    const [basicRateviewTooltip, setBasicRateViewTooltip] = useState(false)
    const [scrapRateviewTooltip, setScrapRateViewTooltip] = useState(false)
    const [isLoader, setIsLoader] = useState(false)
    const [isScrapUOMApplyTemp, setIsScrapUOMApplyTemp] = useState(false)
    const [openCommodityDrawer, setOpenCommodityDrawer] = useState(false)
    const [editIndex, setEditIndex] = useState(false)
    const [commodityDetailForRow, setCommodityDetailForRow] = useState([])
    const [otherCostDetailForRow, setOtherCostDetailForRow] = useState([])
    const [openOtherCostDrawer, setOpenOtherCostDrawer] = useState(false)
    const [isViewFlag, setIsViewFlag] = useState(false)
    const [totalBasicRate, setTotalBasicRate] = useState('')
    const [rowData, setRowData] = useState([])
    const [simulationId, setSimulationId] = useState('')
    const [isRunSimulationClicked, setRunSimulationClicked] = useState(false)
    const [isApprovalDrawer, setIsApprovalDrawer] = useState(false)
    const [simulationTechnologyId, setSimulationTechnologyIdState] = useState('')
    const [simulationHeadId, setSimulationHeadId] = useState('')
    const [tokenNumber, setTokenNumber] = useState('')
    const [showApprovalHistory, setShowApprovalHistory] = useState(false)
    const { register, control, setValue, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })


    const dispatch = useDispatch()

    const currencySelectList = useSelector(state => state.comman.currencySelectList)
    const { selectedMasterForSimulation, exchangeRateListBeforeDraft, indexedRMForSimulation } = useSelector(state => state.simulation)
    const simulationApplicability = useSelector(state => state.simulation.simulationApplicability)
    const rmIndexedSimulationSummaryData = useSelector(state => state.simulation.simulatedRawMaterialSummary?.SimulationRawMaterialDetailsResponse)

    const { commodityDetailsArray } = useSelector((state) => state.indexation)
    const { filteredRMData } = useSelector(state => state.material)
    const columnWidths = {
        CostingHead: showCompressedColumns ? 50 : 140,
        VendorCode: showCompressedColumns ? 50 : 160,
        RawMaterialName: showCompressedColumns ? 50 : 160,
        RawMaterialGradeName: showCompressedColumns ? 50 : 120,
        RawMaterialSpecificationName: showCompressedColumns ? 50 : 140,
        RawMaterialCode: showCompressedColumns ? 50 : 135,
        Category: showCompressedColumns ? 50 : 110,
        TechnologyName: showCompressedColumns ? 50 : 125,
        CustomerName: showCompressedColumns ? 50 : 160,
        PlantCode: showCompressedColumns ? 50 : 160,
        UnitOfMeasurementName: showCompressedColumns ? 50 : 100,
        CostingNumber: showCompressedColumns ? 50 : 190,
        PartNumber: showCompressedColumns ? 50 : 190,
        MachiningScrapRate: showCompressedColumns ? 50 : 170,
        EffectiveDate: showCompressedColumns ? 50 : 140,
        OldRMNetLandedCostConversion: showCompressedColumns ? 70 : 120,
        NewRMNetLandedCostConversion: showCompressedColumns ? 70 : 120,
        ScrapRatePerScrapUOM: showCompressedColumns ? 70 : 120,
        NewScrapRatePerScrapUOM: showCompressedColumns ? 70 : 120
    };
    useEffect(() => {
        if (isApprovalSummary) {
            setIsViewFlag(true)
        }
    }, [isApprovalSummary])
    useEffect(() => {
        if ((!props?.isFromApprovalListing && !isApprovalSummary && !isCostingSimulation)) {
            setIsLoader(true)
            let rawMaterialIds = isCostingSimulation ? props?.list && props?.list?.length > 0 && props?.list.map(item => item.NewRawMaterialIndexationDetails.RawMaterialId) : props?.list && props?.list?.length > 0 && props?.list.map(item => item.RawMaterialId)
            let obj = {

                "RawMaterialIds": rawMaterialIds,
                "TechnologyId": null,
                "SimulationTechnologyId": selectedMasterForSimulation?.value,
                "EffectiveDate": null,
                "LoggedInUserId": loggedInUserId(),
                "SimulationHeadId": RAWMATERIALAPPROVALTYPEID,
                "IsSimulationWithOutCosting": true

            }
            dispatch(draftSimulationForRMMaster(obj, (res) => {

                let obj1 = {
                    SimulationId: res?.data?.Identity
                }
                setSimulationId(res?.data?.Identity)
                if (res?.data?.Result) {
                    dispatch(editRMIndexedSimulationData(obj1, (res) => {

                        if (res?.data?.Result) {
                            setTimeout(() => {
                                setIsLoader(false)
                            }, 1000)

                        } else {
                            setIsLoader(false)
                        }
                    }))
                } else {
                    setIsLoader(false)
                }

            }))
        }
    }, [])

    useEffect(() => {

        if (props?.isFromApprovalListing && !isApprovalSummary && !isCostingSimulation) {
            let obj1 = {
                SimulationId: props?.simulationId
            }
            setIsLoader(true)
            setSimulationId(props?.simulationId)

            dispatch(editRMIndexedSimulationData(obj1, (res) => {

                if (res?.data?.Result) {
                    setTimeout(() => {
                        setRunSimulationClicked(true)
                        setIsViewFlag(true)
                        setTokenNumber(res?.data?.Data?.TokenNumber)
                        setSimulationTechnologyIdState(res?.data?.Data?.SimulationTechnologyId)
                        setSimulationHeadId(res?.data?.Data?.SimulationHeadId)
                        setIsLoader(false)
                        reactLocalStorage.setObject('isSaveSimualtionCalled', '')
                    }, 1000)

                } else {
                    setIsLoader(false)
                }
            }))
        }
    }, [props?.isFromApprovalListing])
    useEffect(() => {

        if (handleEditMasterPage) {
            handleEditMasterPage(showEditMaster, showverifyPage)
        }
    }, [showverifyPage])
    useEffect(() => {
        if (list && list.length > 0) {
            window.screen.width >= 1921 && gridRef.current.api.sizeColumnsToFit();
            let tempList = [...list]
            let maxDate = getMaxDate(tempList)
            setMaxDate(maxDate?.NewRawMaterialIndexationDetails?.EffectiveDate)
        }
    }, [list])


    const verifySimulation = debounce((e, type) => {
        setIsDisable(true)
        setIsLoader(true)
        if (type !== 'verify') {

            let obj = {
                LoggedInUserId: loggedInUserId(),
                SimulationId: simulationId,
                IsProvisional: false
            }
            dispatch(runSimulationOnRawMaterial(obj, (res) => {
                if (res?.data?.Result) {

                    setIsDisable(false)
                    let obj1 = {
                        LoggedInUserId: loggedInUserId(),
                        SimulationId: simulationId
                    }

                    dispatch(editRMIndexedSimulationData(obj1, (res) => {

                        setRunSimulationClicked(true)
                        setIsViewFlag(true)
                        setTokenNumber(res?.data?.Data?.TokenNumber)
                        setSimulationTechnologyIdState(res?.data?.Data?.SimulationTechnologyId)
                        setSimulationHeadId(res?.data?.Data?.SimulationHeadId)
                        setIsLoader(false)

                    }))
                } else {
                    setIsDisable(false)
                }
            }))
        } else {
            let obj = {}
            obj.Technology = technology
            obj.SimulationTechnologyId = selectedMasterForSimulation.value
            obj.SimulationHeadId = list[0]?.CostingHeadId
            obj.Masters = master
            obj.LoggedInUserId = loggedInUserId()

            obj.TechnologyId = technologyId
            obj.EffectiveDate = DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss')
            if (filteredRMData.plantId && filteredRMData.plantId.value) {
                obj.PlantId = filteredRMData.plantId ? filteredRMData.plantId.value : ''
            }
            let tempArr = []

            list && list.map(item => {
                let tempObj = {}
                tempObj.RawMaterialId = item.OldRawMaterialIndexationDetails.RawMaterialId
                tempObj.NewRawMaterialId = item.NewRawMaterialIndexationDetails.RawMaterialId
                tempObj.CostingHead = item.CostingHead
                tempObj.RawMaterialName = item.RawMaterialName
                tempObj.MaterialType = item.MaterialType
                tempObj.RawMaterialGrade = item.RawMaterialGradeName
                tempObj.RawMaterialSpecification = item.RawMaterialSpecificationName
                tempObj.RawMaterialCategory = item.Category
                tempObj.UOM = item.UOM
                tempObj.OldBasicRate = item.OldRawMaterialIndexationDetails.BasicRate
                tempObj.NewBasicRate = item.NewRawMaterialIndexationDetails.BasicRate
                tempObj.OldScrapRate = item.OldRawMaterialIndexationDetails.ScrapRate
                tempObj.NewScrapRate = item.NewRawMaterialIndexationDetails.ScrapRate
                tempObj.RawMaterialFreightCost = checkForNull(item.RMFreightCost)
                tempObj.RawMaterialShearingCost = checkForNull(item.RMShearingCost)
                tempObj.OldNetLandedCost = item.OldRawMaterialIndexationDetails.NetLandedCost
                tempObj.NewNetLandedCost = item.NewRawMaterialIndexationDetails.NetLandedCost
                tempObj.EffectiveDate = item.NewRawMaterialIndexationDetails.EffectiveDate
                tempObj.PlantId = item.PlantId
                tempObj.VendorId = item.VendorId
                tempObj.Delta = 0
                tempObj.OldScrapRatePerScrapUOM = 0
                tempObj.NewScrapRatePerScrapUOM = 0
                tempArr.push(tempObj)

                return null;
            })

            obj.SimulationIds = tokenForMultiSimulation
            obj.SimulationRawMaterials = tempArr
            obj.SimulationExchangeRates = []
            obj.IsExchangeRateSimulation = false
            obj.IsSimulationWithOutCosting = false

            dispatch(runVerifySimulation(obj, res => {
                setIsDisable(false)

                if (res?.data?.Result) {
                    setToken(res?.data?.Identity)
                    setShowVerifyPage(true)
                }
            }))
        }



    }, 600)


    const cancelVerifyPage = () => {

        setShowVerifyPage(false)
    }
    const resetState = () => {
        gridApi?.setQuickFilter('');
        setTextFilterSearch('')
        gridOptions?.columnApi?.resetColumnState();
        gridOptions?.api?.setFilterModel(null);
        window.screen.width >= 1921 && gridRef.current.api.sizeColumnsToFit();
    }

    /**
     * @method shearingCostFormatter
     * @description Renders buttons
     */
    const CostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        return cell != null ? cell : '-';
    }

    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            if (list.length !== 0) {
                setNoData(searchNocontentFilter(value, noData))
            }
        }, 500);
    }
    const effectiveDateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        return cell != null ? <span title={DayTime(cell).format('DD/MM/YYYY')}>{DayTime(cell).format('DD/MM/YYYY')}</span> : '';
    }


    const costingHeadFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell ? cell : '-';
    }

    const vendorFormatter = (props) => {
        return (<span title={isbulkUpload || isCostingSimulation ? props?.value : props?.data.VendorName}>{isbulkUpload || isCostingSimulation ? props?.value : props?.data.VendorName}</span>);
    }

    const customerFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (<span title={isbulkUpload ? row['Customer (Code)'] : row.CustomerName}>{isbulkUpload ? row['Customer (Code)'] : row.CustomerName}</span>);
    }

    const plantFormatter = (props) => {
        return (<span title={isbulkUpload || isCostingSimulation ? props?.value : props?.data.DestinationPlantName}>{isbulkUpload || isCostingSimulation ? props?.value : props?.data.DestinationPlantName}</span>);
    }
    const newBasicRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell, props, "basicRate")
        let PercentageCalc = 0
        if (row.Percentage) {
            PercentageCalc = (row?.BasicRatePerUOM + (Number(row?.BasicRatePerUOM) * Number(row?.Percentage) / 100))
            if (isNaN(PercentageCalc)) {
                PercentageCalc = row?.BasicRatePerUOM
            }
        }
        return (
            <>
                {
                    isImpactedMaster ?
                        checkForDecimalAndNull(row.NewBasicRate, getConfigurationKey().NoOfDecimalForPrice) :
                        <span id={`newBasicRate-${props.rowIndex}`} className={`${!isbulkUpload ? 'form-control-disabled' : ''} ${row?.Percentage && Number(row?.Percentage) !== 0 && !row?.NewBasicRate ? 'disabled' : ''} basicRate_revised`} title={cell && value ? Number(cell) : Number(row.BasicRatePerUOM)}>{cell && value ? Number(cell) : row.Percentage ? PercentageCalc : isbulkUpload ? checkForNull(cell) : checkForNull(row.BasicRatePerUOM)} </span>
                }
                {!isCostingSimulation && <button
                    type="button"
                    className={`${isRunSimulationClicked || isApprovalSummary ? 'View small' : ' add-out-sourcing'} `}
                    onClick={() => CommodityDetailDrawer(value, row, props.rowIndex, 'New')}
                    title="Add"
                >
                </button>}

            </>
        )
    }
    const CommodityDetailDrawer = (value, row, index, type) => {
        setRowData(row)

        if (type === 'Old') {
            setCommodityDetailForRow(row?.OldMaterialCommodityIndexRateDetails)
            const updatedCommodityDetails = row?.OldMaterialCommodityIndexRateDetails.map(detail => {

                return {
                    ...detail,
                    ExchangeRate: detail ? detail.ExchangeRate : null,
                    TotalCostPercent: checkForNull(detail?.TotalCostConversion) * checkForNull(detail?.Percentage) / 100,
                };
            });
            setIsViewFlag(true)
            dispatch(setCommodityDetails(updatedCommodityDetails))

            setEditIndex(index)
        } else {
            setCommodityDetailForRow(row?.NewMaterialCommodityIndexRateDetails)
            const updatedCommodityDetails = row?.NewMaterialCommodityIndexRateDetails.map(detail => {

                return {
                    ...detail,
                    ExchangeRate: detail ? detail.ExchangeRate : null,
                    TotalCostPercent: checkForNull(detail?.TotalCostConversion) * checkForNull(detail?.Percentage) / 100,
                };

            });
            setIsViewFlag(isRunSimulationClicked || isApprovalSummary ? true : false)
            dispatch(setCommodityDetails(updatedCommodityDetails))
            setEditIndex(index)
            setOtherCostDetailForRow(row?.NewRawMaterialOtherCostDetails)
        }
        ;

        setOpenCommodityDrawer(true)

    }
    const closeCommodityDrawer = (type, basicRate = '') => {
        if (type === 'Save') {
            setTotalBasicRate(basicRate)
            calculateAndSave(basicRate)
        }
        setOpenCommodityDrawer(false)
        setOtherCostDetailForRow([])
        setCommodityDetailForRow([])
    }

    const otherCostDrawer = (value, row, index, type) => {
        setRowData(row)
        if (type === 'Old') {
            const basicRate = checkForNull(row?.OldBasicRatePerUOM)

            setTotalBasicRate(basicRate)
            setOtherCostDetailForRow(row?.OldRawMaterialOtherCostDetails)
            setIsViewFlag(true)
            setEditIndex(index)
        } else {
            const basicRate = checkForNull(row?.NewBasicRatePerUOM)

            setTotalBasicRate(basicRate)
            setOtherCostDetailForRow(row?.NewRawMaterialOtherCostDetails)
            setIsViewFlag(isRunSimulationClicked || isApprovalSummary ? true : false)
            setEditIndex(index)
        }
        setOpenOtherCostDrawer(true)

    }
    const closeOtherCostDrawer = (type, data, total, totalBase) => {

        if (type === 'Save') {
            calculateAndSave(totalBasicRate, data, totalBase, 'Other Cost')
        }
        setOpenOtherCostDrawer(false)
        setIsViewFlag(false)
        setOtherCostDetailForRow([])
    }

    const calculateAndSave = (basicRate = 0, data = [], totalBase = 0, type = '') => {
        const selectedRow = indexedRMForSimulation[editIndex]

        setIsLoader(true)
        let updatedOtherCostTotal = []
        let totalOtherCost = 0
        if (type === 'Other Cost') {
            updatedOtherCostTotal = data
            totalOtherCost = checkForNull(totalBase)
        } else {

            let OtherCostData = _.cloneDeep(otherCostDetailForRow)
            updatedOtherCostTotal = OtherCostData && OtherCostData.map(costDataitem => {
                let totalCostCurrency = 0;
                let applicability = 0;
                let totalCostAfterApplicability = 0
                if (costDataitem.Applicability === 'Basic Rate' || costDataitem.Applicability.includes('Basic Rate')) {
                    const selectedApplicabilities = costDataitem?.Applicability.split(' + ');
                    selectedApplicabilities.forEach(Applicability => {

                        // Skip checking for "Basic Rate" in tableData
                        // if (Applicability === 'Basic Rate') {
                        //     applicability = checkForNull(basicRate)
                        //     totalCostAfterApplicability = (applicability * costDataitem?.Value) / 100
                        //     return { ...costDataitem, ApplicabilityCostConversion: applicability, NetCostConversion: totalCostAfterApplicability, ApplicabilityCost: applicability, NetCost: totalCostAfterApplicability, }
                        // } else {

                        const item = OtherCostData.find(otherItem => otherItem?.Applicability === Applicability);

                        if (item) {
                            if (Applicability === 'Basic Rate') {
                                totalCostCurrency = 0
                            } else {
                                totalCostCurrency += item?.NetCostConversion;
                            }
                            if (item?.Applicability.includes('Basic Rate')) {
                                applicability = checkForNull(totalCostCurrency) + checkForNull(basicRate)
                                totalCostAfterApplicability = (applicability * costDataitem?.Value) / 100
                            }
                        }

                    })
                    return { ...costDataitem, ApplicabilityCostConversion: applicability, NetCostConversion: totalCostAfterApplicability, ApplicabilityCost: applicability, NetCost: totalCostAfterApplicability, }
                } else {
                    return costDataitem
                }
            })
            totalOtherCost = updatedOtherCostTotal && updatedOtherCostTotal.reduce((total, item) => total + checkForNull(item?.NetCostConversion), 0);
        }


        const obj = {
            SimulationRawMaterialId: rowData?.NewRawMaterialId,//
            RawMaterialId: rowData?.OldRawMaterialId,//
            CutOffPrice: rowData?.NewCutOffPrice, //RECALCULATE
            IsCutOffApplicable: rowData?.NewIsCutOffApplicable, //RECALCULATE

            BasicRatePerUOM: basicRate,
            ScrapRate: selectedRow?.NewScrapRate,
            ScrapRateInINR: '',
            CutOffPriceInINR: '',
            NetLandedCost: checkForNull(basicRate) + checkForNull(totalOtherCost),
            EffectiveDate: rowData?.NewEffectiveDate,
            LoggedInUserId: loggedInUserId(),
            NetLandedCostConversion: '',
            BasicRatePerUOMConversion: '',
            FromDate: rowData?.NewFromDate,
            ToDate: rowData?.NewToDate,
            CommodityNetCost: basicRate,//Confirm From Sam
            CommodityNetCostConversion: 0,
            OtherNetCost: totalOtherCost,
            OtherNetCostConversion: totalOtherCost,
            MaterialCommodityIndexRateDetails: commodityDetailsArray,
            RawMaterialOtherCostDetails: updatedOtherCostTotal,
            Plant: selectedRow?.Plant
        }

        dispatch(updateSimulationRawMaterial(obj, (response) => {
            if (response?.data?.Result) {
                let obj1 = {
                    SimulationId: simulationId
                }
                dispatch(editRMIndexedSimulationData(obj1, (res) => {
                    if (res?.data?.Result) {
                        setTimeout(() => {
                            setIsLoader(false)
                        }, 1000)

                    } else {
                        setIsLoader(false)
                    }
                }))
            }

        }))
    }



    const oldBasicRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.OldBasicRate :
                        <span title={cell && value ? Number(cell) : Number(row.BasicRatePerUOM)}>{cell && value ? Number(cell) : Number(row.BasicRatePerUOM)} </span>
                }
                {!isCostingSimulation && <button
                    type="button"
                    className={`${isRunSimulationClicked || isApprovalSummary ? 'View small' : 'add-out-sourcing'} `}
                    onClick={() => CommodityDetailDrawer(value, row, props.rowIndex, 'Old')}
                    title="Add"
                >
                </button>}

            </>
        )
    }

    const newScrapRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : isCostingSimulation ? props.data.NewRawMaterialIndexationDetails : props?.data;
        const value = beforeSaveCell(cell, props, "scrapRate")
        return (
            <>
                {
                    (isImpactedMaster || isRunSimulationClicked || isApprovalSummary || isCostingSimulation) ?
                        checkForDecimalAndNull(isCostingSimulation ? row.ScrapRate : row.NewScrapRate, getConfigurationKey().NoOfDecimalForPrice) :
                        <span id={`newScrapRate-${props.rowIndex}`} className={`${!isbulkUpload ? 'form-control' : ''} ${row.IsScrapUOMApply === 'Yes' ? 'disabled' : ''}`} title={cell && value ? Number(cell) : Number(row.ScrapRate)} >{cell && value ? Number(cell) : Number(row.ScrapRate)}</span>
                }
            </>
        )
    }
    const newScrapRateUOMFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const newScrapRateInOldUOM = checkForDecimalAndNull(cell * row?.CalculatedFactor, getConfigurationKey().NoOfDecimalForPrice)
        const value = beforeSaveCell(newScrapRateInOldUOM, props, "scrapRate")
        if (value && !isImpactedMaster) {
            row.NewScrapRate = newScrapRateInOldUOM
            row.NewScrapRatePerScrapUOM = cell
        }
        return (
            <>
                {
                    isImpactedMaster ?
                        checkForDecimalAndNull(row.NewScrapRatePerScrapUOM, getConfigurationKey().NoOfDecimalForPrice) :
                        <span id={`newScrapRate-${props.rowIndex}`} className={`${!isbulkUpload ? 'form-control' : ''} ${row.IsScrapUOMApply === 'No' ? 'disabled' : ''}`} title={cell && value ? Number(cell) : Number(row.ScrapRatePerScrapUOM)} >{cell && value ? Number(cell) : Number(row.ScrapRatePerScrapUOM)}</span>
                }
            </>
        )
    }

    const oldScrapRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.OldScrapRate :
                        <span title={cell && value ? Number(cell) : Number(row.ScrapRate)}>{cell && value ? Number(cell) : Number(row.ScrapRate)}</span>
                }
            </>
        )
    }

    const oldScrapRateFormatterPerScrapUOM = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.OldScrapRatePerScrapUOM :
                        <span title={cell && value ? Number(cell) : Number(row.ScrapRate)}>{cell && value ? Number(cell) : Number(row.ScrapRate)}</span>
                }
            </>
        )
    }

    // const colorCheck = 

    const costFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return isImpactedMaster ? checkForDecimalAndNull(row?.OldNetLandedCost, getConfigurationKey().NoOfDecimalForPrice) : checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)
    }

    /**
  * @method beforeSaveCell
  * @description CHECK FOR ENTER NUMBER IN CELL
  */
    const beforeSaveCell = (cell, props, type) => {
        const cellValue = cell
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        if ((row?.NewBasicRate === undefined || row?.NewBasicRate === '' ? Number(row?.BasicRatePerUOM) : Number(row?.NewBasicRate)) <
            (row?.NewScrapRate === undefined || row?.NewScrapRate === '' ? Number(row?.ScrapRate) : Number(row?.NewScrapRate))) {
            if (type === "basicRate") {
                row.NewBasicRate = row?.BasicRatePerUOM
            } else if (type === "scrapRate") {
                row.NewScrapRate = row?.ScrapRate
            }
            Toaster.warning('Scrap Rate should be less than Basic Rate')
            return false
        }
        if (Number.isInteger(Number(cellValue)) && /^\+?(0|[1-9]\d*)$/.test(cellValue) && cellValue.toString().replace(/\s/g, '').length) {
            if (cellValue.length > 8) {
                Toaster.warning("Value should not be more than 8")
                return false
            }
            return true
        } else if (cellValue && !/^[+]?([0-9]+(?:[.][0-9]*)?|\.[0-9]+)$/.test(cellValue)) {
            Toaster.warning('Please enter a valid positive numbers.')
            if (type === "Percentage") {
                row.Percentage = 0
            }
            if (type === "basicRate") {
                row.NewBasicRate = row?.BasicRatePerUOM
            } else if (type === "scrapRate") {
                row.NewScrapRate = row?.ScrapRate
            }
            return false
        }

        return true
    }

    const NewcostFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : isCostingSimulation ? props.data.NewRawMaterialIndexationDetails : props?.data;
        const rowValue = isCostingSimulation ? row.NetLandedCost : row?.NewNetLandedCost

        return rowValue ? <span title={checkForDecimalAndNull(rowValue, getConfigurationKey().NoOfDecimalForPrice)}>{checkForDecimalAndNull(rowValue, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
        // checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)
    }
    const revisedBasicRateHeader = (props) => {
        return (
            <div className='ag-header-cell-label'>
                <span className='ag-header-cell-text '>Revised {!isImpactedMaster && <i className={`fa fa-info-circle tooltip_custom_right tooltip-icon mb-n3 ml-4 mt2 `} id={"basicRate-tooltip"}></i>} </span>
            </div>
        );
    };
    const revisedScrapRateHeader = (props) => {
        return (
            <div className='ag-header-cell-label'>
                <span className='ag-header-cell-text'>Revised {!isImpactedMaster && <i className={`fa fa-info-circle tooltip_custom_right tooltip-icon mb-n3 ml-4 mt2 `} id={"scrapRate-tooltip"}></i>} </span>
            </div>
        );
    };
    const cancel = () => {
        list && list.map((item) => {
            item.NewBasicRate = undefined
            item.NewScrapRate = undefined
            return null
        })
        props.backToSimulation()
        // setShowMainSimulation(true)                    //RE
    }

    const closeDrawer = (e = '') => {

        setShowRunSimulationDrawer(false)
    }


    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        editable: true
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
        setTimeout(() => {
            setShowTooltip(true)
        }, 100);
    };

    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
    };

    const onFilterTextBoxChanged = (e) => {

        gridApi?.setQuickFilter(e?.target?.value);
        setTextFilterSearch(e?.target?.value)
    }
    const cellChange = (props) => {
    }

    const onCellValueChanged = (props) => {
    }

    const handleEffectiveDateChange = (date) => {
        setEffectiveDate(date)
        setIsEffectiveDateSelected(true)
        setIsWarningMessageShow(false)
    }

    const EditableCallbackForNewScrapRate = (props) => {
        const rowData = props?.data;
        let value = false
        if (rowData?.IsScrapUOMApply === 'No') {
            value = false
        } else {
            value = true
        }
        return value
    }

    const EditableCallbackForNewScrapRateSecond = (props) => {
        const rowData = props?.data;
        let value = false
        if (rowData?.IsScrapUOMApply === 'Yes') {
            value = false
        } else {
            value = true
        }
        return value
    }

    const ageValueGetterPer = (params) => {
        let row = params.data
        if (!row.Percentage) {
            if (row.NewBasicRate) {
                return 0
            }
            return row?.BasicRatePerUOM * 0;
        } else {
            return row?.Percentage
        }
    };

    const percentageFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        let cellValue = cell
        if (cell && cell > 100) {
            Toaster.warning("Percentage should be less than or equal to 100")
            list[props.rowIndex].Percentage = 0
            cellValue = 0
        }
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cellValue, props, 'Percentage')
        return (
            <>
                {
                    <span id={`percentage${props.rowIndex}`} className={`${!isbulkUpload ? 'form-control' : ''} ${row.NewBasicRate ? 'disabled' : ''}`} >{cell && value ? row.NewBasicRate ? 0 : Number(cellValue) : (row?.Percentage ? row?.Percentage : 0)} </span>
                }
            </>
        )
    }

    /**
     * @method hyphenFormatter
     */
    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return cellValue ? cellValue : '-';
    }

    const changeList = (value) => {
        setIsLoader(true)
        list && list?.map(item => {
            item.Percentage = value;
            return null;
        })
        setTimeout(() => {
            setIsLoader(false)
        }, 100);
    }
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            changeList(e.target.value);
        }
    };

    const percentageHeader = () => {
        let value = '';
        const onHandler = (e) => {
            value = e.target.value
        }
        return (<div>
            <input type="text" className="form-control ag-grid-input" onChange={onHandler} onKeyPress={handleKeyPress} onBlur={() => changeList(value)} />
        </div>
        )
    }
    const existingOtherCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.OldBasicRate :
                        <span title={cell && value ? Number(cell) : Number(row.BasicRatePerUOM)}>{cell && value ? Number(cell) : Number(row.BasicRatePerUOM)} </span>

                }
                {!isCostingSimulation && <button
                    type="button"
                    className={`${isRunSimulationClicked || isApprovalSummary ? 'View small' : ' add-out-sourcing'} `}
                    onClick={() => otherCostDrawer(cell, row, props.rowIndex, 'Old')}
                    title="Add"
                >
                </button>}

            </>
        )
    }
    const revisedOtherCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.OldBasicRate :
                        <span title={cell && value ? Number(cell) : Number(row.BasicRatePerUOM)}>{cell && value ? Number(cell) : Number(row.BasicRatePerUOM)} </span>

                }
                {!isCostingSimulation && <button
                    type="button"
                    className={`${isRunSimulationClicked || isApprovalSummary ? 'View small' : ' add-out-sourcing'} `}
                    onClick={() => otherCostDrawer(cell, row, props.rowIndex, 'New')}
                    title="Add"
                >
                </button>}

            </>
        )
    }
    const frameworkComponents = {
        effectiveDateFormatter: effectiveDateFormatter,
        costingHeadFormatter: costingHeadFormatter,
        CostFormatter: CostFormatter,
        newScrapRateFormatter: newScrapRateFormatter,
        newScrapRateUOMFormatter: newScrapRateUOMFormatter,
        NewcostFormatter: NewcostFormatter,
        costFormatter: costFormatter,
        customNoRowsOverlay: NoContentFound,
        newBasicRateFormatter: newBasicRateFormatter,
        cellChange: cellChange,
        oldBasicRateFormatter: oldBasicRateFormatter,
        oldScrapRateFormatter: oldScrapRateFormatter,
        vendorFormatter: vendorFormatter,
        customerFormatter: customerFormatter,
        plantFormatter: plantFormatter,
        revisedBasicRateHeader: revisedBasicRateHeader,
        revisedScrapRateHeader: revisedScrapRateHeader,
        ageValueGetterPer: ageValueGetterPer,
        percentageFormatter: percentageFormatter,
        percentageHeader: percentageHeader,
        // nullHandler: props.nullHandler && props.nullHandler,
        oldScrapRateFormatterPerScrapUOM: oldScrapRateFormatterPerScrapUOM,
        hyphenFormatter: hyphenFormatter,
        existingOtherCostFormatter: existingOtherCostFormatter,
        revisedOtherCostFormatter: revisedOtherCostFormatter
    };


    const ageValueGetterScrapRate = (params) => {
        let row = params.data
        let valueReturn = ''
        if (row.IsScrapUOMApply === 'Yes') {
            valueReturn = checkForDecimalAndNull(row.NewScrapRatePerScrapUOM * row.CalculatedFactor, getConfigurationKey().NoOfDecimalForPrice)
        } else {
            valueReturn = row.NewScrapRate
        }
        return valueReturn
    }


    const basicRatetooltipToggle = () => {
        setBasicRateViewTooltip(!basicRateviewTooltip)
    }
    const scrapRatetooltipToggle = () => {
        setScrapRateViewTooltip(!scrapRateviewTooltip)
    }

    const onBtExport = () => {
        if (String(props?.masterId) === String(RMIMPORT)) {
            return returnExcelColumn(RM_IMPACT_DOWNLOAD_EXCEl_IMPORT, list)
        } else {

            return returnExcelColumn(RM_IMPACT_DOWNLOAD_EXCEl, list)
        }
    };

    const returnExcelColumn = (data = [], TempData) => {
        let temp = []
        TempData && TempData.map((item) => {
            item.EffectiveDate = (item.EffectiveDate)?.slice(0, 10)
            temp.push(item)
        })
        // return (
        //     <ExcelSheet data={temp} name={'RM Data'}>
        //         {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
        //     </ExcelSheet>);
    }

    const sendForApproval = () => {
        setIsApprovalDrawer(true)
    }
    const closeApprovalDrawer = (value, type) => {
        setIsApprovalDrawer(false)
        if (type === 'submit') {
            setShowApprovalHistory(true)
        }
    }

    return (

        <div>
            <div className={`ag-grid-react ${props.customClass}`}>
                {!showverifyPage &&
                    // {(!showverifyPage && !showMainSimulation) &&                    //RE
                    <Fragment>
                        {showTooltip && !isImpactedMaster && <Tooltip className="rfq-tooltip-left" placement={"top"} isOpen={basicRateviewTooltip} toggle={basicRatetooltipToggle} target={"basicRate-tooltip"} >{"To edit revised basic rate please double click on the field."}</Tooltip>}
                        {showTooltip && !isImpactedMaster && <Tooltip className="rfq-tooltip-left" placement={"top"} isOpen={scrapRateviewTooltip} toggle={scrapRatetooltipToggle} target={"scrapRate-tooltip"} >{"To edit revised scrap rate please double click on the field."}</Tooltip>}
                        <Row>
                            <Col className="add-min-height mb-3 sm-edit-page">
                                <div className={`ag-grid-wrapper height-width-wrapper reset-btn-container ${(list && list?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                                    <div className="ag-grid-header d-flex justify-content-between">
                                        <div className='d-flex align-items-center'>

                                            <input type="text" className="form-control mr-1 table-search" id="filter-text-box" value={textFilterSearch} placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                            <button type="button" className="user-btn float-right mr-3 Tour_List_Reset" title="Reset Grid" onClick={() => resetState()}>
                                                <div className="refresh mr-0"></div>
                                            </button>
                                            {/* <ExcelFile filename={`${props.lastRevision ? 'Last Revision Data' : 'Impacted Master Data'}`} fileExtension={'.xls'} element={
                                                <button title="Download" type="button" className={'user-btn'} ><div className="download mr-0"></div></button>}>
                                                {onBtExport()}
                                            </ExcelFile> */}
                                        </div>
                                        <div className='d-flex justify-content-end'>
                                            {isRunSimulationClicked && list && <div className={`d-flex align-items-center simulation-label-container`}>
                                                <div className='d-flex'>
                                                    <label>Token No: </label>
                                                    <p className='technology ml-1' title={tokenNumber}>{tokenNumber}</p>
                                                </div>
                                            </div>}
                                        </div>
                                        {
                                            !props?.isFromApprovalListing && !isApprovalSummary &&
                                            <button type="button" className={"apply ml-2 back_simulationPage"} id="simulation-back" onClick={props?.backToSimulation} disabled={isDisable}> <div className={'back-icon'}></div>Back</button>
                                        }


                                    </div>
                                    <div className="ag-theme-material p-relative" style={{ width: '100%' }}>
                                        {/* {isLoader && <LoaderCustom />} */}
                                        {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found simulation-lisitng" />}
                                        {indexedRMForSimulation &&
                                            ((render || isLoader) ? <LoaderCustom customClass="loader-center" /> : (<AgGridReact

                                                ref={gridRef}
                                                floatingFilter={true}
                                                style={{ height: '100%', width: '100%' }}
                                                defaultColDef={defaultColDef}
                                                domLayout='autoHeight'
                                                // columnDefs={c}
                                                rowData={isApprovalSummary ? rmIndexedSimulationSummaryData : isCostingSimulation ? list : indexedRMForSimulation ?? []}
                                                pagination={true}
                                                paginationPageSize={defaultPageSize}
                                                onGridReady={onGridReady}
                                                gridOptions={gridOptions}
                                                loadingOverlayComponent={'customLoadingOverlay'}
                                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                                noRowsOverlayComponentParams={{
                                                    title: EMPTY_DATA,
                                                }}
                                                frameworkComponents={frameworkComponents}
                                                suppressColumnVirtualisation={true}
                                                stopEditingWhenCellsLoseFocus={true}
                                                onCellValueChanged={onCellValueChanged}
                                                onFilterModified={onFloatingFilterChanged}
                                                enableBrowserTooltips={true}
                                            >
                                                {
                                                    !isImpactedMaster &&
                                                    <AgGridColumn width={columnWidths.CostingHead} field="CostingHead" tooltipField='CostingHead' headerName="Costing Head" editable='false' cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                                                }
                                                <AgGridColumn width={columnWidths.RawMaterialName} field="RawMaterialName" tooltipField='RawMaterialName' editable='false' headerName="Raw Material"></AgGridColumn>
                                                <AgGridColumn width={columnWidths.RawMaterialGradeName} field={props.isCostingSimulation ? 'RawMaterialGrade' : "RawMaterialGradeName"} tooltipField='RawMaterialGradeName' editable='false' headerName="Grade" ></AgGridColumn>
                                                <AgGridColumn width={columnWidths.RawMaterialSpecificationName} field={props.isCostingSimulation ? 'RawMaterialSpecs' : "RawMaterialSpecificationName"} tooltipField='RawMaterialSpecificationName' editable='false' headerName="Spec"></AgGridColumn>
                                                <AgGridColumn width={columnWidths.RawMaterialCode} field="RawMaterialCode" tooltipField='RawMaterialCode' editable='false' headerName='Code' cellRenderer='hyphenFormatter'></AgGridColumn>
                                                {!isImpactedMaster && <AgGridColumn width={columnWidths.RawMaterialCategoryName} field={props.isCostingSimulation ? 'Category' : "RawMaterialCategoryName"} tooltipField='RawMaterialCategoryName' editable='false' headerName="Category"></AgGridColumn>}
                                                {!isImpactedMaster && <AgGridColumn width={columnWidths.TechnologyName} field={props.isCostingSimulation ? 'Technology' : "TechnologyName"} tooltipField='TechnologyName' editable='false' headerName="Technology" ></AgGridColumn>}
                                                {!isImpactedMaster && list && list[0]?.CostingTypeId !== CBCTypeId && <AgGridColumn width={columnWidths.VendorCod} field={props.isCostingSimulation ? 'VendorCode' : "Vendor (Code)"} tooltipField='Vendor (Code)' editable='false' headerName="Vendor (Code)" cellRenderer='vendorFormatter'></AgGridColumn>}
                                                {!isImpactedMaster && list && list[0]?.CostingTypeId === CBCTypeId && <AgGridColumn width={columnWidths.CustomerName} field={props.isCostingSimulation ? 'CustomerCode' : "CustomerName"} tooltipField='CustomerName' editable='false' headerName="Customer (Code)" cellRenderer='customerFormatter'></AgGridColumn>}
                                                {!isImpactedMaster && <AgGridColumn width={columnWidths.PlantCode} field={props.isCostingSimulation ? 'PlantCode' : "Plant (Code)"} editable='false' headerName="Plant (Code)" tooltipField='Plant (Code)' cellRenderer='plantFormatter' ></AgGridColumn>}
                                                <AgGridColumn width={columnWidths.UnitOfMeasurementName} field={props.isCostingSimulation ? 'UOM' : "UnitOfMeasurementName"} tooltipField='UnitOfMeasurementName' editable='false' headerName="UOM"></AgGridColumn>
                                                {isScrapUOMApplyTemp && <AgGridColumn width={150} field="ScrapUnitOfMeasurement" tooltipField='ScrapUnitOfMeasurement' editable='false' headerName="Scrap UOM" cellRenderer='hyphenFormatter'></AgGridColumn>}
                                                {costingAndPartNo && <AgGridColumn field="CostingNumber" tooltipField='CostingNumber' editable='false' headerName="Costing No" width={columnWidths.CostingNumber}></AgGridColumn>}
                                                {costingAndPartNo && <AgGridColumn field="PartNumber" tooltipField='PartNumber' editable='false' headerName="Part No" width={columnWidths.PartNumber}></AgGridColumn>}

                                                {String(props?.masterId) === String(RMIMPORT) && <AgGridColumn field="Currency" tooltipField='Currency' editable='false' headerName="Currency" minWidth={140} ></AgGridColumn>}
                                                {(isImpactedMaster && String(props?.masterId) === String(RMIMPORT)) && <AgGridColumn field="ExchangeRate" tooltipField='ExchangeRate' editable='false' headerName="Existing Exchange Rate" minWidth={140} ></AgGridColumn>}
                                                <AgGridColumn field='IndexExchangeName' tooltipField='IndexExchangeName' editable='false' headerName="Index" minWidth={140} ></AgGridColumn>
                                                <AgGridColumn field='ExchangeRateSourceName' tooltipField='ExchangeRateSourceName' editable='false' headerName="Exchange Rate Source" minWidth={140} ></AgGridColumn>
                                                <AgGridColumn field='MaterialType' tooltipField='MaterialType' editable='false' headerName="Material" minWidth={140} ></AgGridColumn>

                                                <AgGridColumn width={columnWidths.FrequencyOfSettlement} field={isCostingSimulation ? 'NewRawMaterialIndexationDetails.FrequencyOfSettlement' : "FrequencyOfSettlement"} editable='false' headerName={"Frequency Of Settlement"} ></AgGridColumn>
                                                <AgGridColumn width={columnWidths.OldFromDate} field={isCostingSimulation ? 'OldRawMaterialIndexationDetails.FromDate' : "OldFromDate"} editable='false' cellRenderer={'effectiveDateFormatter'} headerName={props.isImpactedMaster && !props.lastRevision ? "Old Effective date" : "Old From Date"} ></AgGridColumn>
                                                <AgGridColumn width={columnWidths.NewFromDate} field={isCostingSimulation ? 'NewRawMaterialIndexationDetails.FromDate' : "NewFromDate"} editable='false' cellRenderer={'effectiveDateFormatter'} headerName={props.isImpactedMaster && !props.lastRevision ? "New Effective date" : "New From Date"} ></AgGridColumn>
                                                <AgGridColumn width={columnWidths.OldToDate} field={isCostingSimulation ? 'OldRawMaterialIndexationDetails.ToDate' : "OldToDate"} editable='false' cellRenderer={'effectiveDateFormatter'} headerName={props.isImpactedMaster && !props.lastRevision ? "Old Effective date" : "Old To Date"} ></AgGridColumn>
                                                <AgGridColumn width={columnWidths.NewToDate} field={isCostingSimulation ? 'NewRawMaterialIndexationDetails.ToDate' : "NewToDate"} editable='false' cellRenderer={'effectiveDateFormatter'} headerName={props.isImpactedMaster && !props.lastRevision ? "New Effective date" : "New To Date"} ></AgGridColumn>
                                                <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={300} headerName={
                                                    (Number(selectedMasterForSimulation?.value) === Number(RMIMPORT) ||
                                                        Number(selectedMasterForSimulation?.value) === Number(EXCHNAGERATE) ||
                                                        String(props?.masterId) === String(RMIMPORT))
                                                        ? "Basic Rate (Currency)"
                                                        : `Basic Rate (${reactLocalStorage.getObject("baseCurrency")})`
                                                } marryChildren={true} >
                                                    <AgGridColumn width={150} cellRenderer='oldBasicRateFormatter' field={isImpactedMaster ? "OldBasicRate" : isCostingSimulation ? 'OldRawMaterialIndexationDetails.BasicRate' : "OldBasicRatePerUOM"} editable='false' headerName="Existing" colId={isImpactedMaster ? "OldBasicRate" : "OldBasicRatePerUOM"}></AgGridColumn>
                                                    <AgGridColumn width={150} cellRenderer='newBasicRateFormatter' editable='false' field={isCostingSimulation ? 'NewRawMaterialIndexationDetails.BasicRate' : "NewBasicRatePerUOM"} headerName="Revised" colId='NewBasicRatePerUOM' ></AgGridColumn>
                                                </AgGridColumn>

                                                <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={300} marryChildren={true} headerName={
                                                    (Number(selectedMasterForSimulation?.value) === Number(RMIMPORT) ||
                                                        Number(selectedMasterForSimulation?.value) === Number(EXCHNAGERATE) ||
                                                        String(props?.masterId) === String(RMIMPORT)
                                                    )
                                                        ? "Scrap Rate (Currency)"
                                                        : `Scrap Rate (${reactLocalStorage.getObject("baseCurrency")})`
                                                }>

                                                    {isScrapUOMApplyTemp && <AgGridColumn width={columnWidths.ScrapRatePerScrapUOM} field={isImpactedMaster ? "OldScrapRatePerScrapUOM" : "ScrapRatePerScrapUOM"} editable='false' cellRenderer='oldScrapRateFormatterPerScrapUOM' headerName="Existing (In Scrap UOM)" colId={isImpactedMaster ? "ScrapRatePerScrapUOM" : "ScrapRatePerScrapUOM"} ></AgGridColumn>}
                                                    {isScrapUOMApplyTemp && <AgGridColumn width={columnWidths.NewScrapRatePerScrapUOM} cellRenderer='newScrapRateUOMFormatter' field='NewScrapRatePerScrapUOM' headerName="Revised (In Scrap UOM)" colId={"NewScrapRatePerScrapUOM"} editable={(isRunSimulationClicked || isApprovalSummary) ? false : EditableCallbackForNewScrapRate}></AgGridColumn>}
                                                    <AgGridColumn width={150} field={isImpactedMaster ? "OldScrapRate" : isCostingSimulation ? 'OldRawMaterialIndexationDetails.ScrapRate' : "OldScrapRate"} editable='false' cellRenderer='oldScrapRateFormatter' headerName="Existing" colId={isImpactedMaster ? "OldScrapRate" : "OldScrapRate"} ></AgGridColumn>
                                                    <AgGridColumn width={150} cellRenderer={'newScrapRateFormatter'} field={isCostingSimulation ? 'NewRawMaterialIndexationDetails.ScrapRate' : "NewScrapRate"} headerName="Revised" colId="NewScrapRate" valueGetter={ageValueGetterScrapRate} headerComponent={'revisedScrapRateHeader'} editable={(isRunSimulationClicked || isApprovalSummary || isCostingSimulation) ? false : EditableCallbackForNewScrapRate} ></AgGridColumn>
                                                </AgGridColumn>
                                                <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={300} headerName={
                                                    (Number(selectedMasterForSimulation?.value) === Number(RMIMPORT) ||
                                                        Number(selectedMasterForSimulation?.value) === Number(EXCHNAGERATE) ||
                                                        String(props?.masterId) === String(RMIMPORT))
                                                        ? "Other Cost (Currency)"
                                                        : `Other Cost (${reactLocalStorage.getObject("baseCurrency")})`
                                                } marryChildren={true} >
                                                    <AgGridColumn width={150} cellRenderer='existingOtherCostFormatter' field={isImpactedMaster ? "OldOtherNetCost" : isCostingSimulation ? 'OldRawMaterialIndexationDetails.OtherNetCost' : "OldOtherNetCost"} editable='false' headerName="Existing" colId={isImpactedMaster ? "OldOtherNetCost" : "OldOtherNetCost"} ></AgGridColumn>
                                                    <AgGridColumn width={150} cellRenderer='revisedOtherCostFormatter' editable={false} onCellValueChanged='cellChange' field={isCostingSimulation ? 'NewRawMaterialIndexationDetails.OtherNetCost' : "NewOtherNetCost"} headerName="Revised" colId='NewOtherNetCost' headerComponent={'revisedBasicRateHeader'}></AgGridColumn>
                                                </AgGridColumn>
                                                {<AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName={
                                                    (Number(selectedMasterForSimulation?.value) === Number(RMIMPORT) ||
                                                        Number(selectedMasterForSimulation?.value) === Number(EXCHNAGERATE) ||
                                                        String(props?.masterId) === String(RMIMPORT)
                                                    )
                                                        ? "Net Cost (Currency)"
                                                        : `Net Cost (${reactLocalStorage.getObject("baseCurrency")})`
                                                }>
                                                    <AgGridColumn width={columnWidths.OldNetLandedCost} field={isCostingSimulation ? 'OldRawMaterialIndexationDetails.NetLandedCost' : "OldNetLandedCost"} tooltipField='OldNetLandedCost' editable='false' cellRenderer={'costFormatter'} headerName="Existing" colId='OldNetLandedCost'></AgGridColumn>
                                                    <AgGridColumn width={columnWidths.NewNetLandedCost} field={isCostingSimulation ? 'NewRawMaterialIndexationDetails.NetLandedCost' : "NewNetLandedCost"} editable='false' cellRenderer={'NewcostFormatter'} headerName="Revised" colId='NewNetLandedCost'></AgGridColumn>
                                                </AgGridColumn>
                                                }
                                                {/* THIS COLUMN WILL BE VISIBLE IF WE ARE LOOKING IMPACTED MASTER DATA FOR RMIMPORT */}
                                                {String(props?.masterId) === String(RMIMPORT) && <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName={`Net Cost (${reactLocalStorage.getObject("baseCurrency")})`}>
                                                    <AgGridColumn width={120} field="OldRMNetLandedCostConversion" tooltipField='OldRMNetLandedCostConversion' editable='false' headerName="Existing" colId='OldRMNetLandedCostConversion'></AgGridColumn>
                                                    <AgGridColumn width={120} field="NewRMNetLandedCostConversion" editable='false' headerName="Revised" colId='NewRMNetLandedCostConversion'></AgGridColumn>
                                                </AgGridColumn>
                                                }
                                                {props.children}
                                                <AgGridColumn width={columnWidths.OldEffectiveDate} field={isCostingSimulation ? 'OldRawMaterialIndexationDetails.EffectiveDate' : "OldEffectiveDate"} editable='false' cellRenderer={'effectiveDateFormatter'} headerName={props.isImpactedMaster && !props.lastRevision ? "Old Effective date" : "Old Effective Date"} ></AgGridColumn>
                                                <AgGridColumn width={columnWidths.NewEffectiveDate} field={isCostingSimulation ? 'NewRawMaterialIndexationDetails.EffectiveDate' : "NewEffectiveDate"} editable='false' cellRenderer={'effectiveDateFormatter'} headerName={props.isImpactedMaster && !props.lastRevision ? "New Effective date" : "New Effective Date"} ></AgGridColumn>

                                                <AgGridColumn field="RawMaterialId" hide></AgGridColumn>

                                            </AgGridReact>))}

                                        {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
                                    </div>
                                </div>

                            </Col>
                        </Row>
                        {
                            !isImpactedMaster && !isApprovalSummary &&
                            <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                                <div className="col-sm-12 text-right bluefooter-butn d-flex justify-content-end align-items-center">
                                    {props.isCostingSimulation && <div className="inputbox date-section mr-3 verfiy-page simulation_effectiveDate">
                                        {<DatePicker
                                            name="EffectiveDate"
                                            id="EffectiveDate"
                                            selected={DayTime(effectiveDate).isValid() ? new Date(effectiveDate) : ''}
                                            onChange={handleEffectiveDateChange}
                                            showMonthDropdown
                                            showYearDropdown
                                            dropdownMode='select'
                                            dateFormat="dd/MM/yyyy"
                                            minDate={new Date(maxDate)}
                                            placeholderText="Select effective date"
                                            className="withBorder"
                                            autoComplete={"off"}
                                            disabledKeyboardNavigation
                                            onChangeRaw={(e) => e.preventDefault()}
                                        />}
                                        {isWarningMessageShow && <WarningMessage dClass={"error-message"} textClass={"pt-1"} message={"Please select effective date"} />}
                                    </div>}

                                    {!isRunSimulationClicked && !isCostingSimulation && <button onClick={(e) => verifySimulation(e, 'run')} type="submit" id="verify-btn" className="user-btn mr5 save-btn verifySimulation" disabled={isDisable}>
                                        <div className={"Run-icon"}>
                                        </div>{" "}
                                        {"Run Simulation"}
                                    </button>}
                                    {isCostingSimulation && <button onClick={(e) => verifySimulation(e, 'verify')} type="submit" id="verify-btn" className="user-btn mr5 save-btn verifySimulation" disabled={isDisable}>
                                        <div className={"Run-icon"}>
                                        </div>{" "}
                                        {"Verify"}
                                    </button>}
                                    {
                                        isRunSimulationClicked &&
                                        <>

                                            <button
                                                type="button"
                                                className="user-btn mr5 save-btn"
                                                id={'other_simulation_go_to_history'}
                                                // disabled={((selectedRowData && selectedRowData.length === 0) || isFromApprovalListing) ? true : false}
                                                onClick={() => setShowApprovalHistory(true)}>
                                                <div className={"back-icon"}></div>
                                                {"Go to History"}
                                            </button>
                                            <button
                                                onClick={() => sendForApproval()}
                                                type="submit"
                                                disabled={userDetails()?.Role === 'SuperAdmin'}
                                                id={'other_simulation_send_for_approval'}
                                                title="Send For Approval"
                                                class="user-btn approval-btn mr5">
                                                <div className="send-for-approval">
                                                </div>{" "}
                                                {"Send For Approval"}
                                            </button>
                                        </>
                                    }
                                </div>
                            </Row>
                        }
                    </Fragment>

                }
                {
                    showverifyPage &&
                    <VerifySimulation token={token} cancelVerifyPage={cancelVerifyPage} />
                }
                {(showApprovalHistory || showApprovalHistory) && <Redirect to='/simulation-history' />}

                {
                    showRunSimulationDrawer &&
                    <RunSimulationDrawer
                        isOpen={showRunSimulationDrawer}
                        closeDrawer={closeDrawer}
                        anchor={"right"}
                    />
                }
                {
                    openCommodityDrawer &&
                    <CommoditySimulationDrawer isOpen={openCommodityDrawer} anchor={"right"} closeDrawer={closeCommodityDrawer} commodityDetails={commodityDetailForRow}
                        isViewFlag={isViewFlag} rowData={rowData} />
                }
                {
                    openOtherCostDrawer &&
                    <AddOtherCostDrawer
                        isOpen={openOtherCostDrawer}
                        anchor={"right"}
                        closeDrawer={closeOtherCostDrawer}
                        rawMaterial={true}
                        rmBasicRate={totalBasicRate}
                        ViewMode={isViewFlag}
                        rmTableData={otherCostDetailForRow}
                        rowData={rowData}
                    />
                }
                {isApprovalDrawer &&
                    <SimulationApproveReject
                        isOpen={isApprovalDrawer}
                        vendorId={''}
                        SimulationTechnologyId={simulationTechnologyId}
                        SimulationType={''}
                        anchor={'right'}
                        approvalData={[]}
                        type={'Sender'}
                        simulationDetail={{ TokenNo: tokenNumber, Status: '', SimulationId: simulationId, SimulationAppliedOn: simulationTechnologyId, EffectiveDate: '', IsExchangeRateSimulation: false }}
                        selectedRowData={indexedRMForSimulation}
                        costingArr={indexedRMForSimulation}
                        master={selectedMasterForSimulation?.value ? selectedMasterForSimulation?.value : master}
                        closeDrawer={closeApprovalDrawer}
                        isSimulation={true}
                        apiData={indexedRMForSimulation}
                        costingTypeId={simulationHeadId} //CONFIRM FROM ANIKET
                        releaseStrategyDetails={{}}
                        technologyId={simulationTechnologyId}
                        showApprovalTypeDropdown={true}
                        approvalTypeIdValue={simulationHeadId}//CONFIRM FROM ANIKET
                        IsExchangeRateSimulation={false}
                    // isSaveDone={isSaveDone}
                    />
                }
            </div>
        </div>
    );
}


export default RMIndexationSimulation;
