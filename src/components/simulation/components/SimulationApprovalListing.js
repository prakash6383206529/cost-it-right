import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { SearchableSelectHookForm } from '../../layout/HookFormInputs'
import { useForm, Controller } from 'react-hook-form'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import { useDispatch, useSelector } from 'react-redux'
import { loggedInUserId, userDetails } from '../../../helper/auth'
import { getAllPartSelectList, } from '../../../components/costing/actions/Costing'
import NoContentFound from '../../common/NoContentFound'
import { CONSTANT } from '../../../helper/AllConastant'
import moment from 'moment'
import { checkForDecimalAndNull } from '../../../helper'
import { getAllUserAPI } from '../../../actions/auth/AuthActions'
import { DRAFT, EMPTY_GUID } from '../../../config/constants'
import { toastr } from 'react-redux-toastr'
import { getSimulationApprovalList, setMasterForSimulation, getSimulationStatus, deleteDraftSimulation } from '../actions/Simulation'
import { Redirect, } from 'react-router-dom';
import { AgGridColumn, AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-material.css';
import LoaderCustom from '../../common/LoaderCustom'
import { MESSAGES } from '../../../config/message'
import ConfirmComponent from '../../../helper/ConfirmComponent'
const gridOptions = {};

function SimulationApprovalListing(props) {
    const loggedUser = loggedInUserId()
    const [shown, setshown] = useState(false)

    const [approvalData, setApprovalData] = useState('')
    const [selectedRowData, setSelectedRowData] = useState([]);
    const [approveDrawer, setApproveDrawer] = useState(false)
    const [selectedIds, setSelectedIds] = useState('')
    const [reasonId, setReasonId] = useState('')
    const [showApprovalSumary, setShowApprovalSummary] = useState(false)
    const [redirectCostingSimulation, setRedirectCostingSimulation] = useState(false)
    const [gridApi, setGridApi] = useState(null);
    const [gridColumnApi, setGridColumnApi] = useState(null);
    const [rowData, setRowData] = useState(null);

    const dispatch = useDispatch()

    const partSelectList = useSelector((state) => state.costing.partSelectList)
    const statusSelectList = useSelector((state) => state.approval.costingStatusList)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const { simualtionApprovalList } = useSelector(state => state.simulation)
    const userList = useSelector(state => state.auth.userList)

    const isSmApprovalListing = props.isSmApprovalListing;

    const { register, handleSubmit, control, setValue, formState: { errors }, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })
    useEffect(() => {
        getTableData()
        dispatch(getAllPartSelectList(() => { }))
        dispatch(getSimulationStatus(() => { }))
        dispatch(getAllUserAPI(() => { }))

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
            // partNo: partNo,
            // createdBy: createdBy,
        }

        dispatch(getSimulationApprovalList(filterData, (res) => { }))
    }

    const renderDropdownListing = (label) => {
        const tempDropdownList = []

        if (label === 'PartList') {
            partSelectList &&
                partSelectList.map((item) => {
                    if (item.Value === '0') return false
                    tempDropdownList.push({ label: item.Text, value: item.Value })
                    return null
                })

            return tempDropdownList
        }

        if (label === 'Status') {
            statusSelectList &&
                statusSelectList.map((item) => {
                    if (item.Value === '0') return false
                    tempDropdownList.push({ label: item.Text, value: item.Value })
                    return null
                })
            return tempDropdownList
        }
        if (label === 'users') {
            userList && userList.map((item) => {
                if (item.Value === '0') return false
                tempDropdownList.push({ label: item.Text, value: item.Value })
                return null
            })
            return tempDropdownList
        }
    }

    /**
     * @method onSubmit
     * @description filtering data on Apply button
     */
    const onSubmit = (values) => {
        const tempPartNo = getValues('partNo') ? getValues('partNo').value : '00000000-0000-0000-0000-000000000000'
        const tempcreatedBy = getValues('createdBy') ? getValues('createdBy').value : '00000000-0000-0000-0000-000000000000'
        const tempRequestedBy = getValues('requestedBy') ? getValues('requestedBy').value : '00000000-0000-0000-0000-000000000000'
        const tempStatus = getValues('status') ? getValues('status').value : 0
        // const type_of_costing = 
        getTableData(tempPartNo, tempcreatedBy, tempRequestedBy, tempStatus)
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

    const createdOnFormatter = (props) => {
        const cellValue = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cellValue != null ? moment(cellValue).format('DD/MM/YYYY') : '-';
    }

    const priceFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (
            <>
                {/* <img className={`${row.OldPOPrice > row.NetPOPrice ? 'arrow-ico mr-1 arrow-green' : 'mr-1 arrow-ico arrow-red'}`} src={row.OldPOPrice > row.NetPOPrice ? require("../../../../assests/images/arrow-down.svg") : require("../../../../assests/images/arrow-up.svg")} alt="arro-up" /> */}
                {cell != null ? checkForDecimalAndNull(cell, initialConfiguration && initialConfiguration.NoOfDecimalForPrice) : '-'}
            </>
        )
    }

    const oldpriceFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return (
            <>
                {/* <img className={`${row.OldPOPrice > row.NetPOPrice ? 'arrow-ico mr-1 arrow-green' : 'mr-1 arrow-ico arrow-red'}`} src={row.OldPOPrice > row.NetPOPrice ? require("../../../../assests/images/arrow-down.svg") : require("../../../../assests/images/arrow-up.svg")} alt="arro-up" /> */}
                {cell != null ? checkForDecimalAndNull(cell, initialConfiguration && initialConfiguration.NoOfDecimalForPrice) : '-'}
            </>
        )
    }

    const requestedOnFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell != null ? moment(cell).format('DD/MM/YYYY') : '-';
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
                <button className="View" type={'button'} onClick={() => viewDetails(row)} />
                {row.Status === DRAFT && <button className="Delete ml-1" type={'button'} onClick={() => deleteItem(row)} />}
            </>
        )
    }

    const viewDetails = (rowObj) => {
        setApprovalData({ approvalProcessId: rowObj.ApprovalProcessId, approvalNumber: rowObj.ApprovalNumber, SimulationTechnologyHead: rowObj.SimulationTechnologyHead, SimulationTechnologyId: rowObj.SimulationTechnologyId })
        if (rowObj.DisplayStatus === 'Draft') {
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


        const toastrConfirmOptions = {
            onOk: () => {
                dispatch(deleteDraftSimulation(data, res => {
                    if (res.data.Result) {
                        toastr.success("Simulation token deleted successfully.")
                        getTableData()
                    }
                }))
            },
            onCancel: () => { },
            component: () => <ConfirmComponent />,
        };
        return toastr.confirm(`${MESSAGES.DELETE_SIMULATION_DRAFT_TOKEN}`, toastrConfirmOptions);

    }

    const requestedByFormatter = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        return cell !== null ? cell : '-'
    }

    const renderVendor = (props) => {
        const cell = props?.valueFormatted ? props.valueFormatted : props?.value;
        const row = props?.valueFormatted ? props.valueFormatted : props?.data;
        return (cell !== null && cell !== '-') ? `${cell}(${row.VendorCode})` : '-'
    }




    /**
     * @method resetHandler
     * @description Reseting all filter
     */
    const resetHandler = () => {
        setValue('partNo', '')
        setValue('createdBy', '')
        setValue('requestedBy', '')
        setValue('status', '')
        getTableData()
    }

    const onRowSelect = (row, isSelected, e) => {
        var selectedRows = gridApi.getSelectedRows();
        if (JSON.stringify(selectedRows) === JSON.stringify(selectedIds)) return false
        var selected = gridApi.getSelectedNodes()
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
        prePage: <span className="prev-page-pg"></span>, // Previous page button text
        nextPage: <span className="next-page-pg"></span>, // Next page button text
        firstPage: <span className="first-page-pg"></span>, // First page button text
        lastPage: <span className="last-page-pg"></span>,
        //exportCSVText: 'Download Excel',
        //onExportToCSV: this.onExportToCSV,
        //paginationShowsTotal: true,
        //paginationShowsTotal: this.renderPaginationShowsTotal,
    }

    const sendForApproval = () => {
        let count = 0
        let technologyCount = 0

        if (selectedRowData.length === 0) {
            toastr.warning('Please select atleast one approval to send for approval.')
            return false
        }

        selectedRowData.forEach((element, index, arr) => {
            if (index > 0) {
                if (element.ReasonId !== arr[index - 1].ReasonId) {
                    count = count + 1
                } else {
                    return false
                }
            } else {
                return false
            }
        })

        selectedRowData.forEach((element, index, arr) => {
            if (index > 0) {
                if (element.TechnologyId !== arr[index - 1].TechnologyId) {
                    technologyCount = technologyCount + 1
                } else {
                    return false
                }
            } else {
                return false
            }
        })

        if (technologyCount > 0) {
            return toastr.warning("Technology should be same for sending multiple costing for approval")
        }

        if (count > 0) {
            return toastr.warning("Reason should be same for sending multiple costing for approval")
        } else {
            setReasonId(selectedRowData[0].ReasonId)
        }

        setApproveDrawer(true)
    }

    const closeDrawer = (e = '') => {
        setApproveDrawer(false)
        getTableData()
        //setRejectDrawer(false)
    }

    if (redirectCostingSimulation === true) {

        // HERE FIRST IT WILL GO TO SIMULATION.JS COMPONENT FROM THERE IT WILL GO TO COSTING SIMULATION OR OTHER COSTINGSIMULATION.JS PAGE
        return <Redirect
            to={{
                pathname: "/simulation",
                state: {
                    isFromApprovalListing: true,
                    approvalProcessId: approvalData.approvalProcessId,
                    master: approvalData.SimulationTechnologyId
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

    const defaultColDef = {
        resizable: true,
        filter: true,
        sortable: true,
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
        var value = document.getElementById('page-size').value;
        gridApi.paginationSetPageSize(Number(value));
    };

    const onFilterTextBoxChanged = (e) => {
        gridApi.setQuickFilter(e.target.value);
    }

    const resetState = () => {
        gridOptions.columnApi.resetColumnState();
        gridOptions.api.setFilterModel(null);
    }

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
        customLoadingOverlay: LoaderCustom,
        customNoRowsOverlay: NoContentFound,
        reasonFormatter: reasonFormatter
    };


    return (
        <Fragment>
            {
                !showApprovalSumary &&
                <div className={`${!isSmApprovalListing && 'container-fluid'} approval-listing-page`}>
                    < div className={`ag-grid-react`}>
                        <form onSubmit={handleSubmit(onSubmit)} noValidate>
                            {!isSmApprovalListing && <h1 className="mb-0">Simulation History</h1>}
                            <Row className="pt-4 blue-before">


                                <Col md="2" lg="2" className="search-user-block mb-3">
                                    <div className="d-flex justify-content-end bd-highlight w100">

                                        <button type="button" className="user-btn" title="Reset Grid" onClick={() => resetState()}>
                                            <div className="refresh mr-0"></div>
                                        </button>
                                    </div>
                                </Col>

                            </Row>
                        </form>

                        <div className="ag-grid-wrapper" style={{ width: '100%', height: '100%' }}>
                            <div className="ag-grid-header">
                                <input type="text" className="form-control table-search" id="filter-text-box" placeholder="Search " onChange={(e) => onFilterTextBoxChanged(e)} />
                            </div>
                            <div
                                className="ag-theme-material"
                            >
                                <AgGridReact
                                    style={{ height: '100%', width: '100%' }}
                                    defaultColDef={defaultColDef}
                                    floatingFilter={true}
                                    domLayout='autoHeight'
                                    // columnDefs={c}
                                    rowData={simualtionApprovalList}
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
                                    <AgGridColumn width={120} field="ApprovalNumber" cellRenderer='linkableFormatter' headerName="Token No."></AgGridColumn>
                                    {isSmApprovalListing && <AgGridColumn field="Status" headerClass="justify-content-center" cellClass="text-center" headerName='Status' cellRenderer='statusFormatter'></AgGridColumn>}
                                    <AgGridColumn width={141} field="CostingHead" headerName="Costing Head"></AgGridColumn>
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
                                    <AgGridColumn width={105} field="SimulationId" headerName='Actions' type="rightAligned" floatingFilter={false} cellRenderer='buttonFormatter'></AgGridColumn>

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
                </div>
                // :
                // <SimulationApprovalSummary
                //     approvalNumber={approvalData.approvalNumber}
                //     approvalId={approvalData.approvalProcessId}
                // /> //TODO list
            }
        </Fragment>
    )
}

export default SimulationApprovalListing;