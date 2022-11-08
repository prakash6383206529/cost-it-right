import React, { useEffect, useState } from 'react';
import { Row, Col, } from 'reactstrap';
import moment from 'moment';
import { defaultPageSize, EMPTY_DATA } from '../../../../config/constants';
import NoContentFound from '../../../common/NoContentFound';
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId } from '../../../../helper';
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
import { VBC, ZBC } from '../../../../config/constants';
import { runVerifyMachineRateSimulation } from '../../actions/Simulation';
import VerifySimulation from '../VerifySimulation';
import Toaster from '../../../common/Toaster';
import { PaginationWrapper } from '../../../common/commonPagination';
import DayTime from '../../../common/DayTimeWrapper';
import WarningMessage from '../../../common/WarningMessage';
import DatePicker from "react-datepicker";
import { useRef } from 'react';
import { getMaxDate } from '../../SimulationUtils';

const gridOptions = {

};
function MRSimulation(props) {
    const { list, isbulkUpload, rowCount, isImpactedMaster, tokenForMultiSimulation } = props
    const [showRunSimulationDrawer, setShowRunSimulationDrawer] = useState(false)
    const [showverifyPage, setShowVerifyPage] = useState(false)
    const [token, setToken] = useState('')
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [showMainSimulation, setShowMainSimulation] = useState(false)
    const [effectiveDate, setEffectiveDate] = useState('');
    const [isEffectiveDateSelected, setIsEffectiveDateSelected] = useState(false);
    const [isWarningMessageShow, setIsWarningMessageShow] = useState(false);
    const [maxDate, setMaxDate] = useState('');
    const [isDisable, setIsDisable] = useState(false)
    const gridRef = useRef();


    const { register, control, setValue, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })


    const dispatch = useDispatch()

    const { selectedMasterForSimulation } = useSelector(state => state.simulation)
    const { selectedTechnologyForSimulation } = useSelector(state => state.simulation)

    const cancelVerifyPage = () => {
        setShowVerifyPage(false)
    }

    const effectiveDateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? moment(cell).format('DD/MM/YYYY') : '';
    }

    useEffect(() => {
        if (isbulkUpload) {
            setValue('NoOfCorrectRow', rowCount.correctRow)
            setValue('NoOfRowsWithoutChange', rowCount.NoOfRowsWithoutChange)
        }
    }, [])

    useEffect(() => {
        if (list && list.length > 0) {
            window.screen.width >= 1920 && gridRef.current.api.sizeColumnsToFit();
            if (isImpactedMaster) {
                gridRef.current.api.sizeColumnsToFit();
            }
            let maxDate = getMaxDate(list)
            setMaxDate(maxDate)
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
                        <span className={`${true ? 'form-control' : ''}`} >{cell && value ? Number(cell) : Number(row.MachineRate)} </span>
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
        setShowMainSimulation(true)
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
        if (isImpactedMaster) {
            window.screen.width >= 1365 && params.api.sizeColumnsToFit();
        }
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
    };

    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const resetState = () => {
        gridApi?.setQuickFilter('');
        gridOptions?.columnApi?.resetColumnState();
        gridOptions?.api?.setFilterModel(null);
        if (!isImpactedMaster) {
            window.screen.width >= 1600 && gridRef.current.api.sizeColumnsToFit();
        }
        else {
            gridRef.current.api.sizeColumnsToFit();
        }
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
        onCellValueChanged: onCellValueChanged
    };
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
            if (Number(li.MachineRate) === Number(li.NewMachineRate) || li?.NewMachineRate === undefined) {
                ccCount = ccCount + 1
            } else {

                li.NewTotal = Number(li.NewMachineRate ? li.NewMachineRate : li.MachineRate) + checkForNull(li.RemainingTotal)

                arr.push(li)
            }
            return null;
        })
        if (ccCount === tempData.length) {
            Toaster.warning('There is no changes in new value. Please correct the data, then run simulation')
            return false
        }
        setIsDisable(true)
        /**********POST METHOD TO CALL HERE AND AND SEND TOKEN TO VERIFY PAGE ****************/
        let obj = {}
        obj.SimulationTechnologyId = selectedMasterForSimulation.value
        obj.LoggedInUserId = loggedInUserId()
        obj.SimulationHeadId = list[0].CostingTypeId
        obj.TechnologyId = selectedTechnologyForSimulation.value
        obj.TechnologyName = selectedTechnologyForSimulation.label
        obj.EffectiveDate = DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss')

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
        dispatch(runVerifyMachineRateSimulation(obj, res => {
            setIsDisable(false)
            if (res?.data?.Result) {
                setToken(res.data.Identity)
                setShowVerifyPage(true)
            }
        }))
    }, 500);

    return (
        <div>
            <div className={`ag-grid-react`}>
                {
                    (!showverifyPage && !showMainSimulation) &&
                    <Fragment>

                        <div>

                            <Row>
                                <Col className={`add-min-height mb-3 sm-edit-page  ${list && list?.length <= 0 ? "overlay-contain" : ""}`}>
                                    <div className="ag-grid-wrapper height-width-wrapper">
                                        <div className="ag-grid-header d-flex align-items-center">
                                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                                            <button type="button" className="user-btn float-right" title="Reset Grid" onClick={() => resetState()}>
                                                <div className="refresh mr-0"></div>
                                            </button>
                                        </div>
                                        {
                                            isbulkUpload &&
                                            <div className='d-flex justify-content-end bulk-upload-row'>
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
                                        <div className="ag-theme-material" style={{ width: '100%' }}>
                                            <AgGridReact
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
                                                rowSelection={'multiple'}
                                                onCellValueChanged={onCellValueChanged}
                                            >
                                                {!isImpactedMaster && <AgGridColumn field="Technologies" editable='false' headerName="Technology" minWidth={190}></AgGridColumn>}
                                                {!isImpactedMaster && <AgGridColumn field="VendorName" editable='false' headerName="Vendor" minWidth={190}></AgGridColumn>}
                                                {!isImpactedMaster && <AgGridColumn field="PartNo" editable='false' headerName="Part No" minWidth={190}></AgGridColumn>}
                                                <AgGridColumn field="MachineName" editable='false' headerName="Machine Name" minWidth={140}></AgGridColumn>
                                                <AgGridColumn field="MachineNumber" editable='false' headerName="Machine Number" minWidth={140}></AgGridColumn>
                                                <AgGridColumn field="ProcessName" editable='false' headerName="Process Name" minWidth={140}></AgGridColumn>
                                                {
                                                    !isImpactedMaster &&
                                                    <>
                                                        <AgGridColumn field="Plants" editable='false' headerName="Plant" minWidth={190}></AgGridColumn>

                                                    </>
                                                }
                                                <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Net Machine Rate" marryChildren={true} >
                                                    <AgGridColumn width={120} field="MachineRate" editable='false' headerName="Old" cellRenderer='oldRateFormatter' colId="MachineRate"></AgGridColumn>
                                                    <AgGridColumn width={120} cellRenderer='newRateFormatter' editable={!isImpactedMaster} field="NewMachineRate" headerName="New" colId='NewMachineRate'></AgGridColumn>
                                                </AgGridColumn>
                                                <AgGridColumn field="EffectiveDate" headerName="Effective Date" editable='false' minWidth={190} cellRenderer='effectiveDateRenderer'></AgGridColumn>
                                                <AgGridColumn field="CostingId" hide={true}></AgGridColumn>

                                            </AgGridReact>
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
                                                dateFormat="dd/MM/yyyy"
                                                minDate={new Date(maxDate)}
                                                dropdownMode="select"
                                                placeholderText="Select effective date"
                                                className="withBorder"
                                                autoComplete={"off"}
                                                disabledKeyboardNavigation
                                                onChangeRaw={(e) => e.preventDefault()}
                                            />
                                            {isWarningMessageShow && <WarningMessage dClass={"error-message"} textClass={"pt-1"} message={"Please select effective date"} />}
                                        </div>
                                        <button type={"button"} className="mr15 cancel-btn" onClick={() => cancel()} disabled={false}>
                                            <div className={"cancel-icon"}></div>
                                            {"CANCEL"}
                                        </button>
                                        <button onClick={verifySimulation} type="submit" className="user-btn mr5 save-btn" disabled={false}>
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
                    showMainSimulation && <Simulation isMasterSummaryDrawer={false} isCancelClicked={true} isRMPage={true} />
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