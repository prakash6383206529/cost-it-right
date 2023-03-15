import React, { Fragment, useState, useEffect } from 'react'
import { Row, Col, Table } from 'reactstrap'
import NoContentFound from '../../../../common/NoContentFound'
import { EMPTY_DATA } from '../../../../../config/constants'
import { checkForDecimalAndNull, getConfigurationKey } from '../../../../../helper'


function NpvCost(props) {
    const [tableData, setTableData] = useState([])
    return (
        <Fragment>
            <Row className="mx-0">
                <Col md="10">
                    <div className="left-border mt-3">
                        {'NPV Cost:'}
                    </div>
                </Col>
                <Col md="6">
                    <Table className="table mb-0 forging-cal-table" size="sm">
                        <thead>
                            <tr>
                                <th>{`Type of NPV`}</th>
                                {<th>{`%`}</th>}
                                {<th>{`Quantity`}</th>}
                                {<th>{`Total`}</th>}


                            </tr>
                        </thead>
                        <tbody>
                            {tableData &&
                                tableData.map((item, index) => {
                                    return (
                                        <Fragment>
                                            <tr key={index}>
                                                <td>{1} </td>
                                                {<td>{ }</td>}
                                                {<td>{checkForDecimalAndNull(item.FlashThickness, getConfigurationKey().NoOfDecimalForInputOutput) !== null ? checkForDecimalAndNull(item.FlashThickness, getConfigurationKey().NoOfDecimalForInputOutput) : '-'}</td>}
                                                {<td>{checkForDecimalAndNull(item.FlashWidth, getConfigurationKey().NoOfDecimalForInputOutput) !== null ? checkForDecimalAndNull(item.FlashWidth, getConfigurationKey().NoOfDecimalForInputOutput) : '-'}</td>}

                                            </tr>
                                        </Fragment>
                                    )
                                })}
                            {tableData && tableData.length === 0 && (
                                <tr>
                                    <td colspan="15">
                                        <NoContentFound title={EMPTY_DATA} />
                                    </td>
                                </tr>
                            )}
                        </tbody>

                    </Table>

                </Col>
            </Row>
        </Fragment>
    )
}
export default React.memo(NpvCost)