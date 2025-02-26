import React, { useEffect, useState, useRef, useContext } from 'react';
import { Row, Col, Tooltip, } from 'reactstrap';
import DayTime from '../../../common/DayTimeWrapper'
import { defaultPageSize, EMPTY_DATA, CBCTypeId, BOPIMPORT, EXCHNAGERATE } from '../../../../config/constants';
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
import { hideColumnFromExcel } from '../../../common/CommonFunctions';
import { createMultipleExchangeRate } from '../../../masters/actions/ExchangeRateMaster';
import { reactLocalStorage } from 'reactjs-localstorage';
import { simulationContext } from '..';
import LoaderCustom from '../../../common/LoaderCustom';
import { useLabels } from '../../../../helper/core';

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
    const { register, control, setValue, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    const dispatch = useDispatch()
    const { vendorLabel } = useLabels()
    const { selectedMasterForSimulation, selectedTechnologyForSimulation, isMasterAssociatedWithCosting, exchangeRateListBeforeDraft } = useSelector(state => state.simulation)
    const currencySelectList = useSelector(state => state.comman.currencySelectList)
    const simulationApplicability = useSelector(state => state.simulation.simulationApplicability)
    const columnWidths = {
        BoughtOutPartNumber: showCompressedColumns ? 50 : 140,
        BoughtOutPartName: showCompressedColumns ? 120 : 140,
        BoughtOutPartCategory: showCompressedColumns ? 120 : 140,
        VendorCode: showCompressedColumns ? 120 : 140,
        CustomerName: showCompressedColumns ? 120 : 140,
        plantCode: showCompressedColumns ? 120 : 140,
        Quantity: showCompressedColumns ? 120 : 140,
        EffectiveDate: showCompressedColumns ? 150 : 150,
    };
    useEffect(() => {
        if (isbulkUpload) {
            setValue('NoOfCorrectRow', rowCount.correctRow)
            setValue('NoOfRowsWithoutChange', rowCount.NoOfRowsWithoutChange)
            setTitleObj(prevState => ({ ...prevState, rowWithChanges: rowCount.correctRow, rowWithoutChanges: rowCount.NoOfRowsWithoutChange }))
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

    const apiCall = (check, tempList) => {
        let obj = {}
        obj.SimulationTechnologyId = check ? BOPIMPORT : selectedMasterForSimulation.value
        obj.SimulationTypeId = list[0]?.CostingTypeId
        obj.LoggedInUserId = loggedInUserId()
        obj.TechnologyId = selectedTechnologyForSimulation?.value ? selectedTechnologyForSimulation?.value : null
        obj.TechnologyName = selectedTechnologyForSimulation?.label ? selectedTechnologyForSimulation?.label : null
        obj.EffectiveDate = effectiveDate
        // if (filteredRMData.plantId && filteredRMData.plantId.value) {
        //     obj.PlantId = filteredRMData.plantId ? filteredRMData.plantId.value : ''
        // }
        let tempArr = []
        list && list.map(item => {
            if (item.NewBasicRate !== undefined ? Number(item.NewBasicRate) : Number(item.BasicRate)) {
                let tempObj = {}
                tempObj.BoughtOutPartId = item?.BoughtOutPartId
                tempObj.NewBoughtOutPartId = (item?.NewBoughtOutPart && item?.NewBoughtOutPart?.BoughtOutPartId ? item?.NewBoughtOutPart?.BoughtOutPartId : null) ?? null
                tempObj.OldBOPRate = item?.BasicRate
                tempObj.NewBOPRate = item?.NewBasicRate ? item?.NewBasicRate : item?.BasicRate
                tempObj.OldNetLandedCost = checkForNull(item?.BasicRate) / (getConfigurationKey().IsMinimumOrderQuantityVisible ? checkForNull(item?.NumberOfPieces) : 1)
                tempObj.NewNetLandedCost = checkForNull(item?.NewBasicRate ? item?.NewBasicRate : item?.BasicRate) / (getConfigurationKey().IsMinimumOrderQuantityVisible ? checkForNull(item?.NumberOfPieces) : 1)
                tempArr.push(tempObj)
            }
            return null;
        })

        obj.SimulationIds = tokenForMultiSimulation
        obj.SimulationBoughtOutPart = tempArr
        obj.EffectiveDate = DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss')
        obj.SimulationHeadId = list[0]?.CostingTypeId
        obj.IsSimulationWithOutCosting = !isMasterAssociatedWithCosting

        if (check) {
            obj.SimulationExchangeRates = tempList
            obj.IsExchangeRateSimulation = true
        }

        dispatch(runVerifyBoughtOutPartSimulation(obj, res => {
            setIsDisable(false)
            if (res?.data?.Result) {
                setToken(res?.data?.Identity)
                setTimeout(() => {
                    setShowVerifyPage(true)
                }, 200);
            }
        }))
    }

    const verifySimulation = debounce(() => {
        if (!isEffectiveDateSelected) {
            setIsWarningMessageShow(true)
            return false
        }

        let basicRateCount = 0

        list && list.map((li) => {
            if (Number(li.BasicRate) === (li?.IsSimulated ? li?.NewBoughtOutPart?.BasicRate : Number(li.NewBasicRate)) || (li?.IsSimulated ? false : li?.NewBasicRate === undefined)) {

                basicRateCount = basicRateCount + 1
            }

            return null;
        })

        if (String(selectedMasterForSimulation?.value) !== String(EXCHNAGERATE) && basicRateCount === list.length) {
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
                apiCall(check, res);
            }))
        } else {
            apiCall(check);
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
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const cell = row?.IsSimulated ? row?.NewBoughtOutPart?.BasicRate : props?.valueFormatted ? props.valueFormatted : props?.value;
        const value = row?.IsSimulated ? row?.NewBoughtOutPart?.BasicRate : beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        Number(row.NewBOPRate) :
                        <span id={`newBasicRate-${props.rowIndex}`} className={`${!isbulkUpload ? 'form-control' : ''} ${row?.IsSimulated ? 'disabled' : ''}`} title={cell && value ? Number(cell) : Number(row.BasicRate)}>{cell && value ? Number(cell) : Number(row.BasicRate)} </span>
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

    const NewcostFormatter = (props) => {
        const row = props?.data;
        const NumberOfPieces = getConfigurationKey().IsMinimumOrderQuantityVisible ? Number(row?.NumberOfPieces) : 1

        if (isImpactedMaster) {
            return row.NewNetBoughtOutPartCost ? row.NewNetBoughtOutPartCost : '-'
        } else {
            // if (!row.NewBasicRate || Number(row.BasicRate) === Number(row.NewBasicRate) || row.NewBasicRate === '') return ''
            const BasicRate = checkForNull((row.BasicRate) / NumberOfPieces)

            const NewBasicRate = checkForNull((row.NewBasicRate) / NumberOfPieces)
            const classGreen = (BasicRate < NewBasicRate) ? 'red-value form-control' : (BasicRate > NewBasicRate) ? 'green-value form-control' : 'form-class'
            return (
                <div id="netCost_revised" className='ag-header-cell-label'>
                    {row.NewBasicRate != null ? (
                        <span /* id="netCost_revised" */ className={classGreen} title={checkForDecimalAndNull((row.NewBasicRate), getConfigurationKey().NoOfDecimalForPrice)}>
                            {checkForDecimalAndNull((row.NewBasicRate), getConfigurationKey().NoOfDecimalForPrice)}
                        </span>
                    ) : (
                        <span/*  id="netCost_revised" */ title={checkForDecimalAndNull(row.BasicRate, getConfigurationKey().NoOfDecimalForPrice)}>
                            {checkForDecimalAndNull(row.BasicRate, getConfigurationKey().NoOfDecimalForPrice)}
                        </span>
                    )}
                </div>
            );
        }
    }

    const OldcostFormatter = (props) => {
        const row = props?.data;
        const NumberOfPieces = getConfigurationKey().IsMinimumOrderQuantityVisible ? Number(row?.NumberOfPieces) : 1
        if (isImpactedMaster) {
            return row.OldNetBoughtOutPartCost ? row.OldNetBoughtOutPartCost : '-'
        } else {
            if (!row.BasicRate || row.BasicRate === '') return ''

            return row.BasicRate != null ? <span title={checkForDecimalAndNull(Number(row.BasicRate) / NumberOfPieces, getConfigurationKey().NoOfDecimalForPrice)}>{checkForDecimalAndNull(Number(row.BasicRate) / NumberOfPieces, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''

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
        window.screen.width >= 1600 && params.api.sizeColumnsToFit()
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
        hyphenFormatter: hyphenFormatter
    };

    const basicRatetooltipToggle = () => {
        setBasicRateViewTooltip(!basicRateviewTooltip)
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
            item.EffectiveDate = (item.EffectiveDate)?.slice(0, 10)
            temp.push(item)
        })
        if (!getConfigurationKey().IsMinimumOrderQuantityVisible) {
            tempData = hideColumnFromExcel(data, 'Quantity')
        } else {
            tempData = data
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
                                            (render ? <LoaderCustom customClass="loader-center" /> : (<AgGridReact
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
                                            >
                                                {/* <AgGridColumn field="Technologies" editable='false' headerName="Technology" width={190}></AgGridColumn> */}
                                                <AgGridColumn field="BoughtOutPartNumber" tooltipField='BoughtOutPartNumber' editable='false' headerName="BOP Part No" minWidth={columnWidths.BoughtOutPartNumber}></AgGridColumn>
                                                <AgGridColumn field="BoughtOutPartName" tooltipField='BoughtOutPartName' editable='false' headerName="BOP Part Name" minWidth={columnWidths.BoughtOutPartName}></AgGridColumn>
                                                {!isImpactedMaster && <AgGridColumn field="BoughtOutPartCategory" tooltipField='BoughtOutPartCategory' editable='false' headerName="BOP Category" width={columnWidths.BoughtOutPartCategory}></AgGridColumn>}
                                                {!isImpactedMaster && list[0].CostingTypeId !== CBCTypeId && <AgGridColumn field="Vendor" tooltipField='Vendor' editable='false' headerName={vendorLabel + " (Code)"} width={columnWidths.VendorCode} cellRenderer='vendorFormatter'></AgGridColumn>}
                                                {!isImpactedMaster && list[0].CostingTypeId === CBCTypeId && <AgGridColumn field="CustomerName" tooltipField='CustomerName' editable='false' headerName="Customer (Code)" width={columnWidths.CustomerName} cellRenderer='customerFormatter'></AgGridColumn>}
                                                {!isImpactedMaster && <AgGridColumn field="Plants" editable='false' headerName="Plant (Code)" tooltipField='Plant (Code)' width={columnWidths.plantCode} cellRenderer='plantFormatter'></AgGridColumn>}
                                                {getConfigurationKey().IsMinimumOrderQuantityVisible && <AgGridColumn field="Quantity" tooltipField='Quantity' editable='false' headerName="Min Order Quantity" minWidth={columnWidths.Quantity} cellRenderer='quantityFormatter'></AgGridColumn>}
                                                {<AgGridColumn field="Currency" tooltipField='Currency' editable='false' headerName="Currency" minWidth={140} ></AgGridColumn>}

                                                <AgGridColumn headerClass="justify-content-center" cellClass="text-center" headerName={
                                                    (Number(selectedMasterForSimulation?.value) === Number(EXCHNAGERATE) ||
                                                        Number(selectedMasterForSimulation?.value) === Number(EXCHNAGERATE) ||
                                                        String(props?.masterId) === String(BOPIMPORT)
                                                    )
                                                        ? "Basic Rate (Currency)"
                                                        : `Basic Rate (${reactLocalStorage.getObject("baseCurrency")})`
                                                } marryChildren={true} width={240}>
                                                    <AgGridColumn width={120} field="BasicRate" editable='false' cellRenderer='oldBasicRateFormatter' headerName="Existing" colId="BasicRate" suppressSizeToFit={true}></AgGridColumn>
                                                    <AgGridColumn width={120} cellRenderer='newBasicRateFormatter' editable={EditableCallbackForNewBasicRate} onCellValueChanged='cellChange' field="NewBasicRate" headerName="Revised" colId='NewBasicRate' headerComponent={'revisedBasicRateHeader'} suppressSizeToFit={true}></AgGridColumn>
                                                </AgGridColumn>

                                                <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName={
                                                    (Number(selectedMasterForSimulation?.value) === Number(EXCHNAGERATE) ||
                                                        Number(selectedMasterForSimulation?.value) === Number(EXCHNAGERATE) ||
                                                        String(props?.masterId) === String(BOPIMPORT)
                                                    )
                                                        ? "Net Cost (Currency)"
                                                        : `Net Cost (${reactLocalStorage.getObject("baseCurrency")})`
                                                } marryChildren={true}>
                                                    {/* {!isImpactedMaster &&<AgGridColumn width={120} field="OldNetLandedCost" editable='false' cellRenderer={'OldcostFormatter'} headerName="Old" colId='NetLandedCost'></AgGridColumn>} */}
                                                    <AgGridColumn width={120} field="OldNetLandedCost" editable='false' cellRenderer={'OldcostFormatter'} headerName="Existing" colId='NetLandedCost' suppressSizeToFit={true}></AgGridColumn>
                                                    <AgGridColumn width={120} field="NewNetLandedCost" editable='false' valueGetter='data.NewBasicRate' cellRenderer={'NewcostFormatter'} headerName="Revised" colId='NewNetLandedCost' suppressSizeToFit={true}></AgGridColumn>
                                                </AgGridColumn>
                                                {/* THIS COLUMN WILL BE VISIBLE IF WE ARE LOOKING IMPACTED MASTER DATA FOR BOPIMPORT */}
                                                {
                                                    String(props?.masterId) === String(BOPIMPORT) && <AgGridColumn headerClass="justify-content-center" cellClass="text-center" headerName={`Net Cost (${reactLocalStorage.getObject("baseCurrency")})`} marryChildren={true} >
                                                        <AgGridColumn width={120} field="OldBoughtOutPartNetLandedCostConversion" tooltipField='OldBoughtOutPartNetLandedCostConversion' editable='false' headerName="Existing" colId='OldBoughtOutPartNetLandedCostConversion'></AgGridColumn>
                                                        <AgGridColumn width={120} field="NewBoughtOutPartNetLandedCostConversion" editable='false' headerName="Revised" colId='NewBoughtOutPartNetLandedCostConversion'></AgGridColumn>
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
            </div >
        </div >
    );
}


export default BDSimulation;