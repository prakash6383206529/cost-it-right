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
import { data } from 'jquery';
import Simulation from '../Simulation';
import { VBC, ZBC } from '../../../../config/constants';
const gridOptions = {

};


function RMSimulation(props) {
    const { isDomestic, list, isbulkUpload, rowCount, technology, master, isImpactedMaster,costingAndPartNo } = props
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
    useEffect(() => {
        if (isbulkUpload) {
            setValue('NoOfCorrectRow', rowCount.correctRow)
            setValue('NoOfRowsWithoutChange', rowCount.NoOfRowsWithoutChange)
        }
    }, [])

    const verifySimulation = () => {
        let basicRateCount = 0
        let basicScrapCount = 0

        list && list.map((li) => {
            if (Number(li.BasicRate) === Number(li.NewBasicRate) || li?.NewBasicRate === undefined) {

                basicRateCount = basicRateCount + 1
            }
            if (Number(li.ScrapRate) === Number(li.NewScrapRate) || li?.NewScrapRate === undefined) {
                basicScrapCount = basicScrapCount + 1
            }
            return null;
        })

        if (basicRateCount === list.length && basicScrapCount === list.length) {
            toastr.warning('There is no changes in new value.Please correct the data ,then run simulation')
            return false
        }
        basicRateCount = 0
        basicScrapCount = 0
        // setShowVerifyPage(true)
        /**********POST METHOD TO CALL HERE AND AND SEND TOKEN TO VERIFY PAGE TODO ****************/
        let obj = {}
        obj.Technology = technology
        obj.SimulationTechnologyId = selectedMasterForSimulation.value
        obj.CostingHead = list[0].CostingHead === 'Vendor Based' ? VBC : ZBC
        obj.Masters = master
        obj.LoggedInUserId = loggedInUserId()

        obj.TechnologyId = list[0].TechnologyId

        if (filteredRMData.plantId && filteredRMData.plantId.value) {
            obj.PlantId = filteredRMData.plantId ? filteredRMData.plantId.value : ''
        }
        let tempArr = []
        list && list.map(item => {
            if ((item.NewBasicRate !== undefined || item.NewScrapRate !== undefined) && ((item.NewBasicRate !== undefined ? Number(item.NewBasicRate) : Number(item.BasicRate)) !== Number(item.BasicRate) || (item.NewScrapRate !== undefined ? Number(item.NewScrapRate) : Number(item.ScrapRate)) !== Number(item.ScrapRate))) {
                let tempObj = {}
                tempObj.CostingHead = item.CostingHead === 'Vendor Based' ? VBC : ZBC
                tempObj.RawMaterialName = item.RawMaterial
                tempObj.MaterialType = item.MaterialType
                tempObj.RawMaterialGrade = item.RMGrade
                tempObj.RawMaterialSpecification = item.RMSpec
                tempObj.RawMaterialCategory = item.Category
                tempObj.UOM = item.UOM
                tempObj.OldBasicRate = item.BasicRate
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
        obj.SimulationRawMaterials = tempArr

        dispatch(runVerifySimulation(obj, res => {

            if (res.data.Result) {
                setToken(res.data.Identity)
                setShowVerifyPage(true)
            }
        }))
    }

    const cancelVerifyPage = () => {

        setShowVerifyPage(false)
    }


    /**
     * @method shearingCostFormatter
     * @description Renders buttons
     */
    const shearingCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        return cell != null ? cell : '-';
    }

    /**
    * @method freightCostFormatter
    * @description Renders buttons
    */
    const freightCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        return cell != null ? cell : '-';
    }


    const effectiveDateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        return cell != null ? moment(cell).format('DD/MM/YYYY') : '';
    }


    const costingHeadFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        return (cell === true || cell === 'Vendor Based') ? 'Vendor Based' : 'Zero Based';
    }

    const newBasicRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        Number(row.NewBasicRate) :
                        <span className={`${!isbulkUpload ? 'form-control' : ''}`} >{cell && value ? Number(cell) : Number(row.BasicRate)} </span>
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
                        <span className={`${!isbulkUpload ? 'form-control' : ''}`} >{cell && value ? Number(cell) : Number(row.BasicRate)} </span>
                }

            </>
        )
    }


    const newScrapRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const value = beforeSaveCell(cell)
        return (
            <>
                {
                    isImpactedMaster ?
                        row.NewScrapRate :
                        <span className={`${!isbulkUpload ? 'form-control' : ''}`} >{cell && value ? Number(cell) : Number(row.ScrapRate)}</span>
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
                        <span className={`${!isbulkUpload ? 'form-control' : ''}`} >{cell && value ? Number(cell) : Number(row.ScrapRate)}</span>
                }
            </>
        )
    }

    // const colorCheck = 

    const costFormatter = (props) => {

        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        if (!row.NewBasicRate || row.BasicRate === row.NewBasicRate || row.NewBasicRate === '') return checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)
        const tempA = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost);
        const classGreen = (tempA > row.NetLandedCost) ? 'red-value form-control' : (tempA < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const renderPaginationShowsTotal = (start, to, total) => {
        return <GridTotalFormate start={start} to={to} total={total} />
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

    const afterSaveCell = (row, cellName, cellValue, index) => {

        if ((Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost)) > row.NetLandedCost) {
            setColorClass('red-value form-control')
        } else if ((Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost)) < row.NetLandedCost) {
            setColorClass('green-value form-control')
        } else {
            setColorClass('form-class')
        }
        return false

    }

    const NewcostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        if (!row.NewBasicRate || Number(row.BasicRate) === Number(row.NewBasicRate) || row.NewBasicRate === '') return ''
        const NewBasicRate = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost)
        const classGreen = (NewBasicRate > row.NetLandedCost) ? 'red-value form-control' : (NewBasicRate < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
        return row.NewBasicRate != null ? <span className={classGreen}>{checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
        // checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)
    }


    const runSimulation = () => {
        let basicRateCount = 0
        let basicScrapCount = 0
        list && list.map((li) => {
            if (li.BasicRate === li.NewBasicRate) {
                basicRateCount = basicRateCount + 1
            }
            if (li.ScrapRate === li.NewScrapRate) {
                basicScrapCount = basicScrapCount + 1
            }

            if (basicRateCount === list.length || basicScrapCount === list.length) {
                toastr.warning('There is no changes in new value.Please correct the data ,then run simulation')
            } else {
                setShowRunSimulationDrawer(true)
            }

        })
    }

    const options = {
        clearSearch: true,
        noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
        paginationShowsTotal: renderPaginationShowsTotal(),
        prePage: <span className="prev-page-pg"></span>, // Previous page button text
        nextPage: <span className="next-page-pg"></span>, // Next page button text
        firstPage: <span className="first-page-pg"></span>, // First page button text
        lastPage: <span className="last-page-pg"></span>,

    };

    const cancel = () => {
        // props.cancelEditPage()
        setShowMainSimulation(true)
    }
    const cellEditProp = {
        mode: 'click',
        blurToSave: true,
        beforeSaveCell: beforeSaveCell,
        afterSaveCell: afterSaveCell,
    };

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
        // window.screen.width >= 1600 && params.api.sizeColumnsToFit()
        params.api.paginationGoToPage(0);
    };

    const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }
    const cellChange = (props) => {
    }
    const frameworkComponents = {
        effectiveDateFormatter: effectiveDateFormatter,
        costingHeadFormatter: costingHeadFormatter,
        shearingCostFormatter: shearingCostFormatter,
        freightCostFormatter: freightCostFormatter,
        newScrapRateFormatter: newScrapRateFormatter,
        NewcostFormatter: NewcostFormatter,
        costFormatter: costFormatter,
        customNoRowsOverlay: NoContentFound,
        newBasicRateFormatter: newBasicRateFormatter,
        cellChange: cellChange,
        oldBasicRateFormatter: oldBasicRateFormatter,
        oldScrapRateFormatter: oldScrapRateFormatter,
    };




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
                                            {
                                                !isImpactedMaster &&
                                                <AgGridColumn width={140} field="CostingHead" headerName="Costing Head" editable='false' cellRenderer={'costingHeadFormatter'}></AgGridColumn>
                                            }
                                            <AgGridColumn width={140} field="RawMaterial" editable='false' headerName="Raw Material"></AgGridColumn>
                                            <AgGridColumn width={115} field="RMGrade" editable='false' headerName="RM Grade" ></AgGridColumn>
                                            <AgGridColumn width={115} field="RMSpec" editable='false' headerName="RM Spec"></AgGridColumn>
                                            <AgGridColumn width={115} field="RawMaterialCode" headerName='Code' cellRenderer='hyphenFormatter'></AgGridColumn>
                                            <AgGridColumn width={110} field="Category" editable='false' headerName="Category"></AgGridColumn>
                                            <AgGridColumn width={125} field="TechnologyName" editable='false' headerName="Technology" ></AgGridColumn>
                                            <AgGridColumn width={100} field="VendorName" editable='false' headerName="Vendor"></AgGridColumn>
                                            <AgGridColumn width={100} field="UOM" editable='false' headerName="UOM"></AgGridColumn>

                                            {costingAndPartNo && <AgGridColumn field="CostingNumber" headerName="Costing No" minWidth={190}></AgGridColumn>}
                                            {costingAndPartNo && <AgGridColumn field="PartNumber" headerName="Part No" minWidth={190}></AgGridColumn>}


                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Basic Rate (INR)" marryChildren={true} >
                                                <AgGridColumn width={120} field="BasicRate" editable='false' headerName="Old" cellRenderer='oldBasicRateFormatter' colId="BasicRate"></AgGridColumn>
                                                <AgGridColumn width={120} cellRenderer='newBasicRateFormatter' onCellValueChanged='cellChange' field="NewBasicRate" headerName="New" colId='NewBasicRate'></AgGridColumn>
                                            </AgGridColumn>
                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} marryChildren={true} headerName="Scrap Rate (INR)">
                                                <AgGridColumn width={120} field="ScrapRate" editable='false' cellRenderer='oldScrapRateFormatter' headerName="Old" colId="ScrapRate" ></AgGridColumn>
                                                <AgGridColumn width={120} cellRenderer={'newScrapRateFormatter'} field="NewScrapRate" headerName="New" colId="NewScrapRate"></AgGridColumn>
                                            </AgGridColumn>
                                            {/* <AgGridColumn width={150} field="RMFreightCost" editable='false' cellRenderer={'freightCostFormatter'} headerName="RM Freight Cost"></AgGridColumn>
                                            <AgGridColumn width={170} field="RMShearingCost" editable='false' cellRenderer={'shearingCostFormatter'} headerName="RM Shearing Cost" ></AgGridColumn> */}
                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={200} headerName="Net Cost (INR)">
                                                <AgGridColumn width={100} field="NetLandedCost" editable='false' cellRenderer={'costFormatter'} headerName="Old" colId='NetLandedCost'></AgGridColumn>
                                                <AgGridColumn width={100} field="NewNetLandedCost" editable='false' valueGetter='data.NewBasicRate + data.RMFreightCost+data.RMShearingCost' cellRenderer={'NewcostFormatter'} headerName="New" colId='NewNetLandedCost'></AgGridColumn>
                                            </AgGridColumn>
                                            <AgGridColumn width={140} field="EffectiveDate" editable='false' cellRenderer={'effectiveDateFormatter'} headerName="Effective Date" ></AgGridColumn>
                                            <AgGridColumn field="RawMaterialId" hide></AgGridColumn>

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
                        masterId={master}
                    />
                }
            </div>
        </div>
    );
}

export default RMSimulation;