import React, { useEffect, useState, useRef, useContext } from 'react';
import { Row, Col, Tooltip, } from 'reactstrap';
import DayTime from '../../../common/DayTimeWrapper'
import { defaultPageSize, EMPTY_DATA, CBCTypeId, EXCHNAGERATE, RMIMPORT } from '../../../../config/constants';
import NoContentFound from '../../../common/NoContentFound';
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId, searchNocontentFilter, showBopLabel } from '../../../../helper';
import Toaster from '../../../common/Toaster';
import { runVerifyBoughtOutPartSimulation } from '../../actions/Simulation';
import { Fragment } from 'react';
import { TextFieldHookForm } from '../../../layout/HookFormInputs';
import { useForm, Controller } from 'react-hook-form'
import RunSimulationDrawer from '../RunSimulationDrawer';
import VerifySimulation from '../VerifySimulation';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import Simulation from '../Simulation';
import { debounce } from 'lodash'
import { PaginationWrapper } from '../../../common/commonPagination';
import DatePicker from "react-datepicker";
import WarningMessage from '../../../common/WarningMessage';
import { getMaxDate } from '../../SimulationUtils';
import ReactExport from 'react-export-excel';
import { BOP_IMPACT_DOWNLOAD_EXCEL_NON_ASSOCIATED } from '../../../../config/masterData';
import { reactLocalStorage } from 'reactjs-localstorage';
import { simulationContext } from '..';
import LoaderCustom from '../../../common/LoaderCustom';
import { useLabels } from '../../../../helper/core';
import AddConditionCosting from '../../../costing/components/CostingHeadCosts/AdditionalOtherCost/AddConditionCosting';
import AddOtherCostDrawer from '../../../masters/material-master/AddOtherCostDrawer';
import { updateCostValue } from '../../../common/CommonFunctions';
import { createMultipleExchangeRate } from '../../../masters/actions/ExchangeRateMaster';

const gridOptions = {

};

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

function BDNonAssociatedSimulation(props) {
    const { showEditMaster, handleEditMasterPage, showCompressedColumns, render } = useContext(simulationContext) || {};
    const { vendorLabel } = useLabels()
    const { list, isbulkUpload, rowCount, tokenForMultiSimulation } = props
    const [showRunSimulationDrawer, setShowRunSimulationDrawer] = useState(false)
    const [showverifyPage, setShowVerifyPage] = useState(false)
    const [token, setToken] = useState('')
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const gridRef = useRef();
    const [isDisable, setIsDisable] = useState(false)
    const [effectiveDate, setEffectiveDate] = useState('');
    const [isEffectiveDateSelected, setIsEffectiveDateSelected] = useState(false);
    const [isWarningMessageShow, setIsWarningMessageShow] = useState(false);
    const [titleObj, setTitleObj] = useState({})
    const [maxDate, setMaxDate] = useState('');
    const [noData, setNoData] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false)
    const [basicRateviewTooltip, setBasicRateViewTooltip] = useState(false)
    const [rowData, setRowData] = useState([])
    const [basicRate, setBasicRate] = useState('')
    const [netCostWithoutConditionCost, setNetCostWithoutConditionCost] = useState('')
    const [openOtherCostDrawer, setOpenOtherCostDrawer] = useState(false)
    const [openConditionCostDrawer, setOpenConditionCostDrawer] = useState(false)
    const [otherCostDetailForRow, setOtherCostDetailForRow] = useState([])
    const [conditionCostDetailForRow, setConditionCostDetailForRow] = useState([])

    const [rowIndex, setRowIndex] = useState('')
    const [editIndex, setEditIndex] = useState('')
    const [isViewFlag, setIsViewFlag] = useState(false)
    const [isLoader, setIsLoader] = useState(false)
    const [scrapRateviewTooltip, setScrapRateViewTooltip] = useState(false)

    const { register, control, setValue, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    const dispatch = useDispatch()
    const currencySelectList = useSelector(state => state.comman.currencySelectList)
    const masterList = useSelector(state => state.simulation.masterSelectListSimulation)
    const { selectedMasterForSimulation, selectedTechnologyForSimulation, exchangeRateListBeforeDraft } = useSelector(state => state.simulation)
    const columnWidths = {
        BoughtOutPartNumber: showCompressedColumns ? 50 : 140,
        BoughtOutPartName: showCompressedColumns ? 100 : 140,
        BoughtOutPartCategory: showCompressedColumns ? 100 : 140,
        Vendor: showCompressedColumns ? 100 : 140,
        CustomerName: showCompressedColumns ? 100 : 140,
        Plants: showCompressedColumns ? 100 : 140,
        NumberOfPieces: showCompressedColumns ? 100 : 140,
        Percentage: showCompressedColumns ? 100 : 140,
        EffectiveDate: showCompressedColumns ? 90 : 140,
        CostingId: showCompressedColumns ? 90 : 140,
        NewNetCostWithoutConditionCost: showCompressedColumns ? 70 : 120,
        NetCostWithoutConditionCost: showCompressedColumns ? 70 : 120,
        NewOtherNetCost: showCompressedColumns ? 70 : 120,
        OtherNetCost: showCompressedColumns ? 70 : 120

    };
    useEffect(() => {
        list && list?.map(item => {
            if (!isbulkUpload) {
                item.NewBasicRate = item.BasicRate
            }
            item.OldNetLandedCost = item.NetLandedCost
            item.NewNetLandedCost = item.NetLandedCost
        })
        if (isbulkUpload) {
            setValue('NoOfCorrectRow', rowCount.correctRow)
            setValue('NoOfRowsWithoutChange', rowCount.NoOfRowsWithoutChange)
            setTitleObj(prevState => ({ ...prevState, rowWithChanges: rowCount.correctRow, rowWithoutChanges: rowCount.NoOfRowsWithoutChange }))
        }

        if (!isbulkUpload) {
            list && list?.map(item => {
                item.NewBasicRate = item.BasicRate
                item.NewScrapRatePerScrapUOM = item.ScrapRatePerScrapUOM
                item.NewOtherNetCost = item.OtherNetCost
                item.NewNetConditionCost = item.NetConditionCost  // ADD KEY FROM API
                item.NewNetCostWithoutConditionCost = item.NetCostWithoutConditionCost
                item.NewBoughtOutPartOtherCostDetailsSchema = item.BoughtOutPartOtherCostDetailsSchema || []; // Set to existing data or empty array
                item.NewBoughtOutPartConditionsDetails = item.BoughtOutPartConditionsDetails || []; // Set to existing data or empty array
                setNetCostWithoutConditionCost(item.NewNetCostWithoutConditionCost)
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
            window.screen.width >= 1920 && gridRef?.current?.api?.sizeColumnsToFit();
            let maxDate = getMaxDate(list)
            setMaxDate(maxDate?.EffectiveDate)
        }
    }, [list])
    useEffect(() => {

        if (list && list?.[rowIndex]) {

            let obj = list?.[rowIndex]
            obj.otherCostTableData = obj.NewBoughtOutPartOtherCostDetailsSchema
            obj.conditionTableData = obj.NewBoughtOutPartConditionsDetails

            const updatedObjOtherCost = updateCostValue(false, obj, basicRate, true)

            obj.NewBoughtOutPartOtherCostDetailsSchema = updatedObjOtherCost?.tableData

            obj.NewOtherNetCost = updatedObjOtherCost?.formValue?.value
            obj.NewOtherNetCostConversion = updatedObjOtherCost?.formValue?.value
            obj.NewOtherNetCostLocalConversion = updatedObjOtherCost?.formValue?.value


            const basicPrice = checkForNull(basicRate) + checkForNull(updatedObjOtherCost?.formValue?.value)

            const updatedObjConditionCost = updateCostValue(true, obj, basicPrice, true)
            obj.NewBoughtOutPartConditionsDetails = updatedObjConditionCost?.tableData


            obj.NewNetConditionCost = updatedObjConditionCost?.formValue?.value
            obj.NewConditionNetCostConversion = updatedObjConditionCost?.formValue?.value
            obj.NewConditionNetCostLocalConversion = updatedObjConditionCost?.formValue?.value


            obj.NewNetLandedCost = checkForNull(basicRate) + checkForNull(updatedObjOtherCost?.formValue?.value) + checkForNull(updatedObjConditionCost?.formValue?.value)
            obj.NewNetCostWithoutConditionCost = checkForNull(basicRate) + checkForNull(updatedObjOtherCost?.formValue?.value)
            obj.NewNetLandedCostConversion = checkForNull(basicRate) + checkForNull(updatedObjOtherCost?.formValue?.value) + checkForNull(updatedObjConditionCost?.formValue?.value)
            obj.NewNetLandedCostLocalConversion = checkForNull(basicRate) + checkForNull(updatedObjOtherCost?.formValue?.value) + checkForNull(updatedObjConditionCost?.formValue?.value)

            setNetCostWithoutConditionCost(obj.NewNetCostWithoutConditionCost)
            list[rowIndex] = obj
            setIsLoader(true)
            setTimeout(() => {
                setIsLoader(false)
            }, 200);
        }
    }, [basicRate, openOtherCostDrawer, openConditionCostDrawer, otherCostDetailForRow, list])
    const verifySimulation = debounce(() => {
        if (selectedMasterForSimulation?.value === EXCHNAGERATE) {
            dispatch(createMultipleExchangeRate(exchangeRateListBeforeDraft, currencySelectList, effectiveDate, res => {
                if (!res?.status && !res?.error) {
                    setValueFunction(true, res);
                }
            }))
        } else {
            setValueFunction(false, []);
        }
        setShowTooltip(false)
    }, 500)
    const setValueFunction = (isExchangeRate, res) => {
        const filteredMasterId = masterList?.find(item => item?.Text === "BOP Import")?.Value;

        if (!isEffectiveDateSelected) {
            setIsWarningMessageShow(true)
            return false
        }

        let obj = {
            SimulationTechnologyId: isExchangeRate ? EXCHNAGERATE : selectedMasterForSimulation?.value,
            SimulationTypeId: list[0].CostingTypeId,
            LoggedInUserId: loggedInUserId(),
            TechnologyId: selectedTechnologyForSimulation?.value ? selectedTechnologyForSimulation?.value : null,
            TechnologyName: selectedTechnologyForSimulation?.label ? selectedTechnologyForSimulation?.label : null,
            EffectiveDate: DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
            SimulationHeadId: list[0].CostingTypeId,
            IsSimulationWithOutCosting: true,
            SimulationIds: tokenForMultiSimulation,
            IsExchangeRateSimulation: false,
            ExchangeRateSimulationTechnologyId: filteredMasterId

        }

        let tempArr = []
        list && list.map(item => {
            let tempObj = {
                BoughtOutPartId: item.BoughtOutPartId,
                OldBOPRate: item.BasicRate,
                NewBOPRate: 0,
                OldNetLandedCost: 0,
                NewNetLandedCost: 0,
                PercentageChange: 0,
                NewOtherNetCost: item.NewOtherNetCost || 0,
                NewNetConditionCost: item.NewNetConditionCost || 0,
                NewNetCostWithoutConditionCost: item.NewNetCostWithoutConditionCost || 0,
                BoughtOutPartConditionsDetails: item.NewBoughtOutPartConditionsDetails || [],
                BoughtOutPartOtherCostDetailsSchema: item.NewBoughtOutPartOtherCostDetailsSchema || []
            }

            if ((item?.Percentage !== '') && (checkForNull(item?.Percentage) !== 0)) {
                const val = item?.BasicRate + (item?.BasicRate * item?.Percentage / 100)
                tempObj.NewBOPRate = val
                tempObj.OldNetLandedCost = ((checkForNull(item.BasicRate) + checkForNull(item?.OtherNetCost)) / (getConfigurationKey().IsMinimumOrderQuantityVisible ? checkForNull(item?.NumberOfPieces) : 1)) + checkForNull(item?.NetConditionCost)
                tempObj.NewNetLandedCost = ((checkForNull(val) + checkForNull(item.NewOtherNetCost)) / (getConfigurationKey().IsMinimumOrderQuantityVisible ? checkForNull(item?.NumberOfPieces) : 1)) + checkForNull(item.NewNetConditionCost)
                tempObj.PercentageChange = checkForNull(item.Percentage)
            } else {
                tempObj.NewBOPRate = item.NewBasicRate
                tempObj.OldNetLandedCost = ((checkForNull(item.BasicRate) + checkForNull(item?.OtherNetCost)) / (getConfigurationKey().IsMinimumOrderQuantityVisible ? checkForNull(item?.NumberOfPieces) : 1)) + checkForNull(item?.NetConditionCost)
                tempObj.NewNetLandedCost = ((Number(item.NewBasicRate ? item.NewBasicRate : item.BasicRate) + checkForNull(item.NewOtherNetCost)) / (getConfigurationKey().IsMinimumOrderQuantityVisible ? checkForNull(item?.NumberOfPieces) : 1)) + checkForNull(item.NewNetConditionCost)
            }
            if (checkForNull(tempObj.OldNetLandedCost) !== checkForNull(tempObj.NewNetLandedCost)) {
                tempArr.push(tempObj)
            }
            return null;
        })


        let check = 0
        let percentageCheck = 0
        tempArr && tempArr?.map(item => {
            if (checkForNull(item?.OldNetLandedCost) !== checkForNull(item?.NewNetLandedCost)) {
                check = check + 1
            }
            if (item?.PercentageChange > 100) {
                percentageCheck = percentageCheck + 1
            }
        })
        if (check === 0) {
            Toaster.warning("There is no changes in net cost. Please change, then run simulation")
            return false
        } else if (percentageCheck !== 0) {
            Toaster.warning("Percentage should be less than or equal to 100")
            return false
        }
        setIsDisable(true)
        obj.SimulationBoughtOutPart = tempArr

        dispatch(runVerifyBoughtOutPartSimulation(obj, res => {
            setIsDisable(false)
            if (res?.data?.Result) {
                setToken(res.data.Identity)
                setShowVerifyPage(true)
            }
        }))
    }
    const cancelVerifyPage = () => {
        setShowVerifyPage(false)
    }

    const effectiveDateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        return cell != null ? DayTime(cell).format('DD/MM/YYYY') : '';
    }

    const costingHeadFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell ? cell : '-';
    }

    const customerFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (isbulkUpload ? row['Customer (Code)'] : row.CustomerName);
    }

    const percentageFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        let cellValue = cell
        if (cell && cell > 100) {
            Toaster.warning("Percentage should be less than or equal to 100")
            list[props.rowIndex].Percentage = 0
            cellValue = 0
        }
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;


        const value = beforeSaveCell(cellValue, props.rowIndex, 'Percentage')
        return (
            <>
                {
                    <span className={`form-control ${Number(row.OldNetLandedCost) !== Number(row.NewBasicRate) ? 'disabled' : ''}`} >{cell && value ? Number(cellValue) : (row?.Percentage ? row?.Percentage : 0)} </span>
                }

            </>
        )
    }

    const oldBasicRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                {<span title={cell && Number(row.BasicRate)}>{cell && Number(row.BasicRate)} </span>}

            </>
        )
    }
    const newBasicRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;

        const value = beforeSaveCell(cell, props.rowIndex, 'BasicRate', row.BasicRate)


        return (
            <>          <div id={`newBasicRate-${props.rowIndex}`} className='ag-header-cell-label'>
                {<span className={`form-control mt-1`} title={cell && value ? Number(row.NewBasicRate) : Number(row.BasicRate)}>{cell && value ? Number(row.NewBasicRate) : Number(row.BasicRate)} </span>}
            </div>
            </>
        )
    }

    const vendorFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                {isbulkUpload ? row[`Vendor (Code)`] : cell}

            </>
        )
    }

    const plantFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                {isbulkUpload ? row['Plant (Code)'] : cell}

            </>
        )
    }

    const costFormatter = (props) => {

        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        if (!row.NewBasicRate || row.BasicRate === row.NewBasicRate || row.NewBasicRate === '') return checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)
        const tempA = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost);
        const classGreen = (tempA > row.NetLandedCost) ? 'red-value form-control' : (tempA < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    /**
    * @method beforeSaveCell
    * @description CHECK FOR ENTER NUMBER IN CELL
    */
    const beforeSaveCell = (props, index = '', type = '', basicRate = '') => {
        const cellValue = props
        if (Number.isInteger(Number(cellValue)) && /^\+?(0|[1-9]\d*)$/.test(cellValue) && cellValue.toString().replace(/\s/g, '').length) {
            if (cellValue.length > 8) {
                Toaster.warning("Value should not be more than 8")
                if (type === 'Percentage') {
                    list[index].Percentage = 0
                } else if (type === 'BasicRate') {
                    list[index].NewBasicRate = basicRate
                }
                return false
            }
            return true
        } else if (cellValue && !/^[+-]?([0-9]+(?:[.][0-9]*)?|\.[0-9]+)$/.test(cellValue)) {
            Toaster.warning('Please enter a valid numbers.')
            if (type === 'Percentage') {
                list[index].Percentage = 0
            } else if (type === 'BasicRate') {
                list[index].NewBasicRate = basicRate
            }
            return false
        }
        return true
    }

    const NewcostFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const value = beforeSaveCell(cell, props.rowIndex, 'BasicRate', row.OldNetLandedCost)
        const NumberOfPieces = getConfigurationKey().IsMinimumOrderQuantityVisible ? Number(row?.NumberOfPieces) : 1
        const NewNetLandedCost = ((checkForNull(row.NewBasicRate) + checkForNull(row?.NewOtherNetCost)) / NumberOfPieces) + checkForNull(row?.NewNetConditionCost)
        const OldNetLandedCost = ((checkForNull(row.BasicRate) + checkForNull(row?.OtherNetCost)) / NumberOfPieces) + checkForNull(row?.NetConditionCost)

        let returnValue = ''
        if (!value) {
            returnValue = checkForDecimalAndNull(row.OldNetLandedCost)

        } else {
            if ((row?.Percentage !== '') && (checkForNull(row?.Percentage) !== 0) && checkForNull(row?.Percentage) <= 100) {
                returnValue = checkForDecimalAndNull(((row?.BasicRate + (row?.BasicRate * row?.Percentage / 100)) + checkForNull(row?.OtherNetCost) / NumberOfPieces) + checkForNull(row?.NetConditionCost), getConfigurationKey().NoOfDecimalForPrice);
            } else {
                // returnValue = checkForDecimalAndNull(Number(row.NewBasicRate) / NumberOfPieces, getConfigurationKey().NoOfDecimalForPrice)
                returnValue = checkForDecimalAndNull(NewNetLandedCost, getConfigurationKey().NoOfDecimalForPrice)
            }
        }

        let cssClass = '';
        if (NewNetLandedCost > OldNetLandedCost) {
            cssClass = 'red-value';
        } else if (NewNetLandedCost < OldNetLandedCost) {
            cssClass = 'green-value';
        }

        return (
            <div id="netCost_revised" className='ag-header-cell-label'>
                <span className={cssClass} title={returnValue}>{returnValue}</span>
            </div>
        );
    };
    const OldcostFormatter = (props) => {
        const row = props?.data;
        const NumberOfPieces = getConfigurationKey().IsMinimumOrderQuantityVisible ? Number(row?.NumberOfPieces) : 1
        const NetLandedCost = (checkForNull(row.BasicRate) + checkForNull(row?.OtherNetCost) / NumberOfPieces) + checkForNull(row?.NetConditionCost)
        if (!row.BasicRate || row.BasicRate === '') return ''
        //return row.BasicRate != null ? <span title={checkForDecimalAndNull(Number(row.BasicRate) / NumberOfPieces, getConfigurationKey().NoOfDecimalForPrice)}>{checkForDecimalAndNull(Number(row.BasicRate) / NumberOfPieces, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
        return checkForDecimalAndNull(NetLandedCost, getConfigurationKey().NoOfDecimalForPrice)
    }

    const revisedBasicRateHeader = (props) => {
        return (
            <div className='ag-header-cell-label'>
                <span className='ag-header-cell-text basicRate_revised'>Revised{<i className={`fa fa-info-circle tooltip_custom_right tooltip-icon mb-n3 ml-4 mt2 `} id={"basicRate-tooltip"}></i>}</span>
            </div>
        );
    };

    const revisedScrapRateHeader = (props) => {
        return (
            <div className='ag-header-cell-label'>
                <span className='ag-header-cell-text'>Revised {!props?.isImpactedMaster && <i className={`fa fa-info-circle tooltip_custom_right tooltip-icon mb-n3 ml-4 mt2 `} id={"scrapRate-tooltip"}></i>} </span>
            </div>
        );
    };
    const cancel = () => {
        list && list.map((item) => {
            item.NewBasicRate = undefined
            return null
        })
        props.backToSimulation(true)
    }

    const closeDrawer = (e = '') => {
        setShowRunSimulationDrawer(false)
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        editable: true,
        floatingFilter: true
    };

    const onGridReady = (params) => {
        window.screen.width >= 1440 && params.api.sizeColumnsToFit()
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
        setTimeout(() => {
            setShowTooltip(true)
        }, 100);
    };
    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            if (list.length !== 0) {
                setNoData(searchNocontentFilter(value, noData))
            }
        }, 500);
    }
    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const cellChange = (props) => {

    }
    const resetState = () => {
        gridApi?.setQuickFilter('');
        gridOptions?.columnApi?.resetColumnState();
        gridOptions?.api?.setFilterModel(null);
        gridRef.current.api.sizeColumnsToFit();
    }
    const handleEffectiveDateChange = (date) => {
        setEffectiveDate(date)
        setIsEffectiveDateSelected(true)
        setIsWarningMessageShow(false)
    }
    const onCellValueChanged = (props) => {
        const rowData = props?.data
        if (rowData) {
            setBasicRate(rowData?.NewBasicRate)
            setNetCostWithoutConditionCost(rowData?.NewNetCostWithoutConditionCost)
        }
    }

    const EditableCallbackForBasicRate = (props) => {
        const rowData = props?.data;
        let value = false
        if ((rowData?.Percentage !== '') && (checkForNull(rowData?.Percentage) !== 0)) {
            value = false
        } else {
            value = true
        }
        setRowIndex(props?.node?.rowIndex)
        return value
    }

    const EditableCallbackForPercentage = (props) => {
        const rowData = props?.data;
        let value = false
        if (Number(rowData?.BasicRate) === Number(rowData?.NewBasicRate)) {
            value = true
        } else {
            value = false
        }
        return value
    }

    const ageValueGetter = (params) => {
        let row = params.data
        let valueReturn = ''
        if ((row?.Percentage !== '') && (checkForNull(row?.Percentage) !== 0) && checkForNull(row?.Percentage) <= 100) {
            valueReturn = row?.BasicRate + (row?.BasicRate * row?.Percentage / 100)
        } else {
            valueReturn = row?.NewBasicRate
        }
        return valueReturn;
    };
    const ageValueGetterPer = (params) => {
        let row = params.data
        if (!row.Percentage) {
            if (Number(row.NewBasicRate) === Number(row.OldNetLandedCost)) {
                return ""
            }
            return row?.NewBasicRate * 0;
        }
        else if (Number(row.Percentage) === 0) {
            if (Number(row.NewBasicRate) === Number(row.OldNetLandedCost)) {
                return ""
            }
        } else {
            return row?.Percentage
        }
    };

    const ageValueGetterLanded = (params) => {
        let row = params.data
        const NumberOfPieces = getConfigurationKey().IsMinimumOrderQuantityVisible ? Number(row?.NumberOfPieces) : 1
        let valueReturn = ''
        if ((row?.Percentage !== '') && (checkForNull(row?.Percentage) !== 0) && checkForNull(row?.Percentage) <= 100) {
            valueReturn = (row?.BasicRate + (row?.BasicRate * row?.Percentage / 100)) / NumberOfPieces
        } else {
            valueReturn = (row?.NewBasicRate) / NumberOfPieces
        }
        return valueReturn;
    };
    const otherCostDrawer = (value, row, index, type) => {

        setRowData(row)
        setBasicRate(row?.NewBasicRate)
        if (type === 'Old') {

            setOtherCostDetailForRow(row?.BoughtOutPartOtherCostDetailsSchema || [])
            setIsViewFlag(true)
            setEditIndex(index)
        } else {

            setOtherCostDetailForRow(props?.isImpactedMaster ? row?.SimulationBoughtOutPartOtherCostDetailsList || [] : row?.NewBoughtOutPartOtherCostDetailsSchema || []);            // setIsViewFlag((isRunSimulationClicked || isApprovalSummary) ? true : false)
            setIsViewFlag(false)
            setEditIndex(index)
        }
        setOpenOtherCostDrawer(true)

    }
    const calculateAndSave = (tableData, totalCostBase) => {
        setIsLoader(true)
        list[editIndex].NewOtherNetCost = totalCostBase
        list[editIndex].NewOtherNetCostConversion = totalCostBase
        list[editIndex].NewOtherNetCostLocalConversion = totalCostBase
        list[editIndex].NewBoughtOutPartOtherCostDetailsSchema = tableData
        list[editIndex].NewNetCostWithoutConditionCost = Number(list[editIndex].NewBasicRate) + checkForNull(totalCostBase); // Update this line
        setNetCostWithoutConditionCost(Number(list[editIndex].NewBasicRate) + checkForNull(totalCostBase)); // Update the state
        setIsLoader(true)
        setTimeout(() => {
            setIsLoader(false)
        }, 100);
    }

    const calculateAndSaveCondition = (tableData, totalCostBase) => {

        setIsLoader(true)
        list[editIndex].NewNetConditionCost = totalCostBase
        list[editIndex].NewConditionNetCostConversion = totalCostBase
        list[editIndex].NewConditionNetCostLocalConversion = totalCostBase
        list[editIndex].NewBoughtOutPartConditionsDetails = tableData
        setTimeout(() => {
            setIsLoader(false)
        }, 100);
    }
    const conditionCostDrawer = (value, row, index, type) => {
        setRowData(row)
        setBasicRate(row?.NewBasicRate)
        if (type === 'Old') {

            setConditionCostDetailForRow(row?.BoughtOutPartConditionsDetails || [])
            setIsViewFlag(true)
            setEditIndex(index)
        } else {

            setConditionCostDetailForRow(props?.isImpactedMaster ? row?.SimulationBoughtOutPartConditionsDetails || [] : row?.NewBoughtOutPartConditionsDetails || [])
            // setIsViewFlag((isRunSimulationClicked || isApprovalSummary) ? true : false)
            setIsViewFlag(false)
            setEditIndex(index)
        }
        setOpenConditionCostDrawer(true)

    }
    const closeOtherCostDrawer = (type, tableData, totalCostCurrency, totalCostBase, RowIndex) => {

        if (type === 'Save') {
            calculateAndSave(tableData, totalCostBase)
        } else {
            // If canceling, revert to the original RawMaterialOtherCostDetails
            const originalDetails = list[editIndex]?.RawMaterialOtherCostDetails || [];
            setOtherCostDetailForRow(originalDetails);
        }
        setOpenOtherCostDrawer(false)
        setIsViewFlag(false)
        // setOtherCostDetailForRow([])
    }

    const closeConditionCostDrawer = (type, tableData, totalCostCurrency, conditionCost) => {

        if (type === 'save') {
            const newConditionCost = tableData.reduce((acc, item) => checkForNull(acc) + checkForNull(item?.ConditionCostPerQuantity || 0), 0);
            calculateAndSaveCondition(tableData, newConditionCost)
        } else {
            // If canceling, revert to the original RawMaterialOtherCostDetails
            const originalDetails = list[editIndex]?.RawMaterialConditionsDetails || [];
            setConditionCostDetailForRow(originalDetails);
        }
        setOpenConditionCostDrawer(false)
        setIsViewFlag(false)
        // setOtherCostDetailForRow([])
    }
    const existingOtherCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        const row = props?.valueFormatted ? props.valueFormatted : props?.data;

        const value = beforeSaveCell(cell, props, 'otherCost')

        return (
            <>
                {

                    <span title={cell && value ? Number(cell) : Number(row?.OldNetConditionCost)}>{cell && value ? checkForDecimalAndNull(Number(cell), getConfigurationKey().NoOfDecimalForPrice) : checkForDecimalAndNull(Number(row?.OtherNetCost), getConfigurationKey().NoOfDecimalForPrice)} </span>

                }
                {true && <button
                    type="button"
                    className={'View small'}
                    onClick={() => otherCostDrawer(cell, row, props.rowIndex, 'Old')}
                    title="Add"
                >
                </button>}

            </>
        )
    }

    const existingConditionCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell, props, 'otherCost')
        return (
            <>
                {
                    <span title={cell && value ? Number(cell) : Number(row?.OldNetConditionCost)}>{cell && value ? checkForDecimalAndNull(Number(cell), getConfigurationKey().NoOfDecimalForPrice) : checkForDecimalAndNull(Number(row?.OldNetConditionCost), getConfigurationKey().NoOfDecimalForPrice)} </span>

                }
                {true && <button
                    type="button"
                    className={'View small'}
                    onClick={() => conditionCostDrawer(cell, row, props.rowIndex, 'Old')}
                    title="Add"
                >
                </button>}

            </>
        )
    }

    const revisedOtherCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;

        const value = beforeSaveCell(cell, props, 'otherCost')
        const showValue = cell && value ? checkForDecimalAndNull(Number(cell), getConfigurationKey().NoOfDecimalForPrice) : checkForDecimalAndNull(Number(row?.OtherNetCost), getConfigurationKey().NoOfDecimalForPrice)

        const classGreen = (row?.NewOtherNetCost > row?.OtherNetCost) ? 'red-value form-control' : (row?.NewOtherNetCost < row?.OtherNetCost) ? 'green-value form-control' : 'form-class'
        setRowIndex(props?.node?.rowIndex)
        return (
            <>
                {
                    props?.isImpactedMaster ?
                        row?.NewOtherCost :
                        <span title={showValue} className={`${classGreen} with-button`}>{showValue} </span>

                }
                {/* {!isCostingSimulation && <button */}
                {true && <button
                    type="button"
                    // className={`${(isRunSimulationClicked || isApprovalSummary) ? 'View small ml-1' : ' add-out-sourcing ml-1'} `}
                    //onClick={() => otherCostDrawer(cell, row, props.rowIndex, 'New')}
                    className={`${props?.isImpactedMaster ? 'View small ml-1' : ' add-out-sourcing ml-1'} `}
                    onClick={() => otherCostDrawer(cell, row, props.rowIndex, 'New')}
                    title="Add"
                >
                </button>}

            </>
        )
    }

    const revisedConditionCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;

        const value = beforeSaveCell(cell, props, 'otherCost')
        const showValue = cell && value ? checkForDecimalAndNull(Number(cell), getConfigurationKey().NoOfDecimalForPrice) : checkForDecimalAndNull(Number(row?.NetConditionCost), getConfigurationKey().NoOfDecimalForPrice)
        const classGreen = (row?.NewNetConditionCost > row?.NetConditionCost) ? 'red-value form-control' : (row?.NewNetConditionCost < row?.NetConditionCost) ? 'green-value form-control' : 'form-class'
        setRowIndex(props?.node?.rowIndex)
        return (
            <>
                {
                    props?.isImpactedMaster ?
                        row?.NewNetConditionCost :
                        <span title={showValue} className={`${classGreen} with-button`}>{showValue} </span>

                }
                {/* {!isCostingSimulation && <button */}
                {true && <button
                    type="button"
                    // className={`${(isRunSimulationClicked || isApprovalSummary) ? 'View small ml-1' : ' add-out-sourcing ml-1'} `}
                    // onClick={() => ConditionCostDrawer(cell, row, props.rowIndex, 'New')}
                    className={`${props?.isImpactedMaster ? 'View small ml-1' : ' add-out-sourcing ml-1'} `}
                    onClick={() => conditionCostDrawer(cell, row, props.rowIndex, 'New')}
                    title="Add"
                >
                </button>}

            </>
        )
    }

    const localConversionFormatter = (props) => {
        const cellValue = checkForNull(props?.value);
        return checkForDecimalAndNull(cellValue, getConfigurationKey().NoOfDecimalForPrice)
    }
    const basicPriceRevisedFormatter = (props) => {
        const row = props?.data;


        // Calculate the new basic price (basic rate + other costs)
        const newBasicRate = props?.isImpactedMaster ? row.NewBOPRate : (row.NewBasicRate || row.BasicRate);

        const newOtherCost = props?.isImpactedMaster ? row.NewOtherCost : row.NewOtherNetCost || row.OtherNetCost;
        const NumberOfPieces = getConfigurationKey().IsMinimumOrderQuantityVisible ? Number(row?.NumberOfPieces) : 1;
        const newBasicPrice = props?.isImpactedMaster ? row?.NewNetCostWithoutConditionCost : (checkForNull(newBasicRate) + checkForNull(newOtherCost)) / NumberOfPieces;

        const returnValue = checkForDecimalAndNull(newBasicPrice, getConfigurationKey().NoOfDecimalForPrice);


        return (
            <div className='ag-header-cell-label'>
                <span title={returnValue}>{returnValue}</span>
            </div>
        );
    };

    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }

    const frameworkComponents = {
        effectiveDateRenderer: effectiveDateFormatter,
        costingHeadFormatter: costingHeadFormatter,
        NewcostFormatter: NewcostFormatter,
        OldcostFormatter: OldcostFormatter,
        costFormatter: costFormatter,
        customNoRowsOverlay: NoContentFound,
        cellChange: cellChange,
        oldBasicRateFormatter: oldBasicRateFormatter,
        vendorFormatter: vendorFormatter,
        plantFormatter: plantFormatter,
        customerFormatter: customerFormatter,
        revisedBasicRateHeader: revisedBasicRateHeader,
        percentageFormatter: percentageFormatter,
        ageValueGetter: ageValueGetter,
        ageValueGetterPer: ageValueGetterPer,
        newBasicRateFormatter: newBasicRateFormatter,
        existingOtherCostFormatter: existingOtherCostFormatter,
        revisedOtherCostFormatter: revisedOtherCostFormatter,
        existingConditionCostFormatter: existingConditionCostFormatter,
        revisedConditionCostFormatter: revisedConditionCostFormatter,
        basicPriceRevisedFormatter: basicPriceRevisedFormatter,
        localConversionFormatter: localConversionFormatter,
        hyphenFormatter: hyphenFormatter
    };

    const basicRatetooltipToggle = () => {
        setBasicRateViewTooltip(!basicRateviewTooltip)
    }
    const scrapRatetooltipToggle = () => {
        setScrapRateViewTooltip(!scrapRateviewTooltip)
    }

    const onBtExport = () => {
        return returnExcelColumn(BOP_IMPACT_DOWNLOAD_EXCEL_NON_ASSOCIATED, list)
    };

    const returnExcelColumn = (data = [], TempData) => {

        let temp = []
        TempData && TempData.map((item) => {
            item.EffectiveDate = (item?.EffectiveDate)?.slice(0, 10)
            if (item?.NewNetLandedCostConversion === null || item?.NewNetLandedCostConversion === undefined) {
                item.NewNetLandedCostConversion = item?.OriginalNetLandedCost
            }
            if (item?.NewNetCostWithoutConditionCost === null || item?.NewNetCostWithoutConditionCost === undefined) {
                item.NewNetLandedCost = item?.NewBasicRate
            }

            if (!item?.IsBOPAssociated) {
                item.OriginalNetLandedCost = item?.NetLandedCost
                item.NewNetLandedCostConversion = item?.NewNetLandedCost
            } else {
                item.OriginalNetLandedCost = item?.OldNetLandedCost
                item.NewNetLandedCostConversion = item?.NewNetLandedCostConversion === "-" ? item?.OriginalNetLandedCost : item?.NewNetLandedCostConversion
            }

            Object.keys(item)?.forEach(key => {
                if (item[key] === null || item[key] === undefined || item[key] === '') {
                    item[key] = "-";
                }
            });

            temp.push(item)
        })

        return (
            <ExcelSheet data={temp} name={`${showBopLabel()} Data`}>
                {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
    }

    return (

        <div>
            <div className={`ag-grid-react`}>
                {!showverifyPage &&
                    <Fragment>
                        {showTooltip && !props?.sImpactedMaster && <Tooltip className="rfq-tooltip-left" placement={"top"} isOpen={basicRateviewTooltip} toggle={basicRatetooltipToggle} target={"basicRate-tooltip"} >{"To edit revised basic rate please double click on the field."}</Tooltip>}
                        {/* {showTooltip && !props?.isImpactedMaster && <Tooltip className="rfq-tooltip-left" placement={"top"} isOpen={scrapRateviewTooltip} toggle={scrapRatetooltipToggle} target={"scrapRate-tooltip"} >{"To edit revised scrap rate please double click on the field."}</Tooltip>} */}


                        <Row>
                            <Col className={`add-min-height mb-3 sm-edit-page  ${(list && list?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                                <div className="ag-grid-wrapper height-width-wrapper">
                                    <div className="ag-grid-header d-flex align-items-center justify-content-between">
                                        <div className='d-flex align-items-center'>
                                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                            <button type="button" className="user-btn float-right mr-2" title="Reset Grid" onClick={() => resetState()}>
                                                <div className="refresh mr-0"></div>
                                            </button>
                                            <ExcelFile filename={'Impacted Master Data'} fileExtension={'.xls'} element={
                                                <button title="Download" type="button" className={'user-btn'} ><div className="download mr-0"></div></button>}>
                                                {onBtExport()}
                                            </ExcelFile>
                                        </div>
                                        <div className='d-flex justify-content-end bulk-upload-row pr-0 zindex-2'>
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
                                                            title={titleObj.rowWithoutChanges}
                                                            Controller={Controller}
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
                                                </>
                                            }
                                            <div className={`d-flex align-items-center simulation-label-container`}>
                                                {list[0].CostingTypeId !== CBCTypeId && <div className='d-flex pl-3'>
                                                    <label className='mr-1'>{vendorLabel} (Code):</label>
                                                    <p title={list[0].Vendor} className='mr-2'>{list[0].Vendor ? list[0].Vendor : list[0]['Vendor (Code)']}</p>
                                                </div>}
                                                <button type="button" id="simulation-back" className={"apply back_simulationPage"} onClick={cancel}> <div className={'back-icon'}></div>Back</button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="ag-theme-material p-relative" style={{ width: '100%' }}>
                                        {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found simulation-lisitng" />}
                                        {list &&
                                            (render || isLoader ? <LoaderCustom customClass="loader-center" /> : (<AgGridReact
                                                ref={gridRef}
                                                style={{ height: '100%', width: '100%' }}
                                                defaultColDef={defaultColDef}
                                                domLayout='autoHeight'
                                                floatingFilter={true}
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
                                                onFilterModified={onFloatingFilterChanged}
                                                enableBrowserTooltips={true}
                                                onCellValueChanged={onCellValueChanged}
                                            >
                                                {/* <AgGridColumn field="Technologies" editable='false' headerName="Technology" minWidth={190}></AgGridColumn> */}
                                                <AgGridColumn width={140} field="CostingHead" tooltipField='CostingHead' headerName="Costing Head" editable='false' cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                                                {<AgGridColumn field="EntryType" minWidth={120} headerName="Entry Type" cellRenderer={"hyphenFormatter"}></AgGridColumn>}
                                                <AgGridColumn field="BoughtOutPartNumber" tooltipField='BoughtOutPartNumber' editable='false' headerName={`${showBopLabel()} Part No.`} minWidth={columnWidths.BoughtOutPartNumber}></AgGridColumn>
                                                <AgGridColumn field="BoughtOutPartName" tooltipField='BoughtOutPartName' editable='false' headerName={`${showBopLabel()} Part Name`} minWidth={columnWidths.BoughtOutPartNumber}></AgGridColumn>
                                                {<AgGridColumn field="BoughtOutPartCategory" tooltipField='BoughtOutPartCategory' editable='false' headerName={`${showBopLabel()} Category`} minWidth={columnWidths.BoughtOutPartCategory}></AgGridColumn>}
                                                {list[0].CostingTypeId !== CBCTypeId && <AgGridColumn field="Vendor" tooltipField='Vendor' editable='false' headerName={vendorLabel + " (Code)"} minWidth={columnWidths.Vendor} cellRenderer='vendorFormatter'></AgGridColumn>}
                                                {list[0].CostingTypeId === CBCTypeId && <AgGridColumn field="CustomerName" tooltipField='CustomerName' editable='false' headerName="Customer (Code)" minWidth={columnWidths.CustomerName} cellRenderer='customerFormatter'></AgGridColumn>}
                                                {<AgGridColumn field="Plants" tooltipField='Plants' editable='false' headerName="Plant (Code)" minWidth={columnWidths.Plants} cellRenderer='plantFormatter'></AgGridColumn>}
                                                {getConfigurationKey().IsMinimumOrderQuantityVisible && <AgGridColumn field="NumberOfPieces" tooltipField='NumberOfPieces' editable='false' headerName="Min Order Quantity" minWidth={columnWidths.NumberOfPieces} ></AgGridColumn>}
                                                {getConfigurationKey().IsSourceExchangeRateNameVisible && <AgGridColumn minWidth={120} field="ExchangeRateSourceName" headerName="Exchange Rate Source"></AgGridColumn>}
                                                {<AgGridColumn field="Currency" minWidth={120} tooltipField='Currency' editable='false' headerName="Settlement Currency"></AgGridColumn>}

                                                <AgGridColumn field="LocalCurrency" minWidth={120} headerName={"Plant Currency"} cellRenderer={"currencyFormatter"}></AgGridColumn>
                                                <AgGridColumn headerClass="justify-content-center" cellClass="text-center" headerName={`Basic Rate (Currency)`} marryChildren={true} minWidth={240}>
                                                    <AgGridColumn minWidth={140} field="BasicRate" editable='false' cellRenderer='oldBasicRateFormatter' headerName="Existing" colId="BasicRate"></AgGridColumn>
                                                    <AgGridColumn minWidth={140} cellRenderer='newBasicRateFormatter' editable={EditableCallbackForBasicRate} onCellValueChanged='cellChange' field="NewBasicRate" valueGetter={ageValueGetter} headerName="Revised" colId='NewBasicRate' headerComponent={'revisedBasicRateHeader'}></AgGridColumn>
                                                </AgGridColumn>
                                                {<AgGridColumn minWidth={columnWidths.Percentage} editable={EditableCallbackForPercentage} onCellValueChanged='cellChange' field="Percentage" colId='Percentage' valueGetter={ageValueGetterPer} cellRenderer='percentageFormatter'></AgGridColumn>}
                                                <AgGridColumn headerClass="justify-content-center" cellClass="text-center" minWidth={300} headerName={
                                                    "Other Cost (Currency)"
                                                } marryChildren={true} >
                                                    <AgGridColumn minWidth={150} cellRenderer='existingOtherCostFormatter' field=" OtherNetCost" editable='false' headerName="Existing" /* colId={ "OtherNetCost"} */ ></AgGridColumn>
                                                    <AgGridColumn minWidth={150} cellRenderer='revisedOtherCostFormatter' editable={false} onCellValueChanged='cellChange' field="NewOtherNetCost" headerName="Revised" colId='NewOtherNetCost'></AgGridColumn>
                                                </AgGridColumn>
                                                {<AgGridColumn headerClass="justify-content-center" cellClass="text-center" minWidth={240} headerName={
                                                    "Basic Price (Currency)"
                                                }>
                                                    <AgGridColumn minWidth={columnWidths.NetCostWithoutConditionCost} field='NetCostWithoutConditionCost' editable='false' headerName="Existing" colId='NetCostWithoutConditionCost'></AgGridColumn>
                                                    <AgGridColumn minWidth={columnWidths.NewNetCostWithoutConditionCost} field="NewNetCostWithoutConditionCost" editable='false' headerName="Revised" cellRenderer='basicPriceRevisedFormatter' colId='NewNetCostWithoutConditionCost'></AgGridColumn>
                                                </AgGridColumn>}

                                                <AgGridColumn headerClass="justify-content-center" cellClass="text-center" minWidth={300} headerName={
                                                    "Condition Cost (Currency)"

                                                } marryChildren={true} >

                                                    <AgGridColumn minWidth={150} cellRenderer='existingConditionCostFormatter' field={"NetConditionCost"} editable='false' headerName="Existing" colId={"NetConditionCost"} ></AgGridColumn>
                                                    <AgGridColumn minWidth={150} cellRenderer='revisedConditionCostFormatter' editable={false} onCellValueChanged='cellChange' field={"NewNetConditionCost"} headerName="Revised" colId='NewNetConditionCost' ></AgGridColumn>
                                                </AgGridColumn>
                                                <AgGridColumn headerClass="justify-content-center" cellClass="text-center" minWidth={240} headerName={`Net Cost (Currency)`} marryChildren={true}>
                                                    {/* <AgGridColumn minWidth={120} field="OldNetLandedCost" editable='false' cellRenderer={'OldcostFormatter'} headerName="Old" colId='NetLandedCost'></AgGridColumn>} */}
                                                    <AgGridColumn minWidth={120} field="OldNetLandedCost" editable='false' cellRenderer={'OldcostFormatter'} headerName="Existing" colId='NetLandedCost'></AgGridColumn>
                                                    <AgGridColumn minWidth={120} field="NewNetLandedCost" editable='false' cellRenderer={'NewcostFormatter'} headerName="Revised" valueGetter={ageValueGetterLanded} colId='NewNetLandedCost'></AgGridColumn>
                                                </AgGridColumn>
                                                {(String(props?.masterId) === String(RMIMPORT) || String(props?.masterId) === String(EXCHNAGERATE)) && <AgGridColumn headerClass="justify-content-center" cellClass="text-center" minWidth={240} headerName={
                                                    "Net Cost (Plant Currency)"

                                                }>
                                                    <AgGridColumn minWidth={columnWidths.NetLandedCost} field="OldNetLandedCostLocalConversion" editable='false' headerName="Existing" colId='OldNetLandedCostLocalConversion' cellRenderer='localConversionFormatter'></AgGridColumn>
                                                    <AgGridColumn minWidth={columnWidths.NewNetLandedCost} field="NewNetLandedCostLocalConversion" editable='false' valueGetter={ageValueGetterLanded} headerName="Revised" colId='NewNetLandedCostLocalConversion' cellRenderer='localConversionFormatter'></AgGridColumn>
                                                </AgGridColumn>
                                                }

                                                <AgGridColumn field="EffectiveDate" headerName={props.isImpactedMaster && !props.lastRevision ? "Current Effective date" : "Effective Date"} editable='false' minWidth={columnWidths.EffectiveDate} cellRenderer='effectiveDateRenderer'></AgGridColumn>
                                                <AgGridColumn field="CostingId" hide={true}></AgGridColumn>


                                            </AgGridReact>))}

                                        {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
                                    </div>
                                </div>

                            </Col>
                        </Row>
                        {true &&
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
                                    {/* <button onClick={runSimulation} type="submit" className="user-btn mr5 save-btn"                    >
                                <div className={"Run"}>
                                </div>{" "}
                                {"RUN SIMULATION"}
                            </button> */}
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
                    showRunSimulationDrawer &&
                    <RunSimulationDrawer
                        isOpen={showRunSimulationDrawer}
                        closeDrawer={closeDrawer}
                        anchor={"right"}
                    />
                }
                {
                    openOtherCostDrawer &&
                    <AddOtherCostDrawer
                        isOpen={openOtherCostDrawer}
                        anchor={"right"}
                        closeDrawer={closeOtherCostDrawer}
                        rawMaterial={true}
                        rmBasicRate={basicRate}
                        ViewMode={isViewFlag}
                        rmTableData={otherCostDetailForRow}
                        RowData={rowData}
                        plantCurrency={rowData?.LocalCurrency}
                        settlementCurrency={rowData?.Currency}
                        isBOP={true}
                        disabled={props?.isImpactedMaster}
                    />
                }
                {
                    getConfigurationKey()?.IsBasicRateAndCostingConditionVisible && openConditionCostDrawer &&
                    <AddConditionCosting
                        isOpen={openConditionCostDrawer}
                        tableData={conditionCostDetailForRow}
                        closeDrawer={closeConditionCostDrawer}
                        anchor={'right'}
                        basicRateBase={netCostWithoutConditionCost}
                        ViewMode={isViewFlag}
                        isFromMaster={true}
                        // isFromImport={states.isImport}
                        // EntryType={checkForNull(ENTRY_TYPE_DOMESTIC)}
                        currency={rowData?.Currency}
                        PlantCurrency={rowData?.LocalCurrency}
                        isBOP={true}
                        disabled={props?.isImpactedMaster}
                    />
                }
            </div>
        </div>
    );
}


export default BDNonAssociatedSimulation;