import React, { useEffect, useState, useContext } from 'react';
import { Row, Col, Tooltip, } from 'reactstrap';
import moment from 'moment';
import { defaultPageSize, EMPTY_DATA, CBCTypeId, EXCHNAGERATE } from '../../../../config/constants';
import NoContentFound from '../../../common/NoContentFound';
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId, searchNocontentFilter } from '../../../../helper';
// import { runVerifyCombinedProcessSimulation } from '../../actions/Simulation';
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
import { runVerifyMachineRateSimulation } from '../../actions/Simulation';
import VerifySimulation from '../VerifySimulation';
import Toaster from '../../../common/Toaster';
import { PaginationWrapper } from '../../../common/commonPagination';
import DayTime from '../../../common/DayTimeWrapper';
import WarningMessage from '../../../common/WarningMessage';
import DatePicker from "react-datepicker";
import { useRef } from 'react';
import { getMaxDate } from '../../SimulationUtils';
import ReactExport from 'react-export-excel';
import { APPLICABILITY_MACHINE_RATES_SIMULATION, MACHINE_IMPACT_DOWNLOAD_EXCEl } from '../../../../config/masterData';
import { simulationContext } from '..';
import { useLabels } from '../../../../helper/core';
import { createMultipleExchangeRate } from '../../../masters/actions/ExchangeRateMaster';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {

};
function MRSimulation(props) {
    const { showEditMaster, handleEditMasterPage, showCompressedColumns, render } = useContext(simulationContext) || {};
    const { list, isbulkUpload, rowCount, isImpactedMaster, tokenForMultiSimulation, costingAndPartNo } = props
    const [showRunSimulationDrawer, setShowRunSimulationDrawer] = useState(false)
    const [showverifyPage, setShowVerifyPage] = useState(false)
    const [token, setToken] = useState('')
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [effectiveDate, setEffectiveDate] = useState('');
    const [isEffectiveDateSelected, setIsEffectiveDateSelected] = useState(false);
    const [isWarningMessageShow, setIsWarningMessageShow] = useState(false);
    const [maxDate, setMaxDate] = useState('');
    const [isDisable, setIsDisable] = useState(false)
    const [noData, setNoData] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false)
    const [basicRateviewTooltip, setBasicRateViewTooltip] = useState(false)
    const [textFilterSearch, setTextFilterSearch] = useState('')
    const gridRef = useRef();
const {vendorLabel} = useLabels()
    const { technologyLabel } = useLabels();
    const { register, control, setValue, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    const dispatch = useDispatch()

    const { selectedMasterForSimulation,selectedTechnologyForSimulation,exchangeRateListBeforeDraft } = useSelector(state => state.simulation)
    const currencySelectList = useSelector(state => state.comman.currencySelectList)
    const masterList = useSelector(state => state.simulation.masterSelectListSimulation)
    const simulationApplicability = useSelector(state => state.simulation.simulationApplicability)
    const columnWidths = {
        Technology: showCompressedColumns ? 50 : 190,
        CostingNumber: showCompressedColumns ? 100 : 190,
        PartNo: showCompressedColumns ? 100 : 190,
        MachineName: showCompressedColumns ? 100 : 190,
        MachineNumber: showCompressedColumns ? 100 : 190,
        VendorName: showCompressedColumns ? 100 : 190,
        CustomerName: showCompressedColumns ? 100 : 190,
        ProcessName: showCompressedColumns ? 100 : 190,
        ProcessNumber: showCompressedColumns ? 100 : 190,
        Plant: showCompressedColumns ? 100 : 190,
        EffectiveDate: showCompressedColumns ? 90 : 190,
        LocalCurrency: showCompressedColumns ? 100 : 190,
        NetLandedCost: showCompressedColumns ? 100 : 190,
        NewNetLandedCost: showCompressedColumns ? 100 : 190,
    };
    const cancelVerifyPage = () => {
        setShowVerifyPage(false)
    }

    const effectiveDateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? <span title={moment(cell).format('DD/MM/YYYY')}>{moment(cell).format('DD/MM/YYYY')}</span> : '';
    }

    useEffect(() => {
        if (isbulkUpload) {
            setValue('NoOfCorrectRow', rowCount.correctRow)
            setValue('NoOfRowsWithoutChange', rowCount.NoOfRowsWithoutChange)
        }
    }, [])
    useEffect(() => {

        if (handleEditMasterPage) {
            handleEditMasterPage(showEditMaster, showverifyPage)
        }
    }, [showverifyPage])
    useEffect(() => {
        if (list && list.length > 0) {
            window.screen.width >= 1920 && gridRef.current.api.sizeColumnsToFit();
            if (isImpactedMaster) {
                gridRef.current.api.sizeColumnsToFit();
            }
            let maxDate = getMaxDate(list)
            setMaxDate(maxDate?.EffectiveDate)
        }
    }, [list])

    const oldRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        Number(row.OldMachineRate) : cell && value ? Number(cell) : Number(row.MachineRate)
                }

            </>
        )
    }

    const newRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.NewMachineRate :
                        <span id={`newRateMachineRate-${props.rowIndex}`} className={`${!isbulkUpload ? 'form-control' : ''} netCost_revised`} title={cell && value ? Number(cell) : Number(row.MachineRate)}>{cell && value ? Number(cell) : Number(row.MachineRate)} </span>
                }

            </>
        )
    }
    const statusFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return <div className={cell}>{row.DisplayStatus}</div>
    }

    const costFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        if (!row.NewBasicRate || row.BasicRate === row.NewBasicRate || row.NewBasicRate === '') return checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)
        const tempA = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost);
        const classGreen = (tempA > row.NetLandedCost) ? 'red-value form-control' : (tempA < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }
    const revisedBasicRateHeader = (props) => {
        return (
            <div className='ag-header-cell-label'>
                <span className='ag-header-cell-text basicRate_revised'>Revised{!isImpactedMaster && <i className={`fa fa-info-circle tooltip_custom_right tooltip-icon mb-n3 ml-4 mt2 `} id={"basicRate-tooltip"}></i>} </span>
            </div>
        );
    };
    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            if (list.length !== 0) {
                setNoData(searchNocontentFilter(value, noData))
            }
        }, 500);
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


    const cancel = () => {
        list && list.map((item) => {
            item.NewMachineRate = undefined
            return null
        })
        props.backToSimulation()
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
        params.api.paginationGoToPage(0);
        window.screen.width >= 1600 && params.api.sizeColumnsToFit();
        var allColumnIds = [];
        params.columnApi.getAllColumns().forEach(function (column) {
            allColumnIds.push(column.colId);
        });
        for (let i = 0; i < list?.length; i++) {
            gridOptions?.api?.startEditingCell({
                rowIndex: i,
                colKey: 'NewMachineRate'
            })
            setTimeout(() => {
                gridOptions?.api?.stopEditing()
            }, 200);
        }
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

    const resetState = () => {
        setTextFilterSearch('')
        gridApi?.setQuickFilter('');
        gridOptions?.columnApi?.resetColumnState();
        gridOptions?.api?.setFilterModel(null);
        window.screen.width >= 1600 && gridRef.current.api.sizeColumnsToFit();
    }

    const NewcostFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        if (!row.NewMachineRate || Number(row.ConversionCost) === Number(row.NewMachineRate) || row.NewMachineRate === '') return ''
        const NewMachineRate = Number(row.NewMachineRate) + checkForNull(row.RemainingTotal)
        const NetCost = Number(row.ConversionCost) + checkForNull(row.RemainingTotal)
        const classGreen = (NewMachineRate > NetCost) ? 'red-value form-control' : (NewMachineRate < NetCost) ? 'green-value form-control' : 'form-class'
        return row.NewMachineRate != null ? <span className={classGreen}>{checkForDecimalAndNull(NewMachineRate, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const OldcostFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const ConversionCost = Number(row.ConversionCost) + checkForNull(row.RemainingTotal)
        return row.ConversionCost != null ? checkForDecimalAndNull(ConversionCost, getConfigurationKey().NoOfDecimalForPrice) : ''
    }

    const customerFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (isbulkUpload ? row['Customer (Code)'] : row.CustomerName);
    }

    // TRIGGER ON EVERY CHNAGE IN CELL
    const onCellValueChanged = (props) => {
        if (typeof (checkForNull(props?.value)) === 'number') {
            let data = [...list]
            let filteredDataWithoutEditedRow = data && data.filter(e => e?.MachineId === props?.data?.MachineId)
            filteredDataWithoutEditedRow && filteredDataWithoutEditedRow.map((item, index) => {
                item.NewMachineRate = props?.value
                return null
            })
        } else {
            return false
        }
        gridApi.redrawRows()
    }

    const vendorFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                {isbulkUpload ? row['Vendor (Code)'] : cell}

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

    const handleEffectiveDateChange = (date) => {
        setEffectiveDate(date)
        setIsEffectiveDateSelected(true)
        setIsWarningMessageShow(false)
    }

    const frameworkComponents = {
        effectiveDateRenderer: effectiveDateFormatter,
        costFormatter: costFormatter,
        customNoRowsOverlay: NoContentFound,
        newRateFormatter: newRateFormatter,
        oldRateFormatter: oldRateFormatter,
        statusFormatter: statusFormatter,
        NewcostFormatter: NewcostFormatter,
        OldcostFormatter: OldcostFormatter,
        onCellValueChanged: onCellValueChanged,
        vendorFormatter: vendorFormatter,
        plantFormatter: plantFormatter,
        customerFormatter: customerFormatter,
        revisedBasicRateHeader: revisedBasicRateHeader,
        nullHandler: props.nullHandler && props.nullHandler
    };
    const verifySimulation = debounce(() => {
        if (selectedMasterForSimulation?.value === EXCHNAGERATE) {
            dispatch(createMultipleExchangeRate(exchangeRateListBeforeDraft, currencySelectList, effectiveDate, res => {
                if (!res?.status && !res?.error) {
                    setValueFunction(true, res);
                }            }))
        }else{
            setValueFunction(false, []);
        }
       
    }, 500);
    const setValueFunction=(isExchangeRate,res)=>{
        const filteredMasterId = masterList?.find(item => item?.Text === 'Machine Rate')?.Value;
        if (!isEffectiveDateSelected) {
            setIsWarningMessageShow(true)
            return false
        }

        let ccCount = 0
        let tempData = list
        let arr = []
        tempData && tempData.map((li, index) => {
            if (Number(li.MachineRate) === Number(li.NewMachineRate) || li?.NewMachineRate === undefined) {
                ccCount = ccCount + 1
            } else {

                li.NewTotal = Number(li.NewMachineRate ? li.NewMachineRate : li.MachineRate) + checkForNull(li.RemainingTotal)

                arr.push(li)
            }
            return null;
        })
        if (ccCount === tempData.length) {
            Toaster.warning('Please change the machine rate, then run simulation')
            return false
        }
        setIsDisable(true)
        let obj = {}
        obj.SimulationTechnologyId = isExchangeRate ? EXCHNAGERATE : selectedMasterForSimulation.value
        obj.LoggedInUserId = loggedInUserId()
        obj.SimulationHeadId = list[0].CostingTypeId
        obj.TechnologyId = selectedTechnologyForSimulation.value
        obj.TechnologyName = selectedTechnologyForSimulation.label
        obj.EffectiveDate = DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss')
        obj.ExchangeRateSimulationTechnologyId = filteredMasterId

        let tempArr = []
        arr && arr.map(item => {
            let tempObj = {}
            tempObj.MachineId = item.MachineId
            tempObj.MachineProcessRateId = item.MachineProcessRateId
            tempObj.OldMachineRate = item.MachineRate
            tempObj.NewMachineRate = item.NewMachineRate
            tempArr.push(tempObj)
            return null
        })

        obj.SimulationIds = tokenForMultiSimulation

        obj.SimulationMachineProcessList = tempArr
        if (isExchangeRate) {
            obj.SimulationExchangeRates = res
            obj.IsExchangeRateSimulation = true
        }
        dispatch(runVerifyMachineRateSimulation(obj, res => {
            setIsDisable(false)
            if (res?.data?.Result) {
                setToken(res.data.Identity)
                setShowVerifyPage(true)
            }
        }))
        setShowTooltip(false)

    }

    const basicRatetooltipToggle = () => {
        setBasicRateViewTooltip(!basicRateviewTooltip)
    }

    const onBtExport = () => {
        return returnExcelColumn(MACHINE_IMPACT_DOWNLOAD_EXCEl, list)
    };

    const returnExcelColumn = (data = [], TempData) => {

        let temp = []
        TempData && TempData.map((item) => {
            item.EffectiveDate = (item.EffectiveDate)?.slice(0, 10)
            temp.push(item)
        })

        return (
            <ExcelSheet data={temp} name={'Machine Data'}>
                {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
    }

    return (
        <div>
            <div className={`ag-grid-react`}>
                {!showverifyPage &&
                    <Fragment>
                        {!isImpactedMaster && showTooltip && <Tooltip className="rfq-tooltip-left" placement={"top"} isOpen={basicRateviewTooltip} toggle={basicRatetooltipToggle} target={"basicRate-tooltip"} >{"To edit revised net machine rate please double click on the field."}</Tooltip>}
                        <div>

                            <Row>
                                <Col className={`add-min-height mb-3 sm-edit-page  ${(list && list?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                                    <div className="ag-grid-wrapper height-width-wrapper">
                                        <div className="ag-grid-header d-flex align-items-center justify-content-between">
                                            <div className='d-flex align-items-center'>
                                                <input type="text" className="form-control table-search" id="filter-text-box" value={textFilterSearch} placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                                <button type="button" className="user-btn float-right mr-2 Tour_List_Reset Tour_List_Reset" title="Reset Grid" onClick={() => resetState()}>
                                                    <div className="refresh mr-0"></div>
                                                </button>
                                                <ExcelFile filename={`${props.lastRevision ? 'Last Revision Data' : 'Impacted Master Data'}`} fileExtension={'.xls'} element={
                                                    <button title="Download" type="button" className={'user-btn'} ><div className="download mr-0"></div></button>}>
                                                    {onBtExport()}
                                                </ExcelFile>
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
                                                        <p className='mr-2' title={list[0].VendorName}>{list[0].VendorName ? list[0].VendorName : list[0][`${vendorLabel} (Code)`]}</p>
                                                    </div>}
                                                    <button type="button" id="simulation-back" className={"apply back_simulationPage"} onClick={cancel}> <div className={'back-icon'}></div>Back</button>
                                                </div>}
                                            </div>
                                        </div>


                                        <div className="ag-theme-material p-relative" style={{ width: '100%' }}>
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
                                                onFilterModified={onFloatingFilterChanged}
                                                noRowsOverlayComponentParams={{
                                                    title: EMPTY_DATA,
                                                }}
                                                frameworkComponents={frameworkComponents}
                                                stopEditingWhenCellsLoseFocus={true}
                                                suppressColumnVirtualisation={true}
                                                rowSelection={'multiple'}
                                                onCellValueChanged={onCellValueChanged}
                                                enableBrowserTooltips={true}
                                            >
                                                {!isImpactedMaster && <AgGridColumn field="Technology" tooltipField='Technology' editable='false' headerName={technologyLabel} minWidth={columnWidths.Technology}></AgGridColumn>}
                                                {costingAndPartNo && <AgGridColumn field="CostingNumber" tooltipField='CostingNumber' editable='false' headerName="Costing No" minWidth={columnWidths.CostingNumber}></AgGridColumn>}
                                                {costingAndPartNo && <AgGridColumn field="PartNo" tooltipField='PartNo' editable='false' headerName="Part No" minWidth={columnWidths.PartNo}></AgGridColumn>}
                                                {/* props?.isImpactedMaster&& */<AgGridColumn field="EntryType" headerName="Entry Type" cellRenderer={"hyphenFormatter"}></AgGridColumn>}
                                                <AgGridColumn field="MachineName" tooltipField='MachineName' editable='false' headerName="Machine Name" minWidth={columnWidths.MachineName}></AgGridColumn>
                                                <AgGridColumn field="MachineNumber" tooltipField='MachineNumber' editable='false' headerName="Machine Number" minWidth={columnWidths.MachineNumber}></AgGridColumn>
                                                <AgGridColumn field="ProcessName" tooltipField='ProcessName' editable='false' headerName="Process Name" minWidth={columnWidths.ProcessName}></AgGridColumn>
                                                {!isImpactedMaster && list[0].CostingTypeId !== CBCTypeId && <AgGridColumn field="VendorName" tooltipField='VendorName' editable='false' headerName={vendorLabel + " (Code)"} minWidth={columnWidths.VendorName} cellRenderer='vendorFormatter'></AgGridColumn>}
                                                {!isImpactedMaster && list[0].CostingTypeId === CBCTypeId && <AgGridColumn minWidth={columnWidths.CustomerName} field="CustomerName" tooltipField='CustomerName' editable='false' headerName="Customer (Code)" cellRenderer='customerFormatter'></AgGridColumn>}
                                                {
                                                    !isImpactedMaster &&
                                                    <>
                                                        <AgGridColumn field="Plant" tooltipField='Plant' editable='false' headerName="Plant (Code)" minWidth={columnWidths.Plant} cellRenderer='plantFormatter'></AgGridColumn>

                                                    </>
                                                }
                                                 {getConfigurationKey().IsSourceExchangeRateNameVisible && <AgGridColumn minWidth={120}field="ExchangeRateSourceName" headerName="Exchange Rate Source"></AgGridColumn>}
                                                 <AgGridColumn field="Currency" minWidth={120}cellRenderer={"currencyFormatter"}></AgGridColumn>
                                                 {(isImpactedMaster || props?.lastRevision ) && <AgGridColumn field="LocalCurrency" minWidth={120}  headerName={"Plant Currency"}cellRenderer={"currencyFormatter"}></AgGridColumn>}

                                                <AgGridColumn headerClass="justify-content-center" cellClass="text-center" minWidth={240} headerName="Net Machine Rate" marryChildren={true} >
                                                    <AgGridColumn minWidth={120} field="MachineRate" tooltipField='MachineRate' editable='false' headerName="Existing" cellRenderer='oldRateFormatter' colId="MachineRate" suppressSizeToFit={true}></AgGridColumn>
                                                    <AgGridColumn minWidth={120} cellRenderer='newRateFormatter' editable={!isImpactedMaster} field="NewMachineRate" headerName="Revised" colId='NewMachineRate' headerComponent={'revisedBasicRateHeader'} suppressSizeToFit={true}></AgGridColumn>
                                                </AgGridColumn>
                                                {(isImpactedMaster || props?.lastRevision || String(props?.masterId) === String(EXCHNAGERATE)) && <AgGridColumn headerClass="justify-content-center" cellClass="text-center" minWidth={240} headerName={
                                                    "Net Machine Rate (Plant Currency)"                                                }>
                                                    <AgGridColumn minWidth={columnWidths.NetLandedCost} field="OldMachineRateLocalConversion" editable='false' cellRenderer={'costFormatter'} headerName="Existing" colId='OldMachineRateLocalConversion'></AgGridColumn>
                                                    <AgGridColumn minWidth={columnWidths.NewNetLandedCost} field="NewMachineRateLocalConversion" editable='false' cellRenderer={'costFormatter'} headerName="Revised" colId='NewMachineRateLocalConversion'></AgGridColumn>
                                                </AgGridColumn>
                                                }
                                                {props.children}
                                                <AgGridColumn field="EffectiveDate" headerName={props.isImpactedMaster && !props.lastRevision ? "Current Effective date" : "Effective Date"} editable='false' minWidth={columnWidths.EffectiveDate} cellRenderer='effectiveDateRenderer'></AgGridColumn>
                                                <AgGridColumn field="CostingId" hide={true}></AgGridColumn>


                                            </AgGridReact >}
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

                                        <button onClick={verifySimulation} type="submit" id="verify-btn" className="user-btn mr5 save-btn verifySimulation" disabled={false}>
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
                        </div>
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
                    // masterId={selectedMasterForSimulation.value}
                    />
                }
            </div>

        </div >
    );
}

export default MRSimulation;