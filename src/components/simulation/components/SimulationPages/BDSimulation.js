import React, { useEffect, useState, useRef, useContext } from 'react';
import { Row, Col, Tooltip, } from 'reactstrap';
import DayTime from '../../../common/DayTimeWrapper'
import { defaultPageSize, EMPTY_DATA, CBCTypeId, BOPIMPORT, EXCHNAGERATE, ZBCTypeId } from '../../../../config/constants';
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
import { debounce } from 'lodash'
import { PaginationWrapper } from '../../../common/commonPagination';
import DatePicker from "react-datepicker";
import WarningMessage from '../../../common/WarningMessage';
import { getMaxDate } from '../../SimulationUtils';
import ReactExport from 'react-export-excel';
import { APPLICABILITY_BOP_SIMULATION, BOP_IMPACT_DOWNLOAD_EXCEl, BOP_IMPACT_DOWNLOAD_EXCEl_IMPORT } from '../../../../config/masterData';
import { hideColumnFromExcel, updateCostValue } from '../../../common/CommonFunctions';
import { createMultipleExchangeRate } from '../../../masters/actions/ExchangeRateMaster';
import { reactLocalStorage } from 'reactjs-localstorage';
import { simulationContext } from '..';
import LoaderCustom from '../../../common/LoaderCustom';
import { useLabels } from '../../../../helper/core';
import AddConditionCosting from '../../../costing/components/CostingHeadCosts/AdditionalOtherCost/AddConditionCosting';
import AddOtherCostDrawer from '../../../masters/material-master/AddOtherCostDrawer';

const gridOptions = {

};

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

function BDSimulation(props) {
    const { showEditMaster, handleEditMasterPage, showCompressedColumns, render } = useContext(simulationContext) || {};

    const { list, isbulkUpload, rowCount, isImpactedMaster, tokenForMultiSimulation } = props
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
    const [textFilterSearch, setTextFilterSearch] = useState('')
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
    const [activeTooltip, setActiveTooltip] = useState(null);
    const [scrapRateviewTooltip, setScrapRateViewTooltip] = useState(false)

    const tooltips = {
        basicRate: "To edit revised basic rate please double click on the field.",
        scrapRate: "To edit revised scrap rate please double click on the field."
    };
    const { register, control, setValue, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    const dispatch = useDispatch()
    const { vendorLabel } = useLabels()
    const { selectedMasterForSimulation, selectedTechnologyForSimulation, isMasterAssociatedWithCosting, exchangeRateListBeforeDraft } = useSelector(state => state.simulation)
    const currencySelectList = useSelector(state => state.comman.currencySelectList)
    const simulationApplicability = useSelector(state => state.simulation.simulationApplicability)
    const masterList = useSelector(state => state.simulation.masterSelectListSimulation)
    const columnWidths = {
        BoughtOutPartNumber: showCompressedColumns ? 50 : 140,
        BoughtOutPartName: showCompressedColumns ? 120 : 140,
        BoughtOutPartCategory: showCompressedColumns ? 120 : 140,
        VendorCode: showCompressedColumns ? 120 : 140,
        CustomerName: showCompressedColumns ? 120 : 140,
        plantCode: showCompressedColumns ? 120 : 140,
        Quantity: showCompressedColumns ? 120 : 140,
        EffectiveDate: showCompressedColumns ? 150 : 150,
        NewNetCostWithoutConditionCost: showCompressedColumns ? 70 : 120,
        NetCostWithoutConditionCost: showCompressedColumns ? 70 : 120
    };
    useEffect(() => {
        if (isbulkUpload) {
            setValue('NoOfCorrectRow', rowCount.correctRow)
            setValue('NoOfRowsWithoutChange', rowCount.NoOfRowsWithoutChange)
            setTitleObj(prevState => ({ ...prevState, rowWithChanges: rowCount.correctRow, rowWithoutChanges: rowCount.NoOfRowsWithoutChange }))
        }


        if (!isImpactedMaster && !isbulkUpload) {

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
        if (isImpactedMaster && handleEditMasterPage) {
            handleEditMasterPage(showEditMaster, true);
        } else if (handleEditMasterPage) {
            handleEditMasterPage(showEditMaster, showverifyPage);
        }
    }, [showverifyPage, isImpactedMaster]);
    useEffect(() => {
        if (list && list.length > 0) {
            window.screen.width >= 1920 && gridRef.current.api.sizeColumnsToFit();
            if (isImpactedMaster) {
                gridRef.current.api.sizeColumnsToFit();
            }

            let tempList = [...list]
            if (simulationApplicability?.value === APPLICABILITY_BOP_SIMULATION) {
                tempList = [...exchangeRateListBeforeDraft]
            }
            let maxDate = getMaxDate(tempList)
            setMaxDate(maxDate?.EffectiveDate)
        }
    }, [list])

    useEffect(() => {

        if (list && list?.[rowIndex] && !isImpactedMaster) {

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

    const apiCall = (check, tempList) => {
        const filteredMasterId = masterList?.find(item => item?.Text === "BOP Import")?.Value;
        const NumberOfPieces = getConfigurationKey().IsMinimumOrderQuantityVisible ? checkForNull(list?.[rowIndex]?.NumberOfPieces) : 1;
        let obj = {};
        obj.SimulationTechnologyId = check ? EXCHNAGERATE : selectedMasterForSimulation.value;
        obj.SimulationTypeId = list[0]?.CostingTypeId;
        obj.LoggedInUserId = loggedInUserId();
        obj.TechnologyId = selectedTechnologyForSimulation?.value ? selectedTechnologyForSimulation?.value : null;
        obj.TechnologyName = selectedTechnologyForSimulation?.label ? selectedTechnologyForSimulation?.label : null;
        obj.EffectiveDate = DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss');
        obj.IsSimulationWithOutCosting = !isMasterAssociatedWithCosting;
        obj.ExchangeRateSimulationTechnologyId = filteredMasterId

        let tempArr = [];
        list && list.map(item => {
            if (item.NewBasicRate !== undefined ? Number(item.NewBasicRate) : Number(item.BasicRate)) {
                let tempObj = {};
                tempObj.BoughtOutPartId = item?.BoughtOutPartId || "00000000-0000-0000-0000-000000000000";
                tempObj.OldBOPRate = item?.BasicRate || 0;
                tempObj.NewBOPRate = item?.NewBasicRate ? item?.NewBasicRate : item?.BasicRate || 0;
                tempObj.OldNetLandedCost = item.NetLandedCost || 0;
                tempObj.NewNetLandedCost = (checkForNull(item?.NewBasicRate ? item?.NewBasicRate : item?.BasicRate) + checkForNull(item?.NewOtherNetCost)) / NumberOfPieces + checkForNull(item?.NewNetConditionCost);
                tempObj.NewOtherNetCost = item?.NewOtherNetCost || 0;
                tempObj.NewNetConditionCost = item?.NewNetConditionCost || 0;
                tempObj.NewNetCostWithoutConditionCost = item?.NewNetCostWithoutConditionCost || 0;
                tempObj.BoughtOutPartConditionsDetails = item?.NewBoughtOutPartConditionsDetails || [];
                tempObj.BoughtOutPartOtherCostDetailsSchema = item?.NewBoughtOutPartOtherCostDetailsSchema || [];
                tempArr.push(tempObj);
            }
            return null;
        });
        obj.SimulationHeadId = list[0]?.CostingTypeId

        obj.SimulationBoughtOutPart = tempArr;
        obj.SimulationIds = tokenForMultiSimulation.map(id => ({ SimulationId: id }));

        if (check) {
            obj.SimulationExchangeRates = tempList;
            obj.IsExchangeRateSimulation = true;
        }

        dispatch(runVerifyBoughtOutPartSimulation(obj, res => {
            setIsDisable(false);
            if (res?.data?.Result) {
                setToken(res?.data?.Identity);
                setTimeout(() => {
                    setShowVerifyPage(true);
                }, 200);
            }
        }));
    }

    const verifySimulation = debounce(() => {
        if (!isEffectiveDateSelected) {
            setIsWarningMessageShow(true)
            return false
        }

        let basicRateCount = 0
        let netLandedCostChangeCount = 0
        list && list.map((li) => {
            const oldNetLandedCost = Number(li.NetLandedCost)
            const newNetLandedCost = Number(checkForNull(li?.NewBasicRate || li?.BasicRatePerUOM) +
                checkForNull(li?.NewOtherNetCost) +
                checkForNull(li?.RMFreightCost) +
                checkForNull(li?.RMShearingCost) +
                checkForNull(li?.NewNetConditionCost))

            if (oldNetLandedCost === newNetLandedCost) {
                netLandedCostChangeCount = netLandedCostChangeCount + 1
            }
            if (Number(li.BasicRate) === Number(li.NewBasicRate) || li?.NewBasicRate === undefined) {

                basicRateCount = basicRateCount + 1
            }

            return null;
        })

        if (String(selectedMasterForSimulation?.value) !== String(EXCHNAGERATE) && netLandedCostChangeCount === list.length) {
            Toaster.warning('There is no changes in net cost. Please change the basic rate, then run simulation')
            return false
        }
        setIsDisable(true)
        basicRateCount = 0
        // setShowVerifyPage(true)
        /**********POST METHOD TO CALL HERE AND AND SEND TOKEN TO VERIFY PAGE TODO ****************/
        const check = selectedMasterForSimulation.value === EXCHNAGERATE
        if (selectedMasterForSimulation?.value === EXCHNAGERATE) {
            dispatch(createMultipleExchangeRate(exchangeRateListBeforeDraft, currencySelectList, effectiveDate, res => {
                if (!res?.status && !res?.error) {

                    apiCall(true, res);
                } else {
                    setIsDisable(false)

                }
            }))
        } else {
            apiCall(false, []);
        }
        setShowTooltip(false)
    }, 500)


    const cancelVerifyPage = () => {
        setShowVerifyPage(false)
    }

    const effectiveDateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        return cell != null ? <span title={DayTime(cell).format('DD/MM/YYYY')}>{DayTime(cell).format('DD/MM/YYYY')}</span> : '';
    }

    const costingHeadFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell ? cell : '-';
    }

    const hyphenFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell ? cell : '-';
    }

    const customerFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (isbulkUpload ? row['Customer (Code)'] : row.CustomerName);
    }

    const newBasicRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        checkForDecimalAndNull(row.NewBOPRate, getConfigurationKey().NoOfDecimalForPrice) :
                        <span id={`newBasicRate-${props.rowIndex}`} className={`form-control`} title={cell && value ? checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice) : checkForDecimalAndNull(row?.BasicRate, getConfigurationKey().NoOfDecimalForPrice)}>{cell && value ? checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice) : checkForDecimalAndNull(row?.BasicRate, getConfigurationKey().NoOfDecimalForPrice)} </span>
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
                        row.OldBOPRate :
                        <span title={cell && value ? Number(cell) : Number(row.BasicRate)}>{cell && value ? Number(cell) : Number(row.BasicRate)} </span>
                }

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
                {<span title={isbulkUpload ? row['Plant (Code)'] : cell}>{isbulkUpload ? row['Plant (Code)'] : cell}</span>}

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
    const beforeSaveCell = (props) => {
        const cellValue = props
        if (Number.isInteger(Number(cellValue)) && /^\+?(0|[1-9]\d*)$/.test(cellValue) && cellValue.toString().replace(/\s/g, '').length) {
            if (cellValue.length > 8) {
                Toaster.warning("Value should not be more than 8")
                return false
            }
            return true
        } else if (cellValue && !/^[+]?([0-9]+(?:[.][0-9]*)?|\.[0-9]+)$/.test(cellValue)) {
            Toaster.warning('Please enter a valid positive numbers.')
            return false
        }
        return true
    }

    const NewcostFormatter = (props) => {
        const row = props?.data;

        const NumberOfPieces = getConfigurationKey().IsMinimumOrderQuantityVisible ? Number(row?.NumberOfPieces) : 1
        const existingBasicPrice = (Number(row.BasicRate) + checkForNull(row?.OtherNetCost)) / NumberOfPieces;
        const newBasicPrice = (Number(row.NewBasicRate || row.BasicRate) + checkForNull(row?.NewOtherNetCost)) / NumberOfPieces;


        const existingNetLandedCost = existingBasicPrice + checkForNull(row?.NetConditionCost);
        const newNetLandedCost = newBasicPrice + checkForNull(row?.NewNetConditionCost);



        const displayCost = row.NewBasicRate != null ? newNetLandedCost : existingNetLandedCost;

        // const classGreen = (newNetLandedCost > existingNetLandedCost) ? 'red-value form-control' 
        //             : (newNetLandedCost < existingNetLandedCost) ? 'green-value form-control' 
        //             : 'form-class';
        if (isImpactedMaster) {
            return row.NewNetBoughtOutPartCost ? checkForDecimalAndNull(row.NewNetBoughtOutPartCost, getConfigurationKey().NoOfDecimalForPrice) : '-'
        } else {
            // if (!row.NewBasicRate || Number(row.BasicRate) === Number(row.NewBasicRate) || row.NewBasicRate === '') return ''
            const BasicRate = checkForNull((row.BasicRate) / NumberOfPieces)

            const NewBasicRate = checkForNull((row.NewBasicRate) / NumberOfPieces)
            const NewNetLandedCost = (checkForNull((row.NewBasicRate) + checkForNull(row?.NewOtherNetCost) / NumberOfPieces) + checkForNull(row?.NewNetConditionCost))

            const classGreen = (existingNetLandedCost < newNetLandedCost) ? 'red-value form-control' : (existingNetLandedCost > newNetLandedCost) ? 'green-value form-control' : 'form-class'

            return (
                <span
                    className={row.NewBasicRate != null ? classGreen : ''}
                    title={checkForDecimalAndNull(displayCost, getConfigurationKey().NoOfDecimalForPrice)}
                >
                    {checkForDecimalAndNull(displayCost, getConfigurationKey().NoOfDecimalForPrice)}
                </span>
            );
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
    const OldcostFormatter = (props) => {
        const row = props?.data;
        const NumberOfPieces = getConfigurationKey().IsMinimumOrderQuantityVisible ? Number(row?.NumberOfPieces) : 1
        if (isImpactedMaster) {
            return row.OldNetBoughtOutPartCost ? row.OldNetBoughtOutPartCost : '-'
        } else {
            if (!row.BasicRate || row.BasicRate === '') return ''

            return row.BasicRate != null ? <span title={checkForDecimalAndNull((Number(row.BasicRate) + checkForNull(row?.OtherNetCost) / NumberOfPieces) + checkForNull(row?.NetConditionCost), getConfigurationKey().NoOfDecimalForPrice)}>{checkForDecimalAndNull(Number(row.BasicRate) + checkForNull(row?.OtherNetCost) + checkForNull(row?.NetConditionCost) / NumberOfPieces, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''

        }
    }
    const revisedBasicRateHeader = (props) => {
        return (
            <div className='ag-header-cell-label'>
                <span className='ag-header-cell-text' id="basicRate_revised">Revised{!isImpactedMaster && <i className={`fa fa-info-circle tooltip_custom_right tooltip-icon mb-n3 ml-4 mt2 `} id={"basicRate-tooltip"}></i>}</span>
            </div>
        );
    };
    const quantityFormatter = (props) => {

        const row = props?.valueFormatted ? props.valueFormatted : props?.data;

        return (
            <>
                {
                    isImpactedMaster ?
                        checkForDecimalAndNull(row.Quantity, getConfigurationKey().NoOfDecimalForPrice) :
                        <span title={Number(row.NumberOfPieces)}>{Number(row.NumberOfPieces)} </span>
                }

            </>
        )

    }
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
        editable: true
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
        window.screen.width >= 1921 && params.api.sizeColumnsToFit();

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
        setTextFilterSearch(e?.target?.value)
    }

    const cellChange = (props) => {

    }
    const resetState = () => {
        gridApi?.setQuickFilter('');
        setTextFilterSearch('')
        gridOptions?.columnApi?.resetColumnState();
        gridOptions?.api?.setFilterModel(null);
        window.screen.width >= 1440 && gridRef.current.api.sizeColumnsToFit();
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
    const otherCostDrawer = (value, row, index, type) => {

        setRowData(row)
        setBasicRate(row?.NewBasicRate)
        if (type === 'Old') {

            setOtherCostDetailForRow(row?.BoughtOutPartOtherCostDetailsSchema || [])
            setIsViewFlag(true)
            setEditIndex(index)
        } else {

            setOtherCostDetailForRow(isImpactedMaster ? row?.SimulationBoughtOutPartOtherCostDetailsList : row?.NewBoughtOutPartOtherCostDetailsSchema || []);            // setIsViewFlag((isRunSimulationClicked || isApprovalSummary) ? true : false)
            setIsViewFlag(false)
            setEditIndex(index)
        }
        setOpenOtherCostDrawer(true)

    }
    const closeOtherCostDrawer = (type, tableData, totalCostCurrency, totalCostBase, RowIndex) => {

        if (type === 'Save') {
            calculateAndSave(tableData, totalCostBase)
        } else {
            const originalDetails = list[editIndex]?.BoughtOutPartOtherCostDetailsSchema || [];
            setOtherCostDetailForRow(originalDetails);
        }
        setOpenOtherCostDrawer(false)
        setIsViewFlag(false)
        // setOtherCostDetailForRow([])
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
    const closeConditionCostDrawer = (type, tableData, totalCostCurrency, conditionCost) => {

        if (type === 'save') {
            const newConditionCost = tableData.reduce((acc, item) => checkForNull(acc) + checkForNull(item?.ConditionCostPerQuantity || 0), 0);
            calculateAndSaveCondition(tableData, newConditionCost)
        } else {
            const originalDetails = list[editIndex]?.BoughtOutPartConditionsDetails || [];
            setConditionCostDetailForRow(originalDetails);
        }
        setOpenConditionCostDrawer(false)
        setIsViewFlag(false)
        // setOtherCostDetailForRow([])
    }
    const conditionCostDrawer = (value, row, index, type) => {

        setRowData(row)
        setBasicRate(row?.NewBasicRate)
        if (type === 'Old') {

            setConditionCostDetailForRow(row?.BoughtOutPartConditionsDetails || [])
            setIsViewFlag(true)
            setEditIndex(index)
        } else {

            setConditionCostDetailForRow(isImpactedMaster ? row?.SimulationBoughtOutPartConditionsDetails : row?.NewBoughtOutPartConditionsDetails || [])
            // setIsViewFlag((isRunSimulationClicked || isApprovalSummary) ? true : false)
            setIsViewFlag(false)
            setEditIndex(index)
        }
        setOpenConditionCostDrawer(true)

    }
    const existingOtherCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        const row = props?.valueFormatted ? props.valueFormatted : props?.data;

        const value = beforeSaveCell(cell, props, 'otherCost')

        return (
            <>
                {
                    isImpactedMaster ?
                        checkForDecimalAndNull(Number(row?.OldOtherCost), getConfigurationKey().NoOfDecimalForPrice) :
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
                    isImpactedMaster ?
                        checkForDecimalAndNull(Number(row?.OldNetConditionCost), getConfigurationKey().NoOfDecimalForPrice) :
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
                    isImpactedMaster ?
                        row?.NewOtherCost :
                        <span title={showValue} className={`${classGreen} with-button`}>{showValue} </span>

                }
                {/* {!isCostingSimulation && <button */}
                {true && <button
                    type="button"
                    // className={`${(isRunSimulationClicked || isApprovalSummary) ? 'View small ml-1' : ' add-out-sourcing ml-1'} `}
                    // onClick={() => otherCostDrawer(cell, row, props.rowIndex, 'New')}
                    className={`${isImpactedMaster ? 'View small ml-1' : ' add-out-sourcing ml-1'} `}
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
                    isImpactedMaster ?
                        row?.NewNetConditionCost :
                        <span title={showValue} className={`${classGreen} with-button`}>{showValue} </span>

                }
                {/* {!isCostingSimulation && <button */}
                {true && <button
                    type="button"
                    // className={`${(isRunSimulationClicked || isApprovalSummary) ? 'View small ml-1' : ' add-out-sourcing ml-1'} `}
                    // onClick={() => ConditionCostDrawer(cell, row, props.rowIndex, 'New')}
                    className={`${isImpactedMaster ? 'View small ml-1' : ' add-out-sourcing ml-1'} `}
                    onClick={() => conditionCostDrawer(cell, row, props.rowIndex, 'New')}
                    title="Add"
                >
                </button>}

            </>
        )
    }
    const basicPriceRevisedFormatter = (props) => {
        const row = props?.data;

        const NumberOfPieces = getConfigurationKey().IsMinimumOrderQuantityVisible ? Number(row?.NumberOfPieces) : 1

        let returnValue = '';

        const newBasicRate = props?.isImpactedMaster ? checkForDecimalAndNull(row.NewBOPRate, getConfigurationKey().NoOfDecimalForPrice) : (row.NewBasicRate || row.BasicRate);

        const newOtherCost = props?.isImpactedMaster ? checkForDecimalAndNull(row.NewOtherCost, getConfigurationKey().NoOfDecimalForPrice) : (row.NewOtherNetCost || row.OtherNetCost)


        // if ((row?.Percentage !== '') && (checkForNull(row?.Percentage) !== 0) && checkForNull(row?.Percentage) <= 100) {
        //     // If percentage is applied
        //     const basicRateWithPercentage = row.BasicRate + (row.BasicRate * row.Percentage / 100);
        //     returnValue = checkForDecimalAndNull(basicRateWithPercentage + checkForNull(newOtherCost), getConfigurationKey().NoOfDecimalForPrice);
        // } else {
        // If direct basic rate is used
        returnValue = checkForDecimalAndNull(isImpactedMaster ? row?.NewNetCostWithoutConditionCost : (checkForNull(newBasicRate) + checkForNull(newOtherCost)) / NumberOfPieces, getConfigurationKey().NoOfDecimalForPrice);
        // }

        return (
            <div className='ag-header-cell-label'>
                <span title={returnValue}>{returnValue}</span>
            </div>
        );
    };
    const localConversionFormatter = (props) => {
        const cellValue = checkForNull(props?.value);
        return checkForDecimalAndNull(cellValue, getConfigurationKey().NoOfDecimalForPrice)
    }
    const frameworkComponents = {
        effectiveDateRenderer: effectiveDateFormatter,
        costingHeadFormatter: costingHeadFormatter,
        NewcostFormatter: NewcostFormatter,
        OldcostFormatter: OldcostFormatter,
        costFormatter: costFormatter,
        customNoRowsOverlay: NoContentFound,
        newBasicRateFormatter: newBasicRateFormatter,
        cellChange: cellChange,
        oldBasicRateFormatter: oldBasicRateFormatter,
        vendorFormatter: vendorFormatter,
        plantFormatter: plantFormatter,
        customerFormatter: customerFormatter,
        revisedBasicRateHeader: revisedBasicRateHeader,
        nullHandler: props.nullHandler && props.nullHandler,
        quantityFormatter: quantityFormatter,
        hyphenFormatter: hyphenFormatter,
        existingOtherCostFormatter: existingOtherCostFormatter,
        revisedOtherCostFormatter: revisedOtherCostFormatter,
        existingConditionCostFormatter: existingConditionCostFormatter,
        revisedConditionCostFormatter: revisedConditionCostFormatter,
        basicPriceRevisedFormatter: basicPriceRevisedFormatter,
        localConversionFormatter: localConversionFormatter
    };

    const basicRatetooltipToggle = () => {
        setBasicRateViewTooltip(!basicRateviewTooltip)
    }
    const scrapRatetooltipToggle = () => {
        setScrapRateViewTooltip(!scrapRateviewTooltip)
    }
    const onBtExport = () => {
        if (String(props?.masterId) === String(BOPIMPORT)) {
            return returnExcelColumn(BOP_IMPACT_DOWNLOAD_EXCEl_IMPORT, list)
        } else {

            return returnExcelColumn(BOP_IMPACT_DOWNLOAD_EXCEl, list)
        }
    };

    const returnExcelColumn = (data = [], TempData) => {
        let tempData = []
        let temp = []
        TempData && TempData.map((item) => {
            const processedItem = { ...item }
            processedItem.EffectiveDate = (processedItem?.EffectiveDate)?.slice(0, 10) || "-";
            if (processedItem?.NewNetLandedCostConversion === null || processedItem?.NewNetLandedCostConversion === undefined) {
                processedItem.NewNetLandedCostConversion = isImpactedMaster ? processedItem?.NewNetBoughtOutPartCost : processedItem?.OriginalNetLandedCost ?? processedItem?.NetLandedCost;
            }
            processedItem.BasicRate = isImpactedMaster ? processedItem?.OldBOPRate : processedItem?.BasicRate
            processedItem.NewBasicRate = isImpactedMaster ? processedItem?.NewBOPRate : processedItem?.NewBasicRate
            processedItem.OtherNetCost = isImpactedMaster ? processedItem?.OldOtherCost : processedItem?.OtherNetCost
            processedItem.NewOtherNetCost = isImpactedMaster ? processedItem?.NewOtherCost : processedItem?.OtherNetCost
            processedItem.NetLandedCost = isImpactedMaster ? processedItem?.OldNetBoughtOutPartCost : processedItem?.NetLandedCost

            Object.keys(processedItem).forEach(key => {
                if (processedItem[key] === null || processedItem[key] === undefined || processedItem[key] === '') {
                    processedItem[key] = "-";
                }
            })
            temp.push(processedItem);
        })
        if (!getConfigurationKey().IsMinimumOrderQuantityVisible) {
            tempData = hideColumnFromExcel(data, 'Quantity')
        } else {
            tempData = data
        }

        if (isImpactedMaster && temp[0]?.EntryType === "Domestic") {
            tempData = hideColumnFromExcel(data, "LocalCurrency")
        }
        if (isImpactedMaster) {
            tempData = tempData.filter(column => !['BoughtOutPartCategory', 'Vendor', 'Plants', column?.EntryType === "Import" ? "LocalCurrency" : undefined].includes(column.value));
        } else {
            tempData = tempData.filter(column => !['PreviousMinimum', 'PreviousMaximum', 'PreviousAverage',
                'Minimum', 'Maximum', 'Average', 'LocalCurrency'].includes(column.value));
        }
        return (
            <ExcelSheet data={temp} name={`${showBopLabel()} Data`}>
                {tempData && tempData.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
    }


    return (

        <div>
            <div className={`ag-grid-react`}>
                {
                    !showverifyPage &&
                    <Fragment>
                        {!isImpactedMaster && showTooltip && <Tooltip className="rfq-tooltip-left" placement={"top"} isOpen={basicRateviewTooltip} toggle={basicRatetooltipToggle} target={"basicRate-tooltip"} >{"To edit revised basic rate please double click on the field."}</Tooltip>}
                        {/* {!isImpactedMaster && showTooltip && <Tooltip className="rfq-tooltip-left" placement={"top"} isOpen={scrapRateviewTooltip} toggle={scrapRatetooltipToggle} target={"scrapRate-tooltip"} >{"To edit revised scrap rate please double click on the field."}</Tooltip>} */}

                        <Row>
                            <Col className={`add-min-height mb-3 sm-edit-page  ${(list && list?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                                <div className="ag-grid-wrapper height-width-wrapper">
                                    <div className="ag-grid-header d-flex align-items-center justify-content-between">
                                        <div className='d-flex align-items-center'>
                                            <input type="text" className="form-control table-search" id="filter-text-box" value={textFilterSearch} placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                            <button type="button" className="user-btn float-right mr-2" title="Reset Grid" onClick={() => resetState()}>
                                                <div className="refresh mr-0"></div>
                                            </button>
                                            <ExcelFile filename={`${props.lastRevision ? 'Last Revision Data' : 'Impacted Master Data'}`} fileExtension={'.xls'} element={
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
                                            {
                                                !isImpactedMaster && list && <div className={`d-flex align-items-center simulation-label-container`}>
                                                    {list[0]?.CostingTypeId !== CBCTypeId && <div className='d-flex pl-3'>
                                                        <label className='mr-1'>{vendorLabel} (Code):</label>
                                                        <p title={list[0]?.Vendor} className='mr-2'>{list[0]?.Vendor ? list[0]?.Vendor : list?.[0]?.['Vendor (Code)']}</p>
                                                    </div>}
                                                    <button type="button" id="simulation-back" className={"apply back_simulationPage"} onClick={cancel}> <div className={'back-icon'}></div>Back</button>
                                                </div>}
                                        </div>
                                    </div >
                                    <div className="ag-theme-material p-relative" style={{ width: '100%' }}>
                                        {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found simulation-lisitng" />}
                                        {list &&
                                            (render || isLoader ? <LoaderCustom customClass="loader-center" /> : (<AgGridReact
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
                                                onFilterModified={onFloatingFilterChanged}
                                                enableBrowserTooltips={true}
                                                onCellValueChanged={onCellValueChanged}
                                            >
                                                {/* <AgGridColumn field="Technologies" editable='false' headerName="Technology" minWidth={190}></AgGridColumn> */}
                                                {
                                                    !isImpactedMaster &&
                                                    <AgGridColumn minWidth={140} field="CostingHead" tooltipField='CostingHead' headerName="Costing Head" editable='false' cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                                                }
                                                {<AgGridColumn field="EntryType" minWidth={120} headerName="Entry Type" cellRenderer={"hyphenFormatter"}></AgGridColumn>}
                                                <AgGridColumn field="BoughtOutPartNumber" tooltipField='BoughtOutPartNumber' editable='false' headerName="BOP Part No" minWidth={columnWidths.BoughtOutPartNumber}></AgGridColumn>
                                                <AgGridColumn field="BoughtOutPartName" tooltipField='BoughtOutPartName' editable='false' headerName="BOP Part Name" minWidth={columnWidths.BoughtOutPartName}></AgGridColumn>
                                                {!isImpactedMaster && <AgGridColumn field="BoughtOutPartCategory" tooltipField='BoughtOutPartCategory' editable='false' headerName="BOP Part Category" minWidth={columnWidths.BoughtOutPartCategory}></AgGridColumn>}
                                                {!isImpactedMaster && list[0].CostingTypeId !== CBCTypeId && <AgGridColumn field="Vendor" tooltipField='Vendor' editable='false' headerName={vendorLabel + " (Code)"} minWidth={columnWidths.VendorCode} cellRenderer='vendorFormatter'></AgGridColumn>}
                                                {!isImpactedMaster && list[0].CostingTypeId === CBCTypeId && <AgGridColumn field="CustomerName" tooltipField='CustomerName' editable='false' headerName="Customer (Code)" minWidth={columnWidths.CustomerName} cellRenderer='customerFormatter'></AgGridColumn>}
                                                {!isImpactedMaster && <AgGridColumn field="Plants" editable='false' headerName="Plant (Code)" tooltipField='Plant (Code)' minWidth={columnWidths.plantCode} cellRenderer='plantFormatter'></AgGridColumn>}
                                                {getConfigurationKey().IsMinimumOrderQuantityVisible && <AgGridColumn field="Quantity" tooltipField='Quantity' editable='false' headerName="Min Order Quantity" minWidth={columnWidths.Quantity} cellRenderer='quantityFormatter'></AgGridColumn>}
                                                {getConfigurationKey().IsSourceExchangeRateNameVisible && <AgGridColumn minWidth={120} field="ExchangeRateSourceName" headerName="Exchange Rate Source"></AgGridColumn>}
                                                {<AgGridColumn field="Currency" minWidth={180} tooltipField='Currency' editable='false' headerName="Currency/Settlement Currency"  ></AgGridColumn>}
                                                {(String(props?.masterId) === String(BOPIMPORT) || String(props?.masterId) === String(EXCHNAGERATE)) && (isImpactedMaster || props?.lastRevision) && <AgGridColumn field="LocalCurrency" minWidth={120} headerName={"Plant Currency"} cellRenderer={"currencyFormatter"}></AgGridColumn>}

                                                <AgGridColumn headerClass="justify-content-center" cellClass="text-center" headerName={
                                                    "Basic Rate (Currency)"

                                                } marryChildren={true} minWidth={240}>
                                                    <AgGridColumn minWidth={120} field="BasicRate" editable='false' cellRenderer='oldBasicRateFormatter' headerName="Existing" colId="BasicRate" suppressSizeToFit={true}></AgGridColumn>
                                                    <AgGridColumn minWidth={120} cellRenderer='newBasicRateFormatter' onCellValueChanged='cellChange' field="NewBasicRate" editable={isImpactedMaster ? false : EditableCallbackForBasicRate} headerName="Revised" colId='NewBasicRate' headerComponent={'revisedBasicRateHeader'} suppressSizeToFit={true}></AgGridColumn>
                                                </AgGridColumn>

                                                <AgGridColumn headerClass="justify-content-center" cellClass="text-center" minWidth={300} headerName={
                                                    "Other Cost (Currency)"

                                                } marryChildren={true} >

                                                    <AgGridColumn minWidth={150} cellRenderer='existingOtherCostFormatter' field={isImpactedMaster ? "OldOtherCost" : "OtherNetCost"} editable='false' headerName="Existing" colId={isImpactedMaster ? "OtherNetCost" : "OtherNetCost"} ></AgGridColumn>
                                                    <AgGridColumn minWidth={150} cellRenderer='revisedOtherCostFormatter' editable={false} onCellValueChanged='cellChange' field={isImpactedMaster ? "NewOtherCost" : "NewOtherNetCost"} headerName="Revised" colId='NewOtherNetCost' ></AgGridColumn>
                                                </AgGridColumn>
                                                {getConfigurationKey().IsBasicRateAndCostingConditionVisible && list[0].CostingTypeId === ZBCTypeId && <AgGridColumn headerClass="justify-content-center" cellClass="text-center" minWidth={240} headerName={"Basic Price (Currency)"}>
                                                    <AgGridColumn minWidth={columnWidths.NetCostWithoutConditionCost} field={isImpactedMaster ? 'OldNetCostWithoutConditionCost' : 'NetCostWithoutConditionCost'} editable='false' headerName="Existing" colId='NetCostWithoutConditionCost'></AgGridColumn>
                                                    <AgGridColumn minWidth={columnWidths.NewNetCostWithoutConditionCost} field="NewNetCostWithoutConditionCost" editable='false' headerName="Revised" cellRenderer='basicPriceRevisedFormatter' colId='NewNetCostWithoutConditionCost'></AgGridColumn>
                                                </AgGridColumn>}

                                                {getConfigurationKey().IsBasicRateAndCostingConditionVisible && list[0].CostingTypeId === ZBCTypeId && <AgGridColumn headerClass="justify-content-center" cellClass="text-center" minWidth={300} headerName={"Condition Cost (Currency)"} marryChildren={true} >

                                                    <AgGridColumn minWidth={150} cellRenderer='existingConditionCostFormatter' field={isImpactedMaster ? "OldNetConditionCost" : "NetConditionCost"} editable='false' headerName="Existing" colId={isImpactedMaster ? "NetConditionCost" : "NetConditionCost"} ></AgGridColumn>
                                                    <AgGridColumn minWidth={150} cellRenderer='revisedConditionCostFormatter' editable={false} onCellValueChanged='cellChange' field={isImpactedMaster ? "NewNetConditionCost" : "NewNetConditionCost"} headerName="Revised" colId='NewNetConditionCost'></AgGridColumn>
                                                </AgGridColumn>}
                                                <AgGridColumn headerClass="justify-content-center" cellClass="text-center" minWidth={240} headerName={
                                                    "Net Cost (Currency)"

                                                } marryChildren={true}>
                                                    <AgGridColumn minWidth={200} field="OldNetLandedCost" editable='false' cellRenderer={'OldcostFormatter'} headerName="Existing" colId='NetLandedCost' suppressSizeToFit={true}></AgGridColumn>
                                                    <AgGridColumn minWidth={200} field="NewNetLandedCost" editable='false' valueGetter='data.NewBasicRate' cellRenderer={'NewcostFormatter'} headerName="Revised" colId='NewNetLandedCost' suppressSizeToFit={true}></AgGridColumn>
                                                </AgGridColumn>
                                                {
                                                    (String(props?.masterId) === String(BOPIMPORT) || String(props?.masterId) === String(EXCHNAGERATE)) && (isImpactedMaster || props?.lastRevision) && <AgGridColumn headerClass="justify-content-center" cellClass="text-center" headerName={`Net Cost (Plant Currency)`} marryChildren={true} >
                                                        <AgGridColumn minWidth={120} field="OldBoughtOutPartNetLandedCostLocalConversion" tooltipField='OldBoughtOutPartNetLandedCostConversion' editable='false' headerName="Existing" colId='OldBoughtOutPartNetLandedCostConversion' cellRenderer='localConversionFormatter'></AgGridColumn>
                                                        <AgGridColumn minWidth={120} field="NewBoughtOutPartNetLandedCostLocalConversion" editable='false' headerName="Revised" colId='NewBoughtOutPartNetLandedCostConversion' cellRenderer='localConversionFormatter'></AgGridColumn>
                                                    </AgGridColumn>
                                                }
                                                {props?.children}
                                                <AgGridColumn field="EffectiveDate" headerName={props.isImpactedMaster && !props.lastRevision ? "Current Effective date" : "Effective Date"} editable='false' minWidth={columnWidths.EffectiveDate} cellRenderer='effectiveDateRenderer'></AgGridColumn>
                                                <AgGridColumn field="CostingId" hide={true}></AgGridColumn>



                                            </AgGridReact >))}

                                        {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
                                    </div >
                                </div >

                            </Col >
                        </Row >
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
                                    {/* <button onClick={runSimulation} type="submit" className="user-btn mr5 save-btn"                    >
                                <div className={"Run"}>
                                </div>{" "}
                                {"RUN SIMULATION"}
                            </button> */}
                                </div>
                            </Row >
                        }
                    </Fragment >

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
                        disabled={isImpactedMaster}
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
                        disabled={isImpactedMaster}
                    />
                }
            </div >
        </div >
    );
}


export default BDSimulation;