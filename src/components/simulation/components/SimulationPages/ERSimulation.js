import React, { useEffect, useState } from 'react';
import { Row, Col, } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import moment from 'moment';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId } from '../../../../helper';
import { toastr } from 'react-redux-toastr';
import { runVerifyExchangeRateSimulation } from '../../actions/Simulation';
import { Fragment } from 'react';
import { TextFieldHookForm } from '../../../layout/HookFormInputs';
import { useForm, Controller, useWatch } from 'react-hook-form'
import RunSimulationDrawer from '../RunSimulationDrawer';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import Simulation from '../Simulation';
import OtherVerifySimulation from '../OtherVerifySimulation';

const gridOptions = {

};
function ERSimulation(props) {
    const { isDomestic, list, isbulkUpload, rowCount, technology, master, isImpactedMaster } = props
    const [showSimulation, setShowSimulation] = useState(false)
    const [showRunSimulationDrawer, setShowRunSimulationDrawer] = useState(false)
    const [showverifyPage, setShowVerifyPage] = useState(false)
    const [token, setToken] = useState('')
    const [colorClass, setColorClass] = useState('')
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [rowData, setRowData] = useState(null);
    const [update, setUpdate] = useState(true)
    const [showMainSimulation, setShowMainSimulation] = useState(false)

    const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })


    const dispatch = useDispatch()

    const selectedTechnologyForSimulation = useSelector(state => state.simulation.selectedTechnologyForSimulation)
    const { selectedMasterForSimulation } = useSelector(state => state.simulation)

    const { filteredRMData } = useSelector(state => state.material)

    const cancelVerifyPage = () => {

        setShowVerifyPage(false)
    }

    const effectiveDateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        return cell != null ? moment(cell).format('DD/MM/YYYY') : '';
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
                toastr.warning("Value should not be more than 8")
                return false
            }
            return true
        } else if (cellValue && !/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/.test(cellValue)) {
            toastr.warning('Please enter a valid positive numbers.')
            return false
        }
        return true
    }


    const cancel = () => {
        // props.cancelEditPage()
        setShowMainSimulation(true)
    }

    const closeDrawer = (e = '') => {
        setShowRunSimulationDrawer(false)

    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
        editable: true
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);

        var allColumnIds = [];
        params.columnApi.getAllColumns().forEach(function (column) {
            allColumnIds.push(column.colId);
        });

        window.screen.width <= 1366 ? params.columnApi.autoSizeColumns(allColumnIds) : params.api.sizeColumnsToFit()
    };

    const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const frameworkComponents = {
        effectiveDateRenderer: effectiveDateFormatter,
        costFormatter: costFormatter,
        customNoRowsOverlay: NoContentFound,
        newERFormatter: newERFormatter,
        oldERFormatter: oldERFormatter,
    };

    const verifySimulation = () => {
        let exchnageRateCount = 0

        list && list.map((li) => {
            if (Number(li.CurrencyExchangeRate) === Number(li.NewCurrencyExchangeRate) || li?.NewCurrencyExchangeRate === undefined) {
                exchnageRateCount = exchnageRateCount + 1
            }
            return null;
        })

        if (exchnageRateCount === list.length) {
            toastr.warning('There is no changes in new value.Please correct the data ,then run simulation')
            return false
        }
        exchnageRateCount = 0
        // setShowVerifyPage(true)
        /**********POST METHOD TO CALL HERE AND AND SEND TOKEN TO VERIFY PAGE ****************/
        let obj = {}
        obj.SimulationTechnologyId = selectedMasterForSimulation.value
        obj.LoggedInUserId = loggedInUserId()
        let tempArr = []
        list && list.map(item => {
            if (item.NewCurrencyExchangeRate !== undefined && ((item.NewCurrencyExchangeRate !== undefined ? Number(item.NewCurrencyExchangeRate) : Number(item.CurrencyExchangeRate)) !== Number(item.CurrencyExchangeRate))) {
                let tempObj = {}
                tempObj.ExchangeRateId = item.ExchangeRateId
                tempObj.EffectiveDate = item.EffectiveDate
                tempObj.Currency = item.Currency
                tempObj.OldExchangeRate = item.CurrencyExchangeRate
                tempObj.NewExchangeRate = item.NewCurrencyExchangeRate ? item.NewCurrencyExchangeRate : item.CurrencyExchangeRate
                tempObj.Delta = 0
                tempArr.push(tempObj)
            }
            return null;
        })
        obj.SimulationExchangeRates = tempArr

        dispatch(runVerifyExchangeRateSimulation(obj, res => {
            if (res.data.Result) {
                setToken(res.data.Identity)
                setShowVerifyPage(true)
            }
        }))
        // setShowVerifyPage(true)
    }


    return (
        <div>
            <div className={`ag-grid-react`}>

                {


                    (!showverifyPage && !showMainSimulation) &&
                    <Fragment>
                        {
                            isbulkUpload &&
                            <Row className="sm-edit-row justify-content-end">
                                <Col md="6">
                                    <div className="d-flex align-items-center">
                                        <label>No of rows with changes:</label>
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
                                </Col>
                                <Col md="6">
                                    <div className="d-flex align-items-center">
                                        <label>No of rows without changes:</label>
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
                                </Col>
                            </Row>
                        }
                        <Row>
                            <Col className="add-min-height mb-3 sm-edit-page">
                                <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                                    <div className="ag-grid-header">
                                        <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                                    </div>
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
                                            loadingOverlayComponent={'customLoadingOverlay'}
                                            noRowsOverlayComponent={'customNoRowsOverlay'}
                                            noRowsOverlayComponentParams={{
                                                title: CONSTANT.EMPTY_DATA,
                                            }}
                                            frameworkComponents={frameworkComponents}
                                            stopEditingWhenCellsLoseFocus={true}
                                        >
                                            <AgGridColumn field="Currency" editable='false' headerName="Currency" minWidth={150}></AgGridColumn>
                                            <AgGridColumn field="BankRate" editable='false' headerName="Bank Rate(INR)" minWidth={150}></AgGridColumn>
                                            <AgGridColumn suppressSizeToFit="true" editable='false' field="BankCommissionPercentage" headerName="Bank Commission % " minWidth={150}></AgGridColumn>
                                            <AgGridColumn field="CustomRate" editable='false' headerName="Custom Rate(INR)"  minWidth={155}></AgGridColumn>
                                            {/* <AgGridColumn suppressSizeToFit="true" field="CurrencyExchangeRate" headerName="Exchange Rate(INR)"></AgGridColumn> */}
                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Exchange Rate (INR)" marryChildren={true} >
                                                <AgGridColumn field="CurrencyExchangeRate" editable='false' cellRenderer="oldERFormatter" width={100} headerName="Old" colId="CurrencyExchangeRate"></AgGridColumn>
                                                <AgGridColumn cellRenderer='newERFormatter' editable={isImpactedMaster ? false : true} field="NewCurrencyExchangeRate" width={100} headerName="New" colId='NewCurrencyExchangeRate'></AgGridColumn>
                                            </AgGridColumn>
                                            <AgGridColumn field="EffectiveDate" headerName="Effective Date" minWidth={180} editable='false' cellRenderer='effectiveDateRenderer'></AgGridColumn>
                                            <AgGridColumn suppressSizeToFit="true" field="DateOfModification" minWidth={180} editable='false' headerName="Date of Modification" cellRenderer='effectiveDateRenderer'></AgGridColumn>
                                            <AgGridColumn field="ExchangeRateId" hide={true}></AgGridColumn>

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
                                <div className="col-sm-12 text-right bluefooter-butn">
                                    <button type={"button"} className="mr15 cancel-btn" onClick={cancel}>
                                        <div className={"cancel-icon"}></div>
                                        {"CANCEL"}
                                    </button>
                                    <button onClick={verifySimulation} type="submit" className="user-btn mr5 save-btn">
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
                    <OtherVerifySimulation isExchangeRate={true} token={token} cancelVerifyPage={cancelVerifyPage} />
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
            </div>
        </div>
    );
}

export default ERSimulation;