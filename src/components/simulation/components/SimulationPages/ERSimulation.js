import React, { useEffect, useState } from 'react';
import { Row, Col, } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import moment from 'moment';
import { CONSTANT } from '../../../../helper/AllConastant';
import NoContentFound from '../../../common/NoContentFound';
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId } from '../../../../helper';
import { GridTotalFormate } from '../../../common/TableGridFunctions';
import { toastr } from 'react-redux-toastr';
import { runVerifySimulation } from '../../actions/Simulation';
import { Fragment } from 'react';
import { TextFieldHookForm } from '../../../layout/HookFormInputs';
import { useForm, Controller, useWatch } from 'react-hook-form'
import RunSimulationDrawer from '../RunSimulationDrawer';
import VerifySimulation from '../VerifySimulation';
import { useDispatch, useSelector } from 'react-redux';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import Simulation from '../Simulation';

const gridOptions = {

};
function ERSimulation(props) {
    const { isDomestic, list, isbulkUpload, rowCount, technology, master } = props
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

    const newBasicRateFormatter = (props) => {
        console.log('props: ', props);
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        // let tempData = {...row,NewBasicRate:cell && value ? Number(cell) : Number(row.BasicRate)}
        // list = Object.assign([...list], { [index]: tempData })
        const value = beforeSaveCell(cell)
        return (
            <>
                <span className={`${!isbulkUpload ? 'form-control' : ''}`} >{cell && value ? Number(cell) : Number(row.CurrencyExchangeRate)} </span>
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
        newBasicRateFormatter: newBasicRateFormatter,
    };

    const verifySimulation = () => {
        // let basicRateCount = 0
        // let basicScrapCount = 0

        // list && list.map((li) => {
        //     console.log('li: ', li);
        //     if (Number(li.BasicRate) === Number(li.NewBasicRate) || li?.NewBasicRate === undefined) {

        //         basicRateCount = basicRateCount + 1
        //     }
        //     if (Number(li.ScrapRate) === Number(li.NewScrapRate) || li?.NewScrapRate === undefined) {
        //         basicScrapCount = basicScrapCount + 1
        //     }
        //     return null;
        // })

        // if (basicRateCount === list.length && basicScrapCount === list.length) {
        //     toastr.warning('There is no changes in new value.Please correct the data ,then run simulation')
        //     return false
        // }
        // basicRateCount = 0
        // basicScrapCount = 0
        // // setShowVerifyPage(true)
        // /**********POST METHOD TO CALL HERE AND AND SEND TOKEN TO VERIFY PAGE TODO ****************/
        // let obj = {}
        // obj.Technology = technology
        // obj.SimulationTechnologyId = selectedMasterForSimulation.value
        // obj.Vendor = list[0].VendorName
        // obj.Masters = master
        // obj.LoggedInUserId = loggedInUserId()
        // obj.VendorId = list[0].VendorId
        // obj.TechnologyId = list[0].TechnologyId
        // obj.VendorId = list[0].VendorId
        // if (filteredRMData.plantId && filteredRMData.plantId.value) {
        //     obj.PlantId = filteredRMData.plantId ? filteredRMData.plantId.value : ''
        // }
        // let tempArr = []
        // list && list.map(item => {
        //     if ((item.NewBasicRate !== undefined || item.NewScrapRate !== undefined) && ((item.NewBasicRate !== undefined ? Number(item.NewBasicRate) : Number(item.BasicRate)) !== Number(item.BasicRate) || (item.NewScrapRate !== undefined ? Number(item.NewScrapRate) : Number(item.ScrapRate)) !== Number(item.ScrapRate))) {
        //         let tempObj = {}
        //         tempObj.CostingHead = item.CostingHead
        //         tempObj.RawMaterialName = item.RawMaterial
        //         tempObj.MaterialType = item.MaterialType
        //         tempObj.RawMaterialGrade = item.RMGrade
        //         tempObj.RawMaterialSpecification = item.RMSpec
        //         tempObj.RawMaterialCategory = item.Category
        //         tempObj.UOM = item.UOM
        //         tempObj.OldBasicRate = item.BasicRate
        //         tempObj.NewBasicRate = item.NewBasicRate ? item.NewBasicRate : item.BasicRate
        //         tempObj.OldScrapRate = item.ScrapRate
        //         tempObj.NewScrapRate = item.NewScrapRate ? item.NewScrapRate : item.ScrapRate
        //         tempObj.RawMaterialFreightCost = checkForNull(item.RMFreightCost)
        //         tempObj.RawMaterialShearingCost = checkForNull(item.RMShearingCost)
        //         tempObj.OldNetLandedCost = item.NetLandedCost
        //         tempObj.NewNetLandedCost = Number(item.NewBasicRate ? item.NewBasicRate : item.BasicRate) + checkForNull(item.RMShearingCost) + checkForNull(item.RMFreightCost)
        //         tempObj.EffectiveDate = item.EffectiveDate
        //         tempObj.RawMaterialId = item.RawMaterialId
        //         tempObj.PlantId = item.PlantId
        //         tempObj.Delta = 0
        //         tempArr.push(tempObj)
        //     }
        //     return null;
        // })
        // obj.SimulationRawMaterials = tempArr

        // dispatch(runVerifySimulation(obj, res => {

        //     if (res.data.Result) {
        //         setToken(res.data.Identity)
        //         setShowVerifyPage(true)
        //     }
        // }))
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
                                            <AgGridColumn field="Currency" editable='false' headerName="Currency"></AgGridColumn>
                                            <AgGridColumn field="BankRate" editable='false' headerName="Bank Rate(INR)"></AgGridColumn>
                                            <AgGridColumn suppressSizeToFit="true" editable='false' field="BankCommissionPercentage" headerName="Bank Commission % "></AgGridColumn>
                                            <AgGridColumn field="CustomRate" editable='false' headerName="Custom Rate(INR)"></AgGridColumn>
                                            {/* <AgGridColumn suppressSizeToFit="true" field="CurrencyExchangeRate" headerName="Exchange Rate(INR)"></AgGridColumn> */}
                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Exchange Rate (INR)" marryChildren={true} >
                                                <AgGridColumn width={120} field="CurrencyExchangeRate" editable='false' headerName="Old" colId="CurrencyExchangeRate"></AgGridColumn>
                                                <AgGridColumn width={120} cellRenderer='newBasicRateFormatter' field="NewCurrencyExchangeRate" headerName="New" colId='NewCurrencyExchangeRate'></AgGridColumn>
                                            </AgGridColumn>
                                            <AgGridColumn field="EffectiveDate" headerName="Effective Date" editable='false' cellRenderer='effectiveDateRenderer'></AgGridColumn>
                                            <AgGridColumn suppressSizeToFit="true" field="DateOfModification" editable='false' headerName="Date of Modification" cellRenderer='effectiveDateRenderer'></AgGridColumn>

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
                    </Fragment>

                }
                {
                    showverifyPage &&
                    <VerifySimulation token={token} cancelVerifyPage={cancelVerifyPage} />
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