import React, { useState } from 'react';
import { useForm, Controller, } from 'react-hook-form'
import { Row, Col, } from 'reactstrap';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getRawMaterialNameChild } from '../../masters/actions/Material';
import NoContentFound from '../../common/NoContentFound';
import { CONSTANT } from '../../../helper/AllConastant';
import { SearchableSelectHookForm } from '../../layout/HookFormInputs';
import { getComparisionSimulationData, getCostingSimulationList, saveSimulationForRawMaterial } from '../actions/Simulation';
import ApproveRejectDrawer from '../../costing/components/approval/ApproveRejectDrawer'
import CostingDetailSimulationDrawer from './CostingDetailSimulationDrawer'
import { checkForDecimalAndNull, formatRMSimulationObject, formViewData, getConfigurationKey, userDetails } from '../../../helper';
import VerifyImpactDrawer from './VerifyImpactDrawer';
import { RMDOMESTIC, RMIMPORT, ZBC } from '../../../config/constants';
import { toastr } from 'react-redux-toastr';
import { Redirect } from 'react-router';
import { getPlantSelectListByType } from '../../../actions/Common';
import { setCostingViewData } from '../../costing/actions/Costing';
import { CostingSimulationDownload } from '../../../config/masterData'
import ReactExport from 'react-export-excel';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import LoaderCustom from '../../common/LoaderCustom';
const gridOptions = {};

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;

function CostingSimulation(props) {
    const { simulationId, isFromApprovalListing, master } = props

    const { register, control, formState: { errors }, getValues, setValue } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const [shown, setshown] = useState(false);

    const [selectedRowData, setSelectedRowData] = useState([]);
    const [selectedIds, setSelectedIds] = useState([])
    const [tokenNo, setTokenNo] = useState('')
    const [CostingDetailDrawer, setCostingDetailDrawer] = useState(false)
    const [isVerifyImpactDrawer, setIsVerifyImpactDrawer] = useState(false)
    const [isApprovalDrawer, setIsApprovalDrawer] = useState(false)
    const [showApprovalHistory, setShowApprovalHistory] = useState(false)
    const [simulationDetail, setSimulationDetail] = useState('')
    const [costingArr, setCostingArr] = useState([])
    const [id, setId] = useState('')
    const [isSaveDone, setSaveDone] = useState(isFromApprovalListing ? isFromApprovalListing : false)
    const [oldArr, setOldArr] = useState([])
    const [material, setMaterial] = useState([])
    const [pricesDetail, setPricesDetail] = useState({})
    const [isView, setIsView] = useState(false)
    const [disableApproveButton, setDisableApprovalButton] = useState(false)
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [rowData, setRowData] = useState(null);
    const [selectedCostingIds, setSelectedCostingIds] = useState();
    const [loader, setLoader] = useState(true)

    const dispatch = useDispatch()

    useEffect(() => {
        getCostingList()
        dispatch(getPlantSelectListByType(ZBC, () => { }))
        dispatch(getRawMaterialNameChild(() => { }))
    }, [])


    const getCostingList = (plantId = '', rawMatrialId = '') => {
        dispatch(getCostingSimulationList(simulationId, plantId, rawMatrialId, (res) => {
            if (res.data.Result) {
                const tokenNo = res.data.Data.SimulationTokenNumber
                const Data = res.data.Data
                Data.SimulatedCostingList && Data.SimulatedCostingList.map(item => {
                    if (item.IsLockedBySimulation) {
                        setSelectedCostingIds(item.CostingId)
                    }
                })
                setTokenNo(tokenNo)
                setCostingArr(Data.SimulatedCostingList)
                setSimulationDetail({ TokenNo: Data.SimulationTokenNumber, Status: Data.SimulationStatus, SimulationId: Data.SimulationId, SimulationAppliedOn: Data.SimulationAppliedOn })
                setLoader(false)
            }
        }))
    }

    const costingList = useSelector(state => state.simulation.costingSimulationList)

    const selectedMasterForSimulation = useSelector(state => state.simulation.selectedMasterForSimulation)

    const plantSelectList = useSelector(state => state.comman.plantSelectList)

    const { rawMaterialNameSelectList } = useSelector(state => state.material)

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

    const NewPO = () => {
        return <>PO Price <br />New </>
    }

    const RMName = () => {
        return <>RM <br />Name </>
    }

    const renderOldRM = () => {
        return <>RM Cost<br /> Old</>
    }

    const renderNewRM = () => {
        return <>RM Cost<br /> New</>
    }

    const runCostingDetailSimulation = () => {
        setCostingDetailDrawer(true)
    }

    const closeDrawer2 = (e = '', mode) => {
        if (mode === true) {
            setCostingDetailDrawer(false)
        } else {
            setCostingDetailDrawer(false)
        }
    }

    const viewCosting = (id, data, rowIndex) => {

        setId(id)
        setPricesDetail({ CostingNumber: data.CostingNumber, PlantCode: data.PlantCode, OldPOPrice: data.OldPOPrice, NewPOPrice: data.NewPOPrice, OldRMPrice: data.OldRMPrice, NewRMPrice: data.NewRMPrice, CostingHead: data.CostingHead })
        dispatch(getComparisionSimulationData(data.SimulationCostingId, res => {
            const Data = res.data.Data
            const obj1 = formViewData(Data.OldCosting)
            dispatch(setCostingViewData(obj1))
            runCostingDetailSimulation()
        }))
    }

    const buttonFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                <button className="View" type={'button'} onClick={() => { viewCosting(cell, row, props?.rowIndex) }} />
            </>
        )
    }

    const onRowSelect = () => {
        var selectedRows = gridApi.getSelectedRows();
        console.log('selectedRows: ', selectedRows);
        let temp = []
        let selectedTemp = []
        selectedRows && selectedRows.map(item => {
            if (item.IsLockedBySimulation) {
                temp.push(item.CostingNumber)
                return false
            }
        })

        if (temp.length > 1) {
            setSelectedRowData([])
            toastr.warning(`Costings ${temp.map(item => item)} is already sent for approval through another token number.`)
            gridApi.deselectAll()
            return false
        } else if (temp.length === 1) {
            toastr.warning('This costing is already sent for approval through another token number.')
            gridApi.deselectAll()
            return false
        } else {
            setSelectedRowData(selectedRows)
        }

    }

    // const onSelectAll = (isSelected, rows) => {
    //     if (isSelected) {
    //         let temp = []
    //         let temp1 = []
    //         costingArr && costingArr.map((item => {
    //             if (item.IsLockedBySimulation) {
    //                 temp1.push(item.CostingNumber)
    //             }
    //             else {
    //                 temp.push({ ...item, IsChecked: true })
    //             }
    //         }))
    //         if (temp1.length > 0) {
    //             setSelectedRowData([])
    //             toastr.warning(`Costings ${temp1.map(item => item)} is already sent for approval through another token number.`)
    //             return false
    //         }
    //         setCostingArr(temp)
    //         setSelectedRowData(rows)
    //     } else {
    //         let temp = []
    //         costingArr && costingArr.map((item => {
    //             temp.push({ ...item, IsChecked: false })
    //         }))
    //         setCostingArr(temp)
    //         setSelectedRowData([])
    //     }
    // }

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

    const onSaveSimulation = () => {

        const simObj = formatRMSimulationObject(simulationDetail, selectedRowData, costingArr)


        switch (selectedMasterForSimulation.label) {
            case RMDOMESTIC:
                dispatch(saveSimulationForRawMaterial(simObj, res => {
                    if (res.data.Result) {
                        toastr.success('Simulation saved successfully.')
                        setShowApprovalHistory(true)
                    }
                }))
                break;
            case RMIMPORT:
                dispatch(saveSimulationForRawMaterial(simObj, res => {
                    if (res.data.Result) {
                        toastr.success('Simulation saved successfully.')
                        setShowApprovalHistory(true)
                    }
                }))
                break;

            default:
                break;
        }
        // setShowApprovalHistory(true)
    }




    const VerifyImpact = () => {
        setIsVerifyImpactDrawer(true)
    }

    const sendForApproval = () => {
        setIsApprovalDrawer(true)
        if (!isFromApprovalListing) {

            const isChanged = JSON.stringify(oldArr) == JSON.stringify(selectedRowData)
            if (isChanged) {
                setSaveDone(true)
            } else {
                setSaveDone(false)
            }
        }
    }

    const closeDrawer = (e = '', type) => {
        if (type === 'submit') {
            setIsApprovalDrawer(false);
            setIsVerifyImpactDrawer(false);
            setShowApprovalHistory(true)
        } else {
            setIsApprovalDrawer(false);
            setCostingDetailDrawer(false)
            setIsVerifyImpactDrawer(false);
        }
    }

    const verifyImpactDrawer = (e = '', type) => {
        if (type === 'cancel') {
            setIsVerifyImpactDrawer(false);
        }
    }

    const descriptionFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell && cell !== null ? cell : '-'
    }

    const vendorFormatter = (cell, row, enumObject, rowIndex) => {
        return cell !== null ? cell : '-'
    }

    const ecnFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell !== null ? cell : '-'
    }

    const revisionFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell !== null ? cell : '-'
    }

    const oldPOFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewPOPrice > row.OldPOPrice) ? 'red-value form-control' : (row.NewPOPrice < row.OldPOPrice) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newPOFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewPOPrice > row.OldPOPrice) ? 'red-value form-control' : (row.NewPOPrice < row.OldPOPrice) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const oldRMFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewRMCost > row.OldRMCost) ? 'red-value form-control' : (row.NewRMCost < row.OldRMCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newRMFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewRMCost > row.OldRMCost) ? 'red-value form-control' : (row.NewRMCost < row.OldRMCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }


    const filterList = () => {
        const plant = getValues('plantCode').value
        getCostingList(plant, material.value)
    }
    const resetFilter = () => {
        setValue('plantCode', '')
        setValue('rawMaterial', '')
        setMaterial('')
        getCostingList('', '')
    }

    const handleMaterial = (value) => {
        setMaterial(value)
    }

    useEffect(() => {

    }, [isView])

    const returnExcelColumn = (data = [], TempData) => {
        let temp = []
        temp = TempData.map((item) => {
            if (item.CostingHead === true) {
                item.CostingHead = 'Vendor Based'
            } else if (item.CostingHead === false) {
                item.CostingHead = 'Zero Based'
            }
            return item
        })

        return (<ExcelSheet data={temp} name={'Costing'}>
            {data && data.map((ele, index) => <ExcelColumn key={index} label={ele.label} value={ele.value} style={ele.style} />)}
        </ExcelSheet>);
    }

    const renderColumn = () => returnExcelColumn(CostingSimulationDownload, selectedRowData.length > 0 ? selectedRowData : costingList && costingList.length > 0 ? costingList : [])


    useEffect(() => {
        if (userDetails().Role === 'SuperAdmin') {
            setDisableApprovalButton(true)
        }
    }, [])

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
        oldPOFormatter: oldPOFormatter,
        newPOFormatter: newPOFormatter,
        oldRMFormatter: oldRMFormatter,
        buttonFormatter: buttonFormatter,
        newRMFormatter: newRMFormatter,
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
    };

    // const isRowSelectable = rowNode => rowNode.data ? selectedCostingIds.length > 0 && !selectedCostingIds.includes(rowNode.data.CostingId) : false;
    return (
        <>
            {
                loader ? <LoaderCustom /> :

                    !showApprovalHistory &&

                    <div className="costing-simulation-page blue-before-inside">
                        <div className="container-fluid">
                            <div className={`ag-grid-react`}>


                                <Row>
                                    <Col sm="12">
                                        <h1 class="mb-0">Token No:{tokenNo}</h1>
                                    </Col>
                                </Row>
                                <Row className="filter-row-large pt-4 blue-before">
                                    {shown &&
                                        <Col lg="8" md="8" className="filter-block">
                                            <div className="d-inline-flex justify-content-start align-items-top w100">
                                                <div className="flex-fills">
                                                    <h5>{`Filter By:`}</h5>
                                                </div>

                                                {/* <div className="flex-fill hide-label">
                                                    <SearchableSelectHookForm
                                                        label={''}
                                                        name={'partNo'}
                                                        placeholder={'Part No.'}
                                                        Controller={Controller}
                                                        control={control}
                                                        rules={{ required: false }}
                                                        register={register}
                                                        // defaultValue={plant.length !== 0 ? plant : ''}
                                                        options={renderDropdownListing('PartList')}
                                                        mandatory={false}
                                                        handleChange={() => { }}
                                                        errors={errors.partNo}
                                                    />
                                                </div> */}
                                                <div className="flex-fill hide-label">
                                                    <SearchableSelectHookForm
                                                        label={''}
                                                        name={'plantCode'}
                                                        placeholder={'Plant Code'}
                                                        Controller={Controller}
                                                        control={control}
                                                        rules={{ required: false }}
                                                        register={register}
                                                        // defaultValue={plant.length !== 0 ? plant : ''}
                                                        options={renderDropdownListing('plant')}
                                                        mandatory={false}
                                                        handleChange={() => { }}
                                                        errors={errors.plantCode}
                                                    />
                                                </div>
                                                <div className="flex-fill hide-label">
                                                    <SearchableSelectHookForm
                                                        label={''}
                                                        name={'rawMaterial'}
                                                        placeholder={'Raw Material'}
                                                        Controller={Controller}
                                                        control={control}
                                                        rules={{ required: false }}
                                                        register={register}
                                                        // defaultValue={plant.length !== 0 ? plant : ''}
                                                        options={renderDropdownListing('material')}
                                                        mandatory={false}
                                                        handleChange={handleMaterial}
                                                        errors={errors.rawMaterial}
                                                    />
                                                </div>

                                                <div className="flex-fill hide-label">
                                                    <button
                                                        type="button"
                                                        //disabled={pristine || submitting}
                                                        onClick={resetFilter}
                                                        className="reset mr10"
                                                    >
                                                        {'Reset'}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        //disabled={pristine || submitting}
                                                        onClick={filterList}
                                                        className="apply mr5"
                                                    >
                                                        {'Apply'}
                                                    </button>
                                                </div>
                                            </div>
                                        </Col>
                                    }

                                    <Col md="3" lg="3" className="search-user-block mb-3">
                                        <div className="d-flex justify-content-end bd-highlight w100">

                                            <ExcelFile filename={'Costing'} fileExtension={'.xls'} element={
                                            <button title="Download" type="button" className={'user-btn mr5'}><div className="download mr-0"></div></button>}>
                                                {renderColumn()}
                                            </ExcelFile>
                                        </div>
                                    </Col>

                                </Row>
                                <Row>
                                    <Col>

                                        <Col>
                                            <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                                                <div className="ag-grid-header">
                                                    <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                                                </div>
                                                <div
                                                    className="ag-theme-material"
                                                    style={{ height: '100%', width: '100%' }}
                                                >
                                                    <AgGridReact
                                                        style={{ height: '100%', width: '100%' }}
                                                        defaultColDef={defaultColDef}
                                                        // columnDefs={c}
                                                        rowData={costingList}
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
                                                    // isRowSelectable={isRowSelectable}
                                                    >
                                                        <AgGridColumn width={150} field="CostingNumber" headerName='Costing ID'></AgGridColumn>
                                                        <AgGridColumn width={140} field="CostingHead" headerName='Costing Head'></AgGridColumn>
                                                        <AgGridColumn width={140} field="VendorName" cellRenderer='vendorFormatter' headerName='Vendor Name'></AgGridColumn>
                                                        <AgGridColumn width={120} field="PlantCode" headerName='Plant Code'></AgGridColumn>
                                                        <AgGridColumn width={110} field="RMName" hide ></AgGridColumn>
                                                        <AgGridColumn width={120} field="RMGrade" hide ></AgGridColumn>
                                                        <AgGridColumn width={110} field="PartNo" headerName='Part No.'></AgGridColumn>
                                                        <AgGridColumn width={120} field="PartName" headerName='Part Name' cellRenderer='descriptionFormatter'></AgGridColumn>
                                                        <AgGridColumn width={130} field="Technology" headerName='Technology'></AgGridColumn>
                                                        <AgGridColumn width={110} field="ECNNumber" headerName='ECN No.' cellRenderer='ecnFormatter'></AgGridColumn>
                                                        <AgGridColumn width={130} field="RevisionNumber" headerName='Revision No.' cellRenderer='revisionFormatter'></AgGridColumn>
                                                        <AgGridColumn width={140} field="OldPOPrice" headerName='PO Price Old' cellRenderer='oldPOFormatter'></AgGridColumn>
                                                        <AgGridColumn width={140} field="NewPOPrice" headerName='PO Price New' cellRenderer='newPOFormatter'></AgGridColumn>
                                                        <AgGridColumn width={140} field="OldRMPrice" headerName='RM Cost Old' cellRenderer='oldRMFormatter'></AgGridColumn>
                                                        <AgGridColumn width={140} field="NewRMPrice" headerName='RM Cost New' cellRenderer='newRMFormatter'></AgGridColumn>
                                                        <AgGridColumn width={140} field="OldRMRate" hide></AgGridColumn>
                                                        <AgGridColumn width={140} field="NewRMRate" hide></AgGridColumn>
                                                        <AgGridColumn width={140} field="OldScrapRate" hide></AgGridColumn>
                                                        <AgGridColumn width={140} field="NewScrapRate" hide></AgGridColumn>
                                                        <AgGridColumn type="rightAligned" width={100} field="CostingId" headerName='Actions' cellRenderer='buttonFormatter'></AgGridColumn>
                                                        <AgGridColumn field="RawMaterialFinishWeight" hide headerName='Finish Weight'></AgGridColumn>
                                                        <AgGridColumn field="RawMaterialGrossWeight" hide headerName='Gross Weight'></AgGridColumn>

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

                                    </Col>
                                </Row>
                            </div>
                            <Row className="sf-btn-footer no-gutters justify-content-between bottom-footer">
                                <div className="col-sm-12 text-right bluefooter-butn">

                                    <button
                                        class="user-btn approval-btn mr5"
                                        onClick={sendForApproval}
                                        disabled={selectedRowData && selectedRowData.length === 0 ? true : disableApproveButton ? true : false}
                                    >
                                        <div className="send-for-approval"></div>
                                        {'Send For Approval'}
                                    </button>

                                    <button
                                        type="button"
                                        className="user-btn mr5 save-btn"
                                        disabled={((selectedRowData && selectedRowData.length === 0) || isFromApprovalListing) ? true : false}
                                        onClick={onSaveSimulation}>
                                        <div className={"save-icon"}></div>
                                        {"Save Simulation"}
                                    </button>

                                    <button className="user-btn mr5 save-btn" onClick={VerifyImpact}>
                                        <div className={"save-icon"}></div>
                                        {"Verify Impact"}
                                    </button>

                                </div>
                            </Row>
                        </div>
                        {isApprovalDrawer &&
                            <ApproveRejectDrawer
                                isOpen={isApprovalDrawer}
                                anchor={'right'}
                                approvalData={[]}
                                type={'Sender'}
                                simulationDetail={simulationDetail}
                                selectedRowData={selectedRowData}
                                costingArr={costingArr}
                                master={selectedMasterForSimulation ? selectedMasterForSimulation.label : master}
                                closeDrawer={closeDrawer}
                                isSimulation={true}
                            // isSaveDone={isSaveDone}
                            />}

                        {isVerifyImpactDrawer &&
                            <VerifyImpactDrawer
                                isOpen={isVerifyImpactDrawer}
                                anchor={'right'}
                                approvalData={[]}
                                type={'Approve'}
                                closeDrawer={verifyImpactDrawer}
                                isSimulation={true}
                            />}
                    </div>

            }


            {showApprovalHistory && <Redirect to='/simulation-history' />}

            {CostingDetailDrawer &&
                <CostingDetailSimulationDrawer
                    isOpen={CostingDetailSimulationDrawer}
                    closeDrawer={closeDrawer2}
                    anchor={"right"}
                    pricesDetail={pricesDetail}
                    simulationDetail={simulationDetail}
                    selectedRowData={selectedRowData}
                    costingArr={costingArr}
                    master={selectedMasterForSimulation ? selectedMasterForSimulation.label : master}
                    closeDrawer={closeDrawer}
                    isSimulation={true}
                />}
        </>

    );
}

export default CostingSimulation;
