import React, { useEffect, useState, useRef, useContext } from 'react';
import { Row, Col, } from 'reactstrap';
import DayTime from '../../common/DayTimeWrapper'
import { CBCTypeId, EMPTY_DATA, VBCTypeId } from '../../../config/constants';
import NoContentFound from '../../common/NoContentFound';
import { checkForDecimalAndNull, checkForNull, getConfigurationKey, loggedInUserId } from '../../../helper';
import Toaster from '../../common/Toaster';
import { Fragment } from 'react';
import { TextFieldHookForm } from '../../layout/HookFormInputs';
import { useForm, Controller } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { debounce } from 'lodash'
import { draftSimulationMultiTechnology, getAllMultiTechnologyCostings } from '../actions/Simulation';
import RunSimulationDrawer from './RunSimulationDrawer';
import VerifySimulation from './VerifySimulation';
import DatePicker from "react-datepicker";
import { getMaxDate } from '../SimulationUtils';
import WarningMessage from '../../common/WarningMessage';
import { simulationContext } from '.';
import { screenWidth } from '../../../helper/core';

const gridOptions = {};

function AssemblySimulationListing(props) {
    const { showEditMaster, costingDrawerPage, handleEditMasterPage } = useContext(simulationContext) || {};

    const { isbulkUpload, isImpactedMaster, technology } = props
    const [showRunSimulationDrawer, setShowRunSimulationDrawer] = useState(false)
    const [showverifyPage, setShowVerifyPage] = useState(false)
    const [token, setToken] = useState('')
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const gridRef = useRef();
    const [isDisable, setIsDisable] = useState(false)
    const [selectedRowData, setSelectedRowData] = useState([])
    const { selectedVendorForSimulation } = useSelector(state => state.simulation)
    const { multiTechnologyCostinig } = useSelector(state => state.simulation)
    const [effectiveDate, setEffectiveDate] = useState({})
    const [isEffectiveDateSelected, setIsEffectiveDateSelected] = useState(false);
    const [isWarningMessageShow, setIsWarningMessageShow] = useState(false)
    const [maxDate, setMaxDate] = useState(false)
    const [popupMessage, setPopupMessage] = useState('There is no changes in scrap rate Do you want to continue')            //RE

    const { register, control, formState: { errors }, } = useForm({
        mode: 'onChange',
        reValidateMode: 'onChange',
    })

    const dispatch = useDispatch()

    const { selectedMasterForSimulation, selectedTechnologyForSimulation } = useSelector(state => state.simulation)

    useEffect(() => {
        let obj = {
            technologyId: technology?.value,
            vendorId: props?.isCustomer ? null : selectedVendorForSimulation?.value,
            costingTypeId: props?.costingHead?.value,
            customerId: props?.isCustomer ? selectedVendorForSimulation?.value : null,
            plantId: props?.plant?.value,
        }

        dispatch(getAllMultiTechnologyCostings(obj, (res) => { }))
    }, [])
    useEffect(() => {

        if (handleEditMasterPage) {
            handleEditMasterPage(showEditMaster, showverifyPage, costingDrawerPage)
        }
    }, [showverifyPage])
    useEffect(() => {
        if (multiTechnologyCostinig && multiTechnologyCostinig.length > 0) {
            window.screen.width >= 1920 && gridRef.current.api.sizeColumnsToFit();
            if (isImpactedMaster) {
                gridRef.current.api.sizeColumnsToFit();
            }
        }
    }, [multiTechnologyCostinig])

    useEffect(() => {
        if (multiTechnologyCostinig && multiTechnologyCostinig.length > 0) {
            if (isImpactedMaster) {
                window.screen.width >= 1600 && gridRef.current.api.sizeColumnsToFit();
            }
            window.screen.width >= 1921 && gridRef.current.api.sizeColumnsToFit();
            let maxDate = getMaxDate(multiTechnologyCostinig)
            setMaxDate(maxDate?.EffectiveDate)
            // setMaxDate(maxDate)            //RE
        }
    }, [multiTechnologyCostinig])

    const verifySimulation = debounce(() => {
        if (!isEffectiveDateSelected) {
            setIsWarningMessageShow(true)
            return false
        } if (selectedRowData?.length === 0) {
            Toaster.warning("Please select atleast one costing.")
            return false
        }
        let tempArray = []
        selectedRowData && selectedRowData?.map((item) => {
            let obj = {}
            obj.BaseCostingId = item?.BaseCostingId
            obj.POPrice = item?.POPrice
            tempArray.push(obj)
        })
        /**********POST METHOD TO CALL HERE AND AND SEND TOKEN TO VERIFY PAGE TODO ****************/
        let obj = {
            "MultiTechnologyCostings": tempArray,
            "TechnologyId": checkForNull(selectedTechnologyForSimulation?.value),
            "SimulationTechnologyId": checkForNull(selectedMasterForSimulation?.value),
            "EffectiveDate": DayTime(effectiveDate).format('YYYY-MM-DD HH:mm:ss'),
            "LoggedInUserId": loggedInUserId(),
            "SimulationHeadId": props?.costingHead?.value
        }

        dispatch(draftSimulationMultiTechnology(obj, res => {
            setIsDisable(false)

            if (res?.data?.Result) {
                setToken(res?.data?.Identity)
                setShowVerifyPage(true)
                props.cancelViewPage()
            }
        }))
        setShowVerifyPage(true)
    }, 600)

    const cancelVerifyPage = () => {
        setShowVerifyPage(false)
        setSelectedRowData([])
        setToken('')
        props?.showHide()
    }

    const effectiveDateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        return cell != null ? DayTime(cell).format('DD/MM/YYYY') : '';
    }

    const costingHeadFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cell === true || cell === 'Vendor Based') ? 'Vendor Based' : 'Zero Based';
    }

    const handleEffectiveDateChange = (date) => {
        setEffectiveDate(date)
        setIsEffectiveDateSelected(true)
        setIsWarningMessageShow(false)
    }

    const cancel = () => {
        props.cancelSimulationListingPage()
    }

    const closeDrawer = (e = '') => {
        setShowRunSimulationDrawer(false)
    }

    const isFirstColumn = (params) => {
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;
        if (props?.isMasterSummaryDrawer) {
            return false
        } else {
            return thisIsFirstColumn;
        }
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
        editable: true,
        headerCheckboxSelection: isFirstColumn,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: isFirstColumn
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);
        gridRef.current.api.sizeColumnsToFit();
    };

    const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const onRowSelect = () => {
        var selectedRows = gridApi.getSelectedRows();
        setSelectedRowData(selectedRows)
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

    const frameworkComponents = {
        effectiveDateRenderer: effectiveDateFormatter,
        costingHeadFormatter: costingHeadFormatter,
        customNoRowsOverlay: NoContentFound,
    };

    return (
        <div>
            <div className={`ag-grid-react`}>
                {
                    !showverifyPage &&
                    <Fragment>
                        <Row>
                            <Col className={`${multiTechnologyCostinig && multiTechnologyCostinig?.length <= 0 ? "overlay-contain" : ""}`}>
                                <div className="ag-grid-wrapper assembly-simulaiton">
                                    <div className={`ag-grid-header d-flex justify-content-between align-items-center ${screenWidth < 1600 ? 'mt-5' : ''}`}>
                                        <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                        <button type="button" className="user-btn float-right" id="simulation-back" title="Reset Grid" onClick={() => resetState()}>
                                            <div className="refresh mr-0"></div>
                                        </button>
                                    </div>
                                    {
                                        isbulkUpload && <>
                                            <div className='d-flex justify-content-end bulk-upload-row'>
                                                <div className="d-flex align-items-center">
                                                    <label>No. of rows with changes:</label>
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
                                                    <label>No. of rows without changes:</label>
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
                                        </>
                                    }
                                    <div className="ag-theme-material" style={{ width: '100%' }}>
                                        <AgGridReact
                                            ref={gridRef}
                                            floatingFilter={true}
                                            style={{ height: '100%', width: '100%' }}
                                            defaultColDef={defaultColDef}
                                            domLayout='autoHeight'
                                            // columnDefs={c}
                                            rowData={multiTechnologyCostinig}
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
                                            rowSelection={'multiple'}
                                            onSelectionChanged={onRowSelect}
                                        >
                                            <AgGridColumn field="CostingNumber" editable='false' headerName="Costing Number" minWidth={140}></AgGridColumn>
                                            <AgGridColumn field="PlantName" editable='false' headerName="Plant Name" minWidth={140}></AgGridColumn>
                                            <AgGridColumn field="PlantCode" editable='false' headerName="Plant Code" minWidth={140}></AgGridColumn>
                                            <AgGridColumn field="InfoCategory" editable='false' headerName="Category" minWidth={140}></AgGridColumn>
                                            <AgGridColumn field="PartName" editable='false' headerName="Part Name" minWidth={140}></AgGridColumn>
                                            <AgGridColumn field="PartNumber" editable='false' headerName="Part Number" minWidth={140}></AgGridColumn>
                                            <AgGridColumn field="POPrice" editable='false' headerName="Current PO" minWidth={140}></AgGridColumn>
                                        </AgGridReact >

                                        <div className="paging-container d-inline-block float-right">
                                            <select className="form-control paging-dropdown" onChange={(e) => onPageSizeChanged(e.target.value)} id="page-size">
                                                <option value="10" selected={true}>10</option>
                                                <option value="50">50</option>
                                                <option value="100">100</option>
                                            </select>
                                        </div>
                                    </div >
                                </div >

                            </Col >
                        </Row >

                        {!isImpactedMaster &&
                            <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                                <div className="col-sm-12 text-right bluefooter-butn d-flex justify-content-end align-items-center">
                                    <div id="assembly_effective_date" className="inputbox date-section mr-3 verfiy-page simulation_effectiveDate">
                                        <DatePicker
                                            name="EffectiveDate"
                                            id="EffectiveDate"
                                            selected={DayTime(effectiveDate).isValid() ? new Date(effectiveDate) : ''}
                                            onChange={handleEffectiveDateChange}
                                            showMonthDropdown
                                            showYearDropdown
                                            dropdownMode='select'
                                            dateFormat="dd/MM/yyyy"
                                            minDate={new Date(maxDate)}
                                            placeholderText="Select effective date"
                                            className="withBorder"
                                            autoComplete={"off"}
                                            disabledKeyboardNavigation
                                            onChangeRaw={(e) => e.preventDefault()}
                                        />
                                        {isWarningMessageShow && <WarningMessage dClass={"error-message"} textClass={"pt-1"} message={"Please select effective date"} />}
                                    </div>
                                    <button type={"button"} id="assembly_cancel" className="mr15 cancel-btn" onClick={cancel} disabled={isDisable}>
                                        <div className={"cancel-icon"}></div>
                                        {"CANCEL"}
                                    </button>
                                    <button onClick={verifySimulation} id="assembly_verify" type="submit" className="user-btn mr5 save-btn verifySimulation" disabled={isDisable}>
                                        <div className={"Run-icon"}>
                                        </div>{" "}
                                        {"Verify"}
                                    </button>
                                </div>
                            </Row >
                        }
                    </Fragment >
                }
                {
                    showverifyPage &&
                    <VerifySimulation token={token} cancelVerifyPage={cancelVerifyPage} isCustomer={props?.isCustomer} />
                }
                {
                    showRunSimulationDrawer &&
                    <RunSimulationDrawer
                        isOpen={showRunSimulationDrawer}
                        closeDrawer={closeDrawer}
                        anchor={"right"}
                        technology={technology}
                    />
                }
            </div >
        </div >
    );
}


export default AssemblySimulationListing;
