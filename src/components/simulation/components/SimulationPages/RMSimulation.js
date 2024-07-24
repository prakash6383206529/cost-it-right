import React, { useEffect, useState, useRef, useContext } from 'react';
import { Row, Col, Tooltip, } from 'reactstrap';
import DayTime from '../../../common/DayTimeWrapper'
import { CBCTypeId, defaultPageSize, EMPTY_DATA, EXCHNAGERATE, RMDOMESTIC, RMIMPORT, BOPIMPORT } from '../../../../config/constants';
import NoContentFound from '../../../common/NoContentFound';
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId, searchNocontentFilter } from '../../../../helper';
import Toaster from '../../../common/Toaster';
import { runVerifySimulation } from '../../actions/Simulation';
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

const gridOptions = {

};

// const ExcelFile = ReactExport.ExcelFile;
// const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
// const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

function RMSimulation(props) {
    const { showEditMaster, handleEditMasterPage, showCompressedColumns, render } = useContext(simulationContext) || {};

    const { list, isbulkUpload, rowCount, technology, master, isImpactedMaster, costingAndPartNo, tokenForMultiSimulation, technologyId } = props
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
    const { register, control, setValue, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })


    const dispatch = useDispatch()

    const currencySelectList = useSelector(state => state.comman.currencySelectList)
    const { selectedMasterForSimulation, exchangeRateListBeforeDraft } = useSelector(state => state.simulation)
    const simulationApplicability = useSelector(state => state.simulation.simulationApplicability)

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
        RMFreightCost: showCompressedColumns ? 50 : 150,
        RMShearingCost: showCompressedColumns ? 50 : 170,
        MachiningScrapRate: showCompressedColumns ? 50 : 170,
        EffectiveDate: showCompressedColumns ? 50 : 140,
        OldRMNetLandedCostConversion: showCompressedColumns ? 70 : 120,
        NewRMNetLandedCostConversion: showCompressedColumns ? 70 : 120,
        ScrapRatePerScrapUOM: showCompressedColumns ? 70 : 120,
        NewScrapRatePerScrapUOM: showCompressedColumns ? 70 : 120
    };
    useEffect(() => {
        if (isbulkUpload) {
            setValue('NoOfCorrectRow', rowCount.correctRow)
            setValue('NoOfRowsWithoutChange', rowCount.NoOfRowsWithoutChange)
            setTitleObj(prevState => ({ ...prevState, rowWithChanges: rowCount.correctRow, rowWithoutChanges: rowCount.NoOfRowsWithoutChange }))
        }
        setIsLoader(true)
        let scrapUOMApplyList = _.map(list, 'IsScrapUOMApply')
        setTimeout(() => {
            if (scrapUOMApplyList?.includes("Yes") || scrapUOMApplyList?.includes(true)) {
                setIsScrapUOMApplyTemp(true)
                setIsLoader(false)
            } else {
                setIsScrapUOMApplyTemp(false)
                setIsLoader(false)
            }
        }, 200);
        if (!isImpactedMaster && !isbulkUpload) {
            list && list?.map(item => {
                item.NewBasicRate = item.BasicRatePerUOM
                item.NewScrapRatePerScrapUOM = item.ScrapRatePerScrapUOM
                return null
            })
        }
    }, [])
    useEffect(() => {

        if (handleEditMasterPage) {
            handleEditMasterPage(showEditMaster, showverifyPage)
        }
    }, [showverifyPage])
    useEffect(() => {
        if (list && list.length > 0) {
            window.screen.width >= 1921 && gridRef.current.api.sizeColumnsToFit();
            let tempList = [...list]
            if (simulationApplicability?.value === APPLICABILITY_RM_SIMULATION) {
                tempList = [...exchangeRateListBeforeDraft]
            }
            let maxDate = getMaxDate(tempList)
            setMaxDate(maxDate?.EffectiveDate)
        }
    }, [list])

    const setValueFunction = (check, tempList = []) => {
        /**********POST METHOD TO CALL HERE AND AND SEND TOKEN TO VERIFY PAGE TODO ****************/
        let obj = {}
        obj.Technology = technology
        obj.SimulationTechnologyId = check ? RMIMPORT : selectedMasterForSimulation.value
        obj.SimulationHeadId = list[0]?.CostingTypeId
        obj.Masters = master
        obj.LoggedInUserId = loggedInUserId()

        obj.TechnologyId = technologyId

        if (filteredRMData.plantId && filteredRMData.plantId.value) {
            obj.PlantId = filteredRMData.plantId ? filteredRMData.plantId.value : ''
        }
        let tempArr = []
        if (String(selectedMasterForSimulation.value) === String(RMDOMESTIC) || String(selectedMasterForSimulation.value) === String(RMIMPORT)) {

            list && list.map(item => {
                if ((item.NewBasicRate !== undefined || item.NewScrapRate !== undefined || item.NewBasicrateFromPercentage) && (((item.NewBasicRate !== undefined || item.NewBasicrateFromPercentage) ? Number(item.NewBasicRate) : Number(item.BasicRate)) !== Number(item.BasicRatePerUOM) || ((item.NewScrapRate !== undefined || item.NewBasicrateFromPercentage) ? Number(item.NewScrapRate) : Number(item.ScrapRate)) !== Number(item.ScrapRate))) {
                    let tempObj = {}
                    tempObj.CostingHead = item.CostingHead === 'Vendor Based' ? VBC : ZBC
                    tempObj.RawMaterialName = item.RawMaterialName
                    tempObj.MaterialType = item.MaterialType
                    tempObj.RawMaterialGrade = item.RawMaterialGradeName
                    tempObj.RawMaterialSpecification = item.RawMaterialSpecificationName
                    tempObj.RawMaterialCategory = item.Category
                    tempObj.UOM = item.UnitOfMeasurementName
                    tempObj.OldBasicRate = isbulkUpload ? item.BasicRate : item.BasicRatePerUOM
                    tempObj.NewBasicRate = item.NewBasicRate ? item.NewBasicRate : item.NewBasicrateFromPercentage ? item.NewBasicrateFromPercentage : item.BasicRate
                    tempObj.OldScrapRate = item.ScrapRate
                    tempObj.NewScrapRate = item.NewScrapRate ? item.NewScrapRate : item.ScrapRate
                    tempObj.RawMaterialFreightCost = checkForNull(item.RMFreightCost)
                    tempObj.RawMaterialShearingCost = checkForNull(item.RMShearingCost)
                    tempObj.OldNetLandedCost = item.NetLandedCost
                    tempObj.NewNetLandedCost = Number(item.NewBasicRate ? item.NewBasicRate : item.BasicRate) + checkForNull(item.RMShearingCost) + checkForNull(item.RMFreightCost)
                    tempObj.EffectiveDate = item.EffectiveDate
                    tempObj.RawMaterialId = item.RawMaterialId
                    tempObj.PlantId = item.PlantId
                    tempObj.VendorId = item.VendorId
                    tempObj.Delta = 0
                    tempObj.OldScrapRatePerScrapUOM = item.ScrapRatePerScrapUOM
                    tempObj.NewScrapRatePerScrapUOM = item.NewScrapRatePerScrapUOM
                    tempArr.push(tempObj)
                }
                return null;
            })
        } else {
            list && list.map(item => {
                let tempObj = {}
                tempObj.CostingHead = item.CostingHead === 'Vendor Based' ? VBC : ZBC
                tempObj.RawMaterialName = item.RawMaterialName
                tempObj.MaterialType = item.MaterialType
                tempObj.RawMaterialGrade = item.RawMaterialGradeName
                tempObj.RawMaterialSpecification = item.RawMaterialSpecificationName
                tempObj.RawMaterialCategory = item.Category
                tempObj.UOM = item.UnitOfMeasurementName
                tempObj.OldBasicRate = isbulkUpload ? item.BasicRate : item.BasicRatePerUOM
                tempObj.NewBasicRate = item.NewBasicRate ? item.NewBasicRate : (item.NewBasicrateFromPercentage !== 0 && item.NewBasicrateFromPercentage !== null && item.NewBasicrateFromPercentage !== undefined) ? item.NewBasicrateFromPercentage : (isbulkUpload ? item.BasicRate : item.BasicRatePerUOM)
                tempObj.OldScrapRate = item.ScrapRate
                tempObj.NewScrapRate = item.NewScrapRate ? item.NewScrapRate : item.ScrapRate
                tempObj.RawMaterialFreightCost = checkForNull(item.RMFreightCost)
                tempObj.RawMaterialShearingCost = checkForNull(item.RMShearingCost)
                tempObj.OldNetLandedCost = item.NetLandedCost
                tempObj.NewNetLandedCost = Number(item.NewBasicRate ? item.NewBasicRate : item.BasicRate) + checkForNull(item.RMShearingCost) + checkForNull(item.RMFreightCost)
                tempObj.EffectiveDate = item.EffectiveDate
                tempObj.RawMaterialId = item.RawMaterialId
                tempObj.PlantId = item.PlantId
                tempObj.VendorId = item.VendorId
                tempObj.Delta = 0
                tempObj.OldScrapRatePerScrapUOM = 0
                tempObj.NewScrapRatePerScrapUOM = 0
                tempArr.push(tempObj)

                return null;
            })
        }


        obj.SimulationIds = tokenForMultiSimulation
        obj.SimulationRawMaterials = tempArr
        if (check) {
            obj.SimulationExchangeRates = tempList
            obj.IsExchangeRateSimulation = true
        }

        obj.EffectiveDate = DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss')
        dispatch(runVerifySimulation(obj, res => {
            setIsDisable(false)

            if (res?.data?.Result) {
                setToken(res?.data?.Identity)
                setShowVerifyPage(true)
            }
        }))
    }

    const verifySimulation = debounce(() => {
        if (!isEffectiveDateSelected) {
            setIsWarningMessageShow(true)
            return false
        }
        let basicRateCount = 0
        let isScrapRateGreaterThanBasiRate = false
        let scrapRateChangeArr = [];
        let basicRateZeroCount = 0
        list && list.map((li) => {
            if (Number(li.BasicRatePerUOM) === Number(li.NewBasicRate) || (li?.NewBasicRate === undefined && li?.NewBasicrateFromPercentage === undefined)) {
                basicRateCount = basicRateCount + 1
            }

            if ((li.NewBasicRate && Number(li.BasicRatePerUOM) !== Number(li.NewBasicRate)) && (Number(li.ScrapRate) === Number(li.NewScrapRate) || li?.NewScrapRate === undefined)) {
                scrapRateChangeArr.push(li)

            }
            if (li.NewBasicrateFromPercentage === undefined || li?.NewBasicrateFromPercentage < (li?.NewScrapRate === undefined || li?.NewScrapRate === '' ? Number(li?.ScrapRate) : Number(li?.NewScrapRate))) {
                if ((li?.NewBasicRate === undefined || li?.NewBasicRate === '' ? Number(li?.BasicRatePerUOM) : Number(li?.NewBasicRate)) < (li?.NewScrapRate === undefined || li?.NewScrapRate === '' ? Number(li?.ScrapRate) : Number(li?.NewScrapRate))) {
                    isScrapRateGreaterThanBasiRate = true
                }
                if (isScrapRateGreaterThanBasiRate && !(Number(basicRateCount) === Number(list.length))) {
                    li.NewBasicRate = li?.BasicRatePerUOM
                    li.NewScrapRate = li?.ScrapRate
                    Toaster.warning('Scrap Rate should be less than Basic Rate')
                    return false
                }
            }
            if (checkForNull(li?.NewBasicRate) === 0) {
                basicRateZeroCount = basicRateZeroCount + 1
            }
            return null;
        })

        if ((selectedMasterForSimulation?.value === RMDOMESTIC || selectedMasterForSimulation?.value === RMIMPORT) && basicRateCount === list.length) {
            Toaster.warning('There is no changes in net cost. Please change the basic rate, then run simulation')
            return false
        }
        if (basicRateZeroCount > 0) {
            Toaster.warning('Basic Rate should not be zero')
            return false
        }
        if (scrapRateChangeArr.length !== 0) {
            let rmName = []
            scrapRateChangeArr.map(item => rmName.push(item.RawMaterialCode))
            let rmNameString = rmName.join(', ')
            setPopupMessage(`Scrap rate is not changed for some raw material (${rmNameString}). Do you still wish to continue?`)
            setShowPopup(true)
            setShowTooltip(false)
            return false
        }
        setIsDisable(true)

        basicRateCount = 0
        if (selectedMasterForSimulation?.value === EXCHNAGERATE) {
            dispatch(createMultipleExchangeRate(exchangeRateListBeforeDraft, currencySelectList, effectiveDate, res => {
                setValueFunction(true, res);
            }))
        } else {
            setValueFunction(false, []);
        }
        setShowTooltip(false)
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
        return (<span title={isbulkUpload ? props?.value : props?.data.VendorName}>{isbulkUpload ? props?.value : props?.data.VendorName}</span>);
    }

    const customerFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (<span title={isbulkUpload ? row['Customer (Code)'] : row.CustomerName}>{isbulkUpload ? row['Customer (Code)'] : row.CustomerName}</span>);
    }

    const plantFormatter = (props) => {
        return (<span title={isbulkUpload ? props?.value : props?.data.DestinationPlantName}>{isbulkUpload ? props?.value : props?.data.DestinationPlantName}</span>);
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
                        <span id={`newBasicRate-${props.rowIndex}`} className={`${!isbulkUpload ? 'form-control' : ''} ${row?.Percentage && Number(row?.Percentage) !== 0 && !row?.NewBasicRate ? 'disabled' : ''} basicRate_revised`} title={cell && value ? Number(cell) : Number(row.BasicRatePerUOM)}>{cell && value ? Number(cell) : row.Percentage ? PercentageCalc : isbulkUpload ? checkForNull(cell) : checkForNull(row.BasicRatePerUOM)} </span>
                }

            </>
        )
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

            </>
        )
    }

    const newScrapRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell, props, "scrapRate")
        return (
            <>
                {
                    isImpactedMaster ?
                        checkForDecimalAndNull(row.NewScrapRate, getConfigurationKey().NoOfDecimalForPrice) :
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
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // if (!row.NewBasicRate || Number(row.BasicRate) === Number(row.NewBasicRate) || row.NewBasicRate === '') return ''
        let NewBasicRate = '';
        if (row.NewBasicRate) {
            NewBasicRate = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost)
        }
        else if ((row.Percentage)) {
            let percentageCalc = (row?.BasicRatePerUOM + (row?.BasicRatePerUOM * row?.Percentage / 100))
            row.NewBasicrateFromPercentage = percentageCalc
            NewBasicRate = percentageCalc + row.RMFreightCost + row.RMShearingCost
        }
        const classGreen = (NewBasicRate > row.NetLandedCost) ? 'red-value form-control' : (NewBasicRate < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
        return NewBasicRate ? <span className={classGreen} title={checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)}>{checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
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
    const EditableCallbackForPercentage = (props) => {
        const rowData = props?.data;
        let value = false
        if (!rowData?.NewBasicRate) {
            value = true
        } else {
            value = false
        }
        return value
    }
    const EditableCallbackForNewBasicRate = (props) => {
        const rowData = props?.data;
        let value = false
        if (rowData?.Percentage && Number(rowData?.Percentage) !== 0 && !rowData?.NewBasicRate) {
            value = false
        } else {
            value = true
        }
        return value
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
        nullHandler: props.nullHandler && props.nullHandler,
        oldScrapRateFormatterPerScrapUOM: oldScrapRateFormatterPerScrapUOM,
        hyphenFormatter: hyphenFormatter,

    };

    const ageValueGetterLanded = (params) => {
        let row = params.data
        let valueReturn = ''
        if ((row?.Percentage !== '') && (checkForNull(row?.Percentage) !== 0) && checkForNull(row?.Percentage) <= 100) {
            valueReturn = (row?.BasicRatePerUOM + (row?.BasicRatePerUOM * row?.Percentage / 100)) + row.RMFreightCost + row.RMShearingCost
        } else {
            valueReturn = (row?.NewBasicRate + row.RMFreightCost + row.RMShearingCost)
        }

        return valueReturn;
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

    const closePopUp = () => {
        setShowPopup(false)
    }
    const onPopupConfirm = () => {
        if (selectedMasterForSimulation?.value === EXCHNAGERATE) {
            dispatch(createMultipleExchangeRate(exchangeRateListBeforeDraft, currencySelectList, effectiveDate, res => {
                setValueFunction(true, res);
            }))
        } else {
            setValueFunction(false, []);
        }
        setShowPopup(false)
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

                                            <div className="d-flex justify-content-end bulk-upload-row rm-row" style={{ marginRight: 0 }}>
                                                {
                                                    isbulkUpload && <>
                                                        <div className="d-flex align-items-center">
                                                            <label>Rows with changes:</label>
                                                            <TextFieldHookForm
                                                                label=""
                                                                name={'NoOfCorrectRow'}
                                                                Controller={Controller}
                                                                title={titleObj.rowWithChanges}
                                                                control={control}
                                                                register={register}
                                                                rules={{ required: false }}
                                                                mandatory={false}
                                                                handleChange={() => { }}
                                                                defaultValue={''}
                                                                className=""
                                                                customClassName={'withBorder mn-height-auto hide-label mb-0'}
                                                                errors={errors.NoOfCorrectRow}
                                                                disabled={true}
                                                            />
                                                        </div>
                                                        <div className="d-flex align-items-center">
                                                            <label>Rows without changes:</label>
                                                            <TextFieldHookForm
                                                                label=""
                                                                name={'NoOfRowsWithoutChange'}
                                                                Controller={Controller}
                                                                title={titleObj.rowWithoutChanges}
                                                                control={control}
                                                                register={register}
                                                                rules={{ required: false }}
                                                                mandatory={false}
                                                                handleChange={() => { }}
                                                                defaultValue={''}
                                                                className=""
                                                                customClassName={'withBorder mn-height-auto hide-label mb-0'}
                                                                errors={errors.NoOfRowsWithoutChange}
                                                                disabled={true}
                                                            />
                                                        </div>
                                                    </>}
                                                {!isImpactedMaster && list && <div className={`d-flex align-items-center simulation-label-container`}>
                                                    <div className='d-flex'>
                                                        <label>Technology: </label>
                                                        <p className='technology ml-1' title={list[0]?.TechnologyName}>{list[0]?.TechnologyName}</p>
                                                    </div>
                                                    {list[0]?.CostingTypeId !== CBCTypeId && <div className='d-flex pl-3'>
                                                        <label className='mr-1'>Vendor (Code):</label>
                                                        <p title={list[0]?.VendorName}>{list[0]?.VendorName ? list[0]?.VendorName : list?.[0]?.['Vendor (Code)']}</p>

                                                    </div>}
                                                    <button type="button" className={"apply ml-2 back_simulationPage"} id="simulation-back" onClick={cancel} disabled={isDisable}> <div className={'back-icon'}></div>Back</button>
                                                </div>}
                                            </div>


                                        </div>

                                    </div>
                                    <div className="ag-theme-material p-relative" style={{ width: '100%' }}>
                                        {isLoader && <LoaderCustom />}
                                        {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found simulation-lisitng" />}
                                        {list &&
                                            ((render || isLoader) ? <LoaderCustom customClass="loader-center" /> : (<AgGridReact

                                                ref={gridRef}
                                                floatingFilter={true}
                                                style={{ height: '100%', width: '100%' }}
                                                defaultColDef={defaultColDef}
                                                domLayout='autoHeight'
                                                // columnDefs={c}
                                                rowData={list}
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
                                                <AgGridColumn width={columnWidths.RawMaterialGradeName} field="RawMaterialGradeName" tooltipField='RawMaterialGradeName' editable='false' headerName="Grade" ></AgGridColumn>
                                                <AgGridColumn width={columnWidths.RawMaterialSpecificationName} field="RawMaterialSpecificationName" tooltipField='RawMaterialSpecificationName' editable='false' headerName="Spec"></AgGridColumn>
                                                <AgGridColumn width={columnWidths.RawMaterialCode} field="RawMaterialCode" tooltipField='RawMaterialCode' editable='false' headerName='Code' cellRenderer='hyphenFormatter'></AgGridColumn>
                                                {!isImpactedMaster && <AgGridColumn width={columnWidths.Category} field="Category" tooltipField='Category' editable='false' headerName="Category"></AgGridColumn>}
                                                {!isImpactedMaster && <AgGridColumn width={columnWidths.TechnologyName} field="TechnologyName" tooltipField='TechnologyName' editable='false' headerName="Technology" ></AgGridColumn>}
                                                {!isImpactedMaster && list[0]?.CostingTypeId !== CBCTypeId && <AgGridColumn width={columnWidths.VendorCod} field="Vendor (Code)" tooltipField='Vendor (Code)' editable='false' headerName="Vendor (Code)" cellRenderer='vendorFormatter'></AgGridColumn>}
                                                {!isImpactedMaster && list[0]?.CostingTypeId === CBCTypeId && <AgGridColumn width={columnWidths.CustomerName} field="CustomerName" tooltipField='CustomerName' editable='false' headerName="Customer (Code)" cellRenderer='customerFormatter'></AgGridColumn>}
                                                {!isImpactedMaster && <AgGridColumn width={columnWidths.PlantCode} field="Plant (Code)" editable='false' headerName="Plant (Code)" tooltipField='Plant (Code)' cellRenderer='plantFormatter' ></AgGridColumn>}
                                                <AgGridColumn width={columnWidths.UnitOfMeasurementName} field="UnitOfMeasurementName" tooltipField='UnitOfMeasurementName' editable='false' headerName="UOM"></AgGridColumn>
                                                {isScrapUOMApplyTemp && <AgGridColumn width={150} field="ScrapUnitOfMeasurement" tooltipField='ScrapUnitOfMeasurement' editable='false' headerName="Scrap UOM" cellRenderer='hyphenFormatter'></AgGridColumn>}
                                                {costingAndPartNo && <AgGridColumn field="CostingNumber" tooltipField='CostingNumber' editable='false' headerName="Costing No" width={columnWidths.CostingNumber}></AgGridColumn>}
                                                {costingAndPartNo && <AgGridColumn field="PartNumber" tooltipField='PartNumber' editable='false' headerName="Part No" width={columnWidths.PartNumber}></AgGridColumn>}

                                                {String(props?.masterId) === String(RMIMPORT) && <AgGridColumn field="Currency" tooltipField='Currency' editable='false' headerName="Currency" minWidth={140} ></AgGridColumn>}
                                                {(isImpactedMaster && String(props?.masterId) === String(RMIMPORT)) && <AgGridColumn field="ExchangeRate" tooltipField='ExchangeRate' editable='false' headerName="Existing Exchange Rate" minWidth={140} ></AgGridColumn>}

                                                <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName={
                                                    (Number(selectedMasterForSimulation?.value) === Number(RMIMPORT) ||
                                                        Number(selectedMasterForSimulation?.value) === Number(EXCHNAGERATE) ||
                                                        String(props?.masterId) === String(RMIMPORT))
                                                        ? "Basic Rate (Currency)"
                                                        : `Basic Rate (${reactLocalStorage.getObject("baseCurrency")})`
                                                } marryChildren={true} >
                                                    <AgGridColumn width={120} cellRenderer='oldBasicRateFormatter' field={isImpactedMaster ? "OldBasicRate" : "BasicRatePerUOM"} editable='false' headerName="Existing" colId={isImpactedMaster ? "OldBasicRate" : "BasicRatePerUOM"}></AgGridColumn>
                                                    <AgGridColumn width={120} cellRenderer='newBasicRateFormatter' editable={isImpactedMaster ? false : EditableCallbackForNewBasicRate} onCellValueChanged='cellChange' field="NewBasicRate" headerName="Revised" colId='NewBasicRate' headerComponent={'revisedBasicRateHeader'}></AgGridColumn>
                                                </AgGridColumn>
                                                {!isImpactedMaster && <AgGridColumn headerClass="justify-content-center" cellClass="text-center" headerName={"Percentage"} marryChildren={true} width={240}>
                                                    <AgGridColumn width={120} editable={EditableCallbackForPercentage} onCellValueChanged='cellChange' field="Percentage" colId='Percentage' valueGetter={ageValueGetterPer} cellRenderer='percentageFormatter' headerComponent={'percentageHeader'}></AgGridColumn>
                                                </AgGridColumn>}
                                                <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} marryChildren={true} headerName={
                                                    (Number(selectedMasterForSimulation?.value) === Number(RMIMPORT) ||
                                                        Number(selectedMasterForSimulation?.value) === Number(EXCHNAGERATE) ||
                                                        String(props?.masterId) === String(RMIMPORT)
                                                    )
                                                        ? "Scrap Rate (Currency)"
                                                        : `Scrap Rate (${reactLocalStorage.getObject("baseCurrency")})`
                                                }>
                                                    {isScrapUOMApplyTemp && <AgGridColumn width={columnWidths.ScrapRatePerScrapUOM} field={isImpactedMaster ? "OldScrapRatePerScrapUOM" : "ScrapRatePerScrapUOM"} editable='false' cellRenderer='oldScrapRateFormatterPerScrapUOM' headerName="Existing (In Scrap UOM)" colId={isImpactedMaster ? "ScrapRatePerScrapUOM" : "ScrapRatePerScrapUOM"} ></AgGridColumn>}
                                                    {isScrapUOMApplyTemp && <AgGridColumn width={columnWidths.NewScrapRatePerScrapUOM} cellRenderer='newScrapRateUOMFormatter' field='NewScrapRatePerScrapUOM' headerName="Revised (In Scrap UOM)" colId={"NewScrapRatePerScrapUOM"} editable={isImpactedMaster ? false : EditableCallbackForNewScrapRate}></AgGridColumn>}
                                                    <AgGridColumn width={120} field={isImpactedMaster ? "OldScrapRate" : "ScrapRate"} editable='false' cellRenderer='oldScrapRateFormatter' headerName="Existing" colId={isImpactedMaster ? "OldScrapRate" : "ScrapRate"} ></AgGridColumn>
                                                    <AgGridColumn width={120} cellRenderer={'newScrapRateFormatter'} field="NewScrapRate" headerName="Revised" colId="NewScrapRate" valueGetter={ageValueGetterScrapRate} headerComponent={'revisedScrapRateHeader'} editable={isImpactedMaster ? false : EditableCallbackForNewScrapRateSecond} ></AgGridColumn>
                                                </AgGridColumn>
                                                {/* <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName={"BOP Net Landed Cost Conversion"} marryChildren={true}>
                                                <AgGridColumn width={120} field="OldRMNetLandedCostConversion" editable='false' cellRenderer={'hyphenFormatter'} headerName="Existing" colId='OldRMNetLandedCostConversion' suppressSizeToFit={true}></AgGridColumn>
                                                <AgGridColumn width={120} field="NewRMNetLandedCostConversion" editable='false' cellRenderer={'hyphenFormatter'} headerName="Revised" colId='NewRMNetLandedCostConversion' suppressSizeToFit={true}></AgGridColumn>
                                            </AgGridColumn> */}
                                                <AgGridColumn width={columnWidths.RMFreightCost} field="RMFreightCost" tooltipField='RMFreightCost' editable='false' cellRenderer={'CostFormatter'} headerName="Freight Cost"></AgGridColumn>
                                                <AgGridColumn width={columnWidths.RMShearingCost} field="RMShearingCost" tooltipField='RMShearingCost' editable='false' cellRenderer={'CostFormatter'} headerName="Shearing Cost" ></AgGridColumn>
                                                {technologyId === String(FORGING) && <AgGridColumn width={170} field="MachiningScrapRate" tooltipField='MachiningScrapRate' editable='false' headerName="Machining Scrap Rate" cellRenderer={'CostFormatter'}></AgGridColumn>}
                                                {<AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName={
                                                    (Number(selectedMasterForSimulation?.value) === Number(RMIMPORT) ||
                                                        Number(selectedMasterForSimulation?.value) === Number(EXCHNAGERATE) ||
                                                        String(props?.masterId) === String(RMIMPORT)
                                                    )
                                                        ? "Net Cost (Currency)"
                                                        : `Net Cost (${reactLocalStorage.getObject("baseCurrency")})`
                                                }>
                                                    <AgGridColumn width={columnWidths.NetLandedCost} field="NetLandedCost" tooltipField='NetLandedCost' editable='false' cellRenderer={'costFormatter'} headerName="Existing" colId='NetLandedCost'></AgGridColumn>
                                                    <AgGridColumn width={columnWidths.NewNetLandedCost} field="NewNetLandedCost" editable='false' valueGetter={ageValueGetterLanded} cellRenderer={'NewcostFormatter'} headerName="Revised" colId='NewNetLandedCost'></AgGridColumn>
                                                </AgGridColumn>
                                                }
                                                {/* THIS COLUMN WILL BE VISIBLE IF WE ARE LOOKING IMPACTED MASTER DATA FOR RMIMPORT */}
                                                {String(props?.masterId) === String(RMIMPORT) && <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName={`Net Cost (${reactLocalStorage.getObject("baseCurrency")})`}>
                                                    <AgGridColumn width={120} field="OldRMNetLandedCostConversion" tooltipField='OldRMNetLandedCostConversion' editable='false' headerName="Existing" colId='OldRMNetLandedCostConversion'></AgGridColumn>
                                                    <AgGridColumn width={120} field="NewRMNetLandedCostConversion" editable='false' headerName="Revised" colId='NewRMNetLandedCostConversion'></AgGridColumn>
                                                </AgGridColumn>
                                                }
                                                {props.children}
                                                <AgGridColumn width={columnWidths.EffectiveDate} field="EffectiveDate" editable='false' cellRenderer={'effectiveDateFormatter'} headerName={props.isImpactedMaster && !props.lastRevision ? "Current Effective date" : "Effective Date"} ></AgGridColumn>
                                                <AgGridColumn field="RawMaterialId" hide></AgGridColumn>

                                            </AgGridReact>))}

                                        {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
                                    </div>
                                </div>

                            </Col>
                        </Row>
                        {
                            !isImpactedMaster &&
                            <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                                <div className="col-sm-12 text-right bluefooter-butn d-flex justify-content-end align-items-center">
                                    <div className="inputbox date-section mr-3 verfiy-page simulation_effectiveDate">
                                        <DatePicker
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
                                        />
                                        {isWarningMessageShow && <WarningMessage dClass={"error-message"} textClass={"pt-1"} message={"Please select effective date"} />}
                                    </div>
                                    <button onClick={verifySimulation} type="submit" id="verify-btn" className="user-btn mr5 save-btn verifySimulation" disabled={isDisable}>
                                        <div className={"Run-icon"}>
                                        </div>{" "}
                                        {"Verify"}
                                    </button>
                                </div>
                            </Row>
                        }
                    </Fragment>

                }
                {
                    showverifyPage &&
                    <VerifySimulation token={token} cancelVerifyPage={cancelVerifyPage} />
                }
                {
                    showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={popupMessage} />
                }

                {
                    showRunSimulationDrawer &&
                    <RunSimulationDrawer
                        isOpen={showRunSimulationDrawer}
                        closeDrawer={closeDrawer}
                        anchor={"right"}
                    />
                }
            </div>
        </div>
    );
}


export default RMSimulation;
