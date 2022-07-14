import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { loggedInUserId, userDetails } from '../../../helper/auth'
import NoContentFound from '../../common/NoContentFound'
import { defaultPageSize, EMPTY_DATA, LINKED } from '../../../config/constants'
import DayTime from '../../common/DayTimeWrapper'
import { DRAFT, EMPTY_GUID, APPROVED, PUSHED, ERROR, WAITING_FOR_APPROVAL, REJECTED, POUPDATED } from '../../../config/constants'
import Toaster from '../../common/Toaster'
import { getSimulationApprovalList, setMasterForSimulation, deleteDraftSimulation } from '../actions/Simulation'
import { Redirect, } from 'react-router-dom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import LoaderCustom from '../../common/LoaderCustom'
import { MESSAGES } from '../../../config/message'
import { allEqual, getConfigurationKey } from '../../../helper'
import ApproveRejectDrawer from '../../costing/components/approval/ApproveRejectDrawer'
import PopupMsgWrapper from '../../common/PopupMsgWrapper';
import WarningMessage from '../../common/WarningMessage'
import { debounce } from 'lodash'
import ScrollToTop from '../../common/ScrollToTop'
import { PaginationWrapper } from '../../common/commonPagination'
import { checkFinalUser } from '../../costing/actions/Costing'


const gridOptions = {};

function SimulationApprovalListing(props) {
    const { isDashboard } = props
    const [approvalData, setApprovalData] = useState('')
    const [selectedRowData, setSelectedRowData] = useState([]);
    const [approveDrawer, setApproveDrawer] = useState(false)
    const [selectedIds, setSelectedIds] = useState('')
    const [reasonId, setReasonId] = useState('')
    const [showApprovalSumary, setShowApprovalSummary] = useState(false)
    const [redirectCostingSimulation, setRedirectCostingSimulation] = useState(false)
    const [statusForLinkedToken, setStatusForLinkedToken] = useState(false)
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [isPendingForApproval, setIsPendingForApproval] = useState(false);
    const [showFinalLevelButtons, setShowFinalLevelButton] = useState(false)

    const dispatch = useDispatch()
    const { simualtionApprovalList, simualtionApprovalListDraft } = useSelector(state => state.simulation)
    const [deletedId, setDeletedId] = useState('')
    const [showPopup, setShowPopup] = useState(false)
    const [simulationDetail, setSimulationDetail] = useState([])
    const [isLoader, setIsLoader] = useState(false)
    const isSmApprovalListing = props.isSmApprovalListing;

    const { handleSubmit } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })
    useEffect(() => {
        getTableData()
    }, [])

    useEffect(() => {

    }, [selectedIds])


    /**
     * @method getTableData
     * @description getting approval list table
     */
    const getTableData = (partNo = EMPTY_GUID, createdBy = EMPTY_GUID, requestedBy = EMPTY_GUID, status = 0,) => {

        let filterData = {
            logged_in_user_id: loggedInUserId(),
            logged_in_user_level_id: userDetails().LoggedInSimulationLevelId,
            token_number: null,
            simulated_by: createdBy,
            requestedBy: requestedBy,
            status: status,
            isDashboard: isDashboard ?? false
        }
        setIsLoader(true)
        dispatch(getSimulationApprovalList(filterData, (res) => {
            if (res?.data?.Result) {
                setTimeout(() => {
                    setIsLoader(false)
                }, 300);
            }
        }))
    }

    /**
     * @method linkableFormatter
     * @description Renders Name link
     */
    const linkableFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        const rowData = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (
            <Fragment>
                <div
                    onClick={() => viewDetails(rowData)}
                    className={'link'}
                >
                    {cellValue}
                </div>
            </Fragment>
        )
    }

    /**
    * @method hyphenFormatter
    */
    const hyphenFormatter = (props) => {
        const cellValue = props?.value;
        return (cellValue !== ' ' && cellValue !== null && cellValue !== '' && cellValue !== undefined) ? cellValue : '-';
    }

    const requestedOnFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? DayTime(cell).format('DD/MM/YYYY') : '-';
    }
    const reasonFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? cell : '-';
    }

    const statusFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return <div className={cell} >{row.DisplayStatus}</div>
    }

    const buttonFormatter = (props) => {
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;

        return (
            <>
                <button title='View' className="View" type={'button'} onClick={() => viewDetails(row)} />
                {row.Status === DRAFT && <button title='Delete' className="Delete ml-1" type={'button'} onClick={() => deleteItem(row)} />}
            </>
        )
    }

    const viewDetails = (rowObj) => {
        setApprovalData({ approvalProcessId: rowObj.ApprovalProcessId, approvalNumber: rowObj.ApprovalNumber, SimulationTechnologyHead: rowObj.SimulationTechnologyHead, SimulationTechnologyId: rowObj.SimulationTechnologyId })
        if (rowObj?.Status === 'Draft' || rowObj.SimulationType === 'Provisional' || rowObj?.Status === 'Linked') {
            setStatusForLinkedToken(rowObj?.Status === 'Linked')
            dispatch(setMasterForSimulation({ label: rowObj.SimulationTechnologyHead, value: rowObj.SimulationTechnologyId }))
            setRedirectCostingSimulation(true)
        } else {
            setShowApprovalSummary(true)
        }
    }

    const deleteItem = (rowData) => {
        let data = {
            loggedInUser: loggedInUserId(),
            simulationId: rowData.SimulationId
        }

        setShowPopup(true)
        setDeletedId(data)

    }
    const onPopupConfirm = () => {
        dispatch(deleteDraftSimulation(deletedId, res => {
            if (res.data.Result) {
                Toaster.success("Simulation token deleted successfully.")
                getTableData()
            }
        }))
        setShowPopup(false)

    }
    const closePopUp = () => {
        setShowPopup(false)
    }
    const requestedByFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell !== null ? cell : '-'
    }

    const conditionFormatter = (props) => {

        // const cell = props?.valueFormatted ? props.valueFormatted : props?.value;

        const status = props.node.data.Status;

        if (status === DRAFT) {
            return `Y`;
        }
        else if (status === APPROVED) {
            return `R`
        } else {
            return `U`
        }

    }

    const renderVendor = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (cell !== null && cell !== '-') ? `${cell}(${row.VendorCode})` : '-'
    }

    const onRowSelect = (row, isSelected, e) => {

        let arr = []
        let tempArrDepartmentId = []
        let tempArrIsFinalLevelButtonShow = []
        let tempArrIsPushedButtonShow = []
        var selectedRows = gridApi.getSelectedRows();
        let tempArrReason = []
        let tempArrTechnology = []
        let tempArrSimulationTechnologyHead = []

        selectedRows.map(item => {
            arr.push(item?.DisplayStatus)
            tempArrDepartmentId.push(item.DepartmentId)
            tempArrIsFinalLevelButtonShow.push(item.IsFinalLevelButtonShow)
            tempArrIsPushedButtonShow.push(item.IsPushedButtonShow)
            tempArrReason.push(item.ReasonId)
            tempArrTechnology.push(item.TechnologyName)
            tempArrSimulationTechnologyHead.push(item.SimulationTechnologyHead)
            return null
        })

        if (!allEqual(arr)) {
            Toaster.warning('Status should be same for sending multiple costing for approval')
            gridApi.deselectAll()
        } else if (!allEqual(tempArrDepartmentId)) {
            Toaster.warning('Department should be same for sending multiple costing for approval')
            gridApi.deselectAll()
        } else if (!allEqual(tempArrIsFinalLevelButtonShow)) {
            Toaster.warning('Level should be same for sending multiple costing for approval')
            gridApi.deselectAll()
        }
        // ********** IF WE DO MULTI SELECT FOR PUSH THENUNCOMMENT THIS ONLY ************
        // else if (!allEqual(tempArrIsPushedButtonShow)) {
        //     Toaster.warning('Please choose costing for same push')
        //     gridApi.deselectAll()
        // }
        // ********** UNCOMMENT THIS IN MINDA ONLY ********** */
        else if (!allEqual(tempArrReason)) {
            Toaster.warning('Please choose costing which have same reason')
            gridApi.deselectAll()
        }
        else if (!allEqual(tempArrSimulationTechnologyHead)) {
            Toaster.warning('Master should be same for sending multiple costing for approval')
            gridApi.deselectAll()
        } else if (!allEqual(tempArrTechnology)) {
            Toaster.warning('Technology should be same for sending multiple costing for approval')
            gridApi.deselectAll()
        } else {
            setReasonId(selectedRows[0]?.ReasonId)
        }

        setIsPendingForApproval(arr.includes("Pending For Approval") ? true : false)

        if (JSON.stringify(selectedRows) === JSON.stringify(selectedIds)) return false
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
    const isRowSelectable = (rowNode) => {
        if (rowNode.data.Status === APPROVED || rowNode.data.Status === REJECTED || rowNode.data.Status === WAITING_FOR_APPROVAL || rowNode.data.Status === PUSHED || rowNode.data.Status === POUPDATED || rowNode.data.Status === ERROR || rowNode.data.Status === LINKED) {
            return false;
        } else {
            return true
        }
        // return rowNode.data ? !selectedIds.includes(rowNode.data.OperationId) : false;
    }

    const sendForApproval = () => {
        if (selectedRowData.length === 0) {
            Toaster.warning('Please select atleast one approval to send for approval.')
            return false
        }
        setSimulationDetail({ DepartmentId: selectedRowData[0].DepartmentId })
        let obj = {
            DepartmentId: selectedRowData[0].Status === DRAFT ? EMPTY_GUID : selectedRowData[0]?.DepartmentId,
            UserId: loggedInUserId(),
            TechnologyId: selectedRowData[0].SimulationTechnologyId,
            Mode: 'simulation'
        }

        dispatch(checkFinalUser(obj, res => {
            if (res && res.data && res.data.Result) {
                if (selectedRowData[0].Status === DRAFT) {
                    setApproveDrawer(res.data.Data.IsFinalApprover ? false : true)
                    if (res.data.Data.IsFinalApprover) {
                        Toaster.warning("Final level aprrover can not send draft token for aprroval")
                        gridApi.deselectAll()
                    }
                }
                else {
                    setShowFinalLevelButton(res.data.Data.IsFinalApprover)
                    setApproveDrawer(true)
                }
            }
        }))
    }

    const closeDrawer = (e = '', type) => {
        gridApi.deselectAll()
        setApproveDrawer(false)
        if (type !== 'cancel') {
            getTableData()
        }
        setSelectedRowData([])
    }

    if (redirectCostingSimulation === true) {
        // HERE FIRST IT WILL GO TO SIMULATION.JS COMPONENT FROM THERE IT WILL GO TO COSTING SIMULATION OR OTHER COSTINGSIMULATION.JS PAGE
        return <Redirect
            to={{
                pathname: "/simulation",
                state: {
                    isFromApprovalListing: true,
                    approvalProcessId: approvalData.approvalProcessId,
                    master: approvalData.SimulationTechnologyId,
                    statusForLinkedToken: statusForLinkedToken
                }

            }}
        />
    }

    if (showApprovalSumary === true) {
        return <Redirect
            to={{
                pathname: "/simulation-approval-summary",
                state: {
                    approvalNumber: approvalData.approvalNumber,
                    approvalId: approvalData.approvalProcessId,
                    SimulationTechnologyId: approvalData.SimulationTechnologyId
                }
            }}
        />
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
        headerCheckboxSelectionFilteredOnly: true,
        headerCheckboxSelection: isFirstColumn,
        checkboxSelection: isFirstColumn
    };

    const onGridReady = (params) => {
        setGridApi(params.api)
        setGridColumnApi(params.columnApi)
        params.api.paginationGoToPage(0);

        //if resolution greater than 1920 table listing fit to 100%
        window.screen.width > 1920 && params.api.sizeColumnsToFit()
        //if resolution greater than 1920 table listing fit to 100%

    };

    const onPageSizeChanged = (newPageSize) => {
        gridApi.paginationSetPageSize(Number(newPageSize));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const resetState = debounce(() => {
        getTableData()
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);

    }, 500)

    const frameworkComponents = {
        // totalValueRenderer: this.buttonFormatter,
        // effectiveDateRenderer: this.effectiveDateFormatter,
        // costingHeadRenderer: this.costingHeadFormatter,
        linkableFormatter: linkableFormatter,
        renderVendor: renderVendor,
        requestedByFormatter: requestedByFormatter,
        requestedOnFormatter: requestedOnFormatter,
        statusFormatter: statusFormatter,
        buttonFormatter: buttonFormatter,
        // customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
        reasonFormatter: reasonFormatter,
        conditionFormatter: conditionFormatter,
        hyphenFormatter: hyphenFormatter
    };

    return (
        <Fragment>
            {
                !showApprovalSumary &&
                <div className={`${!isSmApprovalListing && 'container-fluid'} approval-listing-page`} id='history-go-to-top'>
                    < div className={`ag-grid-react`}>
                        <form onSubmit={handleSubmit(() => { })} noValidate>
                            {isLoader && <LoaderCustom customClass={"simulation-history-loader"} />}
                            <ScrollToTop pointProp={"history-go-to-top"} />
                            <Row className="pt-4">


                                <Col md="2" lg="2" className="search-user-block mb-3">
                                    <div className="d-flex justify-content-end bd-highlight w100">
                                        <button type="button" className="user-btn  mr5" title="Reset Grid" onClick={() => resetState()}>
                                            <div className="refresh mr-0"></div>
                                        </button>
                                        <button
                                            class="user-btn approval-btn"
                                            onClick={sendForApproval}
                                            // disabled={selectedRowData && selectedRowData.length === 0 ? true : disableApproveButton ? true : false}
                                            title="Send For Approval"
                                            disabled={(isDashboard ? (simualtionApprovalList && simualtionApprovalList.length === 0) : (simualtionApprovalListDraft && simualtionApprovalListDraft.length === 0)) ? true : false}
                                        >
                                            <div className="send-for-approval"></div>
                                        </button>
                                    </div>
                                </Col>

                            </Row>
                        </form>

                        <div className={`ag-grid-wrapper height-width-wrapper min-height-auto ${isDashboard ? simualtionApprovalList && simualtionApprovalList?.length <= 0 ? "overlay-contain" : "" : simualtionApprovalListDraft && simualtionApprovalListDraft?.length <= 0 ? "overlay-contain" : ""}`}>
                            <div className="ag-grid-header">
                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                            </div>
                            <div
                                className="ag-theme-material"
                            >
                                <AgGridReact
                                    style={{ height: '100%', width: '100%', }}
                                    defaultColDef={defaultColDef}
                                    floatingFilter={true}
                                    domLayout='autoHeight'
                                    // columnDefs={c}
                                    rowData={isDashboard ? simualtionApprovalList : simualtionApprovalListDraft}
                                    // columnDefs={colRow}
                                    pagination={true}
                                    paginationPageSize={defaultPageSize}
                                    onGridReady={onGridReady}
                                    gridOptions={gridOptions}
                                    noRowsOverlayComponent={'customNoRowsOverlay'}
                                    noRowsOverlayComponentParams={{
                                        title: EMPTY_DATA,
                                    }}
                                    frameworkComponents={frameworkComponents}
                                    rowSelection={'multiple'}
                                    onSelectionChanged={onRowSelect}
                                    isRowSelectable={isRowSelectable}
                                >

                                    <AgGridColumn width={120} field="ApprovalNumber" cellRenderer='linkableFormatter' headerName="Token No." cellClass="token-no-grid"></AgGridColumn>
                                    {isSmApprovalListing && <AgGridColumn field="Status" headerClass="justify-content-center" cellClass="text-center" headerName='Status' cellRenderer='statusFormatter'></AgGridColumn>}
                                    <AgGridColumn width={141} field="CostingHead" headerName="Costing Head" cellRenderer={'hyphenFormatter'}></AgGridColumn>
                                    {/* THIS FEILD WILL ALWAYS COME BEFORE */}
                                    {getConfigurationKey().IsProvisionalSimulation && <AgGridColumn width={145} field="SimulationType" headerName='Simulation Type' ></AgGridColumn>}
                                    {getConfigurationKey().IsProvisionalSimulation && <AgGridColumn width={145} field="ProvisionalStatus" headerName='Amendment Status' ></AgGridColumn>}
                                    {getConfigurationKey().IsProvisionalSimulation && <AgGridColumn width={145} field="LinkingTokenNumber" headerName='Linking Token No' ></AgGridColumn>}

                                    <AgGridColumn width={141} field="SimulationTechnologyHead" headerName="Simulation Head"></AgGridColumn>
                                    <AgGridColumn width={130} field="TechnologyName" headerName="Technology"></AgGridColumn>
                                    <AgGridColumn width={200} field="VendorName" headerName="Vendor" cellRenderer='renderVendor'></AgGridColumn>
                                    <AgGridColumn width={170} field="ImpactCosting" headerName="Impacted Costing" ></AgGridColumn>
                                    <AgGridColumn width={154} field="ImpactParts" headerName="Impacted Parts"></AgGridColumn>
                                    <AgGridColumn width={170} field="Reason" headerName="Reason" cellRenderer='reasonFormatter'></AgGridColumn>
                                    <AgGridColumn width={140} field="SimulatedByName" headerName='Initiated By' cellRenderer='requestedByFormatter'></AgGridColumn>
                                    <AgGridColumn width={140} field="SimulatedOn" headerName='Simulated On' cellRenderer='requestedOnFormatter'></AgGridColumn>
                                    <AgGridColumn width={142} field="LastApprovedBy" headerName='Last Approval' cellRenderer='requestedByFormatter'></AgGridColumn>
                                    <AgGridColumn width={145} field="RequestedOn" headerName='Requested On' cellRenderer='requestedOnFormatter'></AgGridColumn>

                                    {!isSmApprovalListing && <AgGridColumn pinned="right" field="Status" headerClass="justify-content-center" cellClass="text-center" headerName='Status' cellRenderer='statusFormatter'></AgGridColumn>}
                                    <AgGridColumn width={115} field="SimulationId" headerName='Actions' type="rightAligned" floatingFilter={false} cellRenderer='buttonFormatter'></AgGridColumn>

                                </AgGridReact>
                                {<PaginationWrapper gridApi={gridApi} setPage={onPageSizeChanged} />}
                                <div className="text-right pb-3">
                                    <WarningMessage message="It may take up to 5 minutes for the status to be updated." />
                                </div>
                                {approveDrawer &&
                                    <ApproveRejectDrawer
                                        isOpen={approveDrawer}
                                        anchor={'right'}
                                        approvalData={[]}
                                        type={isPendingForApproval ? 'Approve' : 'Sender'}
                                        // simulationDetail={}
                                        selectedRowData={selectedRowData}
                                        // costingArr={costingArr}
                                        // master={selectedMasterForSimulation ? selectedMasterForSimulation.value : this.state.master}
                                        closeDrawer={closeDrawer}
                                        isSimulation={true}
                                        isSimulationApprovalListing={true}
                                        simulationDetail={simulationDetail}
                                        IsFinalLevel={showFinalLevelButtons}
                                    />
                                }
                            </div>
                        </div>
                    </div>

                </div>
                // :
                // <SimulationApprovalSummary
                //     approvalNumber={approvalData.approvalNumber}
                //     approvalId={approvalData.approvalProcessId}
                // /> //TODO list
            }
            {
                showPopup && <PopupMsgWrapper isOpen={showPopup} closePopUp={closePopUp} confirmPopup={onPopupConfirm} message={`${MESSAGES.DELETE_SIMULATION_DRAFT_TOKEN}`} />
            }
        </Fragment>
    )
}

export default SimulationApprovalListing;