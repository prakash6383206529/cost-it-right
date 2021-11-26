import React, { useEffect, useState } from 'react';
import { Row, Col, } from 'reactstrap';
import moment from 'moment';
import { EMPTY_DATA } from '../../../../config/constants';
import NoContentFound from '../../../common/NoContentFound';
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId } from '../../../../helper';
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
import OtherVerifySimulation from '../OtherVerifySimulation';
import debounce from 'lodash.debounce';
import { TextFieldHookForm } from '../../../layout/HookFormInputs';
import { VBC, ZBC } from '../../../../config/constants';
import { runVerifySurfaceTreatmentSimulation } from '../../actions/Simulation';
import VerifySimulation from '../VerifySimulation';

const gridOptions = {

};
function OperationSTSimulation(props) {
    const { list, isbulkUpload, rowCount, isImpactedMaster, isOperation } = props
    const [showRunSimulationDrawer, setShowRunSimulationDrawer] = useState(false)
    const [showverifyPage, setShowVerifyPage] = useState(false)
    const [token, setToken] = useState('')
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [showMainSimulation, setShowMainSimulation] = useState(false)
    const [selectedRowData, setSelectedRowData] = useState([]);
    const [tableData, setTableData] = useState([])


    const { register, control, setValue, formState: { errors }, } = useForm({
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
                        Number(row.OldNetCC) :
                        <span className={`${!isbulkUpload ? 'form-control' : ''}`} >{cell && value ? Number(cell) : Number(row.ConversionCost)} </span>
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
                        row.NewRate :
                        <span className={`${true ? 'form-control' : ''}`} >{cell && value ? Number(cell) : Number(row.Rate)} </span>
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
        if (!row.NewRate || Number(row.ConversionCost) === Number(row.NewRate) || row.NewRate === '') return ''
        const NewRate = Number(row.NewRate) + checkForNull(row.RemainingTotal)
        const NetCost = Number(row.ConversionCost) + checkForNull(row.RemainingTotal)
        const classGreen = (NewRate > NetCost) ? 'red-value form-control' : (NewRate < NetCost) ? 'green-value form-control' : 'form-class'
        return row.NewRate != null ? <span className={classGreen}>{checkForDecimalAndNull(NewRate, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const OldcostFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const ConversionCost = Number(row.ConversionCost) + checkForNull(row.RemainingTotal)
        return row.ConversionCost != null ? checkForDecimalAndNull(ConversionCost, getConfigurationKey().NoOfDecimalForPrice) : ''
    }

    const frameworkComponents = {
        effectiveDateRenderer: effectiveDateFormatter,
        costFormatter: costFormatter,
        customNoRowsOverlay: NoContentFound,
        newRateFormatter: newRateFormatter,
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
        let tempData = list
        let arr = []
        tempData && tempData.map((li, index) => {

            if (Number(li.Rate) === Number(li.NewRate) || li?.NewRate === undefined) {
                ccCount = ccCount + 1
            } else {

                li.NewTotal = Number(li.NewRate ? li.NewRate : li.Rate) + checkForNull(li.RemainingTotal)

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

        let tempArr = []
        arr && arr.map(item => {
            let tempObj = {}
            tempObj.CostingId = item.CostingId
            tempObj.OldNetCC = item.ConversionCost
            tempObj.NewNetCC = item.NewRate
            tempObj.RemainingTotal = item.RemainingTotal
            tempObj.OldTotalCost = item.TotalCost
            tempObj.NewTotalCost = item.NewTotal
            tempArr.push(tempObj)
            return null
        })
        obj.SimulationCombinedProcess = tempArr
        dispatch(runVerifySurfaceTreatmentSimulation(obj, res => {
            if (res.data.Result) {
                setToken(res.data.Identity)
                setShowVerifyPage(true)
            }
        }))
        setShowVerifyPage(true)
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
                                                <AgGridColumn field="Technology" editable='false' headerName="Technology" minWidth={190}></AgGridColumn>
                                                <AgGridColumn field="OperationCode" editable='false' headerName="Operation Code" minWidth={190}></AgGridColumn>
                                                <AgGridColumn field="OperationName" editable='false' headerName="Operation Name" minWidth={190}></AgGridColumn>
                                                {isImpactedMaster && <AgGridColumn field="PartNo" editable='false' headerName="Part No" minWidth={190}></AgGridColumn>}
                                                {
                                                    !isImpactedMaster &&
                                                    <>
                                                        <AgGridColumn field="DestinationPlant" editable='false' headerName="Plant" minWidth={190}></AgGridColumn>

                                                    </>
                                                }
                                                <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Net Rate" marryChildren={true} >
                                                    <AgGridColumn width={120} field="Rate" editable='false' headerName="Old" cellRenderer='oldCPFormatter' colId="Rate"></AgGridColumn>
                                                    <AgGridColumn width={120} cellRenderer='newRateFormatter' editable={true} field="NewRate" headerName="New" colId='NewRate'></AgGridColumn>
                                                </AgGridColumn>
                                                {/* {!isImpactedMaster && <AgGridColumn field="RemainingTotal" editable='false' headerName="Remaining Fields Total" minWidth={190}></AgGridColumn>} */}
                                                {/* {
                                                    !isImpactedMaster &&
                                                    <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Total" marryChildren={true} >
                                                        <AgGridColumn width={120} cellRenderer='OldcostFormatter' valueGetter='Number(data.ConversionCost) + Number(data.RemainingTotal)' field="TotalCost" editable='false' headerName="Old" colId="Total"></AgGridColumn>
                                                        <AgGridColumn width={120} cellRenderer='NewcostFormatter' valueGetter='data.NewRate + Number(data.RemainingTotal)' field="NewTotal" headerName="New" colId='NewTotal'></AgGridColumn>
                                                    </AgGridColumn>
                                                } */}

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
                    <VerifySimulation isSurfaceTreatment={true} master={selectedMasterForSimulation.value} token={token} cancelVerifyPage={cancelVerifyPage} list={tableData} />
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
                        masterId={selectedMasterForSimulation.value}
                    />
                }
            </div>

        </div >
    );
}

export default OperationSTSimulation;