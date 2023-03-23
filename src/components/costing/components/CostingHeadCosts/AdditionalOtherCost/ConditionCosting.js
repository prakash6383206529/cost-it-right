import React, { Fragment, useEffect, useState } from 'react'
import { Row, Col, Table } from 'reactstrap'
import NoContentFound from '../../../../common/NoContentFound'
import { EMPTY_DATA } from '../../../../../config/constants'
import { checkForDecimalAndNull, getConfigurationKey } from '../../../../../helper'
import { useSelector } from 'react-redux'

function ConditionCosting(props) {
    const [totalCost, setTotalCost] = useState(0)
    const editDeleteData = (indexValue, operation) => {
        props.editData(indexValue, operation)
    }
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)

    useEffect(() => {
        const sum = props?.tableData.reduce((acc, obj) => Number(acc) + Number(obj.ConditionCost), 0);
        setTotalCost(checkForDecimalAndNull(sum, initialConfiguration.NoOfDecimalForPrice))
    }, [props?.tableData])

    return (
        <Fragment>
            <Row>
                <Col md={props.hideAction ? 12 : 12}>
                    <Table className="table mb-0 forging-cal-table" size="sm">
                        <thead>
                            <tr>
                                <th>{`Condition`}</th>
                                {<th>{`Type`}</th>}
                                {<th>{`Percentage`}</th>}
                                {<th>{`Fixed`}</th>}
                                {<th>{`Cost`}</th>}
                                {!props.hideAction && <th className='text-right'>{`Action`}</th>}

                            </tr>
                        </thead>
                        <tbody>
                            {props?.tableData &&
                                props?.tableData.map((item, index) => {
                                    return (
                                        <Fragment>
                                            <tr key={index}>
                                                <td>{item.CostingConditionNumber} </td>
                                                {<td>{item.ConditionType}</td>}
                                                {<td>{item.Percentage ? checkForDecimalAndNull(item?.Percentage) : '-'}</td>}
                                                {<td>{item.Percentage ? '-' : checkForDecimalAndNull(item?.ConditionCost, getConfigurationKey().NoOfDecimalForInputOutput)}</td>}
                                                {<td>{checkForDecimalAndNull(item?.ConditionCost, getConfigurationKey().NoOfDecimalForInputOutput)}</td>}
                                                {!props.hideAction && <td><div className='text-right'><button title='Edit' className="Edit mr-1" type={'button'} onClick={() => editDeleteData(index, 'edit')} />
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
                        <tfoot>
                            <tr style={{ backgroundColor: '#E0E9F5' }}>
                                <td colSpan={"4"} className="text-right">{'Total Cost:'}</td>
                                <td colSpan={"2"}>{totalCost}</td>
                            </tr>
                        </tfoot>
                    </Table>
                </Col>
            </Row>
        </Fragment >
    )
}
export default React.memo(ConditionCosting)