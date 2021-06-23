import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { SearchableSelectHookForm } from '../../layout/HookFormInputs'
import { useForm, Controller } from 'react-hook-form'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import { useDispatch, useSelector } from 'react-redux'
import { getApprovalList, getSelectedCostingList } from '../../../components/costing/actions/Approval'
import { loggedInUserId, userDetails } from '../../../helper/auth'
import ApprovalSummary from '../../costing/components/approval/ApprovalSummary'
import { getAllPartSelectList, getCostingStatusSelectList, } from '../../../components/costing/actions/Costing'
import NoContentFound from '../../common/NoContentFound'
import { CONSTANT } from '../../../helper/AllConastant'
import moment from 'moment'
import { checkForDecimalAndNull } from '../../../helper'
import { getAllUserAPI } from '../../../actions/auth/AuthActions'
import { EMPTY_GUID, PENDING } from '../../../config/constants'
import { toastr } from 'react-redux-toastr'
import { getSimulationApprovalList } from '../actions/Simulation'
import SimulationApprovalSummary from './SimulationApprovalSummary'

function SimulationApprovalListing(props) {
    const loggedUser = loggedInUserId()
    const [shown, setshown] = useState(true)

    const [tableData, setTableData] = useState([])
    const [partNoDropdown, setPartNoDropdown] = useState([])
    const [createdByDropdown, setCreatedByDropdown] = useState([])
    const [requestedByDropdown, setRequestedByDropdown] = useState([])
    const [statusDropdown, setStatusDropdown] = useState([])
    const [approvalData, setApprovalData] = useState('')
    const [selectedRowData, setSelectedRowData] = useState([]);
    const [approveDrawer, setApproveDrawer] = useState(false)
    const [selectedIds, setSelectedIds] = useState('')
    const [reasonId, setReasonId] = useState('')
    const [showApprovalSumary, setShowApprovalSummary] = useState(false)
    const [showFinalLevelButtons, setShowFinalLevelButton] = useState(false)
    const dispatch = useDispatch()

    const partSelectList = useSelector((state) => state.costing.partSelectList)
    const statusSelectList = useSelector((state) => state.approval.costingStatusList)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const { simualtionApprovalList } = useSelector(state => state.simulation)
    const userList = useSelector(state => state.auth.userList)

    const { register, handleSubmit, control, setValue, errors, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })
    useEffect(() => {
        getTableData()
        dispatch(getAllPartSelectList(() => { }))
        dispatch(getSelectedCostingList(() => { }))
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
    const linkableFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <Fragment>
                <div
                    onClick={() => viewDetails(row.ApprovalNumber, row.ApprovalProcessId)}
                    className={'link'}
                >
                    {cell}
                </div>
            </Fragment>
        )
    }

    const createdOnFormatter = (cell, row, enumObject, rowIndex) => {
        return cell != null ? moment(cell).format('DD/MM/YYYY') : '';
    }

    const priceFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                {/* <img className={`${row.OldPOPrice > row.NetPOPrice ? 'arrow-ico mr-1 arrow-green' : 'mr-1 arrow-ico arrow-red'}`} src={row.OldPOPrice > row.NetPOPrice ? require("../../../../assests/images/arrow-down.svg") : require("../../../../assests/images/arrow-up.svg")} alt="arro-up" /> */}
                {cell != null ? checkForDecimalAndNull(cell, initialConfiguration && initialConfiguration.NoOfDecimalForPrice) : ''}
            </>
        )
    }

    const oldpriceFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                {/* <img className={`${row.OldPOPrice > row.NetPOPrice ? 'arrow-ico mr-1 arrow-green' : 'mr-1 arrow-ico arrow-red'}`} src={row.OldPOPrice > row.NetPOPrice ? require("../../../../assests/images/arrow-down.svg") : require("../../../../assests/images/arrow-up.svg")} alt="arro-up" /> */}
                {cell != null ? checkForDecimalAndNull(cell, initialConfiguration && initialConfiguration.NoOfDecimalForPrice) : ''}
            </>
        )
    }

    const requestedOnFormatter = (cell, row, enumObject, rowIndex) => {
        return cell != null ? moment(cell).format('DD/MM/YYYY') : '';
    }

    const statusFormatter = (cell, row, enumObject, rowIndex) => {
        return <div className={cell} >{row.DisplayStatus}</div>
    }

    const buttonFormatter = (cell, row, enumObject, rowIndex) => {
        return <button className="View" type={'button'} onClick={() => viewDetails(row.ApprovalNumber, row.ApprovalProcessId)} />
    }

    const renderPlant = (cell, row, enumObject, rowIndex) => {
        return (cell !== null && cell !== '-') ? `${cell}(${row.PlantCode})` : '-'
    }

    const renderVendor = (cell, row, enumObject, rowIndex) => {
        return (cell !== null && cell !== '-') ? `${cell}(${row.VendorCode})` : '-'
    }

    const viewDetails = (approvalNumber, approvalProcessId) => {
        setApprovalData({ approvalProcessId: approvalProcessId, approvalNumber: approvalNumber })
        setShowApprovalSummary(true)
        // return (
        //     <ApprovalSummary
        //         approvalNumber={approvalNumber ? approvalNumber : '2345438'}
        //         approvalProcessId={approvalProcessId ? approvalProcessId : '1'}
        //     />
        // )
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
        if (isSelected) {
            let tempArr = [...selectedRowData, row]
            setSelectedRowData(tempArr)
        } else {
            const CostingId = row.CostingId;
            let tempArr = selectedRowData && selectedRowData.filter(el => el.CostingId !== CostingId)
            setSelectedRowData(tempArr)
        }
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

    return (
        <Fragment>
            {
                !showApprovalSumary ?
                    <div className="container-fluid approval-listing-page">
                        <form onSubmit={handleSubmit(onSubmit)} noValidate>

                            <h1 className="mb-0">Simulation History</h1>


                            <Row className="pt-4 blue-before">
                                {shown &&
                                    <Col lg="10" md="12" className="filter-block">
                                        <div className="d-inline-flex justify-content-start align-items-top w100">
                                            <div className="flex-fills">
                                                <h5>{`Filter By:`}</h5>
                                            </div>

                                            {/* <div className="flex-fill filled-small hide-label">
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
                                            <div className="flex-fill filled-small hide-label">
                                                <SearchableSelectHookForm
                                                    label={''}
                                                    name={'createdBy'}
                                                    placeholder={'Simulated By'}
                                                    Controller={Controller}
                                                    control={control}
                                                    rules={{ required: false }}
                                                    register={register}
                                                    // defaultValue={plant.length !== 0 ? plant : ''}
                                                    options={renderDropdownListing('users')}
                                                    mandatory={false}
                                                    handleChange={() => { }}
                                                    errors={errors.createdBy}
                                                />
                                            </div>
                                            <div className="flex-fill filled-small hide-label">
                                                <SearchableSelectHookForm
                                                    label={''}
                                                    name={'requestedBy'}
                                                    placeholder={'Requested By'}
                                                    Controller={Controller}
                                                    control={control}
                                                    rules={{ required: false }}
                                                    register={register}
                                                    // defaultValue={plant.length !== 0 ? plant : ''}
                                                    options={renderDropdownListing('users')}
                                                    mandatory={false}
                                                    handleChange={() => { }}
                                                    errors={errors.requestedBy}
                                                />
                                            </div>
                                            <div className="flex-fill filled-small hide-label">
                                                <SearchableSelectHookForm
                                                    label={''}
                                                    name={'status'}
                                                    placeholder={'Status'}
                                                    Controller={Controller}
                                                    control={control}
                                                    rules={{ required: false }}
                                                    register={register}
                                                    // defaultValue={plant.length !== 0 ? plant : ''}
                                                    options={renderDropdownListing('Status')}
                                                    mandatory={false}
                                                    handleChange={() => { }}
                                                    errors={errors.status}
                                                />
                                            </div>


                                            <div className="flex-fill filled-small hide-label">
                                                <button
                                                    type="button"
                                                    //disabled={pristine || submitting}
                                                    onClick={resetHandler}
                                                    className="reset mr10"
                                                >
                                                    {'Reset'}
                                                </button>
                                                <button
                                                    type="button"
                                                    //disabled={pristine || submitting}
                                                    onClick={onSubmit}
                                                    className="apply mr5"
                                                >
                                                    {'Apply'}
                                                </button>
                                            </div>
                                        </div>
                                    </Col>
                                }
                                {/* <Col md="4" className="search-user-block">
            <div className="d-flex justify-content-end bd-highlight">
              <div>
                
            
                
              </div>
            </div>
          </Col> */}
                            </Row>
                        </form>

                        <BootstrapTable
                            data={simualtionApprovalList}
                            striped={false}
                            hover={false}
                            bordered={false}
                            options={options}
                            search
                            // selectRow={selectRowProp}
                            // exportCSV
                            //ignoreSinglePage
                            //ref={'table'}
                            trClassName={'userlisting-row'}
                            tableHeaderClass="my-custom-header"
                            pagination
                        >
                            <TableHeaderColumn dataField="ApprovalNumber" isKey={true} width={100} columnTitle={false} dataAlign="left" dataSort={true} dataFormat={linkableFormatter} >{`Token No.`}</TableHeaderColumn>
                            <TableHeaderColumn dataField="CostingHead" width={90} columnTitle={true} dataAlign="left" dataSort={false}>{'Costing Head'}</TableHeaderColumn>
                            <TableHeaderColumn dataField="NumberOfCosting" width={90} columnTitle={true} dataAlign="left" dataSort={false}>{'No Of Costing'}</TableHeaderColumn>
                            <TableHeaderColumn dataField="TechnologyName" width={90} columnTitle={true} dataSort={false}>{'Technology'}</TableHeaderColumn>
                            <TableHeaderColumn dataField="VendorName" width={90} columnTitle={true} dataAlign="left" dataSort={false}>{'Vendor'}</TableHeaderColumn>
                            <TableHeaderColumn dataField="ImpactCosting" width={120} columnTitle={true} dataAlign="left" dataSort={false}>{'Impact Costing '}</TableHeaderColumn>
                            <TableHeaderColumn dataField="ImpactParts" width={110} columnTitle={true} dataAlign="left" dataSort={false}>{'Impact Parts'}</TableHeaderColumn>
                            <TableHeaderColumn dataField="SimulatedByName" width={90} columnTitle={true} dataAlign="left" dataSort={false}>{'Simulated By'}</TableHeaderColumn>
                            <TableHeaderColumn dataField="SimulatedOn" width={100} columnTitle={true} dataAlign="left" dataSort={false} dataFormat={requestedOnFormatter}>{'Simulated On'}</TableHeaderColumn>
                            <TableHeaderColumn dataField="RequestedBy" width={100} columnTitle={true} dataAlign="left" dataSort={false} >{'Requested By'} </TableHeaderColumn>
                            <TableHeaderColumn dataField="RequestedOn" width={100} columnTitle={true} dataAlign="left" dataSort={false} dataFormat={requestedOnFormatter}> {'Requested On '}</TableHeaderColumn>
                            <TableHeaderColumn dataField="Status" width={140} dataAlign="center" dataFormat={statusFormatter} export={false} >  Status  </TableHeaderColumn>
                            <TableHeaderColumn dataAlign="right" searchable={false} width={80} dataField="SimulationId" export={false} dataFormat={buttonFormatter}>Actions</TableHeaderColumn>
                        </BootstrapTable>
                    </div>
                    :
                    <SimulationApprovalSummary
                        approvalNumber={approvalData.approvalNumber}
                        approvalId={approvalData.approvalProcessId}
                    /> //TODO list
            }
        </Fragment>
    )
}

export default SimulationApprovalListing;