import React, { Fragment } from 'react'
import { Row, Col, Table } from 'reactstrap'
import NoContentFound from '../../../../common/NoContentFound'
import { EMPTY_DATA } from '../../../../../config/constants'
import { checkForDecimalAndNull, getConfigurationKey } from '../../../../../helper'

function NpvCost(props) {
    const editDeleteData = (indexValue, operation) => {
        props.editData(indexValue, operation)
    }

    return (
        <Fragment>
            < Row className="mx-0">
                <Col md="6">
                    <Table className="table mb-0 forging-cal-table" size="sm">
                        <thead>
                            <tr>
                                <th>{`Type of NPV`}</th>
                                {<th>{`%`}</th>}
                                {<th>{`Quantity`}</th>}
                                {<th>{`Total`}</th>}
                                {!props.hideAction && <th>{`Action`}</th>}

                            </tr>
                        </thead>
                        <tbody>
                            {props?.tableData &&
                                props?.tableData.map((item, index) => {
                                    return (
                                        <Fragment>
                                            <tr key={index}>
                                                <td>{item.NpvType} </td>
                                                {<td>{checkForDecimalAndNull(item.NpvPercentage, getConfigurationKey().NoOfDecimalForInputOutput)}</td>}
                                                {<td>{checkForDecimalAndNull(item?.Quantity)}</td>}
                                                {<td>{checkForDecimalAndNull(item?.Cost, getConfigurationKey().NoOfDecimalForInputOutput)}</td>}
                                                {!props.hideAction && <td><div><button title='Edit' className="Edit mr-1" type={'button'} onClick={() => editDeleteData(index, 'edit')} />
                                                    <button title='Delete' className="Delete mr-1" type={'button'} onClick={() => editDeleteData(index, 'delete')} />
                                                </div>
                                                </td>}
                                            </tr>
                                        </Fragment>
                                    )
                                })}
                            {props?.tableData && props?.tableData.length === 0 && (
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
        </Fragment >
    )
}
export default React.memo(NpvCost)