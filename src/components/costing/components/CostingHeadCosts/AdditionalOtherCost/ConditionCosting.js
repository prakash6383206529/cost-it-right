import React, { Fragment, useEffect, useState } from 'react'
import { Row, Col, Table } from 'reactstrap'
import NoContentFound from '../../../../common/NoContentFound'
import { EMPTY_DATA } from '../../../../../config/constants'
import { checkForDecimalAndNull, checkForNull, getConfigurationKey } from '../../../../../helper'
import { useSelector } from 'react-redux'
import { reactLocalStorage } from 'reactjs-localstorage'

function ConditionCosting(props) {
    const { isFromImport, currency, isFromMaster, PlantCurrency, isSimulation = false } = props
    const [totalCostBase, setTotalCostBase] = useState(0)

    const [totalCostCurrency, setTotalCostCurrency] = useState(0)

    const editDeleteData = (indexValue, operation) => {
        props.editData(indexValue, operation, totalCostCurrency)
    }
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)

    useEffect(() => {
        const sum = props?.tableData?.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj?.ConditionCostPerQuantityConversion), 0);

        setTotalCostBase(checkForDecimalAndNull(sum, initialConfiguration.NoOfDecimalForPrice))

        const sumCurrency = props?.tableData?.reduce((acc, obj) => checkForNull(acc) + checkForNull(obj?.ConditionCostPerQuantity), 0);

        setTotalCostCurrency(checkForDecimalAndNull(sumCurrency, initialConfiguration.NoOfDecimalForPrice))
    }, [props?.tableData])

    return (
        <Fragment>
            <Row>
                <Col md={props.hideAction ? 12 : 12}>
                    <Table className="table cr-brdr-main mb-0 forging-cal-table" size="sm">
                        <tbody>
                            <tr className='thead'>
                                <th>{`Condition`}</th>
                                {<th>{`Type`}</th>}
                                {<th>{`Percentage (%)`}</th>}
                                {<th>{`Applicability`}</th>}
                                {<th>{`Applicability Cost`}</th>}
                                {<th>{`Quantity`}</th>}
                                {<th style={{ minWidth: '100px' }}>{`Cost (${isFromImport ? currency?.label : PlantCurrency ?? initialConfiguration?.BaseCurrency})`}</th>}
                                {<th>{`Cost/Pc (${isFromImport ? currency?.label : PlantCurrency ?? initialConfiguration?.BaseCurrency})`}</th>}
                                {!props.hideAction && <th className='text-right'>{`Action`}</th>}

                            </tr>
                            {props?.tableData &&
                                props?.tableData.map((item, index) => {
                                    return (
                                        <Fragment>
                                            <tr key={index}>
                                                <td>{item.condition ? item.condition : item.Description} </td>
                                                {<td>{item.ConditionType}</td>}
                                                {<td>{item.Percentage ? checkForDecimalAndNull(item?.Percentage, getConfigurationKey().NoOfDecimalForPrice) : '-'}</td>}
                                                {<td>{item.Applicability}</td>}
                                                {<td>{item.ApplicabilityCost ? checkForDecimalAndNull(item?.ApplicabilityCost, getConfigurationKey().NoOfDecimalForPrice) : '-'}</td>}
                                                {<td>{item.ConditionQuantity ? checkForDecimalAndNull(item?.ConditionQuantity, getConfigurationKey().NoOfDecimalForPrice) : '-'}</td>}
                                                {<td>{checkForDecimalAndNull(isSimulation ? item?.ConditionCost : item?.ConditionCostConversion, getConfigurationKey().NoOfDecimalForPrice)}</td>}
                                                {<td>{item?.ConditionCostPerQuantity ? checkForDecimalAndNull(item?.ConditionCostPerQuantity, getConfigurationKey().NoOfDecimalForPrice) : '-'}</td>}
                                                {!props.hideAction && <td><div className='text-right'>
                                                    <button title='Edit' className="Edit mr-1" type={'button'} onClick={() => editDeleteData(index, 'edit')} disabled={props.ViewMode} />
                                                    <button title='Delete' className="Delete mr-1" type={'button'} onClick={() => editDeleteData(index, 'delete')} disabled={props.ViewMode} />
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
                            {<tr className='table-footer'>

                                <td colSpan={isFromImport ? 6 : 5} className="text-right font-weight-600 fw-bold">{`${isFromMaster ? 'Total Cost:' : `Total Cost (${isFromImport ? currency?.label : PlantCurrency ?? initialConfiguration?.BaseCurrency}):`}`}</td>
                                <td colSpan={isFromImport ? 1 : 3}><div className='d-flex justify-content-between'>{checkForDecimalAndNull(totalCostCurrency, initialConfiguration.NoOfDecimalForPrice)} {isFromMaster ? `(${isFromImport ? currency?.label : PlantCurrency ?? initialConfiguration?.BaseCurrency})` : ''}</div></td>
                                {
                                    isFromImport && <>
                                        <td colSpan={4} className="text-left"> {checkForDecimalAndNull(totalCostBase, initialConfiguration.NoOfDecimalForPrice)} ({reactLocalStorage.getObject("baseCurrency")})</td>
                                    </>
                                }
                            </tr>}
                        </tbody>
                    </Table>
                </Col>
            </Row>
        </Fragment >
    )
}
export default React.memo(ConditionCosting)
