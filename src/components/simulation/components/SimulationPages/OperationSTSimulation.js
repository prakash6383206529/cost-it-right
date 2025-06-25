import React, { useEffect, useState, useRef, useContext } from 'react';
import { Row, Col, Tooltip, } from 'reactstrap';
import DayTime from '../../../common/DayTimeWrapper'
import { CBCTypeId, defaultPageSize, EMPTY_DATA, EXCHNAGERATE, OPERATIONS, SURFACETREATMENT } from '../../../../config/constants';
import NoContentFound from '../../../common/NoContentFound';
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, getLocalizedCostingHeadValue, loggedInUserId, searchNocontentFilter } from '../../../../helper';
import Toaster from '../../../common/Toaster';
import { Fragment } from 'react';
import { Controller, useForm } from 'react-hook-form'
import RunSimulationDrawer from '../RunSimulationDrawer';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import Simulation from '../Simulation';
import debounce from 'lodash.debounce';
import { TextFieldHookForm } from '../../../layout/HookFormInputs';
import { runVerifySurfaceTreatmentSimulation } from '../../actions/Simulation';
import VerifySimulation from '../VerifySimulation';
import { PaginationWrapper } from '../../../common/commonPagination';
import DatePicker from "react-datepicker";
import WarningMessage from '../../../common/WarningMessage';
import { getMaxDate } from '../../SimulationUtils';
import ReactExport from 'react-export-excel';
import { APPLICABILITY_OPERATIONS_SIMULATION, APPLICABILITY_SURFACE_TREATMENT_SIMULATION, OPERATION_IMPACT_DOWNLOAD_EXCEl } from '../../../../config/masterData';
import { simulationContext } from '..';
import { useLabels } from '../../../../helper/core';
import CostingHeadDropdownFilter from '../../../masters/material-master/CostingHeadDropdownFilter';
import { setResetCostingHead } from '../../../../actions/Common';
import { createMultipleExchangeRate } from '../../../masters/actions/ExchangeRateMaster';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {

};
function OperationSTSimulation(props) {

    const { showEditMaster, handleEditMasterPage, showCompressedColumns } = useContext(simulationContext) || {};

    const { list, isbulkUpload, rowCount, isImpactedMaster, lastRevision, tokenForMultiSimulation } = props
    const [showRunSimulationDrawer, setShowRunSimulationDrawer] = useState(false)
    const [showverifyPage, setShowVerifyPage] = useState(false)
    const [token, setToken] = useState('')
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
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
    const gridRef = useRef();
    const { technologyLabel } = useLabels();
    const { register, control, setValue, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })
    const { vendorLabel, vendorBasedLabel, zeroBasedLabel, customerBasedLabel, weldingMaterialRate } = useLabels()


    const dispatch = useDispatch()

    const { selectedMasterForSimulation, selectedTechnologyForSimulation, exchangeRateListBeforeDraft } = useSelector(state => state.simulation)
    const currencySelectList = useSelector(state => state.comman.currencySelectList)
    const masterList = useSelector(state => state.simulation.masterSelectListSimulation)
    const simulationApplicability = useSelector(state => state.simulation.simulationApplicability)
    const costingHeadFilter = useSelector(state => state?.common?.costingHeadFilter)
    useEffect(() => {

        if (costingHeadFilter && costingHeadFilter?.data) {
            const matchedOption = costingHeadFilter?.CostingHeadOptions?.find(option => option?.value === costingHeadFilter?.data?.value);
            if (matchedOption) {
                gridApi?.setQuickFilter(matchedOption?.label);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [costingHeadFilter]);
    const columnWidths = {
        CostingHead: showCompressedColumns ? 50 : 190,
        OperationName: showCompressedColumns ? 100 : 190,
        OperationCode: showCompressedColumns ? 100 : 190,
        Technology: showCompressedColumns ? 100 : 190,
        VendorCode: showCompressedColumns ? 100 : 190,
        VendorName: showCompressedColumns ? 100 : 190,
        PlantCode: showCompressedColumns ? 100 : 190,
        CustomerName: showCompressedColumns ? 100 : 140,
        EffectiveDate: showCompressedColumns ? 90 : 190,


    };
    const cancelVerifyPage = () => {
        setShowVerifyPage(false)
    }

    const effectiveDateFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        return cell != null ? <span title={DayTime(cell).format('DD/MM/YYYY')}>{DayTime(cell).format('DD/MM/YYYY')}</span> : '';
    }

    useEffect(() => {
        if (isbulkUpload) {
            setValue('NoOfCorrectRow', rowCount.correctRow)
            setValue('NoOfRowsWithoutChange', rowCount.NoOfRowsWithoutChange)
            setTitleObj(prevState => ({ ...prevState, rowWithChanges: rowCount.correctRow, rowWithoutChanges: rowCount.NoOfRowsWithoutChange }))
        }
    }, [])
    useEffect(() => {
        if (list && list?.length >= 0) {
            gridRef?.current?.api.sizeColumnsToFit();
            let maxDate = getMaxDate(list)
            setMaxDate(maxDate?.EffectiveDate)
        }
        list && list?.map(item => {
            item.NewRate = item.Rate
            return null
        })
    }, [list])
    useEffect(() => {

        if (handleEditMasterPage) {
            handleEditMasterPage(showEditMaster, showverifyPage)
        }
    }, [showverifyPage])
    useEffect(() => {
        return () => {
            dispatch(setResetCostingHead(true, "costingHead"))
        }
    }, [])

    // const newRateFormatter = (props) => {
    //     const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
    //     const row = props?.valueFormatted ? props?.valueFormatted : props?.data;

    //     const value = beforeSaveCell(cell)
    //     let valueShow
    //     if (lastRevision) {
    //         if (row.IsSurfaceTreatmenOperation === true) {
    //             valueShow = row.NewSurfaceTreatmentRatePerUOM
    //         } else if (row.IsSurfaceTreatmenOperation === false) {
    //             valueShow = row.NewOperationBasicRate
    //         }
    //     } else {
    //         valueShow = row.NewOperationRate
    //     }
    //     return (
    //         <>
    //             {
    //                 isImpactedMaster ?
    //                     valueShow ://NewNetOperationCost
    //                     <span id={`newOperationRate-${props?.rowIndex}`} className={`${true ? 'form-control' : ''} newRateFormatter netCost_revised`} title={cell && value ? Number(cell) : Number(row.OperationBasicRate)}>{cell && value ? Number(cell) : Number(row.OperationBasicRate)} </span>
    //             }

    //         </>
    //     )
    // }
    const newWeldingRateFormatter = (props) => {
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        const cell = row?.IsSimulated ? row?.NewOperation && row?.NewOperation?.Rate : props?.valueFormatted ? props?.valueFormatted : props?.value;

        const value = beforeSaveCell(cell)

        return (
            <>
                {
                    row.ForType !== "Welding" ?
                        '-' ://NewNetOperationCost
                        <span id={`newOperationRate-${props?.rowIndex}`} className={`${!isImpactedMaster ? 'form-control' : ''} ${row?.IsSimulated ? 'disabled' : ''} newRateFormatter netCost_revised`} title={cell && value ? Number(cell) : Number(row.OperationBasicRate)}>{cell && value ? Number(cell) : Number(row.OperationBasicRate)} </span>
                }

            </>
        )
    }
    const ageValueGetterRate = (params) => {
        let row = params.data
        if (row.ForType === 'Welding') {
            const consumption = row?.OperationConsumption || 1
            row.NewRate = row?.NewOperationBasicRate * consumption
        }
        return row.NewRate
    }

    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            if (list.length !== 0) {
                setNoData(searchNocontentFilter(value, noData))
            }
        }, 500);
    }
    const oldRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        let valueShow
        if (lastRevision) {
            if (row.IsSurfaceTreatmenOperation === true) {
                valueShow = row.OldSurfaceTreatmentRatePerUOM
            } else if (row.IsSurfaceTreatmenOperation === false) {
                valueShow = row.OldOperationBasicRate
            }
        } else {
            valueShow = row.OldOperationRate
        }
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        valueShow :
                        <span title={cell && value ? Number(cell) : Number(row.NewRate)}>{cell && value ? Number(cell) : Number(row.NewRate)} </span>
                }

            </>
        )
    }
    const rateFormatter = (props) => {
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        const cell = row?.IsSimulated ? row?.NewOperation && row?.NewOperation?.Rate : props?.valueFormatted ? props?.valueFormatted : props?.value;
        const value = beforeSaveCell(cell)
        let valueShow
        if (lastRevision) {
            if (row.IsSurfaceTreatmenOperation === true) {
                valueShow = row.NewSurfaceTreatmentRatePerUOM
            } else if (row.IsSurfaceTreatmenOperation === false) {
                valueShow = row.NewOperationBasicRate
            }
        } else {
            valueShow = row.NewOperationRate
        }
        return (
            <>
                {
                    isImpactedMaster ?
                        valueShow ://NewNetOperationCost
                        <span id={`newOperationRate-${props?.rowIndex}`} className={`${true ? 'form-control' : ''} ${row?.IsSimulated ? 'disabled' : ''} newRateFormatter netCost_revised`} title={cell && value ? Number(cell) : Number(row.NewRate)}>{cell && value ? Number(cell) : Number(row.NewRate)} </span>

                }

            </>
        )

    }

    const vendorFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        return (
            <>
                {isbulkUpload ? row[`${vendorLabel} (Code)`] : cell}

            </>
        )
    }

    const plantFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        return (
            <>
                {isbulkUpload ? row['DestinationPlant (Code)'] : cell}

            </>
        )
    }

    const statusFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        return <div className={cell}>{row.DisplayStatus}</div>
    }

    const costFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        if (!row.NewBasicRate || row.BasicRate === row.NewBasicRate || row.NewBasicRate === '') return checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)
        const tempA = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost);
        const classGreen = (tempA > row.NetLandedCost) ? 'red-value form-control' : (tempA < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const revisedRateHeader = (props) => {
        return (
            <div className='ag-header-cell-label'>
                <span className='ag-header-cell-text basicRate_revised'>Revised{!isImpactedMaster && <i className={`fa fa-info-circle tooltip_custom_right tooltip-icon mb-n3 ml-4 mt2 `} id={"basicRate-tooltip"}></i>}</span>
            </div>
        );
    };

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


    const cancel = () => {
        list && list.map((item) => {
            item.NewRate = undefined
            return null
        })
        props?.backToSimulation()
    }

    const closeDrawer = (e = '') => {
        setShowRunSimulationDrawer(false)

    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.sizeColumnsToFit()
        params.api.paginationGoToPage(0);
        setTimeout(() => {
            setShowTooltip(true)
        }, 100);

    };

    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
    };


    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
        setTextFilterSearch(e?.target?.value)
    }

    const NewcostFormatter = (props) => {
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        if (!row.NewRate || Number(row.Rate) === Number(row.NewRate) || row.NewRate === '') return ''
        const NewRate = Number(row.NewRate) + checkForNull(row.RemainingTotal)
        const NetCost = Number(row.Rate) + checkForNull(row.RemainingTotal)
        const classGreen = (NewRate > NetCost) ? 'red-value form-control' : (NewRate < NetCost) ? 'green-value form-control' : 'form-class'
        return row.NewRate != null ? <span className={classGreen}>{checkForDecimalAndNull(NewRate, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const OldcostFormatter = (props) => {
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        const Rate = Number(row.Rate) + checkForNull(row.RemainingTotal)
        return row.Rate != null ? checkForDecimalAndNull(Rate, getConfigurationKey().NoOfDecimalForPrice) : ''
    }

    const handleEffectiveDateChange = (date) => {
        setEffectiveDate(date)
        setIsEffectiveDateSelected(true)
        setIsWarningMessageShow(false)
    }

    const combinedCostingHeadRenderer = (props) => {
        // Call the existing checkBoxRenderer
        costingHeadFormatter(props);

        // Get and localize the cell value
        const cellValue = props?.valueFormatted ? props?.valueFormatted : props?.value;
        const localizedValue = getLocalizedCostingHeadValue(cellValue, vendorBasedLabel, zeroBasedLabel, customerBasedLabel);

        // Return the localized value (the checkbox will be handled by AgGrid's default renderer)
        return localizedValue;
    };

    const costingHeadFormatter = (props) => {
        const cell = props?.valueFormatted ? props?.valueFormatted : props?.value;
        return cell ? cell : '-';
    }

    const customerFormatter = (props) => {
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        return (isbulkUpload ? row['Customer (Code)'] : row.CustomerName);
    }
    const oldBasicRateFormatter = (props) => {
        const row = props?.valueFormatted ? props?.valueFormatted : props?.data;
        return isImpactedMaster ? row?.OldOperationBasicRate : row?.OperationBasicRate
    }
    const consumptionFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = isImpactedMaster ? row?.OldOperationConsumption : row?.OperationConsumption

        return <span>{value}</span>;
    }
    const localConversionFormatter = (props) => {
        const cellValue = checkForNull(props?.value);
        return checkForDecimalAndNull(cellValue, getConfigurationKey().NoOfDecimalForPrice)
    }
    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }
    const frameworkComponents = {
        effectiveDateRenderer: effectiveDateFormatter,
        costFormatter: costFormatter,
        customNoRowsOverlay: NoContentFound,
        newWeldingRateFormatter: newWeldingRateFormatter,
        statusFormatter: statusFormatter,
        NewcostFormatter: NewcostFormatter,
        OldcostFormatter: OldcostFormatter,
        oldRateFormatter: oldRateFormatter,
        vendorFormatter: vendorFormatter,
        plantFormatter: plantFormatter,
        combinedCostingHeadRenderer: combinedCostingHeadRenderer,
        customerFormatter: customerFormatter,
        revisedRateHeader: revisedRateHeader,
        nullHandler: props?.nullHandler && props?.nullHandler,
        rateFormatter: rateFormatter,
        oldBasicRateFormatter: oldBasicRateFormatter,
        consumptionFormatter: consumptionFormatter,
        statusFilter: CostingHeadDropdownFilter,

        localConversionFormatter: localConversionFormatter,
        hyphenFormatter: hyphenFormatter
    };

    const verifySimulation = debounce(() => {
        /**********CONDITION FOR: IS ANY FIELD EDITED****************/

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
    }, 500);
    const setValueFunction = (isExchangeRate, res) => {
        const masterText = simulationApplicability?.label === APPLICABILITY_OPERATIONS_SIMULATION ? APPLICABILITY_OPERATIONS_SIMULATION : APPLICABILITY_SURFACE_TREATMENT_SIMULATION
        const filteredMasterId = masterList?.find(item => item?.Text === masterText)?.Value;
        if (!isEffectiveDateSelected) {
            setIsWarningMessageShow(true)
            return false
        }
        let Count = 0
        let tempData = list
        let arr = []
        tempData && tempData.map((li, index) => {

            if (Number(li.Rate) === Number(li.NewRate) || li?.NewRate === undefined) {
                Count = Count + 1
            } else {

                li.NewTotal = Number(li.NewRate ? li.NewRate : li.Rate) + checkForNull(li.RemainingTotal)

                arr.push(li)
            }
            return null;
        })
        if (Count === tempData.length) {
            Toaster.warning('Please change the rate, then run simulation')
            return false
        }
        setIsDisable(true)
        /**********POST METHOD TO CALL HERE AND AND SEND TOKEN TO VERIFY PAGE ****************/
        let obj = {}
        obj.SimulationTechnologyId = isExchangeRate ? EXCHNAGERATE : selectedMasterForSimulation.value
        obj.LoggedInUserId = loggedInUserId()
        obj.SimulationHeadId = list[0].CostingTypeId
        obj.TechnologyId = selectedTechnologyForSimulation.value
        obj.TechnologyName = selectedTechnologyForSimulation.label
        obj.SimulationIds = tokenForMultiSimulation
        obj.EffectiveDate = DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss')
        obj.ExchangeRateSimulationTechnologyId = filteredMasterId

        let tempArr = []
        arr && arr.map(item => {
            let tempObj = {}
            tempObj.OperationId = item.OperationId
            tempObj.NewOperationId = item?.IsSimulated ? item?.NewOperation && item?.NewOperation?.OperationId ? item?.NewOperation?.OperationId : null : null
            tempObj.OldOperationRate = Number(item.Rate)
            tempObj.NewOperationRate = Number(item.NewRate)
            tempObj.OldOperationBasicRate = Number(item.OperationBasicRate)
            tempObj.NewOperationBasicRate = Number(item.NewOperationBasicRate)
            tempObj.OldOperationConsumption = Number(item.OperationConsumption)
            tempObj.NewOperationConsumption = Number(item.OperationConsumption)


            tempArr.push(tempObj)
            return null
        })
        obj.SimulationSurfaceTreatmentAndOperation = tempArr
        if (isExchangeRate) {
            obj.SimulationExchangeRates = res
            obj.IsExchangeRateSimulation = true
        }
        dispatch(runVerifySurfaceTreatmentSimulation(obj, res => {
            setIsDisable(false)
            if (res?.data?.Result) {
                setToken(res.data.Identity)
                setShowVerifyPage(true)
            }
        }))
    }
    const floatingFilterStatus = {
        maxValue: 1,
        suppressFilterButton: true,
        component: CostingHeadDropdownFilter,

    };
    const resetState = () => {
        gridApi?.setQuickFilter('');
        gridOptions?.columnApi?.resetColumnState();
        gridOptions?.api?.setFilterModel(null);
        window.screen.width >= 1600 && gridOptions?.api?.sizeColumnsToFit();
        setTextFilterSearch('')
    }

    const basicRatetooltipToggle = () => {
        setBasicRateViewTooltip(!basicRateviewTooltip)
    }

    const onBtExport = () => {
        return returnExcelColumn(OPERATION_IMPACT_DOWNLOAD_EXCEl, list)
    };

    const returnExcelColumn = (data = [], TempData) => {
        let temp = []
        TempData && TempData.map((item) => {
            item.EffectiveDate = (item.EffectiveDate)?.slice(0, 10)
            temp.push(item)
        })

        return (
            <ExcelSheet data={temp} name={'Operation Data'}>
                {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
    }
    const EditableCallbackForNewBasicRate = (props) => {
        const rowData = props?.data;
        let value = false
        if (isImpactedMaster || rowData?.IsSimulated) {
            value = false
        } else {
            value = true
        }
        return value
    }


    function getOperationTypes(list) {
        return list.map(item => item.ForType);
    }
    const operationTypes = getOperationTypes(list);
    return (
        <div>
            <div className={`ag-grid-react grid-parent-wrapper`}>
                {!showverifyPage &&
                    <Fragment>
                        {!isImpactedMaster && showTooltip && <Tooltip className="rfq-tooltip-left" placement={"top"} isOpen={basicRateviewTooltip} toggle={basicRatetooltipToggle} target={"basicRate-tooltip"} >{"To edit revised net rate please double click on the field."}</Tooltip>}
                        <form>

                            <Row>
                                <Col className="add-min-height mb-3 sm-edit-page">
                                    <div className={`ag-grid-wrapper height-width-wrapper ${(list && list?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                                        <div className="ag-grid-header d-flex align-items-center justify-content-between">
                                            <div className='d-flex align-items-center'>
                                                <input type="text" className="form-control table-search" id="filter-text-box" value={textFilterSearch} placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                                <button type="button" className="user-btn float-right mr-2 Tour_List_Reset" title="Reset Grid" onClick={() => resetState()}>
                                                    <div className="refresh mr-0"></div>
                                                </button>
                                                {(props?.lastRevision || isImpactedMaster) && < ExcelFile filename={`${props?.lastRevision ? 'Last Revision Data' : 'Impacted Master Data'}`} fileExtension={'.xls'} element={
                                                    <button title="Download" type="button" className={'user-btn'} ><div className="download mr-0"></div></button>}>
                                                    {onBtExport()}
                                                </ExcelFile>}
                                            </div>

                                            <div className='d-flex justify-content-end bulk-upload-row'>
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
                                                {!isImpactedMaster && <div className={`d-flex align-items-center simulation-label-container`}>
                                                    <div className='d-flex pl-3'>
                                                        <label>{technologyLabel}: </label>
                                                        <p className='technology ml-1' title={list[0].Technology}>{list[0].Technology}</p>
                                                    </div>
                                                    {list[0].CostingTypeId !== CBCTypeId && <div className='d-flex pl-3'>
                                                        <label className='mr-1'>{vendorLabel} (Code):</label>
                                                        <p title={list[0].VendorName} className='mr-2'>{list[0].VendorName ? list[0].VendorName : list[0][`${vendorLabel} (Code)`]}</p>

                                                    </div>}
                                                    <button type="button" className={"apply back_simulationPage"} id="simulation-back" onClick={cancel} disabled={isDisable}> <div className={'back-icon'}></div>Back</button>
                                                </div>}
                                            </div>
                                        </div>
                                        <div className="ag-theme-material p-relative" style={{ width: '100%' }}>
                                            {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found simulation-lisitng" />}
                                            {list && <AgGridReact
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
                                                // loadingOverlayComponent={'customLoadingOverlay'}
                                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                                noRowsOverlayComponentParams={{
                                                    title: EMPTY_DATA,
                                                }}
                                                frameworkComponents={frameworkComponents}
                                                stopEditingWhenCellsLoseFocus={true}
                                                suppressColumnVirtualisation={true}
                                                rowSelection={'multiple'}
                                                onFilterModified={onFloatingFilterChanged}
                                                enableBrowserTooltips={true}
                                            // frameworkComponents={frameworkComponents}
                                            >
                                                {!isImpactedMaster && <AgGridColumn field="CostingHead" tooltipField='CostingHead' headerName="Costing Head" editable='false' minWidth={190} cellRenderer={'costingHeadFormatter'}></AgGridColumn>}
                                                {getConfigurationKey()?.IsShowDetailedOperationBreakup && <AgGridColumn field="ForType" headerName="Operation Type" cellRenderer={'hyphenFormatter'} minWidth={190}></AgGridColumn>}
                                                {<AgGridColumn field="EntryType"  minWidth={120} headerName="Entry Type" cellRenderer={"hyphenFormatter"}></AgGridColumn>}
                                                <AgGridColumn field="OperationName" tooltipField='OperationName' editable='false' headerName="Operation Name" minWidth={190}></AgGridColumn>
                                                <AgGridColumn field="OperationCode" tooltipField='OperationCode' editable='false' headerName="Operation Code" minWidth={190}></AgGridColumn>
                                                {!isImpactedMaster && <><AgGridColumn field="Technology" tooltipField='Technology' editable='false' headerName="Technology" minWidth={190}></AgGridColumn></>}
                                                {!isImpactedMaster && list[0].CostingTypeId !== CBCTypeId && <><AgGridColumn field="VendorName" tooltipField='VendorName' editable='false' headerName={vendorLabel + " (Code)"} minWidth={190} cellRenderer='vendorFormatter'></AgGridColumn></>}
                                                {!isImpactedMaster && <><AgGridColumn field={`${isbulkUpload ? 'DestinationPlant' : 'Plants'}`} tooltipField={`${isbulkUpload ? 'DestinationPlant' : 'Plants'}`} editable='false' headerName="Plant (Code)" minWidth={190} cellRenderer='plantFormatter'></AgGridColumn></>}
                                                {!isImpactedMaster && list[0].CostingTypeId === CBCTypeId && <AgGridColumn minWidth={100} field="CustomerName" tooltipField='CustomerName' editable='false' headerName="Customer (Code)" cellRenderer='customerFormatter'></AgGridColumn>}
                                                {operationTypes.includes('Welding') && <AgGridColumn field="OperationConsumption" editable='false' headerName="Consumption" minWidth={190} cellRenderer='consumptionFormatter'></AgGridColumn>}
                                                {getConfigurationKey().IsSourceExchangeRateNameVisible && <AgGridColumn minWidth={100} field="ExchangeRateSourceName" headerName="Exchange Rate Source"></AgGridColumn>}
                                                <AgGridColumn field="Currency" minWidth={180} headerName="Currency/Settlement Currency" cellRenderer={"hyphenFormatter"}></AgGridColumn>
                                                {(isImpactedMaster || lastRevision ) && <AgGridColumn field="LocalCurrency" minWidth={120}  headerName={"Plant Currency"}cellRenderer={"hyphenFormatter"}></AgGridColumn>}

                                                {operationTypes.includes('Welding') && <AgGridColumn headerClass="justify-content-center" cellClass="text-center" minWidth={320} headerName={`${weldingMaterialRate}/Kg`} marryChildren={true} >
                                                    <AgGridColumn minWidth={150} field="" editable={false} headerName="Existing" colId="oldOperationBasicRate" cellRenderer='oldBasicRateFormatter'></AgGridColumn>
                                                    <AgGridColumn minWidth={150} field="NewOperationBasicRate" editable={EditableCallbackForNewBasicRate} headerName="Revised" colId='newOperationBasicRate' headerComponent={'revisedRateHeader'} cellRenderer='newWeldingRateFormatter'></AgGridColumn>
                                                </AgGridColumn>}
                                                <AgGridColumn headerClass="justify-content-center" cellClass="text-center" minWidth={240} headerName="Net Rate (Currency)" marryChildren={true} >
                                                    <AgGridColumn minWidth={120} field="Rate" editable='false' headerName="Existing" colId="Rate" cellRenderer='oldRateFormatter'></AgGridColumn>
                                                    <AgGridColumn minWidth={120} editable={operationTypes.includes('Welding') || EditableCallbackForNewBasicRate} field="NewRate" headerName="Revised" colId='NewRate' headerComponent={'revisedRateHeader'} cellRenderer='rateFormatter' valueGetter={ageValueGetterRate}
                                                    >

                                                    </AgGridColumn>
                                                </AgGridColumn>
                                                {(isImpactedMaster || lastRevision) && String(props?.masterId) === String(EXCHNAGERATE) && <AgGridColumn headerClass="justify-content-center" cellClass="text-center" minWidth={240} headerName={`Net Rate (Plant Currency)`}>
                                                    <AgGridColumn minWidth={120} field="OldOperationBasicRateLocalConversion" editable='false' headerName="Existing" colId='OldOperationNetLandedCostConversion' cellRenderer='localConversionFormatter'></AgGridColumn>
                                                    <AgGridColumn minWidth={120} field="NewOperationBasicRateLocalConversion" editable='false' headerName="Revised" colId='NewOperationNetLandedCostConversion' cellRenderer='localConversionFormatter'></AgGridColumn>
                                                </AgGridColumn>
                                                }
                                                {props?.children}
                                                <AgGridColumn field="EffectiveDate" headerName={props?.isImpactedMaster && !props?.lastRevision ? `Current Effective date` : "Effective Date"} editable='false' minWidth={190} cellRenderer='effectiveDateRenderer'></AgGridColumn>
                                                <AgGridColumn field="CostingId" hide={true}></AgGridColumn>

                                            </AgGridReact>}
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
                                        <button onClick={verifySimulation} type="button" id="verify-btn" className="user-btn mr5 save-btn verifySimulation" disabled={isDisable}>
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
                        </form>
                    </Fragment>

                }
                {
                    showverifyPage &&
                    <VerifySimulation master={selectedMasterForSimulation.value} token={token} cancelVerifyPage={cancelVerifyPage} />
                }

                {
                    showRunSimulationDrawer &&
                    <RunSimulationDrawer
                        isOpen={showRunSimulationDrawer}
                        closeDrawer={closeDrawer}
                        anchor={"right"}
                        masterId={selectedMasterForSimulation.value}
                    />
                }
            </div>

        </div >
    );
}

export default OperationSTSimulation;