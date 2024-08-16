import React, { useEffect, useState } from 'react';
import { Row, Col, } from 'reactstrap';
import moment from 'moment';
import { EMPTY_DATA } from '../../../../config/constants';
import NoContentFound from '../../../common/NoContentFound';
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId } from '../../../../helper';
import { runVerifyCombinedProcessSimulation } from '../../actions/Simulation';
import DayTime from '../../../common/DayTimeWrapper'
import { Fragment } from 'react';
import { Controller, useForm } from 'react-hook-form'
import RunSimulationDrawer from '../RunSimulationDrawer';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import Simulation from '../Simulation';
import VerifySimulation from '../VerifySimulation';
import debounce from 'lodash.debounce';
import { TextFieldHookForm } from '../../../layout/HookFormInputs';
import { VBC, ZBC } from '../../../../config/constants';
import Toaster from '../../../common/Toaster';
import DatePicker from "react-datepicker";
import WarningMessage from '../../../common/WarningMessage';
import { getMaxDate } from '../../SimulationUtils';
import { useLabels } from '../../../../helper/core';

const gridOptions = {

};
function CPSimulation(props) {
    const { list, isbulkUpload, rowCount, isImpactedMaster, tokenForMultiSimulation } = props
    const [showRunSimulationDrawer, setShowRunSimulationDrawer] = useState(false)
    const [showverifyPage, setShowVerifyPage] = useState(false)
    const [token, setToken] = useState('')
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [showMainSimulation, setShowMainSimulation] = useState(false)
    const [selectedRowData, setSelectedRowData] = useState([]);
    const [tableData, setTableData] = useState([])
    const [effectiveDate, setEffectiveDate] = useState('');
    const [isEffectiveDateSelected, setIsEffectiveDateSelected] = useState(false);
    const [isWarningMessageShow, setIsWarningMessageShow] = useState(false)
    const [maxDate, setMaxDate] = useState('');

    const { technologyLabel } = useLabels();
    const { register, control, setValue, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })


    const dispatch = useDispatch()

    const { selectedMasterForSimulation } = useSelector(state => state.simulation)

    const cancelVerifyPage = () => {
        setShowVerifyPage(false)
    }


    useEffect(() => {
        if (list && list.length > 0) {
            let maxDate = getMaxDate(list)
            setMaxDate(maxDate)
        }
    }, [list])

    useEffect(() => {
        if (isbulkUpload) {
            setValue('NoOfCorrectRow', rowCount.correctRow)
            setValue('NoOfRowsWithoutChange', rowCount.NoOfRowsWithoutChange)
        }
    }, [])

    const oldCPFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        checkForDecimalAndNull(row.OldNetCC, getConfigurationKey().NoOfDecimalForPrice) :
                        <>{cell && value ? checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice) : checkForDecimalAndNull(row.ConversionCost, getConfigurationKey().NoOfDecimalForPrice)} </>
                }

            </>
        )
    }

    const newCPFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        checkForDecimalAndNull(row.NewNetCC, getConfigurationKey().NoOfDecimalForPrice) :
                        <span className={`${true ? 'form-control' : ''}`} >{cell && value ? checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice) : checkForDecimalAndNull(row.ConversionCost, getConfigurationKey().NoOfDecimalForPrice)} </span>
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
        } else if (cellValue && !/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/.test(cellValue)) {
            Toaster.warning('Please enter a valid positive numbers.')
            return false
        }
        return true
    }


    const cancel = () => {
        list && list.map((item) => {
            item.NewCC = undefined
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
        sortable: true
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
        window.screen.width >= 1600 && params.api.sizeColumnsToFit();
        if (isImpactedMaster) {
            window.screen.width >= 1365 && params.api.sizeColumnsToFit();
        }
        var allColumnIds = [];
        params.columnApi.getAllColumns().forEach(function (column) {
            allColumnIds.push(column.colId);
        });

    };

    const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const NewcostFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        if (!row.NewCC || Number(row.ConversionCost) === Number(row.NewCC) || row.NewCC === '') return ''
        const NewCC = Number(row.NewCC) + checkForNull(row.RemainingTotal)
        const NetCost = Number(row.ConversionCost) + checkForNull(row.RemainingTotal)
        const classGreen = (NewCC > NetCost) ? 'red-value form-control' : (NewCC < NetCost) ? 'green-value form-control' : 'form-class'
        return row.NewCC != null ? <span className={classGreen}>{checkForDecimalAndNull(NewCC, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const OldcostFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const ConversionCost = Number(row.ConversionCost) + checkForNull(row.RemainingTotal)
        return row.ConversionCost != null ? checkForDecimalAndNull(ConversionCost, getConfigurationKey().NoOfDecimalForPrice) : ''
    }


    const onRowSelect = () => {
        var selectedRows = gridApi.getSelectedRows();
        setSelectedRowData(selectedRows)
    }
    let obj = {}
    const verifySimulation = debounce(() => {
        /**********CONDITION FOR: IS ANY FIELD EDITED****************/
        if (!isEffectiveDateSelected) {
            setIsWarningMessageShow(true)
            return false
        }
        let ccCount = 0
        let tempData = list
        let arr = []
        tempData && tempData.map((li, index) => {

            if (Number(li.ConversionCost) === Number(li.NewCC) || li?.NewCC === undefined) {
                ccCount = ccCount + 1
            } else {

                li.NewTotal = Number(li.NewCC ? li.NewCC : li.ConversionCost) + checkForNull(li.RemainingTotal)

                arr.push(li)
            }
            return null;
        })
        if (ccCount === tempData.length) {
            Toaster.warning('There is no changes in new value.Please correct the data ,then run simulation')
            return false
        }
        /**********POST METHOD TO CALL HERE AND AND SEND TOKEN TO VERIFY PAGE ****************/
        obj.SimulationTechnologyId = selectedMasterForSimulation.value
        obj.LoggedInUserId = loggedInUserId()
        obj.CostingHead = list[0].CostingHead === 'Vendor Based' ? VBC : ZBC
        obj.TechnologyId = list[0].TechnologyId
        obj.TechnologyName = list[0].TechnologyName
        obj.SimulationHeadId = list[0].CostingTypeId
        let tempArr = []
        arr && arr.map(item => {
            let tempObj = {}
            tempObj.CostingId = item.CostingId
            tempObj.OldNetCC = item.ConversionCost
            tempObj.NewNetCC = item.NewCC
            tempObj.RemainingTotal = item.RemainingTotal
            tempObj.OldTotalCost = item.TotalCost
            tempObj.NewTotalCost = item.NewTotal
            tempObj.EffectiveDate = item.EffectiveDate
            tempArr.push(tempObj)
            return null
        })
        obj.SimulationIds = tokenForMultiSimulation
        obj.SimulationCombinedProcess = tempArr
        obj.EffectiveDate = DayTime(effectiveDate).format('YYYY/MM/DD HH:mm')

        dispatch(runVerifyCombinedProcessSimulation(obj, res => {
            if (res.data.Result) {
                setToken(res.data.Identity)
                setShowVerifyPage(true)
            }
        }))
        setShowVerifyPage(true)
    }, 500);
    const resetState = () => {
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);
    }
    const handleEffectiveDateChange = (date) => {
        setEffectiveDate(date)
        setIsEffectiveDateSelected(true)
        setIsWarningMessageShow(false)
    }
    const effectiveDateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? DayTime(cell).format('DD/MM/YYYY') : '';
    }

    const frameworkComponents = {
        effectiveDateRenderer: effectiveDateFormatter,
        costFormatter: costFormatter,
        customNoRowsOverlay: NoContentFound,
        newCPFormatter: newCPFormatter,
        oldCPFormatter: oldCPFormatter,
        statusFormatter: statusFormatter,
        NewcostFormatter: NewcostFormatter,
        OldcostFormatter: OldcostFormatter
    };

    return (
        <div>
            <div className={`ag-grid-react`}>
                {
                    (!showverifyPage && !showMainSimulation) &&
                    <Fragment>
                        <form>

                            <Row className={`filter-row-large blue-before zindex-0`}>
                                <Col md="12" lg="12" className=' mb-2 d-flex align-items-center justify-content-between'>
                                    <div className='d-flex align-items-center'>
                                        <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search" onChange={(e) => onFilterTextBoxChanged(e)} />
                                        <button type="button" className="user-btn mr5" title="Reset Grid" onClick={() => resetState()}>
                                            <div className="refresh mr-0"></div>
                                        </button>
                                    </div>
                                    <div className='d-flex'>
                                        {
                                            isbulkUpload &&
                                            <div className="d-flex justify-content-end mt-0 mr-0 bulk-upload-row">
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
                                            </div>
                                        }
                                        {!isImpactedMaster && <button type="button" className={"apply ml-2 back_simulationPage"} onClick={cancel}> <div className={'back-icon'}></div>Back</button>}
                                    </div>
                                </Col>
                            </Row>
                            <Row>
                                <Col className="add-min-height mb-3 sm-edit-page">
                                    <div className={`ag-grid-wrapper height-width-wrapper  ${list && list?.length <= 0 ? "overlay-contain" : ""}`}>

                                        <div className="ag-theme-material" style={{ width: '100%' }}>
                                            <AgGridReact
                                                floatingFilter={true}
                                                style={{ height: '100%', width: '100%' }}
                                                defaultColDef={defaultColDef}
                                                domLayout='autoHeight'
                                                // columnDefs={c}
                                                rowData={list}
                                                pagination={true}
                                                paginationPageSize={10}
                                                onGridReady={onGridReady}
                                                gridOptions={gridOptions}
                                                // loadingOverlayComponent={'customLoadingOverlay'}
                                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                                noRowsOverlayComponentParams={{
                                                    title: EMPTY_DATA,
                                                }}
                                                frameworkComponents={frameworkComponents}
                                                stopEditingWhenCellsLoseFocus={true}
                                                rowSelection={'multiple'}
                                                // frameworkComponents={frameworkComponents}
                                                onSelectionChanged={onRowSelect}
                                            >
                                                <AgGridColumn field="TechnologyName" editable='false' headerName={technologyLabel} minWidth={190}></AgGridColumn>
                                                {!isImpactedMaster && <AgGridColumn field="PartName" editable='false' headerName="Part Name" minWidth={190}></AgGridColumn>}
                                                <AgGridColumn field="PartNumber" editable='false' headerName="Part No" minWidth={190}></AgGridColumn>
                                                {
                                                    !isImpactedMaster &&
                                                    <>
                                                        <AgGridColumn field="PlantName" editable='false' headerName="Plant" minWidth={190}></AgGridColumn>

                                                    </>
                                                }
                                                <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Net CC" marryChildren={true} >
                                                    <AgGridColumn width={120} field="ConversionCost" editable='false' headerName="Old" cellRenderer='oldCPFormatter' colId="ConversionCost"></AgGridColumn>
                                                    <AgGridColumn width={120} cellRenderer='newCPFormatter' editable={true} field="NewCC" headerName="New" colId='NewCC'></AgGridColumn>
                                                </AgGridColumn>
                                                {/* {!isImpactedMaster && <AgGridColumn field="RemainingTotal" editable='false' headerName="Remaining Fields Total" minWidth={190}></AgGridColumn>} */}
                                                {
                                                    !isImpactedMaster &&
                                                    <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Total" marryChildren={true} >
                                                        <AgGridColumn width={120} cellRenderer='OldcostFormatter' valueGetter='Number(data.ConversionCost) + Number(data.RemainingTotal)' field="TotalCost" editable='false' headerName="Old" colId="Total"></AgGridColumn>
                                                        <AgGridColumn width={120} cellRenderer='NewcostFormatter' valueGetter='data.NewCC + Number(data.RemainingTotal)' field="NewTotal" headerName="New" colId='NewTotal'></AgGridColumn>
                                                    </AgGridColumn>
                                                }

                                                <AgGridColumn field="EffectiveDate" headerName="Effective Date" editable='false' minWidth={190} cellRenderer='effectiveDateRenderer'></AgGridColumn>
                                                {/* <AgGridColumn field="DisplayStatus" headerName="Status" floatingFilter={false} cellRenderer='statusFormatter'></AgGridColumn> */}

                                                {/* <AgGridColumn field="EffectiveDate" headerName="Effective Date" editable='false' minWidth={190} cellRenderer='effectiveDateRenderer'></AgGridColumn> */}
                                                <AgGridColumn field="CostingId" hide={true}></AgGridColumn>

                                            </AgGridReact>

                                            <div className="paging-container d-inline-block float-right">
                                                <select className="form-control paging-dropdown" onChange={(e) => onPageSizeChanged(e.target.value)} id="page-size">
                                                    <option value="10" selected={true}>10</option>
                                                    <option value="50">50</option>
                                                    <option value="100">100</option>
                                                </select>
                                            </div>
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
                                                selected={DayTime(effectiveDate).isValid() ? new Date(effectiveDate) : ''}
                                                onChange={handleEffectiveDateChange}
                                                showMonthDropdown
                                                showYearDropdown
                                                dateFormat="dd/MM/yyyy"
                                                dropdownMode="select"
                                                placeholderText="Select effective date"
                                                minDate={new Date(maxDate)}
                                                className="withBorder"
                                                autoComplete={"off"}
                                                disabledKeyboardNavigation
                                                onChangeRaw={(e) => e.preventDefault()}
                                            />
                                            {isWarningMessageShow && <WarningMessage dClass={"error-message"} textClass={"pt-1"} message={"Please select effective date"} />}
                                        </div>
                                        <button onClick={verifySimulation} type="button" className="user-btn mr5 save-btn">
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
                    <VerifySimulation isCombinedProcess={true} master={selectedMasterForSimulation.value} token={token} cancelVerifyPage={cancelVerifyPage} list={tableData} />
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
                        masterId={selectedMasterForSimulation}
                    />
                }
            </div>

        </div >
    );
}

export default CPSimulation;