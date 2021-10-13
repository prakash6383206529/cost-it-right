import React, { useEffect, useState } from 'react';
import { Row, Col, } from 'reactstrap';
import moment from 'moment';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId } from '../../../../helper';
import { toastr } from 'react-redux-toastr';
import { runVerifyCombinedProcessSimulation } from '../../actions/Simulation';
import { Fragment } from 'react';
import { Controller, useForm } from 'react-hook-form'
import RunSimulationDrawer from '../RunSimulationDrawer';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import Simulation from '../Simulation';
import OtherVerifySimulation from '../OtherVerifySimulation';
import debounce from 'lodash.debounce';
import { TextFieldHookForm } from '../../../layout/HookFormInputs';

const gridOptions = {

};
function CPSimulation(props) {
    const { list, isbulkUpload, rowCount, technology, master, isImpactedMaster } = props
    const [showRunSimulationDrawer, setShowRunSimulationDrawer] = useState(false)
    const [showverifyPage, setShowVerifyPage] = useState(false)
    const [token, setToken] = useState('')
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [rowData, setRowData] = useState(null);
    const [showMainSimulation, setShowMainSimulation] = useState(false)
    const [selectedRowData, setSelectedRowData] = useState([]);
    const [tableData, setTableData] = useState([])

    const [dummyData, setDummyData] = useState([{
        Technology: "Sheet Metal",
        Plant: "plant1",
        NetCC: 10,
        RemainingFieldsTotal: "20",
        Total: "30",
        EffectiveDate: new Date(),
        DisplayStatus: "Pending"
    },
    {
        Technology: "Sheet Metal",
        Plant: "plant2",
        NetCC: 10,
        RemainingFieldsTotal: "20",
        Total: "30",
        EffectiveDate: new Date(),
        DisplayStatus: "Pending"
    },
    {
        Technology: "Sheet Metal",
        Plant: "plant3",
        NetCC: 10,
        RemainingFieldsTotal: "20",
        Total: "30",
        EffectiveDate: new Date(),
        DisplayStatus: "Pending"
    },
    {
        Technology: "Sheet Metal",
        Plant: "plant4",
        NetCC: 10,
        RemainingFieldsTotal: "20",
        Total: "55",
        EffectiveDate: new Date(),
        DisplayStatus: "Pending"
    },
    {
        Technology: "Sheet Metal",
        Plant: "plant5",
        NetCC: 10,
        RemainingFieldsTotal: "20",
        Total: "30",
        EffectiveDate: new Date(),
        DisplayStatus: "Pending"
    },
    {
        Technology: "Sheet Metal",
        Plant: "plant6",
        NetCC: 10,
        RemainingFieldsTotal: "20",
        Total: "30",
        EffectiveDate: new Date(),
        DisplayStatus: "Pending"
    },

    ])
    const { register, handleSubmit, control, setValue, getValues, reset, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })


    const dispatch = useDispatch()

    const { selectedMasterForSimulation } = useSelector(state => state.simulation)

    const cancelVerifyPage = () => {

        setShowVerifyPage(false)
    }

    const effectiveDateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        return cell != null ? moment(cell).format('DD/MM/YYYY') : '';
    }

    useEffect(() => {
        if (list.length !== 0) {
            setDummyData(list)
        }

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
                        Number(row.NetCC) :
                        <span className={`${!isbulkUpload ? 'form-control' : ''}`} >{cell && value ? Number(cell) : Number(row.NetCC)} </span>
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
                        row.NewCC :
                        <span className={`${true ? 'form-control' : ''}`} >{cell && value ? Number(cell) : Number(row.NetCC)} </span>
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
    // const isFirstColumn = (params) => {
    //     if (isImpactedMaster) return false
    //     var displayedColumns = params.columnApi.getAllDisplayedColumns();
    //     var thisIsFirstColumn = displayedColumns[0] === params.column;

    //     return thisIsFirstColumn;
    // }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
        // headerCheckboxSelection: isFirstColumn,
        // checkboxSelection: isFirstColumn
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

    const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const NewcostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        if (!row.NewCC || Number(row.NetCC) === Number(row.NewCC) || row.NewCC === '') return ''
        const NewCC = Number(row.NewCC) + checkForNull(row.RemainingFieldsTotal)
        const NetCost = Number(row.NetCC) + checkForNull(row.RemainingFieldsTotal)
        const classGreen = (NewCC > NetCost) ? 'red-value form-control' : (NewCC < NetCost) ? 'green-value form-control' : 'form-class'
        return row.NewCC != null ? <span className={classGreen}>{checkForDecimalAndNull(NewCC, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const OldcostFormatter = (props) => {

        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // if (!row.NetCC || Number(row.NetCC) === Number(row.NetCC) || row.NetCC === '') return ''
        const NetCC = Number(row.NetCC) + checkForNull(row.RemainingFieldsTotal)
        const NetCost = Number(row.NetCC) + checkForNull(row.RemainingFieldsTotal)
        const classGreen = (NetCC > NetCost) ? 'red-value form-control' : (NetCC < NetCost) ? 'green-value form-control' : 'form-class'
        return row.NetCC != null ? checkForDecimalAndNull(NetCC, getConfigurationKey().NoOfDecimalForPrice) : ''


        // const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        // const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // // if (!row.NewCC || Number(row.NetCC) === Number(row.NewCC) || row.NewCC === '') return ''
        // const NetCost = Number(row.NetCC) + checkForNull(row.RemainingFieldsTotal)
        // return row.NetCC != null ? checkForDecimalAndNull(NetCost, getConfigurationKey().NoOfDecimalForPrice) : ''
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

    const onRowSelect = () => {
        var selectedRows = gridApi.getSelectedRows();
        setSelectedRowData(selectedRows)
    }
    let obj = {}
    const verifySimulation = debounce(() => {
        /**********CONDITION FOR: IS ANY FIELD EDITED****************/

        let ccCount = 0
        let tempData = dummyData
        let arr = []
        tempData && tempData.map((li, index) => {
            if (Number(li.NetCC) === Number(li.NewCC) || li?.NewCC === undefined) {
                ccCount = ccCount + 1
            } else {
                li.NewTotal = Number(li.NewCC ? li.NewCC : li.NetCC) + checkForNull(li.RemainingFieldsTotal)

                arr.push(li)
            }
            return null;
        })
        if (ccCount === tempData.length) {
            toastr.warning('There is no changes in new value.Please correct the data ,then run simulation')
            return false
        }
        /**********POST METHOD TO CALL HERE AND AND SEND TOKEN TO VERIFY PAGE ****************/
        obj.SimulationTechnologyId = selectedMasterForSimulation.value
        obj.LoggedInUserId = loggedInUserId()
        let tempArr = []
        // selectedRowData && selectedRowData.map(item => {
        //     let tempObj = {}
        //     tempObj.ExchangeRateId = item.ExchangeRateId
        //     tempObj.EffectiveDate = item.EffectiveDate
        //     tempObj.Currency = item.Currency
        //     tempObj.NewExchangeRate = item.CurrencyExchangeRate
        //     tempObj.Delta = 0
        //     tempArr.push(tempObj)
        //     return null;
        // })
        obj.SimulationCombinedProcess = arr

        setTableData(obj)

        dispatch(runVerifyCombinedProcessSimulation(obj, res => {
            if (res.data.Result) {
                setToken(res.data.Identity)
                setShowVerifyPage(true)
            }
        }))
        setShowVerifyPage(true)           //  for comdition remove
    }, 500);

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
                        <form>

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
                                                rowData={dummyData}
                                                pagination={true}
                                                paginationPageSize={10}
                                                onGridReady={onGridReady}
                                                gridOptions={gridOptions}
                                                // loadingOverlayComponent={'customLoadingOverlay'}
                                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                                noRowsOverlayComponentParams={{
                                                    title: CONSTANT.EMPTY_DATA,
                                                }}
                                                frameworkComponents={frameworkComponents}
                                                stopEditingWhenCellsLoseFocus={true}
                                                rowSelection={'multiple'}
                                                // frameworkComponents={frameworkComponents}
                                                onSelectionChanged={onRowSelect}
                                            >
                                                <AgGridColumn field="Technology" editable='false' headerName="Technology" minWidth={190}></AgGridColumn>
                                                <AgGridColumn field="Plant" editable='false' headerName="Plant" minWidth={190}></AgGridColumn>
                                                <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Net CC" marryChildren={true} >
                                                    <AgGridColumn width={120} field="NetCC" editable='false' headerName="Old" cellRenderer='oldCPFormatter' colId="NetCC"></AgGridColumn>
                                                    <AgGridColumn width={120} cellRenderer='newCPFormatter' editable={true} field="NewCC" headerName="New" colId='NewCC'></AgGridColumn>
                                                </AgGridColumn>
                                                <AgGridColumn field="RemainingFieldsTotal" editable='false' headerName="Remaining Fields Total" minWidth={190}></AgGridColumn>
                                                <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Total" marryChildren={true} >
                                                    <AgGridColumn width={120} cellRenderer='OldcostFormatter' valueGetter='Number(data.NetCC) + Number(data.RemainingFieldsTotal)' field="Total" editable='false' headerName="Old" cellRenderer='oldCPFormatter' colId="Total"></AgGridColumn>
                                                    <AgGridColumn width={120} cellRenderer='NewcostFormatter' valueGetter='data.NewCC + Number(data.RemainingFieldsTotal)' field="NewTotal" headerName="New" colId='NewTotal'></AgGridColumn>
                                                </AgGridColumn>
                                                <AgGridColumn field="EffectiveDate" headerName="Effective Date" editable='false' minWidth={190} cellRenderer='effectiveDateRenderer'></AgGridColumn>
                                                {/* <AgGridColumn field="DisplayStatus" headerName="Status" floatingFilter={false} cellRenderer='statusFormatter'></AgGridColumn> */}

                                                {/* <AgGridColumn field="EffectiveDate" headerName="Effective Date" editable='false' minWidth={190} cellRenderer='effectiveDateRenderer'></AgGridColumn> */}
                                                <AgGridColumn field="CombinedProcessId" hide={true}></AgGridColumn>

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
                    <OtherVerifySimulation isCombinedProcess={true} master={selectedMasterForSimulation} token={token} cancelVerifyPage={cancelVerifyPage} list={tableData} />
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