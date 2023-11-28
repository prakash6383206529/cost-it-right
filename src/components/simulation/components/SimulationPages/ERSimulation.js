import React, { useEffect, useState } from 'react';
import { Row, Col, } from 'reactstrap';
import DayTime from '../../../common/DayTimeWrapper'
import { APPROVED_STATUS, defaultPageSize, EMPTY_DATA } from '../../../../config/constants';
import NoContentFound from '../../../common/NoContentFound';
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId, searchNocontentFilter } from '../../../../helper';
import Toaster from '../../../common/Toaster';
import { runVerifyExchangeRateSimulation, setExchangeRateListBeforeDraft } from '../../actions/Simulation';
import { Fragment } from 'react';
import RunSimulationDrawer from '../RunSimulationDrawer';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import Simulation from '../Simulation';
import VerifySimulation from '../VerifySimulation';
import _, { debounce } from 'lodash'
import { PaginationWrapper } from '../../../common/commonPagination';
import ReactExport from 'react-export-excel';
import { APPLICABILITY_PART_SIMULATION, APPLICABILITY_RM_SIMULATION, EXCHANGE_IMPACT_DOWNLOAD_EXCEl } from '../../../../config/masterData';
import { getCurrencySelectList } from '../../../../actions/Common';
import RMImportListing from '../../../masters/material-master/RMImportListing';
import { setFilterForRM } from '../../../masters/actions/Material';
import BOPImportListing from '../../../masters/bop-master/BOPImportListing';
import WarningMessage from '../../../common/WarningMessage';
import DatePicker from "react-datepicker";
import { createMultipleExchangeRate } from '../../../masters/actions/ExchangeRateMaster';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

const gridOptions = {

};
function ERSimulation(props) {
    const { list, isbulkUpload, isImpactedMaster, costingAndPartNo, tokenForMultiSimulation } = props
    const [showRunSimulationDrawer, setShowRunSimulationDrawer] = useState(false)
    const [showverifyPage, setShowVerifyPage] = useState(false)
    const [token, setToken] = useState('')
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [showMainSimulation, setShowMainSimulation] = useState(false)
    const [selectedRowData, setSelectedRowData] = useState([]);
    const [isDisable, setIsDisable] = useState(false)
    const [noData, setNoData] = useState(false);
    const [largestDate, setLargestDate] = useState(new Date());
    const [showRMMasterList, setShowRMMasterList] = useState(false);
    const [showBOPMasterList, setShowBOPMasterList] = useState(false);
    const [effectiveDate, setEffectiveDate] = useState('');
    const [isEffectiveDateSelected, setIsEffectiveDateSelected] = useState(false);
    const [isWarningMessageShow, setIsWarningMessageShow] = useState(false);

    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(getCurrencySelectList(() => { }))
        list && list?.map(item => {
            item.NewCurrencyExchangeRate = item.CurrencyExchangeRate
            return null
        })
    }, [])

    useEffect(() => {
        const entryWithLargestDate = _.maxBy(list, entry => new Date(entry.EffectiveDate));
        setLargestDate(entryWithLargestDate?.EffectiveDate)
    }, [list])

    const { selectedMasterForSimulation } = useSelector(state => state.simulation)
    const { simulationApplicability } = useSelector(state => state.simulation)
    const { selectedVendorForSimulation, selectedCustomerSimulation } = useSelector(state => state.simulation)
    const currencySelectList = useSelector(state => state.comman.currencySelectList)

    const cancelVerifyPage = () => {

        setShowVerifyPage(false)
    }

    const effectiveDateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        return cell != null ? DayTime(cell).format('DD/MM/YYYY') : '';
    }

    const newERFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        cell && value ? Number(cell) : Number(row.NewExchangeRate)
                        :
                        <span className={`${!isbulkUpload ? 'form-control' : ''}`} >{cell && value ? Number(cell) : Number(row.CurrencyExchangeRate)} </span>
                }
            </>
        )
    }

    const oldERFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        cell && value ? Number(cell) : Number(row.OldExchangeRate)
                        :

                        <span className={`${!isbulkUpload ? 'form-control' : ''}`} >{cell && value ? Number(cell) : Number(row.CurrencyExchangeRate)} </span>
                }
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


    const cancel = () => {
        list && list.map((item) => {
            item.NewCurrencyExchangeRate = undefined
            return null
        })
        setShowMainSimulation(true)
    }

    const cancelImportList = () => {
        setShowRMMasterList(false)
        setShowBOPMasterList(false)
    }

    const closeDrawer = (e = '') => {
        setShowRunSimulationDrawer(false)

    }
    const isFirstColumn = (params) => {
        if (isImpactedMaster) return false
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;

        return thisIsFirstColumn;
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        headerCheckboxSelection: isFirstColumn,
        checkboxSelection: isFirstColumn
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
        window.screen.width >= 1366 && params.api.sizeColumnsToFit()
        var allColumnIds = [];
        params.columnApi.getAllColumns().forEach(function (column) {
            allColumnIds.push(column.colId);
        });

        // window.screen.width <= 1366 ? params.columnApi.autoSizeColumns(allColumnIds) : params.api.sizeColumnsToFit()
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

    const revisedBasicRateHeader = (props) => {
        return (
            <div className='ag-header-cell-label'>
                <span className='ag-header-cell-text'>Revised{!isImpactedMaster && <i className={`fa fa-info-circle tooltip_custom_right tooltip-icon mb-n3 ml-4 mt2 `} id={"basicRate-tooltip"}></i>} </span>
            </div>
        );
    };

    const newRateFormatter = (props) => {
        const cell = props?.value;
        return cell ? cell : ''
    };

    const frameworkComponents = {
        effectiveDateRenderer: effectiveDateFormatter,
        costFormatter: costFormatter,
        customNoRowsOverlay: NoContentFound,
        newERFormatter: newERFormatter,
        oldERFormatter: oldERFormatter,
        nullHandler: props.nullHandler && props.nullHandler,
        revisedBasicRateHeader: revisedBasicRateHeader,
        newRateFormatter: newRateFormatter
    };

    const onRowSelect = () => {
        var selectedRows = gridApi.getSelectedRows();
        setSelectedRowData(selectedRows)
    }
    const resetState = () => {
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);
    }

    const verifySimulation = debounce(() => {
        /**********POST METHOD TO CALL HERE AND AND SEND TOKEN TO VERIFY PAGE ****************/
        if (!isEffectiveDateSelected) {
            setIsWarningMessageShow(true)
            return false
        }

        if (selectedRowData.length === 0) {
            Toaster.warning('Please select atleast one costing.')
            return false
        }

        setIsDisable(true)

        dispatch(createMultipleExchangeRate(list, currencySelectList, effectiveDate, res => {

            let obj = {}
            obj.SimulationTechnologyId = selectedMasterForSimulation.value
            obj.LoggedInUserId = loggedInUserId()
            obj.EffectiveDate = DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss')
            obj.SimulationIds = tokenForMultiSimulation
            obj.SimulationHeadId = list[0]?.CostingHeadId
            obj.SimulationExchangeRates = res
            obj.IsExchangeRateSimulation = true

            dispatch(runVerifyExchangeRateSimulation(obj, res => {
                setIsDisable(false)
                if (res?.data?.Result) {
                    setToken(res.data.Identity)
                    setShowVerifyPage(true)
                }
            }))
        }))
    }, 500)

    const selectRM = debounce(() => {
        // let basicRateCount = 0
        // list && list.map((li) => {
        //     if (Number(li.BasicRate) === Number(li.NewBasicRate) || (li?.NewBasicRate === undefined && li?.NewBasicrateFromPercentage === undefined)) {
        //         basicRateCount = basicRateCount + 1
        //     }

        //     if (li.NewBasicrateFromPercentage === undefined || li?.NewBasicrateFromPercentage < (li?.NewScrapRate === undefined || li?.NewScrapRate === '' ? Number(li?.ScrapRate) : Number(li?.NewScrapRate))) {
        //         if (!(basicRateCount === list.length)) {
        //             li.NewBasicRate = li?.BasicRate
        //             li.NewScrapRate = li?.ScrapRate
        //             Toaster.warning('Scrap Rate should be less than Basic Rate')
        //             return false
        //         }
        //     }
        //     return null;
        // })
        // if (basicRateCount === list.length) {
        //     Toaster.warning('There is no changes in net cost. Please change the basic rate, then run simulation')
        //     return false
        // }


        if (selectedRowData?.length === 0) {
            Toaster.warning("Please select atleast one Exchange Rate")
            return false
        }
        dispatch(setExchangeRateListBeforeDraft(selectedRowData))
        dispatch(setFilterForRM({ costingHeadTemp: '', plantId: '', RMid: '', RMGradeid: '', Vendor: selectedVendorForSimulation?.label, VendorId: selectedVendorForSimulation?.value, CustomerId: selectedCustomerSimulation?.value, Currency: _.map(list, 'Currency') }))
        if (simulationApplicability?.value === APPLICABILITY_RM_SIMULATION) {
            setShowRMMasterList(true)
        } else {
            setShowBOPMasterList(true)
        }
    }, 500)

    const onBtExport = () => {
        return returnExcelColumn(EXCHANGE_IMPACT_DOWNLOAD_EXCEl, list)
    };

    const returnExcelColumn = (data = [], TempData) => {

        let temp = []
        TempData && TempData.map((item) => {
            item.EffectiveDate = (item.EffectiveDate)?.slice(0, 10)
            temp.push(item)
            return null
        })

        return (
            <ExcelSheet data={temp} name={'Exchange Rate Data'}>
                {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
            </ExcelSheet>);
    }

    const handleEffectiveDateChange = (date) => {
        setEffectiveDate(date)
        setIsEffectiveDateSelected(true)
        setIsWarningMessageShow(false)
    }

    return (
        <div>
            {!showRMMasterList && !showBOPMasterList && <div className={`ag-grid-react`}>

                {

                    (!showverifyPage && !showMainSimulation) &&
                    <Fragment>

                        <Row>
                            <Col className="add-min-height mb-3 sm-edit-page">
                                <div className={`ag-grid-wrapper height-width-wrapper reset-btn-container ${(list && list?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                                    <div className="ag-grid-header d-flex align-items-center justify-content-between">
                                        <div className='d-flex align-items-center'>
                                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                            <button type="button" className="user-btn float-right mr-1" title="Reset Grid" onClick={() => resetState()}>
                                                <div className="refresh mr-0"></div></button>
                                            <ExcelFile filename={'Impacted Master Data'} fileExtension={'.xls'} element={
                                                <button title="Download" type="button" className={'user-btn'} ><div className="download mr-0"></div></button>}>
                                                {onBtExport()}
                                            </ExcelFile>
                                        </div>
                                        {!isImpactedMaster && <button type="button" className={"apply"} onClick={cancel} disabled={isDisable}> <div className={'back-icon'}></div>Back</button>}
                                    </div>

                                    <div className="ag-theme-material p-relative" style={{ width: '100%' }}>
                                        {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found simulation-lisitng" />}
                                        <AgGridReact
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
                                            noRowsOverlayComponent={'customNoRowsOverlay'}
                                            noRowsOverlayComponentParams={{
                                                title: EMPTY_DATA,
                                            }}
                                            frameworkComponents={frameworkComponents}
                                            stopEditingWhenCellsLoseFocus={true}
                                            rowSelection={'multiple'}
                                            // frameworkComponents={frameworkComponents}
                                            onSelectionChanged={onRowSelect}
                                            suppressRowClickSelection={true}
                                            onFilterModified={onFloatingFilterChanged}
                                            enableBrowserTooltips={true}
                                        >
                                            <AgGridColumn field="Currency" editable='false' headerName="Currency" minWidth={190}></AgGridColumn>
                                            {costingAndPartNo && <AgGridColumn field="CostingNumber" headerName="Costing No" minWidth={190}></AgGridColumn>}
                                            {costingAndPartNo && <AgGridColumn field="PartNumber" tooltipField='PartNumber' headerName="Part No" minWidth={190}></AgGridColumn>}
                                            <AgGridColumn field="BankRate" editable='false' headerName="Bank Rate(INR)" minWidth={190}></AgGridColumn>
                                            <AgGridColumn suppressSizeToFit="true" editable='false' field="BankCommissionPercentage" headerName="Bank Commission %" minWidth={190}></AgGridColumn>
                                            <AgGridColumn field="CustomRate" editable='false' headerName="Custom Rate(INR)" minWidth={190}></AgGridColumn>

                                            {!isImpactedMaster && <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Exchange Rate" marryChildren={true} >
                                                <AgGridColumn width={120} field="CurrencyExchangeRate" tooltipField='CurrencyExchangeRate' editable='false' headerName="Existing" cellRenderer='oldRateFormatter' colId="CurrencyExchangeRate" suppressSizeToFit={true}></AgGridColumn>
                                                <AgGridColumn width={120} field="NewCurrencyExchangeRate" tooltipField="NewCurrencyExchangeRate" valueGetter='data.NewCurrencyExchangeRate' editable={!isImpactedMaster} headerName="Revised" cellRenderer='newRateFormatter' colId='NewCurrencyExchangeRate' headerComponent={'revisedBasicRateHeader'} suppressSizeToFit={true}></AgGridColumn>
                                            </AgGridColumn>}

                                            {isImpactedMaster && <>
                                                <AgGridColumn suppressSizeToFit="true" field="OldExchangeRate" headerName="Existing Exchange Rate(INR)" minWidth={190}></AgGridColumn>
                                                <AgGridColumn suppressSizeToFit="true" field="NewExchangeRate" headerName="Revised Exchange Rate(INR)" minWidth={190}></AgGridColumn>
                                            </>}
                                            {props.children}
                                            <AgGridColumn field="EffectiveDate" headerName="Effective Date" editable='false' minWidth={190} cellRenderer='effectiveDateRenderer'></AgGridColumn>
                                            <AgGridColumn field="ExchangeRateId" hide={true}></AgGridColumn>

                                        </AgGridReact>

                                        {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
                                    </div>
                                </div>

                            </Col>
                        </Row>
                        {!isImpactedMaster &&
                            <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                                <div className="col-sm-12 text-right bluefooter-butn d-flex justify-content-end align-items-center">
                                    <div className="d-flex align-items-center">
                                        {simulationApplicability?.value === APPLICABILITY_PART_SIMULATION ?
                                            <><div className='verfiy-page inputbox date-section mr-3'> <DatePicker
                                                name="EffectiveDate"
                                                selected={DayTime(effectiveDate).isValid() ? new Date(effectiveDate) : ''}
                                                onChange={handleEffectiveDateChange}
                                                showMonthDropdown
                                                showYearDropdown
                                                dropdownMode='select'
                                                dateFormat="dd/MM/yyyy"
                                                placeholderText="Select effective date"
                                                className="withBorder"
                                                autoComplete={"off"}
                                                disabledKeyboardNavigation
                                                onChangeRaw={(e) => e.preventDefault()}
                                            // minDate={new Date()}
                                            // minDate={new Date(largestDate)}
                                            />
                                            </div>
                                                {isWarningMessageShow && <WarningMessage dClass={"error-message"} textClass={"pt-1"} message={"Please select effective date"} />}
                                                <button onClick={verifySimulation} type="submit" className="user-btn mr5 save-btn" disabled={isDisable}>
                                                    <div className={"Run-icon"}>
                                                    </div>{" "}
                                                    {"Verify"}
                                                </button>
                                            </> :
                                            <button onClick={selectRM} type="button" className="user-btn mr5 save-btn" disabled={isDisable}>
                                                <div>
                                                </div>{" "}
                                                {`Select ${simulationApplicability?.label}`}
                                            </button>}
                                    </div>
                                    {/* <button onClick={runSimulation} type="submit" className="user-btn mr5 save-btn">
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
                    <VerifySimulation isExchangeRate={true} token={token} cancelVerifyPage={cancelVerifyPage} />
                }

                {
                    showMainSimulation && <Simulation isRMPage={true} />
                }
                {
                    showRunSimulationDrawer &&
                    <RunSimulationDrawer
                        isOpen={showRunSimulationDrawer}
                        closeDrawer={closeDrawer}
                        anchor={"right"}
                    />
                }
            </div>}
            {showRMMasterList && <RMImportListing
                isSimulation={true}
                isMasterSummaryDrawer={false}
                //   apply={editTable}
                //    objectForMultipleSimulation={obj} 
                //    selectionForListingMasterAPI={selectionForListingMasterAPI} 
                //    changeSetLoader={changeSetLoader} 
                //    changeTokenCheckBox={changeTokenCheckBox} 
                //    isReset={isReset} 
                ListFor='simulation'
                approvalStatus={APPROVED_STATUS}
                // stopUnrequiredCalls={true}
                isFromVerifyPage={true}
                cancelImportList={cancelImportList}
            />}
            {showBOPMasterList &&
                <BOPImportListing
                    isSimulation={true}
                    isMasterSummaryDrawer={false}
                    // technology={technology.value}
                    // objectForMultipleSimulation={obj}
                    // apply={editTable}
                    // selectionForListingMasterAPI={selectionForListingMasterAPI}
                    // changeSetLoader={changeSetLoader}
                    // changeTokenCheckBox={changeTokenCheckBox}
                    // isReset={isReset}
                    ListFor={'simulation'}
                    // isBOPAssociated={association?.value === ASSOCIATED ? true : false}
                    approvalStatus={APPROVED_STATUS}
                    // callBackLoader={callBackLoader}
                    isFromVerifyPage={true}
                    cancelImportList={cancelImportList}
                />}
        </div >
    );
}

export default ERSimulation;