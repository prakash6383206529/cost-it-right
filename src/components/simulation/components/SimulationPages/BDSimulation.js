import React, { useEffect, useState } from 'react';
import { Row, Col, } from 'reactstrap';
import DayTime from '../../../common/DayTimeWrapper'
import { EMPTY_DATA } from '../../../../config/constants';
import NoContentFound from '../../../common/NoContentFound';
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId } from '../../../../helper';
import Toaster from '../../../common/Toaster';
import { runVerifyBoughtOutPartSimulation } from '../../actions/Simulation';
import { Fragment } from 'react';
import { TextFieldHookForm } from '../../../layout/HookFormInputs';
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

const gridOptions = {

};


function BDSimulation(props) {
    const { list, isbulkUpload, rowCount, isImpactedMaster, tokenForMultiSimulation } = props
    const [showRunSimulationDrawer, setShowRunSimulationDrawer] = useState(false)
    const [showverifyPage, setShowVerifyPage] = useState(false)
    const [token, setToken] = useState('')
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [showMainSimulation, setShowMainSimulation] = useState(false)

    const { register, control, setValue, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })



    const dispatch = useDispatch()

    const { selectedMasterForSimulation, selectedTechnologyForSimulation } = useSelector(state => state.simulation)

    useEffect(() => {
        if (isbulkUpload) {
            setValue('NoOfCorrectRow', rowCount.correctRow)
            setValue('NoOfRowsWithoutChange', rowCount.NoOfRowsWithoutChange)
        }
    }, [])

    const verifySimulation = debounce(() => {
        let basicRateCount = 0

        list && list.map((li) => {

            if (Number(li.BasicRate) === Number(li.NewBasicRate) || li?.NewBasicRate === undefined) {

                basicRateCount = basicRateCount + 1
            }

            return null;
        })

        if (basicRateCount === list.length) {
            Toaster.warning('There is no changes in new value. Please correct the data, then run simulation')
            return false
        }
        basicRateCount = 0
        // setShowVerifyPage(true)
        /**********POST METHOD TO CALL HERE AND AND SEND TOKEN TO VERIFY PAGE TODO ****************/
        let obj = {}
        obj.SimulationTechnologyId = selectedMasterForSimulation.value
        obj.CostingHead = ((isbulkUpload ? list[0].CostingHead : list[0].IsVendor) === 'Vendor Based') ? VBC : ZBC
        obj.LoggedInUserId = loggedInUserId()
        obj.TechnologyId = selectedTechnologyForSimulation.value
        obj.TechnologyName = selectedTechnologyForSimulation.label
        // if (filteredRMData.plantId && filteredRMData.plantId.value) {
        //     obj.PlantId = filteredRMData.plantId ? filteredRMData.plantId.value : ''
        // }
        let tempArr = []
        list && list.map(item => {
            if (item.NewBasicRate !== undefined ? Number(item.NewBasicRate) : Number(item.BasicRate)) {
                let tempObj = {}
                tempObj.BoughtOutPartId = item.BoughtOutPartId
                tempObj.OldBOPCost = item.BasicRate
                tempObj.NewBOPCost = item.NewBasicRate
                tempObj.OldNetLandedCost = Number(item.BasicRate) / Number(item.NumberOfPieces)
                tempObj.NewNetLandedCost = Number(item.NewBasicRate) / Number(item.NumberOfPieces)
                tempArr.push(tempObj)
            }
            return null;
        })

        obj.SimulationIds = tokenForMultiSimulation
        obj.SimulationBoughtOutPart = tempArr

        dispatch(runVerifyBoughtOutPartSimulation(obj, res => {

            if (res.data.Result) {
                setToken(res.data.Identity)
                setShowVerifyPage(true)
            }
        }))
    }, 500)


    const cancelVerifyPage = () => {
        setShowVerifyPage(false)
    }

    const effectiveDateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        return cell != null ? DayTime(cell).format('DD/MM/YYYY') : '';
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
                        Number(row.NewBOPRate) :
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
                        row.OldBOPRate :
                        <span className={`${!isbulkUpload ? 'form-control' : ''}`} >{cell && value ? Number(cell) : Number(row.BasicRate)} </span>
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
        } else if (cellValue && !/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/.test(cellValue)) {
            Toaster.warning('Please enter a valid positive numbers.')
            return false
        }
        return true
    }

    const NewcostFormatter = (props) => {
        const row = props?.data;
        if (isImpactedMaster) {
            return row.NewNetBoughtOutPartCost
        } else {
            if (!row.NewBasicRate || Number(row.BasicRate) === Number(row.NewBasicRate) || row.NewBasicRate === '') return ''
            const NewBasicRate = Number(row.NewBasicRate) / Number(row.NumberOfPieces)
            const classGreen = (NewBasicRate > row.NetLandedCost) ? 'red-value form-control' : (NewBasicRate < row.NetLandedCost) ? 'green-value form-control' : 'form-class'


            return row.NewBasicRate != null ? <span className={classGreen}>{checkForDecimalAndNull(Number(row.NewBasicRate) / Number(row.NumberOfPieces), getConfigurationKey().NoOfDecimalForPrice)}            </span> : ''

        }
    }

    const OldcostFormatter = (props) => {
        const row = props?.data;
        if (isImpactedMaster) {
            return row.OldNetBoughtOutPartCost
        } else {
            if (!row.BasicRate || row.BasicRate === '') return ''
            const BasicRate = Number(row.BasicRate) / Number(row.NumberOfPieces)
            const classGreen = (BasicRate > row.NetLandedCost) ? 'red-value form-control' : (BasicRate < row.NetLandedCost) ? 'green-value form-control' : 'form-class'


            return row.BasicRate != null ? <span className={classGreen}>{checkForDecimalAndNull(Number(row.BasicRate) / Number(row.NumberOfPieces), getConfigurationKey().NoOfDecimalForPrice)}            </span> : ''

        }
    }


    const runSimulation = () => {
        let basicRateCount = 0
        list && list.map((li) => {
            if (li.BasicRate === li.NewBasicRate) {
                basicRateCount = basicRateCount + 1
            }

            if (basicRateCount === list.length) {
                Toaster.warning('There is no changes in new value. Please correct the data, then run simulation')
            } else {
                setShowRunSimulationDrawer(true)
            }

        })
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
        window.screen.width >= 1600 && params.api.sizeColumnsToFit();
        if (isImpactedMaster) {
            window.screen.width >= 1365 && params.api.sizeColumnsToFit();
        }
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
        effectiveDateRenderer: effectiveDateFormatter,
        costingHeadFormatter: costingHeadFormatter,
        NewcostFormatter: NewcostFormatter,
        OldcostFormatter: OldcostFormatter,
        costFormatter: costFormatter,
        customNoRowsOverlay: NoContentFound,
        newBasicRateFormatter: newBasicRateFormatter,
        cellChange: cellChange,
        oldBasicRateFormatter: oldBasicRateFormatter,
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
                            <Col className={`add-min-height mb-3 sm-edit-page  ${list && list?.length <= 0 ? "overlay-contain" : ""}`}>
                                <div className="ag-grid-wrapper height-width-wrapper">
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
                                                title: EMPTY_DATA,
                                            }}
                                            frameworkComponents={frameworkComponents}
                                            stopEditingWhenCellsLoseFocus={true}
                                        >
                                            {/* <AgGridColumn field="Technologies" editable='false' headerName="Technology" minWidth={190}></AgGridColumn> */}
                                            <AgGridColumn field="BoughtOutPartNumber" editable='false' headerName="BOP Part No" minWidth={190}></AgGridColumn>
                                            <AgGridColumn field="BoughtOutPartName" editable='false' headerName="BOP Part Name" minWidth={190}></AgGridColumn>
                                            {!isImpactedMaster && <AgGridColumn field="BoughtOutPartCategory" editable='false' headerName="BOP Category" minWidth={190}></AgGridColumn>}
                                            {!isImpactedMaster && <AgGridColumn field="Vendor" editable='false' headerName="Vendor" minWidth={190}></AgGridColumn>}
                                            {!isImpactedMaster && <AgGridColumn field="DestinationPlant" editable='false' headerName="DestinationPlant" minWidth={190}></AgGridColumn>}

                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Basic Rate (INR)" marryChildren={true} >
                                                <AgGridColumn width={120} field="BasicRate" editable='false' headerName="Old" cellRenderer='oldBasicRateFormatter' colId="BasicRate"></AgGridColumn>
                                                <AgGridColumn width={120} cellRenderer='newBasicRateFormatter' editable={!isImpactedMaster} onCellValueChanged='cellChange' field="NewBasicRate" headerName="New" colId='NewBasicRate'></AgGridColumn>
                                            </AgGridColumn>

                                            <AgGridColumn headerClass="justify-content-center" cellClass="text-center" width={240} headerName="Net Cost (INR)">
                                                {/* {!isImpactedMaster &&<AgGridColumn width={120} field="OldNetLandedCost" editable='false' cellRenderer={'OldcostFormatter'} headerName="Old" colId='NetLandedCost'></AgGridColumn>} */}
                                                <AgGridColumn width={120} field="OldNetLandedCost" editable='false' cellRenderer={'OldcostFormatter'} headerName="Old" colId='NetLandedCost'></AgGridColumn>
                                                <AgGridColumn width={120} field="NewNetLandedCost" editable='false' valueGetter='data.NewBasicRate/data.NumberOfPieces' cellRenderer={'NewcostFormatter'} headerName="New" colId='NewNetLandedCost'></AgGridColumn>
                                            </AgGridColumn>

                                            <AgGridColumn field="EffectiveDate" headerName="Effective Date" editable='false' minWidth={190} cellRenderer='effectiveDateRenderer'></AgGridColumn>
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
                    />
                }
            </div>
        </div>
    );
}


export default BDSimulation;