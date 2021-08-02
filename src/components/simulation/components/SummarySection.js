import React, { useEffect, useState } from 'react'
import { Col, Row } from 'reactstrap'
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import moment from 'moment'
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import { CONSTANT } from '../../../helper/AllConastant';
import { checkForDecimalAndNull, formViewData, checkForNull, getConfigurationKey, loggedInUserId } from '../../../helper';
import { useDispatch, useSelector } from 'react-redux';
import { getApprovalSimulatedCostingSummary, getComparisionSimulationData } from '../actions/Simulation';
import { setCostingViewData } from '../../costing/actions/Costing';
import LoaderCustom from '../../common/LoaderCustom';
import NoContentFound from '../../common/NoContentFound';
import { getPlantSelectListByType, getTechnologySelectList } from '../../../actions/Common';
import { ZBC } from '../../../config/constants';
const gridOptions = {};

export function Summarysection(props) {
    const {isbulkUpload} = props;

    
    
    
    
    const [simulationDetail, setSimulationDetail] = useState({})
    const [approvalLevelStep, setApprovalLevelStep] = useState([])
    const [isApprovalDone, setIsApprovalDone] = useState(false) // this is for hiding approve and  reject button when costing is approved and  send for futher approval
    const [showFinalLevelButtons, setShowFinalLevelButton] = useState(false) //This is for showing approve ,reject and approve and push button when costing approval is at final level for aaproval
    const [showPushButton, setShowPushButton] = useState(false) // This is for showing push button when costing is approved and need to push it for scheduling
    const [loader, setLoader] = useState(true)
    const [oldCostingList, setOldCostingList] = useState([])



    const [costingSummary, setCostingSummary] = useState(true)
    const [costingList, setCostingList] = useState([])
    const [compareCosting, setCompareCosting] = useState(false)
    const [compareCostingObj, setCompareCostingObj] = useState([])
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [id, setId] = useState('')


    const [rowData, setRowData] = useState(null);

    const dispatch = useDispatch()

    const partSelectList = useSelector((state) => state.costing.partSelectList)
    const statusSelectList = useSelector((state) => state.approval.costingStatusList)
    const approvalSimulatedCostingSummary = useSelector((state) => state.approval.approvalSimulatedCostingSummary)
    const userList = useSelector(state => state.auth.userList)
    const { technologySelectList, plantSelectList } = useSelector(state => state.comman)


    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);

    };

    const onPageSizeChanged = (newPageSize) => {
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const resetState = () => {
        gridOptions.columnApi.resetColumnState();
    }

    useEffect(() => {
        dispatch(getTechnologySelectList(() => { }))
        dispatch(getPlantSelectListByType(ZBC, () => { }))

        const reqParams = {
            loggedInUserId: loggedInUserId(),
        }
        dispatch(getApprovalSimulatedCostingSummary(reqParams, res => {
            const { SimulationSteps, SimulatedCostingList, SimulationApprovalProcessId, Token, NumberOfCostings, IsSent, IsFinalLevelButtonShow, IsPushedButtonShow, SimulationTechnologyId, SimulationApprovalProcessSummaryId, DepartmentCode, EffectiveDate, SimulationId, SenderReason } = res.data.Data
            setCostingList(SimulatedCostingList)
            setOldCostingList(SimulatedCostingList)
            setApprovalLevelStep(SimulationSteps)
            setSimulationDetail({ SimulationApprovalProcessId: SimulationApprovalProcessId, Token: Token, NumberOfCostings: NumberOfCostings, SimulationTechnologyId: SimulationTechnologyId, SimulationApprovalProcessSummaryId: SimulationApprovalProcessSummaryId, DepartmentCode: DepartmentCode, EffectiveDate: EffectiveDate, SimulationId: SimulationId, SenderReason: SenderReason })
            setIsApprovalDone(IsSent)
            // setIsApprovalDone(false)
            setShowFinalLevelButton(IsFinalLevelButtonShow)
            setShowPushButton(IsPushedButtonShow)
            setLoader(false)
        }))
    }, [])

    const DisplayCompareCosting = (el, data) => {
        setId(data.CostingNumber)
        // setCompareCostingObj(el)
        dispatch(getComparisionSimulationData(el, res => {
            const Data = res.data.Data
            const obj1 = formViewData(Data.OldCosting)
            const obj2 = formViewData(Data.NewCosting)
            const obj3 = formViewData(Data.Variance)
            const objj3 = [obj1[0], obj2[0], obj3[0]]
            setCompareCostingObj(objj3)
            dispatch(setCostingViewData(objj3))
            setCompareCosting(true)
        }))
    }

    // all formatters
    const ecnFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return cell !== null ? cell : '-'
    }

    const revisionFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
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
        const classGreen = (row.NewRMPrice > row.OldRMPrice) ? 'red-value form-control' : (row.NewRMPrice < row.OldRMPrice) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const newRMFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const classGreen = (row.NewRMPrice > row.OldRMPrice) ? 'red-value form-control' : (row.NewRMPrice < row.OldRMPrice) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const buttonFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                <button className="Balance mb-0" type={'button'} onClick={() => DisplayCompareCosting(cell, row)} />
            </>
        )
    }

    const newBasicRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                <span className={`${!isbulkUpload ? '' : ''}`} >{cell ? cell : row.BasicRate} </span>
            </>
        )
    }

    const newScrapRateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <>
                <span className={`${!isbulkUpload ? '' : ''}`} >{cell ? cell : row.ScrapRate}</span>
            </>
        )
    }
    const freightCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return cell != null ? cell : '-';
    }
    const shearingCostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return cell != null ? cell : '-';
    }

    const costFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const tempA = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost);
        const classGreen = (tempA > row.NetLandedCost) ? 'red-value form-control' : (tempA < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
        return cell != null ? <span className={classGreen}>{checkForDecimalAndNull(cell, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
    }

    const NewcostFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        const NewBasicRate = Number(row.NewBasicRate) + checkForNull(row.RMFreightCost) + checkForNull(row.RMShearingCost)
        const classGreen = (NewBasicRate > row.NetLandedCost) ? 'red-value form-control' : (NewBasicRate < row.NetLandedCost) ? 'green-value form-control' : 'form-class'
        return row.NewBasicRate != null ? <span className={classGreen}>{checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)}</span> : ''
        // checkForDecimalAndNull(NewBasicRate, getConfigurationKey().NoOfDecimalForPrice)
    }

    const effectiveDateFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return cell != null ? moment(cell).format('DD/MM/YYYY') : '-';
    }
    // all formaters end

    const rawMaterailFormat = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return cell != null ? `${cell}- ${row.RMGrade}` : '-';
    }

    const frameworkComponents = {
        // totalValueRenderer: this.buttonFormatter,
        // effectiveDateRenderer: this.effectiveDateFormatter,
        // costingHeadRenderer: this.costingHeadFormatter,
        ecnFormatter: ecnFormatter,
        revisionFormatter: revisionFormatter,
        oldPOFormatter: oldPOFormatter,
        newPOFormatter: newPOFormatter,
        oldRMFormatter: oldRMFormatter,
        buttonFormatter: buttonFormatter,
        newRMFormatter: newRMFormatter,
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
        newBasicRateFormatter: newBasicRateFormatter,
        newScrapRateFormatter: newScrapRateFormatter,
        shearingCostFormatter: shearingCostFormatter,
        freightCostFormatter: freightCostFormatter,
        NewcostFormatter: NewcostFormatter,
        costFormatter: costFormatter,
        effectiveDateFormatter: effectiveDateFormatter,
        rawMaterailFormat: rawMaterailFormat
    };

    return (
        <>
             <Row>
                <Col md="10">
                    <div className="left-border">{'Summary:'}</div>
                </Col>
                <Col md="2" className="text-right">
                    <div className="right-border">
                        <button className="btn btn-small-primary-circle ml-1" type="button" onClick={() => { setCostingSummary(!costingSummary) }}>
                            {costingSummary ? (
                                <i className="fa fa-minus" ></i>
                            ) : (
                                <i className="fa fa-plus"></i>
                            )}
                        </button>
                    </div>
                </Col>
            </Row>

            {costingSummary &&
                <>
                    <div className={`ag-grid-react`}>
                        <Row className="pb-2">
                            <Col md="12">
                                <Row>
                                    <Col>
                                        <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                                            <div className="ag-grid-header">
                                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                                                <button type="button" className="user-btn float-right" title="Reset Grid" onClick={() => resetState()}>
                                                    <div className="refresh mr-0"></div>
                                                </button>
                                            </div>
                                            <div
                                                className="ag-theme-material"
                                                
                                            >
                                                <AgGridReact
                                                    style={{ height: '100%', width: '100%' }}
                                                    defaultColDef={defaultColDef}
domLayout='autoHeight'
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
                                                >
                                                    <AgGridColumn width={120} field="SimulationCostingId" hide='true'></AgGridColumn>
                                                    <AgGridColumn width={140} field="CostingNumber" headerName="Costing Id"></AgGridColumn>
                                                    <AgGridColumn width={182} field="RMName" cellRenderer='rawMaterailFormat' headerName="Raw Material-Grade" ></AgGridColumn>
                                                    <AgGridColumn width={120} field="PartNo" headerName="Part No."></AgGridColumn>
                                                    <AgGridColumn width={120} field="PartName" headerName='Part Name'></AgGridColumn>
                                                    <AgGridColumn width={120} field="ECNNumber" headerName='ECN No.' cellRenderer='ecnFormatter'></AgGridColumn>
                                                    <AgGridColumn width={130} field="RevisionNumber" headerName='Revision No.' cellRenderer='revisionFormatter'></AgGridColumn>
                                                    <AgGridColumn width={120} field="PlantCode" headerName='Plant Code' ></AgGridColumn>
                                                    <AgGridColumn width={140} field="OldPOPrice" cellRenderer='oldPOFormatter' headerName="PO Price Old"></AgGridColumn>
                                                    <AgGridColumn width={140} field="NewPOPrice" cellRenderer='newPOFormatter' headerName="PO Price New"></AgGridColumn>
                                                    <AgGridColumn width={140} field="OldRMPrice" cellRenderer='oldRMFormatter' headerName="RM Cost Old" ></AgGridColumn>
                                                    <AgGridColumn width={140} field="NewRMPrice" cellRenderer='newRMFormatter' headerName="RM Cost New" ></AgGridColumn>
                                                    <AgGridColumn width={130} field="SimulationCostingId" cellRenderer='buttonFormatter' headerName="Actions"  type="rightAligned"></AgGridColumn>
                                                    {/* <AgGridColumn field="Status" headerName='Status' cellRenderer='statusFormatter'></AgGridColumn>
                                                    <AgGridColumn field="SimulationId" headerName='Actions'   type="rightAligned" cellRenderer='buttonFormatter'></AgGridColumn> */}

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

                            </Col>
                        </Row>
                    </div>
                </>
            }
        </>
    )
}
