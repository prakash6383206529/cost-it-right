import React, { Fragment } from 'react'
import { Row, Col, Table } from 'reactstrap'
import NoContentFound from '../../../../common/NoContentFound'
import { EMPTY_DATA } from '../../../../../config/constants'
import { checkForDecimalAndNull, getConfigurationKey } from '../../../../../helper'
import { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useState } from 'react'

function LabourCost(props) {
    const [totalCost, setTotalCost] = useState(0)

    const editDeleteData = (indexValue, operation) => {
        props.editData(indexValue, operation)
    }

    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const { currencySource } = useSelector(state => state.costing)

    useEffect(() => {
        const sum = props?.tableData?.reduce((acc, obj) => Number(acc) + Number(obj.LabourCost), 0);
        setTotalCost(checkForDecimalAndNull(sum, initialConfiguration?.NoOfDecimalForPrice))
    }, [props?.tableData])

    return (
        <Fragment>
            <Row>
                <Col md={props.hideAction ? 12 : 12}>
                    <Table className="table mb-0 cr-brdr-main forging-cal-table" size="sm">
                        <thead>
                            <tr>
                                <th>{`Labour Type`}</th>
                                <th>{`Description`}</th>
                                <th>{`No. of Labour`}</th>
                                <th>{`Absenteeism %`}</th>
                                <th>{`No. of Days`}</th>
                                <th>{`Rate per Person/Month`}</th>
                                <th>{`Rate per Person/Annum`}</th>
                                <th>{`Rate per Person/Shift`}</th>
                                {<th>{`Working Time`}</th>}
                                {<th>{`Efficiency`}</th>}
                                {<th>{`Cycle Time`}</th>}
                                {<th>{`Labour Cost ${currencySource?.label}/Pcs`}</th>}
                                {!props.hideAction && <th className='text-right'>{`Action`}</th>}

                            </tr>
                        </thead>
                        <tbody>
                            {props?.tableData &&
                                props?.tableData.map((item, index) => {

                                    return (
                                        <Fragment>
                                            <tr key={index}>
                                                <td>{item?.LabourType} </td>
                                                <td>{item?.Description || '-'} </td>
                                                <td> {checkForDecimalAndNull(item?.NumberOfLabour, getConfigurationKey().NoOfDecimalForInputOutput)}</td>
                                                <td> {checkForDecimalAndNull(item.AbsentismPercentage, getConfigurationKey().NoOfDecimalForInputOutput)}</td>
                                                <td>{checkForDecimalAndNull(item?.NoOfDays, getConfigurationKey().NoOfDecimalForInputOutput)} </td>
                                                <td>{checkForDecimalAndNull(item?.LabourRatePerMonth, getConfigurationKey().NoOfDecimalForPrice)} </td>
                                                <td>{checkForDecimalAndNull(item?.LabourRate, getConfigurationKey().NoOfDecimalForPrice)} </td>
                                                <td>{checkForDecimalAndNull(item?.LabourRatePerShift, getConfigurationKey().NoOfDecimalForPrice)} </td>
                                                {<td>{checkForDecimalAndNull(item?.WorkingTime, getConfigurationKey().NoOfDecimalForInputOutput)}</td>}
                                                {<td>{checkForDecimalAndNull(item?.Efficiency, getConfigurationKey().NoOfDecimalForInputOutput)}</td>}
                                                {<td>{checkForDecimalAndNull(item?.CycleTime, getConfigurationKey().NoOfDecimalForInputOutput)}</td>}
                                                {<td>{checkForDecimalAndNull(item?.LabourCost, getConfigurationKey().NoOfDecimalForPrice)}</td>}
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
                            <tr className='table-footer'>
                                <td colSpan={"11"} className="text-right">{'Total Cost:'}</td>
                                <td colSpan={"2"}>{checkForDecimalAndNull(totalCost, getConfigurationKey().NoOfDecimalForPrice)}</td>
                            </tr>
                        </tfoot>
                    </Table>
                </Col>
            </Row>
        </Fragment >
    )
}
export default React.memo(LabourCost)