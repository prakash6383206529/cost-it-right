import React, { Fragment } from 'react'
import { Row, Col, Table } from 'reactstrap'
import NoContentFound from '../../../../common/NoContentFound'
import { EMPTY_DATA } from '../../../../../config/constants'
import { checkForDecimalAndNull, getConfigurationKey } from '../../../../../helper'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'

function NpvCost(props) {
    const [totalCost, setTotalCost] = useState(0)

    const editDeleteData = (indexValue, operation) => {
        props.editData(indexValue, operation)
    }
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)

    useEffect(() => {
        const sum = props?.tableData.reduce((acc, obj) => Number(acc) + Number(obj.NpvCost), 0);
        setTotalCost(checkForDecimalAndNull(sum, initialConfiguration?.NoOfDecimalForPrice))
    }, [props?.tableData])

    return (
        <Fragment>
            <Row>
                <Col md={props.hideAction ? 12 : 12}>
                    <Table className="table cr-brdr-main mb-4 forging-cal-table" size="sm">
                        <tbody>
                            <tr className='thead'>
                                <th>{`Type of Investment`}</th>
                                {<th>{`Percentage (%)`}</th>}
                                {<th>{`Quantity`}</th>}
                                {<th>{`Total`}</th>}
                                {!props.hideAction && <th className='text-right'>{`Action`}</th>}

                            </tr>
                            {props?.tableData &&
                                props?.tableData.map((item, index) => {
                                    return (
                                        <Fragment>
                                            <tr key={index}>
                                                <td>{item.NpvType} </td>
                                                {<td>{checkForDecimalAndNull(item.NpvPercentage, getConfigurationKey().NoOfDecimalForPrice)}</td>}
                                                {<td>{checkForDecimalAndNull(item?.NpvQuantity)}</td>}
                                                {<td>{checkForDecimalAndNull(item?.NpvCost, getConfigurationKey().NoOfDecimalForPrice)}</td>}
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
                            <tr className='table-footer'>
                                <td colSpan={"3"} className="text-right">{'Total Cost:'}</td>
                                <td colSpan={"2"}>{totalCost}</td>
                            </tr>
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Fragment >
    )
}
export default React.memo(NpvCost)