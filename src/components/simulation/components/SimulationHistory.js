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
                <button className="View mr5" type={'button'} onClick={() => { }} />
            </>
        )
    }

    const statusFormatter = (cell, row, enumObject, rowIndex) => {
        return <div className={cell}>{row.DisplayCostingStatus}</div>
    }

    const renderVendorName = () => {
        return <>Vendor <br />Name</>
    }
    const renderImpactCosting = () => {
        return <>Impact <br />Costing </>
    }
    const renderImpactParts = () => {
        return <>Impact <br />Parts </>
    }
    const renderSimulatedBy = () => {
        return <>Simulated <br />By </>
    }
    const renderSimulatedOn = () => {
        return <>Simulated <br />On </>
    }
    const renderApprovedOn = () => {
        return <>Approved <br />On </>
    }
    const renderApprovedBy = () => {
        return <>Approved <br />By </>
    }

    useEffect(() => {
        dispatch(getSimulationHistory(() => { }))
    }, [])

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
    return (
        <div>
            <Row>
                <Col sm="4">
                    <h1>{`Simulation History`}</h1>
                </Col>
            </Row>
            <BootstrapTable
                data={simulationHistory}
                striped={false}
                hover={false}
                bordered={false}
                options={options}
                // exportCSV
                //ignoreSinglePage
                //ref={'table'}
                trClassName={'userlisting-row'}
                tableHeaderClass="my-custom-header"
                pagination
            >
                <TableHeaderColumn dataField="TokenNumber" columnTitle={true} dataAlign="left" dataSort={true} dataFormat={linkableFormatter} >{`Token No.`}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingHead" width={140} columnTitle={true} dataAlign="left" dataSort={false}>{'Costing Head'}</TableHeaderColumn>
                <TableHeaderColumn dataField="Technology" width={100} columnTitle={true} dataAlign="left" dataSort={false}>{'Technology'}</TableHeaderColumn>
                <TableHeaderColumn dataField="VendorName" columnTitle={true} dataAlign="left" dataSort={false}>{renderVendorName()}</TableHeaderColumn>
                <TableHeaderColumn dataField="ImpactCosting" columnTitle={true} dataAlign="left" dataSort={false}>{renderImpactCosting()}</TableHeaderColumn>
                <TableHeaderColumn dataField="ImpactParts" columnTitle={true} dataAlign="left" dataSort={false}>{renderImpactParts()}</TableHeaderColumn>
                <TableHeaderColumn dataField="SimulatedBy" columnTitle={true} dataAlign="left" dataSort={false} >{renderSimulatedBy()}</TableHeaderColumn>
                <TableHeaderColumn dataField="SimulatedOn" columnTitle={true} dataAlign="left" dataSort={false} dataFormat={simulatedOnFormatter} >{renderSimulatedOn()} </TableHeaderColumn>
                <TableHeaderColumn dataField="ApprovedBy" columnTitle={true} dataAlign="left" dataSort={false}>{renderApprovedOn()} </TableHeaderColumn>
                <TableHeaderColumn dataField="ApprovedOn" columnTitle={true} dataAlign="left" dataSort={false} dataFormat={approvedOnFormatter}> {renderApprovedBy()}</TableHeaderColumn>
                <TableHeaderColumn dataField="CostingStatus" width={200} dataAlign="center" dataFormat={statusFormatter} export={false} >  Status  </TableHeaderColumn>
                <TableHeaderColumn dataAlign="right" searchable={false} width={100} dataField="SimulationId" export={false} isKey={true} dataFormat={buttonFormatter}>Actions</TableHeaderColumn>
            </BootstrapTable>
        </div>
    );
}

export default SimulationHistory;