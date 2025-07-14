import React, { Fragment, useContext } from 'react'
import { Row, Col, Table } from 'reactstrap'
import NoContentFound from '../../../../common/NoContentFound'
import { EMPTY_DATA } from '../../../../../config/constants'
import { checkForDecimalAndNull, checkForNull, getConfigurationKey } from '../../../../../helper'
import { useState } from 'react'
import { useSelector } from 'react-redux'
import { useEffect } from 'react'
import { ViewCostingContext } from '../../CostingDetails'
import { reactLocalStorage } from 'reactjs-localstorage'

function NpvCost(props) {
    const islineInvestmentDrawer = props?.drawerType === "LineInvestmentCost"
    const [totalCost, setTotalCost] = useState(0)
    const { currencySource } = useSelector((state) => state?.costing);

    const editDeleteData = (indexValue, operation) => {
        props.editData(indexValue, operation)
    }
    const initialConfiguration = useSelector((state) => state.auth.initialConfiguration)
    const CostingViewMode = useContext(ViewCostingContext);

    useEffect(() => {
        const sum = props?.tableData
            .filter(obj => obj.NpvType !== 'Line Investment')
            .reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.NpvCost), 0);
        const totalLineInvestmentCost = props?.tableData
            .filter(obj => obj.NpvType === 'Line Investment')
            .reduce((acc, obj) => checkForNull(acc) + checkForNull(obj.NpvCost), 0);
        const finalCalculation = islineInvestmentDrawer ? totalLineInvestmentCost : sum
        setTotalCost(checkForDecimalAndNull(finalCalculation, initialConfiguration?.NoOfDecimalForPrice))
    }, [props?.tableData])


    const filteredRows = (props?.tableData || []).filter(item =>
        islineInvestmentDrawer ? item?.NpvType === 'Line Investment' : item?.NpvType !== 'Line Investment'
    )

    return (
        <Fragment>
            <Row>
                <Col md={props.hideAction ? 12 : 12}>
                    <Table className="table cr-brdr-main mb-4 forging-cal-table" size="sm">
                        <tbody>
                            <tr className='thead'>
                                {islineInvestmentDrawer && <th>{`Description`}</th>}
                                {islineInvestmentDrawer && <th>{`Investment Cost`}</th>}
                                {!islineInvestmentDrawer && <th>{`Type of Investment`}</th>}
                                {islineInvestmentDrawer && <th>{`Upfront (%)`}</th>}
                                {<th>{`${islineInvestmentDrawer ? "Amortization" : "Percentage"} (%)`}</th>}
                                {<th>{`${islineInvestmentDrawer ? "Quantity/ Amortization Volume" : "Quantity"}`}</th>}
                                {islineInvestmentDrawer && <th>{`Upfront  Cost`}</th>}
                                {islineInvestmentDrawer && <th>{`Amortization Cost`}</th>}
                                {<th>{`${islineInvestmentDrawer ? "Investement Cost/Pc" : "Total"}`}</th>}
                                {!props.hideAction && <th className='text-right'>{`Action`}</th>}
                            </tr>
                            {props?.tableData &&
                                props?.tableData.map((item, index) => {
                                    if ((islineInvestmentDrawer && item?.NpvType !== 'Line Investment') ||
                                        (!islineInvestmentDrawer && item?.NpvType === 'Line Investment')) {
                                        return null;
                                    }
                                    return (
                                        <Fragment>
                                            <tr key={index}>
                                                {islineInvestmentDrawer && <td>{item?.Description || "-"}</td>}
                                                {islineInvestmentDrawer && <td>{checkForDecimalAndNull(item?.InvestmentCost, getConfigurationKey()?.NoOfDecimalForPrice)}</td>}
                                                {!islineInvestmentDrawer && <td>{item?.NpvType || "-"} </td>}
                                                {islineInvestmentDrawer && <td>{item?.UpfrontPercentage || "-"}</td>}
                                                {<td>{checkForDecimalAndNull(item?.NpvPercentage, getConfigurationKey()?.NoOfDecimalForPrice)}</td>}
                                                {<td>{checkForDecimalAndNull(item?.NpvQuantity, getConfigurationKey()?.NoOfDecimalForPrice)}</td>}
                                                {islineInvestmentDrawer && <td>{checkForDecimalAndNull(item?.UpfrontCost, getConfigurationKey()?.NoOfDecimalForPrice)}</td>}
                                                {islineInvestmentDrawer && <td>{checkForDecimalAndNull(item?.AmortizationCost, getConfigurationKey()?.NoOfDecimalForPrice)}</td>}
                                                {<td>{checkForDecimalAndNull(item?.NpvCost, getConfigurationKey()?.NoOfDecimalForPrice)}</td>}
                                                {!props.hideAction && <td><div className='text-right'><button title='Edit' className="Edit mr-1" type={'button'} onClick={() => editDeleteData(index, 'edit')} disabled={CostingViewMode} />
                                                    <button title='Delete' className="Delete mr-1" type={'button'} onClick={() => editDeleteData(index, 'delete')} disabled={CostingViewMode} />
                                                </div>
                                                </td>}
                                            </tr>
                                        </Fragment>
                                    )
                                })}

                            {filteredRows && filteredRows.length === 0 && (
                                <tr>
                                    <td colspan="15">
                                        <NoContentFound title={EMPTY_DATA} />
                                    </td>
                                </tr>
                            )}

                            <tr className='table-footer'>
                                <td colSpan={`${islineInvestmentDrawer ? "7" : "3"}`} className="text-right">{`${islineInvestmentDrawer ? "Investment Line cost" : "Total NPV Cost"} (${currencySource?.label}) :`}</td>
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