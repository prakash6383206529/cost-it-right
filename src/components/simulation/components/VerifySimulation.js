import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form'
import { Row, Col, } from 'reactstrap';
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import NoContentFound from '../../common/NoContentFound';
import { CONSTANT } from '../../../helper/AllConastant';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import { getVerifySimulationList } from '../actions/Simulation';
import RunSimulationDrawer from './RunSimulationDrawer';
import CostingSimulation from './CostingSimulation';
import { checkForDecimalAndNull, getConfigurationKey, loggedInUserId } from '../../../helper';
import { toastr } from 'react-redux-toastr';
import { getPlantSelectListByType } from '../../../actions/Common';
import { ZBC } from '../../../config/constants';
import { getRawMaterialNameChild } from '../../masters/actions/Material';
import LoaderCustom from '../../common/LoaderCustom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
const gridOptions = {};

function VerifySimulation(props) {
    const { cancelVerifyPage } = props
    const [shown, setshown] = useState(false);
    const [selectedRowData, setSelectedRowData] = useState([]);

    const [selectedIds, setSelectedIds] = useState('')
    const [tokenNo, setTokenNo] = useState('')
    const [simulationId, setSimualtionId] = useState('')
    const [hideRunButton, setHideRunButton] = useState(false)
    const [simulationDrawer, setSimulationDrawer] = useState(false)
    const [costingPage, setSimulationCostingPage] = useState(false)
    const [material, setMaterial] = useState([])
    const [objs, setObj] = useState({})
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [rowData, setRowData] = useState(null);

    const { register, handleSubmit, control, setValue, formState: { errors }, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const dispatch = useDispatch()

    useEffect(() => {
        verifyCostingList()
        dispatch(getPlantSelectListByType(ZBC, () => { }))
        dispatch(getRawMaterialNameChild(() => { }))
    }, [])

    const verifyCostingList = (plantId = '', rawMatrialId = '') => {
        dispatch(getVerifySimulationList(props.token, plantId, rawMatrialId, (res) => {
            if (res.data.Result) {
                const data = res.data.Data
                if (data.SimulationImpactedCostings.length === 0) {
                    toastr.warning('No approved costing exist for this raw material.')
                    setHideRunButton(true)
                    return false
                }
                setTokenNo(data.TokenId)
                setSimualtionId(data.SimulationId)
                setHideRunButton(false)
            }
        }))
    }


    const verifyList = useSelector(state => state.simulation.simulationVerifyList)

    const plantSelectList = useSelector(state => state.comman.plantSelectList)

    const { rawMaterialNameSelectList } = useSelector(state => state.material)


    const renderCostingNumber = () => {
        return <>Costing <br /> Number </>
    }

    const renderVendorName = () => {
        return <>Vendor <br />Name </>
    }
    const renderPlantCode = () => {
        return <>Plant<br />Code </>
    }

    const renderDescription = () => {
        return <>Part <br />Name </>
    }

    const renderECN = () => {
        return <>ECN <br />No.</>
    }

    const revisionNumber = () => {
        return <>Revision <br />No.</>
    }

    const OldPo = () => {
        return <>PO Price <br />Old </>
    }

    const RMName = () => {
        return <>RM <br />Name </>
    }

    const renderOldBR = () => {
        return <>Old <br />Basic Rate</>
    }

    const renderNewBR = () => {
        return <>New <br />Basic Rate</>
    }

    const renderOldSR = () => {
        return <>Old <br />Scrap Rate</>
    }

    const renderNewSR = () => {
        return <>New <br />Scrap Rate</>
    }

    const buttonFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <button className="View" type={'button'} onClick={() => { }} />
            </>
        )
    }
    const newBRFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewBasicRate > row.OldBasicRate) ? 'red-value form-control' : (row.NewBasicRate < row.OldBasicRate) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newSRFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewScrapRate > row.OldScrapRate) ? 'red-value form-control' : (row.NewScrapRate < row.OldScrapRate) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const descriptionFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (cell != null && cell.length !== 0) ? cell : '-'
    }

    const ecnFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (cell != null && cell.length !== 0) ? cell : '-'
    }

    const revisionFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (cell != null && cell.length !== 0) ? cell : '-'
    }

    const renderPlant = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (cell !== null && cell !== '-') ? `${cell}` : '-'

    }

    const renderVendor = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (cell !== null && cell !== '-') ? `${cell}(${row.VendorCode})` : '-'
    }

    const renderRM = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return `${cell}-${row.RMGrade ? row.RMGrade : '-'}`
    }

    const onRowSelect = () => {
        var selectedRows = gridApi.getSelectedRows();
        setSelectedRowData(selectedRows)
        // if (isSelected) {
        //     let tempArr = [...selectedRowData, row]
        //     setSelectedRowData(tempArr)
        // } else {
        //     const CostingId = row.CostingId;
        //     let tempArr = selectedRowData && selectedRowData.filter(el => el.CostingId !== CostingId)
        //     setSelectedRowData(tempArr)
        // }
    }

    const onSelectAll = (isSelected, rows) => {
        if (isSelected) {
            setSelectedRowData(rows)
        } else {
            setSelectedRowData([])
        }
    }

    const renderDropdownListing = (label) => {
        let temp = []
        if (label === 'plant') {
            plantSelectList && plantSelectList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }

        if (label === 'material') {
            rawMaterialNameSelectList && rawMaterialNameSelectList.map((item) => {
                if (item.Value === '0') return false
                temp.push({ label: item.Text, value: item.Value })
                return null
            })
            return temp
        }
    }

    const selectRowProp = {
        mode: 'checkbox',
        clickToSelect: true,
        unselectable: selectedIds,
        onSelect: onRowSelect,
        onSelectAll: onSelectAll,
    };

    const options = {
        clearSearch: true,
        noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
        // paginationShowsTotal: renderPaginationShowsTotal(),
        prePage: <span className="prev-page-pg"></span>, // Previous page button text
        nextPage: <span className="next-page-pg"></span>, // Next page button text
        firstPage: <span className="first-page-pg"></span>, // First page button text
        lastPage: <span className="last-page-pg"></span>,
    };

    const runSimulation = () => {
        if (selectedRowData.length === 0) {
            toastr.warning('Please select atleast one costing.')
            return false
        }

        let obj = {};
        obj.SimulationId = simulationId
        obj.LoggedInUserId = loggedInUserId()
        let tempArr = []

        selectedRowData && selectedRowData.map(item => {
            let tempObj = {}
            tempObj.RawMaterialId = item.RawMaterialId
            tempObj.CostingId = item.CostingId
            tempArr.push(tempObj)
            return null;
        })

        obj.RunSimualtionCostingInfo = tempArr
        setObj(obj)
        setSimulationDrawer(true)

    }

    const closeDrawer = (e = '', mode) => {
        if (mode === true) {
            setSimulationDrawer(false)
            setSimulationCostingPage(true)
        } else {
            setSimulationDrawer(false)
        }
    }

    const handleMaterial = (value) => {
        setMaterial(value)
    }


    const filterList = () => {
        const plant = getValues('plantCode').value

        verifyCostingList(plant, material.value)
    }
    const resetFilter = () => {
        setValue('plantCode', '')
        setValue('rawMaterial', '')
        setMaterial('')
        verifyCostingList('', '')
    }

    const isFirstColumn = (params) => {
        var displayedColumns = params.columnApi.getAllDisplayedColumns();
        var thisIsFirstColumn = displayedColumns[0] === params.column;

        return thisIsFirstColumn;
    }


    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
        headerCheckboxSelection: isFirstColumn,
        checkboxSelection: isFirstColumn
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(1);

    };

    const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const frameworkComponents = {
        descriptionFormatter: descriptionFormatter,
        ecnFormatter: ecnFormatter,
        revisionFormatter: revisionFormatter,
        renderVendor: renderVendor,
        renderPlant: renderPlant,
        renderRM: renderRM,
        buttonFormatter: buttonFormatter,
        newBRFormatter: newBRFormatter,
        newSRFormatter: newSRFormatter,
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
                                    <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                                        <div className="ag-grid-header">
                                            <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Filter..." onChange={(e) => onFilterTextBoxChanged(e)} />
                                        </div>
                                        <div
                                            className="ag-theme-material"
                                            style={{ height: '100%', width: '100%' }}
                                        >
                                            <AgGridReact
                                                style={{ height: '100%', width: '100%' }}
                                                defaultColDef={defaultColDef}
                                                // columnDefs={c}
                                                rowData={verifyList}
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
                                                suppressRowClickSelection={true}
                                                rowSelection={'multiple'}
                                                // frameworkComponents={frameworkComponents}
                                                onSelectionChanged={onRowSelect}
                                            >
                                                <AgGridColumn field="CostingId" hide ></AgGridColumn>
                                                <AgGridColumn field="CostingNumber" headerName="Costing Number"></AgGridColumn>
                                                <AgGridColumn field="VendorName" cellRenderer='renderVendor' headerName="Vendor Name"></AgGridColumn>
                                                <AgGridColumn field="PlantName" cellRenderer='renderPlant' headerName="Plant Code"></AgGridColumn>
                                                <AgGridColumn field="PartNo" headerName="Part No."></AgGridColumn>
                                                <AgGridColumn field="PartName" cellRenderer='descriptionFormatter' headerName="Part Name"></AgGridColumn>
                                                <AgGridColumn field="ECNNumber" cellRenderer='ecnFormatter' headerName="ECN No."></AgGridColumn>
                                                <AgGridColumn field="RevisionNumber" cellRenderer='revisionFormatter' headerName="Revision No."></AgGridColumn>
                                                <AgGridColumn field="RMName" cellRenderer='renderRM' headerName="RM Name" ></AgGridColumn>
                                                <AgGridColumn field="POPrice" headerName="PO Price Old"></AgGridColumn>
                                                <AgGridColumn field="OldBasicRate" headerName="Old Basic Rate"></AgGridColumn>
                                                <AgGridColumn field="NewBasicRate" cellRenderer='newBRFormatter' headerName="New Basic Rate"></AgGridColumn>
                                                <AgGridColumn field="OldScrapRate" headerName="Old Scrap Rate"></AgGridColumn>
                                                <AgGridColumn field="NewScrapRate" cellRenderer='newSRFormatter' headerName="New Scrap Rate" ></AgGridColumn>
                                                <AgGridColumn field="RawMaterialId" hide ></AgGridColumn>

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
                                </div>
                            </Col>


                        </Col>
                    </Row>
                    <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
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
                            {/* <button class="user-btn approval-btn mr-3" onClick={() => { }}>
                        <img class="mr-1" src={require('../../../assests/images/send-for-approval.svg')}></img>{' '}
                        {'Send For Approval'}
                    </button>
                    <button type="submit" className="user-btn mr5 save-btn">
                        <div className={"save-icon"}></div>{" "}
                        {"Save Simulation"}
                    </button> */}
                        </div>
                    </Row>
                </>
            }
            {
                costingPage &&
                <CostingSimulation simulationId={simulationId} />
            }
            {
                simulationDrawer &&
                <RunSimulationDrawer
                    isOpen={simulationDrawer}
                    closeDrawer={closeDrawer}
                    objs={objs}
                    anchor={"right"}
                />
            }
        </>
    );
}

export default VerifySimulation;