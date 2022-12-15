import React, { useEffect, useState, useRef } from 'react';
import { Row, Col, } from 'reactstrap';
import DayTime from '../../../common/DayTimeWrapper'
import { defaultPageSize, EMPTY_DATA, OPERATIONS, SURFACETREATMENT } from '../../../../config/constants';
import NoContentFound from '../../../common/NoContentFound';
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId, searchNocontentFilter } from '../../../../helper';
import Toaster from '../../../common/Toaster';
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
import { runVerifySurfaceTreatmentSimulation } from '../../actions/Simulation';
import VerifySimulation from '../VerifySimulation';
import { PaginationWrapper } from '../../../common/commonPagination';
import DatePicker from "react-datepicker";
import WarningMessage from '../../../common/WarningMessage';
import { getMaxDate } from '../../SimulationUtils';

const gridOptions = {

};
function OperationSTSimulation(props) {
    const { list, isbulkUpload, rowCount, isImpactedMaster, masterId, lastRevision, tokenForMultiSimulation } = props
    const [showRunSimulationDrawer, setShowRunSimulationDrawer] = useState(false)
    const [showverifyPage, setShowVerifyPage] = useState(false)
    const [token, setToken] = useState('')
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [showMainSimulation, setShowMainSimulation] = useState(false)
    const [isDisable, setIsDisable] = useState(false)
    const [effectiveDate, setEffectiveDate] = useState('');
    const [isEffectiveDateSelected, setIsEffectiveDateSelected] = useState(false);
    const [isWarningMessageShow, setIsWarningMessageShow] = useState(false);
    const [titleObj, setTitleObj] = useState({})
    const [maxDate, setMaxDate] = useState('');
    const [noData, setNoData] = useState(false);

    const gridRef = useRef();

    const { register, control, setValue, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })


    const dispatch = useDispatch()

    const { selectedMasterForSimulation, selectedTechnologyForSimulation } = useSelector(state => state.simulation)

    const cancelVerifyPage = () => {
        setShowVerifyPage(false)
    }

    const effectiveDateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? DayTime(cell).format('DD/MM/YYYY') : '';
    }

    useEffect(() => {
        if (isbulkUpload) {
            setValue('NoOfCorrectRow', rowCount.correctRow)
            setValue('NoOfRowsWithoutChange', rowCount.NoOfRowsWithoutChange)
            setTitleObj(prevState => ({ ...prevState, rowWithChanges: rowCount.correctRow, rowWithoutChanges: rowCount.NoOfRowsWithoutChange }))
        }
    }, [])
    useEffect(() => {
        if (list && list.length >= 0) {
            gridRef.current.api.sizeColumnsToFit();
            let maxDate = getMaxDate(list)
            setMaxDate(maxDate)
        }
    }, [list])


    const newRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
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
                        <span className={`${true ? 'form-control' : ''}`} >{cell && value ? Number(cell) : Number(row.Rate)} </span>
                }

            </>
        )
    }

    const onFloatingFilterChanged = (value) => {
        if (list.length !== 0) {
            setNoData(searchNocontentFilter(value, noData))
        }
    }
    const oldRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
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
                        <span>{cell && value ? Number(cell) : Number(row.Rate)} </span>
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
            item.NewRate = undefined
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
        params.api.sizeColumnsToFit()
        params.api.paginationGoToPage(0);

    };

    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
    };


    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const NewcostFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        if (!row.NewRate || Number(row.Rate) === Number(row.NewRate) || row.NewRate === '') return ''
        const NewRate = Number(row.NewRate) + checkForNull(row.RemainingTotal)
        const NetCost = Number(row.Rate) + checkForNull(row.RemainingTotal)
        const classGreen = (NewRate > NetCost) ? 'red-value form-control' : (NewRate < NetCost) ? 'green-value form-control' : 'form-class'
        return row.NewRate != null ? <span className={classGreen}>{checkForDecimalAndNull(NewRate, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const OldcostFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const Rate = Number(row.Rate) + checkForNull(row.RemainingTotal)
        return row.Rate != null ? checkForDecimalAndNull(Rate, getConfigurationKey().NoOfDecimalForPrice) : ''
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
        statusFormatter: statusFormatter,
        NewcostFormatter: NewcostFormatter,
        OldcostFormatter: OldcostFormatter,
        oldRateFormatter: oldRateFormatter
    };


    const verifySimulation = debounce(() => {
        /**********CONDITION FOR: IS ANY FIELD EDITED****************/
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

        let tempArr = []
        arr && arr.map(item => {

            let tempObj = {}
            tempObj.OperationId = item.OperationId
            tempObj.OldOperationRate = Number(item.Rate)
            tempObj.NewOperationRate = Number(item.NewRate)

            tempArr.push(tempObj)
            return null
        })

        obj.SimulationIds = tokenForMultiSimulation
        obj.EffectiveDate = DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss')
        obj.SimulationSurfaceTreatmentAndOperation = tempArr
        dispatch(runVerifySurfaceTreatmentSimulation(obj, res => {
            setIsDisable(false)
            if (res?.data?.Result) {
                setToken(res.data.Identity)
                setShowVerifyPage(true)
            }
        }))
    }, 500);
    const resetState = () => {
        gridApi?.setQuickFilter('');
        gridOptions?.columnApi?.resetColumnState();
        gridOptions?.api?.setFilterModel(null);
        gridRef.current.api.sizeColumnsToFit();
    }

    return (
        <div>
            <div className={`ag-grid-react`}>
                {
                    (!showverifyPage && !showMainSimulation) &&
                    <Fragment>

                        <form>

                            <Row>
                                <Col className="add-min-height mb-3 sm-edit-page">
                                    <div className={`ag-grid-wrapper height-width-wrapper ${(list && list?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                                        <div className="ag-grid-header d-flex align-items-center">
                                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
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
                                            </div>
                                        }
                                        <div className="ag-theme-material p-relative" style={{ width: '100%' }}>
                                            {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found simulation-lisitng" />}
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
                                                onFilterModified={onFloatingFilterChanged}
                                            // frameworkComponents={frameworkComponents}
                                            >
                                                {!isImpactedMaster && <>
                                                    <AgGridColumn field="Technology" editable='false' headerName="Technology" minWidth={190}></AgGridColumn>
                                                    <AgGridColumn field="VendorName" editable='false' headerName="Vendor (Code)" minWidth={190}></AgGridColumn>
                                                </>}
                                                <AgGridColumn field="OperationName" editable='false' headerName="Operation Name" minWidth={190}></AgGridColumn>
                                                <AgGridColumn field="OperationCode" editable='false' headerName="Operation Code" minWidth={190}></AgGridColumn>
                                                {!isImpactedMaster && <>
                                                    <AgGridColumn field={`${isbulkUpload ? 'DestinationPlant' : 'Plants'}`} editable='false' headerName="Plant (Code)" minWidth={190}></AgGridColumn>
                                                </>}
                                                <AgGridColumn headerClass="justify-content-center" cellClass="text-center" minWidth={240} headerName="Net Rate" marryChildren={true} >
                                                    <AgGridColumn minWidth={120} field="Rate" editable='false' headerName="Old" colId="Rate" cellRenderer="oldRateFormatter"></AgGridColumn>
                                                    <AgGridColumn minWidth={120} cellRenderer='newRateFormatter' editable={!isImpactedMaster} field="NewRate" headerName="New" colId='NewRate'></AgGridColumn>
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

                                        <button type={"button"} className="mr15 cancel-btn" onClick={cancel} disabled={isDisable}>
                                            <div className={"cancel-icon"}></div>
                                            {"CANCEL"}
                                        </button>
                                        <button onClick={verifySimulation} type="button" className="user-btn mr5 save-btn" disabled={isDisable}>
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
                    showMainSimulation && <Simulation isMasterSummaryDrawer={false} isCancelClicked={true} isRMPage={true} />
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