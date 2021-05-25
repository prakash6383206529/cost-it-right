import React, { useState, useEffect, Fragment } from 'react'
import moment from 'moment'
import { Row, Col } from 'reactstrap'
import { SearchableSelectHookForm } from '../layout/HookFormInputs'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import { useDispatch, useSelector } from 'react-redux'
import { loggedInUserId, userDetails } from '../../helper/auth'
import { Badge } from 'reactstrap'
import NoContentFound from '../common/NoContentFound'
import { CONSTANT } from '../../helper/AllConastant'
import { GridTotalFormate } from '../common/TableGridFunctions'
import { checkForDecimalAndNull } from '../../helper'
import { getReportListing } from '../report/actions/ReportListing'

function ReportListing(props) {

    const loggedUser = loggedInUserId()

    const reportListing = useSelector(state => state.report.reportListing)

    const [shown, setshown] = useState(false)

    const dispatch = useDispatch()

    const { register, handleSubmit, control, setValue, errors, getValues } = useForm({
        mode: 'onBlur',
        reValidateMode: 'onChange',
    })

    const partSelectList = useSelector((state) => state.costing.partSelectList)
    const statusSelectList = useSelector((state) => state.approval.costingStatusList)
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const approvalList = useSelector(state => state.approval.approvalList)
    const userList = useSelector(state => state.auth.userList)

    const simulatedOnFormatter = (cell, row, enumObject, rowIndex) => {
        //return cell != null ? moment(cell).format('DD/MM/YYYY hh:mm A') : '';
        return cell != null ? cell : '';
    }

    const approvedOnFormatter = (cell, row, enumObject, rowIndex) => {
        //   return cell != null ? moment(cell).format('DD/MM/YYYY hh:mm A') : '';
        return cell != null ? cell : '';
    }

    const linkableFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <Fragment>
                <div
                    onClick={() => { }} className={'link'}>{cell}
                </div>
            </Fragment>
        )
    }



    const buttonFormatter = (cell, row, enumObject, rowIndex) => {
        return (
            <>
                <button className="View" type={'button'} onClick={() => { }} />
            </>
        )
    }

    const statusFormatter = (cell, row, enumObject, rowIndex) => {
        return <div className={cell}>{row.DisplayCostingStatus}</div>
    }

    const renderVendorName = () => {
        return <>Vendor Name</>
    }
    const renderImpactCosting = () => {
        return <>Impact Costing </>
    }
    const renderImpactParts = () => {
        return <>Impact Parts </>
    }
    const renderSimulatedBy = () => {
        return <>Simulated By </>
    }
    const renderSimulatedOn = () => {
        return <>Simulated On </>
    }
    const renderApprovedOn = () => {
        return <>Approved On </>
    }
    const renderApprovedBy = () => {
        return <>Approved By </>
    }

    /**
   * @method getTableData
   * @description getting approval list table
   */

    const getTableData = (
        partNo = '00000000-0000-0000-0000-000000000000',
        createdBy = '00000000-0000-0000-0000-000000000000',
        requestedBy = '00000000-0000-0000-0000-000000000000',
        status = '00000000-0000-0000-0000-000000000000',
    ) => {
        let filterData = {
            loggedUser: loggedUser,
            logged_in_user_level_id: userDetails().LoggedInLevelId,
            partNo: partNo,
            createdBy: createdBy,
            requestedBy: requestedBy,
            status: status,
        }

        dispatch(
            getReportListing(filterData, (res) => { }),
        )
    }


    useEffect(() => {
        dispatch(getReportListing(() => { }))
    }, [])

    const renderPaginationShowsTotal = (start, to, total) => {
        return <GridTotalFormate start={start} to={to} total={total} />
    }

    const options = {
        clearSearch: true,
        noDataText: <NoContentFound title={CONSTANT.EMPTY_DATA} />,
        paginationShowsTotal: renderPaginationShowsTotal(),
        prePage: <span className="prev-page-pg"></span>, // Previous page button text
        nextPage: <span className="next-page-pg"></span>, // Next page button text
        firstPage: <span className="first-page-pg"></span>, // First page button text
        lastPage: <span className="last-page-pg"></span>,
        //exportCSVText: 'Download Excel',
        //onExportToCSV: this.onExportToCSV,
        //paginationShowsTotal: true,
        //paginationShowsTotal: this.renderPaginationShowsTotal,

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

    /**
  * @method onSubmit
  * @description filtering data on Apply button
  */
    const onSubmit = (values) => {
        const tempPartNo = getValues('partNo') ? getValues('partNo').value : '00000000-0000-0000-0000-000000000000'
        const tempcreatedBy = getValues('createdBy') ? getValues('createdBy').value : '00000000-0000-0000-0000-000000000000'
        const tempRequestedBy = getValues('requestedBy') ? getValues('requestedBy').value : '00000000-0000-0000-0000-000000000000'
        const tempStatus = getValues('status') ? getValues('status').value : '00000000-0000-0000-0000-000000000000'
        // const type_of_costing = 
        getTableData(tempPartNo, tempcreatedBy, tempRequestedBy, tempStatus)
    }


    return (
        <div className="container-fluid approval-listing-page">
            <form onSubmit={handleSubmit(onSubmit)} noValidate>

                <h1 className="mb-0">Report</h1>


                <Row className="pt-4 blue-before">
                    {shown &&
                        <Col lg="10" md="12" className="filter-block">
                            <div className="d-inline-flex justify-content-start align-items-top w100">
                                <div className="flex-fills">
                                    <h5>{`Filter By:`}</h5>
                                </div>

                                <div className="flex-fill filled-small hide-label">
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
                                </div>
                                <div className="flex-fill filled-small hide-label">
                                    <SearchableSelectHookForm
                                        label={''}
                                        name={'createdBy'}
                                        placeholder={'Initiated By'}
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

                    <Col md="6" lg="6" className="search-user-block mb-3">
                        <div className="d-flex justify-content-end bd-highlight w100">
                            <div>
                                {(shown) ? (
                                    <button type="button" className="user-btn mr5 filter-btn-top" onClick={() => setshown(!shown)}>
                                        <img src={require("../../assests/images/times.png")} alt="cancel-icon.jpg" /></button>
                                ) : (
                                    <button type="button" className="user-btn mr5" onClick={() => setshown(!shown)}>Show Filter</button>
                                )}

                            </div>
                        </div>

                    </Col>
                </Row>
            </form>

            <BootstrapTable
                data={reportListing}
                striped={false}
                hover={false}
                bordered={false}
                options={options}
                search
                // exportCSV
                //ignoreSinglePage
                //ref={'table'}
                trClassName={'userlisting-row'}
                tableHeaderClass="my-custom-header"
                pagination
            >
                <TableHeaderColumn dataField="TokenNumber" isKey={true} columnTitle={true} dataAlign="left" dataSort={true} dataFormat={linkableFormatter} >{`Token No.`}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingHead" width={110} columnTitle={true} dataAlign="left" dataSort={false}>{'Costing Head'}</TableHeaderColumn>
                <TableHeaderColumn dataField="Technology" width={100} columnTitle={true} dataAlign="left" dataSort={false}>{'Technology'}</TableHeaderColumn>
                <TableHeaderColumn dataField="VendorName" width={110} columnTitle={true} dataAlign="left" dataSort={false}>{renderVendorName()}</TableHeaderColumn>
                <TableHeaderColumn dataField="ImpactCosting" width={120} columnTitle={true} dataAlign="left" dataSort={false}>{renderImpactCosting()}</TableHeaderColumn>
                <TableHeaderColumn dataField="ImpactParts" width={110} columnTitle={true} dataAlign="left" dataSort={false}>{renderImpactParts()}</TableHeaderColumn>
                <TableHeaderColumn dataField="SimulatedBy" width={110} columnTitle={true} dataAlign="left" dataSort={false} >{renderSimulatedBy()}</TableHeaderColumn>
                <TableHeaderColumn dataField="SimulatedOn" width={160} columnTitle={true} dataAlign="left" dataSort={false} dataFormat={simulatedOnFormatter} >{renderSimulatedOn()} </TableHeaderColumn>
                <TableHeaderColumn dataField="ApprovedBy" width={110} columnTitle={true} dataAlign="left" dataSort={false}>{renderApprovedBy()} </TableHeaderColumn>
                <TableHeaderColumn dataField="ApprovedOn" width={160} columnTitle={true} dataAlign="left" dataSort={false} dataFormat={approvedOnFormatter}> {renderApprovedOn()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={180} dataAlign="center" dataFormat={statusFormatter} export={false} >  Status  </TableHeaderColumn>
                {/* <TableHeaderColumn dataAlign="right" searchable={false} width={80} dataField="SimulationId" export={false} isKey={true} dataFormat={buttonFormatter}>Actions</TableHeaderColumn> */}
            </BootstrapTable>
        </div>
    );
}

export default ReportListing;