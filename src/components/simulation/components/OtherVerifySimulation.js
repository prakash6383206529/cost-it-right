import React, { useState } from 'react';
import { Row, Col, } from 'reactstrap';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NoContentFound from '../../common/NoContentFound';
import { EMPTY_DATA } from '../../../config/constants';
import { getVerifyExchangeSimulationList } from '../actions/Simulation';
import RunSimulationDrawer from './RunSimulationDrawer';
import CostingSimulation from './CostingSimulation';
import { checkForDecimalAndNull, getConfigurationKey, loggedInUserId, searchNocontentFilter } from '../../../helper';
import Toaster from '../../common/Toaster';
import { getPlantSelectListByType } from '../../../actions/Common';
import { EXCHNAGERATE, ZBC } from '../../../config/constants';
import LoaderCustom from '../../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { debounce } from 'lodash';
import { PaginationWrapper } from '../../common/commonPagination';
import { useLabels } from '../../../helper/core';
const gridOptions = {};

function OtherVerifySimulation(props) {
    const { cancelVerifyPage, isExchangeRate } = props
    const { revisionNoLabel } = useLabels()
    const [selectedRowData, setSelectedRowData] = useState([]);
    const [tokenNo, setTokenNo] = useState('')
    const [simulationId, setSimualtionId] = useState('')
    const [hideRunButton, setHideRunButton] = useState(false)
    const [simulationDrawer, setSimulationDrawer] = useState(false)
    const [costingPage, setSimulationCostingPage] = useState(false)
    const [objs, setObj] = useState({})
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [masterId, setMasterId] = useState('')
    const [effectiveDate, setEffectiveDate] = useState('')
    const [noData, setNoData] = useState(false);
    const { selectedMasterForSimulation } = useSelector(state => state.simulation)

    const dispatch = useDispatch()

    useEffect(() => {
        verifyCostingList()
        dispatch(getPlantSelectListByType(ZBC, "SIMULATION", '', () => { }))
    }, [])

    const verifyCostingList = () => {
        if (isExchangeRate) {
            dispatch(getVerifyExchangeSimulationList(props.token, (res) => {
                if (res.data.Result) {
                    const data = res.data.Data
                    if (data.SimulationExchangeRateImpactedCostings.length === 0) {
                        Toaster.warning('No approved costing exist for this exchange rate.')
                        setHideRunButton(true)
                        return false
                    }
                    setTokenNo(data.TokenNumber)
                    setSimualtionId(data.SimulationId)
                    setMasterId(data.SimulationtechnologyId)
                    setHideRunButton(false)
                    setEffectiveDate(data.EffectiveDate)
                }
            }))
        }
    }


    const verifyList = useSelector(state => state.simulation.simulationVerifyList)

    const buttonFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <button className="View" type={'button'} onClick={() => { }} />
            </>
        )
    }
    const newExchangeRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewExchangeRate > row.OldExchangeRate) ? 'red-value form-control' : (row.NewExchangeRate < row.OldExchangeRate) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : '-'
    }

    const descriptionFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cell != null && cell.length !== 0) ? cell : '-'
    }

    const ecnFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cell != null && cell.length !== 0) ? cell : '-'
    }

    const revisionFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (cell != null && cell.length !== 0) ? cell : '-'
    }

    const onRowSelected = (e) => {
        let row = e.node.isSelected()
        setGridSelection(row, e.node)
    }

    const onFloatingFilterChanged = (value) => {
        setTimeout(() => {
            if (verifyList.length !== 0) {
                setNoData(searchNocontentFilter(value, noData))
            }
        }, 500);
    }
    const setGridSelection = (type, clickedElement) => {
        var selectedRows = gridApi.getSelectedRows();
        const rowIndex = clickedElement.rowIndex
        const costingNumber = clickedElement.data.CostingNumber
        gridApi.forEachNode(node => {
            if (node.rowIndex !== rowIndex) {
                if (node.data.CostingNumber === costingNumber) {
                    node.setSelected(type);

                }
            }
        });
        setSelectedRowData(selectedRows)
    }

    const runSimulation = debounce(() => {
        if (selectedRowData.length === 0) {
            Toaster.warning('Please select atleast one costing.')
            return false
        }


        let obj = {};
        obj.SimulationId = simulationId
        obj.LoggedInUserId = loggedInUserId()
        let tempArr = []

        switch (masterId) {
            case Number(EXCHNAGERATE):
                selectedRowData && selectedRowData.map(item => {
                    let tempObj = {}
                    tempObj.CostingId = item.CostingId
                    tempArr.push(tempObj)
                    return null;
                })

                obj.RunSimualtionExchangeRateCostingInfos = tempArr
                setObj(obj)
                setSimulationDrawer(true)

                break;
            default:
        }
    }, 500)

    const closeDrawer = (e = '', mode) => {
        if (mode === true) {
            setSimulationDrawer(false)
            setSimulationCostingPage(true)
        } else {
            setSimulationDrawer(false)
        }
    }

    const isFirstColumn = (params) => {
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;

        return thisIsFirstColumn;
    }

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: false,
        headerCheckboxSelection: isFirstColumn,
        checkboxSelection: isFirstColumn
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
        gridApi.paginationSetPageSize(Number(newPageSize));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const resetState = () => {
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);

    }

    const frameworkComponents = {
        descriptionFormatter: descriptionFormatter,
        ecnFormatter: ecnFormatter,
        revisionFormatter: revisionFormatter,
        buttonFormatter: buttonFormatter,
        newExchangeRateFormatter: newExchangeRateFormatter,
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
    };



    return (
        <>
            {
                !costingPage &&
                <>
                    <Row>
                        <Col sm="12">
                            <h1 class="mb-0">Token No:{tokenNo}</h1>
                        </Col>
                    </Row>
                    <Row className="filter-row-large pt-4 blue-before">

                        <Col md="2" lg="2" className="search-user-block mb-3">
                            <div className="d-flex justify-content-end bd-highlight w100">
                                <div>

                                </div>
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <Col>
                                <div className={`ag-grid-react`}>
                                    <div className={`height-width-wrapper ${(verifyList && verifyList?.length <= 0) || noData ? "overlay-contain" : ""}`}>
                                        <div className="ag-grid-header">
                                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " autoComplete={'off'} onChange={(e) => onFilterTextBoxChanged(e)} />
                                            <button type="button" className="user-btn float-right" title="Reset Grid" onClick={() => resetState()}>
                                                <div className="refresh mr-0"></div>
                                            </button>
                                        </div>
                                        <div className="ag-theme-material p-relative">
                                            {noData && <NoContentFound title={EMPTY_DATA} customClassName="no-content-found simulation-lisitng" />}
                                            <AgGridReact
                                                defaultColDef={defaultColDef}
                                                floatingFilter={true}
                                                domLayout='autoHeight'
                                                // columnDefs={c}
                                                rowData={verifyList}
                                                pagination={true}
                                                paginationPageSize={10}
                                                onGridReady={onGridReady}
                                                gridOptions={gridOptions}
                                                loadingOverlayComponent={'customLoadingOverlay'}
                                                noRowsOverlayComponent={'customNoRowsOverlay'}
                                                noRowsOverlayComponentParams={{
                                                    title: EMPTY_DATA,
                                                    customClassName: 'nodata-found-container'
                                                }}
                                                frameworkComponents={frameworkComponents}
                                                rowSelection={'multiple'}
                                                onRowSelected={onRowSelected}
                                                onFilterModified={onFloatingFilterChanged}

                                            >
                                                <AgGridColumn field="CostingId" hide ></AgGridColumn>
                                                <AgGridColumn width={185} field="CostingNumber" headerName="Costing Number"></AgGridColumn>
                                                <AgGridColumn width={110} field="PartNo" headerName="Part No."></AgGridColumn>
                                                <AgGridColumn width={120} field="PartName" cellRenderer='descriptionFormatter' headerName="Part Name"></AgGridColumn>
                                                <AgGridColumn width={110} field="ECNNumber" cellRenderer='ecnFormatter' headerName="ECN No."></AgGridColumn>
                                                <AgGridColumn width={130} field="RevisionNumber" cellRenderer='revisionFormatter' headerName={revisionNoLabel}></AgGridColumn>
                                                {isExchangeRate && <AgGridColumn width={130} field="Currency" headerName="Currency"></AgGridColumn>}
                                                <AgGridColumn width={130} field="POPrice" headerName="Existing Net Cost"></AgGridColumn>


                                                {isExchangeRate && <AgGridColumn width={145} field="OldExchangeRate" headerName="Existing Exchange Rate"></AgGridColumn>}
                                                {isExchangeRate && <AgGridColumn width={150} field="NewExchangeRate" cellRenderer='newExchangeRateFormatter' headerName="Revised Exchange Rate"></AgGridColumn>}



                                            </AgGridReact>
                                            {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
                                        </div>
                                    </div>
                                </div>
                            </Col>


                        </Col>
                    </Row>
                    <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer sticky-btn-footer">
                        <div className="col-sm-12 text-right bluefooter-butn">
                            <button type={"button"} className="mr15 cancel-btn" onClick={cancelVerifyPage}>
                                <div className={"cancel-icon"}></div>
                                {"CANCEL"}
                            </button>
                            <button onClick={runSimulation} type="submit" disabled={hideRunButton} className="user-btn mr5 save-btn"                    >
                                <div className={"Run-icon"}>
                                </div>{" "}
                                {"RUN SIMULATION"}
                            </button>
                        </div>
                    </Row>
                </>
            }
            {
                costingPage &&
                <CostingSimulation simulationId={simulationId} master={selectedMasterForSimulation.value} />
            }
            {
                simulationDrawer &&
                <RunSimulationDrawer
                    isOpen={simulationDrawer}
                    closeDrawer={closeDrawer}
                    objs={objs}
                    masterId={masterId}
                    anchor={"right"}
                    date={effectiveDate}
                />
            }
        </>
    );
}


export default OtherVerifySimulation;