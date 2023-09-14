import React, { useEffect, useState, useRef } from 'react';
import { Row, Col, Tooltip, } from 'reactstrap';
import DayTime from '../../../common/DayTimeWrapper'
import { CBCTypeId, defaultPageSize, EMPTY_DATA } from '../../../../config/constants';
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
import Simulation from '../Simulation';
import { debounce } from 'lodash'
import { VBC, ZBC } from '../../../../config/constants';
import { PaginationWrapper } from '../../../common/commonPagination';
import WarningMessage from '../../../common/WarningMessage';
import { getMaxDate } from '../../SimulationUtils';
import PopupMsgWrapper from '../../../common/PopupMsgWrapper';
import { FORGING, RM_IMPACT_DOWNLOAD_EXCEl } from '../../../../config/masterData';
import ReactExport from 'react-export-excel';

const gridOptions = {

};

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

function RMSimulation(props) {
    const { list, isbulkUpload, rowCount, technology, master, isImpactedMaster, costingAndPartNo, tokenForMultiSimulation, technologyId } = props
    const [showRunSimulationDrawer, setShowRunSimulationDrawer] = useState(false)
    const [showverifyPage, setShowVerifyPage] = useState(false)
    const [token, setToken] = useState('')
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [showMainSimulation, setShowMainSimulation] = useState(false)
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
    const { register, control, setValue, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })


    const dispatch = useDispatch()

    const { selectedMasterForSimulation } = useSelector(state => state.simulation)

    const { filteredRMData } = useSelector(state => state.material)
    useEffect(() => {
        if (isbulkUpload) {
            setValue('NoOfCorrectRow', rowCount.correctRow)
            setValue('NoOfRowsWithoutChange', rowCount.NoOfRowsWithoutChange)
            setTitleObj(prevState => ({ ...prevState, rowWithChanges: rowCount.correctRow, rowWithoutChanges: rowCount.NoOfRowsWithoutChange }))
        }
    }, [])
    useEffect(() => {
        if (list && list.length > 0) {
            window.screen.width >= 1921 && gridRef.current.api.sizeColumnsToFit();

            let maxDate = getMaxDate(list)
            setMaxDate(maxDate)

        }

    }, [list])

    const setValueFunction = () => {
        /**********POST METHOD TO CALL HERE AND AND SEND TOKEN TO VERIFY PAGE TODO ****************/
        let obj = {}
        obj.Technology = technology
        obj.SimulationTechnologyId = selectedMasterForSimulation.value
        obj.SimulationHeadId = list[0].CostingTypeId
        obj.Masters = master
        obj.LoggedInUserId = loggedInUserId()

        obj.TechnologyId = technologyId

        if (filteredRMData.plantId && filteredRMData.plantId.value) {
            obj.PlantId = filteredRMData.plantId ? filteredRMData.plantId.value : ''
        }
        let tempArr = []
        list && list.map(item => {
            if ((item.NewBasicRate !== undefined || item.NewScrapRate !== undefined) && ((item.NewBasicRate !== undefined ? Number(item.NewBasicRate) : Number(item.BasicRate)) !== Number(item.BasicRate) || (item.NewScrapRate !== undefined ? Number(item.NewScrapRate) : Number(item.ScrapRate)) !== Number(item.ScrapRate))) {
                let tempObj = {}
                tempObj.CostingHead = item.CostingHead === 'Vendor Based' ? VBC : ZBC
                tempObj.RawMaterialName = item.RawMaterialName
                tempObj.MaterialType = item.MaterialType
                tempObj.RawMaterialGrade = item.RawMaterialGradeName
                tempObj.RawMaterialSpecification = item.RawMaterialSpecificationName
                tempObj.RawMaterialCategory = item.Category
                tempObj.UOM = item.UnitOfMeasurementName
                tempObj.OldBasicRate = isbulkUpload ? item.BasicRate : item.BasicRatePerUOM
                tempObj.NewBasicRate = item.NewBasicRate ? item.NewBasicRate : item.BasicRate
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
                tempArr.push(tempObj)
            }
            return null;
        })


        obj.SimulationIds = tokenForMultiSimulation
        obj.SimulationRawMaterials = tempArr

        obj.EffectiveDate = DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss')
        dispatch(runVerifySimulation(obj, res => {
            setIsDisable(false)

            if (res?.data?.Result) {
                setToken(res.data.Identity)
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
        list && list.map((li) => {

            if (Number(li.BasicRate) === Number(li.NewBasicRate) || li?.NewBasicRate === undefined) {
                basicRateCount = basicRateCount + 1
            }

            if ((li.NewBasicRate && Number(li.BasicRate) !== Number(li.NewBasicRate)) && (Number(li.ScrapRate) === Number(li.NewScrapRate) || li?.NewScrapRate === undefined)) {
                scrapRateChangeArr.push(li)

            }
            if ((li?.NewBasicRate === undefined || li?.NewBasicRate === '' ? Number(li?.BasicRate) : Number(li?.NewBasicRate)) < (li?.NewScrapRate === undefined || li?.NewScrapRate === '' ? Number(li?.ScrapRate) : Number(li?.NewScrapRate))) {
                isScrapRateGreaterThanBasiRate = true
            }
            if (isScrapRateGreaterThanBasiRate && !(basicRateCount === list.length)) {
                li.NewBasicRate = li?.BasicRate
                li.NewScrapRate = li?.ScrapRate
                Toaster.warning('Scrap Rate should be less than Basic Rate')
                return false
            }
            return null;
        })
        if (basicRateCount === list.length) {
            Toaster.warning('There is no changes in net cost. Please change the basic rate, then run simulation')
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
        setValueFunction();
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
        const value = beforeSaveCell(cell, props)
        return (
            <>
                {
                    isImpactedMaster ?
                        checkForDecimalAndNull(row.NewBasicRate, getConfigurationKey().NoOfDecimalForPrice) :
                        <span className={`${!isbulkUpload ? 'form-control' : ''}`} title={cell && value ? Number(cell) : Number(row.BasicRatePerUOM)}>{cell && value ? Number(cell) : Number(row.BasicRatePerUOM)} </span>
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
        const value = beforeSaveCell(cell, props)
        return (
            <>
                {
                    isImpactedMaster ?
                        checkForDecimalAndNull(row.NewScrapRate, getConfigurationKey().NoOfDecimalForPrice) :
                        <span className={`${!isbulkUpload ? 'form-control' : ''}`} title={cell && value ? Number(cell) : Number(row.ScrapRate)} >{cell && value ? Number(cell) : Number(row.ScrapRate)}</span>
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

    // const colorCheck = 

    const costFormatter = (props) => {

        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice) : ''
    }

    /**
  * @method beforeSaveCell
  * @description CHECK FOR ENTER NUMBER IN CELL
  */
    const beforeSaveCell = (cell, props) => {
        const cellValue = cell
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        if ((row?.NewBasicRate === undefined || row?.NewBasicRate === '' ? Number(row?.BasicRatePerUOM) : Number(row?.NewBasicRate)) <
            (row?.NewScrapRate === undefined || row?.NewScrapRate === '' ? Number(row?.ScrapRate) : Number(row?.NewScrapRate))) {
            row.NewBasicRate = row?.BasicRatePerUOM
            row.NewScrapRate = row?.ScrapRate
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
            return false
        }

        return true
    }

    const NewcostFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        if (!row.NewBasicRate || Number(row.BasicRate) === Number(row.NewBasicRate) || row.NewBasicRate === '') return ''
        const NewBasicRate = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost)
        const classGreen = (NewBasicRate > row.NetLandedCost) ? 'red-value form-control' : (NewBasicRate < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
        return row.NewBasicRate != null ? <span className={classGreen} title={checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)}>{checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
        // checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)
    }
    const revisedBasicRateHeader = (props) => {
        return (
            <div className='ag-header-cell-label'>
                <span className='ag-header-cell-text'>Revised {!isImpactedMaster && <i className={`fa fa-info-circle tooltip_custom_right tooltip-icon mb-n3 ml-4 mt2 `} id={"basicRate-tooltip"}></i>} </span>
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
        setShowMainSimulation(true)
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


    const frameworkComponents = {
        effectiveDateFormatter: effectiveDateFormatter,
        costingHeadFormatter: costingHeadFormatter,
        CostFormatter: CostFormatter,
        newScrapRateFormatter: newScrapRateFormatter,
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
        nullHandler: props.nullHandler && props.nullHandler

    };

    const closePopUp = () => {
        setShowPopup(false)
    }
    const onPopupConfirm = () => {
        setValueFunction()
        setShowPopup(false)
    }
    const basicRatetooltipToggle = () => {
        setBasicRateViewTooltip(!basicRateviewTooltip)
    }
    const scrapRatetooltipToggle = () => {
        setScrapRateViewTooltip(!scrapRateviewTooltip)
    }

    const onBtExport = () => {
        return returnExcelColumn(RM_IMPACT_DOWNLOAD_EXCEl, list)
    };

    const returnExcelColumn = (data = [], TempData) => {
        let temp = []
        TempData && TempData.map((item) => {
            item.EffectiveDate = (item.EffectiveDate)?.slice(0, 10)
            temp.push(item)
        })

        return (
            <ExcelSheet data={temp} name={'RM Data'}>
                {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
    }

    return (

        <div>
            <div className={`ag-grid-react ${props.customClass}`}>
                {
                    (!showverifyPage && !showMainSimulation) &&
                    <Fragment>
                        {showTooltip && !isImpactedMaster && <Tooltip className="rfq-tooltip-left" placement={"top"} isOpen={basicRateviewTooltip} toggle={basicRatetooltipToggle} target={"basicRate-tooltip"} >{"To edit revised basic rate please double click on the field."}</Tooltip>}
                        {showTooltip && !isImpactedMaster && <Tooltip className="rfq-tooltip-left" placement={"top"} isOpen={scrapRateviewTooltip} toggle={scrapRatetooltipToggle} target={"scrapRate-tooltip"} >{"To edit revised scrap rate please double click on the field."}</Tooltip>}
                        <Row>
                            <Col className="add-min-height mb-3 sm-edit-page">
                                <div className={`ag-grid-wrapper height-width-wrapper reset-btn-container ${(list && list?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                                    <div className="ag-grid-header d-flex justify-content-between">
                                        <div className='d-flex align-items-center'>
                                            <input type="text" className="form-control mr-1 table-search" id="filter-text-box" value={textFilterSearch} placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                            <button type="button" className="user-btn float-right mr-3" title="Reset Grid" onClick={() => resetState()}>
                                                <div className="refresh mr-0"></div>
                                            </button>
                                            <ExcelFile filename={`${props.lastRevision ? 'Last Revision Data' : 'Impacted Master Data'}`} fileExtension={'.xls'} element={
                                                <button title="Download" type="button" className={'user-btn'} ><div className="download mr-0"></div></button>}>
                                                {onBtExport()}
                                            </ExcelFile>
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
                                                {!isImpactedMaster && <div className={`d-flex align-items-center simulation-label-container`}>
                                                    <div className='d-flex'>
                                                        <label>Technology: </label>
                                                        <p className='technology ml-1' title={list[0].TechnologyName}>{list[0].TechnologyName}</p>
                                                    </div>
                                                    {list[0].CostingTypeId !== CBCTypeId && <div className='d-flex pl-3'>
                                                        <label className='mr-1'>Vendor (Code):</label>
                                                        <p title={list[0].VendorName}>{list[0].VendorName ? list[0].VendorName : list[0]['Vendor (Code)']}</p>

                                                    </div>}
                                                    <button type="button" className={"apply ml-2"} onClick={cancel} disabled={isDisable}> <div className={'back-icon'}></div>Back</button>
                                                </div>}
                                            </div>


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
                                                <AgGridColumn width={140} field="CostingHead" tooltipField='CostingHead' headerName="Costing Head" editable='false' cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                                            }
                                            <AgGridColumn width={140} field="RawMaterialName" tooltipField='RawMaterialName' editable='false' headerName="Raw Material"></AgGridColumn>
                                            <AgGridColumn width={115} field="RawMaterialGradeName" tooltipField='RawMaterialGradeName' editable='false' headerName="Grade" ></AgGridColumn>
                                            <AgGridColumn width={115} field="RawMaterialSpecificationName" tooltipField='RawMaterialSpecificationName' editable='false' headerName="Spec"></AgGridColumn>
                                            <AgGridColumn width={135} field="RawMaterialCode" tooltipField='RawMaterialCode' editable='false' headerName='Code' cellRenderer='hyphenFormatter'></AgGridColumn>
                                            {!isImpactedMaster && <AgGridColumn width={110} field="Category" tooltipField='Category' editable='false' headerName="Category"></AgGridColumn>}
                                            {!isImpactedMaster && <AgGridColumn width={125} field="TechnologyName" tooltipField='TechnologyName' editable='false' headerName="Technology" ></AgGridColumn>}
                                            {!isImpactedMaster && list[0].CostingTypeId !== CBCTypeId && <AgGridColumn width={160} field="Vendor (Code)" tooltipField='Vendor (Code)' editable='false' headerName="Vendor (Code)" cellRenderer='vendorFormatter'></AgGridColumn>}
                                            {!isImpactedMaster && list[0].CostingTypeId === CBCTypeId && <AgGridColumn width={160} field="CustomerName" tooltipField='CustomerName' editable='false' headerName="Customer (Code)" cellRenderer='customerFormatter'></AgGridColumn>}
                                            {!isImpactedMaster && <AgGridColumn width={160} field="Plant (Code)" editable='false' headerName="Plant (Code)" tooltipField='Plant (Code)' cellRenderer='plantFormatter' ></AgGridColumn>}
                                            <AgGridColumn width={100} field="UnitOfMeasurementName" tooltipField='UnitOfMeasurementName' editable='false' headerName="UOM"></AgGridColumn>
                                            {costingAndPartNo && <AgGridColumn field="CostingNumber" tooltipField='CostingNumber' editable='false' headerName="Costing No" minWidth={190}></AgGridColumn>}
                                            {costingAndPartNo && <AgGridColumn field="PartNumber" tooltipField='PartNumber' editable='false' headerName="Part No" minWidth={190}></AgGridColumn>}


                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName={Number(selectedMasterForSimulation?.value) === 2 ? "Basic Rate (Currency)" : "Basic Rate (INR)"} marryChildren={true} >
                                                <AgGridColumn width={120} cellRenderer='oldBasicRateFormatter' field={isImpactedMaster ? "OldBasicRate" : "BasicRatePerUOM"} editable='false' headerName="Existing" colId={isImpactedMaster ? "OldBasicRate" : "BasicRatePerUOM"}></AgGridColumn>
                                                <AgGridColumn width={120} cellRenderer='newBasicRateFormatter' onCellValueChanged='cellChange' field="NewBasicRate" headerName="Revised" colId='NewBasicRate' editable={!isImpactedMaster} headerComponent={'revisedBasicRateHeader'}></AgGridColumn>
                                            </AgGridColumn>
                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} marryChildren={true} headerName={Number(selectedMasterForSimulation?.value) === 2 ? "Scrap Rate (Currency)" : "Scrap Rate (INR)"}>
                                                <AgGridColumn width={120} field={isImpactedMaster ? "OldScrapRate" : "BasicRatePerUOM"} editable='false' cellRenderer='oldScrapRateFormatter' headerName="Existing" colId={isImpactedMaster ? "OldScrapRate" : "BasicRatePerUOM"} ></AgGridColumn>
                                                <AgGridColumn width={120} cellRenderer={'newScrapRateFormatter'} field="NewScrapRate" headerName="Revised" colId="NewScrapRate" editable={!isImpactedMaster} headerComponent={'revisedScrapRateHeader'} ></AgGridColumn>
                                            </AgGridColumn>
                                            <AgGridColumn width={150} field="RMFreightCost" tooltipField='RMFreightCost' editable='false' cellRenderer={'CostFormatter'} headerName="Freight Cost"></AgGridColumn>
                                            <AgGridColumn width={170} field="RMShearingCost" tooltipField='RMShearingCost' editable='false' cellRenderer={'CostFormatter'} headerName="Shearing Cost" ></AgGridColumn>
                                            {technologyId === String(FORGING) && <AgGridColumn width={170} field="MachiningScrapRate" tooltipField='MachiningScrapRate' editable='false' headerName="Machining Scrap Cost" cellRenderer={'CostFormatter'}></AgGridColumn>}
                                            {!isImpactedMaster && <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName={Number(selectedMasterForSimulation?.value) === 2 ? "Net Cost (Currency)" : "Net Cost (INR)"}>
                                                <AgGridColumn width={120} field="NetLandedCost" tooltipField='NetLandedCost' editable='false' cellRenderer={'costFormatter'} headerName="Existing" colId='NetLandedCost'></AgGridColumn>
                                                <AgGridColumn width={120} field="NewNetLandedCost" editable='false' valueGetter='data.NewBasicRate + data.RMFreightCost+data.RMShearingCost' cellRenderer={'NewcostFormatter'} headerName="Revised" colId='NewNetLandedCost'></AgGridColumn>
                                            </AgGridColumn>
                                            }
                                            {props.children}
                                            <AgGridColumn width={140} field="EffectiveDate" editable='false' cellRenderer={'effectiveDateFormatter'} headerName={props.isImpactedMaster && !props.lastRevision ? "Current Effective date" : "Effective Date"} ></AgGridColumn>
                                            <AgGridColumn field="RawMaterialId" hide></AgGridColumn>

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
                                    <div className="inputbox date-section mr-3 verfiy-page">
                                        <DatePicker
                                            name="EffectiveDate"
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
                                    <button onClick={verifySimulation} type="submit" className="user-btn mr5 save-btn" disabled={isDisable}>
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
                    showMainSimulation && <Simulation isMasterSummaryDrawer={false} isCancelClicked={true} isRMPage={true} />
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