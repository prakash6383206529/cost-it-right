import React, { useState, useEffect, Fragment } from 'react'
import { Row, Col } from 'reactstrap'
import { SearchableSelectHookForm } from '../../layout/HookFormInputs'
import { useForm, Controller, useWatch } from 'react-hook-form'
import { BootstrapTable, TableHeaderColumn } from 'react-bootstrap-table'
import { useDispatch, useSelector } from 'react-redux'
import { loggedInUserId } from '../../../helper/auth'
import { Badge } from 'reactstrap'
import NoContentFound from '../../common/NoContentFound'
import { CONSTANT } from '../../../helper/AllConastant'
import { GridTotalFormate } from '../../common/TableGridFunctions'
import moment from 'moment'
import { checkForDecimalAndNull } from '../../../helper'
import { getSimulationHistory } from '../actions/History'



function SimulationHistory(props) {

    const simulationHistory = useSelector(state => state.history.simulationHistory)

    const dispatch = useDispatch()

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

    useEffect(() => {
        dispatch(getSimulationHistory(() => { }))
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
    return (
        <div className="container-fluid simulation-history-page">
            <Row>
                <Col sm="12" >
                    <h1 className="mb-4">{`Simulation History`}</h1>
                </Col>
            </Row>
            <BootstrapTable
                data={simulationHistory}
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
                <TableHeaderColumn dataField="TokenNumber" columnTitle={true} dataAlign="left" dataSort={true} dataFormat={linkableFormatter} >{`Token No.`}</TableHeaderColumn>
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
                <TableHeaderColumn dataAlign="right" searchable={false} width={80} dataField="SimulationId" export={false} isKey={true} dataFormat={buttonFormatter}>Actions</TableHeaderColumn>
            </BootstrapTable>
        </div>
    );
}

export default SimulationHistory;